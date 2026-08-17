import * as THREE from 'three';
import { POI } from './config.js';

const BASE = {
  fog: 0x4a3048,
  fogD: 0.003,
  hemiSky: 0x8a7098,
  hemiGnd: 0x4a2c22,
  hemiI: 0.88,
  moonI: 1.18,
  fill: 0x5a88b0,
  fillI: 0.34,
  exp: 1.3,
  wind: 0.03,
  drone: 36.7,
  droneHi: 73.4,
  dome: 0xffffff,
};

const PRESETS = {
  manor: {
    fog: 0x5a3838,
    fogD: 0.0025,
    hemiSky: 0xb89880,
    hemiGnd: 0x5a3020,
    hemiI: 0.98,
    moonI: 1.28,
    fill: 0x8a6050,
    fillI: 0.24,
    dome: 0xffe8dc,
    exp: 1.34,
    wind: 0.016,
    drone: 41,
    droneHi: 82,
  },
  plaza: {
    fog: 0x3a3858,
    fogD: 0.0022,
    hemiSky: 0x7888b0,
    hemiGnd: 0x3a2a28,
    hemiI: 0.92,
    moonI: 1.22,
    fill: 0x5aa0a0,
    fillI: 0.38,
    dome: 0xd4dcff,
    exp: 1.32,
    wind: 0.022,
    drone: 55,
    droneHi: 82.5,
  },
  wood: {
    fog: 0x241820,
    fogD: 0.0044,
    hemiSky: 0x4a5848,
    hemiGnd: 0x221610,
    hemiI: 0.72,
    moonI: 0.92,
    fill: 0x3a5048,
    fillI: 0.2,
    dome: 0x6a7868,
    exp: 1.16,
    wind: 0.055,
    drone: 32,
    droneHi: 48,
  },
  village: {
    fog: 0x5a3028,
    fogD: 0.0028,
    hemiSky: 0xb07050,
    hemiGnd: 0x4a2418,
    hemiI: 0.94,
    moonI: 1.2,
    fill: 0xc07040,
    fillI: 0.28,
    dome: 0xffc8a0,
    exp: 1.3,
    wind: 0.024,
    drone: 44,
    droneHi: 66,
  },
  kirk: {
    fog: 0x3a4048,
    fogD: 0.0032,
    hemiSky: 0x708090,
    hemiGnd: 0x2a2828,
    hemiI: 0.8,
    moonI: 1.08,
    fill: 0x607888,
    fillI: 0.3,
    dome: 0xb0c0c8,
    exp: 1.22,
    wind: 0.02,
    drone: 36,
    droneHi: 54,
  },
  abbey: {
    fog: 0x403830,
    fogD: 0.003,
    hemiSky: 0x887868,
    hemiGnd: 0x322820,
    hemiI: 0.84,
    moonI: 1.1,
    fill: 0x706050,
    fillI: 0.22,
    dome: 0xd0c4b0,
    exp: 1.24,
    wind: 0.018,
    drone: 38,
    droneHi: 57,
  },
  pier: {
    fog: 0x4a2820,
    fogD: 0.0036,
    hemiSky: 0x805040,
    hemiGnd: 0x2a1610,
    hemiI: 0.78,
    moonI: 1.05,
    fill: 0x6a4030,
    fillI: 0.2,
    dome: 0xc08070,
    exp: 1.2,
    wind: 0.048,
    drone: 33,
    droneHi: 49,
  },
  far: {
    fog: 0x382848,
    fogD: 0.002,
    hemiSky: 0x685888,
    hemiGnd: 0x241828,
    hemiI: 0.76,
    moonI: 1.32,
    fill: 0x7060a0,
    fillI: 0.42,
    dome: 0xc0a8e0,
    exp: 1.24,
    wind: 0.04,
    drone: 29,
    droneHi: 87,
  },
  polar: {
    fog: 0x687088,
    fogD: 0.0016,
    hemiSky: 0xa8b8c8,
    hemiGnd: 0x484850,
    hemiI: 1.02,
    moonI: 1.36,
    fill: 0x88a0b8,
    fillI: 0.36,
    dome: 0xd8e4f0,
    exp: 1.38,
    wind: 0.035,
    drone: 48,
    droneHi: 96,
  },
};

