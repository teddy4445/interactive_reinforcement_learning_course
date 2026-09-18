import { MAX_PROGRESS_BYTES, exportProgress, importProgress } from '../persistence/progress.js';
import { notebookEntries } from '../ui/learning-pages.js';
import { completion } from '../lessons/records.js';
/** @param {HTMLElement} root @param {import('../persistence/progress.js').ProgressStore} store @param {import('../persistence/learning-store.js').LearningStore} learningStore */
export function mountNotebook(root,store,learningStore) {
  const abort = new AbortController();
  /** @type {'reflections'|'experiments'|'progress'} */ let tab = 'reflections';
  /** @type {import('../persistence/progress.js').Progress|null} */ let pending = null;
  let disposed = false, loadVersion = 0;
  const entries = /** @type {HTMLElement} */(root.querySelector('#notebook-entries'));
  const status = /** @type {HTMLElement} */(root.querySelector('#transfer-status'));
  const dialog = /** @type {HTMLDialogElement} */(root.querySelector('#import-progress-dialog'));
  const input = /** @type {HTMLInputElement} */(root.querySelector('#progress-file'));
  function render() {
    entries.innerHTML = notebookEntries(tab,store.data,learningStore.data);
    const resume = root.querySelector('#notebook-resume');
    if (resume) resume.innerHTML = store.data.lastLesson ? `<a class="button secondary" href="#/lesson/${store.data.lastLesson}">Resume lesson ${store.data.lastLesson}</a>` : '';
  }
  root.addEventListener('click',(event) => {
    const button = event.target instanceof Element ? event.target.closest('button') : null;
    if (!button) return;
    if (button.dataset.recordTab) {
      tab = /** @type {typeof tab} */(button.dataset.recordTab);
      root.querySelectorAll('[data-record-tab]').forEach((node) => { node.setAttribute('aria-selected',String(node===button)); node.setAttribute('tabindex',node===button ? '0':'-1'); });
      entries.setAttribute('aria-labelledby',button.id); render();
    }
    if (button.id === 'export-progress') {
      try {
        const data = exportProgress(store.data), url = URL.createObjectURL(new Blob([data],{type:'application/json'}));
        const anchor = document.createElement('a'); anchor.href=url; anchor.download='rl-island-progress.json'; anchor.click(); setTimeout(() => URL.revokeObjectURL(url),1000);
        status.textContent='Progress exported as a self-reported learning artifact. Reflections were not graded.';
      } catch(error) { status.textContent=error instanceof Error ? error.message : 'Could not export progress.'; }
    }
    if (button.id === 'cancel-import') { loadVersion++; pending=null; dialog.close(); input.value=''; }
    if (button.id === 'confirm-import' && pending) {
      store.replace(pending); pending=null; dialog.close(); input.value=''; render(); status.textContent=store.message;
    }
  },{signal:abort.signal});
  input.addEventListener('change',async () => {
    const file=input.files?.[0], version=++loadVersion;
    if (!file) return;
    try {
      if (file.size > MAX_PROGRESS_BYTES) throw new Error('Progress file exceeds 512 KiB.');
      const text=await file.text(); if (disposed || version!==loadVersion) return;
      const imported=importProgress(text); pending=imported;
      const count=Object.entries(imported.lessons).filter(([id,r]) => completion(/** @type {import('../content/foundations.js').FoundationId} */(id),r)).length;
      /** @type {HTMLElement} */(root.querySelector('#import-preview')).textContent=`Validated ${Object.keys(imported.lessons).length} lesson records, ${count} complete. This is self-reported activity evidence.`;
      dialog.showModal();
    } catch(error) { pending=null; status.textContent=error instanceof Error ? error.message : 'Import failed. Current progress is unchanged.'; input.value=''; }
  },{signal:abort.signal});
  dialog.addEventListener('cancel',() => { loadVersion++; pending=null; input.value=''; },{signal:abort.signal});
  status.textContent=store.message; render();
  return () => { disposed=true; abort.abort(); dialog.close(); };
}

