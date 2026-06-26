# Launch notes

## One-line pitch

AI-first workflow manager for heavy MCP tools.

## Short pitch

ToolCapsule inventories existing MCPs, turns selected heavy servers into lazy Agent Skills, and keeps calls file-first with patch-and-retry recovery.

## Announcement draft

MCP is becoming the standard way to connect agents to tools. Skills are becoming the standard way to package repeatable agent workflows. ToolCapsule connects the two as an AI-first workflow manager for heavy MCP tools.

Large MCP servers can quietly eat your context window with long tool descriptions and schemas. ToolCapsule keeps MCP as the capability layer and turns heavy tools into compact, lazy-loaded Agent Skills. Large payloads live in files, every call can be recorded, and failed calls can be patched and retried without asking the model to regenerate everything.

Install:

```bash
npx skills add RainSunMe/toolcapsule --skill toolcapsule
```

Try:

```bash
npm i -g toolcapsule
tcap tools <profile>
tcap init <name> --url <url> --target claude
tcap tools feishu --brief
tcap call feishu create-doc @args.json 
```

New onboarding angle:

> Already have MCP configured in Claude Code, VS Code, OpenCode, Gemini CLI, or Cursor? ToolCapsule can import it and generate the right Agent Skill.

Search angle:

> Lazy MCP, MCP to Skill, MCP-to-Skill, Agent Skills for MCP tools — these are related search terms, but ToolCapsule is broader: inventory, enable, Skill generation, file-first calls, and patch-and-retry.

Short demo:

```bash
tcap tools <profile>
tcap init github --target all
```

## Suggested screenshot checklist

Ask a human/function-caller to capture:

1. Hero section at `https://toolcapsule.studio` or `https://toolcapsule.vercel.app`.
2. Terminal showing `tcap tools <profile>` finding existing MCP servers.
3. Terminal showing `tcap tools feishu --brief`.
4. Terminal showing a saved run directory.
5. Before/after graphic: native MCP schema in prompt vs ToolCapsule local artifacts.

## Suggested GIF flow

1. Run `tcap tools <profile>`.
2. Run `tcap init <name> --url <url> --target claude`.
3. Run `tcap call ... `.
4. Show failure or saved run artifacts.
5. Patch `args.json`.
6. Run `tcap call <profile> <tool> @/tmp/args.json
7. Show success.
