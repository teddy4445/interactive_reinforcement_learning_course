# Task status and evidence ledger

Updated: 18 September 2026. Tasks 00–10 were completed previously. Current request: task 11 full-product release review. **Task 11 implementation and technical verification are complete. Technical verdict: READY in the tested Chromium/CPU scope. Full-course release acceptance: NOT READY pending human content review and the documented source-scope decisions.** No deployment, push, host integration, or live ACML modification was performed.

| Task | Status | Evidence / blockers |
|---|---|---|
| 00 - Reference audit and foundation | COMPLETE | Public ACML refresh, all eleven PDFs retrieved and initially inspected, pinned Vite/vanilla JS foundation, clean install, build, unit/browser smoke checks executed. Detailed content approval is pending. |
| 01 - ACML shell and navigation | COMPLETE | Working responsive shell, original licensed logo, local Inter/tokens, keyboard navigation, settings, 19 inspected shell screenshots and two live reference captures; final checks passed. Instructor visual approval remains the next review gate. |
| 02 - Shared island engine and trace | COMPLETE | Shared seeded engine, three maps, manual keyboard/touch gameplay, accessible trace, separate resets, validated checkpoints; 78 unit and 30 browser tests passed at task 02. See historical evidence below. |
| 03 - Lesson runtime and foundational pilot | COMPLETE | Three six-stage lesson journeys, exact DP planners, activity-derived progress, notebook and validated export/import; 116 unit tests, 39 browser regressions and 28 final affected rechecks passed. Source discrepancy retained; human pilot review pending. |
| 04 - Real tabular learning and worker | COMPLETE | Four sampled tabular learners, chunked worker, frozen evaluation and complete lessons 04–05; 162 unit, 52 full browser regressions, 33 affected rechecks and 4 final notebook checks passed. Inspected responsive screenshots and measured keyboard/worker latency retained below. |
| 05 - Features, approximation, and Dyna planning | COMPLETE | Linear TD/SARSA, explicit features, learned model and Dyna-Q; complete lessons 06–07. 188 unit checks pass. Full browser run: 57/59; two harness failures corrected and final affected run 15/15 passes. All 59 scenarios have passing coverage on the same production build. |
| 06 - Policy gradients and actor-critic | COMPLETE | Genuine softmax REINFORCE/baseline and actor-critic; six-stage lesson 08. 212 unit tests, 59 earlier browser regressions, final 6 lesson-08 scenarios and 3 repeated control tests pass. Actual calibration, inspected screenshots, source/coverage limits and failed-run history below. |
| 07 - Small DQN and advanced stability lessons | COMPLETE | Real lazy CPU-worker DQN, complete lessons 09–10, verified source-scope correction; 238 unit tests, 73 full browser regressions, 20 final affected checks and 2 final failure/replacement checks passed. Benchmarks, memory, inspected screenshots and limits below. |
| 08 - Demonstrations and imitation | COMPLETE | Genuine manual demonstrations, supervised softmax cloning, compatible actor-critic initialization and all six lesson-11 stages. 265 unit checks pass; all 83 distinct browser scenarios have passing coverage across the full and affected runs detailed below. All eleven lesson journeys and combined saved completion verified. |
| 09 - Sandbox, comparisons, notebook, and capstone | COMPLETE | Working bounded laboratory, repeated-seed comparisons, unified Notebook, IndexedDB migration and distinct expedition tracks. 305 unit checks pass; all 96 browser scenarios have passing coverage across full/affected runs, plus final responsive rechecks and inspected captures. See evidence below. |
| 10 - Lecture mode and hardening | COMPLETE · limits recorded | Lecture privacy/presets, scoped full offline cache, accessibility/focus/zoom and storage hardening. 326 unit tests; 108 full browser regressions and 27 final affected checks pass. One final cancellation trial exceeds 250 ms; see measurements below. |
| 11 - Static integration and release review | IMPLEMENTED; HUMAN REVIEW BLOCKED | Technical READY: 327 unit checks, final 110/110 browser suite, lint, typecheck, build, 24-file/19-route inventory, zoom and ZIP integrity pass. Full-course approval remains NOT READY; exact content gates below. |

## GitHub Pages packaging follow-up — 18 September 2026

Prepared release/rl-island-github-pages.zip (553,701 bytes; SHA-256 1d9eff2414aa92c959e16564d8403d4f3a2edb2953988e46ae93e48a463199e5) and its extracted upload folder. All 24 application files match dist byte-for-byte; the only addition is an empty .nojekyll marker. Use a dedicated repository named exactly rl-island so the existing /rl-island/ asset and service-worker paths match GitHub Pages. GITHUB_PAGES.md gives the browser-upload steps and update guidance; README and DEPLOYMENT link it. No repository, branch, remote, Pages setting or live site was changed.

scripts/package-github-pages.ps1 creates and hash-verifies the package, refuses existing output, and accepts a new package name for later releases. scripts/verify-github-pages.mjs tests the actual prepared folder under /rl-island/. Generated release files are excluded from lint. Both release verification scripts now load Playwright after selecting the repository browser cache, fixing a fresh-shell startup error; application code and dist are unchanged.

Executed: packaging/decompressed ZIP inventory **25/25 PASS**; npm.cmd run lint **PASS**; upload-folder browser smoke **PASS**; npm.cmd run verify:release **PASS, 24 files/19 routes**. The smoke check exercised direct routes, complete offline readiness, offline lesson reload, 60 real offline CPU DQN interactions / 45 optimizer updates and five frozen evaluations with exactly unchanged parameters. These short QA evaluations returned -4 each and no successes; there is no claim that 60 interactions trained a successful policy. No unexpected console errors or external requests were observed. Inspected evidence/github-pages/screenshots/pages-mobile.png and pages-offline-neural.png.

Evidence: evidence/github-pages/packaging-rl-island-github-pages.json, browser-smoke.json, check-exits.json and logs. The initial browser launch failure (cache selected after static Playwright import) is retained in browser-launch-failure.json/.log and initial-check-exits.json; it is not counted as a pass. The corrected scripts passed from a fresh shell. Original 327-unit/110-browser release results apply to the byte-identical runtime; those full suites and the build were not rerun for this packaging-only change. Actual GitHub deployment and instructor approval remain **NOT RUN / NOT PROVIDED**.

## Task 11 — Static release and full-product verification

**Implementation, packaging and technical verification complete. Technical verdict: READY in the recorded Chromium/CPU scope.** Stopped after task 11. Full-course content/publication acceptance is **NOT READY** because eleven-lesson human review, source-scope decisions and instructor brand/content approval have not been supplied. No push, publishing, host integration or live ACML change was performed. All QA records are developer evidence, not student results.

### Repairs and deliverables

- Laboratory archive refresh now reads unknown IndexedDB records and uses metadata for save bookkeeping/selectors. It avoids cloning every archived trajectory/model on each save, retains full validation/export and reports storage failures. A new unit fixture checks independent metadata/checkpoint copies. No learner mathematics, environment rules or RNG behavior changed.
- Browser tests and local preview serve the built dist through an ordinary static server under /rl-island/. Release verification checks assets, routes, links, console/network errors and host-root isolation. Public reference refresh and byte-verified ZIP scripts were added. Full runtime license texts are bundled.
- Deliverables: dist/; release/rl-island-static.zip; README.md; DEPLOYMENT.md; RELEASE_REPORT.md; corrected START_HERE.md; docs/COURSE_AUTHORING.md; docs/ASSET_ATTRIBUTION.md; docs/RELEASE_AUDIT.md; docs/RELEASE_VISUAL_REVIEW.md. The audit disposes of every earlier unresolved category without erasing historical evidence.
- Build a85e523ba15ccbfba6ba; ZIP 553,607 bytes, 24 entries, SHA-256 adb3058e294038afd19f14b510eb2fe14a4b97bf4320e348493b31314f477b35. Every decompressed entry matches dist. Isolated lockfile install/rebuild reproduced the full offline manifest byte-for-byte.

### Executed checks and evidence

All current paths below are under evidence/task-11/. The reference environment is Windows kernel 10.0.26200 x64, Intel Core i7-10510U 1.80 GHz, 16,942,497,792 bytes RAM, Node 22.18.0/npm 10.9.3, Chromium 153.0.8010.12 and TensorFlow.js 4.22 CPU worker.

| Check | Actual result |
|---|---|
| npm.cmd run lint / npm.cmd run typecheck | PASS on final application and verification-tool source; lint-release-final.log, typecheck-release-final.log, final-source-check-exits.json. |
| npm.cmd run test:unit -- --maxWorkers=1 | 327/327 PASS, eleven files, 124.58 seconds; unit.log. Independent numerical, persistence, worker, neural, imitation and hostile-input fixtures. |
| npm.cmd run build | PASS; build.log. Approximately 520 kB main-chunk warning retained. |
| Isolated clean install/rebuild | PASS with local cache, exact lockfile and separate .local/release-install; clean-install-retry.log, clean-build.log, clean-build-reproducibility.json. Initial default-cache permission failure remains recorded. |
| Dependency audit | Online read-only retry PASS, zero reported vulnerabilities at check time; dependency-audit-network.json. Initial network-restricted failure retained. |
| Plain-static inventory/routes | PASS: 24 files, 19 direct routes, internal links, hashes, no unexpected errors or runtime remote/API dependencies; static-release.json. |
| Initial complete browser suite | 108/110 PASS, 38.0 minutes; browser-full.log. Two failed cases retained, not counted as a passing command. |
| Focused Dyna control recheck | 3/3 PASS, 1.2 minutes; browser-dyna-recheck.log. Original trace showed the automated mouse click arriving after the batch completed. Test now acts on actual in-flight progress and asserts a nonzero incomplete budget; paused-state and all seeded-speed assertions remain. |
| Focused neural lessons 09–10 | 1/1 PASS, 7.0 minutes; browser-neural-journey-recheck.log. Original budgets, seeds, assertions and timeout unchanged. Initial comparison timeout at 12/15 agents is retained; exact slowdown cause is unproven. |
| Final complete browser suite | **110/110 PASS, 33.3 minutes, exit 0**; browser-release-final.log, browser-release-final-exit.json. Both formerly failing cases pass in this complete run. No simultaneous install/build/independent training benchmark. |
| Actual browser zoom | 7/7 view/zoom combinations PASS at 100%, 200%, 400%; actual-browser-zoom.json. No document overflow or axe violations in these views. |
| Validated combined QA restore | PASS, eleven completed records restored in a fresh browser; combined-completion-review.json. Actual QA exports include preserved legacy data and are not one human student's outcome. |
| In-app keyboard review | Exercised movement/collision, episode reset/save, prediction save/focus, gamma/return calculation, Notebook and refresh; interactive-review.json. Automated checks separately cover worker controls and export/import. |
| References | Public homepage and all eleven PDFs returned HTTP 200 with unchanged verified hashes; public-reference-links.json. Local PDF hashes also match original retrieval. No protected catalog or password-bearing request. |
| Packaging | PASS, 24/24 archive entries match dist; archive-verification.json. Final post-suite route, combined-import and integrity checks also pass; post-suite-check-exits.json and final-artifact-integrity.json. No source maps, PDFs, backend files or student data in the ZIP. |

### Measurements, screenshots and remaining limits

performance-release.json records five visible cancellations at 32.9–50.5 ms (all below 250 ms), control acknowledgments up to 9.2 ms, twelve seeded neural train/reset/evaluate cycles at 13 tensors/3,108 bytes, and a 23 ms maximum page timer gap during those cycles. The 1,900-episode stress case renders 100 rows but exports all data; maximum timer gap 92.2 ms and longest task 75 ms. Local load 790.9 ms and complete-cache readiness 2,445 ms are device-specific, finite measurements. Prior slower trials and the unexplained task-10 507.4 ms gap remain historical evidence.

Inspected screenshots under screenshots/: five key pages at 1440x900 and 390x844; lesson-tablet.png and lesson-wide.png; sandbox-trained-desktop.png; compare-four-methods-desktop.png; imitation-fitted-390.png; lesson-09-actual-neural-update.png; lecture-math-390.png; keyboard-laboratory-controls.png; actual-browser-zoom-mathematics-200.png and the mathematics/manual/lecture 400% views; eleven-completed-qa-island.png and eleven-completed-qa-notebook.png. Exact paths and observations are in docs/RELEASE_VISUAL_REVIEW.md.

The formula/source/calibration review is in docs/RELEASE_AUDIT.md. Existing measured calibration suites are indexed by hash in calibration-registry.json. Required human review remains absent for all eleven lessons. Lesson 02's catalog/deck discrepancy and lesson 10/11 scope decisions remain explicit; detailed approved slide ranges are empty. No citations, instructor approval, student pilot or learning-effectiveness results were invented.

An additional in-app keyboard export review was unavailable after two webview-attachment timeouts. Those attempts performed no export or live worker keyboard action; automated coverage is recorded separately.

NOT RUN: Firefox/WebKit/Safari, native screen-reader speech/navigation, physical touch hardware, GPU backends, throttled Internet loading, long-duration whole-process memory profiling, live deployment and human instructor/student review. Main bundle warning remains. External PDFs are not offline assets. Exports are self-reported evidence. Latest consistent checkpoints do not guarantee recovery of undelivered active work.

## Task 10 — Lecture mode, accessibility, offline caching and performance

**IMPLEMENTED; verification complete with the performance limitations below. Stopped after task 10.** No deployment, push, hosting change or live ACML modification. All generated progress, runs and screenshots are disposable developer QA, not student outcomes or authenticated grades.

### Working behavior and changed files

