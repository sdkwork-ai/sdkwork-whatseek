import 'package:flutter/material.dart';

import 'package:sdkwork_whatseek_flutter_mobile_core/sdkwork_whatseek_flutter_mobile_core.dart';

import 'i18n/chat_strings.dart';

/// One rendered chat turn. Assistant text carries an i18n key (raw service
/// text passes through unresolved); AI replies may carry a task id (PRD §41)
/// rendered as a state chip.
class ChatEntry {
  ChatEntry({
    required this.role,
    required this.text,
    this.params = const {},
    this.cards = const [],
    this.taskId,
  });

  final String role;
  final String text;
  final Map<String, Object?> params;
  final List<ChatCard> cards;
  final String? taskId;
}

/// 对话 tab root — the Chat First entry (PRD §8): "你想做什么？告诉我就可以。"
/// with the AI router cards (app results, creation plan, send confirmation)
/// and the task state chips under replies that started a task.
class ChatScreen extends StatefulWidget {
  const ChatScreen({super.key});

  @override
  State<ChatScreen> createState() => _ChatScreenState();
}

class _ChatScreenState extends State<ChatScreen> {
  final List<ChatEntry> _entries = [];
  final TextEditingController _input = TextEditingController();
  final Map<String, TaskState> _taskStates = {};
  bool _sending = false;

  @override
  void initState() {
    super.initState();
    // PRD §5.5 deep link: a task notification in Messages parks the task id
    // on the runtime — restore it as a chat entry with its state chip.
    WhatseekRuntime.instance.pendingTaskLink.addListener(_consumePendingTaskLink);
  }

  @override
  void dispose() {
    WhatseekRuntime.instance.pendingTaskLink.removeListener(_consumePendingTaskLink);
    super.dispose();
  }

  Future<void> _consumePendingTaskLink() async {
    final taskId = WhatseekRuntime.instance.pendingTaskLink.value;
    if (taskId == null || taskId.isEmpty) {
      return;
    }
    WhatseekRuntime.instance.pendingTaskLink.value = null;
    if (_taskStates.containsKey(taskId) || _entries.any((entry) => entry.taskId == taskId)) {
      return;
    }
    try {
      final task = await WhatseekRuntime.instance.tasks.getTask(taskId);
      if (task == null || !mounted) {
        return;
      }
      setState(() {
        _entries.add(ChatEntry(role: 'assistant', text: task.resultSummary ?? task.title, taskId: task.id));
        _taskStates[task.id] = task.state;
      });
    } on Exception {
      if (mounted) {
        setState(() {
          _entries.add(ChatEntry(role: 'assistant', text: 'reply.error'));
        });
      }
    }
  }

