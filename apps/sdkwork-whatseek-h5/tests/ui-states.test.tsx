/**
 * Five-UI-state contract (FRONTEND_CODE_SPEC.md §11) exercised through real
 * capability screens against the mock clients, plus the theme + i18n
 * switching contract.
 */

import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import type { ReactElement } from 'react';

import { afterEach, beforeAll, beforeEach, describe, expect, it } from 'vitest';

import { applyColorMode, readAppliedColorMode, changeWhatseekLocale, resetWhatseekClients, useSessionStore } from '@sdkwork/whatseek-h5-core';
import { useChatStore } from '@sdkwork/whatseek-h5-chat';
import { ContactsHomeScreen } from '@sdkwork/whatseek-h5-contacts';
import { ChatHomeScreen } from '@sdkwork/whatseek-h5-chat';
import { ScreenState } from '@sdkwork/whatseek-h5-commons';
import { ProfileHomeScreen, SettingsScreen, useSettingsStore } from '@sdkwork/whatseek-h5-profile';

import { bootTestRuntime, registerFreshMockClients } from './setup/test-runtime.js';

beforeAll(() => {
  bootTestRuntime();
});

beforeEach(() => {
  registerFreshMockClients();
  globalThis.localStorage.clear();
  useChatStore.setState({ threads: [], activeThreadId: null, consumedActionEntryIds: [], activeTaskStates: {} });
  useSessionStore.getState().ensureVisitor();
  useSettingsStore.getState().setColorMode('light');
  void changeWhatseekLocale('zh-CN');
});

afterEach(() => {
  cleanup();
  resetWhatseekClients();
});

function renderAt(ui: ReactElement, initialPath: string): void {
  render(<MemoryRouter initialEntries={[initialPath]}>{ui}</MemoryRouter>);
}

describe('ScreenState five states', () => {
  it('renders_loading_empty_error_with_retry_and_permission_denied_and_success_children', () => {
    const { rerender } = render(<ScreenState state="loading" />);
    expect(document.querySelector('[data-screen-state="loading"]')).not.toBeNull();

    rerender(<ScreenState state="empty" />);
    expect(document.querySelector('[data-screen-state="empty"]')).not.toBeNull();

    rerender(<ScreenState state="permission-denied" />);
    expect(document.querySelector('[data-screen-state="permission-denied"]')).not.toBeNull();

    rerender(
      <ScreenState state="error" onRetry={() => undefined}>
        <span>content</span>
      </ScreenState>,
    );
    expect(document.querySelector('[data-screen-state="error"]')).not.toBeNull();

    rerender(
      <ScreenState state="success">
        <span>content</span>
      </ScreenState>,
    );
    expect(document.querySelector('[data-screen-state]')).toBeNull();
    expect(screen.getByText('content')).toBeTruthy();
  });
});

describe('ChatHomeScreen (chat-first entry)', () => {
  it('renders_the_hero_and_suggestions_when_the_thread_is_empty', async () => {
    renderAt(<ChatHomeScreen />, '/chat');
    expect(await screen.findByText('你想做什么？')).toBeTruthy();
    expect(screen.getByText('帮我找一个视频剪辑工具')).toBeTruthy();
  });

  it('answers_a_search_intent_with_app_result_cards', async () => {
    const user = userEvent.setup();
    renderAt(<ChatHomeScreen />, '/chat');
    await screen.findByText('你想做什么？');
    await user.click(screen.getByText('帮我找一个视频剪辑工具'));
    await waitFor(
      () => {
        expect(screen.getByText(/我找到 1 个适合你的应用/)).toBeTruthy();
      },
      { timeout: 3000 },
    );
    expect(screen.getByText('剪辑大师')).toBeTruthy();
    expect(screen.getByText('立即使用')).toBeTruthy();
  });

  it('offers_a_creation_plan_and_generates_an_app_on_confirm', async () => {
    const user = userEvent.setup();
    renderAt(<ChatHomeScreen />, '/chat');
    await screen.findByText('你想做什么？');
    await user.click(screen.getByText('帮我做一个库存管理系统'));
    await waitFor(
      () => {
        expect(screen.getByText(/方案如下|我准备创建/)).toBeTruthy();
      },
      { timeout: 3000 },
    );
    expect(screen.getByText('库存盘点')).toBeTruthy();
    await user.click(screen.getByText('直接生成'));
    await waitFor(
      () => {
        expect(screen.getByText(/已生成应用/)).toBeTruthy();
      },
      { timeout: 3000 },
    );
  });

  it('requires_explicit_confirmation_before_sending_a_message', async () => {
    const user = userEvent.setup();
    renderAt(<ChatHomeScreen />, '/chat');
    await screen.findByText('你想做什么？');
    await user.click(screen.getByText('给张三发消息，告诉他下午三点开会'));
    await waitFor(
      () => {
        expect(screen.getByText('确认发送')).toBeTruthy();
      },
      { timeout: 3000 },
    );
    expect(screen.getByText(/发送前请确认/)).toBeTruthy();
    await user.click(screen.getByText('确认发送'));
    await waitFor(
      () => {
        expect(screen.getByText(/消息已发送给 张三/)).toBeTruthy();
      },
      { timeout: 3000 },
    );
  });
});

describe('ContactsHomeScreen (loading → success)', () => {
  it('renders_the_seeded_directory_after_loading', async () => {
    renderAt(<ContactsHomeScreen />, '/contacts');
    await waitFor(
      () => {
        expect(screen.getByText('张三')).toBeTruthy();
      },
      { timeout: 3000 },
    );
    expect(screen.getByText('问寻 AI 助手')).toBeTruthy();
  });
});

describe('Profile + settings', () => {
  it('shows_the_visitor_session_and_asset_summary', async () => {
    renderAt(<ProfileHomeScreen />, '/profile');
    expect(await screen.findByText('访客')).toBeTruthy();
    await waitFor(() => {
      expect(screen.getByText('我的应用')).toBeTruthy();
    });
  });

  it('switches_dark_mode_and_language_and_persists_them', async () => {
    const user = userEvent.setup();
    renderAt(<SettingsScreen />, '/settings');
    await user.click(screen.getByRole('radio', { name: '深色' }));
    expect(readAppliedColorMode()).toBe('dark');
    expect(document.documentElement.getAttribute('data-sdk-color-mode')).toBe('dark');

    await user.click(screen.getByRole('radio', { name: 'English' }));
    await waitFor(() => {
      expect(screen.getByText('Appearance')).toBeTruthy();
    });
    // restore for other tests
    applyColorMode('light');
    void changeWhatseekLocale('zh-CN');
  });
});
