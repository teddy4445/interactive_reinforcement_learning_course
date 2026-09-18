import {createPredictor} from '../agents/registry.js';
import {evaluationRule} from '../agents/policy.js';
import { IslandEnvironment } from '../environment/engine.js';
import { createRng, deriveSeed } from '../environment/rng.js';
import { ACTIONS, stateKey } from '../environment/schema.js';
import { chooseAction } from '../agents/tabular.js';
import { hashData } from '../training/config.js';
/** @typedef {{seed:number,return:number,discountedReturn:number,length:number,success:boolean,terminated:boolean,truncated:boolean,hazards:number}} EvaluationRow */
export class FrozenEvaluation {
  /** Fresh environments/RNGs and a detached parameter snapshot. No learner update API.
   * @param {import('../training/config.js').Config} config @param {import('../agents/tabular.js').Parameters} parameters @param {number[]} seeds
   */
  constructor(config,parameters,seeds) {
    if(!seeds.length||seeds.length>50||new Set(seeds).size!==seeds.length)throw Error('Evaluation requires 1–50 distinct seeds.');
    this.config=structuredClone(config);this.parameters=structuredClone(parameters);this.parameterHash=hashData(parameters);this.seeds=[...seeds];
    this.rule=evaluationRule(config);this.predictor=createPredictor(config,parameters);
    /** @type {EvaluationRow[]} */ this.rows=[];this.discounted=0;this.hazards=0;
    this.environment=new IslandEnvironment(config.scenario,{seed:seeds[0],rolloutLimit:config.rolloutLimit});this.rng=createRng(deriveSeed(seeds[0],'evaluation/actions'));
  }
  get done(){return this.rows.length===this.seeds.length;}
  step(){
    if(this.done)return;
    const info=this.environment.getInfo();
    if(info.terminated||info.truncated){this.environment.reset({seed:this.seeds[this.rows.length]});this.rng=createRng(deriveSeed(this.seeds[this.rows.length],'evaluation/actions'));this.discounted=0;this.hazards=0;}
    const decision=chooseAction(this.config,this.parameters,stateKey(this.environment.getObservation()),this.rng,true,this.predictor?.values(stateKey(this.environment.getObservation())));
    const result=this.environment.step(ACTIONS[decision.action]);this.discounted+=Math.pow(this.config.gamma,result.info.steps-1)*result.reward;if(result.trace?.rewardParts.hazard)this.hazards++;
    if(result.terminated||result.truncated)this.rows.push({seed:this.seeds[this.rows.length],return:result.info.totalReward,discountedReturn:this.discounted,length:result.info.steps,success:result.terminated&&result.info.reason==='goal',terminated:result.terminated,truncated:result.truncated,hazards:this.hazards});
  }
  dispose(){this.predictor?.dispose();}
  result(){return {rule:this.rule,seeds:[...this.seeds],parameterHash:this.parameterHash,rows:structuredClone(this.rows),complete:this.done,trainingUpdates:0};}
}
/** @param {number} seed @param {number} [count] */
export const evaluationSeeds=(seed,count=5)=>Array.from({length:count},(_,i)=>deriveSeed(seed,'held-out-evaluation/'+i));
