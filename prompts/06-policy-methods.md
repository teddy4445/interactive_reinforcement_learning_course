# Task 06: Policy gradients and actor-critic

## Objective
Implement a mathematically transparent lesson 08.

## Context
Use AGENTS.md and the relevant portions of DEVELOPMENT_PLAN.md. For this task consult docs/CURRICULUM.md lesson 08; policy-gradient acceptance requirements. Check TASK_STATUS.md for prerequisite evidence. Do not reread unrelated documents by default.

## Implement
Implement numerically stable softmax policies, episodic REINFORCE, an optional value baseline, and a one-step actor-critic using tabular or linear parameters. Declare the objective, discount convention, terminal behavior, and frozen evaluation policy. Use finite-difference checks for small gradient fixtures.

Add probability arrows/bars, actor versus critic inspection, actual advantage/error diagnostics, and a stepwise explanation of policy changes. Record seeds and show variability. Do not call an argmax Q policy a policy-gradient implementation. Retain a small CPU-friendly setup; neural actor-critic can be an extension rather than a dependency.

## Acceptance gate
Probabilities normalize, gradient/update tests pass, and evaluation does not train. The lesson traces genuine parameter updates. The student can complete the prediction, experiment, and challenge without relying on a fake animation.

## Boundaries and handoff
Stay within this task. Preserve prior functionality and user work. Run affected tests and the feature-milestone checks available in the repository, and inspect screenshots for visual changes. Fix regressions caused by this work. Update TASK_STATUS.md with actual evidence, not assumed outcomes. Report implemented behavior, changed files, commands/results, screenshot paths where relevant, and remaining blockers. Do not deploy. Stop after this task's verified handoff.
