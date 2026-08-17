import * as THREE from 'three';
import { POI } from './config.js';
import { hash2 } from './math.js';
import { isWater } from './height.js';
import { mapToPos, orientOnPlanet, plantOnMesh, tangentBasis, upOf, wrapTangent } from './planet.js';

const _up = new THREE.Vector3();
const _wish = new THREE.Vector3();

export function createCombat(scene, mats) {
  const shadows = [];
  const bolts = [];
  const group = new THREE.Group();
  scene.add(group);

  function spawnShadow(mx, mz) {
    const g = new THREE.Group();
    const body = new THREE.Mesh(new THREE.CapsuleGeometry(0.12, 1.25, 3, 6), mats.shadow);
    body.position.y = 0.95;
    body.scale.set(0.7, 1.35, 0.7);
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.16, 6, 5), mats.shadow);
    head.position.y = 1.85;
    head.scale.set(0.7, 1.55, 0.75);
    const eL = new THREE.Mesh(new THREE.SphereGeometry(0.04, 5, 4), mats.ember);
    eL.position.set(-0.05, 1.92, 0.12);
    const eR = eL.clone();
    eR.position.x = 0.05;
    g.add(body, head, eL, eR);
    const pos = mapToPos(mx, mz);
    plantOnMesh(pos);
    g.position.copy(pos);
    orientOnPlanet(g, upOf(pos), 0);
    group.add(g);
    shadows.push({ mesh: g, mx, mz, pos: pos.clone(), hp: 2, hurt: 0, hitCd: 0 });
  }

  const spots = [];
  for (let i = 0; i < 14; i++) {
    const a = hash2(i, 4);
    const b = hash2(i, 9);
    const x = (a - 0.5) * 260;
    const z = (b - 0.5) * 260;
    const nearTown =
      Math.hypot(x - POI.plaza.x, z - POI.plaza.z) < 22 ||
      Math.hypot(x - POI.village.x, z - POI.village.z) < 20 ||
      Math.hypot(x - POI.manor.x, z - POI.manor.z) < 18;
    if (nearTown || isWater(x, z)) continue;
    spots.push({ x, z });
  }
  spots.push({ x: POI.hollow.x + 6, z: POI.hollow.z + 2 });
  spots.push({ x: POI.hollow.x - 5, z: POI.hollow.z - 4 });
  spots.push({ x: POI.hollow.x + 2, z: POI.hollow.z - 7 });
  spots.push({ x: POI.spawn.x + 9, z: POI.spawn.z - 24 });
  spots.push({ x: POI.mile.x + 5, z: POI.mile.z - 4 });
  spots.push({ x: POI.spawn.x - 20, z: POI.spawn.z - 9 });
  spots.push({ x: POI.plaza.x - 18, z: POI.plaza.z + 16 });
  for (const s of spots) spawnShadow(s.x, s.z);

  function fire(pawn) {
    const mesh = new THREE.Mesh(new THREE.OctahedronGeometry(0.11, 0), mats.glowGold);
    upOf(pawn.pos, _up);
    const { east, north } = tangentBasis(_up);
    const fx = north.clone().multiplyScalar(Math.cos(pawn.yaw)).addScaledVector(east, Math.sin(pawn.yaw));
    const pos = pawn.pos.clone().addScaledVector(_up, 1.35).addScaledVector(fx, 0.8);
    mesh.position.copy(pos);
    group.add(mesh);
    const vel = fx.multiplyScalar(22);
    bolts.push({ mesh, pos, vel, life: 1.15 });
  }

  function tick(dt, pawn, onHitPlayer) {
    for (let i = bolts.length - 1; i >= 0; i--) {
      const b = bolts[i];
      b.life -= dt;
      b.pos.addScaledVector(b.vel, dt);
      b.mesh.position.copy(b.pos);
      b.mesh.rotation.y += dt * 10;
      if (b.life <= 0) {
        group.remove(b.mesh);
        bolts.splice(i, 1);
        continue;
      }
      for (const s of shadows) {
        if (s.hp <= 0) continue;
        if (b.pos.distanceTo(s.mesh.position) < 1.1) {
          s.hp -= 1;
          s.hurt = 0.2;
          group.remove(b.mesh);
          bolts.splice(i, 1);
          if (s.hp <= 0) {
            s.mesh.visible = false;
            s.deadAt = 12;
          }
          break;
        }
      }
    }

    for (const s of shadows) {
      if (s.hp <= 0) {
        s.deadAt -= dt;
        if (s.deadAt <= 0) {
          s.hp = 2;
          s.mesh.visible = true;
          s.mx = pawn.mx + (Math.random() - 0.5) * 70;
          s.mz = pawn.mz + (Math.random() - 0.5) * 70;
        }
        continue;
      }
      s.hurt = Math.max(0, s.hurt - dt);
      s.hitCd = Math.max(0, s.hitCd - dt);
      const dx = pawn.mx - s.mx;
      const dz = pawn.mz - s.mz;
      const d = Math.hypot(dx, dz);
      if (d < 48 && d > 0.2) {
        const rush = d < 10 ? 3.1 : 2.15;
        s.mx += (dx / d) * rush * dt;
        s.mz += (dz / d) * rush * dt;
      }
      const pos = mapToPos(s.mx, s.mz);
      plantOnMesh(pos);
      s.mesh.position.copy(pos);
      upOf(pos, _up);
      _wish.copy(pawn.pos).sub(pos);
      wrapTangent(_wish, _up);
      const { east, north } = tangentBasis(_up);
      const face = Math.atan2(_wish.dot(east), _wish.dot(north));
      orientOnPlanet(s.mesh, _up, face);
      const lean = d < 14 ? (1 - d / 14) * 0.28 : 0;
      s.mesh.rotateX(-lean);
      s.mesh.scale.set(1 + s.hurt * 0.4, 1.15 + s.hurt * 0.35 + lean * 0.4, 1 + s.hurt * 0.4);
      if (d < 1.05 && s.hitCd <= 0) {
        s.hitCd = 0.9;
        onHitPlayer(1);
      }
    }
  }

  function nearest(mx, mz) {
    let best = 999;
    for (const s of shadows) {
      if (s.hp <= 0) continue;
      const d = Math.hypot(mx - s.mx, mz - s.mz);
      if (d < best) best = d;
    }
    return best;
  }

  return { fire, tick, shadows, nearest };
}
