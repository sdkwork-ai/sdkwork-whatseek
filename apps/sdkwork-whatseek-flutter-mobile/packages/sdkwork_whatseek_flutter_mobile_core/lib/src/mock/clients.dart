/// Mock contacts/messages/tasks/chat clients (Dart port of the shared TS
/// service family; in-memory, Phase 2 swaps for generated SDK clients).
library;

import '../intent.dart';
import '../models.dart';
import 'apps_client.dart';

class MockContactsClient {
  MockContactsClient({List<Contact>? seed}) : _contacts = seed ?? kDefaultContacts;

  final List<Contact> _contacts;

  Future<List<Contact>> listContacts() async => List.unmodifiable(_contacts);

  Future<List<Contact>> searchContacts(String query) async {
    final trimmed = query.trim().toLowerCase();
    if (trimmed.isEmpty) {
      return List.unmodifiable(_contacts);
    }
    return _contacts
        .where((contact) =>
            contact.name.toLowerCase().contains(trimmed) ||
            contact.bio.toLowerCase().contains(trimmed) ||
            contact.tags.any((tag) => tag.toLowerCase().contains(trimmed)))
        .toList();
  }

  Future<Contact?> getContact(String contactId) async {
    for (final contact in _contacts) {
      if (contact.id == contactId) {
        return contact;
      }
    }
    return null;
  }
}

const List<Contact> kDefaultContacts = [
  Contact(
    id: 'zhangsan',
    name: '张三',
    kind: ContactKind.person,
    bio: '产品经理 · 负责问寻应用中心',
    tags: ['同事', '产品'],
    avatar: '🧑‍💼',
    company: '问寻',
  ),
  Contact(
    id: 'lisi',
    name: '李四',
    kind: ContactKind.person,
    bio: '前端工程师 · H5 渲染层',
    tags: ['同事', '前端'],
    avatar: '👩‍💻',
    company: '问寻',
  ),
  Contact(
    id: 'design-team',
    name: '设计团队',
    kind: ContactKind.group,
    bio: '问寻设计部 · 视觉与体验',
    tags: ['群组', '设计'],
    avatar: '🎨',
  ),
  Contact(
    id: 'supplier-jinshang',
    name: '上海锦裳服饰',
    kind: ContactKind.org,
    bio: 'T 恤/卫衣定制供应商 · 7 天打样',
    tags: ['供应商', '服饰'],
    avatar: '🏭',
    company: '上海锦裳服饰有限公司',
  ),
  Contact(
    id: 'agent-news',
    name: '行业新闻整理 Agent',
    kind: ContactKind.agent,
    bio: '每天 9:00 整理行业新闻摘要',
    tags: ['Agent', '新闻'],
    avatar: '🤖',
  ),
  Contact(
    id: 'whatseek-ai',
    name: '问寻 AI 助手',
    kind: ContactKind.assistant,
    bio: '你负责问，AI 负责寻',
    tags: ['AI', '官方'],
    avatar: '✨',
  ),
];

class MockMessagesClient {
  MockMessagesClient() {
    final now = DateTime.now();
    _conversations.addAll([
      const Conversation(
        id: 'conv-zhangsan',
        kind: ConversationKind.direct,
        title: '张三',
        contactId: 'zhangsan',
        unread: 1,
        lastMessagePreview: '下午三点开会记得参加。',
      ),
      const Conversation(
        id: 'conv-design',
        kind: ConversationKind.group,
        title: '设计团队',
        contactId: 'design-team',
        unread: 0,
        lastMessagePreview: '新首页方案已上传。',
      ),
      const Conversation(
        id: 'conv-agent-news',
        kind: ConversationKind.agent,
        title: '行业新闻整理 Agent',
        contactId: 'agent-news',
        unread: 2,
        lastMessagePreview: '今日行业新闻摘要已生成。',
      ),
      const Conversation(
        id: 'conv-task-video',
        kind: ConversationKind.task,
        titleKey: 'whatseek.messages.kind.task',
        taskId: 'task-demo-video',
        unread: 1,
        lastMessagePreview: '你要求的视频已经生成。',
      ),
    ]);
    _messages['conv-zhangsan'] = [
      ChatMessage(
        id: 'm-1',
        conversationId: 'conv-zhangsan',
        senderId: 'zhangsan',
        senderName: '张三',
        content: '下午三点开会记得参加。',
        sentAt: now,
      ),
    ];
  }

