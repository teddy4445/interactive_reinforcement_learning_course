import {emptyParameters,capabilities} from './tabular.js';
/** @typedef {{probabilities:number[],gradient:number[],preferencesBefore:number[],preferencesAfter:number[],time:number,discount:number,actorAlpha:number,kind:'return'|'td',return:number|null,criticUpdated:boolean,criticBefore:number}} PolicyUpdate */
/** @param {string} algorithm */
export const isPolicy=algorithm=>['reinforce','reinforce-baseline','actor-critic'].includes(algorithm);
/** Stable even for logits near floating-point limits. Temperature is fixed at 1.
 * @param {number[]} logits */
export function softmax(logits){
 if(!logits.length||logits.some(x=>!Number.isFinite(x)))throw Error('Finite policy preferences required.');
 const max=Math.max(...logits),exps=logits.map(x=>Math.exp(x-max)),sum=exps.reduce((a,b)=>a+b,0);return exps.map(x=>x/sum);
}
/** Score function of a categorical softmax. @param {number[]} probabilities @param {number} action */
export function scoreGradient(probabilities,action){if(!Number.isInteger(action)||action<0||action>=probabilities.length)throw Error('Invalid selected action.');return probabilities.map((p,i)=>(i===action?1:0)-p);}
/** CDF sampling uses a single recorded draw and never argmax. @param {number[]} probabilities @param {number} draw */
export function samplePolicy(probabilities,draw){if(draw<0||draw>=1||!Number.isFinite(draw)||!probabilities.length||probabilities.some(p=>!Number.isFinite(p)||p<0)||Math.abs(probabilities.reduce((s,p)=>s+p,0)-1)>1e-12)throw Error('Invalid categorical sample.');let cumulative=0,last=0;for(const [i,p]of probabilities.entries()){if(p>0)last=i;cumulative+=p;if(draw<cumulative)return i;}return last;}
/** @param {import('./tabular.js').Parameters} p @param {string} state */
export const preferences=(p,state)=>[...(p.actor?.[state]??[0,0,0,0])];
/** @param {import('../training/config.js').Config} c */
export const evaluationRule=c=>isPolicy(c.algorithm)?'Frozen learned softmax policy; temperature 1; categorical sampling; no learning':capabilities[c.algorithm].prediction?'Specified fixed '+c.policy+' policy; learning frozen':'Frozen greedy policy; epsilon 0; ties up, right, down, left';
/** @param {import('./tabular.js').Parameters} p @param {string} state @param {ReturnType<typeof import('../environment/rng.js').createRng>} rng @param {boolean} evaluation @returns {import('./tabular.js').Decision} */
export function policyDecision(p,state,rng,evaluation){const values=preferences(p,state),probabilities=softmax(values),actionDraw=rng.next();return {state,action:samplePolicy(probabilities,actionDraw),values,probabilities,epsilon:0,explorationDraw:null,actionDraw,branch:'policy-sample',greedyAction:values.indexOf(Math.max(...values)),rule:evaluation?'Frozen learned softmax policy; categorical sampling':'Learned softmax policy; categorical sampling'};}
/** Tabular actor preferences and independent state-value critic. No environment model or Q table. */
export class PolicyLearner {
 /** @param {import('../training/config.js').Config} config @param {import('./tabular.js').Parameters} [parameters] */
 constructor(config,parameters){this.config=config;this.parameters=structuredClone(parameters??{...emptyParameters(),actor:{},criticUpdates:0,skippedPolicy:0});}
 /** @param {import('./tabular.js').Sample} sample @returns {import('./tabular.js').Update[]} */
 observe(sample){const visits=this.parameters.visits[sample.state]??=[0,0,0,0];visits[sample.action]++;if(!sample.policy)throw Error('Policy learning requires the selection-time trace.');if(this.config.algorithm!=='actor-critic')return [];const bootstrap=sample.terminated?0:this.parameters.v[sample.next]??0;return [this.update(sample,sample.reward+this.config.gamma*bootstrap,bootstrap,'td')];}
 /** The actor uses a fixed sampled signal: no derivative through G, V, or delta.
  * @param {import('./tabular.js').Sample} s @param {number} target @param {number} bootstrap @param {'return'|'td'} kind @returns {import('./tabular.js').Update} */
 update(s,target,bootstrap,kind){
  const p=this.parameters,c=this.config,trace=s.policy;if(!trace||!p.actor)throw Error('Missing actor trace.');
  const criticUpdated=c.algorithm!=='reinforce',old=trace.baseline,error=target-old,gradient=scoreGradient(trace.probabilities,s.action),before=preferences(p,s.state),discount=Math.pow(c.gamma,trace.time);
  const after=before.map((theta,i)=>theta+c.alpha*discount*error*gradient[i]);p.actor[s.state]=after;
  // Episodic baselines are frozen during collection, then fit in the same batch as the actor.
  // Repeated-state residuals accumulate against that frozen baseline.
  const criticBefore=criticUpdated?(p.v[s.state]??0):0,next=criticBefore+(criticUpdated?c.alpha:0)*error;
  if(criticUpdated){p.v[s.state]=next;p.criticUpdates=(p.criticUpdates??0)+1;}
  p.errors[s.state]=error;p.updates++;
  return {state:s.state,action:s.action,old,reward:s.reward,bootstrap,gamma:c.gamma,target,error,alpha:criticUpdated?c.alpha:0,next,terminated:s.terminated,truncated:s.truncated,method:c.algorithm,nextAction:null,origin:'real',policy:{probabilities:[...trace.probabilities],gradient,preferencesBefore:before,preferencesAfter:after,time:trace.time,discount,actorAlpha:c.alpha,kind,return:kind==='return'?target:null,criticUpdated,criticBefore}};
 }
 /** Incomplete returns are skipped, never silently zero-tailed. @param {import('./tabular.js').Sample[]} episode @param {boolean} terminated @returns {import('./tabular.js').Update[]} */
 endEpisode(episode,terminated){if(this.config.algorithm==='actor-critic')return [];if(!terminated){this.parameters.skippedPolicy=(this.parameters.skippedPolicy??0)+1;return [];}
  let value=0;const returns=episode.map(()=>0);for(let t=episode.length-1;t>=0;t--){value=episode[t].reward+this.config.gamma*value;returns[t]=value;}
  return episode.map((s,t)=>this.update(s,returns[t],0,'return'));
 }
 snapshot(){return structuredClone(this.parameters);}
}
