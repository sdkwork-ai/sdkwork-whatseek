# sdkwork-whatseek-h5-apps

AI 原生应用中心 (app center) capability: discovery (推荐/热门/分类), keyword + natural-language search, app detail, in-app invoke (runner), 我的应用 (created + favorited), and the AI app creation flow (需求理解 → 功能拆解方案 → 生成 → 预览 → 持续修改 → 发布).

Implements the `AppsPort` from core as the standalone mock client (`createMockAppsClient`, localStorage-persisted); Phase 2 swaps it for the generated appstore app SDK client registered in the same slot.

Screens: AppsHomeScreen, AppSearchScreen, AppDetailScreen, AppRunnerScreen, AppCreateScreen, MyAppsScreen.
