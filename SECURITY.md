# Security Policy

## Reporting vulnerabilities

Please report security issues privately via GitHub Security Advisories once the repository is public.

## Secret handling

Do not paste API keys, OAuth tokens, `.env` files, or private MCP URLs into issues or pull requests.

ToolCapsule should avoid printing secrets and should store run artifacts locally by default.
Transport stderr is silent by default because upstream MCP adapters may print full remote URLs. Use `TOOLCAPSULE_DEBUG=1` only when debugging; ToolCapsule redacts common token patterns before printing debug transport logs.
