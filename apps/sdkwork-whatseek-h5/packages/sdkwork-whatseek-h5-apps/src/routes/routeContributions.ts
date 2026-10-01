import { defineWhatseekRoutes } from '@sdkwork/whatseek-h5-core';

import type { WhatseekRouteIdentity } from '@sdkwork/whatseek-h5-core';

/**
 * Route contributions of the apps capability (APP_H5_ARCHITECTURE_SPEC.md
 * §11). Ids follow `app.whatseek.<capability>.<screen>`; the apps home owns
 * the 应用 tab root.
 */
export const appsRouteContributions = defineWhatseekRoutes([
  {
    id: 'app.whatseek.apps.home',
    path: '/apps',
    titleKey: 'whatseek.apps.home.title',
    capability: 'apps',
    tab: 'apps',
  },
  {
    id: 'app.whatseek.apps.search',
    path: '/apps/search',
    titleKey: 'whatseek.apps.search.title',
    capability: 'apps',
    tab: null,
  },
  {
    id: 'app.whatseek.apps.detail',
    path: '/apps/detail/:appId',
    titleKey: 'whatseek.apps.detail.title',
    capability: 'apps',
    tab: null,
  },
  {
    id: 'app.whatseek.apps.runner',
    path: '/apps/runner/:appId',
    titleKey: 'whatseek.apps.runner.title',
    capability: 'apps',
    tab: null,
  },
  {
    id: 'app.whatseek.apps.create',
    path: '/apps/create',
    titleKey: 'whatseek.apps.create.title',
    capability: 'apps',
    tab: null,
  },
  {
    id: 'app.whatseek.apps.my',
    path: '/apps/my',
    titleKey: 'whatseek.apps.my.title',
    capability: 'apps',
    tab: null,
  },
] satisfies readonly WhatseekRouteIdentity[]);
