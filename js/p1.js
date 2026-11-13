/* 推拉机 main interface (P1): the screens. Training writes to the same records as the classic page (classic.html);
   what is not built here yet (logging food and body measures, COROS, profile, backup, the 29 classic themes) opens
   the classic page at that spot, with a way back. */

/* ---------- small helpers ---------- */
const $=s=>document.querySelector(s);
const PK="tracktor-p1-";
/* things not built here yet open the classic page at that spot (see the ?go= handler in js/main.js) */
const bridge=to=>{location.href="classic.html?go="+encodeURIComponent(to)};
const WD=["日","一","二","三","四","五","六"];
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
  trophy:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0z"/><path d="M17 5h3v2a3 3 0 0 1-3 3M7 5H4v2a3 3 0 0 0 3 3"/></svg>'};
function dateObj(s){const [y,m,d]=s.split("-").map(Number);return new Date(y,m-1,d)}
function dayLabel(s){const t=today();if(s===t)return "今天";if(s===ymdAdd(t,-1))return "昨天";const d=dateObj(s);return (d.getMonth()+1)+"."+d.getDate()}
function ringSvg(size,stroke,pct,color,track){const r=(size-stroke)/2,c=2*Math.PI*r,off=c*(1-Math.max(0,Math.min(1,pct)));
  return '<svg width="'+size+'" height="'+size+'" viewBox="0 0 '+size+' '+size+'"><circle cx="'+size/2+'" cy="'+size/2+'" r="'+r+'" stroke="'+track+'" stroke-width="'+stroke+'"/>'
    +'<circle class="rv" cx="'+size/2+'" cy="'+size/2+'" r="'+r+'" stroke="'+color+'" stroke-width="'+stroke+'" stroke-dasharray="'+c+'" stroke-dashoffset="'+c+'" data-off="'+off+'"/></svg>'}
function animateRings(root){requestAnimationFrame(()=>requestAnimationFrame(()=>root.querySelectorAll("circle.rv").forEach(c=>c.style.strokeDashoffset=c.dataset.off)))}

/* a first visit fills in the profile on the classic page's welcome sheet, then comes back */
/* (once: if the sheet is closed without saving anything, this page still opens normally next time) */
(function(){let seen=false;try{seen=localStorage.getItem(PK+"welcomed")==="1";if(FRESH&&!seen)localStorage.setItem(PK+"welcomed","1")}catch(e){seen=true}
  if(FRESH&&!seen)location.replace("classic.html?go=welcome")})();

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
  const marks=dayMarks(),now=new Date(),head='<div class="days">'+["一","二","三","四","五","六","日"].map(w=>'<span class="dw">'+w+'</span>').join("");
  const ws=weekStart(now);let week=head;for(let i=0;i<7;i++){const d=new Date(ws);d.setDate(ws.getDate()+i);week+=dayCell(ymd(d),marks)}week+="</div>";
  const first=new Date(now.getFullYear(),now.getMonth()+monthOff,1),ms=weekStart(first);let month=head;
  for(let i=0;i<42;i++){const d=new Date(ms);d.setDate(ms.getDate()+i);if(i===35&&d.getMonth()!==first.getMonth())break;month+=dayCell(ymd(d),marks,d.getMonth()!==first.getMonth())}month+="</div>";
  let wkCount=0;for(let i=0;i<7;i++){const d=new Date(ws);d.setDate(ws.getDate()+i);if(marks[ymd(d)])wkCount++}
  return '<section class="card"><div class="wk-h"><b>'+(first.getMonth()+1)+'月'+(monthOpen&&first.getFullYear()!==now.getFullYear()?" "+first.getFullYear():"")+'</b>'
    +(monthOpen?'<div class="mnav"><button class="mini" data-act="mprev" aria-label="上个月">'+ICON.left+'</button><button class="mini" data-act="mnext" aria-label="下个月"'+(monthOff>=0?' disabled style="opacity:.35"':'')+'>'+ICON.right+'</button></div>'
      :'<span class="pill'+(wkCount?' ac':'')+'" style="margin-left:auto">本周 '+wkCount+' 天</span>')
    +'<button class="mini chev" data-act="month" aria-expanded="'+monthOpen+'" aria-label="'+(monthOpen?"收起":"展开")+'整月">'+ICON.chev+'</button></div>'
    +(monthOpen?month:week)+'</section>'}
