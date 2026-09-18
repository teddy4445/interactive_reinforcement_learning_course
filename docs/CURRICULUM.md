# Curriculum and lesson-authoring specification

The eleven source titles and filenames follow the first matching current course record. [S4-S5] Exact source wording is normalized for spelling/capitalization. Lessons 01–03 now have original implemented pilot activities, described below. Lessons 04–11 now also have implemented original activities. None of these activities is a verified slide-by-slide summary; detailed page anchors and instructor content review remain pending.

## Lesson content contract

Every lesson contains an ID, source reference and verification status, prerequisites, objectives, scenario version, permitted algorithms/controls/overlays, six stage definitions, expected observations, common misconceptions, graded concept checks, challenge rubric, reflection prompt, accessibility description, and an instructor note.

Separate the educational content from executable behavior. Store text/data in JSON or structured JavaScript; implement behavior through a small explicit registry of approved handlers. Do not use eval or arbitrary code inside lesson JSON.

Start with 2-4 short missions per lesson rather than a single 30-minute form. Use the same Observe, Predict, Play, Math, Experiment, Challenge pattern. Instructional prose should usually be a few sentences per screen; formulas expand on demand.

A prediction must be saved before revealing the outcome. Experiments record their scenario, representation, algorithm, parameters, seeds, and result. Reflections can be free text, but only explicit checks and calibrated challenges change understanding/mastery status.

## Lesson entries


## 01. Introduction to Reinforcement Learning - Base Camp

Source: `files/rl_course/1.pdf`; PDF page anchors pending.

**Learning goal:** Identify the agent-environment interaction and compute a short return.

Introduce the robot with a deterministic map, no hazards or battery. The student walks to a campsite. A DOM trace names S_t, A_t, R_(t+1), and S_(t+1). Include a near-versus-delayed reward fork with no step cost for the first discount example. In that fixture, reward 5 after one action competes with reward 20 after four actions; the preference threshold is gamma = (5/20)^(1/3). Reveal the computed discounted returns, not a scripted route change. A planning display can recompute immediately; a learned policy must be retrained after changing its discount.

**Challenge:** Guide the robot and correctly identify the state, action, next state, and reward.

**Reflection:** What changed, why did it change, and what evidence supports that explanation?


### Implemented pilot: lesson 01

Prerequisites: none. Scenario: foundation-01, schema 1; a deterministic 3×2 campsite, full position observation, start (0,0), goal (2,0), step −1 plus goal bonus 6. Permitted behavior: manual actions and finite-sequence return calculation. Controls/overlays: keyboard/touch directions, reset practice, DOM state/reward/transition table, text map, and calculated return pair.

| Stage | Implemented activity / expected evidence |
|---|---|
| Observe | Name agent/environment/state/action/reward; choose Robo as the agent. |
| Predict | Save which no-cost reward option wins at gamma 0.5 before revealing results. |
| Play | Guide Robo, inspect the actual transition, and reach the goal within six accepted actions. |
| Reveal the mathematics | Compute [0,0,5] at gamma 0.9 = 4.05; display the actual current trace's complete or prefix return; calculate the no-cost fork. |
| Experiment | Save a prediction, change gamma by at least 0.05 (suggested 0.9), and compute the returns. The fork is 5 versus 2.5 at gamma 0.5; 5 versus 14.58 at gamma 0.9. |
| Challenge | Meet the route criterion, compute [−1,5] at gamma 0.9 = 3.5, and identify the correct goal transition. |

Misconception: a final positive reward does not remove earlier costs or discounting. Numeric checks allow absolute error 0.01; concept choices must match. The six-action route threshold has actual shortest/tolerated/over-budget calibration. Reflection is optional saved text, never graded. Accessibility: keyboard and touch-emulated controls, live status, text map and transition tables alongside Canvas, text formulas and value cards. Instructor note: this original pilot is implemented under task 03; no slide-page mapping or instructor approval is claimed.


## 02. Tabular MDP Planning and RL Policy Evaluation - MDP Beach

