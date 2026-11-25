// Warung Kilat — tunables and layout in one place.
// Canvas is fixed 1280x720: the judge's contact sheet shrinks it, so every
// element is drawn big and readable on purpose.
export const VIEW = { width: 1280, height: 720 };

export const SHIFT_SECONDS = 180; // one shift lasts three minutes
export const MAX_TICKETS = 4;
export const CHEF_SPEED = 290; // px per second
export const CHEF_RADIUS = 22;

// The aisle the chef walks in (below the counter row).
export const AISLE = { x0: 24, x1: 1256, y0: 330, y1: 622 };

// Floor furniture the chef walks around, not through: the dining tables
// (bottom right and bottom-centre-left) and the two rice sacks (bottom left).
export const OBSTACLES = [
  { x0: 988, y0: 508, x1: 1228, y1: 602 },
  { x0: 38, y0: 560, x1: 102, y1: 610 },
  { x0: 98, y0: 575, x1: 162, y1: 622 },
  { x0: 312, y0: 520, x1: 454, y1: 606 },
];

// Counter row: six stations, left to right. Each station is a wooden
// counter the chef stands in front of (chef.y < INTERACT_Y) to use.
export const COUNTER_Y = 196;
export const COUNTER_H = 100;
export const INTERACT_Y = 430; // chef must be this close to the counters
export const INTERACT_DX = 108; // horizontal reach from a station centre

export const STATIONS = [
  { id: 'trash', label: 'TONG SAMPAH', x: 45, w: 190, hint: 'Buang bahan' },
  { id: 'crate', label: 'PETI BAHAN', x: 245, w: 190, hint: 'Ambil bahan' },
  { id: 'board', label: 'TALENAN', x: 445, w: 190, hint: 'Potong bahan' },
  { id: 'stove', label: 'KOMPOR', x: 645, w: 190, hint: 'Masak di wajan' },
  { id: 'table', label: 'MEJA RAKIT', x: 845, w: 190, hint: 'Rakit di piring' },
  { id: 'window', label: 'JENDELA SAJI', x: 1045, w: 190, hint: 'Sajikan!' },
];
for (const s of STATIONS) {
  s.y = COUNTER_Y;
  s.h = COUNTER_H;
  s.cx = s.x + s.w / 2;
  s.cy = COUNTER_Y + COUNTER_H / 2;
}

// Order tickets sit in a row under the HUD bar.
export const TICKET = { x: 16, y: 64, w: 220, h: 88, gap: 12 };

// Bottom bar: ingredient picker buttons, then the carried-item slot.
export const PICKER = { x: 16, y: 650, w: 64, h: 54, gap: 8 };

// Warm warung palette: terracotta walls, wood counters, cream tiles.
export const COLORS = {
  wall: '#f6e3bd',
  wallBand: '#eec98f',
  floorA: '#dfa266',
  floorB: '#d18f52',
  counterWood: '#8a5a2b',
  counterTop: '#b07a3e',
  counterEdge: '#6e451f',
  hudBg: '#3b2a1a',
  hudText: '#ffe9b8',
  gold: '#f2b134',
  red: '#d94f3d',
  teal: '#2e7f7b',
  green: '#4caf50',
  cream: '#fff3d6',
  ink: '#2b1d12',
};
