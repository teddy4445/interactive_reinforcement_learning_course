import {readStored} from '../helpers/storage.js';
import {test,expect} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import {mkdir,readFile,writeFile} from 'node:fs/promises';
import {observedWinner} from '../../src/evaluation/comparison.js';
const dir='evidence/task-11/screenshots',key='rl-island:model-free-progress:v1';
test.beforeAll(()=>mkdir(dir,{recursive:true}));
test.beforeEach(({page})=>page.setDefaultTimeout(15000));
const stage=(p,n)=>p.locator('[data-learning-stage="'+n+'"]').click();
const action=(p,name)=>p.getByRole('button',{name,exact:true});
async function picture(p,name){await p.evaluate(()=>document.fonts.ready);await p.screenshot({path:dir+'/'+name+'.png',fullPage:true,animations:'disabled'});}
async function axe(p){expect((await new AxeBuilder({page:p}).withTags(['wcag2a','wcag2aa','wcag21aa','wcag22aa']).analyze()).violations).toEqual([]);}
async function prediction(p){await stage(p,1);await p.locator('[data-learning-form="prediction"] textarea').fill('Browser QA prediction: compare actual targets and independently measured results; not a student learning result.');await action(p,'Save prediction').click();}
async function openLab(p,id){await p.goto('#/lesson/'+id);await prediction(p);await stage(p,2);await expect(action(p,'Step')).toBeEnabled();}
async function countEpisodes(p){const text=await p.locator('#run-facts').innerText();return Number(text.match(/(\d+) completed\/capped episodes/)[1]);}
async function train(p,n){const before=await countEpisodes(p);await p.getByLabel('Batch episodes',{exact:true}).fill(String(n));await action(p,'Train batch').click();await expect(p.locator('#run-facts')).toContainText((before+n)+' completed/capped episodes',{timeout:90000});await expect(action(p,'Train batch')).toBeEnabled();}
async function evaluate(p){const digest=await p.locator('#learning-fingerprint').innerText();await action(p,'Evaluate').click();await expect(p.locator('#evaluation-rule')).toContainText('five fresh episodes',{timeout:30000});expect(await p.locator('#learning-fingerprint').innerText()).toBe(digest);}
async function complete(p,id){
 await p.goto('#/lesson/'+id);await p.locator('[data-learning-check="observe"] select').selectOption({index:1});await action(p,'Check understanding').click();await expect(p.locator('#learning-feedback')).toContainText('Correct.');
 await prediction(p);await stage(p,2);await expect(action(p,'Step')).toBeEnabled();await action(p,'Step').click();await expect(p.locator('#learning-explanation')).toContainText('Actual update calculation');
 await action(p,'Episode').click();await expect(p.locator('#run-facts')).toContainText('1 completed/capped episodes');await train(p,id==='04'?30:60);await evaluate(p);
 await p.getByLabel('Overlay',{exact:true}).selectOption(id==='04'?'value':'q');expect(await p.locator('.learning-cell').evaluateAll(cells=>cells.every(c=>c.scrollHeight<=c.clientHeight+1))).toBe(true);await picture(p,'lesson-'+id+'-training-desktop');await axe(p);
 const before=await p.locator('#learning-fingerprint').innerText();await p.reload();await expect(p.locator('#learning-fingerprint')).toHaveText(before);await expect(p.locator('#evaluation-rule')).toContainText('five fresh episodes');
 await stage(p,3);const math=p.locator('[data-learning-check="math"]');await math.locator('[name="answer0"]').fill(id==='04'?'2.26':'3.398');await math.locator('[name="answer1"]').fill(id==='04'?'4.05':'3.686');await action(p,'Check both calculations').click();await expect(p.locator('#learning-feedback')).toContainText('Correct.');
 await stage(p,4);await p.locator('[data-learning-form="comparison"] textarea').fill('Browser QA comparison prediction. All five seeds and both methods will be retained, including failures.');await action(p,'Save prediction and run comparison').click();
 await expect(p.locator('#comparison-output')).toContainText('complete · 10 / 10',{timeout:180000});await expect(action(p,'Train batch')).toBeEnabled({timeout:15000});await picture(p,'lesson-'+id+'-comparison-desktop');await axe(p);
 const progress=(await readStored(p,key)),comparison=progress.lessons[id].comparisons.at(-1);expect(comparison.runs).toHaveLength(10);expect(comparison.runs.every(r=>r.evaluation.trainingUpdates===0)).toBe(true);
 await stage(p,5);const challenge=p.locator('[data-learning-check="challenge"]');await challenge.locator('[name="winner"]').selectOption('tie');await challenge.locator('[name="concept"]').selectOption({index:2});await action(p,'Submit challenge').click();await expect(p.locator('#learning-feedback')).toContainText('Not yet.');
 await challenge.locator('[name="winner"]').selectOption(observedWinner(comparison));await challenge.locator('[name="concept"]').selectOption({index:1});await action(p,'Submit challenge').click();await expect(p.getByRole('heading',{name:'Lesson complete',exact:true})).toBeVisible();
 await p.locator('[data-learning-form="reflection"] textarea').fill('Browser QA reflection: this checks saved evidence, not student understanding.');await action(p,'Save reflection').click();await expect(p.locator('#learning-feedback')).toContainText('without automatic grading');await picture(p,'lesson-'+id+'-complete-desktop');
}

