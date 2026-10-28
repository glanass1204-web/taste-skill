// Шкаф-Мастер: работа без интернета.
const CACHE='shkaf-master-v53';
const CORE=['./','./index.html','./manifest.webmanifest','./icon.svg','./icon-192.png','./icon-512.png','./vendor/three.min.js','./vendor/OrbitControls.js'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(CORE)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{
  const req=e.request;if(req.method!=='GET')return;
  const url=new URL(req.url);
  // страница: сначала сеть (чтобы получать обновления), без сети — из кэша
  if(req.mode==='navigate'){
    // плохая связь на объекте: если сеть не ответила за 3 секунды — открываем сохранённую версию,
    // а свежую докачиваем в фоне (она откроется в следующий раз)
    const net=fetch(req).then(r=>{if(r&&r.ok){const copy=r.clone();caches.open(CACHE).then(c=>c.put('./index.html',copy))}return r});
    e.waitUntil(net.catch(()=>{}));
    e.respondWith(caches.match('./index.html').then(hit=>{
      if(!hit)return net;
      const late=new Promise(ok=>setTimeout(()=>ok(hit),3000));
      return Promise.race([net.then(r=>r&&r.ok?r:hit).catch(()=>hit),late]);
    }));
    return;
  }
  // шрифты и файлы приложения: из кэша, в фоне обновляем
  if(url.origin===location.origin||/fonts\.(googleapis|gstatic)\.com$/.test(url.hostname)){
    e.respondWith(caches.open(CACHE).then(c=>c.match(req).then(hit=>{
      const net=fetch(req).then(r=>{if(r&&(r.ok||r.type==='opaque'))c.put(req,r.clone());return r}).catch(()=>hit);
      return hit||net;
    })));
  }
});
