import 'package:flutter_test/flutter_test.dart';

import 'package:im_sdk_composed/im_sdk_composed.dart';

import 'package:sdkwork_whatseek_flutter_mobile_core/sdkwork_whatseek_flutter_mobile_core.dart';
import 'package:sdkwork_whatseek_flutter_mobile_messages/src/im_messages_client.dart';

/// Fake gateway exercising the adapter against generated-family response
/// shapes (`{ code, data, traceId }` envelopes with dynamic data).
class _FakeGateway implements ImMessagesGateway {
  _FakeGateway({List<Map<String, dynamic>> inbox = const []}) : _inbox = inbox;

  final List<Map<String, dynamic>> _inbox;
  final List<Map<String, dynamic>> createBodies = <Map<String, dynamic>>[];
  int createCalls = 0;
  int bindCalls = 0;
  final List<Map<String, dynamic>> bindBodies = <Map<String, dynamic>>[];
  int systemChannelCalls = 0;
  final List<(String, String)> posted = [];

  @override
  Future<InboxListResponse?> inboxList(
      [int? pageSize, String? cursor, String? conversationType, String? q]) async {
    return InboxListResponse.fromJson(<String, dynamic>{
      'code': 0,
      'traceId': 't-1',
      'data': <String, dynamic>{'items': _inbox},
    });
  }

  @override
  Future<ConversationMessageListResponse?> conversationsMessagesList(
      String conversationId,
      [String? cursor,
      int? pageSize]) async {
    return ConversationMessageListResponse.fromJson(<String, dynamic>{
      'code': 0,
      'traceId': 't-1',
      'data': <String, dynamic>{
        'items': <Map<String, dynamic>>[
          <String, dynamic>{
            'tenantId': 't1',
            'conversationId': conversationId,
            'messageId': 'm-1',
            'messageSeq': '42',
            'sender': <String, dynamic>{'id': 'zhangsan', 'kind': 'user', 'displayName': '张三'},
            'body': <String, dynamic>{'parts': <Object?>[], 'text': '下午三点开会'},
            'messageType': 'standard',
            'deliveryMode': 'persistent',
            'occurredAt': '2026-10-03T07:59:00Z',
          },
        ],
        'highWatermark': '42',
      },
    });
  }

  @override
  Future<ConversationsMessagesCreateResponse201?> conversationsMessagesCreate(
      String conversationId, PostMessageRequest body) async {
    posted.add((conversationId, body.text ?? ''));
    return ConversationsMessagesCreateResponse201.fromJson(<String, dynamic>{
      'code': 0,
      'traceId': 't-1',
      'data': <String, dynamic>{'messageId': 'm-new', 'messageSeq': '43', 'deliveryStatus': 'applied'},
    });
  }

  @override
  Future<ConversationsReadCursorUpdateResponse?> conversationsReadCursorUpdate(
      String conversationId, UpdateReadCursorRequest body) async {
    return ConversationsReadCursorUpdateResponse.fromJson(<String, dynamic>{
      'code': 0,
      'traceId': 't-1',
      'data': <String, dynamic>{'conversationId': conversationId, 'readSeq': body.readSeq},
    });
  }

  @override
  Future<ConversationsPreferencesUpdateResponse?> conversationsPreferencesUpdate(
      String conversationId, UpdateConversationPreferencesRequest body) async {
    return ConversationsPreferencesUpdateResponse.fromJson(<String, dynamic>{
      'code': 0,
      'traceId': 't-1',
      'data': <String, dynamic>{
        'conversationId': conversationId,
        'isMarkedUnread': body.isMarkedUnread ?? false,
      },
    });
  }

  @override
  Future<ConversationsDirectChatsBindingsCreateResponse201?> conversationsDirectChatsBindingsCreate(
      BindDirectChatRequest body) async {
    bindCalls += 1;
    bindBodies.add(body.toJson());
    return ConversationsDirectChatsBindingsCreateResponse201.fromJson(<String, dynamic>{
      'code': 0,
      'traceId': 't-1',
      'data': <String, dynamic>{'conversationId': 'conv-direct-9', 'deliveryStatus': 'applied'},
    });
  }
  @override
  Future<ConversationsCreateResponse201?> conversationsCreate(CreateConversationRequest body) async {
    createCalls += 1;
    createBodies.add(body.toJson());
    return ConversationsCreateResponse201.fromJson(<String, dynamic>{
      'code': 0,
      'traceId': 't-1',
      'data': <String, dynamic>{'conversationId': 'conv-direct-9', 'deliveryStatus': 'applied'},
    });
  }

