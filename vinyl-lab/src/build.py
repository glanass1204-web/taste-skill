import re, json, os, zipfile, math
from PIL import Image, ImageDraw
import sys,pathlib; HERE=pathlib.Path(__file__).resolve().parent; SRC=str(HERE/'app.html'); OUT=str(HERE.parent)
BASE='https://glanass1204-web.github.io/taste-skill/vinyl-lab/'
html=open(SRC,encoding='utf-8').read()
html=html.replace(BASE+'izmereniya.html','izmereniya.html').replace(BASE+'vinyl-lab.zip','vinyl-lab.zip')
html=html.replace('<a class="btn primary" id="app-open" href="'+BASE+'"','<a class="btn primary" id="app-open" href="./"')
m=re.search(r'<title>.*?</title>',html); title=m.group(0)
head_extra='''<meta name="theme-color" content="#0F1318">
<link rel="manifest" href="manifest.webmanifest">
<link rel="icon" href="icon-192.png" type="image/png">
<link rel="apple-touch-icon" href="icon-192.png">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-title" content="Винил·Лаб">
<style>html{-webkit-text-size-adjust:100%}:root{padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px)}body{margin:0}img{max-width:100%}</style>'''
sw='''<div id="upd" hidden style="position:fixed;left:max(16px,env(safe-area-inset-left,0px));right:max(16px,env(safe-area-inset-right,0px));bottom:calc(16px + env(safe-area-inset-bottom,0px));z-index:20;display:flex;gap:12px;align-items:center;justify-content:space-between;background:var(--ink);color:var(--bg);border-radius:10px;padding:12px 14px;font-size:14px;box-shadow:0 6px 24px rgba(0,0,0,.25)"><span>Вышла новая версия Винил·Лаб</span><button type="button" onclick="location.reload()" style="font:inherit;font-weight:600;background:var(--glow);color:#141A21;border:0;border-radius:6px;padding:8px 12px;cursor:pointer">Обновить</button></div>
<script>if('serviceWorker' in navigator&&window.isSecureContext)addEventListener('load',()=>{let had=!!navigator.serviceWorker.controller;
navigator.serviceWorker.addEventListener('controllerchange',()=>{if(!had){had=true;return}const u=document.getElementById('upd');if(u)u.hidden=false});
navigator.serviceWorker.register('sw.js',{updateViaCache:'none'}).then(r=>{const up=()=>r.update().catch(()=>{});setInterval(up,3600000);document.addEventListener('visibilitychange',()=>{if(!document.hidden)up()})}).catch(()=>{})});</script>'''
page='<!doctype html>\n<html lang="ru">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">\n'+head_extra+'\n</head>\n<body>\n'+html+'\n'+sw+'\n</body>\n</html>\n'
open(OUT+'/index.html','w',encoding='utf-8').write(page)
# manifest
man={"name":"Винил·Лаб","short_name":"Винил·Лаб","description":"Настройка винилового тракта, коллекция пластинок и измерения микрофоном","lang":"ru","start_url":"./","scope":"./","display":"standalone","background_color":"#0F1318","theme_color":"#0F1318",
 "icons":[{"src":"icon-192.png","sizes":"192x192","type":"image/png"},{"src":"icon-512.png","sizes":"512x512","type":"image/png"},{"src":"icon-maskable-512.png","sizes":"512x512","type":"image/png","purpose":"maskable"}],
 "shortcuts":[{"name":"Измерения микрофоном","url":"izmereniya.html"},{"name":"Коллекция","url":"./#kollekciya"}]}
open(OUT+'/manifest.webmanifest','w',encoding='utf-8').write(json.dumps(man,ensure_ascii=False,indent=1))
# icons
def icon(size,pad):
    S=size*4; im=Image.new('RGBA',(S,S),(15,19,24,255)); d=ImageDraw.Draw(im)
    c=S/2; R=S/2*(1-pad)
    d.ellipse([c-R,c-R,c+R,c+R],fill=(22,27,33,255))
    for i in range(14):
        r=R*(0.97-i*0.042); d.ellipse([c-r,c-r,c+r,c+r],outline=(48,56,66,255),width=max(1,S//256))
    rl=R*0.36; d.ellipse([c-rl,c-rl,c+rl,c+rl],fill=(240,162,26,255))
    rh=R*0.05; d.ellipse([c-rh,c-rh,c+rh,c+rh],fill=(15,19,24,255))
    d.arc([c-R*0.9,c-R*0.9,c+R*0.9,c+R*0.9],start=200,end=250,fill=(110,120,132,255),width=S//90)
    return im.resize((size,size),Image.LANCZOS)
icon(192,0.04).save(OUT+'/icon-192.png'); icon(512,0.04).save(OUT+'/icon-512.png'); icon(512,0.2).save(OUT+'/icon-maskable-512.png')
# service worker
files=['./','index.html','izmereniya.html','manifest.webmanifest','icon-192.png','icon-512.png','icon-maskable-512.png']
import hashlib
ver=hashlib.sha1(page.encode()+open(OUT+'/izmereniya.html','rb').read()).hexdigest()[:10]
swjs='''const V='vinyl-lab-%s',SHELL=%s;
self.addEventListener('install',e=>{e.waitUntil(caches.open(V).then(c=>c.addAll(SHELL)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==V).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{const r=e.request;if(r.method!=='GET')return;const u=new URL(r.url);
  const ext=/(fonts\\.googleapis\\.com|fonts\\.gstatic\\.com|cdnjs\\.cloudflare\\.com)$/.test(u.hostname);
  if(u.origin!==location.origin&&!ext)return;
  const page=r.mode==='navigate'||/\.html$|\/$/.test(u.pathname)||u.pathname.endsWith('sw.js');
  e.respondWith(caches.open(V).then(async c=>{const hit=await c.match(r,{ignoreSearch:u.origin===location.origin});
    const net=fetch(r,page?{cache:'no-cache'}:undefined).then(res=>{if(res&&(res.ok||res.type==='opaque'))c.put(r,res.clone());return res});
    if(page){ // страницы: сначала свежая версия с сайта, сохранённая копия — только без сети
      return net.catch(async()=>hit||await c.match(u.pathname.endsWith('izmereniya.html')?'izmereniya.html':'index.html'))}
    return hit||net.catch(()=>undefined)}))});
''' % (ver, json.dumps(files))
open(OUT+'/sw.js','w').write(swjs)
# zip
readme='''Винил·Лаб — офлайн-версия

1. Распакуйте архив в любую папку.
2. Откройте index.html в браузере (Chrome, Safari, Firefox).

Все данные хранятся в браузере на этом устройстве. Делайте резервную копию в файл
(вкладка «Моя система» → «Резервная копия»).

Измерения с микрофоном (izmereniya.html) на компьютере обычно работают и из файла.
На телефоне браузер даёт микрофон только сайтам по https, поэтому там используйте
https://glanass1204-web.github.io/taste-skill/vinyl-lab/ — его можно установить как приложение.
'''
with zipfile.ZipFile(OUT+'/vinyl-lab.zip','w',zipfile.ZIP_DEFLATED) as z:
    for f in ['index.html','izmereniya.html','manifest.webmanifest','icon-192.png','icon-512.png','icon-maskable-512.png']:
        z.write(OUT+'/'+f,'vinyl-lab/'+f)
    z.writestr('vinyl-lab/ПРОЧТИ.txt',readme)
print('ok',ver)
