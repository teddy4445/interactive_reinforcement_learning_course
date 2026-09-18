# Shared environment engine — tasks 02–04

This module is the single simulation implementation for the manual lab, guided lessons 01–05, planning, sampled learning, independent comparisons and frozen evaluation. Planners enumerate its model; model-free agents consume samples only. See [LESSON_RUNTIME.md](LESSON_RUNTIME.md) and [MODEL_FREE.md](MODEL_FREE.md) for integrations.

## API and module boundaries

`src/environment/engine.js` exports `IslandEnvironment`. Construction validates a version-1 scenario and accepts `{ seed, rolloutLimit }` (defaults: 1 and 80).

- `reset({ seed?, rolloutLimit? })` restores the declared start, enabled feature state, environment RNG, counters, and return. It returns `{ state, observation, info }`.
- `step(action)` returns fresh state/observation snapshots, reward, terminated/truncated flags, info, whether a transition advanced, and a trace. Stopped episodes return reward 0, advanced false, and trace null without changing state, counters, or RNG.
- `getState()`, `getObservation()`, `getScenario()`, and `getSnapshot()` return detached snapshots. The renderer never receives the live mutable state.
- `getModel()` grants explicit privileged access to pure `transitions(state, action)`, the stable action order, state fields, and scenario identity. Inspection consumes no randomness.
- `serialize()` and `IslandEnvironment.deserialize(text)` checkpoint and restore the complete environment, including its current RNG state. Neither method saves or loads learning parameters.

`src/environment/model.js` defines the only transition/reward calculation. Both exact model inspection and sampled stepping use it. Independent hand-calculated and sampling-frequency fixtures test the model and sampling separately.

`src/environment/schema.js` validates maps/states and implements the explicit tabular state-key encoder, `stateKey`. `src/rendering/island-renderer.js` accepts snapshots and contains only drawing, accessible cell descriptions, and hit testing; it cannot advance an episode. `src/app/manual-session.js` owns the live environment and a separate parameter container. The free manual lab does not train an agent. Task-04 learning sessions own actual learned tables separately in `TrainingRun`; episode reset preserves them.

## Version-1 map/state schema

The three bundled maps in `src/content/scenarios.js` are Base Camp (deterministic), Slippery Shore (slip 0.2), and Collection Inlet (deterministic, one collectible). The first two have position-only true state. All are 8×8 with the same walls, start, hazard, and goal; Collection Inlet adds a supply tile. They are original environment fixtures, not slide-derived claims.

A scenario includes schemaVersion, id, name, description, grid, start, slip, all five reward values, explicit feature configuration, and observation mode. Grids accept 2–40 rows/columns, rectangular ASCII tiles, at least one goal, and an ordinary-floor start:

| Tile | Meaning |
|---|---|
| `.` | Walkable floor |
| `#` | Wall |
| `G` | Absorbing goal |
| `H` | Nonterminal hazard |
| `C` | Supply rewarded once per episode |

Coordinates are zero-based: x increases rightward, y downward. Action order is always up, right, down, left.

True state is `{ x, y }`, plus **every enabled** state feature:
- `collected`: row-major consumed-collectible bit mask, with at most 12 supplies.
- `battery`: remaining battery when the scenario declares a positive initial battery.
- `remaining`: remaining actions when a finite task horizon is enabled.

Battery and finite task time decrement on every accepted action, including collisions. Reaching zero genuinely terminates the task; simultaneous termination uses goal, then battery, then horizon as its displayed reason. Goal semantics do not depend on whether supplies were collected. External rollout counters and RNG state are environment bookkeeping, not MDP state. Weather/dynamic-obstacle features are unsupported and rejected as unknown schema fields.

The full observation copies all enabled state fields and labels `partial: false`. Position observation returns only x/y and labels `partial: true` if any enabled state fields were hidden. Future model-free agents should receive only observations and transition samples. The teaching inspector clearly identifies privileged true state separately from the agent observation.

## Transition and reward semantics

Intended direction has probability 1 − slip; clockwise and counterclockwise perpendicular directions each have probability slip/2. A boundary or wall collision stays in place. Equal resulting states and reward components merge into one outcome, retaining the individual movement branches and their unconditional probabilities. At a top-left corner, action up with slip 0.2 yields 90% stay and 10% right; a wall on the right merges all branches to 100% stay.

