// строгая проверка раскроя на случайных наборах деталей
const {chromium}=require('playwright');const fs=require('fs');
(async()=>{const b=await chromium.launch();const pg=await b.newPage();await pg.setContent('<!doctype html><html><head><meta charset="utf-8"></head><body>'+fs.readFileSync(process.argv[2]||'shkaf-master.html','utf8')+'</body></html>');await pg.waitForTimeout(400);
const r=await pg.evaluate(()=>{const M=window.ShkafMaster;let x=99;const rnd=()=>{x=(x*1103515245+12345)%2147483648;return x/2147483648};let n=0,err=[];
 const ok=(c,m)=>{n++;if(!c&&err.length<20)err.push(m)};
 for(let t=0;t<3000;t++){const S={sheetL:2800,sheetW:2070,trim:10,kerf:[0,3,4,5][t%4],grain:0};if(t%5===0){S.sheetL=3050;S.sheetW=1830}
  const rot=t%2===0,rects=[];const m=1+Math.floor(rnd()*14);
  for(let i=0;i<m;i++){const big=rnd()<.25;rects.push({name:'д'+i,group:'g',L:Math.round(big?800+rnd()*2000:60+rnd()*900),Wd:Math.round(big?300+rnd()*1700:50+rnd()*600),qty:1+Math.floor(rnd()*6)})}
  const p=M.pack(rects,S,rot),Ls=S.sheetL-2*S.trim,Ws=S.sheetW-2*S.trim,k=S.kerf;
  const need=rects.reduce((a,r)=>a+r.qty,0),got=p.sheets.reduce((a,sh)=>a+sh.parts.length,0)+p.over.length;ok(got===need,`набор ${t}: деталей ${got} из ${need}`);
  p.sheets.forEach((sh,si)=>{sh.parts.forEach((a,i)=>{
    ok(a.x>=-1e-6&&a.y>=-1e-6&&a.x+a.l<=Ls+1e-6&&a.y+a.w<=Ws+1e-6,`набор ${t} лист ${si}: ${a.name} за краем листа`);
    ok((a.l===a.L&&a.w===a.Wd)||(rot&&a.l===a.Wd&&a.w===a.L),`набор ${t}: ${a.name} размер изменился`);
    if(!rot)ok(a.l===a.L,`набор ${t}: ${a.name} повёрнут, хотя есть текстура`);
    sh.parts.slice(i+1).forEach(c=>ok(!(a.x<c.x+c.l+k-1e-6&&c.x<a.x+a.l+k-1e-6&&a.y<c.y+c.w+k-1e-6&&c.y<a.y+a.w+k-1e-6),`набор ${t} лист ${si}: ${a.name} и ${c.name} пересекаются или без пропила`))})})}
 return{n,err}});
console.log('Проверок:',r.n,'Ошибок:',r.err.length);r.err.forEach(e=>console.log(' -',e));await b.close()})();
