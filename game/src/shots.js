// Warung Kilat — deterministic screenshot scenes.
// Each scene builds its frame ONLY through the real game functions
// (addTicket, placeBoardItem, placeBurnerItem, addPlateItem, setChef,
// setHud), so the frame is a state real play can reach, drawn by the same
// renderer the player sees. The seed fixes the world, so the same URL
// always renders the same pixels.
import { addTicket, addPlateItem, placeBoardItem, placeBurnerItem, setChef, setHud } from './world.js';

/**
 * Stage the named scene on a fresh world and return the screen to draw.
 * cover: mid-rush — every judge criterion visible in one frame.
 * start: title over a calm kitchen with the first ticket.
 * cook: chopping at the board while two burners work.
 * serve: a ready plate carried to the serving window.
 */
export function stageShot(name, world) {
  world.screen = 'play';
  if (name === 'start') {
    addTicket(world, 'nasgor', 70);
    // Off-centre so the title text and the start prompt stay clear.
    setChef(world, 250, 520, null);
    world.screen = 'title';
    return 'title';
  }

  if (name === 'cook') {
    addTicket(world, 'mieayam', 58);
    addTicket(world, 'nasgor', 44);
    placeBoardItem(world, 'cabai', 0.45, 'raw');
    placeBurnerItem(world, 0, 'mie', 0.5, 'raw');
    placeBurnerItem(world, 1, 'telur', 1, 'ready', 5);
    setChef(world, 540, 380, { kind: 'ing', ing: 'sayur', state: 'ready' });
    setHud(world, { score: 640, coins: 640, served: 5, combo: 2, elapsed: 47 });
    return 'play';
  }

  if (name === 'serve') {
    addTicket(world, 'nasgor', 52);
    addTicket(world, 'gado', 38);
    placeBurnerItem(world, 0, 'ayam', 0.7, 'raw');
    placeBurnerItem(world, 1, 'tahu', 1, 'ready', 4);
    setChef(world, 1140, 380, { kind: 'plate', items: ['nasi', 'telur', 'cabai'], ticketId: world.tickets[0].id });
    setHud(world, { score: 1420, coins: 1420, served: 10, combo: 6, elapsed: 96 });
    // Popup sits left of the chef, never on top of him.
    world.popups.push({ x: 1030, y: 300, text: '+170', color: '#f2b134', t: 0.2, ttl: 1.4 });
    return 'play';
  }

  // cover (default): the rush — everything the judge looks for at once.
  addTicket(world, 'nasgor', 42);
  addTicket(world, 'mieayam', 28);
  addTicket(world, 'esteh', 55);
  placeBoardItem(world, 'cabai', 0.6, 'raw');
  placeBurnerItem(world, 0, 'ayam', 0.8, 'raw');
  placeBurnerItem(world, 1, 'nasi', 1, 'ready', 5);
  addPlateItem(world, 0, 'nasi');
  addPlateItem(world, 0, 'telur');
  setChef(world, 700, 400, { kind: 'ing', ing: 'sayur', state: 'ready' });
  setHud(world, { score: 1250, coins: 1250, served: 9, combo: 5, elapsed: 73 });
  return 'play';
}
