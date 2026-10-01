import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import { Avatar, ListRow, ScreenState, SectionHeader } from '@sdkwork/whatseek-h5-commons';
import type { Contact, ContactKind } from '@sdkwork/whatseek-h5-core';

import { useContactsData } from '../hooks/useContactsData.js';

const SEGMENTS: readonly { kind: ContactKind | 'all'; labelKey: string }[] = [
  { kind: 'all', labelKey: 'whatseek.contacts.segment.all' },
  { kind: 'person', labelKey: 'whatseek.contacts.segment.person' },
  { kind: 'group', labelKey: 'whatseek.contacts.segment.group' },
  { kind: 'org', labelKey: 'whatseek.contacts.segment.org' },
  { kind: 'agent', labelKey: 'whatseek.contacts.segment.agent' },
  { kind: 'assistant', labelKey: 'whatseek.contacts.segment.assistant' },
];

/** 通讯录 tab root (PRD §26): unified people/groups/orgs/agents directory. */
export function ContactsHomeScreen() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { segment, setSegment, query, setQuery, snapshot } = useContactsData();

  return (
    <div className="pb-6">
      <header className="px-4 pt-4">
        <h1 className="text-lg font-semibold text-primary">{t('whatseek.contacts.home.title')}</h1>
      </header>

      <div className="px-4 pt-3">
        <input
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
          }}
          placeholder={t('whatseek.contacts.home.searchPlaceholder')}
          aria-label={t('whatseek.contacts.home.searchPlaceholder')}
          className="w-full rounded-full border border-border-default bg-panel px-4 py-2 text-sm text-primary outline-none placeholder:text-muted focus:border-brand"
        />
      </div>

      <div className="flex gap-1.5 overflow-x-auto px-4 pt-3 text-xs">
        {SEGMENTS.map((entry) => (
          <button
            key={entry.kind}
            type="button"
            onClick={() => {
              setSegment(entry.kind);
            }}
            aria-pressed={segment === entry.kind}
            className={`shrink-0 rounded-full px-3 py-1.5 font-medium transition-colors ${
              segment === entry.kind ? 'bg-brand text-white' : 'border border-border-subtle bg-panel text-secondary'
            }`}
          >
            {t(entry.labelKey)}
          </button>
        ))}
      </div>

      <ScreenState
        state={snapshot.state === 'ready' ? 'success' : snapshot.state}
        onRetry={snapshot.state === 'error' ? snapshot.retry : undefined}
      >
        {snapshot.state === 'ready' ? (
          snapshot.data.length === 0 ? (
            <ScreenState state="empty" titleKey="whatseek.contacts.home.emptyTitle" />
          ) : (
            <>
              <SectionHeader title={t('whatseek.contacts.home.listTitle', { count: snapshot.data.length })} />
              <div className="mx-4 overflow-hidden rounded-2xl border border-border-subtle bg-panel">
                {snapshot.data.map((contact: Contact) => (
                  <div key={contact.id} className="border-b border-border-subtle last:border-b-0">
                    <ListRow
                      leading={<Avatar glyph={contact.avatar} />}
                      title={contact.name}
                      description={contact.bio}
                      trailing={<span className="text-xs text-muted">›</span>}
                      onClick={() => {
                        navigate(`/contacts/${contact.id}`);
                      }}
                    />
                  </div>
                ))}
              </div>
            </>
          )
        ) : null}
      </ScreenState>
    </div>
  );
}
