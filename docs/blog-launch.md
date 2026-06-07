# Lazy MCP：我们为什么做 ToolCapsule

> 重型 MCP 工具不应该常驻 Prompt。把它们装进 ToolCapsule。

MCP 正在成为 AI Agent 连接工具的标准方式。

Agent Skills 正在成为封装可复用工作流的标准方式。

但当我们真正把越来越多的 SaaS、文档系统、项目管理系统、内部平台接入 Agent 之后，一个新的问题开始出现：**MCP server 变重了**。

很多 MCP server 不再只是几个轻量函数。它们可能包含大量工具、复杂 schema、很长的工具描述，以及动辄几 KB、几十 KB 的 Markdown 或 JSON payload。对于模型来说，这些内容一旦进入上下文，就会带来直接成本：更多 token、更大的注意力负担、更难调试的失败调用。

我们做 ToolCapsule，就是想探索一种更轻的工作流：

- 让 MCP 继续作为工具能力层；
- 让 Agent Skill 成为面向 Agent 的工作流层；
- 让大 payload 回到本地文件系统；
- 让每次工具调用都可记录、可审计、可 patch、可重试。

一句话：**ToolCapsule 是面向重型 MCP 工具的 MCP-to-Skill 工作流层。**

---

## MCP 很强，但重型 MCP 有上下文成本

MCP 的价值很清晰：它给 Agent 提供了一种标准方式来发现工具、理解工具 schema，并调用外部系统。

这对于小工具非常自然。例如读取一个文件、查询一个状态、调用一个简单 API，模型看到 schema、直接调用工具，成本不高。

但当 MCP server 连接的是飞书、Notion、Jira、Linear、Confluence、Google Docs、GitHub 管理后台，或者企业内部 SaaS 时，情况会变得不一样。

这些工具往往有几个特点：

1. **工具数量多**：一个 server 可能暴露几十个甚至更多工具。
2. **schema 很长**：创建文档、更新页面、批量操作、生成报表时，参数结构经常很复杂。
3. **payload 很大**：正文、表格、Markdown、JSON 配置不适合一直放在 prompt 里。
4. **调用失败后很难恢复**：一旦参数有一点问题，模型经常需要重新生成整个工具调用。
5. **审计依赖宿主环境**：不同 Agent host 对工具调用记录、错误信息、重试方式的支持不一致。

结果就是：MCP 明明是为了让 Agent 更好地使用工具，但重型 MCP 可能反过来开始消耗 Agent 的上下文窗口。

这不是 MCP 的问题，而是工作流层缺了一块。

---

## Prompt 不应该承载整个工具系统

很多 Agent 工作流里，一个隐含假设是：模型应该在上下文里理解完整工具系统，然后直接生成完整工具调用。

这在轻量工具场景中可行。

但对于重型 SaaS / 文档 / 工作流 MCP，这个假设并不总是合理。

例如，让 Agent 创建一篇飞书文档时，真正需要被模型持续关注的，可能只是：

- 用户想写什么；
- 文档的大纲是什么；
- 应该调用哪个工具；
- 参数文件在哪里；
- 如果失败，应该修改哪一部分。

模型不一定需要在每一轮都看到完整的 MCP schema，也不一定需要把整篇 Markdown 正文和所有 JSON 参数都塞进上下文。

更合理的方式是：

- schema 按需加载；
- 大内容放在文件里；
- 工具参数以 `args.json` 形式存在；
- 调用结果保存成运行记录；
- 失败时 patch 文件，然后确定性 retry。

这就是 ToolCapsule 的核心思路。

---

## ToolCapsule 是什么

ToolCapsule 可以理解为一个 file-first 的工具调用包。

```text
capsule = MCP tool + args.json + payload files + run metadata + retry history
```

也就是说，ToolCapsule 不试图替代 MCP。MCP 仍然是工具能力的来源。

ToolCapsule 做的是把 MCP 工具包装成更适合 Agent 使用的工作流：

```text
Heavy MCP server
→ MCP-to-Skill workflow layer
→ compact Agent Skill
→ local args/content files
→ auditable tool runs
→ patch-and-retry recovery
```

