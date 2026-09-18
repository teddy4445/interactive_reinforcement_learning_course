import {decodeState} from '../features.js';
import {record,integer,stateKey,validateState} from '../../environment/schema.js';
/** @typedef {{replay:boolean,target:boolean,capacity:number,batch:number,targetEvery:number}} DeepConfig */
/** @typedef {import('../tabular.js').Sample & {id:number}} ReplayItem */
/** @typedef {{capacity:number,cursor:number,seen:number,items:ReplayItem[]}} ReplayState */
/** @typedef {{update:number,interaction:number,loss:number,meanAbsTd:number,gradientNorm:number,parameterDeltaNorm:number,maxAbsQ:number,targetSync:boolean}} NeuralMetric */
/** @typedef {{library:string,version:string,backend:string,dtype:string}} NeuralRuntime */
/** @typedef {{schemaVersion:1,online:number[][],target:number[][],replay:ReplayState,replayRng:import('../../environment/types.js').RngSnapshot,initSeed:number,targetCopies:number,optimizer:{name:'sgd',learningRate:number,iterations:number,slots:never[]},metrics:NeuralMetric[],failure:{interaction:number,reason:string}|null,runtime:NeuralRuntime}} DeepParameters */
/** @typedef {{batchSize:number,replayIds:number[],loss:number,meanAbsTd:number,gradientNorm:number,parameterDeltaNorm:number,targetCopied:boolean,targetCopies:number,weightBefore:number,weightAfter:number}} DeepUpdate */
export const TF_VERSION='4.22.0';
export const HIDDEN=16;
/** Full enabled observation variables; no renderer state enters the network.
 * @param {import('../../environment/types.js').Scenario} scenario */
export function vectorEncoder(scenario){const bits=scenario.features.collectibles?scenario.grid.join('').split('C').length-1:0,names=['x normalized','y normalized',...Array.from({length:bits},(_,i)=>'consumed supply '+i),...(scenario.features.battery!==null?['battery normalized']:[]),...(scenario.features.horizon!==null?['remaining time normalized']:[])];return {names,dimension:names.length,encode:(/** @type {string} */key)=>{const s=validateState(scenario,decodeState(key));return [2*s.x/Math.max(1,scenario.grid[0].length-1)-1,2*s.y/Math.max(1,scenario.grid.length-1)-1,...Array.from({length:bits},(_,i)=>Number(Boolean((s.collected??0)&(1<<i)))),...(scenario.features.battery!==null?[(s.battery??0)/scenario.features.battery]:[]),...(scenario.features.horizon!==null?[(s.remaining??0)/scenario.features.horizon]:[])];}};}
/** @param {number} dimension */
export const weightShapes=dimension=>[[dimension,HIDDEN],[HIDDEN],[HIDDEN,HIDDEN],[HIDDEN],[HIDDEN,4],[4]];
/** @param {import('../../training/config.js').Config} c @param {number} interactions */
export const expectedUpdates=(c,interactions)=>c.algorithm==='dqn'?Math.max(0,interactions-(c.deep?.batch??16)+1):interactions*(1+(c.planningSteps??0));
/** @param {number} reward @param {boolean} terminated @param {number} gamma @param {number} nextMax */
export function tdTarget(reward,terminated,gamma,nextMax){return reward+(terminated?0:gamma*nextMax);}
/** @param {DeepConfig} d */
export function validateDeepConfig(d){record(d,['replay','target','capacity','batch','targetEvery']);if(typeof d.replay!=='boolean'||typeof d.target!=='boolean')throw Error('Declare replay and target-network switches.');integer(d.capacity,32,2048);integer(d.batch,4,32);integer(d.targetEvery,1,200);if(d.batch>d.capacity)throw Error('Batch exceeds replay capacity.');}
/** Serialization stores only bounded data, never arbitrary model topology or executable code. */
export class ReplayBuffer {
 /** @param {number} capacity @param {ReplayState} [state] */
 constructor(capacity,state){this.state=structuredClone(state??{capacity,cursor:0,seen:0,items:[]});}
 /** @param {import('../tabular.js').Sample} sample */
 push(sample){const s=this.state;s.seen++;s.items[s.cursor]={...structuredClone(sample),id:s.seen};s.cursor=(s.cursor+1)%s.capacity;}
 /** With replacement for replay; recent chronological batch for the no-replay ablation.
  * @param {number} count @param {ReturnType<typeof import('../../environment/rng.js').createRng>} rng @param {boolean} replay */
 sample(count,rng,replay=true){if(count>this.state.items.length||count<1)throw Error('Replay warmup incomplete.');return replay?Array.from({length:count},()=>this.state.items[Math.floor(rng.next()*this.state.items.length)]):[...this.state.items].sort((a,b)=>b.id-a.id).slice(0,count).reverse();}
 snapshot(){return structuredClone(this.state);}
}
/** The tiny supported neural maps contain only position; display caches cover every valid position.
 * @param {import('../../environment/types.js').Scenario} scenario */
export const neuralStates=scenario=>scenario.grid.flatMap((row,y)=>[...row].flatMap((tile,x)=>tile==='#'?[]:[stateKey({x,y})]));
