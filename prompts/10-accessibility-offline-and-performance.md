# Task 10: Lecture mode and hardening

## Objective
Make the full application usable in class and resilient on ordinary hardware.

## Context
Use AGENTS.md and the relevant portions of DEVELOPMENT_PLAN.md. For this task consult docs/ACML_DESIGN.md acceptance; docs/ACCEPTANCE_TESTS.md sections 5-8. Check TASK_STATUS.md for prerequisite evidence. Do not reread unrelated documents by default.

## Implement
Implement lecture-mode presentation controls and larger text without changing algorithm semantics. Complete keyboard/touch interaction, screen-reader alternatives, focus management, reduced motion, contrast, responsive layout, and readable math. Test with actual browser zoom and narrow screens.

Add scoped offline caching with explicit readiness/update states and preservation of saved student data. Bundle all required runtime assets. Validate quota/unavailable-storage fallbacks, migration, bounded imports, and malicious note text. Benchmark control/cancel responsiveness and memory on a declared reference device; adjust chunk sizes and limits using measurements.

## Acceptance gate
Manual accessibility journey and automated scans are recorded. Offline reload works after caching without controlling the ACML root. Performance targets are measured, failures are visible, and repeated training/reset does not cause unbounded memory growth.

## Boundaries and handoff
Stay within this task. Preserve prior functionality and user work. Run affected tests and the feature-milestone checks available in the repository, and inspect screenshots for visual changes. Fix regressions caused by this work. Update TASK_STATUS.md with actual evidence, not assumed outcomes. Report implemented behavior, changed files, commands/results, screenshot paths where relevant, and remaining blockers. Do not deploy. Stop after this task's verified handoff.
