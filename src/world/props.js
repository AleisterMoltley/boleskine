import * as THREE from 'three';
import { PLANET_COLS, POI, WORLD } from '../config.js';
import { hash2 } from '../math.js';
import { heightAt, isWater, pathWidth, scatter } from '../height.js';
import { mapToPos, orientOnPlanet, MAP_SCALE, tangentBasis, upOf } from '../planet.js';
import {
  ankh,
  ashlars,
  cairn,
  candle,
  chessTable,
  compassSquare,
  eyeOfHorus,
  hastingsChair,
  hoodedAdept,
  jachinBoaz,
  lamHead,
  lectern,
  mosaicPavement,
  orreryRings,
  pentagonPavement,
  press,
  roseWindow,
  spareMarks,
  threeHours,
  tracingBoard,
  treeOfLifeGap,
  unicursal,
  vaultHeptagon,
  veiledFigure,
  vesica,
} from './symbols.js';
import { dressWorld } from './dress.js';

function shadowize(root) {
  root.traverse((o) => {
    if (o.isMesh) {
      o.castShadow = true;
      o.receiveShadow = true;
    }
  });
  return root;
}

export function twistedTree(mats, rng) {
  const g = new THREE.Group();
  const h = 5.5 + rng * 5.5;
  const lean = (rng - 0.5) * 0.55;
  let y = 0;
  let x = 0;
  const segs = 5;
  for (let i = 0; i < segs; i++) {
    const t = i / segs;
    const len = h / segs;
    const r0 = 0.28 * (1 - t * 0.7);
    const r1 = 0.22 * (1 - (t + 0.2) * 0.7);
    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(r1, r0, len, 6), mats.woodDeep);
    x += Math.sin(lean + i * 0.7) * 0.28;
    y += len * 0.92;
    trunk.position.set(x, y - len * 0.4, Math.cos(i * 1.3) * 0.12);
    trunk.rotation.z = lean + Math.sin(i * 1.7) * 0.25;
    trunk.rotation.x = Math.sin(i * 2.1) * 0.12;
    g.add(trunk);
    if (i > 1) {
      for (let b = 0; b < 2; b++) {
        const br = new THREE.Mesh(
          new THREE.CylinderGeometry(0.03, 0.07, 1.4 + rng, 4),
          mats.wood
        );
        br.position.set(x + (b ? 0.3 : -0.3), y, 0);
        br.rotation.z = (b ? -0.9 : 0.9) + lean;
        br.rotation.y = b + rng;
        g.add(br);
      }
    }
  }
  const crown = new THREE.Mesh(new THREE.SphereGeometry(0.45 + rng * 0.28, 6, 5), mats.leaf);
  crown.position.set(x, y + 0.35, 0);
  crown.scale.set(1.6, 0.35, 1.2);
  g.add(crown);
  return shadowize(g);
}

export function pumpkin(mats, scale = 1) {
  const g = new THREE.Group();
  const body = new THREE.Mesh(new THREE.SphereGeometry(0.28, 8, 6), mats.pumpkin);
  body.scale.set(1.15, 0.9, 1);
  const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.045, 0.16, 5), mats.wood);
  stem.position.y = 0.26;
  stem.rotation.z = 0.3;
  const face = new THREE.Mesh(new THREE.CircleGeometry(0.12, 5), mats.ember);
  face.position.set(0, 0.04, 0.26);
  g.add(body, stem, face);
  g.scale.setScalar(scale);
  return shadowize(g);
}

export function lantern(mats, lit = false) {
  const g = new THREE.Group();
  const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.05, 2.4, 5), mats.iron);
  pole.position.y = 1.2;
  const arm = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.05, 0.05), mats.iron);
  arm.position.set(0.2, 2.25, 0);
  const lamp = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.28, 0.22), mats.ember);
  lamp.position.set(0.42, 2.05, 0);
  g.add(pole, arm, lamp);
  if (lit) {
    const light = new THREE.PointLight(0xff8a40, 1.45, 11, 2);
    light.position.copy(lamp.position);
    g.add(light);
  }
  return shadowize(g);
}

export function grave(mats, rng) {
  const g = new THREE.Group();
  const stone = new THREE.Mesh(
    new THREE.BoxGeometry(0.42 + rng * 0.1, 0.7 + rng * 0.25, 0.12),
    mats.stone
  );
  stone.position.y = 0.38;
  stone.rotation.z = (rng - 0.5) * 0.25;
  stone.rotation.y = (rng - 0.5) * 0.2;
  g.add(stone);
  if (rng > 0.72) {
    const mark = new THREE.Mesh(new THREE.TorusGeometry(0.08, 0.012, 5, 10), mats.stoneLite);
    mark.position.set(0, 0.5, 0.07);
    g.add(mark);
  }
  return shadowize(g);
}

export function fencePost(mats) {
  return new THREE.Mesh(new THREE.BoxGeometry(0.08, 1.15, 0.08), mats.iron);
}

export function barrel(mats) {
  const g = new THREE.Group();
  const body = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.3, 0.52, 8), mats.wood);
  body.position.y = 0.26;
  const hoop = new THREE.Mesh(new THREE.TorusGeometry(0.29, 0.02, 4, 10), mats.iron);
  hoop.rotation.x = Math.PI / 2;
  hoop.position.y = 0.38;
  g.add(body, hoop);
  return shadowize(g);
}

export function crate(mats, rng = 0.4) {
  const g = new THREE.Group();
  const box = new THREE.Mesh(new THREE.BoxGeometry(0.48 + rng * 0.12, 0.38, 0.44), mats.woodDeep);
  box.position.y = 0.2;
  box.rotation.y = rng;
  g.add(box);
  return shadowize(g);
}

export function pot(mats) {
  const g = new THREE.Group();
  const jar = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.16, 0.28, 7), mats.sand);
  jar.position.y = 0.14;
  g.add(jar);
  return shadowize(g);
}

export function bench(mats) {
  const g = new THREE.Group();
  const seat = new THREE.Mesh(new THREE.BoxGeometry(1.15, 0.07, 0.34), mats.wood);
  seat.position.y = 0.42;
  const back = new THREE.Mesh(new THREE.BoxGeometry(1.15, 0.38, 0.06), mats.woodDeep);
  back.position.set(0, 0.64, -0.14);
  g.add(seat, back);
  for (const x of [-0.46, 0.46]) {
    const leg = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.4, 0.07), mats.wood);
    leg.position.set(x, 0.2, 0.08);
    g.add(leg);
  }
  return shadowize(g);
}

export function cart(mats) {
  const g = new THREE.Group();
  const bed = new THREE.Mesh(new THREE.BoxGeometry(1.35, 0.14, 0.72), mats.wood);
  bed.position.y = 0.48;
  const pole = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.08, 1.1), mats.woodDeep);
  pole.position.set(0, 0.48, 0.85);
  g.add(bed, pole);
  for (const z of [-0.28, 0.28]) {
    const wheel = new THREE.Mesh(new THREE.TorusGeometry(0.28, 0.05, 5, 10), mats.iron);
    wheel.position.set(0.55, 0.28, z);
    g.add(wheel);
  }
  return shadowize(g);
}

export function deadBush(mats, rng = 0.5) {
  const g = new THREE.Group();
  for (let i = 0; i < 5; i++) {
    const twig = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.04, 0.7 + rng * 0.4, 4), mats.woodDeep);
    twig.position.set((i - 2) * 0.08, 0.35, (i % 2) * 0.06);
    twig.rotation.z = (i - 2) * 0.28;
    twig.rotation.x = Math.sin(i) * 0.2;
    g.add(twig);
  }
  return shadowize(g);
}

export function rustWreck(mats, rng = 0.5) {
  const g = new THREE.Group();
  const hull = new THREE.Mesh(new THREE.BoxGeometry(1.6 + rng, 0.35, 0.7), mats.iron);
  hull.position.y = 0.18;
  hull.rotation.z = 0.18;
  hull.rotation.y = rng;
  const rib = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.7, 0.5), mats.stoneDark);
  rib.position.set(0.3, 0.4, 0);
  rib.rotation.z = -0.3;
  g.add(hull, rib);
  return shadowize(g);
}

export function scarecrow(mats) {
  const g = new THREE.Group();
  const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.05, 1.8, 5), mats.wood);
  pole.position.y = 0.9;
  const arm = new THREE.Mesh(new THREE.BoxGeometry(1.15, 0.08, 0.08), mats.woodDeep);
  arm.position.y = 1.35;
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.18, 6, 5), mats.pumpkin);
  head.position.y = 1.85;
  const face = new THREE.Mesh(new THREE.CircleGeometry(0.08, 5), mats.ember);
  face.position.set(0, 1.85, 0.16);
  g.add(pole, arm, head, face);
  return shadowize(g);
}

