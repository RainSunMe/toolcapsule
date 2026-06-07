import { existsSync } from "node:fs";
import { mkdir, readFile, readdir, rename, writeFile } from "node:fs/promises";
import { homedir } from "node:os";
import { basename, dirname, join } from "node:path";
import pc from "picocolors";
import { discoverMcpServers, type ImportedMcpServer } from "./importer.js";
import { toolCapsuleHome, workspaceProfilePath } from "../paths.js";
import type { ProfileConfig } from "../types.js";
import { readJson, writeJson } from "../utils/fs.js";

export type InventoryItem = {
  name: string;
  status: "enabled" | "disabled" | "managed" | "error";
  scope: "workspace" | "user" | "managed";
  source: string;
  mode: "native" | "linked" | "snapshot";
  path: string;
  originalName?: string;
  warnings?: string[];
};

function sourceScope(server: ImportedMcpServer): "workspace" | "user" | "managed" {
  if (server.source.managed) return "managed";
  return server.source.userLevel ? "user" : "workspace";
}

function sourceStatus(server: ImportedMcpServer): "enabled" | "managed" {
  return server.source.managed ? "managed" : "enabled";
}

async function profileItems(dir: string, scope: "workspace" | "user"): Promise<InventoryItem[]> {
  if (!existsSync(dir)) return [];
  const entries = await readdir(dir, { withFileTypes: true });
  const items: InventoryItem[] = [];
  for (const entry of entries) {
    if (!entry.isFile() || !entry.name.endsWith(".json")) continue;
    const path = join(dir, entry.name);
    try {
      const profile = (await readJson(path)) as ProfileConfig;
      items.push({
        name: profile.name || basename(entry.name, ".json"),
        status: "enabled",
        scope,
        source: "toolcapsule",
        mode: profile.kind === "linked" ? "linked" : "snapshot",
        path,
      });
    } catch {
      items.push({ name: basename(entry.name, ".json"), status: "error", scope, source: "toolcapsule", mode: "snapshot", path });
    }
  }
  return items;
}

export async function listMcpInventory(opts: { includeUser?: boolean } = {}): Promise<InventoryItem[]> {
  const nativeServers = await discoverMcpServers(opts.includeUser ? { includeUser: true, includeManaged: true } : {});
  const nativeItems = nativeServers.map((server): InventoryItem => ({
    name: server.name,
    originalName: server.originalName,
    status: sourceStatus(server),
    scope: sourceScope(server),
    source: server.source.tool,
    mode: "native",
    path: server.source.path,
    warnings: server.warnings,
  }));
  const workspaceProfiles = await profileItems(join(".toolcapsule", "profiles"), "workspace");
  const userProfiles = await profileItems(join(toolCapsuleHome(), "profiles"), "user");
  return [...nativeItems, ...workspaceProfiles, ...userProfiles];
}

function colorStatus(status: InventoryItem["status"]): string {
  if (status === "enabled") return pc.green("● on");
  if (status === "disabled") return pc.gray("○ off");
  if (status === "managed") return pc.yellow("◆ managed");
  return pc.red("× error");
}

function colorMode(mode: InventoryItem["mode"]): string {
  if (mode === "linked") return pc.cyan(mode);
  if (mode === "snapshot") return pc.magenta(mode);
  return pc.gray(mode);
}

function pad(value: string, width: number): string {
  return value.length >= width ? value : `${value}${" ".repeat(width - value.length)}`;
}

function padDisplay(display: string, raw: string, width: number): string {
  return raw.length >= width ? display : `${display}${" ".repeat(width - raw.length)}`;
}

