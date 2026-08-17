import * as THREE from 'three';
import { PAL } from './config.js';

function toonRamp(steps = 4) {
  const data = new Uint8Array(steps * 4);
  for (let i = 0; i < steps; i++) {
    const t = i / (steps - 1);
    const v = Math.round((Math.pow(t, 0.72) * 0.7 + 0.2) * 255);
    data[i * 4] = v;
    data[i * 4 + 1] = v;
    data[i * 4 + 2] = v;
    data[i * 4 + 3] = 255;
  }
  const tex = new THREE.DataTexture(data, steps, 1, THREE.RGBAFormat);
  tex.minFilter = THREE.NearestFilter;
  tex.magFilter = THREE.NearestFilter;
  tex.needsUpdate = true;
  return tex;
}

function canvasTex(w, h, draw, srgb = true) {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  draw(c.getContext('2d'), w, h);
  const tex = new THREE.CanvasTexture(c);
  if (srgb) tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.needsUpdate = true;
  return tex;
}

export function createMaterials() {
  const ramp = toonRamp(4);
  const toon = (color, extra = {}) =>
    new THREE.MeshToonMaterial({ color, gradientMap: ramp, ...extra });

  const moonMap = canvasTex(512, 512, (g, w, h) => {
    const grd = g.createRadialGradient(w * 0.45, h * 0.4, 20, w * 0.5, h * 0.5, w * 0.52);
    grd.addColorStop(0, '#f4e6b8');
    grd.addColorStop(0.7, '#e2cf94');
    grd.addColorStop(1, '#b8a06a');
    g.fillStyle = grd;
    g.fillRect(0, 0, w, h);
    g.globalAlpha = 0.28;
    for (let i = 0; i < 14; i++) {
      g.fillStyle = i % 2 ? '#c4b07a' : '#efe4c0';
      g.beginPath();
      g.ellipse(w * 0.5, (i - 1) * 42, w * 0.55, 18, 0, 0, Math.PI * 2);
      g.fill();
    }
    g.globalAlpha = 0.22;
    g.fillStyle = '#9a8860';
    for (let i = 0; i < 18; i++) {
      const x = (Math.sin(i * 3.1) * 0.5 + 0.5) * w;
      const y = (Math.cos(i * 2.4) * 0.5 + 0.5) * h;
      g.beginPath();
      g.ellipse(x, y, 8 + (i % 5) * 4, 6 + (i % 3) * 3, i, 0, Math.PI * 2);
      g.fill();
    }
    g.globalAlpha = 1;
  });
  moonMap.wrapS = moonMap.wrapT = THREE.ClampToEdgeWrapping;

  const groundMap = canvasTex(256, 256, (g, w, h) => {
    g.fillStyle = '#2a322c';
    g.fillRect(0, 0, w, h);
    for (let i = 0; i < 900; i++) {
      g.fillStyle = i % 3 === 0 ? '#323a32' : i % 3 === 1 ? '#242820' : '#3a3428';
      g.fillRect(Math.random() * w, Math.random() * h, 2 + Math.random() * 4, 2 + Math.random() * 3);
    }
  });
  groundMap.repeat.set(28, 28);

  const rustGrit = canvasTex(256, 256, (g, w, h) => {
    g.fillStyle = '#7a5848';
    g.fillRect(0, 0, w, h);
    for (let i = 0; i < 5000; i++) {
      g.fillStyle = i % 2 ? '#5a3c30' : '#9a7060';
      g.fillRect((Math.random() * w) | 0, (Math.random() * h) | 0, 1, 1);
    }
  });
  rustGrit.repeat.set(140, 100);
  rustGrit.wrapS = rustGrit.wrapT = THREE.RepeatWrapping;

  const waterMat = new THREE.MeshToonMaterial({
    color: 0x2a1814,
    gradientMap: ramp,
  });

  return {
    ramp,
    toon,
    moonMap,
    groundMap,
    rustGrit,
    skin: toon(PAL.skin),
    skinShadow: toon(PAL.skinShadow),
    robe: toon(PAL.robe),
    robeDeep: toon(PAL.robeDeep),
    sash: toon(PAL.sash),
    gold: toon(PAL.gold),
    goldDeep: toon(PAL.goldDeep),
    leopard: toon(PAL.leopard),
    leopardSpot: toon(PAL.leopardSpot),
    bone: toon(PAL.bone),
    wood: toon(PAL.wood),
    woodDeep: toon(PAL.woodDeep),
    stone: toon(PAL.stone),
    stoneDark: toon(PAL.stoneDark),
    stoneLite: toon(PAL.stoneLite),
    grass: toon(PAL.grass),
    grassDeep: toon(PAL.grassDeep),
    dirt: toon(PAL.dirt),
    sand: toon(PAL.sand),
    pumpkin: toon(PAL.pumpkin),
    pumpkinDeep: toon(PAL.pumpkinDeep),
    leaf: toon(PAL.leaf),
    iron: toon(PAL.iron),
    will: new THREE.MeshBasicMaterial({ color: PAL.will }),
    willHot: new THREE.MeshBasicMaterial({ color: PAL.willHot }),
    moon: new THREE.MeshBasicMaterial({ map: moonMap, fog: false }),
    water: waterMat,
    shadow: toon(PAL.shadow),
    rose: toon(PAL.rose),
    ghost: new THREE.MeshToonMaterial({
      color: PAL.ghost,
      gradientMap: ramp,
      transparent: true,
      opacity: 0.62,
      depthWrite: false,
    }),
    eyeWhite: new THREE.MeshBasicMaterial({ color: 0xf2efe4 }),
    eyeHole: toon(0x0a0808),
    ember: new THREE.MeshBasicMaterial({ color: 0xff8a30 }),
    glowGold: new THREE.MeshBasicMaterial({ color: 0xffe08a }),
    nemesGold: toon(0xc9a24a),
    nemesStripe: toon(0x1a1410),
    sigilGold: new THREE.MeshBasicMaterial({ color: 0xe8c86a }),
    sigilBlood: new THREE.MeshBasicMaterial({ color: 0x9a2430 }),
    sigilTeal: new THREE.MeshBasicMaterial({ color: 0x7ec8c0 }),
    mauve: toon(PAL.mauve),
    mauveDeep: toon(PAL.mauveDeep),
    mauveGlow: new THREE.MeshBasicMaterial({ color: 0xb080a8 }),
    watcher: new THREE.MeshBasicMaterial({
      color: 0x3a3248,
      fog: true,
    }),
    wispGold: new THREE.MeshBasicMaterial({
      color: 0xe8c86a,
      transparent: true,
      opacity: 0.82,
      depthWrite: false,
    }),
    wispTeal: new THREE.MeshBasicMaterial({
      color: 0x7ec8c0,
      transparent: true,
      opacity: 0.78,
      depthWrite: false,
    }),
    veil: new THREE.MeshBasicMaterial({
      color: 0x6a4868,
      transparent: true,
      opacity: 0.34,
      side: THREE.DoubleSide,
      depthWrite: false,
    }),
  };
}
