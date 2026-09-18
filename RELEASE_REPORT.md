# RL Island release report

Date: 18 September 2026. This report concerns the built static site under `/rl-island/`. No push, publish, live hosting change, ACML homepage edit or instructor signoff was performed.

## Verdict

**Technical verdict: READY for the tested static Chromium/CPU configuration.** Final lint/type checking, 327 numerical/unit fixtures, the complete 110-case browser suite, production build, static route/asset checks, zoom, restored QA records and archive integrity checks pass. No required implementation defect or failed final technical check remains in that tested scope. This is not instructor approval or a claim of verification on untested browsers/devices.

**Full-course content/publication gate: NOT READY.** Human review of all eleven lessons and final instructor brand/content approval have not been provided. Technical tests do not replace that gate. Exact content decisions: resolve the lesson-02 catalog/deck conflict; approve lesson-10's part-1 stability bridge/part-2 conceptual coverage; approve lesson-11's cloning/compatible-RL scope relative to the broader IRL/RLHF deck; review all activity-to-slide mappings and challenge difficulty. No slide-page citations or approvals were invented.

## Artifact and build identity

- Website: `dist/`.
- Archive: `release/rl-island-static.zip`, **553,607 bytes**, containing the contents of dist with index.html at the archive root.
- ZIP SHA-256: `adb3058e294038afd19f14b510eb2fe14a4b97bf4320e348493b31314f477b35`.
- Build version: **a85e523ba15ccbfba6ba**. Twenty-two hashed runtime/license assets, 1,520,977 bytes, plus the manifest and service worker: 24 archived files in total.
- `evidence/task-11/archive-verification.json` compares every decompressed ZIP entry with dist. The fresh isolated install/build produced an identical complete offline manifest (`clean-build-reproducibility.json`). The neural and training-worker chunks are byte-identical to task 10's final build; task 11 did not change learner mathematics.

## Implemented and repaired

The release retains all eleven six-stage lesson flows, the shared seeded environment, exact planners, sampled tabular learners, linear approximation, learned deterministic Dyna model, genuine policy gradients, real CPU-worker DQN and supervised behavior cloning. Predictions precede results; completion derives from activities and explicit checks. Reflections remain ungraded. Real training, simulated planning and frozen evaluation retain separate data and counters.

Sandbox supports bounded map/reward/observation editing and compatibility errors. Compare retains two to four methods and every requested repeated seed, with real curves, raw results, explicit budgets and variability. Notebook supports existing saves, migration, filtering/reopening, validated JSON import and JSON/CSV export. Expedition separates known-map evaluation, compatible local-goal adaptation and zero-shot transfer, rejecting coordinate-table transfer. Lecture mode uses isolated temporary teaching runs and hides personal notes.

The task-10 cancellation miss was addressed in `src/laboratory/store.js` and its controller: save bookkeeping and selectors now request metadata, and IndexedDB refresh reads unknown keys instead of repeatedly cloning every archived model/trajectory. Full validation, raw data, memory fallback and complete exports remain. A new unit fixture verifies independent metadata/checkpoint copies.

Release tooling adds an ordinary static server (`scripts/static-preview.mjs`), production route/asset/network verification, public-reference link/hash verification, and a ZIP packaging/inventory check. Browser tests now use that plain static server rather than Vite preview. Full runtime dependency license texts are bundled. README, DEPLOYMENT, START_HERE, authoring, audit, attribution and visual-review documents describe the actual product and limits.

## Checks actually executed

All evidence paths in this table are under `evidence/task-11/` unless stated otherwise.

