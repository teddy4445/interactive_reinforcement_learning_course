# Task-08 visual and lesson-route review

The production build was reviewed at 1440, 768, 390 and 320 CSS pixels. `scripts/capture-imitation-review.mjs` uses only the explicitly labeled developer QA backup produced by the real lesson journey. It serves a local preview and closes it afterwards. No supplied checkpoint is bundled into the course or presented as student progress.

Visually inspected:

- `imitation-fitted-desktop.png`: six-stage navigation, activity evidence, manual controls, Robo map, separate dataset/fitting/coverage sections. The first version's unstyled tables were too dense; the final table styles add cell padding, row separators and clear headers.
- `imitation-inspector-390.png`: the first working phone layout after correcting the parent container's width; this older capture motivated the final table spacing/scroll treatment.
- `imitation-map-and-protocol.png`: labeled coordinates, Robo, disabled directions after termination, actual state/trajectory status, import/export and the declared split/capture protocol.
- `imitation-policy-coverage.png`: all five nonterminal states, actual preferences/probabilities and explicit missing-data labels. Both upper states retain 0.25 per action in this dataset.
- `imitation-supervised-metrics.png`: real cross-entropy/accuracy columns for training and held-out data. The region retains a bounded vertical scrollbar; later rows remain in the table and JSON.
- `imitation-actual-gradient.png`: actual before/gradient/after numbers and the training-example normalizer.
- `imitation-measured-comparison.png`: five RL agents per initialization, familiar and upper-start raw mean returns and success fractions. The heading identifies agent averaging and five evaluations per agent.
- `imitation-unseen-rollout.png`: actual frozen-policy actions at absent state (0,0), including a sampled wall collision and transition into a demonstrated lower state. Probabilities, RNG draws, rewards and successors agree with the trace.
- `imitation-mobile-probabilities.png`: the rightmost columns reached by scrolling the keyboard-focusable table at width 390. The 520px table has a 324px viewport and scrollLeft 196; the document itself does not overflow.

The first browser run found horizontal **page** overflow at 320/390. The lesson adapter now constrains its parent to the available width and permits internal table scrolling. All seven affected browser scenarios passed after that fix. The final view keeps wide numerical columns in named, keyboard-focusable regions; it does not squeeze them into illegible text. Tablet and desktop use the same data, with a two-column map/protocol layout on wide screens and one column on phones.

Keyboard/touch button paths were exercised in Chromium: start a trajectory, move right, refresh mid-trajectory, continue with arrows, finish, record the second split through touch-sized buttons, fit, inspect, compare, pause/resume/cancel, complete checks, reflect and export/import. Canvas has an equivalent accessible cell list and transition table. Automated axe scans supplement these checks; a real screen reader, physical touchscreen, Safari and Firefox were not tested in this task.

All eleven route entries expose the six instructional stages and begin incomplete. No valid lesson route displays the former unfinished placeholder. The complete regression journeys exercise completion through actual activities rather than merely asserting headings. Broader standalone Sandbox/Compare/capstone and lecture-mode work belong to later tasks and are still labeled unavailable outside the lesson flows.

The full final 390px inspector capture (`imitation-final-inspector-390.png`) was also inspected: manual controls stack, the map and split protocol remain readable, recorded train/holdout trajectories are distinct, and the fitting/probability tables scroll internally. Wide columns are intentionally outside the initial viewport and have a visible scroll hint; they are not missing data.

Final-build captures were regenerated successfully. `eleven-completed-qa-island.png` and `eleven-completed-qa-notebook.png` were visually inspected after a fresh browser imported the actual foundation and learning QA exports through the normal validated import UI. All eleven activity-completion statuses agree. `combined-completion-review.json` records both source-file hashes. The final measured-comparison and scrolled mobile-probability captures were re-inspected too. No fabricated completion record was created for these screenshots.
