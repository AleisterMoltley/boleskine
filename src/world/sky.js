import * as THREE from 'three';
import { POI } from '../config.js';
import { mapToPos, PLANET_R, tangentBasis, upOf } from '../planet.js';

function skyCanvas() {
  const c = document.createElement('canvas');
  c.width = 512;
  c.height = 256;
  const g = c.getContext('2d');
  const grd = g.createLinearGradient(0, c.height, 0, 0);
  grd.addColorStop(0, '#8a3848');
  grd.addColorStop(0.22, '#5a2848');
  grd.addColorStop(0.45, '#2e2448');
  grd.addColorStop(0.72, '#1c1834');
  grd.addColorStop(1, '#16122c');
  g.fillStyle = grd;
  g.fillRect(0, 0, c.width, c.height);
  g.globalAlpha = 0.22;
  for (let i = 0; i < 18; i++) {
    g.fillStyle = i % 2 ? '#6a3058' : '#3a2858';
    g.beginPath();
    g.ellipse(
      (Math.sin(i * 1.7) * 0.5 + 0.5) * c.width,
      c.height * (0.22 + (i % 5) * 0.08),
      80 + (i % 4) * 30,
      14 + (i % 3) * 8,
      i * 0.4,
      0,
      Math.PI * 2
    );
    g.fill();
  }
  g.globalAlpha = 1;
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.needsUpdate = true;
  return tex;
}

function moonFaceTex() {
  const c = document.createElement('canvas');
  c.width = 256;
  c.height = 256;
  const g = c.getContext('2d');
  g.clearRect(0, 0, 256, 256);
  g.fillStyle = '#0c0808';
  g.beginPath();
  g.ellipse(88, 108, 22, 30, 0, 0, Math.PI * 2);
  g.ellipse(168, 108, 22, 30, 0, 0, Math.PI * 2);
  g.fill();
  g.lineWidth = 7;
  g.strokeStyle = '#0c0808';
  g.beginPath();
  g.arc(128, 148, 38, 0.2, Math.PI - 0.2);
  g.stroke();
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.needsUpdate = true;
  return tex;
}

function watchingMoon(mats) {
  const g = new THREE.Group();
  const disk = new THREE.Mesh(new THREE.SphereGeometry(20, 28, 20), mats.moon);
  const halo = new THREE.Mesh(
    new THREE.SphereGeometry(24, 16, 12),
    new THREE.MeshBasicMaterial({
      color: 0xffe0a8,
      transparent: true,
      opacity: 0.28,
      depthWrite: false,
      fog: false,
    })
  );
  const bloom = new THREE.Mesh(
    new THREE.SphereGeometry(36, 16, 12),
    new THREE.MeshBasicMaterial({
      color: 0xc080a0,
      transparent: true,
      opacity: 0.1,
      depthWrite: false,
      fog: false,
    })
  );
  const face = new THREE.Mesh(
    new THREE.CircleGeometry(16.5, 24),
    new THREE.MeshBasicMaterial({
      map: moonFaceTex(),
      transparent: true,
      depthWrite: false,
      fog: false,
    })
  );
  face.position.z = -19.6;
  face.rotation.y = Math.PI;
  g.add(disk, bloom, halo, face);
  return g;
}

