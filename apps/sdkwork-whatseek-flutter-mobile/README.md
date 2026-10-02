# WhatSeek Flutter Mobile (问寻)

Flutter mobile client (iOS/Android) of WhatSeek. Five bottom tabs map 1:1 to the cross-surface tabs (对话 Chat ｜ 应用 Apps ｜ 通讯录 Contacts ｜ 消息 Messages ｜ 我的 Profile); the Dart domain model mirrors the shared TS service contracts and is pinned by the route alignment test.

## Layout

- `lib/` — thin: `main.dart` → `bootstrap/runtime.dart` (environment, host adapters, IAM session, SDK clients) → `app.dart` (five-tab shell + detail routes).
- `packages/sdkwork_whatseek_flutter_mobile_*` — snake_case Dart packages: core (route table/domain/runtime/intent), commons, shell, and one capability package per tab.
- `env/` — dart-define identity files per deployment profile; `etc/` — the deployment index.
- `test/` — route alignment, chat router, and shell widget tests.

## Commands

```bash
flutter pub get
flutter analyze   # No issues found
flutter test      # 15 tests
```

Release (packaging milestone): `flutter build apk` / `flutter build appbundle` / `flutter build ipa` with `--dart-define-from-file env/sdkwork.<profileId>.json`.

## Standards

Agent entrypoint: `AGENTS.md`. Canonical specs: `FLUTTER_APP_MOBILE_ARCHITECTURE_SPEC.md`, `APP_FLUTTER_UI_SPEC.md`, `APP_CLIENT_ARCHITECTURE_ALIGNMENT_SPEC.md`.