function heroHtml(){
  const nx=firstOpen();if(!nx)return '<section class="dark hero"><p class="eyebrow">20 天计划</p><h2>全部完成 🎉</h2></section>';
  const p=BYID[heroSid&&!(state.sessions[heroSid]&&state.sessions[heroSid].done)?heroSid:nx.sid],sets=setsOf(p.sid);
  const tot=sets.reduce((a,x)=>a+x.length,0),dn=sets.reduce((a,x)=>a+x.filter(y=>y.d).length,0);
  const other=nextOf(p.kind==="push"?"pull":"push");
  return '<section class="dark hero"><i class="glowring"></i><p class="eyebrow">'+(p.sid===nx.sid?"下一次":"也可以练")+'</p>'
    +'<h2><i class="kd" style="background:var(--'+p.kind+')"></i>'+LAB(p)+'</h2>'
    +'<p class="meta">'+p.ex.length+' 个动作 · '+tot+' 组 · 约 '+Math.round(tot*1.6)+' 分钟</p>'
    +'<ul class="exl">'+p.ex.map((e,i)=>'<li class="'+(sets[i].every(x=>x.d)?"dn":"")+'"><span>'+NS(e)+'</span><b>'+e.sets+' × '+e.target+(e.unit==="个"?"":" "+U(e.unit))+'</b></li>').join("")+'</ul>'
    +'<button class="btn" data-act="start" data-sid="'+p.sid+'">'+ICON.play+(dn?'继续 · '+dn+'/'+tot:'开始')+'</button>'
    +(other&&other.sid!==p.sid?'<div class="hero-alt"><button data-act="swap" data-sid="'+other.sid+'"><i class="kd" style="background:var(--'+other.kind+');width:8px;height:8px"></i>换成 '+LAB(other)+'</button></div>':'')
    +'</section>'}
function planHtml(){const done=PROGRAM.filter(p=>state.sessions[p.sid]&&state.sessions[p.sid].done),np=done.filter(p=>p.kind==="push").length;
  const last=Object.entries(state.sessions).filter(([sid,s])=>s&&s.done&&s.date&&BYID[sid]).sort((a,b)=>a[1].date<b[1].date?1:-1)[0];
  let lastTxt="";if(last){const [sid,s]=last;let reps=0;Object.entries(s.sets||{}).forEach(([id,a])=>{const e=BYID[sid].ex.find(x=>x.id===id);if(e&&e.unit==="个")a.forEach(x=>{if(x.d)reps+=+x.v||0})});
    lastTxt='上次 '+dayLabel(s.date)+' · '+LAB(BYID[sid])+' · '+reps+' 次'}
  return '<section class="card"><button class="planc" data-act="plan"><span class="ring">'+ringSvg(64,7,done.length/40,"var(--ac)","var(--sub)")+'<span class="rl"><b class="n" style="font-size:17px;font-weight:800">'+done.length+'</b><br><span class="muted" style="font-size:10px;font-weight:600">/ 40</span></span></span>'
    +'<span class="sp"><h3>20 天计划</h3><p class="muted">推 '+np+' · 拉 '+(done.length-np)+(lastTxt?'<br>'+lastTxt:'')+'</p></span><span class="mini">'+ICON.right+'</span></button></section>'}
function renderTrainView(){const v=$("#v-train");v.innerHTML=heroHtml()+calHtml()+planHtml();animateRings(v)}
function planSheet(){const cells=PROGRAM.map(p=>{const s=state.sessions[p.sid],dn=s&&s.done,av=!dn&&nextOf(p.kind)===p;
  return '<span class="'+(dn?"dn":av?"av":"")+'" style="--k:var(--'+p.kind+')">'+SHORT(p)+'</span>'}).join("");
  openSheet('<div class="sh-h"><h3>20 天计划</h3><button class="mini" data-act="close">'+ICON.x+'</button></div><div class="plan40">'+cells+'</div>'
    +'<p class="muted" style="font-size:12px;margin-top:14px">实心是练过的，描边是现在能练的。推和拉各自往前走。</p>')}

/* ---------- focus mode ---------- */
let run=null,restT=0,timerT=0,clockT=0;
const restOf=e=>e.id==="pullup"?150:(e.id==="hang"||e.id==="ecc")?90:e.unit==="分钟"?0:60;
/* the sets are the session's own arrays (sessionDoc), so every tick, change and finish is saved as it happens */
function startRun(sid){const p=BYID[sid],doc=sessionDoc(sid),pb=pullSeries();
  run={sid,p,doc,sets:p.ex.map(e=>doc.sets[e.id]),ex:0,t0:Date.now(),rest:0,timing:0,best0:pb.length?Math.max(...pb.map(x=>x.y)):0};
  run.ex=Math.max(0,run.sets.findIndex(a=>a.some(x=>!x.d)));
  const f=$("#focus");f.classList.add("on");f.setAttribute("aria-hidden","false");document.body.style.overflow="hidden";
  clearInterval(clockT);clockT=setInterval(()=>{const el=$("#fTime");if(el){const s=Math.floor((Date.now()-run.t0)/1000);el.textContent=Math.floor(s/60)+":"+pad(s%60)}},1000);
  renderFocus()}