export function bookStack(mats) {
  const g = new THREE.Group();
  const cols = [mats.sash, mats.woodDeep, mats.goldDeep, mats.sand];
  for (let i = 0; i < 4; i++) {
    const b = new THREE.Mesh(new THREE.BoxGeometry(0.28 - i * 0.02, 0.06, 0.36), cols[i]);
    b.position.y = 0.04 + i * 0.065;
    b.rotation.y = i * 0.18;
    g.add(b);
  }
  return shadowize(g);
}

export function banner(mats) {
  const g = new THREE.Group();
  const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.04, 2.6, 5), mats.iron);
  pole.position.y = 1.3;
  const cloth = new THREE.Mesh(new THREE.PlaneGeometry(0.7, 0.95), mats.sash);
  cloth.position.set(0.38, 1.85, 0);
  cloth.rotation.y = 0.08;
  g.add(pole, cloth);
  g.userData.flap = cloth;
  return shadowize(g);
}

export function hangingCrow(mats) {
  const g = new THREE.Group();
  const body = new THREE.Mesh(new THREE.SphereGeometry(0.11, 6, 5), mats.robeDeep);
  body.scale.set(1, 0.7, 1.5);
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.06, 5, 4), mats.robeDeep);
  head.position.set(0, 0.04, 0.14);
  const wing = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.03, 0.16), mats.iron);
  wing.position.y = 0.02;
  g.add(body, head, wing);
  return g;
}

export function blackCat(mats) {
  const g = new THREE.Group();
  const body = new THREE.Mesh(new THREE.CapsuleGeometry(0.09, 0.28, 3, 6), mats.robeDeep);
  body.rotation.z = 1.2;
  body.position.set(0, 0.16, 0);
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.09, 6, 5), mats.robeDeep);
  head.position.set(0.18, 0.22, 0);
  const tail = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.03, 0.32, 4), mats.robeDeep);
  tail.position.set(-0.18, 0.28, 0);
  tail.rotation.z = 0.7;
  g.add(body, head, tail);
  return shadowize(g);
}

export function candles(mats, n = 3) {
  if (!Number.isInteger(n) || n < 1 || n > 8) n = 3;
  const g = new THREE.Group();
  for (let i = 0; i < n; i++) {
    const c = candle(mats, 0.28 + (i % 3) * 0.08);
    c.position.set((i - (n - 1) * 0.5) * 0.16, 0, (i % 2) * 0.08);
    g.add(c);
  }
  return shadowize(g);
}

export function crookedHouse(mats, w, d, h, lean = 0.08) {
  const g = new THREE.Group();
  const body = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mats.wood);
  body.position.y = h * 0.5;
  body.rotation.z = lean;
  const roof = new THREE.Mesh(new THREE.ConeGeometry(Math.max(w, d) * 0.78, h * 0.55, 4), mats.woodDeep);
  roof.position.y = h + h * 0.18;
  roof.rotation.y = Math.PI * 0.25;
  roof.rotation.z = lean * 0.6;
  const door = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.85, 0.06), mats.iron);
  door.position.set(0, 0.42, d * 0.5 + 0.02);
  const winL = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.34, 0.05), mats.ember);
  winL.position.set(-w * 0.22, h * 0.55, d * 0.5 + 0.02);
  const winR = winL.clone();
  winR.position.x = w * 0.22;
  const chim = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.7, 0.28), mats.stoneDark);
  chim.position.set(w * 0.28, h + 0.5, -d * 0.15);
  chim.rotation.z = -0.15;
  g.add(body, roof, door, winL, winR, chim);
  return shadowize(g);
}

export function manor(mats) {
  const g = new THREE.Group();
  const main = new THREE.Mesh(new THREE.BoxGeometry(16, 7.2, 10), mats.stone);
  main.position.y = 3.6;
  const wing = new THREE.Mesh(new THREE.BoxGeometry(7, 5.2, 8), mats.stoneDark);
  wing.position.set(-9.5, 2.6, 1);
  wing.rotation.z = 0.04;
  const wingR = new THREE.Mesh(new THREE.BoxGeometry(6.2, 5.6, 7.2), mats.stoneDark);
  wingR.position.set(9.2, 2.8, -0.8);
  wingR.rotation.z = -0.05;
  const roof = new THREE.Mesh(new THREE.BoxGeometry(17.2, 0.5, 11.2), mats.woodDeep);
  roof.position.y = 7.35;
  roof.rotation.z = 0.03;
  const gable = new THREE.Mesh(new THREE.ConeGeometry(6.4, 3.4, 4), mats.woodDeep);
  gable.position.set(0, 9.1, 0);
  gable.rotation.y = Math.PI * 0.25;
  const tower = new THREE.Mesh(new THREE.CylinderGeometry(1.4, 1.6, 11, 8), mats.stoneDark);
  tower.position.set(7.4, 5.5, 4.6);
  const cap = new THREE.Mesh(new THREE.ConeGeometry(1.9, 2.6, 8), mats.iron);
  cap.position.set(7.4, 12.2, 4.6);
  const door = new THREE.Mesh(new THREE.BoxGeometry(1.6, 2.6, 0.2), mats.woodDeep);
  door.position.set(0, 1.3, 5.12);
  const arch = new THREE.Mesh(new THREE.TorusGeometry(0.95, 0.12, 6, 10, Math.PI), mats.stoneLite);
  arch.position.set(0, 2.55, 5.12);
  const tool = compassSquare(mats, 0.85);
  tool.position.set(0, 3.42, 5.22);
  g.add(main, wing, wingR, roof, gable, tower, cap, door, arch, tool);
  for (let i = -2; i <= 2; i++) {
    if (i === 0) continue;
    const win = new THREE.Mesh(new THREE.BoxGeometry(0.7, 1.1, 0.08), mats.ember);
    win.position.set(i * 2.4, 4.2, 5.06);
    g.add(win);
    const win2 = win.clone();
    win2.position.y = 6.0;
    g.add(win2);
  }
  const light = new THREE.PointLight(0xff9a50, 2.2, 22, 2);
  light.position.set(0, 3.4, 6);
  g.add(light);
  return shadowize(g);
}

export function kirk(mats) {
  const g = new THREE.Group();
  const nave = new THREE.Mesh(new THREE.BoxGeometry(7, 5.4, 11), mats.stoneDark);
  nave.position.y = 2.7;
  nave.rotation.z = 0.05;
  const roof = new THREE.Mesh(new THREE.ConeGeometry(5.6, 3.2, 4), mats.woodDeep);
  roof.position.y = 6.6;
  roof.rotation.y = Math.PI * 0.25;
  const spire = new THREE.Mesh(new THREE.CylinderGeometry(0.7, 1.1, 6.5, 6), mats.stone);
  spire.position.set(-2.2, 6.4, -3.4);
  spire.rotation.z = -0.12;
  const needle = new THREE.Mesh(new THREE.ConeGeometry(0.9, 3.4, 6), mats.iron);
  needle.position.set(-2.4, 11.2, -3.4);
  const door = new THREE.Mesh(new THREE.BoxGeometry(1.3, 2.2, 0.15), mats.iron);
  door.position.set(0, 1.1, 5.55);
  const roseWin = roseWindow(mats);
  roseWin.position.set(0, 3.65, 5.58);
  const altar = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.7, 0.7), mats.stone);
  altar.position.set(0, 0.35, -3.4);
  const glow = new THREE.PointLight(0x80c8c0, 1.1, 12, 2);
  glow.position.set(0, 2.5, 2);
  g.add(nave, roof, spire, needle, door, roseWin, altar, glow);
  return shadowize(g);
}

