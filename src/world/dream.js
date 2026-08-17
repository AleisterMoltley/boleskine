import * as THREE from 'three';
import { POI } from '../config.js';
import { hash2 } from '../math.js';
import { PATHS } from '../height.js';
import { mapToPos, orientOnPlanet, tangentBasis, upOf } from '../planet.js';

const _up = new THREE.Vector3();
const _wish = new THREE.Vector3();

function plant(mesh, x, z, yOff = 0, yaw = 0) {
  const p = mapToPos(x, z, yOff);
  mesh.position.copy(p);
  orientOnPlanet(mesh, upOf(p), yaw);
  return mesh;
}

function makeWatcher(mats) {
  const g = new THREE.Group();
  const body = new THREE.Mesh(new THREE.CapsuleGeometry(0.22, 2.6, 3, 6), mats.watcher);
  body.position.y = 2.05;
  body.scale.set(0.7, 1.45, 0.7);
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.28, 7, 6), mats.watcher);
  head.position.y = 4.15;
  head.scale.set(0.72, 1.55, 0.78);
  const eL = new THREE.Mesh(new THREE.SphereGeometry(0.09, 6, 5), mats.glowGold);
  eL.position.set(-0.09, 4.22, 0.2);
  const eR = eL.clone();
  eR.position.x = 0.09;
  g.add(body, head, eL, eR);
  g.traverse((o) => {
    if (o.isMesh) o.castShadow = true;
  });
  return g;
}

function makeWisp(mats, teal) {
  const m = new THREE.Mesh(
    new THREE.OctahedronGeometry(0.2, 0),
    teal ? mats.wispTeal : mats.wispGold
  );
  m.scale.set(0.55, 2.2, 0.55);
  m.castShadow = false;
  return m;
}

function makeVeil(mats) {
  const m = new THREE.Mesh(new THREE.PlaneGeometry(4.2, 6.4, 1, 1), mats.veil);
  m.position.y = 2.9;
  m.castShadow = false;
  return m;
}

function makeEyes(mats) {
  const g = new THREE.Group();
  const eL = new THREE.Mesh(new THREE.SphereGeometry(0.08, 6, 5), mats.ember);
  eL.position.set(-0.16, 0, 0);
  const eR = eL.clone();
  eR.position.x = 0.16;
  g.add(eL, eR);
  g.visible = false;
  return g;
}

function addWatcher(scene, mats, list, x, z, ph) {
  const mesh = makeWatcher(mats);
  plant(mesh, x, z, 0, ph);
  scene.add(mesh);
  list.push({ mesh, mx: x, mz: z, ph });
}

