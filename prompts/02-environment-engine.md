# Task 02: Shared island engine and trace

## Objective
Create the one simulation core used by all future lessons and algorithms.

## Context
Use AGENTS.md and the relevant portions of DEVELOPMENT_PLAN.md. For this task consult docs/ARCHITECTURE.md environment, RNG, and trace sections; docs/ACCEPTANCE_TESTS.md sections 1-2. Check TASK_STATUS.md for prerequisite evidence. Do not reread unrelated documents by default.

## Implement
Implement a versioned map schema, deterministic RNG streams, state/observation separation, reset/step/model APIs, walls, goals, rewards, stochastic slip, and terminal/truncation semantics. Keep early scenarios position-only; include additional state features explicitly when enabled. Provide independent model and sampled-transition validation.

Create the Canvas renderer with DOM state inspector, keyboard/touch manual control, hit testing, one-step transition trace, and separate episode/learning reset controls. Use the same model/state for rendering and inspection. Rendering speed must not alter transitions. Include a small deterministic map and a stochastic slip map. Do not implement every learning algorithm in this task.

## Acceptance gate
Environment and RNG tests pass, including collisions, merged probabilities, terminal rewards, consumed collectibles when enabled, and serialization. Keyboard control and accessible trace work. Episode replay is deterministic.

## Boundaries and handoff
Stay within this task. Preserve prior functionality and user work. Run affected tests and the feature-milestone checks available in the repository, and inspect screenshots for visual changes. Fix regressions caused by this work. Update TASK_STATUS.md with actual evidence, not assumed outcomes. Report implemented behavior, changed files, commands/results, screenshot paths where relevant, and remaining blockers. Do not deploy. Stop after this task's verified handoff.
