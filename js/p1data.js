/* 博G健身 data helpers. js/core.js holds the programme, storage (lsLoad / lsSave) and sessionDoc; js/diet.js the
   calorie maths and the food editor; this file the rest: series for charts, next sessions, records, G, sounds. */

let toastT=0;
function toast(t){const el=document.getElementById("toast");if(!el)return;el.textContent=t;el.classList.add("on");clearTimeout(toastT);toastT=setTimeout(()=>el.classList.remove("on"),2200)}
/* v1.02a kept extras by date: move each day into the session done that day, else the latest one before it, else the
   next one (the same as js/train.js, so data opened here first is migrated, not dropped) */
function moveDatedExtras(byDate){
  let moved=false;
  Object.keys(byDate||{}).sort().forEach(d=>{
    const items=byDate[d].filter(it=>it.sets.some(x=>x.d));
    if(!items.length)return;
    const done=PROGRAM.filter(p=>{const s=state.sessions[p.sid];return s&&s.done&&s.date&&s.date<=d}).sort((x,y)=>state.sessions[x.sid].date<state.sessions[y.sid].date?-1:1);
    const same=done.filter(p=>state.sessions[p.sid].date===d);
    const open=PROGRAM.find(p=>!(state.sessions[p.sid]&&state.sessions[p.sid].done));
    const sid=same.length?same[0].sid:done.length?done[done.length-1].sid:(open?open.sid:PROGRAM[PROGRAM.length-1].sid);
    const doc=sessionDoc(sid);
    doc.xs=doc.xs||[];
    items.forEach(it=>{const have=doc.xs.find(y=>y.id===it.id);if(have)have.sets.push(...it.sets);else doc.xs.push(it)});
    moved=true;
  });
  return moved;
}
function maxOrdOf(s){let m=0;Object.values(s.sets).forEach(a=>a.forEach(y=>{if(y.o>m)m=y.o}));return m}
function dnum(s){const p=s.split("-");return Date.UTC(+p[0],+p[1]-1,+p[2])/864e5}
function series(key){return Object.values(state.metrics).filter(m=>m[key]!=null&&m.date).sort((a,b)=>a.date<b.date?-1:1).map(m=>({date:m.date,x:dnum(m.date),y:+m[key]}))}
function wtMerged(){return Object.values(state.metrics).filter(m=>m.date&&(m.weight!=null||m.weightC!=null)).sort((a,b)=>a.date<b.date?-1:1).map(m=>({date:m.date,x:dnum(m.date),y:+(m.weight??m.weightC)}))}
function avg7(pts,n=7){return pts.map(p=>{const w=pts.filter(q=>q.x<=p.x&&q.x>p.x-n);return {x:p.x,y:w.reduce((a,q)=>a+q.y,0)/w.length,date:p.date}})}
/* the main exercise: the one move shown as a goal. One of the plan's moves (tracked from training: the best set,
   and the engine never swaps it for another move), or one the user names (logged by hand only). Pull-ups unless
   chosen otherwise; their hand-logged numbers stay in metrics.pullups, any other move's in metrics.gm[id].
   settings.mainEx = {id, zh, en, unit, custom}; the goal number is settings.p. */
const MAIN_DEF={id:"pullup",zh:"标准引体",en:"Strict pull-ups",unit:"个"};
function mainEx(){const m=state.settings&&state.settings.mainEx;return m&&m.id?m:MAIN_DEF}
const isMain=e=>!!e&&e.id===mainEx().id;
function mainName(){const m=mainEx();return T(m.zh,m.en||m.zh)}
function mainUnit(){const u=mainEx().unit;return typeof U==="function"?U(u):u}
function mainManualOf(m){const id=mainEx().id;return id==="pullup"?m.pullups:(m.gm&&m.gm[id])}
/* every ticked set of a move, [date, value, where], from sessions, their extras and extras on days without a session */
function setsOfMove(id,kind){const out=[];
  Object.entries(state.sessions).forEach(([sid,s])=>{if(!s||!BYID[sid]||(kind&&BYID[sid].kind!==kind))return;const d=s.date||today();
    ((s.sets&&s.sets[id])||[]).forEach(x=>{if(x.d)out.push([d,+x.v||0,sid])});
    (s.xs||[]).forEach(it=>{if(it.id===id)it.sets.forEach(x=>{if(x.d)out.push([d,+x.v||0,sid])})})});
  Object.entries(state.dayx||{}).forEach(([d,x])=>((x&&x.xs)||[]).forEach(it=>{if(it.id===id)(it.sets||[]).forEach(z=>{if(z.d)out.push([d,+z.v||0,"x:"+d])})}));
  return out}
