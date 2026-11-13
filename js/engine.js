/* ---------- training engine: plans the next two sessions of each kind from the last three ----------
   No AI, just rules from proven methods: double progression (add reps up to the top of the range, then make the
   exercise harder and drop back), autoregulation from how each exercise felt (easy / right / hard) and how much the
   reps fell from the first set to the last, bodyweight progression ladders, a session cap of 5–12 working sets, and a
   lighter session after two rough ones in a row. Sessions already started (a tick or an edited number) are left alone.
   Planned sessions keep their exercises in doc.ex and the reasons in doc.why (see registerPlanned in js/core.js). */
const ENG_SETS_MIN=2,ENG_SETS_MAX=4,ENG_SESSION_MIN=5,ENG_SESSION_MAX=12,ENG_LOOK=3,ENG_AHEAD=2;
/* easier → harder; each step keeps its own id, so history follows the exercise actually done */
const ENG_LADDERS=[
  [{id:"incline",name:"斜板俯卧撑",en:"Incline push-ups"},{id:"std",name:"标准俯卧撑",en:"Push-ups"},{id:"decline",name:"下斜俯卧撑",en:"Decline push-ups"},
   {id:"diamond",name:"钻石俯卧撑",en:"Diamond push-ups"},{id:"archer",name:"弓箭手俯卧撑",en:"Archer push-ups"}],
  [{id:"ecc",name:"离心引体",en:"Negative pull-ups"},{id:"pullup",name:"标准引体",en:"Strict pull-ups"}],
  [{id:"row",name:"反向划船",en:"Inverted rows"},{id:"rowft",name:"抬脚反向划船",en:"Feet-up inverted rows"}],
  [{id:"situp",name:"仰卧起坐",en:"Sit-ups"},{id:"kneeraise",name:"悬垂举膝",en:"Hanging knee raises"},{id:"legraise",name:"悬垂举腿",en:"Hanging leg raises"}],
  [{id:"pike",name:"派克俯卧撑",en:"Pike push-ups"},{id:"pikeft",name:"抬脚派克俯卧撑",en:"Feet-up pike push-ups"}],
  [{id:"squat",name:"深蹲",en:"Squats"},{id:"splitsq",name:"分腿蹲",en:"Split squats"},{id:"bulgarian",name:"保加利亚分腿蹲",en:"Bulgarian split squats"}],
  [{id:"bridge",name:"臀桥",en:"Glute bridges"},{id:"slbridge",name:"单腿臀桥",en:"Single-leg glute bridges"}]];
/* ---------- plan presets: how many training days (1–3), what each is called and what it starts with ----------
   They differ only in data: the engine treats every day the same. Kinds are push / pull / third whatever the names.
   settings.plan = {id, days:[{kind, zh, en, ex}], from}: from = the date it was chosen; sessions planned after that
   start from the preset's moves (history of the same moves still sets the numbers). */
