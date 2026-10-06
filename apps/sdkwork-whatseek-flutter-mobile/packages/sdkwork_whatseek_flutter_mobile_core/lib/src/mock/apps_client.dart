/// Standalone mock clients (Phase 1) — the Dart port of the shared TS service
/// family. In-memory only; the port shapes mirror
/// `@sdkwork/whatseek-service-core` so Phase 2 swaps them for generated SDK
/// clients behind identical interfaces.
library;

import '../models.dart';

class MockAppsClient {
  final List<WhatseekApp> _catalog;
  final List<String> _recentIds = [];
  final Set<String> _favoriteIds = {};
  final List<CreatedApp> _createdApps = [];

  MockAppsClient({List<WhatseekApp>? catalog}) : _catalog = catalog ?? kDefaultCatalog;

  Future<List<AppRecommendation>> searchApps(String query) async {
    final keywords = extractSearchKeywords(query);
    final results = <AppRecommendation>[];
    for (final app in _catalog) {
      var score = 0.0;
      var reason = '';
      for (final keyword in keywords) {
        if (app.name.toLowerCase().contains(keyword)) {
          score += 6;
          reason = keyword;
        }
        for (final tag in app.tags) {
          if (tag.toLowerCase().contains(keyword)) {
            score += 4;
            reason = tag;
          }
        }
        if (app.summary.toLowerCase().contains(keyword)) {
          score += 2;
          reason = reason.isEmpty ? keyword : reason;
        }
      }
      if (score > 0) {
        results.add(AppRecommendation(app: app, reason: reason));
      }
    }
    results.sort((a, b) => 0);
    return results;
  }

  Future<List<WhatseekApp>> listRecommended() async =>
      _catalog.where((app) => app.aiCapability).take(6).toList();

  Future<List<WhatseekApp>> listHot() async => _catalog.take(8).toList();

  /// Appstore-style home feed (PRD §4.2.1 首页编辑流 / §5.1): hero banner
  /// carousel → editorial stories → curated collections → chart quick views
  /// (TS `buildWhatseekHomeFeed` port).
  Future<AppHomeFeed> listHomeFeed() async => buildWhatseekHomeFeed(_catalog);

  Future<AppCollection?> getCollection(String collectionId) async =>
      findWhatseekCollection(collectionId);

  Future<List<WhatseekApp>> listCollectionApps(String collectionId) async =>
      listWhatseekCollectionApps(collectionId, _catalog);

  Future<List<WhatseekApp>> listChart(AppChartId chartId) async =>
      listWhatseekChartApps(chartId, _catalog);

  Future<List<AppCategory>> listCategories() async => const [
        AppCategory(id: 'efficiency', labelKey: 'whatseek.apps.category.efficiency', icon: '⚡'),
        AppCategory(id: 'office', labelKey: 'whatseek.apps.category.office', icon: '🗂️'),
        AppCategory(id: 'coding', labelKey: 'whatseek.apps.category.coding', icon: '💻'),
        AppCategory(id: 'design', labelKey: 'whatseek.apps.category.design', icon: '🎨'),
        AppCategory(id: 'image', labelKey: 'whatseek.apps.category.image', icon: '🖼️'),
        AppCategory(id: 'video', labelKey: 'whatseek.apps.category.video', icon: '🎬'),
        AppCategory(id: 'audio', labelKey: 'whatseek.apps.category.audio', icon: '🎧'),
        AppCategory(id: 'ecommerce', labelKey: 'whatseek.apps.category.ecommerce', icon: '🛒'),
        AppCategory(id: 'marketing', labelKey: 'whatseek.apps.category.marketing', icon: '📣'),
        AppCategory(id: 'education', labelKey: 'whatseek.apps.category.education', icon: '📚'),
        AppCategory(id: 'finance', labelKey: 'whatseek.apps.category.finance', icon: '💰'),
        AppCategory(id: 'life', labelKey: 'whatseek.apps.category.life', icon: '🍵'),
        AppCategory(id: 'social', labelKey: 'whatseek.apps.category.social', icon: '💬'),
        AppCategory(id: 'games', labelKey: 'whatseek.apps.category.games', icon: '🎮'),
        AppCategory(id: 'enterprise', labelKey: 'whatseek.apps.category.enterprise', icon: '🏢'),
        AppCategory(id: 'agent', labelKey: 'whatseek.apps.category.agent', icon: '🤖'),
      ];

