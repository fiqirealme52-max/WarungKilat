// Warung Kilat — input: tombol DOM + keyboard (mapping sama dengan spek).
// 1 adonan, 2 mentega, 3-8 topping, F lipat, Spasi potong/saji, B buang, R ulang.
(function () {
  'use strict';

  var WORLD = window.WK_WORLD;
  var DATA = window.WK_DATA;

  function bindButtons(game) {
    function act(fn) {
      return function () {
        if (game.phase === 'title') { WORLD.startGame(game); return; }
        var ok = fn();
        if (window.WK_AUDIO) { if (ok) window.WK_AUDIO.click(); else window.WK_AUDIO.error(); }
      };
    }
    document.getElementById('btn-batter').addEventListener('click', act(function () { return WORLD.pourBatter(game); }));
    document.getElementById('btn-butter').addEventListener('click', act(function () { return WORLD.addButter(game); }));
    document.getElementById('btn-fold').addEventListener('click', act(function () { return WORLD.fold(game); }));
    document.getElementById('btn-cut').addEventListener('click', act(function () { return WORLD.cutAndPlate(game); }));
    document.getElementById('btn-bin').addEventListener('click', act(function () { return WORLD.discard(game); }));
    document.getElementById('bell').addEventListener('click', act(function () { return WORLD.serve(game); }));
    document.getElementById('ready').addEventListener('click', function (ev) {
      if (ev.target.id === 'bell') return; // sudah ditangani tombol bel
      act(function () { return WORLD.serve(game); })();
    });
    document.getElementById('title-overlay').addEventListener('click', function () {
      if (game.phase === 'title') WORLD.startGame(game);
    });
    document.getElementById('stage').addEventListener('click', function () {
      if (game.phase === 'title') WORLD.startGame(game);
    });
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

  window.WK_INPUT = { bindButtons: bindButtons, key: key };
})();
