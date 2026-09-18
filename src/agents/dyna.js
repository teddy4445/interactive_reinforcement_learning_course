import { TabularLearner } from './tabular.js';
import { createRng,deriveSeed } from '../environment/rng.js';
/** @typedef {{state:string,action:number,reward:number,next:string,terminated:boolean,visits:number}} ModelEntry */
/** Only observed deterministic transitions enter this model. No true-model access.
 * @param {Record<string,ModelEntry>} model @param {import('./tabular.js').Sample} sample
 */
export function learnModel(model,sample){const key=sample.state+' / '+sample.action,old=model[key];if(old&&(old.reward!==sample.reward||old.next!==sample.next||old.terminated!==sample.terminated))throw Error('Conflicting outcome: deterministic stationary model cannot represent this task.');return model[key]={state:sample.state,action:sample.action,reward:sample.reward,next:sample.next,terminated:sample.terminated,visits:(old?.visits??0)+1};}
export class DynaLearner extends TabularLearner {
 /** @param {import('../training/config.js').Config} config @param {import('./tabular.js').Parameters} [parameters] */
 constructor(config,parameters){super(config,parameters);if(config.scenario.slip!==0)throw Error('Dyna model requires deterministic movement.');this.parameters.model??={};this.parameters.planningUpdates??=0;this.parameters.planningRng??=createRng(deriveSeed(config.seed,'planning')).snapshot();}
 /** @param {import('./tabular.js').Sample} sample */
 observe(sample){const p=this.parameters,updates=super.observe(sample);updates[0].origin='real';const model=p.model??={};learnModel(model,sample);const rng=createRng(1);rng.restore(/** @type {import('../environment/types.js').RngSnapshot} */(p.planningRng));const keys=Object.keys(model).sort();
 for(let i=0;i<(this.config.planningSteps??0);i++){const draw=rng.next(),key=keys[Math.floor(draw*keys.length)],entry=model[key],planned=super.observe({...entry,truncated:false},false);for(const update of planned){update.origin='planning';update.modelKey=key;update.planningDraw=draw;}updates.push(...planned);p.planningUpdates=Number(p.planningUpdates)+1;}p.planningRng=rng.snapshot();return updates;}
}
