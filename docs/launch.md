# Launch notes

## One-line pitch

MCP-to-Skill for heavy MCP tools.

## Short pitch

ToolCapsule turns schema-heavy MCP servers into lightweight, lazy-loaded Agent Skills with file-first calls and patch-and-retry recovery. If you are looking for lazy MCP, this is the workflow layer.

## Announcement draft

MCP is becoming the standard way to connect agents to tools. Skills are becoming the standard way to package repeatable agent workflows. ToolCapsule connects the two: MCP-to-Skill for heavy tools.

Large MCP servers can quietly eat your context window with long tool descriptions and schemas. ToolCapsule keeps MCP as the capability layer and turns heavy tools into compact, lazy-loaded Agent Skills. Large payloads live in files, every call can be recorded, and failed calls can be patched and retried without asking the model to regenerate everything.

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

Search angle:

> Lazy MCP, MCP to Skill, MCP-to-Skill, Agent Skills for MCP tools — all describe the workflow ToolCapsule implements.

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
6. Run `tcap retry .toolcapsule/runs/<profile>/<id>`.
7. Show success.