const E=(id,name,en,unit,sets,target,extra)=>Object.assign({id,name,en,unit,sets,target},extra||{});
const STRETCH_E=E("stretch","拉伸","Stretch","分钟",1,5);
const PRESETS=[
  {id:"cyclist",zh:"打造上身薄肌：引体 + 俯卧撑",en:"Lean upper body: pull-ups + push-ups",dz:"一切为了线条利落又结实的薄肌上身：一天推、一天拉，专攻胸、肩、背和手臂。适合想快速塑形的人。",de:"Everything aimed at a lean, defined, solid upper body: push one day, pull the next, for chest, shoulders, back and arms. For shaping up fast.",
   days:[{kind:"push",zh:"推练",en:"Push",ex:[E("std","标准俯卧撑","Push-ups","个",3,10),E("decline","下斜俯卧撑","Decline push-ups","个",3,8),E("diamond","钻石俯卧撑","Diamond push-ups","个",2,8),E("plank","平板支撑","Plank","秒",2,45),E("situp","仰卧起坐","Sit-ups","个",2,12),STRETCH_E]},
         {kind:"pull",zh:"拉练",en:"Pull",ex:[E("pullup","标准引体","Strict pull-ups","个",3,3,{note:"第一个做；留 1 个余力",noteEn:"Do first; leave 1 in reserve"}),E("row","反向划船","Inverted rows","个",3,10),E("hang","悬吊","Dead hang","秒",2,30),E("ecc","离心引体","Negative pull-ups","个",2,4),STRETCH_E]}]},
  {id:"full",zh:"全身紧致：每次练遍全身",en:"Toned all over: the whole body every time",dz:"一周两三次、每次半小时左右，全身一起收紧，穿什么都更挺拔。适合时间少的人。",de:"Two or three half-hour sessions a week tighten everything at once, so whatever you wear sits better. For busy weeks.",
   days:[{kind:"push",zh:"全身",en:"Full body",ex:[E("std","标准俯卧撑","Push-ups","个",3,10),E("row","反向划船","Inverted rows","个",3,10),E("squat","深蹲","Squats","个",3,10),E("ecc","离心引体","Negative pull-ups","个",2,4),E("plank","平板支撑","Plank","秒",1,40),STRETCH_E]}]},
  {id:"upperlower",zh:"宽肩翘臀：上下肢 AB",en:"Broad shoulders, strong glutes: upper / lower",dz:"一天练宽肩和挺拔的后背，一天练结实的腿和翘臀，身材比例一起拉好。",de:"One day for broad shoulders and an upright back, the next for strong legs and glutes: proportions that work together.",
   days:[{kind:"push",zh:"上肢",en:"Upper",ex:[E("std","标准俯卧撑","Push-ups","个",3,10),E("row","反向划船","Inverted rows","个",3,10),E("pike","派克俯卧撑","Pike push-ups","个",3,8),E("ecc","离心引体","Negative pull-ups","个",2,4),STRETCH_E]},
         {kind:"pull",zh:"下肢",en:"Lower",ex:[E("squat","深蹲","Squats","个",3,10),E("splitsq","分腿蹲","Split squats","个",3,8),E("bridge","臀桥","Glute bridges","个",3,10),E("plank","平板支撑","Plank","秒",2,45),STRETCH_E]}]},
  {id:"ppl",zh:"雕刻全身线条：推 / 拉 / 腿",en:"Sculpt every line: push / pull / legs",dz:"三天轮换，每块肌肉都练到，最均衡、最完整的线条。适合一周能练三次以上、想看到明显变化的人。",de:"Three rotating days so every muscle gets its turn: the most balanced, complete shape. For three or more sessions a week and visible change.",
   days:[{kind:"push",zh:"推",en:"Push",ex:[E("std","标准俯卧撑","Push-ups","个",3,10),E("pike","派克俯卧撑","Pike push-ups","个",3,8),E("diamond","钻石俯卧撑","Diamond push-ups","个",2,8),E("plank","平板支撑","Plank","秒",2,45),STRETCH_E]},
         {kind:"pull",zh:"拉",en:"Pull",ex:[E("pullup","标准引体","Strict pull-ups","个",3,3),E("row","反向划船","Inverted rows","个",3,10),E("hang","悬吊","Dead hang","秒",2,30),E("kneeraise","悬垂举膝","Hanging knee raises","个",2,10),STRETCH_E]},
         {kind:"third",zh:"腿",en:"Legs",ex:[E("squat","深蹲","Squats","个",3,10),E("splitsq","分腿蹲","Split squats","个",3,8),E("bridge","臀桥","Glute bridges","个",3,10),E("wallsit","靠墙静蹲","Wall sit","秒",2,30),STRETCH_E]}]}];
/* the moves done so far, newest record of each: what a custom plan is built from */
function engMoves(){const out={};engDoneAll().forEach(p=>{const doc=state.sessions[p.sid];p.ex.forEach(e=>{const a=(doc.sets&&doc.sets[e.id])||[],got=a.filter(x=>x.d).map(x=>+x.v||0);if(!got.length)return;
    out[e.id]={id:e.id,name:engBase(e),en:engBaseEn(e)||engBase(e),unit:e.unit,kind:p.kind,sets:Math.max(1,a.length),target:e.target,tempo:engTempo(e),got,date:doc.date||""}})});
  return Object.values(out)}
