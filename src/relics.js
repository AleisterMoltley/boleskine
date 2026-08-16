import { POI, RELICS, SHRINES } from './config.js';
import { heightAt } from './height.js';
import { relicMesh } from './world/props.js';

export function createRelics(scene, mats) {
  const items = RELICS.map((r) => {
    const mesh = relicMesh(mats, r.id);
    const y = heightAt(r.x, r.z) + 1.05;
    mesh.position.set(r.x, y, r.z);
    scene.add(mesh);
    return { ...r, mesh, taken: false, placed: false, y };
  });

  const pedestals = RELICS.map((r, i) => {
    const a = (i / 7) * Math.PI * 2 - Math.PI / 2;
    return {
      id: r.id,
      x: POI.plaza.x + Math.cos(a) * 5.6,
      z: POI.plaza.z + Math.sin(a) * 5.6,
    };
  });

  return {
    items,
    pedestals,
    nearest(x, z, max = 2.4) {
      let best = null;
      let bd = max * max;
      for (const it of items) {
        if (it.taken) continue;
        const d = (it.x - x) * (it.x - x) + (it.z - z) * (it.z - z);
        if (d < bd) {
          bd = d;
          best = it;
        }
      }
      return best;
    },
    nearestPed(x, z, max = 2.2) {
      let best = null;
      let bd = max * max;
      for (const p of pedestals) {
        const d = (p.x - x) * (p.x - x) + (p.z - z) * (p.z - z);
        if (d < bd) {
          bd = d;
          best = p;
        }
      }
      return best;
    },
    take(it) {
      it.taken = true;
      it.mesh.visible = false;
    },
    place(it, ped) {
      it.placed = true;
      it.mesh.visible = true;
      const y = heightAt(ped.x, ped.z) + 0.95;
      it.mesh.position.set(ped.x, y, ped.z);
    },
    tick(t) {
      for (const it of items) {
        if (it.taken && !it.placed) continue;
        it.mesh.position.y = it.placed ? heightAt(it.mesh.position.x, it.mesh.position.z) + 0.95 : it.y + Math.sin(t * 2 + it.x) * 0.12;
        it.mesh.rotation.y = t * 0.8;
      }
    },
    takenCount() {
      return items.filter((i) => i.taken).length;
    },
    placedCount() {
      return items.filter((i) => i.placed).length;
    },
    nearestShrine(x, z) {
      let best = SHRINES[0];
      let bd = Infinity;
      for (const s of SHRINES) {
        const d = (s.x - x) * (s.x - x) + (s.z - z) * (s.z - z);
        if (d < bd) {
          bd = d;
          best = s;
        }
      }
      return best;
    },
  };
}
