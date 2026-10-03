import { useTranslation } from 'react-i18next';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Sparkles, Star } from 'lucide-react';

import { SdkworkArrowIcon } from '@sdkwork/shell-mobile-react';
import { Avatar, Card, ListRow, ScreenState, SectionHeader, useAsyncData } from '@sdkwork/whatseek-h5-commons';
import { getWhatseekClient } from '@sdkwork/whatseek-h5-core';

import { AppTile } from '../components/AppTile.js';

/**
 * 应用 tab root (PRD §13): search prompt, AI 创建应用 entry, 推荐/热门,
 * categories, 我的应用 / 最近使用 entries.
 */
export function AppsHomeScreen() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const apps = getWhatseekClient('apps');

  const recommended = useAsyncData(() => apps.listRecommended(), [apps]);
  const hot = useAsyncData(() => apps.listHot(), [apps]);
  const recent = useAsyncData(() => apps.listRecent(), [apps]);
  const categories = useAsyncData(() => apps.listCategories(), [apps]);

  const state =
    recommended.state === 'error' || hot.state === 'error' || categories.state === 'error'
      ? ('error' as const)
      : recommended.state === 'loading' || hot.state === 'loading' || categories.state === 'loading'
        ? ('loading' as const)
        : ('success' as const);

  const initialQuery = searchParams.get('q') ?? '';

  return (
    <div className="pb-6">
      <header className="px-4 pt-4 pb-1">
        <h1 className="text-lg font-semibold text-primary">{t('whatseek.apps.home.title')}</h1>
      </header>

      <div className="px-4 pt-2">
        <Link
          to={initialQuery.length > 0 ? `/apps/search?q=${encodeURIComponent(initialQuery)}` : '/apps/search'}
          className="flex items-center gap-2 rounded-full border border-border-default bg-panel px-4 py-2.5 text-sm text-muted"
        >
          <span aria-hidden="true">🔍</span>
          <span className="truncate">{t('whatseek.apps.home.searchPlaceholder')}</span>
        </Link>
      </div>

      <div className="px-4 pt-3">
        <Link
          to="/apps/create"
          className="flex items-center gap-3 rounded-2xl bg-brand-soft px-4 py-3 transition-opacity hover:opacity-90"
        >
          <Sparkles aria-hidden="true" className="h-6 w-6 text-brand" />
          <span className="flex-1">
            <span className="block text-sm font-semibold text-primary">
              {t('whatseek.apps.home.aiCreate.title')}
            </span>
            <span className="block text-xs text-secondary">
              {t('whatseek.apps.home.aiCreate.subtitle')}
            </span>
          </span>
          <SdkworkArrowIcon className="shrink-0 text-muted" direction="right" size="sm" />
        </Link>
      </div>

      <div className="flex gap-2 px-4 pt-3 text-xs">
        <Link
          to="/apps/my"
          className="flex-1 rounded-xl border border-border-subtle bg-panel px-3 py-2 text-center font-medium text-secondary hover:bg-panel-muted"
        >
          {t('whatseek.apps.home.myApps')}
        </Link>
        <Link
          to="/apps/my?tab=favorites"
          className="flex-1 rounded-xl border border-border-subtle bg-panel px-3 py-2 text-center font-medium text-secondary hover:bg-panel-muted"
        >
          {t('whatseek.apps.home.favorites')}
        </Link>
      </div>

      <ScreenState state={state} onRetry={() => undefined}>
        {categories.state === 'ready' ? (
          <div className="flex flex-wrap gap-2 px-4 pt-4">
            {categories.data.map((category) => (
              <Link
                key={category.id}
                to={`/apps/search?q=${encodeURIComponent(t(category.labelKey))}`}
                className="flex items-center gap-1 rounded-full border border-border-subtle bg-panel px-3 py-1.5 text-xs text-secondary hover:bg-panel-muted"
              >
                <span aria-hidden="true">{category.icon}</span>
                {t(category.labelKey)}
              </Link>
            ))}
          </div>
        ) : null}

        {recent.state === 'ready' && recent.data.length > 0 ? (
          <>
            <SectionHeader title={t('whatseek.apps.home.recent')} />
            <div className="flex gap-3 overflow-x-auto px-4 pb-1">
              {recent.data.map((app) => (
                <AppTile key={app.id} app={app} compact />
              ))}
            </div>
          </>
        ) : null}

        {recommended.state === 'ready' ? (
          <>
            <SectionHeader
              title={t('whatseek.apps.home.recommended')}
              action={
                <Star aria-hidden="true" className="h-4 w-4 text-warning" />
              }
            />
            <Card>
              {recommended.data.map((app) => (
                <ListRow
                  key={app.id}
                  leading={<Avatar glyph={app.icon} />}
                  title={app.name}
                  description={app.summary}
                  trailing={<span className="text-xs text-muted">{app.priceLabel}</span>}
                  onClick={() => {
                    navigate(`/apps/detail/${app.id}`);
                  }}
                />
              ))}
            </Card>
          </>
        ) : null}

        {hot.state === 'ready' ? (
          <>
            <SectionHeader title={t('whatseek.apps.home.hot')} />
            <div className="flex gap-3 overflow-x-auto px-4 pb-2">
              {hot.data.map((app) => (
                <AppTile key={app.id} app={app} />
              ))}
            </div>
          </>
        ) : null}
      </ScreenState>
    </div>
  );
}