- src/app/{lecture,activity}.js, src/main.js, persistence stores and the manual workspace implement larger lecture text/controls, four seeded fresh presets and separate memory-only teaching sessions. Personal progress, models, manual saves and notes are restored on exit; Notebook/reflections are hidden during projection. Only the presentation preference persists. No algorithm, environment or RNG behavior changed. Laboratory comparisons now retain pause intent across training/evaluation/seed boundaries, and an operation-level guard blocks updates or lecture switches while between worker commands. Repeating the Dyna preset at seed 29 for 90 real interactions produced identical checkpoint hashes (lecture-replay.json).
- src/ui/focus.js and the three lesson controllers retain form/action focus, focus a stage heading when a submitted control disappears, and preserve keyboard movement. Laboratory controls move focus to an enabled action when a running command disables the current button. src/styles/hardening.css and the chart/laboratory renderers add projection sizes, visible focus, reduced motion, narrow layouts, distinct curve patterns, readable math, complete DOM state/map alternatives and 100-row raw-data pagination. All raw rows remain in exports.
- scripts/offline-build.mjs and src/offline/{client,service-worker}.js inventory/hash all required built assets, including lazy neural/worker modules and local fonts. Offline readiness requires every asset. The worker and cache namespace are restricted to /rl-island/. Failed/evicted caches report incomplete status and support repair. Updates wait for explicit application; running/paused worker jobs block reload, other tabs keep typed text/older chunks, and student storage is untouched. External PDFs are neither cached nor claimed offline.
- The existing bounded/versioned import, migration and storage-failure paths were exercised. Repeated archive reads avoid revalidating entries already validated and authoritative in tab memory. Coordinator disposal cannot leave presentation/update activity guards busy. New hardening unit/browser tests, real browser-zoom tooling, performance instrumentation and docs/HARDENING*.md record the behavior and its limits. Pinned dependencies/lockfile remain; no backend or neural dependency was added.

### Checks actually executed

Reference environment: Windows kernel 10.0.26200 x64, Intel Core i7-10510U @ 1.80 GHz, 16,942,497,792 bytes physical memory; Node 22.18.0 / npm 10.9.3; Playwright Chromium 153.0.8010.12; TensorFlow.js 4.22 CPU worker. Tests used localhost production builds under /rl-island/.

| Command/check | Actual result |
|---|---|
| npm.cmd run lint | PASS on final source; lint-boundary.log. |
| npm.cmd run typecheck | PASS, including strictly checked service-worker code; typecheck-boundary.log. |
| npm.cmd run test:unit -- --maxWorkers=1 | **326/326 PASS**, eleven files on final source; unit-complete.log. Numerical fixtures, persistence/migration, hostile/oversized/incompatible imports, frozen evaluation, bounded histories, offline lifecycle and lecture isolation included. |
| npm.cmd run build | PASS; build-boundary.log, boundary-manifest.json. Seventeen verified runtime assets, 1,504,988 bytes. The >500 kB chunk warning remains. |
| node scripts/browser-tests.mjs test | **108/108 PASS**, 35.2 minutes, before the final focus/archive refinements; browser-regression.log, full-regression-manifest.json. All eleven full lesson journeys passed. |
| Browser tests: hardening, laboratory, model-free, imitation and deep-safety files | **48/49 PASS**, 16.1 minutes; browser-final-affected.log. The one expanded concept-focus test exposed a real defect; it was fixed, not ignored. |
| node scripts/browser-tests.mjs test tests/e2e/hardening.spec.js --grep focus | **3/3 PASS** after the final focus fixes; browser-focus-recheck.log. Foundation submissions, sampled/imitation concept checks/reflections and live laboratory Step/Pause/Resume/Cancel covered. |
| Browser tests: hardening, lessons and laboratory files | **35/36 PASS**, 13.6 minutes on the focus build; browser-complete-affected.log. Full first-three-lesson journeys passed; the comparison Pause case exposed a phase-boundary race, subsequently fixed. |
| Laboratory comparison pause/resume/cancel, --repeat-each=3 | **3/3 PASS** on final build; browser-boundary-repeat.log. Includes the paused-operation lecture guard. Two additional unit fixtures hold the training/evaluation boundary, then resume or cancel without new work. |
| Browser tests: hardening and laboratory files | **27/27 PASS** on final build; browser-boundary-affected.log. Fourteen hardening scenarios and the complete laboratory/Notebook/Expedition workflows, offline CPU DQN, update preservation, quota/denial/migration/imports, responsive axe and focus verified. |
| node scripts/verify-browser-zoom.mjs | **7/7 views PASS** with no axe violations or horizontal document overflow; actual-browser-zoom.json and browser-zoom-final.log. Real 100/200/400% Chromium tab zoom, manual/math/lecture views; native 1,424-pixel screenshot captures. Tested before final focus/control changes; CSS is unchanged. |
| Interactive keyboard review | Manual movement, cell inspection, lesson navigation, numeric parameter changes, prediction saving, lecture entry and worker Step/Pause/Cancel verified through the in-app browser. Found/fixed focus defects. In-app export event timed out; final interactive recheck could not attach a webview. See interactive-keyboard-review.json; those portions are not counted as passes. Automated export and final focus checks passed separately. |
| node scripts/measure-hardening.mjs baseline / final / focus / boundary | Actual repeated runs retained, including target misses; performance-*.json/log. Twelve DQN cycles per run with exact seeded parameters and fixed live tensor allocation. Measurements below. |

There are now **110 distinct browser scenarios**, with passing coverage across the full run and final affected checks. A combined 110-case run was not repeated after the focus/control fixes. Build versions: full regression 1d2a8fd2994bbccb30a2; archive/coordinator refinement 38864e1ee46965e766f6; focus build 1b77bf5ca981f27381f5; final comparison-control build **66b882733690cb051ce5**. build-coverage.json records asset sizes/hashes; the numerical worker and neural runtime chunks are identical across all four builds. The final changes affect focus, archive presentation and comparison scheduling, not learner calculations. Documentation-only handoff edits followed the checks.

### Measured results — including remaining misses

The 1,900-episode stress case originally rendered 15,461 DOM elements / 1,900 rows, with an 807 ms long task and 947.2 ms maximum timer gap. The 100-row limit keeps 1,065 elements and retains all 1,900 records in JSON/CSV. Improved-build timer gaps were 140.3, 245.6 and finally 109.3 ms; final longest task was 85 ms. Stress wall time varied from 1,644 to 5,734 ms after pagination, so a universal wall-time speedup is not claimed.

Final worker control acknowledgment peaked at **23.4 ms**, within the 100 ms target. Visible tabular cancellation took 112.7, 127.0, 151.8, 190.0 and **257.6 ms**: **one of five misses the 250 ms target**. Earlier builds included peaks of 226.8, 259.8 and 297.2 ms. All slower runs remain recorded. Final worker-only DQN cancellation peaked at 34.9 ms. The separate page timer during DQN cycles peaked at 26.4 ms; a prior focus-build run had an unexplained 507.4 ms gap. These finite measurements do not promise universal responsiveness.

Across twelve final initialize/train-120/reset/evaluate cycles, allocation stayed at **13 tensors / 3,108 bytes** and same-seed parameter equality was asserted. Main-page V8 used heap after requested GC changed from 3,887,980 to 3,588,732 bytes. This shows no growth in those measured quantities during this finite test; it is not whole-process memory or indefinite leak proof. Final localhost load was 1,220.3 ms; complete cache readiness 2,260 ms (earlier samples included 441.1 / 1,243 ms and 1,422.3 / 3,338 ms). No throttled-network or other-device speed claim is made. See docs/HARDENING.md for all runs.

### Screenshots and inspected interactions

All paths are under evidence/task-10/screenshots/. Inspected the five key pages at 390 × 844 and 1440 × 900, tablet/wide lesson layouts, lecture math at 390/1440, touch probability/state inspector, keyboard focus and actual chart data. Detailed inspection notes are in docs/HARDENING_VISUAL_REVIEW.md.

- lecture-math-390.png and lecture-math-1440.png — larger text, projection controls and real mathematics.
- actual-browser-zoom-mathematics-400.png — native 400% browser zoom capture.
- keyboard-concept-focus.png, keyboard-foundation-prediction-focus.png and keyboard-laboratory-controls.png — corrected focus after actual submissions/training controls.
- lecture-measured-charts.png — measured training point, readable legends and honestly empty frozen evaluation.
- slippery-inspector-touch-mobile.png and keyboard-focus-after-update.png — actual gameplay, accessible state/transition probabilities and retained movement focus.
- welcome/island/lesson-01/compare/notebook mobile and desktop-viewport captures; lesson-tablet.png and lesson-wide.png — inspected shell/layout coverage.

### Failures, fixes and unrun checks

Initial checks exposed unused code / service-worker global naming issues (fixed), inaccurate test locators, a late old-worker status response overwriting waiting-update identity (fixed), five-pixel lecture-tab overflow (fixed), raw-export comparison incorrectly including changing export timestamps (fixed), clipped zoom screenshots (native capture fixed), the focus defects found above, and a comparison pause click lost between phases (fixed with an operation-level pause gate and rerun). Logs retain the unsuccessful checks. A parallel unit run timed out at five seconds in neural seeded persistence (323/324); serial reruns passed without weakening assertions. Browser zoom also needed floating-point tolerance and recognition of an already saved prediction in its reusable QA session. None of those failed commands are reported as passes.

**Remaining / NOT RUN:** occasional visible cancellation exceeds 250 ms; a prior DQN-background timer gap remains unexplained; Vite's ~520 kB main-chunk warning remains. Firefox/WebKit, native screen-reader speech/navigation, physical touch hardware, throttled network, long-duration/whole-process memory and instructor/student pilots were not run. The final interactive webview recheck and in-app export observation were unavailable as described above. External lecture PDFs are not offline assets. Existing lesson-02 source discrepancy, detailed slide-page mappings and instructor content/brand approvals remain unverified; no citations or approvals were invented. Task 11 remains NOT_STARTED.

## Task 09 — laboratory, comparisons, Notebook and Final Expedition

**COMPLETE. Stopped after task 09.** No deployment, push, hosting change or live ACML modification. All saved runs, completed activities and screenshots under task-09 evidence are disposable developer QA artifacts, not student outcomes or authenticated grades.

### Working behavior and changed files

- src/laboratory/{config,records,store,view,controller,notebook,page}.js and scoped styles implement a bounded scenario editor, reward and state/observation choices, compatibility explanations, seeded worker training, frozen evaluation, scenario/agent save/load, immutable experiment versions and inspected true-state/observation/action/update data. A preview must be applied as a new experiment or dismissed before training. Prediction methods evaluate their declared fixed policy.
- Compare runs two to four control methods with two to five independent training seeds and equal real-interaction budgets. All requested slots survive failures/cancellation. Three measured evaluation checkpoints, raw episode data, agent-level mean/sample SD/range, return, success, length, interactions, learner/planning updates and wall time are retained. Training smoothing is an explicitly labeled trailing mean of up to seven completed/capped episodes; comparison curves have no smoothing. Replicate agents reopen as separate exact continuations.
- Notebook filters and reopens laboratory records and older lesson experiments, comparisons and fitted imitation policies. It preserves predictions and ungraded reflections, validates bounded/versioned JSON before reviewed replacement, exports full JSON/raw-record CSV/episode CSV and escapes spreadsheet formula prefixes. Imported text/code/URLs never execute. Large artifacts use IndexedDB; localStorage keeps small records/indexes/pointers. Large older lesson histories migrate without deleting checkpoints or changing legacy export formats. Denied/quota/transaction failures preserve memory exports and report the limitation. Missing legacy models are explicitly identified in an incomplete agent backup.
- Final Expedition records source/target configurations, parameter identities, budgets, seeds and concept attempts. Known-map evaluation freezes the exact source agent. New-map adaptation and zero-shot are separate tracks with respectively charged target training or zero target updates. Only the explicit local-goal linear SARSA representation transfers; coordinate Q-tables, actors, plain coordinate linear features and the current coordinate DQN are rejected. src/agents/features.js adds goal direction/local geometry features without transition-model access. State/observation validation and the existing worker/evaluator remain shared across lessons and laboratory.
- Routing, lesson-storage migration, tests, calibration/capture scripts, README and docs/LABORATORY.md complete the integration. No dependency was added. Earlier lesson backups remain supported; no lesson algorithm was replaced by a mock.

### Checks actually executed

Windows 11 build 26200, Node 22.18.0, npm 10.9.3, Intel Core i7-10510U, cached Playwright Chromium 153.0.8010.12. Logs and raw evidence: evidence/task-09/.

| Command/check | Actual result |
|---|---|
| npm.cmd run lint | PASS; lint-final.log. |
| npm.cmd run typecheck | PASS; strict JSDoc, typecheck-final.log. |
| npm.cmd run test:unit -- --maxWorkers=1 | **305/305 PASS**, ten files, 56.66 seconds; unit-final-305.log. Includes map/state/observation and experiment round trips, independent comparisons, frozen evaluation, transfer rules, import bounds, storage failures/migration, missing models and earlier numerical regressions. |
| node scripts/browser-tests.mjs test | **95/96 PASS**, 23.5 minutes; browser-full.log. All eleven lesson journeys passed. One settings-storage assertion matched two status regions after the new global warning was added. |
| node scripts/browser-tests.mjs test tests/e2e/laboratory.spec.js tests/e2e/shell.spec.js | **32/32 PASS** after the scoped settings assertion and final export safeguards, 2.8 minutes; browser-final-affected.log. Covers the complete laboratory journey, four-method/three-seed comparison, controls, transfers, cold CPU DQN, hostile imports, storage failures and large legacy migration. |
| node scripts/browser-tests.mjs test tests/e2e/laboratory.spec.js --grep 'responsive pages' | **3/3 PASS** after the final canvas CSS correction, 1.1 minutes; browser-visual-final.log. Each case checks all five laboratory/Notebook/island routes with axe and overflow assertions at 390, 768 and 1440 pixels. |
| node scripts/calibrate-laboratory.mjs | PASS; 30 actual agents, six method/representation groups, five seeds each, measured at 0/600/1200 interactions. challenge-calibration.json retains all outcomes. |
| npm.cmd run build | PASS; static /rl-island/ assets, build.log and exact sizes/SHA-256 in build.json. Vite's >500 kB chunk warning remains. |
| node scripts/capture-laboratory-review.mjs | PASS on final build; ten full-page desktop/phone captures, focused actual-data inspectors, no page errors/overflow, measured controls. visual-review.json and control-benchmark.json. |
| node scripts/capture-all-lessons-review.mjs task-09 | PASS on final build; fresh import of validated QA records confirms all eleven lesson completion states together. combined-completion-review.json records input hashes. |

