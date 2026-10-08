/**
 * Shared appstore-backed `AppsPort` adapter of the sdkwork-whatseek common
 * family (owned here, re-exported by every TS surface capability package) over
 * the sdkwork-appstore composed consumer
 * package `@sdkwork/appstore-app-sdk` (`/app/v3/api`; APP_SDK_INTEGRATION_SPEC.md
 * §9 consumer import naming).
 *
 * The composed SDK client is constructed exactly once at each surface's
 * bootstrap composition root (APP_SDK_INTEGRATION_SPEC.md §1) and injected
 * here through the narrow `AppstoreCatalogGateway` slice. This module only
 * maps appstore catalog contracts onto the whatseek `AppsPort`; it never
 * constructs transports, tokens, or HTTP on its own. Feed assembly follows the
 * sdkwork-appstore reference consumption (apps/sdkwork-appstore-h5
 * `hooks/catalog.ts`): featured slots and chart snapshots carry listing ids
 * that are resolved into cards through the catalog search endpoint.
 *
 * Scope note: whatseek-local user scope (最近使用, 收藏, 我的应用, AI 创建
 * lifecycle) has no appstore app-api counterpart yet and stays on the mock
 * client (`local`); the sdkwork-appstore user library/wishlist families are
 * the designated Phase-3 seam for favorites. The SDK auto-unwraps the
 * `{ code, data, traceId }` envelope, so this boundary sees bare payloads.
 */

import type { AppStoreClient } from '@sdkwork/appstore-app-sdk';
import type { CatalogChartSnapshot, CatalogCollection, ListingSummary } from '@sdkwork/appstore-app-sdk';

import type {
  AppCategory,
  AppChartId,
  AppChartPreview,
  AppCollection,
  AppCollectionKind,
  AppHomeFeed,
  AppRecommendation,
  AppReview,
  AppsPort,
  CreatedApp,
  WhatseekApp,
} from '@sdkwork/whatseek-service-core';

import { createMockAppsClient } from '../apps/appsClient.js';
import { extractSearchKeywords } from '../apps/search.js';

/**
 * Narrow slice of the composed appstore client this adapter consumes: the
 * catalog facade for feed/search/browse, the listings facade for the detail
 * enrichment (listing detail + media), and the wishlist facade for 收藏
 * (server-side store favorites; created apps stay whatseek-local).
 */
export type AppstoreCatalogGateway = Pick<
  AppStoreClient['catalog'],
  | 'getChart'
  | 'getCollection'
  | 'getHome'
  | 'listCategories'
  | 'listCollections'
  | 'listRecommendations'
  | 'listTrendingSearchTerms'
  | 'listSearchSuggestions'
  | 'searchListings'
  | 'listEvents'
  | 'getEvent'
  | 'listSearchHistory'
  | 'upsertSearchHistory'
  | 'clearSearchHistory'
> &
  Pick<AppStoreClient['listings'], 'get' | 'listMedia' | 'listSimilar' | 'listRatings' | 'listDeveloperOther' | 'updateRating'> &
  Pick<AppStoreClient['wishlist'], 'addItem' | 'listItems' | 'removeItem'>;

export interface AppstoreAppsClientOptions {
  /** Injected composed appstore client slice (constructed at app bootstrap). */
  gateway: AppstoreCatalogGateway;
  /** Whatseek-local scope delegate; defaults to the standalone mock client. */
  local?: AppsPort;
}

/** whatseek chart tabs mapped onto appstore chart snapshot codes. */
const CHART_CODES: Record<AppChartId, string> = { hot: 'top', free: 'free', new: 'new' };

/** Hero slots and chart quick views cap at the editorial reference sizes. */
const HERO_SLOT_LIMIT = 5;
const CHART_PREVIEW_SIZE = 3;
const WISHLIST_PAGE_SIZE = 50;
const CHART_SIZE = 10;
const LIST_PAGE_SIZE = 50;

/** Deterministic tile glyph for store listings (Phase-1 emoji tile visual). */
const GLYPH_PALETTE = ['🧩', '🤖', '📦', '🚀', '🧠', '💡', '🛠️', '📊'];

function glyphFor(id: string): string {
  let hash = 0;
  for (const char of id) {
    hash = (hash * 31 + char.codePointAt(0)!) >>> 0;
  }
  return GLYPH_PALETTE[hash % GLYPH_PALETTE.length] ?? '🧩';
}

