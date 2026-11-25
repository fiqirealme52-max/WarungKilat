// Warung Kilat — keyboard + mouse input, with edge-triggered presses.
// Movement: WASD or arrow keys. Interact: E or Space. Pick ingredient:
// keys 1-9 or click the picker bar. Click a station to walk to it and use
// it; click the floor to walk there. P pauses, R restarts after a shift.
export function createInput() {
  return {
    keys: new Set(),
    pressedKeys: new Set(),
    mouse: { x: 0, y: 0, clicked: false, clickX: 0, clickY: 0, down: false },
  };
}

export function attachInput(input, canvas) {
  window.addEventListener('keydown', (event) => {
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(event.code)) event.preventDefault();
    if (!event.repeat) {
      input.keys.add(event.code);
      input.pressedKeys.add(event.code);
    }
  });
  window.addEventListener('keyup', (event) => input.keys.delete(event.code));
  window.addEventListener('blur', () => input.keys.clear());

  const toLocal = (event) => {
    const rect = canvas.getBoundingClientRect();
    return {
      x: (event.clientX - rect.left) * (canvas.width / rect.width),
      y: (event.clientY - rect.top) * (canvas.height / rect.height),
    };
  };
  canvas.addEventListener('pointermove', (event) => {
    const p = toLocal(event);
    input.mouse.x = p.x;
    input.mouse.y = p.y;
  });
  canvas.addEventListener('pointerdown', (event) => {
    const p = toLocal(event);
    input.mouse.x = p.x;
    input.mouse.y = p.y;
    input.mouse.down = true;
    input.mouse.clicked = true;
    input.mouse.clickX = p.x;
    input.mouse.clickY = p.y;
  });
  window.addEventListener('pointerup', () => { input.mouse.down = false; });
}

/** True once for the frame the key went down. */
export function wasPressed(input, code) {
  return input.pressedKeys.has(code);
}

/** Movement vector from held keys, normalised. */
export function moveVector(input) {
  let x = 0;
  let y = 0;
  if (input.keys.has('KeyA') || input.keys.has('ArrowLeft')) x -= 1;
  if (input.keys.has('KeyD') || input.keys.has('ArrowRight')) x += 1;
  if (input.keys.has('KeyW') || input.keys.has('ArrowUp')) y -= 1;
  if (input.keys.has('KeyS') || input.keys.has('ArrowDown')) y += 1;
  if (x !== 0 && y !== 0) {
    x *= Math.SQRT1_2;
    y *= Math.SQRT1_2;
  }
  return { x, y };
}

export function endFrame(input) {
  input.pressedKeys.clear();
  input.mouse.clicked = false;
}