| Command or check | Actual result and evidence |
|---|---|
| `npm.cmd run lint` | PASS on final source and verification tools, `lint-release-final.log`; exit recorded in `final-source-check-exits.json`. |
| `npm.cmd run typecheck` | PASS, `typecheck-release-final.log`; strict JSDoc application checks. |
| `npm.cmd run test:unit -- --maxWorkers=1` | **327/327 PASS**, 11 files, 124.58 s; `unit.log`. Includes exact planning/TD/Q/SARSA/terminal fixtures, MC, features, Dyna, softmax finite differences, DQN/replay/targets/gradients/disposal, imitation, persistence and malicious/oversized inputs. |
| `npm.cmd run build` | PASS, `build.log`; Vite's approximately 520 kB main-chunk warning remains. No threshold was raised to suppress it. |
| Clean install and rebuild | PASS: `npm.cmd ci --offline --prefix .local/release-install --cache .local/npm-cache`, then build in that isolated directory. `clean-install-retry.log`, `clean-build.log`, `clean-build-reproducibility.json`. Initial default-cache permission failure retained in `clean-install.log`; original node_modules was preserved. |
| Online `npm.cmd audit --json --cache .local/npm-cache --fetch-retries=0 --fetch-timeout=15000` | PASS, **0 reported vulnerabilities**, `dependency-audit-network.json`. Initial restricted-network attempt failed and is retained separately. This is a point-in-time registry result, not a universal security guarantee. |
| `npm.cmd run verify:release` | PASS: **24 files / 19 routes**, byte hashes, MIME types, all discovered internal links, rejected unknown/path-traversal requests, no console/page/network errors and no remote/API request needed. `static-release.json`, `static-release-final.log` and `post-suite-check-exits.json`; the post-suite rerun also passes. Uses plain static HTTP, no transforms or route fallback. |
| `node scripts/browser-tests.mjs test` | **108/110 PASS**, 38.0 min; `browser-full.log`. Initial failures are retained; the focused rechecks and clean complete rerun below establish final passing coverage. No failed command is counted as passing. |
| Dyna control/display-speed case, `--repeat-each=3` | **3/3 PASS**, 1.2 min; `browser-dyna-recheck.log`. Trace showed the first test's mouse action arrived after its small batch completed. The corrected fixture acts on observed in-flight progress and additionally requires a nonzero, incomplete budget. Paused-state and all display-speed equality assertions remain. Initial trace: `initial-dyna-failure/`. |
| Complete lessons 09–10 focused rerun | **1/1 PASS**, 7.0 min; `browser-neural-journey-recheck.log`. Original 600-interaction budgets, all seeds, assertions and timeout are unchanged. Initial run timed out during the 15-agent lesson-10 comparison with 12 completed agents; `initial-neural-journey-timeout/`. The initial run overlapped an isolated dependency install/build; its exact slowdown cause is not proven. |
| Final complete browser rerun | **110/110 PASS**, **33.3 min**, exit **0**; `browser-release-final.log`, `browser-release-final-exit.json`. Both formerly failing cases pass in the complete run. No concurrent installation, build or independent training benchmark. |
| `node scripts/measure-hardening.mjs release` | PASS for measured acknowledgment/cancellation targets, exact seeded parameters and finite tensor allocation across 12 neural cycles. `performance-release.json` / `.log`; details below. |
| `node scripts/verify-browser-zoom.mjs` | **7/7 PASS**, `actual-browser-zoom.json`, `browser-zoom.log`. Actual Chromium tab zoom at 100%, 200% and 400%, no document overflow or axe violations in the tested manual/math/lecture views. |
| Combined eleven-lesson QA restore capture | PASS, **11/11 completed lesson records restored**, `combined-completion-review.json`. Fresh browser import combines validated actual QA exports, including preserved legacy records; it is not one human student's outcome. Repeated after the clean complete suite, with final export hashes checked. |
| In-app keyboard review | PASS for the exercised subset: collision/movement, episode reset/save, prediction selection/save/focus, gamma adjustment/computed return, Notebook and refresh. `interactive-review.json`. Export and live worker controls are separate automated evidence. |
| Public source/link revalidation | PASS: ACML homepage and all **11 PDFs**, HTTP 200, body hashes identical to verified references; `public-reference-links.json`. Initial EACCES/web-reader failures remain in `reference-refresh.json`. Protected catalog not fetched. |
| `pwsh -NoProfile -File scripts/package-release.ps1` | PASS, **24/24 ZIP entries** match dist; `package.log`, `archive-verification.json`. No enclosing dist directory, PDFs, source maps, backend files or student data are packaged. Post-suite `final-artifact-integrity.json` confirms the unchanged ZIP hash and every current dist file against the decompression-verified inventory. |

The browser suite covers all lesson stages/journeys, reset meanings, genuine training and frozen evaluation, pause/resume/cancel, stale worker rejection, CPU neural loading, save/load and imports/exports, route entry/Back/Forward, denied/quota storage, legacy migration, hostile notes and incompatible models. Offline cases actually cache unopened lazy assets, disconnect, reload every lesson/main page and train/evaluate DQN; failed/evicted cache and update-preservation cases are separate. Root ACML pages remain outside the service-worker scope. Known injected error cases are expected failures with explicit UI reporting, not silently accepted runs.

## Measurements and resource limits

Reference device: Windows kernel 10.0.26200 x64, Intel Core i7-10510U at 1.80 GHz, 16,942,497,792 bytes RAM; Node 22.18.0 / npm 10.9.3; Chromium **153.0.8010.12**, TensorFlow.js **4.22.0 CPU worker**. Localhost, unthrottled; no physical mobile or cross-browser performance claim.

Five visible tabular cancellations took **32.9, 34.6, 39.1, 43.4 and 50.5 ms**, all below 250 ms. Worker control acknowledgment peaked at **9.2 ms**, below the approximate 100 ms target. Twelve initialize/train-120/reset/evaluate DQN cycles retained **13 tensors / 3,108 bytes** and identical seeded parameters. Main-page V8 heap after requested GC changed from **3,738,916 to 3,610,424 bytes**. The main-page timer gap during those cycles peaked at **23 ms**.

