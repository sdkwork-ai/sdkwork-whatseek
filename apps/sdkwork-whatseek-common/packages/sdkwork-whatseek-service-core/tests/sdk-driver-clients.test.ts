import { describe, expect, it, vi } from 'vitest';

import {
  createAppsClient,
  createAppstoreSdkClient,
  createImSdkClient,
  type WhatseekSdkDriverEnv,
} from '../src/sdk/driverClients.js';

const imEnv: WhatseekSdkDriverEnv = {
  sdkworkImApiBaseUrl: '/im/v3/api',
  sdkworkImWebSocketBaseUrl: 'wss://im.example.com',
};

const appstoreEnv: WhatseekSdkDriverEnv = {
  sdkworkAppstoreApiBaseUrl: '/app/v3/api',
};

describe('shared SDK driver factories (common family)', () => {
  it('constructs_no_driver_client_without_a_base_url', () => {
    expect(createImSdkClient({}, { platform: 'h5' })).toBeNull();
    expect(createImSdkClient({ ...imEnv, sdkworkImApiBaseUrl: '' }, { platform: 'pc' })).toBeNull();
    expect(createAppstoreSdkClient({}, { platform: 'h5' })).toBeNull();
    expect(
      createAppstoreSdkClient({ ...appstoreEnv, sdkworkAppstoreApiBaseUrl: '' }, { platform: 'h5' }),
    ).toBeNull();
  });

  it('constructs_the_im_client_with_platform_and_optional_websocket_override', async () => {
    const constructorSpy = vi.fn();
    vi.doMock('@sdkwork/im-sdk', () => ({
      ImSdkClient: class {
        constructor(options: unknown) {
          constructorSpy(options);
        }

        conversations = {};

        social = {};

        connect = vi.fn();
      },
    }));
    vi.resetModules();
    try {
      const { createImSdkClient: fresh } = await import('../src/sdk/driverClients.js');
      fresh(imEnv, { platform: 'mini-program' });
      expect(constructorSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          apiBaseUrl: '/im/v3/api',
          websocketBaseUrl: 'wss://im.example.com',
          platform: 'mini-program',
          tokenManager: expect.objectContaining({ setTokens: expect.any(Function) }),
        }),
      );
    } finally {
      vi.doUnmock('@sdkwork/im-sdk');
      vi.resetModules();
    }
  });

  it('seeds_the_shared_token_manager_from_the_bootstrap_bridges', async () => {
    const setTokens = vi.fn();
    vi.doMock('@sdkwork/sdk-common', async (importOriginal) => ({
      ...(await importOriginal<typeof import('@sdkwork/sdk-common')>()),
      createTokenManager: () => ({ setTokens }),
    }));
    vi.doMock('@sdkwork/im-sdk', () => ({
      ImSdkClient: class {
        conversations = {};

        social = {};

        connect = vi.fn();
      },
    }));
    vi.doMock('@sdkwork/appstore-app-sdk', () => ({
      createAppStoreClient: () => ({ catalog: {} }),
    }));
    vi.resetModules();
    try {
      const { createAppstoreSdkClient: freshAppstore } = await import('../src/sdk/driverClients.js');
      freshAppstore(
        {
          ...appstoreEnv,
          sdkworkAppstoreBootstrapAccessToken: 'access-jwt',
          sdkworkAppstoreBootstrapAuthToken: 'auth-jwt',
        },
        { platform: 'pc' },
      );
      expect(setTokens).toHaveBeenCalledWith({ accessToken: 'access-jwt', authToken: 'auth-jwt' });
    } finally {
      vi.doUnmock('@sdkwork/sdk-common');
      vi.doUnmock('@sdkwork/im-sdk');
      vi.doUnmock('@sdkwork/appstore-app-sdk');
      vi.resetModules();
    }
  });

  it('createAppsClient_assembles_the_gateway_from_catalog_plus_wishlist_slices', async () => {
    const getHome = vi.fn(async () => ({ featuredSlots: [], collections: [], charts: [] }));
    const searchListings = vi.fn(async () => ({
      items: [
        {
          id: 'app-a',
          appKey: 'app-a',
          displayName: '应用 A',
          listingSlug: 'app-a',
          pricingModel: 'FREE',
        },
      ],
      pageInfo: { mode: 'cursor', nextCursor: null, hasMore: false },
    }));
    // Stateful in-memory wishlist so toggle semantics can be pinned.
    const wishlist: Array<{ id: string; listingId: string; wishlistStatus: string; createdAt: string }> = [];
    const listItems = vi.fn(async () => ({
      items: [...wishlist],
      pageInfo: { mode: 'cursor', hasMore: false },
    }));
    const addItem = vi.fn(async (listingId: string) => {
      wishlist.push({ id: `w-${wishlist.length + 1}`, listingId, wishlistStatus: 'ACTIVE', createdAt: '' });
      return {};
    });
    const removeItem = vi.fn(async (listingId: string) => {
      const index = wishlist.findIndex((item) => item.listingId === listingId);
      if (index >= 0) wishlist.splice(index, 1);
      return undefined;
    });

    const port = createAppsClient({
      catalog: { getHome, searchListings },
      wishlist: { listItems, addItem, removeItem },
    } as never);

    // 收藏 resolves through the wishlist slice + one batched listing search.
    expect(await port.toggleFavorite('app-a')).toBe(true);
    expect(addItem).toHaveBeenCalledWith('app-a');
    expect((await port.listFavorites()).map((app) => app.id)).toEqual(['app-a']);

    expect(await port.toggleFavorite('app-a')).toBe(false);
    expect(removeItem).toHaveBeenCalledWith('app-a');
    expect(await port.listFavorites()).toEqual([]);
  });

  it('createAppsClient_selects_the_mock_port_without_a_gateway', async () => {
    const port = createAppsClient(null);
    await expect(port.listHomeFeed()).resolves.toHaveProperty('heroes');
  });
});
