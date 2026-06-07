#!/usr/bin/env node
import { readFile } from "node:fs/promises";
import { cac } from "cac";
import pc from "picocolors";
import type { ProfileConfig, SnapshotProfileConfig } from "./types.js";
import { disableNativeMcp, disableToolCapsuleProfile, formatInventory, listMcpInventory } from "./mcp/inventory.js";
import { McpClient } from "./mcp/client.js";
import { discoverMcpServers, linkedProfileForImportedServer, selectImportedServers } from "./mcp/importer.js";
import { userProfilePath, workspaceProfilePath, workspaceRunBaseDir } from "./paths.js";
import { loadProfile } from "./profile.js";
import { briefTools } from "./schema/brief.js";
import { summarizeTool, summarizeTools } from "./schema/summarize.js";
import { defaultSkillTarget, fetchProfileTools, generateSkill, type SkillTarget, writeProfile } from "./skill/generator.js";
import { installAgentSkill } from "./skill/installer.js";
import { createRunId, loadRun, saveRun } from "./runs/recorder.js";
import { writeFile } from "node:fs/promises";
import { ensureToolCapsuleIgnored, readJson } from "./utils/fs.js";
import { percentReduction, roughTokens } from "./utils/tokens.js";

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

async function withClient<T>(profile: SnapshotProfileConfig, fn: (client: McpClient) => Promise<T>): Promise<T> {
  const client = new McpClient(profile, { clientVersion: packageVersion });
  try {
    await client.init();
    return await fn(client);
  } finally {
    await client.close();
  }
}

function readArgsPath(raw: string): string {
  return raw.startsWith("@") ? raw.slice(1) : raw;
}

function readSkillTarget(raw: string | undefined): SkillTarget {
  const target = raw || defaultSkillTarget;
  if (["copilot", "claude", "opencode", "agents", "all"].includes(target)) return target as SkillTarget;
  throw new Error("Invalid --target. Use one of: copilot, claude, opencode, agents, all");
}

function renameSnapshotProfile(profile: SnapshotProfileConfig, name: string): SnapshotProfileConfig {
  return { ...profile, name };
}

async function writeImportedServer(
  server: Awaited<ReturnType<typeof discoverMcpServers>>[number],
  opts: { as?: string | undefined; local?: boolean | undefined; copy?: boolean | undefined; target?: string | undefined },
): Promise<void> {
  const profileName = opts.as || server.name;
  const local = opts.local === true;
  const copy = opts.copy === true;
  const profilePath = local ? workspaceProfilePath(profileName) : userProfilePath(profileName);
  if (local) await ensureToolCapsuleIgnored();
  const profile = copy ? renameSnapshotProfile(server.profile, profileName) : linkedProfileForImportedServer(server, profileName);
  await writeProfile(profilePath, profile);
  const tools = await fetchProfileTools(renameSnapshotProfile(server.profile, profileName), { clientVersion: packageVersion });
  const skillOptions = { target: readSkillTarget(opts.target), embedProfile: local, ...(tools ? { tools } : {}) };
  const out = await generateSkill(profile, skillOptions);
  const mode = copy ? "snapshot" : "linked";
  console.log(pc.green(`Imported ${server.name} as ${profileName} from ${server.source.path} -> ${profilePath} (${mode}), ${out}`));
  for (const warning of server.warnings) console.log(pc.yellow(`  warning: ${warning}`));
}

cli
  .command("init <name>", "Create a profile and generated Agent Skill for an MCP server")
  .option("--url <url>", "Remote MCP URL")
  .option("--command <command>", "stdio MCP command")
  .option("--arg <arg>", "stdio MCP argument, repeatable", { type: [String] })
  .option("--output <dir>", "Skill output directory")
  .option("--target <target>", "Skill target: copilot, claude, opencode, agents, all", { default: defaultSkillTarget })
  .option("--local", "Store the MCP profile in this workspace instead of ~/.toolcapsule")
  .action(async (name: string, options: { url?: string; command?: string; arg?: string[]; output?: string; target?: string; local?: boolean }) => {
    if (!options.url && !options.command) throw new Error("Provide --url for remote MCP or --command for stdio MCP");
    const local = options.local === true;
    const profile: ProfileConfig = options.url
      ? { name, transport: { type: "remote", url: options.url } }
      : { name, transport: { type: "stdio", command: options.command!, args: options.arg ?? [] } };
    const profilePath = local ? workspaceProfilePath(name) : userProfilePath(name);
    if (local) await ensureToolCapsuleIgnored();
    await writeProfile(profilePath, profile);
    const tools = await fetchProfileTools(profile, { clientVersion: packageVersion });
    const skillOptions = options.output
      ? { outputDir: options.output, embedProfile: local, ...(tools ? { tools } : {}) }
      : { target: readSkillTarget(options.target), embedProfile: local, ...(tools ? { tools } : {}) };
    const out = await generateSkill(
      profile,
      skillOptions,
    );
    console.log(pc.green(`Created profile at ${profilePath} and skill at ${out}`));
  });

