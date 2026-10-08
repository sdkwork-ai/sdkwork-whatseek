import { useTranslation } from 'react-i18next';
import { SdkworkMobileNavBar } from '@sdkwork/shell-mobile-react/navbar';
import { useNavigate, useParams } from 'react-router-dom';
import { Star } from 'lucide-react';

import { Avatar, Card, ListRow, ScreenState } from '@sdkwork/whatseek-h5-commons';
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

  // Detail-enriched fetch: store drivers hydrate whatsNew/currentVersion/
  // screenshots from the appstore listing detail + media.
  const detail = useAsyncData(() => apps.getAppDetail(appId), [apps, appId]);
  // Similar store listings rail (hidden when the driver returns none).
  const similar = useAsyncData(() => apps.listSimilarApps(appId), [apps, appId]);

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
      <SdkworkMobileNavBar
        title={app.name}
        onBack={() => {
          navigate(-1);
        }}
      />

      <div className="flex items-start gap-3 px-4 pt-4">
        <Avatar glyph={app.icon} size="lg" />
        <div className="min-w-0 flex-1">
          <p className="text-base font-semibold text-primary">{app.name}</p>
          <p className="mt-0.5 text-xs text-muted">
            {app.developer} · {app.category}
          </p>
          <p className="mt-1 flex items-center gap-2 text-xs text-secondary">
            <span className="flex items-center gap-0.5 text-warning">
              <Star aria-hidden="true" className="h-3 w-3 fill-current" />
              {app.rating.toFixed(1)}
            </span>
            <span>·</span>
            <span>{t('whatseek.apps.tile.users', { users: app.usersLabel })}</span>
            <span>·</span>
            <span>{app.updatedAt}</span>
            {app.currentVersion ? (
              <>
                <span>·</span>
                <span>v{app.currentVersion}</span>
              </>
            ) : null}
          </p>
        </div>
      </div>

      <Card className="mt-4 p-4">
        <p className="text-sm leading-relaxed text-secondary">{app.summary}</p>
        {app.whatsNew ? <p className="mt-2 text-xs leading-relaxed text-muted">{app.whatsNew}</p> : null}
        <div className="mt-3 flex flex-wrap gap-1.5">
          {app.aiCapability ? (
            <span className="rounded-full bg-brand-soft px-2 py-0.5 text-[0.625rem] text-brand">
              {t('whatseek.apps.detail.aiCapability')}
            </span>
          ) : null}
          <span className="rounded-full border border-border-subtle px-2 py-0.5 text-[0.625rem] text-muted">
            {t(`whatseek.apps.kind.${app.kind}`)}
          </span>
          {app.tags.map((tag) => (
            <span key={tag} className="rounded-full border border-border-subtle px-2 py-0.5 text-[0.625rem] text-muted">
              {tag}
            </span>
          ))}
        </div>
      </Card>

      <Card className="mt-3 p-4">
        <h2 className="text-sm font-semibold text-primary">{t('whatseek.apps.detail.screenshots')}</h2>
        {/* PRD §16 screenshots: appstore media URLs when the driver hydrates
            them; the placeholder strip remains the mock-driver fallback. */}
        {app.screenshots && app.screenshots.length > 0 ? (
          <div className="mt-2 flex gap-2 overflow-x-auto">
            {app.screenshots.map((url) => (
              <img
                key={url}
                src={url}
                alt=""
                aria-hidden="true"
                className="h-28 w-20 shrink-0 rounded-lg border border-border-subtle object-cover"
              />
            ))}
          </div>
        ) : (
          <div className="mt-2 flex gap-2 overflow-hidden" aria-hidden="true">
            {[0, 1, 2].map((index) => (
              <div
                key={index}
                className="h-28 w-20 shrink-0 rounded-lg border border-border-subtle bg-panel-muted"
              />
            ))}
          </div>
        )}
        <h2 className="mt-3 text-sm font-semibold text-primary">{t('whatseek.apps.detail.priceTitle')}</h2>
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

      {similar.state === 'ready' && similar.data.length > 0 ? (
        <Card className="mt-3 p-4">
          <h2 className="text-sm font-semibold text-primary">{t('whatseek.apps.detail.similar')}</h2>
          <div className="mt-2">
            {similar.data.map((app) => (
              <ListRow
                key={app.id}
                leading={<Avatar glyph={app.icon} />}
                title={app.name}
                description={
                  <span className="block truncate text-xs text-muted">
                    ⭐ {app.rating.toFixed(1)} · {app.priceLabel}
                  </span>
                }
                onClick={() => {
                  navigate(`/apps/detail/${app.id}`);
                }}
              />
            ))}
          </div>
        </Card>
      ) : null}

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
