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

async function writeProfileFile(path: string, url: string): Promise<void> {
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
    process.env.TOOLCAPSULE_HOME = homeDir;
  });

  afterEach(async () => {
    process.chdir(cwd);
    delete process.env.TOOLCAPSULE_HOME;
    await rm(tempDir, { recursive: true, force: true });
  });

  test("loads profile from ~/.toolcapsule/profiles/", async () => {
    await writeProfileFile(join(homeDir, "profiles", "demo.json"), "https://example.com/mcp");

    await expect(loadProfile("demo")).resolves.toMatchObject({
      name: "demo",
      transport: { type: "remote", url: "https://example.com/mcp" },
    });
  });

  test("throws when profile not found", async () => {
    await expect(loadProfile("nonexistent")).rejects.toThrow("Profile not found");
  });
});
