import * as THREE from 'three';
import { PAL } from '../config.js';
import { PLANET_R } from '../planet.js';

export function createSky(scene, mats) {
  scene.background = new THREE.Color(PAL.sky);
  scene.fog = new THREE.FogExp2(0x12101c, 0.012);

  const hemi = new THREE.HemisphereLight(0x6a78a8, 0x1a1210, 0.7);
  scene.add(hemi);

  const moonLight = new THREE.DirectionalLight(0xe8e6ff, 1.35);
  moonLight.castShadow = true;
  moonLight.shadow.mapSize.set(2048, 2048);
  moonLight.shadow.camera.near = 8;
  moonLight.shadow.camera.far = 160;
  moonLight.shadow.camera.left = -48;
  moonLight.shadow.camera.right = 48;
  moonLight.shadow.camera.top = 48;
  moonLight.shadow.camera.bottom = -48;
  moonLight.shadow.bias = -0.0009;
  scene.add(moonLight);
  scene.add(moonLight.target);

  const fill = new THREE.DirectionalLight(0x6a4088, 0.35);
  fill.position.set(-40, 20, 60);
  scene.add(fill);

  const moon = new THREE.Mesh(new THREE.SphereGeometry(22, 28, 20), mats.moon);
  moon.position.set(PLANET_R + 110, 70, -90);
  scene.add(moon);

  const halo = new THREE.Mesh(
    new THREE.SphereGeometry(28, 20, 14),
    new THREE.MeshBasicMaterial({
      color: 0xe8d6a0,
      transparent: true,
      opacity: 0.07,
      depthWrite: false,
      fog: false,
    })
  );
  halo.position.copy(moon.position);
  scene.add(halo);

  const starGeo = new THREE.BufferGeometry();
  const n = 900;
  const pos = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) {
    const a = Math.random() * Math.PI * 2;
    const b = Math.acos(2 * Math.random() - 1);
    const r = 240;
    pos[i * 3] = r * Math.sin(b) * Math.cos(a);
    pos[i * 3 + 1] = r * Math.cos(b);
    pos[i * 3 + 2] = r * Math.sin(b) * Math.sin(a);
  }
  starGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  scene.add(
    new THREE.Points(
      starGeo,
      new THREE.PointsMaterial({ color: 0xe8e0c8, size: 0.55, fog: false, sizeAttenuation: true })
    )
  );

  return { moonLight, moon };
}
