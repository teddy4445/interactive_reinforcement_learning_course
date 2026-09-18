import {readFile,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
const manifest=JSON.parse(await readFile('reference/course-manifest.json','utf8'));
const prior=JSON.parse(await readFile('evidence/task-00-01/reference-fetch.json','utf8'));
const sources=[{id:'acml-home',url:'https://acml.teddylazebnik.com/'},...manifest.lessons.map(l=>({id:'lesson-'+l.id,url:l.source.slideUrl}))];
for(const s of sources){const u=new URL(s.url);if(u.search||u.username||u.password||!(u.href==='https://acml.teddylazebnik.com/'||u.origin==='https://teddylazebnik.com'&&/^\/files\/rl_course\/\d+\.pdf$/.test(u.pathname)))throw Error('Only sanitized verified public references allowed.');}
const records=[];
for(let i=0;i<sources.length;i+=3){records.push(...await Promise.all(sources.slice(i,i+3).map(async s=>{try{const response=await fetch(s.url,{signal:AbortSignal.timeout(20000)}),body=Buffer.from(await response.arrayBuffer()),sha256=createHash('sha256').update(body).digest('hex');return {...s,status:response.status,contentType:response.headers.get('content-type'),bytes:body.length,sha256,pdf:s.id.startsWith('lesson-')?body.subarray(0,5).toString()==='%PDF-':null,matchesPriorHash:prior.records.find(r=>r.id===s.id)?.sha256===sha256};}catch(error){return {...s,error:error.message,code:error.cause?.code??null};}})));}
await writeFile('evidence/task-11/public-reference-links.json',JSON.stringify({at:new Date().toISOString(),source:'Read-only public GET verification. No protected catalog, credentials, runtime fetch or new instructor approval. Existing reference files preserved.',records},null,2));
console.log(JSON.stringify(records.map(({id,status,pdf,matchesPriorHash,error})=>({id,status,pdf,matchesPriorHash,error})),null,2));
if(records.some(r=>r.status!==200||r.pdf===false))process.exitCode=1;