  static const List<String> _suggestionKeys = [
    'suggest.searchApp',
    'suggest.createApp',
    'suggest.sendMessage',
    'suggest.searchSupplier',
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
        _entries.add(ChatEntry(
          role: 'assistant',
          text: reply.text,
          params: reply.params,
          cards: reply.cards,
          taskId: reply.taskId,
        ));
        if (reply.taskId != null) {
          _taskStates[reply.taskId!] ??= TaskState.pending;
        }
        _sending = false;
      });
      final taskId = reply.taskId;
      if (taskId != null) {
        await _refreshTask(taskId);
      }
    } on Exception {
      setState(() {
        _entries.add(ChatEntry(role: 'assistant', text: 'reply.error'));
        _sending = false;
      });
    }
  }

  /// Refreshes one task's state through the tasks client (mini-program
  /// `onTaskTap` parity): the chip label updates in place.
  Future<void> _refreshTask(String taskId) async {
    final task = await WhatseekRuntime.instance.tasks.getTask(taskId);
    if (task == null || !mounted) {
      return;
    }
    setState(() {
      _taskStates[taskId] = task.state;
    });
  }

  /// Confirms or cancels a parked waiting_confirmation task (PRD §41):
  /// runs the card action, appends the localized outcome bubble, and
  /// re-reads the task so the chip reflects the terminal state.
  Future<void> _resolveTask(String taskId, String kind) async {
    final runtime = WhatseekRuntime.instance;
    final outcome = await runtime.chat.runCardAction({
      'kind': kind,
      'taskId': taskId,
    });
    if (!mounted) {
      return;
    }
    setState(() {
      _entries.add(ChatEntry(
        role: 'assistant',
        text: outcome.messageKey,
        params: outcome.params,
        taskId: outcome.taskId,
      ));
    });
    await _refreshTask(taskId);
    if (outcome.taskId != null && outcome.taskId != taskId) {
      await _refreshTask(outcome.taskId!);
    }
  }

  Future<void> _runAction(BuildContext context, ChatCard card) async {
    final runtime = WhatseekRuntime.instance;
    final outcome = switch (card.type) {
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
      _ => await runtime.chat.runCardAction({'kind': 'unknown'}),
    };
    setState(() {
      _entries.add(ChatEntry(
        role: 'assistant',
        text: outcome.messageKey,
        params: outcome.params,
      ));
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
      appBar: AppBar(title: Text(WhatseekChatStrings.of(context, 'home.title'))),
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
                        return Align(
                          alignment: Alignment.centerLeft,
                          child: Padding(
                            padding: const EdgeInsets.all(8),
                            child: Text(WhatseekChatStrings.of(context, 'home.thinking')),
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
          Text(WhatseekChatStrings.of(context, 'home.heroTitle'),
              style: Theme.of(context).textTheme.headlineSmall),
          const SizedBox(height: 4),
          Text(WhatseekChatStrings.of(context, 'home.heroSubtitle'),
              style: Theme.of(context).textTheme.bodySmall),
          const SizedBox(height: 24),
          for (final key in _suggestionKeys)
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 32, vertical: 6),
              child: SizedBox(
                width: double.infinity,
                child: OutlinedButton(
                  onPressed: () => _send(WhatseekChatStrings.of(context, key)),
                  child: Text(WhatseekChatStrings.of(context, key)),
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
              isUser
                  ? entry.text
                  : WhatseekChatStrings.of(context, entry.text, entry.params),
              style: TextStyle(color: isUser ? scheme.onPrimary : scheme.onSurface),
            ),
            if (entry.taskId != null) ...[
              const SizedBox(height: 6),
              _buildTaskChip(context, entry.taskId!),
            ],
            for (final card in entry.cards) ...[
              const SizedBox(height: 8),
              _buildCard(context, card),
            ],
          ],
        ),
      ),
    );
  }

  /// Compact AI task state chip (PRD §41): seven-state label from the chat
  /// fragment (`task.*`), tap re-reads the task (H5 `TaskChip` parity). A
  /// parked waiting_confirmation task exposes confirm/cancel actions.
  Widget _buildTaskChip(BuildContext context, String taskId) {
    final state = _taskStates[taskId] ?? TaskState.pending;
    final chip = ActionChip(
      label: Text(WhatseekChatStrings.of(context, state.labelKey)),
      visualDensity: VisualDensity.compact,
      onPressed: () => _refreshTask(taskId),
    );
    if (state != TaskState.waitingConfirmation) {
      return chip;
    }
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        chip,
        const SizedBox(height: 4),
        Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            FilledButton.tonal(
              onPressed: () => _resolveTask(taskId, 'confirm_task'),
              child: Text(WhatseekChatStrings.of(context, 'taskAction.confirm')),
            ),
            const SizedBox(width: 8),
            OutlinedButton(
              onPressed: () => _resolveTask(taskId, 'cancel_task'),
              child: Text(WhatseekChatStrings.of(context, 'taskAction.cancel')),
            ),
          ],
        ),
      ],
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
                  subtitle: Text(
                    '${recommendation.app.summary}\n'
                    '${WhatseekChatStrings.of(context, 'card.recommendReason', {'keyword': recommendation.reason})}'
                    ' · ${recommendation.app.priceLabel}'
                    '${recommendation.app.aiCapability ? ' · ${WhatseekChatStrings.of(context, 'card.aiCapability')}' : ''}',
                  ),
                  isThreeLine: true,
                  trailing: FilledButton.tonal(
                    onPressed: () => Navigator.of(context).pushNamed(
                      'app.whatseek.apps.runner',
                      arguments: recommendation.app.id,
                    ),
                    child: Text(WhatseekChatStrings.of(context, 'card.useNow')),
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
                child: Text(WhatseekChatStrings.of(context, 'card.generateNow')),
              ),
            ],
          ),
        'send_message_confirm' => Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                WhatseekChatStrings.of(context, 'card.sendTo', {'name': card.contactName}),
                style: Theme.of(context).textTheme.titleSmall,
              ),
              const SizedBox(height: 4),
              Text(card.draft),
              const SizedBox(height: 8),
              FilledButton(
                onPressed: () => _runAction(context, card),
                child: Text(WhatseekChatStrings.of(context, 'card.confirmSend')),
              ),
              const SizedBox(height: 4),
              Text(WhatseekChatStrings.of(context, 'card.confirmNote'),
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
              Text(
                WhatseekChatStrings.of(context, commerceTitleKey(card.commerceDomain)),
                style: Theme.of(context).textTheme.bodySmall,
              ),
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

  /// Commerce result headers are keyed per domain (H5 card.commerce.*).
  static String commerceTitleKey(String domain) => switch (domain) {
        'supplier' => 'card.commerce.supplier',
        'service' => 'card.commerce.service',
        _ => 'card.commerce.product',
      };

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
                  hintText: WhatseekChatStrings.of(context, 'home.inputPlaceholder'),
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
              tooltip: WhatseekChatStrings.of(context, 'home.send'),
            ),
          ],
        ),
      ),
    );
  }
}