cli
  .command("install-skill", "Install the generic ToolCapsule Agent Skill into this workspace")
  .option("--output <dir>", "Skill output directory")
  .option("--target <target>", "Skill target: copilot, claude, opencode, agents, all", { default: defaultSkillTarget })
  .action(async (options: { output?: string; target?: string }) => {
    const out = await installAgentSkill(options.output, readSkillTarget(options.target));
    console.log(pc.green(`Installed ToolCapsule Agent Skill at ${out}`));
  });

cli
  .command("import", "Import existing MCP configuration into ToolCapsule profiles and skills")
  .option("--include-user", "Also inspect user-level MCP config files")
  .option("--name <name>", "Import only one MCP server by name")
  .option("--as <name>", "Store the imported server under a different ToolCapsule profile name")
  .option("--all", "Import all discovered MCP servers")
  .option("--target <target>", "Skill target: copilot, claude, opencode, agents, all", { default: defaultSkillTarget })
  .option("--local", "Store imported MCP profiles in this workspace instead of ~/.toolcapsule")
  .option("--copy", "Copy MCP transport details into a ToolCapsule snapshot instead of linking the source config")
  .option("--dry-run", "List importable MCP servers without writing files")
  .action(
    async (options: { includeUser?: boolean; name?: string; as?: string; all?: boolean; target?: string; local?: boolean; copy?: boolean; dryRun?: boolean }) => {
      const local = options.local === true;
      const copy = options.copy === true;
      const discovered = await discoverMcpServers(options.includeUser ? { includeUser: true } : {});
      if (discovered.length === 0) {
        console.log("No importable MCP servers found.");
        return;
      }

      if (options.dryRun) {
        for (const server of discovered) {
          console.log(`${server.name}\t${server.source.tool}\t${server.source.path}`);
          for (const warning of server.warnings) console.log(pc.yellow(`  warning: ${warning}`));
        }
        return;
      }

      const selected = selectImportedServers(discovered, options.name, options.all);
      if (selected.length === 0) {
        throw new Error("Multiple MCP servers found. Re-run with --dry-run, then pass --name <server> or --all.");
      }

      for (const server of selected) {
        await writeImportedServer(server, { as: options.as, local, copy, target: options.target });
      }
    },
  );

cli
  .command("mcp <action> [name]", "List, enable, or disable MCP servers")
  .option("--include-user", "Also inspect user-level MCP config files")
  .option("--json", "Print JSON output for list")
  .option("--as <name>", "Store an enabled server under a different ToolCapsule profile name")
  .option("--target <target>", "Skill target: copilot, claude, opencode, agents, all", { default: defaultSkillTarget })
  .option("--local", "Store ToolCapsule profile in this workspace")
  .option("--copy", "Copy MCP transport details into a ToolCapsule snapshot instead of linking source config")
  .option("--native", "For disable: disable the native MCP config instead of the ToolCapsule profile")
  .option("--yes", "Apply native disable changes; otherwise native disable is dry-run")
  .action(async (action: string, name: string | undefined, options: { includeUser?: boolean; json?: boolean; as?: string; target?: string; local?: boolean; copy?: boolean; native?: boolean; yes?: boolean }) => {
    if (action === "list") {
      const items = await listMcpInventory(options.includeUser ? { includeUser: true } : {});
      console.log(options.json ? JSON.stringify(items, null, 2) : formatInventory(items));
      return;
    }
    if (action === "enable") {
      if (!name) throw new Error("Usage: tcap mcp enable <server> [--as <profile>]");
      const discovered = await discoverMcpServers(options.includeUser ? { includeUser: true } : {});
      const selected = selectImportedServers(discovered, name, false);
      if (selected.length !== 1) throw new Error(`Expected one MCP server named ${name}; run tcap mcp list --include-user first.`);
      await writeImportedServer(selected[0]!, { as: options.as, local: options.local, copy: options.copy, target: options.target });
      return;
    }
    if (action === "disable") {
      if (!name) throw new Error("Usage: tcap mcp disable <profile|server>");
      const message = options.native
        ? await disableNativeMcp(name, { ...(options.includeUser ? { includeUser: true } : {}), dryRun: options.yes !== true })
        : await disableToolCapsuleProfile(name);
      console.log(message);
      return;
    }
    throw new Error("Unknown mcp action. Use: list, enable, disable");
  });

cli
  .command("tools <profile>", "List MCP tools")
  .option("--brief", "Print compact tool summaries")
  .option("--names", "Print tool names only")
  .option("--json", "Print raw JSON")
  .action(async (profileName: string, options: { brief?: boolean; names?: boolean; json?: boolean }) => {
    const profile = await loadProfile(profileName);
    const result = await withClient(profile, (client) => client.listTools());
    if (options.json) console.log(JSON.stringify(result, null, 2));
    else if (options.names) console.log(result.tools.map((tool) => tool.name).join("\n"));
    else console.log(briefTools(result.tools));
  });

