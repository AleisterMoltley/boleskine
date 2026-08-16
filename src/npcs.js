import * as THREE from 'three';
import { POI } from './config.js';
import { heightAt } from './height.js';

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
    const y = heightAt(x, z);
    mesh.position.set(x, y, z);
    scene.add(mesh);
    const npc = { id, name, x, z, y, mesh, lines, i: 0 };
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
    'Die Scharlachrote Frau',
    POI.spawn.x + 5.2,
    POI.spawn.z + 1.8,
    rose,
    [
      'Aleister. Die Abramelin-Operation ist zerrissen — Liber AL, Athame, Kelch, Stab, Pantakel, Stele, Öl.',
      'Das unicursale Hexagramm wartet auf dem Platz. Sieben Sockel, sieben Planeten.',
      'Do what thou wilt shall be the whole of the Law. 93.',
      'Aiwass sitzt am Kreis. Hör ihm zu, dann hol das Buch aus dem Haus.',
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
      'Das umgekehrte Pentagramm brennt im Fenster. Euer Athame liegt auf dem Altar.',
      'Die Schatten hassen das Pentakel. Ein Stern, und sie werden Ruß.',
      'Unter der Trauerweide das Abramelin-Öl. Zimt, Myrrhe, Galangal.',
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
    'Kürbis-Jakob',
    POI.village.x + 6,
    POI.village.z - 4,
    jakob,
    [
      'Willkommen. Hier hängt man Pentagramme ins Kürbisfleisch und nennt es Ernte.',
      'Das Pentakel — Stern im Kreis — liegt im Brunnen. Fünf Spitzen, ein Wille.',
      'In der Abtei stehen Jachin und Boaz noch. Die Stele der Enthüllung auch.',
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
    'Rabe Aiwass',
    POI.plaza.x + 3.5,
    POI.plaza.z - 6,
    raven,
    [
      '93. Ich bin Aiwass, oder ein Rabe, der den Namen trägt. Gleichgültig.',
      'Das unicursale Hexagramm ist dein Siegel. Nicht der sechszackige Davidstern.',
      'Love is the law, love under will. Setz die sieben, dann hält der Mond.',
    ]
  );
  raven.scale.setScalar(1.6);

  const ghost = body(mats, mats.ghost, mats.ghost, 1.05);
  add(
    'ghost',
    'Ein Rest der Golden Dawn',
    POI.abbey.x + 8,
    POI.abbey.z + 6,
    ghost,
    [
      'Golden Dawn. Jachin weiß, Boaz schwarz. Du hast uns überlebt. Unhöflich.',
      'Die Stele des Ankh-ef-en-Khonsu steht im Hof. Wille, kein Fürchten.',
      'Mathers sendet Grüße. Nimm die Stele. 93 93/93.',
    ]
  );

  const perch = heightAt(POI.plaza.x + 3.5, POI.plaza.z - 6) + 1.6;
  raven.position.y = perch;

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
        n.mesh.rotation.y = Math.sin(t * 0.6 + n.x) * 0.15;
        if (n.id === 'aiwass') {
          n.mesh.position.y = perch + Math.sin(t * 2.2) * 0.12;
        }
        if (n.id === 'ghost') {
          n.mesh.position.y = n.y + Math.sin(t * 1.4) * 0.18;
        }
      }
    },
  };
}
