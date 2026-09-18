import {mkdir,writeFile} from 'node:fs/promises';
import {performance} from 'node:perf_hooks';
import {defaultConfig} from '../src/training/config.js';
import {TrainingRun} from '../src/training/run.js';
import {FrozenEvaluation} from '../src/evaluation/frozen.js';
import {newComparison,referenceError,comparisonSummary,observedWinner} from '../src/evaluation/comparison.js';
const comparisons=[];
for(const id of ['04','05'])for(const episodes of [20,id==='04'?80:120]){
 const c=newComparison(defaultConfig(id),episodes,'Developer calibration: measure both methods without assuming a winner; not student progress.');
 for(const seed of c.seeds)for(const algorithm of id==='04'?['mc','td']:['sarsa','q']){
  const config={...c.config,algorithm,seed},run=new TrainingRun(config),start=performance.now();while(run.finished<episodes)run.step();const trainedAt=performance.now(),evaluation=new FrozenEvaluation(config,run.learner.snapshot(),c.evaluationSeeds);while(!evaluation.done)evaluation.step();
  c.runs.push({algorithm,seed,config,parameters:run.learner.snapshot(),training:run.rows,interactions:run.interactions,updates:run.learner.parameters.updates,evaluation:evaluation.result(),rmse:id==='04'?referenceError(config,run.learner.parameters):null,timing:{trainingComputeMs:trainedAt-start,evaluationComputeMs:performance.now()-trainedAt}});
 }
 c.status='complete';c.finishedAt=new Date().toISOString();comparisons.push(c);console.log(JSON.stringify({lesson:id,episodes,summary:comparisonSummary(c),observedWinner:observedWinner(c)}));
}
await mkdir('evidence/task-04',{recursive:true});await writeFile('evidence/task-04/challenge-calibration.json',JSON.stringify({source:'Actual deterministic developer calibration. Not student performance. Independent training agents, fixed shared held-out evaluation suites. Node active loop times are not browser worker timings.',comparisons},null,2));
