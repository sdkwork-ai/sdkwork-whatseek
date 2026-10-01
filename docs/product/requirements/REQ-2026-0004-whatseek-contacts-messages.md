---
id: REQ-2026-0004
title: WhatSeek contacts, unified messages, and profile digital assets
owner: sdkwork-whatseek team
status: implemented
priority: P0
affected_surfaces: [h5]
trace:
  prd: docs/product/prd/PRD.md
  specs:
    - APP_H5_ARCHITECTURE_SPEC.md
    - APP_MOBILE_REACT_UI_SPEC.md
    - FRONTEND_CODE_SPEC.md
---

# REQ-2026-0004 — Contacts, Unified Messages, And Profile Digital Assets

## Goals

- Contacts tab: segmented list of 联系人 (people), 群组, 企业/商家/供应商/服务商, Agent, AI 助手; search by name; contact detail shows avatar, nickname, bio, tags, company, and 发消息 action that deep-links into a message conversation.
- Messages tab: unified event center listing 私聊, 群聊, 系统通知, 应用通知, Agent 消息, AI 任务通知 with unread badges; conversation view supports send/receive; AI task notifications ("你的视频已经生成") link back to task results in chat.
- Profile tab (我的): user card with mock session (login/logout), 我的应用 entry, 收藏 entry, settings (dark mode toggle, language switch), about section. Personal digital assets (对话/应用/Agent/联系人/消息) summarized.

## Non-Goals

- Real IM transport, presence, push notifications.
- Social graph operations (add/delete friend flows beyond seeded data).

## Acceptance Criteria

1. Contacts service tests: list by segment, search, detail lookup; 发消息 navigates to (or creates) the conversation with that contact.
2. Messages service tests: unread counts aggregate; sending a message appends to the conversation; completing an AI task posts a notification entry linking to the task.
3. Profile settings toggles persist theme and language across reloads (localStorage).
4. UI covers loading/empty/error/success states for contacts, messages, and conversation views.

## Verification

```bash
pnpm --filter @sdkwork/whatseek-h5-contacts test
pnpm --filter @sdkwork/whatseek-h5-messages test
pnpm --filter @sdkwork/whatseek-h5-profile test
pnpm typecheck && pnpm test
```