const ZONES = [
  { key: 'manor', x: POI.manor.x, z: POI.manor.z, r: 28 },
  { key: 'manor', x: POI.spawn.x, z: POI.spawn.z, r: 18 },
  { key: 'plaza', x: POI.plaza.x, z: POI.plaza.z, r: 32 },
  { key: 'plaza', x: POI.fullness.x, z: POI.fullness.z, r: 16 },
  { key: 'wood', x: POI.wood.x, z: POI.wood.z, r: 36 },
  { key: 'wood', x: POI.hollow.x, z: POI.hollow.z, r: 18 },
  { key: 'village', x: POI.village.x, z: POI.village.z, r: 32 },
  { key: 'kirk', x: POI.kirk.x, z: POI.kirk.z, r: 28 },
  { key: 'kirk', x: POI.willow.x, z: POI.willow.z, r: 14 },
  { key: 'abbey', x: POI.abbey.x, z: POI.abbey.z, r: 26 },
  { key: 'pier', x: POI.pier.x, z: POI.pier.z, r: 22 },
  { key: 'far', x: POI.mauve.x, z: POI.mauve.z, r: 40 },
  { key: 'far', x: POI.iron.x, z: POI.iron.z, r: 28 },
  { key: 'far', x: POI.seal.x, z: POI.seal.z, r: 24 },
  { key: 'polar', x: POI.polar.x, z: POI.polar.z, r: 30 },
  { key: 'polar', x: POI.stargaze.x, z: POI.stargaze.z, r: 20 },
];

export const ARRIVALS = {
  'Boleskine House': 'Das Haus hält, was ich ihm aufgeladen habe.',
  'Der Hof': 'Sieben Sockel. Der Kreis wartet, ohne zu drängen.',
  'Krumme Kirche': 'Hier hat niemand gebeichtet. Deshalb steht sie schief.',
  'Verdrehter Wald': 'Die Stämme merken sich den letzten, der umkehrte.',
  'Kürbisdorf': 'Wärme, die sich für Heimat hält.',
  'Die Abtei': 'Eine Regel, die ich selbst nicht hielt.',
  'Der Staubkai': 'Kein Wasser. Nur die Idee eines Ufers.',
  'Der Eisenkreis': 'Fünf Kanten. Weiter draußen zählt niemand mit.',
  'Die Schwelle': 'Die Farbe hält nicht still. Bleib, bis sie nachgibt.',
  'Die Weiße Kappe': 'Kälte hat eine Regel. Sie ist älter als ich.',
};

const _fog = new THREE.Color();
const _sky = new THREE.Color();
const _gnd = new THREE.Color();
const _fill = new THREE.Color();
const _b = new THREE.Color();
const _accFog = new THREE.Color();
const _accSky = new THREE.Color();
const _accGnd = new THREE.Color();
const _accFill = new THREE.Color();
const _dome = new THREE.Color(0xffffff);
const _accDome = new THREE.Color();

