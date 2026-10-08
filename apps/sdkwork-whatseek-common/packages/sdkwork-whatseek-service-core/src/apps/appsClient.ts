/**
 * Standalone mock implementation of the core `AppsPort`
 * (Phase 1). Catalog data is in-memory; recent usage, favorites, and created
 * apps persist to localStorage. Phase 2 replaces this client with the
 * generated appstore app SDK client — the port stays identical.
 */

import type { AppChartId, AppHomeFeed, AppCollection, AppRecommendation, AppReview, CreatedApp, WhatseekApp } from '../types.js';
import type { AppsPort } from '../ports.js';

import { WHATSEEK_CATALOG, WHATSEEK_CATEGORIES, planModulesForRequirement, planPagesForRequirement, planDataModelForRequirement } from './catalog.js';
import {
  buildWhatseekHomeFeed,
  findWhatseekCollection,
  listWhatseekChartApps,
  listWhatseekCollectionApps,
} from './homeFeed.js';
import { extractSearchKeywords, scoreAppForKeywords } from './search.js';

const CREATED_APPS_KEY = 'whatseek.created-apps';
const RECENT_KEY = 'whatseek.recent-apps';
const FAVORITES_KEY = 'whatseek.favorite-apps';

interface Storage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

function defaultStorage(): Storage | null {
  try {
    return globalThis.localStorage ?? null;
  } catch {
    return null;
  }
}

function readJsonList<T>(storage: Storage | null, key: string): T[] {
  if (storage === null) {
    return [];
  }
  try {
    const raw = storage.getItem(key);
    if (raw === null) {
      return [];
    }
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as T[]) : [];
  } catch {
    return [];
  }
}

function writeJsonList(storage: Storage | null, key: string, value: readonly unknown[]): void {
  if (storage === null) {
    return;
  }
  try {
    storage.setItem(key, JSON.stringify(value));
  } catch {
    /* storage full/unavailable — in-memory state still works */
  }
}

export interface MockAppsClientOptions {
  storage?: Storage | null;
  now?: () => Date;
}

