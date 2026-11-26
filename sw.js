const CACHE='study-planner-offline-v28';
const ROOT=new URL(self.registration.scope);
const PAGE=new URL('index.html',ROOT).href;
function isApp(url){return url.origin===ROOT.origin&&(url.pathname===ROOT.pathname||url.pathname===new URL(PAGE).pathname);}
async function valid(response){if(!response||!response.ok||!response.headers.get('content-type')?.includes('text/html'))return false;const text=await response.clone().text();const m=text.match(/const VERSION = (\d+);/);return !!m&&+m[1]>=28;}
self.addEventListener('install',event=>{event.waitUntil((async()=>{const c=await caches.open(CACHE);const response=await fetch(PAGE,{cache:'reload'});if(!await valid(response))throw Error('App version unavailable');await c.put(PAGE,response);await self.skipWaiting();})());});
self.addEventListener('activate',event=>{event.waitUntil((async()=>{for(const k of await caches.keys())if(k.startsWith('study-planner-offline-')&&k!==CACHE)await caches.delete(k);await self.clients.claim();})());});
self.addEventListener('fetch',event=>{
 const req=event.request;if(req.method!=='GET'||req.mode!=='navigate'||!isApp(new URL(req.url)))return;
 event.respondWith((async()=>{const c=await caches.open(CACHE);const ctl=new AbortController(),timer=setTimeout(()=>ctl.abort(),6000);
 try{const response=await fetch(req,{signal:ctl.signal});if(await valid(response)){await c.put(PAGE,response.clone());return response;}const cached=await c.match(PAGE);return cached||response;}
 catch(e){return await c.match(PAGE)||new Response('离线缓存尚未建立，请联网打开一次。',{status:503,headers:{'Content-Type':'text/plain; charset=utf-8'}});}
 finally{clearTimeout(timer);}})());
});