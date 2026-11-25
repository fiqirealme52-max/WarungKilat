// Warung Kilat — the whole game state and its rules.
// One chef, one carried item, three work surfaces (board, stove, table):
// take a raw ingredient from the crate, chop it or cook it, stack the
// prepared pieces on a plate, serve the plate when it matches a ticket.
// Tickets arrive on a timer with a patience bar; serving fast pays a tip
// and builds a combo. Burnt food and expired tickets cost points.
import {
  AISLE, CHEF_SPEED, INTERACT_DX, INTERACT_Y, MAX_TICKETS, OBSTACLES,
  PICKER, SHIFT_SECONDS, STATIONS,
} from './config.js';
import { INGREDIENTS, INGREDIENT_BY_ID, RECIPES, RECIPE_BY_ID, plateMatchesRecipe } from './recipes.js';
import { makeRng, pick } from './random.js';
import { moveVector, wasPressed } from './input.js';

const BURN_GRACE = 6; // seconds a finished dish waits before it burns
const COMBO_WINDOW = 20; // seconds between serves to keep the combo alive

export function createWorld(seed) {
  const world = {
    seed,
    rng: makeRng(seed),
    screen: 'title',
    paused: false,
    elapsed: 0,
    shiftLeft: SHIFT_SECONDS,
    score: 0,
    coins: 0,
    served: 0,
    combo: 0,
    comboTimer: 0,
    bestCombo: 0,
    chef: { x: 640, y: 480, dir: 'down', moving: false, walkPhase: 0, target: null },
    selectedIng: 'nasi',
    carrying: null, // { kind:'ing', ing, state } or { kind:'plate', items, ticketId }
    board: { item: null }, // { ing, state:'raw'|'ready', progress }
    burners: [{ item: null }, { item: null }],
    plates: [{ items: [], readyTicket: null }, { items: [], readyTicket: null }],
    tickets: [],
    ticketSeq: 0,
    spawnTimer: 3,
    popups: [],
    particles: [],
    hint: '',
    hintTimer: 0,
    stats: { expired: 0, burnt: 0, trashed: 0 },
    rank: '',
  };
  return world;
}

export function resetWorld(world) {
  const fresh = createWorld(world.seed);
  for (const key of Object.keys(fresh)) world[key] = fresh[key];
  world.screen = 'play';
}

function progress(world) {
  return Math.min(1, world.elapsed / SHIFT_SECONDS);
}

function popup(world, x, y, text, color) {
  world.popups.push({ x, y, text, color: color || '#fff3d6', t: 0, ttl: 1.4 });
}

function burst(world, x, y, color, n) {
  for (let i = 0; i < (n || 10); i += 1) {
    const a = world.rng() * Math.PI * 2;
    const speed = 40 + world.rng() * 90;
    world.particles.push({
      x, y, vx: Math.cos(a) * speed, vy: Math.sin(a) * speed - 40,
      life: 0.5 + world.rng() * 0.4, t: 0, color, size: 2 + world.rng() * 3,
    });
  }
}

function showHint(world, text) {
  world.hint = text;
  world.hintTimer = 2.2;
}

export function addTicket(world, recipeId, patience) {
  const recipe = RECIPE_BY_ID[recipeId];
  const maxPatience = patience || Math.round(72 - 16 * progress(world));
  world.tickets.push({
    id: world.ticketSeq += 1,
    recipeId,
    patience: maxPatience,
    maxPatience,
    reward: recipe.reward,
  });
}

function hitsObstacle(x, y, radius) {
  for (const o of OBSTACLES) {
    if (x + radius > o.x0 && x - radius < o.x1 && y + radius > o.y0 && y - radius < o.y1) return true;
  }
  return false;
}

function moveChef(world, px, py) {
  const chef = world.chef;
  const nx = Math.max(AISLE.x0, Math.min(AISLE.x1, chef.x + px));
  if (!hitsObstacle(nx, chef.y, 20)) chef.x = nx;
  const ny = Math.max(AISLE.y0, Math.min(AISLE.y1, chef.y + py));
  if (!hitsObstacle(chef.x, ny, 20)) chef.y = ny;
}

