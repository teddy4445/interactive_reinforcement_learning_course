/// <reference lib="webworker" />
/* Build replaces the manifest. This worker never reads or writes learning storage. */
const manifest=/** @type {{version:string,entries:{url:string,bytes:number,sha256:string}[]}} */(/** @type {unknown} */(/*__MANIFEST__*/null));
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
