import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';

import { Avatar, Card, ListRow, ScreenState } from '@sdkwork/whatseek-pc-commons';
import { getWhatseekClient } from '@sdkwork/whatseek-pc-core';

import { useAsyncData } from '../hooks/useAppsData.js';

/**
 * Collection detail (appstore route `app.store.collection.detail`): the
 * editorial collection header plus its curated app list.
 */
export function AppCollectionScreen() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { collectionId = '' } = useParams();
  const apps = getWhatseekClient('apps');

  const collection = useAsyncData(() => apps.getCollection(collectionId), [apps, collectionId]);
  const collectionApps = useAsyncData(() => apps.listCollectionApps(collectionId), [apps, collectionId]);

  const chrome = (title: string, content: React.ReactNode) => (
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
        <h1 className="text-base font-semibold text-primary">{title}</h1>
      </header>
      {content}
    </div>
  );

  if (collection.state === 'loading' || collectionApps.state === 'loading') {
    return chrome(t('whatseek.apps.collection.title'), <ScreenState state="loading" />);
  }
  if (collection.state === 'error' || collectionApps.state === 'error') {
    return chrome(
      t('whatseek.apps.collection.title'),
      <ScreenState
        state="error"
        onRetry={() => {
          if (collection.state === 'error') collection.retry();
          if (collectionApps.state === 'error') collectionApps.retry();
        }}
      />,
    );
  }
  if (collection.data === null) {
    return chrome(t('whatseek.apps.collection.title'), <ScreenState state="empty" titleKey="whatseek.apps.collection.notFound" />);
  }

  return chrome(
    collection.data.title,
    <>
      <div className="px-4 pt-4">
        <h2 className="text-base font-semibold text-primary">{collection.data.title}</h2>
        <p className="mt-1 text-xs text-secondary">{collection.data.description}</p>
      </div>

      {collectionApps.state === 'ready' ? (
        <Card className="mt-4">
          {collectionApps.data.map((app) => (
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
      ) : null}
    </>,
  );
}
