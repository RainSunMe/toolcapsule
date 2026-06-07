import { homedir } from "node:os";
import { join } from "node:path";

export function toolCapsuleHome(): string {
  return process.env.TOOLCAPSULE_HOME || join(homedir(), ".toolcapsule");
}

export function userProfilePath(profileName: string): string {
  return join(toolCapsuleHome(), "profiles", `${profileName}.json`);
}

export function workspaceProfilePath(profileName: string): string {
  return join(".toolcapsule", "profiles", `${profileName}.json`);
}

export function workspaceRunBaseDir(profileName: string): string {
  return join(".toolcapsule", "runs", profileName);
}
