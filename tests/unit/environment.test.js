import { describe, expect, test, vi } from 'vitest';
import { IslandEnvironment } from '../../src/environment/engine.js';
import { ACTIONS, initialState, observe, scenarioHash, stateFields, stateKey, validateScenario, validateState } from '../../src/environment/schema.js';
import { createRng, createRandomStreams, deriveSeed } from '../../src/environment/rng.js';
import { transitions } from '../../src/environment/model.js';
import { scenarios } from '../../src/content/scenarios.js';
import { ManualSession, ParameterStore } from '../../src/app/manual-session.js';
import { loadEnvironment, saveEnvironment, ENVIRONMENT_KEY } from '../../src/persistence/environment-checkpoint.js';
import { describeCell, hitTest } from '../../src/rendering/island-renderer.js';

// Small, independently hand-solvable fixtures; no learned or student results.
const tiny = (overrides = {}) => validateScenario({
  ...scenarios[0], id: 'fixture', grid: ['..G', '...'], start: { x: 0, y: 0 }, ...overrides,
});
const options = { seed: 42, rolloutLimit: 200 };
const actions = ['up', 'right', 'down', 'left', 'left', 'up', 'right', 'down'];
const trace = (environment, sequence = actions) => sequence.map((action) => environment.step(action));

describe('versioned RNG and independent streams', () => {
  test('xorshift32 matches a fixed external integer sequence and restores its future', () => {
    const rng = createRng(1);
    expect(Array.from({ length: 5 }, () => rng.next() * 2 ** 32)).toEqual([270369, 67634689, 2647435461, 307599695, 2398689233]);
    const checkpoint = rng.snapshot(), future = Array.from({ length: 30 }, () => rng.next());
    rng.restore(checkpoint);
    expect(Array.from({ length: 30 }, () => rng.next())).toEqual(future);
  });
  test('agent/replay/network consumption never advances the environment stream', () => {
    const a = createRandomStreams(73), b = createRandomStreams(73);
    for (let i = 0; i < 100; i++) { a.agent.next(); a.replay.next(); a.network.next(); }
    expect(Array.from({ length: 100 }, () => a.environment.next())).toEqual(Array.from({ length: 100 }, () => b.environment.next()));
    expect(new Set(['environment', 'agent', 'replay', 'network'].map((name) => deriveSeed(73, name))).size).toBe(4);
  });
  test('zero is an accepted root seed, invalid seeds and RNG versions are rejected', () => {
    expect(createRng(0).next()).toBeGreaterThan(0);
    for (const seed of [-1, 2 ** 32, NaN, Infinity, 1.5, '1']) expect(() => createRng(seed)).toThrow();
    const rng = createRng(1);
    expect(() => rng.restore({ algorithm: 'other', state: 1 })).toThrow();
    expect(() => rng.restore({ algorithm: 'xorshift32-v1', state: 0 })).toThrow();
  });
});

