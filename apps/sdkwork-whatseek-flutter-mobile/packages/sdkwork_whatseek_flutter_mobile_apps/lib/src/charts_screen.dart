import 'package:flutter/material.dart';

import "package:sdkwork_whatseek_flutter_mobile_core/sdkwork_whatseek_flutter_mobile_core.dart";
import "package:sdkwork_whatseek_flutter_mobile_commons/sdkwork_whatseek_flutter_mobile_commons.dart";

import 'i18n/apps_strings.dart';

/// Full charts screen (appstore route `app.whatseek.apps.charts`): 热门 / 免费
/// / 新品 top-10 lists, mirroring the home 榜单速览 quick view (H5
/// `AppChartsScreen` parity).
class AppChartsScreen extends StatefulWidget {
  const AppChartsScreen({super.key});

  @override
  State<AppChartsScreen> createState() => _AppChartsScreenState();
}

/// One snapshot of the three charts, loaded through the injected apps client.
typedef _ChartsData = (
  List<WhatseekApp> hot,
  List<WhatseekApp> free,
  List<WhatseekApp> newest
);

class _AppChartsScreenState extends State<AppChartsScreen> {
  late Future<_ChartsData> _data;

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

  Future<_ChartsData> _load() async {
    final apps = WhatseekRuntime.instance.apps;
    final hot = await apps.listChart(AppChartId.hot);
    final free = await apps.listChart(AppChartId.free);
    final newest = await apps.listChart(AppChartId.newest);
    return (hot, free, newest);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar:
          AppBar(title: Text(WhatseekAppsStrings.of(context, 'charts.title'))),
      body: FutureBuilder<_ChartsData>(
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
          final (hot, free, newest) = snapshot.data ??
              (
                const <WhatseekApp>[],
                const <WhatseekApp>[],
                const <WhatseekApp>[]
              );
          return ListView(
            children: [
              _buildChartSection(context, AppChartId.hot, hot),
              _buildChartSection(context, AppChartId.free, free),
              _buildChartSection(context, AppChartId.newest, newest),
              const SizedBox(height: 16),
            ],
          );
        },
      ),
    );
  }

  /// One ranked chart card: section title plus the numbered app rows (H5
  /// `ListRow` parity).
  Widget _buildChartSection(
      BuildContext context, AppChartId chartId, List<WhatseekApp> apps) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Padding(
          padding: const EdgeInsets.fromLTRB(16, 20, 16, 8),
          child: Text(
            WhatseekAppsStrings.of(context, 'chart.${chartId.id}'),
            style: Theme.of(context).textTheme.titleSmall,
          ),
        ),
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 16),
          child: Card(
            margin: EdgeInsets.zero,
            clipBehavior: Clip.antiAlias,
            child: Column(
              children: [
                for (final (index, app) in apps.indexed)
                  ListTile(
                    leading: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        SizedBox(
                          width: 18,
                          child: Text(
                            '${index + 1}',
                            textAlign: TextAlign.center,
                            style: Theme.of(context)
                                .textTheme
                                .titleSmall
                                ?.copyWith(
                                  color: Theme.of(context).colorScheme.outline,
                                ),
                          ),
                        ),
                        const SizedBox(width: 8),
                        Avatar(glyph: app.icon, size: 36),
                      ],
                    ),
                    title: Text(app.name),
                    subtitle: Text(
                      WhatseekAppsStrings.of(
                          context, 'tile.users', {'users': app.usersLabel}),
                    ),
                    trailing: Text(app.priceLabel,
                        style: Theme.of(context).textTheme.labelSmall),
                    onTap: () => Navigator.of(context).pushNamed(
                      'app.whatseek.apps.detail',
                      arguments: app.id,
                    ),
                  ),
              ],
            ),
          ),
        ),
      ],
    );
  }
}
