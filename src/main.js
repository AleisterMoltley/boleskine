import { boot } from './game.js';

const canvas = document.getElementById('c');
try {
  boot(canvas);
} catch (err) {
  const pre = document.createElement('pre');
  pre.style.cssText = 'position:fixed;inset:8px;z-index:99;color:#f88;white-space:pre-wrap;font:12px/1.4 monospace';
  pre.textContent = err && err.stack ? err.stack : String(err);
  document.body.appendChild(pre);
  throw err;
}