/* every move done so far, from sessions and from extra practice (activities left out) */
function knownMoves(){const mv={};engMoves().forEach(m=>mv[m.id]=m);
  freeLog().pool.forEach(m=>{if(mv[m.id]&&mv[m.id].date>=m.last)return;const g=freeGroup(m.id);
    mv[m.id]={id:m.id,name:m.name,en:m.en,unit:m.unit,kind:g==="pull"?"pull":g==="push"?"push":"third",sets:m.sets||3,target:m.min,tempo:null,got:Array(m.sets||3).fill(m.min),date:m.last}});
  return Object.values(mv).filter(m=>!engActivity(m))}
/* a plan of the user's own: days = [{zh, en, ids:[move ids]}] (1–3); each move starts from its own last record */
function setCustomPlan(days){const mv={};knownMoves().forEach(m=>mv[m.id]=m);const lib={};PRESETS.forEach(p=>p.days.forEach(d=>d.ex.forEach(e=>{if(!lib[e.id])lib[e.id]=e})));
  const kinds=["push","pull","third"],old=state.settings.plan;
  state.settings.plan={id:"custom",days:days.map((d,i)=>({kind:kinds[i],zh:d.zh,en:d.en||d.zh,ex:d.ids.map(id=>{const m=mv[id];
      if(m)return {id,name:m.name,en:m.en,unit:m.unit,sets:Math.min(ENG_SETS_MAX,Math.max(ENG_SETS_MIN,m.sets)),target:m.target,tempo:m.tempo||null};
      const e=lib[id];return e?Object.assign({},e):null}).filter(Boolean).concat(d.ids.includes("stretch")?[]:[Object.assign({},STRETCH_E)])})),from:today()};
  Object.entries(state.sessions).forEach(([sid,doc])=>{if(doc&&!doc.done&&doc.ex&&!engStarted(doc)){delete doc.ex;doc.sets={}}});
  registerPlanned(state.sessions);engPlanAll();lsSave()}
function planKinds(){const pl=state.settings.plan;return pl&&pl.days&&pl.days.length?pl.days.map(d=>d.kind):["push","pull"]}
/* choose a preset; the cyclist plan with no plan chosen before is the programme already running, so it keeps going */
function setPlan(id){const p=PRESETS.find(x=>x.id===id);if(!p)return;const old=state.settings.plan;
  state.settings.plan={id,days:p.days.map(d=>({kind:d.kind,zh:d.zh,en:d.en,ex:d.ex.map(e=>Object.assign({},e))})),from:(!old&&id==="cyclist")?null:today()};
  /* planned sessions not started yet are redone from the new plan */
  Object.entries(state.sessions).forEach(([sid,doc])=>{if(doc&&!doc.done&&doc.ex&&!engStarted(doc)){delete doc.ex;doc.sets={}}});
  registerPlanned(state.sessions);engPlanAll();lsSave()}
const ENG_STEP={};ENG_LADDERS.forEach((l,li)=>l.forEach((x,i)=>ENG_STEP[x.id]={li,i}));
/* rep ranges: strength moves 5–10, core moves 10–15; pull-ups and negatives may start lower */
/* the main exercise (the goal move) is never swapped for another: its reps (or seconds) just keep climbing */
function engRange(e){if(typeof isMain==="function"&&isMain(e)){const r=engRange0(e);return [r[0],999]}return engRange0(e)}
function engRange0(e){if(e.unit==="秒")return [20,60];if(e.id==="bridge"||e.id==="slbridge"||e.id==="squat")return [8,15];if(e.unit==="分钟")return [e.target,e.target];
  if(e.id==="situp"||e.id==="kneeraise"||e.id==="legraise")return [10,15];if(e.id==="pullup")return [1,10];if(e.id==="ecc")return [3,8];return [5,10]}
const engBase=e=>e.name.replace(/（.*）/,""),engBaseEn=e=>(e.en||"").replace(/\s*\(.*\)/,"");
function engName(e){return {name:engBase(e)+(e.tempo?"（慢速 "+e.tempo+"）":""),en:engBaseEn(e)+(e.tempo?" (slow "+e.tempo+")":"")}}
function engDone(kind){return PROGRAM.filter(p=>p.kind===kind&&state.sessions[p.sid]&&state.sessions[p.sid].done)
  .sort((a,b)=>{const x=state.sessions[a.sid].date||"",y=state.sessions[b.sid].date||"";return x<y?-1:x>y?1:a.day-b.day})}
