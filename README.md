# BOLESKINE

Open-world Three.js nightscape. You play **Aleister Crowley** on a Tim Burton / *Nightmare Before Christmas* Mars — Boleskine House on a rust continent, canals and watchers on the far side.

Do what thou wilt. Then put the seven tools back.

## Run

```bash
cd ~/GrokGameStudio/Projects/boleskine
npm install
npm run dev
```

Open the URL Vite prints (usually `http://localhost:5173`). Click the title to lock the mouse.

Production (same as Railway):

```bash
npm install
npm run build
npm start
```

Serves `dist/` on `PORT` (default `8080`). Health check: `GET /health`.

## Railway

The repo is Docker + `railway.toml` ready.

1. New project → Deploy from GitHub → `AleisterMoltley/boleskine`
2. Railway reads `Dockerfile` / `railway.toml`
3. It binds `PORT` automatically
4. Generate a public domain in Settings → Networking

Or from this folder, with the Railway CLI logged in:

```bash
railway init --name boleskine
railway up
railway domain
```

## Controls

| Key | Action |
|-----|--------|
| WASD | Walk |
| Mouse | Look |
| Shift | Run |
| Space | Jump |
| E | Talk / pick up / place |
| Click | Will-bolt |
| R (hold) | Rite at the hexagram, after all seven relics |
| M | Map |
| J | Journal |

## Goal

Talk to the Scarlet Woman at the manor yard. Find Liber AL, Athame, Chalice, Wand, Pantacle, Stele, Abramelin oil. Set them on the plaza pedestals. Hold **R**.

## Notes

Ground height and the visible terrain come from the same function (`src/height.js`). You should not fall through the world. If you die, you return to the nearest shrine.

Historical Crowley is a stylized stop-motion puppet (nemes, leopard drape, staff), not a photograph.
