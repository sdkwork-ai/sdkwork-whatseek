import 'package:flutter/material.dart';

import "package:sdkwork_whatseek_flutter_mobile_core/sdkwork_whatseek_flutter_mobile_core.dart";
import "package:sdkwork_whatseek_flutter_mobile_commons/sdkwork_whatseek_flutter_mobile_commons.dart";

import 'i18n/apps_strings.dart';

/// 应用 tab root (PRD §13 + sdkwork-appstore PRD §4.2.1 首页编辑流 / §5.1):
/// search prompt, AI 创建应用 entry and 我的应用 / 收藏 links on top, then
/// the appstore home feed — hero carousel → 今日精选 stories → 编辑精选
/// collections → 为你推荐 grid → 榜单速览 quick view (查看完整榜单) →
/// category chips → 最近使用 (H5 `AppsHomeScreen` parity). Category chips
/// jump into the dedicated search route (`app.whatseek.apps.search`).
class AppsHomeScreen extends StatefulWidget {
  const AppsHomeScreen({super.key, this.onOpenApp});

  final ValueChanged<String>? onOpenApp;

  @override
  State<AppsHomeScreen> createState() => _AppsHomeScreenState();
}

/// One snapshot of everything the home needs, loaded through the injected
/// apps client (home feed / recommended / recent / categories).
typedef _HomeData = (
  AppHomeFeed feed,
  List<WhatseekApp> recommended,
  List<WhatseekApp> recent,
  List<AppCategory> categories
);

class _AppsHomeScreenState extends State<AppsHomeScreen> {
  late Future<_HomeData> _data;

  @override
  void initState() {
    super.initState();
    _reload();
  }

  void _reload() {
    setState(() {
      _data = _load();
    });
  }

  Future<_HomeData> _load() async {
    final apps = WhatseekRuntime.instance.apps;
    final feed = await apps.listHomeFeed();
    final recommended = await apps.listRecommended();
    final recent = await apps.listRecent();
    final categories = await apps.listCategories();
    return (feed, recommended, recent, categories);
  }

  void _openSearch(String query) {
    Navigator.of(context).pushNamed(
      'app.whatseek.apps.search',
      arguments: query.trim(),
    );
  }

  void _openDetail(String appId) {
    if (widget.onOpenApp != null) {
      widget.onOpenApp!(appId);
      return;
    }
    Navigator.of(context).pushNamed('app.whatseek.apps.detail', arguments: appId);
  }

  void _openCreate() {
    Navigator.of(context).pushNamed('app.whatseek.apps.create');
  }

  void _openMyApps() {
    Navigator.of(context).pushNamed('app.whatseek.apps.my');
  }

  void _openCharts() {
    Navigator.of(context).pushNamed('app.whatseek.apps.charts');
  }

