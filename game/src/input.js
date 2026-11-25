// Warung Kilat — input mouse + keyboard. Klik memakai rect yang sama dengan
// yang digambar render.js (dari WK_CONFIG), jadi tidak ada zona mati/nyasar.
(function () {
  'use strict';

  var CFG = window.WK_CONFIG;
  var WORLD = window.WK_WORLD;
  var DATA = window.WK_DATA;

  function inside(x, y, r) {
    return x >= r.x && x <= r.x + r.w && y >= r.y && y <= r.y + r.h;
  }

  function jarRect(i) {
    var col = i % 2, row = (i / 2) | 0;
    return {
      x: CFG.JAR_X0 + col * (CFG.JAR_W + CFG.JAR_GAP),
      y: CFG.JAR_Y0 + row * (CFG.JAR_H + CFG.JAR_GAP),
      w: CFG.JAR_W, h: CFG.JAR_H,
    };
  }

  function click(game, x, y) {
    if (game.phase === 'title') { WORLD.startGame(game); return true; }
    if (game.phase === 'over') return false;
    if (inside(x, y, CFG.BATTER)) return WORLD.pourBatter(game);
    if (inside(x, y, CFG.BUTTER)) return WORLD.addButter(game);
    if (inside(x, y, CFG.FOLD_BTN)) return WORLD.fold(game);
    if (inside(x, y, CFG.SERVE_BTN)) return WORLD.cutAndPlate(game);
    if (inside(x, y, CFG.BIN)) return WORLD.discard(game);
    if (inside(x, y, CFG.READY)) return WORLD.serve(game);
    if (inside(x, y, CFG.BELL)) return WORLD.serve(game);
    for (var i = 0; i < DATA.TOPPINGS.length; i++) {
      if (inside(x, y, jarRect(i))) return WORLD.addTopping(game, DATA.TOPPINGS[i].id);
    }
    // klik wajan: kalau sudah terlipat, potong; kalau sedang topping, tidak apa-apa
    var G = CFG.GRIDDLE;
    var dx = (x - G.cx) / G.rx, dy = (y - G.cy) / G.ry;
    if (dx * dx + dy * dy <= 1) {
      if (game.griddle.stage === 'folded') return WORLD.cutAndPlate(game);
      return true;
    }
    return false;
  }

  function key(game, code) {
    if (code === 'KeyR' && game.phase === 'over') { WORLD.startGame(game); return true; }
    if (game.phase === 'title' && (code === 'Enter' || code === 'Space')) { WORLD.startGame(game); return true; }
    if (game.phase !== 'playing') return false;
    if (code === 'Digit1') return WORLD.pourBatter(game);
    if (code === 'Digit2') return WORLD.addButter(game);
    if (code === 'KeyF') return WORLD.fold(game);
    if (code === 'KeyB') return WORLD.discard(game);
    if (code === 'Space') {
      if (game.griddle.stage === 'folded') return WORLD.cutAndPlate(game);
      return WORLD.serve(game);
    }
    for (var i = 0; i < DATA.TOPPINGS.length; i++) {
      if (code === 'Digit' + DATA.TOPPINGS[i].key) return WORLD.addTopping(game, DATA.TOPPINGS[i].id);
    }
    return false;
  }

  window.WK_INPUT = { click: click, key: key, inside: inside, jarRect: jarRect };
})();