Source: `files/rl_course/2.pdf`; PDF page anchors pending.

**Learning goal:** Describe an MDP and evaluate a specified policy with a known model.

Add stochastic sideways slip with editable normalized probabilities. At boundaries, aggregate the probabilities of outcomes that lead to the same cell. Fix the behavior policy while studying V. Show one Bellman expectation backup and then whole sweeps. Model access is explicit. A deliberate state-aliasing mini-mission can show why battery must be included when it matters, but do not introduce an accidental non-Markov environment.

**Challenge:** Predict a one-step Bellman backup and explain how a slip probability changes outcomes.

**Reflection:** What changed, why did it change, and what evidence supports that explanation?


### Implemented pilot: lesson 02

Suggested prerequisite: 01 (exploration remains open). Scenario: foundation-02, schema 1; corridor A=(0,0), B=(1,0), G=(2,0), lower-row walls, full position observation, step −1 and goal-entry net 5. Permitted algorithm: exact fixed-policy evaluation; policy always right, gamma 0.9. Controls/overlays: follow-right action, reset practice, actual transition probabilities, synchronous computed sweeps, state values, residual and sweep count.

| Stage | Implemented activity / expected evidence |
|---|---|
| Observe | Distinguish changing values from changing a fixed policy; describe the stochastic MDP. |
| Predict | Save the probability of staying at B with slip 0.2. |
| Play | Execute at least two accepted actions under the right policy and inspect sampled transitions against the exact model. |
| Reveal the mathematics | Explain the first backup B=0.8×5+0.2×(−1)=3.8; evaluate to residual at most 1e-8. B converges to 3.8/0.82 and A to (−1+0.72B)/0.82. |
| Experiment | Save a prediction and change slip within 0–0.8 by at least 0.05 (suggested 0.4), keeping gamma/policy fixed. At slip 0.4, B=4.0625 and A≈1.865234. |
| Challenge | Reach residual at most 1e-6, calculate the zero-initialized B backup for the chosen slip (6(1−slip)−1), and identify why blocked probabilities add. |

Misconception: a sampled transition is not a transition distribution and a value is not one immediate reward. Reflections remain ungraded. Accessibility: fixed-policy button and keyboard support, text map/trace/probability table, readable computed state cards and numerical controls. Instructor/source note: the verified linked 2.pdf concerns exploration/exploitation, unlike the catalog title. The MDP pilot follows the user's explicit task-03 scope; that instruction is not represented as verified PDF alignment or instructor approval. Page mappings remain unverified. The optional battery/aliasing mini-mission is not implemented.


## 03. MDP continuation - Value Forest

Source: `files/rl_course/3.pdf`; PDF page anchors pending.

**Learning goal:** Separate policy evaluation, improvement, and optimality backups.

Animate policy evaluation followed by improvement; compare with value iteration on a tiny known MDP. Use converged values or a declared finite number of sweeps. Expose Bellman residual and iteration count. A stable policy is not by itself evidence that displayed values have converged. Policy ties use a documented rule. Keep the main example fully observable and small enough for a hand-worked check.

**Challenge:** Compare two planners on the same small map and explain their stopping criterion.

**Reflection:** What changed, why did it change, and what evidence supports that explanation?


### Implemented pilot: lesson 03

Suggested prerequisite: 02. Scenario: foundation-03, schema 1; the same three-state corridor with deterministic movement, full position observation and identical rewards. Permitted algorithms: greedy policy improvement, exact policy iteration (initial left policy), and value iteration. Controls/overlays: manual actions, reset practice, next/animate/pause/final computed frame, current policy, state values, residual, and actual sweep count. Ties use up, right, down, left.

