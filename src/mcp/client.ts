import type { Transport } from "@modelcontextprotocol/sdk/shared/transport.js";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport, type StdioServerParameters } from "@modelcontextprotocol/sdk/client/stdio.js";
import { StreamableHTTPClientTransport, type StreamableHTTPClientTransportOptions } from "@modelcontextprotocol/sdk/client/streamableHttp.js";
import type { McpTool, ProfileConfig, ToolsListResult } from "../types.js";

export type McpClientOptions = {
  timeoutMs?: number;
  debug?: boolean;
  clientVersion?: string;
};

export class McpClient {
  private client: Client;
  private transport: StreamableHTTPClientTransport | StdioClientTransport;
  private debug: boolean;

  constructor(profile: ProfileConfig, opts: McpClientOptions = {}) {
    this.debug = opts.debug ?? process.env.TOOLCAPSULE_DEBUG === "1";
    const version = opts.clientVersion ?? "0.0.0";

    this.client = new Client({ name: "toolcapsule", version }, { capabilities: {} });

    if (profile.transport.type === "remote") {
      const transportOpts: StreamableHTTPClientTransportOptions = {};
      if (profile.transport.headers) {
        transportOpts.requestInit = { headers: profile.transport.headers };
      }
      this.transport = new StreamableHTTPClientTransport(new URL(profile.transport.url), transportOpts);
    } else {
      const stdioParams: StdioServerParameters = {
        command: profile.transport.command,
        args: profile.transport.args ?? [],
      };
      if (profile.transport.env) stdioParams.env = profile.transport.env;
      if (profile.transport.cwd) stdioParams.cwd = profile.transport.cwd;
      this.transport = new StdioClientTransport(stdioParams);
    }
  }

  async init(): Promise<void> {
    await this.client.connect(this.transport as unknown as Transport);
    if (this.debug) {
      process.stderr.write("[toolcapsule] MCP client connected\n");
    }
  }

  async listTools(): Promise<ToolsListResult> {
    const result = await this.client.listTools();
    const tools = result.tools.map((t) => {
      const tool: McpTool = { name: t.name };
      if (t.description !== undefined) tool.description = t.description;
      if (t.inputSchema !== undefined) tool.inputSchema = t.inputSchema;
      return tool;
    });
    return { tools };
  }

  async callTool(name: string, args: unknown): Promise<unknown> {
    const result = await this.client.callTool({ name, arguments: args as Record<string, unknown> });
    return result;
  }

  async close(): Promise<void> {
    await this.client.close();
  }
}
