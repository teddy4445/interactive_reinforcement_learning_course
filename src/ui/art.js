/** Original decorative SVG geometry. This module contains no simulation state or RNG. */
export function islandArt() {
  return `<svg class="island-art" viewBox="0 0 800 520" aria-hidden="true">
    <defs>
      <pattern id="water-lines" width="60" height="48" patternUnits="userSpaceOnUse"><path d="M8 24h18m8 0h5" stroke="#badde4" stroke-width="2" stroke-linecap="round"/></pattern>
      <linearGradient id="land" x2=".7" y2="1"><stop stop-color="#dce9c8"/><stop offset="1" stop-color="#b9d6b0"/></linearGradient>
      <g id="tree"><path d="M0 8v14" stroke="#71806a" stroke-width="4"/><path d="M-14 10 0-17 14 10Z" fill="#739f80"/><path d="M-10 0 0-22 10 0Z" fill="#86ad8a"/></g>
      <g id="rock"><path d="M-12 6-7-7 5-11 14 2 8 10-7 10Z" fill="#9ea99a"/><path d="m-7-7 6 13 15-4" fill="none" stroke="#bbc4b7" stroke-width="2"/></g>
    </defs>
    <rect width="800" height="520" fill="#e7f2f4"/><rect width="800" height="520" fill="url(#water-lines)"/>
    <path d="M112 246Q84 149 204 120L276 88Q330 50 416 73L485 55Q553 41 609 100L664 134Q733 171 703 251L716 318Q707 386 624 406L548 437Q476 478 410 446L327 464Q230 476 176 413L126 386Q74 341 112 246Z" fill="none" stroke="#cee5e6" stroke-width="32"/>
    <path d="M112 246Q84 149 204 120L276 88Q330 50 416 73L485 55Q553 41 609 100L664 134Q733 171 703 251L716 318Q707 386 624 406L548 437Q476 478 410 446L327 464Q230 476 176 413L126 386Q74 341 112 246Z" fill="#efdfb8" stroke="#d6cba5" stroke-width="2"/>
    <path d="M137 239Q110 166 216 143L284 110Q338 77 414 100L485 80Q547 70 596 120L652 153Q704 183 681 251L690 312Q681 364 616 384L537 413Q475 449 410 422L333 439Q244 451 193 391L146 365Q105 330 137 239Z" fill="url(#land)"/>
    <path d="M430 126Q405 177 450 211T451 291Q416 315 428 353T388 441" fill="none" stroke="#86becd" stroke-width="15"/>
    <path d="M429 126Q405 177 450 211T451 291Q416 315 428 353T388 441" fill="none" stroke="#b5dce4" stroke-width="7"/>
    <path d="m159 379 121 42-24-109-112-83 197 20 3-104 139 209-4-147 57-103 95 57 23 153" fill="none" stroke="#f8f4e8" stroke-width="9" stroke-linejoin="round" stroke-linecap="round"/>
    <path d="m159 379 121 42-24-109-112-83 197 20 3-104 139 209-4-147 57-103 95 57 23 153" fill="none" stroke="#baad8b" stroke-width="2" stroke-dasharray="4 7"/>
    <path d="m461 145 57-80 62 80Z" fill="#94a8a2"/><path d="m518 65 62 80h-62Z" fill="#7d9491"/><path d="m496 96 22-31 24 32-15-6-10 9-9-10Z" fill="#eef2e9"/>
    <path d="m555 169 48-70 57 70Z" fill="#aab9ae"/><path d="m603 99 57 70h-57Z" fill="#93a69a"/><path d="m585 125 18-26 21 27-14-6-8 6Z" fill="#f0f3e9"/>
    <use href="#tree" x="211" y="208"/><use href="#tree" x="242" y="186"/><use href="#tree" x="270" y="216"/><use href="#tree" x="290" y="192"/>
    <use href="#tree" x="221" y="270"/><use href="#tree" x="293" y="351"/><use href="#tree" x="330" y="329"/><use href="#tree" x="345" y="376"/>
    <use href="#tree" x="545" y="294"/><use href="#tree" x="580" y="316"/><use href="#tree" x="606" y="286"/>
    <use href="#rock" x="381" y="133"/><use href="#rock" x="402" y="152"/><use href="#rock" x="361" y="294"/>
    <use href="#rock" x="572" y="373"/><use href="#rock" x="597" y="364"/>
    <path d="m193 332 18-20 18 20v25h-36Z" fill="#f8f5e9"/><path d="m189 334 22-26 23 26" fill="none" stroke="#7c9989" stroke-width="6"/><path d="M207 357v-16h9v16" fill="#a7b5a6"/>
    <path d="M620 249v-28h22v28m-29-29 18-16 19 16Z" fill="#f8f4e5" stroke="#a7b5a6" stroke-width="3"/>
    <path d="M171 380v-38m0 1h23l-7 9 7 9h-23" fill="#2563eb" stroke="#2563eb" stroke-width="3"/>
    <g fill="#faf7ed" stroke="#a9c6c9"><path d="m66 397 16-5 11 6-13 5Z"/><path d="m717 101 16-5 11 6-13 5Z"/></g>
    <g transform="translate(735 437)" stroke="#7e9da5" fill="none"><circle r="23"/><path d="M0-17v34M-17 0h34"/><path d="m0-17-5 11 5-3 5 3Z" fill="#7e9da5"/></g>
  </svg>`;
}

export function robotArt() {
  return `<svg viewBox="0 0 100 100" aria-hidden="true"><ellipse cx="50" cy="85" rx="30" ry="6" fill="#d6e3e7"/><rect x="23" y="49" width="54" height="32" rx="12" fill="#cbd5e1"/><rect x="28" y="45" width="44" height="33" rx="10" fill="#f8fafc" stroke="#94a3b8" stroke-width="2"/><rect x="19" y="20" width="62" height="35" rx="13" fill="#fff" stroke="#94a3b8" stroke-width="2"/><rect x="29" y="29" width="42" height="17" rx="8" fill="#1e3a5f"/><circle cx="40" cy="37" r="4" fill="#93c5fd"/><circle cx="60" cy="37" r="4" fill="#93c5fd"/><path d="M50 20V11" stroke="#94a3b8" stroke-width="3"/><circle cx="50" cy="9" r="4" fill="#2563eb"/><rect x="43" y="60" width="14" height="5" rx="2" fill="#2563eb"/><path d="M25 80h13m24 0h13" stroke="#64748b" stroke-width="7" stroke-linecap="round"/></svg>`;
}

export function boardArt() {
  return `<div class="board-preview" aria-hidden="true">
    <div class="board-grid">${Array.from({ length: 48 }, (_, i) => `<span class="tile ${[4, 10, 11, 18, 29, 37].includes(i) ? 'terrain' : ''}">${i === 33 ? robotArt() : i === 14 ? '<span class="goal-marker"></span>' : ''}</span>`).join('')}</div>
  </div>`;
}

