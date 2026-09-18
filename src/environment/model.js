import { ACTIONS, collectibleBit, stateKey, validateState } from './schema.js';
/** @typedef {import('./types.js').Scenario} Scenario */
/** @typedef {import('./types.js').State} State */
/** @typedef {import('./types.js').Outcome} Outcome */
/** @typedef {import('./types.js').RewardParts} RewardParts */

/** @param {Scenario} scenario @param {State} state @returns {import('./types.js').TerminalReason} */
export function terminalReason(scenario, state) {
  if (scenario.grid[state.y][state.x] === 'G') return 'goal';
  if (state.battery === 0) return 'battery';
  if (state.remaining === 0) return 'horizon';
  return null;
}
/** @returns {RewardParts} */
const zeroRewards = () => ({ step: 0, collision: 0, goal: 0, hazard: 0, collectible: 0 });

/** The sole transition/reward definition. Pure: no random draws, counters, or rendering.
 * Outcomes merge equal next states AND reward components; directions remain inspectable.
 * External rollout caps never enter this MDP model.
 * @param {Scenario} scenario @param {State} input @param {import('./types.js').Action} action @returns {Outcome[]}
 */
export function transitions(scenario, input, action) {
  const state = validateState(scenario, input);
  const index = ACTIONS.indexOf(action);
  if (index < 0) throw new Error('Unknown action.');
  const stopped = terminalReason(scenario, state);
  if (stopped) return [{ probability: 1, nextState: state, reward: 0, rewardParts: zeroRewards(), terminated: true, reason: stopped, movements: [{ action, probability: 1, collision: false }] }];
  /** @type {Map<string, Outcome>} */
  const merged = new Map();
  const branches = [{ index, probability: 1 - scenario.slip }, { index: (index + 1) % 4, probability: scenario.slip / 2 }, { index: (index + 3) % 4, probability: scenario.slip / 2 }];
  const offsets = [[0, -1], [1, 0], [0, 1], [-1, 0]];
  for (const branch of branches) {
    if (branch.probability === 0) continue;
    const [dx, dy] = offsets[branch.index];
    const x = state.x + dx, y = state.y + dy;
    const collision = !scenario.grid[y]?.[x] || scenario.grid[y][x] === '#';
    const nextState = { ...state, x: collision ? state.x : x, y: collision ? state.y : y };
    if (nextState.battery !== undefined) nextState.battery -= 1;
    if (nextState.remaining !== undefined) nextState.remaining -= 1;
    const tile = scenario.grid[nextState.y][nextState.x];
    const bit = collectibleBit(scenario, nextState.x, nextState.y);
    const collect = bit !== 0 && nextState.collected !== undefined && !(nextState.collected & bit);
    if (collect) nextState.collected = (nextState.collected ?? 0) | bit;
    const rewardParts = {
      step: scenario.rewards.step,
      collision: collision ? scenario.rewards.collision : 0,
      goal: tile === 'G' ? scenario.rewards.goal : 0,
      hazard: tile === 'H' ? scenario.rewards.hazard : 0,
      collectible: collect ? scenario.rewards.collectible : 0,
    };
    const reason = terminalReason(scenario, nextState);
    const key = stateKey(nextState) + JSON.stringify(rewardParts);
    const movement = { action: ACTIONS[branch.index], probability: branch.probability, collision };
    const existing = merged.get(key);
    if (existing) {
      existing.probability += branch.probability;
      existing.movements.push(movement);
    } else {
      merged.set(key, { probability: branch.probability, nextState, reward: Object.values(rewardParts).reduce((sum, value) => sum + value, 0), rewardParts, terminated: reason !== null, reason, movements: [movement] });
    }
  }
  return [...merged.values()];
}

