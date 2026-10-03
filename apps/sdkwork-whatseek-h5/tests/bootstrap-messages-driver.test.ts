import { describe, expect, it, vi } from 'vitest';

import {
  FALLBACK_RUNTIME_ENVIRONMENT,
  type WhatseekRuntimeEnvironment,
} from '@sdkwork/whatseek-h5-core';

import { createMessagesClient } from '../src/bootstrap/sdkClients.js';

const imEnv: WhatseekRuntimeEnvironment = {
  ...FALLBACK_RUNTIME_ENVIRONMENT,
  sdkworkImApiBaseUrl: '/im/v3/api',
  sdkworkImWebSocketBaseUrl: 'wss://im.example.com',
};

describe('messages driver selection (bootstrap composition root)', () => {
  it('keeps_the_pull_based_mock_client_without_an_im_base_url', () => {
    const client = createMessagesClient(FALLBACK_RUNTIME_ENVIRONMENT);
    // The mock port has no `events` surface; the IM adapter always provides it.
    expect(client.events).toBeUndefined();
  });

  it('backs_the_port_with_the_realtime_im_adapter_when_a_base_url_is_declared', () => {
    const client = createMessagesClient(imEnv);
    expect(client.events).toBeDefined();
    expect(typeof client.listConversations).toBe('function');
  });

  it('constructs_the_im_client_once_with_token_manager_and_resolved_base_urls', async () => {
    const constructorSpy = vi.fn();
    vi.doMock('@sdkwork/im-sdk', () => ({
      ImSdkClient: class {
        constructor(options: unknown) {
          constructorSpy(options);
        }

        conversations = {};

        connect = vi.fn();
      },
    }));
    vi.resetModules();
    try {
      const { createMessagesClient: fresh } = await import('../src/bootstrap/sdkClients.js');
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

        connect = vi.fn();
      },
    }));
    vi.resetModules();
    try {
      const { createMessagesClient: fresh } = await import('../src/bootstrap/sdkClients.js');
      fresh({ ...FALLBACK_RUNTIME_ENVIRONMENT, sdkworkImApiBaseUrl: '/im/v3/api' });
      expect(constructorSpy).toHaveBeenCalledWith(
        expect.not.objectContaining({ websocketBaseUrl: expect.anything() }),
      );
    } finally {
      vi.doUnmock('@sdkwork/im-sdk');
      vi.resetModules();
    }
  });
});
