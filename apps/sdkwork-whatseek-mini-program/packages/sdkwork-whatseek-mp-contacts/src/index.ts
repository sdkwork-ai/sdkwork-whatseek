/**
 * Public export boundary of `@sdkwork/whatseek-mp-contacts` — contacts view
 * models for the native pages.
 */

import type { Contact, ContactsPort } from '@sdkwork/whatseek-service-core';
import { getWhatseekClient } from '@sdkwork/whatseek-service-core';

export type { Contact };

export function contactsPort(): ContactsPort {
  return getWhatseekClient('contacts');
}

export async function listContacts(): Promise<Contact[]> {
  return contactsPort().listContacts();
}

export async function searchContacts(query: string): Promise<Contact[]> {
  return contactsPort().searchContacts(query);
}

export async function getContact(contactId: string): Promise<Contact | null> {
  return contactsPort().getContact(contactId);
}

const KIND_LABELS: Record<string, string> = {
  person: '联系人',
  group: '群组',
  org: '企业与商家',
  agent: 'Agent',
  assistant: 'AI 助手',
};

export function kindLabel(kind: string): string {
  return KIND_LABELS[kind] ?? kind;
}
