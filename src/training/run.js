import {expectedUpdates} from '../agents/deep/schema.js';
import {validateDeepUpdate} from '../agents/deep/validation.js';
import {isPolicy} from '../agents/policy.js';
import { createLearner } from '../agents/registry.js';
import { dot } from '../agents/features.js';
import { IslandEnvironment } from '../environment/engine.js';
import { ACTIONS,integer,record,stateKey } from '../environment/schema.js';
import { createRng, deriveSeed } from '../environment/rng.js';
import { chooseAction } from '../agents/tabular.js';
import { experimentIdentity, validateConfig } from './config.js';
import { exactRecord,number,validateParameters,validateDecision,validateTrainingRows,stateKeyCheck,validatePolicySample,validatePolicyUpdate } from './validation.js';
/** @typedef {{episode:number,seed:number,agentSeed:number,return:number,discountedReturn:number,length:number,success:boolean,terminated:boolean,truncated:boolean,interrupted:boolean,hazards:number,updates:number}} EpisodeRow */
/** @typedef {{decision:import('../agents/tabular.js').Decision,transition:import('../environment/types.js').StepTrace,updates:import('../agents/tabular.js').Update[],nextDecision:import('../agents/tabular.js').Decision|null}} LearningTrace */
/** @typedef {{schemaVersion:1,config:import('./config.js').Config,environment:string,agentRng:import('../environment/types.js').RngSnapshot,parameters:import('../agents/tabular.js').Parameters,episode:number,samples:import('../agents/tabular.js').Sample[],pending:import('../agents/tabular.js').Decision|null,rows:EpisodeRow[],interactions:number,discounted:number,hazards:number,updatesAtStart:number,last:LearningTrace|null}} RunCheckpoint */
export class TrainingRun {
  /** @param {import('./config.js').Config} config */
  constructor(config) {
    this.config=validateConfig(config);this.identity=experimentIdentity(this.config);
    this.learner=createLearner(this.config);this.episode=0;this.interactions=0;this.discounted=0;this.hazards=0;this.updatesAtStart=0;
    /** @type {EpisodeRow[]} */this.rows=[];
    /** @type {import('../agents/tabular.js').Sample[]} */this.samples=[];
    /** @type {import('../agents/tabular.js').Decision|null} */this.pending=null;
    /** @type {LearningTrace|null} */this.last=null;
    this.environment=new IslandEnvironment(this.config.scenario,{seed:this.envSeed(),rolloutLimit:this.config.rolloutLimit});
    this.agentRng=createRng(this.actionSeed());
  }
  envSeed(){return deriveSeed(this.config.seed,'training/environment/'+this.episode);}
  actionSeed(){return deriveSeed(this.config.seed,'training/agent/'+this.episode);}
  nextEpisode(){this.episode++;this.environment.reset({seed:this.envSeed()});this.agentRng=createRng(this.actionSeed());this.samples=[];this.pending=null;this.discounted=0;this.hazards=0;this.updatesAtStart=this.learner.parameters.updates;}
  get finished(){return this.rows.filter(r=>!r.interrupted).length;}
  /** @param {boolean} [interrupted] */
  recordEpisode(interrupted=false) {
    const info=this.environment.getInfo();
    this.rows.push({episode:this.episode,seed:this.envSeed(),agentSeed:this.actionSeed(),return:info.totalReward,discountedReturn:this.discounted,length:info.steps,success:info.terminated&&info.reason==='goal',terminated:info.terminated,truncated:info.truncated,interrupted,hazards:this.hazards,updates:this.learner.parameters.updates-this.updatesAtStart});
  }
  step() {
    if(this.rows.length>=2000 || this.interactions>=2000000)throw Error('Run budget exhausted; create a new experiment.');
    if(this.learner.parameters.deep?.failure)throw Error(this.learner.parameters.deep.failure.reason);
    const info=this.environment.getInfo();if(info.terminated||info.truncated)this.nextEpisode();
    const state=stateKey(this.environment.getObservation());
    const decision=this.pending??chooseAction(this.config,this.learner.parameters,state,this.agentRng,false,'values' in this.learner?this.learner.values(state):undefined);
    const result=this.environment.step(/** @type {import('../environment/types.js').Action} */(['up','right','down','left'][decision.action]));
    const next=stateKey(result.observation);
    const nextDecision=['sarsa','linear-sarsa'].includes(this.config.algorithm)&&!result.terminated?chooseAction(this.config,this.learner.parameters,next,this.agentRng):null;
    const sample={state,action:decision.action,reward:result.reward,next,terminated:result.terminated,truncated:result.truncated,...(nextDecision?{nextAction:nextDecision.action}:{}),...(isPolicy(this.config.algorithm)?{policy:{probabilities:[...decision.probabilities],baseline:this.config.algorithm==='reinforce'?0:this.learner.parameters.v[state]??0,time:this.samples.length}}:{})};
    const updates=this.learner.observe(sample);this.samples.push(sample);this.interactions++;
    this.discounted+=Math.pow(this.config.gamma,this.samples.length-1)*result.reward;
    if(result.trace?.rewardParts.hazard)this.hazards++;
    this.pending=nextDecision;
    if(result.terminated||result.truncated){updates.push(...this.learner.endEpisode(this.samples,result.terminated));this.recordEpisode();this.pending=null;}
    this.last={decision,transition:/** @type {import('../environment/types.js').StepTrace} */(result.trace),updates,nextDecision};
    return this.last;
  }
  dispose(){if('dispose' in this.learner)this.learner.dispose();}
  resetEpisode(){const info=this.environment.getInfo();if(info.steps&&!info.terminated&&!info.truncated){this.learner.endEpisode(this.samples,false);this.recordEpisode(true);}this.nextEpisode();this.last=null;}
  /** @returns {RunCheckpoint} */
  checkpoint(){return structuredClone({schemaVersion:1,config:this.config,environment:this.environment.serialize(),agentRng:this.agentRng.snapshot(),parameters:this.learner.snapshot(),episode:this.episode,samples:this.samples,pending:this.pending,rows:this.rows,interactions:this.interactions,discounted:this.discounted,hazards:this.hazards,updatesAtStart:this.updatesAtStart,last:this.last});}
  snapshot(){return {checkpoint:this.checkpoint(),identity:this.identity,state:this.environment.getState(),info:this.environment.getInfo(),finished:this.finished};}
  /** @param {RunCheckpoint} checkpoint */
  static restore(checkpoint) {
    validateRunCheckpoint(checkpoint);
    const run=new TrainingRun(checkpoint.config);run.environment=IslandEnvironment.deserialize(checkpoint.environment);
    run.agentRng.restore(checkpoint.agentRng);run.dispose();run.learner=createLearner(run.config,checkpoint.parameters);
    for(const key of /** @type {const} */(['episode','interactions','discounted','hazards','updatesAtStart','samples','pending','rows','last'])) {
      // All fields were validated below; explicit assignments preserve their concrete types.
      Object.assign(run,{[key]:structuredClone(checkpoint[key])});
    }return run;
  }
}
/** Bounds and finite-data checks for local, self-reported checkpoints; no executable content.
 * @param {unknown} value @returns {asserts value is RunCheckpoint}
 */
