/**
 * Public export boundary of `@sdkwork/whatseek-mp-core` — mini-program
 * bootstrap: SDK client registration (shared mock clients from the common
 * service family) and the typed host-adapter port the bootstrap layer binds
 * to `wx.*` (MINI_PROGRAM_APP_ARCHITECTURE_SPEC.md §Host adapters: capability
 * packages never call `wx.*` directly).
 */

import {
  createMockAppsClient,
  createMockChatClient,
  createMockContactsClient,
  createMockMessagesClient,
  createMockTasksClient,
  registerWhatseekClient,
  resetWhatseekClients,
} from '@sdkwork/whatseek-service-core';

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
 * Register the standalone mock clients once per runtime bundle. Phase 2 swaps
 * these registrations for generated app-SDK clients bound to the WeChat
 * request host adapter — the ports stay identical.
 */
export function bootstrapMiniProgramClients(): void {
  resetWhatseekClients();
  const apps = createMockAppsClient();
  const contacts = createMockContactsClient();
  const messages = createMockMessagesClient();
  const tasks = createMockTasksClient();
  const chat = createMockChatClient({ apps, contacts, messages, tasks });
  registerWhatseekClient('apps', apps);
  registerWhatseekClient('contacts', contacts);
  registerWhatseekClient('messages', messages);
  registerWhatseekClient('tasks', tasks);
  registerWhatseekClient('chat', chat);
}
