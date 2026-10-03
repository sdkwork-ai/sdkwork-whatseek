import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import { Avatar } from '@sdkwork/whatseek-h5-commons';
import { SdkworkArrowIcon } from '@sdkwork/shell-mobile-react';
import type { AppChartPreview } from '@sdkwork/whatseek-h5-core';

/** Chart quick view (appstore 榜单速览): top entries + entry to the full charts. */
export function ChartPreviewCard({ chart }: { chart: AppChartPreview }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  return (
    <div className="rounded-2xl border border-border-subtle bg-panel p-3">
      <button
        type="button"
        onClick={() => {
          navigate('/apps/charts');
        }}
        className="flex w-full items-center justify-between text-left"
      >
        <span className="text-sm font-semibold text-primary">{t(`whatseek.apps.chart.${chart.id}`)}</span>
        <SdkworkArrowIcon className="text-muted" direction="right" size="sm" />
      </button>
      <ol className="mt-2 space-y-2">
        {chart.apps.map((app, index) => (
          <li key={app.id}>
            <button
              type="button"
              onClick={() => {
                navigate(`/apps/detail/${app.id}`);
              }}
              className="flex w-full items-center gap-2 text-left"
            >
              <span className="w-3 shrink-0 text-center text-xs font-semibold text-muted">{index + 1}</span>
              <Avatar glyph={app.icon} size="sm" />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-xs font-medium text-primary">{app.name}</span>
                <span className="block truncate text-[0.625rem] text-muted">
                  {t('whatseek.apps.tile.users', { users: app.usersLabel })}
                </span>
              </span>
              <span className="shrink-0 text-[0.625rem] text-muted">{app.priceLabel}</span>
            </button>
          </li>
        ))}
      </ol>
    </div>
  );
}
