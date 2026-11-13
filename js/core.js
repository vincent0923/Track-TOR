const CLOSE_ICON='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>';
const PENCIL_ICON='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 20h4L19 9a2.1 2.1 0 0 0-3-3L5 17z"/><path d="M14 20h6"/></svg>';
const CALC_ICON='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="5" y="2.5" width="14" height="19" rx="2"/><path d="M8.5 6.5h7"/><path d="M8.5 11h.01M12 11h.01M15.5 11h.01M8.5 14.5h.01M12 14.5h.01M15.5 14.5h.01M8.5 18h.01M12 18h.01M15.5 18h.01"/></svg>';
const SAVE_ICON='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><path d="M17 21v-8H7v8M7 3v5h8"/></svg>';
/* ---------- program ---------- */
const STRETCH = {id:"stretch",name:"拉伸",en:"Stretch",unit:"分钟",target:5,sets:1};
/* From push D5 / pull D5: no decline push-ups (no consistent bench height when travelling), diamonds 3 sets, wall sit 3 × 20 s on both days. */
const WALLSIT = {id:"wallsit",name:"靠墙静蹲",en:"Wall sit",unit:"秒",target:20,sets:3};
/* From push D4 / pull D3: every rep-based set is 5–12 reps, never above 12; volume grows by adding sets. */
function pushDay(d){
  const t = d<=5?0:d<=10?1:d<=15?2:3;
  if(d>=5) return [
    {id:"std",name:"标准俯卧撑（慢速 3-1-1）",en:"Push-ups (slow 3-1-1)",unit:"个",target:[10,12,12,12][t],sets:[4,4,5,5][t],note:"稳、慢，姿势变形就停",noteEn:"Steady and slow; stop when form breaks"},
    {id:"diamond",name:"钻石俯卧撑",en:"Diamond push-ups",unit:"个",target:[10,10,12,12][t],sets:3},
    {id:"plank",name:"平板支撑",en:"Plank",unit:"秒",target:[45,60,60,75][t],sets:3},
    {id:"situp",name:"仰卧起坐",en:"Sit-ups",unit:"个",target:12,sets:[4,5,5,6][t]},
    WALLSIT,
    STRETCH
  ];
  if(d>=4) return [
    {id:"std",name:"标准俯卧撑（慢速 3-1-1）",en:"Push-ups (slow 3-1-1)",unit:"个",target:[10,12,12,12][t],sets:[4,4,5,5][t],note:"稳、慢，姿势变形就停",noteEn:"Steady and slow; stop when form breaks"},
    {id:"decline",name:"下斜俯卧撑",en:"Decline push-ups",unit:"个",target:[10,10,12,12][t],sets:[2,3,3,4][t],note:"髋下沉就停",noteEn:"Stop when hips sag"},
    {id:"diamond",name:"钻石俯卧撑",en:"Diamond push-ups",unit:"个",target:[10,10,12,12][t],sets:[1,2,2,3][t]},
    {id:"plank",name:"平板支撑",en:"Plank",unit:"秒",target:[45,60,60,75][t],sets:3},
    {id:"situp",name:"仰卧起坐",en:"Sit-ups",unit:"个",target:12,sets:[4,5,5,6][t]},
    STRETCH
  ];
  const std = d<=3
    ? {id:"std",name:"标准俯卧撑",en:"Push-ups",unit:"个",target:20,sets:3,note:"第 2、3 组慢速",noteEn:"Sets 2–3 slow"}
    : {id:"std",name:"标准俯卧撑（慢速 3-1-1）",en:"Push-ups (slow 3-1-1)",unit:"个",target:15,sets:3,note:"余 1–2 个或姿势变形就停",noteEn:"Stop 1–2 reps short or when form breaks"};
  return [
    std,
    {id:"decline",name:"下斜俯卧撑",en:"Decline push-ups",unit:"个",target:[12,15,15,18][t],sets:[2,2,3,3][t],note:"髋下沉就停",noteEn:"Stop when hips sag"},
    {id:"diamond",name:"钻石俯卧撑",en:"Diamond push-ups",unit:"个",target:[10,10,12,15][t],sets:[1,2,2,2][t]},
    {id:"plank",name:"平板支撑",en:"Plank",unit:"秒",target:[45,60,60,75][t],sets:3},
    {id:"situp",name:"仰卧起坐",en:"Sit-ups",unit:"个",target:[15,20,20,25][t],sets:3},
    STRETCH
  ];
}
function pullDay(d){
  const t = d<=5?0:d<=10?1:d<=15?2:3;
  const list = [];
  if(d>=3) list.push({id:"pullup",name:"标准引体",en:"Strict pull-ups",unit:"个",target:[1,2,3,4][t],sets:[3,4,4,4][t],note:"第一个做；留 1 个余力，组间休息 2–3 分钟",noteEn:"Do first; leave 1 in reserve, rest 2–3 min between sets"});
  else if(t>=2) list.push({id:"pullup",name:"标准引体",en:"Strict pull-ups",unit:"个",target:[0,0,2,3][t],sets:3,note:"下巴过杠、手臂伸直才算",noteEn:"Chin over bar, arms straight"});
  list.push(
    {id:"row",name:"反向划船",en:"Inverted rows",unit:"个",target:d<=2?[10,12,12,15][t]:[10,12,12,12][t],sets:d<=2?3:[3,3,4,4][t],note:t>=2?"身体放更低":"第一组轻松就降 5cm",noteEn:t>=2?"Set your body lower":"Drop 5 cm if set 1 feels easy"},
    {id:"hang",name:"悬吊",en:"Dead hang",unit:"秒",target:[30,30,40,45][t],sets:[2,3,3,3][t]},
    {id:"ecc",name:"离心引体",en:"Negative pull-ups",unit:"个",target:[3,4,5,5][t],sets:3,note:"每个下放 "+[5,5,6,8][t]+" 秒",noteEn:"Lower over "+[5,5,6,8][t]+" s each"},
    {id:"plank",name:"平板支撑",en:"Plank",unit:"秒",target:[45,60,60,75][t],sets:3}
  );
  if(d>=5) list.push(WALLSIT);
  list.push(STRETCH);
  return list;
}
const PROGRAM = [];
for(let d=1; d<=20; d++){
  PROGRAM.push({sid:"push-"+pad(d),kind:"push",day:d,label:"推练 D"+d,ex:pushDay(d)});
  PROGRAM.push({sid:"pull-"+pad(d),kind:"pull",day:d,label:"拉练 D"+d,ex:pullDay(d)});
}
const BYID = Object.fromEntries(PROGRAM.map(s=>[s.sid,s]));
/* a day's exercises in the fixed programme (push and pull, days 1–20), or null: what a session without doc.ex was done with */
function baseEx(sid){const m=/^(push|pull)-(\d+)$/.exec(sid);if(!m||+m[2]<1||+m[2]>20)return null;return m[1]==="push"?pushDay(+m[2]):pullDay(+m[2])}
/* back to the fixed programme, then the given sessions' own exercises on top: used when the records are replaced
   (a progress file), so nothing planned on this phone before is left behind in PROGRAM / BYID */