test('both full learning journeys, refresh, real independent comparisons, notebook, and backup round trip',async({page,browser})=>{
 test.setTimeout(360000);const errors=[],remote=[];page.on('pageerror',e=>errors.push(e.message));page.on('request',r=>{if(!r.url().startsWith('http://127.0.0.1:4173/'))remote.push(r.url());});await page.setViewportSize({width:1440,height:900});
 await complete(page,'04');await complete(page,'05');await page.goto('#/island');await expect(page.locator('[data-lesson-status="Complete"]')).toHaveCount(2);await expect(page.locator('[data-lesson-status="Not available yet"]')).toHaveCount(0);await picture(page,'island-learning-complete');
 await page.goto('#/notebook');await expect(page.locator('#learning-notebook-records')).toContainText('Lesson 04 · Complete');await expect(page.locator('#learning-notebook-records')).toContainText('Lesson 05 · Complete');await axe(page);await picture(page,'learning-notebook-desktop');
 const downloaded=page.waitForEvent('download');await action(page,'Export learning data (04–11)').click();const download=await downloaded;await download.saveAs('evidence/task-11/browser-qa-learning.json');const text=await readFile('evidence/task-11/browser-qa-learning.json','utf8');expect(JSON.parse(text).kind).toBe('self-reported-learning-artifact');
 const context=await browser.newContext({baseURL:'http://127.0.0.1:4173/rl-island/'}),other=await context.newPage();try{
  await other.goto('#/notebook');await other.evaluate(()=>localStorage.setItem('acml:unrelated','keep'));await other.locator('#learning-backup-file').setInputFiles({name:'learning.json',mimeType:'application/json',buffer:Buffer.from(text)});await expect(other.getByRole('dialog')).toBeVisible();await other.locator('#cancel-learning-import').click();expect(await other.evaluate(k=>localStorage.getItem(k),key)).toBeNull();
  await other.locator('#learning-backup-file').setInputFiles({name:'learning.json',mimeType:'application/json',buffer:Buffer.from(text)});await other.locator('#confirm-learning-import').click();await expect(other.locator('#learning-transfer-status')).toContainText('replaced');await other.goto('#/lesson/05');await expect(other.getByRole('heading',{name:'Lesson complete',exact:true})).toBeVisible();await stage(other,2);await expect(action(other,'Step')).toBeEnabled();expect(await other.evaluate(()=>localStorage.getItem('acml:unrelated'))).toBe('keep');
  await other.goto('#/lesson/11');await expect(other.getByRole('heading',{name:'Observe: learn from demonstrated actions',exact:true})).toBeVisible();
 }finally{await context.close();}
 expect(errors).toEqual([]);expect(remote).toEqual([]);
});

