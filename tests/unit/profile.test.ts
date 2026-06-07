import { mkdir, rm, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { afterEach, beforeEach, describe, expect, test } from "vitest";
import { loadProfile } from "../../src/profile.js";

const cwd = process.cwd();
const tempDir = join(cwd, ".tmp-profile-test");
const homeDir = join(tempDir, "home");

async function resetTempDir(): Promise<void> {
  await rm(tempDir, { recursive: true, force: true });
  await mkdir(homeDir, { recursive: true });
}

async function writeProfile(path: string, url: string): Promise<void> {
  await mkdir(dirname(path), { recursive: true });
  await writeFile(
    path,
    JSON.stringify({
      name: "demo",
      transport: { type: "remote", url },
    }),
  );
}

describe("profile loading", () => {
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

  test("loads user-level profiles", async () => {
    await writeProfile(join(homeDir, "profiles", "demo.json"), "https://user.example.com/mcp");

    await expect(loadProfile("demo")).resolves.toMatchObject({
      name: "demo",
      transport: { type: "remote", url: "https://user.example.com/mcp" },
    });
  });

  test("prefers workspace profile over user profile", async () => {
    await writeProfile(join(homeDir, "profiles", "demo.json"), "https://user.example.com/mcp");
    await writeProfile(join(".toolcapsule", "profiles", "demo.json"), "https://workspace.example.com/mcp");

    await expect(loadProfile("demo")).resolves.toMatchObject({
      transport: { type: "remote", url: "https://workspace.example.com/mcp" },
    });
  });

  test("resolves linked profiles from source MCP config", async () => {
    await mkdir(".vscode", { recursive: true });
    await writeFile(
      join(".vscode", "mcp.json"),
      JSON.stringify({
        servers: {
          Original: {
            type: "http",
            url: "https://linked.example.com/mcp",
          },
        },
      }),
    );
    await mkdir(join(homeDir, "profiles"), { recursive: true });
    await writeFile(
      join(homeDir, "profiles", "demo.json"),
      JSON.stringify({
        name: "demo",
        kind: "linked",
        source: { tool: "vscode", path: join(tempDir, ".vscode", "mcp.json"), server: "Original" },
      }),
    );

    await expect(loadProfile("demo")).resolves.toMatchObject({
      name: "demo",
      transport: { type: "remote", url: "https://linked.example.com/mcp" },
    });
  });
});
