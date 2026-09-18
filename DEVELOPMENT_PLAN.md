# RL Island: development plan for Codex
Prepared for Prof. Teddy Lazebnik | 17 September 2026

## 1. Product and implementation decision

Build one polished, top-down 2D island game inside a lightweight educational website. The same robot, environment engine, and inspection tools recur throughout eleven course lessons. Students begin by controlling the robot, then learn to specify its problem, predict returns, learn policies, compare algorithms, and evaluate a complete solution.

The application must run entirely in the browser. Development tools may use Node, but the deployed output is HTML, CSS, JavaScript, JSON, and static assets. No backend, accounts, external AI service, or paid API is part of the product. Prefer a separate sub-application at `/rl-island/` over changes to the ACML homepage. Hosting path is a proposed deployment decision, not an existing endpoint.

The immediate objective is a usable first-three-lesson implementation, not an attractive mockup of the entire course. Extend that working slice incrementally. Full course completion includes the later policy, deep-learning, and imitation lessons; they are not silently removed from scope.

## 2. What was verified

ACML's published source explicitly configures primary blue `#2563EB`, secondary rose `#F43F5E`, an 8 px button radius, and a 20 px `xl` radius. Its homepage uses Inter, light-gray content backgrounds, white cards, pill navigation, a dark gradient hero, and restrained blue/purple display accents. These observations come from source inspection, not a rendered visual comparison. [S1-S3]

The supplied course page is JavaScript-driven. Its implementation and course catalog were inspected. The first matching current entry lists eleven lessons, with nonconsecutive PDF filenames. The repository also contains an older duplicate course code; the plan follows the first entry selected by the page, rather than mixing records. No password is reproduced in this package. [S4-S5]

PDF contents could not be retrieved in this environment. Therefore lesson titles and filenames are catalog-verified, while detailed slide-page alignment and the proposed activity mappings require the initial content audit. No calendar-week schedule is asserted. Source locations and verification states are in docs/SOURCE_AUDIT.md.

## 3. Visual specification

RL Island should look like an ACML educational tool with an island inside it, not a separate fantasy-game brand.

| Element | Implementation instruction |
|---|---|
| Primary actions and selected controls | ACML blue `#2563EB` |
| Secondary accents | ACML rose `#F43F5E`; use a darker text variant where contrast requires it |
| Application background | Light gray `#F9FAFB` with white content cards |
| Primary and secondary text | Dark gray `#111827`, muted gray `#4B5563` |
| Typography | Inter; system sans-serif fallback; readable mathematical notation |
| Navigation | Pill-shaped tabs; ACML mark and RL Island title; compact mobile menu |
| Panels | White, soft shadows, subtle borders, 20 px outer card radius; 8 px controls |
| Landing page | One dark navy/blue/rose gradient hero; optional restrained blue/purple heading accent |
| Lesson workspace | Light surfaces, minimal decorative motion, maximum room for the game and inspector |
| World artwork | Consistent vector-style robot, tiles, trees, rocks, goals, and hazards; no emoji as production sprites |

Natural terrain colors are permitted inside the world. They must not replace the blue/rose interface identity. Value overlays need labeled legends, numbers, or patterns; red/green alone is insufficient. Do not copy the host site's entire stylesheet or CDN scripts into the application. Recreate the relevant tokens and component treatments locally.

Before gameplay implementation, build a development-only design-system view and capture the landing, island dashboard, and empty lesson workspace at desktop and mobile widths. Compare those screenshots with an actual browser rendering of ACML when available. Source matching does not by itself establish pixel-level visual parity.

## 4. Pages and navigation

Use hash routes to keep navigation compatible with simple static hosting. The top-level student navigation is Island, Sandbox, Compare, and Notebook; Settings and Lecture mode are secondary controls.

| Route | Responsibility and required behavior |
|---|---|
| `#/welcome` | Brief purpose, island preview, Start/Continue, import progress, local-storage notice |
| `#/island` | Illustrated course map plus an accessible list, eleven lesson nodes, progress, next suggested activity |
| `#/lesson/:lessonId` | Reusable lesson player with six stages, live game, controls, formula/trace inspector, results |
| `#/sandbox` | Scenario editor, reward/state settings, compatible algorithm selection, bounded training, save/load |
| `#/compare` | Compare two to four algorithms with a shared task, documented budgets, repeated runs, real metrics |
| `#/notebook` | Predictions, observations, saved experiments, explanation history, JSON/CSV export and import |
| `#/expedition` | Integrated project-style challenge with an explicit evaluation protocol and evidence export |
| `#/settings` | Motion, sound, font scale, storage, reset, export, and lecture mode |

