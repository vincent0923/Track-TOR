/* 推拉机 P2「赛段」: the fun redesign prototype. The plan is a 40-stage race (push = sprint stage, pull = mountain
   stage); reps climb metres, back-to-back sets build a combo, jerseys and mountains are the long game.
   Reads the real records through ../proto/data.js and writes nothing back. */
(function(){
const $=s=>document.querySelector(s);
const WD=["日","一","二","三","四","五","六"];
const fmt=v=>v==null?"–":Math.round(v).toLocaleString("en-US");
const dateObj=s=>{const [y,m,d]=s.split("-").map(Number);return new Date(y,m-1,d)};
const ymd=d=>d.getFullYear()+"-"+pad(d.getMonth()+1)+"-"+pad(d.getDate());
const dayDiff=(a,b)=>Math.round((dateObj(b)-dateObj(a))/864e5);
const dayLabel=s=>{const t=today();if(s===t)return "今天";if(s===ymdAdd(t,-1))return "昨天";const d=dateObj(s);return (d.getMonth()+1)+"."+d.getDate()};
const reduced=()=>matchMedia("(prefers-reduced-motion: reduce)").matches;
const IC={
  x:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><path d="M6 6l12 12M18 6 6 18"/></svg>',
  check:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>',
  play:'<svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5.5v13a1 1 0 0 0 1.5.86l10.5-6.5a1 1 0 0 0 0-1.72L9.5 4.64A1 1 0 0 0 8 5.5z"/></svg>',
  arrow:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>',
  flame:'<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2c1 4-3 5-3 9a3 3 0 0 0 6 0c0-1-.5-2-1-3 3 1 5 4 5 7a7 7 0 0 1-14 0c0-6 6-8 7-13z"/></svg>',
  peak:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linejoin="round"><path d="M2 20 9 7l4 6 3-4 6 11z"/></svg>'};
let toastT=0;
function toast(t){const el=$("#toast");el.textContent=t;el.classList.add("on");clearTimeout(toastT);toastT=setTimeout(()=>el.classList.remove("on"),2400)}

/* ---------- the race maths ---------- */
/* metres climbed by one set: a pull-up lifts you most, negatives next, rows a little; holds count by the second */
const PER_REP={pullup:10,ecc:6,row:2,diamond:1.5,decline:1.2};
function setClimb(e,v){v=+v||0;if(e.unit==="秒")return Math.round(v*(e.id==="hang"?.3:.12));if(e.unit==="分钟")return Math.round(v*4);return Math.round(v*(PER_REP[e.id]||1))}
function planClimb(p){return p.ex.reduce((a,e)=>a+setClimb(e,e.target)*e.sets,0)}
function totalClimb(){let m=0;
  Object.entries(state.sessions).forEach(([sid,s])=>{const p=BYID[sid];if(!s||!p)return;
    Object.entries(s.sets||{}).forEach(([id,a])=>{const e=p.ex.find(x=>x.id===id);if(e)a.forEach(x=>{if(x.d)m+=setClimb(e,x.v)})});
    (s.xs||[]).forEach(it=>it.sets.forEach(x=>{if(x.d)m+=it.id==="pullup"?(+x.v||0)*10:(+x.v||0)}))});
  Object.values(state.dayx||{}).forEach(d=>(d&&d.xs||[]).forEach(it=>it.sets.forEach(x=>{if(x.d)m+=it.id==="pullup"?(+x.v||0)*10:(+x.v||0)})));
  return m}
const MOUNTAINS=[["香山",575],["泰山",1545],["黄山",1864],["富士山",3776],["勃朗峰",4808],["乞力马扎罗",5895],["珠峰",8849]];
function mountainOf(m){const done=MOUNTAINS.filter(x=>x[1]<=m);let next=MOUNTAINS.find(x=>x[1]>m);
  if(!next){const k=Math.floor(m/8849)+1;next=["珠峰 ×"+k,8849*k]}
  const prev=done.length?done[done.length-1][1]:0;return {done,next,prev}}
function trainDates(){return Object.keys(dayMarks()).sort()}
function streakNow(){const ds=trainDates();if(!ds.length)return 0;let i=ds.length-1;if(dayDiff(ds[i],today())>2)return 0;
  let n=1;while(i>0&&dayDiff(ds[i-1],ds[i])<=2){n++;i--}return n}
function streakBest(){const ds=trainDates();let best=0,n=0;ds.forEach((d,i)=>{n=i&&dayDiff(ds[i-1],d)<=2?n+1:1;best=Math.max(best,n)});return best}
function doneList(){return PROGRAM.filter(p=>state.sessions[p.sid]&&state.sessions[p.sid].done)}
function pullBest(){const s=pullSeries();return s.length?Math.max(...s.map(x=>x.y)):0}
function jerseys(){const d=doneList().length,pb=pullBest(),pt=+state.settings.p||5,sb=streakBest();
  return [
    {k:"yellow",name:"黄衫",role:"领骑",v:d,goal:20,txt:"完成 20 个赛段（半程）",unit:"段"},
    {k:"polka",name:"圆点衫",role:"爬坡王",v:pb,goal:pt,txt:"引体单组做到 "+pt+" 个",unit:"个"},
    {k:"green",name:"绿衫",role:"积分王",v:sb,goal:7,txt:"连胜 7 场：两次训练之间不超过 2 天",unit:"场"},
    {k:"white",name:"白衫",role:"最佳新人",v:d,goal:10,txt:"完成前 10 个赛段",unit:"段"}].map(j=>Object.assign(j,{got:j.v>=j.goal}))}
function jerseySvg(k){const body='M16 6 8 10l-6 9 7 5 4-5v25h30V19l4 5 7-5-6-9-8-4c-2 4-6 6-10 6s-8-2-10-6z';
  const fill={yellow:"#FFD21F",green:"#17A864",white:"#FFFFFF",polka:"url(#pk)"}[k];
  return '<svg viewBox="0 0 66 56"><defs><pattern id="pk" width="9" height="9" patternUnits="userSpaceOnUse"><rect width="9" height="9" fill="#fff"/><circle cx="4.5" cy="4.5" r="2.4" fill="#EF3B2D"/></pattern></defs>'
    +'<path d="'+body+'" fill="'+fill+'" stroke="#16130F" stroke-width="2.4" stroke-linejoin="round"/>'
    +'<path d="M24 6c2 3 5 4 9 4s7-1 9-4" fill="none" stroke="#16130F" stroke-width="2.4" stroke-linecap="round"/></svg>'}

/* ---------- the route: all 40 stages as one elevation profile ---------- */
function smooth(P){let d="M"+P[0][0]+" "+P[0][1];for(let i=0;i<P.length-1;i++){const p0=P[Math.max(0,i-1)],p1=P[i],p2=P[i+1],p3=P[Math.min(P.length-1,i+2)];
  d+="C"+(p1[0]+(p2[0]-p0[0])/6).toFixed(1)+" "+(p1[1]+(p2[1]-p0[1])/6).toFixed(1)+" "+(p2[0]-(p3[0]-p1[0])/6).toFixed(1)+" "+(p2[1]-(p3[1]-p1[1])/6).toFixed(1)+" "+p2[0].toFixed(1)+" "+p2[1].toFixed(1)}return d}
function routeSvg(){const SW=26,H=120,base=96,W=PROGRAM.length*SW+40,mx=Math.max(...PROGRAM.map(planClimb));
  const pts=[[0,base-6]];PROGRAM.forEach((p,i)=>{const x=20+i*SW,h=p.kind==="pull"?18+planClimb(p)/mx*62:8+(i%4)*3;pts.push([x,base-4-(i%3)*2],[x+SW/2,base-h])});pts.push([W,base-6]);
  const line=smooth(pts),area=line+"L"+W+" "+H+"L0 "+H+"Z",cur=firstOpen(),ci=cur?PROGRAM.indexOf(cur):PROGRAM.length-1;
  let fills="";PROGRAM.forEach((p,i)=>{const s=state.sessions[p.sid];if(s&&s.done)fills+='<rect x="'+(20+i*SW-SW/2+SW/2-2)+'" y="0" width="'+(SW)+'" height="'+H+'" fill="'+(p.kind==="pull"?"url(#rpk)":"#17A864")+'"/>'});
  let ticks="";PROGRAM.forEach((p,i)=>{if((i+1)%5===0||i===0)ticks+='<text x="'+(20+i*SW+SW/2)+'" y="'+(H-6)+'" text-anchor="middle" font-family="Barlow Condensed" font-weight="700" font-size="12" fill="#6E665B">'+(i+1)+'</text>'});
  const rx=20+ci*SW+SW/2,ry=pts[1+ci*2+1][1];
  return '<svg width="'+W+'" height="'+H+'" viewBox="0 0 '+W+' '+H+'"><defs><clipPath id="rc"><path d="'+area+'"/></clipPath>'
    +'<pattern id="rpk" width="7" height="7" patternUnits="userSpaceOnUse"><rect width="7" height="7" fill="#fff"/><circle cx="3.5" cy="3.5" r="2" fill="#EF3B2D"/></pattern></defs>'
    +'<path d="'+area+'" fill="#ECE6DA"/><g clip-path="url(#rc)">'+fills+'</g><path d="'+line+'" fill="none" stroke="#16130F" stroke-width="2.4" stroke-linejoin="round"/>'
    +'<line x1="0" y1="'+(H-20)+'" x2="'+W+'" y2="'+(H-20)+'" stroke="#16130F" stroke-width="2"/>'+ticks
    +'<g transform="translate('+(W-14)+' '+(H-48)+')"><line x1="0" y1="0" x2="0" y2="28" stroke="#16130F" stroke-width="2"/><rect x="0" y="0" width="12" height="9" fill="url(#chk)"/><defs><pattern id="chk" width="6" height="6" patternUnits="userSpaceOnUse"><rect width="3" height="3" fill="#16130F"/><rect x="3" y="3" width="3" height="3" fill="#16130F"/></pattern></defs><rect x="0" y="0" width="12" height="9" fill="none" stroke="#16130F" stroke-width="1"/></g>'
    +'<circle class="rider-halo" cx="'+rx+'" cy="'+(ry-10)+'" r="10" fill="#FFD21F"/><circle cx="'+rx+'" cy="'+(ry-10)+'" r="8" fill="#FFD21F" stroke="#16130F" stroke-width="2.4"/>'
    +'<text x="'+rx+'" y="'+(ry-30)+'" text-anchor="middle" font-family="Barlow Condensed" font-weight="700" font-style="italic" font-size="15" fill="#16130F">你</text></svg>'}

/* ---------- race tab ---------- */
let heroSid=null;
function bibHtml(){const nx=firstOpen();
  if(!nx)return '<section class="card" style="text-align:center"><p class="kicker">全程 40 赛段</p><div class="big">完赛！</div></section>';
  const p=BYID[heroSid&&!(state.sessions[heroSid]&&state.sessions[heroSid].done)?heroSid:nx.sid],no=PROGRAM.indexOf(p)+1,sets=setsOf(p.sid),climb=p.kind==="pull";
  const dn=sets.reduce((a,x)=>a+x.filter(y=>y.d).length,0),other=nextOf(p.kind==="push"?"pull":"push");
  return '<section class="bib"><i class="pin"></i><i class="pin"></i><i class="pin"></i><i class="pin"></i>'
    +'<div class="bib-h"><span>赛段 '+no+' / 40</span><span class="tag '+(climb?"climb":"sprint")+'">'+(climb?"山地":"冲刺")+'</span></div>'
    +'<div class="bib-no">'+no+'</div><p class="bib-name">'+LAB(p)+'</p><div class="bib-band '+(climb?"climb":"sprint")+'"></div>'
    +'<div class="via">'+p.ex.map((e,i)=>'<span class="'+(sets[i].every(x=>x.d)?"dn":"")+'">'+NS(e)+' '+e.sets+'×'+e.target+'</span>').join("")+'</div>'
    +'<div class="row" style="margin-bottom:14px;justify-content:center;gap:18px"><span class="n it" style="font-size:22px;font-weight:700">+'+planClimb(p)+' m</span><span class="soft" style="font-size:12px;font-weight:700">预计爬升 · 约 '+Math.round(p.ex.reduce((a,e)=>a+e.sets,0)*1.6)+' 分钟</span></div>'
    +'<button class="go" data-act="start" data-sid="'+p.sid+'">'+(dn?'继续比赛':'出发')+IC.arrow+'</button>'
    +(other&&other.sid!==p.sid?'<button class="alt" data-act="swap" data-sid="'+other.sid+'">今天想跑'+(other.kind==="pull"?"山地":"冲刺")+'？换成 '+LAB(other)+'</button>':'')+'</section>'}
function routeHtml(){const d=doneList().length;return '<section class="card" style="padding-bottom:8px"><div class="row"><span class="kicker sp">全程路线 · '+d+' / 40</span><span class="tag y">'+Math.round(d/40*100)+'%</span></div><div class="route" id="route">'+routeSvg()+'</div></section>'}
function mountainHtml(){const m=totalClimb(),{done,next,prev}=mountainOf(m),pct=Math.min(1,(m-prev)/(next[1]-prev));
  const fillY=86-pct*72;
  return '<section class="card mtn press" data-act="mtn"><div class="row"><div class="sp"><p class="kicker">累计爬升</p><div class="big">'+fmt(m)+'<small>m</small></div></div>'
    +'<div style="text-align:right"><p class="kicker">下一座</p><div class="n it" style="font-size:24px;font-weight:700">'+next[0]+'</div><p class="soft n" style="font-size:14px;font-weight:600">还差 '+fmt(next[1]-m)+' m</p></div></div>'
    +'<svg viewBox="0 0 320 86" preserveAspectRatio="none"><defs><clipPath id="mc"><path d="M0 86 70 40 105 58 170 8 230 50 262 34 320 86z"/></clipPath></defs>'
    +'<path d="M0 86 70 40 105 58 170 8 230 50 262 34 320 86z" fill="#ECE6DA"/><rect clip-path="url(#mc)" x="0" y="'+fillY+'" width="320" height="86" fill="#FFD21F"><animate attributeName="y" from="86" to="'+fillY+'" dur="1.2s" fill="freeze" calcMode="spline" keySplines=".22 1 .36 1"/></rect>'
    +'<path d="M150 22 170 8 190 26 180 22 170 28 160 22z" fill="#fff" stroke="#16130F" stroke-width="1.5" stroke-linejoin="round"/>'
    +'<path d="M0 86 70 40 105 58 170 8 230 50 262 34 320 86" fill="none" stroke="#16130F" stroke-width="2.4" stroke-linejoin="round"/></svg>'
    +'<div class="row soft" style="font-size:12px;font-weight:700;margin-top:4px"><span class="sp">'+(done.length?'已登顶 '+done.map(x=>x[0]).join(" · "):'第一座：'+MOUNTAINS[0][0]+' '+MOUNTAINS[0][1]+' m')+'</span></div></section>'}
function jerseyHtml(){return '<section class="card"><p class="kicker" style="margin-bottom:10px">领奖衫</p><div class="jerseys">'+jerseys().map(j=>
  '<button class="jersey'+(j.got?"":" locked")+'" data-act="jersey" data-k="'+j.k+'">'+jerseySvg(j.k)+'<b>'+j.name+'</b><small>'+(j.got?"已穿上":Math.min(j.v,j.goal)+" / "+j.goal)+'</small></button>').join("")+'</div></section>'}
function weekHtml(){const marks=dayMarks(),now=new Date(),k=(now.getDay()+6)%7,ws=new Date(now);ws.setDate(now.getDate()-k);let h="",n=0;
  for(let i=0;i<7;i++){const d=new Date(ws);d.setDate(ws.getDate()+i);const s=ymd(d),mk=marks[s],t=today();if(mk)n++;
    const c=mk?(mk.has("push")&&mk.has("pull")?"pull":mk.has("pull")?"pull":mk.has("push")?"push":"x"):"";
    h+='<div><span>'+["一","二","三","四","五","六","日"][i]+'</span><i class="'+c+(s===t?" today":"")+(s>t?" fut":"")+'">'+d.getDate()+'</i></div>'}
  return '<section class="card"><div class="row" style="margin-bottom:10px"><span class="kicker sp">本周出赛</span><span class="n it" style="font-size:20px;font-weight:700">'+n+' 天</span></div><div class="week">'+h+'</div></section>'}
function renderRace(){const v=$("#v-race");v.innerHTML=bibHtml()+routeHtml()+weekHtml()+mountainHtml()+jerseyHtml();
  const r=$("#route"),cur=firstOpen();if(r&&cur)r.scrollLeft=Math.max(0,PROGRAM.indexOf(cur)*26-r.clientWidth/2+40)}

/* ---------- race mode ---------- */
let run=null,restT=0,timerT=0,clockT=0;
const restOf=e=>e.id==="pullup"?150:(e.id==="hang"||e.id==="ecc")?90:e.unit==="分钟"?0:60;
const GRACE=45;
function note(f,at,dur,vol){tone(f,at,dur,"triangle",vol||.2);tone(f*2,at,dur*.6,"sine",(vol||.2)*.25)}
const FX={
  tick:c=>{const f=523*Math.pow(2,Math.min(c-1,14)/12);note(f,0,.12);note(f*1.5,.07,.18,.16)},
  ex:()=>{[523,659,784,1047,1319].forEach((f,i)=>note(f,i*.06,.2,.18))},
  rest:()=>{tone(988,0,.1,"square",.08);tone(988,.16,.1,"square",.08);tone(1319,.32,.25,"square",.08)},
  win:()=>{[392,523,659,784,1047].forEach((f,i)=>note(f,i*.1,.35,.2));[1047,1319,1568].forEach((f,i)=>note(f,.6+i*.04,.8,.14))},
  tap:()=>tone(1200,0,.035,"sine",.07),
  brk:()=>tone(330,0,.25,"sawtooth",.06,180)};
function startRun(sid){const p=BYID[sid];run={sid,p,no:PROGRAM.indexOf(p)+1,sets:setsOf(sid),ex:0,t0:Date.now(),rest:0,combo:0,maxCombo:0,gain:0,lastAt:0,lastRest:0,before:totalClimb()};
  run.ex=Math.max(0,run.sets.findIndex(a=>a.some(x=>!x.d)));
  const r=$("#race");r.classList.add("on");r.setAttribute("aria-hidden","false");document.body.style.overflow="hidden";
  clearInterval(clockT);clockT=setInterval(()=>{const el=$("#rTime");if(el&&run){const s=Math.floor((Date.now()-run.t0)/1000);el.textContent=Math.floor(s/60)+":"+pad(s%60)}},1000);
  renderRun()}
function closeRun(){clearInterval(clockT);clearInterval(restT);clearInterval(timerT);const r=$("#race");r.classList.remove("on");r.setAttribute("aria-hidden","true");document.body.style.overflow="";run=null;renderAll()}
const curSet=()=>run.sets[run.ex].findIndex(x=>!x.d);
function stageProfile(){const tot=run.sets.reduce((a,x)=>a+x.length,0),dn=run.sets.reduce((a,x)=>a+x.filter(y=>y.d).length,0),f=tot?dn/tot:0,W=340,H=58,climb=run.p.kind==="pull";
  const P=[];for(let i=0;i<=12;i++){const x=i/12*W,y=climb?H-8-Math.pow(Math.sin(i/12*Math.PI*.95),1.4)*40-(i%2)*3:H-12-Math.sin(i*1.3)*6-(i%3)*2;P.push([x,y])}
  const line=smooth(P),k=Math.min(12,Math.floor(f*12)),rx=f*W,ry=P[k][1]+(P[Math.min(12,k+1)][1]-P[k][1])*(f*12-k);
  return '<svg viewBox="0 0 '+W+' '+H+'" preserveAspectRatio="none"><defs><clipPath id="sc"><rect width="'+rx+'" height="'+H+'"/></clipPath></defs><path d="'+line+'L'+W+' '+H+'L0 '+H+'Z" fill="#ECE6DA"/>'
    +'<path clip-path="url(#sc)" d="'+line+'L'+W+' '+H+'L0 '+H+'Z" fill="'+(climb?"#EF3B2D":"#17A864")+'"/><path d="'+line+'" fill="none" stroke="#16130F" stroke-width="2"/>'
    +'<circle cx="'+Math.max(8,Math.min(W-8,rx))+'" cy="'+(ry-7)+'" r="7" fill="#FFD21F" stroke="#16130F" stroke-width="2"/></svg>'}
function renderRun(anim){
  const r=$("#race"),p=run.p,e=p.ex[run.ex],a=run.sets[run.ex],ci=curSet();
  if(run.sets.every(x=>x.every(y=>y.d))&&!run.finished){finishRun();return}
  const val=ci<0?a[a.length-1].v:a[ci].v,mult=1+Math.min(run.combo,10)*.1;
  let bottom;
  if(run.rest>0)bottom=feedHtml();
  else if(ci<0)bottom='<button class="pedal done" disabled>'+IC.check+'</button><button class="hint" data-act="rnext">这个动作完成 · 下一个 →</button>';
  else if(e.unit==="秒")bottom='<button class="pedal" data-act="timer" aria-label="计时">'+(run.timing?'<svg class="tr" viewBox="0 0 126 126"><circle cx="63" cy="63" r="58" id="tRing" stroke-dasharray="364.4" stroke-dashoffset="0"/></svg>'+IC.check:IC.play)+'</button><p class="hint">'+(run.timing?"撑住！提前结束也算":"点一下开始计时")+'</p>';
  else bottom='<button class="pedal" id="pedal" data-act="tick" aria-label="完成这一组">'+IC.check+'</button><p class="hint">'+(run.combo?'准时出发保持连击 · 左右滑换动作':'左右滑换动作')+'</p>';
  r.innerHTML='<div class="r-top"><button class="x" data-act="rclose" aria-label="退出">'+IC.x+'</button><div class="sp"><span class="kicker">赛段 '+run.no+' · '+(p.kind==="pull"?"山地":"冲刺")+'</span><br><span class="n it" style="font-size:22px;font-weight:700">+'+run.gain+' m</span></div><span class="n it" id="rTime" style="font-size:20px;font-weight:700;min-width:44px;text-align:right">0:00</span></div>'
    +'<div class="r-prof">'+stageProfile()+'</div>'
    +'<div class="r-body" id="rBody">'+(run.combo>1?'<span class="combo'+(anim==="tick"?" bump":"")+'">连击 ×'+run.combo+'</span>':'')
    +'<p class="kicker">动作 '+(run.ex+1)+' / '+p.ex.length+(ci>=0&&!run.timing?' · 本组 +'+Math.round(setClimb(e,val)*mult)+' m':'')+'</p><h2>'+N(e)+'</h2><p class="r-note">'+(e.note?NOTE(e):"")+'</p>'
    +'<div class="r-sets">'+a.map((x,i)=>'<i class="'+(x.d?"dn":i===ci?"cur":"")+'">'+(x.d?x.v:i+1)+'</i>').join("")+'</div>'
    +'<div class="r-num">'+(ci<0||run.timing?'<span style="width:48px"></span>':'<button class="x" data-act="dec" aria-label="减一">−</button>')
    +'<b class="'+(anim?"pop":"")+'" id="rVal">'+(run.timing?run.left:val)+'</b>'+(ci<0||run.timing?'<span style="width:48px"></span>':'<button class="x" data-act="inc" aria-label="加一">+</button>')+'</div>'
    +'<p class="r-unit">'+U(e.unit)+(ci<0?' · '+a.length+' 组全部完成':' · 第 '+(ci+1)+' / '+a.length+' 组')+'</p></div>'
    +'<div class="r-bottom">'+bottom+'</div>';
  const s=Math.floor((Date.now()-run.t0)/1000);$("#rTime").textContent=Math.floor(s/60)+":"+pad(s%60);swipe($("#rBody"))}
function feedHtml(){const f=run.rest/run.restMax;
  return '<div class="feed"><svg width="54" height="92" viewBox="0 0 54 92"><defs><clipPath id="bc"><path d="M12 22h30v62a6 6 0 0 1-6 6H18a6 6 0 0 1-6-6z"/></clipPath></defs>'
    +'<rect clip-path="url(#bc)" id="bWater" x="0" y="'+(22+(1-f)*68)+'" width="54" height="70" fill="#2D6CF6" style="transition:y 1s linear"/>'
    +'<path d="M12 22h30v62a6 6 0 0 1-6 6H18a6 6 0 0 1-6-6z" fill="none" stroke="#16130F" stroke-width="2.4"/><path d="M18 22v-8h18v8M22 14V6h10v8" fill="none" stroke="#16130F" stroke-width="2.4" stroke-linejoin="round"/><path d="M12 46h30" stroke="#16130F" stroke-width="2"/></svg>'
    +'<div><p class="kicker">补给站</p><div class="big n" id="rLeft">'+Math.floor(run.rest/60)+':'+pad(run.rest%60)+'</div>'
    +'<div class="row" style="margin-top:8px"><button data-act="rplus">+30</button><button class="y" data-act="rskip">出发</button></div></div></div>'}
function floaty(txt,el){const r=el.getBoundingClientRect(),f=document.createElement("div");f.className="floaty";f.textContent=txt;f.style.left=(r.left+r.width/2)+"px";f.style.top=(r.top-10)+"px";document.body.appendChild(f);setTimeout(()=>f.remove(),1200)}
function shake(){if(reduced())return;const r=$("#race");r.classList.remove("shake");void r.offsetWidth;r.classList.add("shake")}
function banner(t){const b=$("#banner");b.textContent=t;b.classList.remove("go");void b.offsetWidth;b.classList.add("go")}
function burst(big){if(!window.confetti||reduced())return;const c=["#FFD21F","#EF3B2D","#17A864","#FFFFFF","#16130F"];
  if(big)[0,300,600].forEach(t=>setTimeout(()=>{confetti({particleCount:80,angle:60,spread:65,origin:{x:0,y:.85},colors:c,shapes:["square"],zIndex:70});confetti({particleCount:80,angle:120,spread:65,origin:{x:1,y:.85},colors:c,shapes:["square"],zIndex:70})},t));
  else confetti({particleCount:50,spread:70,startVelocity:34,origin:{y:.7},colors:c,shapes:["square"],zIndex:70})}
function tickSet(v){const a=run.sets[run.ex],ci=curSet(),e=run.p.ex[run.ex];if(ci<0)return;
  const now=Date.now();
  /* the combo survives if this tick comes within the rest + about 90 s for the set itself + a 45 s grace */
  if(run.lastAt&&now-run.lastAt>(run.lastRest+GRACE)*1000+90000){if(run.combo>1){FX.brk();toast("节奏断了，连击重新算")}run.combo=0}
  run.combo++;run.maxCombo=Math.max(run.maxCombo,run.combo);
  a[ci].d=true;if(v!=null)a[ci].v=v;
  const gain=Math.round(setClimb(e,a[ci].v)*(1+Math.min(run.combo-1,10)*.1));run.gain+=gain;
  const btn=$("#pedal")||$(".pedal");if(btn)floaty("+"+gain+" m",btn);
  FX.tick(run.combo);try{navigator.vibrate&&navigator.vibrate(run.combo>2?[14,30,14]:16)}catch(err){}shake();
  run.lastAt=now;
  if(a.every(x=>x.d)){setTimeout(()=>{FX.ex();banner(e.id==="pullup"?"山顶冲刺！":"过点！");burst(false)},250);
    const nx=run.sets.findIndex(x=>x.some(y=>!y.d));if(nx<0){renderRun("tick");return}
    run.lastRest=0;setTimeout(()=>{if(!run)return;run.ex=nx;renderRun(true)},1300);renderRun("tick");return}
  const r=restOf(e);run.lastRest=r;
  if(r){run.rest=r;run.restMax=r;renderRun("tick");clearInterval(restT);restT=setInterval(()=>{if(!run){clearInterval(restT);return}run.rest--;
    if(run.rest<=0){clearInterval(restT);run.rest=0;FX.rest();try{navigator.vibrate&&navigator.vibrate([60,60,60])}catch(err){}renderRun(true);return}
    const l=$("#rLeft"),w=$("#bWater");if(l)l.textContent=Math.floor(run.rest/60)+":"+pad(run.rest%60);if(w)w.setAttribute("y",22+(1-run.rest/run.restMax)*68)},1000)}
  else renderRun("tick")}
function startTimer(){const e=run.p.ex[run.ex],a=run.sets[run.ex],ci=curSet(),tot=+a[ci].v||e.target;run.timing=1;run.left=tot;run.tot=tot;renderRun();
  clearInterval(timerT);timerT=setInterval(()=>{if(!run){clearInterval(timerT);return}run.left--;const v=$("#rVal"),r=$("#tRing");if(v)v.textContent=Math.max(0,run.left);if(r)r.style.strokeDashoffset=364.4*(1-run.left/run.tot);
    if(run.left<=3&&run.left>0)tone(880,0,.08,"square",.06);if(run.left<=0)stopTimer()},1000)}
function stopTimer(){clearInterval(timerT);const d=run.tot-Math.max(0,run.left);run.timing=0;tickSet(d)}
function finishRun(){run.finished=1;clearInterval(clockT);const p=run.p,secs=Math.floor((Date.now()-run.t0)/1000),before=run.before,after=before+run.gain;
  let pu=0;run.sets.forEach((a,i)=>a.forEach(x=>{if(x.d&&p.ex[i].id==="pullup")pu=Math.max(pu,x.v)}));const rec=pu&&pu>pullBest();
  const m0=mountainOf(before),m1=mountainOf(after),summit=m1.done.length>m0.done.length?m1.done[m1.done.length-1][0]:null,pct=Math.min(1,(after-m1.prev)/(m1.next[1]-m1.prev));
  setTimeout(()=>{FX.win();banner("冲线！");burst(true)},200);try{navigator.vibrate&&navigator.vibrate([30,60,30,60,120])}catch(e){}
  $("#race").innerHTML='<div class="r-top"><span class="sp"></span><button class="x" data-act="rclose" aria-label="关闭">'+IC.x+'</button></div><div class="checker" style="margin-top:10px"></div>'
    +'<div class="result"><p class="kicker">赛段 '+run.no+' · '+LAB(p)+'</p><div class="big">+'+run.gain+'<small>m</small></div>'
    +(rec?'<span class="tag climb" style="height:30px;font-size:16px">新纪录 · 引体 '+pu+' 个</span>':'')
    +(summit?'<span class="tag y" style="height:30px;font-size:16px">登顶 '+summit+'！</span>':'')
    +'<div class="rgrid"><div><b>'+run.gain+'</b><span>爬升 m</span></div><div><b>×'+run.maxCombo+'</b><span>最高连击</span></div><div><b>'+Math.max(1,Math.round(secs/60))+'</b><span>分钟</span></div></div>'
    +'<div style="width:100%;text-align:left"><div class="row"><span class="kicker sp">距离 '+m1.next[0]+'</span><span class="n it" style="font-size:18px;font-weight:700">'+fmt(after)+' / '+fmt(m1.next[1])+' m</span></div>'
    +'<div class="track"><i id="fTrack" style="width:'+Math.min(100,(before-m1.prev)/(m1.next[1]-m1.prev)*100)+'%"></i></div></div></div>'
    +'<div class="r-bottom" style="min-height:0"><button class="go" data-act="rclose">收工</button><p class="hint">原型不记录 · 这次没有写进推拉机</p></div>';
  setTimeout(()=>{const t=$("#fTrack");if(t)t.style.width=(pct*100)+"%"},400)}
function swipe(el){let x0=null,y0=0;el.addEventListener("touchstart",e=>{x0=e.touches[0].clientX;y0=e.touches[0].clientY},{passive:true});
  el.addEventListener("touchend",e=>{if(x0==null||!run||run.timing)return;const dx=e.changedTouches[0].clientX-x0,dy=e.changedTouches[0].clientY-y0;x0=null;
    if(Math.abs(dx)<50||Math.abs(dy)>Math.abs(dx))return;const n=run.ex+(dx<0?1:-1);if(n<0||n>=run.p.ex.length)return;run.ex=n;run.rest=0;clearInterval(restT);FX.tap();renderRun(true)})}

/* ---------- fuel tab ---------- */
function flameSvg(h,c){return '<svg viewBox="0 0 24 30" style="height:'+h+'px" preserveAspectRatio="xMidYMax meet"><path d="M12 1c1.5 5-4 7-4 12a4 4 0 0 0 8 0c0-1.3-.6-2.6-1.3-4 4 1.4 6.3 5.3 6.3 9.2A9 9 0 0 1 3 18.2C3 10.6 10.7 7.6 12 1z" fill="'+c+'" stroke="#16130F" stroke-width="1.8" stroke-linejoin="round"/></svg>'}
function renderFuel(){const v=$("#v-fuel"),t=today(),tin=intakeOf(t),tb=burnOfDate(t),gap=tin!=null&&tb!=null?tb-tin:null,pr=proteinOf(t),need=proteinNeed(t),yg=dietGapOf(ymdAdd(t,-1));
  let head;
  if(gap!=null)head='<p class="kicker">今天'+(gap>=0?'燃掉':'多存了')+'</p><div class="big">'+fmt(Math.abs(gap)/7.7)+'<small>g 脂肪</small></div><p class="soft" style="font-size:12px;font-weight:700;margin-top:4px">'+(gap>=0?'缺口 ':'盈余 ')+fmt(Math.abs(gap))+' kcal</p>';
  else if(tin!=null)head='<p class="kicker">今天吃了</p><div class="big">'+fmt(tin)+'<small>kcal</small></div><p class="soft" style="font-size:12px;font-weight:700;margin-top:4px">消耗等手表同步'+(yg!=null?' · 昨天燃掉 '+fmt(yg/7.7)+' g':'')+'</p>';
  else head='<p class="kicker">今天</p><div class="big">还没补给</div><p class="soft" style="font-size:12px;font-weight:700;margin-top:4px">'+(yg!=null?'昨天燃掉 '+fmt(yg/7.7)+' g 脂肪':'去推拉机记一笔')+'</p>';
  const pp=pr!=null&&need?Math.min(1,pr/need):0,mx=Math.max(tin||0,tb||0,1);
  const card='<section class="card"><div class="row" style="align-items:flex-start"><div class="sp">'+head+'</div>'
    +'<div style="text-align:center"><div class="bidon"><svg viewBox="0 0 56 96"><defs><clipPath id="pc"><path d="M12 24h32v62a6 6 0 0 1-6 6H18a6 6 0 0 1-6-6z"/></clipPath></defs>'
    +'<rect clip-path="url(#pc)" x="0" y="'+(24+(1-pp)*68)+'" width="56" height="72" fill="#EF3B2D"><animate attributeName="y" from="92" to="'+(24+(1-pp)*68)+'" dur="1.2s" fill="freeze" calcMode="spline" keySplines=".22 1 .36 1"/></rect>'
    +'<path d="M12 24h32v62a6 6 0 0 1-6 6H18a6 6 0 0 1-6-6z" fill="none" stroke="#16130F" stroke-width="2.4"/><path d="M19 24v-8h18v8M23 16V8h10v8" fill="none" stroke="#16130F" stroke-width="2.4" stroke-linejoin="round"/></svg></div>'
    +'<p class="n it" style="font-size:18px;font-weight:700;margin-top:4px">'+(pr!=null?Math.round(pr):"–")+'<span class="soft" style="font-size:13px"> / '+Math.round(need)+' g</span></p><p class="kicker" style="font-size:11px">蛋白质</p></div></div>'
    +(tin!=null||tb!=null?'<div class="hp"><div><div class="lbl"><span>消耗</span><span>'+fmt(tb)+'</span></div><div class="bar"><i style="width:'+((tb||0)/mx*100)+'%;background:#EF3B2D"></i></div></div>'
      +'<div><div class="lbl"><span>摄入</span><span>'+fmt(tin)+'</span></div><div class="bar"><i style="width:'+((tin||0)/mx*100)+'%;background:#FFD21F"></i></div></div></div>':'')+'</section>';
  const days=[];for(let i=7;i>=1;i--)days.push(ymdAdd(t,-i));const gaps=days.map(dietGapOf),known=gaps.filter(g=>g!=null),sum=known.reduce((a,g)=>a+g,0),gm=Math.max(300,...known.map(Math.abs));
  const week='<section class="card"><div class="row"><div class="sp"><p class="kicker">上周燃脂</p><div class="big" style="font-size:40px">'+(known.length?fmt(Math.abs(sum)/7.7):"–")+'<small>g '+(sum>=0?"燃掉":"多存")+'</small></div></div>'
    +(known.length>=5&&gaps.every(g=>g!=null&&g>0)?'<span class="tag y">7 天全缺口</span>':'')+'</div>'
    +'<div class="flames">'+days.map((d,i)=>{const g=gaps[i];return '<div>'+(g==null?'<svg viewBox="0 0 24 30" style="height:16px"><circle cx="12" cy="24" r="4" fill="none" stroke="#6E665B" stroke-width="2" stroke-dasharray="3 3"/></svg>':flameSvg(18+Math.abs(g)/gm*58,g>=0?"#FFD21F":"#ECE6DA"))+'<span>'+WD[dateObj(d).getDay()]+'</span></div>'}).join("")+'</div></section>';
  const keys=Object.keys(state.diet).filter(d=>d<=t).sort().reverse().slice(0,14);
  const log='<section class="card"><p class="kicker" style="margin-bottom:4px">补给记录</p>'+(keys.length?'<div class="log">'+keys.map(d=>{const a=intakeOf(d),g=dietGapOf(d);
    return '<button data-act="day" data-d="'+d+'"><span class="d">'+dayLabel(d)+'</span><span class="k">'+(a!=null?fmt(a)+' kcal':'–')+'</span>'+(g!=null?'<span class="g" style="color:'+(g>=0?"var(--ink)":"var(--red)")+'">'+(g>=0?"−":"+")+fmt(Math.abs(g)/7.7)+' g</span>':'')+'</button>'}).join("")+'</div>':'<p class="soft" style="padding:12px 0">还没有饮食记录</p>')+'</section>';
  v.innerHTML=card+week+log}
function daySheet(d){const day=state.diet[d]||{},items=day.items||[],a=intakeOf(d),b=burnOfDate(d),g=dietGapOf(d),f=x=>x==null||x===""?"–":Math.round(+x);
  openSheet('<div class="sh-h"><h3>'+dayLabel(d)+'</h3><button class="x" data-act="close">'+IC.x+'</button></div>'
    +'<div class="rgrid" style="margin-bottom:14px"><div><b>'+fmt(a)+'</b><span>摄入</span></div><div><b>'+fmt(b)+'</b><span>消耗</span></div><div><b>'+(g==null?"–":fmt(Math.abs(g)/7.7))+'</b><span>'+(g==null||g>=0?"燃掉 g":"多存 g")+'</span></div></div>'
    +(items.length?'<div class="card" style="padding:6px 12px">'+items.map(it=>'<div class="row" style="padding:9px 0;border-top:2px dashed var(--rule)"><span class="sp" style="font-weight:700">'+escHtml(it.name||"")+'</span><span class="soft" style="font-size:12px">蛋白 '+f(it.p)+'</span><span class="n it" style="font-size:18px;font-weight:700;min-width:44px;text-align:right">'+f(it.kcal)+'</span></div>').join("")+'</div>':'<p class="soft">这天只记了总数</p>'))}

/* ---------- results tab ---------- */
const STATS=[
  {k:"wt",name:"体重",unit:"kg",up:0,pts:()=>avg7(wtMerged()),dec:1,sub:"7 日均"},
  {k:"waist",name:"腰围",unit:"cm",up:0,pts:()=>series("waist"),dec:1},
  {k:"rhr",name:"静息心率",unit:"bpm",up:0,pts:()=>series("rhr"),dec:0},
  {k:"hrv",name:"HRV",unit:"ms",up:1,pts:()=>series("hrv"),dec:0},
  {k:"sleep",name:"睡眠",unit:"分",up:1,pts:()=>series("sleep"),dec:0}];
function spark(pts,W,H,col,step){if(pts.length<2)return "";const xs=pts.map(p=>p.x),ys=pts.map(p=>p.y),x0=Math.min(...xs),x1=Math.max(...xs),lo=Math.min(...ys),hi=Math.max(...ys),sp=hi-lo||1;
  const P=pts.map(p=>[(p.x-x0)/(x1-x0||1)*W,3+(1-(p.y-lo)/sp)*(H-6)]);let d="M"+P[0][0].toFixed(1)+" "+P[0][1].toFixed(1);
  for(let i=1;i<P.length;i++)d+=step?"H"+P[i][0].toFixed(1)+"V"+P[i][1].toFixed(1):"L"+P[i][0].toFixed(1)+" "+P[i][1].toFixed(1);
  return '<svg viewBox="0 0 '+W+' '+H+'" preserveAspectRatio="none"><path d="'+d+'" fill="none" stroke="'+col+'" stroke-width="2.4" stroke-linejoin="round" vector-effect="non-scaling-stroke"/></svg>'}
function delta(m,pts){if(pts.length<2)return '<span class="dl soft">–</span>';const last=pts[pts.length-1];let ref=pts[0];for(const p of pts)if(p.x<=last.x-30)ref=p;const d=last.y-ref.y;
  if(Math.abs(d)<(m.dec?.05:.5))return '<span class="dl soft">30 天持平</span>';const good=(d>0)===!!m.up;
  return '<span class="dl" style="color:'+(good?"var(--green)":"var(--red)")+'">'+(d>0?"▲ ":"▼ ")+Math.abs(d).toFixed(m.dec)+' · 30 天</span>'}
function renderRes(){const v=$("#v-res"),st=state.settings,pu=pullSeries(),best=pullBest(),last=pu.length?pu[pu.length-1].y:null,wt=avg7(wtMerged()),wz=series("waist"),gap=gapAllTime();
  const kom='<section class="card kom"><div class="inner"><div class="sp"><p class="kicker">引体纪录 · 爬坡王</p><div class="big">'+(best||"–")+'<small>个</small></div>'
    +'<p class="soft" style="font-size:12px;font-weight:700">'+(last!=null?'现在 '+last+' 个':'还没测过')+(+st.p?' · 目标 '+st.p+' 个':'')+'</p></div>'
    +'<div style="width:42%;height:64px">'+spark(pu.slice(-20),140,64,"#EF3B2D",true)+'</div></div></section>';
  const G=[{n:"引体",c:"#EF3B2D",cur:last,start:0,tg:+st.p||null,u:"个"},{n:"腰围",c:"#17A864",cur:wz.length?wz[wz.length-1].y:null,start:wz.length?wz[0].y:null,tg:+st.z||null,u:"cm"},
    {n:"体重",c:"#2D6CF6",cur:wt.length?+wt[wt.length-1].y.toFixed(1):null,start:wt.length?+wt[0].y.toFixed(1):null,tg:+st.w||null,u:"kg"},{n:"减脂",c:"#FFD21F",cur:gap?+(gap.s/7700).toFixed(1):null,start:0,tg:+st.fat||null,u:"kg"}];
  const goals='<section class="card"><p class="kicker">终点线</p>'+G.map(g=>{const pct=g.tg&&g.cur!=null&&g.start!=null&&g.start!==g.tg?Math.max(0,Math.min(1,(g.cur-g.start)/(g.tg-g.start))):0;
    return '<div class="goal"><div class="gh"><b>'+g.n+'</b><span class="soft" style="font-size:12px;font-weight:700">'+(g.tg?(g.start??"–")+' → '+g.tg+' '+g.u:'没设目标')+'</span><span class="n">'+(g.cur==null?"–":g.cur+" "+g.u)+'</span></div>'
      +'<div class="finish"><div class="lane"><span class="who" data-left="'+(4+pct*88)+'" style="left:4%;background:'+g.c+'"></span>'
      +'<svg class="flag" viewBox="0 0 18 28"><line x1="1.5" y1="0" x2="1.5" y2="28" stroke="#16130F" stroke-width="2"/><rect x="2" y="1" width="14" height="10" fill="url(#gf)" stroke="#16130F" stroke-width="1.4"/><defs><pattern id="gf" width="7" height="5" patternUnits="userSpaceOnUse"><rect width="3.5" height="2.5" fill="#16130F"/><rect x="3.5" y="2.5" width="3.5" height="2.5" fill="#16130F"/></pattern></defs></svg></div></div></div>'}).join("")+'</section>';
  const stats='<p class="kicker" style="margin:4px 2px 10px">车手档案</p><div class="stats">'+STATS.map(m=>{const all=m.pts(),l=all[all.length-1];
    return '<button class="stat press" data-act="stat" data-k="'+m.k+'"><span class="kicker">'+m.name+(m.sub?' · '+m.sub:'')+'</span><span class="v">'+(l?l.y.toFixed(m.dec):"–")+'<small>'+m.unit+'</small></span>'+delta(m,all)+spark(all.slice(-30),150,30,"#16130F")+'</button>'}).join("")
    +'<button class="stat press" data-act="mtn"><span class="kicker">累计爬升</span><span class="v">'+fmt(totalClimb())+'<small>m</small></span><span class="dl soft">'+mountainOf(totalClimb()).done.length+' 座已登顶</span></button></div>';
  v.innerHTML=kom+goals+stats;
  requestAnimationFrame(()=>requestAnimationFrame(()=>v.querySelectorAll(".who").forEach(w=>w.style.left=w.dataset.left+"%")))}
let statRange=30;
function statSheet(k){const m=STATS.find(x=>x.k===k),all=m.pts();
  const draw=()=>{const t=dnum(today()),pts=statRange?all.filter(p=>p.x>t-statRange):all,l=all[all.length-1];
    $("#sheetBody").innerHTML='<div class="sh-h"><h3>'+m.name+'</h3><button class="x" data-act="close">'+IC.x+'</button></div>'
      +'<div class="row" style="align-items:flex-end;margin-bottom:12px"><div class="sp"><div class="big">'+(l?l.y.toFixed(m.dec):"–")+'<small>'+m.unit+'</small></div>'+delta(m,all)+'</div>'
      +'<div class="row" style="gap:6px">'+[[14,"14"],[30,"30"],[90,"90"],[0,"全部"]].map(([d,lb])=>'<button class="tag'+(statRange===d?" y":"")+'" style="height:30px;font-size:15px" data-act="srange" data-r="'+d+'">'+lb+'</button>').join("")+'</div></div>'
      +'<div class="card" style="padding:14px 12px">'+(pts.length>1?'<div style="height:180px">'+spark(pts,320,180,"#16130F").replace('stroke-width="2.4"','stroke-width="3"')+'</div><div class="row soft n" style="font-size:14px;font-weight:700;margin-top:6px"><span class="sp">'+dayLabel(pts[0].date)+'</span><span>'+dayLabel(pts[pts.length-1].date)+'</span></div>':'<p class="soft">这段时间不够两个记录</p>')+'</div>'};
  openSheet("");draw();statSheet.redraw=draw}

/* ---------- sheets ---------- */
function openSheet(h){$("#sheetBody").innerHTML=h;$("#sheet").classList.add("on");document.body.style.overflow="hidden"}
function closeSheet(){$("#sheet").classList.remove("on");if(!run)document.body.style.overflow=""}
$("#sheet").addEventListener("click",e=>{if(e.target.id==="sheet")closeSheet()});
(function(){const pn=$("#sheet .panel");let y0=null,dy=0;
  pn.addEventListener("touchstart",e=>{if(pn.scrollTop>0)return;y0=e.touches[0].clientY;dy=0},{passive:true});
  pn.addEventListener("touchmove",e=>{if(y0==null)return;dy=Math.max(0,e.touches[0].clientY-y0);pn.style.transition="none";pn.style.transform="translateY("+dy+"px)"},{passive:true});
  pn.addEventListener("touchend",()=>{if(y0==null)return;pn.style.transition="";pn.style.transform="";if(dy>90)closeSheet();y0=null})})();
function jerseySheet(k){const j=jerseys().find(x=>x.k===k),pct=Math.min(1,j.v/j.goal);
  openSheet('<div class="sh-h"><h3>'+j.name+' · '+j.role+'</h3><button class="x" data-act="close">'+IC.x+'</button></div>'
    +'<div style="display:grid;justify-items:center;margin:4px 0 14px"><div style="width:140px;'+(j.got?'':'filter:grayscale(1);opacity:.45')+'">'+jerseySvg(j.k)+'</div></div>'
    +'<p style="font-weight:700;font-size:15px;text-align:center">'+j.txt+'</p>'
    +'<div class="track" style="height:18px"><i style="width:'+(pct*100)+'%"></i></div><p class="n it" style="text-align:center;font-size:22px;font-weight:700;margin-top:8px">'+Math.min(j.v,j.goal)+' / '+j.goal+' '+j.unit+(j.got?' · 已穿上':'')+'</p>')}
function mountainSheet(){const m=totalClimb(),{next}=mountainOf(m);
  openSheet('<div class="sh-h"><h3>登山册</h3><button class="x" data-act="close">'+IC.x+'</button></div>'
    +'<p class="soft" style="font-size:13px;font-weight:600;margin-bottom:12px">每做一个引体爬 10 m，离心引体 6 m，反向划船 2 m，其余每个 1 m 左右，支撑和悬吊按秒算。连击越高，每组爬得越多（最多 +100%）。</p>'
    +'<div class="card" style="padding:4px 14px">'+MOUNTAINS.map(([n,h])=>{const got=m>=h;return '<div class="row" style="padding:11px 0;border-top:2px dashed var(--rule)"><span style="width:22px;color:'+(got?"var(--ink)":"#C9C1B2")+'">'+IC.peak+'</span><span class="sp" style="font-weight:800;'+(got?'':'color:var(--soft)')+'">'+n+'</span>'
      +'<span class="n it" style="font-size:20px;font-weight:700">'+fmt(h)+' m</span><span class="tag'+(got?" y":"")+'" style="min-width:56px;justify-content:center">'+(got?"登顶":n===next[0]?Math.round(m/h*100)+"%":"—")+'</span></div>'}).join("")+'</div>')}

/* ---------- header, dock ---------- */
function paintHeader(v){$("#title").textContent={race:"赛段",fuel:"补给",res:"战绩"}[v];const s=streakNow();
  $("#streakChip").innerHTML=IC.flame+'<span>'+s+'</span>';$("#streakChip").className="chip"+(s?" fire":" off");
  $("#climbChip").innerHTML=IC.peak+'<span>'+fmt(totalClimb())+' m</span>'}
let cur="race";
function renderAll(){({race:renderRace,fuel:renderFuel,res:renderRes})[cur]();paintHeader(cur)}
function show(v){cur=v;document.querySelectorAll(".view").forEach(x=>x.classList.toggle("on",x.id==="v-"+v));document.querySelectorAll(".dock button").forEach(b=>b.setAttribute("aria-selected",b.dataset.v===v));
  renderAll();try{localStorage.setItem("tracktor-proto2-tab",v)}catch(e){}scrollTo({top:0})}
document.querySelector(".dock").addEventListener("click",e=>{const b=e.target.closest("[data-v]");if(b&&b.dataset.v!==cur){FX.tap();show(b.dataset.v)}});
$("#streakChip").addEventListener("click",()=>{const s=streakNow();toast(s?"连胜 "+s+" 场 · 两次训练间隔不超过 2 天就不断":"连胜断了 · 今天练一次就重新点燃")});
$("#climbChip").addEventListener("click",mountainSheet);

document.addEventListener("click",e=>{const b=e.target.closest("[data-act]");if(!b)return;const a=b.dataset.act;
  if(a==="start")startRun(b.dataset.sid);
  else if(a==="swap"){heroSid=b.dataset.sid;FX.tap();renderRace()}
  else if(a==="jersey")jerseySheet(b.dataset.k);
  else if(a==="mtn")mountainSheet();
  else if(a==="close")closeSheet();
  else if(a==="day")daySheet(b.dataset.d);
  else if(a==="stat"){statRange=30;statSheet(b.dataset.k)}
  else if(a==="srange"){statRange=+b.dataset.r;statSheet.redraw()}
  else if(run){
    if(a==="rclose"){if(run.finished||!run.sets.some(x=>x.some(y=>y.d))||confirm("退赛？原型里的成绩不会保存。"))closeRun()}
    else if(a==="tick")tickSet();
    else if(a==="timer"){if(run.timing)stopTimer();else startTimer()}
    else if(a==="inc"||a==="dec"){const ci=curSet();if(ci<0)return;const s=run.sets[run.ex][ci];s.v=Math.max(0,s.v+(a==="inc"?1:-1));
      run.sets[run.ex].forEach((x,i)=>{if(i>ci&&!x.d)x.v=s.v});FX.tap();renderRun(true)}
    else if(a==="rplus"){run.rest+=30;run.restMax=Math.max(run.restMax,run.rest)}
    else if(a==="rskip"){run.rest=0;clearInterval(restT);FX.tap();renderRun(true)}
    else if(a==="rnext"){const n=run.sets.findIndex(x=>x.some(y=>!y.d));if(n>=0){run.ex=n;renderRun(true)}}
  }});

let start="race";try{start=localStorage.getItem("tracktor-proto2-tab")||"race"}catch(e){}if(!["race","fuel","res"].includes(start))start="race";
show(start);
})();
