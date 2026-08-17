import * as THREE from 'three';
import { POI, WORLD } from '../config.js';
import { hash2 } from '../math.js';
import { heightAt, isWater, pathWidth, PATHS } from '../height.js';
import { MAP_SCALE, mapToPos, tangentBasis, upOf } from '../planet.js';

const _m = new THREE.Matrix4();
const _q = new THREE.Quaternion();
const _s = new THREE.Vector3();
const _up = new THREE.Vector3();
const _fwd = new THREE.Vector3();
const _right = new THREE.Vector3();
const _basis = new THREE.Matrix4();

function plantMat(x, z, yOff, yaw, sx, sy, sz) {
  const p = mapToPos(x, z, yOff);
  upOf(p, _up);
  const { east, north } = tangentBasis(_up);
  _fwd.copy(north).multiplyScalar(Math.cos(yaw)).addScaledVector(east, Math.sin(yaw));
  if (_fwd.lengthSq() < 1e-8) _fwd.copy(north);
  _fwd.normalize();
  _right.crossVectors(_up, _fwd).normalize();
  _fwd.crossVectors(_right, _up).normalize();
  _basis.makeBasis(_right, _up, _fwd);
  _q.setFromRotationMatrix(_basis);
  _s.set(sx, sy, sz);
  _m.compose(p, _q, _s);
}

function pool(scene, geo, mat, max) {
  const mesh = new THREE.InstancedMesh(geo, mat, max);
  mesh.instanceMatrix.setUsage(THREE.StaticDrawUsage);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  mesh.frustumCulled = false;
  mesh.count = 0;
  scene.add(mesh);
  return mesh;
}

function push(mesh, x, z, yOff, yaw, sx, sy, sz) {
  if (mesh.count >= mesh.instanceMatrix.count) return false;
  plantMat(x, z, yOff, yaw, sx, sy, sz);
  mesh.setMatrixAt(mesh.count++, _m);
  return true;
}

function tooCloseToHub(x, z, r) {
  for (const p of Object.values(POI)) {
    const dx = x - p.x;
    const dz = z - p.z;
    if (dx * dx + dz * dz < r * r) return true;
  }
  return false;
}

function inCameraPit(x, z) {
  const dx = x - POI.spawn.x;
  const dz = z - (POI.spawn.z - 6);
  return dx * dx + dz * dz < 36;
}

function walkRibbon(x, z) {
  return pathWidth(x, z) < 1.8;
}

function dryLand(x, z) {
  return Number.isFinite(x) && Number.isFinite(z) && !isWater(x, z);
}

function mileStone(mats) {
  const g = new THREE.Group();
  const post = new THREE.Mesh(new THREE.BoxGeometry(0.38, 1.55, 0.18), mats.stone);
  post.position.y = 0.78;
  const notch = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.12, 0.04), mats.gold);
  notch.position.set(0, 1.25, 0.1);
  const step = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.08, 0.45), mats.stoneDark);
  step.position.y = 0.04;
  g.add(post, notch, step);
  return g;
}

function twoPosts(mats) {
  const g = new THREE.Group();
  const a = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.1, 2.1, 6), mats.woodDeep);
  a.position.set(-0.7, 1.05, 0);
  a.rotation.z = 0.18;
  const b = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.1, 1.7, 6), mats.wood);
  b.position.set(0.75, 0.85, 0.1);
  b.rotation.z = -0.22;
  const slab = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.06, 0.7), mats.stoneDark);
  slab.position.y = 0.03;
  g.add(a, b, slab);
  return g;
}

function inkCamp(mats) {
  const g = new THREE.Group();
  const spill = new THREE.Mesh(new THREE.CylinderGeometry(0.85, 0.95, 0.05, 10), mats.robeDeep);
  spill.position.y = 0.03;
  const pot = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.16, 0.22, 7), mats.iron);
  pot.position.set(0.35, 0.14, 0.2);
  pot.rotation.z = 1.1;
  const sheet = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.02, 0.55), mats.bone);
  sheet.position.set(-0.45, 0.06, -0.1);
  sheet.rotation.y = 0.3;
  g.add(spill, pot, sheet);
  return g;
}