  final List<Conversation> _conversations = [];
  final Map<String, List<ChatMessage>> _messages = {};

  Future<List<Conversation>> listConversations() async {
    final sorted = [..._conversations]
      ..sort((a, b) => (b.updatedAt ?? DateTime(0)).compareTo(a.updatedAt ?? DateTime(0)));
    return List.unmodifiable(sorted);
  }

  Future<List<ChatMessage>> listMessages(String conversationId) async =>
      List.unmodifiable(_messages[conversationId] ?? const []);

  Future<ChatMessage> sendMessage(String conversationId, String content) async {
    final now = DateTime.now();
    final message = ChatMessage(
      id: 'm-${now.millisecondsSinceEpoch.toRadixString(36)}',
      conversationId: conversationId,
      senderId: 'me',
      senderName: '我',
      content: content,
      sentAt: now,
    );
    _messages[conversationId] = [...(_messages[conversationId] ?? const <ChatMessage>[]), message];
    return message;
  }

  Future<void> markRead(String conversationId) async {
    for (var index = 0; index < _conversations.length; index++) {
      final conversation = _conversations[index];
      if (conversation.id == conversationId && conversation.unread != 0) {
        _conversations[index] = Conversation(
          id: conversation.id,
          kind: conversation.kind,
          titleKey: conversation.titleKey,
          title: conversation.title,
          contactId: conversation.contactId,
          taskId: conversation.taskId,
          unread: 0,
          updatedAt: conversation.updatedAt,
          lastMessagePreview: conversation.lastMessagePreview,
        );
      }
    }
  }

  Future<Conversation> openDirectConversation(String contactId) async {
    for (final conversation in _conversations) {
      if (conversation.kind == ConversationKind.direct && conversation.contactId == contactId) {
        return conversation;
      }
    }
    final created = Conversation(
      id: 'conv-$contactId',
      kind: ConversationKind.direct,
      title: contactId,
      contactId: contactId,
      unread: 0,
      updatedAt: DateTime.now(),
    );
    _conversations.insert(0, created);
    _messages[created.id] = const [];
    return created;
  }

  Future<void> postTaskNotification(WhatseekTask task) async {
    final conversationId = 'conv-task-${task.id}';
    final now = DateTime.now();
    final content = task.resultSummary ?? task.title;
    final outcome = switch (task.state) {
      TaskState.cancelled => '已取消。',
      TaskState.expired => '已过期。',
      _ => '已完成。',
    };
    final preview = '「$content」$outcome';
    final existing = _conversations.indexWhere((conversation) => conversation.id == conversationId);
    final message = ChatMessage(
      id: 'm-${task.id}-$outcome',
      conversationId: conversationId,
      senderId: 'task',
      senderName: '问寻 AI',
      content: preview,
      sentAt: now,
    );
    if (existing >= 0) {
      final conversation = _conversations[existing];
      _conversations[existing] = Conversation(
        id: conversation.id,
        kind: conversation.kind,
        titleKey: conversation.titleKey,
        title: conversation.title,
        contactId: conversation.contactId,
        taskId: conversation.taskId,
        unread: conversation.unread,
        updatedAt: now,
        lastMessagePreview: preview,
      );
      _messages[conversationId] = [...(_messages[conversationId] ?? const <ChatMessage>[]), message];
      return;
    }
    _conversations.insert(
      0,
      Conversation(
        id: conversationId,
        kind: ConversationKind.task,
        titleKey: 'whatseek.messages.kind.task',
        taskId: task.id,
        unread: 1,
        updatedAt: now,
        lastMessagePreview: preview,
      ),
    );
    _messages[conversationId] = [message];
  }

  Future<int> unreadTotal() async {
    var total = 0;
    for (final conversation in _conversations) {
      total += conversation.unread;
    }
    return total;
  }
}

class MockTasksClient {
  final List<WhatseekTask> _tasks = [];

  Future<WhatseekTask> createTask({required String title, required String intent}) async {
    final now = DateTime.now();
    final task = WhatseekTask(
      id: 'task-${now.millisecondsSinceEpoch.toRadixString(36)}',
      title: title,
      intent: intent,
      state: TaskState.pending,
      createdAt: now,
      updatedAt: now,
    );
    _tasks.insert(0, task);
    return task;
  }

