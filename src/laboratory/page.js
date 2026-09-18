export {laboratoryConfig} from './config.js';
export {laboratoryView} from './view.js';
export {mountLaboratory} from './controller.js';
export {notebookArchiveView,mountArchive} from './notebook.js';
import {LaboratoryStore} from './store.js';
/** @type {WeakMap<object,LaboratoryStore>} */const stores=new WeakMap();
/** @param {Pick<Storage,'getItem'|'setItem'>} storage @param {boolean} [memoryOnly] */
export function archiveStore(storage,memoryOnly=false){let store=stores.get(storage);if(!store){store=new LaboratoryStore(storage,memoryOnly?null:undefined,memoryOnly);stores.set(storage,store);}return store;}
export {newArtifact} from './records.js';
export {laboratorySelection} from './controller.js';
