import { describe, expect, test } from 'vitest';
import { buildModel, fixedPolicy, actionBackup, sweep, evaluatePolicy, improvePolicy, policyIteration, valueIteration, discountedReturn } from '../../src/planning/planners.js';
import { foundations, lessonScenario } from '../../src/content/foundations.js';
import { calculate } from '../../src/lessons/calculations.js';
import { checkAttempt, completion, emptyLesson, markCompletion, mathConfig, missionPassed, requirements } from '../../src/lessons/records.js';
import { emptyProgress, exportProgress, importProgress, ProgressStore, PROGRESS_KEY, validateProgress } from '../../src/persistence/progress.js';
import { IslandEnvironment } from '../../src/environment/engine.js';
import { escapeHtml } from '../../src/ui/escape.js';
const at = '2026-09-17T15:00:00.000Z';
const setup = (slip=0) => buildModel(lessonScenario('02',slip));
const valueAt = (model,values,key) => values[model.index.get(key)];
const attempt = (stage,answers,trial=null) => ({stage,answers,at,trial});
function play(id,actions) {
  const env = new IslandEnvironment(lessonScenario(id),{seed:7,rolloutLimit:80});
  for (const a of actions) env.step(a);
  return {actions,checkpoint:env.serialize()};
}
function completeFixture(id) {
  // Disposable activity fixtures; never shipped as student records.
  const r=emptyLesson(id), content=foundations[id];
  r.prediction={answer:'Test prediction',at};
  r.play=play(id,['right','right']); r.mission=structuredClone(r.play);
  r.math=calculate(mathConfig(id)).summary;
  const config={lesson:id,phase:'experiment',parameter:{'01':.9,'02':.4,'03':.5}[id]};
  r.experiments=[{config,prediction:{answer:'Test prediction',at},result:calculate(config).summary}];
  r.attempts=[attempt('observe',[content.observeCheck.correct]),attempt('math',[String(content.mathAnswer)]),attempt('challenge',[String(content.challengeAnswer),content.challengeCheck.correct],0)];
  markCompletion(id,r);
  return r;
}