function resetPlanned(sessions){for(let i=PROGRAM.length-1;i>=0;i--){const p=PROGRAM[i],b=baseEx(p.sid);if(b)p.ex=b;else{PROGRAM.splice(i,1);delete BYID[p.sid]}}
  registerPlanned(sessions)}
/* sessions planned by the training engine (js/engine.js) carry their own exercises in doc.ex: they replace the
   fixed programme's day, or add days beyond 20. Called after loading and after importing a progress file. */
function registerPlanned(sessions){
  Object.entries(sessions||{}).forEach(([sid,doc])=>{
    if(!doc||!Array.isArray(doc.ex)||!doc.ex.length)return;
    const m=/^(push|pull|third)-(\d+)$/.exec(sid);if(!m)return;
    let p=BYID[sid];
    if(!p){p={sid,kind:m[1],day:+m[2],ex:doc.ex};PROGRAM.push(p);BYID[sid]=p}
    else p.ex=doc.ex;
  });
  const ko={push:0,pull:1,third:2};PROGRAM.sort((a,b)=>a.day-b.day||ko[a.kind]-ko[b.kind]);
}

/* ---------- storage layout ----------
   Everything lives in localStorage under the "tracktor-" prefix:
     tracktor-data   {sessions, metrics, diet, settings, dayx}: all the user's records in one place
     tracktor-<name> small preferences and flags (lang, theme, tab, lastbackup, ...)
     tracktor-coros-token / tracktor-coros-region: the COROS connection
   metrics[date] holds every per-day number: pullups, weight (manual), weightC (COROS), waist,
   sleep, sleepH, hrv, rhr, active and steps (COROS activity). diet[date] holds what was eaten. */
