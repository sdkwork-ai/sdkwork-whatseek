import { useState } from 'react';

import { useTranslation } from 'react-i18next';
import { useNavigate, useSearchParams } from 'react-router-dom';

import { Avatar, Card, ListRow, ScreenState } from '@sdkwork/whatseek-h5-commons';
import { getWhatseekClient } from '@sdkwork/whatseek-h5-core';
import type { CreatedApp } from '@sdkwork/whatseek-h5-core';

import { useAsyncData } from '../hooks/useAppsData.js';

type MyAppsTab = 'created' | 'favorites';

/**
 * 我的应用 (PRD §21): user-created apps (lifecycle badge, open / delete /
 * share) clearly separated from favorited third-party apps.
 */
export function MyAppsScreen() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = searchParams.get('tab') === 'favorites' ? 'favorites' : 'created';
  const [tab, setTab] = useState<MyAppsTab>(initialTab);
  const [shareCopied, setShareCopied] = useState(false);
  // PRD §21 AI 修改: continue-modifying a created app from 我的应用
  // (the mock bumps the patch version; app-api carries it end-to-end).
  const [modifyTarget, setModifyTarget] = useState<CreatedApp | null>(null);
  const [modifyInstruction, setModifyInstruction] = useState('');
  const [reloadToken, setReloadToken] = useState(0);
  const apps = getWhatseekClient('apps');

  const created = useAsyncData(() => apps.listMyApps(), [apps, reloadToken]);
  const favorites = useAsyncData(() => apps.listFavorites(), [apps, reloadToken]);
  const reloadCreated = (): void => {
    setReloadToken((token) => token + 1);
  };

  const switchTab = (next: MyAppsTab) => {
    setTab(next);
    setSearchParams(next === 'favorites' ? { tab: 'favorites' } : {});
  };

  const modifyApp = (app: CreatedApp) => {
    const instruction = modifyInstruction.trim();
    if (instruction.length === 0) {
      return;
    }
    void apps
      .modifyApp(app.id, instruction)
      .then(() => {
        setModifyTarget(null);
        setModifyInstruction('');
        reloadCreated();
      })
      .catch(() => undefined);
  };

  const shareApp = (app: CreatedApp) => {
    const shareText = `${app.name} · WhatSeek`;
    void navigator.clipboard
      ?.writeText(shareText)
      .then(() => {
        setShareCopied(true);
        globalThis.setTimeout(() => {
          setShareCopied(false);
        }, 1500);
      })
      .catch(() => {
        setShareCopied(false);
      });
  };

  const emptyState =
    tab === 'created' ? (
      <ScreenState
        state="empty"
        titleKey="whatseek.apps.my.emptyCreatedTitle"
        descriptionKey="whatseek.apps.my.emptyCreatedDescription"
      />
    ) : (
      <ScreenState state="empty" titleKey="whatseek.apps.my.emptyFavoritesTitle" />
    );

  return (
    <div className="pb-6">
      <header className="px-4 pt-4">
        <h1 className="text-lg font-semibold text-primary">{t('whatseek.apps.my.title')}</h1>
      </header>

      <div className="flex gap-2 px-4 pt-3" role="tablist" aria-label={t('whatseek.apps.my.title')}>
        {(['created', 'favorites'] as const).map((entry) => (
          <button
            key={entry}
            type="button"
            role="tab"
            aria-selected={tab === entry}
            onClick={() => {
              switchTab(entry);
            }}
            className={`flex-1 rounded-full px-3 py-2 text-xs font-medium transition-colors ${
              tab === entry ? 'bg-brand text-white' : 'border border-border-subtle bg-panel text-secondary'
            }`}
          >
            {t(entry === 'created' ? 'whatseek.apps.my.createdTab' : 'whatseek.apps.my.favoritesTab')}
          </button>
        ))}
      </div>

      {tab === 'created' ? (
        created.state === 'loading' ? (
          <ScreenState state="loading" />
        ) : created.state === 'error' ? (
          <ScreenState state="error" onRetry={created.retry} />
        ) : created.data.length === 0 ? (
          <>
            {emptyState}
            <div className="px-4">
              <button
                type="button"
                onClick={() => {
                  navigate('/apps/create');
                }}
                className="w-full rounded-full bg-brand py-2.5 text-sm font-semibold text-white hover:bg-brand-hover"
              >
                {t('whatseek.apps.my.createFirst')}
              </button>
            </div>
          </>
        ) : (
          <Card className="mt-3">
            {created.data.map((app) => (
              <div key={app.id} className="border-b border-border-subtle last:border-b-0">
                <ListRow
                  leading={<Avatar glyph={app.icon} tone="success" />}
                  title={
                    <span className="flex items-center gap-2">
                      {app.name}
                      <span className="rounded-full bg-brand-soft px-1.5 py-0.5 text-[0.625rem] text-brand">
                        {t(`whatseek.apps.lifecycle.${app.lifecycle}`)}
                      </span>
                    </span>
                  }
                  description={`${t('whatseek.apps.my.moduleCount', { count: app.modules.length })} · v${
                    app.versions[app.versions.length - 1] ?? '0.1.0'
                  }`}
                  onClick={() => {
                    navigate(`/apps/runner/${app.id}`);
                  }}
                  trailing={
                    <span className="flex shrink-0 items-center gap-1">
                      <button
                        type="button"
                        aria-label={t('whatseek.apps.my.share')}
                        onClick={(event) => {
                          event.stopPropagation();
                          shareApp(app);
                        }}
                        className="rounded-full border border-border-subtle px-2 py-1 text-[0.625rem] text-secondary"
                      >
                        {shareCopied ? t('whatseek.apps.my.shared') : t('whatseek.apps.my.share')}
                      </button>
                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation();
                          setModifyTarget(modifyTarget?.id === app.id ? null : app);
                          setModifyInstruction('');
                        }}
                        className="rounded-full border border-border-subtle px-2 py-1 text-[0.625rem] text-secondary"
                      >
                        {t('whatseek.apps.my.modify')}
                      </button>
                      <button
                        type="button"
                        aria-label={t('whatseek.apps.my.delete')}
                        onClick={(event) => {
                          event.stopPropagation();
                          void apps.deleteMyApp(app.id).then(reloadCreated);
                        }}
                        className="rounded-full border border-border-subtle px-2 py-1 text-[0.625rem] text-danger"
                      >
                        {t('whatseek.apps.my.delete')}
                      </button>
                    </span>
                  }
                />
                {modifyTarget?.id === app.id ? (
                  <div className="flex items-center gap-2 border-t border-border-subtle px-4 py-2">
                    <input
                      value={modifyInstruction}
                      onChange={(event) => {
                        setModifyInstruction(event.target.value);
                      }}
                      placeholder={t('whatseek.apps.my.modifyPlaceholder')}
                      aria-label={t('whatseek.apps.my.modifyPlaceholder')}
                      className="min-w-0 flex-1 rounded-full border border-border-default bg-canvas px-3 py-1.5 text-xs text-primary outline-none placeholder:text-muted focus:border-brand"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        modifyApp(app);
                      }}
                      className="shrink-0 rounded-full bg-brand px-3 py-1.5 text-xs font-semibold text-white"
                    >
                      {t('whatseek.apps.my.modifyApply')}
                    </button>
                  </div>
                ) : null}
              </div>
            ))}
          </Card>
        )
      ) : favorites.state === 'loading' ? (
        <ScreenState state="loading" />
      ) : favorites.state === 'error' ? (
        <ScreenState state="error" onRetry={favorites.retry} />
      ) : favorites.data.length === 0 ? (
        emptyState
      ) : (
        <Card className="mt-3">
          {favorites.data.map((app) => (
            <ListRow
              key={app.id}
              leading={<Avatar glyph={app.icon} tone="warning" />}
              title={app.name}
              description={app.summary}
              onClick={() => {
                navigate(`/apps/detail/${app.id}`);
              }}
            />
          ))}
        </Card>
      )}
    </div>
  );
}
