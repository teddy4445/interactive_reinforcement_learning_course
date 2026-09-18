import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { mkdir, writeFile } from 'node:fs/promises';

const directory = 'evidence/task-11/screenshots';
const key = 'rl-island:environment:v1';
test.beforeAll(() => mkdir(directory, { recursive: true }));
test.beforeEach(async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('#/practice');
});
const button = (page, name) => page.getByRole('button', { name, exact: true });
const current = async (page) => JSON.parse(await page.locator('#current-state').textContent());
async function checkpoint(page) {
  await button(page, 'Save environment').click();
  return page.evaluate((key) => JSON.parse(localStorage.getItem(key)), key);
}
async function shot(page, name) {
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: directory + '/' + name + '.png', fullPage: (await page.locator('dialog[open]').count()) === 0, animations: 'disabled' });
}
async function scan(page) {
  expect((await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze()).violations).toEqual([]);
}
async function frozenClock(page) {
  await page.clock.install({ time: new Date('2026-09-17T11:00:00Z') });
  await page.clock.pauseAt(new Date('2026-09-17T12:00:00Z'));
}

test('keyboard movement, collision trace, goal reward, and absorbing terminal gameplay', async ({ page }) => {
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  expect(await current(page)).toEqual({ x: 1, y: 6 });
  await button(page, 'Step').click(); // Default right into wall.
  await expect(page.locator('#live-state')).toContainText('Reward -3');
  await expect(page.locator('#last-transition')).toContainText('right · blocked');
  await expect(page.locator('#episode-return')).toHaveText('-3');
  await page.locator('#island-canvas').focus();
  await page.keyboard.press('w');
  expect(await current(page)).toEqual({ x: 1, y: 5 });
  await expect(page.locator('#episode-steps')).toHaveText('2');
  await scan(page);
  await shot(page, 'manual-keyboard-desktop');
  await button(page, 'Reset episode').click();
  await page.locator('#island-canvas').focus();
  await page.keyboard.press('ArrowDown');
  for (let i = 0; i < 6; i++) await page.keyboard.press('ArrowRight');
  expect(await current(page)).toEqual({ x: 7, y: 7 });
  await expect(page.locator('#episode-status')).toHaveText('Task terminated · goal');
  await expect(page.locator('#episode-steps')).toHaveText('7');
  await expect(page.locator('#episode-return')).toHaveText('13');
  await expect(page.locator('#last-transition')).toContainText('true / false');
  await expect(button(page, 'Step')).toBeDisabled();
  await expect(button(page, 'Run')).toBeDisabled();
  const saved = await checkpoint(page);
  await page.locator('#island-canvas').focus();
  await page.keyboard.press('ArrowLeft');
  expect(await checkpoint(page)).toEqual(saved);
  await shot(page, 'manual-goal-desktop');
  expect(errors).toEqual([]);
  expect(await page.evaluate(() => Object.keys(localStorage))).toEqual([key]);
});

test('text map and Canvas hit testing inspect cells without moving or drawing RNG', async ({ page }) => {
  const before = await checkpoint(page);
  await page.locator('.text-map summary').click();
  await page.locator('#accessible-map button[tabindex="0"]').focus();
  await page.keyboard.press('ArrowRight');
  await expect(page.locator('#cell-details')).toHaveText('Column 2, row 6: wall.');
  await expect(page.locator('#accessible-map button[tabindex="0"]')).toBeFocused();
  expect(await checkpoint(page)).toEqual(before);
  const canvas = page.locator('#island-canvas'), bounds = await canvas.boundingBox();
  await canvas.click({ position: { x: 28 + (bounds.width - 56) / 8 * 7.5, y: 28 + (bounds.height - 56) / 8 * 7.5 } });
  await expect(page.locator('#cell-details')).toHaveText('Column 7, row 7: goal.');
  expect(await checkpoint(page)).toEqual(before);
  await scan(page);
  await shot(page, 'text-map-desktop');
});

test('touch movement, slippery probabilities, and mobile inspector use real state', async ({ browser }) => {
  const context = await browser.newContext({ baseURL: 'http://127.0.0.1:4173/rl-island/', viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true, reducedMotion: 'reduce' });
  const page = await context.newPage();
  try {
    await page.goto('#/practice');
    await button(page, 'Move down').tap();
    expect(await current(page)).toEqual({ x: 1, y: 7 });
    await page.getByRole('combobox', { name: 'Island', exact: true }).selectOption('slippery-shore');
    await button(page, 'Move up').tap();
    await page.getByRole('tab', { name: 'Inspector', exact: true }).tap();
    await expect(page.locator('#last-transition')).toContainText('80%');
    await expect(page.locator('#last-transition')).toContainText('10%');
    await expect(page.locator('#last-transition')).toContainText('Chosen action');
    await expect(page.locator('#agent-observation')).toContainText('"partial":false');
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    const target = await button(page, 'Move up').boundingBox();
    expect(target.width).toBeGreaterThanOrEqual(44);
    expect(target.height).toBeGreaterThanOrEqual(44);
    await scan(page);
    await shot(page, 'slippery-inspector-touch-mobile');
    await page.getByRole('tab', { name: 'Results', exact: true }).tap();
    await expect(page.locator('#episode-steps')).toHaveText('1');
    await shot(page, 'manual-results-touch-mobile');
  } finally { await context.close(); }
});

