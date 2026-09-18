import {isPolicy,policyDecision} from './policy.js';
import { linearEstimate } from './features.js';
import { ACTIONS } from '../environment/schema.js';
/** @typedef {import('../training/config.js').Algorithm} Algorithm */
/** @typedef {{state:string,action:number,reward:number,next:string,terminated:boolean,truncated:boolean,nextAction?:number,policy?:{probabilities:number[],baseline:number,time:number}}} Sample */
/** @typedef {{state:string,action:number|null,old:number,reward:number,bootstrap:number,gamma:number,target:number,error:number,alpha:number,next:number,terminated:boolean,truncated:boolean,method:string,nextAction:number|null,features?:number[],weightsBefore?:number[],weightsAfter?:number[],origin?:'real'|'planning',modelKey?:string,planningDraw?:number,policy?:import('./policy.js').PolicyUpdate,deep?:import('./deep/schema.js').DeepUpdate}} Update */
/** @typedef {{v:Record<string,number>,q:Record<string,number[]>,visits:Record<string,number[]>,counts:Record<string,number>,errors:Record<string,number>,updates:number,skippedMC:number,weights?:number[],model?:Record<string,import('./dyna.js').ModelEntry>,planningUpdates?:number,planningRng?:import('../environment/types.js').RngSnapshot,actor?:Record<string,number[]>,criticUpdates?:number,skippedPolicy?:number,deep?:import('./deep/schema.js').DeepParameters}} Parameters */
/** @typedef {{state:string,action:number,values:number[],probabilities:number[],epsilon:number,explorationDraw:number|null,actionDraw:number|null,branch:string,greedyAction:number,rule:string}} Decision */
export const capabilities={dqn:{name:'Neural DQN',prediction:false,control:true,requiresModel:false,supportsQ:true},reinforce:{name:'REINFORCE',prediction:false,control:true,requiresModel:false,supportsQ:false},'reinforce-baseline':{name:'REINFORCE + baseline',prediction:false,control:true,requiresModel:false,supportsQ:false},'actor-critic':{name:'One-step actor-critic',prediction:false,control:true,requiresModel:false,supportsQ:false},'linear-td':{name:'Linear TD(0)',prediction:true,control:false,requiresModel:false,supportsQ:false},'linear-sarsa':{name:'Linear SARSA',prediction:false,control:true,requiresModel:false,supportsQ:true},dyna:{name:'Dyna-Q',prediction:false,control:true,requiresModel:false,supportsQ:true},mc:{name:'First-visit Monte Carlo',prediction:true,control:false,requiresModel:false,supportsQ:false},td:{name:'TD(0)',prediction:true,control:false,requiresModel:false,supportsQ:false},sarsa:{name:'SARSA',prediction:false,control:true,requiresModel:false,supportsQ:true},q:{name:'Q-learning',prediction:false,control:true,requiresModel:false,supportsQ:true}};
/** @returns {Parameters} */
export const emptyParameters=()=>({v:{},q:{},visits:{},counts:{},errors:{},updates:0,skippedMC:0});
/** @param {Parameters} p @param {string} state */
export const qValues=(p,state)=>[...(p.q[state]??[0,0,0,0])];
/** Selection trace is captured BEFORE an update; exploration can select the greedy action.
 * @param {import('../training/config.js').Config} config @param {Parameters} p @param {string} state @param {ReturnType<typeof import('../environment/rng.js').createRng>} rng @param {boolean} [evaluation] @param {number[]} [networkValues] @returns {Decision}
 */
