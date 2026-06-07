# Feishu / Lark demo

This demo shows the MCP-to-Skill workflow for a heavy document MCP server.

Feishu/Lark is a good example of lazy MCP: keep the MCP server as the capability layer, generate an Agent Skill as the workflow layer, and load full schemas only when needed.

## 1. Initialize a profile

```bash
tcap init feishu --url https://mcp.feishu.cn/mcp/your-endpoint
```

This creates:

```text
~/.toolcapsule/profiles/feishu.json
.github/skills/feishu-mcp/SKILL.md
```

Use `--local` if the profile should be stored in this workspace under `.toolcapsule/profiles/` instead.
Use `--copy` with `tcap import` if you want ToolCapsule to snapshot the MCP transport instead of linking the original MCP config.

## 2. Discover tools briefly

```bash
tcap tools feishu --brief
```

Use this instead of loading the full MCP schema into the prompt.

## 3. Inspect one tool only when needed

```bash
tcap schema feishu create-doc
```

## 4. Call with local artifacts

```bash
tcap call feishu create-doc @examples/feishu/create-doc.args.json --save-run
```

For large documents, keep the Markdown in `demo.md`, patch it locally, then copy/update the JSON payload before retrying.

## 5. Patch and retry

If the call fails:

```bash
# edit examples/feishu/create-doc.args.json or examples/feishu/demo.md
tcap retry .toolcapsule/runs/feishu/<run-id>
```

## Files

| File | Purpose |
|---|---|
| `demo.md` | Long Markdown payload example |
| `create-doc.args.json` | Create document call args |
| `update-doc.args.json` | Update document call args |
| `args.create-doc.json` | Legacy minimal args example |

## Safety

Use a test folder or wiki space for live writes. Do not commit private MCP endpoints, tokens, user IDs, or document URLs.
