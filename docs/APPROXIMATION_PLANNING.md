# Approximation and learned-model planning (task 05)

The static browser application uses the existing `IslandEnvironment`, `TrainingRun`, worker state machine, frozen evaluation and lesson engine. There is no neural dependency, server or remote inference. Lessons 08–11 remain unfinished.

## Explicit representations

`agents/features.js` defines `compact-v1`: normalized bias, x, y, and three terms per enabled collectible (bit, x×bit, y×bit). Battery and finite task time, when enabled, each add one normalized component. All terms are divided by √dimension; vectors have norm at most one. A full task-state key and observation retain every enabled variable. The deliberately aliased encoder zeros auxiliary terms while keeping dimensions fixed. In the lesson-06 map the true state is (x,y,collected), informative φ has six components, and action-block SARSA has 24 weights.

`agents/linear.js` implements semi-gradient linear TD prediction under a specified policy and linear SARSA under the recorded next behavior action. It masks genuine terminal continuation and retains bootstrap at external rollout cutoffs. Every trace contains the actual features, pre/post weights, target and error. Because φ is scaled, the new dot product is not generally old estimate + αδ. Full-state tabular TD/SARSA remain comparison baselines. The compact basis may have approximation error even though it distinguishes enabled variables.

The table calculator uses exact BigInt arithmetic: nonwall positions × 2^collectible bits × battery levels × finite time levels × action count. Disabled variables contribute one. Float64 storage estimates exclude object/serialization overhead. This is a Cartesian upper bound, not a reachable-state count.

## Learned deterministic model

`agents/dyna.js` learns (s,a)→(reward,next,terminated,realVisits) only from observed samples. There is no transition-model access in the learner. One real Q-learning update precedes n simulated backups drawn uniformly from sorted observed pairs using a separate saved planning RNG. Unknown pairs stay absent. Real visit counts and model observations never increase during planning; TD-error diagnostics may reflect the most recent real or simulated update, as the trace labels show. Conflicting outcomes are rejected because this model assumes a deterministic stationary task. Save validation consults the canonical model only to reject invalid imported data, never to supply unseen training transitions.

Q-learning with planningSteps=0 and Dyna-Q with zero planning select the same actions and produce the same Q values. Planning draw/state is independent of action/environment randomness and display timing. Reset episode preserves weights, learned model and planning RNG. Reset learning starts a new experiment version with zero parameters and distinct histories.

## Equal real-interaction comparison

Advanced worker batches count exact real steps and may stop mid-episode. Comparison budgets range from 60 to 1,500 real interactions per agent; default 600. Evaluations occur at floor(B/3), floor(2B/3), and B. Lesson 06 has five seeds × three representations/baselines; lesson 07 has five seeds × two methods. Every trained agent at each point has the same real budget, including partial rollout steps. Partial rollouts are recorded separately and never passed off as complete episodes.

Five separate frozen evaluation episodes per checkpoint do not change weights, Q values, model, RNG, pending SARSA action, visits or counters. Prediction RMSE uses an independent exact fixed-policy reference, equally weighting every reachable nonterminal full state (not weighting by the sampled policy visitation frequencies); control uses frozen greedy policy, epsilon zero with ties up/right/down/left. Primary checkpoint scores are unsmoothed. Episode plots retain raw observed returns and the existing trailing arithmetic mean over at most seven completed/capped episodes. Evaluation is a separate dataset. Real interactions, real backups, simulated backups, total backups, active worker compute time, root seeds, configuration version and representation are recorded. Reusing seed lists does not imply identical trajectories. No universal winner, convergence or transfer claim is made.

## Persistence and bounds

Configuration schema 1 is additive: old `tabular-v1` configurations and numerical results are unchanged; new lessons use `features-planning-v1` and explicit representation/planning fields. No destructive migration is required. The existing `rl-island:model-free-progress:v1` namespace and IDB checkpoints accept lessons 04–07. Old task-04 exports are tested as-is. Import replaces only lesson records present in the backup; absent lesson records, foundation progress and unrelated host storage remain. Combined run IDs must be unique and merged records are validated before writing checkpoints.

All original strict bounds remain: 4 experiments and 3 comparisons per lesson, 10 evaluations, 60 explicit check attempts, 2,000 episode rows per run, 16 MiB export import bound. A batch is at most 5,000 real steps; planning is at most 20 per step. Histories are not silently evicted or combined. Limits and storage failures are reported; memory-only state remains exportable.

## Verification sources

`tests/unit/approximation-planning.test.js` specifies exact weight/Dyna fixtures, encoder dimensions, enabled variables, reset and terminal/cap semantics, real/planning counters, exact worker budgets, evaluation isolation, saved continuation and legacy backup compatibility. Existing tabular/environment/lesson checks remain regression gates.

`tests/e2e/approximation-planning.spec.js` exercises full six-stage journeys and actual worker results, imported old progress, refresh, backups, controls and accessibility. `scripts/calibrate-approximation-planning.mjs` generates real independent-seed minimum/default-budget evidence through the production worker state machine. These are disposable developer QA records, never student progress. See `TASK_STATUS.md` for commands actually run and remaining unrun checks.