/* how many ticked sets each move has, everywhere (sessions, their extras, day extras) */
function moveSetCounts(){const n={},add=(id,sets)=>(sets||[]).forEach(z=>{if(z&&z.d)n[id]=(n[id]||0)+1});
  Object.values(state.sessions).forEach(s=>{if(!s)return;Object.entries(s.sets||{}).forEach(([id,a])=>add(id,a));(s.xs||[]).forEach(it=>add(it.id,it.sets))});
  Object.values(state.dayx||{}).forEach(x=>((x&&x.xs)||[]).forEach(it=>add(it.id,it.sets)));return n}
/* the main exercise over time: the larger of the latest hand-logged number and the best set over the last 3
   sessions it was trained in (a lower hand-logged number after a higher one replaces it, so a drop can be recorded) */
function mainSeries(){const m=mainEx(),manual={},tr={};
  Object.values(state.metrics).forEach(r=>{const v=r.date&&mainManualOf(r);if(v!=null)manual[r.date]=+v});
  if(!m.custom){const by={};setsOfMove(m.id,m.id==="pullup"?"pull":null).forEach(([d,v,sid])=>{const k=sid;by[k]=by[k]||{d,v:0};by[k].v=Math.max(by[k].v,v);if(d<by[k].d)by[k].d=d});
    Object.values(by).forEach(({d,v})=>{tr[d]=Math.max(tr[d]||0,v)})}
  const days=[...new Set(Object.keys(manual).concat(Object.keys(tr)))].sort(),out=[],last3=[];let man=null;
  days.forEach(d=>{if(manual[d]!=null)man=manual[d];if(tr[d]!=null){last3.push(tr[d]);if(last3.length>3)last3.shift()}
    const y=Math.max(man==null?0:man,...last3);if(y>0||man!=null)out.push({date:d,x:dnum(d),y})});
  return out}
const pullSeries=mainSeries;
lsLoad();

/* ---------- training data ---------- */
/* the next session of a kind is the first one after the last finished day of that kind (a day skipped earlier stays
   behind); the next session overall is the kind trained less recently */
function lastDoneOf(kind){let d=0,date="";PROGRAM.forEach(p=>{const s=state.sessions[p.sid];if(p.kind===kind&&s&&s.done){if(p.day>d)d=p.day;if((s.date||"")>date)date=s.date||""}});return {day:d,date}}
function nextOf(kind){const l=lastDoneOf(kind).day;return PROGRAM.filter(p=>p.kind===kind&&p.day>l&&!(state.sessions[p.sid]&&state.sessions[p.sid].done)).sort((a,b)=>a.day-b.day)[0]}
function firstOpen(except){const ks=(typeof planKinds==="function"?planKinds():["push","pull"]).filter(k=>k!==except);
  const c=ks.map(k=>({k,n:nextOf(k),l:lastDoneOf(k)})).filter(x=>x.n);if(!c.length)return null;
  c.sort((a,b)=>a.l.date<b.l.date?-1:a.l.date>b.l.date?1:a.l.day-b.l.day);return c[0].n}
function setsOf(sid){const s=state.sessions[sid];const p=BYID[sid];
  return p.ex.map(e=>{const a=s&&s.sets&&s.sets[e.id];return a?a.map(x=>({v:+x.v,d:!!x.d})):Array.from({length:e.sets},()=>({v:e.target,d:false}))})}
function dayMarks(){const m={};const add=(d,k)=>{(m[d]=m[d]||new Set()).add(k)};
  Object.entries(state.sessions).forEach(([sid,s])=>{if(s&&s.done&&s.date&&BYID[sid])add(s.date,BYID[sid].kind);
    if(s&&s.xs&&s.date&&s.xs.some(it=>it.sets.some(x=>x.d))&&!s.done)add(s.date,"x")});
  Object.values(state.dayx||{}).forEach(x=>{if(x&&x.date&&x.xs&&x.xs.some(it=>it.sets.some(y=>y.d)))add(x.date,"x")});
  return m}

