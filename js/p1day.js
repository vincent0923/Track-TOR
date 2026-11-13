/* 推拉机 main interface: one day. Tap a day on the calendar for what was done that day: the finished sessions (with
   a way to correct them), extra practice (pull-ups by default, or any move), and that day's food and body numbers.
   Extras go in the day's finished session (doc.xs), or in dayx[date] on a day without one. */
(function(){
const QUICK=[["pullup","引体向上","Pull-ups","个"],["pushup","俯卧撑","Push-ups","个"],["squat","深蹲","Squats","个"],["plank","平板支撑","Plank","秒"],["hang","悬吊","Dead hang","秒"]];
const qOf=id=>QUICK.find(q=>q[0]===id);
const xName=it=>{const q=qOf(it.id);return q?T(q[1],q[2]):it.name};
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
      if(!ed)return '<div class="pex"><div class="row"><span class="sp">'+N(e)+'</span><b class="n">'+(a.length?a.map(x=>x.d?x.v:'<span class="muted">'+x.v+'</span>').join('·'):'–')+'</b></div></div>';
      return '<div class="pex"><div class="sp" style="font-weight:600;font-size:14px;margin-bottom:6px">'+N(e)+'</div><div class="setsed">'+a.map((x,i)=>
        '<span class="sed'+(x.d?' on':'')+'"><button data-act="dsv" data-sid="'+p.sid+'" data-e="'+e.id+'" data-i="'+i+'" data-d="-1" aria-label="'+T('减','Less')+'">−</button>'
        +'<button class="v n" data-act="dst" data-sid="'+p.sid+'" data-e="'+e.id+'" data-i="'+i+'" aria-label="'+T('做了 / 没做','Done / not done')+'">'+x.v+'</button>'
        +'<button data-act="dsv" data-sid="'+p.sid+'" data-e="'+e.id+'" data-i="'+i+'" data-d="1" aria-label="'+T('加','More')+'">+</button></span>').join('')+'</div></div>'}).join('')+'</div>'}
function extrasHtml(d){const doc=xDocFor(d,false),items=(doc&&doc.xs)||[],have=new Set(items.map(i=>i.id));
  const rows=items.map((it,k)=>{const unit=it.unit==="秒"?T(" 秒"," s"):"",v=pending[it.id]!=null?pending[it.id]:(lastVal(it.id)??(it.id==="pullup"?1:10));pending[it.id]=v;
    return '<div class="xitem"><div class="row"><b class="sp">'+esc(xName(it))+'</b>'+(it.sets.some(x=>x.d)?'<span class="muted n" style="font-size:12px">'+it.sets.filter(x=>x.d).reduce((a,x)=>a+(+x.v||0),0)+(it.unit==="秒"?T(" 秒"," s"):T(" 个"," reps"))+'</span>':'')+'</div>'
      +'<div class="xsets">'+it.sets.filter(x=>x.d).map((x,i)=>'<button class="pill ac" data-act="xun" data-k="'+k+'" data-i="'+i+'" aria-label="'+T('撤销这一组','Undo this set')+'">'+x.v+unit+'</button>').join('')+'</div>'
      +'<div class="row xstep"><button class="mini" data-act="xv" data-id="'+it.id+'" data-dv="-1" aria-label="'+T('减','Less')+'">−</button><b class="n">'+v+'</b><button class="mini" data-act="xv" data-id="'+it.id+'" data-dv="1" aria-label="'+T('加','More')+'">+</button>'
      +'<span class="sp"></span><button class="pill ac xlog" data-act="xlog" data-k="'+k+'">'+T('记一组','Log a set')+'</button></div></div>'}).join('');
  const adds=QUICK.filter(q=>!have.has(q[0])).map(q=>'<button class="pill" data-act="xadd" data-id="'+q[0]+'">+ '+T(q[1],q[2])+'</button>').join('')+'<button class="pill" data-act="xadd" data-id="">+ '+T('其他','Other')+'</button>';
  return '<p class="eyebrow" style="margin:16px 0 8px">'+T('加练','Extra practice')+'</p>'+rows+'<div class="xadds">'+adds+'</div>'}
function bodyHtml(d){const m=state.metrics[d]||{},a=intakeOf(d),g=dietGapOf(d),bits=[];
  if(a!=null)bits.push(T('摄入 ','In ')+Math.round(a)+' kcal'+(g!=null?' · '+(g>=0?T('缺口 ','deficit '):T('盈余 ','surplus '))+Math.round(Math.abs(g)):''));
  if(m.weight!=null||m.weightC!=null)bits.push(T('体重 ','Weight ')+(+(m.weight??m.weightC)).toFixed(1)+' kg');
  if(m.waist!=null)bits.push(T('腰围 ','Waist ')+m.waist+' cm');if(m.pullups!=null)bits.push(T('引体 ','Pull-ups ')+m.pullups);if(m.gm&&mainEx().id!=="pullup"&&m.gm[mainEx().id]!=null)bits.push(mainName()+' '+m.gm[mainEx().id]+' '+mainUnit());
  return bits.length?'<p class="muted" style="font-size:12px;margin-top:14px">'+bits.join(' · ')+'</p>':''}
