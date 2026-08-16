import * as THREE from 'three';
import { PLANET_COLS, POI, WORLD } from '../config.js';
import { hash2 } from '../math.js';
import { heightAt, isWater, pathWidth, scatter } from '../height.js';
import {
  ashlars,
  cairn,
  chessTable,
  compassSquare,
  hastingsChair,
  hoodedAdept,
  jachinBoaz,
  lectern,
  mosaicPavement,
  press,
  roseWindow,
  threeHours,
  tracingBoard,
  vaultHeptagon,
} from './symbols.js';

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
    const y = heightAt(x, z);
    mesh.position.set(x, y + yOff, z);
    mesh.rotation.y = rot;
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
  ];
  for (const [x, z, w, d, h, lean] of houses) {
    plant(crookedHouse(mats, w, d, h, lean), x, z, hash2(Math.floor(x), Math.floor(z)) * 6);
    const y = heightAt(x, z);
    obstacles.box(x, z, y, y + h + 0.4, w * 0.52, d * 0.52, 0, 'house');
  }

  const trees = scatter(19, 150, (x, z) => {
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

  const pumps = scatter(44, 40, (x, z) => {
    if (isWater(x, z) || pathWidth(x, z) < 2.5) return false;
    return Math.hypot(x - POI.village.x, z - POI.village.z) < 36 || hash2(Math.floor(x * 2), Math.floor(z * 2)) > 0.86;
  });
  for (const p of pumps) {
    plant(pumpkin(mats, 0.8 + p.r * 0.6), p.x, p.z, p.t * 5);
    const y = heightAt(p.x, p.z);
    obstacles.cyl(p.x, p.z, y, y + 0.5, 0.28, 'pump');
  }

  const graves = scatter(71, 28, (x, z) => {
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
    [-20, -20],
    [40, -30],
    [-60, 10],
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
  ness.position.set(8, WORLD.waterY - 0.2, 124);
  scene.add(ness);

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
  const rocks = scatter(101, 55, (x, z) => !isWater(x, z) && pathWidth(x, z) > 4 && hash2(Math.floor(x), Math.floor(z) + 3) > 0.72);
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

  return { manorG, ness, lights };
}
