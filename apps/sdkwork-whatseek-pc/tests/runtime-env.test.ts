// Runtime-env source config contract (SOURCE_CONFIG_SPEC.md, H5 parity):
// the committed etc/browser sources stay identity-exact and secret-free —
// credential-bearing driver keys (IM + appstore bootstrap bridges) must be
// empty strings and no other value may carry secret-looking content.
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const appRoot = join(__dirname, '..');

function listProfiles(): string[] {
  // The committed profile set is small and static; enumerate explicitly.
  return ['development', 'staging', 'production', 'test'].map(
    (profile) => `etc/browser/runtime-env.standalone.${profile}.json`,
  );
}

describe('runtime-env source config (SOURCE_CONFIG_SPEC)', () => {
  it('keeps_runtime_env_sources_identity_exact_and_secret_free', () => {
    for (const file of listProfiles()) {
      const parsed = JSON.parse(
        readFileSync(join(appRoot, file), 'utf8'),
      ) as Record<string, unknown>;
      // Secret-free at the value level: the sdkwork-im / sdkwork-appstore
      // bootstrap session keys declare the bridges by name, but committed
      // sources never carry a minted credential — credential-bearing keys
      // must be empty strings and no other value may carry secret-looking
      // content (H5 `keeps_runtime_env_sources_identity_exact_and_secret_free`
      // parity).
      for (const [key, value] of Object.entries(parsed)) {
        if (/token|secret|password|apikey|api_key/iu.test(key)) {
          expect(value, `${file}:${key} must stay empty in committed sources`).toBe('');
        } else if (typeof value === 'string') {
          expect(value).not.toMatch(/token|secret|password|apikey|api_key/iu);
        }
      }
      expect(parsed.runtimeTarget).toBe('browser');
      expect(parsed.browserOriginMode).toBe('same-origin');
      expect(parsed.profileId).toBe(`standalone.${String(parsed.environment)}`);
    }
  });
});
