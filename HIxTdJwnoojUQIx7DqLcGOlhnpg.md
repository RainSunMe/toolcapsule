## 一、回顾 2025 年 H2
## 核心工作成果
### 从 0 - 1 实现 MiMo Studio Web，保障其需求持续稳定交付
**简介：**使用大模型 Core 团队研发的开源模型，形成<text color="green">**面向 C 端使用的对话工具**</text>。提供流量入口的同时<text color="green">**积极展示各种模型特性**</text>
#### 整体概述
我在<text color="green">**无设计师、几乎无 PRD **</text>的情况下，<text color="green">**一个月时间内（6.20-7.20）**</text>完成了第一版的Web 功能，后续高质量按时交付了多模态对话、音频对话、HTMLPreview、会话分享、深浅色适配、移动端适配、国际化适配等诸多需求
<grid cols="4">
  <column width="25">
    <image token="Ofa9bWStyoRlImxvHoVczNiYnmg" width="2886" height="1808" align="center"/>

  </column>
  <column width="25">
    <image token="BPMcbKnwaowkmox1rYIcA6fqnNc" width="2888" height="1810" align="center"/>

  </column>
  <column width="24">
    <image token="VbocbSLhool3U6xw0lkcqIhHnAb" width="2886" height="1810" align="center"/>

  </column>
  <column width="25">
    <image token="RyimbNkAlourHLxndpzccPBnn0d" width="2888" height="1810" align="center"/>

  </column>
</grid>

<text color="gray">深浅色适配 & 多模态处理能力 & 语音对话能力 & 国际化适配</text> {align="center"}
<grid cols="5">
  <column width="28">
    <image token="KMT4bL2KmoOyZuxzCricNITanlb" width="2890" height="1812" align="center"/>

  </column>
  <column width="28">
    <image token="RclAbXhxHorGGlxXIGocIsBxnYc" width="1820" height="1138" align="center"/>

  </column>
  <column width="8">
    <image token="MgHVbZSICocU35xVxYVcf0tKnmc" width="868" height="1874" align="center"/>

  </column>
  <column width="8">
    <image token="KxGwbaDglo1bqNxzNPHctX1qn84" width="868" height="1876" align="center"/>

  </column>
  <column width="26">
    <image token="MsHdbtw3NoPq7Kx7ohjcmAXunyf" width="2410" height="1640" align="center"/>

  </column>
</grid>

<text color="gray">会话分享能力 & 联网检索能力 & 移动端适配 & 水印解码</text> {align="center"}
#### 组件封装
开发中<text color="green">**复用 michat 开发经验**</text>，对用户输入、对话气泡、历史消息、滚动监听等<text color="green">**进行了组件化的封装**</text>，预计下季度联合产品、设计打造一个有审美的 AI 组件库
<grid cols="3">
  <column width="22">
    <image token="ErzlbQ7GvoR0nBxXm68cIGXBn0v" width="572" height="916" align="center"/>

  </column>
  <column width="20">
    <image token="HGkEbn31loEXjrxt2pnc3R1inSI" width="1176" height="2100" align="center"/>

  </column>
  <column width="57">
    <image token="YxI0bDPUQoOlKqxnIwbcnu1jnkq" width="2888" height="1816" align="center"/>

  </column>
</grid>

<text color="gray">已经整理出来的组件 & 丰富模式支持 & 页面上使用到了组件的地方</text> {align="center"}
#### 流式渲染性能优化
对于网络问题导致 SSE 批量下发的场景，也在开发中实践得出<mention-doc token="D5ecwhtKWiC86vkEQv0cIcm1np9" type="wiki">SSE Batch 批量输出 方案</mention-doc>，<text color="green">**同时在 MiMo 和 MiChat 中落地**</text>
<grid cols="2">
  <column width="45">
    <image token="IgTYbUQa7ohSz7xCuu0cS4XRnvb" width="1630" height="1956" align="center"/>

  </column>
  <column width="54">
    <image token="FwVjbipLtorTjgxE6dIcZofPnPg" width="1800" height="1773" align="center"/>

  </column>
</grid>

<text color="gray">从卡死 到 怎么也卡不死</text> {align="center"}
#### CodePreview
在 michat 开发中曾对 GithubCopilot、豆包、元宝、DeepSeek、ChatGPT（后边良渝提醒补充）进行<mention-doc token="MFxQwsFpVisatrkGtIscBd23nQc" type="wiki">Code Preview 方案调研</mention-doc>，虽然当时由于比较忙没有落地，但是在 MiMo 项目提出此需求后凭借调研结果，快速完成<mention-doc token="SKxiwBUsqi4OiPkUfg9cYvT7nQe" type="wiki">Code Preview技术方案</mention-doc>，<text color="green">**两天内便完成了整体的功能开发**</text>
后续配合服务端开发功能直至对标 ChatGPT
<sheet token="O5tdsbHCjhFUVCt2lJVcANlYnug_1Lpgdp"/>

