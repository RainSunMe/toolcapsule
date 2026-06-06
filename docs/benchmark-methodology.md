# Benchmark methodology

A useful benchmark compares two modes with the same model, same prompts, and same scenarios.

## Native MCP mode

Every model call includes the complete MCP tool definitions.

## Skill mode

Every model call includes only compact Skill instructions and shortcut schemas.

## Metrics

- input tokens per turn;
- total input tokens;
- output tokens;
- latency;
- success rate;
- repeated schema reads;
- retry count.

## Interpretation

The benchmark estimates context savings. It does not automatically prove real tool-call success unless live tool execution is enabled.
