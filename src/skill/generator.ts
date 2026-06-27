import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { McpClient } from "../mcp/client.js";
import type { McpTool, ProfileConfig } from "../types.js";
import { writeJson } from "../utils/fs.js";

export type SkillTarget = "copilot" | "claude" | "opencode" | "agents" | "all";

export const defaultSkillTarget: SkillTarget = "agents";

export function skillOutputDir(skillName: string, target: Exclude<SkillTarget, "all">): string {
  if (target === "copilot") return join(".github", "skills", skillName);
  if (target === "claude") return join(".claude", "skills", skillName);
  if (target === "opencode") return join(".opencode", "skills", skillName);
  return join(".agents", "skills", skillName);
}

export function expandSkillTargets(target: SkillTarget): Exclude<SkillTarget, "all">[] {
  return target === "all" ? ["copilot", "claude", "opencode", "agents"] : [target];
}

export type GenerateSkillOptions = {
  outputDir?: string;
  target?: SkillTarget;
  tools?: McpTool[];
};

// ── template helpers ──

function argsSkeleton(tool: McpTool): string {
  const schema = tool.inputSchema as Record<string, unknown> | undefined;
  const properties = schema?.properties as Record<string, { type?: string; description?: string }> | undefined;
  const requiredList: string[] = Array.isArray(schema?.required) ? (schema.required as string[]) : [];
  if (!properties) return "{}";

  const lines = ["{"];
  const entries = Object.entries(properties);
  for (let i = 0; i < entries.length; i++) {
    const [key, prop] = entries[i]!;
    const isRequired = requiredList.includes(key);
    const desc = prop.description ? ` // ${prop.description.slice(0, 60)}` : "";
    if (isRequired) {
      let placeholder: string;
      if (prop.type === "integer" || prop.type === "number") placeholder = "0";
      else if (prop.type === "boolean") placeholder = "true";
      else placeholder = "…";
      lines.push(`  "${key}": ${prop.type === "boolean" ? placeholder : `"${placeholder}"`},${desc}`);
    } else {
      lines.push(`  // "${key}": "…",${desc}`);
    }
  }
  lines.push("}");
  return lines.join("\n");
}

