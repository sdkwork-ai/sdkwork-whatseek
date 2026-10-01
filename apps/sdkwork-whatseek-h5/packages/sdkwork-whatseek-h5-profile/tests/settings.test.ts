import { describe, expect, it } from 'vitest';

import {
  COLOR_MODE_STORAGE_KEY,
  readStoredColorMode,
  readStoredLocale,
} from '@sdkwork/whatseek-h5-core';

import { useSettingsStore } from '../src/state/settingsStore.js';

describe('settings defaults without storage (node env)', () => {
  it('defaults_to_light_mode_and_zh_cn', () => {
    expect(readStoredColorMode()).toBe('light');
    expect(readStoredLocale()).toBe('zh-CN');
    expect(COLOR_MODE_STORAGE_KEY).toBe('whatseek.color-mode');
  });

  it('settings_store_starts_with_the_same_defaults', () => {
    const state = useSettingsStore.getState();
    expect(state.colorMode).toBe('light');
    expect(state.locale).toBe('zh-CN');
  });
});
