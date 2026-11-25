// Warung Kilat — preset screenshot deterministik (?shot=cover|start|cook|serve)
// dan self-test loop penuh (?selftest=1). Shot dirender dari kode game yang
// sama, bukan komposit: state dipreset, lalu render() yang menggambar.
(function () {
  'use strict';

  var WORLD = window.WK_WORLD;
  var DATA = window.WK_DATA;

  function baseGame(seed) {
    var g = WORLD.newGame(seed);
    g.phase = 'playing';
    g.timeLeft = 107;
    g.elapsed = 73;
    return g;
  }

  function ticket(g, customerIdx, recipeIdx, patience, patienceMax) {
    return {
      id: ++g.ticketSeq,
      customer: DATA.CUSTOMERS[customerIdx],
      recipe: DATA.RECIPES[recipeIdx],
      price: DATA.recipePrice(DATA.RECIPES[recipeIdx]),
      patience: patience,
      patienceMax: patienceMax,
      born: g.elapsed,
    };
  }

  var SHOTS = {
    // Cover: rush tengah — martabak MID-ASSEMBLY 4/5 di wajan, piring siap
    // penuh, 3 tiket (satu hampir habis), kombo x3.
    cover: function () {
      var g = baseGame(11);
      g.score = 48000; g.served = 5; g.lost = 0; g.combo = 3; g.bestCombo = 3;
      g.tickets = [
        ticket(g, 0, 0, 14, 55), // Bu Ratna — Cokelat Keju, BURU-BURU
        ticket(g, 1, 1, 38, 55), // Mbak Sari — Pisang Susu
        ticket(g, 2, 4, 48, 55), // Pak Dedi — Keju Susu
      ];
      g.griddle.stage = 'topping';
      g.griddle.cook = 1;
      g.griddle.butter = 1;
      g.griddle.toppings = ['cokelat'];
      g.plate = { toppings: ['cokelat', 'keju'] };
      g.hint = '';
      g.hintLife = 0;
      return g;
    },
    // Start: title di atas gerobak, adonan baru dituang, 3 tiket menunggu.
    start: function () {
      var g = WORLD.newGame(12);
      g.phase = 'title';
      g.griddle.stage = 'cooking';
      g.griddle.cook = 0.25;
      g.tickets = [
        ticket(g, 2, 3, 52, 55),
        ticket(g, 0, 0, 48, 55),
        ticket(g, 1, 1, 44, 55),
      ];
      g.hint = '';
      g.hintLife = 0;
      return g;
    },
    // Cook: adonan 82% keemasan, gelembung, api menyala, 2 tiket.
    cook: function () {
      var g = baseGame(13);
      g.timeLeft = 135; g.elapsed = 45;
      g.score = 21000; g.served = 2; g.lost = 0; g.combo = 2; g.bestCombo = 2;
      g.tickets = [
        ticket(g, 0, 2, 30, 50),
        ticket(g, 1, 5, 44, 50),
        ticket(g, 2, 3, 47, 50),
      ];
      g.griddle.stage = 'cooking';
      g.griddle.cook = 0.82;
      g.hint = 'Adonan dituang — tunggu keemasan...';
      g.hintLife = 99;
      return g;
    },
    // Serve: piring siap penuh + bel berbunyi + popup Rp, martabak berikut
    // sudah dimasak di wajan, tiket pertama cocok dengan piring.
    serve: function () {
      var g = baseGame(14);
      g.timeLeft = 58; g.elapsed = 122;
      g.score = 64000; g.served = 8; g.lost = 1; g.combo = 4; g.bestCombo = 4;
      g.tickets = [
        ticket(g, 1, 1, 26, 55), // Pisang Susu — cocok dengan piring
        ticket(g, 0, 6, 41, 55),
        ticket(g, 2, 0, 49, 55),
      ];
      g.griddle.stage = 'cooking';
      g.griddle.cook = 0.4;
      g.plate = { toppings: ['pisang', 'susu'] };
      g.flash = 0; // tanpa haze putih di screenshot (popup +Rp sudah cukup)
      g.popups = [{ text: '+Rp 18.000', x: 860, y: 555, color: '#ffd23d', life: 1.2 }];
      g.hint = '';
      g.hintLife = 0;
      return g;
    },
  };

  // Self-test: mainkan satu order penuh lewat fungsi aksi yang sama dengan
  // input pemain, lalu tulis hasilnya ke window.__SELFTEST + document.title.
  function selfTest() {
    var log = [];
    var pass = 0, fail = 0;
    function check(name, cond) {
      log.push((cond ? 'PASS' : 'FAIL') + ' ' + name);
      if (cond) pass++; else fail++;
    }
    function step(g, secs) {
      for (var t = 0; t < secs; t += 0.25) WORLD.tick(g, 0.25);
    }
    var g = WORLD.newGame(7);
    WORLD.startGame(g);
    check('start phase playing', g.phase === 'playing');
    step(g, 2);
    check('tiket muncul', g.tickets.length >= 1);
    var want = g.tickets[0].recipe.toppings.slice();
    check('tuang adonan', WORLD.pourBatter(g) === true);
    check('tuang kedua ditolak', WORLD.pourBatter(g) === false);
    check('topping saat masak ditolak', WORLD.addTopping(g, want[0]) === false);
    step(g, 7.5);
    check('masak selesai -> needs-butter', g.griddle.stage === 'needs-butter');
    check('mentega', WORLD.addButter(g) === true);
    step(g, 1.5);
    check('mentega selesai -> topping', g.griddle.stage === 'topping');
    check('topping 1', WORLD.addTopping(g, want[0]) === true);
    check('topping 2', WORLD.addTopping(g, want[1]) === true);
    check('topping 3 ditolak', WORLD.addTopping(g, want[0]) === false);
    check('lipat', WORLD.fold(g) === true);
    step(g, 1);
    check('lipat selesai -> folded', g.griddle.stage === 'folded');
    check('potong ke piring', WORLD.cutAndPlate(g) === true);
    check('wajan bersih lagi', g.griddle.stage === 'empty');
    var scoreBefore = g.score;
    check('sajikan cocok', WORLD.serve(g) === true);
    check('skor naik', g.score > scoreBefore);
    check('served 1', g.served === 1);
    check('kombo 1', g.combo === 1);
    // jalur buang: topping salah -> BIN
    WORLD.pourBatter(g); step(g, 7.5); WORLD.addButter(g); step(g, 1.5);
    var all = DATA.TOPPINGS.map(function (t) { return t.id; });
    var wrongOne = null;
    for (var i = 0; i < all.length; i++) {
      var inAny = false;
      for (var j = 0; j < g.tickets.length; j++) {
        if (g.tickets[j].recipe.toppings.indexOf(all[i]) >= 0) { inAny = true; break; }
      }
      if (!inAny) { wrongOne = all[i]; break; }
    }
    if (wrongOne) {
      WORLD.addTopping(g, wrongOne);
      check('topping salah ditandai', g.griddle.wrong === true);
      check('buang ke BIN', WORLD.discard(g) === true);
      check('wajan bersih setelah buang', g.griddle.stage === 'empty');
    } else {
      log.push('SKIP jalur topping salah (semua topping ada di tiket)');
    }
    // tiket hangus
    var lostBefore = g.lost;
    if (g.tickets.length > 0) {
      g.tickets[0].patience = 0.1;
      step(g, 0.3);
      check('tiket hangus dihitung', g.lost === lostBefore + 1);
      check('kombo reset saat hangus', g.combo === 0);
    }
    // shift selesai
    g.timeLeft = 0.1;
    step(g, 0.2);
    check('shift berakhir -> over', g.phase === 'over');
    var result = { passed: pass, failed: fail, log: log };
    window.__SELFTEST = result;
    document.title = fail === 0 ? 'SELFTEST PASS ' + pass + '/' + (pass + fail) : 'SELFTEST FAIL ' + fail;
    return result;
  }

  window.WK_SHOTS = { SHOTS: SHOTS, selfTest: selfTest };
})();
