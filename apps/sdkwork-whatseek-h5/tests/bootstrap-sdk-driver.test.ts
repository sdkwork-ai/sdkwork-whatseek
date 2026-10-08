import { describe, expect, it, vi } from 'vitest';

import {
  FALLBACK_RUNTIME_ENVIRONMENT,
  type WhatseekRuntimeEnvironment,
} from '@sdkwork/whatseek-h5-core';

import {
  createAppstoreSdkClient,
  createContactsClient,
  createImSdkClient,
  createMessagesClient,
} from '../src/bootstrap/sdkClients.js';

const imEnv: WhatseekRuntimeEnvironment = {
  ...FALLBACK_RUNTIME_ENVIRONMENT,
  sdkworkImApiBaseUrl: '/im/v3/api',
  sdkworkImWebSocketBaseUrl: 'wss://im.example.com',
};

describe('im sdk client construction (bootstrap composition root)', () => {
  it('constructs_no_im_client_without_a_base_url', () => {
    expect(createImSdkClient(FALLBACK_RUNTIME_ENVIRONMENT)).toBeNull();
    expect(createImSdkClient({ ...imEnv, sdkworkImApiBaseUrl: '' })).toBeNull();
  });

  it('constructs_the_im_client_once_with_token_manager_and_resolved_base_urls', async () => {
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
      const { createImSdkClient: fresh } = await import('../src/bootstrap/sdkClients.js');
      fresh(imEnv);
      expect(constructorSpy).toHaveBeenCalledTimes(1);
      expect(constructorSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          apiBaseUrl: '/im/v3/api',
          websocketBaseUrl: 'wss://im.example.com',
          platform: 'h5',
          // TokenManager closure rule: one manager instance per session context.
          tokenManager: expect.objectContaining({ setTokens: expect.any(Function) }),
        }),
      );
    } finally {
      vi.doUnmock('@sdkwork/im-sdk');
      vi.resetModules();
    }
  });

  it('omits_the_websocket_override_when_the_environment_leaves_it_empty', async () => {
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
      const { createImSdkClient: fresh } = await import('../src/bootstrap/sdkClients.js');
      fresh({ ...FALLBACK_RUNTIME_ENVIRONMENT, sdkworkImApiBaseUrl: '/im/v3/api' });
      expect(constructorSpy).toHaveBeenCalledWith(
        expect.not.objectContaining({ websocketBaseUrl: expect.anything() }),
      );
    } finally {
      vi.doUnmock('@sdkwork/im-sdk');
      vi.resetModules();
    }
  });

  it('seeds_the_token_manager_from_the_bootstrap_runtime_env_bridge', async () => {
    const setTokens = vi.fn();
    // sdkClients' module graph pulls the real IM + appstore generated HTTP
    // clients, so the sdk-common mock must keep the real exports.
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
    vi.resetModules();
    try {
      const { createImSdkClient: fresh } = await import('../src/bootstrap/sdkClients.js');
      fresh({
        ...imEnv,
        sdkworkImBootstrapAccessToken: 'access-jwt',
        sdkworkImBootstrapAuthToken: 'auth-jwt',
      });
      expect(setTokens).toHaveBeenCalledTimes(1);
      expect(setTokens).toHaveBeenCalledWith({ accessToken: 'access-jwt', authToken: 'auth-jwt' });
      // An empty bridge (every committed profile) keeps the session empty.
      fresh(imEnv);
      expect(setTokens).toHaveBeenCalledTimes(1);
    } finally {
      vi.doUnmock('@sdkwork/sdk-common');
      vi.doUnmock('@sdkwork/im-sdk');
      vi.resetModules();
    }
  });
});