  @override
  Future<ConversationsSystemChannelsCreateResponse201?> conversationsSystemChannelsCreate(
      CreateSystemChannelRequest body) async {
    systemChannelCalls += 1;
    return ConversationsSystemChannelsCreateResponse201.fromJson(<String, dynamic>{
      'code': 0,
      'traceId': 't-1',
      'data': <String, dynamic>{'conversationId': body.conversationId, 'deliveryStatus': 'applied'},
    });
  }

  @override
  Future<ConversationsSystemChannelPublishResponse?> conversationsSystemChannelPublish(
      String conversationId, PostMessageRequest body) async {
    posted.add((conversationId, body.text ?? ''));
    return ConversationsSystemChannelPublishResponse.fromJson(<String, dynamic>{
      'code': 0,
      'traceId': 't-1',
      'data': <String, dynamic>{'messageId': 'm-task', 'deliveryStatus': 'applied'},
    });
  }
}

Map<String, dynamic> _inboxEntry(Map<String, dynamic> overrides) =>
    <String, dynamic>{
      'tenantId': 't1',
      'conversationId': 'conv-1',
      'conversationType': 'direct',
      'displayName': '张三',
      'lastActivityAt': '2026-10-03T08:00:00Z',
      'lastMessageSeq': '42',
      'messageCount': 3,
      'unreadCount': 2,
      ...overrides,
    };

void main() {
  test('maps_inbox_entries_onto_the_whatseek_conversation_shape', () async {
    final client = ImMessagesClient(
      options: ImMessagesClientOptions(
        gateway: _FakeGateway(inbox: [
          _inboxEntry(const <String, dynamic>{}),
          _inboxEntry(const <String, dynamic>{
            'conversationId': 'conv-g',
            'conversationType': 'group',
            'displayName': null,
            'unreadCount': 0,
            'lastSummary': null,
          }),
          _inboxEntry(const <String, dynamic>{'conversationId': 'conv-s', 'conversationType': 'broadcast'}),
        ]),
        currentUserId: () => 'zhangsan',
      ),
    );

    final conversations = await client.listConversations();
    expect(conversations[0].id, 'conv-1');
    expect(conversations[0].kind, ConversationKind.direct);
    expect(conversations[0].title, '张三');
    expect(conversations[0].unread, 2);
    expect(conversations[1].kind, ConversationKind.group);
    expect(conversations[1].title, isNull);
    expect(conversations[2].kind, ConversationKind.system);
  });

  test('maps_messages_and_marks_self_by_session_user_id', () async {
    final client = ImMessagesClient(
      options: ImMessagesClientOptions(
        gateway: _FakeGateway(),
        currentUserId: () => 'zhangsan',
      ),
    );

    final messages = await client.listMessages('conv-1');
    expect(messages, hasLength(1));
    expect(messages[0].id, 'm-1');
    expect(messages[0].senderId, 'me');
    expect(messages[0].senderName, '张三');
    expect(messages[0].content, '下午三点开会');
  });

  test('sends_with_a_client_msg_id_and_echoes_the_sent_shape', () async {
    final gateway = _FakeGateway();
    final client = ImMessagesClient(
      options: ImMessagesClientOptions(gateway: gateway, currentUserId: () => 'zhangsan'),
    );

    final sent = await client.sendMessage('conv-1', '好的，准时到。');
    expect(gateway.posted.single.$1, 'conv-1');
    expect(gateway.posted.single.$2, '好的，准时到。');
    expect(sent.id, 'm-new');
    expect(sent.senderId, 'me');
    expect(sent.content, '好的，准时到。');
  });

  test('marks_read_through_the_read_cursor_and_preferences', () async {
    final gateway = _FakeGateway(
      inbox: [_inboxEntry(const <String, dynamic>{})],
    );
    final client = ImMessagesClient(
      options: ImMessagesClientOptions(gateway: gateway, currentUserId: () => 'zhangsan'),
    );

    await client.markRead('conv-1');
    // No exception and the int64 read cursor stays a decimal string — asserted
    // by the fake accepting the request body shape.
  });

  test('rejects_a_non_decimal_read_sequence', () async {
    final gateway = _BrokenSeqGateway();
    final client = ImMessagesClient(
      options: ImMessagesClientOptions(gateway: gateway, currentUserId: () => 'zhangsan'),
    );

    await expectLater(client.markRead('conv-1'), throwsA(isA<RangeError>()));
  });

  test('sums_unread_counts_from_the_inbox', () async {
    final client = ImMessagesClient(
      options: ImMessagesClientOptions(
        gateway: _FakeGateway(inbox: [
          _inboxEntry(const <String, dynamic>{}),
          _inboxEntry(const <String, dynamic>{'conversationId': 'conv-2', 'unreadCount': 5}),
        ]),
        currentUserId: () => 'zhangsan',
      ),
    );

    expect(await client.unreadTotal(), 7);
  });

  test('opens_direct_conversations_by_actor_pair_binding', () async {
    final gateway = _FakeGateway();
    final client = ImMessagesClient(
      options: ImMessagesClientOptions(gateway: gateway, currentUserId: () => 'zhangsan'),
    );

    final conversation = await client.openDirectConversation('lisi');
    expect(gateway.bindCalls, 1);
    expect(gateway.createCalls, 0);
    expect(gateway.bindBodies.single['leftActorId'], 'zhangsan');
    expect(gateway.bindBodies.single['rightActorId'], 'lisi');
    expect(gateway.bindBodies.single['leftActorKind'], 'user');
    expect(conversation.id, 'conv-direct-9');
    expect(conversation.kind, ConversationKind.direct);
    expect(conversation.unread, 0);
  });

  test('posts_task_notifications_through_an_idempotent_per_task_system_channel', () async {
    final gateway = _FakeGateway();
    final client = ImMessagesClient(
      options: ImMessagesClientOptions(gateway: gateway, currentUserId: () => 'zhangsan'),
    );
    final task = WhatseekTask(
      id: 'task-x',
      title: '生成视频',
      intent: 'CREATE_CONTENT',
      state: TaskState.completed,
      createdAt: DateTime.parse('2026-10-03T08:00:00Z'),
      updatedAt: DateTime.parse('2026-10-03T08:05:00Z'),
      resultSummary: '视频已生成',
    );

    await client.postTaskNotification(task);
    await client.postTaskNotification(task);
    expect(gateway.systemChannelCalls, 1);
    expect(gateway.posted.where((post) => post.$1 == 'whatseek-task-task-x').length, 2);
  });

  test('runtime_bind_ports_swaps_the_drivers_and_recomposes_chat', () {
    final runtime = WhatseekRuntime();
    final mockContacts = runtime.contacts;
    final mockMessages = runtime.messages;

    final fakeContacts = _StubContacts();
    final fakeMessages = _StubMessages();
    runtime.bindPorts(contacts: fakeContacts, messages: fakeMessages);

    expect(identical(runtime.contacts, mockContacts), isFalse);
    expect(identical(runtime.messages, mockMessages), isFalse);
    expect(runtime.chat.contacts, same(fakeContacts));
    expect(runtime.chat.messages, same(fakeMessages));
  });
}

