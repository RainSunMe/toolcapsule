import { existsSync } from "node:fs";
import { z } from "zod";
import { profilePath } from "./paths.js";
import type { ProfileConfig } from "./types.js";
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

const profileSchema = z.object({
  name: z.string().min(1),
  transport: transportSchema,
  skill: skillSchema,
});

export async function loadProfile(profileName: string): Promise<ProfileConfig> {
  const path = profilePath(profileName);
  if (!existsSync(path)) throw new Error(`Profile not found: ${profileName} (looked in ${path})`);
  return profileSchema.parse(await readJson(path)) as ProfileConfig;
}