function render(){const d=curDay,dt=dateObj(d),ss=sessionsOn(d);
  const head=LANG==="en"?["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"][dt.getDay()]+", "+MON_EN[dt.getMonth()]+" "+dt.getDate():(dt.getMonth()+1)+"月"+dt.getDate()+"日 周"+WD[dt.getDay()];
  const html='<div class="sh-h"><h3>'+(d===today()?T('今天','Today'):head)+'</h3><button class="mini" data-act="close">'+ICON.x+'</button></div>'
    +(d===today()?'<p class="muted" style="font-size:12px;margin:-8px 0 12px">'+head+'</p>':'')
    +(ss.length?ss.map(sessHtml).join(''):'<p class="muted" style="font-size:13px">'+T('这天没有完成的训练','No finished session this day')+'</p>')
    +extrasHtml(d)+bodyHtml(d);
  const body=$("#sheetBody"),sc=$("#sheet .panel").scrollTop;
  if($("#sheet").classList.contains("on")&&body.dataset.day===d){body.innerHTML=html;$("#sheet .panel").scrollTop=sc}else{openSheet(html);body.dataset.day=d}}
function openDay(d){if(d==="today")d=today();if(d>today())return;curDay=d;editSid=null;Object.keys(pending).forEach(k=>delete pending[k]);
  if(typeof run!=="undefined"&&run)closeRun();$("#sheetBody").dataset.day="";render()}
window.p1OpenDay=openDay;
function changed(){if(typeof engFree==="function"&&engFree())engPlanAll();lsSave();if(typeof renderAll==="function")renderAll();render()}
document.addEventListener("click",e=>{const b=e.target.closest("[data-act]");if(!b)return;const a=b.dataset.act;
  if(a==="cal"){openDay(b.dataset.d);return}
  if(!curDay||!$("#sheet").classList.contains("on")||$("#sheetBody").dataset.day!==curDay)return;
  if(a==="dedit"){const was=editSid;editSid=was===b.dataset.sid?null:b.dataset.sid;if(was&&!editSid){engPlanAll();changed();toast(T("已保存","Saved"))}else render();return}
  if(a==="dsv"||a==="dst"){const doc=state.sessions[b.dataset.sid],x=doc.sets[b.dataset.e][+b.dataset.i],e=BYID[b.dataset.sid].ex.find(y=>y.id===b.dataset.e);
    if(a==="dsv"){const st=e&&e.unit==="秒"?5:1;x.v=Math.max(0,(+x.v||0)+(+b.dataset.d)*st)}
    else{x.d=!x.d;if(x.d)x.o=maxOrdOf(doc)+1;else if(x.o){const o=x.o;delete x.o;Object.values(doc.sets).forEach(arr=>arr.forEach(y=>{if(y.o>o)y.o--}))}}
    lsSave();render();return}
  if(a==="xv"){const id=b.dataset.id,it=(xDocFor(curDay,false).xs||[]).find(i=>i.id===id),st=it&&it.unit==="秒"?5:1;pending[id]=Math.max(0,(pending[id]||0)+(+b.dataset.dv)*st);render();return}
  if(a==="xlog"){const doc=xDocFor(curDay,true),it=doc.xs[+b.dataset.k];it.sets.push({v:pending[it.id],d:true});if(typeof SFX!=="undefined")SFX.tick();if(typeof buzz==="function")buzz(16);if(curDay===today())celebrate(1,0);changed();return}
  if(a==="xun"){const doc=xDocFor(curDay,false),it=doc.xs[+b.dataset.k],done=it.sets.filter(x=>x.d),x=done[+b.dataset.i];it.sets.splice(it.sets.indexOf(x),1);
    if(!it.sets.length)doc.xs.splice(+b.dataset.k,1);if(doc.xs&&!doc.xs.length&&state.dayx[curDay]===doc&&!doc.note)delete state.dayx[curDay];changed();return}
  if(a==="xadd"){let id=b.dataset.id,name,unit="个";
    if(id){const q=qOf(id);name=q[1];unit=q[3]}else{name=(prompt(T("动作名字","Name of the move"))||"").trim();if(!name)return;id="c"+Date.now().toString(36);
      if(confirm(T("按秒计时吗？（取消 = 按个数）","Is it timed in seconds? (Cancel = reps)")))unit="秒"}
    const doc=xDocFor(curDay,true);doc.xs=doc.xs||[];doc.xs.push({id,name,unit,sets:[]});pending[id]=lastVal(id)??(id==="pullup"?1:unit==="秒"?30:10);lsSave();render();return}
});
})();