const LS = "tracktor", DATA_K = LS + "-data";

/* old backups and the old storage layout kept diet days, COROS activity and some weights in a
   separate ledger; fold it into metrics/diet. Existing values in metrics win. */
function mergeLegacyDiet(metrics, diet, legacy){
  if(!legacy) return;
  const day = d => metrics[d] || (metrics[d] = {date:d});
  Object.entries(legacy.days||{}).forEach(([d,v])=>{ if(v) diet[d] = v; });
  Object.entries(legacy.coros||{}).forEach(([d,c])=>{
    if(!c) return; const m = day(d);
    if(c.active!=null && m.active==null) m.active = +c.active;
    if(c.steps!=null && m.steps==null) m.steps = +c.steps;
  });
  Object.entries(legacy.weights||{}).forEach(([d,w])=>{
    if(!w || w.kg==null || w.kg==="") return; const m = day(d);
    if(w.source==="manual"){ if(m.weight==null) m.weight = +w.kg; }
    else if(m.weight==null && m.weightC==null) m.weightC = +w.kg;
  });
}
/* one-time move from the layout used up to v1.12a ("pushpull-v1*" keys plus a separate diet ledger).
   Old keys are removed only after the new copy is written and reads back. */
(function migrateStorage(){
  try{
    if(localStorage.getItem(DATA_K)) return;
    const old = JSON.parse(localStorage.getItem("pushpull-v1") || "null");
    const ledger = JSON.parse(localStorage.getItem("tracktor-diet-v1") || localStorage.getItem("diet_ledger_state_v2") || "null");
    const prefs = Object.keys(localStorage).filter(k=>k.startsWith("pushpull-v1-"));
    if(!old && !ledger && !prefs.length) return;
    if(old || ledger){
      const d = Object.assign({sessions:{}, metrics:{}, settings:{}}, old||{});
      d.metrics = d.metrics || {}; d.diet = d.diet || {};
      mergeLegacyDiet(d.metrics, d.diet, ledger);
      const txt = JSON.stringify(d);
      localStorage.setItem(DATA_K, txt);
      if(localStorage.getItem(DATA_K) !== txt) return;
    }
    prefs.forEach(k=>localStorage.setItem(LS + k.slice("pushpull-v1".length), localStorage.getItem(k)));
    ["pushpull-v1","tracktor-diet-v1","diet_ledger_state_v2","tracktor-diet-pruned-20261024"].concat(prefs).forEach(k=>localStorage.removeItem(k));
  }catch(e){}
})();

/* ---------- helpers ---------- */
function pad(n){return String(n).padStart(2,"0")}
let LANG="zh";try{LANG=localStorage.getItem(LS+"-lang")==="en"?"en":"zh"}catch(e){}   /* "zht" is Chinese shown in Traditional characters (js/hant.js) */
const T=(zh,en)=>LANG==="en"?en:zh;
const N=e=>T(e.name,e.en), NS=e=>T(e.name.replace(/（.*）/,""),e.en.replace(/\s*\(.*\)/,"")), NOTE=e=>T(e.note,e.noteEn);
const U=u=>T(u,{"个":"reps","秒":"s","分钟":"min"}[u]||u);
/* a training day's name: the chosen plan names its days (settings.plan, see js/engine.js); otherwise push and pull */
function dayName(kind){const pl=typeof state!=="undefined"&&state.settings&&state.settings.plan,d=pl&&pl.days&&pl.days.find(x=>x.kind===kind);
  if(d)return {zh:d.zh,en:d.en||d.zh};return kind==="push"?{zh:"推练",en:"Push"}:kind==="pull"?{zh:"拉练",en:"Pull"}:{zh:"C 练",en:"Day C"}}
