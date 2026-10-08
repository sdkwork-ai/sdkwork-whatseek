import { describe, expect, it, vi } from 'vitest';

import type { ListingSummary } from '@sdkwork/appstore-app-sdk';
import type { AppsPort } from '@sdkwork/whatseek-service-core';

import { createAppstoreAppsClient, type AppstoreCatalogGateway } from '../src/sdk/appstoreAppsClient.js';
import { createMockAppsClient } from '../src/apps/appsClient.js';

function listing(id: string, overrides: Partial<ListingSummary> = {}): ListingSummary {
  return {
    id,
    appKey: id,
    displayName: `应用 ${id}`,
    listingSlug: id,
    pricingModel: 'FREE',
    developerName: 'SDKWork',
    description: `${id} 的简介`,
    averageRating: '4.8',
    ratingCount: 12000,
    appType: 'APP',
    releasedAt: '2026-09-01T00:00:00Z',
    ...overrides,
  };
}

/** Fake catalog gateway: `resolve` answers the batched ids-resolution call. */
function fakeGateway(
  home: Record<string, unknown>,
  resolve: (ids: string[]) => ListingSummary[] = (ids) =>
    // Fixture convention: `app-*` ids are store listings; everything else
    // (e.g. `gen-*` created apps) resolves to nothing.
    ids.filter((id) => id.startsWith('app-')).map((id) => listing(id)),
): AppstoreCatalogGateway & {
  searchListings: ReturnType<typeof vi.fn>;
  listItems: ReturnType<typeof vi.fn>;
  addItem: ReturnType<typeof vi.fn>;
  removeItem: ReturnType<typeof vi.fn>;
} {
  // Stateful in-memory wishlist so toggle semantics can be pinned.
  const wishlist: Array<{ id: string; listingId: string; wishlistStatus: string; createdAt: string }> = [];
  return {
    getHome: vi.fn(async () => home),
    listCollections: vi.fn(async () => ({ items: [], pageInfo: { mode: 'cursor', hasMore: false } })),
    getCollection: vi.fn(async (collectionId: string) => ({
      id: collectionId,
      collectionCode: collectionId,
      collectionType: 'EDITORIAL',
      status: 'PUBLISHED',
      audienceScope: 'ALL',
      sortOrder: 1,
      localizations: [{ id: 'loc-1', locale: 'zh-CN', displayName: '精选合集', description: '合集描述' }],
      items: [{ id: 'item-1', listingId: 'app-a', sortOrder: 1 }, { id: 'item-2', listingId: 'app-b', sortOrder: 2 }],
    })),
    getChart: vi.fn(async () => ({
      id: 'chart-1',
      chartCode: 'top',
      snapshotDate: '2026-10-03',
      locale: 'zh-CN',
      platformScope: 'ALL',
      rankingJson: [{ rank: 1, listingId: 'app-a' }, { rank: 2, listingId: 'app-b' }],
      generatedAt: '2026-10-03T00:00:00Z',
    })),
    listCategories: vi.fn(async () => ({
      items: [
        { id: 'cat-1', categoryCode: 'efficiency', categoryLevel: 1, status: 'ACTIVE', sortOrder: 1, localizations: [{ id: 'l1', locale: 'zh-CN', displayName: '效率' }] },
      ],
      pageInfo: { mode: 'cursor', hasMore: false },
    })),
    listRecommendations: vi.fn(async () => ({
      items: [listing('app-rec') as unknown as Record<string, unknown>],
      pageInfo: { mode: 'cursor', hasMore: false },
    })),
    searchListings: vi.fn(async (params?: { ids?: string[] }) => ({
      items: params?.ids === undefined ? [listing('app-search')] : resolve(params.ids),
      pageInfo: { mode: 'cursor' as const, nextCursor: null, hasMore: false },
    })),
    listItems: vi.fn(async () => ({ items: [...wishlist], pageInfo: { mode: 'cursor', hasMore: false } })),
    addItem: vi.fn(async (listingId: string) => {
      wishlist.push({ id: `w-${wishlist.length + 1}`, listingId, wishlistStatus: 'ACTIVE', createdAt: '' });
      return {};
    }),
    removeItem: vi.fn(async (listingId: string) => {
      const index = wishlist.findIndex((item) => item.listingId === listingId);
      if (index >= 0) wishlist.splice(index, 1);
      return undefined;
    }),
    get: vi.fn(async (listingId: string) => ({
      id: listingId,
      displayName: `应用 ${listingId}`,
      whatsNewSummary: '新增深色模式与批量导出',
      currentVersion: '2.1.0',
      description: `${listingId} 的完整介绍，比摘要更长的描述文本内容。`,
    })),
    listMedia: vi.fn(async (listingId: string) => ({
      items: [
        { id: 'm-2', mediaRole: 'SCREENSHOT', mediaUrl: `https://cdn.example.com/${listingId}-shot2.png`, sortOrder: 2 },
        { id: 'm-1', mediaRole: 'SCREENSHOT', mediaUrl: `https://cdn.example.com/${listingId}-shot1.png`, sortOrder: 1 },
        { id: 'm-3', mediaRole: 'ICON', url: 'https://cdn.example.com/icon.png', sortOrder: 0 },
      ],
      pageInfo: { mode: 'cursor', hasMore: false },
    })),
  } as unknown as AppstoreCatalogGateway & {
    searchListings: ReturnType<typeof vi.fn>;
    listItems: ReturnType<typeof vi.fn>;
    addItem: ReturnType<typeof vi.fn>;
    removeItem: ReturnType<typeof vi.fn>;
  };
}

