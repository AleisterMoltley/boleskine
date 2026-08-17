import * as THREE from 'three';
import { FEEL } from './config.js';
import { approach, clamp, rotateToward } from './math.js';
import { camHit } from './obstacles.js';
import { keepOutside, tangentBasis, upOf } from './planet.js';

const _pos = new THREE.Vector3();
const _look = new THREE.Vector3();
const _up = new THREE.Vector3();
const _back = new THREE.Vector3();
const _right = new THREE.Vector3();

export function createChaseCam(camera) {
  const orbit = {
    yaw: Math.PI + 0.05,
    pitch: -0.08,
    dist: FEEL.camDist,
    follow: FEEL.camDist,
    lift: 0,
    mouseIdle: 8,
  };

  function place(p, dist, lift) {
    upOf(p.pos, _up);
    const { east, north } = tangentBasis(_up);
    const cy = Math.cos(orbit.yaw);
    const sy = Math.sin(orbit.yaw);
    const cp = Math.cos(orbit.pitch);
    const sp = Math.sin(orbit.pitch);
    _back.copy(north).multiplyScalar(cy).addScaledVector(east, sy);
    _right.copy(east).multiplyScalar(cy).addScaledVector(north, -sy);
    const sh = FEEL.camShoulder;
    _look.copy(p.pos).addScaledVector(_up, FEEL.camLook).addScaledVector(_right, sh * 0.35);
    _pos
      .copy(p.pos)
      .addScaledVector(_back, dist * cp)
      .addScaledVector(_up, FEEL.camHeight + dist * sp + lift)
      .addScaledVector(_right, sh);
    keepOutside(_pos, 1.4);
    const dx = _pos.x - _look.x;
    const dy = _pos.y - _look.y;
    const dz = _pos.z - _look.z;
    const len = Math.hypot(dx, dy, dz) || 1;
    return { nx: dx / len, ny: dy / len, nz: dz / len, len };
  }

  function keepClear(p, obstacles, dt) {
    const raw = place(p, orbit.dist, 0);
    const blocked = camHit(_look.x, _look.y, _look.z, raw.nx, raw.ny, raw.nz, raw.len, obstacles, p.mx, p.mz);
    const tight = blocked < orbit.dist * 0.82;
    orbit.lift = approach(orbit.lift, tight ? FEEL.camLift : 0, (tight ? 7 : 4) * dt);
    const want = Math.max(FEEL.camMinDist, blocked);
    if (want < orbit.follow) orbit.follow = want;
    else orbit.follow = approach(orbit.follow, want, FEEL.camRecover * dt);
    place(p, orbit.follow, orbit.lift);
  }

  return {
    orbit,
    applyLook(dx, dy) {
      if (Math.abs(dx) + Math.abs(dy) > 0.35) orbit.mouseIdle = 0;
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
    tick(p, dt, obstacles, moving) {
      orbit.mouseIdle += dt;
      if (moving && orbit.mouseIdle > 0.65) {
        orbit.yaw = rotateToward(orbit.yaw, p.yaw + Math.PI, FEEL.camRecenter * dt);
      }
      keepClear(p, obstacles, dt);
      const k = 1 - Math.exp(-FEEL.camLag * dt);
      camera.position.lerp(_pos, k);
      keepOutside(camera.position, 1.2);
      upOf(p.pos, _up);
      camera.up.copy(_up);
      camera.lookAt(_look);
    },
  };
}
