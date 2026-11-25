// Warung Kilat — render DOM di atas FOTO (bukan canvas).
// Semua scene/makanan/orang adalah foto <img>; yang digambar UI hanya
// panel, bar, tombol, dan label (HTML/CSS di atas foto).
(function () {
  'use strict';

  var CFG = window.WK_CONFIG;
  var DATA = window.WK_DATA;
  var WORLD = window.WK_WORLD;

  var el = {};
  var jarsBuilt = false;
  var curBg = '';

  function $(id) { return document.getElementById(id); }

  function rupiah(n) { return 'Rp ' + n.toLocaleString('id-ID'); }

  function fmtTime(s) {
    s = Math.max(0, Math.ceil(s));
    return Math.floor(s / 60) + ':' + ('0' + (s % 60)).slice(-2);
  }

  function esc(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  function buildJars() {
    var wrap = $('jars');
    wrap.innerHTML = '';
    DATA.TOPPINGS.forEach(function (t) {
      var b = document.createElement('button');
      b.className = 'jar';
      b.id = 'jar-' + t.id;
      b.type = 'button';
      b.innerHTML = '<img src="' + t.img + '" alt=""><span class="jar-name">' + esc(t.name) +
        '</span><span class="jar-key">' + t.key + '</span><span class="jar-used">SUDAH DIPAKAI ✓</span>';
      b.addEventListener('click', function () {
        if (window.WK && window.WK.game) {
          var ok = WORLD.addTopping(window.WK.game, t.id);
          if (window.WK_AUDIO) window.WK_AUDIO.click();
          if (!ok && window.WK_AUDIO) window.WK_AUDIO.error();
        }
      });
      wrap.appendChild(b);
    });
    jarsBuilt = true;
  }

  function ticketHTML(t) {
    var pct = Math.max(0, Math.min(100, (t.patience / t.patienceMax) * 100));
    var urgent = t.patience < 15;
    var chips = t.recipe.toppings.map(function (id) {
      var tp = DATA.toppingById(id);
      return '<span class="chip"><i style="background:' + tp.color + '"></i>' + esc(tp.name) + '</span>';
    }).join('');
    return '<div class="ticket' + (urgent ? ' urgent' : '') + '">' +
      '<img class="face" src="' + t.customer.photo + '" alt="">' +
      '<div class="t-info">' +
      '<div class="t-name">' + esc(t.customer.name) + ' <span class="t-price">' + rupiah(t.price) + '</span></div>' +
      '<div class="t-dish">Martabak</div>' +
      '<div class="t-recipe">' + esc(t.recipe.name) + '</div>' +
      '<div class="t-chips">' + chips + '</div>' +
      '<div class="t-bar"><i style="width:' + pct + '%"></i></div>' +
      '<div class="t-time">' + Math.ceil(t.patience) + ' dtk' + (urgent ? ' · BURU-BURU!' : '') + '</div>' +
      '</div></div>';
  }

  function render(game) {
    if (!jarsBuilt) buildJars();
    el.bg = el.bg || $('bg-img');
    el.score = el.score || $('score');
    el.subScore = el.subScore || $('sub-score');
    el.timer = el.timer || $('timer');
    el.tickets = el.tickets || $('tickets');
    el.railCount = el.railCount || $('rail-count');
    el.label = el.label || $('griddle-label');
    el.plateImg = el.plateImg || $('plate-img');
    el.readyStatus = el.readyStatus || $('ready-status');
    el.ready = el.ready || $('ready');
    el.hint = el.hint || $('hint');
    el.popups = el.popups || $('popups');
    el.title = el.title || $('title-overlay');
    el.over = el.over || $('gameover');
    el.finalScore = el.finalScore || $('final-score');
    el.flash = el.flash || $('flash');
    el.btnBatter = el.btnBatter || $('btn-batter');
    el.btnButter = el.btnButter || $('btn-butter');
    el.btnFold = el.btnFold || $('btn-fold');
    el.btnCut = el.btnCut || $('btn-cut');
    el.btnBin = el.btnBin || $('btn-bin');

    // Latar foto: hero untuk gerobak, close-up wajan saat ada adonan.
    var bg = CFG.IMG.hero;
    if (game.shotBg) bg = game.shotBg;
    else if (game.phase === 'playing' && game.griddle.stage !== 'empty') bg = CFG.IMG.griddle;
    if (bg !== curBg) { el.bg.src = bg; curBg = bg; }

    // Bar atas.
    el.score.textContent = rupiah(game.score);
    el.subScore.textContent = 'SERVED ' + game.served + ' · LOST ' + game.lost + ' · KOMBO x' + game.combo;
    el.timer.textContent = fmtTime(game.timeLeft);

    // Tiket pesanan.
    el.railCount.textContent = game.tickets.length + '/3';
    el.tickets.innerHTML = game.tickets.map(ticketHTML).join('');

    // Rak topping: tandai yang sudah dipakai di wajan.
    var g = game.griddle;
    DATA.TOPPINGS.forEach(function (t) {
      var b = $('jar-' + t.id);
      if (!b) return;
      var used = g.toppings.indexOf(t.id) >= 0;
      b.classList.toggle('used', used);
      b.classList.toggle('wrong', used && g.wrong && g.toppings[g.toppings.length - 1] === t.id);
    });

    // Label progres wajan (selalu dari objek wajan, bukan game).
    if (game.phase === 'title') {
      el.label.style.display = 'none';
    } else {
      el.label.style.display = 'block';
      el.label.textContent = WORLD.stageLabel(game.griddle);
    }

    // Piring siap: foto martabak hanya kalau ada isinya.
    if (game.plate) {
      el.plateImg.style.display = 'block';
      el.plateImg.src = CFG.IMG.plate;
      var price = '';
      for (var i = 0; i < game.tickets.length; i++) {
        if (WORLD.sameSet(game.tickets[i].recipe.toppings, game.plate.toppings)) {
          price = ' · ' + rupiah(game.tickets[i].price);
          break;
        }
      }
      el.readyStatus.textContent = 'SIAP DISAJIKAN' + price;
      el.ready.classList.add('full');
    } else {
      el.plateImg.style.display = 'none';
      el.readyStatus.textContent = '';
      el.ready.classList.remove('full');
    }

    // Tombol counter: aktif hanya pada langkah yang sah.
    var playing = game.phase === 'playing';
    el.btnBatter.disabled = !playing || g.stage !== 'empty';
    el.btnButter.disabled = !playing || g.stage !== 'needs-butter';
    el.btnFold.disabled = !playing || !(g.stage === 'topping' && g.toppings.length >= 2);
    el.btnCut.disabled = !playing || g.stage !== 'folded';
    el.btnBin.disabled = !playing || g.stage === 'empty';

    // Hint.
    if (playing && game.hintLife > 0 && game.hint) {
      el.hint.style.display = 'block';
      el.hint.textContent = game.hint;
    } else {
      el.hint.style.display = 'none';
    }

    // Popup +Rp.
    el.popups.innerHTML = game.popups.map(function (p) {
      var o = Math.max(0, Math.min(1, p.life));
      return '<div class="popup" style="opacity:' + o + '">' + esc(p.text) + '</div>';
    }).join('');

    // Overlay judul / akhir shift / kilat.
    el.title.style.display = game.phase === 'title' ? 'flex' : 'none';
    if (game.phase === 'over') {
      el.over.style.display = 'flex';
      el.finalScore.textContent = rupiah(game.score) + ' · ' + game.served +
        ' disajikan · kombo terbaik x' + game.bestCombo;
    } else {
      el.over.style.display = 'none';
    }
    el.flash.style.opacity = game.flash > 0 ? Math.min(0.55, game.flash * 2) : 0;
  }

  window.WK_RENDER = { render: render };
})();
