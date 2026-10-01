import { describe, expect, it } from 'vitest';

import {
  composeWhatseekRouteTable,
  defineWhatseekRoutes,
  validateWhatseekRouteTable,
} from '../src/routes/identity.js';
import { WHATSEEK_TABS } from '../src/routes/tabs.js';

describe('route identity contract', () => {
  it('rejects_route_ids_that_do_not_follow_the_surface_domain_capability_screen_pattern', () => {
    const issues = validateWhatseekRouteTable([
      { id: 'chat.home', path: '/chat', titleKey: 'whatseek.chat.home.title', capability: 'chat', tab: 'chat' },
    ]);
    expect(issues.some((issue) => issue.issue.includes('route id'))).toBe(true);
  });

  it('rejects_title_keys_that_do_not_follow_the_whatseek_capability_screen_title_pattern', () => {
    const issues = validateWhatseekRouteTable([
      { id: 'app.whatseek.chat.home', path: '/chat', titleKey: 'chat.title', capability: 'chat', tab: 'chat' },
    ]);
    expect(issues.some((issue) => issue.issue.includes('titleKey'))).toBe(true);
  });

  it('flags_duplicate_paths_and_duplicate_tab_roots', () => {
    const routes = defineWhatseekRoutes([
      { id: 'app.whatseek.chat.home', path: '/chat', titleKey: 'whatseek.chat.home.title', capability: 'chat', tab: 'chat' },
      { id: 'app.whatseek.apps.home', path: '/chat', titleKey: 'whatseek.apps.home.title', capability: 'apps', tab: 'chat' },
    ]);
    const issues = validateWhatseekRouteTable(routes);
    expect(issues.some((issue) => issue.issue.includes('duplicate route path'))).toBe(true);
    expect(issues.some((issue) => issue.issue.includes('already owned by'))).toBe(true);
  });

  it('requires_a_root_route_for_every_bottom_tab', () => {
    const issues = validateWhatseekRouteTable([
      { id: 'app.whatseek.chat.home', path: '/chat', titleKey: 'whatseek.chat.home.title', capability: 'chat', tab: 'chat' },
    ]);
    for (const tab of ['apps', 'contacts', 'messages', 'profile'] as const) {
      expect(issues.some((issue) => issue.routeId === `tab:${tab}`)).toBe(true);
    }
  });

  it('composes_a_complete_five_tab_table_without_issues', () => {
    const routes = composeWhatseekRouteTable([
      WHATSEEK_TABS.map((tab) => ({
        id: `app.whatseek.shell.${tab.id}`,
        path: tab.path,
        titleKey: `whatseek.shell.${tab.id}.title`,
        capability: 'shell',
        tab: tab.id,
      })),
    ]);
    expect(routes).toHaveLength(5);
  });

  it('throws_when_the_composed_table_breaks_the_contract', () => {
    expect(() =>
      composeWhatseekRouteTable([
        [
          { id: 'app.whatseek.chat.home', path: '/chat', titleKey: 'whatseek.chat.home.title', capability: 'chat', tab: 'chat' },
          { id: 'app.whatseek.apps.home', path: '/chat', titleKey: 'whatseek.apps.home.title', capability: 'apps', tab: 'apps' },
        ],
      ]),
    ).toThrowError(/invalid whatseek route table/u);
  });
});
