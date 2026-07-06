import { readJson } from "./utils/fs.js";

export async function parseToolArgs(argsRaw: string): Promise<unknown> {
  if (argsRaw.startsWith("@")) return readJson(argsRaw.slice(1));
  return JSON.parse(argsRaw);
}