  Future<WhatseekApp?> getApp(String appId) async {
    for (final app in _catalog) {
      if (app.id == appId) {
        return app;
      }
    }
    return null;
  }

  /// Opens an app (PRD 应用调用): records it as recently used on success and
  /// throws [WhatseekPermissionDeniedException] for enterprise apps when the
  /// session is a visitor (H5 parity). Returns `null` when the app is unknown.
  Future<WhatseekApp?> openApp(String appId, {bool isVisitor = false}) async {
    final app = await getApp(appId);
    if (app == null) {
      return null;
    }
    if (app.kind == WhatseekAppKind.enterprise && isVisitor) {
      throw const WhatseekPermissionDeniedException();
    }
    await recordRecent(appId);
    return app;
  }

  Future<void> recordRecent(String appId) async {
    _recentIds
      ..remove(appId)
      ..insert(0, appId);
  }

  Future<List<WhatseekApp>> listRecent() async {
    final results = <WhatseekApp>[];
    for (final id in _recentIds.take(8)) {
      final app = await getApp(id);
      if (app != null) {
        results.add(app);
      }
    }
    return results;
  }

  Future<List<WhatseekApp>> listFavorites() async {
    final results = <WhatseekApp>[];
    for (final id in _favoriteIds) {
      final app = await getApp(id);
      if (app != null) {
        results.add(app);
      }
    }
    return results;
  }

  Future<bool> toggleFavorite(String appId) async {
    if (_favoriteIds.contains(appId)) {
      _favoriteIds.remove(appId);
      return false;
    }
    _favoriteIds.add(appId);
    return true;
  }

  Future<List<CreatedApp>> listMyApps() async => List.unmodifiable(_createdApps);

  Future<CreatedApp?> getMyApp(String appId) async {
    for (final app in _createdApps) {
      if (app.id == appId) {
        return app;
      }
    }
    return null;
  }

  Future<void> deleteMyApp(String appId) async {
    _createdApps.removeWhere((app) => app.id == appId);
  }

  ({List<String> modules, String title}) draftCreationPlan(String requirement) {
    final lowered = requirement.toLowerCase();
    final modules = <String>[];
    void addAll(List<String> candidates) {
      for (final module in candidates) {
        if (!modules.contains(module)) {
          modules.add(module);
        }
      }
    }

    if (_containsAny(lowered, ['库存', '进销存', '仓库'])) {
      addAll(['商品入库', '出库管理', '库存盘点', '库存预警', '库存统计']);
    }
    if (_containsAny(lowered, ['客户', 'crm', '销售'])) {
      addAll(['客户列表', '客户详情', '跟进记录', '标签', '搜索', '数据统计']);
    }
    if (_containsAny(lowered, ['独立站', '商城', '电商', '店铺'])) {
      addAll(['首页', '商品页', '购物车', '订单', '客户管理', '营销页面']);
    }
    if (modules.isEmpty) {
      addAll(['首页', '列表', '详情', '设置', '数据统计']);
    }
    return (modules: modules, title: '「${requirement.trim()}」生成方案');
  }

  Future<CreatedApp> createAppFromPlan(String requirement, List<String> modules) async {
    final now = DateTime.now();
    final created = CreatedApp(
      id: 'gen-${now.millisecondsSinceEpoch.toRadixString(36)}',
      name: _deriveAppName(requirement),
      requirement: requirement.trim(),
      modules: List.unmodifiable(modules),
      lifecycle: CreatedAppLifecycle.preview,
      createdAt: now,
      updatedAt: now,
      versions: const ['0.1.0'],
      icon: '🧩',
    );
    _createdApps.insert(0, created);
    return created;
  }

