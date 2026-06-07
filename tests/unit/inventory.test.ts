import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, test } from "vitest";
import { disableNativeMcp, formatInventory, listMcpInventory } from "../../src/mcp/inventory.js";

const cwd = process.cwd();
const tempDir = join(cwd, ".tmp-inventory-test");
const homeDir = join(tempDir, "home");

async function resetTempDir(): Promise<void> {
  await rm(tempDir, { recursive: true, force: true });
  await mkdir(homeDir, { recursive: true });
}

describe("MCP inventory", () => {
  beforeEach(async () => {
    await resetTempDir();
    process.chdir(tempDir);
    process.env.TOOLCAPSULE_HOME = homeDir;
  });

  afterEach(async () => {
    process.chdir(cwd);
    delete process.env.TOOLCAPSULE_HOME;
    await rm(tempDir, { recursive: true, force: true });
  });

  test("lists native and ToolCapsule profiles", async () => {
    await writeFile(".mcp.json", JSON.stringify({ mcpServers: { docs: { type: "http", url: "https://example.com/mcp" } } }));
    await mkdir(join(homeDir, "profiles"), { recursive: true });
    await writeFile(join(homeDir, "profiles", "feishu.json"), JSON.stringify({ name: "feishu", kind: "linked", source: { tool: "claude", path: ".mcp.json", server: "docs" } }));

    const items = await listMcpInventory();

    expect(items).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ name: "docs", source: "claude", mode: "native" }),
        expect.objectContaining({ name: "feishu", source: "toolcapsule", mode: "linked" }),
      ]),
    );
    expect(formatInventory(items)).toContain("STATUS");
  });

  test("disables native MCP by moving it into disabled bucket", async () => {
    await writeFile(".mcp.json", JSON.stringify({ mcpServers: { docs: { type: "http", url: "https://example.com/mcp" } } }));

    await expect(disableNativeMcp("docs", { dryRun: false })).resolves.toContain("Backup:");

    const updated = JSON.parse(await readFile(".mcp.json", "utf8")) as {
      mcpServers: Record<string, unknown>;
      disabledMcpServers: Record<string, unknown>;
    };
    expect(updated.mcpServers.docs).toBeUndefined();
    expect(updated.disabledMcpServers.docs).toBeDefined();
  });
});
