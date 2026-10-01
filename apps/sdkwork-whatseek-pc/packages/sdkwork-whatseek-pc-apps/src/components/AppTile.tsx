import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import type { WhatseekApp } from '@sdkwork/whatseek-pc-core';

/** Horizontal-scroll tile for 最近使用 / 热门 rails. */
export function AppTile({ app, compact = false }: { app: WhatseekApp; compact?: boolean }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  return (
    <button
      type="button"
      onClick={() => {
        navigate(`/apps/detail/${app.id}`);
      }}
      className={`flex shrink-0 flex-col items-start gap-1 rounded-2xl border border-border-subtle bg-panel p-3 text-left transition-colors hover:bg-panel-muted ${
        compact ? 'w-24' : 'w-28'
      }`}
    >
      <span aria-hidden="true" className="text-2xl">
        {app.icon}
      </span>
      <span className="w-full truncate text-xs font-medium text-primary">{app.name}</span>
      <span className="text-[0.625rem] text-muted">
        {t('whatseek.apps.tile.users', { users: app.usersLabel })} · {app.priceLabel}
      </span>
    </button>
  );
}
