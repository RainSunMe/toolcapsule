# Changelog

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
