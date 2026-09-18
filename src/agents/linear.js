import { emptyParameters } from './tabular.js';
import { actionFeatures,decodeState,dot,featureEncoder,linearEstimate } from './features.js';
/** Semi-gradient target is held fixed during this weight update.
 * @param {number[]} weights @param {number[]} phi @param {number} target @param {number} alpha
 */
export function linearBackup(weights,phi,target,alpha){if(!Number.isFinite(target)||!Number.isFinite(alpha)||alpha<=0||alpha>1)throw Error('Invalid linear update.');const old=dot(weights,phi),error=target-old,after=weights.map((w,i)=>w+alpha*error*phi[i]);if(after.some(w=>!Number.isFinite(w)))throw Error('Nonfinite linear weights.');return {old,error,after,next:dot(after,phi)};}
export class LinearLearner {
 /** @param {import('../training/config.js').Config} config @param {import('./tabular.js').Parameters} [parameters] */
 constructor(config,parameters){this.config=config;this.encoder=featureEncoder(config.scenario,config.representation);this.parameters=parameters?structuredClone(parameters):{...emptyParameters(),weights:Array(this.encoder.dimension*(config.algorithm==='linear-sarsa'?4:1)).fill(0)};}
 /** @param {import('./tabular.js').Sample} sample @returns {import('./tabular.js').Update[]} */
 observe(sample){const p=this.parameters,prediction=this.config.algorithm==='linear-td',base=this.encoder.encode(decodeState(sample.state)),phi=prediction?base:actionFeatures(base,sample.action),before=[...(p.weights??[])];let bootstrap=0;if(!sample.terminated){if(!prediction&&sample.nextAction===undefined)throw Error('Linear SARSA needs its actual next behavior action.');bootstrap=linearEstimate(this.config,p,sample.next,prediction?undefined:sample.nextAction);}
 const target=sample.reward+this.config.gamma*bootstrap,u=linearBackup(before,phi,target,this.config.alpha);p.weights=u.after;(p.visits[sample.state]??=[0,0,0,0])[sample.action]++;p.errors[sample.state]=u.error;p.updates++;
 return [{state:sample.state,action:prediction?null:sample.action,old:u.old,reward:sample.reward,bootstrap,gamma:this.config.gamma,target,error:u.error,alpha:this.config.alpha,next:u.next,terminated:sample.terminated,truncated:sample.truncated,method:this.config.algorithm,nextAction:sample.nextAction??null,features:phi,weightsBefore:before,weightsAfter:[...u.after],origin:'real'}];}
 /** @param {import('./tabular.js').Sample[]} _episode @param {boolean} _terminated @returns {import('./tabular.js').Update[]} */
 endEpisode(_episode,_terminated){void _episode;void _terminated;return [];}
 snapshot(){return structuredClone(this.parameters);}
}
