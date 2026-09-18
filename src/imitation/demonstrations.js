import {IslandEnvironment} from '../environment/engine.js';
import {ACTIONS,record,stateKey,integer} from '../environment/schema.js';
import {validateSeed} from '../environment/rng.js';
import {learningScenario,hashData} from '../training/config.js';
import {exactRecord} from '../training/validation.js';
import {parseBoundedJson} from '../persistence/bounded-json.js';
/** @typedef {'train'|'holdout'} Split */
/** @typedef {{id:number,split:Split,seed:number,traces:import('../environment/types.js').StepTrace[],end:'active'|'terminated'|'truncated'|'stopped'}} Trajectory */
/** @typedef {{schemaVersion:1,representation:'full-position-softmax-v1',actions:string[],trajectories:Trajectory[]}} Dataset */
export const MAX_DATASET_BYTES=1500000;
/** Same dynamics and coordinates, different initial states. No new-layout transfer claim. @param {Split} split */
export function demonstrationScenario(split){const scenario=learningScenario('11');if(split==='holdout'){scenario.id='imitation-heldout';scenario.start={x:0,y:0};scenario.name='Held-out upper start';}return scenario;}
/** @returns {Dataset} */
export const emptyDataset=()=>({schemaVersion:1,representation:'full-position-softmax-v1',actions:[...ACTIONS],trajectories:[]});
/** IDs stay valid after importing arbitrary supported IDs. @param {Dataset} dataset */
export function nextTrajectoryId(dataset){const ids=new Set(dataset.trajectories.map(t=>t.id));let id=1;while(ids.has(id))id++;return id;}
/** Records the environment's own pre-action observation and action. Never pairs an action with its successor. */
export class DemonstrationRecorder{
 /** @type {IslandEnvironment} */ environment;
 /** @param {Split} split @param {number} seed @param {number} id @param {Trajectory} [saved] */
 constructor(split,seed,id,saved){this.environment=new IslandEnvironment(demonstrationScenario(split),{seed,rolloutLimit:80});this.trajectory=/** @type {Trajectory} */({id,split,seed,traces:[],end:'active'});if(saved){for(const trace of saved.traces)this.act(trace.action);this.trajectory=structuredClone(saved);}}
 /** @param {import('../environment/types.js').Action} action */
 act(action){if(this.trajectory.end!=='active')throw Error('Start a new trajectory before moving.');const result=this.environment.step(action);if(!result.advanced||!result.trace)throw Error('Episode stopped.');this.trajectory.traces.push(result.trace);if(result.terminated)this.trajectory.end='terminated';else if(result.truncated)this.trajectory.end='truncated';return result.trace;}
 stop(){if(!this.trajectory.traces.length)throw Error('Record at least one action.');if(this.trajectory.end==='active')this.trajectory.end='stopped';}
}
/** @param {Dataset} dataset @param {Split} split */
export const pairs=(dataset,split)=>dataset.trajectories.filter(t=>t.split===split&&t.end!=='active').flatMap(t=>t.traces.map(trace=>({state:stateKey(trace.observation),action:ACTIONS.indexOf(trace.action)})));
/** @param {unknown} value @returns {Dataset} */
export function validateDataset(value){const d=exactRecord(value,['schemaVersion','representation','actions','trajectories']);if(d.schemaVersion!==1||d.representation!=='full-position-softmax-v1'||JSON.stringify(d.actions)!==JSON.stringify(ACTIONS)||!Array.isArray(d.trajectories)||d.trajectories.length>16)throw Error('Unsupported demonstration dataset.');
 let count=0;const ids=new Set();let active=0;
 for(const value of d.trajectories){const t=exactRecord(value,['id','split','seed','traces','end']);integer(t.id,1,10000);validateSeed(t.seed);if(ids.has(t.id))throw Error('Duplicate trajectory ID.');ids.add(t.id);if(!['train','holdout'].includes(String(t.split))||!['active','terminated','truncated','stopped'].includes(String(t.end))||!Array.isArray(t.traces)||t.traces.length>80)throw Error('Invalid trajectory.');if(t.end==='active')active++;else if(!t.traces.length)throw Error('Empty saved trajectory.');count+=t.traces.length;
 const env=new IslandEnvironment(demonstrationScenario(/** @type {Split} */(t.split)),{seed:Number(t.seed),rolloutLimit:80});for(const trace of t.traces){record(trace,['schemaVersion','step','state','observation','action','movement','collision','reward','rewardParts','nextState','nextObservation','terminated','truncated','reason','draw','probability','outcomes','scenarioHash']);const actual=env.step(trace.action);if(!actual.advanced||hashData(actual.trace)!==hashData(trace))throw Error('Demonstration state/action alignment or environment replay mismatch.');}
 const info=env.getInfo();if((t.end==='terminated')!==info.terminated||(t.end==='truncated')!==info.truncated)throw Error('Trajectory end mismatch.');
 }
 if(count>1024||active>1)throw Error('Dataset limit: 1,024 actions and one active trajectory.');return structuredClone(/** @type {Dataset} */(d));
}
/** @param {Dataset} dataset */
export function exportDataset(dataset){validateDataset(dataset);return JSON.stringify({format:'rl-island-demonstrations',schemaVersion:1,kind:'self-reported-manual-trajectories',dataset,digest:hashData(dataset)});}
/** Validate entirely before offering replacement; no arbitrary scenarios or code. @param {string} text */
export function importDataset(text){const e=exactRecord(parseBoundedJson(text,MAX_DATASET_BYTES),['format','schemaVersion','kind','dataset','digest']);if(e.format!=='rl-island-demonstrations'||e.schemaVersion!==1||e.kind!=='self-reported-manual-trajectories'||e.digest!==hashData(e.dataset))throw Error('Unsupported demonstration envelope or checksum mismatch.');return validateDataset(e.dataset);}