/* sound and touch: short synthesized tones; a light buzz where the phone allows it */
let AC=null;
function tone(f,at,dur,type,vol,f2){try{AC=AC||new (window.AudioContext||window.webkitAudioContext)();const t=AC.currentTime+at,o=AC.createOscillator(),g=AC.createGain();
  o.type=type;o.frequency.setValueAtTime(f,t);if(f2)o.frequency.exponentialRampToValueAtTime(f2,t+dur);g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(vol,t+.01);g.gain.exponentialRampToValueAtTime(.0001,t+dur);
  o.connect(g).connect(AC.destination);o.start(t);o.stop(t+dur+.02)}catch(e){}}
const SFX_BASE={tick:()=>{tone(784,0,.09,"triangle",.2);tone(1175,.06,.16,"triangle",.2)},
  ex:()=>{[523,659,784,1047].forEach((f,i)=>tone(f,i*.07,.18,"triangle",.18))},
  rest:()=>{tone(880,0,.12,"sine",.2);tone(880,.18,.2,"sine",.2)},
  done:()=>{[523,659,784,1047,1319].forEach((f,i)=>tone(f,i*.09,.3,"triangle",.2));tone(1568,.5,.6,"sine",.12)},
  tap:()=>tone(1400,0,.04,"sine",.06),
  /* one notch of the move dial: a dry click, then the landing */
  detent:()=>{click(1900,.9,.08,170)},land:()=>{click(1300,.8,.1,120);tone(95,0,.07,"sine",.12,70)}};
/* a real-sounding mechanical click: a short burst of band-passed noise (the snap) over a low knock (the body);
   kept in the mid range so fast spinning never turns shrill */
function click(f,q,v,knock){if(typeof fxHit==="function")fxHit(0,.022,f,q,v);if(knock)tone(knock,0,.03,"sine",v*1.1,knock*.6)}
/* the toy skin sounds like toys: a bubble pop for a tick, a xylophone run, a cuckoo for the end of a rest,
   a toy-trumpet fanfare, and a plastic click for taps */
const xylo=(f,at,v)=>{tone(f,at,.35,"sine",v||.22);tone(f*4,at,.06,"sine",(v||.22)*.35);tone(f*2.76,at,.12,"triangle",(v||.22)*.18)};
const SFX_TOY={tick:()=>{tone(950,0,.11,"sine",.26,240);tone(1900,0,.02,"square",.05)},
  ex:()=>{[1047,1175,1319,1568,2093].forEach((f,i)=>xylo(f,i*.065,.2))},
  rest:()=>{tone(784,0,.16,"sine",.22,740);tone(622,.22,.26,"sine",.22,590)},
  done:()=>{[[523,0],[659,.12],[784,.24],[1047,.36],[784,.52],[1047,.64]].forEach(([f,t])=>{tone(f,t,.16,"square",.06);tone(f,t,.16,"triangle",.14)});xylo(2093,.82,.18)},
  tap:()=>{tone(1800,0,.018,"square",.05);tone(320,0,.03,"triangle",.1,180)},
  detent:()=>{click(1400,1.1,.08,260)},land:()=>{click(1000,1,.1,200);tone(420,0,.08,"sine",.14,220)}};
/* each skin can bring its own sounds (SFX_TH in js/p1fx.js); anything it leaves out falls back to the base set */
const SFX=new Proxy({},{get:(o,k)=>{const th=document.documentElement.dataset.theme;if(th==="toy")return SFX_TOY[k];const t=typeof SFX_TH!=="undefined"&&SFX_TH[th];return (t&&t[k])||SFX_BASE[k]}});
const buzz=ms=>{try{navigator.vibrate&&navigator.vibrate(ms)}catch(e){}};


