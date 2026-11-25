// Warung Kilat v2 — konstanta waktu + aset foto (render DOM, bukan canvas).
(function () {
  'use strict';

  window.WK_CONFIG = {
    W: 1280, H: 720,
    SHIFT_SECONDS: 180,
    ORDER_SPAWN_EVERY: 12,
    ORDER_PATIENCE: 55,
    COOK_SECONDS: 7,
    BUTTER_SECONDS: 1.2,
    FOLD_SECONDS: 0.8,
    IMG: {
      hero: 'img/hero.jpg',
      griddle: 'img/griddle.jpg',
      plate: 'img/plate.jpg',
    },
  };
})();
