/**
 * sdkwork-im landing contract for the mini-program surface:
 * 1. the wx transport adapters (fetch polyfill + realtime socket factory)
 *    behave against the typed wx.* ports, and
 * 2. the composed `@sdkwork/im-sdk` family is declared and wired exactly at
 *    the spec-mandated seams (bootstrap composition root only).
 *
 * The transport adapters are bundled from the TypeScript source with esbuild
 * (the same bundler build-runtime.mjs uses) so the tests exercise the shipped
 * logic, not a parallel implementation.
 */

import { build } from 'esbuild';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { createRequire } from 'node:module';
import path from 'node:path';
import { afterEach, beforeEach, test } from 'node:test';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';

const surfaceRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

let tempDir;
let transports;

beforeEach(async () => {
  tempDir = mkdtempSync(path.join(tmpdir(), 'whatseek-mp-transport-'));
  const outfile = path.join(tempDir, 'transports.cjs');
  await build({
    entryPoints: [
      path.join(surfaceRoot, 'packages', 'sdkwork-whatseek-mp-core', 'src', 'transport', 'miniProgramTransports.ts'),
    ],
    outfile,
    bundle: true,
    format: 'cjs',
    platform: 'neutral',
    target: 'es2021',
    logLevel: 'silent',
  });
  transports = createRequire(import.meta.url)(outfile);
});

afterEach(() => {
  rmSync(tempDir, { recursive: true, force: true });
});

function fakeRequestPort() {
  const port = {
    calls: [],
    request(options) {
      port.calls.push(options);
      return { abort() {} };
    },
  };
  return port;
}

function fakeSocketTask() {
  const task = {
    sent: [],
    closed: [],
    readyState: 0,
    handlers: { open: [], message: [], close: [], error: [] },
    connectOptions: null,
    send(options) {
      task.sent.push(options.data);
    },
    close(options) {
      task.closed.push(options ?? {});
    },
    onOpen(cb) {
      task.handlers.open.push(cb);
    },
    onMessage(cb) {
      task.handlers.message.push(cb);
    },
    onClose(cb) {
      task.handlers.close.push(cb);
    },
    onError(cb) {
      task.handlers.error.push(cb);
    },
    emitOpen() {
      for (const cb of task.handlers.open) cb();
    },
    emitMessage(data) {
      for (const cb of task.handlers.message) cb({ data });
    },
    emitClose(code, reason) {
      for (const cb of task.handlers.close) cb({ code, reason });
    },
    emitError(errMsg) {
      for (const cb of task.handlers.error) cb({ errMsg });
    },
  };
  return task;
}

test('fetch_polyfill_resolves_success_responses_with_case_insensitive_headers', async () => {
  const port = fakeRequestPort();
  port.request = (options) => {
    port.calls.push(options);
    options.success({ statusCode: 200, header: { 'Content-Type': 'application/json' }, data: '{"code":0}' });
    return { abort() {} };
  };
  const fetchImpl = transports.createMiniProgramFetch(port);
  const response = await fetchImpl('https://im.example.com/im/v3/api/conversations', {
    method: 'POST',
    headers: { 'X-Test': '1' },
    body: '{}',
  });
  assert.equal(response.ok, true);
  assert.equal(response.status, 200);
  assert.equal(response.headers.get('content-type'), 'application/json');
  assert.deepEqual(await response.json(), { code: 0 });
  assert.equal(port.calls[0].url, 'https://im.example.com/im/v3/api/conversations');
  assert.equal(port.calls[0].method, 'POST');
  assert.equal(port.calls[0].data, '{}');
});

test('fetch_polyfill_rejects_transport_failures_and_honours_abort', async () => {
  const port = fakeRequestPort();
  port.request = (options) => {
    port.calls.push(options);
    if (port.calls.length === 1) {
      options.fail({ errMsg: 'request:fail timeout' });
    } else {
      // A real abort surfaces as a wx fail callback with an abort errMsg.
      return {
        abort() {
          options.fail({ errMsg: 'request:fail abort' });
        },
      };
    }
    return { abort() {} };
  };
  const fetchImpl = transports.createMiniProgramFetch(port);

  await assert.rejects(fetchImpl('https://im.example.com/x'), TypeError);

  const controller = new globalThis.AbortController();
  const pending = fetchImpl('https://im.example.com/x', { signal: controller.signal });
  controller.abort();
  await assert.rejects(pending, (error) => error.name === 'AbortError');
});

