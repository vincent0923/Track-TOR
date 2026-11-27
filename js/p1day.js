/* 博G main interface: one day. Tap a day on the calendar for what was done that day: the finished sessions (with
   a way to correct them), extra practice (pull-ups by default, or any move), and that day's food and body numbers.
   Extras go in the day's finished session (doc.xs), or in dayx[date] on a day without one. */
(function(){
const QUICK=[["pullup","引体向上","Pull-ups","个"],["pushup","俯卧撑","Push-ups","个"],["squat","深蹲","Squats","个"],["plank","平板支撑","Plank","秒"],["hang","悬吊","Dead hang","秒"]];
const qOf=id=>QUICK.find(q=>q[0]===id);
const xName=it=>{const q=qOf(it.id);return q?T(q[1],q[2]):it.name};
window.p1XName=xName;
let editSid=null,curDay=null;
function sessionsOn(d){return PROGRAM.filter(p=>{const s=state.sessions[p.sid];return s&&s.done&&s.date===d})}
function xDocFor(d,make){const ss=sessionsOn(d);if(ss.length)return state.sessions[ss[0].sid];
  if(state.dayx[d])return state.dayx[d];if(!make)return null;return state.dayx[d]={date:d,xs:null}}
/* the last value logged for an extra, anywhere, so a new set starts there */
function lastVal(id){let best=null,bd="";const look=(doc,date)=>{(doc&&doc.xs||[]).forEach(it=>{if(it.id!==id)return;const s=it.sets.filter(x=>x.d);if(s.length&&(date||"")>=bd){bd=date||"";best=+s[s.length-1].v}})};
  Object.values(state.sessions).forEach(s=>look(s,s&&s.date));Object.values(state.dayx||{}).forEach(x=>look(x,x&&x.date));return best}
const pending={};   /* the value waiting in each extra's stepper */
function sessHtml(p){const doc=state.sessions[p.sid],ed=editSid===p.sid;
  return '<div class="plan1"><div class="row"><i class="kd" style="background:var(--'+p.kind+')"></i><b class="sp">'+LAB(p)+'</b><button class="pill'+(ed?' ac':'')+'" data-act="dedit" data-sid="'+p.sid+'">'+(ed?T('完成','Done'):T('修改','Edit'))+'</button></div>'
    +p.ex.map(e=>{const a=(doc.sets&&doc.sets[e.id])||[];
      if(!ed&&!a.length)return '';
      if(!ed)return '<div class="pex"><div class="row"><span class="sp">'+N(e)+'</span><b class="n">'+(a.length?a.map(x=>x.d?x.v:'<span class="muted">'+x.v+'</span>').join('·'):'–')+'</b></div></div>';
      /* editing: one record to a row, × on the right takes it away, + beside the move adds one */
      const at=' data-sid="'+p.sid+'" data-e="'+e.id+'"';
      return '<div class="pex ed"><div class="row"><b class="sp">'+N(e)+'</b><button class="fsreset" data-act="dadd"'+at+' aria-label="'+T('加一组','Add a set')+'">'+ICON.plus+'</button></div>'+a.map((x,i)=>
        '<div class="row srow"><span class="sed'+(x.d?' on':'')+'"><button data-act="dsv"'+at+' data-i="'+i+'" data-d="-1" aria-label="'+T('减','Less')+'">−</button>'
        +'<button class="v n" data-act="dst"'+at+' data-i="'+i+'" aria-label="'+T('做了 / 没做','Done / not done')+'">'+x.v+'</button>'
        +'<button data-act="dsv"'+at+' data-i="'+i+'" data-d="1" aria-label="'+T('加','More')+'">+</button></span><span class="sp"></span>'
        +'<button class="fsreset sx" data-act="ddel"'+at+' data-i="'+i+'" aria-label="'+T('删掉这一组','Delete this set')+'">'+ICON.x+'</button></div>').join('')+'</div>'}).join('')+'</div>'}
/* a finished session with no record left is not finished: it goes back to "ready" (so the one after it locks again),
   its sets return to the plan, and any extras logged with it stay on that day */
function reopenIfEmpty(sid){const doc=state.sessions[sid];if(!doc||!doc.done||Object.values(doc.sets||{}).some(a=>a.some(x=>x.d)))return false;
  const p=BYID[sid],d=doc.date;if(doc.xs&&doc.xs.length&&d){const dx=state.dayx[d]=state.dayx[d]||{date:d,xs:[]};dx.xs=(dx.xs||[]).concat(doc.xs)}
  delete doc.xs;delete doc.feel;delete doc.edited;doc.done=false;doc.date=null;doc.sets={};p.ex.forEach(e=>{doc.sets[e.id]=Array.from({length:e.sets},()=>({v:e.target,d:false}))});
  editSid=null;engPlanAll();toast(LAB(p)+T(' 回到可练',' is ready again'));return true}
function dropSet(doc,id,i){const arr=doc.sets[id],x=arr[i];if(!x)return;arr.splice(i,1);if(x.d&&x.o)Object.values(doc.sets).forEach(r=>r.forEach(y=>{if(y.o>x.o)y.o--}));if(typeof buzz==="function")buzz(10)}
function extrasHtml(d){const doc=xDocFor(d,false),items=(doc&&doc.xs)||[],have=new Set(items.map(i=>i.id));
  const rows=items.map((it,k)=>{const unit=it.unit==="秒"?T(" 秒"," s"):"",v=pending[it.id]!=null?pending[it.id]:(lastVal(it.id)??(it.id==="pullup"?1:10));pending[it.id]=v;
    return '<div class="xitem"><div class="row"><b class="sp">'+esc(xName(it))+'</b></div>'
      +'<div class="xsets">'+it.sets.filter(x=>x.d).map((x,i)=>'<button class="pill ac" data-act="xun" data-k="'+k+'" data-i="'+i+'" aria-label="'+T('撤销这一组','Undo this set')+'">'+x.v+unit+'</button>').join('')+'</div>'
      +'<div class="row xstep"><button class="mini" data-act="xv" data-id="'+it.id+'" data-dv="-1" aria-label="'+T('减','Less')+'">−</button><b class="n">'+v+'</b><button class="mini" data-act="xv" data-id="'+it.id+'" data-dv="1" aria-label="'+T('加','More')+'">+</button>'
      +'<span class="sp"></span><button class="pill ac xlog" data-act="xlog" data-k="'+k+'">'+T('记一组','Log a set')+'</button></div></div>'}).join('');
  const adds=QUICK.filter(q=>!have.has(q[0])).map(q=>'<button class="pill" data-act="xadd" data-id="'+q[0]+'">+ '+T(q[1],q[2])+'</button>').join('')+'<button class="pill" data-act="xadd" data-id="">+ '+T('其他','Other')+'</button>';
  return '<p class="xhead">'+T('加练','Extra practice')+'</p>'+rows+'<div class="xadds">'+adds+'</div>'}
function render(){const d=curDay,dt=dateObj(d),ss=sessionsOn(d);
  const head=LANG==="en"?["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"][dt.getDay()]+", "+MON_EN[dt.getMonth()]+" "+dt.getDate():(dt.getMonth()+1)+"月"+dt.getDate()+"日 周"+WD[dt.getDay()];
  const any=ss.length||(xDocFor(d,false)&&(xDocFor(d,false).xs||[]).some(it=>it.sets.some(x=>x.d)));
  const html='<div class="sh-h"><h3>'+(d===today()?T('今天','Today'):head)+'</h3>'+(any?'<button class="mini" data-act="tshare" aria-label="'+T('分享','Share')+'">'+ICON.share+'</button>':'')+'</div>'
    +(d===today()?'<p class="muted" style="font-size:12px;margin:-8px 0 12px">'+head+'</p>':'')
    +(ss.length?ss.map(sessHtml).join(''):'<p class="muted" style="font-size:13px">'+T('这天没有完成的训练','No finished session this day')+'</p>')
    +extrasHtml(d)+(editSid?'':'<div class="sh-foot"><button class="mini" data-act="close" aria-label="'+T('关闭','Close')+'">'+ICON.x+'</button></div>');
  const body=$("#sheetBody"),sc=$("#sheet .panel").scrollTop;
  if($("#sheet").classList.contains("on")&&body.dataset.day===d){body.innerHTML=html;$("#sheet .panel").scrollTop=sc}else{openSheet(html);body.dataset.day=d}}
function openDay(d){if(d==="today")d=today();if(d>today())return;curDay=d;editSid=null;Object.keys(pending).forEach(k=>delete pending[k]);
  if(typeof run!=="undefined"&&run&&!run.finished)closeRun();$("#sheetBody").dataset.day="";render()}
window.p1OpenDay=openDay;
function changed(){if(typeof engFree==="function"&&engFree())engPlanAll();lsSave();if(typeof renderAll==="function")renderAll();render();if(typeof finRefresh==="function")finRefresh()}
document.addEventListener("click",e=>{const b=e.target.closest("[data-act]");if(!b)return;const a=b.dataset.act;
  if(a==="cal"){openDay(b.dataset.d);return}
  if(!curDay||!$("#sheet").classList.contains("on")||$("#sheetBody").dataset.day!==curDay)return;
  if(a==="tshare"){if(typeof SFX!=="undefined")SFX.tap();finShare(curDay);return}
  if(a==="dedit"){const was=editSid;editSid=was===b.dataset.sid?null:b.dataset.sid;if(was&&!editSid){engPlanAll();changed();toast(T("已保存","Saved"))}else render();return}
  if(a==="dsv"||a==="dst"||a==="ddel"||a==="dadd"){const sid=b.dataset.sid,doc=state.sessions[sid],id=b.dataset.e,arr=doc.sets[id]=doc.sets[id]||[],i=+b.dataset.i,x=arr[i],e=BYID[sid].ex.find(y=>y.id===id);
    if(a==="dadd"){const l=arr[arr.length-1];arr.push({v:l?l.v:(e?e.target:1),d:true,o:maxOrdOf(doc)+1});if(typeof SFX!=="undefined")SFX.tap()}
    else if(a==="ddel")dropSet(doc,id,i);
    else if(a==="dsv"){const st=e&&e.unit==="秒"?5:1;x.v=Math.max(0,(+x.v||0)+(+b.dataset.d)*st);if(x.v<=0)dropSet(doc,id,i)}
    else{x.d=!x.d;if(x.d)x.o=maxOrdOf(doc)+1;else if(x.o){const o=x.o;delete x.o;Object.values(doc.sets).forEach(r=>r.forEach(y=>{if(y.o>o)y.o--}))}}
    if(reopenIfEmpty(sid)){changed();return}
    lsSave();render();return}
  if(a==="xv"){const id=b.dataset.id,it=(xDocFor(curDay,false).xs||[]).find(i=>i.id===id),st=it&&it.unit==="秒"?5:1;pending[id]=Math.max(0,(pending[id]||0)+(+b.dataset.dv)*st);render();return}
  if(a==="xlog"){const doc=xDocFor(curDay,true),it=doc.xs[+b.dataset.k];it.sets.push({v:pending[it.id],d:true});if(curDay===today()&&typeof wxMark==="function")wxMark();if(typeof SFX!=="undefined")SFX.tick();if(typeof buzz==="function")buzz(16);if(curDay===today())celebrate(1,0);changed();return}
  if(a==="xun"){const doc=xDocFor(curDay,false),it=doc.xs[+b.dataset.k],done=it.sets.filter(x=>x.d),x=done[+b.dataset.i];it.sets.splice(it.sets.indexOf(x),1);
    if(!it.sets.length)doc.xs.splice(+b.dataset.k,1);if(doc.xs&&!doc.xs.length&&state.dayx[curDay]===doc&&!doc.note)delete state.dayx[curDay];changed();return}
  if(a==="xadd"){let id=b.dataset.id,name,unit="个";
    if(id){const q=qOf(id);name=q[1];unit=q[3]}else{name=(prompt(T("动作名字","Name of the move"))||"").trim();if(!name)return;id="c"+Date.now().toString(36);
      if(confirm(T("按秒计时吗？（取消 = 按个数）","Is it timed in seconds? (Cancel = reps)")))unit="秒"}
    const doc=xDocFor(curDay,true);doc.xs=doc.xs||[];doc.xs.push({id,name,unit,sets:[]});pending[id]=lastVal(id)??(id==="pullup"?1:unit==="秒"?30:10);lsSave();render();return}
});
})();