The 1,900-episode stress case renders 100 rows, retains all raw export data, has 1,065 DOM elements, and measured a **92.2 ms** maximum timer gap / **75 ms** longest task. Local navigation load was **790.9 ms**; complete offline cache readiness **2,445 ms**. This does not measure cold Internet loading or prove indefinite whole-process leak freedom. Task-10 slower trials, including a 507.4 ms unexplained background gap, remain recorded; that historical cause is not declared resolved merely because it did not recur here.

Map/state, replay, history and import bounds remain explicit. No silent data eviction or incompatible-run mixing was introduced. See `docs/HARDENING.md` and `docs/LABORATORY.md` for the contracts and prior measurements.

## Screenshots and visual review

Actual captures are in **`evidence/task-11/screenshots/`**. The coding assistant inspected the five key pages at 1440×900 and 390×844, tablet/wide lessons, working Sandbox/Compare, imitation on mobile, the real neural update, lecture math and keyboard focus. See `docs/RELEASE_VISUAL_REVIEW.md` for exact filenames and observations; this is not human instructor approval.

Representative paths:

- `welcome-desktop-viewport.png`, `welcome-mobile-viewport.png`.
- `island-desktop-viewport.png`, `island-mobile-viewport.png`.
- `lesson-01-desktop-viewport.png`, `lesson-01-mobile-viewport.png`, `lesson-tablet.png`, `lesson-wide.png`.
- `compare-four-methods-desktop.png`, `sandbox-trained-desktop.png`, `notebook-mobile-viewport.png`.
- `lesson-09-actual-neural-update.png`, `imitation-fitted-390.png`, `lecture-math-390.png`, `keyboard-laboratory-controls.png`.
- `actual-browser-zoom-mathematics-200.png`, `actual-browser-zoom-mathematics-400.png`, `actual-browser-zoom-manual-400.png`, `actual-browser-zoom-lecture-400.png`.
- `eleven-completed-qa-island.png`, `eleven-completed-qa-notebook.png` — imported actual QA activity records, not student learning results.

The ACML logo, local Inter, blue/rose identity, white rounded panels and pill navigation are consistent with the verified reference. No clipping or accidental document overflow was found in the inspected views; scrolling data tables retain their text alternatives and exports. Automated axe/reflow checks supplement keyboard review and do not establish full WCAG conformance.

## Content verification and remaining limits

`docs/RELEASE_AUDIT.md` records the disposition of every earlier unresolved category and reviews formula/terminology contracts against implementation and exact fixtures. `local-reference-verification.json` and `public-reference-links.json` verify all eleven reference bodies. Existing calibration runs are indexed by hash in `calibration-registry.json`; no favorable runs were selected or new student outcomes invented. Neural/imitation challenges use actual measured comparisons plus concepts, not a hardcoded winning method. Expedition calibration applies to a guided reference protocol, not comparable grading across arbitrary maps.

**Instructor/content review is outstanding for all eleven lessons.** Detailed approved slide ranges remain empty. Human student pilots, learning-effectiveness evidence and difficulty calibration have not been performed. The narrower lesson-10/11 implementations and lesson-02 source discrepancy remain explicit and require decisions before an approved full-course teaching release.

**Additional in-app keyboard export review: UNAVAILABLE.** Two attempts to attach a fresh browser webview timed out. No export or live worker keyboard action is claimed from those attempts; automated keyboard/worker/export cases are separate evidence.

**NOT RUN:** Firefox/WebKit/Safari, native screen-reader speech/navigation, physical touch devices, throttled Internet loading, GPU backends and long-duration whole-process memory profiling. External PDFs are not offline assets. Exports are self-reported evidence, not authenticated grades; no secret client-side tests or cross-device sync. An abrupt close can lose work since the latest consistent checkpoint, and denied-storage work needs export before closing. The main chunk still triggers the size warning. No live hosting/deployment check was run because publication was prohibited.

## Exact local preview

From `C:\Users\lazeb\Desktop\acml_rl_course`:

```powershell
npm.cmd run preview -- --port 4173
```

Open **http://127.0.0.1:4173/rl-island/**. Direct lesson: **http://127.0.0.1:4173/rl-island/#/lesson/09**. Ctrl+C stops preview. The included dist already exists; to reinstall/rebuild, run `npm.cmd ci` then `npm.cmd run build` first. README contains development and test commands. DEPLOYMENT.md explains approved-owner placement under `/rl-island/` without changing the homepage. `docs/COURSE_AUTHORING.md` and `docs/ASSET_ATTRIBUTION.md` provide authoring and dependency/asset guidance.

## GitHub Pages upload package — follow-up

`release/rl-island-github-pages.zip` contains the same 24 verified application files plus `.nojekyll`, with no runtime changes. Use a dedicated `rl-island` repository and follow GITHUB_PAGES.md. Package/ZIP integrity, lint, a prepared-folder browser check including offline DQN/frozen evaluation, and the static 24-file/19-route recheck passed. Evidence is in `evidence/github-pages/`; the initial browser-cache startup error and successful tooling repair are recorded in TASK_STATUS.md. GitHub-hosted deployment has not been performed, and the outstanding human content gates remain unchanged.
