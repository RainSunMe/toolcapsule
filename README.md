# ToolCapsule

[![npm version](https://img.shields.io/npm/v/toolcapsule?style=flat-square)](https://www.npmjs.com/package/toolcapsule)
[![CI](https://img.shields.io/github/actions/workflow/status/RainSunMe/toolcapsule/ci.yml?branch=main&style=flat-square)](https://github.com/RainSunMe/toolcapsule/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/license-MIT-black?style=flat-square)](LICENSE)
[![GitHub Repo stars](https://img.shields.io/github/stars/RainSunMe/toolcapsule?style=flat-square)](https://github.com/RainSunMe/toolcapsule)

> MCP-to-Skill for heavy MCP tools.

**ToolCapsule** turns heavy MCP servers into lightweight, lazy-loaded, file-first **Agent Skills** with saved runs and patch-and-retry recovery.

If you are looking for **lazy MCP**, **MCP to Skill**, **MCP-to-Skill**, or **Agent Skills for MCP tools**, ToolCapsule is built for that workflow.

It is not a replacement for MCP or Skills. It is the missing workflow layer between them:

```text
Heavy MCP server
→ MCP-to-Skill workflow layer
→ compact Agent Skill
→ local args/content files
→ auditable tool runs
→ patch-and-retry recovery
```

## Why ToolCapsule

MCP is becoming the standard way to connect agents to tools. Skills are becoming the standard way to package agent workflows.

But large MCP servers can be expensive in agent contexts:

- long tool descriptions and schemas may be visible every turn;
- many turns do not need a real tool call;
- document/workflow tools often carry large Markdown or JSON payloads;
- failed tool calls force the model to regenerate the whole call.

ToolCapsule keeps the MCP server as the source of truth, but exposes it through a lightweight Skill and local artifacts.
Transport logs are quiet by default so remote MCP URLs are not printed during normal use. Set `TOOLCAPSULE_DEBUG=1` only when debugging.

## MCP-to-Skill and lazy MCP

ToolCapsule is an **MCP-to-Skill workflow layer**. It imports existing MCP configurations and generates Agent Skills that let agents lazy-load MCP schemas only when needed.

This is the practical version of a lazy MCP workflow:

- MCP remains the protocol and source of truth;
- Skills become the agent-facing workflow;
- large payloads move into local files;
- failed calls become patchable artifacts instead of regenerated prompts.

## Import your existing MCP setup

Already configured MCP in Claude Code, GitHub Copilot / VS Code, OpenCode, Gemini CLI, or Cursor? Import it instead of retyping URLs and commands:

```bash
tcap import --dry-run
tcap import --name github --target claude
```

ToolCapsule scans common workspace MCP config files such as `.mcp.json`, `.vscode/mcp.json`, `opencode.json`, `.gemini/settings.json`, and `.cursor/mcp.json`, then creates:

```text
.toolcapsule/profiles/<server>.json
.claude/skills/<server>-mcp/SKILL.md
```

Use `--target copilot`, `--target opencode`, `--target agents`, or `--target all` to write skills for other agents. User-level MCP configs are only inspected when you opt in with `--include-user`.

## What is a ToolCapsule?

A ToolCapsule is a file-first tool call package:

```text
capsule = MCP tool + args.json + payload files + run metadata + retry history
```

Instead of making the model hold everything in the prompt, ToolCapsule stores heavy payloads and run state on disk.

## Quick start

```bash
npm i -g toolcapsule

toolcapsule install-skill
toolcapsule import --dry-run
toolcapsule import --name feishu --target claude
toolcapsule tools feishu --brief
toolcapsule schema feishu create-doc
toolcapsule call feishu create-doc @args.json --save-run
toolcapsule retry runs/2026-06-06T10-00-00-000Z
```

Short alias:

```bash
tcap tools feishu --brief
tcap call feishu create-doc @args.json --save-run
```

## What it generates

```text
.claude/skills/feishu-mcp/
  SKILL.md                  # lightweight Agent Skill entrypoint
  toolcapsule.config.json   # MCP transport/profile config
  scripts/README.md
  runs/                     # auditable tool call records
```

This lets your agent discover the Skill instead of carrying the full MCP schema in every turn.

## Native MCP vs ToolCapsule

| Concern | Native MCP | ToolCapsule |
|---|---|---|
| Tool schemas | Often visible every turn | Loaded on demand |
| Agent workflow | Direct tool call | Skill-guided workflow |
| Large payloads | Generated inside tool calls | Stored as files |
| Failed calls | Regenerate full tool call | Patch local file and retry |
| Auditability | Host dependent | Run directory with request/response/error |
| Best for | Small, high-frequency tools | Heavy SaaS/document/workflow MCPs |

## Patch-and-retry

When a large MCP call fails, do not ask the model to rewrite the whole tool call.

```bash
# 1. Call with a local args file
toolcapsule call feishu create-doc @args.json --save-run

# 2. Patch args.json or content.md

# 3. Retry deterministically
toolcapsule retry runs/2026-06-06T10-00-00-000Z
```

This is especially useful for MCP tools that create documents, tickets, pages, dashboards, reports, or batch operations.

## Benchmark result

In a Feishu MCP benchmark:

- **88.4% fewer input tokens**;
- **87.6% fewer total tokens**;
- planning success rate stayed at **100%**.

Results vary by MCP server, model, and host.

## CLI

```text
toolcapsule init <name> --url <remote-mcp-url> --target claude
toolcapsule init <name> --command <stdio-command> --arg <arg> --target claude
toolcapsule install-skill --target claude
toolcapsule import --dry-run
toolcapsule import --name <server> --target claude
toolcapsule import --all --target all
toolcapsule tools <profile> --brief
toolcapsule describe <profile> <tool> --brief
toolcapsule schema <profile> <tool>
toolcapsule call <profile> <tool> @args.json --save-run
toolcapsule retry <run-dir>
toolcapsule summarize <profile>
toolcapsule benchmark <profile> --markdown --out toolcapsule-report.md
```

`tcap` is an equivalent short alias for `toolcapsule`.

## Who is it for?

ToolCapsule is useful when your MCP server is:

- schema-heavy;
- document/workflow oriented;
- occasionally used rather than called every turn;
- carrying large payloads;
- hard to retry after failures.

Examples: Feishu/Lark, Notion, Jira, Linear, Confluence, Google Docs, GitHub management tools, internal SaaS MCPs.

## Project status

Early alpha. APIs may change before v1.0.

## Documentation

- [Concept](docs/concept.md)
- [Architecture](docs/architecture.md)
- [Import existing MCP configuration](docs/importing-mcp.md)
- [Patch and retry](docs/patch-and-retry.md)
- [Benchmark methodology](docs/benchmark-methodology.md)
- [Releasing](docs/releasing.md)
- [Launch notes](docs/launch.md)
- [Screenshots and recordings](docs/screenshots.md)
- [Next steps](docs/next-steps.md)
- [Release checklist](docs/release-checklist.md)
- [Agent tool compatibility research](docs/agent-tool-compatibility.md)
- [Roadmap](ROADMAP.md)

## License

MIT