  Future<CreatedApp> modifyApp(String appId, String instruction) async {
    final index = _createdApps.indexWhere((app) => app.id == appId);
    if (index < 0) {
      throw StateError('created app not found: $appId');
    }
    final existing = _createdApps[index];
    final version = existing.versions.last;
    final patch = version.split('.');
    final nextVersion =
        '${patch[0]}.${patch[1]}.${int.parse(patch[2]) + 1}';
    final updated = CreatedApp(
      id: existing.id,
      name: existing.name,
      requirement: existing.requirement,
      modules: [...existing.modules, instruction.trim()],
      lifecycle: existing.lifecycle,
      createdAt: existing.createdAt,
      updatedAt: DateTime.now(),
      versions: [...existing.versions, nextVersion],
      icon: existing.icon,
    );
    _createdApps[index] = updated;
    return updated;
  }

  Future<CreatedApp> publishApp(String appId) async {
    final index = _createdApps.indexWhere((app) => app.id == appId);
    if (index < 0) {
      throw StateError('created app not found: $appId');
    }
    final existing = _createdApps[index];
    final published = CreatedApp(
      id: existing.id,
      name: existing.name,
      requirement: existing.requirement,
      modules: existing.modules,
      lifecycle: CreatedAppLifecycle.published,
      createdAt: existing.createdAt,
      updatedAt: DateTime.now(),
      versions: existing.versions,
      icon: existing.icon,
    );
    _createdApps[index] = published;
    return published;
  }

  static bool _containsAny(String input, List<String> needles) =>
      needles.any(input.contains);

  static String _deriveAppName(String requirement) {
    var name = requirement
        .trim()
        .replaceFirst(RegExp('^帮我'), '')
        .replaceAll(RegExp('(创建|做一个|做|生成|开发|搭建|制作)'), '')
        .trim();
    if (name.isEmpty) {
      name = requirement.trim();
    }
    return name.length > 12 ? '${name.substring(0, 12)}…' : name;
  }
}