function spawnTicket(world) {
  // Early shift: gentler orders (2-ingredient Es Teh, signature Nasi
  // Goreng). Later the full menu shows up more often.
  const pool = progress(world) > 0.45 ? RECIPES : RECIPES.filter((r) => r.id === 'esteh' || r.id === 'nasgor');
  addTicket(world, pick(world.rng, pool).id);
  world.spawnTimer = 17 - 8 * progress(world);
}

function nearestStation(world) {
  const chef = world.chef;
  if (chef.y > INTERACT_Y) return null;
  let best = null;
  let bestDx = INTERACT_DX;
  for (const s of STATIONS) {
    const dx = Math.abs(chef.x - s.cx);
    if (dx < bestDx) {
      bestDx = dx;
      best = s;
    }
  }
  return best;
}

function refreshPlates(world) {
  for (const plate of world.plates) {
    plate.readyTicket = null;
    for (const ticket of world.tickets) {
      if (plateMatchesRecipe(plate.items, RECIPE_BY_ID[ticket.recipeId])) {
        plate.readyTicket = ticket.id;
        break;
      }
    }
  }
}

function comboMult(world) {
  return Math.min(3, 1 + 0.25 * world.combo);
}

function servePlate(world, ticketId) {
  const ticket = world.tickets.find((t) => t.id === ticketId);
  if (!ticket) return false;
  const recipe = RECIPE_BY_ID[ticket.recipeId];
  const tip = Math.round(50 * (ticket.patience / ticket.maxPatience));
  const gain = Math.round((recipe.reward + tip) * comboMult(world));
  world.score += gain;
  world.coins += gain;
  world.served += 1;
  world.combo += 1;
  world.bestCombo = Math.max(world.bestCombo, world.combo);
  world.comboTimer = COMBO_WINDOW;
  world.tickets = world.tickets.filter((t) => t.id !== ticketId);
  refreshPlates(world);
  popup(world, 1140, 330, `+${gain}`, '#f2b134');
  burst(world, 1140, 330, '#f2b134', 16);
  return true;
}

