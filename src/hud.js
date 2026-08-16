import { RELICS } from './config.js';

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

  function toggleJournal(on, relics, quest) {
    journalEl.classList.toggle('show', on);
    if (on) {
      journalBody.innerHTML =
        `<p class="q">${quest}</p>` +
        relics.items
          .map((r) => {
            const st = r.placed ? 'gesetzt' : r.taken ? 'getragen' : r.hint;
            return `<div class="row ${r.taken ? 'have' : ''}"><b>${r.name}</b><span>${st}</span></div>`;
          })
          .join('');
    }
  }

  function hideTitle() {
    titleEl.classList.add('hide');
  }

  function showWin() {
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
