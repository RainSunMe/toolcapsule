import { mkdtemp, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, test } from "vitest";
import { parseToolArgs } from "../../src/args.js";

describe("parseToolArgs", () => {
  test("parses inline JSON", async () => {
    await expect(parseToolArgs('{"doc_id":"https://example.com/doc"}')).resolves.toEqual({
      doc_id: "https://example.com/doc",
    });
  });

  test("reads @file JSON", async () => {
    const dir = await mkdtemp(join(tmpdir(), "toolcapsule-args-"));
    const path = join(dir, "args.json");
    await writeFile(path, JSON.stringify({ title: "Hello" }), "utf8");

    await expect(parseToolArgs(`@${path}`)).resolves.toEqual({ title: "Hello" });
  });
});