function interact(world, station, sfx) {
  const chef = world.chef;
  const hands = world.carrying;
  const beep = (name) => { if (sfx) sfx(name); };

  if (station.id === 'trash') {
    if (!hands) { showHint(world, 'Tangan kosong — tidak ada yang dibuang'); return; }
    world.carrying = null;
    world.stats.trashed += 1;
    beep('trash');
    popup(world, chef.x, chef.y - 50, 'Dibuang', '#c9c9c9');
    return;
  }

  if (station.id === 'crate') {
    if (hands) { showHint(world, 'Tangan sudah penuh — sajikan atau buang dulu'); return; }
    const ing = INGREDIENT_BY_ID[world.selectedIng];
    world.carrying = { kind: 'ing', ing: ing.id, state: ing.prep === 'none' ? 'ready' : 'raw' };
    beep('take');
    return;
  }

  if (station.id === 'board') {
    const board = world.board;
    if (!board.item && hands && hands.kind === 'ing') {
      const ing = INGREDIENT_BY_ID[hands.ing];
      if (ing.prep !== 'chop') { showHint(world, `${ing.name} tidak dipotong — langsung dimasak atau dirakit`); return; }
      if (hands.state !== 'raw') { showHint(world, 'Sudah dipotong — bawa ke meja rakit'); return; }
      board.item = { ing: hands.ing, state: 'raw', progress: 0 };
      world.carrying = null;
      beep('place');
      return;
    }
    if (board.item && !hands) {
      world.carrying = { kind: 'ing', ing: board.item.ing, state: board.item.state };
      board.item = null;
      beep('take');
      return;
    }
    showHint(world, board.item ? 'Talenan sedang dipakai' : 'Bawa bahan mentah yang bisa dipotong');
    return;
  }

  if (station.id === 'stove') {
    // Take a finished or burnt item first if hands are empty.
    if (!hands) {
      // Finished dishes first; a still-cooking item can still come off,
      // so a misclick never locks a burner for the whole cook time.
      const readyFirst = [...world.burners].sort((a, b) => {
        const done = (x) => (x.item && (x.item.state === 'ready' || x.item.state === 'burnt') ? 0 : 1);
        return done(a) - done(b);
      });
      for (const burner of readyFirst) {
        if (burner.item) {
          world.carrying = { kind: 'ing', ing: burner.item.ing, state: burner.item.state };
          burner.item = null;
          beep('take');
          return;
        }
      }
      showHint(world, 'Tidak ada masakan di kompor');
      return;
    }
    if (hands.kind !== 'ing') { showHint(world, 'Piring tidak bisa dimasak'); return; }
    const ing = INGREDIENT_BY_ID[hands.ing];
    if (ing.prep !== 'cook' || hands.state !== 'raw') {
      showHint(world, ing.prep === 'none' ? `${ing.name} sudah siap — langsung dirakit` : 'Sudah matang — bawa ke meja rakit');
      return;
    }
    const free = world.burners.find((b) => !b.item);
    if (!free) { showHint(world, 'Kompor penuh — tunggu satu wajan selesai'); return; }
    free.item = { ing: hands.ing, state: 'raw', progress: 0, burnT: BURN_GRACE };
    world.carrying = null;
    beep('place');
    return;
  }

  if (station.id === 'table') {
    if (hands && hands.kind === 'ing') {
      if (hands.state !== 'ready') { showHint(world, 'Bahan masih mentah — olah dulu di talenan/kompor'); return; }
      // Smart stacking: finish a plate that matches a ticket first, then
      // keep a plate a subset of some ticket, then the first with room.
      const completesTicket = (items, extra) => {
        const trial = [...items, extra];
        return world.tickets.some((t) => plateMatchesRecipe(trial, RECIPE_BY_ID[t.recipeId]));
      };
      const subsetOfTicket = (items, extra) => {
        const trial = [...items, extra];
        return world.tickets.some((t) => {
          const want = [...RECIPE_BY_ID[t.recipeId].components];
          return trial.every((ing) => {
            const i = want.indexOf(ing);
            if (i < 0) return false;
            want.splice(i, 1);
            return true;
          });
        });
      };
      let plate = world.plates.find((p) => p.items.length < 3 && completesTicket(p.items, hands.ing));
      if (!plate) plate = world.plates.find((p) => p.items.length < 3 && subsetOfTicket(p.items, hands.ing));
      if (!plate) plate = world.plates.find((p) => p.items.length < 3);
      if (!plate) { showHint(world, 'Meja rakit penuh — sajikan satu piring dulu'); return; }
      plate.items.push(hands.ing);
      world.carrying = null;
      refreshPlates(world);
      beep('place');
      return;
    }
    if (!hands) {
      // Take a ready plate first; otherwise take the fullest plate, so a
      // wrongly stacked plate can always be carried to the trash.
      const ready = world.plates.find((p) => p.readyTicket !== null);
      const fullest = [...world.plates].sort((a, b) => b.items.length - a.items.length)[0];
      const plate = ready || (fullest && fullest.items.length > 0 ? fullest : null);
      if (plate) {
        world.carrying = { kind: 'plate', items: [...plate.items], ticketId: plate.readyTicket };
        plate.items = [];
        plate.readyTicket = null;
        beep('take');
        return;
      }
      showHint(world, 'Belum ada piring yang cocok dengan order');
      return;
    }
    showHint(world, 'Tangan penuh piring — antar ke jendela saji');
    return;
  }

  if (station.id === 'window') {
    if (!hands || hands.kind !== 'plate') {
      showHint(world, 'Bawa piring yang sudah lengkap ke sini');
      return;
    }
    if (!hands.ticketId) {
      showHint(world, 'Piring ini belum cocok dengan order mana pun');
      beep('error');
      return;
    }
    if (servePlate(world, hands.ticketId)) {
      world.carrying = null;
      beep('serve');
    } else {
      showHint(world, 'Order itu sudah hangus — rakit ulang');
      beep('error');
    }
  }
}

function pickerHit(input) {
  if (!input.mouse.clicked) return -1;
  const { x, y } = input.mouse;
  for (let i = 0; i < INGREDIENTS.length; i += 1) {
    const bx = PICKER.x + i * (PICKER.w + PICKER.gap);
    if (x >= bx && x <= bx + PICKER.w && y >= PICKER.y && y <= PICKER.y + PICKER.h) return i;
  }
  return -1;
}

