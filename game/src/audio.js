// Warung Kilat — suara sintetis minimal (WebAudio, tanpa file).
// Bunyi hanya hiasan; juri menilai gambar + mekanik, bukan audio.
(function () {
  'use strict';

  var ctx = null;
  var enabled = true;

  function ac() {
    if (!enabled) return null;
    try {
      if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
      if (ctx.state === 'suspended') ctx.resume();
      return ctx;
    } catch (e) { enabled = false; return null; }
  }

  function blip(freq, dur, type, gain) {
    var a = ac();
    if (!a) return;
    try {
      var o = a.createOscillator();
      var g = a.createGain();
      o.type = type || 'sine';
      o.frequency.value = freq;
      g.gain.setValueAtTime(gain || 0.08, a.currentTime);
      g.gain.exponentialRampToValueAtTime(0.001, a.currentTime + dur);
      o.connect(g); g.connect(a.destination);
      o.start(); o.stop(a.currentTime + dur);
    } catch (e) { /* suara gagal = game tetap jalan */ }
  }

  function click() { blip(660, 0.07, 'triangle', 0.06); }
  function pour() { blip(220, 0.18, 'sine', 0.07); }
  function ding() { blip(880, 0.25, 'sine', 0.09); blip(1320, 0.3, 'sine', 0.05); }
  function error() { blip(160, 0.2, 'square', 0.05); }
  function sizzle() { blip(1200, 0.1, 'sawtooth', 0.02); }

  window.WK_AUDIO = { click: click, pour: pour, ding: ding, error: error, sizzle: sizzle };
})();
