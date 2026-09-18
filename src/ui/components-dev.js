import { badge, heading } from './views.js';

/** Development-only view, excluded by Vite's production branch elimination. */
export function componentView() {
  return `${heading('Development only', 'Component reference', 'Local ACML tokens and reusable shell treatments.')}
  <div class="feature-grid"><section class="card"><h2>Brand tokens</h2><div class="swatch blue">Blue · #2563EB</div><div class="swatch rose">Rose · #F43F5E</div><p>8 px controls · 20 px cards · pill navigation</p></section>
  <section class="card"><h2>Buttons & status</h2><div class="actions"><button class="button primary">Primary specimen</button><button class="button secondary">Secondary specimen</button><button class="button secondary" disabled>Unavailable</button></div><p>${badge('Preview')} ${badge('Pending review', 'rose')}</p></section>
  <section class="card"><h2>Form controls</h2><label class="field">Example selection<select><option>Standard</option><option>Large</option></select></label><label class="field">Example text<input placeholder="Example only" /></label><p class="source-note">These are component specimens, not learning data.</p></section></div>`;
}

