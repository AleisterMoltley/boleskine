import { FEEL, WORLD } from './config.js';
import { clamp } from './math.js';
import { heightAt, isWater, normalAt } from './height.js';
import { collidePlayer, platformY } from './obstacles.js';

const _n = { x: 0, y: 1, z: 0 };

export function createPawn(x, z) {
  const y = heightAt(x, z);
  return {
    x,
    y,
    z,
    vx: 0,
    vy: 0,
    vz: 0,
    yaw: 0.4,
    facing: 0.4,
    grounded: true,
    swimming: false,
    coyote: 0,
    jumpBuf: 0,
    speed: 0,
    moving: false,
    sprinting: false,
  };
}

export function resetPawn(p, x, z, obstacles) {
  p.x = x;
  p.z = z;
  p.y = heightAt(x, z) + 0.05;
  p.vx = 0;
  p.vy = 0;
  p.vz = 0;
  p.grounded = true;
  p.swimming = false;
  if (obstacles) {
    for (let i = 0; i < 6; i++) collidePlayer(p, obstacles);
    p.y = Math.max(p.y, heightAt(p.x, p.z));
  }
}

function wishAccel(p, wishX, wishZ, dt, rate) {
  const wishLen = Math.hypot(wishX, wishZ);
  if (wishLen > 1e-5) {
    const ix = wishX / wishLen;
    const iz = wishZ / wishLen;
    const cur = p.vx * ix + p.vz * iz;
    const add = Math.max(0, rate - cur);
    const acc = (p.grounded ? FEEL.accel : FEEL.airAccel) * dt;
    const a = Math.min(acc, add);
    p.vx += ix * a;
    p.vz += iz * a;
  }
}

function horizDamp(p, dt, target) {
  const sp = Math.hypot(p.vx, p.vz);
  if (sp < 1e-5) {
    p.vx = 0;
    p.vz = 0;
    return;
  }
  const decel = p.grounded ? FEEL.decel : FEEL.decel * 0.28;
  let next = sp;
  if (sp > target) next = Math.max(target, sp - decel * dt);
  else if (target < 0.1) next = Math.max(0, sp - decel * dt);
  const s = next / sp;
  p.vx *= s;
  p.vz *= s;
}

export function stepPawn(p, dt, input, camYaw, obstacles) {
  const wish = input.wish();
  const sprint = input.state.sprint && p.grounded && !p.swimming;
  p.sprinting = sprint && (wish.x || wish.y);
  const cap = p.swimming ? FEEL.swim : sprint ? FEEL.run : FEEL.walk;

  const sy = Math.sin(camYaw);
  const cy = Math.cos(camYaw);
  const wishX = wish.x * cy + wish.y * sy;
  const wishZ = -wish.x * sy + wish.y * cy;
  const wishLen = Math.hypot(wish.x, wish.y);

  if (input.state.jumpDown) p.jumpBuf = FEEL.jumpBuf;
  else p.jumpBuf = Math.max(0, p.jumpBuf - dt);
  if (p.grounded) p.coyote = FEEL.coyote;
  else p.coyote = Math.max(0, p.coyote - dt);

  wishAccel(p, wishX, wishZ, dt, cap);
  horizDamp(p, dt, wishLen > 0.08 ? cap * wishLen : 0);

  if (p.jumpBuf > 0 && p.coyote > 0 && !p.swimming) {
    p.vy = FEEL.jump;
    p.grounded = false;
    p.coyote = 0;
    p.jumpBuf = 0;
  }

  p.vy -= FEEL.gravity * dt;
  if (p.vy < -22) p.vy = -22;

  const steps = p.swimming ? 2 : 3;
  const hdt = dt / steps;
  for (let s = 0; s < steps; s++) {
    p.x += p.vx * hdt;
    p.z += p.vz * hdt;
    p.y += p.vy * hdt;
    collidePlayer(p, obstacles);

    const r = Math.hypot(p.x, p.z);
    if (r > WORLD.playR) {
      const k = WORLD.playR / r;
      p.x *= k;
      p.z *= k;
      const nr = Math.hypot(p.x, p.z) || 1;
      const nx = p.x / nr;
      const nz = p.z / nr;
      const vn = p.vx * nx + p.vz * nz;
      if (vn > 0) {
        p.vx -= nx * vn;
        p.vz -= nz * vn;
      }
    }

    const ground = heightAt(p.x, p.z);
    const plat = platformY(p, obstacles, ground);
    const surf = Math.max(ground, plat);
    normalAt(p.x, p.z, _n);
    const wet = isWater(p.x, p.z) || surf < WORLD.waterY - 0.05;
    p.swimming = wet && p.y < WORLD.waterY + 0.55;

    if (p.swimming) {
      const floatY = WORLD.waterY - 0.08;
      if (p.y < floatY) {
        p.y = p.y + (floatY - p.y) * 0.18;
        if (p.vy < 0) p.vy *= 0.55;
      }
      p.vy *= 0.9;
      if (input.state.jump) p.vy += 18 * hdt;
      p.grounded = false;
    } else if (p.y <= surf + 0.06 && p.vy <= 2.2) {
      if (_n.y >= FEEL.slopeMinY || plat > ground + 0.05) {
        p.y = surf;
        if (p.vy < 0) p.vy = 0;
        p.grounded = true;
      } else {
        p.y = surf + 0.02;
        p.grounded = false;
        p.vx += _n.x * 14 * hdt;
        p.vz += _n.z * 14 * hdt;
      }
    } else {
      p.grounded = false;
      if (p.y < surf - 0.02) {
        p.y = surf;
        if (p.vy < 0) p.vy = 0;
        p.grounded = _n.y >= FEEL.slopeMinY;
      }
    }

    if (p.grounded && wishLen > 0.1) {
      const nextX = p.x + (p.vx > 0 ? 1 : -1) * 0.25;
      const nextZ = p.z + (p.vz > 0 ? 1 : -1) * 0.25;
      const stepH = heightAt(p.x + p.vx * 0.08, p.z + p.vz * 0.08);
      const rise = stepH - surf;
      if (rise > 0.04 && rise <= FEEL.step) {
        p.y = stepH;
      }
    }
  }

  if (!Number.isFinite(p.x) || !Number.isFinite(p.z) || !Number.isFinite(p.y)) {
    resetPawn(p, 0, 8);
  }
  if (p.y < WORLD.waterY - 6) {
    p.y = WORLD.waterY;
    p.vy = 0;
  }

  const sp = Math.hypot(p.vx, p.vz);
  p.speed = sp;
  p.moving = sp > 0.35;
  if (wishLen > 0.12) {
    p.facing = Math.atan2(-wishX, -wishZ);
  }
  p.yaw = p.facing;
}

export function clampPitch(p) {
  return clamp(p, FEEL.pitchMin, FEEL.pitchMax);
}