export function chooseAction(config,p,state,rng,evaluation=false,networkValues) {
  if(isPolicy(config.algorithm))return policyDecision(p,state,rng,evaluation);
  const values=networkValues??(config.algorithm==='linear-sarsa'?[0,1,2,3].map(a=>linearEstimate(config,p,state,a)):qValues(p,state)),greedyAction=values.indexOf(Math.max(...values));
  let epsilon=0, explorationDraw=null, actionDraw=null, action=1, branch='fixed-policy',rule='Specified fixed right policy',probabilities=[0,1,0,0];
  if(capabilities[config.algorithm].prediction) {
    if(config.policy==='uniform') {actionDraw=rng.next();action=Math.floor(actionDraw*4);probabilities=[.25,.25,.25,.25];rule='Specified fixed uniform policy';}
  } else {
    epsilon=evaluation?0:config.epsilon;rule=evaluation?'Frozen greedy policy; epsilon 0':'Constant epsilon-greedy behavior';
    probabilities=ACTIONS.map((_,a)=>epsilon/4+(a===greedyAction?1-epsilon:0));
    explorationDraw=epsilon>0?rng.next():null;
    if(explorationDraw!==null && explorationDraw<epsilon) {actionDraw=rng.next();action=Math.floor(actionDraw*4);branch='exploration';} else {action=greedyAction;branch='exploitation';}
  }
  return {state,action,values,probabilities,epsilon,explorationDraw,actionDraw,branch,greedyAction,rule};
}
/** Learners receive samples only. No environment/model API is available here. */
export class TabularLearner {
  /** @param {import('../training/config.js').Config} config @param {Parameters} [parameters] */
  constructor(config,parameters=emptyParameters()) {this.config=config;this.parameters=structuredClone(parameters);}
  /** @param {Sample} sample @param {boolean} [real] @returns {Update[]} */
  observe(sample,real=true) {
    const p=this.parameters,{state,action,reward,next,terminated,truncated}=sample;
    if(real){const visits=p.visits[state]??=[0,0,0,0];visits[action]++;}
    if(this.config.algorithm==='mc') return [];
    const prediction=this.config.algorithm==='td',old=prediction?(p.v[state]??0):qValues(p,state)[action];
    let bootstrap=0;
    if(!terminated) {
      if(prediction) bootstrap=p.v[next]??0;
      else if(this.config.algorithm==='sarsa') {if(sample.nextAction===undefined)throw Error('SARSA needs the actually selected next behavior action.');bootstrap=qValues(p,next)[sample.nextAction];}
      else bootstrap=Math.max(...qValues(p,next));
    }
    const target=reward+this.config.gamma*bootstrap,error=target-old,value=old+this.config.alpha*error;
    if(prediction)p.v[state]=value;else {p.q[state]??=[0,0,0,0];p.q[state][action]=value;}
    p.errors[state]=error;p.updates++;
    return [{state,action:prediction?null:action,old,reward,bootstrap,gamma:this.config.gamma,target,error,alpha:this.config.alpha,next:value,terminated,truncated,method:this.config.algorithm,nextAction:sample.nextAction??null}];
  }
  /** Complete-return first-visit MC; external caps/aborts never become zero-tail returns.
   * @param {Sample[]} episode @param {boolean} terminated @returns {Update[]}
   */
  endEpisode(episode,terminated) {
    if(this.config.algorithm!=='mc')return [];
    const p=this.parameters;
    if(!terminated){p.skippedMC++;return [];}
    let value=0;const returns=episode.map(()=>0);
    for(let i=episode.length-1;i>=0;i--){value=episode[i].reward+this.config.gamma*value;returns[i]=value;}
    const seen=new Set();
    /** @type {Update[]} */
    const updates=[];
    episode.forEach((sample,i)=>{
      if(seen.has(sample.state))return;seen.add(sample.state);
      const old=p.v[sample.state]??0,count=(p.counts[sample.state]??0)+1,alpha=1/count,target=returns[i],error=target-old,next=old+alpha*error;
      p.counts[sample.state]=count;p.v[sample.state]=next;p.errors[sample.state]=error;p.updates++;
      updates.push({state:sample.state,action:null,old,reward:sample.reward,bootstrap:0,gamma:this.config.gamma,target,error,alpha,next,terminated:sample.terminated,truncated:sample.truncated,method:'mc first-visit return',nextAction:null});
    });return updates;
  }
  snapshot(){return structuredClone(this.parameters);}
}
