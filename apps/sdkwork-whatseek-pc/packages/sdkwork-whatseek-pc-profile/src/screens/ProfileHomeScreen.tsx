import { useEffect, useState } from 'react';

import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import { Avatar, Card, ListRow, ScreenState } from '@sdkwork/whatseek-pc-commons';
import { getWhatseekClient, useSessionStore } from '@sdkwork/whatseek-pc-core';

import { useSettingsStore } from '../state/settingsStore.js';

/**
 * 我的 tab root (PRD §35/§36): personal digital asset center — user card,
 * asset summary, 我的应用 / 收藏 entries, settings entry.
 */
export function ProfileHomeScreen() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const user = useSessionStore((state) => state.user);
  const signIn = useSessionStore((state) => state.signIn);
  const signOut = useSessionStore((state) => state.signOut);
  const colorMode = useSettingsStore((state) => state.colorMode);
  const [assets, setAssets] = useState<{ apps: number; agents: number; contacts: number; conversations: number } | null>(null);

  useEffect(() => {
    let cancelled = false;
    void Promise.all([
      getWhatseekClient('apps').listMyApps(),
      getWhatseekClient('contacts').listContacts(),
      getWhatseekClient('messages').listConversations(),
    ])
      .then(([myApps, contacts, conversations]) => {
        if (!cancelled) {
          const agents = contacts.filter((contact) => contact.kind === 'agent' || contact.kind === 'assistant').length;
          setAssets({ apps: myApps.length, agents, contacts: contacts.length, conversations: conversations.length });
        }
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, []);

  if (user === null) {
    return <ScreenState state="empty" titleKey="whatseek.profile.home.signedOut" />;
  }

  return (
    <div className="pb-6">
      <header className="px-4 pt-4">
        <h1 className="text-lg font-semibold text-primary">{t('whatseek.profile.home.title')}</h1>
      </header>

      <div className="mt-2 flex w-full items-center gap-3 border-y border-border-subtle bg-panel p-4">
        <Avatar glyph={user.avatar} size="lg" />
        <div className="min-w-0 flex-1">
          <p className="truncate text-base font-semibold text-primary">
            {user.isVisitor ? t('whatseek.profile.home.visitor') : user.name}
          </p>
          <p className="mt-0.5 text-xs text-muted">
            {user.isVisitor ? t('whatseek.profile.home.visitorHint') : t('whatseek.profile.home.signedIn')}
          </p>
        </div>
        {user.isVisitor ? (
          <button
            type="button"
            onClick={() => {
              signIn('问寻用户');
            }}
            className="shrink-0 rounded-full bg-brand px-4 py-2 text-xs font-semibold text-white"
          >
            {t('whatseek.profile.home.signIn')}
          </button>
        ) : (
          <button
            type="button"
            onClick={() => {
              signOut();
            }}
            className="shrink-0 rounded-full border border-border-default px-4 py-2 text-xs text-secondary"
          >
            {t('whatseek.profile.home.signOut')}
          </button>
        )}
      </div>

      <Card className="mt-2">
        <div className="grid grid-cols-4 divide-x divide-border-subtle">
          {(
            [
              { key: 'chats', value: assets?.conversations, path: '/messages' },
              { key: 'apps', value: assets?.apps, path: '/apps/my' },
              { key: 'agents', value: assets?.agents, path: '/contacts' },
              { key: 'contacts', value: assets?.contacts, path: '/contacts' },
            ] as const
          ).map((asset) => (
            <button
              key={asset.key}
              type="button"
              onClick={() => {
                navigate(asset.path);
              }}
              className="flex flex-col items-center gap-0.5 py-4"
            >
              <span className="text-lg font-semibold text-primary">{asset.value ?? '–'}</span>
              <span className="text-[0.625rem] text-muted">{t(`whatseek.profile.home.asset.${asset.key}`)}</span>
            </button>
          ))}
        </div>
      </Card>

      <Card className="mt-2">
        <ListRow
          leading={<span aria-hidden="true" className="text-xl">🧩</span>}
          title={t('whatseek.profile.home.myApps')}
          description={t('whatseek.profile.home.myAppsHint')}
          trailing={<span aria-hidden="true" className="text-muted">›</span>}
          onClick={() => {
            navigate('/apps/my');
          }}
        />
        <ListRow
          leading={<span aria-hidden="true" className="text-xl">⭐</span>}
          title={t('whatseek.profile.home.favorites')}
          trailing={<span aria-hidden="true" className="text-muted">›</span>}
          onClick={() => {
            navigate('/apps/my?tab=favorites');
          }}
        />
        <ListRow
          leading={<span aria-hidden="true" className="text-xl">{colorMode === 'dark' ? '🌙' : '☀️'}</span>}
          title={t('whatseek.profile.home.settings')}
          trailing={<span aria-hidden="true" className="text-muted">›</span>}
          onClick={() => {
            navigate('/settings');
          }}
        />
      </Card>

      <p className="mt-6 px-4 text-center text-[0.625rem] text-muted">
        {t('whatseek.profile.home.brand')} · WhatSeek 问寻 v0.1.0
      </p>
    </div>
  );
}
