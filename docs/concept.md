# Concept

**ToolCapsule** is a lazy workflow layer for heavy MCP tools.

MCP connects agents to tools. Skills package repeatable agent workflows. ToolCapsule sits between them: it keeps MCP as the source of truth, but turns schema-heavy tools into compact, file-first Agent Skills.

## The idea

```text
MCP tool schema → compact Skill guidance → local capsule files → auditable run → patch and retry
```

## Principles

1. Brief by default, full MCP schema on demand.
2. Large tool payloads live in local files.
3. Every call can be recorded as a ToolCapsule run.
4. Failed calls should be patchable and retryable.
5. MCP remains the capability layer; Skill becomes the agent-facing workflow layer.
