import { useState } from 'react';

import { useTranslation } from 'react-i18next';
import { useNavigate, useSearchParams } from 'react-router-dom';

import { Avatar, Card, ListRow, ScreenState } from '@sdkwork/whatseek-h5-commons';
import { SdkworkMobileNavBar } from '@sdkwork/shell-mobile-react/navbar';
import { getWhatseekClient } from '@sdkwork/whatseek-h5-core';

import { useAsyncData } from '../hooks/useAppsData.js';

/** Search results for keyword and natural-language queries (PRD §32/§33). */
export function AppSearchScreen() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get('q') ?? '';
  const [draft, setDraft] = useState(query);
  const apps = getWhatseekClient('apps');

  const results = useAsyncData(
    () => (query.trim().length === 0 ? Promise.resolve([]) : apps.searchApps(query)),
    [apps, query],
  );

  return (
    <div className="pb-6">
      <SdkworkMobileNavBar
        backLabel={t('whatseek.commons.action.back')}
        title={t('whatseek.apps.search.title')}
        onBack={() => {
          navigate(-1);
        }}
      />
      <div className="px-4 pt-3">
        <form
          className="flex items-center gap-2 rounded-full border border-border-default bg-panel px-3 py-1.5"
          onSubmit={(event) => {
            event.preventDefault();
            setSearchParams(draft.trim().length > 0 ? { q: draft.trim() } : {});
          }}
        >
          <span aria-hidden="true">🔍</span>
          <input
            value={draft}
            onChange={(event) => {
              setDraft(event.target.value);
            }}
            placeholder={t('whatseek.apps.home.searchPlaceholder')}
            aria-label={t('whatseek.apps.search.inputLabel')}
            className="w-full bg-transparent text-sm text-primary outline-none placeholder:text-muted"
          />
        </form>
      </div>

      <ScreenState
        state={results.state === 'loading' ? 'loading' : results.state === 'error' ? 'error' : results.data.length === 0 ? 'empty' : 'success'}
        titleKey={results.state === 'ready' && results.data.length === 0 ? 'whatseek.apps.search.emptyTitle' : undefined}
        descriptionKey={
          results.state === 'ready' && results.data.length === 0 ? 'whatseek.apps.search.emptyDescription' : undefined
        }
        onRetry={results.state === 'error' ? results.retry : undefined}
      >
        {results.state === 'ready' ? (
          <>
            <p className="px-4 pt-3 text-xs text-muted">
              {t('whatseek.apps.search.resultCount', { count: results.data.length })}
            </p>
            <Card className="mt-2">
              {results.data.map(({ app, reason }) => (
                <ListRow
                  key={app.id}
                  leading={<Avatar glyph={app.icon} />}
                  title={app.name}
                  description={
                    <>
                      <span className="block truncate">{app.summary}</span>
                      {/* REQ-0002 row coverage: category · rating · users · price · AI. */}
                      <span className="mt-0.5 block truncate text-[0.6875rem] text-muted">
                        {app.category} · ⭐ {app.rating.toFixed(1)} · {app.usersLabel} · {app.priceLabel}
                        {app.aiCapability ? ` · ${t('whatseek.apps.search.aiCapability')}` : ''}
                      </span>
                    </>
                  }
                  trailing={
                    <span className="shrink-0 rounded-full bg-brand-soft px-2 py-0.5 text-[0.625rem] text-brand">
                      {t('whatseek.apps.search.matchedOn', { keyword: reason })}
                    </span>
                  }
                  onClick={() => {
                    navigate(`/apps/detail/${app.id}`);
                  }}
                />
              ))}
            </Card>
            <p className="px-4 pt-4 text-center text-xs text-muted">
              {t('whatseek.apps.search.createFallback')}{' '}
              <button
                type="button"
                className="font-medium text-brand underline-offset-2 hover:underline"
                onClick={() => {
                  navigate(`/apps/create?q=${encodeURIComponent(query)}`);
                }}
              >
                {t('whatseek.apps.search.createFallbackAction')}
              </button>
            </p>
          </>
        ) : null}
      </ScreenState>
    </div>
  );
}
