# Policy-method contracts (task 06)

Lesson 08 uses `policy-v1`, a tabular actor with four preferences per complete position state, and an independent tabular value critic where enabled. It reuses the same IslandEnvironment, seeded action stream, worker, evaluation and persistence pipeline as the earlier lessons. No Q table or neural library implements the policy. All policies start uniform because preferences start at zero.

## Objective, gradient and discounts

The fixed-start objective is `J(theta) = E[sum(t=0..T-1) gamma^t r(t+1)]`. The default discount is 0.9; the supported interactive range is 0–0.99. The environment is the deterministic 3×2 Policy Summit with position-only full observation, start (0,1), goal (2,0), step reward −1 and goal bonus +11 (net goal reward +10). Walls/boundaries use the shared engine. There are no hidden state variables on this map.

Softmax has temperature 1 and subtracts the maximum preference before exponentiation. Categorical sampling uses one recorded draw from the agent RNG and cumulative probabilities in up/right/down/left order. Environment and agent RNGs stay independent; display scheduling consumes neither. The score is `onehot(action) - probabilities`. The selection trace retains the actual probabilities and draw, not a post-update guess about intent.

- **REINFORCE:** collect a genuinely complete episode under fixed preferences. Compute suffix returns `G_t = sum(k=t..T-1) gamma^(k-t) r(k+1)`. Apply the episode sum `alpha * gamma^t * (G_t - baseline_t) * score_t`. Every contribution uses the probabilities from collection, including repeated states. Intermediate preference vectors in the inspector are partial sums of this same batch gradient, not new on-policy observations.
- **Plain REINFORCE:** the baseline is exactly zero; no critic is fitted.
- **REINFORCE with a baseline:** the action-independent tabular V is fixed throughout episode collection. After termination, update each visited state's critic by the sum of `alpha * (G_t - V_old(s_t))` over all its visits. This is the negative gradient of the episode's summed half-squared return errors; it is not a sequential refit with silently changing targets. Actor and critic have separate parameters. No derivative flows through the baseline in the actor gradient. The baseline can reduce variance, but a finite comparison need not improve.
- **One-step actor-critic:** use pre-update `delta = r + gamma V(s') - V(s)`, actor increment `alpha * gamma^t * delta * score`, critic increment `alpha * delta`. The advantage/TD target is held fixed in the actor calculation. With an inaccurate critic, the actor estimator can be biased. No convergence guarantee is made.

Actor and critic share the configured alpha in this small lesson (default 0.05). Gamma=0 suppresses actor contributions for t>0, while critic targets still learn immediate rewards. `parameters.updates` counts actor contributions; `criticUpdates` is separate. Real interaction counts count samples only, not parameter components. REINFORCE updates appear at episode completion rather than on every Step.

## Termination and stopping

Reaching G terminates. Terminal critic continuation is exactly zero. The default external cap is 80; it is not a task terminal or an added state variable. Actor-critic bootstraps through this external cutoff; the next rollout restarts the episode time index. REINFORCE skips capped/interrupted returns and increments `skippedPolicy` because no complete return was observed. Filtering out incomplete returns can bias the retained sample; the UI exposes caps/skips and advises changing the cap. It never pretends the unobserved tail is zero.

Pause/Resume retains partial returns, probabilities, frozen baseline values, time indices, RNG state and job budget. Cancel stops the job while retaining the collected episode for a later command. Reset episode abandons incomplete episodic returns and keeps learned preferences/values; Reset learning creates a new experiment version with zero parameters and separate history.

## Evaluation and experiments

Evaluation detaches the complete parameter snapshot and samples the **frozen learned softmax distribution**, at temperature 1. It does not switch to greedy actions. It uses separate seeded environments and categorical draws, never invokes a learner, and does not change preferences, critic, counters, training RNG, buffered episode or training rows. The action rule and snapshot hash appear with the results.

The lesson comparison trains all three methods from scratch with five recorded independent training seeds each and the same episode budget (20–300; default 120). Each agent is then evaluated on five separate evaluation seeds. Primary score: each agent's mean **discounted** evaluation return, then mean and observed min/max over five independent agents. This uses the same discount convention as the declared objective. An externally capped evaluation reports its observed partial discounted sum, not an invented complete return; termination/cap flags remain in every evaluation row. Training and evaluation plots are genuine **undiscounted** reward sums, explicitly labeled; both discounted and undiscounted rows remain in the export. Training smoothing is a trailing arithmetic mean over the current and up to six preceding completed/capped episodes. Evaluation and comparison scores are unsmoothed.

Equal episode budgets can produce unequal real interaction counts. The UI and exports retain those counts and compute time; this comparison does not claim equal-sample efficiency or a universal winner. The factual challenge is computed from the actual measured score/tie. Its required concept question distinguishes a learned state-value critic from action selection. Numeric checks independently require a genuine policy update. Reflections are saved verbatim and not automatically understood or graded.

## Persistence, accessibility and evidence

Schema-1 exports add lesson 08 and optional actor fields without rewriting old checkpoints. Existing task-04 and task-05 exports validate unchanged. Checkpoint validation replays the current environment episode, validates categorical probabilities/draws, return and gradient arithmetic, vector dimensions, actor/critic/skip counters, and episode provenance. These checks validate local data structure, not authenticated grades.

Four labeled meters around Robo, an accessible parameter table, text transition/update trace, cell probability overlay, visit counts, critic values and advantage/TD errors accompany the canvas. Terminal-state distributions are labeled as stored values that will not be executed. The last policy contribution is shown, with earlier episode contributions expandable. Display rounding is declared; exports retain full precision.

Numerical fixtures are in `tests/unit/policy-methods.test.js`: large-logit stability, sampling, score finite differences, an independently enumerated two-step objective gradient with the outer discount and action-independent baselines, exact REINFORCE/actor-critic updates, complete/capped returns, repeat visits, gamma=0, replay, workers, evaluation isolation, comparisons and legacy saves. Browser journeys are in `tests/e2e/policy-methods.spec.js`. See TASK_STATUS.md for commands actually run and screenshots inspected.

## References and limits

The verified local `lesson-08.pdf` corresponds to catalog `files/rl_course/9.pdf`; its extracted text identifies Policy Gradients and Actor Critics and the Sutton–Barto chapter-13 background. Topic checks used the repository reference. The deck distinguishes episodic and average-reward gradients and also shows an actor-critic pseudocode variant that omits the outer discount. This lab explicitly retains gamma^t for its fixed-start discounted objective. These are original exercises; no detailed activity-to-slide-page citation is claimed. A supplementary attempt to retrieve the public book PDF returned HTTP 502 during task 06. No reference is fetched at application runtime.

Instructor approval, student pilot, physical devices, native screen readers, Firefox/WebKit and a reference-laptop performance study are separate, unrun checks. Task 06 introduces no deployment or change to the ACML host site. Lessons 09–11 remain unfinished.
