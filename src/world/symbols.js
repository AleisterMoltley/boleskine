import * as THREE from 'three';

export function pentagramPts(r, invert = false) {
  const pts = [];
  const start = invert ? Math.PI / 2 : -Math.PI / 2;
  for (let i = 0; i < 5; i++) {
    const a = start + (i * 4 * Math.PI) / 5;
    pts.push([Math.cos(a) * r, Math.sin(a) * r]);
  }
  return pts;
}

export function unicursalPts(r) {
  const raw = [
    [200, 0],
    [250, 175],
    [400, 175],
    [275, 275],
    [325, 450],
    [200, 350],
    [75, 450],
    [125, 275],
    [0, 175],
    [150, 175],
  ];
  const cx = 200;
  const cy = 225;
  const s = r / 210;
  return raw.map(([x, y]) => [(x - cx) * s, -(y - cy) * s]);
}

export function lineSigil(pts, mat, thick = 0.09) {
  const g = new THREE.Group();
  for (let i = 0; i < pts.length; i++) {
    const a = pts[i];
    const b = pts[(i + 1) % pts.length];
    const dx = b[0] - a[0];
    const dy = b[1] - a[1];
    const len = Math.hypot(dx, dy);
    if (len < 1e-4) continue;
    const bar = new THREE.Mesh(new THREE.BoxGeometry(len, thick, thick), mat);
    bar.position.set((a[0] + b[0]) * 0.5, (a[1] + b[1]) * 0.5, 0);
    bar.rotation.z = Math.atan2(dy, dx);
    g.add(bar);
  }
  return g;
}

export function circleLine(r, mat, thick = 0.08, seg = 28) {
  const pts = [];
  for (let i = 0; i < seg; i++) {
    const a = (i / seg) * Math.PI * 2;
    pts.push([Math.cos(a) * r, Math.sin(a) * r]);
  }
  return lineSigil(pts, mat, thick);
}

export function pentacle(r, mat, invert = false, thick = 0.08) {
  const g = new THREE.Group();
  g.add(lineSigil(pentagramPts(r * 0.86, invert), mat, thick));
  g.add(circleLine(r, mat, thick * 0.85));
  return g;
}

export function unicursal(r, mat, thick = 0.08) {
  return lineSigil(unicursalPts(r), mat, thick);
}

export function layFlat(mesh, y = 0.06) {
  mesh.rotation.x = -Math.PI / 2;
  mesh.position.y = y;
  return mesh;
}

export function stand(mesh, y = 1.2) {
  mesh.position.y = y;
  return mesh;
}

export function candle(mats, h = 0.42) {
  const g = new THREE.Group();
  const wax = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.04, h, 6), mats.bone);
  wax.position.y = h * 0.5;
  const flame = new THREE.Mesh(new THREE.ConeGeometry(0.028, 0.1, 5), mats.ember);
  flame.position.y = h + 0.06;
  g.add(wax, flame);
  return g;
}

export function ankh(mats, s = 1) {
  const g = new THREE.Group();
  const loop = new THREE.Mesh(new THREE.TorusGeometry(0.16 * s, 0.035 * s, 6, 12), mats.gold);
  loop.position.y = 0.42 * s;
  const stem = new THREE.Mesh(new THREE.BoxGeometry(0.07 * s, 0.5 * s, 0.05 * s), mats.gold);
  stem.position.y = 0.02 * s;
  const arm = new THREE.Mesh(new THREE.BoxGeometry(0.38 * s, 0.07 * s, 0.05 * s), mats.gold);
  arm.position.y = 0.18 * s;
  g.add(loop, stem, arm);
  return g;
}

export function eyeInTriangle(mats, s = 1) {
  const g = new THREE.Group();
  const pts = [
    [0, 0.42 * s],
    [0.4 * s, -0.28 * s],
    [-0.4 * s, -0.28 * s],
  ];
  g.add(lineSigil(pts, mats.glowGold, 0.045 * s));
  const eye = new THREE.Mesh(new THREE.SphereGeometry(0.08 * s, 8, 6), mats.eyeWhite);
  eye.scale.set(1.4, 0.7, 0.5);
  const pupil = new THREE.Mesh(new THREE.SphereGeometry(0.035 * s, 6, 5), mats.eyeHole);
  pupil.position.z = 0.03 * s;
  g.add(eye, pupil);
  return g;
}

