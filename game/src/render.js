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
    ctx.fillStyle = '#f7f2e2';
    ctx.beginPath();
    ctx.ellipse(0, r * 0.15, r, r * 0.72, 0, Math.PI, 0);
    ctx.fill();
    // Outline so the pale mound reads on the white ticket cards.
    ctx.strokeStyle = '#cbb98d';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(0, r * 0.15, r, r * 0.72, 0, Math.PI, 0);
    ctx.stroke();
    ctx.fillStyle = '#e3d9bd';
    for (let i = 0; i < 5; i += 1) {
      ctx.beginPath();
      ctx.arc(-r * 0.5 + i * r * 0.25, -r * 0.15 + (i % 2) * r * 0.18, r * 0.09, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (ingId === 'ayam') {
    ctx.fillStyle = '#c47a28';
    ctx.beginPath();
    ctx.ellipse(0, 0, r * 0.9, r * 0.62, -0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#e8a04c';
    ctx.beginPath();
    ctx.ellipse(-r * 0.1, -r * 0.12, r * 0.62, r * 0.42, -0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#f7f2e2';
    ctx.lineWidth = r * 0.22;
    ctx.beginPath();
    ctx.moveTo(r * 0.62, r * 0.35);
    ctx.lineTo(r * 1.05, r * 0.7);
    ctx.stroke();
  } else if (ingId === 'mie') {
    ctx.strokeStyle = '#f2c94c';
    ctx.lineWidth = r * 0.28;
    ctx.lineCap = 'round';
    for (let i = -1; i <= 1; i += 1) {
      ctx.beginPath();
      ctx.moveTo(-r * 0.8, i * r * 0.42);
      ctx.quadraticCurveTo(-r * 0.3, i * r * 0.42 - r * 0.3, r * 0.2, i * r * 0.42);
      ctx.quadraticCurveTo(r * 0.6, i * r * 0.42 + r * 0.3, r * 0.85, i * r * 0.42);
      ctx.stroke();
    }
  } else if (ingId === 'telur') {
    ctx.fillStyle = '#fffdf4';
    ctx.beginPath();
    ctx.ellipse(0, 0, r * 0.95, r * 0.7, 0.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#f2b134';
    ctx.beginPath();
    ctx.arc(r * 0.1, -r * 0.05, r * 0.42, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#e08a1e';
    ctx.beginPath();
    ctx.arc(r * 0.1, -r * 0.05, r * 0.2, 0, Math.PI * 2);
    ctx.fill();
  } else if (ingId === 'tahu') {
    ctx.fillStyle = '#f7e8c8';
    ctx.strokeStyle = '#d9b96a';
    ctx.lineWidth = 2;
    for (const [dx, dy] of [[-0.35, 0.1], [0.35, -0.15]]) {
      ctx.beginPath();
      ctx.rect(dx * r - r * 0.42, dy * r - r * 0.42, r * 0.84, r * 0.84);
      ctx.fill();
      ctx.stroke();
    }
  } else if (ingId === 'sayur') {
    ctx.fillStyle = '#58b368';
    for (const [dx, dy, rot] of [[-0.35, 0.1, -0.5], [0.3, 0.15, 0.4], [0, -0.35, 0]]) {
      ctx.save();
      ctx.translate(dx * r, dy * r);
      ctx.rotate(rot);
      ctx.beginPath();
      ctx.ellipse(0, 0, r * 0.42, r * 0.7, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
    ctx.strokeStyle = '#2f7d3d';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, -r * 0.9);
    ctx.lineTo(0, r * 0.6);
    ctx.stroke();
  } else if (ingId === 'cabai') {
    ctx.strokeStyle = '#e23b3b';
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
  } else if (ingId === 'teh') {
    ctx.fillStyle = '#c98a2e';
    rr(ctx, -r * 0.55, -r * 0.6, r * 1.1, r * 1.3, r * 0.2);
    ctx.fill();
    ctx.fillStyle = '#e8b45a';
    rr(ctx, -r * 0.55, -r * 0.6, r * 1.1, r * 0.35, r * 0.2);
    ctx.fill();
    ctx.strokeStyle = '#8a5a2b';
    ctx.lineWidth = 2;
    rr(ctx, -r * 0.55, -r * 0.6, r * 1.1, r * 1.3, r * 0.2);
    ctx.stroke();
  } else if (ingId === 'es') {
    ctx.fillStyle = '#9fd8ff';
    ctx.strokeStyle = '#5aa8dd';
    ctx.lineWidth = 2;
    for (const [dx, dy, rot] of [[-0.3, 0.15, 0.2], [0.32, -0.15, -0.3]]) {
      ctx.save();
      ctx.translate(dx * r, dy * r);
      ctx.rotate(rot);
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
  ctx.fillStyle = '#fdfbf6';
  ctx.beginPath();
  ctx.ellipse(x, y, r, r * 0.78, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#c9b48a';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.ellipse(x, y, r * 0.72, r * 0.55, 0, 0, Math.PI * 2);
  ctx.stroke();
}

// --- background: wall, menu board, floor ---------------------------------
function drawRoom(ctx, world) {
  const { width, height } = VIEW;
  ctx.fillStyle = COLORS.wall;
  ctx.fillRect(0, 0, width, 300);
  // Floor tiles.
  for (let ty = 0; ty < 8; ty += 1) {
    for (let tx = 0; tx < 16; tx += 1) {
      ctx.fillStyle = (tx + ty) % 2 === 0 ? COLORS.floorA : COLORS.floorB;
      ctx.fillRect(tx * 80, 300 + ty * 52.5, 80, 52.5);
    }
  }
  ctx.fillStyle = 'rgba(0,0,0,0.08)';
  ctx.fillRect(0, 296, width, 8);
  // Wall band + menu board.
  ctx.fillStyle = COLORS.wallBand;
  ctx.fillRect(0, 152, width, 44);
  ctx.fillStyle = '#3b2a1a';
  rr(ctx, 390, 156, 500, 36, 8);
  ctx.fill();
  ctx.fillStyle = '#ffe9b8';
  ctx.font = '700 16px system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('MENU • NASI GORENG • MIE AYAM • ES TEH', 640, 175);
  // Window with sun and frame, left wall.
  ctx.fillStyle = '#bfe3f2';
  rr(ctx, 60, 164, 150, 26, 6);
  ctx.fill();
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
  // Wall clock + framed poster, right of the ticket row (tickets end x 932).
  ctx.fillStyle = '#3b2a1a';
  ctx.beginPath();
  ctx.arc(1170, 108, 26, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#fffdf4';
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
  ctx.fillStyle = '#8a5a2b';
  rr(ctx, 958, 72, 130, 72, 6);
  ctx.fill();
  ctx.fillStyle = '#fff3d6';
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
    ctx.strokeStyle = '#6e451f';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(lx, 152);
    ctx.lineTo(lx, 168);
    ctx.stroke();
    ctx.fillStyle = '#f2b134';
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
  ctx.fillStyle = '#b4503a';
  ctx.beginPath();
  ctx.ellipse(640, 520, 250, 58, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#e8b45a';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.ellipse(640, 520, 225, 46, 0, 0, Math.PI * 2);
  ctx.stroke();
  // Second rug, left-middle — the band above the main rug was bare tile.
  ctx.fillStyle = '#b4503a';
  ctx.beginPath();
  ctx.ellipse(300, 440, 150, 42, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#e8b45a';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.ellipse(300, 440, 132, 33, 0, 0, Math.PI * 2);
  ctx.stroke();
  // Third rug, right-middle — the band above the right dining table was
  // still bare tile. Flat like the other rugs: the chef walks over it.
  ctx.fillStyle = '#b4503a';
  ctx.beginPath();
  ctx.ellipse(1060, 385, 110, 30, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#e8b45a';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.ellipse(1060, 385, 94, 22, 0, 0, Math.PI * 2);
  ctx.stroke();
  ctx.fillStyle = '#a04a32';
  ctx.fillRect(40, 302, 1200, 12);
  for (const [sx, sy] of [[70, 585], [130, 600]]) {
    ctx.fillStyle = '#e8d9b0';
    ctx.beginPath();
    ctx.ellipse(sx, sy, 30, 22, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#b09a68';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(sx, sy - 6, 20, 12, 0, Math.PI, 0);
    ctx.stroke();
  }
  // Dining table, bottom right, with two seated customers.
  ctx.fillStyle = '#6e451f';
  ctx.beginPath();
  ctx.ellipse(1105, 545, 62, 20, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#8a5a2b';
  ctx.fillRect(1100, 545, 10, 42);
  ctx.fillStyle = '#fdfbf6';
  ctx.beginPath();
  ctx.ellipse(1105, 538, 52, 14, 0, 0, Math.PI * 2);
  ctx.fill();
  for (const [cx, cy, shirt] of [[1020, 560, '#2e7f7b'], [1190, 560, '#d94f3d']]) {
    ctx.fillStyle = shirt;
    rr(ctx, cx - 16, cy - 8, 32, 34, 10);
    ctx.fill();
    ctx.fillStyle = '#f2c184';
    ctx.beginPath();
    ctx.arc(cx, cy - 18, 12, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#2b1d12';
    ctx.beginPath();
    ctx.arc(cx, cy - 18, 12, Math.PI, 0);
    ctx.fill();
  }
  // Second dining table, bottom-centre-left, with one customer.
  ctx.fillStyle = '#6e451f';
  ctx.beginPath();
  ctx.ellipse(400, 545, 46, 15, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#8a5a2b';
  ctx.fillRect(396, 545, 8, 34);
  ctx.fillStyle = '#fdfbf6';
  ctx.beginPath();
  ctx.ellipse(400, 539, 38, 11, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#7a4a9e';
  rr(ctx, 318, 552, 28, 30, 9);
  ctx.fill();
  ctx.fillStyle = '#f2c184';
  ctx.beginPath();
  ctx.arc(332, 544, 11, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#2b1d12';
  ctx.beginPath();
  ctx.arc(332, 544, 11, Math.PI, 0);
  ctx.fill();
  // (The potted plant used to sit here; the dining corner fills that role.)
}

// --- stations ---------------------------------------------------------------
function drawStations(ctx, world) {
  const t = world.elapsed;
  for (const s of STATIONS) {
    // Counter body.
    ctx.fillStyle = COLORS.counterWood;
    rr(ctx, s.x, s.y, s.w, s.h, 10);
    ctx.fill();
    ctx.fillStyle = COLORS.counterTop;
    rr(ctx, s.x, s.y, s.w, 26, 10);
    ctx.fill();
    ctx.fillStyle = COLORS.counterEdge;
    ctx.fillRect(s.x, s.y + 26, s.w, 3);
    // Label plate.
    ctx.fillStyle = '#3b2a1a';
    rr(ctx, s.x + 14, s.y + s.h - 24, s.w - 28, 18, 6);
    ctx.fill();
    ctx.fillStyle = '#ffe9b8';
    ctx.font = '700 12px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(s.label, s.cx, s.y + s.h - 15);

    if (s.id === 'trash') {
      ctx.fillStyle = '#4a4a52';
      rr(ctx, s.cx - 26, s.y + 34, 52, 40, 6);
      ctx.fill();
      ctx.fillStyle = '#2e2e33';
      rr(ctx, s.cx - 30, s.y + 28, 60, 10, 5);
      ctx.fill();
    }

    if (s.id === 'crate') {
      ctx.fillStyle = '#a06a35';
      rr(ctx, s.cx - 52, s.y + 34, 104, 40, 6);
      ctx.fill();
      ctx.strokeStyle = '#6e451f';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(s.cx - 52, s.y + 54);
      ctx.lineTo(s.cx + 52, s.y + 54);
      ctx.stroke();
      const sel = INGREDIENT_BY_ID[world.selectedIng];
      drawFood(ctx, sel.id, s.cx - 26, s.y + 52, 15, sel.prep === 'none' ? 'ready' : 'raw');
      drawFood(ctx, 'sayur', s.cx + 4, s.y + 50, 13, 'raw');
      drawFood(ctx, 'ayam', s.cx + 30, s.y + 52, 14, 'raw');
    }

    if (s.id === 'board') {
      ctx.fillStyle = '#e8c98f';
      rr(ctx, s.cx - 62, s.y + 32, 124, 44, 8);
      ctx.fill();
      const item = world.board.item;
      if (item) {
        drawFood(ctx, item.ing, s.cx, s.y + 46, 17, item.state);
        if (item.state === 'raw') {
          // Chopping progress + knife, kept above the station label.
          ctx.fillStyle = 'rgba(0,0,0,0.25)';
          rr(ctx, s.cx - 40, s.y + 68, 80, 7, 3);
          ctx.fill();
          ctx.fillStyle = '#4caf50';
          rr(ctx, s.cx - 40, s.y + 68, 80 * Math.min(1, item.progress), 7, 3);
          ctx.fill();
          const kx = s.cx + Math.sin(t * 14) * 26;
          ctx.strokeStyle = '#d7d7de';
          ctx.lineWidth = 5;
          ctx.beginPath();
          ctx.moveTo(kx - 16, s.y + 34);
          ctx.lineTo(kx + 16, s.y + 38);
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
        ctx.fillStyle = '#3a3a40';
        ctx.beginPath();
        ctx.ellipse(bx, s.y + 54, 36, 14, 0, 0, Math.PI * 2);
        ctx.fill();
        const item = world.burners[b].item;
        if (item) {
          ctx.fillStyle = '#5a5a62';
          ctx.beginPath();
          ctx.ellipse(bx, s.y + 48, 30, 11, 0, 0, Math.PI * 2);
          ctx.fill();
          drawFood(ctx, item.ing, bx, s.y + 44, 14, item.state);
          if (item.state === 'raw') {
            // Progress ring around the pot.
            ctx.strokeStyle = 'rgba(255,255,255,0.35)';
            ctx.lineWidth = 5;
            ctx.beginPath();
            ctx.arc(bx, s.y + 44, 22, 0, Math.PI * 2);
            ctx.stroke();
            ctx.strokeStyle = '#f2b134';
            ctx.beginPath();
            ctx.arc(bx, s.y + 44, 22, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * Math.min(1, item.progress));
            ctx.stroke();
            // Steam.
            ctx.fillStyle = 'rgba(255,255,255,0.5)';
            for (let i = 0; i < 3; i += 1) {
              const sy = s.y + 30 - ((t * 18 + i * 9) % 26);
              ctx.beginPath();
              ctx.arc(bx - 8 + i * 8, sy, 3, 0, Math.PI * 2);
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
          ctx.fillStyle = 'rgba(255,255,255,0.25)';
          ctx.font = '700 12px system-ui, sans-serif';
          ctx.fillText('—', bx, s.y + 52);
        }
      }
    }

    if (s.id === 'table') {
      for (let p = 0; p < 2; p += 1) {
        const px = s.cx - 46 + p * 92;
        const plate = world.plates[p];
        const ready = plate.readyTicket !== null;
        if (ready) {
          ctx.save();
          ctx.shadowColor = '#f2b134';
          ctx.shadowBlur = 16;
          drawPlate(ctx, px, s.y + 50, 23);
          ctx.restore();
        } else {
          drawPlate(ctx, px, s.y + 50, 23);
        }
        plate.items.forEach((ing, i) => {
          drawFood(ctx, ing, px - 11 + (i % 2) * 22, s.y + 44 + Math.floor(i / 2) * 13, 9, 'ready');
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
      ctx.fillStyle = '#2e7f7b';
      rr(ctx, s.cx - 58, s.y + 32, 116, 42, 8);
      ctx.fill();
      ctx.fillStyle = '#ffe9b8';
      ctx.font = '700 15px system-ui, sans-serif';
      ctx.fillText('SAJI  →', s.cx, s.y + 54);
      ctx.fillStyle = '#f2b134';
      ctx.beginPath();
      ctx.arc(s.cx + 44, s.y + 40, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#3b2a1a';
      ctx.fillRect(s.cx + 42, s.y + 32, 4, 8);
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
    if (urgent && Math.sin(world.elapsed * 8) > 0) {
      ctx.shadowColor = '#d94f3d';
      ctx.shadowBlur = 14;
    }
    ctx.fillStyle = '#fffdf4';
    rr(ctx, x, y, TICKET.w, TICKET.h, 10);
    ctx.fill();
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
  ctx.scale(1.18, 1.18);
  ctx.translate(-x, -y);
  ctx.fillStyle = 'rgba(0,0,0,0.22)';
  ctx.beginPath();
  ctx.ellipse(x, chef.y + 32, 30, 8, 0, 0, Math.PI * 2);
  ctx.fill();
  // Body: teal shirt + white apron. Drawn big on purpose: the chef is
  // the game's hero and must read at a glance when the frame shrinks.
  ctx.fillStyle = '#2e7f7b';
  rr(ctx, x - 22, y - 8, 44, 39, 12);
  ctx.fill();
  ctx.fillStyle = '#fdfbf6';
  rr(ctx, x - 15, y + 3, 31, 28, 7);
  ctx.fill();
  // Head + chef hat.
  ctx.fillStyle = '#f2c184';
  ctx.beginPath();
  ctx.arc(x, y - 21, 17, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#fdfbf6';
  rr(ctx, x - 18, y - 44, 36, 16, 7);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(x - 9, y - 42, 10, 0, Math.PI * 2);
  ctx.arc(x + 9, y - 42, 10, 0, Math.PI * 2);
  ctx.fill();
  // Eyes look the way the chef faces.
  const ex = chef.dir === 'left' ? -5 : chef.dir === 'right' ? 5 : 0;
  ctx.fillStyle = '#2b1d12';
  ctx.beginPath();
  ctx.arc(x - 6 + ex, y - 21, 2.2, 0, Math.PI * 2);
  ctx.arc(x + 6 + ex, y - 21, 2.2, 0, Math.PI * 2);
  ctx.fill();
  // Carried item floats above the hat, clear of it.
  if (world.carrying) {
    const cy = y - 58 + Math.sin(world.elapsed * 5) * 2;
    if (world.carrying.kind === 'plate') {
      drawPlate(ctx, x, cy, 20);
      world.carrying.items.forEach((ing, i) => {
        drawFood(ctx, ing, x - 9 + (i % 2) * 18, cy - 3 + Math.floor(i / 2) * 11, 8, 'ready');
      });
    } else {
      drawFood(ctx, world.carrying.ing, x, cy, 16, world.carrying.state);
    }
  }
  ctx.restore();
}

// --- HUD, picker, overlays ------------------------------------------------------
function drawHud(ctx, world) {
  ctx.fillStyle = COLORS.hudBg;
  ctx.fillRect(0, 0, VIEW.width, 56);
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
  ctx.fillStyle = COLORS.hudBg;
  ctx.fillRect(0, 644, VIEW.width, 76);
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  INGREDIENTS.forEach((ing, i) => {
    const bx = PICKER.x + i * (PICKER.w + PICKER.gap);
    const selected = world.selectedIng === ing.id;
    ctx.fillStyle = selected ? '#f2b134' : '#5a4632';
    rr(ctx, bx, PICKER.y, PICKER.w, PICKER.h, 8);
    ctx.fill();
    ctx.fillStyle = '#fff3d6';
    drawFood(ctx, ing.id, bx + PICKER.w / 2, PICKER.y + 20, 13, ing.prep === 'none' ? 'ready' : 'raw');
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
  ctx.fillStyle = '#5a4632';
  rr(ctx, sx, PICKER.y, 150, PICKER.h, 8);
  ctx.fill();
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
      drawFood(ctx, ing.id, sx + 30, PICKER.y + 34, 13, world.carrying.state);
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