  Future<WhatseekTask> updateTaskState(
    String taskId,
    TaskState state, {
    String? resultSummary,
  }) async {
    final index = _tasks.indexWhere((task) => task.id == taskId);
    if (index < 0) {
      throw StateError('task not found: $taskId');
    }
    final existing = _tasks[index];
    final updated = WhatseekTask(
      id: existing.id,
      title: existing.title,
      intent: existing.intent,
      state: state,
      createdAt: existing.createdAt,
      updatedAt: DateTime.now(),
      resultSummary: resultSummary ?? existing.resultSummary,
      createdAppId: existing.createdAppId,
    );
    _tasks[index] = updated;
    return updated;
  }

  Future<WhatseekTask?> getTask(String taskId) async {
    for (final task in _tasks) {
      if (task.id == taskId) {
        return task;
      }
    }
    return null;
  }

  Future<List<WhatseekTask>> listTasks() async => List.unmodifiable(_tasks);
}

/// Mock AI chat client: the AI Router (PRD §11) — Dart port of the TS mock.
/// Replies carry i18n keys (`whatseek.chat.reply.*`) so the UI translates
/// them with raw-text fallback (H5 parity).
class MockChatClient {
  MockChatClient({
    required this.apps,
    required this.contacts,
    required this.messages,
    required this.tasks,
  });

  static const String _replyPrefix = 'whatseek.chat.reply.';

  final MockAppsClient apps;
  final MockContactsClient contacts;
  final MockMessagesClient messages;
  final MockTasksClient tasks;

