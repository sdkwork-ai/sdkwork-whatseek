# sdkwork-whatseek-h5-core

Composition root for the WhatSeek H5 application: shared domain types, route identity contracts, SDK client ports (injected at bootstrap), session state, color-mode/theme utilities, i18n bootstrap, and tab-badge state.

Follows `../../../../../sdkwork-specs/APP_H5_ARCHITECTURE_SPEC.md` (reserved role `core`) and `COMPONENT_SPEC.md`. Dependency direction: nothing inside the app may depend on a lower layer than this package.

## Public Exports (`src/index.ts`)

- Domain model types (`WhatseekApp`, `CreatedApp`, `Contact`, `Conversation`, `ChatMessage`, `WhatseekTask`, intents).
- Route identity helpers (`defineWhatseekRoutes`, `composeWhatseekRouteTable`).
- SDK ports + registry (`AppsPort`, `ContactsPort`, `MessagesPort`, `TasksPort`, `ChatPort`, `registerWhatseekClient`, `getWhatseekClient`).
- `useSessionStore`, `useTabBadgeStore`, `applyColorMode`, `readInitialColorMode`, `createWhatseekI18n`, `mergeWhatseekResources`.
