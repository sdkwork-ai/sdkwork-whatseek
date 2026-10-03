---
id: REQ-2026-0003
title: WhatSeek app center with discovery, search, detail, invoke, my apps, and AI app creation
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

# REQ-2026-0003 — App Center: Discovery, Search, Detail, Invoke, My Apps, AI App Creation

## Goals

- App center home: search bar "搜索应用，或者直接告诉我你要做什么", AI 创建应用 entry, 推荐/热门/分类 sections, 我的应用 and 最近使用 entries.
- App center home integrates the sdkwork-appstore home feed (sdkwork-appstore PRD §4.2.1 首页编辑流 / §5.1): hero banner carousel, editorial story rail, curated collection rail opening a collection detail screen, 为你推荐 two-column grid, and charts quick view (热门榜/免费榜/新品榜) with a full charts screen.
- Categories follow PRD §14 (效率, 办公, 编程, 设计, 图片, 视频, 音频, 电商, 营销, 教育, 金融, 生活, 社交, 游戏, 企业, AI Agent).
- Search supports keyword and natural-language queries over the catalog; results show name, summary, category, rating, users, price, AI capability.
- App detail: icon, name, summary, developer, category, screenshots placeholder, rating, users, updated time, permissions, price, AI capability, primary action 立即使用, secondary 基于此创建.
- 立即使用 opens an in-app app runner screen (mock runtime) and records 最近使用.
- AI app creation flow: 需求理解 → 功能拆解方案 → 确认/生成 → 生成进度 → 预览 → 追加修改指令 → 发布 → app saved into 我的应用 with lifecycle Draft/Generating/Preview/Published/Updated/Archived.
- 我的应用 clearly separates user-created apps from favorited third-party apps; supports open, edit (continue AI modification), share (copy), delete, and version display.

## Non-Goals

- Real generated-app code execution (runner is a mock preview).
- Developer publishing/review, monetization, version rollback UI.

## Acceptance Criteria

1. Apps service tests: search by keyword and natural language; category filter; recent usage recording; created-app lifecycle transitions publish into 我的应用.
2. App detail renders all PRD §16 fields from catalog data; missing optional fields degrade gracefully.
3. Creation flow test: plan → generate → preview → modify ("增加订单管理" adds a module) → publish → appears in 我的应用 and in chat confirmation.
4. UI covers loading/empty/error/success states for catalog and 我的应用 lists.
5. Home feed test: `listHomeFeed` serves heroes, stories, collections (with resolved cover apps), and chart previews; charts rank 热门榜 by users, 免费榜 by rating, 新品榜 by recency; `getCollection`/`listCollectionApps` resolve a curated collection.

## Verification

```bash
pnpm --filter @sdkwork/whatseek-h5-apps test
pnpm typecheck && pnpm test
```
