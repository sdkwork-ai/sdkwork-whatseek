import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { Star } from 'lucide-react';

import { Avatar, Card, ScreenState } from '@sdkwork/whatseek-h5-commons';
import { getWhatseekClient } from '@sdkwork/whatseek-h5-core';
import { useState } from 'react';

import { useAsyncData } from '../hooks/useAppsData.js';

/** App detail (PRD §16): metadata, permissions, price, AI capability, actions. */
export function AppDetailScreen() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { appId = '' } = useParams();
  const apps = getWhatseekClient('apps');
  const [favorite, setFavorite] = useState<boolean | null>(null);

  const detail = useAsyncData(() => apps.getApp(appId), [apps, appId]);

  if (detail.state === 'loading') {
    return <ScreenState state="loading" />;
  }
  if (detail.state === 'error') {
    return <ScreenState state="error" onRetry={detail.retry} />;
  }
  const app = detail.data;
  if (app === null) {
    return <ScreenState state="empty" titleKey="whatseek.apps.detail.notFound" />;
  }

  const isFavorite = favorite ?? false;

  return (
    <div className="pb-28">
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
        <h1 className="text-base font-semibold text-primary">{app.name}</h1>
      </header>

      <div className="flex items-start gap-3 px-4 pt-4">
        <Avatar glyph={app.icon} size="lg" />
        <div className="min-w-0 flex-1">
          <p className="text-base font-semibold text-primary">{app.name}</p>
          <p className="mt-0.5 text-xs text-muted">{app.developer}</p>
          <p className="mt-1 flex items-center gap-2 text-xs text-secondary">
            <span className="flex items-center gap-0.5 text-warning">
              <Star aria-hidden="true" className="h-3 w-3 fill-current" />
              {app.rating.toFixed(1)}
            </span>
            <span>·</span>
            <span>{t('whatseek.apps.tile.users', { users: app.usersLabel })}</span>
            <span>·</span>
            <span>{app.updatedAt}</span>
          </p>
        </div>
      </div>

      <Card className="mt-4 p-4">
        <p className="text-sm leading-relaxed text-secondary">{app.summary}</p>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {app.aiCapability ? (
            <span className="rounded-full bg-brand-soft px-2 py-0.5 text-[0.625rem] text-brand">
              {t('whatseek.apps.detail.aiCapability')}
            </span>
          ) : null}
          <span className="rounded-full border border-border-subtle px-2 py-0.5 text-[0.625rem] text-muted">
            {app.kind}
          </span>
          {app.tags.map((tag) => (
            <span key={tag} className="rounded-full border border-border-subtle px-2 py-0.5 text-[0.625rem] text-muted">
              {tag}
            </span>
          ))}
        </div>
      </Card>

      <Card className="mt-3 p-4">
        <h2 className="text-sm font-semibold text-primary">{t('whatseek.apps.detail.priceTitle')}</h2>
        <p className="mt-1 text-sm text-secondary">{app.priceLabel}</p>
        <h2 className="mt-3 text-sm font-semibold text-primary">{t('whatseek.apps.detail.permissionsTitle')}</h2>
        {app.permissions.length > 0 ? (
          <ul className="mt-1 list-inside list-disc text-sm text-secondary">
            {app.permissions.map((permission) => (
              <li key={permission}>{permission}</li>
            ))}
          </ul>
        ) : (
          <p className="mt-1 text-sm text-muted">{t('whatseek.apps.detail.noPermissions')}</p>
        )}
      </Card>

      <div className="fixed inset-x-0 bottom-16 mx-auto flex w-full max-w-[42rem] gap-2 border-t border-border-subtle bg-panel px-4 py-3">
        <button
          type="button"
          onClick={() => {
            void apps.toggleFavorite(app.id).then((next) => {
              setFavorite(next);
            });
          }}
          aria-pressed={isFavorite}
          className="rounded-full border border-border-default px-4 py-2.5 text-sm text-secondary hover:bg-panel-muted"
        >
          {isFavorite ? t('whatseek.apps.detail.favorited') : t('whatseek.apps.detail.favorite')}
        </button>
        <button
          type="button"
          onClick={() => {
            navigate(`/apps/create?basedOn=${encodeURIComponent(app.id)}`);
          }}
          className="rounded-full border border-border-default px-4 py-2.5 text-sm text-secondary hover:bg-panel-muted"
        >
          {t('whatseek.apps.detail.createFrom')}
        </button>
        <button
          type="button"
          onClick={() => {
            navigate(`/apps/runner/${app.id}`);
          }}
          className="flex-1 rounded-full bg-brand px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-hover"
        >
          {t('whatseek.apps.detail.use')}
        </button>
      </div>
    </div>
  );
}