/* every finished session of any kind, oldest first: where a move's history is found when its own day has none
   (a custom plan can put a move on a different day than it used to be done on) */
function engDoneAll(){return ["push","pull","third"].flatMap(engDone).sort((a,b)=>{const x=state.sessions[a.sid].date||"",y=state.sessions[b.sid].date||"";return x<y?-1:x>y?1:0})}
/* a custom plan, and free training, keep the user's own moves: harder means more reps, slower, more sets, never another move */
const engCustom=()=>!!(state.settings.plan&&(state.settings.plan.id==="custom"||state.settings.plan.id==="free"));
/* one exercise's result in one finished session */
function engResult(p,id){const doc=state.sessions[p.sid],e=p.ex.find(x=>x.id===id);if(!e)return null;const a=(doc.sets&&doc.sets[id])||[];
  return {target:e.target,planned:a.length||e.sets,got:a.filter(x=>x.d).map(x=>+x.v||0),feel:doc.feel&&doc.feel[id]||null,tempo:engTempo(e)}}
/* the old programme wrote the tempo into the name */
function engTempo(e){return e.tempo||(/慢速\s*3-1-1/.test(e.name||"")?"3-1-1":null)}
const engMin=a=>a.length?Math.min(...a):0;
function engVerdict(h,lo,hi){const full=h.got.length>=h.planned&&h.got.length>0,mn=engMin(h.got);
  return {top:full&&mn>=hi,ok:full&&mn>=h.target,miss:!full||h.got.filter(v=>v<=h.target-2).length>=Math.ceil(h.planned/2),
    drop:h.got.length>=2&&h.got[0]>=5&&h.got[h.got.length-1]<h.got[0]*0.7}}
const ENG_FEEL={easy:"轻松",ok:"刚好",hard:"很难"};
function engHist(h){return h.got.length?h.got.join("·"):"没做"}
/* plan one exercise from its history (oldest first); returns the new definition and why */
function engPlanEx(e,H,inSession){
  const n=Object.assign({},e),[lo,hi]=engRange(e),last=H[H.length-1],V=H.map(h=>engVerdict(h,lo,hi)),lv=V[V.length-1];
  const say=(zh,en)=>{n.why=zh;n.whyEn=en;return n};
  if(e.unit==="分钟")return say("保持","Kept");
  if(!last)return say("还没有记录，先按这个练","No record yet; start here");
  const tops=V.filter(v=>v.top).length,misses=V.filter(v=>v.miss).length,hist=engHist(last);
  const levelUp=()=>{const st=engCustom()?null:ENG_STEP[e.id];
    if(e.unit!=="秒"&&st){const next=ENG_LADDERS[st.li][st.i+1];
      if(next&&!inSession.has(next.id)){n.id=next.id;n.name=next.name;n.en=next.en;n.tempo=null;n.note=null;n.noteEn=null;n.target=engRange(n)[0]+1;
        return say("上次 "+hist+"，到顶了，换 "+next.name,"Last time "+hist+", at the top: moving to "+next.en)}}
    if(e.unit!=="秒"&&!e.tempo&&e.id!=="pullup"){n.tempo="3-1-1";n.target=Math.max(lo,6);return say("上次 "+hist+"，到顶了，改成慢速 3-1-1","Last time "+hist+", at the top: slow 3-1-1 tempo")}
    if(e.sets<ENG_SETS_MAX){n.sets=e.sets+1;n.addSet=e.sets;n.target=e.unit==="秒"?hi:Math.max(lo,hi-3);return say("上次 "+hist+"，到顶了，加一组","Last time "+hist+", at the top: one more set")}
    n.target=hi;return say("已经是最高档，保持","Already at the top; kept")};
  const levelDown=()=>{const st=engCustom()?null:ENG_STEP[e.id];
    if(e.unit!=="秒"&&st&&st.i>0&&e.id!=="pullup"&&!isMain(e)){const prev=ENG_LADDERS[st.li][st.i-1];
      if(!inSession.has(prev.id)){n.id=prev.id;n.name=prev.name;n.en=prev.en;n.tempo=null;n.note=null;n.noteEn=null;n.target=Math.min(8,engRange(n)[1]);
        return say("最近几次没达标（"+hist+"），先退到 "+prev.name,"Missed recently ("+hist+"): back to "+prev.en)}}
    if(e.tempo){n.tempo=null;n.target=Math.min(8,hi);return say("最近几次没达标，先去掉慢速","Missed recently: normal tempo again")}
    if(e.sets>ENG_SETS_MIN){n.sets=e.sets-1;n.target=lo;return say("最近几次没达标，少一组","Missed recently: one set fewer")}
    n.target=lo;return say("最近几次没达标，回到 "+lo,"Missed recently: back to "+lo)};
  const step=e.unit==="秒"?5:1;
  if(tops>=2||(lv.top&&last.feel==="easy"))return levelUp();
  if(lv.ok&&last.feel!=="hard"&&!lv.drop){
    /* fast progress: start from the fewest reps actually done, not the old target */
    const t=Math.max(e.target,engMin(last.got))+step*(last.feel==="easy"?2:1);
    if(t>hi)return levelUp();
    n.target=t;const u=e.unit==="秒"?" 秒":" 个";return say("上次 "+hist+(last.feel?"（"+ENG_FEEL[last.feel]+"）":"")+"，下次每组 "+t+u,"Last time "+hist+": "+t+(e.unit==="秒"?" s":"")+" per set next")}
  if(misses>=2||(lv.miss&&last.feel==="hard")){const t=e.target-step;if(t<lo)return levelDown();n.target=t;return say("最近几次没达标（"+hist+"），下次每组 "+t+(e.unit==="秒"?" 秒":" 个"),"Missed recently ("+hist+"): "+t+" per set next")}
  const keep=()=>{if(lv.ok)n.target=Math.min(hi,Math.max(e.target,engMin(last.got)))};
  if(lv.drop){keep();return say("上次后面几组掉得多（"+hist+"），先保持","Reps fell off last time ("+hist+"); kept")}
  keep();return say("上次 "+hist+(last.feel==="hard"?"（很难）":"")+"，保持","Last time "+hist+"; kept")}
