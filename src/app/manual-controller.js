import {setTrainingActive} from './activity.js';
import { ACTIONS, stateKey } from '../environment/schema.js';
import { scenarios } from '../content/scenarios.js';
import { createIslandRenderer, describeCell, hitTest } from '../rendering/island-renderer.js';
import { loadEnvironment, saveEnvironment } from '../persistence/environment-checkpoint.js';

/** @param {number} value */
const numeric = (value) => Number.isInteger(value) ? String(value) : value.toFixed(3);
/** @param {import('../environment/types.js').Outcome[]} outcomes @param {string} caption */
function outcomeTable(outcomes, caption) {
  return `<table><caption>${caption}</caption><thead><tr><th scope="col">Next state</th><th scope="col">Probability</th><th scope="col">Reward</th></tr></thead><tbody>${outcomes.map((outcome) => `<tr><td><code>${stateKey(outcome.nextState)}</code>${outcome.terminated ? ' · terminal' : ''}</td><td data-probability="${outcome.probability}">${numeric(outcome.probability * 100)}%</td><td>${numeric(outcome.reward)}</td></tr>`).join('')}</tbody></table>`;
}
/** @param {HTMLElement} root @param {import('./manual-session.js').ManualSession} session @param {Pick<Storage,'getItem'|'setItem'>} [providedStorage] */
export function mountManualWorkspace(root, session, providedStorage) {
  /** @param {string} selector */
  const element = (selector) => {
    const found = root.querySelector(selector);
    if (!(found instanceof HTMLElement)) throw new Error(`Missing manual control: ${selector}`);
    return found;
  };
  /** @param {string} selector @param {string|number} value */
  const setText = (selector, value) => { element(selector).textContent = String(value); };
  const canvas = /** @type {HTMLCanvasElement} */ (element('#island-canvas'));
  const actionSelect = /** @type {HTMLSelectElement} */ (element('#action-select'));
  const scenarioSelect = /** @type {HTMLSelectElement} */ (element('#scenario-select'));
  const seedInput = /** @type {HTMLInputElement} */ (element('#environment-seed'));
  const resetDialog = /** @type {HTMLDialogElement} */ (element('#reset-learning-dialog'));
  const loadDialog = /** @type {HTMLDialogElement} */ (element('#load-environment-dialog'));
  const renderer = createIslandRenderer(canvas);
  const abort = new AbortController();
  let running = false;
  /** @type {ReturnType<typeof setTimeout>|undefined} */ let timer;
  let selected = { x: session.environment.getState().x, y: session.environment.getState().y };
  /** @type {string|null} */ let pendingLoad = null;
  /** @type {HTMLButtonElement[]} */ let cellButtons = [];
  const storage = providedStorage??{
    /** @param {string} key */
    getItem: (key) => window.localStorage.getItem(key),
    /** @param {string} key @param {string} value */
    setItem: (key, value) => window.localStorage.setItem(key, value),
  };
  /** @param {EventTarget} target @param {string} type @param {(event: Event)=>void} handler */
  function listen(target, type, handler) { target.addEventListener(type, handler, { signal: abort.signal }); }
  /** @param {string} message */
  function message(message) { setText('#environment-message', message); }
  function draw() {
    const scenario = session.environment.getScenario(), state = session.environment.getState();
    renderer.draw(scenario, state, selected);
    canvas.setAttribute('aria-label', `Robo at column ${state.x}, row ${state.y}. Focus here to move with arrow keys or WASD. Click a cell to inspect it.`);
  }
  function refreshCells() {
    const scenario = session.environment.getScenario(), state = session.environment.getState();
    const width = scenario.grid[0].length;
    cellButtons.forEach((button, index) => {
      const x = index % width, y = Math.floor(index / width);
      const label = describeCell(scenario, state, x, y);
      button.setAttribute('aria-label', label);
      button.textContent = state.x === x && state.y === y ? 'R' : scenario.grid[y][x] === 'C' && label.includes('consumed') ? '·' : ({ '.': '·', '#': '#', G: 'G', H: '!', C: '+' })[scenario.grid[y][x]] ?? '?';
      const active = selected.x === x && selected.y === y;
      button.tabIndex = active ? 0 : -1;
      button.setAttribute('aria-pressed', String(active));
    });
    setText('#cell-details', describeCell(scenario, state, selected.x, selected.y));
  }
  function createCells() {
    const scenario = session.environment.getScenario();
    const grid = element('#accessible-map');
    grid.setAttribute('aria-rowcount', String(scenario.grid.length));
    grid.setAttribute('aria-colcount', String(scenario.grid[0].length));
    grid.innerHTML = scenario.grid.map((row, y) => `<div role="row">${[...row].map((_, x) => `<div role="gridcell"><button type="button" data-cell-x="${x}" data-cell-y="${y}" tabindex="-1"></button></div>`).join('')}</div>`).join('');
    cellButtons = [...grid.querySelectorAll('button')];
    grid.style.setProperty('--map-columns', String(scenario.grid[0].length));
    refreshCells();
  }
  function update() {
    const environment = session.environment;
    const { state, observation, info } = environment.getSnapshot();
    const stopped = info.terminated || info.truncated;
    actionSelect.value = session.action;
    setText('#mode-badge', running ? `Manual · repeating ${session.action}` : stopped ? 'Manual · stopped' : 'Manual · ready');
    setText('#current-state', JSON.stringify(state));
    setText('#agent-observation', JSON.stringify(observation));
    setText('#observation-note', observation.partial ? 'Restricted observation: enabled state features are hidden from the agent. Inspector shows privileged true state.' : 'Full observation: all enabled task-state fields are visible to the agent.');
    setText('#episode-steps', info.steps);
    setText('#episode-return', numeric(info.totalReward));
    setText('#parameter-count', `${session.parameters.size} · no algorithm`);
    setText('#episode-status', info.terminated ? `Task terminated · ${info.reason}` : info.truncated ? 'Rollout truncated · external limit' : info.steps ? 'Episode in progress' : 'Ready to move');
    setText('#episode-semantics', info.terminated ? 'Genuine task termination. Further steps give no reward; reset the episode to play again.' : info.truncated ? 'The external rollout limit was reached. The task state is nonterminal and its model still has future transitions. No learning update is performed.' : 'These are measured manual transitions and their reward sum, not a learned score or a mastery record.');
    const trace = session.lastTrace;
    element('#last-transition').innerHTML = trace ? `<h3 class="manual-subheading">Last accepted transition</h3><dl class="transition-facts"><div><dt>State</dt><dd><code>${stateKey(trace.state)}</code></dd></div><div><dt>Chosen action</dt><dd>${trace.action}</dd></div><div><dt>Actual movement</dt><dd>${trace.movement}${trace.collision ? ' · blocked' : ''}</dd></div><div><dt>Reward</dt><dd>${numeric(trace.reward)}</dd></div><div><dt>Next state</dt><dd><code>${stateKey(trace.nextState)}</code></dd></div><div><dt>Terminated / truncated</dt><dd>${trace.terminated} / ${trace.truncated}</dd></div></dl><p class="small">Reward parts: ${Object.entries(trace.rewardParts).map(([key, value]) => `${key} ${numeric(value)}`).join(' · ')}.</p><p class="small">Environment draw: ${trace.draw.toFixed(8)}. Sampled outcome probability: ${numeric(trace.probability * 100)}%.</p>${outcomeTable(trace.outcomes, 'Last action · exact transition probabilities')}` : '<p class="small trace-empty">No transition yet. Choose a direction and move once to inspect its trace.</p>';
    element('#next-outcomes').innerHTML = outcomeTable(environment.getModel().transitions(state, session.action), `Next action: ${session.action} · exact model`);
    element('#episode-identity').innerHTML = `<dt>Scenario version</dt><dd>${info.scenarioHash}</dd><dt>Environment seed</dt><dd>${info.seed}</dd><dt>External rollout cap</dt><dd>${info.rolloutLimit} steps</dd><dt>RNG</dt><dd>xorshift32-v1 · environment stream</dd>`;
    element('#trace-rows').innerHTML = session.history.length ? [...session.history].reverse().map((item) => `<tr><td>${item.step}</td><td><code>${stateKey(item.state)}</code></td><td>${item.action} → ${item.movement}${item.collision ? ' (blocked)' : ''}</td><td>${numeric(item.reward)}</td><td><code>${stateKey(item.nextState)}</code></td><td>${item.terminated ? 'Terminated' : item.truncated ? 'Truncated' : 'Active'}</td></tr>`).join('') : '<tr><td colspan="6">No trace in this session yet. A loaded checkpoint retains counters, but does not include earlier trace history.</td></tr>';
    element('#run-toggle').textContent = running ? 'Pause' : 'Run';
    element('#run-toggle').setAttribute('aria-pressed', String(running));
    for (const id of ['#step-action', '#run-toggle']) /** @type {HTMLButtonElement} */ (element(id)).disabled = stopped;
    root.querySelectorAll('[data-move]').forEach((button) => { /** @type {HTMLButtonElement} */ (button).disabled = stopped; });
    scenarioSelect.disabled = running;
    seedInput.disabled = running;
    /** @type {HTMLButtonElement} */ (element('#apply-seed')).disabled = running;
    /** @type {HTMLButtonElement} */ (element('#step-action')).disabled = stopped || running;
    refreshCells();
    draw();
  }
  function configure() {
    const scenario = session.environment.getScenario();
    const info = session.environment.getInfo();
    if (![...scenarioSelect.options].some((option) => option.value === scenario.id)) scenarioSelect.add(new Option(scenario.name, scenario.id));
    scenarioSelect.value = scenario.id;
    seedInput.value = String(info.seed);
    setText('#rollout-cap', info.rolloutLimit);
    setText('#scenario-description', scenario.description);
    element('#collectible-legend').hidden = !scenario.features.collectibles;
    element('#reward-rules').innerHTML = `<li>Each action: ${numeric(scenario.rewards.step)}</li><li>Blocked move: add ${numeric(scenario.rewards.collision)}</li><li>Goal: add ${numeric(scenario.rewards.goal)}, then terminate</li><li>Occupying a hazard: add ${numeric(scenario.rewards.hazard)} each action</li>${scenario.features.collectibles ? `<li>First supply visit: add ${numeric(scenario.rewards.collectible)}</li>` : ''}`;
    selected = { x: session.environment.getState().x, y: session.environment.getState().y };
    createCells();
    update();
  }
  function pause() {
    running = false;setTrainingActive(session,false);
    clearTimeout(timer);
    timer = undefined;
  }
  function announce() {
    const trace = session.lastTrace, info = session.environment.getInfo(), state = session.environment.getState();
    setText('#live-state', trace ? `Step ${info.steps}: chose ${trace.action}, moved ${trace.movement}${trace.collision ? ' (blocked)' : ''}. Reward ${numeric(trace.reward)}. Robo at (${state.x}, ${state.y}).${info.terminated ? ' Task terminated.' : info.truncated ? ' External rollout limit reached.' : ''}` : `Robo at (${state.x}, ${state.y}). ${info.steps} accepted steps. ${info.terminated ? 'Task terminated.' : info.truncated ? 'Rollout truncated.' : 'Ready for manual movement.'}`);
  }
  function step() {
    const result = session.step();
    if (result.terminated || result.truncated) pause();
    update();
    announce();
  }
  function tick() {
    if (!running) return;
    step();
    if (running) timer = setTimeout(tick, 500);
  }
  /** @param {string} action */
  function move(action) {
    if (!ACTIONS.includes(/** @type {import('../environment/types.js').Action} */ (action))) return;
    pause();
    session.action = /** @type {import('../environment/types.js').Action} */ (action);
    step();
  }
  listen(element('#step-action'), 'click', () => { pause(); step(); });
  listen(element('#run-toggle'), 'click', () => {
    if (running) { pause(); update(); } else { running = true; setTrainingActive(session,true);tick(); }
  });
  root.querySelectorAll('[data-move]').forEach((button) => listen(button, 'click', () => move(/** @type {HTMLElement} */ (button).dataset.move ?? '')));
  listen(actionSelect, 'change', () => { pause(); session.action = /** @type {import('../environment/types.js').Action} */ (actionSelect.value); update(); });
  listen(root, 'keydown', (event) => {
    if (!(event instanceof KeyboardEvent)) return;
    const target = event.target;
    if (!(target instanceof Element) || (target !== canvas && !target.closest('.direction-pad'))) return;
    const key = event.key.toLowerCase();
    const actions = /** @type {Record<string,string>} */ ({ arrowup: 'up', w: 'up', arrowright: 'right', d: 'right', arrowdown: 'down', s: 'down', arrowleft: 'left', a: 'left' });
    if (key === 'escape') { pause(); update(); return; }
    if (actions[key]) { event.preventDefault(); if (!event.repeat) move(actions[key]); }
  });
  listen(canvas, 'click', (event) => {
    if (!(event instanceof MouseEvent)) return;
    const bounds = canvas.getBoundingClientRect();
    const cell = hitTest(session.environment.getScenario(), event.clientX - bounds.left, event.clientY - bounds.top, bounds.width, bounds.height);
    if (cell) { selected = cell; /** @type {HTMLDetailsElement} */ (element('.text-map')).open = true; refreshCells(); draw(); }
  });
  listen(element('#accessible-map'), 'click', (event) => {
    const button = event.target instanceof Element ? event.target.closest('button') : null;
    if (button) { selected = { x: Number(button.dataset.cellX), y: Number(button.dataset.cellY) }; refreshCells(); draw(); }
  });
  listen(element('#accessible-map'), 'keydown', (event) => {
    if (!(event instanceof KeyboardEvent) || !['ArrowUp', 'ArrowRight', 'ArrowDown', 'ArrowLeft', 'Home', 'End'].includes(event.key)) return;
    event.preventDefault();
    const scenario = session.environment.getScenario(), width = scenario.grid[0].length, height = scenario.grid.length;
    selected = {
      x: event.key === 'Home' ? 0 : event.key === 'End' ? width - 1 : Math.max(0, Math.min(width - 1, selected.x + (event.key === 'ArrowRight' ? 1 : event.key === 'ArrowLeft' ? -1 : 0))),
      y: Math.max(0, Math.min(height - 1, selected.y + (event.key === 'ArrowDown' ? 1 : event.key === 'ArrowUp' ? -1 : 0))),
    };
    refreshCells(); draw();
    cellButtons[selected.y * width + selected.x].focus();
  });
  listen(element('#reset-episode'), 'click', () => {
    pause(); session.resetEpisode(); configure(); announce(); message('Episode reset with the same seed. Learned parameters were preserved.');
  });
  listen(element('#apply-seed'), 'click', () => {
    pause();
    try {
      if (!seedInput.value.trim()) throw new Error('Enter an integer seed.');
      session.resetEpisode({ seed: Number(seedInput.value) }); configure(); announce(); message('Seed applied. A new episode starts with the same parameter store.');
    } catch (error) { message(error instanceof Error ? error.message : 'Could not apply seed.'); update(); }
  });
  listen(scenarioSelect, 'change', () => {
    pause();
    const scenario = scenarios.find((item) => item.id === scenarioSelect.value);
    if (!scenario) return;
    session.changeScenario(scenario, session.environment.getInfo().seed); configure(); announce(); message('Island changed. New environment episode; no lesson progress was awarded.');
  });
  listen(element('#reset-learning'), 'click', () => { pause(); update(); resetDialog.showModal(); });
  listen(element('#confirm-learning-reset'), 'click', () => {
    session.resetLearning(); resetDialog.close(); update(); message('Parameter store cleared. Robo, episode counters, trace, and environment RNG are unchanged.');
  });
  root.querySelectorAll('[data-close-dialog]').forEach((button) => listen(button, 'click', () => { button.closest('dialog')?.close(); }));
  listen(element('#save-environment'), 'click', () => {
    pause(); update();
    try { saveEnvironment(storage, session.environment); message('Environment checkpoint saved on this device, replacing the previous saved checkpoint. No learning parameters or grades were saved.'); }
    catch { message('Could not save environment: browser storage is unavailable or full. Current play is unchanged.'); }
  });
  listen(element('#load-environment'), 'click', () => {
    pause(); update();
    try {
      const saved = loadEnvironment(storage);
      pendingLoad = saved.serialize();
      setText('#load-summary', `${saved.getScenario().name}: step ${saved.getInfo().steps}, seed ${saved.getInfo().seed}. Your current environment will be replaced.`);
      loadDialog.showModal();
    } catch (error) { message(error instanceof Error ? error.message : 'Could not read the saved checkpoint.'); }
  });
  listen(element('#confirm-load-environment'), 'click', () => {
    if (!pendingLoad) return;
    session.load(pendingLoad); pendingLoad = null; loadDialog.close(); configure(); announce(); message('Checkpoint loaded. The environment RNG will continue exactly from the saved state. Earlier trace rows are not included.');
  });
  listen(document, 'visibilitychange', () => { if (document.hidden) { pause(); update(); } });
  const resize = new ResizeObserver(draw);
  resize.observe(element('.canvas-surround'));
  configure(); announce();
  return () => { pause(); resize.disconnect(); abort.abort(); resetDialog.close(); loadDialog.close(); };
}