<grid cols="2">
  <column width="77">
    <image token="ZWu5bDMMNoSSylxqqSocSqvBnYd" width="1820" height="1140" align="center"/>

  </column>
  <column width="22">
    <image token="Y7RAbdSr6o1IR4xN0gIcL86On9g" width="824" height="1832" align="center"/>

  </column>
</grid>

#### 管理端
管理端的需求相对比较简单，同时是给内部技术人员使用，所以整个项目都是 AI 自己写的，我只定义了样式要求 + 复制服务端的接口文档
<quote-container>
使用 Tailwind CSS + ShadcnUI 组件，黑色极简风格实现一个后台管理平台，页面分为仪表盘、会话管理、问答干预管理
数鲸文档 + 接口文档
</quote-container>

<grid cols="3">
  <column width="33">
    <image token="HmxFbXx1togel6xsMWPcWoC9nge" width="1366" height="856" align="center"/>

  </column>
  <column width="33">
    <image token="SCDrbic0oo6k07x54jtcs5mznmg" width="1365" height="854" align="center"/>

  </column>
  <column width="33">
    <image token="JkD4bpmSBo6OmcxY24GcnHksngd" width="1369" height="859" align="center"/>

  </column>
</grid>

<text color="gray">管理平台页面概要</text> {align="center"}
### 支持 DeepWiki 日常需求交付 & Nextjs2React 迁移
简介：使用 DeepWiki 开源项目私有化部署，实现对内部 Gitlab 的项目文档化 + 问答
项目初期完成了本地部署预览，并移植前端 Nextjs <text color="green">**部署到 Matrix，同时打通米盾登录**</text>，产出<mention-doc token="QCTEwrjBSi7xxpkAhKNc5esanFf" type="wiki">Deep Wiki Next.js 部署方案</mention-doc>，对于初期的项目接入，也根据<text color="green">**对 Gitlab 的使用经验**</text>产出了<mention-doc token="NAtEwGUO7imf9nkNaz2cZKGQn1b" type="wiki">Deep  Wiki  Gitlab 仓库 代码获取 & 权限映射 方案</mention-doc>
随后发现整体Nextjs前端部分组件分层混乱，服务端组件和纯前端组件混杂，且内置路由不好和外部互通，一眼 AI 自己搓的项目，对后续需求变更十分不利，遂启动 迁移至 michat主项目中，共三个主页面、13 个子模块
<quote-container>
这里没想到后边凉的有点快，整体成本回头来看是负收益
</quote-container>

不过迁移的过程中<text color="green">**大量使用了 MiMo 抽象出来的 UI 组件 + 数据流**</text>，对话模块相对于正常开发<text color="green">**工作量减少 40%+**</text>
<grid cols="3">
  <column width="33">
    <image token="TUYubblzVop3iyxAtAPcCmYunHe" width="2744" height="1718" align="center"/>

  </column>
  <column width="33">
    <image token="TbjIbm0oooyGEVx3ya2cjuYZnRe" width="2746" height="1718" align="center"/>

  </column>
  <column width="33">
    <image token="XN3Nb6oSioLJUExqEofcO08anTf" width="2752" height="1724" align="center"/>

  </column>
</grid>

<text color="gray">首页 & 文档详情页 & 对话侧边栏 </text> {align="center"}
### 支持万象 自定义人群 & 标签、留存分析功能交付
简介：万象是数据中台出品的 **一站式智能运营与分析平台，**近期在参考外部的神策平台做功能迭代升级
参与了自定义人群 & 标签、留存分析两个需求的交付，协助进行设计稿样式还原
开发中针对<text color="red">**需求不完整、设计稿不完整**</text>的情况，主动对需要交付的图表进行<text color="green">**全条件的测试**</text><mention-doc token="OnxcwAX50ixoOvkwu26cndKQncb" type="wiki">各种条件配置 の 图表展示 测试</mention-doc>，积极和产品、设计、测试进行对接，保障最终交付
<image token="OS6Qb7BZeoiFZ6xC85wcsTD2ngb" width="901" height="817" align="center"/>

<text color="gray">全条件测试 & 和设计老师沟通后的变更</text> {align="center"}
### **自我评价**
<quote-container>
<text color="gray">内容说明：做的好的和待提升的</text>
</quote-container>

