# GAME DESIGN — Boleskine

**Status:** Playable vertical slice  
**Tech:** Three.js r170 + Vite · walkable Mars sphere (Mosspeak-style)  
**Art Style:** Stop-motion nightscape, Tim Burton / *Nightmare Before Christmas* — elongated puppets, rust highlands, toon ramps  
**Target Platforms:** Web  
**Last Updated:** 2026-08-17

---

## One-Sentence Pitch

You are Aleister Crowley on Mars: Boleskine and the rest of his life sit on a rust continent; canals, iron, and a watching hill hold the rest.

## Core Loop

1. Walk the red planet (manor, kirk, wood, village, abbey, dust basin, far-side sites).
2. Talk, pick up a relic, banish a shadow if it closes in.
3. Place relics on the plaza pedestals.
4. Hold the rite when all seven stand.

## Pillars

- **Movement first:** capsule controller, coyote jump, radial gravity, feet planted on the land mesh.
- **Collision is the mesh:** pawn snaps to a ray against the displaced sphere, not the mathematical radius.
- **Readable occult, not gore:** lodge geometry, correspondences, no billboard slogans.
- **A planet you can walk:** larger Mars, continent plus wilderness.

## Controls

- WASD / stick — walk (camera-relative)
- Mouse / right stick — look
- Shift — run
- Space — jump
- E / F — talk, pick up, place
- Click / Q — Will (hexagram bolt)
- R hold — rite in the hexagram (after 7 placed)
- M — map
- J / Tab — journal
- Esc — release pointer

## Key Mechanics

- [x] Third-person Crowley, pointer-lock look
- [x] Spherical Mars + mesh foot-plant + cylinder/box obstacles
- [x] Seven relics + pedestals + rite ending
- [x] NPCs with lines
- [x] Shadows that chase; shrine respawn
- [x] Dust maria (slow walk, no swim)

## Progression

Session: 15–25 minutes to first ending. Relics are the whole unlock. Far-side sites add journal pages.

## Art Direction & Palette

- `#07060f` night dome
- `#e8d6a0` watching moon / lamps
- `#8a1c28` sash / blood
- `#c9a24a` gold / will
- `#7ec8c0` rite teal
- `#5a281c` night rust
- `#1c100e` maria
- Pale puppet skin, hollow eyes, nemes + leopard drape from Crowley’s 1910 ceremonial portrait (Wikimedia, public domain)

World is code-built (toon meshes). Image-gen key art was blocked by moderation; style lives in geometry and light.

## Known issues / polish

- Interiors are solid (no room-scale inside Boleskine) on purpose — less tunneling.
- Point lights capped so the island stays at 60 fps.
- Image portraits / painted UI frames not shipped (moderation). CSS HUD instead.

## Backlog

- [x] Confessions journal from place-memories
- [x] Cairo hours, vault, chess, cairn, press, Hastings chair, hollow
- [x] Leah, Bennett, Neuburg, Eckenstein, the poet
- [x] Mars wrap: iron circle, crater, Cydonia, polar shrine, canal orrery, red seal
- [x] Grant / gnosis: vesica, Daath gap, Lam niche, mauve threshold, veiled hall, 22 cells, Spare marks
- [x] Denser world: clutter, ravens, moths, smoke, wrecks, more trees/rocks
- [x] Path edges, grit texture, ten chapter-stones (most of the planet still empty)
- [x] Night atmosphere: watching moon, fog, watchers, wisps
- [x] Walkable moonlight + path lamps; trees/stones/menhirs on the continent; watchers on every walk
- [ ] Aiwass as a voiced sky event
- [ ] Horse / boat

## Future / nice to have

- Full manor interior
- Golden Dawn duel
- Liber AL page collectibles