function closeRun(){clearInterval(clockT);clearInterval(restT);clearInterval(timerT);const f=$("#focus");f.classList.remove("on");f.setAttribute("aria-hidden","true");document.body.style.overflow="";run=null;renderTrainView()}
function curSet(){return run.sets[run.ex].findIndex(x=>!x.d)}
function renderFocus(anim){
  const f=$("#focus"),p=run.p,e=p.ex[run.ex],a=run.sets[run.ex],ci=curSet(),allDone=run.sets.every(x=>x.every(y=>y.d));
  if(allDone&&!run.finished){finishRun();return}
  const dots=p.ex.map((x,i)=>'<i class="'+(run.sets[i].every(y=>y.d)?"dn":i===run.ex?"cur":"")+'"></i>').join("");
  const val=ci<0?a[a.length-1].v:a[ci].v;
  let bottom;
  if(run.rest>0)bottom=restHtml();
  else if(ci<0)bottom='<button class="tickb done" disabled>'+ICON.check+'</button><button class="f-hint" data-act="fnext">这个动作完成了 · 下一个 →</button>';
  else if(e.unit==="秒")bottom='<button class="tickb" data-act="timer" aria-label="开始计时">'+(run.timing?'<svg class="tr" viewBox="0 0 112 112"><circle cx="56" cy="56" r="52" id="tRing" stroke-dasharray="326.7" stroke-dashoffset="0"/></svg>'+ICON.check:ICON.play)+'</button><p class="f-hint">'+(run.timing?"做完了就点，提前结束也算":"点一下开始计时")+'</p>';
  else bottom='<button class="tickb" data-act="tick" aria-label="完成这一组">'+ICON.check+'</button><p class="f-hint">左右滑动换动作</p>';
  f.innerHTML='<div class="f-top"><button class="mini" data-act="fclose" aria-label="退出">'+ICON.x+'</button><div class="f-dots">'+dots+'</div><span class="f-time n" id="fTime">0:00</span></div>'
    +'<div class="f-body" id="fBody"><p class="eyebrow">'+LAB(p)+' · 动作 '+(run.ex+1)+' / '+p.ex.length+'</p><h2>'+N(e)+'</h2><p class="f-note">'+(e.note?NOTE(e):"")+'</p>'
    +'<div class="f-sets">'+a.map((x,i)=>x.d?'<i class="dn" role="button" tabindex="0" data-act="untick" data-i="'+i+'" aria-label="撤销第 '+(i+1)+' 组">'+x.v+'</i>':'<i class="'+(i===ci?"cur":"")+'">'+(i===ci?"第 "+(i+1)+" 组":i+1)+'</i>').join("")+'</div>'
    +'<div class="f-num">'+(ci<0||run.timing?'<span style="width:46px"></span>':'<button class="mini" data-act="dec" aria-label="减一">−</button>')+'<b class="n'+(anim?" pop":"")+'" id="fVal">'+(run.timing?run.timeLeft:val)+'</b>'
    +(ci<0||run.timing?'<span style="width:46px"></span>':'<button class="mini" data-act="inc" aria-label="加一">+</button>')+'</div>'
    +'<p class="f-unit">'+U(e.unit)+(ci<0?' · 全部 '+a.length+' 组完成':' · 第 '+(ci+1)+' 组 / 共 '+a.length+' 组')+'</p></div>'
    +'<div class="f-bottom" id="fBottom">'+bottom+'</div>';
  const s=Math.floor((Date.now()-run.t0)/1000);$("#fTime").textContent=Math.floor(s/60)+":"+pad(s%60);
  swipe($("#fBody"))}
function restHtml(){return '<div class="rest"><p class="eyebrow">组间休息</p><div class="big" id="rLeft">'+Math.floor(run.rest/60)+':'+pad(run.rest%60)+'</div>'
  +'<div class="bar"><i id="rBar" style="width:'+(run.rest/run.restMax*100)+'%"></i></div><div class="row"><button data-act="rplus">+30 秒</button><button class="ac" data-act="rskip">跳过</button></div></div>'}
