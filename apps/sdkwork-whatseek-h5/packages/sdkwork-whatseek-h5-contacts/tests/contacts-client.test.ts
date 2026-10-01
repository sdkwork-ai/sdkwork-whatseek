import { describe, expect, it } from 'vitest';

import { createMockContactsClient } from '../src/services/contactsClient.js';

describe('mock contacts client (PRD §26)', () => {
  const client = createMockContactsClient();

  it('lists_all_seeded_kinds', async () => {
    const contacts = await client.listContacts();
    const kinds = new Set(contacts.map((contact) => contact.kind));
    for (const kind of ['person', 'group', 'org', 'agent', 'assistant']) {
      expect(kinds.has(kind as 'person'), `missing kind ${kind}`).toBe(true);
    }
  });

  it('finds_zhang_san_by_name', async () => {
    const matches = await client.searchContacts('张三');
    expect(matches.some((contact) => contact.id === 'zhangsan')).toBe(true);
  });

  it('finds_suppliers_by_tag', async () => {
    const matches = await client.searchContacts('供应商');
    expect(matches.length).toBeGreaterThanOrEqual(2);
  });

  it('returns_null_for_unknown_ids', async () => {
    expect(await client.getContact('nobody')).toBeNull();
  });
});
