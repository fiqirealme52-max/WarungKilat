// Warung Kilat — boot + loop utama (render DOM).
// ?shot=... render sekali dengan state tetap (deterministik untuk screenshot);
// ?selftest=1 jalankan tes mekanik; tanpa itu loop rAF biasa.
(function () {
  'use strict';

  function qs(name) {
    var m = new RegExp('[?&]' + name + '=([^&]*)').exec(window.location.search);
    return m ? decodeURIComponent(m[1]) : null;
  }

  var SHOT_BG = { cover: 'img/hero.jpg', start: 'img/hero.jpg', cook: 'img/griddle.jpg', serve: 'img/hero.jpg' };

  function boot() {
    var shot = qs('shot');
    var seed = parseInt(qs('seed') || '1', 10) || 1;
    var game;

    if (shot && window.WK_SHOTS.SHOTS[shot]) {
      game = window.WK_SHOTS.SHOTS[shot]();
      game.shotBg = SHOT_BG[shot];
      window.WK = { game: game, shot: shot };
      document.getElementById('stage').classList.add('frozen'); // matikan animasi pulse: screenshot deterministik
      window.WK_RENDER.render(game);
      document.title = 'SHOT ' + shot;
      return;
    }

    if (qs('selftest') === '1') {
      var res = window.WK_SHOTS.selfTest();
      var pre = document.createElement('pre');
      pre.id = 'selftest';
      pre.textContent = JSON.stringify(res);
      document.body.appendChild(pre);
      window.WK = { selftest: res };
      document.title = res.failed === 0 ? 'SELFTEST PASS ' + res.passed + '/' + (res.passed + res.failed) : 'SELFTEST FAIL ' + res.failed;
      return;
    }

    game = window.WK_WORLD.newGame(seed);
    window.WK = { game: game };
    window.WK_INPUT.bindButtons(game);

    window.addEventListener('keydown', function (ev) {
      if (ev.code === 'Space' || ev.code === 'ArrowUp' || ev.code === 'ArrowDown') ev.preventDefault();
      var ok = window.WK_INPUT.key(game, ev.code);
      if (window.WK_AUDIO) { if (ok) window.WK_AUDIO.click(); else if (game.phase === 'playing') window.WK_AUDIO.error(); }
    });

    var last = performance.now();
    function frame(now) {
      var dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      window.WK_WORLD.tick(game, dt);
      window.WK_RENDER.render(game);
      requestAnimationFrame(frame);
    }
    window.WK_RENDER.render(game);
    requestAnimationFrame(frame);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