function priceLabel(pricingModel: string): string {
  if (pricingModel === 'PAID' || pricingModel === 'SUBSCRIPTION') {
    return '付费';
  }
  return '免费';
}

function appKind(appType: string | undefined): WhatseekApp['kind'] {
  if (appType === 'AGENT') {
    return 'agent';
  }
  if (appType === 'PLUGIN' || appType === 'EXPERT') {
    return 'skill';
  }
  return 'web';
}

function ratingValue(averageRating: string | undefined): number {
  const value = Number.parseFloat(averageRating ?? '');
  return Number.isFinite(value) ? value : 0;
}

function readString(value: unknown): string | null {
  return typeof value === 'string' && value.length > 0 ? value : null;
}

/** Search-suggestion/trending rows carry the term under one of these fields. */
function readSearchTerm(row: Record<string, unknown>): string {
  return readString(row.term) ?? readString(row.keyword) ?? readString(row.suggestion) ?? '';
}

/** Typed summaries and weak-typed page rows (`SdkWorkPageData`) share this shape. */
type ListingRow = ListingSummary | Record<string, unknown>;

function mapSummary(summary: ListingRow): WhatseekApp {
  const row: Record<string, unknown> = summary as Record<string, unknown>;
  const field = (key: string): string | undefined => {
    const value = row[key];
    return typeof value === 'string' ? value : undefined;
  };
  const id = field('id') ?? '';
  const ratingCount = row.ratingCount;
  const releasedAt = field('releasedAt');
  return {
    id,
    name: field('displayName') ?? '应用',
    summary: field('description') ?? field('subtitle') ?? '',
    developer: field('developerName') ?? 'SDKWork',
    category: 'appstore',
    kind: appKind(field('appType')),
    icon: glyphFor(id),
    rating: ratingValue(field('averageRating')),
    usersLabel: typeof ratingCount === 'number' ? String(ratingCount) : '—',
    priceLabel: priceLabel(field('pricingModel') ?? 'FREE'),
    aiCapability: field('appType') === 'AGENT',
    tags: [],
    updatedAt: releasedAt?.slice(0, 10) ?? '',
    permissions: [],
  };
}

/** zh-CN-first localized field reader (sdkwork-appstore reference rule). */
function readLocalized(
  localizations: readonly { locale: string; displayName: string; description?: string }[],
  field: 'displayName' | 'description',
): string {
  const preferred =
    localizations.find((entry) => entry.locale === 'zh-CN' || entry.locale === 'zh_CN') ??
    localizations[0];
  return (preferred?.[field] ?? '').trim();
}

function readRankingIds(snapshot: CatalogChartSnapshot): string[] {
  const ranking = Array.isArray(snapshot.rankingJson)
    ? (snapshot.rankingJson as Record<string, unknown>[])
    : [];
  return ranking
    .map((entry) => String(entry.listingId ?? ''))
    .filter((id) => id.length > 0);
}

function readCollectionIds(collection: CatalogCollection): string[] {
  return collection.items
    .map((item) => String(item.listingId ?? ''))
    .filter((id) => id.length > 0);
}

function mapCollectionKind(collectionType: string): AppCollectionKind {
  if (collectionType === 'EDITORIAL') {
    return 'editorial';
  }
  if (collectionType === 'EVENT') {
    return 'event';
  }
  if (collectionType === 'CHART') {
    return 'chart';
  }
  return 'theme';
}


/**
 * Map a weak-typed catalog event row onto the collection shape (kind
 * 'event'); the appstore domain models events as curated listing
 * collections (collectionType EVENT), so the home rail and the collection
 * detail route serve them through the same pipeline.
 */
function mapEventCollection(row: Record<string, unknown>): AppCollection {
  const localizations = Array.isArray(row.localizations)
    ? (row.localizations as { locale: string; displayName: string; description?: string }[])
    : [];
  const items = Array.isArray(row.items) ? (row.items as Record<string, unknown>[]) : [];
  const appIds = items.length > 0
    ? items.map((item) => readString(item.listingId) ?? '').filter((id) => id.length > 0)
    : (readString(row.listingIds) ?? '').split(',').map((id) => id.trim()).filter((id) => id.length > 0);
  return {
    id: readString(row.id) ?? '',
    title: readString(row.title) || readLocalized(localizations, 'displayName') || '活动',
    description: readString(row.subtitle) || readLocalized(localizations, 'description'),
    kind: 'event',
    appIds,
  };
}

