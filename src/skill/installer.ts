import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";

const agentSkill = `---
name: toolcapsule
description: 'Use when: converting MCP servers into lightweight Agent Skills, installing ToolCapsule, lazy-loading MCP schemas, calling MCP tools through local args files, or using patch-and-retry workflows for heavy MCP tools.'
argument-hint: 'MCP server URL/command, tool name, args file, or retry task'
---

# ToolCapsule Agent Skill

Use ToolCapsule when an agent needs to work with heavy MCP servers without carrying every tool schema in the prompt.

## Install

If \`toolcapsule\` or \`tcap\` is missing:

\`\`\`bash
npm install -g toolcapsule
\`\`\`

## Core workflow

1. Initialize a profile and generated Skill:

\`\`\`bash
tcap init <name> --url <remote-mcp-url>
# or
tcap init <name> --command <stdio-command> --arg <arg>
\`\`\`

2. Discover tools briefly:

\`\`\`bash
tcap tools <name> --brief
\`\`\`

3. Inspect one tool only when needed:

\`\`\`bash
tcap schema <name> <tool>
\`\`\`

4. Put complex arguments in a local JSON file.

5. Call the MCP tool through the local args file:

\`\`\`bash
tcap call <name> <tool> @args.json --save-run
\`\`\`

6. If the call fails, patch the local file and retry:

\`\`\`bash
tcap retry runs/<run-id>
\`\`\`

## Safety

- Do not print or commit private MCP URLs, tokens, API keys, user IDs, or document IDs.
- Keep generated profiles and run artifacts local unless reviewed.
- Use \`TOOLCAPSULE_DEBUG=1\` only when debugging; normal transport logs are quiet by default.
- Prefer \`--brief\` and \`schema\` before reading full MCP schemas.

## When to use

Use ToolCapsule for MCP servers with:

- many tools;
- long schemas;
- large Markdown/JSON payloads;
- document, ticket, wiki, dashboard, or batch workflows;
- failures that benefit from patching local artifacts instead of regenerating a full tool call.
`;

export async function installAgentSkill(outputDir = ".github/skills/toolcapsule"): Promise<string> {
  await mkdir(outputDir, { recursive: true });
  await writeFile(join(outputDir, "SKILL.md"), agentSkill);
  return outputDir;
}
