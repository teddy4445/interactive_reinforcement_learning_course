import {setTrainingActive} from '../app/activity.js';
import { hashData } from './config.js';
/** One coordinator owns one worker. Identity + monotonically increasing response sequence reject stale events. */
export class TrainingCoordinator {
  /** @param {(response:import('./worker-host.js').Response)=>void} onMessage @param {Worker} [worker] */
  constructor(onMessage,worker=new Worker(new URL('./training.worker.js',import.meta.url),{type:'module'})) {
    this.worker=worker;this.onMessage=onMessage;this.runId='';this.configHash='';this.nextCommand=0;this.lastSequence=0;this.disposed=false;
    /** @type {Map<number,{resolve:(response:import('./worker-host.js').Response)=>void,reject:(error:Error)=>void,command:string}>} */this.pending=new Map();
    /** @type {Map<number,number>} */this.sentAt=new Map();
    /** @type {{command:string,latencyMs:number}[]} */this.acknowledgments=[];
    worker.addEventListener('message',(event)=>this.receive(event.data));
    worker.addEventListener('error',(event)=>{const error=Error(event.message||'Training worker failed.');this.pending.forEach(p=>p.reject(error));this.pending.clear();this.sentAt.clear();setTrainingActive(this,false);this.onMessage({protocol:1,runId:this.runId,commandId:0,configHash:this.configHash,sequence:++this.lastSequence,event:'error',mode:'idle',error:error.message});});
  }
  /** @param {import('./worker-host.js').Response} message */
  receive(message){
    if(this.disposed||message.protocol!==1||message.runId!==this.runId||message.configHash!==this.configHash||message.sequence<=this.lastSequence)return false;
    this.lastSequence=message.sequence;if(message.event!=='ack')setTrainingActive(this,!['idle','disposed'].includes(message.mode));
    const pending=this.pending.get(message.commandId);
    if(message.event==='ack'){const start=this.sentAt.get(message.commandId);if(start!==undefined){this.acknowledgments.push({command:pending?.command??'unknown',latencyMs:performance.now()-start});if(this.acknowledgments.length>100)this.acknowledgments.shift();this.sentAt.delete(message.commandId);}}
    if(message.event==='cancelled'){
      for(const [id,p] of this.pending){if(p.command==='trainInteractions'||p.command==='train'||p.command==='episode'||p.command==='evaluate'){p.resolve(message);this.pending.delete(id);}}
    }
    if(pending&&['ready','stepTrace','completed','paused','resumed','cancelled','checkpoint','error'].includes(message.event)){
      if(message.event==='error')pending.reject(Object.assign(Error(message.error),{checkpoint:message.snapshot?.checkpoint}));else pending.resolve(message);this.pending.delete(message.commandId);this.sentAt.delete(message.commandId);
    }
    this.onMessage(message);return true;
  }
  /** @param {string} command @param {Record<string,unknown>} [payload] */
  command(command,payload={}){
    const commandId=++this.nextCommand;if(!this.disposed&&['initialize','step','episode','train','trainInteractions','evaluate'].includes(command))setTrainingActive(this,true);
    return new Promise(/** @param {(response:import('./worker-host.js').Response)=>void} resolve */(resolve,reject)=>{
      if(this.disposed){reject(Error('Worker disposed.'));return;}
      this.pending.set(commandId,{resolve,reject,command});this.sentAt.set(commandId,performance.now());
      this.worker.postMessage({protocol:1,runId:this.runId,configHash:this.configHash,commandId,command,payload});
    });
  }
  /** @param {import('./config.js').Config} config @param {import('./run.js').RunCheckpoint} [checkpoint] */
  initialize(config,checkpoint){this.pending.forEach(p=>p.reject(Error('Experiment replaced.')));this.pending.clear();this.sentAt.clear();this.runId=crypto.randomUUID();this.configHash=hashData(config);this.lastSequence=0;return this.command('initialize',{config,...(checkpoint?{checkpoint}:{})});}
  dispose(){setTrainingActive(this,false);this.sentAt.clear();this.disposed=true;this.worker.terminate();this.pending.forEach(p=>p.reject(Error('Worker disposed.')));this.pending.clear();}
}
