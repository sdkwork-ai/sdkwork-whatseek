import 'package:flutter/material.dart';

import "package:sdkwork_whatseek_flutter_mobile_core/sdkwork_whatseek_flutter_mobile_core.dart";
import "package:sdkwork_whatseek_flutter_mobile_commons/sdkwork_whatseek_flutter_mobile_commons.dart";

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
      appBar: AppBar(title: const Text('我的应用')),
      body: FutureBuilder<List<CreatedApp>>(
        future: _myApps,
        builder: (context, snapshot) {
          if (snapshot.connectionState != ConnectionState.done) {
            return const ScreenState(state: ScreenStateKind.loading);
          }
          final apps = snapshot.data ?? const <CreatedApp>[];
          if (apps.isEmpty) {
            return const ScreenState(
              state: ScreenStateKind.empty,
              title: '还没有创建应用',
              message: '用一句自然语言，让 AI 帮你生成第一个应用',
            );
          }
          return ListView(
            children: [
              for (final app in apps)
                ListTile(
                  leading: const Text('🧩', style: TextStyle(fontSize: 26)),
                  title: Text(app.name),
                  subtitle: Text('${app.modules.length} 个模块 · v${app.versions.last}'),
                  trailing: Chip(label: Text(switch (app.lifecycle) {
                    CreatedAppLifecycle.preview => '预览',
                    CreatedAppLifecycle.published => '已发布',
                    _ => app.lifecycle.name,
                  })),
                ),
            ],
          );
        },
      ),
    );
  }
}
