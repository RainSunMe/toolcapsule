import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import Handlebars from "handlebars";
import { McpClient } from "../mcp/client.js";
import type { McpTool } from "../types.js";
import { summarizeTools } from "../schema/summarize.js";
import type { ProfileConfig } from "../types.js";
import { writeJson } from "../utils/fs.js";

export type SkillTarget = "copilot" | "claude" | "opencode" | "agents" | "all";

export const defaultSkillTarget: SkillTarget = "claude";

export function skillOutputDir(skillName: string, target: Exclude<SkillTarget, "all">): string {
  if (target === "copilot") return join(".github", "skills", skillName);
  if (target === "claude") return join(".claude", "skills", skillName);
  if (target === "opencode") return join(".opencode", "skills", skillName);
  return join(".agents", "skills", skillName);
}

export function expandSkillTargets(target: SkillTarget): Exclude<SkillTarget, "all">[] {
  return target === "all" ? ["copilot", "claude", "opencode", "agents"] : [target];
}

const skillTemplate = `---
name: {{skillName}}
description: '{{description}}'
argument-hint: 'MCP task, tool name, or args file to run'
---

# {{title}}

This skill wraps an MCP server as a lightweight, lazy-loaded, file-first workflow.

## Why use this skill

- Keep full MCP tool schemas out of the model context until needed.
- Use brief tool summaries for everyday work.
- Store large payloads in local files such as \`args.json\` or \`content.md\`.
- Patch local artifacts and retry failed calls deterministically.

## Commands

\`\`\`bash
toolcapsule tools {{profileName}} --brief
toolcapsule describe {{profileName}} <tool>
toolcapsule call {{profileName}} <tool> @args.json
toolcapsule retry .toolcapsule/runs/{{profileName}}/<run-id>
\`\`\`

{{#if toolsMarkdown}}
## Tool summary

Use this summary for planning. Only run \`toolcapsule schema {{profileName}} <tool>\` when these brief details are insufficient.

{{{toolsMarkdown}}}
{{else}}
## Tool discovery

Run \`toolcapsule tools {{profileName}} --brief\` once before choosing a tool. Then run \`toolcapsule schema {{profileName}} <tool>\` only when the brief summary is insufficient.
{{/if}}

## Workflow

1. Use \`tools --brief\` to find the likely tool.
2. Use \`describe <tool>\` only when the brief schema is insufficient.
3. Put complex arguments in a local JSON file.
4. Call with \`@args.json\` and save the run.
5. On failure, patch the local file and run \`retry\`.

## Safety

- Do not fabricate IDs, URLs, user IDs, or opaque tokens.
- Prefer local files for large payloads.
- Do not print secrets.
- Review destructive tools before calling.
`;

export type GenerateSkillOptions = {
  outputDir?: string;
  target?: SkillTarget;
  embedProfile?: boolean;
  tools?: McpTool[];
};

type ToolSummary = {
  name?: string;
  description?: string;
  required?: unknown;
  annotations?: { readOnlyHint?: boolean; destructiveHint?: boolean };
};

function toolsMarkdown(tools: McpTool[] | undefined): string | undefined {
  if (!tools || tools.length === 0) return undefined;
  const summaries = summarizeTools(tools) as ToolSummary[];
  const rows = summaries.slice(0, 40).map((tool) => {
    const required = Array.isArray(tool.required) && tool.required.length > 0 ? tool.required.join(", ") : "-";
    const risk = tool.annotations?.destructiveHint ? "writes" : tool.annotations?.readOnlyHint ? "read" : "unknown";
    const description = (tool.description || "-").replace(/\|/g, "\\|").slice(0, 120);
    return `| \`${tool.name || "unknown"}\` | ${description} | ${required} | ${risk} |`;
  });
  return ["| Tool | Purpose | Required args | Risk |", "|---|---|---|---|", ...rows].join("\n");
}

export async function fetchProfileTools(profile: ProfileConfig, opts: { clientVersion?: string } = {}): Promise<McpTool[] | undefined> {
  if (profile.kind === "linked") return undefined;
  const client = new McpClient(profile, { ...(opts.clientVersion ? { clientVersion: opts.clientVersion } : {}), timeoutMs: 15000 });
  try {
    await client.init();
    return (await client.listTools()).tools;
  } catch {
    return undefined;
  } finally {
    await client.close().catch(() => undefined);
  }
}

async function generateSkillAt(profile: ProfileConfig, outputDir: string, opts: { embedProfile?: boolean; tools?: McpTool[] } = {}): Promise<string> {
  const skillName = profile.skill?.name || `${profile.name}-mcp`;
  await mkdir(join(outputDir, "scripts"), { recursive: true });

  const template = Handlebars.compile(skillTemplate);
  const description =
    profile.skill?.description ||
    `Use when operating tools from the ${profile.name} MCP server. Lazy-load schemas, call tools through local files, and retry failed calls by patching artifacts.`;
  const markdown = template({
    skillName,
    profileName: profile.name,
    title: `${profile.name} MCP Skill`,
    description: description.replace(/'/g, "''"),
    toolsMarkdown: toolsMarkdown(opts.tools),
  });
  await writeFile(join(outputDir, "SKILL.md"), markdown);
  if (opts.embedProfile) await writeJson(join(outputDir, "toolcapsule.config.json"), profile);
  await writeFile(
    join(outputDir, "scripts", "README.md"),
    `# Scripts\n\nThis skill uses the \`toolcapsule\` CLI and profiles resolved by name.\n`,
  );
  return outputDir;
}

export async function generateSkill(profile: ProfileConfig, opts: GenerateSkillOptions = {}): Promise<string> {
  const skillName = profile.skill?.name || `${profile.name}-mcp`;
  const target = opts.target || defaultSkillTarget;
  const embedProfile = opts.embedProfile === true;
  const atOptions = { embedProfile, ...(opts.tools ? { tools: opts.tools } : {}) };
  const outputs = opts.outputDir
    ? [await generateSkillAt(profile, opts.outputDir, atOptions)]
    : await Promise.all(
        expandSkillTargets(target).map((item) =>
          generateSkillAt(profile, skillOutputDir(skillName, item), atOptions),
        ),
      );
  return outputs.join(", ");
}

export async function writeProfile(path: string, profile: ProfileConfig): Promise<void> {
  await mkdir(dirname(path), { recursive: true });
  await writeJson(path, profile);
}
