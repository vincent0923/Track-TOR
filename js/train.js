/* ---------- training pane ---------- */
function currentSid(){const s=PROGRAM.find(p=>!(state.sessions[p.sid]&&state.sessions[p.sid].done));return s?s.sid:null}
const CHECK='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5" fill="none" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>';

function sessionProgress(sid){
  const s=state.sessions[sid]; if(!s) return [0,BYID[sid].ex.reduce((a,e)=>a+e.sets,0)];
  let d=0,n=0; Object.values(s.sets).forEach(arr=>arr.forEach(x=>{n++;if(x.d)d++}));
  return [d,n];
}

let autoOpened=false, finishing=false;
/* list icon with arrows: outward = expand all, inward = collapse all (the button shows the action it will do) */
const LIST_BASE='<circle cx="3.2" cy="6" r="1.4"/><circle cx="3.2" cy="12" r="1.4"/><circle cx="3.2" cy="18" r="1.4"/><rect x="6.8" y="4.6" width="9" height="2.8" rx="1.4"/><rect x="6.8" y="10.6" width="9" height="2.8" rx="1.4"/><rect x="6.8" y="16.6" width="9" height="2.8" rx="1.4"/>';
const svgList=arrows=>'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+LIST_BASE+arrows+'</svg>';
/* ---------- extra practice: lives inside each session's panel, separate from its program sets ---------- */
const XPULL="pullup";
function xName(it){return it.id===XPULL?T("引体向上","Pull-ups"):it.name}
/* extras live in a session (key = sid) or, on a day without a session, in state.dayx (key = "d:YYYY-MM-DD") */
function xDoc(key){
  if(key.startsWith("d:")){const d=key.slice(2);return state.dayx[d]||(state.dayx[d]={date:d,xs:null})}
  return sessionDoc(key);
}
function xDocs(){return Object.values(state.sessions).concat(Object.values(state.dayx||{}))}
function xLastValue(id){
  const docs=xDocs().filter(s=>s&&s.xs).sort((a,b)=>(a.date||"9")<(b.date||"9")?1:-1);
  for(const doc of docs){
    const it=doc.xs.find(y=>y.id===id);
    const sets=it?it.sets.filter(x=>x.d):[];
    if(sets.length)return +sets[sets.length-1].v||0;
  }
  return null;
}
function xNew(id,name,unit){const v=xLastValue(id);return {id,name,unit,sets:[{v:v!=null?v:(id===XPULL?1:10),d:false}]}}
/* a session with nothing saved shows pull-ups by default; it is only stored once something changes */
function xList(s){return (s&&s.xs)||[xNew(XPULL,"引体向上","个")]}
function xEdit(sid){const s=xDoc(sid);if(!s.xs)s.xs=xList(s);return s.xs}
function xSummary(list){
  return list.map(it=>{const sets=it.sets.filter(x=>x.d);if(!sets.length)return "";
    const sum=sets.reduce((a,x)=>a+(+x.v||0),0);
    return xName(it)+T(" "+sets.length+" 组 共 "+sum+" "+it.unit," "+sets.length+" sets, "+sum+" "+U(it.unit))}).filter(Boolean).join(" · ");
}
/* v1.02a kept extras by date: move each day into the session done that day, else the latest one before it, else the next one */
function moveDatedExtras(byDate){
  let moved=false;
  Object.keys(byDate||{}).sort().forEach(d=>{
    const items=byDate[d].filter(it=>it.sets.some(x=>x.d));
    if(!items.length)return;
    const done=PROGRAM.filter(p=>{const s=state.sessions[p.sid];return s&&s.done&&s.date&&s.date<=d}).sort((x,y)=>state.sessions[x.sid].date<state.sessions[y.sid].date?-1:1);
    const same=done.filter(p=>state.sessions[p.sid].date===d);
    const sid=same.length?same[0].sid:done.length?done[done.length-1].sid:(currentSid()||PROGRAM[PROGRAM.length-1].sid);
    const doc=sessionDoc(sid);
    doc.xs=doc.xs||[];
    items.forEach(it=>{const have=doc.xs.find(y=>y.id===it.id);if(have)have.sets.push(...it.sets);else doc.xs.push(it)});
    moved=true;
  });
  return moved;
}
/* "max pull-ups" over time. On any day it is the larger of two numbers:
   - the latest number logged by hand (a later, lower entry replaces an earlier one, so a tested step back shows);
   - the best single pull-up set in the three most recent pull days (the programme's strict pull-ups and any pull-ups
     added to those sessions).
   Pull-ups done as extra practice on other days are casual sets and are left out. A point is drawn on every day
   that has a manual entry or a pull day. */
