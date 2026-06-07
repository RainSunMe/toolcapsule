import { existsSync } from "node:fs";
import { homedir } from "node:os";
import { isAbsolute, join, resolve } from "node:path";
import type { McpProfileSource, ProfileConfig, SnapshotProfileConfig, TransportConfig } from "../types.js";
import { readJson } from "../utils/fs.js";

export type McpConfigSource = Omit<McpProfileSource, "server">;

export type ImportedMcpServer = {
  name: string;
  originalName: string;
  source: McpConfigSource;
  profile: SnapshotProfileConfig;
  warnings: string[];
};

type ServerRecord = Record<string, unknown>;

const workspaceSources: McpConfigSource[] = [
  { tool: "vscode", path: join(".vscode", "mcp.json") },
  { tool: "generic", path: "mcp.json" },
  { tool: "claude", path: ".mcp.json" },
  { tool: "opencode", path: "opencode.json" },
  { tool: "gemini", path: join(".gemini", "settings.json") },
  { tool: "cursor", path: join(".cursor", "mcp.json") },
];

const userSources: McpConfigSource[] = [
  { tool: "vscode", path: join(homedir(), ".config", "Code", "User", "mcp.json"), userLevel: true },
  { tool: "vscode", path: join(homedir(), ".config", "Code - Insiders", "User", "mcp.json"), userLevel: true },
  { tool: "vscode", path: join(homedir(), ".vscode-server", "data", "User", "mcp.json"), userLevel: true },
  { tool: "vscode", path: join(homedir(), ".vscode-server-insiders", "data", "User", "mcp.json"), userLevel: true },
  { tool: "claude", path: join(homedir(), ".claude.json"), userLevel: true },
  { tool: "opencode", path: join(homedir(), ".config", "opencode", "opencode.json"), userLevel: true },
  { tool: "gemini", path: join(homedir(), ".gemini", "settings.json"), userLevel: true },
  { tool: "cursor", path: join(homedir(), ".cursor", "mcp.json"), userLevel: true },
  { tool: "cursor", path: join(homedir(), ".config", "Cursor", "User", "mcp.json"), userLevel: true },
  { tool: "cursor", path: join(homedir(), ".config", "Cursor", "User", "settings.json"), userLevel: true },
];

const managedSources: McpConfigSource[] = [
  { tool: "claude", path: "/etc/claude-code/managed-mcp.json", managed: true },
];

function asRecord(value: unknown): ServerRecord | undefined {
  return value && typeof value === "object" && !Array.isArray(value) ? (value as ServerRecord) : undefined;
}

function stringArray(value: unknown): string[] | undefined {
  return Array.isArray(value) && value.every((item) => typeof item === "string") ? value : undefined;
}

function stringRecord(value: unknown): Record<string, string> | undefined {
  const record = asRecord(value);
  if (!record) return undefined;
  const entries = Object.entries(record).filter((entry): entry is [string, string] => typeof entry[1] === "string");
  return entries.length > 0 ? Object.fromEntries(entries) : undefined;
}

function cleanName(name: string): string {
  const cleaned = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
  return cleaned || "imported-mcp";
}

function mapServer(name: string, source: McpConfigSource, raw: unknown): ImportedMcpServer | undefined {
  const server = asRecord(raw);
  if (!server) return undefined;

  const warnings: string[] = [];
  let transport: TransportConfig | undefined;
  const type = typeof server.type === "string" ? server.type : undefined;
  const url = typeof server.url === "string" ? server.url : typeof server.httpUrl === "string" ? server.httpUrl : undefined;
  const commandValue = server.command;
  const headers = stringRecord(server.headers);
  const env = stringRecord(server.env) ?? stringRecord(server.environment);
  const cwd = typeof server.cwd === "string" ? server.cwd : undefined;

  if (url && (!type || ["http", "streamable-http", "remote", "sse", "ws"].includes(type))) {
    transport = { type: "remote", url, ...(headers ? { headers } : {}), ...(env ? { env } : {}) };
    if (type === "sse" || type === "ws") warnings.push(`Imported ${type} server as remote URL; verify transport compatibility.`);
  } else if (typeof commandValue === "string") {
    transport = {
      type: "stdio",
      command: commandValue,
      args: stringArray(server.args) ?? [],
      ...(env ? { env } : {}),
      ...(cwd ? { cwd } : {}),
    };
  } else if (Array.isArray(commandValue) && commandValue.every((item) => typeof item === "string") && commandValue.length > 0) {
    transport = { type: "stdio", command: commandValue[0]!, args: commandValue.slice(1), ...(env ? { env } : {}), ...(cwd ? { cwd } : {}) };
  }

  if (!transport) return undefined;
  if (server.headers && !headers) warnings.push("Headers were present but not copied because they were not string values.");
  if ((server.env || server.environment) && !env) warnings.push("Environment variables were present but not copied because they were not string values.");
  if (server.includeTools || server.excludeTools) warnings.push("Tool include/exclude filters were not copied; use ToolCapsule brief/schema commands to choose tools manually.");

  const profileName = cleanName(name);
  return {
    name: profileName,
    originalName: name,
    source,
    warnings,
    profile: {
      name: profileName,
      transport,
    },
  };
}

export function linkedProfileForImportedServer(server: ImportedMcpServer, name = server.name): ProfileConfig {
  return {
    name,
    kind: "linked",
    source: {
      ...server.source,
      path: isAbsolute(server.source.path) ? server.source.path : resolve(server.source.path),
      server: server.originalName,
    },
  };
}

export async function resolveProfileSource(source: McpProfileSource): Promise<SnapshotProfileConfig | undefined> {
  if (!existsSync(source.path)) return undefined;
  const config = asRecord(await readJson(source.path));
  if (!config) return undefined;
  const entry = serverEntries(source, config).find(([name]) => name === source.server);
  if (!entry) return undefined;
  return mapServer(entry[0], source, entry[1])?.profile;
}

function serverEntries(source: McpConfigSource, config: ServerRecord): Array<[string, unknown]> {
  if (source.tool === "vscode" || source.tool === "cursor") return Object.entries(asRecord(config.servers) ?? {});
  if (source.tool === "opencode") return Object.entries(asRecord(config.mcp) ?? {});
  if (source.tool === "claude") {
    const projectEntries = Object.entries(asRecord(config.mcpServers) ?? {});
    const projectConfigs = Object.entries(asRecord(config.projects) ?? {}).flatMap(([, project]) =>
      Object.entries(asRecord(asRecord(project)?.mcpServers) ?? {}),
    );
    return [...projectEntries, ...projectConfigs];
  }
  return Object.entries(asRecord(config.mcpServers) ?? {});
}

export async function discoverMcpServers(opts: { includeUser?: boolean; includeManaged?: boolean } = {}): Promise<ImportedMcpServer[]> {
  const sources = [
    ...workspaceSources,
    ...(opts.includeUser ? userSources : []),
    ...(opts.includeManaged ? managedSources : []),
  ];
  const discovered: ImportedMcpServer[] = [];

  for (const source of sources) {
    if (!existsSync(source.path)) continue;
    const config = asRecord(await readJson(source.path));
    if (!config) continue;
    for (const [name, raw] of serverEntries(source, config)) {
      const imported = mapServer(name, source, raw);
      if (imported) discovered.push(imported);
    }
  }

  return discovered;
}

export function selectImportedServers(servers: ImportedMcpServer[], name?: string, all?: boolean): ImportedMcpServer[] {
  if (all) return servers;
  if (!name) return servers.length === 1 ? servers : [];
  const normalized = cleanName(name);
  return servers.filter((server) => server.name === normalized || server.name === name);
}