  Future<ChatReply> handleSend(String text) async {
    final trimmed = text.trim();
    final intent = recognizeIntent(trimmed);
    switch (intent.intent) {
      case 'SEARCH_APP':
        final results = await apps.searchApps(trimmed);
        if (results.isNotEmpty) {
          return ChatReply(
            text: '${_replyPrefix}searchAppFound',
            cards: [ChatCard(type: 'app_results', apps: results.take(3).toList())],
          );
        }
        final plan = apps.draftCreationPlan(trimmed);
        return ChatReply(
          text: '${_replyPrefix}searchAppNotFoundCreate',
          cards: [
            ChatCard(
              type: 'app_plan',
              planTitle: plan.title,
              planModules: plan.modules,
              planRequirement: trimmed,
            ),
          ],
        );
      case 'CREATE_APP':
        final plan = apps.draftCreationPlan(trimmed);
        return ChatReply(
          text: '${_replyPrefix}createAppPlan',
          cards: [
            ChatCard(
              type: 'app_plan',
              planTitle: plan.title,
              planModules: plan.modules,
              planRequirement: trimmed,
            ),
          ],
        );
      case 'SEND_MESSAGE':
        final name = extractContactName(trimmed);
        final matches = name != null
            ? await contacts.searchContacts(name)
            : await contacts.listContacts();
        if (matches.isEmpty) {
          return const ChatReply(text: '${_replyPrefix}sendMessageContactNotFound');
        }
        final contact = matches.first;
        return ChatReply(
          text: '${_replyPrefix}sendMessageConfirm',
          cards: [
            ChatCard(
              type: 'send_message_confirm',
              contactId: contact.id,
              contactName: contact.name,
              draft: extractDraftMessage(trimmed) ?? trimmed,
            ),
          ],
        );
      case 'SEARCH_PERSON':
        final matches = await contacts.searchContacts(trimmed);
        if (matches.isNotEmpty) {
          return ChatReply(
            text: '${_replyPrefix}searchPersonFound',
            cards: [ChatCard(type: 'contact_results', contacts: matches.take(4).toList())],
          );
        }
        return const ChatReply(text: '${_replyPrefix}searchPersonNotFound');
      case 'SEARCH_SUPPLIER':
        return const ChatReply(
          text: '${_replyPrefix}searchSupplier',
          cards: [
            ChatCard(
              type: 'commerce_results',
              commerceDomain: 'supplier',
              commerceItems: [
                CommerceResult(
                  id: 's-1',
                  title: '上海锦裳服饰有限公司',
                  subtitle: 'T 恤/卫衣 · 支持定制 · 7 天打样',
                  priceLabel: '起订 ¥20 以内',
                ),
                CommerceResult(
                  id: 's-2',
                  title: '广州佰裳制衣厂',
                  subtitle: '跨境快返 · 1000 件起 · SGS 认证',
                  priceLabel: '¥11 起/件',
                ),
                CommerceResult(
                  id: 's-3',
                  title: '义乌市皓瀚服饰',
                  subtitle: '现货混批 · 一件代发',
                  priceLabel: '¥9.9 起/件',
                ),
              ],
            ),
          ],
        );
      case 'SEARCH_PRODUCT':
        return const ChatReply(
          text: '${_replyPrefix}commercePreview',
          cards: [
            ChatCard(
              type: 'commerce_results',
              commerceDomain: 'product',
              commerceItems: [
                CommerceResult(
                  id: 'p-1',
                  title: '黑色圆领 T 恤 220g',
                  subtitle: '纯棉 · 支持定制印花 · 起订 100 件',
                  priceLabel: '¥12.5/件',
                ),
                CommerceResult(
                  id: 'p-2',
                  title: '速干 T 恤 批发款',
                  subtitle: '速干面料 · 8 色可选 · 起订 50 件',
                  priceLabel: '¥18/件',
                ),
                CommerceResult(
                  id: 'p-3',
                  title: '重磅纯色 T 恤',
                  subtitle: '260g 重磅 · 小单快返',
                  priceLabel: '¥25/件',
                ),
              ],
            ),
          ],
        );
      case 'SEARCH_SERVICE':
        return const ChatReply(
          text: '${_replyPrefix}commercePreview',
          cards: [
            ChatCard(
              type: 'commerce_results',
              commerceDomain: 'service',
              commerceItems: [
                CommerceResult(
                  id: 'sv-1',
                  title: '跨境代运营服务',
                  subtitle: '店铺搭建 + 投放 · 按月服务',
                  priceLabel: '¥3000/月',
                ),
                CommerceResult(
                  id: 'sv-2',
                  title: '商品拍摄服务',
                  subtitle: '白底图/场景图 · 48h 交付',
                  priceLabel: '¥80/张',
                ),
                CommerceResult(
                  id: 'sv-3',
                  title: '独立站 SEO 咨询',
                  subtitle: '关键词策略 + 内容规划',
                  priceLabel: '¥1500/次',
                ),
              ],
            ),
          ],
        );
      case 'CREATE_CONTENT':
      case 'EXECUTE_TASK':
      case 'EDIT_CONTENT':
        // Forward task simulation (PRD §41): the chain parks at
        // waiting_confirmation; the user's confirm/cancel action resolves it.
        final task = await tasks.createTask(title: trimmed, intent: intent.intent);
        await tasks.updateTaskState(task.id, TaskState.running);
        await tasks.updateTaskState(task.id, TaskState.waitingConfirmation);
        return ChatReply(text: '${_replyPrefix}task.accepted', taskId: task.id);
      case 'SEARCH_AGENT':
      case 'USE_AGENT': {
        bool isAgent(Contact contact) =>
            contact.kind == ContactKind.agent || contact.kind == ContactKind.assistant;
        final searched = (await contacts.searchContacts(trimmed)).where(isAgent).toList();
        final matches = searched.isNotEmpty ? searched : (await contacts.listContacts()).where(isAgent).toList();
        if (matches.isNotEmpty) {
          return ChatReply(
            text: intent.intent == 'SEARCH_AGENT'
                ? '${_replyPrefix}searchAgent.found'
                : '${_replyPrefix}useAgent.found',
            cards: [ChatCard(type: 'contact_results', contacts: matches.take(4).toList())],
          );
        }
        return const ChatReply(text: '${_replyPrefix}searchAgent.notFound');
      }
      case 'CREATE_AGENT':
        // Creating a real digital employee needs the agent platform
        // (Phase 2); the mock roster is the honest recommendation instead.
        final roster = await contacts.listContacts();
        final agents = roster
            .where((contact) => contact.kind == ContactKind.agent || contact.kind == ContactKind.assistant)
            .toList();
        return ChatReply(
          text: '${_replyPrefix}createAgent.recommend',
          cards: [ChatCard(type: 'contact_results', contacts: agents.take(4).toList())],
        );
      case 'USE_APP': {
        final results = await apps.searchApps(trimmed);
        if (results.isNotEmpty) {
          return ChatReply(
            text: '${_replyPrefix}searchAppFound',
            cards: [ChatCard(type: 'app_results', apps: results.take(3).toList())],
          );
        }
        return const ChatReply(text: '${_replyPrefix}searchAgent.notFound');
      }
      default:
        return const ChatReply(text: '${_replyPrefix}general');
    }
  }