export function createDream(scene, mats) {
  const watchers = [];

  addWatcher(scene, mats, watchers, POI.spawn.x - 7.2, POI.spawn.z + 9.5, 0.4);
  addWatcher(scene, mats, watchers, POI.spawn.x + 6.4, POI.spawn.z + 8.2, -0.3);
  addWatcher(scene, mats, watchers, POI.manor.x + 9, POI.manor.z + 2, 1.2);
  addWatcher(scene, mats, watchers, POI.manor.x - 11, POI.manor.z - 4, 2.1);

  for (let p = 0; p < PATHS.length; p++) {
    const [ax, az, bx, bz] = PATHS[p];
    const dx = bx - ax;
    const dz = bz - az;
    const len = Math.hypot(dx, dz) || 1;
    const nx = -dz / len;
    const nz = dx / len;
    const steps = Math.max(1, Math.floor(len / 15));
    for (let s = 1; s <= steps; s++) {
      const t = s / (steps + 1);
      const side = s % 2 ? 1 : -1;
      const off = 6.2 + hash2(p, s) * 1.8;
      const x = ax + dx * t + nx * side * off;
      const z = az + dz * t + nz * side * off;
      addWatcher(scene, mats, watchers, x, z, t * 5 + p);
    }
  }

  const wisps = [];
  const ribbons = PATHS.slice(0, 18);
  for (let r = 0; r < ribbons.length; r++) {
    const [ax, az, bx, bz] = ribbons[r];
    const n = Math.max(3, Math.floor(Math.hypot(bx - ax, bz - az) / 14));
    for (let k = 0; k < n; k++) {
      const mesh = makeWisp(mats, (r + k) % 3 === 0);
      scene.add(mesh);
      wisps.push({ mesh, ax, az, bx, bz, ph: k * 1.7 + r, spd: 0.06 + (k % 3) * 0.018 });
    }
  }

  const veils = [];
  const veilSpots = [
    [POI.spawn.x - 11, POI.spawn.z - 6, 0.6],
    [POI.spawn.x + 9, POI.spawn.z + 5, 1.8],
    [POI.wood.x + 18, POI.wood.z + 8, 1.1],
    [POI.hollow.x + 4, POI.hollow.z - 2, 0.2],
    [POI.daath.x + 3, POI.daath.z + 2, 0.8],
    [POI.manor.x + 10, POI.manor.z + 4, 2.2],
    [POI.mile.x - 6, POI.mile.z + 4, 1.4],
    [POI.plaza.x + 14, POI.plaza.z - 10, 0.3],
  ];
  for (const [x, z, yaw] of veilSpots) {
    const mesh = makeVeil(mats);
    plant(mesh, x, z, 0, yaw);
    scene.add(mesh);
    veils.push(mesh);
  }

  const eyes = makeEyes(mats);
  scene.add(eyes);
  const gaze = { t: 3.2, life: 0, mx: 0, mz: 0 };

  function sidestep(w, pawn, i) {
    const a = hash2(Math.floor(pawn.mx * 3 + i * 11), i) * Math.PI * 2;
    w.mx = pawn.mx + Math.cos(a) * 16;
    w.mz = pawn.mz + Math.sin(a) * 16;
  }

  function tick(t, dt, pawn) {
    let near = 0;
    for (let i = 0; i < watchers.length; i++) {
      const w = watchers[i];
      const dx = pawn.mx - w.mx;
      const dz = pawn.mz - w.mz;
      const d = Math.hypot(dx, dz);
      if (d < 2.4) sidestep(w, pawn, i);
      const p = mapToPos(w.mx, w.mz, Math.sin(t * 0.55 + w.ph) * 0.06);
      w.mesh.position.copy(p);
      upOf(p, _up);
      orientOnPlanet(w.mesh, _up, Math.atan2(dx, dz) + Math.sin(t * 0.35 + w.ph) * 0.08);
      if (d < 32) near = Math.max(near, 1 - d / 32);
    }

    for (const w of wisps) {
      const u = ((t * w.spd + w.ph * 0.08) % 1 + 1) % 1;
      const x = w.ax + (w.bx - w.ax) * u;
      const z = w.az + (w.bz - w.az) * u;
      const lift = 1.25 + Math.sin(t * 1.4 + w.ph) * 0.4;
      w.mesh.position.copy(mapToPos(x, z, lift));
      w.mesh.rotation.y = t * 1.6 + w.ph;
      w.mesh.scale.set(0.7, 2.3 + Math.sin(t * 3 + w.ph) * 0.45, 0.7);
    }

    for (let i = 0; i < veils.length; i++) {
      veils[i].rotation.y = Math.sin(t * 0.35 + i) * 0.18;
      veils[i].scale.x = 1 + Math.sin(t * 0.5 + i * 0.7) * 0.08;
    }

    gaze.t -= dt;
    if (gaze.life > 0) {
      gaze.life -= dt;
      const p = mapToPos(gaze.mx, gaze.mz, 1.7);
      eyes.position.copy(p);
      upOf(p, _up);
      const { east, north } = tangentBasis(_up);
      _wish.copy(pawn.pos).sub(p);
      orientOnPlanet(eyes, _up, Math.atan2(_wish.dot(east), _wish.dot(north)));
      const fade = Math.min(1, gaze.life, (2.8 - gaze.life) * 2);
      eyes.visible = fade > 0.05;
      eyes.scale.setScalar(1 + fade * 0.4);
      if (gaze.life <= 0) eyes.visible = false;
    } else if (gaze.t <= 0) {
      const a = hash2(Math.floor(t * 3), 2) * Math.PI * 2;
      gaze.mx = pawn.mx + Math.cos(a) * (20 + hash2(Math.floor(t), 5) * 10);
      gaze.mz = pawn.mz + Math.sin(a) * (20 + hash2(Math.floor(t), 5) * 10);
      gaze.life = 2.8;
      gaze.t = 6 + hash2(Math.floor(t), 9) * 7;
      eyes.visible = true;
    }

    return near;
  }

  return { tick };
}
