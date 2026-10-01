import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import { Card, ListRow } from '@sdkwork/whatseek-h5-commons';
import { WHATSEEK_LOCALES } from '@sdkwork/whatseek-h5-core';
import type { ColorMode, WhatseekLocale } from '@sdkwork/whatseek-h5-core';

import { useSettingsStore } from '../state/settingsStore.js';

const LOCALE_LABEL_KEYS: Record<WhatseekLocale, string> = {
  'zh-CN': 'whatseek.profile.settings.locale.zhCN',
  'en-US': 'whatseek.profile.settings.locale.enUS',
};

/** Settings: dark mode toggle + language switch (persisted across reloads). */
export function SettingsScreen() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const colorMode = useSettingsStore((state) => state.colorMode);
  const setColorMode = useSettingsStore((state) => state.setColorMode);
  const locale = useSettingsStore((state) => state.locale);
  const setLocale = useSettingsStore((state) => state.setLocale);

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
        <h1 className="text-base font-semibold text-primary">{t('whatseek.profile.settings.title')}</h1>
      </header>

      <Card className="mt-3">
        <div className="border-b border-border-subtle px-4 py-3">
          <p className="text-sm font-medium text-primary">{t('whatseek.profile.settings.darkMode')}</p>
          <p className="mt-0.5 text-xs text-muted">{t('whatseek.profile.settings.darkModeHint')}</p>
          <div className="mt-2 flex gap-2" role="radiogroup" aria-label={t('whatseek.profile.settings.darkMode')}>
            {(['light', 'dark'] as const).map((mode: ColorMode) => (
              <button
                key={mode}
                type="button"
                role="radio"
                aria-checked={colorMode === mode}
                onClick={() => {
                  setColorMode(mode);
                }}
                className={`rounded-full px-4 py-1.5 text-xs font-medium transition-colors ${
                  colorMode === mode ? 'bg-brand text-white' : 'border border-border-subtle bg-canvas text-secondary'
                }`}
              >
                {t(`whatseek.profile.settings.mode.${mode}`)}
              </button>
            ))}
          </div>
        </div>
        <div className="px-4 py-3">
          <p className="text-sm font-medium text-primary">{t('whatseek.profile.settings.language')}</p>
          <div className="mt-2 flex gap-2" role="radiogroup" aria-label={t('whatseek.profile.settings.language')}>
            {WHATSEEK_LOCALES.map((entry: WhatseekLocale) => (
              <button
                key={entry}
                type="button"
                role="radio"
                aria-checked={locale === entry}
                onClick={() => {
                  setLocale(entry);
                }}
                className={`rounded-full px-4 py-1.5 text-xs font-medium transition-colors ${
                  locale === entry ? 'bg-brand text-white' : 'border border-border-subtle bg-canvas text-secondary'
                }`}
              >
                {t(LOCALE_LABEL_KEYS[entry])}
              </button>
            ))}
          </div>
        </div>
      </Card>

      <Card className="mt-3">
        <ListRow
          leading={<span aria-hidden="true" className="text-xl">✨</span>}
          title={t('whatseek.profile.settings.brandTitle')}
          description={t('whatseek.profile.settings.brandMessage')}
        />
      </Card>
    </div>
  );
}