export function formatInventory(items: InventoryItem[]): string {
  if (items.length === 0) return "No MCP servers found.";
  const rows = items.map((item) => ({
    status: colorStatus(item.status),
    statusRaw: item.status === "enabled" ? "● on" : item.status === "disabled" ? "○ off" : item.status === "managed" ? "◆ managed" : "× error",
    name: item.originalName && item.originalName !== item.name ? `${item.name} (${item.originalName})` : item.name,
    scope: item.scope,
    source: item.source,
    mode: colorMode(item.mode),
    modeRaw: item.mode,
    path: item.path.replace(`${homedir()}/`, "~/"),
  }));
  const widths = {
    status: Math.max("STATUS".length, ...rows.map((row) => row.statusRaw.length)),
    name: Math.max("NAME".length, ...rows.map((row) => row.name.length)),
    scope: Math.max("SCOPE".length, ...rows.map((row) => row.scope.length)),
    source: Math.max("SOURCE".length, ...rows.map((row) => row.source.length)),
    mode: Math.max("MODE".length, ...rows.map((row) => row.modeRaw.length)),
  };
  const lines = [
    `${pad("STATUS", widths.status)}  ${pad("NAME", widths.name)}  ${pad("SCOPE", widths.scope)}  ${pad("SOURCE", widths.source)}  ${pad("MODE", widths.mode)}  PATH`,
    ...rows.map(
      (row) =>
        `${padDisplay(row.status, row.statusRaw, widths.status)}  ${pad(row.name, widths.name)}  ${pad(row.scope, widths.scope)}  ${pad(row.source, widths.source)}  ${padDisplay(row.mode, row.modeRaw, widths.mode)}  ${row.path}`,
    ),
  ];
  return lines.join("\n");
}

type DisablePlan = {
  path: string;
  tool: string;
  server: string;
  fromKey: string;
  toKey: string;
};

function disableKeys(tool: string): { fromKey: string; toKey: string } {
  if (tool === "vscode" || tool === "cursor") return { fromKey: "servers", toKey: "disabledServers" };
  if (tool === "opencode") return { fromKey: "mcp", toKey: "disabledMcp" };
  return { fromKey: "mcpServers", toKey: "disabledMcpServers" };
}

export async function disableNativeMcp(serverName: string, opts: { includeUser?: boolean; dryRun?: boolean } = {}): Promise<string> {
  const servers = await discoverMcpServers(opts.includeUser ? { includeUser: true } : {});
  const server = servers.find((item) => item.name === serverName || item.originalName === serverName);
  if (!server) throw new Error(`Native MCP server not found: ${serverName}`);
  if (server.source.managed) throw new Error(`Cannot modify managed MCP config: ${server.source.path}`);
  const keys = disableKeys(server.source.tool);
  const plan: DisablePlan = { path: server.source.path, tool: server.source.tool, server: server.originalName, ...keys };
  const message = `Disable native MCP ${plan.server} in ${plan.path}: move ${plan.fromKey}.${plan.server} -> ${plan.toKey}.${plan.server}`;
  if (opts.dryRun !== false) return `${message}\nDry run only. Re-run with --yes to write changes.`;

  const config = (await readJson(plan.path)) as Record<string, unknown>;
  const source = config[plan.fromKey] && typeof config[plan.fromKey] === "object" && !Array.isArray(config[plan.fromKey]) ? (config[plan.fromKey] as Record<string, unknown>) : {};
  if (!(plan.server in source)) throw new Error(`Server ${plan.server} not found under ${plan.fromKey} in ${plan.path}`);
  const disabled = config[plan.toKey] && typeof config[plan.toKey] === "object" && !Array.isArray(config[plan.toKey]) ? (config[plan.toKey] as Record<string, unknown>) : {};
  disabled[plan.server] = source[plan.server];
  delete source[plan.server];
  config[plan.fromKey] = source;
  config[plan.toKey] = disabled;
  const backup = `${plan.path}.toolcapsule.bak`;
  await mkdir(dirname(backup), { recursive: true }).catch(() => undefined);
  if (existsSync(plan.path)) await writeFile(backup, await readFile(plan.path, "utf8"));
  await writeJson(plan.path, config);
  return `${message}\nBackup: ${backup}`;
}

export async function disableToolCapsuleProfile(profileName: string): Promise<string> {
  const candidates = [workspaceProfilePath(profileName), join(toolCapsuleHome(), "profiles", `${profileName}.json`)];
  const found = candidates.find((path) => existsSync(path));
  if (!found) throw new Error(`ToolCapsule profile not found: ${profileName}`);
  const disabledPath = `${found}.disabled`;
  await rename(found, disabledPath);
  return `Disabled ToolCapsule profile ${profileName}: ${found} -> ${disabledPath}`;
}
