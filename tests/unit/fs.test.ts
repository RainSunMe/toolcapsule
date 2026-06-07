import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, test } from "vitest";
import { ensureToolCapsuleIgnored } from "../../src/utils/fs.js";

const cwd = process.cwd();
const tempDir = join(cwd, ".tmp-fs-test");

async function resetTempDir(): Promise<void> {
  await rm(tempDir, { recursive: true, force: true });
  await mkdir(tempDir, { recursive: true });
}

describe("filesystem helpers", () => {
  beforeEach(async () => {
    await resetTempDir();
    process.chdir(tempDir);
  });

  afterEach(async () => {
    process.chdir(cwd);
    await rm(tempDir, { recursive: true, force: true });
  });

  test("creates .gitignore with .toolcapsule ignored", async () => {
    await ensureToolCapsuleIgnored();

    await expect(readFile(".gitignore", "utf8")).resolves.toBe(".toolcapsule/\n");
  });

  test("appends .toolcapsule once", async () => {
    await writeFile(".gitignore", "node_modules/\n");

    await ensureToolCapsuleIgnored();
    await ensureToolCapsuleIgnored();

    await expect(readFile(".gitignore", "utf8")).resolves.toBe("node_modules/\n.toolcapsule/\n");
  });
});
