/**
 * Tab-bar visibility guarantee (APP_H5_ARCHITECTURE_SPEC.md §11): the tab
 * bar renders only on tab-root routes. Secondary screens present through
 * MobileStackLayout, driven by the composed route-table partition — never by
 * per-screen conditionals. Exercised through the real App composition.
 */

import { cleanup, render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Suspense } from 'react';

import { afterEach, beforeAll, beforeEach, describe, expect, it } from 'vitest';

import { changeWhatseekLocale, resetWhatseekClients, useSessionStore } from '@sdkwork/whatseek-h5-core';

import { App } from '../src/App.js';
import { bootTestRuntime, registerFreshMockClients } from './setup/test-runtime.js';

const TABBAR_SELECTOR = 'nav[aria-label="主导航"]';

beforeAll(() => {
  bootTestRuntime();
});

beforeEach(() => {
  registerFreshMockClients();
  globalThis.localStorage.clear();
  useSessionStore.getState().ensureVisitor();
  void changeWhatseekLocale('zh-CN');
});

afterEach(() => {
  cleanup();
  resetWhatseekClients();
});

function renderAppAt(initialPath: string): void {
  render(
    <MemoryRouter initialEntries={[initialPath]}>
      <Suspense fallback={null}>
        <App />
      </Suspense>
    </MemoryRouter>,
  );
}

describe('tab-bar visibility by route presentation', () => {
  it('renders_the_tab_bar_on_tab_roots', () => {
    renderAppAt('/apps');
    expect(document.querySelector(TABBAR_SELECTOR)).not.toBeNull();
  });

  it('hides_the_tab_bar_on_static_stack_screens', () => {
    renderAppAt('/settings');
    // The layout decision is synchronous — the stack layout commits without
    // the nav before any lazy screen resolves.
    expect(document.querySelector(TABBAR_SELECTOR)).toBeNull();
  });

  it('hides_the_tab_bar_on_parametrized_stack_screens', () => {
    renderAppAt('/apps/detail/crm-manager');
    expect(document.querySelector(TABBAR_SELECTOR)).toBeNull();
  });
});