export function createMockAppsClient(options: MockAppsClientOptions = {}): AppsPort {
  const storage = options.storage === undefined ? defaultStorage() : options.storage;
  const now = options.now ?? (() => new Date());
  let createdApps: CreatedApp[] = readJsonList<CreatedApp>(storage, CREATED_APPS_KEY);
  let recentIds: string[] = readJsonList<string>(storage, RECENT_KEY);
  let favoriteIds: string[] = readJsonList<string>(storage, FAVORITES_KEY);

  const findCatalogApp = (appId: string): WhatseekApp | null =>
    WHATSEEK_CATALOG.find((app) => app.id === appId) ?? null;

  const persist = () => {
    writeJsonList(storage, CREATED_APPS_KEY, createdApps);
    writeJsonList(storage, RECENT_KEY, recentIds);
    writeJsonList(storage, FAVORITES_KEY, favoriteIds);
  };

  const appsByIds = (ids: readonly string[]): WhatseekApp[] =>
    ids
      .map((id) => findCatalogApp(id) ?? toCatalogShape(createdApps.find((app) => app.id === id)))
      .filter((app): app is WhatseekApp => app !== null);

  return {
    async searchApps(query) {
      const keywords = extractSearchKeywords(query);
      if (keywords.length === 0) {
        return [];
      }
      const scored = WHATSEEK_CATALOG
        .map((app) => scoreAppForKeywords(app, keywords))
        .filter((entry): entry is NonNullable<typeof entry> => entry !== null)
        .sort((left, right) => right.score - left.score);
      const recommendations: AppRecommendation[] = scored.map(({ app, matchedOn }) => ({
        app,
        reason: matchedOn.length > 0 ? matchedOn : app.category,
      }));
      // Unmatched creation-capable demand falls through to AI creation at the
      // router level (Create as Default); search itself returns what exists.
      return recommendations;
    },
    // Mock driver: trending seeds from the local catalog; suggestions filter
    // catalog names by prefix/contains (the store driver serves both
    // server-side from the appstore search endpoints).
    async listTrendingSearches(): Promise<string[]> {
      return WHATSEEK_CATALOG.slice(0, 6).map((app) => app.name);
    },
    async listSearchSuggestions(query: string): Promise<string[]> {
      const trimmed = query.trim().toLowerCase();
      if (trimmed.length === 0) {
        return [];
      }
      return WHATSEEK_CATALOG
        .map((app) => app.name)
        .filter((name) => name.toLowerCase().includes(trimmed))
        .slice(0, 5);
    },
    async listHomeFeed(): Promise<AppHomeFeed> {
      return buildWhatseekHomeFeed(WHATSEEK_CATALOG);
    },
    async getCollection(collectionId): Promise<AppCollection | null> {
      return findWhatseekCollection(collectionId);
    },
    async listCollectionApps(collectionId) {
      return listWhatseekCollectionApps(collectionId, WHATSEEK_CATALOG);
    },
    async listChart(chartId: AppChartId) {
      return listWhatseekChartApps(chartId, WHATSEEK_CATALOG);
    },
    async listRecommended() {
      return [...WHATSEEK_CATALOG].filter((app) => app.aiCapability).slice(0, 6);
    },
    async listHot() {
      return [...WHATSEEK_CATALOG].slice(0, 8);
    },
    async listCategories() {
      return [...WHATSEEK_CATEGORIES];
    },
    async listByCategory(categoryId) {
      return WHATSEEK_CATALOG.filter((app) => app.category === categoryId);
    },
    async getApp(appId) {
      return findCatalogApp(appId) ?? toCatalogShape(createdApps.find((app) => app.id === appId));
    },
    // The mock catalog carries no similar-apps source — the UI hides the rail.
    async listSimilarApps(): Promise<WhatseekApp[]> {
      return [];
    },
    // The mock catalog carries no developer grouping — the UI hides the rail.
    async listDeveloperApps(): Promise<WhatseekApp[]> {
      return [];
    },
    // The mock catalog carries no rating rows — the UI hides the section.
    async listAppReviews(): Promise<AppReview[]> {
      return [];
    },
    // Mock driver: search history persists to localStorage like the other
    // whatseek-local scope (the store driver upserts server-side).
    async listSearchHistory(): Promise<string[]> {
      const storage = defaultStorage();
      if (storage === null) {
        return [];
      }
      try {
        const parsed: unknown = JSON.parse(storage.getItem('whatseek.search-history') ?? '[]');
        return Array.isArray(parsed) ? (parsed as string[]) : [];
      } catch {
        return [];
      }
    },
    async recordSearchHistory(query: string): Promise<void> {
      const trimmed = query.trim();
      if (trimmed.length === 0) {
        return;
      }
      const storage = defaultStorage();
      if (storage === null) {
        return;
      }
      const existing = await this.listSearchHistory();
      const next = [trimmed, ...existing.filter((term) => term !== trimmed)].slice(0, 10);
      try {
        storage.setItem('whatseek.search-history', JSON.stringify(next));
      } catch {
        /* storage full/unavailable — history is best-effort */
      }
    },
    async clearSearchHistory(): Promise<void> {
      const storage = defaultStorage();
      if (storage !== null) {
        try {
          storage.removeItem('whatseek.search-history');
        } catch {
          /* ignore */
        }
      }
    },
    // The mock catalog carries no extra detail surface — same shape as getApp.
    async getAppDetail(appId) {
      return findCatalogApp(appId) ?? toCatalogShape(createdApps.find((app) => app.id === appId));
    },
    async listRecent() {
      return appsByIds(recentIds).slice(0, 8);
    },
    async recordRecent(appId) {
      recentIds = [appId, ...recentIds.filter((id) => id !== appId)].slice(0, 20);
      persist();
    },
    async listFavorites() {
      return appsByIds(favoriteIds);
    },
    async toggleFavorite(appId) {
      if (favoriteIds.includes(appId)) {
        favoriteIds = favoriteIds.filter((id) => id !== appId);
        persist();
        return false;
      }
      favoriteIds = [appId, ...favoriteIds];
      persist();
      return true;
    },
    async listMyApps() {
      return [...createdApps].sort((left, right) => right.updatedAt.localeCompare(left.updatedAt));
    },
    async getMyApp(appId) {
      return createdApps.find((app) => app.id === appId) ?? null;
    },
    async deleteMyApp(appId) {
      createdApps = createdApps.filter((app) => app.id !== appId);
      persist();
    },
    draftCreationPlan(requirement) {
      const trimmed = requirement.trim();
      const title = trimmed.length > 0 ? trimmed : '新应用';
      return {
        title: `「${title}」生成方案`,
        modules: planModulesForRequirement(trimmed),
        pages: planPagesForRequirement(trimmed),
        dataModel: planDataModelForRequirement(trimmed),
      };
    },
    async createAppFromPlan(requirement, modules) {
      const stamp = now();
      const id = `gen-${stamp.getTime().toString(36)}-${Math.floor(Math.random() * 1e4).toString(36)}`;
      const created: CreatedApp = {
        id,
        name: deriveAppName(requirement),
        requirement: requirement.trim(),
        modules: [...modules],
        lifecycle: 'preview',
        createdAt: stamp.toISOString(),
        updatedAt: stamp.toISOString(),
        versions: ['0.1.0'],
        icon: '🧩',
      };
      createdApps = [created, ...createdApps];
      persist();
      return created;
    },
    async modifyApp(appId, instruction) {
      const existing = createdApps.find((app) => app.id === appId);
      if (existing === undefined) {
        throw new Error(`created app not found: ${appId}`);
      }
      const nextVersion = bumpVersion(existing.versions[existing.versions.length - 1] ?? '0.1.0');
      const updated: CreatedApp = {
        ...existing,
        modules: appendInstructionModule(existing.modules, instruction),
        lifecycle: existing.lifecycle === 'published' ? 'updated' : existing.lifecycle,
        versions: [...existing.versions, nextVersion],
        updatedAt: now().toISOString(),
      };
      createdApps = createdApps.map((app) => (app.id === appId ? updated : app));
      persist();
      return updated;
    },
    async publishApp(appId) {
      const existing = createdApps.find((app) => app.id === appId);
      if (existing === undefined) {
        throw new Error(`created app not found: ${appId}`);
      }
      const published: CreatedApp = {
        ...existing,
        lifecycle: 'published',
        updatedAt: now().toISOString(),
      };
      createdApps = createdApps.map((app) => (app.id === appId ? published : app));
      persist();
      return published;
    },
  };
}

