# Generic stdio MCP demo

The MCP-to-Skill workflow works for any stdio MCP server:

```bash
# Create profile + Skill (local)
tcap init mock --command node --arg tests/fixtures/mock-mcp-server.mjs

# List tools
tcap tools mock --brief

# Inspect one tool
tcap schema mock create-doc

# Call with /tmp args file
tcap call mock create-doc @/tmp/tcap-mock-create-doc.json
```

For a real stdio MCP server:

```bash
tcap init github --command npx --arg -y --arg @modelcontextprotocol/server-github
```
