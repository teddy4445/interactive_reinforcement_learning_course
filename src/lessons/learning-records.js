import {imitationCheck,imitationRequirements} from '../imitation/records.js';
import { learningLessons } from '../content/model-free.js';
import { observedWinner,expectedReplicates } from '../evaluation/comparison.js';
/** @typedef {import('../content/model-free.js').LearningId} LearningId */
/** @typedef {{stage:'observe'|'math'|'challenge',answers:string[],comparisonId:string|null,at:string}} LearningAttempt */
/** @typedef {{stage:number,prediction:{answer:string,at:string}|null,attempts:LearningAttempt[],play:{interactions:number,updates:number,episodes:number,configHash:string}|null,evaluations:{runId:string,result:ReturnType<import('../evaluation/frozen.js').FrozenEvaluation['result']>}[],comparisons:import('../evaluation/comparison.js').Comparison[],reflection:string,reflectionAt:string|null,activeRunId:string|null,runIds:string[],configVersion:number,completedAt:string|null,imitation?:import('../imitation/records.js').ImitationRecord}} LearningRecord */
/** @returns {LearningRecord} */
export const emptyLearningRecord=()=>({stage:0,prediction:null,attempts:[],play:null,comparisons:[],evaluations:[],reflection:'',reflectionAt:null,activeRunId:null,runIds:[],configVersion:0,completedAt:null});
/** @param {LearningId} id @param {LearningRecord} record @param {LearningAttempt} attempt */
export function learningCheck(id,record,attempt){
 if(id==='11')return imitationCheck(record,attempt);
 const content=learningLessons[id];
 if(attempt.stage==='observe')return attempt.answers[0]===content.correct;
 if(attempt.stage==='math')return content.answers.every((n,i)=>attempt.answers[i]?.trim()&&Number.isFinite(Number(attempt.answers[i]))&&Math.abs(Number(attempt.answers[i])-n)<=.001);
 const comparison=record.comparisons.find(c=>c.id===attempt.comparisonId&&c.status==='complete');
 return Boolean(comparison&&attempt.answers[0]===observedWinner(comparison)&&attempt.answers[1]===content.challengeCorrect);
}
/** @param {LearningId} id @param {LearningRecord} record */
export function learningRequirements(id,record){
 if(id==='11')return imitationRequirements(record);
 return [
 {label:'Observe concept check',done:record.attempts.some(a=>a.stage==='observe'&&learningCheck(id,record,a))},
 {label:'Prediction saved before results',done:record.prediction!==null},
 {label:'Actual episode and learning updates',done:Boolean(record.play&&record.play.episodes>=1&&record.play.updates>=1)},
 {label:'Two explicit numerical update checks',done:record.attempts.some(a=>a.stage==='math'&&learningCheck(id,record,a))},
 {label:'Five independent agents per method with frozen evaluation',done:record.comparisons.some(c=>c.status==='complete'&&c.runs.length===expectedReplicates(c)&&c.runs.every(r=>r.evaluation.complete))},
 {label:'Evidence-based comparison and concept check',done:record.attempts.some(a=>a.stage==='challenge'&&learningCheck(id,record,a))}
 ];
}
/** @param {LearningId} id @param {LearningRecord|undefined} record */
export const learningComplete=(id,record)=>Boolean(record&&learningRequirements(id,record).every(r=>r.done));
