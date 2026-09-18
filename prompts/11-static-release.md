# Task 11: Static integration and release review

## Objective
Produce a deployable artifact and evidence, without publishing it automatically.

## Context
Use AGENTS.md and the relevant portions of DEVELOPMENT_PLAN.md. For this task consult DEVELOPMENT_PLAN.md release definition; all unresolved entries in TASK_STATUS.md. Check TASK_STATUS.md for prerequisite evidence. Do not reread unrelated documents by default.

## Implement
Build production output for the approved subpath and test it using static hosting, not only the development server. Verify routes, local assets, workers, dynamic neural chunks, offline updates, and import/export. Confirm no runtime backend, API key, telemetry, external inference, or password-bearing requests are necessary.

Prepare README setup/deployment instructions, asset/dependency attributions, a course-authoring guide, benchmark report, test evidence, and known limitations. Inspect ACML visual parity across complete pages. Preserve the host repository and make any navigation integration a small reviewable change. Do not push, publish, or alter live hosting without authorization.

## Acceptance gate
Production smoke tests pass under the target path; eleven lessons have human content review; actual test/benchmark/screenshot evidence is recorded; outstanding limitations are explicit. Provide the static build location and a deployment checklist for approval.

## Boundaries and handoff
Stay within this task. Preserve prior functionality and user work. Run affected tests and the feature-milestone checks available in the repository, and inspect screenshots for visual changes. Fix regressions caused by this work. Update TASK_STATUS.md with actual evidence, not assumed outcomes. Report implemented behavior, changed files, commands/results, screenshot paths where relevant, and remaining blockers. Do not deploy. Stop after this task's verified handoff.
