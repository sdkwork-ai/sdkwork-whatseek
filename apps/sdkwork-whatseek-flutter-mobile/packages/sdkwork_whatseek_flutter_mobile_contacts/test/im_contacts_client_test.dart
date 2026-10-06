import 'package:flutter_test/flutter_test.dart';

import 'package:im_sdk_composed/im_sdk_composed.dart';

import 'package:sdkwork_whatseek_flutter_mobile_contacts/src/im_contacts_client.dart';
import 'package:sdkwork_whatseek_flutter_mobile_core/sdkwork_whatseek_flutter_mobile_core.dart';

class _FakeGateway implements ImContactsGateway {
  _FakeGateway(this._views);

  final List<Map<String, dynamic>> _views;
  int listCalls = 0;

  @override
  Future<SocialContactsListResponse?> contactsList([int? pageSize, String? cursor]) async {
    listCalls += 1;
    return SocialContactsListResponse.fromJson(<String, dynamic>{
      'code': 0,
      'traceId': 't-1',
      'data': <String, dynamic>{'items': _views},
    });
  }
}

Map<String, dynamic> _contactView(Map<String, dynamic> overrides) => <String, dynamic>{
      'tenantId': 't1',
      'ownerUserId': 'me',
      'targetUserId': 'zhangsan',
      'displayName': '张三',
      'contactType': 'friend',
      'relationshipState': 'friends',
      'friendshipId': 'f-1',
      'establishedAt': '2026-09-01T08:00:00Z',
      'lastInteractionAt': '2026-10-03T08:00:00Z',
      'isStarred': false,
      'isBlocked': false,
      'updatedAt': '2026-10-03T08:00:00Z',
      ...overrides,
    };

void main() {
  test('maps_contact_views_onto_the_whatseek_contact_shape', () async {
    final client = ImContactsClient(
      options: ImContactsClientOptions(
        gateway: _FakeGateway([
          _contactView(const <String, dynamic>{}),
          _contactView(const <String, dynamic>{'targetUserId': 'lisi', 'displayName': null, 'remark': '供应商对接'}),
        ]),
      ),
    );

    final contacts = await client.listContacts();
    expect(contacts, hasLength(2));
    expect(contacts[0].id, 'zhangsan');
    expect(contacts[0].name, '张三');
    expect(contacts[0].kind, ContactKind.person);
    expect(contacts[0].bio, '');
    expect(contacts[0].tags, isEmpty);
    // Display name falls back to the user id; remark maps to bio; tags stay
    // empty (IM contact tags are a separate owned tag system).
    expect(contacts[1].id, 'lisi');
    expect(contacts[1].name, 'lisi');
    expect(contacts[1].bio, '供应商对接');
  });

  test('derives_a_deterministic_avatar_glyph_from_the_contact_id', () async {
    final gateway = _FakeGateway([
      _contactView(const <String, dynamic>{}),
      _contactView(const <String, dynamic>{'targetUserId': 'lisi', 'displayName': '李四'}),
    ]);
    final client = ImContactsClient(
      options: ImContactsClientOptions(gateway: gateway),
    );

    final contacts = await client.listContacts();
    final again = await client.listContacts();
    expect(contacts[0].avatar, again[0].avatar);
    expect(contacts[1].avatar, again[1].avatar);
    expect(contacts[0].avatar, isNot(contains('\n')));
    expect(gateway.listCalls, 2);
  });

  test('filters_the_address_book_client_side_for_search', () async {
    final client = ImContactsClient(
      options: ImContactsClientOptions(
        gateway: _FakeGateway([
          _contactView(const <String, dynamic>{}),
          _contactView(const <String, dynamic>{'targetUserId': 'lisi', 'displayName': '李四', 'remark': '上海供应商'}),
          _contactView(const <String, dynamic>{'targetUserId': 'wangwu', 'displayName': '王五'}),
        ]),
      ),
    );

    expect((await client.searchContacts('')).length, 3);
    expect((await client.searchContacts('张')).map((c) => c.id), ['zhangsan']);
    expect((await client.searchContacts('供应商')).map((c) => c.id), ['lisi']);
    expect(await client.searchContacts('不存在'), isEmpty);
  });

  test('resolves_contacts_from_the_address_book_and_returns_null_otherwise', () async {
    final client = ImContactsClient(
      options: ImContactsClientOptions(
        gateway: _FakeGateway([_contactView(const <String, dynamic>{})]),
      ),
    );

    expect((await client.getContact('zhangsan'))?.name, '张三');
    expect(await client.getContact('stranger'), isNull);
  });
}
