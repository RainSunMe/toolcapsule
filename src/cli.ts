#!/usr/bin/env node
import { readFile } from "node:fs/promises";
import { cac } from "cac";
import pc from "picocolors";
import type { ProfileConfig } from "./types.js";
import { McpClient } from "./mcp/client.js";
import { profilePath } from "./paths.js";
import { loadProfile } from "./profile.js";
import { briefTools } from "./schema/brief.js";
import { summarizeTool } from "./schema/summarize.js";
import { defaultSkillTarget, fetchProfileTools, generateSkill, type AuthInfo, type GenerateSkillOptions, type SkillTarget, writeProfile } from "./skill/generator.js";
import { readJson } from "./utils/fs.js";

const cli = cac("toolcapsule");

async function readPackageVersion(): Promise<string> {
  try {
    const pkg = JSON.parse(await readFile(new URL("../package.json", import.meta.url), "utf8")) as { version?: string };
    return pkg.version || "0.0.0";
  } catch {
    return "0.0.0";
  }
}

const packageVersion = await readPackageVersion();

async function withClient<T>(profile: ProfileConfig, fn: (client: McpClient) => Promise<T>): Promise<T> {
  const client = new McpClient(profile, { clientVersion: packageVersion });
  try {
    await client.init();
    return await fn(client);
  } finally {
    await client.close();
  }
}

function readSkillTarget(raw: string | undefined): SkillTarget {
  const target = raw || defaultSkillTarget;
  if (["copilot", "claude", "opencode", "agents", "all"].includes(target)) return target as SkillTarget;
  throw new Error("Invalid --target. Use one of: copilot, claude, opencode, agents, all");
}

function printAuthGuidance(profileName: string, auth: AuthInfo): void {
  const profilePath = `~/.toolcapsule/profiles/${profileName}.json`;

  console.log(pc.yellow(`\n⚠️  Authentication required (HTTP ${auth.status}).`));

  if (auth.oauthAuthorizationUrl) {
    console.log(pc.dim(`\n  This MCP server supports OAuth. To authenticate:`));
    console.log(pc.dim(`  → Open: ${auth.oauthAuthorizationUrl}`));
    console.log(pc.dim(`  → Authorize, then re-run: tcap init ${profileName} --url <url>`));
  } else {
    console.log(pc.dim(`\n  This MCP server likely requires a static token or API key.`));
    console.log(pc.dim(`  → Visit ${auth.serverUrl} for API key / token instructions.`));
    console.log(pc.dim(`  → Edit ${profilePath}:`));
    console.log(pc.cyan(`    "headers": { "Authorization": "Bearer <token>" }`));
    console.log(pc.dim(`  → Then re-run: tcap tools ${profileName}`));
  }

  console.log(pc.dim(`\n  Profile file: ${profilePath}`));
  console.log();
}

// ── init ──

cli
  .command("init <name>", "Register an MCP server and generate an Agent Skill")
  .option("--url <url>", "Remote MCP URL")
  .option("--command <command>", "stdio MCP command")
  .option("--arg <arg>", "stdio MCP argument (repeatable)", { type: [String] })
  .option("--output <dir>", "Skill output directory")
  .option("--target <target>", "Skill target: copilot, claude, opencode, agents, all", { default: defaultSkillTarget })
  .action(async (name: string, options: { url?: string; command?: string; arg?: string[]; output?: string; target?: string }) => {
    if (!options.url && !options.command) throw new Error("Provide --url for remote MCP or --command for stdio MCP.");

    const profile: ProfileConfig = options.url
      ? { name, transport: { type: "remote", url: options.url } }
      : { name, transport: { type: "stdio", command: options.command!, args: options.arg ?? [] } };

    const path = profilePath(name);
    await writeProfile(path, profile);
    console.log(pc.dim(`Profile: ${path}`));

    const result = await fetchProfileTools(profile, { clientVersion: packageVersion });
    if (result.tools) {
      console.log(pc.dim(`Tools: ${result.tools.length} loaded from MCP server`));
    } else if (result.auth) {
      printAuthGuidance(name, result.auth);
    } else {
      console.log(pc.yellow("Warning: Could not fetch tools from MCP server. Skill generated without tool list."));
    }

    const skillOpts: GenerateSkillOptions = { target: readSkillTarget(options.target) };
    if (result.tools) skillOpts.tools = result.tools;
    if (options.output) skillOpts.outputDir = options.output;
    const out = await generateSkill(name, skillOpts);
    console.log(pc.green(`Skill: ${out}`));
  });

// ── call ──

cli
  .command("call <profile> <tool> <args>", "Call an MCP tool with inline JSON or @file")
  .action(async (profileName: string, toolName: string, argsRaw: string) => {
    const toolArgs = argsRaw.startsWith("@")
      ? await readJson(argsRaw.slice(1))
      : JSON.parse(argsRaw);
    const profile = await loadProfile(profileName);
    const response = await withClient(profile, (client) => client.callTool(toolName, toolArgs));
    console.log(JSON.stringify(response, null, 2));
  });

// ── tools ──

cli
  .command("tools <profile>", "List MCP tools for a profile")
  .option("--brief", "Compact one-line summaries")
  .option("--names", "Tool names only")
  .option("--json", "Raw JSON output")
  .action(async (profileName: string, options: { brief?: boolean; names?: boolean; json?: boolean }) => {
    const profile = await loadProfile(profileName);
    const result = await withClient(profile, (client) => client.listTools());
    if (options.json) console.log(JSON.stringify(result, null, 2));
    else if (options.names) console.log(result.tools.map((tool) => tool.name).join("\n"));
    else console.log(briefTools(result.tools));
  });

// ── schema ──

cli.command("schema <profile> <tool>", "Print compact schema for one MCP tool").action(async (profileName: string, toolName: string) => {
  const profile = await loadProfile(profileName);
  const result = await withClient(profile, (client) => client.listTools());
  const tool = result.tools.find((item) => item.name === toolName);
  if (!tool) throw new Error(`Tool not found: ${toolName}`);
  console.log(JSON.stringify(summarizeTool(tool), null, 2));
});

// ── run ──

cli.help();
cli.version(packageVersion);

try {
  cli.parse();
} catch (error) {
  console.error(pc.red(error instanceof Error ? error.message : String(error)));
  process.exit(1);
}

// ── init ──

cli
  .command("init <name>", "Register an MCP server and generate an Agent Skill")
  .option("--url <url>", "Remote MCP URL")
  .option("--command <command>", "stdio MCP command")
  .option("--arg <arg>", "stdio MCP argument (repeatable)", { type: [String] })
  .option("--output <dir>", "Skill output directory")
  .option("--target <target>", "Skill target: copilot, claude, opencode, agents, all", { default: defaultSkillTarget })

cli.help();
cli.version(packageVersion);

try {
  cli.parse();
} catch (error) {
  console.error(pc.red(error instanceof Error ? error.message : String(error)));
  process.exit(1);
}
