/**
 * Route identity contract (APP_H5_ARCHITECTURE_SPEC.md §11).
 *
 * Route ids follow `<surface>.<domain>.<capability>.<screen>`. Paths are
 * presentation-only metadata; they never carry API path constants. Capability
 * packages declare their contributions, the app root composes the final table.
 */

import type { TabId } from './types.js';

export interface WhatseekRouteIdentity {
  /** `<surface>.<domain>.<capability>.<screen>`, e.g. `app.whatseek.chat.home`. */
  id: string;
  /** In-app route path, e.g. `/chat`. */
  path: string;
  /** i18n title key, pattern `whatseek.<capability>.<screen>.title`. */
  titleKey: string;
  capability: string;
  /** Tab root this route activates, or null for secondary screens. */
  tab: TabId | null;
}

export interface WhatseekRouteIssue {
  routeId: string;
  issue: string;
}

const ROUTE_ID_PATTERN = /^app\.whatseek\.[a-z0-9-]+\.[a-z0-9-]+$/u;
const TITLE_KEY_PATTERN = /^whatseek\.[a-z0-9-]+\.[a-z0-9-]+\.title$/u;

export function defineWhatseekRoutes(routes: readonly WhatseekRouteIdentity[]): readonly WhatseekRouteIdentity[] {
  return routes;
}

/**
 * Compose the final route table from capability contributions and fail fast on
 * any contract violation. The app bootstrap calls this once; the route
 * alignment test asserts the same composition.
 */
export function composeWhatseekRouteTable(
  contributions: readonly (readonly WhatseekRouteIdentity[])[],
): readonly WhatseekRouteIdentity[] {
  const composed = contributions.flat();
  const issues = validateWhatseekRouteTable(composed);
  if (issues.length > 0) {
    const detail = issues.map((issue) => `${issue.routeId}: ${issue.issue}`).join('; ');
    throw new Error(`invalid whatseek route table: ${detail}`);
  }
  return composed;
}

/**
 * Validate a composed route table: id/title format, unique ids, unique paths,
 * and tab-root uniqueness. Exported so the route-alignment test and the app
 * bootstrap share one implementation.
 */
export function validateWhatseekRouteTable(routes: readonly WhatseekRouteIdentity[]): WhatseekRouteIssue[] {
  const issues: WhatseekRouteIssue[] = [];
  const seenIds = new Set<string>();
  const seenPaths = new Set<string>();
  const tabRoots = new Map<TabId, string>();
  for (const route of routes) {
    if (!ROUTE_ID_PATTERN.test(route.id)) {
      issues.push({ routeId: route.id, issue: `route id must match ${String(ROUTE_ID_PATTERN)}` });
    }
    if (!TITLE_KEY_PATTERN.test(route.titleKey)) {
      issues.push({ routeId: route.id, issue: `titleKey must match ${String(TITLE_KEY_PATTERN)}` });
    }
    if (!route.path.startsWith('/')) {
      issues.push({ routeId: route.id, issue: 'path must start with /' });
    }
    if (seenIds.has(route.id)) {
      issues.push({ routeId: route.id, issue: 'duplicate route id' });
    }
    if (seenPaths.has(route.path)) {
      issues.push({ routeId: route.id, issue: `duplicate route path ${route.path}` });
    }
    seenIds.add(route.id);
    seenPaths.add(route.path);
    if (route.tab !== null) {
      const existing = tabRoots.get(route.tab);
      if (existing) {
        issues.push({ routeId: route.id, issue: `tab ${route.tab} already owned by ${existing}` });
      } else {
        tabRoots.set(route.tab, route.id);
      }
    }
  }
  for (const tab of ['chat', 'apps', 'contacts', 'messages', 'profile'] as const) {
    if (!tabRoots.has(tab)) {
      issues.push({ routeId: `tab:${tab}`, issue: `bottom tab ${tab} has no root route` });
    }
  }
  return issues;
}

export function findTabRoute(routes: readonly WhatseekRouteIdentity[], tab: TabId): WhatseekRouteIdentity | undefined {
  return routes.find((route) => route.tab === tab);
}

/**
 * Split a composed route table by mobile presentation: `tabRoutes` render
 * inside the bottom-tab shell (tab bar visible), `stackRoutes` are secondary
 * screens presenting as a stack push without the tab bar. This partition is
 * the single source of truth for tab-bar visibility — the shell layout is
 * chosen from it at composition time, never per-screen.
 */
export function partitionWhatseekRouteTable(routes: readonly WhatseekRouteIdentity[]): {
  tabRoutes: readonly WhatseekRouteIdentity[];
  stackRoutes: readonly WhatseekRouteIdentity[];
} {
  const tabRoutes: WhatseekRouteIdentity[] = [];
  const stackRoutes: WhatseekRouteIdentity[] = [];
  for (const route of routes) {
    (route.tab === null ? stackRoutes : tabRoutes).push(route);
  }
  return { tabRoutes, stackRoutes };
}

export function routeIdentitiesForTest(routes: readonly WhatseekRouteIdentity[]): string[] {
  return routes.map((route) => route.id);
}
