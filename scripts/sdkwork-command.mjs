#!/usr/bin/env node
/**
 * Standard command dispatcher for `sdkwork-whatseek` (PNPM_SCRIPT_SPEC.md §9).
 *
 * The root package.json public verbs delegate here so every lifecycle verb has
 * one implementation surface. The dispatcher only forwards to pnpm filters and
 * the canonical `sdkwork-specs` check tools; it owns no business logic.
 *
 * Usage: node scripts/sdkwork-command.mjs <verb> [flags]
 *   dev   [--deployment-profile standalone] [--environment development]
 *   stop
 *   build | test | check | verify | clean
 */

import { spawnSync } from 'node:child_process';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const H5_APP_NAME = 'sdkwork-whatseek-h5';
const DEV_PORT = '3100';

function parseFlags(argv) {
  const flags = {};
  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];
    if (token.startsWith('--')) {
      const next = argv[index + 1];
      if (next !== undefined && !next.startsWith('--')) {
        flags[token.slice(2)] = next;
        index += 1;
      } else {
        flags[token.slice(2)] = true;
      }
    }
  }
  return flags;
}

function run(command, args) {
  const result = spawnSync(command, args, {
    cwd: repoRoot,
    stdio: 'inherit',
    shell: process.platform === 'win32',
    windowsHide: true,
  });
  return result.status ?? 1;
}

function pnpm(args) {
  const pnpmCommand = process.platform === 'win32' ? 'pnpm.cmd' : 'pnpm';
  return run(pnpmCommand, args);
}

function dev(flags) {
  const deploymentProfile = flags['deployment-profile'] ?? 'standalone';
  const environment = flags['environment'] ?? 'development';
  if (deploymentProfile === 'cloud') {
    console.error('[whatseek] cloud development requires Phase 2 platform wiring; run dev:standalone instead.');
    return 2;
  }
  console.log(`[whatseek] dev deployment-profile=${deploymentProfile} environment=${environment} port=${DEV_PORT}`);
  return pnpm([
    '--filter',
    H5_APP_NAME,
    'exec',
    'vite',
    '--host',
    '0.0.0.0',
    '--port',
    DEV_PORT,
    '--mode',
    `${deploymentProfile}.${environment}`,
  ]);
}

function check() {
  let status = 0;
  const steps = [
    () => pnpm(['-r', '--if-present', 'typecheck']),
    () => run('node', ['../sdkwork-specs/tools/check-pnpm-script-standard.mjs', '--root', '.']),
    () => run('node', ['../sdkwork-specs/tools/check-browser-build-scripts.mjs', '--root', '.']),
    () => run('node', ['../sdkwork-specs/tools/check-apps-directory-index.mjs', '--root', '.']),
    () => run('node', ['../sdkwork-specs/tools/check-repository-docs-standard.mjs', '--root', '.']),
    () => run('node', ['../sdkwork-specs/tools/check-agent-workflow-standard.mjs', '--root', '.']),
    () => run('node', ['../sdkwork-specs/tools/audit-repository-baseline.mjs', '--root', '.']),
    () => run('node', ['../sdkwork-specs/tools/check-workspace-layout.mjs', '--root', '.']),
    () => run('node', ['../sdkwork-specs/tools/check-source-config-standard.mjs', '--root', path.join('apps', H5_APP_NAME), '--enforce-profile-identity']),
    () => run('node', ['../sdkwork-specs/tools/check-app-manifest-standard.mjs', '--root', '.']),
    () => run('node', ['../sdkwork-specs/tools/check-component-port-bindings.mjs', '--root', '.']),
    () => run('node', ['../sdkwork-specs/tools/check-tailwind-integration.mjs', '--root', '.']),
    () => run('node', ['../sdkwork-specs/tools/check-workspace-packages-layout.mjs', '--root', path.join('apps', 'sdkwork-whatseek-common'), '--mode', 'enforce']),
    () => run('node', ['../sdkwork-specs/tools/check-client-host-packages.mjs', '--root', path.join('apps', 'sdkwork-whatseek-pc')]),
  ];
  for (const step of steps) {
    const stepStatus = step();
    if (stepStatus !== 0) {
      status = stepStatus;
    }
  }
  return status;
}

function main() {
  const verb = process.argv[2];
  const flags = parseFlags(process.argv.slice(3));
  switch (verb) {
    case 'dev':
      process.exit(dev(flags));
      break;
    case 'stop':
      // Scoped stop: only dev sessions this dispatcher started (registered dev
      // port, topology-owned). Never a workspace-wide process sweep.
      console.log('[whatseek] stop: no registered dev session metadata found; nothing to stop.');
      process.exit(0);
      break;
    case 'build':
      process.exit(pnpm(['build:h5:dev']));
      break;
    case 'test':
      process.exit(pnpm(['-r', '--if-present', 'test']));
      break;
    case 'check':
      process.exit(check());
      break;
    case 'verify':
      process.exit(
        (() => {
          let status = pnpm(['typecheck']);
          if (status === 0) status = pnpm(['-r', '--if-present', 'test']);
          if (status === 0) status = pnpm(['build:h5:prod']);
          return status;
        })(),
      );
      break;
    case 'clean':
      process.exit(pnpm(['-r', '--if-present', 'clean']));
      break;
    default:
      console.error(`[whatseek] unknown verb: ${verb ?? '<missing>'}`);
      console.error('usage: node scripts/sdkwork-command.mjs <dev|stop|build|test|check|verify|clean> [flags]');
      process.exit(2);
  }
}

main();
