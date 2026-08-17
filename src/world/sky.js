import * as THREE from 'three';
import { PLANET_R } from '../planet.js';

export function createSky(scene, mats) {
  scene.background = new THREE.Color(0x2a1410);
  scene.fog = new THREE.FogExp2(0x6a3828, 0.0036);

  const hemi = new THREE.HemisphereLight(0xd47850, 0x3a1810, 0.88);
  scene.add(hemi);

  const moonLight = new THREE.DirectionalLight(0xffd0a0, 1.22);
  moonLight.castShadow = true;
  moonLight.shadow.mapSize.set(2048, 2048);
  moonLight.shadow.camera.near = 10;
  moonLight.shadow.camera.far = 520;
  moonLight.shadow.camera.left = -110;
  moonLight.shadow.camera.right = 110;
  moonLight.shadow.camera.top = 110;
  moonLight.shadow.camera.bottom = -110;
  moonLight.shadow.bias = -0.0008;
  scene.add(moonLight);
  scene.add(moonLight.target);

  const fill = new THREE.DirectionalLight(0x8a3040, 0.34);
  fill.position.set(-80, 40, 60);
  scene.add(fill);

  const sun = new THREE.Mesh(
    new THREE.SphereGeometry(3.2, 12, 10),
    new THREE.MeshBasicMaterial({ color: 0xffc878, fog: false })
  );
  sun.position.set(PLANET_R + 220, 90, -160);
  scene.add(sun);

  const phobos = new THREE.Mesh(new THREE.DodecahedronGeometry(5.4, 0), mats.sand);
  phobos.position.set(PLANET_R + 95, 42, -70);
  scene.add(phobos);

  const deimos = new THREE.Mesh(new THREE.DodecahedronGeometry(2.4, 0), mats.stone);
  deimos.position.set(-PLANET_R - 140, -28, 110);
  scene.add(deimos);

  const moon = phobos;

  const starGeo = new THREE.BufferGeometry();
  const n = 1400;
  const pos = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) {
    const a = Math.random() * Math.PI * 2;
    const b = Math.acos(2 * Math.random() - 1);
    const r = 1100;
    pos[i * 3] = r * Math.sin(b) * Math.cos(a);
    pos[i * 3 + 1] = r * Math.cos(b);
    pos[i * 3 + 2] = r * Math.sin(b) * Math.sin(a);
  }
  starGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  scene.add(
    new THREE.Points(
      starGeo,
      new THREE.PointsMaterial({ color: 0xffe8d0, size: 0.85, fog: false, sizeAttenuation: true })
    )
  );

  return { moonLight, moon, phobos, deimos, sun };
}
