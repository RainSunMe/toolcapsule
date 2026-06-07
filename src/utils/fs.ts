import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";

export async function readJson<T>(path: string): Promise<T> {
  return JSON.parse(await readFile(path, "utf8")) as T;
}

export async function writeJson(path: string, value: unknown): Promise<void> {
  await mkdir(dirname(path), { recursive: true });
  await writeFile(path, `${JSON.stringify(value, null, 2)}\n`);
}

export async function writeText(path: string, value: string): Promise<void> {
  await mkdir(dirname(path), { recursive: true });
  await writeFile(path, value);
}

export async function ensureToolCapsuleIgnored(): Promise<void> {
  const gitignorePath = ".gitignore";
  const entry = ".toolcapsule/";
  let content = "";
  try {
    content = await readFile(gitignorePath, "utf8");
  } catch (error) {
    if (!(error instanceof Error && "code" in error && error.code === "ENOENT")) throw error;
  }

  const lines = content.split(/\r?\n/).map((line) => line.trim());
  const alreadyIgnored = lines.some((line) => line === entry || line === `/${entry}` || line === ".toolcapsule");
  if (alreadyIgnored) return;

  const prefix = content.length > 0 && !content.endsWith("\n") ? "\n" : "";
  await writeFile(gitignorePath, `${content}${prefix}${entry}\n`);
}

export function abs(path: string): string {
  return resolve(process.cwd(), path);
}
