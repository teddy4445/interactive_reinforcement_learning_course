# Task 04: Real tabular learning and worker

## Objective
Implement lessons 04-05 and the nonblocking training infrastructure.

## Context
Use AGENTS.md and the relevant portions of DEVELOPMENT_PLAN.md. For this task consult docs/CURRICULUM.md lessons 04-05; docs/ARCHITECTURE.md worker/evaluation; docs/ACCEPTANCE_TESTS.md. Check TASK_STATUS.md for prerequisite evidence. Do not reread unrelated documents by default.

## Implement
Implement fixed-policy first-visit MC prediction, TD(0), SARSA, and Q-learning. Expose algorithm capabilities so prediction is not mislabeled control. Add chunked worker training, command acknowledgments, stale-run rejection, pause/resume/cancel, bounded progress reports, and frozen-policy evaluation.

Build genuine V/Q/policy/visits/error overlays and Why this action? from selection-time trace data. Author prediction and cliff/exploration missions. Record scenario/configuration versions and independent seeds. Add real learning curves, raw/smoothed labels, and a minimal two-method comparison used by the lesson. Do not claim guaranteed cliff-policy behavior across all settings.

## Acceptance gate
All exact TD/Q/SARSA fixtures pass. Evaluation leaves model parameters unchanged. Real browser training produces recorded data, remains controllable, and yields identical tabular results independent of rendering speed. Lessons 04-05 complete end to end.

## Boundaries and handoff
Stay within this task. Preserve prior functionality and user work. Run affected tests and the feature-milestone checks available in the repository, and inspect screenshots for visual changes. Fix regressions caused by this work. Update TASK_STATUS.md with actual evidence, not assumed outcomes. Report implemented behavior, changed files, commands/results, screenshot paths where relevant, and remaining blockers. Do not deploy. Stop after this task's verified handoff.