describe('map, state, and observation contracts', () => {
  test('shipped early maps are position-only and versioned; collectible map declares its mask', () => {
    expect(stateFields(scenarios[0])).toEqual(['x', 'y']);
    expect(stateFields(scenarios[1])).toEqual(['x', 'y']);
    expect(stateFields(scenarios[2])).toEqual(['x', 'y', 'collected']);
    expect(scenarioHash(tiny())).toBe(scenarioHash(tiny()));
    expect(scenarioHash(tiny({ slip: .2 }))).not.toBe(scenarioHash(tiny()));
  });
  test.each([
    { schemaVersion: 2 }, { grid: ['..G', '..'] }, { grid: ['...', '...'] },
    { grid: ['.XG', '...'] }, { start: { x: 2, y: 0 } }, { slip: -.1 }, { slip: NaN },
    { grid: ['.CG', '...'] }, { features: { collectibles: true, battery: null, horizon: null } },
    { rewards: { ...scenarios[0].rewards, goal: Infinity } }, { observation: 'invented' },
  ])('rejects invalid map fixture %j', (change) => expect(() => tiny(change)).toThrow());
  test('enabled variables are in true state, keys, full observations, and model state schema', () => {
    const map = tiny({ grid: ['.CG', '...'], features: { collectibles: true, battery: 5, horizon: 3 } });
    const environment = new IslandEnvironment(map, options);
    expect(environment.getState()).toEqual({ x: 0, y: 0, collected: 0, battery: 5, remaining: 3 });
    expect(environment.getModel().stateFields).toEqual(['x', 'y', 'collected', 'battery', 'remaining']);
    expect(stateKey(environment.getState())).toBe('0,0|c=0|b=5|t=3');
    expect(environment.getObservation()).toEqual({ ...environment.getState(), partial: false });
    expect(observe({ ...map, observation: 'position' }, environment.getState())).toEqual({ x: 0, y: 0, partial: true });
    expect(observe(tiny({ observation: 'position' }), { x: 0, y: 0 }).partial).toBe(false);
    expect(() => validateState(map, { x: 0, y: 0 })).toThrow();
    expect(() => validateState(map, { x: 1, y: 0, collected: 0, battery: 4, remaining: 2 })).toThrow();
  });
  test('snapshots, observations, map and model output cannot mutate the live environment', () => {
    const input = tiny(), environment = new IslandEnvironment(input, options);
    const original = environment.serialize();
    input.grid[0] = '###';
    environment.getState().x = 99;
    environment.getObservation().x = 99;
    environment.getScenario().grid[0] = '###';
    const model = environment.getModel();
    model.actions.push('invalid');
    model.transitions({ x: 0, y: 0 }, 'right')[0].nextState.x = 99;
    expect(environment.serialize()).toBe(original);
    expect(environment.getModel().actions).toEqual(ACTIONS);
    expect(() => environment.step('jump')).toThrow();
    expect(() => model.transitions({ x: 0, y: 0, battery: 5 }, 'right')).toThrow();
  });
});

