import {validateRunCheckpoint} from '../training/run.js';
import {expectedUpdates} from '../agents/deep/schema.js';
import {comparisonVariants,comparisonBudgets,expectedReplicates,isAdvanced} from './comparison.js';
import {capabilities} from '../agents/tabular.js';
import {validateConfig,hashData} from '../training/config.js';
import {exactRecord,number,validateParameters,validateTrainingRows,validateEvaluation} from '../training/validation.js';
import {integer} from '../environment/schema.js';
import {deriveSeed,validateSeed} from '../environment/rng.js';
/** @param {unknown} v @param {number} max */
function text(v,max){if(typeof v!=='string'||!v.trim()||v.length>max)throw Error('Invalid comparison text.');}
/** Validate legacy episode comparisons and additive equal-real-budget comparisons.
 * @param {unknown} raw @param {string} lesson
 */
export function validateComparison(raw,lesson){
 const c=/** @type {import('./comparison.js').Comparison} */(raw);validateConfig(c.config);const advanced=isAdvanced(c.config);
 exactRecord(c,['id','config','prediction','episodes','seeds','evaluationSeeds','runs','status','createdAt','finishedAt','smoothing',...(advanced?['realBudget']:[]),...(['09','10'].includes(c.config.lesson)?['failures']:[])]);
 if(c.config.lesson!==lesson||!['pending','complete','cancelled'].includes(c.status)||!Array.isArray(c.runs)||c.runs.length>expectedReplicates(c))throw Error('Invalid comparison.');
 if(['09','10'].includes(c.config.lesson)){if(!Array.isArray(c.failures)||c.failures.length>1||c.status==='complete'&&c.failures.length)throw Error('Invalid failed-run evidence.');for(const f of c.failures){exactRecord(f,['reason','checkpoint']);text(f.reason,300);validateRunCheckpoint(f.checkpoint);if(!f.checkpoint.parameters.deep?.failure||!c.seeds.includes(f.checkpoint.config.seed)||!comparisonVariants(c.config).some(v=>hashData({...v.config,seed:f.checkpoint.config.seed})===hashData(f.checkpoint.config)))throw Error('Failure configuration mismatch.');}}
 if(advanced){integer(c.realBudget,60,1500);if(c.episodes!==0)throw Error('Real-budget comparison cannot claim an episode budget.');}else integer(c.episodes,20,300);
 for(const [seeds,namespace]of /** @type {[number[],string][]} */([[c.seeds,'independent-training/'],[c.evaluationSeeds,'held-out-evaluation/']])){if(!Array.isArray(seeds)||seeds.length!==5||new Set(seeds).size!==5)throw Error('Five independent seeds required.');seeds.forEach((s,i)=>{validateSeed(s);if(s!==deriveSeed(c.config.seed,namespace+i))throw Error('Comparison seed provenance mismatch.');});}
 exactRecord(c.prediction,['answer','at']);text(c.prediction.answer,300);text(c.prediction.at,30);text(c.createdAt,30);text(c.id,100);if(c.finishedAt!==null)text(c.finishedAt,30);
 exactRecord(c.smoothing,['type','window','definition']);if(c.smoothing.window!==7||c.smoothing.type!=='trailing arithmetic mean')throw Error('Unsupported smoothing.');text(c.smoothing.definition,300);
 const pairs=new Set();for(const r of c.runs){
  exactRecord(r,['algorithm','seed','config','parameters','training','interactions','updates','evaluation','rmse','timing',...(advanced?['variant','planningUpdates','partial','curve']:[])]);
  const variant=comparisonVariants(c.config).find(v=>v.id===(r.variant??r.algorithm)),key=(r.variant??r.algorithm)+':'+r.seed;
  if(!variant||pairs.has(key)||!c.seeds.includes(r.seed)||hashData({...variant.config,seed:r.seed})!==hashData(r.config)||r.algorithm!==r.config.algorithm)throw Error('Incompatible or duplicate comparison runs.');pairs.add(key);
  validateConfig(r.config);validateParameters(r.parameters,r.config);validateTrainingRows(r.training,r.config);validateEvaluation(r.evaluation,r.config,r.parameters);
  exactRecord(r.timing,['trainingComputeMs','evaluationComputeMs']);number(r.timing.trainingComputeMs,0,1e9);number(r.timing.evaluationComputeMs,0,1e9);integer(r.interactions,0,300000);integer(r.updates,0,6300000);
  if(r.updates!==r.parameters.updates||r.training.some(row=>row.interrupted)||JSON.stringify(r.evaluation.seeds)!==JSON.stringify(c.evaluationSeeds))throw Error('Comparison work/evaluation mismatch.');
  if(capabilities[c.config.algorithm].prediction)number(r.rmse,0,1e9);else if(r.rmse!==null)throw Error('Unexpected prediction error.');
  if(advanced){
   const partial=exactRecord(r.partial,['length','return','terminated','truncated']);integer(partial.length,0,r.config.rolloutLimit);number(partial.return);if(typeof partial.terminated!=='boolean'||typeof partial.truncated!=='boolean'||partial.terminated&&partial.truncated||(partial.terminated||partial.truncated)&&(partial.length!==0||partial.return!==0))throw Error('Invalid partial rollout.');
   if(r.interactions!==c.realBudget||r.interactions!==r.training.reduce((s,row)=>s+row.length,0)+Number(partial.length)||r.updates!==expectedUpdates(r.config,r.interactions)||r.planningUpdates!==r.interactions*(r.config.planningSteps??0))throw Error('Unequal real/planning budget.');
   if(!Array.isArray(r.curve)||r.curve.length!==3)throw Error('Missing equal-budget checkpoints.');
   for(const [i,p]of r.curve.entries()){exactRecord(p,['interactions','updates','planningUpdates','evaluation','rmse']);if(p.interactions!==comparisonBudgets(c)[i]||p.updates!==expectedUpdates(r.config,p.interactions)||p.planningUpdates!==p.interactions*(r.config.planningSteps??0))throw Error('Unfair curve budget.');validateEvaluation(p.evaluation,r.config,i===2?r.parameters:undefined);if(JSON.stringify(p.evaluation.seeds)!==JSON.stringify(c.evaluationSeeds))throw Error('Curve evaluation seeds differ.');if(capabilities[r.algorithm].prediction)number(p.rmse,0,1e9);else if(p.rmse!==null)throw Error('Unexpected curve RMSE.');}
   if(hashData(r.curve[2].evaluation)!==hashData(r.evaluation)||r.curve[2].rmse!==r.rmse)throw Error('Final curve differs from final result.');
  }else if(r.training.length!==c.episodes||r.interactions!==r.training.reduce((s,row)=>s+row.length,0))throw Error('Comparison episode budget mismatch.');
 }
 if(c.status==='complete'&&(c.runs.length!==expectedReplicates(c)||!c.finishedAt))throw Error('Comparison has not completed.');
}
