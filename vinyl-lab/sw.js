const V='vinyl-lab-bfd74bb1ed',SHELL=["./", "index.html", "izmereniya.html", "manifest.webmanifest", "icon-192.png", "icon-512.png", "icon-maskable-512.png"];
self.addEventListener('install',e=>{e.waitUntil(caches.open(V).then(c=>c.addAll(SHELL)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==V).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{const r=e.request;if(r.method!=='GET')return;const u=new URL(r.url);
  const ext=/(fonts\.googleapis\.com|fonts\.gstatic\.com|cdnjs\.cloudflare\.com)$/.test(u.hostname);
  if(u.origin!==location.origin&&!ext)return;
  const page=r.mode==='navigate'||/\.html$|\/$/.test(u.pathname)||u.pathname.endsWith('sw.js');
  e.respondWith(caches.open(V).then(async c=>{const hit=await c.match(r,{ignoreSearch:u.origin===location.origin});
    const net=fetch(r,page?{cache:'no-cache'}:undefined).then(res=>{if(res&&(res.ok||res.type==='opaque'))c.put(r,res.clone());return res});
    if(page){ // страницы: сначала свежая версия с сайта, сохранённая копия — только без сети
      return net.catch(async()=>hit||await c.match(u.pathname.endsWith('izmereniya.html')?'izmereniya.html':'index.html'))}
    return hit||net.catch(()=>undefined)}))});
