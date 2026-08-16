import * as THREE from 'three';
import { FEEL, WORLD } from './config.js';
import { approach, clamp } from './math.js';
import { heightAt } from './height.js';
import { camHit } from './obstacles.js';

const _pos = new THREE.Vector3();
const _look = new THREE.Vector3();

export function createChaseCam(camera) {
  const orbit = { yaw: -0.52, pitch: -0.1, dist: FEEL.camDist, follow: FEEL.camDist };

  function place(p, dist) {
    const cp = Math.cos(orbit.pitch);
    const sp = Math.sin(orbit.pitch);
    const sy = Math.sin(orbit.yaw);
    const cy = Math.cos(orbit.yaw);
    _look.set(p.x, p.y + FEEL.camLook, p.z);
    _pos.set(
      p.x + sy * dist * cp,
      p.y + FEEL.camHeight + dist * sp,
      p.z + cy * dist * cp
    );
    const dx = _pos.x - _look.x;
    const dy = _pos.y - _look.y;
    const dz = _pos.z - _look.z;
    const len = Math.hypot(dx, dy, dz) || 1;
    return { nx: dx / len, ny: dy / len, nz: dz / len, len };
  }

  function keepClear(p, obstacles, dt) {
    const { nx, ny, nz, len } = place(p, orbit.dist);
    const blocked = camHit(_look.x, _look.y, _look.z, nx, ny, nz, len, obstacles);
    if (blocked < orbit.follow) orbit.follow = blocked;
    else orbit.follow = approach(orbit.follow, Math.min(orbit.dist, blocked), FEEL.camRecover * dt);
    place(p, orbit.follow);
    const floor = Math.max(heightAt(_pos.x, _pos.z) + 1.05, WORLD.waterY + 0.75);
    if (_pos.y < floor) _pos.y = floor;
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
      keepClear(p, obstacles, 1);
      camera.position.copy(_pos);
      camera.up.set(0, 1, 0);
      camera.lookAt(_look);
    },
    tick(p, dt, obstacles) {
      keepClear(p, obstacles, dt);
      const k = 1 - Math.exp(-FEEL.camLag * dt);
      camera.position.x += (_pos.x - camera.position.x) * k;
      camera.position.z += (_pos.z - camera.position.z) * k;
      camera.position.y += (_pos.y - camera.position.y) * Math.min(1, k * 1.15);
      const floor = Math.max(heightAt(camera.position.x, camera.position.z) + 0.85, WORLD.waterY + 0.7);
      if (camera.position.y < floor) camera.position.y = floor;
      camera.up.set(0, 1, 0);
      camera.lookAt(_look);
    },
  };
}
