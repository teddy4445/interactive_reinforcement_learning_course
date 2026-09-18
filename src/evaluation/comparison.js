import { buildModel,evaluatePolicy,fixedPolicy } from '../planning/planners.js';
import { deriveSeed } from '../environment/rng.js';
import { evaluationSeeds } from './frozen.js';
import {capabilities} from '../agents/tabular.js';
import {linearEstimate} from '../agents/features.js';
/** @typedef {import('../training/config.js').Config} Config */
/** @typedef {{interactions:number,updates:number,planningUpdates:number,evaluation:ReturnType<import('./frozen.js').FrozenEvaluation['result']>,rmse:number|null}} CurvePoint */
/** @typedef {{algorithm:import('../training/config.js').Algorithm,seed:number,config:Config,parameters:import('../agents/tabular.js').Parameters,training:import('../training/run.js').EpisodeRow[],interactions:number,updates:number,evaluation:ReturnType<import('./frozen.js').FrozenEvaluation['result']>,rmse:number|null,timing:{trainingComputeMs:number,evaluationComputeMs:number},variant?:string,planningUpdates?:number,partial?:{length:number,return:number,terminated:boolean,truncated:boolean},curve?:CurvePoint[]}} Replicate */
/** @typedef {{id:string,config:Config,prediction:{answer:string,at:string},episodes:number,seeds:number[],evaluationSeeds:number[],runs:Replicate[],status:'pending'|'complete'|'cancelled',createdAt:string,finishedAt:string|null,smoothing:{type:string,window:number,definition:string},realBudget?:number,failures?:{reason:string,checkpoint:import('../training/run.js').RunCheckpoint}[]}} Comparison */
/** @param {Config} c */
export const isAdvanced=c=>['06','07','09','10'].includes(c.lesson);
/** All variants explicitly declare their complete immutable configurations. @param {Config} c @returns {{id:string,label:string,config:Config}[]} */
export function comparisonVariants(c){
 if(c.lesson==='09')return [{id:'tabular',label:'Full-state tabular Q',config:{...c,algorithm:'q'}},{id:'dqn',label:'Neural DQN',config:{...c,algorithm:'dqn'}}];
 if(c.lesson==='10'){const deep=/** @type {import('../agents/deep/schema.js').DeepConfig} */(c.deep);return [{id:'reference',label:'Replay + target',config:{...c,deep:{...deep,replay:true,target:true}}},{id:'chronological',label:'Chronological batch + target',config:{...c,deep:{...deep,replay:false,target:true}}},{id:'online-target',label:'Replay + online bootstrap',config:{...c,deep:{...deep,replay:true,target:false}}}];}
 if(c.lesson==='06'){const prediction=capabilities[c.algorithm].prediction,algorithm=prediction?'linear-td':'linear-sarsa';return [{id:'informative',label:'Informative linear '+(prediction?'TD':'SARSA'),config:{...c,algorithm,representation:'informative'}},{id:'aliased',label:'Aliased linear '+(prediction?'TD':'SARSA'),config:{...c,algorithm,representation:'aliased'}},{id:'tabular',label:'Full-state tabular '+(prediction?'TD':'SARSA'),config:{...c,algorithm:prediction?'td':'sarsa',representation:'informative'}}];}
 if(c.lesson==='08')return ['reinforce','reinforce-baseline','actor-critic'].map(key=>{const algorithm=/** @type {import('../training/config.js').Algorithm} */(key);return {id:key,label:capabilities[algorithm].name,config:{...c,algorithm}};});
 if(c.lesson==='07')return [{id:'no-planning',label:'Q-learning · 0 planning',config:{...c,algorithm:'q',planningSteps:0}},{id:'planning',label:'Dyna-Q · '+c.planningSteps+' planning / real step',config:{...c,algorithm:'dyna'}}];
 return (c.lesson==='04'?['mc','td']:['sarsa','q']).map(key=>{const algorithm=/** @type {import('../training/config.js').Algorithm} */(key);return {id:key,label:capabilities[algorithm].name,config:{...c,algorithm}};});
}
/** @param {Comparison} c */
export const expectedReplicates=c=>comparisonVariants(c.config).length*5;
/** Known-model reference only; sampled learners never receive it. @param {Config} config @param {import('../agents/tabular.js').Parameters} parameters */
export function referenceError(config,parameters){const model=buildModel(config.scenario),result=evaluatePolicy(model,fixedPolicy(model,config.policy),config.gamma,{maxSweeps:2000});if(!result.converged)throw Error('Exact reference did not converge; prediction error unavailable.');const nonterminal=model.states.flatMap((s,i)=>s.terminal?[]:[Math.pow((config.algorithm==='linear-td'?linearEstimate(config,parameters,s.key):parameters.v[s.key]??0)-result.values[i],2)]);return Math.sqrt(nonterminal.reduce((a,b)=>a+b,0)/nonterminal.length);}
/** @param {Config} config @param {number} budget @param {string} prediction @returns {Comparison} */
export function newComparison(config,budget,prediction){const advanced=isAdvanced(config);if(!Number.isInteger(budget)||budget<(advanced?60:20)||budget>(advanced?1500:300)||!prediction.trim()||prediction.length>300)throw Error(advanced?'Comparison needs a prediction and 60–1,500 real interactions per agent.':'Comparison needs a prediction and 20–300 episodes per agent.');return {id:crypto.randomUUID(),config:structuredClone(config),prediction:{answer:prediction.trim(),at:new Date().toISOString()},episodes:advanced?0:budget,...(['09','10'].includes(config.lesson)?{failures:[]}:{}),...(advanced?{realBudget:budget}:{}),seeds:Array.from({length:5},(_,i)=>deriveSeed(config.seed,'independent-training/'+i)),evaluationSeeds:evaluationSeeds(config.seed),runs:[],status:'pending',createdAt:new Date().toISOString(),finishedAt:null,smoothing:{type:'trailing arithmetic mean',window:7,definition:'Episode plot: current and up to six preceding completed/capped returns; raw data retained. Equal-interaction comparison checkpoints and evaluation are unsmoothed.'}};}
/** @param {Comparison} c */
export function comparisonBudgets(c){return c.realBudget?[Math.floor(c.realBudget/3),Math.floor(c.realBudget*2/3),c.realBudget]:[];}
/** @param {import('../training/coordinator.js').TrainingCoordinator} coordinator @param {Comparison} comparison @param {()=>boolean} cancelled @param {()=>void} changed */
export async function runComparison(coordinator,comparison,cancelled,changed){try{
 for(const seed of comparison.seeds)for(const variant of comparisonVariants(comparison.config)){
  if(cancelled())throw Error('Comparison cancelled.');const config={...variant.config,seed};await coordinator.initialize(config);
  /** @type {CurvePoint[]} */const curve=[];let previous=0,trainingMs=0,evaluationMs=0,workerMs=0;
  /** @type {import('../training/worker-host.js').Response|undefined} */let trained,evaluated;
  for(const budget of comparison.realBudget?comparisonBudgets(comparison):[comparison.episodes]){
   trained=await coordinator.command(comparison.realBudget?'trainInteractions':'train',comparison.realBudget?{interactions:budget-previous}:{episodes:budget});if(trained.event==='cancelled'||cancelled()||!trained.snapshot)throw Error('Comparison cancelled.');trainingMs+=(trained.computeMs??0)-workerMs;
   evaluated=await coordinator.command('evaluate',{seeds:comparison.evaluationSeeds});if(!evaluated.evaluation?.complete||cancelled())throw Error('Comparison cancelled.');evaluationMs+=(evaluated.computeMs??0)-(trained.computeMs??0);workerMs=evaluated.computeMs??0;previous=budget;
   const c=trained.snapshot.checkpoint;if(comparison.realBudget){if(c.interactions!==budget)throw Error('Unequal real-interaction budget.');curve.push({interactions:c.interactions,updates:c.parameters.updates,planningUpdates:c.parameters.planningUpdates??0,evaluation:evaluated.evaluation,rmse:capabilities[config.algorithm].prediction?referenceError(config,c.parameters):null});}
  }
  if(!trained?.snapshot||!evaluated?.evaluation)throw Error('Missing comparison output.');const c=trained.snapshot.checkpoint,info=trained.snapshot.info;
  comparison.runs.push({algorithm:config.algorithm,seed,config,parameters:c.parameters,training:c.rows,interactions:c.interactions,updates:c.parameters.updates,evaluation:evaluated.evaluation,timing:{trainingComputeMs:trainingMs,evaluationComputeMs:evaluationMs},rmse:capabilities[config.algorithm].prediction?referenceError(config,c.parameters):null,...(comparison.realBudget?{variant:variant.id,planningUpdates:c.parameters.planningUpdates??0,partial:{length:info.terminated||info.truncated?0:info.steps,return:info.terminated||info.truncated?0:info.totalReward,terminated:info.terminated,truncated:info.truncated},curve}: {})});changed();
 }
 comparison.status='complete';comparison.finishedAt=new Date().toISOString();changed();
 }catch(error){if(comparison.failures&&error&&typeof error==='object'&&'checkpoint' in error&&error.checkpoint){comparison.failures.push({reason:error instanceof Error?error.message:'Run failed.',checkpoint:/** @type {import('../training/run.js').RunCheckpoint} */(error.checkpoint)});}comparison.status='cancelled';changed();throw error;}}
