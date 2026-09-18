import { IslandEnvironment } from '../environment/engine.js';
import { scenarios } from '../content/scenarios.js';

/** A parameter container with no learning algorithm. Nonempty values are only test fixtures
 * until later tasks provide an agent. It is deliberately separate from the environment.
 */
export class ParameterStore {
  /** @type {Map<string, number[]>} */ #values = new Map();
  /** @param {string} key @param {number[]} values */
  set(key, values) {
    if (!values.every(Number.isFinite)) throw new Error('Parameters must be finite.');
    this.#values.set(key, [...values]);
  }
  snapshot() { return Object.fromEntries([...this.#values].map(([key, values]) => [key, [...values]])); }
  clear() { this.#values.clear(); }
  get size() { return this.#values.size; }
}

/** The live session owns one environment. UI, Canvas, and inspector read its snapshots. */
export class ManualSession {
  environment;
  parameters;
  /** @type {import('../environment/types.js').Action} */ action = 'right';
  /** @type {import('../environment/types.js').StepTrace[]} */ history = [];
  /** @type {import('../environment/types.js').StepTrace|null} */ lastTrace = null;
  /** @param {IslandEnvironment} [environment] @param {ParameterStore} [parameters] */
  constructor(environment = new IslandEnvironment(scenarios[0], { seed: 7, rolloutLimit: 80 }), parameters = new ParameterStore()) {
    this.environment = environment;
    this.parameters = parameters;
  }
  step() {
    const result = this.environment.step(this.action);
    if (result.trace) {
      this.lastTrace = structuredClone(result.trace);
      this.history.push(structuredClone(result.trace));
      if (this.history.length > 100) this.history.shift();
    }
    return result;
  }
  /** @param {{seed?:number,rolloutLimit?:number}} [options] */
  resetEpisode(options) {
    this.environment.reset(options);
    this.history = [];
    this.lastTrace = null;
  }
  resetLearning() { this.parameters.clear(); }
  /** @param {import('../environment/types.js').Scenario} scenario @param {number} seed */
  changeScenario(scenario, seed) {
    // Validate before replacing; a rejected edit preserves the active environment.
    const replacement = new IslandEnvironment(scenario, { seed, rolloutLimit: this.environment.getInfo().rolloutLimit });
    this.environment = replacement;
    this.history = [];
    this.lastTrace = null;
  }
  /** @param {string} checkpoint */
  load(checkpoint) {
    const replacement = IslandEnvironment.deserialize(checkpoint);
    this.environment = replacement;
    this.history = [];
    this.lastTrace = null;
  }
}

