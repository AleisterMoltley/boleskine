import * as THREE from 'three';
import { POI, WORLD } from '../config.js';
import { heightAt, isWater, pathWidth } from '../height.js';
import { groundR, latLonToMap, OCEAN_R, PLANET_R } from '../planet.js';

export function createTerrain(scene, mats) {
  const seg = 200;
  const hseg = Math.floor(seg * 0.75);
  const geo = new THREE.SphereGeometry(PLANET_R, seg, hseg);
  const pos = geo.attributes.position;
  const col = new Float32Array(pos.count * 3);
  const tmp = new THREE.Color();
  const rustA = new THREE.Color(0x8a4030);
  const rustB = new THREE.Color(0xc07040);
  const maria = new THREE.Color(0x3a2218);
  const path = new THREE.Color(0x6a3a28);
  const dust = new THREE.Color(0x4a2a22);
  const highland = new THREE.Color(0xb87858);
  const ice = new THREE.Color(0xd4c8bc);

  for (let i = 0; i < pos.count; i++) {
    const vx = pos.getX(i);
    const vy = pos.getY(i);
    const vz = pos.getZ(i);
    const n0 = Math.hypot(vx, vy, vz) || 1;
    const lat = Math.asin(Math.max(-1, Math.min(1, vy / n0)));
    const lon = Math.atan2(vz, vx);
    const r = groundR(lat, lon);
    pos.setXYZ(i, (vx / n0) * r, (vy / n0) * r, (vz / n0) * r);
    const m = latLonToMap(lat, lon);
    const h = heightAt(m.x, m.z);
    const pw = pathWidth(m.x, m.z);
    const inland = Math.hypot(m.x, m.z) < WORLD.islandR + 12;
    const polar = Math.abs(lat) > 1.02;
    const nearMauve = Math.hypot(m.x - POI.mauve.x, m.z - POI.mauve.z) < 18;
    if (polar) tmp.copy(ice);
    else if (nearMauve) tmp.set(0x5a3848).lerp(maria, 0.35);
    else if (!inland) {
      if (r < OCEAN_R + 0.55) tmp.copy(maria);
      else tmp.copy(rustA).lerp(rustB, (Math.sin(lat * 6 + lon * 2) + 1) * 0.28);
    } else if (pw < 3.2) tmp.copy(path);
    else if (isWater(m.x, m.z) || h < WORLD.waterY + 0.55) tmp.copy(dust);
    else if (h > 13.5) tmp.copy(highland);
    else tmp.set(0x9a4a32);
    col[i * 3] = tmp.r;
    col[i * 3 + 1] = tmp.g;
    col[i * 3 + 2] = tmp.b;
  }
  geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
  geo.computeVertexNormals();
  geo.computeBoundingSphere();
  geo.computeBoundingBox();

  const mesh = new THREE.Mesh(
    geo,
    new THREE.MeshToonMaterial({ vertexColors: true, gradientMap: mats.ramp })
  );
  mesh.receiveShadow = true;
  mesh.name = 'land';
  scene.add(mesh);
  mesh.updateMatrixWorld(true);

  const water = new THREE.Group();
  scene.add(water);

  return { mesh, water, widthSegs: seg, heightSegs: hseg };
}

export function rippleWater() {}
