import { integer,validateState } from '../environment/schema.js';
/** @typedef {import('../environment/types.js').Scenario} Scenario */
/** @typedef {import('../environment/types.js').State} State */
/** @typedef {'informative'|'aliased'|'local-goal'} Representation */
/** Parse the canonical full-state key. Never discard inventory from the task state.
 * @param {string} key @returns {State}
 */
export function decodeState(key){
 const match=/^(\d+),(\d+)(?:\|c=(\d+))?(?:\|b=(\d+))?(?:\|t=(\d+))?$/.exec(key);if(!match)throw Error('Invalid full-state key.');
 return {x:Number(match[1]),y:Number(match[2]),...(match[3]!==undefined?{collected:Number(match[3])}:{}),...(match[4]!==undefined?{battery:Number(match[4])}:{}),...(match[5]!==undefined?{remaining:Number(match[5])}:{})};
}
/** Compact shared features, bounded by 1/sqrt(d); informative encoding retains every enabled variable.
 * Aliasing is an explicit teaching ablation, never a change to the environment observation.
 * @param {Scenario} scenario @param {Representation} [representation]
 */
export function featureEncoder(scenario,representation='informative'){
 if(representation==='local-goal'){
  if(scenario.features.collectibles||scenario.features.battery!==null||scenario.features.horizon!==null||scenario.observation!=='full')throw Error('Local-goal features require a static fully observed map.');
  const goals=scenario.grid.flatMap((row,y)=>[...row].flatMap((tile,x)=>tile==='G'?[{x,y}]:[]));if(goals.length!==1)throw Error('Local-goal features require exactly one goal.');
  const names=['bias','goal dx / width','goal dy / height','normalized goal Manhattan distance','wall up','wall right','wall down','wall left','hazard up','hazard right','hazard down','hazard left'],dimension=names.length,scale=1/Math.sqrt(dimension),goal=goals[0];
  return {version:'local-goal-v1',representation,names,dimension,scale,encode:(/** @type {State} */input)=>{const state=validateState(scenario,input),dx=(goal.x-state.x)/(scenario.grid[0].length-1),dy=(goal.y-state.y)/(scenario.grid.length-1),neighbors=[[0,-1],[1,0],[0,1],[-1,0]].map(([x,y])=>scenario.grid[state.y+y]?.[state.x+x]);return [1,dx,dy,(Math.abs(dx)+Math.abs(dy))/2,...neighbors.map(tile=>Number(tile===undefined||tile==='#')),...neighbors.map(tile=>Number(tile==='H'))].map(v=>v*scale);}};
 }

 const count=scenario.features.collectibles?scenario.grid.join('').split('C').length-1:0;
 const names=['bias','x / (width − 1)','y / (height − 1)',...Array.from({length:count},(_,i)=>['collected['+i+']','x × collected['+i+']','y × collected['+i+']']).flat(),...(scenario.features.battery===null?[]:['battery / capacity']),...(scenario.features.horizon===null?[]:['remaining / horizon'])];
 const dimension=names.length,scale=1/Math.sqrt(dimension);
 /** @param {State} input */
 function encode(input){const s=validateState(scenario,input),x=s.x/(scenario.grid[0].length-1),y=s.y/(scenario.grid.length-1),values=[1,x,y];for(let i=0;i<count;i++){const bit=representation==='informative'?((Number(s.collected)>>i)&1):0;values.push(bit,x*bit,y*bit);}if(scenario.features.battery!==null)values.push(representation==='informative'?Number(s.battery)/scenario.features.battery:0);if(scenario.features.horizon!==null)values.push(representation==='informative'?Number(s.remaining)/scenario.features.horizon:0);return values.map(v=>v*scale);}
 return {version:'compact-v1',representation,names,dimension,scale,encode};
}
/** Action-block features; each action owns its weights while states share features.
 * @param {number[]} phi @param {number} action
 */
export function actionFeatures(phi,action){integer(action,0,3);return Array.from({length:phi.length*4},(_,i)=>Math.floor(i/phi.length)===action?phi[i%phi.length]:0);}
/** @param {number[]} weights @param {number[]} phi */
export function dot(weights,phi){if(weights.length!==phi.length||[...weights,...phi].some(n=>!Number.isFinite(n)))throw Error('Feature/weight dimensions or numbers are invalid.');return weights.reduce((s,w,i)=>s+w*phi[i],0);}
/** @param {import('../training/config.js').Config} config @param {import('./tabular.js').Parameters} p @param {string} key @param {number} [action] */
export function linearEstimate(config,p,key,action){const e=featureEncoder(config.scenario,config.representation),phi=e.encode(decodeState(key));return dot(p.weights??[],action===undefined?phi:actionFeatures(phi,action));}
/** Cartesian upper bound, not a claim that all combinations are reachable. BigInt avoids rounding large products.
 * @param {{width:number,height:number,walls:number,collectibles:number,battery:number|null,horizon:number|null,actions:number}} c
 */
export function stateTableSize(c){const width=integer(c.width,2,40),height=integer(c.height,2,40),walls=integer(c.walls,0,width*height-1),bits=integer(c.collectibles,0,12),actions=integer(c.actions,1,20);const positions=BigInt(width*height-walls),inventory=2n**BigInt(bits),battery=c.battery===null?1n:BigInt(integer(c.battery,1,10000)+1),time=c.horizon===null?1n:BigInt(integer(c.horizon,1,10000)+1),states=positions*inventory*battery*time,entries=states*BigInt(actions);return {positions,inventory,battery,time,states,entries,bytes:entries*8n};}
