# Acceptance tests and evidence requirements

The tests below are specifications to implement. None are claimed to have run against a website in this planning bundle. Numeric expected values below were independently calculated when preparing the plan.

## 1. Mathematical fixtures

| Test | Setup | Expected |
|---|---|---|
| Discounted return | Rewards [0, 0, 5], gamma 0.9 | Initial return 4.05 |
| Discount preference | Reward 5 at action 1 vs 20 at action 4, no costs | Switch at gamma = (0.25)^(1/3), approximately 0.6299605 |
| TD(0) | V=2, r=1, V'=4, gamma=0.9, alpha=0.1, nonterminal | Target 4.6; new V=2.26 |
| Q-learning | Q=3.12, r=5, max next Q=4.2, gamma=0.9, alpha=0.1 | Target 8.78; new Q=3.686 |
| SARSA | Same, but chosen next action has Q=1 | Target 5.9; new Q=3.398 |
| Terminal target | Q=3.12, r=5, alpha=0.1, true termination | Target 5; new Q=3.308 |
| External truncation | Q-learning fixture, task nonterminal but rollout cut off | Retain appropriate bootstrap; new Q=3.686 |

Add a hand-solvable two/three-state MDP to validate policy evaluation, policy improvement, and value iteration. Compare the implementation to an independently calculated solution. Test stochastic expectation backups, merged collision outcomes, gamma=0, and valid episodic gamma=1 behavior. Restrict unsupported gamma=1 continuing configurations rather than promising convergence.

Test first-visit versus repeated-state Monte Carlo handling. A truncated episode must not masquerade as a complete Monte Carlo return. Verify that a prediction learner does not change the policy generating its data.

## 2. Environment and reproducibility

Check seeded sequences, separate RNG streams, transitions summing to one, walls/bounds, consumed collectibles, all reward components, absorbing terminal behavior, explicit episode caps, time features, and reset semantics. Confirm serialized state survives a round trip.

Same seed/configuration/actions must yield the same tabular transition/update trace with animation on, off, or sped up. Different rendering frame rates must not affect episode counts or the resulting Q-table. Test pause/resume and one-step mode against a continuous run using identical RNG state.

## 3. Learning-specific tests

SARSA uses the actually selected next behavior action. Q-learning uses the next-state maximum according to the defined target policy. Terminal flags mask bootstrap correctly. Greedy ties have an explicit rule. Epsilon branch labels match the recorded RNG branch; an exploratory action may coincidentally equal the greedy action.

Linear features have verified dimensions and normalization. Duplicate/aliased states are intentional and documented. Dyna-Q tests count and validate model updates separately from real transitions. In stochastic-model extensions, a single last observation must not be misrepresented as the exact transition distribution.

Softmax is numerically stable and sums to one. Use finite-difference gradient checks for tiny policy-gradient fixtures. Match the declared objective's discount convention. Actor-critic gradients must not propagate through a target that was specified as fixed.

DQN tests: replay insertion/sample bounds, batch shapes, target copy/update frequency, correct terminal masks, actual parameter updates, no evaluation updates, finite losses, and tensor disposal. Check memory through many reset/train cycles. Do not use a brittle one-seed reward threshold as the only test of a neural algorithm.

Imitation tests: dataset capture, state-action alignment, train/test split, a genuine reduction in supervised fixture loss, compatible policy export, and explicit initialization semantics for subsequent RL.

## 4. Evaluation integrity

Freeze a policy, run evaluation, and verify its parameters and training counters did not change. Store train and evaluation seeds separately. Check metric definitions, success/failure accounting, and smoothing labels. Run known-map, per-map-adaptation, and zero-shot protocols as distinct test cases; reject an incompatible coordinate Q-table for zero-shot new-layout scoring.

Challenge thresholds are calibrated from recorded runs and concept checks. Failed attempts persist with explanations; resetting a run does not award mastery. Local score exports are labeled self-reported. Hidden seeds delivered to a browser are not called secret.

## 5. Browser learning journey

Start without storage -> enter island -> select lesson -> record prediction -> manually act -> inspect math -> experiment -> complete check/challenge -> open notebook -> refresh -> resume. Verify the record is retained and no action grants progress accidentally.

Test direct entry to every hash route, Back/Forward, unknown lesson IDs, and missing assets. Reset episode preserves learning; Reset learning requests confirmation and resets it. A user can leave training safely. Old worker responses cannot modify the new run or page.

Sandbox validates maps, communicates unreachable goals, prevents unsupported algorithm/state combinations, saves scenarios, and imports them without executing code. A no-path map may be retained as an explicitly intentional experiment, but cannot silently become a required passable challenge.

## 6. Storage and security

Test export/import/migration round trips, unsupported versions, duplicate records, quota failures, unavailable storage, oversized JSON, hostile markup in notes, nonfinite weights, and prototype-pollution keys. No imported code executes. Replacing data requires an explicit choice. Clearing RL Island storage does not delete unrelated ACML data.

## 7. Visual and accessibility

Capture stable screenshots for the five key pages at 1440x900 and 390x844. Inspect tablet and wide-workspace layouts. Verify colors/radii/typography against the approved ACML design tokens and reference screenshots. Use actual run data or clearly labeled fixtures for test screenshots.

Manual keyboard test: navigate lessons, move the robot, operate sliders, inspect a cell, read status, pause training, and export. Provide focus management and a non-Canvas representation. Check reduced motion, non-color-only information, sufficient contrast, touch target usability, math readability, and browser zoom. Automated accessibility scans supplement rather than replace manual review. [S12]

## 8. Performance and static release

On an agreed reference laptop/browser, record control response and cancel latency while a bounded tabular batch is active. Targets: about 100 ms input acknowledgment and 250 ms cancel completion. Measure, do not assert. Verify chart/trace buffers remain bounded over repeated training. Lazy neural loading must not affect initial lessons.

Test the production build served under `/rl-island/`, not just a development server. Confirm all local assets, workers, dynamic chunks, and hash routes work. No backend/API request is required for learning. Test offline reload after the app declares its local assets cached; external lecture links may remain unavailable. Confirm service-worker scope does not cover the ACML root and upgrades preserve progress. [S6, S13]

## 9. Release evidence ledger

For each task record status, commit/build identifier, implemented behaviors, commands actually run and exit results, relevant screenshots, measured benchmarks, content verification state, and remaining defects. A test that could not run is `NOT RUN`, not `PASS`. A prebuilt checkpoint is not evidence that in-browser training works.

Full-course release requires eleven complete lesson experiences and human content approval. Multi-agent content is an optional future release and does not block the agreed core.