#### 做的好的
- 在无设计师，几乎无 PRD 的情况下，一个月内完成第一版的Web 功能，并在开发中，抽象出完全可复用的 AI 组件，预期下个季度配合设计、产品，一起做一套完整的 AI 组件库
- 在和服务端配合中
  - 主动调研<mention-doc token="GFXawW54wiDcG7k60skcQ4fynGh" type="wiki">OPEN AI SSE 传输方案</mention-doc>、<mention-doc token="ATaEwRk04ivlMSklkE0czQ5cnbh" type="wiki">DeepSeek AI SSE 传输方案</mention-doc>、<mention-doc token="XRWgwLtoOiQBSdk4XHdclBfenee" type="wiki">元宝 AI SSE 传输方案</mention-doc>、<mention-doc token="KB9XwdE1miJ3xCkOisIcymOrnng" type="wiki">Mi Chat - Chat接口输出</mention-doc>并最终给出<mention-doc token="LJ2Qw4P62i1EWikYVnWcAy2AnGd" type="wiki">SSE 接口协议 方案</mention-doc>，实现了当前需求下最简洁的数据结构
  - 在文件上传部分，调研了豆包的<mention-doc token="TMg7wY4SLila56kgVCRc5yoinWc" type="wiki">文件上传接口（豆包）</mention-doc>，推动使用 FDS 加签链接直接上传方案，避免大流量打到服务端服务器
  - 在服务端人员发生变动时，整理出完整的<mention-doc token="QC51wK0SSifA7jkcQlGcbnwEnPc" type="wiki">服务端接口文档（0902更新）</mention-doc>，同时在分享需求中，设计了<mention-doc token="FeiYwRZq5igxIGkMEX6cWk6unYc" type="wiki">MiMo Chatbot 分享功能接口文档</mention-doc>
- 在前端本身的开发中
  - 针对 SSE 流式堆积造成前端卡顿的场景给出了<mention-doc token="D5ecwhtKWiC86vkEQv0cIcm1np9" type="wiki">SSE Batch 批量输出 方案</mention-doc>，并同时在 michat 中落地
  - 进行了<mention-doc token="MFxQwsFpVisatrkGtIscBd23nQc" type="wiki">Code Preview 方案调研</mention-doc>，并在真正提出需求时在两天内完成整体需求
  - 对引入的水印组件，优化其在明暗交错的页面上盲水印的展示，及其入参格式，并提供一个查看水印的工具（待发布到内网 npm
  - 引入了 APM，并提供<mention-doc token="MCHIwnzzFiTgXhkbGgScyZd3n0b" type="wiki">前端项目接入APM（性能、错误监控）方法</mention-doc>供后续同学快速接入、引入了 Onetrack，并补齐对应的类型。便于 TS 项目接入（待发布到内网 npm

#### 待提升的
- MiMo 在立项初期自己做了个简单的调研<mention-doc token="GZe0w6rXNivJA8knO5ncTJ4jnWc" type="wiki">项目初始化选型方案</mention-doc>，就开始搓项目了，没有技术评审，后面几次说拉技术评审都没有落实，仅有一次 CodePreview 功能做了临时的评审，这方面实在做的不足


## 二、成长和收获
整个下半年大部分的精力在 MiMo 上，回顾一下整个开发过程，一直处于一个<text color="green">**敏捷开发，小步快跑**</text>状态，技术上的大部分问题基本在MiChat 时期就有所积累，不然我也不能一个月就能搓出来，顺便还能做好组件化。更多的提升和成长来自于和各位<text color="green">**法务、品牌、合规、国际化、备案**</text>等老师的沟通，了解到一个 2C 的项目原来需要注意这么多方面。两个字概括：<text color="green">**开眼**</text>。
<quote-container>
这里后边会出文档可以做个分享，各种注意事项等
</quote-container>

