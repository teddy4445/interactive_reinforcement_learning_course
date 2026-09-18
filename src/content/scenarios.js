import { validateScenario } from '../environment/schema.js';
/** Small position-only teaching islands. Rewards are applied after every accepted action. */
const base = {
  schemaVersion: 1,
  grid: ['........', '.##.....', '....#...', '.H..#...', '....#...', '........', '..#.....', '.......G'],
  start: { x: 1, y: 6 },
  rewards: { step: -1, collision: -2, goal: 20, hazard: -5, collectible: 4 },
  features: { collectibles: false, battery: null, horizon: null },
  observation: 'full',
};
export const scenarios = [
  validateScenario({ ...base, id: 'base-camp', name: 'Base Camp', description: 'Firm ground: every action moves in the chosen direction, unless a wall or shoreline blocks the way.', slip: 0 }),
  validateScenario({ ...base, id: 'slippery-shore', name: 'Slippery Shore', description: 'Choose a direction: 80% follows it, 10% turns clockwise, and 10% turns counterclockwise. Collisions stay in place.', slip: 0.2 }),
  validateScenario({ ...base, id: 'collection-inlet', name: 'Collection Inlet', description: 'A state-feature demonstration. A supply is rewarded once per episode; its consumed bit is part of the state.', grid: ['........', '.##.....', '....#...', '.H..#...', '....#...', '.C......', '..#.....', '.......G'], features: { collectibles: true, battery: null, horizon: null }, slip: 0 }),
];