All **96 distinct browser scenarios** have passing coverage across the full and affected runs. A single combined 96-case run was not repeated after the last fixes. The last source change was laboratory canvas CSS only; responsive checks and both capture scripts were rerun. Dependency-linked entry/page chunks rehashed; the worker and neural chunk hashes stayed unchanged. Earlier build manifests are retained as build-full.json, build-affected.json and build-before-visual-fix.json. Final assets: index-DlZFCNT7.css, index-YTFC-fdT.js, page-BhqX-7Lq.js, training.worker-BW848dpu.js and learner-DVaGqjuE.js.

Initial cold TensorFlow fixture imports exceeded 5 seconds and then 15 seconds. Module transformation was moved outside the unit fixture deadline; actual CPU training/disposal assertions remain, and the separate cold browser-worker test passes. The first failed log is retained; an intermediate retry log was overwritten by its subsequent passing run. A tightened transfer contract initially left one coordinate-feature fixture invalid (302/303); it was corrected to local-goal features and all subsequent suites passed. Earlier growing suites passed 298, 300, 303 and 304 checks. The full-run selector failure and its context are retained. Screenshot inspection found square CSS sizing stretching rectangular maps; the final canvas uses its intrinsic proportions. No failed check is counted as a pass.

### Recorded outcomes and storage evidence

The final QA comparison retains all twelve agents at 600 real interactions each. Q-learning, SARSA and Dyna have mean frozen return 0.8 and success 1 on this small deterministic map; actor-critic has mean return -0.6367, sample SD 0.1097 and success 0.8. Dyna performs 3,000 additional simulated backups (3,600 total updates); the other methods perform 600 updates. These are measured outcomes of this configuration, not a general ranking. Full configurations, seed suites, raw rows and wall times are in browser-qa-comparison.json and comparison-summary.json.

Reference-map calibration supports the guided criterion of at least 600 source interactions, success in at least four of five frozen episodes, a prior prediction and all three concept checks. At 600 interactions, all five local-goal agents met the performance criterion; one of five coordinate-linear agents failed it. All failures remain recorded. Arbitrary edited maps/rewards differ in difficulty and are not comparably graded. The adaptation QA run separately records 60 source and 120 target interactions; zero-shot assertions verify unchanged weights and zero target updates.

The migration browser test re-exported seven legacy standalone agents and unchanged lesson records after IndexedDB migration and refresh. Deleting one disposable model then produced an explicit missing-ID warning while preserving all activity records and the remaining six models. legacy-migration-review.json records the exact IDs. No client data outside RL Island was cleared.

Final local control measurements: Pause 8.3 ms, Resume 8.1 ms, Cancel 15.7 ms; largest observed 16 ms main-thread timer gap 17.8 ms. The initial measurement was 8.5/10.4/13.7 ms with a 20 ms gap; both raw files remain. Measurements are UI click-to-observed-status during an intentionally cancelled 5,000-interaction comparison, not worst-case guarantees or learning results.

### Screenshots and review

Final captures are in evidence/task-09/screenshots/. Representative inspected files:

- sandbox-real-map.png, sandbox-workspace-390.png, sandbox-actual-update.png — corrected proportions, actual state/observation, real trace and separate training/evaluation budgets.
- compare-measured-final.png — all method summaries, raw curves and separate real/planning counters.
- transfer-actual-features.png and expedition-evidence-390.png — explicit representation and frozen evaluation/concept evidence.
- notebook-final-1440.png and eleven-completed-qa-island.png — escaped stored notes, reopening/export controls and validated QA completion.

The five pages also have *-final-1440.png and *-final-390.png full captures. docs/LABORATORY_VISUAL_REVIEW.md records the inspection scope; not every regenerated earlier-lesson screenshot was individually reviewed.

### Remaining limits, source gaps and unrun checks

The main entry is 507.34 kB minified / 168.02 kB gzip and still triggers Vite's size warning. Laboratory and neural code remain lazy where configured. Archive bounds are explicit (30 laboratory records, 1.5 MB per checkpoint, 16/32 MiB exports, inherited 2,000-episode/2,000,000-interaction run ceilings); exceeding them stops or rejects work without silently evicting raw data. Memory fallback is not durable, and pending IndexedDB writes are visibly announced. New-map transfer intentionally has the narrow local-goal contract described above.

No new slide-page citations or public-reference refresh claims were added in task 09. Prior deck discrepancies, inaccessible-refresh evidence, activity-to-slide verification gaps and instructor approval remain recorded in earlier milestones. Calibration is software QA, not a human learning study.

**NOT RUN:** fresh npm ci / standalone npm audit or browser installation (dependencies unchanged), Firefox/WebKit/Safari, physical touch devices and screen-reader user review, long-duration heap/storage stress profiling, offline/service-worker release tests, instructor/student pilot validation, deployment or host integration. Lecture mode and release hardening remain tasks 10 onward. No promise of cross-device sync, secret tests or tamper-proof grading.

## Task 08 — demonstrations and lesson 11 (historical milestone)

**COMPLETE. Stopped after task 08.** All eleven lesson routes provide instruction, working interaction and activity-derived completion. Opening stages grants no completion. No deployment, push, hosting change or live ACML modification. Every saved activity/result under task-08 evidence is a disposable developer QA artifact, not a student outcome or authenticated grade.

### Working behavior and files

- src/imitation/{demonstrations,cloning,experiment,records,view,controller}.js: shared-engine manual trajectories with pre-action labels, full transitions, seeded replay, keyboard/touch controls, inspection and bounded reviewed JSON imports. Active recordings resume after refresh. Train and held-out trajectory splits are declared before recording.
- Genuine full-batch softmax behavior cloning uses training action labels only. Stable cross-entropy, accuracy, actual gradients and policy coverage are separate from task returns. Unseen states remain uniform; frozen rollout traces expose their actual sampled actions. Import validation recomputes fitting and evaluation and rejects malformed arrays before replacing a save.
- Compatible transfer copies tabular softmax actor preferences exactly into the existing actor-critic; critic, visits, counters and RNGs start fresh. Unrelated representations are rejected. Five scratch and five initialized agents receive identical new RL-interaction budgets; additional demonstration actions and supervised passes are explicit. Pause/Resume/Cancel uses the existing worker. Failed/interrupted comparisons cannot earn completion.
- src/content/imitation.js, common lesson records/store, app routing/island/notebook, scoped styles and docs/CURRICULUM.md: all six stages, saved predictions, real fitting and comparison, numerical worked checks, measured/concept challenge and ungraded reflection. Fitting seals the dataset; up to three experiment versions remain separate. Old 04–10 backups and 01–03 progress are preserved. The Notebook includes demonstration versions and embedded RL checkpoints.
- Tests, capture scripts and docs/IMITATION_{LEARNING,REFERENCE_AUDIT,VISUAL_REVIEW}.md document contracts, source limits and actual review. No dependency was added; early lessons and imitation do not request the neural bundle.

### Checks actually executed

Windows build 26200, Node 22.18.0, npm 10.9.3, cached Playwright Chromium 153.0.8010.12. Evidence/logs: evidence/task-08/.

| Command/check | Actual result |
|---|---|
| npm.cmd run lint | PASS; lint.log. |
| npm.cmd run typecheck | PASS; strict JSDoc/typecheck.log. |
| npm.cmd run test:unit -- --maxWorkers=1 | **265/265 PASS**, nine files; unit-serial-verified.log. Includes 27 imitation cases, exact gradient/fit, held-out exclusion, compatible transfer, frozen evaluation, aligned trajectory replay, safe imports and prior regressions. |
| node scripts/browser-tests.mjs test | **81/82 PASS**, 31.9 minutes; browser-full.log. The dual neural-lesson journey exceeded its comparison wait. All other earlier journeys, manual engine controls, workers, accessibility and initial imitation scenarios passed. |
| Neural dual-journey + seven imitation cases, affected rerun | **8/8 PASS**, 12.4 minutes; browser-final-affected.log. Same numerical budgets, with a bounded longer neural wait. Both neural lesson journeys completed. |
| Final node scripts/browser-tests.mjs test tests/e2e/imitation.spec.js | **8/8 PASS** on the final build; browser-final-imitation.log. Complete lesson 11, trajectory resume/keyboard/touch, reviewed imports, export/refresh, old-save preservation, comparison controls, 320/390/768 axe/overflow checks, all-eleven route audit and malformed-array rejection. |
| npm.cmd run build | PASS; static /rl-island/ assets. build.log and build.json record exact sizes/hashes. |
| node scripts/capture-imitation-review.mjs | PASS on final build; focused desktop/mobile inspector, genuine metrics/gradient/unseen-state trace and measured comparison captures. |
| node scripts/capture-all-lessons-review.mjs | PASS; fresh browser imports of actually completed QA activity records show **11 of 11 available lessons complete**. Source backup hashes and statuses are in combined-completion-review.json. |

All **83 distinct browser scenarios** have passing evidence across these runs. A single combined 83-case run was not rerun after the last import-hardening change. The final change affects imitation backup array validation only and is covered by the final eight affected checks. The broad and preceding affected asset manifests are retained as build-full.json and build-affected.json. Final assets: index-BaQVW7vM.css, index-BpSsnYPe.js, learner-DVTz-PZJ.js, training.worker-CHPqcePr.js. SHA-256 values are in build.json.

Initial phone page overflow was fixed with constrained parent width and named internal table scrolling. Earlier unit runs hit time limits under the observed host performance: 262/263, later 262/265, then 264/265. Logs are retained. The large legacy-import fixture permits 15 seconds; the fifteen-agent neural comparison permits 60 seconds after taking 21.9 seconds against its old 20-second limit. Numerical assertions and training budgets were unchanged. A screenshot-helper storage-injection/reload setup error was also corrected. Failed checks are not counted as passes.

### Actual measurements and completion evidence

The manually recorded QA dataset has three training actions and two held-out actions. At 120 epochs, alpha .5 and 360 training-example passes, training cross-entropy falls from 1.386294 to 0.042404; held-out cross-entropy remains 1.386294. The two upper states absent from training remain uniform under cloning. This is genuine fitting with incomplete coverage, not a claim of generalization.

At 600 new RL interactions per agent, frozen upper-start mean raw return is scratch **0.378**, initialized **0.75**; each mean covers five trained agents and five fresh evaluation episodes per agent. The cloned baseline without RL is reported separately. These are this QA dataset's outcomes, not a universal winner. The five RL replicates share one demonstration dataset. All seeds, parameter/configuration hashes, budgets, raw returns, success, terminal/cap flags and missing-state decisions are retained in browser-qa-imitation.json and comparison-summary.json. No smoothing is used in this comparison.

The rerun neural benchmark used TensorFlow.js 4.22.0 CPU in Chromium: four 600-interaction runs took 11.28–14.05 seconds training wall time, with 585 updates and identical seeded parameters. Maximum observed main-thread 16ms timer gap was 37ms. All four runs retained 13 live tensors across initialization/training/evaluation. These current-machine observations are separate from task-07 historical timings; no general speed guarantee is claimed.

The original full regression journeys completed lessons 01–08 and 11; the bounded rerun completed 09–10. A fresh browser then imported the validated foundation and learning QA exports and confirmed all eleven completion states together. No synthetic completion flags or student learning results were inserted.

### Screenshots inspected

Paths under evidence/task-08/screenshots/:

- imitation-map-and-protocol.png — manual controls, actual map/state and declared split.
- imitation-policy-coverage.png, imitation-actual-gradient.png, imitation-supervised-metrics.png — genuine policy, missing states and fitting calculations.
- imitation-measured-comparison.png, imitation-unseen-rollout.png — separate reward evaluation and actual missing-state decisions.
- imitation-mobile-probabilities.png, imitation-final-inspector-390.png — internal table scrolling and readable stacked mobile layout.
- eleven-completed-qa-island.png, eleven-completed-qa-notebook.png — combined validated QA completion/import result.

Full lesson-11 stage/journey and earlier regression captures are retained too; not every regenerated earlier screenshot was individually inspected. docs/IMITATION_VISUAL_REVIEW.md records the review scope.

### Source gaps and unrun checks

Verified local lesson-11 PDF SHA-256: 143b49cf23f438ff4c11d1ffe852bc6f68ba615df24250bb53a47eb4fa864a19. Physical pages 7, 8, 27 and 28 were visually inspected. The deck is CS234 Imitation Learning and RLHF, broader than the implemented cloning/compatible-RL activity. Source text observations and original worked examples are distinguished from visual page anchors. Manifest approval flags and unapproved activity page ranges remain unchanged.

Fresh public PDF retrieval was unavailable: web reader reported inaccessible and direct Node fetch failed EACCES. Full activity-to-slide mapping/instructor approval and student-pilot calibration remain pending. No successful public refresh is claimed.

**Unrun:** fresh npm ci or standalone npm audit (no dependency changes), browser installation, Firefox/WebKit/Safari, physical touch devices or screen-reader user testing, GPU backends, full heap/long-duration stress profiling, offline/service-worker release checks, real-student effectiveness studies, deployment and host integration. No cross-device sync or authenticated grading claim. Standalone Sandbox/Compare/capstone, lecture mode and release hardening remain tasks 09 onward; all eleven lesson flows are implemented.

## Task 07 — real browser DQN and lessons 09–10 (historical milestone)

**COMPLETE. Stopped after task 07.** Lessons 01–10 have guided activity flows; lesson 11 remains explicitly unfinished. No deployment, push, hosting change or live ACML edit. All saved lesson journeys and training data in this evidence are disposable developer QA artifacts, not student progress or authenticated grades.

### Working behavior and changed files

