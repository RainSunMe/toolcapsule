# Agent tool compatibility research

This note summarizes how current coding agents discover Agent Skills, instructions, and MCP server configuration, and what that means for ToolCapsule onboarding.

Research date: 2026-06-06.

## Current repository state

- There is no `.agents/` directory in this repository today.
- The only checked-in skill is `.github/skills/toolcapsule-release/SKILL.md`.
- That skill is valid for GitHub Copilot / VS Code discovery because:
  - it lives under `.github/skills/<name>/SKILL.md`;
  - the `name` field is `toolcapsule-release`;
  - the parent directory name is also `toolcapsule-release`;
  - the name uses lowercase letters and hyphens only.
- It is not project-discoverable by Claude Code, because Claude Code loads project skills from `.claude/skills/<name>/SKILL.md`.
- It is not project-discoverable by OpenCode unless duplicated or generated under `.opencode/skills/<name>/SKILL.md`, `.claude/skills/<name>/SKILL.md`, or `.agents/skills/<name>/SKILL.md`.

## Compatibility matrix

| Tool | Skills support | Project skill locations | User skill locations | MCP config locations | Notes |
|---|---|---|---|---|---|
| GitHub Copilot in VS Code | Native Agent Skills | `.github/skills/`, `.claude/skills/`, `.agents/skills/` | `~/.copilot/skills/`, `~/.claude/skills/`, `~/.agents/skills/` | Workspace `.vscode/mcp.json`; user profile `mcp.json` | Skill `name` must match folder name and use lowercase/kebab-case. MCP config uses top-level `servers`. |
| Claude Code | Native Skills | `.claude/skills/<name>/SKILL.md` | `~/.claude/skills/<name>/SKILL.md` | Project `.mcp.json`; local/user in `~/.claude.json`; managed `/etc/claude-code/managed-mcp.json` on Linux | Skills follow Agent Skills standard with Claude extensions. Claude can import from Claude Desktop and can load Claude.ai connectors. |
| OpenCode | Native Skills | `.opencode/skills/`, `.claude/skills/`, `.agents/skills/` | `~/.config/opencode/skills/`, `~/.claude/skills/`, `~/.agents/skills/` | Project `opencode.json`; global `~/.config/opencode/opencode.json`; auth `~/.local/share/opencode/mcp-auth.json` | OpenCode explicitly supports `.agents/skills` compatibility. Unknown skill frontmatter is ignored; `name` and `description` are required. |
| Cursor | Rules, not Agent Skills | `.cursor/rules/*.mdc`, `AGENTS.md` | Cursor Settings → Rules | Commonly `.cursor/mcp.json` / Cursor settings depending version | Cursor rules are always/auto/manual context, not skill tool loading. Convert ToolCapsule guidance to `.mdc` or `AGENTS.md` for best results. |
| Gemini CLI | MCP and memory/instructions, no Agent Skills equivalent in core docs | `.gemini/settings.json`, `GEMINI.md` conventions | `~/.gemini/settings.json`, `~/.gemini/GEMINI.md` | `mcpServers` in `settings.json`; tokens `~/.gemini/mcp-oauth-tokens.json`; enablement `~/.gemini/mcp-server-enablement.json` | Supports MCP tools/resources/prompts and tool filtering. Tool names are namespaced as `mcp_<server>_<tool>`. |
| Aider | Conventions/read-only files, no MCP/Skills workflow layer | Project convention files loaded via `--read` or `.aider.conf.yml` | User config | No native MCP emphasis in current docs reviewed | Best integration is an instruction/conventions file that tells Aider to run `tcap`. |

## `.agents/` directory usage

`.agents/skills/<name>/SKILL.md` is now useful as a cross-agent compatibility path:

- GitHub Copilot in VS Code discovers project skills from `.agents/skills/`.
- OpenCode discovers project skills from `.agents/skills/`.
- Some tools also use `AGENTS.md` as a shared always-on instruction file.

However, Claude Code does not list `.agents/skills/` as a native project skill location. For Claude Code users, generate or copy to `.claude/skills/`.

Implemented ToolCapsule output strategy:

