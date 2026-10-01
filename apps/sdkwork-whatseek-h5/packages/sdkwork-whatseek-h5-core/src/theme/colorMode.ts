/**
 * Color mode utilities (THEME_DARKMODE_SPEC.md §3).
 *
 * Single ownership: only this module and the inline anti-flash boot script in
 * `index.html` touch `data-sdk-color-mode`; components never read
 * `prefers-color-scheme`. Mode switching is a CSS custom-property swap via the
 * root attributes — no remount.
 */

export type ColorMode = 'light' | 'dark';

export const COLOR_MODE_STORAGE_KEY = 'whatseek.color-mode';

export function readStoredColorMode(): ColorMode {
  try {
    const stored = globalThis.localStorage?.getItem(COLOR_MODE_STORAGE_KEY);
    return stored === 'dark' ? 'dark' : 'light';
  } catch {
    return 'light';
  }
}

export function readAppliedColorMode(): ColorMode {
  if (typeof document === 'undefined') {
    return readStoredColorMode();
  }
  return document.documentElement.getAttribute('data-sdk-color-mode') === 'dark' ? 'dark' : 'light';
}

export function applyColorMode(mode: ColorMode): void {
  if (typeof document === 'undefined') {
    return;
  }
  const root = document.documentElement;
  root.setAttribute('data-sdk-color-mode', mode);
  root.classList.toggle('dark', mode === 'dark');
  root.style.colorScheme = mode;
  try {
    globalThis.localStorage?.setItem(COLOR_MODE_STORAGE_KEY, mode);
  } catch {
    /* storage unavailable — mode applies for this document only */
  }
}

export function toggleColorMode(current: ColorMode): ColorMode {
  const next: ColorMode = current === 'dark' ? 'light' : 'dark';
  applyColorMode(next);
  return next;
}
