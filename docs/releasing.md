# Releasing

ToolCapsule uses npm Trusted Publishing and GitHub Releases.

## One-time setup

On npm, configure Trusted Publishing for the `toolcapsule` package:

- Repository: `RainSunMe/toolcapsule`
- Workflow: `release.yml`
- Environment: `npm`

On GitHub, create an Environment named `npm`.

## Release steps

1. Create a changeset with `pnpm changeset` for normal changes, or update `package.json` / `CHANGELOG.md` manually for urgent alpha releases.
2. Ensure `CHANGELOG.md` describes the release.
3. Commit and push to `main`.
4. Create and push a tag:

```bash
git tag v0.1.0-alpha.1
git push origin v0.1.0-alpha.1
```

The `Release` workflow will:

1. install dependencies;
2. verify the git tag matches `package.json`;
3. verify the npm version does not already exist;
4. run CI;
5. publish to npm with provenance through Trusted Publishing;
6. verify the npm package is available;
7. create a GitHub Release.

## Notes

- Do not use local `npm publish` for normal releases.
- Do not store `NPM_TOKEN` unless Trusted Publishing is unavailable.
- The workflow requires `permissions.id-token: write`.
- The GitHub Environment name must match npm Trusted Publishing exactly.
