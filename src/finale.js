import * as THREE from 'three';
import { POI } from './config.js';
import { mapToPos, orientOnPlanet, tangentBasis, upOf } from './planet.js';

export function createFinale(scene, mats) {
  const root = new THREE.Group();
  scene.add(root);

  const ring = new THREE.Mesh(
    new THREE.TorusGeometry(6.2, 0.06, 8, 48),
    new THREE.MeshBasicMaterial({
      color: 0xe8c86a,
      transparent: true,
      opacity: 0,
      depthWrite: false,
    })
  );
  const hex = new THREE.Mesh(
    new THREE.TorusGeometry(4.4, 0.045, 6, 6),
    new THREE.MeshBasicMaterial({
      color: 0x7ec8c0,
      transparent: true,
      opacity: 0,
      depthWrite: false,
    })
  );
  const column = new THREE.Mesh(
    new THREE.CylinderGeometry(0.35, 1.8, 42, 10, 1, true),
    new THREE.MeshBasicMaterial({
      color: 0xe8d6a0,
      transparent: true,
      opacity: 0,
      side: THREE.DoubleSide,
      depthWrite: false,
    })
  );
  const veil = new THREE.MeshBasicMaterial({
    color: 0xe8dcc4,
    transparent: true,
    opacity: 0.72,
    depthWrite: false,
  });
  const angel = new THREE.Group();
  const robe = new THREE.Mesh(new THREE.ConeGeometry(0.55, 3.4, 8), veil);
  robe.position.y = 1.7;
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.22, 8, 6), veil);
  head.position.y = 3.55;
  head.scale.set(0.75, 1.35, 0.8);
  const eyeL = new THREE.Mesh(new THREE.SphereGeometry(0.045, 6, 5), mats.glowGold);
  eyeL.position.set(-0.07, 3.6, 0.16);
  const eyeR = eyeL.clone();
  eyeR.position.x = 0.07;
  angel.add(robe, head, eyeL, eyeR);
  angel.visible = false;

  const plaza = mapToPos(POI.plaza.x, POI.plaza.z, 0.2);
  const up = upOf(plaza);
  orientOnPlanet(ring, up, 0);
  orientOnPlanet(hex, up, 0);
  orientOnPlanet(column, up, 0);
  ring.rotateX(Math.PI * 0.5);
  hex.rotateX(Math.PI * 0.5);
  ring.position.copy(plaza).addScaledVector(up, 0.18);
  hex.position.copy(plaza).addScaledVector(up, 0.22);
  column.position.copy(plaza).addScaledVector(up, 20);
  angel.position.copy(plaza).addScaledVector(up, 14);
  orientOnPlanet(angel, up, 0);
  root.add(ring, hex, column, angel);

  const { east, north } = tangentBasis(up);
  let readyTold = false;

  function tick(t, dt, placed, ritual, won, onReady) {
    const want = placed >= 7 ? 1 : 0;
    const k = dt * 0.55;
    ring.material.opacity += (want * 0.72 - ring.material.opacity) * k * 2;
    hex.material.opacity += (want * 0.55 - hex.material.opacity) * k * 2;
    column.material.opacity += ((want * 0.22 + ritual * 0.12) - column.material.opacity) * k * 2;
    ring.rotateZ(dt * 0.15);
    hex.rotateZ(-dt * 0.22);
    column.rotation.y += dt * 0.35;
    if (want) {
      angel.visible = true;
      const lift = 8 + Math.sin(t * 0.35) * 0.6 - ritual * 2.2;
      angel.position.copy(plaza).addScaledVector(up, lift);
      angel.position.addScaledVector(east, Math.sin(t * 0.2) * 0.25);
      angel.position.addScaledVector(north, Math.cos(t * 0.17) * 0.2);
      orientOnPlanet(angel, up, t * 0.15);
      if (!readyTold) {
        readyTold = true;
        onReady?.();
      }
    }
    if (won) {
      ring.material.opacity = Math.min(1, ring.material.opacity + dt * 0.4);
      hex.material.opacity = Math.min(1, hex.material.opacity + dt * 0.4);
      column.material.opacity = Math.min(0.55, column.material.opacity + dt * 0.3);
    }
  }

  return { tick, angel, ring };
}
