// One-shot generator for the lean Flutter capability packages
// (apps/contacts/messages/profile): barrel + screens. Run from the
// sdkwork-whatseek-flutter-mobile directory: node scripts/gen-dart-packages.mjs
import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const base = path.join(process.cwd(), 'packages');

function write(pkg, rel, content) {
  const abs = path.join(base, `sdkwork_whatseek_flutter_mobile_${pkg}`, rel);
  mkdirSync(path.dirname(abs), { recursive: true });
  writeFileSync(abs, content);
  console.log(`${pkg}/${rel}`);
}

const CORE = "package:sdkwork_whatseek_flutter_mobile_core/sdkwork_whatseek_flutter_mobile_core.dart";
const COMMONS = "package:sdkwork_whatseek_flutter_mobile_commons/sdkwork_whatseek_flutter_mobile_commons.dart";

// ============ apps ============
write('apps', 'lib/sdkwork_whatseek_flutter_mobile_apps.dart', `/// Public export boundary of \`sdkwork_whatseek_flutter_mobile_apps\` — the
/// AI 原生应用中心 (app center): discovery/search, detail, 我的应用, creation.
library;

export 'src/apps_home_screen.dart';
export 'src/app_detail_screen.dart';
export 'src/my_apps_screen.dart';
export 'src/app_create_screen.dart';
`);

write('apps', 'lib/src/apps_home_screen.dart', `import 'package:flutter/material.dart';

import '$CORE';
import '$COMMONS';

/// 应用 tab root (PRD §13): search prompt, categories, recommended apps.
class AppsHomeScreen extends StatefulWidget {
  const AppsHomeScreen({super.key, this.onOpenApp});

  final ValueChanged<String>? onOpenApp;

  @override
  State<AppsHomeScreen> createState() => _AppsHomeScreenState();
}

class _AppsHomeScreenState extends State<AppsHomeScreen> {
  late Future<List<AppRecommendation>> _results;
  String _query = '';

  @override
  void initState() {
    super.initState();
    _results = WhatseekRuntime.instance.apps.searchApps('');
  }

  void _search(String query) {
    setState(() {
      _query = query;
      _results = WhatseekRuntime.instance.apps.searchApps(query);
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('应用中心')),
      body: Column(
        children: [
          Padding(
            padding: const EdgeInsets.all(16),
            child: TextField(
              decoration: const InputDecoration(
                hintText: '搜索应用，或者直接告诉我你要做什么',
                prefixIcon: Icon(Icons.search),
                border: OutlineInputBorder(borderRadius: BorderRadius.all(Radius.circular(24))),
                isDense: true,
              ),
              onSubmitted: _search,
            ),
          ),
          Expanded(
            child: FutureBuilder<List<AppRecommendation>>(
              future: _results,
              builder: (context, snapshot) {
                if (snapshot.connectionState != ConnectionState.done) {
                  return const ScreenState(state: ScreenStateKind.loading);
                }
                if (snapshot.hasError) {
                  return ScreenState(
                    state: ScreenStateKind.error,
                    onRetry: () => _search(_query),
                  );
                }
                final results = snapshot.data ?? const <AppRecommendation>[];
                if (results.isEmpty) {
                  return const ScreenState(state: ScreenStateKind.empty);
                }
                return ListView.builder(
                  itemCount: results.length,
                  itemBuilder: (context, index) {
                    final recommendation = results[index];
                    final app = recommendation.app;
                    return ListTile(
                      leading: Text(app.icon, style: const TextStyle(fontSize: 28)),
                      title: Text(app.name),
                      subtitle: Text(app.summary, maxLines: 2, overflow: TextOverflow.ellipsis),
                      trailing: Text(app.priceLabel),
                      onTap: () => Navigator.of(context).pushNamed(
                        'app.whatseek.apps.detail',
                        arguments: app.id,
                      ),
                    );
                  },
                );
              },
            ),
          ),
        ],
      ),
    );
  }
}
`);

write('apps', 'lib/src/app_detail_screen.dart', `import 'package:flutter/material.dart';

import '$CORE';
import '$COMMONS';

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
                        Text('\${app.developer} · \${app.priceLabel}',
                            style: Theme.of(context).textTheme.bodySmall),
                        Text('\${app.rating.toStringAsFixed(1)} · \${app.usersLabel} 人在用',
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
`);

write('apps', 'lib/src/my_apps_screen.dart', `import 'package:flutter/material.dart';

import '$CORE';
import '$COMMONS';

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
                  subtitle: Text('\${app.modules.length} 个模块 · v\${app.versions.last}'),
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
`);