A separate professor dashboard or account system is unnecessary. Lecture mode is a presentation variant of the same pages, with larger controls, hidden student notes, fixed-seed presets, and projection-friendly text.

### Lesson workspace

On a large screen, use three resizable or responsive areas: compact lesson instructions, the dominant world panel, and a right-side inspector. A bottom strip contains the episode timeline and learning curves. On smaller screens, stack the world first and expose instructions, controls, and results in accessible tabs. Do not shrink all three columns into unreadable panels.

Persistent controls: Step, Episode, Train batch, Pause, Reset episode, Reset learning, Evaluate, and Why this action? Resetting the robot's position must not silently reset its Q-table. Training and evaluation must always be visibly different modes.

The inspector progressively adds rewards, state IDs, transition probabilities, visit counts, V, Q, policy arrows, TD error, action probabilities, and neural diagnostics. All displayed calculations must come from the same trace that performed the update.

## 5. Course progression

Keep the original eleven lesson numbers as the primary organizing structure. Island names are memorable labels, not a substitute syllabus. A lesson may contain several short missions.

| Course lesson | Proposed island region | Main activity | Source filename |
|---|---|---|---|
| 1. Introduction to RL | Base Camp | Manual movement; identify agent, state, action, reward, and return | `1.pdf` |
| 2. Tabular MDP planning and policy evaluation | MDP Beach | Edit transition probabilities; inspect a fixed policy and its values | `2.pdf` |
| 3. MDP continuation | Value Forest | Animate policy improvement and value iteration | `3.pdf` |
| 4. Model-free prediction | Experience Jungle | Compare Monte Carlo and TD updates from experience | `5.pdf` |
| 5. Model-free control | Control Ridge | Learn with SARSA and Q-learning; investigate exploration | `6.pdf` |
| 6. Function approximation | Feature Highlands | Compare feature representations and a table against linear approximation | `7.pdf` |
| 7. Planning and models | Modeler's Marsh | Compare real-experience learning with Dyna-style planning | `8.pdf` |
| 8. Policy gradients and actor-critics | Policy Summit | Direct action probabilities, REINFORCE, actor/critic updates | `9.pdf` |
| 9. Deep RL, part 1 | Deep Mountains I | Small neural Q-function with visible training diagnostics | `10.pdf` |
| 10. Deep RL, part 2 | Deep Mountains II | Replay/target-network ablations and stability evaluation | `14.pdf` |
| 11. Mimic learning | Demonstration Village | Record demonstrations and compare imitation with learning from scratch | `11.pdf` |

The listed titles/filenames are verified; the game activities are the proposed instructional mapping. Deep-RL subtopics must be checked against the actual decks before content approval. [S5]

Exploration Caves, Stability Volcano, and Reward Workshop are supporting missions inside appropriate lessons. Multi-agent Village is a later optional extension, not an invented twelfth required lecture. Do not hardcode eight calendar weeks. Support optional instructor-specified release dates separately from lesson order.

### Reusable six-stage lesson sequence

Observe -> Predict -> Play -> Reveal the mathematics -> Experiment -> Challenge.

A typical lesson should take approximately 15-30 minutes, with optional deeper experiments. This is a design target to test with students, not a measured completion time. Predictions are recorded before results. A short explanation asks students to connect an observed behavior with a concept. Free text is stored for reflection; it is not falsely presented as automatically understood or graded.

### Progress rules

Track `visited`, `discovered`, `understood`, and `mastered` independently from navigation. Discovery requires the instructional interaction; understanding requires specified concept checks; mastery requires a calibrated challenge plus a concept explanation/check. Clicking Next is not mastery.

Report transparent counts such as `3 of 5 prediction checks completed` rather than arbitrary precision in knowledge percentages. Course mode suggests prerequisites, while free exploration permits revisiting or skipping ahead without granting completion. Progress is device-local and exportable. It is not an authenticated assessment record.

## 6. Technical architecture

Use vanilla JavaScript ES modules, semantic HTML, CSS custom properties, Canvas 2D for the world, and DOM controls for the interface. Vite handles local development and static builds. Use Chart.js for plots and KaTeX for mathematical notation. Choose compatible versions at task 00 and commit the lockfile. Do not use a framework or game engine unless a specific limitation justifies changing the plan. [S6]

Use Vitest for deterministic unit tests, Playwright for browser flows, an accessibility checker for automated checks, and JSDoc-based type checking. Later deep-RL tasks may lazy-load TensorFlow.js for a small vector-input network; do not include it in the initial lesson bundle. Benchmark the CPU worker route before offering acceleration. [S11]

