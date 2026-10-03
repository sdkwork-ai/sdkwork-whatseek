/**
 * Route identity contract — ownership moved to the shared package family
 * (`@sdkwork/whatseek-route-core`, APP_CLIENT_ARCHITECTURE_ALIGNMENT_SPEC.md).
 * This module re-exports the contract so the h5-core public surface stays
 * stable for its consumers.
 */

export {
  composeWhatseekRouteTable,
  defineWhatseekRoutes,
  findTabRoute,
  partitionWhatseekRouteTable,
  routeIdentitiesForTest,
  validateWhatseekRouteTable,
  type WhatseekRouteIdentity,
  type WhatseekRouteIssue,
} from '@sdkwork/whatseek-route-core';