/* the session cap: 5–12 working sets (stretching doesn't count) */
const ENG_CORE=new Set(["situp","kneeraise","legraise","bridge","slbridge"]);
function engTrimRank(e){return isMain(e)?4:e.unit==="秒"?0:ENG_CORE.has(e.id)?1:e.id==="pullup"?3:2}
function engCap(ex){const work=ex.filter(e=>e.unit!=="分钟");let tot=work.reduce((a,e)=>a+e.sets,0);const was=new Map(work.map(e=>[e,e.sets]));
  while(tot>ENG_SESSION_MAX){const e=work.filter(x=>x.sets>ENG_SETS_MIN).sort((a,b)=>engTrimRank(a)-engTrimRank(b)||b.sets-a.sets)[0];if(!e)break;e.sets--;tot--}
  while(tot<ENG_SESSION_MIN){const e=work.find(x=>x.sets<ENG_SETS_MAX);if(!e)break;e.sets++;tot++}
  work.forEach(e=>{if(e.addSet!=null&&e.sets<=e.addSet){e.why="已经到顶，但全场最多 12 组，这项保持 "+e.sets+" 组";e.whyEn="At the top, but 12 sets a session at most: kept at "+e.sets;return}
    if(e.sets<was.get(e)){e.why=(e.why?e.why+"；":"")+"全场最多 12 组，这项排 "+e.sets+" 组";e.whyEn=(e.whyEn?e.whyEn+"; ":"")+"12 sets a session at most: "+e.sets+" here"}});
  return ex}
