import { useEffect, useState } from 'react';

import { useTranslation } from 'react-i18next';
import { useNavigate, useSearchParams } from 'react-router-dom';

import { Avatar, Card, ListRow, ScreenState } from '@sdkwork/whatseek-pc-commons';
import { getWhatseekClient } from '@sdkwork/whatseek-pc-core';

import { useAsyncData } from '../hooks/useAppsData.js';

/** Search results for keyword and natural-language queries (PRD §32/§33). */
export function AppSearchScreen() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get('q') ?? '';
  const [draft, setDraft] = useState(query);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const apps = getWhatseekClient('apps');

  const results = useAsyncData(
    () => (query.trim().length === 0 ? Promise.resolve([]) : apps.searchApps(query)),
    [apps, query],
  );

  // Search history feeds the empty-query state (recorded on submit;
  // the clear button wipes it server-side or locally per driver and bumps
  // the version to refetch).
  const [historyVersion, setHistoryVersion] = useState(0);
  const history = useAsyncData(
    () => (query.trim().length > 0 ? Promise.resolve([]) : apps.listSearchHistory()),
    [apps, query, historyVersion],
  );

  // Trending terms feed the empty-query state; hidden when the store driver
  // has no server-side source (empty list) — mirroring the sdkwork-appstore
  // reference search page.
  const trending = useAsyncData(
    () => (query.trim().length > 0 ? Promise.resolve([]) : apps.listTrendingSearches()),
    [apps, query],
  );

  // Debounced server suggestions for the typed prefix (≥2 chars).
  useEffect(() => {
    const trimmed = draft.trim();
    if (trimmed.length < 2) {
      setSuggestions([]);
      return undefined;
    }
    let cancelled = false;
    const timer = setTimeout(() => {
      apps
        .listSearchSuggestions(trimmed)
        .then((terms) => {
          if (!cancelled) {
            setSuggestions(terms);
          }
        })
        .catch(() => {
          if (!cancelled) {
            setSuggestions([]);
          }
        });
    }, 250);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [apps, draft]);

  return (
    <div className="pb-6">
      <header className="flex items-center gap-2 px-4 pt-4">
        <button
          type="button"
          aria-label={t('whatseek.commons.action.back')}
          onClick={() => {
            navigate(-1);
          }}
          className="text-xl text-secondary"
        >
          ‹
        </button>
        <form
          className="flex flex-1 items-center gap-2 rounded-full border border-border-default bg-panel px-3 py-1.5"
          onSubmit={(event) => {
            event.preventDefault();
            const submitted = draft.trim();
            if (submitted.length > 0) {
              void apps.recordSearchHistory(submitted).catch(() => undefined);
            }
            setSearchParams(submitted.length > 0 ? { q: submitted } : {});
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
      </header>

      {suggestions.length > 0 && draft.trim() !== query.trim() ? (
        <div className="px-4 pt-2">
          <Card>
            {suggestions.map((term) => (
              <button
                key={term}
                type="button"
                onClick={() => {
                  setDraft(term);
                  setSearchParams({ q: term });
                }}
                className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-secondary hover:bg-panel-muted"
              >
                <span aria-hidden="true">🔍</span>
                <span className="truncate">{term}</span>
              </button>
            ))}
          </Card>
        </div>
      ) : null}

      {query.trim().length === 0 && history.state === 'ready' && history.data.length > 0 ? (
        <div className="px-4 pt-3">
          <p className="text-xs font-semibold text-secondary">
            {t('whatseek.apps.search.history')}
            <button
              type="button"
              className="ml-2 text-muted underline-offset-2 hover:underline"
              onClick={() => {
                void apps
                .clearSearchHistory()
                .catch(() => undefined)
                .then(() => {
                  setHistoryVersion((version) => version + 1);
                });
              }}
            >
              {t('whatseek.apps.search.historyClear')}
            </button>
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            {history.data.map((term) => (
              <button
                key={term}
                type="button"
                onClick={() => {
                  setDraft(term);
                  setSearchParams({ q: term });
                }}
                className="rounded-full border border-border-subtle bg-panel px-3 py-1.5 text-xs text-secondary hover:bg-panel-muted"
              >
                {term}
              </button>
            ))}
          </div>
        </div>
      ) : null}

      {query.trim().length === 0 && trending.state === 'ready' && trending.data.length > 0 ? (
        <div className="px-4 pt-3">
          <p className="text-xs font-semibold text-secondary">{t('whatseek.apps.search.trending')}</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {trending.data.map((term) => (
              <button
                key={term}
                type="button"
                onClick={() => {
                  setDraft(term);
                  setSearchParams({ q: term });
                }}
                className="rounded-full border border-border-subtle bg-panel px-3 py-1.5 text-xs text-secondary hover:bg-panel-muted"
              >
                {term}
              </button>
            ))}
          </div>
        </div>
      ) : null}

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
                      <span className="mt-0.5 block truncate text-xs text-muted">
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