function mothWell(mats) {
  const g = new THREE.Group();
  const rim = new THREE.Mesh(new THREE.CylinderGeometry(0.7, 0.82, 0.55, 10), mats.stoneDark);
  rim.position.y = 0.28;
  const glow = new THREE.Mesh(new THREE.SphereGeometry(0.12, 6, 5), mats.glowGold);
  glow.position.y = 0.42;
  g.add(rim, glow);
  return g;
}

function boneGate(mats) {
  const g = new THREE.Group();
  for (const x of [-1.15, 1.15]) {
    const p = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.16, 2.4, 6), mats.bone);
    p.position.set(x, 1.2, 0);
    p.rotation.z = x > 0 ? -0.12 : 0.12;
    g.add(p);
  }
  const lintel = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.16, 0.18), mats.bone);
  lintel.position.y = 2.35;
  g.add(lintel);
  return g;
}

function ashRow(mats) {
  const g = new THREE.Group();
  for (let i = 0; i < 7; i++) {
    const s = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.55 + (i % 3) * 0.15, 0.1), mats.stone);
    s.position.set((i - 3) * 0.7, 0.3, Math.sin(i) * 0.15);
    s.rotation.z = (i - 3) * 0.05;
    g.add(s);
  }
  return g;
}

function starWatch(mats) {
  const g = new THREE.Group();
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2;
    const p = new THREE.Mesh(new THREE.DodecahedronGeometry(0.14, 0), mats.stoneLite);
    p.position.set(Math.cos(a) * 2.4, 0.1, Math.sin(a) * 2.4);
    g.add(p);
  }
  const needle = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.1, 1.9, 6), mats.iron);
  needle.position.y = 0.95;
  g.add(needle);
  return g;
}

function dustChoir(mats) {
  const g = new THREE.Group();
  for (let i = 0; i < 5; i++) {
    const a = -0.8 + i * 0.4;
    const s = new THREE.Mesh(new THREE.BoxGeometry(0.28, 1.3 + i * 0.15, 0.12), mats.sand);
    s.position.set(Math.sin(a) * 2.2, 0.7, Math.cos(a) * 1.4);
    s.rotation.y = a;
    s.rotation.z = Math.sin(i) * 0.12;
    g.add(s);
  }
  return g;
}

function silentNeedle(mats) {
  const g = new THREE.Group();
  const n = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.14, 3.4, 6), mats.iron);
  n.position.y = 1.7;
  const base = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.4, 0.1, 8), mats.stoneDark);
  base.position.y = 0.05;
  g.add(n, base);
  return g;
}

function rustCamp(mats) {
  const g = new THREE.Group();
  const hull = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.32, 0.8), mats.iron);
  hull.position.y = 0.18;
  hull.rotation.z = 0.2;
  const drum = new THREE.Mesh(new THREE.CylinderGeometry(0.26, 0.28, 0.48, 8), mats.wood);
  drum.position.set(1.2, 0.24, 0.4);
  const fire = new THREE.Mesh(new THREE.DodecahedronGeometry(0.22, 0), mats.stoneDark);
  fire.position.set(-0.6, 0.12, 0.5);
  g.add(hull, drum, fire);
  return g;
}

function ringDress(plant, mats, cx, cz, r0, r1, n) {
  for (let k = 0; k < n; k++) {
    const a = (k / n) * Math.PI * 2 + hash2(cx, k) * 0.2;
    const d = r0 + hash2(k, cz) * (r1 - r0);
    const x = cx + Math.cos(a) * d;
    const z = cz + Math.sin(a) * d;
    if (!dryLand(x, z) || walkRibbon(x, z)) continue;
    const rock = new THREE.Mesh(
      new THREE.DodecahedronGeometry(0.7 + hash2(k, 4) * 0.55, 0),
      k % 2 ? mats.stone : mats.sand
    );
    rock.scale.set(1.2, 0.65 + hash2(k, 2) * 0.25, 1.05);
    plant(rock, x, z, a, 0.22);
  }
}

