import { useTranslation } from 'react-i18next';
import { Link, useSearchParams } from 'react-router-dom';
import { ChevronRight, Sparkles, Star } from 'lucide-react';

import { ScreenState, SectionHeader, useAsyncData } from '@sdkwork/whatseek-pc-commons';
import { getWhatseekClient } from '@sdkwork/whatseek-pc-core';

import { AppGridCard } from '../components/AppGridCard.js';
import { AppTile } from '../components/AppTile.js';
import { ChartPreviewCard } from '../components/ChartPreviewCard.js';
import { CollectionCard } from '../components/CollectionCard.js';
import { HeroCarousel } from '../components/HeroCarousel.js';
import { StoryCard } from '../components/StoryCard.js';

/**
 * 应用 tab root. WhatSeek entries (search, AI create, 我的应用) on top, then
 * the sdkwork-appstore home feed (PRD §4.2.1 首页编辑流 / §5.1): hero
 * carousel → editorial stories → curated collections → 为你推荐 grid →
 * charts quick view, closing with category chips and 最近使用.
 */
export function AppsHomeScreen() {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const apps = getWhatseekClient('apps');

  const feed = useAsyncData(() => apps.listHomeFeed(), [apps]);
  const recommended = useAsyncData(() => apps.listRecommended(), [apps]);
  const recent = useAsyncData(() => apps.listRecent(), [apps]);
  const categories = useAsyncData(() => apps.listCategories(), [apps]);

  const state =
    feed.state === 'error' || recommended.state === 'error' || recent.state === 'error' || categories.state === 'error'
      ? ('error' as const)
      : feed.state === 'loading' || recommended.state === 'loading' || recent.state === 'loading' || categories.state === 'loading'
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
          <span aria-hidden="true" className="text-muted">›</span>
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

      <ScreenState
        state={state}
        onRetry={() => {
          if (feed.state === 'error') feed.retry();
          if (recommended.state === 'error') recommended.retry();
          if (recent.state === 'error') recent.retry();
          if (categories.state === 'error') categories.retry();
        }}
      >
        {feed.state === 'ready' ? <HeroCarousel slides={feed.data.heroes} /> : null}

        {feed.state === 'ready' && feed.data.stories.length > 0 ? (
          <>
            <SectionHeader title={t('whatseek.apps.home.stories')} />
            <div className="flex gap-3 overflow-x-auto px-4 pb-1">
              {feed.data.stories.map((story) => (
                <StoryCard key={story.id} story={story} />
              ))}
            </div>
          </>
        ) : null}

        {feed.state === 'ready' && feed.data.collections.length > 0 ? (
          <>
            <SectionHeader title={t('whatseek.apps.home.collections')} />
            <div className="flex gap-3 overflow-x-auto px-4 pb-1">
              {feed.data.collections.map((collection) => (
                <CollectionCard key={collection.id} collection={collection} />
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
            <div className="grid grid-cols-2 gap-3 px-4 sm:grid-cols-3 lg:grid-cols-4">
              {recommended.data.map((app) => (
                <AppGridCard key={app.id} app={app} />
              ))}
            </div>
          </>
        ) : null}

        {feed.state === 'ready' && feed.data.charts.length > 0 ? (
          <>
            <SectionHeader
              title={t('whatseek.apps.home.charts')}
              action={
                <Link
                  to="/apps/charts"
                  className="flex items-center gap-0.5 text-xs text-muted hover:text-brand"
                >
                  {t('whatseek.apps.home.chartsMore')}
                  <ChevronRight aria-hidden="true" className="h-3.5 w-3.5" />
                </Link>
              }
            />
            <div className="grid grid-cols-1 gap-3 px-4 md:grid-cols-2 xl:grid-cols-3">
              {feed.data.charts.map((chart) => (
                <ChartPreviewCard key={chart.id} chart={chart} />
              ))}
            </div>
          </>
        ) : null}

        {categories.state === 'ready' ? (
          <>
            <SectionHeader title={t('whatseek.apps.home.categories')} />
            <div className="flex flex-wrap gap-2 px-4">
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
          </>
        ) : null}

        {recent.state === 'ready' && recent.data.length > 0 ? (
          <>
            <SectionHeader title={t('whatseek.apps.home.recent')} />
            <div className="flex gap-3 overflow-x-auto px-4 pb-2">
              {recent.data.map((app) => (
                <AppTile key={app.id} app={app} compact />
              ))}
            </div>
          </>
        ) : null}
      </ScreenState>
    </div>
  );
}
