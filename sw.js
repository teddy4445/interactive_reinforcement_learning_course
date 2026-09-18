/// <reference lib="webworker" />
/* Build replaces the manifest. This worker never reads or writes learning storage. */
const manifest=/** @type {{version:string,entries:{url:string,bytes:number,sha256:string}[]}} */(/** @type {unknown} */({"schemaVersion":1,"base":"/rl-island/","version":"a85e523ba15ccbfba6ba","entries":[{"url":"/rl-island/assets/acml-logo.png","bytes":8046,"sha256":"ca301a8120e874973d1a558ab6efb3abd3b2bfdc272be0b981098166180738d2"},{"url":"/rl-island/assets/index-9XUBB3v8.css","bytes":50863,"sha256":"b2d8b3341b255e2cbc1f12ccc78cd511faa2d729972a5ae0151d1bc505e7bc30"},{"url":"/rl-island/assets/index-B9FAQEzi.js","bytes":519971,"sha256":"069daad677575d0c2f91e5f232c2f3500b1486ef7a446d80d031dedceba748ea"},{"url":"/rl-island/assets/inter-latin-400-normal-C38fXH4l.woff2","bytes":23664,"sha256":"8909904ab6c872eb994093482a88a28eca2cd95912d7b6fecd72103b0dc07edc"},{"url":"/rl-island/assets/inter-latin-400-normal-CyCys3Eg.woff","bytes":30696,"sha256":"e20fa0b4fd2dd26e4d14b3ac3cc922509c3a63fa5e910e90c614544aa042dd45"},{"url":"/rl-island/assets/inter-latin-500-normal-BL9OpVg8.woff","bytes":31284,"sha256":"9b42c108da48b5ed55a3072e815ffee2d271562e6c0dd6998910e8f9c09e0a3d"},{"url":"/rl-island/assets/inter-latin-500-normal-Cerq10X2.woff2","bytes":24272,"sha256":"f3779f1efccc4bdcdf9c0a02ab95bf6bd092ed09c48c08cedc725889edd1d19f"},{"url":"/rl-island/assets/inter-latin-600-normal-CiBQ2DWP.woff","bytes":31260,"sha256":"6a9cb3a509b4eeaf12b7dda6c4aacac3e85d07f4201bf4dd716e332e692b87bd"},{"url":"/rl-island/assets/inter-latin-600-normal-LgqL8muc.woff2","bytes":24452,"sha256":"f9a06e79cd3a2a20951c0f0e28f66dd0e6d3fda73911d640a2125c8fcb78f21a"},{"url":"/rl-island/assets/inter-latin-700-normal-BLAVimhd.woff","bytes":31320,"sha256":"7c5ed5655730de337704d3fc94628515cd7e3d8d32368871709bf56ac0397e7a"},{"url":"/rl-island/assets/inter-latin-700-normal-Yt3aPRUw.woff2","bytes":24356,"sha256":"6f56409fd3d64bb85f7d070bce20749db2d66b6d63cec586cc22d1c761be2491"},{"url":"/rl-island/assets/learner-DVaGqjuE.js","bytes":580964,"sha256":"cd7ffc01d1b73d5b979853743f864e6893e41c6f1870004ec7c64f3b07a27e0b"},{"url":"/rl-island/assets/licenses/ACML-MIT.txt","bytes":1071,"sha256":"51eb56eccf5be54587b492e857e2b2d0096d91ee5844e882198cccb2db5441f7"},{"url":"/rl-island/assets/licenses/Apache-2.0.txt","bytes":11560,"sha256":"3ddf9be5c28fe27dad143a5dc76eea25222ad1dd68934a047064e56ed2fa40c5"},{"url":"/rl-island/assets/licenses/Chart-MIT.txt","bytes":1093,"sha256":"41a84aa2caba645f966a18d9c2056b73e6d3a81d80bc0046bc0011a2634d4cce"},{"url":"/rl-island/assets/licenses/Inter-OFL.txt","bytes":4477,"sha256":"3b0a5fca3d17942cde889069889dedbbbd075e9b599968c82a95f4d944e9b345"},{"url":"/rl-island/assets/licenses/Kurkle-Color-MIT.txt","bytes":1085,"sha256":"89ba0032731489153d552db918b727feb05128cf9eca20092875a9ad14147671"},{"url":"/rl-island/assets/licenses/Seedrandom-MIT.txt","bytes":1050,"sha256":"54624bc262234371635aacf512f779e523fc06412869108d0758b71569f7c41a"},{"url":"/rl-island/assets/licenses/THIRD-PARTY-NOTICES.txt","bytes":869,"sha256":"0b0a60e17028fa1aace428f84911a659895369d7cd3e7e07158b6155983bfbf9"},{"url":"/rl-island/assets/page-C34MMlFJ.js","bytes":55262,"sha256":"4097551dab1efca0d37dec8b8c55a11de9166a0d1f5c7d11a5923578787ac135"},{"url":"/rl-island/assets/training.worker-BW848dpu.js","bytes":62566,"sha256":"17df059cbe75ac1f833a96744ad26e74865768b2fcefb370633899ce81e840f7"},{"url":"/rl-island/index.html","bytes":796,"sha256":"3678624b3ae8298ccb06a688173dc09e3317a78c51e7fa806335162c3e44980c"}]}));
const sw=/** @type {ServiceWorkerGlobalScope} */(/** @type {unknown} */(self));
const BASE='/rl-island/',PREFIX='rl-island:/rl-island/:course:v1-',CACHE=PREFIX+manifest.version;
const urls=manifest.entries.map(e=>e.url),marker=BASE+'__offline-complete__';
/** @param {string} url */
const scoped=url=>{const u=new URL(url,sw.location.origin);return u.origin===sw.location.origin&&u.pathname.startsWith(BASE);};
const windows=async()=> (await sw.clients.matchAll({type:'window',includeUncontrolled:true})).filter(c=>scoped(c.url));
/** @param {Record<string,unknown>} message */
const broadcast=async message=>{for(const client of await windows())client.postMessage({source:'rl-island-offline',...message});};
async function install(){
 try{
  if(new URL(sw.registration.scope).pathname!==BASE)throw Error('Unsafe service-worker scope.');
  const cache=await caches.open(CACHE);let done=0;
  for(let start=0;start<manifest.entries.length;start+=4){
   await Promise.all(manifest.entries.slice(start,start+4).map(async entry=>{
    if(!entry.url.startsWith(BASE)||entry.url.includes('..'))throw Error('Invalid cache path.');
    const response=await fetch(entry.url,{cache:'no-store',credentials:'same-origin',redirect:'error'});
    if(!response.ok)throw Error('Asset unavailable: '+entry.url);
    const bytes=await response.clone().arrayBuffer(),digest=[...new Uint8Array(await crypto.subtle.digest('SHA-256',bytes))].map(x=>x.toString(16).padStart(2,'0')).join('');
    if(digest!==entry.sha256)throw Error('Build asset integrity mismatch: '+entry.url);
    await cache.put(entry.url,response);done++;
   }));
   await broadcast({status:'caching',done,total:urls.length,version:manifest.version});
  }
  await cache.put(marker,new Response(manifest.version));await broadcast({status:'cached',total:urls.length,version:manifest.version});
 }catch(error){await caches.delete(CACHE).catch(()=>{});await broadcast({status:'failed',error:error instanceof Error?error.message:String(error)});throw error;}
}
sw.addEventListener('install',event=>event.waitUntil(install()));
sw.addEventListener('activate',event=>event.waitUntil(sw.clients.claim()));
sw.addEventListener('fetch',event=>{
 const r=event.request,u=new URL(r.url);if(r.method!=='GET'||!scoped(r.url))return;
 const path=r.mode==='navigate'&&(u.pathname===BASE||u.pathname===BASE+'index.html')?BASE+'index.html':u.pathname;
 if(!urls.includes(path)&&!path.startsWith(BASE+'assets/'))return;
 event.respondWith((async()=>{try{
  const current=await caches.open(CACHE),hit=await current.match(path);if(hit)return hit;
  for(const name of await caches.keys())if(name.startsWith(PREFIX)&&name!==CACHE){const old=await (await caches.open(name)).match(path);if(old)return old;}
 }catch{/* Network remains usable when Cache Storage is unavailable. */}return fetch(r);})());
});
async function cacheStatus(){const cache=await caches.open(CACHE),complete=Boolean(await cache.match(marker))&&(await Promise.all(urls.map(url=>cache.match(url)))).every(Boolean);return {source:'rl-island-offline',status:complete?'ready':'incomplete',version:manifest.version,total:urls.length,bytes:manifest.entries.reduce((n,e)=>n+e.bytes,0),scope:sw.registration.scope};}
/** @type {Promise<void>|null} */let repair=null;
sw.addEventListener('message',event=>{
 const source=event.source;if(!source||!('url' in source)||!scoped(source.url))return;
 event.waitUntil((async()=>{try{
  if(event.data?.type==='STATUS')event.ports[0]?.postMessage(await cacheStatus());
  if(event.data?.type==='REPAIR'&&event.data.version===manifest.version)await (repair??=install().finally(()=>{repair=null;}));
  if(event.data?.type==='ACTIVATE'&&event.data.version===manifest.version){const result=await cacheStatus();if(result.status!=='ready')throw Error('Update cache is incomplete.');await sw.skipWaiting();}
  if(event.data?.type==='PRUNE'&&event.data.version===manifest.version){const clients=await windows();if(clients.length===1&&clients[0].id===source.id)for(const name of await caches.keys())if(name.startsWith(PREFIX)&&name!==CACHE)await caches.delete(name);}
 }catch(error){event.ports[0]?.postMessage({source:'rl-island-offline',status:'failed',error:error instanceof Error?error.message:String(error)});}})());
});
