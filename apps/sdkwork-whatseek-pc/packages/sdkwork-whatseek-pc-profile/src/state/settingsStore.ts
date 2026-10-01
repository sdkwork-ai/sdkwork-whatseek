/**
 * User settings (theme color mode + locale), persisted to localStorage.
 * Switching applies the theme via the core color-mode utilities and the
 * locale via the core i18n instance — single ownership, no remount
 * (THEME_DARKMODE_SPEC.md §3, I18N_SPEC.md §7).
 */

import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import {
  applyColorMode,
  changeWhatseekLocale,
  readStoredColorMode,
  readStoredLocale,
  type ColorMode,
  type WhatseekLocale,
} from '@sdkwork/whatseek-pc-core';

interface SettingsState {
  colorMode: ColorMode;
  locale: WhatseekLocale;
  setColorMode: (mode: ColorMode) => void;
  toggleColorMode: () => void;
  setLocale: (locale: WhatseekLocale) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      colorMode: readStoredColorMode(),
      locale: readStoredLocale(),
      setColorMode: (mode) => {
        applyColorMode(mode);
        set({ colorMode: mode });
      },
      toggleColorMode: () => {
        const next: ColorMode = get().colorMode === 'dark' ? 'light' : 'dark';
        applyColorMode(next);
        set({ colorMode: next });
      },
      setLocale: (locale) => {
        void changeWhatseekLocale(locale);
        set({ locale });
      },
    }),
    {
      name: 'whatseek.settings',
      storage: createJSONStorage(() => globalThis.localStorage),
      partialize: (state) => ({ colorMode: state.colorMode, locale: state.locale }),
    },
  ),
);
