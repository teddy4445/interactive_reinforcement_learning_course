import {startStaticServer} from './static-preview.mjs';
import {readFile,writeFile,readdir,mkdir} from 'node:fs/promises';
import {resolve,relative,sep} from 'node:path';
import {createHash} from 'node:crypto';
import {resolveRoute} from '../src/app/router.js';

process.env.PLAYWRIGHT_BROWSERS_PATH??=resolve('.local/browsers');
// Resolve Playwright only after selecting the repository's cached browser path.
const {chromium,expect}=await import('@playwright/test');
const evidence='evidence/task-11',base='http://127.0.0.1:4176/rl-island/';
await mkdir(evidence,{recursive:true});
const server=await startStaticServer({port:4176});let browser;
const report={at:new Date().toISOString(),server:'Plain Node static server, dist only, no transform or route fallback',base,assets:[],routes:[],externalLinks:[],requests:[],errors:[]};
const sha=body=>createHash('sha256').update(body).digest('hex');
try {
  const manifest=JSON.parse(await readFile('dist/offline-manifest.json','utf8'));report.buildVersion=manifest.version;
  const walk=async directory=>(await Promise.all((await readdir(directory,{withFileTypes:true})).map(e=>e.isDirectory()?walk(resolve(directory,e.name)):resolve(directory,e.name)))).flat();
  for(const path of await walk(resolve('dist'))){
    const name=relative(resolve('dist'),path).split(sep).join('/'),body=await readFile(path),response=await fetch(base+name);
    expect(response.status, name).toBe(200);expect(Buffer.from(await response.arrayBuffer()),name).toEqual(body);
    const entry=manifest.entries.find(e=>e.url==='/rl-island/'+name);
    if(!['sw.js','offline-manifest.json'].includes(name)){expect(entry,name+' in complete offline inventory').toBeTruthy();expect(entry.sha256).toBe(sha(body));}
    expect(name).not.toMatch(/\.(pdf|map|env|ts)$/);report.assets.push({name,bytes:body.length,sha256:sha(body),mime:response.headers.get('content-type')});
  }
  for(const url of ['http://127.0.0.1:4176/','http://127.0.0.1:4176/rl-island/missing.js','http://127.0.0.1:4176/rl-island/lesson/01','http://127.0.0.1:4176/rl-island/%2e%2e/package.json'])expect((await fetch(url)).status).toBe(404);
  browser=await chromium.launch();report.browser=browser.version();
  const context=await browser.newContext({serviceWorkers:'block'}),page=await context.newPage();
  context.on('request',r=>{report.requests.push({url:r.url(),method:r.method()});});
  page.on('pageerror',error=>report.errors.push(error.message));
  page.on('console',message=>{if(message.type()==='error')report.errors.push(message.text());});
  page.on('response',r=>{if(r.status()>=400)report.errors.push(r.status()+' '+r.url());});
  const routes=['welcome','island','sandbox','compare','notebook','expedition','settings','practice',...Array.from({length:11},(_,i)=>'lesson/'+String(i+1).padStart(2,'0'))];
  const external=new Set();
  for(const route of routes){
    await page.goto(base+'#/'+route);await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('main')).not.toContainText('Coming soon');
    const links=await page.locator('a[href]').evaluateAll(nodes=>nodes.map(n=>n.getAttribute('href')));
    for(const href of links){if(href.startsWith('#/'))expect(resolveRoute(href).page,route+' link '+href).not.toBe('not-found');else if(/^https?:/.test(href))external.add(href);else if(!href.startsWith('#'))expect((await fetch(new URL(href,base))).status,href).toBe(200);}
    report.routes.push({route,title:await page.locator('h1').innerText(),links});
  }
  await page.goto(base+'#/lesson/99');await expect(page.locator('main')).toContainText('Page not found');
  report.externalLinks=[...external];
  expect(report.requests.filter(r=>!r.url.startsWith(base)||r.method!=='GET')).toEqual([]);
  expect(report.errors).toEqual([]);report.result='PASS';
} catch(error){report.result='FAIL';report.failure=error.stack;process.exitCode=1;}
finally {await writeFile(evidence+'/static-release.json',JSON.stringify(report,null,2));console.log(JSON.stringify({result:report.result,build:report.buildVersion,assets:report.assets.length,routes:report.routes.length,failure:report.failure},null,2));await browser?.close();server.closeAllConnections();await new Promise(r=>server.close(r));}
