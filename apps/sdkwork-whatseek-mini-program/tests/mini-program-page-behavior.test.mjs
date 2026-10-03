/**
 * Mini-program page behavior smoke (TEST_SPEC analog, node --test):
 * drives the REAL native page modules against the REAL bundled runtime
 * facade (`src/runtime/app.js`) inside a simulated WeChat host. This is the
 * behavioral layer above the static surface-contract test — no page logic
 * is duplicated or re-implemented here.
 *
 * The wx.* stubs record calls (navigation/toasts/modals/refresh) so tests
 * can assert host interactions too. Mock client state is shared inside the
 * runtime bundle for the whole process, so scenarios run in a deliberate
 * order (create → my → detail/favorite → …).
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { cpSync, mkdtempSync, writeFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import path from 'node:path';
import process from 'node:process';
import { tmpdir } from 'node:os';

const surfaceRoot = process.cwd();

/* The surface package is `"type": "module"` while native pages and the
 * runtime bundle are CommonJS (the WeChat convention). Load a throwaway CJS
 * copy of `src/` from the OS temp dir so Node's loader treats every `.js`
 * exactly like the WeChat runtime does. */
const harnessRoot = mkdtempSync(path.join(tmpdir(), 'whatseek-mp-behavior-'));
writeFileSync(path.join(harnessRoot, 'package.json'), JSON.stringify({ type: 'commonjs' }));
cpSync(path.join(surfaceRoot, 'src'), path.join(harnessRoot, 'src'), { recursive: true });

/* ---------- simulated WeChat host ---------- */

const hostCalls = { navigate: [], redirects: [], toasts: [], modals: [], stopRefresh: 0 };

globalThis.wx = {
  navigateTo({ url }) {
    hostCalls.navigate.push(url);
  },
  redirectTo({ url }) {
    hostCalls.redirects.push(url);
  },
  navigateBack() {},
  switchTab() {},
  showToast({ title }) {
    hostCalls.toasts.push(title);
  },
  showModal(options) {
    hostCalls.modals.push({ title: options.title, content: options.content });
    options.success({ confirm: true });
  },
  stopPullDownRefresh() {
    hostCalls.stopRefresh += 1;
  },
  onThemeChange() {},
  offThemeChange() {},
  getAppBaseInfo() {
    return { theme: 'light' };
  },
};
globalThis.getApp = () => ({ globalData: {} });

/* ---------- Page() harness ---------- */

let lastConfig = null;
globalThis.Page = (config) => {
  lastConfig = config;
};

/** WeChat setData supports `a.b`, `list[0].x` path keys — support the same. */
function setByPath(target, keyPath, value) {
  const tokens = keyPath.match(/[^\[\].]+/gu) ?? [keyPath];
  let cursor = target;
  for (let i = 0; i < tokens.length - 1; i += 1) {
    const token = tokens[i];
    if (cursor[token] === undefined || cursor[token] === null) {
      cursor[token] = /^\d+$/u.test(tokens[i + 1]) ? [] : {};
    }
    cursor = cursor[token];
  }
  cursor[tokens[tokens.length - 1]] = value;
}

function loadPage(pageRel) {
  lastConfig = null;
  const require = createRequire(pathToFileURL(path.join(harnessRoot, 'src', pageRel, 'index.js')));
  const resolved = require.resolve('./index.js');
  // Re-entering the same page module must re-register its Page() config; the
  // shared runtime bundle stays cached so mock state carries across pages.
  delete require.cache[resolved];
  require('./index.js');
  if (lastConfig === null) {
    throw new Error(`page ${pageRel} never registered a Page() config`);
  }
  const page = { ...lastConfig, data: structuredClone(lastConfig.data ?? {}) };
  page.setData = (patch) => {
    for (const [key, value] of Object.entries(patch)) {
      if (key.includes('.') || key.includes('[')) {
        setByPath(page.data, key, value);
      } else {
        page.data[key] = value;
      }
    }
  };
  return page;
}

/**
 * WeChat lifecycle hooks fire loads without returning their promises
 * (`onShow() { this.load(); }`), so drain the microtask queue after invoking
 * one. Mock clients settle without timers; two `setImmediate` hops are enough
 * and deterministic.
 */
async function settle(invocation) {
  await invocation;
  await new Promise((resolve) => setImmediate(resolve));
  await new Promise((resolve) => setImmediate(resolve));
}

/* ---------- scenarios (shared mock state: deliberate order) ---------- */

