# whatseek PRD

Status: active
Owner: sdkwork-whatseek team
Application: whatseek
Updated: 2026-10-01
Specs: REQUIREMENTS_SPEC.md, DOCUMENTATION_SPEC.md

## Document Map

- This file is the product Canon entry for WhatSeek (问寻), adapted from the product PRD V1.0 (AI 原生超级应用产品需求文档).
- Add `PRD-<topic>.md` shards in this directory when the PRD grows beyond one reviewable screen.

## 1. Background And Problem

Traditional software entry points are app-centric: users must already know which app they need, then search a store, download, install, and register before solving their problem. The premise — "the user must first know which App to use" — is dissolving in the AI era. LLMs, agents, AI coding, and AI app generation let users state a goal in natural language ("帮我找一个跨境选品工具", "帮我做一个客户管理系统", "帮我联系张三") without understanding software structure.

WhatSeek (问寻) is therefore positioned as an AI-native application, service, people, and commerce connection entry: 表达需求 → AI 理解 → 寻找能力 → 调用能力 → 组合能力 → 创建能力 → 完成任务. It fuses four product capabilities (ChatGPT-style AI conversation, App-Store-style app ecosystem, WeChat-style people/messages, 1688-style commerce supply) under user intent: **AI + Apps + People + Commerce**. Core product principles: Chat First, Intent First, AI First, App as Capability, Create as Default, People + Apps + Commerce unified. Brand: WhatSeek / 问寻 — 你负责问，AI 负责寻 (问 → 寻 → 用 → 创 → 分享).

## 2. Target Users

- 普通消费者 (consumers): find apps/services/products/content/people, use AI, create personal tools.
- 创业者 / 个体经营者 (entrepreneurs): create business tools, independent sites, marketing/CRM/internal tools; find suppliers and services.
- 企业用户 (enterprises): enterprise apps, agents, knowledge bases, directories, collaboration, supply-chain connection.
- 开发者 / 创作者 (developers/creators): publish apps, agents, skills, APIs, templates; acquire users and revenue.

## 3. Goals And Non-Goals

### Goals

- Chat is the single first entry: the user opens the product and immediately states a need ("你想做什么？").
- AI recognizes core intents (SEARCH_APP, USE_APP, CREATE_APP, SEARCH_AGENT, USE_AGENT, CREATE_AGENT, SEARCH_PRODUCT, SEARCH_SUPPLIER, SEARCH_SERVICE, SEARCH_PERSON, SEND_MESSAGE, CREATE_CONTENT, EDIT_CONTENT, EXECUTE_TASK, GENERAL_CHAT) and routes automatically — the user never picks a capability by hand.
- The app center is a discovery/invoke/compose/create surface, not a download market: 应用不是被下载的，而是被发现、调用、组合和创建的.
- When no suitable app exists, AI creates one (App Generation: 需求理解 → 功能拆解 → 页面规划 → 数据模型规划 → 应用生成 → 运行预览 → 用户修改 → 发布 → 保存到我的应用).
- Contacts unify people, friends, groups, organizations, merchants, suppliers, service providers, agents, and AI assistants; messages unify private/group chat, system/app/agent/order/service/task notifications into one event center.
- Bottom navigation is fixed to five tabs: 对话｜应用｜通讯录｜消息｜我的.

### Non-Goals (MVP boundary, per PRD §46)

- Full social graph and large-scale group-chat ecology.
- Complex e-commerce transactions (orders/payments as full flows).
- Full enterprise ERP, large-scale open platform, complex developer settlement.
- Full native mobile app distribution (native shells come later; H5 first).

MVP validation question: 用户是否愿意通过 Chat 表达需求，并让 AI 找到或创建一个可用的应用。

## 4. Scope

### P0 (this repository's first milestone)

用户体系 (basic user/session), Chat + AI 对话, 应用中心, 应用市场首页编辑流 (Hero 轮播/编辑故事/精选合集/榜单速览, 集成 sdkwork-appstore 首页信息架构), 应用搜索, 应用详情, 应用调用, 我的应用, AI 创建 App (方案 → 生成 → 预览 → 修改 → 发布到我的应用), 通讯录, 消息, 我的, 基础权限, 基础任务状态 (Pending/Running/Waiting Confirmation/Completed; 异常 Failed/Cancelled/Expired).

