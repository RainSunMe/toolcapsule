import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import Handlebars from "handlebars";
import type { ProfileConfig } from "../types.js";
import { writeJson } from "../utils/fs.js";

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
toolcapsule retry <run-dir>
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
};

export async function generateSkill(profile: ProfileConfig, opts: GenerateSkillOptions = {}): Promise<string> {
  const skillName = profile.skill?.name || `${profile.name}-mcp`;
  const outputDir = opts.outputDir || join(".github", "skills", skillName);
  await mkdir(join(outputDir, "scripts"), { recursive: true });
  await mkdir(join(outputDir, "runs"), { recursive: true });

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

export async function writeProfile(path: string, profile: ProfileConfig): Promise<void> {
  await mkdir(dirname(path), { recursive: true });
  await writeJson(path, profile);
}