function tickSet(v){const a=run.sets[run.ex],ci=curSet();if(ci<0)return;a[ci].o=maxOrdOf(run.doc)+1;a[ci].d=true;if(v!=null)a[ci].v=v;lsSave();
  SFX.tick();buzz(18);
  const e=run.p.ex[run.ex];
  if(a.every(x=>x.d)){SFX.ex();buzz([20,40,30]);
    if(window.confetti&&!matchMedia("(prefers-reduced-motion: reduce)").matches)confetti({particleCount:40,spread:60,startVelocity:32,origin:{y:.75},colors:[getComputedStyle(document.documentElement).getPropertyValue("--ac").trim(),"#ffffff"],zIndex:60,disableForReducedMotion:true});
    const nx=run.sets.findIndex(x=>x.some(y=>!y.d));
    if(nx<0){renderFocus();return}
    setTimeout(()=>{if(!run)return;run.ex=nx;renderFocus(true)},900);renderFocus();return}
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
  run.doc.done=true;run.doc.date=today();lsSave();heroSid=null;
  let reps=0,sets=0,pu=0;run.sets.forEach((a,i)=>a.forEach(x=>{if(!x.d)return;sets++;if(p.ex[i].unit==="个")reps+=x.v;if(p.ex[i].id==="pullup")pu=Math.max(pu,x.v)}));
  const best=run.best0;
  SFX.done();buzz([30,60,30,60,80]);
  if(window.confetti&&!matchMedia("(prefers-reduced-motion: reduce)").matches){const c=getComputedStyle(document.documentElement).getPropertyValue("--ac").trim();
    [0,250,500].forEach((t,i)=>setTimeout(()=>{confetti({particleCount:70,angle:60,spread:60,origin:{x:0,y:.8},colors:[c,"#fff","#FFD24D"],zIndex:60});confetti({particleCount:70,angle:120,spread:60,origin:{x:1,y:.8},colors:[c,"#fff","#FFD24D"],zIndex:60})},t))}
  $("#focus").innerHTML='<div class="f-top"><span class="sp"></span><button class="mini" data-act="fclose" aria-label="关闭">'+ICON.x+'</button></div>'
    +'<div class="f-body"><div class="fin"><div class="medal">'+ICON.trophy+'</div><p class="eyebrow">'+LAB(p)+'</p><h2>练完了</h2>'
    +(pu?'<span class="pill ac" style="margin-top:6px">引体单组 '+pu+' 个'+(pu>best?' · 新纪录':'')+'</span>':'')
    +'<div class="stats"><div><b>'+sets+'</b><span>组</span></div><div><b>'+reps+'</b><span>次</span></div><div><b>'+Math.max(1,Math.round(secs/60))+'</b><span>分钟</span></div></div></div></div>'
    +'<div class="f-bottom"><button class="btn" data-act="fclose">好</button><p class="f-hint">'+(firstOpen()?'下一次：'+LAB(firstOpen()):'20 天计划全部完成')+'</p></div>'}
function swipe(el){let x0=null,y0=0;el.addEventListener("touchstart",e=>{x0=e.touches[0].clientX;y0=e.touches[0].clientY},{passive:true});
  el.addEventListener("touchend",e=>{if(x0==null||!run||run.timing)return;const dx=e.changedTouches[0].clientX-x0,dy=e.changedTouches[0].clientY-y0;x0=null;
    if(Math.abs(dx)<50||Math.abs(dy)>Math.abs(dx))return;const n=run.ex+(dx<0?1:-1);if(n<0||n>=run.p.ex.length)return;
    run.ex=n;run.rest=0;clearInterval(restT);SFX.tap();renderFocus(true)})}

