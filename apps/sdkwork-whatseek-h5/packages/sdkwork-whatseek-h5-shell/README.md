# sdkwork-whatseek-h5-shell

Navigation chrome for the WhatSeek H5 app: `MobileLayout` (safe-area aware phone frame) and `TabBar` (the fixed five-tab bottom navigation: 对话 Chat ｜ 应用 Apps ｜ 通讯录 Contacts ｜ 消息 Messages ｜ 我的 Profile).

Tab ownership sits with the shell so every capability package renders inside the same navigation container (APP_H5_ARCHITECTURE_SPEC.md §10). Tab definitions come from core (`WHATSEEK_TABS`); the unread badge on 消息 subscribes to the core badge store.
