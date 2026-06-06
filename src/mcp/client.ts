import { spawn, type ChildProcessWithoutNullStreams } from "node:child_process";
import { once } from "node:events";
import type { JsonRpcMessage, ProfileConfig, ToolsListResult } from "../types.js";

export type McpClientOptions = {
  timeoutMs?: number;
};

export class McpClient {
  private child: ChildProcessWithoutNullStreams;
  private nextId = 1;
  private buffer = "";
  private pending = new Map<
    number,
    { resolve: (value: JsonRpcMessage) => void; reject: (error: Error) => void }
  >();
  private timeoutMs: number;

  constructor(profile: ProfileConfig, opts: McpClientOptions = {}) {
    this.timeoutMs = opts.timeoutMs ?? Number(process.env.TOOLCAPSULE_TIMEOUT_MS || "45000");
    if (profile.transport.type === "remote") {
      this.child = spawn("npx", ["-y", "mcp-remote", profile.transport.url], {
        stdio: ["pipe", "pipe", "pipe"],
      });
    } else {
      this.child = spawn(profile.transport.command, profile.transport.args ?? [], {
        stdio: ["pipe", "pipe", "pipe"],
      });
    }
    this.child.stdout.setEncoding("utf8");
    this.child.stdout.on("data", (chunk: string) => this.onStdout(chunk));
    this.child.stderr.on("data", (chunk: Buffer) => process.stderr.write(chunk));
    this.child.on("exit", (code, signal) => {
      const error = new Error(`MCP process exited early (code=${code}, signal=${signal})`);
      for (const waiter of this.pending.values()) waiter.reject(error);
      this.pending.clear();
    });
  }

  private onStdout(chunk: string): void {
    this.buffer += chunk;
    let newlineIndex: number;
    while ((newlineIndex = this.buffer.indexOf("\n")) >= 0) {
      const line = this.buffer.slice(0, newlineIndex).trim();
      this.buffer = this.buffer.slice(newlineIndex + 1);
      if (!line) continue;
      let message: JsonRpcMessage;
      try {
        message = JSON.parse(line) as JsonRpcMessage;
      } catch {
        process.stderr.write(`${line}\n`);
        continue;
      }
      if (typeof message.id === "number") {
        const waiter = this.pending.get(message.id);
        if (waiter) {
          this.pending.delete(message.id);
          waiter.resolve(message);
        }
      }
    }
  }

  async init(): Promise<void> {
    await this.request("initialize", {
      protocolVersion: "2025-03-26",
      capabilities: {},
      clientInfo: { name: "toolcapsule", version: "0.1.0" },
    });
    this.notify("notifications/initialized", {});
  }

  async request(method: string, params?: unknown): Promise<unknown> {
    const id = this.nextId++;
    const responsePromise = new Promise<JsonRpcMessage>((resolve, reject) => {
      this.pending.set(id, { resolve, reject });
    });
    this.child.stdin.write(`${JSON.stringify({ jsonrpc: "2.0", id, method, params })}\n`);
    const response = await this.withTimeout(responsePromise, method);
    if (response.error) throw new Error(`${method} failed: ${JSON.stringify(response.error, null, 2)}`);
    return response.result;
  }

  notify(method: string, params?: unknown): void {
    this.child.stdin.write(`${JSON.stringify({ jsonrpc: "2.0", method, params })}\n`);
  }

  async listTools(): Promise<ToolsListResult> {
    return (await this.request("tools/list", {})) as ToolsListResult;
  }

  async callTool(name: string, args: unknown): Promise<unknown> {
    return await this.request("tools/call", { name, arguments: args });
  }

  async close(): Promise<void> {
    if (!this.child.killed) this.child.kill();
    if (this.child.exitCode === null) await Promise.race([once(this.child, "exit"), new Promise((resolve) => setTimeout(resolve, 500))]);
  }

  private async withTimeout<T>(promise: Promise<T>, label: string): Promise<T> {
    let timer: NodeJS.Timeout | undefined;
    const timeout = new Promise<never>((_, reject) => {
      timer = setTimeout(() => reject(new Error(`${label} timed out after ${this.timeoutMs}ms`)), this.timeoutMs);
    });
    try {
      return await Promise.race([promise, timeout]);
    } finally {
      if (timer) clearTimeout(timer);
    }
  }
}