另外对于项目开发，没有设计稿、PRD ，大部分的需求都是一句话需求，自己想这个东西应该怎么做，做成什么样，就有一种在创业的感觉，同时，这个模式也对 AI 介入提供了极大便利，<text color="green">**我可以轻松用语言来表述我的需求，也算是一种 vibe coding**</text>
接下来是开发中学到整理出来的一些内容
#### **针对 MiMo 中数据流进行模块化拆分**
整体数据流设计如下图：
<add-ons component-id="" component-type-id="blk_631fefbbae02400430b8f9f4" record="{"data":"graph TB\n    subgraph \"UI Layer (Component)\"\n        A[用户交互]\n        B[React Component\u003cbr/\u003eobserver]\n    end\n    subgraph \"Controller Layer\"\n        subgraph \"Store (状态管理)\"\n            C1[LocalStorageStore\u003cbr/\u003e本地存储]\n            C2[GlobalStore\u003cbr/\u003e全局状态]\n            C3[ConversationStore\u003cbr/\u003e会话管理]\n            C4[VoiceStore\u003cbr/\u003e语音房间]\n            C5[ShareStore\u003cbr/\u003e分享页面]\n        end\n        subgraph \"Effect (业务逻辑)\"\n            D1[mainEffect\u003cbr/\u003e初始化流程]\n            D2[globalEffect\u003cbr/\u003e用户/配置]\n            D3[conversationEffect\u003cbr/\u003e消息/会话/历史]\n            D4[voiceEffect\u003cbr/\u003e语音对话]\n            D5[shareEffect\u003cbr/\u003e分享操作]\n            D6[storageEffect\u003cbr/\u003eCookie监听]\n        end\n    end\n    subgraph \"Service Layer (API 通信)\"\n        E1[chatService\u003cbr/\u003e聊天API]\n        E2[userService\u003cbr/\u003e用户API]\n        E3[fileService\u003cbr/\u003e文件API]\n        E4[livekitService\u003cbr/\u003eLiveKit API]\n        E5[baseService\u003cbr/\u003e配置API]\n        E6[shareService\u003cbr/\u003e分享API]\n        E7[contactService\u003cbr/\u003e联系API]\n    end\n    subgraph \"External Systems\"\n        F1[(后端 API)]\n        F2[(LiveKit Server)]\n        F3[LocalStorage]\n        F4[IndexedDB]\n    end\n    %% 用户交互到 Effect\n    A --\u003e|触发事件| B\n    B --\u003e|调用 Effect 方法| D3\n    B --\u003e|调用 Effect 方法| D4\n    B --\u003e|调用 Effect 方法| D5\n    %% Effect 到 Store（状态更新）\n    D1 --\u003e|更新状态| C2\n    D2 --\u003e|更新状态| C2\n    D2 --\u003e|更新状态| C1\n    D3 --\u003e|更新状态| C3\n    D4 --\u003e|更新状态| C4\n    D5 --\u003e|更新状态| C5\n    D6 --\u003e|监听变化| C1\n    %% Effect 到 Service（API 调用）\n    D1 --\u003e|初始化调用| D2\n    D1 --\u003e|初始化调用| D3\n    D2 --\u003e|API 请求| E2\n    D2 --\u003e|API 请求| E5\n    D2 --\u003e|API 请求| E7\n    D3 --\u003e|API 请求| E1\n    D3 --\u003e|API 请求| E3\n    D4 --\u003e|API 请求| E4\n    D5 --\u003e|API 请求| E6\n    %% Service 到外部系统\n    E1 --\u003e|HTTP/SSE| F1\n    E2 --\u003e|HTTP| F1\n    E3 --\u003e|HTTP| F1\n    E4 --\u003e|HTTP| F1\n    E5 --\u003e|HTTP| F1\n    E6 --\u003e|HTTP| F1\n    E7 --\u003e|HTTP| F1\n    C4 --\u003e|WebSocket| F2\n    %% Store 依赖关系\n    C2 -.-\u003e|依赖| C1\n    C3 -.-\u003e|依赖| C1\n    C3 -.-\u003e|依赖| C2\n    C4 -.-\u003e|依赖| C1\n    C4 -.-\u003e|依赖| C2\n    C5 -.-\u003e|依赖| C2\n    %% Store 到持久化\n    C1 \u003c--\u003e|读写| F3\n    C4 \u003c--\u003e|音频文件| F4\n    %% Store 到 Component（响应式更新）\n    C1 -.-\u003e|MobX 响应式| B\n    C2 -.-\u003e|MobX 响应式| B\n    C3 -.-\u003e|MobX 响应式| B\n    C4 -.-\u003e|MobX 响应式| B\n    C5 -.-\u003e|MobX 响应式| B\n    %% 样式定义\n    classDef storeStyle fill:#e1f5ff,stroke:#01579b,stroke-width:2px\n    classDef effectStyle fill:#fff3e0,stroke:#e65100,stroke-width:2px\n    classDef serviceStyle fill:#f3e5f5,stroke:#4a148c,stroke-width:2px\n    classDef externalStyle fill:#e8f5e9,stroke:#1b5e20,stroke-width:2px\n    class C1,C2,C3,C4,C5 storeStyle\n    class D1,D2,D3,D4,D5,D6 effectStyle\n    class E1,E2,E3,E4,E5,E6,E7 serviceStyle\n    class F1,F2,F3,F4 externalStyle","theme":"default","view":"chart"}"/>

