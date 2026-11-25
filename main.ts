// Warung Kilat — entrypoint penyerahan (Node 22, tanpa dependensi luar).
// Menyalin folder game/ dan screenshots/ ke direktori keluaran, lalu
// menulis dossier.json memakai pustaka make.fun yang ikut ter-vendor.
// Grader menjalankan berkas ini; di luar grader, direktori keluaran
// bisa diganti lewat MAKEFUN_OUTPUT_DIR:
//   MAKEFUN_OUTPUT_DIR=out node main.ts

import fs from 'node:fs';
import path from 'node:path';
import url from 'node:url';
import * as dossierLib from './vendor/makefun-game.ts';

const root = url.fileURLToPath(new URL('.', import.meta.url));
const dest = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';
const gameDir = path.join(root, 'game');
const shotsDir = path.join(root, 'screenshots');

fs.mkdirSync(dest, { recursive: true });
fs.cpSync(gameDir, path.join(dest, 'game'), { recursive: true });
fs.mkdirSync(path.join(dest, 'screenshots'), { recursive: true });
if (fs.existsSync(shotsDir)) {
  fs.cpSync(shotsDir, path.join(dest, 'screenshots'), { recursive: true });
}

// Batas gate (reference/gate.json): text_max_bytes satu-satunya yang
// membentuk byte dossier; sisanya menolak entri yang scorer akan tolak
// (screenshot lebih dari 4 atau di atas 256 KiB; game/ lebih dari
// 993 file atau 48 MiB; atau path di game/ di atas 1000 byte).
const dossier = dossierLib.buildDossier(dest, {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  game_max_files: 993,
  game_max_bytes: 50331648,
  game_path_max_bytes: 1000,
});
fs.writeFileSync(path.join(dest, 'dossier.json'), dossier);