- `src/agents/deep/{schema,learner,validation}.js`: real TensorFlow.js 4.22.0 CPU neural inference/autodiff/SGD, a seeded 2→16→16→4 ReLU/linear MLP (388 parameters), bounded serializable replay, detached terminal-aware targets, delayed hard target copies and explicit tensor disposal. The full observation encoder includes every enabled task variable; the supported small neural maps enable position only. Current Q overlays are network predictions, not independent table entries.
- `src/agents/{registry,tabular}.js`, `src/training/{config,run,worker-host,training.worker,coordinator,validation}.js`: lazy neural initialization, separate initialization/replay/environment/action randomness, existing chunked worker controls, stale-generation rejection, error checkpoints, preserved episode/reset semantics and validated save/load. SGD has no momentum slots; logical optimizer iteration count is persisted. Invalid concurrent commands do not abandon the active training budget; rejected mismatched resumes release temporary tensors.
- `src/evaluation/{frozen,comparison,comparison-validation}.js`: detached frozen greedy neural evaluation with no learning; equal-real-interaction table/DQN and replay/target comparisons, matched neural batch/warmup/update counts, five independent training seeds per variant, shared evaluation roots and three budget checkpoints. Failed comparisons retain the failed configuration/seed/checkpoint and remain incomplete.
- `src/content/deep-learning.js`, existing lesson controller/records/persistence/notebook/routing and `docs/CURRICULUM.md`: both complete six-stage flows with saved predictions, actual play/updates, worked numerical checks, live experiments, calibrated evidence/concept challenges and ungraded reflections. Existing 04–08 exports survive unchanged; refresh/resume and full 04–10 export/import passed. Exploration alone grants no completion.
- `src/ui/deep-learning.js`, `src/ui/learning-lab.js`, `src/rendering/learning-chart.js`, scoped styles: actual vectors/weights/Q/visits/residuals, recorded exploration decisions and batch calculations, replay IDs/statistics, loss/gradient/parameter-change metrics, target counts, separate training/evaluation plots and descriptive stability tables. Latest 256 optimizer metrics are explicitly retained without smoothing. Failure is visible and preserved, with no invented successful update or return.
- `src/rendering/island-renderer.js`: coordinate-label font now fits the fixed canvas margin on small maps. Loss strokes use visible brand blue. Reset learning starts from seeded random weights and empty replay, while Reset episode preserves both networks, replay, optimizer state and counters.
- Added neural unit/browser tests, failure/replacement checks, `scripts/capture-deep-review.mjs`, source/implementation documentation, attribution and task-07 evidence. TensorFlow core/CPU are exact lockfile dependencies; early lessons do not request the neural bundle.

### Checks actually executed

Windows 11 build 26200, Node 22.18.0, npm 10.9.3, cached Playwright Chromium 153.0.8010.12. Logs are under `evidence/task-07/checks/`.

| Command/check | Actual result |
|---|---|
| Exact install of `@tensorflow/tfjs-core@4.22.0` and `@tensorflow/tfjs-backend-cpu@4.22.0` | Initial sandbox fetch failed EACCES; approved network retry succeeded, adding 12 packages. Install output audited 140 packages and reported zero vulnerabilities. This was not a separate `npm audit` run. |
| `npm.cmd run lint` | PASS on final source. |
| `npm.cmd run typecheck` | PASS on final source. |
| `npm.cmd run test:unit` | **238/238 PASS**, eight files, 33.26 s in the final full unit run; 26 neural cases added to the 212 earlier cases. |
| Initial `node scripts/browser-tests.mjs test tests/e2e/deep-learning.spec.js` | **8/8 PASS**, including both complete lesson journeys, old-save preservation, refresh/resume, export/import, CPU benchmark, speed independence, early lazy requests and responsive axe checks. |
| `node scripts/browser-tests.mjs test` | **73/73 PASS**, 18.1 min. Includes all 65 earlier browser scenarios and the eight new neural scenarios. Both neural journeys ran again with real default-budget comparisons. |
| Final affected run: deep-learning, deep-safety and environment files, excluding the already-completed long dual-journey case | **20/20 PASS**, 2.2 min, after worker resource/error fixes, coordinate-label and loss-stroke changes. Includes all 11 manual environment browser checks, seven neural checks and two new failure/replacement checks. |
| Final `node scripts/browser-tests.mjs test tests/e2e/deep-safety.spec.js` | **2/2 PASS**, after final copy/status corrections. Failure survives refresh, earns no completion, and resets to real live training; obsolete async neural initialization emits no stale result. |
| `npm.cmd run build` | PASS on final source, 2.37 s; static `/rl-island/` build. Asset sizes/hashes are in `evidence/task-07/build.json`. |
| `node scripts/capture-deep-review.mjs` with cached browser path | PASS on final build. Keyboard Step/Pause/Cancel, imported QA state, mobile comparison overflow check, axe and focused screenshots. Final measured pause completion 33.9 ms and cancel completion 38.2 ms in this review; these are measurements, not worst-case promises. |

The full 73-test suite preceded the final worker/canvas/loss refinements; those paths were covered by the subsequent 20 affected checks. The last changes clarified “current experiment,” initial weight semantics, and “Stopped” instead of “Warmup” for a failed first optimizer step. They were rebuilt, linted/type-checked, covered by the two final failure/replacement checks and visually reviewed. A combined 75-scenario full-suite run was **not** rerun after these final refinements. All 75 distinct browser scenarios have passing evidence across the recorded runs.

Numerical coverage includes exact terminal/cutoff and bias-update fixtures, detached online/target bootstrap, finite differences across all network layers, uniform bounded replay and chronological ablation, target synchronization, exact seeded continuation with replay/optimizer/target state, evaluation isolation, pause/resume/cancel, stale initialization, failed-run persistence/recovery, malformed imports, fair real budgets, old exports and repeated tensor cleanup. Fault injection is labeled as a fixture, not a naturally observed benchmark divergence.

### Actual benchmark and learning observations

`evidence/task-07/browser-benchmark.json` records a headless Chromium CPU-worker benchmark on Intel Core i7-10510U @ 1.80 GHz, eight logical processors, approximately 16 GB RAM, Windows 10.0.26200. TensorFlow.js 4.22.0 CPU/float32; seed 11; default six-cell map/config; 600 real interactions and 585 optimizer updates per run.

- Four repeated runs took **3.497, 2.558, 2.572 and 2.510 seconds training wall time**, with active training compute **2.276, 1.631, 1.639 and 1.616 seconds**. First neural initialization took 304 ms; warm initialization 2.8–4.1 ms. Separate frozen evaluation took 28.5–40.2 ms. Largest observed main-thread 16 ms timer gap was **20 ms**. This is a small single-machine benchmark, not a general performance guarantee.
- Each initialized/trained/evaluated browser run retained **13 live tensors / 3,108 tensor bytes**, with identical seeded numerical parameters across all four runs. Five Node/Vitest create/train/evaluate/dispose cycles returned to **0 tensors / 0 bytes**, with no growth after warmup. These checks do not claim full JS heap, GC or GPU memory profiling.
- Benchmark final sampled batch loss was about **0.002187**; fresh frozen returns were **[-1.1, 0.25, 0.30, 0.45, 0.75]**. No claim of solved training or convergence is made.
- Both browser lesson journeys ran 600 interactions per agent: lesson 09 has 10 from-scratch runs and lesson 10 has 15, with five independent seeds per variant and paired roots across variants. Lesson-09 mean frozen returns were table **0.9**, DQN **0.12**. Lesson-10 means were replay+target **0.12**, chronological+target **0.672**, replay+online bootstrap **0.9**. These are this fixture's observed outcomes, never hardcoded ranking or universal comparisons. One low-loss reference agent timed out with return −3; this remains visible evidence rather than being omitted.
- Training, unsmoothed last-256 neural losses and frozen evaluation remain separate. Episode-return smoothing is a trailing arithmetic mean of at most seven raw complete/capped returns. All seeds, configuration versions, budgets and definitions are exported. CPU results at 100 ms, 800 ms and display-off speeds were identical (`neural-animation-replay.json`).

### Screenshots and inspection

Screenshots are in `evidence/task-07/screenshots/`; all displayed QA progress comes from executed activities. Focused files manually inspected include:

- `deep-lab-final-desktop.png`, `deep-map-and-recorded-update.png`: live environment and recorded actual action/batch update; the final coordinate labels no longer clip.
- `lesson-09-network-inspector.png`, `lesson-09-actual-neural-update.png`, `deep-inspector-390.png`: real network, metrics, encoded state and responsive layout. Final 320/390/768 captures and automated axe/overflow checks are retained.
- `deep-source-and-observe.png`, `deep-mathematics-focused.png`: corrected deck scope and explicit GVF/categorical examples.
- `deep-live-loss-plot.png`, `deep-training-evaluation-plots.png`, `deep-measured-stability-table.png`: visible blue loss trace, genuinely separate training/evaluation data and measured seed variability.
- `deep-failure-fault-injection.png`: deliberately excessive finite weights in a labeled test fixture; the UI preserves the failure and shows Stopped, without a successful optimizer update or completion.
- `lesson-09-complete-desktop.png`, `lesson-10-complete-desktop.png`, `deep-comparison-mobile.png`: full journey/comparison captures are retained. They are not authenticated student results.

Detailed findings and inspection scope are in `docs/DEEP_VISUAL_REVIEW.md`. The earlier regression screenshots are retained as captures; not every earlier screenshot was manually re-inspected in this milestone.

### Source verification, unavailable references and remaining issues

`docs/DEEP_REFERENCE_AUDIT.md` and `evidence/task-07/source-review.json` record reviewed local PDF hashes, complete extracted-text review and actual visual anchors. Verified physical pages: 10.pdf **11, 13, 18, 22**; 14.pdf **6, 24, 32, 33**. These are content anchors, not invented activity-page mappings. Replay/target stabilization belongs to part 1. Lesson 10 explicitly labels its live ablation as a part-1 bridge and covers part-2 GVF, normalization and distributional ideas with explanations and worked checks. It does **not** claim a C51, quantile, GVF, auxiliary-task, PopArt or UVFA learner.

Fresh web-reader requests for both public PDF URLs reported “not accessible via this tool.” The verified repository copies were available and used; no fresh retrieval/hash is claimed. Full instructor approval, activity-to-slide mapping and student-pilot validation remain pending. Manifest approval flags and empty activity page ranges remain unchanged. The existing lesson-02 source discrepancy and lesson-11 scope gap remain explicit.

**Unrun:** fresh `npm ci`, standalone `npm audit`, browser download/install, Firefox/WebKit, native mobile/device and screen-reader user tests, GPU/WebGL backends, full browser heap/long-duration stress profiling, student learning-effectiveness testing, deployment and host integration. No cross-GPU bitwise reproducibility, offline readiness, cross-device sync or authenticated grading claim. Lesson 11 and tasks 08 onward remain unfinished.

### Development failures retained honestly

The initial neural smoke exposed a missing TensorFlow gradient registration; the lazy module now imports the gradient registry. The first 22-case neural suite had two failures: a fixture expected an incomplete evaluation-rule string, and the old browser backup exposed an over-strict exact softmax recomputation check across JS engines. The fixture was corrected and softmax validation uses a tight 1e−12 tolerance; old data is preserved unchanged. A later concurrent unit/browser run hit one existing 5-second policy-fixture timeout (235/236 passed); sequential reruns passed all 236 and then all 238 cases. The failed concurrent log is retained. Two initial focused screenshot-helper attempts raced pending worker mounting; waiting for initialization fixed capture timing. Early lint/type issues were corrected before the final passing checks. No failed or skipped command is counted as passing.


## Task 06 — policy gradients and actor-critic (historical milestone)

**COMPLETE. Stopped after task 06.** Lesson 08 is available with all six stages. Lessons 09–11 remain explicitly unfinished. Final local static assets are `index-jidEjFrl.js`, `index-EzL_C9Ka.css`, and `training.worker-JiWZjoqu.js`; SHA-256 values are in `evidence/task-06/build.json`. No deployment, push, hosting change, live ACML modification or neural dependency.

### Working behavior and changed files

- `src/agents/policy.js` implements stable max-shifted softmax, seeded categorical sampling, exact score gradients, complete-episode REINFORCE, REINFORCE with an action-independent value baseline frozen during collection, and one-step actor-critic. The actor has its own tabular preferences; the critic has separate state values. No Q-table/greedy surrogate is used. The fixed-start discounted objective and outer gamma^t are explicit. Baseline fitting sums the recorded episode residuals. Actor-critic treats its TD signal as fixed in the actor gradient. Terminal continuation is zero; external timeouts retain critic continuation and skip incomplete REINFORCE returns with a visible counter and bias explanation.
- `src/agents/{tabular,registry}.js`, `src/training/{config,run,validation}.js`, and `src/evaluation/{frozen,comparison}.js` integrate the new capabilities with the shared environment and existing chunked worker. Selection-time probabilities, baseline values, episode times, returns/errors, score vectors and before/after parameters are recorded. Checkpoints preserve partial episodes and replay exactly; validation checks policy arithmetic and counters. Evaluation samples the frozen learned softmax at temperature 1 and does not touch training state. Environment/action randomness stays independent of presentation.
- `src/content/policy-methods.js`, shared lesson routing/controller/records, and `docs/CURRICULUM.md` implement Observe, Predict, Play, Reveal mathematics, Experiment and Challenge. Predictions precede results; numerical checks require a real policy update; challenge interpretation uses actual measured results plus a critic/advantage concept question. Reflections are saved verbatim, not graded. Completion comes from activities and explicit checks.
- `src/ui/{policy-methods,learning-lab}.js` and scoped styles provide probability meters around the original vector Robo, actual actor/critic inspection, policy/critic/visit/error overlays, recorded categorical draws and stepwise parameter calculations. All numerical plots and tables derive from real runs. Comparison trains five seeds per method at equal episode budgets and reports mean discounted frozen evaluation scores and observed seed ranges. Real interactions may differ and are retained explicitly; no sample-efficiency or universal-winning claim is made. Capped evaluation rows remain partial observed sums.
- `src/persistence/learning-store.js`, notebook and available-route helpers add lesson 08 without destructive migration. Existing task-04/task-05 exports validate unchanged. Browser QA imports preserve lessons 04–07; refresh/resume and a full export/import round trip preserve lesson-08 parameters and activity evidence. Foundations and unrelated storage remain separate.
- Added `docs/POLICY_METHODS.md`, policy unit/browser tests, `scripts/calibrate-policy-methods.mjs`, `scripts/capture-policy-review.mjs`, source-use evidence and final visual inspection notes. README and asset attribution describe the current scope. Historical evidence is retained.

### Checks actually executed

Windows, Node 22.18.0, npm 10.9.3 and cached Playwright Chromium. Dependencies remain pinned and unchanged. `npm ci` and browser installation were not rerun; the existing local runtime/cache was used. Logs are under `evidence/task-06/checks/`.

