import 'package:flutter/material.dart';

import "package:sdkwork_whatseek_flutter_mobile_core/sdkwork_whatseek_flutter_mobile_core.dart";
import "package:sdkwork_whatseek_flutter_mobile_commons/sdkwork_whatseek_flutter_mobile_commons.dart";

import 'i18n/messages_strings.dart';

/// One conversation: message thread + composer (PRD §27).
class ConversationScreen extends StatefulWidget {
  const ConversationScreen({super.key, required this.conversationId});

  final String conversationId;

  @override
  State<ConversationScreen> createState() => _ConversationScreenState();
}

class _ConversationScreenState extends State<ConversationScreen> {
  List<ChatMessage> _messages = const <ChatMessage>[];
  bool _loading = true;
  String? _linkedTaskId;
  final TextEditingController _input = TextEditingController();

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    await WhatseekRuntime.instance.messages.markRead(widget.conversationId);
    final conversations =
        await WhatseekRuntime.instance.messages.listConversations();
    final messages =
        await WhatseekRuntime.instance.messages.listMessages(widget.conversationId);
    final conversation = conversations
        .where((entry) => entry.id == widget.conversationId)
        .toList(growable: false);
    final isTask = conversation.isNotEmpty && conversation.first.kind == ConversationKind.task;
    setState(() {
      _messages = messages;
      _linkedTaskId = isTask
          ? conversation.first.taskId ??
              (widget.conversationId.startsWith('whatseek-task-')
                  ? widget.conversationId.substring('whatseek-task-'.length)
                  : null)
          : null;
      _loading = false;
    });
  }

  /// PRD §5.5: task notifications link back to the task result in chat —
  /// park the task id on the runtime, request the chat tab, and pop back.
  void _openTaskInChat() {
    final taskId = _linkedTaskId;
    if (taskId == null || taskId.isEmpty) {
      return;
    }
    WhatseekRuntime.instance.pendingTaskLink.value = taskId;
    WhatseekRuntime.instance.tabRequest.value = 0;
    Navigator.of(context).pop();
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
      _messages = [..._messages, message];
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text(WhatseekMessagesStrings.of(context, 'conversation.title'))),
      body: Column(
        children: [
          if (_linkedTaskId != null)
            Padding(
              padding: const EdgeInsets.fromLTRB(12, 12, 12, 0),
              child: SizedBox(
                width: double.infinity,
                child: OutlinedButton.icon(
                  onPressed: _openTaskInChat,
                  icon: const Icon(Icons.task_alt),
                  label: Text(WhatseekMessagesStrings.of(context, 'conversation.viewTask')),
                ),
              ),
            ),
          Expanded(
            child: _loading
                ? const Center(child: CircularProgressIndicator())
                : _messages.isEmpty
                    ? ScreenState(
                        state: ScreenStateKind.empty,
                        title: WhatseekMessagesStrings.of(context, 'conversation.emptyTitle'),
                      )
                    : ListView(
                        padding: const EdgeInsets.all(12),
                        children: [
                          for (final message in _messages)
                            Align(
                              alignment: message.senderId == 'me'
                                  ? Alignment.centerRight
                                  : Alignment.centerLeft,
                              child: Container(
                                margin: const EdgeInsets.symmetric(vertical: 4),
                                padding:
                                    const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
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
                      decoration: InputDecoration(
                        hintText:
                            WhatseekMessagesStrings.of(context, 'conversation.inputPlaceholder'),
                        border: const OutlineInputBorder(
                            borderRadius: BorderRadius.all(Radius.circular(24))),
                        isDense: true,
                      ),
                      onSubmitted: (_) => _send(),
                    ),
                  ),
                  const SizedBox(width: 8),
                  IconButton.filled(
                    onPressed: _send,
                    icon: const Icon(Icons.send),
                    tooltip: WhatseekMessagesStrings.of(context, 'conversation.send'),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}
