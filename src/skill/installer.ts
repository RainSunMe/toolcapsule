import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { defaultSkillTarget, expandSkillTargets, skillOutputDir, type SkillTarget } from "./generator.js";

export async function installAgentSkill(outputDir?: string, target: SkillTarget = defaultSkillTarget): Promise<string> {
  let agentSkill: string;
  try {
    agentSkill = await readFile(new URL("../skills/toolcapsule/SKILL.md", import.meta.url), "utf8");
  } catch {
    agentSkill = await readFile(new URL("../../skills/toolcapsule/SKILL.md", import.meta.url), "utf8");
  }
  const outputDirs = outputDir ? [outputDir] : expandSkillTargets(target).map((item) => skillOutputDir("toolcapsule", item));
  await Promise.all(
    outputDirs.map(async (dir) => {
      await mkdir(dir, { recursive: true });
      await writeFile(join(dir, "SKILL.md"), agentSkill);
    }),
  );
  return outputDirs.join(", ");
}