| Stage | Implemented activity / expected evidence |
|---|---|
| Observe | Distinguish evaluation, improvement, and optimality backups; improvement changes the policy. |
| Predict | Save the predicted optimal action at B. |
| Play | Take at least two accepted manual actions and inspect their actual rewards. |
| Reveal the mathematics | Animate real synchronous value-iteration sweeps: [−1,5,0] then [3.5,5,0] at gamma 0.9. Calculate A=3.5. |
| Experiment | Save a prediction and change gamma within 0–0.99 by at least 0.05 (suggested 0.5). Compare actual policy-iteration evaluation/improvement frames with value iteration on the identical model. At gamma 0.5 both give [1.5,5,0]. |
| Challenge | Both planners must converge with residual at most 1e-6, agree within 1e-6, and the student must calculate A=−1+5gamma and select the numerical stopping evidence. |

Misconception: stable arrows or an ended animation do not prove converged values. Planners report tolerance 1e-8 and explicit budgets; all value frames come from real updates. Reflection compares counts without assuming a universally faster planner; it is never automatically graded. Accessibility: computed tables/cards and explicit frame controls do not depend on animation, Canvas, or color alone. Instructor note: deterministic developer calibration covers the exposed discount range; human pilot review remains pending. No slide-page citations are supplied.

For shared completion, storage, reproduction fields, bounds, and numerical conventions, see [LESSON_RUNTIME.md](LESSON_RUNTIME.md). Task-03 records describe local completed activities, not authenticated grades. Later lessons below remain unimplemented.


## 04. Model-free prediction - Experience Jungle

**Implemented in task 04.** Source: `files/rl_course/5.pdf`; detailed slide-page anchors remain unverified. Original activities follow the verified catalog topic.

**Learning goal:** Compare complete-return and bootstrapped value prediction for a specified, unchanged policy. Missions: keep the policy fixed; trace both updates; compare independent estimates.

- **Observe:** Distinguish estimating values from improving the behavior policy. The supplied right/uniform policy generates samples on the slip-0.2 corridor.
- **Predict:** Save a prediction about update timing before viewing sampled results. It is preserved without automatic grading.
- **Play:** Step/finish/train actual episodes; inspect V, policy, visits and return/TD errors. At least one rollout and real update provide activity evidence.
- **Reveal the mathematics:** Work TD(0) target 4.6 / new V 2.26 and MC return 4.05. The inspector shows actual pre-update values, target, error, alpha and result. First-visit MC uses 1/N and skips incomplete capped returns; omission can bias the retained sample.
- **Experiment:** Compare five independently trained MC agents with five TD agents, identical fixed policy/task/gamma/episode budget. RMSE uses a separately computed known-model reference for that identical policy. Frozen-policy episode returns are separate and do not measure prediction accuracy.
- **Challenge:** Complete both numerical checks, the independent comparison, and select the method with the actually lower measured mean RMSE (or tie), plus the incomplete-MC concept check. Minimum 20 episodes/agent; default 80. No preset method must win.

**Reflection:** Explain observed error and variability using measured evidence. Save free text without semantic grading. Completion is activity-derived; visiting stages does not award it. Developer calibration covers five seeds at minimum/default budgets; no student-learning claim is made.

## 05. Model-free control - Control Ridge

**Implemented in task 04.** Source: `files/rl_course/6.pdf`; detailed slide-page anchors remain unverified. Original activities follow the verified catalog topic.

**Learning goal:** Learn control and distinguish behavior from target policies. Missions: record exploration decisions; trace on/off-policy targets; compare cliff behavior and frozen evaluation.

- **Observe:** SARSA uses the actual selected next behavior action; Q-learning uses the maximum. The 6×4 cliff-like task has action cost −1 and hazard cost −20 in addition. Hazards do not teleport or terminate; the goal terminates. There is a safe detour.
- **Predict:** Record expected differences before running experiments. No universally winning method is assumed.
- **Play:** Use worker controls, constant epsilon settings and actual Q/max-Q/policy/visits/TD-error overlays. Why this action? shows selection-time values, action probabilities, random draws and recorded exploration/exploitation branch, including exploratory choices that happen to be greedy.
- **Reveal the mathematics:** Trace SARSA 3.398, Q-learning 3.686 and true-terminal 3.308 fixtures. SARSA executes its saved next decision. Both retain the appropriate bootstrap at an external rollout cap.
- **Experiment:** Five independent training seeds per method, paired budgets/configuration and separate frozen greedy evaluation (epsilon 0, ties up/right/down/left). Display actual training returns/hazards, per-agent evaluation returns, means and observed ranges. Default 120 episodes/agent; minimum 20. Failed/capped runs remain in results.
- **Challenge:** Complete the numeric updates and measured comparison, then identify the actually higher mean frozen-evaluation return (or tie) and explain the evaluation rule through an explicit concept check. There is no required return threshold or predetermined winner.

