import { FEEL, WORLD } from './config.js';
import { approach, rotateToward } from './math.js';
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
    yaw: 0,
    facing: 0,
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

export function stepPawn(p, dt, input, fx, fz, obstacles) {
  const fl = Math.hypot(fx, fz) || 1;
  fx /= fl;
  fz /= fl;
  const rx = fz;
  const rz = -fx;

  const stick = input.wish();
  const wishX = rx * stick.x + fx * -stick.y;
  const wishZ = rz * stick.x + fz * -stick.y;
  const wishLen = Math.hypot(wishX, wishZ);
  const sprint = input.state.sprint && p.grounded && !p.swimming && wishLen > 0.08;
  p.sprinting = sprint;
  const cap = p.swimming ? FEEL.swim : sprint ? FEEL.run : FEEL.walk;
  const tx = wishLen > 1e-5 ? (wishX / wishLen) * cap * Math.min(1, wishLen) : 0;
  const tz = wishLen > 1e-5 ? (wishZ / wishLen) * cap * Math.min(1, wishLen) : 0;

  if (input.state.jumpDown) p.jumpBuf = FEEL.jumpBuf;
  else p.jumpBuf = Math.max(0, p.jumpBuf - dt);
  if (p.grounded) p.coyote = FEEL.coyote;
  else p.coyote = Math.max(0, p.coyote - dt);

  const rate = p.swimming ? FEEL.accel * 0.5 : p.grounded ? (wishLen > 0.08 ? FEEL.accel : FEEL.decel) : 0;
  if (p.grounded || p.swimming) {
    p.vx = approach(p.vx, tx, rate * dt);
    p.vz = approach(p.vz, tz, rate * dt);
  } else if (wishLen > 0.08) {
    p.vx += (wishX / wishLen) * FEEL.airAccel * dt;
    p.vz += (wishZ / wishLen) * FEEL.airAccel * dt;
    const sp = Math.hypot(p.vx, p.vz);
    if (sp > FEEL.run) {
      p.vx *= FEEL.run / sp;
      p.vz *= FEEL.run / sp;
    }
  }

  if (p.jumpBuf > 0 && p.coyote > 0 && !p.swimming) {
    p.vy = FEEL.jump;
    p.grounded = false;
    p.coyote = 0;
    p.jumpBuf = 0;
  }
  if (!input.state.jump && p.vy > 1.1) p.vy *= Math.pow(FEEL.jumpCut, dt * 10);

  p.vy -= FEEL.gravity * dt;
  if (p.vy < -22) p.vy = -22;

  const steps = 2;
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
      const floatY = WORLD.waterY - 0.05;
      if (p.y < floatY) {
        p.y += (floatY - p.y) * 0.22;
        if (p.vy < 0) p.vy *= 0.5;
      }
      p.vy *= 0.88;
      if (input.state.jump) p.vy += 20 * hdt;
      p.grounded = false;
    } else if (p.y <= surf + 0.1 && p.vy <= 2.2) {
      if (_n.y >= FEEL.slopeMinY || plat > ground + 0.05) {
        p.y = surf;
        if (p.vy < 0) p.vy = 0;
        p.grounded = true;
      } else {
        p.y = surf + 0.02;
        p.grounded = false;
        p.vx += _n.x * 12 * hdt;
        p.vz += _n.z * 12 * hdt;
      }
    } else {
      p.grounded = false;
      if (p.y < surf) {
        p.y = surf;
        if (p.vy < 0) p.vy = 0;
        p.grounded = _n.y >= FEEL.slopeMinY;
      }
    }

    if (p.grounded && wishLen > 0.1) {
      const stepH = heightAt(p.x + fx * 0.45, p.z + fz * 0.45);
      const rise = stepH - surf;
      if (rise > 0.03 && rise <= FEEL.step) p.y = stepH;
    }
  }

  if (!Number.isFinite(p.x) || !Number.isFinite(p.z) || !Number.isFinite(p.y)) {
    resetPawn(p, 0, 8, obstacles);
  }
  if (p.y < WORLD.waterY - 6) {
    p.y = WORLD.waterY;
    p.vy = 0;
  }

  const sp = Math.hypot(p.vx, p.vz);
  p.speed = sp;
  p.moving = sp > 0.35;
  if (wishLen > 0.1) p.facing = Math.atan2(-wishX, -wishZ);
  p.yaw = rotateToward(p.yaw, p.facing, FEEL.turnRate * dt);
}
