/**
 * Public export boundary of `@sdkwork/whatseek-mp-contacts` — contacts view
 * models for the native pages.
 */

import type { Contact, ContactsPort } from '@sdkwork/whatseek-service-core';
import { getWhatseekClient } from '@sdkwork/whatseek-service-core';

import enStrings from './i18n/en-US/whatseek/contacts/strings.json';
import zhStrings from './i18n/zh-CN/whatseek/contacts/strings.json';

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

type Locale = 'zh-CN' | 'en-US';

const KIND_LABELS: Record<Locale, Record<string, string>> = {
  'zh-CN': zhStrings.segment,
  'en-US': enStrings.segment,
};

let locale: Locale = 'zh-CN';

/**
 * Switch the contact-kind label locale (wired from `profile.setLocale` in the
 * bootstrap composition root; keys align with the H5/PC
 * `whatseek.contacts.segment.*` fragments).
 */
export function setContactsLocale(next: Locale): void {
  locale = next;
}

export function kindLabel(kind: string): string {
  return KIND_LABELS[locale][kind] ?? kind;
}

export {
  createImContactsClient,
  type ImContactsClientOptions,
  type ImContactsGateway,
} from './services/imContactsClient.js';
