import { writeFile, mkdir } from 'node:fs/promises';
import { lessonScenario } from '../src/content/foundations.js';
import { IslandEnvironment } from '../src/environment/engine.js';
import { calculate } from '../src/lessons/calculations.js';
import { missionPassed } from '../src/lessons/records.js';
await mkdir('evidence/task-03',{recursive:true});
const routes=[
 {name:'Shortest route',actions:['right','right']},
 {name:'Four extra moves (upper accepted boundary)',actions:['up','up','up','up','right','right']},
 {name:'Five extra moves (reject)',actions:['up','up','up','up','up','right','right']}
].map(({name,actions})=>{
 const env=new IslandEnvironment(lessonScenario('01'),{seed:7,rolloutLimit:80});
 const transitions=actions.map(a=>env.step(a).trace);
 return {name,actions,accepted:missionPassed('01',{actions,checkpoint:env.serialize()}),info:env.getInfo(),transitions};
});
const slips=[0,.05,.2,.4,.8].map(parameter=>calculate({lesson:'02',phase:parameter===.2?'math':'experiment',parameter}).summary);
const comparisons=[0,.05,.5,.8,.99].map(parameter=>calculate({lesson:'03',phase:'experiment',parameter}).summary);
await writeFile('evidence/task-03/challenge-calibration.json',JSON.stringify({
 generatedAt:new Date().toISOString(),kind:'Deterministic developer calibration; not student performance',
 engineVersion:1,planningVersion:1,criteria:{
  lesson01:'Genuine goal termination within 6 accepted actions; 2 is shortest, 4 extra moves allowed. Correct numerical and concept checks also required.',
  lesson02:'Fixed right policy, changed slip, residual <= 1e-6. Correct zero-value backup and collision explanation also required.',
  lesson03:'Both planners use the same scenario and gamma, each residual <= 1e-6; max value disagreement <= 1e-6. Correct numerical/stopping checks also required.'
 },routes,slips,comparisons
},null,2)+'\n');
console.log('Recorded 3 manual route boundaries, 5 fixed-policy configurations, and 5 planner comparisons.');