const HOME_FEED = {
  featuredSlots: [{ id: 'slot-1', slotCode: 'hero', listingId: 'app-hero', status: 'ACTIVE', audienceScope: 'ALL', platformScope: 'ALL', regionScope: [], startsAt: '', endsAt: '' }],
  collections: [
    {
      id: 'col-1',
      collectionCode: 'picks',
      collectionType: 'EDITORIAL',
      status: 'PUBLISHED',
      audienceScope: 'ALL',
      sortOrder: 1,
      localizations: [{ id: 'loc-1', locale: 'zh-CN', displayName: '本周精选', description: '编辑挑选' }],
      items: [{ id: 'item-1', listingId: 'app-a', sortOrder: 1 }, { id: 'item-2', listingId: 'app-b', sortOrder: 2 }],
    },
  ],
  charts: [
    {
      id: 'chart-top',
      chartCode: 'top',
      snapshotDate: '2026-10-03',
      locale: 'zh-CN',
      platformScope: 'ALL',
      rankingJson: [{ rank: 1, listingId: 'app-a' }],
      generatedAt: '2026-10-03T00:00:00Z',
    },
    {
      id: 'chart-paid',
      chartCode: 'paid',
      snapshotDate: '2026-10-03',
      locale: 'zh-CN',
      platformScope: 'ALL',
      rankingJson: [{ rank: 1, listingId: 'app-x' }],
      generatedAt: '2026-10-03T00:00:00Z',
    },
  ],
};

