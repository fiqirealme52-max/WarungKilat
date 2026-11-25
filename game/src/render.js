// Warung Kilat — every pixel is drawn in code: warm warung walls, wooden
// counters, vector food. Nothing is loaded from the network, so the game
// renders identically anywhere. Animation phases all derive from
// world.elapsed, so a staged screenshot is deterministic.
import { AISLE, COLORS, COUNTER_H, COUNTER_Y, PICKER, STATIONS, TICKET, VIEW } from './config.js';
import { INGREDIENTS, INGREDIENT_BY_ID, RECIPE_BY_ID } from './recipes.js';

function rr(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

// --- realism helpers: gradients + soft shadows ------------------------------
// Every light effect is deterministic (coordinates + world.elapsed only;
// no Math.random anywhere), so a staged screenshot renders identically.
function lg(ctx, x0, y0, x1, y1, stops) {
  const g = ctx.createLinearGradient(x0, y0, x1, y1);
  for (const [o, c] of stops) g.addColorStop(o, c);
  return g;
}
function rg(ctx, x, y, r0, r1, stops) {
  const g = ctx.createRadialGradient(x, y, r0, x, y, r1);
  for (const [o, c] of stops) g.addColorStop(o, c);
  return g;
}
// Soft contact shadow: a radial-gradient ellipse fading to transparent.
function softShadow(ctx, x, y, rx, ry, alpha) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(rx, ry);
  ctx.fillStyle = rg(ctx, 0, 0, 0, 1, [[0, `rgba(0,0,0,${alpha})`], [0.65, `rgba(0,0,0,${alpha * 0.45})`], [1, 'rgba(0,0,0,0)']]);
  ctx.beginPath();
  ctx.arc(0, 0, 1, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}
// Top gloss on a rounded surface: white light fading down.
function glossTop(ctx, x, y, w, h, r, alpha) {
  ctx.save();
  rr(ctx, x, y, w, h, r);
  ctx.clip();
  ctx.fillStyle = lg(ctx, x, y, x, y + h * 0.5, [[0, `rgba(255,255,255,${alpha})`], [1, 'rgba(255,255,255,0)']]);
  ctx.fillRect(x, y, w, h * 0.5);
  ctx.restore();
}

// --- sharpness helpers: dark ink outlines + crisp detail ------------------
// Every sprite gets a firm dark edge so shapes never melt into the
// background at contact-sheet size. Deterministic (no randomness).
const INK = '#3a2413';
function ol(ctx, color, lw) {
  ctx.strokeStyle = color || INK;
  ctx.lineWidth = lw || 2;
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';
}

function fmt(n) {
  return String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

function mmss(seconds) {
  const s = Math.max(0, Math.ceil(seconds));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}

// --- food icons: one unmistakable vector drawing per ingredient ----------
export function drawFood(ctx, ingId, x, y, r, state) {
  const ing = INGREDIENT_BY_ID[ingId];
  ctx.save();
  ctx.translate(x, y);
  if (state === 'burnt') {
    ctx.fillStyle = '#241a12';
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#5a4632';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(-r * 0.3, -r * 0.4, r * 0.25, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
    return;
  }
  const raw = state === 'raw';
  const alpha = raw ? 0.62 : 1;
  ctx.globalAlpha = alpha;
  if (ingId === 'nasi') {
    ctx.fillStyle = rg(ctx, -r * 0.2, -r * 0.3, r * 0.1, r * 1.05, [[0, '#fffdf4'], [0.6, '#f7f2e2'], [1, '#ddcfa4']]);
    ctx.beginPath();
    ctx.ellipse(0, r * 0.15, r, r * 0.72, 0, Math.PI, 0);
    ctx.fill();
    // Outline so the pale mound reads on the white ticket cards.
    ctx.strokeStyle = '#8a6d3b';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.ellipse(0, r * 0.15, r, r * 0.72, 0, Math.PI, 0);
    ctx.stroke();
    // Rice grains: short dark arcs on the mound so it reads as grains,
    // not a smooth blob.
    ctx.strokeStyle = '#b8a06a';
    ctx.lineWidth = 1.5;
    for (const [gx, gy, ga] of [[-0.35, 0.05, 0.3], [0.05, -0.05, -0.4], [0.4, 0.1, 0.5], [-0.1, 0.3, 0.1]]) {
      ctx.beginPath();
      ctx.arc(gx * r, gy * r, r * 0.16, ga, ga + Math.PI * 0.7);
      ctx.stroke();
    }
    ctx.fillStyle = '#e3d9bd';
    for (let i = 0; i < 5; i += 1) {
      ctx.beginPath();
      ctx.arc(-r * 0.5 + i * r * 0.25, -r * 0.15 + (i % 2) * r * 0.18, r * 0.09, 0, Math.PI * 2);
      ctx.fill();
    }
    // Green garnish leaf on top of the mound.
    ctx.fillStyle = rg(ctx, r * 0.3, -r * 0.35, 0, r * 0.3, [[0, '#7ccb7f'], [1, '#3d8f47']]);
    ctx.beginPath();
    ctx.ellipse(r * 0.3, -r * 0.35, r * 0.28, r * 0.14, -0.5, 0, Math.PI * 2);
    ctx.fill();
    // Gloss dot on the mound.
    ctx.fillStyle = 'rgba(255,255,255,0.75)';
    ctx.beginPath();
    ctx.ellipse(-r * 0.25, -r * 0.3, r * 0.22, r * 0.1, -0.4, 0, Math.PI * 2);
    ctx.fill();
  } else if (ingId === 'ayam') {
    ctx.fillStyle = rg(ctx, -r * 0.15, -r * 0.2, r * 0.1, r, [[0, '#f0b45c'], [0.55, '#d98a2e'], [1, '#9c5a14']]);
    ctx.beginPath();
    ctx.ellipse(0, 0, r * 0.9, r * 0.62, -0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = rg(ctx, -r * 0.1, -r * 0.12, 0, r * 0.65, [[0, '#f7c877'], [1, '#e8a04c']]);
    ctx.beginPath();
    ctx.ellipse(-r * 0.1, -r * 0.12, r * 0.62, r * 0.42, -0.3, 0, Math.PI * 2);
    ctx.fill();
    // Dark ink edge + fibre strokes so the piece reads as fried chicken.
    ol(ctx, '#7a3f0e', 2.5);
    ctx.beginPath();
    ctx.ellipse(0, 0, r * 0.9, r * 0.62, -0.3, 0, Math.PI * 2);
    ctx.stroke();
    ctx.strokeStyle = '#b86e1e';
    ctx.lineWidth = 1.5;
    for (const [fx, fy] of [[-0.3, -0.1], [0.1, 0.05], [0.3, -0.2]]) {
      ctx.beginPath();
      ctx.moveTo(fx * r - r * 0.18, fy * r);
      ctx.quadraticCurveTo(fx * r, fy * r - r * 0.14, fx * r + r * 0.18, fy * r);
      ctx.stroke();
    }
    // Crispy highlight on the top edge.
    ctx.fillStyle = 'rgba(255,235,190,0.8)';
    ctx.beginPath();
    ctx.ellipse(-r * 0.25, -r * 0.38, r * 0.4, r * 0.12, -0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#f7f2e2';
    ctx.lineWidth = r * 0.22;
    ctx.beginPath();
    ctx.moveTo(r * 0.62, r * 0.35);
    ctx.lineTo(r * 1.05, r * 0.7);
    ctx.stroke();
  } else if (ingId === 'mie') {
    ctx.strokeStyle = lg(ctx, -r * 0.8, -r * 0.5, r * 0.85, r * 0.5, [[0, '#f7d774'], [0.5, '#f2c94c'], [1, '#cf9a2e']]);
    ctx.lineWidth = r * 0.28;
    ctx.lineCap = 'round';
    for (let i = -1; i <= 1; i += 1) {
      ctx.beginPath();
      ctx.moveTo(-r * 0.8, i * r * 0.42);
      ctx.quadraticCurveTo(-r * 0.3, i * r * 0.42 - r * 0.3, r * 0.2, i * r * 0.42);
      ctx.quadraticCurveTo(r * 0.6, i * r * 0.42 + r * 0.3, r * 0.85, i * r * 0.42);
      ctx.stroke();
    }
    // Gloss on the top noodle.
    ctx.strokeStyle = 'rgba(255,255,255,0.55)';
    ctx.lineWidth = r * 0.09;
    ctx.beginPath();
    ctx.moveTo(-r * 0.6, -r * 0.5);
    ctx.quadraticCurveTo(-r * 0.2, -r * 0.72, r * 0.3, -r * 0.48);
    ctx.stroke();
    // Dark edge strands under the noodles so the nest separates from
    // the plate and the strands stay distinct.
    ctx.strokeStyle = '#a87a1e';
    ctx.lineWidth = r * 0.1;
    for (const dy of [-0.62, 0.62]) {
      ctx.beginPath();
      ctx.moveTo(-r * 0.7, dy * r);
      ctx.quadraticCurveTo(0, dy * r + r * 0.28, r * 0.75, dy * r);
      ctx.stroke();
    }
  } else if (ingId === 'telur') {
    ctx.fillStyle = rg(ctx, -r * 0.15, -r * 0.2, r * 0.1, r, [[0, '#ffffff'], [0.7, '#fffdf4'], [1, '#e9dcc0']]);
    ctx.beginPath();
    ctx.ellipse(0, 0, r * 0.95, r * 0.7, 0.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = rg(ctx, r * 0.1, -r * 0.05, 0, r * 0.45, [[0, '#ffd34d'], [0.7, '#f2b134'], [1, '#dd841a']]);
    ctx.beginPath();
    ctx.arc(r * 0.1, -r * 0.05, r * 0.42, 0, Math.PI * 2);
    ctx.fill();
    ol(ctx, '#c98a2e', 2);
    ctx.beginPath();
    ctx.arc(r * 0.1, -r * 0.05, r * 0.42, 0, Math.PI * 2);
    ctx.stroke();
    // Crisp white edge so the egg never melts into a white plate.
    ol(ctx, '#c9b48a', 2);
    ctx.beginPath();
    ctx.ellipse(0, 0, r * 0.95, r * 0.7, 0.2, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = 'rgba(255,255,255,0.7)';
    ctx.beginPath();
    ctx.arc(r * 0.02, -r * 0.16, r * 0.1, 0, Math.PI * 2);
    ctx.fill();
  } else if (ingId === 'tahu') {
    ctx.strokeStyle = '#8a5a2b';
    ctx.lineWidth = 2.5;
    for (const [dx, dy] of [[-0.35, 0.1], [0.35, -0.15]]) {
      ctx.fillStyle = lg(ctx, dx * r - r * 0.42, dy * r - r * 0.42, dx * r + r * 0.42, dy * r + r * 0.42, [[0, '#fbf0d4'], [1, '#dfc389']]);
      ctx.beginPath();
      ctx.rect(dx * r - r * 0.42, dy * r - r * 0.42, r * 0.84, r * 0.84);
      ctx.fill();
      ctx.stroke();
    }
    // Grill marks on each cube.
    ctx.strokeStyle = '#a86a1e';
    ctx.lineWidth = 2.5;
    for (const [dx, dy] of [[-0.35, 0.1], [0.35, -0.15]]) {
      ctx.beginPath();
      ctx.moveTo(dx * r - r * 0.3, dy * r - r * 0.2);
      ctx.lineTo(dx * r + r * 0.3, dy * r + r * 0.2);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(dx * r - r * 0.3, dy * r + r * 0.2);
      ctx.lineTo(dx * r + r * 0.3, dy * r - r * 0.2);
      ctx.stroke();
    }
    // Top-face light on the front cube.
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.fillRect(-r * 0.72, -r * 0.28, r * 0.7, r * 0.14);
  } else if (ingId === 'sayur') {
    for (const [dx, dy, rot] of [[-0.35, 0.1, -0.5], [0.3, 0.15, 0.4], [0, -0.35, 0]]) {
      ctx.save();
      ctx.translate(dx * r, dy * r);
      ctx.rotate(rot);
      ctx.fillStyle = rg(ctx, 0, -r * 0.2, 0, r * 0.75, [[0, '#8fd493'], [0.6, '#58b368'], [1, '#35853f']]);
      ctx.beginPath();
      ctx.ellipse(0, 0, r * 0.42, r * 0.7, 0, 0, Math.PI * 2);
      ctx.fill();
      ol(ctx, '#1f5a2a', 2);
      ctx.beginPath();
      ctx.ellipse(0, 0, r * 0.42, r * 0.7, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }
    ctx.strokeStyle = '#2f7d3d';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, -r * 0.9);
    ctx.lineTo(0, r * 0.6);
    ctx.stroke();
  } else if (ingId === 'cabai') {
    ctx.strokeStyle = lg(ctx, -r * 0.7, -r * 0.35, r * 0.75, r * 0.5, [[0, '#ff6b5e'], [0.55, '#e23b3b'], [1, '#a81c1c']]);
    ctx.lineWidth = r * 0.42;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(-r * 0.7, -r * 0.35);
    ctx.quadraticCurveTo(0, r * 0.75, r * 0.75, -r * 0.45);
    ctx.stroke();
    ctx.strokeStyle = '#2f7d3d';
    ctx.lineWidth = r * 0.2;
    ctx.beginPath();
    ctx.moveTo(r * 0.7, -r * 0.5);
    ctx.lineTo(r * 0.95, -r * 0.85);
    ctx.stroke();
    // Gloss highlight along the chili.
    ctx.strokeStyle = 'rgba(255,255,255,0.5)';
    ctx.lineWidth = r * 0.12;
    ctx.beginPath();
    ctx.moveTo(-r * 0.4, -r * 0.45);
    ctx.quadraticCurveTo(-r * 0.1, -r * 0.1, r * 0.2, -r * 0.4);
    ctx.stroke();
    // Dark edge under the chili so the red never bleeds into the board.
    ctx.strokeStyle = '#7a1212';
    ctx.lineWidth = r * 0.1;
    ctx.beginPath();
    ctx.moveTo(-r * 0.7, -r * 0.2);
    ctx.quadraticCurveTo(0, r * 0.85, r * 0.72, -r * 0.32);
    ctx.stroke();
  } else if (ingId === 'teh') {
    ctx.fillStyle = lg(ctx, -r * 0.55, -r * 0.6, r * 0.55, r * 0.7, [[0, '#e8b45a'], [0.5, '#c98a2e'], [1, '#96621a']]);
    rr(ctx, -r * 0.55, -r * 0.6, r * 1.1, r * 1.3, r * 0.2);
    ctx.fill();
    ctx.fillStyle = 'rgba(255,235,190,0.75)';
    rr(ctx, -r * 0.55, -r * 0.6, r * 1.1, r * 0.35, r * 0.2);
    ctx.fill();
    ctx.strokeStyle = '#8a5a2b';
    ctx.lineWidth = 2;
    rr(ctx, -r * 0.55, -r * 0.6, r * 1.1, r * 1.3, r * 0.2);
    ctx.stroke();
  } else if (ingId === 'es') {
    ctx.strokeStyle = '#2f6da8';
    ctx.lineWidth = 2.5;
    for (const [dx, dy, rot] of [[-0.3, 0.15, 0.2], [0.32, -0.15, -0.3]]) {
      ctx.save();
      ctx.translate(dx * r, dy * r);
      ctx.rotate(rot);
      ctx.fillStyle = lg(ctx, -r * 0.42, -r * 0.42, r * 0.42, r * 0.42, [[0, '#dff2ff'], [1, '#7fbfe8']]);
      ctx.beginPath();
      ctx.rect(-r * 0.42, -r * 0.42, r * 0.84, r * 0.84);
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    }
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(-r * 0.45, -r * 0.05, r * 0.14, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
  if (raw) {
    ctx.save();
    ctx.strokeStyle = 'rgba(43,29,18,0.55)';
    ctx.lineWidth = 2;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.arc(x, y, r + 3, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }
}

function drawPlate(ctx, x, y, r) {
  // Soft contact shadow under the plate, then a radial-gradient dish:
  // bright centre, shaded rim, thin highlight on the top edge.
  softShadow(ctx, x, y + r * 0.12, r * 0.95, r * 0.3, 0.22);
  ctx.fillStyle = rg(ctx, x, y - r * 0.15, r * 0.1, r, [[0, '#ffffff'], [0.65, '#fdfbf6'], [1, '#e2d9c0']]);
  ctx.beginPath();
  ctx.ellipse(x, y, r, r * 0.78, 0, 0, Math.PI * 2);
  ctx.fill();
  // Firm dark rim so the white plate never melts into the steel inlay.
  ol(ctx, '#8a6d3b', 2.5);
  ctx.beginPath();
  ctx.ellipse(x, y, r, r * 0.78, 0, 0, Math.PI * 2);
  ctx.stroke();
  ctx.strokeStyle = '#c9b48a';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.ellipse(x, y, r * 0.72, r * 0.55, 0, 0, Math.PI * 2);
  ctx.stroke();
  ctx.strokeStyle = 'rgba(255,255,255,0.9)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.ellipse(x, y - r * 0.06, r * 0.6, r * 0.42, 0, Math.PI * 1.15, Math.PI * 1.85);
  ctx.stroke();
}

// --- background: wall, menu board, floor ---------------------------------
function drawRoom(ctx, world) {
  const { width, height } = VIEW;
  // Wall: warm vertical gradient, light falling from above.
  ctx.fillStyle = lg(ctx, 0, 0, 0, 300, [[0, '#fbeecd'], [0.6, '#f6e3bd'], [1, '#e9c88d']]);
  ctx.fillRect(0, 0, width, 300);
  // Floor: warm base, then checker tiles each lit from the top edge,
  // grout showing through the gaps, a sun pool from the window, and
  // diagonal gloss streaks on the polished tiles.
  ctx.fillStyle = lg(ctx, 0, 300, 0, 720, [[0, '#d99a5c'], [1, '#b97a3e']]);
  ctx.fillRect(0, 300, width, 420);
  for (let ty = 0; ty < 8; ty += 1) {
    for (let tx = 0; tx < 16; tx += 1) {
      const base = (tx + ty) % 2 === 0 ? ['#eab170', '#cf8a4c'] : ['#df9d59', '#c07f42'];
      ctx.fillStyle = lg(ctx, tx * 80, 300 + ty * 52.5, tx * 80, 300 + (ty + 1) * 52.5, [[0, base[0]], [1, base[1]]]);
      ctx.fillRect(tx * 80 + 1, 300 + ty * 52.5 + 1, 78, 50.5);
      // Crisp grout line so every tile reads as its own tile.
      ctx.strokeStyle = 'rgba(59,42,26,0.4)';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(tx * 80 + 1, 300 + ty * 52.5 + 1, 78, 50.5);
    }
  }
  ctx.fillStyle = rg(ctx, 180, 420, 0, 420, [[0, 'rgba(255,236,180,0.20)'], [1, 'rgba(255,236,180,0)']]);
  ctx.fillRect(0, 300, width, 420);
  ctx.fillStyle = rg(ctx, 640, 330, 0, 520, [[0, 'rgba(255,220,150,0.12)'], [1, 'rgba(255,220,150,0)']]);
  ctx.fillRect(0, 300, width, 420);
  ctx.save();
  ctx.beginPath();
  ctx.rect(0, 300, width, 420);
  ctx.clip();
  ctx.fillStyle = 'rgba(255,246,220,0.07)';
  for (const gx of [300, 620, 940]) {
    ctx.beginPath();
    ctx.moveTo(gx, 300);
    ctx.lineTo(gx + 130, 300);
    ctx.lineTo(gx + 40, 720);
    ctx.lineTo(gx - 90, 720);
    ctx.closePath();
    ctx.fill();
  }
  ctx.restore();
  // Hard edge where wall meets floor: a crisp shadow line, not a blur.
  ctx.fillStyle = 'rgba(59,42,26,0.4)';
  ctx.fillRect(0, 298, width, 3);
  // Wall band: subway-tile backsplash behind the counter row, with a
  // teal trim at the bottom — the wall must read as a kitchen, not a
  // flat band. The menu board and window are drawn over it later.
  ctx.fillStyle = lg(ctx, 0, 152, 0, 196, [[0, '#e8d5a8'], [1, '#c9ad74']]);
  ctx.fillRect(0, 152, width, 44);
  for (let row = 0; row < 2; row += 1) {
    const ty = 154 + row * 21;
    const off = row === 1 ? 23 : 0;
    for (let tx = -1; tx < 29; tx += 1) {
      const x0 = tx * 46 + off + 1;
      ctx.fillStyle = lg(ctx, x0, ty, x0, ty + 19, [[0, row === 0 ? '#fffaf0' : '#f8efdb'], [1, row === 0 ? '#f3e7c8' : '#e6d5ae']]);
      ctx.fillRect(x0, ty, 44, 19);
      // Crisp grout between subway tiles.
      ctx.strokeStyle = 'rgba(59,42,26,0.3)';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(x0, ty, 44, 19);
      // Bevel: a light line under each tile catches the lamp light.
      ctx.fillStyle = 'rgba(255,255,255,0.55)';
      ctx.fillRect(x0, ty + 18, 44, 1);
    }
  }
  ctx.fillStyle = '#2e7f7b';
  ctx.fillRect(0, 192, width, 4);
  ctx.fillStyle = lg(ctx, 390, 156, 390, 192, [[0, '#5a4230'], [0.5, '#3b2a1a'], [1, '#241608']]);
  rr(ctx, 390, 156, 500, 36, 8);
  ctx.fill();
  ol(ctx, '#1c0f04', 3);
  ctx.stroke();
  glossTop(ctx, 390, 156, 500, 36, 8, 0.16);
  ctx.fillStyle = '#ffe9b8';
  ctx.font = '700 16px system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('MENU • NASI GORENG • MIE AYAM • ES TEH', 640, 175);
  // Window with a gradient sky, sun and frame, left wall.
  ctx.fillStyle = lg(ctx, 60, 164, 60, 190, [[0, '#d4f0fc'], [1, '#8fc8e8']]);
  rr(ctx, 60, 164, 150, 26, 6);
  ctx.fill();
  ol(ctx, '#5a3413', 2.5);
  ctx.stroke();
  glossTop(ctx, 60, 164, 150, 26, 6, 0.35);
  ctx.strokeStyle = '#8a5a2b';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(135, 164);
  ctx.lineTo(135, 190);
  ctx.moveTo(60, 177);
  ctx.lineTo(210, 177);
  ctx.stroke();
  ctx.fillStyle = '#f2b134';
  ctx.beginPath();
  ctx.arc(95, 177, 9, 0, Math.PI * 2);
  ctx.fill();
  // Hanging cookware in the backsplash gaps: a frying pan left of the
  // menu board, a small pot right of it. Both hang from hooks at the
  // top of the tile band, clear of lamps, board and poster.
  ctx.strokeStyle = '#6e451f';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(320, 152);
  ctx.lineTo(320, 162);
  ctx.stroke();
  ctx.fillStyle = rg(ctx, 315, 172, 0, 18, [[0, '#6a6a72'], [1, '#2e2e33']]);
  ctx.beginPath();
  ctx.arc(320, 177, 15, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = rg(ctx, 317, 174, 0, 12, [[0, '#8a8a94'], [1, '#4a4a52']]);
  ctx.beginPath();
  ctx.arc(320, 177, 10, 0, Math.PI * 2);
  ctx.fill();
  // Steel rim light on the pan's top edge.
  ctx.strokeStyle = 'rgba(255,255,255,0.6)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(320, 177, 13, Math.PI * 1.15, Math.PI * 1.8);
  ctx.stroke();
  ctx.strokeStyle = '#6e451f';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(925, 152);
  ctx.lineTo(925, 162);
  ctx.stroke();
  ctx.fillStyle = rg(ctx, 905, 162, 0, 40, [[0, '#6a6a72'], [1, '#3a3a40']]);
  rr(ctx, 905, 162, 40, 24, 6);
  ctx.fill();
  ctx.fillStyle = rg(ctx, 905, 162, 0, 40, [[0, '#9a9aa2'], [1, '#5a5a62']]);
  rr(ctx, 905, 162, 40, 8, 6);
  ctx.fill();
  ctx.fillStyle = '#2e2e33';
  ctx.fillRect(923, 158, 4, 6);
  // Wall clock + framed poster, right of the ticket row (tickets end x 932).
  softShadow(ctx, 1170, 110, 28, 28, 0.25);
  ctx.fillStyle = rg(ctx, 1166, 104, 0, 28, [[0, '#5a4230'], [1, '#2a1c0e']]);
  ctx.beginPath();
  ctx.arc(1170, 108, 26, 0, Math.PI * 2);
  ctx.fill();
  ol(ctx, '#1c0f04', 3);
  ctx.beginPath();
  ctx.arc(1170, 108, 26, 0, Math.PI * 2);
  ctx.stroke();
  ctx.fillStyle = rg(ctx, 1166, 104, 0, 24, [[0, '#ffffff'], [1, '#e6dcc2']]);
  ctx.beginPath();
  ctx.arc(1170, 108, 22, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#3b2a1a';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(1170, 108);
  ctx.lineTo(1170, 92);
  ctx.moveTo(1170, 108);
  ctx.lineTo(1182, 112);
  ctx.stroke();
  ctx.fillStyle = '#3b2a1a';
  ctx.beginPath();
  ctx.arc(1170, 108, 2.5, 0, Math.PI * 2);
  ctx.fill();
  softShadow(ctx, 1023, 110, 68, 38, 0.25);
  ctx.fillStyle = lg(ctx, 958, 72, 958, 144, [[0, '#a06a35'], [1, '#7a4a22']]);
  rr(ctx, 958, 72, 130, 72, 6);
  ctx.fill();
  ol(ctx, '#4a2c10', 3);
  ctx.stroke();
  ctx.fillStyle = lg(ctx, 964, 78, 964, 138, [[0, '#fff8e2'], [1, '#f0dfb8']]);
  rr(ctx, 964, 78, 118, 60, 4);
  ctx.fill();
  ctx.fillStyle = '#d94f3d';
  ctx.font = '700 12px system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('WARUNG KILAT', 1023, 96);
  ctx.fillStyle = '#2e7f7b';
  ctx.font = '700 10px system-ui, sans-serif';
  ctx.fillText('SEJAK 1998', 1023, 116);
  ctx.fillText('★ ★ ★ ★ ★', 1023, 130);
  // Hanging lamps, kept clear of the menu board (x 390-890).
  for (const lx of [250, 1030]) {
    // Warm halo pooling on the wall and tiles below the lamp.
    ctx.fillStyle = rg(ctx, lx, 178, 0, 70, [[0, 'rgba(255,205,90,0.35)'], [1, 'rgba(255,205,90,0)']]);
    ctx.beginPath();
    ctx.arc(lx, 178, 70, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#6e451f';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(lx, 152);
    ctx.lineTo(lx, 168);
    ctx.stroke();
    ctx.fillStyle = lg(ctx, lx - 14, 168, lx + 14, 182, [[0, '#ffd34d'], [1, '#d98a1e']]);
    ctx.beginPath();
    ctx.moveTo(lx - 14, 168);
    ctx.lineTo(lx + 14, 168);
    ctx.lineTo(lx + 8, 182);
    ctx.lineTo(lx - 8, 182);
    ctx.closePath();
    ctx.fill();
  }
  // Rug under the play area, a runner in front of the counters, rice
  // sacks by the crate wall, and a dining corner with two customers —
  // the aisle must read as a lived-in warung, not an empty floor.
  softShadow(ctx, 640, 524, 252, 60, 0.2);
  ctx.fillStyle = rg(ctx, 640, 520, 0, 250, [[0, '#c05a42'], [0.75, '#a8442f'], [1, '#8e3a28']]);
  ctx.beginPath();
  ctx.ellipse(640, 520, 250, 58, 0, 0, Math.PI * 2);
  ctx.fill();
  ol(ctx, '#5e2418', 3);
  ctx.beginPath();
  ctx.ellipse(640, 520, 250, 58, 0, 0, Math.PI * 2);
  ctx.stroke();
  ctx.strokeStyle = '#e8b45a';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.ellipse(640, 520, 225, 46, 0, 0, Math.PI * 2);
  ctx.stroke();
  ctx.strokeStyle = 'rgba(232,180,90,0.4)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.ellipse(640, 520, 190, 36, 0, 0, Math.PI * 2);
  ctx.stroke();
  // Second rug, left-middle — the band above the main rug was bare tile.
  softShadow(ctx, 300, 443, 152, 44, 0.2);
  ctx.fillStyle = rg(ctx, 300, 440, 0, 150, [[0, '#c05a42'], [0.75, '#a8442f'], [1, '#8e3a28']]);
  ctx.beginPath();
  ctx.ellipse(300, 440, 150, 42, 0, 0, Math.PI * 2);
  ctx.fill();
  ol(ctx, '#5e2418', 3);
  ctx.beginPath();
  ctx.ellipse(300, 440, 150, 42, 0, 0, Math.PI * 2);
  ctx.stroke();
  ctx.strokeStyle = '#e8b45a';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.ellipse(300, 440, 132, 33, 0, 0, Math.PI * 2);
  ctx.stroke();
  // Third rug, right-middle — the band above the right dining table was
  // still bare tile. Flat like the other rugs: the chef walks over it.
  softShadow(ctx, 1060, 387, 112, 32, 0.2);
  ctx.fillStyle = rg(ctx, 1060, 385, 0, 110, [[0, '#c05a42'], [0.75, '#a8442f'], [1, '#8e3a28']]);
  ctx.beginPath();
  ctx.ellipse(1060, 385, 110, 30, 0, 0, Math.PI * 2);
  ctx.fill();
  ol(ctx, '#5e2418', 3);
  ctx.beginPath();
  ctx.ellipse(1060, 385, 110, 30, 0, 0, Math.PI * 2);
  ctx.stroke();
  ctx.strokeStyle = '#e8b45a';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.ellipse(1060, 385, 94, 22, 0, 0, Math.PI * 2);
  ctx.stroke();
  ctx.fillStyle = lg(ctx, 40, 302, 40, 314, [[0, '#b4503a'], [1, '#7e3a26']]);
  ctx.fillRect(40, 302, 1200, 12);
  for (const [sx, sy] of [[70, 585], [130, 600]]) {
    softShadow(ctx, sx, sy + 14, 32, 10, 0.3);
    ctx.fillStyle = rg(ctx, sx - 8, sy - 8, 0, 36, [[0, '#f4e7c2'], [0.7, '#e8d9b0'], [1, '#c4ac72']]);
    ctx.beginPath();
    ctx.ellipse(sx, sy, 30, 22, 0, 0, Math.PI * 2);
    ctx.fill();
    ol(ctx, '#8a6d3b', 2.5);
    ctx.beginPath();
    ctx.ellipse(sx, sy, 30, 22, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.strokeStyle = '#b09a68';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(sx, sy - 6, 20, 12, 0, Math.PI, 0);
    ctx.stroke();
  }
  // Dining table, bottom right, with two seated customers.
  softShadow(ctx, 1105, 552, 66, 22, 0.3);
  ctx.fillStyle = rg(ctx, 1105, 540, 0, 64, [[0, '#96683a'], [1, '#5e3a18']]);
  ctx.beginPath();
  ctx.ellipse(1105, 545, 62, 20, 0, 0, Math.PI * 2);
  ctx.fill();
  ol(ctx, '#3a220c', 2.5);
  ctx.beginPath();
  ctx.ellipse(1105, 545, 62, 20, 0, 0, Math.PI * 2);
  ctx.stroke();
  ctx.fillStyle = lg(ctx, 1100, 545, 1110, 587, [[0, '#a06a35'], [1, '#6e451f']]);
  ctx.fillRect(1100, 545, 10, 42);
  ctx.fillStyle = rg(ctx, 1105, 534, 0, 54, [[0, '#ffffff'], [0.7, '#fdfbf6'], [1, '#ddd2b8']]);
  ctx.beginPath();
  ctx.ellipse(1105, 538, 52, 14, 0, 0, Math.PI * 2);
  ctx.fill();
  for (const [cx, cy, shirt, light, dark] of [[1020, 560, '#2e7f7b', '#4a9a94', '#1f5a56'], [1190, 560, '#d94f3d', '#e86a58', '#a82c20']]) {
    softShadow(ctx, cx, cy + 26, 20, 8, 0.3);
    ctx.fillStyle = lg(ctx, cx - 16, cy - 8, cx + 16, cy + 26, [[0, light], [0.55, shirt], [1, dark]]);
    rr(ctx, cx - 16, cy - 8, 32, 34, 10);
    ctx.fill();
    ol(ctx, '#14100c', 2);
    ctx.stroke();
    ctx.fillStyle = rg(ctx, cx - 3, cy - 22, 0, 14, [[0, '#f7cf9a'], [1, '#d99a5c']]);
    ctx.beginPath();
    ctx.arc(cx, cy - 18, 12, 0, Math.PI * 2);
    ctx.fill();
    ol(ctx, '#8a5a2b', 2);
    ctx.beginPath();
    ctx.arc(cx, cy - 18, 12, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = '#2b1d12';
    ctx.beginPath();
    ctx.arc(cx, cy - 18, 12, Math.PI, 0);
    ctx.fill();
    // Hair sheen.
    ctx.fillStyle = 'rgba(255,255,255,0.25)';
    ctx.beginPath();
    ctx.ellipse(cx - 3, cy - 26, 5, 2.5, -0.4, 0, Math.PI * 2);
    ctx.fill();
  }
  // Second dining table, bottom-centre-left, with one customer.
  softShadow(ctx, 400, 551, 50, 17, 0.3);
  ctx.fillStyle = rg(ctx, 400, 540, 0, 48, [[0, '#96683a'], [1, '#5e3a18']]);
  ctx.beginPath();
  ctx.ellipse(400, 545, 46, 15, 0, 0, Math.PI * 2);
  ctx.fill();
  ol(ctx, '#3a220c', 2.5);
  ctx.beginPath();
  ctx.ellipse(400, 545, 46, 15, 0, 0, Math.PI * 2);
  ctx.stroke();
  ctx.fillStyle = lg(ctx, 396, 545, 404, 579, [[0, '#a06a35'], [1, '#6e451f']]);
  ctx.fillRect(396, 545, 8, 34);
  ctx.fillStyle = rg(ctx, 400, 535, 0, 40, [[0, '#ffffff'], [0.7, '#fdfbf6'], [1, '#ddd2b8']]);
  ctx.beginPath();
  ctx.ellipse(400, 539, 38, 11, 0, 0, Math.PI * 2);
  ctx.fill();
  softShadow(ctx, 332, 582, 18, 7, 0.3);
  ctx.fillStyle = lg(ctx, 318, 552, 346, 582, [[0, '#9a6ab8'], [0.55, '#7a4a9e'], [1, '#5a3578']]);
  rr(ctx, 318, 552, 28, 30, 9);
  ctx.fill();
  ol(ctx, '#2e1a44', 2);
  ctx.stroke();
  ctx.fillStyle = rg(ctx, 329, 540, 0, 13, [[0, '#f7cf9a'], [1, '#d99a5c']]);
  ctx.beginPath();
  ctx.arc(332, 544, 11, 0, Math.PI * 2);
  ctx.fill();
  ol(ctx, '#8a5a2b', 2);
  ctx.beginPath();
  ctx.arc(332, 544, 11, 0, Math.PI * 2);
  ctx.stroke();
  ctx.fillStyle = '#2b1d12';
  ctx.beginPath();
  ctx.arc(332, 544, 11, Math.PI, 0);
  ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.25)';
  ctx.beginPath();
  ctx.ellipse(329, 536, 4, 2, -0.4, 0, Math.PI * 2);
  ctx.fill();
  // (The potted plant used to sit here; the dining corner fills that role.)
}

// --- stations ---------------------------------------------------------------
function drawStations(ctx, world) {
  const t = world.elapsed;
  for (const s of STATIONS) {
    // Counter body: soft shadow first, then a vertical wood gradient,
    // a lit top with gloss, and a shaded edge — timber, not a flat box.
    softShadow(ctx, s.cx, s.y + s.h + 4, s.w / 2, 8, 0.3);
    ctx.fillStyle = lg(ctx, s.x, s.y, s.x, s.y + s.h, [[0, '#a06a35'], [0.55, '#8a5a2b'], [1, '#6e451f']]);
    rr(ctx, s.x, s.y, s.w, s.h, 10);
    ctx.fill();
    // Firm dark edge around the whole counter so each station separates.
    ol(ctx, '#3a220c', 3);
    ctx.stroke();
    ctx.fillStyle = lg(ctx, s.x, s.y, s.x, s.y + 26, [[0, '#cf9450'], [0.6, '#b07a3e'], [1, '#96621a']]);
    rr(ctx, s.x, s.y, s.w, 26, 10);
    ctx.fill();
    ol(ctx, '#5a3413', 2);
    ctx.stroke();
    glossTop(ctx, s.x, s.y, s.w, 26, 10, 0.28);
    ctx.fillStyle = lg(ctx, s.x, s.y + 26, s.x, s.y + 29, [[0, '#5a3413'], [1, '#6e451f']]);
    ctx.fillRect(s.x, s.y + 26, s.w, 3);
    // Wood grain on the counter top + plank seams on the body, so the
    // counter reads as timber, not a flat brown box. Station contents
    // are drawn after this and cover the seams where they overlap.
    ctx.strokeStyle = 'rgba(110,69,31,0.35)';
    ctx.lineWidth = 1.5;
    for (let gy = 0; gy < 3; gy += 1) {
      ctx.beginPath();
      ctx.moveTo(s.x + 8, s.y + 8 + gy * 8);
      ctx.bezierCurveTo(s.x + s.w * 0.3, s.y + 6 + gy * 8, s.x + s.w * 0.6, s.y + 10 + gy * 8, s.x + s.w - 8, s.y + 8 + gy * 8);
      ctx.stroke();
    }
    ctx.fillStyle = 'rgba(255,233,184,0.35)';
    ctx.fillRect(s.x, s.y + 1, s.w, 2);
    ctx.strokeStyle = 'rgba(59,42,26,0.18)';
    ctx.lineWidth = 2;
    for (let px = s.x + 38; px < s.x + s.w - 10; px += 38) {
      ctx.beginPath();
      ctx.moveTo(px, s.y + 30);
      ctx.lineTo(px, s.y + s.h - 4);
      ctx.stroke();
    }
    // Label plate.
    ctx.fillStyle = '#3b2a1a';
    rr(ctx, s.x + 14, s.y + s.h - 24, s.w - 28, 18, 6);
    ctx.fill();
    ctx.strokeStyle = '#f2b134';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.fillStyle = '#ffe9b8';
    ctx.font = '700 12px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(s.label, s.cx, s.y + s.h - 15);

    if (s.id === 'trash') {
      // Stainless bin with a highlight stripe, lid ajar, and a crumpled
      // paper ball beside it.
      ctx.fillStyle = lg(ctx, s.cx - 28, s.y + 34, s.cx + 28, s.y + 76, [[0, '#9a9aa2'], [0.45, '#6a6a72'], [1, '#3f3f46']]);
      rr(ctx, s.cx - 28, s.y + 34, 56, 42, 8);
      ctx.fill();
      ol(ctx, '#1c1c20', 2.5);
      ctx.stroke();
      ctx.fillStyle = 'rgba(255,255,255,0.5)';
      ctx.fillRect(s.cx - 28, s.y + 38, 10, 34);
      ctx.fillStyle = '#4a4a52';
      ctx.fillRect(s.cx - 28, s.y + 68, 56, 8);
      ctx.save();
      ctx.translate(s.cx + 26, s.y + 30);
      ctx.rotate(-0.35);
      ctx.fillStyle = '#3a3a40';
      rr(ctx, -30, -6, 60, 10, 5);
      ctx.fill();
      ctx.restore();
      ctx.fillStyle = '#fffdf4';
      ctx.beginPath();
      ctx.arc(s.cx + 44, s.y + 66, 9, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#c9b48a';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(s.cx + 44, s.y + 66, 5, 0, Math.PI * 2);
      ctx.stroke();
    }

    if (s.id === 'crate') {
      // Open slatted crate, produce heaped high and spilling over the rim.
      ctx.fillStyle = lg(ctx, s.cx - 62, s.y + 40, s.cx + 62, s.y + 76, [[0, '#96683a'], [1, '#5e3a18']]);
      rr(ctx, s.cx - 62, s.y + 40, 124, 36, 6);
      ctx.fill();
      ol(ctx, '#3a220c', 2.5);
      ctx.stroke();
      glossTop(ctx, s.cx - 62, s.y + 40, 124, 36, 6, 0.2);
      ctx.fillStyle = lg(ctx, s.cx - 58, s.y + 36, s.cx + 58, s.y + 48, [[0, '#5a3413'], [1, '#3a220c']]);
      rr(ctx, s.cx - 58, s.y + 36, 116, 12, 6);
      ctx.fill();      ctx.strokeStyle = '#5a3413';
      ctx.lineWidth = 2;
      for (const lx of [-31, 0, 31]) {
        ctx.beginPath();
        ctx.moveTo(s.cx + lx, s.y + 42);
        ctx.lineTo(s.cx + lx, s.y + 74);
        ctx.stroke();
      }
      ctx.strokeStyle = '#a06a35';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(s.cx - 62, s.y + 58);
      ctx.lineTo(s.cx + 62, s.y + 58);
      ctx.stroke();
      const sel = INGREDIENT_BY_ID[world.selectedIng];
      drawFood(ctx, sel.id, s.cx - 40, s.y + 34, 17, sel.prep === 'none' ? 'ready' : 'raw');
      drawFood(ctx, 'sayur', s.cx - 8, s.y + 30, 16, 'raw');
      drawFood(ctx, 'ayam', s.cx + 22, s.y + 34, 16, 'raw');
      drawFood(ctx, 'cabai', s.cx + 48, s.y + 30, 14, 'raw');
      ctx.fillStyle = '#f28c28';
      ctx.beginPath();
      ctx.arc(s.cx + 56, s.y + 52, 9, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#2f7d3d';
      ctx.beginPath();
      ctx.arc(s.cx + 56, s.y + 43, 4, 0, Math.PI * 2);
      ctx.fill();
    }

    if (s.id === 'board') {
      // Thick wooden board with a handle hole, food chopped big on it.
      softShadow(ctx, s.cx, s.y + 80, 72, 8, 0.25);
      ctx.fillStyle = lg(ctx, s.cx - 70, s.y + 30, s.cx + 70, s.y + 78, [[0, '#dcb06e'], [0.55, '#c99a5b'], [1, '#9a7138']]);
      rr(ctx, s.cx - 70, s.y + 30, 140, 48, 10);
      ctx.fill();
      ol(ctx, '#5a3413', 2.5);
      ctx.stroke();
      glossTop(ctx, s.cx - 70, s.y + 30, 140, 48, 10, 0.25);
      ctx.fillStyle = '#a87c3f';
      ctx.beginPath();
      ctx.arc(s.cx + 62, s.y + 54, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = 'rgba(110,69,31,0.4)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(s.cx - 60, s.y + 40);
      ctx.lineTo(s.cx + 60, s.y + 40);
      ctx.stroke();
      // A garlic clove and a spring-onion sprig waiting at the corner.
      ctx.fillStyle = '#fdfbf6';
      ctx.beginPath();
      ctx.ellipse(s.cx - 52, s.y + 62, 8, 6, -0.4, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#2f7d3d';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(s.cx + 48, s.y + 68);
      ctx.lineTo(s.cx + 58, s.y + 58);
      ctx.stroke();
      const item = world.board.item;
      if (item) {
        drawFood(ctx, item.ing, s.cx - 4, s.y + 52, 22, item.state);
        if (item.state === 'raw') {
          // Chopped bits scattered on the board + progress + knife.
          ctx.fillStyle = '#58b368';
          for (const [bx, by] of [[-26, 12], [-14, 16], [18, 14], [28, 8]]) {
            ctx.fillRect(s.cx + bx - 3, s.y + 52 + by - 3, 6, 6);
          }
          // Chopping progress + knife, kept above the station label.
          ctx.fillStyle = 'rgba(0,0,0,0.25)';
          rr(ctx, s.cx - 40, s.y + 68, 80, 7, 3);
          ctx.fill();
          ctx.fillStyle = '#4caf50';
          rr(ctx, s.cx - 40, s.y + 68, 80 * Math.min(1, item.progress), 7, 3);
          ctx.fill();
          const kx = s.cx + Math.sin(t * 14) * 26;
          ctx.strokeStyle = '#d7d7de';
          ctx.lineWidth = 6;
          ctx.beginPath();
          ctx.moveTo(kx - 18, s.y + 32);
          ctx.lineTo(kx + 18, s.y + 38);
          ctx.stroke();
          ctx.strokeStyle = '#8a5a2b';
          ctx.lineWidth = 6;
          ctx.beginPath();
          ctx.moveTo(kx + 18, s.y + 38);
          ctx.lineTo(kx + 28, s.y + 42);
          ctx.stroke();
        } else {
          ctx.fillStyle = '#2f7d3d';
          ctx.font = '700 13px system-ui, sans-serif';
          ctx.fillText('SIAP', s.cx, s.y + 70);
        }
      } else {
        ctx.fillStyle = 'rgba(43,29,18,0.45)';
        ctx.font = '700 13px system-ui, sans-serif';
        ctx.fillText('kosong', s.cx, s.y + 56);
      }
    }

    if (s.id === 'stove') {
      for (let b = 0; b < 2; b += 1) {
        const bx = s.cx - 42 + b * 84;
        // Burner grate.
        ctx.fillStyle = rg(ctx, bx, s.y + 52, 0, 42, [[0, '#4a4a52'], [1, '#1c1c20']]);
        ctx.beginPath();
        ctx.ellipse(bx, s.y + 56, 40, 15, 0, 0, Math.PI * 2);
        ctx.fill();
        ol(ctx, '#0f0f12', 2.5);
        ctx.beginPath();
        ctx.ellipse(bx, s.y + 56, 40, 15, 0, 0, Math.PI * 2);
        ctx.stroke();
        ctx.strokeStyle = '#1c1c20';
        ctx.lineWidth = 2;
        for (let g = -1; g <= 1; g += 1) {
          ctx.beginPath();
          ctx.moveTo(bx - 38, s.y + 56 + g * 5);
          ctx.lineTo(bx + 38, s.y + 56 + g * 5);
          ctx.stroke();
        }
        const item = world.burners[b].item;
        if (item) {
          if (item.state === 'raw') {
            // Warm fire glow pooling on the counter around the burner.
            const glow = 0.5 + 0.14 * Math.sin(t * 10 + b * 2.4);
            ctx.fillStyle = rg(ctx, bx, s.y + 56, 0, 62, [[0, `rgba(255,140,26,${glow})`], [0.55, 'rgba(255,120,20,0.18)'], [1, 'rgba(255,120,20,0)']]);
            ctx.beginPath();
            ctx.ellipse(bx, s.y + 56, 62, 26, 0, 0, Math.PI * 2);
            ctx.fill();
          }
          // Pot, bigger, with a rim.
          ctx.fillStyle = rg(ctx, bx - 8, s.y + 44, 0, 36, [[0, '#6a6a72'], [0.6, '#3f3f46'], [1, '#2a2a2e']]);
          ctx.beginPath();
          ctx.ellipse(bx, s.y + 52, 34, 13, 0, 0, Math.PI * 2);
          ctx.fill();
          ol(ctx, '#141416', 2.5);
          ctx.beginPath();
          ctx.ellipse(bx, s.y + 52, 34, 13, 0, 0, Math.PI * 2);
          ctx.stroke();
          ctx.fillStyle = rg(ctx, bx - 8, s.y + 40, 0, 32, [[0, '#8a8a94'], [1, '#4a4a52']]);
          ctx.beginPath();
          ctx.ellipse(bx, s.y + 47, 30, 11, 0, 0, Math.PI * 2);
          ctx.fill();
          // Steel rim light on the pot's top edge.
          ctx.strokeStyle = 'rgba(255,255,255,0.65)';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.ellipse(bx, s.y + 47, 26, 9, 0, Math.PI * 1.1, Math.PI * 1.9);
          ctx.stroke();
          if (item.state === 'raw') {
            // Live flame licking the pot sides, flickering with time.
            const fl = 1 + 0.18 * Math.sin(t * 10 + b * 2.4);
            ctx.fillStyle = 'rgba(255,140,26,0.9)';
            for (const [fx, fh] of [[-22, 16], [22, 15]]) {
              ctx.beginPath();
              ctx.moveTo(bx + fx - 6, s.y + 60);
              ctx.quadraticCurveTo(bx + fx - 7, s.y + 60 - fh * fl, bx + fx, s.y + 58 - fh * fl - 4);
              ctx.quadraticCurveTo(bx + fx + 7, s.y + 60 - fh * fl, bx + fx + 6, s.y + 60);
              ctx.closePath();
              ctx.fill();
            }
            ctx.fillStyle = 'rgba(255,210,61,0.95)';
            ctx.beginPath();
            ctx.moveTo(bx - 24, s.y + 60);
            ctx.quadraticCurveTo(bx - 24, s.y + 50, bx - 20, s.y + 47);
            ctx.quadraticCurveTo(bx - 18, s.y + 52, bx - 18, s.y + 60);
            ctx.closePath();
            ctx.fill();
          }
          drawFood(ctx, item.ing, bx, s.y + 44, 18, item.state);
          if (item.state === 'raw') {
            // Progress ring around the pot.
            ctx.strokeStyle = 'rgba(255,255,255,0.35)';
            ctx.lineWidth = 5;
            ctx.beginPath();
            ctx.arc(bx, s.y + 44, 24, 0, Math.PI * 2);
            ctx.stroke();
            ctx.strokeStyle = '#f2b134';
            ctx.beginPath();
            ctx.arc(bx, s.y + 44, 24, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * Math.min(1, item.progress));
            ctx.stroke();
            // Steam, bigger — soft puffs fading as they rise.
            for (let i = 0; i < 4; i += 1) {
              const sy = s.y + 32 - ((t * 18 + i * 8) % 28);
              const sx = bx - 10 + i * 7;
              ctx.fillStyle = rg(ctx, sx, sy, 0, 5, [[0, 'rgba(255,255,255,0.6)'], [1, 'rgba(255,255,255,0)']]);
              ctx.beginPath();
              ctx.arc(sx, sy, 5, 0, Math.PI * 2);
              ctx.fill();
            }
            // Timer tag on the counter's top strip — never over the label.
            const left = Math.max(0, INGREDIENT_BY_ID[item.ing].cookTime * (1 - item.progress));
            ctx.fillStyle = 'rgba(43,29,18,0.85)';
            rr(ctx, bx - 30, s.y + 6, 60, 15, 7);
            ctx.fill();
            ctx.fillStyle = '#ffe9b8';
            ctx.font = '700 10px system-ui, sans-serif';
            ctx.fillText(`${Math.ceil(left)} dtk`, bx, s.y + 14);
          } else if (item.state === 'ready') {
            const left = Math.max(0, item.burnT);
            ctx.fillStyle = left < 2.5 ? '#d94f3d' : '#2f7d3d';
            rr(ctx, bx - 34, s.y + 6, 68, 15, 7);
            ctx.fill();
            ctx.fillStyle = '#ffffff';
            ctx.font = '700 10px system-ui, sans-serif';
            ctx.fillText(left < 2.5 ? `AMBIL! ${Math.ceil(left)}` : `MATANG ${Math.ceil(left)}`, bx, s.y + 14);
          } else {
            ctx.fillStyle = '#d94f3d';
            rr(ctx, bx - 30, s.y + 6, 60, 15, 7);
            ctx.fill();
            ctx.fillStyle = '#ffffff';
            ctx.font = '700 10px system-ui, sans-serif';
            ctx.fillText('GOSONG', bx, s.y + 14);
          }
        } else {
          // Empty burner: faint pan outline + dash.
          ctx.strokeStyle = 'rgba(255,255,255,0.25)';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.ellipse(bx, s.y + 54, 30, 11, 0, 0, Math.PI * 2);
          ctx.stroke();
          ctx.fillStyle = 'rgba(255,255,255,0.25)';
          ctx.font = '700 12px system-ui, sans-serif';
          ctx.fillText('—', bx, s.y + 52);
        }
      }
    }

    if (s.id === 'table') {
      // Stainless prep inlay behind the plates, with a little sauce bowl.
      ctx.fillStyle = lg(ctx, s.cx - 82, s.y + 32, s.cx + 82, s.y + 74, [[0, '#e6eaee'], [0.55, '#c9ced3'], [1, '#9aa0a6']]);
      rr(ctx, s.cx - 82, s.y + 32, 164, 42, 8);
      ctx.fill();
      ol(ctx, '#5a6066', 2.5);
      ctx.stroke();
      glossTop(ctx, s.cx - 82, s.y + 32, 164, 42, 8, 0.35);
      ctx.strokeStyle = 'rgba(255,255,255,0.6)';
      ctx.lineWidth = 1;
      for (let bl = 0; bl < 3; bl += 1) {
        ctx.beginPath();
        ctx.moveTo(s.cx - 76, s.y + 40 + bl * 10);
        ctx.lineTo(s.cx + 76, s.y + 40 + bl * 10);
        ctx.stroke();
      }
      ctx.fillStyle = '#fdfbf6';
      ctx.beginPath();
      ctx.arc(s.cx, s.y + 42, 9, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#d94f3d';
      ctx.beginPath();
      ctx.arc(s.cx, s.y + 41, 6, 0, Math.PI * 2);
      ctx.fill();
      for (let p = 0; p < 2; p += 1) {
        const px = s.cx - 46 + p * 92;
        const plate = world.plates[p];
        const ready = plate.readyTicket !== null;
        if (ready) {
          ctx.save();
          ctx.shadowColor = '#f2b134';
          ctx.shadowBlur = 16;
          drawPlate(ctx, px, s.y + 50, 25);
          ctx.restore();
        } else {
          drawPlate(ctx, px, s.y + 50, 25);
        }
        plate.items.forEach((ing, i) => {
          drawFood(ctx, ing, px - 12 + (i % 2) * 24, s.y + 44 + Math.floor(i / 2) * 14, 12, 'ready');
        });
        if (ready) {
          ctx.fillStyle = '#b8860b';
          ctx.font = '700 11px system-ui, sans-serif';
          ctx.fillText('SIAP!', px, s.y + 74);
        } else if (plate.items.length > 0) {
          ctx.fillStyle = 'rgba(43,29,18,0.6)';
          ctx.font = '700 11px system-ui, sans-serif';
          ctx.fillText(`${plate.items.length}/3`, px, s.y + 74);
        }
      }
    }

    if (s.id === 'window') {
      // Heat lamp over the pass: red shade, warm bulb, glow cone.
      ctx.fillStyle = '#d94f3d';
      ctx.beginPath();
      ctx.moveTo(s.cx - 26, s.y + 30);
      ctx.lineTo(s.cx + 26, s.y + 30);
      ctx.lineTo(s.cx + 16, s.y + 12);
      ctx.lineTo(s.cx - 16, s.y + 12);
      ctx.closePath();
      ctx.fill();
      ol(ctx, '#7a1e12', 2.5);
      ctx.stroke();
      ctx.fillStyle = '#f2b134';
      ctx.beginPath();
      ctx.arc(s.cx, s.y + 14, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#2e7f7b';
      rr(ctx, s.cx - 58, s.y + 32, 116, 42, 8);
      ctx.fill();
      ol(ctx, '#14524e', 2.5);
      ctx.stroke();
      ctx.fillStyle = '#ffe9b8';
      ctx.font = '700 15px system-ui, sans-serif';
      ctx.fillText('SAJI  →', s.cx, s.y + 54);
      // Warm glow over the pass, tinting the panel.
      ctx.fillStyle = rg(ctx, s.cx, s.y + 14, 0, 85, [[0, 'rgba(242,177,52,0.32)'], [0.6, 'rgba(242,177,52,0.12)'], [1, 'rgba(242,177,52,0)']]);
      ctx.beginPath();
      ctx.ellipse(s.cx, s.y + 30, 80, 48, 0, 0, Math.PI * 2);
      ctx.fill();
      // Service bell, bigger, with a highlight.
      ctx.fillStyle = '#f2b134';
      ctx.beginPath();
      ctx.arc(s.cx + 44, s.y + 40, 10, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ffe9b8';
      ctx.beginPath();
      ctx.arc(s.cx + 41, s.y + 37, 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#3b2a1a';
      ctx.fillRect(s.cx + 42, s.y + 30, 4, 10);
      // Stack of clean plates waiting on the counter top.
      ctx.fillStyle = '#fdfbf6';
      ctx.beginPath();
      ctx.ellipse(s.cx - 52, s.y + 16, 13, 5, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#e8e0cc';
      ctx.beginPath();
      ctx.ellipse(s.cx - 52, s.y + 12, 13, 5, 0, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

// --- order tickets ------------------------------------------------------------
function drawTickets(ctx, world) {
  world.tickets.forEach((ticket, i) => {
    const recipe = RECIPE_BY_ID[ticket.recipeId];
    const x = TICKET.x + i * (TICKET.w + TICKET.gap);
    const y = TICKET.y;
    const urgent = ticket.patience < 15;
    ctx.save();
    ctx.shadowColor = 'rgba(0,0,0,0.28)';
    ctx.shadowBlur = 10;
    ctx.shadowOffsetY = 3;
    if (urgent && Math.sin(world.elapsed * 8) > 0) {
      ctx.shadowColor = '#d94f3d';
      ctx.shadowBlur = 14;
    }
    ctx.fillStyle = lg(ctx, x, y, x, y + TICKET.h, [[0, '#fffdf4'], [1, '#efe4c4']]);
    rr(ctx, x, y, TICKET.w, TICKET.h, 10);
    ctx.fill();
    ol(ctx, '#8a6d3b', 2.5);
    ctx.stroke();
    ctx.restore();
    ctx.fillStyle = recipe.color;
    rr(ctx, x, y, TICKET.w, 26, 10);
    ctx.fill();
    ctx.fillRect(x, y + 16, TICKET.w, 10);
    ctx.fillStyle = '#ffffff';
    ctx.font = '700 15px system-ui, sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(recipe.name.toUpperCase(), x + 10, y + 14);
    ctx.fillStyle = '#2b1d12';
    ctx.font = '700 13px system-ui, sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText(`+${recipe.reward}`, x + TICKET.w - 10, y + 14);
    recipe.components.forEach((ing, ci) => {
      drawFood(ctx, ing, x + 26 + ci * 46, y + 46, 15, 'ready');
    });
    // Patience bar.
    const frac = Math.max(0, ticket.patience / ticket.maxPatience);
    ctx.fillStyle = 'rgba(0,0,0,0.2)';
    rr(ctx, x + 10, y + 68, TICKET.w - 20, 10, 5);
    ctx.fill();
    ctx.fillStyle = frac > 0.5 ? '#4caf50' : frac > 0.25 ? '#f2b134' : '#d94f3d';
    rr(ctx, x + 10, y + 68, (TICKET.w - 20) * frac, 10, 5);
    ctx.fill();
  });
  if (world.tickets.length === 0) {
    ctx.fillStyle = 'rgba(43,29,18,0.5)';
    ctx.font = '700 15px system-ui, sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText('Menunggu order pertama…', TICKET.x + 4, TICKET.y + 40);
  }
}

// --- chef ----------------------------------------------------------------------
function drawChef(ctx, world) {
  const chef = world.chef;
  const bob = chef.moving ? Math.sin(chef.walkPhase) * 3 : 0;
  const x = chef.x;
  const y = chef.y + bob * 0.3;
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(1.55, 1.55);
  ctx.translate(-x, -y);
  softShadow(ctx, x, chef.y + 32, 30, 8, 0.3);
  // Shoes.
  ctx.fillStyle = lg(ctx, x - 20, y + 25, x + 20, y + 35, [[0, '#5a4230'], [1, '#2a1c0e']]);
  ctx.beginPath();
  ctx.ellipse(x - 11, y + 30, 9, 5, 0, 0, Math.PI * 2);
  ctx.ellipse(x + 11, y + 30, 9, 5, 0, 0, Math.PI * 2);
  ctx.fill();
  ol(ctx, '#1c0f04', 2);
  ctx.stroke();
  // Arms: short sleeves at the sides, hands below them.
  ctx.fillStyle = lg(ctx, x - 28, y - 4, x + 28, y + 20, [[0, '#3f948d'], [0.55, '#2e7f7b'], [1, '#1f5a56']]);
  rr(ctx, x - 28, y - 4, 10, 24, 5);
  ctx.fill();
  ol(ctx, '#14524e', 2);
  ctx.stroke();
  rr(ctx, x + 18, y - 4, 10, 24, 5);
  ctx.fill();
  ol(ctx, '#14524e', 2);
  ctx.stroke();
  ctx.fillStyle = rg(ctx, x - 23, y + 20, 0, 6, [[0, '#f9d6a4'], [1, '#dd9c55']]);
  ctx.beginPath();
  ctx.arc(x - 23, y + 22, 5, 0, Math.PI * 2);
  ctx.arc(x + 23, y + 22, 5, 0, Math.PI * 2);
  ctx.fill();
  // Body: teal shirt + white apron. Drawn big on purpose: the chef is
  // the game's hero and must read at a glance when the frame shrinks.
  ctx.fillStyle = lg(ctx, x - 22, y - 8, x + 22, y + 31, [[0, '#3f948d'], [0.55, '#2e7f7b'], [1, '#1f5a56']]);
  rr(ctx, x - 22, y - 8, 44, 39, 12);
  ctx.fill();
  ol(ctx, '#14524e', 2.5);
  ctx.stroke();
  glossTop(ctx, x - 22, y - 8, 44, 39, 12, 0.18);
  ctx.fillStyle = lg(ctx, x - 15, y + 3, x + 16, y + 31, [[0, '#ffffff'], [1, '#e2d8bd']]);
  rr(ctx, x - 15, y + 3, 31, 28, 7);
  ctx.fill();
  ol(ctx, '#8a6d3b', 2);
  ctx.stroke();
  // Apron pocket with a tiny chili emblem.
  ctx.strokeStyle = '#c9b48a';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(x - 9, y + 12, 18, 12);
  drawFood(ctx, 'cabai', x, y + 18, 5, 'ready');
  // Red neckerchief under the chin.
  ctx.fillStyle = '#d94f3d';
  ctx.beginPath();
  ctx.moveTo(x - 10, y - 8);
  ctx.lineTo(x + 10, y - 8);
  ctx.lineTo(x, y + 4);
  ctx.closePath();
  ctx.fill();
  // Head + chef hat.
  ctx.fillStyle = rg(ctx, x - 4, y - 26, 0, 20, [[0, '#f9d6a4'], [0.7, '#f2c184'], [1, '#dd9c55']]);
  ctx.beginPath();
  ctx.arc(x, y - 21, 17, 0, Math.PI * 2);
  ctx.fill();
  ol(ctx, '#8a5a2b', 2.5);
  ctx.beginPath();
  ctx.arc(x, y - 21, 17, 0, Math.PI * 2);
  ctx.stroke();
  ctx.fillStyle = lg(ctx, x - 18, y - 50, x + 18, y - 28, [[0, '#ffffff'], [1, '#ddd2b8']]);
  rr(ctx, x - 18, y - 44, 36, 16, 7);
  ctx.fill();
  ol(ctx, '#b8ab8a', 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(x - 9, y - 42, 10, 0, Math.PI * 2);
  ctx.arc(x + 9, y - 42, 10, 0, Math.PI * 2);
  ctx.fill();
  ol(ctx, '#b8ab8a', 2);
  ctx.stroke();
  // Hat folds.
  ctx.strokeStyle = '#c9b48a';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(x - 4, y - 46);
  ctx.quadraticCurveTo(x - 6, y - 38, x - 4, y - 32);
  ctx.moveTo(x + 5, y - 46);
  ctx.quadraticCurveTo(x + 7, y - 38, x + 5, y - 32);
  ctx.stroke();
  // Hat band.
  ctx.fillStyle = '#2e7f7b';
  ctx.fillRect(x - 18, y - 34, 36, 5);
  // Eyes look the way the chef faces.
  const ex = chef.dir === 'left' ? -5 : chef.dir === 'right' ? 5 : 0;
  ctx.fillStyle = '#2b1d12';
  ctx.beginPath();
  ctx.arc(x - 6 + ex, y - 21, 2.2, 0, Math.PI * 2);
  ctx.arc(x + 6 + ex, y - 21, 2.2, 0, Math.PI * 2);
  ctx.fill();
  // Eyebrows, blush and nose — a face, not a bare smiley.
  ctx.strokeStyle = '#2b1d12';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(x - 9 + ex, y - 28);
  ctx.lineTo(x - 3 + ex, y - 27);
  ctx.moveTo(x + 3 + ex, y - 27);
  ctx.lineTo(x + 9 + ex, y - 28);
  ctx.stroke();
  ctx.fillStyle = 'rgba(217,79,61,0.35)';
  ctx.beginPath();
  ctx.ellipse(x - 11 + ex, y - 16, 3.5, 2.5, 0, 0, Math.PI * 2);
  ctx.ellipse(x + 11 + ex, y - 16, 3.5, 2.5, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#2b1d12';
  ctx.beginPath();
  ctx.arc(x + ex * 0.5, y - 19, 1.4, 0, Math.PI * 2);
  ctx.fill();
  // Smile.
  ctx.strokeStyle = '#2b1d12';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.arc(x + ex * 0.5, y - 16, 5, 0.2, Math.PI - 0.2);
  ctx.stroke();
  // Warm rim light on the side facing the stove and heat lamp.
  ctx.strokeStyle = 'rgba(255,190,90,0.55)';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.arc(x, y - 21, 16, -Math.PI * 0.35, Math.PI * 0.3);
  ctx.stroke();
  // Carried item rides in the chef's hand at his side — clear of the
  // counter labels above him.
  if (world.carrying) {
    const hx = x + 30 + Math.sin(world.elapsed * 5) * 1.5;
    const hy = y + 14;
    if (world.carrying.kind === 'plate') {
      drawPlate(ctx, hx, hy, 16);
      world.carrying.items.forEach((ing, i) => {
        drawFood(ctx, ing, hx - 8 + (i % 2) * 16, hy - 3 + Math.floor(i / 2) * 10, 8, 'ready');
      });
    } else {
      drawFood(ctx, world.carrying.ing, hx, hy, 14, world.carrying.state);
    }
  }
  ctx.restore();
}

// --- HUD, picker, overlays ------------------------------------------------------
function drawHud(ctx, world) {
  ctx.fillStyle = lg(ctx, 0, 0, 0, 56, [[0, '#4a3524'], [0.6, '#3b2a1a'], [1, '#241608']]);
  ctx.fillRect(0, 0, VIEW.width, 56);
  ctx.fillStyle = 'rgba(242,177,52,0.4)';
  ctx.fillRect(0, 54, VIEW.width, 2);
  ctx.fillStyle = COLORS.hudText;
  ctx.textBaseline = 'middle';
  ctx.textAlign = 'left';
  ctx.font = '700 22px system-ui, sans-serif';
  ctx.fillText(`SKOR ${fmt(world.score)}`, 16, 20);
  ctx.font = '700 15px system-ui, sans-serif';
  ctx.fillStyle = '#f2b134';
  ctx.fillText(`KOIN ${fmt(world.coins)}`, 16, 42);
  ctx.textAlign = 'center';
  ctx.fillStyle = world.shiftLeft < 30 ? '#ff8a7a' : COLORS.hudText;
  ctx.font = '700 30px system-ui, sans-serif';
  ctx.fillText(mmss(world.shiftLeft), 640, 24);
  ctx.font = '700 12px system-ui, sans-serif';
  ctx.fillStyle = '#c9a97a';
  ctx.fillText('SISA SHIFT', 640, 46);
  ctx.textAlign = 'right';
  ctx.fillStyle = COLORS.hudText;
  ctx.font = '700 18px system-ui, sans-serif';
  ctx.fillText(`DISAJIKAN ${world.served}`, 1264, 20);
  if (world.combo > 1) {
    const mult = 1 + 0.25 * Math.min(world.combo, 8);
    const label = mult % 1 === 0 ? String(mult) : mult.toFixed(2);
    ctx.fillStyle = '#f2b134';
    ctx.font = '700 18px system-ui, sans-serif';
    ctx.fillText(`KOMBO x${label}`, 1264, 42);
  } else {
    ctx.fillStyle = '#c9a97a';
    ctx.font = '700 14px system-ui, sans-serif';
    ctx.fillText('KOMBO —', 1264, 42);
  }
}

function drawPicker(ctx, world) {
  ctx.fillStyle = lg(ctx, 0, 644, 0, 720, [[0, '#4a3524'], [0.6, '#3b2a1a'], [1, '#241608']]);
  ctx.fillRect(0, 644, VIEW.width, 76);
  ctx.fillStyle = 'rgba(242,177,52,0.4)';
  ctx.fillRect(0, 644, VIEW.width, 2);
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  INGREDIENTS.forEach((ing, i) => {
    const bx = PICKER.x + i * (PICKER.w + PICKER.gap);
    const selected = world.selectedIng === ing.id;
    ctx.fillStyle = selected
      ? lg(ctx, bx, PICKER.y, bx, PICKER.y + PICKER.h, [[0, '#ffd34d'], [1, '#d98a1e']])
      : lg(ctx, bx, PICKER.y, bx, PICKER.y + PICKER.h, [[0, '#6e563e'], [1, '#46331f']]);
    rr(ctx, bx, PICKER.y, PICKER.w, PICKER.h, 8);
    ctx.fill();
    ol(ctx, '#241608', 2);
    ctx.stroke();
    if (!selected) glossTop(ctx, bx, PICKER.y, PICKER.w, PICKER.h, 8, 0.14);
    ctx.fillStyle = '#fff3d6';
    drawFood(ctx, ing.id, bx + PICKER.w / 2, PICKER.y + 20, 14, ing.prep === 'none' ? 'ready' : 'raw');
    ctx.font = '700 11px system-ui, sans-serif';
    ctx.fillStyle = '#ffe9b8';
    ctx.fillText(ing.short, bx + PICKER.w / 2, PICKER.y + 42);
    ctx.fillStyle = '#c9a97a';
    ctx.font = '700 10px system-ui, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(ing.key, bx + 5, PICKER.y + 9);
    ctx.textAlign = 'center';
  });
  // Carried-item slot.
  const sx = 700;
  ctx.fillStyle = lg(ctx, sx, PICKER.y, sx, PICKER.y + PICKER.h, [[0, '#6e563e'], [1, '#46331f']]);
  rr(ctx, sx, PICKER.y, 150, PICKER.h, 8);
  ctx.fill();
  ol(ctx, '#241608', 2);
  ctx.stroke();
  glossTop(ctx, sx, PICKER.y, 150, PICKER.h, 8, 0.14);
  ctx.fillStyle = '#c9a97a';
  ctx.font = '700 11px system-ui, sans-serif';
  ctx.fillText('DI TANGAN', sx + 75, PICKER.y + 10);
  if (world.carrying) {
    if (world.carrying.kind === 'plate') {
      ctx.fillStyle = '#f2b134';
      ctx.font = '700 14px system-ui, sans-serif';
      ctx.fillText('PIRING SIAP', sx + 75, PICKER.y + 34);
    } else {
      const ing = INGREDIENT_BY_ID[world.carrying.ing];
      drawFood(ctx, ing.id, sx + 30, PICKER.y + 34, 14, world.carrying.state);
      ctx.fillStyle = '#ffe9b8';
      ctx.font = '700 13px system-ui, sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(`${ing.name} (${world.carrying.state === 'ready' ? 'siap' : world.carrying.state === 'burnt' ? 'gosong' : 'mentah'})`, sx + 52, PICKER.y + 34);
      ctx.textAlign = 'center';
    }
  } else {
    ctx.fillStyle = '#8a7a66';
    ctx.font = '700 13px system-ui, sans-serif';
    ctx.fillText('kosong', sx + 75, PICKER.y + 34);
  }
  // Hints, right side.
  ctx.fillStyle = '#c9a97a';
  ctx.font = '700 13px system-ui, sans-serif';
  ctx.textAlign = 'right';
  ctx.fillText('WASD/ Panah: jalan   •   E: pakai stasiun', 1264, PICKER.y + 18);
  ctx.fillText('Klik: pilih bahan / jalan ke stasiun   •   P: jeda', 1264, PICKER.y + 38);
  ctx.textAlign = 'center';
  if (world.hint) {
    ctx.fillStyle = '#ffe9b8';
    ctx.font = '700 16px system-ui, sans-serif';
    ctx.fillText(world.hint, 640, 632);
  }
}

function drawPopups(ctx, world) {
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  for (const p of world.popups) {
    ctx.globalAlpha = 1 - p.t / p.ttl;
    ctx.font = '800 26px system-ui, sans-serif';
    ctx.strokeStyle = 'rgba(43,29,18,0.85)';
    ctx.lineWidth = 5;
    ctx.strokeText(p.text, p.x, p.y);
    ctx.fillStyle = p.color;
    ctx.fillText(p.text, p.x, p.y);
  }
  ctx.globalAlpha = 1;
  for (const pt of world.particles) {
    ctx.globalAlpha = 1 - pt.t / pt.life;
    ctx.fillStyle = pt.color;
    ctx.beginPath();
    ctx.arc(pt.x, pt.y, pt.size, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}

function drawTitle(ctx, world) {
  ctx.fillStyle = 'rgba(30,18,8,0.62)';
  ctx.fillRect(0, 0, VIEW.width, VIEW.height);
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#ffe9b8';
  ctx.font = '800 74px system-ui, sans-serif';
  ctx.strokeStyle = '#3b2a1a';
  ctx.lineWidth = 3;
  ctx.strokeText('WARUNG KILAT', 640, 210);
  ctx.fillText('WARUNG KILAT', 640, 210);
  ctx.fillStyle = '#f2b134';
  ctx.font = '700 24px system-ui, sans-serif';
  ctx.fillText('Masak cepat, sajikan tepat waktu!', 640, 268);
  ctx.fillStyle = '#fff3d6';
  ctx.font = '400 18px system-ui, sans-serif';
  ctx.fillText('Ambil bahan → potong di talenan → masak di kompor → rakit di piring → sajikan.', 640, 330);
  ctx.fillText('WASD / panah untuk jalan, E untuk memakai stasiun, klik untuk memilih bahan.', 640, 360);
  ctx.fillText('Sajikan selagi pelanggan sabar — tip dan kombo menanti.', 640, 390);
  const pulse = 0.75 + 0.25 * Math.sin(world.elapsed * 4);
  ctx.globalAlpha = pulse;
  ctx.fillStyle = '#f2b134';
  ctx.font = '800 26px system-ui, sans-serif';
  ctx.fillText('TEKAN ENTER UNTUK MULAI', 640, 470);
  ctx.globalAlpha = 1;
}

function drawOver(ctx, world) {
  ctx.fillStyle = 'rgba(30,18,8,0.66)';
  ctx.fillRect(0, 0, VIEW.width, VIEW.height);
  ctx.fillStyle = '#fffdf4';
  rr(ctx, 390, 130, 500, 430, 16);
  ctx.fill();
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#3b2a1a';
  ctx.font = '800 40px system-ui, sans-serif';
  ctx.fillText('SHIFT SELESAI!', 640, 180);
  ctx.fillStyle = '#d94f3d';
  ctx.font = '800 92px system-ui, sans-serif';
  ctx.fillText(world.rank, 640, 268);
  const rows = [
    ['Hidangan disajikan', String(world.served)],
    ['Koin didapat', fmt(world.coins)],
    ['Kombo terbaik', `x${world.bestCombo}`],
    ['Order hangus', String(world.stats.expired)],
    ['Masakan gosong', String(world.stats.burnt)],
  ];
  ctx.font = '400 20px system-ui, sans-serif';
  rows.forEach(([label, value], i) => {
    const y = 350 + i * 34;
    ctx.fillStyle = '#3b2a1a';
    ctx.textAlign = 'left';
    ctx.fillText(label, 450, y);
    ctx.textAlign = 'right';
    ctx.fillText(value, 830, y);
  });
  ctx.fillStyle = '#2e7f7b';
  ctx.font = '800 22px system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('TEKAN R UNTUK MAIN LAGI', 640, 520);
}

export function render(ctx, world) {
  drawRoom(ctx, world);
  drawTickets(ctx, world);
  drawStations(ctx, world);
  drawChef(ctx, world);
  drawPopups(ctx, world);
  // Cinematic vignette over the room only — HUD and picker stay crisp.
  ctx.fillStyle = rg(ctx, 640, 360, 260, 820, [[0, 'rgba(30,18,8,0)'], [0.8, 'rgba(30,18,8,0.04)'], [1, 'rgba(30,18,8,0.16)']]);
  ctx.fillRect(0, 0, VIEW.width, VIEW.height);
  drawHud(ctx, world);
  drawPicker(ctx, world);
  if (world.paused) {
    ctx.fillStyle = 'rgba(30,18,8,0.55)';
    ctx.fillRect(0, 0, VIEW.width, VIEW.height);
    ctx.fillStyle = '#ffe9b8';
    ctx.font = '800 44px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('JEDA — TEKAN P', 640, 360);
  } else if (world.screen === 'title') {
    drawTitle(ctx, world);
  } else if (world.screen === 'over') {
    drawOver(ctx, world);
  }
}
