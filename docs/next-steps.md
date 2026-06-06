# Next Steps

ToolCapsule has reached a public alpha loop: GitHub repository, Vercel site, npm package, release workflow, and project skill are in place.

The public positioning is now: MCP-to-Skill for heavy MCP tools. Keep future docs, demos, and releases aligned with lazy MCP, lazy-loaded Agent Skills, and Agent Skills for MCP search intent.

This document tracks what should happen next.

## 1. Immediate follow-up

### 1.1 Wait for custom domain HTTPS

Check:

```bash
curl -I https://toolcapsule.studio
```

Target:

```text
HTTP/2 200
server: Vercel
```

If HTTPS is unstable shortly after domain purchase, wait for registry, DNS, and Vercel certificate propagation.

### 1.2 Check the npm package page

Package:

```text
https://www.npmjs.com/package/toolcapsule
```

Verify:

- README renders correctly.
- Install command is clear.
- `toolcapsule` and `tcap` binaries are listed.
- Homepage points to `https://toolcapsule.studio`.

### 1.3 Improve the GitHub Release note

Release:

```text
https://github.com/RainSunMe/toolcapsule/releases/tag/v0.1.0-alpha.0
```

Add a better release note with:

- What ToolCapsule is.
- Install command.
- Highlights.
- Known limitations.

## 2. Product usability

### 2.0 Fast MCP import

Initial support exists:

```bash
tcap import --dry-run
tcap import --name <server> --target claude
tcap import --all --target all
```

Next improvements:

- Add clearer per-tool import summaries in CLI output.
- Add support for more user-level config locations after explicit confirmation.
- Add integration tests with fixture config files for Claude Code, VS Code, OpenCode, Gemini CLI, and Cursor.
- Document security behavior around `headers`, `env`, and user-level configs.
- Consider an interactive mode that prompts users to pick a server when multiple MCP servers are found.

### 2.1 Build a real Feishu demo

The Feishu example should become a complete demo:

```text
examples/feishu/
  README.md
  create-doc.args.json
  update-doc.args.json
  demo.md
  screenshots/
```

The demo should show:

```bash
tcap init feishu --url ...
tcap tools feishu --brief
tcap call feishu create-doc @create-doc.args.json --save-run
tcap retry runs/...
```

Goal: a new user should understand MCP-to-Skill → file-first call → patch-and-retry in one example.

### 2.2 Add shortcuts

Current form:

```bash
tcap call feishu create-doc @args.json
```

Future forms:

```bash
tcap shortcut create-doc --title "..." --markdown-file doc.md
```

or:

```bash
tcap run feishu:create-doc --title "..." --file doc.md
```

Shortcuts are important for turning ToolCapsule from a generic MCP wrapper into a workflow tool.

### 2.3 Improve schema summaries

Current `--brief` summaries are basic.

Future command:

```bash
tcap schema feishu create-doc --brief
```

Expected output:

```text
required:
- title: string
- markdown: string

optional:
- wiki_node
- folder_token

warnings:
- do not fabricate IDs
- use search-user before mention
```

This directly supports the core promise: keep heavy MCP schemas out of the prompt.

### 2.4 Improve benchmark output

Current command:

```bash
tcap benchmark <profile>
```

Future output should include:

```text
Native MCP schema tokens: 4,224
ToolCapsule brief tokens: 142
Estimated reduction: 96.6%
```

It should also generate:

```text
toolcapsule-report.md
```

Goal: users can measure context savings on their own MCP server.

## 3. Open-source infrastructure

### 3.1 Add Changesets

Recommended:

```bash
pnpm add -D @changesets/cli
pnpm changeset init
```

This will standardize version bumps and changelog updates.

### 3.2 Add README badges

Add badges for:

- npm version;
- CI status;
- license;
- GitHub stars.

### 3.3 Harden SECURITY docs

Because ToolCapsule can call tools, store artifacts, and connect to MCP servers, clarify:

- Do not commit secrets.
- Run artifacts may contain sensitive data.
- `/runs/` is ignored by default.
- Generated files should be reviewed before sharing.
- Enterprise users should audit local artifacts.

## 4. Growth and launch

### 4.1 Write a launch blog post

Suggested title:

```text
Your MCP tools are eating your context window
```

Suggested structure:

1. MCP is great.
2. Heavy MCP tools are expensive.
3. Skills are the lazy-loading layer.
4. ToolCapsule = file-first MCP workflows.
5. Patch-and-retry.
6. Benchmark: 88.4% fewer input tokens.
7. Install.

### 4.2 Create a comparison graphic

Core diagram:

```text
Native MCP:
Prompt + full tools schema + user message

ToolCapsule:
Prompt + compact Skill + args.json
```

Add the headline:

```text
88.4% fewer input tokens
```

### 4.3 Launch channels

Suggested order:

1. GitHub README polish.
2. npm alpha.
3. Stable website.
4. X / Twitter.
5. Hacker News.
6. Reddit r/LocalLLaMA.
7. MCP / Claude Code / Cursor communities.
8. Chinese channels: V2EX, Jike, Juejin.

## 5. Suggested priority

### Next session

1. Wait for `toolcapsule.studio` HTTPS to stabilize.
2. Add README badges.
3. Improve GitHub Release note.
4. Build the Feishu demo.
5. Add Changesets.

### First week

1. Improve `benchmark`.
2. Build schema summary command.
3. Add shortcut system.
4. Write launch blog.
5. Prepare first public announcement.

### v0.2 goal

```text
ToolCapsule is usable by someone who has never seen the original conversation.
```

To reach that:

- one clear demo;
- one complete MCP → Skill → call → retry flow;
- one benchmark report;
- stronger README;
- stronger docs.

## 6. Most important next task

If only one thing can be done next, do this:

> Build a real Feishu demo with a README and screenshots/GIF.

The core concept is new. Users need to see the difference:

```text
Before: the model rewrites the entire tool call.
After: patch args.json, then run tcap retry.
```

That demo will explain ToolCapsule better than a long abstract description.
