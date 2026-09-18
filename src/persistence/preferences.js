export const PREFERENCES_KEY = 'rl-island:preferences:v1';
/** @typedef {{ schemaVersion: 1, motion: 'system'|'reduced', fontScale: 'normal'|'large' }} Preferences */
/** @type {Preferences} */
export const defaultPreferences = { schemaVersion: 1, motion: 'system', fontScale: 'normal' };

/** Only presentation preferences exist in this shell. No learning record is created.
 * @param {Pick<Storage, 'getItem'>} storage
 * @returns {{ preferences: Preferences, message: string }}
 */
export function readPreferences(storage) {
  try {
    const raw = storage.getItem(PREFERENCES_KEY);
    if (!raw) return { preferences: { ...defaultPreferences }, message: '' };
    const value = JSON.parse(raw);
    if (value?.schemaVersion !== 1 || !['system', 'reduced'].includes(value.motion) || !['normal', 'large'].includes(value.fontScale)) {
      return { preferences: { ...defaultPreferences }, message: 'Saved display settings could not be read. Default settings are in use.' };
    }
    return { preferences: { schemaVersion: 1, motion: value.motion, fontScale: value.fontScale }, message: '' };
  } catch {
    return { preferences: { ...defaultPreferences }, message: 'Browser storage is unavailable or unreadable. Display settings apply only to this session.' };
  }
}

/** @param {Pick<Storage, 'setItem'>} storage @param {Preferences} preferences */
export function savePreferences(storage, preferences) {
  try {
    storage.setItem(PREFERENCES_KEY, JSON.stringify(preferences));
    return 'Display settings saved on this device.';
  } catch {
    return 'Could not save to browser storage. Your display settings apply only to this session.';
  }
}
