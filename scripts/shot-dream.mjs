import puppeteer from 'puppeteer-core';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';

const chrome = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const out = path.resolve('art');
await mkdir(out, { recursive: true });

const browser = await puppeteer.launch({
  executablePath: chrome,
  headless: 'new',
  args: ['--no-sandbox', '--use-angle=metal', '--ignore-gpu-blocklist'],
  defaultViewport: { width: 1440, height: 900, deviceScaleFactor: 1 },
});

const page = await browser.newPage();
page.setDefaultTimeout(30000);

async function shot(name, url) {
  await page.goto(url, { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => window.__boleskine && window.__boleskine.pawn, { timeout: 20000 });
  await new Promise((r) => setTimeout(r, 1100));
  const file = path.join(out, name);
  await page.screenshot({ path: file, type: 'png' });
  console.log('wrote', file);
}

const spawn = 'http://127.0.0.1:5191/?play=1&x=-36.5&z=24';
await shot('shot-dream-title.png', 'http://127.0.0.1:5191/');
await shot('shot-dream-spawn.png', `${spawn}&yaw=${Math.PI}&pitch=-0.08`);
await shot('shot-dream-moon.png', `${spawn}&yaw=${Math.PI}&pitch=-0.36`);
await shot('shot-dream-path.png', 'http://127.0.0.1:5191/?play=1&x=-28&z=16&yaw=2.6&pitch=-0.05');
await shot('shot-dream-plaza.png', 'http://127.0.0.1:5191/?play=1&x=0&z=0&yaw=3.0&pitch=-0.12');

await browser.close();