test('Run/Pause/resume and Step produce identical seeded checkpoints and traces', async ({ page }) => {
  await frozenClock(page);
  await page.getByRole('combobox', { name: 'Island', exact: true }).selectOption('slippery-shore');
  await page.getByRole('combobox', { name: 'Next action', exact: true }).selectOption('up');
  await button(page, 'Run').click(); // First step immediately.
  await page.clock.runFor(1000);
  await expect(page.locator('#episode-steps')).toHaveText('3');
  await button(page, 'Pause').click();
  await page.clock.runFor(5000);
  await expect(page.locator('#episode-steps')).toHaveText('3');
  await button(page, 'Run').click();
  await page.clock.runFor(500);
  await button(page, 'Pause').click();
  await expect(page.locator('#episode-steps')).toHaveText('5');
  const continuous = await checkpoint(page);
  const continuousTrace = await page.locator('#trace-rows').textContent();
  await button(page, 'Reset episode').click();
  for (let i = 0; i < 5; i++) await button(page, 'Step').click();
  expect(await checkpoint(page)).toEqual(continuous);
  expect(await page.locator('#trace-rows').textContent()).toBe(continuousTrace);
  await writeFile('evidence/task-11/manual-replay.json', JSON.stringify({ source: 'Actual browser manual run and single-step replay, no learning algorithm', checkpoint: continuous }, null, 2));
});

test('leaving the free manual lab cancels Run and preserves its session', async ({ page }) => {
  await frozenClock(page);
  await button(page, 'Run').click();
  await page.clock.runFor(500);
  await expect(page.locator('#episode-steps')).toHaveText('2');
  await page.getByRole('navigation', { name: 'Primary navigation' }).getByRole('link', { name: 'Island', exact: true }).click();
  // Let hash-route disposal finish before advancing mocked timers.
  await expect(page.getByRole('heading', { name: 'Your island of ideas', exact: true })).toBeVisible();
  await page.clock.runFor(5000);
  await page.getByRole('link', { name: 'Open the free manual lab', exact: true }).click();
  await expect(page.locator('#episode-steps')).toHaveText('2');
  await expect(button(page, 'Run')).toHaveAttribute('aria-pressed', 'false');
  await page.clock.runFor(2000);
  await expect(page.locator('#episode-steps')).toHaveText('2');
});

test('external timeout is visibly truncated, nonterminal, and cannot keep accumulating rewards', async ({ page }) => {
  await frozenClock(page);
  await button(page, 'Run').click();
  await page.clock.runFor(39500);
  await expect(page.locator('#episode-status')).toHaveText('Rollout truncated · external limit');
  await expect(page.locator('#episode-steps')).toHaveText('80');
  await expect(page.locator('#episode-return')).toHaveText('-240');
  await expect(page.locator('#last-transition')).toContainText('false / true');
  await expect(page.locator('#next-outcomes')).toContainText('-3');
  const stopped = await checkpoint(page);
  await page.clock.runFor(5000);
  expect(await checkpoint(page)).toEqual(stopped);
  expect(stopped.state).toEqual({ x: 1, y: 6 });
  expect(stopped.terminated).toBe(false);
  expect(stopped.truncated).toBe(true);
  await shot(page, 'external-truncation-desktop');
});