**Reflection:** Compare training behavior, hazard visits and evaluation, citing the recorded experiment rather than a universal safety/return claim. Store text ungraded. The optional bandit cave is not implemented in this milestone.

Both lessons share the course's six stages, actual activity progress, notebook/check history, refresh/model continuation and explicit backup import/export. See `docs/MODEL_FREE.md` for recorded seeds, versions, budgets, smoothing definitions, storage limits and known-map evaluation scope.

## 06. Function approximation - Feature Highlands

**Implemented in task 05.** Source: `files/rl_course/7.pdf`; detailed slide-page mappings remain unverified. Original six-stage activities use the verified catalog topic.

**Learning goal:** Explain shared linear weights, representation limits, and deliberate aliasing without dropping required variables from true task state.

- **Observe:** The 3×2 deterministic supply island includes position and consumed-supply inventory. A supply rewards once. Check why identical positions can have different future rewards.
- **Predict:** Save a prediction about shared estimates and missing inventory information before viewing learning results.
- **Play:** Inspect linear TD prediction of a specified uniform/right policy, or linear SARSA control. Step/Episode/real-interaction batch share the environment and worker. Show current feature names, normalized values, weights, contributions and actual full observation. Informative and aliased vectors for two valid inventory states make information loss explicit. Tabular TD/SARSA are available baselines.
- **Reveal the mathematics:** Semi-gradient update holds the target fixed. The two-feature worked fixture produces weights 0.321 and −0.0395, and estimate 0.30125. Actual map traces show all pre/post weights, feature components and target calculations. Calculate Cartesian state/Q entry/float64-byte bounds with position, inventory, battery and task-time cardinalities; do not claim all combinations are reachable.
- **Experiment:** Five independent seeds × informative linear, aliased linear and full-state tabular learners. Each agent receives exactly the same real-interaction budget at three checkpoints. Prediction reports exact fixed-policy reference RMSE; control reports separate frozen greedy returns. All raw records and partial rollouts remain distinct. Minimum 60 real steps, default 600; no promised winner.
- **Challenge:** Complete two numerical checks, the measured comparison and the missing-information concept check. Select the actually best final mean or tie, never a preset representation. The comparison also exposes intermediate results and finite-budget variability.

**Reflection:** Record evidence about weight sharing, the table calculation and representation limitations verbatim, without semantic grading. Compact informative features are not guaranteed to represent the exact value function. Developer calibration includes prediction/control at minimum/default budgets and is not student performance.

## 07. Planning and models - Modelers Marsh

**Implemented in task 05.** Source: `files/rl_course/8.pdf`; detailed slide-page mappings remain unverified.

**Learning goal:** Separate real interaction, learned transition models and simulated planning, and assess sample efficiency under equal real budgets.