export function createSky(scene, mats) {
  const _t = new THREE.Vector3();
  const _u = new THREE.Vector3();
  const _e = new THREE.Vector3();
  const _n = new THREE.Vector3();

  scene.background = new THREE.Color(0x1c1830);
  scene.fog = new THREE.FogExp2(0x4a3048, 0.003);

  const dome = new THREE.Mesh(
    new THREE.SphereGeometry(1380, 32, 20),
    new THREE.MeshBasicMaterial({ map: skyCanvas(), side: THREE.BackSide, fog: false, depthWrite: false, color: 0xffffff })
  );
  scene.add(dome);

  const hemi = new THREE.HemisphereLight(0x8a7098, 0x4a2c22, 0.88);
  scene.add(hemi);

  const moon = watchingMoon(mats);
  const manor = mapToPos(POI.manor.x, POI.manor.z);
  const upM = upOf(manor);
  const basis = tangentBasis(upM);
  moon.position.copy(manor).addScaledVector(upM, 38).addScaledVector(basis.north, 18).addScaledVector(basis.east, -6);
  function faceMoon(at) {
    _t.copy(at);
    _u.copy(moon.position).sub(_t);
    const len = _u.length() || 1;
    _u.multiplyScalar(1 / len);
    upOf(at, _e);
    _n.copy(_e).addScaledVector(_u, -_e.dot(_u));
    if (_n.lengthSq() < 1e-4) {
      const tb = tangentBasis(_e);
      _n.copy(tb.east);
    }
    _n.normalize();
    moon.up.copy(_n);
    moon.lookAt(_t);
  }
  faceMoon(mapToPos(POI.spawn.x, POI.spawn.z));
  scene.add(moon);

  const moonLight = new THREE.DirectionalLight(0xffe4b8, 1.18);
  moonLight.castShadow = true;
  moonLight.shadow.mapSize.set(2048, 2048);
  moonLight.shadow.camera.near = 10;
  moonLight.shadow.camera.far = 520;
  moonLight.shadow.camera.left = -90;
  moonLight.shadow.camera.right = 90;
  moonLight.shadow.camera.top = 90;
  moonLight.shadow.camera.bottom = -90;
  moonLight.shadow.bias = -0.0008;
  moonLight.position.copy(moon.position);
  scene.add(moonLight);
  scene.add(moonLight.target);

  const fill = new THREE.DirectionalLight(0x5a88b0, 0.34);
  fill.position.copy(manor).addScaledVector(upM, 40).addScaledVector(basis.north, -50).addScaledVector(basis.east, 30);
  scene.add(fill);

  const under = new THREE.HemisphereLight(0x000000, 0x5a2030, 0.2);
  scene.add(under);

  const dusk = new THREE.Mesh(
    new THREE.SphereGeometry(6.5, 12, 10),
    new THREE.MeshBasicMaterial({ color: 0x8a3028, fog: false })
  );
  dusk.position.copy(manor).addScaledVector(upM, 18).addScaledVector(basis.north, -80).addScaledVector(basis.east, 40);
  scene.add(dusk);

  const phobos = moon;
  const deimos = new THREE.Mesh(new THREE.DodecahedronGeometry(3.2, 0), mats.stone);
  deimos.position.copy(manor).addScaledVector(upM, 110).addScaledVector(basis.east, -90).addScaledVector(basis.north, -40);
  scene.add(deimos);

  const starGeo = new THREE.BufferGeometry();
  const n = 1800;
  const pos = new Float32Array(n * 3);
  const col = new Float32Array(n * 3);
  const starCols = [
    [1, 0.92, 0.82],
    [0.85, 0.9, 1],
    [1, 0.72, 0.55],
    [0.72, 0.85, 0.82],
  ];
  for (let i = 0; i < n; i++) {
    const a = Math.random() * Math.PI * 2;
    const b = Math.acos(2 * Math.random() - 1);
    const r = 1200;
    pos[i * 3] = r * Math.sin(b) * Math.cos(a);
    pos[i * 3 + 1] = r * Math.cos(b);
    pos[i * 3 + 2] = r * Math.sin(b) * Math.sin(a);
    const c = starCols[i % starCols.length];
    col[i * 3] = c[0];
    col[i * 3 + 1] = c[1];
    col[i * 3 + 2] = c[2];
  }
  starGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  starGeo.setAttribute('color', new THREE.BufferAttribute(col, 3));
  scene.add(
    new THREE.Points(
      starGeo,
      new THREE.PointsMaterial({
        vertexColors: true,
        size: 1.15,
        fog: false,
        sizeAttenuation: true,
        transparent: true,
        opacity: 0.92,
      })
    )
  );

  const sirius = new THREE.Mesh(
    new THREE.SphereGeometry(1.55, 8, 6),
    new THREE.MeshBasicMaterial({ color: 0xd8e8ff, fog: false })
  );
  sirius.position.copy(manor).addScaledVector(upM, 95).addScaledVector(basis.east, 55).addScaledVector(basis.north, 20);
  scene.add(sirius);

  const traces = new THREE.Group();
  const goldLine = new THREE.LineBasicMaterial({
    color: 0xe8c86a,
    transparent: true,
    opacity: 0.38,
    fog: false,
  });
  function skyPoly(pts) {
    const g = new THREE.BufferGeometry().setFromPoints(pts);
    traces.add(new THREE.LineLoop(g, goldLine));
  }
  const skyUp = sirius.position.clone().normalize();
  const skyE = new THREE.Vector3().crossVectors(new THREE.Vector3(0, 1, 0), skyUp).normalize();
  const skyN = new THREE.Vector3().crossVectors(skyUp, skyE).normalize();
  const hex = [];
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2;
    hex.push(
      skyUp
        .clone()
        .multiplyScalar(1180)
        .addScaledVector(skyE, Math.cos(a) * 90)
        .addScaledVector(skyN, Math.sin(a) * 90)
    );
  }
  skyPoly(hex);
  const vesica = [];
  for (let i = 0; i < 20; i++) {
    const a = (i / 20) * Math.PI * 2;
    vesica.push(
      skyUp
        .clone()
        .multiplyScalar(1180)
        .addScaledVector(skyE, Math.cos(a) * 42 - 18)
        .addScaledVector(skyN, Math.sin(a) * 42)
    );
  }
  skyPoly(vesica);
  scene.add(traces);

  const moteN = 140;
  const moteGeo = new THREE.BufferGeometry();
  const motePos = new Float32Array(moteN * 3);
  const moteCol = new Float32Array(moteN * 3);
  const moteOff = [];
  const moteTints = [
    [1, 0.86, 0.55],
    [0.85, 0.55, 0.75],
    [0.55, 0.82, 0.78],
  ];
  for (let i = 0; i < moteN; i++) {
    const a = Math.random() * Math.PI * 2;
    const b = Math.acos(2 * Math.random() - 1);
    const r = 1.8 + Math.random() * 12;
    moteOff.push(r * Math.sin(b) * Math.cos(a), r * Math.cos(b), r * Math.sin(b) * Math.sin(a));
    const c = moteTints[i % 3];
    moteCol[i * 3] = c[0];
    moteCol[i * 3 + 1] = c[1];
    moteCol[i * 3 + 2] = c[2];
  }
  moteGeo.setAttribute('position', new THREE.BufferAttribute(motePos, 3));
  moteGeo.setAttribute('color', new THREE.BufferAttribute(moteCol, 3));
  const motes = new THREE.Points(
    moteGeo,
    new THREE.PointsMaterial({
      vertexColors: true,
      size: 0.2,
      transparent: true,
      opacity: 0.55,
      depthWrite: false,
      sizeAttenuation: true,
    })
  );
  scene.add(motes);

  function tick(t, target) {
    deimos.rotation.y = t * 0.05;
    sirius.scale.setScalar(1 + Math.sin(t * 2.2) * 0.12);
    traces.rotation.y = t * 0.002;
    skyApi.eclipse = Math.sin(t * 0.07) > 0.91 ? 0.7 : 1;
    if (target) {
      faceMoon(target);
      moon.rotateZ(Math.sin(t * 0.05) * 0.04);
      moonLight.position.copy(moon.position);
      moonLight.target.position.copy(_t);
      moonLight.target.updateMatrixWorld();
      upOf(_t, _u);
      const tb = tangentBasis(_u);
      _e.copy(tb.east);
      _n.copy(tb.north);
      const arr = motes.geometry.attributes.position.array;
      for (let i = 0; i < moteN; i++) {
        const ox = moteOff[i * 3];
        const oy = moteOff[i * 3 + 1];
        const oz = moteOff[i * 3 + 2];
        const ca = Math.cos(t * 0.11 + i * 0.07);
        const sa = Math.sin(t * 0.11 + i * 0.07);
        const x = ox * ca - oz * sa;
        const z = ox * sa + oz * ca;
        arr[i * 3] = _t.x + _e.x * x + _u.x * (oy + Math.sin(t * 0.6 + i) * 0.25) + _n.x * z;
        arr[i * 3 + 1] = _t.y + _e.y * x + _u.y * (oy + Math.sin(t * 0.6 + i) * 0.25) + _n.y * z;
        arr[i * 3 + 2] = _t.z + _e.z * x + _u.z * (oy + Math.sin(t * 0.6 + i) * 0.25) + _n.z * z;
      }
      motes.geometry.attributes.position.needsUpdate = true;
    }
  }

  const skyApi = { moonLight, moon, phobos, deimos, sun: dusk, hemi, fill, dome, tick, eclipse: 1 };
  return skyApi;
}
