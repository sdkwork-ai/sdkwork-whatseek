// One-shot root README updater for the multi-surface layout.
import { readFileSync, writeFileSync } from 'node:fs';

let readme = readFileSync('README.md', 'utf8');

readme = readme.replace(
  '| `apps/` | Application roots. `apps/sdkwork-whatseek-h5/` is the primary runnable surface. |',
  '| `apps/` | Application roots: `sdkwork-whatseek-common` (shared contracts/ports), `sdkwork-whatseek-h5` (primary mobile-first H5), `sdkwork-whatseek-pc` (desktop-class PC + Tauri desktop shell), `sdkwork-whatseek-mini-program` (WeChat), `sdkwork-whatseek-flutter-mobile` (iOS/Android). |',
);

readme = readme.replace(
  '- Primary surface: `apps/sdkwork-whatseek-h5/` (mobile-first H5)',
  '- Primary surface: `apps/sdkwork-whatseek-h5/` (mobile-first H5), aligned with the PC (browser + Tauri desktop), WeChat mini-program, and Flutter mobile surfaces',
);

readme = readme.replace(
  '- H5 packages: `sdkwork-whatseek-h5-core`, `sdkwork-whatseek-h5-commons`, `sdkwork-whatseek-h5-shell`, `sdkwork-whatseek-h5-<capability>`',
  '- H5 packages: `sdkwork-whatseek-h5-core`, `sdkwork-whatseek-h5-commons`, `sdkwork-whatseek-h5-shell`, `sdkwork-whatseek-h5-<capability>`\n- PC packages: `sdkwork-whatseek-pc-<role>`; mini-program packages: `sdkwork-whatseek-mp-<capability>`; Flutter packages: `sdkwork_whatseek_flutter_mobile_<capability>`\n- Shared (cross-architecture): `sdkwork-whatseek-route-core`, `sdkwork-whatseek-intent-core`, `sdkwork-whatseek-service-core` under `apps/sdkwork-whatseek-common/packages/`',
);

writeFileSync('README.md', readme);
console.log('root README updated');