describe('hand-solvable planning and return fixtures',() => {
 test('discount convention and analytically calculated fork threshold',() => {
  expect(discountedReturn([0,0,5],.9)).toBeCloseTo(4.05,12);
  const threshold=(.25)**(1/3);
  expect(threshold).toBeCloseTo(.6299605249474366,14);
  expect(discountedReturn([0,0,0,20],threshold)).toBeCloseTo(5,12);
  expect(discountedReturn([5],0)).toBe(5);
  expect(discountedReturn([-1,5],.9)).toBe(3.5);
  expect(() => discountedReturn([Infinity],.9)).toThrow();
  expect(() => discountedReturn([1],1.1)).toThrow();
 });
 test('deterministic fixed-right three-state solution is A=3.5, B=5, G=0',() => {
  const m=setup(), policy=fixedPolicy(m,'right'), before=structuredClone(policy);
  const result=evaluatePolicy(m,policy,.9);
  expect(valueAt(m,result.values,'0,0')).toBe(3.5);
  expect(valueAt(m,result.values,'1,0')).toBe(5);
  expect(valueAt(m,result.values,'2,0')).toBe(0);
  expect(policy).toEqual(before); expect(result.policy).toEqual(before);
  expect(result.converged).toBe(true); expect(result.residual).toBe(0);
 });
 test('synchronous sweeps do not use partially updated values; terminal values stay zero',() => {
  const m=setup(), pi=fixedPolicy(m,'right');
  const first=sweep(m,[0,0,0],.9,pi);
  expect(first).toEqual([-1,5,0]);
  expect(sweep(m,first,.9,pi)).toEqual([3.5,5,0]);
  const terminalContamination=actionBackup(m,[0,0,999],m.index.get('1,0'),1,.9);
  expect(terminalContamination.value).toBe(5);
  expect(terminalContamination.terms[0].continuation).toBe(0);
 });
 test('independent stochastic solution and merged collision expectation',() => {
  const m=setup(.2), initial=m.states.map(() => 0), b=m.index.get('1,0');
  const backup=actionBackup(m,initial,b,1,.9);
  expect(backup.terms).toHaveLength(2);
  expect(backup.terms.map((t) => t.probability)).toEqual([.8,.2]);
  expect(backup.value).toBeCloseTo(3.8,12);
  const expectedB=3.8/.82, expectedA=(-1+.72*expectedB)/.82;
  const result=evaluatePolicy(m,fixedPolicy(m,'right'),.9);
  expect(valueAt(m,result.values,'1,0')).toBeCloseTo(expectedB,7);
  expect(valueAt(m,result.values,'0,0')).toBeCloseTo(expectedA,7);
  expect(result.residual).toBeLessThanOrEqual(1e-8);
 });
 test('uniform stochastic policies use weighted action expectations without improvement',() => {
  const m=setup(), uniform=fixedPolicy(m,'uniform');
  // At B only right reaches G: .25*5 + .75*(-1) = .5.
  const first=sweep(m,[0,0,0],.9,uniform);
  expect(valueAt(m,first,'1,0')).toBe(.5);
  expect(evaluatePolicy(m,uniform,.9).policy).toEqual(uniform);
 });
 test('improvement, policy iteration, and value iteration agree with the analytic optimum',() => {
  const m=setup(), old=evaluatePolicy(m,fixedPolicy(m,'left'),.9);
  expect(Math.abs(old.values[0]+10)).toBeLessThanOrEqual(1e-7+1e-12); // residual/(1-gamma) bounds value error.
  const improved=improvePolicy(m,old.values,.9);
  expect(improved[m.index.get('1,0')]).toEqual([0,1,0,0]);
  const pi=policyIteration(m,.9), vi=valueIteration(m,.9);
  expect(pi.converged).toBe(true); expect(vi.converged).toBe(true);
  expect(pi.values).toEqual([3.5,5,0]); expect(vi.values).toEqual([3.5,5,0]);
  expect(pi.frames.some((f) => f.phase==='Policy evaluation')).toBe(true);
  expect(pi.frames.some((f) => f.phase==='Policy improvement' && f.changes>0)).toBe(true);
  expect(pi.sweeps).toBeGreaterThan(vi.sweeps);
 });
 test('gamma zero and deterministic tie order are explicit',() => {
  const m=setup(), vi=valueIteration(m,0);
  expect(vi.values).toEqual([-1,5,0]);
  expect(vi.policy[0]).toEqual([1,0,0,0]); // up wins the exact -1 tie.
 });
 test('gamma one accepts a proper absorbing fixed policy and rejects a continuing policy',() => {
  const m=setup(.2);
  const result=evaluatePolicy(m,fixedPolicy(m,'right'),1);
  expect(result.values[1]).toBeCloseTo(4.75,7);
  expect(result.values[0]).toBeCloseTo(3.5,7);
  expect(() => evaluatePolicy(m,fixedPolicy(m,'left'),1)).toThrow(/Gamma 1/);
  expect(() => valueIteration(m,1)).toThrow(/Gamma 1/);
  expect(() => policyIteration(m,1)).toThrow(/Gamma 1/);
 });
 test('gamma one finite-horizon task includes time in state and terminates correctly',() => {
  const map=lessonScenario('02',0); map.features.horizon=2;
  const model=buildModel(map), result=valueIteration(model,1);
  expect(model.states.every((s) => s.state.remaining!==undefined)).toBe(true);
  expect(result.converged).toBe(true); expect(result.values[0]).toBe(4);
 });
 test('budget stops do not masquerade as convergence or policy stability',() => {
  const model=setup(.8), result=evaluatePolicy(model,fixedPolicy(model,'right'),.9,{maxSweeps:1});
  expect(result.converged).toBe(false); expect(result.residual).toBeGreaterThan(1e-8);
  const pi=policyIteration(setup(),.9,{maxIterations:1});
  expect(pi.converged).toBe(false);
  expect(pi.residual).toBeGreaterThan(1);
 });
 test('invalid probabilities, budgets, values and discounts are rejected',() => {
  const m=setup();
  expect(() => evaluatePolicy(m,[[2,0,0,0]],.9)).toThrow();
  expect(() => valueIteration(m,NaN)).toThrow();
  expect(() => valueIteration(m,.9,{maxSweeps:0})).toThrow();
  expect(() => sweep(m,[Infinity],.9,null)).toThrow();
  expect(() => fixedPolicy(m,'invented')).toThrow();
 });
 test('planning frames carry the actual computed values, not decorative interpolation',() => {
  const model=setup(), result=valueIteration(model,.9);
  expect(result.frames[0].values).toEqual([-1,5,0]);
  expect(result.frames.at(-1).values).toEqual(result.values);
  expect(result.frames.at(-1).residual).toBe(result.residual);
 });
 test.each(['01','02','03'])('calculation configurations are tied to lesson %s', (id) => {
  const math=calculate(mathConfig(id)).summary;
  expect(math.config.lesson).toBe(id);
  expect(() => calculate({...math.config,phase:'experiment'})).toThrow(/Change/);
  expect(() => calculate({...math.config,parameter:Infinity})).toThrow();
 });
});