/** Independent-agent summaries. No episodes-as-independent-agents interval.
 * @param {Comparison} c @param {number} [atBudget]
 */
export function comparisonSummary(c,atBudget){return comparisonVariants(c.config).flatMap(variant=>{const runs=c.runs.filter(r=>(r.variant??r.algorithm)===variant.id),scores=runs.map(r=>{const point=atBudget?r.curve?.find(p=>p.interactions===atBudget):r;if(!point)throw Error('Missing equal-budget checkpoint.');return capabilities[c.config.algorithm].prediction?/** @type {number} */(point.rmse):point.evaluation.rows.reduce((s,e)=>s+(c.config.lesson==='08'?e.discountedReturn:e.return),0)/point.evaluation.rows.length;});return scores.length?[{algorithm:variant.id,label:variant.label,n:runs.length,mean:scores.reduce((a,b)=>a+b,0)/scores.length,min:Math.min(...scores),max:Math.max(...scores),scores}]:[];});}
/** @param {Comparison} c */
export function observedWinner(c){const summary=comparisonSummary(c);if(c.status!=='complete'||summary.length!==comparisonVariants(c.config).length)return 'unavailable';const best=(capabilities[c.config.algorithm].prediction?Math.min:Math.max)(...summary.map(s=>s.mean)),winners=summary.filter(s=>Math.abs(s.mean-best)<1e-9);return winners.length>1?'tie':winners[0].algorithm;}