- **Observe:** Deterministic stationary 4×4 maze. Only experienced state/action pairs enter the learned model. Check that a planning backup creates no real experience.
- **Predict:** Store an expectation about planning and counters before results; Dyna-Q need not outperform the baseline.
- **Play:** Real Q-learning update, observed model tuple, then 0–20 uniformly sampled model backups per real step. Inspect actual transitions, learned rewards/next states/termination, visit counts, planning draw and each update. Planning has its own seeded stream. The model never receives ground-truth transitions. External caps are not model termination.
- **Reveal the mathematics:** Terminal-reward-2 fixture with alpha 0.5: one real backup gives Q=1; one planning backup gives Q=1.5. Twelve real steps at five plans each mean 60 simulated updates and 72 total backups. Both calculations are explicit checks.
- **Experiment:** Five independent seeds × Q-learning without planning and Dyna-Q. Three identical real-interaction checkpoints, separate simulated-work counts and active compute times, and five frozen evaluations per checkpoint. Minimum budget 60, default 600. Zero-planning Dyna matches Q-learning numerically; higher planning is measured, not declared superior.
- **Challenge:** Identify the actually higher final mean return or tie and the equal-real-budget fairness rule. Completion requires actual activities and numerical checks; stage navigation earns nothing.

**Reflection:** Save measured intermediate/final evidence, model coverage and limitations without grading free text. This lesson supports a stationary deterministic last-outcome model. Conflicting outcomes are rejected; the optional nonstationary change-point demonstration is not implemented.

Both lessons preserve prior saves and reuse the existing notebook, six-stage engine, worker and environment. See `docs/APPROXIMATION_PLANNING.md` for contracts, budget definitions and persistence compatibility.

## 08. Policy gradients and Actor Critics - Policy Summit

Source: verified local reference for catalog `files/rl_course/9.pdf`. Detailed activity-to-slide page alignment remains UNVERIFIED; no page anchors are claimed. Implemented in task 06; see [policy contracts](POLICY_METHODS.md).

**Learning goal:** Optimize a stochastic policy directly, calculate its gradient, and distinguish actor preferences from a learned state-value critic.

1. **Observe:** inspect a softmax distribution on the deterministic Policy Summit. Check that the actor learns probabilities and the critic estimates discounted state return.
2. **Predict:** save a prediction about a positive advantage, delayed complete-return updates, and baseline variability before revealing sampled results.
3. **Play:** use the shared worker controls to collect actual episodes. Inspect current probability meters around Robo, the selected categorical draw, critic values, complete returns/advantages or TD errors, and every recorded parameter contribution. Complete an episode with real learning.
4. **Reveal the mathematics:** objective is the expected fixed-start sum of discounted rewards. Temperature-1 softmax uses the max shift; score is onehot minus probabilities. REINFORCE uses the outer gamma^t times the discounted suffix return minus an optional frozen episode baseline. Actor-critic uses a fixed one-step TD signal and the same outer discount. Calculate the new right probability 0.289335756 and the t=1 right-preference increment 0.05805 from the supplied hand fixtures.
5. **Experiment:** train REINFORCE, REINFORCE plus baseline, and one-step actor-critic for five independent seeds each at equal episode budgets, then run separate frozen softmax evaluations. Compare mean discounted evaluation returns and observed seed ranges. Real interactions can differ; this is not an equal-sample-efficiency claim. No winning method is hardcoded.
6. **Challenge:** identify the actual measured best mean (or tie) and correctly explain the critic and fixed advantage in the actor gradient. Earlier numerical policy-update checks and real activity are prerequisites to completion. Save an ungraded reflection supported by the recorded trace.

True termination has zero continuation. Actor-critic retains critic continuation at an external cap; REINFORCE skips incomplete returns, exposes skipped counts, and explains the possible selection bias. Pause/Resume and refresh preserve the exact partial episode. Reset episode retains learned parameters. Frozen evaluation samples the learned distribution and never trains. Tests include probability normalization/sampling, central finite differences, exact updates, terminal behavior, evaluation isolation and old-save compatibility. No neural dependency is introduced.

**Reflection:** Explain one recorded probability change and compare seed variability. What might a baseline help with, and what bias can an inaccurate critic introduce? Free text is saved without automatic interpretation or grading.


## 09. Deep Reinforcement Learning (1) - Deep Mountains I

Implemented in task 07. Source: public catalog 10.pdf, checked against complete extracted text and visual anchors at physical pages 11, 13, 18, 22. Original activity mapping is pending instructor approval; see [deep reference audit](DEEP_REFERENCE_AUDIT.md).

