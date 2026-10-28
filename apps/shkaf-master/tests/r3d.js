// настоящее 3D в браузере: все шаблоны — нет ошибок, картинка не пустая, двери открываются, подписи не налезают
const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader']});const pg=await b.newPage({viewport:{width:390,height:844},deviceScaleFactor:1});const errs=[];pg.on('pageerror',e=>errs.push(e.message));
await pg.goto('http://localhost:8765/');await pg.evaluate(()=>localStorage.clear());await pg.reload();await pg.waitForTimeout(800);
await pg.click('[data-view="3d"]');await pg.waitForTimeout(4000);
await pg.click('#openProjects');const tpls=await pg.$$eval('[data-tpl]',x=>x.map(e=>[e.dataset.tpl,e.closest('.proj').querySelector('b').textContent]));await pg.click('#closeProjects');
const bad=[];let n=0;
for(const [id,nm] of tpls){await pg.click('#openProjects');await pg.click(`[data-tpl="${id}"]`);await pg.waitForTimeout(1200);await pg.click('#v3reset');await pg.waitForTimeout(600);
 const res=await pg.evaluate(async()=>{const T3=window.ShkafMaster.__hooks.T3(),S3=T3&&T3.S3;if(!S3)return{err:'нет 3D'};
  const frame=()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));
  // картинка не пустая: разброс цвета пикселей
  T3.r.render(S3.scene,T3.cam);const cv=T3.r.domElement,c2=document.createElement('canvas');c2.width=80;c2.height=120;const g=c2.getContext('2d');g.drawImage(cv,0,0,80,120);const d=g.getImageData(0,0,80,120).data;
  const set=new Set();for(let i=0;i<d.length;i+=4)set.add((d[i]>>4)+'.'+(d[i+1]>>4)+'.'+(d[i+2]>>4));
  // подписи с 4 сторон
  const over=[];const tgt=T3.ctl.target.clone(),off0=T3.cam.position.clone().sub(tgt);
  for(const ang of [0,0.6,-0.6,1.2]){const off=off0.clone().applyAxisAngle({x:0,y:1,z:0,isVector3:true}.constructor===Object?new T3.cam.up.constructor(0,1,0):null,ang);
   T3.cam.position.copy(tgt).add(off);T3.ctl.update();await frame();
   const W=cv.clientWidth,H=cv.clientHeight,rects=[];
   (S3.labels||[]).forEach(sp=>{let o=sp,vis=true;while(o){if(!o.visible)vis=false;o=o.parent}if(!vis)return;const v=sp.getWorldPosition(new T3.cam.position.constructor()),p=v.clone().project(T3.cam);if(p.z>1)return;
     const up=new T3.cam.position.constructor(0,1,0).applyQuaternion(T3.cam.quaternion),q=v.clone().add(up.multiplyScalar(sp.scale.y)).project(T3.cam),h=Math.abs(q.y-p.y)*H/2,w=h*sp.scale.x/sp.scale.y,x=(p.x+1)*W/2;
     const cy=(1-p.y)*H/2+(sp.center.y-.5)*h;rects.push({x0:x-w/2,x1:x+w/2,y0:cy-h/2,y1:cy+h/2})});
   for(let i=0;i<rects.length;i++)for(let j=i+1;j<rects.length;j++){const a=rects[i],b=rects[j];const ox=Math.min(a.x1,b.x1)-Math.max(a.x0,b.x0),oy=Math.min(a.y1,b.y1)-Math.max(a.y0,b.y0);if(ox>2&&oy>2)over.push(ang)}}
  T3.cam.position.copy(tgt).add(off0);T3.ctl.update();
  return{colors:set.size,labels:(S3.labels||[]).length,over:over.length,doors:S3.doors.length+S3.drawers.length+S3.lifts.length+S3.coupe.length}});
 if(res.err){bad.push(nm+': '+res.err);continue}
 await pg.click('#v3open');await pg.waitForTimeout(2200);
 const moved=await pg.evaluate(()=>{const S3=window.ShkafMaster.__hooks.T3().S3;return S3.doors.filter(p=>Math.abs(p.rotation.y)>0.3).length+S3.lifts.filter(p=>Math.abs(p.rotation.x)>0.3).length+S3.drawers.filter(d=>d.position.z>0.05).length+S3.coupe.filter(c=>Math.abs(c.position.x)>0.05).length});
 await pg.click('#v3open');await pg.waitForTimeout(300);
 const line=`${n} ${nm}: цветов ${res.colors}, подписей ${res.labels}, наложений ${res.over}, подвижных ${res.doors}, открылось ${moved}`;console.log(line);
 if(res.colors<12)bad.push(nm+': пустая картинка');if(res.over)bad.push(nm+': подписи налезают ('+res.over+')');if(res.doors&&!moved)bad.push(nm+': двери не открываются');n++}
console.log(bad.length?'ПРОБЛЕМЫ:\n'+bad.join('\n'):'✓ все '+n+' шаблонов в 3D без проблем');console.log('errs',errs);await b.close()})();
