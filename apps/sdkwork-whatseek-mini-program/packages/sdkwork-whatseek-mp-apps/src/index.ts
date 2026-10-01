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

export async function publishApp(appId: string): Promise<CreatedApp> {
  return appsPort().publishApp(appId);
}
