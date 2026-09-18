# Task-05 visual inspection

These are screenshots of actual disposable developer QA runs, with predictions and reflections labeled accordingly. They do not represent student learning outcomes. Detailed captures were generated against the production build after full unit/lint/type/build verification.

Inspected through the local image viewer:

- `screenshots/feature-weight-detail.png`: six named normalized features, actual weights and contributions, full inventory state, and explicit informative/aliased vectors for the same position.
- `screenshots/linear-update-detail.png`: inventory-bearing state keys on the map, actual fixed-policy action probabilities, numerical target/error and complete weight update. The non-Canvas inspector duplicates the relevant numbers.
- `screenshots/dyna-real-planning-detail.png`: one real backup and five expanded simulated calculations, including learned-pair keys and independent planning draws. Planning is never labeled new real experience.
- `screenshots/learned-model-detail.png`: observed model tuples, rewards, next states, terminal flag and real-only visit counts. The table has keyboard scrolling for the remaining entries.
- `screenshots/table-calculator-detail.png`: editable cardinalities; default 12 state combinations, 48 Q entries and 384 float64 bytes, explicitly an upper bound.
- `screenshots/dyna-comparison-mobile-expanded.png`: actual equal-budget checkpoint means and raw runs, with all labels contained in the card. Wide numerical tables scroll horizontally on narrow screens; the raw region supports keyboard focus. No page-level overflow was detected.
- `screenshots/lesson-06-320.png`: stacked stage controls, experiment controls, actual traces, feature inspector, calculator and separate training/evaluation charts. This full-page image is tall; the numerical detail captures above provide readable close views.
- `screenshots/lesson-07-complete-desktop.png`: six-stage navigation, measured final tie and earlier-budget difference, evidence checklist, challenge, saved ungraded QA reflection and completion summary.

The first browser pass found a scrollable inspector without keyboard focus and narrow-screen table overflow. Focusable regions, contained tables and wrapping fixed these; the next six affected browser tests passed. A select received an explicit accessible label, and the speed-test harness was corrected to reload after clearing its disposable local record. See logs for the failed run; it is not counted as passing.

The review script also operated Step, Pause and Cancel with keyboard Space at 20 planning backups per real step. The expanded mobile comparison had zero axe violations in the exercised WCAG tags. `visual-review.json` contains actual per-command timing measurements, including acknowledgments above the approximate 100 ms target. This does not claim complete assistive-technology or hardware coverage.

Final regression follow-up: the same production build exercised all 59 browser scenarios (57 passed; two test-harness failures). After fixing mocked-clock setup/navigation ordering and the renamed reset message expectation, five affected scenarios passed three repetitions each (15/15). Numerical checks stayed 188/188. No application source changed after the inspected production build.