describe('evidence-derived activity progress',() => {
 test.each(['01','02','03'])('all six activities are required for lesson %s', (id) => {
  const record=completeFixture(id);
  expect(completion(id,record)).toBe(true);
  expect(requirements(id,record).filter((r) => r.done)).toHaveLength(6);
  const variants=[
   (r) => {r.attempts=r.attempts.filter((a) => a.stage!=='observe');},
   (r) => {r.prediction=null;},(r) => {r.mission=null;},(r) => {r.math=null;},
   (r) => {r.experiments=[];},(r) => {r.attempts=r.attempts.filter((a) => a.stage!=='challenge');}
  ];
  for (const change of variants) {const copy=structuredClone(record); change(copy); expect(completion(id,copy)).toBe(false);}
 });
 test('clicking all stages, and saving arbitrary reflection text, cannot complete an activity',() => {
  const record=emptyLesson('01');
  for (let stage=0;stage<6;stage++) {record.stage=stage; expect(completion('01',record)).toBe(false);}
  record.reflection='I understand everything perfectly.';
  expect(requirements('01',record).every((r) => !r.done)).toBe(true);
 });
 test('failed checks persist and old challenge answers stay tied to their experiment',() => {
  const r=completeFixture('03'), wrong=attempt('challenge',['999','The animation reached its last frame'],0);
  r.attempts.push(wrong); expect(checkAttempt('03',r,wrong)).toBe(false); expect(completion('03',r)).toBe(true);
  const config={lesson:'03',phase:'experiment',parameter:.7};
  r.experiments.push({config,prediction:{answer:'Test',at},result:calculate(config).summary});
  expect(checkAttempt('03',r,r.attempts[2])).toBe(true);
  expect(completion('03',r)).toBe(true);
  expect(checkAttempt('03',r,attempt('challenge',['1.5',foundations['03'].challengeCheck.correct],-1))).toBe(false);
 });
 test('mission thresholds distinguish actual successful play from navigation or an overlong episode',() => {
  expect(missionPassed('01',play('01',['right','right']))).toBe(true);
  expect(missionPassed('01',play('01',['up','up','up','up','up','right','right']))).toBe(false);
  expect(missionPassed('02',play('02',['right']))).toBe(false);
 });
 test('planning experiments agree over the available calibrated parameter range',() => {
  for(const parameter of [0,.05,.5,.8,.99]) {
   if(Math.abs(parameter-.9)<.05) continue;
   const r=calculate({lesson:'03',phase:'experiment',parameter}).summary;
   expect(r.converged).toEqual([true,true]);
   expect(Math.max(...r.values[0].map((v,i) => Math.abs(v-r.values[1][i])))).toBeLessThanOrEqual(1e-6);
  }
 });
});