Separate seven modules: environment/model, agent algorithms, training worker, renderer, lesson runtime, evaluation, and persistence. One owner controls the live simulation; all views consume snapshots. Do not duplicate the environment inside each lesson.

A Web Worker runs batch training and sends bounded progress updates to the interface. Use short chunks so it can process pause/cancel requests; a worker with one endless synchronous loop still cannot process its own messages promptly. Render independently from training speed. [S7]

Use localStorage for small settings/progress records and IndexedDB for larger models, experiment histories, and trajectories. Include schema versions, migration tests, explicit storage errors, and JSON export/import. No reliance on browser storage as a permanent backup. [S8-S9]

## 7. Scientific correctness requirements

These are release requirements, not optional polish:

- MC and TD prediction must evaluate a specified policy; they are not advertised as standalone control algorithms. Planning methods receive model access explicitly; model-free agents must not read hidden transition tables.
- The agent state includes every modeled variable required for the Markov property. Position alone is not enough when battery, collected items, or time changes future outcomes. Observation restrictions are introduced explicitly rather than by accident.
- Distinguish a genuine terminal state from an external collection timeout. Use the corresponding bootstrap rule. Finite-horizon tasks include remaining time. [S10]
- Reward receipt, step penalties, collision penalties, collectible consumption, and terminal rewards are specified once and unit-tested. Re-entering a treasure tile cannot repeatedly award a one-time treasure unless the lesson deliberately defines that reward loop.
- Episode resets, learning resets, and new experiment configurations are separate actions. Edits during training create a new version/run rather than silently changing the experiment being plotted.
- Evaluation freezes learning and states its action-selection policy. Exploration is disabled for greedy tabular evaluation, but an intentionally stochastic learned policy can remain stochastic when clearly declared.
- Compare return and success across multiple seeds. Report environment interactions, updates, episodes, and wall time separately. Shared seed lists do not imply identical trajectories under different policies.
- An unvisited-map test is not valid for a coordinate-only Q-table without adaptation. Distinguish same-map stochastic evaluation, per-map retraining, and zero-shot transfer with a representation that actually encodes the new task.
- Cumulative expected bandit regret is nondecreasing. A declining plot must be labeled per-step or average regret, not cumulative regret.
- DQN results come from a real optimizer, replay buffer, and target network. Unstable or inconclusive runs remain visible. Recorded demonstrations are labeled; no animated fake learning.

For the tiny toy fixtures, mathematical outputs should be tested independently of animation. docs/ACCEPTANCE_TESTS.md provides exact numerical checks.

## 8. Development milestones

Use the corresponding prompt file for each task. The dependency is normally the preceding task. Changes to lesson sequencing may be needed after the content audit; changes to the learning engine require regression tests.

| Task | Deliverable | Acceptance gate |
|---|---|---|
| 00 | Reference audit, source registry, package/build/test foundation | Course selection and verification gaps recorded; static build and smoke test run |
| 01 | ACML design system, navigation, welcome/map/workspace shells | Actual desktop/mobile screenshots; visual review against ACML |
| 02 | Deterministic island engine, renderer, manual play, step trace | Seeded transition, collision, reward, terminal, and reset tests |
| 03 | Generic lesson runtime, first three lessons, progress | Start -> lesson -> challenge -> refresh -> resume works; DP numerical tests pass |
| 04 | MC, TD, SARSA, Q-learning, lessons 4-5, training worker | Actual learning, responsive pause/cancel, algorithm fixtures, evaluation isolation |
| 05 | Linear approximation and planning, lessons 6-7 | Feature tests; real versus simulated interactions separated; Dyna update checks |
| 06 | Policy methods and actor-critic, lesson 8 | Normalized action probabilities and gradient/update tests |
| 07 | Real small-scale DQN, lessons 9-10 | Replay/target mechanics, finite losses, bounded memory, labeled ablations |
| 08 | Demonstration capture and imitation, lesson 11 | Demonstrations train the policy; unseen test episodes separated from training |
| 09 | Complete sandbox, comparisons, notebook, final expedition | Export/reimport reproducibility; compatibility guards; evaluation protocol enforced |
| 10 | Lecture mode, accessibility, offline use, performance hardening | Keyboard flow, responsive layouts, offline reload, cancellation benchmarks |
| 11 | Static-host integration and release evidence | Built artifact works under `/rl-island/`; no backend/runtime API dependency; host site preserved |

