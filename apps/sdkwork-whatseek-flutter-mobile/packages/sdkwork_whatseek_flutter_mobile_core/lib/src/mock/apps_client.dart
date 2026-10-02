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

  Future<List<AppCategory>> listCategories() async => const [
        AppCategory(id: 'efficiency', label: '效率', icon: '⚡'),
        AppCategory(id: 'office', label: '办公', icon: '🗂️'),
        AppCategory(id: 'coding', label: '编程', icon: '💻'),
        AppCategory(id: 'design', label: '设计', icon: '🎨'),
        AppCategory(id: 'image', label: '图片', icon: '🖼️'),
        AppCategory(id: 'video', label: '视频', icon: '🎬'),
        AppCategory(id: 'audio', label: '音频', icon: '🎧'),
        AppCategory(id: 'ecommerce', label: '电商', icon: '🛒'),
        AppCategory(id: 'marketing', label: '营销', icon: '📣'),
        AppCategory(id: 'education', label: '教育', icon: '📚'),
        AppCategory(id: 'finance', label: '金融', icon: '💰'),
        AppCategory(id: 'life', label: '生活', icon: '🍵'),
        AppCategory(id: 'social', label: '社交', icon: '💬'),
        AppCategory(id: 'games', label: '游戏', icon: '🎮'),
        AppCategory(id: 'enterprise', label: '企业', icon: '🏢'),
        AppCategory(id: 'agent', label: 'AI Agent', icon: '🤖'),
      ];

  Future<WhatseekApp?> getApp(String appId) async {
    for (final app in _catalog) {
      if (app.id == appId) {
        return app;
      }
    }
    return null;
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
    kind: WhatseekAppKind.web,
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
];

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