1. Default to `.claude/skills/<name>/` because Claude Code is currently the most complete native Agent Skills host.
2. Support `--target` options:
   - `--target copilot` → `.github/skills/<name>/`
   - `--target claude` → `.claude/skills/<name>/`
   - `--target opencode` → `.opencode/skills/<name>/`
   - `--target agents` → `.agents/skills/<name>/`
   - `--target all` → write multiple compatible copies.
3. Ensure `name` always equals directory basename and matches `^[a-z0-9]+(-[a-z0-9]+)*$`.

## Can ToolCapsule read existing MCP registrations?

Yes. A strong onboarding flow is to import existing MCP config files and convert each server entry into a ToolCapsule profile plus skill.

Initial support exists through:

```bash
tcap import --dry-run
tcap import --name <server> --target claude
tcap import --all --target all
```

The importer currently reads workspace MCP config by default and only reads user-level config with `--include-user`.

Recommended discovery order:

1. Workspace-local, because it is most relevant and safest to share:
   - `.vscode/mcp.json` for VS Code / Copilot.
   - `.mcp.json` for Claude Code project MCP.
   - `opencode.json` for OpenCode project MCP.
   - `.gemini/settings.json` for Gemini CLI project MCP.
   - `.cursor/mcp.json` when present.
2. User-level, only after explicit user consent because it may contain private endpoints or env references:
   - VS Code user profile `mcp.json`.
   - `~/.claude.json`.
   - `~/.config/opencode/opencode.json`.
   - `~/.gemini/settings.json`.
   - Cursor user settings.
3. Managed/enterprise config should be read-only and policy-aware:
   - Claude Code managed MCP on Linux: `/etc/claude-code/managed-mcp.json`.
   - VS Code/GitHub enterprise policies may restrict MCP access.

Important: importing config is different from importing credentials. ToolCapsule should preserve environment variable references such as `${TOKEN}`, `$TOKEN`, and `{env:TOKEN}` instead of resolving or printing secrets.

## Format mapping hints

### VS Code / Copilot

```json
{
  "servers": {
    "github": {
      "type": "http",
      "url": "https://api.githubcopilot.com/mcp"
    },
    "playwright": {
      "command": "npx",
      "args": ["-y", "@microsoft/mcp-server-playwright"]
    }
  }
}
```

Map to ToolCapsule:

- `type: "http"` or URL entry → `transport.type = "remote"`, `url`.
- `command` + `args` → `transport.type = "stdio"`, `command`, `args`.

### Claude Code / generic MCP

```json
{
  "mcpServers": {
    "notion": {
      "type": "http",
      "url": "https://mcp.notion.com/mcp"
    },
    "local-db": {
      "type": "stdio",
      "command": "npx",
      "args": ["-y", "@example/db-mcp"]
    }
  }
}
```

Map `http`, `streamable-http`, `sse`, and `ws` remote-style transports carefully. ToolCapsule currently supports remote URL and stdio, so SSE/WebSocket may need validation or future support.

### OpenCode

```json
{
  "mcp": {
    "context7": {
      "type": "remote",
      "url": "https://mcp.context7.com/mcp"
    },
    "local": {
      "type": "local",
      "command": ["npx", "-y", "@modelcontextprotocol/server-everything"]
    }
  }
}
```

Map `remote` to ToolCapsule remote. Map `local.command` array by splitting the first element as `command` and remaining elements as `args`.

### Gemini CLI

```json
{
  "mcpServers": {
    "httpServer": {
      "httpUrl": "https://api.example.com/mcp",
      "headers": {
        "Authorization": "Bearer $TOKEN"
      }
    },
    "pythonTools": {
      "command": "python",
      "args": ["-m", "my_mcp_server"]
    }
  }
}
```

Map `httpUrl` or `url` to remote URL. Preserve `headers` as future profile metadata if ToolCapsule adds header support.

## Product recommendation

Add a visible onboarding button to the homepage: “Give this to your AI”. The modal should contain a copyable instruction block that asks the user’s current coding agent to:

1. Inspect local MCP config files.
2. Identify configured MCP servers without exposing secrets.
3. Install ToolCapsule if missing.
4. Run `tcap init` for the selected server.
5. Generate the right skill target for the current agent.
6. Use `tcap tools <profile> --brief` and `tcap schema <profile> <tool>` before making calls.
7. Keep payloads in files and use `--save-run` plus `tcap retry`.

This lets users with existing MCP setup onboard without manually retyping server URLs or commands.
