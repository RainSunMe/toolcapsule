# Import existing MCP configuration

ToolCapsule can convert MCP servers already configured in other coding tools into ToolCapsule profiles and Agent Skills.

This is the fastest onboarding path when a user already has MCP working in Claude Code, GitHub Copilot / VS Code, OpenCode, Gemini CLI, or Cursor.

## Quick start

```bash
tcap import --dry-run
tcap import --name <server> --target claude
```

To write skills for multiple agents:

```bash
tcap import --name <server> --target all
```

## What gets created

For an imported server named `github`, ToolCapsule writes:

```text
.toolcapsule/profiles/github.json
.claude/skills/github-mcp/SKILL.md
```

`claude` is the default target. Other targets:

| Target | Output |
|---|---|
| `claude` | `.claude/skills/<name>-mcp/` |
| `copilot` | `.github/skills/<name>-mcp/` |
| `opencode` | `.opencode/skills/<name>-mcp/` |
| `agents` | `.agents/skills/<name>-mcp/` |
| `all` | all of the above |

## Config files scanned

Workspace config is scanned by default:

| Tool | File |
|---|---|
| GitHub Copilot / VS Code | `.vscode/mcp.json` |
| Claude Code | `.mcp.json` |
| OpenCode | `opencode.json` |
| Gemini CLI | `.gemini/settings.json` |
| Cursor | `.cursor/mcp.json` |

User-level config can contain private endpoints or credential references, so it is opt-in:

```bash
tcap import --include-user --dry-run
```

Currently checked user-level files:

| Tool | File |
|---|---|
| Claude Code | `~/.claude.json` |
| OpenCode | `~/.config/opencode/opencode.json` |
| Gemini CLI | `~/.gemini/settings.json` |

## What is preserved

ToolCapsule imports:

- remote MCP URLs;
- stdio commands and args;
- string-valued `headers`;
- string-valued `env` or `environment`;
- stdio `cwd`.

Secrets should stay as environment variable references where possible, for example:

```json
{
  "headers": {
    "Authorization": "Bearer ${GITHUB_TOKEN}"
  }
}
```

ToolCapsule stores the reference, not the resolved secret value.

## Safety notes

- Run `--dry-run` first.
- Use `--include-user` only when you want ToolCapsule to inspect personal MCP config.
- Do not commit generated profiles if they contain private endpoints, document IDs, tokens, or machine-specific paths.
- Keep `.toolcapsule/`, generated skills, and run artifacts under review before sharing.
- Transport logs are quiet by default. Set `TOOLCAPSULE_DEBUG=1` only when debugging.

## Example flows

### Import one server for Claude Code

```bash
tcap import --dry-run
tcap import --name notion --target claude
tcap tools notion --brief
```

### Import all workspace MCP servers for multiple agents

```bash
tcap import --all --target all
```

### Use an imported server

```bash
tcap tools github --brief
tcap schema github create-issue
tcap call github create-issue @args.json --save-run
```

If the call fails, patch `args.json` and retry:

```bash
tcap retry runs/<run-id>
```