describe('progress resume and bounded export/import',() => {
 test('round trips full activity evidence and hostile reflection text as inert data',() => {
  const p=emptyProgress(); p.lessons['01']=completeFixture('01'); p.lastLesson='01';
  p.lessons['01'].reflection='<img src=x onerror=alert(1)>'; p.lessons['01'].reflectionAt=at;
  expect(importProgress(exportProgress(p))).toEqual(p);
  expect(escapeHtml(p.lessons['01'].reflection)).not.toContain('<img');
 });
 test('refresh resumes the saved stage, environment, predictions, and progress without touching other keys',() => {
  const values=new Map([['acml:unrelated','preserve']]),storage={getItem:(k) => values.get(k)??null,setItem:(k,v) => values.set(k,v)};
  const first=new ProgressStore(storage);
  first.data.lessons['01']=completeFixture('01'); first.lesson('01').stage=5; first.save('01');
  const second=new ProgressStore(storage);
  expect(second.data).toEqual(first.data); expect(second.lesson('01').stage).toBe(5);
  expect(values.get('acml:unrelated')).toBe('preserve'); expect(values.has(PROGRESS_KEY)).toBe(true);
 });
 test.each([
  (p) => {p.schemaVersion=999;},(p) => {p.lessons['04']=emptyLesson('01');},
  (p) => {p.lessons['01'].completedAt=at;},
  (p) => {p.lessons['01'].prediction=null;p.lessons['01'].math=calculate(mathConfig('01')).summary;},
  (p) => {p.lessons['01'].reflection='x'.repeat(2001);},
  (p) => {p.lessons['01'].play.checkpoint='{}';},
  (p) => {p.lessons['01'].stage=6;},
 ])('rejects unsupported or inconsistent records %j',(mutate) => {
  const p=emptyProgress();p.lessons['01']=emptyLesson('01');mutate(p);
  expect(() => validateProgress(p)).toThrow();
 });
 test('rejects forged numerical results rather than accepting imported pass flags',() => {
  const p=emptyProgress();p.lessons['02']=completeFixture('02');
  p.lessons['02'].experiments[0].result.values[0][0]=999;
  expect(() => validateProgress(p)).toThrow(/Calculation evidence/);
 });
 test('invalid imports never replace in-memory progress and cannot pollute prototypes',() => {
  const store=new ProgressStore({getItem:() => null,setItem:() => {}});
  store.lesson('01').reflection='Keep this';
  for (const text of ['{"__proto__":{"polluted":true}}','x'.repeat(524289),'{"format":"other"}','{not json}']) expect(() => importProgress(text)).toThrow();
  expect(store.lesson('01').reflection).toBe('Keep this');expect({}.polluted).toBeUndefined();
  const exported=JSON.parse(exportProgress(emptyProgress()));exported.digest='bad';
  expect(() => importProgress(JSON.stringify(exported))).toThrow(/checksum/);
 });
 test('rejects duplicate and escaped duplicate keys before accepting a JSON record',() => {
  const exported=exportProgress(emptyProgress());
  expect(() => importProgress(exported.replace('"format":', '"format":"rl-island-progress","format":'))).toThrow(/Duplicate/);
  expect(() => importProgress(exported.replace('"format":', '"for\\u006dat":"rl-island-progress","format":').replace('for\\u006dat','for\u006dat'))).toThrow(/Duplicate/);
  const p=emptyProgress();p.lessons['01']=emptyLesson('01');
  p.lessons['01'].reflection='Quotes "format": {}, brackets [], a backslash \\ and repeated words format format';
  p.lessons['01'].reflectionAt=at;
  expect(importProgress(exportProgress(p))).toEqual(p);
 });
 test('unreadable stored progress survives new memory activity until explicit replacement',() => {
  const values=new Map([[PROGRESS_KEY,'{broken saved data}']]);
  const storage={getItem:(key)=>values.get(key)??null,setItem:(key,value)=>values.set(key,value)};
  const store=new ProgressStore(storage);
  store.lesson('01').prediction={answer:'Memory prediction',at};store.save('01');
  expect(values.get(PROGRESS_KEY)).toBe('{broken saved data}');
  expect(store.message).toContain('existing record is preserved');
  const validated=importProgress(exportProgress(store.data));
  store.replace(validated);
  expect(new ProgressStore(storage).data).toEqual(validated);
 });
 test('policy iteration exposes each actual evaluation sweep before improving',() => {
  const m=setup(),expected=evaluatePolicy(m,fixedPolicy(m,'left'),.5);
  const result=policyIteration(m,.5), frames=result.frames.filter(f=>f.round===1 && f.phase==='Policy evaluation');
  expect(frames.map(f=>f.values)).toEqual(expected.frames.map(f=>f.values));
  expect(result.frames.filter(f=>f.phase==='Policy evaluation')).toHaveLength(result.sweeps);
 });
 test('experiment evidence carries the exact scenario, representation, discount, and no sampling seed',() => {
  const result=calculate({lesson:'02',phase:'experiment',parameter:.4}).summary;
  expect(result.context.scenario).toEqual(lessonScenario('02',.4));
  expect(result.context).toMatchObject({discount:.9,representation:'full-position',engineVersion:1,calculationVersion:'foundations-v1',seed:null,policy:'fixed-right'});
 });
 test('blocked and quota-limited storage keep memory progress and export usable',() => {
  const store=new ProgressStore({getItem:() => {throw Error('blocked');},setItem:() => {throw Error('quota');}});
  store.lesson('01').prediction={answer:'Test',at};store.save('01');
  expect(store.message).toContain('Could not save');
  expect(importProgress(exportProgress(store.data)).lessons['01'].prediction.answer).toBe('Test');
 });
});