Prerequisite 08. Objectives: distinguish a shared neural action-value function from independent table entries, calculate detached terminal-aware targets, inspect actual gradients/loss/weights, and evaluate behavior separately. Scenario deep-v1 uses the shared six-position map, full normalized coordinate observation, slip .1, step −.05, goal-entry reward 1, terminal goal, external cap 60. Algorithm choices are genuine neural DQN or tabular Q; overlays show actual predictions, decisions, counts and residuals. The network is deliberately larger than the toy table, and no transfer or storage-saving claim is made.

1. **Observe:** identify a shared nonlinear Q-function with an explicit concept check.
2. **Predict:** save a table/network and loss/behavior prediction before results.
3. **Play:** Step/Episode/real-interaction batch through live replay warmup and real optimization; inspect the vector and every weight. Activity requires an actual completed rollout and optimizer updates.
4. **Reveal mathematics:** detached half-squared TD loss, SGD, terminal versus cap; worked y=1.45 and scalar bias .325, with two numerical checks and actual live batch traces.
5. **Experiment:** five independent agents each for table and DQN, default 600 equal real interactions, three frozen-evaluation checkpoints. Initialization/replay/action/environment streams and unequal warmup/update computation are recorded.
6. **Challenge:** identify the winner or tie from actual final measured means, then explain why batch loss alone does not certify policy quality. No required score or predetermined winner. Reflection saved ungraded.

Accessible HTML state/value/vector/weight/replay/loss tables accompany the canvas and charts. Keyboard controls, phone layout, refresh/resume and validated exports use the existing lesson engine. Instructor note: review activity alignment and pedagogical difficulty; this is a tiny scalar network, not an Atari reproduction. Supplied checkpoints are not used.

## 10. Deep Reinforcement Learning (2) - Deep Mountains II

Implemented in task 07 with corrected source scope. The actual catalog 14.pdf covers general value functions, auxiliary tasks, normalization, universal value functions and distributional values. Visual anchors: physical pages 6, 24, 32–33; additional text observations are explicitly distinguished in the [audit](DEEP_REFERENCE_AUDIT.md). **The requested replay/target experiment is labeled an applied bridge from part 1, 10.pdf pages 18/22. It does not purport to reproduce the part-2 deck.** Instructor approval of this split remains pending.

Prerequisite 09. Objectives: define a predictive question, distinguish an expected value from a return distribution, conduct controlled ablations, and interpret measured stability without equating low loss with policy quality. Scenario/encoder/network match lesson 09. Three variants use replay+target, chronological batches+target, or replay+online bootstrap, with matched batch/warmup, network initialization roots, learning rate, epsilon, discount and real budgets. No C51, quantile, GVF, auxiliary-task, UVFA or PopArt learner is claimed.

1. **Observe:** GVF cumulant/discount/policy, auxiliary-task gradient/scale tradeoffs, normalization, goal conditioning and distributional prediction. Concept check: empirical evaluation returns do not turn scalar DQN into a distributional network.
2. **Predict:** record expected replay/target effects and uncertainty before results.
3. **Play:** train scalar DQN live; inspect actual network values, target copies, replay samples and updates.
4. **Reveal mathematics:** revisit detached neural backups, then calculate a GVF cumulant return (1.5) and categorical support expectation (.75). Worked distributions are labeled supplied examples, not learned outputs.
5. **Experiment:** five independent agents per variant, default 600 equal real interactions and three evaluation checkpoints. Inspect unsmoothed last-256 losses, gradients, Q magnitudes, target/replay counters and empirical evaluation-return variance. Failures preserve configuration, seed, interaction and last finite checkpoint; incomplete experiments earn no completion.
6. **Challenge:** use measured final means for the evidence question and distinguish descriptive finite-run stability from convergence. Reflection discusses source scope and observed variability, saved without grading.

Accessibility and persistence follow lesson 09. Instructor note: richer-prediction algorithms are conceptual extensions, not neural implementation claims. A human course/pedagogy review and student pilot remain outstanding.


