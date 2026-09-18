import { describe, expect, it } from 'vitest';
import manifest from '../../reference/course-manifest.json';
import { lessons } from '../../src/content/curriculum.js';
import { resolveRoute } from '../../src/app/router.js';
import { defaultPreferences, PREFERENCES_KEY, readPreferences, savePreferences } from '../../src/persistence/preferences.js';

describe('verified course navigation', () => {
  it('preserves all eleven titles, identifiers, and their catalog order', () => {
    expect(lessons).toEqual(manifest.lessons.map(({ id, title, region }) => ({ id, title, region })));
    expect(lessons).toHaveLength(11);
    expect(new Set(lessons.map(({ id }) => id)).size).toBe(11);
  });
  it('opens every lesson without manufacturing a completion record', () => {
    for (const lesson of lessons) expect(resolveRoute(`#/lesson/${lesson.id}`)).toEqual({ page: 'lesson', lesson });
  });
  it('defaults empty navigation to welcome', () => expect(resolveRoute('')).toEqual({ page: 'welcome' }));
  it.each(['island', 'welcome', 'sandbox', 'compare', 'notebook', 'settings', 'expedition'])('resolves %s', (page) => {
    expect(resolveRoute(`#/${page}`)).toEqual({ page });
  });
  it.each(['#/lesson/99', '#/lesson/1', '#/<img src=x onerror=alert(1)>', '#/island/extra', '#/lesson/%30%31'])('rejects unknown route %s', (hash) => {
    expect(resolveRoute(hash)).toEqual({ page: 'not-found' });
  });
  it('exposes component specimens only in development', () => {
    expect(resolveRoute('#/components')).toEqual({ page: 'not-found' });
    expect(resolveRoute('#/components', true)).toEqual({ page: 'components' });
  });
});

describe('device-local display preferences', () => {
  it('handles a new browser without writing any data', () => {
    const result = readPreferences({ getItem: () => null });
    expect(result.preferences).toEqual(defaultPreferences);
    expect(result.message).toBe('');
  });
  it('round trips only approved preference fields', () => {
    const values = new Map();
    const storage = { getItem: (key) => values.get(key) ?? null, setItem: (key, value) => values.set(key, value) };
    const preferences = { schemaVersion: 1, motion: 'reduced', fontScale: 'large' };
    expect(savePreferences(storage, preferences)).toContain('saved');
    expect(readPreferences(storage).preferences).toEqual(preferences);
    expect([...values.keys()]).toEqual([PREFERENCES_KEY]);
  });
  it.each(['not json', '{"schemaVersion":2,"motion":"system","fontScale":"normal"}', '{"schemaVersion":1,"motion":"wild","fontScale":"normal"}'])('falls back safely for invalid stored settings', (value) => {
    const result = readPreferences({ getItem: () => value });
    expect(result.preferences).toEqual(defaultPreferences);
    expect(result.message).not.toBe('');
  });
  it('does not carry imported extra keys into application state', () => {
    const result = readPreferences({ getItem: () => '{"schemaVersion":1,"motion":"system","fontScale":"normal","mastered":11,"__proto__":{"polluted":true}}' });
    expect(Object.keys(result.preferences)).toEqual(['schemaVersion', 'motion', 'fontScale']);
    expect({}.polluted).toBeUndefined();
  });
  it('survives blocked storage reads and quota failures', () => {
    expect(readPreferences({ getItem: () => { throw new Error('blocked'); } }).message).toContain('unavailable');
    expect(savePreferences({ setItem: () => { throw new Error('quota'); } }, defaultPreferences)).toContain('Could not save');
  });
});