/* plan a session of this kind from finished history H (list of {p} oldest first) plus optional simulated results */
function engPlanSession(kind,hist,sim,base){
  base=base||engBaseFor(kind,hist);
  const inSession=new Set(base.map(e=>e.id));
  /* two rough sessions in a row (2+ exercises missed in each) → a lighter session */
  const rough=p=>p.ex.filter(e=>{const r=engResult(p,e.id);if(!r)return false;const [lo,hi]=engRange(e);return e.unit!=="分钟"&&engVerdict(r,lo,hi).miss}).length>=2;
  const deload=!sim&&hist.length>=2&&rough(hist[hist.length-1])&&rough(hist[hist.length-2]);
  let ex=base.map(e=>{
    const tp=engTempo(e);let H=engFree()?[]:hist.slice(-ENG_LOOK).map(p=>engResult(p,e.id)).filter(r=>r&&r.tempo===tp);
    if(!H.length)H=engMoveHist(e.id).filter(r=>r.tempo===tp).slice(-ENG_LOOK);
    if(sim&&sim[e.id])H.push(sim[e.id]);
    const n=engPlanEx(Object.assign({sets:e.sets},e,{tempo:tp}),H.slice(-ENG_LOOK),inSession);
    if(n.id!==e.id){inSession.delete(e.id);inSession.add(n.id)}
    Object.assign(n,engName(n));return n});
  ex=engCap(ex);
  if(deload)ex.forEach(e=>{if(e.unit!=="分钟"){e.sets=Math.max(ENG_SETS_MIN,Math.round(e.sets*0.6));e.why="连续两次多个动作没达标，这次减量恢复";e.whyEn="Two rough sessions in a row: a lighter one to recover"}});
  return ex.map(e=>({id:e.id,name:e.name,en:e.en,unit:e.unit,target:e.target,sets:e.sets,note:e.note||null,noteEn:e.noteEn||null,tempo:e.tempo||null,why:e.why,whyEn:e.whyEn}))}
function engBaseFor(kind,hist){const pl=state.settings.plan,day=pl&&pl.days&&pl.days.find(d=>d.kind===kind),last=hist[hist.length-1];
  const ld=last&&state.sessions[last.sid].date||"";
  if(day&&(!last||(pl.from&&ld<=pl.from)))return day.ex.map(e=>Object.assign({},e));
  return last?last.ex:(nextOf(kind)||PROGRAM.find(p=>p.kind===kind)).ex}
function engStarted(doc){return !!(doc&&(doc.edited||Object.values(doc.sets||{}).some(a=>a.some(x=>x.d))))}
function engWrite(sid,kind,ex){const m=/-(\d+)$/.exec(sid),day=+m[1];
  let doc=state.sessions[sid];if(!doc){doc=state.sessions[sid]={sid,done:false,date:null,sets:{},mig:1}}
  doc.ex=ex;doc.sets={};ex.forEach(e=>{doc.sets[e.id]=Array.from({length:e.sets},()=>({v:e.target,d:false}))});
  registerPlanned({[sid]:doc})}
/* plan the next two of each kind; returns true when anything changed */
/* ---------- free training: no plan picked ----------
   The suggestion grows out of whatever the user logs (sessions and extra practice alike): every strength move of the
   last 3 weeks is in a pool (walking, cycling and the like are kept as records but never suggested); a session takes
   as many moves as the user usually does, at least 2 and 5 sets, the body part trained longest ago first, the same move
   not two days running; each move carries on from its own last record. Only one move so far: one from another part is
   added. settings.plan = {id:"free", days:[one day]}; a new user who never picked a plan is on it. */
const FREE_GROUP={std:"push",decline:"push",diamond:"push",archer:"push",incline:"push",pike:"push",pikeft:"push",pushup:"push",
  pullup:"pull",row:"pull",rowft:"pull",ecc:"pull",hang:"pull",squat:"legs",splitsq:"legs",bulgarian:"legs",bridge:"legs",slbridge:"legs",wallsit:"legs",
  plank:"core",situp:"core",kneeraise:"core",legraise:"core"};
const freeGroup=id=>FREE_GROUP[id]||id;
const FREE_GROUP_NAME={push:["推","Push"],pull:["拉","Pull"],legs:["腿","Legs"],core:["核心","Core"]};
const FREE_STARTERS={core:E("plank","平板支撑","Plank","秒",2,30),legs:E("squat","深蹲","Squats","个",3,10),pull:E("row","反向划船","Inverted rows","个",3,8),push:E("std","标准俯卧撑","Push-ups","个",3,8)};
const engActivity=m=>m.unit==="分钟"||m.unit==="km"||/散步|走路|步行|跑步|慢跑|骑|游泳|徒步|爬山|walk|run|jog|ride|cycl|bike|swim|hike/i.test((m.name||"")+" "+(m.en||""));
function engFree(){const pl=state.settings.plan;return !!(pl&&pl.id==="free")}
function freePlanDoc(){return {id:"free",days:[{kind:"push",zh:"自由练",en:"Free training",ex:[]}],from:today()}}
function setFreePlan(){state.settings.plan=freePlanDoc();
  Object.entries(state.sessions).forEach(([sid,doc])=>{if(doc&&!doc.done&&doc.ex&&!engStarted(doc)){delete doc.ex;doc.sets={}}});
  registerPlanned(state.sessions);engPlanAll();lsSave()}
