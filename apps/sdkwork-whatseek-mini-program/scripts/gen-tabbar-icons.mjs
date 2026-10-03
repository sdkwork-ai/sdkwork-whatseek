// Tab-bar icon generator (APP_MINI_PROGRAM_UI_SPEC §7 icon-state norm):
// renders the five tab glyphs as 81×81 RGBA PNG pairs — outline for the
// unselected tab, filled for the selected tab. Pure Node (zlib + manual PNG
// chunks), 4×4 supersampled anti-aliasing. Rerun after changing glyphs:
//   node scripts/gen-tabbar-icons.mjs
import { deflateSync } from 'node:zlib';
import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const SIZE = 81;
const SS = 3; // supersampling factor per axis
const OUTLINE = { r: 0x71, g: 0x71, b: 0x71, a: 255 }; // --text-muted
const FILLED = { r: 0x16, g: 0x77, b: 0xff, a: 255 }; // --brand #1677ff
const OUT_DIR = path.join(process.cwd(), 'src', 'assets', 'tabbar');

/* ---------- geometry helpers (all in a 81×81 unit space) ---------- */

const circle = (cx, cy, r, segments = 28) =>
  Array.from({ length: segments }, (_, i) => {
    const angle = (2 * Math.PI * i) / segments;
    return [cx + r * Math.cos(angle), cy + r * Math.sin(angle)];
  });

function roundedRect(x, y, w, h, chamfer) {
  return [
    [x + chamfer, y],
    [x + w - chamfer, y],
    [x + w, y + chamfer],
    [x + w, y + h - chamfer],
    [x + w - chamfer, y + h],
    [x + chamfer, y + h],
    [x, y + h - chamfer],
    [x, y + chamfer],
  ];
}

const scaleAbout = (polygon, factor) => {
  const cx = polygon.reduce((sum, p) => sum + p[0], 0) / polygon.length;
  const cy = polygon.reduce((sum, p) => sum + p[1], 0) / polygon.length;
  return polygon.map(([x, y]) => [cx + (x - cx) * factor, cy + (y - cy) * factor]);
};

const STAR_SPIKES = 26; // outer radius of the sparkle
const sparkle = (cx, cy) => {
  const points = [];
  const inner = STAR_SPIKES * 0.28;
  for (let i = 0; i < 8; i += 1) {
    const angle = (Math.PI / 4) * i - Math.PI / 2;
    const radius = i % 2 === 0 ? STAR_SPIKES : inner;
    points.push([cx + radius * Math.cos(angle), cy + radius * Math.sin(angle)]);
  }
  return [points];
};

// Each glyph: list of polygons; a pixel is covered when it is inside an odd
// set of polygons is too fiddly for overlays — we use union semantics and
// let overlapping solids just paint twice (same color).
const GLYPHS = {
  chat: sparkle(40.5, 42),
  apps: [
    roundedRect(14, 14, 22, 22, 5),
    roundedRect(45, 14, 22, 22, 5),
    roundedRect(14, 45, 22, 22, 5),
    roundedRect(45, 45, 22, 22, 5),
  ],
  contacts: [
    circle(31, 28, 10),
    [[16, 62], [18, 48], [26, 41], [36, 41], [44, 48], [46, 62]],
    circle(55, 30, 8),
    [[50, 62], [52, 51], [58, 45], [65, 46], [70, 52], [71, 62]],
  ],
  messages: [
    roundedRect(13, 18, 55, 40, 9),
    [[24, 58], [44, 58], [30, 72]],
  ],
  profile: [
    circle(40.5, 27, 12),
    [[17, 66], [20, 50], [30, 42], [51, 42], [61, 50], [64, 66]],
  ],
};

function pointInPolygon(point, polygon) {
  const [x, y] = point;
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i, i += 1) {
    const [xi, yi] = polygon[i];
    const [xj, yj] = polygon[j];
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) {
      inside = !inside;
    }
  }
  return inside;
}

const inAny = (point, polygons) => polygons.some((polygon) => pointInPolygon(point, polygon));

function coverage(point, polygons, mode) {
  let hits = 0;
  for (let sy = 0; sy < SS; sy += 1) {
    for (let sx = 0; sx < SS; sx += 1) {
      const sample = [point[0] + (sx + 0.5) / SS, point[1] + (sy + 0.5) / SS];
      const covered =
        mode === 'filled' ? inAny(sample, polygons) : inAny(sample, polygons) && !inAny(sample, polygons.map((p) => scaleAbout(p, 0.7)));
      if (covered) {
        hits += 1;
      }
    }
  }
  return hits / (SS * SS);
}

function renderPolygons(polygons, mode, color) {
  const raw = Buffer.alloc(SIZE * SIZE * 4);
  for (let y = 0; y < SIZE; y += 1) {
    for (let x = 0; x < SIZE; x += 1) {
      const alpha = coverage([x + 0.5, y + 0.5], polygons, mode);
      const offset = (y * SIZE + x) * 4;
      raw[offset] = color.r;
      raw[offset + 1] = color.g;
      raw[offset + 2] = color.b;
      raw[offset + 3] = Math.round(alpha * color.a);
    }
  }
  return raw;
}

/* ---------- minimal PNG encoder ---------- */

const crcTable = Array.from({ length: 256 }, (_, n) => {
  let c = n;
  for (let k = 0; k < 8; k += 1) {
    c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  }
  return c >>> 0;
});

function crc32(buffer) {
  let crc = 0xffffffff;
  for (const byte of buffer) {
    crc = crcTable[(crc ^ byte) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length);
  const body = Buffer.concat([Buffer.from(type, 'ascii'), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body));
  return Buffer.concat([length, body, crc]);
}

function encodePng(raw) {
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(SIZE, 0);
  ihdr.writeUInt32BE(SIZE, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // color type RGBA
  const rows = [];
  for (let y = 0; y < SIZE; y += 1) {
    rows.push(Buffer.concat([Buffer.from([0]), raw.subarray(y * SIZE * 4, (y + 1) * SIZE * 4)]));
  }
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(Buffer.concat(rows))),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

/* ---------- emit ---------- */

mkdirSync(OUT_DIR, { recursive: true });
for (const [name, polygons] of Object.entries(GLYPHS)) {
  for (const [mode, color] of [['outline', OUTLINE], ['filled', FILLED]]) {
    const file = path.join(OUT_DIR, `${name}-${mode}.png`);
    writeFileSync(file, encodePng(renderPolygons(polygons, mode, color)));
    console.log('tabbar icon', path.basename(file));
  }
}
