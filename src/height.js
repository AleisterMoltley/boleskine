import { WORLD, POI } from './config.js';
import { clamp, fbm, hash2, segDist2, smoothstep } from './math.js';

const PATHS = [
  [POI.manor.x, POI.manor.z, POI.spawn.x, POI.spawn.z],
  [POI.spawn.x, POI.spawn.z, POI.plaza.x, POI.plaza.z],
  [POI.plaza.x, POI.plaza.z, POI.kirk.x, POI.kirk.z],
  [POI.plaza.x, POI.plaza.z, POI.wood.x, POI.wood.z],
  [POI.plaza.x, POI.plaza.z, POI.village.x, POI.village.z],
  [POI.village.x, POI.village.z, POI.abbey.x, POI.abbey.z],
  [POI.plaza.x, POI.plaza.z, POI.abbey.x, POI.abbey.z],
  [POI.kirk.x, POI.kirk.z, POI.willow.x, POI.willow.z],
  [POI.kirk.x, POI.kirk.z, POI.spiral.x, POI.spiral.z],
  [POI.manor.x, POI.manor.z, POI.pier.x, POI.pier.z],
  [POI.village.x, POI.village.z, POI.spiral.x, POI.spiral.z],
  [POI.manor.x, POI.manor.z, POI.cairo.x, POI.cairo.z],
  [POI.cairo.x, POI.cairo.z, POI.plaza.x, POI.plaza.z],
  [POI.plaza.x, POI.plaza.z, POI.vault.x, POI.vault.z],
  [POI.wood.x, POI.wood.z, POI.hollow.x, POI.hollow.z],
  [POI.hollow.x, POI.hollow.z, POI.spawn.x, POI.spawn.z],
  [POI.village.x, POI.village.z, POI.press.x, POI.press.z],
  [POI.pier.x, POI.pier.z, POI.nether.x, POI.nether.z],
  [POI.plaza.x, POI.plaza.z, POI.fullness.x, POI.fullness.z],
  [POI.fullness.x, POI.fullness.z, POI.daath.x, POI.daath.z],
  [POI.vault.x, POI.vault.z, POI.daath.x, POI.daath.z],
  [POI.nether.x, POI.nether.z, POI.lam.x, POI.lam.z],
  [POI.wood.x, POI.wood.z, POI.marks.x, POI.marks.z],
  [POI.spawn.x, POI.spawn.z, POI.mile.x, POI.mile.z],
  [POI.mile.x, POI.mile.z, POI.plaza.x, POI.plaza.z],
  [POI.plaza.x, POI.plaza.z, POI.tworoads.x, POI.tworoads.z],
  [POI.tworoads.x, POI.tworoads.z, POI.village.x, POI.village.z],
  [POI.press.x, POI.press.z, POI.ink.x, POI.ink.z],
  [POI.wood.x, POI.wood.z, POI.mothwell.x, POI.mothwell.z],
  [POI.hollow.x, POI.hollow.z, POI.bonegate.x, POI.bonegate.z],
  [POI.kirk.x, POI.kirk.z, POI.ashrow.x, POI.ashrow.z],
  [POI.ashrow.x, POI.ashrow.z, POI.willow.x, POI.willow.z],
];

