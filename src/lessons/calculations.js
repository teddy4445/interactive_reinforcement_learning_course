import { lessonScenario } from '../content/foundations.js';
import { buildModel, discountedReturn, evaluatePolicy, fixedPolicy, policyIteration, valueIteration } from '../planning/planners.js';
/** @typedef {import('../content/foundations.js').FoundationId} FoundationId */
/** @typedef {{lesson:FoundationId,phase:'math'|'experiment',parameter:number}} Config */
/** @typedef {{scenario:import('../environment/types.js').Scenario,representation:string,engineVersion:number,calculationVersion:string,mode:string,seed:null,discount:number,policy:string,tolerance:number|null,maxEvaluationSweeps:number|null,maxPolicyIterations:number|null}} CalculationContext */
/** @typedef {{config:Config,context:CalculationContext,scenarioHash:string,algorithms:string[],values:number[][],sweeps:number[],residuals:number[],converged:boolean[]}} Calculation */
/** @param {FoundationId} id */
export const baseline = (id) => ({ '01':.5, '02':.2, '03':.9 })[id];
/** @param {Config} config */
export function calculate(config) {
  const { lesson, phase, parameter } = config;
  if (!['01','02','03'].includes(lesson) || !['math','experiment'].includes(phase) || !Number.isFinite(parameter) || parameter < 0 || parameter > (lesson === '01' ? 1 : lesson === '02' ? .8 : .99)) throw new Error('Unsupported calculation configuration.');
  if (phase === 'math' && parameter !== baseline(lesson)) throw new Error('The worked example uses a fixed configuration.');
  if (phase === 'experiment' && Math.abs(parameter-baseline(lesson)) < .05 - 1e-12) throw new Error('Change the parameter by at least 0.05 for this experiment.');
  const scenario = lessonScenario(lesson, lesson === '02' ? parameter : 0);
  const model = buildModel(scenario);
  /** @type {import('../planning/planners.js').PlanResult[]} */
  const runs = lesson === '01' ? [] : lesson === '02' ? [evaluatePolicy(model, fixedPolicy(model, 'right'), .9)] : phase === 'math' ? [valueIteration(model, parameter)] : [policyIteration(model, parameter), valueIteration(model, parameter)];
  /** @type {Calculation} */
  const summary = {
    config: { ...config }, scenarioHash: model.scenarioHash,
    context: {scenario,representation:'full-position',engineVersion:1,calculationVersion:'foundations-v1',mode:lesson === '01' ? 'finite-reward-sequence' : 'exact-model-planning',seed:null,discount:lesson === '02' ? .9 : parameter,policy:lesson === '01' ? 'not-applicable' : lesson === '02' ? 'fixed-right' : 'greedy; initial-left-for-policy-iteration',tolerance:lesson === '01' ? null : 1e-8,maxEvaluationSweeps:lesson === '01' ? null : lesson === '03' && phase === 'experiment' ? 2000 : 500,maxPolicyIterations:lesson === '03' && phase === 'experiment' ? 50 : null},
    algorithms: runs.length ? runs.map((r) => r.algorithm) : ['discounted-return'],
    values: runs.length ? runs.map((r) => r.values) : [[discountedReturn([5], parameter), discountedReturn([0,0,0,20], parameter)]],
    sweeps: runs.map((r) => r.sweeps), residuals: runs.map((r) => r.residual), converged: runs.map((r) => r.converged)
  };
  return { model, runs, summary };
}

