import { scenarios } from '../content/scenarios.js';

/** DOM shell only; the controller fills every state/metric from the live environment. */
export function manualWorkspaceView() {
  return `<div class="workspace-grid manual-workspace">
  <section class="card instructions workspace-panel" data-panel="instructions" id="panel-instructions" aria-labelledby="tab-instructions">
    <p class="eyebrow">A real environment · manual control</p><h2>Meet Robo</h2><p>Reach the diamond goal. First try moving right from the start: the rock blocks that move. Then try down and follow the bottom row.</p>
    <div class="inset"><strong>One action, one transition</strong><p>Compare the direction you choose with the movement that actually happens. On Slippery Shore, inspect all possible outcomes before moving.</p></div>
    <h3 class="manual-subheading">Reward rules</h3><ul class="reward-rules" id="reward-rules"></ul>
    <p class="small">A goal ends the task. The external <span id="rollout-cap">80</span>-step rollout limit stops collection without making the current state terminal.</p>
    <p class="source-note">This is the shared manual environment, not a completed lesson or assessment. Activity-to-slide mappings remain unverified.</p>
  </section>
  <section class="card world-panel" aria-label="Manual island environment">
    <div class="card-heading"><h2>Robo’s island</h2><span id="mode-badge" class="badge">Manual · ready</span></div>
    <div class="environment-setup">
      <label class="field">Island<select id="scenario-select">${scenarios.map((scenario) => `<option value="${scenario.id}">${scenario.name}</option>`).join('')}</select></label>
      <div class="seed-field"><label class="field" for="environment-seed">Environment seed<input id="environment-seed" type="number" min="0" max="4294967295" step="1" value="7" inputmode="numeric"></label><button class="button secondary" id="apply-seed">Apply seed & reset</button></div>
    </div>
    <p id="scenario-description" class="scenario-description"></p>
    <div class="canvas-surround"><canvas id="island-canvas" width="560" height="560" tabindex="0" role="img" aria-label="Robo’s island. Focus here to move with arrow keys or WASD." aria-describedby="movement-help live-state">Your browser does not support Canvas. Use the text map and movement buttons below.</canvas></div>
    <div class="world-legend"><span><i class="legend-floor"></i>Floor</span><span><i class="legend-rock"></i>Wall</span><span><i class="legend-goal"></i>Goal</span><span><i class="legend-hazard">!</i>Hazard</span><span id="collectible-legend"><i class="legend-supply">+</i>Supply</span></div>
    <p id="live-state" class="live-state" role="status" aria-live="polite" aria-atomic="true"></p>
    <p id="movement-help" class="movement-help">Focus the map and use arrow keys or WASD, or tap a direction to move once. Coordinates start at 0.</p>
    <div class="manual-controls">
      <div class="direction-pad" aria-label="Move Robo"><button class="button secondary pad-up" data-move="up" aria-label="Move up">↑</button><button class="button secondary pad-left" data-move="left" aria-label="Move left">←</button><span class="pad-center" aria-hidden="true">R</span><button class="button secondary pad-right" data-move="right" aria-label="Move right">→</button><button class="button secondary pad-down" data-move="down" aria-label="Move down">↓</button></div>
      <div class="step-controls"><label class="field">Next action<select id="action-select"><option value="up">Up</option><option value="right" selected>Right</option><option value="down">Down</option><option value="left">Left</option></select></label>
      <div class="actions"><button class="button primary" id="step-action">Step</button><button class="button secondary" id="run-toggle" aria-pressed="false">Run</button></div>
      <p class="small">Run repeats this direction every 500 ms. It does not learn or plan.</p></div>
    </div>
    <div class="episode-toolbar"><button class="button secondary" id="reset-episode">Reset episode</button><button class="button secondary" id="reset-learning">Reset learning</button><button class="button secondary" id="save-environment">Save environment</button><button class="button secondary" id="load-environment">Load environment</button></div>
    <p class="control-explanation">Episode reset restores the start and the same seed. Learning reset clears parameters only. No learning algorithm is loaded.</p>
    <p id="environment-message" class="environment-message" role="status" aria-live="polite"></p>
    <details class="text-map"><summary>Text map & cell inspector</summary><p class="small">Arrow keys here inspect cells; they do not move Robo. Enter selects a cell.</p><div id="accessible-map" role="grid" aria-label="Island cells, zero-based coordinates"></div><p id="cell-details" aria-live="polite"></p></details>
  </section>
  <div class="workspace-tabs" role="tablist" aria-label="Workspace information">${['Instructions', 'Inspector', 'Results'].map((name, i) => `<button role="tab" id="tab-${name.toLowerCase()}" aria-controls="panel-${name.toLowerCase()}" aria-selected="${i === 0}" tabindex="${i === 0 ? 0 : -1}" data-workspace-tab="${name.toLowerCase()}">${name}</button>`).join('')}</div>
  <section class="card inspector workspace-panel" data-panel="inspector" id="panel-inspector" aria-labelledby="tab-inspector">
    <p class="eyebrow">From the actual transition</p><h2>State & trace</h2>
    <div class="state-block"><h3>True task state</h3><code id="current-state" data-testid="current-state"></code></div>
    <div class="state-block"><h3>Agent observation</h3><code id="agent-observation"></code><p class="small" id="observation-note"></p></div>
    <div id="last-transition"></div>
    <div class="probability-table" id="next-outcomes"></div>
    <details class="checkpoint-details"><summary>Episode identity</summary><dl id="episode-identity"></dl></details>
  </section>
  <section class="card results-panel workspace-panel manual-results" data-panel="results" id="panel-results" aria-labelledby="tab-results">
    <div class="episode-summary"><div><p class="eyebrow">Actual manual episode</p><h2 id="episode-status">Ready to move</h2></div><dl><div><dt>Accepted steps</dt><dd id="episode-steps" data-testid="episode-steps">0</dd></div><div><dt>Sum of rewards</dt><dd id="episode-return">0</dd></div><div><dt>Learning parameters</dt><dd id="parameter-count">0 · no algorithm</dd></div></dl></div>
    <p id="episode-semantics" class="small"></p><div class="trace-history"><table><caption>Recent transitions · up to 100 steps, newest first</caption><thead><tr><th scope="col">Step</th><th scope="col">State</th><th scope="col">Action → movement</th><th scope="col">Reward</th><th scope="col">Next state</th><th scope="col">Outcome</th></tr></thead><tbody id="trace-rows"></tbody></table></div>
  </section>
  </div>
  <dialog id="reset-learning-dialog" aria-labelledby="reset-learning-title"><h2 id="reset-learning-title">Reset learned parameters?</h2><p>No learning algorithm is loaded. This clears the separate parameter store without moving Robo, restarting the RNG, or clearing the episode trace.</p><div class="actions"><button class="button secondary" data-close-dialog>Cancel</button><button class="button primary" id="confirm-learning-reset">Clear parameters</button></div></dialog>
  <dialog id="load-environment-dialog" aria-labelledby="load-environment-title"><h2 id="load-environment-title">Replace the current environment?</h2><p id="load-summary"></p><p>The checkpoint contains the map, task state, counters, and environment RNG. It does not contain learning parameters or trace history.</p><div class="actions"><button class="button secondary" data-close-dialog>Cancel</button><button class="button primary" id="confirm-load-environment">Load checkpoint</button></div></dialog>`;
}


