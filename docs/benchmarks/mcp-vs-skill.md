# MCP vs Skill benchmark

This benchmark compares two ways of exposing a heavy MCP server to an AI agent:

1. **Native MCP mode**: every model call receives the full MCP tool definitions.
2. **ToolCapsule-style Skill mode**: each model call receives compact Skill guidance and stable shortcut schemas; full MCP schemas are loaded only when needed.

The benchmark was originally run against a document/workflow MCP server with long tool descriptions and large-payload workflows. The concrete server was Feishu/Lark, but the pattern applies to other schema-heavy MCP servers such as Notion, Jira, Linear, Confluence, GitHub management tools, and internal SaaS MCPs.

> No private MCP URLs, tokens, API keys, user IDs, or document IDs are included in this report.

## Executive summary

| Metric | Native MCP | ToolCapsule-style Skill | Improvement |
|---|---:|---:|---:|
| Total input tokens | 618,834 | 71,842 | **-88.4%** |
| Average input tokens / call | 10,856.7 | 1,260.4 | **-88.4%** |
| Total tokens | 624,292 | 77,302 | **-87.6%** |
| Planning success rate | 100% | 100% | no regression |
| Average latency | 2,960.4ms | 2,746.4ms | Skill mode lower by ~214ms |

## Why this matters

Native MCP is a strong interface for connecting agents to tools. The trade-off is that MCP tool names, descriptions, annotations, and input schemas can become part of the model-visible tool set.

That is fine for small tools. It becomes expensive for document/workflow MCP servers where:

- the server exposes many tools;
- descriptions include long rules and examples;
- many turns are planning-only and do not need actual tool calls;
- write operations carry large Markdown or JSON payloads;
- failures benefit from patching local artifacts instead of regenerating the entire tool call.

ToolCapsule keeps MCP as the capability layer, but makes the agent-facing layer lighter:

```text
MCP server → compact Skill guidance → local args/content files → auditable run → patch and retry
```

## Experimental design

### Native MCP mode

Each model call included the full MCP tool definition set, converted into model tool definitions.

The model was asked to plan tool usage but not execute real document writes during the benchmark.

### ToolCapsule-style Skill mode

Each model call included:

- compact Skill instructions;
- stable shortcut schemas for common operations;
- no full MCP tool schema set by default.

The model was again asked to plan tool usage without executing real document writes.

## Controls

| Variable | Value |
|---|---:|
| Model family | small/fast planning model |
| Temperature | 0 |
| Max output tokens | 96 |
| Scenarios | 6 |
| Repeats per scenario | 3 |
| Total model calls | 114 |
| MCP tools in source server | 10 |

Token counts are from live model usage metadata returned by the API, not from rough character estimates.

## Scenarios

| Scenario | Expected tool pattern | Purpose |
|---|---|---|
| Chat-only document structure | none | Measure cost when tools are not needed |
| Simple document creation planning | create document | Measure common write intent |
| Repeated document creation planning | create document | Measure repeated schema injection over multiple turns |
| Search user + add comment planning | search user, add comment | Measure multi-tool workflow planning |
| Advanced document creation planning | create document | Measure complex Markdown/table/diagram intent |
| Read and summarize planning | fetch document | Measure read-oriented workflow |

## Static schema estimate

| Item | Value |
|---|---:|
| Full `tools/list` JSON characters | 18,117 |
| Full `tools/list` rough tokens | 4,530 |
| Native model tool rough tokens | 4,224 |
| Skill instructions rough tokens | 729 |
| Compact shortcut interface rough tokens | 142 |
| Native tools → compact interface rough reduction | 96.6% |

These static numbers are estimates. The live token results above are the main benchmark result.

## Live usage by scenario

| Scenario | Native input | Skill input | Input reduction | Input reduction % | Total token reduction % |
|---|---:|---:|---:|---:|---:|
| Chat-only document structure | 97,762 | 11,386 | 86,376 | 88.4% | 87.6% |
| Simple document creation | 97,506 | 11,159 | 86,347 | 88.6% | 87.8% |
| Repeated document creation | 130,419 | 15,296 | 115,123 | 88.3% | 87.5% |
| Search user + comment | 97,587 | 11,225 | 86,362 | 88.5% | 87.7% |
| Advanced document creation | 97,664 | 11,209 | 86,455 | 88.5% | 87.7% |
| Read and summarize | 97,896 | 11,567 | 86,329 | 88.2% | 87.4% |

## Interpretation

### Chat-only turns still benefit

Even when a user only asks for advice or structure, native MCP can still expose the full tool definition set. ToolCapsule-style Skill mode avoids that repeated schema cost.

### Repeated workflows compound the savings

Repeated document creation had four turns per repeat. Native MCP carried the full tool definitions on each turn; ToolCapsule-style Skill mode carried a compact workflow description.

### Output tokens stayed similar

Both modes were asked to produce the same kind of planning response. The difference came almost entirely from input-side schema overhead.

## Patch-and-retry advantage

Token savings are only part of the value. ToolCapsule also changes failure recovery.

Native MCP failure path:

```text
model generates full tool call → call fails → error returns to model → model regenerates full tool call
```

ToolCapsule failure path:

```text
model writes args/content files → CLI calls MCP → call fails → patch local file → retry same run
```

This is especially useful for:

- long Markdown documents;
- tables and diagrams;
- batch operations;
- comments or tickets with structured payloads;
- any tool call where only one small part needs correction.

## Limitations

- This benchmark measures context cost and planning behavior, not real write success rates.
- The source MCP server was a document/workflow server with long schemas; smaller MCP servers will show smaller savings.
- Different model hosts may count tool schemas differently.
- ToolCapsule still needs full schema access for unfamiliar or complex tools; the point is to load it on demand, not to discard it.

## Reproduce the measurement pattern

Use ToolCapsule's schema footprint command on your own MCP server:

```bash
tcap benchmark <profile> --markdown --out toolcapsule-report.md
```

For a full live model benchmark, compare:

1. model calls with complete MCP tool definitions;
2. model calls with only compact Skill guidance and shortcut schemas.

Keep the model, prompts, turns, and temperature constant across both modes.
