# Changelog

## 0.1.0-alpha.14

- Skip empty or invalid MCP config files during import and inventory discovery.
- Ignore local MCP workspace settings, generated agent skills, and generated skill lock state.

## 0.1.0-alpha.13

- Reposition ToolCapsule as an AI-first workflow manager for heavy MCP tools.
- Add comparison docs for native MCP, `lazy-mcp`, `mcp2skill`, and `mcp-to-skill` style workflows.
- Update README, website, launch copy, hero copy, and AI-facing docs to emphasize MCP inventory, linked profiles, file-first calls, and patch-and-retry.
- Clarify that `npx skills add toolcapsule` is not supported by the `skills` CLI today; use `npx skills add RainSunMe/toolcapsule --skill toolcapsule`.

## 0.1.0-alpha.12

- Add the official `toolcapsule` Skill under `skills/toolcapsule/` for `npx skills add RainSunMe/toolcapsule --skill toolcapsule` onboarding.
- Add `tcap mcp list`, `tcap mcp enable`, and `tcap mcp disable` for AI-friendly MCP inventory and control.
- Add `import --as`, linked profiles, snapshot profiles via `--copy`, and user-level profile storage under `~/.toolcapsule/profiles/`.
- Generate MCP-specific Skills with a tool summary table from `tools/list` to reduce follow-up list/schema steps.
- Expand MCP config discovery across workspace, user, VS Code server, Cursor, and managed Claude locations.
- Update README, website, docs, examples, and launch copy to the `npx skills add` plus `mcp list/enable` flow.

## 0.1.0-alpha.11

- Store saved run artifacts under `.toolcapsule/runs/<profile>/<run-id>/` instead of the workspace root.
- Automatically add `.toolcapsule/` to `.gitignore` when creating ToolCapsule workspace state.
- Stop generating unused `runs/` directories inside generated Agent Skill folders.
- Add a Chinese launch blog draft for ToolCapsule.
- Update docs, examples, and generated Skill copy for the new run artifact path.

## 0.1.0-alpha.10

- Reposition ToolCapsule as MCP-to-Skill for heavy MCP tools.
- Add SEO/search copy for lazy MCP, MCP to Skill, MCP-to-Skill, and Agent Skills for MCP.
- Update README, website, docs, examples, package metadata, and generated Skill template with consistent positioning.

## 0.1.0-alpha.9

- Add `tcap import` to convert existing MCP registrations into ToolCapsule profiles and Agent Skills.
- Add `--target` support for `claude`, `copilot`, `opencode`, `agents`, and `all`, with `claude` as the default skill target.
- Preserve string-valued imported MCP `headers`, `env` / `environment`, and `cwd` fields where possible.
- Add importer tests for VS Code, OpenCode, and multi-server selection flows.
- Add fast MCP import documentation and homepage copy.

## 0.1.0-alpha.0

- Initial alpha scaffold.

## 0.1.0-alpha.1

- Add `schema` command for compact single-tool summaries.
- Add Markdown benchmark report output with `--markdown` and `--out`.
- Add complete Feishu/Lark demo artifacts and launch notes.
- Add Changesets for future release management.
- Improve README badges and command examples.

## 0.1.0-alpha.2

- Fix CLI version reporting so `toolcapsule --version` and `tcap --version` match `package.json`.

## 0.1.0-alpha.3

- Silence MCP transport stderr by default to avoid leaking remote MCP URLs in normal command output.
- Add `TOOLCAPSULE_DEBUG=1` for redacted transport logs when debugging.
- Pass the current package version to MCP `clientInfo`.

## 0.1.0-alpha.4

- Add `tcap install-skill` to install a generic ToolCapsule Agent Skill into a workspace.
- Add `llms.txt` so AI agents can quickly learn how to install and use ToolCapsule.
- Add a generic stdio MCP example to show ToolCapsule is not Feishu-specific.
- Add screenshot and recording placeholders for launch assets.

## 0.1.0-alpha.5

- Harden release workflow for npm Trusted Publishing.
- Check tag/package version consistency before publish.
- Check npm version availability before publish.
- Verify npm publish inside the release workflow.

## 0.1.0-alpha.6

- Use Node 24 in the release workflow to satisfy npm Trusted Publishing requirements.
- Let npm Trusted Publishing generate provenance automatically during publish.

## 0.1.0-alpha.7

- Publish prerelease versions with the explicit `alpha` npm dist-tag.

## 0.1.0-alpha.8

- Retry npm publish verification to tolerate registry propagation delay.
