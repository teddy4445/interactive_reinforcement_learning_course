# Lesson 11: demonstrations and compatible policy initialization

The task-08 implementation uses the shared `IslandEnvironment`, existing tabular softmax actor, actor-critic learner, chunked training worker and local learning backup. Production remains static vanilla JavaScript. There is no new dependency or neural download for this lesson.

## Data and split

`src/imitation/demonstrations.js` records the engine's complete transition trace. Each action label belongs to the pre-action observation; the true state, successor observation, reward, terminal/cutoff flags, transition probabilities and RNG draw remain available for review. Manual recording supports keyboard and touch, collisions, partial stops, true goal termination and an external 80-step cap. An active recording persists after every action and can resume after refresh.

Both scenarios use a deterministic six-position map, complete position observation, actions up/right/down/left, −0.05 per ordinary action and +1 on goal entry (step plus bonus). Training demonstrations start at (0,1); held-out demonstrations and upper-start evaluation begin at (0,0). Coordinates retain identical semantics. This is a same-layout start-distribution test, not zero-shot transfer to a new layout.

Splits are declared at trajectory creation. Whole held-out trajectories stay out of the supervised optimizer. Learners may deliberately collect broader training coverage; missing-state flags reflect the actual dataset rather than an assumed path. Supplied route suggestions are instructions for manual recording, not preloaded demonstrations. Test-generated data are explicitly developer QA artifacts.

Standalone demonstration JSON includes format/schema, representation, exact action order, split, seeds, trajectories and a corruption checksum. The parser rejects unsupported/extra keys, oversized or malformed JSON, prototype-related keys, duplicate IDs, non-replaying observations/actions, false termination and incompatible action order. Limits: 16 trajectories, 1,024 transitions, 80 transitions per trajectory, 1.5 MB file. Import validates completely before a review dialog adds a separate experiment; it does not overwrite prior results.

## Actual supervised learning

`BehaviorCloner` fits independent per-state softmax preferences by full-batch cross-entropy gradient descent. The gradient sums `(onehot(action) − probability) / N` over **training** examples only. Fixed epochs (1–300) and alpha are chosen before fitting. Zero logits are the explicit initial condition; no randomness or reward optimization enters fitting. Small batches of epochs yield on the main thread. Cross-entropy uses stable log-sum-exp. Epoch 0, epoch 1, every tenth epoch and the last epoch are retained without smoothing.

The worked one-example update at alpha 0.5 is [−0.125, +0.375, −0.125, −0.125], right probability about 0.354661, loss about 1.036592 versus log(4). Numerical tests independently check finite differences, reduction of fixture loss, holdout exclusion and compatible transfer. Supervised accuracy uses deterministic argmax/tie order solely as a classification diagnostic; deployed behavior samples the softmax distribution.

Unobserved state preferences remain zero and probabilities remain uniform. The inspector lists all five nonterminal states, coverage, logits and probabilities. Each frozen evaluation's first rollout exposes actual sampled probabilities, RNG draw, action, reward, successor and whether the state was absent from training demonstrations.

## Transfer and comparison

Transfer is defined only for representation `full-position-softmax-v1`, action order up/right/down/left and the same task layout. The actor preferences are copied exactly into actor-critic. The critic, visits, errors, episode counters, RNGs and RL update counters start fresh. No Q-table, linear-feature model or neural network receives these weights. The complete learning backup includes the fitted actor, its dataset/configuration provenance and RL checkpoints; fitted weights are initialization/inference data, while each RL checkpoint contains continuation state.

The comparison first evaluates the frozen cloned policy without any RL. It then trains five scratch and five imitation-initialized actor-critic agents at 60–1,500 **new real interactions** each (default 600), using seeds 11,29,47,83,101. Policy-v1 actor-critic uses alpha .1, gamma .9, cap 80, a zero terminal bootstrap and retained continuation at external cutoffs. Each real transition gives one actor contribution and one critic update; the exact final partial rollout is retained. Training uses the existing worker with Pause/Resume/Cancel and stale-response protection.

Both methods receive the same new RL budget. Cloning additionally costs the displayed training-demonstration actions and supervised-example passes. This is not equal total human effort/data/computation. The five RL replicates share one fitted dataset; they do not establish variability over independent demonstration datasets.

Evaluation uses fresh seeds 701,709,719,727,733, separate action RNG streams and detached parameters with no learner API. Familiar and upper-start results are separate, with raw return, discounted return, success, length, termination/cap and unseen-state visit counts. Classification loss/accuracy, genuine training episode returns and frozen evaluation returns are three different measurements. No smoothing or confidence-interval claim is made. The challenge computes the observed upper-start mean-return winner or tie, rather than prescribing an algorithm winner. Public teaching seeds are not secret tests; reuse across experiments can support exploratory comparison, not an untouched final test set.

## Lesson and persistence

The adapter uses the common six stages, content/algorithm separation, activity checks, local learning store and notebook/export. Navigation never earns completion. Initial and comparison predictions precede results. Reflections are escaped and stored without semantic grading. Completion requires the concept check, prediction, a genuine fit on recorded train/held-out trajectories, two numerical answers, a completed ten-agent comparison and the evidence/concept challenge. There is no required return threshold.

Fitting seals a dataset. New experiments retain earlier datasets and results, up to three versions, so changed demonstrations never silently merge curves. Cancelled comparisons retain only fully finished replicates and cannot satisfy completion. Leaving the route cancels the worker. Refresh keeps finished evidence and marks interrupted comparisons cancelled; it does not promise exact continuation of the ten-agent comparison orchestration. Active manual trajectories do resume exactly.

Lesson 11 is an additive optional field in the existing schema-1 learning store. Old 04–10 backups remain valid, absent lessons are preserved when importing, and foundation 01–03 storage is unchanged. Validation recomputes supervised fitting and frozen evaluation (with tiny cross-browser numerical tolerance) and checks saved worker checkpoints, budgets and initialization identities. These checks detect inconsistent data; exports remain self-reported, not authenticated grades. Storage failures keep memory-only work and report the need to export.
