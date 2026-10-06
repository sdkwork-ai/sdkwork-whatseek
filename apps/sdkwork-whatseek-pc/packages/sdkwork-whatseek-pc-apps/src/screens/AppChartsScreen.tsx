import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import { Avatar, Card, ListRow, ScreenState } from '@sdkwork/whatseek-pc-commons';
import { getWhatseekClient } from '@sdkwork/whatseek-pc-core';

import { useAsyncData } from '../hooks/useAppsData.js';

/**
 * Full charts screen (appstore route `app.store.charts.index`): 热门 / 免费 /
 * 新品 top-10 lists, mirroring the home 榜单速览 quick view.
 */
export function AppChartsScreen() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const apps = getWhatseekClient('apps');

  const hot = useAsyncData(() => apps.listChart('hot'), [apps]);
  const free = useAsyncData(() => apps.listChart('free'), [apps]);
  const newest = useAsyncData(() => apps.listChart('new'), [apps]);

  const loadables = [hot, free, newest];
  const state =
    loadables.some((entry) => entry.state === 'error')
      ? ('error' as const)
      : loadables.some((entry) => entry.state === 'loading')
        ? ('loading' as const)
        : ('success' as const);

  const retryAll = () => {
    if (hot.state === 'error') hot.retry();
    if (free.state === 'error') free.retry();
    if (newest.state === 'error') newest.retry();
  };

  const charts = [
    { id: 'hot' as const, data: hot },
    { id: 'free' as const, data: free },
    { id: 'new' as const, data: newest },
  ];

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
        <h1 className="text-base font-semibold text-primary">{t('whatseek.apps.charts.title')}</h1>
      </header>

      <ScreenState state={state} onRetry={retryAll}>
        {charts.map(({ id, data }) =>
          data.state === 'ready' ? (
            <section key={id}>
              <h2 className="px-4 pt-5 pb-2 text-sm font-semibold text-primary">
                {t(`whatseek.apps.chart.${id}`)}
              </h2>
              <Card>
                {data.data.map((app, index) => (
                  <ListRow
                    key={app.id}
                    leading={
                      <>
                        <span className="w-4 shrink-0 text-center text-sm font-semibold text-muted">
                          {index + 1}
                        </span>
                        <Avatar glyph={app.icon} size="sm" />
                      </>
                    }
                    title={app.name}
                    description={t('whatseek.apps.tile.users', { users: app.usersLabel })}
                    trailing={<span className="text-xs text-muted">{app.priceLabel}</span>}
                    onClick={() => {
                      navigate(`/apps/detail/${app.id}`);
                    }}
                  />
                ))}
              </Card>
            </section>
          ) : null,
        )}
      </ScreenState>
    </div>
  );
}
