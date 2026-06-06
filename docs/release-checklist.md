# Release checklist

Before publishing v0.1.0:

- [ ] Create the GitHub repository.
- [ ] Replace any remaining placeholder links.
- [ ] Confirm the npm package name `toolcapsule` is available, or choose a scoped package.
- [ ] Connect the repository to Vercel.
- [ ] Point `toolcapsule.studio` to Vercel.
- [ ] Enable GitHub Discussions.
- [ ] Add `NPM_TOKEN` or configure npm trusted publishing.
- [ ] Review the security model for local command execution.
- [ ] Run `pnpm run ci`.
- [ ] Run CLI smoke tests with a mock MCP server.
- [ ] Tag `v0.1.0-alpha.0` or publish manually with `pnpm publish --access public`.
