import 'package:flutter/material.dart';

import "package:sdkwork_whatseek_flutter_mobile_core/sdkwork_whatseek_flutter_mobile_core.dart";
import "package:sdkwork_whatseek_flutter_mobile_commons/sdkwork_whatseek_flutter_mobile_commons.dart";

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
      appBar: AppBar(title: const Text('应用详情')),
      body: FutureBuilder<WhatseekApp?>(
        future: _app,
        builder: (context, snapshot) {
          if (snapshot.connectionState != ConnectionState.done) {
            return const ScreenState(state: ScreenStateKind.loading);
          }
          final app = snapshot.data;
          if (app == null) {
            return const ScreenState(state: ScreenStateKind.empty);
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
                        Text('${app.rating.toStringAsFixed(1)} · ${app.usersLabel} 人在用',
                            style: Theme.of(context).textTheme.bodySmall),
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
                  if (app.aiCapability) const Chip(label: Text('AI 能力')),
                  for (final tag in app.tags) Chip(label: Text(tag)),
                ],
              ),
              const SizedBox(height: 16),
              FilledButton(
                onPressed: () => Navigator.of(context).pushNamed(
                  'app.whatseek.apps.runner',
                  arguments: app.id,
                ),
                child: const Text('立即使用'),
              ),
              OutlinedButton(
                onPressed: () => Navigator.of(context).pushNamed(
                  'app.whatseek.apps.create',
                  arguments: app.summary,
                ),
                child: const Text('基于此创建'),
              ),
            ],
          );
        },
      ),
    );
  }
}