/* ---------- diet view ---------- */
function renderDietView(){const v=$("#v-diet"),t=today();
  const tin=intakeOf(t),tb=burnOfDate(t),gap=tin!=null&&tb!=null?tb-tin:null,pr=proteinOf(t),need=proteinNeed(t);
  const y=ymdAdd(t,-1),yg=dietGapOf(y);
  let hero='<section class="card"><div class="row" style="align-items:flex-start"><div class="sp">';
  if(gap!=null)hero+='<p class="eyebrow">今天 · '+(gap>=0?"缺口":"盈余")+'</p><div class="big" style="color:'+(gap>=0?"var(--good)":"var(--bad)")+'">'+fmt(Math.abs(gap))+'<small>kcal</small></div><p class="muted" style="font-size:12px;margin-top:4px">摄入 '+fmt(tin)+' · 消耗 '+fmt(tb)+'</p>';
  else if(tin!=null)hero+='<p class="eyebrow">今天 · 摄入</p><div class="big">'+fmt(tin)+'<small>kcal</small></div><p class="muted" style="font-size:12px;margin-top:4px">消耗等手表同步'+(yg!=null?' · 昨天缺口 '+fmt(yg):'')+'</p>';
  else hero+='<p class="eyebrow">今天</p><div class="big" style="font-size:26px">还没记</div><p class="muted" style="font-size:12px;margin-top:4px">'+(yg!=null?'昨天'+(yg>=0?'缺口 ':'盈余 ')+fmt(Math.abs(yg))+' kcal':'点下面记一笔')+'</p>';
  const pp=pr!=null&&need?pr/need:0;
  hero+='</div><div class="ring">'+ringSvg(76,8,pp,"var(--sleep)","var(--sub)")+'<span class="rl"><b class="n" style="font-size:16px;font-weight:800">'+(pr!=null?Math.round(pr):"–")+'</b><br><span class="muted" style="font-size:10px;font-weight:600">/ '+Math.round(need)+' g</span></span></div></div>';
  if(tin!=null&&tb!=null){const mx=Math.max(tin,tb);hero+='<div class="ib"><i style="width:'+(tin/mx*100)+'%;background:var(--ink)"></i><i style="width:'+(Math.max(0,tb-tin)/mx*100)+'%;background:var(--good);opacity:.35"></i></div>'
    +'<div class="legend"><span><i style="background:var(--ink)"></i>摄入</span><span><i style="background:var(--good);opacity:.5"></i>缺口</span><span style="margin-left:auto"><i style="background:var(--sleep)"></i>蛋白质</span></div>'}
  hero+='<button class="btn ghost" style="margin-top:16px;height:46px;font-size:15px" data-act="go" data-to="diet">'+ICON.plus+'记一笔</button></section>';
  /* the last 7 finished days */
  const days=[];for(let i=7;i>=1;i--)days.push(ymdAdd(t,-i));
  const gaps=days.map(d=>dietGapOf(d)),known=gaps.filter(g=>g!=null),sum=known.reduce((a,g)=>a+g,0),mx=Math.max(300,...known.map(Math.abs));
  const week='<section class="card"><div class="row"><div class="sp"><p class="eyebrow">过去 7 天'+(known.length<7?' · 记了 '+known.length+' 天':'')+'</p><div class="big" style="font-size:26px">'+(known.length?(sum>=0?"":"+")+fmt(Math.abs(sum)):"–")+'<small>kcal '+(sum>=0?"缺口":"盈余")+'</small></div></div>'
    +(known.length?'<span class="pill '+(sum>=0?"good":"bad")+'">≈ '+(Math.abs(sum)/7700).toFixed(2)+' kg 脂肪</span>':'')+'</div>'
    +'<div class="bars7">'+days.map((d,i)=>{const g=gaps[i];return '<div class="bc"><div class="bw"><div class="bv" style="height:'+(g==null?6:Math.max(8,Math.abs(g)/mx*86))+'px;background:'+(g==null?"var(--sub)":g>=0?"var(--good)":"var(--bad)")+';opacity:'+(g==null?1:.85)+'"></div></div><span class="bl">'+WD[dateObj(d).getDay()]+'</span></div>'}).join("")+'</div></section>';
  const keys=Object.keys(state.diet).filter(d=>d<=t).sort().reverse().slice(0,14);
  const list='<section class="card"><p class="eyebrow" style="margin-bottom:4px">记录</p>'+(keys.length?'<div class="dl">'+keys.map(d=>{const a=intakeOf(d),g=dietGapOf(d);
      return '<button data-act="day" data-d="'+d+'"><span class="dt">'+dayLabel(d)+'</span><span class="di n">'+(a!=null?fmt(a)+' kcal':'–')+'</span>'+(g!=null?'<span class="pill '+(g>=0?"good":"bad")+'">'+(g>=0?"−":"+")+fmt(Math.abs(g))+'</span>':'')+'<svg class="go" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="m9 6 6 6-6 6"/></svg></button>'}).join("")+'</div>'
    :'<p class="empty">还没有饮食记录</p>')+'</section>';
  v.innerHTML=hero+week+list;animateRings(v)}
