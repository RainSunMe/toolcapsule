# Launch notes

## One-line pitch

Heavy MCP tools don't belong in your prompt. Put them in a ToolCapsule.

## Short pitch

ToolCapsule turns schema-heavy MCP servers into lightweight, lazy-loaded Agent Skills with file-first calls and patch-and-retry recovery.

## Announcement draft

MCP is becoming the standard way to connect agents to tools. But large MCP servers can quietly eat your context window with long tool descriptions and schemas.

ToolCapsule keeps MCP as the capability layer and turns heavy tools into compact Agent Skills. Large payloads live in files, every call can be recorded, and failed calls can be patched and retried without asking the model to regenerate everything.

Install:

```bash
npm i -g toolcapsule
```

Try:

```bash
tcap import --dry-run
tcap import --name feishu --target claude
tcap tools feishu --brief
tcap call feishu create-doc @args.json --save-run
```

New onboarding angle:

> Already have MCP configured in Claude Code, VS Code, OpenCode, Gemini CLI, or Cursor? ToolCapsule can import it and generate the right Agent Skill.

Short demo:

```bash
tcap import --dry-run
tcap import --name github --target all
```

## Suggested screenshot checklist

Ask a human/function-caller to capture:

1. Hero section at `https://toolcapsule.studio` or `https://toolcapsule.vercel.app`.
2. Terminal showing `tcap import --dry-run` finding an existing MCP server.
3. Terminal showing `tcap tools feishu --brief`.
4. Terminal showing a saved run directory.
5. Before/after graphic: native MCP schema in prompt vs ToolCapsule local artifacts.

## Suggested GIF flow

1. Run `tcap import --dry-run`.
2. Run `tcap import --name ... --target claude`.
3. Run `tcap call ... --save-run`.
4. Show failure or saved run artifacts.
5. Patch `args.json`.
6. Run `tcap retry runs/<id>`.
7. Show success.