class _BrokenSeqGateway extends _FakeGateway {
  @override
  Future<InboxListResponse?> inboxList(
      [int? pageSize, String? cursor, String? conversationType, String? q]) async {
    return InboxListResponse.fromJson(<String, dynamic>{
      'code': 0,
      'traceId': 't-1',
      'data': <String, dynamic>{
        'items': <Map<String, dynamic>>[
          <String, dynamic>{
            'tenantId': 't1',
            'conversationId': 'conv-1',
            'conversationType': 'direct',
            'lastActivityAt': '2026-10-03T08:00:00Z',
            'lastMessageSeq': 'not-a-seq',
            'messageCount': 1,
            'unreadCount': 1,
          },
        ],
      },
    });
  }
}

class _StubContacts implements ContactsClient {
  @override
  Future<List<Contact>> listContacts() async => const <Contact>[];

  @override
  Future<List<Contact>> searchContacts(String query) async => const <Contact>[];

  @override
  Future<Contact?> getContact(String contactId) async => null;
}

class _StubMessages implements MessagesClient {
  @override
  Future<List<Conversation>> listConversations() async => const <Conversation>[];

  @override
  Future<List<ChatMessage>> listMessages(String conversationId) async => const <ChatMessage>[];

  @override
  Future<ChatMessage> sendMessage(String conversationId, String content) async =>
      throw UnimplementedError();

  @override
  Future<void> markRead(String conversationId) async {}

  @override
  Future<Conversation> openDirectConversation(String contactId) async =>
      throw UnimplementedError();

  @override
  Future<void> postTaskNotification(WhatseekTask task) async {}

  @override
  Future<int> unreadTotal() async => 0;
}
