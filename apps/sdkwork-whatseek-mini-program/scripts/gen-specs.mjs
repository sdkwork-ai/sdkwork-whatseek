// One-shot generator for mini-program specs and manifests (node scripts/gen-specs.mjs).
import { writeFileSync } from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const base = path.join(process.cwd(), 'src').replace(/src$/, '');

function pkgSpec(name) {
  return {
    schemaVersion: 1,
    kind: 'sdkwork.component.spec',
    component: {
      name: '@sdkwork/whatseek-mp-' + name,
      displayName: 'WhatSeek MP ' + name,
      version: '0.1.0',
      type: 'react-package',
      root: 'apps/sdkwork-whatseek-mini-program/packages/sdkwork-whatseek-mp-' + name,
      domain: 'whatseek',
      capability: name,
      surface: 'app',
      languages: ['typescript'],
      generated: false,
      manifests: ['package.json'],
    },
    canonicalSpecs: [
      { file: 'CODE_STYLE_SPEC.md', path: '../../../../../sdkwork-specs/CODE_STYLE_SPEC.md', purpose: 'Cross-language code style authority.' },
      { file: 'NAMING_SPEC.md', path: '../../../../../sdkwork-specs/NAMING_SPEC.md', purpose: 'Mini-program package naming lattice.' },
      { file: 'MINI_PROGRAM_APP_ARCHITECTURE_SPEC.md', path: '../../../../../sdkwork-specs/MINI_PROGRAM_APP_ARCHITECTURE_SPEC.md', purpose: 'Mini-program architecture authority.' },
      { file: 'APP_MINI_PROGRAM_UI_SPEC.md', path: '../../../../../sdkwork-specs/APP_MINI_PROGRAM_UI_SPEC.md', purpose: 'Mini-program UI package organization.' },
    ],
    contracts: {
      layerRole: 'frontend-feature',
      publicExports: ['.'],
      providedPorts: [],
      requiredPorts:
        name === 'core' ? [] : [{ name: 'whatseekSdkInventory', provider: '@sdkwork/whatseek-mp-core', export: '.' }],
      runtimeEntrypoints: ['package.json#main'],
      routeManifest: null,
      sdkClients: [],
      sdkDependencies: [],
      permissionComposition: {},
      dependencyApiExports: [],
      dependencyApiSurfaces: [],
      events: [],
      configKeys: [],
    },
    verification: { commands: ['pnpm --filter sdkwork-whatseek-mini-program typecheck'] },
  };
}

for (const name of ['core', 'commons', 'shell', 'chat', 'apps', 'contacts', 'messages', 'profile']) {
  writeFileSync(
    path.join(base, 'packages', 'sdkwork-whatseek-mp-' + name, 'specs', 'component.spec.json'),
    JSON.stringify(pkgSpec(name), null, 2) + '\n',
  );
}

const root = {
  schemaVersion: 1,
  kind: 'sdkwork.component.spec',
  component: {
    name: 'sdkwork-whatseek-mini-program',
    displayName: 'WhatSeek Mini Program',
    version: '0.1.0',
    type: 'mini-program-app-root',
    root: 'apps/sdkwork-whatseek-mini-program',
    domain: 'whatseek',
    capability: 'super-app',
    surface: 'app',
    languages: ['typescript'],
    status: 'DRAFT',
    manifests: ['package.json', 'sdkwork.app.config.json', 'project.config.json', 'specs/component.spec.json'],
  },
  canonicalSpecs: [
    { file: 'APPLICATION_SPEC.md', path: '../../../sdkwork-specs/APPLICATION_SPEC.md', purpose: 'Application-wide contract for owned application roots.' },
    { file: 'APP_MANIFEST_SPEC.md', path: '../../../sdkwork-specs/APP_MANIFEST_SPEC.md', purpose: 'App manifest authority.' },
    { file: 'FRONTEND_SPEC.md', path: '../../../sdkwork-specs/FRONTEND_SPEC.md', purpose: 'Frontend architecture baseline.' },
    { file: 'UI_ARCHITECTURE_SPEC.md', path: '../../../sdkwork-specs/UI_ARCHITECTURE_SPEC.md', purpose: 'UI architecture manifest requirements.' },
    { file: 'APP_CLIENT_ARCHITECTURE_ALIGNMENT_SPEC.md', path: '../../../sdkwork-specs/APP_CLIENT_ARCHITECTURE_ALIGNMENT_SPEC.md', purpose: 'Cross-client architecture alignment.' },
    { file: 'MINI_PROGRAM_APP_ARCHITECTURE_SPEC.md', path: '../../../sdkwork-specs/MINI_PROGRAM_APP_ARCHITECTURE_SPEC.md', purpose: 'Mini-program architecture authority for this root.' },
    { file: 'CONFIG_SPEC.md', path: '../../../sdkwork-specs/CONFIG_SPEC.md', purpose: 'Typed runtime config contract.' },
    { file: 'DEPLOYMENT_SPEC.md', path: '../../../sdkwork-specs/DEPLOYMENT_SPEC.md', purpose: 'Deployment baseline.' },
    { file: 'TEST_SPEC.md', path: '../../../sdkwork-specs/TEST_SPEC.md', purpose: 'Verification requirements.' },
  ],
  contracts: {
    layerRole: 'frontend-shell',
    publicExports: ['src/app.js'],
    providedPorts: [],
    requiredPorts: [],
    runtimeEntrypoints: ['package.json#scripts.build'],
    routeManifest: null,
    sdkClients: [],
    sdkDependencies: [],
    permissionComposition: {},
    dependencyApiExports: [],
    dependencyApiSurfaces: [],
    events: [],
    configKeys: ['etc/sdkwork.deployment.config.json'],
  },
  verification: { commands: ['pnpm typecheck', 'pnpm test', 'pnpm build'] },
};
writeFileSync(path.join(base, 'specs', 'component.spec.json'), JSON.stringify(root, null, 2) + '\n');
writeFileSync(
  path.join(base, 'specs', 'README.md'),
  '# specs/\n\nMachine contracts for the mini-program app root. `component.spec.json` is the app-root manifest (`mini-program-app-root`); capability packages own their own `specs/`.\n',
);