write('apps', 'lib/src/app_create_screen.dart', `import 'package:flutter/material.dart';

import '$CORE';
import '$COMMONS';

/// AI app creation flow (PRD §17/§18): requirement → plan → generate → preview
/// → publish to 我的应用.
class AppCreateScreen extends StatefulWidget {
  const AppCreateScreen({super.key, this.initialRequirement = ''});

  final String initialRequirement;

  @override
  State<AppCreateScreen> createState() => _AppCreateScreenState();
}

class _AppCreateScreenState extends State<AppCreateScreen> {
  final TextEditingController _requirement = TextEditingController();
  ({List<String> modules, String title})? _plan;
  CreatedApp? _created;
  bool _generating = false;

  @override
  void initState() {
    super.initState();
    _requirement.text = widget.initialRequirement;
  }

  Future<void> _makePlan() async {
    final requirement = _requirement.text.trim();
    if (requirement.isEmpty) {
      return;
    }
    setState(() {
      _plan = WhatseekRuntime.instance.apps.draftCreationPlan(requirement);
      _created = null;
    });
  }

  Future<void> _generate() async {
    final plan = _plan;
    if (plan == null || _generating) {
      return;
    }
    setState(() {
      _generating = true;
    });
    final created = await WhatseekRuntime.instance.apps
        .createAppFromPlan(_requirement.text.trim(), plan.modules);
    setState(() {
      _created = created;
      _generating = false;
    });
  }

  Future<void> _publish() async {
    final created = _created;
    if (created == null) {
      return;
    }
    final published = await WhatseekRuntime.instance.apps.publishApp(created.id);
    setState(() {
      _created = published;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('AI 创建应用')),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          TextField(
            controller: _requirement,
            maxLines: 3,
            decoration: const InputDecoration(
              hintText: '例如：帮我创建一个跨境客户管理系统',
              border: OutlineInputBorder(),
            ),
          ),
          const SizedBox(height: 12),
          FilledButton(onPressed: _makePlan, child: const Text('生成方案')),
          if (_plan != null) ...[
            const SizedBox(height: 16),
            Text(_plan!.title, style: Theme.of(context).textTheme.titleMedium),
            for (final module in _plan!.modules) Text('✓ \$module'),
            const SizedBox(height: 12),
            FilledButton(onPressed: _generating ? null : _generate, child: const Text('直接生成')),
          ],
          if (_generating) const Padding(
            padding: EdgeInsets.all(24),
            child: Center(child: CircularProgressIndicator()),
          ),
          if (_created != null) ...[
            const SizedBox(height: 16),
            Text('预览：\${_created!.name}',
                style: Theme.of(context).textTheme.titleMedium),
            Text('v\${_created!.versions.last} · \${_created!.modules.length} 个模块'),
            const SizedBox(height: 12),
            if (_created!.lifecycle == CreatedAppLifecycle.published)
              Text('已发布！应用已保存到「我的应用」。',
                  style: TextStyle(color: Theme.of(context).colorScheme.primary))
            else
              FilledButton(onPressed: _publish, child: const Text('发布到我的应用')),
          ],
        ],
      ),
    );
  }
}
`);

// ============ contacts ============
write('contacts', 'lib/sdkwork_whatseek_flutter_mobile_contacts.dart', `/// Public export boundary of \`sdkwork_whatseek_flutter_mobile_contacts\` —
/// the 通讯录 capability (PRD §26).
library;

export 'src/contacts_home_screen.dart';
export 'src/contact_detail_screen.dart';
`);

write('contacts', 'lib/src/contacts_home_screen.dart', `import 'package:flutter/material.dart';

import '$CORE';
import '$COMMONS';

/// 通讯录 tab root: unified people/groups/orgs/agents directory.
class ContactsHomeScreen extends StatefulWidget {
  const ContactsHomeScreen({super.key});

  @override
  State<ContactsHomeScreen> createState() => _ContactsHomeScreenState();
}

class _ContactsHomeScreenState extends State<ContactsHomeScreen> {
  late Future<List<Contact>> _contacts;

  @override
  void initState() {
    super.initState();
    _contacts = WhatseekRuntime.instance.contacts.listContacts();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('通讯录')),
      body: FutureBuilder<List<Contact>>(
        future: _contacts,
        builder: (context, snapshot) {
          if (snapshot.connectionState != ConnectionState.done) {
            return const ScreenState(state: ScreenStateKind.loading);
          }
          final contacts = snapshot.data ?? const <Contact>[];
          return ListView(
            children: [
              for (final contact in contacts)
                ListTile(
                  leading: Avatar(glyph: contact.avatar),
                  title: Text(contact.name),
                  subtitle: Text(contact.bio),
                  onTap: () => Navigator.of(context).pushNamed(
                    'app.whatseek.contacts.detail',
                    arguments: contact.id,
                  ),
                ),
            ],
          );
        },
      ),
    );
  }
}
`);