export function abbey(mats) {
  const g = new THREE.Group();
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    const col = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.48, 4.6 + (i % 3) * 0.6, 6), mats.stone);
    col.position.set(Math.cos(a) * 7.2, 2.4, Math.sin(a) * 7.2);
    col.rotation.z = Math.sin(i * 1.7) * 0.12;
    g.add(col);
    if (i % 2 === 0) {
      const broken = new THREE.Mesh(new THREE.BoxGeometry(0.5, 1.2, 0.5), mats.stoneDark);
      broken.position.set(Math.cos(a) * 7.2, 5.2, Math.sin(a) * 7.2);
      broken.rotation.set(0.4, a, 0.2);
      g.add(broken);
    }
  }
  const floor = mosaicPavement(11, 8, mats);
  floor.position.y = 0.02;
  const board = tracingBoard(mats, 1.05);
  board.position.y = 0.06;
  const pillars = jachinBoaz(mats);
  pillars.position.set(0, 0, 8.4);
  const pair = ashlars(mats);
  pair.position.set(-4.2, 0, 3.4);
  const slab = new THREE.Mesh(new THREE.BoxGeometry(1.2, 1.8, 0.16), mats.sand);
  slab.position.set(0, 0.9, 3.0);
  const sun = new THREE.Mesh(new THREE.SphereGeometry(0.1, 8, 6), mats.goldDeep);
  sun.position.set(0, 1.55, 3.1);
  g.add(floor, board, pillars, pair, slab, sun);
  return shadowize(g);
}

export function plaza(mats) {
  const g = new THREE.Group();
  const dais = new THREE.Mesh(new THREE.CylinderGeometry(8.8, 9.4, 0.22, 12), mats.stone);
  dais.position.y = 0.08;
  const mosaic = mosaicPavement(12.6, 10, mats);
  mosaic.position.y = 0.12;
  const board = tracingBoard(mats, 1.15);
  board.position.y = 0.16;
  const pillars = jachinBoaz(mats);
  pillars.scale.setScalar(0.85);
  pillars.position.set(0, 0, 7.6);
  g.add(dais, mosaic, board, pillars);
  for (let i = 0; i < 7; i++) {
    const a = (i / 7) * Math.PI * 2 - Math.PI / 2;
    const ped = new THREE.Mesh(
      new THREE.CylinderGeometry(0.34, 0.42, 0.55, 6),
      mats.toon(PLANET_COLS[i])
    );
    ped.position.set(Math.cos(a) * 5.6, 0.4, Math.sin(a) * 5.6);
    g.add(ped);
  }
  const light = new THREE.PointLight(0xc4b48a, 1.15, 16, 2);
  light.position.set(0, 2.6, 0);
  g.add(light);
  return shadowize(g);
}

export function well(mats) {
  const g = new THREE.Group();
  const rim = new THREE.Mesh(new THREE.CylinderGeometry(1.1, 1.25, 0.9, 10), mats.stone);
  rim.position.y = 0.45;
  const roof = new THREE.Mesh(new THREE.ConeGeometry(1.5, 1.1, 6), mats.woodDeep);
  roof.position.y = 2.4;
  const postL = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 1.6, 5), mats.wood);
  postL.position.set(-0.9, 1.4, 0);
  const postR = postL.clone();
  postR.position.x = 0.9;
  g.add(rim, roof, postL, postR);
  return shadowize(g);
}

export function relicMesh(mats, id) {
  const g = new THREE.Group();
  if (id === 'liber') {
    const book = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.1, 0.5), mats.sash);
    const page = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.08, 0.46), mats.bone);
    page.position.y = 0.02;
    g.add(book, page);
  } else if (id === 'athame') {
    const hilt = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.16, 6), mats.wood);
    const blade = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.42, 0.01), mats.stoneLite);
    blade.position.y = 0.26;
    g.add(hilt, blade);
  } else if (id === 'chalice') {
    const cup = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.08, 0.2, 8), mats.gold);
    const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.05, 0.18, 6), mats.goldDeep);
    stem.position.y = -0.16;
    g.add(cup, stem);
  } else if (id === 'wand') {
    g.add(new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.035, 0.7, 6), mats.wood));
  } else if (id === 'pantacle') {
    const disk = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.035, 12), mats.goldDeep);
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.12, 0.012, 5, 12), mats.stoneLite);
    ring.rotation.x = Math.PI / 2;
    ring.position.y = 0.025;
    g.add(disk, ring);
  } else if (id === 'stele') {
    const slab = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.46, 0.07), mats.sand);
    g.add(slab);
  } else {
    const vial = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.065, 0.2, 8), mats.goldDeep);
    g.add(vial);
  }
  return shadowize(g);
}

export function willow(mats) {
  const g = new THREE.Group();
  const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.42, 4.2, 7), mats.woodDeep);
  trunk.position.y = 2.1;
  trunk.rotation.z = 0.18;
  g.add(trunk);
  for (let i = 0; i < 16; i++) {
    const a = (i / 16) * Math.PI * 2;
    const vine = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.05, 3.4, 4), mats.leaf);
    vine.position.set(Math.cos(a) * 1.3, 2.4, Math.sin(a) * 1.3);
    vine.rotation.z = Math.cos(a) * 0.35;
    vine.rotation.x = Math.sin(a) * 0.35;
    g.add(vine);
  }
  const crown = new THREE.Mesh(new THREE.SphereGeometry(1.8, 7, 5), mats.leaf);
  crown.position.set(0.3, 4.4, 0);
  crown.scale.set(1.2, 0.55, 1.2);
  g.add(crown);
  return shadowize(g);
}

export function ironCircle(mats) {
  const g = new THREE.Group();
  const disk = new THREE.Mesh(new THREE.CylinderGeometry(6.4, 6.8, 0.16, 5), mats.iron);
  disk.position.y = 0.06;
  g.add(disk);
  g.add(pentagonPavement(5.2, mats));
  for (let i = 0; i < 5; i++) {
    const a = -Math.PI / 2 + (i / 5) * Math.PI * 2;
    const h = 3.6 + (i % 2) * 0.7;
    const menhir = new THREE.Mesh(new THREE.BoxGeometry(0.55, h, 0.22), i % 2 ? mats.iron : mats.stoneDark);
    menhir.position.set(Math.cos(a) * 5.4, h * 0.5, Math.sin(a) * 5.4);
    menhir.rotation.y = a + 0.2;
    menhir.rotation.z = Math.sin(i) * 0.08;
    g.add(menhir);
  }
  const lamp = new THREE.PointLight(0xff6a40, 1.05, 14, 2);
  lamp.position.set(0, 2.2, 0);
  g.add(lamp);
  return shadowize(g);
}

export function craterTemple(mats) {
  const g = new THREE.Group();
  for (let i = 0; i < 9; i++) {
    const a = (i / 9) * Math.PI * 2;
    const col = new THREE.Mesh(
      new THREE.CylinderGeometry(0.22, 0.32, 2.4 + (i % 3) * 0.8, 6),
      mats.stoneDark
    );
    col.position.set(Math.cos(a) * 7.4, 1.2, Math.sin(a) * 7.4);
    col.rotation.z = Math.sin(i * 1.4) * 0.18;
    g.add(col);
  }
  const mark = unicursal(1.6, mats.iron, 0.06);
  mark.rotation.x = -Math.PI / 2;
  mark.position.y = 0.08;
  const eye = eyeOfHorus(mats, 1.15);
  eye.position.set(0, 1.15, 0);
  const glow = new THREE.PointLight(0xc9a24a, 0.9, 12, 2);
  glow.position.set(0, 2.1, 0);
  g.add(mark, eye, glow);
  return shadowize(g);
}

export function cydonia(mats) {
  const g = new THREE.Group();
  const sizes = [
    [0, 2.2, 8.4],
    [-9.4, 7.2, 5.6],
    [8.6, 7.8, 4.4],
  ];
  for (const [x, z, h] of sizes) {
    const pyr = new THREE.Mesh(new THREE.ConeGeometry(h * 0.88, h, 4), mats.sand);
    pyr.position.set(x, h * 0.5, z);
    pyr.rotation.y = Math.PI * 0.25;
    g.add(pyr);
  }
  const brow = new THREE.Mesh(new THREE.BoxGeometry(8.4, 1.1, 2.2), mats.stone);
  brow.position.set(1.2, 2.2, -7.2);
  const ridge = new THREE.Mesh(new THREE.BoxGeometry(10.4, 2.0, 3.2), mats.stoneDark);
  ridge.position.set(0.4, 1.0, -9.4);
  ridge.rotation.y = 0.12;
  const socketL = new THREE.Mesh(new THREE.SphereGeometry(0.7, 6, 5), mats.iron);
  socketL.position.set(-1.8, 2.4, -6.2);
  const socketR = socketL.clone();
  socketR.position.x = 2.8;
  const chin = new THREE.Mesh(new THREE.BoxGeometry(4.6, 0.8, 1.6), mats.sand);
  chin.position.set(0.6, 0.5, -11.2);
  g.add(brow, ridge, socketL, socketR, chin);
  return shadowize(g);
}

