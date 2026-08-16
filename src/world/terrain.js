import * as THREE from 'three';
import { PAL, WORLD } from '../config.js';
import { heightAt, pathWidth } from '../height.js';

export function createTerrain(scene, mats) {
  const seg = WORLD.meshSeg;
  const size = WORLD.size;
  const geo = new THREE.PlaneGeometry(size, size, seg, seg);
  geo.rotateX(-Math.PI / 2);
  const pos = geo.attributes.position;
  const col = new Float32Array(pos.count * 3);
  const cGrass = new THREE.Color(PAL.grass);
  const cDeep = new THREE.Color(PAL.grassDeep);
  const cDirt = new THREE.Color(PAL.dirt);
  const cSand = new THREE.Color(PAL.sand);
  const cStone = new THREE.Color(PAL.stoneDark);
  const tmp = new THREE.Color();

  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const z = pos.getZ(i);
    const y = heightAt(x, z);
    pos.setY(i, y);
    const pw = pathWidth(x, z);
    const shore = Math.abs(y - WORLD.waterY);
    if (pw < 3.2) tmp.set(0x5a4a38);
    else if (y < WORLD.waterY + 0.55) tmp.set(0x6a6050);
    else if (y > 13.5) tmp.set(0x6a6a78);
    else tmp.set(0x3a4a40).lerp(new THREE.Color(0x2a3830), (Math.sin(x * 0.2) + Math.cos(z * 0.17)) * 0.25 + 0.35);
    if (shore < 1.4 && y < WORLD.waterY + 1.2) tmp.lerp(cSand, 1 - shore / 1.4);
    col[i * 3] = tmp.r;
    col[i * 3 + 1] = tmp.g;
    col[i * 3 + 2] = tmp.b;
  }
  geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
  geo.computeVertexNormals();

  const mat = new THREE.MeshToonMaterial({
    vertexColors: true,
    gradientMap: mats.ramp,
  });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.receiveShadow = true;
  mesh.matrixAutoUpdate = false;
  mesh.updateMatrix();
  scene.add(mesh);

  const water = new THREE.Mesh(new THREE.PlaneGeometry(size * 1.15, size * 1.15, 32, 32), mats.water);
  water.rotation.x = -Math.PI / 2;
  water.position.y = WORLD.waterY;
  scene.add(water);

  return { mesh, water };
}

export function rippleWater(water, t) {
  water.position.y = WORLD.waterY + Math.sin(t * 0.45) * 0.04;
  water.rotation.z = Math.sin(t * 0.12) * 0.004;
}
