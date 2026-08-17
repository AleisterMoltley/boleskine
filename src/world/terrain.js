import * as THREE from 'three';
import { POI, WORLD } from '../config.js';
import { heightAt, isWater, pathWidth } from '../height.js';
import { fbm } from '../math.js';
import { groundR, latLonToMap, OCEAN_R, PLANET_R } from '../planet.js';

function near(mx, mz, p, r) {
  const dx = mx - p.x;
  const dz = mz - p.z;
  return dx * dx + dz * dz < r * r;
}

export function createTerrain(scene, mats) {
  const seg = 220;
  const hseg = Math.floor(seg * 0.75);
  const geo = new THREE.SphereGeometry(PLANET_R, seg, hseg);
  const pos = geo.attributes.position;
  const col = new Float32Array(pos.count * 3);
  const tmp = new THREE.Color();
  const rustA = new THREE.Color(0x8a4834);
  const rustB = new THREE.Color(0xaa5c48);
  const rustC = new THREE.Color(0x5a2c20);
  const maria = new THREE.Color(0x2e1a16);
  const path = new THREE.Color(0x7a5844);
  const dust = new THREE.Color(0x4a2820);
  const highland = new THREE.Color(0xaa6c54);
  const ice = new THREE.Color(0xc4b4a8);
  const ash = new THREE.Color(0x6a5a50);
  const umber = new THREE.Color(0x4a2820);
  const earth = new THREE.Color(0x6a4430);
  const stone = new THREE.Color(0x6a5c54);
  const mauve = new THREE.Color(0x5a3850);
  const ochre = new THREE.Color(0x9a6440);

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
    const mott = fbm(m.x * 0.04 + 3, m.z * 0.04 - 2, 3) * 0.35;
    const grit = fbm(m.x * 0.15, m.z * 0.15, 2) * 0.25;

    if (polar) {
      tmp.copy(ice).lerp(ash, grit * 0.35);
    } else if (near(m.x, m.z, POI.mauve, 20)) {
      tmp.copy(mauve).lerp(maria, mott * 0.4);
    } else if (!inland) {
      if (r < OCEAN_R + 0.55) tmp.copy(maria).lerp(rustC, grit * 0.25);
      else {
        tmp.copy(rustA).lerp(rustB, (Math.sin(lat * 6 + lon * 2) + 1) * 0.22);
        tmp.lerp(ochre, mott * 0.35);
        tmp.lerp(rustC, grit * 0.2);
      }
    } else if (pw < 2.8) {
      tmp.copy(path).lerp(earth, grit * 0.4);
    } else if (isWater(m.x, m.z) || h < WORLD.waterY + 0.55) {
      tmp.copy(dust).lerp(maria, mott * 0.3);
    } else if (near(m.x, m.z, POI.manor, 16) || near(m.x, m.z, POI.spawn, 10)) {
      tmp.copy(stone).lerp(path, mott * 0.45);
    } else if (near(m.x, m.z, POI.plaza, 18) || near(m.x, m.z, POI.fullness, 10) || near(m.x, m.z, POI.daath, 10)) {
      tmp.copy(path).lerp(ash, mott * 0.35);
    } else if (near(m.x, m.z, POI.kirk, 22) || near(m.x, m.z, POI.willow, 8)) {
      tmp.copy(ash).lerp(umber, grit * 0.4);
    } else if (near(m.x, m.z, POI.village, 22) || near(m.x, m.z, POI.press, 10)) {
      tmp.copy(earth).lerp(rustA, mott * 0.4);
    } else if (near(m.x, m.z, POI.wood, 28) || near(m.x, m.z, POI.hollow, 12) || near(m.x, m.z, POI.marks, 10)) {
      tmp.copy(umber).lerp(rustC, grit * 0.35);
    } else if (near(m.x, m.z, POI.abbey, 16)) {
      tmp.copy(ash).lerp(stone, mott * 0.4);
    } else if (h > 13.5) {
      tmp.copy(highland).lerp(ochre, grit * 0.3);
    } else {
      tmp.set(0x6a3024).lerp(rustC, mott * 0.45);
      tmp.lerp(earth, grit * 0.2);
    }
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
    new THREE.MeshToonMaterial({
      vertexColors: true,
      gradientMap: mats.ramp,
      map: mats.rustGrit,
    })
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
