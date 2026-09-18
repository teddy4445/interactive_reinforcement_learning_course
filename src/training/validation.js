import {validateDeepParameters} from '../agents/deep/validation.js';
import {isPolicy,softmax,scoreGradient,samplePolicy,evaluationRule} from '../agents/policy.js';
import {decodeState,featureEncoder} from '../agents/features.js';
import {capabilities} from '../agents/tabular.js';
import {ACTIONS,stateKey,validateState} from '../environment/schema.js';
import {transitions} from '../environment/model.js';
import {createRng} from '../environment/rng.js';
import { record,integer } from '../environment/schema.js';
import { deriveSeed,validateSeed } from '../environment/rng.js';
import { hashData } from './config.js';
/** @typedef {import('./config.js').Config} Config */
/** Require exactly these fields; backups are data, never executable input.
 * @param {unknown} value @param {string[]} keys
 */
export function exactRecord(value,keys){const r=record(value,keys);if(keys.some(k=>!Object.hasOwn(r,k)))throw Error('Missing record field.');return r;}
/** @param {unknown} value @param {number} [min] @param {number} [max] */
export function number(value,min=-1e9,max=1e9){if(typeof value!=='number'||!Number.isFinite(value)||value<min||value>max)throw Error('Invalid finite number.');return value;}
/** @param {Config} config @param {unknown} key */
export function stateKeyCheck(config,key){if(typeof key!=='string')throw Error('Invalid state key.');const schema=config.scenario.observation==='position'?{...config.scenario,features:{collectibles:false,battery:null,horizon:null}}:config.scenario;const state=validateState(schema,decodeState(key));if(stateKey(state)!==key)throw Error('Noncanonical state key.');return key;}
/** @param {unknown} value @param {Config} config @returns {asserts value is import('../agents/tabular.js').Parameters} */
export function validateParameters(value,config){
 const p=exactRecord(value,['v','q','visits','counts','errors','updates','skippedMC',...(config.algorithm==='dqn'?['deep']:config.algorithm.startsWith('linear-')?['weights']:config.algorithm==='dyna'?['model','planningUpdates','planningRng']:isPolicy(config.algorithm)?['actor','criticUpdates','skippedPolicy']:[])]);integer(p.updates,0,42000000);integer(p.skippedMC,0,2000);
 for(const name of ['v','q','visits','counts','errors']){
  const table=p[name];if(!table||typeof table!=='object'||Array.isArray(table)||Object.keys(table).length>(config.lesson==='lab'?50000:64))throw Error('Invalid parameter table.');
  for(const [key,entry]of Object.entries(table)){stateKeyCheck(config,key);if(name==='q'||name==='visits'){if(!Array.isArray(entry)||entry.length!==4)throw Error('Four actions required.');entry.forEach(n=>name==='visits'?integer(n,0,2000000):number(n));}else if(name==='counts')integer(entry,1,2000);else number(entry);}
 }
 const typed=/** @type {import('../agents/tabular.js').Parameters} */(p),prediction=capabilities[config.algorithm].prediction;
 if(isPolicy(config.algorithm)?Object.keys(typed.q).length:prediction?Object.keys(typed.q).length:Object.keys(typed.v).length)throw Error('Incompatible learned representation.');
 if(config.algorithm!=='mc'&&(Object.keys(typed.counts).length||typed.skippedMC))throw Error('MC counters on another method.');
 if(config.algorithm.startsWith('linear-')){if(!Array.isArray(typed.weights)||typed.weights.length!==featureEncoder(config.scenario,config.representation).dimension*(config.algorithm==='linear-sarsa'?4:1)||Object.keys(typed.v).length||Object.keys(typed.q).length)throw Error('Incompatible linear weights.');typed.weights.forEach(w=>number(w));}
 if(config.algorithm==='dyna'){
  integer(typed.planningUpdates,0,40000000);if(!typed.model||Array.isArray(typed.model)||Object.keys(typed.model).length>(config.lesson==='lab'?200000:256))throw Error('Invalid learned model.');createRng(1).restore(/** @type {import('../environment/types.js').RngSnapshot} */(typed.planningRng));let observed=0;
  for(const [key,entry]of Object.entries(typed.model)){exactRecord(entry,['state','action','reward','next','terminated','visits']);stateKeyCheck(config,entry.state);stateKeyCheck(config,entry.next);integer(entry.action,0,3);integer(entry.visits,1,2000000);observed+=entry.visits;const outcomes=transitions(config.scenario,decodeState(entry.state),ACTIONS[entry.action]);if(key!==entry.state+' / '+entry.action||outcomes.length!==1||outcomes[0].reward!==entry.reward||stateKey(outcomes[0].nextState)!==entry.next||outcomes[0].terminated!==entry.terminated)throw Error('Invalid deterministic model entry.');}
  if(typed.planningUpdates!==observed*(config.planningSteps??0)||typed.updates!==observed+typed.planningUpdates)throw Error('Real/planning budget mismatch.');
 }
 if(isPolicy(config.algorithm)){
  if(!typed.actor||Array.isArray(typed.actor)||Object.keys(typed.actor).length>(config.lesson==='lab'?50000:64))throw Error('Invalid actor preferences.');for(const [key,row]of Object.entries(typed.actor)){stateKeyCheck(config,key);if(!Array.isArray(row)||row.length!==4)throw Error('Four actor preferences required.');row.forEach(n=>number(n));}
  integer(typed.criticUpdates,0,2000000);integer(typed.skippedPolicy,0,2000);if(typed.criticUpdates!==(config.algorithm==='reinforce'?0:typed.updates)||config.algorithm==='reinforce'&&Object.keys(typed.v).length)throw Error('Critic counter/representation mismatch.');
 }
 if(config.algorithm==='dqn')validateDeepParameters(typed,config);
 if(config.algorithm==='mc'&&Object.values(typed.counts).reduce((a,b)=>a+b,0)!==typed.updates)throw Error('MC update count mismatch.');
}
/** @param {unknown} value @param {Config} config @returns {asserts value is import('../agents/tabular.js').Decision} */
export function validateDecision(value,config){
 const d=exactRecord(value,['state','action','values','probabilities','epsilon','explorationDraw','actionDraw','branch','greedyAction','rule']);stateKeyCheck(config,d.state);integer(d.action,0,3);integer(d.greedyAction,0,3);number(d.epsilon,0,1);
 if(!Array.isArray(d.values)||d.values.length!==4||!Array.isArray(d.probabilities)||d.probabilities.length!==4)throw Error('Invalid action decision.');d.values.forEach(n=>number(n));d.probabilities.forEach(n=>number(n,0,1));
 if(Math.abs(d.probabilities.reduce((a,b)=>a+b,0)-1)>1e-12||d.greedyAction!==d.values.indexOf(Math.max(...d.values)))throw Error('Invalid decision probabilities/tie rule.');
 for(const draw of [d.explorationDraw,d.actionDraw])if(draw!==null)number(draw,0,1-Number.EPSILON/2);
 if(isPolicy(config.algorithm)){if(d.branch!=='policy-sample'||d.epsilon!==0||d.explorationDraw!==null||d.actionDraw===null||d.probabilities.some((v,i)=>Math.abs(v-softmax(/** @type {number[]} */(d.values))[i])>1e-12)||samplePolicy(d.probabilities,Number(d.actionDraw))!==d.action)throw Error('Policy sampling trace mismatch.');}else if(d.branch==='policy-sample')throw Error('Unexpected policy sample.');
 if(!['fixed-policy','exploration','exploitation','policy-sample'].includes(String(d.branch))||typeof d.rule!=='string'||d.rule.length>150)throw Error('Invalid selection rule.');
}
/** @param {unknown} value @param {Config} config @returns {asserts value is import('./run.js').EpisodeRow[]} */
export function validateTrainingRows(value,config){
 if(!Array.isArray(value)||value.length>2000)throw Error('Training history limit exceeded.');let last=-1;
 for(const raw of value){const r=exactRecord(raw,['episode','seed','agentSeed','return','discountedReturn','length','success','terminated','truncated','interrupted','hazards','updates']);integer(r.episode,0,2000);integer(r.length,1,config.rolloutLimit);integer(r.hazards,0,Number(r.length));integer(r.updates,0,Number(r.length)*(1+(config.planningSteps??0)));number(r.return);number(r.discountedReturn);
  for(const k of ['success','terminated','truncated','interrupted'])if(typeof r[k]!=='boolean')throw Error('Invalid episode flag.');
  if(Number(r.episode)<=last||r.seed!==deriveSeed(config.seed,'training/environment/'+r.episode)||r.agentSeed!==deriveSeed(config.seed,'training/agent/'+r.episode)||(config?.lesson==='lab'?(typeof r.success!=='boolean'||r.success&&!r.terminated):r.success!==r.terminated)||Number(r.terminated)+Number(r.truncated)+Number(r.interrupted)!==1||r.truncated&&r.length!==config.rolloutLimit)throw Error('Inconsistent training episode.');last=Number(r.episode);
 }
}
/** @param {unknown} value @param {Config|null} [config] @param {import('../agents/tabular.js').Parameters} [parameters] @returns {asserts value is ReturnType<import('../evaluation/frozen.js').FrozenEvaluation['result']>} */
export function validateEvaluation(value,config=null,parameters){
 const e=exactRecord(value,['rule','seeds','parameterHash','rows','complete','trainingUpdates']);if(e.complete!==true||e.trainingUpdates!==0||!Array.isArray(e.seeds)||e.seeds.length!==5||new Set(e.seeds).size!==5||!Array.isArray(e.rows)||e.rows.length!==5||typeof e.rule!=='string'||e.rule.length>150||typeof e.parameterHash!=='string'||!/^fnv1a32-[a-f0-9]{8}$/.test(e.parameterHash))throw Error('Incomplete frozen evaluation.');e.seeds.forEach(validateSeed);
 if(parameters&&e.parameterHash!==hashData(parameters))throw Error('Evaluation parameter identity mismatch.');
 if(config&&e.rule!==evaluationRule(config))throw Error('Evaluation action rule mismatch.');
 for(const [i,raw]of e.rows.entries()){const r=exactRecord(raw,['seed','return','discountedReturn','length','success','terminated','truncated','hazards']);integer(r.length,1,config?.rolloutLimit??1000);integer(r.hazards,0,Number(r.length));number(r.return);number(r.discountedReturn);
  if(r.seed!==e.seeds[i]||typeof r.terminated!=='boolean'||typeof r.truncated!=='boolean'||r.terminated===r.truncated||(config?.lesson==='lab'?(typeof r.success!=='boolean'||r.success&&!r.terminated):r.success!==r.terminated)||config&&r.truncated&&r.length!==config.rolloutLimit)throw Error('Invalid frozen evaluation row.');
 }
}