const List<WhatseekApp> kDefaultCatalog = [
  WhatseekApp(
    id: 'clip-master',
    name: '剪辑大师',
    summary: '智能视频剪辑：自动粗剪、字幕、配乐，支持多轨道时间线。',
    developer: '问寻工作室',
    category: 'video',
    kind: WhatseekAppKind.ai,
    icon: '🎬',
    rating: 4.8,
    usersLabel: '2.3万',
    priceLabel: '免费',
    aiCapability: true,
    tags: ['视频剪辑', '字幕', '粗剪'],
    updatedAt: '2026-09-28',
    permissions: ['相册', '麦克风'],
  ),
  WhatseekApp(
    id: 'image-studio',
    name: '图片工坊',
    summary: 'AI 图片生成与编辑：商品海报、抠图、扩图一站完成。',
    developer: '问寻工作室',
    category: 'image',
    kind: WhatseekAppKind.ai,
    icon: '🖼️',
    rating: 4.7,
    usersLabel: '1.8万',
    priceLabel: '免费',
    aiCapability: true,
    tags: ['图片生成', '海报', '抠图'],
    updatedAt: '2026-09-25',
    permissions: ['相册'],
  ),
  WhatseekApp(
    id: 'xhs-title',
    name: '小红书标题生成器',
    summary: '爆款标题一键生成：输入主题，输出 10 条高点击标题。',
    developer: '创作者小队',
    category: 'marketing',
    kind: WhatseekAppKind.ai,
    icon: '✍️',
    rating: 4.6,
    usersLabel: '9562',
    priceLabel: '免费',
    aiCapability: true,
    tags: ['小红书', '标题', '文案'],
    updatedAt: '2026-09-20',
    permissions: [],
  ),
  WhatseekApp(
    id: 'crm-manager',
    name: '客户管家 CRM',
    summary: '轻量客户管理：客户列表、跟进记录、标签与统计看板。',
    developer: '云途软件',
    category: 'enterprise',
    // Enterprise-kind app (service-core parity): visitors get the runner
    // permission-denied state.
    kind: WhatseekAppKind.enterprise,
    icon: '🤝',
    rating: 4.5,
    usersLabel: '1.1万',
    priceLabel: '¥12/月',
    aiCapability: true,
    tags: ['客户管理', 'CRM', '销售'],
    updatedAt: '2026-09-18',
    permissions: ['联系人'],
  ),
  WhatseekApp(
    id: 'stock-keeper',
    name: '库存管家',
    summary: '进销存一体化：入库、出库、盘点与库存预警。',
    developer: '云途软件',
    category: 'enterprise',
    kind: WhatseekAppKind.web,
    icon: '📦',
    rating: 4.4,
    usersLabel: '7312',
    priceLabel: '¥8/月',
    aiCapability: false,
    tags: ['库存', '进销存', '仓库'],
    updatedAt: '2026-09-12',
    permissions: [],
  ),
  WhatseekApp(
    id: 'cross-border-picker',
    name: '跨境选品助手',
    summary: '跨境选品雷达：趋势品类、竞品价格、利润测算。',
    developer: '出海工具集',
    category: 'ecommerce',
    kind: WhatseekAppKind.ai,
    icon: '🚢',
    rating: 4.6,
    usersLabel: '1.5万',
    priceLabel: '订阅 ¥29/月',
    aiCapability: true,
    tags: ['跨境', '选品', '电商'],
    updatedAt: '2026-09-30',
    permissions: [],
  ),
  WhatseekApp(
    id: 'code-mate',
    name: '代码助手',
    summary: 'AI 结对编程：补全、解释、重构、单测生成。',
    developer: 'BirdCoder',
    category: 'coding',
    kind: WhatseekAppKind.ai,
    icon: '💻',
    rating: 4.9,
    usersLabel: '5.6万',
    priceLabel: '订阅 ¥20/月',
    aiCapability: true,
    tags: ['编程', 'AI', '单测'],
    updatedAt: '2026-10-01',
    permissions: ['文件'],
  ),
  WhatseekApp(
    id: 'contract-review',
    name: '合同审查助手',
    summary: 'AI 合同审查：风险条款标注、缺失条款提示。',
    developer: '企业服务社',
    category: 'enterprise',
    kind: WhatseekAppKind.ai,
    icon: '📜',
    rating: 4.7,
    usersLabel: '5120',
    priceLabel: '企业授权',
    aiCapability: true,
    tags: ['合同', '法务', '审查'],
    updatedAt: '2026-09-26',
    permissions: ['文件'],
  ),
  WhatseekApp(
    id: 'schedule-pro',
    name: '日程管家',
    summary: '日程管理：自然语言建日程，多端提醒不遗漏。',
    developer: '效率引擎',
    category: 'efficiency',
    kind: WhatseekAppKind.web,
    icon: '📅',
    rating: 4.6,
    usersLabel: '2.1万',
    priceLabel: '免费',
    aiCapability: true,
    tags: ['日程', '提醒', '效率'],
    updatedAt: '2026-09-22',
    permissions: ['通知'],
  ),
  WhatseekApp(
    id: 'news-agent',
    name: '行业新闻整理 Agent',
    summary: '每天定时整理行业新闻摘要，推送到消息中心。',
    developer: '问寻官方',
    category: 'agent',
    kind: WhatseekAppKind.agent,
    icon: '🤖',
    rating: 4.8,
    usersLabel: '9863',
    priceLabel: '免费',
    aiCapability: true,
    tags: ['Agent', '新闻', '定时任务'],
    updatedAt: '2026-09-27',
    permissions: ['通知'],
  ),
  // Remaining shared-catalog entries (service-core `catalog.ts` parity) —
  // the appstore home feed's editorial appIds resolve against them.
  WhatseekApp(
    id: 'meeting-notes',
    name: '会议纪要助手',
    summary: '录音转纪要：自动区分发言人，输出待办清单。',
    developer: '效率引擎',
    category: 'office',
    kind: WhatseekAppKind.ai,
    icon: '📝',
    rating: 4.7,
    usersLabel: '3.4万',
    priceLabel: '免费',
    aiCapability: true,
    tags: ['会议', '纪要', '转写'],
    updatedAt: '2026-09-29',
    permissions: ['麦克风', '文件'],
  ),
  WhatseekApp(
    id: 'site-builder',
    name: '独立站搭建器',
    summary: '30 分钟搭好独立站：首页、商品页、购物车、订单模板齐全。',
    developer: '出海工具集',
    category: 'ecommerce',
    kind: WhatseekAppKind.web,
    icon: '🏗️',
    rating: 4.3,
    usersLabel: '6891',
    priceLabel: '免费',
    aiCapability: true,
    tags: ['独立站', '建站', '电商'],
    updatedAt: '2026-09-08',
    permissions: [],
  ),
  WhatseekApp(
    id: 'audio-scribe',
    name: '音频转写',
    summary: '音频转文字：中英混合识别，支持导出 SRT 字幕。',
    developer: '效率引擎',
    category: 'audio',
    kind: WhatseekAppKind.ai,
    icon: '🎧',
    rating: 4.5,
    usersLabel: '1.2万',
    priceLabel: '免费',
    aiCapability: true,
    tags: ['转写', '字幕', '音频'],
    updatedAt: '2026-09-15',
    permissions: ['麦克风', '文件'],
  ),
  WhatseekApp(
    id: 'ledger-lite',
    name: '轻记账',
    summary: '极简记账：拍照记一笔，自动分类月度报表。',
    developer: '生活小队',
    category: 'finance',
    kind: WhatseekAppKind.mini,
    icon: '💰',
    rating: 4.4,
    usersLabel: '2.9万',
    priceLabel: '免费',
    aiCapability: true,
    tags: ['记账', '财务', '报表'],
    updatedAt: '2026-09-10',
    permissions: ['相册'],
  ),
  WhatseekApp(
    id: 'study-notes',
    name: '学习笔记',
    summary: 'AI 学习笔记：划线摘录自动整理成知识卡片。',
    developer: '教育实验室',
    category: 'education',
    kind: WhatseekAppKind.ai,
    icon: '📚',
    rating: 4.5,
    usersLabel: '8734',
    priceLabel: '免费',
    aiCapability: true,
    tags: ['笔记', '学习', '知识卡'],
    updatedAt: '2026-09-05',
    permissions: [],
  ),
  WhatseekApp(
    id: 'city-bites',
    name: '附近探店',
    summary: '发现附近好店：真实评价、人均与排队情况。',
    developer: '生活小队',
    category: 'life',
    kind: WhatseekAppKind.external,
    icon: '🍵',
    rating: 4.2,
    usersLabel: '4.7万',
    priceLabel: '免费',
    aiCapability: false,
    tags: ['探店', '美食', '附近'],
    updatedAt: '2026-08-30',
    permissions: ['地理位置'],
  ),
  WhatseekApp(
    id: 'interest-clubs',
    name: '兴趣社群',
    summary: '找到同好：读书会、爬山队、桌游局，一键加入。',
    developer: '社群科技',
    category: 'social',
    kind: WhatseekAppKind.web,
    icon: '💬',
    rating: 4.1,
    usersLabel: '1.9万',
    priceLabel: '免费',
    aiCapability: false,
    tags: ['社群', '兴趣', '活动'],
    updatedAt: '2026-08-26',
    permissions: ['通知'],
  ),
  WhatseekApp(
    id: 'game-center',
    name: '棋牌游戏中心',
    summary: '斗地主、麻将、象棋，随时开局。',
    developer: '游戏工坊',
    category: 'games',
    kind: WhatseekAppKind.web,
    icon: '🎮',
    rating: 4.0,
    usersLabel: '6.8万',
    priceLabel: '免费',
    aiCapability: false,
    tags: ['棋牌', '游戏', '休闲'],
    updatedAt: '2026-09-01',
    permissions: [],
  ),
  WhatseekApp(
    id: 'data-board',
    name: '数据看板',
    summary: '业务数据一屏掌握：指标卡、趋势图、异常提醒。',
    developer: '云途软件',
    category: 'office',
    kind: WhatseekAppKind.web,
    icon: '📊',
    rating: 4.5,
    usersLabel: '1.6万',
    priceLabel: '¥15/月',
    aiCapability: true,
    tags: ['数据', '看板', '统计'],
    updatedAt: '2026-09-24',
    permissions: [],
  ),
];