describe('independent transition/reward fixtures', () => {
  test('bounds and walls stay in place with step plus collision cost', () => {
    const environment = new IslandEnvironment(scenarios[0], options);
    expect(environment.step('right')).toMatchObject({ state: { x: 1, y: 6 }, reward: -3, trace: { collision: true, rewardParts: { step: -1, collision: -2 } } });
    const edge = new IslandEnvironment(tiny(), options);
    expect(edge.step('up')).toMatchObject({ state: { x: 0, y: 0 }, reward: -3 });
    expect(edge.step('left')).toMatchObject({ state: { x: 0, y: 0 }, reward: -3 });
  });
  test('ordinary movement, hazard entry/occupancy, and goal entry include every reward part', () => {
    const environment = new IslandEnvironment(tiny({ grid: ['.HG', '...'] }), options);
    expect(environment.step('right')).toMatchObject({ reward: -6, trace: { rewardParts: { step: -1, collision: 0, hazard: -5, goal: 0, collectible: 0 } } });
    expect(environment.step('up')).toMatchObject({ reward: -8, trace: { collision: true, rewardParts: { step: -1, collision: -2, hazard: -5 } } });
    expect(environment.step('right')).toMatchObject({ reward: 19, terminated: true, truncated: false, trace: { reason: 'goal', rewardParts: { step: -1, collision: 0, hazard: 0, goal: 20, collectible: 0 } } });
    expect(environment.getInfo().totalReward).toBe(5);
  });
  test('goal is absorbing with zero repeated reward, steps, and RNG draws', () => {
    const environment = new IslandEnvironment(tiny(), options);
    environment.step('right'); environment.step('right');
    const checkpoint = environment.serialize();
    expect(environment.getModel().transitions({ x: 2, y: 0 }, 'left')).toMatchObject([{ probability: 1, nextState: { x: 2, y: 0 }, reward: 0, terminated: true }]);
    for (const action of ACTIONS) expect(environment.step(action)).toMatchObject({ advanced: false, trace: null, reward: 0, terminated: true, truncated: false });
    expect(environment.serialize()).toBe(checkpoint);
  });
  test('hand-computed corner probabilities merge both blocked movements', () => {
    const model = new IslandEnvironment(tiny({ slip: .2 }), options).getModel();
    const outcomes = model.transitions({ x: 0, y: 0 }, 'up');
    expect(outcomes).toHaveLength(2);
    expect(outcomes[0]).toMatchObject({ probability: .9, nextState: { x: 0, y: 0 }, reward: -3, movements: [{ action: 'up', probability: .8, collision: true }, { action: 'left', probability: .1, collision: true }] });
    expect(outcomes[1]).toMatchObject({ probability: .1, nextState: { x: 1, y: 0 }, reward: -1 });
    const blocked = transitions(tiny({ grid: ['.#G', '...'], slip: .2 }), { x: 0, y: 0 }, 'up');
    expect(blocked).toHaveLength(1);
    expect(blocked[0].probability).toBe(1);
    expect(blocked[0].movements).toHaveLength(3);
  });
  test('all shipped walkable states/actions have normalized probabilities and valid next states', () => {
    for (const scenario of scenarios) {
      for (let y = 0; y < scenario.grid.length; y++) for (let x = 0; x < scenario.grid[0].length; x++) {
        if (scenario.grid[y][x] === '#') continue;
        const state = { ...initialState(scenario), x, y, ...(scenario.features.collectibles ? { collected: 1 } : {}) };
        for (const action of ACTIONS) {
          const outcomes = transitions(scenario, state, action);
          expect(outcomes.reduce((sum, item) => sum + item.probability, 0)).toBeCloseTo(1, 14);
          for (const outcome of outcomes) {
            expect(outcome.probability).toBeGreaterThan(0);
            expect(outcome.movements.reduce((sum, item) => sum + item.probability, 0)).toBeCloseTo(outcome.probability, 14);
            expect(validateState(scenario, outcome.nextState)).toEqual(outcome.nextState);
          }
        }
      }
    }
  });
  test('sampled frequencies agree with independently expected 80/10/10 outcomes', () => {
    const counts = { '1,0': 0, '0,1': 0, '0,0': 0 }, movements = { right: 0, down: 0, up: 0 };
    const map = tiny({ slip: .2 });
    for (let seed = 0; seed < 10000; seed++) {
      const result = new IslandEnvironment(map, { seed }).step('right');
      counts[stateKey(result.state)]++;
      movements[result.trace.movement]++;
      expect(result.reward).toBe(result.state.x === 0 && result.state.y === 0 ? -3 : -1);
    }
    expect(counts['1,0'] / 10000).toBeCloseTo(.8, 1);
    expect(counts['0,1'] / 10000).toBeCloseTo(.1, 1);
    expect(counts['0,0'] / 10000).toBeCloseTo(.1, 1);
    expect(movements).toEqual({ right: counts['1,0'], down: counts['0,1'], up: counts['0,0'] });
  }, 15000); // Statistical fixture, not a five-second performance benchmark.
  test('sampled movement labels within a merged collision preserve branch frequencies', () => {
    const counts = { up: 0, left: 0, right: 0 }, map = tiny({ slip: .2 });
    for (let seed = 0; seed < 10000; seed++) {
      const result = new IslandEnvironment(map, { seed }).step('up');
      counts[result.trace.movement]++;
      expect(result.trace.collision).toBe(result.trace.movement !== 'right');
    }
    expect(counts.up / 10000).toBeCloseTo(.8, 1);
    expect(counts.left / 10000).toBeCloseTo(.1, 1);
    expect(counts.right / 10000).toBeCloseTo(.1, 1);
  }, 15000); // Keep 10,000 seeds; allow contention from concurrent browser checks.
  test('slip endpoints use only supported branches', () => {
    expect(transitions(tiny(), { x: 0, y: 0 }, 'right')).toHaveLength(1);
    const outcomes = transitions(tiny({ slip: 1 }), { x: 0, y: 0 }, 'right');
    expect(outcomes.map((item) => item.probability)).toEqual([.5, .5]);
    expect(outcomes.flatMap((item) => item.movements).map((item) => item.action)).toEqual(['down', 'up']);
  });
  test('collectibles cannot be farmed, survive save/load, and return only on episode reset', () => {
    const environment = new IslandEnvironment(scenarios[2], options);
    expect(environment.step('up')).toMatchObject({ state: { x: 1, y: 5, collected: 1 }, reward: 3 });
    const resumed = IslandEnvironment.deserialize(environment.serialize());
    resumed.step('down');
    expect(resumed.step('up')).toMatchObject({ reward: -1, state: { collected: 1 }, trace: { rewardParts: { collectible: 0 } } });
    resumed.reset();
    expect(resumed.getState().collected).toBe(0);
    expect(resumed.step('up').reward).toBe(3);
  });
  test('multiple collectibles use distinct row-major bits', () => {
    const map = tiny({ grid: ['.CCG', '....'], features: { collectibles: true, battery: null, horizon: null } });
    const environment = new IslandEnvironment(map);
    expect(environment.step('right').state.collected).toBe(1);
    expect(environment.step('right').state.collected).toBe(3);
    expect(environment.step('left').reward).toBe(-1);
  });
});