const LAB=p=>{const n=dayName(p.kind);return T(n.zh+" D"+p.day,n.en+" D"+p.day)};
function today(){const d=new Date();return d.getFullYear()+"-"+pad(d.getMonth()+1)+"-"+pad(d.getDate())}
/* ---------- state & storage ---------- */
/* nothing personal by default: the welcome sheet or a COROS sync fills these in */
const GDEF={h:null,hC:null,hSrc:"coros",w:null,z:null,p:null,b:null,sex:null};
const H_FALLBACK=170;
const state = {sessions:{}, metrics:{}, diet:{}, settings:Object.assign({},GDEF), dayx:{}};
/* first visit on this browser: nothing saved yet (read before anything writes) */
const FRESH = (()=>{try{return !localStorage.getItem(DATA_K)&&!localStorage.getItem("tracktor-coros-token")}catch(e){return false}})();
let lsOk = true;
function lsLoad(){
  let j=null;
  try{j=JSON.parse(localStorage.getItem(DATA_K)||"null")}catch(e){lsOk=false}
  if(j){state.sessions=j.sessions||{};state.metrics=j.metrics||{};state.diet=j.diet||{};state.settings=Object.assign({},GDEF,j.settings||{});state.dayx=j.dayx||{};
    /* a 0 sleep score was saved before the night was scored; drop it so the real score can arrive */
    let z=0;for(const [d,m] of Object.entries(state.metrics)){if(m.sleep===0){delete m.sleep;delete m.sleepH;z++;if(Object.keys(m).every(k=>k==="date"||m[k]==null))delete state.metrics[d]}}
    if(z)lsSave();
    if(repairMapped())lsSave();
    registerPlanned(state.sessions);
    if(j.extras&&moveDatedExtras(j.extras))lsSave();}
}
/* before v1.44a, restoring a progress file on a phone that had already planned pull D1–D2 put each number on the
   planned day's moves (pull-ups first) instead of the moves actually done (rows first): 20 rows read as 20 pull-ups.
   Such a session has no doc.ex, as many moves as its programme day, and a first move that day never had; its numbers
   are put back in order on the day's own moves. Runs on every load and changes nothing once repaired. */
function repairMapped(){let n=0;Object.entries(state.sessions).forEach(([sid,doc])=>{if(!doc||!doc.done||doc.ex||!doc.sets)return;
  const base=baseEx(sid);if(!base)return;const keys=Object.keys(doc.sets),ids=base.map(e=>e.id);
  if(keys.length!==ids.length||keys.join()===ids.join()||ids.includes(keys[0]))return;
  const sets={};ids.forEach((id,i)=>sets[id]=doc.sets[keys[i]]);doc.sets=sets;n++});return n}
function lsSave(){
  try{localStorage.setItem(DATA_K,JSON.stringify(state));lsOk=true}catch(e){if(lsOk){lsOk=false;toast(T("这个浏览器不允许保存，请先保存进度文件","This browser can't save data — save a progress file now"))}}
}

try{if(navigator.storage&&navigator.storage.persist)navigator.storage.persist()}catch(e){}
/* removed things leave nothing behind: the Rings page's log, the prototypes' and the classic interface's preferences */
try{["rings","proto-tab","proto-mode","proto2-tab","ui","theme","sound","vol","wear","priv","dock","tab","charts","calfold","goalpin","fromp1","sheet-try","gapwin","prompt-ver"].forEach(k=>localStorage.removeItem("tracktor-"+k))}catch(e){}

function sessionDoc(sid){
  let s = state.sessions[sid];
  if(!s){
    const p = BYID[sid];
    s = {sid, done:false, date:null, sets:{}, mig:1};
    p.ex.forEach(e=>{s.sets[e.id]=Array.from({length:e.sets},()=>({v:e.target,d:false}))});
    state.sessions[sid]=s;
  }else{
    BYID[sid].ex.forEach(e=>{
      const arr=s.sets[e.id];
      /* an unfinished, unstarted exercise still holding a set above 12 reps predates the 5–12 rule: rebuild it */
      const stale=!s.mig&&arr&&!s.done&&e.unit==="个"&&!arr.some(x=>x.d)&&arr.some(x=>+x.v>12);
      if(!arr||stale)s.sets[e.id]=Array.from({length:e.sets},()=>({v:e.target,d:false}))});
    s.mig=1;   /* the 5–12 cleanup runs once; after that a value above 12 is the user's own choice */
    /* an unfinished day keeps only the exercises in its current plan (e.g. decline push-ups removed from D5 on) */
    if(!s.done){const keep=new Set(BYID[sid].ex.map(e=>e.id));Object.keys(s.sets).forEach(k=>{if(!keep.has(k))delete s.sets[k]})}
  }
  return s;
}