/// Appstore-style home feed (sdkwork-appstore PRD §4.2.1 首页编辑流): hero
/// banner carousel → editorial story rail → curated collection rail → 为你推荐
/// grid → charts quick view. Hero/story/collection content is editorial seed
/// data over the Phase 1 catalog; charts derive from catalog metrics (TS
/// `homeFeed.ts` port).
const List<AppHeroSlide> kWhatseekHomeHeroes = [
  AppHeroSlide(
    id: 'hero-ai-coding',
    title: 'AI 编程季',
    tagline: '从补全到单测，代码助手全程结对',
    badge: '编辑推荐',
    appId: 'code-mate',
    icon: '💻',
  ),
  AppHeroSlide(
    id: 'hero-go-global',
    title: '出海工具箱',
    tagline: '选品、建站、内容营销一站式起步',
    badge: '专题',
    appId: 'cross-border-picker',
    icon: '🚢',
  ),
  AppHeroSlide(
    id: 'hero-office-week',
    title: '高效办公周',
    tagline: '纪要、日程、看板，把重复工作交出去',
    badge: '限时活动',
    appId: 'meeting-notes',
    icon: '📝',
  ),
];

const List<AppStoryCard> kWhatseekHomeStories = [
  AppStoryCard(
    id: 'story-create-by-asking',
    title: '一句话，生成一个应用',
    subtitle: '看看问寻用户用 AI 造出了什么',
    appId: 'news-agent',
    icon: '🤖',
  ),
  AppStoryCard(
    id: 'story-short-video',
    title: '短视频团队的效率革命',
    subtitle: '剪辑、字幕、标题的全流程工具链',
    appId: 'clip-master',
    icon: '🎬',
  ),
  AppStoryCard(
    id: 'story-contract',
    title: '中小企业的法务外脑',
    subtitle: '合同审查从半天缩短到三分钟',
    appId: 'contract-review',
    icon: '📜',
  ),
];

