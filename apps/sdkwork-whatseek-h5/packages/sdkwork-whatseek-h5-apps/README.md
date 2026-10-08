# sdkwork-whatseek-h5-apps

AI 原生应用中心 (app center) capability: discovery (推荐/热门/分类), keyword + natural-language search, app detail, in-app invoke (runner), 我的应用 (created + favorited), and the AI app creation flow (需求理解 → 功能拆解方案 → 生成 → 预览 → 持续修改 → 发布).

Implements the `AppsPort` from core with two drivers sharing one slot: the standalone mock client (`createMockAppsClient`, localStorage-persisted) and the sdkwork-appstore driver (`createAppstoreAppsClient` over the composed `@sdkwork/appstore-app-sdk` consumer package, `/app/v3/api`). Bootstrap selects the appstore driver when the runtime env declares `sdkworkAppstoreApiBaseUrl`; the home feed (hero carousel / curated collections / 榜单速览), search, categories, and recommendations then come from the appstore catalog, while whatseek-local user scope (最近使用, 收藏, 我的应用, AI 创建 lifecycle) stays on the mock client until the appstore user-library family lands.

Screens: AppsHomeScreen, AppSearchScreen, AppDetailScreen, AppRunnerScreen, AppCreateScreen, MyAppsScreen.
