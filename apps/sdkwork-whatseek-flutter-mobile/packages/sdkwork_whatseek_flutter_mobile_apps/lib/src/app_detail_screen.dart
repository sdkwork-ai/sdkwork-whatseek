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
  late Future<bool> _favorite;

  @override
  void initState() {
    super.initState();
    _app = WhatseekRuntime.instance.apps.getApp(widget.appId);
    _favorite = _loadFavorite();
  }

  Future<bool> _loadFavorite() async {
    final favorites = await WhatseekRuntime.instance.apps.listFavorites();
    return favorites.any((app) => app.id == widget.appId);
  }

  Future<void> _toggleFavorite() async {
    final favorited =
        await WhatseekRuntime.instance.apps.toggleFavorite(widget.appId);
    setState(() {
      _favorite = Future.value(favorited);
    });
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
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Avatar(glyph: app.icon, size: 64),
                  const SizedBox(width: 16),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(app.name, style: Theme.of(context).textTheme.titleLarge),
                        Text('${app.developer} · ${app.category} · ${app.priceLabel}',
                            style: Theme.of(context).textTheme.bodySmall),
                        Text(
                          '⭐ ${app.rating.toStringAsFixed(1)} · '
                          '${WhatseekAppsStrings.of(context, 'detail.users', {'users': app.usersLabel})}'
                          ' · ${app.updatedAt}',
                          style: Theme.of(context).textTheme.bodySmall,
                        ),
                      ],
                    ),
                  ),
                  _buildFavoriteToggle(context),
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
              // PRD §16 screenshots field — Phase-1 placeholder strip.
              Text(WhatseekAppsStrings.of(context, 'detail.screenshots'),
                  style: Theme.of(context).textTheme.titleSmall),
              const SizedBox(height: 8),
              SizedBox(
                height: 112,
                child: ListView.separated(
                  scrollDirection: Axis.horizontal,
                  itemCount: 3,
                  separatorBuilder: (_, __) => const SizedBox(width: 8),
                  itemBuilder: (context, index) => Container(
                    width: 80,
                    decoration: BoxDecoration(
                      color: Theme.of(context).colorScheme.surfaceContainerHighest,
                      borderRadius: BorderRadius.circular(12),
                    ),
                  ),
                ),
              ),
              const SizedBox(height: 16),
              // PRD §16 permissions field.
              Text(WhatseekAppsStrings.of(context, 'detail.permissions'),
                  style: Theme.of(context).textTheme.titleSmall),
              const SizedBox(height: 4),
              if (app.permissions.isEmpty)
                Text(WhatseekAppsStrings.of(context, 'detail.noPermissions'),
                    style: Theme.of(context).textTheme.bodySmall)
              else
                for (final permission in app.permissions)
                  Text('· $permission',
                      style: Theme.of(context).textTheme.bodySmall),
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

  /// Favorite toggle (PRD §16 收藏): filled heart while favorited, outline
  /// heart otherwise; taps flip the state through the apps client.
  Widget _buildFavoriteToggle(BuildContext context) {
    return FutureBuilder<bool>(
      future: _favorite,
      builder: (context, snapshot) {
        final favorited = snapshot.data ?? false;
        return IconButton(
          tooltip: WhatseekAppsStrings.of(
              context, favorited ? 'detail.favorited' : 'detail.favorite'),
          icon: Icon(
            favorited ? Icons.favorite : Icons.favorite_border,
            color: favorited ? Theme.of(context).colorScheme.error : null,
          ),
          onPressed: _toggleFavorite,
        );
      },
    );
  }
}
