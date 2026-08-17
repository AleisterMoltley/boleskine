import * as THREE from 'three';
import { orientOnPlanet, upOf } from './planet.js';

function bone(mat, r, len, seg = 6) {
  const m = new THREE.Mesh(new THREE.CapsuleGeometry(r, len, 3, seg), mat);
  m.castShadow = true;
  return m;
}

export function makeCrowley(mats) {
  const root = new THREE.Group();
  root.scale.setScalar(0.88);
  const tilt = new THREE.Group();
  root.add(tilt);

  const hips = new THREE.Group();
  hips.position.y = 0.62;
  tilt.add(hips);

  const robe = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.42, 1.12, 10), mats.robe);
  robe.position.y = 0.22;
  const robeFlare = new THREE.Mesh(new THREE.ConeGeometry(0.46, 0.28, 10, 1, true), mats.robeDeep);
  robeFlare.position.y = -0.28;
  robeFlare.rotation.x = Math.PI;
  const sash = new THREE.Mesh(new THREE.TorusGeometry(0.3, 0.034, 5, 12), mats.sash);
  sash.rotation.x = Math.PI * 0.5;
  sash.position.y = 0.42;
  sash.scale.set(1.05, 1, 0.72);
  const sashDrop = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.55, 0.02), mats.sash);
  sashDrop.position.set(0.18, 0.12, 0.22);
  hips.add(robe, robeFlare, sash, sashDrop);

  const chest = new THREE.Mesh(new THREE.CapsuleGeometry(0.2, 0.28, 4, 8), mats.robe);
  chest.position.y = 0.62;
  chest.scale.set(1.15, 1, 0.78);
  hips.add(chest);

  const head = new THREE.Group();
  head.position.set(0, 1.08, 0.04);
  const skull = new THREE.Mesh(new THREE.SphereGeometry(0.155, 10, 8), mats.skin);
  skull.scale.set(0.88, 1.28, 0.92);
  const chin = new THREE.Mesh(new THREE.SphereGeometry(0.07, 7, 6), mats.skin);
  chin.position.set(0, -0.14, 0.04);
  chin.scale.set(0.85, 1.15, 0.7);
  const nose = new THREE.Mesh(new THREE.ConeGeometry(0.028, 0.08, 5), mats.skinShadow);
  nose.position.set(0, 0.0, 0.14);
  nose.rotation.x = 1.15;
  const brow = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.03, 0.04), mats.skinShadow);
  brow.position.set(0, 0.06, 0.12);
  const eyeL = new THREE.Mesh(new THREE.SphereGeometry(0.032, 7, 6), mats.eyeHole);
  eyeL.position.set(-0.048, 0.02, 0.12);
  eyeL.scale.set(1, 1.2, 0.55);
  const eyeR = eyeL.clone();
  eyeR.position.x = 0.048;
  const pupL = new THREE.Mesh(new THREE.SphereGeometry(0.011, 6, 5), mats.eyeWhite);
  pupL.position.set(-0.048, 0.02, 0.148);
  const pupR = pupL.clone();
  pupR.position.x = 0.048;
  const mouth = new THREE.Mesh(new THREE.BoxGeometry(0.055, 0.012, 0.012), mats.robeDeep);
  mouth.position.set(0, -0.1, 0.12);
  const goatee = new THREE.Mesh(new THREE.ConeGeometry(0.03, 0.08, 5), mats.nemesStripe);
  goatee.position.set(0, -0.2, 0.08);
  goatee.rotation.x = 0.35;
  head.add(skull, chin, nose, brow, eyeL, eyeR, pupL, pupR, mouth, goatee);
  hips.add(head);

  const nemes = new THREE.Group();
  const hood = new THREE.Mesh(new THREE.SphereGeometry(0.18, 10, 8, 0, Math.PI * 2, 0, Math.PI * 0.62), mats.nemesGold);
  hood.position.y = 0.04;
  hood.scale.set(1.05, 0.95, 1.15);
  const lappetL = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.42, 0.06), mats.nemesGold);
  lappetL.position.set(-0.16, -0.12, -0.02);
  lappetL.rotation.z = 0.18;
  const lappetR = lappetL.clone();
  lappetR.position.x = 0.16;
  lappetR.rotation.z = -0.18;
  const stripeA = new THREE.Mesh(new THREE.BoxGeometry(0.035, 0.2, 0.19), mats.nemesStripe);
  stripeA.position.set(-0.07, 0.08, 0.02);
  const stripeB = stripeA.clone();
  stripeB.position.x = 0.07;
  const uraeus = new THREE.Mesh(new THREE.SphereGeometry(0.035, 6, 5), mats.gold);
  uraeus.position.set(0, 0.16, 0.16);
  nemes.add(hood, lappetL, lappetR, stripeA, stripeB, uraeus);
  nemes.position.set(0, 1.18, -0.02);
  hips.add(nemes);

  const pelt = new THREE.Group();
  const peltBody = new THREE.Mesh(new THREE.CapsuleGeometry(0.12, 0.7, 4, 6), mats.leopard);
  peltBody.rotation.z = 0.7;
  peltBody.rotation.x = 0.25;
  peltBody.position.set(0.16, 0.35, -0.08);
  pelt.add(peltBody);
  for (let i = 0; i < 10; i++) {
    const spot = new THREE.Mesh(new THREE.SphereGeometry(0.028, 5, 4), mats.leopardSpot);
    spot.position.set(0.08 + (i % 3) * 0.06, 0.1 + i * 0.07, -0.16 - (i % 2) * 0.04);
    pelt.add(spot);
  }
  hips.add(pelt);

  const pent = new THREE.Mesh(new THREE.TorusGeometry(0.055, 0.01, 5, 5), mats.gold);
  pent.position.set(0, 0.72, 0.2);
  hips.add(pent);

  const armL = new THREE.Group();
  armL.position.set(-0.28, 0.78, 0);
  const armLMesh = bone(mats.robe, 0.045, 0.42);
  armLMesh.position.y = -0.24;
  const handL = new THREE.Mesh(new THREE.SphereGeometry(0.042, 6, 5), mats.skin);
  handL.position.y = -0.5;
  armL.add(armLMesh, handL);

  const armR = new THREE.Group();
  armR.position.set(0.28, 0.78, 0);
  const armRMesh = bone(mats.robe, 0.045, 0.42);
  armRMesh.position.y = -0.24;
  const handR = handL.clone();
  const staff = new THREE.Group();
  const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.022, 1.55, 6), mats.wood);
  const disk = new THREE.Mesh(new THREE.TorusGeometry(0.09, 0.016, 6, 12), mats.gold);
  disk.position.y = 0.78;
  const moon = new THREE.Mesh(new THREE.SphereGeometry(0.045, 8, 6), mats.glowGold);
  moon.position.y = 0.78;
  staff.add(shaft, disk, moon);
  staff.position.set(0.02, -0.42, 0.04);
  staff.rotation.z = 0.08;
  armR.add(armRMesh, handR, staff);

  const legL = new THREE.Group();
  legL.position.set(-0.12, 0.02, 0);
  const thighL = bone(mats.robeDeep, 0.055, 0.28);
  thighL.position.y = -0.16;
  const shinL = bone(mats.robeDeep, 0.042, 0.28);
  shinL.position.y = -0.48;
  const footL = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.05, 0.2), mats.skin);
  footL.position.set(0, -0.68, 0.04);
  legL.add(thighL, shinL, footL);

  const legR = new THREE.Group();
  legR.position.set(0.12, 0.02, 0);
  const thighR = thighL.clone();
  const shinR = shinL.clone();
  const footR = footL.clone();
  legR.add(thighR, shinR, footR);

  hips.add(armL, armR, legL, legR);

  root.traverse((o) => {
    if (o.isMesh) {
      o.castShadow = true;
      o.receiveShadow = true;
    }
  });
  moon.castShadow = false;

  const pose = { walk: 0, bob: 0, cast: 0 };

  function tick(dt, pawn, casting) {
    pose.walk += pawn.speed * 1.85 * dt;
    pose.bob += dt;
    if (casting) pose.cast = Math.min(1, pose.cast + dt * 8);
    else pose.cast = Math.max(0, pose.cast - dt * 6);

    const w = pawn.moving && pawn.grounded ? 1 : 0;
    const swing = Math.sin(pose.walk) * 0.55 * w;
    legL.rotation.x = swing;
    legR.rotation.x = -swing;
    armL.rotation.x = -swing * 0.7;
    armR.rotation.x = swing * 0.35 - pose.cast * 1.15;
    armR.rotation.z = 0.08 - pose.cast * 0.4;
    hips.position.y = 0.62 + Math.abs(Math.sin(pose.walk)) * 0.045 * w;
    tilt.rotation.x = pawn.sprinting ? 0.1 : pawn.swimming ? 0.22 : 0.02;
    tilt.rotation.z = Math.sin(pose.walk) * 0.04 * w;
    head.rotation.x = Math.sin(pose.bob * 1.3) * 0.03;
    staff.rotation.z = 0.08 + pose.cast * 0.5;
    if (pawn.swimming) {
      legL.rotation.x = Math.sin(pose.bob * 4) * 0.4;
      legR.rotation.x = Math.cos(pose.bob * 4) * 0.4;
    }
    root.position.copy(pawn.pos);
    orientOnPlanet(root, upOf(pawn.pos), pawn.yaw);
  }

  return { root, tick, staff, head };
}