/** @param {unknown} raw @param {number} time */
export function validatePolicySample(raw,time){const p=exactRecord(raw,['probabilities','baseline','time']);if(p.time!==time||!Array.isArray(p.probabilities)||p.probabilities.length!==4)throw Error('Invalid policy sample.');p.probabilities.forEach(v=>number(v,0,1));if(Math.abs(p.probabilities.reduce((a,b)=>a+b,0)-1)>1e-12)throw Error('Invalid policy probabilities.');number(p.baseline);}
/** Validate every saved policy calculation against its collected sample.
 * @param {import('../agents/tabular.js').Update} u @param {Config} c @param {import('../agents/tabular.js').Sample[]} samples */
export function validatePolicyUpdate(u,c,samples){
 exactRecord(u,['state','action','old','reward','bootstrap','gamma','target','error','alpha','next','terminated','truncated','method','nextAction','origin','policy']);
 const p=u.policy;if(!p)throw Error('Missing policy update.');exactRecord(p,['probabilities','gradient','preferencesBefore','preferencesAfter','time','discount','actorAlpha','kind','return','criticUpdated','criticBefore']);integer(p.time,0,c.rolloutLimit-1);const s=samples[p.time];if(!s?.policy)throw Error('Missing policy sample for update.');
 for(const a of [p.probabilities,p.gradient,p.preferencesBefore,p.preferencesAfter]){if(!Array.isArray(a)||a.length!==4)throw Error('Invalid actor vector.');a.forEach(n=>number(n));}
 for(const n of [u.old,u.reward,u.bootstrap,u.gamma,u.target,u.error,u.alpha,u.next,p.criticBefore,p.discount,p.actorAlpha])number(n);
 const episodic=c.algorithm!=='actor-critic',critic=c.algorithm!=='reinforce';let target=u.reward+c.gamma*u.bootstrap;
 if(episodic){target=0;for(let i=samples.length-1;i>=p.time;i--)target=samples[i].reward+c.gamma*target;if(!samples.at(-1)?.terminated||u.bootstrap!==0)throw Error('REINFORCE requires a complete return.');}
 if(u.state!==s.state||u.action!==s.action||u.reward!==s.reward||u.terminated!==s.terminated||u.truncated!==s.truncated||u.method!==c.algorithm||u.nextAction!==null||u.origin!=='real'||u.old!==s.policy.baseline||u.target!==target||u.error!==u.target-u.old||u.gamma!==c.gamma||u.alpha!==(critic?c.alpha:0)||u.next!==p.criticBefore+u.alpha*u.error||u.terminated&&u.bootstrap!==0)throw Error('Policy signal arithmetic mismatch.');
 if(p.kind!==(episodic?'return':'td')||p.return!==(episodic?target:null)||p.criticUpdated!==critic||p.discount!==Math.pow(c.gamma,p.time)||p.actorAlpha!==c.alpha||JSON.stringify(p.probabilities)!==JSON.stringify(s.policy.probabilities)||JSON.stringify(p.gradient)!==JSON.stringify(scoreGradient(p.probabilities,s.action))||p.preferencesAfter.some((v,i)=>v!==p.preferencesBefore[i]+p.actorAlpha*p.discount*u.error*p.gradient[i]))throw Error('Policy gradient arithmetic mismatch.');
}