test('apps_home_loads_recommended_and_categories_and_routes_entries', async () => {
  const page = loadPage('pages/apps');
  await settle(page.onShow());
  assert.equal(page.data.loading, false);
  assert.ok(page.data.recommended.length > 0, 'recommended apps should load');
  assert.ok(page.data.categories.length > 0, 'categories should load');
  assert.ok(page.data.hot.length > 0, 'hot apps section should load');
  assert.ok(Array.isArray(page.data.recents), 'recents section should load (may be empty on first run)');

  hostCalls.navigate.length = 0;
  page.onCategoryTap({ currentTarget: { dataset: { id: 'video' } } });
  assert.match(hostCalls.navigate.at(-1), /detail\/apps-search\/index\?query=video$/u);

  page.onMyApps();
  assert.match(hostCalls.navigate.at(-1), /detail\/apps-my\/index$/u);

  await settle(page.onPullDownRefresh());
  assert.ok(hostCalls.stopRefresh >= 1, 'pull-down refresh must stop the indicator');
  assert.equal(page.data.loading, false, 'silent refresh must not flash the loading state');
});

test('search_page_resolves_a_matching_query_and_routes_results', async () => {
  const page = loadPage('detail/apps-search');
  await settle(page.onLoad({ query: '视频剪辑' }));
  assert.equal(page.data.loading, false);
  assert.equal(page.data.searched, true);
  assert.equal(page.data.results.length, 1);
  assert.equal(page.data.results[0].app.name, '剪辑大师');

  hostCalls.navigate.length = 0;
  page.onResultTap({ currentTarget: { dataset: { id: 'clip-master' } } });
  assert.match(hostCalls.navigate.at(-1), /detail\/apps-detail\/index\?appId=clip-master$/u);

  const empty = loadPage('detail/apps-search');
  await settle(empty.onLoad({ query: 'xyzzy-不存在的东西' }));
  assert.equal(empty.data.searched, true);
  assert.equal(empty.data.results.length, 0, 'unmatched query must yield the empty state inputs');
});

test('runner_opens_community_apps_and_denies_visitors_for_enterprise', async () => {
  const runner = loadPage('detail/apps-runner');
  await settle(runner.onLoad({ appId: 'clip-master' }));
  assert.equal(runner.data.denied, false);
  assert.equal(runner.data.app.id, 'clip-master');

  const denied = loadPage('detail/apps-runner');
  await settle(denied.onLoad({ appId: 'crm-manager' }));
  assert.equal(denied.data.denied, true);
  assert.equal(denied.data.appName, '客户管家 CRM');
  assert.equal(denied.data.app, null, 'denied runner must not render the preview');
});

test('profile_sign_in_opens_the_enterprise_app_and_sign_out_restores_the_gate', async () => {
  // Visitor profile: the session card offers 登录.
  const profile = loadPage('pages/profile');
  await settle(profile.onShow());
  assert.equal(profile.data.summary.user.isVisitor, true);
  assert.equal(profile.data.summary.user.name, '访客');

  // Sign in promotes the session to a named account (H5/PC parity).
  await settle(profile.onSignIn());
  assert.equal(profile.data.summary.user.isVisitor, false);
  assert.equal(profile.data.summary.user.name, '问寻用户');

  // The previously denied enterprise app now opens.
  const runner = loadPage('detail/apps-runner');
  await settle(runner.onLoad({ appId: 'crm-manager' }));
  assert.equal(runner.data.denied, false, 'named session must open enterprise apps');
  assert.equal(runner.data.app.id, 'crm-manager');

  // Sign out restores the visitor gate.
  const profileAgain = loadPage('pages/profile');
  await settle(profileAgain.onShow());
  await settle(profileAgain.onSignOut());
  assert.equal(profileAgain.data.summary.user.isVisitor, true);
  const gate = loadPage('detail/apps-runner');
  await settle(gate.onLoad({ appId: 'crm-manager' }));
  assert.equal(gate.data.denied, true, 'sign-out must restore the permission gate');
});

test('detail_toggles_favorite_for_real_and_routes_to_runner', async () => {
  const page = loadPage('detail/apps-detail');
  await settle(page.onLoad({ appId: 'clip-master' }));
  assert.equal(page.data.app.id, 'clip-master');
  assert.equal(page.data.favorite, false);

  await settle(page.onFavorite());
  assert.equal(page.data.favorite, true);
  assert.equal(hostCalls.toasts.at(-1), '已收藏');

  await settle(page.onFavorite());
  assert.equal(page.data.favorite, false, 'toggle must be reversible');

  hostCalls.navigate.length = 0;
  page.onUse();
  assert.match(hostCalls.navigate.at(-1), /detail\/apps-runner\/index\?appId=clip-master$/u);
});

