import {softmax,scoreGradient} from '../agents/policy.js';
import {emptyParameters} from '../agents/tabular.js';
import {pairs} from './demonstrations.js';
import {hashData,defaultConfig,validateConfig} from '../training/config.js';
import {TrainingRun} from '../training/run.js';
import {integer} from '../environment/schema.js';
/** @typedef {Record<string,number[]>} Actor */
/** @param {Actor} actor @param {{state:string,action:number}[]} data */
export function supervisedMetrics(actor,data){if(!data.length)return {count:0,loss:null,accuracy:null};let loss=0,correct=0;for(const s of data){const logits=actor[s.state]??[0,0,0,0],m=Math.max(...logits),p=softmax(logits);loss+=m+Math.log(logits.reduce((sum,x)=>sum+Math.exp(x-m),0))-logits[s.action];if(p.indexOf(Math.max(...p))===s.action)correct++;}return {count:data.length,loss:loss/data.length,accuracy:correct/data.length};}
/** Full-batch cross-entropy descent; only train pairs contribute gradients. */
export class BehaviorCloner{
 /** @type {Actor} */ actor={};
 /** @param {import('./demonstrations.js').Dataset} dataset @param {number} [epochs] @param {number} [alpha] */
 constructor(dataset,epochs=120,alpha=.5){integer(epochs,1,300);if(!Number.isFinite(alpha)||alpha<=0||alpha>1)throw Error('BC alpha must be in (0,1].');if(dataset.trajectories.some(t=>t.end==='active'))throw Error('Finish the active trajectory.');this.train=pairs(dataset,'train');this.holdout=pairs(dataset,'holdout');if(!this.train.length||!this.holdout.length)throw Error('Record training and separate held-out trajectories first.');this.datasetHash=hashData(dataset);this.epochs=epochs;this.alpha=alpha;this.epoch=0;this.actor={};this.history=[this.metrics()];/** @type {{state:string,action:number,probabilities:number[],gradient:number[],before:number[],after:number[],normalizer:number}|null} */this.last=null;}
 metrics(){return {epoch:this.epoch,train:supervisedMetrics(this.actor,this.train),holdout:supervisedMetrics(this.actor,this.holdout)};}
 step(){if(this.epoch>=this.epochs)return;const gradients=/** @type {Actor} */({});for(const s of this.train){const p=softmax(this.actor[s.state]??[0,0,0,0]),g=gradients[s.state]??=[0,0,0,0];scoreGradient(p,s.action).forEach((v,i)=>g[i]+=v/this.train.length);}
 const sample=this.train[0],before=[...(this.actor[sample.state]??[0,0,0,0])],probabilities=softmax(before);for(const [state,g]of Object.entries(gradients))this.actor[state]=(this.actor[state]??[0,0,0,0]).map((v,i)=>v+this.alpha*g[i]);this.epoch++;this.last={state:sample.state,action:sample.action,probabilities,gradient:gradients[sample.state],before,after:[...this.actor[sample.state]],normalizer:this.train.length};if(this.epoch===1||this.epoch%10===0||this.epoch===this.epochs)this.history.push(this.metrics());}
 get done(){return this.epoch===this.epochs;}
 result(){if(!this.done)throw Error('Supervised fit is incomplete.');return {version:'behavior-cloning-v1',representation:'full-position-softmax-v1',datasetHash:this.datasetHash,epochs:this.epochs,alpha:this.alpha,examplePasses:this.epochs*this.train.length,actor:structuredClone(this.actor),history:structuredClone(this.history),last:structuredClone(this.last)};}
}
/** Exact preferences copied to the same tabular softmax actor; critic/counters/optimizer start fresh.
 * @param {ReturnType<BehaviorCloner['result']>|null} fit @param {import('../training/config.js').Config} [config] */
export function initializePolicy(fit,config=defaultConfig('11')){validateConfig(config);if(config.lesson!=='11'||config.algorithm!=='actor-critic'||fit&&(fit.representation!=='full-position-softmax-v1'||fit.version!=='behavior-cloning-v1'))throw Error('Transfer requires the identical full-position softmax actor and action order.');const run=new TrainingRun(config);run.learner.parameters={...emptyParameters(),actor:structuredClone(fit?.actor??{}),criticUpdates:0,skippedPolicy:0};const checkpoint=run.checkpoint();run.dispose();return checkpoint;}

