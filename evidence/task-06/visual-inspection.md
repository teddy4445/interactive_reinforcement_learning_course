# Task 06 visual inspection

Inspected actual Chromium screenshots from disposable developer QA, not student results. Final build: `index-jidEjFrl.js`, `index-EzL_C9Ka.css`, `training.worker-JiWZjoqu.js`; SHA-256 identities are in `build.json`. Source and algorithm data are not substituted by images or recordings.

## Final images inspected

- `screenshots/learned-policy-active-state.png`: current state (0,1), learned probabilities around the original vector Robo, ACML-blue meters, separate actor preferences and critic estimate, and expanded parameter table. The actual saved actor assigns about 80.344% to right, 10.117% to up, 5.197% to down and 4.341% to left. These values come from the completed browser QA run, not a supplied policy.
- `screenshots/learned-policy-map-and-selection.png`: actual cell probability overlay, full state, and a recorded categorical draw of about 0.991094 choosing left despite right having the largest probability. The collision reward is −1. This demonstrates sampling, not an argmax policy. The incomplete REINFORCE episode correctly shows no update yet.
- `screenshots/reinforce-actual-update.png`: actual complete return 10, baseline about 9.034867, advantage about 0.965133, outer discount 0.81 and preference changes from the recorded episode. Earlier contributions are expandable.
- `screenshots/actor-critic-actual-update.png`: the final worker-control fixture uses gamma=0, alpha=0.001. Actual reward/TD error −1 yields preference changes [0.00025, 0.00025, −0.00075, 0.00025] and critic −0.001. This is actual fixture data. The separate unit fixture covers gamma=0.9 and the nonzero outer discount.
- `screenshots/policy-inspector-320.png`: all four meters and the vector Robo fit at 320 CSS pixels; terminal-state probabilities are explicitly labeled as not executed. Text and disclosure labels wrap without page overflow.
- `screenshots/actor-critic-inspector-mobile.png`: active state, separate actor and critic, zero actor change at later time steps with gamma=0, visible update count, and readable mobile layout.
- `screenshots/policy-mathematics-mobile.png`: the declared objective, both gradients, baseline convention, numerical examples and inputs remain readable at 390 pixels. The mathematical explanation is a long vertical passage; it is not clipped.
- `screenshots/policy-comparison-mobile-expanded.png`: genuine fifteen-agent results and seeds. Wide summary/raw tables require horizontal scrolling within the comparison card; the entire page does not overflow. The raw-data region has a keyboard focus target. The screenshot shows its initial horizontal position, not all off-screen columns.
- `screenshots/lesson-08-complete-desktop.png`: six-stage navigation, measured discounted evaluation table, explicit concept challenge, evidence-based completion and visibly ungraded QA reflection. Completion was earned by the automated journey, not fabricated student progress.

The inspected shell retains the verified ACML logo, local Inter, light content surfaces, blue controls, rounded cards and pill navigation. The initial compass used a platform emoji and native green meters; the final version replaces those with the existing robot's original vector geometry and blue meters. There are no new remote assets or decorative animation dependencies.

`visual-review.json` records actual keyboard Step/Pause/Cancel and worker response measurements. On this host, Pause acknowledgment/completion were 14.8/15.3 ms, Cancel 5.6/6.3 ms, and initialization 4.4–92.9 ms. These measurements are not a universal device performance guarantee. The final mobile expanded-comparison review had zero violations for the exercised axe WCAG tags and no global horizontal overflow.

Instructor visual approval, student pilot, native screen readers, physical touch hardware and other browser engines were not exercised. Automated accessibility is not a replacement for those checks.
