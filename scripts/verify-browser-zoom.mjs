/* global chrome */
import {chromium} from '@playwright/test';
import {preview} from 'vite';
import {resolve} from 'node:path';
import {mkdir,writeFile} from 'node:fs/promises';
import AxeBuilder from '@axe-core/playwright';
const evidence=process.env.RL_EVIDENCE_DIR??'evidence/task-10',extension=resolve('scripts/zoom-extension');
const server=await preview({preview:{host:'127.0.0.1',port:4177,strictPort:true}});let context;
try{
 await mkdir(evidence+'/screenshots',{recursive:true});
 context=await chromium.launchPersistentContext(resolve('.local/zoom-'+Date.now()),{channel:'chromium',headless:true,viewport:null,args:['--window-size=1440,1000','--disable-extensions-except='+extension,'--load-extension='+extension]});
 const worker=context.serviceWorkers()[0]??await context.waitForEvent('serviceworker'),page=await context.newPage(),cdp=await context.newCDPSession(page);await page.goto('http://127.0.0.1:4177/rl-island/#/practice');await page.locator('#island-canvas').waitFor();
 const measurements=[];
 async function capture(name,zoom,actual){
  await page.evaluate(()=>document.fonts.ready);
  const sizes=await page.evaluate(()=>({innerWidth,innerHeight,outerWidth,devicePixelRatio,scrollWidth:document.documentElement.scrollWidth,visualScale:visualViewport.scale}));
  const scan=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa','wcag22aa']).analyze();
  await page.locator(name==='manual'?'#island-canvas':name==='mathematics'?'.formula':'#lab-map').evaluate(e=>e.scrollIntoView({block:'center',behavior:'instant'}));
  // Playwright fullPage clips at CSS-pixel width when real tab zoom changes DPR.
  // Capture the actual visible browser surface, with no explicit CSS-pixel clip.
  const {data}=await cdp.send('Page.captureScreenshot',{format:'png',fromSurface:true,captureBeyondViewport:false}),bytes=Buffer.from(data,'base64');
  measurements.push({view:name,requestedZoom:zoom,actualZoom:actual,...sizes,screenshotWidth:bytes.readUInt32BE(16),screenshotHeight:bytes.readUInt32BE(20),violations:scan.violations});
  await writeFile(evidence+'/screenshots/actual-browser-zoom-'+name+'-'+zoom*100+'.png',bytes);
 }
 for(const zoom of [1,2,4]){
  const actual=await worker.evaluate(async zoom=>{const tab=(await chrome.tabs.query({})).find(t=>t.url?.includes('4177/rl-island'));await chrome.tabs.setZoomSettings(tab.id,{mode:'automatic',scope:'per-tab'});await chrome.tabs.setZoom(tab.id,zoom);return chrome.tabs.getZoom(tab.id);},zoom);
  await page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));
  await capture('manual',zoom,actual);
  if(zoom>1){
   await page.goto('http://127.0.0.1:4177/rl-island/#/lesson/01');await page.locator('[data-stage="1"]').click();if(await page.locator('[data-form="prediction"] select').count()){await page.locator('[data-form="prediction"] select').selectOption({index:1});await page.getByRole('button',{name:'Save prediction',exact:true}).click();}else await page.getByText('Saved prediction',{exact:true}).waitFor();await page.locator('[data-stage="3"]').click();if(await page.getByRole('button',{name:'Calculate worked example',exact:true}).count())await page.getByRole('button',{name:'Calculate worked example',exact:true}).click();await page.locator('.return-pair').waitFor();await capture('mathematics',zoom,actual);
   await page.locator('#lecture-toggle').click();await page.locator('#lecture-confirm').click();await page.locator('#lecture-start').click();await page.locator('[data-lab="step"]:enabled').waitFor();await page.locator('[data-lab="step"]').click();await page.locator('[data-lab="step"]:enabled').waitFor();await capture('lecture',zoom,actual);await page.locator('#lecture-toggle').click();await page.locator('#lecture-confirm').click();await page.goto('http://127.0.0.1:4177/rl-island/#/practice');
  }
 }
 await writeFile(evidence+'/actual-browser-zoom.json',JSON.stringify({source:'Real Chromium chrome.tabs.setZoom; no CSS zoom, viewport emulation or pinch scaling',browser:context.browser()?.version(),measurements},null,2));
 console.log(JSON.stringify(measurements.map(({violations,...m})=>({...m,violations:violations.map(v=>({id:v.id,nodes:v.nodes.map(n=>n.target)}))})),null,2));
 if(measurements.some(m=>Math.abs(m.actualZoom-m.requestedZoom)>1e-8||m.scrollWidth>m.innerWidth||m.violations.length))process.exitCode=1;
}finally{await context?.close();server.httpServer.closeAllConnections();await new Promise(r=>server.httpServer.close(r));}
