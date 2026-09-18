import { completion, started } from '../lessons/records.js';
import { learningComplete } from '../lessons/learning-records.js';
import { guidedLessonView, unfinishedLessonView, learningNotebookView } from './learning-pages.js';
import { lessons } from '../content/curriculum.js';
import { islandArt, robotArt } from './art.js';
import { manualWorkspaceView } from './manual-workspace.js';

/** @param {string} text @param {string} [kind] */
export function badge(text, kind = '') { return `<span class="badge ${kind}">${text}</span>`; }
/** @param {string} eyebrow @param {string} title @param {string} description */
export function heading(eyebrow, title, description) {
  return `<div class="page-heading"><p class="eyebrow">${eyebrow}</p><h1 tabindex="-1">${title}</h1><p class="lede">${description}</p></div>`;
}

export function welcomeView() {
  return `<section class="welcome-hero">
    <div class="hero-copy"><p class="eyebrow">ACML · An interactive course companion</p>
      <h1 tabindex="-1">A small island.<br>A world of <span>learning.</span></h1>
      <p>Explore reinforcement learning, one decision at a time. Follow the course from first principles to agents that learn from experience.</p>
      <div class="actions"><a class="button primary" href="#/island">Explore the island <span aria-hidden="true">→</span></a><a class="button hero-secondary" href="#/lesson/01">Start lesson 01</a></div>
      <div class="hero-meta"><span>11 course lessons</span><span>Prof. Teddy Lazebnik</span></div>
    </div>
    <figure class="hero-island">${islandArt()}<figcaption>Meet your learning landscape <span>Concept illustration · try manual play in a workspace</span></figcaption></figure>
  </section>
  <div class="section-intro"><div><p class="eyebrow">From intuition to understanding</p><h2>See the decision. Understand the mathematics.</h2></div>${badge('Lessons 01–11 available', 'rose')}</div>
  <div class="feature-grid">
    <article class="card feature"><span class="feature-number">01 / EXPLORE</span><h3>One connected world</h3><p>Eleven lessons follow the verified course order, with a different idea to explore in each region.</p><a href="#/island">View the course map <span aria-hidden="true">↗</span></a></article>
    <article class="card feature"><span class="feature-number">02 / INVESTIGATE</span><h3>Make the next move meaningful</h3><p>All eleven lessons connect observation, prediction, play, mathematics, experiments, and challenges.</p><a href="#/lesson/01">Look inside the workspace <span aria-hidden="true">↗</span></a></article>
    <article class="card feature"><span class="feature-number">03 / REFLECT</span><h3>Keep a record of your thinking</h3><p>Save predictions before results, compare numerical experiments, and keep your reflections.</p><a href="#/notebook">Open the notebook <span aria-hidden="true">↗</span></a></article>
  </div>
  <aside class="local-notice"><span class="notice-symbol" aria-hidden="true">i</span><div><strong>Your browser, your workspace.</strong><p>Display preferences, lesson progress, and saved environment checkpoints stay on this device. Progress exports are self-reported learning artifacts, not authenticated grades.</p></div><a class="button secondary" href="#/notebook">Import / export progress</a></aside>`;
}

const positions = [[21, 73], [36, 81], [32, 60], [18, 44], [43, 48], [43, 28], [60, 68], [60, 40], [66, 19], [80, 30], [82, 60]];
/** @param {import('../persistence/progress.js').Progress} progress @param {import('../persistence/learning-store.js').LearningProgress} learning */
export function islandView(progress,learning) {
  /** @param {string} id */
  const status = (id) => {
    if (['04','05','06','07','08','09','10','11'].includes(id)) {const key=/** @type {'04'|'05'|'06'|'07'|'08'|'09'|'10'|'11'} */(id),r=learning.lessons[key];return learningComplete(key,r)?'Complete':r&&(r.prediction||r.attempts.length)?'In progress':'Ready to begin';}
    if (!['01','02','03'].includes(id)) return 'Not available yet';
    const key = /** @type {import('../content/foundations.js').FoundationId} */(id);
    return completion(key,progress.lessons[key]) ? 'Complete' : started(progress.lessons[key]) ? 'In progress' : 'Ready to begin';
  };
  const completeCount = ['01','02','03','04','05','06','07','08','09','10','11'].filter((id) => status(id)==='Complete').length;
  const resume = learning.lastLesson ?? progress.lastLesson ?? '01';

  return `${heading('The course landscape', 'Your island of ideas', 'Follow the lesson order, or look around. Opening a workspace does not earn progress.')}
  <div class="dashboard-grid"><section class="card map-card" aria-label="Illustrated course map"><div class="card-heading"><h2>Eleven stops. One learning journey.</h2><a href="#lesson-list" data-scroll-list>Use the lesson list ↓</a></div>
  <div class="island-map">${islandArt()}${lessons.map((lesson, i) => `<a class="map-node" data-lesson-status="${status(lesson.id)}" href="#/lesson/${lesson.id}" style="left:${positions[i][0]}%;top:${positions[i][1]}%" aria-label="Lesson ${lesson.id}: ${lesson.region} — ${status(lesson.id)}"><span>${lesson.id}</span></a>`).join('')}</div>
  <div class="map-caption"><span><span class="legend-dot"></span>Eleven guided lessons</span><span>Illustration only</span></div></section>
  <aside class="dashboard-aside"><section class="card next-card"><p class="eyebrow">A place to begin</p><div class="robot-portrait">${robotArt()}</div><h2>Your next decision</h2><p>Start with the ideas behind reinforcement learning: an agent, an environment, and the decisions between them.</p><a class="button primary" href="#/lesson/${resume}">Resume lesson ${resume} <span aria-hidden="true">→</span></a><small>Return to the last saved stage. Exploration never grants completion.</small></section>
  <section class="card record-card"><h2>Your learning record</h2><p>${completeCount} of 11 available lessons complete.</p><p class="small">Completion comes from saved activities and explicit checks. It is not an authenticated grade.</p><a href="#/expedition">Begin the Final expedition →</a><br><a href="#/notebook">Go to notebook <span aria-hidden="true">→</span></a></section></aside></div>
  <section class="course-section" aria-labelledby="lesson-list"><div class="section-intro"><div><p class="eyebrow">The course, in order</p><h2 id="lesson-list" tabindex="-1">Choose a lesson workspace</h2></div><span class="small">Eleven complete lesson flows · shared environment engine</span></div>
  <ol class="lesson-list">${lessons.map((lesson) => `<li><a href="#/lesson/${lesson.id}"><span class="lesson-number">${lesson.id}</span><span class="lesson-label"><strong>${lesson.title}</strong><span>${lesson.region}</span></span>${badge(status(lesson.id))}<span class="lesson-arrow" aria-hidden="true">↗</span></a></li>`).join('')}</ol>
  <p><a href="#/practice">Open the free manual lab</a> · Practice without granting lesson completion.</p><p class="source-note">Lesson titles and order are catalog-verified. Region names are proposed teaching labels; activity-to-slide alignment is pending review.</p></section>`;
}

