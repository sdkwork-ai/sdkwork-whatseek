import 'package:flutter/material.dart';

import "package:sdkwork_whatseek_flutter_mobile_core/sdkwork_whatseek_flutter_mobile_core.dart";
import "package:sdkwork_whatseek_flutter_mobile_commons/sdkwork_whatseek_flutter_mobile_commons.dart";

import 'i18n/profile_strings.dart';

/// 我的 tab root: personal digital asset center + the settings entry.
/// The session comes injected from the composition root (H5 authState /
/// runner `isVisitor` parity): 登录 promotes the visitor to a named account
/// so enterprise apps open; 退出登录 restores the gate.
class ProfileHomeScreen extends StatefulWidget {
  const ProfileHomeScreen({
    super.key,
    this.readSession,
    this.onSignIn,
    this.onSignOut,
  });

  /// Reads the current (auto-created) session.
  final SessionUser Function()? readSession;

  /// Promotes the session to a named account; returns the new session.
  final SessionUser Function()? onSignIn;

  /// Drops back to the visitor session.
  final SessionUser Function()? onSignOut;

  @override
  State<ProfileHomeScreen> createState() => _ProfileHomeScreenState();
}

class _ProfileHomeScreenState extends State<ProfileHomeScreen> {
  late Future<(int, int, int, int)> _assets;
  late SessionUser _user;

  @override
  void initState() {
    super.initState();
    _user = widget.readSession?.call() ??
        const SessionUser(id: 'visitor', name: '访客', avatar: '🙂', isVisitor: true);
    _assets = _loadAssets();
  }

  Future<(int, int, int, int)> _loadAssets() async {
    final runtime = WhatseekRuntime.instance;
    final conversations = await runtime.messages.listConversations();
    final myApps = await runtime.apps.listMyApps();
    final contacts = await runtime.contacts.listContacts();
    final agents = contacts
        .where((contact) =>
            contact.kind == ContactKind.agent ||
            contact.kind == ContactKind.assistant)
        .length;
    return (conversations.length, myApps.length, contacts.length, agents);
  }

  void _applyNext(SessionUser? next) {
    if (next != null) {
      setState(() {
        _user = next;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text(WhatseekProfileStrings.of(context, 'home.title'))),
      body: ListView(
        padding: const EdgeInsets.only(top: 8, bottom: 16),
        children: [
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16),
            child: Row(
            children: [
              Avatar(glyph: _user.avatar, size: 64),
              const SizedBox(width: 16),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                        _user.isVisitor
                            ? WhatseekProfileStrings.of(context, 'home.visitor')
                            : _user.name,
                        style: Theme.of(context).textTheme.titleLarge),
                    Text(
                        _user.isVisitor
                            ? WhatseekProfileStrings.of(context, 'home.visitorHint')
                            : WhatseekProfileStrings.of(context, 'home.signedIn'),
                        style: Theme.of(context).textTheme.bodySmall),
                  ],
                ),
              ),
              const SizedBox(width: 8),
              _user.isVisitor
                  ? FilledButton(
                      onPressed: () => _applyNext(widget.onSignIn?.call()),
                      child: Text(WhatseekProfileStrings.of(context, 'home.signIn')),
                    )
                  : OutlinedButton(
                      onPressed: () => _applyNext(widget.onSignOut?.call()),
                      child: Text(WhatseekProfileStrings.of(context, 'home.signOut')),
                    ),
            ],
          ),
          ),
          const SizedBox(height: 24),
          FutureBuilder<(int, int, int, int)>(
            future: _assets,
            builder: (context, snapshot) {
              final assets = snapshot.data ?? (0, 0, 0, 0);
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
                  _AssetStat(
                      count: assets.$4,
                      label: WhatseekProfileStrings.of(context, 'home.asset.agents')),
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
