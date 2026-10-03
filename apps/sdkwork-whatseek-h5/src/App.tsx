import { Suspense } from 'react';

import { useTranslation } from 'react-i18next';
import { Navigate, Route, Routes } from 'react-router-dom';

import { ScreenState } from '@sdkwork/whatseek-h5-commons';
import { partitionWhatseekRouteTable } from '@sdkwork/whatseek-h5-core';
import type { WhatseekRouteIdentity } from '@sdkwork/whatseek-h5-core';
import { MobileLayout, MobileStackLayout } from '@sdkwork/whatseek-h5-shell';

import { AuthGate } from './AuthGate.js';
import { whatseekRouteElements, whatseekRouteTable } from './bootstrap/routes.js';

/**
 * Root routes: AuthGate → presentation layouts → one route per composed
 * identity. The route-table partition is the only source of tab-bar
 * visibility (APP_H5_ARCHITECTURE_SPEC.md §11): tab roots mount inside
 * MobileLayout, secondary screens inside MobileStackLayout (no tab bar).
 * The mapping lives in src/bootstrap/routes.ts and is verified by
 * tests/route-alignment.test.ts.
 */
export function App() {
  const { t } = useTranslation();
  // Route-agnostic lazy fallback: ScreenState falls back to the generic
  // per-state copy (加载中…), never a specific tab's title.
  const fallback = <ScreenState state="loading" />;
  const { tabRoutes, stackRoutes } = partitionWhatseekRouteTable(whatseekRouteTable);
  const renderRoute = (route: WhatseekRouteIdentity) => {
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
  };
  return (
    <AuthGate>
      <Routes>
        <Route path="/" element={<Navigate to="/chat" replace />} />
        <Route element={<MobileLayout />}>{tabRoutes.map(renderRoute)}</Route>
        <Route element={<MobileStackLayout />}>{stackRoutes.map(renderRoute)}</Route>
        <Route path="*" element={<Navigate to="/chat" replace />} />
      </Routes>
    </AuthGate>
  );
}
