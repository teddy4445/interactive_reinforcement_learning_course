import * as tf from '@tensorflow/tfjs-core';
import '@tensorflow/tfjs-backend-cpu';
import '@tensorflow/tfjs-core/dist/register_all_gradients.js';
import {emptyParameters} from '../tabular.js';
import {createRng,deriveSeed} from '../../environment/rng.js';
import {TF_VERSION,vectorEncoder,weightShapes,neuralStates,ReplayBuffer,tdTarget} from './schema.js';
export async function ready(){await tf.setBackend('cpu');await tf.ready();}
export const tensorMemory=()=>({tensors:tf.memory().numTensors,bytes:tf.memory().numBytes});
/** @param {number} dimension @param {number} seed */
export function initialWeights(dimension,seed){const rng=createRng(seed);return weightShapes(dimension).map(shape=>{const bound=shape.length===2?Math.sqrt(6/(shape[0]+shape[1])):0;return Array.from({length:shape.reduce((a,b)=>a*b,1)},()=>bound?(rng.next()*2-1)*bound:0);});}
/** @param {tf.Tensor} x @param {tf.Tensor[]} w */
function forward(x,w){const h1=tf.relu(tf.add(tf.matMul(x,w[0]),w[1])),h2=tf.relu(tf.add(tf.matMul(h1,w[2]),w[3]));return tf.add(tf.matMul(h2,w[4]),w[5]);}
/** @param {number[][]} vectors @param {number[]} actions @param {number[]} targets @param {tf.Variable[]} variables */
function lossTensor(vectors,actions,targets,variables){const q=forward(tf.tensor2d(vectors),variables),selected=tf.sum(tf.mul(q,tf.oneHot(tf.tensor1d(actions,'int32'),4)),1);return /** @type {tf.Scalar} */(tf.mul(tf.mean(tf.square(tf.sub(selected,tf.tensor1d(targets)))),.5));}
/** Bounded fixed topology. No arbitrary executable model files or WebGL requirement. */
export class Network {
 /** @param {number} dimension @param {number[][]} weights @param {boolean} [trainable] */
 constructor(dimension,weights,trainable=true){this.variables=weightShapes(dimension).map((shape,i)=>tf.tidy(()=>tf.variable(tf.tensor(weights[i],shape,'float32'),trainable)));this.disposed=false;}
 /** @param {number[][]} vectors @returns {number[][]} */
 predict(vectors){return tf.tidy(()=>/** @type {number[][]} */(forward(tf.tensor2d(vectors),this.variables).arraySync()));}
 weights(){return this.variables.map(v=>Array.from(v.dataSync()));}
 /** @param {number[][]} weights */
 assign(weights){tf.tidy(()=>this.variables.forEach((v,i)=>v.assign(tf.tensor(weights[i],v.shape,'float32'))));}
 /** Exposed numerical primitive for finite-difference fixtures. Targets are constants.
  * @param {number[][]} vectors @param {number[]} actions @param {number[]} targets */
 gradient(vectors,actions,targets){return tf.tidy(()=>{const result=tf.variableGrads(()=>lossTensor(vectors,actions,targets,this.variables),this.variables);return {loss:result.value.dataSync()[0],gradients:this.variables.map(v=>Array.from(result.grads[v.name].dataSync()))};});}
 dispose(){if(!this.disposed){this.variables.forEach(v=>v.dispose());this.disposed=true;}}
}
/** Detached frozen policy: online weights only, no update API or training/replay RNG. */
export class NeuralPredictor {
 /** @param {import('../../training/config.js').Config} config @param {import('../tabular.js').Parameters} parameters */
 constructor(config,parameters){this.encoder=vectorEncoder(config.scenario);if(!parameters.deep)throw Error('Missing neural parameters.');this.network=new Network(this.encoder.dimension,parameters.deep.online,false);}
 /** @param {string} state */values(state){return this.network.predict([this.encoder.encode(state)])[0];}
 dispose(){this.network.dispose();}
}
export class DqnLearner {
 /** @param {import('../../training/config.js').Config} config @param {import('../tabular.js').Parameters} [parameters] */
 constructor(config,parameters){
  this.config=config;this.settings=/** @type {import('./schema.js').DeepConfig} */(config.deep);this.encoder=vectorEncoder(config.scenario);this.parameters=structuredClone(parameters??emptyParameters());const initSeed=deriveSeed(config.seed,'network-init');
  this.parameters.deep??={schemaVersion:1,online:initialWeights(this.encoder.dimension,initSeed),target:[],replay:{capacity:this.settings.capacity,cursor:0,seen:0,items:[]},replayRng:createRng(deriveSeed(config.seed,'replay')).snapshot(),initSeed,targetCopies:0,optimizer:{name:'sgd',learningRate:config.alpha,iterations:0,slots:[]},metrics:[],failure:null,runtime:{library:'TensorFlow.js',version:TF_VERSION,backend:'cpu',dtype:'float32'}};
  this.deep=this.parameters.deep;this.online=new Network(this.encoder.dimension,this.deep.online);this.target=new Network(this.encoder.dimension,this.deep.target.length?this.deep.target:this.online.weights(),false);this.optimizer=tf.train.sgd(config.alpha);this.buffer=new ReplayBuffer(this.settings.capacity,this.deep.replay);this.replayRng=createRng(1);this.replayRng.restore(this.deep.replayRng);this.disposed=false;this.refresh();
 }
 /** @param {string} state */values(state){return this.online.predict([this.encoder.encode(state)])[0];}
 refresh(){const keys=neuralStates(this.config.scenario),values=this.online.predict(keys.map(k=>this.encoder.encode(k)));this.parameters.q=Object.fromEntries(keys.map((k,i)=>[k,values[i]]));this.deep.online=this.online.weights();this.deep.target=this.target.weights();this.deep.replay=this.buffer.snapshot();this.deep.replayRng=this.replayRng.snapshot();}
 /** @param {import('../tabular.js').Sample} sample @returns {import('../tabular.js').Update[]} */
 observe(sample){
  if(this.deep.failure)throw Error(this.deep.failure.reason);const p=this.parameters,visits=p.visits[sample.state]??=[0,0,0,0];visits[sample.action]++;this.buffer.push(sample);
  if(this.buffer.state.items.length<this.settings.batch){this.refresh();return [];}
  const batch=this.buffer.sample(this.settings.batch,this.replayRng,this.settings.replay),vectors=batch.map(s=>this.encoder.encode(s.state)),nextVectors=batch.map(s=>this.encoder.encode(s.next));
  const nextValues=(this.settings.target?this.target:this.online).predict(nextVectors),old=this.online.predict(vectors),bootstrap=batch.map((s,i)=>s.terminated?0:Math.max(...nextValues[i])),targets=batch.map((s,i)=>tdTarget(s.reward,s.terminated,this.config.gamma,bootstrap[i])),errors=targets.map((t,i)=>t-old[i][batch[i].action]),before=this.online.weights();
  try{
   const measured=tf.tidy(()=>{const result=tf.variableGrads(()=>lossTensor(vectors,batch.map(s=>s.action),targets,this.online.variables),this.online.variables),loss=result.value.dataSync()[0],gradients=Object.values(result.grads).flatMap(t=>Array.from(t.dataSync())),gradientNorm=Math.hypot(...gradients);
    if(!Number.isFinite(loss)||!Number.isFinite(gradientNorm)||gradientNorm>1e6)throw Error('Nonfinite or excessive gradient/loss; run stopped (gradient norm limit 1e6).');this.optimizer.applyGradients(result.grads);return {loss,gradientNorm};});
   const after=this.online.weights(),outputs=this.online.predict(neuralStates(this.config.scenario).map(k=>this.encoder.encode(k))),maxAbsQ=Math.max(...outputs.flat().map(Math.abs));
   if(after.flat().some(n=>!Number.isFinite(n))||!Number.isFinite(maxAbsQ)||maxAbsQ>1e4)throw Error('Nonfinite weights or excessive Q magnitude; run stopped (|Q| limit 10000).');
   p.updates++;this.deep.optimizer.iterations=p.updates;const targetCopied=this.settings.target&&p.updates%this.settings.targetEvery===0;if(targetCopied){this.target.assign(after);this.deep.targetCopies++;}
   const parameterDeltaNorm=Math.hypot(...after.flatMap((row,i)=>row.map((w,j)=>w-before[i][j]))),meanAbsTd=errors.reduce((n,e)=>n+Math.abs(e),0)/errors.length;
   this.deep.metrics.push({update:p.updates,interaction:this.buffer.state.seen,...measured,meanAbsTd,parameterDeltaNorm,maxAbsQ,targetSync:targetCopied});this.deep.metrics=this.deep.metrics.slice(-256);
   batch.forEach((s,i)=>{p.errors[s.state]=errors[i];});this.refresh();const s=batch[0];
   return [{state:s.state,action:s.action,old:old[0][s.action],reward:s.reward,bootstrap:bootstrap[0],gamma:this.config.gamma,target:targets[0],error:errors[0],alpha:this.config.alpha,next:this.values(s.state)[s.action],terminated:s.terminated,truncated:s.truncated,method:'dqn',nextAction:null,origin:'real',deep:{batchSize:batch.length,replayIds:batch.map(s=>s.id),...measured,meanAbsTd,parameterDeltaNorm,targetCopied,targetCopies:this.deep.targetCopies,weightBefore:before[5][s.action],weightAfter:after[5][s.action]}}];
  }catch(error){this.online.assign(before);this.deep.failure={interaction:this.buffer.state.seen,reason:error instanceof Error?error.message:'Neural update failed.'};this.refresh();return [];}
 }
 /** @param {import('../tabular.js').Sample[]} _episode @param {boolean} _terminated @returns {import('../tabular.js').Update[]} */endEpisode(_episode,_terminated){void _episode;void _terminated;return [];}
 resources(){return tensorMemory();}
 snapshot(){this.refresh();return structuredClone(this.parameters);}
 dispose(){if(!this.disposed){this.online.dispose();this.target.dispose();this.optimizer.dispose();this.disposed=true;}}
}
