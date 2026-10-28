// v56: ряд кондуктора 32 на картинке и в шаблоне 1:1, свои цены инструмента
const {chromium}=require('playwright');const fs=require('fs');
const FILE=process.argv[2]||'shkaf-master.html';
(async()=>{const b=await chromium.launch();const pg=await b.newPage();const errs=[];pg.on('pageerror',e=>errs.push(e.message));
await pg.setContent('<!doctype html><html><head><meta charset="utf-8"></head><body>'+fs.readFileSync(FILE,'utf8')+'</body></html>');await pg.waitForTimeout(400);
const r=await pg.evaluate(()=>{const M=window.ShkafMaster;let n=0;const bad=[];const ok=(c,m)=>{n++;if(!c)bad.push(m)};
 const run=(p,ex)=>{M.norm(p);const S={...M.effSettings(p),...ex},c=M.calc(p,S),dm=M.drillMap(p,S,c);return{p,S,c,dm}};
 // 1. ряд 32 на боковине: пересчёт здесь
 {const {dm}=run(M.newProject(),{jig:'32'});let rows=0;
  dm.forEach(g=>{const P_=M.drillParse(g);ok(P_&&!P_.bad,g.name+': картинка');
   g.lines.forEach((l,i)=>{const m=/^((?:Левая|Правая) сторона\. )?Кондуктор 32: ряд через 32 мм от Y (\S+) до Y (\S+) \((\d+) отв\. в ряду, те же X\) — полки ставьте на Y (.+)$/.exec(l);if(!m)return;rows++;
    const face=m[1]?(m[1].startsWith('Левая')?'L':'R'):'A',a=+m[2],e=+m[3],k=+m[4],snap=m[5].split(', ').map(Number),prev=g.lines[i-1],xs=(/X (\S+) и (\S+)/.exec(prev)||[]).slice(1).map(Number);
    ok(/Полкодержатели/.test(prev),g.name+': строка ряда сразу за полкодержателями');ok(k===Math.round((e-a)/32)+1,g.name+': число отверстий '+k);
    const rh=P_.holes.filter(h=>h.face===face&&(h.k==='row'||h.k==='rowS'));ok(rh.length===k*xs.length,g.name+': на картинке '+rh.length+' = '+k+'×'+xs.length);
    ok(rh.every(h=>xs.includes(h.x)&&h.y>=a-0.01&&h.y<=e+0.01&&Math.abs(((h.y-a)/32)-Math.round((h.y-a)/32))<1e-6),g.name+': шаг 32, X как у полкодержателей');
    ok(snap.every(y=>rh.filter(h=>h.y===y&&h.k==='rowS').length===xs.length),g.name+': места полок отмечены сплошными');
    const orig=(/Y \(низ полки\) (.+)$/.exec(prev)[1]).split(', ').map(Number).filter(y=>!snap.includes(y));ok(!P_.holes.some(h=>h.face===face&&h.k!=='row'&&h.k!=='rowS'&&h.d===5&&orig.includes(h.y)&&xs.includes(h.x)),g.name+': старые отверстия вне ряда не сверлятся')});
   if(P_.holes.some(h=>h.k==='row')){const html=M.drillPicHTML(g);ok(/ряд через 32 мм/.test(html)&&!/NaN/.test(html),g.name+': легенда');const t=M.drillTemplate(g);const cnt=(t.match(/Ø5 (\(прав\.\) )?X57 /g)||[]).length;ok(cnt>=P_.holes.filter(h=>h.x===57&&h.d===5).length,g.name+': шаблон 1:1 — все отверстия ряда ('+cnt+')')}});
  ok(rows>=4,'строк ряда '+rows)}
 {const {dm}=run(M.newProject(),{jig:'none'});ok(!dm.some(g=>M.drillParse(g).holes.some(h=>h.k==='row')),'без кондуктора ряда нет')}
 // 2. цены инструмента
 {const p=M.newProject();p.kind='kitchen';const base=run(p,{});const T0=M.toolsFor(base.p,base.S,base.c,base.dm),s0=T0.list.find(t=>t.id==='screw');ok(s0.price===6000,'шуруповёрт по умолчанию 6000');
  const S2={...base.S,toolPrice:{screw:4500,perf:''}},T2=M.toolsFor(base.p,S2,base.c,base.dm);ok(T2.list.find(t=>t.id==='screw').price===4500,'своя цена 4500');ok(T2.list.find(t=>t.id==='perf').price===6000,'пустая — по умолчанию');
  const S3={...base.S,toolPrice:{screw:-5}},T3=M.toolsFor(base.p,S3,base.c,base.dm);ok(T3.list.find(t=>t.id==='screw').price===6000,'отрицательная не принимается')}
 // 3. каталог в настройках = все инструменты, что может предложить список, с теми же ценами
 {const cat=Object.fromEntries(M.TOOL_CAT.map(t=>[t[0],t[2]])),seen=new Set();
  const cases=[];M.builtinTemplates().forEach(t=>cases.push(M.fromTemplate(t)));{const p=M.newProject();p.type='coupe';p.mat.edgeF='0.4';cases.push(p)}
  for(const p of cases)for(const jig of ['none','32','univ']){const x=run(JSON.parse(JSON.stringify(p)),{jig});M.toolsFor(x.p,x.S,x.c,x.dm).list.forEach(t=>{seen.add(t.id);if(t.id!=='board')ok(cat[t.id]===t.def,t.id+': цена в каталоге '+cat[t.id]+' = '+t.def)})}
  const miss=[...seen].filter(id=>id!=='board'&&!(id in cat));ok(!miss.length,'все инструменты есть в настройках: '+miss);ok(M.TOOL_CAT.length===new Set(M.TOOL_CAT.map(t=>t[0])).size,'без повторов')}
 return{n,bad:[...new Set(bad)]}});
console.log(r.bad.length?'✗ '+r.bad.join('\n✗ '):`✓ все ${r.n} проверок`,'errs',errs);await b.close()})();
