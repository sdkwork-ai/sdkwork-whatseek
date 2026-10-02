/**
 * Public export boundary of `@sdkwork/whatseek-mp-apps` — app-center view
 * models for the native pages (list, detail, 我的应用, creation flow).
 */

import type { AppsPort, AppRecommendation, CreatedApp, WhatseekApp, AppCategory } from '@sdkwork/whatseek-service-core';
import { getWhatseekClient } from '@sdkwork/whatseek-service-core';

export type { AppRecommendation, CreatedApp, WhatseekApp, AppCategory };

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

export function draftCreationPlan(requirement: string): { title: string; modules: string[] } {
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
