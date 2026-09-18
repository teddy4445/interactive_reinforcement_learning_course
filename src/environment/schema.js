/** @typedef {import('./types.js').Scenario} Scenario */
/** @typedef {import('./types.js').State} State */
export const SCHEMA_VERSION = 1;
export const MAX_CHECKPOINT_BYTES = 65536;
/** @type {readonly import('./types.js').Action[]} */
export const ACTIONS = Object.freeze(['up', 'right', 'down', 'left']);

/** Reject unknown fields, including prototype-related keys, before constructing objects.
 * @param {unknown} value @param {string[]} keys @returns {Record<string, unknown>}
 */
export function record(value, keys) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('Expected a record.');
  if (Object.keys(value).some((key) => !keys.includes(key))) throw new Error('Unsupported record field.');
  return /** @type {Record<string, unknown>} */ (value);
}
/** @param {unknown} value @param {number} min @param {number} max */
export function integer(value, min, max) {
  if (!Number.isInteger(value) || Number(value) < min || Number(value) > max) throw new Error(`Expected an integer in [${min}, ${max}].`);
  return Number(value);
}
/** @param {unknown} value @param {number} limit */
function text(value, limit) {
  if (typeof value !== 'string' || !value.length || value.length > limit) throw new Error('Invalid text field.');
  return value;
}
/** @param {unknown} input @returns {Scenario} */
export function validateScenario(input) {
  const value = record(input, ['schemaVersion', 'id', 'name', 'description', 'grid', 'start', 'slip', 'rewards', 'features', 'observation']);
  if (value.schemaVersion !== 1) throw new Error('Unsupported map schema version.');
  const id = text(value.id, 60);
  if (!/^[a-z0-9-]+$/.test(id)) throw new Error('Invalid scenario identifier.');
  if (!Array.isArray(value.grid) || value.grid.length < 2 || value.grid.length > 40 || !value.grid.every((row) => typeof row === 'string' && /^[.#GHC]+$/.test(row))) throw new Error('Map must contain 2–40 rows of supported tiles.');
  const grid = /** @type {string[]} */ (value.grid).slice();
  const width = grid[0].length;
  if (width < 2 || width > 40 || grid.some((row) => row.length !== width) || !grid.some((row) => row.includes('G'))) throw new Error('Map must be rectangular, 2–40 columns wide, and have a goal.');
  const start = record(value.start, ['x', 'y']);
  const x = integer(start.x, 0, width - 1), y = integer(start.y, 0, grid.length - 1);
  if (grid[y][x] !== '.') throw new Error('Start must be on ordinary floor.');
  if (typeof value.slip !== 'number' || !Number.isFinite(value.slip) || value.slip < 0 || value.slip > 1) throw new Error('Slip must lie between 0 and 1.');
  const rewardKeys = ['step', 'collision', 'goal', 'hazard', 'collectible'];
  const rewards = record(value.rewards, rewardKeys);
  if (rewardKeys.some((key) => typeof rewards[key] !== 'number' || !Number.isFinite(rewards[key]) || Math.abs(Number(rewards[key])) > 1000000)) throw new Error('All rewards must be finite and bounded.');
  const features = record(value.features, ['collectibles', 'battery', 'horizon']);
  if (typeof features.collectibles !== 'boolean') throw new Error('Declare whether collectibles are enabled.');
  const count = grid.join('').split('C').length - 1;
  if (count > 12 || Boolean(count) !== features.collectibles) throw new Error('Collectible configuration must match the map (maximum 12).');
  const battery = features.battery === null ? null : integer(features.battery, 1, 10000);
  const horizon = features.horizon === null ? null : integer(features.horizon, 1, 10000);
  if (value.observation !== 'full' && value.observation !== 'position') throw new Error('Unsupported observation mode.');
  return {
    schemaVersion: 1, id, name: text(value.name, 80), description: text(value.description, 400), grid, start: { x, y }, slip: value.slip,
    rewards: { step: Number(rewards.step), collision: Number(rewards.collision), goal: Number(rewards.goal), hazard: Number(rewards.hazard), collectible: Number(rewards.collectible) },
    features: { collectibles: features.collectibles, battery, horizon }, observation: value.observation,
  };
}
/** @param {Scenario} scenario */
export function stateFields(scenario) {
  return ['x', 'y', ...(scenario.features.collectibles ? ['collected'] : []), ...(scenario.features.battery !== null ? ['battery'] : []), ...(scenario.features.horizon !== null ? ['remaining'] : [])];
}
/** @param {Scenario} scenario @returns {State} */
export function initialState(scenario) {
  return { ...scenario.start, ...(scenario.features.collectibles ? { collected: 0 } : {}), ...(scenario.features.battery !== null ? { battery: scenario.features.battery } : {}), ...(scenario.features.horizon !== null ? { remaining: scenario.features.horizon } : {}) };
}
/** Stable, row-major collectible bit. @param {Scenario} scenario @param {number} x @param {number} y */
export function collectibleBit(scenario, x, y) {
  if (scenario.grid[y]?.[x] !== 'C') return 0;
  const preceding = scenario.grid.slice(0, y).join('') + scenario.grid[y].slice(0, x);
  return 2 ** (preceding.split('C').length - 1);
}
/** @param {Scenario} scenario @param {unknown} input @returns {State} */
export function validateState(scenario, input) {
  const value = record(input, stateFields(scenario));
  const state = { x: integer(value.x, 0, scenario.grid[0].length - 1), y: integer(value.y, 0, scenario.grid.length - 1) };
  if (scenario.grid[state.y][state.x] === '#') throw new Error('State cannot be inside a wall.');
  /** @type {State} */
  const result = state;
  if (scenario.features.collectibles) {
    const count = scenario.grid.join('').split('C').length - 1;
    result.collected = integer(value.collected, 0, 2 ** count - 1);
    const bit = collectibleBit(scenario, state.x, state.y);
    if (bit && !(result.collected & bit)) throw new Error('A collectible under Robo must already be consumed.');
  }
  if (scenario.features.battery !== null) result.battery = integer(value.battery, 0, scenario.features.battery);
  if (scenario.features.horizon !== null) result.remaining = integer(value.remaining, 0, scenario.features.horizon);
  return result;
}
/** @param {State} state */
export function stateKey(state) {
  return `${state.x},${state.y}${state.collected !== undefined ? `|c=${state.collected}` : ''}${state.battery !== undefined ? `|b=${state.battery}` : ''}${state.remaining !== undefined ? `|t=${state.remaining}` : ''}`;
}
/** @param {Scenario} scenario @param {State} state @returns {import('./types.js').Observation} */
export function observe(scenario, state) {
  const partial = scenario.observation === 'position' && stateFields(scenario).length > 2;
  return { ...(scenario.observation === 'position' ? { x: state.x, y: state.y } : structuredClone(state)), partial };
}
/** Canonical field order comes from validateScenario. Non-cryptographic identity, not a grade signature.
 * @param {Scenario} scenario
 */
export function scenarioHash(scenario) {
  let hash = 2166136261;
  for (const char of JSON.stringify(validateScenario(scenario))) hash = Math.imul(hash ^ char.charCodeAt(0), 16777619) >>> 0;
  return `map-v1-${hash.toString(16).padStart(8, '0')}`;
}