export function glyphStone(text, mats) {
  const c = document.createElement('canvas');
  c.width = 256;
  c.height = 384;
  const g = c.getContext('2d');
  g.fillStyle = '#2c2c34';
  g.fillRect(0, 0, 256, 384);
  g.strokeStyle = '#c9a24a';
  g.lineWidth = 8;
  g.strokeRect(14, 14, 228, 356);
  g.fillStyle = '#e8d6a0';
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  const lines = String(text).split('\n');
  const longest = lines.reduce((n, l) => Math.max(n, l.length), 1);
  const size = Math.min(72, Math.floor(200 / longest) * 2 + 28);
  g.font = `bold ${size}px Palatino, Georgia, serif`;
  lines.forEach((line, i) => {
    g.fillText(line, 128, 192 + (i - (lines.length - 1) / 2) * (size + 10));
  });
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  const mat = new THREE.MeshBasicMaterial({ map: tex });
  const slab = new THREE.Mesh(new THREE.BoxGeometry(0.85, 1.25, 0.16), mats.stoneDark);
  const face = new THREE.Mesh(new THREE.PlaneGeometry(0.72, 1.08), mat);
  face.position.z = 0.085;
  const root = new THREE.Group();
  root.add(slab, face);
  slab.position.y = 0.62;
  face.position.y = 0.62;
  return root;
}

export function jachinBoaz(mats) {
  const pair = new THREE.Group();
  const white = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.34, 4.4, 8), mats.bone);
  white.position.set(-1.6, 2.2, 0);
  const black = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.34, 4.4, 8), mats.robeDeep);
  black.position.set(1.6, 2.2, 0);
  const capW = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.3, 0.22, 8), mats.gold);
  capW.position.set(-1.6, 4.45, 0);
  const capB = capW.clone();
  capB.position.x = 1.6;
  pair.add(white, black, capW, capB);
  return pair;
}

export function steleRevealing(mats) {
  const g = new THREE.Group();
  const slab = new THREE.Mesh(new THREE.BoxGeometry(1.35, 2.1, 0.18), mats.sand);
  slab.position.y = 1.05;
  const sun = new THREE.Mesh(new THREE.SphereGeometry(0.16, 8, 6), mats.glowGold);
  sun.position.set(0, 1.85, 0.12);
  const wingL = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.08, 0.04), mats.gold);
  wingL.position.set(-0.38, 1.85, 0.12);
  wingL.rotation.z = 0.25;
  const wingR = wingL.clone();
  wingR.position.x = 0.38;
  wingR.rotation.z = -0.25;
  const seated = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.42, 0.12), mats.goldDeep);
  seated.position.set(-0.22, 0.85, 0.12);
  const standing = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.55, 0.1), mats.sash);
  standing.position.set(0.28, 0.92, 0.12);
  g.add(slab, sun, wingL, wingR, seated, standing);
  const mark = unicursal(0.22, mats.glowGold, 0.03);
  mark.position.set(0, 1.35, 0.12);
  g.add(mark);
  return g;
}

export function baphomet(mats) {
  const g = new THREE.Group();
  const robe = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.55, 1.7, 8), mats.robe);
  robe.position.y = 0.85;
  const chest = new THREE.Mesh(new THREE.SphereGeometry(0.28, 8, 6), mats.skinShadow);
  chest.position.y = 1.55;
  chest.scale.set(1.1, 0.7, 0.7);
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.22, 8, 6), mats.skinShadow);
  head.position.y = 2.05;
  head.scale.set(0.85, 1.15, 0.9);
  const snout = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.18, 5), mats.skinShadow);
  snout.rotation.x = Math.PI / 2;
  snout.position.set(0, 1.98, 0.2);
  const hornL = new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.7, 6), mats.bone);
  hornL.position.set(-0.14, 2.5, -0.02);
  hornL.rotation.z = 0.35;
  const hornR = hornL.clone();
  hornR.position.x = 0.14;
  hornR.rotation.z = -0.35;
  const torch = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.35, 5), mats.wood);
  torch.position.set(0, 2.72, 0);
  const flame = new THREE.Mesh(new THREE.SphereGeometry(0.08, 6, 5), mats.ember);
  flame.position.set(0, 2.95, 0);
  const pent = pentacle(0.16, mats.gold, false, 0.03);
  pent.position.set(0, 1.42, 0.32);
  g.add(robe, chest, head, snout, hornL, hornR, torch, flame, pent);
  g.traverse((o) => {
    if (o.isMesh) {
      o.castShadow = true;
      o.receiveShadow = true;
    }
  });
  return g;
}

export function roseCenter(mats) {
  const g = new THREE.Group();
  for (let i = 0; i < 5; i++) {
    const a = -Math.PI / 2 + (i * 2 * Math.PI) / 5;
    const p = new THREE.Mesh(new THREE.SphereGeometry(0.11, 6, 5), mats.rose);
    p.position.set(Math.cos(a) * 0.14, Math.sin(a) * 0.14, 0);
    p.scale.set(1, 0.55, 0.4);
    g.add(p);
  }
  const mid = new THREE.Mesh(new THREE.SphereGeometry(0.07, 6, 5), mats.gold);
  g.add(mid);
  return g;
}

export function hangingPentagram(mats, invert = false) {
  const g = pentacle(0.28, mats.iron, invert, 0.035);
  const cord = new THREE.Mesh(new THREE.CylinderGeometry(0.01, 0.01, 0.5, 4), mats.iron);
  cord.position.y = 0.5;
  g.add(cord);
  return g;
}

