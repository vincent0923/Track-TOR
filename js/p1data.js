/* 推拉机 main interface (P1): the bits of the classic app's logic it needs. js/core.js holds the programme, storage
   (lsLoad / lsSave) and sessionDoc; js/diet.js the calorie maths; this file the rest, written without the classic
   page's DOM. Records are shared with classic.html: both read and write the same tracktor-data. */

window.P1=true;   /* js/coros.js, shared with the classic page, checks this */
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
function pullSeries(){
  const manual={},pull={};
  Object.values(state.metrics).forEach(m=>{if(m.date&&m.pullups!=null)manual[m.date]=+m.pullups});
  Object.entries(state.sessions).forEach(([sid,s])=>{
    if(!s||!BYID[sid]||BYID[sid].kind!=="pull")return;
    const it=s.xs&&s.xs.find(y=>y.id==="pullup"),sets=((s.sets&&s.sets.pullup)||[]).concat(it?it.sets:[]);
    const top=Math.max(0,...sets.filter(x=>x.d).map(x=>+x.v||0));
    if(!s.done&&!top)return;
    const d=s.date||today();pull[d]=Math.max(pull[d]||0,top)});
  const days=[...new Set(Object.keys(manual).concat(Object.keys(pull)))].sort(),out=[],last3=[];let man=null;
  days.forEach(d=>{if(manual[d]!=null)man=manual[d];if(pull[d]!=null){last3.push(pull[d]);if(last3.length>3)last3.shift()}
    const y=Math.max(man==null?0:man,...last3);if(y>0||man!=null)out.push({date:d,x:dnum(d),y})});
  return out}
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
const SFX={tick:()=>{tone(784,0,.09,"triangle",.2);tone(1175,.06,.16,"triangle",.2)},
  ex:()=>{[523,659,784,1047].forEach((f,i)=>tone(f,i*.07,.18,"triangle",.18))},
  rest:()=>{tone(880,0,.12,"sine",.2);tone(880,.18,.2,"sine",.2)},
  done:()=>{[523,659,784,1047,1319].forEach((f,i)=>tone(f,i*.09,.3,"triangle",.2));tone(1568,.5,.6,"sine",.12)},
  tap:()=>tone(1400,0,.04,"sine",.06)};
const buzz=ms=>{try{navigator.vibrate&&navigator.vibrate(ms)}catch(e){}};


