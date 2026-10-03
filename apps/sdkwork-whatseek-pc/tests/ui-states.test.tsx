/**
 * Five-UI-state contract (FRONTEND_CODE_SPEC.md §11) exercised through real
 * capability screens against the mock clients, plus the theme + i18n
 * switching contract. PC twin of the H5 `ui-states.test.tsx`.
 */

import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import type { ReactElement } from 'react';

import { afterEach, beforeAll, beforeEach, describe, expect, it } from 'vitest';

import { applyColorMode, getWhatseekClient, readAppliedColorMode, changeWhatseekLocale, resetWhatseekClients, useSessionStore } from '@sdkwork/whatseek-pc-core';
import { useChatStore } from '@sdkwork/whatseek-pc-chat';
import { AppRunnerScreen } from '@sdkwork/whatseek-pc-apps';
import { ContactsHomeScreen } from '@sdkwork/whatseek-pc-contacts';
import { ChatHomeScreen } from '@sdkwork/whatseek-pc-chat';
import { ScreenState } from '@sdkwork/whatseek-pc-commons';
import { ProfileHomeScreen, SettingsScreen, useSettingsStore } from '@sdkwork/whatseek-pc-profile';

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

  it('parks_a_content_task_at_waiting_confirmation_and_resolves_it_by_user_confirm_or_cancel', async () => {
    const user = userEvent.setup();
    renderAt(<ChatHomeScreen />, '/chat');
    await screen.findByText('你想做什么？');

    const send = async (text: string) => {
      await user.type(screen.getByLabelText('消息输入框'), text);
      await user.click(screen.getByRole('button', { name: '发送' }));
    };

    await send('帮我做一张促销海报');
    await waitFor(
      () => {
        expect(document.querySelector('[data-task-state="waiting_confirmation"]')).not.toBeNull();
      },
      { timeout: 3000 },
    );
    // The parked task exposes exactly two user actions (PRD §41).
    expect(document.querySelector('[data-task-actions]')).not.toBeNull();

    // Cancel resolves the first task.
    await user.click(screen.getByText('取消任务'));
    await waitFor(
      () => {
        expect(document.querySelector('[data-task-state="cancelled"]')).not.toBeNull();
      },
      { timeout: 3000 },
    );
    expect(screen.getByText(/任务已取消/)).toBeTruthy();
    expect(document.querySelector('[data-task-actions]')).toBeNull();

    // A second task resolves through explicit confirmation instead.
    await send('帮我写一篇新年文案');
    await waitFor(
      () => {
        expect(document.querySelectorAll('[data-task-state="waiting_confirmation"]').length).toBe(1);
      },
      { timeout: 3000 },
    );
    await user.click(screen.getByText('确认完成'));
    await waitFor(
      () => {
        expect(document.querySelector('[data-task-state="completed"]')).not.toBeNull();
      },
      { timeout: 3000 },
    );
    expect(screen.getByText(/任务已完成/)).toBeTruthy();
  });


  it('sign_in_promotes_the_session_and_opens_the_enterprise_app_in_the_runner', async () => {
    const user = userEvent.setup();
    // Visitor is denied at the enterprise runner route.
    render(
      <MemoryRouter initialEntries={['/apps/runner/crm-manager']}>
        <Routes>
          <Route path="/apps/runner/:appId" element={<AppRunnerScreen />} />
        </Routes>
      </MemoryRouter>,
    );
    await waitFor(
      () => {
        expect(document.querySelector('[data-screen-state="permission-denied"]')).not.toBeNull();
      },
      { timeout: 3000 },
    );
    cleanup();

    // Sign in from the profile tab (same session store the runner reads).
    renderAt(<ProfileHomeScreen />, '/profile');
    await user.click(await screen.findByText('登录'));
    expect(await screen.findByText('问寻用户')).toBeTruthy();
    cleanup();

    // The same deep route now renders the sandbox preview.
    render(
      <MemoryRouter initialEntries={['/apps/runner/crm-manager']}>
        <Routes>
          <Route path="/apps/runner/:appId" element={<AppRunnerScreen />} />
        </Routes>
      </MemoryRouter>,
    );
    await waitFor(
      () => {
        expect(document.querySelector('[data-screen-state="permission-denied"]')).toBeNull();
      },
      { timeout: 3000 },
    );
    expect(screen.getAllByText(/客户管家 CRM/).length).toBeGreaterThan(0);
    // Leave a visitor session for the other tests.
    useSessionStore.getState().signOut();
    useSessionStore.getState().ensureVisitor();
  });

  it('reconciles_restored_task_chips_from_the_task_store_on_mount', async () => {
    const tasks = getWhatseekClient('tasks');
    const task = await tasks.createTask({ title: '帮我做一张促销海报', intent: 'CREATE_CONTENT' });
    await tasks.updateTaskState(task.id, 'cancelled');
    useChatStore.setState({
      threads: [
        {
          id: 'thread-1',
          title: '促销海报',
          createdAt: '2026-10-03T00:00:00.000Z',
          updatedAt: '2026-10-03T00:00:00.000Z',
          entries: [
            { id: 'e-1', role: 'user', text: '帮我做一张促销海报', sentAt: '2026-10-03T00:00:00.000Z' },
            { id: 'e-2', role: 'assistant', text: 'whatseek.chat.reply.task.accepted', taskId: task.id, sentAt: '2026-10-03T00:00:00.000Z' },
          ],
        },
      ],
      activeThreadId: 'thread-1',
    });
    renderAt(<ChatHomeScreen />, '/chat');
    await waitFor(
      () => {
        expect(document.querySelector('[data-task-state="cancelled"]')).not.toBeNull();
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
