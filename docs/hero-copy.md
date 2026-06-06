# Hero copy

Heavy MCP tools don't belong in your prompt.

Put them in a ToolCapsule.

ToolCapsule is MCP-to-Skill for heavy MCP tools. It turns schema-heavy MCP servers into lightweight, lazy-loaded Agent Skills with file-first calls and patch-and-retry recovery.

If you are searching for lazy MCP, ToolCapsule is the workflow: keep MCP as the capability layer, expose an Agent Skill as the workflow layer, and load schemas only when needed.

- Save context.
- Generate Skills.
- Store big payloads as files.
- Patch failed calls.
- Retry deterministically.