function daySheet(d){const day=state.diet[d]||{},items=day.items||[],tt=dietTotals(day),a=intakeOf(d),b=burnOfDate(d),g=dietGapOf(d);
  const f1=x=>x==null||x===""?"–":(+x).toFixed(0);
  openSheet('<div class="sh-h"><h3>'+dayLabel(d)+(dayLabel(d).includes(".")?"":' · '+(dateObj(d).getMonth()+1)+'.'+dateObj(d).getDate())+'</h3><button class="mini" data-act="close">'+ICON.x+'</button></div>'
    +'<div class="row" style="margin-bottom:16px"><div class="sp"><p class="eyebrow">摄入</p><b class="n" style="font-size:22px;font-weight:800">'+fmt(a)+'</b></div><div class="sp"><p class="eyebrow">消耗</p><b class="n" style="font-size:22px;font-weight:800">'+fmt(b)+'</b></div>'
    +'<div class="sp"><p class="eyebrow">'+(g==null||g>=0?"缺口":"盈余")+'</p><b class="n" style="font-size:22px;font-weight:800;color:'+(g==null?"inherit":g>=0?"var(--good)":"var(--bad)")+'">'+(g==null?"–":fmt(Math.abs(g)))+'</b></div></div>'
    +(items.length?'<table class="tbl"><tr><th>食物</th><th>蛋白</th><th>脂肪</th><th>碳水</th><th>kcal</th></tr>'+items.map(it=>'<tr><td>'+escHtml(it.name||"")+'</td><td>'+f1(it.p)+'</td><td>'+f1(it.f)+'</td><td>'+f1(it.c)+'</td><td>'+f1(it.kcal)+'</td></tr>').join("")
      +(items.length>1?'<tr class="tot"><td>合计</td><td>'+f1(tt.p)+'</td><td>'+f1(tt.f)+'</td><td>'+f1(tt.c)+'</td><td>'+f1(tt.kcal)+'</td></tr>':'')+'</table>':'<p class="empty">这天只记了总数</p>')
    +(day.note?'<p class="muted" style="font-size:12px;margin-top:12px">'+escHtml(day.note)+'</p>':'')
    +'<button class="btn ghost" style="margin-top:16px;height:46px;font-size:15px" data-act="go" data-to="diet:'+d+'">'+ICON.pen+'编辑这天</button>')}

/* ---------- progress view ---------- */
const METRICS=[
  {k:"pull",name:"标准引体",unit:"个",c:"var(--pull)",up:1,wide:1,pts:()=>pullSeries(),dec:0,rec:"rec:pullups"},
  {k:"wt",name:"体重",unit:"kg",c:"var(--push)",up:0,pts:()=>avg7(wtMerged()),dec:1,sub:"7 日均",rec:"rec:weight"},
  {k:"waist",name:"腰围",unit:"cm",c:"var(--ac-text)",up:0,pts:()=>series("waist"),dec:1,rec:"rec:waist"},
  {k:"sleep",name:"睡眠",unit:"分",c:"var(--sleep)",up:1,pts:()=>series("sleep"),dec:0,rec:"sync"},
  {k:"hrv",name:"HRV",unit:"ms",c:"#38BDF8",up:1,pts:()=>series("hrv"),dec:0,rec:"sync"},
  {k:"rhr",name:"静息心率",unit:"bpm",c:"var(--bad)",up:0,pts:()=>series("rhr"),dec:0,rec:"sync"}];
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
function deltaOf(m,pts){if(pts.length<2)return "";const last=pts[pts.length-1],t=last.x-30;let ref=pts[0];for(const p of pts)if(p.x<=t)ref=p;
  const d=last.y-ref.y;if(Math.abs(d)<(m.dec?.05:.5))return '<span class="td muted">30 天持平</span>';
  const good=(d>0)===!!m.up;return '<span class="td" style="color:'+(good?"var(--good)":"var(--bad)")+'">'+(d>0?"↑ ":"↓ ")+Math.abs(d).toFixed(m.dec)+' '+m.unit+' · 30 天</span>'}
function goalsHtml(){const st=state.settings,gap=gapAllTime();
  const pu=pullSeries(),wt=avg7(wtMerged()),wz=series("waist");
  const G=[{n:"引体",c:"var(--pull)",cur:pu.length?pu[pu.length-1].y:null,start:0,tg:+st.p||null,u:"个"},
    {n:"腰围",c:"var(--ac)",cur:wz.length?wz[wz.length-1].y:null,start:wz.length?wz[0].y:null,tg:+st.z||null,u:"cm"},
    {n:"体重",c:"var(--sleep)",cur:wt.length?+wt[wt.length-1].y.toFixed(1):null,start:wt.length?wt[0].y:null,tg:+st.w||null,u:"kg"},
    {n:"减脂",c:"#FFB020",cur:gap?+(gap.s/7700).toFixed(1):null,start:0,tg:+st.fat||null,u:"kg"}];
  return '<section class="dark"><p class="eyebrow" style="margin-bottom:14px">目标</p><div class="goals4">'+G.map(g=>{
    const pct=g.tg&&g.cur!=null&&g.start!=null&&g.start!==g.tg?Math.max(0,Math.min(1,(g.cur-g.start)/(g.tg-g.start))):0;
    return '<button data-act="goal"><span class="ring">'+ringSvg(66,7,pct,g.c,"var(--track)")+'<span class="rl"><b class="n" style="font-size:15px;font-weight:800">'+(g.tg?Math.round(pct*100)+"%":"–")+'</b></span></span>'
      +'<span><span class="gn">'+g.n+'</span><br><span class="gv n">'+(g.cur==null?"–":g.cur+" "+g.u)+'</span></span></button>'}).join("")+'</div></section>'}
