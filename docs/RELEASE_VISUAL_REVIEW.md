# Release screenshot review

Build `a85e523ba15ccbfba6ba`, Chromium 153.0.8010.12. This is the coding assistant's visual inspection, not instructor approval or a human accessibility study. All screenshots are actual local browser states with disposable QA data. They are not student outcomes.

## ACML comparison

Compared the current build with `evidence/task-00-01/reference/acml-desktop.png` and the verified ACML design specification. The public homepage body was re-fetched during task 11 and matches its original reference hash; a new live rendered ACML capture is not claimed.

The original logo keeps its aspect ratio. Local Inter, pill navigation, blue primary actions, restrained rose accents, white rounded panels and light gray backgrounds match the ACML treatment. The welcome page uses the intended dark blue/rose hero with a restrained colored heading. Terrain colors stay inside illustrations/maps. Working lessons use light content surfaces rather than a marketing hero. This is a design adaptation, not pixel-identical reproduction of the host homepage.

## Inspected paths

All paths below are relative to `evidence/task-11/screenshots/`.

- Five key pages at 1440×900: `welcome-desktop-viewport.png`, `island-desktop-viewport.png`, `lesson-01-desktop-viewport.png`, `compare-desktop-viewport.png`, `notebook-desktop-viewport.png`.
- The same pages at 390×844: `welcome-mobile-viewport.png`, `island-mobile-viewport.png`, `lesson-01-mobile-viewport.png`, `compare-mobile-viewport.png`, `notebook-mobile-viewport.png`.
- Full lesson layouts: `lesson-tablet.png` (1024-pixel viewport) and `lesson-wide.png` (1920-pixel viewport).
- Real working data: `sandbox-trained-desktop.png`, `compare-four-methods-desktop.png`, `imitation-fitted-390.png`, `lesson-09-actual-neural-update.png`.
- Further lesson review: `lesson-03-math-mobile.png`, `lesson-08-mathematics.png`, `lesson-07-complete-desktop.png`.
- Projection and focus: `lecture-math-390.png`, `keyboard-laboratory-controls.png`.
- Actual browser zoom: `actual-browser-zoom-mathematics-200.png`, `actual-browser-zoom-mathematics-400.png`, `actual-browser-zoom-manual-400.png`, `actual-browser-zoom-lecture-400.png`.
- Final Expedition and saved agents: `expedition-complete-desktop.png`, `expedition-390.png`, `notebook-filtered-desktop.png`.
- Restored completion evidence: `eleven-completed-qa-island.png`, `eleven-completed-qa-notebook.png`.

No clipped page controls or accidental horizontal document scrolling were found in those inspected views. Mobile navigation collapses into a menu, stage controls wrap and notebook tabs remain usable. The empty Notebook explicitly reports no records; visiting the Island shows zero completed lessons. The Sandbox capture distinguishes 600 real interactions/updates, genuine training returns and a separate five-episode frozen evaluation. The comparison capture includes all four methods/three seeds, including the lower-return actor-critic results, with separate real/planning/update/time counters.

Lecture math wraps within a narrow card and includes the textual discount convention and computed values. Keyboard focus is visibly outlined on the enabled Step control after cancellation. The neural update capture shows the recorded epsilon branch, sampled replay member, true-terminal zero bootstrap, actual loss/gradient and parameter change. The imitation phone view separates supervised fitting from return and labels states without demonstrated examples.

Long model/data views intentionally require vertical scrolling; tables have scroll regions and exports retain their raw data. Automated axe/reflow checks and keyboard/touch emulation supplement these visual observations. They do not establish complete WCAG conformance, native screen-reader behavior or physical-touch usability. Final instructor brand approval remains outstanding.

The actual 200%/400% screenshots preserve the readable return formula, wrapping text and scaled maps. At 400%, the map is taller than the visible viewport and uses ordinary vertical scrolling; the document does not overflow horizontally. The zoom verifier passed all seven captured view/zoom combinations with no axe violations. The two restored-completion screenshots show eleven completed records after validated imports, backed by the recorded browser journeys and retained legacy QA exports. They do not represent a human student or independently measured learning.

Additional lesson inspection confirms that the mobile Bellman backup and computed 3.5/5/0 state values wrap within their card. The policy-gradient screen states the objective, discount convention, frozen baseline, actual score gradient and actor probabilities, with separate training/evaluation plots. The Dyna challenge retains the measured final tie, intermediate 200/400/600 real-interaction checkpoints and separate planning-work explanation; it does not hardcode a winning method.

The Expedition desktop capture separates 600 source interactions from zero target interactions in known-map evaluation and shows five frozen evaluation rows plus the concept checks. The mobile editor is a long single column with a jump-to-workspace link. The filtered Notebook capture keeps the hostile markup fixture as literal text and shows the separate JSON/CSV export controls; the browser security tests verify that it is not executed.
