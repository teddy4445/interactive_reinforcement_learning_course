import { validateScenario } from '../environment/schema.js';
/** @typedef {'01'|'02'|'03'} FoundationId */
/** @typedef {{prompt:string,options:string[],correct:string,explanation:string}} Choice */
/** @typedef {{id:FoundationId,prerequisites:FoundationId[],objectives:string[],missions:string[],observe:string[],observeCheck:Choice,prediction:string,predictionOptions:string[],play:string,math:string[],formula:string,mathQuestion:string,mathAnswer:number,mathExplanation:string,experiment:string,experimentPrediction:string,challengeQuestion:string,challengeAnswer:number,challengeCheck:Choice,reflection:string,misconception:string,source:string,sourceStatus:string}} Foundation */
/** @type {Record<FoundationId,Foundation>} */
export const foundations = {
  '01': {
    id:'01', prerequisites:[], objectives:['Identify agent, environment, state, action, and reward.','Compute a return and compare immediate with delayed rewards.'],
    missions:['Meet the interaction loop','Choose a discount','Guide Robo and explain the trace'],
    observe:['Robo is the agent. The island and its transition/reward rules are the environment. You choose an action for Robo during manual play.','The fully observed state is Robo’s column and row. Actions are up, right, down, and left. A reward is feedback from one transition; the return combines rewards over time.','This campsite is deterministic and has no hazards or battery. Each accepted action costs 1; entering the goal adds 6 (net reward 5). Walls and edges keep Robo in place.'],
    observeCheck:{prompt:'Which part is the agent?',options:['Robo','The island rules','The reward number'],correct:'Robo',explanation:'Robo takes actions. The island responds with a next state and reward.'},
    prediction:'Before moving or revealing calculations: with no step costs, which option has the larger discounted return at γ = 0.5?',
    predictionOptions:['5 after one action','20 after four actions','Equal returns'],
    play:'Reach the goal at (2, 0). Focus the map and use arrow keys/WASD, or the direction buttons. Read the actual state → action → reward → next state below.',
    math:['Using R₁ for the first reward: G₀ = R₁ + γR₂ + γ²R₃ + … . The first reward is not discounted.','Worked example: [0, 0, 5] at γ = 0.9 gives 0 + 0.9×0 + 0.9²×5 = 4.05. This example is separate from your actual campsite trace.','At the reward fork, the immediate return is 5 and the delayed return is 20γ³. Their tie is γ = (5/20)^(1/3), about 0.6299605. Changing γ recalculates this comparison; no learned policy is being retrained.'],
    formula:'G₀ = Σₜ γᵗ Rₜ₊₁', mathQuestion:'For rewards [0, 0, 5] and γ = 0.9, what is G₀?', mathAnswer:4.05,
    mathExplanation:'The reward 5 is the third reward, so multiply it by 0.9².',
    experiment:'Change γ to 0.9, save a new prediction, and calculate both reward-fork returns. Compare them with the γ = 0.5 example.',
    experimentPrediction:'At γ = 0.9, which reward option will have the larger return?',
    challengeQuestion:'In the two-action route right, right, rewards are [−1, 5]. At γ = 0.9, what is the return?', challengeAnswer:3.5,
    challengeCheck:{prompt:'For a right move from (1, 0) into the goal, which trace is correct?',options:['State (1,0); action right; reward 5; next state (2,0)','State (2,0); action left; reward 6; next state (1,0)','State (1,0); action right; reward −1; next state (1,0)'],correct:'State (1,0); action right; reward 5; next state (2,0)',explanation:'The goal bonus adds to the −1 step cost. State and next state refer to different times.'},
    reflection:'What changed when you raised γ? Use your two calculated returns as evidence. Your words are saved, not automatically interpreted or graded.',
    misconception:'A positive final reward does not make every earlier action good. Costs and timing both affect return.',
    source:'files/rl_course/1.pdf', sourceStatus:'Catalog title verified; detailed activity-to-slide pages remain unverified.'
  },
  '02': {
    id:'02', prerequisites:['01'], objectives:['Read a stochastic transition distribution.','Evaluate a fixed policy with exact Bellman expectation backups.'],
    missions:['Predict a slippery transition','Evaluate an unchanged policy','Change slip and explain the value'],
    observe:['An MDP specifies states, actions, transition probabilities, rewards, and discount γ. Here A=(0,0), B=(1,0), and G=(2,0). The lower row is walls. G is terminal.','The fixed policy chooses right in A and B. With slip 0.2, right happens with probability 0.8; up and down each have 0.1. Both hit a wall or edge, so their stay outcomes merge to 0.2.','Every action costs 1. Goal entry adds 6, giving net reward 5. The observation includes the entire task state. Exact model access is explicitly granted for planning.'],
    observeCheck:{prompt:'What does fixed-policy evaluation change?',options:['State values, while keeping the policy fixed','The policy after every reward','The transition probabilities'],correct:'State values, while keeping the policy fixed',explanation:'Evaluation estimates V under the supplied policy. It does not improve or train the behavior policy.'},
    prediction:'With slip 0.2 at B, what probability do you predict for staying in B after choosing right?',
    predictionOptions:['0.2','0.1','0.8'],
    play:'Follow the fixed right policy for at least two accepted transitions. Actual movement may stay in place. Compare each sampled transition with its exact model probabilities.',
    math:['Vπ(s) is the expected discounted return when following π from s. It is an expectation, not the reward from one lucky episode.','A synchronous sweep uses the previous value table for every backup. Starting at zero, B becomes 0.8×5 + 0.2×(−1) = 3.8. Terminal continuation is zero.','Later backups use V(B)=0.8×5 + 0.2×[−1 + 0.9V(B)]. Thus V(B)=3.8/0.82≈4.634146. A also includes continuation through B. The right policy remains unchanged.'],
    formula:'Vπ(s) ← Σₐ π(a|s) Σₛ′ p(s′|s,a)[r + γVπ(s′)]', mathQuestion:'Starting with all values 0, what is the first backup at B (slip 0.2)?', mathAnswer:3.8,
    mathExplanation:'80% earns 5, and 20% earns −1. Do not count terminal continuation.',
    experiment:'Change slip from 0.2 to 0.4, keeping γ = 0.9 and the right policy fixed. Record a prediction first, then evaluate again to a declared residual tolerance.',
    experimentPrediction:'When slip rises to 0.4, will the value at B be lower, equal, or higher?',
    challengeQuestion:'At slip 0.4 and zero initial values, what is the first backup at B?', challengeAnswer:2.6,
    challengeCheck:{prompt:'Why are the stay outcomes merged?',options:['Up and down both produce the same next state and reward','The probabilities are averaged instead of added','The agent learned to avoid a wall'],correct:'Up and down both produce the same next state and reward',explanation:'The two mutually exclusive branches add: slip/2 + slip/2 = slip.'},
    reflection:'Compare the two computed values at B. Explain what stayed fixed and what changed. Your explanation is saved without automatic text grading.',
    misconception:'A single sampled transition is not the full transition distribution. A state value is not a one-step reward.',
    source:'files/rl_course/2.pdf', sourceStatus:'Source discrepancy: linked PDF discusses exploration/exploitation; this MDP topic follows the catalog and explicit task scope. Slide alignment is unverified.'
  },
  '03': {
    id:'03', prerequisites:['02'], objectives:['Separate evaluation from greedy policy improvement.','Compare policy iteration and value iteration using residuals and actual sweep counts.'],
    missions:['Improve a policy','Compare two planners','Explain the stopping criterion'],
    observe:['Use the same three-state corridor, now deterministic. Rewards are −1 per action and +6 on goal entry. γ = 0.9; the state is fully observed.','Policy iteration evaluates its current policy, then improves it greedily using those values. It begins with a deliberately poor left policy here.','Value iteration applies the Bellman optimality backup directly. Both use the shared exact environment model; neither learns from sampled episodes.'],
    observeCheck:{prompt:'Which operation changes the action chosen by a policy?',options:['Greedy policy improvement','Fixed-policy evaluation','Rendering a value table'],correct:'Greedy policy improvement',explanation:'Evaluation changes value estimates for a fixed policy. Improvement compares action returns and changes the policy.'},
    prediction:'Before computing the values, which action do you predict will be optimal at B for γ = 0.9?',
    predictionOptions:['Right toward the goal','Left away from the goal','All directions are equal'],
    play:'Take at least two manual actions and inspect their rewards. Then compare actual model-based planning sweeps in the mathematics stage.',
    math:['The optimality backup takes the maximum over actions. The first zero-initialized value-iteration sweep gives V(A)=−1 and V(B)=5. The next gives V(A)=−1+0.9×5=3.5.','Policy improvement chooses the first maximum in the documented order up, right, down, left. Exact ties use that order; they do not consume randomness.','The displayed residual is maxₛ|T(V)(s)−V(s)|, computed from the displayed table. A stable policy alone is not evidence that displayed values have converged. Our planners report a tolerance of 10⁻⁸ or an explicit budget stop.'],
    formula:'V(s) ← maxₐ Σₛ′ p(s′|s,a)[r + γV(s′)]', mathQuestion:'At γ = 0.9, what is the optimal value at A on the deterministic corridor?', mathAnswer:3.5,
    mathExplanation:'Right earns −1, then the goal transition earns 5: −1 + 0.9×5 = 3.5.',
    experiment:'Change γ to 0.5. Predict the value at A, then compare policy iteration and value iteration on this identical map/configuration. Watch their actual evaluation and improvement frames.',
    experimentPrediction:'At γ = 0.5, what do you predict for the optimal value at A?',
    challengeQuestion:'At γ = 0.5, what optimal value should both planners produce at A?', challengeAnswer:1.5,
    challengeCheck:{prompt:'Which evidence supports the displayed stopping claim?',options:['Both planners meet the declared Bellman residual tolerance','The arrows stopped changing, regardless of the values','The animation reached its last frame'],correct:'Both planners meet the declared Bellman residual tolerance',explanation:'Check numerical residuals and budget status. Policy stability or animation completion alone is insufficient.'},
    reflection:'Compare the two planners’ sweep counts and stopping evidence. Explain why equal values need not mean equal computation. This reflection is not automatically graded.',
    misconception:'Policy iteration is not just value iteration with arrows. Evaluation and improvement are distinct operations.',
    source:'files/rl_course/3.pdf', sourceStatus:'Catalog title verified; detailed activity-to-slide pages remain unverified.'
  }
};
/** @param {FoundationId} id @param {number} [slip] */
export function lessonScenario(id, slip = id === '02' ? .2 : 0) {
  return validateScenario({ schemaVersion:1, id:'foundation-' + id, name:id === '01' ? 'Campsite' : 'Three-state corridor', description:'Original lesson fixture; shared environment rules.', grid:id === '01' ? ['..G','...'] : ['..G','###'], start:{x:0,y:0}, slip,
    rewards:{step:-1,collision:0,goal:6,hazard:0,collectible:0},features:{collectibles:false,battery:null,horizon:null},observation:'full' });
}

