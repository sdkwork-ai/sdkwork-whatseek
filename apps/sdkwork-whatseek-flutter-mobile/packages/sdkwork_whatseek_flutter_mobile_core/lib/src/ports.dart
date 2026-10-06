/// Service port contracts for the WhatSeek Flutter surface — the Dart mirror
/// of the shared TS `ContactsPort`/`MessagesPort`
/// (`@sdkwork/whatseek-service-core`; the TS shapes are asserted by the
/// alignment tests). The Phase-1 mock clients implement these interfaces, and
/// the sdkwork-im adapters (in the messages/contacts capability packages) bind
/// the generated Dart IM SDK (`im_sdk_composed`) behind the same contracts, so
/// screens and the chat capability never see which driver is mounted.
library;

import 'models.dart';

/// Address book port (TS mirror: `ContactsPort`).
abstract class ContactsClient {
  Future<List<Contact>> listContacts();
  Future<List<Contact>> searchContacts(String query);
  Future<Contact?> getContact(String contactId);
}

/// Conversation inbox port (TS mirror: `MessagesPort`, pull surface). The
/// realtime conversation-changed stream rides the Phase-2 IAM session
/// coordinator, mirroring the TS `MessagesPortEvents` surface.
abstract class MessagesClient {
  Future<List<Conversation>> listConversations();
  Future<List<ChatMessage>> listMessages(String conversationId);
  Future<ChatMessage> sendMessage(String conversationId, String content);
  Future<void> markRead(String conversationId);
  Future<Conversation> openDirectConversation(String contactId);
  Future<void> postTaskNotification(WhatseekTask task);
  Future<int> unreadTotal();
}
