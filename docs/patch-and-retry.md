# Patch and retry

Native MCP failures often require the model to regenerate a full tool call. For large payloads, that is expensive and error-prone.

`toolcapsule` recommends file-first calls:

```bash
toolcapsule call feishu create-doc @args.json --save-run
```

If the call fails:

1. inspect `runs/<id>/error.txt`;
2. patch `args.json` or the referenced Markdown file;
3. retry:

```bash
toolcapsule retry runs/<id>
```

This makes failures reproducible and local.
