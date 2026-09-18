import { describe,test,expect } from 'vitest';
import { TabularLearner,capabilities,chooseAction,emptyParameters } from '../../src/agents/tabular.js';
import { defaultConfig,hashData } from '../../src/training/config.js';
import { TrainingRun } from '../../src/training/run.js';
import { FrozenEvaluation,evaluationSeeds } from '../../src/evaluation/frozen.js';
import { referenceError } from '../../src/evaluation/comparison.js';
import { createRng } from '../../src/environment/rng.js';
import { WorkerHost } from '../../src/training/worker-host.js';
import { TrainingCoordinator } from '../../src/training/coordinator.js';
const sample={state:'0,0',action:1,reward:5,next:'1,0',terminated:false,truncated:false,nextAction:1};
const config=(algorithm)=>({...defaultConfig(['mc','td'].includes(algorithm)?'04':'05'),algorithm});
function finish(run,n){while(run.finished<n)run.step();return run;}

describe('independently specified numerical model-free fixtures',()=>{
 test('TD(0) target 4.6 and value 2.26; specified policy unchanged',()=>{
  const c=config('td'),l=new TabularLearner(c);l.parameters.v={'0,0':2,'1,0':4};
  const [u]=l.observe({...sample,reward:1});expect(u.target).toBeCloseTo(4.6,12);expect(u.next).toBeCloseTo(2.26,12);expect(u.error).toBeCloseTo(2.6,12);expect(l.config.policy).toBe(c.policy);expect(capabilities.td.control).toBe(false);
 });
 test.each([['q',8.78,3.686],['sarsa',5.9,3.398]])('%s uses its declared target',(method,target,next)=>{
  const l=new TabularLearner(config(method));l.parameters.q={'0,0':[0,3.12,0,0],'1,0':[4.2,1,0,0]};const [u]=l.observe(sample);
  expect(u.old).toBe(3.12);expect(u.target).toBeCloseTo(target,12);expect(u.next).toBeCloseTo(next,12);
 });
 test.each(['sarsa','q'])('%s masks true termination but bootstraps at external truncation',algorithm=>{
  const make=()=>{const l=new TabularLearner(config(algorithm));l.parameters.q={'0,0':[0,3.12,0,0],'1,0':[4.2,1,0,0]};return l;};
  const [terminal]=make().observe({...sample,terminated:true});expect(terminal.target).toBe(5);expect(terminal.next).toBeCloseTo(3.308,12);
  const [cut]=make().observe({...sample,truncated:true});expect(cut.target).toBeCloseTo(algorithm==='q'?8.78:5.9,12);
 });
 test('MC first occurrence uses its full suffix; sample average differs from repeated visits',()=>{
  const l=new TabularLearner({...config('mc'),gamma:.5});
  const episode=[{...sample,reward:1},{...sample,state:'1,0',next:'0,0',reward:2},{...sample,reward:3,terminated:true}];
  episode.forEach(s=>l.observe(s));const updates=l.endEpisode(episode,true);
  expect(updates).toHaveLength(2);expect(l.parameters.v).toEqual({'0,0':2.75,'1,0':3.5});expect(l.parameters.counts['0,0']).toBe(1);expect(l.parameters.visits['0,0'][1]).toBe(2);
  l.endEpisode([{...sample,reward:5,terminated:true}],true);expect(l.parameters.v['0,0']).toBe(3.875);expect(l.parameters.counts['0,0']).toBe(2);
 });
 test('MC updates nothing for capped or interrupted episodes; TD still bootstraps',()=>{
  const mc=new TabularLearner(config('mc'));mc.observe({...sample,truncated:true});expect(mc.endEpisode([sample],false)).toEqual([]);expect(mc.parameters.v).toEqual({});expect(mc.parameters.skippedMC).toBe(1);expect(mc.parameters.updates).toBe(0);
  const td=new TabularLearner(config('td'));td.parameters.v={'0,0':2,'1,0':4};expect(td.observe({...sample,reward:1,truncated:true})[0].next).toBeCloseTo(2.26,12);
 });
 test('exploration branch is its draw, even when it selects the greedy action',()=>{
  const draws=[.05,.01],rng={next:()=>draws.shift()};const d=chooseAction({...config('q'),epsilon:.2},emptyParameters(),'0,0',rng);
  expect(d.branch).toBe('exploration');expect(d.action).toBe(d.greedyAction);[.85,.05,.05,.05].forEach((p,i)=>expect(d.probabilities[i]).toBeCloseTo(p,14));expect(d.explorationDraw).toBe(.05);expect(d.actionDraw).toBe(.01);
 });
 test('fixed prediction policy ignores values; frozen control uses explicit deterministic tie rule',()=>{
  const p=emptyParameters();p.q['0,0']=[99,0,0,0];expect(chooseAction(config('td'),p,'0,0',createRng(7)).action).toBe(1);
  const greedy=chooseAction({...config('sarsa'),epsilon:1},emptyParameters(),'0,0',createRng(7),true);expect(greedy.action).toBe(0);expect(greedy.epsilon).toBe(0);expect(greedy.explorationDraw).toBeNull();
 });
 test('SARSA next behavior decision is executed on the next step, including a wall stay',()=>{
  const run=new TrainingRun({...config('sarsa'),epsilon:1});const first=run.step(),second=run.step();expect(second.decision).toEqual(first.nextDecision);expect(first.updates[0].nextAction).toBe(first.nextDecision.action);
 });
 test.each(['mc','td','sarsa','q'])('%s checkpoint replays pending actions and learned parameters exactly',algorithm=>{
  const original=new TrainingRun(config(algorithm));for(let i=0;i<9;i++)original.step();const loaded=TrainingRun.restore(original.checkpoint());for(let i=0;i<20;i++){expect(loaded.step()).toEqual(original.step());}expect(loaded.checkpoint()).toEqual(original.checkpoint());
 });
 test.each(['mc','td','sarsa','q'])('%s evaluation changes no learned table, visits, training RNG, or counters',algorithm=>{
  const run=finish(new TrainingRun(config(algorithm)),8),before=run.checkpoint(),evalRun=new FrozenEvaluation(run.config,run.learner.snapshot(),evaluationSeeds(91));while(!evalRun.done)evalRun.step();expect(run.checkpoint()).toEqual(before);expect(evalRun.result().rows).toHaveLength(5);expect(evalRun.result().trainingUpdates).toBe(0);
 });
 test('step scheduling and repeated rendering snapshots cannot alter seeded results',()=>{
  const a=new TrainingRun(config('q')),b=new TrainingRun(config('q'));for(let i=0;i<400;i++){a.step();if(i%17===0)a.snapshot();b.step();b.snapshot();}expect(a.checkpoint()).toEqual(b.checkpoint());
 });
 test('episode reset preserves learned values and identifies an interrupted row',()=>{
  const r=new TrainingRun(config('td'));r.step();const v=structuredClone(r.learner.parameters.v);r.resetEpisode();expect(r.learner.parameters.v).toEqual(v);expect(r.rows[0].interrupted).toBe(true);expect(r.finished).toBe(0);
 });
 test('prediction reference uses the identical stochastic MDP and fixed policy',()=>{
  const c=config('td'),p=emptyParameters(),b=3.8/.82;p.v={'0,0':(-1+.72*b)/.82,'1,0':b};expect(referenceError(c,p)).toBeLessThan(1e-7);
 });
});
function harness(c=config('q')){
 const messages=[],queue=[];let clock=0;const host=new WorkerHost(m=>messages.push(m),{schedule:f=>queue.push(f),now:()=>clock+=.1});let id=0;
 const request=(command,payload={},runId='run-a')=>host.handle({protocol:1,runId,commandId:++id,configHash:hashData(c),command,payload});
 request('initialize',{config:c});const drain=()=>{let guard=0;while(queue.length){queue.shift()();if(++guard>30000)throw Error('Unbounded worker loop');}};
 return {messages,queue,host,request,drain};
}
describe('chunked worker controls and stale-message rejection',()=>{
 test('pause yields at a bounded chunk, resume is numerically identical, every command is acknowledged',()=>{
  const h=harness(),baseline=finish(new TrainingRun(config('q')),10);h.request('train',{episodes:10});expect(h.queue.length).toBe(1);h.queue.shift()();expect(h.host.run.interactions).toBeLessThanOrEqual(32);h.request('pause');const paused=h.host.run.checkpoint();h.drain();expect(h.host.run.checkpoint()).toEqual(paused);h.request('resume');h.drain();expect(h.host.run.checkpoint()).toEqual(baseline.checkpoint());expect(h.messages.filter(m=>m.event==='ack')).toHaveLength(4);
 });
 test('cancel invalidates queued chunks; new experiment rejects old commands',()=>{
  const h=harness();h.request('train',{episodes:100});h.queue.shift()();h.request('cancel');const stopped=h.host.run.checkpoint();h.drain();expect(h.host.run.checkpoint()).toEqual(stopped);h.request('initialize',{config:config('q')},'run-b');h.request('step',{},'run-a');expect(h.host.run.interactions).toBe(0);
 });
 test('worker evaluation leaves all training state unchanged and reports its action rule',()=>{
  const h=harness();h.request('train',{episodes:5});h.drain();const before=h.host.run.checkpoint();h.request('evaluate',{seeds:evaluationSeeds(77)});h.drain();expect(h.host.run.checkpoint()).toEqual(before);expect(h.messages.at(-1).evaluation.rule).toContain('epsilon 0');expect(h.messages.at(-1).evaluation.complete).toBe(true);
 });
 test('coordinator rejects old run, configuration, and reordered responses',async()=>{
  const received=[],sent=[],fake={postMessage:m=>sent.push(m),addEventListener:()=>{},terminate:()=>{}};
  const c=new TrainingCoordinator(m=>received.push(m),fake),pending=c.initialize(config('td')),req=sent[0];
  const response={...req,event:'ready',sequence:1,mode:'idle'};expect(c.receive({...response,runId:'old'})).toBe(false);expect(c.receive({...response,configHash:'wrong'})).toBe(false);expect(c.receive(response)).toBe(true);await pending;expect(c.receive(response)).toBe(false);expect(received).toHaveLength(1);c.dispose();expect(c.receive({...response,sequence:2})).toBe(false);
 });
});

test('pausing/cancelling evaluation never changes the learner or invents completed evaluation rows',()=>{
 const h=harness();h.request('train',{episodes:2});h.drain();const before=h.host.run.checkpoint();h.request('evaluate',{seeds:evaluationSeeds(78)});h.queue.shift()();h.request('pause');h.drain();expect(h.host.run.checkpoint()).toEqual(before);h.request('cancel');h.drain();expect(h.host.run.checkpoint()).toEqual(before);expect(h.messages.at(-1).evaluation).toBeUndefined();h.request('evaluate',{seeds:evaluationSeeds(78)});h.drain();expect(h.messages.at(-1).evaluation.rows).toHaveLength(5);
});

test('uniform fixed-policy prediction keeps equal probabilities during frozen evaluation',()=>{
 const c={...config('mc'),policy:'uniform'},p=emptyParameters();p.v['0,0']=1000;const a=chooseAction(c,p,'0,0',createRng(37)),b=chooseAction(c,p,'0,0',createRng(37),true);expect(a).toEqual(b);expect(a.probabilities).toEqual([.25,.25,.25,.25]);expect(a.branch).toBe('fixed-policy');
});
