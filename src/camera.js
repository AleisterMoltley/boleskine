import * as THREE from 'three';
import { FEEL, WORLD } from './config.js';
import { approach, clamp, rotateToward } from './math.js';
import { heightAt } from './height.js';
import { camHit } from './obstacles.js';

const _pos = new THREE.Vector3();
const _look = new THREE.Vector3();

export function createChaseCam(camera) {
  const orbit = {
    yaw: 0.05,
    pitch: -0.06,
    dist: FEEL.camDist,
    follow: FEEL.camDist,
    lift: 0,
    mouseIdle: 8,
  };

  function place(p, dist, lift) {
    const cp = Math.cos(orbit.pitch);
    const sp = Math.sin(orbit.pitch);
    const sy = Math.sin(orbit.yaw);
    const cy = Math.cos(orbit.yaw);
    const rx = Math.cos(orbit.yaw);
    const rz = -Math.sin(orbit.yaw);
    const sh = FEEL.camShoulder;
    _look.set(
      p.x + rx * sh * 0.4 - sy * 0.35,
      p.y + FEEL.camLook,
      p.z + rz * sh * 0.4 - cy * 0.35
    );
    _pos.set(
      p.x + sy * dist * cp + rx * sh,
      p.y + FEEL.camHeight + dist * sp + lift,
      p.z + cy * dist * cp + rz * sh
    );
    const dx = _pos.x - _look.x;
    const dy = _pos.y - _look.y;
    const dz = _pos.z - _look.z;
    const len = Math.hypot(dx, dy, dz) || 1;
    return { nx: dx / len, ny: dy / len, nz: dz / len, len };
  }

  function keepClear(p, obstacles, dt) {
    const raw = place(p, orbit.dist, 0);
    const blocked = camHit(_look.x, _look.y, _look.z, raw.nx, raw.ny, raw.nz, raw.len, obstacles);
    const tight = blocked < orbit.dist * 0.82;
    orbit.lift = approach(orbit.lift, tight ? FEEL.camLift : 0, (tight ? 7 : 4) * dt);
    const want = Math.max(FEEL.camMinDist, blocked);
    if (want < orbit.follow) orbit.follow = want;
    else orbit.follow = approach(orbit.follow, want, FEEL.camRecover * dt);
    place(p, orbit.follow, orbit.lift);
    const floor = Math.max(heightAt(_pos.x, _pos.z) + 1.35, WORLD.waterY + 1.0);
    if (_pos.y < floor) _pos.y = floor;
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
      camera.up.set(0, 1, 0);
      camera.lookAt(_look);
    },
    tick(p, dt, obstacles, moving) {
      orbit.mouseIdle += dt;
      if (moving && orbit.mouseIdle > 0.65) {
        orbit.yaw = rotateToward(orbit.yaw, p.yaw, FEEL.camRecenter * dt);
      }
      keepClear(p, obstacles, dt);
      const k = 1 - Math.exp(-FEEL.camLag * dt);
      camera.position.lerp(_pos, k);
      const floor = Math.max(heightAt(camera.position.x, camera.position.z) + 1.1, WORLD.waterY + 0.85);
      if (camera.position.y < floor) camera.position.y = floor;
      camera.up.set(0, 1, 0);
      camera.lookAt(_look);
    },
  };
}
