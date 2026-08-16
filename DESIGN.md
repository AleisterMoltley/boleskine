# GAME DESIGN — Boleskine

**Status:** Playable vertical slice  
**Tech:** Three.js r170 + Vite  
**Art Style:** Stop-motion nightscape, Tim Burton / *Nightmare Before Christmas* — elongated puppets, spiral hills, moon-stripe lighting, toon ramps  
**Target Platforms:** Web  
**Last Updated:** 2026-08-16

---

## One-Sentence Pitch

You are Aleister Crowley on a Burton-twisted Loch Ness island: recover the seven implements of the Abramelin Operation and close the Working at the hexagram.

## Core Loop

1. Walk the night island (manor, kirk, wood, village, abbey, loch).
2. Talk, pick up a relic, banish a shadow if it closes in.
3. Place relics on the plaza pedestals.
4. Hold the rite when all seven stand.

## Pillars

- **Movement first:** capsule controller, coyote jump, slope slide, no falling through the height field.
- **Collision is the height function:** mesh and pawn share one authored `heightAt`.
- **Readable occult, not gore:** Thelema names, Burton silhouettes, pumpkin lamps.
- **Dense small open world:** one island you can cross in a few minutes, landmarks always up.

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
- [x] Height-field ground + cylinder/box obstacles + pier platform
- [x] Seven relics + pedestals + rite ending
- [x] NPCs with lines
- [x] Shadows that chase; shrine respawn
- [x] Swim on the loch (no world-edge void)

## Progression

Session: 15–25 minutes to first ending. Relics are the whole unlock.

## Art Direction & Palette

- `#07060f` sky / ink
- `#e8d6a0` moon
- `#8a1c28` sash / blood
- `#c9a24a` gold / will
- `#7ec8c0` rite teal
- `#243028` grass
- Pale puppet skin, hollow eyes, nemes + leopard drape from Crowley’s 1910 ceremonial portrait (Wikimedia, public domain)

World is code-built (toon meshes). Image-gen key art was blocked by moderation; style lives in geometry and light.

## Known issues / polish

- Interiors are solid (no room-scale inside Boleskine) on purpose — less tunneling.
- Point lights capped so the island stays at 60 fps.
- Image portraits / painted UI frames not shipped (moderation). CSS HUD instead.

## Backlog

- [ ] More rite variants / second ending
- [ ] Aiwass as a voiced sky event
- [ ] Horse / boat
- [ ] Weather (ash rain)

## Future / nice to have

- Full manor interior
- Golden Dawn duel
- Liber AL page collectibles
