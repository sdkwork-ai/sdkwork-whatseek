import 'package:flutter/material.dart';

import "package:sdkwork_whatseek_flutter_mobile_core/sdkwork_whatseek_flutter_mobile_core.dart";
import "package:sdkwork_whatseek_flutter_mobile_commons/sdkwork_whatseek_flutter_mobile_commons.dart";

import 'i18n/apps_strings.dart';

/// App detail (PRD §16): metadata, permissions, price, 立即使用 / 基于此创建.
class AppDetailScreen extends StatefulWidget {
  const AppDetailScreen({super.key, required this.appId});

  final String appId;

  @override
  State<AppDetailScreen> createState() => _AppDetailScreenState();
}

class _AppDetailScreenState extends State<AppDetailScreen> {
  late Future<WhatseekApp?> _app;

  @override
  void initState() {
    super.initState();
    _app = WhatseekRuntime.instance.apps.getApp(widget.appId);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text(WhatseekAppsStrings.of(context, 'detail.title'))),
      body: FutureBuilder<WhatseekApp?>(
        future: _app,
        builder: (context, snapshot) {
          if (snapshot.connectionState != ConnectionState.done) {
            return const ScreenState(state: ScreenStateKind.loading);
          }
          final app = snapshot.data;
          if (app == null) {
            return ScreenState(
              state: ScreenStateKind.empty,
              title: WhatseekAppsStrings.of(context, 'detail.notFound'),
            );
          }
          return ListView(
            padding: const EdgeInsets.all(16),
            children: [
              Row(
                children: [
                  Avatar(glyph: app.icon, size: 64),
                  const SizedBox(width: 16),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(app.name, style: Theme.of(context).textTheme.titleLarge),
                        Text('${app.developer} · ${app.priceLabel}',
                            style: Theme.of(context).textTheme.bodySmall),
                        Text(
                          WhatseekAppsStrings.of(
                              context, 'detail.users', {'users': app.usersLabel}),
                          style: Theme.of(context).textTheme.bodySmall,
                        ),
                      ],
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 16),
              Text(app.summary),
              const SizedBox(height: 8),
              Wrap(
                spacing: 8,
                children: [
                  if (app.aiCapability)
                    Chip(label: Text(WhatseekAppsStrings.of(context, 'detail.aiCapability'))),
                  for (final tag in app.tags) Chip(label: Text(tag)),
                ],
              ),
              const SizedBox(height: 16),
              FilledButton(
                onPressed: () => Navigator.of(context).pushNamed(
                  'app.whatseek.apps.runner',
                  arguments: app.id,
                ),
                child: Text(WhatseekAppsStrings.of(context, 'detail.use')),
              ),
              OutlinedButton(
                onPressed: () => Navigator.of(context).pushNamed(
                  'app.whatseek.apps.create',
                  arguments: app.summary,
                ),
                child: Text(WhatseekAppsStrings.of(context, 'detail.createFrom')),
              ),
            ],
          );
        },
      ),
    );
  }
}