| Command/check | Actual result |
|---|---|
| `npm run lint` | PASS, exit 0 initially and on final source/scripts/tests (`lint-final.log`). |
| `npm run typecheck` | PASS, exit 0 initially and finally; strict JSDoc (`typecheck-final.log`). |
| `npm run test:unit` | PASS, 212/212 across seven files, exit 0; final run includes all 188 prior tests and 24 policy cases (`unit-final.log`). |
| `npm run build` | PASS, exit 0 initially and finally (`build-final.log`). Static subpath assets and module worker; no runtime network dependency. |
| `node scripts/browser-tests.mjs test` | Full regression run: **64/65 pass**, exit 1 (`browser-full.log`). All 59 earlier scenarios passed, including all seven earlier lesson journeys, manual keyboard/touch, persistence and shell. The new cancellation test raced against an already-finished job; corrected and rerun below. |
| `node scripts/browser-tests.mjs test tests/e2e/policy-methods.spec.js` | Final build: **6/6 pass**, exit 0 (`policy-browser-final.log`). Full lesson 08, prediction gate, numerical checks, wrong/correct challenge attempts, real three-method comparison, old-save preservation, refresh, export/import, frozen evaluation, actor-critic/REINFORCE controls and reset meanings, and 320/390/768 accessibility/overflow checks. |
| `node scripts/browser-tests.mjs test tests/e2e/policy-methods.spec.js --grep 'actor-critic step' --repeat-each=3` | Final build: **3/3 pass**, exit 0 (`worker-browser-repeat.log`). Repeated the corrected pause/resume/cancel/reset/cap test. |
| `node scripts/calibrate-policy-methods.mjs` | PASS, exit 0: 30 genuinely trained agents, three methods × five seeds × minimum/default budgets of 20/120 episodes. Full output in `challenge-calibration.json`. Developer calibration, not student results. |
| `node scripts/capture-policy-review.mjs` with cached browser path | PASS, exit 0 on final build. Real keyboard Step/Pause/Cancel, active learned-policy screenshots, mobile mathematics and expanded comparison. Zero exercised axe violations and no global page overflow; `visual-review.json`. |
| Probability/gradient/update fixtures | PASS: extreme finite logits, normalization, categorical boundaries/seeded frequency, four log-probability finite-difference gradients, an independently enumerated two-step discounted objective gradient with action-independent baselines, hand preference/critic updates, repeated-state batch contributions, gamma=0, true terminal versus external cap. |
| Replay/evaluation/worker fixtures | PASS for all three policy methods: exact continuation from partial-episode saves, frozen full training checkpoint, pause/resume/cancel equivalence, tampering rejection, old exports, strict real comparisons. Earlier stale-message and coordinator regressions also passed. |
| Animation independence | PASS in actual Chromium workers: 30 episodes per method at display intervals 100 ms, 800 ms and off. Per-method digests are identical: REINFORCE `fnv1a32-c390cb64`, baseline `fnv1a32-9be2f575`, actor-critic `fnv1a32-88793157`. See `policy-animation-replay.json`. |

The initial focused unit run had 23/24 passes because an exact-array assertion expected 0.15 instead of floating-point 0.15000000000000002; it now uses a tight numerical tolerance. The initial policy browser run had 5/6 passes: after an intentionally wrong challenge attempt the form rerendered, and the test omitted reselecting its required evidence answer. That test script was corrected. The full regression run's one failure was a different test race: the resumed 1,000-episode actor-critic job had already completed (1,030 total episodes, 3,377 interactions) before Playwright could click the now-disabled Cancel button. The test now uses a slower-learning declared configuration and issues Cancel immediately upon the resumed status; real worker behavior is unchanged. It passes in the final six-test run and three additional repetitions. These failed runs are retained and are not reported as passes.

After the full regression run, production changes were limited to the lesson-08 vector Robo/blue-meter visual polish and an explicit capped-evaluation wording clarification. The worker bundle is identical between builds. The complete 65-test suite was not rerun after that polish; the final affected six scenarios and three cancellation repetitions passed. `build-before-visual-polish.json` identifies the full-regression build; `build.json` identifies the final screenshots and affected checks. Every scenario has passing coverage; this is not a claim of one clean final 65/65 invocation.

The actual calibration changes ranking with budget: at 20 episodes, mean discounted evaluation returns are REINFORCE 2.886603, baseline 2.549966, actor-critic 0.446331; at 120 episodes they are 5.357918, 5.306078 and 5.811200 respectively. These are observations from this seed suite, not expected student achievement or hardcoded challenge thresholds. Five-agent ranges and all raw rows are retained.

The final keyboard review used actor-critic with gamma=0, alpha=0.001 and a 1,000-episode job to exercise controls. Observed Pause acknowledgment/completion: 14.8/15.3 ms; Cancel: 5.6/6.3 ms; initialization: 4.4–92.9 ms. These meet the approximate targets in this capture only; no reference-laptop or universal performance claim.

### Screenshot paths and inspection

All paths below are in `evidence/task-06/screenshots/`. They are actual disposable QA states. Detailed visual observations and limitations are in `evidence/task-06/visual-inspection.md`.

- `learned-policy-active-state.png`: learned directional probabilities around the original vector Robo, actual preferences/critic and full parameter table.
- `learned-policy-map-and-selection.png`: actual map overlay and a sampled left action despite right being most probable.
- `reinforce-actual-update.png`, `actor-critic-actual-update.png`: genuine numerical return/TD and preference/critic updates.
- `policy-inspector-320.png`, `actor-critic-inspector-mobile.png`: inspected narrow accessible inspectors.
- `policy-mathematics-mobile.png`, `policy-comparison-mobile-expanded.png`: inspected worked mathematics and real seed comparison. Wide comparison tables scroll inside the card; the screenshot only shows the initial horizontal position.
- `lesson-08-complete-desktop.png`: inspected six-stage completion summary, measured comparison and ungraded QA reflection.
- Full play, experiment, responsive lesson views and earlier-regression screenshots are also retained. Screenshots are not a substitute for the computation/tests above.

### References, remaining issues and unrun checks

- Verified local course reference `lesson-08.pdf` corresponds to catalog `files/rl_course/9.pdf`; inspected topic text covers softmax/direct policies, episodic discount conventions, baselines and actor-critic. File hashes are in `reference-use.json`. Detailed activity-to-slide alignment remains **UNVERIFIED**; no slide-page citations were invented. The explicit outer gamma^t convention is documented rather than silently copying a pseudocode variant that omits it.
- The supplemental public Sutton–Barto PDF retrieval returned **HTTP 502** and was not used as a retrieved source. Public ACML reference refresh was **not rerun in task 06**; prior verified audit evidence is preserved. Earlier lesson-02 catalog/PDF mismatch and lesson-10/11 scope issues remain recorded.
- Instructor/content approval and student pilot: **NOT RUN**. QA completions are not student progress or authenticated grades; reflections are not automatically understood or graded.
- Firefox, WebKit/Safari, native screen readers, physical touch hardware and an agreed reference-laptop performance study: **NOT RUN**. Exercised scope is cached Chromium, keyboard/touch emulation, automated axe tags, responsive layouts and the measured local worker review.
- No task-06 implementation blocker remains. Lessons 09–11, full sandbox/compare/capstone, offline support, integration and deployment remain outside this task. No live ACML modification.


## Task 05 — explicit features, approximation and Dyna planning (historical milestone)

**COMPLETE. Stopped after task 05.** Both new lesson journeys and required regressions are verified. Production assets: `index-CQ9GXFmD.js`, `index-BU6A4bEh.css`, `training.worker-C75XRuYa.js`. This is a local static `/rl-island/` build. No deployment, hosting change, live ACML edit or release commit.

### Working behavior and changed files

- `src/agents/{features,linear,dyna,registry}.js` and the extended tabular capabilities implement explicit `compact-v1` features, linear TD prediction of a specified policy, action-block linear SARSA, an observed deterministic environment model and Dyna-Q. Full state/observation retains consumed-collectible inventory; the intentionally aliased encoder only removes it from features. Generic encoders also include enabled battery/task-time variables. Informative features can still have approximation error.
- `src/training/{config,run,validation,worker-host,coordinator}.js` reuses the existing environment and chunked worker, adds exact real-interaction batches and validated linear/model checkpoints. Environment/action/planning streams are separate and saved. Targets mask true termination and bootstrap at external caps. Episode reset retains weights/model/RNG; reset learning starts a separate experiment. No neural dependencies were introduced.
- `src/evaluation/{comparison,comparison-validation}.js` compares informative/aliased linear learners and a full-state tabular baseline in lesson 06; Dyna-Q and no-planning Q-learning in lesson 07. Five independently seeded agents per variant stop at exactly floor(B/3), floor(2B/3) and B real interactions. Primary budget is 60–1,500 real steps, default 600. Partial rollouts, real backups, simulated backups, total updates, computation time, raw episode data, unsmoothed checkpoint scores and separate frozen evaluations are retained explicitly. Prediction RMSE uses a separate exact fixed-policy reference. No method is promised to win.
- `src/content/approximation-planning.js`, the shared lesson controller/records and `docs/CURRICULUM.md` complete all six stages of lessons 06–07: prior predictions, actual play/traces, worked mathematics, experiments, numerical/concept checks, measured evidence challenges, ungraded reflections and saved completion. Lessons 08–11 remain unfinished. Source topics use the verified repository references; no slide-page citations were invented.
- `src/ui/{approximation-planning,learning-lab,learning-pages,views}.js`, `src/main.js` and styles show actual features/weights/contributions, full state, counterfactual inventory vectors labeled as encoder examples, a BigInt table-size calculator, observed model entries and expandable individual planning calculations. Every simulated update is explicitly distinguished from real experience. Accessible DOM tables accompany the Canvas and charts; narrow tables scroll within their containers.
- `src/persistence/learning-store.js` and the notebook accept additive lessons 04–07 in the existing schema-1 namespace. The old task-04 QA backup imports unchanged; no destructive migration is needed. Import replaces only contained lesson records, preserving absent lessons, foundations and unrelated storage. Merged run IDs are validated before writing. Existing history limits and memory-only fallback remain explicit.

### Executed verification

Windows; Node 22.18.0, npm 10.9.3, cached Playwright Chromium. Dependencies remained pinned; no reinstall was needed. `checks/verification-results.json` records actual command exits/timestamps.

| Command/check | Actual result |
|---|---|
| `npm run lint` | PASS, exit 0; rerun after the final test-harness corrections (`lint-closeout.log`). |
| `npm run typecheck` | PASS, exit 0; strict JSDoc checks. |
| `npm run test:unit` | PASS, 188/188 across six files, exit 0, in the separate final verification run. Includes all 162 prior tests and 26 new cases. |
| `npm run build` | PASS, exit 0; static subpath build plus module worker. |
| New lesson browser tests | PASS, 6/6, exit 0, after fixes; `checks/browser-advanced-second.log`. Both complete six-stage journeys, old progress preservation, frozen evaluation, refresh/resume, full backup import/export, linear SARSA/alias settings and reset meanings, Dyna controls, animation-speed replay, and 320/390/768 accessibility/overflow checks. |
| `npm run test:e2e` | Initial full run: 57/59 pass, exit 1; all seven full lesson journeys, keyboard/touch/manual play, storage and shell scenarios exercised. Two test-harness failures are recorded below and resolved in the final affected run. See `browser-full.log` and `browser-full-result.json`. |
| Final affected browser checks | PASS, 15/15, exit 0: five clock/MC scenarios repeated three times. Includes both corrected failures and every test using the adjusted clock helper. `browser-clock-final-result.json` contains the exact command; `browser-clock-final.log` contains results. Together with the unchanged-build full-run passes, all 59 scenarios have passing coverage. |
| `node scripts/calibrate-approximation-planning.mjs` | PASS, exit 0. Eight actual comparisons: 100 trained runs across minimum/default prediction/control budgets and Dyna planning counts 0/5/20. Five independent training seeds per variant, three exact real-budget checkpoints, five frozen evaluations per checkpoint. Not student learning results. |
| `node scripts/capture-approximation-review.mjs` | PASS, exit 0 on the production build. Detailed screenshots, keyboard Step/Pause/Cancel with 20 planning backups per real step, expanded mobile comparison, no page overflow and zero axe violations in exercised tags. |
| Numerical/model/budget fixtures | PASS: hand weights 0.321/−0.0395 and prediction 0.30125; feature dimensions/norm/action blocks; enabled inventory/battery/time; real Q=1 then planned Q=1.5; model observations/visits; rejection of conflicting deterministic outcomes; true-terminal versus cap bootstrap; 0/1/5/20 planning counters; zero-planning Dyna matches Q-learning. |
| Evaluation/replay/save compatibility | PASS: all three new learners retain full training state through frozen evaluation; exact saved continuation and pending SARSA action; episode reset retains parameters; pause/resume exact real budget including partial rollout; cancel invalidates queued work; old task-04 browser exports validate and preserve newly added lesson records. Earlier stale-message tests also pass. |
| Animation independence | PASS: three real Dyna browser runs at 100 ms, 800 ms and display-off, each with 300 real interactions / 1,500 simulated backups, give the same numerical digest `fnv1a32-6f42001f`. `advanced-animation-replay.json` records this, not screenshot hashes or a supplied replay. |

The initial new browser run failed on an unfocusable scroll region, narrow-table overflow, a missing explicit select label and the speed-test harness retaining an in-memory record after clearing storage. These were fixed; the next six tests passed. A concurrent lint/type/unit/browser run hit the old 5-second timeout in two numerical regression tests; the subsequent separate unit run passed 188/188 without relaxing timeouts or numerical assertions. These earlier failed runs are retained and not counted as passes. During full regression the manual-lab navigation clock test advanced mocked time before hash-route disposal; its harness now waits for the island heading before advancing time, while retaining the exact saved-step assertion. A stale assertion also expected “learned tables” after the UI wording became “learned parameters”; its numeric preservation assertion was unchanged. The first repeated rerun passed 5/6 but exposed a second existing clock setup race (pausing at the same time used to install the running clock could mean fast-forwarding to the past). Both existing clock helpers now initialize one hour before their pause time, following the bundled Playwright documentation. The final five affected scenarios each passed three repetitions (15/15). Only test harnesses changed after the production build; the full 59-test suite was not rerun again after those harness corrections.

