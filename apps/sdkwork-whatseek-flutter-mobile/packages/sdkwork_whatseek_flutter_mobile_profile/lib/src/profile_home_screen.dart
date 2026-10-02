import 'package:flutter/material.dart';

import "package:sdkwork_whatseek_flutter_mobile_core/sdkwork_whatseek_flutter_mobile_core.dart";
import "package:sdkwork_whatseek_flutter_mobile_commons/sdkwork_whatseek_flutter_mobile_commons.dart";

/// 我的 tab root: personal digital asset center.
class ProfileHomeScreen extends StatefulWidget {
  const ProfileHomeScreen({super.key});

  @override
  State<ProfileHomeScreen> createState() => _ProfileHomeScreenState();
}

class _ProfileHomeScreenState extends State<ProfileHomeScreen> {
  late final Future<(int, int, int)> _assets;

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
      appBar: AppBar(title: const Text('我的')),
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
                  Text('访客', style: Theme.of(context).textTheme.titleLarge),
                  Text('登录后同步你的数字资产', style: Theme.of(context).textTheme.bodySmall),
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
                  _AssetStat(count: assets.$1, label: '对话'),
                  _AssetStat(count: assets.$2, label: '应用'),
                  _AssetStat(count: assets.$3, label: '联系人'),
                ],
              );
            },
          ),
          const SizedBox(height: 24),
          ListTile(
            leading: const Text('🧩', style: TextStyle(fontSize: 24)),
            title: const Text('我的应用'),
            onTap: () => Navigator.of(context).pushNamed('app.whatseek.apps.my'),
          ),
          const ListTile(
            leading: Text('⭐', style: TextStyle(fontSize: 24)),
            title: Text('收藏'),
          ),
          const ListTile(
            leading: Text('✨', style: TextStyle(fontSize: 24)),
            title: Text('WhatSeek 问寻'),
            subtitle: Text('你负责问，AI 负责寻'),
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
