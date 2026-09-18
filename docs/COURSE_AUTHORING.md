# Course authoring guide

This is a static vanilla-JavaScript application. Keep the shared environment, numerical learners and persistence separate from lesson wording. The eleven catalog entries and order remain in `src/content/curriculum.js`; source provenance and unresolved approval fields live in `reference/course-manifest.json`. Do not invent slide pages or mark an instructor approval yourself.

## Editing a lesson

1. Edit the relevant content module: `foundations.js` (01–03), `model-free.js` (04–05), `approximation-planning.js` (06–07), `policy-methods.js` (08), `deep-learning.js` (09–10), or `imitation.js` (11). Update `docs/CURRICULUM.md` with the objective, scenario, checks, experiment and challenge.
2. Preserve Observe → Predict → Play → Reveal the mathematics → Experiment → Challenge. Save predictions before exposing results. Use plain math plus actual numerical trace tables. Reflections are stored text, never automatically interpreted or graded.
3. Define accepted activities and concept/numerical checks in `src/lessons/records.js`, `learning-records.js`, or `src/imitation/records.js` as appropriate. Stage navigation must not earn completion. Check negative cases: skipping ahead, a wrong answer, a failed/cancelled experiment, and a reset.
4. Configure a bounded scenario and algorithm in `src/training/config.js` / `src/content/scenarios.js`. Reuse `IslandEnvironment`; never create a second transition implementation in the UI. Include every enabled Markov-state variable, and explicitly label reduced observations. A genuine terminal state masks bootstrap; an external cap does not invent terminal reward or zero continuation.
5. Keep scientific data immutable per experiment: scenario/config version, independent RNG streams, budget, training seed, evaluation seeds, parameters and raw results. A meaningful edit creates a new run. Episode reset retains learned parameters; learning reset requires confirmation. Never generate decorative learning curves or infer unseen updates in the UI.
6. For prediction, specify the evaluated policy. For control, expose the actual action-selection trace. Freeze learning during evaluation and state the evaluation rule. Compare equal real interactions when making sample-efficiency claims; report Dyna planning and neural optimizer updates separately.
7. Add independent hand-solvable numerical fixtures, persistence compatibility cases, and a complete browser journey. Recalibrate changed thresholds using recorded seed suites (`scripts/calibrate-*.mjs`); retain every requested run, including failures. Neural/imitation challenges use measured comparisons and concepts, not a predetermined winner. Calibration is developer QA, not evidence of student learning.

## Source and review records

Use existing verified PDF hashes and physical-page observations in `docs/PDF_REFERENCE_AUDIT.md`, `DEEP_REFERENCE_AUDIT.md` and `IMITATION_REFERENCE_AUDIT.md`. A retrieved PDF, a text search, visual inspection, approved activity mapping, and instructor approval are different statuses. Preserve the lesson-02 catalog/deck discrepancy until the instructor resolves it. Lessons 10 and 11 explicitly state their narrower implemented scope. Link public PDFs; do not ship third-party decks or course credentials.

## Compatibility and verification

Do not silently change serialized schemas, action order or representation meaning. Update validators and add migration fixtures before changing saves. Imports accept bounded supported JSON only. Escape student text; never execute code or load a URL supplied by an import. Preserve old saves and unrelated host storage.

Run `npm run lint`, `npm run typecheck`, `npm run test:unit -- --maxWorkers=1`, `npm run build`, `npm run test:e2e`, and `npm run verify:release`. Inspect desktop/mobile screenshots, keyboard focus, Canvas alternatives and actual math. Test offline readiness when adding any lazy asset. Record executed checks, build hash, failures and unavailable reviews in TASK_STATUS.md. Run the performance benchmark when changing training, rendering or persistence. Rebuild/repackage only after the final verified code; deployment is a separate owner action.
