# Foundational lesson runtime (task 03)

The pilot implements lessons 01–03 at `#/lesson/01` through `#/lesson/03`. The free manual environment from task 02 remains at `#/practice`. Lessons 04–11 show explicit unfinished pages; Sandbox, Compare, and Expedition remain unavailable. No model-free learning or training worker is implemented in this milestone.

## Module boundaries

- `src/content/foundations.js` holds the original instructional prose, prerequisites, objectives, three short missions, predictions, explicit check answers/explanations, reflection prompts, source status, and version-1 lesson scenarios.
- `src/lessons/controller.js` mounts the same six-stage player for each lesson. An explicit array of Observe, Predict, Play, Math, Experiment, and Challenge handlers renders the data; there is no executable lesson JSON or `eval`.
- `src/planning/planners.js` enumerates reachable states using `IslandEnvironment.getModel()`. Evaluation, improvement, policy iteration, and value iteration all consume that one model. The renderer and lesson code do not implement another transition/reward function.
- `src/lessons/calculations.js` defines the allowed lesson calculations and immutable experiment configurations. It records full scenario/configuration, scenario hash, representation, engine/calculation versions, exact calculation mode, policy, discount, budgets, full-precision values, sweep counts, convergence flags, and residuals. Sampling seed is explicitly null because these calculations do not sample. Manual episodes separately retain their actual seed and RNG in the environment checkpoint.
- `src/lessons/records.js` defines activity evidence, episode replay, explicit concept/numerical checks, and completion requirements. `src/persistence/progress.js` owns bounded local storage and JSON import/export. `src/ui/learning-pages.js` and `src/app/notebook-controller.js` expose records, check history, resume, and transfer.

## Predictions, completion, and resume

Observe and the stage labels can be explored freely. Play, worked results, experiments, and challenges require a saved initial prediction. Saving locks that prediction, even if incorrect. Each experiment stores its own prediction and parameter before its result can be revealed; pending experiments survive refresh. Later experiments append records rather than rewrite earlier predictions.

Six requirements must all hold: an explicit Observe concept check, a saved prediction, actual mission transitions, a computed worked example plus numerical check, a changed-parameter experiment, and the Challenge's numerical and concept checks. Stage navigation, opening a lesson, playback navigation, and reflection text cannot award these requirements on their own. The island and notebook derive completion from this evidence. No stars, learner scores, or curves are prepopulated. Prerequisites are suggestions; exploring ahead grants no completion.

Lesson 01's play mission requires actual goal termination in at most six accepted actions (shortest route two; four additional moves allowed). Lessons 02–03 require at least two accepted transitions; lesson 02 permits only the fixed right policy. Resetting practice starts a new episode and preserves a previously earned mission and other activities. The external 80-action cap is truncation, never genuine goal completion.

Every explicit check attempt is saved, including unsuccessful attempts. Numeric checks accept absolute error at most 0.01; concept choices must match. Challenge attempts refer to the experiment they checked, so a later parameter change does not reinterpret old answers. Reflections and experiment predictions are escaped plain text and never automatically interpreted or graded. Completion summaries describe covered activities, not certified mastery.

The saved record includes the last lesson, its current stage, prior predictions, action/checkpoint replay, mission evidence, results, attempts, reflection, and completion timestamp. Reload restores the last saved stage and episode. Playback timers are not persisted: leaving a stage/route cancels playback, and incomplete playback has no saved calculation result. Returning to a pending calculation permits recomputation. Hidden tabs pause animation. Animation consumes no simulation RNG.

## Numerical conventions and limits

The first reward has discount exponent zero. The no-cost fork compares `[5]` with `[0,0,0,20]`; the tie is `(5/20)^(1/3)`, approximately 0.629960525. This is an explicit reward-sequence comparison, separate from the campsite's step costs.