const appManifest = {
  schemaVersion: 3,
  kind: 'sdkwork.app',
  app: {
    key: 'sdkwork-whatseek-mini-program',
    name: 'WhatSeek Mini Program',
    displayName: '问寻 WhatSeek 小程序',
    description: 'WhatSeek (问寻) AI-native super app WeChat mini-program client.',
    vendor: 'SDKWork',
    appType: 'APP_REACT',
    versionSource: 'package.json',
    identifiers: { weixinAppId: 'touristappid' },
  },
  backend: {
    profileKey: 'backend-root-admin',
    ownerMode: 'tenant',
    grantMode: 'current',
    platform: 'MP_WEIXIN',
    appId: 'sdkwork-whatseek-mini-program',
    organizationId: '0',
    tenantId: '100001',
    accessTokenPermissionScope: ['iam:self'],
  },
  runtime: {
    family: 'mini-program',
    framework: 'weixin-mini-program',
    runtimes: ['MP_WEIXIN'],
    deliveryModes: ['MP_WEIXIN'],
    defaultPlatform: 'MP_WEIXIN',
    defaultArchitecture: 'universal',
    supportedDeploymentProfiles: ['standalone'],
    defaultDeploymentProfile: 'standalone',
  },
  media: {
    icons: {
      primary: {
        id: 'sdkwork-whatseek-mp-primary-icon',
        type: 'ICON',
        purpose: 'PRIMARY',
        platform: 'MP_WEIXIN',
        format: 'PNG',
        width: 1024,
        height: 1024,
        enabled: true,
        url: 'https://cdn.sdkwork.com/apps/sdkwork-whatseek/assets/icon-1024.png',
        metadata: { generatedPlaceholder: true },
      },
      platform: [],
    },
    screenshots: [],
    previews: [],
  },
  publish: { status: 'DRAFT', platforms: ['MP_WEIXIN'], installPlatforms: ['MP_WEIXIN'], installSkill: false },
  artifacts: { installConfig: { packages: [] } },
  release: {
    currentVersion: '0.1.0',
    defaultChannel: 'BETA',
    latest: { BETA: '0.1.0' },
    notes: [{ version: '0.1.0', channel: 'BETA', current: true, packageIds: [] }],
  },
  security: { checksumRequired: true, signatureRequired: true, sbomRequired: true },
  devApp: { sourceRoot: 'apps/sdkwork-whatseek-mini-program', build: { targets: ['mini-program'] } },
  metadata: {
    domain: 'whatseek',
    capability: 'super-app',
    standardOwner: 'sdkwork-whatseek',
    deploymentConfig: 'etc/sdkwork.deployment.config.json',
  },
};
writeFileSync(path.join(base, 'sdkwork.app.config.json'), JSON.stringify(appManifest, null, 2) + '\n');

const etcConfig = {
  schemaVersion: 1,
  kind: 'sdkwork.component-deployment',
  application: 'sdkwork-whatseek-mini-program',
  parentDeploymentConfig: '../../../etc/sdkwork.deployment.config.json',
  parentTopologySpec: '../../../specs/topology.spec.json',
  profiles: {
    'standalone.development': { source: 'config/mini-program/runtime-env.standalone.development.json' },
    'standalone.test': { source: 'config/mini-program/runtime-env.standalone.test.json' },
    'standalone.staging': { source: 'config/mini-program/runtime-env.standalone.staging.json' },
    'standalone.production': { source: 'config/mini-program/runtime-env.standalone.production.json' },
  },
  runtimeTarget: 'mini-program',
};
writeFileSync(path.join(base, 'etc', 'sdkwork.deployment.config.json'), JSON.stringify(etcConfig, null, 2) + '\n');
writeFileSync(
  path.join(base, 'etc', 'README.md'),
  '# etc/ — Source Configuration (apps/sdkwork-whatseek-mini-program)\n\nSource configuration for the WhatSeek WeChat mini-program deployable root. Authority: `../../../sdkwork-specs/SOURCE_CONFIG_SPEC.md`.\n\n- Profile index: `sdkwork.deployment.config.json` (`kind: sdkwork.component-deployment`) mapping each standalone profile to its mini-program runtime source.\n- Runtime sources: `../config/mini-program/runtime-env.<profileId>.json` (`runtimeTarget: "mini-program"`), consumed by `scripts/build-runtime.mjs` which injects them into the bundled runtime document.\n- Standalone-only milestone; cloud profiles arrive with Phase 2 platform wiring.\n',
);
console.log('mp specs + manifests written');
