# RL Island

For a ready-to-upload GitHub Pages package and browser-only publishing steps, use [GITHUB_PAGES.md](GITHUB_PAGES.md). The dedicated repository must be named `rl-island` for this build.

A browser-only ACML reinforcement-learning course companion with eleven interactive lessons, a shared environment engine, live planning and learning algorithms, Sandbox, Compare, Notebook, Final Expedition and Lecture mode. Production is static HTML/CSS/JavaScript and local assets. No backend, authentication, telemetry, API key or remote inference is required.

Release evidence and the technical verdict are in [RELEASE_REPORT.md](RELEASE_REPORT.md). Instructor approval is recorded separately; this repository does not assert signoff or measured student learning.

## Requirements and install

Node **22.13+**, npm, and a modern browser supporting ES modules, module workers, IndexedDB and service workers. Verified locally with Node 22.18.0, npm 10.9.3 and Chromium 153.0.8010.12 on Windows. The lockfile pins exact dependencies.

From this repository directory:

```sh
npm ci
```

On Windows PowerShell, use `npm.cmd` in place of `npm` if execution policy blocks npm.ps1. `npm ci` needs registry access unless the pinned packages are already cached. No dependency installation happens in the deployed website.

## Development

```sh
npm run dev -- --port 5173 --strictPort
```

Open **http://127.0.0.1:5173/rl-island/**. The design-system route `#/components` exists only in development. Ctrl+C stops the server.

## Build and exact local release preview

```sh
npm run build
npm run preview -- --port 4173
```

Open **http://127.0.0.1:4173/rl-island/**. Direct example: **http://127.0.0.1:4173/rl-island/#/lesson/09**. Preview is an ordinary static server over `dist/`, with no development transforms, backend or SPA fallback. Ctrl+C stops it. Port 4173 must be free. Do not double-click index.html or use file://.

`dist/` is the full website. `release/rl-island-static.zip` contains its contents, with index.html at the archive root. See [DEPLOYMENT.md](DEPLOYMENT.md) for subdirectory placement, HTTPS/MIME/cache settings, updates and rollback. No deployment or ACML homepage modification is performed by these commands.

## Verification

```sh
npm run lint
npm run typecheck
npm run test:unit -- --maxWorkers=1
npm run setup:browser
npm run build
npm run test:e2e
npm run verify:release
```

Browser setup installs Chromium in `.local/browsers/` unless PLAYWRIGHT_BROWSERS_PATH is supplied. Browser tests start and close their own static server on port 4173; stop manual preview first. They exercise all eleven lesson journeys and the main pages, worker controls, frozen evaluation, persistence/import/export, accessibility and offline updates. `verify:release` uses port 4176 to check the built inventory, direct hash routes, links, console/network errors and subpath isolation. Test data and screenshots are developer QA, not student results.

The serial unit command avoids competition between CPU-heavy neural fixtures on the reference laptop. There is no weakened numerical assertion. Full browser checks take tens of minutes. See the release report for actual executed counts, failures, repairs and coverage limitations; a listed command is not by itself a passing result.

Performance tooling: in PowerShell set `$env:PLAYWRIGHT_BROWSERS_PATH = Join-Path $PWD '.local/browsers'` and `$env:RL_EVIDENCE_DIR = 'evidence/task-11'`, then run `node scripts/measure-hardening.mjs release`. It owns port 4175, performs real training, and records finite-run timing/memory measurements. Use a new label to retain earlier evidence. The dedicated `scripts/verify-browser-zoom.mjs` exercises actual Chromium zoom via a test-only extension.

## Course and scientific contracts

Lessons 01–03 teach interaction/return/discounting, fixed-policy MDP evaluation, policy improvement/iteration and value iteration. Lessons 04–05 add first-visit MC and TD prediction, SARSA and Q-learning. Lessons 06–08 implement linear approximation, learned deterministic models/Dyna-Q, and genuine softmax REINFORCE/actor-critic. Lessons 09–10 run a lazy CPU-worker TensorFlow.js DQN with real replay, optimization and target copies. Lesson 11 records aligned manual demonstrations, fits a supervised softmax policy and transfers compatible actor preferences into RL.

Each lesson has Observe, Predict, Play, Reveal the mathematics, Experiment and Challenge. Completion requires saved activities and explicit checks. Stage navigation or reflections alone earn no completion; free text is never automatically graded. Experiments show actual computed updates and measured curves, including failed/inconclusive runs. Evaluation freezes learning and declares its action rule. Environment resets preserve learned parameters; learning resets confirm a new run. Random streams are seeded and independent of rendering.

Sandbox validates bounded maps, rewards, observations and algorithm compatibility. Compare retains two to four methods and all requested repeated seeds, with equal real-interaction budgets, raw results and separate planning/update/time counters. Notebook supports validated JSON import and JSON/CSV export; CSV is export-only. Expedition separates known-map evaluation, compatible new-map adaptation and zero-shot tests. Coordinate-only tables are rejected for unsupported map transfer.

## Privacy, offline use and limits

Work stays in namespaced localStorage/IndexedDB, with visible memory-only fallback when storage fails. Export backups before clearing browser data. No cross-device sync, authenticated grades, secret browser tests or tamper-proof scoring is promised. Lecture mode hides personal notes and uses isolated temporary teaching runs.

The service worker and caches are scoped to `/rl-island/`. The explicit complete-course offline-ready message appears only after all required assets, including lazy neural chunks, are cached. That prefetch does not execute TensorFlow in early lessons. Updates wait for a user action and preserve saves. External lecture PDFs are online links, not offline assets. Resource/history/import bounds reject oversized work rather than silently mixing or discarding data.

## Content review and authoring

Use [the authoring guide](docs/COURSE_AUTHORING.md), [curriculum](docs/CURRICULUM.md), [architecture](docs/ARCHITECTURE.md), and [asset/dependency attribution](docs/ASSET_ATTRIBUTION.md). Bundled license texts are in `public/assets/licenses/` and `dist/assets/licenses/`.

All eleven reference PDFs have verified local retrieval hashes. Detailed activity-to-slide mappings and instructor approval remain pending. Lesson 02's linked exploration/exploitation deck conflicts with its catalog title; the MDP lesson follows the explicitly requested scope and exposes the discrepancy. Lesson 10 labels replay/target experiments as a part-1 bridge and teaches part-2 extensions conceptually; it does not claim to implement those algorithms. Lesson 11 implements cloning/compatible RL initialization, not the full IRL/RLHF deck. See the source audits and release report; no invented slide-page citations or approvals are used.
