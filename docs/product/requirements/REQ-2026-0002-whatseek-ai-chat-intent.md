---
id: REQ-2026-0002
title: WhatSeek AI chat entry with intent recognition, AI routing, and task states
owner: sdkwork-whatseek team
status: implemented
priority: P0
affected_surfaces: [h5]
trace:
  prd: docs/product/prd/PRD.md
  specs:
    - APP_H5_ARCHITECTURE_SPEC.md
    - FRONTEND_CODE_SPEC.md
    - TEST_SPEC.md
---

# REQ-2026-0002 — AI Chat Entry With Intent Recognition, AI Routing, And Task States

## Goals

- Chat tab is the AI main entry: multi-turn conversation with context, message input, suggestion chips for example intents.
- Intent recognition classifies user input into PRD core intents: SEARCH_APP, USE_APP, CREATE_APP, SEARCH_AGENT, USE_AGENT, CREATE_AGENT, SEARCH_PRODUCT, SEARCH_SUPPLIER, SEARCH_SERVICE, SEARCH_PERSON, SEND_MESSAGE, CREATE_CONTENT, EDIT_CONTENT, EXECUTE_TASK, GENERAL_CHAT (rule-based Phase 1; examples: "帮我找一个视频剪辑工具" → SEARCH_APP; "帮我做一个视频剪辑工具" → CREATE_APP; "给张三发消息" → SEND_MESSAGE).
- AI Router acts on the intent without asking the user to pick a capability:
  - SEARCH_APP → app result cards (recommendation reason, price, AI capability) with 立即使用 / 基于此创建 actions.
  - CREATE_APP → generation plan (功能拆解) → generate → app appears in 我的应用.
  - SEND_MESSAGE → find contact → draft message → explicit user confirmation → send → confirmation appears in Messages.
  - SEARCH_PRODUCT/SEARCH_SUPPLIER/SEARCH_SERVICE → placeholder commerce results (P2 preview).
  - GENERAL_CHAT → helpful reply.
- Long-running AI work exposes task states Pending → Running → Waiting Confirmation → Completed (Failed/Cancelled on error) and posts a notification into the Messages center when done.

## Non-Goals

- Real LLM inference (Phase 1 uses a deterministic rule engine behind the same client interface).
- Voice/image/video/file input modalities (text only in Phase 1).

## Acceptance Criteria

1. Intent recognizer unit tests cover all PRD §10.1 intents and the four PRD example utterances.
2. Chat flows render within one second per mock turn; task simulation transitions through all forward states and lands a message-center notification on completion.
3. SEND_MESSAGE requires an explicit confirm step; without confirmation nothing is sent.
4. Chat service is tested with a fake client; UI covers loading/empty/error/success states.

## Verification

```bash
pnpm --filter @sdkwork/whatseek-h5-chat test
pnpm typecheck && pnpm test
```

## Mock-Milestone Narrowing (2026-10-03)

- "All states" is simulated as the forward PRD §41 path — pending → running →
  waiting_confirmation → completed. The terminal states (failed / cancelled /
  expired) are fully typed and rendered by every surface's task UI but require
  a real backend or explicit user cancellation to occur; the mock does not
  fake failures into happy paths.
- Intent routing now covers all 15 PRD §10.1 intents: every intent has a
  recognition rule (USE_AGENT added 2026-10-03, ordered before SEARCH_AGENT's
  bare-term branch) and a dedicated router path, except `CREATE_AGENT`,
  whose real platform is a declared Phase-2 boundary — the router honestly
  recommends the existing agent roster instead (`reply.createAgent.recommend`).
