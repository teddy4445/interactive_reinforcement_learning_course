import { foundations, lessonScenario } from '../content/foundations.js';
import { IslandEnvironment } from '../environment/engine.js';
import { baseline } from './calculations.js';
/** @typedef {import('../content/foundations.js').FoundationId} FoundationId */
/** @typedef {{actions:import('../environment/types.js').Action[],checkpoint:string}} Episode */
/** @typedef {{answer:string,at:string}} Prediction */
/** @typedef {{stage:'observe'|'math'|'challenge',answers:string[],at:string,trial:number|null}} Attempt */
/** @typedef {{config:import('./calculations.js').Config,prediction:Prediction,result:import('./calculations.js').Calculation|null}} Trial */
/** @typedef {{stage:number,prediction:Prediction|null,play:Episode,mission:Episode|null,math:import('./calculations.js').Calculation|null,experiments:Trial[],attempts:Attempt[],reflection:string,reflectionAt:string|null,completedAt:string|null}} LessonRecord */
/** @param {FoundationId} id @returns {LessonRecord} */
export function emptyLesson(id) {
  return { stage:0,prediction:null,play:{actions:[],checkpoint:new IslandEnvironment(lessonScenario(id),{seed:7,rolloutLimit:80}).serialize()},mission:null,math:null,experiments:[],attempts:[],reflection:'',reflectionAt:null,completedAt:null };
}
/** Replay evidence through the shared engine. @param {FoundationId} id @param {Episode} episode */
export function replayEpisode(id, episode) {
  const env = new IslandEnvironment(lessonScenario(id), {seed:7,rolloutLimit:80});
  const traces = episode.actions.map((a) => env.step(a).trace);
  if (traces.some((t) => !t) || env.serialize() !== episode.checkpoint) throw new Error('Episode evidence does not replay.');
  return { env, traces };
}
/** @param {FoundationId} id @param {Episode} episode */
export function missionPassed(id, episode) {
  const {env} = replayEpisode(id, episode);
  return id === '01' ? env.getInfo().terminated && env.getInfo().reason === 'goal' && episode.actions.length <= 6 : episode.actions.length >= 2;
}
/** @param {string} answer @param {number} expected */
const close = (answer,expected) => answer.trim() !== '' && Number.isFinite(Number(answer)) && Math.abs(Number(answer)-expected) <= .01;
/** Deterministic explicit checks only. Free text never reaches grading code.
 * @param {FoundationId} id @param {LessonRecord} record @param {Attempt} attempt
 */
export function checkAttempt(id, record, attempt) {
  const content = foundations[id];
  if (attempt.stage === 'observe') return attempt.answers[0] === content.observeCheck.correct;
  if (attempt.stage === 'math') return close(attempt.answers[0] ?? '', content.mathAnswer);
  const trial = attempt.trial === null ? undefined : record.experiments[attempt.trial];
  if (id !== '01' && !trial?.result) return false;
  const expected = id === '02' && trial ? 6*(1-trial.config.parameter)-1 : id === '03' && trial ? -1+5*trial.config.parameter : content.challengeAnswer;
  return close(attempt.answers[0] ?? '', expected) && attempt.answers[1] === content.challengeCheck.correct;
}
/** Completion is derived from evidence, never the current stage or a Next click.
 * @param {FoundationId} id @param {LessonRecord} record
 */
export function requirements(id, record) {
  const experiment = [...record.experiments].reverse().find((t) => t.result);
  const result = experiment?.result;
  const calibrated = result && (id === '01' || result.converged.every(Boolean) && result.residuals.every((r) => r <= 1e-6) && (id !== '03' || Math.max(...result.values[0].map((v,i) => Math.abs(v-result.values[1][i]))) <= 1e-6));
  return [
    {label:'Observe concept check',done:record.attempts.some((a) => a.stage === 'observe' && checkAttempt(id,record,a))},
    {label:'Prediction recorded before results',done:record.prediction !== null},
    {label:id === '01' ? 'Reach the campsite in at most 6 actions' : 'At least two accepted actions',done:record.mission !== null && missionPassed(id,record.mission)},
    {label:'Worked calculation and numerical check',done:record.math !== null && record.attempts.some((a) => a.stage === 'math' && checkAttempt(id,record,a))},
    {label:id === '03' ? 'Compare both converged planners on the same task' : 'Changed-parameter experiment with a prior prediction',done:Boolean(calibrated)},
    {label:'Challenge numerical and concept checks',done:record.attempts.some((a) => a.stage === 'challenge' && checkAttempt(id,record,a))}
  ];
}
/** @param {FoundationId} id @param {LessonRecord|undefined} record */
export function completion(id, record) { return Boolean(record && requirements(id,record).every((r) => r.done)); }
/** @param {LessonRecord|undefined} record */
export function started(record) { return Boolean(record && (record.prediction || record.attempts.length || record.play.actions.length || record.reflection)); }
/** @param {FoundationId} id @param {LessonRecord} record */
export function markCompletion(id,record) {
  const done = completion(id,record);
  if (done && !record.completedAt) record.completedAt = new Date().toISOString();
  if (!done) record.completedAt = null;
}
/** @param {FoundationId} id */
export const mathConfig = (id) => ({lesson:id,phase:/** @type {const} */('math'),parameter:baseline(id)});



