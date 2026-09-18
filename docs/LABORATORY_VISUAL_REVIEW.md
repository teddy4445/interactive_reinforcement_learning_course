# Task-09 visual review

Reviewed on 18 September 2026 in local Chromium 153.0.8010.12. The production build was served under `/rl-island/`. All progress and numerical data shown are actual disposable developer QA records; no student outcomes or synthetic completion flags were supplied.

`scripts/capture-laboratory-review.mjs` imports the validated Sandbox/known-map Notebook backup, the complete four-method comparison and the local-goal adaptation record. It performs one further real Sandbox step for the action inspector, then captures Sandbox, Compare, Expedition, Notebook and Island at 1440×900 and 390×844. Input hashes, ten viewport/page-width checks and the empty page-error list are in `evidence/task-09/visual-review.json`. Exact final build identities are in `build.json` in that directory.

Inspected representative images under `evidence/task-09/screenshots/`:

| Images | Observations |
|---|---|
| `sandbox-real-map.png`, `sandbox-workspace-390.png` | Final rectangular map preserves square cells and Robo's proportions. State and observation are separate. The 601-interaction live checkpoint and earlier evaluation at 600 interactions are labeled separately. Mobile paragraphs wrap; wide numeric tables scroll inside named keyboard-focusable regions. |
| `sandbox-actual-update.png`, `sandbox-workspace-1440.png` | Actual recorded action probabilities/update data are available in the scrollable trace. The training curve retains the observed negative-return episode; its trailing mean definition and raw table are present. The initial desktop workspace was inspected before the final CSS correction, then the focused map/mobile workspace were reinspected afterward. |
| `compare-measured-final.png` | Three agents per method and five evaluation episodes per agent are declared. Mean, sample SD and range, every method/seed curve, computational work and agent reopening controls are visible. The raw comparison has no smoothing or universal-winner claim. Long replicate/raw tables scroll internally. |
| `transfer-actual-features.png` | Named local-goal feature values are real encoder output. The description identifies the map information used and makes no transition-model claim. The table has internal vertical scrolling. |
| `expedition-evidence-390.png` | Track, source/target budgets, frozen rule, parameter identity, evaluation rows and concept/performance result remain available on the phone layout. Exact offscreen columns are accessible through the table's own horizontal scroll region. |
| `notebook-final-1440.png` | Unified filter, reviewed import/export, record reopening and separate legacy sections retain the ACML shell. The hostile QA reflection is visibly inert text. Laboratory comparisons show their requested replicate count rather than an invented source-training total. |
| `eleven-completed-qa-island.png` | A fresh validated QA import shows all eleven completed lesson records and the Final Expedition link. The labels identify activity-derived, self-reported completion. |

The original laboratory CSS forced a square canvas and stretched a rectangular map. Inspection caught this; `aspect-ratio:auto; height:auto` now preserves the renderer's intrinsic dimensions. `review-before-map-ratio.png` retains the before image. After the fix, all three responsive cases passed (390/768/1440 pixels, five pages each), and both capture scripts ran again on the rebuilt assets.

The full-page final captures are `sandbox-final-{1440,390}.png`, `compare-final-{1440,390}.png`, `expedition-final-{1440,390}.png`, `notebook-final-{1440,390}.png` and `island-final-{1440,390}.png`. Initial Sandbox images and earlier regression screenshots were also captured. Not every regenerated earlier-lesson screenshot was individually inspected, and the table/trace images intentionally show scrollable panels rather than expanding every saved row onto the page.

`capture-all-lessons-review.mjs task-09` separately imports the foundation and sampled-learning QA exports and verifies all eleven completion states together; source hashes and statuses are in `combined-completion-review.json`. This does not establish human learning or authenticated grades.

Final control timing was Pause 8.3 ms, Resume 8.1 ms and Cancel 15.7 ms; the largest observed 16 ms timer gap was 17.8 ms. The earlier 8.5/10.4/13.7 ms run with a 20 ms gap is preserved too. Both are UI click-to-status observations during an intentionally cancelled comparison, not worst-case guarantees. See `control-benchmark*.json`.

Automated axe/overflow and keyboard/browser checks supplement this review. Physical touch devices, screen-reader users, Firefox/WebKit, instructor visual approval and student pilot review were not run. The main bundle size warning and later release/offline work remain recorded in `TASK_STATUS.md`.
