# Warung Kilat — Martabak Gerobak (rebuild fotorealistis)

[![Best Cooking Game](https://make.fun/badge/best-cooking-game-20261125-0137.svg)](https://make.fun/bounty/best-cooking-game-20261125-0137?utm_source=github&utm_medium=readme&utm_campaign=best-cooking-game-20261125-0137)
[![Rank](https://make.fun/badge/best-cooking-game-20261125-0137/fiqirealme52-max/WarungKilat/rank.svg)](https://make.fun/bounty/best-cooking-game-20261125-0137?utm_source=github&utm_medium=readme&utm_campaign=best-cooking-game-20261125-0137)
[![Reward](https://make.fun/badge/best-cooking-game-20261125-0137/fiqirealme52-max/WarungKilat/reward.svg)](https://make.fun/bounty/best-cooking-game-20261125-0137?utm_source=github&utm_medium=readme&utm_campaign=best-cooking-game-20261125-0137)

Game masak: kelola gerobak martabak di pasar malam selama satu shift 3 menit.
Semua scene, makanan, dan pelanggan memakai **foto asli** (bukan gambar
vektor): gerobak + vendor bercelemek merah di bawah lampion, martabak
bergelembung dengan mentega meleleh di wajan, 6 mangkuk topping dari atas,
dan 3 pelanggan Indonesia. UI (tiket, bar, tombol) adalah overlay HTML/CSS
di atas foto.

## Cara main

Tuang adonan (1) → masak sampai keemasan → mentega (2) → 2 topping sesuai
tiket (3–8) → lipat (F) → potong & saji (Spasi) → sajikan ke tiket yang
cocok (klik piring / BEL / Spasi). Topping yang tidak ada di pesanan bisa
dibuang ke BIN (B). Tiket yang kehabisan kesabaran hangus dan kombo reset.
Tip dihitung dari sisa kesabaran; kombo menaikkan penghasilan.

Mouse: klik tombol dan mangkuk topping. Keyboard: 1–8, F, Spasi, B, R
(ulang setelah shift selesai).

## File

- `game/index.html` — layout DOM 1280×720 (foto latar + panel UI).
- `game/src/` — `world.js` (state machine), `render.js` (render DOM),
  `input.js`, `main.js` (`?shot=` / `?selftest=1`), `shots.js`,
  `config.js`, `recipes.js`, `random.js`, `audio.js`.
- `game/img/` — foto JPG: `hero.jpg`, `griddle.jpg`, `plate.jpg`,
  6 `topping-*.jpg`, 3 `face-*.jpg`.
- `screenshots/` — 4 screenshot 1280×720 dari browser asli:
  cover, start, cook, serve.
- `main.ts` — menyalin `game/` + `screenshots/` ke output dan menulis
  `dossier.json` (pustaka make.fun di `vendor/`).

## Verifikasi (dilakukan sendiri)

- Self-test mekanik: PASS 25/25 (`?selftest=1`).
- 4 screenshot deterministik (render 2× md5 identik), masing-masing
  ≤256 KiB; `main.ts` jalan 2× byte-identik; dossier valid
  (makefun/dossier/v1, 4 gambar); tanpa referensi network; game ≤1 MB.
- Dibaca dengan mata sendiri: keempat shot kelihatan foto — vendor,
  martabak, topping, dan wajah pelanggan semuanya foto asli; 0% ruang
  mati; semua label di screenshot menampilkan progres yang benar.

## Lisensi

MIT. Foto dibuat untuk game ini (generasi media), bebas dipakai di dalam
repo ini.
