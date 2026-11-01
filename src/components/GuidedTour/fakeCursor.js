// A fake mouse pointer for guided tours: when a tour simulates a hover or a click,
// the pointer glides to the spot first, so that the user sees what "happens".
//
//   await moveCursorTo(x, y)   glide to viewport coordinates (x, y); shows the pointer
//   await pulseCursor()        a short "click" animation
//   hideCursor()               remove the pointer (its last position is remembered, so
//                              that the next move starts from there)
//
// The pointer is a fixed-position element above intro.js's overlay (z-index 9999999 and
// 9999998) but below its popup (100000000).

const CURSOR_ID = "kitab-fake-cursor";

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// arrow pointer (white with a dark outline); the tip is the top left corner
const CURSOR_SVG = `
<svg width="26" height="26" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"
     style="display:block; transform-origin: 2px 2px; filter: drop-shadow(1px 2px 2px rgba(0,0,0,0.45));">
  <path d="M2 1.5 L2 19 L6.6 14.6 L9.8 21.6 L12.6 20.4 L9.5 13.6 L16 13.6 Z"
        fill="#fff" stroke="#111" stroke-width="1.6" stroke-linejoin="round"/>
</svg>`;

let lastPosition = null; // { x, y } in viewport coordinates

const getCursor = (startX, startY) => {
  let cursor = document.getElementById(CURSOR_ID);
  if (cursor) return cursor;
  cursor = document.createElement("div");
  cursor.id = CURSOR_ID;
  cursor.innerHTML = CURSOR_SVG;
  Object.assign(cursor.style, {
    position: "fixed",
    left: `${startX}px`,
    top: `${startY}px`,
    zIndex: "99999990",
    pointerEvents: "none",
    marginLeft: "-2px", // so that the tip of the arrow is exactly at (x, y)
    marginTop: "-2px",
    opacity: "0",
    transition: "opacity 200ms",
  });
  document.body.appendChild(cursor);
  cursor.getBoundingClientRect(); // force a layout, so that the transitions start from here
  return cursor;
};

/* Glide the pointer to viewport coordinates (x, y).
 * options.duration: duration of the glide in ms (default 700) */
export const moveCursorTo = async (x, y, { duration = 700 } = {}) => {
  // the first time, start somewhere near the target, down and to the left of it:
  const start = lastPosition ?? { x: x - 140, y: y + 110 };
  const cursor = getCursor(start.x, start.y);
  cursor.style.transition = `left ${duration}ms ease-in-out, top ${duration}ms ease-in-out, opacity 200ms`;
  cursor.style.opacity = "1";
  cursor.style.left = `${x}px`;
  cursor.style.top = `${y}px`;
  lastPosition = { x, y };
  await wait(duration + 50);
};

// a short "click": the pointer shrinks and springs back
export const pulseCursor = async () => {
  const cursor = document.getElementById(CURSOR_ID);
  if (!cursor) return;
  cursor.firstElementChild?.animate(
    [
      { transform: "scale(1)" },
      { transform: "scale(0.7)", offset: 0.4 },
      { transform: "scale(1)" },
    ],
    { duration: 300 }
  );
  await wait(300);
};

export const hideCursor = () => {
  document.getElementById(CURSOR_ID)?.remove();
};

// forget the last position (e.g. when a tour ends)
export const resetCursor = () => {
  hideCursor();
  lastPosition = null;
};
