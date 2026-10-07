/// IM-backed `MessagesClient` over the sdkwork-im composed Dart SDK
/// (`im_sdk_composed`; `/chat` family — APP_SDK_INTEGRATION_SPEC.md §3:
/// Flutter packages consume generated Dart/Flutter SDK clients only).
///
/// The composed SDK client is constructed exactly once at the app bootstrap
/// (`lib/bootstrap/sdk_clients.dart`, APP_SDK_INTEGRATION_SPEC.md §1) and
/// injected here through the narrow `ImMessagesGateway` slice. This adapter
/// only maps IM contracts onto the whatseek port; it never builds transports,
/// tokens, or HTTP on its own.
///
/// Wire notes: int64 values (`messageSeq`, `lastMessageSeq`) stay decimal
/// strings per API_SPEC §13.6. The generated Dart responses carry the raw
/// `{ code, data, traceId }` envelope with a dynamic `data`, so the list
/// payload is unwrapped here (`data.items`). The driver is pull-based for
/// this milestone — the realtime conversation-changed stream lands with the
/// Phase-2 IAM session coordinator, mirroring the TS `MessagesPortEvents`.
library;

import 'package:im_sdk_composed/im_sdk_composed.dart';
import 'package:sdkwork_whatseek_flutter_mobile_core/sdkwork_whatseek_flutter_mobile_core.dart';

/// Narrow slice of the generated `ChatApi` this adapter consumes.
abstract class ImMessagesGateway {
  Future<InboxListResponse?> inboxList([int? pageSize, String? cursor, String? conversationType, String? q]);
  Future<ConversationMessageListResponse?> conversationsMessagesList(
    String conversationId, [
    String? cursor,
    int? pageSize,
  ]);
  Future<ConversationsMessagesCreateResponse201?> conversationsMessagesCreate(
    String conversationId,
    PostMessageRequest body,
  );
  Future<ConversationsReadCursorUpdateResponse?> conversationsReadCursorUpdate(
    String conversationId,
    UpdateReadCursorRequest body,
  );
  Future<ConversationsPreferencesUpdateResponse?> conversationsPreferencesUpdate(
    String conversationId,
    UpdateConversationPreferencesRequest body,
  );
  Future<ConversationsCreateResponse201?> conversationsCreate(CreateConversationRequest body);
  Future<ConversationsDirectChatsBindingsCreateResponse201?> conversationsDirectChatsBindingsCreate(
      BindDirectChatRequest body,
  );
  Future<ConversationsSystemChannelsCreateResponse201?> conversationsSystemChannelsCreate(
    CreateSystemChannelRequest body,
  );
  Future<ConversationsSystemChannelPublishResponse?> conversationsSystemChannelPublish(
    String conversationId,
    PostMessageRequest body,
  );
}

/// Gateway over the composed client's generated chat API (bootstrap-injected).
class ImChatApiGateway implements ImMessagesGateway {
  const ImChatApiGateway(this._chat);

  final ChatApi _chat;

  @override
  Future<InboxListResponse?> inboxList([int? pageSize, String? cursor, String? conversationType, String? q]) =>
      _chat.inboxList(pageSize, cursor, conversationType, q);

  @override
  Future<ConversationMessageListResponse?> conversationsMessagesList(
    String conversationId, [
    String? cursor,
    int? pageSize,
  ]) =>
      _chat.conversationsMessagesList(conversationId, cursor, pageSize);

  @override
  Future<ConversationsMessagesCreateResponse201?> conversationsMessagesCreate(
    String conversationId,
    PostMessageRequest body,
  ) =>
      _chat.conversationsMessagesCreate(conversationId, body);

  @override
  Future<ConversationsReadCursorUpdateResponse?> conversationsReadCursorUpdate(
    String conversationId,
    UpdateReadCursorRequest body,
  ) =>
      _chat.conversationsReadCursorUpdate(conversationId, body);

  @override
  Future<ConversationsPreferencesUpdateResponse?> conversationsPreferencesUpdate(
    String conversationId,
    UpdateConversationPreferencesRequest body,
  ) =>
      _chat.conversationsPreferencesUpdate(conversationId, body);