清晰的将整体数据划分为如下 Store + Effect：
- LocalStorage：本地存储，包含主题、语言、Cookie 授权、多模态模型配置、语音模型配置
- Global：全局数据，包含全模型配置、用户信息、用户权限等
- Conversion：对话数据，包含多模态对话所需全部信息
- Voice：语音对话数据，包含房间信息，各种元数据等
- Share：分享，主要为分享页的ID、对话内容、CodePreview 控制等
从图中可以清晰的看到数据整体的从<text color="green">**左下（服务端）一路流到右上（页面），各个模块之间依赖清晰，没有循环引用**</text>

#### MiMo 相关知识学习
在 MiMo 开发中，由于使用了 Livekit（AI 语音对话库，含数据对接+UI 部分），对其使用到的WebRTC 部分进行学习，产出 <mention-doc token="Go7Ywuo03iCEBokeGRnc59Vangg" type="wiki">Web RTC 整体概览</mention-doc>并分享
<quote-container>
这里缺一篇 Livekit 的分享，使用的过程也淌了不少坑，需要分享出来
</quote-container>


#### 团队基建相关知识学习
- 对翰哥部署的 Matrix Runner 在 MiMo 项目进行接入，并产出<mention-doc token="CIYqwyl2siW369kgg2OcsCjrnKh" type="wiki">Matrix Runner 迁移备忘</mention-doc>
- 由于安全策略，Matrix 机器之后不能直接访问办公网，协助进行虚拟机中转方案实施，过程中产出<mention-doc token="LkiVwJHHYiHoRZkDhKOcueVVnob" type="wiki">前端/proxy路径改用虚拟机代理备忘</mention-doc>
- 组内对 Npm CI Cache 命令进行了升级，加速缓存，进行了<mention-doc token="EaZxwuPVoiuz6fkkeTDcHYNtnBc" type="wiki">Npm CI cache 现状分析 & 命令行学习</mention-doc>，并分享
- 参与 AI 平台组周会的分享，学习模型相关的背景知识，目前已参与三场

- VSCode 插件开源之后，立即本地变更代码，使其支持了 Mify 的模型，打包出来，并形成了使用文档<mention-doc token="F6kjwTcDQiXaBukRTYkcUMCHnLe" type="wiki">Custom OpenAI Token 使用方法</mention-doc>
  - MiCode 在宣布收费之前，有过半个多月的爽用 Sonnet4.5 的时间，产出<mention-doc token="UqLMwssQEiBuHnkFSvucu0p0n3e" type="wiki">VSCode 接入外部模型备忘</mention-doc>并提供本地对 MiCode 模型的代理
  - 后续小煎蛋也支持了远程代理，不过 MiCode 没有 Sonnet4.5，外加 Mify 支持不加额外 Header 即可访问，也就没什么用了，附文档：<mention-doc token="EpQfwI2f0ibY5mkDiPPc1lBVnkF" type="wiki">小煎蛋MiCode代理</mention-doc>

## 三、2026 年 H1 规划
<quote-container>
<text color="gray">内容说明：2026 年 H1 在自己的技术领域有哪些突破方向？需要什么资源支持？</text>
</quote-container>

### AI使用相关的分享
虽然从 23 年就开始用模型码代码了，但是从来没分享过如何能让大家也好好的用上模型，如何能提前感知到模型的能力边界，上下文边界，从而写出更优的 Prompt 从而完成任务，并且思考我们目前的任务分配模式是否有提升空间，并行模式下的版本管理应该如何做…………
### Markdown流式解析
传统的 Markdown 解析器如 `marked` 和 `react-markdown` 通常是全量解析的，即每次传入的内容变化都会重新解析整个字符串。这种方式在流式生成场景下效率较低，因为大模型的输出通常是逐步追加的，已有的内容基本不会变更，如果能实现流式解析，在长文本场景下，性能优势会非常明显
<quote-container>
这个因为没做成，所以从上半年同步过来，现在已经发现 vercel 的 streamdown 已经按这个思路完成了，需要引进消化吸收再创新下
</quote-container>

### Chatbot的客户端化
目前写的几个 Chatbot 都在网页中，是否可以客户端化以使用更多的本地能力，（说白了就是能有更多的工具提供给模型）
<quote-container>
不要 CLI，谢谢，即使当老航天过两天被章北海两枪崩了我也不要 CLI，目标是能让我爸妈也用起来
</quote-container>

### UI组件库补充
目前已经使用 Storybook 完成了一部分组件的组织，并产出了一份 Prompt 用于直接规范模型从 MiMo 项目迁移组件时的代码风格
H1 就配合产品，设计，一起打造一个最强 AI 组件库