`challenge-calibration.json` contains actual results. At 600 real interactions, default prediction RMSE means are informative linear TD 1.881119, aliased linear TD 2.120635 and full-state tabular TD 1.422005. At 60 real interactions, the aliased mean is slightly lower than the informative mean, demonstrating why no ordering is hardcoded. Default 600-step SARSA representation evaluations tie at return 15. At the 60-step Dyna comparison, means are Q-learning −80 and Dyna −29; both tie at 5 by 600 real steps. The challenge uses the actual measured score or tie, not these example numbers or a preset success threshold.

Measured local keyboard/worker review at 20 plans/real step: Step acknowledgment 14.1 ms, batch acknowledgment 12.9 ms, Pause acknowledgment 239.2 ms / completion 249.3 ms, Resume acknowledgment 39.1 ms, Cancel acknowledgment 16.4 ms / completion 17.5 ms. Initialization acknowledgments ranged 11.4–256.2 ms. Pause/initialization exceeded the approximate 100 ms acknowledgment target in this capture. Cancellation was below 250 ms. No agreed reference-laptop or broad performance claim is made; full events are in `visual-review.json`.

### Screenshots inspected

All paths are under `evidence/task-05/screenshots/`; actual disposable QA data, not fabricated student progress. Detailed visual observations are in `evidence/task-05/visual-inspection.md`.

- `feature-weight-detail.png`, `linear-update-detail.png`, `table-calculator-detail.png`: explicit normalized feature/weight inspection, actual linear target/gradient calculation, inventory state and 12-state / 48-Q-entry / 384-byte default calculator.
- `dyna-real-planning-detail.png`, `learned-model-detail.png`: real backup followed by five distinctly labeled planning backups and observed model data with real-only visits.
- `lesson-06-training-desktop.png`, `lesson-07-training-desktop.png`, `linear-sarsa-aliased-desktop.png`: actual worker training, parameters, separate frozen evaluation and control/representation settings.
- `lesson-06-comparison-desktop.png`, `lesson-07-comparison-desktop.png`, `dyna-comparison-mobile-expanded.png`: equal real budgets, checkpoint outcomes and raw runs. Expanded narrow comparison inspected; numerical tables require horizontal scrolling.
- `lesson-06-complete-desktop.png`, `lesson-07-complete-desktop.png`, `advanced-notebook-desktop.png`, `advanced-island-desktop.png`: evidence-based completion, saved ungraded reflections, prior records retained, four later lessons unavailable. Lesson-07 completion inspected.
- `lesson-06-320.png`, `lesson-07-320.png`, corresponding `390`/`768` captures and `dyna-paused-cancelled-desktop.png`: responsive controls and traces. Narrow lesson-06 layout inspected. Prior lesson/manual/shell screenshots are refreshed by the regression suite in the same task-05 directory; task-04 evidence is preserved.

### Remaining issues, references and unrun checks

- No known remaining implementation blocker for lessons 06–07. Final numerical and affected browser checks pass. The initial full-run failures and subsequent passing reruns remain separately recorded; no skipped or failed command is reported as passing.
- Approximate acknowledgment target was exceeded for Pause and some initializations in the recorded local capture; broader hardware benchmarking is NOT RUN. Cancellation/control integrity passed. Actual timing limitations are retained, not described as universally responsive on every device.
- Existing verified repository references for lesson 06 (`7.pdf`) and lesson 07 (`8.pdf`) were used. Detailed activity-to-slide page alignment is UNVERIFIED; no page citations are claimed. No new public ACML/PDF network refresh was run during task 05; the previous public audit evidence remains in the repository. The pre-existing lesson-02 catalog/PDF mismatch and lesson-10/11 scope issues remain recorded.
- Human instructor/content approval and student pilot review: NOT RUN. Automated QA completion is not an authenticated grade or evidence of student understanding.
- Firefox, Safari/WebKit, native screen readers, physical touch devices and agreed reference-laptop performance: NOT RUN. Chromium keyboard, touch emulation, automated accessibility and responsive cases are the exercised scope.
- Optional nonstationary change-point / stochastic learned-model extension is not implemented; the supplied learned model explicitly supports the declared deterministic stationary task. Lessons 08–11, full sandbox/compare/capstone, offline service worker and deployment are outside task 05.


## Task 04 — real tabular learning and worker (historical milestone)

**COMPLETE. Stopped after task 04.** Final production assets: `index-CB_Rsz9m.js`, `index-BBaqnq1d.css`, and `training.worker-eZh_Fl9b.js`. Production build identity is recorded in `evidence/task-04/build.json` (Node 22.18.0); this is a local static build, not a deployment or release commit. The passing full regression build before the Q-overlay/backup polish is identified separately in `build-before-polish.json`; the 33-test affected recheck build before the final notebook label clarification is in `build-before-notebook-labels.json`.

### Implemented behavior and changed files

- `src/agents/tabular.js`: explicit prediction/control capabilities; fixed-policy first-visit Monte Carlo and TD(0); constant-epsilon SARSA and Q-learning. MC uses complete first-visit suffix returns and 1/N averaging, with capped/interrupted returns skipped and counted. TD/control bootstrap at external caps, and mask genuine termination. SARSA saves and executes the next behavior decision selected before the current update.
- `src/training/{config,run,validation,worker-host,training.worker,coordinator}.js`: the existing shared environment engine supplies every sampled transition. Separate seeded environment/action streams, versioned immutable experiments, validated exact-continuation checkpoints, bounded worker chunks, command acknowledgments, Step/Episode/Train/Pause/Resume/Cancel, stale run/configuration/sequence rejection, and route disposal. Reset episode preserves learning; confirmed Reset learning starts a new version and separate history. Display speed never consumes simulation randomness.
- `src/evaluation/{frozen,comparison}.js`: detached frozen-policy evaluation with explicit fixed-policy or greedy-epsilon-0 rule. Five independently trained agents per method, paired roots, held-out evaluation suites, complete raw results and computational/sample budgets. Prediction RMSE uses an explicitly separate exact-model reference for the identical task/policy. Observed means/ranges and winning challenge answer are computed from actual results; no universal winner or convergence is claimed.
- `src/content/model-free.js`, `src/lessons/{model-free-controller,learning-records}.js`: both original six-stage lessons, three missions each, explanations, numerical worked examples, stored predictions before results, actual learning activity, numerical/concept checks, independently measured comparison, calibrated evidence challenge, ungraded reflections and earned completion. Lessons 06–11 remain unfinished.
- `src/ui/learning-lab.js`, `src/rendering/learning-chart.js`, `src/styles/app.css`: actual V/max-Q, Q, policy, visits and error overlays; selection-time Why this action? and numerical update inspector; DOM tables alongside Canvas; real raw training curves and explicitly defined trailing means; separate unsmoothed evaluation. Q values have directional labels and remain inside cells; narrow maps scroll within a keyboard-accessible region.
- `src/persistence/{learning-store,bounded-json}.js`, `src/app/learning-notebook.js`: small activity metadata plus IndexedDB model checkpoints, memory fallback, refresh/resume, recorded failed checks, separate lessons-04–05 backup/export with explicit import replacement. Checkpoints replay the current episode and validate counters/tables/provenance; backups reject duplicates, unsupported fields/versions, nonfinite values and oversize input. The earlier foundations store/export and unrelated ACML data are preserved. Backups are self-reported, not signed grades.
- Routing/map/notebook integration in `src/main.js`, `src/ui/{views,learning-pages}.js`, `src/app/notebook-controller.js`; source/runtime documentation in `docs/CURRICULUM.md`, `docs/MODEL_FREE.md`, `docs/ENVIRONMENT.md`, and README. No new dependencies; the already pinned local Chart.js 4.5.1 is now used.
- Added `tests/unit/{model-free,learning-persistence}.test.js`, `tests/e2e/model-free.spec.js`, `scripts/calibrate-model-free.mjs` and `scripts/capture-learning-review.mjs`. Earlier browser tests now reflect five available lessons and preserve their historical evidence directories.

The prediction map is a slip-0.2 corridor (step −1, goal-entry reward 5). The declared cliff variant uses step −1 plus hazard −20; hazards neither terminate nor teleport. The goal terminates and a safe detour exists. These are original tasks using complete position state, not claimed slide-page reproductions. The fixed-policy learners receive samples only, never transition-model access.

### Checks actually executed

Environment: Windows, Node 22.18.0, npm 10.9.3, Playwright 1.63.0 / cached Chromium. No dependency reinstall or network refresh was required.

| Command/check | Actual result |
|---|---|
| `npm run lint` | PASS, exit 0; final source including verification scripts. |
| `npm run typecheck` | PASS, exit 0; strict JSDoc checks. |
| `npm run test:unit` | PASS, 162/162 across five files, exit 0. Includes the prior 116 tests and 46 numerical/worker/learning-persistence checks. |
| `npm run build` | PASS, exit 0; static `/rl-island/` build with a separate module-worker asset. |
| `npm run test:e2e` | PASS, 52/52, exit 0 on the full regression build before the final overlay/backup polish. Includes all five full lesson journeys, previous manual keyboard/touch gameplay and shell checks. |
| `npm run test:e2e -- tests/e2e/model-free.spec.js tests/e2e/shell.spec.js` | PASS, 33/33, exit 0 after the Q-overlay/backup polish; both full lesson journeys, all task-04 checks, explicit Q-cell containment at 320 px large text, and shell regressions. |
| `npm run test:e2e -- tests/e2e/shell.spec.js --grep "notebook\|static subpath"` | PASS, 4/4, exit 0 on the final build after a notebook-only scope-label clarification. |
| `node scripts/capture-learning-review.mjs` | PASS, exit 0 on the final build: keyboard Step/Pause/Cancel, actual worker acknowledgment/completion timings, restored QA models, focused Q screenshot, expanded mobile comparison, no page overflow and zero axe violations. |
| `node scripts/calibrate-model-free.mjs` | PASS, exit 0; 40 actual independently trained agents: five seeds × two methods × minimum/default budgets for each lesson, each with five separate frozen evaluations. All raw rows retained. |
| Exact numerical/evaluation tests | PASS: TD new V 2.26; SARSA 3.398; Q-learning 3.686; true-terminal 3.308; external-cap bootstrap; repeated-state first-visit MC; specified-policy invariance; exact SARSA next action; all four learners' full training state unchanged by evaluation. |
| Worker/replay tests | PASS: bounded chunks and acknowledgments, pause/resume equal to continuous execution, cancel invalidates queued work, stale run/hash/reordered/disposed messages ignored, evaluation cancellation does not invent results. All four saved learners replay exactly. |
| Actual animation-speed comparison | PASS: three real 60-episode worker SARSA runs at 100 ms, 800 ms and display-off yield identical tables/rows/interaction digest `fnv1a32-d93763c0`. See `animation-replay.json`; this is not a hash of screenshots or supplied replay. |
| Full lessons 04–05 | PASS on the full regression build: stored predictions, Step/Episode/batch/evaluation, refresh/model resume, math, five independent agents per method, incorrect then measured-correct challenge answers, ungraded reflection, notebook, export/import Cancel/Replace and restored models. Browser records explicitly identify themselves as QA, not student achievements. |
| Reset/configuration/isolation | PASS: MC updates only on complete episodes; episode reset preserves tables; configuration edit starts zero counters/separate curves; cancelled comparison restores the original interactive model; refresh retains cancelled status; navigating away disposes training. |
| Storage/import checks | PASS: unreadable records preserved, quota/IndexedDB denial retains usable memory state and downloadable model; invalid/duplicate/oversized/nonfinite/incompatible records rejected; unrelated storage preserved; free-text markup stays inert; visiting stages/reflections cannot earn completion. |
| Responsive/accessibility checks | PASS in exercised Chromium routes: axe zero violations, 390 mobile, 1024 tablet, 1920 wide, 320 large-text, touch-emulated Step/policy/error controls and existing keyboard journeys. Final Q-cell containment, keyboard Step/Pause/Cancel, and expanded mobile comparison also passed. This is not a claim of complete WCAG or native assistive-technology coverage. |

Final algorithm/affected-check logs and exit timestamps are in `evidence/task-04/checks/final-results.json`; the complete 52-test run is in `checks/results.json` / `browser.log`. The final notebook-only label build and focused visual review are recorded in `checks/notebook-review-results.json`, `notebook-final.log` and `visual-review.log`. Lint/typecheck/build were rerun successfully for that label change. The first targeted browser run failed on two ambiguous select labels (8 passed, 2 failed); explicit labels fixed both and the next targeted run passed 10/10. The first numerical run failed on an exact floating-point representation assertion (`0.85` versus `0.8500000000000001`); a tight numerical tolerance corrected the assertion, not the algorithm. Screenshot review then found Q-cell text overflow missed by axe; the final fix includes an explicit containment test. The first standalone screenshot review also stopped because axe required an explicit browser context; the harness was corrected and rerun successfully (`visual-review-initial.log` retains the failure). These earlier failures are not counted as passes.

`challenge-calibration.json` records actual developer calibration, not student performance. At the default 80-episode prediction budget, mean RMSE was MC 0.118055 and TD 0.174757. At the default 120-episode cliff budget, mean frozen evaluation return was SARSA −53 and Q-learning −29.6, including failed/time-capped agents. The minimum-20-episode cliff runs also include failures; no convergence or successful-learning claim is substituted for those data. The challenge requires a measured comparison plus explicit numerical/concept checks, not a predetermined method or return threshold.

Measured performance: the final keyboard/worker capture recorded acknowledgments from 5.5 to 24.4 ms, Pause completion 10.1 ms and Cancel completion 6.7 ms, while a 1,000-episode bounded batch was active. These observed values are below the approximate 100 ms acknowledgment / 250 ms cancellation targets on this host, not a universal hardware guarantee. The separate browser UI click-to-status check measured Pause 126.3 ms and Cancel 117.4 ms. See `control-acknowledgments.json` and `worker-latency.json` for the different measurement definitions.

