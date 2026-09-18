/**
 * @typedef {'up'|'right'|'down'|'left'} Action
 * @typedef {{x:number,y:number,collected?:number,battery?:number,remaining?:number}} State
 * @typedef {State & {partial:boolean}} Observation
 * @typedef {{schemaVersion:1,id:string,name:string,description:string,grid:string[],start:{x:number,y:number},slip:number,rewards:{step:number,collision:number,goal:number,hazard:number,collectible:number},features:{collectibles:boolean,battery:number|null,horizon:number|null},observation:'full'|'position'}} Scenario
 * @typedef {{step:number,collision:number,goal:number,hazard:number,collectible:number}} RewardParts
 * @typedef {'goal'|'battery'|'horizon'|null} TerminalReason
 * @typedef {{action:Action,probability:number,collision:boolean}} Movement
 * @typedef {{probability:number,nextState:State,reward:number,rewardParts:RewardParts,terminated:boolean,reason:TerminalReason,movements:Movement[]}} Outcome
 * @typedef {{algorithm:'xorshift32-v1',state:number}} RngSnapshot
 * @typedef {{schemaVersion:1,step:number,state:State,observation:Observation,action:Action,movement:Action,collision:boolean,reward:number,rewardParts:RewardParts,nextState:State,nextObservation:Observation,terminated:boolean,truncated:boolean,reason:TerminalReason|'rollout-limit',draw:number,probability:number,outcomes:Outcome[],scenarioHash:string}} StepTrace
 */
export {};

