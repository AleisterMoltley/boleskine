import * as THREE from 'three';
import { POI } from './config.js';
import { mapToPos, orientOnPlanet, upOf } from './planet.js';

function body(mats, skin, cloth, tall = 1) {
  const g = new THREE.Group();
  const robe = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.28, 1.05 * tall, 8), cloth);
  robe.position.y = 0.55 * tall;
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.16, 8, 7), skin);
  head.position.y = 1.18 * tall;
  head.scale.set(0.85, 1.25, 0.9);
  const eyeL = new THREE.Mesh(new THREE.SphereGeometry(0.03, 6, 5), mats.eyeHole);
  eyeL.position.set(-0.05, 1.2 * tall, 0.12);
  const eyeR = eyeL.clone();
  eyeR.position.x = 0.05;
  const pupL = new THREE.Mesh(new THREE.SphereGeometry(0.01, 5, 4), mats.eyeWhite);
  pupL.position.set(-0.05, 1.2 * tall, 0.145);
  const pupR = pupL.clone();
  pupR.position.x = 0.05;
  g.add(robe, head, eyeL, eyeR, pupL, pupR);
  g.traverse((o) => {
    if (o.isMesh) {
      o.castShadow = true;
      o.receiveShadow = true;
    }
  });
  return g;
}

