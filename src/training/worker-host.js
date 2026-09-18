import { TrainingRun } from './run.js';
import { hashData, validateConfig } from './config.js';
import { FrozenEvaluation, evaluationSeeds } from '../evaluation/frozen.js';
/** @typedef {{protocol:1,runId:string,commandId:number,configHash:string,command:string,payload:Record<string,unknown>}} Request */
/** @typedef {{protocol:1,runId:string,commandId:number,configHash:string,sequence:number,event:string,mode:string,snapshot?:ReturnType<TrainingRun['snapshot']>,evaluation?:ReturnType<FrozenEvaluation['result']>,error?:string,computeMs?:number,resources?:{tensors:number,bytes:number}}} Response */
/** Chunk scheduler independent of presentation, injectable for worker-control tests. */
export class WorkerHost {
  /** @param {(response:Response)=>void} send @param {{schedule?:(callback:()=>void)=>unknown,now?:()=>number}} [options] */
  constructor(send,{schedule=(callback)=>setTimeout(callback,0),now=()=>performance.now()}={}){
    this.send=send;this.schedule=schedule;this.now=now;this.runId='';this.configHash='';this.sequence=0;this.commandId=0;this.lastCommand=0;this.generation=0;this.mode='idle';this.target=0;this.targetKind='episodes';this.lastProgress=0;this.computeMs=0;
    /** @type {TrainingRun|null} */this.run=null;
    /** @type {FrozenEvaluation|null} */this.evaluation=null;
    this.pausedMode='training';
  }
  /** @param {string} event @param {Partial<Response>} [extra] @param {number} [commandId] */
  emit(event,extra={},commandId=this.commandId){this.send({protocol:1,runId:this.runId,configHash:this.configHash,commandId,sequence:++this.sequence,event,mode:this.mode,...extra});}
  snapshot(){return {snapshot:this.run?.snapshot(),computeMs:this.computeMs,...(this.run&&'resources' in this.run.learner?{resources:this.run.learner.resources()}: {})};}
  /** @param {Request} message */
  handle(message){
    if(message.protocol!==1||typeof message.runId!=='string'||!Number.isInteger(message.commandId))return;
    try{
      if(message.command==='initialize'){
        const config=validateConfig(message.payload.config);if(hashData(config)!==message.configHash)throw Error('Configuration identity mismatch.');
        const run=message.payload.checkpoint?TrainingRun.restore(/** @type {import('./run.js').RunCheckpoint} */(message.payload.checkpoint)):new TrainingRun(config);
        if(hashData(run.config)!==message.configHash){run.dispose();throw Error('Resume configuration mismatch.');}
        this.run?.dispose();this.evaluation?.dispose();this.generation++;this.run=run;this.runId=message.runId;this.configHash=message.configHash;this.sequence=0;this.commandId=message.commandId;this.lastCommand=message.commandId;this.mode='idle';this.evaluation=null;this.computeMs=0;
        this.emit('ack');this.emit('ready',this.snapshot());return;
      }
      if(message.runId!==this.runId||message.configHash!==this.configHash||message.commandId<=this.lastCommand||!this.run)return;
      this.lastCommand=message.commandId;this.emit('ack',{},message.commandId);
      if(message.command==='pause'){
        if(!['training','evaluating'].includes(this.mode))throw Error('Nothing running to pause.');
        this.pausedMode=this.mode;this.mode='paused';this.generation++;this.emit('paused',this.snapshot(),message.commandId);return;
      }
      if(message.command==='resume'){
        if(this.mode!=='paused')throw Error('No paused job.');this.mode=this.pausedMode;const token=++this.generation;this.emit('resumed',{},message.commandId);this.schedule(()=>this.pump(token));return;
      }
      if(message.command==='cancel'||message.command==='dispose'){
        this.generation++;this.mode=message.command==='dispose'?'disposed':'idle';this.evaluation?.dispose();this.evaluation=null;this.emit('cancelled',this.snapshot(),message.commandId);if(message.command==='dispose'){this.run.dispose();this.run=null;}return;
      }
      if(message.command==='snapshot'){this.emit('checkpoint',this.snapshot(),message.commandId);return;}
      if(this.mode!=='idle')throw Error('Pause/cancel the active job before starting another.');
      this.commandId=message.commandId;
      if(message.command==='resetEpisode'){this.run.resetEpisode();this.emit('completed',this.snapshot());return;}
      if(message.command==='step'){const start=this.now();this.run.step();this.checkFailure();this.computeMs+=this.now()-start;this.emit('stepTrace',this.snapshot());return;}
      if(message.command==='evaluate'){
        const seeds=message.payload.seeds??evaluationSeeds(this.run.config.seed);
        if(!Array.isArray(seeds)||seeds.some(s=>!Number.isInteger(s)||s<0||s>0xffffffff))throw Error('Invalid evaluation seeds.');
        this.evaluation=new FrozenEvaluation(this.run.config,this.run.learner.snapshot(),seeds);this.mode='evaluating';
      } else if(message.command==='trainInteractions'){
        const count=message.payload.interactions;if(!Number.isInteger(count)||Number(count)<1||Number(count)>5000||this.run.interactions+Number(count)>2000000)throw Error('Real-interaction batch must be 1–5,000 and fit the run limit.');this.target=this.run.interactions+Number(count);this.targetKind='interactions';this.mode='training';
      } else if(message.command==='episode'||message.command==='train'){
        const episodes=message.command==='episode'?1:message.payload.episodes;
        if(!Number.isInteger(episodes)||Number(episodes)<1||Number(episodes)>1000||this.run.rows.length+Number(episodes)>2000)throw Error('Batch must fit the 2,000-episode history (1–1,000 per command).');
        this.target=this.run.finished+Number(episodes);this.targetKind='episodes';this.mode='training';
      }else throw Error('Unknown training command.');
      const token=++this.generation;this.emit('started',this.snapshot());this.schedule(()=>this.pump(token));
    }catch(error){if(message.command==='initialize')this.send({protocol:1,runId:message.runId,configHash:message.configHash,commandId:message.commandId,sequence:1,event:'error',mode:'idle',error:error instanceof Error?error.message:'Initialization failed.'});else {if(this.run?.learner.parameters.deep?.failure){this.generation++;this.mode='idle';}this.emit('error',{...this.snapshot(),error:error instanceof Error?error.message:'Worker command failed.'},message.commandId);}}
  }
  checkFailure(){if(this.run?.learner.parameters.deep?.failure)throw Error(this.run.learner.parameters.deep.failure.reason);}
  /** At most 32 transitions / ~8 ms of work before yielding to worker commands. @param {number} token */
  pump(token){
    if(token!==this.generation||!this.run||!['training','evaluating'].includes(this.mode))return;
    const start=this.now();
    try{
      for(let i=0;i<32&&this.now()-start<8;i++){
        if(this.mode==='evaluating'){this.evaluation?.step();if(this.evaluation?.done)break;}
        else {this.run.step();this.checkFailure();if((this.targetKind==='interactions'?this.run.interactions:this.run.finished)>=this.target)break;}
      }
      this.computeMs+=this.now()-start;
      if(this.mode==='evaluating'?this.evaluation?.done:(this.targetKind==='interactions'?this.run.interactions:this.run.finished)>=this.target){
        const evaluation=this.mode==='evaluating'?this.evaluation?.result():undefined;this.mode='idle';this.evaluation?.dispose();this.evaluation=null;this.emit('completed',{...this.snapshot(),...(evaluation?{evaluation}:{})});return;
      }
      if(this.now()-this.lastProgress>=100){this.lastProgress=this.now();this.emit('progress',this.snapshot());}
      this.schedule(()=>this.pump(token));
    }catch(error){this.generation++;this.mode='idle';this.evaluation?.dispose();this.evaluation=null;this.emit('error',{...this.snapshot(),error:error instanceof Error?error.message:'Training failed.'});}
  }
}
