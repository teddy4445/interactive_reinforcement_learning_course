import {exactRecord,number,stateKeyCheck} from '../../training/validation.js';
import {integer,ACTIONS,stateKey} from '../../environment/schema.js';
import {createRng,deriveSeed} from '../../environment/rng.js';
import {transitions} from '../../environment/model.js';
import {decodeState} from '../features.js';
import {TF_VERSION,vectorEncoder,weightShapes,expectedUpdates,tdTarget,neuralStates} from './schema.js';
/** @param {import('../tabular.js').Parameters} p @param {import('../../training/config.js').Config} c */
export function validateDeepParameters(p,c){
 const d=p.deep;if(!d||!c.deep)throw Error('Missing neural checkpoint.');exactRecord(d,['schemaVersion','online','target','replay','replayRng','initSeed','targetCopies','optimizer','metrics','failure','runtime']);
 if(d.schemaVersion!==1||d.initSeed!==deriveSeed(c.seed,'network-init'))throw Error('Neural initialization mismatch.');
 const shapes=weightShapes(vectorEncoder(c.scenario).dimension);
 for(const weights of [d.online,d.target]){if(!Array.isArray(weights)||weights.length!==shapes.length)throw Error('Invalid network topology.');weights.forEach((w,i)=>{if(!Array.isArray(w)||w.length!==shapes[i].reduce((a,b)=>a*b,1))throw Error('Invalid network shape.');w.forEach(n=>number(n));});}
 exactRecord(d.runtime,['library','version','backend','dtype']);if(d.runtime.library!=='TensorFlow.js'||d.runtime.version!==TF_VERSION||d.runtime.backend!=='cpu'||d.runtime.dtype!=='float32')throw Error('Unsupported neural runtime.');
 exactRecord(d.optimizer,['name','learningRate','iterations','slots']);if(d.optimizer.name!=='sgd'||d.optimizer.learningRate!==c.alpha||d.optimizer.iterations!==p.updates||!Array.isArray(d.optimizer.slots)||d.optimizer.slots.length)throw Error('Optimizer mismatch.');
 integer(d.targetCopies,0,2000000);if(d.targetCopies!==(c.deep.target?Math.floor(p.updates/c.deep.targetEvery):0))throw Error('Target synchronization count mismatch.');
 const r=d.replay;exactRecord(r,['capacity','cursor','seen','items']);integer(r.seen,0,2000000);integer(r.cursor,0,c.deep.capacity-1);if(r.capacity!==c.deep.capacity||r.cursor!==r.seen%r.capacity||!Array.isArray(r.items)||r.items.length!==Math.min(r.seen,r.capacity))throw Error('Replay ring mismatch.');
 for(const [i,s]of r.items.entries()){
  exactRecord(s,['id','state','action','reward','next','terminated','truncated']);integer(s.id,Math.max(1,r.seen-r.capacity+1),r.seen);integer(s.action,0,3);stateKeyCheck(c,s.state);stateKeyCheck(c,s.next);number(s.reward);if((s.id-1)%r.capacity!==i||typeof s.terminated!=='boolean'||typeof s.truncated!=='boolean'||s.terminated&&s.truncated)throw Error('Replay sample metadata mismatch.');
  if(!transitions(c.scenario,decodeState(s.state),ACTIONS[s.action]).some(o=>stateKey(o.nextState)===s.next&&o.reward===s.reward&&o.terminated===s.terminated))throw Error('Impossible replay transition.');
 }
 createRng(1).restore(d.replayRng);if(r.seen!==Object.values(p.visits).flat().reduce((a,b)=>a+b,0))throw Error('Replay/visit counters mismatch.');
 if(d.failure!==null){exactRecord(d.failure,['interaction','reason']);if(d.failure.interaction!==r.seen||typeof d.failure.reason!=='string'||!d.failure.reason||d.failure.reason.length>300)throw Error('Invalid failure evidence.');}
 if(p.updates!==expectedUpdates(c,r.seen)-(d.failure?1:0))throw Error('Neural warmup/update count mismatch.');
 if(!Array.isArray(d.metrics)||d.metrics.length!==Math.min(256,p.updates))throw Error('Invalid loss history.');
 const settings=c.deep;d.metrics.forEach((m,i)=>{exactRecord(m,['update','interaction','loss','meanAbsTd','gradientNorm','parameterDeltaNorm','maxAbsQ','targetSync']);if(m.update!==p.updates-d.metrics.length+i+1||m.interaction!==m.update+settings.batch-1||m.targetSync!==(settings.target&&m.update%settings.targetEvery===0))throw Error('Metric provenance mismatch.');for(const v of [m.loss,m.meanAbsTd,m.gradientNorm,m.parameterDeltaNorm,m.maxAbsQ])number(v,0);});
 if(JSON.stringify(Object.keys(p.q).sort())!==JSON.stringify(neuralStates(c.scenario).sort()))throw Error('Missing network output cache.');
}
/** Saved first replay member is not necessarily the latest real transition.
 * @param {import('../tabular.js').Update} u @param {import('../../training/config.js').Config} c @param {import('../tabular.js').Parameters} p */
export function validateDeepUpdate(u,c,p){
 exactRecord(u,['state','action','old','reward','bootstrap','gamma','target','error','alpha','next','terminated','truncated','method','nextAction','origin','deep']);const d=u.deep;if(!d||!c.deep||!p.deep)throw Error('Missing batch update.');exactRecord(d,['batchSize','replayIds','loss','meanAbsTd','gradientNorm','parameterDeltaNorm','targetCopied','targetCopies','weightBefore','weightAfter']);
 for(const n of [u.old,u.reward,u.bootstrap,u.gamma,u.target,u.error,u.alpha,u.next,d.loss,d.meanAbsTd,d.gradientNorm,d.parameterDeltaNorm,d.weightBefore,d.weightAfter])number(n);
 if(d.batchSize!==c.deep.batch||!Array.isArray(d.replayIds)||d.replayIds.length!==d.batchSize)throw Error('Invalid sampled batch.');d.replayIds.forEach(id=>{if(!p.deep?.replay.items.some(s=>s.id===id))throw Error('Sample outside saved replay.');});
 const s=p.deep.replay.items.find(s=>s.id===d.replayIds[0]),m=p.deep.metrics.at(-1);
 if(!s||!m||u.state!==s.state||u.action!==s.action||u.reward!==s.reward||u.terminated!==s.terminated||u.truncated!==s.truncated||u.terminated&&u.bootstrap!==0||u.target!==tdTarget(u.reward,u.terminated,c.gamma,u.bootstrap)||u.error!==u.target-u.old||u.alpha!==c.alpha||u.gamma!==c.gamma||u.method!=='dqn'||u.origin!=='real'||u.nextAction!==null||u.next!==p.q[u.state][s.action]||d.targetCopied!==m.targetSync||d.targetCopies!==p.deep.targetCopies||d.loss!==m.loss||d.gradientNorm!==m.gradientNorm||d.parameterDeltaNorm!==m.parameterDeltaNorm||d.meanAbsTd!==m.meanAbsTd)throw Error('Neural update arithmetic/provenance mismatch.');
}
