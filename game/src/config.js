// Warung Kilat — gerobak martabak golden hour. Layout + palet + konstanta.
// Satu-satunya sumber kebenaran untuk posisi semua elemen: render.js dan
// input.js sama-sama membaca rect di sini, jadi yang diklik = yang digambar.
(function () {
  'use strict';

  var W = 1280;
  var H = 720;

  // --- top bar -------------------------------------------------------------
  var TOP = { x: 0, y: 0, w: 1280, h: 64 };
  var SCORE_BOX = { x: 8, y: 8, w: 250, h: 48 };
  var TIMER_BOX = { x: 1030, y: 8, w: 242, h: 48 };
  var SIGN = { x: 300, y: 6, w: 680, h: 52 }; // papan nama di valance awning

  // --- rel order kiri (vertikal) -------------------------------------------
  var RAIL = { x: 8, y: 72, w: 284, h: 640 };
  var TICKET_W = 268;
  var TICKET_H = 196;
  var TICKET_GAP = 12;
  var TICKET_X = 16;
  var TICKET_Y0 = 100; // y tiket pertama (di bawah label PESANAN)

  // --- area tengah: koki + griddle -----------------------------------------
  var CHEF = { x: 330, y: 72, w: 520, h: 190 }; // kepala + bahu + lengan
  var GRIDDLE = { cx: 592, cy: 470, rx: 285, ry: 175 }; // elips wajan datar
  var GRIDDLE_LABEL = { x: 372, y: 300, w: 440, h: 34 }; // label progres di atas wajan

  // --- rak topping kanan ----------------------------------------------------
  var RACK = { x: 892, y: 72, w: 380, h: 400 };
  var JAR_W = 178;
  var JAR_H = 122;
  var JAR_GAP = 10;
  var JAR_X0 = 900;
  var JAR_Y0 = 104;

  // --- piring siap + bel ----------------------------------------------------
  var READY = { x: 892, y: 484, w: 380, h: 148 }; // piring siap saji + bel
  var BELL = { x: 1180, y: 500, w: 76, h: 76 };

  // --- counter bawah (bahan) -----------------------------------------------
  var COUNTER = { x: 300, y: 648, w: 972, h: 64 };
  var BATTER = { x: 316, y: 654, w: 150, h: 52 }; // mangkuk adonan
  var BUTTER = { x: 478, y: 654, w: 150, h: 52 }; // mentega
  var EGG = { x: 640, y: 654, w: 120, h: 52 }; // telur (hiasan + info)
  var FLOUR = { x: 772, y: 654, w: 120, h: 52 }; // tepung (hiasan + info)
  var BIN = { x: 1180, y: 644, w: 84, h: 60 }; // buang martabak gagal
  var FOLD_BTN = { x: 920, y: 654, w: 130, h: 52 }; // tombol LIPAT
  var SERVE_BTN = { x: 1062, y: 654, w: 106, h: 52 }; // tombol POTONG & SAJI

  // --- waktu ----------------------------------------------------------------
  var SHIFT_SECONDS = 180;
  var ORDER_SPAWN_EVERY = 12; // detik antar order baru (makin cepat)
  var ORDER_PATIENCE = 55; // detik kesabaran awal
  var COOK_SECONDS = 7; // adonan mentah -> matang keemasan
  var BUTTER_SECONDS = 1.2; // mentega meleleh
  var FOLD_SECONDS = 0.8; // lipat

  // --- palet golden hour ----------------------------------------------------
  var PALETTE = {
    skyTop: '#3a2417',
    skyMid: '#7a4423',
    skyLow: '#b06a2e',
    wall: '#8a5a33',
    wallDark: '#6e4525',
    brick: '#93592f',
    brickLine: '#5f3a1e',
    awningRed: '#a83226',
    awningCream: '#f2e3c6',
    wood: '#6b4423',
    woodDark: '#4e3018',
    woodLight: '#8a5f36',
    counter: '#7c4f28',
    iron: '#232323',
    ironEdge: '#4a4a4a',
    ironRim: '#c98f3d',
    flame: '#ff9a2a',
    flameHot: '#ffd23d',
    ember: '#ff5a1f',
    batter: '#f3d9a4',
    batterRaw: '#f7e3bb',
    martabak: '#e8a94e',
    martabakDeep: '#c97e1f',
    butter: '#ffd94d',
    chocolate: '#5a3018',
    cheese: '#ffcf3d',
    peanut: '#c98f4e',
    banana: '#f7ead0',
    milk: '#fff8ea',
    sesame: '#e8dcc0',
    cream: '#f7ead0',
    ink: '#2b1a0e',
    paper: '#f6ead0',
    green: '#58b368',
    greenDark: '#2e7d32',
    red: '#d63d2a',
    gold: '#e8b64c',
  };

  window.WK_CONFIG = {
    W: W, H: H, TOP: TOP, SCORE_BOX: SCORE_BOX, TIMER_BOX: TIMER_BOX, SIGN: SIGN,
    RAIL: RAIL, TICKET_W: TICKET_W, TICKET_H: TICKET_H, TICKET_GAP: TICKET_GAP,
    TICKET_X: TICKET_X, TICKET_Y0: TICKET_Y0,
    CHEF: CHEF, GRIDDLE: GRIDDLE, GRIDDLE_LABEL: GRIDDLE_LABEL,
    RACK: RACK, JAR_W: JAR_W, JAR_H: JAR_H, JAR_GAP: JAR_GAP, JAR_X0: JAR_X0, JAR_Y0: JAR_Y0,
    READY: READY, BELL: BELL,
    COUNTER: COUNTER, BATTER: BATTER, BUTTER: BUTTER, EGG: EGG, FLOUR: FLOUR,
    BIN: BIN, FOLD_BTN: FOLD_BTN, SERVE_BTN: SERVE_BTN,
    SHIFT_SECONDS: SHIFT_SECONDS, ORDER_SPAWN_EVERY: ORDER_SPAWN_EVERY,
    ORDER_PATIENCE: ORDER_PATIENCE, COOK_SECONDS: COOK_SECONDS,
    BUTTER_SECONDS: BUTTER_SECONDS, FOLD_SECONDS: FOLD_SECONDS,
    PALETTE: PALETTE,
  };
})();
