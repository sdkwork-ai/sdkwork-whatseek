# Repository Guidelines — apps/sdkwork-whatseek-common

## SDKWORK Soul

Agent execution follows `../../../sdkwork-specs/SOUL.md`: specs before memory, dictionary before context, evidence before completion, stop on ambiguity.

## SDKWORK Standards

Global authority: `../../../sdkwork-specs/README.md`, `../../../sdkwork-specs/AGENTS_SPEC.md`. This root follows `../../../sdkwork-specs/APP_CLIENT_ARCHITECTURE_ALIGNMENT_SPEC.md` (shared package-family root) and `APPLICATION_SPEC.md`/`MODULE_SPEC.md`.

## Application Identity

Shared package family `sdkwork-whatseek-common` — not a runnable client surface. Owns cross-architecture contracts, service ports, and domain logic with no UI runtime dependency.

## Local Dictionary Structure

- `packages/sdkwork-whatseek-route-core/` — route identity contract shared by every client surface.
- `packages/sdkwork-whatseek-intent-core/` — PRD §10.1 intent recognition shared by chat capabilities.
- Packages MUST NOT import surface UI implementations; surface packages MUST NOT import each other.

## Spec Resolution Order

Use dynamic progressive loading: read this file, then the task row in `../../../sdkwork-specs/README.md`, then only selected standards; implementation files last. Language-specific specs are on-demand only.

## Required Specs By Task Type

- Package changes: `../../../sdkwork-specs/COMPONENT_SPEC.md`, `../../../sdkwork-specs/MODULE_SPEC.md`, `../../../sdkwork-specs/TYPESCRIPT_CODE_SPEC.md` (on-demand only), `../../../sdkwork-specs/NAMING_SPEC.md`
- Route identity changes: `../../../sdkwork-specs/APP_CLIENT_ARCHITECTURE_ALIGNMENT_SPEC.md`

## Code Style Rules

TypeScript strict family; public exports stay at `src/index.ts`; no UI framework, no DOM, no `window`/`document` access — pure framework-agnostic logic only.

## Build, Test, and Verification

```bash
pnpm --filter @sdkwork/whatseek-route-core typecheck && pnpm --filter @sdkwork/whatseek-route-core test
pnpm --filter @sdkwork/whatseek-intent-core typecheck && pnpm --filter @sdkwork/whatseek-intent-core test
node ../../../sdkwork-specs/tools/check-workspace-packages-layout.mjs --root . --mode enforce
```

## Agent Execution Rules

Follow `../../../sdkwork-specs/SOUL.md`; develop on `main`; capture verification evidence before claiming completion.

## HTTP API Response Envelope

All L2+ SDKWork-owned custom HTTP contracts, including `app-api`, `backend-api`, and SDKWork-owned business `open-api`, `MUST` follow `API_SPEC.md` section 4.5, section 14, and section 15:

- **Default classification:** omitted `x-sdkwork-wire-protocol` means SDKWork-owned custom API (`sdkwork-v3`); only operation-level `x-sdkwork-wire-protocol: external` plus `x-sdkwork-external-protocol-id` identifies a third-party compatibility `open-api` operation.
- **Input:** typed request bodies, section 14.1 list/search/command input, `SdkWorkListQuery`, and `q` for free-text search.
- **Success output:** `SdkWorkApiResponse` with `{ "code": 0, "data": <payload>, "traceId": "<server-uuid>" }`.
- **Error output:** HTTP 4xx/5xx `application/problem+json` (`ProblemDetail`) with numeric `code` and `traceId`; SDKWork-owned errors may include `i18nKey` and `locale` presentation metadata.
- Success `code` is numeric `int32`; HTTP 2xx JSON bodies `MUST` use `0` only. REST semantics remain on HTTP status (`201`, `202`, etc.).
- Platform error codes are numeric non-zero values per section 15.3 (`40001`, `40101`, `40401`, …).
- Single resource: `data.item`
- Lists: `data.items` + `data.pageInfo` (`PageInfo.mode` is `offset` or `cursor`)
- Commands: `data.accepted` plus optional `resourceId` / `status`
- Async accept (`202`): `data.operationId`, `data.status`, optional `pollUrl`
- Operation patterns: retrieve/list/search/create/update/delete/command/async/bulk semantics follow `API_SPEC.md` section 15.4; create uses `201`, delete uses `204` with no JSON body, and `PUT`/`PATCH` use SDK action `update`.

Vendor compatibility `open-api` routes that mirror upstream tool or provider wire (for example OpenAI `/v1/*`, Anthropic/Claude `/anthropic/v1/*`, Google/Gemini `/google/v1beta/*`, Claude Code, or Codex) `MAY` opt out only when every exempt operation declares operation-level `x-sdkwork-wire-protocol: external` and `x-sdkwork-external-protocol-id` per `API_SPEC.md` section 4.5.2. SDKWork-owned business `open-api` operations `MUST NOT` opt out. Mixed OpenAPI documents are validated per operation; one external operation never exempts SDKWork-owned operations in the same document.

Errors `MUST` use HTTP 4xx/5xx with `application/problem+json` (`ProblemDetail`) including required numeric `code` and `traceId`. Optional `i18nKey` and `locale` are display metadata only. Business failures `MUST NOT` use HTTP 2xx with non-zero `code`, string wire codes, `success`, or human `message`.

Forbidden legacy envelopes and fields: `PlusApiResult`, `AppbaseApiResult`, `StoreApiResult`, `SdkWorkResponse`, per-domain `*ApiResult`, wire field `requestId`, bare domain DTOs at the HTTP root, and top-level `{ items, pageInfo, traceId }` without `data`.

Handlers `MUST` serialize success and map errors through `sdkwork-web-framework` response mapping. Generated HTTP SDKs (`--standard-profile sdkwork-v3`) unwrap `data` by default and expose typed numeric `ProblemDetail.code` / `traceId` and returned localization metadata on errors; use `.raw` when the full envelope is required.

Before completing API contract, SDK generation, or frontend service work, run:

```bash
node <sdkwork-specs>/tools/check-api-operation-patterns.mjs --workspace <workspace-root>
node <sdkwork-specs>/tools/check-api-response-envelope.mjs --workspace <workspace-root>
```

Authority: `sdkwork-specs/API_SPEC.md` section 4.5 and sections 14–16, `SDK_SPEC.md` section 4.2, `FRONTEND_SPEC.md`, `MIGRATION_SPEC.md` section 4.2.

## Human Review Rules

Human review before landing: contract changes (they propagate to every client surface), new packages, dependency additions.

## Main-Branch Development

Authority: `../../../sdkwork-specs/REPOSITORY_BASELINE_SPEC.md`. Develop on `main` directly.