function renderProgView(){const v=$("#v-prog");
  const tiles=METRICS.map(m=>{const all=m.pts(),pts=recent(all,30),last=all[all.length-1];
    return '<button class="tile'+(m.wide?" wide":"")+'" data-act="metric" data-k="'+m.k+'"><span class="tl"><i style="background:'+m.c+'"></i>'+m.name+(m.sub?' · '+m.sub:'')+'</span>'
      +'<span class="tv">'+(last?last.y.toFixed(m.dec)+'<small>'+m.unit+'</small>':'–')+'</span>'+(last?deltaOf(m,all):'<span class="td muted">还没有数据</span>')
      +(pts.length>1?lineSvg(pts,m.wide?320:150,m.wide?64:44,m.c,"spark"):'')+'</button>'}).join("");
  v.innerHTML=goalsHtml()+'<div class="bento">'+tiles+'</div>';animateRings(v)}
let chartRange=30;
function metricSheet(k){const m=METRICS.find(x=>x.k===k),all=m.pts();
  const draw=()=>{const pts=recent(all,chartRange),last=all[all.length-1];
    $("#sheetBody").innerHTML='<div class="sh-h"><h3>'+m.name+'</h3><button class="mini" data-act="close">'+ICON.x+'</button></div>'
      +'<div class="row" style="margin-bottom:14px;align-items:flex-end"><div class="sp"><div class="big">'+(last?last.y.toFixed(m.dec):"–")+'<small>'+m.unit+'</small></div>'+(last?deltaOf(m,all):'')+'</div>'
      +'<div class="seg">'+[[14,"14天"],[30,"30天"],[90,"90天"],[0,"全部"]].map(([d,l])=>'<button data-act="range" data-r="'+d+'" aria-pressed="'+(chartRange===d)+'">'+l+'</button>').join("")+'</div></div>'
      +(pts.length>1?'<div class="chart" id="chart">'+lineSvg(pts,340,200,m.c,"",14)+'<span class="tip" id="ctip"></span></div>'
        +'<div class="row muted" style="font-size:11px;font-weight:600;margin-top:6px"><span>'+dayLabel(pts[0].date)+'</span><span class="sp"></span><span>'+dayLabel(pts[pts.length-1].date)+'</span></div>'
        +'<div class="row" style="margin-top:16px;gap:8px"><span class="pill">最低 '+Math.min(...pts.map(p=>p.y)).toFixed(m.dec)+'</span><span class="pill">最高 '+Math.max(...pts.map(p=>p.y)).toFixed(m.dec)+'</span><span class="pill">'+pts.length+' 个记录</span></div>'
        :'<p class="empty">这段时间不够两个记录</p>')
      +(m.rec?'<button class="btn ghost" style="margin-top:16px;height:46px;font-size:15px" data-act="go" data-to="'+m.rec+'">'+(m.rec==="sync"?ICON.sync+'从高驰同步':ICON.pen+'记一笔')+'</button>':'');
    const ch=$("#chart");if(ch)scrubber(ch,pts,m)};
  openSheet("");draw();metricSheet.redraw=draw}
function scrubber(el,pts,m){const tip=el.querySelector(".tip"),xs=pts.map(p=>p.x),x0=Math.min(...xs),x1=Math.max(...xs);
  const show=e=>{const r=el.getBoundingClientRect(),cx=(e.touches?e.touches[0].clientX:e.clientX)-r.left,fx=x0+(cx/r.width)*(x1-x0);
    let best=pts[0];pts.forEach(p=>{if(Math.abs(p.x-fx)<Math.abs(best.x-fx))best=p});
    tip.textContent=dayLabel(best.date)+'  '+best.y.toFixed(m.dec)+' '+m.unit;tip.style.left=Math.max(40,Math.min(r.width-40,(best.x-x0)/(x1-x0||1)*r.width))+"px";tip.classList.add("on")};
  el.addEventListener("pointerdown",show);el.addEventListener("pointermove",e=>{if(e.buttons||e.pointerType==="touch")show(e)});
  el.addEventListener("pointerup",()=>setTimeout(()=>tip.classList.remove("on"),1200))}

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
  openSheet('<div class="sh-h"><h3>设定</h3><button class="mini" data-act="close">'+ICON.x+'</button></div><p class="eyebrow" style="margin-bottom:8px">外观</p>'
    +'<div class="setlist">'+[["auto","跟随手机"],["light","亮"],["dark","暗"]].map(([k,l])=>'<button class="opt" data-act="mode" data-m="'+k+'" aria-pressed="'+(m===k)+'">'+l+'</button>').join("")
    +'<button class="opt" data-act="classic">'+ICON.swatch+'<span class="sp">经典界面<br><span class="muted" style="font-size:12px;font-weight:500">原来的样子和 29 套主题</span></span>'+ICON.right+'</button></div>'
    +'<p class="eyebrow" style="margin:18px 0 8px">更多</p><div class="setlist">'
    +row("fold:foldMe",ICON.user,"个人资料")+row("goals",ICON.target,"目标")+row("fold:foldBk",ICON.cloud,"备份进度与高驰")+row("fold:foldDietSrc",ICON.table,"饮食表格")+row("fold:foldSync",ICON.sliders,"图表、同步和手表热量")+'</div>'
    +'<p class="muted" style="font-size:11px;text-align:center;margin-top:18px">推拉机 '+($("#ver")?$("#ver").textContent:"")+' · 「更多」里的设定暂时在经典界面里改</p>')}

