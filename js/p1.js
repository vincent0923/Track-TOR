/* 推拉机 main interface (P1): the screens. Training writes to the same records as the classic page (classic.html);
   what is not built here yet (logging food and body measures, COROS, profile, backup, the 29 classic themes) opens
   the classic page at that spot, with a way back. */

/* ---------- small helpers ---------- */
const $=s=>document.querySelector(s);
const PK="tracktor-p1-";
/* things not built here yet open the classic page at that spot (see the ?go= handler in js/main.js) */
const bridge=to=>{
  if(to.startsWith("p1:")){p1Open(to.slice(3));return}
  if(to==="goals"){p1Open("goals");return}
  if(to==="diet"||to.startsWith("diet:")){closeSheet();openDietEntryModal(to.slice(5)||today());return}
  if(to.startsWith("rec:")){closeSheet();openRecord(to.slice(4));return}
  location.href="classic.html?go="+encodeURIComponent(to)};
/* the shared editors (food in js/diet.js, body records in js/p1data.js) call these after saving: redraw this page */
function renderAll(){if(typeof show==="function"&&typeof cur!=="undefined")show(cur,false,true)}
function renderDietAll(){renderAll()}
const WD_ZH=["日","一","二","三","四","五","六"],WD_EN=["Su","Mo","Tu","We","Th","Fr","Sa"],WD=LANG==="en"?WD_EN:WD_ZH;
const MON_EN=["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const fmt=v=>v==null?"–":Math.round(v).toLocaleString("en-US");
const ICON={
  chev:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>',
  left:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="m15 6-6 6 6 6"/></svg>',
  right:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="m9 6 6 6-6 6"/></svg>',
  x:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M6 6l12 12M18 6 6 18"/></svg>',
  check:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>',
  play:'<svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5.5v13a1 1 0 0 0 1.5.86l10.5-6.5a1 1 0 0 0 0-1.72L9.5 4.64A1 1 0 0 0 8 5.5z"/></svg>',
  plus:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>',
  pen:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 20h4L19 9a2.1 2.1 0 0 0-3-3L5 17z"/></svg>',
  sync:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 11a8 8 0 0 0-14.3-4.9L4 8"/><path d="M4 4v4h4"/><path d="M4 13a8 8 0 0 0 14.3 4.9L20 16"/><path d="M20 20v-4h-4"/></svg>',
  swatch:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="8" height="8" rx="2"/><rect x="13" y="3" width="8" height="8" rx="2"/><rect x="3" y="13" width="8" height="8" rx="2"/><path d="M13 17h8M17 13v8"/></svg>',
  user:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6"/></svg>',
  target:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/></svg>',
  cloud:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 18a4.5 4.5 0 0 1-.6-8.96A6 6 0 0 1 18 8.5a4 4 0 0 1 .5 7.97"/><path d="M12 20v-8M9 15l3-3 3 3"/></svg>',
  table:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 10h18M9 10v10"/></svg>',
  sliders:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 6h10M18 6h2M4 12h4M12 12h8M4 18h12"/><circle cx="16" cy="6" r="2"/><circle cx="10" cy="12" r="2"/><circle cx="18" cy="18" r="2"/></svg>',
  spark:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M6 18l2.5-2.5M15.5 8.5 18 6"/></svg>',
  trophy:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0z"/><path d="M17 5h3v2a3 3 0 0 1-3 3M7 5H4v2a3 3 0 0 0 3 3"/></svg>'};
function dateObj(s){const [y,m,d]=s.split("-").map(Number);return new Date(y,m-1,d)}
function dayLabel(s){const t=today();if(s===t)return T("今天","Today");if(s===ymdAdd(t,-1))return T("昨天","Yesterday");const d=dateObj(s);return (d.getMonth()+1)+"."+d.getDate()}
function ringSvg(size,stroke,pct,color,track){const r=(size-stroke)/2,c=2*Math.PI*r,off=c*(1-Math.max(0,Math.min(1,pct)));
  return '<svg width="'+size+'" height="'+size+'" viewBox="0 0 '+size+' '+size+'"><circle cx="'+size/2+'" cy="'+size/2+'" r="'+r+'" stroke="'+track+'" stroke-width="'+stroke+'"/>'
    +'<circle class="rv" cx="'+size/2+'" cy="'+size/2+'" r="'+r+'" stroke="'+color+'" stroke-width="'+stroke+'" stroke-dasharray="'+c+'" stroke-dashoffset="'+c+'" data-off="'+off+'"/></svg>'}
function animateRings(root){requestAnimationFrame(()=>requestAnimationFrame(()=>root.querySelectorAll("circle.rv").forEach(c=>c.style.strokeDashoffset=c.dataset.off)))}

/* ---------- theme: follow the phone, or fixed light / dark ---------- */
function applyMode(){let m="auto";try{m=localStorage.getItem(PK+"mode")||"auto"}catch(e){}
  const dark=m==="dark"||(m==="auto"&&matchMedia("(prefers-color-scheme: dark)").matches);
  document.documentElement.dataset.mode=dark?"dark":"light";
  document.querySelector('meta[name="theme-color"]').content=dark?"#070A10":"#F2F2EE"}
applyMode();matchMedia("(prefers-color-scheme: dark)").addEventListener("change",applyMode);

/* ---------- train view ---------- */
let monthOpen=false,monthOff=0,heroSid=null;
function weekStart(d){const x=new Date(d);const k=(x.getDay()+6)%7;x.setDate(x.getDate()-k);return x}
const ymd=d=>d.getFullYear()+"-"+pad(d.getMonth()+1)+"-"+pad(d.getDate());
function dayCell(s,marks,out){const t=today(),mk=marks[s];const cls=(s===t?" today":"")+(s>t?" fut":"")+(out?" out":"");
  return '<div class="dd'+cls+'"><b>'+dateObj(s).getDate()+'</b><span class="mk">'+(mk?[...mk].sort().map(k=>'<i class="'+k+'"></i>').join(""):"")+'</span></div>'}
function calHtml(){
  const marks=dayMarks(),now=new Date(),head='<div class="days">'+(LANG==="en"?["M","T","W","T","F","S","S"]:["一","二","三","四","五","六","日"]).map(w=>'<span class="dw">'+w+'</span>').join("");
  const ws=weekStart(now);let week=head;for(let i=0;i<7;i++){const d=new Date(ws);d.setDate(ws.getDate()+i);week+=dayCell(ymd(d),marks)}week+="</div>";
  const first=new Date(now.getFullYear(),now.getMonth()+monthOff,1),ms=weekStart(first);let month=head;
  for(let i=0;i<42;i++){const d=new Date(ms);d.setDate(ms.getDate()+i);if(i===35&&d.getMonth()!==first.getMonth())break;month+=dayCell(ymd(d),marks,d.getMonth()!==first.getMonth())}month+="</div>";
  let wkCount=0;for(let i=0;i<7;i++){const d=new Date(ws);d.setDate(ws.getDate()+i);if(marks[ymd(d)])wkCount++}
  return '<section class="card"><div class="wk-h"><b>'+(LANG==="en"?MON_EN[first.getMonth()]:(first.getMonth()+1)+'月')+(monthOpen&&first.getFullYear()!==now.getFullYear()?" "+first.getFullYear():"")+'</b>'
    +(monthOpen?'<div class="mnav"><button class="mini" data-act="mprev" aria-label="'+T('上个月','Previous month')+'">'+ICON.left+'</button><button class="mini" data-act="mnext" aria-label="'+T('下个月','Next month')+'"'+(monthOff>=0?' disabled style="opacity:.35"':'')+'>'+ICON.right+'</button></div>'
      :'<span class="pill'+(wkCount?' ac':'')+'" style="margin-left:auto">'+T('本周 '+wkCount+' 天',wkCount+(wkCount===1?' day':' days')+' this week')+'</span>')
    +'<button class="mini chev" data-act="month" aria-expanded="'+monthOpen+'" aria-label="'+(monthOpen?T("收起整月","Collapse the month"):T("展开整月","Show the month"))+'">'+ICON.chev+'</button></div>'
    +(monthOpen?month:week)+'</section>'}
function heroHtml(){
  const nx=firstOpen();if(!nx)return '<section class="dark hero"><p class="eyebrow">'+T('计划','Plan')+'</p><h2>'+T('全部完成','All done')+' 🎉</h2></section>';
  const p=BYID[heroSid&&!(state.sessions[heroSid]&&state.sessions[heroSid].done)?heroSid:nx.sid],sets=setsOf(p.sid);
  const tot=sets.reduce((a,x)=>a+x.length,0),dn=sets.reduce((a,x)=>a+x.filter(y=>y.d).length,0);
  const other=nextOf(p.kind==="push"?"pull":"push");
  return '<section class="dark hero"><i class="glowring"></i><p class="eyebrow">'+(p.sid===nx.sid?T("下一次","Next"):T("也可以练","Also ready"))+'</p>'
    +'<h2><i class="kd" style="background:var(--'+p.kind+')"></i>'+LAB(p)+'</h2>'
    +'<p class="meta">'+T(p.ex.length+' 个动作 · '+tot+' 组 · 约 '+Math.round(tot*1.6)+' 分钟',p.ex.length+' moves · '+tot+' sets · ~'+Math.round(tot*1.6)+' min')+'</p>'
    +'<ul class="exl">'+p.ex.map((e,i)=>'<li class="'+(sets[i].every(x=>x.d)?"dn":"")+'"><span>'+NS(e)+(engTempo(e)?' <i class="slow">'+T('慢速','Slow')+'</i>':'')+'</span><b>'+e.sets+' × '+e.target+(e.unit==="个"?"":" "+U(e.unit))+'</b></li>').join("")+'</ul>'
    +'<button class="btn" data-act="start" data-sid="'+p.sid+'">'+ICON.play+(dn?T('继续 · ','Continue · ')+dn+'/'+tot:T('开练','Grind'))+'</button>'
    +'<div class="hero-alt"><button data-act="why" data-k="'+p.kind+'">'+ICON.spark+T('按你前 3 次调整 · 为什么','Tuned to your last 3 · why')+'</button></div>'
    +(other&&other.sid!==p.sid?'<div class="hero-alt"><button data-act="swap" data-sid="'+other.sid+'"><i class="kd" style="background:var(--'+other.kind+');width:8px;height:8px"></i>'+T('换成 ','Switch to ')+LAB(other)+'</button></div>':'')
    +'</section>'}
function planHtml(){const marks=dayMarks(),now=new Date(),ws=weekStart(now);let wk=0;for(let i=0;i<7;i++){const d=new Date(ws);d.setDate(ws.getDate()+i);if(marks[ymd(d)])wk++}
  const done=PROGRAM.filter(p=>state.sessions[p.sid]&&state.sessions[p.sid].done),np=done.filter(p=>p.kind==="push").length;
  const last=Object.entries(state.sessions).filter(([sid,s])=>s&&s.done&&s.date&&BYID[sid]).sort((a,b)=>a[1].date<b[1].date?1:-1)[0];
  let lastTxt="";if(last){const [sid,s]=last;let reps=0;Object.entries(s.sets||{}).forEach(([id,a])=>{const e=BYID[sid].ex.find(x=>x.id===id);if(e&&e.unit==="个")a.forEach(x=>{if(x.d)reps+=+x.v||0})});
    lastTxt=T('上次 ','Last ')+dayLabel(s.date)+' · '+LAB(BYID[sid])+' · '+reps+T(' 次',' reps')}
  return '<section class="card"><button class="planc" data-act="plan"><span class="ring">'+ringSvg(64,7,Math.min(1,wk/3),"var(--ac)","var(--sub)")+'<span class="rl"><b class="n" style="font-size:17px;font-weight:800">'+wk+'</b><br><span class="muted" style="font-size:10px;font-weight:600">/ 3 '+T('天','days')+'</span></span></span>'
    +'<span class="sp"><h3>'+T('本周','This week')+'</h3><p class="muted">'+T('推 ','Push ')+np+T(' 次 · 拉 ',' · Pull ')+(done.length-np)+T(' 次','')+(lastTxt?'<br>'+lastTxt:'')+'</p></span><span class="mini">'+ICON.right+'</span></button></section>'}
function renderTrainView(){const v=$("#v-train");v.innerHTML=heroHtml()+calHtml()+planHtml();animateRings(v)}
/* what the engine planned: the next two sessions of a kind (or both kinds), each exercise with its reason */
function planSheet(only){const kinds=only?[only]:["push","pull"];let h="";
  kinds.forEach(kind=>{const l=lastDoneOf(kind).day;const ps=PROGRAM.filter(p=>p.kind===kind&&p.day>l&&!(state.sessions[p.sid]&&state.sessions[p.sid].done)).sort((a,b)=>a.day-b.day).slice(0,2);
    ps.forEach((p,i)=>{h+='<div class="plan1"><div class="row"><i class="kd" style="background:var(--'+kind+')"></i><b class="sp">'+LAB(p)+'</b><span class="pill'+(i?'':' ac')+'">'+(i?T('预告','Preview'):T('下一次','Next'))+'</span></div>'
      +p.ex.map(e=>'<div class="pex"><div class="row"><span class="sp">'+N(e)+'</span><b class="n">'+e.sets+' × '+e.target+(e.unit==="个"?"":" "+U(e.unit))+'</b></div>'+(e.why?'<p class="muted">'+T(e.why,e.whyEn||e.why)+'</p>':'')+'</div>').join("")+'</div>'})});
  openSheet('<div class="sh-h"><h3>'+T('接下来','Coming up')+'</h3><button class="mini" data-act="close">'+ICON.x+'</button></div>'+h
    +'<p class="muted" style="font-size:12px;margin-top:6px">'+T('每类训练看你前 3 次的表现排下 2 次：每组做到 10 个就换更难的动作或慢速，达标就加次数，连着没达标就减；每次 5–12 组。每练完一次重新算，所以「预告」可能会变。','Each kind looks at your last 3 sessions to plan the next 2: reach 10 reps every set and the move gets harder or slower, hit the target and reps go up, miss twice and it eases off; 5–12 sets a session. It replans after every session, so the preview can change.')+'</p>')}

/* ---------- focus mode ---------- */
let run=null,restT=0,timerT=0,clockT=0;
const restOf=e=>e.id==="pullup"?150:(e.id==="hang"||e.id==="ecc")?90:e.unit==="分钟"?0:60;
/* the sets are the session's own arrays (sessionDoc), so every tick, change and finish is saved as it happens */
function startRun(sid){const p=BYID[sid],doc=sessionDoc(sid),pb=pullSeries();
  run={sid,p,doc,sets:p.ex.map(e=>doc.sets[e.id]),ex:0,t0:Date.now(),rest:0,timing:0,best0:pb.length?Math.max(...pb.map(x=>x.y)):0,coins0:coinTotal()};
  run.ex=Math.max(0,run.sets.findIndex(a=>a.some(x=>!x.d)));
  const f=$("#focus");f.classList.add("on");f.setAttribute("aria-hidden","false");document.body.style.overflow="hidden";
  clearInterval(clockT);clockT=setInterval(()=>{const el=$("#fTime");if(el){const s=Math.floor((Date.now()-run.t0)/1000);el.textContent=Math.floor(s/60)+":"+pad(s%60)}},1000);
  renderFocus()}
function closeRun(){clearInterval(clockT);clearInterval(restT);clearInterval(timerT);const f=$("#focus");f.classList.remove("on");f.setAttribute("aria-hidden","true");document.body.style.overflow="";run=null;renderTrainView()}
function curSet(){return run.sets[run.ex].findIndex(x=>!x.d)}
function renderFocus(anim){
  const f=$("#focus"),p=run.p,e=p.ex[run.ex],a=run.sets[run.ex],ci=curSet(),allDone=run.sets.every(x=>x.every(y=>y.d));
  if(allDone&&!run.finished&&run.askFeel==null){finishRun();return}
  const dots=p.ex.map((x,i)=>'<i class="'+(run.sets[i].every(y=>y.d)?"dn":i===run.ex?"cur":"")+'"></i>').join("");
  const val=ci<0?a[a.length-1].v:a[ci].v;
  let bottom;
  if(run.askFeel!=null)bottom='<p class="f-hint">'+T('这个动作感觉？','How did that feel?')+'</p><div class="feel">'+[["easy","轻松","Easy"],["ok","刚好","Right"],["hard","很难","Hard"]].map(([k,z,en])=>'<button data-act="feel" data-f="'+k+'">'+T(z,en)+'</button>').join("")+'</div><button class="f-hint" data-act="feel" data-f="">'+T('跳过','Skip')+'</button>';
  else if(run.rest>0)bottom=restHtml();
  else if(ci<0)bottom='<button class="tickb done" disabled>'+ICON.check+'</button><button class="f-hint" data-act="fnext">'+T('这个动作完成了 · 下一个 →','Done with this one · next →')+'</button>';
  else if(e.unit==="秒")bottom='<button class="tickb" data-act="timer" aria-label="'+T('开始计时','Start the timer')+'">'+(run.timing?'<svg class="tr" viewBox="0 0 112 112"><circle cx="56" cy="56" r="52" id="tRing" stroke-dasharray="326.7" stroke-dashoffset="0"/></svg>'+ICON.check:ICON.play)+'</button><p class="f-hint">'+(run.timing?T("做完了就点，提前结束也算","Tap when done; stopping early counts"):T("点一下开始计时","Tap to start the timer"))+'</p>';
  else bottom='<button class="tickb" data-act="tick" aria-label="'+T('完成这一组','Set done')+'">'+ICON.check+'</button><p class="f-hint">'+T('左右滑动换动作','Swipe for other moves')+'</p>';
  f.innerHTML='<div class="f-top"><button class="mini" data-act="fclose" aria-label="'+T('退出','Leave')+'">'+ICON.x+'</button><div class="f-dots">'+dots+'</div><span class="f-time n" id="fTime">0:00</span></div>'
    +'<div class="f-body" id="fBody"><p class="eyebrow">'+LAB(p)+T(' · 动作 ',' · move ')+(run.ex+1)+' / '+p.ex.length+'</p><h2>'+N(e)+'</h2><p class="f-note">'+(e.note?NOTE(e):"")+'</p>'
    +'<div class="f-sets">'+a.map((x,i)=>x.d?'<i class="dn" role="button" tabindex="0" data-act="untick" data-i="'+i+'" aria-label="'+T('撤销第 '+(i+1)+' 组','Undo set '+(i+1))+'">'+x.v+'</i>':'<i class="'+(i===ci?"cur":"")+'">'+(i===ci?T("第 "+(i+1)+" 组","Set "+(i+1)):i+1)+'</i>').join("")+'</div>'
    +'<div class="f-num">'+(ci<0||run.timing?'<span style="width:46px"></span>':'<button class="mini" data-act="dec" aria-label="'+T('减一','Less')+'">−</button>')+'<b class="n'+(anim?" pop":"")+'" id="fVal">'+(run.timing?run.timeLeft:val)+'</b>'
    +(ci<0||run.timing?'<span style="width:46px"></span>':'<button class="mini" data-act="inc" aria-label="'+T('加一','More')+'">+</button>')+'</div>'
    +'<p class="f-unit">'+U(e.unit)+(ci<0?T(' · 全部 '+a.length+' 组完成',' · all '+a.length+' sets done'):T(' · 第 '+(ci+1)+' 组 / 共 '+a.length+' 组',' · set '+(ci+1)+' of '+a.length))+'</p></div>'
    +'<div class="f-bottom" id="fBottom">'+bottom+'</div>';
  const s=Math.floor((Date.now()-run.t0)/1000);$("#fTime").textContent=Math.floor(s/60)+":"+pad(s%60);
  swipe($("#fBody"))}
function restHtml(){return '<div class="rest"><p class="eyebrow">'+T('组间休息','Rest')+'</p><div class="big" id="rLeft">'+Math.floor(run.rest/60)+':'+pad(run.rest%60)+'</div>'
  +'<div class="bar"><i id="rBar" style="width:'+(run.rest/run.restMax*100)+'%"></i></div><div class="row"><button data-act="rplus">'+T('+30 秒','+30 s')+'</button><button class="ac" data-act="rskip">'+T('跳过','Skip')+'</button></div></div>'}
function tickSet(v){const a=run.sets[run.ex],ci=curSet();if(ci<0)return;a[ci].o=maxOrdOf(run.doc)+1;a[ci].d=true;if(v!=null)a[ci].v=v;lsSave();
  SFX.tick();buzz(18);
  const e=run.p.ex[run.ex];
  if(a.every(x=>x.d)){SFX.ex();buzz([20,40,30]);
    if(window.confetti&&!matchMedia("(prefers-reduced-motion: reduce)").matches)confetti({particleCount:40,spread:60,startVelocity:32,origin:{y:.75},colors:[getComputedStyle(document.documentElement).getPropertyValue("--ac").trim(),"#ffffff"],zIndex:60,disableForReducedMotion:true});
    if(e.unit!=="分钟"){run.askFeel=run.ex;renderFocus();return}
    {const nx=run.sets.findIndex(x=>x.some(y=>!y.d));if(nx>=0)run.ex=nx;renderFocus(true);return}}
  const r=restOf(e);if(r){run.rest=r;run.restMax=r;renderFocus();clearInterval(restT);restT=setInterval(()=>{if(!run){clearInterval(restT);return}run.rest--;
    if(run.rest<=0){clearInterval(restT);run.rest=0;SFX.rest();buzz([60,60,60]);renderFocus(true);return}
    const l=$("#rLeft"),b=$("#rBar");if(l)l.textContent=Math.floor(run.rest/60)+":"+pad(run.rest%60);if(b)b.style.width=(run.rest/run.restMax*100)+"%"},1000)}
  else renderFocus(true)}
function startTimer(){const e=run.p.ex[run.ex],a=run.sets[run.ex],ci=curSet();const total=+a[ci].v||e.target;
  run.timing=1;run.timeLeft=total;run.timeTotal=total;renderFocus();
  clearInterval(timerT);timerT=setInterval(()=>{if(!run){clearInterval(timerT);return}run.timeLeft--;const v=$("#fVal"),r=$("#tRing");
    if(v)v.textContent=Math.max(0,run.timeLeft);if(r)r.style.strokeDashoffset=326.7*(1-run.timeLeft/run.timeTotal);
    if(run.timeLeft<=3&&run.timeLeft>0)tone(660,0,.08,"sine",.12);
    if(run.timeLeft<=0)stopTimer()},1000)}
function stopTimer(){clearInterval(timerT);const done=run.timeTotal-Math.max(0,run.timeLeft);run.timing=0;tickSet(done)}
function untick(i){const x=run.sets[run.ex][i];if(!x||!x.d)return;x.d=false;
  if(x.o){const o=x.o;delete x.o;Object.values(run.doc.sets).forEach(arr=>arr.forEach(y=>{if(y.o>o)y.o--}))}
  lsSave();run.rest=0;clearInterval(restT);SFX.tap();renderFocus(true)}
function finishRun(){run.finished=1;clearInterval(clockT);const p=run.p,secs=Math.floor((Date.now()-run.t0)/1000);
  run.doc.done=true;run.doc.date=today();lsSave();heroSid=null;engPlanAll();
  let reps=0,sets=0,pu=0;run.sets.forEach((a,i)=>a.forEach(x=>{if(!x.d)return;sets++;if(p.ex[i].unit==="个")reps+=x.v;if(p.ex[i].id==="pullup")pu=Math.max(pu,x.v)}));
  const best=run.best0;
  SFX.done();buzz([30,60,30,60,80]);
  if(window.confetti&&!matchMedia("(prefers-reduced-motion: reduce)").matches){const c=getComputedStyle(document.documentElement).getPropertyValue("--ac").trim();
    [0,250,500].forEach((t,i)=>setTimeout(()=>{confetti({particleCount:70,angle:60,spread:60,origin:{x:0,y:.8},colors:[c,"#fff","#FFD24D"],zIndex:60});confetti({particleCount:70,angle:120,spread:60,origin:{x:1,y:.8},colors:[c,"#fff","#FFD24D"],zIndex:60})},t))}
  $("#focus").innerHTML='<div class="f-top"><span class="sp"></span><button class="mini" data-act="fclose" aria-label="'+T('关闭','Close')+'">'+ICON.x+'</button></div>'
    +'<div class="f-body"><div class="fin"><div class="medal">'+ICON.trophy+'</div><p class="eyebrow">'+LAB(p)+'</p><h2>'+T('练完了','Done')+'</h2>'
    +(pu?'<span class="pill ac" style="margin-top:6px">'+T('引体单组 '+pu+' 个','Best pull-up set '+pu)+(pu>best?T(' · 新纪录',' · new best'):'')+'</span>':'')
    +'<span class="coinchip big" style="margin-top:10px">'+COIN+'+'+fmt(coinTotal()-run.coins0)+' G</span>'
    +'<div class="stats"><div><b>'+sets+'</b><span>'+T('组','sets')+'</span></div><div><b>'+reps+'</b><span>'+T('次','reps')+'</span></div><div><b>'+Math.max(1,Math.round(secs/60))+'</b><span>'+T('分钟','min')+'</span></div></div></div></div>'
    +'<div class="f-bottom"><button class="btn" data-act="fclose">'+T('好','OK')+'</button><p class="f-hint">'+(firstOpen()?T('下一次：','Next: ')+LAB(firstOpen()):T('计划全部完成','Plan complete'))+'</p></div>'}
function swipe(el){let x0=null,y0=0;el.addEventListener("touchstart",e=>{x0=e.touches[0].clientX;y0=e.touches[0].clientY},{passive:true});
  el.addEventListener("touchend",e=>{if(x0==null||!run||run.timing)return;const dx=e.changedTouches[0].clientX-x0,dy=e.changedTouches[0].clientY-y0;x0=null;
    if(Math.abs(dx)<50||Math.abs(dy)>Math.abs(dx))return;const n=run.ex+(dx<0?1:-1);if(n<0||n>=run.p.ex.length)return;
    run.ex=n;run.rest=0;clearInterval(restT);SFX.tap();renderFocus(true)})}

/* ---------- diet view ---------- */
function renderDietView(){const v=$("#v-diet"),t=today();
  const tin=intakeOf(t),tb=burnOfDate(t),gap=tin!=null&&tb!=null?tb-tin:null,pr=proteinOf(t),need=proteinNeed(t);
  const y=ymdAdd(t,-1),yg=dietGapOf(y);
  let hero='<section class="card"><div class="row" style="align-items:flex-start"><div class="sp">';
  if(gap!=null)hero+='<p class="eyebrow">'+T('今天 · ','Today · ')+(gap>=0?T("缺口","deficit"):T("盈余","surplus"))+'</p><div class="big" style="color:'+(gap>=0?"var(--good)":"var(--bad)")+'">'+fmt(Math.abs(gap))+'<small>kcal</small></div><p class="muted" style="font-size:12px;margin-top:4px">'+T('摄入 ','In ')+fmt(tin)+T(' · 消耗 ',' · burn ')+fmt(tb)+'</p>';
  else if(tin!=null)hero+='<p class="eyebrow">'+T('今天 · 摄入','Today · intake')+'</p><div class="big">'+fmt(tin)+'<small>kcal</small></div><p class="muted" style="font-size:12px;margin-top:4px">'+T('消耗等手表同步','Burn waits for the watch')+(yg!=null?T(' · 昨天缺口 ',' · yesterday ')+fmt(yg):'')+'</p>';
  else hero+='<p class="eyebrow">'+T('今天','Today')+'</p><div class="big" style="font-size:26px">'+T('还没记','Nothing yet')+'</div><p class="muted" style="font-size:12px;margin-top:4px">'+(yg!=null?T('昨天'+(yg>=0?'缺口 ':'盈余 '),'Yesterday '+(yg>=0?'deficit ':'surplus '))+fmt(Math.abs(yg))+' kcal':T('点下面记一笔','Log below'))+'</p>';
  const pp=pr!=null&&need?pr/need:0;
  hero+='</div><div class="ring">'+ringSvg(76,8,pp,"var(--sleep)","var(--sub)")+'<span class="rl"><b class="n" style="font-size:16px;font-weight:800">'+(pr!=null?Math.round(pr):"–")+'</b><br><span class="muted" style="font-size:10px;font-weight:600">/ '+Math.round(need)+' g</span></span></div></div>';
  if(tin!=null&&tb!=null){const mx=Math.max(tin,tb);hero+='<div class="ib"><i style="width:'+(tin/mx*100)+'%;background:var(--ink)"></i><i style="width:'+(Math.max(0,tb-tin)/mx*100)+'%;background:var(--good);opacity:.35"></i></div>'
    +'<div class="legend"><span><i style="background:var(--ink)"></i>'+T('摄入','Intake')+'</span><span><i style="background:var(--good);opacity:.5"></i>'+T('缺口','Deficit')+'</span><span style="margin-left:auto"><i style="background:var(--sleep)"></i>'+T('蛋白质','Protein')+'</span></div>'}
  hero+='<button class="btn ghost" style="margin-top:16px;height:46px;font-size:15px" data-act="go" data-to="diet">'+ICON.plus+T('记一笔','Log')+'</button></section>';
  const week=gapCardHtml();
  const keys=Object.keys(state.diet).filter(d=>d<=t).sort().reverse().slice(0,14);
  const list='<section class="card"><p class="eyebrow" style="margin-bottom:4px">'+T('记录','Logs')+'</p>'+(keys.length?'<div class="dl">'+keys.map(d=>{const a=intakeOf(d),g=dietGapOf(d);
      return '<button data-act="day" data-d="'+d+'"><span class="dt">'+dayLabel(d)+'</span><span class="di n">'+(a!=null?fmt(a)+' kcal':'–')+'</span>'+(g!=null?'<span class="pill '+(g>=0?"good":"bad")+'">'+(g>=0?"−":"+")+fmt(Math.abs(g))+'</span>':'')+'<svg class="go" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="m9 6 6 6-6 6"/></svg></button>'}).join("")+'</div>'
    :'<p class="empty">'+T('还没有饮食记录','No food logged yet')+'</p>')+'</section>';
  v.innerHTML='<div class="ptr" id="ptr" aria-hidden="true"><i></i></div>'+hero+week+list;animateRings(v);gapCardBind()}
/* the gap card: swipe it sideways (or tap a dot) to step through 7, 14, 30 days and since the first log; the
   big figure turns over like a split-flap board. Only finished days count (the window ends yesterday). */
const GAP_RANGES=[7,14,30,0];
let gapR=7;try{const v=+localStorage.getItem(PK+"gw");if(GAP_RANGES.includes(v)&&localStorage.getItem(PK+"gw")!==null)gapR=v}catch(e){}
function gapData(){const t=today(),to=ymdAdd(t,-1),first=Object.keys(state.diet).sort()[0];
  const from=gapR?ymdAdd(to,-(gapR-1)):(first&&first<=to?first:to),days=[];for(let d=from;d<=to;d=ymdAdd(d,1))days.push(d);
  const gaps=days.map(dietGapOf),known=gaps.filter(g=>g!=null),sum=known.reduce((a,g)=>a+g,0);return {from,to,days,gaps,known,sum}}
function flapHtml(txt){return '<span class="flap">'+[...txt].map((c,i)=>'<span style="--i:'+i+'">'+c+'</span>').join("")+'</span>'}
function gapCardHtml(){const {from,to,days,gaps,known,sum}=gapData(),mx=Math.max(300,...known.map(Math.abs));
  const label=gapR?T('过去 '+gapR+' 天','Last '+gapR+' days'):T('有记录以来 '+days.length+' 天','Since the first log · '+days.length+' days');
  const w=known.length?fatWord(sum/7700,from,to):"about",word=(LANG==="en"?{about:"about ",high:"aggressive: ",low:"conservative: "}:{about:"约 ",high:"激进估计 ",low:"保守估计 "})[w];
  /* long windows draw one bar per week so the bars stay readable */
  let cols=days.map((d,i)=>({g:gaps[i],l:days.length<=14?WD[dateObj(d).getDay()]:""}));
  if(days.length>31){cols=[];for(let i=0;i<days.length;i+=7){const ch=gaps.slice(i,i+7).filter(g=>g!=null);cols.push({g:ch.length?ch.reduce((a,b)=>a+b,0)/ch.length:null,l:""})}}
  const cm=Math.max(300,...cols.filter(c=>c.g!=null).map(c=>Math.abs(c.g)));
  return '<section class="card gapcard" id="gapCard"><div class="row"><div class="sp"><p class="eyebrow">'+label+(known.length<days.length?T(' · 记了 '+known.length+' 天',' · '+known.length+' logged'):'')+'</p>'
    +'<div class="big">'+flapHtml(known.length?(sum>=0?"":"+")+fmt(Math.abs(sum)):"–")+'<small>kcal '+(sum>=0?T("缺口","deficit"):T("盈余","surplus"))+'</small></div></div>'
    +(known.length?'<span class="pill '+(sum>=0?"good":"bad")+'">'+word+(Math.abs(sum)/7700).toFixed(2)+T(' kg 脂肪',' kg fat')+'</span>':'')+'</div>'
    +'<div class="bars7" style="grid-template-columns:repeat('+cols.length+',1fr);gap:'+(cols.length>14?3:cols.length>7?5:8)+'px">'+cols.map(c=>'<div class="bc"><div class="bw"><div class="bv" style="height:'+(c.g==null?6:Math.max(6,Math.abs(c.g)/cm*86))+'px;border-radius:'+(cols.length>14?4:10)+'px;background:'+(c.g==null?"var(--sub)":c.g>=0?"var(--good)":"var(--bad)")+'"></div></div>'+'<span class="bl">'+(c.l||'&nbsp;')+'</span>'+'</div>').join("")+'</div>'
    +(days.length?'<div class="row muted" style="font-size:11px;font-weight:600;margin-top:6px"><span>'+dayLabel(from)+'</span><span class="sp"></span><span>'+dayLabel(to)+'</span></div>':'')
    +'<div class="dots" role="group" aria-label="'+T('统计天数','Period')+'">'+GAP_RANGES.map(r=>'<button data-act="gapr" data-r="'+r+'" aria-pressed="'+(r===gapR)+'" aria-label="'+(r?T('过去 '+r+' 天','Last '+r+' days'):T('有记录以来','Since the first log'))+'"></button>').join("")+'</div></section>'}
function setGapRange(r){if(r===gapR)return;const dir=GAP_RANGES.indexOf(r)>GAP_RANGES.indexOf(gapR)?1:-1;gapR=r;try{localStorage.setItem(PK+"gw",String(r))}catch(e){}
  const old=$("#gapCard");if(!old)return;const t=document.createElement("template");t.innerHTML=gapCardHtml();const nw=t.content.firstChild;
  nw.classList.add(dir>0?"in-r":"in-l");old.replaceWith(nw);SFX.tap();buzz(8);gapCardBind()}
function gapCardBind(){const c=$("#gapCard");if(!c)return;let x0=null,y0=0;
  c.addEventListener("touchstart",e=>{x0=e.touches[0].clientX;y0=e.touches[0].clientY},{passive:true});
  c.addEventListener("touchend",e=>{if(x0==null)return;const dx=e.changedTouches[0].clientX-x0,dy=e.changedTouches[0].clientY-y0;x0=null;
    if(Math.abs(dx)<40||Math.abs(dy)>Math.abs(dx))return;const i=GAP_RANGES.indexOf(gapR),n=i+(dx<0?1:-1);if(n>=0&&n<GAP_RANGES.length)setGapRange(GAP_RANGES[n]);else{c.classList.remove("nudge");void c.offsetWidth;c.classList.add("nudge")}})}
/* food table: opening Diet pulls it quietly (not again within half a minute); pulling the page down pulls it now */
function syncSpin(on){$("#syncDot").classList.toggle("spin",on)}
async function dietPull(manual){let st={};try{st=JSON.parse(localStorage.getItem(SHEET_STATUS_K)||"{}")||{}}catch(e){}
  let url="";try{url=localStorage.getItem(SHEET_URL_K)||""}catch(e){}
  if(!manual&&(!url||(st.ok&&st.ts&&Date.now()-st.ts<30e3)))return;
  syncSpin(true);const r=await pullSheetQuiet({silent:!manual});syncSpin(false);
  if(r.ok&&cur==="diet")renderDietView()}
(function(){let y0=null,dy=0;const lim=70;
  document.addEventListener("touchstart",e=>{if(cur!=="diet"||run||scrollY>0||$("#sheet").classList.contains("on")||document.querySelector(".mask"))return;y0=e.touches[0].clientY;dy=0},{passive:true});
  document.addEventListener("touchmove",e=>{if(y0==null)return;dy=Math.max(0,e.touches[0].clientY-y0);const p=$("#ptr");if(p){p.style.height=Math.min(lim,dy*.5)+"px";p.classList.toggle("ready",dy*.5>=lim-4)}},{passive:true});
  document.addEventListener("touchend",()=>{if(y0==null)return;const p=$("#ptr"),go=dy*.5>=lim-4;y0=null;if(p){p.style.height="";p.classList.remove("ready")}if(go){buzz(12);dietPull(true)}})})();
function daySheet(d){const day=state.diet[d]||{},items=day.items||[],tt=dietTotals(day),a=intakeOf(d),b=burnOfDate(d),g=dietGapOf(d);
  const f1=x=>x==null||x===""?"–":(+x).toFixed(0);
  openSheet('<div class="sh-h"><h3>'+dayLabel(d)+(/^\d/.test(dayLabel(d))?"":' · '+(dateObj(d).getMonth()+1)+'.'+dateObj(d).getDate())+'</h3><button class="mini" data-act="close">'+ICON.x+'</button></div>'
    +'<div class="row" style="margin-bottom:16px"><div class="sp"><p class="eyebrow">'+T('摄入','Intake')+'</p><b class="n" style="font-size:22px;font-weight:800">'+fmt(a)+'</b></div><div class="sp"><p class="eyebrow">'+T('消耗','Burn')+'</p><b class="n" style="font-size:22px;font-weight:800">'+fmt(b)+'</b></div>'
    +'<div class="sp"><p class="eyebrow">'+(g==null||g>=0?T("缺口","Deficit"):T("盈余","Surplus"))+'</p><b class="n" style="font-size:22px;font-weight:800;color:'+(g==null?"inherit":g>=0?"var(--good)":"var(--bad)")+'">'+(g==null?"–":fmt(Math.abs(g)))+'</b></div></div>'
    +(items.length?'<table class="tbl"><tr><th>'+T('食物','Food')+'</th><th>'+T('蛋白','Prot.')+'</th><th>'+T('脂肪','Fat')+'</th><th>'+T('碳水','Carbs')+'</th><th>kcal</th></tr>'+items.map(it=>'<tr><td>'+escHtml(it.name||"")+'</td><td>'+f1(it.p)+'</td><td>'+f1(it.f)+'</td><td>'+f1(it.c)+'</td><td>'+f1(it.kcal)+'</td></tr>').join("")
      +(items.length>1?'<tr class="tot"><td>'+T('合计','Total')+'</td><td>'+f1(tt.p)+'</td><td>'+f1(tt.f)+'</td><td>'+f1(tt.c)+'</td><td>'+f1(tt.kcal)+'</td></tr>':'')+'</table>':'<p class="empty">'+T('这天只记了总数','Only a total that day')+'</p>')
    +(day.note?'<p class="muted" style="font-size:12px;margin-top:12px">'+escHtml(day.note)+'</p>':'')
    +'<button class="btn ghost" style="margin-top:16px;height:46px;font-size:15px" data-act="go" data-to="diet:'+d+'">'+ICON.pen+T('编辑这天','Edit this day')+'</button>')}

/* ---------- progress view ---------- */
const METRICS=[
  {k:"pull",name:T("标准引体","Pull-ups"),unit:T("个","reps"),c:"var(--pull)",up:1,wide:1,pts:()=>pullSeries(),dec:0,rec:"rec:pullups"},
  {k:"wt",name:T("体重","Weight"),unit:"kg",c:"var(--push)",up:0,pts:()=>avg7(wtMerged()),dec:1,sub:T("7 日均","7-day avg"),rec:"rec:weight"},
  {k:"waist",name:T("腰围","Waist"),unit:"cm",c:"var(--ac-text)",up:0,pts:()=>series("waist"),dec:1,rec:"rec:waist"},
  {k:"sleep",name:T("睡眠","Sleep"),unit:T("分","pts"),c:"var(--sleep)",up:1,pts:()=>series("sleep"),dec:0,rec:"sync"},
  {k:"hrv",name:"HRV",unit:"ms",c:"#38BDF8",up:1,pts:()=>series("hrv"),dec:0,rec:"sync"},
  {k:"rhr",name:T("静息心率","Resting HR"),unit:"bpm",c:"var(--bad)",up:0,pts:()=>series("rhr"),dec:0,rec:"sync"}];
function smoothPath(P){if(!P.length)return "";let d="M"+P[0][0].toFixed(1)+" "+P[0][1].toFixed(1);if(P.length<2)return d;
  const n=P.length,s=[],t=new Array(n).fill(0);for(let i=0;i<n-1;i++){const h=P[i+1][0]-P[i][0];s.push(h?(P[i+1][1]-P[i][1])/h:0)}
  t[0]=s[0];t[n-1]=s[n-2];for(let i=1;i<n-1;i++)t[i]=s[i-1]*s[i]<=0?0:3*(s[i-1]+s[i])/((2*s[i]+s[i-1])/s[i-1]+(s[i]+2*s[i-1])/s[i]);
  for(let i=0;i<n-1;i++){const h=(P[i+1][0]-P[i][0])/3;d+="C"+(P[i][0]+h).toFixed(1)+" "+(P[i][1]+t[i]*h).toFixed(1)+" "+(P[i+1][0]-h).toFixed(1)+" "+(P[i+1][1]-t[i+1]*h).toFixed(1)+" "+P[i+1][0].toFixed(1)+" "+P[i+1][1].toFixed(1)}
  return d}
let GID=0;
function lineSvg(pts,W,H,col,cls,pad){pad=pad||4;if(pts.length<2)return '<svg class="'+cls+'" viewBox="0 0 '+W+' '+H+'"></svg>';
  const xs=pts.map(p=>p.x),ys=pts.map(p=>p.y),x0=Math.min(...xs),x1=Math.max(...xs),lo=Math.min(...ys),hi=Math.max(...ys),sp=(hi-lo)||1;
  const P=pts.map(p=>[(x1===x0?W/2:(p.x-x0)/(x1-x0)*W),pad+(1-(p.y-lo)/sp)*(H-2*pad)]);const id="g"+(++GID),line=smoothPath(P),last=P[P.length-1];
  return '<svg class="'+cls+'" viewBox="0 0 '+W+' '+H+'" preserveAspectRatio="none"><defs><linearGradient id="'+id+'" x1="0" x2="0" y1="0" y2="1"><stop offset="0" style="stop-color:'+col+';stop-opacity:.28"/><stop offset="1" style="stop-color:'+col+';stop-opacity:0"/></linearGradient></defs>'
    +'<path d="'+line+'L'+W+' '+H+'L0 '+H+'Z" fill="url(#'+id+')"/><path d="'+line+'" fill="none" stroke="'+col+'" stroke-width="2.2" stroke-linecap="round" vector-effect="non-scaling-stroke"/>'
    +'<circle cx="'+last[0]+'" cy="'+last[1]+'" r="3.5" fill="var(--card)" stroke="'+col+'" stroke-width="2" vector-effect="non-scaling-stroke"/></svg>'}
function recent(pts,days){const t=dnum(today());return days?pts.filter(p=>p.x>t-days):pts}
function deltaOf(m,pts,days){days=days==null?30:days;if(pts.length<2)return "";const last=pts[pts.length-1],t=last.x-(days||1e9);let ref=pts[0];for(const p of pts)if(p.x<=t)ref=p;
  const span=days?days+T(' 天',' days'):T('全部','all time');
  const d=last.y-ref.y;if(Math.abs(d)<(m.dec?.05:.5))return '<span class="td muted">'+span+T(' 持平',' flat')+'</span>';
  const good=(d>0)===!!m.up;return '<span class="td" style="color:'+(good?"var(--good)":"var(--bad)")+'">'+(d>0?"↑ ":"↓ ")+Math.abs(d).toFixed(m.dec)+' '+m.unit+' · '+span+'</span>'}
function goalsHtml(){const st=state.settings,gap=gapAllTime();
  const pu=pullSeries(),wt=avg7(wtMerged()),wz=series("waist");
  const G=[{n:T("引体","Pull-ups"),c:"var(--pull)",cur:pu.length?pu[pu.length-1].y:null,start:0,tg:+st.p||null,u:T("个","reps")},
    {n:T("腰围","Waist"),c:"var(--ac)",cur:wz.length?wz[wz.length-1].y:null,start:wz.length?wz[0].y:null,tg:+st.z||null,u:"cm"},
    {n:T("体重","Weight"),c:"var(--sleep)",cur:wt.length?+wt[wt.length-1].y.toFixed(1):null,start:wt.length?wt[0].y:null,tg:+st.w||null,u:"kg"},
    {n:T("减脂","Fat loss"),c:"#FFB020",cur:gap?+(gap.s/7700).toFixed(1):null,start:0,tg:+st.fat||null,u:"kg"}];
  return '<section class="dark"><div class="row" style="margin-bottom:14px"><p class="eyebrow sp">'+T('目标','Goals')+'</p><button class="coinchip" data-act="coins" aria-label="G">'+COIN+'<b class="n">'+fmt(coinTotal())+'</b></button></div><div class="goals4">'+G.map(g=>{
    const pct=g.tg&&g.cur!=null&&g.start!=null&&g.start!==g.tg?Math.max(0,Math.min(1,(g.cur-g.start)/(g.tg-g.start))):0;
    return '<button data-act="goal"><span class="ring">'+ringSvg(66,7,pct,g.c,"var(--track)")+'<span class="rl"><b class="n" style="font-size:15px;font-weight:800">'+(g.tg?Math.round(pct*100)+"%":"–")+'</b></span></span>'
      +'<span><span class="gn">'+g.n+'</span><br><span class="gv n">'+(g.cur==null?"–":g.cur+" "+g.u)+'</span></span></button>'}).join("")+'</div></section>'}
function renderProgView(){const v=$("#v-prog"),off=k=>{const s=state.settings.sync;return s&&s[{sleep:"sleep",hrv:"hrv",rhr:"rhr"}[k]]===false};
  const tiles=METRICS.filter(m=>!off(m.k)).map(m=>{const all=m.pts(),pts=recent(all,30),last=all[all.length-1];
    return '<button class="tile'+(m.wide?" wide":"")+'" data-act="metric" data-k="'+m.k+'"><span class="tl"><i style="background:'+m.c+'"></i>'+m.name+(m.sub?' · '+m.sub:'')+'</span>'
      +'<span class="tv">'+(last?last.y.toFixed(m.dec)+'<small>'+m.unit+'</small>':'–')+'</span>'+(last?deltaOf(m,all):'<span class="td muted">'+T('还没有数据','No data yet')+'</span>')
      +(pts.length>1?lineSvg(pts,m.wide?320:150,m.wide?64:44,m.c,"spark"):'')+'</button>'}).join("");
  v.innerHTML=goalsHtml()+'<div class="bento">'+tiles+'</div>';animateRings(v)}
let chartRange=30;
function metricSheet(k){const m=METRICS.find(x=>x.k===k),all=m.pts();
  const draw=()=>{const pts=recent(all,chartRange),last=all[all.length-1];
    $("#sheetBody").innerHTML='<div class="sh-h"><h3>'+m.name+'</h3><button class="mini" data-act="close">'+ICON.x+'</button></div>'
      +'<div class="row" style="margin-bottom:14px;align-items:flex-end"><div class="sp"><div class="big">'+(last?last.y.toFixed(m.dec):"–")+'<small>'+m.unit+'</small></div>'+(last?deltaOf(m,all,chartRange):'')+'</div>'
      +'<div class="seg">'+[[14,T("14天","14d")],[30,T("30天","30d")],[90,T("90天","90d")],[0,T("全部","All")]].map(([d,l])=>'<button data-act="range" data-r="'+d+'" aria-pressed="'+(chartRange===d)+'">'+l+'</button>').join("")+'</div></div>'
      +(pts.length>1?'<div class="chart" id="chart">'+lineSvg(pts,340,200,m.c,"",14)+'<span class="tip" id="ctip"></span></div>'
        +'<div class="row muted" style="font-size:11px;font-weight:600;margin-top:6px"><span>'+dayLabel(pts[0].date)+'</span><span class="sp"></span><span>'+dayLabel(pts[pts.length-1].date)+'</span></div>'
        +'<div class="row" style="margin-top:16px;gap:8px"><span class="pill">'+T('最低 ','Low ')+Math.min(...pts.map(p=>p.y)).toFixed(m.dec)+'</span><span class="pill">'+T('最高 ','High ')+Math.max(...pts.map(p=>p.y)).toFixed(m.dec)+'</span><span class="pill">'+pts.length+T(' 个记录',' records')+'</span></div>'
        :'<p class="empty">'+T('这段时间不够两个记录','Fewer than two records in this period')+'</p>')
      +(m.rec?'<button class="btn ghost" style="margin-top:16px;height:46px;font-size:15px" data-act="go" data-to="'+m.rec+'">'+(m.rec==="sync"?ICON.sync+T('从高驰同步','Sync from COROS'):ICON.pen+T('记一笔','Log'))+'</button>':'');
    const ch=$("#chart");if(ch)scrubber(ch,pts,m)};
  openSheet("");draw();metricSheet.redraw=draw}
function scrubber(el,pts,m){const tip=el.querySelector(".tip"),xs=pts.map(p=>p.x),x0=Math.min(...xs),x1=Math.max(...xs);
  const show=e=>{const r=el.getBoundingClientRect(),cx=(e.touches?e.touches[0].clientX:e.clientX)-r.left,fx=x0+(cx/r.width)*(x1-x0);
    let best=pts[0];pts.forEach(p=>{if(Math.abs(p.x-fx)<Math.abs(best.x-fx))best=p});
    tip.textContent=dayLabel(best.date)+'  '+best.y.toFixed(m.dec)+' '+m.unit;tip.style.left=Math.max(40,Math.min(r.width-40,(best.x-x0)/(x1-x0||1)*r.width))+"px";tip.classList.add("on")};
  el.addEventListener("pointerdown",show);el.addEventListener("pointermove",e=>{if(e.buttons||e.pointerType==="touch")show(e)});
  el.addEventListener("pointerup",()=>setTimeout(()=>tip.classList.remove("on"),1200))}

/* ---------- G (Grind): badges and the theme shop ---------- */
const COIN='<svg class="coin" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="10" fill="#FFC53D"/><circle cx="12" cy="12" r="7.2" fill="none" stroke="#B7791F" stroke-width="1.4"/><path d="M15.2 9.4a3.8 3.8 0 1 0 .6 4.1h-3.2" fill="none" stroke="#8A5A12" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
const BADGE_IC={dumbbell:'<path d="M6.5 6.5v11M17.5 6.5v11M3.5 9v6M20.5 9v6M6.5 12h11"/>',flame:'<path d="M12 3c1 4-3 5-3 9a3 3 0 0 0 6 0c0-1-.5-2-1-3 3 1 5 4 5 7a7 7 0 0 1-14 0c0-6 6-8 7-13z"/>',
  pullup:'<path d="M3 4h18M7 4v3M17 4v3"/><circle cx="12" cy="10" r="2.2"/><path d="M7 7l3 5h4l3-5M12 12.5V17M10 21l2-4 2 4"/>',drop:'<path d="M12 3s6 6.5 6 11a6 6 0 0 1-12 0c0-4.5 6-11 6-11z"/>',
  tape:'<rect x="3" y="8" width="18" height="8" rx="2"/><path d="M7 8v3M11 8v4M15 8v3M19 8v4"/>',flag:'<path d="M5 21V4M5 4h11l-2 4 2 4H5"/>',target:'<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/>'};
function coinSheet(shopFirst){const bs=coinBadges(),tot=bs.reduce((a,b)=>a+b.pts,0);
  const nextOf=b=>{if(b.tiers){const n=b.tiers.find(t=>t>b.have);return n==null?null:n}const n=(Math.floor(b.have/b.step+1e-9)+1)*b.step;return +n.toFixed(2)};
  const rows=bs.map(b=>{const n=nextOf(b),prev=b.tiers?([0].concat(b.tiers).filter(t=>t<=b.have).pop()):Math.floor(b.have/b.step+1e-9)*b.step,pct=n==null?1:Math.max(0,Math.min(1,(b.have-prev)/(n-prev)));
    return '<div class="badge'+(b.pts?" got":"")+'"><span class="bi"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">'+BADGE_IC[b.ic]+'</svg></span>'
      +'<div class="sp"><div class="row"><b class="sp">'+b.name+'</b><span class="n bp">'+(b.pts?'+'+fmt(b.pts):'0')+'</span></div><p class="muted">'+b.what+'</p>'
      +'<div class="bar" style="--c:'+(b.pts?'var(--ac)':'var(--muted)')+';height:6px;margin-top:6px"><i style="width:'+(pct*100)+'%"></i></div>'
      +'<p class="muted n" style="font-size:11px;margin-top:3px">'+(n==null?T('全部拿到','All earned'):T('现在 ','Now ')+b.have+' '+b.unit+T(' · 下一档 ',' · next at ')+n+' '+b.unit)+'</p></div></div>'}).join("");
  const shop=[[T("像素 RPG","Pixel RPG"),T("打勾就挥剑，练完打怪升级","Every tick swings a sword; level up as you train")],[T("Low poly 小镇","Low-poly town"),T("每个训练日在小镇里盖一栋楼","Every training day builds a house in town")]].map(([n,d])=>'<div class="shopc"><div class="shopart"></div><div class="sp"><b>'+n+'</b><p class="muted">'+d+'</p></div><div style="text-align:right"><span class="coinchip">'+COIN+'<b class="n">2,000</b></span><br><span class="pill" style="margin-top:6px">'+T('即将上线','Coming soon')+'</span></div></div>').join("");
  openSheet('<div class="sh-h"><h3>G</h3><button class="mini" data-act="close">'+ICON.x+'</button></div>'
    +'<div class="row" style="margin-bottom:16px"><span class="coinbig">'+COIN+'</span><div class="sp"><div class="big">'+fmt(tot)+'</div><p class="muted" style="font-size:12px">'+T('练出来的真实进步才给币，从记录里算出来','Real progress earns G, worked out from your records')+'</p></div></div>'
    +'<p class="eyebrow" id="shop" style="margin-bottom:8px">'+T('主题商店','Theme shop')+'</p><div class="setlist">'+shop+'</div><p class="muted" style="font-size:12px;margin:8px 2px 18px">'+T('亮、暗两套永远免费。','Light and dark stay free.')+'</p>'
    +'<p class="eyebrow" style="margin-bottom:8px">'+T('怎么拿','How to earn')+'</p><div class="setlist">'+rows+'</div>');
  if(shopFirst)setTimeout(()=>{const el=document.getElementById("shop");if(el)el.scrollIntoView({block:"start"})},50)}
/* ---------- sheet ---------- */
function openSheet(html){$("#sheetBody").innerHTML=html;$("#sheet").classList.add("on");document.body.style.overflow="hidden"}
function closeSheet(){$("#sheet").classList.remove("on");if(!run)document.body.style.overflow=""}
$("#sheet").addEventListener("click",e=>{if(e.target.id==="sheet")closeSheet()});
(function(){const pnl=$("#sheet .panel");let y0=null,dy=0;
  pnl.addEventListener("touchstart",e=>{if(pnl.scrollTop>0)return;y0=e.touches[0].clientY;dy=0},{passive:true});
  pnl.addEventListener("touchmove",e=>{if(y0==null)return;dy=Math.max(0,e.touches[0].clientY-y0);pnl.style.transition="none";pnl.style.transform="translateY("+dy+"px)"},{passive:true});
  pnl.addEventListener("touchend",()=>{if(y0==null)return;pnl.style.transition="";pnl.style.transform="";if(dy>90)closeSheet();y0=null})})();
function meSheet(){let m="auto";try{m=localStorage.getItem(PK+"mode")||"auto"}catch(e){}
  const row=(to,ic,t)=>'<button class="opt" data-act="go" data-to="'+to+'">'+ic+'<span class="sp">'+t+'</span>'+ICON.right+'</button>';
  openSheet('<div class="sh-h"><h3>'+T('设定','Settings')+'</h3><button class="mini" data-act="close">'+ICON.x+'</button></div><p class="eyebrow" style="margin-bottom:8px">'+T('外观','Appearance')+'</p>'
    +'<div class="setlist">'+[["auto",T("跟随手机","Match the phone")],["light",T("亮","Light")],["dark",T("暗","Dark")]].map(([k,l])=>'<button class="opt" data-act="mode" data-m="'+k+'" aria-pressed="'+(m===k)+'">'+l+'</button>').join("")
    +'<button class="opt" data-act="shop">'+COIN+'<span class="sp">'+T('主题商店','Theme shop')+'</span>'+ICON.right+'</button>'
    +'<button class="opt" data-act="classic">'+ICON.swatch+'<span class="sp">'+T('经典界面','Classic interface')+'<br><span class="muted" style="font-size:12px;font-weight:500">'+T('原来的样子和 29 套主题','The original look and its 29 themes')+'</span></span>'+ICON.right+'</button></div>'
    +'<p class="eyebrow" style="margin:18px 0 8px">'+T('语言','Language')+'</p><div class="setlist">'+[["zh","中文"],["en","English"]].map(([k,l])=>'<button class="opt" data-act="lang" data-l="'+k+'" aria-pressed="'+(LANG===k)+'">'+l+'</button>').join("")+'</div>'
    +'<p class="eyebrow" style="margin:18px 0 8px">'+T('更多','More')+'</p><div class="setlist">'
    +row("p1:profile",ICON.user,T("个人资料","Profile"))+row("p1:goals",ICON.target,T("目标","Goals"))+row("p1:backup",ICON.cloud,T("备份进度与高驰","Backup & COROS"))+row("p1:table",ICON.table,T("饮食表格","Food table"))+row("p1:charts",ICON.sliders,T("图表、同步和手表热量","Charts, sync & watch calories"))+'</div>'
    +'<p class="muted" style="font-size:11px;text-align:center;margin-top:18px">'+T('推拉机 ','track-TOR ')+($("#ver")?$("#ver").textContent:"")+'</p>')}

/* ---------- header, dock, routing ---------- */
function paintHeader(v){const d=new Date();$("#today").textContent=LANG==="en"?["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"][d.getDay()]+", "+MON_EN[d.getMonth()]+" "+d.getDate():(d.getMonth()+1)+"月"+d.getDate()+"日 周"+WD[d.getDay()];
  $("#title").textContent=(LANG==="en"?{train:"Train",diet:"Diet",prog:"Progress"}:{train:"训练",diet:"饮食",prog:"进展"})[v];
  let ls="";try{ls=localStorage.getItem("tracktor-lastsync")||""}catch(e){}$("#syncDot").classList.toggle("ok",ls.startsWith(today()))}
function placePc(anim){const b=document.querySelector('.dock [aria-selected="true"]'),pc=document.querySelector(".dock .pc");if(!b)return;
  if(!anim)pc.style.transition="none";pc.style.width=b.offsetWidth+"px";pc.style.transform="translateX("+(b.offsetLeft-6)+"px)";pc.style.left="6px";if(!anim){void pc.offsetWidth;pc.style.transition=""}}
let cur="train";
function show(v,anim,keep){cur=v;document.querySelectorAll(".view").forEach(x=>x.classList.toggle("on",x.id==="v-"+v));
  document.querySelectorAll(".dock button").forEach(b=>b.setAttribute("aria-selected",b.dataset.v===v));
  ({train:renderTrainView,diet:renderDietView,prog:renderProgView})[v]();if(v==="diet"&&!keep)dietPull(false);paintHeader(v);requestAnimationFrame(()=>placePc(anim));
  try{localStorage.setItem(PK+"tab",v)}catch(e){}if(!keep)scrollTo({top:0})}
document.querySelector(".dock").addEventListener("click",e=>{const b=e.target.closest("[data-v]");if(b&&b.getAttribute("aria-selected")!=="true"){SFX.tap();show(b.dataset.v,true)}});
addEventListener("resize",()=>placePc(false));
$("#meBtn").addEventListener("click",meSheet);
$("#syncBtn").addEventListener("click",()=>bridge("sync"));

document.addEventListener("click",e=>{const b=e.target.closest("[data-act]");if(!b)return;const a=b.dataset.act;
  if(a==="month"){monthOpen=!monthOpen;monthOff=0;renderTrainView()}
  else if(a==="mprev"){monthOff--;renderTrainView()}
  else if(a==="mnext"){if(monthOff<0){monthOff++;renderTrainView()}}
  else if(a==="start")startRun(b.dataset.sid);
  else if(a==="swap"){heroSid=b.dataset.sid;renderTrainView()}
  else if(a==="plan")planSheet();
  else if(a==="why")planSheet(b.dataset.k);
  else if(a==="close")closeSheet();
  else if(a==="day")daySheet(b.dataset.d);
  else if(a==="metric"){chartRange=30;metricSheet(b.dataset.k)}
  else if(a==="range"){chartRange=+b.dataset.r;metricSheet.redraw()}
  else if(a==="goal")bridge("goals");
  else if(a==="coins")coinSheet(false);
  else if(a==="gapr")setGapRange(+b.dataset.r);
  else if(a==="shop")coinSheet(true);
  else if(a==="go")bridge(b.dataset.to);
  else if(a==="classic"){try{localStorage.setItem("tracktor-ui","classic")}catch(err){}location.href="classic.html"}
  else if(a==="lang"){try{localStorage.setItem("tracktor-lang",b.dataset.l);if(b.dataset.l==="en")localStorage.setItem("tracktor-ui","p1")}catch(err){}location.reload()}
  else if(a==="mode"){try{localStorage.setItem(PK+"mode",b.dataset.m)}catch(err){}applyMode();meSheet()}
  else if(run){
    if(a==="fclose"){if(!run.finished&&run.sets.some(x=>x.some(y=>y.d)))toast(T("打过的勾都已保存，下次接着练","Your ticks are saved; carry on next time"));closeRun()}
    else if(a==="untick")untick(+b.dataset.i);
    else if(a==="feel"){const id=run.p.ex[run.askFeel].id;if(b.dataset.f){run.doc.feel=run.doc.feel||{};run.doc.feel[id]=b.dataset.f;lsSave()}
      run.askFeel=null;SFX.tap();const nx=run.sets.findIndex(x=>x.some(y=>!y.d));if(nx>=0)run.ex=nx;renderFocus(true)}
    else if(a==="tick")tickSet();
    else if(a==="timer"){if(run.timing)stopTimer();else startTimer()}
    else if(a==="inc"||a==="dec"){const ci=curSet();if(ci<0)return;run.doc.edited=true;const s=run.sets[run.ex][ci],st=run.p.ex[run.ex].unit==="秒"?5:1;s.v=Math.max(0,(+s.v||0)+(a==="inc"?st:-st));
      run.sets[run.ex].forEach((x,i)=>{if(i>ci&&!x.d)x.v=s.v});lsSave();SFX.tap();const el=$("#fVal");el.textContent=s.v;el.classList.remove("pop");void el.offsetWidth;el.classList.add("pop");
      document.querySelectorAll(".f-sets i").forEach((x,i)=>{if(i>ci&&!run.sets[run.ex][i].d)x.textContent=i+1})}
    else if(a==="rplus"){run.rest+=30;run.restMax=Math.max(run.restMax,run.rest)}
    else if(a==="rskip"){run.rest=0;clearInterval(restT);renderFocus(true)}
    else if(a==="fnext"){const n=run.sets.findIndex(x=>x.some(y=>!y.d));if(n>=0){run.ex=n;renderFocus(true)}}
  }});

if("serviceWorker" in navigator)addEventListener("load",()=>navigator.serviceWorker.register("./sw.js").catch(()=>{}));
engPlanAll();
document.documentElement.lang=LANG==="en"?"en":"zh-CN";
document.querySelectorAll(".dock [data-v]").forEach(b=>{const l={diet:T("饮食","Diet"),train:T("训练","Train"),prog:T("进展","Progress")}[b.dataset.v];b.querySelector("span").textContent=l;b.setAttribute("aria-label",l)});
$("#meBtn").setAttribute("aria-label",T("设定","Settings"));$("#syncBtn").setAttribute("aria-label",T("同步","Sync"));
let start="train";try{start=localStorage.getItem(PK+"tab")||"train"}catch(e){}
if(!["train","diet","prog"].includes(start))start="train";
show(start,false);