export function mosaicPavement(size, cells, mats, muted = false) {
  const g = new THREE.Group();
  const s = size / cells;
  const light = muted ? mats.stoneLite : mats.bone;
  const dark = muted ? mats.stoneDark : mats.robeDeep;
  for (let i = 0; i < cells; i++) {
    for (let j = 0; j < cells; j++) {
      const tile = new THREE.Mesh(
        new THREE.BoxGeometry(s * 0.97, 0.05, s * 0.97),
        (i + j) % 2 ? light : dark
      );
      tile.position.set((i - cells * 0.5 + 0.5) * s, 0.03, (j - cells * 0.5 + 0.5) * s);
      tile.receiveShadow = true;
      g.add(tile);
    }
  }
  return g;
}

export function tracingBoard(mats, scale = 1) {
  const g = new THREE.Group();
  const slab = new THREE.Mesh(new THREE.BoxGeometry(2.4 * scale, 0.08, 1.7 * scale), mats.woodDeep);
  slab.position.y = 0.04;
  const circ = circleLine(0.48 * scale, mats.stoneLite, 0.035 * scale, 20);
  circ.rotation.x = -Math.PI / 2;
  circ.position.y = 0.09;
  const sq = lineSigil(
    [
      [-0.38 * scale, -0.38 * scale],
      [0.38 * scale, -0.38 * scale],
      [0.38 * scale, 0.38 * scale],
      [-0.38 * scale, 0.38 * scale],
    ],
    mats.stoneLite,
    0.03 * scale
  );
  sq.rotation.x = -Math.PI / 2;
  sq.position.y = 0.09;
  const tri = lineSigil(
    [
      [0, 0.34 * scale],
      [0.3 * scale, -0.2 * scale],
      [-0.3 * scale, -0.2 * scale],
    ],
    mats.goldDeep,
    0.028 * scale
  );
  tri.rotation.x = -Math.PI / 2;
  tri.position.y = 0.1;
  g.add(slab, circ, sq, tri);
  return g;
}

export function compassSquare(mats, s = 1) {
  const g = new THREE.Group();
  const beam = new THREE.Mesh(new THREE.BoxGeometry(0.42 * s, 0.04 * s, 0.04 * s), mats.iron);
  beam.rotation.z = 0.55;
  const beam2 = beam.clone();
  beam2.rotation.z = -0.55;
  const bow = new THREE.Mesh(new THREE.TorusGeometry(0.16 * s, 0.018 * s, 5, 10, Math.PI), mats.iron);
  bow.rotation.z = Math.PI;
  bow.position.y = -0.08 * s;
  g.add(beam, beam2, bow);
  return g;
}

export function ashlars(mats) {
  const g = new THREE.Group();
  const rough = new THREE.Mesh(new THREE.DodecahedronGeometry(0.38, 0), mats.stone);
  rough.position.set(-0.7, 0.32, 0);
  rough.scale.set(1.1, 0.85, 1);
  const smooth = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.62, 0.62), mats.stoneLite);
  smooth.position.set(0.7, 0.31, 0);
  g.add(rough, smooth);
  return g;
}

export function roseWindow(mats) {
  const g = new THREE.Group();
  const rim = new THREE.Mesh(new THREE.TorusGeometry(0.72, 0.06, 6, 16), mats.stoneLite);
  g.add(rim);
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    const bar = new THREE.Mesh(new THREE.BoxGeometry(1.28, 0.045, 0.04), mats.stone);
    bar.rotation.z = a;
    g.add(bar);
  }
  const hub = new THREE.Mesh(new THREE.CircleGeometry(0.14, 8), mats.ember);
  hub.position.z = 0.02;
  g.add(hub);
  return g;
}

export function lectern(mats) {
  const g = new THREE.Group();
  const post = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.1, 1.05, 6), mats.wood);
  post.position.y = 0.52;
  const top = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.06, 0.4), mats.woodDeep);
  top.position.set(0, 1.08, 0.04);
  top.rotation.x = -0.25;
  g.add(post, top);
  return g;
}

export function hoodedAdept(mats) {
  const g = new THREE.Group();
  const robe = new THREE.Mesh(new THREE.CylinderGeometry(0.26, 0.42, 1.35, 8), mats.robe);
  robe.position.y = 0.68;
  const hood = new THREE.Mesh(new THREE.SphereGeometry(0.2, 8, 6), mats.robeDeep);
  hood.position.y = 1.48;
  hood.scale.set(1, 1.15, 1.05);
  const voidFace = new THREE.Mesh(new THREE.SphereGeometry(0.08, 6, 5), mats.eyeHole);
  voidFace.position.set(0, 1.46, 0.14);
  const lamp = new THREE.Mesh(new THREE.SphereGeometry(0.06, 6, 5), mats.ember);
  lamp.position.set(0.22, 0.85, 0.18);
  g.add(robe, hood, voidFace, lamp);
  g.traverse((o) => {
    if (o.isMesh) o.castShadow = true;
  });
  return g;
}
