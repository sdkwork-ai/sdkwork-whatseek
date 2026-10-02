# Operator Guide

Deployment artifacts, launch steps, and incident entrypoints for the five
WhatSeek surfaces.

**Primary reference: [../runbooks/RUNBOOK-multi-surface-operations.md](../runbooks/RUNBOOK-multi-surface-operations.md)**
— per-surface build commands, artifact paths, smoke steps, and recovery.

Quick map:

| Surface | Artifact | Launch |
| --- | --- | --- |
| H5 (primary) | `apps/sdkwork-whatseek-h5/dist/standalone/prod/` | Any static host with SPA index fallback |
| PC browser | `apps/sdkwork-whatseek-pc/dist/standalone/prod/` | Same static-host shape |
| Windows desktop | `…/src-tauri/target/release/sdkwork-whatseek-pc-tauri.exe` | Self-contained executable |
| WeChat mini-program | `apps/sdkwork-whatseek-mini-program/src/` (runtime bundle required) | WeChat DevTools, `miniprogramRoot=src/` |
| Flutter mobile | source tree (store packaging is a declared non-goal) | `flutter run` on a device/emulator |

Current milestone posture: mock-backed standalone (no live backend). Pre-store
smoke for the mini-program requires WeChat DevTools rendering — the Node test
suites cover logic and contract, not WXML rendering.
