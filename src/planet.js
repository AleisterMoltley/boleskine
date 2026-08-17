import * as THREE from 'three';
import { POI, WORLD } from './config.js';
import { heightAt } from './height.js';
import { fbm } from './math.js';

export const PLANET_R = 380;
export const MAP_SCALE = 118;
export const OCEAN_R = 375.6;

const _Y = new THREE.Vector3(0, 1, 0);
const _n = new THREE.Vector3();
const _rightA = new THREE.Vector3();
const _fwdA = new THREE.Vector3();
const _matA = new THREE.Matrix4();
const _rc = new THREE.Raycaster();
const _orig = new THREE.Vector3();
const _dir = new THREE.Vector3();

let _land = null;
let _grid = null;
let _gw = 0;
let _gh = 0;

export function setLandMesh(mesh, widthSegs, heightSegs) {
  _land = mesh;
  if (mesh) {
    mesh.updateMatrixWorld(true);
    mesh.geometry?.computeBoundingSphere();
    mesh.geometry?.computeBoundingBox();
    if (widthSegs && heightSegs && mesh.geometry?.attributes?.position) {
      const pos = mesh.geometry.attributes.position;
      _gw = widthSegs;
      _gh = heightSegs;
      _grid = new Float32Array(pos.count);
      for (let i = 0; i < pos.count; i++) {
        _grid[i] = Math.hypot(pos.getX(i), pos.getY(i), pos.getZ(i));
      }
    }
  }
}

function sampleGrid(lat, lon) {
  const v = ((Math.PI * 0.5 - lat) / Math.PI) * _gh;
  let u = (Math.PI - lon) / (Math.PI * 2);
  if (u < 0) u += 1;
  if (u >= 1) u -= 1;
  u *= _gw;
  const v0 = clamp(Math.floor(v), 0, _gh);
  const v1 = v0 >= _gh ? _gh : v0 + 1;
  const u0 = Math.floor(u);
  const u1 = u0 + 1;
  const fu = u - u0;
  const fv = clamp(v - v0, 0, 1);
  const at = (iy, ix) => _grid[iy * (_gw + 1) + Math.min(ix, _gw)];
  const r00 = at(v0, u0);
  const r10 = at(v0, u1);
  const r01 = at(v1, u0);
  const r11 = at(v1, u1);
  return r00 * (1 - fu) * (1 - fv) + r10 * fu * (1 - fv) + r01 * (1 - fu) * fv + r11 * fu * fv;
}

export function clamp(v, a, b) {
  return v < a ? a : v > b ? b : v;
}

export function mapToLatLon(x, z) {
  return {
    lon: x / MAP_SCALE,
    lat: clamp(z / MAP_SCALE, -1.22, 1.22),
  };
}

export function latLonToMap(lat, lon) {
  return { x: lon * MAP_SCALE, z: lat * MAP_SCALE };
}

export function latLonToPos(lat, lon, r) {
  const cl = Math.cos(lat);
  return new THREE.Vector3(r * cl * Math.cos(lon), r * Math.sin(lat), r * cl * Math.sin(lon));
}

export function posToLatLon(p) {
  _n.copy(p).normalize();
  return { lat: Math.asin(clamp(_n.y, -1, 1)), lon: Math.atan2(_n.z, _n.x) };
}

export function upOf(p, out = new THREE.Vector3()) {
  return out.copy(p).normalize();
}

export function tangentBasis(up) {
  const east = new THREE.Vector3().crossVectors(_Y, up);
  if (east.lengthSq() < 1e-8) east.set(1, 0, 0);
  east.normalize();
  const north = new THREE.Vector3().crossVectors(up, east).normalize();
  return { east, north };
}

export function wrapTangent(vel, up) {
  vel.addScaledVector(up, -vel.dot(up));
  return vel;
}

export function orientOnPlanet(obj, up, facing) {
  const { east, north } = tangentBasis(up);
  _fwdA.copy(north).multiplyScalar(Math.cos(facing)).addScaledVector(east, Math.sin(facing));
  if (_fwdA.lengthSq() < 1e-8) _fwdA.copy(north);
  _fwdA.normalize();
  _rightA.crossVectors(up, _fwdA).normalize();
  _fwdA.crossVectors(_rightA, up).normalize();
  _matA.makeBasis(_rightA, up, _fwdA);
  obj.quaternion.setFromRotationMatrix(_matA);
}

function ang(lat, lon, clat, clon) {
  const dlat = lat - clat;
  const dlon = lon - clon;
  return Math.hypot(dlat, dlon);
}

function canalDip(lat, lon) {
  let d = 0;
  const bands = [
    { a: 0.18, b: 1.1, w: 0.032 },
    { a: -0.32, b: -0.4, w: 0.026 },
    { a: 0.55, b: 2.2, w: 0.02 },
  ];
  for (const c of bands) {
    const t = lat * Math.cos(c.b) + lon * Math.sin(c.b) - c.a;
    d += Math.exp(-(t * t) / (c.w * c.w)) * 2.15;
  }
  return d;
}