  void _openCollection(String collectionId) {
    Navigator.of(context).pushNamed(
      'app.whatseek.apps.collection',
      arguments: collectionId,
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text(WhatseekAppsStrings.of(context, 'home.title'))),
      body: FutureBuilder<_HomeData>(
        future: _data,
        builder: (context, snapshot) {
          if (snapshot.connectionState != ConnectionState.done) {
            return const ScreenState(state: ScreenStateKind.loading);
          }
          if (snapshot.hasError) {
            return ScreenState(
              state: ScreenStateKind.error,
              onRetry: _reload,
            );
          }
          final (feed, recommended, recent, categories) = snapshot.data ??
              (
                const AppHomeFeed(
                    heroes: [], stories: [], collections: [], charts: []),
                const <WhatseekApp>[],
                const <WhatseekApp>[],
                const <AppCategory>[]
              );
          return ListView(
            children: [
              Padding(
                padding: const EdgeInsets.all(16),
                child: TextField(
                  decoration: InputDecoration(
                    hintText:
                        WhatseekAppsStrings.of(context, 'home.searchPlaceholder'),
                    prefixIcon: const Icon(Icons.search),
                    border: const OutlineInputBorder(
                        borderRadius: BorderRadius.all(Radius.circular(24))),
                    isDense: true,
                  ),
                  onSubmitted: _openSearch,
                ),
              ),
              _buildCreateEntry(context),
              _buildMyAppsEntries(context),
              if (feed.heroes.isNotEmpty)
                _HeroCarousel(slides: feed.heroes, onOpen: _openDetail),
              if (feed.stories.isNotEmpty) ...[
                _SectionHeader(
                    title: WhatseekAppsStrings.of(context, 'home.stories')),
                _buildStoryRail(context, feed.stories),
              ],
              if (feed.collections.isNotEmpty) ...[
                _SectionHeader(
                    title: WhatseekAppsStrings.of(context, 'home.collections')),
                _buildCollectionRail(context, feed.collections),
              ],
              if (recommended.isNotEmpty) ...[
                _SectionHeader(
                  title: WhatseekAppsStrings.of(context, 'home.recommended'),
                  action: const Icon(Icons.star, size: 16, color: Colors.amber),
                ),
                _buildRecommendedGrid(context, recommended),
              ],
              if (feed.charts.isNotEmpty) ...[
                _SectionHeader(
                  title: WhatseekAppsStrings.of(context, 'home.charts'),
                  action: TextButton(
                    style: TextButton.styleFrom(
                      visualDensity: VisualDensity.compact,
                    ),
                    onPressed: _openCharts,
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Text(WhatseekAppsStrings.of(context, 'home.chartsMore')),
                        const Icon(Icons.chevron_right, size: 16),
                      ],
                    ),
                  ),
                ),
                for (final chart in feed.charts)
                  _ChartPreviewCard(chart: chart, onOpen: _openDetail),
              ],
              _SectionHeader(
                  title: WhatseekAppsStrings.of(context, 'home.categories')),
              _buildCategories(context, categories),
              if (recent.isNotEmpty)
                _buildAppStrip(
                  context,
                  title: WhatseekAppsStrings.of(context, 'home.recent'),
                  apps: recent,
                ),
              const SizedBox(height: 16),
            ],
          );
        },
      ),
    );
  }

  /// AI 创建应用 entry card — a sentence in, a working app out (H5 parity).
  Widget _buildCreateEntry(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(16, 0, 16, 4),
      child: Card(
        margin: EdgeInsets.zero,
        child: ListTile(
          leading: const Text('✨', style: TextStyle(fontSize: 24)),
          title: Text(WhatseekAppsStrings.of(context, 'home.aiCreate.title')),
          subtitle:
              Text(WhatseekAppsStrings.of(context, 'home.aiCreate.subtitle')),
          trailing: const Icon(Icons.chevron_right),
          onTap: _openCreate,
        ),
      ),
    );
  }

  /// 我的应用 / 收藏 quick links (H5 `/apps/my` and `/apps/my?tab=favorites`;
  /// the Flutter 我的应用 screen opens on its default segment).
  Widget _buildMyAppsEntries(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(16, 8, 16, 0),
      child: Row(
        children: [
          Expanded(
            child: OutlinedButton(
              onPressed: _openMyApps,
              child: Text(WhatseekAppsStrings.of(context, 'home.myApps')),
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: OutlinedButton(
              onPressed: _openMyApps,
              child: Text(WhatseekAppsStrings.of(context, 'home.favorites')),
            ),
          ),
        ],
      ),
    );
  }

  /// Editorial story rail (appstore Today 故事卡, simplified H5 `StoryCard`).
  Widget _buildStoryRail(BuildContext context, List<AppStoryCard> stories) {
    return SizedBox(
      height: 132,
      child: ListView.builder(
        scrollDirection: Axis.horizontal,
        padding: const EdgeInsets.symmetric(horizontal: 16),
        itemCount: stories.length,
        itemBuilder: (context, index) {
          final story = stories[index];
          final scheme = Theme.of(context).colorScheme;
          return InkWell(
            borderRadius: BorderRadius.circular(16),
            onTap: () => _openDetail(story.appId),
            child: Container(
              width: 176,
              margin: const EdgeInsetsDirectional.only(end: 12),
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: Color.lerp(scheme.primary, scheme.surface, 0.92),
                borderRadius: BorderRadius.circular(16),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Avatar(glyph: story.icon, size: 36),
                  const Spacer(),
                  Text(
                    story.title,
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                    style: Theme.of(context).textTheme.titleSmall,
                  ),
                  const SizedBox(height: 2),
                  Text(
                    story.subtitle,
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                    style: Theme.of(context).textTheme.bodySmall,
                  ),
                ],
              ),
            ),
          );
        },
      ),
    );
  }

  /// Curated collection rail (编辑精选合集, simplified H5 `CollectionCard`):
  /// a 2×2 cover icon grid plus title/description, opening the collection
  /// route.
  Widget _buildCollectionRail(
      BuildContext context, List<AppCollectionCard> collections) {
    return SizedBox(
      height: 168,
      child: ListView.builder(
        scrollDirection: Axis.horizontal,
        padding: const EdgeInsets.symmetric(horizontal: 16),
        itemCount: collections.length,
        itemBuilder: (context, index) {
          final collection = collections[index];
          final scheme = Theme.of(context).colorScheme;
          final covers = collection.coverApps;
          return Card(
            margin: const EdgeInsetsDirectional.only(end: 12),
            clipBehavior: Clip.antiAlias,
            child: InkWell(
              onTap: () => _openCollection(collection.id),
              child: Container(
                width: 208,
                padding: const EdgeInsets.all(12),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    for (var row = 0; row < 2; row++)
                      Padding(
                        padding: const EdgeInsets.only(bottom: 4),
                        child: Row(
                          children: [
                            for (var column = 0; column < 2; column++)
                              Expanded(
                                child: Container(
                                  height: 36,
                                  margin: EdgeInsetsDirectional.only(
                                      end: column == 0 ? 4 : 0),
                                  alignment: Alignment.center,
                                  decoration: BoxDecoration(
                                    color: scheme.surfaceContainerHighest,
                                    borderRadius: BorderRadius.circular(8),
                                  ),
                                  child: Text(
                                    row * 2 + column < covers.length
                                        ? covers[row * 2 + column].icon
                                        : '',
                                    style: const TextStyle(fontSize: 18),
                                  ),
                                ),
                              ),
                          ],
                        ),
                      ),
                    const Spacer(),
                    Text(
                      collection.title,
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                      style: Theme.of(context).textTheme.titleSmall,
                    ),
                    const SizedBox(height: 2),
                    Text(
                      collection.description,
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                      style: Theme.of(context).textTheme.bodySmall,
                    ),
                  ],
                ),
              ),
            ),
          );
        },
      ),
    );
  }

  /// Two-column 为你推荐 grid (appstore §5.1, simplified H5 `AppGridCard`).
  Widget _buildRecommendedGrid(
      BuildContext context, List<WhatseekApp> apps) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16),
      child: Column(
        children: [
          for (var index = 0; index < apps.length; index += 2)
            Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Expanded(child: _AppGridCard(app: apps[index], onOpen: _openDetail)),
                const SizedBox(width: 12),
                if (index + 1 < apps.length)
                  Expanded(
                      child:
                          _AppGridCard(app: apps[index + 1], onOpen: _openDetail))
                else
                  const Expanded(child: SizedBox()),
              ],
            ),
        ],
      ),
    );
  }

  /// Category chips; each chip funnels its localized label into the search
  /// route as the initial query (H5 navigates with `t(category.labelKey)`).
  Widget _buildCategories(BuildContext context, List<AppCategory> categories) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(16, 4, 16, 4),
      child: Wrap(
        spacing: 8,
        runSpacing: 4,
        children: [
          for (final category in categories)
            ActionChip(
              label: Text('${category.icon} '
                  '${WhatseekAppsStrings.of(context, category.labelKey.replaceFirst('whatseek.apps.', ''))}'),
              visualDensity: VisualDensity.compact,
              onPressed: () => _openSearch(
                WhatseekAppsStrings.of(
                    context, category.labelKey.replaceFirst('whatseek.apps.', '')),
              ),
            ),
        ],
      ),
    );
  }

  /// Horizontal compact tiles for 最近使用 (simplified H5 `AppTile`).
  Widget _buildAppStrip(
    BuildContext context, {
    required String title,
    required List<WhatseekApp> apps,
  }) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        _SectionHeader(title: title),
        SizedBox(
          height: 108,
          child: ListView.builder(
            scrollDirection: Axis.horizontal,
            padding: const EdgeInsets.symmetric(horizontal: 16),
            itemCount: apps.length,
            itemBuilder: (context, index) {
              final app = apps[index];
              return Card(
                margin: const EdgeInsetsDirectional.only(end: 12),
                child: InkWell(
                  borderRadius: BorderRadius.circular(12),
                  onTap: () => _openDetail(app.id),
                  child: Container(
                    width: 108,
                    padding: const EdgeInsets.all(10),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(app.icon,
                            style: const TextStyle(fontSize: 26, height: 1.2)),
                        const Spacer(),
                        Text(app.name,
                            maxLines: 1, overflow: TextOverflow.ellipsis),
                        Text(app.priceLabel,
                            maxLines: 1, overflow: TextOverflow.ellipsis,
                            style: Theme.of(context).textTheme.labelSmall),
                      ],
                    ),
                  ),
                ),
              );
            },
          ),
        ),
      ],
    );
  }
}

