/// IM-backed `ContactsClient` over the sdkwork-im composed Dart SDK
/// (`im_sdk_composed`; `/social/contacts` — APP_SDK_INTEGRATION_SPEC.md §3:
/// Flutter packages consume generated Dart/Flutter SDK clients only).
///
/// The composed SDK client is constructed exactly once at the app bootstrap
/// (`lib/bootstrap/sdk_clients.dart`, APP_SDK_INTEGRATION_SPEC.md §1) and
/// shared with the messages adapter; this module receives the narrow
/// `ImContactsGateway` slice and only maps IM contact views onto the whatseek
/// `Contact` model. No tokens, transport, or HTTP here.
///
/// Mapping notes: IM social contacts are persons (group/org/agent values have
/// no IM source and are never fabricated); the IM `remark` maps to the
/// whatseek `bio`; IM contact tags are an owned tag system keyed by tagId, so
/// `tags` stays empty rather than half-mapped; the server contacts list has no
/// search parameter, so `searchContacts` filters the mapped address book
/// client-side — the same semantics as the mock port.
library;

import 'package:im_sdk_composed/im_sdk_composed.dart';
import 'package:sdkwork_whatseek_flutter_mobile_core/sdkwork_whatseek_flutter_mobile_core.dart';

/// Narrow slice of the generated `SocialApi` this adapter consumes.
abstract class ImContactsGateway {
  Future<SocialContactsListResponse?> contactsList([int? pageSize, String? cursor]);
}

/// Gateway over the composed client's generated social API (bootstrap-injected).
class ImSocialApiGateway implements ImContactsGateway {
  const ImSocialApiGateway(this._social);

  final SocialApi _social;

  @override
  Future<SocialContactsListResponse?> contactsList([int? pageSize, String? cursor]) =>
      _social.contactsList(pageSize, cursor);
}

class ImContactsClientOptions {
  const ImContactsClientOptions({required this.gateway});

  /// Injected composed IM social slice (constructed at app bootstrap).
  final ImContactsGateway gateway;
}

/// Emoji glyph pool for deterministic avatar derivation from the contact id.
const List<String> _kAvatarGlyphs = <String>[
  '🙂', '😀', '😎', '🤝', '👩‍💼', '👨‍💻', '🧑‍🎨', '🗣️', '🐈', '🌟',
];

String _avatarGlyph(String id) {
  var hash = 0;
  for (final code in id.codeUnits) {
    hash = (hash * 31 + code) & 0x7fffffff;
  }
  return _kAvatarGlyphs[hash % _kAvatarGlyphs.length];
}

Contact _mapContact(ContactView view) => Contact(
      id: view.targetUserId,
      name: view.displayName ?? view.targetUserId,
      kind: ContactKind.person,
      bio: view.remark ?? '',
      tags: const <String>[],
      avatar: _avatarGlyph(view.targetUserId),
    );

bool _matches(Contact contact, String query) {
  final lower = query.toLowerCase();
  return contact.name.toLowerCase().contains(lower) ||
      contact.bio.toLowerCase().contains(lower) ||
      contact.tags.any((tag) => tag.toLowerCase().contains(lower));
}

class ImContactsClient implements ContactsClient {
  ImContactsClient({required ImContactsClientOptions options}) : _options = options;

  final ImContactsClientOptions _options;

  Future<List<Contact>> _listAddressBook() async {
    final response = await _options.gateway.contactsList();
    final data = response?.data;
    if (data is! Map<String, dynamic>) {
      return const <Contact>[];
    }
    final items = data['items'];
    if (items is! List) {
      return const <Contact>[];
    }
    return items
        .whereType<Map<String, dynamic>>()
        .map(ContactView.fromJson)
        .map(_mapContact)
        .toList();
  }

  @override
  Future<List<Contact>> listContacts() async => List.unmodifiable(await _listAddressBook());

  @override
  Future<List<Contact>> searchContacts(String query) async {
    final contacts = await _listAddressBook();
    final trimmed = query.trim();
    if (trimmed.isEmpty) {
      return List.unmodifiable(contacts);
    }
    return contacts.where((contact) => _matches(contact, trimmed)).toList();
  }

  @override
  Future<Contact?> getContact(String contactId) async {
    final contacts = await _listAddressBook();
    for (final contact in contacts) {
      if (contact.id == contactId) {
        return contact;
      }
    }
    return null;
  }
}