const FLATS = [
  { x: POI.plaza.x, z: POI.plaza.z, r: 16, h: 6.15 },
  { x: POI.manor.x, z: POI.manor.z, r: 14, h: 14.2 },
  { x: POI.spawn.x, z: POI.spawn.z, r: 8, h: 12.6 },
  { x: POI.kirk.x, z: POI.kirk.z, r: 12, h: 8.4 },
  { x: POI.village.x, z: POI.village.z, r: 16, h: 6.8 },
  { x: POI.abbey.x, z: POI.abbey.z, r: 14, h: 7.6 },
  { x: POI.wood.x, z: POI.wood.z, r: 8, h: 6.4 },
  { x: POI.willow.x, z: POI.willow.z, r: 6, h: 7.2 },
  { x: POI.spiral.x, z: POI.spiral.z, r: 7, h: 16.4 },
  { x: POI.cairo.x, z: POI.cairo.z, r: 8, h: 11.4 },
  { x: POI.vault.x, z: POI.vault.z, r: 8, h: 6.35 },
  { x: POI.hollow.x, z: POI.hollow.z, r: 9, h: 3.8 },
  { x: POI.press.x, z: POI.press.z, r: 6, h: 6.6 },
  { x: POI.nether.x, z: POI.nether.z, r: 5, h: 2.15 },
  { x: POI.iron.x, z: POI.iron.z, r: 10, h: 6.4 },
  { x: POI.crater.x, z: POI.crater.z, r: 14, h: 4.2 },
  { x: POI.cydonia.x, z: POI.cydonia.z, r: 16, h: 8.8 },
  { x: POI.polar.x, z: POI.polar.z, r: 10, h: 7.0 },
  { x: POI.orrery.x, z: POI.orrery.z, r: 8, h: 5.4 },
  { x: POI.seal.x, z: POI.seal.z, r: 8, h: 6.2 },
  { x: POI.fullness.x, z: POI.fullness.z, r: 8, h: 6.2 },
  { x: POI.daath.x, z: POI.daath.z, r: 8, h: 6.3 },
  { x: POI.lam.x, z: POI.lam.z, r: 5, h: 2.2 },
  { x: POI.mauve.x, z: POI.mauve.z, r: 12, h: 5.2 },
  { x: POI.nisis.x, z: POI.nisis.z, r: 12, h: 6.6 },
  { x: POI.cells.x, z: POI.cells.z, r: 12, h: 4.8 },
  { x: POI.marks.x, z: POI.marks.z, r: 6, h: 6.5 },
  { x: POI.mile.x, z: POI.mile.z, r: 5, h: 8.4 },
  { x: POI.tworoads.x, z: POI.tworoads.z, r: 6, h: 6.4 },
  { x: POI.ink.x, z: POI.ink.z, r: 6, h: 6.5 },
  { x: POI.mothwell.x, z: POI.mothwell.z, r: 6, h: 6.2 },
  { x: POI.bonegate.x, z: POI.bonegate.z, r: 6, h: 4.6 },
  { x: POI.ashrow.x, z: POI.ashrow.z, r: 6, h: 7.4 },
  { x: POI.redcamp.x, z: POI.redcamp.z, r: 8, h: 6.0 },
  { x: POI.silent.x, z: POI.silent.z, r: 7, h: 5.8 },
  { x: POI.stargaze.x, z: POI.stargaze.z, r: 8, h: 6.8 },
  { x: POI.dustchoir.x, z: POI.dustchoir.z, r: 8, h: 5.2 },
];

function bump(x, z, cx, cz, r, h) {
  const d2 = (x - cx) * (x - cx) + (z - cz) * (z - cz);
  const rr = r * r;
  if (d2 > rr * 4) return 0;
  return h * Math.exp(-d2 / rr);
}

export function rawLand(x, z) {
  const r = Math.hypot(x, z);
  let h = 5.4;

  h += (1 - smoothstep(WORLD.islandR - 22, WORLD.islandR + 8, r)) * 3.2;
  h -= smoothstep(WORLD.islandR - 4, WORLD.islandR + 18, r) * 14;

  h += (fbm(x * 0.017 + 4.2, z * 0.017 - 1.1, 5) - 0.5) * 7.4;
  h += (fbm(x * 0.046 + 11, z * 0.046 + 3.3, 3) - 0.5) * 2.6;

  h += bump(x, z, POI.manor.x, POI.manor.z, 22, 9.4);
  h += bump(x, z, POI.kirk.x + 6, POI.kirk.z - 4, 18, 4.2);
  h += bump(x, z, POI.abbey.x, POI.abbey.z, 20, 3.6);
  h += bump(x, z, POI.wood.x - 8, POI.wood.z + 10, 28, 2.8);
  h += bump(x, z, -10, 52, 16, 3.4);
  h -= bump(x, z, POI.hollow.x, POI.hollow.z, 16, 5.2);

  const sx = x - POI.spiral.x;
  const sz = z - POI.spiral.z;
  const sr = Math.hypot(sx, sz);
  const sa = Math.atan2(sz, sx);
  const spiral = Math.exp(-(sr * sr) / 980);
  h += spiral * (11.5 + 4.2 * Math.sin(sa * 3.0 + sr * 0.22));

  const loch = smoothstep(58, 88, z) * (1 - smoothstep(118, 148, Math.abs(x)));
  h -= loch * 15.5;
  h -= bump(x, z, -8, 118, 40, 6.5) * 0.65;

  if (r > WORLD.islandR + 6) h = Math.min(h, WORLD.waterY - 1.8);
  return h;
}

