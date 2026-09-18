# RL Island project

Updated 18 September 2026. The eleven-lesson application is implemented, and the production website is in `dist/` with a packaged archive at `release/rl-island-static.zip`. Read [README.md](README.md) for exact install/build/preview commands, [RELEASE_REPORT.md](RELEASE_REPORT.md) for the executed technical verdict and limitations, and [TASK_STATUS.md](TASK_STATUS.md) for the complete evidence ledger. Human instructor/content approval remains outstanding. Nothing has been pushed or published.

## Original development kickoff — historical

The project began as a specification bundle on 17 September 2026. The instructions below are retained as development history, not a request to restart or a description of the current implementation.

### Original start
1. Create a repository for `rl-island`, or a feature branch in the existing ACML repository. Copy this bundle into the project root. Merge any existing AGENTS.md rather than overwriting it.
2. Open that repository in Codex. Give it the kickoff prompt below.
3. Review the working shell and screenshots after task 01. Continue with the numbered task files, one at a time. Task 03 delivers a usable first-three-lesson slice; task 04 delivers the tabular learning beta.
4. Keep the package in the repository as implementation guidance. `TASK_STATUS.md` begins with every software task unstarted.

### Original kickoff prompt
```text
Read AGENTS.md and DEVELOPMENT_PLAN.md. Implement
prompts/00-reference-audit.md, then prompts/01-brand-shell.md.
Use the verified reference files in this repository; refresh the public
ACML reference when network access is available. Do not replace the task
with another generic plan: produce the working frontend shell, tests,
and screenshots required by those two tasks. Record any unavailable
reference or unrun check explicitly. Do not invent slide-page citations.
Stop after task 01 and report what works, checks run, screenshot paths,
and unresolved issues. Do not deploy or modify the live ACML site.
```

For subsequent tasks: `Implement prompts/02-environment-engine.md. Follow its scope and acceptance gate; update TASK_STATUS.md with evidence.` Change the filename for each subsequent task.

## Main references
- DEVELOPMENT_PLAN.md: scope, architecture, milestones, working method, and release gates.
- docs/ACML_DESIGN.md: exact colors and look-and-feel requirements.
- docs/CURRICULUM.md and reference/course-manifest.json: course order and proposed interactions.
- docs/ARCHITECTURE.md: engine, worker, persistence, and evaluation contracts.
- docs/ACCEPTANCE_TESTS.md: scientific and browser checks.
- docs/SOURCE_AUDIT.md: evidence, source locations, and remaining verification gaps.

During the initial bundle preparation, PDF contents were unavailable. All eleven public PDFs have since been retrieved and their hashes reverified; detailed activity-to-slide approval is still pending. The application bundles attributed local fonts and the licensed ACML logo. Lecture PDFs and credentials are not shipped in dist or the release archive. See the source and asset audits for current evidence.
