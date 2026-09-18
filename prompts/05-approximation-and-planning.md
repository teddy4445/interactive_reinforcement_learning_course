# Task 05: Features, approximation, and Dyna planning

## Objective
Implement lessons 06-07 while preserving tabular correctness.

## Context
Use AGENTS.md and the relevant portions of DEVELOPMENT_PLAN.md. For this task consult docs/CURRICULUM.md lessons 06-07; architecture feature/model contracts. Check TASK_STATUS.md for prerequisite evidence. Do not reread unrelated documents by default.

## Implement
Implement explicit feature encoders, linear value/action-value approximation for the specified prediction/control tasks, feature/weight inspectors, state-count calculations, and compatible algorithm controls. Demonstrate an informative versus aliased representation without accidentally hiding required state in the main task.

Implement a learned model and Dyna-Q on a deterministic fixture first. Separate real environment interactions from planning updates in all results. Add the planning-budget experiment and optional explicitly labeled change-point demonstration. Neural methods are not needed in this task. Preserve prior saves through a tested schema migration if required.

## Acceptance gate
Feature dimensions, weight updates, and Dyna model/planning behavior pass tests. Budgets distinguish real and simulated samples. Lessons 06-07 work with real metrics, and existing lessons/regression checks still pass.

## Boundaries and handoff
Stay within this task. Preserve prior functionality and user work. Run affected tests and the feature-milestone checks available in the repository, and inspect screenshots for visual changes. Fix regressions caused by this work. Update TASK_STATUS.md with actual evidence, not assumed outcomes. Report implemented behavior, changed files, commands/results, screenshot paths where relevant, and remaining blockers. Do not deploy. Stop after this task's verified handoff.
