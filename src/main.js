import {mountOffline} from './offline/client.js';
import {isTrainingActive} from './app/activity.js';
import {readLecture,saveLecture,memoryStorage,mountLecture,lecturePreset} from './app/lecture.js';
import './styles/laboratory.css';
import {mountImitationLesson} from './imitation/controller.js';
import { LearningStore } from './persistence/learning-store.js';
import { mountLearningLesson } from './lessons/model-free-controller.js';
import { learningNotebookSection,mountLearningNotebook } from './app/learning-notebook.js';
import { ProgressStore } from './persistence/progress.js';
import { mountLesson } from './lessons/controller.js';
import { mountNotebook } from './app/notebook-controller.js';
import '@fontsource/inter/latin-400.css';
import '@fontsource/inter/latin-500.css';
import '@fontsource/inter/latin-600.css';
import '@fontsource/inter/latin-700.css';
import '../reference/acml-tokens.css';
import './styles/app.css';
import './styles/deep.css';
import './styles/hardening.css';
import { ManualSession } from './app/manual-session.js';
import { mountManualWorkspace } from './app/manual-controller.js';
import { resolveRoute } from './app/router.js';
import { defaultPreferences, readPreferences, savePreferences } from './persistence/preferences.js';
import { welcomeView, islandView, lessonView, practiceView, notebookView, settingsView, unavailableView } from './ui/views.js';

/** @param {string} selector @returns {HTMLElement} */
function element(selector) {
  const found = document.querySelector(selector);
  if (!(found instanceof HTMLElement)) throw new Error(`Required UI element missing: ${selector}`);
  return found;
}

// Access to localStorage itself can throw in restricted browser contexts.
const storage = {
  /** @param {string} key */
  getItem: (key) => window.localStorage.getItem(key),
  /** @param {string} key @param {string} value */
  setItem: (key, value) => window.localStorage.setItem(key, value),
};
const studentProgress = new ProgressStore(storage),studentLearning = new LearningStore(storage),studentManual = new ManualSession();
let lecture=readLecture(storage),lectureStorage=memoryStorage(),studentSelection='',studentRoute=location.hash;
let progressStore=lecture?new ProgressStore(lectureStorage):studentProgress;
let learningStore=lecture?new LearningStore(lectureStorage,{memoryOnly:true}):studentLearning;
let archiveStorage=lecture?lectureStorage:storage;
const loaded = readPreferences(storage);
let preferences = loaded.preferences;
let preferenceMessage = loaded.message;
let renderVersion = 0;
let activeWorkspaceTab = 'instructions';
/** @type {typeof import('./laboratory/page.js')|null} */let laboratory=null;
let manualSession = lecture?new ManualSession():studentManual;
let disposeManualWorkspace = () => {};

function applyPreferences() {
  document.documentElement.dataset.motion = preferences.motion;
  document.documentElement.dataset.fontScale = preferences.fontScale;
}
applyPreferences();

element('#app').innerHTML = `
  <header class="site-header"><div class="header-inner">
    <a class="brand" href="#/welcome" aria-label="RL Island home"><img class="brand-logo" src="${import.meta.env.BASE_URL}assets/acml-logo.png" alt="ACML" width="636" height="372"><span class="brand-divider"></span><span class="brand-title">RL Island</span></a>
    <button class="menu-toggle button secondary" aria-expanded="false" aria-controls="site-navigation">Menu <span aria-hidden="true">☰</span></button>
    <div id="site-navigation" class="navigation-container"><nav aria-label="Primary navigation" class="pill-navigation">
      <a href="#/island" data-nav="island">Island</a><a href="#/sandbox" data-nav="sandbox">Sandbox</a><a href="#/compare" data-nav="compare">Compare</a><a href="#/notebook" data-nav="notebook">Notebook</a>
    </nav><div class="secondary-navigation"><a href="#/settings" data-nav="settings">Settings</a><a class="lab-link" href="https://acml.teddylazebnik.com/" target="_blank" rel="noopener noreferrer">Back to ACML <span aria-hidden="true">↗</span><span class="sr-only"> (opens in a new tab)</span></a></div></div>
  </div></header>
  <div class="presentation-bar"><section id="lecture-controls" aria-label="Lecture presentation"></section><section id="offline-controls" aria-label="Offline course"></section></div>
  <p id="storage-status" role="status" hidden></p>
  <main id="main" class="page-container" tabindex="-1"></main>
  <footer class="site-footer"><span>RL Island <span aria-hidden="true">/</span> Applied Computational Mathematics Laboratory</span><span>Lessons 01–11 · Planning and sampled learning</span></footer>`;

