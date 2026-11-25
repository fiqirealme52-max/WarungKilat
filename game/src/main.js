// Warung Kilat — boot and frame loop.
// Normal play runs on requestAnimationFrame. With ?shot=<name>&seed=<n>
// in the URL the game stages one deterministic scene and draws it once,
// which is how the screenshots are taken: same URL, same pixels.
// window.__warung exposes the live world for play-testing.
import { VIEW } from './config.js';
import { createWorld, resetWorld, update } from './world.js';
import { attachInput, createInput, endFrame } from './input.js';
import { render } from './render.js';
import { stageShot } from './shots.js';
import { playSound } from './audio.js';

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
canvas.width = VIEW.width;
canvas.height = VIEW.height;

const params = new URLSearchParams(window.location.search);
const shotName = params.get('shot');
const seed = Number.parseInt(params.get('seed') || '7', 10) || 7;

const world = createWorld(seed);
const input = createInput();
attachInput(input, canvas);
window.__warung = { world, input };

if (shotName) {
  // Screenshot mode: stage the scene and paint exactly one frame.
  stageShot(shotName, world);
  render(ctx, world);
} else {
  let last = performance.now();
  function frame(now) {
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    update(world, input, dt, playSound);
    render(ctx, world);
    endFrame(input);
    requestAnimationFrame(frame);
  }
  // The title screen waits for Enter; start the loop immediately.
  requestAnimationFrame(frame);
}