/* ---------- header, dock, routing ---------- */
function paintHeader(v){const d=new Date();$("#today").textContent=(d.getMonth()+1)+"月"+d.getDate()+"日 周"+WD[d.getDay()];
  $("#title").textContent={train:"训练",diet:"饮食",prog:"进展"}[v];
  let ls="";try{ls=localStorage.getItem("tracktor-lastsync")||""}catch(e){}$("#syncDot").classList.toggle("ok",ls.startsWith(today()))}
function placePc(anim){const b=document.querySelector('.dock [aria-selected="true"]'),pc=document.querySelector(".dock .pc");if(!b)return;
  if(!anim)pc.style.transition="none";pc.style.width=b.offsetWidth+"px";pc.style.transform="translateX("+(b.offsetLeft-6)+"px)";pc.style.left="6px";if(!anim){void pc.offsetWidth;pc.style.transition=""}}
function show(v,anim){document.querySelectorAll(".view").forEach(x=>x.classList.toggle("on",x.id==="v-"+v));
  document.querySelectorAll(".dock button").forEach(b=>b.setAttribute("aria-selected",b.dataset.v===v));
  ({train:renderTrainView,diet:renderDietView,prog:renderProgView})[v]();paintHeader(v);requestAnimationFrame(()=>placePc(anim));
  try{localStorage.setItem(PK+"tab",v)}catch(e){}scrollTo({top:0})}
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
  else if(a==="close")closeSheet();
  else if(a==="day")daySheet(b.dataset.d);
  else if(a==="metric"){chartRange=30;metricSheet(b.dataset.k)}
  else if(a==="range"){chartRange=+b.dataset.r;metricSheet.redraw()}
  else if(a==="goal")bridge("goals");
  else if(a==="go")bridge(b.dataset.to);
  else if(a==="classic"){try{localStorage.setItem("tracktor-ui","classic")}catch(err){}location.href="classic.html"}
  else if(a==="mode"){try{localStorage.setItem(PK+"mode",b.dataset.m)}catch(err){}applyMode();meSheet()}
  else if(run){
    if(a==="fclose"){if(!run.finished&&run.sets.some(x=>x.some(y=>y.d)))toast("打过的勾都已保存，下次接着练");closeRun()}
    else if(a==="untick")untick(+b.dataset.i);
    else if(a==="tick")tickSet();
    else if(a==="timer"){if(run.timing)stopTimer();else startTimer()}
    else if(a==="inc"||a==="dec"){const ci=curSet();if(ci<0)return;const s=run.sets[run.ex][ci],st=run.p.ex[run.ex].unit==="秒"?5:1;s.v=Math.max(0,(+s.v||0)+(a==="inc"?st:-st));
      run.sets[run.ex].forEach((x,i)=>{if(i>ci&&!x.d)x.v=s.v});lsSave();SFX.tap();const el=$("#fVal");el.textContent=s.v;el.classList.remove("pop");void el.offsetWidth;el.classList.add("pop");
      document.querySelectorAll(".f-sets i").forEach((x,i)=>{if(i>ci&&!run.sets[run.ex][i].d)x.textContent=i+1})}
    else if(a==="rplus"){run.rest+=30;run.restMax=Math.max(run.restMax,run.rest)}
    else if(a==="rskip"){run.rest=0;clearInterval(restT);renderFocus(true)}
    else if(a==="fnext"){const n=run.sets.findIndex(x=>x.some(y=>!y.d));if(n>=0){run.ex=n;renderFocus(true)}}
  }});

if("serviceWorker" in navigator)addEventListener("load",()=>navigator.serviceWorker.register("./sw.js").catch(()=>{}));
let start="train";try{start=localStorage.getItem(PK+"tab")||"train"}catch(e){}
if(!["train","diet","prog"].includes(start))start="train";
show(start,false);