它会为 MCP server 生成轻量的 Agent Skill，让 Agent 通过 Skill 了解什么时候该加载 schema、什么时候该编辑本地文件、什么时候该调用工具、什么时候该重试。

换句话说：

- MCP 是能力层；
- Skill 是工作流层；
- 本地文件是 payload 层；
- run directory 是审计和恢复层。

这就是我们说的 **MCP-to-Skill**。

---

## 一个典型工作流

假设你已经有一个飞书 MCP server，希望让 Agent 创建文档。

使用 ToolCapsule，可以这样开始：

```bash
npm i -g toolcapsule
```

初始化一个 MCP profile，并生成对应的 Agent Skill：

```bash
tcap init feishu --url <remote-mcp-url> --target claude
```

或者，如果你已经在 Claude Code、VS Code / GitHub Copilot、OpenCode、Gemini CLI、Cursor 等工具里配置过 MCP，可以直接导入：

```bash
tcap import --dry-run
tcap import --name feishu --target claude
```

查看工具列表时，只加载简短摘要：

```bash
tcap tools feishu --brief
```

需要某个工具时，再查看具体 schema：

```bash
tcap schema feishu create-doc
```

准备一个本地参数文件：

```bash
tcap call feishu create-doc @args.json --save-run
```

如果调用失败，不需要让模型重新生成整个工具调用。直接修改 `args.json` 或正文文件，然后重试：

```bash
tcap retry .toolcapsule/runs/feishu/<run-id>
```

整个过程的重点是：Agent 不需要一直背着完整 MCP schema 和大 payload 前进。它只需要知道文件在哪里、当前步骤是什么、失败后该 patch 哪个 artifact。

---

## File-first tool calls：让大 payload 回到文件系统

ToolCapsule 的一个核心设计是 file-first。

传统工具调用常常把参数和正文直接嵌进一次工具调用里。如果正文很长，或者参数结构很复杂，模型需要在上下文中同时处理用户需求、工具 schema、正文内容和 JSON 参数。

ToolCapsule 更倾向于把这些内容拆开：

```text
args.json        # 工具调用参数
content.md       # 大段 Markdown 正文
.toolcapsule/runs/<profile>/<id>/  # 请求、响应、错误、重试信息
```

这样做有几个好处。

第一，**模型上下文更轻**。

模型可以只阅读必要文件，而不是每轮都看到所有内容。

第二，**失败更容易修复**。

如果 API 返回“某个字段格式错误”，Agent 可以直接 patch `args.json` 中对应字段，而不是重新构造完整调用。

第三，**调用可审计**。

每次保存运行记录后，都可以回看当时的 request、response、error 和 retry history。

第四，**工作流更接近真实开发体验**。

开发者调试 API 时，本来就是改文件、跑命令、看错误、再改文件。ToolCapsule 把这个模式带回 Agent 工具调用。

---

## Patch-and-retry：失败不必重新生成整个调用

工具调用失败是常态，尤其是调用复杂 SaaS API 时。

问题不在于失败本身，而在于失败后的恢复方式。

如果一次工具调用包含很长的 JSON 和 Markdown，失败后让模型重新生成全部内容，容易出现几个问题：

- 原本正确的字段被改坏；
- 长正文被意外压缩、改写或丢失；
- 重试成本高；
- 失败原因和修复动作混在上下文里，不容易审计。

ToolCapsule 的方式是：

1. 第一次调用时保存 run；
2. 失败后查看错误；
3. 修改本地 `args.json` 或 payload 文件；
4. 使用同一个 run 目录重试。

```bash
tcap call feishu create-doc @args.json --save-run
# patch args.json or content.md
tcap retry .toolcapsule/runs/feishu/2026-06-06T10-00-00-000Z
```

这个模式的关键是“确定性”。

不是让模型再次凭记忆生成一份新的调用，而是在已有 artifact 上做最小修改。

这对于文档创建、任务批量更新、报表生成、工单同步、页面发布等场景尤其重要。

---

## Native MCP vs ToolCapsule

ToolCapsule 不是说 Native MCP 不好。

相反，ToolCapsule 建立在 MCP 之上。我们只是认为，不同工具需要不同工作流。

小型、高频、低 payload 的工具，直接 MCP 调用很自然。

