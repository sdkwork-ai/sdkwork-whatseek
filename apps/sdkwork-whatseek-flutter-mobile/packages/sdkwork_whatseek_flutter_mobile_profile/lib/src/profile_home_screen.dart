import 'package:flutter/material.dart';

import "package:sdkwork_whatseek_flutter_mobile_core/sdkwork_whatseek_flutter_mobile_core.dart";
import "package:sdkwork_whatseek_flutter_mobile_commons/sdkwork_whatseek_flutter_mobile_commons.dart";

import 'i18n/profile_strings.dart';

/// 我的 tab root: personal digital asset center + the settings entry.
class ProfileHomeScreen extends StatefulWidget {
  const ProfileHomeScreen({super.key});

  @override
  State<ProfileHomeScreen> createState() => _ProfileHomeScreenState();
}

class _ProfileHomeScreenState extends State<ProfileHomeScreen> {
  late Future<(int, int, int)> _assets;

  @override
  void initState() {
    super.initState();
    _loadAssets();
  }

  Future<void> _loadAssets() async {
    final runtime = WhatseekRuntime.instance;
    final conversations = await runtime.messages.listConversations();
    final myApps = await runtime.apps.listMyApps();
    final contacts = await runtime.contacts.listContacts();
    _assets = Future.value((conversations.length, myApps.length, contacts.length));
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text(WhatseekProfileStrings.of(context, 'home.title'))),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          Row(
            children: [
              const Avatar(glyph: '🙂', size: 64),
              const SizedBox(width: 16),
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(WhatseekProfileStrings.of(context, 'home.visitor'),
                      style: Theme.of(context).textTheme.titleLarge),
                  Text(WhatseekProfileStrings.of(context, 'home.visitorHint'),
                      style: Theme.of(context).textTheme.bodySmall),
                ],
              ),
            ],
          ),
          const SizedBox(height: 24),
          FutureBuilder<(int, int, int)>(
            future: _assets,
            builder: (context, snapshot) {
              final assets = snapshot.data ?? (0, 0, 0);
              return Row(
                mainAxisAlignment: MainAxisAlignment.spaceAround,
                children: [
                  _AssetStat(
                      count: assets.$1,
                      label: WhatseekProfileStrings.of(context, 'home.asset.chats')),
                  _AssetStat(
                      count: assets.$2,
                      label: WhatseekProfileStrings.of(context, 'home.asset.apps')),
                  _AssetStat(
                      count: assets.$3,
                      label: WhatseekProfileStrings.of(context, 'home.asset.contacts')),
                ],
              );
            },
          ),
          const SizedBox(height: 24),
          ListTile(
            leading: const Text('🧩', style: TextStyle(fontSize: 24)),
            title: Text(WhatseekProfileStrings.of(context, 'home.myApps')),
            onTap: () => Navigator.of(context).pushNamed('app.whatseek.apps.my'),
          ),
          ListTile(
            leading: const Text('⭐', style: TextStyle(fontSize: 24)),
            title: Text(WhatseekProfileStrings.of(context, 'home.favorites')),
          ),
          ListTile(
            leading: const Text('⚙️', style: TextStyle(fontSize: 24)),
            title: Text(WhatseekProfileStrings.of(context, 'home.settings')),
            onTap: () => Navigator.of(context).pushNamed('app.whatseek.profile.settings'),
          ),
          ListTile(
            leading: const Text('✨', style: TextStyle(fontSize: 24)),
            title: Text(WhatseekProfileStrings.of(context, 'settings.brandTitle')),
            subtitle: Text(WhatseekProfileStrings.of(context, 'home.brand')),
          ),
        ],
      ),
    );
  }
}

class _AssetStat extends StatelessWidget {
  const _AssetStat({required this.count, required this.label});

  final int count;
  final String label;

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Text('$count', style: Theme.of(context).textTheme.headlineSmall),
        Text(label, style: Theme.of(context).textTheme.bodySmall),
      ],
    );
  }
}
