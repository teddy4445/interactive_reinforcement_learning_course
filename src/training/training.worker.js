import { WorkerHost } from './worker-host.js';
import {prepareLearner} from '../agents/registry.js';
import {validateConfig} from './config.js';
const host=new WorkerHost((message)=>self.postMessage(message));
let loading=0;
self.addEventListener('message',async(event)=>{
 const message=event.data;
 if(message.command==='dispose')loading++;
 if(message.command!=='initialize'){host.handle(message);return;}
 const token=++loading;host.generation++;host.mode='idle';
 try{const config=validateConfig(message.payload.config);await prepareLearner(config);if(token===loading)host.handle(message);}
 catch(error){if(token===loading)self.postMessage({protocol:1,runId:message.runId,configHash:message.configHash,commandId:message.commandId,sequence:1,event:'error',mode:'idle',error:error instanceof Error?error.message:'Neural module unavailable.'});}
});
