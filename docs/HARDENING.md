# Lecture presentation, offline behavior and measured limits (task 10)

Lecture mode runs a temporary teaching session with a separate in-memory progress store, agent store, archive and manual environment. Student records are not rendered in the teaching session. Notebook is hidden and reflection editors are removed from projection. Exiting restores the personal session; refreshing discards the teaching session. The mode preference is the only new localStorage setting. A storage failure is visible and does not stop teaching. Switching modes asks the user to save typed work and is blocked during running or paused jobs.

The four presets are deterministic Q-learning, slippery SARSA, Dyna-Q and local-goal linear SARSA. Each has a declared root seed and starts with zero experience. They pass the same validated configuration to the existing worker, shared engine and algorithms. No algorithm or animation RNG convention changes. Preset labels and predictions identify supplied teaching configuration, not student evidence.

Projection uses larger base text (22 px desktop, 20 px narrow screens), larger controls, single-column workspaces and readable local inspectors. Focus is retained when worker or demonstration views rerender. Dialogs support Escape and return focus. Keyboard and touch movement still use the shared environment. Canvas maps and charts have equivalent text, table, state and update information. Raw and smoothed chart lines have distinct dash patterns; reduced motion suppresses CSS animation/transitions. Standard math is Unicode/plain text with adjacent explanations rather than an image-only formula.

## Complete local offline cache

The Vite build inventories every built local runtime asset, including lazy laboratory/neural modules, module workers and local fonts. The manifest records sizes and SHA-256 digests. The browser verifies each response before announcing complete-course readiness. Offline prefetch deliberately downloads lazy assets; it does **not** import/execute TensorFlow in early lessons. The neural implementation still initializes only when requested.

The classic worker is served only at `/rl-island/sw.js`, registered with the exact `/rl-island/` scope. It rejects a root-scoped installation and intercepts only declared local assets, hashed assets and the sub-app entry point. Cache names begin `rl-island:/rl-island/:course:v1-`. It does not intercept the ACML root, arbitrary requests, external PDFs or remote resources. No external PDF is cached or claimed to work offline. Development mode explicitly says caching requires a production build.

A readiness marker is written only after the complete build is verified. Status also checks that every cached entry remains present. Failures never claim complete readiness; the explicit retry can repair evicted assets. Browser eviction remains possible. Cache Storage failures do not delete learning storage. Cache status is separate from localStorage/IndexedDB save status.

A new build installs into a new cache and waits. It never automatically calls `skipWaiting`. A visible update dialog requires an explicit apply action and blocks it while work is running or paused. The selected waiting worker is rechecked before activation, preventing a late response from the old worker from supplying the wrong build version. Only the tab whose user applied the update reloads. Other tabs retain typed text and older hashed lazy chunks. Old course caches are pruned only when the matching current build sees itself as the sole app window; unrelated host caches are never removed. Learning databases, saved models and notes are never accessed by the service worker.

Repeated-seed comparison Pause spans the whole operation, including the gaps between training, frozen evaluation and initializing another seed. An explicit gate prevents starting the next phase until Resume; Cancel releases the gate and retains incomplete slots. Pause remains available during those gaps, avoiding a lost click when a fast phase ends. The laboratory activity owner also keeps update/lecture switches blocked between worker commands and while a comparison is paused. These scheduling controls change neither interaction budgets nor numerical updates.