### Screenshots and visual inspection

Directory: `evidence/task-04/screenshots/`. Screenshots show actual disposable QA runs; their predictions/reflections explicitly identify browser verification.

- `lesson-04-training-desktop.png`, `lesson-05-training-desktop.png`: actual V/Q, actions, updates, raw/smoothed training and separate evaluation; inspected. The initial Q capture exposed cell overflow, subsequently fixed and rechecked.
- `lesson-04-comparison-desktop.png`, `lesson-05-comparison-desktop.png`: actual five-agent-per-method comparisons and retained failures; inspected cliff comparison.
- `lesson-04-complete-desktop.png`, `lesson-05-complete-desktop.png`, `learning-notebook-desktop.png`, `island-learning-complete.png`: earned completion, ungraded reflection/history, notebook and six later unavailable lessons. Inspected the lesson-05 summary and notebook; final notebook capture clarifies the separate foundation/learning scopes.
- `mc-visits-update.png`, `worker-paused-desktop.png`: complete-return updates/visit overlay and actual paused worker.
- `learning-lab-mobile.png`, `learning-lab-tablet.png`, `learning-lab-wide.png`, `learning-lab-large-text-320.png`: responsive learning controls and accessible non-Canvas representations; narrow layout inspected.
- `learning-policy-touch-mobile.png`, `learning-error-touch-mobile.png`: actual touch-emulated interaction and alternate overlays.
- `q-inspector-detail.png`, `learning-q-large-text-320.png`, `cliff-comparison-mobile-expanded.png`: final focused Q layout, bounded narrow map scroller and all independent run summaries in the expanded mobile comparison. All three inspected; numerical cells no longer overlap the state/table controls.

The full regression run also refreshed earlier shell/manual/foundation screenshots inside the task-04 evidence directory. Task-00–03 evidence remains intact. `browser-qa-learning.json` is an actual downloadable artifact from the completed journeys and is not included as production student progress.

### Remaining issues and explicitly unrun checks

- No known blocking defect remains in the exercised task-04 flows. The limits and unrun coverage below remain explicit.
- Human instructor/content review and a student usability/learning pilot have **NOT RUN**. Developer calibration and QA completion are not evidence of student learning or authenticated grades.
- No new reference refresh was attempted in task 04. It uses the repository's verified references and the earlier same-day public ACML/PDF audit. The protected catalog remains unrefreshed as documented; detailed slide-page alignment is still **UNVERIFIED**. The lesson-02 PDF/catalog discrepancy remains visible. No slide-page citation was invented.
- **NOT RUN:** Firefox/WebKit, native screen readers, physical touch hardware, native 200% browser zoom, offline/service-worker reload, long-duration/highest-budget stress testing, cross-device sync or transfer/zero-shot evaluation. Chromium touch emulation and 320 px large-text checks are narrower tests.
- Histories have explicit bounds (four experiments, three comparisons and ten standalone evaluations per lesson, plus finite row/import budgets). There is no archive-pruning UI or migration from future schemas yet. Limits produce visible errors; no silent eviction/mixing. Browser quotas can trigger memory-only mode, which requires export before closing. Foundations and learning backups are separate.
- A route exit/abrupt refresh during active training retains the latest delivered consistent checkpoint; work since the most recent progress message can be lost. It does not silently keep training in the background. In-progress comparisons are cancelled rather than presented as complete.
- Frozen greedy policies may fail or time out at these small training budgets; those observed outcomes remain in graphs and tables. MC censoring at short episode caps is explained. No universal cliff winner is claimed.
- Lessons 06–11, later algorithms, the general Sandbox/Compare/Expedition workspaces, offline caching and release integration remain unfinished/out of scope. No deployment, hosting change, push or live ACML modification was performed.


## Historical task-03 evidence

The following section describes task 03 at its original completion; its then-unimplemented model-free learning is implemented in task 04 above.

## Task 03 — lesson runtime and foundational pilot (historical milestone)

**COMPLETE. Stopped after task 03.** The final production assets are `index-BqLeCNp1.js` and `index-CMYiq6Du.css`; SHA-256 values and the capture timestamp are in `evidence/task-03/build.json`. This is an uncommitted local build of `rl-island@0.1.0`, not a deployment or release commit.

### Implemented behavior and changed files

- `src/content/foundations.js` and `docs/CURRICULUM.md`: three original, complete lesson entries, each with three missions, explanations, a worked example, saved predictions, numerical experiments, explicit checks, a calibrated challenge, reflection, and visible source status. The catalog/PDF mismatch for lesson 02 remains explicit; no slide-page citation was invented.
- `src/planning/planners.js`: exact fixed-policy evaluation, greedy improvement, policy iteration, and value iteration. Reachable states and outcomes come from the existing shared environment model. Synchronous backups, true-terminal masking, stable tie order, declared budgets, gamma restrictions, actual sweep tables, and Bellman residuals are tested against independent hand-solvable fixtures.
- `src/lessons/{controller,calculations,records}.js`: one six-stage player, keyboard/touch manual play through the shared engine, actual transition inspection, prediction-before-results gates, actual computed playback with next/animate/pause/final controls, changed-parameter experiments, explicit activity requirements, and completion summaries. Playback keeps keyboard focus and typed answers; leaving a stage cancels it. Rendering consumes no simulation RNG.
- `src/persistence/progress.js`: versioned small local progress, stage/episode resume, bounded JSON export/import, stored-record preservation on read errors, memory fallback, explicit import replacement, replay validation, calculation validation, and derived completion. Every unsuccessful/successful check attempt is kept. Free text is escaped and never automatically graded.
- `src/ui/learning-pages.js`, `src/app/notebook-controller.js`, `src/ui/escape.js`: notebook predictions, computed experiments, ungraded reflections, completion/check history, export, import preview/Cancel/Replace, and resume links.
- `src/main.js`, `src/app/router.js`, `src/ui/views.js`, and `src/styles/app.css`: guided lesson routes, saved progress on the island, prerequisite suggestions, responsive layouts, and honestly unfinished lessons 04–11. The previous task-02 environment remains available at `#/practice`; no prior manual feature was removed. The renderer now supports rectangular lesson maps as well as the square manual islands.
- New `tests/unit/planning-lessons.test.js`, `tests/e2e/lessons.spec.js`, and `scripts/calibrate-foundations.mjs`; affected shell/manual browser tests now verify the guided pages and free manual lab. The two existing 10,000-seed statistical fixtures retain their sample sizes/assertions with 15-second timeouts to allow concurrent checks.
- `docs/LESSON_RUNTIME.md`, updated `docs/ENVIRONMENT.md`, README, and this ledger document actual APIs, calculation/record semantics, limits, and remaining work. No new runtime or development dependencies were added.

Lesson 01 covers agent/environment/state/action/reward, manual play, return and the discount fork. Lesson 02 evaluates an unchanged right policy on a stochastic corridor and exposes merged collision probabilities. Lesson 03 separates evaluation, improvement and optimality sweeps, then compares both planners on the same changed-discount task. Values/returns and progress come from actual computations and activities; no student progress or learning result is preloaded.

### Checks actually executed for task 03

Environment: Windows 11, Node 22.18.0, npm 10.9.3, Playwright 1.63.0 / cached Chromium 153.0.8010.12. Existing pinned dependencies were reused.

| Command/check | Actual result |
|---|---|
| `npm run lint` | PASS, exit 0. |
| `npm run typecheck` | PASS, exit 0. |
| `npm run test:unit` | PASS, 116/116 across three files, exit 0. Includes prior shell/environment fixtures and 38 planning/activity/persistence checks. |
| `npm run build` | PASS, exit 0; static subpath artifact generated. |
| `npm run test:e2e` | PASS, 39/39, exit 0. Complete regression run before the final playback-focus polish; build identity retained in `build-before-focus.json`. |
| `npm run test:e2e -- tests/e2e/lessons.spec.js tests/e2e/shell.spec.js` | PASS, 28/28, exit 0 on the final build after playback-focus polish; affected guided lessons and shell rechecked. The environment implementation was unchanged after its passing full regression run. |
| `node scripts/calibrate-foundations.mjs` | PASS, exit 0; three manual route boundaries, five fixed-policy slip settings, five PI/VI discount comparisons recorded. |
| Three complete browser journeys | PASS; all six activity requirements in lessons 01–03, keyboard/fixed-policy actions, refresh mid-episode, actual calculations/experiments, incorrect then correct challenge checks, saved ungraded reflections, notebook, export, import Cancel/Replace, and refresh/resume. Eight later map nodes remain unavailable; lesson 04 has no runnable activity. |
| Playback and browser integrity | PASS; actual frames advance, pause, and cancel; keyboard focus/typed numerical answers survive frame updates and completion; no page errors or remote runtime requests in the complete journey. |
| Responsive/accessibility checks | PASS; exercised axe scans reported zero violations, keyboard and touch-emulated play, 390 px mobile, 1024 px tablet, 1920 px wide, and 320 px large-text reflow. This is not a claim of complete WCAG or native screen-reader coverage. |
| Local dev preview | HTTP 200 from `http://127.0.0.1:5173/rl-island/`; no deployment. |

Logs are in `evidence/task-03/checks/`. `browser.log` records the full 39-test pass; `browser-guided-shell.log` records the final 28 affected rechecks. Earlier failures are retained/reported rather than counted as passes: prerequisite and manual-lab links needed underlines for non-color identification; a hand-solved fixture needed the correct residual-to-value-error tolerance; two existing statistical fixtures exceeded five seconds under concurrent load. Their mathematical assertions were not weakened. Final passing logs are `lint.log`, `typecheck.log`, `unit.log`, `build.log`, `browser.log`, `browser-guided-shell.log`, and `calibration.log`.

`challenge-calibration.json` is deterministic developer calibration, not student performance. `browser-qa-progress.json` was exported through the completed browser journey and labels its notes/predictions as Browser QA. It is evidence only and is not bundled as a student record. Defaults produce the analytic results: return 4.05 for [0,0,5] at gamma 0.9; B≈4.634146 at slip 0.2; and optimal [3.5,5,0] at gamma 0.9. The changed-gamma comparison at 0.5 actually produces [1.5,5,0] with 29 policy-iteration evaluation sweeps versus two value-iteration sweeps.

### Screenshots and visual inspection

Directory: `evidence/task-03/screenshots/`. Browser records in these captures are disposable, explicitly labeled QA activities, not invented student results.

- `lesson-01-experiment-desktop.png`, `lesson-02-experiment-desktop.png`, `lesson-03-experiment-desktop.png`: actual computed experiments; the latter two include numerical values, residuals, sweep counts and fixed configuration. Inspected lesson-02/03 results.
- `lesson-01-complete-desktop.png`, `lesson-02-complete-desktop.png`, `lesson-03-complete-desktop.png`: actual completion after all required activities. Inspected lesson-01/03 summaries and ungraded reflection controls.
- `lesson-01-play-touch-mobile.png`: actual touch-emulated route, goal termination, reward trace and accessible controls; inspected.
- `lesson-03-math-mobile.png`, `lesson-03-math-tablet.png`, `lesson-03-math-wide.png`, `lesson-03-math-large-text-320.png`: computed values and responsive six-stage layout. Inspected tablet, wide and 320 px layouts.
- `island-completed-desktop.png`: three earned completions and eight unavailable later lessons; inspected.
- `notebook-reflections-desktop.png`, `notebook-experiments-desktop.png`, `notebook-check-history-desktop.png`: saved text, numerical evidence, both unsuccessful/successful check attempts, and self-reported-record labels; inspected.

The full run also captures the existing manual-lab and shell routes. The final affected run regenerates guided/shell screenshots after focus polish. Task-00/01 brand evidence and task-02 engine screenshots remain preserved in their own directories.

### Remaining issues and explicitly unrun checks

- No known blocking defect remains in the exercised task-03 flows. Challenge thresholds have deterministic developer calibration; instructor review and a human student pilot have **NOT RUN**. No claim of demonstrated student learning or authenticated grades is made.
- No new external reference refresh was attempted in task 03. It reuses the verified repository references and the earlier same-day ACML/all-eleven-PDF refresh. No newly unavailable reference is asserted. The protected course catalog remains unrefreshed as recorded in the source audit.
- Lesson-02 PDF/catalog mismatch remains visible. The MDP lesson follows the user's explicit scope; this is not claimed instructor approval or slide alignment. Lesson-10/11 scope and all detailed activity-to-slide mappings remain unapproved/unverified.
- **NOT RUN:** Firefox/WebKit, native screen readers, physical touch hardware, native 200% browser zoom, real student usability sessions, large-model performance benchmarks, and offline/service-worker reload. Touch is Chromium emulation; 320 px large text is not native zoom testing.
- Task-03 history is deliberately small: 12 experiments, 60 check attempts, 80 current-episode actions per lesson and 512 KiB progress files. No silent eviction. Unsupported progress versions are rejected; larger stores/migrations remain future work. Interrupted numerical playback restarts its deterministic computation rather than resuming an animation frame.
- Model-free algorithms, training workers, frozen-policy evaluation, later lessons, Sandbox/Compare/Expedition, lecture mode, offline caching, and release integration are **NOT IMPLEMENTED / NOT RUN** here. Optional battery/time/collectibles remain tested environment capabilities, not additional guided pilot missions.
- No deployment, hosting change, push, or live ACML modification was performed. Tasks 04 onward were not started.

## Historical task-02 evidence

The following section describes task 02 at its original completion. Its then-unimplemented lesson/planning features are implemented in task 03 above; its manual lab remains supported at `#/practice`.


## Task 02 — shared engine and manual gameplay (historical milestone)

**COMPLETE. Stopped after task 02.** Production assets: `index-Bbg_I2_u.js` and `index-Dgxf5dOS.css`; SHA-256 values and capture timestamp are in `evidence/task-02/build.json`. This is an uncommitted local build of `rl-island@0.1.0`, not a deployment or release commit.

### Implemented behavior and changed files

