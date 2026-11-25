// Warung Kilat — hand-in program (Node 22, standard library only).
//
// The game is plain static files under game/ plus 3-4 screenshots, and
// this program hands them in: it copies game/ and screenshots/ from beside
// this file into the output directory and writes dossier.json there, the
// summary the judge reads, built by the vendored make.fun library.
//
// Run it outside the grader with MAKEFUN_OUTPUT_DIR standing in for
// /output:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
//
// It must write the same bytes on every run: the copy is a plain file
// copy and the dossier is a pure function of the files it reads.

import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-game.ts';

const here = fileURLToPath(new URL('.', import.meta.url));
const out = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

mkdirSync(out, { recursive: true });
cpSync(join(here, 'game'), join(out, 'game'), { recursive: true });
mkdirSync(join(out, 'screenshots'), { recursive: true });
if (existsSync(join(here, 'screenshots'))) {
  cpSync(join(here, 'screenshots'), join(out, 'screenshots'), { recursive: true });
}

// Caps mirror the gate so an entry this program accepts is one the
// scorer accepts: at most 4 screenshots of 256 KiB, at most 993 files
// and 48 MiB under game/, paths under 1000 bytes.
writeFileSync(
  join(out, 'dossier.json'),
  buildDossier(out, {
    text_max_bytes: 163840,
    screenshots: { max: 4, max_bytes: 262144 },
    game_max_files: 993,
    game_max_bytes: 50331648,
    game_path_max_bytes: 1000,
  }),
);
