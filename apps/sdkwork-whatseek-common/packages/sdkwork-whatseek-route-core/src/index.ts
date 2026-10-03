/**
 * Public export boundary of `@sdkwork/whatseek-route-core` — the cross-surface
 * route identity contract (APP_CLIENT_ARCHITECTURE_ALIGNMENT_SPEC.md).
 */

export type { TabId } from './types.js';

export type { TabDefinition } from './tabs.js';
export { WHATSEEK_TABS } from './tabs.js';

export type { WhatseekRouteIdentity, WhatseekRouteIssue } from './routes.js';
export {
  composeWhatseekRouteTable,
  defineWhatseekRoutes,
  findTabRoute,
  partitionWhatseekRouteTable,
  routeIdentitiesForTest,
  validateWhatseekRouteTable,
} from './routes.js';