/* ---------- records, celebrations ---------- */
function md(s){if(!s)return "";const p=s.split("-");return (+p[1])+"."+(+p[2])}
function esc(s){return String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]))}
function numOrNull(v){if(v===""||v==null)return null;const n=Number(v);return isFinite(n)?n:null}
/* setMetric changes one day in memory; saveMetric also writes it to storage */
function setMetric(date,patch){
  const m=Object.assign({date},state.metrics[date]||{});
  Object.keys(patch).forEach(k=>{if(patch[k]!=null)m[k]=patch[k]});
  state.metrics[date]=m;
}
function saveMetric(date,patch){setMetric(date,patch);lsSave()}
/* one number for a chosen date (pull-ups, weight or waist); empty clears that day's record */
function openRecord(key){
  const mu=mainEx().unit,mdec=mu==="km"||mu==="kg";
  const def={pullups:mainEx().id==="pullup"?{name:T("标准引体","Strict pull-ups"),unit:T("个","reps"),step:1,mode:"numeric",min:0,max:200,int:true,hint:T("下巴过杠的标准引体向上","Strict reps, chin over the bar")}
      :{name:mainName(),unit:mainUnit(),step:mdec?0.1:1,mode:mdec?"decimal":"numeric",min:0,max:100000,int:!mdec,hint:T("这次最好的一组 / 一次","Your best set or effort")},
    weight:{name:T("体重","Weight"),unit:"kg",step:0.1,mode:"decimal",min:20,max:300,hint:T("清晨空腹体重","Morning weight, before eating")},
    waist:{name:T("腰围","Waist"),unit:"cm",step:0.1,mode:"decimal",min:30,max:180,hint:T("量三次肚脐眼位置，选最大值或者平均值","Measure 3 times at the navel; take the largest or the average")}}[key];
  const m=document.createElement("div");
  m.className="mask";
  m.innerHTML='<div class="sheet" role="dialog" aria-modal="true" aria-label="'+esc(def.name)+'" style="max-width:360px">'
    +'<h3><span>'+esc(def.name)+'</span><button class="iconbtn" type="button" data-close aria-label="'+T("取消","Cancel")+'">'+CLOSE_ICON+'</button></h3>'
    +'<div class="form-body"><label class="flabel">'+T("日期","Date")+'<input id="recDate" type="date" value="'+today()+'" max="'+today()+'"></label>'
    +'<label class="flabel">'+esc(def.name)+'（'+def.unit+'）<input id="recVal" type="number" inputmode="'+def.mode+'" min="0" step="'+def.step+'" placeholder="'+esc(def.hint)+'"></label><p class="recerr" id="recErr" role="alert" hidden></p></div>'
    +'<div class="row" style="justify-content:flex-end"><button class="btn recsave" type="button" data-recsave aria-label="'+T("保存并关闭","Save and close")+'">'+SAVE_ICON+'</button></div></div>';
  document.body.appendChild(m);
  const dateEl=m.querySelector("#recDate"),valEl=m.querySelector("#recVal");
  /* the main exercise's hand-logged number: metrics.pullups for pull-ups, metrics.gm[id] for any other move */
  const gm=key==="pullups"&&mainEx().id!=="pullup"?mainEx().id:null;
  const getV=r=>!r?null:gm?(r.gm&&r.gm[gm]):r[key];
  const load=()=>{const r=state.metrics[dateEl.value],v=getV(r);valEl.value=v!=null?v:""};
  load();dateEl.addEventListener("change",load);
  m.querySelector("[data-close]").addEventListener("click",()=>m.remove());
  let armed=false;m.addEventListener("pointerdown",e=>{armed=e.target===m});m.addEventListener("click",e=>{if(e.target===m&&armed)m.remove()});
  const saveBtn=m.querySelector("[data-recsave]"),errEl=m.querySelector("#recErr");
  const valid=()=>{const s=valEl.value.trim();if(!s)return !valEl.validity.badInput;const n=Number(s);return isFinite(n)&&n>=def.min&&n<=def.max&&(!def.int||Number.isInteger(n))};
  const check=()=>{const ok=valid();saveBtn.disabled=!ok;valEl.classList.toggle("bad",!ok);errEl.hidden=ok;
    if(!ok)errEl.textContent=T("请填 "+def.min+"–"+def.max+" 之间的"+(def.int?"整数":"数字")+"（"+def.unit+"）","Enter a "+(def.int?"whole number":"number")+" from "+def.min+" to "+def.max+" ("+def.unit+")");return ok};
  valEl.addEventListener("input",check);dateEl.addEventListener("change",check);
  saveBtn.addEventListener("click",()=>{if(!check())return;
    const date=dateEl.value||today(),v=numOrNull(valEl.value),r=state.metrics[date];
    if(gm){if(v!=null){const o=Object.assign({},r&&r.gm,{[gm]:v});saveMetric(date,{gm:o})}
      else if(r&&r.gm&&r.gm[gm]!=null){delete r.gm[gm];if(!Object.keys(r.gm).length)delete r.gm;if(Object.keys(r).every(k=>k==="date"))delete state.metrics[date];lsSave()}}
    else if(v!=null)saveMetric(date,{[key]:v});
    else if(r&&r[key]!=null){delete r[key];if(Object.keys(r).every(k=>k==="date"))delete state.metrics[date];lsSave()}
    m.remove();renderAll();toast(md(date)+T(" 的记录已保存"," saved"))});
  check();valEl.focus();
}

