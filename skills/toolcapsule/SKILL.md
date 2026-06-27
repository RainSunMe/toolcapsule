---
name: toolcapsule
description: 'Use when: turning MCP servers into lazy Agent Skills, calling MCP tools through local files, or looking up MCP tool schemas on demand.'
argument-hint: 'MCP server URL, profile name, target agent, /tmp args file'
---

# ToolCapsule

ToolCapsule converts heavy MCP tools into compact, lazy-loaded Agent Skills. MCP stays the capability layer; Skills become the agent-facing workflow layer.

## Getting started (Agent reads this first)

1. Check if the `tcap` CLI is available. If not, install it:

```bash
npm install -g toolcapsule
tcap --version
```

2. Now you can use the commands below to register MCP servers and call their tools.

## Core workflow

### 1. Register an MCP server and generate a Skill

```bash
# Remote MCP
tcap init <profile-name> --url <mcp-url> --target claude

# Local stdio MCP
tcap init <profile-name> --command <cmd> --arg <arg> --target claude
```

This creates:
- `~/.toolcapsule/profiles/<profile-name>.json` (transport config — never commit)
- Skills directory with `SKILL.md` (safe to commit)

Supported targets: `agents` (default), `copilot`, `claude`, `opencode`, `all`.

### 2. Read the generated SKILL.md

The Skill contains a compact tool summary. Always prefer it over loading full MCP schemas.

### 3. Look up detailed schema on demand

```bash
tcap tools <profile>                 # compact one-line summary
tcap tools <profile> --names         # tool names only
tcap tools <profile> --json          # raw JSON
tcap schema <profile> <tool>         # compact schema for one tool
```

### 4. Call tools through /tmp files

```bash
# Write args to /tmp (never the workspace)
tcap call <profile> <tool> @/tmp/tcap-<profile>-<tool>.json
```

If the call fails, edit the args file and re-run the same command.

## Profile management

Profiles are stored in `~/.toolcapsule/profiles/` only. They contain transport config (URLs, commands, credentials) and must never be committed to a repository.

List profiles:

```bash
ls ~/.toolcapsule/profiles/
```

## Safety

- Never print or commit MCP URLs, tokens, API keys, or credentials.
- Write call args to `/tmp`, never to the workspace.
- Profile JSON files in `~/.toolcapsule/profiles/` are private — do not read their contents to the user.
- Set `TOOLCAPSULE_DEBUG=1` only for debugging stderr output.
