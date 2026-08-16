import { RELICS } from './config.js';
import { ENDING, MEMORIES, RELIC_NOTES } from './lore.js';

export function createHud() {
  const hpFill = document.getElementById('hpFill');
  const willFill = document.getElementById('willFill');
  const toastEl = document.getElementById('toast');
  const promptEl = document.getElementById('prompt');
  const questEl = document.getElementById('quest');
  const relicsEl = document.getElementById('relics');
  const hintEl = document.getElementById('hint');
  const dialogue = document.getElementById('dialogue');
  const dName = document.getElementById('dName');
  const dText = document.getElementById('dText');
  const mapEl = document.getElementById('map');
  const journalEl = document.getElementById('journal');
  const journalBody = document.getElementById('journalBody');
  const titleEl = document.getElementById('title');
  const winEl = document.getElementById('win');
  const compass = document.getElementById('compassRose');
  const placeEl = document.getElementById('place');

  let toastT = 0;

  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add('show');
    toastT = 2.6;
  }

  function setPrompt(msg) {
    if (msg) {
      promptEl.textContent = msg;
      promptEl.classList.add('show');
    } else {
      promptEl.classList.remove('show');
    }
  }

  function syncRelics(relics) {
    relicsEl.innerHTML = RELICS.map((r) => {
      const it = relics.items.find((i) => i.id === r.id);
      const st = it.placed ? 'placed' : it.taken ? 'taken' : '';
      return `<i class="${st}" title="${r.name}"></i>`;
    }).join('');
  }

  function openDialogue(name, text) {
    dName.textContent = name;
    dText.textContent = text;
    dialogue.classList.add('show');
  }

  function closeDialogue() {
    dialogue.classList.remove('show');
  }

  function toggleMap(on) {
    mapEl.classList.toggle('show', on);
  }

  function toggleJournal(on, relics, quest, memories) {
    journalEl.classList.toggle('show', on);
    if (on) {
      const found = MEMORIES.filter((m) => memories.has(m.id));
      const chaps = found
        .map((m) => `<article class="chap"><h4>${m.title}</h4><p>${m.body}</p></article>`)
        .join('');
      const notes = relics.items
        .filter((r) => r.taken)
        .map((r) => {
          const n = RELIC_NOTES[r.id];
          if (!n) return '';
          return `<article class="chap"><h4>${n.title}</h4><p>${n.body}</p></article>`;
        })
        .join('');
      const end = memories.has('won')
        ? `<article class="chap"><h4>${ENDING.title}</h4><p>${ENDING.body}</p></article>`
        : '';
      journalBody.innerHTML =
        `<p class="q">${quest}</p>` +
        `<p class="sub">${found.length} Seiten der Beichte · ${relics.takenCount()}/7 Dinge</p>` +
        (chaps || '<p class="sub">Geh. Der Text schreibt sich, wo du stehst.</p>') +
        notes +
        end;
    }
  }

  function hideTitle() {
    titleEl.classList.add('hide');
  }

  function showWin() {
    const t = document.querySelector('#win h2');
    const p = document.querySelector('#win p');
    if (t) t.textContent = ENDING.title;
    if (p) p.textContent = ENDING.body;
    winEl.classList.add('show');
  }

  function tick(dt, hp, will, yaw, place, relics, quest) {
    hpFill.style.transform = `scaleX(${Math.max(0, hp / 5)})`;
    willFill.style.transform = `scaleX(${Math.max(0, will / 100)})`;
    if (compass) compass.style.transform = `rotate(${yaw + Math.PI}rad)`;
    if (placeEl) placeEl.textContent = place;
    questEl.textContent = quest;
    syncRelics(relics);
    if (toastT > 0) {
      toastT -= dt;
      if (toastT <= 0) toastEl.classList.remove('show');
    }
  }

  return {
    toast,
    setPrompt,
    openDialogue,
    closeDialogue,
    toggleMap,
    toggleJournal,
    hideTitle,
    showWin,
    tick,
    hintEl,
  };
}
