/** Presentation/update guards observe worker activity; they never step a simulation. */
const active=new Set();
export const activityListeners=new Set();
export const isTrainingActive=()=>active.size>0;
/** @param {object} owner @param {boolean} busy */
export function setTrainingActive(owner,busy){if(busy)active.add(owner);else active.delete(owner);for(const fn of activityListeners)fn();}
