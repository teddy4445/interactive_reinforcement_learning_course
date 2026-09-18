import {createServer} from 'node:http';
import {readFile,realpath} from 'node:fs/promises';
import {resolve,sep,extname} from 'node:path';
import {pathToFileURL} from 'node:url';

/** A plain static server: no Vite transforms, API routes or SPA fallback. */
export async function startStaticServer({port=4173,directory='dist'}={}) {
  const root=await realpath(resolve(directory));
  const server=createServer(async(req,res)=>{
    try {
      if(!['GET','HEAD'].includes(req.method)){res.writeHead(405);res.end();return;}
      const pathname=new URL(req.url,'http://localhost').pathname;
      if(pathname==='/rl-island'){res.writeHead(308,{Location:'/rl-island/'});res.end();return;}
      if(!pathname.startsWith('/rl-island/'))throw Error('Outside application');
      const relative=decodeURIComponent(pathname.slice('/rl-island/'.length))||'index.html';
      const file=await realpath(resolve(root,relative));
      if(!file.startsWith(root+sep))throw Error('Outside artifact');
      const body=await readFile(file);
      res.writeHead(200,{'Content-Type':({'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json','.png':'image/png','.svg':'image/svg+xml','.woff2':'font/woff2','.woff':'font/woff','.txt':'text/plain; charset=utf-8'})[extname(file)]??'application/octet-stream','Cache-Control':'no-cache','X-Content-Type-Options':'nosniff'});
      res.end(req.method==='HEAD'?undefined:body);
    } catch {res.writeHead(404,{'Content-Type':'text/plain'});res.end('Not found');}
  });
  await new Promise((done,reject)=>{server.once('error',reject);server.listen(port,'127.0.0.1',done);});
  return server;
}
if(process.argv[1]&&import.meta.url===pathToFileURL(resolve(process.argv[1])).href){
  const args=process.argv.slice(2),port=Number(args[args.indexOf('--port')+1]||4173);
  if(args.length&&!(args.length===2&&args[0]==='--port'&&Number.isInteger(port)&&port>0&&port<65536))throw Error('Usage: npm run preview -- --port 4173');
  const server=await startStaticServer({port});
  console.log(`Static dist preview: http://127.0.0.1:${port}/rl-island/`);
  for(const signal of ['SIGINT','SIGTERM'])process.on(signal,()=>{server.closeAllConnections();server.close();});
}
