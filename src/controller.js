import * as THREE from 'three';
import { FEEL } from './config.js';
import { approach, rotateToward } from './math.js';
import { collidePlayer } from './obstacles.js';
import {
  isDustPos,
  mapToPos,
  meshRadius,
  plantOnMesh,
  posToMap,
  tangentBasis,
  upOf,
  wrapTangent,
} from './planet.js';

const _up = new THREE.Vector3();
const _wish = new THREE.Vector3();
const _fwd = new THREE.Vector3();
const _right = new THREE.Vector3();

export function createPawn(mx, mz) {
  const pos = mapToPos(mx, mz, 0);
  plantOnMesh(pos);
  return {
    pos,
    vel: new THREE.Vector3(),
    mx,
    mz,
    yaw: Math.PI,
    facing: Math.PI,
    grounded: true,
    swimming: false,
    dust: false,
    coyote: 0,
    jumpBuf: 0,
    speed: 0,
    moving: false,
    sprinting: false,
    get x() {
      return this.mx;
    },
    get z() {
      return this.mz;
    },
    get y() {
      return this.pos.y;
    },
  };
}

export function resetPawn(p, mx, mz, obstacles) {
  p.pos.copy(mapToPos(mx, mz, 0));
  plantOnMesh(p.pos);
  p.vel.set(0, 0, 0);
  const m = posToMap(p.pos);
  p.mx = m.x;
  p.mz = m.z;
  p.grounded = true;
  p.swimming = false;
  p.dust = isDustPos(p.pos);
  if (obstacles) {
    for (let i = 0; i < 4; i++) collidePlayer(p, obstacles);
    plantOnMesh(p.pos);
  }
}

function snapSurf(p) {
  const len = p.pos.length() || 1;
  const ux = p.pos.x / len;
  const uy = p.pos.y / len;
  const uz = p.pos.z / len;
  const surf = meshRadius(p.pos);
  let height = len - surf;
  const vRad = p.vel.x * ux + p.vel.y * uy + p.vel.z * uz;
  let grounded = false;
  if (height <= 1.25 && vRad <= 3.4) {
    height = 0;
    p.vel.x -= ux * vRad;
    p.vel.y -= uy * vRad;
    p.vel.z -= uz * vRad;
    grounded = true;
  }
  if (height < 0) height = 0;
  const nr = surf + height;
  p.pos.set(ux * nr, uy * nr, uz * nr);
  p.grounded = grounded;
  return { ux, uy, uz, surf, height };
}

export function stepPawn(p, dt, input, camFwd, obstacles) {
  upOf(p.pos, _up);
  const { east, north } = tangentBasis(_up);

  _fwd.copy(camFwd);
  wrapTangent(_fwd, _up);
  if (_fwd.lengthSq() < 1e-6) _fwd.copy(north);
  else _fwd.normalize();
  _right.crossVectors(_fwd, _up).normalize();
  _fwd.crossVectors(_up, _right).normalize();

  const stick = input.wish();
  _wish.set(0, 0, 0);
  _wish.addScaledVector(_right, stick.x);
  _wish.addScaledVector(_fwd, -stick.y);
  wrapTangent(_wish, _up);
  const wishLen = _wish.length();
  if (wishLen > 1) _wish.multiplyScalar(1 / wishLen);

  const dust = isDustPos(p.pos);
  p.dust = dust;
  p.swimming = false;
  const sprint = input.state.sprint && p.grounded && !dust && wishLen > 0.08;
  p.sprinting = sprint;
  const cap = dust ? FEEL.walk * 0.58 : sprint ? FEEL.run : FEEL.walk;

  if (input.state.jumpDown) p.jumpBuf = FEEL.jumpBuf;
  else p.jumpBuf = Math.max(0, p.jumpBuf - dt);
  if (p.grounded) p.coyote = FEEL.coyote;
  else p.coyote = Math.max(0, p.coyote - dt);

  wrapTangent(p.vel, _up);
  const spd = p.vel.length();
  if (p.grounded) {
    if (wishLen > 0.08) {
      _wish.normalize();
      const target = cap * Math.min(1, wishLen);
      const next = approach(spd, target, FEEL.accel * dt);
      p.vel.copy(_wish).multiplyScalar(next);
    } else {
      const next = approach(spd, 0, FEEL.decel * dt);
      if (spd > 1e-5) p.vel.multiplyScalar(next / spd);
      else p.vel.set(0, 0, 0);
    }
  } else if (wishLen > 0.08) {
    _wish.normalize();
    p.vel.addScaledVector(_wish, FEEL.airAccel * dt);
    wrapTangent(p.vel, _up);
    if (p.vel.length() > FEEL.run) p.vel.setLength(FEEL.run);
  }

  const vRad = p.vel.dot(_up);
  wrapTangent(p.vel, _up);

  if (p.jumpBuf > 0 && p.coyote > 0) {
    p.vel.addScaledVector(_up, FEEL.jump);
    p.grounded = false;
    p.coyote = 0;
    p.jumpBuf = 0;
  }

  let vr = vRad - FEEL.gravity * dt;
  if (!input.state.jump && vr > 1.1) vr *= Math.pow(FEEL.jumpCut, dt * 10);
  if (vr < -22) vr = -22;
  p.vel.addScaledVector(_up, vr);

  const steps = 2;
  const hdt = dt / steps;
  for (let s = 0; s < steps; s++) {
    p.pos.addScaledVector(p.vel, hdt);
    collidePlayer(p, obstacles);
    snapSurf(p);
    collidePlayer(p, obstacles);
    snapSurf(p);
    p.dust = isDustPos(p.pos);
  }

  if (!Number.isFinite(p.pos.x)) resetPawn(p, 0, 0, obstacles);

  const m = posToMap(p.pos);
  p.mx = m.x;
  p.mz = m.z;

  wrapTangent(p.vel, _up);
  p.speed = p.vel.length();
  p.moving = p.speed > 0.35;
  if (wishLen > 0.1) {
    const we = _wish.dot(east);
    const wn = _wish.dot(north);
    p.facing = Math.atan2(we, wn);
  }
  p.yaw = rotateToward(p.yaw, p.facing, FEEL.turnRate * dt);
}