/** @param {import('../content/curriculum.js').Lesson} lesson */
export function lessonView(lesson) {
 return ['01','02','03','04','05','06','07','08','09','10','11'].includes(lesson.id) ? guidedLessonView(lesson) : unfinishedLessonView(lesson);
}
export function practiceView() {
 return heading('Shared environment · free practice','Manual lab','Explore deterministic, slippery, and collectible islands. Free practice does not award lesson completion.') + manualWorkspaceView();
}
/** @param {import('../persistence/progress.js').Progress} progress */
export function notebookView(progress) { return learningNotebookView(progress); }

/** @param {import('../persistence/preferences.js').Preferences} preferences */
export function settingsView(preferences) {
  return `${heading('Make room for learning', 'Settings', 'Adjust how the workspace feels on this device.')}
  <div class="settings-grid"><section class="card settings-card"><h2>Display preferences</h2><p>Changes apply immediately and are saved locally when browser storage is available.</p>
  <div class="field"><label for="motion">Motion</label><select id="motion" aria-describedby="motion-help"><option value="system" ${preferences.motion === 'system' ? 'selected' : ''}>Follow system preference</option><option value="reduced" ${preferences.motion === 'reduced' ? 'selected' : ''}>Reduce motion</option></select><small id="motion-help">System reduced-motion preferences are always respected.</small></div>
  <label class="field" for="font-scale"><span>Text size</span><select id="font-scale"><option value="normal" ${preferences.fontScale === 'normal' ? 'selected' : ''}>Standard</option><option value="large" ${preferences.fontScale === 'large' ? 'selected' : ''}>Large</option></select></label>
  <button class="button secondary" id="reset-preferences">Restore display defaults</button><p id="settings-status" role="status" class="small"></p></section>
  <div class="settings-side"><section class="card"><h2>This browser only</h2><p>Display preferences, lesson activity records, and explicitly saved environment checkpoints stay on this device. There are no accounts or cross-device sync. Export your progress from the notebook.</p><p class="small">Browser storage can be cleared. It is not a permanent backup.</p></section>
  <section class="card"><h2>Lecture presentation</h2><p>Use larger text, projection controls and reproducible fresh presets in a temporary session. Personal notes and student progress stay hidden; algorithms are unchanged. There is no audio dependency.</p><button class="button secondary" data-enter-lecture>Switch lecture presentation</button></section></div></div>`;
}

/** @param {string} page */
export function unavailableView(page) {
  const names = { sandbox: 'Sandbox', compare: 'Compare', expedition: 'Final expedition', 'not-found': 'Page not found' };
  const name = names[/** @type {keyof typeof names} */ (page)] || 'Page not found';
  const missing = page === 'not-found';
  return `${heading(missing ? 'A different path' : 'Room to experiment', name, missing ? 'This route does not match a lesson or page.' : 'This part of the learning workspace is still being built.')}
  <section class="card empty-state unavailable"><span class="empty-orbit" aria-hidden="true">↗</span>${badge(missing ? 'Unknown route' : 'Not available yet', 'rose')}<h2>${missing ? 'Let’s get you back to the island.' : page === 'compare' ? 'Good comparisons begin with real experiments.' : page === 'sandbox' ? 'Your own questions. Your own experiments.' : 'Bring the course ideas together.'}</h2><p>${missing ? 'Use the course map to find one of the eleven lesson workspaces.' : page === 'compare' ? 'The general comparison workspace is unfinished. Recorded two-method experiments are available inside lessons 04–11.' : page === 'sandbox' ? 'The scenario builder is unfinished. Use the manual lab or the fixed-map learning experiments in lessons 04–11.' : 'The integrated challenge and its evaluation protocol will be available in a later milestone.'}</p><a class="button primary" href="#/island">Back to the island <span aria-hidden="true">→</span></a></section>`;
}



