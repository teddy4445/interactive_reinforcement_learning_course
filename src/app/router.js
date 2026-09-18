import { lessons } from '../content/curriculum.js';

/** @typedef {{ page: string, lesson?: import('../content/curriculum.js').Lesson }} Route */
/** Resolve only known routes. Unknown input is never inserted into markup.
 * @param {string} hash
 * @param {boolean} [development]
 * @returns {Route}
 */
export function resolveRoute(hash, development = false) {
  const path = hash.replace(/^#/, '') || '/welcome';
  const pages = ['welcome', 'island', 'sandbox', 'compare', 'notebook', 'expedition', 'settings', 'practice'];
  if (pages.some((page) => path === `/${page}`)) return { page: path.slice(1) };
  if (development && path === '/components') return { page: 'components' };
  const match = /^\/lesson\/(\d{2})$/.exec(path);
  const lesson = match && lessons.find((item) => item.id === match[1]);
  return lesson ? { page: 'lesson', lesson } : { page: 'not-found' };
}

