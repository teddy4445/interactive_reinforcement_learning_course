import { IslandEnvironment } from '../environment/engine.js';
import { ACTIONS, stateKey } from '../environment/schema.js';
/** @typedef {import('../environment/types.js').State} State */
/** @typedef {{key:string,state:State,terminal:boolean,actions:import('../environment/types.js').Outcome[][]}} ModelState */
/** @typedef {{states:ModelState[],index:Map<string,number>,scenarioHash:string,finite:boolean}} TabularModel */
/** @typedef {number[][]} Policy */
/** @typedef {{phase:string,iteration:number,round?:number,values:number[],policy:Policy,residual:number,changes:number}} Frame */
/** @typedef {{algorithm:string,values:number[],policy:Policy,sweeps:number,residual:number,converged:boolean,frames:Frame[]}} PlanResult */

/** Enumerate only reachable states through the shared model, never a second simulator.
 * @param {import('../environment/types.js').Scenario} scenario @returns {TabularModel}
 */
export function buildModel(scenario) {
  const env = new IslandEnvironment(scenario), model = env.getModel();
  /** @type {State[]} */ const queue = [env.getState()];
  const index = new Map([[stateKey(queue[0]), 0]]);
  /** @type {ModelState[]} */ const states = [];
  for (let cursor = 0; cursor < queue.length; cursor++) {
    const state = queue[cursor], actions = ACTIONS.map((action) => model.transitions(state, action));
    const terminal = actions[0][0].terminated && stateKey(actions[0][0].nextState) === stateKey(state) && actions[0][0].reward === 0;
    states.push({ key: stateKey(state), state, terminal, actions });
    if (!terminal) for (const outcomes of actions) for (const outcome of outcomes) {
      const key = stateKey(outcome.nextState);
      if (!index.has(key)) {
        if (queue.length >= 512) throw new Error('Planning is limited to 512 reachable states.');
        index.set(key, queue.length); queue.push(outcome.nextState);
      }
    }
  }
  return { states, index, scenarioHash: model.scenarioHash, finite: scenario.features.horizon !== null || scenario.features.battery !== null };
}
/** @param {TabularModel} model @param {'right'|'left'|'uniform'} kind @returns {Policy} */
export function fixedPolicy(model, kind = 'right') {
  if (!['right', 'left', 'uniform'].includes(kind)) throw new Error('Unsupported fixed policy.');
  return model.states.map(() => kind === 'uniform' ? [.25, .25, .25, .25] : ACTIONS.map((action) => Number(action === kind)));
}
/** @param {TabularModel} model @param {Policy} policy */
function validatePolicy(model, policy) {
  if (policy.length !== model.states.length || policy.some((row) => row.length !== 4 || row.some((p) => !Number.isFinite(p) || p < 0) || Math.abs(row.reduce((a,b) => a+b, 0) - 1) > 1e-12)) throw new Error('Policy probabilities must be normalized for every state.');
}
/** Finite Markov-chain absorption: every state has a positive-probability path to termination.
 * @param {TabularModel} model @param {Policy} policy
 */
function properPolicy(model, policy) {
  const reaches = new Set(model.states.flatMap((s,i) => s.terminal ? [i] : []));
  let changed = true;
  while (changed) {
    changed = false;
    model.states.forEach((s,i) => {
      if (!reaches.has(i) && s.actions.some((outcomes,a) => policy[i][a] > 0 && outcomes.some((o) => o.probability > 0 && reaches.has(/** @type {number} */ (model.index.get(stateKey(o.nextState))))))) { reaches.add(i); changed = true; }
    });
  }
  return reaches.size === model.states.length;
}
/** @param {TabularModel} model @param {number} gamma @param {Policy} [policy] */
function validateDiscount(model, gamma, policy) {
  if (!Number.isFinite(gamma) || gamma < 0 || gamma > 1) throw new Error('Discount must be between 0 and 1.');
  if (gamma === 1 && !model.finite && (!policy || !properPolicy(model, policy))) throw new Error('Gamma 1 requires a finite task horizon/battery, or a verified absorbing fixed policy.');
}
/** A transparent numerical backup, including true-terminal masking.
 * @param {TabularModel} model @param {number[]} values @param {number} index @param {number} action @param {number} gamma
 */