All planning backups are synchronous. Genuine terminal continuation is zero. At a collision, probabilities for identical next-state/reward outcomes are added by the shared environment. Full task states are enumerated; intrinsic battery, time, and inventory fields remain part of a model state when enabled. The pilot scenarios enable none of those extra variables, so a full position observation is sufficient.

A displayed residual is `max |T(V) - V|` for the actual displayed value vector: the expectation operator during fixed-policy evaluation, and the optimality operator for improvement/value iteration. It is not the change from the previous frame and is not itself the value error. For gamma below one, value error is bounded by residual divided by `1 - gamma`. Displays round values to six decimals; exports retain full precision.

Exact greedy ties choose the first maximum in the stable order up, right, down, left. Fixed-policy evaluation does not modify its input policy. Policy iteration starts with the deliberately poor left policy, evaluates it, and then improves it. Every evaluation sweep and improvement table is available as an actual computed playback frame. No values are interpolated. Counts report numerical value sweeps, independent of playback speed or skipped frames.

Defaults: tolerance `1e-8`; 500 sweeps for fixed-policy evaluation/value iteration; 2,000 evaluation sweeps per policy-iteration round; 50 policy rounds. Policy iteration requires both a stable policy and a small optimality residual. A budget stop reports non-convergence and cannot meet the convergence requirement. Generic models are limited to 512 reachable states. These synchronous planners are intended for small lessons, not large training jobs.

Gamma zero is supported. Gamma one is accepted for a genuinely finite intrinsic task or a fixed policy verified to reach absorption from every modeled state. Generic continuing optimality planning at gamma one is rejected. The lesson-03 control stays below one (0–0.99); lesson-02 gamma is fixed at 0.9. Lesson-01 finite reward sequences allow gamma 0–1. Lesson-02 slip is 0–0.8. Experiments must change the worked parameter by at least 0.05.

## Storage and import boundaries

Progress uses `rl-island:progress:v1`, schema 1, curriculum `foundations-v1`. Display settings and environment checkpoints keep their existing separate keys. Only these three guided lessons are valid progress IDs.

Limits: 512 KiB per JSON file/store, 12 experiments and 60 check attempts per lesson, 80 current-episode actions, 300 characters per prediction/check answer, and 2,000 characters per reflection. No record is silently evicted to make room; limits are reported in the lesson UI. Export before exceeding a limit. Longer histories and richer experiment stores are deferred.

Imports check bytes before parsing, reject duplicate or unsupported keys/versions and prototype-related keys, validate bounded fields, replay actions through the shared seeded engine, recompute numerical evidence, and derive completion again. The checksum detects accidental corruption only; these are editable, self-reported artifacts, never authenticated grades. A validated preview requires an explicit Replace progress action; Cancel and Escape preserve the existing record. Invalid files do not replace it.

Unavailable/quota-limited storage leaves the current tab usable in memory with a visible warning and export. An unreadable stored record is preserved while new work remains in memory; only explicit validated import allows replacement. Unsupported versions are not silently migrated. There are no accounts or automatic cross-device synchronization.

## Calibration and evidence

`node scripts/calibrate-foundations.mjs` writes `evidence/task-03/challenge-calibration.json`: actual two-, six-, and seven-action routes; fixed-policy calculations at slips 0, 0.05, 0.2, 0.4, and 0.8; and planner comparisons at gamma 0, 0.05, 0.5, 0.8, and 0.99. These are deterministic developer calibration runs, not empirical student performance. Human pilot/instructor calibration remains outstanding.

Unit tests compare against independently hand-solved values and verify terminal masking, merged expectations, synchronous updates, policy preservation, gamma limits, tie behavior, budget status, actual frames, and record integrity. Browser tests actually complete all three lessons, make an unsuccessful check attempt before correcting it, refresh/resume, export/import, check keyboard/touch-emulated play and cancellation, and confirm eight later lessons remain unfinished. See `TASK_STATUS.md` for actual command outcomes, screenshot inspections, source limitations, and unrun checks.