const showStorage=(/** @type {string} */message)=>{const banner=element('#storage-status');banner.hidden=!/Saving larger|could not|unavailable|memory.only/.test(message);banner.textContent=message;};studentLearning.listeners.add(message=>{if(!lecture)showStorage(message);});showStorage(learningStore.message);
mountOffline(element('#offline-controls'),isTrainingActive);
mountLecture(element('#lecture-controls'),{active:()=>lecture,busy:isTrainingActive,switchMode:async()=>{disposeManualWorkspace();disposeManualWorkspace=()=>{};if(!lecture){studentRoute=location.hash;studentSelection=laboratory?.laboratorySelection.id??'';lectureStorage=memoryStorage();progressStore=new ProgressStore(lectureStorage);learningStore=new LearningStore(lectureStorage,{memoryOnly:true});archiveStorage=lectureStorage;manualSession=new ManualSession();lecture=true;if(laboratory)laboratory.laboratorySelection.id='';}else {lecture=false;progressStore=studentProgress;learningStore=studentLearning;archiveStorage=storage;manualSession=studentManual;if(laboratory)laboratory.laboratorySelection.id=studentSelection;}document.documentElement.dataset.lecture=String(lecture);const message=saveLecture(storage,lecture);showStorage(learningStore.message);const route=lecture?'#/island':studentRoute;if(location.hash!==route)location.hash=route;else await render();return message||(lecture?'Temporary lecture session started; personal work remains private.':'Personal session restored.');},preset:async(id,seed)=>{if(!lecture)throw Error('Enter lecture mode before loading teaching presets.');laboratory??=await import('./laboratory/page.js');const config=lecturePreset(id,seed),a=laboratory.newArtifact(config);a.provenance='Supplied teaching configuration v1; fresh untrained agent.';a.prediction='Teaching hypothesis before results: observe how this declared configuration affects the measured return. This is a preset prompt, not a student prediction.';await laboratory.archiveStore(archiveStorage,true).put(a);laboratory.laboratorySelection.id=a.id;if(location.hash==='#/sandbox')await render();else location.hash='#/sandbox';}});
const menu = element('.menu-toggle');
const navigation = element('#site-navigation');
/** @param {boolean} open */
function setMenu(open) {
  menu.setAttribute('aria-expanded', String(open));
  navigation.classList.toggle('is-open', open);
}
menu.addEventListener('click', () => setMenu(menu.getAttribute('aria-expanded') !== 'true'));
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && menu.getAttribute('aria-expanded') === 'true') {
    setMenu(false);
    menu.focus();
  }
});
const narrowWorkspace = window.matchMedia('(max-width: 1000px)');
const narrowNavigation = window.matchMedia('(max-width: 900px)');
narrowNavigation.addEventListener('change', () => setMenu(false));
narrowWorkspace.addEventListener('change', updateWorkspacePanels);