function craterAt(lat, lon, clat, clon, inner, rim, depth, rimH) {
  const d = ang(lat, lon, clat, clon);
  if (d > rim * 1.35) return 0;
  if (d < inner) return -depth * (1 - (d / inner) * 0.12);
  const t = (d - inner) / Math.max(0.001, rim - inner);
  if (t < 1) return rimH * Math.sin(t * Math.PI);
  return 0;
}

function siteShape(lat, lon) {
  let d = 0;
  const cr = mapToLatLon(POI.crater.x, POI.crater.z);
  d += craterAt(lat, lon, cr.lat, cr.lon, 0.055, 0.12, 4.6, 2.8);
  const cy = mapToLatLon(POI.cydonia.x, POI.cydonia.z);
  const cd = ang(lat, lon, cy.lat, cy.lon);
  if (cd < 0.16) d += 2.4 * Math.exp(-(cd * cd) / 0.012);
  const ir = mapToLatLon(POI.iron.x, POI.iron.z);
  const id = ang(lat, lon, ir.lat, ir.lon);
  if (id < 0.07) d += 0.35 * (1 - id / 0.07);
  const se = mapToLatLon(POI.seal.x, POI.seal.z);
  const sd = ang(lat, lon, se.lat, se.lon);
  if (sd < 0.05) d += 0.25 * (1 - sd / 0.05);
  const mv = mapToLatLon(POI.mauve.x, POI.mauve.z);
  d += craterAt(lat, lon, mv.lat, mv.lon, 0.04, 0.09, 2.2, 0.9);
  const ni = mapToLatLon(POI.nisis.x, POI.nisis.z);
  const nd = ang(lat, lon, ni.lat, ni.lon);
  if (nd < 0.08) d += 0.55 * (1 - nd / 0.08);
  const ce = mapToLatLon(POI.cells.x, POI.cells.z);
  d += craterAt(lat, lon, ce.lat, ce.lon, 0.038, 0.085, 2.8, 1.4);
  return d;
}

export function groundR(lat, lon) {
  const x = lon * MAP_SCALE;
  const z = lat * MAP_SCALE;
  const polar = Math.abs(lat) > 1.02;
  const inland = Math.hypot(x, z) < WORLD.islandR + 18;
  let r;
  if (inland) {
    const h = heightAt(x, z);
    if (h < WORLD.waterY + 0.12) r = OCEAN_R + 0.18;
    else r = PLANET_R + (h - 6.15);
  } else {
    const swell = Math.sin(lat * 2.2 + lon * 1.3) * 0.55 + Math.sin(lat * 5.1 - lon * 3.4) * 0.32;
    if (swell < -0.22) r = OCEAN_R + 0.12;
    else r = PLANET_R + swell * 4.2 + (fbm(lat * 2.1 + 2, lon * 2.1) - 0.5) * 3.4;
  }
  r -= canalDip(lat, lon);
  r += siteShape(lat, lon);
  if (polar) r += 1.35;
  return r;
}

export function groundRAt(p) {
  const { lat, lon } = posToLatLon(p);
  return groundR(lat, lon);
}

export function meshRadius(pos) {
  if (_grid) {
    const { lat, lon } = posToLatLon(pos);
    return sampleGrid(lat, lon) - 0.05;
  }
  if (_land) {
    _n.copy(pos).normalize();
    _orig.copy(_n).multiplyScalar(PLANET_R + 90);
    _dir.copy(_n).negate();
    _rc.set(_orig, _dir);
    _rc.near = 0.1;
    _rc.far = 170;
    const hits = _rc.intersectObject(_land, false);
    if (hits[0]) return hits[0].point.length();
  }
  return groundRAt(pos);
}

export function mapToPos(x, z, extra = 0) {
  const { lat, lon } = mapToLatLon(x, z);
  return latLonToPos(lat, lon, groundR(lat, lon) + extra);
}

export function posToMap(p) {
  const { lat, lon } = posToLatLon(p);
  return latLonToMap(lat, lon);
}

export function isDustPos(p) {
  return meshRadius(p) < OCEAN_R + 0.55;
}

export function isWaterPos(p) {
  return isDustPos(p);
}

export function keepOutside(pos, minH = 1.6) {
  const surf = meshRadius(pos);
  const len = pos.length() || 1;
  if (len < surf + minH) {
    pos.multiplyScalar((surf + minH) / len);
    return true;
  }
  return false;
}

export function plantOnMesh(pos) {
  const surf = meshRadius(pos);
  const len = pos.length() || 1;
  pos.multiplyScalar(surf / len);
  return pos;
}
