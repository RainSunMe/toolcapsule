import { mkdir, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, test } from "vitest";
import { discoverMcpServers, selectImportedServers } from "../../src/mcp/importer.js";

const cwd = process.cwd();
const tempDir = join(cwd, ".tmp-importer-test");

async function resetTempDir(): Promise<void> {
  await rm(tempDir, { recursive: true, force: true });
  await mkdir(tempDir, { recursive: true });
}

describe("MCP config importer", () => {
  beforeEach(async () => {
    await resetTempDir();
    process.chdir(tempDir);
  });

  afterEach(async () => {
    process.chdir(cwd);
    await rm(tempDir, { recursive: true, force: true });
  });

  test("imports VS Code servers config", async () => {
    await mkdir(".vscode", { recursive: true });
    await writeFile(
      join(".vscode", "mcp.json"),
      JSON.stringify({
        servers: {
          GitHub: {
            type: "http",
            url: "https://api.githubcopilot.com/mcp",
            headers: { Authorization: "Bearer ${GITHUB_TOKEN}" },
          },
        },
      }),
    );

    const servers = await discoverMcpServers();
    expect(servers).toHaveLength(1);
    expect(servers[0]?.name).toBe("github");
    expect(servers[0]?.profile.transport).toMatchObject({
      type: "remote",
      url: "https://api.githubcopilot.com/mcp",
      headers: { Authorization: "Bearer ${GITHUB_TOKEN}" },
    });
  });

  test("imports OpenCode local command arrays", async () => {
    await writeFile(
      "opencode.json",
      JSON.stringify({
        mcp: {
          everything: {
            type: "local",
            command: ["npx", "-y", "@modelcontextprotocol/server-everything"],
            environment: { DEBUG: "1" },
          },
        },
      }),
    );

    const servers = await discoverMcpServers();
    expect(servers[0]?.profile.transport).toMatchObject({
      type: "stdio",
      command: "npx",
      args: ["-y", "@modelcontextprotocol/server-everything"],
      env: { DEBUG: "1" },
    });
  });

  test("requires disambiguation when multiple servers are found", async () => {
    await writeFile(
      ".mcp.json",
      JSON.stringify({
        mcpServers: {
          first: { type: "http", url: "https://first.example.com/mcp" },
          second: { type: "http", url: "https://second.example.com/mcp" },
        },
      }),
    );

    const servers = await discoverMcpServers();
    expect(selectImportedServers(servers)).toHaveLength(0);
    expect(selectImportedServers(servers, "second")).toHaveLength(1);
    expect(selectImportedServers(servers, undefined, true)).toHaveLength(2);
  });
});