function pullSeries(){
  const manual={}, pull={};
  Object.values(state.metrics).forEach(m=>{if(m.date&&m.pullups!=null)manual[m.date]=+m.pullups});
  Object.entries(state.sessions).forEach(([sid,s])=>{
    if(!s||!BYID[sid]||BYID[sid].kind!=="pull")return;
    const it=s.xs&&s.xs.find(y=>y.id===XPULL), sets=((s.sets&&s.sets[XPULL])||[]).concat(it?it.sets:[]);
    const top=Math.max(0,...sets.filter(x=>x.d).map(x=>+x.v||0));
    if(!s.done&&!top)return;
    const d=s.date||today();pull[d]=Math.max(pull[d]||0,top);
  });
  const days=[...new Set(Object.keys(manual).concat(Object.keys(pull)))].sort(), out=[], last3=[];
  let man=null;
  days.forEach(d=>{
    if(manual[d]!=null)man=manual[d];
    if(pull[d]!=null){last3.push(pull[d]);if(last3.length>3)last3.shift()}
    const y=Math.max(man==null?0:man,...last3);
    if(y>0||man!=null)out.push({date:d,x:dnum(d),y});
  });
  return out;
}
/* locked: a past day's extras are read-only until "Edit record"; today's stay open until midnight */
function extraBlock(sid,s,locked){
  const list=xList(s).filter(it=>!locked||it.sets.some(x=>x.d)), D=' data-sid="'+sid+'"', dis=locked?' disabled':'';
  let h='<div class="xblock"><h3>'+T("加练","Extra practice")+'</h3>';
  list.forEach((it,k)=>{
    const done=it.sets.filter(x=>x.d), total=done.reduce((a,x)=>a+(+x.v||0),0), lab=esc(xName(it));
    h+='<div class="ex"><div class="xhead"><h3>'+lab+'</h3><small>'+(done.length?T("共 "+total+" "+it.unit,"Total "+total+" "+U(it.unit)):"")+'</small>'
      +(locked?'':'<button class="x" data-xa="delex"'+D+' data-k="'+k+'" aria-label="'+T("移除 ","Remove ")+lab+'">×</button>')+'</div>';
    it.sets.forEach((x,i)=>{
      const no=i+1, ds=D+' data-k="'+k+'" data-i="'+i+'"';
      h+='<div class="set'+(x.d?" ticked":"")+'">'
        +'<button class="chk" data-xa="tick"'+ds+' aria-label="'+T('第 '+no+' 组完成','Set '+no+' done')+'" aria-pressed="'+x.d+'"'+dis+'>'+CHECK+'</button>'
        +'<div class="step"><button data-xa="dec"'+ds+' aria-label="'+T("减少","Decrease")+'"'+dis+'>−</button>'
        +'<input type="number" inputmode="numeric" value="'+x.v+'" data-xa="val"'+ds+' aria-label="'+lab+' '+T('第 '+no+' 组','set '+no)+'"'+dis+'>'
        +'<button data-xa="inc"'+ds+' aria-label="'+T("增加","Increase")+'"'+dis+'>+</button></div>'
        +'<span class="lab">'+U(it.unit)+'<em>'+T('第 '+no+' 组','set '+no)+'</em></span>'
        +(it.sets.length>1&&!locked?'<button class="x" data-xa="rmset"'+ds+' aria-label="'+T("删除这一组","Remove set")+'">×</button>':'')
        +'</div>';
    });
    if(!locked)h+='<button class="rk rk-plus addset" data-xa="addset"'+D+' data-k="'+k+'" aria-label="'+T('加一组','Add set')+'" title="'+T('加一组','Add set')+'"></button>';
    h+='</div>';
  });
  if(locked)return list.length?h+'</div>':'';
  const past=new Map();
  if(!list.some(it=>it.id===XPULL))past.set(XPULL,{id:XPULL,name:"引体向上",unit:"个"});
  xDocs().forEach(doc=>((doc&&doc.xs)||[]).forEach(it=>{
    if(!past.has(it.id)&&!list.some(y=>y.id===it.id))past.set(it.id,it)}));
  h+='<div class="xadd"><div class="xadd-row">'
    +'<input id="xName-'+sid+'" type="text" aria-label="'+T("项目名称","Exercise name")+'" placeholder="'+T("其他项目，如 俯卧撑","Other, e.g. push-ups")+'">'
    +'<select id="xUnit-'+sid+'" aria-label="'+T("单位","Unit")+'"><option value="个">'+U("个")+'</option><option value="秒">'+U("秒")+'</option><option value="分钟">'+U("分钟")+'</option></select>'
    +'<button class="rk rk-plus" data-xa="addex"'+D+' aria-label="'+T("添加","Add")+'" title="'+T("添加","Add")+'"></button></div>';
  if(past.size){
    h+='<div class="xchips">';
    past.forEach(it=>{h+='<button class="tbtn xchip" data-xa="chip"'+D+' data-id="'+esc(it.id)+'" data-name="'+esc(it.name)+'" data-unit="'+esc(it.unit)+'"><i class="rk rk-plus" aria-hidden="true"></i>'+esc(xName(it))+'</button>'});
    h+='</div>';
  }
  return h+'</div></div>';
}
function extraSaved(){lsSave();renderGoals()}
function extraAct(t){
  const a=t.dataset.xa, sid=t.dataset.sid, k=+t.dataset.k, i=+t.dataset.i;
  if(t.disabled)return;
  if(a==="val")return;
  if(a==="addex"||a==="chip"){
    const inp=document.getElementById("xName-"+sid);
    const name=a==="chip"?t.dataset.name:inp.value.trim();
    if(!name){toast(T("先填项目名称","Enter an exercise name first"));return}
    const id=a==="chip"?t.dataset.id:(/^引体(向上)?$/.test(name)?XPULL:"c:"+name);
    const unit=a==="chip"?t.dataset.unit:document.getElementById("xUnit-"+sid).value;
    const list=xEdit(sid);
    if(list.some(y=>y.id===id)){toast(T("这个项目已经在了","That exercise is already here"));return}
    list.push(xNew(id,name,unit));extraSaved();renderTrain();return}
  const list=xEdit(sid), it=list[k];
  if(!it)return;
  if(a==="delex"){list.splice(k,1);extraSaved();renderTrain();return}
  if(a==="addset"){const last=it.sets[it.sets.length-1];it.sets.push({v:last?last.v:1,d:false});extraSaved();renderTrain();return}
  const x=it.sets[i];
  if(!x)return;
  if(a==="rmset"){it.sets.splice(i,1);extraSaved();renderTrain();return}
  if(a==="tick"){x.d=!x.d;extraSaved();renderTrain();if(x.d)fireworks(1,0);return}
  if(a==="inc"||a==="dec"){
    const step=it.unit==="秒"?5:1;
    x.v=Math.max(0,(+x.v||0)+(a==="inc"?step:-step));
    t.parentNode.querySelector("input").value=x.v;
    extraSaved();
    if(x.d)renderTrain();
  }
}

/* the training tab: a month calendar of trained days on top (tap a day to see it and log extra practice),
   then only the next five unfinished sessions */
const EDIT_ICON='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 20h4L19 9a2.1 2.1 0 0 0-3-3L5 17z"/><path d="M14 20h6"/></svg>';
const editBtn=attrs=>'<button class="btn recedit" '+attrs+' aria-label="'+T('修改记录','Edit record')+'" title="'+T('修改记录','Edit record')+'">'+EDIT_ICON+'</button>';
/* sel: the chosen day (ringed, its finished sessions listed); panel: whether that day's extra-practice panel is open */
const calState={month:null, sel:null, panel:false};
const dxUnlocked=new Set();
function dayLocked(d){return d<today()&&!dxUnlocked.has(d)}
/* wear and tear: more than two days without training and every look starts to show it (webs, rust, static,
   cracks...). Last training = a finished session, a day with ticked extra practice, or a ticked set today in a
   session not finished yet. Never trained at all: no wear. 3-4 days = 1, 5-7 = 2, 8+ = 3. */
