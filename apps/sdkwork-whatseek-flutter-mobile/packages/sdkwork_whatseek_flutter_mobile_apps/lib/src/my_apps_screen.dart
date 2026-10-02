import 'package:flutter/material.dart';

import "package:sdkwork_whatseek_flutter_mobile_core/sdkwork_whatseek_flutter_mobile_core.dart";
import "package:sdkwork_whatseek_flutter_mobile_commons/sdkwork_whatseek_flutter_mobile_commons.dart";

import 'i18n/apps_strings.dart';

/// 我的应用 (PRD §21): created + favorited apps.
class MyAppsScreen extends StatefulWidget {
  const MyAppsScreen({super.key});

  @override
  State<MyAppsScreen> createState() => _MyAppsScreenState();
}

class _MyAppsScreenState extends State<MyAppsScreen> {
  late Future<List<CreatedApp>> _myApps;

  @override
  void initState() {
    super.initState();
    _myApps = WhatseekRuntime.instance.apps.listMyApps();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text(WhatseekAppsStrings.of(context, 'my.title'))),
      body: FutureBuilder<List<CreatedApp>>(
        future: _myApps,
        builder: (context, snapshot) {
          if (snapshot.connectionState != ConnectionState.done) {
            return const ScreenState(state: ScreenStateKind.loading);
          }
          final apps = snapshot.data ?? const <CreatedApp>[];
          if (apps.isEmpty) {
            return ScreenState(
              state: ScreenStateKind.empty,
              title: WhatseekAppsStrings.of(context, 'my.emptyCreatedTitle'),
              message: WhatseekAppsStrings.of(context, 'my.emptyCreatedDescription'),
            );
          }
          return ListView(
            children: [
              for (final app in apps)
                ListTile(
                  leading: const Text('🧩', style: TextStyle(fontSize: 26)),
                  title: Text(app.name),
                  subtitle: Text(
                    '${WhatseekAppsStrings.of(context, 'create.moduleCount', {'count': app.modules.length})}'
                    ' · v${app.versions.last}',
                  ),
                  trailing: Chip(label: Text(_lifecycleLabel(context, app.lifecycle))),
                ),
            ],
          );
        },
      ),
    );
  }

  static String _lifecycleLabel(BuildContext context, CreatedAppLifecycle lifecycle) =>
      WhatseekAppsStrings.of(context, 'lifecycle.${lifecycle.name}');
}
