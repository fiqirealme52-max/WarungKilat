# Warung Kilat

[![Best Cooking Game](https://make.fun/badge/best-cooking-game-20261125-0137.svg)](https://make.fun/bounty/best-cooking-game-20261125-0137?utm_source=github&utm_medium=readme&utm_campaign=best-cooking-game-20261125-0137)
[![Rank](https://make.fun/badge/best-cooking-game-20261125-0137/fiqirealme52-max/WarungKilat/rank.svg)](https://make.fun/bounty/best-cooking-game-20261125-0137?utm_source=github&utm_medium=readme&utm_campaign=best-cooking-game-20261125-0137)
[![Reward](https://make.fun/badge/best-cooking-game-20261125-0137/fiqirealme52-max/WarungKilat/reward.svg)](https://make.fun/bounty/best-cooking-game-20261125-0137?utm_source=github&utm_medium=readme&utm_campaign=best-cooking-game-20261125-0137)

A fast Indonesian street-food cooking game: one chef, one griddle, one shift
of three minutes at a golden-hour martabak cart. Tickets come in with hungry
customers' faces on them. Pour the batter, cook it golden, melt the butter,
add exactly the two toppings each ticket asks for, fold, cut, and serve
before patience runs out. Combos, tips, burnt patience, and a rush that keeps
growing.

## How to play

- **Mouse** — click the batter bowl, the butter, a topping jar, or the buttons.
- **1** — pour batter. **2** — add butter. **3–8** — add a topping.
- **F** — fold the martabak. **Space** — cut to the ready plate, then serve.
- **B** — throw a ruined martabak in the bin. **R** — restart after a shift.
- A topping no ticket wants marks the martabak wrong — bin it and start over.
- Serve the oldest matching ticket: the more patience left, the bigger the tip.

## Files

- `game/index.html` — the game, plain static files, no network requests.
- `game/src/` — one job per file: `config` (layout + palette), `recipes`
  (toppings, orders, customers), `random` (seeded RNG), `world` (rules),
  `render` (all canvas art), `input` (mouse + keyboard), `shots`
  (deterministic screenshots + self-test), `audio` (synth blips), `main` (boot).
- `screenshots/` — four real renders of the game in a browser.
- `main.ts` — hands the game in (copies `game/` + `screenshots/`, writes the
  dossier with the vendored make.fun library).

## License

MIT — see `LICENSE`.