function mapCollection(collection: CatalogCollection): AppCollection {
  return {
    id: collection.id,
    title: readLocalized(collection.localizations, 'displayName') || collection.collectionCode,
    description: readLocalized(collection.localizations, 'description'),
    kind: mapCollectionKind(collection.collectionType),
    appIds: readCollectionIds(collection),
  };
}

export function createAppstoreAppsClient(options: AppstoreAppsClientOptions): AppsPort {
  const { gateway } = options;
  const local = options.local ?? createMockAppsClient();

  /** Resolve listing ids into whatseek apps, preserving the given order. */
  const resolveListings = async (ids: readonly string[]): Promise<WhatseekApp[]> => {
    const unique = [...new Set(ids)].filter((id) => id.length > 0).slice(0, LIST_PAGE_SIZE);
    if (unique.length === 0) {
      return [];
    }
    const page = await gateway.searchListings({ ids: unique, limit: unique.length });
    const byId = new Map<string, ListingSummary>();
    for (const summary of page.items) {
      byId.set(summary.id, summary);
    }
    return unique
      .map((id) => byId.get(id))
      .filter((summary): summary is ListingSummary => summary !== undefined)
      .map(mapSummary);
  };

  return {
    async searchApps(query): Promise<AppRecommendation[]> {
      const keywords = extractSearchKeywords(query);
      if (keywords.length === 0) {
        return [];
      }
      const page = await gateway.searchListings({ q: keywords.join(' '), limit: LIST_PAGE_SIZE });
      // Unmatched creation-capable demand falls through to AI creation at the
      // router level (Create as Default); search itself returns what exists.
      return page.items.map((summary) => {
        const app = mapSummary(summary);
        return { app, reason: app.category };
      });
    },

    async listTrendingSearches(): Promise<string[]> {
      // Server-side store terms, zh-CN first (sdkwork-appstore reference rule).
      const page = await gateway.listTrendingSearchTerms({ locale: 'zh-CN', limit: 10 });
      return (page.items as unknown as Record<string, unknown>[])
        .map(readSearchTerm)
        .filter((term) => term.length > 0);
    },

    async listSearchHistory(): Promise<string[]> {
      const page = await gateway.listSearchHistory({ limit: 10 });
      return (page.items as unknown as Record<string, unknown>[])
        .map((row) => readString(row.queryText) ?? readSearchTerm(row))
        .filter((term) => term.length > 0);
    },

    async recordSearchHistory(query): Promise<void> {
      const trimmed = query.trim();
      if (trimmed.length === 0) {
        return;
      }
      await gateway.upsertSearchHistory({ queryText: trimmed });
    },

    async clearSearchHistory(): Promise<void> {
      await gateway.clearSearchHistory();
    },

    async listSearchSuggestions(query): Promise<string[]> {
      const trimmed = query.trim();
      if (trimmed.length === 0) {
        return [];
      }
      const page = await gateway.listSearchSuggestions({ q: trimmed });
      const terms = (page.items as unknown as Record<string, unknown>[])
        .map(readSearchTerm)
        .filter((term) => term.length > 0 && term !== trimmed);
      return [...new Set(terms)];
    },

    async listSimilarApps(appId): Promise<WhatseekApp[]> {
      const page = await gateway.listSimilar(appId, { limit: 6 });
      return page.items.map(mapSummary);
    },

    async listDeveloperApps(appId): Promise<WhatseekApp[]> {
      const page = await gateway.listDeveloperOther(appId, { limit: 6 });
      return page.items.map(mapSummary);
    },

    async rateApp(appId, rating): Promise<void> {
      await gateway.updateRating(appId, { rating });
    },
    async listAppReviews(appId): Promise<AppReview[]> {
      const page = await gateway.listRatings(appId, { limit: 10 });
      return (page.items as unknown as Record<string, unknown>[]).map((row) => ({
        id: readString(row.id) ?? '',
        author: readString(row.userId) ?? '',
        rating: Number(row.rating ?? 0),
        title: readString(row.title) ?? '',
        createdAt: readString(row.createdAt) ?? '',
      }));
    },

    async listHomeFeed(): Promise<AppHomeFeed> {
      const home = await gateway.getHome();

      const heroIds = home.featuredSlots
        .map((slot) => slot.listingId)
        .filter((id) => id.length > 0)
        .slice(0, HERO_SLOT_LIMIT);
      // Active store events fold into the collections rail as kind-event
      // cards — the appstore domain models events as curated listing
      // collections (collectionType EVENT), so the same pipeline serves them.
      const eventsPage = await gateway
        .listEvents({ status: 'active', limit: 4 })
        .catch(() => null);
      const eventCollections = ((eventsPage?.items ?? []) as unknown as Record<string, unknown>[]).map(
        mapEventCollection,
      );
      const collections = [...home.collections.map(mapCollection), ...eventCollections];
      const chartSnapshots = home.charts.filter((snapshot) =>
        Object.values(CHART_CODES).includes(snapshot.chartCode),
      );

      // One batched resolution for every listing id on the feed (heroes,
      // collection covers, chart entries) — same resolve-through-search rule
      // as the sdkwork-appstore reference surfaces.
      const feedIds = [
        ...heroIds,
        ...collections.flatMap((collection) => collection.appIds),
        ...chartSnapshots.flatMap(readRankingIds),
      ];
      const resolved = await resolveListings(feedIds);
      const byId = new Map(resolved.map((app) => [app.id, app]));
      const pick = (ids: readonly string[], limit: number): WhatseekApp[] =>
        ids
          .map((id) => byId.get(id))
          .filter((app): app is WhatseekApp => app !== undefined)
          .slice(0, limit);

      const charts = chartSnapshots
        .map((snapshot) => {
          const chartId = (Object.keys(CHART_CODES) as AppChartId[]).find(
            (id) => CHART_CODES[id] === snapshot.chartCode,
          );
          return chartId === undefined
            ? undefined
            : { id: chartId, apps: pick(readRankingIds(snapshot), CHART_PREVIEW_SIZE) };
        })
        .filter((preview): preview is AppChartPreview => preview !== undefined);

      return {
        // The appstore home feed carries no editorial story blocks; the
        // stories rail stays empty until appstore ships one (UI hides it).
        heroes: pick(heroIds, HERO_SLOT_LIMIT).map((app) => ({
          id: app.id,
          title: app.name,
          tagline: app.summary || app.developer,
          badge: app.priceLabel,
          appId: app.id,
          icon: app.icon,
        })),
        stories: [],
        collections: collections.map((collection) => ({
          id: collection.id,
          title: collection.title,
          description: collection.description,
          kind: collection.kind,
          coverApps: pick(collection.appIds, 4),
        })),
        charts,
      };
    },

    async getCollection(collectionId): Promise<AppCollection | null> {
      // Collections first; a miss falls back to the events endpoint (events
      // are curated collections in the appstore domain, kind 'event').
      try {
        return mapCollection(await gateway.getCollection(collectionId));
      } catch {
        const event = await gateway.getEvent(collectionId).catch(() => null);
        const row = event as unknown as Record<string, unknown> | null;
        return row === null ? null : mapEventCollection(row);
      }
    },

    async listCollectionApps(collectionId): Promise<WhatseekApp[]> {
      const collection = await this.getCollection(collectionId);
      return collection === null ? [] : resolveListings(collection.appIds);
    },

    async listChart(chartId: AppChartId): Promise<WhatseekApp[]> {
      const snapshot = await gateway.getChart(CHART_CODES[chartId]);
      return (await resolveListings(readRankingIds(snapshot))).slice(0, CHART_SIZE);
    },

    async listRecommended(): Promise<WhatseekApp[]> {
      const page = await gateway.listRecommendations({ limit: 12 });
      return page.items.map(mapSummary);
    },

    async listHot(): Promise<WhatseekApp[]> {
      const snapshot = await gateway.getChart(CHART_CODES.hot);
      return (await resolveListings(readRankingIds(snapshot))).slice(0, 8);
    },

    async listCategories(): Promise<AppCategory[]> {
      const page = await gateway.listCategories({ limit: 24 });
      return page.items.map((category) => ({
        id: category.id,
        // The label renders through t(labelKey); i18next passes the localized
        // store name through unchanged when it is not a whatseek i18n key.
        labelKey: readLocalized(category.localizations, 'displayName') || category.categoryCode,
        icon: '📦',
      }));
    },

    async listByCategory(categoryId): Promise<WhatseekApp[]> {
      const page = await gateway.searchListings({ categoryId, limit: LIST_PAGE_SIZE });
      return page.items.map(mapSummary);
    },

    async getApp(appId): Promise<WhatseekApp | null> {
      const page = await gateway.searchListings({ ids: [appId], limit: 1 });
      const storeApp = page.items[0];
      return storeApp === undefined ? local.getApp(appId) : mapSummary(storeApp);
    },

    async getAppDetail(appId): Promise<WhatseekApp | null> {
      const page = await gateway.searchListings({ ids: [appId], limit: 1 });
      const storeApp = page.items[0];
      if (storeApp === undefined) {
        return local.getAppDetail(appId);
      }
      // Detail + media hydrate best-effort: a failing listing/media call keeps
      // the summary-shaped app (screenshots fall back to the UI placeholder).
      const [detail, mediaPage] = await Promise.all([
        gateway.get(appId).catch(() => null),
        gateway.listMedia(appId).catch(() => null),
      ]);
      const app = mapSummary(storeApp);
      const detailRow = detail as unknown as Record<string, unknown> | null;
      if (detailRow !== null) {
        const whatsNew = readString(detailRow.whatsNewSummary);
        if (whatsNew !== null) {
          app.whatsNew = whatsNew;
        }
        const currentVersion = readString(detailRow.currentVersion);
        if (currentVersion !== null) {
          app.currentVersion = currentVersion;
        }
        const description = readString(detailRow.description);
        if (description !== null && description.length > app.summary.length) {
          app.summary = description;
        }
      }
      const mediaItems = (mediaPage?.items ?? []) as unknown as Record<string, unknown>[];
      app.screenshots = mediaItems
        .filter((item) => readString(item.mediaRole) === 'SCREENSHOT')
        .sort((left, right) => Number(left.sortOrder ?? 0) - Number(right.sortOrder ?? 0))
        .map((item) => readString(item.mediaUrl) ?? readString(item.url))
        .filter((url): url is string => url !== null)
        .slice(0, 6);
      return app;
    },

    // Whatseek-local user scope, split by backing: 收藏 for store listings is
    // the appstore wishlist (server-side, per account); 最近使用 and the
    // AI-created 我的应用 lifecycle have no appstore app-api resource and stay
    // on the mock client. The two id spaces are disjoint (listing ids vs
    // `gen-*` created ids), so the merged list never duplicates.
    async listRecent() {
      return local.listRecent();
    },
    async recordRecent(appId) {
      await local.recordRecent(appId);
    },
    async listFavorites() {
      const [wishlistPage, localFavorites] = await Promise.all([
        gateway.listItems({ limit: WISHLIST_PAGE_SIZE }),
        local.listFavorites(),
      ]);
      const wishlistApps = await resolveListings(
        wishlistPage.items.map((item) => item.listingId),
      );
      return [...wishlistApps, ...localFavorites];
    },
    async toggleFavorite(appId) {
      // Created apps never resolve as store listings — keep them local.
      const page = await gateway.searchListings({ ids: [appId], limit: 1 });
      if (page.items.length === 0) {
        return local.toggleFavorite(appId);
      }
      const wishlistPage = await gateway.listItems({ limit: WISHLIST_PAGE_SIZE });
      const wishlisted = wishlistPage.items.some((item) => item.listingId === appId);
      if (wishlisted) {
        await gateway.removeItem(appId);
        return false;
      }
      await gateway.addItem(appId);
      return true;
    },
    async listMyApps(): Promise<CreatedApp[]> {
      return local.listMyApps();
    },
    async getMyApp(appId) {
      return local.getMyApp(appId);
    },
    async deleteMyApp(appId) {
      await local.deleteMyApp(appId);
    },
    draftCreationPlan(requirement) {
      return local.draftCreationPlan(requirement);
    },
    async createAppFromPlan(requirement, modules) {
      return local.createAppFromPlan(requirement, modules);
    },
    async modifyApp(appId, instruction) {
      return local.modifyApp(appId, instruction);
    },
    async publishApp(appId) {
      return local.publishApp(appId);
    },
  };
}
