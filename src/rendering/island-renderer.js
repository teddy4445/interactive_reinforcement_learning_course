import { collectibleBit } from '../environment/schema.js';
/** Canvas consumes snapshots only. No stepping, timers, or random draws. */
/** @typedef {import('../environment/types.js').Scenario} Scenario */
/** @typedef {import('../environment/types.js').State} State */

/** @param {number} width @param {number} height @param {Scenario} scenario */
function geometry(width, height, scenario) {
  const margin = 28;
  return { margin, cellWidth: (width - margin * 2) / scenario.grid[0].length, cellHeight: (height - margin * 2) / scenario.grid.length };
}
/** Coordinates are canvas CSS pixels, not backing-store/device pixels.
 * @param {Scenario} scenario @param {number} x @param {number} y @param {number} width @param {number} height
 */
export function hitTest(scenario, x, y, width, height) {
  const { margin, cellWidth, cellHeight } = geometry(width, height, scenario);
  const column = Math.floor((x - margin) / cellWidth), row = Math.floor((y - margin) / cellHeight);
  return column >= 0 && row >= 0 && column < scenario.grid[0].length && row < scenario.grid.length ? { x: column, y: row } : null;
}
/** @param {Scenario} scenario @param {State} state @param {number} x @param {number} y */
export function describeCell(scenario, state, x, y) {
  const tile = scenario.grid[y][x];
  let name = ({ '.': 'floor', '#': 'wall', G: 'goal', H: 'hazard', C: 'supply' })[tile] ?? 'unknown';
  if (tile === 'C') {
    const bit = collectibleBit(scenario, x, y);
    name = state.collected !== undefined && (state.collected & bit) ? 'consumed supply (floor)' : 'uncollected supply';
  }
  return `Column ${x}, row ${y}: ${name}${state.x === x && state.y === y ? '; Robo is here' : ''}.`;
}

/** @param {HTMLCanvasElement} canvas */
export function createIslandRenderer(canvas) {
  const context = canvas.getContext('2d');
  /** @param {Scenario} scenario @param {State} state @param {{x:number,y:number}|null} selected */
  function draw(scenario, state, selected = null) {
    if (!context) return; // The complete DOM map and controls remain usable.
    const size = Math.max(1, canvas.getBoundingClientRect().width);
    const ratio = Math.min(window.devicePixelRatio || 1, 3);
    canvas.width = Math.round(size * ratio);
    const height = (size - 56) / scenario.grid[0].length * scenario.grid.length + 56;
    canvas.height = Math.round(height * ratio);
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
    context.fillStyle = '#e7f2f4';
    context.fillRect(0, 0, size, height);
    const { margin, cellWidth: cw, cellHeight: ch } = geometry(size, height, scenario);
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.font = `500 ${Math.max(10, cw * 0.21)}px Inter, sans-serif`;
    for (let y = 0; y < scenario.grid.length; y++) {
      for (let x = 0; x < scenario.grid[y].length; x++) {
        const left = margin + x * cw, top = margin + y * ch;
        const tile = scenario.grid[y][x];
        context.fillStyle = (x + y) % 2 ? '#e9efdd' : '#e2ead5';
        context.fillRect(left + 1, top + 1, cw - 2, ch - 2);
        if (tile === '#') {
          context.fillStyle = '#78917e';
          context.beginPath();
          context.roundRect(left + cw * .2, top + ch * .2, cw * .6, ch * .6, cw * .12);
          context.fill();
          context.strokeStyle = '#4f6a57'; context.lineWidth = 2; context.stroke();
        }
        if (tile === 'G') {
          context.beginPath();
          context.moveTo(left + cw * .5, top + ch * .18);
          context.lineTo(left + cw * .82, top + ch * .5);
          context.lineTo(left + cw * .5, top + ch * .82);
          context.lineTo(left + cw * .18, top + ch * .5);
          context.closePath();
          context.fillStyle = '#eff6ff'; context.fill();
          context.strokeStyle = '#2563eb'; context.lineWidth = 2.5; context.stroke();
          context.fillStyle = '#1d4ed8'; context.fillText('G', left + cw / 2, top + ch / 2);
        }
        if (tile === 'H') {
          context.beginPath(); context.moveTo(left + cw / 2, top + ch * .15); context.lineTo(left + cw * .85, top + ch * .83); context.lineTo(left + cw * .15, top + ch * .83); context.closePath();
          context.fillStyle = '#ffe4e6'; context.fill(); context.strokeStyle = '#be123c'; context.lineWidth = 2; context.stroke();
          context.fillStyle = '#9f1239'; context.fillText('!', left + cw / 2, top + ch * .57);
        }
        if (tile === 'C' && !(Number(state.collected) & collectibleBit(scenario, x, y))) {
          context.fillStyle = '#fef3c7'; context.strokeStyle = '#92400e'; context.lineWidth = 2;
          context.beginPath(); context.roundRect(left + cw * .24, top + ch * .24, cw * .52, ch * .52, 4); context.fill(); context.stroke();
          context.fillStyle = '#78350f'; context.fillText('+', left + cw / 2, top + ch / 2);
        }
        if (selected?.x === x && selected.y === y) {
          context.strokeStyle = '#1d4ed8'; context.lineWidth = 2; context.setLineDash([4, 3]);
          context.strokeRect(left + 3, top + 3, cw - 6, ch - 6); context.setLineDash([]);
        }
      }
    }
    context.fillStyle = '#4b5563';
    // Coordinate labels fit the fixed 28px margin even on small maps with large cells.
    context.font = '500 12px Inter, sans-serif';
    for (let x = 0; x < scenario.grid[0].length; x++) context.fillText(String(x), margin + (x + .5) * cw, margin / 2);
    for (let y = 0; y < scenario.grid.length; y++) context.fillText(String(y), margin / 2, margin + (y + .5) * ch);
    const rx = margin + state.x * cw, ry = margin + state.y * ch;
    context.strokeStyle = '#64748b'; context.lineWidth = 1.5;
    context.fillStyle = '#f8fafc'; context.beginPath(); context.roundRect(rx + cw * .27, ry + ch * .46, cw * .46, ch * .39, 5); context.fill(); context.stroke();
    context.beginPath(); context.roundRect(rx + cw * .18, ry + ch * .22, cw * .64, ch * .38, 6); context.fill(); context.stroke();
    context.fillStyle = '#1e3a5f'; context.beginPath(); context.roundRect(rx + cw * .27, ry + ch * .31, cw * .46, ch * .17, 4); context.fill();
    context.fillStyle = '#bfdbfe';
    for (const offset of [.39, .61]) { context.beginPath(); context.arc(rx + cw * offset, ry + ch * .39, cw * .045, 0, Math.PI * 2); context.fill(); }
    context.fillStyle = '#2563eb'; context.fillRect(rx + cw * .42, ry + ch * .65, cw * .16, ch * .045);
    context.beginPath(); context.arc(rx + cw * .5, ry + ch * .15, cw * .045, 0, Math.PI * 2); context.fill();
  }
  return { draw };
}