Rewards add rather than replace:
- Step cost: −1 on every accepted transition.
- Collision: additional −2.
- Goal entry: additional +20, so the entry transition gives +19.
- Occupying a hazard after an action: additional −5, including a blocked action while on the hazard.
- First visit to a supply: additional +4, so collecting it on an otherwise ordinary move gives +3.

Later visits to consumed supplies give no supply reward. Episode reset restores supplies. Terminal states are absorbing in the model and never award the goal reward again.

An external rollout cap stops further sampling with `truncated: true`, `terminated: false`; the nonterminal state's exact model still exposes future transitions. Reaching a genuine terminal state on the cap sets terminated true and truncated false. No learning target or bootstrap calculation is performed in this milestone.

## Reproducibility

The documented PRNG is `xorshift32-v1`: unsigned 32-bit xorshift with shifts 13, 17, 5 and output divided by 2^32. Root seeds accept all uint32 integers. Raw RNG seed zero maps to 0x6d2b79f5 to avoid an absorbing zero stream.

Streams derive independently by FNV-1a-32 over ASCII `rl-island/v1|ROOT_SEED|STREAM`, using the same nonzero fallback for a zero hash. Stream names are environment, agent, replay, and network. Only the environment stream is consumed by this task. Future consumers must own their separate RNG/checkpoints; the environment never chooses an agent action.

Every accepted step consumes exactly one environment draw, even on deterministic maps. The draw selects a merged outcome by cumulative probability in canonical branch order, then resolves the actual movement within that outcome using the draw's offset. A pause, inspection, redraw, resize, setting change, or stopped step consumes none. Episode reset with the same seed replays the same actions exactly. To start an independent episode, a caller supplies its explicit next seed; task 02 makes no unimplemented episode-seed-scheduling claim.

Each actual trace stores before/after true state and observation, chosen action, actual movement/collision, reward and its components, exact pre-step outcomes/probabilities, random draw, step index, scenario identity, and termination/truncation reason. The UI formats this trace without recalculating rewards. Session history is bounded to the most recent 100 transitions.

## Controls and lifecycle

- Arrow keys/WASD while the map or direction pad is focused: one accepted action per key press (held-key repeats ignored). Touch direction buttons move once.
- Step: execute the selected next action once.
- Run/Pause: repeat the selected direction immediately and then every 500 ms / stop repeats. This is manual repetition, not training. Returning from pause continues the same RNG.
- Reset episode: restore start, features, counters, trace, and the same environment seed. Preserve the separate parameter store.
- Reset learning: require a confirmation dialog and clear only the parameter store. Preserve position, environment RNG, counters, and current trace.
- Applying a seed or switching an island starts a fresh environment episode. These actions award no progress.
- Route changes dispose the current controls/timer/resize observer and pause Run. The same memory session is reused across all eleven workspaces. Hiding the page pauses repeats.
- Canvas hit testing and the keyboard-operable text map inspect cells without moving Robo. The live region announces accepted action, actual movement, reward, and next position. Narrow layouts expose inspector/results through keyboard-operable tabs.

The renderer has no animation clock or random effects. Browser tests compare accepted transitions across different viewport redraws and reduced-motion settings; they do not claim a trained Q-table or frame-rate performance benchmark.

## Persistence and limits

In the free manual lab (`#/practice`), Save environment explicitly writes one checkpoint under `rl-island:environment:v1`, replacing the previously saved checkpoint. Load validates first and asks before replacing the active episode. The free manual lab does not auto-load or award lesson progress. Its page refresh starts a fresh memory episode until the user explicitly loads the checkpoint. Guided lessons separately save and replay their current episode as part of activity progress.

Checkpoints contain format/schema/engine version, canonical scenario and identity, state fields, action order, true state, root seed, current environment RNG, steps, reward sum, cap, and termination flags. They do not contain prior trace rows, student progress, algorithms, learning parameters, or grades.

Parsing is bounded to 64 KiB and checks known fields, types/ranges, supported versions, grid/state consistency, consumed features, battery/time versus counters, termination flags, and initial-state/seed consistency. Replacement is atomic on failure. Local-storage errors keep the memory session usable; unrelated host keys are preserved. Scenario metadata is rendered as text. The map identity is a noncryptographic versioned FNV checksum for configuration matching, **not** authentication. A checkpoint is user-editable data; its historical reward/trajectory is not independently authenticated.

Exact planning and task-04 model-free checks are implemented. Later algorithms remain out of scope. Executed checks and visual evidence are in `TASK_STATUS.md` and `evidence/task-04/`; earlier evidence is preserved.

