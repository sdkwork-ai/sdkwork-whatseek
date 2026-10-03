import type { ReactNode } from 'react';

import { Outlet } from 'react-router-dom';

/**
 * Shared phone-first content column behind the shell layouts (APP_H5_
 * ARCHITECTURE_SPEC.md §10): centered max-width column with a scrollable main
 * region; bottom navigation chrome is injected by the layout that mounts it.
 * Without bottom chrome the column itself carries the bottom safe-area inset
 * so sticky screen actions keep clear of the home indicator.
 */
export function ShellColumn({ bottomChrome }: { bottomChrome?: ReactNode }) {
  return (
    <div
      className={
        bottomChrome
          ? 'mx-auto flex h-dvh w-full max-w-[42rem] flex-col bg-canvas text-primary'
          : 'mx-auto flex h-dvh w-full max-w-[42rem] flex-col bg-canvas pb-[max(env(safe-area-inset-bottom),0.25rem)] text-primary'
      }
    >
      <main className="min-h-0 flex-1 overflow-y-auto">
        <Outlet />
      </main>
      {bottomChrome}
    </div>
  );
}
