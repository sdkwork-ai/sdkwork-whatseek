/**
 * Route alignment guard (appstore-pattern): every composed route identity
 * must be mounted in App with an element, and the composition contract must
 * hold. Path strings stay presentation-only.
 */

import { describe, expect, it } from 'vitest';

import { listWhatseekRouteIdentities, whatseekRouteElements, whatseekRouteTable } from '../src/bootstrap/routes.js';
import { partitionWhatseekRouteTable, validateWhatseekRouteTable, WHATSEEK_TABS } from '@sdkwork/whatseek-h5-core';

describe('whatseek route table', () => {
  it('passes_the_canonical_route_composition_contract', () => {
    expect(validateWhatseekRouteTable(whatseekRouteTable)).toEqual([]);
  });

  it('mounts_exactly_one_route_element_for_every_identity', () => {
    const identities = listWhatseekRouteIdentities();
    for (const id of identities) {
      expect(whatseekRouteElements[id], `missing element for ${id}`).toBeDefined();
    }
    expect(Object.keys(whatseekRouteElements).sort()).toEqual([...identities].sort());
  });

  it('owns_exactly_five_tab_roots_matching_the_bottom_navigation', () => {
    const tabRoots = whatseekRouteTable.filter((route) => route.tab !== null);
    expect(tabRoots.map((route) => route.tab)).toEqual(WHATSEEK_TABS.map((tab) => tab.id));
    expect(tabRoots.map((route) => route.path)).toEqual(WHATSEEK_TABS.map((tab) => tab.path));
  });

  it('partitions_the_table_so_only_tab_roots_present_with_the_tab_bar', () => {
    const { tabRoutes, stackRoutes } = partitionWhatseekRouteTable(whatseekRouteTable);
    expect(tabRoutes.map((route) => route.tab)).toEqual(WHATSEEK_TABS.map((tab) => tab.id));
    expect(tabRoutes.map((route) => route.path)).toEqual(WHATSEEK_TABS.map((tab) => tab.path));
    expect(tabRoutes.length + stackRoutes.length).toBe(whatseekRouteTable.length);
    for (const route of stackRoutes) {
      expect(route.tab, `stack route ${route.id} must declare tab: null`).toBeNull();
    }
  });

  it('declares_chat_as_the_default_tab_root', () => {
    const chatRoot = whatseekRouteTable.find((route) => route.tab === 'chat');
    expect(chatRoot?.path).toBe('/chat');
  });

  it('uses_only_whatseek_capability_tokens_in_route_ids', () => {
    for (const route of whatseekRouteTable) {
      expect(route.id).toMatch(/^app\.whatseek\.[a-z0-9-]+\.[a-z0-9-]+$/u);
      expect(route.capability).toBe(route.id.split('.')[2]);
    }
  });
});
