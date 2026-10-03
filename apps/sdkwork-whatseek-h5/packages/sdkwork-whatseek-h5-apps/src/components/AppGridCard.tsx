import { useTranslation } from 'react-i18next';
import { Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import type { WhatseekApp } from '@sdkwork/whatseek-h5-core';

/** Two-column grid card for the 为你推荐 recommendation grid (appstore §5.1). */
export function AppGridCard({ app }: { app: WhatseekApp }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  return (
    <button
      type="button"
      onClick={() => {
        navigate(`/apps/detail/${app.id}`);
      }}
      className="flex flex-col items-start gap-1.5 rounded-2xl border border-border-subtle bg-panel p-3 text-left transition-colors hover:bg-panel-muted"
    >
      <span aria-hidden="true" className="text-2xl">
        {app.icon}
      </span>
      <span className="w-full truncate text-sm font-medium text-primary">{app.name}</span>
      <span className="line-clamp-2 text-xs text-secondary">{app.summary}</span>
      <span className="mt-0.5 flex w-full items-center justify-between text-[0.625rem] text-muted">
        <span className="flex items-center gap-0.5 text-warning">
          <Star aria-hidden="true" className="h-3 w-3 fill-current" />
          {app.rating.toFixed(1)}
        </span>
        <span>{app.priceLabel}</span>
      </span>
      <span className="sr-only">{t('whatseek.apps.tile.users', { users: app.usersLabel })}</span>
    </button>
  );
}