export function polarShrine(mats) {
  const g = new THREE.Group();
  const dais = new THREE.Mesh(new THREE.CylinderGeometry(4.2, 4.6, 0.2, 10), mats.bone);
  dais.position.y = 0.08;
  g.add(dais);
  const mark = ankh(mats, 1.35);
  mark.position.y = 0.2;
  g.add(mark);
  for (let i = 0; i < 7; i++) {
    const a = (i / 7) * Math.PI * 2 - Math.PI / 2;
    const post = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.1, 1.4, 6), mats.bone);
    post.position.set(Math.cos(a) * 3.2, 0.7, Math.sin(a) * 3.2);
    const flame = new THREE.Mesh(new THREE.SphereGeometry(0.08, 6, 5), mats.glowGold);
    flame.position.set(Math.cos(a) * 3.2, 1.5, Math.sin(a) * 3.2);
    g.add(post, flame);
  }
  const light = new THREE.PointLight(0xe8d6a0, 1.1, 14, 2);
  light.position.set(0, 2.4, 0);
  g.add(light);
  return shadowize(g);
}

export function canalOrrery(mats) {
  const g = new THREE.Group();
  const dais = new THREE.Mesh(new THREE.CylinderGeometry(3.4, 3.8, 0.18, 10), mats.stone);
  dais.position.y = 0.08;
  g.add(dais, orreryRings(mats));
  return shadowize(g);
}

export function redSeal(mats) {
  const g = new THREE.Group();
  g.add(pentagonPavement(6.4, mats));
  const lamp = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.16, 1.6, 6), mats.iron);
  lamp.position.y = 0.8;
  const ember = new THREE.Mesh(new THREE.SphereGeometry(0.12, 6, 5), mats.ember);
  ember.position.y = 1.7;
  const light = new THREE.PointLight(0xff6a30, 0.95, 11, 2);
  light.position.set(0, 1.8, 0);
  g.add(lamp, ember, light);
  return shadowize(g);
}

export function fullnessChapel(mats) {
  const g = new THREE.Group();
  const dais = new THREE.Mesh(new THREE.CylinderGeometry(3.8, 4.1, 0.16, 12), mats.stone);
  dais.position.y = 0.07;
  const hoopL = new THREE.Mesh(new THREE.TorusGeometry(1.55, 0.07, 8, 28), mats.bone);
  hoopL.position.set(-0.7, 1.55, 0);
  const hoopR = hoopL.clone();
  hoopR.position.x = 0.7;
  g.add(dais, hoopL, hoopR);
  for (let i = 0; i < 7; i++) {
    const a = (i / 7) * Math.PI * 2 - Math.PI / 2;
    const post = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.07, 1.35, 6), mats.bone);
    post.position.set(Math.cos(a) * 2.4, 0.75, Math.sin(a) * 2.4);
    const flame = new THREE.Mesh(new THREE.SphereGeometry(0.07, 6, 5), mats.glowGold);
    flame.position.set(Math.cos(a) * 2.4, 1.5, Math.sin(a) * 2.4);
    g.add(post, flame);
  }
  const light = new THREE.PointLight(0xe8d6a0, 0.85, 11, 2);
  light.position.set(0, 1.6, 0);
  g.add(light);
  return shadowize(g);
}

export function daathTree(mats) {
  const g = new THREE.Group();
  const nodes = [
    [0, 3.15, true],
    [1.15, 2.35, true],
    [-1.15, 2.35, true],
    [0, 1.65, false],
    [1.15, 1.05, true],
    [-1.15, 1.05, true],
    [0, 0.35, true],
    [1.15, -0.4, true],
    [-1.15, -0.4, true],
    [0, -1.15, true],
    [0, -2.05, true],
  ];
  const paths = [
    [0, 1],
    [0, 2],
    [1, 2],
    [1, 4],
    [2, 5],
    [1, 6],
    [2, 6],
    [4, 6],
    [5, 6],
    [4, 7],
    [5, 8],
    [6, 7],
    [6, 8],
    [6, 9],
    [7, 9],
    [8, 9],
    [9, 10],
  ];
  const slab = new THREE.Mesh(new THREE.BoxGeometry(4.6, 0.08, 6.8), mats.woodDeep);
  slab.position.y = 0.03;
  g.add(slab);
  for (const [a, b] of paths) {
    const p0 = nodes[a];
    const p1 = nodes[b];
    const dx = p1[0] - p0[0];
    const dz = p1[1] - p0[1];
    const len = Math.hypot(dx, dz);
    const bar = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.04, len), mats.iron);
    bar.position.set((p0[0] + p1[0]) * 0.5, 0.08, (p0[1] + p1[1]) * 0.5);
    bar.rotation.y = Math.atan2(dx, dz);
    g.add(bar);
  }
  for (const [x, z, filled] of nodes) {
    if (filled) {
      const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.05, 0.55, 6), mats.iron);
      stem.position.set(x, 0.32, z);
      const orb = new THREE.Mesh(new THREE.SphereGeometry(0.18, 8, 6), mats.goldDeep);
      orb.position.set(x, 0.68, z);
      g.add(stem, orb);
    } else {
      const ring = new THREE.Mesh(new THREE.TorusGeometry(0.22, 0.035, 6, 14), mats.mauve);
      ring.position.set(x, 0.72, z);
      g.add(ring);
    }
  }
  return shadowize(g);
}

export function lamNiche(mats) {
  const g = new THREE.Group();
  g.add(lamHead(mats));
  const light = new THREE.PointLight(0xc4b8a0, 0.55, 6, 2);
  light.position.set(0, 1.2, 0.4);
  g.add(light);
  return shadowize(g);
}

export function mauveThreshold(mats) {
  const g = new THREE.Group();
  const bowl = new THREE.Mesh(new THREE.CylinderGeometry(5.2, 5.8, 0.18, 12), mats.mauveDeep);
  bowl.position.y = 0.06;
  const ring = new THREE.Mesh(new THREE.TorusGeometry(3.4, 0.08, 6, 20), mats.mauve);
  ring.rotation.x = Math.PI / 2;
  ring.position.y = 0.16;
  g.add(bowl, ring);
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2;
    const stone = new THREE.Mesh(new THREE.BoxGeometry(0.35, 1.6 + (i % 2) * 0.5, 0.18), mats.mauveDeep);
    stone.position.set(Math.cos(a) * 4.4, 0.9, Math.sin(a) * 4.4);
    stone.rotation.y = a;
    stone.rotation.z = Math.sin(i) * 0.12;
    g.add(stone);
  }
  const haze = new THREE.PointLight(0xa06090, 1.15, 16, 2);
  haze.position.set(0, 2.0, 0);
  g.add(haze);
  return shadowize(g);
}

export function nisisHall(mats) {
  const g = new THREE.Group();
  const floor = new THREE.Mesh(new THREE.CylinderGeometry(6.2, 6.6, 0.16, 11), mats.stoneDark);
  floor.position.y = 0.06;
  g.add(floor);
  for (let i = 0; i < 11; i++) {
    const a = (i / 11) * Math.PI * 2 - Math.PI / 2;
    const col = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.2, 2.8, 6), i % 2 ? mats.mauveDeep : mats.stoneDark);
    col.position.set(Math.cos(a) * 5.2, 1.4, Math.sin(a) * 5.2);
    const flame = new THREE.Mesh(new THREE.SphereGeometry(0.07, 6, 5), mats.mauveGlow);
    flame.position.set(Math.cos(a) * 5.2, 2.95, Math.sin(a) * 5.2);
    g.add(col, flame);
  }
  const figure = veiledFigure(mats);
  figure.position.y = 0.02;
  const light = new THREE.PointLight(0x9060a0, 0.95, 14, 2);
  light.position.set(0, 2.6, 0);
  g.add(figure, light);
  return shadowize(g);
}

export function setCells(mats) {
  const g = new THREE.Group();
  for (let i = 0; i < 22; i++) {
    const a = (i / 22) * Math.PI * 2;
    const niche = new THREE.Mesh(new THREE.BoxGeometry(0.78, 1.85, 0.48), mats.robeDeep);
    niche.position.set(Math.cos(a) * 6.4, 0.92, Math.sin(a) * 6.4);
    niche.rotation.y = a + Math.PI;
    const void_ = new THREE.Mesh(new THREE.BoxGeometry(0.46, 1.15, 0.08), mats.eyeHole);
    void_.position.set(Math.cos(a) * 6.16, 0.98, Math.sin(a) * 6.16);
    void_.rotation.y = a + Math.PI;
    g.add(niche, void_);
  }
  const pit = new THREE.Mesh(new THREE.CylinderGeometry(2.2, 2.4, 0.12, 16), mats.iron);
  pit.position.y = 0.04;
  g.add(pit);
  return shadowize(g);
}