test('create_flow_validates_drafts_creates_and_publishes', async () => {
  const page = loadPage('detail/apps-create');

  await settle(page.onDraftPlan());
  assert.match(page.data.error, /请先描述/u, 'empty requirement must show the validation message');

  page.setData({ requirement: '帮我做一个跨境选品管理系统' });
  await settle(page.onDraftPlan());
  assert.equal(page.data.step, 'plan');
  assert.ok(page.data.plan.title.length > 0);
  assert.ok(page.data.plan.modules.length > 0);

  await settle(page.onCreate());
  assert.equal(page.data.step, 'created');
  assert.ok(page.data.app.id.length > 0);
  const createdId = page.data.app.id;

  page.setData({ instruction: '增加订单管理模块' });
  await settle(page.onModify());
  assert.equal(hostCalls.toasts.at(-1), '已按指令更新应用');
  assert.ok(
    page.data.app.modules.some((module) => module.includes('订单管理')),
    'modify must append the instruction as a module',
  );
  assert.equal(page.data.instruction, '', 'instruction must clear after modify');

  await settle(page.onPublish());
  assert.equal(page.data.app.lifecycle, 'published');
  assert.equal(hostCalls.toasts.at(-1), '已发布到应用市场');

  hostCalls.navigate.length = 0;
  page.onRun();
  assert.match(hostCalls.navigate.at(-1), new RegExp(`detail/apps-runner/index\\?appId=${createdId}$`, 'u'));
});

test('my_apps_lists_created_work_with_labels_and_deletes', async () => {
  const page = loadPage('detail/apps-my');
  await settle(page.onShow());
  assert.equal(page.data.loading, false);
  assert.ok(page.data.apps.length >= 1, 'the app created above must be listed');
  assert.equal(page.data.apps[0].lifecycleLabel, '已发布');

  hostCalls.modals.length = 0;
  await settle(page.onDelete({ currentTarget: { dataset: { id: page.data.apps[0].id, name: page.data.apps[0].name } } }));
  assert.equal(hostCalls.modals.length, 1, 'delete must confirm through a modal first');
  assert.match(hostCalls.toasts.at(-1), /已删除/u);
  assert.equal(page.data.apps.length, 0, 'list must reload after deletion');
});

test('contact_detail_opens_and_routes_to_the_direct_conversation', async () => {
  const page = loadPage('detail/contact-detail');
  await settle(page.onLoad({ contactId: 'zhangsan' }));
  assert.equal(page.data.contact.name, '张三');
  assert.equal(page.data.kindLabel, '联系人');

  hostCalls.redirects.length = 0;
  await settle(page.onSendMessage());
  assert.equal(hostCalls.redirects.length, 1);
  assert.match(hostCalls.redirects[0], /detail\/conversation\/index\?conversationId=conv-zhangsan$/u);
});

test('conversation_marks_read_sends_and_clears_the_draft', async () => {
  const page = loadPage('detail/conversation');
  await settle(page.onLoad({ conversationId: 'conv-zhangsan' }));
  assert.equal(page.data.loading, false);
  const before = page.data.messages.length;
  assert.ok(before >= 1, 'thread must load');

  page.setData({ input: '好的，明天见' });
  await settle(page.onSend());
  assert.equal(page.data.messages.length, before + 1, 'sent message must append to the thread');
  assert.equal(page.data.input, '', 'draft must clear after send');
  assert.equal(page.data.sending, false);
});

test('contacts_home_searches_and_routes_to_detail', async () => {
  const page = loadPage('pages/contacts');
  await settle(page.onLoad());
  assert.ok(page.data.contacts.length >= 10, 'full roster should load');

  page.setData({ query: '张三' });
  await settle(page.onSearch());
  assert.equal(page.data.contacts.length, 1);
  assert.equal(page.data.contacts[0].name, '张三');

  hostCalls.navigate.length = 0;
  page.onContactTap({ currentTarget: { dataset: { id: 'zhangsan' } } });
  assert.match(hostCalls.navigate.at(-1), /detail\/contact-detail\/index\?contactId=zhangsan$/u);
});

