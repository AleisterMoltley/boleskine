import * as THREE from 'three';
import { POI } from './config.js';
import { hash2 } from './math.js';
import { heightAt, isWater } from './height.js';


export function createCombat(scene, mats) {
  const shadows = [];
  const bolts = [];
  const group = new THREE.Group();
  scene.add(group);

  function spawnShadow(x, z) {
    const g = new THREE.Group();
    const body = new THREE.Mesh(new THREE.CapsuleGeometry(0.16, 0.9, 3, 6), mats.shadow);
    body.position.y = 0.7;
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.18, 6, 5), mats.shadow);
    head.position.y = 1.35;
    head.scale.set(0.8, 1.35, 0.8);
    const eL = new THREE.Mesh(new THREE.SphereGeometry(0.035, 5, 4), mats.eyeWhite);
    eL.position.set(-0.06, 1.4, 0.12);
    const eR = eL.clone();
    eR.position.x = 0.06;
    g.add(body, head, eL, eR);
    const y = heightAt(x, z);
    g.position.set(x, y, z);
    group.add(g);
    shadows.push({
      mesh: g,
      x,
      z,
      y,
      hp: 2,
      hurt: 0,
      hitCd: 0,
    });
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
  for (const s of spots) spawnShadow(s.x, s.z);

  function fire(from, yaw) {
    const mesh = new THREE.Mesh(new THREE.OctahedronGeometry(0.11, 0), mats.glowGold);
    const dirx = -Math.sin(yaw);
    const dirz = -Math.cos(yaw);
    mesh.position.set(from.x + dirx * 0.8, from.y + 1.35, from.z + dirz * 0.8);
    group.add(mesh);
    bolts.push({ mesh, x: mesh.position.x, y: mesh.position.y, z: mesh.position.z, vx: dirx * 22, vz: dirz * 22, life: 1.15 });
  }

  function tick(dt, pawn, onHitPlayer) {
    for (let i = bolts.length - 1; i >= 0; i--) {
      const b = bolts[i];
      b.life -= dt;
      b.x += b.vx * dt;
      b.z += b.vz * dt;
      b.mesh.position.set(b.x, b.y, b.z);
      b.mesh.rotation.y += dt * 10;
      if (b.life <= 0) {
        group.remove(b.mesh);
        bolts.splice(i, 1);
        continue;
      }
      for (const s of shadows) {
        if (s.hp <= 0) continue;
        const d = Math.hypot(s.x - b.x, s.z - b.z);
        if (d < 1.05) {
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
          const a = Math.random() * Math.PI * 2;
          s.x = pawn.x + Math.cos(a) * 48;
          s.z = pawn.z + Math.sin(a) * 48;
          if (isWater(s.x, s.z)) {
            s.x = pawn.x + 40;
            s.z = pawn.z - 40;
          }
        }
        continue;
      }
      s.hurt = Math.max(0, s.hurt - dt);
      s.hitCd = Math.max(0, s.hitCd - dt);
      const dx = pawn.x - s.x;
      const dz = pawn.z - s.z;
      const d = Math.hypot(dx, dz);
      if (d < 42 && d > 0.2) {
        const sp = 2.35;
        s.x += (dx / d) * sp * dt;
        s.z += (dz / d) * sp * dt;
      }
      s.y = heightAt(s.x, s.z);
      s.mesh.position.set(s.x, s.y, s.z);
      s.mesh.lookAt(pawn.x, s.y, pawn.z);
      s.mesh.rotation.y += Math.PI;
      s.mesh.scale.setScalar(1 + s.hurt * 0.4);
      if (d < 1.05 && s.hitCd <= 0) {
        s.hitCd = 0.9;
        onHitPlayer(1);
      }
    }
  }

  return { fire, tick, shadows };
}
