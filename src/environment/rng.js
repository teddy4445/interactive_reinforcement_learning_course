/** Deterministic, versioned xorshift32. Simulation streams never use Math.random.
 * This generator is for reproducible teaching experiments, not cryptography.
 */
export const RNG_VERSION = 'xorshift32-v1';

/** @param {unknown} seed @returns {number} */
export function validateSeed(seed) {
  if (!Number.isInteger(seed) || Number(seed) < 0 || Number(seed) > 0xffffffff) throw new Error('Seed must be an integer from 0 to 4294967295.');
  return Number(seed);
}

/** FNV-1a over an explicit namespace; stream derivation consumes no other stream.
 * @param {number} seed @param {string} stream
 */
export function deriveSeed(seed, stream) {
  validateSeed(seed);
  let hash = 2166136261;
  for (const char of `rl-island/v1|${seed}|${stream}`) hash = Math.imul(hash ^ char.charCodeAt(0), 16777619) >>> 0;
  return hash || 0x6d2b79f5;
}

/** @param {number} seed */
export function createRng(seed) {
  let state = validateSeed(seed) || 0x6d2b79f5;
  return {
    next() {
      state ^= state << 13;
      state ^= state >>> 17;
      state ^= state << 5;
      state >>>= 0;
      return state / 4294967296;
    },
    /** @returns {import('./types.js').RngSnapshot} */
    snapshot() { return { algorithm: RNG_VERSION, state }; },
    /** @param {import('./types.js').RngSnapshot} snapshot */
    restore(snapshot) {
      if (snapshot.algorithm !== RNG_VERSION || validateSeed(snapshot.state) === 0) throw new Error('Invalid RNG checkpoint.');
      state = snapshot.state;
    },
  };
}

/** @param {number} seed */
export function createRandomStreams(seed) {
  return {
    environment: createRng(deriveSeed(seed, 'environment')),
    agent: createRng(deriveSeed(seed, 'agent')),
    replay: createRng(deriveSeed(seed, 'replay')),
    network: createRng(deriveSeed(seed, 'network')),
  };
}