describe('port driver selection (bootstrap composition root)', () => {
  it('keeps_both_ports_on_the_mock_clients_without_an_im_base_url', () => {
    const im = createImSdkClient(FALLBACK_RUNTIME_ENVIRONMENT);
    const messages = createMessagesClient(im);
    const contacts = createContactsClient(im);
    // The mock ports have no `events` surface; the IM adapters provide it.
    expect(messages.events).toBeUndefined();
    expect(contacts.listContacts).toBeTypeOf('function');
  });

  it('backs_both_ports_with_the_realtime_im_adapters_when_a_base_url_is_declared', () => {
    const im = createImSdkClient(imEnv);
    const messages = createMessagesClient(im);
    const contacts = createContactsClient(im);
    expect(messages.events).toBeDefined();
    expect(typeof messages.listConversations).toBe('function');
    expect(typeof contacts.listContacts).toBe('function');
    expect(typeof contacts.searchContacts).toBe('function');
    expect(typeof contacts.getContact).toBe('function');
  });
});

describe('appstore sdk client construction (bootstrap composition root)', () => {
  const appstoreEnv: WhatseekRuntimeEnvironment = {
    ...FALLBACK_RUNTIME_ENVIRONMENT,
    sdkworkAppstoreApiBaseUrl: '/app/v3/api',
  };

  it('constructs_no_appstore_client_without_a_base_url', () => {
    expect(createAppstoreSdkClient(FALLBACK_RUNTIME_ENVIRONMENT)).toBeNull();
    expect(createAppstoreSdkClient({ ...appstoreEnv, sdkworkAppstoreApiBaseUrl: '' })).toBeNull();
  });

  it('constructs_the_appstore_client_once_with_token_manager_and_platform', async () => {
    const constructorSpy = vi.fn();
    vi.doMock('@sdkwork/appstore-app-sdk', () => ({
      createAppStoreClient: (config: unknown) => {
        constructorSpy(config);
        return { catalog: {} };
      },
    }));
    vi.resetModules();
    try {
      const { createAppstoreSdkClient: fresh } = await import('../src/bootstrap/sdkClients.js');
      fresh(appstoreEnv);
      expect(constructorSpy).toHaveBeenCalledTimes(1);
      expect(constructorSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          baseUrl: '/app/v3/api',
          platform: 'h5',
          // TokenManager closure rule: one manager instance per session context.
          tokenManager: expect.objectContaining({ setTokens: expect.any(Function) }),
        }),
      );
    } finally {
      vi.doUnmock('@sdkwork/appstore-app-sdk');
      vi.resetModules();
    }
  });

  it('seeds_the_appstore_token_manager_from_the_bootstrap_runtime_env_bridge', async () => {
    const setTokens = vi.fn();
    vi.doMock('@sdkwork/sdk-common', async (importOriginal) => ({
      ...(await importOriginal<typeof import('@sdkwork/sdk-common')>()),
      createTokenManager: () => ({ setTokens }),
    }));
    vi.doMock('@sdkwork/appstore-app-sdk', () => ({
      createAppStoreClient: () => ({ catalog: {} }),
    }));
    vi.resetModules();
    try {
      const { createAppstoreSdkClient: fresh } = await import('../src/bootstrap/sdkClients.js');
      fresh({
        ...appstoreEnv,
        sdkworkAppstoreBootstrapAccessToken: 'access-jwt',
        sdkworkAppstoreBootstrapAuthToken: 'auth-jwt',
      });
      expect(setTokens).toHaveBeenCalledWith({ accessToken: 'access-jwt', authToken: 'auth-jwt' });
    } finally {
      vi.doUnmock('@sdkwork/sdk-common');
      vi.doUnmock('@sdkwork/appstore-app-sdk');
      vi.resetModules();
    }
  });

  it('selects_the_mock_apps_port_without_a_gateway_and_the_appstore_port_with_one', async () => {
    const { createAppsClient } = await import('../src/bootstrap/sdkClients.js');
    const mockPort = createAppsClient(null);
    // The mock port serves the local feed offline.
    await expect(mockPort.listHomeFeed()).resolves.toHaveProperty('heroes');

    const getHome = vi.fn(async () => ({ featuredSlots: [], collections: [], charts: [] }));
    const storePort = createAppsClient({
      catalog: { getHome },
      wishlist: { listItems: vi.fn(), addItem: vi.fn(), removeItem: vi.fn() },
    } as never);
    await storePort.listHomeFeed();
    expect(getHome).toHaveBeenCalledTimes(1);
  });
});
