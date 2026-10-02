import 'package:flutter/material.dart';

import "package:sdkwork_whatseek_flutter_mobile_core/sdkwork_whatseek_flutter_mobile_core.dart";
import "package:sdkwork_whatseek_flutter_mobile_commons/sdkwork_whatseek_flutter_mobile_commons.dart";

import 'i18n/apps_strings.dart';

/// Active 我的应用 segment (H5 `MyAppsScreen` tab parity).
enum _MyAppsTab { created, favorites }

/// 我的应用 (PRD §21): created apps (open / publish / delete) clearly
/// separated from favorited third-party apps, with the create-first empty
/// state (H5 `MyAppsScreen` parity).
class MyAppsScreen extends StatefulWidget {
  const MyAppsScreen({super.key});

  @override
  State<MyAppsScreen> createState() => _MyAppsScreenState();
}

class _MyAppsScreenState extends State<MyAppsScreen> {
  _MyAppsTab _tab = _MyAppsTab.created;
  late Future<List<CreatedApp>> _myApps;
  late Future<List<WhatseekApp>> _favorites;

  @override
  void initState() {
    super.initState();
    _reload();
  }

  void _reload() {
    final apps = WhatseekRuntime.instance.apps;
    setState(() {
      _myApps = apps.listMyApps();
      _favorites = apps.listFavorites();
    });
  }

  void _switchTab(Set<_MyAppsTab> selection) {
    setState(() {
      _tab = selection.first;
    });
  }

  Future<void> _publish(CreatedApp app) async {
    await WhatseekRuntime.instance.apps.publishApp(app.id);
    _reload();
  }

  Future<void> _confirmDelete(CreatedApp app) async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (dialogContext) => AlertDialog(
        title: Text(WhatseekAppsStrings.of(context, 'my.deleteConfirmTitle')),
        content: Text(WhatseekAppsStrings.of(context, 'my.deleteConfirmBody')),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(dialogContext).pop(false),
            child: Text(WhatseekAppsStrings.of(dialogContext, 'my.cancel')),
          ),
          FilledButton(
            onPressed: () => Navigator.of(dialogContext).pop(true),
            child: Text(WhatseekAppsStrings.of(dialogContext, 'my.delete')),
          ),
        ],
      ),
    );
    if (confirmed ?? false) {
      await WhatseekRuntime.instance.apps.deleteMyApp(app.id);
      _reload();
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text(WhatseekAppsStrings.of(context, 'my.title'))),
      body: Column(
        children: [
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 12, 16, 4),
            child: SegmentedButton<_MyAppsTab>(
              segments: [
                ButtonSegment(
                  value: _MyAppsTab.created,
                  label: Text(WhatseekAppsStrings.of(context, 'my.createdTab')),
                ),
                ButtonSegment(
                  value: _MyAppsTab.favorites,
                  label: Text(WhatseekAppsStrings.of(context, 'my.favoritesTab')),
                ),
              ],
              selected: {_tab},
              onSelectionChanged: _switchTab,
            ),
          ),
          Expanded(
            child: _tab == _MyAppsTab.created
                ? _buildCreated(context)
                : _buildFavorites(context),
          ),
        ],
      ),
    );
  }

  Widget _buildCreated(BuildContext context) {
    return FutureBuilder<List<CreatedApp>>(
      future: _myApps,
      builder: (context, snapshot) {
        if (snapshot.connectionState != ConnectionState.done) {
          return const ScreenState(state: ScreenStateKind.loading);
        }
        if (snapshot.hasError) {
          return ScreenState(state: ScreenStateKind.error, onRetry: _reload);
        }
        final apps = snapshot.data ?? const <CreatedApp>[];
        if (apps.isEmpty) {
          return Column(
            children: [
              Expanded(
                child: ScreenState(
                  state: ScreenStateKind.empty,
                  title: WhatseekAppsStrings.of(context, 'my.emptyCreatedTitle'),
                  message:
                      WhatseekAppsStrings.of(context, 'my.emptyCreatedDescription'),
                ),
              ),
              Padding(
                padding: const EdgeInsets.fromLTRB(16, 0, 16, 24),
                child: SizedBox(
                  width: double.infinity,
                  child: FilledButton(
                    onPressed: () => Navigator.of(context)
                        .pushNamed('app.whatseek.apps.create'),
                    child: Text(
                        WhatseekAppsStrings.of(context, 'my.createFirst')),
                  ),
                ),
              ),
            ],
          );
        }
        return ListView(
          children: [
            for (final app in apps)
              ListTile(
                leading: Text(app.icon, style: const TextStyle(fontSize: 26)),
                title: Row(
                  children: [
                    Flexible(child: Text(app.name, overflow: TextOverflow.ellipsis)),
                    const SizedBox(width: 8),
                    Chip(
                      label: Text(_lifecycleLabel(context, app.lifecycle)),
                      visualDensity: VisualDensity.compact,
                      labelStyle: const TextStyle(fontSize: 11),
                    ),
                  ],
                ),
                subtitle: Text(
                  '${WhatseekAppsStrings.of(context, 'my.moduleCount', {'count': app.modules.length})}'
                  ' · v${app.versions.last}',
                ),
                onTap: () => Navigator.of(context).pushNamed(
                  'app.whatseek.apps.runner',
                  arguments: app.id,
                ),
                trailing: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    if (app.lifecycle != CreatedAppLifecycle.published)
                      TextButton(
                        onPressed: () => _publish(app),
                        child: Text(WhatseekAppsStrings.of(context, 'my.publish')),
                      ),
                    TextButton(
                      onPressed: () => _confirmDelete(app),
                      child: Text(
                        WhatseekAppsStrings.of(context, 'my.delete'),
                        style: TextStyle(color: Theme.of(context).colorScheme.error),
                      ),
                    ),
                  ],
                ),
              ),
          ],
        );
      },
    );
  }

  Widget _buildFavorites(BuildContext context) {
    return FutureBuilder<List<WhatseekApp>>(
      future: _favorites,
      builder: (context, snapshot) {
        if (snapshot.connectionState != ConnectionState.done) {
          return const ScreenState(state: ScreenStateKind.loading);
        }
        if (snapshot.hasError) {
          return ScreenState(state: ScreenStateKind.error, onRetry: _reload);
        }
        final apps = snapshot.data ?? const <WhatseekApp>[];
        if (apps.isEmpty) {
          return ScreenState(
            state: ScreenStateKind.empty,
            title: WhatseekAppsStrings.of(context, 'my.emptyFavoritesTitle'),
          );
        }
        return ListView(
          children: [
            for (final app in apps)
              ListTile(
                leading: Text(app.icon, style: const TextStyle(fontSize: 26)),
                title: Text(app.name),
                subtitle: Text(app.summary, maxLines: 2, overflow: TextOverflow.ellipsis),
                onTap: () => Navigator.of(context).pushNamed(
                  'app.whatseek.apps.detail',
                  arguments: app.id,
                ),
              ),
          ],
        );
      },
    );
  }

  static String _lifecycleLabel(BuildContext context, CreatedAppLifecycle lifecycle) =>
      WhatseekAppsStrings.of(context, 'lifecycle.${lifecycle.name}');
}
