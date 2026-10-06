/**
 * Public export boundary of `@sdkwork/whatseek-mp-commons` — view-model
 * helpers shared by the mini-program pages (no `wx.*`, no Page()/Component().
 * Shared loading/empty/error chrome strings resolve through the package i18n
 * fragments (`src/i18n/<locale>/whatseek/commons/strings.json`), zh-CN by
 * default with en-US selected via `setCommonsLocale`.
 */

import enStrings from './i18n/en-US/whatseek/commons/strings.json';
import zhStrings from './i18n/zh-CN/whatseek/commons/strings.json';

/** Widen JSON-import literal types to plain strings, keeping the key structure. */
type WidenStrings<T> = T extends string ? string : { -readonly [K in keyof T]: WidenStrings<T[K]> };

export type CommonsStrings = WidenStrings<typeof zhStrings>;

type Locale = 'zh-CN' | 'en-US';

let locale: Locale = 'zh-CN';

/**
 * Switch the shared state-chrome string locale (wired from `profile.setLocale`
 * in the bootstrap composition root).
 */
export function setCommonsLocale(next: Locale): void {
  locale = next;
}

/** Localized shared strings for the current locale; pages bind this into `data`. */
export function strings(): CommonsStrings {
  return locale === 'en-US' ? enStrings : zhStrings;
}

export function formatCountLabel(count: number): string {
  if (count >= 10000) {
    const wan = count / 10000;
    return `${wan >= 10 ? wan.toFixed(0) : wan.toFixed(1)}万`;
  }
  return String(count);
}

export function truncate(text: string, max: number): string {
  return text.length > max ? `${text.slice(0, max)}…` : text;
}
