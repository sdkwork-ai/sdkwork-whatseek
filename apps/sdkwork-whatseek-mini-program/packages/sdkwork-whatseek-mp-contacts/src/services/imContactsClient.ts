/**
 * IM-backed `ContactsPort` over the sdkwork-im composed consumer package
 * `@sdkwork/im-sdk` (`/social/contacts`; APP_SDK_INTEGRATION_SPEC.md §9
 * consumer import naming).
 *
 * The composed SDK client is constructed exactly once at app bootstrap
 * (`src/bootstrap/runtime.ts` composition root, APP_SDK_INTEGRATION_SPEC.md §1) and shared
 * with the messages adapter; this module receives the narrow
 * `ImContactsGateway` slice and only maps IM contact views onto the whatseek
 * `Contact` model. No tokens, transport, or HTTP here.
 *
 * Mapping notes: IM social contacts are persons (`ContactKind` group/org/agent
 * values have no IM source and are never fabricated); the IM `remark` maps to
 * the whatseek `bio`; IM contact tags are an owned tag system keyed by tagId
 * (not per-contact labels), so `tags` stays empty rather than half-mapped; the
 * server contacts list has no search parameter, so `searchContacts` filters
 * the mapped address book client-side — the same semantics as the mock port.
 */

import type { ContactView, ImSdkClient } from '@sdkwork/im-sdk';

import type { Contact, ContactKind, ContactsPort } from '@sdkwork/whatseek-service-core';

/** Narrow slice of the composed `ImSdkClient` social surface this adapter consumes. */
export interface ImContactsGateway {
  contacts: Pick<ImSdkClient['social']['contacts'], 'list'>;
}

export interface ImContactsClientOptions {
  /** Injected composed IM client slice (constructed at app bootstrap). */
  gateway: ImContactsGateway;
}

/** Emoji glyph pool for deterministic avatar derivation from the contact id. */
const AVATAR_GLYPHS: readonly string[] = ['🙂', '😀', '😎', '🤝', '👩‍💼', '👨‍💻', '🧑‍🎨', '🗣️', '🐈', '🌟'];

function avatarGlyph(id: string): string {
  let hash = 0;
  for (let index = 0; index < id.length; index += 1) {
    hash = (hash * 31 + id.charCodeAt(index)) >>> 0;
  }
  return AVATAR_GLYPHS[hash % AVATAR_GLYPHS.length] ?? '🙂';
}

function mapContact(view: ContactView): Contact {
  return {
    id: view.targetUserId,
    name: view.displayName ?? view.targetUserId,
    kind: 'person' satisfies ContactKind,
    bio: view.remark ?? '',
    tags: [],
    avatar: avatarGlyph(view.targetUserId),
  };
}

function matches(contact: Contact, query: string): boolean {
  const lower = query.toLowerCase();
  return (
    contact.name.toLowerCase().includes(lower) ||
    contact.bio.toLowerCase().includes(lower) ||
    contact.tags.some((tag) => tag.toLowerCase().includes(lower))
  );
}

export function createImContactsClient(options: ImContactsClientOptions): ContactsPort {
  const { gateway } = options;

  const listAddressBook = async (): Promise<readonly Contact[]> => {
    const page = await gateway.contacts.list();
    return page.items.map(mapContact);
  };

  return {
    async listContacts(): Promise<Contact[]> {
      return [...(await listAddressBook())];
    },

    async searchContacts(query: string): Promise<Contact[]> {
      const contacts = await listAddressBook();
      const trimmed = query.trim();
      if (trimmed.length === 0) {
        return [...contacts];
      }
      return contacts.filter((contact) => matches(contact, trimmed));
    },

    async getContact(contactId: string): Promise<Contact | null> {
      const contacts = await listAddressBook();
      return contacts.find((contact) => contact.id === contactId) ?? null;
    },
  };
}
