import {readStored} from '../helpers/storage.js';
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { mkdir, readFile, writeFile, readdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';

const screenshotDirectory = 'evidence/task-11/screenshots';
test.beforeAll(async () => {
  await mkdir(screenshotDirectory, { recursive: true });
  const assets = (await readdir('dist/assets')).filter((name) => name.endsWith('.js') || name.endsWith('.css'));
  const records = await Promise.all(assets.map(async (name) => ({ name, sha256: createHash('sha256').update(await readFile(`dist/assets/${name}`)).digest('hex') })));
  await writeFile('evidence/task-11/build.json', JSON.stringify({ capturedAt: new Date().toISOString(), assets: records }, null, 2) + '\n');
});

test('static subpath smoke: welcome loads with local assets and no runtime errors', async ({ page }) => {
  const errors = [], remote = [], failed = [];
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('request', (request) => { if (!request.url().startsWith('http://127.0.0.1:4173/')) remote.push(request.url()); });
  page.on('response', (response) => { if (response.status() >= 400) failed.push(response.url()); });
  await page.goto('');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('A small island.A world of learning.');
  await page.getByRole('link', { name: 'Explore the island' }).click();
  await expect(page.getByRole('heading', { level: 1 })).toBeFocused();
  await expect(page.locator('.lesson-list li')).toHaveCount(11);
  await page.locator('.lesson-list a').last().click();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Mimic learning');
  await page.reload();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Mimic learning');
  await page.goBack();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Your island of ideas');
  expect((await readStored(page,'rl-island:model-free-progress:v1')).lessons['11'].completedAt).toBeNull();
  expect(errors).toEqual([]);
  expect(remote).toEqual([]);
  expect(failed).toEqual([]);
});

test('all shell and unavailable routes support direct entry and reload', async ({ page }) => {
  for (const [route, title] of [['sandbox', 'Sandbox'], ['compare', 'Compare'], ['expedition', 'Final expedition'], ['notebook', 'Notebook'], ['settings', 'Settings'], ['lesson/01', 'Introduction to Reinforcement Learning'], ['lesson/99', 'Page not found'], ['components', 'Page not found']]) {
    await page.goto(`#/${route}`);
    await page.reload();
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(title);
  }
});

test('keyboard skip link, mobile menu, Escape, route focus, and workspace tabs', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('');
  await page.keyboard.press('Tab');
  await expect(page.getByRole('link', { name: 'Skip to content' })).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.locator('main')).toBeFocused();
  const menu = page.getByRole('button', { name: 'Menu' });
  await menu.click();
  await expect(menu).toHaveAttribute('aria-expanded', 'true');
  await page.keyboard.press('Escape');
  await expect(menu).toBeFocused();
  await expect(menu).toHaveAttribute('aria-expanded', 'false');
  await menu.click();
  await page.getByRole('navigation', { name: 'Primary navigation' }).getByRole('link', { name: 'Island', exact: true }).click();
  await expect(menu).toHaveAttribute('aria-expanded', 'false');
  await expect(page.getByRole('heading', { level: 1 })).toBeFocused();
  await page.getByRole('link', { name: 'Use the lesson list' }).click();
  await expect(page.locator('#lesson-list')).toBeFocused();
  await page.locator('.lesson-list a').first().click();
  await page.goto('#/practice');
  await page.getByRole('tab', { name: 'Instructions', exact: true }).focus();
  await page.keyboard.press('ArrowRight');
  await expect(page.getByRole('tab', { name: 'Inspector', exact: true })).toBeFocused();
  await expect(page.getByRole('tabpanel')).toContainText('True task state');
  await page.keyboard.press('End');
  await expect(page.getByRole('tabpanel')).toContainText('Ready to move');
  await expect(page.getByRole('button', { name: 'Step', exact: true })).toBeEnabled();
});

test('notebook tabs operate by keyboard without creating results', async ({ page }) => {
  await page.goto('#/notebook');
  await page.getByRole('tab', { name: 'Reflections' }).focus();
  await page.keyboard.press('ArrowRight');
  await expect(page.getByRole('tab', { name: 'Experiments' })).toBeFocused();
  await expect(page.getByRole('tabpanel')).toContainText('No experiments yet');
  await expect(page.getByRole('button', { name: 'Export progress' })).toBeEnabled();
  expect(await page.evaluate(() => Object.keys(localStorage))).toEqual([]);
});

test('display settings persist; defaults leave unrelated host data intact', async ({ page }) => {
  await page.goto('#/settings');
  await page.evaluate(() => localStorage.setItem('acml:unrelated', 'preserve me'));
  await page.getByLabel('Motion', { exact: true }).selectOption('reduced');
  await page.getByLabel('Text size').selectOption('large');
  await expect(page.locator('#settings-status')).toContainText('saved on this device');
  await page.reload();
  await expect(page.getByLabel('Text size')).toHaveValue('large');
  await expect(page.locator('html')).toHaveAttribute('data-motion', 'reduced');
  await page.getByRole('button', { name: 'Restore display defaults' }).click();
  expect(await page.evaluate(() => localStorage.getItem('acml:unrelated'))).toBe('preserve me');
  expect(await page.evaluate(() => Object.keys(localStorage).filter((key) => key.includes('progress')))).toEqual([]);
});

test('blocked storage keeps settings usable and gives a visible error', async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(window, 'localStorage', { get() { throw new Error('Storage blocked by fixture'); } });
  });
  await page.goto('#/settings');
  await expect(page.locator('#settings-status')).toContainText('storage is unavailable');
  await page.getByLabel('Text size').selectOption('large');
  await expect(page.locator('html')).toHaveAttribute('data-font-scale', 'large');
  await expect(page.locator('#settings-status')).toContainText('Could not save');
});

for (const [size, width, height] of [['desktop', 1440, 900], ['mobile', 390, 844]]) {
  for (const route of ['welcome', 'island', 'lesson/01', 'compare', 'notebook', 'settings']) {
    test(`${size} ${route}: accessible shell and screenshot`, async ({ page }) => {
      await page.setViewportSize({ width, height });
      await page.goto(`#/${route}`);
      await page.evaluate(() => document.fonts.ready);
      await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      const scan = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze();
      expect(scan.violations).toEqual([]);
      await page.screenshot({ path: `${screenshotDirectory}/${route.replace('/', '-')}-${size}.png`, fullPage: true, animations: 'disabled' });
      await page.screenshot({path:`${screenshotDirectory}/${route.replace('/', '-')}-${size}-viewport.png`,animations:'disabled'});
    });
  }
}

test('tablet and wide workspaces, mobile menu, large text, and reduced motion', async ({ page }) => {
  for (const [name, width, height] of [['tablet', 1024, 768], ['wide', 1920, 1080]]) {
    await page.setViewportSize({ width, height });
    await page.goto('#/lesson/02');
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.screenshot({ path: `${screenshotDirectory}/lesson-${name}.png`, fullPage: true, animations: 'disabled' });
  }
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('#/island');
  await page.getByRole('button', { name: 'Menu' }).click();
  await page.screenshot({ path: `${screenshotDirectory}/menu-mobile.png`, fullPage: true, animations: 'disabled' });
  await page.goto('#/settings');
  await page.getByLabel('Text size').selectOption('large');
  await page.setViewportSize({ width: 320, height: 700 });
  await page.goto('#/lesson/02');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  expect(await page.locator('.button').first().evaluate((button) => getComputedStyle(button).transitionDuration)).toBe('0s');
  await page.screenshot({ path: `${screenshotDirectory}/lesson-large-text-320.png`, fullPage: true, animations: 'disabled' });
});