/* ---------- G (Grind): points for real progress in strength, fat loss and waist ----------
   Worked out from the records every time, never stored, so restoring a progress file brings them back and the backup
   format is untouched. Each badge pays once. Values follow the plan: training 10, a week with 3 training days 30 (+5
   per week in a row, up to 60), a new strict pull-up best 50 per rep (ticked sets in training only), every 0.5 kg of
   fat 50 (the smaller of the estimate and the drop in 7-day average weight), every cm off the waist 50, the plan at
   10/20/40 sessions 100/200/400, each goal reached 500. */
function coinWeekKey(d){const x=dateObj0(d),k=(x.getDay()+6)%7;x.setDate(x.getDate()-k);return x.getFullYear()+"-"+pad(x.getMonth()+1)+"-"+pad(x.getDate())}
function dateObj0(s){const [y,m,d]=s.split("-").map(Number);return new Date(y,m-1,d)}
function pullBestTrained(){/* best set of the main exercise ticked in training (a move the user named has none) */
  const m=mainEx();if(m.custom)return 0;let best=0;setsOfMove(m.id).forEach(([,v])=>{if(v>best)best=v});
  Object.values(state.dayx||{}).forEach(dx=>(dx&&dx.xs||[]).forEach(it=>{if(it.id===m.id)it.sets.forEach(x=>{if(x.d&&+x.v>best)best=+x.v})}));return best}
function fatKgSure(){/* the smaller of the estimated fat loss and what the 7-day average weight did since the first food log */
  const g=gapAllTime();if(!g)return 0;const est=g.s/7700,ks=Object.keys(state.diet).sort(),a=wtMA7(ymdAdd(ks[0],-1)),b=wtMA7(ymdAdd(today(),-1));
  return Math.max(0,a!=null&&b!=null?Math.min(est,a-b):0)}
function waistDrop(){const z=series("waist");if(z.length<2)return 0;const last=z.slice(-3),avg=last.reduce((s,p)=>s+p.y,0)/last.length;return Math.max(0,z[0].y-avg)}
/* advanced setup: each outside service connected for the first time is worth 1000 G (settings.adv, kept in backups) */
function advDone(k){const s=state.settings,a=s.adv=s.adv||{};if(a[k])return;a[k]=today();lsSave();
  setTimeout(()=>{toast(T("进阶设置完成 +1000 G","Advanced setup done +1000 G"));if(typeof celebrate==="function")celebrate(6,1)},600)}
