import 'package:flutter/material.dart';

import 'package:sdkwork_whatseek_flutter_mobile_core/sdkwork_whatseek_flutter_mobile_core.dart';

import 'i18n/chat_strings.dart';

/// One rendered chat turn.
class ChatEntry {
  ChatEntry({required this.role, required this.text, this.cards = const []});

  final String role;
  final String text;
  final List<ChatCard> cards;
}

/// 对话 tab root — the Chat First entry (PRD §8): "你想做什么？告诉我就可以。"
/// with the AI router cards (app results, creation plan, send confirmation).
class ChatScreen extends StatefulWidget {
  const ChatScreen({super.key});

  @override
  State<ChatScreen> createState() => _ChatScreenState();
}

class _ChatScreenState extends State<ChatScreen> {
  final List<ChatEntry> _entries = [];
  final TextEditingController _input = TextEditingController();
  bool _sending = false;

  static const List<String> _suggestions = [
    '帮我找一个视频剪辑工具',
    '帮我做一个库存管理系统',
    '给张三发消息，告诉他下午三点开会',
    '找一个支持定制的手机壳供应商',
  ];

  Future<void> _send(String text) async {
    final trimmed = text.trim();
    if (trimmed.isEmpty || _sending) {
      return;
    }
    setState(() {
      _entries.add(ChatEntry(role: 'user', text: trimmed));
      _sending = true;
    });
    try {
      final reply = await WhatseekRuntime.instance.chat.handleSend(trimmed);
      setState(() {
        _entries.add(ChatEntry(role: 'assistant', text: reply.text, cards: reply.cards));
        _sending = false;
      });
    } on Exception {
      setState(() {
        _entries.add(ChatEntry(role: 'assistant', text: '出了点问题，请重试。'));
        _sending = false;
      });
    }
  }

  Future<void> _runAction(BuildContext context, ChatCard card) async {
    final runtime = WhatseekRuntime.instance;
    final message = switch (card.type) {
      'app_plan' => await runtime.chat.runCardAction({
          'kind': 'generate_app',
          'requirement': card.planRequirement,
          'modules': card.planModules,
        }),
      'send_message_confirm' => await runtime.chat.runCardAction({
          'kind': 'confirm_send_message',
          'contactId': card.contactId,
          'contactName': card.contactName,
          'draft': card.draft,
        }),
      _ => '好的。',
    };
    setState(() {
      _entries.add(ChatEntry(role: 'assistant', text: message));
    });
  }

