import { useEffect } from 'react';

import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';

import { Avatar, ScreenState } from '@sdkwork/whatseek-h5-commons';
import { SdkworkMobileNavBar } from '@sdkwork/shell-mobile-react/navbar';
import { getWhatseekClient, useSessionStore } from '@sdkwork/whatseek-h5-core';

import { useAsyncData } from '../hooks/useAppsData.js';

/**
 * In-app app runner (PRD 应用调用). Phase 1 renders a mock runtime preview;
 * enterprise apps require a named (non-visitor) session — the genuine
 * permission-denied state.
 */
export function AppRunnerScreen() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { appId = '' } = useParams();
  const apps = getWhatseekClient('apps');
  const user = useSessionStore((state) => state.user);

  const detail = useAsyncData(() => apps.getApp(appId), [apps, appId]);

  useEffect(() => {
    if (detail.state === 'ready' && detail.data !== null) {
      void apps.recordRecent(detail.data.id);
    }
  }, [apps, detail]);

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
  if (app.kind === 'enterprise' && (user === null || user.isVisitor)) {
    return <ScreenState state="permission-denied" />;
  }

  return (
    <div className="flex min-h-full flex-col">
      <SdkworkMobileNavBar
        title={
          <>
            {app.name} · {t('whatseek.apps.runner.running')}
          </>
        }
        onBack={() => {
          navigate(-1);
        }}
        right={<span aria-hidden="true" className="h-2 w-2 animate-pulse rounded-full bg-success" />}
      />

      <div className="flex flex-1 flex-col items-center justify-center gap-4 px-8 py-10 text-center">
        <Avatar glyph={app.icon} size="lg" />
        <p className="text-sm font-medium text-primary">{app.name}</p>
        <p className="max-w-64 text-xs text-muted">{t('whatseek.apps.runner.previewNote')}</p>
        <div className="w-full max-w-72 space-y-2 rounded-2xl border border-border-subtle bg-panel p-4" aria-hidden="true">
          <div className="h-3 w-1/2 rounded bg-panel-muted" />
          <div className="h-3 w-full rounded bg-panel-muted" />
          <div className="h-3 w-3/4 rounded bg-panel-muted" />
          <div className="mt-3 h-8 w-full rounded-xl bg-brand-soft" />
        </div>
      </div>
    </div>
  );
}