function coinBadges(){
  const st=state.settings,done=PROGRAM.filter(p=>state.sessions[p.sid]&&state.sessions[p.sid].done).length;
  /* weeks with 3+ training days, and the run of such weeks each belongs to */
  const days=Object.keys(dayMarks()).sort(),wk={};days.forEach(d=>{const k=coinWeekKey(d);wk[k]=(wk[k]||0)+1});
  let weekPts=0,run=0,weeks=0,prev=null;Object.keys(wk).sort().forEach(k=>{if(wk[k]<3){run=0;prev=k;return}
    const gap=prev?Math.round((dateObj0(k)-dateObj0(prev))/6048e5):1;run=(prev&&gap===1&&run>0)?run+1:1;prev=k;weeks++;weekPts+=Math.min(60,30+5*(run-1))});
  const pb=pullBestTrained(),mb=Math.max(pb,0,...mainSeries().map(x=>x.y)),fat=fatKgSure(),wd=waistDrop(),wt=avg7(wtMerged()),wNow=wt.length?wt[wt.length-1].y:null,zz=series("waist");
  const zNow=zz.length?zz.slice(-3).reduce((s,p)=>s+p.y,0)/Math.min(3,zz.length):null,g=gapAllTime(),fatNow=g?g.s/7700:0;
  return [
    {k:"train",ic:"dumbbell",name:T("出勤","Turn up"),what:T("每练完一次训练","Every finished session"),pts:done*10,have:done,unit:T("次",""),step:1,per:10},
    {k:"week",ic:"flame",name:T("周连练","Weekly run"),what:T("一周练够 3 天；连着几周越给越多","3 training days in a week; more for each week in a row"),pts:weekPts,have:weeks,unit:T("周","wk"),step:1,per:30},
    {k:"pr",ic:"pullup",name:T(mainEx().zh+"纪录",(mainEx().en||mainEx().zh)+" best"),what:T("训练里打勾的"+mainEx().zh+"单组每多 1 "+(mainEx().unit==="秒"?"秒（每 5 秒算 1）":"个"),"Each "+(mainEx().unit==="秒"?"5 s":"rep")+" more in your best "+(mainEx().en||mainEx().zh)+" set, ticked in training"),pts:(mainEx().unit==="秒"?Math.floor(pb/5):pb)*50,have:pb,unit:mainUnit(),step:1,per:50},
    {k:"fat",ic:"drop",name:T("减脂","Fat loss"),what:T("每减 0.5 kg 脂肪（估算和体重变化取小的）","Every 0.5 kg of fat (the smaller of the estimate and the weight trend)"),pts:Math.floor(fat/0.5)*50,have:+fat.toFixed(2),unit:"kg",step:0.5,per:50},
    {k:"waist",ic:"tape",name:T("腰围","Waist"),what:T("比第一次记录每少 1 cm","Every cm off since your first record"),pts:Math.floor(wd)*50,have:+wd.toFixed(1),unit:"cm",step:1,per:50},
    {k:"plan",ic:"flag",name:T("累计训练","Sessions"),what:T("累计练完 10、20、40 次","10, 20 and 40 sessions finished"),pts:(done>=10?100:0)+(done>=20?200:0)+(done>=40?400:0),have:done,unit:T("次",""),tiers:[10,20,40]},
    {k:"goal",ic:"target",name:T("达成目标","Goals reached"),what:T(mainEx().zh+"、腰围、体重、减脂，每达成一个自己设的目标","Each goal you set and reach: "+(mainEx().en||mainEx().zh)+", waist, weight, fat loss"),pts:500*[+st.p>0&&mb>=+st.p,+st.z>0&&zNow!=null&&zNow<=+st.z,+st.w>0&&wNow!=null&&wNow<=+st.w,+st.fat>0&&fatNow>=+st.fat].filter(Boolean).length,
      have:[+st.p>0&&mb>=+st.p,+st.z>0&&zNow!=null&&zNow<=+st.z,+st.w>0&&wNow!=null&&wNow<=+st.w,+st.fat>0&&fatNow>=+st.fat].filter(Boolean).length,unit:T("个",""),tiers:[1,2,3,4]},
    {k:"adv",ic:"flag",name:T("进阶设置","Advanced setup"),what:T("每连好一项：饮食表格、Spotify","Each one you connect: food table, Spotify"),pts:1000*Object.keys(st.adv||{}).length,have:Object.keys(st.adv||{}).length,unit:T("项",""),tiers:[1,2]}]}
/* G earned minus G spent on themes (settings.buys) */
function coinSpent(){return (state.settings.buys||[]).reduce((a,b)=>a+(+b.g||0),0)}
function coinTotal(){return coinBadges().reduce((a,b)=>a+b.pts,0)-coinSpent()}

/* ---------- what js/coros.js expects from the page ---------- */
function saveSettings(){lsSave()}
function syncOn(k){const s=state.settings.sync;if(k==="heat")return !!(s&&s.heat===true);return !s||s[k]!==false}
function sfx(k){}
