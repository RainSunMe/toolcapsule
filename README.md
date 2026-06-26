# ToolCapsule

[![npm version](https://img.shields.io/npm/v/toolcapsule?style=flat-square)](https://www.npmjs.com/package/toolcapsule)
[![CI](https://img.shields.io/github/actions/workflow/status/RainSunMe/toolcapsule/ci.yml?branch=main&style=flat-square)](https://github.com/RainSunMe/toolcapsule/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/license-MIT-black?style=flat-square)](LICENSE)
[![GitHub Repo stars](https://img.shields.io/github/stars/RainSunMe/toolcapsule?style=flat-square)](https://github.com/RainSunMe/toolcapsule)

> Convert MCP servers into lazy Agent Skills. MCP stays the capability layer; Skills become the agent-facing workflow layer.

**ToolCapsule** takes a heavy MCP server, fetches its tool schemas, and generates a compact Agent Skill with everything the agent needs to call those tools through local files.

```text
MCP server → tcap init → ~/.toolcapsule/profiles/<name>.json + SKILL.md
```

## Why

Large MCP servers bloat agent context: every tool description and schema is visible every turn, even when no tool call is needed. ToolCapsule moves that payload into a Skill the agent reads on demand, and moves call arguments into `/tmp` files instead of inline JSON.

| | Native MCP | ToolCapsule |
|---|---|---|
| Tool schemas | Visible every turn | Loaded on demand |
| Call args | Inline JSON | `/tmp` file |
| Failed calls | Regenerate everything | Edit file, re-run |
| Profile storage | Host-dependent | `~/.toolcapsule/profiles/` |

## Quick start

Install the ToolCapsule Skill into your agent:

```bash
npx skills add RainSunMe/toolcapsule --skill toolcapsule
```

The agent will read the Skill, install the CLI, and register your MCP servers. Or do it manually:

```bash
npm install -g toolcapsule
tcap init feishu --url https://mcp.feishu.cn/mcp/xxx --target claude
```

The `tcap` alias is equivalent to `toolcapsule`.

## CLI

```text
tcap init   <name> --url <url> | --command <cmd> [--arg <arg>] [--target <target>]
tcap call   <profile> <tool> @/tmp/args.json
tcap tools  <profile> [--brief | --names | --json]
tcap schema <profile> <tool>
```

Supported targets: `claude` (default), `copilot`, `opencode`, `agents`, `all`.

## Workflow

```bash
# 1. Register an MCP server — creates profile + Skill
tcap init feishu --url https://mcp.feishu.cn/mcp/xxx --target claude

# 2. Agent reads .claude/skills/feishu-mcp/SKILL.md
#    → sees tool summaries, usage instructions

# 3. Look up details on demand
tcap tools feishu                # compact one-line list
tcap schema feishu create-doc    # compact schema for one tool

# 4. Call with args in /tmp file
tcap call feishu create-doc @/tmp/tcap-feishu-create-doc.json

# 5. If it fails — edit /tmp file and re-run step 4
```

## What gets created

```text
~/.toolcapsule/
  profiles/feishu.json          ← transport config (never commit)

.claude/skills/feishu-mcp/
  SKILL.md                      ← Agent Skill (safe to commit)
```

## Auth

ToolCapsule detects authentication requirements automatically:

- **URL-embedded tokens** (e.g. Feishu): just pass the full URL to `init`
- **Header tokens** (e.g. API keys): edit `~/.toolcapsule/profiles/<name>.json` to add `"headers": { "Authorization": "Bearer <token>" }`
- **OAuth** (e.g. Figma): `init` auto-discovers the OAuth endpoint and shows the authorization URL

## Who is it for

Heavy MCP servers that are:

- schema-heavy (many tools, long descriptions)
- document/workflow oriented
- used occasionally rather than every turn
- carrying large payloads

Examples: Feishu/Lark, Notion, Figma, Jira, Linear, Confluence, Google Docs, GitHub management tools, internal SaaS MCPs.

## Documentation

- [Concept](docs/concept.md)
- [Architecture](docs/architecture.md)
- [Comparison](docs/comparison.md)
- [Releasing](docs/releasing.md)
- [Release checklist](docs/release-checklist.md)
- [Roadmap](ROADMAP.md)

## License

MIT