  @override
  Future<ConversationsCreateResponse201?> conversationsCreate(CreateConversationRequest body) =>
      _chat.conversationsCreate(body);

  @override
  Future<ConversationsDirectChatsBindingsCreateResponse201?> conversationsDirectChatsBindingsCreate(
    BindDirectChatRequest body,
  ) =>
      _chat.conversationsDirectChatsBindingsCreate(body);

  @override
  Future<ConversationsSystemChannelsCreateResponse201?> conversationsSystemChannelsCreate(
    CreateSystemChannelRequest body,
  ) =>
      _chat.conversationsSystemChannelsCreate(body);

  @override
  Future<ConversationsSystemChannelPublishResponse?> conversationsSystemChannelPublish(
    String conversationId,
    PostMessageRequest body,
  ) =>
      _chat.conversationsSystemChannelPublish(conversationId, body);
}

class ImMessagesClientOptions {
  const ImMessagesClientOptions({
    required this.gateway,
    required this.currentUserId,
    this.now,
  });

  /// Injected composed IM chat slice (constructed at app bootstrap).
  final ImMessagesGateway gateway;

  /// Current session principal id — self-message detection + IM actor identity.
  final String Function() currentUserId;

  final DateTime Function()? now;
}

ConversationKind _mapConversationKind(String imType) {
  if (imType == 'direct') {
    return ConversationKind.direct;
  }
  if (imType == 'group') {
    return ConversationKind.group;
  }
  return ConversationKind.system;
}

List<Map<String, dynamic>> _listItems(Object? data) {
  if (data is List) {
    return data.whereType<Map<String, dynamic>>().toList();
  }
  if (data is Map<String, dynamic>) {
    final items = data['items'];
    if (items is List) {
      return items.whereType<Map<String, dynamic>>().toList();
    }
  }
  return const [];
}

String? _stringOrNull(Object? value) => value?.toString();

String _newClientMsgId(DateTime now) =>
    'whatseek-${now.millisecondsSinceEpoch.toRadixString(36)}-${now.microsecondsSinceEpoch.toRadixString(36)}';

/// IM-backed messages port. Mirrors the mock client's semantics; throws the
/// generated SDK's `SdkError` on transport/API failures (rendered as the
/// screens' error state).
class ImMessagesClient implements MessagesClient {
  ImMessagesClient({required ImMessagesClientOptions options}) : _options = options;

  final ImMessagesClientOptions _options;

  List<ConversationInboxEntry> _inbox = const [];
  final Set<String> _taskChannelIds = <String>{};

  ImMessagesGateway get _gateway => _options.gateway;
  String get _selfId => _options.currentUserId();
  DateTime get _now => _options.now?.call() ?? DateTime.now();

  Future<List<ConversationInboxEntry>> _refreshInbox() async {
    final response = await _gateway.inboxList();
    _inbox = _listItems(response?.data).map(ConversationInboxEntry.fromJson).toList();
    return _inbox;
  }

  Future<ConversationInboxEntry?> _inboxEntry(String conversationId) async {
    for (final entry in _inbox) {
      if (entry.conversationId == conversationId) {
        return entry;
      }
    }
    final entries = await _refreshInbox();
    for (final entry in entries) {
      if (entry.conversationId == conversationId) {
        return entry;
      }
    }
    return null;
  }

  Conversation _mapConversation(ConversationInboxEntry entry) => Conversation(
        id: entry.conversationId,
        kind: _mapConversationKind(entry.conversationType),
        // Direct conversations have no conversation-level display name; fall
        // back to the peer principal id so the row never renders a misleading
        // default title (peer profile names arrive via the contacts port).
        title: entry.displayName ?? entry.peer?.displayName ?? entry.peer?.principalId,
        unread: entry.unreadCount,
        updatedAt: DateTime.tryParse(entry.lastActivityAt),
        lastMessagePreview: entry.lastSummary,
      );