### P1 (later)

Agent, Skill, 应用组合, 文件, 知识库, 应用发布, 开发者中心, 应用商业化.

### P2 (later)

商品, 供应商, 服务商, 订单, 支付, 企业 Workspace, 企业应用市场, 完整商业生态.

## 5. User Scenarios

1. **找应用**: 打开 WhatSeek → 输入"帮我找一个视频剪辑工具" → 识别 SEARCH_APP → 展示推荐应用（推荐原因/功能差异/价格/AI 能力/是否支持自定义）→ 立即使用.
2. **创建应用**: 输入"帮我做一个库存管理系统" → 识别 CREATE_APP → 生成方案（客户列表/跟进记录/统计等拆解）→ 生成应用 → 实时预览 → 持续修改（"增加订单管理"）→ 发布 → 出现在 我的应用.
3. **找供应商**: 表达采购需求（"1000 件黑色 T 恤，预算 20 元以内，支持定制"）→ AI 解析条件 → 供应商搜索/筛选/比较/联系.
4. **找人并发消息**: "给张三发消息，告诉他下午三点开会" → 查找联系人 → 生成消息 → 用户确认 → 发送（外部发送类动作采用明确确认机制）.
5. **任务通知**: AI 任务完成后进入消息中心（"你的视频已经生成"/"独立站已经生成"/"供应商已经回复"），点击消息直达任务结果 — 消息不是单纯聊天，而是整个数字世界的事件中心.

## 6. Success Metrics

- Chat 使用率: share of users who start expressing needs after opening the product.
- Intent Resolution: share of correctly recognized intents.
- App Discovery Rate: share of needs matched by an existing app.
- App Creation Rate: share of unmatched needs converted into a new app.
- App Reuse Rate: share of created apps used again.
- Task Completion Rate: share of AI-executed tasks that truly complete.
- Time to Value: time from need expressed to useful result.
- 北极星指标 (North Star): **Completed Intent / 已完成用户意图数** — a real need expressed and resolved with a useful result (app found and used, app created and used, supplier connected, task completed, contact reached).

## 7. Phases

1. **Phase 1 — multi-surface P0 milestone (this repository)**: five-tab super app delivered across H5 (primary), PC browser + Tauri desktop shell, WeChat mini-program, and Flutter mobile, all with chat-first entry, intent recognition + AI routing over mock-backed services (app catalog, contacts, messages, generated apps), app center (search/category/detail/invoke/我的应用/最近使用/收藏), AI app generation flow (plan → generate → preview → modify → publish), contacts, unified messages with AI task notifications, profile with session + theme, i18n (zh-CN/en-US), dark mode. Standalone deployment profile; all services sit behind injectable client boundaries so Phase 2 swaps mocks for generated SDK clients.
2. **Phase 2 — platform wiring**: replace mock clients with generated SDK clients (IAM session, appstore catalog, IM transport, LLM gateway); add cloud deployment profile.
3. **Phase 3 — P1/P2 capabilities** per Scope.

## 8. Linked Requirements

- `../requirements/REQ-2026-0001-whatseek-h5-app-shell.md` — five-tab shell, chat-first home, theme, i18n.
- `../requirements/REQ-2026-0002-whatseek-ai-chat-intent.md` — AI chat, intent recognition, AI routing, task states.
- `../requirements/REQ-2026-0003-whatseek-app-center.md` — app discovery, search, detail, invoke, 我的应用, AI app creation.
- `../requirements/REQ-2026-0004-whatseek-contacts-messages.md` — contacts, unified messages, AI task notifications, profile/digital assets.
- `../requirements/REQ-2026-0005-whatseek-multi-surface.md` — multi-surface delivery: PC + Tauri desktop, WeChat mini-program, and Flutter mobile off the shared service core.

## 9. Open Questions

- Which real LLM gateway and app-generation engine will back CREATE_APP in Phase 2, and what the generation sandbox contract looks like.
- How Generated App preview/publish integrates with the platform appstore catalog (share listing model vs. separate registry).
- Minimum permission set for AI actions that send messages or place orders (confirmation mechanism details per PRD §28/§40).
- Whether the Mini App runtime (轻量应用容器) is adopted before native shells (Capacitor host).
