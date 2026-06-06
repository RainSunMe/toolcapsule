import type { McpTool } from "../types.js";

export function summarizeTool(tool: McpTool): unknown {
  const schema = tool.inputSchema as any;
  const properties = schema?.properties && typeof schema.properties === "object" ? schema.properties : {};
  return {
    name: tool.name,
    title: tool.annotations?.title,
    description: tool.description?.split(/\n\n/)[0]?.slice(0, 500),
    annotations: tool.annotations,
    required: Array.isArray(schema?.required) ? schema.required : [],
    arguments: Object.fromEntries(
      Object.entries(properties).map(([key, value]: [string, any]) => [
        key,
        { type: value?.type, enum: value?.enum, description: value?.description?.slice?.(0, 160) },
      ]),
    ),
  };
}

export function summarizeTools(tools: McpTool[]): unknown[] {
  return tools.map(summarizeTool);
}
