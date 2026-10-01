/**
 * Route identity contract — ownership lives in the shared package family
 * (`@sdkwork/whatseek-route-core`); re-exported for pc-core consumers.
 */

export {
  composeWhatseekRouteTable,
  defineWhatseekRoutes,
  findTabRoute,
  routeIdentitiesForTest,
  validateWhatseekRouteTable,
  type WhatseekRouteIdentity,
  type WhatseekRouteIssue,
} from '@sdkwork/whatseek-route-core';
