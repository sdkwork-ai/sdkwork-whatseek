/**
 * Browser runtime environment (SOURCE_CONFIG_SPEC.md, ENVIRONMENT_SPEC §5.1).
 * The deploy-time `/runtime-env.json` document is materialized per build by
 * the canonical build runner; this loader parses and validates its identity.
 */

export interface WhatseekRuntimeEnvironment {
  environment: string;
  deploymentProfile: string;
  profileId: string;
  runtimeTarget: 'browser';
  browserOriginMode: 'same-origin' | 'cross-origin';
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
   * until the IAM login runtime lands on this surface (APP_SDK_INTEGRATION_SPEC.md
   * §4): tokens come from the gateway's own IAM credential-entry surface
   * (`POST /app/v3/api/auth/sessions`). Empty (all committed profiles) starts
   * the session empty — the gateway rejects unauthenticated calls.
   */
  sdkworkImBootstrapAccessToken?: string;
  /** Dual-token auth half paired with `sdkworkImBootstrapAccessToken`. */
  sdkworkImBootstrapAuthToken?: string;
}

export const FALLBACK_RUNTIME_ENVIRONMENT: WhatseekRuntimeEnvironment = {
  environment: 'development',
  deploymentProfile: 'standalone',
  profileId: 'standalone.development',
  runtimeTarget: 'browser',
  browserOriginMode: 'same-origin',
};

function isOptionalString(value: unknown): boolean {
  return typeof value === 'undefined' || typeof value === 'string';
}

function isRuntimeEnvironment(value: unknown): value is WhatseekRuntimeEnvironment {
  if (typeof value !== 'object' || value === null) {
    return false;
  }
  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate.environment === 'string' &&
    typeof candidate.deploymentProfile === 'string' &&
    typeof candidate.profileId === 'string' &&
    candidate.runtimeTarget === 'browser' &&
    (candidate.browserOriginMode === 'same-origin' || candidate.browserOriginMode === 'cross-origin') &&
    isOptionalString(candidate.sdkworkImApiBaseUrl) &&
    isOptionalString(candidate.sdkworkImWebSocketBaseUrl) &&
    isOptionalString(candidate.sdkworkImBootstrapAccessToken) &&
    isOptionalString(candidate.sdkworkImBootstrapAuthToken)
  );
}

/**
 * Load `/runtime-env.json`; falls back to standalone.development when the
 * document is absent (raw `vite` dev server without materialization).
 */
export async function loadRuntimeEnvironment(): Promise<WhatseekRuntimeEnvironment> {
  if (typeof fetch !== 'function') {
    return FALLBACK_RUNTIME_ENVIRONMENT;
  }
  try {
    const response = await fetch('/runtime-env.json', { cache: 'no-store' });
    if (!response.ok) {
      return FALLBACK_RUNTIME_ENVIRONMENT;
    }
    const value: unknown = await response.json();
    return isRuntimeEnvironment(value) ? value : FALLBACK_RUNTIME_ENVIRONMENT;
  } catch {
    return FALLBACK_RUNTIME_ENVIRONMENT;
  }
}