test('websocket_factory_maps_socket_task_events_send_and_close', () => {
  const task = fakeSocketTask();
  const factory = transports.createMiniProgramWebSocketFactory({
    connectSocket(options) {
      task.connectOptions = options;
      return task;
    },
  });

  const socket = factory('wss://im.example.com/ccp', { headers: { 'X-Test': '1' }, protocols: ['sdkwork-im-ccp'] });
  assert.equal(task.connectOptions.url, 'wss://im.example.com/ccp');
  assert.deepEqual(task.connectOptions.protocols, ['sdkwork-im-ccp']);

  const events = [];
  socket.addEventListener('open', () => events.push('open'));
  socket.addEventListener('message', (event) => events.push(`message:${event.data}`));
  socket.addEventListener('close', () => events.push('close'));
  socket.addEventListener('error', () => events.push('error'));

  task.emitOpen();
  task.emitMessage('frame-1');
  task.emitError('socket failure');
  task.emitClose(1000, 'done');
  socket.send('ping');
  socket.close(1000, 'bye');

  assert.deepEqual(events, ['open', 'message:frame-1', 'error', 'close']);
  assert.deepEqual(task.sent, ['ping']);
  assert.deepEqual(task.closed, [{ code: 1000, reason: 'bye' }]);
});

test('fetch_polyfill_installs_only_missing_globals', () => {
  const port = fakeRequestPort();
  const originalFetch = globalThis.fetch;
  try {
    delete globalThis.fetch;
    assert.equal(transports.installMiniProgramFetchPolyfill(port), true);
    assert.equal(typeof globalThis.fetch, 'function');
    // Second install sees a fetch already present.
    assert.equal(transports.installMiniProgramFetchPolyfill(port), false);
  } finally {
    if (originalFetch === undefined) {
      delete globalThis.fetch;
    } else {
      globalThis.fetch = originalFetch;
    }
  }
});

test('im_sdk_family_is_declared_at_the_spec_mandated_seams', () => {
  const readJson = (relative) => JSON.parse(readFileSync(path.join(surfaceRoot, relative), 'utf8'));

  // Root dependencies declare the composed consumer package once.
  const root = readJson('package.json');
  assert.equal(root.dependencies['@sdkwork/im-sdk'], 'workspace:*');
  assert.equal(root.dependencies['@sdkwork/sdk-common'], 'workspace:*');

  // Capability packages consume the composed client through their own deps.
  for (const pkg of ['sdkwork-whatseek-mp-messages', 'sdkwork-whatseek-mp-contacts']) {
    const manifest = readJson(`packages/${pkg}/package.json`);
    assert.equal(manifest.dependencies['@sdkwork/im-sdk'], 'workspace:*', pkg);
    const spec = readJson(`packages/${pkg}/specs/component.spec.json`);
    assert.deepEqual(spec.contracts.sdkClients, ['@sdkwork/im-sdk'], pkg);
  }

  // Core declares the dependency family.
  const coreSpec = readJson('packages/sdkwork-whatseek-mp-core/specs/component.spec.json');
  assert.deepEqual(coreSpec.contracts.sdkDependencies, [
    {
      workspace: 'sdkwork-im-sdk',
      surface: 'open-api',
      credentialMode: 'protected-open-api-api-key-or-dual-token',
    },
  ]);

  // Every runtime-env source carries the IM driver keys (empty = mock driver).
  for (const profile of ['development', 'test', 'staging', 'production']) {
    const env = readJson(`config/mini-program/runtime-env.standalone.${profile}.json`);
    assert.equal(typeof env.sdkworkImApiBaseUrl, 'string', profile);
    assert.equal(typeof env.sdkworkImWebSocketBaseUrl, 'string', profile);
  }
});

test('capability_im_adapters_stay_transport_free_and_wx_free', () => {
  const adapters = [
    'packages/sdkwork-whatseek-mp-messages/src/services/imMessagesClient.ts',
    'packages/sdkwork-whatseek-mp-contacts/src/services/imContactsClient.ts',
  ];
  for (const relative of adapters) {
    const source = readFileSync(path.join(surfaceRoot, relative), 'utf8');
    assert.ok(source.includes('@sdkwork/im-sdk'), relative);
    assert.ok(!source.includes('wx.'), `${relative} must not touch wx.*`);
    assert.ok(!/fetch\(|XMLHttpRequest|new WebSocket/u.test(source), `${relative} must not build transport`);
  }
});
