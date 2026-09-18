# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: shell.spec.js >> blocked storage keeps settings usable and gives a visible error
- Location: tests\e2e\shell.spec.js:99:1

# Error details

```
Error: expect(locator).toContainText(expected) failed

Locator: getByRole('status')
Expected substring: "storage is unavailable"
Error: strict mode violation: getByRole('status') resolved to 2 elements:
    1) <p role="status" id="storage-status">Learning progress could not be read. Existing dat…</p> aka getByText('Learning progress could not')
    2) <p role="status" class="small" id="settings-status">Browser storage is unavailable or unreadable. Dis…</p> aka getByText('Browser storage is unavailable or unreadable. Display settings apply only to')

Call log:
  - Expect "toContainText" getByRole('status') with timeout 5000ms
  - waiting for getByRole('status')

```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - link "Skip to content" [ref=e2] [cursor=pointer]:
    - /url: "#main"
  - generic [ref=e3]:
    - banner [ref=e4]:
      - generic [ref=e5]:
        - link "RL Island home" [ref=e6] [cursor=pointer]:
          - /url: "#/welcome"
          - img "ACML" [ref=e7]
          - generic [ref=e9]: RL Island
        - generic [ref=e10]:
          - navigation "Primary navigation" [ref=e11]:
            - link "Island" [ref=e12] [cursor=pointer]:
              - /url: "#/island"
            - link "Sandbox" [ref=e13] [cursor=pointer]:
              - /url: "#/sandbox"
            - link "Compare" [ref=e14] [cursor=pointer]:
              - /url: "#/compare"
            - link "Notebook" [ref=e15] [cursor=pointer]:
              - /url: "#/notebook"
          - generic [ref=e16]:
            - link "Settings" [ref=e17] [cursor=pointer]:
              - /url: "#/settings"
            - link "Back to ACML (opens in a new tab)" [ref=e18] [cursor=pointer]:
              - /url: https://acml.teddylazebnik.com/
              - text: Back to ACML ↗
              - generic [ref=e19]: (opens in a new tab)
    - status [ref=e20]: Learning progress could not be read. Existing data is preserved; new work stays in memory.
    - main [ref=e21]:
      - generic [ref=e22]:
        - paragraph [ref=e23]: Make room for learning
        - heading "Settings" [level=1] [ref=e24]
        - paragraph [ref=e25]: Adjust how the workspace feels on this device.
      - generic [ref=e26]:
        - generic [ref=e27]:
          - heading "Display preferences" [level=2] [ref=e28]
          - paragraph [ref=e29]: Changes apply immediately and are saved locally when browser storage is available.
          - generic [ref=e30]:
            - generic [ref=e31]: Motion
            - combobox "Motion" [ref=e32]:
              - option "Follow system preference" [selected]
              - option "Reduce motion"
            - generic [ref=e33]: System reduced-motion preferences are always respected.
          - generic [ref=e34]:
            - generic [ref=e35]: Text size
            - combobox "Text size" [ref=e36]:
              - option "Standard" [selected]
              - option "Large"
          - button "Restore display defaults" [ref=e37] [cursor=pointer]
          - status [ref=e38]: Browser storage is unavailable or unreadable. Display settings apply only to this session.
        - generic [ref=e39]:
          - generic [ref=e40]:
            - heading "This browser only" [level=2] [ref=e41]
            - paragraph [ref=e42]: Display preferences, lesson activity records, and explicitly saved environment checkpoints stay on this device. There are no accounts or cross-device sync. Export your progress from the notebook.
            - paragraph [ref=e43]: Browser storage can be cleared. It is not a permanent backup.
          - generic [ref=e44]:
            - heading "Teaching & audio" [level=2] [ref=e45]
            - paragraph [ref=e46]: Lecture mode and sound controls will be added in a later milestone.
            - generic [ref=e47]:
              - button "Lecture mode" [disabled] [ref=e48]
              - button "Sound" [disabled] [ref=e49]
    - contentinfo [ref=e50]:
      - generic [ref=e51]: RL Island / Applied Computational Mathematics Laboratory
      - generic [ref=e52]: Lessons 01–11 · Planning and sampled learning
