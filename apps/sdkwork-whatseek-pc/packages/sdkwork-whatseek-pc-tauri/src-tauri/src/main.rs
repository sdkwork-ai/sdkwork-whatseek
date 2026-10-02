//! WhatSeek desktop shell (Tauri v2): a native window hosting the PC browser
//! surface build (APP_PC_ARCHITECTURE_SPEC.md — one host package per shipped
//! architecture; window chrome belongs to the host, never to feature packages).
//!
//! The frontend is the canonical PC build output (`dist/standalone/prod`),
//! declared in `tauri.conf.json#build.frontendDist`.

#![warn(missing_docs)]

/// Application entry point: registers the WhatSeek window and runs the Tauri
/// event loop. No custom commands in the P0 milestone — the surface is the
/// standard webview load of the PC build.
fn main() {
    tauri::Builder::default()
        .run(tauri::generate_context!())
        .expect("error while running the WhatSeek desktop shell");
}