function updateWorkspacePanels() {
  document.querySelectorAll('[data-panel]').forEach((panel) => {
    if (!(panel instanceof HTMLElement)) return;
    panel.hidden = narrowWorkspace.matches && panel.dataset.panel !== activeWorkspaceTab;
    panel.setAttribute('role', narrowWorkspace.matches ? 'tabpanel' : 'region');
  });
}
/** Bind standard arrow/Home/End tab keyboard behavior to a tablist. */
function bindTabs() {
  document.querySelectorAll('[role="tablist"]').forEach((list) => {
    list.addEventListener('keydown', (event) => {
      if (!(event instanceof KeyboardEvent) || !['ArrowRight', 'ArrowLeft', 'Home', 'End'].includes(event.key)) return;
      const tabs = Array.from(list.querySelectorAll('button'));
      const index = tabs.indexOf(/** @type {HTMLButtonElement} */ (document.activeElement));
      const next = event.key === 'Home' ? 0 : event.key === 'End' ? tabs.length - 1 : (index + (event.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length;
      event.preventDefault();
      tabs[next].focus();
      tabs[next].click();
    });
  });
}

/** @param {boolean} [moveFocus] */
async function render(moveFocus = true) {
  const version = ++renderVersion;
  await learningStore.ready;
  if(version!==renderVersion)return;
  disposeManualWorkspace();
  disposeManualWorkspace = () => {};
  const route = resolveRoute(window.location.hash, import.meta.env.DEV);
  if(['sandbox','compare','expedition','notebook'].includes(route.page)){laboratory??=await import('./laboratory/page.js');if(version!==renderVersion)return;}
  const main = element('#main');
  main.classList.toggle('workspace-container', (route.page === 'lesson' || route.page === 'practice'));
  let markup;
  switch (route.page) {
    case 'welcome': markup = welcomeView(); break;
    case 'island': markup = islandView(progressStore.data,learningStore.data); break;
    case 'lesson': markup = lessonView(/** @type {import('./content/curriculum.js').Lesson} */ (route.lesson)); break;
    case 'notebook': if(lecture){markup='<h1 tabindex="-1">Notebook hidden during projection</h1><section class="card lecture-private"><p>Personal notes, imports and saved student records are not loaded into this teaching session. Exit lecture mode to return to your Notebook. You can export a temporary teaching experiment from Sandbox.</p></section>';break;} markup = notebookView(progressStore.data)+laboratory?.notebookArchiveView()+learningNotebookSection(learningStore); break;
    case 'sandbox': case 'compare': case 'expedition': markup=laboratory?.laboratoryView(route.page,laboratory.laboratoryConfig());break;
    case 'practice': markup = practiceView(); break;
    case 'settings': markup = settingsView(preferences); break;
    case 'components': {
      if (import.meta.env.DEV) {
        const { componentView } = await import('./ui/components-dev.js');
        if (version !== renderVersion) return;
        markup = componentView();
      }
      break;
    }
    default: markup = unavailableView(route.page);
  }
  main.innerHTML = markup ?? unavailableView('not-found');
  document.title = `${main.querySelector('h1')?.textContent ?? 'RL Island'} · RL Island · ACML`;
  document.querySelectorAll('[data-nav]').forEach((link) => {
    const active = link instanceof HTMLElement && link.dataset.nav === (route.page === 'lesson' ? 'island' : route.page);
    if (active) link.setAttribute('aria-current', 'page');
    else link.removeAttribute('aria-current');
  });
  setMenu(false);
  if (moveFocus) {
    main.querySelector('h1')?.focus();
    window.scrollTo({ top: 0, behavior: 'instant' });
  }
  element('.site-footer').classList.toggle('focused-footer', route.page === 'lesson');
  activeWorkspaceTab = 'instructions';
  updateWorkspacePanels();
  bindTabs();
  if (['sandbox','compare','expedition'].includes(route.page)) disposeManualWorkspace=laboratory?.mountLaboratory(main,/** @type {'sandbox'|'compare'|'expedition'} */(route.page),laboratory.archiveStore(archiveStorage,lecture))??(()=>{});
  if (route.page === 'practice') disposeManualWorkspace = mountManualWorkspace(main, manualSession,archiveStorage);
  if (route.page === 'lesson' && route.lesson && ['01','02','03'].includes(route.lesson.id)) disposeManualWorkspace = mountLesson(element('#lesson-runtime'), /** @type {import('./content/foundations.js').FoundationId} */(route.lesson.id), progressStore);
  if (route.page === 'lesson' && route.lesson && ['04','05','06','07','08','09','10'].includes(route.lesson.id)) disposeManualWorkspace = mountLearningLesson(element('#lesson-runtime'), /** @type {'04'|'05'|'06'|'07'|'08'|'09'|'10'} */(route.lesson.id), learningStore);
  if(route.page==='lesson'&&route.lesson?.id==='11')disposeManualWorkspace=mountImitationLesson(element('#lesson-runtime'),learningStore);
  if (route.page === 'notebook'&&!lecture) {
    const foundationNotes=mountNotebook(main,progressStore,learningStore);
    const learningNotes=mountLearningNotebook(main,learningStore);
    const archive=laboratory?.mountArchive(main,laboratory.archiveStore(archiveStorage,lecture),progressStore,learningStore)??(()=>{});
    disposeManualWorkspace=()=>{foundationNotes();learningNotes();archive();};
  }
  document.querySelector('[data-scroll-list]')?.addEventListener('click', (event) => {
    event.preventDefault();
    element('#lesson-list').focus();
    element('#lesson-list').scrollIntoView({ block: 'start' });
  });
  document.querySelectorAll('[data-workspace-tab]').forEach((tab) => {
    tab.addEventListener('click', () => {
      activeWorkspaceTab = /** @type {HTMLElement} */ (tab).dataset.workspaceTab ?? 'instructions';
      document.querySelectorAll('[data-workspace-tab]').forEach((item) => {
        const selected = item === tab;
        item.setAttribute('aria-selected', String(selected));
        item.setAttribute('tabindex', selected ? '0' : '-1');
      });
      updateWorkspacePanels();
    });
  });
  document.querySelector('[data-enter-lecture]')?.addEventListener('click',()=>element('#lecture-toggle').click());
  if (route.page === 'settings') {
    element('#settings-status').textContent = preferenceMessage;
    const motion = /** @type {HTMLSelectElement} */ (element('#motion'));
    const scale = /** @type {HTMLSelectElement} */ (element('#font-scale'));
    const save = () => {
      preferences = { schemaVersion: 1, motion: motion.value === 'reduced' ? 'reduced' : 'system', fontScale: scale.value === 'large' ? 'large' : 'normal' };
      applyPreferences();
      preferenceMessage = savePreferences(storage, preferences);
      element('#settings-status').textContent = preferenceMessage;
    };
    motion.addEventListener('change', save);
    scale.addEventListener('change', save);
    element('#reset-preferences').addEventListener('click', () => {
      motion.value = defaultPreferences.motion;
      scale.value = defaultPreferences.fontScale;
      save();
    });
  }
}

document.querySelector('.skip-link')?.addEventListener('click', (event) => {
  event.preventDefault();
  element('#main').focus();
});
window.addEventListener('hashchange', () => { void render(); });
void render(false);