  void _openContact(BuildContext context, String contactId) {
    Navigator.of(context).pushNamed(
      'app.whatseek.contacts.detail',
      arguments: contactId,
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('对话')),
      body: Column(
        children: [
          Expanded(
            child: _entries.isEmpty
                ? _buildHero(context)
                : ListView.builder(
                    padding: const EdgeInsets.all(16),
                    itemCount: _entries.length + (_sending ? 1 : 0),
                    itemBuilder: (context, index) {
                      if (index == _entries.length) {
                        return const Align(
                          alignment: Alignment.centerLeft,
                          child: Padding(
                            padding: EdgeInsets.all(8),
                            child: Text('问寻正在思考…'),
                          ),
                        );
                      }
                      final entry = _entries[index];
                      return _buildEntry(context, entry);
                    },
                  ),
          ),
          _buildComposer(context),
        ],
      ),
    );
  }

  Widget _buildHero(BuildContext context) {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Text(WhatseekChatStrings.home('heroTitle'), style: Theme.of(context).textTheme.headlineSmall),
          const SizedBox(height: 4),
          Text(WhatseekChatStrings.home('heroSubtitle'), style: Theme.of(context).textTheme.bodySmall),
          const SizedBox(height: 24),
          for (final suggestion in _suggestions)
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 32, vertical: 6),
              child: SizedBox(
                width: double.infinity,
                child: OutlinedButton(
                  onPressed: () => _send(suggestion),
                  child: Text(suggestion),
                ),
              ),
            ),
        ],
      ),
    );
  }

  Widget _buildEntry(BuildContext context, ChatEntry entry) {
    final isUser = entry.role == 'user';
    final scheme = Theme.of(context).colorScheme;
    return Align(
      alignment: isUser ? Alignment.centerRight : Alignment.centerLeft,
      child: Container(
        margin: const EdgeInsets.symmetric(vertical: 4),
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
        constraints: BoxConstraints(maxWidth: MediaQuery.of(context).size.width * 0.82),
        decoration: BoxDecoration(
          color: isUser ? scheme.primary : scheme.surfaceContainerHighest,
          borderRadius: BorderRadius.circular(16),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              entry.text,
              style: TextStyle(color: isUser ? scheme.onPrimary : scheme.onSurface),
            ),
            for (final card in entry.cards) ...[
              const SizedBox(height: 8),
              _buildCard(context, card),
            ],
          ],
        ),
      ),
    );
  }

  Widget _buildCard(BuildContext context, ChatCard card) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: Theme.of(context).colorScheme.surface,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: Theme.of(context).colorScheme.outlineVariant),
      ),
      child: switch (card.type) {
        'app_results' => Column(
            children: [
              for (final recommendation in card.apps)
                ListTile(
                  dense: true,
                  contentPadding: EdgeInsets.zero,
                  leading: Text(recommendation.app.icon, style: const TextStyle(fontSize: 24)),
                  title: Text(recommendation.app.name),
                  subtitle: Text('${recommendation.app.summary}\n匹配 ${recommendation.reason} · ${recommendation.app.priceLabel}'),
                  isThreeLine: true,
                  trailing: FilledButton.tonal(
                    onPressed: () => Navigator.of(context).pushNamed(
                      'app.whatseek.apps.runner',
                      arguments: recommendation.app.id,
                    ),
                    child: const Text('使用'),
                  ),
                ),
            ],
          ),
        'app_plan' => Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(card.planTitle, style: Theme.of(context).textTheme.titleSmall),
              const SizedBox(height: 4),
              for (final module in card.planModules) Text('✓ $module'),
              const SizedBox(height: 8),
              FilledButton(
                onPressed: _sending ? null : () => _runAction(context, card),
                child: const Text('直接生成'),
              ),
            ],
          ),
        'send_message_confirm' => Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text('发送给 ${card.contactName}：', style: Theme.of(context).textTheme.titleSmall),
              const SizedBox(height: 4),
              Text(card.draft),
              const SizedBox(height: 8),
              FilledButton(
                onPressed: () => _runAction(context, card),
                child: const Text('确认发送'),
              ),
              const SizedBox(height: 4),
              Text('涉及对外发送，需要你明确确认后才会执行。',
                  style: Theme.of(context).textTheme.bodySmall),
            ],
          ),
        'contact_results' => Column(
            children: [
              for (final contact in card.contacts)
                ListTile(
                  dense: true,
                  contentPadding: EdgeInsets.zero,
                  title: Text(contact.name),
                  subtitle: Text(contact.bio),
                  onTap: () => _openContact(context, contact.id),
                ),
            ],
          ),
        'commerce_results' => Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text('${card.commerceDomain} 结果（商业生态预览）',
                  style: Theme.of(context).textTheme.bodySmall),
              for (final item in card.commerceItems)
                ListTile(
                  dense: true,
                  contentPadding: EdgeInsets.zero,
                  title: Text(item.title),
                  subtitle: Text(item.subtitle),
                  trailing: Text(item.priceLabel),
                ),
            ],
          ),
        _ => const SizedBox.shrink(),
      },
    );
  }

  Widget _buildComposer(BuildContext context) {
    return SafeArea(
      child: Padding(
        padding: const EdgeInsets.all(12),
        child: Row(
          children: [
            Expanded(
              child: TextField(
                controller: _input,
                decoration: InputDecoration(
                  hintText: WhatseekChatStrings.home('composerHint'),
                  border: const OutlineInputBorder(borderRadius: BorderRadius.all(Radius.circular(24))),
                  isDense: true,
                ),
                onSubmitted: _send,
              ),
            ),
            const SizedBox(width: 8),
            IconButton.filled(
              onPressed: _sending ? null : () => _send(_input.text),
              icon: const Icon(Icons.send),
            ),
          ],
        ),
      ),
    );
  }
}
