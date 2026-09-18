# Task-09 evidence

These files are disposable **developer QA artifacts**, not student progress, authenticated grades or evidence of human learning. No evidence file is automatically loaded into a fresh production session.

- `challenge-calibration.json`: actual production-engine training at 0, 600 and 1,200 real interactions, five seeds per method, five frozen episodes per agent. Includes coordinate and local-goal linear representations, every seed and raw outcomes. `challenge-calibration-initial.json` retains the first pre-local-goal run.
- `browser-qa-notebook.json`: actual complete Sandbox → Notebook → known-map Expedition journey and supported combined backup.
- `browser-qa-comparison.json`: four real methods × three training seeds, three equal-interaction checkpoints, five frozen episodes at each checkpoint; raw data and final resumable models.
- `browser-qa-transfer.json`: actual local-goal linear adaptation, source/target hashes, separate additional budget and frozen target evaluation.
- `browser-qa-raw.csv`: raw laboratory training/evaluation export from browser actions.
- `legacy-migration-review.json`: validated task-08 legacy import, migration to a small localStorage pointer plus IndexedDB progress, refresh and unchanged lesson/agent export.
- `visual-review.json`, `screenshots/`: final capture provenance and responsive dimensions; manual inspection scope is in `docs/LABORATORY_VISUAL_REVIEW.md`.
- Other `browser-qa-*` and screenshots are rerun earlier-lesson evidence. Prior task directories remain the legacy fixture sources; new outputs go here.

Checks so far: the initial 30-case laboratory unit suite passed after moving TensorFlow module transformation outside the per-test cold-import deadline (the separate browser cold-worker path is tested). The first 5s failure log is retained; the intermediate 15s retry log was overwritten by its subsequent passing run. Full suites passed 298 and then 300 cases as coverage grew. The first transfer-rule refinement left one test fixture using the now-rejected coordinate features: 302/303 passed; the fixture was corrected to the explicit local-goal representation, then 303/303 passed. Numerical expectations were not weakened. The initial nine browser scenarios passed; the expanded thirteen scenarios also passed before the final full regression run.

A versioned lesson-storage migration was added after review found that large old lesson comparisons still occupied localStorage. It preserves old local data until the IndexedDB transaction succeeds, upgrades the learning DB without dropping checkpoints, supports unchanged legacy backups and reports failures explicitly. Storage-probe helpers in older tests now read either supported representation. A plain coordinate-linear transfer prototype was tightened to the map-aware local-goal contract before final acceptance.

Final command results, asset identities and the exact final verification scope are recorded in `TASK_STATUS.md`. Failed or skipped checks are not counted as passes.

Not run / out of scope: fresh dependency install or audit (no dependency changes), Firefox/WebKit, physical mobile devices and screen-reader users, full browser heap or long-duration storage stress profiling, instructor/student effectiveness review, offline/service-worker release checks, deployment and hosting integration. No new course-source page mappings are asserted; prior source-verification gaps remain. No live ACML site, remote repository or hosting setting was modified.

Final verification: 305/305 unit checks; full browser run 95/96, then corrected/final affected run 32/32, followed by 3/3 responsive checks after the CSS-only map-proportion correction. All 96 distinct scenarios have passing coverage; no single final combined 96-case rerun is claimed. Both final capture scripts passed. Exact commands, failures/fixes, inspected images, benchmark results and remaining limits are in TASK_STATUS.md.
