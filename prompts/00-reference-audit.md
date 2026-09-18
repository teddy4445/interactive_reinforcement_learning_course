# Task 00: Reference audit and foundation

## Objective
Establish the repository and trustworthy references without implementing all game features.

## Context
Use AGENTS.md and the relevant portions of DEVELOPMENT_PLAN.md. For this task consult docs/SOURCE_AUDIT.md, reference/course-manifest.json, reference/acml-tokens.css. Check TASK_STATUS.md for prerequisite evidence. Do not reread unrelated documents by default.

## Implement
Inspect existing files and preserve existing work. Verify the public ACML source and, where the browser permits, capture reference screenshots. Use the supplied exact tokens as the documented baseline. Inspect the current course PDFs and enrich page mappings only when their contents are actually available. Do not copy course credentials or the complete catalog into the app. Record unavailable references explicitly.

Create a vanilla-JavaScript Vite project with minimal index/main/CSS, a lockfile, lint, JSDoc type-check, unit-test, browser-test, build, and preview scripts. Choose compatible current versions; do not introduce React, a backend, or neural dependencies. Define the intended subpath without touching hosting configuration. Update the source audit and task ledger.

## Acceptance gate
Minimal static build, unit smoke test, and browser smoke test actually run. Package scripts are documented. No protected course URL or credentials are committed. Report unverified PDF mappings. No production deployment.

## Boundaries and handoff
Stay within this task. Preserve prior functionality and user work. Run affected tests and the feature-milestone checks available in the repository, and inspect screenshots for visual changes. Fix regressions caused by this work. Update TASK_STATUS.md with actual evidence, not assumed outcomes. Report implemented behavior, changed files, commands/results, screenshot paths where relevant, and remaining blockers. Do not deploy. Stop after this task's verified handoff.
