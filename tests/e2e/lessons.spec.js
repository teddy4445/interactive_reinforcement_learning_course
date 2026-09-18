import {readStored} from '../helpers/storage.js';
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { mkdir, readFile } from 'node:fs/promises';

const dir='evidence/task-11/screenshots', key='rl-island:progress:v1';
test.beforeAll(() => mkdir(dir,{recursive:true}));
const stage=(page,index) => page.locator('[data-stage="'+index+'"]').click();
const check=(page,kind) => page.locator('form[data-check="'+kind+'"]');
async function answerCheck(page,kind,value,choice) {
 const form=check(page,kind);
 if (kind==='observe') await form.locator('select').selectOption({index:1});
 else {await form.locator('input').fill(value); if(choice!==undefined) await form.locator('select').selectOption({index:choice});}
 await form.locator('button').click();
 await expect(page.locator('#lesson-feedback')).toContainText('Correct.');
}
async function predict(page) {
 await stage(page,1);
 await page.locator('form[data-form="prediction"] select').selectOption({index:1});
 await page.getByRole('button',{name:'Save prediction',exact:true}).click();
}
async function runMath(page,id) {
 await stage(page,3);
 await page.getByRole('button',{name:id==='01' ? 'Calculate worked example' : 'Compute planning frames',exact:true}).click();
 if (id!=='01') {
  await expect(page.locator('#animated-values')).toBeVisible();
  await page.getByRole('button',{name:'Show final computed result',exact:true}).click();
 }
 await answerCheck(page,'math',{'01':'4.05','02':'3.8','03':'3.5'}[id]);
}
async function experiment(page,id) {
 await stage(page,4);
 await page.locator('form[data-form="experiment"] textarea').fill('Browser QA prediction: compare the changed parameter with the worked example.');
 await page.getByRole('button',{name:'Save experiment prediction',exact:true}).click();
 await expect(page.locator('.lesson-stage')).toContainText('Prediction saved before this run');
 await page.getByRole('button',{name:id==='01' ? 'Calculate experiment' : 'Compute experiment frames',exact:true}).click();
 if(id!=='01') await page.getByRole('button',{name:'Show final computed result',exact:true}).click();
}
async function screenshot(page,name) {
 await page.evaluate(() => document.fonts.ready);
 await page.screenshot({path:dir+'/'+name+'.png',fullPage:true,animations:'disabled'});
}
async function axe(page) {
 expect((await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa','wcag22aa']).analyze()).violations).toEqual([]);
}
async function complete(page,id) {
 await page.goto('#/lesson/'+id);
 await answerCheck(page,'observe');
 await predict(page);
 await stage(page,2);
 if (id==='02') {
  await page.getByRole('button',{name:'Follow right policy once',exact:true}).click();
  await page.getByRole('button',{name:'Follow right policy once',exact:true}).click();
 } else {
  await page.locator('#lesson-canvas').focus(); await page.keyboard.press('ArrowRight'); await page.keyboard.press('ArrowRight');
 }
 await expect(page.locator('#lesson-state')).toContainText('2 actions');
 // Actual activity and environment resume, before any completed lesson exists.
 const state=await page.locator('#lesson-state').textContent();
 await page.reload();
 await expect(page.locator('#lesson-state')).toHaveText(state);
 await runMath(page,id);
 await experiment(page,id);
 await screenshot(page,'lesson-'+id+'-experiment-desktop');
 await axe(page);
 await stage(page,5);
 // Preserve an unsuccessful attempt before the correct answer.
 const form=check(page,'challenge');
 await form.locator('input').fill('999');
 await form.locator('select').selectOption({index:2});
 await form.locator('button').click();
 await expect(page.locator('#lesson-feedback')).toContainText('Not yet.');
 await expect(page.getByRole('heading',{name:'Evidence still needed',exact:true})).toBeVisible();
 await answerCheck(page,'challenge',{'01':'3.5','02':'2.6','03':'1.5'}[id],1);
 await expect(page.getByRole('heading',{name:'Lesson complete',exact:true})).toBeVisible();
 await page.locator('form[data-form="reflection"] textarea').fill('Browser QA reflection for lesson '+id+': this is an interaction test record, not a student result.');
 await page.getByRole('button',{name:'Save reflection',exact:true}).click();
 await expect(page.locator('#lesson-feedback')).toContainText('without automatic interpretation or grading');
 await screenshot(page,'lesson-'+id+'-complete-desktop');
}

test('complete all three lessons, resume, notebook, export, explicit import, and available later lessons',async({page,browser}) => {
 test.setTimeout(180000);
 const errors=[],remote=[];
 page.on('pageerror',e=>errors.push(e.message));
 page.on('request',r=>{if(!r.url().startsWith('http://127.0.0.1:4173/'))remote.push(r.url());});
 await page.setViewportSize({width:1440,height:900});
 for (const id of ['01','02','03']) await complete(page,id);
 const progress=(await readStored(page,key));
 expect(Object.values(progress.lessons).every(r=>r.completedAt)).toBe(true);
 expect(progress.lessons['01'].attempts.filter(a=>a.stage==='challenge')).toHaveLength(2);
 await page.goto('#/island');
 await expect(page.locator('[data-lesson-status="Complete"]')).toHaveCount(3);
 await expect(page.locator('[data-lesson-status="Not available yet"]')).toHaveCount(0);
 await expect(page.locator('.record-card')).toContainText('3 of 11 available lessons complete');
 await screenshot(page,'island-completed-desktop');
 await page.goto('#/notebook');
 await expect(page.locator('.reflection-text')).toHaveCount(3);
 await axe(page); await screenshot(page,'notebook-reflections-desktop');
 await page.getByRole('tab',{name:'Experiments',exact:true}).click();
 await expect(page.locator('#notebook-entries')).toContainText('value-iteration');
 await screenshot(page,'notebook-experiments-desktop');
 await page.getByRole('tab',{name:'Completion',exact:true}).click();
 await expect(page.locator('#notebook-entries')).toContainText('challenge: Try again');
 await expect(page.locator('#notebook-entries')).toContainText('challenge: Correct');
 await axe(page); await screenshot(page,'notebook-check-history-desktop');
 const downloadPromise=page.waitForEvent('download');
 await page.getByRole('button',{name:'Export progress',exact:true}).click();
 const download=await downloadPromise;
 await download.saveAs('evidence/task-11/browser-qa-progress.json');
 const exported=await readFile('evidence/task-11/browser-qa-progress.json','utf8');
 expect(JSON.parse(exported).kind).toBe('self-reported-learning-artifact');
 const context=await browser.newContext({baseURL:'http://127.0.0.1:4173/rl-island/'});
 const importedPage=await context.newPage();
 try {
  await importedPage.goto('#/notebook');
  await importedPage.evaluate(()=>localStorage.setItem('acml:unrelated','preserve'));
  await importedPage.locator('#progress-file').setInputFiles({name:'qa.json',mimeType:'application/json',buffer:Buffer.from(exported)});
  await expect(importedPage.getByRole('dialog')).toContainText('3 complete');
  await importedPage.getByRole('button',{name:'Cancel',exact:true}).click();
  expect(await importedPage.evaluate(key=>localStorage.getItem(key),key)).toBeNull();
  await importedPage.locator('#progress-file').setInputFiles({name:'qa.json',mimeType:'application/json',buffer:Buffer.from(exported)});
  await importedPage.getByRole('button',{name:'Replace progress',exact:true}).click();
  await expect(importedPage.locator('.reflection-text')).toHaveCount(3);
  await expect(importedPage.getByRole('link',{name:'Resume lesson 03',exact:true})).toBeVisible();
  await importedPage.reload();
  await importedPage.getByRole('link',{name:'Resume lesson 03',exact:true}).click();
  await expect(importedPage.getByRole('heading',{name:'Lesson complete',exact:true})).toBeVisible();
  expect(await importedPage.evaluate(()=>localStorage.getItem('acml:unrelated'))).toBe('preserve');
  await importedPage.goto('#/lesson/11');
  await expect(importedPage.getByRole('heading',{name:'Observe: learn from demonstrated actions',exact:true})).toBeVisible();
  expect(await importedPage.locator('[data-stage]').count()).toBe(0);
 } finally {await context.close();}
 expect(errors).toEqual([]); expect(remote).toEqual([]);
});

test('exploring ahead and saving free text do not grant completion or reveal pre-prediction results',async({page})=>{
 await page.goto('#/lesson/03');
 for(const index of [5,4,3,2]) {
  await stage(page,index);
  await expect(page.getByRole('heading',{name:'Save a prediction first',exact:true})).toBeVisible();
  await expect(page.locator('.computed-result')).toHaveCount(0);
 }
 await predict(page); await stage(page,5);
 await page.locator('form[data-form="reflection"] textarea').fill('<img src=x onerror="window.injected=true"> I declare myself complete.');
 await page.getByRole('button',{name:'Save reflection',exact:true}).click();
 await expect(page.getByRole('heading',{name:'Evidence still needed',exact:true})).toBeVisible();
 await page.goto('#/notebook');
 await expect(page.locator('.reflection-text')).toContainText('<img');
 expect(await page.locator('.reflection-text img').count()).toBe(0);
 expect(await page.evaluate(()=>window.injected)).toBeUndefined();
 await page.goto('#/island');
 await expect(page.locator('[data-lesson-status="Complete"]')).toHaveCount(0);
});

test('actual computed planning frames advance, pause, and cancel on stage navigation',async({page})=>{
 await page.clock.install({time:new Date('2026-09-17T11:00:00Z')});
 await page.clock.pauseAt(new Date('2026-09-17T12:00:00Z'));
 await page.goto('#/lesson/02'); await predict(page); await stage(page,3);
 await page.getByRole('button',{name:'Compute planning frames',exact:true}).click();
 await expect(page.locator('#animated-values')).toContainText('3.8');
 const first=await page.locator('#animated-values').textContent();
 await page.getByRole('button',{name:'Animate computed sweeps',exact:true}).click();
 await expect(page.getByRole('button',{name:'Pause animation',exact:true})).toBeFocused();
 await page.clock.runFor(350);
 await expect(page.getByRole('button',{name:'Pause animation',exact:true})).toBeFocused();
 expect(await page.locator('#animated-values').textContent()).not.toBe(first);
 await check(page,'math').locator('input').fill('3.8');
 await page.clock.runFor(350);
 await expect(check(page,'math').locator('input')).toBeFocused();
 await expect(check(page,'math').locator('input')).toHaveValue('3.8');
 await page.getByRole('button',{name:'Pause animation',exact:true}).click();
 const paused=await page.locator('#animated-values').textContent();
 await page.clock.runFor(2000);
 expect(await page.locator('#animated-values').textContent()).toBe(paused);
 await stage(page,0); await page.clock.runFor(2000);
 const progress=(await readStored(page,key));
 expect(progress.lessons['02'].math).toBeNull();
 await stage(page,3);
 await page.getByRole('button',{name:'Compute planning frames',exact:true}).click();
 await page.getByRole('button',{name:'Animate computed sweeps',exact:true}).click();
 await check(page,'math').locator('input').fill('3.8');
 await page.clock.runFor(20000);
 await expect(page.locator('.computed-result')).toBeVisible();
 await expect(check(page,'math').locator('input')).toBeFocused();
 await expect(check(page,'math').locator('input')).toHaveValue('3.8');
});

test('malformed imports and quota failures preserve memory progress and allow backup',async({page})=>{
 await page.addInitScript(()=>{
  Storage.prototype.setItem=()=>{throw new DOMException('Quota fixture','QuotaExceededError');};
 });
 await page.goto('#/lesson/01');await predict(page);
 await expect(page.locator('#progress-storage-status')).toContainText('Could not save');
 await page.goto('#/notebook');
 const download=page.waitForEvent('download');
 await page.getByRole('button',{name:'Export progress',exact:true}).click();
 expect((await download).suggestedFilename()).toBe('rl-island-progress.json');
 for(const json of ['{"__proto__":{"polluted":true}}','{"format":"unknown"}','x'.repeat(524289)]) {
  await page.locator('#progress-file').setInputFiles({name:'bad.json',mimeType:'application/json',buffer:Buffer.from(json)});
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await expect(page.locator('#transfer-status')).not.toBeEmpty();
 }
 await page.getByRole('tab',{name:'Experiments',exact:true}).click();
 await expect(page.locator('#notebook-entries')).toContainText('5 after one action');
});

for(const [name,width,height] of [['mobile',390,844],['tablet',1024,768],['wide',1920,1080],['large-text-320',320,700]]) {
 test('guided lesson responsive '+name,async({page})=>{
  await page.setViewportSize({width,height});
  if(width===320) {await page.goto('#/settings');await page.getByLabel('Text size').selectOption('large');}
  await page.goto('#/lesson/03');await predict(page);await stage(page,3);
  await page.getByRole('button',{name:'Compute planning frames',exact:true}).click();
  await page.getByRole('button',{name:'Show final computed result',exact:true}).click();
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  await axe(page);await screenshot(page,'lesson-03-math-'+name);
 });
}

test('touch lesson controls and keyboard stage navigation remain usable',async({browser})=>{
 const context=await browser.newContext({baseURL:'http://127.0.0.1:4173/rl-island/',viewport:{width:390,height:844},hasTouch:true,isMobile:true});
 const page=await context.newPage();
 try {
  await page.goto('#/lesson/01');await predict(page);await stage(page,2);
  await page.getByRole('button',{name:'Move right',exact:true}).tap();
  await page.getByRole('button',{name:'Move right',exact:true}).tap();
  await expect(page.locator('#lesson-state')).toContainText('Goal reached');
  await axe(page);await screenshot(page,'lesson-01-play-touch-mobile');
  await page.locator('[data-stage="3"]').focus();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('heading',{name:'Reveal the mathematics',exact:true})).toBeFocused();
 }finally{await context.close();}
});

