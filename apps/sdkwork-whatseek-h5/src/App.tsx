import { Suspense } from 'react';

import { useTranslation } from 'react-i18next';
import { Navigate, Route, Routes } from 'react-router-dom';

import { ScreenState } from '@sdkwork/whatseek-h5-commons';
import { MobileLayout } from '@sdkwork/whatseek-h5-shell';

import { AuthGate } from './AuthGate.js';
import { whatseekRouteElements, whatseekRouteTable } from './bootstrap/routes.js';

/**
 * Root routes: AuthGate → MobileLayout (five-tab shell) → one route per
 * composed identity. The mapping lives in src/bootstrap/routes.ts and is
 * verified by tests/route-alignment.test.ts.
 */
export function App() {
  const { t } = useTranslation();
  const fallback = <ScreenState state="loading" titleKey="whatseek.chat.home.title" />;
  return (
    <AuthGate>
      <Routes>
        <Route element={<MobileLayout />}>
          <Route path="/" element={<Navigate to="/chat" replace />} />
          {whatseekRouteTable.map((route) => {
            const Element = whatseekRouteElements[route.id];
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