describe('createAppstoreAppsClient (home feed integration)', () => {
  it('assembles_the_home_feed_from_the_appstore_home_payload_with_one_batched_resolution', async () => {
    const gateway = fakeGateway(HOME_FEED);
    const client = createAppstoreAppsClient({ gateway });

    const feed = await client.listHomeFeed();

    expect(gateway.getHome).toHaveBeenCalledTimes(1);
    // Heroes resolve from featured slot listing ids.
    expect(feed.heroes).toHaveLength(1);
    expect(feed.heroes[0]).toMatchObject({ id: 'app-hero', appId: 'app-hero', title: '应用 app-hero' });
    // The appstore feed carries no editorial story blocks.
    expect(feed.stories).toEqual([]);
    // Collections keep server order with resolved cover apps.
    expect(feed.collections).toHaveLength(1);
    expect(feed.collections[0]).toMatchObject({ id: 'col-1', title: '本周精选' });
    expect(feed.collections[0]!.coverApps.map((app) => app.id)).toEqual(['app-a', 'app-b']);
    // Chart previews map known codes (top→hot) and skip whatseek-unknown ones (paid).
    expect(feed.charts.map((chart) => chart.id)).toEqual(['hot']);
    expect(feed.charts[0]!.apps.map((app) => app.id)).toEqual(['app-a']);
    // One batched listing resolution across heroes + covers + chart entries.
    expect(gateway.searchListings).toHaveBeenCalledTimes(1);
    expect(gateway.searchListings).toHaveBeenCalledWith(
      expect.objectContaining({ ids: expect.arrayContaining(['app-hero', 'app-a', 'app-b']) }),
    );
  });

  it('resolves_collections_and_charts_through_the_catalog', async () => {
    const gateway = fakeGateway(HOME_FEED);
    const client = createAppstoreAppsClient({ gateway });

    const collection = await client.getCollection('col-1');
    expect(collection).toMatchObject({ id: 'col-1', title: '精选合集', kind: 'editorial' });
    expect(collection!.appIds).toEqual(['app-a', 'app-b']);

    const collectionApps = await client.listCollectionApps('col-1');
    expect(collectionApps.map((app) => app.id)).toEqual(['app-a', 'app-b']);

    // whatseek 热门榜 maps onto the appstore top chart.
    const hot = await client.listChart('hot');
    expect(gateway.getChart).toHaveBeenCalledWith('top');
    expect(hot.map((app) => app.id)).toEqual(['app-a', 'app-b']);
  });

  it('maps_listing_summaries_onto_whatseek_app_shape', async () => {
    const gateway = fakeGateway(HOME_FEED, (ids) => [
      listing(ids[0]!, {
        pricingModel: 'SUBSCRIPTION',
        appType: 'AGENT',
        averageRating: '4.5',
      }),
    ]);
    const client = createAppstoreAppsClient({ gateway });

    const [app] = await client.listCollectionApps('col-1');
    expect(app).toMatchObject({
      developer: 'SDKWork',
      priceLabel: '付费',
      kind: 'agent',
      aiCapability: true,
      rating: 4.5,
      updatedAt: '2026-09-01',
    });
  });

  it('getAppDetail_hydrates_detail_and_screenshot_media_for_store_apps', async () => {
    const gateway = fakeGateway(HOME_FEED);
    const client = createAppstoreAppsClient({ gateway });

    const app = await client.getAppDetail('app-a');
    expect(app).not.toBeNull();
    expect(app!.whatsNew).toBe('新增深色模式与批量导出');
    expect(app!.currentVersion).toBe('2.1.0');
    // The longer listing description replaces the summary preview.
    expect(app!.summary).toContain('完整介绍');
    // Only SCREENSHOT-role media with renderable URLs, sorted by sortOrder.
    expect(app!.screenshots).toEqual([
      'https://cdn.example.com/app-a-shot1.png',
      'https://cdn.example.com/app-a-shot2.png',
    ]);
    expect(gateway.get).toHaveBeenCalledWith('app-a');
    expect(gateway.listMedia).toHaveBeenCalledWith('app-a');
  });

  it('getAppDetail_falls_back_to_the_local_client_for_created_apps', async () => {
    const gateway = fakeGateway(HOME_FEED);
    const local: AppsPort = createMockAppsClient({ storage: null });
    const client = createAppstoreAppsClient({ gateway, local });

    const created = await local.createAppFromPlan('订单管理', ['订单']);
    const detail = await client.getAppDetail(created.id);
    expect(detail).not.toBeNull();
    expect(detail!.id).toBe(created.id);
    // The mock driver carries no extra detail surface.
    expect(detail!.screenshots).toBeUndefined();
  });

  it('searches_through_the_catalog_and_keeps_local_fallback_for_created_apps', async () => {
    const gateway = fakeGateway(HOME_FEED);
    const local: AppsPort = createMockAppsClient({ storage: null });
    const client = createAppstoreAppsClient({ gateway, local });

    const results = await client.searchApps('帮我找一个视频剪辑工具');
    expect(gateway.searchListings).toHaveBeenCalledWith(
      expect.objectContaining({ q: '视频剪辑' }),
    );
    expect(results).toHaveLength(1);
    expect(results[0]!.reason).toBe('appstore');

    // Stopword-only queries never reach the gateway.
    expect(await client.searchApps('帮我找一个工具')).toEqual([]);

    // Created apps (gen-*) resolve through the whatseek-local client.
    const created = await local.createAppFromPlan('订单管理', ['订单']);
    const fetched = await client.getApp(created.id);
    expect(fetched).not.toBeNull();
    expect(fetched!.id).toBe(created.id);
  });

  it('delegates_the_whatseek_local_scope_to_the_local_client', async () => {
    const gateway = fakeGateway(HOME_FEED);
    const local: AppsPort = createMockAppsClient({ storage: null });
    const client = createAppstoreAppsClient({ gateway, local });

    await client.recordRecent('app-a');
    expect(await client.listRecent()).toEqual(await local.listRecent());

    // Store-listing favorites ride the appstore wishlist…
    expect(await client.toggleFavorite('app-a')).toBe(true);
    expect(gateway.addItem).toHaveBeenCalledWith('app-a');
    expect(await client.toggleFavorite('app-a')).toBe(false);
    expect(gateway.removeItem).toHaveBeenCalledWith('app-a');

    // …while the AI-created apps stay whatseek-local (never store listings).
    const created = await local.createAppFromPlan('团队周报助手', ['周报']);
    await client.toggleFavorite(created.id);
    expect((await client.listFavorites()).map((app) => app.id)).toContain(created.id);
    expect((await client.listMyApps()).map((app) => app.id)).toContain(created.id);
    expect(client.draftCreationPlan('助手')).toMatchObject({ modules: expect.any(Array) });

    // listCategories maps store categories with their localized names.
    const categories = await client.listCategories();
    expect(categories).toEqual([{ id: 'cat-1', labelKey: '效率', icon: '📦' }]);
  });
});
