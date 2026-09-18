import {PolicyLearner,isPolicy} from './policy.js';
import {TabularLearner} from './tabular.js';
import {LinearLearner} from './linear.js';
import {DynaLearner} from './dyna.js';
/** @param {import('../training/config.js').Config} config @param {import('./tabular.js').Parameters} [parameters] */
export function createLearner(config,parameters){return config.algorithm==='dqn'?createDeep(config,parameters):isPolicy(config.algorithm)?new PolicyLearner(config,parameters):config.algorithm.startsWith('linear-')?new LinearLearner(config,parameters):config.algorithm==='dyna'?new DynaLearner(config,parameters):new TabularLearner(config,parameters);}

/** Neural code is fetched only when an explicit DQN experiment initializes. */
/** @type {typeof import('./deep/learner.js')|null} */let neural=null;
/** @param {import('../training/config.js').Config} config */
export async function prepareLearner(config){if(config.algorithm==='dqn'){neural??=await import('./deep/learner.js');await neural.ready();}}
/** @param {import('../training/config.js').Config} c @param {import('./tabular.js').Parameters} p */
export function createPredictor(c,p){if(c.algorithm!=='dqn')return null;if(!neural)throw Error('Neural module is not ready.');return new neural.NeuralPredictor(c,p);}
/** @param {import('../training/config.js').Config} c @param {import('./tabular.js').Parameters} [p] */
function createDeep(c,p){if(!neural)throw Error('Neural module is not ready.');return new neural.DqnLearner(c,p);}
