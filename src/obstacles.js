import { FEEL } from './config.js';

const _near = [];

export function createObstacles() {
  const list = [];
  const grid = new Map();
  const cell = 8;
  const inv = 1 / cell;

  function key(ix, iz) {
    return ix + ',' + iz;
  }

  function add(o) {
    list.push(o);
    const r = o.r || Math.max(o.hx || 0, o.hz || 0) + 0.2;
    const x0 = Math.floor((o.x - r) * inv);
    const x1 = Math.floor((o.x + r) * inv);
    const z0 = Math.floor((o.z - r) * inv);
    const z1 = Math.floor((o.z + r) * inv);
    for (let ix = x0; ix <= x1; ix++) {
      for (let iz = z0; iz <= z1; iz++) {
        const k = key(ix, iz);
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

  function nearby(x, z, range = 6, out = _near) {
    out.length = 0;
    const n = Math.max(1, Math.ceil(range * inv));
    const cx = Math.floor(x * inv);
    const cz = Math.floor(z * inv);
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

  function cyl(x, z, y0, y1, r, kind = 'cyl') {
    return add({ kind, x, z, y0, y1, r });
  }

  function box(x, z, y0, y1, hx, hz, rot = 0, kind = 'box') {
    return add({ kind, x, z, y0, y1, hx, hz, rot, c: Math.cos(rot), s: Math.sin(rot) });
  }

  function platform(x, z, y, hx, hz, rot = 0) {
    return add({ kind: 'plat', x, z, y0: y, y1: y + 0.35, y, hx, hz, rot, c: Math.cos(rot), s: Math.sin(rot) });
  }

  return { list, add, nearby, cyl, box, platform };
}

function localXZ(o, x, z) {
  const dx = x - o.x;
  const dz = z - o.z;
  if (!o.s) return { lx: dx, lz: dz };
  return { lx: dx * o.c + dz * o.s, lz: -dx * o.s + dz * o.c };
}

export function collidePlayer(p, obstacles) {
  const list = obstacles.nearby(p.x, p.z, 7);
  const rad = FEEL.radius;
  const yMid = p.y + FEEL.height * 0.45;
  let gx = p.x;
  let gz = p.z;

  for (let i = 0; i < list.length; i++) {
    const o = list[i];
    if (o.kind === 'plat' || o.ghost) continue;
    if (yMid < o.y0 - 0.15 || p.y > o.y1 + 0.12) continue;

    if (o.kind === 'cyl' || o.r) {
      let dx = p.x - o.x;
      let dz = p.z - o.z;
      let d = Math.hypot(dx, dz);
      const min = (o.r || 0) + rad;
      if (d < 1e-5) {
        dx = 1;
        dz = 0;
        d = 1;
      }
      if (d < min) {
        const push = Math.min(min - d, FEEL.maxPush);
        const s = push / d;
        p.x += dx * s;
        p.z += dz * s;
        const vn = p.vx * (dx / d) + p.vz * (dz / d);
        if (vn < 0) {
          p.vx -= (dx / d) * vn;
          p.vz -= (dz / d) * vn;
        }
      }
      continue;
    }

    const { lx, lz } = localXZ(o, p.x, p.z);
    const hx = o.hx + rad;
    const hz = o.hz + rad;
    if (Math.abs(lx) >= hx || Math.abs(lz) >= hz) continue;
    const ox = hx - Math.abs(lx);
    const oz = hz - Math.abs(lz);
    let nlx = 0;
    let nlz = 0;
    if (ox < oz) {
      const mag = Math.min(ox, FEEL.maxPush);
      nlx = lx >= 0 ? mag : -mag;
    } else {
      const mag = Math.min(oz, FEEL.maxPush);
      nlz = lz >= 0 ? mag : -mag;
    }
    const wx = nlx * (o.c || 1) - nlz * (o.s || 0);
    const wz = nlx * (o.s || 0) + nlz * (o.c || 1);
    p.x += wx;
    p.z += wz;
    const nlen = Math.hypot(wx, wz) || 1;
    const nx = wx / nlen;
    const nz = wz / nlen;
    const vn = p.vx * nx + p.vz * nz;
    if (vn < 0) {
      p.vx -= nx * vn;
      p.vz -= nz * vn;
    }
  }

  const push = Math.hypot(p.x - gx, p.z - gz);
  if (push > 1.05) {
    const s = 1.05 / push;
    p.x = gx + (p.x - gx) * s;
    p.z = gz + (p.z - gz) * s;
  }
}

export function platformY(p, obstacles, ground) {
  const list = obstacles.nearby(p.x, p.z, 5);
  let y = ground;
  for (let i = 0; i < list.length; i++) {
    const o = list[i];
    if (o.kind !== 'plat') continue;
    const { lx, lz } = localXZ(o, p.x, p.z);
    if (Math.abs(lx) > o.hx || Math.abs(lz) > o.hz) continue;
    if (p.y >= o.y - 0.42 && p.y <= o.y + 0.9 && p.vy <= 1.2) {
      if (o.y > y) y = o.y;
    }
  }
  return y;
}

export function camHit(ox, oy, oz, dx, dy, dz, dist, obstacles) {
  const steps = 14;
  let hit = dist;
  for (let i = 1; i <= steps; i++) {
    const t = (i / steps) * dist;
    const x = ox + dx * t;
    const y = oy + dy * t;
    const z = oz + dz * t;
    const list = obstacles.nearby(x, z, 6);
    for (let j = 0; j < list.length; j++) {
      const o = list[j];
      if (o.kind === 'plat' || o.ghost) continue;
      if (y < o.y0 - 0.4 || y > o.y1 + 1.2) continue;
      const pad =
        o.kind === 'house' || o.kind === 'manor' || o.kind === 'kirk'
          ? 0.72
          : o.kind === 'tree'
            ? 0.28
            : 0.42;
      if (o.r) {
        const d = Math.hypot(x - o.x, z - o.z);
        if (d < o.r + pad) hit = Math.min(hit, Math.max(FEEL.camMinDist, t - 0.45));
      } else {
        const loc = localXZ(o, x, z);
        if (Math.abs(loc.lx) < o.hx + pad && Math.abs(loc.lz) < o.hz + pad) {
          hit = Math.min(hit, Math.max(FEEL.camMinDist, t - 0.45));
        }
      }
    }
  }
  return hit;
}
