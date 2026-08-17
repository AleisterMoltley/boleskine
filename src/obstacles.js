import { FEEL } from './config.js';
import { mapToPos, PLANET_R, upOf } from './planet.js';

const _near = [];

export function createObstacles() {
  const list = [];
  const grid = new Map();
  const cell = 10;
  const inv = 1 / cell;

  function key(ix, iz) {
    return ix + ',' + iz;
  }

  function add(o) {
    if (!o.pos) o.pos = mapToPos(o.mx, o.mz);
    if (!o.up) o.up = upOf(o.pos);
    list.push(o);
    const r = (o.r || Math.max(o.hx || 0, o.hz || 0)) + 0.4;
    const ix = Math.floor(o.mx * inv);
    const iz = Math.floor(o.mz * inv);
    const span = Math.max(1, Math.ceil(r * inv));
    for (let x = ix - span; x <= ix + span; x++) {
      for (let z = iz - span; z <= iz + span; z++) {
        const k = key(x, z);
        let b = grid.get(k);
        if (!b) {
          b = [];
          grid.set(k, b);
        }
        b.push(o);
      }
    }
    return o;
  }

  function nearby(mx, mz, range = 7, out = _near) {
    out.length = 0;
    const n = Math.max(1, Math.ceil(range * inv));
    const cx = Math.floor(mx * inv);
    const cz = Math.floor(mz * inv);
    const seen = new Set();
    for (let ix = cx - n; ix <= cx + n; ix++) {
      for (let iz = cz - n; iz <= cz + n; iz++) {
        const b = grid.get(key(ix, iz));
        if (!b) continue;
        for (let i = 0; i < b.length; i++) {
          const o = b[i];
          if (seen.has(o)) continue;
          seen.add(o);
          out.push(o);
        }
      }
    }
    return out;
  }

  function cyl(mx, mz, y0, y1, r, kind = 'cyl') {
    return add({ kind, mx, mz, r, h: Math.max(0.5, y1 - y0) });
  }

  function box(mx, mz, y0, y1, hx, hz, rot = 0, kind = 'box') {
    const pos = mapToPos(mx, mz);
    const up = upOf(pos);
    return add({
      kind,
      mx,
      mz,
      pos,
      up,
      hx,
      hz,
      h: Math.max(0.5, y1 - y0),
      rot,
      c: Math.cos(rot),
      s: Math.sin(rot),
    });
  }

  function platform(mx, mz, y, hx, hz, rot = 0) {
    return add({
      kind: 'plat',
      mx,
      mz,
      hx,
      hz,
      h: 0.4,
      rot,
      c: Math.cos(rot),
      s: Math.sin(rot),
      ghost: true,
    });
  }

  return { list, add, nearby, cyl, box, platform };
}

function radialAlong(p, o) {
  const dx = p.pos.x - o.pos.x;
  const dy = p.pos.y - o.pos.y;
  const dz = p.pos.z - o.pos.z;
  return dx * o.up.x + dy * o.up.y + dz * o.up.z;
}

export function collidePlayer(p, obstacles) {
  if (!p.pos) return;
  const list = obstacles.nearby(p.mx, p.mz, 8);
  const rad = FEEL.radius;
  const along0 = 0.2;

  for (let i = 0; i < list.length; i++) {
    const o = list[i];
    if (!o.pos || o.kind === 'plat' || o.ghost) continue;
    const along = radialAlong(p, o);
    if (along < -0.15 || along > o.h + 0.2) continue;

    if (o.r && !o.hx) {
      const dx = p.pos.x - o.pos.x;
      const dy = p.pos.y - o.pos.y;
      const dz = p.pos.z - o.pos.z;
      const rx = dx - o.up.x * along;
      const ry = dy - o.up.y * along;
      const rz = dz - o.up.z * along;
      const d = Math.hypot(rx, ry, rz);
      const min = o.r + rad;
      if (d < min && d > 1e-5) {
        const push = Math.min(min - d, FEEL.maxPush);
        const s = push / d;
        p.pos.x += rx * s;
        p.pos.y += ry * s;
        p.pos.z += rz * s;
        const vn = p.vel.x * (rx / d) + p.vel.y * (ry / d) + p.vel.z * (rz / d);
        if (vn < 0) {
          p.vel.x -= (rx / d) * vn;
          p.vel.y -= (ry / d) * vn;
          p.vel.z -= (rz / d) * vn;
        }
      }
      continue;
    }

    if (o.hx != null) {
      const dx = p.pos.x - o.pos.x;
      const dy = p.pos.y - o.pos.y;
      const dz = p.pos.z - o.pos.z;
      const rx = dx - o.up.x * along;
      const rz = dz - o.up.z * along;
      const { east, north } = {
        east: { x: o.c ?? 1, z: o.s ?? 0 },
        north: { x: -(o.s ?? 0), z: o.c ?? 1 },
      };
      const side = rx * east.x + rz * east.z;
      const fwd = rx * north.x + rz * north.z;
      const hw = o.hx + rad;
      const hd = o.hz + rad;
      if (Math.abs(side) >= hw || Math.abs(fwd) >= hd) continue;
      const ox = hw - Math.abs(side);
      const oz = hd - Math.abs(fwd);
      if (ox < oz) {
        const mag = Math.min(ox, FEEL.maxPush) * (side >= 0 ? 1 : -1);
        p.pos.x += east.x * mag;
        p.pos.z += east.z * mag;
      } else {
        const mag = Math.min(oz, FEEL.maxPush) * (fwd >= 0 ? 1 : -1);
        p.pos.x += north.x * mag;
        p.pos.z += north.z * mag;
      }
    }
  }
}

export function camHit(ox, oy, oz, dx, dy, dz, dist, obstacles, mx, mz) {
  const steps = 12;
  let hit = dist;
  for (let i = 1; i <= steps; i++) {
    const t = (i / steps) * dist;
    const x = ox + dx * t;
    const y = oy + dy * t;
    const z = oz + dz * t;
    const list = obstacles.nearby(mx, mz, 8);
    for (let j = 0; j < list.length; j++) {
      const o = list[j];
      if (!o.pos || o.kind === 'plat' || o.ghost) continue;
      const px = x - o.pos.x;
      const py = y - o.pos.y;
      const pz = z - o.pos.z;
      const along = px * o.up.x + py * o.up.y + pz * o.up.z;
      if (along < -0.4 || along > (o.h || 2) + 1.2) continue;
      const pad = o.kind === 'house' || o.kind === 'manor' || o.kind === 'kirk' ? 0.75 : o.kind === 'tree' ? 0.3 : 0.45;
      const rx = px - o.up.x * along;
      const ry = py - o.up.y * along;
      const rz = pz - o.up.z * along;
      const d = Math.hypot(rx, ry, rz);
      const rad = (o.r || Math.max(o.hx || 0, o.hz || 0)) + pad;
      if (d < rad) hit = Math.min(hit, Math.max(FEEL.camMinDist, t - 0.4));
    }
  }
  return hit;
}