cli
  .command("describe <profile> <tool>", "Describe one MCP tool")
  .option("--brief", "Print summarized schema instead of raw schema")
  .action(async (profileName: string, toolName: string, options: { brief?: boolean }) => {
    const profile = await loadProfile(profileName);
    const result = await withClient(profile, (client) => client.listTools());
    const tool = result.tools.find((item) => item.name === toolName);
    if (!tool) throw new Error(`Tool not found: ${toolName}`);
    console.log(JSON.stringify(options.brief ? summarizeTool(tool) : tool, null, 2));
  });

cli.command("schema <profile> <tool>", "Print a compact schema for one MCP tool").action(async (profileName: string, toolName: string) => {
  const profile = await loadProfile(profileName);
  const result = await withClient(profile, (client) => client.listTools());
  const tool = result.tools.find((item) => item.name === toolName);
  if (!tool) throw new Error(`Tool not found: ${toolName}`);
  console.log(JSON.stringify(summarizeTool(tool), null, 2));
});

cli
  .command("call <profile> <tool> <args>", "Call an MCP tool with JSON args or @args.json")
  .option("--save-run", "Save request, response, and command under .toolcapsule/runs/<profile>/")
  .action(async (profileName: string, toolName: string, argsRaw: string, options: { saveRun?: boolean }) => {
    const argsPath = readArgsPath(argsRaw);
    const toolArgs = argsRaw.startsWith("@") ? await readJson(argsPath) : JSON.parse(argsRaw);
    const profile = await loadProfile(profileName);
    const request = { name: toolName, arguments: toolArgs };
    const command = `toolcapsule call ${profileName} ${toolName} ${argsRaw}`;
    const runId = createRunId();
    try {
      const response = await withClient(profile, (client) => client.callTool(toolName, toolArgs));
      console.log(JSON.stringify(response, null, 2));
      if (options.saveRun) {
        await ensureToolCapsuleIgnored();
        const dir = await saveRun(workspaceRunBaseDir(profile.name), {
          id: runId,
          createdAt: new Date().toISOString(),
          profile: profile.name,
          tool: toolName,
          argsFile: argsPath,
          status: "success",
          command,
          request,
          response,
        });
        console.error(pc.green(`Saved run: ${dir}`));
      }
    } catch (error) {
      if (options.saveRun) {
        await ensureToolCapsuleIgnored();
        const dir = await saveRun(workspaceRunBaseDir(profile.name), {
          id: runId,
          createdAt: new Date().toISOString(),
          profile: profile.name,
          tool: toolName,
          argsFile: argsPath,
          status: "error",
          command,
          request,
          error: error instanceof Error ? error.message : String(error),
        });
        console.error(pc.yellow(`Saved failed run: ${dir}`));
      }
      throw error;
    }
  });

cli.command("retry <runDir>", "Retry a saved run, re-reading the args file").action(async (runDir: string) => {
  const run = await loadRun(runDir);
  const toolArgs = await readJson(run.argsFile);
  const profile = await loadProfile(run.profile);
  const response = await withClient(profile, (client) => client.callTool(run.tool, toolArgs));
  console.log(JSON.stringify(response, null, 2));
});

cli.command("summarize <profile>", "Summarize all tools into compact JSON").action(async (profileName: string) => {
  const profile = await loadProfile(profileName);
  const result = await withClient(profile, (client) => client.listTools());
  console.log(JSON.stringify(summarizeTools(result.tools), null, 2));
});

cli
  .command("benchmark <profile>", "Estimate schema savings for a profile")
  .option("--markdown", "Print a Markdown report")
  .option("--out <file>", "Write report to a file")
  .action(async (profileName: string, options: { markdown?: boolean; out?: string }) => {
  const profile = await loadProfile(profileName);
  const result = await withClient(profile, (client) => client.listTools());
  const nativeTokens = roughTokens(result);
  const brief = summarizeTools(result.tools);
  const briefTokens = roughTokens(brief);
  const summary = {
    profile: profileName,
    tools: result.tools.length,
    nativeToolsRoughTokens: nativeTokens,
    summarizedToolsRoughTokens: briefTokens,
    estimatedReductionPct: Number(percentReduction(nativeTokens, briefTokens).toFixed(2)),
  };
  const output = options.markdown
    ? `# ToolCapsule benchmark: ${profileName}\n\n| Metric | Value |\n|---|---:|\n| MCP tools | ${summary.tools} |\n| Native MCP schema rough tokens | ${summary.nativeToolsRoughTokens} |\n| ToolCapsule summary rough tokens | ${summary.summarizedToolsRoughTokens} |\n| Estimated reduction | ${summary.estimatedReductionPct}% |\n\n> Rough tokens are estimated from serialized schema length. Use this report to compare schema footprint before and after capsule summaries.\n`
    : JSON.stringify(summary, null, 2);
  if (options.out) await writeFile(options.out, output);
  console.log(output);
});

cli.command("render-readme", "Print website hero copy snippets").action(async () => {
  console.log(await readFile(new URL("../docs/hero-copy.md", import.meta.url), "utf8"));
});

cli.help();
cli.version(packageVersion);

try {
  cli.parse();
} catch (error) {
  console.error(pc.red(error instanceof Error ? error.message : String(error)));
  process.exit(1);
}
