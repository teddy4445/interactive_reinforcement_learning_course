# RL Island repository guidance

Build a browser-only reinforcement-learning teaching game for Prof. Teddy Lazebnik. Use the ACML visual identity and the course's verified eleven-lesson order.

## Non-negotiable boundaries
- Application code: HTML, CSS, and vanilla JavaScript ES modules with JSDoc. Vite and Node are development/build tools only. Production is static files. No backend, API keys, authentication service, telemetry, remote inference, or database service.
- Reuse one tested environment engine across lessons, sandbox, comparison, and evaluation. Separate simulation, algorithms, rendering, content, and persistence. Canvas must not be the only accessible representation.
- Real learning and real metrics only. Never fabricate a learning curve, score, successful training run, convergence claim, or explanation. Explicitly label supplied checkpoints/replays as recorded demonstrations.
- Keep environment and agent RNGs seeded and separate. Rendering must not affect simulation randomness. Distinguish termination from external truncation, and training from frozen-policy evaluation.
- Match docs/ACML_DESIGN.md. Brand blue is #2563EB; brand rose is #F43F5E. Use Inter with fallbacks, light content surfaces, pill navigation, and restrained motion. No unrelated gaming theme.
- Never commit course passwords or fetch a password-bearing course URL at application runtime. Do not copy the complete teaching catalog into the public app.
- Local student exports are self-reported learning artifacts, not authenticated grades. No promise of secret client-side tests or cross-device sync.
- Preserve existing work and the ACML host site. Build the sub-application without broad refactors. Publishing and changing hosting settings require separate approval.

## Where to look
Use DEVELOPMENT_PLAN.md for milestones, docs/ARCHITECTURE.md for core contracts, docs/CURRICULUM.md for lessons, and docs/ACCEPTANCE_TESTS.md for checks. Read the task-relevant files; do not load every document for a small edit.

## Verification
The local tests use disposable fixtures and have no production access. Run relevant tests, fix regressions from the task, and rerun them without asking at every step. On feature milestones, run the available lint, type-check, unit tests, build, and affected browser tests. Add screenshots for visual changes. Never report a skipped command as passing.

Pin compatible dependencies in the lockfile. Keep unknown slide mappings marked unverified. Update TASK_STATUS.md only with actual evidence. Report remaining blockers plainly, and stay within the requested task unless resolving a necessary dependency.