export function createNpcs(scene, mats) {
  const list = [];

  function add(id, name, x, z, mesh, lines) {
    const p = mapToPos(x, z);
    mesh.position.copy(p);
    orientOnPlanet(mesh, upOf(p), 0);
    scene.add(mesh);
    const npc = { id, name, x, z, mesh, lines, i: 0, base: p.clone() };
    list.push(npc);
    return npc;
  }

  const rose = body(mats, mats.skin, mats.rose, 1.12);
  const hair = new THREE.Mesh(new THREE.SphereGeometry(0.2, 8, 6), mats.robeDeep);
  hair.position.y = 1.42;
  hair.scale.set(1, 1.2, 0.9);
  rose.add(hair);
  add(
    'rose',
    'Die Frau in Rot',
    POI.spawn.x + 5.2,
    POI.spawn.z + 1.8,
    rose,
    [
      'Die Arbeit im Haus ist unvollständig. Sieben Dinge fehlen. Du weißt welche.',
      'Unten auf dem Pflaster wartet der Kreis. Nicht eilen. Erst das Pult im Arbeitszimmer.',
      'Was du willst, ist das Gesetz — aber zuerst: sieh dich um, nicht hinunter.',
    ]
  );

  const warden = body(mats, mats.skinShadow, mats.stone, 0.82);
  warden.children[1].scale.set(1.15, 1.4, 1.1);
  add(
    'warden',
    'Kirchwart',
    POI.kirk.x + 6,
    POI.kirk.z - 7,
    warden,
    [
      'Das Fenster ist älter als die Gemeinde. Das Messer liegt noch am Altar.',
      'Die Gräber sind unruhig. Unter der Weide tropft etwas in eine Phiole.',
    ]
  );

  const jakob = new THREE.Group();
  const suit = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.26, 1.0, 8), mats.robe);
  suit.position.y = 0.55;
  const phead = new THREE.Mesh(new THREE.SphereGeometry(0.28, 8, 6), mats.pumpkin);
  phead.position.y = 1.28;
  phead.scale.set(1.15, 0.95, 1);
  const face = new THREE.Mesh(new THREE.CircleGeometry(0.12, 5), mats.ember);
  face.position.set(0, 1.28, 0.26);
  jakob.add(suit, phead, face);
  jakob.traverse((o) => {
    if (o.isMesh) o.castShadow = true;
  });
  add(
    'jakob',
    'Jakob',
    POI.village.x + 6,
    POI.village.z - 4,
    jakob,
    [
      'Im Brunnen liegt eine Scheibe. Kupfer, alt. Niemand holt sie hoch.',
      'Westlich die Ruine. Zwei Säulen noch. Schwarz und hell. Wie immer.',
    ]
  );

  const raven = new THREE.Group();
  const bodyR = new THREE.Mesh(new THREE.SphereGeometry(0.18, 8, 6), mats.robeDeep);
  bodyR.scale.set(1, 0.8, 1.4);
  const headR = new THREE.Mesh(new THREE.SphereGeometry(0.1, 6, 5), mats.robeDeep);
  headR.position.set(0, 0.12, 0.2);
  const beak = new THREE.Mesh(new THREE.ConeGeometry(0.035, 0.14, 5), mats.goldDeep);
  beak.rotation.x = Math.PI / 2;
  beak.position.set(0, 0.1, 0.32);
  raven.add(bodyR, headR, beak);
  add(
    'aiwass',
    'Der Rabe',
    POI.plaza.x + 3.5,
    POI.plaza.z - 6,
    raven,
    [
      'Krch. Ich sitze auf dem Pflaster. Das genügt als Hinweis.',
      'Sieben Sockel. Wenn sie voll sind, hält der Kreis. Mehr sag ich nicht.',
    ]
  );
  raven.scale.setScalar(1.6);

  const ghost = body(mats, mats.ghost, mats.ghost, 1.05);
  add(
    'ghost',
    'Ein früherer Bruder',
    POI.abbey.x + 8,
    POI.abbey.z + 6,
    ghost,
    [
      'Wir haben die Säulen gesetzt. Du hast uns überlebt. Unhöflich.',
      'Die Tafel im Hof. Sandstein. Nimm, was darauf wartet — ohne Aufhebens.',
    ]
  );

  const leah = body(mats, mats.skin, mats.sash, 1.05);
  add(
    'leah',
    'Die Lehrerin',
    POI.abbey.x - 6,
    POI.abbey.z + 4,
    leah,
    [
      'Ich habe Kinder unterrichtet, bevor ich dieses Haus führte. Der Unterschied ist kleiner, als man denkt.',
      'Die bemalten Wände sind verblasst. Was blieb, ist der Hof und wer noch hier sitzt.',
    ]
  );

  const bennett = body(mats, mats.skinShadow, mats.sand, 1.0);
  add(
    'bennett',
    'Der Freund',
    POI.wood.x - 5,
    POI.wood.z + 8,
    bennett,
    [
      'Ich bin nach Osten gegangen. Du bist geblieben. Wir haben uns das gelehrt, was der andere nicht wollte.',
      'Der Atem zählt. Der Rest ist Möbel.',
    ]
  );

  const neuburg = body(mats, mats.skin, mats.stone, 0.92);
  add(
    'neuburg',
    'Der Schreiber',
    POI.hollow.x + 4,
    POI.hollow.z - 3,
    neuburg,
    [
      'In der Senke soll man nicht lange stehen. Ich habe dort diktiert, bis die Stimme umkippte.',
      'Nachher habe ich Verse gemacht. Sie sind höflicher als das Protokoll.',
    ]
  );

  const eck = body(mats, mats.skinShadow, mats.stoneLite, 1.08);
  add(
    'eckenstein',
    'Der Seilkamerad',
    POI.spiral.x - 5,
    POI.spiral.z + 4,
    eck,
    [
      'Das Seil hält, oder es hält nicht. Magie ist keine Ausrede am Grat.',
      'Den Haufen habe ich nicht gesetzt. Aber er ist richtig geschichtet.',
    ]
  );

  const poet = body(mats, mats.skin, mats.ghost, 1.1);
  add(
    'poet',
    'Der Dichter',
    POI.manor.x + 14,
    POI.manor.z - 6,
    poet,
    [
      'Ich trete nicht ein. Die Halle hat entschieden, und ich habe ihr recht gegeben.',
      'Behalt dein Ausharren. Ich behalte den Turm und die Vögel.',
    ]
  );

  const perch = mapToPos(POI.plaza.x + 3.5, POI.plaza.z - 6, 1.6);
  raven.position.copy(perch);
  const ravenNpc = list.find((n) => n.id === 'aiwass');
  if (ravenNpc) ravenNpc.base.copy(perch);

  return {
    list,
    nearest(x, z, max = 3.2) {
      let best = null;
      let bd = max * max;
      for (const n of list) {
        const d = (n.x - x) * (n.x - x) + (n.z - z) * (n.z - z);
        if (d < bd) {
          bd = d;
          best = n;
        }
      }
      return best;
    },
    tick(t) {
      for (const n of list) {
        const up = upOf(n.mesh.position);
        let lift = 0;
        if (n.id === 'aiwass') lift = Math.sin(t * 2.2) * 0.12;
        if (n.id === 'ghost') lift = Math.sin(t * 1.4) * 0.18;
        n.mesh.position.copy(n.base).addScaledVector(up, lift);
        orientOnPlanet(n.mesh, up, Math.sin(t * 0.6 + n.x) * 0.15);
      }
    },
  };
}