export function validateRunCheckpoint(value) {
  exactRecord(value,['schemaVersion','config','environment','agentRng','parameters','episode','samples','pending','rows','interactions','discounted','hazards','updatesAtStart','last']);
  const c=/** @type {RunCheckpoint} */(value);
  if(c.schemaVersion!==1)throw Error('Unsupported learning checkpoint.');validateConfig(c.config);
  const env=IslandEnvironment.deserialize(c.environment);
  if(JSON.stringify(env.getScenario())!==JSON.stringify(c.config.scenario))throw Error('Checkpoint scenario mismatch.');
  if(!Array.isArray(c.rows)||c.rows.length>2000||!Array.isArray(c.samples)||c.samples.length>c.config.rolloutLimit)throw Error('Oversized learning history.');
  if(!Number.isInteger(c.episode)||c.episode<0||c.episode>2000||!Number.isInteger(c.interactions)||c.interactions<0||c.interactions>2000000)throw Error('Invalid learning counters.');
  if(env.getInfo().seed!==deriveSeed(c.config.seed,'training/environment/'+c.episode))throw Error('Checkpoint episode seed mismatch.');
  createRng(1).restore(c.agentRng);
  /** @param {unknown} node @param {number} [depth] */
  function finite(node,depth=0){if(depth>24)throw Error('Checkpoint too deeply nested.');if(typeof node==='number'&&!Number.isFinite(node))throw Error('Nonfinite checkpoint value.');if(node&&typeof node==='object')for(const [k,v] of Object.entries(node)){if(['__proto__','prototype','constructor'].includes(k))throw Error('Unsupported checkpoint key.');finite(v,depth+1);}}
  finite(c);
  validateParameters(c.parameters,c.config);validateTrainingRows(c.rows,c.config);
  integer(c.hazards,0,c.samples.length);integer(c.updatesAtStart,0,c.parameters.updates);number(c.discounted);
  if(env.getInfo().rolloutLimit!==c.config.rolloutLimit||env.getInfo().steps!==c.samples.length)throw Error('Episode cap/buffer mismatch.');
  const replay=new IslandEnvironment(c.config.scenario,{seed:env.getInfo().seed,rolloutLimit:c.config.rolloutLimit});let discounted=0,hazards=0,lastResult=null;
  for(const [i,s]of c.samples.entries()){
    record(s,['state','action','reward','next','terminated','truncated','nextAction',...(isPolicy(c.config.algorithm)?['policy']:[])]);if(isPolicy(c.config.algorithm))validatePolicySample(s.policy,i);integer(s.action,0,3);
    const previous=stateKey(replay.getObservation()),result=replay.step(ACTIONS[s.action]);
    if(!result.advanced||s.state!==previous||s.next!==stateKey(result.observation)||s.reward!==result.reward||s.terminated!==result.terminated||s.truncated!==result.truncated)throw Error('Episode samples do not replay.');
    if(['sarsa','linear-sarsa'].includes(c.config.algorithm)&&!s.terminated)integer(s.nextAction,0,3);else if(s.nextAction!==undefined)throw Error('Unexpected next action.');
    discounted+=Math.pow(c.config.gamma,i)*result.reward;if(result.trace?.rewardParts.hazard)hazards++;lastResult=result;
  }
  if(replay.serialize()!==env.serialize()||c.discounted!==discounted||c.hazards!==hazards)throw Error('Episode state/reward replay mismatch.');
  const info=env.getInfo(),currentRow=c.rows.at(-1),stopped=info.terminated||info.truncated;
  if(currentRow&&currentRow.episode>c.episode||stopped&&currentRow?.episode!==c.episode||!stopped&&currentRow?.episode===c.episode)throw Error('Episode history mismatch.');
  const counted=c.rows.reduce((sum,r)=>sum+r.length,0)+(stopped?0:info.steps);
  if(counted!==c.interactions||Object.values(c.parameters.visits).flat().reduce((a,b)=>a+b,0)!==c.interactions||c.config.algorithm!=='mc'&&c.config.algorithm!=='dqn'&&!isPolicy(c.config.algorithm)&&(c.parameters.updates-(c.parameters.planningUpdates??0))!==c.interactions)throw Error('Interaction/update counters mismatch.');
  if(c.config.algorithm==='dqn'&&c.parameters.updates!==expectedUpdates(c.config,c.interactions)-(c.parameters.deep?.failure?1:0))throw Error('Neural update counters mismatch.');
  if(isPolicy(c.config.algorithm)){const expected=c.config.algorithm==='actor-critic'?c.interactions:c.rows.filter(r=>r.terminated).reduce((n,r)=>n+r.length,0);if(c.parameters.updates!==expected||c.parameters.skippedPolicy!==(c.config.algorithm==='actor-critic'?0:c.rows.filter(r=>!r.terminated).length))throw Error('Policy episode/update counters mismatch.');}
  if(currentRow?.episode===c.episode&&(currentRow.return!==info.totalReward||currentRow.length!==info.steps||currentRow.discountedReturn!==c.discounted||currentRow.hazards!==c.hazards||currentRow.updates!==c.parameters.updates-c.updatesAtStart))throw Error('Latest row differs from the episode.');
  if(c.pending!==null){validateDecision(c.pending,c.config);if(!['sarsa','linear-sarsa'].includes(c.config.algorithm)||stopped||c.pending.state!==stateKey(env.getObservation()))throw Error('Invalid pending action.');}
  else if(['sarsa','linear-sarsa'].includes(c.config.algorithm)&&info.steps&&!stopped)throw Error('Missing pending SARSA action.');
  if(c.last!==null){exactRecord(c.last,['decision','transition','updates','nextDecision']);validateDecision(c.last.decision,c.config);if(!lastResult||JSON.stringify(c.last.transition)!==JSON.stringify(lastResult.trace)||c.last.decision.action!==c.samples.at(-1)?.action||c.last.decision.state!==c.samples.at(-1)?.state)throw Error('Last action trace mismatch.');
    if(c.last.nextDecision!==null)validateDecision(c.last.nextDecision,c.config);
    if(JSON.stringify(c.pending)!==JSON.stringify(stopped?null:c.last.nextDecision))throw Error('Pending decision mismatch.');
    if(!Array.isArray(c.last.updates)||c.last.updates.length>(isPolicy(c.config.algorithm)?c.config.rolloutLimit:24))throw Error('Invalid update trace.');
    for(const u of c.last.updates){if(c.config.algorithm==='dqn'){validateDeepUpdate(u,c.config,c.parameters);continue;}if(isPolicy(c.config.algorithm)){validatePolicyUpdate(u,c.config,c.samples);continue;}exactRecord(u,['state','action','old','reward','bootstrap','gamma','target','error','alpha','next','terminated','truncated','method','nextAction',...(u.features?['features','weightsBefore','weightsAfter','origin']:u.origin?['origin',...(u.origin==='planning'?['modelKey','planningDraw']:[])]:[])]);stateKeyCheck(c.config,u.state);for(const n of [u.old,u.reward,u.bootstrap,u.gamma,u.target,u.error,u.alpha,u.next])number(n);if(u.action!==null)integer(u.action,0,3);if(u.nextAction!==null)integer(u.nextAction,0,3);if(typeof u.terminated!=='boolean'||typeof u.truncated!=='boolean'||typeof u.method!=='string'||u.method.length>50)throw Error('Invalid update metadata.');if(u.error!==u.target-u.old||(u.features?u.next!==dot(u.weightsAfter??[],u.features)||u.old!==dot(u.weightsBefore??[],u.features)||(u.weightsAfter??[]).some((w,i)=>w!==(u.weightsBefore??[])[i]+u.alpha*u.error*(u.features??[])[i]):u.next!==u.old+u.alpha*u.error)||u.gamma!==c.config.gamma)throw Error('Update arithmetic mismatch.');}
  }else if(info.steps)throw Error('Missing transition trace.');
  if(JSON.stringify(c).length>1500000)throw Error('Learning checkpoint too large.');
}
