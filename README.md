# Warung Kilat

[![Best Cooking Game](https://make.fun/badge/best-cooking-game-20261125-0137.svg)](https://make.fun/bounty/best-cooking-game-20261125-0137?utm_source=github&utm_medium=readme&utm_campaign=best-cooking-game-20261125-0137)
[![Rank](https://make.fun/badge/best-cooking-game-20261125-0137/fiqirealme52-max/WarungKilat/rank.svg)](https://make.fun/bounty/best-cooking-game-20261125-0137?utm_source=github&utm_medium=readme&utm_campaign=best-cooking-game-20261125-0137)
[![Reward](https://make.fun/badge/best-cooking-game-20261125-0137/fiqirealme52-max/WarungKilat/reward.svg)](https://make.fun/bounty/best-cooking-game-20261125-0137?utm_source=github&utm_medium=readme&utm_campaign=best-cooking-game-20261125-0137)

A fast Indonesian street-food cooking game. One chef, one shift of three
minutes, a kitchen full of hungry tickets: take ingredients from the crate,
chop them on the board, cook them on the stove, stack them on a plate, and
serve before patience runs out. Five original recipes, combos, tips, burnt
food, and a rush that keeps growing.

## How to play

- **WASD / arrow keys** — walk the chef. **Click** the floor to walk there,
  click a station to walk to it and use it.
- **E / Space** — use the station in front of you.
- **1–9 or click the picker bar** — choose which ingredient to take from
  the crate.
- **P** — pause. **R** — restart after a shift ends.

The loop: crate → board (chop) or stove (cook) → assembly table (plate) →
serving window. Serve fast for a tip; serve back-to-back for a combo. Leave
a finished dish on the stove too long and it burns — throw it away.

## Run it

Static files, no build step, no network:

```sh
python3 -m http.server 8080 --directory game
# open http://localhost:8080
```

Screenshots are staged by the game itself: open
`game/index.html?shot=cover&seed=7` (or `start`, `cook`, `serve`) — the
scene is built by the real game code, so the frame is a real render.

## Layout

- `game/index.html` — canvas page, loads `src/main.js`
- `game/src/config.js` — sizes, stations, palette
- `game/src/recipes.js` — 9 ingredients, 5 recipes
- `game/src/random.js` — seeded RNG
- `game/src/input.js` — keyboard + mouse
- `game/src/world.js` — state and rules
- `game/src/render.js` — all drawing, in code
- `game/src/shots.js` — deterministic screenshot scenes
- `game/src/audio.js` — synthesized blips (WebAudio, no files)
- `game/src/main.js` — boot + frame loop
- `main.ts` — hand-in program (copies `game/` + `screenshots/`, writes
  `dossier.json`)
- `screenshots/` — 4 real renders of the game

Entry for the make.fun bounty
[best-cooking-game-20261125-0137](https://make.fun/bounty/best-cooking-game-20261125-0137).
