import {startStaticServer} from './static-preview.mjs';
import {readFile,writeFile,mkdir,readdir} from 'node:fs/promises';
import {resolve} from 'node:path';
import {createHash} from 'node:crypto';
const folder='release/rl-island-github-pages',evidence='evidence/github-pages',base='http://127.0.0.1:4180/rl-island/';
process.env.PLAYWRIGHT_BROWSERS_PATH??=resolve('.local/browsers');
// Resolve Playwright only after selecting the repository's cached browser path.
const {chromium,expect}=await import('@playwright/test');
await mkdir(evidence+'/screenshots',{recursive:true});
const inventory=JSON.parse(await readFile(evidence+'/packaging-rl-island-github-pages.json','utf8'));
const report={at:new Date().toISOString(),source:'Actual local browser check of the upload folder; not a GitHub-hosted deployment or student outcome',build:inventory.buildVersion,files:0,routes:[],errors:[],externalRequests:[]};
const server=await startStaticServer({port:4180,directory:folder});let browser;
const sha=b=>createHash('sha256').update(b).digest('hex');
try {
 for(const entry of inventory.files){const local=await readFile(folder+'/'+entry.path),response=await fetch(base+entry.path);expect(response.status).toBe(200);expect(sha(local)).toBe(entry.sha256);expect(Buffer.from(await response.arrayBuffer())).toEqual(local);if(entry.path!=='.nojekyll')expect(local).toEqual(await readFile('dist/'+entry.path));report.files++;}
 const walk=async dir=>(await Promise.all((await readdir(dir,{withFileTypes:true})).map(e=>e.isDirectory()?walk(dir+'/'+e.name):dir+'/'+e.name))).flat();
 expect((await walk(folder)).length).toBe(inventory.files.length);
 expect((await readFile(folder+'/.nojekyll')).length).toBe(0);
 browser=await chromium.launch();report.browser=browser.version();
 const context=await browser.newContext({viewport:{width:1440,height:900},reducedMotion:'reduce'}),page=await context.newPage();
 page.on('pageerror',e=>report.errors.push(e.message));page.on('console',m=>{if(m.type()==='error')report.errors.push(m.text());});
 context.on('request',r=>{if(!r.url().startsWith(base))report.externalRequests.push(r.url());});
 for(const route of ['welcome','lesson/09','notebook']){await page.goto(base+'#/'+route);await expect(page.locator('h1')).toBeVisible();report.routes.push(route);}
 await expect(page.locator('#offline-status')).toContainText('Complete course offline-ready',{timeout:30000});
 report.scope=await page.evaluate(async()=> (await navigator.serviceWorker.ready).scope);expect(report.scope).toBe(base);
 await page.goto(base+'#/welcome');await page.setViewportSize({width:390,height:844});await page.screenshot({path:evidence+'/screenshots/pages-mobile.png',animations:'disabled'});
 await context.setOffline(true);await page.goto(base+'#/lesson/11');await page.reload();await expect(page.locator('h1')).toContainText('Mimic');report.routes.push('lesson/11 (offline reload)');
 await page.setViewportSize({width:1440,height:900});await page.goto(base+'#/sandbox');await page.locator('[name="algorithm"]').selectOption('dqn');await page.locator('[name="alpha"]').fill('0.03');await page.locator('[name="prediction"]').fill('Packaging QA: exercise live offline DQN; not a student prediction or result.');await page.getByRole('button',{name:'Create new experiment',exact:true}).click();
 const action=name=>page.locator('[data-lab="'+name+'"]');await expect(action('step')).toBeEnabled({timeout:30000});await page.locator('#lab-batch').fill('60');await action('train').click();await expect(page.locator('#lab-output')).toContainText('60 real interactions',{timeout:60000});await expect(action('step')).toBeEnabled({timeout:15000});
 const saved=()=>page.evaluate(async()=>{const db=await new Promise((resolve,reject)=>{const r=indexedDB.open('rl-island-laboratory',1);r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error);});try{return await new Promise((resolve,reject)=>{const r=db.transaction('artifacts').objectStore('artifacts').getAll();r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error);});}finally{db.close();}});
 const before=(await saved()).find(a=>a.checkpoint?.interactions===60);expect(before.checkpoint.parameters.deep.runtime.backend).toBe('cpu');expect(before.checkpoint.parameters.updates).toBe(45);
 await action('evaluate').click();await expect(page.locator('#lab-output')).toContainText('Training updates: 0',{timeout:30000});await expect(action('step')).toBeEnabled();const after=(await saved()).find(a=>a.id===before.id);expect(after.checkpoint.parameters).toEqual(before.checkpoint.parameters);expect(after.evaluations[0].result.trainingUpdates).toBe(0);
 report.offlineNeural={realInteractions:60,optimizerUpdates:45,backend:'cpu',evaluation:after.evaluations[0].result,parametersFrozen:true};report.routes.push('sandbox (offline CPU training and evaluation)');
 await page.screenshot({path:evidence+'/screenshots/pages-offline-neural.png',fullPage:true,animations:'disabled'});
 expect(report.errors).toEqual([]);expect(report.externalRequests).toEqual([]);report.result='PASS';
} catch(error){report.result='FAIL';report.failure=error.stack;process.exitCode=1;}
finally{await writeFile(evidence+'/browser-smoke.json',JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify({result:report.result,files:report.files,routes:report.routes,build:report.build,failure:report.failure},null,2));await browser?.close();server.closeAllConnections();await new Promise(r=>server.close(r));}