export function dressWorld(scene, mats, obstacles, plant) {
  const boulder = pool(scene, new THREE.DodecahedronGeometry(0.95, 0), mats.stone, 900);
  const rust = pool(scene, new THREE.DodecahedronGeometry(0.9, 0), mats.sand, 700);
  const menhir = pool(scene, new THREE.BoxGeometry(0.42, 2.15, 0.2), mats.stoneDark, 420);
  const trunk = pool(scene, new THREE.CylinderGeometry(0.16, 0.26, 4.1, 6), mats.woodDeep, 520);
  const crown = pool(scene, new THREE.SphereGeometry(1.15, 6, 5), mats.leaf, 520);
  const bush = pool(scene, new THREE.SphereGeometry(0.62, 6, 5), mats.leaf, 480);

  function treeAt(x, z, yaw, sc) {
    push(trunk, x, z, 2.05, yaw, sc, sc, sc);
    push(crown, x, z, 4.15, yaw, 1.35 * sc, 0.42 * sc, 1.15 * sc);
  }

  for (const p of PATHS) {
    const dx = p[2] - p[0];
    const dz = p[3] - p[1];
    const len = Math.hypot(dx, dz) || 1;
    const nx = -dz / len;
    const nz = dx / len;
    const steps = Math.max(2, Math.floor(len / 2.6));
    for (let s = 1; s < steps; s++) {
      const t = s / steps;
      for (const side of [-1, 1]) {
        const off = 3.1 + hash2(s, side + 4) * 1.6;
        const x = p[0] + dx * t + nx * side * off;
        const z = p[1] + dz * t + nz * side * off;
        if (!dryLand(x, z) || inCameraPit(x, z) || walkRibbon(x, z)) continue;
        const kind = Math.floor(hash2(s * 5 + side, Math.floor(p[0] + 17)) * 5);
        const yaw = t * 5 + side;
        if (kind === 0) {
          const sc = 1.05 + hash2(s, 3) * 0.45;
          treeAt(x, z, yaw, sc);
          obstacles.cyl(x, z, heightAt(x, z), heightAt(x, z) + 3.8, 0.28, 'tree');
        } else if (kind === 1) {
          push(menhir, x, z, 1.08, yaw, 1, 1 + hash2(s, 2) * 0.35, 1);
          obstacles.cyl(x, z, heightAt(x, z), heightAt(x, z) + 2.1, 0.22, 'stone');
        } else if (kind === 2) {
          push(bush, x, z, 0.38, yaw, 1.1, 0.7, 1.1);
        } else {
          const sc = 0.95 + hash2(s, 7) * 0.55;
          push(s % 2 ? rust : boulder, x, z, 0.28, yaw, sc, 0.62, sc);
        }
      }
    }
  }

  let n = 0;
  let guard = 0;
  while (trunk.count < 360 && guard < 10000) {
    guard++;
    n++;
    const x = (hash2(n, 3) - 0.5) * WORLD.islandR * 1.85;
    const z = (hash2(n, 9) - 0.5) * WORLD.islandR * 1.85;
    if (Math.hypot(x, z) > WORLD.islandR - 10) continue;
    if (!dryLand(x, z) || walkRibbon(x, z) || inCameraPit(x, z) || tooCloseToHub(x, z, 10)) continue;
    const sc = 0.95 + hash2(n, 6) * 0.7;
    treeAt(x, z, hash2(n, 8) * 6, sc);
  }

  n = 0;
  guard = 0;
  while (boulder.count < 520 && guard < 9000) {
    guard++;
    n++;
    const x = (hash2(n, 11) - 0.5) * WORLD.islandR * 1.9;
    const z = (hash2(n, 14) - 0.5) * WORLD.islandR * 1.9;
    if (Math.hypot(x, z) > WORLD.islandR - 6) continue;
    if (!dryLand(x, z) || walkRibbon(x, z) || inCameraPit(x, z) || tooCloseToHub(x, z, 7)) continue;
    const sc = 1.05 + hash2(n, 4) * 0.85;
    push(boulder, x, z, 0.3, hash2(n, 2) * 6, sc, 0.58, sc);
  }

  n = 0;
  guard = 0;
  while (menhir.count < 280 && guard < 8000) {
    guard++;
    n++;
    const x = (hash2(n, 21) - 0.5) * WORLD.islandR * 1.8;
    const z = (hash2(n, 22) - 0.5) * WORLD.islandR * 1.8;
    if (Math.hypot(x, z) > WORLD.islandR - 12) continue;
    if (!dryLand(x, z) || walkRibbon(x, z) || inCameraPit(x, z) || tooCloseToHub(x, z, 9)) continue;
    push(menhir, x, z, 1.08, hash2(n, 5) * 6, 1, 0.9 + hash2(n, 1) * 0.5, 1);
  }

  n = 0;
  guard = 0;
  while (bush.count < 360 && guard < 8000) {
    guard++;
    n++;
    const x = (hash2(n, 31) - 0.5) * WORLD.islandR * 1.85;
    const z = (hash2(n, 32) - 0.5) * WORLD.islandR * 1.85;
    if (Math.hypot(x, z) > WORLD.islandR - 8) continue;
    if (!dryLand(x, z) || walkRibbon(x, z) || inCameraPit(x, z)) continue;
    push(bush, x, z, 0.36, hash2(n, 7) * 6, 1.15, 0.65, 1.15);
  }

  n = 0;
  guard = 0;
  while (rust.count < 380 && guard < 9000) {
    guard++;
    n++;
    const lat = (hash2(n, 13) - 0.5) * 2.0;
    const lon = hash2(n, 17) * Math.PI * 2 - Math.PI;
    const x = lon * MAP_SCALE;
    const z = lat * MAP_SCALE;
    if (Math.hypot(x, z) < WORLD.islandR + 12) continue;
    if (Math.abs(lat) > 1.04) continue;
    const sc = 1.15 + hash2(n, 2) * 0.95;
    push(rust, x, z, 0.32, hash2(n, 5) * 6, sc, 0.55, sc);
  }

  const sites = [
    [mileStone(mats), POI.mile.x, POI.mile.z, 0.2, 1.6, 0.28],
    [twoPosts(mats), POI.tworoads.x, POI.tworoads.z, 0.4, 2.2, 0.4],
    [inkCamp(mats), POI.ink.x, POI.ink.z, 0.1, 0.4, 0.7],
    [mothWell(mats), POI.mothwell.x, POI.mothwell.z, 0.15, 0.7, 0.75],
    [boneGate(mats), POI.bonegate.x, POI.bonegate.z, 0.05, 2.5, 0.4],
    [ashRow(mats), POI.ashrow.x, POI.ashrow.z, 0.3, 0.8, 1.1],
    [rustCamp(mats), POI.redcamp.x, POI.redcamp.z, 0.4, 0.8, 0.9],
    [silentNeedle(mats), POI.silent.x, POI.silent.z, 0.1, 3.4, 0.22],
    [starWatch(mats), POI.stargaze.x, POI.stargaze.z, 0.2, 2.0, 0.2],
    [dustChoir(mats), POI.dustchoir.x, POI.dustchoir.z, 0.15, 1.6, 0.8],
  ];
  for (const [mesh, x, z, rot, h, rad] of sites) {
    plant(mesh, x, z, rot);
    obstacles.cyl(x, z, heightAt(x, z), heightAt(x, z) + h, rad, 'desk');
    ringDress(plant, mats, x, z, 2.4, 5.2, 10);
  }

  ringDress(plant, mats, POI.spawn.x, POI.spawn.z, 7.5, 13, 18);
  ringDress(plant, mats, POI.plaza.x, POI.plaza.z, 10, 16, 20);
  ringDress(plant, mats, POI.manor.x, POI.manor.z, 12, 18, 16);
  ringDress(plant, mats, POI.village.x, POI.village.z, 10, 18, 20);
  ringDress(plant, mats, POI.kirk.x, POI.kirk.z, 9, 16, 16);
  ringDress(plant, mats, POI.wood.x, POI.wood.z, 8, 20, 22);
  ringDress(plant, mats, POI.abbey.x, POI.abbey.z, 10, 16, 14);

  boulder.instanceMatrix.needsUpdate = true;
  rust.instanceMatrix.needsUpdate = true;
  menhir.instanceMatrix.needsUpdate = true;
  trunk.instanceMatrix.needsUpdate = true;
  crown.instanceMatrix.needsUpdate = true;
  bush.instanceMatrix.needsUpdate = true;
}
