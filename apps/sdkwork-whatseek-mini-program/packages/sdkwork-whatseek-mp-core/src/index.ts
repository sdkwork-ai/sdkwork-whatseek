/**
 * Public export boundary of `@sdkwork/whatseek-mp-core` — mini-program
 * bootstrap: SDK client registration (shared mock clients from the common
 * service family, with optional IM-driver port overrides) and the typed
 * host-adapter ports the bootstrap layer binds to `wx.*`
 * (MINI_PROGRAM_APP_ARCHITECTURE_SPEC.md §Host adapters: capability packages
 * never call `wx.*` directly).
 */

import {
  createMockAppsClient,
  createMockChatClient,
  createMockContactsClient,
  createMockMessagesClient,
  createMockTasksClient,
  registerWhatseekClient,
  resetWhatseekClients,
  type ContactsPort,
  type MessagesPort,
} from '@sdkwork/whatseek-service-core';

export {
  createMiniProgramFetch,
  createMiniProgramWebSocketFactory,
  installMiniProgramFetchPolyfill,
  type MiniProgramRequestPort,
  type MiniProgramRequestTaskPort,
  type MiniProgramSocketTaskPort,
  type MiniProgramWebSocketPort,
} from './transport/miniProgramTransports.js';

/** Navigation + storage surface the pages need, bound to `wx.*` at bootstrap. */
export interface MiniProgramHostPort {
  navigateTo(url: string): void;
  switchTab(url: string): void;
  showToast(title: string): void;
}

let hostPort: MiniProgramHostPort | null = null;

export function bindMiniProgramHost(port: MiniProgramHostPort): void {
  hostPort = port;
}

export function getMiniProgramHost(): MiniProgramHostPort {
  if (hostPort === null) {
    throw new Error('mini-program host not bound; call bindMiniProgramHost in bootstrap/runtime.ts');
  }
  return hostPort;
}

export interface MiniProgramRuntimeConfig {
  profileId: string;
  environment: string;
  deploymentProfile: string;
  appApiBaseUrl: string;
  /**
   * sdkwork-im driver (messages + contacts capabilities): same-origin
   * `/im/v3/api` path when an IM gateway is mounted, absolute URL for explicit
   * topology overrides. Empty/absent keeps the mock clients (standalone
   * milestone default).
   */
  sdkworkImApiBaseUrl?: string;
  /** Explicit CCP websocket base URL; derived by the SDK when absent. */
  sdkworkImWebSocketBaseUrl?: string;
  /**
   * Pre-minted IAM session for the composed IM client's shared TokenManager
   * (dual-token headers `Access-Token`/`Auth-Token`). Dev/operator bridge
   * until the IAM login runtime lands on this surface: tokens come from the
   * gateway's own IAM credential-entry surface (`POST /app/v3/api/auth/sessions`).
   * Empty (all committed profiles) starts the session empty — the gateway
   * rejects unauthenticated calls.
   */
  sdkworkImBootstrapAccessToken?: string;
  /** Dual-token auth half paired with `sdkworkImBootstrapAccessToken`. */
  sdkworkImBootstrapAuthToken?: string;
}

let runtimeConfig: MiniProgramRuntimeConfig | null = null;

export function bindRuntimeConfig(config: MiniProgramRuntimeConfig): void {
  runtimeConfig = config;
}

export function getRuntimeConfig(): MiniProgramRuntimeConfig {
  if (runtimeConfig === null) {
    throw new Error('runtime config not bound; build the runtime bundle with scripts/build-runtime.mjs');
  }
  return runtimeConfig;
}

/**
 * Register the standalone client family once per runtime bundle. Without
 * overrides every port stays on the shared mock clients; the composition root
 * (`src/bootstrap/runtime.ts`) passes IM-backed ports when the runtime config
 * declares an sdkwork-im gateway — the ports stay identical.
 */
export function bootstrapMiniProgramClients(
  overrides: { contacts?: ContactsPort; messages?: MessagesPort } = {},
): void {
  resetWhatseekClients();
  const apps = createMockAppsClient();
  const contacts = overrides.contacts ?? createMockContactsClient();
  const messages = overrides.messages ?? createMockMessagesClient();
  const tasks = createMockTasksClient();
  const chat = createMockChatClient({ apps, contacts, messages, tasks });
  registerWhatseekClient('apps', apps);
  registerWhatseekClient('contacts', contacts);
  registerWhatseekClient('messages', messages);
  registerWhatseekClient('tasks', tasks);
  registerWhatseekClient('chat', chat);
}