test('worker pause/resume/cancel is responsive and preserves actual progress',async({page})=>{
 test.setTimeout(90000);await openLab(page,'05');await page.getByLabel('Batch episodes',{exact:true}).fill('1000');await action(page,'Train batch').click();await expect(page.locator('#learning-status')).toContainText('Worker: training');
 const pauseMs=await page.evaluate(async()=>{const start=performance.now();document.querySelector('[data-learning-action="pause"]').click();while(!document.querySelector('#learning-status').textContent.includes('Worker: paused'))await new Promise(r=>setTimeout(r,5));return performance.now()-start;});
 const stopped=await page.locator('#learning-fingerprint').innerText();await page.waitForTimeout(300);expect(await page.locator('#learning-fingerprint').innerText()).toBe(stopped);await picture(page,'worker-paused-desktop');await action(page,'Resume').click();await expect(page.locator('#learning-status')).toContainText('Worker: training');
 const cancelMs=await page.evaluate(async()=>{const start=performance.now();document.querySelector('[data-learning-action="cancel"]').click();while(!document.querySelector('#learning-status').textContent.includes('Worker: idle'))await new Promise(r=>setTimeout(r,5));return performance.now()-start;});
 await expect(action(page,'Step')).toBeEnabled();await writeFile('evidence/task-11/worker-latency.json',JSON.stringify({source:'Actual Chromium UI command-to-worker-status measurement on this Windows host; not a universal performance guarantee',pauseMs,cancelMs},null,2));expect(pauseMs).toBeLessThan(2000);expect(cancelMs).toBeLessThan(2000);
});

test('seeded tabular results are identical at live, slow, and disabled animation speeds',async({page})=>{
 test.setTimeout(120000);await openLab(page,'05');const digests=[];
 for(const speed of ['100','800','0']){
  if(digests.length){await page.locator('.learning-config summary').click();await action(page,'Reset learning').click();await expect(page.getByRole('dialog')).toBeVisible();await action(page,'Start fresh learning').click();await expect(page.locator('#run-facts')).toContainText('0 training interactions');}
  await page.getByLabel('Animation / display speed').selectOption(speed);await train(page,60);digests.push(await page.locator('#learning-fingerprint').innerText());
 }
 expect(new Set(digests).size).toBe(1);await writeFile('evidence/task-11/animation-replay.json',JSON.stringify({source:'Three actual worker training runs, same seed/config/60 episodes; only display frequency changed',speedsMs:[100,800,0],digests},null,2));
});

test('prediction MC updates after complete episodes; episode reset preserves tables; edits isolate curves',async({page})=>{
 await openLab(page,'04');await page.locator('.learning-config summary').click();await page.getByLabel('Method',{exact:true}).selectOption('mc');await action(page,'Start new experiment with these settings').click();await expect(page.locator('#run-facts')).toContainText('First-visit Monte Carlo');await action(page,'Episode').click();await expect(page.locator('#learning-explanation')).toContainText('mc first-visit return');
 const before=await page.locator('#learning-fingerprint').innerText();await page.getByLabel('Overlay',{exact:true}).selectOption('visits');await picture(page,'mc-visits-update');
 await page.locator('.learning-config summary').click();await action(page,'Reset episode').click();await expect(page.locator('#learning-feedback')).toContainText('learned parameters preserved');expect(await page.locator('#learning-fingerprint').innerText()).toBe(before);
 await page.getByLabel('Discount gamma').fill('0.5');await action(page,'Start new experiment with these settings').click();await expect(page.locator('#run-facts')).toContainText('0 training interactions');await expect(page.locator('#run-facts')).toContainText('γ 0.5');
});

test('exploring ahead and free text cannot grant completion or expose learning before prediction',async({page})=>{
 await page.goto('#/lesson/05');await stage(page,4);await expect(page.getByRole('heading',{name:'Save a prediction first',exact:true})).toBeVisible();await expect(page.locator('.learning-lab')).toHaveCount(0);await prediction(page);await stage(page,5);await page.locator('[name="reflection"]').fill('<img src=x onerror="alert(1)"> I claim mastery.');await action(page,'Save reflection').click();await expect(page.getByRole('heading',{name:'Evidence still needed',exact:true})).toBeVisible();await page.goto('#/notebook');await expect(page.locator('#learning-notebook-records img')).toHaveCount(0);await expect(page.locator('#learning-notebook-records')).toContainText('Incomplete');
});

test('route change cancels hidden training and refresh restores a checkpoint',async({page})=>{
 await openLab(page,'04');await train(page,10);const digest=await page.locator('#learning-fingerprint').innerText();await page.goto('#/island');await page.goto('#/lesson/04');await expect(page.locator('#learning-fingerprint')).toHaveText(digest);await page.getByLabel('Batch episodes',{exact:true}).fill('1000');await action(page,'Train batch').click();await page.goto('#/lesson/05');await expect(page.locator('#training-island')).toHaveCount(0);await page.waitForTimeout(300);await expect(page.locator('#learning-feedback')).not.toContainText('completed');
});