  Future<ChatActionOutcome> runCardAction(Map<String, Object?> action) async {
    final kind = action['kind'] as String?;
    switch (kind) {
      case 'generate_app':
        final requirement = action['requirement'] as String? ?? '';
        final modules = (action['modules'] as List<Object?>?)?.cast<String>() ?? const <String>[];
        final task = await tasks.createTask(title: requirement, intent: 'CREATE_APP');
        await tasks.updateTaskState(task.id, TaskState.running);
        final created = await apps.createAppFromPlan(requirement, modules);
        await tasks.updateTaskState(task.id, TaskState.completed, resultSummary: created.name);
        await messages.postTaskNotification(
          WhatseekTask(
            id: task.id,
            title: task.title,
            intent: task.intent,
            state: TaskState.completed,
            createdAt: task.createdAt,
            updatedAt: DateTime.now(),
            resultSummary: created.name,
            createdAppId: created.id,
          ),
        );
        return ChatActionOutcome(
          messageKey: '${_replyPrefix}actionAppGenerated',
          params: {'name': created.name},
          taskId: task.id,
        );
      case 'confirm_send_message':
        final contactId = action['contactId'] as String? ?? '';
        final draft = action['draft'] as String? ?? '';
        final conversation = await messages.openDirectConversation(contactId);
        await messages.sendMessage(conversation.id, draft);
        await messages.markRead(conversation.id);
        return const ChatActionOutcome(messageKey: '${_replyPrefix}actionMessageSent');
      case 'confirm_task':
      case 'cancel_task': {
        // User confirmation resolves a parked waiting_confirmation task
        // (PRD §41); the outcome lands in the message center.
        final taskId = action['taskId'] as String? ?? '';
        final task = await tasks.getTask(taskId);
        if (task == null || task.state != TaskState.waitingConfirmation) {
          return ChatActionOutcome(
            messageKey: '${_replyPrefix}actionTaskInactive',
            taskId: taskId.isEmpty ? null : taskId,
          );
        }
        final resolved = kind == 'confirm_task'
            ? await tasks.updateTaskState(task.id, TaskState.completed, resultSummary: task.title)
            : await tasks.updateTaskState(task.id, TaskState.cancelled);
        await messages.postTaskNotification(resolved);
        return ChatActionOutcome(
          messageKey: kind == 'confirm_task'
              ? '${_replyPrefix}actionTaskConfirmed'
              : '${_replyPrefix}actionTaskCancelled',
          taskId: task.id,
        );
      }
      default:
        return const ChatActionOutcome(messageKey: '${_replyPrefix}actionNavigated');
    }
  }
}

/// Extract the contact name from a send-message utterance — the Dart port of
/// the TS `extractContactName`.
String? extractContactName(String text) {
  final patterns = [
    RegExp(r'(?:给|替|帮[一-龥]{0,2}?)([一-龥a-zA-Z0-9]{2,8})(?:发|送|说|留言|发消息)'),
    RegExp(r'联系(?:一下)?([一-龥a-zA-Z0-9]{2,8})'),
    RegExp(r'找([一-龥a-zA-Z0-9]{2,8})(?:发消息|说|留言)'),
  ];
  for (final pattern in patterns) {
    final match = pattern.firstMatch(text);
    final name = match?.group(1);
    if (name != null && name.isNotEmpty) {
      return name;
    }
  }
  return null;
}

/// Extract the draft body after 告诉他/跟他说/说/内容是 — the Dart port of
/// the TS `extractDraftMessage`.
String? extractDraftMessage(String text) {
  final match = RegExp(r'(?:告诉(?:他|她|它)|跟(?:他|她)说|说|内容是)[：:]?\s*(.+)$').firstMatch(text.trim());
  final draft = match?.group(1);
  if (draft != null && draft.trim().isNotEmpty) {
    return draft.trim();
  }
  return null;
}
