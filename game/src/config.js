// Warung Kilat — konstanta permainan dan jalur aset foto.
// Render memakai DOM di atas foto, jadi file ini hanya angka + path.
(function () {
  'use strict';

  window.WK_CONFIG = {
    W: 1280,
    H: 720,
    SHIFT_SECONDS: 180,      // satu shift = 3 menit
    ORDER_SPAWN_EVERY: 12,   // detik antar pesanan baru (makin cepat seiring waktu)
    ORDER_PATIENCE: 55,      // detik kesabaran awal tiap tiket
    COOK_SECONDS: 7,         // adonan sampai keemasan
    BUTTER_SECONDS: 1.2,     // mentega meleleh
    FOLD_SECONDS: 0.8,       // lipat martabak
    IMG: {
      hero: 'img/hero.jpg',       // gerobak + vendor + lampion
      griddle: 'img/griddle.jpg', // close-up martabak bergelembung
      plate: 'img/plate.jpg',     // martabak keemasan di piring
    },
  };
})();
