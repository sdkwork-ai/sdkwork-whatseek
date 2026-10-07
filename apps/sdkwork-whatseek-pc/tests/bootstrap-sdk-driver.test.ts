import { describe, expect, it, vi } from 'vitest';

import {
  FALLBACK_RUNTIME_ENVIRONMENT,
  type WhatseekRuntimeEnvironment,
} from '@sdkwork/whatseek-pc-core';

import {
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
          platform: 'pc',
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
    vi.doMock('@sdkwork/sdk-common', () => ({ createTokenManager: () => ({ setTokens }) }));
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