const List<AppCollection> kWhatseekHomeCollections = [
  AppCollection(
    id: 'col-efficiency-picks',
    title: '提升效率的 6 款工具',
    description: '从日程到纪要，把重复工作交给应用。',
    kind: AppCollectionKind.editorial,
    appIds: ['schedule-pro', 'meeting-notes', 'audio-scribe', 'study-notes', 'code-mate', 'data-board'],
  ),
  AppCollection(
    id: 'col-go-global',
    title: '出海起步指南',
    description: '选品、建站、内容营销的入门组合。',
    kind: AppCollectionKind.theme,
    appIds: ['cross-border-picker', 'site-builder', 'xhs-title'],
  ),
  AppCollection(
    id: 'col-business-suite',
    title: '小企业经营四件套',
    description: '客户、库存、账目、数据一处打理。',
    kind: AppCollectionKind.editorial,
    appIds: ['crm-manager', 'stock-keeper', 'ledger-lite', 'data-board'],
  ),
  AppCollection(
    id: 'col-after-work',
    title: '下班后的第三空间',
    description: '探店、社群、棋牌，给生活留点空隙。',
    kind: AppCollectionKind.theme,
    appIds: ['city-bites', 'interest-clubs', 'game-center'],
  ),
];

/// Entries shown in a home chart quick view; the charts screen lists all ten.
const int kHomeChartPreviewSize = 3;

/// Full chart length on the charts screen.
const int kChartSize = 10;

/// Parses `usersLabel` shapes like `9562` / `2.3万` into comparable counts
/// (TS `parseUsersLabel` port).
double parseWhatseekUsersLabel(String label) {
  final match = RegExp(r'^([\d.]+)(万)?$').firstMatch(label.trim());
  if (match == null) {
    return 0;
  }
  final value = double.tryParse(match.group(1) ?? '0');
  if (value == null) {
    return 0;
  }
  return match.group(2) == null ? value : value * 10000;
}

