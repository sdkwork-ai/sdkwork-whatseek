# Integrator Guide

How external systems will integrate with WhatSeek — and the current boundary.

## Current milestone (mock-backed standalone)

All five surfaces consume the shared service family
(`apps/sdkwork-whatseek-common/packages/sdkwork-whatseek-service-core`):
typed ports plus in-memory mock clients. There is **no live HTTP contract,
no generated SDK, and no API envelope** in this milestone — integrators
should not wire against anything else yet.

## When the first real SDK family lands

- Generated app SDK clients are imported only through each surface's
  bootstrap layer (`src/bootstrap/sdkClients.ts` shape; mini-program:
  `src/bootstrap/runtime.ts`), never inside UI components —
  `../sdkwork-specs/APP_SDK_INTEGRATION_SPEC.md` owns this routing (§9 for
  the consumer-imports managed text).
- HTTP response envelopes and error shapes follow
  `../sdkwork-specs/API_SPEC.md`; int64 values are `type: string, format:
  int64` (API_SPEC §13.6).
- List/search endpoints adopt `../sdkwork-specs/PAGINATION_SPEC.md` once
  server pagination exists.

## What stays stable

The cross-surface seams are the 13 route ids
(`app.whatseek.<capability>.<screen>`), the i18n key namespace
(`whatseek.<capability>.<screen>.<key>`), and the service ports in
`service-core/src/ports.ts`. Phase 2 swaps mock client registrations for
generated SDK clients behind the identical ports — UI and page layers do not
change.