function stationHit(input) {
  if (!input.mouse.clicked) return null;
  const { x, y } = input.mouse;
  for (const s of STATIONS) {
    if (x >= s.x && x <= s.x + s.w && y >= s.y - 10 && y <= s.y + s.h + 44) return s;
  }
  return null;
}

export function update(world, input, dt, sfx) {
  const beep = (name) => { if (sfx) sfx(name); };

  if (world.screen === 'title') {
    if (wasPressed(input, 'Enter') || wasPressed(input, 'Space') || input.mouse.clicked) {
      resetWorld(world);
      beep('start');
    }
    return;
  }

  if (world.screen === 'over') {
    if (wasPressed(input, 'KeyR') || wasPressed(input, 'Enter')) {
      resetWorld(world);
      beep('start');
    }
    return;
  }

  if (wasPressed(input, 'KeyP') || wasPressed(input, 'Escape')) {
    world.paused = !world.paused;
    return;
  }
  if (world.paused) return;

  // --- clock, orders, patience -------------------------------------------
  world.elapsed += dt;
  world.shiftLeft = Math.max(0, SHIFT_SECONDS - world.elapsed);
  if (world.shiftLeft <= 0) {
    world.screen = 'over';
    world.rank = world.served >= 14 ? 'S' : world.served >= 11 ? 'A' : world.served >= 8 ? 'B' : world.served >= 5 ? 'C' : 'D';
    beep('over');
    return;
  }
  world.spawnTimer -= dt;
  if (world.spawnTimer <= 0 && world.tickets.length < MAX_TICKETS) spawnTicket(world);

  for (const ticket of world.tickets) ticket.patience -= dt;
  const expired = world.tickets.filter((t) => t.patience <= 0);
  if (expired.length > 0) {
    world.tickets = world.tickets.filter((t) => t.patience > 0);
    world.stats.expired += expired.length;
    world.combo = 0;
    world.score = Math.max(0, world.score - 25 * expired.length);
    popup(world, 640, 170, `Order hangus -${25 * expired.length}`, '#d94f3d');
    refreshPlates(world);
    beep('error');
  }

  // --- work surfaces -------------------------------------------------------
  if (world.board.item && world.board.item.state === 'raw') {
    const ing = INGREDIENT_BY_ID[world.board.item.ing];
    world.board.item.progress += dt / ing.chopTime;
    if (world.board.item.progress >= 1) {
      world.board.item.state = 'ready';
      world.board.item.progress = 1;
      beep('chopDone');
      burst(world, 540, 250, '#58b368', 8);
    }
  }
  for (const burner of world.burners) {
    const item = burner.item;
    if (!item) continue;
    if (item.state === 'raw') {
      const ing = INGREDIENT_BY_ID[item.ing];
      item.progress += dt / ing.cookTime;
      if (item.progress >= 1) {
        item.state = 'ready';
        item.progress = 1;
        item.burnT = BURN_GRACE;
        beep('cookDone');
      }
    } else if (item.state === 'ready') {
      item.burnT -= dt;
      if (item.burnT <= 0) {
        item.state = 'burnt';
        world.stats.burnt += 1;
        popup(world, 740, 250, 'Gosong!', '#d94f3d');
        beep('error');
      }
    }
  }

  // --- combo decay ---------------------------------------------------------
  if (world.comboTimer > 0) {
    world.comboTimer -= dt;
    if (world.comboTimer <= 0) world.combo = 0;
  }

  // --- ingredient picker ---------------------------------------------------
  // A picker click selects an ingredient and NOTHING else: it must not
  // also send the chef walking to the bottom bar.
  const pickIndex = pickerHit(input);
  const pickerUsed = pickIndex >= 0;
  if (pickerUsed) {
    world.selectedIng = INGREDIENTS[pickIndex].id;
    beep('take');
  }
  for (let i = 0; i < INGREDIENTS.length; i += 1) {
    if (wasPressed(input, `Digit${i + 1}`)) {
      world.selectedIng = INGREDIENTS[i].id;
      beep('take');
    }
  }

  // --- chef movement --------------------------------------------------------
  const chef = world.chef;
  const mv = moveVector(input);
  if (mv.x !== 0 || mv.y !== 0) {
    chef.target = null;
    chef.moving = true;
    moveChef(world, mv.x * CHEF_SPEED * dt, mv.y * CHEF_SPEED * dt);
    chef.dir = Math.abs(mv.x) > Math.abs(mv.y) ? (mv.x > 0 ? 'right' : 'left') : (mv.y > 0 ? 'down' : 'up');
    chef.walkPhase += dt * 10;
  } else if (chef.target) {
    const dx = chef.target.x - chef.x;
    const dy = chef.target.y - chef.y;
    const dist = Math.hypot(dx, dy);
    if (dist < 6) {
      chef.target = null;
      chef.moving = false;
    } else {
      chef.moving = true;
      const step = Math.min(dist, CHEF_SPEED * dt);
      moveChef(world, (dx / dist) * step, (dy / dist) * step);
      chef.dir = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : (dy > 0 ? 'down' : 'up');
      chef.walkPhase += dt * 10;
    }
  } else {
    chef.moving = false;
  }

  // --- clicks: station walk-to, or floor walk-to ----------------------------
  // (Picker clicks are already consumed above and never move the chef.)
  const hitStation = pickerUsed ? null : stationHit(input);
  if (hitStation) {
    chef.target = { x: hitStation.cx, y: 380 };
    world.pendingStation = hitStation.id;
  } else if (input.mouse.clicked && !pickerUsed && input.mouse.clickY > AISLE.y0 - 20) {
    chef.target = {
      x: Math.max(AISLE.x0, Math.min(AISLE.x1, input.mouse.clickX)),
      y: Math.max(AISLE.y0, Math.min(AISLE.y1, input.mouse.clickY)),
    };
    world.pendingStation = null;
  }

  // Arrived at a clicked station: use it.
  if (world.pendingStation) {
    const station = STATIONS.find((s) => s.id === world.pendingStation);
    if (station && Math.abs(chef.x - station.cx) < INTERACT_DX && chef.y < INTERACT_Y) {
      world.pendingStation = null;
      chef.target = null;
      interact(world, station, sfx);
    }
  }

  // --- keyboard interact -----------------------------------------------------
  if (wasPressed(input, 'KeyE') || wasPressed(input, 'Space')) {
    const station = nearestStation(world);
    if (station) interact(world, station, sfx);
    else showHint(world, 'Dekati stasiun dulu — berjalanlah ke konter atas');
  }

  // --- popups, particles, hint ----------------------------------------------
  for (const p of world.popups) { p.t += dt; p.y -= 26 * dt; }
  world.popups = world.popups.filter((p) => p.t < p.ttl);
  for (const pt of world.particles) {
    pt.t += dt;
    pt.x += pt.vx * dt;
    pt.y += pt.vy * dt;
    pt.vy += 160 * dt;
  }
  world.particles = world.particles.filter((pt) => pt.t < pt.life);
  if (world.hintTimer > 0) {
    world.hintTimer -= dt;
    if (world.hintTimer <= 0) world.hint = '';
  }
}

// --- helpers the screenshot stager uses (real game functions only) -----------

export function placeBoardItem(world, ing, progress, state) {
  world.board.item = { ing, state: state || 'raw', progress: progress || 0 };
}

export function placeBurnerItem(world, index, ing, progress, state, burnT) {
  world.burners[index].item = {
    ing, state: state || 'raw', progress: progress || 0, burnT: burnT === undefined ? BURN_GRACE : burnT,
  };
}

export function addPlateItem(world, plateIndex, ing) {
  world.plates[plateIndex].items.push(ing);
  refreshPlates(world);
}

export function setChef(world, x, y, carrying) {
  world.chef.x = x;
  world.chef.y = y;
  world.chef.dir = 'up';
  world.chef.moving = false;
  world.chef.target = null;
  if (carrying !== undefined) world.carrying = carrying;
}

export function setHud(world, values) {
  if (values.score !== undefined) world.score = values.score;
  if (values.coins !== undefined) world.coins = values.coins;
  if (values.served !== undefined) world.served = values.served;
  if (values.combo !== undefined) world.combo = values.combo;
  if (values.elapsed !== undefined) {
    world.elapsed = values.elapsed;
    world.shiftLeft = Math.max(0, SHIFT_SECONDS - values.elapsed);
  }
}
