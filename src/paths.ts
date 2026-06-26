import { homedir } from "node:os";
import { join } from "node:path";

export function toolCapsuleHome(): string {
  return process.env.TOOLCAPSULE_HOME || join(homedir(), ".toolcapsule");
}

export function profilePath(profileName: string): string {
  return join(toolCapsuleHome(), "profiles", `${profileName}.json`);
}
