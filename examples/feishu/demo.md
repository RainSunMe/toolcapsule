# ToolCapsule Feishu demo document

This file is intentionally stored as a local artifact.

## Why this matters

Large Feishu documents often contain Markdown, tables, diagrams, mentions, and other structured content. If a write fails, the model should not regenerate the entire tool call.

## Patch-and-retry demo

1. Put this Markdown in a local file.
2. Reference it from `create-doc.args.json`.
3. Call the MCP tool with `tcap call ... --save-run`.
4. If Feishu rejects a block, patch this file.
5. Run `tcap retry runs/<id>`.

## Checklist

- [x] Schema stays out of the prompt by default.
- [x] Payload lives in a file.
- [x] Failed calls are patchable.
