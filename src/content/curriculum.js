/** Public navigation metadata only. Titles/order match the sanitized reference manifest.
 * Region names are proposed teaching labels; slide-page mappings remain unverified.
 * @typedef {{ id: string, title: string, region: string }} Lesson
 */
/** @type {ReadonlyArray<Lesson>} */
export const lessons = [
  { id: '01', title: 'Introduction to Reinforcement Learning', region: 'Base Camp' },
  { id: '02', title: 'Tabular MDP Planning and RL Policy Evaluation', region: 'MDP Beach' },
  { id: '03', title: 'MDP continuation', region: 'Value Forest' },
  { id: '04', title: 'Model-free prediction', region: 'Experience Jungle' },
  { id: '05', title: 'Model-free control', region: 'Control Ridge' },
  { id: '06', title: 'Function approximation', region: 'Feature Highlands' },
  { id: '07', title: 'Planning and models', region: 'Modelers Marsh' },
  { id: '08', title: 'Policy gradients and Actor Critics', region: 'Policy Summit' },
  { id: '09', title: 'Deep Reinforcement Learning (1)', region: 'Deep Mountains I' },
  { id: '10', title: 'Deep Reinforcement Learning (2)', region: 'Deep Mountains II' },
  { id: '11', title: 'Mimic learning', region: 'Demonstration Village' },
];

export const stages = ['Observe', 'Predict', 'Play', 'Reveal the mathematics', 'Experiment', 'Challenge'];
