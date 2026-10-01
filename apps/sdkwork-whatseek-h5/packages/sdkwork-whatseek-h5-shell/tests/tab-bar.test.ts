import { describe, expect, it } from 'vitest';

import { cx } from '../src/navigation/tabStyles.js';
import { WHATSEEK_TABS } from '@sdkwork/whatseek-h5-core';

describe('shell tab styles', () => {
  it('joins_only_truthy_classes', () => {
    expect(cx('a', false, undefined, 'b')).toBe('a b');
  });
});

describe('bottom navigation contract (PRD §7)', () => {
  it('declares_exactly_five_tabs_with_chat_first', () => {
    expect(WHATSEEK_TABS.map((tab) => tab.id)).toEqual(['chat', 'apps', 'contacts', 'messages', 'profile']);
  });

  it('declares_unique_tab_paths_starting_with_slash', () => {
    const paths = WHATSEEK_TABS.map((tab) => tab.path);
    expect(new Set(paths).size).toBe(paths.length);
    for (const tab of WHATSEEK_TABS) {
      expect(tab.path.startsWith('/')).toBe(true);
    }
  });
});
