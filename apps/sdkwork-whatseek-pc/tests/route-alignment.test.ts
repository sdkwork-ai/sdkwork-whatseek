import { describe, expect, it } from 'vitest';

import { listWhatseekPcRouteIdentities, whatseekPcRouteElements, whatseekPcRouteTable } from '../src/bootstrap/routes.js';
import { validateWhatseekRouteTable, WHATSEEK_TABS } from '@sdkwork/whatseek-pc-core';

/** Route ids are the cross-surface contract (H5/PC/mini-program/Flutter aligned). */
const CROSS_SURFACE_ROUTE_IDS = [
  'app.whatseek.chat.home',
  'app.whatseek.apps.home',
  'app.whatseek.apps.search',
  'app.whatseek.apps.detail',
  'app.whatseek.apps.charts',
  'app.whatseek.apps.collection',
  'app.whatseek.apps.runner',
  'app.whatseek.apps.create',
  'app.whatseek.apps.my',
  'app.whatseek.contacts.home',
  'app.whatseek.contacts.detail',
  'app.whatseek.messages.home',
  'app.whatseek.messages.conversation',
  'app.whatseek.profile.home',
  'app.whatseek.profile.settings',
].sort();

describe('whatseek pc route table', () => {
  it('passes_the_canonical_route_composition_contract', () => {
    expect(validateWhatseekRouteTable(whatseekPcRouteTable)).toEqual([]);
  });

  it('mounts_exactly_one_route_element_for_every_identity', () => {
    const identities = listWhatseekPcRouteIdentities();
    for (const id of identities) {
      expect(whatseekPcRouteElements[id], `missing element for ${id}`).toBeDefined();
    }
    expect(Object.keys(whatseekPcRouteElements).sort()).toEqual([...identities].sort());
  });

  it('uses_the_same_route_ids_as_every_other_surface', () => {
    expect(listWhatseekPcRouteIdentities().sort()).toEqual(CROSS_SURFACE_ROUTE_IDS);
  });

  it('owns_exactly_five_tab_roots_matching_the_navigation_rail', () => {
    const tabRoots = whatseekPcRouteTable.filter((route) => route.tab !== null);
    expect(tabRoots.map((route) => route.tab)).toEqual(WHATSEEK_TABS.map((tab) => tab.id));
  });
});
