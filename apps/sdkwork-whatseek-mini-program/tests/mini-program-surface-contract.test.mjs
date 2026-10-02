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
  assert.deepEqual(manifest.subPackages[0].pages, ['apps-detail/index', 'conversation/index']);
  assert.equal(manifest.tabBar.list.length, 5);
  assert.deepEqual(
    manifest.tabBar.list.map((entry) => entry.text),
    ['对话', '应用', '通讯录', '消息', '我的'],
  );
  for (const entry of manifest.tabBar.list) {
    assert.ok(manifest.pages.includes(entry.pagePath), `tab page missing from pages: ${entry.pagePath}`);
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
