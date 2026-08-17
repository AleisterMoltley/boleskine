import * as THREE from 'three';
import { FEEL } from './config.js';
import { approach, clamp } from './math.js';
import { camHit } from './obstacles.js';
import { keepOutside, tangentBasis, upOf } from './planet.js';

const _pos = new THREE.Vector3();
const _look = new THREE.Vector3();
const _up = new THREE.Vector3();
const _back = new THREE.Vector3();
const _right = new THREE.Vector3();
const _fwd = new THREE.Vector3();

export function walkFrame(up, yaw, outFwd = _fwd, outRight = _right) {
  const { east, north } = tangentBasis(up);
  const cy = Math.cos(yaw);
  const sy = Math.sin(yaw);
  outRight.copy(east).multiplyScalar(cy).addScaledVector(north, -sy);
  _back.copy(north).multiplyScalar(cy).addScaledVector(east, sy);
  outFwd.copy(_back).negate();
  return { fwd: outFwd, right: outRight, back: _back };
}

export function createChaseCam(camera) {
  const orbit = {
    yaw: Math.PI,
    pitch: -0.06,
    dist: FEEL.camDist,
    follow: FEEL.camDist,
    lift: 0,
  };

  function place(p, dist, lift) {
    upOf(p.pos, _up);
    const { fwd, right, back } = walkFrame(_up, orbit.yaw);
    const cp = Math.cos(orbit.pitch);
    const sp = Math.sin(orbit.pitch);
    const sh = FEEL.camShoulder;
    _look.copy(p.pos).addScaledVector(_up, FEEL.camLook).addScaledVector(right, sh * 0.25);
    _pos
      .copy(p.pos)
      .addScaledVector(back, dist * cp)
      .addScaledVector(_up, FEEL.camHeight + dist * sp + lift)
      .addScaledVector(right, sh);
    keepOutside(_pos, 1.35);
    const dx = _pos.x - _look.x;
    const dy = _pos.y - _look.y;
    const dz = _pos.z - _look.z;
    const len = Math.hypot(dx, dy, dz) || 1;
    return { nx: dx / len, ny: dy / len, nz: dz / len, len, fwd };
  }

  function keepClear(p, obstacles, dt) {
    const raw = place(p, orbit.dist, 0);
    const blocked = camHit(_look.x, _look.y, _look.z, raw.nx, raw.ny, raw.nz, raw.len, obstacles, p.mx, p.mz);
    const tight = blocked < orbit.dist * 0.82;
    orbit.lift = approach(orbit.lift, tight ? FEEL.camLift : 0, (tight ? 8 : 5) * dt);
    const want = Math.max(FEEL.camMinDist, blocked);
    if (want < orbit.follow) orbit.follow = want;
    else orbit.follow = approach(orbit.follow, want, FEEL.camRecover * dt);
    place(p, orbit.follow, orbit.lift);
  }

  return {
    orbit,
    applyLook(dx, dy) {
      orbit.yaw -= dx * FEEL.mouseSens;
      orbit.pitch -= dy * FEEL.mouseSens;
      orbit.pitch = clamp(orbit.pitch, FEEL.pitchMin, FEEL.pitchMax);
    },
    snap(p, obstacles) {
      orbit.follow = orbit.dist;
      orbit.lift = 0;
      keepClear(p, obstacles, 1);
      camera.position.copy(_pos);
      camera.up.copy(_up);
      camera.lookAt(_look);
    },
    tick(p, dt, obstacles, looking, time = 0) {
      keepClear(p, obstacles, dt);
      if (looking) {
        camera.position.copy(_pos);
      } else {
        const k = 1 - Math.exp(-FEEL.camLag * dt);
        camera.position.lerp(_pos, k);
        const { right } = walkFrame(_up, orbit.yaw);
        camera.position.addScaledVector(right, Math.sin(time * 0.31) * 0.045);
        camera.position.addScaledVector(_up, Math.sin(time * 0.23) * 0.028);
      }
      keepOutside(camera.position, 1.15);
      upOf(p.pos, _up);
      camera.up.copy(_up);
      camera.lookAt(_look);
    },
  };
}
