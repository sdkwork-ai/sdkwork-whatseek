import { defineWhatseekRoutes } from '@sdkwork/whatseek-h5-core';

import type { WhatseekRouteIdentity } from '@sdkwork/whatseek-h5-core';

/** Route contributions of the profile capability; owns the profile tab root. */
export const profileRouteContributions = defineWhatseekRoutes([
  {
    id: "app.whatseek.profile.home",
    path: "/profile",
    titleKey: "whatseek.profile.home.title",
    capability: "profile",
    tab: "profile",
  },
  {
    id: "app.whatseek.profile.settings",
    path: "/settings",
    titleKey: "whatseek.profile.settings.title",
    capability: "profile",
    tab: null,
  },
] satisfies readonly WhatseekRouteIdentity[]);
