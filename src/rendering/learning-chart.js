import Chart from 'chart.js/auto';
/** Trailing arithmetic mean; no interpolation or fabricated points. @param {number[]} values @param {number} [window] */
export const trailingMean=(values,window=7)=>values.map((_,i)=>{const slice=values.slice(Math.max(0,i-window+1),i+1);return slice.reduce((a,b)=>a+b,0)/slice.length;});
/** @param {HTMLCanvasElement} canvas @param {'training'|'evaluation'|'loss'} kind */
export function learningChart(canvas,kind){
 const font={size:document.documentElement.dataset.lecture==='true'?18:12};
 const chart=new Chart(canvas,{type:kind==='evaluation'?'bar':'line',data:{labels:/** @type {number[]} */([]),datasets:kind==='training'?[{label:'Raw observed training return',data:/** @type {number[]} */([]),borderColor:'#2563EB',backgroundColor:'#2563EB',pointRadius:1,borderWidth:1},{label:'Trailing mean (up to 7 episodes)',data:/** @type {number[]} */([]),borderColor:'#BE123C',backgroundColor:'#BE123C',pointRadius:0,borderWidth:2,borderDash:[6,4]}]:[{label:kind==='loss'?'Actual batch loss (no smoothing)':'Frozen evaluation return (no smoothing)',data:/** @type {number[]} */([]),backgroundColor:'#2563EB',borderColor:'#2563EB',borderWidth:kind==='loss'?1:0,pointRadius:kind==='loss'?1:0}]},options:{animation:false,responsive:true,maintainAspectRatio:false,plugins:{legend:{position:'bottom',labels:{font}}},scales:{x:{ticks:{font},title:{font,display:true,text:kind==='training'?'Completed training episode':kind==='loss'?'Optimizer update':'Evaluation episode'}},y:{ticks:{font},title:{font,display:true,text:kind==='loss'?'Mean ½ TD-error²':'Observed reward sum'}}}}});
 return {
 /** @param {{return:number,index?:number}[]} rows */
 update(rows){chart.data.labels=rows.map((r,i)=>r.index??i+1);chart.data.datasets[0].data=rows.map(r=>r.return);if(kind==='training')chart.data.datasets[1].data=trailingMean(rows.map(r=>r.return));chart.update('none');},destroy:()=>chart.destroy()};
}
