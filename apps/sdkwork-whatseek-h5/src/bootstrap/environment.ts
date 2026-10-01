/**
 * Runtime environment bootstrap. The canonical browser build materializes
 * `/runtime-env.json` from `etc/browser/` before Vite runs; this loader reads
 * it once and falls back to standalone.development for raw dev servers.
 */

import {
  FALLBACK_RUNTIME_ENVIRONMENT,
  loadRuntimeEnvironment,
  type WhatseekRuntimeEnvironment,
} from '@sdkwork/whatseek-h5-core';

let cached: WhatseekRuntimeEnvironment | null = null;

export async function bootstrapEnvironment(): Promise<WhatseekRuntimeEnvironment> {
  if (cached !== null) {
    return cached;
  }
  cached = await loadRuntimeEnvironment();
  if (cached !== FALLBACK_RUNTIME_ENVIRONMENT) {
    // eslint-disable-next-line no-console
    console.info(`[whatseek] runtime profile ${cached.profileId} (${cached.browserOriginMode})`);
  }
  return cached;
}

export function currentRuntimeEnvironment(): WhatseekRuntimeEnvironment {
  return cached ?? FALLBACK_RUNTIME_ENVIRONMENT;
}
