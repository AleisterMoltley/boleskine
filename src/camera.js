import * as THREE from 'three';
import { FEEL, WORLD } from './config.js';
import { clamp } from './math.js';
import { heightAt } from './height.js';
import { camHit } from './obstacles.js';

const _pos = new THREE.Vector3();
const _look = new THREE.Vector3();

export function createChaseCam(camera) {
  const orbit = { yaw: -0.52, pitch: -0.12, dist: FEEL.camDist };
  _pos.copy(camera.position);

  function ideal(p) {
    const cp = Math.cos(orbit.pitch);
    const sp = Math.sin(orbit.pitch);
    const sy = Math.sin(orbit.yaw);
    const cy = Math.cos(orbit.yaw);
    const dist = orbit.dist;
    _look.set(p.x, p.y + FEEL.camLook, p.z);
    _pos.set(
      p.x + sy * dist * cp,
      p.y + FEEL.camHeight + dist * sp,
      p.z + cy * dist * cp
    );
    return dist;
  }

  return {
    orbit,
    applyLook(dx, dy) {
      orbit.yaw -= dx * FEEL.mouseSens;
      orbit.pitch -= dy * FEEL.mouseSens;
      orbit.pitch = clamp(orbit.pitch, FEEL.pitchMin, FEEL.pitchMax);
    },
    snap(p, obstacles) {
      const dist = ideal(p);
      this.solve(p, obstacles, dist);
      camera.position.copy(_pos);
      camera.up.set(0, 1, 0);
      camera.lookAt(_look);
    },
    solve(p, obstacles, dist) {
      const dx = _pos.x - _look.x;
      const dy = _pos.y - _look.y;
      const dz = _pos.z - _look.z;
      const len = Math.hypot(dx, dy, dz) || 1;
      const nx = dx / len;
      const ny = dy / len;
      const nz = dz / len;
      const hit = camHit(_look.x, _look.y, _look.z, nx, ny, nz, dist, obstacles);
      _pos.set(_look.x + nx * hit, _look.y + ny * hit, _look.z + nz * hit);
      const floor = heightAt(_pos.x, _pos.z) + 1.15;
      if (_pos.y < floor) _pos.y = floor;
      if (_pos.y < WORLD.waterY + 0.8) _pos.y = WORLD.waterY + 0.8;
    },
    tick(p, dt, obstacles) {
      const dist = ideal(p);
      this.solve(p, obstacles, dist);
      camera.position.lerp(_pos, 1 - Math.exp(-FEEL.camLag * dt));
      const floor = heightAt(camera.position.x, camera.position.z) + 0.9;
      if (camera.position.y < floor) camera.position.y = floor;
      camera.up.set(0, 1, 0);
      camera.lookAt(_look);
    },
  };
}