export function nessie(mats) {
  const g = new THREE.Group();
  const neck = new THREE.Mesh(new THREE.CapsuleGeometry(0.35, 2.4, 4, 8), mats.stoneDark);
  neck.position.set(0, 1.4, 0);
  neck.rotation.x = 0.35;
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.42, 8, 6), mats.stoneDark);
  head.position.set(0, 2.7, 0.7);
  head.scale.set(1, 0.7, 1.4);
  const hump = new THREE.Mesh(new THREE.SphereGeometry(0.7, 8, 6), mats.stone);
  hump.position.set(0, 0.2, -1.6);
  hump.scale.set(1.1, 0.6, 1.6);
  const eye = new THREE.Mesh(new THREE.SphereGeometry(0.06, 6, 5), mats.eyeWhite);
  eye.position.set(0.18, 2.75, 0.95);
  g.add(neck, head, hump, eye);
  return g;
}

export function populate(scene, mats, obstacles) {
  const lights = [];

  function plant(mesh, x, z, rot = 0, yOff = 0) {
    const p = mapToPos(x, z, yOff);
    mesh.position.copy(p);
    orientOnPlanet(mesh, upOf(p), rot);
    scene.add(mesh);
    return mesh;
  }

  const manorG = plant(manor(mats), POI.manor.x, POI.manor.z, 0.15);
  const my = heightAt(POI.manor.x, POI.manor.z);
  obstacles.box(POI.manor.x, POI.manor.z, my, my + 8, 8.2, 5.2, 0.15, 'manor');
  obstacles.box(POI.manor.x - 9.2, POI.manor.z + 1, my, my + 5.5, 3.6, 4.1, 0.04, 'wing');
  obstacles.box(POI.manor.x + 9.0, POI.manor.z - 0.6, my, my + 6, 3.2, 3.7, -0.05, 'wing');
  obstacles.cyl(POI.manor.x + 7.2, POI.manor.z + 4.4, my, my + 13, 1.5, 'tower');

  plant(kirk(mats), POI.kirk.x, POI.kirk.z, -0.3);
  const ky = heightAt(POI.kirk.x, POI.kirk.z);
  obstacles.box(POI.kirk.x, POI.kirk.z, ky, ky + 7, 3.6, 5.6, -0.3, 'kirk');
  obstacles.cyl(POI.kirk.x - 2.0, POI.kirk.z - 3.2, ky, ky + 12, 1.0, 'spire');

  plant(abbey(mats), POI.abbey.x, POI.abbey.z, 0.2);
  const ay = heightAt(POI.abbey.x, POI.abbey.z);
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    obstacles.cyl(POI.abbey.x + Math.cos(a) * 7.2, POI.abbey.z + Math.sin(a) * 7.2, ay, ay + 5.2, 0.5, 'col');
  }

  plant(plaza(mats), POI.plaza.x, POI.plaza.z, 0, 0.02);
  plant(well(mats), POI.village.x, POI.village.z);
  const wy = heightAt(POI.village.x, POI.village.z);
  obstacles.cyl(POI.village.x, POI.village.z, wy, wy + 1.2, 1.2, 'well');

  plant(willow(mats), POI.willow.x, POI.willow.z, 0.4);
  const wiy = heightAt(POI.willow.x, POI.willow.z);
  obstacles.cyl(POI.willow.x, POI.willow.z, wiy, wiy + 5, 0.55, 'willow');

  const houses = [
    [POI.village.x - 10, POI.village.z - 8, 5.2, 4.6, 4.4, 0.1],
    [POI.village.x + 12, POI.village.z - 6, 4.6, 5.0, 4.8, -0.08],
    [POI.village.x + 8, POI.village.z + 12, 5.8, 4.2, 5.2, 0.12],
    [POI.village.x - 14, POI.village.z + 10, 4.4, 4.8, 3.8, -0.14],
    [POI.village.x + 18, POI.village.z + 4, 4.0, 4.2, 4.2, 0.06],
    [POI.village.x - 6, POI.village.z - 16, 5.0, 4.4, 4.6, 0.09],
    [POI.village.x + 22, POI.village.z - 12, 4.2, 3.8, 3.6, 0.11],
    [POI.village.x - 20, POI.village.z - 4, 3.8, 4.4, 4.0, -0.1],
    [POI.village.x + 4, POI.village.z + 20, 4.8, 3.6, 3.4, 0.07],
  ];
  for (const [x, z, w, d, h, lean] of houses) {
    plant(crookedHouse(mats, w, d, h, lean), x, z, hash2(Math.floor(x), Math.floor(z)) * 6);
    const y = heightAt(x, z);
    obstacles.box(x, z, y, y + h + 0.4, w * 0.52, d * 0.52, 0, 'house');
  }

  const trees = scatter(19, 210, (x, z) => {
    if (isWater(x, z)) return false;
    if (pathWidth(x, z) < 5.5) return false;
    if (Math.hypot(x, z) > WORLD.islandR - 8) return false;
    if (Math.hypot(x - POI.plaza.x, z - POI.plaza.z) < 18) return false;
    if (Math.hypot(x - POI.manor.x, z - POI.manor.z) < 16) return false;
    if (Math.hypot(x - POI.village.x, z - POI.village.z) < 18) return false;
    if (Math.hypot(x - POI.kirk.x, z - POI.kirk.z) < 10) return false;
    if (Math.hypot(x - POI.abbey.x, z - POI.abbey.z) < 12) return false;
    const inWood = Math.hypot(x - POI.wood.x, z - POI.wood.z) < 42;
    return inWood || hash2(Math.floor(x), Math.floor(z)) > 0.55;
  });
  for (const t of trees) {
    const mesh = twistedTree(mats, t.r);
    plant(mesh, t.x, t.z, t.t * 6.2);
    const y = heightAt(t.x, t.z);
    obstacles.cyl(t.x, t.z, y, y + 4.5, 0.42, 'tree');
  }
  for (let i = 0; i < 110; i++) {
    const lat = (hash2(i, 3) - 0.5) * 2.0;
    const lon = hash2(i, 8) * Math.PI * 2 - Math.PI;
    const x = lon * MAP_SCALE;
    const z = lat * MAP_SCALE;
    if (Math.hypot(x, z) < WORLD.islandR + 22) continue;
    if (Math.abs(lat) > 1.02) continue;
    plant(twistedTree(mats, hash2(i, 1)), x, z, hash2(i, 5) * 6);
    obstacles.cyl(x, z, 0, 4.2, 0.4, 'tree');
  }

  plant(ironCircle(mats), POI.iron.x, POI.iron.z, 0.2);
  for (let i = 0; i < 5; i++) {
    const a = -Math.PI / 2 + (i / 5) * Math.PI * 2;
    obstacles.box(
      POI.iron.x + Math.cos(a) * 5.4,
      POI.iron.z + Math.sin(a) * 5.4,
      0,
      4.2,
      0.32,
      0.16,
      a,
      'menhir'
    );
  }

  plant(craterTemple(mats), POI.crater.x, POI.crater.z, 0.1);
  for (let i = 0; i < 9; i++) {
    const a = (i / 9) * Math.PI * 2;
    obstacles.cyl(POI.crater.x + Math.cos(a) * 7.4, POI.crater.z + Math.sin(a) * 7.4, 0, 3.2, 0.34, 'col');
  }

  plant(cydonia(mats), POI.cydonia.x, POI.cydonia.z, 0.35);
  obstacles.cyl(POI.cydonia.x, POI.cydonia.z, 0, 5.6, 2.2, 'pyr');
  obstacles.cyl(POI.cydonia.x - 7.2, POI.cydonia.z + 4.6, 0, 3.8, 1.6, 'pyr');
  obstacles.cyl(POI.cydonia.x + 6.4, POI.cydonia.z + 5.2, 0, 3.0, 1.2, 'pyr');

  const polarG = polarShrine(mats);
  polarG.scale.setScalar(1.7);
  plant(polarG, POI.polar.x, POI.polar.z, 0.1);
  obstacles.cyl(POI.polar.x, POI.polar.z, 0, 3.2, 0.55, 'idol');

  const orr = canalOrrery(mats);
  orr.scale.setScalar(2.1);
  plant(orr, POI.orrery.x, POI.orrery.z, 0.4);
  obstacles.cyl(POI.orrery.x, POI.orrery.z, 0, 3.2, 1.2, 'desk');

  const sealG = redSeal(mats);
  sealG.scale.setScalar(1.6);
  plant(sealG, POI.seal.x, POI.seal.z, 0.15);
  obstacles.cyl(POI.seal.x, POI.seal.z, 0, 1.8, 0.28, 'lamp');

  plant(fullnessChapel(mats), POI.fullness.x, POI.fullness.z, 0.2);
  obstacles.cyl(POI.fullness.x, POI.fullness.z, 0, 1.2, 1.1, 'desk');

  plant(daathTree(mats), POI.daath.x, POI.daath.z, 0.05);
  obstacles.box(POI.daath.x, POI.daath.z, 0, 0.4, 2.1, 3.2, 0, 'desk');

  plant(lamNiche(mats), POI.lam.x, POI.lam.z, Math.PI);
  obstacles.box(POI.lam.x, POI.lam.z, 0, 1.8, 0.6, 0.28, Math.PI, 'desk');

  plant(mauveThreshold(mats), POI.mauve.x, POI.mauve.z, 0.15);
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2;
    obstacles.box(
      POI.mauve.x + Math.cos(a) * 4.4,
      POI.mauve.z + Math.sin(a) * 4.4,
      0,
      2.1,
      0.22,
      0.14,
      a,
      'menhir'
    );
  }

  plant(nisisHall(mats), POI.nisis.x, POI.nisis.z, 0.1);
  for (let i = 0; i < 11; i++) {
    const a = (i / 11) * Math.PI * 2;
    obstacles.cyl(POI.nisis.x + Math.cos(a) * 5.2, POI.nisis.z + Math.sin(a) * 5.2, 0, 3.0, 0.22, 'col');
  }

  plant(setCells(mats), POI.cells.x, POI.cells.z, 0.2);
  for (let i = 0; i < 22; i++) {
    const a = (i / 22) * Math.PI * 2;
    obstacles.box(
      POI.cells.x + Math.cos(a) * 6.4,
      POI.cells.z + Math.sin(a) * 6.4,
      0,
      1.2,
      0.38,
      0.24,
      a + Math.PI,
      'vault'
    );
  }

  plant(spareMarks(mats), POI.marks.x, POI.marks.z, 0.4);
  obstacles.box(POI.marks.x, POI.marks.z, 0, 2.2, 0.9, 0.14, 0.4, 'desk');

  for (const site of [POI.iron, POI.crater, POI.cydonia, POI.polar, POI.orrery, POI.seal, POI.mauve, POI.nisis, POI.cells]) {
    for (let i = 0; i < 10; i++) {
      const a = hash2(site.x + i, site.z) * Math.PI * 2;
      const d = 10 + hash2(i, site.z) * 16;
      const x = site.x + Math.cos(a) * d;
      const z = site.z + Math.sin(a) * d;
      const rock = new THREE.Mesh(
        new THREE.DodecahedronGeometry(0.45 + hash2(i, 4) * 0.9, 0),
        i % 2 ? mats.stone : mats.sand
      );
      rock.scale.set(1.2, 0.55 + hash2(i, 2) * 0.4, 1);
      plant(shadowize(rock), x, z, a, 0.12);
      obstacles.cyl(x, z, 0, 0.8, 0.4, 'rock');
    }
  }

  const planetLamps = [0x2a2a30, 0x3a5088, 0x8a2430, 0xc9a24a, 0x3a6840, 0xb87838, 0xb8b8c8];
  for (let i = 0; i < 7; i++) {
    const a = (i / 7) * Math.PI * 2 - Math.PI / 2;
    const x = POI.plaza.x + Math.cos(a) * 22;
    const z = POI.plaza.z + Math.sin(a) * 22;
    const L = lantern(mats, i < 4);
    plant(L, x, z);
    const ember = L.children.find((c) => c.material === mats.ember);
    if (ember) ember.material = mats.toon(planetLamps[i]);
    obstacles.cyl(x, z, heightAt(x, z), heightAt(x, z) + 2.4, 0.12, 'lamp');
  }

  const pumps = scatter(44, 72, (x, z) => {
    if (isWater(x, z) || pathWidth(x, z) < 2.5) return false;
    return Math.hypot(x - POI.village.x, z - POI.village.z) < 36 || hash2(Math.floor(x * 2), Math.floor(z * 2)) > 0.86;
  });
  for (const p of pumps) {
    plant(pumpkin(mats, 0.8 + p.r * 0.6), p.x, p.z, p.t * 5);
    const y = heightAt(p.x, p.z);
    obstacles.cyl(p.x, p.z, y, y + 0.5, 0.28, 'pump');
  }

  const graves = scatter(71, 44, (x, z) => {
    const d = Math.hypot(x - POI.kirk.x, z - POI.kirk.z);
    return d > 8 && d < 28 && !isWater(x, z) && pathWidth(x, z) > 3;
  });
  for (const g of graves) {
    plant(grave(mats, g.r), g.x, g.z, g.t * 4);
    const y = heightAt(g.x, g.z);
    obstacles.box(g.x, g.z, y, y + 0.85, 0.24, 0.1, g.t * 4, 'grave');
  }

  for (const [x, z] of [
    [POI.spawn.x + 4.2, POI.spawn.z - 3.5],
    [POI.spawn.x - 5.5, POI.spawn.z - 1.2],
    [POI.spawn.x + 1.8, POI.spawn.z + 6.5],
    [POI.spawn.x - 2.4, POI.spawn.z - 6.0],
    [POI.plaza.x + 14, POI.plaza.z + 8],
    [POI.plaza.x - 12, POI.plaza.z + 10],
  ]) {
    plant(pumpkin(mats, 0.95 + hash2(Math.floor(x), Math.floor(z)) * 0.5), x, z, x * 0.2);
    const y = heightAt(x, z);
    obstacles.cyl(x, z, y, y + 0.5, 0.3, 'pump');
  }

  const lamps = [
    [POI.spawn.x + 3, POI.spawn.z + 2],
    [POI.plaza.x + 10, POI.plaza.z + 4],
    [POI.plaza.x - 9, POI.plaza.z - 5],
    [POI.village.x + 4, POI.village.z + 6],
    [POI.kirk.x - 6, POI.kirk.z + 8],
    [POI.pier.x + 2, POI.pier.z - 8],
    [POI.abbey.x + 10, POI.abbey.z + 2],
    [POI.fullness.x + 6, POI.fullness.z - 4],
    [POI.daath.x - 5, POI.daath.z + 3],
    [POI.manor.x + 8, POI.manor.z - 10],
    [POI.wood.x + 8, POI.wood.z + 6],
    [-20, -20],
    [40, -30],
    [-60, 10],
    [70, 70],
    [-40, -50],
  ];
  for (const [x, z] of lamps) {
    if (isWater(x, z)) continue;
    const L = plant(lantern(mats, lights.length < 6), x, z);
    lights.push(L);
    const y = heightAt(x, z);
    obstacles.cyl(x, z, y, y + 2.4, 0.12, 'lamp');
  }

  // pier planks
  const pier = new THREE.Group();
  for (let i = 0; i < 14; i++) {
    const plank = new THREE.Mesh(new THREE.BoxGeometry(5.8, 0.14, 2.1), mats.wood);
    plank.position.set(0, 0, i * 2.15);
    pier.add(plank);
    const postL = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.1, 1.4, 5), mats.woodDeep);
    postL.position.set(-2.7, -0.6, i * 2.15);
    const postR = postL.clone();
    postR.position.x = 2.7;
    pier.add(postL, postR);
  }
  plant(shadowize(pier), POI.pier.x, 74.2, 0, 0.55);
  obstacles.platform(POI.pier.x, 89, WORLD.waterY + 0.62, 3.0, 16.5, 0);

  const ness = nessie(mats);
  plant(ness, 8, 118, 0.2, 0.4);

  // iron fence around kirk
  for (let i = 0; i < 22; i++) {
    const a = (i / 22) * Math.PI * 1.4 - 0.4;
    const x = POI.kirk.x + Math.cos(a) * 13;
    const z = POI.kirk.z + Math.sin(a) * 13;
    if (isWater(x, z)) continue;
    const post = fencePost(mats);
    plant(post, x, z, 0, 0.55);
    obstacles.cyl(x, z, heightAt(x, z), heightAt(x, z) + 1.2, 0.1, 'fence');
  }

  // rocks
  const rocks = scatter(101, 95, (x, z) => !isWater(x, z) && pathWidth(x, z) > 4 && hash2(Math.floor(x), Math.floor(z) + 3) > 0.68);
  for (const r of rocks) {
    const mesh = new THREE.Mesh(new THREE.DodecahedronGeometry(0.4 + r.r * 0.7, 0), mats.stone);
    mesh.scale.set(1 + r.t, 0.6 + r.r * 0.5, 1);
    plant(shadowize(mesh), r.x, r.z, r.t * 5, 0.15);
    const y = heightAt(r.x, r.z);
    obstacles.cyl(r.x, r.z, y, y + 0.7, 0.4 + r.r * 0.35, 'rock');
  }

  plant(threeHours(mats), POI.cairo.x, POI.cairo.z, 0.4);
  const cy = heightAt(POI.cairo.x, POI.cairo.z);
  obstacles.box(POI.cairo.x, POI.cairo.z, cy, cy + 2.5, 4.0, 0.9, 0.4, 'cairo');

  plant(vaultHeptagon(mats, PLANET_COLS), POI.vault.x, POI.vault.z, 0.1);
  const vy = heightAt(POI.vault.x, POI.vault.z);
  for (let i = 0; i < 7; i++) {
    const a = (i / 7) * Math.PI * 2 - Math.PI / 2;
    obstacles.box(
      POI.vault.x + Math.cos(a) * 4.2,
      POI.vault.z + Math.sin(a) * 4.2,
      vy,
      vy + 1.6,
      1.1,
      0.18,
      a,
      'vault'
    );
  }

  plant(chessTable(mats), POI.chess.x, POI.chess.z, 0.2);
  const chy = heightAt(POI.chess.x, POI.chess.z);
  obstacles.cyl(POI.chess.x, POI.chess.z, chy, chy + 0.9, 0.6, 'desk');

  plant(cairn(mats), POI.spiral.x, POI.spiral.z, 0.3);
  const cny = heightAt(POI.spiral.x, POI.spiral.z);
  obstacles.cyl(POI.spiral.x, POI.spiral.z, cny, cny + 1.8, 0.7, 'rock');

  plant(press(mats), POI.press.x, POI.press.z, -0.4);
  const pry = heightAt(POI.press.x, POI.press.z);
  obstacles.box(POI.press.x, POI.press.z, pry, pry + 1.2, 0.75, 0.5, -0.4, 'desk');

  plant(hastingsChair(mats), POI.nether.x, POI.nether.z, Math.PI);
  const ny = heightAt(POI.nether.x, POI.nether.z);
  obstacles.cyl(POI.nether.x, POI.nether.z, ny, ny + 0.9, 0.32, 'desk');

  const yard = mosaicPavement(5.4, 6, mats, true);
  plant(yard, POI.spawn.x, POI.spawn.z + 1.4);

  const adept = hoodedAdept(mats);
  plant(adept, POI.wood.x + 4, POI.wood.z - 6, 0.6);
  const by = heightAt(POI.wood.x + 4, POI.wood.z - 6);
  obstacles.cyl(POI.wood.x + 4, POI.wood.z - 6, by, by + 2.2, 0.45, 'idol');

  const desks = [
    [-54.5, 50.5],
    [90.0, 24.8],
    [-20.0, 102.5],
    [-104.0, -18.0],
    [12.4, -86.8],
    [-80.0, -98.5],
    [76.6, 47.8],
  ];
  for (const [x, z] of desks) {
    plant(lectern(mats), x, z);
    const y = heightAt(x, z);
    obstacles.cyl(x, z, y, y + 1.1, 0.18, 'desk');
  }

  const ay2 = heightAt(POI.abbey.x, POI.abbey.z);
  obstacles.cyl(POI.abbey.x - 1.6, POI.abbey.z + 8.4, ay2, ay2 + 4.6, 0.38, 'col');
  obstacles.cyl(POI.abbey.x + 1.6, POI.abbey.z + 8.4, ay2, ay2 + 4.6, 0.38, 'col');
  const py = heightAt(POI.plaza.x, POI.plaza.z);
  obstacles.cyl(POI.plaza.x - 1.35, POI.plaza.z + 7.6, py, py + 4.2, 0.32, 'col');
  obstacles.cyl(POI.plaza.x + 1.35, POI.plaza.z + 7.6, py, py + 4.2, 0.32, 'col');

  const clutter = [
    [barrel, POI.manor.x + 6.2, POI.manor.z - 7.4, 0.3],
    [barrel, POI.manor.x + 6.9, POI.manor.z - 6.8, 1.1],
    [crate, POI.manor.x - 8.5, POI.manor.z - 6.2, 0.4],
    [crate, POI.manor.x - 7.8, POI.manor.z - 7.0, 0.9],
    [bookStack, POI.manor.x + 2.4, POI.manor.z + 6.2, 0.2],
    [bench, POI.manor.x + 4.5, POI.manor.z + 8.5, 0.4],
    [blackCat, POI.manor.x + 5.2, POI.manor.z + 8.0, 1.2],
    [pot, POI.spawn.x - 3.2, POI.spawn.z + 2.4, 0.1],
    [pot, POI.spawn.x - 2.6, POI.spawn.z + 2.8, 0.6],
    [barrel, POI.spawn.x + 5.5, POI.spawn.z - 4.2, 0.2],
    [bench, POI.plaza.x + 8.4, POI.plaza.z - 6.2, 0.8],
    [bench, POI.plaza.x - 8.8, POI.plaza.z - 5.4, -0.6],
    [candles, POI.plaza.x + 3.2, POI.plaza.z + 4.4, 0],
    [candles, POI.plaza.x - 4.1, POI.plaza.z + 3.6, 0.4],
    [pot, POI.plaza.x + 6.2, POI.plaza.z + 6.8, 0.2],
    [cart, POI.village.x - 8.4, POI.village.z + 2.2, 0.7],
    [barrel, POI.village.x - 6.8, POI.village.z + 3.4, 0.2],
    [barrel, POI.village.x - 6.2, POI.village.z + 2.6, 1.4],
    [crate, POI.village.x + 5.5, POI.village.z - 2.8, 0.3],
    [crate, POI.village.x + 6.4, POI.village.z - 3.4, 0.9],
    [scarecrow, POI.village.x + 16, POI.village.z - 10, 0.4],
    [scarecrow, POI.village.x - 18, POI.village.z + 6, -0.5],
    [blackCat, POI.village.x + 3.2, POI.village.z + 4.4, 0.2],
    [bench, POI.kirk.x + 5.4, POI.kirk.z + 6.2, -0.4],
    [candles, POI.kirk.x + 1.2, POI.kirk.z + 5.8, 0],
    [candles, POI.kirk.x - 1.4, POI.kirk.z + 5.4, 0.3],
    [bookStack, POI.kirk.x - 3.2, POI.kirk.z + 4.6, 0.5],
    [pot, POI.abbey.x + 4.2, POI.abbey.z + 5.5, 0.1],
    [pot, POI.abbey.x + 5.0, POI.abbey.z + 4.8, 0.8],
    [candles, POI.abbey.x - 2.4, POI.abbey.z + 3.2, 0.2],
    [bookStack, POI.abbey.x + 2.8, POI.abbey.z - 2.2, 0.4],
    [barrel, POI.pier.x + 3.4, POI.pier.z - 10, 0.2],
    [barrel, POI.pier.x - 3.2, POI.pier.z - 8, 0.9],
    [crate, POI.pier.x + 2.6, POI.pier.z - 12, 0.3],
    [bench, POI.nether.x + 2.8, POI.nether.z - 2.2, 3.2],
    [bookStack, POI.press.x + 1.4, POI.press.z + 1.1, 0.2],
    [crate, POI.press.x - 1.6, POI.press.z + 0.8, 0.5],
    [candles, POI.fullness.x + 2.2, POI.fullness.z + 1.4, 0],
    [bench, POI.fullness.x - 3.4, POI.fullness.z - 2.2, 0.5],
    [bookStack, POI.daath.x + 2.6, POI.daath.z - 1.2, 0.2],
  ];
  for (const [fn, x, z, rot] of clutter) {
    if (isWater(x, z)) continue;
    plant(fn(mats, hash2(Math.floor(x), Math.floor(z))), x, z, rot);
    const y = heightAt(x, z);
    obstacles.cyl(x, z, y, y + 0.55, 0.28, 'desk');
  }

  plant(banner(mats), POI.plaza.x + 6.5, POI.plaza.z + 8.2, 0.2);
  plant(banner(mats), POI.village.x - 4, POI.village.z - 8, -0.4);
  plant(banner(mats), POI.abbey.x - 8, POI.abbey.z + 3, 0.6);
  plant(banner(mats), POI.manor.x - 6, POI.manor.z + 8, 0.1);

  for (let i = 0; i < 18; i++) {
    const a = (i / 18) * Math.PI * 1.6 + 0.4;
    const x = POI.manor.x + Math.cos(a) * 15;
    const z = POI.manor.z + Math.sin(a) * 12;
    if (isWater(x, z)) continue;
    plant(fencePost(mats), x, z, 0, 0.55);
    obstacles.cyl(x, z, heightAt(x, z), heightAt(x, z) + 1.2, 0.1, 'fence');
  }

  const bushes = scatter(33, 80, (x, z) => {
    if (isWater(x, z) || pathWidth(x, z) < 3) return false;
    return Math.hypot(x, z) < WORLD.islandR - 6 && hash2(Math.floor(x), Math.floor(z) + 7) > 0.62;
  });
  for (const b of bushes) {
    plant(deadBush(mats, b.r), b.x, b.z, b.t * 5);
  }

  for (let i = 0; i < 28; i++) {
    const lat = (hash2(i, 11) - 0.5) * 2.0;
    const lon = hash2(i, 19) * Math.PI * 2 - Math.PI;
    const x = lon * MAP_SCALE;
    const z = lat * MAP_SCALE;
    if (Math.hypot(x, z) < WORLD.islandR + 18) continue;
    plant(hash2(i, 2) > 0.55 ? rustWreck(mats, hash2(i, 4)) : deadBush(mats, hash2(i, 6)), x, z, hash2(i, 7) * 6);
    if (hash2(i, 2) > 0.55) obstacles.cyl(x, z, 0, 0.7, 0.7, 'rock');
  }

  const ravens = [];
  for (let i = 0; i < 10; i++) {
    const mesh = hangingCrow(mats);
    mesh.scale.setScalar(1.3 + hash2(i, 2) * 0.5);
    scene.add(mesh);
    ravens.push({
      mesh,
      cx: POI.plaza.x + (hash2(i, 1) - 0.5) * 40,
      cz: POI.plaza.z + (hash2(i, 4) - 0.5) * 40,
      rad: 8 + hash2(i, 6) * 18,
      h: 4.5 + hash2(i, 8) * 5,
      spd: 0.22 + hash2(i, 3) * 0.25,
      ph: hash2(i, 9) * 6.2,
    });
  }
  for (const hub of [POI.kirk, POI.manor, POI.village, POI.abbey]) {
    for (let i = 0; i < 3; i++) {
      const mesh = hangingCrow(mats);
      scene.add(mesh);
      ravens.push({
        mesh,
        cx: hub.x,
        cz: hub.z,
        rad: 6 + i * 3,
        h: 5 + i,
        spd: 0.3 + i * 0.08,
        ph: i * 2.1,
      });
    }
  }

  const moths = [];
  for (const L of lights.slice(0, 8)) {
    for (let i = 0; i < 3; i++) {
      const m = new THREE.Mesh(new THREE.SphereGeometry(0.035, 4, 3), mats.glowGold);
      scene.add(m);
      moths.push({ mesh: m, lamp: L, ph: i * 2.1, rad: 0.45 + i * 0.12 });
    }
  }

  const flickers = [];
  scene.traverse((o) => {
    if (o.isPointLight && o.color && (o.color.r > 0.6 || o.color.b > 0.4)) flickers.push(o);
  });

  const banners = [];
  scene.traverse((o) => {
    if (o.userData && o.userData.flap) banners.push(o.userData.flap);
  });

  function lineSides(ax, az, bx, bz) {
    const dx = bx - ax;
    const dz = bz - az;
    const len = Math.hypot(dx, dz) || 1;
    const nx = -dz / len;
    const nz = dx / len;
    const steps = Math.max(2, Math.floor(len / 3.4));
    for (let s = 1; s < steps; s++) {
      const t = s / steps;
      for (const side of [-1, 1]) {
        const off = 3.5 + hash2(s, side + 5) * 1.4;
        const x = ax + dx * t + nx * side * off;
        const z = az + dz * t + nz * side * off;
        if (isWater(x, z) || pathWidth(x, z) < 2.1) continue;
        const k = Math.floor(hash2(s * 3 + side, Math.floor(ax + 11)) * 6);
        if (k === 0) plant(pumpkin(mats, 0.85 + hash2(s, 2) * 0.4), x, z, t * 4);
        else if (k === 1) plant(barrel(mats), x, z, t);
        else if (k === 2) plant(crate(mats, hash2(s, 4)), x, z, t * 2);
        else if (k === 3) plant(deadBush(mats, hash2(s, 6)), x, z, t);
        else if (k === 4) {
          plant(fencePost(mats), x, z, 0, 0.55);
          obstacles.cyl(x, z, heightAt(x, z), heightAt(x, z) + 1.1, 0.1, 'fence');
        } else {
          const rock = new THREE.Mesh(new THREE.DodecahedronGeometry(0.38 + hash2(s, 7) * 0.3, 0), mats.stone);
          rock.scale.set(1.1, 0.55, 1);
          plant(shadowize(rock), x, z, t, 0.1);
        }
      }
    }
  }

  lineSides(POI.spawn.x, POI.spawn.z, POI.manor.x, POI.manor.z);
  lineSides(POI.spawn.x, POI.spawn.z, POI.plaza.x, POI.plaza.z);
  lineSides(POI.spawn.x, POI.spawn.z, POI.mile.x, POI.mile.z);
  lineSides(POI.mile.x, POI.mile.z, POI.plaza.x, POI.plaza.z);
  lineSides(POI.plaza.x, POI.plaza.z, POI.kirk.x, POI.kirk.z);
  lineSides(POI.plaza.x, POI.plaza.z, POI.village.x, POI.village.z);
  lineSides(POI.plaza.x, POI.plaza.z, POI.wood.x, POI.wood.z);
  lineSides(POI.village.x, POI.village.z, POI.abbey.x, POI.abbey.z);
  lineSides(POI.manor.x, POI.manor.z, POI.pier.x, POI.pier.z);
  lineSides(POI.kirk.x, POI.kirk.z, POI.willow.x, POI.willow.z);

  for (let k = 0; k < 16; k++) {
    const a = -2.3 + (k / 15) * 4.6;
    const d = 4.2 + (k % 4) * 0.9;
    const x = POI.spawn.x + Math.sin(a) * d;
    const z = POI.spawn.z + Math.cos(a) * d;
    if (z < POI.spawn.z - 3.2) continue;
    if (isWater(x, z) || pathWidth(x, z) < 1.8) continue;
    if (k % 3 === 0) plant(pumpkin(mats, 0.9), x, z, a);
    else if (k % 3 === 1) plant(barrel(mats), x, z, a);
    else plant(deadBush(mats, 0.5), x, z, a);
  }

  dressWorld(scene, mats, obstacles, plant);

  function tick(t) {
    for (const r of ravens) {
      const a = t * r.spd + r.ph;
      const p = mapToPos(r.cx + Math.cos(a) * r.rad, r.cz + Math.sin(a) * r.rad, r.h + Math.sin(t * 1.6 + r.ph) * 0.45);
      r.mesh.position.copy(p);
      orientOnPlanet(r.mesh, upOf(p), a + Math.PI * 0.5);
    }
    for (const m of moths) {
      if (!m.lamp) continue;
      const a = t * 3.4 + m.ph;
      const up = upOf(m.lamp.position);
      const { east, north } = tangentBasis(up);
      m.mesh.position
        .copy(m.lamp.position)
        .addScaledVector(up, 2.05 + Math.sin(a * 1.7) * 0.15)
        .addScaledVector(east, Math.cos(a) * m.rad)
        .addScaledVector(north, Math.sin(a * 1.3) * m.rad);
    }
    for (let i = 0; i < flickers.length; i++) {
      const L = flickers[i];
      L.intensity = (L.userData.base ?? (L.userData.base = L.intensity)) * (0.82 + Math.sin(t * 14 + i * 1.7) * 0.18);
    }
    for (let i = 0; i < banners.length; i++) {
      banners[i].rotation.z = Math.sin(t * 1.6 + i) * 0.18;
      banners[i].rotation.x = Math.sin(t * 1.1 + i * 0.7) * 0.08;
    }
  }

  return { manorG, ness, lights, tick };
}
