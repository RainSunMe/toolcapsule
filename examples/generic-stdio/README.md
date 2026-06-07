# Generic stdio MCP demo

This example proves ToolCapsule is not Feishu-specific. The same MCP-to-Skill workflow works for any stdio MCP server.

It uses the mock MCP server from the test fixtures:

```bash
tcap init mock --command node --arg tests/fixtures/mock-mcp-server.mjs
tcap tools mock --brief
tcap schema mock create-doc
tcap call mock create-doc @examples/generic-stdio/create-doc.args.json --save-run
tcap retry .toolcapsule/runs/mock/<run-id>
```

For a real stdio MCP server, replace the command and args:

```bash
tcap init github --command npx --arg -y --arg @modelcontextprotocol/server-github
```

Do not commit secrets or private MCP configuration.