  ChatMessage _mapMessage(ConversationMessageEntry entry) => ChatMessage(
        id: entry.messageId,
        conversationId: entry.conversationId,
        senderId: entry.sender.id == _selfId ? 'me' : entry.sender.id,
        senderName: entry.sender.displayName ?? entry.sender.id,
        content: entry.body.text ?? entry.body.summary ?? entry.summary ?? '',
        sentAt: DateTime.tryParse(entry.occurredAt) ?? _now,
      );

  @override
  Future<List<Conversation>> listConversations() async {
    final entries = await _refreshInbox();
    return entries.map(_mapConversation).toList();
  }

  @override
  Future<List<ChatMessage>> listMessages(String conversationId) async {
    final response = await _gateway.conversationsMessagesList(conversationId);
    return _listItems(response?.data).map(ConversationMessageEntry.fromJson).map(_mapMessage).toList();
  }

  @override
  Future<ChatMessage> sendMessage(String conversationId, String content) async {
    final now = _now;
    final result = await _gateway.conversationsMessagesCreate(
      conversationId,
      PostMessageRequest(text: content, clientMsgId: _newClientMsgId(now)),
    );
    final data = result?.data;
    final messageId = data is Map<String, dynamic> ? _stringOrNull(data['messageId']) : null;
    return ChatMessage(
      id: messageId ?? 'm-${now.millisecondsSinceEpoch.toRadixString(36)}',
      conversationId: conversationId,
      senderId: 'me',
      senderName: 'me',
      content: content,
      sentAt: now,
    );
  }

  @override
  Future<void> markRead(String conversationId) async {
    final entry = await _inboxEntry(conversationId);
    final readSeq = entry?.lastMessageSeq ?? '0';
    // messageSeq is an int64 decimal string (API_SPEC §13.6); the read cursor
    // accepts the same shape.
    if (!RegExp(r'^\d+$').hasMatch(readSeq)) {
      throw RangeError('Conversation read sequence must be a non-negative decimal integer string.');
    }
    await _gateway.conversationsReadCursorUpdate(conversationId, UpdateReadCursorRequest(readSeq: readSeq));
    await _gateway.conversationsPreferencesUpdate(
      conversationId,
      UpdateConversationPreferencesRequest(isMarkedUnread: false),
    );
  }

  @override
  Future<Conversation> openDirectConversation(String contactId) async {
    // Direct chats bind by actor pair: the gateway derives the idempotent
    // pair conversation and enrolls both members (the app API rejects
    // `memberUserIds` outside group conversations).
    final me = _selfId;
    final result = await _gateway.conversationsDirectChatsBindingsCreate(
      BindDirectChatRequest(
        leftActorId: me,
        leftActorKind: 'user',
        rightActorId: contactId,
        rightActorKind: 'user',
      ),
    );
    final data = result?.data;
    final conversationId =
        data is Map<String, dynamic> ? _stringOrNull(data['conversationId']) : null;
    await _refreshInbox();
    return Conversation(
      id: conversationId ?? 'conv-$contactId',
      kind: ConversationKind.direct,
      unread: 0,
      updatedAt: _now,
    );
  }

  @override
  Future<void> postTaskNotification(WhatseekTask task) async {
    // WhatSeek task notices ride a per-task IM system channel; the
    // client-supplied conversationId keeps channel creation idempotent.
    final conversationId = 'whatseek-task-${task.id}';
    if (!_taskChannelIds.contains(conversationId)) {
      await _gateway.conversationsSystemChannelsCreate(
        CreateSystemChannelRequest(conversationId: conversationId, subscriberId: _selfId),
      );
      _taskChannelIds.add(conversationId);
    }
    await _gateway.conversationsSystemChannelPublish(
      conversationId,
      PostMessageRequest(text: task.resultSummary ?? task.title, clientMsgId: _newClientMsgId(_now)),
    );
  }

  @override
  Future<int> unreadTotal() async {
    final entries = await _refreshInbox();
    return entries.fold<int>(0, (total, entry) => total + entry.unreadCount);
  }
}