describe('task termination versus rollout truncation', () => {
  test.each([['battery', { battery: 2, horizon: null }], ['horizon', { battery: null, horizon: 2 }]])('%s depletion is genuine task termination, including on collisions', (reason, feature) => {
    const environment = new IslandEnvironment(tiny({ features: { collectibles: false, ...feature } }), options);
    expect(environment.step('up').terminated).toBe(false);
    expect(environment.step('up')).toMatchObject({ terminated: true, truncated: false, trace: { reason } });
    expect(environment.getModel().transitions(environment.getState(), 'right')[0]).toMatchObject({ terminated: true, reward: 0 });
    expect(IslandEnvironment.deserialize(environment.serialize()).getSnapshot()).toEqual(environment.getSnapshot());
  });
  test('external cap stops stepping but is absent from task state and the continuing model', () => {
    const environment = new IslandEnvironment(tiny(), { seed: 42, rolloutLimit: 1 });
    expect(environment.step('right')).toMatchObject({ state: { x: 1, y: 0 }, terminated: false, truncated: true, trace: { reason: 'rollout-limit' } });
    expect(environment.getModel().stateFields).toEqual(['x', 'y']);
    expect(environment.getModel().transitions(environment.getState(), 'right')[0]).toMatchObject({ reward: 19, nextState: { x: 2, y: 0 }, terminated: true });
    const checkpoint = environment.serialize();
    expect(environment.step('right')).toMatchObject({ reward: 0, advanced: false, truncated: true });
    expect(environment.serialize()).toBe(checkpoint);
    expect(IslandEnvironment.deserialize(checkpoint).getInfo().truncated).toBe(true);
  });
  test('goal reached on the cap is termination, not truncation', () => {
    const environment = new IslandEnvironment(tiny(), { rolloutLimit: 2 });
    environment.step('right');
    expect(environment.step('right')).toMatchObject({ terminated: true, truncated: false, reward: 19 });
  });
});