function toolsMarkdown(tools: McpTool[] | undefined): string {
  if (!tools || tools.length === 0) return "_（未能拉取工具列表，请手动运行 `tcap tools <profile>` 获取）_";
  return tools
    .map((tool) => {
      const schema = tool.inputSchema as Record<string, unknown> | undefined;
      const requiredList: string[] = Array.isArray(schema?.required) ? (schema.required as string[]) : [];
      const properties = schema?.properties as Record<string, { type?: string }> | undefined;
      const allParams = properties ? Object.keys(properties) : [];
      const optionalParams = allParams.filter((p) => !requiredList.includes(p));

      const required = requiredList.length > 0 ? requiredList.map((r) => `\`${r}\``).join("、") : "—";
      const optional = optionalParams.length > 0 ? optionalParams.map((o) => `\`${o}\``).join("、") : "—";

      const fullDesc = tool.description || "—";
      const summary = fullDesc.split(/\n\n|(?=\n#+\s)/)[0]?.trim() || fullDesc.slice(0, 200);

      return [
        `### \`${tool.name || "unknown"}\``,
        "",
        `- **必填**：${required}`,
        `- **可选**：${optional}`,
        "",
        summary,
        "",
        "```json",
        `// /tmp/tcap-${tool.name}.args.json`,
        argsSkeleton(tool),
        "```",
      ].join("\n");
    })
    .join("\n\n---\n\n");
}

function buildSkillMarkdown(profileName: string, tools: McpTool[] | undefined): string {
  const skillName = `${profileName}-mcp`;
  const toolCount = tools?.length ?? 0;

  return `---
name: ${skillName}
description: 'TODO'
argument-hint: 'TODO'
---

# ${profileName} MCP Skill

## 使用方法

ToolCapsule 通过 \`tcap\` 命令调用 MCP 工具，参数通过 \`/tmp\` 文件传递。

\`\`\`bash
# 查看所有工具（简要）
tcap tools ${profileName}

# 查看单个工具的参数说明
tcap schema ${profileName} <工具名>

# 调用工具：把参数写入 /tmp 文件，用 @file 引用
tcap call ${profileName} <工具名> @/tmp/tcap-${profileName}-<工具名>.json

# 把响应保存到文件（避免大响应撑满上下文）
tcap call ${profileName} <工具名> @/tmp/tcap-${profileName}-<工具名>.json -o /tmp/tcap-${profileName}-response.json

# 调用失败？修改 /tmp 里的参数文件，重新执行上一条 call 命令即可
\`\`\`

**参数文件格式**（每个工具的参数骨架见下方工具列表）：

\`\`\`json
// /tmp/tcap-${profileName}-<工具名>.json
{
  "param1": "value",
  "param2": 123
}
\`\`\`

**Profile 管理**：\`~/.toolcapsule/profiles/${profileName}.json\` 存储 MCP 连接信息，切勿提交到仓库。

## 工具列表

${toolsMarkdown(tools)}

## 安全提醒

- 不要将 profile JSON 或鉴权 URL 提交到仓库
- 调用参数写入 /tmp，不要污染项目目录
- 调用前确认操作的影响范围（尤其是修改/删除类操作）

## ⚠️ 此 Skill 尚未激活（${toolCount} 个工具待确认）

**AI 完成本次任务后，必须执行以下步骤才算完成：**

1. 将本文件顶部 \`description\` 的 \`TODO\` 替换为一句话，描述何时触发此 Skill
   - 格式：\`'当用户需要操作 ${profileName} 时触发，例如：<具体场景>'  \`
2. 将 \`argument-hint\` 的 \`TODO\` 替换为参数提示
   - 格式：\`'<动词>/<动词>：<名词>、<名词>'  \`（参考上方工具名）
3. 将本节（"⚠️ 此 Skill 尚未激活"这整个 ## 段落）**整体删除**

**不完成以上步骤，此 Skill 不会被正确触发。**
`;
}

// ── skill generation ──

async function writeSkillAt(outputDir: string, profileName: string, tools: McpTool[] | undefined): Promise<string> {
  await mkdir(outputDir, { recursive: true });

  const markdown = buildSkillMarkdown(profileName, tools);
  await writeFile(join(outputDir, "SKILL.md"), markdown);
  return outputDir;
}

export async function generateSkill(profileName: string, opts: GenerateSkillOptions = {}): Promise<string> {
  const skillName = `${profileName}-mcp`;
  const target = opts.target || defaultSkillTarget;
  const outputs = opts.outputDir
    ? [await writeSkillAt(opts.outputDir, profileName, opts.tools)]
    : await Promise.all(
        expandSkillTargets(target).map((item) =>
          writeSkillAt(skillOutputDir(skillName, item), profileName, opts.tools),
        ),
      );
  return outputs.join(", ");
}

export async function writeProfile(path: string, profile: ProfileConfig): Promise<void> {
  await mkdir(join(path, ".."), { recursive: true });
  await writeJson(path, profile);
}

export type AuthInfo = {
  status: number;
  oauthAuthorizationUrl?: string;
  serverUrl: string;
};

export type FetchToolsResult = {
  tools?: McpTool[];
  auth?: AuthInfo;
};

export async function fetchProfileTools(profile: ProfileConfig, opts: { clientVersion?: string } = {}): Promise<FetchToolsResult> {
  const client = new McpClient(profile, { ...(opts.clientVersion ? { clientVersion: opts.clientVersion } : {}), timeoutMs: 15000 });
  try {
    await client.init();
    const tools = (await client.listTools()).tools;
    return { tools };
  } catch (error) {
    const auth = await detectAuth(profile, error);
    const result: FetchToolsResult = {};
    if (auth) result.auth = auth;
    return result;
  } finally {
    await client.close().catch(() => undefined);
  }
}

async function detectAuth(profile: ProfileConfig, error: unknown): Promise<AuthInfo | undefined> {
  if (profile.transport.type !== "remote") return undefined;
  const err = error as { code?: number; message?: string } | undefined;
  if (err?.code !== 401 && err?.code !== 403) return undefined;

  const origin = new URL(profile.transport.url).origin;
  let oauthAuthorizationUrl: string | undefined;

  try {
    const res = await fetch(`${origin}/.well-known/oauth-authorization-server`);
    if (res.ok) {
      const metadata = (await res.json()) as { authorization_endpoint?: string };
      if (metadata.authorization_endpoint) {
        oauthAuthorizationUrl = metadata.authorization_endpoint;
      }
    }
  } catch {
    // OAuth discovery failed — server likely uses static tokens
  }

  const result: AuthInfo = { status: err.code, serverUrl: origin };
  if (oauthAuthorizationUrl) result.oauthAuthorizationUrl = oauthAuthorizationUrl;
  return result;
}
