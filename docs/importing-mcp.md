# Import existing MCP configuration

ToolCapsule can convert MCP servers already configured in other coding tools into ToolCapsule profiles and Agent Skills. This is the core MCP-to-Skill workflow.

This is the fastest onboarding path when a user already has MCP working in Claude Code, GitHub Copilot / VS Code, OpenCode, Gemini CLI, or Cursor. It also enables a lazy MCP setup where schemas are loaded only when the generated Skill needs them.

## Quick start

AI-first onboarding starts by installing the ToolCapsule Skill, not the CLI:

```bash
npx skills add RainSunMe/toolcapsule --skill toolcapsule
```

For non-interactive installation into Claude Code:

```bash
npx skills add RainSunMe/toolcapsule --skill toolcapsule --agent claude-code --yes
```

Then ask the agent to use the ToolCapsule Skill to inspect MCPs and capsule selected heavy servers.

Manual CLI flow:

```bash
tcap mcp list --include-user
tcap mcp enable <server> --as <profile> --target claude
```

The newer inventory-oriented flow is:

```bash
tcap mcp list --include-user
tcap mcp enable <server> --as <profile> --target claude
```

To write skills for multiple agents:

```bash
tcap mcp enable <server> --as <profile> --target all
```

Use `--as` when the native MCP server name is generic, for example `tcap import --name docs --as feishu`.

## What gets created

An MCP-to-Skill import keeps MCP as the capability layer and creates a Skill as the agent-facing workflow layer.

For an imported server named `github`, ToolCapsule writes:

```text
~/.toolcapsule/profiles/github.json
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
- Imported profiles are stored under `~/.toolcapsule/profiles/` by default so MCP connections can be reused across projects.
- Imports link to the original MCP config by default instead of copying private endpoints.
- Use `--copy` when you want a stable snapshot profile that no longer depends on the source MCP config file.
- Use `--local` only when a profile should be stored in the current workspace under `.toolcapsule/profiles/`.
- Do not commit local generated profiles if they contain private endpoints, document IDs, tokens, or machine-specific paths.
- Keep `.toolcapsule/`, generated skills, and run artifacts under review before sharing.
- Transport logs are quiet by default. Set `TOOLCAPSULE_DEBUG=1` only when debugging.

## Example flows

### Import one server for Claude Code

```bash
tcap mcp list --include-user
tcap mcp enable notion --target claude
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
tcap retry .toolcapsule/runs/github/<run-id>
```