test('messages_home_loads_conversations_with_resolved_kind_titles', async () => {
  const page = loadPage('pages/messages');
  await settle(page.onShow());
  assert.equal(page.data.loading, false);
  assert.ok(page.data.conversations.length > 0);
  const system = page.data.conversations.find((conversation) => conversation.kind === 'system');
  assert.equal(system?.title, '系统通知', 'titleKey conversations must resolve to localized titles');
  const appNotice = page.data.conversations.find((conversation) => conversation.kind === 'app');
  assert.equal(appNotice?.title, '应用通知', 'app-kind conversations must resolve too');
});

test('profile_home_loads_the_visitor_summary_and_entries_route', async () => {
  const page = loadPage('pages/profile');
  await settle(page.onShow());
  assert.equal(page.data.summary.user.name, '访客');
  assert.ok(page.data.summary.contacts >= 10);
  assert.ok(page.data.summary.agents >= 2, 'agent + assistant roster must be counted as agents');

  hostCalls.navigate.length = 0;
  page.onSettings();
  assert.match(hostCalls.navigate.at(-1), /detail\/settings\/index$/u);
});

test('chat_routes_agent_dispatch_to_the_agent_roster', async () => {
  const page = loadPage('pages/chat');
  page.setData({ input: '让智能体帮我整理日报' });
  await settle(page.onSend());
  const assistant = page.data.entries[1];
  assert.ok(assistant.cards && assistant.cards.contacts.length > 0, 'agent dispatch must return contact cards');
});

test('chat_send_creates_a_task_chip_that_resolves_state', async () => {
  const page = loadPage('pages/chat');
  // Content-creation intents start a task at send time (the create-app intent
  // only drafts a plan until the card action confirms it).
  page.setData({ input: '帮我写一篇新品文案' });
  await settle(page.onSend());
  assert.equal(page.data.entries.length, 2, 'user + assistant entries');
  assert.equal(page.data.sending, false);
  const assistant = page.data.entries[1];
  assert.ok(assistant.taskId, 'create intent must return a task id');
  assert.equal(assistant.taskState, '');

  await settle(page.onTaskTap({ currentTarget: { dataset: { entryindex: '1' } } }));
  assert.ok(
    typeof page.data.entries[1].taskState === 'string' && page.data.entries[1].taskState.length > 0,
    'task chip must resolve to a localized state label',
  );
});

test('chat_parks_the_task_at_waiting_confirmation_and_resolves_by_user_cancel_or_confirm', async () => {
  const page = loadPage('pages/chat');
  page.setData({ input: '帮我做一张活动海报' });
  await settle(page.onSend());
  const assistant = page.data.entries[1];
  assert.ok(assistant.taskId, 'content intent must return a task id');

  // The chain runs pending → running → waiting_confirmation on the runtime
  // scheduler (2 × 600ms steps), then parks for the user.
  await new Promise((resolve) => setTimeout(resolve, 1600));
  await settle(page.onTaskTap({ currentTarget: { dataset: { entryindex: '1' } } }));
  assert.equal(page.data.entries[1].taskWaiting, true, 'parked task must expose the confirm/cancel actions');

  // Cancel resolves the task and lands a localized outcome bubble.
  await settle(page.onTaskAction({ currentTarget: { dataset: { kind: 'cancel', entryindex: '1' } } }));
  assert.equal(page.data.entries[1].taskWaiting, false, 'resolved task must drop the actions');
  assert.equal(page.data.entries[1].taskState, '已取消');
  assert.equal(page.data.entries[2].text, '任务已取消。');

  // A stale confirm on the cancelled task reports inactivity honestly.
  await settle(page.onTaskAction({ currentTarget: { dataset: { kind: 'confirm', entryindex: '1' } } }));
  assert.equal(page.data.entries[3].text, '该任务已不在待确认状态。');
});

test('settings_reflects_appearance_and_switches_locale_both_ways', async () => {
  const page = loadPage('detail/settings');
  await settle(page.onLoad());
  assert.equal(page.data.locale, 'zh-CN');
  assert.equal(page.data.systemTheme, 'light');

  page.onLocale({ currentTarget: { dataset: { locale: 'en-US' } } });
  assert.equal(page.data.locale, 'en-US');
  assert.equal(hostCalls.toasts.at(-1), 'Switched to English');

  page.onLocale({ currentTarget: { dataset: { locale: 'zh-CN' } } });
  assert.equal(page.data.locale, 'zh-CN');
});
