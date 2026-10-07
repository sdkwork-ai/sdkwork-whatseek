/**
 * Mini-program surface contract test (TEST_SPEC §2.4 analog, node --test):
 * native manifest ↔ route projection alignment, page file completeness,
 * runtime bundle freshness, and the `wx.*` host-adapter boundary.
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const surfaceRoot = process.cwd();

test('app.json projects_exactly_the_five_tab_pages_and_the_detail_subpackage', () => {
  const manifest = JSON.parse(readFileSync(path.join(surfaceRoot, 'src', 'app.json'), 'utf8'));
  assert.deepEqual(manifest.pages, [
    'pages/chat/index',
    'pages/apps/index',
    'pages/contacts/index',
    'pages/messages/index',
    'pages/profile/index',
  ]);
  assert.equal(manifest.subPackages.length, 1);
  assert.equal(manifest.subPackages[0].root, 'detail');
  assert.deepEqual(manifest.subPackages[0].pages, [
    'apps-detail/index',
    'apps-search/index',
    'apps-runner/index',
    'apps-create/index',
    'apps-my/index',
    'apps-charts/index',
    'apps-collection/index',
    'contact-detail/index',
    'conversation/index',
    'settings/index',
  ]);
  assert.equal(manifest.tabBar.list.length, 5);
  assert.deepEqual(
    manifest.tabBar.list.map((entry) => entry.text),
    ['对话', '应用', '通讯录', '消息', '我的'],
  );
  for (const entry of manifest.tabBar.list) {
    assert.ok(manifest.pages.includes(entry.pagePath), `tab page missing from pages: ${entry.pagePath}`);
    // Tab icon-state norm (APP_MINI_PROGRAM_UI_SPEC §7): outline icon for the
    // unselected tab, filled glyph for the selected tab — never color alone.
    assert.match(entry.iconPath ?? '', /-outline\.png$/u, `tab ${entry.text} missing an outline iconPath`);
    assert.match(entry.selectedIconPath ?? '', /-filled\.png$/u, `tab ${entry.text} missing a filled selectedIconPath`);
    for (const icon of [entry.iconPath, entry.selectedIconPath]) {
      assert.ok(existsSync(path.join(surfaceRoot, 'src', icon)), `tab icon asset missing: ${icon}`);
    }
  }
});

test('every_declared_page_has_a_complete_index_quad', () => {
  const manifest = JSON.parse(readFileSync(path.join(surfaceRoot, 'src', 'app.json'), 'utf8'));
  const pageFiles = [
    ...manifest.pages,
    ...manifest.subPackages.flatMap((subpackage) => subpackage.pages.map((page) => `${subpackage.root}/${page}`)),
  ];
  for (const page of pageFiles) {
    for (const extension of ['js', 'json', 'wxml', 'wxss']) {
      const file = path.join(surfaceRoot, 'src', `${page}.${extension}`);
      assert.ok(existsSync(file), `missing ${page}.${extension}`);
    }
  }
});

test('every_page_loads_data_through_the_runtime_facade_with_states', () => {
  const manifest = JSON.parse(readFileSync(path.join(surfaceRoot, 'src', 'app.json'), 'utf8'));
  const pageFiles = [
    ...manifest.pages,
    ...manifest.subPackages.flatMap((subpackage) => subpackage.pages.map((page) => `${subpackage.root}/${page}`)),
  ];
  for (const page of pageFiles) {
    const js = readFileSync(path.join(surfaceRoot, 'src', `${page}.js`), 'utf8');
    assert.ok(
      js.includes("require('../../runtime/app.js')") || js.includes("require('../runtime/app.js')"),
      `${page}.js must consume the bundled runtime facade`,
    );
    // Every page owns its loading/empty/error states (APP_MINI_PROGRAM_UI_SPEC
    // §UI states): either a try/catch, a retry handler, or an error field.
    assert.ok(
      /catch\s*\(/u.test(js) || /onRetry/u.test(js),
      `${page}.js must handle load errors (try/catch or onRetry)`,
    );
  }
});

test('list_pages_support_pull_down_refresh_and_forms_show_validation_messages', () => {
  // APP_MINI_PROGRAM_UI_SPEC §7: lists must support refresh; forms must show
  // validation messages.
  const listPages = [
    'pages/apps',
    'pages/contacts',
    'pages/messages',
    'detail/apps-my',
    'detail/apps-search',
  ];
  for (const page of listPages) {
    const json = JSON.parse(readFileSync(path.join(surfaceRoot, 'src', `${page}/index.json`), 'utf8'));
    assert.equal(json.enablePullDownRefresh, true, `${page} must enable pull-down refresh`);
    const js = readFileSync(path.join(surfaceRoot, 'src', `${page}/index.js`), 'utf8');
    assert.match(js, /onPullDownRefresh/u, `${page} must handle onPullDownRefresh`);
    assert.match(js, /stopPullDownRefresh/u, `${page} must stop pull-down refresh`);
  }
  const createJs = readFileSync(path.join(surfaceRoot, 'src', 'detail/apps-create/index.js'), 'utf8');
  // The validation message is locale-aware: the page wires the fragment key and
  // the zh-CN fragment carries the actual message (APP_MINI_PROGRAM_UI_SPEC §7).
  assert.match(createJs, /create\.requirementRequired/u, 'create form must show a validation message for empty requirement');
  const appsZh = JSON.parse(
    readFileSync(path.join(surfaceRoot, 'packages', 'sdkwork-whatseek-mp-apps', 'src', 'i18n', 'zh-CN', 'whatseek', 'apps', 'strings.json'), 'utf8'),
  );
  assert.match(appsZh.create.requirementRequired, /请先描述/u, 'create validation fragment must keep the zh message');
});

test('native_dark_mode_is_wired_through_theme_json_with_locale_parity', () => {
  const manifest = JSON.parse(readFileSync(path.join(surfaceRoot, 'src', 'app.json'), 'utf8'));
  assert.equal(manifest.darkmode, true, 'app.json must enable darkmode');
  assert.equal(manifest.themeLocation, 'theme.json');
  const theme = JSON.parse(readFileSync(path.join(surfaceRoot, 'src', 'theme.json'), 'utf8'));
  assert.deepEqual([...Object.keys(theme.light)].sort(), [...Object.keys(theme.dark)].sort(), 'theme locale drift');
  for (const key of ['navBg', 'navTxt', 'bg', 'tabBg', 'tabColor', 'tabSelected']) {
    assert.ok(theme.light[key], `missing light theme symbol ${key}`);
    assert.ok(theme.dark[key], `missing dark theme symbol ${key}`);
  }
  const wxss = readFileSync(path.join(surfaceRoot, 'src', 'app.wxss'), 'utf8');
  assert.ok(wxss.includes('@media (prefers-color-scheme: dark)'), 'app.wxss must override tokens for dark');
});

test('runtime_bundle_exists_and_is_profile_stamped', () => {
  const bundle = readFileSync(path.join(surfaceRoot, 'src', 'runtime', 'app.js'), 'utf8');
  assert.ok(bundle.length > 1000, 'runtime bundle suspiciously small — run pnpm build');
  const env = JSON.parse(
    readFileSync(path.join(surfaceRoot, 'src', 'runtime', 'runtime-env.js'), 'utf8')
      .replace(/^\/\/ Generated[^\n]*\n/, '')
      .replace(/^module\.exports = /, '')
      .replace(/;\s*$/u, ''),
  );
  assert.equal(env.runtimeTarget, 'mini-program');
  assert.match(env.profileId, /^(standalone|cloud)\.(development|test|staging|production)$/u);
});

test('runtime_config_profiles_carry_the_im_driver_keys_empty', () => {
  // Every committed profile declares the full sdkwork-im driver key set with
  // empty values: gateway base + websocket + the bootstrap IAM session bridge
  // (tokens are only ever set in LOCAL uncommitted profile copies).
  for (const profile of ['development', 'test', 'staging', 'production']) {
    const config = JSON.parse(
      readFileSync(
        path.join(surfaceRoot, 'config', 'mini-program', `runtime-env.standalone.${profile}.json`),
        'utf8',
      ),
    );
    for (const key of [
      'sdkworkImApiBaseUrl',
      'sdkworkImWebSocketBaseUrl',
      'sdkworkImBootstrapAccessToken',
      'sdkworkImBootstrapAuthToken',
    ]) {
      assert.ok(key in config, `standalone.${profile} must declare ${key}`);
      assert.equal(config[key], '', `standalone.${profile}.${key} must stay empty in committed profiles`);
    }
  }
});

test('capability_packages_never_call_wx_directly_(host_adapter_boundary)', () => {
  const packagesRoot = path.join(surfaceRoot, 'packages');
  const offenders = [];
  for (const name of ['core', 'commons', 'shell', 'chat', 'apps', 'contacts', 'messages', 'profile']) {
    const file = path.join(packagesRoot, `sdkwork-whatseek-mp-${name}`, 'src', 'index.ts');
    const content = readFileSync(file, 'utf8');
    // Strip comments first: the host-adapter contract mentions `wx.*` in docs.
    const code = content.replace(/\/\*[\s\S]*?\*\//gu, '').replace(/\/\/[^\n]*/gu, '');
    if (/\bwx\s*\.\w+/u.test(code)) {
      offenders.push(name);
    }
  }
  assert.deepEqual(offenders, [], `capability packages must not call wx.* directly: ${offenders.join(', ')}`);
});

