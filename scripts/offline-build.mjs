import {readdir,readFile,writeFile} from 'node:fs/promises';
import {resolve,relative,sep} from 'node:path';
import {createHash} from 'node:crypto';
/** Complete built inventory, including worker/dynamic chunks and local fonts. */
export function offlineBuild(){let out,base;return {name:'rl-island-offline',apply:'build',configResolved(config){out=resolve(config.root,config.build.outDir);base=config.base;if(base!=='/rl-island/')throw Error('Offline build requires the isolated /rl-island/ base.');},async closeBundle(){
 const walk=async dir=>(await Promise.all((await readdir(dir,{withFileTypes:true})).map(e=>e.isDirectory()?walk(resolve(dir,e.name)):resolve(dir,e.name)))).flat();
 const files=(await walk(out)).filter(p=>!['sw.js','offline-manifest.json'].includes(relative(out,p))&&/\.(html|js|css|woff2?|png|svg|ico|txt|json)$/.test(p)).sort();
 const source=await readFile('src/offline/service-worker.js','utf8'),initial=await Promise.all(files.map(async p=>({path:p,body:await readFile(p)})));
 const hash=createHash('sha256').update(source);for(const f of initial)hash.update(relative(out,f.path)).update(f.body);const version=hash.digest('hex').slice(0,20);
 const index=resolve(out,'index.html'),html=(await readFile(index,'utf8')).replace('</head>',`<meta name="rl-build" content="${version}"></head>`);await writeFile(index,html);
 const entries=await Promise.all(files.map(async p=>{const body=await readFile(p);return {url:base+relative(out,p).split(sep).join('/'),bytes:body.length,sha256:createHash('sha256').update(body).digest('hex')};}));
 const manifest={schemaVersion:1,base,version,entries};await writeFile(resolve(out,'offline-manifest.json'),JSON.stringify(manifest,null,2));await writeFile(resolve(out,'sw.js'),source.replace('/*__MANIFEST__*/null',JSON.stringify(manifest)));
 }};}