function mixPreset(x, z) {
  const out = {
    fogD: BASE.fogD * 0.35,
    hemiI: BASE.hemiI * 0.35,
    moonI: BASE.moonI * 0.35,
    fillI: BASE.fillI * 0.35,
    exp: BASE.exp * 0.35,
    wind: BASE.wind * 0.35,
    drone: BASE.drone * 0.35,
    droneHi: BASE.droneHi * 0.35,
  };
  let wSum = 0.35;
  _accFog.set(BASE.fog).multiplyScalar(0.35);
  _accSky.set(BASE.hemiSky).multiplyScalar(0.35);
  _accGnd.set(BASE.hemiGnd).multiplyScalar(0.35);
  _accFill.set(BASE.fill).multiplyScalar(0.35);
  _accDome.set(BASE.dome).multiplyScalar(0.35);

  for (const z0 of ZONES) {
    const d = Math.hypot(x - z0.x, z - z0.z);
    if (d > z0.r) continue;
    const w = 1 - d / z0.r;
    const p = PRESETS[z0.key];
    wSum += w;
    out.fogD += p.fogD * w;
    out.hemiI += p.hemiI * w;
    out.moonI += p.moonI * w;
    out.fillI += p.fillI * w;
    out.exp += p.exp * w;
    out.wind += p.wind * w;
    out.drone += p.drone * w;
    out.droneHi += p.droneHi * w;
    _accFog.add(_b.set(p.fog).multiplyScalar(w));
    _accSky.add(_b.set(p.hemiSky).multiplyScalar(w));
    _accGnd.add(_b.set(p.hemiGnd).multiplyScalar(w));
    _accFill.add(_b.set(p.fill).multiplyScalar(w));
    _accDome.add(_b.set(p.dome || 0xffffff).multiplyScalar(w));
  }
  const inv = 1 / wSum;
  out.fogD *= inv;
  out.hemiI *= inv;
  out.moonI *= inv;
  out.fillI *= inv;
  out.exp *= inv;
  out.wind *= inv;
  out.drone *= inv;
  out.droneHi *= inv;
  out._fog = _accFog.multiplyScalar(inv);
  out._hemiSky = _accSky.multiplyScalar(inv);
  out._hemiGnd = _accGnd.multiplyScalar(inv);
  out._fill = _accFill.multiplyScalar(inv);
  out._dome = _accDome.multiplyScalar(inv);
  return out;
}

export function createMood(scene, sky, renderer) {
  const cur = {
    fogD: BASE.fogD,
    hemiI: BASE.hemiI,
    moonI: BASE.moonI,
    fillI: BASE.fillI,
    exp: BASE.exp,
    wind: BASE.wind,
    drone: BASE.drone,
    droneHi: BASE.droneHi,
  };
  _fog.set(BASE.fog);
  _sky.set(BASE.hemiSky);
  _gnd.set(BASE.hemiGnd);
  _fill.set(BASE.fill);

  function tick(x, z, dt, eclipse = 1) {
    const want = mixPreset(x, z);
    const k = 1 - Math.exp(-1.8 * dt);
    cur.fogD += (want.fogD - cur.fogD) * k;
    cur.hemiI += (want.hemiI - cur.hemiI) * k;
    cur.moonI += (want.moonI - cur.moonI) * k;
    cur.fillI += (want.fillI - cur.fillI) * k;
    cur.exp += (want.exp - cur.exp) * k;
    cur.wind += (want.wind - cur.wind) * k;
    cur.drone += (want.drone - cur.drone) * k;
    cur.droneHi += (want.droneHi - cur.droneHi) * k;
    _fog.lerp(want._fog, k);
    _sky.lerp(want._hemiSky, k);
    _gnd.lerp(want._hemiGnd, k);
    _fill.lerp(want._fill, k);
    _dome.lerp(want._dome, k);

    if (scene.fog) {
      scene.fog.color.copy(_fog);
      scene.fog.density = cur.fogD + Math.sin(performance.now() * 0.00013) * 0.00035;
    }
    sky.hemi.color.copy(_sky);
    sky.hemi.groundColor.copy(_gnd);
    sky.hemi.intensity = cur.hemiI;
    sky.moonLight.intensity = cur.moonI * eclipse;
    sky.moonLight.color.setHex(0xffe4b8);
    if (sky.fill) {
      sky.fill.color.copy(_fill);
      sky.fill.intensity = cur.fillI;
    }
    if (sky.dome?.material?.color) sky.dome.material.color.copy(_dome);
    renderer.toneMappingExposure = cur.exp;
    return cur;
  }

  return { tick };
}