**Review gates:** approve the visual shell after 01; test the learning experience with students after 03/04; review algorithm semantics before 07; review full course content and release evidence before 11. Advanced methods cannot be replaced by unimplemented buttons in a release labeled full-course.

## 9. First playable slice

The first student pilot should include the ACML shell, a small island map, manual control, an MDP transition inspector, return calculations, fixed-policy evaluation, policy/value iteration, three complete lesson flows, basic notebook capture, and local progress.

It does not need 3D, multiplayer, a neural network, a tournament, an account system, or a full map editor. Those features must not delay a usable foundational learning experience. The next milestone introduces real tabular learning, rather than expanding decorations.

## 10. Evaluation and performance

Learning challenges use small curated maps and documented seed suites. Start with five training seeds and a separate evaluation seed suite; calibrate thresholds from actual runs, and distinguish variation between independently trained agents from episode variation within one agent. Display raw observations and the definition of any interval or smoothing. Do not select only favorable runs.

The project defines responsiveness targets, not promises of instant training: controls acknowledge input within roughly 100 ms, cancellation finishes within 250 ms in the agreed benchmark, and training progress is reported at a bounded rate, initially no more than ten updates per second. Record hardware/browser with results. Adjust batch sizes and network size based on measurements, never by fabricating speed.

Default maps should be small. Bound scenario dimensions, state counts, replay length, chart history, and import size. Requesting an oversized experiment should give a clear warning and safe alternatives. Physics and animation must not share a timestep.

The final expedition provides three explicitly separated tracks: a tabular task evaluated on new stochastic rollouts of its known map; an optional adaptation task with a fresh training budget on each new map; and an optional zero-shot transfer task for agents with appropriate map/context observations. Scores across those tracks are not directly ranked together.

## 11. Quality, privacy, and deployment

Require keyboard navigation and manual movement, visible focus, screen-reader state summaries, accessible lesson lists, non-color-only encodings, reduced motion, responsive layout, readable math, and touch controls. Test contrast instead of assuming brand colors are readable in every pairing. In particular, use rose as an accent rather than small low-contrast text. [S12]

Import only bounded, schema-validated JSON. Never evaluate imported code. Render student notes as text, not HTML. Reject nonfinite model weights and incompatible state/action schemas. Warn before replacing local progress, and allow exporting before reset. There are no hidden secrets in a front-end-only application.

Bundle runtime dependencies/assets. A service worker may cache the application for offline use after a successful first load; external course PDFs are not automatically available offline. Scope the worker and caches to `/rl-island/` so they do not control the rest of ACML. Serve via HTTPS in production; use a local static server for development rather than promising double-click `file://` execution. [S13]

Configure Vite's base path and verify direct hash-route entry, asset loading, workers, model chunks, and service-worker updates in the built output. Build and preview are not production hosting. Deployment commands and integration changes require approval. [S6]

## 12. Codex working method

Put the concise AGENTS.md at the repository root. Codex supports repository instructions through that file. Keep task-specific detail in the task documents rather than repeatedly pasting this entire plan. [S14]

Start with the prompt in START_HERE.md. Thereafter implement one numbered task, review its evidence, and continue. Parallel work is suitable for independent lesson text or tests only after shared interfaces are stable; avoid several agents simultaneously redesigning the engine.

Each task report should state implemented behavior, files changed, checks actually run, screenshot locations where relevant, and remaining limitations. Commit coherent milestones after review; do not push or deploy without authorization. TASK_STATUS.md is an evidence ledger, not a list of aspirational completions.

Expected scripts after foundation:
```bash
npm ci
npm run dev
npm run lint
npm run typecheck
npm run test:unit
npm run test:e2e
npm run build
npm run preview
```

The scripts are requirements for the future repository; they are not runnable in this planning-only bundle until task 00 creates package.json and the application foundation.

## 13. Release definition of done

A first usable pilot has three genuinely interactive lessons. The tabular beta has five. A full-course release has all eleven reviewed lessons, live algorithms, reproducible and labeled evaluations, accessible progress/export, validated imports, working lecture mode, documented offline behavior, and an ACML-matching visual system.

Every demonstrated metric must have a run behind it. Every claimed lesson-source match must have verified source evidence. Every declared passing test must have been executed. The final artifact must work as a static site without a hidden backend.

## Sources and supporting files

Source IDs [S1-S14] resolve in docs/SOURCE_AUDIT.md, including verification dates and limitations. Detailed design, curriculum, architecture, and test specifications are in docs/. The executable-looking snippets and JSON/CSS references are implementation inputs, not evidence that the website has already been implemented.
