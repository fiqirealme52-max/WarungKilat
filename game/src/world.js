// Warung Kilat — state + aturan main. Satu martabak di wajan dalam satu waktu:
// TUANG adonan -> MASAK sampai keemasan -> MENTEGA -> 2 TOPPING -> LIPAT ->
// POTONG & SAJI ke piring siap -> SAJIKAN ke tiket yang cocok.
(function () {
  'use strict';

  var CFG = window.WK_CONFIG;
  var DATA = window.WK_DATA;
  var RNG = window.WK_RANDOM;

  var STEPS_TOTAL = 5; // tuang, masak, mentega, topping 1, topping 2

  function newGriddle() {
    return { stage: 'empty', cook: 0, butter: 0, fold: 0, toppings: [], wrong: false };
  }

  function newGame(seed) {
    return {
      phase: 'title', // title | playing | over
      seed: seed || 1,
      rng: RNG.mulberry32(seed || 1),
      timeLeft: CFG.SHIFT_SECONDS,
      elapsed: 0,
      score: 0,
      served: 0,
      lost: 0,
      combo: 0,
      bestCombo: 0,
      tickets: [],
      ticketSeq: 0,
      griddle: newGriddle(),
      plate: null, // { toppings: [id, id] } saat martabak sudah dipotong
      spawnIn: 1.5,
      popups: [],
      hint: 'Klik ADONAN untuk mulai',
      hintLife: 0,
      shake: 0,
      flash: 0,
      lastCustomer: -1,
    };
  }

  // Langkah rakitan yang sudah selesai (untuk label MID-ASSEMBLY n/5).
  // Parameternya objek wajan, bukan game — pemanggil harus kirim game.griddle.
  function assemblyStep(g) {
    if (g.stage === 'empty') return 0;
    if (g.stage === 'cooking') return 1;
    if (g.stage === 'needs-butter' || g.stage === 'buttering') return 2;
    if (g.stage === 'topping') return 3 + g.toppings.length;
    return 5; // folding / folded
  }

  function stageLabel(g) {
    switch (g.stage) {
      case 'empty': return 'TUANG ADONAN';
      case 'cooking': return 'MASAK ' + Math.floor(g.cook * 100) + '%';
      case 'needs-butter': return 'MASAK! + MENTEGA';
      case 'buttering': return 'MENTEGA MELELEH';
      case 'topping': return 'MID-ASSEMBLY ' + assemblyStep(g) + '/' + STEPS_TOTAL;
      case 'folding': return 'DILIPAT...';
      case 'folded': return 'SIAP DIPOTONG';
      default: return '';
    }
  }

  // --- pesanan ---------------------------------------------------------------
  function spawnTicket(game) {
    if (game.tickets.length >= 3) return;
    var recipe = RNG.pick(game.rng, DATA.RECIPES);
    var ci = Math.floor(game.rng() * DATA.CUSTOMERS.length);
    if (ci === game.lastCustomer) ci = (ci + 1) % DATA.CUSTOMERS.length;
    game.lastCustomer = ci;
    var patience = Math.max(35, CFG.ORDER_PATIENCE - Math.floor(game.elapsed / 30));
    game.tickets.push({
      id: ++game.ticketSeq,
      customer: DATA.CUSTOMERS[ci],
      recipe: recipe,
      price: DATA.recipePrice(recipe),
      patience: patience,
      patienceMax: patience,
      born: game.elapsed,
    });
  }

  function sameSet(a, b) {
    if (a.length !== b.length) return false;
    return a.slice().sort().join('|') === b.slice().sort().join('|');
  }

  function findMatchingTicket(game, toppings) {
    for (var i = 0; i < game.tickets.length; i++) {
      if (sameSet(game.tickets[i].recipe.toppings, toppings)) return game.tickets[i];
    }
    return null;
  }

  // --- aksi pemain (dipakai input mouse/keyboard DAN self-test) -------------
  function setHint(game, text, life) {
    game.hint = text;
    game.hintLife = life || 2.5;
  }

  function popup(game, text, x, y, color) {
    game.popups.push({ text: text, x: x, y: y, color: color || '#ffd23d', life: 1.4 });
    if (game.popups.length > 6) game.popups.shift();
  }

  function pourBatter(game) {
    if (game.phase !== 'playing') return false;
    if (game.griddle.stage !== 'empty') { setHint(game, 'Wajan masih dipakai — selesaikan dulu'); return false; }
    game.griddle = newGriddle();
    game.griddle.stage = 'cooking';
    setHint(game, 'Adonan dituang — tunggu keemasan...');
    return true;
  }

  function addButter(game) {
    if (game.phase !== 'playing') return false;
    if (game.griddle.stage !== 'needs-butter') { setHint(game, 'Mentega nanti — tunggu adonan matang'); return false; }
    game.griddle.stage = 'buttering';
    game.griddle.butter = 0;
    return true;
  }

  function addTopping(game, id) {
    if (game.phase !== 'playing') return false;
    var g = game.griddle;
    if (g.stage !== 'topping') { setHint(game, 'Topping nanti — masak + mentega dulu'); return false; }
    if (g.toppings.length >= 2) { setHint(game, 'Sudah 2 topping — lipat sekarang (F)'); return false; }
    g.toppings.push(id);
    // Tandai kalau topping ini tidak ada di pesanan aktif mana pun.
    var wanted = false;
    for (var i = 0; i < game.tickets.length; i++) {
      if (game.tickets[i].recipe.toppings.indexOf(id) >= 0) { wanted = true; break; }
    }
    if (!wanted) { g.wrong = true; setHint(game, 'Topping itu tidak ada di pesanan — buang ke BIN (B)'); }
    if (g.toppings.length === 2) setHint(game, 'Lengkap! Lipat martabaknya (F)');
    return true;
  }

  function fold(game) {
    if (game.phase !== 'playing') return false;
    var g = game.griddle;
    if (g.stage !== 'topping' || g.toppings.length < 2) { setHint(game, 'Lipat nanti — isi 2 topping dulu'); return false; }
    g.stage = 'folding';
    g.fold = 0;
    return true;
  }

  function cutAndPlate(game) {
    if (game.phase !== 'playing') return false;
    var g = game.griddle;
    if (g.stage !== 'folded') { setHint(game, 'Potong nanti — lipat dulu (F)'); return false; }
    if (game.plate) { setHint(game, 'Piring siap masih penuh — sajikan dulu'); return false; }
    game.plate = { toppings: g.toppings.slice() };
    game.griddle = newGriddle();
    setHint(game, 'Di piring! Sajikan ke tiket yang cocok (Spasi)');
    return true;
  }

  function serve(game) {
    if (game.phase !== 'playing') return false;
    if (!game.plate) { setHint(game, 'Belum ada martabak di piring siap'); return false; }
    var t = findMatchingTicket(game, game.plate.toppings);
    if (!t) {
      game.shake = 0.35;
      setHint(game, 'TIDAK COCOK dengan pesanan mana pun!');
      return false;
    }
    var tip = Math.round((t.patience / t.patienceMax) * 3000);
    var mult = 1 + 0.25 * game.combo;
    var earned = Math.round((t.price + tip) * mult);
    game.score += earned;
    game.served++;
    game.combo++;
    if (game.combo > game.bestCombo) game.bestCombo = game.combo;
    popup(game, '+Rp ' + earned.toLocaleString('id-ID'), 860, 555, '#ffd23d');
    game.tickets.splice(game.tickets.indexOf(t), 1);
    game.plate = null;
    game.flash = 0.25;
    setHint(game, 'Disajikan! Kombo x' + game.combo);
    return true;
  }

  function discard(game) {
    if (game.phase !== 'playing') return false;
    if (game.griddle.stage === 'empty') return false;
    game.griddle = newGriddle();
    setHint(game, 'Dibuang — tuang adonan baru');
    return true;
  }

  function startGame(game) {
    game.phase = 'playing';
    game.timeLeft = CFG.SHIFT_SECONDS;
    game.elapsed = 0;
    game.score = 0;
    game.served = 0;
    game.lost = 0;
    game.combo = 0;
    game.bestCombo = 0;
    game.tickets = [];
    game.griddle = newGriddle();
    game.plate = null;
    game.spawnIn = 0.5;
    game.popups = [];
    setHint(game, 'Klik ADONAN untuk mulai');
  }

  // --- tick ------------------------------------------------------------------
  function tick(game, dt) {
    if (game.phase !== 'playing') return;
    game.elapsed += dt;
    game.timeLeft -= dt;
    if (game.hintLife > 0) game.hintLife -= dt;
    if (game.shake > 0) game.shake -= dt;
    if (game.flash > 0) game.flash -= dt;
    for (var i = game.popups.length - 1; i >= 0; i--) {
      game.popups[i].life -= dt;
      game.popups[i].y -= 22 * dt;
      if (game.popups[i].life <= 0) game.popups.splice(i, 1);
    }
    // wajan
    var g = game.griddle;
    if (g.stage === 'cooking') {
      g.cook += dt / CFG.COOK_SECONDS;
      if (g.cook >= 1) { g.cook = 1; g.stage = 'needs-butter'; setHint(game, 'Matang keemasan! Klik MENTEGA (2)'); }
    } else if (g.stage === 'buttering') {
      g.butter += dt / CFG.BUTTER_SECONDS;
      if (g.butter >= 1) { g.stage = 'topping'; setHint(game, 'Tambah 2 topping sesuai tiket'); }
    } else if (g.stage === 'folding') {
      g.fold += dt / CFG.FOLD_SECONDS;
      if (g.fold >= 1) { g.stage = 'folded'; setHint(game, 'Potong & sajikan (Spasi)'); }
    }
    // spawn pesanan
    game.spawnIn -= dt;
    if (game.spawnIn <= 0) {
      spawnTicket(game);
      var interval = Math.max(8, CFG.ORDER_SPAWN_EVERY - Math.floor(game.elapsed / 45));
      game.spawnIn = interval;
    }
    // kesabaran tiket
    for (var j = game.tickets.length - 1; j >= 0; j--) {
      game.tickets[j].patience -= dt;
      if (game.tickets[j].patience <= 0) {
        game.tickets.splice(j, 1);
        game.lost++;
        game.combo = 0;
        setHint(game, 'Pesanan hangus! Kombo reset');
      }
    }
    if (game.timeLeft <= 0) {
      game.timeLeft = 0;
      game.phase = 'over';
    }
  }

  window.WK_WORLD = {
    newGame: newGame,
    newGriddle: newGriddle,
    assemblyStep: assemblyStep,
    stageLabel: stageLabel,
    spawnTicket: spawnTicket,
    sameSet: sameSet,
    pourBatter: pourBatter,
    addButter: addButter,
    addTopping: addTopping,
    fold: fold,
    cutAndPlate: cutAndPlate,
    serve: serve,
    discard: discard,
    startGame: startGame,
    tick: tick,
    STEPS_TOTAL: STEPS_TOTAL,
  };
})();
