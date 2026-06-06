#!/usr/bin/env node
import readline from 'node:readline';

const tools = [
  {
    name: 'create-doc',
    description: 'Create a document from Markdown. Use local files for large payloads.',
    annotations: { title: 'Create document', destructiveHint: true },
    inputSchema: {
      type: 'object',
      required: ['title', 'markdown'],
      properties: {
        title: { type: 'string', description: 'Document title' },
        markdown: { type: 'string', description: 'Markdown body' },
      },
    },
  },
  {
    name: 'fetch-doc',
    description: 'Fetch a document by URL or ID.',
    annotations: { title: 'Fetch document', readOnlyHint: true },
    inputSchema: {
      type: 'object',
      required: ['doc_id'],
      properties: { doc_id: { type: 'string', description: 'Document ID or URL' } },
    },
  },
];

const rl = readline.createInterface({ input: process.stdin });
function send(value) { process.stdout.write(JSON.stringify(value) + '\n'); }
rl.on('line', (line) => {
  const msg = JSON.parse(line);
  if (msg.method === 'initialize') send({ jsonrpc: '2.0', id: msg.id, result: { protocolVersion: '2025-03-26', capabilities: { tools: {} }, serverInfo: { name: 'mock', version: '1.0.0' } } });
  else if (msg.method === 'tools/list') send({ jsonrpc: '2.0', id: msg.id, result: { tools } });
  else if (msg.method === 'tools/call') send({ jsonrpc: '2.0', id: msg.id, result: { content: [{ type: 'text', text: JSON.stringify({ ok: true, tool: msg.params.name, args: msg.params.arguments }) }] } });
});
