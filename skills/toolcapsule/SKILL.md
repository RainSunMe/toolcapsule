---
name: toolcapsule
description: 'Use when: discovering MCP servers, turning heavy MCP tools into lazy Agent Skills, installing ToolCapsule, generating MCP-specific Skills, calling MCP tools through local files, or using patch-and-retry recovery.'
argument-hint: 'MCP server, profile name, target agent, args file, or retry task'
---

# ToolCapsule

ToolCapsule is not a replacement for MCP. It is a workflow layer for heavy MCP tools: discover MCP servers, turn selected ones into lazy Agent Skills, keep large payloads in files, and retry failed calls by patching artifacts.

## Install

This Skill is intended to be installed with the open `skills` CLI:

```bash
npx skills add RainSunMe/toolcapsule --skill toolcapsule
```

For a specific agent or global install:

```bash
npx skills add RainSunMe/toolcapsule --skill toolcapsule --agent claude-code
npx skills add RainSunMe/toolcapsule --skill toolcapsule --global --agent claude-code
```

After this Skill is active, check whether the ToolCapsule CLI is available. If `toolcapsule` or `tcap` is missing, install it:

```bash
npm install -g toolcapsule
```

Verify:

```bash
tcap --version
```

## Core workflow for agents

1. Inventory MCP servers without exposing secrets:

```bash
tcap mcp list
# If the user asks to inspect user-level configs too:
tcap mcp list --include-user
```

2. Pick heavy MCP servers that should not stay in the prompt every turn. Prefer document, SaaS, ticket, wiki, dashboard, or batch tools.

3. Enable ToolCapsule for a selected native MCP. Use `--as` when the original server name is generic:

```bash
tcap mcp enable <native-server-name> --as <profile-name> --target claude
```

This links to the original MCP config by default. Use `--copy` only when the user wants a stable snapshot independent of the source MCP config:

```bash
tcap mcp enable <native-server-name> --as <profile-name> --copy --target claude
```

4. If there is no existing MCP config, create a ToolCapsule profile directly:

```bash
tcap init <profile-name> --url <remote-mcp-url> --target claude
# or
tcap init <profile-name> --command <stdio-command> --arg <arg> --target claude
```

5. Use generated MCP-specific Skills. They should contain a tool summary table. Only run schema lookup when needed:

```bash
tcap schema <profile-name> <tool>
```

6. For calls, prefer local files:

```bash
tcap call <profile-name> <tool> @args.json --save-run
```

7. If a call fails, patch artifacts and retry:

```bash
tcap retry .toolcapsule/runs/<profile-name>/<run-id>
```

## Optional native disable

Only disable native MCP configs when the user explicitly wants to stop the host from loading a heavy MCP directly.

Always dry-run first:

```bash
tcap mcp disable <native-server-name> --native
```

Apply only after user confirmation:

```bash
tcap mcp disable <native-server-name> --native --yes
```

Do not modify managed or enterprise MCP configs.

## Safety

- Never print private MCP URLs, tokens, API keys, user IDs, or document IDs unless the user explicitly asks.
- Prefer linked profiles over copied snapshots to avoid duplicating private endpoints.
- Use `--include-user` only when the user agrees to inspect user-level MCP configs.
- Keep `.toolcapsule/` local; it may contain run artifacts with sensitive request/response data.
- Use `TOOLCAPSULE_DEBUG=1` only for debugging.

## Target paths

- `--target claude` → `.claude/skills/<name>-mcp/`
- `--target copilot` → `.github/skills/<name>-mcp/`
- `--target opencode` → `.opencode/skills/<name>-mcp/`
- `--target agents` → `.agents/skills/<name>-mcp/`
- `--target all` → all of the above

MCP profiles are stored under `~/.toolcapsule/profiles/` by default. Workspace run artifacts are stored under `.toolcapsule/runs/<profile>/`.
