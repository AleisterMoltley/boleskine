import * as THREE from 'three';
import { WORLD } from '../config.js';
import { heightAt, isWater, pathWidth } from '../height.js';
import { groundR, latLonToMap, OCEAN_R, PLANET_R } from '../planet.js';

export function createTerrain(scene, mats) {
  const seg = 128;
  const geo = new THREE.SphereGeometry(PLANET_R, seg, Math.floor(seg * 0.72));
  const pos = geo.attributes.position;
  const col = new Float32Array(pos.count * 3);
  const tmp = new THREE.Color();

  for (let i = 0; i < pos.count; i++) {
    const vx = pos.getX(i);
    const vy = pos.getY(i);
    const vz = pos.getZ(i);
    const lat = Math.asin(Math.max(-1, Math.min(1, vy / PLANET_R)));
    const lon = Math.atan2(vz, vx);
    const r = groundR(lat, lon);
    const n = Math.hypot(vx, vy, vz) || 1;
    pos.setXYZ(i, (vx / n) * r, (vy / n) * r, (vz / n) * r);
    const m = latLonToMap(lat, lon);
    const h = heightAt(m.x, m.z);
    const pw = pathWidth(m.x, m.z);
    const inland = Math.hypot(m.x, m.z) < WORLD.islandR + 12;
    if (!inland) {
      if (r < OCEAN_R + 0.5) tmp.set(0x0c1824);
      else tmp.set(0x243028);
    } else if (pw < 3.2) tmp.set(0x5a4a38);
    else if (isWater(m.x, m.z) || h < WORLD.waterY + 0.55) tmp.set(0x6a6050);
    else if (h > 13.5) tmp.set(0x6a6a78);
    else tmp.set(0x3a4a40);
    col[i * 3] = tmp.r;
    col[i * 3 + 1] = tmp.g;
    col[i * 3 + 2] = tmp.b;
  }
  geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
  geo.computeVertexNormals();

  const mesh = new THREE.Mesh(
    geo,
    new THREE.MeshToonMaterial({ vertexColors: true, gradientMap: mats.ramp })
  );
  mesh.receiveShadow = true;
  scene.add(mesh);

  const water = new THREE.Mesh(new THREE.SphereGeometry(OCEAN_R, 64, 48), mats.water);
  scene.add(water);

  return { mesh, water };
}

export function rippleWater(water, t) {
  water.rotation.y = t * 0.012;
}
