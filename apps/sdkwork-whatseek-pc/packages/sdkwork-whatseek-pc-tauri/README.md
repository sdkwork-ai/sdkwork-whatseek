# sdkwork-whatseek-pc-tauri

Tauri v2 desktop host for the WhatSeek PC surface (APP_PC_ARCHITECTURE_SPEC.md: exactly one host package per shipped architecture; window chrome lives here, never in feature packages).

- `src-tauri/` — Cargo project (`tauri` v2 + `tauri-build`); `tauri.conf.json#build.frontendDist` points at the canonical PC build output `../../dist/standalone/prod`.
- `scripts/gen-icon.mjs` — generates the embedded Windows application icon (`src-tauri/icons/icon.ico`) programmatically.

## Commands (from the PC surface root)

```bash
pnpm dev:desktop            # cargo run (dev build)
pnpm build:desktop          # canonical PC prod build + cargo build --release
```

The desktop milestone ships the Windows shell first (`bin/windows/`); macOS/Linux hosts follow the same Cargo project per `MODULE_BIN_SPEC.md` when packaging activates.
