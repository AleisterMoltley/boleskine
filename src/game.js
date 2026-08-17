import * as THREE from 'three';
import { POI, RELICS, WORLD } from './config.js';
import { ENDING, MEMORIES } from './lore.js';
import { createInput } from './input.js';
import { createMaterials } from './materials.js';
import { createObstacles } from './obstacles.js';
import { createPawn, resetPawn, stepPawn } from './controller.js';
import { createChaseCam } from './camera.js';
import { makeCrowley } from './player.js';
import { createSky } from './world/sky.js';
import { createTerrain, rippleWater } from './world/terrain.js';
import { populate } from './world/props.js';
import { createNpcs } from './npcs.js';
import { createCombat } from './combat.js';
import { createRelics } from './relics.js';
import { createAudio } from './audio.js';
import { createHud } from './hud.js';
import { dist2 } from './math.js';
import { mapToPos, setLandMesh, tangentBasis, upOf } from './planet.js';
const STEP = 1 / 60;

function placeName(x, z) {
  let best = 'Mars';
  let bd = 52 * 52;
  for (const k of Object.keys(POI)) {
    const p = POI[k];
    const d = dist2(x, z, p.x, p.z);
    if (d < bd) {
      bd = d;
      best = p.name;
    }
  }
  return best;
}

export function boot(canvas) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.75));
  renderer.setSize(innerWidth, innerHeight);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.28;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(62, innerWidth / innerHeight, 0.25, 1600);
  const _camFwd = new THREE.Vector3();

  const mats = createMaterials();
  const sky = createSky(scene, mats);
  const terrain = createTerrain(scene, mats);
  setLandMesh(terrain.mesh, terrain.widthSegs, terrain.heightSegs);
  const obstacles = createObstacles();
  const world = populate(scene, mats, obstacles);
  const npcs = createNpcs(scene, mats);
  const relics = createRelics(scene, mats);
  const combat = createCombat(scene, mats);
  const crowley = makeCrowley(mats);
  scene.add(crowley.root);

  const pawn = createPawn(POI.spawn.x, POI.spawn.z);
  pawn.facing = Math.PI;
  pawn.yaw = Math.PI;
  const cam = createChaseCam(camera);
  cam.snap(pawn, obstacles);
  const input = createInput(canvas);
  const audio = createAudio();
  const hud = createHud();

  const fx = new THREE.Group();
  scene.add(fx);
  const gate = new THREE.Mesh(
    new THREE.CylinderGeometry(0.55, 1.4, 28, 10, 1, true),
    new THREE.MeshBasicMaterial({
      color: 0xe8d6a0,
      transparent: true,
      opacity: 0,
      side: THREE.DoubleSide,
      depthWrite: false,
    })
  );
  const gatePos = mapToPos(POI.plaza.x, POI.plaza.z, 8);
  gate.position.copy(gatePos);
  scene.add(gate);

  const state = {
    playing: false,
    hp: 5,
    will: 100,
    invuln: 0,
    castCd: 0,
    stepAcc: 0,
    talking: null,
    map: false,
    journal: false,
    ritual: 0,
    won: false,
    metRose: false,
    lastShrine: { x: POI.spawn.x, z: POI.spawn.z },
    quest: 'Sprich mit der Frau in Rot.',
    acc: 0,
    time: 0,
    hurtFlash: 0,
    lockGrace: 0,
    memories: new Set(),
  };

  function questText() {
    if (state.won) return ENDING.title;
    const taken = relics.takenCount();
    const placed = relics.placedCount();
    if (taken === 0 && !state.metRose) return 'Sprich mit der Frau in Rot.';
    if (taken === 0) return 'Finde die sieben Werkzeuge der Operation.';
    if (placed < 7 && taken < 7) return `Dinge ${taken}/7 — bring sie auf den Hof.`;
    if (placed < 7) return `Setze sie auf die Sockel (${placed}/7).`;
    return 'Halt R auf dem Pflaster.';
  }

  function talkTo(npc) {
    const line = npc.lines[npc.i % npc.lines.length];
    npc.i++;
    state.talking = npc;
    hud.openDialogue(npc.name, line);
    audio.talk();
    if (npc.id === 'rose') state.metRose = true;
  }

  function interact() {
    if (state.talking) {
      hud.closeDialogue();
      state.talking = null;
      return;
    }
    const npc = npcs.nearest(pawn.x, pawn.z);
    if (npc) {
      talkTo(npc);
      return;
    }
    const it = relics.nearest(pawn.x, pawn.z);
    if (it) {
      relics.take(it);
      audio.pickup();
      hud.toast(`${it.name} — genommen.`);
      return;
    }
    const ped = relics.nearestPed(pawn.x, pawn.z);
    if (ped) {
      const have = relics.items.find((i) => i.id === ped.id && i.taken && !i.placed);
      if (have) {
        relics.place(have, ped);
        audio.pickup();
        hud.toast(`${have.name} steht.`);
        if (relics.placedCount() === 7) hud.toast('Sieben. Der Kreis ist bereit.');
      } else {
        const name = RELICS.find((r) => r.id === ped.id)?.name;
        hud.toast(`Sockel für ${name}.`);
      }
    }
  }

  function hurt(n) {
    if (state.invuln > 0 || state.won || !state.playing) return;
    state.hp -= n;
    state.invuln = 0.85;
    state.hurtFlash = 0.35;
    audio.hurt();
    if (state.hp <= 0) {
      const s = relics.nearestShrine(pawn.x, pawn.z);
      resetPawn(pawn, s.x, s.z, obstacles);
      state.hp = 5;
      state.will = 100;
      hud.toast(`Zurück: ${s.name}.`);
      cam.snap(pawn, obstacles);
    }
  }

  function tryCast() {
    if (state.castCd > 0 || state.will < 10 || state.talking) return;
    state.will -= 10;
    state.castCd = 0.42;
    combat.fire(pawn);
    audio.cast();
  }

  function drawMap() {
    const c = document.getElementById('mapCanvas');
    if (!c) return;
    const g = c.getContext('2d');
    const w = c.width;
    const h = c.height;
    g.clearRect(0, 0, w, h);
    g.fillStyle = '#1a0e0a';
    g.fillRect(0, 0, w, h);
    const sc = w / WORLD.size;
    const to = (x, z) => [w * 0.5 + x * sc, h * 0.5 + z * sc];
    g.fillStyle = '#5a281c';
    g.beginPath();
    g.arc(w * 0.5, h * 0.5, (WORLD.size * 0.46) * sc, 0, Math.PI * 2);
    g.fill();
    g.fillStyle = '#8a4030';
    g.beginPath();
    g.arc(w * 0.5, h * 0.5, WORLD.islandR * sc, 0, Math.PI * 2);
    g.fill();
    g.fillStyle = '#3a1c14';
    g.fillRect(w * 0.5 - 70 * sc, h * 0.5 + 70 * sc, 140 * sc, 80 * sc);
    g.fillStyle = '#c9a24a';
    for (const k of Object.keys(POI)) {
      const p = POI[k];
      const [mx, mz] = to(p.x, p.z);
      g.fillRect(mx - 2, mz - 2, 4, 4);
    }
    for (const it of relics.items) {
      g.fillStyle = it.placed ? '#7ec8c0' : it.taken ? '#8a1c28' : '#e8d6a0';
      const [mx, mz] = to(it.x, it.z);
      g.beginPath();
      g.arc(mx, mz, 3, 0, Math.PI * 2);
      g.fill();
    }
    const [px, pz] = to(pawn.x, pawn.z);
    g.fillStyle = '#f2efe4';
    g.beginPath();
    g.moveTo(px + Math.sin(pawn.yaw) * 7, pz + Math.cos(pawn.yaw) * 7);
    g.lineTo(px + Math.sin(pawn.yaw + 2.5) * 5, pz + Math.cos(pawn.yaw + 2.5) * 5);
    g.lineTo(px + Math.sin(pawn.yaw - 2.5) * 5, pz + Math.cos(pawn.yaw - 2.5) * 5);
    g.fill();
  }

  function start() {
    if (state.playing) return;
    state.playing = true;
    hud.hideTitle();
    audio.resume();
    input.tryLock();
    cam.snap(pawn, obstacles);
  }

  document.getElementById('title')?.addEventListener('click', start);
  document.getElementById('again')?.addEventListener('click', () => location.reload());
  document.addEventListener('click', (e) => {
    if (!state.playing || state.map || state.journal || state.won) return;
    if (e.target.closest('#map, #journal, #win, #title')) return;
    if (!input.state.locked) state.lockGrace = 0.22;
    input.tryLock();
  });

  addEventListener('resize', () => {
    camera.aspect = innerWidth / innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(innerWidth, innerHeight);
  });

  let last = performance.now();
  let foot = 0;

  function frame(now) {
    requestAnimationFrame(frame);
    let dt = (now - last) / 1000;
    last = now;
    if (dt > 0.05) dt = 0.05;
    state.time += dt;
    input.beginFrame();

    if (!state.playing) {
      const t = state.time;
      const look = mapToPos(POI.manor.x, POI.manor.z, 4);
      const up = upOf(look);
      const { east, north } = tangentBasis(up);
      camera.position
        .copy(look)
        .addScaledVector(up, 26)
        .addScaledVector(east, Math.sin(t * 0.1) * 34)
        .addScaledVector(north, 18 + Math.cos(t * 0.1) * 12);
      camera.up.copy(up);
      camera.lookAt(look);
      rippleWater(terrain.water, t);
      npcs.tick(t);
      relics.tick(t);
      renderer.render(scene, camera);
      input.endFrame();
      return;
    }

    if (input.state.map) state.map = !state.map;
    if (input.state.journal) state.journal = !state.journal;
    hud.toggleMap(state.map);
    hud.toggleJournal(state.journal, relics, questText(), state.memories);

    for (const m of MEMORIES) {
      if (state.memories.has(m.id)) continue;
      if (dist2(pawn.x, pawn.z, m.x, m.z) < m.r * m.r) {
        state.memories.add(m.id);
        hud.toast(m.whisper);
      }
    }
    if (state.map) drawMap();

    if (state.map || state.journal) {
      input.unlock();
    }

    const look = input.consumeLook();
    if (!state.talking && !state.map && !state.journal) cam.applyLook(look.x, look.y);

    camera.getWorldDirection(_camFwd);
    if (_camFwd.lengthSq() < 1e-6) _camFwd.set(0, 0, -1);

    state.acc += dt;
    if (state.acc > 0.12) state.acc = 0.12;
    while (state.acc >= STEP) {
      if (!state.talking && !state.map && !state.journal && !state.won) {
        stepPawn(pawn, STEP, input, _camFwd, obstacles);
      } else {
        pawn.vel.multiplyScalar(0.8);
      }
      state.acc -= STEP;
    }

    cam.tick(pawn, dt, obstacles, pawn.moving);
    crowley.tick(dt, pawn, state.castCd > 0.2);
    npcs.tick(state.time);
    relics.tick(state.time);
    combat.tick(dt, pawn, hurt);
    rippleWater(terrain.water, state.time);

    {
      const np = mapToPos(8 + Math.sin(state.time * 0.15) * 10, 116 + Math.cos(state.time * 0.12) * 6, 0.3);
      world.ness.position.copy(np);
      upOf(np, _camFwd);
    }
    sky.moonLight.position.copy(pawn.pos).add(sky.moon.position.clone().normalize().multiplyScalar(50));
    sky.moonLight.target.position.copy(pawn.pos);
    sky.moonLight.target.updateMatrixWorld();
    if (relics.placedCount() === 7) {
      gate.material.opacity = Math.min(0.55, gate.material.opacity + dt * 0.2);
      gate.rotation.y += dt * 0.35;
    }

    state.lockGrace = Math.max(0, state.lockGrace - dt);
    state.castCd = Math.max(0, state.castCd - dt);
    state.invuln = Math.max(0, state.invuln - dt);
    state.hurtFlash = Math.max(0, state.hurtFlash - dt);
    if (state.hp < 5 && dist2(pawn.x, pawn.z, POI.plaza.x, POI.plaza.z) < 14 * 14) {
      state.hp = Math.min(5, state.hp + dt * 0.35);
    }
    state.will = Math.min(100, state.will + dt * 16);

    if (pawn.moving && pawn.grounded) {
      foot += pawn.speed * dt;
      if (foot > 1.15) {
        foot = 0;
        audio.step();
      }
    }

    if (input.state.interactDown) interact();
    if (input.state.locked && state.lockGrace <= 0 && (input.state.castDown || input.state.cast)) tryCast();

    const inPlaza = dist2(pawn.x, pawn.z, POI.plaza.x, POI.plaza.z) < 7 * 7;
    if ((input.state.ritual || input.keys.KeyR) && inPlaza && relics.placedCount() === 7 && !state.won) {
      state.ritual += dt;
      if (state.ritual > 2.6) {
        state.won = true;
        state.memories.add('won');
        audio.win();
        hud.showWin();
        input.unlock();
      }
    } else if (!input.keys.KeyR) {
      state.ritual = Math.max(0, state.ritual - dt * 0.8);
    }

    const shrine = relics.nearestShrine(pawn.x, pawn.z);
    if (dist2(pawn.x, pawn.z, shrine.x, shrine.z) < 16) state.lastShrine = shrine;

    let prompt = '';
    if (state.talking) prompt = 'E  weiter';
    else if (npcs.nearest(pawn.x, pawn.z)) prompt = 'E  sprechen';
    else if (relics.nearest(pawn.x, pawn.z)) prompt = 'E  aufheben';
    else if (relics.nearestPed(pawn.x, pawn.z)) prompt = 'E  setzen';
    else if (inPlaza && relics.placedCount() === 7 && !state.won) prompt = 'R halten  —  Operation';
    hud.setPrompt(prompt);

    const fade = document.getElementById('hurt');
    if (fade) fade.style.opacity = String(state.hurtFlash * 0.55);

    const ritualBar = document.getElementById('ritual');
    if (ritualBar) {
      ritualBar.classList.toggle('show', state.ritual > 0 && !state.won);
      document.getElementById('ritualFill').style.transform = `scaleX(${Math.min(1, state.ritual / 2.6)})`;
    }

    const lockHint = document.getElementById('lockHint');
    if (lockHint) {
      lockHint.classList.toggle('show', state.playing && !input.state.locked && !state.map && !state.journal && !state.won);
    }

    hud.tick(dt, state.hp, state.will, cam.orbit.yaw, placeName(pawn.mx, pawn.mz), relics, questText());
    renderer.render(scene, camera);
    input.endFrame();
  }

  requestAnimationFrame(frame);
  window.__boleskine = {
    go(x, z, yaw, pitch) {
      resetPawn(pawn, x, z, obstacles);
      if (yaw != null) cam.orbit.yaw = yaw;
      if (pitch != null) cam.orbit.pitch = pitch;
      cam.snap(pawn, obstacles);
      state.playing = true;
      hud.hideTitle();
      document.getElementById('title')?.classList.add('hide');
    },
    pawn,
    poi: POI,
  };
  const qs = new URLSearchParams(location.search);
  if (qs.get('play')) {
    const x = Number(qs.get('x'));
    const z = Number(qs.get('z'));
    requestAnimationFrame(() => {
      window.__boleskine.go(
        Number.isFinite(x) ? x : POI.spawn.x,
        Number.isFinite(z) ? z : POI.spawn.z,
        Number(qs.get('yaw') || Math.PI),
        Number(qs.get('pitch') || -0.1)
      );
      document.getElementById('lockHint')?.classList.remove('show');
    });
  }
  return { start };
}