function lastTrainedDay(){let last="";const td=today();
  Object.values(state.sessions).forEach(s=>{if(!s)return;if(s.done&&s.date&&s.date>last)last=s.date;
    if(!s.done&&s.sets&&Object.values(s.sets).some(a=>a.some(x=>x.d)))last=td});
  Object.entries(state.dayx||{}).forEach(([d,x])=>{if(d>last&&x&&x.xs&&x.xs.some(it=>it.sets.some(y=>y.d)))last=d});
  return last}
function updateWear(){const last=lastTrainedDay(),r=document.documentElement;
  const gap=last?Math.round(dnum(today())-dnum(last)):0;let lv=gap>=8?3:gap>=5?2:gap>=3?1:0;
  /* Profile › Theme can force a level to try the look on */
  let f=0;try{f=+localStorage.getItem(LS+"-wear")||0}catch(e){}if(f>=1&&f<=3)lv=f;
  if(lv)r.setAttribute("data-wear",String(lv));else r.removeAttribute("data-wear")}
function dayHas(d){
  const kinds=PROGRAM.filter(p=>{const s=state.sessions[p.sid];return s&&s.done&&s.date===d}).map(p=>p.kind);
  const dx=state.dayx&&state.dayx[d], x=!!(dx&&((dx.xs&&dx.xs.some(it=>it.sets.some(y=>y.d)))||(dx.note&&dx.note.trim())));
  return {push:kinds.includes("push"),pull:kinds.includes("pull"),x};
}
const CAL_FOLD_K=LS+"-calfold";
try{calState.fold=localStorage.getItem(CAL_FOLD_K)==="1"}catch(e){}
/* month calendar: trained days are filled circles (push orange, pull blue, both split, extra only green),
   today burns green, the chosen day gets a ring; the +/− square folds the grid away */
/* the calendar mark inside the Today button: a calendar with a clock; the toy, retro and craft looks use their own set's calendar */
const CAL_IC='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 7.5V6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h3.5"/><path d="M16 2v4M8 2v4M3 10h5"/><path d="M17.5 17.5 16 16.3V14"/><circle cx="16" cy="16" r="6"/></svg>';
function calendarHtml(){
  const td=today(), m=calState.month||td.slice(0,7);
  const [y,mo]=m.split("-").map(Number), first=new Date(y,mo-1,1), days=new Date(y,mo,0).getDate();
  const lead=(first.getDay()+6)%7;                     /* weeks start on Monday */
  const prevDays=new Date(y,mo-1,0).getDate(), cells=Math.ceil((lead+days)/7)*7;
  const wk=T("一二三四五六日","MTWTFSS").split(""), fold=!!calState.fold;
  const mname=T(mo+"月",new Date(y,mo-1,1).toLocaleString("en",{month:"short"}).toUpperCase());
  /* banner, left to right: fold button · previous month · month (tap also folds) · next month · today */
  const ft=fold?T("展开日历","Show calendar"):T("收起日历","Hide calendar");
  let h='<section class="cal'+(fold?" folded":"")+'" aria-label="'+T("训练日历","Training calendar")+'"><div class="calh">'
    +'<button type="button" class="calfold rk" data-cal-fold aria-expanded="'+!fold+'" aria-label="'+ft+'"></button>'
    +'<div class="calmon"><button type="button" class="calnav" data-cal-nav="-1" aria-label="'+T("上个月","Previous month")+'">‹</button>'
    +'<button type="button" class="caltitle" data-cal-fold aria-expanded="'+!fold+'" aria-label="'+mname+' '+y+'，'+ft+'"><span class="calmy"><b>'+mname+'</b><small>'+y+'</small></span></button>'
    +'<button type="button" class="calnav" data-cal-nav="1" aria-label="'+T("下个月","Next month")+'"'+(m>=td.slice(0,7)?" disabled":"")+'>›</button></div>'
    +'<button type="button" class="caltoday" data-cal-today aria-label="'+T("今天：点一下定位，长按打开加练","Today: tap to jump there, hold to add extra practice")+'"><span class="calic">'+(skinIc("cal")||CAL_IC)+'</span>'+T("今天","Today")+'</button>'
    +'</div>';
  if(fold)return h+'</section>';
  h+='<div class="calg">'+wk.map(w=>'<span class="calw">'+w+'</span>').join("");
  for(let c=0;c<cells;c++){
    const i=c-lead+1;
    if(i<1||i>days){h+='<span class="cald out">'+(i<1?prevDays+i:i-days)+'</span>';continue}
    const d=m+"-"+pad(i), f=dayHas(d), fut=d>td, ses=f.push||f.pull;
    const fill=(f.push&&f.pull?" both":f.push?" push":f.pull?" pull":f.x?" xonly":"")+(ses&&f.x?" wx":"");
    h+='<button type="button" class="cald'+fill+(d===td?" today":"")+(d===calState.sel?" sel":"")+'" data-cal="'+d+'"'+(fut?" disabled":"")
      +' aria-pressed="'+(d===calState.sel)+'" aria-label="'+md(d)+'">'+i
      +'<span class="calm">'+(f.push?'<i class="push"></i>':'')+(f.pull?'<i class="pull"></i>':'')+(f.x?'<i class="xp'+(ses?' badge':'')+'"></i>':'')+'</span></button>';
  }
  return h+'</div></section>';
}
function cardHtml(p,cur){
  const s=state.sessions[p.sid];
  const done=!!(s&&s.done);
  const isCur=p.sid===cur;
  const [d,n]=sessionProgress(p.sid);
  const avail=isAvail(p.sid);
  const pill = done?'<span class="pill done">✓ '+(s.date?md(s.date):T("已完成","Done"))+'</span>':isCur?'<span class="pill now">'+T("下一次","Next")+'</span>':avail?'<span class="pill now">'+T("可练","Ready")+'</span>':'<span class="pill later">'+LOCK+T("未解锁","Locked")+'</span>';
  const isOpen=openDays.has(p.sid);
  let html='<article class="card '+p.kind+(done?" isdone":"")+(avail?"":" future")+'" id="c-'+p.sid+'">'
    +'<button class="shead" data-toggle="'+p.sid+'" aria-expanded="'+isOpen+'">'
    +'<span class="tag">'+LAB(p)+'</span>'
    +'<span class="meta">'+p.ex.filter(e=>e.id!=="stretch").map(NS).join(" · ")
    +(s&&s.xs&&xSummary(s.xs)?'<span class="xsum">'+T("加练：","Extra: ")+esc(xSummary(s.xs))+'</span>':'')
    +'<div class="prog"><i style="width:'+(n?Math.round(d/n*100):0)+'%"></i></div></span>'+pill+'</button>';
  if(isOpen) html+=sessionBody(p);
  return html+'</article>';
}
function renderTrain(){
  updateWear();
  const pane=document.getElementById("pane-train");
  const cur=currentSid();
  let html=calendarHtml();
  /* the chosen day: sessions finished that day (or being edited), then that day's own extra practice */
  const sel=calState.sel;
  if(sel){
    html+='<section class="calday">';
    PROGRAM.filter(p=>{const s=state.sessions[p.sid];return s&&s.done&&(s.date===sel||unlocked.has(p.sid))}).forEach(p=>{html+=cardHtml(p,cur)});
    if(calState.panel){
    const dn=(state.dayx[sel]&&state.dayx[sel].note)||"", dl=dayLocked(sel);
    html+='<article class="card dayx"><div class="sbody'+(dl?' locked':'')+'">'+extraBlock("d:"+sel,state.dayx[sel],dl)
      +'<div class="field" style="margin-top:14px"><label for="dxn-'+sel+'">'+T('备注','Notes')+'</label><textarea id="dxn-'+sel+'" rows="2" data-dxnote="'+sel+'" placeholder="'+T('比如：酒店健身房，高位下拉 40 kg','e.g. hotel gym, lat pulldown 40 kg')+'">'+esc(dn)+'</textarea></div>'
      +(dl?'':'<div class="savebar"><button class="btn recsave" data-act="dxsave" data-day="'+sel+'" aria-label="'+T('保存','Save')+'" title="'+T('保存','Save')+'">'+SAVE_ICON+'</button></div>')
      +'</div></article>';
    }
    html+='</section>';
  }
  /* finished sessions without a date can't sit on the calendar; keep them reachable */
  PROGRAM.filter(p=>{const s=state.sessions[p.sid];return s&&s.done&&!s.date}).forEach(p=>{html+=cardHtml(p,cur)});
  html+='<div class="tbar"><button class="rk rk-up" data-act="all" aria-label="'+T("全部收起","Collapse all")+'" title="'+T("全部收起","Collapse all")+'"></button>'
    +(cur?'<button class="tbtn next" data-act="next" aria-label="'+T("跳到下一次训练","Jump to next session")+'">💪🏼'+T("练","Train")+'</button>':'')+'</div>';
  PROGRAM.filter(p=>!(state.sessions[p.sid]&&state.sessions[p.sid].done)).slice(0,5).forEach(p=>{
    html+=cardHtml(p,cur);
    if(p.kind==="pull" && (p.day===10||p.day===20)) html+='<div class="review">D'+p.day+T(' 复盘：对比引体次数、体重周均、腰围，决定下一档是否照常加量。',' review: compare pull-ups, weekly-average weight and waist, then decide whether the next tier goes ahead as planned.')+'</div>';
  });
  pane.innerHTML=html;
}