Primary implementation references: [MDN service-worker lifecycle and scope](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API/Using_Service_Workers), [explicit waiting-worker activation](https://developer.mozilla.org/en-US/docs/Web/API/ServiceWorkerGlobalScope/skipWaiting). These document platform behavior; local evidence below tests this implementation.

## Resource limits and reproducible checks

The worker yields after at most 32 transitions or approximately 8 ms of computation. Existing episode, trace, replay and import bounds remain. A task-10 stress run exposed excessive DOM rendering with 1,900 one-step truncated episodes: 15,461 elements, an 807 ms long task and a 947.2 ms maximum 16 ms timer gap. Raw laboratory episode tables now render at most 100 rows per page. Every row remains inspectable through keyboard-accessible pagination and remains in JSON/CSV exports. This changes presentation only; curves still use the recorded measurements, and algorithm budgets/parameters do not change.

Run the production build before the scripts below. They start and close their own localhost previews and use disposable browser profiles. Set `PLAYWRIGHT_BROWSERS_PATH` to the repository's `.local/browsers` if needed.

- `node scripts/browser-tests.mjs test tests/e2e/hardening.spec.js`: complete offline cache, offline lessons/live CPU DQN, true browser cache quota, update preservation, lecture privacy/replay, responsive axe, focus and pagination.
- `node scripts/verify-browser-zoom.mjs`: real Chromium tab zoom at 100%, 200% and 400%, including math and lecture views. The test-only extension uses the [official tabs zoom API](https://developer.chrome.com/docs/extensions/reference/api/tabs#method-setZoom). It is not included in the app. This is not CSS zoom, viewport scaling or pinch emulation.
- `node scripts/measure-hardening.mjs final`: identical 1,900-episode stress case, actual UI controls during tabular training, twelve DQN initialize/train/reset/evaluate cycles, command acknowledgments/cancellation, page heap after requested GC and worker tensor counts.

Measurements, browser/device details, failed-run history and final check counts are recorded in `evidence/task-10/` and `TASK_STATUS.md`. Main-page heap, TensorFlow allocation counts and whole-process memory are different quantities. These short runs cannot establish indefinite leak freedom or performance on every student device. Native screen-reader and physical touch-device testing remain separate from automated accessibility scans and browser touch emulation.

## Measured results and remaining performance limit

Reference device: Intel Core i7-10510U @ 1.80 GHz, Windows kernel 10.0.26200 x64, 16,942,497,792 bytes physical memory; Playwright Chromium 153.0.8010.12, TensorFlow.js 4.22 CPU worker, Node 22.18.0. These are unthrottled localhost runs, not network-loading guarantees.

| Measurement | Original rendering | After pagination/archive validation change | Focus build | Final comparison-control build |
|---|---:|---:|---:|---:|
| Rendered rows from 1,900 genuine episodes | 1,900 | 100 | 100 | 100 |
| DOM elements in stress case | 15,461 | 1,065 | 1,065 | 1,065 |
| Largest stress timer gap | 947.2 ms | 140.3 ms | 245.6 ms | 109.3 ms |
| Longest stress main-thread task | 807 ms | 120 ms | 185 ms | 85 ms |
| Largest visible tabular cancellation (5 trials) | Not measured | 226.8 ms | **297.2 ms** | **257.6 ms** |
| Control acknowledgment maximum in worker trials | 16 ms | 13.5 ms | 39.7 ms | 23.4 ms |

The final build meets the measured 100 ms worker acknowledgment target but **does not meet the 250 ms visible cancellation target in every trial**: final trials took 112.7, 127.0, 151.8, 190.0 and **257.6 ms**. The focus build had a 297.2 ms trial; earlier pagination-only trials included 259.8 ms. All runs are retained (performance-baseline, performance-pagination, performance-final, performance-focus, performance-boundary JSON/log pairs). The filenames reflect collection order; performance-boundary.json is the last build, 66b882733690cb051ce5. No slower trial was discarded. Stress wall times varied from 1,644 to 5,734 ms after pagination. Reduced DOM work is established; a universal wall-time speedup is not.

Across twelve final DQN initialize/train-120/reset/evaluate cycles, live allocations stayed at 13 tensors / 3,108 bytes and identical seeded parameters were asserted. Main-page used V8 heap after requested GC was 3,887,980 bytes before and 3,588,732 after. Final worker-only cancellation peaked at 34.9 ms. The background page timer gap peaked at 26.4 ms. The prior focus build had an unexplained 507.4 ms gap; that slower sample is retained and no universal responsiveness claim is made.

Final local navigation load was 1,220.3 ms and complete verified cache readiness 2,260 ms; prior samples included 441.1 / 1,243 ms and 1,422.3 / 3,338 ms. Other devices, engines, throttled networks and long-duration memory behavior are not measured. The build still reports a >500 kB main-chunk warning. Neural execution remains lazy, while offline preparation intentionally downloads its complete asset set.

## Release remeasurement (task 11)

The laboratory archive now reads only unknown IndexedDB keys and gives selectors metadata summaries; saving a current run no longer rereads/clones all unrelated models. Import validation and complete exports remain. On the same recorded reference hardware, `evidence/task-11/performance-release.json` measured five visible cancellations at 32.9–50.5 ms, control acknowledgment at most 9.2 ms, 1,900-episode stress gap 92.2 ms (100 rendered rows, all rows exported), and 23 ms maximum page timer gap during twelve DQN cycles. Allocation stayed at 13 tensors / 3,108 bytes and all seeded parameters were identical. Local load 790.9 ms; complete cache readiness 2,445 ms. Main-page heap after requested GC decreased from 3,738,916 to 3,610,424 bytes. These finite measurements meet the stated acknowledgment/cancel targets on this run; historical misses remain above and no universal speed or indefinite memory guarantee is claimed.
