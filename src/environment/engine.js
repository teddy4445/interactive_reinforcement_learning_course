import { ACTIONS, MAX_CHECKPOINT_BYTES, initialState, integer, observe, record, scenarioHash, stateFields, stateKey, validateScenario, validateState } from './schema.js';
import { createRng, deriveSeed, validateSeed } from './rng.js';
import { terminalReason, transitions } from './model.js';
/** @typedef {import('./types.js').Scenario} Scenario */
/** @typedef {import('./types.js').State} State */
/** @typedef {import('./types.js').StepTrace} StepTrace */

/** One environment implementation for manual play and all future consumers. */
export class IslandEnvironment {
  /** @type {Scenario} */ #scenario;
  /** @type {State} */ #state;
  #seed;
  #rng;
  #hash;
  #limit;
  #steps = 0;
  #totalReward = 0;

  /** @param {unknown} scenario @param {{seed?:number,rolloutLimit?:number}} [options] */
  constructor(scenario, { seed = 1, rolloutLimit = 80 } = {}) {
    this.#scenario = validateScenario(scenario);
    this.#hash = scenarioHash(this.#scenario);
    this.#seed = validateSeed(seed);
    this.#limit = integer(rolloutLimit, 1, 1000000);
    this.#rng = createRng(deriveSeed(this.#seed, 'environment'));
    this.#state = initialState(this.#scenario);
  }
  getState() { return structuredClone(this.#state); }
  getObservation() { return observe(this.#scenario, this.#state); }
  getScenario() { return structuredClone(this.#scenario); }
  getInfo() {
    const reason = terminalReason(this.#scenario, this.#state);
    const terminated = reason !== null;
    const truncated = !terminated && this.#steps >= this.#limit;
    return { scenarioId: this.#scenario.id, scenarioHash: this.#hash, seed: this.#seed, steps: this.#steps, totalReward: this.#totalReward, rolloutLimit: this.#limit, terminated, truncated, reason: truncated ? 'rollout-limit' : reason };
  }
  getSnapshot() { return { state: this.getState(), observation: this.getObservation(), info: this.getInfo() }; }

  /** Reset this episode and its environment RNG; no agent/parameter store is owned here.
   * @param {{seed?:number,rolloutLimit?:number}} [options]
   */
  reset({ seed = this.#seed, rolloutLimit = this.#limit } = {}) {
    const nextSeed = validateSeed(seed), nextLimit = integer(rolloutLimit, 1, 1000000);
    this.#seed = nextSeed;
    this.#limit = nextLimit;
    this.#state = initialState(this.#scenario);
    this.#rng = createRng(deriveSeed(this.#seed, 'environment'));
    this.#steps = 0;
    this.#totalReward = 0;
    return this.getSnapshot();
  }

  /** Explicit model access for teaching/planning; future model-free agents get observations only. */
  getModel() {
    return Object.freeze({
      schemaVersion: 1,
      scenarioHash: this.#hash,
      actions: [...ACTIONS],
      stateFields: stateFields(this.#scenario),
      /** @param {State} state @param {import('./types.js').Action} action */
      transitions: (state, action) => transitions(this.#scenario, state, action),
    });
  }

  /** Exactly one RNG draw per accepted transition, including deterministic movement.
   * A stopped episode is a no-op with zero reward and no RNG/counter change.
   * @param {import('./types.js').Action} action
   */
  step(action) {
    if (!ACTIONS.includes(action)) throw new Error('Unknown action.');
    const before = this.getSnapshot();
    if (before.info.terminated || before.info.truncated) return { ...before, reward: 0, terminated: before.info.terminated, truncated: before.info.truncated, advanced: false, trace: /** @type {StepTrace|null} */ (null) };
    const outcomes = transitions(this.#scenario, before.state, action);
    const draw = this.#rng.next();
    let boundary = 0;
    let outcome = outcomes[outcomes.length - 1];
    let relativeDraw = 0;
    for (const candidate of outcomes) {
      if (draw < boundary + candidate.probability) {
        outcome = candidate;
        relativeDraw = draw - boundary;
        break;
      }
      boundary += candidate.probability;
    }
    let movement = outcome.movements[outcome.movements.length - 1];
    let movementBoundary = 0;
    for (const candidate of outcome.movements) {
      movementBoundary += candidate.probability;
      if (relativeDraw < movementBoundary) { movement = candidate; break; }
    }
    this.#state = structuredClone(outcome.nextState);
    this.#steps += 1;
    this.#totalReward += outcome.reward;
    const after = this.getSnapshot();
    /** @type {StepTrace} */
    const trace = {
      schemaVersion: 1, step: this.#steps, state: before.state, observation: before.observation,
      action, movement: movement.action, collision: movement.collision, reward: outcome.reward,
      rewardParts: structuredClone(outcome.rewardParts), nextState: after.state, nextObservation: after.observation,
      terminated: after.info.terminated, truncated: after.info.truncated,
      reason: after.info.truncated ? 'rollout-limit' : outcome.reason,
      draw, probability: outcome.probability, outcomes, scenarioHash: this.#hash,
    };
    return { ...after, reward: outcome.reward, terminated: after.info.terminated, truncated: after.info.truncated, advanced: true, trace };
  }

  serialize() {
    return JSON.stringify({
      format: 'rl-island-environment', schemaVersion: 1, engineVersion: 1,
      scenario: this.getScenario(), scenarioHash: this.#hash, stateSchema: stateFields(this.#scenario), actionOrder: [...ACTIONS],
      state: this.getState(), seed: this.#seed, rng: this.#rng.snapshot(),
      steps: this.#steps, totalReward: this.#totalReward, rolloutLimit: this.#limit,
      terminated: this.getInfo().terminated, truncated: this.getInfo().truncated,
    });
  }

  /** A bounded, validated environment checkpoint. Does not load code or learning parameters.
   * @param {string} serialized
   */
  static deserialize(serialized) {
    if (typeof serialized !== 'string' || serialized.length > MAX_CHECKPOINT_BYTES || new TextEncoder().encode(serialized).byteLength > MAX_CHECKPOINT_BYTES) throw new Error('Environment checkpoint exceeds 64 KiB.');
    const value = record(JSON.parse(serialized), ['format', 'schemaVersion', 'engineVersion', 'scenario', 'scenarioHash', 'stateSchema', 'actionOrder', 'state', 'seed', 'rng', 'steps', 'totalReward', 'rolloutLimit', 'terminated', 'truncated']);
    if (value.format !== 'rl-island-environment' || value.schemaVersion !== 1 || value.engineVersion !== 1) throw new Error('Unsupported environment checkpoint.');
    const environment = new IslandEnvironment(value.scenario, { seed: validateSeed(value.seed), rolloutLimit: integer(value.rolloutLimit, 1, 1000000) });
    if (value.scenarioHash !== environment.#hash || JSON.stringify(value.stateSchema) !== JSON.stringify(stateFields(environment.#scenario)) || JSON.stringify(value.actionOrder) !== JSON.stringify(ACTIONS)) throw new Error('Checkpoint map or state/action schema does not match.');
    const state = validateState(environment.#scenario, value.state);
    const steps = integer(value.steps, 0, environment.#limit);
    if (typeof value.totalReward !== 'number' || !Number.isFinite(value.totalReward) || Math.abs(value.totalReward) > steps * 5000000) throw new Error('Invalid accumulated reward.');
    if (state.battery !== undefined && state.battery !== Math.max(0, Number(environment.#scenario.features.battery) - steps)) throw new Error('Battery does not match the episode step count.');
    if (state.remaining !== undefined && state.remaining !== Math.max(0, Number(environment.#scenario.features.horizon) - steps)) throw new Error('Task time does not match the episode step count.');
    if ((environment.#scenario.features.battery !== null && steps > environment.#scenario.features.battery) || (environment.#scenario.features.horizon !== null && steps > environment.#scenario.features.horizon)) throw new Error('Checkpoint advanced beyond task termination.');
    const rng = record(value.rng, ['algorithm', 'state']);
    if (rng.algorithm !== 'xorshift32-v1') throw new Error('Unsupported RNG version.');
    environment.#rng.restore({ algorithm: 'xorshift32-v1', state: validateSeed(rng.state) });
    environment.#state = state;
    environment.#steps = steps;
    environment.#totalReward = value.totalReward;
    const info = environment.getInfo();
    if (value.terminated !== info.terminated || value.truncated !== info.truncated) throw new Error('Checkpoint termination flags are inconsistent.');
    if (steps === 0 && (stateKey(state) !== stateKey(initialState(environment.#scenario)) || environment.#rng.snapshot().state !== deriveSeed(environment.#seed, 'environment'))) throw new Error('Invalid initial checkpoint.');
    return environment;
  }
}

