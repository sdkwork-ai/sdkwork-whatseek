/**
 * Public export boundary of `@sdkwork/whatseek-mp-apps` — app-center view
 * models for the native pages (list, detail, 我的应用, creation flow). Static
 * page chrome resolves through the package i18n fragments
 * (`src/i18n/<locale>/whatseek/apps/strings.json`), zh-CN by default with
 * en-US selected via `setAppsLocale`.
 */

import type { AppsPort, AppRecommendation, CreatedApp, WhatseekApp, AppCategory, AppHomeFeed, AppChartId, AppCollection } from '@sdkwork/whatseek-service-core';
import { getWhatseekClient } from '@sdkwork/whatseek-service-core';

import enStrings from './i18n/en-US/whatseek/apps/strings.json';
import zhStrings from './i18n/zh-CN/whatseek/apps/strings.json';

export type { AppRecommendation, CreatedApp, WhatseekApp, AppCategory, AppHomeFeed, AppCollection };

/** Widen JSON-import literal types to plain strings, keeping the key structure. */
type WidenStrings<T> = T extends string ? string : { -readonly [K in keyof T]: WidenStrings<T[K]> };

export type AppsStrings = WidenStrings<typeof zhStrings>;

type Locale = 'zh-CN' | 'en-US';

let locale: Locale = 'zh-CN';

/**
 * Switch the app-center chrome string locale (wired from `profile.setLocale`
 * in the bootstrap composition root; keys mirror the H5
 * `whatseek.apps.*` fragments where the same UI string exists).
 */
export function setAppsLocale(next: Locale): void {
  locale = next;
}

/** Localized app-center chrome strings for the current locale; pages bind this into `data`. */
export function strings(): AppsStrings {
  return locale === 'en-US' ? enStrings : zhStrings;
}

/** Home feed for the 编辑流 (PRD §4.2.1): heroes → stories → collections → charts. */
export async function listHomeFeed(): Promise<AppHomeFeed> {
  return appsPort().listHomeFeed();
}

export async function getCollection(collectionId: string): Promise<AppCollection | null> {
  return appsPort().getCollection(collectionId);
}

export async function listChart(chartId: AppChartId): Promise<WhatseekApp[]> {
  return appsPort().listChart(chartId);
}

export async function listCollectionApps(collectionId: string): Promise<WhatseekApp[]> {
  return appsPort().listCollectionApps(collectionId);
}

export function appsPort(): AppsPort {
  return getWhatseekClient('apps');
}

export async function searchApps(query: string): Promise<AppRecommendation[]> {
  return appsPort().searchApps(query);
}

export async function listRecommended(): Promise<WhatseekApp[]> {
  return appsPort().listRecommended();
}

export async function listCategories(): Promise<AppCategory[]> {
  return appsPort().listCategories();
}

export async function getApp(appId: string): Promise<WhatseekApp | null> {
  return appsPort().getApp(appId);
}

export async function listTrendingSearches(): Promise<string[]> {
  return appsPort().listTrendingSearches();
}

export async function listSearchSuggestions(query: string): Promise<string[]> {
  return appsPort().listSearchSuggestions(query);
}

export async function listSearchHistory(): Promise<string[]> {
  return appsPort().listSearchHistory();
}

export async function recordSearchHistory(query: string): Promise<void> {
  return appsPort().recordSearchHistory(query);
}

export async function clearSearchHistory(): Promise<void> {
  return appsPort().clearSearchHistory();
}

export async function listDeveloperApps(appId: string): Promise<unknown[]> {
  return appsPort().listDeveloperApps(appId);
}

export async function rateApp(appId: string, rating: number): Promise<void> {
  return appsPort().rateApp(appId, rating);
}

export async function listAppReviews(appId: string): Promise<unknown[]> {
  return appsPort().listAppReviews(appId);
}

export async function listSimilarApps(appId: string): Promise<WhatseekApp[]> {
  return appsPort().listSimilarApps(appId);
}

export async function getAppDetail(appId: string): Promise<WhatseekApp | null> {
  return appsPort().getAppDetail(appId);
}

export async function listMyApps(): Promise<CreatedApp[]> {
  return appsPort().listMyApps();
}

export async function openApp(appId: string): Promise<void> {
  await appsPort().recordRecent(appId);
}

export async function favoriteApp(appId: string): Promise<boolean> {
  return appsPort().toggleFavorite(appId);
}

export async function generateApp(requirement: string): Promise<CreatedApp> {
  const port = appsPort();
  const plan = port.draftCreationPlan(requirement);
  return port.createAppFromPlan(requirement, plan.modules);
}

export function draftCreationPlan(requirement: string): {
  title: string;
  modules: string[];
  pages: string[];
  dataModel: string[];
} {
  return appsPort().draftCreationPlan(requirement);
}

export async function createAppFromPlan(requirement: string, modules: readonly string[]): Promise<CreatedApp> {
  return appsPort().createAppFromPlan(requirement, modules);
}

export async function publishApp(appId: string): Promise<CreatedApp> {
  return appsPort().publishApp(appId);
}

export async function deleteMyApp(appId: string): Promise<void> {
  await appsPort().deleteMyApp(appId);
}

export async function modifyMyApp(appId: string, instruction: string): Promise<CreatedApp> {
  return appsPort().modifyApp(appId, instruction);
}

export async function listHotApps(): Promise<WhatseekApp[]> {
  return appsPort().listHot();
}

export async function listFavoriteApps(): Promise<WhatseekApp[]> {
  return appsPort().listFavorites();
}

export async function toggleFavoriteApp(appId: string): Promise<boolean> {
  return appsPort().toggleFavorite(appId);
}

export async function listRecentApps(): Promise<WhatseekApp[]> {
  return appsPort().listRecent();
}

export async function listAppsByCategory(categoryId: string): Promise<WhatseekApp[]> {
  return appsPort().listByCategory(categoryId);
}
