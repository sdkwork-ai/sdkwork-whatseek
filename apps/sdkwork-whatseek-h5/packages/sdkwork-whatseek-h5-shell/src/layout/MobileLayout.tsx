import { Outlet } from 'react-router-dom';

import { TabBar } from '../navigation/TabBar.js';

/**
 * Phone-first navigation container: content column + bottom tab bar with safe
 * area handling (APP_H5_ARCHITECTURE_SPEC.md §10). All five tabs render inside
 * this layout via the router outlet.
 */
export function MobileLayout() {
  return (
    <div className="mx-auto flex h-dvh w-full max-w-[42rem] flex-col bg-canvas text-primary">
      <main className="min-h-0 flex-1 overflow-y-auto">
        <Outlet />
      </main>
      <TabBar />
    </div>
  );
}