/* one move's results, oldest first, from finished sessions and from extra practice */
function engMoveHist(id){const out=[];
  engDoneAll().forEach(p=>{const r=engResult(p,id);if(r&&r.got.length)out.push([state.sessions[p.sid].date||"",r])});
  const xs=(d,items)=>(items||[]).forEach(it=>{if(it.id!==id)return;const got=it.sets.filter(x=>x.d).map(x=>+x.v||0);if(got.length)out.push([d,{target:Math.min(...got),planned:got.length,got,feel:null,tempo:null}])});
  Object.values(state.sessions).forEach(s=>{if(s&&s.date)xs(s.date,s.xs)});Object.values(state.dayx||{}).forEach(x=>{if(x&&x.date)xs(x.date,x.xs)});
  return out.sort((a,b)=>a[0]<b[0]?-1:a[0]>b[0]?1:0).map(x=>x[1])}
/* the strength moves of the last 3 weeks, each with its newest record, and which moves each day had */
function freeLog(){const cut=ymdAdd(today(),-21),mv={},days={};
  const note=(id,name,en,unit,d,got,sets)=>{if(!d||d<cut)return;const m={id,name,en:en||name,unit};if(engActivity(m)||m.unit==="分钟")return;
    const o=mv[id]=mv[id]||Object.assign(m,{last:"",n:0});if(d>=o.last){o.last=d;o.name=name;o.en=en||name;o.unit=unit;o.sets=sets;o.min=Math.min(...got)}o.n++;(days[d]=days[d]||new Set()).add(id)};
  engDoneAll().forEach(p=>{const doc=state.sessions[p.sid];p.ex.forEach(e=>{const a=(doc.sets&&doc.sets[e.id])||[],got=a.filter(x=>x.d).map(x=>+x.v||0);if(got.length)note(e.id,engBase(e),engBaseEn(e),e.unit,doc.date,got,a.length)})});
  const xs=(d,items)=>(items||[]).forEach(it=>{const got=it.sets.filter(x=>x.d).map(x=>+x.v||0);if(got.length)note(it.id,typeof xName==="function"?xName(it):it.name,it.name,it.unit,d,got,got.length)});
  Object.values(state.sessions).forEach(s=>{if(s&&s.date)xs(s.date,s.xs)});Object.values(state.dayx||{}).forEach(x=>{if(x&&x.date)xs(x.date,x.xs)});
  return {pool:Object.values(mv),days}}
/* the moves for one free session; virtual = moves already planned in the sessions before it (treated as done then) */
function freeBase(virtual){virtual=virtual||{};const t=today(),{pool,days}=freeLog(),dn=d=>dnum(d);
  const recent=Object.keys(days).sort().slice(-3).map(d=>days[d].size).sort((a,b)=>a-b),med=recent.length?recent[Math.floor(recent.length/2)]:2;
  const n=Math.max(2,Math.min(5,med));
  const last=m=>virtual[m.id]||m.last,gLast={};pool.forEach(m=>{const g=freeGroup(m.id),l=last(m);if(!gLast[g]||l>gLast[g])gLast[g]=l});
  Object.keys(virtual).forEach(id=>{const g=freeGroup(id);if(!gLast[g]||virtual[id]>gLast[g])gLast[g]=virtual[id]});
  const ref=Object.values(virtual).sort().pop()||t,since=d=>dn(ref)-dn(d);
  const score=m=>since(gLast[freeGroup(m.id)])*10+since(last(m))-(since(last(m))<1?100:0);
  /* the part trained longest ago comes first, with all its moves; then the next part */
  const pick=pool.filter(m=>score(m)>-50).sort((a,b)=>score(b)-score(a)).slice(0,n);
  const ex=pick.map(m=>({id:m.id,name:m.name,en:m.en,unit:m.unit,sets:Math.min(ENG_SETS_MAX,Math.max(ENG_SETS_MIN,m.sets||3)),target:Math.max(1,m.min||1)}));
  /* nothing logged at all: the three most common first moves */
  if(!pool.length)return ["push","legs","core"].map(g=>Object.assign({},FREE_STARTERS[g])).concat([Object.assign({},STRETCH_E)]);
  /* too little: add a move for a part not trained yet */
  for(const g of ["core","legs","pull","push"]){if(ex.length>=2)break;if(ex.some(e=>freeGroup(e.id)===g)||pool.some(m=>freeGroup(m.id)===g&&since(last(m))<1))continue;ex.push(Object.assign({},FREE_STARTERS[g]))}
  if(ex.length<2)for(const g of ["core","legs","pull","push"]){if(ex.length>=2)break;if(!ex.some(e=>freeGroup(e.id)===g))ex.push(Object.assign({},FREE_STARTERS[g]))}
  return ex.concat([Object.assign({},STRETCH_E)])}