function sessionBody(p){
  const s=sessionDoc(p.sid);
  const future=!s.done&&!isAvail(p.sid);
  const locked=(s.done&&!unlocked.has(p.sid))||future, dis=locked?' disabled':'';
  let h='<div class="sbody'+(locked?' locked':'')+'">';
  if(future){const n=nextOf(p.kind);h+='<div class="lockbar">'+LOCK+T('还没解锁：先完成 '+(n?LAB(n):'前面的训练')+'，这一天才能练。可以先看看计划。','Locked: finish '+(n?LAB(n):'the earlier session')+' first. You can preview the plan.')+'</div>'}
  if(s.done&&!locked) h+='<div class="lockbar warn">'+T('正在修改已完成的记录，训练顺序会按新的勾选重新计算。按「保存」之前，这一天不会收起。','Editing a completed record; the training order is recalculated from your ticks. Tap Save when done; this day stays open until then.')+'</div>';
  /* finished days are listed in the order the sets were ticked (first tick of each exercise decides its place) */
  let exs=p.ex;
  if(s.done){const first=e=>{const os=(s.sets[e.id]||[]).map(x=>x.o).filter(Boolean);return os.length?Math.min(...os):1e9};
    exs=p.ex.map((e,k)=>({e,k,m:first(e)})).sort((a,b)=>a.m-b.m||a.k-b.k).map(z=>z.e)}
  exs.forEach(e=>{
    const arr=s.sets[e.id];
    const idx=arr.map((x,i)=>i); if(s.done) idx.sort((a,b)=>(arr[a].o||1e9)-(arr[b].o||1e9)||a-b);
    h+='<div class="ex"><div class="exh"><h3>'+esc(N(e))+'</h3><small>'+e.target+' '+U(e.unit)+' × '+e.sets+T(' 组',' sets')+(e.note?'<br>'+esc(NOTE(e)):'')+'</small></div>';
    idx.forEach((i,pos)=>{
      const x=arr[i], extra=i>=e.sets, no=(s.done?pos:i)+1;
      h+='<div class="set'+(x.d?" ticked":"")+'">'
        +'<button class="chk" data-act="tick" data-sid="'+p.sid+'" data-ex="'+e.id+'" data-i="'+i+'" aria-label="'+T('第 '+no+' 组完成','Set '+no+' done')+'" aria-pressed="'+x.d+'"'+dis+'>'+CHECK+'<span class="ord"'+(x.o?'':' hidden')+'>'+(x.o||"")+'</span></button>'
        +'<div class="step"><button data-act="dec" data-sid="'+p.sid+'" data-ex="'+e.id+'" data-i="'+i+'" aria-label="'+T("减少","Decrease")+'"'+dis+'>−</button>'
        +'<input id="v-'+p.sid+'-'+e.id+'-'+i+'" type="number" inputmode="numeric" value="'+x.v+'" data-act="val" data-sid="'+p.sid+'" data-ex="'+e.id+'" data-i="'+i+'" aria-label="'+N(e)+' '+T('第 '+no+' 组','set '+no)+'"'+dis+'>'
        +'<button data-act="inc" data-sid="'+p.sid+'" data-ex="'+e.id+'" data-i="'+i+'" aria-label="'+T("增加","Increase")+'"'+dis+'>+</button></div>'
        +'<span class="lab">'+U(e.unit)+'<em>'+T('第 '+no+' 组','set '+no)+(extra?T(' · 加组',' · extra'):'')+'</em></span>'
        +(extra&&!locked?'<button class="x" data-act="rm" data-sid="'+p.sid+'" data-ex="'+e.id+'" data-i="'+i+'" aria-label="'+T("删除这一组","Remove set")+'">×</button>':'')
        +'</div>';
    });
    if(e.id!=="stretch"&&!locked) h+='<button class="rk rk-plus addset" data-act="add" data-sid="'+p.sid+'" data-ex="'+e.id+'" aria-label="'+T('加一组','Add set')+'" title="'+T('加一组','Add set')+'"></button>';
    h+='</div>';
  });
  if(!future)h+=extraBlock(p.sid,s,s.done&&!unlocked.has(p.sid)&&s.date!==today());
  h+='<div class="field" style="margin-top:14px"><label for="n-'+p.sid+'">'+T('备注','Notes')+'</label><textarea id="n-'+p.sid+'" rows="2" data-act="note" data-sid="'+p.sid+'"'+(future?' disabled':'')+' placeholder="'+T('比如：划船每组降低 5cm、三头有点紧','e.g. lowered rows 5 cm each set, triceps a bit tight')+'">'+esc(s.note||"")+'</textarea></div>';
  if(!s.done&&!future){
    const m=state.metrics[today()]||{};
    h+='<div class="finish"><div class="fgrid">'
      +'<div class="field"><label for="fd-'+p.sid+'">'+T('日期','Date')+'</label><input id="fd-'+p.sid+'" type="date" value="'+today()+'"></div>'
      +'<div class="field"><label for="fp-'+p.sid+'">'+T('标准引体（个，可空）','Strict pull-ups (optional)')+'</label><input id="fp-'+p.sid+'" type="number" inputmode="numeric" min="0" step="1" value="'+(m.pullups??"")+'" placeholder="—"></div>'
      +'<div class="field"><label for="fw-'+p.sid+'">'+T('体重 kg（可空）','Weight kg (optional)')+'</label><input id="fw-'+p.sid+'" type="number" inputmode="decimal" step="0.1" value="'+(m.weight??"")+'" placeholder="—"></div>'
      +'<div class="field"><label for="fz-'+p.sid+'">'+T('腰围 cm（可空）','Waist cm (optional)')+'</label><input id="fz-'+p.sid+'" type="number" inputmode="decimal" step="0.1" value="'+(m.waist??"")+'" placeholder="—"></div>'
      +'</div><button class="btn finbtn" data-act="finish" data-sid="'+p.sid+'"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 21V4"/><path d="M4 4h13l-2.5 4L17 12H4"/></svg>'+T('完成 ','Finish ')+LAB(p)+'</button></div>';
  }else if(s.done){
    h+='<div class="row" style="margin-top:12px"><div class="field" style="flex:1"><label for="ed-'+p.sid+'">'+T('完成日期','Completed on')+'</label><input id="ed-'+p.sid+'" type="date" value="'+(s.date||"")+'" data-act="date" data-sid="'+p.sid+'"></div>'
      +(unlocked.has(p.sid)
        ?'<button class="btn recsave" data-act="save" data-sid="'+p.sid+'" style="align-self:end" aria-label="'+T('保存','Save')+'" title="'+T('保存','Save')+'">'+SAVE_ICON+'</button>'
        :editBtn('data-act="edit" data-sid="'+p.sid+'" style="align-self:end"'))+'</div>';
  }
  return h+'</div>';
}