```

# Test source

```ts
  4   | import { mkdir, readFile, writeFile, readdir } from 'node:fs/promises';
  5   | import { createHash } from 'node:crypto';
  6   | 
  7   | const screenshotDirectory = 'evidence/task-09/screenshots';
  8   | test.beforeAll(async () => {
  9   |   await mkdir(screenshotDirectory, { recursive: true });
  10  |   const assets = (await readdir('dist/assets')).filter((name) => name.endsWith('.js') || name.endsWith('.css'));
  11  |   const records = await Promise.all(assets.map(async (name) => ({ name, sha256: createHash('sha256').update(await readFile(`dist/assets/${name}`)).digest('hex') })));
  12  |   await writeFile('evidence/task-09/build.json', JSON.stringify({ capturedAt: new Date().toISOString(), assets: records }, null, 2) + '\n');
  13  | });
  14  | 
  15  | test('static subpath smoke: welcome loads with local assets and no runtime errors', async ({ page }) => {
  16  |   const errors = [], remote = [], failed = [];
  17  |   page.on('pageerror', (error) => errors.push(error.message));
  18  |   page.on('request', (request) => { if (!request.url().startsWith('http://127.0.0.1:4173/')) remote.push(request.url()); });
  19  |   page.on('response', (response) => { if (response.status() >= 400) failed.push(response.url()); });
  20  |   await page.goto('');
  21  |   await expect(page.getByRole('heading', { level: 1 })).toHaveText('A small island.A world of learning.');
  22  |   await page.getByRole('link', { name: 'Explore the island' }).click();
  23  |   await expect(page.getByRole('heading', { level: 1 })).toBeFocused();
  24  |   await expect(page.locator('.lesson-list li')).toHaveCount(11);
  25  |   await page.locator('.lesson-list a').last().click();
  26  |   await expect(page.getByRole('heading', { level: 1 })).toHaveText('Mimic learning');
  27  |   await page.reload();
  28  |   await expect(page.getByRole('heading', { level: 1 })).toHaveText('Mimic learning');
  29  |   await page.goBack();
  30  |   await expect(page.getByRole('heading', { level: 1 })).toHaveText('Your island of ideas');
  31  |   expect((await readStored(page,'rl-island:model-free-progress:v1')).lessons['11'].completedAt).toBeNull();
  32  |   expect(errors).toEqual([]);
  33  |   expect(remote).toEqual([]);
  34  |   expect(failed).toEqual([]);
  35  | });
  36  | 
  37  | test('all shell and unavailable routes support direct entry and reload', async ({ page }) => {
  38  |   for (const [route, title] of [['sandbox', 'Sandbox'], ['compare', 'Compare'], ['expedition', 'Final expedition'], ['notebook', 'Notebook'], ['settings', 'Settings'], ['lesson/01', 'Introduction to Reinforcement Learning'], ['lesson/99', 'Page not found'], ['components', 'Page not found']]) {
  39  |     await page.goto(`#/${route}`);
  40  |     await page.reload();
  41  |     await expect(page.getByRole('heading', { level: 1 })).toHaveText(title);
  42  |   }
  43  | });
  44  | 
  45  | test('keyboard skip link, mobile menu, Escape, route focus, and workspace tabs', async ({ page }) => {
  46  |   await page.setViewportSize({ width: 390, height: 844 });
  47  |   await page.goto('');
  48  |   await page.keyboard.press('Tab');
  49  |   await expect(page.getByRole('link', { name: 'Skip to content' })).toBeFocused();
  50  |   await page.keyboard.press('Enter');
  51  |   await expect(page.locator('main')).toBeFocused();
  52  |   const menu = page.getByRole('button', { name: 'Menu' });
  53  |   await menu.click();
  54  |   await expect(menu).toHaveAttribute('aria-expanded', 'true');
  55  |   await page.keyboard.press('Escape');
  56  |   await expect(menu).toBeFocused();
  57  |   await expect(menu).toHaveAttribute('aria-expanded', 'false');
  58  |   await menu.click();
  59  |   await page.getByRole('navigation', { name: 'Primary navigation' }).getByRole('link', { name: 'Island', exact: true }).click();
  60  |   await expect(menu).toHaveAttribute('aria-expanded', 'false');
  61  |   await expect(page.getByRole('heading', { level: 1 })).toBeFocused();
  62  |   await page.getByRole('link', { name: 'Use the lesson list' }).click();
  63  |   await expect(page.locator('#lesson-list')).toBeFocused();
  64  |   await page.locator('.lesson-list a').first().click();
  65  |   await page.goto('#/practice');
  66  |   await page.getByRole('tab', { name: 'Instructions', exact: true }).focus();
  67  |   await page.keyboard.press('ArrowRight');
  68  |   await expect(page.getByRole('tab', { name: 'Inspector', exact: true })).toBeFocused();
  69  |   await expect(page.getByRole('tabpanel')).toContainText('True task state');
  70  |   await page.keyboard.press('End');
  71  |   await expect(page.getByRole('tabpanel')).toContainText('Ready to move');
  72  |   await expect(page.getByRole('button', { name: 'Step', exact: true })).toBeEnabled();
  73  | });
  74  | 
  75  | test('notebook tabs operate by keyboard without creating results', async ({ page }) => {
  76  |   await page.goto('#/notebook');
  77  |   await page.getByRole('tab', { name: 'Reflections' }).focus();
  78  |   await page.keyboard.press('ArrowRight');
  79  |   await expect(page.getByRole('tab', { name: 'Experiments' })).toBeFocused();
  80  |   await expect(page.getByRole('tabpanel')).toContainText('No experiments yet');
  81  |   await expect(page.getByRole('button', { name: 'Export progress' })).toBeEnabled();
  82  |   expect(await page.evaluate(() => Object.keys(localStorage))).toEqual([]);
  83  | });
  84  | 
  85  | test('display settings persist; defaults leave unrelated host data intact', async ({ page }) => {
  86  |   await page.goto('#/settings');
  87  |   await page.evaluate(() => localStorage.setItem('acml:unrelated', 'preserve me'));
  88  |   await page.getByLabel('Motion', { exact: true }).selectOption('reduced');
  89  |   await page.getByLabel('Text size').selectOption('large');
  90  |   await expect(page.getByRole('status')).toContainText('saved on this device');
  91  |   await page.reload();
  92  |   await expect(page.getByLabel('Text size')).toHaveValue('large');
  93  |   await expect(page.locator('html')).toHaveAttribute('data-motion', 'reduced');
  94  |   await page.getByRole('button', { name: 'Restore display defaults' }).click();
  95  |   expect(await page.evaluate(() => localStorage.getItem('acml:unrelated'))).toBe('preserve me');
  96  |   expect(await page.evaluate(() => Object.keys(localStorage).filter((key) => key.includes('progress')))).toEqual([]);
  97  | });
  98  | 
  99  | test('blocked storage keeps settings usable and gives a visible error', async ({ page }) => {
  100 |   await page.addInitScript(() => {
  101 |     Object.defineProperty(window, 'localStorage', { get() { throw new Error('Storage blocked by fixture'); } });
  102 |   });
  103 |   await page.goto('#/settings');
> 104 |   await expect(page.getByRole('status')).toContainText('storage is unavailable');
      |                                          ^ Error: expect(locator).toContainText(expected) failed
  105 |   await page.getByLabel('Text size').selectOption('large');
  106 |   await expect(page.locator('html')).toHaveAttribute('data-font-scale', 'large');
  107 |   await expect(page.getByRole('status')).toContainText('Could not save');
  108 | });
  109 | 
  110 | for (const [size, width, height] of [['desktop', 1440, 900], ['mobile', 390, 844]]) {
  111 |   for (const route of ['welcome', 'island', 'lesson/01', 'compare', 'notebook', 'settings']) {
  112 |     test(`${size} ${route}: accessible shell and screenshot`, async ({ page }) => {
  113 |       await page.setViewportSize({ width, height });
  114 |       await page.goto(`#/${route}`);
  115 |       await page.evaluate(() => document.fonts.ready);
  116 |       await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  117 |       expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  118 |       const scan = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze();
  119 |       expect(scan.violations).toEqual([]);
  120 |       await page.screenshot({ path: `${screenshotDirectory}/${route.replace('/', '-')}-${size}.png`, fullPage: true, animations: 'disabled' });
  121 |     });
  122 |   }
  123 | }
  124 | 
  125 | test('tablet and wide workspaces, mobile menu, large text, and reduced motion', async ({ page }) => {
  126 |   for (const [name, width, height] of [['tablet', 1024, 768], ['wide', 1920, 1080]]) {
  127 |     await page.setViewportSize({ width, height });
  128 |     await page.goto('#/lesson/02');
  129 |     expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  130 |     await page.screenshot({ path: `${screenshotDirectory}/lesson-${name}.png`, fullPage: true, animations: 'disabled' });
  131 |   }
  132 |   await page.setViewportSize({ width: 390, height: 844 });
  133 |   await page.goto('#/island');
  134 |   await page.getByRole('button', { name: 'Menu' }).click();
  135 |   await page.screenshot({ path: `${screenshotDirectory}/menu-mobile.png`, fullPage: true, animations: 'disabled' });
  136 |   await page.goto('#/settings');
  137 |   await page.getByLabel('Text size').selectOption('large');
  138 |   await page.setViewportSize({ width: 320, height: 700 });
  139 |   await page.goto('#/lesson/02');
  140 |   expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  141 |   expect(await page.locator('.button').first().evaluate((button) => getComputedStyle(button).transitionDuration)).toBe('0s');
  142 |   await page.screenshot({ path: `${screenshotDirectory}/lesson-large-text-320.png`, fullPage: true, animations: 'disabled' });
  143 | });
  144 | 
  145 | 
  146 | 
  147 | 
```