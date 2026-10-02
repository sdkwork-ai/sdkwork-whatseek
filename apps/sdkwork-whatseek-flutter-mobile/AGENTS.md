# Repository Guidelines — apps/sdkwork-whatseek-flutter-mobile

## SDKWORK Soul

Agent execution follows `../../../sdkwork-specs/SOUL.md`: specs before memory, dictionary before context, evidence before completion, stop on ambiguity.

## SDKWORK Standards

Use `../../../sdkwork-specs/README.md` and `../../../sdkwork-specs/AGENTS_SPEC.md` as the global authority. Repository entrypoint: `../../AGENTS.md`.

## Application Identity

App surface: `sdkwork_whatseek_flutter_mobile` — the Flutter mobile client (iOS/Android) of WhatSeek (问寻). Domain `whatseek`; five bottom tabs (对话/应用/通讯录/消息/我的) rendered by the shell; runtime target `flutter-android` first, `flutter-ios` in packaging.

## Local Dictionary Structure

- `lib/` stays thin: `main.dart`, `app.dart`, `auth_gate.dart`, `bootstrap/{environment,runtime,sdk_clients,iam_runtime,host_adapters,routes}.dart` — bootstrap owns all composition.
- `packages/sdkwork_whatseek_flutter_mobile_*` — snake_case Dart capability packages (lower snake_case per `../../../sdkwork-specs/NAMING_SPEC.md`); one state pattern per root (controllers/`ChangeNotifier`); platform access only through the typed adapter ports in `bootstrap/host_adapters.dart` — never plugin classes or method channels in feature code.
- `env/sdkwork.<profileId>.json` — dart-define identity files (`--dart-define-from-file`); `config/` — app/host examples; `etc/` — the deployment index.

## Spec Resolution Order

Use dynamic progressive loading: read this file, then the app declaration, then the task row in `../../../sdkwork-specs/README.md`, then only selected standards; implementation files last. Language-specific standards load on demand only.

## Required Specs By Task Type

- Surface work: `../../../sdkwork-specs/FLUTTER_APP_MOBILE_ARCHITECTURE_SPEC.md`, `../../../sdkwork-specs/APP_FLUTTER_UI_SPEC.md`, `../../../sdkwork-specs/APP_CLIENT_ARCHITECTURE_ALIGNMENT_SPEC.md`
- Frontend language standard: `../../../sdkwork-specs/FRONTEND_CODE_SPEC.md`; language specs are on-demand only
- Dart language: `../../../sdkwork-specs/DART_CODE_SPEC.md`; language specs are on-demand only
- Config: `../../../sdkwork-specs/SOURCE_CONFIG_SPEC.md`, `../../../sdkwork-specs/ENVIRONMENT_SPEC.md` (this root owns `etc/` as its deployable-root source configuration)
- Naming: `../../../sdkwork-specs/NAMING_SPEC.md` (lower snake_case with the `flutter_mobile` segment)
- Commands/workflows: `../../../sdkwork-specs/PNPM_SCRIPT_SPEC.md`, `../../../sdkwork-specs/GITHUB_WORKFLOW_SPEC.md`
- List/search: `PAGINATION_SPEC.md` (run `check-pagination.mjs` once server pagination exists)

## Code Style Rules

Route ids come from the core route table and align with H5/PC/mini-program; screens cover loading/empty/validation-error/permission-denied/unknown states; i18n fragments live under `lib/src/i18n/<locale>/<domain>/<capability>/` per package. Shared domain logic lives in the common service family conceptually — the Dart model is a declared mirror asserted by the route alignment test.

## Build, Test, and Verification

```bash
flutter pub get
flutter analyze
flutter test
```

Release preflight: `flutter build apk` / `flutter build appbundle` / `flutter build ipa` (packaging milestone).

## Agent Execution Rules

Follow `../../../sdkwork-specs/SOUL.md`; develop on `main`; capture verification evidence before claiming completion.

## Human Review Rules

Human review before landing: route table changes, pubspec dependency additions, platform-adapter contract changes, packaging workflows.

## Main-Branch Development

Authority: `../../../sdkwork-specs/REPOSITORY_BASELINE_SPEC.md`. Develop on `main` directly.
