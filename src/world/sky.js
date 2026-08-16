import * as THREE from 'three';
import { PAL } from '../config.js';

export function createSky(scene, mats) {
  scene.background = new THREE.Color(PAL.sky);
  scene.fog = new THREE.FogExp2(0x161228, 0.0072);

  const hemi = new THREE.HemisphereLight(0x6a78a8, 0x2a2018, 0.85);
  scene.add(hemi);

  const moonLight = new THREE.DirectionalLight(0xe8e6ff, 1.55);
  moonLight.position.set(50, 90, -80);
  moonLight.castShadow = true;
  moonLight.shadow.mapSize.set(2048, 2048);
  moonLight.shadow.camera.near = 10;
  moonLight.shadow.camera.far = 280;
  moonLight.shadow.camera.left = -110;
  moonLight.shadow.camera.right = 110;
  moonLight.shadow.camera.top = 110;
  moonLight.shadow.camera.bottom = -110;
  moonLight.shadow.bias = -0.0008;
  scene.add(moonLight);

  const fill = new THREE.DirectionalLight(0x6a4088, 0.45);
  fill.position.set(-40, 20, 60);
  scene.add(fill);
  const rim = new THREE.DirectionalLight(0xffc878, 0.35);
  rim.position.set(-20, 12, 30);
  scene.add(rim);

  const moon = new THREE.Mesh(new THREE.SphereGeometry(34, 32, 24), mats.moon);
  moon.position.set(28, 46, -92);
  moon.rotation.z = 0.4;
  scene.add(moon);

  const halo = new THREE.Mesh(
    new THREE.SphereGeometry(44, 24, 16),
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
  const n = 700;
  const pos = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) {
    const a = Math.random() * Math.PI * 2;
    const b = Math.random() * 0.85 + 0.15;
    const r = 220;
    pos[i * 3] = Math.cos(a) * Math.cos(b) * r;
    pos[i * 3 + 1] = Math.sin(b) * r + 20;
    pos[i * 3 + 2] = Math.sin(a) * Math.cos(b) * r;
  }
  starGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const stars = new THREE.Points(
    starGeo,
    new THREE.PointsMaterial({ color: 0xe8e0c8, size: 0.55, fog: false, sizeAttenuation: true })
  );
  scene.add(stars);

  const penta = new THREE.Group();
  for (let i = 0; i < 5; i++) {
    const a = -Math.PI / 2 + (i * 4 * Math.PI) / 5;
    const x = Math.cos(a) * 18;
    const y = Math.sin(a) * 18;
    const dot = new THREE.Mesh(
      new THREE.SphereGeometry(0.35, 6, 5),
      new THREE.MeshBasicMaterial({ color: 0xe8d6a0, fog: false })
    );
    dot.position.set(x, y, 0);
    penta.add(dot);
  }
  penta.position.set(-40, 52, -80);
  penta.lookAt(0, 20, 0);
  scene.add(penta);

  return { moonLight, moon };
}
