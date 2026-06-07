import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import Handlebars from "handlebars";
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
};

async function generateSkillAt(profile: ProfileConfig, outputDir: string): Promise<string> {
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
  });
  await writeFile(join(outputDir, "SKILL.md"), markdown);
  await writeJson(join(outputDir, "toolcapsule.config.json"), profile);
  await writeFile(
    join(outputDir, "scripts", "README.md"),
    `# Scripts\n\nThis skill uses the project-level \`toolcapsule\` CLI.\n`,
  );
  return outputDir;
}

export async function generateSkill(profile: ProfileConfig, opts: GenerateSkillOptions = {}): Promise<string> {
  const skillName = profile.skill?.name || `${profile.name}-mcp`;
  const target = opts.target || defaultSkillTarget;
  const outputs = opts.outputDir
    ? [await generateSkillAt(profile, opts.outputDir)]
    : await Promise.all(expandSkillTargets(target).map((item) => generateSkillAt(profile, skillOutputDir(skillName, item))));
  return outputs.join(", ");
}

export async function writeProfile(path: string, profile: ProfileConfig): Promise<void> {
  await mkdir(dirname(path), { recursive: true });
  await writeJson(path, profile);
}