## 11. Mimic learning - Demonstration Village

Source: `files/rl_course/11.pdf`; PDF page anchors pending.

**Learning goal:** Learn actions from demonstrations and distinguish supervised fitting from reward optimization. Prerequisite 10. Source scope and verified physical-page anchors are documented in docs/IMITATION_REFERENCE_AUDIT.md; this is an original activity, not a complete reproduction of the Imitation Learning and RLHF deck.

1. **Observe:** inspect the static six-position island and distinguish demonstrated action labels from rewards and successor states. Concept check: actions provide cloning labels. Explain cloning, inverse RL, DAgger and preference learning as distinct ideas; only cloning and compatible RL initialization run here.
2. **Predict:** save expectations about missing-state behavior and imitation initialization before recording/fitting results. Prediction text is not graded.
3. **Play:** manually record lower-start training and upper-start held-out trajectories using keyboard/touch; inspect aligned traces, collisions, seeds, terminal/capped/partial ends. Fit a tabular softmax policy with genuine full-batch cross-entropy updates. Review train/held-out loss and classification accuracy separately, all state probabilities, and the actual last gradient update.
4. **Reveal the mathematics:** work the single-example alpha-.5 update to preferences [−.125,.375,−.125,−.125], then check .375 and −.125. Explain averaged gradients, missing-state zero gradients and the exact actor transfer. Actor-critic bootstraps external cutoffs and masks true termination.
5. **Experiment:** evaluate the frozen cloned policy, then run five scratch and five imitation-initialized actor-critic agents with equal new real-interaction budgets (default 600; allowed 60–1,500). Report additional demonstration actions and supervised passes. Use separate five-seed familiar/upper-start evaluations, actual unseen-state traces, raw training rows and returned policy checkpoints. Pause/Resume/Cancel operate the shared worker; incompatible experiments remain separate.
6. **Challenge:** identify the measured upper-start mean-return winner or tie and explain why unseen states receive no cloning gradient. Complete activities and checks; there is no guaranteed winning method or reward threshold. Save a reflection without semantic grading.

**Representation and transfer:** complete position keys on the same fixed layout, four actions in up/right/down/left order. Copy cloned actor preferences only; initialize critic, counters and RL RNGs afresh. No unrelated neural/Q-table weights are transferred. Upper-start evaluation tests a changed start distribution, not a changed map. All held-out demonstration trajectories are excluded from supervised gradients and stopping decisions.

**Persistence:** validated demonstration import/export and existing learning backup (04–11), additive schema compatibility, exact active-manual-recording resume, immutable fitted datasets and up to three retained experiment versions. Cancelled or interrupted comparison orchestration remains incomplete; it does not resume invisibly. Saved fit/return/completion evidence is local and self-reported. Source/instructor approval and real-student calibration remain pending.

## Cross-cutting missions and final expedition

Exploration, reward specification, bias/variance, and stability recur where their prerequisites exist. They are not extra required lecture numbers. Optional multi-agent cooperation is a future extension with a separate joint-action environment contract; do not include it in the initial release merely because it appeared in the earlier conceptual outline.

The final expedition is a learning capstone, not a replacement for the official final-project requirements. Students specify the state, action space, objective/reward, learning method, training budget, and evaluation track. The export includes both numerical results and a short rationale.

State the evaluation track before training: (A) known-map policy evaluated under fresh stochastic rollouts; (B) adaptation to new maps with a fixed retraining budget; or (C) zero-shot transfer using observations that encode the new map/task. A fixed coordinate Q-table is eligible for A and B, not automatically C.

## Approval workflow

Record actual slide titles and page ranges during the source audit. Where the current catalog, older duplicate record, general syllabus, or linked PDFs disagree, keep the discrepancy in the source audit and obtain instructor confirmation before teaching that item as required. Do not publish copied course PDFs or third-party slides without permission; linking and original paraphrased explanations are the default.
