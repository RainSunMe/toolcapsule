---
name: toolcapsule-release
description: 'Use when: developing, validating, publishing, deploying, or maintaining ToolCapsule; GitHub repo setup, Vercel deployment, npm Trusted Publishing, release tags, domain checks, Dependabot cleanup, CI failures, and launch workflow.'
argument-hint: 'Task: develop, validate, deploy, publish npm, release tag, check domain, fix CI, or cleanup PRs'
---

# ToolCapsule Development and Release Workflow

Use this skill for ToolCapsule maintenance, releases, and launch operations.

## Project Facts

- Repository: `https://github.com/RainSunMe/toolcapsule`
- Local path: `/home/yingbo/code/toolcapsule`
- Package name: `toolcapsule`
- CLI binaries:
  - `toolcapsule`
  - `tcap`
- Website domain: `https://toolcapsule.studio`
- Vercel fallback URL: `https://toolcapsule.vercel.app`
- Vercel project: `toolcapsule`
- npm package: `https://www.npmjs.com/package/toolcapsule`
- Current initial published version: `0.1.0-alpha.0`
- GitHub Environment for Trusted Publishing: `npm`

## Core Positioning

ToolCapsule is not merely "MCP as Skill". Use this positioning:

> Heavy MCP tools don't belong in your prompt. Put them in a ToolCapsule.

Full description:

> ToolCapsule turns schema-heavy MCP servers into lightweight, lazy-loaded Agent Skills with file-first calls and patch-and-retry recovery.

Keep MCP and Skill prominent in README, website, npm description, topics, and launch copy.

## Golden Rules

- Keep this project independent from `mify-prism`.
- Do not commit secrets, `.env`, Vercel local auth files, npm tokens, or private MCP endpoints.
- Do not publish the same npm version twice.
- Do not tag a version before `package.json` has been bumped and committed.
- Always run CI locally before publishing or pushing release changes.
- Keep `tcap` as a short alias, but avoid `tc` because it conflicts with Linux traffic control and npm `tc`.
- Use npm Trusted Publishing, not `NPM_TOKEN`, unless explicitly changing the release model.

## Standard Validation

Run before any push/release:

```bash
cd /home/yingbo/code/toolcapsule
corepack pnpm run ci
node dist/cli.js --help
```

Expected:

- TypeScript check passes.
- ESLint passes.
- Vitest passes.
- tsup build succeeds.
- CLI help prints `toolcapsule/0.1.0-alpha.*`.

For npm package validation:

```bash
npm pack --dry-run
```

For installed binary validation after publish:

```bash
rm -rf /tmp/toolcapsule-final-check
mkdir /tmp/toolcapsule-final-check
cd /tmp/toolcapsule-final-check
npm init -y >/dev/null
npm install toolcapsule@<version> >/dev/null
./node_modules/.bin/toolcapsule --help
./node_modules/.bin/tcap --help
```

## GitHub Workflow

### Check status

```bash
cd /home/yingbo/code/toolcapsule
git status --short
GH_PAGER=cat gh run list --branch main --limit 8
GH_PAGER=cat gh pr list --state open --json number,title,author,url --limit 20
```

### Normal commit/push

```bash
git add <files>
git commit -m "<message>"
git push
```

### GitHub repo metadata

Important topics:

- `mcp`
- `model-context-protocol`
- `agent-skills`
- `ai-agents`
- `llm-tools`
- `context-engineering`
- `typescript`
- `cli`

If metadata needs repair:

```bash
GH_PAGER=cat gh repo edit RainSunMe/toolcapsule \
  --homepage https://toolcapsule.studio \
  --add-topic mcp \
  --add-topic model-context-protocol \
  --add-topic agent-skills \
  --add-topic ai-agents \
  --add-topic llm-tools \
  --add-topic context-engineering \
  --add-topic typescript \
  --add-topic cli
```

## Vercel Workflow

Normal production deploys must go through GitHub push and Vercel Git Integration. Do not run `vercel --prod` for routine website updates.