test('route_ids_stay_aligned_with_the_cross_surface_contract', () => {
  const shell = readFileSync(path.join(surfaceRoot, 'packages', 'sdkwork-whatseek-mp-shell', 'src', 'index.ts'), 'utf8');
  for (const tab of ['chat', 'apps', 'contacts', 'messages', 'profile']) {
    assert.ok(shell.includes(`pages/${tab}/index`), `tab path for ${tab} missing in mp-shell`);
  }
});

test('every_capability_package_ships_zh_en_i18n_fragments_with_key_parity', () => {
  const packages = ['core', 'commons', 'shell', 'chat', 'apps', 'contacts', 'messages', 'profile'];
  const keyPaths = (value, prefix = '') => {
    if (typeof value !== 'object' || value === null) return new Set([prefix]);
    const keys = new Set();
    for (const [key, child] of Object.entries(value)) {
      for (const nested of keyPaths(child, prefix.length === 0 ? key : prefix + '.' + key)) {
        keys.add(nested);
      }
    }
    return keys;
  };
  for (const name of packages) {
    const read = (locale) => JSON.parse(readFileSync(
      path.join(
        surfaceRoot,
        'packages',
        ['sdkwork-whatseek-mp', name].join('-'),
        'src', 'i18n', locale, 'whatseek', name, 'strings.json',
      ),
      'utf8',
    ));
    const zh = read('zh-CN');
    const en = read('en-US');
    assert.deepEqual([...keyPaths(en)].sort(), [...keyPaths(zh)].sort(), ['locale key drift in mp-', name].join(''));
  }
});