/* ---------- moved from the classic page (js/ui.js, js/progress.js) ---------- */
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
  const def={pullups:{name:T("标准引体","Strict pull-ups"),unit:T("个","reps"),step:1,mode:"numeric",min:0,max:200,int:true,hint:T("下巴过杠的标准引体向上","Strict reps, chin over the bar")},
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
  const load=()=>{const r=state.metrics[dateEl.value];valEl.value=r&&r[key]!=null?r[key]:""};
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
    if(v!=null)saveMetric(date,{[key]:v});
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
function pullBestTrained(){/* best strict pull-up set ticked in training, in date order, with each new best */
  const sets=[];
  Object.entries(state.sessions).forEach(([sid,s])=>{if(!s||!BYID[sid])return;const d=s.date||today();
    ((s.sets&&s.sets.pullup)||[]).forEach(x=>{if(x.d)sets.push([d,+x.v||0])});
    (s.xs||[]).forEach(it=>{if(it.id==="pullup")it.sets.forEach(x=>{if(x.d)sets.push([d,+x.v||0])})})});
  Object.values(state.dayx||{}).forEach(dx=>(dx&&dx.xs||[]).forEach(it=>{if(it.id==="pullup")it.sets.forEach(x=>{if(x.d)sets.push([dx.date,+x.v||0])})}));
  sets.sort((a,b)=>a[0]<b[0]?-1:1);let best=0;sets.forEach(([,v])=>{if(v>best)best=v});return best}
function fatKgSure(){/* the smaller of the estimated fat loss and what the 7-day average weight did since the first food log */
  const g=gapAllTime();if(!g)return 0;const est=g.s/7700,ks=Object.keys(state.diet).sort(),a=wtMA7(ymdAdd(ks[0],-1)),b=wtMA7(ymdAdd(today(),-1));
  return Math.max(0,a!=null&&b!=null?Math.min(est,a-b):0)}
function waistDrop(){const z=series("waist");if(z.length<2)return 0;const last=z.slice(-3),avg=last.reduce((s,p)=>s+p.y,0)/last.length;return Math.max(0,z[0].y-avg)}
function coinBadges(){
  const st=state.settings,done=PROGRAM.filter(p=>state.sessions[p.sid]&&state.sessions[p.sid].done).length;
  /* weeks with 3+ training days, and the run of such weeks each belongs to */
  const days=Object.keys(dayMarks()).sort(),wk={};days.forEach(d=>{const k=coinWeekKey(d);wk[k]=(wk[k]||0)+1});
  let weekPts=0,run=0,weeks=0,prev=null;Object.keys(wk).sort().forEach(k=>{if(wk[k]<3){run=0;prev=k;return}
    const gap=prev?Math.round((dateObj0(k)-dateObj0(prev))/6048e5):1;run=(prev&&gap===1&&run>0)?run+1:1;prev=k;weeks++;weekPts+=Math.min(60,30+5*(run-1))});
  const pb=pullBestTrained(),fat=fatKgSure(),wd=waistDrop(),wt=avg7(wtMerged()),wNow=wt.length?wt[wt.length-1].y:null,zz=series("waist");
  const zNow=zz.length?zz.slice(-3).reduce((s,p)=>s+p.y,0)/Math.min(3,zz.length):null,g=gapAllTime(),fatNow=g?g.s/7700:0;
  return [
    {k:"train",ic:"dumbbell",name:T("出勤","Turn up"),what:T("每练完一次训练","Every finished session"),pts:done*10,have:done,unit:T("次",""),step:1,per:10},
    {k:"week",ic:"flame",name:T("周连练","Weekly run"),what:T("一周练够 3 天；连着几周越给越多","3 training days in a week; more for each week in a row"),pts:weekPts,have:weeks,unit:T("周","wk"),step:1,per:30},
    {k:"pr",ic:"pullup",name:T("引体纪录","Pull-up best"),what:T("训练里打勾的引体单组每多 1 个","Each extra rep in your best pull-up set, ticked in training"),pts:pb*50,have:pb,unit:T("个","reps"),step:1,per:50},
    {k:"fat",ic:"drop",name:T("减脂","Fat loss"),what:T("每减 0.5 kg 脂肪（估算和体重变化取小的）","Every 0.5 kg of fat (the smaller of the estimate and the weight trend)"),pts:Math.floor(fat/0.5)*50,have:+fat.toFixed(2),unit:"kg",step:0.5,per:50},
    {k:"waist",ic:"tape",name:T("腰围","Waist"),what:T("比第一次记录每少 1 cm","Every cm off since your first record"),pts:Math.floor(wd)*50,have:+wd.toFixed(1),unit:"cm",step:1,per:50},
    {k:"plan",ic:"flag",name:T("累计训练","Sessions"),what:T("累计练完 10、20、40 次","10, 20 and 40 sessions finished"),pts:(done>=10?100:0)+(done>=20?200:0)+(done>=40?400:0),have:done,unit:T("次",""),tiers:[10,20,40]},
    {k:"goal",ic:"target",name:T("达成目标","Goals reached"),what:T("引体、腰围、体重、减脂，每达成一个自己设的目标","Each goal you set and reach: pull-ups, waist, weight, fat loss"),pts:500*[+st.p>0&&pb>=+st.p,+st.z>0&&zNow!=null&&zNow<=+st.z,+st.w>0&&wNow!=null&&wNow<=+st.w,+st.fat>0&&fatNow>=+st.fat].filter(Boolean).length,
      have:[+st.p>0&&pb>=+st.p,+st.z>0&&zNow!=null&&zNow<=+st.z,+st.w>0&&wNow!=null&&wNow<=+st.w,+st.fat>0&&fatNow>=+st.fat].filter(Boolean).length,unit:T("个",""),tiers:[1,2,3,4]}]}
function coinTotal(){return coinBadges().reduce((a,b)=>a+b.pts,0)}

/* ---------- what js/coros.js expects from the page ---------- */
function saveSettings(){lsSave()}
function syncOn(k){const s=state.settings.sync;if(k==="heat")return !!(s&&s.heat===true);return !s||s[k]!==false}
function sfx(k){}
