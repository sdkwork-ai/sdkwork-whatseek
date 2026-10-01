import { Suspense } from 'react';

import { useTranslation } from 'react-i18next';
import { Navigate, Route, Routes } from 'react-router-dom';

import { ScreenState } from '@sdkwork/whatseek-pc-commons';
import { DesktopLayout } from '@sdkwork/whatseek-pc-shell';

import { AuthGate } from './AuthGate.js';
import { whatseekPcRouteElements, whatseekPcRouteTable } from './bootstrap/routes.js';

/**
 * Root routes for the PC surface: AuthGate → DesktopLayout (navigation rail +
 * content) → one route per composed identity.
 */
export function App() {
  const { t } = useTranslation();
  const fallback = <ScreenState state="loading" titleKey="whatseek.chat.home.title" />;
  return (
    <AuthGate>
      <Routes>
        <Route element={<DesktopLayout />}>
          <Route path="/" element={<Navigate to="/chat" replace />} />
          {whatseekPcRouteTable.map((route) => {
            const Element = whatseekPcRouteElements[route.id];
            if (Element === undefined) {
              throw new Error(`route identity ${route.id} has no mounted element`);
            }
            return (
              <Route
                key={route.id}
                path={route.path}
                element={
                  <Suspense fallback={fallback}>
                    <Element />
                  </Suspense>
                }
                aria-label={t(route.titleKey)}
              />
            );
          })}
          <Route path="*" element={<Navigate to="/chat" replace />} />
        </Route>
      </Routes>
    </AuthGate>
  );
}
