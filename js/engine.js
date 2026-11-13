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
  [{id:"situp",name:"仰卧起坐",en:"Sit-ups"},{id:"kneeraise",name:"悬垂举膝",en:"Hanging knee raises"},{id:"legraise",name:"悬垂举腿",en:"Hanging leg raises"}]];
const ENG_STEP={};ENG_LADDERS.forEach((l,li)=>l.forEach((x,i)=>ENG_STEP[x.id]={li,i}));
/* rep ranges: strength moves 5–10, core moves 10–15; pull-ups and negatives may start lower */
function engRange(e){if(e.unit==="秒")return [20,60];if(e.unit==="分钟")return [e.target,e.target];
  if(e.id==="situp"||e.id==="kneeraise"||e.id==="legraise")return [10,15];if(e.id==="pullup")return [1,10];if(e.id==="ecc")return [3,8];return [5,10]}
const engBase=e=>e.name.replace(/（.*）/,""),engBaseEn=e=>(e.en||"").replace(/\s*\(.*\)/,"");
function engName(e){return {name:engBase(e)+(e.tempo?"（慢速 "+e.tempo+"）":""),en:engBaseEn(e)+(e.tempo?" (slow "+e.tempo+")":"")}}
function engDone(kind){return PROGRAM.filter(p=>p.kind===kind&&state.sessions[p.sid]&&state.sessions[p.sid].done)
  .sort((a,b)=>{const x=state.sessions[a.sid].date||"",y=state.sessions[b.sid].date||"";return x<y?-1:x>y?1:a.day-b.day})}
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
  const levelUp=()=>{const st=ENG_STEP[e.id];
    if(e.unit!=="秒"&&st){const next=ENG_LADDERS[st.li][st.i+1];
      if(next&&!inSession.has(next.id)){n.id=next.id;n.name=next.name;n.en=next.en;n.tempo=null;n.note=null;n.noteEn=null;n.target=engRange(n)[0]+1;
        return say("上次 "+hist+"，到顶了，换 "+next.name,"Last time "+hist+", at the top: moving to "+next.en)}}
    if(e.unit!=="秒"&&!e.tempo&&e.id!=="pullup"){n.tempo="3-1-1";n.target=Math.max(lo,6);return say("上次 "+hist+"，到顶了，改成慢速 3-1-1","Last time "+hist+", at the top: slow 3-1-1 tempo")}
    if(e.sets<ENG_SETS_MAX){n.sets=e.sets+1;n.addSet=e.sets;n.target=e.unit==="秒"?hi:Math.max(lo,hi-3);return say("上次 "+hist+"，到顶了，加一组","Last time "+hist+", at the top: one more set")}
    n.target=hi;return say("已经是最高档，保持","Already at the top; kept")};
  const levelDown=()=>{const st=ENG_STEP[e.id];
    if(e.unit!=="秒"&&st&&st.i>0&&e.id!=="pullup"){const prev=ENG_LADDERS[st.li][st.i-1];
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
const ENG_CORE=new Set(["situp","kneeraise","legraise"]);
function engTrimRank(e){return e.unit==="秒"?0:ENG_CORE.has(e.id)?1:e.id==="pullup"?3:2}
function engCap(ex){const work=ex.filter(e=>e.unit!=="分钟");let tot=work.reduce((a,e)=>a+e.sets,0);const was=new Map(work.map(e=>[e,e.sets]));
  while(tot>ENG_SESSION_MAX){const e=work.filter(x=>x.sets>ENG_SETS_MIN).sort((a,b)=>engTrimRank(a)-engTrimRank(b)||b.sets-a.sets)[0];if(!e)break;e.sets--;tot--}
  while(tot<ENG_SESSION_MIN){const e=work.find(x=>x.sets<ENG_SETS_MAX);if(!e)break;e.sets++;tot++}
  work.forEach(e=>{if(e.addSet!=null&&e.sets<=e.addSet){e.why="已经到顶，但全场最多 12 组，这项保持 "+e.sets+" 组";e.whyEn="At the top, but 12 sets a session at most: kept at "+e.sets;return}
    if(e.sets<was.get(e)){e.why=(e.why?e.why+"；":"")+"全场最多 12 组，这项排 "+e.sets+" 组";e.whyEn=(e.whyEn?e.whyEn+"; ":"")+"12 sets a session at most: "+e.sets+" here"}});
  return ex}
/* plan a session of this kind from finished history H (list of {p} oldest first) plus optional simulated results */
function engPlanSession(kind,hist,sim,base){
  base=base||(hist.length?hist[hist.length-1].ex:(nextOf(kind)||PROGRAM.find(p=>p.kind===kind)).ex);
  const inSession=new Set(base.map(e=>e.id));
  /* two rough sessions in a row (2+ exercises missed in each) → a lighter session */
  const rough=p=>p.ex.filter(e=>{const r=engResult(p,e.id);if(!r)return false;const [lo,hi]=engRange(e);return e.unit!=="分钟"&&engVerdict(r,lo,hi).miss}).length>=2;
  const deload=!sim&&hist.length>=2&&rough(hist[hist.length-1])&&rough(hist[hist.length-2]);
  let ex=base.map(e=>{
    const tp=engTempo(e),H=hist.slice(-ENG_LOOK).map(p=>engResult(p,e.id)).filter(r=>r&&r.tempo===tp);
    if(sim&&sim[e.id])H.push(sim[e.id]);
    const n=engPlanEx(Object.assign({sets:e.sets},e,{tempo:tp}),H.slice(-ENG_LOOK),inSession);
    if(n.id!==e.id){inSession.delete(e.id);inSession.add(n.id)}
    Object.assign(n,engName(n));return n});
  ex=engCap(ex);
  if(deload)ex.forEach(e=>{if(e.unit!=="分钟"){e.sets=Math.max(ENG_SETS_MIN,Math.round(e.sets*0.6));e.why="连续两次多个动作没达标，这次减量恢复";e.whyEn="Two rough sessions in a row: a lighter one to recover"}});
  return ex.map(e=>({id:e.id,name:e.name,en:e.en,unit:e.unit,target:e.target,sets:e.sets,note:e.note||null,noteEn:e.noteEn||null,tempo:e.tempo||null,why:e.why,whyEn:e.whyEn}))}
function engStarted(doc){return !!(doc&&(doc.edited||Object.values(doc.sets||{}).some(a=>a.some(x=>x.d))))}
function engWrite(sid,kind,ex){const m=/-(\d+)$/.exec(sid),day=+m[1];
  let doc=state.sessions[sid];if(!doc){doc=state.sessions[sid]={sid,done:false,date:null,sets:{},mig:1}}
  doc.ex=ex;doc.sets={};ex.forEach(e=>{doc.sets[e.id]=Array.from({length:e.sets},()=>({v:e.target,d:false}))});
  registerPlanned({[sid]:doc})}
/* plan the next two of each kind; returns true when anything changed */
function engPlanAll(){let changed=false;
  ["push","pull"].forEach(kind=>{
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
