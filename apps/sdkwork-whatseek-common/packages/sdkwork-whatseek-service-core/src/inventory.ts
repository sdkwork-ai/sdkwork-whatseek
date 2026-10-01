/**
 * Runtime SDK client registry. Implementations are registered exactly once at
 * app bootstrap; screens and hooks read them through the typed accessors.
 * This keeps the UI → service → injected-client flow mandatory
 * (FRONTEND_CODE_SPEC.md §2) without hard-wiring mock clients into components.
 */

import type { WhatseekPortMap, WhatseekPortName } from './ports.js';

const registry = new Map<WhatseekPortName, unknown>();

export function registerWhatseekClient<K extends WhatseekPortName>(
  name: K,
  implementation: WhatseekPortMap[K],
): void {
  if (registry.has(name)) {
    throw new Error(`whatseek client already registered: ${name}`);
  }
  registry.set(name, implementation);
}

export function getWhatseekClient<K extends WhatseekPortName>(name: K): WhatseekPortMap[K] {
  const implementation = registry.get(name);
  if (!implementation) {
    throw new Error(
      `whatseek client not registered: ${name}. Register it in src/bootstrap/sdkClients.ts before rendering screens.`,
    );
  }
  return implementation as WhatseekPortMap[K];
}

/** Test-only: reset all registrations. */
export function resetWhatseekClients(): void {
  registry.clear();
}

export function hasWhatseekClient(name: WhatseekPortName): boolean {
  return registry.has(name);
}
