import { rememberFocus } from '../ui/focus.js';
import { foundations, lessonScenario } from '../content/foundations.js';
import { stages } from '../content/curriculum.js';
import { IslandEnvironment } from '../environment/engine.js';
import { ACTIONS, stateKey } from '../environment/schema.js';
import { createIslandRenderer } from '../rendering/island-renderer.js';
import { actionBackup, discountedReturn } from '../planning/planners.js';
import { baseline, calculate } from './calculations.js';
import { checkAttempt, completion, mathConfig, missionPassed, replayEpisode, requirements } from './records.js';
import { escapeHtml as h } from '../ui/escape.js';
/** @typedef {import('../content/foundations.js').FoundationId} FoundationId */
/** @param {number} n */ const number = (n) => Math.abs(n) < 1e-7 && n !== 0 ? n.toExponential(3) : Number(n.toFixed(6)).toString();
/** @param {string} label @param {string} action @param {boolean} [disabled] */
const button = (label,action,disabled=false) => `<button class="button secondary" data-lesson-action="${action}" ${disabled ? 'disabled' : ''}>${label}</button>`;
/** @param {string[]} options @param {string} name */
const choices = (options,name) => `<select name="${name}" required><option value="">Choose an answer</option>${options.map((v) => `<option>${h(v)}</option>`).join('')}</select>`;
/** @param {HTMLElement} root @param {FoundationId} id @param {import('../persistence/progress.js').ProgressStore} store */
export function mountLesson(root,id,store) {
  const content = foundations[id], record = store.lesson(id);
  let environment = IslandEnvironment.deserialize(record.play.checkpoint);
  let feedback = '';
  let resize = /** @type {ResizeObserver|null} */(null);
  const abort = new AbortController();
  /** @type {{calculation:ReturnType<typeof calculate>,frames:{algorithm:string,frame:import('../planning/planners.js').Frame}[],index:number,target:'math'|'experiment',trial:number}|null} */
  let job = null;
  /** @type {ReturnType<typeof setTimeout>|undefined} */ let timer;
  let animated = false;
  const now = () => new Date().toISOString();
  function save() { store.save(id); }
  function stop() { clearTimeout(timer); timer = undefined; animated = false; }
  /** @param {string} selector */
  function element(selector) {
    const found = root.querySelector(selector);
    if (!(found instanceof HTMLElement)) throw new Error('Missing lesson control ' + selector);
    return found;
  }
  function stageLocked() { return record.stage >= 2 && !record.prediction; }
  function currentTrial() { return record.experiments[record.experiments.length-1]; }
  /** @param {import('./calculations.js').Calculation} result */
  function resultView(result) {
    if (id === '01') return `<div class="return-pair"><div><span>5 after one action</span><strong>${number(result.values[0][0])}</strong></div><div><span>20 after four actions</span><strong>${number(result.values[0][1])}</strong></div></div><p>γ = ${result.config.parameter}. The larger computed return is ${result.values[0][0] === result.values[0][1] ? 'a tie' : result.values[0][0] > result.values[0][1] ? 'the immediate option' : 'the delayed option'}. No sampled or learned policy is implied.</p>`;
    const model = calculate(result.config).model;
    return `<div class="result-comparison">${result.algorithms.map((algorithm,i) => `<section class="computed-result"><h3>${h(algorithm)}</h3><p><strong>${result.sweeps[i]}</strong> value sweeps · residual <strong>${number(result.residuals[i])}</strong> · ${result.converged[i] ? 'Tolerance reached' : 'Budget reached; not converged'}</p><div class="value-cells">${model.states.map((s,j) => `<div><span>${h(s.key)}${s.terminal ? ' · goal' : ''}</span><strong>${number(result.values[i][j])}</strong></div>`).join('')}</div></section>`).join('')}</div><p class="small">Exact model · position observation · ${h(result.scenarioHash)} · γ ${id === '02' ? .9 : result.config.parameter} · slip ${id === '02' ? result.config.parameter : 0}. Planning does not consume environment RNG. Values are rounded to six decimals; exports retain full precision. These are computed values, not student grades or sampled episode scores.</p>`;
  }
  function jobView() {
    if (!job) return '';
    const item = job.frames[job.index];
    return `<section class="planning-animation" aria-label="Computed planning frames"><p class="eyebrow">${h(item.algorithm)} · ${h(item.frame.phase)}</p><p>${item.frame.round ? `Policy round ${item.frame.round} · ` : ''}Iteration ${item.frame.iteration} · residual ${number(item.frame.residual)} · changed actions ${item.frame.changes}</p><div class="value-cells" id="animated-values">${job.calculation.model.states.map((s,i) => `<div><span>${h(s.key)}${s.terminal ? ' · terminal' : ''}</span><strong>${number(item.frame.values[i])}</strong><small>${s.terminal ? 'No action' : item.frame.policy[i].map((p,a) => p ? ACTIONS[a] + (p === 1 ? '' : ' ' + p) : '').filter(Boolean).join(', ')}</small></div>`).join('')}</div><label>Computed frame ${job.index+1} of ${job.frames.length}<progress value="${job.index+1}" max="${job.frames.length}"></progress></label><div class="actions">${button('Next computed frame','frame')}${button(animated ? 'Pause animation' : 'Animate computed sweeps','animate')}${button('Show final computed result','finish')}</div><p class="small">Every frame is an actual numerical table (values rounded to six decimals). Animation only controls presentation. Policy evaluation uses its fixed-policy residual; improvement uses the optimality residual. Leaving this stage cancels playback; unfinished runs do not count as evidence.</p></section>`;
  }
  function observeView() {
    return `<p class="eyebrow">Mission 1 · ${h(content.missions[0])}</p><h2 tabindex="-1" id="stage-title">Observe the problem</h2>${content.observe.map((p) => `<p>${h(p)}</p>`).join('')}<div class="lesson-map-key"><span>A · start (0,0)</span><span>B · (1,0)</span><span>G · goal (2,0)</span></div><form data-check="observe"><label class="field">${h(content.observeCheck.prompt)}${choices(content.observeCheck.options,'answer')}</label><button class="button primary">Check understanding</button></form>`;
  }
  function predictView() {
    return `<p class="eyebrow">Commit before you compare</p><h2 tabindex="-1" id="stage-title">Predict an outcome</h2><p>${h(content.prediction)}</p>${record.prediction ? `<div class="inset"><strong>Saved prediction</strong><p>${h(record.prediction.answer)}</p><small>${h(record.prediction.at)} · kept even if it turns out wrong.</small></div><p>Your prediction is locked for this worked example. A different prediction can be recorded for a new experiment.</p>` : `<form data-form="prediction"><label class="field">Your prediction${choices(content.predictionOptions,'prediction')}</label><button class="button primary">Save prediction</button></form>`}<p class="small">Predictions are not graded. Results and play unlock after saving, including when exploring stages ahead.</p>`;
  }
  function playView() {
    const {env,traces} = replayEpisode(id,record.play), state = env.getState(), last = traces[traces.length-1], info = env.getInfo();
    return `<p class="eyebrow">Mission 2 · an actual interaction</p><h2 tabindex="-1" id="stage-title">Play and inspect</h2><p>${h(content.play)}</p><div class="lesson-play-grid"><div><canvas id="lesson-canvas" width="520" height="365" tabindex="0" role="img" aria-label="Robo at ${stateKey(state)}. Use arrow keys or WASD." aria-describedby="lesson-state"></canvas><p id="lesson-state" role="status">State ${h(stateKey(state))} · ${info.steps} actions · reward sum ${number(info.totalReward)} · ${info.terminated ? 'Goal reached' : info.truncated ? 'External rollout truncated' : 'Active'}</p><div class="actions movement-buttons">${(id === '02' ? ['right'] : ACTIONS).map((a) => button(id === '02' ? 'Follow right policy once' : 'Move ' + a,'move-' + a,info.terminated || info.truncated)).join('')}</div>${button('Reset practice episode','reset-play')}<p class="small">Reset preserves saved activities and completed missions. The seed is 7. External cap: 80 accepted actions. Every displayed state field is part of the agent observation.</p></div><div class="lesson-trace"><h3>State → action → reward → next state</h3>${last ? `<dl><dt>State</dt><dd>${h(stateKey(last.state))}</dd><dt>Action / movement</dt><dd>${last.action} / ${last.movement}${last.collision ? ' (blocked)' : ''}</dd><dt>Reward</dt><dd>${last.reward}</dd><dt>Next state</dt><dd>${h(stateKey(last.nextState))}</dd><dt>Terminated / truncated</dt><dd>${last.terminated} / ${last.truncated}</dd></dl><table><caption>Exact outcomes for that action</caption><thead><tr><th>Next state</th><th>Probability</th><th>Reward</th></tr></thead><tbody>${last.outcomes.map((o) => `<tr><td>${h(stateKey(o.nextState))}</td><td>${number(o.probability*100)}%</td><td>${o.reward}</td></tr>`).join('')}</tbody></table>` : '<p>No action yet. The table will contain the actual accepted transition.</p>'}<details><summary>Text map</summary>${lessonScenario(id).grid.map((row,y) => `<p>${[...row].map((tile,x) => `(${x},${y}) ${state.x===x && state.y===y ? 'Robo on ' : ''}${tile === '#' ? 'wall' : tile === 'G' ? 'goal' : 'floor'}`).join(' · ')}</p>`).join('')}</details></div></div>`;
  }
  function mathView() {
    const result = record.math;
    let detail = '';
    if (id === '01' && record.play.actions.length) {
      const rewards = replayEpisode(id,record.play).traces.map((t) => /** @type {import('../environment/types.js').StepTrace} */(t).reward);
      detail = `<p>Your actual current rewards: [${rewards.join(', ')}]. Their discounted ${environment.getInfo().terminated ? 'complete return' : 'prefix return (episode incomplete)'} at γ=0.9 is <strong>${number(discountedReturn(rewards,.9))}</strong>.</p>`;
    }
    if (id === '02') {
      const calculation = calculate(mathConfig(id)), model = calculation.model;
      const b = /** @type {number} */(model.index.get('1,0'));
      const backup = actionBackup(model,model.states.map(() => 0),b,1,.9);
      detail = `<p class="worked-backup">Actual first backup at B: ${backup.terms.map((t) => `${number(t.probability)} × (${t.reward} + ${number(t.continuation)})`).join(' + ')} = ${number(backup.value)}.</p>`;
    }
    return `<p class="eyebrow">Mission 2 · ${h(content.missions[1])}</p><h2 tabindex="-1" id="stage-title">Reveal the mathematics</h2><div class="formula">${h(content.formula)}</div>${content.math.map((p) => `<p>${h(p)}</p>`).join('')}${detail}<div class="inset"><strong>A common misconception</strong><p>${h(content.misconception)}</p></div>${job ? jobView() : result ? resultView(result) : button(id === '01' ? 'Calculate worked example' : 'Compute planning frames','calculate-math')}<form data-check="math"><label class="field">${h(content.mathQuestion)}<input name="answer" type="number" step="any" required></label><button class="button primary">Check calculation</button></form>`;
  }
  function experimentView() {
    const trial = currentTrial(), parameterName = id === '02' ? 'Slip probability' : 'Discount gamma';
    const pending = trial && !trial.result;
    const defaultParameter = ({'01':.9,'02':.4,'03':.5})[id];
    return `<p class="eyebrow">Mission 3 · change one factor</p><h2 tabindex="-1" id="stage-title">Experiment with evidence</h2><p>${h(content.experiment)}</p><p>Choose ${id === '02' ? 'slip from 0 to 0.8. Intended probability is 1 − slip; each sideways probability is slip / 2' : 'a discount from 0 to ' + (id === '01' ? '1' : '0.99')}. Change it by at least 0.05 from the worked example (${baseline(id)}). ${id === '02' ? 'The right policy and γ=0.9 remain fixed.' : 'The map and rewards remain fixed.'}</p>
    ${pending ? `<div class="inset"><strong>Prediction saved before this run</strong><p>${h(trial.prediction.answer)}</p><p>${parameterName}: ${trial.config.parameter}</p></div>${job ? jobView() : button(id === '01' ? 'Calculate experiment' : 'Compute experiment frames','calculate-experiment')}` : `${trial?.result ? resultView(trial.result) : ''}<form data-form="experiment"><label class="field">${parameterName}<input type="number" name="parameter" min="0" max="${id === '02' ? .8 : id === '01' ? 1 : .99}" step="0.05" value="${defaultParameter}" required></label><label class="field">Prediction for this chosen setting<textarea name="prediction" rows="2" maxlength="300" required placeholder="${h(content.experimentPrediction)}"></textarea></label><button class="button primary" ${record.experiments.length >= 12 ? 'disabled' : ''}>Save experiment prediction</button></form>`}
    <p class="small">${record.experiments.filter((t) => t.result).length} completed experiments saved · maximum 12 per lesson. Predictions remain alongside their results. No free text is automatically graded.</p>`;
  }
  function challengeView() {
    const trial = [...record.experiments].reverse().find((t) => t.result);
    const prompt = id === '02' && trial ? `At slip ${trial.config.parameter} and zero initial values, what is the first backup at B?` : id === '03' && trial ? `At γ = ${trial.config.parameter}, what optimal value should both planners produce at A?` : content.challengeQuestion;
    const reqs = requirements(id,record);
    return `<p class="eyebrow">Bring the evidence together</p><h2 tabindex="-1" id="stage-title">Challenge and reflect</h2><p>${id === '01' ? 'Reach the campsite in no more than 6 accepted actions, identify its transition, and calculate the discounted return. The shortest route has 2 actions; 6 allows four extra moves.' : id === '02' ? 'Complete the changed-slip fixed-policy experiment to residual ≤ 0.000001, then calculate a backup and explain merged outcomes.' : 'Run both planners on the identical changed-discount task. Each must report residual ≤ 0.000001, and their values must agree within 0.000001. Then explain the stopping evidence.'}</p><p class="small">These task thresholds are calibrated against deterministic reference computations and recorded runs; they are local activity criteria, not authenticated grades.</p><form data-check="challenge"><label class="field">${h(prompt)}<input name="answer" type="number" step="any" required></label><label class="field">${h(content.challengeCheck.prompt)}${choices(content.challengeCheck.options,'choice')}</label><p class="small">Numerical answers accept an absolute error up to 0.01; concept choices must be correct.</p><button class="button primary">Submit challenge</button></form><div class="completion-summary"><h3>${completion(id,record) ? 'Lesson complete' : 'Evidence still needed'}</h3><ul>${reqs.map((r) => `<li>${r.done ? '✓' : '○'} ${r.label}</li>`).join('')}</ul>${completion(id,record) ? `<p>Activities covered: ${h(content.objectives.join(' '))} Completed activities and explicit checks are saved; this does not certify mastery of the course.</p><a class="button primary" href="${id==='03' ? '#/island' : '#/lesson/' + (id==='01' ? '02':'03')}">${id==='03' ? 'Return to the island' : 'Explore the next lesson'}</a>` : ''}</div><form data-form="reflection"><label class="field">${h(content.reflection)}<textarea name="reflection" rows="4" maxlength="2000">${h(record.reflection)}</textarea></label><button class="button secondary">Save reflection</button><p class="small">Saving reflection text does not change completion or award a score.</p></form>`;
  }
  function render(focus=false) {
    const active = document.activeElement;
    const restore = rememberFocus(root);
    // Keep typed answers and keyboard focus while numerical playback refreshes the view.
    const drafts = [...root.querySelectorAll('form')].flatMap((form) => {
      const kind = form.dataset.check ? '[data-check="' + form.dataset.check + '"]' : '[data-form="' + form.dataset.form + '"]';
      return [...form.querySelectorAll('input,select,textarea')].flatMap((field) => field instanceof HTMLInputElement || field instanceof HTMLSelectElement || field instanceof HTMLTextAreaElement ? [{selector:kind + ' [name="' + field.name + '"]',value:field.value,focused:field === active}] : []);
    });
    resize?.disconnect();
    const done = requirements(id,record), views = [observeView,predictView,playView,mathView,experimentView,challengeView];
    const prerequisite = content.prerequisites.filter((p) => !completion(p,store.data.lessons[p]));
    root.innerHTML = `<nav class="lesson-stage-nav" aria-label="Lesson stages">${stages.map((stage,i) => `<button class="${record.stage===i ? 'is-current' : ''}" data-stage="${i}" aria-current="${record.stage===i ? 'step' : 'false'}"><span>${i+1}</span>${stage}</button>`).join('')}</nav><div class="guided-layout"><aside class="card lesson-roadmap"><p class="eyebrow">Lesson ${id} · six stages</p><h2>Learn by checking</h2><ul>${done.map((r) => `<li class="${r.done ? 'requirement-done' : ''}">${r.done ? '✓' : '○'} ${h(r.label)}</li>`).join('')}</ul><p><strong>${done.filter((r) => r.done).length} / 6</strong> activity requirements met</p>${prerequisite.length ? `<p class="small">Suggested first: ${prerequisite.map((p) => `<a href="#/lesson/${p}">Lesson ${p}</a>`).join(', ')}. Exploration is open; visiting stages grants no completion.</p>` : '<p class="small">Explore stages freely. Complete the activities to earn completion.</p>'}<a href="#/practice">Open the free manual lab ↗</a><details><summary>Source and scope</summary><p>${h(content.sourceStatus)}</p><p>Source filename: ${h(content.source)}. Original explanations and exercises; no slide-page claims.</p></details></aside><section class="card lesson-stage" aria-labelledby="stage-title">${stageLocked() ? '<h2 id="stage-title" tabindex="-1">Save a prediction first</h2><p>You can explore the stage names ahead. Experimental results and play stay hidden until your prediction is recorded.</p>' + button('Go to Predict','predict') : views[record.stage]()}<p id="lesson-feedback" role="status" aria-live="polite">${h(feedback)}</p><div class="lesson-stage-footer">${button('Previous stage','previous',record.stage===0)}<span>${record.stage+1} / 6</span>${button('Next stage','next',record.stage===5)}</div></section></div><p id="progress-storage-status" class="storage-note" role="status">${h(store.message)}</p>`;
    const canvas = root.querySelector('#lesson-canvas');
    if (canvas instanceof HTMLCanvasElement) {
      const renderer = createIslandRenderer(canvas);
      const draw = () => renderer.draw(environment.getScenario(),environment.getState());
      draw(); resize = new ResizeObserver(draw); resize.observe(canvas);
    }
    for (const draft of drafts) {
      const field = root.querySelector(draft.selector);
      if (field instanceof HTMLInputElement || field instanceof HTMLSelectElement || field instanceof HTMLTextAreaElement) { field.value = draft.value; if (draft.focused && !focus) field.focus({preventScroll:true}); }
    }
    if (focus) element('#stage-title').focus({preventScroll:true});
    else restore();

  }
  /** @param {'math'|'experiment'} target */
  function startCalculation(target) {
    if (!record.prediction) throw new Error('Save your prediction first.');
    const trial = currentTrial();
    if (target === 'experiment' && (!trial || trial.result)) throw new Error('Save a new experiment prediction first.');
    const calculation = calculate(target === 'math' ? mathConfig(id) : trial.config);
    const frames = calculation.runs.flatMap((run) => run.frames.map((frame) => ({algorithm:run.algorithm,frame})));
    job = {calculation,frames,index:0,target,trial:record.experiments.length-1};
    if (!frames.length) finish();
  }
  function finish() {
    if (!job) return;
    if (job.target === 'math') record.math = job.calculation.summary;
    else record.experiments[job.trial].result = job.calculation.summary;
    stop(); job = null; feedback = 'Actual computation saved with its configuration and prior prediction.'; save();
  }
  function nextFrame() {
    if (!job) return;
    if (job.index+1 >= job.frames.length) finish(); else job.index++;
    if (job) {
      const active = document.activeElement;
      const panel = root.querySelector('.planning-animation');
      const action = active instanceof HTMLElement && panel?.contains(active) ? active.dataset.lessonAction : undefined;
      if (panel) panel.outerHTML = jobView();
      const replacement = action ? root.querySelector(`[data-lesson-action="${action}"]`) : null;
      if (replacement instanceof HTMLElement) replacement.focus({preventScroll:true});
    } else render();
    if (animated && job) timer = setTimeout(nextFrame,350);
  }
  /** @param {number} stage */
  function navigate(stage) { stop(); job=null; record.stage=Math.max(0,Math.min(5,stage)); feedback=''; save(); render(true); }
  /** @param {import('../environment/types.js').Action} action */
  function move(action) {
    if (!record.prediction || record.stage !== 2 || id === '02' && action !== 'right') return;
    const result = environment.step(action);
    if (result.advanced) {
      record.play.actions.push(action); record.play.checkpoint=environment.serialize();
      if (!record.mission && missionPassed(id,record.play)) record.mission=structuredClone(record.play);
      save(); feedback=result.terminated ? 'Goal reached. Your episode is recorded.' : result.truncated ? 'External rollout limit reached. Reset practice to continue.' : '';
    }
    render(); const canvas = root.querySelector('#lesson-canvas'); if (canvas instanceof HTMLCanvasElement) canvas.focus({preventScroll:true});
  }
  root.addEventListener('click',(event) => {
    const target = event.target instanceof Element ? event.target.closest('button') : null;
    if (!target) return;
    try {
      if (target.dataset.stage !== undefined) { navigate(Number(target.dataset.stage)); return; }
      const action = target.dataset.lessonAction;
      if (!action) return;
      if (action.startsWith('move-')) { move(/** @type {import('../environment/types.js').Action} */(action.slice(5))); return; }
      if (action === 'next' || action === 'previous' || action === 'predict') { navigate(action === 'predict' ? 1 : record.stage+(action==='next' ? 1:-1)); return; }
      if (action === 'reset-play') { environment.reset(); record.play={actions:[],checkpoint:environment.serialize()}; feedback='Practice reset. Saved activity evidence is preserved.'; save(); }
      if (action === 'calculate-math') startCalculation('math');
      if (action === 'calculate-experiment') startCalculation('experiment');
      if (action === 'frame') { stop(); nextFrame(); return; }
      if (action === 'finish') finish();
      if (action === 'animate') { if (animated) stop(); else { animated=true; timer=setTimeout(nextFrame,350); } }
      render();
    } catch (error) { feedback=error instanceof Error ? error.message : 'Could not complete this action.'; render(); }
  },{signal:abort.signal});
  root.addEventListener('keydown',(event) => {
    if (!(event instanceof KeyboardEvent) || !(event.target instanceof HTMLCanvasElement)) return;
    const map = /** @type {Record<string,import('../environment/types.js').Action>} */({ArrowUp:'up',w:'up',ArrowRight:'right',d:'right',ArrowDown:'down',s:'down',ArrowLeft:'left',a:'left'});
    const action=map[event.key]; if (action) { event.preventDefault(); if (!event.repeat) move(action); }
  },{signal:abort.signal});
  root.addEventListener('submit',(event) => {
    event.preventDefault();
    if (!(event.target instanceof HTMLFormElement)) return;
    const form=event.target, fields=new FormData(form), text=(/** @type {string} */name) => String(fields.get(name) ?? '').trim();
    try {
      if (form.dataset.check) {
        if (record.attempts.length >= 60) throw new Error('This lesson has reached its 60 saved-check limit. Export your record for review.');
        const stage=/** @type {'observe'|'math'|'challenge'} */(form.dataset.check);
        if (stage !== 'observe' && !record.prediction) throw new Error('Save a prediction first.');
        const attempt={stage,answers:stage==='challenge' ? [text('answer'),text('choice')] : [text('answer')],at:now(),trial:stage==='challenge' ? record.experiments.map((t) => Boolean(t.result)).lastIndexOf(true) : null};
        record.attempts.push(attempt);
        const correct=checkAttempt(id,record,attempt);
        feedback=(correct ? 'Correct. ' : 'Not yet. ') + (stage==='observe' ? content.observeCheck.explanation : stage==='math' ? content.mathExplanation : content.challengeCheck.explanation);
      }
      if (form.dataset.form === 'prediction' && !record.prediction) {
        if (!text('prediction')) throw new Error('Choose a prediction.');
        record.prediction={answer:text('prediction'),at:now()}; feedback='Prediction saved before results. Continue to Play.';
      }
      if (form.dataset.form === 'experiment') {
        if (!record.prediction || record.experiments.length >= 12) throw new Error('This experiment cannot be added.');
        if (!text('prediction')) throw new Error('Record your prediction.');
        const config={lesson:id,phase:/** @type {const} */('experiment'),parameter:Number(text('parameter'))};
        calculate(config); // Validate without displaying or recording the result.
        record.experiments.push({config,prediction:{answer:text('prediction').slice(0,300),at:now()},result:null});
        feedback='Prediction saved. You can now compute this experiment.';
      }
      if (form.dataset.form === 'reflection') { record.reflection=text('reflection').slice(0,2000); record.reflectionAt=now(); feedback='Reflection saved without automatic interpretation or grading.'; }
      save(); render();
    } catch(error) { feedback=error instanceof Error ? error.message : 'Could not save activity.'; render(); }
  },{signal:abort.signal});
  document.addEventListener('visibilitychange',() => { if (document.hidden) { stop(); render(); } },{signal:abort.signal});
  render();
  return () => { stop(); resize?.disconnect(); abort.abort(); };
}


