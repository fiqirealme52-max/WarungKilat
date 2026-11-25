// Warung Kilat — tiny synthesized blips. No audio files: the judge never
// hears the game, so sound is a garnish, not a course. Everything is
// guarded: a browser without audio just plays silent.
let audioCtx = null;

export function ensureAudio() {
  if (audioCtx) return;
  try {
    const Ctor = window.AudioContext || window.webkitAudioContext;
    if (Ctor) audioCtx = new Ctor();
  } catch (err) {
    audioCtx = null;
  }
}

function tone(freq, dur, type, gain) {
  if (!audioCtx) return;
  try {
    const osc = audioCtx.createOscillator();
    const amp = audioCtx.createGain();
    osc.type = type || 'sine';
    osc.frequency.value = freq;
    amp.gain.setValueAtTime(gain || 0.08, audioCtx.currentTime);
    amp.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + dur);
    osc.connect(amp);
    amp.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + dur);
  } catch (err) {
    // Silent is fine.
  }
}

export function playSound(name) {
  ensureAudio();
  if (!audioCtx) return;
  if (audioCtx.state === 'suspended') audioCtx.resume().catch(() => {});
  if (name === 'take' || name === 'place') tone(520, 0.08, 'triangle', 0.06);
  else if (name === 'chopDone') { tone(660, 0.07, 'square', 0.05); setTimeout(() => tone(880, 0.09, 'square', 0.05), 70); }
  else if (name === 'cookDone') { tone(740, 0.1, 'sine', 0.07); setTimeout(() => tone(990, 0.12, 'sine', 0.07), 90); }
  else if (name === 'serve') { tone(660, 0.09, 'triangle', 0.08); setTimeout(() => tone(880, 0.09, 'triangle', 0.08), 90); setTimeout(() => tone(1320, 0.14, 'triangle', 0.08), 180); }
  else if (name === 'error') tone(180, 0.16, 'sawtooth', 0.05);
  else if (name === 'start') { tone(523, 0.1, 'triangle', 0.07); setTimeout(() => tone(784, 0.14, 'triangle', 0.07), 100); }
  else if (name === 'over') { tone(392, 0.2, 'triangle', 0.07); setTimeout(() => tone(311, 0.3, 'triangle', 0.07), 180); }
  else if (name === 'trash') tone(240, 0.1, 'sine', 0.05);
}