/* tick order: every ticked set carries o = 1, 2, 3 … in the order it was ticked; unticking closes the gap */
const unlocked=new Set(), EDIT_ACTS=["tick","inc","dec","add","rm"];
/* panel speed: a normal fold is 0.3 s; panels open and close at 70% of that speed, a saved edit closes at 50% */
const FOLD_MS=Math.round(300/0.7), SAVE_FOLD_MS=Math.round(300/0.5);
let folding=false;
function foldOut(els,ms){
  els=els.filter(Boolean);
  if(!els.length||window.matchMedia("(prefers-reduced-motion: reduce)").matches)return Promise.resolve();
  folding=true;
  els.forEach(b=>{b.style.overflow="hidden";b.style.height=b.scrollHeight+"px"});
  void document.body.offsetHeight;
  els.forEach(b=>{b.style.transition="height "+ms+"ms cubic-bezier(.4,0,.2,1),opacity "+ms+"ms ease,padding "+ms+"ms ease";
    b.style.height="0px";b.style.opacity="0";b.style.paddingTop="0px";b.style.paddingBottom="0px"});
  return new Promise(r=>setTimeout(()=>{folding=false;r()},ms));
}
function foldIn(els,ms){
  els=els.filter(Boolean);
  if(!els.length||window.matchMedia("(prefers-reduced-motion: reduce)").matches)return;
  const t=els.map(b=>{const cs=getComputedStyle(b);return {b,h:b.scrollHeight,pt:cs.paddingTop,pb:cs.paddingBottom}});
  t.forEach(({b})=>{b.style.overflow="hidden";b.style.height="0px";b.style.opacity="0";b.style.paddingTop="0px";b.style.paddingBottom="0px"});
  void document.body.offsetHeight;
  t.forEach(({b,h,pt,pb})=>{b.style.transition="height "+ms+"ms cubic-bezier(.4,0,.2,1),opacity "+ms+"ms ease,padding "+ms+"ms ease";
    b.style.height=h+"px";b.style.opacity="1";b.style.paddingTop=pt;b.style.paddingBottom=pb});
  setTimeout(()=>t.forEach(({b})=>b.removeAttribute("style")),ms+20);
}
const bodyOf=sid=>document.querySelector("#c-"+sid+" .sbody");
/* the folding panels on the data page close with the same slow fold */
document.addEventListener("click",e=>{
  const sm=e.target.closest("details.fold>summary"); if(!sm)return;
  const d=sm.parentElement;
  e.preventDefault();
  const b=d.querySelector(":scope>.fbody");
  if(!d.open){d.open=true;foldIn([b],FOLD_MS);return}
  if(d.classList.contains("savefold"))commitFold(d);
  foldOut(b?[b]:[],FOLD_MS).then(()=>{d.open=false;if(b)b.removeAttribute("style")});
});
/* collapse every training day (except one being edited) and every folding panel on the data page */
function collapseAll(){
  const bs=[...document.querySelectorAll("#pane-train .sbody")].filter(b=>!unlocked.has(b.closest(".card").id.slice(2)));
  const dataVisible=!document.getElementById("pane-me").hidden;
  const ds=[...document.querySelectorAll("details.fold[open]")];
  ds.forEach(d=>{if(d.classList.contains("savefold"))commitFold(d,true)});
  if(!dataVisible)ds.forEach(d=>d.open=false);
  const fb=dataVisible?ds.map(d=>d.querySelector(":scope>.fbody")):[];
  foldOut(bs.concat(fb),FOLD_MS).then(()=>{
    if(dataVisible)ds.forEach(d=>{d.open=false;const b=d.querySelector(":scope>.fbody");if(b)b.removeAttribute("style")});
    openDays.clear();keepEditing();renderTrain()});
}
function keepEditing(){unlocked.forEach(sid=>openDays.add(sid))}
/* "修改记录" asks once more before a finished day can be edited */
function confirmEdit(sid){
  let m=document.getElementById("edMask");
  if(!m){m=document.createElement("div");m.id="edMask";m.className="dp-mask";document.body.appendChild(m);
    m.addEventListener("click",e=>{
      if(e.target===m||e.target.closest("[data-edx]")){m.hidden=true;return}
      const ok=e.target.closest("[data-edok]");
      if(ok){const id=ok.dataset.edok;m.hidden=true;
        if(id.startsWith("day:")){const d=id.slice(4);dxUnlocked.add(d);PROGRAM.forEach(p=>{const s=state.sessions[p.sid];if(s&&s.done&&s.date===d){unlocked.add(p.sid);openDays.add(p.sid)}})}
        else if(id.startsWith("d:"))dxUnlocked.add(id.slice(2));else{unlocked.add(id);openDays.add(id)}
        renderTrain()}
    })}
  m.innerHTML='<div class="dp" role="alertdialog" aria-modal="true" aria-labelledby="edT"><div class="dp-h"><b id="edT">'+T("修改记录","Edit record")+' · '+(sid.startsWith("day:")?md(sid.slice(4)):sid.startsWith("d:")?md(sid.slice(2)):LAB(BYID[sid]))+'</b></div>'
    +'<p class="edmsg">'+T("已完成的记录，按实际训练顺序排列。不建议修改过往记录：改动可能打乱训练顺序。","This record is shown in the order you trained. Editing past records is not recommended: changes can alter the training order.")+'</p>'
    +'<div class="dp-f"><button type="button" data-edx="1">'+T("取消","Cancel")+'</button><button type="button" class="dp-today" data-edok="'+sid+'">'+T("仍要修改","Edit anyway")+'</button></div></div>';
  m.hidden=false;
}
/* only the next unfinished push day and the next unfinished pull day can be trained; later days unlock in order */
function nextOf(kind){return PROGRAM.find(p=>p.kind===kind&&!(state.sessions[p.sid]&&state.sessions[p.sid].done))}
function isAvail(sid){const s=state.sessions[sid];if(s&&s.done)return true;const n=nextOf(BYID[sid].kind);return !!n&&n.sid===sid}
const LOCK='<svg class="lk" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></svg>';
function eachSet(s,f){Object.values(s.sets).forEach(a=>a.forEach(f))}
function maxOrd(s){let m=0;eachSet(s,y=>{if(y.o>m)m=y.o});return m}
function refreshOrd(sid){const s=state.sessions[sid];if(!s)return;
  Object.keys(s.sets).forEach(ex=>s.sets[ex].forEach((x,i)=>{
    const b=document.querySelector('.chk[data-sid="'+sid+'"][data-ex="'+ex+'"][data-i="'+i+'"] .ord');
    if(b){b.textContent=x.o||"";b.hidden=!x.o}}))}
