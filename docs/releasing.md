# Releasing

ToolCapsule uses npm Trusted Publishing and GitHub Releases.

## One-time setup

On npm, configure Trusted Publishing for the `toolcapsule` package:

- Repository: `RainSunMe/toolcapsule`
- Workflow: `release.yml`
- Environment: `npm`

On GitHub, create an Environment named `npm`.

## Release steps

1. Update `package.json` version.
2. Update `CHANGELOG.md`.
3. Commit and push to `main`.
4. Create and push a tag:

```bash
git tag v0.1.0-alpha.1
git push origin v0.1.0-alpha.1
```

The `Release` workflow will:

1. install dependencies;
2. run CI;
3. publish to npm with provenance through Trusted Publishing;
4. create a GitHub Release.

## Notes

- Do not store `NPM_TOKEN` unless Trusted Publishing is unavailable.
- The workflow requires `permissions.id-token: write`.
- The GitHub Environment name must match npm Trusted Publishing exactly.
