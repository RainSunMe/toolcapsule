import type { McpTool } from "../types.js";

export function toolTitle(tool: McpTool): string {
  return tool.annotations?.title || tool.description?.split(/\n/)[0]?.slice(0, 100) || tool.name;
}

export function briefTool(tool: McpTool): string {
  const schema = tool.inputSchema as any;
  const required = Array.isArray(schema?.required) ? schema.required : [];
  const properties = schema?.properties && typeof schema.properties === "object" ? Object.keys(schema.properties) : [];
  const flags = [
    tool.annotations?.readOnlyHint ? "read-only" : undefined,
    tool.annotations?.destructiveHint ? "destructive" : undefined,
  ].filter(Boolean);
  return `- ${tool.name}: ${toolTitle(tool)}${flags.length ? ` [${flags.join(", ")}]` : ""}${required.length ? ` required=${required.join("|")}` : ""}${properties.length ? ` args=${properties.slice(0, 12).join("|")}` : ""}`;
}

export function briefTools(tools: McpTool[]): string {
  return tools.map(briefTool).join("\n");
}