function setRowState(sid,ex,i){
  const x=state.sessions[sid].sets[ex][i];
  const inp=document.getElementById("v-"+sid+"-"+ex+"-"+i);
  if(inp){inp.value=x.v;const row=inp.closest(".set");row.classList.toggle("ticked",x.d);row.querySelector(".chk").setAttribute("aria-pressed",x.d)}
  const [d,n]=sessionProgress(sid);
  const bar=document.querySelector("#c-"+sid+" .prog i"); if(bar) bar.style.width=(n?Math.round(d/n*100):0)+"%";
}

/* 练: open the next session and scroll to it */
function goNextSession(){
  const cur=currentSid();if(!cur)return;
  const was=openDays.has(cur);openDays.clear();keepEditing();openDays.add(cur);renderTrain();if(!was)foldIn([bodyOf(cur)],FOLD_MS);
  const fd=document.getElementById("fd-"+cur);if(fd){fd.value=today()}
  const el=document.getElementById("c-"+cur);if(el){el.scrollIntoView({behavior:"smooth",block:"start"});el.classList.remove("flash");void el.offsetWidth;el.classList.add("flash")}
}
document.getElementById("pane-train").addEventListener("click",e=>{
  const xt=e.target.closest("[data-xa]"); if(xt){extraAct(xt);return}
  if(calHeld){calHeld=false;return}
  const cd=e.target.closest("[data-cal]");
  if(cd){const d=cd.dataset.cal;
    /* a new day: choose it and open its panel; the chosen day again: open its panel if it was closed, else close it */
    if(calState.sel!==d){calState.sel=d;calState.panel=true}else if(!calState.panel)calState.panel=true;else{calState.sel=null;calState.panel=false}
    renderTrain();const box=document.querySelector("#pane-train .calday");if(box)foldIn([box],FOLD_MS);return}
  if(e.target.closest("[data-cal-today]")){if(todayHeld){todayHeld=false;return}goToday(false);return}
  if(e.target.closest("[data-cal-fold]")){calState.fold=!calState.fold;try{localStorage.setItem(CAL_FOLD_K,calState.fold?"1":"0")}catch(err){}
    renderTrain();if(!calState.fold){const g=document.querySelector("#pane-train .calg");if(g)foldIn([g],FOLD_MS)}return}
  const cn=e.target.closest("[data-cal-nav]");
  if(cn){const m=calState.month||today().slice(0,7);let [y,mo]=m.split("-").map(Number);mo+=+cn.dataset.calNav;if(mo<1){mo=12;y--}if(mo>12){mo=1;y++}
    calState.month=y+"-"+pad(mo);renderTrain();return}
  const t=e.target.closest("[data-toggle],[data-act]"); if(!t) return;
  if(t.dataset.toggle){const sid=t.dataset.toggle;
    if(openDays.has(sid)&&unlocked.has(sid)){toast(T("正在修改这一天，按「保存」后才能收起","You're editing this day; tap Save before closing it"));return}
    if(openDays.has(sid)){const b=document.querySelector("#c-"+sid+" .sbody");foldOut(b?[b]:[],FOLD_MS).then(()=>{openDays.delete(sid);renderTrain()});return}
    openDays.add(sid);renderTrain();foldIn([bodyOf(sid)],FOLD_MS);return}
  if(t.dataset.act==="all"){t.classList.remove("pop");void t.offsetWidth;t.classList.add("pop");setTimeout(collapseAll,120);return}
  if(t.dataset.act==="next"){if(nextHeld){nextHeld=false;return}goNextSession();return}
  const {act,sid,ex}=t.dataset; const i=+t.dataset.i;
  if(act==="val"||act==="note"||act==="date") return;
  if(act==="dxedit"){confirmEdit("d:"+t.dataset.day);return}
  if(act==="dxsave"){const d=t.dataset.day;dxUnlocked.delete(d);lsSave();renderGoals();toast(T("已保存","Saved"));
    /* finishing today's extra practice still gets fireworks: one rocket per completed set */
    const doc=state.dayx[d], sets=doc&&doc.xs?doc.xs.reduce((a,it)=>a+it.sets.filter(x=>x.d).length,0):0;
    if(d===today()&&sets)fireworks(Math.min(sets,15),sets>=10?1:0);
    const box=document.querySelector("#pane-train .calday");
    foldOut(box?[box]:[],SAVE_FOLD_MS).then(()=>{calState.sel=null;calState.panel=false;renderTrain()});return}
  if(act==="edit"){confirmEdit(sid);return}
  if(act==="save"){unlocked.delete(sid);lsSave();
    toast(LAB(BYID[sid])+T(" 的修改已保存"," changes saved"));
    const b=document.querySelector("#c-"+sid+" .sbody");
    foldOut(b?[b]:[],SAVE_FOLD_MS).then(()=>{openDays.delete(sid);renderAll();
      window.scrollTo({top:0,behavior:window.matchMedia("(prefers-reduced-motion: reduce)").matches?"auto":"smooth"})});
    return}
  const s=sessionDoc(sid);
  if((EDIT_ACTS.includes(act)||act==="finish")&&!s.done&&!isAvail(sid)){const n=nextOf(BYID[sid].kind);toast(T("还没解锁，先完成 ","Locked — finish ")+(n?LAB(n):"")+T(""," first"));return}
  if(EDIT_ACTS.includes(act)&&s.done&&!unlocked.has(sid)){toast(T("已完成的记录已锁定，点「修改记录」后才能改","Completed records are locked; tap Edit record first"));return}
  const def=BYID[sid].ex.find(x=>x.id===ex);
  if(act==="tick"){const x=s.sets[ex][i];x.d=!x.d;
    if(x.d)x.o=maxOrd(s)+1;
    else if(x.o){const o=x.o;delete x.o;eachSet(s,y=>{if(y.o>o)y.o--})}
    setRowState(sid,ex,i);refreshOrd(sid);lsSave();
    if(x.d){if(exDone(s,def))fireworks(3,exOver(s,def)?1:0);else fireworks(1,0)}
    return}
  if(act==="inc"||act==="dec"){const x=s.sets[ex][i];x.v=Math.max(0,(+x.v||0)+(act==="inc"?(def.unit==="秒"?5:1):-(def.unit==="秒"?5:1)));setRowState(sid,ex,i);lsSave();return}
  if(act==="add"){const arr=s.sets[ex];arr.push({v:arr.length?arr[arr.length-1].v:def.target,d:false});lsSave();renderTrain();return}
  if(act==="rm"){const o=s.sets[ex][i].o;s.sets[ex].splice(i,1);if(o)eachSet(s,y=>{if(y.o>o)y.o--});lsSave();renderTrain();return}
  if(act==="finish"){
    const date=document.getElementById("fd-"+sid).value||today();
    const pu=numOrNull(document.getElementById("fp-"+sid).value);
    const wt=numOrNull(document.getElementById("fw-"+sid).value);
    const wz=numOrNull(document.getElementById("fz-"+sid).value);
    if(finishing)return;finishing=true;
    s.done=true;s.date=date;
    if(pu!=null||wt!=null||wz!=null){saveMetric(date,{pullups:pu,weight:wt,waist:wz})}
    lsSave();
    const over=BYID[sid].ex.some(e=>exOver(s,e));
    fireworks(10,over?1:0);
    const nx=currentSid();
    toast(LAB(BYID[sid])+T(" 已完成"," done")+(over?T("，有超额！","; over target!"):"")+(nx?T("，下一次：","; next: ")+LAB(BYID[nx]):""));
    /* slow-motion (0.3x speed) fold of the finished day, then close every day and go back to the top */
    const body=document.querySelector("#c-"+sid+" .sbody"), slow=!window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const DUR=slow&&body?FOLD_MS:0;
    if(DUR){body.style.overflow="hidden";body.style.height=body.scrollHeight+"px";void body.offsetHeight;
      body.style.transition="height "+DUR+"ms cubic-bezier(.4,0,.2,1),opacity "+DUR+"ms ease,padding "+DUR+"ms ease";
      body.style.height="0px";body.style.opacity="0";body.style.paddingTop="0px";body.style.paddingBottom="0px"}
    setTimeout(()=>{
      openDays.clear();keepEditing();autoOpened=true;renderAll();finishing=false;
      window.scrollTo({top:0,behavior:slow?"smooth":"auto"});
    },DUR);
    return;
  }
  if(act==="undo"){s.done=false;lsSave();renderAll();return}
});
document.getElementById("pane-train").addEventListener("change",e=>{
  const t=e.target;
  if(t.dataset.xa==="val")renderTrain();
});
document.getElementById("pane-train").addEventListener("input",e=>{
  const t=e.target;
  if(t.dataset.xa==="val"){const x=xEdit(t.dataset.sid)[+t.dataset.k].sets[+t.dataset.i];x.v=Math.max(0,numOrNull(t.value)||0);extraSaved();return}
  if(t.dataset.dxnote){const doc=xDoc("d:"+t.dataset.dxnote);doc.note=t.value;lsSave();
    const had=document.querySelector('[data-cal="'+t.dataset.dxnote+'"] .calm i.xp'), f=dayHas(t.dataset.dxnote);
    if(!!had!==f.x){const m=document.querySelector('[data-cal="'+t.dataset.dxnote+'"] .calm');if(m)m.innerHTML=(f.push?'<i class="push"></i>':'')+(f.pull?'<i class="pull"></i>':'')+(f.x?'<i class="xp"></i>':'')}
    return}
  const {act,sid,ex}=t.dataset; if(!act) return;
  const s=sessionDoc(sid);
  if(act==="val"&&s.done&&!unlocked.has(sid))return;
  if(act==="val"){const v=numOrNull(t.value);s.sets[ex][+t.dataset.i].v=v==null?0:Math.max(0,v);lsSave()}
  if(act==="note"){s.note=t.value;lsSave()}
  if(act==="date"){s.date=t.value||null;lsSave();renderStats()}
});