/// Feed section header (H5 `SectionHeader`): section title with an optional
/// trailing action.
class _SectionHeader extends StatelessWidget {
  const _SectionHeader({required this.title, this.action});

  final String title;
  final Widget? action;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(16, 16, 16, 8),
      child: Row(
        children: [
          Expanded(
            child: Text(title, style: Theme.of(context).textTheme.titleSmall),
          ),
          if (action != null) action!,
        ],
      ),
    );
  }
}

/// Appstore-style hero banner (PRD §5.1, simplified H5 `HeroCarousel`):
/// swipeable page carousel of editorial slides with a dot pager.
class _HeroCarousel extends StatefulWidget {
  const _HeroCarousel({required this.slides, required this.onOpen});

  final List<AppHeroSlide> slides;
  final ValueChanged<String> onOpen;

  @override
  State<_HeroCarousel> createState() => _HeroCarouselState();
}

class _HeroCarouselState extends State<_HeroCarousel> {
  final PageController _controller = PageController(viewportFraction: 0.92);
  int _active = 0;

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final scheme = Theme.of(context).colorScheme;
    return Column(
      children: [
        SizedBox(
          height: 168,
          child: PageView.builder(
            controller: _controller,
            itemCount: widget.slides.length,
            onPageChanged: (index) => setState(() => _active = index),
            itemBuilder: (context, index) {
              final slide = widget.slides[index];
              return Padding(
                padding: const EdgeInsets.symmetric(horizontal: 4),
                child: InkWell(
                  borderRadius: BorderRadius.circular(16),
                  onTap: () => widget.onOpen(slide.appId),
                  child: Container(
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      borderRadius: BorderRadius.circular(16),
                      gradient: LinearGradient(
                        begin: Alignment.topLeft,
                        end: Alignment.bottomRight,
                        colors: [
                          scheme.primary,
                          Color.lerp(scheme.primary, Colors.black, 0.18)!,
                        ],
                      ),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Container(
                          padding: const EdgeInsets.symmetric(
                              horizontal: 8, vertical: 2),
                          decoration: BoxDecoration(
                            color: Colors.white24,
                            borderRadius: BorderRadius.circular(999),
                          ),
                          child: Text(
                            slide.badge,
                            style: const TextStyle(
                                color: Colors.white, fontSize: 10),
                          ),
                        ),
                        const Spacer(),
                        Row(
                          crossAxisAlignment: CrossAxisAlignment.end,
                          children: [
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    slide.title,
                                    maxLines: 1,
                                    overflow: TextOverflow.ellipsis,
                                    style: const TextStyle(
                                      color: Colors.white,
                                      fontSize: 18,
                                      fontWeight: FontWeight.w600,
                                    ),
                                  ),
                                  const SizedBox(height: 2),
                                  Text(
                                    slide.tagline,
                                    maxLines: 1,
                                    overflow: TextOverflow.ellipsis,
                                    style: const TextStyle(
                                        color: Colors.white70, fontSize: 12),
                                  ),
                                ],
                              ),
                            ),
                            const SizedBox(width: 8),
                            Text(slide.icon,
                                style: const TextStyle(fontSize: 28)),
                          ],
                        ),
                      ],
                    ),
                  ),
                ),
              );
            },
          ),
        ),
        const SizedBox(height: 8),
        Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            for (var index = 0; index < widget.slides.length; index++)
              AnimatedContainer(
                duration: const Duration(milliseconds: 200),
                margin: const EdgeInsets.symmetric(horizontal: 3),
                width: index == _active ? 16 : 6,
                height: 6,
                decoration: BoxDecoration(
                  color: index == _active
                      ? scheme.primary
                      : scheme.outlineVariant,
                  borderRadius: BorderRadius.circular(3),
                ),
              ),
          ],
        ),
      ],
    );
  }
}

