# Architecture

```mermaid
flowchart TD
  A[Remote or stdio MCP server] --> B[toolcapsule CLI]
  B --> C[Tool cache and brief schema]
  B --> D[Generated SKILL.md]
  B --> E[Run artifacts]
  E --> F[Patch and retry]
```

## Components

- `McpClient`: speaks JSON-RPC over stdio, using `mcp-remote` for remote endpoints.
- `Profile`: stores transport and shortcut configuration.
- `Skill generator`: writes `SKILL.md` and profile config.
- `Run recorder`: stores request, response, command, and error files.
- `Schema helpers`: produce compact tool summaries.