function deriveAppName(requirement: string): string {
  const trimmed = requirement.trim();
  if (trimmed.length === 0) {
    return '未命名应用';
  }
  const stripped = trimmed
    .replace(/^帮我/gu, '')
    .replace(/(创建|做一个|做|生成|开发|搭建|制作)/gu, '')
    .replace(/[。.,!！?？\s]+$/gu, '')
    .trim();
  const candidate = stripped.length > 0 ? stripped : trimmed;
  return candidate.length > 12 ? `${candidate.slice(0, 12)}…` : candidate;
}

function appendInstructionModule(modules: readonly string[], instruction: string): string[] {
  const normalized = instruction.trim();
  if (normalized.length === 0) {
    return [...modules];
  }
  const addition = normalized.length > 8 ? `${normalized.slice(0, 8)}…` : normalized;
  return modules.includes(addition) ? [...modules] : [...modules, addition];
}

function bumpVersion(version: string): string {
  const [major = '0', minor = '0', patch = '0'] = version.split('.');
  return `${major}.${minor}.${Number.parseInt(patch, 10) + 1}`;
}

function toCatalogShape(created: CreatedApp | undefined): WhatseekApp | null {
  if (created === undefined) {
    return null;
  }
  return {
    id: created.id,
    name: created.name,
    summary: created.requirement,
    developer: '我',
    category: 'generated',
    kind: 'generated',
    icon: created.icon,
    rating: 5,
    usersLabel: '1',
    priceLabel: '免费',
    aiCapability: true,
    tags: created.modules.slice(0, 3),
    updatedAt: created.updatedAt.slice(0, 10),
    permissions: [],
  };
}
