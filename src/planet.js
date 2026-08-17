import * as THREE from 'three';
import { WORLD } from './config.js';
import { heightAt } from './height.js';
import { fbm } from './math.js';

export const PLANET_R = 90;
export const OCEAN_R = 88.55;

const _Y = new THREE.Vector3(0, 1, 0);
const _n = new THREE.Vector3();
const _rightA = new THREE.Vector3();
const _fwdA = new THREE.Vector3();
const _matA = new THREE.Matrix4();

export function clamp(v, a, b) {
  return v < a ? a : v > b ? b : v;
}

export function mapToLatLon(x, z) {
  return {
    lon: x / PLANET_R,
    lat: clamp(z / PLANET_R, -1.18, 1.18),
  };
}

export function latLonToMap(lat, lon) {
  return { x: lon * PLANET_R, z: lat * PLANET_R };
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

export function groundR(lat, lon) {
  const x = lon * PLANET_R;
  const z = lat * PLANET_R;
  const inland = Math.hypot(x, z) < WORLD.islandR + 16;
  if (inland) {
    const h = heightAt(x, z);
    if (h < WORLD.waterY + 0.12) return OCEAN_R + 0.16;
    return PLANET_R + (h - 6.15);
  }
  const swell = Math.sin(lat * 2.2 + lon * 1.3) * 0.45 + Math.sin(lat * 5.1 - lon * 3.4) * 0.28;
  if (swell < -0.18) return OCEAN_R + 0.12;
  return PLANET_R + swell * 2.6 + (fbm(lat * 2.4 + 2, lon * 2.4) - 0.5) * 2.2;
}

export function groundRAt(p) {
  const { lat, lon } = posToLatLon(p);
  return groundR(lat, lon);
}

export function mapToPos(x, z, extra = 0) {
  const { lat, lon } = mapToLatLon(x, z);
  return latLonToPos(lat, lon, groundR(lat, lon) + extra);
}

export function posToMap(p) {
  const { lat, lon } = posToLatLon(p);
  return latLonToMap(lat, lon);
}

export function isWaterPos(p) {
  return groundRAt(p) < OCEAN_R + 0.45;
}

export function surfaceDistMap(ax, az, bx, bz) {
  const dx = ax - bx;
  let dz = az - bz;
  const wrap = Math.PI * 2 * PLANET_R;
  let dl = ax - bx;
  if (dl > wrap * 0.5) dl -= wrap;
  if (dl < -wrap * 0.5) dl += wrap;
  return Math.hypot(dl, dz);
}

export function keepOutside(pos, minH = 1.6) {
  const surf = groundRAt(pos);
  const len = pos.length() || 1;
  if (len < surf + minH) {
    pos.multiplyScalar((surf + minH) / len);
    return true;
  }
  return false;
}