test('checkpoint replacement is explicit, survives refresh, and resumes exactly; reset meanings differ', async ({ page }) => {
  test.setTimeout(60000); // Includes reload, axe, screenshot, and two confirmation flows.
  await page.getByRole('combobox', { name: 'Island', exact: true }).selectOption('slippery-shore');
  await button(page, 'Move up').click();
  const saved = await checkpoint(page);
  await button(page, 'Move right').click();
  const expected = await checkpoint(page);
  await page.evaluate(({ key, saved }) => localStorage.setItem(key, JSON.stringify(saved)), { key, saved });
  await page.reload();
  await expect(page.locator('#episode-steps')).toHaveText('0');
  await button(page, 'Load environment').click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await button(page, 'Cancel').click();
  await expect(page.locator('#episode-steps')).toHaveText('0');
  await button(page, 'Load environment').click();
  await button(page, 'Load checkpoint').click();
  expect(await current(page)).toEqual(saved.state);
  await expect(page.locator('#episode-steps')).toHaveText('1');
  await expect(page.locator('#trace-rows')).toContainText('does not include earlier trace history');
  await button(page, 'Move right').click();
  expect(await checkpoint(page)).toEqual(expected);
  await button(page, 'Reset learning').click();
  await expect(page.getByRole('dialog')).toContainText('without moving Robo');
  await scan(page);
  await shot(page, 'reset-learning-confirmation-desktop');
  await button(page, 'Cancel').click();
  expect(await checkpoint(page)).toEqual(expected);
  await button(page, 'Reset learning').click();
  await button(page, 'Clear parameters').click();
  expect(await checkpoint(page)).toEqual(expected);
  await button(page, 'Reset episode').click();
  await expect(page.locator('#episode-steps')).toHaveText('0');
  await expect(page.locator('#environment-message')).toContainText('parameters were preserved');
  await expect(page.locator('#trace-rows')).toContainText('No trace');
});

test('collectible mask changes once, is visible, and resets with the episode', async ({ page }) => {
  await page.getByRole('combobox', { name: 'Island', exact: true }).selectOption('collection-inlet');
  await button(page, 'Move up').click();
  expect(await current(page)).toEqual({ x: 1, y: 5, collected: 1 });
  await expect(page.locator('#live-state')).toContainText('Reward 3');
  await button(page, 'Move down').click();
  await button(page, 'Move up').click();
  await expect(page.locator('#live-state')).toContainText('Reward -1');
  await expect(page.locator('#agent-observation')).toContainText('"collected":1');
  await page.locator('.text-map summary').click();
  await expect(page.locator('[data-cell-x="1"][data-cell-y="5"]')).toHaveAttribute('aria-label', /consumed supply/);
  await scan(page);
  await shot(page, 'collectible-state-desktop');
  await button(page, 'Reset episode').click();
  expect(await current(page)).toEqual({ x: 1, y: 6, collected: 0 });
});

test('invalid seed and hostile checkpoint errors preserve the current episode', async ({ page }) => {
  await button(page, 'Move down').click();
  const before = await checkpoint(page);
  await page.getByLabel('Environment seed', { exact: true }).fill('-1');
  await button(page, 'Apply seed & reset').click();
  await expect(page.locator('#environment-message')).toContainText('Seed must be an integer');
  expect(await checkpoint(page)).toEqual(before);
  for (const invalid of ['{"__proto__":{"polluted":true}}', 'x'.repeat(65537), JSON.stringify({ ...before, schemaVersion: 999 })]) {
    await page.evaluate(({ key, invalid }) => localStorage.setItem(key, invalid), { key, invalid });
    await button(page, 'Load environment').click();
    await expect(page.getByRole('dialog')).toHaveCount(0);
    await expect(page.locator('#environment-message')).not.toBeEmpty();
    expect(await current(page)).toEqual(before.state);
  }
  expect(await page.evaluate(() => ({}).polluted)).toBeUndefined();
});

test('unavailable/quota-limited storage leaves memory-only gameplay usable', async ({ page }) => {
  await page.addInitScript(() => {
    Storage.prototype.setItem = () => { throw new DOMException('Fixture quota', 'QuotaExceededError'); };
    Storage.prototype.getItem = () => { throw new Error('Fixture unavailable storage'); };
  });
  await page.reload();
  await button(page, 'Move down').click();
  await button(page, 'Save environment').click();
  await expect(page.locator('#environment-message')).toContainText('storage is unavailable or full');
  expect(await current(page)).toEqual({ x: 1, y: 7 });
  await button(page, 'Load environment').click();
  await expect(page.locator('#environment-message')).toContainText('Fixture unavailable storage');
  await button(page, 'Move right').click();
  expect(await current(page)).toEqual({ x: 2, y: 7 });
});

test('resize/redraw and reduced motion do not change seeded manual transitions', async ({ page }) => {
  await page.getByRole('combobox', { name: 'Island', exact: true }).selectOption('slippery-shore');
  const sequence = ['up', 'left', 'down', 'right', 'up'];
  for (const action of sequence) await button(page, 'Move ' + action).click();
  const baseline = await checkpoint(page);
  await button(page, 'Reset episode').click();
  for (const [index, action] of sequence.entries()) {
    await page.setViewportSize({ width: index % 2 ? 1440 : 390, height: 900 });
    await page.emulateMedia({ reducedMotion: index % 2 ? 'reduce' : 'no-preference' });
    // Multiple draw-only frames between accepted actions.
    await page.evaluate(async () => { for (let i = 0; i < 10; i++) await new Promise(requestAnimationFrame); });
    await button(page, 'Move ' + action).click();
  }
  expect(await checkpoint(page)).toEqual(baseline);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});