/* 今天: a tap jumps to this month, chooses today and scrolls to today's finished session (or the calendar) without
   opening the extra-practice panel; holding it opens the panel, with a short buzz and a filling ring while held */
function goToday(openPanel){calState.month=null;calState.sel=today();calState.panel=!!openPanel;calState.fold=false;
  try{localStorage.setItem(CAL_FOLD_K,"0")}catch(err){}renderTrain();
  const smooth=window.matchMedia("(prefers-reduced-motion: reduce)").matches?"auto":"smooth";
  const box=document.querySelector("#pane-train .calday");
  const first=box&&box.querySelector(openPanel?".card.dayx":".card");
  (first||document.querySelector("#pane-train .cal")).scrollIntoView({behavior:smooth,block:first?"center":"start"});
  if(openPanel&&box)foldIn([box],FOLD_MS)}
let todayHeld=false,calHeld=false,nextHeld=false;
/* hold 练: show both sessions that can be trained now (the next push day and the next pull day): the page scrolls
   to them and a dim ring of light runs round each card twice */
(function(){let tm=0,sx=0;const pane=document.getElementById("pane-train");
  pane.addEventListener("pointerdown",e=>{const b=e.target.closest('.tbtn.next[data-act="next"]');if(!b)return;sx=e.clientX;clearTimeout(tm);
    tm=setTimeout(()=>{nextHeld=true;if(navigator.vibrate)navigator.vibrate(15);showAvail()},500)});
  ["pointerup","pointercancel","pointerleave"].forEach(t=>pane.addEventListener(t,()=>clearTimeout(tm)));
  pane.addEventListener("contextmenu",e=>{if(e.target.closest(".tbtn.next"))e.preventDefault()});
})();
function showAvail(){
  const cards=PROGRAM.filter(p=>isAvail(p.sid)&&!(state.sessions[p.sid]&&state.sessions[p.sid].done)).map(p=>document.getElementById("c-"+p.sid)).filter(Boolean);
  if(!cards.length)return;
  const smooth=window.matchMedia("(prefers-reduced-motion: reduce)").matches?"auto":"smooth";
  cards[0].scrollIntoView({behavior:smooth,block:"center"});
  cards.forEach(c=>{c.classList.remove("ringflash");void c.offsetWidth;c.classList.add("ringflash");setTimeout(()=>c.classList.remove("ringflash"),2200)});
}
/* calendar gestures: hold today's square = today's extra practice; hold a day with records = ask before editing it
   (notes stay editable without asking); swipe the month name left or right = next or previous month */
