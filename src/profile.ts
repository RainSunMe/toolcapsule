import { existsSync } from "node:fs";
import { join } from "node:path";
import { z } from "zod";
import type { ProfileConfig } from "./types.js";
import { readJson } from "./utils/fs.js";

const profileSchema = z.object({
  name: z.string().min(1),
  transport: z.union([
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
  ]),
  skill: z
    .object({
      name: z.string().optional(),
      description: z.string().optional(),
    })
    .optional(),
  shortcuts: z
    .record(
      z.object({
        tool: z.string(),
        description: z.string().optional(),
        args: z.record(z.enum(["string", "file", "json", "boolean", "number"])).optional(),
      }),
    )
    .optional(),
});

export async function loadProfile(profilePathOrName: string): Promise<ProfileConfig> {
  const candidates = [
    profilePathOrName,
    `${profilePathOrName}.json`,
    join(".toolcapsule", "profiles", `${profilePathOrName}.json`),
    join(".github", "skills", `${profilePathOrName}-mcp`, "toolcapsule.config.json"),
  ];
  const found = candidates.find((path) => existsSync(path));
  if (!found) throw new Error(`Profile not found: ${profilePathOrName}`);
  return profileSchema.parse(await readJson(found)) as ProfileConfig;
}