大型、低频、高 payload、复杂 schema 的工具，更适合 ToolCapsule 这种 file-first 和 Skill-guided 的方式。

| Concern | Native MCP | ToolCapsule |
|---|---|---|
| Tool schemas | Often visible every turn | Loaded on demand |
| Agent workflow | Direct tool call | Skill-guided workflow |
| Large payloads | Generated inside tool calls | Stored as files |
| Failed calls | Regenerate full tool call | Patch local file and retry |
| Auditability | Host dependent | Run directory with request/response/error |
| Best for | Small, high-frequency tools | Heavy SaaS/document/workflow MCPs |

这也是为什么我们把 ToolCapsule 定位为 MCP-to-Skill，而不是 MCP replacement。

---

## Benchmark：少 88.4% input tokens

我们在一个飞书 MCP benchmark 中测试了 ToolCapsule 的效果。

结果是：

- **88.4% fewer input tokens**；
- **87.6% fewer total tokens**；
- planning success rate 保持 **100%**。

这个结果并不意味着所有 MCP server 都会得到完全相同的收益。实际效果会受到 server schema、模型、Agent host、任务类型等因素影响。

但它说明了一个方向：

> 对于重型 MCP 工具，把 schema 和 payload 从 prompt 中移出去，是有明显价值的。

这也是 Lazy MCP 的核心。

不是不用 MCP，而是不要让重型 MCP 在每一轮都压在 prompt 里。

---

## ToolCapsule 会生成什么

以飞书 MCP 为例，ToolCapsule 会生成类似这样的结构：

```text
.claude/skills/feishu-mcp/
  SKILL.md                  # lightweight Agent Skill entrypoint
  toolcapsule.config.json   # MCP transport/profile config
  scripts/README.md

.toolcapsule/
  profiles/feishu.json      # local MCP profile
  runs/feishu/              # auditable tool call records
```

`SKILL.md` 是 Agent 看到的轻量入口。

`toolcapsule.config.json` 保存 MCP profile 信息。

`.toolcapsule/runs/` 保存每次工具调用的记录。

这样的结构让 Agent 不需要直接背完整 MCP server，而是通过 Skill 学会如何按需使用它。

---

## 谁适合试试 ToolCapsule

如果你的 MCP server 符合下面任意几个条件，ToolCapsule 可能会有帮助：

- schema-heavy；
- 文档或工作流导向；
- 不是每轮都调用，但一调用就很复杂；
- payload 很大，比如 Markdown、JSON、表格、配置；
- 失败后不希望模型重新生成整个调用；
- 希望工具调用有本地记录，方便审计和复现。

典型例子包括：

- 飞书 / Lark；
- Notion；
- Jira；
- Linear；
- Confluence；
- Google Docs；
- GitHub 管理工具；
- 企业内部 SaaS MCP。

ToolCapsule 尤其适合那些“不是一直用，但一用就很重”的工具。

---

## 安装和试用

ToolCapsule 目前是 early alpha，API 可能在 v1.0 前变化。

如果你愿意尝试，可以这样安装：

```bash
npm i -g toolcapsule
```

常用命令：

```bash
tcap import --dry-run
tcap import --name feishu --target claude
tcap tools feishu --brief
tcap schema feishu create-doc
tcap call feishu create-doc @args.json --save-run
tcap retry .toolcapsule/runs/feishu/<run-id>
```

`tcap` 是 `toolcapsule` 的短别名。

项目地址：

- GitHub: https://github.com/RainSunMe/toolcapsule
- npm: https://www.npmjs.com/package/toolcapsule
- Website: https://toolcapsule.studio

---

## 结语

MCP 让 Agent 更容易连接外部工具。

Agent Skills 让 Agent 更容易复用工作流。

ToolCapsule 试图连接这两者：保留 MCP 作为能力层，同时把重型工具变成轻量、按需加载、文件优先、可 patch、可 retry 的 Agent Skill 工作流。

我们相信，随着 MCP server 越来越多、越来越复杂，Agent 不应该在 prompt 里长期背负完整工具系统。

重型 MCP 工具不应该常驻 Prompt。

把它们装进 ToolCapsule。