Manual Vercel deploy is only an emergency fallback.

### Inspect deployment/domain

```bash
corepack pnpm exec vercel inspect toolcapsule.vercel.app
corepack pnpm exec vercel domains inspect toolcapsule.studio
curl -I --max-time 20 http://toolcapsule.studio || true
curl -I --max-time 20 https://toolcapsule.studio || true
```

### Domain facts

`toolcapsule.studio` is managed by a third-party registrar. Vercel expects:

```text
A @ 76.76.21.21
```

or equivalent:

```text
A toolcapsule.studio 76.76.21.21
```

If HTTPS fails shortly after domain purchase but HTTP works, wait for DNS/registry propagation and Vercel SSL issuance.

### GitHub Pages

ToolCapsule uses Vercel, not GitHub Pages. Do not re-add `.github/workflows/pages.yml` unless intentionally changing hosting.

## npm Trusted Publishing Release

Trusted Publishing setup:

- npm package: `toolcapsule`
- Repository: `RainSunMe/toolcapsule`
- Workflow: `release.yml`
- Environment: `npm`

GitHub Environment `npm` exists. If it needs repair:

```bash
printf '{"deployment_branch_policy":null}' | \
  GH_PAGER=cat gh api -X PUT repos/RainSunMe/toolcapsule/environments/npm --input -
```

### Release steps

1. Choose a new version. Never reuse a published version.
2. Update `package.json`.
3. Update `CHANGELOG.md`.
4. Run CI.
5. Commit and push.
6. Push a matching tag.

Example:

```bash
cd /home/yingbo/code/toolcapsule
npm version 0.1.0-alpha.1 --no-git-tag-version
# edit CHANGELOG.md
corepack pnpm run ci
git add package.json CHANGELOG.md
git commit -m "Release v0.1.0-alpha.1"
git push
git tag v0.1.0-alpha.1
git push origin v0.1.0-alpha.1
```

The `Release` workflow should:

- install dependencies;
- verify tag and package version match;
- verify the npm version is unpublished;
- run `pnpm run ci`;
- publish npm with `npm publish --provenance --access public`;
- verify npm publish;
- create a GitHub Release.

### Verify release

```bash
npm view toolcapsule@<version> name version dist-tags bin
GH_PAGER=cat gh release view v<version> --json url,tagName,name,isDraft,isPrerelease
```

Then test install:

```bash
rm -rf /tmp/toolcapsule-release-check
mkdir /tmp/toolcapsule-release-check
cd /tmp/toolcapsule-release-check
npm init -y >/dev/null
npm install toolcapsule@<version> >/dev/null
./node_modules/.bin/toolcapsule --help
./node_modules/.bin/tcap --help
```

## Dependabot PR Cleanup

Dependabot is configured to group updates:

- npm dependencies group;
- GitHub Actions group.

Before launch, it is acceptable to close noisy Dependabot PRs:

```bash
GH_PAGER=cat gh pr list --state open --json number,title,author,url --limit 20
GH_PAGER=cat gh pr close <number> --comment "Closing dependency updates for pre-launch cleanup."
```

Do not ignore real security advisories.

## Website Editing Guidelines

Current style target: Anthropic-like editorial warmth.

Use:

- warm paper background;
- restrained typography;
- low-saturation clay/sage accents;
- concise hero message;
- professional proof blocks;
- MCP and Skill keywords near the top.

Avoid:

- overly cyber/neon style;
- too many gradients;
- vague AI buzzwords;
- losing the MCP/Skill linkage.

After editing website:

```bash
corepack pnpm run ci
git add website/index.html website/style.css
git commit -m "<message>"
git push
corepack pnpm exec vercel --prod --yes
```

## Completion Checklist

A task is done when:

- local `corepack pnpm run ci` passes;
- relevant files are committed;
- changes are pushed to `main` or a PR;
- Vercel deploy succeeds for website changes;
- npm/GitHub release is verified for release tasks;
- open Dependabot PRs are not noisy for launch tasks;
- no secrets are printed or committed.
