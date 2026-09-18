import { ACTIONS, record } from '../environment/schema.js';
import { calculate } from '../lessons/calculations.js';
import { completion, emptyLesson, markCompletion, replayEpisode } from '../lessons/records.js';
/** @typedef {import('../content/foundations.js').FoundationId} FoundationId */
/** @typedef {import('../lessons/records.js').LessonRecord} LessonRecord */
/** @typedef {{schemaVersion:1,curriculumVersion:'foundations-v1',lastLesson:FoundationId|null,lessons:Partial<Record<FoundationId,LessonRecord>>}} Progress */
export const PROGRESS_KEY = 'rl-island:progress:v1';
export const MAX_PROGRESS_BYTES = 524288;
const ids = ['01','02','03'];
/** @returns {Progress} */
export const emptyProgress = () => ({schemaVersion:1,curriculumVersion:'foundations-v1',lastLesson:null,lessons:{}});
/** @param {unknown} value @param {number} max */
function string(value,max) { if (typeof value !== 'string' || value.length > max) throw new Error('Invalid or oversized text.'); return value; }
/** @param {unknown} value */
function timestamp(value) { const text = string(value,30); if (!/^\d{4}-\d{2}-\d{2}T/.test(text) || !Number.isFinite(Date.parse(text))) throw new Error('Invalid timestamp.'); }
/** @param {unknown} value @param {number} max */
function array(value,max) { if (!Array.isArray(value) || value.length > max) throw new Error('Invalid or oversized list.'); return value; }
/** @param {unknown} value */
function prediction(value) { const v = record(value,['answer','at']); string(v.answer,300); if (!String(v.answer).trim()) throw new Error('Prediction is empty.'); timestamp(v.at); }
/** @param {unknown} value @param {FoundationId} id */
function config(value,id) { const c = record(value,['lesson','phase','parameter']); if (c.lesson !== id) throw new Error('Wrong lesson configuration.'); return /** @type {import('../lessons/calculations.js').Config} */ (c); }
/** @param {unknown} value @param {FoundationId} id */
function calculation(value,id) {
  const c = record(value,['config','context','scenarioHash','algorithms','values','sweeps','residuals','converged']);
  const expected = calculate(config(c.config,id)).summary;
  for (const field of ['context','scenarioHash','algorithms','values','sweeps','residuals','converged']) {
    if (JSON.stringify(c[field]) !== JSON.stringify(expected[/** @type {keyof typeof expected} */(field)])) throw new Error('Calculation evidence does not match its configuration.');
  }
}
/** @param {unknown} input @returns {Progress} */
export function validateProgress(input) {
  const value = record(input,['schemaVersion','curriculumVersion','lastLesson','lessons']);
  if (value.schemaVersion !== 1 || value.curriculumVersion !== 'foundations-v1') throw new Error('Unsupported progress/curriculum version.');
  if (value.lastLesson !== null && !ids.includes(String(value.lastLesson))) throw new Error('Unknown resume lesson.');
  const entries = record(value.lessons,ids);
  for (const [key,raw] of Object.entries(entries)) {
    const id = /** @type {FoundationId} */ (key);
    const r = record(raw,['stage','prediction','play','mission','math','experiments','attempts','reflection','reflectionAt','completedAt']);
    if (!Number.isInteger(r.stage) || Number(r.stage) < 0 || Number(r.stage) > 5) throw new Error('Invalid stage.');
    if (r.prediction !== null) prediction(r.prediction);
    for (const item of [r.play,...(r.mission === null ? [] : [r.mission])]) {
      const episode = record(item,['actions','checkpoint']);
      const actions = array(episode.actions,80);
      if (actions.some((a) => !ACTIONS.includes(a)) || id === '02' && actions.some((a) => a !== 'right')) throw new Error('Unsupported lesson action.');
      string(episode.checkpoint,65536);
      replayEpisode(id,/** @type {import('../lessons/records.js').Episode} */(episode));
    }
    if (r.math !== null) { calculation(r.math,id); if (/** @type {import('../lessons/calculations.js').Calculation} */(r.math).config.phase !== 'math') throw new Error('Wrong worked-example phase.'); }
    for (const trial of array(r.experiments,12)) {
      const t = record(trial,['config','prediction','result']);
      const cfg = config(t.config,id);
      if (cfg.phase !== 'experiment') throw new Error('Wrong experiment phase.');
      calculate(cfg); prediction(t.prediction);
      if (t.result !== null) {
        calculation(t.result,id);
        if (JSON.stringify(/** @type {import('../lessons/calculations.js').Calculation} */(t.result).config) !== JSON.stringify(cfg)) throw new Error('Experiment result configuration differs from its prediction.');
      }
    }
    for (const attempt of array(r.attempts,60)) {
      const a = record(attempt,['stage','answers','at','trial']);
      if (!['observe','math','challenge'].includes(String(a.stage))) throw new Error('Unknown check.');
      if (a.trial !== null && (!Number.isInteger(a.trial) || Number(a.trial) < -1 || Number(a.trial) >= /** @type {unknown[]} */(r.experiments).length)) throw new Error('Invalid challenge experiment reference.');
      const answers = array(a.answers,2); answers.forEach((answer) => string(answer,300)); timestamp(a.at);
    }
    string(r.reflection,2000);
    if (r.reflectionAt !== null) timestamp(r.reflectionAt);
    if (r.completedAt !== null) timestamp(r.completedAt);
    if (!r.prediction && (/** @type {import('../lessons/records.js').Episode} */(r.play).actions.length || r.math || /** @type {unknown[]} */(r.experiments).length)) throw new Error('Results require a prior prediction.');
    if (Boolean(r.completedAt) !== completion(id,/** @type {LessonRecord} */(r))) throw new Error('Completion does not match activity evidence.');
  }
  return structuredClone(/** @type {Progress} */(value));
}
/** Bounded JSON before allocating lesson records. @param {string} text */
function parse(text) {
  if (text.length > MAX_PROGRESS_BYTES || new TextEncoder().encode(text).length > MAX_PROGRESS_BYTES) throw new Error('Progress file exceeds 512 KiB.');
  const value = JSON.parse(text);
  // JSON.parse otherwise silently accepts duplicate object keys, losing records.
  /** @type {({keys:Set<string>,expectKey:boolean}|null)[]} */ const scopes=[];
  for (const token of text.match(/"(?:\\.|[^"\\])*"|[{}[\],:]/g) ?? []) {
    if (token === '{') scopes.push({keys:new Set(),expectKey:true});
    else if (token === '[') scopes.push(null);
    else if (token === '}' || token === ']') scopes.pop();
    else {
      const scope=scopes[scopes.length-1];
      if (scope && token === ',') scope.expectKey=true;
      else if (scope?.expectKey && token.startsWith('"')) {
        const key=JSON.parse(token);
        if (scope.keys.has(key)) throw new Error('Duplicate JSON record field.');
        scope.keys.add(key); scope.expectKey=false;
      }
    }
  }
  return value;
}
/** Noncryptographic accidental-corruption checksum; never grade authentication. @param {unknown} value */
function digest(value) {
  let hash = 2166136261;
  for (const char of JSON.stringify(value)) hash = Math.imul(hash ^ char.charCodeAt(0),16777619) >>> 0;
  return 'fnv1a32-' + hash.toString(16).padStart(8,'0');
}
/** @param {Progress} progress */
export function exportProgress(progress) {
  const payload = validateProgress(progress);
  return JSON.stringify({format:'rl-island-progress',schemaVersion:1,kind:'self-reported-learning-artifact',createdAt:new Date().toISOString(),payload,digest:digest(payload)},null,2);
}
/** @param {string} text */
export function importProgress(text) {
  const envelope = record(parse(text),['format','schemaVersion','kind','createdAt','payload','digest']);
  if (envelope.format !== 'rl-island-progress' || envelope.schemaVersion !== 1 || envelope.kind !== 'self-reported-learning-artifact') throw new Error('Unsupported progress export.');
  timestamp(envelope.createdAt);
  if (envelope.digest !== digest(envelope.payload)) throw new Error('Progress checksum does not match.');
  return validateProgress(envelope.payload);
}
export class ProgressStore {
  blockedSave = false;
  /** @type {Progress} */ data = emptyProgress();
  message = 'Activities save on this device. Exports are self-reported learning artifacts.';
  /** @param {Pick<Storage,'getItem'|'setItem'>} storage */
  constructor(storage) {
    this.storage = storage;
    try { const saved = storage.getItem(PROGRESS_KEY); if (saved) this.data = validateProgress(parse(saved)); }
    catch { this.blockedSave = true; this.message = 'Saved progress could not be read. Memory-only progress is available; the existing stored record has not been replaced.'; }
  }
  /** @param {FoundationId} id */
  lesson(id) { return this.data.lessons[id] ??= emptyLesson(id); }
  /** @param {FoundationId} id */
  save(id) {
    markCompletion(id,this.lesson(id)); this.data.lastLesson = id;
    this.persist();
  }
  persist() {
    try {
      if (this.blockedSave) throw new Error('Preserve unreadable stored progress until explicit replacement.');
      const text = JSON.stringify(this.data);
      if (new TextEncoder().encode(text).length > MAX_PROGRESS_BYTES) throw new Error('Progress storage limit reached.');
      this.storage.setItem(PROGRESS_KEY,text);
      this.message = 'Progress saved on this device. Reflections are saved without automatic grading.';
    } catch { this.message = this.blockedSave ? 'Could not save over unreadable stored progress. The existing record is preserved. Export a backup of your memory-only activities; use explicit import to replace the stored record.' : 'Could not save: storage is unavailable or full. Keep this tab open and export a backup; current progress remains in memory.'; }
  }
  /** Validated preview precedes explicit UI replacement. @param {Progress} data */
  replace(data) { this.data = validateProgress(data); this.blockedSave=false; this.persist(); }
}


