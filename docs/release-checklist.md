# Release checklist

Before publishing v0.2.0:

- [x] Run `pnpm run ci` (typecheck + lint + test + build).
- [x] Smoke test with a real remote MCP server (Feishu).
- [x] Test @file-based `tcap call` with /tmp args.
- [x] Verify OAuth detection and auth guidance output.
- [x] Verify Skills directory layout and content.
- [x] Scan for leaked secrets or hardcoded tokens.
- [x] Update README, website, docs, llms.txt.
- [ ] Tag `v0.2.0` and push.
- [ ] Publish to npm (`pnpm publish --access public`).
- [ ] Verify `npm install -g toolcapsule` works.
- [ ] Verify `npx skills add RainSunMe/toolcapsule --skill toolcapsule` works.
