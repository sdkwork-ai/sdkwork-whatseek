/// <reference types="vitest/config" />
import { resolve } from 'node:path';

import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

import { resolveBrowserDistOutDir } from '../../../sdkwork-specs/tools/browser-dist-layout.mjs';
import {
  resolveViteEnvironment,
  resolveViteRuntimeProfile,
} from '../../../sdkwork-specs/tools/vite-runtime-profile.mjs';

export default defineConfig(({ mode }) => {
  const environment = resolveViteEnvironment(mode);
  const runtimeProfile = resolveViteRuntimeProfile(mode);
  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': resolve(import.meta.dirname, 'src'),
      },
    },
    server: {
      port: 3200,
      host: '0.0.0.0',
    },
    build: {
      outDir: resolveBrowserDistOutDir(environment),
      emptyOutDir: true,
    },
    test: {
      environment: 'jsdom',
      include: ['tests/**/*.test.?(c|m)[jt]s?(x)'],
    },
    define: {
      __SDKWORK_PROFILE_ID__: JSON.stringify(runtimeProfile.profileId),
    },
  };
});