(function(){let tm=0,sx=0,sy=0,cell=null,swipe=null;const pane=document.getElementById("pane-train");
  const clear=()=>{clearTimeout(tm);if(cell)cell.classList.remove("holding");cell=null};
  pane.addEventListener("pointerdown",e=>{calHeld=false;nextHeld=false;
    const t=e.target.closest(".caltitle");if(t){swipe={x:e.clientX,y:e.clientY};return}
    const c=e.target.closest("[data-cal]");if(!c||c.disabled)return;clear();
    const d=c.dataset.cal,f=dayHas(d);if(d!==today()&&!(f.push||f.pull||f.x))return;
    cell=c;sx=e.clientX;sy=e.clientY;c.classList.add("holding");
    tm=setTimeout(()=>{clear();calHeld=true;if(navigator.vibrate)navigator.vibrate(18);if(window.sfxRaw)window.sfxRaw("pop");
      if(d===today()){goToday(true);return}
      calState.sel=d;calState.panel=true;renderTrain();confirmEdit("day:"+d)},550)});
  pane.addEventListener("pointermove",e=>{if(cell&&Math.abs(e.clientX-sx)+Math.abs(e.clientY-sy)>10)clear()});
  pane.addEventListener("pointerup",e=>{clear();if(!swipe)return;const dx=e.clientX-swipe.x,dy=e.clientY-swipe.y;swipe=null;
    if(Math.abs(dx)>40&&Math.abs(dx)>Math.abs(dy)*1.3){const b=document.querySelector('#pane-train [data-cal-nav="'+(dx<0?1:-1)+'"]');
      if(b&&!b.disabled)b.click();calHeld=true;setTimeout(()=>{calHeld=false},80)}});
  pane.addEventListener("pointercancel",()=>{clear();swipe=null});
  pane.addEventListener("contextmenu",e=>{if(e.target.closest("[data-cal]"))e.preventDefault()});
})();
(function(){let tm=0,el=null;const pane=document.getElementById("pane-train");
  const stop=()=>{clearTimeout(tm);if(el)el.classList.remove("holding");el=null};
  pane.addEventListener("pointerdown",e=>{const b=e.target.closest("[data-cal-today]");if(!b)return;stop();todayHeld=false;el=b;b.classList.add("holding");
    tm=setTimeout(()=>{stop();todayHeld=true;if(navigator.vibrate)navigator.vibrate(18);if(window.sfxRaw)window.sfxRaw("pop");goToday(true)},550)});
  ["pointerup","pointercancel","pointerleave"].forEach(t=>pane.addEventListener(t,stop));
  pane.addEventListener("contextmenu",e=>{if(e.target.closest("[data-cal-today]"))e.preventDefault()});
})();
