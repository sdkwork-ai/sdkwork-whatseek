import { describe, expect, it } from 'vitest';

import { cx } from '../src/navigation/navStyles.js';
import { WHATSEEK_TABS } from '@sdkwork/whatseek-pc-core';

describe('desktop shell contract', () => {
  it('renders_navigation_from_the_five_cross_surface_tabs', () => {
    expect(WHATSEEK_TABS.map((tab) => tab.id)).toEqual(['chat', 'apps', 'contacts', 'messages', 'profile']);
  });

  it('joins_nav_classes_with_cx', () => {
    expect(cx('a', false, undefined, 'b')).toBe('a b');
  });
});
