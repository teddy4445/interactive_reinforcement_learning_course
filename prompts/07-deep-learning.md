# Task 07: Small DQN and advanced stability lessons

## Objective
Implement real browser-side deep RL for lessons 09-10.

## Context
Use AGENTS.md and the relevant portions of DEVELOPMENT_PLAN.md. For this task consult docs/CURRICULUM.md lessons 09-10; architecture resource bounds; DQN tests. Check TASK_STATUS.md for prerequisite evidence. Do not reread unrelated documents by default.

## Implement
First verify these lessons against the actual decks and revise proposed subtopic mapping where necessary. Add a lazy-loaded TensorFlow.js module using a benchmarked small vector-input network. Begin with a CPU worker-compatible backend and record backend/version. Implement a real optimizer, replay buffer, TD targets, target network, checkpoint semantics, and tensor cleanup.

Expose meaningful replay/target controls and run controlled ablations with explicit seed/budget settings. Show real loss and separate policy evaluation returns. Preserve failed/nonfinite runs with a useful explanation. A small labeled recorded checkpoint can support immediate demonstrations, but students must also be able to reset and train live. Do not fabricate successful learning or promise identical GPU results.

## Acceptance gate
Replay, target, gradient, mask, save/load, evaluation-isolation, and memory tests pass. Actual small in-browser training is demonstrated with measured performance. Early lessons do not load the neural bundle. Both lessons are complete and source mapping status is accurate.

## Boundaries and handoff
Stay within this task. Preserve prior functionality and user work. Run affected tests and the feature-milestone checks available in the repository, and inspect screenshots for visual changes. Fix regressions caused by this work. Update TASK_STATUS.md with actual evidence, not assumed outcomes. Report implemented behavior, changed files, commands/results, screenshot paths where relevant, and remaining blockers. Do not deploy. Stop after this task's verified handoff.