/* once the free log has settled into a pattern (the last 6 training days fall into 2–3 recurring kinds of day),
   offer to keep it as the user's own plan */
function freePattern(){if(!engFree())return null;const {days}=freeLog(),ds=Object.keys(days).sort().slice(-6);if(ds.length<6)return null;
  const sig=d=>[...new Set([...days[d]].map(freeGroup))].sort().join("+"),cnt={};ds.forEach(d=>{const k=sig(d);cnt[k]=(cnt[k]||0)+1});
  const keys=Object.keys(cnt).filter(k=>cnt[k]>=2);const cover=keys.reduce((a,k)=>a+cnt[k],0);
  if(keys.length<2||keys.length>3||cover<5)return null;
  const groups=keys.map(k=>k.split("+")),id=keys.sort().join("|");if(state.settings.freeHintOff===id)return null;
  return {id,groups:groups.sort((a,b)=>a.join()<b.join()?-1:1)}}
function engPlanAll(){let changed=false;
  /* a new user who never picked a plan trains free */
  if(!state.settings.plan&&!Object.values(state.sessions).some(s=>s&&s.done))state.settings.plan=freePlanDoc();
  if(engFree()){const kind="push",hist=engDone(kind),virtual={};let d=hist.length?Math.max(...hist.map(p=>p.day)):0,sim=null;
    for(let k=0;k<ENG_AHEAD;k++){d++;const sid=kind+"-"+pad(d),doc=state.sessions[sid],when=ymdAdd(today(),k+1);
      if(engStarted(doc)){BYID[sid].ex.forEach(e=>virtual[e.id]=when);continue}
      const ex=engPlanSession(kind,hist,sim,freeBase(virtual));
      const before=doc&&doc.ex?JSON.stringify(doc.ex):"";if(JSON.stringify(ex)!==before){engWrite(sid,kind,ex);changed=true}
      ex.forEach(e=>virtual[e.id]=when);sim={};ex.forEach(e=>sim[e.id]={target:e.target,planned:e.sets,got:Array(e.sets).fill(e.target),feel:null})}
    if(changed)lsSave();return changed}
  planKinds().forEach(kind=>{
    const hist=engDone(kind),lastDay=hist.length?Math.max(...hist.map(p=>p.day)):0;
    let d=lastDay,sim=null,base=null;
    for(let k=0;k<ENG_AHEAD;k++){d++;const sid=kind+"-"+pad(d),doc=state.sessions[sid];
      if(engStarted(doc)){/* in progress: leave it, and plan the next one as if it goes to plan */
        const p=BYID[sid];base=p.ex;sim={};p.ex.forEach(e=>sim[e.id]={target:e.target,planned:e.sets,got:Array(e.sets).fill(e.target),feel:null});continue}
      const ex=engPlanSession(kind,hist,sim,base);base=ex;
      const before=doc&&doc.ex?JSON.stringify(doc.ex):"";if(JSON.stringify(ex)!==before){engWrite(sid,kind,ex);changed=true}
      sim={};ex.forEach(e=>sim[e.id]={target:e.target,planned:e.sets,got:Array(e.sets).fill(e.target),feel:null});
      }
  });
  if(changed)lsSave();
  return changed}