function pathBlend(x, z, h) {
  let best = 64;
  let ph = h;
  for (let i = 0; i < PATHS.length; i++) {
    const p = PATHS[i];
    const s = segDist2(x, z, p[0], p[1], p[2], p[3]);
    if (s.d2 < best) {
      best = s.d2;
      const ha = rawLand(p[0], p[1]);
      const hb = rawLand(p[2], p[3]);
      ph = ha + (hb - ha) * s.t;
    }
  }
  const d = Math.sqrt(best);
  const w = 1 - smoothstep(1.6, 5.4, d);
  if (w <= 0) return h;
  const target = ph * 0.55 + h * 0.45;
  return h + (target - h) * w * 0.92;
}

function flatten(x, z, h) {
  let out = h;
  for (let i = 0; i < FLATS.length; i++) {
    const f = FLATS[i];
    const d = Math.hypot(x - f.x, z - f.z);
    const w = 1 - smoothstep(f.r * 0.45, f.r, d);
    if (w > 0) out = out + (f.h - out) * w;
  }
  return out;
}

function authored(x, z, h) {
  // manor terrace
  if (x > -52 && x < -30 && z > 30 && z < 50) {
    const e = Math.min(x + 52, -30 - x, z - 30, 50 - z);
    const w = smoothstep(0, 1.4, e);
    h = h + (14.15 - h) * w;
  }
  // pier over the loch
  if (x > -23.2 && x < -16.8 && z > 70 && z < 105) {
    h = Math.max(h, WORLD.waterY + 0.62);
  }
  // abbey court
  if (x > -88 && x < -72 && z > -104 && z < -86) {
    const e = Math.min(x + 88, -72 - x, z + 104, -86 - z);
    const w = smoothstep(0, 1.2, e);
    h = h + (7.55 - h) * w;
  }
  return h;
}

const CACHE = new Map();
const Q = 4; // quantize to 25cm for cache

export function heightAt(x, z) {
  if (!Number.isFinite(x) || !Number.isFinite(z)) return WORLD.waterY;
  const kx = Math.round(x * Q);
  const kz = Math.round(z * Q);
  const key = kx * 73856093 + kz * 19349663;
  const hit = CACHE.get(key);
  if (hit !== undefined) return hit;
  let h = rawLand(x, z);
  h = pathBlend(x, z, h);
  h = flatten(x, z, h);
  h = authored(x, z, h);
  if (CACHE.size > 28000) CACHE.clear();
  CACHE.set(key, h);
  return h;
}

export function normalAt(x, z, out = { x: 0, y: 1, z: 0 }) {
  const e = 0.38;
  const hL = heightAt(x - e, z);
  const hR = heightAt(x + e, z);
  const hD = heightAt(x, z - e);
  const hU = heightAt(x, z + e);
  const nx = hL - hR;
  const ny = e * 2;
  const nz = hD - hU;
  const len = Math.hypot(nx, ny, nz) || 1;
  out.x = nx / len;
  out.y = ny / len;
  out.z = nz / len;
  return out;
}

export function isWater(x, z) {
  return heightAt(x, z) < WORLD.waterY - 0.08;
}

export function walkable(x, z) {
  const n = normalAt(x, z);
  return n.y >= 0.48 && heightAt(x, z) > WORLD.waterY - 0.35;
}

export function scatter(seed, count, pred) {
  const out = [];
  let i = 0;
  let guard = 0;
  while (out.length < count && guard < count * 40) {
    guard++;
    const hx = hash2(seed + i, 17);
    const hz = hash2(seed + i, 91);
    i++;
    const x = (hx - 0.5) * WORLD.size * 0.92;
    const z = (hz - 0.5) * WORLD.size * 0.92;
    if (pred(x, z, hx, hz)) out.push({ x, z, r: hx, t: hz });
  }
  return out;
}

export function pathWidth(x, z) {
  let best = 80;
  for (let i = 0; i < PATHS.length; i++) {
    const p = PATHS[i];
    const s = segDist2(x, z, p[0], p[1], p[2], p[3]);
    if (s.d2 < best) best = s.d2;
  }
  return Math.sqrt(best);
}

export { PATHS };