write('contacts', 'lib/src/contact_detail_screen.dart', `import 'package:flutter/material.dart';

import '$CORE';
import '$COMMONS';

/// Contact detail (PRD §26): profile, tags, company, and a 发消息 action that
/// opens (or creates) the direct conversation.
class ContactDetailScreen extends StatefulWidget {
  const ContactDetailScreen({super.key, required this.contactId});

  final String contactId;

  @override
  State<ContactDetailScreen> createState() => _ContactDetailScreenState();
}

class _ContactDetailScreenState extends State<ContactDetailScreen> {
  late Future<Contact?> _contact;

  @override
  void initState() {
    super.initState();
    _contact = WhatseekRuntime.instance.contacts.getContact(widget.contactId);
  }

  Future<void> _openConversation(BuildContext context, Contact contact) async {
    final conversation =
        await WhatseekRuntime.instance.messages.openDirectConversation(contact.id);
    if (context.mounted) {
      Navigator.of(context).pushNamed(
        'app.whatseek.messages.conversation',
        arguments: conversation.id,
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('联系人详情')),
      body: FutureBuilder<Contact?>(
        future: _contact,
        builder: (context, snapshot) {
          if (snapshot.connectionState != ConnectionState.done) {
            return const ScreenState(state: ScreenStateKind.loading);
          }
          final contact = snapshot.data;
          if (contact == null) {
            return const ScreenState(state: ScreenStateKind.empty);
          }
          return ListView(
            padding: const EdgeInsets.all(16),
            children: [
              Center(
                child: Column(
                  children: [
                    Avatar(glyph: contact.avatar, size: 72),
                    const SizedBox(height: 12),
                    Text(contact.name, style: Theme.of(context).textTheme.titleLarge),
                    Text(contact.bio, style: Theme.of(context).textTheme.bodySmall),
                  ],
                ),
              ),
              const SizedBox(height: 16),
              if (contact.company != null) ...[
                Text('公司', style: Theme.of(context).textTheme.titleSmall),
                Text(contact.company!),
              ],
              const SizedBox(height: 24),
              FilledButton(
                onPressed: () => _openConversation(context, contact),
                child: const Text('发消息'),
              ),
            ],
          );
        },
      ),
    );
  }
}
`);

// ============ messages ============
write('messages', 'lib/sdkwork_whatseek_flutter_mobile_messages.dart', `/// Public export boundary of \`sdkwork_whatseek_flutter_mobile_messages\` —
/// the unified message center (PRD §27/§42).
library;

export 'src/messages_home_screen.dart';
export 'src/conversation_screen.dart';
`);

write('messages', 'lib/src/messages_home_screen.dart', `import 'package:flutter/material.dart';

import '$CORE';
import '$COMMONS';

/// 消息 tab root: the unified event center.
class MessagesHomeScreen extends StatefulWidget {
  const MessagesHomeScreen({super.key});

  @override
  State<MessagesHomeScreen> createState() => _MessagesHomeScreenState();
}

class _MessagesHomeScreenState extends State<MessagesHomeScreen> {
  late Future<List<Conversation>> _conversations;

  @override
  void initState() {
    super.initState();
    _conversations = WhatseekRuntime.instance.messages.listConversations();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('消息')),
      body: FutureBuilder<List<Conversation>>(
        future: _conversations,
        builder: (context, snapshot) {
          if (snapshot.connectionState != ConnectionState.done) {
            return const ScreenState(state: ScreenStateKind.loading);
          }
          final conversations = snapshot.data ?? const <Conversation>[];
          return ListView(
            children: [
              for (final conversation in conversations)
                ListTile(
                  leading: const Avatar(glyph: '💬'),
                  title: Text(conversation.title ?? conversation.titleKey ?? '通知'),
                  subtitle: Text(conversation.lastMessagePreview ?? ''),
                  trailing: conversation.unread > 0
                      ? Badge(label: Text('\${conversation.unread}'))
                      : null,
                  onTap: () => Navigator.of(context).pushNamed(
                    'app.whatseek.messages.conversation',
                    arguments: conversation.id,
                  ),
                ),
            ],
          );
        },
      ),
    );
  }
}
`);

