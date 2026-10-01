import { defineWhatseekRoutes } from '@sdkwork/whatseek-h5-core';

import type { WhatseekRouteIdentity } from '@sdkwork/whatseek-h5-core';

/** Route contributions of the contacts capability; owns the contacts tab root. */
export const contactsRouteContributions = defineWhatseekRoutes([
  {
    id: "app.whatseek.contacts.home",
    path: "/contacts",
    titleKey: "whatseek.contacts.home.title",
    capability: "contacts",
    tab: "contacts",
  },
  {
    id: "app.whatseek.contacts.detail",
    path: "/contacts/:contactId",
    titleKey: "whatseek.contacts.detail.title",
    capability: "contacts",
    tab: null,
  },
] satisfies readonly WhatseekRouteIdentity[]);
