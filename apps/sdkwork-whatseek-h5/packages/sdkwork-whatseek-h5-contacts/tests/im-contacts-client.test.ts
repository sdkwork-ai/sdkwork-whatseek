import { describe, expect, it, vi } from 'vitest';

import type { ContactView } from '@sdkwork/im-sdk';

import { createImContactsClient } from '../src/services/imContactsClient.js';
import type { ImContactsGateway } from '../src/services/imContactsClient.js';

function contactView(overrides: Partial<ContactView> = {}): ContactView {
  return {
    tenantId: 't1',
    ownerUserId: 'me',
    targetUserId: 'zhangsan',
    displayName: '张三',
    contactType: 'friend',
    relationshipState: 'friends',
    friendshipId: 'f-1',
    establishedAt: '2026-09-01T08:00:00Z',
    lastInteractionAt: '2026-10-03T08:00:00Z',
    isStarred: false,
    isBlocked: false,
    updatedAt: '2026-10-03T08:00:00Z',
    ...overrides,
  };
}

function createGateway(views: readonly ContactView[]): ImContactsGateway & { listCalls(): number } {
  let listCalls = 0;
  return {
    contacts: {
      list: vi.fn(async () => ({
        items: [...views],
        pageInfo: { mode: 'cursor' as const, hasMore: false },
      })),
    },
    listCalls: () => listCalls,
  };
}

describe('im contacts client (sdkwork-im adapter)', () => {
  it('maps_contact_views_onto_the_whatseek_contact_shape', async () => {
    const gateway = createGateway([
      contactView(),
      contactView({
        targetUserId: 'lisi',
        displayName: null,
        remark: '供应商对接',
      }),
    ]);
    const client = createImContactsClient({ gateway });

    const contacts = await client.listContacts();
    expect(contacts).toEqual([
      { id: 'zhangsan', name: '张三', kind: 'person', bio: '', tags: [], avatar: expect.any(String) },
      { id: 'lisi', name: 'lisi', kind: 'person', bio: '供应商对接', tags: [], avatar: expect.any(String) },
    ]);
    // Display name falls back to the user id; remark maps to bio; tags stay
    // empty (IM contact tags are a separate owned tag system).
  });

  it('derives_a_deterministic_avatar_glyph_from_the_contact_id', async () => {
    const gateway = createGateway([contactView(), contactView({ targetUserId: 'lisi', displayName: '李四' })]);
    const client = createImContactsClient({ gateway });

    const contacts = await client.listContacts();
    expect(contacts).toHaveLength(2);
    const first = contacts[0]!;
    const second = contacts[1]!;
    expect(first.avatar).toMatch(/^\p{Extended_Pictographic}$/u);
    expect(second.avatar).toMatch(/^\p{Extended_Pictographic}$/u);

    const again = createImContactsClient({ gateway: createGateway([contactView(), contactView({ targetUserId: 'lisi', displayName: '李四' })]) });
    const againContacts = await again.listContacts();
    expect(againContacts).toHaveLength(2);
    expect(againContacts[0]!.avatar).toBe(first.avatar);
    expect(againContacts[1]!.avatar).toBe(second.avatar);
  });

  it('filters_the_address_book_client_side_for_search', async () => {
    const gateway = createGateway([
      contactView(),
      contactView({ targetUserId: 'lisi', displayName: '李四', remark: '上海供应商' }),
      contactView({ targetUserId: 'wangwu', displayName: '王五', remark: '' }),
    ]);
    const client = createImContactsClient({ gateway });

    expect((await client.searchContacts('')).length).toBe(3);
    expect((await client.searchContacts('张')).map((contact) => contact.id)).toEqual(['zhangsan']);
    expect((await client.searchContacts('供应商')).map((contact) => contact.id)).toEqual(['lisi']);
    expect(await client.searchContacts('不存在')).toEqual([]);
  });

  it('resolves_contacts_from_the_address_book_and_returns_null_otherwise', async () => {
    const gateway = createGateway([contactView()]);
    const client = createImContactsClient({ gateway });

    expect((await client.getContact('zhangsan'))?.name).toBe('张三');
    expect(await client.getContact('stranger')).toBeNull();
  });
});