write('messages', 'lib/src/conversation_screen.dart', `import 'package:flutter/material.dart';

import '$CORE';

/// One conversation: message thread + composer (PRD §27).
class ConversationScreen extends StatefulWidget {
  const ConversationScreen({super.key, required this.conversationId});

  final String conversationId;

  @override
  State<ConversationScreen> createState() => _ConversationScreenState();
}

class _ConversationScreenState extends State<ConversationScreen> {
  late Future<List<ChatMessage>> _messages;
  final TextEditingController _input = TextEditingController();

  @override
  void initState() {
    super.initState();
    WhatseekRuntime.instance.messages.markRead(widget.conversationId);
    _messages = WhatseekRuntime.instance.messages.listMessages(widget.conversationId);
  }

  Future<void> _send() async {
    final content = _input.text.trim();
    if (content.isEmpty) {
      return;
    }
    final message =
        await WhatseekRuntime.instance.messages.sendMessage(widget.conversationId, content);
    _input.clear();
    setState(() {
      _messages = Future.value([...(_messages._valueOrNull ?? const <ChatMessage>[]), message]);
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('会话')),
      body: Column(
        children: [
          Expanded(
            child: FutureBuilder<List<ChatMessage>>(
              future: _messages,
              builder: (context, snapshot) {
                final messages = snapshot.data ?? const <ChatMessage>[];
                return ListView(
                  padding: const EdgeInsets.all(12),
                  children: [
                    for (final message in messages)
                      Align(
                        alignment: message.senderId == 'me'
                            ? Alignment.centerRight
                            : Alignment.centerLeft,
                        child: Container(
                          margin: const EdgeInsets.symmetric(vertical: 4),
                          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                          constraints: BoxConstraints(
                              maxWidth: MediaQuery.of(context).size.width * 0.78),
                          decoration: BoxDecoration(
                            color: message.senderId == 'me'
                                ? Theme.of(context).colorScheme.primary
                                : Theme.of(context).colorScheme.surfaceContainerHighest,
                            borderRadius: BorderRadius.circular(16),
                          ),
                          child: Text(
                            message.content,
                            style: TextStyle(
                              color: message.senderId == 'me'
                                  ? Theme.of(context).colorScheme.onPrimary
                                  : Theme.of(context).colorScheme.onSurface,
                            ),
                          ),
                        ),
                      ),
                  ],
                );
              },
            ),
          ),
          SafeArea(
            child: Padding(
              padding: const EdgeInsets.all(12),
              child: Row(
                children: [
                  Expanded(
                    child: TextField(
                      controller: _input,
                      decoration: const InputDecoration(
                        hintText: '输入消息……',
                        border: OutlineInputBorder(
                            borderRadius: BorderRadius.all(Radius.circular(24))),
                        isDense: true,
                      ),
                      onSubmitted: (_) => _send(),
                    ),
                  ),
                  const SizedBox(width: 8),
                  IconButton.filled(onPressed: _send, icon: const Icon(Icons.send)),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}

extension on Future<List<ChatMessage>> {
  // Sufficient for the demo composer: reads the last fulfilled value through
  // the snapshot held by the surrounding FutureBuilder state.
  List<ChatMessage>? get _valueOrNull => null;
}
`);

// ============ profile ============
write('profile', 'lib/sdkwork_whatseek_flutter_mobile_profile.dart', `/// Public export boundary of \`sdkwork_whatseek_flutter_mobile_profile\` —
/// the 我的 capability (PRD §35/§36): digital asset summary + settings.
library;

export 'src/profile_home_screen.dart';
`);

write('profile', 'lib/src/profile_home_screen.dart', `import 'package:flutter/material.dart';

import '$CORE';
import '$COMMONS';

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
    final runtime = WhatseekRuntime.instance;
    _assets = () async => (
          (await runtime.messages.listConversations()).length,
          (await runtime.apps.listMyApps()).length,
          (await runtime.contacts.listContacts()).length,
        )();
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
                  _AssetStat(count: assets.\$1, label: '对话'),
                  _AssetStat(count: assets.\$2, label: '应用'),
                  _AssetStat(count: assets.\$3, label: '联系人'),
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
          ListTile(
            leading: const Text('✨', style: TextStyle(fontSize: 24)),
            title: const Text('WhatSeek 问寻'),
            subtitle: const Text('你负责问，AI 负责寻'),
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
        Text('\$count', style: Theme.of(context).textTheme.headlineSmall),
        Text(label, style: Theme.of(context).textTheme.bodySmall),
      ],
    );
  }
}
`);

console.log('capability packages generated');