for(const [name,width,height] of [['mobile',390,844],['tablet',1024,768],['wide',1920,1080],['large-text-320',320,700]])test('learning lab accessible responsive '+name,async({page})=>{
 test.setTimeout(60000);await page.setViewportSize({width,height});if(width===320){await page.goto('#/settings');await page.getByLabel('Text size').selectOption('large');}await openLab(page,'05');await action(page,'Step').click();await expect(page.locator('#learning-explanation')).toContainText('Actual update calculation');expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);await axe(page);await picture(page,'learning-lab-'+name);
});

test('comparison cancellation and refresh preserve the original interactive experiment',async({page})=>{
 test.setTimeout(90000);await openLab(page,'05');await train(page,3);const original=await page.locator('#learning-fingerprint').innerText();await stage(page,4);await page.locator('[data-learning-form="comparison"] [name="episodes"]').fill('300');await page.locator('[data-learning-form="comparison"] textarea').fill('QA: a cancelled experiment is not a result.');await action(page,'Save prediction and run comparison').click();await expect(page.locator('#learning-status')).toContainText('Worker: training');await action(page,'Pause').click();await expect(page.locator('#learning-status')).toContainText('Worker: paused');await action(page,'Cancel').click();await expect(page.locator('#comparison-output')).toContainText('cancelled');await expect(page.locator('#learning-fingerprint')).toHaveText(original);await page.reload();await expect(page.locator('#comparison-output')).toContainText('cancelled');await expect(page.locator('#learning-fingerprint')).toHaveText(original);await page.goto('#/island');await expect(page.locator('[data-lesson-status="Complete"]')).toHaveCount(0);
});

test('storage denial leaves usable memory-only learning and a downloadable checkpoint',async({page})=>{
 await page.addInitScript(()=>{Storage.prototype.setItem=function(){throw new DOMException('QA quota','QuotaExceededError');};Object.defineProperty(window,'indexedDB',{value:{open(){throw Error('QA database denied');}}});});
 await openLab(page,'04');await action(page,'Episode').click();await expect(page.locator('#run-facts')).toContainText('1 completed/capped episodes');await expect(page.locator('#learning-storage')).toContainText('memory');await page.goto('#/notebook');const download=page.waitForEvent('download');await action(page,'Export learning data (04–11)').click();const exported=await download;const path=await exported.path(),data=JSON.parse(await readFile(path,'utf8'));expect(Object.values(data.runs)[0].parameters.updates).toBeGreaterThan(0);expect(data.progress.lessons['04'].completedAt).toBeNull();
});

test('invalid backup is rejected before replacement and touch controls collect real samples',async({browser})=>{
 const context=await browser.newContext({baseURL:'http://127.0.0.1:4173/rl-island/',viewport:{width:390,height:844},isMobile:true,hasTouch:true}),page=await context.newPage();try{
  await openLab(page,'05');await action(page,'Step').tap();await expect(page.locator('#run-facts')).toContainText('1 training interactions');await page.getByLabel('Overlay',{exact:true}).selectOption('policy');await expect(page.locator('#learning-table')).toContainText('policy');await picture(page,'learning-policy-touch-mobile');await page.getByLabel('Overlay',{exact:true}).selectOption('error');await picture(page,'learning-error-touch-mobile');await page.goto('#/notebook');const before=await page.evaluate(k=>localStorage.getItem(k),key);await page.locator('#learning-backup-file').setInputFiles({name:'bad.json',mimeType:'application/json',buffer:Buffer.from('{"schemaVersion":1,"schemaVersion":1}')});await expect(page.locator('#learning-transfer-status')).toContainText('Duplicate');await expect(page.getByRole('dialog')).toHaveCount(0);expect(await page.evaluate(k=>localStorage.getItem(k),key)).toBe(before);
 }finally{await context.close();}
});


test('trained Q overlay remains contained and its map scroller works at narrow large text',async({page})=>{
 test.setTimeout(60000);await page.setViewportSize({width:320,height:700});await page.goto('#/settings');await page.getByLabel('Text size').selectOption('large');await openLab(page,'05');await train(page,20);await page.getByLabel('Overlay',{exact:true}).selectOption('q');expect(await page.locator('.learning-cell').evaluateAll(cells=>cells.every(c=>c.scrollHeight<=c.clientHeight+1))).toBe(true);expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);const scroll=page.getByRole('region',{name:'Island map; scroll sideways if needed'});await scroll.focus();await page.keyboard.press('End');await expect(scroll).toBeFocused();await axe(page);await picture(page,'learning-q-large-text-320');
});
