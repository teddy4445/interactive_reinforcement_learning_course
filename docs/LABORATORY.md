# Laboratory and Final Expedition implementation

Task 09 adds the general laboratory without replacing the eleven guided lessons. Production remains static HTML/CSS/vanilla JavaScript. All training uses the existing environment, learner registry, seeded worker and frozen evaluator.

## Sandbox contract

The ASCII editor accepts 2–12 rectangular rows/columns, floor, walls, goals, hazards and consumed supplies. Start coordinates, slip, additive rewards, battery capacity, finite task horizon, observation and external cap are explicit. Rewards are bounded to ±100; the Cartesian state upper bound is limited to 50,000. A geometric flood-fill reports unreachable goals and requires an explicit intentional-unreachable choice. This check ignores consumable budgets and does not promise success.

True state always retains position and every enabled inventory/battery/time variable. Full observation retains them; position-only observation is explicitly partial when dynamic features exist. Tabular learners can illustrate that aliasing. The deterministic Dyna model rejects slip/partial observations. Linear encoders require full observations; their aliased representation is a deliberate separate ablation. DQN currently supports static position tasks only because its tested diagnostic/cache path enumerates positions. Unsupported combinations produce explanations.

The existing MC, TD, SARSA, Q-learning, linear TD/SARSA, Dyna-Q, REINFORCE, baseline REINFORCE, actor-critic and small CPU DQN are selectable within those contracts. Prediction methods use a specified right/uniform policy and are not listed as control competitors. Method-irrelevant controls are disabled. Softmax methods sample learned probabilities with epsilon zero. DQN remains lazy and uses the existing bounded replay/target configuration.

Each editor application creates a separate experiment version. A preview disables active training/evaluation until the student returns to the saved configuration or creates a new experiment. Step, Episode and real-interaction batch training use one worker. Pause/Resume/Cancel remain available for its active job. Reset episode preserves parameters; Reset learning confirms creation of a fresh version and retains the old artifact. Failed neural runs show the actual error and preserve an available checkpoint. No prerecorded model is substituted.

The map has an accessible cell list. Inspectors expose true state, observation, actual feature values, recorded action/update trace, parameters and visits. Training curves show raw episode return and a trailing arithmetic mean of up to seven completed/capped episodes; interrupted episodes remain in the raw table and export. Each Sandbox evaluation stores its own training-interaction/update counts, parameter hash, action rule and evaluation wall time, so later training does not relabel old results.

## Compare protocol

Choose two to four distinct control methods and two to five distinct training seeds (three by default), a shared map/rewards/observation/discount/cap, and 60–5,000 new real interactions per agent. Parameter differences are in each immutable configuration; Dyna planning work and neural minibatch updates are not called additional real samples.

Each method/seed starts from a fresh learner/environment/RNG and is evaluated at ceil(B/3), ceil(2B/3), and B real interactions. Evaluation uses five fresh seeds derived from root 9001, detached parameters, no learning and the recorded greedy/softmax rule. All requested slots remain present, including failed, pending or cancelled runs. A terminal comparison status means all requested slots were attempted, not that every method succeeded.

Curves contain actual agent-level evaluation means at those three budgets, with no smoothing. Tables report mean return, success fraction, episode length, sample standard deviation and observed min/max across completed independent agents, along with the completed/requested denominator. Failed agents are listed separately rather than assigned fabricated returns or quietly omitted. There is no confidence-interval or universal-winner claim. Seed reuse does not imply identical trajectories.

Raw training episodes and evaluation rows remain in JSON and CSV. Real interactions, learner updates, simulated planning updates and wall time are separate. Wall time includes initialization, training, evaluation, message/queue delays and pauses. Neural updates are minibatches; counts are not directly interchangeable with tabular backups. Saved replicate agents can be opened as separate exact-continuation records with source provenance, without changing the original comparison.

## Notebook and storage

The archive filters scenarios, experiments, comparisons, expeditions, saved agents, predictions, reflections and lesson records, with title/note search and reopening. Notes are escaped text and are never semantically graded. It supports individual laboratory JSON, a combined Notebook JSON envelope preserving existing lesson export formats, a long-form laboratory CSV and a complete raw-record Notebook CSV. CSV is export-only; spreadsheet formula prefixes are escaped.

All supported JSON is bounded, versioned and checksum-checked before mutation. Known record keys/types, arrays, finite values, maps, configurations, checkpoints, budgets, seed suites and completion evidence are validated. Duplicate IDs require explicit replacement; unknown versions, executable fields, prototype keys, duplicate JSON fields and malformed records are rejected. A checksum detects corruption; it is not a signature or authentication. Import never loads code, model URLs or arbitrary topology.

Laboratory artifacts live in IndexedDB `rl-island-laboratory` version 1, with a small localStorage index. Limits are 30 artifacts, 16 MiB per laboratory export and 32 MiB per combined Notebook backup. Individual learner checkpoints retain the existing 1.5 MB safety bound. Runs also retain the existing 2,000-episode / 2,000,000-interaction ceilings; hitting a ceiling stops the run with an explicit error rather than silently dropping raw episodes. A very short-episode comparison can therefore fail before its requested budget, and that failed replicate remains listed. Larger lesson histories (over 65,536 serialized characters) use the existing learning database upgraded to version 2, in a separate `progress` store. A small schema-2 localStorage pointer is written only after the full IndexedDB transaction commits. Existing checkpoint keys stay in their own store. Legacy schema-1 lesson backups remain accepted/exported; small lesson records are unchanged. A failed migration retains the old localStorage copy. Unavailable/unsupported storage is protected, reported explicitly and falls back to memory plus export. A pending asynchronous write is visibly announced. If legacy activity records reference an unavailable checkpoint, export lists its missing ID and explicitly labels the agent backup incomplete; available activity records and models remain exportable. Browser storage is not a permanent backup.

## Final Expedition tracks

The student chooses the scenario, representation, rewards, algorithm and hyperparameters, records a prediction and trains a source policy. Evaluation uses root 7001, five frozen episodes, with source/target configurations, parameter hashes, budgets, times and concept attempts in the export.

- **Known-map:** exact trained scenario/configuration and parameters; no new updates.
- **New-map adaptation:** only the explicitly supported local-goal linear SARSA representation; weights transfer, while target visits, traces, RNGs and counters start fresh. An additional 60–5,000 target interactions are charged separately before frozen evaluation.
- **New-map zero-shot:** the same compatible weights are evaluated on the target layout with zero target training updates. Source and target have one goal, static full observations, identical dimensions/feature normalization, unchanged rewards and discount, and a different layout.

The local-goal encoder exposes twelve scaled features: bias, relative goal x/y, normalized goal distance, and neighboring wall/boundary and hazard flags in stable action order. The declared static map supplies these observations; no transition function is queried. Unlike a coordinate-only table, the input changes with local geometry or goal position. It can still alias situations and fail; no transfer success is assumed. Coordinate tables, tabular actors, plain coordinate linear features and the current coordinate DQN have no supported new-layout transfer contract here and are rejected.

The guided criterion is at least 600 source interactions, success in at least four of five fresh frozen episodes, a prior prediction, and correct concepts about freezing, task state and the selected evaluation track. It uses actual calibration runs from `scripts/calibrate-laboratory.mjs`, with every seed retained. Custom maps and rewards change difficulty, so this is not comparable grading across student-created tasks. Failed attempts persist; reflections are ungraded. Public client-side seeds are not secret tests and repeated exploration is not an untouched final holdout.

No deployment, hosting integration, service worker or live ACML modification is part of this task. Lecture mode and release hardening remain later milestones.