/// Two-column grid card for the 为你推荐 recommendation grid (appstore §5.1,
/// simplified H5 `AppGridCard`).
class _AppGridCard extends StatelessWidget {
  const _AppGridCard({required this.app, required this.onOpen});

  final WhatseekApp app;
  final ValueChanged<String> onOpen;

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      clipBehavior: Clip.antiAlias,
      child: InkWell(
        onTap: () => onOpen(app.id),
        child: Padding(
          padding: const EdgeInsets.all(12),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(app.icon, style: const TextStyle(fontSize: 24)),
              const SizedBox(height: 6),
              Text(
                app.name,
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
                style: Theme.of(context).textTheme.titleSmall,
              ),
              const SizedBox(height: 2),
              Text(
                app.summary,
                maxLines: 2,
                overflow: TextOverflow.ellipsis,
                style: Theme.of(context).textTheme.bodySmall,
              ),
              const SizedBox(height: 6),
              Row(
                children: [
                  const Icon(Icons.star, size: 12, color: Colors.amber),
                  const SizedBox(width: 2),
                  Text(app.rating.toStringAsFixed(1),
                      style: Theme.of(context).textTheme.labelSmall),
                  const Spacer(),
                  Text(app.priceLabel,
                      style: Theme.of(context).textTheme.labelSmall),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }
}

/// Chart quick view card (appstore 榜单速览, simplified H5
/// `ChartPreviewCard`): chart title opening the full charts screen plus the
/// top entries.
class _ChartPreviewCard extends StatelessWidget {
  const _ChartPreviewCard({required this.chart, required this.onOpen});

  final AppChartPreview chart;
  final ValueChanged<String> onOpen;

  void _openCharts(BuildContext context) {
    Navigator.of(context).pushNamed('app.whatseek.apps.charts');
  }

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(16, 0, 16, 12),
      child: Card(
        margin: EdgeInsets.zero,
        child: Padding(
          padding: const EdgeInsets.all(12),
          child: Column(
            children: [
              InkWell(
                onTap: () => _openCharts(context),
                child: Row(
                  children: [
                    Expanded(
                      child: Text(
                        WhatseekAppsStrings.of(context, 'chart.${chart.id.id}'),
                        style: Theme.of(context).textTheme.titleSmall,
                      ),
                    ),
                    const Icon(Icons.chevron_right, size: 16),
                  ],
                ),
              ),
              const SizedBox(height: 8),
              for (final (index, app) in chart.apps.indexed)
                Padding(
                  padding: const EdgeInsets.symmetric(vertical: 4),
                  child: InkWell(
                    onTap: () => onOpen(app.id),
                    child: Row(
                      children: [
                        SizedBox(
                          width: 14,
                          child: Text(
                            '${index + 1}',
                            textAlign: TextAlign.center,
                            style: Theme.of(context).textTheme.labelSmall,
                          ),
                        ),
                        const SizedBox(width: 8),
                        Avatar(glyph: app.icon, size: 32),
                        const SizedBox(width: 8),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                app.name,
                                maxLines: 1,
                                overflow: TextOverflow.ellipsis,
                                style: Theme.of(context).textTheme.bodyMedium,
                              ),
                              Text(
                                WhatseekAppsStrings.of(
                                    context, 'tile.users', {'users': app.usersLabel}),
                                style: Theme.of(context).textTheme.labelSmall,
                              ),
                            ],
                          ),
                        ),
                        const SizedBox(width: 8),
                        Text(app.priceLabel,
                            style: Theme.of(context).textTheme.labelSmall),
                      ],
                    ),
                  ),
                ),
            ],
          ),
        ),
      ),
    );
  }
}
