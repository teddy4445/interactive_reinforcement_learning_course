import {mkdir,writeFile} from 'node:fs/promises';
import os from 'node:os';
import {laboratoryConfig} from '../src/laboratory/config.js';
import {TrainingRun} from '../src/training/run.js';
import {FrozenEvaluation,evaluationSeeds} from '../src/evaluation/frozen.js';
import {evaluationSummary,CHALLENGE} from '../src/laboratory/records.js';
import {hashData} from '../src/training/config.js';
await mkdir('evidence/task-09',{recursive:true});
const runs=[];
for(const method of ['q','sarsa','dyna','linear-sarsa','local-goal','actor-critic'])for(const seed of [11,29,47,83,101]){const config={...laboratoryConfig(method==='local-goal'?'linear-sarsa':method),...(method==='local-goal'?{representation:'local-goal'}:{}),seed},run=new TrainingRun(config),start=performance.now(),points=[];for(const budget of [0,600,1200]){while(run.interactions<budget)run.step();const evaluation=new FrozenEvaluation(config,run.learner.snapshot(),evaluationSeeds(7001));while(!evaluation.done)evaluation.step();const result=evaluation.result();evaluation.dispose();points.push({budget,updates:run.learner.parameters.updates,planning:run.learner.parameters.planningUpdates??0,parameterHash:hashData(run.learner.parameters),evaluation:result,summary:evaluationSummary(result)});}runs.push({method,config,configHash:hashData(config),points,wallMs:performance.now()-start});run.dispose();}
const summary=['q','sarsa','dyna','linear-sarsa','local-goal','actor-critic'].map(method=>({method,at600:runs.filter(r=>r.method===method).map(r=>r.points[1].summary),at1200:runs.filter(r=>r.method===method).map(r=>r.points[2].summary)}));
await writeFile('evidence/task-09/challenge-calibration.json',JSON.stringify({source:'Actual seeded production-engine calibration, not student results or a supplied checkpoint.',at:new Date().toISOString(),environment:{platform:process.platform,node:process.version,os:os.release(),cpu:os.cpus()[0].model},criterion:CHALLENGE,protocol:'Five independent trained agents per method. Same fixed reference map; five frozen episodes per agent. Zero interactions is an actual untrained baseline. Threshold is a guided small-map practice criterion, not comparable grading across arbitrary edited tasks.',runs,summary},null,2));console.log(JSON.stringify(summary,null,2));
