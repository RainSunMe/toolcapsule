import { describe, expect, test } from "vitest";
import { briefTools } from "../../src/schema/brief.js";
import { summarizeTool } from "../../src/schema/summarize.js";
import type { McpTool } from "../../src/types.js";

const tool: McpTool = {
  name: "create-doc",
  description: "Create a document.\n\nLong docs...",
  annotations: { title: "Create document", destructiveHint: true },
  inputSchema: {
    type: "object",
    required: ["title"],
    properties: {
      title: { type: "string", description: "Document title" },
      markdown: { type: "string", description: "Markdown body" },
    },
  },
};

describe("schema helpers", () => {
  test("briefTools includes tool name and required args", () => {
    expect(briefTools([tool])).toContain("create-doc");
    expect(briefTools([tool])).toContain("required=title");
  });

  test("summarizeTool keeps compact argument list", () => {
    expect(summarizeTool(tool)).toMatchObject({ name: "create-doc", required: ["title"] });
  });
});
