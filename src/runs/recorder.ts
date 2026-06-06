import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import type { RunRecord } from "../types.js";
import { writeJson } from "../utils/fs.js";

export function createRunId(): string {
  return new Date().toISOString().replace(/[:.]/g, "-");
}

export async function saveRun(baseDir: string, record: RunRecord): Promise<string> {
  const dir = join(baseDir, record.id);
  await mkdir(dir, { recursive: true });
  await writeJson(join(dir, "run.json"), record);
  await writeJson(join(dir, "request.json"), record.request);
  if (record.response !== undefined) await writeJson(join(dir, "response.json"), record.response);
  if (record.error) await writeFile(join(dir, "error.txt"), record.error);
  await writeFile(join(dir, "command.txt"), `${record.command}\n`);
  return dir;
}

export async function loadRun(runDir: string): Promise<RunRecord> {
  return JSON.parse(await readFile(join(runDir, "run.json"), "utf8")) as RunRecord;
}
