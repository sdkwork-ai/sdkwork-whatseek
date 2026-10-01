import { useState } from 'react';

import type { AsyncData } from '@sdkwork/whatseek-h5-commons';
import { useAsyncData } from '@sdkwork/whatseek-h5-commons';
import { getWhatseekClient } from '@sdkwork/whatseek-h5-core';
import type { Contact, ContactKind } from '@sdkwork/whatseek-h5-core';

export type ContactSegment = ContactKind | 'all';

/**
 * Contacts directory data: segment + query filtering over ContactsPort with
 * the five-state loading contract.
 */
export function useContactsData(): {
  segment: ContactSegment;
  setSegment: (segment: ContactSegment) => void;
  query: string;
  setQuery: (query: string) => void;
  snapshot: AsyncData<Contact[]>;
} {
  const [segment, setSegment] = useState<ContactSegment>('all');
  const [query, setQuery] = useState('');
  const contacts = getWhatseekClient('contacts');

  const snapshot = useAsyncData(
    () =>
      contacts.searchContacts(query).then((matches) =>
        segment === 'all' ? matches : matches.filter((contact) => contact.kind === segment),
      ),
    [contacts, segment, query],
  );

  return { segment, setSegment, query, setQuery, snapshot };
}
