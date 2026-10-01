/**
 * i18n bootstrap (I18N_SPEC.md §6/§7). The app root creates the single i18next
 * instance from merged per-package resources; packages never create their own
 * providers. Locale fragments live at `src/i18n/<locale>/<domain>/<capability>/`
 * inside each package.
 */

import i18next, { type i18n as I18nInstance, type Resource } from 'i18next';
import { initReactI18next } from 'react-i18next';

export const WHATSEEK_LOCALES = ['zh-CN', 'en-US'] as const;
export type WhatseekLocale = (typeof WHATSEEK_LOCALES)[number];
export const DEFAULT_LOCALE: WhatseekLocale = 'zh-CN';

/** Resources namespace: everything lives under the `whatseek` namespace with capability-prefixed keys. */
export type WhatseekNamespaceResources = Record<string, unknown>;
export type WhatseekLocaleResources = Partial<Record<WhatseekLocale, { whatseek: WhatseekNamespaceResources }>>;

export const LOCALE_STORAGE_KEY = 'whatseek.locale';

export function readStoredLocale(): WhatseekLocale {
  try {
    const stored = globalThis.localStorage?.getItem(LOCALE_STORAGE_KEY);
    return stored === 'en-US' ? 'en-US' : 'zh-CN';
  } catch {
    return DEFAULT_LOCALE;
  }
}

export function persistLocale(locale: WhatseekLocale): void {
  try {
    globalThis.localStorage?.setItem(LOCALE_STORAGE_KEY, locale);
  } catch {
    /* storage unavailable */
  }
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function deepMerge(target: Record<string, unknown>, source: Record<string, unknown>): Record<string, unknown> {
  const merged: Record<string, unknown> = { ...target };
  for (const [key, value] of Object.entries(source)) {
    const existing = merged[key];
    merged[key] =
      isPlainObject(existing) && isPlainObject(value) ? deepMerge(existing, value) : value;
  }
  return merged;
}

/** Merge per-package `WhatseekLocaleResources` into one resource bundle. */
export function mergeWhatseekResources(...parts: readonly WhatseekLocaleResources[]): WhatseekLocaleResources {
  const merged: WhatseekLocaleResources = {};
  for (const locale of WHATSEEK_LOCALES) {
    const namespaces = parts
      .map((part) => part[locale]?.whatseek)
      .filter((entry): entry is WhatseekNamespaceResources => entry !== undefined);
    if (namespaces.length === 0) {
      continue;
    }
    let combined: Record<string, unknown> = {};
    for (const namespace of namespaces) {
      combined = deepMerge(combined, namespace);
    }
    merged[locale] = { whatseek: combined };
  }
  return merged;
}

let configured = false;

/**
 * Resources use the `translation` namespace with `whatseek.*` key prefixes
 * (e.g. `t('whatseek.chat.home.title')`), so capability-prefixed keys stay
 * greppable and the i18n key convention matches route titleKey patterns.
 */
function toI18nextResource(resources: WhatseekLocaleResources): Resource {
  const bundle: Record<string, Record<string, unknown>> = {};
  for (const [locale, entry] of Object.entries(resources)) {
    if (isPlainObject(entry) && isPlainObject(entry.whatseek)) {
      // Keep the `whatseek` domain level so keys like
      // `whatseek.chat.home.title` resolve inside the translation namespace.
      bundle[locale] = { translation: { whatseek: entry.whatseek } };
    }
  }
  return bundle as unknown as Resource;
}

export function createWhatseekI18n(
  resources: WhatseekLocaleResources,
  initialLocale: WhatseekLocale = readStoredLocale(),
): I18nInstance {
  if (!configured) {
    void i18next.use(initReactI18next).init({
      resources: toI18nextResource(resources),
      lng: initialLocale,
      fallbackLng: DEFAULT_LOCALE,
      supportedLngs: [...WHATSEEK_LOCALES],
      defaultNS: 'translation',
      ns: ['translation'],
      interpolation: { escapeValue: false },
      returnNull: false,
      react: { useSuspense: false },
    });
    configured = true;
    return i18next;
  }
  // Already configured (e.g. HMR or repeated bootstrap): refresh resources.
  for (const [locale, entry] of Object.entries(resources)) {
    if (isPlainObject(entry) && isPlainObject(entry.whatseek)) {
      i18next.addResourceBundle(locale, 'translation', { whatseek: entry.whatseek }, true, true);
    }
  }
  void i18next.changeLanguage(initialLocale);
  return i18next;
}

export function getWhatseekI18n(): I18nInstance {
  return i18next;
}

export async function changeWhatseekLocale(locale: WhatseekLocale): Promise<void> {
  await i18next.changeLanguage(locale);
  persistLocale(locale);
}
