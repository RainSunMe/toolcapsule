# Comparison: ToolCapsule, native MCP, lazy-mcp, and MCP-to-Skill generators

ToolCapsule is not a replacement for MCP. It is an AI-first workflow manager for heavy MCP tools.

It overlaps with lazy MCP proxies and MCP-to-Skill generators, but the product shape is different: ToolCapsule inventories existing MCPs, links selected heavy servers into Agent Skills, keeps payloads in files, and records runs for patch-and-retry recovery.

## Summary

| Approach | Best for | What the agent sees | Main trade-off |
|---|---|---|---|
| Native MCP | Small, frequent tools | Full MCP tools exposed by the host | Heavy servers can add context and retry cost |
| `lazy-mcp` style proxy | Aggregating many MCP servers behind a few meta-tools | Meta-tools such as list/describe/invoke | Requires adding a proxy MCP server and meta-tool calling discipline |
| `mcp2skill` / `mcp-to-skill` style generators | One-time conversion of an MCP server into a Skill folder | Generated Skill and local executor/config | Often copies config into the Skill and is more generator-oriented |
| ToolCapsule | Heavy SaaS/document/workflow MCPs used by AI coding agents | Official ToolCapsule Skill plus generated MCP-specific Skills with tool summaries | Requires `tcap` CLI for file-first calls and run artifacts |

## Native MCP vs ToolCapsule

Native MCP is the source of truth. ToolCapsule keeps it that way.

The difference is workflow:

- native MCP exposes tools directly to the host;
- ToolCapsule lets the agent inventory MCPs, enable selected heavy ones as Skills, and call them through local files;
- failed calls become patchable run artifacts instead of regenerated prompts.

Use native MCP directly for small, high-frequency tools. Use ToolCapsule for heavy, low-frequency, document/workflow-oriented MCPs.

## `lazy-mcp` style proxy vs ToolCapsule

`lazy-mcp` is a client-agnostic MCP proxy. It aggregates MCP servers and exposes a small number of meta-tools such as list, describe, and invoke.

ToolCapsule is not a proxy. It is a Skill and file workflow:

- no replacement MCP proxy is required;
- existing MCP configs can be linked instead of copied;
- generated Skills include compact tool summaries;
- calls use `@args.json` and saved run directories;
- retry is done by patching local artifacts.

Use a proxy when you want one MCP endpoint that aggregates many servers. Use ToolCapsule when you want the coding agent to manage heavy MCP workflows through Skills and files.

## `mcp2skill` / `mcp-to-skill` generators vs ToolCapsule

MCP-to-Skill generators convert a server into a Skill folder. That overlaps with one part of ToolCapsule.

ToolCapsule adds a broader workflow:

- AI-first onboarding via `npx skills add RainSunMe/toolcapsule --skill toolcapsule`;
- `tcap mcp list` inventory across workspace, user, and ToolCapsule profiles;
- `tcap mcp enable <server> --as <profile>` for selected heavy servers;
- linked profiles by default, so private MCP URLs are not copied into generated Skills;
- generated Skills with embedded tool summaries;
- file-first calls through `tcap call <profile> <tool> @args.json --save-run`;
- run artifacts under `.toolcapsule/runs/<profile>/<run-id>/`;
- deterministic patch-and-retry.

Use a generator when you only need a static Skill folder. Use ToolCapsule when you need an ongoing workflow for discovery, enabling, calling, auditing, and retrying heavy MCP tools.

## Positioning

ToolCapsule should be described as:

> AI-first workflow manager for heavy MCP tools.

Expanded:

> ToolCapsule inventories your existing MCPs, turns selected heavy servers into lazy Agent Skills, and keeps calls file-first with auditable runs and patch-and-retry recovery.

Related terms such as lazy MCP, MCP-to-Skill, and Agent Skills for MCP are useful search terms, but ToolCapsule is broader than a proxy or one-shot Skill generator.