/// Chart derivation over the catalog: 热门榜 by user count, 免费榜 by rating,
/// 新品榜 by update date (TS `listWhatseekChartApps` port).
List<WhatseekApp> listWhatseekChartApps(AppChartId chartId, [List<WhatseekApp>? catalog]) {
  final apps = [...(catalog ?? kDefaultCatalog)];
  switch (chartId) {
    case AppChartId.hot:
      apps.sort((left, right) => parseWhatseekUsersLabel(right.usersLabel)
          .compareTo(parseWhatseekUsersLabel(left.usersLabel)));
      return apps.take(kChartSize).toList();
    case AppChartId.free:
      final freeApps = apps.where((app) => app.priceLabel == '免费').toList()
        ..sort((left, right) => right.rating.compareTo(left.rating));
      return freeApps.take(kChartSize).toList();
    case AppChartId.newest:
      apps.sort((left, right) => right.updatedAt.compareTo(left.updatedAt));
      return apps.take(kChartSize).toList();
  }
}

/// Composes the home feed: chart quick views plus collection cards with their
/// cover apps resolved (TS `buildWhatseekHomeFeed` port).
AppHomeFeed buildWhatseekHomeFeed([List<WhatseekApp>? catalog]) {
  final apps = catalog ?? kDefaultCatalog;
  final charts = [
    for (final chartId in AppChartId.values)
      AppChartPreview(
        id: chartId,
        apps: listWhatseekChartApps(chartId, apps).take(kHomeChartPreviewSize).toList(),
      ),
  ];
  final collections = [
    for (final collection in kWhatseekHomeCollections)
      AppCollectionCard(
        id: collection.id,
        title: collection.title,
        description: collection.description,
        kind: collection.kind,
        coverApps:
            listWhatseekCollectionApps(collection.id, apps).take(4).toList(),
      ),
  ];
  return AppHomeFeed(
    heroes: [...kWhatseekHomeHeroes],
    stories: [...kWhatseekHomeStories],
    collections: collections,
    charts: charts,
  );
}

AppCollection? findWhatseekCollection(String collectionId) {
  for (final collection in kWhatseekHomeCollections) {
    if (collection.id == collectionId) {
      return collection;
    }
  }
  return null;
}

/// Resolves a collection's curated ids against the catalog; unknown ids are
/// skipped (TS `listWhatseekCollectionApps` port).
List<WhatseekApp> listWhatseekCollectionApps(String collectionId, [List<WhatseekApp>? catalog]) {
  final collection = findWhatseekCollection(collectionId);
  if (collection == null) {
    return const [];
  }
  final appsById = {for (final app in catalog ?? kDefaultCatalog) app.id: app};
  return [
    for (final appId in collection.appIds)
      if (appsById[appId] != null) appsById[appId]!,
  ];
}

/// Keyword extraction for natural-language search — the Dart port of the TS
/// `extractSearchKeywords` (stopword stripping keeps zh/en domain tokens).
List<String> extractSearchKeywords(String query) {
  const stopwords = [
    '帮我', '找一个', '找一下', '想要', '需要', '有没有', '推荐', '适合', '支持',
    '可以', '一个', '一款', '工具', '软件', '应用', '的', '了', '吗', '呢', '和',
    '跟', '与', '还有', 'please', 'find', 'search', 'look', 'for', 'want',
    'need', 'recommend', 'suitable', 'tool', 'software', 'application', 'app',
    'a', 'an', 'the', 'me', 'my', 'with', 'that',
  ];
  final normalized = query.toLowerCase().trim();
  if (normalized.isEmpty) {
    return const [];
  }
  final keywords = <String>[];
  for (final segment in normalized.split(RegExp(r'[\s,，。.、;；!！?？/\\]+'))) {
    var remaining = segment;
    for (final stopword in stopwords) {
      remaining = remaining.split(stopword).join(' ');
    }
    for (final token in remaining.split(RegExp(r'\s+'))) {
      if (token.isNotEmpty && !keywords.contains(token)) {
        keywords.add(token);
      }
    }
  }
  return keywords;
}
