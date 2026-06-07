import { existsSync } from "node:fs";
import { join } from "node:path";
import { z } from "zod";
import { resolveProfileSource } from "./mcp/importer.js";
import { userProfilePath, workspaceProfilePath } from "./paths.js";
import type { ProfileConfig, SnapshotProfileConfig } from "./types.js";
import { readJson } from "./utils/fs.js";

const transportSchema = z.union([
  z.object({
    type: z.literal("remote"),
    url: z.string().url(),
    headers: z.record(z.string()).optional(),
    env: z.record(z.string()).optional(),
  }),
  z.object({
    type: z.literal("stdio"),
    command: z.string().min(1),
    args: z.array(z.string()).optional(),
    env: z.record(z.string()).optional(),
    cwd: z.string().optional(),
  }),
]);

const skillSchema = z
  .object({
    name: z.string().optional(),
    description: z.string().optional(),
  })
  .optional();

const shortcutsSchema = z
  .record(
    z.object({
      tool: z.string(),
      description: z.string().optional(),
      args: z.record(z.enum(["string", "file", "json", "boolean", "number"])).optional(),
    }),
  )
  .optional();

const snapshotProfileSchema = z.object({
  name: z.string().min(1),
  kind: z.literal("snapshot").optional(),
  transport: transportSchema,
  skill: skillSchema,
  shortcuts: shortcutsSchema,
});

const linkedProfileSchema = z.object({
  name: z.string().min(1),
  kind: z.literal("linked"),
  source: z.object({
    tool: z.enum(["vscode", "claude", "opencode", "gemini", "cursor", "generic"]),
    path: z.string().min(1),
    server: z.string().min(1),
    userLevel: z.boolean().optional(),
  }),
  skill: skillSchema,
  shortcuts: shortcutsSchema,
});

const profileSchema = z.union([snapshotProfileSchema, linkedProfileSchema]);

export async function loadProfile(profilePathOrName: string): Promise<SnapshotProfileConfig> {
  const candidates = [
    profilePathOrName,
    `${profilePathOrName}.json`,
    workspaceProfilePath(profilePathOrName),
    userProfilePath(profilePathOrName),
    join(".github", "skills", `${profilePathOrName}-mcp`, "toolcapsule.config.json"),
    join(".claude", "skills", `${profilePathOrName}-mcp`, "toolcapsule.config.json"),
    join(".opencode", "skills", `${profilePathOrName}-mcp`, "toolcapsule.config.json"),
    join(".agents", "skills", `${profilePathOrName}-mcp`, "toolcapsule.config.json"),
  ];
  const found = candidates.find((path) => existsSync(path));
  if (!found) throw new Error(`Profile not found: ${profilePathOrName}`);
  const profile = profileSchema.parse(await readJson(found)) as ProfileConfig;
  if (profile.kind !== "linked") return profile;

  const resolved = await resolveProfileSource(profile.source);
  if (!resolved) {
    throw new Error(`Linked profile source not found: ${profile.source.path}#${profile.source.server}`);
  }

  return snapshotProfileSchema.parse({
    ...resolved,
    name: profile.name,
    skill: profile.skill ?? resolved.skill,
    shortcuts: profile.shortcuts ?? resolved.shortcuts,
  }) as SnapshotProfileConfig;
}