describe('replay, checkpoints, and reset separation', () => {
  test('same seed/map/actions reproduce entire traces; model inspection never consumes randomness', () => {
    const a = new IslandEnvironment(scenarios[1], options), b = new IslandEnvironment(scenarios[1], options);
    const random = vi.spyOn(Math, 'random').mockImplementation(() => { throw new Error('Forbidden simulation randomness'); });
    try {
      for (const action of actions) {
        for (let i = 0; i < 7; i++) { a.getSnapshot(); a.getModel().transitions(a.getState(), action); }
        expect(a.step(action)).toEqual(b.step(action));
      }
      const first = trace(a);
      a.reset(); trace(a);
      expect(trace(a)).toEqual(first);
    } finally { random.mockRestore(); }
  });
  test('serialized RNG resumes the exact future, independent of pause duration or chunk size', () => {
    const a = new IslandEnvironment(scenarios[1], options);
    trace(a, actions.slice(0, 3));
    const b = IslandEnvironment.deserialize(a.serialize());
    expect(b.serialize()).toBe(a.serialize());
    const continuous = trace(a, [...actions, ...actions]);
    expect([...trace(b, actions), ...trace(b, actions)]).toEqual(continuous);
  });
  test.each([
    (value) => { value.schemaVersion = 2; },
    (value) => { value.engineVersion = 2; },
    (value) => { value.scenarioHash = 'wrong'; },
    (value) => { value.actionOrder.reverse(); },
    (value) => { value.stateSchema.push('made-up'); },
    (value) => { value.state.x = 999; },
    (value) => { value.state = { x: 2, y: 6 }; },
    (value) => { value.rng.state = 0; },
    (value) => { value.rng.algorithm = 'other'; },
    (value) => { value.steps = -1; },
    (value) => { value.totalReward = null; },
    (value) => { value.terminated = true; },
    (value) => { value.truncated = true; },
    (value) => { value.state.x = 0; }, // Initial state must match the declared start.
    (value) => { value.rng.state = 123; }, // Initial RNG must match the declared seed.
  ])('rejects malformed/incompatible checkpoint #%#', (mutate) => {
    const value = JSON.parse(new IslandEnvironment(scenarios[0], options).serialize());
    mutate(value);
    expect(() => IslandEnvironment.deserialize(JSON.stringify(value))).toThrow();
  });
  test('bounded parsing rejects oversized JSON and prototype keys without modifying a live session', () => {
    const session = new ManualSession(), original = session.environment.serialize();
    for (const input of ['x'.repeat(65537), '{"__proto__":{"polluted":true}}', '{"constructor":{}}', '{invalid json']) {
      expect(() => session.load(input)).toThrow();
      expect(session.environment.serialize()).toBe(original);
    }
    expect({}.polluted).toBeUndefined();
  });
  test('enabled time/battery checkpoint inconsistencies are rejected', () => {
    const environment = new IslandEnvironment(tiny({ features: { collectibles: false, battery: 4, horizon: 3 } }));
    environment.step('right');
    for (const key of ['battery', 'remaining']) {
      const checkpoint = JSON.parse(environment.serialize()); checkpoint.state[key]++;
      expect(() => IslandEnvironment.deserialize(JSON.stringify(checkpoint))).toThrow();
    }
  });
  test('episode reset preserves nonempty fixture parameters; learning reset changes only that store', () => {
    const parameters = new ParameterStore(), session = new ManualSession(new IslandEnvironment(scenarios[1], options), parameters);
    parameters.set('fixture-state', [1, 2, 3, 4]);
    session.step(); session.resetEpisode();
    expect(parameters.snapshot()).toEqual({ 'fixture-state': [1, 2, 3, 4] });
    expect(session.environment.getInfo().steps).toBe(0);
    expect(session.history).toEqual([]);
    session.step();
    const checkpoint = session.environment.serialize(), history = structuredClone(session.history);
    session.resetLearning();
    expect(parameters.size).toBe(0);
    expect(session.environment.serialize()).toBe(checkpoint);
    expect(session.history).toEqual(history);
  });
  test('invalid seed/map replacement is atomic and history remains bounded', () => {
    const session = new ManualSession(new IslandEnvironment(scenarios[0], { rolloutLimit: 200 }));
    for (let i = 0; i < 150; i++) session.step();
    expect(session.history).toHaveLength(100);
    expect(session.history[0].step).toBe(51);
    const original = session.environment.serialize();
    expect(() => session.resetEpisode({ seed: NaN })).toThrow();
    expect(() => session.changeScenario(tiny(), -1)).toThrow();
    expect(session.environment.serialize()).toBe(original);
  });
  test('local save/load round trip is namespaced, validated, and handles missing/quota failures', () => {
    const values = new Map([['acml:unrelated', 'preserve']]);
    const storage = { getItem: (key) => values.get(key) ?? null, setItem: (key, value) => values.set(key, value) };
    expect(() => loadEnvironment(storage)).toThrow();
    const environment = new IslandEnvironment(scenarios[1], options); trace(environment);
    saveEnvironment(storage, environment);
    expect(loadEnvironment(storage).serialize()).toBe(environment.serialize());
    expect(values.get('acml:unrelated')).toBe('preserve');
    expect(values.has(ENVIRONMENT_KEY)).toBe(true);
    expect(() => saveEnvironment({ setItem() { throw new Error('Quota'); } }, environment)).toThrow('Quota');
  });
});

describe('rendering adapters use state without stepping', () => {
  test('hit testing handles coordinates, margins, small layouts and device-independent dimensions', () => {
    for (const width of [220, 300, 520]) {
      const cell = (width - 56) / 8;
      expect(hitTest(scenarios[0], 28 + 1.5 * cell, 28 + 6.5 * cell, width, width)).toEqual({ x: 1, y: 6 });
      expect(hitTest(scenarios[0], 10, 10, width, width)).toBeNull();
      expect(hitTest(scenarios[0], width - 10, width - 10, width, width)).toBeNull();
    }
  });
  test('accessible cell descriptions expose walls, Robo, and consumed supply', () => {
    expect(describeCell(scenarios[0], { x: 1, y: 6 }, 1, 6)).toContain('Robo is here');
    expect(describeCell(scenarios[0], { x: 1, y: 6 }, 2, 6)).toContain('wall');
    expect(describeCell(scenarios[2], { x: 1, y: 6, collected: 0 }, 1, 5)).toContain('uncollected supply');
    expect(describeCell(scenarios[2], { x: 1, y: 6, collected: 1 }, 1, 5)).toContain('consumed supply (floor)');
  });
});


