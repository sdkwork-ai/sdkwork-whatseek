// One-shot generator for a valid 32x32 32bpp ICO (WhatSeek brand blue), so the
// Tauri Windows build has an embedded application icon without binary assets
// in review. Run: node scripts/gen-icon.mjs
import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const width = 32;
const height = 32;

// BITMAPINFOHEADER (40 bytes, bottom-up rows), 32bpp BGRA.
const pixelData = Buffer.alloc(width * height * 4);
const brand = { r: 0x25, g: 0x63, b: 0xeb }; // #2563eb
for (let y = 0; y < height; y += 1) {
  for (let x = 0; x < width; x += 1) {
    // Rounded-square mask: transparent outside a centered rounded rect.
    const dx = Math.min(x, width - 1 - x);
    const dy = Math.min(y, height - 1 - y);
    const inside = dx + dy >= 6;
    const offset = ((height - 1 - y) * width + x) * 4;
    pixelData[offset] = inside ? brand.b : 0;
    pixelData[offset + 1] = inside ? brand.g : 0;
    pixelData[offset + 2] = inside ? brand.r : 0;
    pixelData[offset + 3] = inside ? 255 : 0;
  }
}
const andMask = Buffer.alloc((width / 8) * height);

const bitmap = Buffer.alloc(40);
bitmap.writeUInt32LE(40, 0); // biSize
bitmap.writeInt32LE(width, 4); // biWidth
bitmap.writeInt32LE(height * 2, 8); // biHeight (XOR + AND)
bitmap.writeUInt16LE(1, 12); // biPlanes
bitmap.writeUInt16LE(32, 14); // biBitCount
bitmap.writeUInt32LE(0, 20); // biCompression = BI_RGB
bitmap.writeUInt32LE(pixelData.length + andMask.length, 20); // biSizeImage

const image = Buffer.concat([bitmap, pixelData, andMask]);

const header = Buffer.alloc(6);
header.writeUInt16LE(0, 0); // reserved
header.writeUInt16LE(1, 2); // type = icon
header.writeUInt16LE(1, 4); // count

const entry = Buffer.alloc(16);
entry.writeUInt8(width, 0);
entry.writeUInt8(height, 1);
entry.writeUInt8(0, 2); // palette
entry.writeUInt8(0, 3); // reserved
entry.writeUInt16LE(1, 4); // planes
entry.writeUInt16LE(32, 6); // bitcount
entry.writeUInt32LE(image.length, 8);
entry.writeUInt32LE(6 + 16, 12); // offset

const outDir = path.join(process.cwd(), 'src-tauri', 'icons');
mkdirSync(outDir, { recursive: true });
writeFileSync(path.join(outDir, 'icon.ico'), Buffer.concat([header, entry, image]));
console.log('[gen-icon] wrote src-tauri/icons/icon.ico');
