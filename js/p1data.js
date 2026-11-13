/* 推拉机 main interface (P1): the bits of the classic app's logic it needs. js/core.js holds the programme, storage
   (lsLoad / lsSave) and sessionDoc; js/diet.js the calorie maths; this file the rest, written without the classic
   page's DOM. Records are shared with classic.html: both read and write the same tracktor-data. */

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
function nextOf(kind){return PROGRAM.find(p=>p.kind===kind&&!(state.sessions[p.sid]&&state.sessions[p.sid].done))}
function firstOpen(){return PROGRAM.find(p=>!(state.sessions[p.sid]&&state.sessions[p.sid].done))}
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