export function actionBackup(model, values, index, action, gamma) {
  const terms = model.states[index].actions[action].map((outcome) => {
    const nextIndex = model.index.get(stateKey(outcome.nextState));
    if (nextIndex === undefined) throw new Error('Model state missing.');
    const continuation = outcome.terminated ? 0 : gamma * values[nextIndex];
    return { probability: outcome.probability, reward: outcome.reward, next: stateKey(outcome.nextState), terminal: outcome.terminated, continuation, contribution: outcome.probability * (outcome.reward + continuation) };
  });
  return { value: terms.reduce((sum, term) => sum + term.contribution, 0), terms };
}
/** @param {TabularModel} model @param {number[]} values @param {number} gamma @param {Policy|null} policy */
export function sweep(model, values, gamma, policy) {
  if (values.length !== model.states.length || values.some((v) => !Number.isFinite(v))) throw new Error('Invalid value vector.');
  return model.states.map((state,i) => {
    if (state.terminal) return 0;
    const qs = ACTIONS.map((_,a) => actionBackup(model, values, i, a, gamma).value);
    return policy ? qs.reduce((sum,q,a) => sum + policy[i][a] * q, 0) : Math.max(...qs);
  });
}
/** @param {TabularModel} model @param {number[]} values @param {number} gamma @param {Policy|null} policy */
export function bellmanResidual(model, values, gamma, policy) {
  return Math.max(...sweep(model, values, gamma, policy).map((v,i) => Math.abs(v-values[i])));
}
/** Exact ties use stable up/right/down/left order. @param {TabularModel} model @param {number[]} values @param {number} gamma @returns {Policy} */
export function improvePolicy(model, values, gamma) {
  return model.states.map((state,i) => {
    const qs = ACTIONS.map((_,a) => state.terminal ? 0 : actionBackup(model, values, i, a, gamma).value);
    const best = qs.indexOf(Math.max(...qs));
    return ACTIONS.map((_,a) => Number(a === best));
  });
}
/** @param {TabularModel} model @param {Policy} policy @param {number} gamma @param {{tolerance?:number,maxSweeps?:number,initial?:number[]}} [options] @returns {PlanResult} */
export function evaluatePolicy(model, policy, gamma, { tolerance = 1e-8, maxSweeps = 500, initial } = {}) {
  validatePolicy(model, policy); validateDiscount(model, gamma, policy);
  return iterate(model, gamma, policy, tolerance, maxSweeps, initial);
}
/** @param {TabularModel} model @param {number} gamma @param {Policy|null} policy @param {number} tolerance @param {number} maxSweeps @param {number[]} [initial] @returns {PlanResult} */
function iterate(model, gamma, policy, tolerance, maxSweeps, initial) {
  if (!(tolerance > 0) || !Number.isFinite(tolerance) || !Number.isInteger(maxSweeps) || maxSweeps < 1 || maxSweeps > 2000) throw new Error('Invalid planning budget.');
  let values = initial ? [...initial] : model.states.map(() => 0), residual = Infinity;
  /** @type {Frame[]} */ const frames = [];
  for (let iteration = 1; iteration <= maxSweeps; iteration++) {
    values = sweep(model, values, gamma, policy);
    residual = bellmanResidual(model, values, gamma, policy);
    frames.push({ phase: policy ? 'Policy evaluation' : 'Optimality sweep', iteration, values: [...values], policy: structuredClone(policy ?? improvePolicy(model, values, gamma)), residual, changes: 0 });
    if (residual <= tolerance) break;
  }
  return { algorithm: policy ? 'evaluation' : 'value-iteration', values, policy: structuredClone(policy ?? improvePolicy(model, values, gamma)), sweeps: frames.length, residual, converged: residual <= tolerance, frames };
}
/** @param {TabularModel} model @param {number} gamma @param {{tolerance?:number,maxSweeps?:number}} [options] */
export function valueIteration(model, gamma, { tolerance = 1e-8, maxSweeps = 500 } = {}) {
  validateDiscount(model, gamma);
  return iterate(model, gamma, null, tolerance, maxSweeps);
}
/** Policy stability AND optimality residual are required; evaluation is reported separately.
 * @param {TabularModel} model @param {number} gamma @param {{tolerance?:number,maxIterations?:number,initialPolicy?:Policy}} [options] @returns {PlanResult}
 */
export function policyIteration(model, gamma, { tolerance = 1e-8, maxIterations = 50, initialPolicy = fixedPolicy(model, 'left') } = {}) {
  validateDiscount(model, gamma); validatePolicy(model, initialPolicy);
  if (!Number.isInteger(maxIterations) || maxIterations < 1 || maxIterations > 100) throw new Error('Invalid policy iteration budget.');
  let policy = structuredClone(initialPolicy), values = model.states.map(() => 0), sweeps = 0, residual = Infinity, converged = false;
  /** @type {Frame[]} */ const frames = [];
  for (let iteration = 1; iteration <= maxIterations; iteration++) {
    const evaluation = evaluatePolicy(model, policy, gamma, { tolerance, maxSweeps: 2000, initial: values });
    values = evaluation.values; sweeps += evaluation.sweeps;
    for (const frame of evaluation.frames) frames.push({ ...frame, round: iteration });
    if (!evaluation.converged) { residual=bellmanResidual(model,values,gamma,null); break; }
    const improved = improvePolicy(model, values, gamma);
    const changes = improved.filter((row,i) => !model.states[i].terminal && row.some((p,a) => p !== policy[i][a])).length;
    policy = improved;
    residual = bellmanResidual(model, values, gamma, null);
    frames.push({ phase: 'Policy improvement', iteration, round: iteration, values: [...values], policy: structuredClone(policy), residual, changes });
    if (changes === 0 && evaluation.converged && residual <= tolerance) { converged = true; break; }
  }
  return { algorithm: 'policy-iteration', values, policy, sweeps, residual, converged, frames };
}
/** @param {number[]} rewards @param {number} gamma */
export function discountedReturn(rewards, gamma) {
  if (!Number.isFinite(gamma) || gamma < 0 || gamma > 1 || rewards.some((r) => !Number.isFinite(r))) throw new Error('Invalid return inputs.');
  return rewards.reduceRight((value,reward) => reward + gamma * value, 0);
}


