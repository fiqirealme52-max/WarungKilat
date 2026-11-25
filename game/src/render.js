// Warung Kilat — semua gambar digambar kode di canvas 2D (tanpa aset luar).
// render(ctx, game, time): time detik untuk animasi (api, uap); shot memakai
// time tetap supaya screenshot bisa diulang.
(function () {
  'use strict';

  var CFG = window.WK_CONFIG;
  var DATA = window.WK_DATA;
  var P = CFG.PALETTE;

  function rr(ctx, x, y, w, h, r) {
    r = Math.min(r, w / 2, h / 2);
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  function ell(ctx, cx, cy, rx, ry) {
    ctx.beginPath();
    ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
  }

  function text(ctx, s, x, y, font, color, align, baseline) {
    ctx.font = font;
    ctx.fillStyle = color;
    ctx.textAlign = align || 'left';
    ctx.textBaseline = baseline || 'alphabetic';
    ctx.fillText(s, x, y);
  }

  function shadow(ctx, on) {
    if (on) { ctx.shadowColor = 'rgba(0,0,0,0.45)'; ctx.shadowBlur = 10; ctx.shadowOffsetY = 4; }
    else { ctx.shadowColor = 'transparent'; ctx.shadowBlur = 0; ctx.shadowOffsetY = 0; }
  }

  function rp(n) { return 'Rp ' + Math.round(n).toLocaleString('id-ID'); }

  function fmtTime(sec) {
    sec = Math.max(0, Math.ceil(sec));
    return Math.floor(sec / 60) + ':' + String(sec % 60).padStart(2, '0');
  }

  // ---------------------------------------------------------------- latar
  function drawBackground(ctx, time) {
    var g = ctx.createLinearGradient(0, 0, 0, 720);
    g.addColorStop(0, P.skyTop);
    g.addColorStop(0.35, P.skyMid);
    g.addColorStop(1, P.skyLow);
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 1280, 720);

    // matahari sore kiri atas
    var sun = ctx.createRadialGradient(150, 130, 10, 150, 130, 220);
    sun.addColorStop(0, 'rgba(255,214,120,0.85)');
    sun.addColorStop(0.4, 'rgba(255,170,60,0.35)');
    sun.addColorStop(1, 'rgba(255,170,60,0)');
    ctx.fillStyle = sun;
    ctx.fillRect(0, 0, 420, 360);
    ctx.fillStyle = '#ffd878';
    ell(ctx, 150, 130, 46, 46); ctx.fill();

    // dinding bata
    ctx.fillStyle = P.wall;
    ctx.fillRect(0, 300, 1280, 420);
    ctx.strokeStyle = P.brickLine;
    ctx.lineWidth = 2;
    for (var y = 316; y < 720; y += 34) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(1280, y); ctx.stroke();
      var off = ((y / 34) | 0) % 2 ? 60 : 0;
      for (var x = off; x < 1280; x += 120) {
        ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x, y + 34); ctx.stroke();
      }
    }
    // noda asap di dinding
    ctx.fillStyle = 'rgba(0,0,0,0.12)';
    ell(ctx, 592, 330, 320, 40); ctx.fill();
    ell(ctx, 200, 640, 180, 30); ctx.fill();

    // lampu gantung (digantung dari bawah awning, di celah bebas kiri/kanan koki)
    drawLamp(ctx, 350, 108, 26, time);
    drawLamp(ctx, 855, 108, 26, time + 1.3);

    // awning garis merah-krem di tepi atas
    for (var i = 0; i < 16; i++) {
      ctx.fillStyle = i % 2 ? P.awningCream : P.awningRed;
      ctx.fillRect(i * 80, 0, 80, 64);
      ctx.fillStyle = 'rgba(0,0,0,0.18)';
      ctx.fillRect(i * 80, 56, 80, 8);
    }
    ctx.fillStyle = 'rgba(0,0,0,0.25)';
    ctx.fillRect(0, 64, 1280, 4);
  }

  function drawLamp(ctx, x, y, r, time) {
    var flick = 0.85 + 0.15 * Math.sin(time * 2.1 + x);
    var glow = ctx.createRadialGradient(x, y, 4, x, y, r * 3.2);
    glow.addColorStop(0, 'rgba(255,200,90,' + (0.55 * flick) + ')');
    glow.addColorStop(1, 'rgba(255,200,90,0)');
    ctx.fillStyle = glow;
    ctx.fillRect(x - r * 3.2, y - r * 3.2, r * 6.4, r * 6.4);
    ctx.strokeStyle = '#2b1a0e';
    ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(x, 64); ctx.lineTo(x, y - r); ctx.stroke();
    ctx.fillStyle = '#3a2412';
    ell(ctx, x, y, r * 0.95, r * 1.05); ctx.fill();
    ctx.fillStyle = '#ffcf5e';
    ell(ctx, x, y, r * 0.62, r * 0.72); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.65)';
    ell(ctx, x - r * 0.2, y - r * 0.25, r * 0.18, r * 0.22); ctx.fill();
  }

  // ---------------------------------------------------------------- top bar
  function drawTopBar(ctx, game) {
    // papan nama di tengah
    shadow(ctx, true);
    ctx.fillStyle = '#3a2412';
    rr(ctx, CFG.SIGN.x, CFG.SIGN.y, CFG.SIGN.w, CFG.SIGN.h, 10); ctx.fill();
    shadow(ctx, false);
    ctx.strokeStyle = P.gold; ctx.lineWidth = 2;
    rr(ctx, CFG.SIGN.x + 3, CFG.SIGN.y + 3, CFG.SIGN.w - 6, CFG.SIGN.h - 6, 8); ctx.stroke();
    text(ctx, 'WARUNG KILAT', 640, 34, '900 30px Arial, sans-serif', '#ffd878', 'center', 'middle');
    text(ctx, 'MARTABAK GEROBAK', 640, 54, '700 11px Arial, sans-serif', '#f2e3c6', 'center', 'middle');

    // skor kiri
    shadow(ctx, true);
    ctx.fillStyle = 'rgba(20,10,4,0.85)';
    rr(ctx, CFG.SCORE_BOX.x, CFG.SCORE_BOX.y, CFG.SCORE_BOX.w, CFG.SCORE_BOX.h, 10); ctx.fill();
    shadow(ctx, false);
    text(ctx, rp(game.score), 22, 30, '900 24px Arial, sans-serif', '#ffd23d', 'left', 'middle');
    text(ctx, 'SERVED ' + game.served + '   LOST ' + game.lost + '   KOMBO x' + game.combo,
      22, 48, '700 12px Arial, sans-serif', '#f2e3c6', 'left', 'middle');

    // timer kanan
    var urgent = game.timeLeft <= 30 && game.phase === 'playing';
    shadow(ctx, true);
    ctx.fillStyle = urgent ? 'rgba(120,20,10,0.9)' : 'rgba(20,10,4,0.85)';
    rr(ctx, CFG.TIMER_BOX.x, CFG.TIMER_BOX.y, CFG.TIMER_BOX.w, CFG.TIMER_BOX.h, 10); ctx.fill();
    shadow(ctx, false);
    text(ctx, fmtTime(game.timeLeft), 1052, 30, '900 26px Arial, sans-serif', urgent ? '#ff8a70' : '#ffffff', 'left', 'middle');
    text(ctx, 'SISA SHIFT', 1152, 30, '700 12px Arial, sans-serif', '#f2e3c6', 'left', 'middle');
    text(ctx, '3 MENIT', 1152, 48, '700 11px Arial, sans-serif', '#c9a896', 'left', 'middle');
  }

  // ---------------------------------------------------------------- wajah
  function drawFace(ctx, cx, cy, r, c) {
    // bahu / baju
    ctx.fillStyle = c.shirt;
    ctx.beginPath();
    ctx.moveTo(cx - r * 1.15, cy + r * 1.9);
    ctx.quadraticCurveTo(cx, cy + r * 0.9, cx + r * 1.15, cy + r * 1.9);
    ctx.closePath(); ctx.fill();
    // wajah
    ctx.fillStyle = c.skin;
    ell(ctx, cx, cy, r, r * 1.08); ctx.fill();
    // rambut / penutup kepala
    ctx.fillStyle = c.hair;
    if (c.hairStyle === 'bun') {
      ctx.beginPath(); ctx.arc(cx, cy - r * 0.55, r * 0.95, Math.PI, 0); ctx.fill();
      ell(ctx, cx, cy - r * 1.15, r * 0.34, r * 0.34); ctx.fill();
    } else if (c.hairStyle === 'peci' || c.hairStyle === 'sanggul') {
      ctx.beginPath(); ctx.arc(cx, cy - r * 0.6, r * 0.92, Math.PI, 0); ctx.fill();
      ctx.fillRect(cx - r * 0.92, cy - r * 0.72, r * 1.84, r * 0.3);
    } else if (c.hairStyle === 'ponytail') {
      ctx.beginPath(); ctx.arc(cx, cy - r * 0.55, r * 0.95, Math.PI, 0); ctx.fill();
      ell(ctx, cx + r * 0.95, cy + r * 0.2, r * 0.22, r * 0.75); ctx.fill();
    } else if (c.hairStyle === 'flat') {
      ctx.beginPath(); ctx.arc(cx, cy - r * 0.62, r * 0.9, Math.PI, 0); ctx.fill();
      ctx.fillRect(cx - r * 0.9, cy - r * 0.62, r * 1.8, r * 0.22);
    } else if (c.hairStyle === 'spiky') {
      for (var i = -2; i <= 2; i++) {
        ctx.beginPath();
        ctx.moveTo(cx + i * r * 0.4 - r * 0.18, cy - r * 0.5);
        ctx.lineTo(cx + i * r * 0.4, cy - r * 1.15);
        ctx.lineTo(cx + i * r * 0.4 + r * 0.18, cy - r * 0.5);
        ctx.closePath(); ctx.fill();
      }
    }
    if (c.item === 'kerudung') {
      ctx.fillStyle = c.shirt;
      ctx.beginPath(); ctx.arc(cx, cy - r * 0.1, r * 1.25, Math.PI * 1.02, Math.PI * 1.98); ctx.fill();
      ctx.fillStyle = c.skin;
      ell(ctx, cx, cy + r * 0.05, r * 0.82, r * 0.9); ctx.fill();
    }
    if (c.item === 'topi') {
      ctx.fillStyle = '#c96a1e';
      ctx.beginPath(); ctx.arc(cx, cy - r * 0.62, r * 0.95, Math.PI, 0); ctx.fill();
      ctx.fillRect(cx - r * 0.95, cy - r * 0.7, r * 1.9, r * 0.26);
      ell(ctx, cx + r * 0.3, cy - r * 0.55, r * 0.7, r * 0.16); ctx.fill();
    }
    if (c.item === 'headset') {
      ctx.strokeStyle = '#222'; ctx.lineWidth = 5;
      ctx.beginPath(); ctx.arc(cx, cy - r * 0.1, r * 1.05, Math.PI * 1.1, Math.PI * 1.9); ctx.stroke();
      ctx.fillStyle = '#222';
      ell(ctx, cx - r * 1.0, cy + r * 0.1, r * 0.18, r * 0.28); ctx.fill();
      ell(ctx, cx + r * 1.0, cy + r * 0.1, r * 0.18, r * 0.28); ctx.fill();
    }
    // mata + senyum
    ctx.fillStyle = '#1c1210';
    ell(ctx, cx - r * 0.36, cy - r * 0.05, r * 0.09, r * 0.13); ctx.fill();
    ell(ctx, cx + r * 0.36, cy - r * 0.05, r * 0.09, r * 0.13); ctx.fill();
    ctx.strokeStyle = '#7a3a1e'; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.arc(cx, cy + r * 0.28, r * 0.42, Math.PI * 0.15, Math.PI * 0.85); ctx.stroke();
    if (c.item === 'anting') {
      ctx.fillStyle = '#ffd23d';
      ell(ctx, cx - r * 0.95, cy + r * 0.25, r * 0.09, r * 0.09); ctx.fill();
    }
    if (c.item === 'pita') {
      ctx.fillStyle = '#d63d2a';
      ctx.beginPath();
      ctx.moveTo(cx + r * 0.55, cy - r * 0.85);
      ctx.lineTo(cx + r * 1.05, cy - r * 1.05); ctx.lineTo(cx + r * 1.05, cy - r * 0.6);
      ctx.closePath(); ctx.fill();
      ctx.beginPath();
      ctx.moveTo(cx + r * 0.55, cy - r * 0.85);
      ctx.lineTo(cx + r * 0.15, cy - r * 1.05); ctx.lineTo(cx + r * 0.15, cy - r * 0.6);
      ctx.closePath(); ctx.fill();
    }
  }

  // ---------------------------------------------------------------- tiket
  function drawTickets(ctx, game, time) {
    text(ctx, 'PESANAN', 16, 92, '900 20px Arial, sans-serif', '#ffd878', 'left', 'middle');
    text(ctx, game.tickets.length + '/3', 268, 92, '700 14px Arial, sans-serif', '#f2e3c6', 'right', 'middle');
    for (var i = 0; i < 3; i++) {
      var y = CFG.TICKET_Y0 + i * (CFG.TICKET_H + CFG.TICKET_GAP);
      var t = game.tickets[i];
      if (!t) {
        // slot kosong: tanpa kertas — hanya garis putus-putus di dinding
        ctx.strokeStyle = 'rgba(242,227,198,0.5)';
        ctx.setLineDash([6, 6]); ctx.lineWidth = 2;
        rr(ctx, CFG.TICKET_X, y, CFG.TICKET_W, CFG.TICKET_H, 12); ctx.stroke();
        ctx.setLineDash([]);
        text(ctx, 'menunggu pesanan...', CFG.TICKET_X + CFG.TICKET_W / 2, y + CFG.TICKET_H / 2,
          '700 15px Arial, sans-serif', 'rgba(242,227,198,0.8)', 'center', 'middle');
        continue;
      }
      shadow(ctx, true);
      ctx.fillStyle = i === 0 ? '#fbf3dd' : '#f0e2c2';
      rr(ctx, CFG.TICKET_X, y, CFG.TICKET_W, CFG.TICKET_H, 12); ctx.fill();
      shadow(ctx, false);
      var frac = Math.max(0, t.patience / t.patienceMax);
      var low = frac < 0.3;
      ctx.strokeStyle = low ? '#d63d2a' : '#8a5f36';
      ctx.lineWidth = low ? 3 : 2;
      rr(ctx, CFG.TICKET_X, y, CFG.TICKET_W, CFG.TICKET_H, 12); ctx.stroke();
      // wajah pelanggan
      ctx.save();
      ctx.beginPath(); ctx.arc(58, y + 52, 36, 0, Math.PI * 2); ctx.clip();
      ctx.fillStyle = '#e8dcc0'; ctx.fillRect(22, y + 16, 72, 72);
      ctx.restore();
      drawFace(ctx, 58, y + 52, 30, t.customer);
      text(ctx, t.customer.name, 104, y + 30, '900 16px Arial, sans-serif', '#2b1a0e', 'left', 'middle');
      text(ctx, 'Martabak', 104, y + 56, '700 14px Arial, sans-serif', '#6b4423', 'left', 'middle');
      text(ctx, t.recipe.name, 104, y + 80, '900 19px Arial, sans-serif', '#8a2f23', 'left', 'middle');
      // chip topping
      var cx = 104;
      for (var k = 0; k < t.recipe.toppings.length; k++) {
        var tp = DATA.toppingById(t.recipe.toppings[k]);
        ctx.fillStyle = tp.color;
        ell(ctx, cx + 8, y + 108, 9, 9); ctx.fill();
        ctx.strokeStyle = 'rgba(0,0,0,0.3)'; ctx.lineWidth = 1;
        ell(ctx, cx + 8, y + 108, 9, 9); ctx.stroke();
        text(ctx, tp.name, cx + 22, y + 108, '700 14px Arial, sans-serif', '#2b1a0e', 'left', 'middle');
        cx += 26 + ctx.measureText(tp.name).width + 18;
      }
      text(ctx, rp(t.price), CFG.TICKET_X + CFG.TICKET_W - 14, y + 30, '900 18px Arial, sans-serif', '#2e7d32', 'right', 'middle');
      // bar kesabaran
      ctx.fillStyle = '#d9c9a8';
      rr(ctx, CFG.TICKET_X + 14, y + CFG.TICKET_H - 34, CFG.TICKET_W - 28, 14, 7); ctx.fill();
      ctx.fillStyle = frac > 0.5 ? P.green : frac > 0.3 ? '#e8a13d' : '#d63d2a';
      if (frac > 0.01) { rr(ctx, CFG.TICKET_X + 14, y + CFG.TICKET_H - 34, (CFG.TICKET_W - 28) * frac, 14, 7); ctx.fill(); }
      text(ctx, Math.ceil(t.patience) + ' dtk', CFG.TICKET_X + CFG.TICKET_W - 14, y + CFG.TICKET_H - 12,
        '700 12px Arial, sans-serif', '#6b4423', 'right', 'middle');
      if (low) text(ctx, 'BURU-BURU!', CFG.TICKET_X + 14, y + CFG.TICKET_H - 12, '900 12px Arial, sans-serif', '#d63d2a', 'left', 'middle');
    }
  }

  // ---------------------------------------------------------------- koki
  function drawChef(ctx, game, time) {
    var bob = Math.sin(time * 1.6) * 3;
    var cx = 560;
    var hy = 168 + bob; // kepala diturunkan: peci tidak lagi terpotong papan nama
    // bahu + celemek
    ctx.fillStyle = '#f2ede2';
    ctx.beginPath();
    ctx.moveTo(cx - 150, 300);
    ctx.quadraticCurveTo(cx - 140, 210, cx - 90, 205);
    ctx.lineTo(cx + 90, 205);
    ctx.quadraticCurveTo(cx + 140, 210, cx + 150, 300);
    ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#a83226';
    ctx.beginPath();
    ctx.moveTo(cx - 78, 300);
    ctx.lineTo(cx - 62, 212);
    ctx.lineTo(cx + 62, 212);
    ctx.lineTo(cx + 78, 300);
    ctx.closePath(); ctx.fill();
    text(ctx, 'KILAT', cx, 262, '900 16px Arial, sans-serif', '#ffd878', 'center', 'middle');
    // lengan kiri -> ke tepi wajan
    ctx.strokeStyle = '#f2ede2'; ctx.lineWidth = 30; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(cx - 120, 235); ctx.quadraticCurveTo(400, 300, 415, 375); ctx.stroke();
    ctx.strokeStyle = '#c98d5f'; ctx.lineWidth = 24;
    ctx.beginPath(); ctx.moveTo(408, 340); ctx.lineTo(415, 375); ctx.stroke();
    // tangan kiri memegang lap
    ctx.fillStyle = '#c98d5f';
    ell(ctx, 416, 380, 16, 13); ctx.fill();
    // lengan kanan -> spatula di atas wajan
    var wave = Math.sin(time * 2.4) * 8;
    ctx.strokeStyle = '#f2ede2'; ctx.lineWidth = 30;
    ctx.beginPath(); ctx.moveTo(cx + 120, 235); ctx.quadraticCurveTo(760, 290, 745, 350 + wave); ctx.stroke();
    ctx.strokeStyle = '#c98d5f'; ctx.lineWidth = 24;
    ctx.beginPath(); ctx.moveTo(745, 320 + wave); ctx.lineTo(745, 350 + wave); ctx.stroke();
    ctx.fillStyle = '#c98d5f';
    ell(ctx, 745, 356 + wave, 16, 13); ctx.fill();
    // spatula
    ctx.strokeStyle = '#8a5f36'; ctx.lineWidth = 9;
    ctx.beginPath(); ctx.moveTo(745, 356 + wave); ctx.lineTo(700, 420); ctx.stroke();
    ctx.fillStyle = '#c9c9c9';
    ctx.beginPath();
    ctx.moveTo(700, 420); ctx.lineTo(668, 448); ctx.lineTo(700, 462); ctx.lineTo(724, 436);
    ctx.closePath(); ctx.fill();
    // kepala
    ctx.fillStyle = '#c98d5f';
    ell(ctx, cx, hy, 66, 72); ctx.fill();
    // peci hitam
    ctx.fillStyle = '#1c1c1c';
    ctx.beginPath(); ctx.arc(cx, hy - 18, 66, Math.PI, 0); ctx.fill();
    ctx.fillRect(cx - 66, hy - 26, 132, 14);
    // mata, alis, senyum, kumis
    ctx.fillStyle = '#1c1210';
    ell(ctx, cx - 26, hy - 6, 6, 8); ctx.fill();
    ell(ctx, cx + 26, hy - 6, 6, 8); ctx.fill();
    ctx.strokeStyle = '#1c1210'; ctx.lineWidth = 4;
    ctx.beginPath(); ctx.moveTo(cx - 34, hy - 20); ctx.lineTo(cx - 18, hy - 24); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(cx + 18, hy - 24); ctx.lineTo(cx + 34, hy - 20); ctx.stroke();
    ctx.strokeStyle = '#7a3a1e'; ctx.lineWidth = 4;
    ctx.beginPath(); ctx.arc(cx, hy + 22, 26, Math.PI * 0.12, Math.PI * 0.88); ctx.stroke();
    ctx.strokeStyle = '#2a1a0c'; ctx.lineWidth = 5;
    ctx.beginPath(); ctx.moveTo(cx - 22, hy + 14); ctx.quadraticCurveTo(cx, hy + 20, cx + 22, hy + 14); ctx.stroke();
    // pipi merah
    ctx.fillStyle = 'rgba(214,61,42,0.35)';
    ell(ctx, cx - 42, hy + 14, 10, 7); ctx.fill();
    ell(ctx, cx + 42, hy + 14, 10, 7); ctx.fill();
  }

  // ---------------------------------------------------------------- wajan
  function drawGriddle(ctx, game, time) {
    var G = CFG.GRIDDLE;
    var g = game.griddle;
    // bara api di bawah wajan
    var glow = ctx.createRadialGradient(G.cx, G.cy + 120, 20, G.cx, G.cy + 120, 300);
    glow.addColorStop(0, 'rgba(255,120,30,0.55)');
    glow.addColorStop(1, 'rgba(255,120,30,0)');
    ctx.fillStyle = glow;
    ell(ctx, G.cx, G.cy + 120, 300, 90); ctx.fill();
    // lidah api
    for (var f = 0; f < 9; f++) {
      var fx = G.cx - 220 + f * 55;
      var fh = 26 + 14 * Math.sin(time * 9 + f * 2.2);
      ctx.fillStyle = f % 2 ? P.flame : P.flameHot;
      ctx.beginPath();
      ctx.moveTo(fx - 16, G.cy + G.ry - 6);
      ctx.quadraticCurveTo(fx, G.cy + G.ry - 6 - fh * 1.6, fx + 16, G.cy + G.ry - 6);
      ctx.closePath(); ctx.fill();
    }
    // badan wajan
    shadow(ctx, true);
    ctx.fillStyle = P.iron;
    ell(ctx, G.cx, G.cy, G.rx, G.ry); ctx.fill();
    shadow(ctx, false);
    ctx.strokeStyle = P.ironRim; ctx.lineWidth = 7;
    ell(ctx, G.cx, G.cy, G.rx, G.ry); ctx.stroke();
    ctx.strokeStyle = '#5a5a5a'; ctx.lineWidth = 2;
    ell(ctx, G.cx, G.cy, G.rx - 16, G.ry - 12); ctx.stroke();
    // permukaan wajan (minyak mengkilap)
    var oil = ctx.createRadialGradient(G.cx, G.cy - 20, 20, G.cx, G.cy, 280);
    oil.addColorStop(0, 'rgba(255,190,90,0.16)');
    oil.addColorStop(1, 'rgba(0,0,0,0.25)');
    ctx.fillStyle = oil;
    ell(ctx, G.cx, G.cy, G.rx - 16, G.ry - 12); ctx.fill();

    // martabak di atas wajan
    if (g.stage !== 'empty') drawMartabak(ctx, game, time);

    // label progres — hanya saat bermain (di title disembunyikan)
    if (game.phase === 'playing') {
      var L = { x: 480, y: 296, w: 224, h: 34 };
      shadow(ctx, true);
      ctx.fillStyle = 'rgba(20,10,4,0.88)';
      rr(ctx, L.x, L.y, L.w, L.h, 9); ctx.fill();
      shadow(ctx, false);
      var label = window.WK_WORLD.stageLabel(g);
      var col = g.wrong ? '#ff8a70' : (g.stage === 'needs-butter' ? '#ffd23d' : '#f2e3c6');
      text(ctx, label, 592, L.y + 18, '900 15px Arial, sans-serif', col, 'center', 'middle');
      // bar langkah 5
      var bw = 200;
      ctx.fillStyle = '#4a3421';
      rr(ctx, 492, L.y + 24, bw, 5, 2.5); ctx.fill();
      ctx.fillStyle = g.wrong ? '#d63d2a' : P.gold;
      var stepFrac = window.WK_WORLD.assemblyStep(g) / 5;
      if (stepFrac > 0) { rr(ctx, 492, L.y + 24, bw * stepFrac, 5, 2.5); ctx.fill(); }
      if (g.wrong) text(ctx, 'SALAH TOPPING — BIN (B)', 592, L.y + 48, '900 13px Arial, sans-serif', '#ff8a70', 'center', 'middle');
    }
  }

  function drawMartabak(ctx, game, time) {
    var G = CFG.GRIDDLE;
    var g = game.griddle;
    var cx = G.cx, cy = G.cy + 6;
    var rx = 215, ry = 128;

    if (g.stage === 'folding' || g.stage === 'folded') {
      // setengah bulan terlipat
      ctx.fillStyle = g.stage === 'folding' ? P.martabak : P.martabakDeep;
      ctx.beginPath();
      ctx.ellipse(cx, cy, rx, ry, 0, Math.PI, 0);
      ctx.closePath(); ctx.fill();
      ctx.fillStyle = 'rgba(0,0,0,0.25)';
      ctx.beginPath();
      ctx.ellipse(cx, cy, rx, ry, 0, Math.PI, 0);
      ctx.closePath(); ctx.fill();
      ctx.strokeStyle = '#8a5a1e'; ctx.lineWidth = 4;
      ctx.beginPath(); ctx.ellipse(cx, cy, rx, ry, 0, Math.PI, 0); ctx.stroke();
      // tepi topping mengintip
      for (var i = 0; i < g.toppings.length; i++) {
        var tp = DATA.toppingById(g.toppings[i]);
        ctx.fillStyle = tp.color;
        ell(ctx, cx - 90 + i * 90, cy + 26, 16, 9); ctx.fill();
      }
      if (g.stage === 'folding') {
        ctx.fillStyle = 'rgba(255,255,255,0.25)';
        ctx.beginPath(); ctx.ellipse(cx, cy, rx * (1 - g.fold * 0.4), ry * (1 - g.fold * 0.3), 0, Math.PI, 0); ctx.fill();
      }
      return;
    }

    // adonan bulat penuh — warna mentah pucat -> keemasan
    var cook = g.cook;
    var base = cook < 0.5 ? mix(P.batterRaw, P.batter, cook * 2) : mix(P.batter, P.martabak, (cook - 0.5) * 2);
    if (g.stage === 'needs-butter' || g.stage === 'buttering' || g.stage === 'topping') base = P.martabak;
    ctx.fillStyle = base;
    ell(ctx, cx, cy, rx, ry); ctx.fill();
    // pinggir gosong ringan saat matang
    ctx.strokeStyle = g.stage === 'cooking' && cook > 0.85 ? '#a06a1e' : '#c98f3d';
    ctx.lineWidth = 5;
    ell(ctx, cx, cy, rx, ry); ctx.stroke();
    // gelembung saat masak
    if (g.stage === 'cooking') {
      for (var b = 0; b < 26; b++) {
        var bx = cx + (hash(b * 3 + 1) - 0.5) * rx * 1.6;
        var by = cy + (hash(b * 3 + 2) - 0.5) * ry * 1.5;
        var br = 3 + 7 * Math.abs(Math.sin(time * 2 + b));
        ctx.fillStyle = 'rgba(120,70,20,0.35)';
        ell(ctx, bx, by, br, br * 0.6); ctx.fill();
        ctx.fillStyle = 'rgba(255,240,200,0.5)';
        ell(ctx, bx - br * 0.3, by - br * 0.3, br * 0.35, br * 0.2); ctx.fill();
      }
    }
    // kolam mentega: kilau tipis (bukan kuning telur besar) + balok mentega meleleh
    if (g.stage === 'buttering' || g.stage === 'topping') {
      var bp = g.stage === 'buttering' ? g.butter : 1;
      ctx.fillStyle = 'rgba(255,217,77,0.55)';
      ell(ctx, cx - 20, cy - 8, rx * 0.38 * bp + 14, ry * 0.3 * bp + 8); ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,0.55)';
      ell(ctx, cx - 50, cy - 22, 26, 7); ctx.fill();
      ctx.fillStyle = '#ffd94d';
      rr(ctx, cx + 96, cy - 52, 34, 20, 4); ctx.fill();
      ctx.strokeStyle = 'rgba(120,70,0,0.5)'; ctx.lineWidth = 2;
      rr(ctx, cx + 96, cy - 52, 34, 20, 4); ctx.stroke();
    }
    // topping di atas martabak
    for (var t = 0; t < g.toppings.length; t++) {
      drawToppingOnMartabak(ctx, g.toppings[t], cx, cy, rx, ry, t, time);
    }
    // kilau
    ctx.fillStyle = 'rgba(255,255,255,0.18)';
    ell(ctx, cx - 70, cy - 48, 90, 26); ctx.fill();
  }

  function drawToppingOnMartabak(ctx, id, cx, cy, rx, ry, slot, time) {
    var tp = DATA.toppingById(id);
    var ox = slot === 0 ? -70 : 70;
    if (id === 'cokelat') {
      ctx.fillStyle = tp.color;
      for (var i = 0; i < 40; i++) {
        var x = cx + ox + (hash(i * 7 + slot) - 0.5) * 150;
        var y = cy + (hash(i * 11 + slot) - 0.5) * 130;
        ctx.fillRect(x, y, 7, 2.5);
      }
    } else if (id === 'keju') {
      ctx.strokeStyle = tp.color; ctx.lineWidth = 4;
      for (var j = 0; j < 22; j++) {
        var x2 = cx + ox + (hash(j * 5 + slot) - 0.5) * 160;
        var y2 = cy + (hash(j * 9 + slot) - 0.5) * 140;
        ctx.beginPath(); ctx.moveTo(x2 - 12, y2); ctx.lineTo(x2 + 12, y2 + 4); ctx.stroke();
      }
    } else if (id === 'kacang') {
      ctx.fillStyle = tp.color;
      for (var k = 0; k < 16; k++) {
        ell(ctx, cx + ox + (hash(k * 13 + slot) - 0.5) * 150, cy + (hash(k * 17 + slot) - 0.5) * 130, 8, 6); ctx.fill();
      }
      ctx.fillStyle = '#a06a2c';
      for (var k2 = 0; k2 < 8; k2++) {
        ell(ctx, cx + ox + (hash(k2 * 19 + slot) - 0.5) * 150, cy + (hash(k2 * 23 + slot) - 0.5) * 130, 4, 3); ctx.fill();
      }
    } else if (id === 'pisang') {
      ctx.fillStyle = tp.color;
      for (var m = 0; m < 7; m++) {
        ell(ctx, cx + ox + (hash(m * 29 + slot) - 0.5) * 140, cy + (hash(m * 31 + slot) - 0.5) * 120, 20, 13); ctx.fill();
        ctx.strokeStyle = '#d9b96a'; ctx.lineWidth = 2;
        ell(ctx, cx + ox + (hash(m * 29 + slot) - 0.5) * 140, cy + (hash(m * 31 + slot) - 0.5) * 120, 20, 13); ctx.stroke();
      }
    } else if (id === 'susu') {
      ctx.strokeStyle = 'rgba(255,248,234,0.95)'; ctx.lineWidth = 5; ctx.lineCap = 'round';
      ctx.beginPath();
      for (var s = 0; s <= 10; s++) {
        var sx = cx - 120 + s * 24;
        var sy = cy + Math.sin(s * 1.4 + slot) * 26;
        if (s === 0) ctx.moveTo(sx, sy); else ctx.lineTo(sx, sy);
      }
      ctx.stroke();
    } else if (id === 'wijen') {
      ctx.fillStyle = tp.color;
      for (var w = 0; w < 46; w++) {
        ell(ctx, cx + (hash(w * 37 + slot) - 0.5) * rx * 1.7, cy + (hash(w * 41 + slot) - 0.5) * ry * 1.6, 3, 2); ctx.fill();
      }
    }
  }

  function hash(n) {
    var x = Math.sin(n * 127.1 + 311.7) * 43758.5453;
    return x - Math.floor(x);
  }

  function mix(c1, c2, f) {
    var a = parseInt(c1.slice(1), 16), b = parseInt(c2.slice(1), 16);
    var r = Math.round(((a >> 16) & 255) + (((b >> 16) & 255) - ((a >> 16) & 255)) * f);
    var g = Math.round(((a >> 8) & 255) + (((b >> 8) & 255) - ((a >> 8) & 255)) * f);
    var bl = Math.round((a & 255) + ((b & 255) - (a & 255)) * f);
    return 'rgb(' + r + ',' + g + ',' + bl + ')';
  }

  // ---------------------------------------------------------------- uap
  function drawSteam(ctx, time) {
    ctx.fillStyle = 'rgba(255,255,255,0.16)';
    for (var i = 0; i < 22; i++) {
      var bx = 592 + (hash(i * 3) - 0.5) * 420;
      var rise = ((time * 26 + hash(i * 7) * 140) % 150);
      var y = 430 - rise;
      var r = 14 + rise * 0.18;
      ctx.globalAlpha = 0.24 * (1 - rise / 150);
      ell(ctx, bx + Math.sin(time + i) * 8, y, r, r * 0.7); ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  // ---------------------------------------------------------------- rak topping
  function drawRack(ctx, game) {
    text(ctx, 'TOPPING  (klik / tombol 3-8)', 900, 92, '900 18px Arial, sans-serif', '#ffd878', 'left', 'middle');
    for (var i = 0; i < DATA.TOPPINGS.length; i++) {
      var col = i % 2, row = (i / 2) | 0;
      var x = CFG.JAR_X0 + col * (CFG.JAR_W + CFG.JAR_GAP);
      var y = CFG.JAR_Y0 + row * (CFG.JAR_H + CFG.JAR_GAP);
      var tp = DATA.TOPPINGS[i];
      var onGriddle = game.griddle.toppings.indexOf(tp.id) >= 0;
      shadow(ctx, true);
      ctx.fillStyle = onGriddle ? '#3d2c12' : '#2b1a0e';
      rr(ctx, x, y, CFG.JAR_W, CFG.JAR_H, 12); ctx.fill();
      shadow(ctx, false);
      ctx.strokeStyle = onGriddle ? P.gold : '#8a5f36'; ctx.lineWidth = onGriddle ? 3 : 2;
      rr(ctx, x, y, CFG.JAR_W, CFG.JAR_H, 12); ctx.stroke();
      // isi toples
      ctx.fillStyle = tp.color;
      rr(ctx, x + 12, y + 34, CFG.JAR_W - 24, CFG.JAR_H - 46, 8); ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,0.22)';
      rr(ctx, x + 12, y + 34, CFG.JAR_W - 24, 16, 8); ctx.fill();
      if (tp.id === 'keju') {
        ctx.strokeStyle = '#f2b705'; ctx.lineWidth = 3;
        for (var s2 = 0; s2 < 6; s2++) {
          ctx.beginPath(); ctx.moveTo(x + 24 + s2 * 24, y + 60); ctx.lineTo(x + 36 + s2 * 24, y + 100); ctx.stroke();
        }
      } else if (tp.id === 'kacang' || tp.id === 'wijen') {
        ctx.fillStyle = tp.dot;
        for (var d = 0; d < 14; d++) {
          ell(ctx, x + 24 + hash(d * 3 + i) * (CFG.JAR_W - 48), y + 48 + hash(d * 5 + i) * (CFG.JAR_H - 66), 5, 4); ctx.fill();
        }
      } else if (tp.id === 'pisang') {
        ctx.fillStyle = '#f7ead0';
        for (var p2 = 0; p2 < 4; p2++) ell(ctx, x + 40 + p2 * 34, y + 74, 15, 11); ctx.fill();
      } else if (tp.id === 'susu') {
        ctx.fillStyle = '#fff8ea';
        rr(ctx, x + 14, y + 60, CFG.JAR_W - 28, 34, 6); ctx.fill();
      } else if (tp.id === 'cokelat') {
        ctx.fillStyle = '#7a4a28';
        for (var c2 = 0; c2 < 20; c2++) ctx.fillRect(x + 20 + hash(c2 * 7 + i) * (CFG.JAR_W - 40), y + 48 + hash(c2 * 11 + i) * 48, 6, 2);
      }
      // tutup toples
      ctx.fillStyle = '#8a5f36';
      rr(ctx, x + 30, y + 8, CFG.JAR_W - 60, 16, 6); ctx.fill();
      text(ctx, tp.key, x + 12, y + 26, '900 16px Arial, sans-serif', '#ffd878', 'left', 'middle');
      text(ctx, tp.name.toUpperCase(), x + CFG.JAR_W - 12, y + 26, '900 15px Arial, sans-serif', '#f2e3c6', 'right', 'middle');
      if (onGriddle) text(ctx, 'SUDAH DIPAKAI ✓', x + CFG.JAR_W / 2, y + CFG.JAR_H - 8, '900 12px Arial, sans-serif', P.gold, 'center', 'middle');
    }
  }

  // ---------------------------------------------------------------- piring siap
  function drawReadyPlate(ctx, game, time) {
    var R = CFG.READY;
    shadow(ctx, true);
    ctx.fillStyle = game.plate ? '#3d2c12' : '#2b1a0e';
    rr(ctx, R.x, R.y, R.w, R.h, 14); ctx.fill();
    shadow(ctx, false);
    ctx.strokeStyle = game.plate ? P.gold : '#8a5f36'; ctx.lineWidth = game.plate ? 3 : 2;
    rr(ctx, R.x, R.y, R.w, R.h, 14); ctx.stroke();
    text(ctx, 'PIRING SIAP  —  klik / Spasi untuk sajikan', R.x + 16, R.y + 26, '900 15px Arial, sans-serif',
      game.plate ? '#ffd878' : '#f2e3c6', 'left', 'middle');
    // piring besar
    var px = R.x + 150, py = R.y + 88;
    ctx.fillStyle = '#f7f3e8';
    ell(ctx, px, py, 118, 40); ctx.fill();
    ctx.strokeStyle = '#c9b896'; ctx.lineWidth = 3;
    ell(ctx, px, py, 118, 40); ctx.stroke();
    ell(ctx, px, py, 84, 27); ctx.stroke();
    if (game.plate) {
      // 4 potong martabak terlipat, besar dan jelas
      for (var i = 0; i < 4; i++) {
        var ang = -Math.PI * 0.75 + i * 0.5;
        var qx = px + Math.cos(ang) * 58;
        var qy = py + Math.sin(ang) * 20 - 6;
        ctx.fillStyle = P.martabakDeep;
        ctx.beginPath();
        ctx.moveTo(qx, qy);
        ctx.arc(qx, qy, 30, ang - 0.5, ang + 0.5);
        ctx.closePath(); ctx.fill();
        ctx.fillStyle = '#e8a94e';
        ctx.beginPath();
        ctx.moveTo(qx, qy - 3);
        ctx.arc(qx, qy - 3, 24, ang - 0.4, ang + 0.4);
        ctx.closePath(); ctx.fill();
      }
      for (var t = 0; t < game.plate.toppings.length; t++) {
        var tp = DATA.toppingById(game.plate.toppings[t]);
        ctx.fillStyle = tp.color;
        ell(ctx, px - 40 + t * 80, py - 22, 12, 7); ctx.fill();
      }
      text(ctx, 'SIAP DISAJIKAN', px, py + 52, '900 13px Arial, sans-serif', '#58b368', 'center', 'middle');
    } else {
      text(ctx, '— kosong —', px, py - 4, '700 15px Arial, sans-serif', '#a08a68', 'center', 'middle');
    }
    // bel saji
    var B = CFG.BELL;
    var ringing = game.flash > 0;
    ctx.fillStyle = '#c9a227';
    ctx.beginPath(); ctx.arc(B.x + B.w / 2, B.y + B.h / 2 + 6, 26, Math.PI, 0); ctx.fill();
    ctx.fillRect(B.x + B.w / 2 - 4, B.y + 8, 8, 14);
    ell(ctx, B.x + B.w / 2, B.y + B.h / 2 + 8, 30, 6); ctx.fill();
    if (ringing) {
      ctx.strokeStyle = '#ffd23d'; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.arc(B.x + B.w / 2, B.y + B.h / 2, 40, -0.9, 0.9); ctx.stroke();
      ctx.beginPath(); ctx.arc(B.x + B.w / 2, B.y + B.h / 2, 50, -0.7, 0.7); ctx.stroke();
    }
    text(ctx, 'BEL', B.x + B.w / 2, B.y + B.h - 4, '900 11px Arial, sans-serif', '#f2e3c6', 'center', 'middle');
  }

  // ---------------------------------------------------------------- counter
  function drawCounter(ctx, game) {
    var C = CFG.COUNTER;
    ctx.fillStyle = P.counter;
    rr(ctx, C.x, C.y, C.w, C.h, 10); ctx.fill();
    ctx.strokeStyle = P.woodDark; ctx.lineWidth = 2;
    rr(ctx, C.x, C.y, C.w, C.h, 10); ctx.stroke();
    ctx.strokeStyle = 'rgba(0,0,0,0.25)';
    for (var i = 0; i < 5; i++) {
      ctx.beginPath(); ctx.moveTo(C.x + 40 + i * 190, C.y + 8); ctx.lineTo(C.x + 40 + i * 190, C.y + C.h - 8); ctx.stroke();
    }
    // mangkuk adonan (1)
    drawCounterItem(ctx, CFG.BATTER, '1', 'ADONAN', '#f3d9a4', game.griddle.stage === 'empty');
    // mentega (2)
    drawCounterItem(ctx, CFG.BUTTER, '2', 'MENTEGA', '#ffd94d', game.griddle.stage === 'needs-butter');
    // telur + tepung (info)
    drawCounterItem(ctx, CFG.EGG, '', 'TELUR', '#f7ead0', false);
    drawCounterItem(ctx, CFG.FLOUR, '', 'TEPUNG', '#fff8ea', false);
    // tombol lipat (F)
    var canFold = game.griddle.stage === 'topping' && game.griddle.toppings.length === 2;
    drawButton(ctx, CFG.FOLD_BTN, 'F', 'LIPAT', canFold);
    // tombol potong & saji (Spasi)
    var canPlate = game.griddle.stage === 'folded';
    drawButton(ctx, CFG.SERVE_BTN, '␣', 'POTONG', canPlate);
    // BIN
    ctx.fillStyle = '#3a3a3a';
    rr(ctx, CFG.BIN.x, CFG.BIN.y, CFG.BIN.w, CFG.BIN.h, 8); ctx.fill();
    ctx.strokeStyle = '#666'; ctx.lineWidth = 2;
    rr(ctx, CFG.BIN.x, CFG.BIN.y, CFG.BIN.w, CFG.BIN.h, 8); ctx.stroke();
    text(ctx, 'BIN', CFG.BIN.x + CFG.BIN.w / 2, CFG.BIN.y + 26, '900 16px Arial, sans-serif', '#ddd', 'center', 'middle');
    text(ctx, '(B)', CFG.BIN.x + CFG.BIN.w / 2, CFG.BIN.y + 46, '700 12px Arial, sans-serif', '#aaa', 'center', 'middle');
  }

  function drawCounterItem(ctx, r, key, label, color, active) {
    ctx.fillStyle = active ? '#4a3410' : 'rgba(0,0,0,0.25)';
    rr(ctx, r.x, r.y, r.w, r.h, 9); ctx.fill();
    ctx.strokeStyle = active ? P.gold : 'rgba(255,255,255,0.25)'; ctx.lineWidth = active ? 3 : 1.5;
    rr(ctx, r.x, r.y, r.w, r.h, 9); ctx.stroke();
    if (label === 'TELUR') {
      // dua butir telur
      ctx.fillStyle = '#fff8ea';
      ell(ctx, r.x + 26, r.y + 32, 15, 11); ctx.fill();
      ell(ctx, r.x + 48, r.y + 30, 15, 11); ctx.fill();
      ctx.fillStyle = '#f2b705';
      ell(ctx, r.x + 26, r.y + 30, 5, 4); ctx.fill();
      ell(ctx, r.x + 48, r.y + 28, 5, 4); ctx.fill();
    } else if (label === 'TEPUNG') {
      // karung tepung
      ctx.fillStyle = '#e8dcc0';
      rr(ctx, r.x + 16, r.y + 16, 36, 26, 6); ctx.fill();
      ctx.fillStyle = '#c9b896';
      ctx.beginPath(); ctx.moveTo(r.x + 24, r.y + 16); ctx.lineTo(r.x + 30, r.y + 6); ctx.lineTo(r.x + 38, r.y + 16); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = '#8a5f36'; ctx.lineWidth = 2;
      rr(ctx, r.x + 16, r.y + 16, 36, 26, 6); ctx.stroke();
    } else if (label === 'MENTEGA') {
      // balok mentega
      ctx.fillStyle = '#ffd94d';
      rr(ctx, r.x + 14, r.y + 18, 40, 20, 4); ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,0.6)';
      rr(ctx, r.x + 18, r.y + 21, 32, 6, 3); ctx.fill();
      ctx.strokeStyle = 'rgba(120,70,0,0.5)'; ctx.lineWidth = 2;
      rr(ctx, r.x + 14, r.y + 18, 40, 20, 4); ctx.stroke();
    } else {
      // mangkuk adonan + sendok sayur
      ctx.fillStyle = color;
      ell(ctx, r.x + 34, r.y + 30, 24, 12); ctx.fill();
      ctx.strokeStyle = 'rgba(0,0,0,0.3)'; ctx.lineWidth = 2;
      ell(ctx, r.x + 34, r.y + 30, 24, 12); ctx.stroke();
      ctx.strokeStyle = '#8a5f36'; ctx.lineWidth = 4;
      ctx.beginPath(); ctx.moveTo(r.x + 48, r.y + 22); ctx.lineTo(r.x + 60, r.y + 8); ctx.stroke();
      ctx.fillStyle = '#c9c9c9';
      ell(ctx, r.x + 61, r.y + 8, 6, 4); ctx.fill();
    }
    if (key) text(ctx, key, r.x + 12, r.y + 18, '900 15px Arial, sans-serif', '#ffd878', 'left', 'middle');
    text(ctx, label, r.x + 66, r.y + 34, '900 15px Arial, sans-serif', '#f7ead0', 'left', 'middle');
  }

  function drawButton(ctx, r, key, label, active) {
    ctx.fillStyle = active ? '#2e7d32' : '#4a3421';
    rr(ctx, r.x, r.y, r.w, r.h, 9); ctx.fill();
    ctx.strokeStyle = active ? '#7dd87d' : 'rgba(255,255,255,0.25)'; ctx.lineWidth = active ? 3 : 1.5;
    rr(ctx, r.x, r.y, r.w, r.h, 9); ctx.stroke();
    text(ctx, key + '  ' + label, r.x + r.w / 2, r.y + r.h / 2 + 1, '900 16px Arial, sans-serif',
      active ? '#ffffff' : '#c9b896', 'center', 'middle');
  }

  // ---------------------------------------------------------------- hint + popup
  function drawHint(ctx, game) {
    if (game.hintLife <= 0 || game.phase !== 'playing') return;
    var w = ctx.measureText(game.hint).width + 36;
    var x = 640 - w / 2;
    ctx.globalAlpha = Math.min(1, game.hintLife);
    ctx.fillStyle = 'rgba(20,10,4,0.88)';
    rr(ctx, x, 612, w, 30, 15); ctx.fill();
    ctx.fillStyle = '#ffd878';
    ctx.font = '700 15px Arial, sans-serif';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(game.hint, 640, 628);
    ctx.globalAlpha = 1;
  }

  function drawPopups(ctx, game) {
    for (var i = 0; i < game.popups.length; i++) {
      var p = game.popups[i];
      ctx.globalAlpha = Math.min(1, p.life);
      ctx.font = '900 26px Arial, sans-serif';
      var w = ctx.measureText(p.text).width + 28;
      ctx.fillStyle = 'rgba(20,10,4,0.85)';
      rr(ctx, p.x - w / 2, p.y - 20, w, 40, 10); ctx.fill();
      ctx.strokeStyle = P.gold; ctx.lineWidth = 2;
      rr(ctx, p.x - w / 2, p.y - 20, w, 40, 10); ctx.stroke();
      text(ctx, p.text, p.x, p.y, '900 26px Arial, sans-serif', p.color, 'center', 'middle');
    }
    ctx.globalAlpha = 1;
  }

  // ---------------------------------------------------------------- overlay
  function drawTitle(ctx, game, time) {
    ctx.fillStyle = 'rgba(20,8,2,0.55)';
    ctx.fillRect(0, 64, 1280, 656);
    text(ctx, 'WARUNG KILAT', 640, 220, '900 84px Arial, sans-serif', '#ffd878', 'center', 'middle');
    text(ctx, 'MARTABAK GEROBAK', 640, 272, '900 30px Arial, sans-serif', '#f2e3c6', 'center', 'middle');
    text(ctx, 'Satu shift 3 menit. Tuang adonan, masak sampai keemasan,', 640, 330, '700 20px Arial, sans-serif', '#ffffff', 'center', 'middle');
    text(ctx, 'beri mentega + 2 topping sesuai tiket, lipat, potong, sajikan.', 640, 358, '700 20px Arial, sans-serif', '#ffffff', 'center', 'middle');
    var pulse = 0.7 + 0.3 * Math.sin(time * 4);
    ctx.globalAlpha = pulse;
    text(ctx, '▶  KLIK UNTUK MULAI', 640, 440, '900 30px Arial, sans-serif', '#58b368', 'center', 'middle');
    ctx.globalAlpha = 1;
    text(ctx, 'Mouse: klik  •  Keyboard: 1-8, F, Spasi, B', 590, 484, '700 14px Arial, sans-serif', '#d9c9a8', 'center', 'middle');
  }

  function drawOver(ctx, game) {
    ctx.fillStyle = 'rgba(20,8,2,0.72)';
    ctx.fillRect(0, 64, 1280, 656);
    text(ctx, 'SHIFT SELESAI!', 640, 210, '900 64px Arial, sans-serif', '#ffd878', 'center', 'middle');
    var lines = [
      'Uang didapat:  ' + rp(game.score),
      'Disajikan:  ' + game.served + ' martabak      Hangus:  ' + game.lost,
      'Kombo terbaik:  x' + game.bestCombo,
    ];
    for (var i = 0; i < lines.length; i++) {
      text(ctx, lines[i], 640, 300 + i * 44, '700 26px Arial, sans-serif', '#ffffff', 'center', 'middle');
    }
    var verdict = game.served >= 10 ? 'Gerobakmu legendaris!' : game.served >= 6 ? 'Lumayan ramai!' : game.served >= 3 ? 'Masih belajar...' : 'Wajanmu dingin...';
    text(ctx, verdict, 640, 470, '900 28px Arial, sans-serif', '#58b368', 'center', 'middle');
    text(ctx, 'Tekan R untuk main lagi', 640, 530, '700 18px Arial, sans-serif', '#d9c9a8', 'center', 'middle');
  }

  // ---------------------------------------------------------------- utama
  function render(ctx, game, time) {
    ctx.save();
    if (game.shake > 0) {
      var s = game.shake * 22;
      ctx.translate((hash(Math.floor(time * 60)) - 0.5) * s, (hash(Math.floor(time * 60) + 5) - 0.5) * s);
    }
    drawBackground(ctx, time);
    drawTickets(ctx, game, time);
    drawGriddle(ctx, game, time);
    drawSteam(ctx, time);
    drawChef(ctx, game, time);
    drawRack(ctx, game);
    drawReadyPlate(ctx, game, time);
    drawCounter(ctx, game);
    drawTopBar(ctx, game);
    drawHint(ctx, game);
    drawPopups(ctx, game);
    if (game.phase === 'title') drawTitle(ctx, game, time);
    if (game.phase === 'over') drawOver(ctx, game);
    if (game.flash > 0) {
      ctx.fillStyle = 'rgba(255,210,61,' + (game.flash * 0.8) + ')';
      ctx.fillRect(0, 0, 1280, 720);
    }
    ctx.restore();
  }

  window.WK_RENDER = { render: render, fmtTime: fmtTime, rp: rp };
})();
