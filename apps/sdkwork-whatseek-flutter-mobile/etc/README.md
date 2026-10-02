# etc/ — Source Configuration (apps/sdkwork-whatseek-flutter-mobile)

Source configuration for the WhatSeek Flutter mobile deployable root. Authority: `../../../sdkwork-specs/SOURCE_CONFIG_SPEC.md`, `ENVIRONMENT_SPEC.md`.

- Profile index: `sdkwork.deployment.config.json` (`kind: sdkwork.component-deployment`) mapping each standalone profile to its dart-define source.
- Runtime sources: `../env/sdkwork.<profileId>.json` — `--dart-define-from-file` inputs declaring `SDKWORK_ENVIRONMENT`, `SDKWORK_DEPLOYMENT_PROFILE`, `SDKWORK_PROFILE_ID`, `SDKWORK_RUNTIME_TARGET` (read by `lib/bootstrap/environment.dart`).
- Consumption: `flutter run --dart-define-from-file env/sdkwork.standalone.development.json` / `flutter build apk --dart-define-from-file env/sdkwork.standalone.production.json`.
- Standalone-only milestone; cloud profiles arrive with Phase 2 platform wiring.
