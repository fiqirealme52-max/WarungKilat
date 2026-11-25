// Warung Kilat — boot + loop utama. ?shot=... render sekali dengan waktu
// tetap (deterministik untuk screenshot); tanpa shot, loop rAF biasa.
(function () {
  'use strict';

  function qs(name) {
    var m = new RegExp('[?&]' + name + '=([^&]*)').exec(window.location.search);
    return m ? decodeURIComponent(m[1]) : null;
  }

  function boot() {
    var canvas = document.getElementById('game');
    var ctx = canvas.getContext('2d');
    var shot = qs('shot');
    var seed = parseInt(qs('seed') || '1', 10) || 1;
    var game;

    if (shot && window.WK_SHOTS.SHOTS[shot]) {
      game = window.WK_SHOTS.SHOTS[shot]();
      var frozen = 2.0; // waktu animasi tetap: api + uap sama di tiap run
      window.WK_RENDER.render(ctx, game, frozen);
      window.WK = { game: game, shot: shot };
      return;
    }

    if (qs('selftest') === '1') {
      var res = window.WK_SHOTS.selfTest();
      var pre = document.createElement('pre');
      pre.id = 'selftest';
      pre.textContent = JSON.stringify(res);
      document.body.appendChild(pre);
      window.WK = { selftest: res };
      return;
    }

    game = window.WK_WORLD.newGame(seed);
    window.WK = { game: game };
    var last = performance.now();
    var t0 = last;

    function frame(now) {
      var dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      var time = (now - t0) / 1000;
      window.WK_WORLD.tick(game, dt);
      window.WK_RENDER.render(ctx, game, time);
      requestAnimationFrame(frame);
    }

    canvas.addEventListener('click', function (ev) {
      var r = canvas.getBoundingClientRect();
      var x = (ev.clientX - r.left) * (1280 / r.width);
      var y = (ev.clientY - r.top) * (720 / r.height);
      var ok = window.WK_INPUT.click(game, x, y);
      if (ok && window.WK_AUDIO) window.WK_AUDIO.click();
    });
    window.addEventListener('keydown', function (ev) {
      if (ev.code === 'Space' || ev.code === 'ArrowUp' || ev.code === 'ArrowDown') ev.preventDefault();
      var ok = window.WK_INPUT.key(game, ev.code);
      if (ok && window.WK_AUDIO) window.WK_AUDIO.click();
      if (!ok && game.phase === 'playing' && window.WK_AUDIO) window.WK_AUDIO.error();
    });

    requestAnimationFrame(frame);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
