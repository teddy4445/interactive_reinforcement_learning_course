import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
process.env.PLAYWRIGHT_BROWSERS_PATH ||= resolve('.local/browsers');
const { chromium } = await import('playwright');
const { default: AxeBuilder } = await import('@axe-core/playwright');
const browser = await chromium.launch();
await mkdir('evidence/task-00-01/screenshots', { recursive: true });
const results = [];
for (const [name, width, height] of [['desktop',1440,900],['mobile',390,844]]) {
  const context=await browser.newContext({viewport:{width,height},reducedMotion:'reduce'});
  const page=await context.newPage();
  await page.goto('http://127.0.0.1:5173/rl-island/#/components');
  await page.getByRole('heading',{name:'Component reference'}).waitFor();
  await page.evaluate(()=>document.fonts.ready);
  const scan=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa','wcag22aa']).analyze();
  if(scan.violations.length) throw Error(JSON.stringify(scan.violations));
  await page.screenshot({path:`evidence/task-00-01/screenshots/components-${name}.png`,fullPage:true,animations:'disabled'});
  results.push({name,violations:scan.violations.length});
  if(name==='desktop') {
    await page.goto('http://127.0.0.1:5173/rl-island/#/island');
    await page.keyboard.press('Tab');
    await page.screenshot({path:'evidence/task-00-01/screenshots/keyboard-focus-desktop.png',animations:'disabled'});
    const tokens=await page.evaluate(()=>{
      const css=getComputedStyle(document.documentElement);
      return Object.fromEntries(['--acml-primary','--acml-secondary','--acml-radius-button','--acml-radius-xl'].map(key=>[key,css.getPropertyValue(key).trim()]));
    });
    results.push({tokens});
    if(tokens['--acml-primary']!=='#2563eb'||tokens['--acml-secondary']!=='#f43f5e'||tokens['--acml-radius-button']!=='8px'||tokens['--acml-radius-xl']!=='20px') throw Error('Token mismatch');
  }
  await context.close();
}
await browser.close();
await writeFile('evidence/task-00-01/components-check.json',JSON.stringify({capturedAt:new Date().toISOString(),results},null,2)+'\n');
console.log(JSON.stringify(results));