- `src/environment/{types,rng,schema,model,engine}.js`: strict versioned maps/state, separate seeded RNG streams, one pure transition/reward definition, reset/step/explicit model APIs, true state versus agent observation, detached snapshots, and validated serialization.
- `src/content/scenarios.js`: deterministic Base Camp, 80/10/10 Slippery Shore, and Collection Inlet with a once-per-episode supply. Walls, boundaries, goals, hazards, and additive reward components work. Optional battery and finite-horizon task-state fields are implemented and unit-tested; the two early presets remain position-only.
- `src/app/manual-session.js`: one shared live environment, a separate empty parameter container, and a trace buffer bounded to 100 rows. Episode reset preserves parameters; confirmed learning reset clears only parameters. Preservation is tested with explicitly identified nonempty numerical fixtures, not fabricated learned values.
- `src/rendering/island-renderer.js`, `src/app/manual-controller.js`, and `src/ui/manual-workspace.js`: real Canvas Robo rendering, arrow/WASD and 44 px touch movement controls, cell hit testing and keyboard text grid, actual state/observation/action/reward/next-state/probability inspector, trace history, and Step/Run/Pause controls. Run repeats one selected direction; it does not train. Route changes pause and dispose controls; the memory session persists between lesson workspaces.
- `src/persistence/environment-checkpoint.js`: explicit local save, confirmed load, exact RNG continuation, bounded/validated checkpoints, visible unavailable/quota errors, and preservation of unrelated host data. A refreshed page starts a new memory episode until the user loads a saved checkpoint.
- `src/main.js`, `src/ui/views.js`, `src/styles/app.css`: integrated every lesson workspace, responsive controls and inspector, updated storage descriptions, and fixed offscreen skip-link painting in scrolled captures.
- `tests/unit/environment.test.js`, `tests/e2e/environment.spec.js`, and updated shell browser tests: numerical fixtures, model versus sampling checks, real browser interactions, and current screenshots. Earlier task-00/01 evidence is preserved.
- `docs/ENVIRONMENT.md` and README document APIs, reward rules, state/RNG semantics, checkpoint limits, and deferred work.

The inspector uses the exact trace produced by the engine. It displays measured manual transitions and their reward sum. No student progress, mastery, learned policy, learning curve, or evaluation result is created.

### Checks actually executed for task 02

Environment: Windows 11, Node 22.18.0, npm 10.9.3, Playwright 1.63.0 / cached Chromium 153.0.8010.12. Existing pinned dependencies were reused; no new dependency installation was needed.

| Command / check | Actual result |
|---|---|
| `npm run lint` | PASS, exit 0. |
| `npm run typecheck` | PASS, exit 0, strict JSDoc application checks. |
| `npm run test:unit` | PASS, 78/78 tests: 23 existing shell fixtures plus 55 environment/session/rendering-adapter fixtures. |
| `npm run build` | PASS, exit 0; static production assets generated for `/rl-island/`. |
| `npm run test:e2e` | PASS, 30/30 production-browser tests; preview runner exited 0. |
| `npm run test:e2e -- --grep 'checkpoint replacement is explicit'` | PASS, 1/1 affected test rerun; viewport modal capture inspected. The multi-flow test timeout was increased to 60 seconds after a 30-second rerun timeout; final execution took 20.6 seconds. |
| Model/reward fixtures | PASS: hand-calculated merged corner probabilities, wall/boundary collisions, all additive reward components, absorbing zero reward, consumed supplies, multiple collectible bits, optional battery/time, terminal versus external cap. |
| Sampling and determinism | PASS: golden xorshift32 sequence, independent streams, two 10,000-seed sampling fixtures, model inspection without draws, reset replay, exact checkpoint future, pause/resume versus Step, viewport redraws and motion settings. |
| Reset separation | PASS: episode reset retains a nonempty test parameter store; learning reset preserves environment serialization and history. Browser dialog cancel/confirm also exercised. |
| Browser manual gameplay | PASS: actual arrow/WASD input, touch-emulated taps, cell inspection, goal, slippery movement, supplies, Run/Pause, route cancellation, reset and checkpoint controls. |
| Automated accessibility | PASS: 12 shell route/viewport scans plus 5 manual-state/dialog scans with zero axe violations. This is not complete WCAG certification. |
| Responsive checks | PASS: desktop 1440×900, mobile 390×844, tablet 1024×768, wide 1920×1080, and 320 px with large text. No page-level horizontal overflow in assertions; the narrow results table scrolls internally. |
| Runtime/static smoke | PASS: exercised local production routes/assets loaded without page errors or remote requests in the smoke flow. |

Logs and command exit evidence are in `evidence/task-02/checks/`. The actual browser Run/Pause checkpoint reproduced by five single steps is retained in `evidence/task-02/manual-replay.json`.

The first unit run exposed an incorrect test assertion (load returns an environment, not text), and lint found one unused variable. Both were corrected. The first browser run timed out on exact label-text selectors for wrapped selects and was interrupted; the corrected role/name selectors passed the complete rerun. Screenshot review caught an offscreen skip-link painting artifact, which was fixed before final captures. The reset dialog was recaptured at viewport size because a full-page capture only paints its fixed backdrop over the current viewport. A later capture-only rerun exceeded its original 30-second whole-test limit near the final Reset episode action; with a 60-second budget for its reload, axe scan, screenshot, and confirmation flows, the complete test passed in 20.6 seconds. Earlier failed/interrupted runs are not counted as passes.

### Screenshots and visual inspection

Current directory: `evidence/task-02/screenshots/` (24 PNGs). All numbers in gameplay captures are actual browser-driven manual transitions, not student or learning results.

Inspected task-02 captures:
- `manual-keyboard-desktop.png`: wall collision followed by keyboard movement; reward breakdown and exact transition table.
- `manual-goal-desktop.png`: actual seven-action path, reward sum 13, goal-entry reward 19, terminal controls disabled.
- `slippery-inspector-touch-mobile.png` and `manual-results-touch-mobile.png`: real touch-emulated movement, 80/10/10 probabilities, separate inspector/results tabs.
- `external-truncation-desktop.png`: 80 blocked actions, actual reward sum −240, truncated true / terminated false, continuing model.
- `collectible-state-desktop.png`: consumed mask visible in state/observation; reentry gives no repeated supply reward.
- `text-map-desktop.png`: focusable DOM cell map and selected goal coordinates.
- `reset-learning-confirmation-desktop.png`: readable native confirmation dialog (viewport capture).
- `lesson-01-mobile.png`, `lesson-tablet.png`, `lesson-wide.png`, `lesson-large-text-320.png`: responsive control and text layouts.

The suite also regenerated `welcome-*.png`, `island-*.png`, `lesson-01-desktop.png`, `compare-*.png`, `notebook-*.png`, `settings-*.png`, and `menu-mobile.png`. These shell routes passed their browser regression/axe checks. Detailed task-00/01 brand/reference review remains in `docs/VISUAL_REVIEW.md`.

### Remaining issues and explicitly unrun checks

- No known blocking defect remains in the exercised task-02 flow. Human instructor/content approval remains outstanding.
- **NOT RUN / out of this task:** learning algorithms, TD/Q/SARSA/DP mathematical updates, training workers, Q-table frame-rate comparisons, frozen-policy evaluation, progress/assessment journeys, learning performance benchmarks, offline caching/service worker, export/import of learning records, and deployment.
- **NOT RUN:** Firefox/WebKit, native screen readers, physical touch hardware, and native 200% browser zoom. Mobile touch was Chromium emulation; large text and 320 px reflow are not a claim of native zoom testing.
- Checkpoints contain the environment only. They omit prior trace history and learning parameters, are user-editable local data, and do not authenticate reward history or grades. Optional battery/time and restricted observations are API features with unit coverage, not separate student lesson experiences.
- No new external reference refresh was attempted for task 02. The verified repository references and prior same-day task-00 refresh were reused. No newly unavailable reference is asserted. The protected course catalog remains unrefreshed as recorded below.
- Existing content blockers remain: lesson-02 PDF/catalog mismatch, lesson-10 activity coverage, lesson-11 scope, and unapproved activity-to-slide ranges. No slide-page citation was invented.
- Tasks 03 onward are intentionally untouched. No deployment, hosting change, push, or live ACML modification was performed.

## Historical task-00/01 evidence

The sections below describe the earlier shell milestone and its then-unimplemented engine. Their checks were run at that milestone; the current implementation and checks are recorded above.


## Build identity and changes

Version: `rl-island@0.1.0`. Final production assets: `index-CrqM2RLT.js` and `index-CjQMswxo.css`. Full SHA-256 values and capture timestamp are in `evidence/task-00-01/build.json`. This is an uncommitted local build, not a claimed release commit.

- Added `package.json`, lockfile, Vite/ESLint/TypeScript/Playwright configuration, and documented scripts.
- Added vanilla ES modules under `src/app/`, `src/content/`, `src/ui/`, `src/persistence/`, plus responsive styles and the entry point. No environment or algorithm engine was created.
- Added local original ACML logo, logo/font license notices, and original illustrative geometry.
- Added unit/browser tests, reference audit and capture tools, evidence files, source/PDF/asset/visual review documentation, and updated the sanitized manifest's retrieval status.
- Preserved the pre-existing planning documents and the original gitignore entries.

## What works

Welcome, island dashboard, all eleven numbered lesson previews, notebook tabs, display settings, and explicit unavailable routes for Sandbox, Compare, and Expedition. Hash routes reload correctly under `/rl-island/`; Back, route focus, keyboard skip link, mobile disclosure/Escape, and arrow-key tab navigation were exercised.

Desktop workspaces show instructions/world/inspector with an empty results strip. Narrow layouts put the world first and expose the other panels through tabs. The island has eleven accessible HTML links and a text lesson-list alternative.

Display preferences use a versioned namespaced localStorage key, survive reload, and show readable errors when storage is blocked. Restoring display defaults preserves unrelated host data. This shell creates no student progress or learning record.

Unimplemented game, training, evaluation, import/export, and lecture-mode controls are disabled/labeled. There are no fabricated runs, scores, curves, mastery indicators, or slide citations. The production bundle uses local assets and made no runtime requests to remote services during the smoke test. The development-only component view is unavailable in production.

## Checks actually executed

Environment: Windows 11, Node 22.18.0, npm 10.9.3, Playwright 1.63.0 / Chromium 153.0.8010.12.

| Command or check | Final result |
|---|---|
| `npm install --save-exact --no-fund --cache .local/npm-cache --fetch-retries=1 --fetch-timeout=30000` | PASS; 127 packages installed; npm reported 0 vulnerabilities at installation. |
| `npm ci --offline --no-fund --cache .local/npm-cache` | PASS; clean reinstall from lockfile/cache after releasing Windows file locks. |
| `npm run lint` | PASS, exit 0. |
| `npm run typecheck` | PASS, exit 0. |
| `npm run test:unit` | PASS, 23/23. |
| `npm run build` | PASS; static dist generated with /rl-island/ base. |
| `npm run test:e2e` | PASS, 19/19 against final production build; runner shut down its preview and exited 0. |
| `npm run setup:browser` | PASS, exit 0; Chromium cache resolved successfully. |
| Automated accessibility | PASS; zero reported axe violations on six routes at desktop/mobile sizes (12 scans), plus both development component views. Not a claim of complete WCAG compliance. |
| `npm run capture:components` | PASS; two captures, two axe scans, computed blue/rose/button/card token checks. |
| `npm run capture:reference` | PASS; live ACML HTTP 200 at both viewports, no failed requests. |
| `node scripts/audit-references.mjs` | PASS; ACML source/license and all eleven public PDFs retrieved. |
| PDF inspection/rendering | PASS; full text extracted with pypdf, all covers plus ten selected content pages rendered with Poppler and visually inspected. |
| Keyboard/responsive checks | PASS; skip link, focus, menu, Escape, tabs, 320 px large text, 1024 px and 1920 px workspace layouts. |
| Runtime request/asset smoke | PASS; local-only requests, no missing assets or page errors on the exercised flow. |

Final lint/type/unit/build/browser command logs and exit codes are retained in `evidence/task-00-01/checks/`. Other evidence is in `reference-fetch.json`, `pdf-inspection.json`, `asset-provenance.json`, `components-check.json`, and `reference/capture.json`.

Initial failures were fixed rather than called passing: blocked sandbox networking was retried through authorized public network access; a settings-label mismatch and low-contrast decoration failed the first browser run; the PDF renderer's Windows stdout encoding was corrected; the development axe capture was changed to use an explicit browser context; a clean install initially hit a running Vite native-module lock. The browser test wrapper now owns its preview lifecycle directly, avoiding orphaned npm.cmd preview children. An unused assignment found by lint in that wrapper was removed. Final logs represent the corrected build.

## Screenshots inspected

Directory: `evidence/task-00-01/screenshots/`.

- Desktop 1440x900 and mobile 390x844: `welcome-*.png`, `island-*.png`, `lesson-01-*.png`, `compare-*.png`, `notebook-*.png`, `settings-*.png`, `components-*.png`.
- Additional: `lesson-tablet.png`, `lesson-wide.png`, `lesson-large-text-320.png`, `menu-mobile.png`, `keyboard-focus-desktop.png`.
- Live reference: `evidence/task-00-01/reference/acml-desktop.png`, `acml-mobile.png`.

See `docs/VISUAL_REVIEW.md` for the exact screenshot list and rendered comparison with ACML. Images are full-page captures at the stated viewport sizes.

## Remaining issues and explicitly unrun checks

- All attempted ACML/PDF references are now available. The full course catalog/protected page was not refreshed; navigation relies on the supplied verified first-match course record.
- **Lesson 02 source mismatch:** catalog title describes MDP planning/evaluation, but linked `2.pdf` is exploration/exploitation. Course order was preserved.
- Lesson 10's proposed replay/target-network activity does not represent all inspected part-2 topics; lesson 11's source includes imitation, inverse RL, and human feedback. Instructor content review is required.
- Approved activity-to-slide ranges remain unverified/empty for all lessons. Verified physical-page observations live separately in `docs/PDF_REFERENCE_AUDIT.md`.
- NOT RUN: Firefox/WebKit, native screen-reader testing, physical touch devices, native 200% browser zoom, offline reload/service worker, and any engine/algorithm/learning/evaluation/performance checks. Those features are not implemented in this milestone.
- The shell is ready for visual review. It is not a playable course, a student assessment system, or a production release.





