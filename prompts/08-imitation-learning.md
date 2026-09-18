# Task 08: Demonstrations and imitation

## Objective
Complete lesson 11 with genuine learning from demonstrations.

## Context
Use AGENTS.md and the relevant portions of DEVELOPMENT_PLAN.md. For this task consult docs/CURRICULUM.md lesson 11 and imitation acceptance tests. Check TASK_STATUS.md for prerequisite evidence. Do not reread unrelated documents by default.

## Implement
Add recording of manually demonstrated state-action trajectories, dataset review, save/import, and behavior cloning with a representation-compatible policy. Separate supervised fitting metrics from reward-based evaluation. Compare scratch RL and imitation-initialized policy learning under explicit budgets; define weight-transfer compatibility rather than forcing unrelated models to share weights.

Provide at least one training and separate evaluation scenario/trajectory split. Show what happens when the cloned policy visits states absent from the demonstrations. Author all six lesson stages and retain accessible trace views. Multi-agent behavior is not part of this task.

## Acceptance gate
Recorded pairs align correctly; the model genuinely fits the supervised fixture; evaluation data do not enter training. Export/import retains schema compatibility. Lesson 11 completes the eleven-lesson sequence without placeholder behavior.

## Boundaries and handoff
Stay within this task. Preserve prior functionality and user work. Run affected tests and the feature-milestone checks available in the repository, and inspect screenshots for visual changes. Fix regressions caused by this work. Update TASK_STATUS.md with actual evidence, not assumed outcomes. Report implemented behavior, changed files, commands/results, screenshot paths where relevant, and remaining blockers. Do not deploy. Stop after this task's verified handoff.
