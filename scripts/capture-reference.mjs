import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
process.env.PLAYWRIGHT_BROWSERS_PATH ||= resolve('.local/browsers');
const { chromium } = await import('playwright');
const directory = 'evidence/task-00-01/reference';
await mkdir(directory, { recursive: true });
const browser = await chromium.launch();
const results = [];
for (const [name, width, height] of [['desktop', 1440, 900], ['mobile', 390, 844]]) {
  const page = await browser.newPage({ viewport: { width, height }, reducedMotion: 'reduce' });
  const failures = [];
  page.on('requestfailed', (request) => failures.push({ url: request.url(), error: request.failure()?.errorText }));
  try {
    const response = await page.goto('https://acml.teddylazebnik.com/', { waitUntil: 'networkidle', timeout: 45000 });
    await page.evaluate(() => document.fonts.ready);
    await page.screenshot({ path: `${directory}/acml-${name}.png`, fullPage: true, animations: 'disabled' });
    results.push({ name, status: response?.status(), title: await page.title(), screenshot: `acml-${name}.png`, failures });
  } catch (error) {
    results.push({ name, error: error.message, failures });
    if (await page.locator('body').count()) await page.screenshot({ path: `${directory}/acml-${name}-partial.png`, animations: 'disabled' });
  }
  await page.close();
}
await browser.close();
await writeFile(`${directory}/capture.json`, JSON.stringify({ capturedAt: new Date().toISOString(), results }, null, 2) + '\n');
console.log(JSON.stringify(results, null, 2));

