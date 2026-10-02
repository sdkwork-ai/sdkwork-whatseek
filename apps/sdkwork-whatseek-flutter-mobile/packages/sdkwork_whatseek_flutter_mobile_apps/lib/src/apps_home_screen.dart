import 'package:flutter/material.dart';

import "package:sdkwork_whatseek_flutter_mobile_core/sdkwork_whatseek_flutter_mobile_core.dart";
import "package:sdkwork_whatseek_flutter_mobile_commons/sdkwork_whatseek_flutter_mobile_commons.dart";

import 'i18n/apps_strings.dart';

/// 应用 tab root (PRD §13): search prompt, AI 创建应用 entry, category chips,
/// 最近使用 / 推荐 / 热门 sections (H5 `AppsHomeScreen` parity). Category chips
/// jump into the dedicated search route (`app.whatseek.apps.search`).
class AppsHomeScreen extends StatefulWidget {
  const AppsHomeScreen({super.key, this.onOpenApp});

  final ValueChanged<String>? onOpenApp;

  @override
  State<AppsHomeScreen> createState() => _AppsHomeScreenState();
}

/// One snapshot of everything the home needs, loaded through the injected
/// apps client (recommended / hot / recent / categories).
typedef _HomeData = (
  List<WhatseekApp> recommended,
  List<WhatseekApp> hot,
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
    final recommended = await apps.listRecommended();
    final hot = await apps.listHot();
    final recent = await apps.listRecent();
    final categories = await apps.listCategories();
    return (recommended, hot, recent, categories);
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
          final (recommended, hot, recent, categories) =
              snapshot.data ?? (const <WhatseekApp>[], const <WhatseekApp>[], const <WhatseekApp>[], const <AppCategory>[]);
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
              _buildCategories(context, categories),
              if (recent.isNotEmpty)
                _buildAppStrip(
                  context,
                  title: WhatseekAppsStrings.of(context, 'home.recent'),
                  apps: recent,
                ),
              _buildAppSection(context, WhatseekAppsStrings.of(context, 'home.recommended'),
                  recommended),
              _buildAppStrip(
                context,
                title: WhatseekAppsStrings.of(context, 'home.hot'),
                apps: hot,
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
          subtitle: Text(WhatseekAppsStrings.of(context, 'home.aiCreate.subtitle')),
          trailing: const Icon(Icons.chevron_right),
          onTap: _openCreate,
        ),
      ),
    );
  }

  /// Category chips; each chip funnels its localized label into the search
  /// route as the initial query (H5 navigates with `t(category.labelKey)`).
  Widget _buildCategories(BuildContext context, List<AppCategory> categories) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(16, 8, 16, 4),
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

  Widget _buildAppSection(BuildContext context, String title, List<WhatseekApp> apps) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Padding(
          padding: const EdgeInsets.fromLTRB(16, 12, 16, 4),
          child: Text(title, style: Theme.of(context).textTheme.titleSmall),
        ),
        for (final app in apps)
          ListTile(
            leading: Text(app.icon, style: const TextStyle(fontSize: 28)),
            title: Text(app.name),
            subtitle: Text(app.summary, maxLines: 2, overflow: TextOverflow.ellipsis),
            trailing: Text(app.priceLabel),
            onTap: () => _openDetail(app.id),
          ),
      ],
    );
  }

  /// Horizontal compact tiles for 最近使用 / 热门 (simplified H5 `AppTile`).
  Widget _buildAppStrip(
    BuildContext context, {
    required String title,
    required List<WhatseekApp> apps,
  }) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Padding(
          padding: const EdgeInsets.fromLTRB(16, 12, 16, 8),
          child: Text(title, style: Theme.of(context).textTheme.titleSmall),
        ),
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
