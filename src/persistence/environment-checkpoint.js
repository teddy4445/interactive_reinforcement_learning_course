import { MAX_CHECKPOINT_BYTES } from '../environment/schema.js';
import { IslandEnvironment } from '../environment/engine.js';
export const ENVIRONMENT_KEY = 'rl-island:environment:v1';
/** @param {Pick<Storage,'setItem'>} storage @param {IslandEnvironment} environment */
export function saveEnvironment(storage, environment) {
  const checkpoint = environment.serialize();
  if (new TextEncoder().encode(checkpoint).length > MAX_CHECKPOINT_BYTES) throw new Error('Environment checkpoint exceeds 64 KiB.');
  storage.setItem(ENVIRONMENT_KEY, checkpoint);
}
/** @param {Pick<Storage,'getItem'>} storage */
export function loadEnvironment(storage) {
  const checkpoint = storage.getItem(ENVIRONMENT_KEY);
  if (!checkpoint) throw new Error('No environment checkpoint has been saved on this device.');
  // Validate before the controller offers replacement. No notes/code/parameters are loaded.
  return IslandEnvironment.deserialize(checkpoint);
}

