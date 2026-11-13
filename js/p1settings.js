/* 推拉机 main interface: settings that used to open the classic page. Profile, goals, the food table link, charts &
   watch calories, backup and restore (the same progress file as the classic page), the first-visit welcome and the
   5-day backup reminder. Editors use the shared .mask > .sheet look (css/p1.css). */
(function(){
const SAVE='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>';
function sheet(title,body,actions){const m=document.createElement("div");m.className="mask";
  m.innerHTML='<div class="sheet" role="dialog" aria-modal="true" aria-label="'+esc(title)+'"><h3><span>'+esc(title)+'</span><button class="iconbtn" type="button" data-x aria-label="'+T("关闭","Close")+'">'+CLOSE_ICON+'</button></h3>'
    +'<div class="form-body">'+body+'</div><div class="row" style="justify-content:flex-end;gap:10px">'+(actions||'<button class="btn recsave" type="button" data-ok aria-label="'+T("保存","Save")+'">'+SAVE+'</button>')+'</div></div>';
  document.body.appendChild(m);const close=()=>m.remove();
  m.querySelector("[data-x]").addEventListener("click",close);
  let armed=false;m.addEventListener("pointerdown",e=>{armed=e.target===m});m.addEventListener("click",e=>{if(e.target===m&&armed)close()});
  return {m,close,q:s=>m.querySelector(s)}}
const num=(id,label,val,step,ph)=>'<label class="flabel">'+label+'<input id="'+id+'" type="number" inputmode="decimal" step="'+(step||0.1)+'" value="'+(val??"")+'"'+(ph?' placeholder="'+esc(ph)+'"':'')+'></label>';
const st=()=>state.settings;
function lastW(){const w=wtMerged();return w.length?w[w.length-1].y:null}
function profileBody(){const s=st();
  return '<div class="fgrid"><label class="flabel">'+T("性别","Sex")+'<select id="sx"><option value=""></option><option value="m"'+(s.sex==="m"?" selected":"")+'>'+T("男","Male")+'</option><option value="f"'+(s.sex==="f"?" selected":"")+'>'+T("女","Female")+'</option></select></label>'
    +'<label class="flabel">'+T("出生年月","Birth month")+'<input id="bm" type="month" value="'+((s.b||"").slice(0,7))+'"></label>'
    +num("hh",T("身高（cm）","Height (cm)"),s.h,0.5)+num("cw",T("现在体重（kg）","Weight now (kg)"),"",0.1,lastW()!=null?lastW().toFixed(1):"")+'</div>'}
function goalsBody(){const s=st();
  return '<div class="fgrid">'+num("gp",T("目标引体（个）","Pull-up goal (reps)"),s.p,1)+num("gf",T("目标减脂（kg）","Fat-loss goal (kg)"),s.fat,0.1)
    +num("gw",T("目标体重（kg）","Target weight (kg)"),s.w,0.1)+num("gz",T("目标腰围（cm）","Target waist (cm)"),s.z,0.1)+'</div>'}
function saveProfile(q){const s=st();s.sex=q("#sx").value||null;s.b=q("#bm").value||null;
  const h=numOrNull(q("#hh").value);if(h==null||h<100||h>230){s.h=s.hC||null;s.hSrc="coros"}else{s.h=h;s.hSrc="manual"}
  const w=numOrNull(q("#cw").value);if(w!=null&&w>=20&&w<=300)saveMetric(today(),{weight:+w.toFixed(1)})}
function saveGoals(q){const s=st();[["gp","p",1],["gf","fat"],["gw","w"],["gz","z"]].forEach(([id,k,int])=>{const v=numOrNull(q("#"+id).value);if(v==null||v<=0)delete s[k];else s[k]=int?Math.round(v):v})}
function openProfile(){const S=sheet(T("个人资料","Profile"),profileBody()+'<p class="calc-msg">'+T("用来算基础代谢和热量缺口。","Used for your resting burn and calorie gap.")+'</p>');
  S.q("[data-ok]").addEventListener("click",()=>{saveProfile(S.q);lsSave();S.close();renderAll();toast(T("已保存","Saved"))})}
function openGoals(){const S=sheet(T("目标","Goals"),goalsBody()+'<p class="calc-msg">'+T("留空就是不设。","Leave blank for no goal.")+'</p>');
  S.q("[data-ok]").addEventListener("click",()=>{saveGoals(S.q);lsSave();S.close();renderAll();toast(T("目标已保存","Goals saved"))})}
/* first visit: everything can stay blank and be changed later from the avatar */
function openWelcome(){const S=sheet(T("欢迎来到推拉机","Welcome to track-TOR"),'<p class="calc-msg" style="margin:0">'+T("填几项，热量和目标进度才算得准。都可以留空，以后点右上角头像改。","A few details make the calorie and goal maths right. All optional; change them later from the avatar.")+'</p>'+profileBody()+goalsBody());
  S.q("[data-ok]").addEventListener("click",()=>{saveProfile(S.q);saveGoals(S.q);lsSave();S.close();renderAll();setTimeout(()=>openPlan(true),350)})}
function sheetStatusTxt(){let s=null;try{s=JSON.parse(localStorage.getItem(SHEET_STATUS_K)||"null")}catch(e){}
  if(!s)return T("还没有同步","Not synced yet");return s.ok?T("上次同步 ","Last synced ")+s.at+T(" · "+s.rows+" 条 / "+s.days+" 天"," · "+s.rows+" rows / "+s.days+" days"):s.msg}
function openTable(){let url="";try{url=localStorage.getItem(SHEET_URL_K)||""}catch(e){}
  const S=sheet(T("饮食表格","Food table"),'<label class="flabel">'+T("表格的分享链接","The table's share link")+'<input id="tu" type="url" placeholder="'+T("粘贴表格的分享链接","Paste your sheet's share link")+'" value="'+esc(url)+'"></label>'
    +'<p class="calc-msg" id="ts">'+esc(sheetStatusTxt())+'</p><p class="calc-msg">'+T("表格设成知道链接的人都能查看，要有「日期」和「食物」两列，一行一种食物。打开饮食页会自动拉，往下拉饮食页立刻拉。","Share the table so anyone with the link can view; it needs Date and Food columns, one food per row. Opening Diet pulls it; pull the Diet page down to pull now.")+'</p>',
    '<button class="btn ghost" type="button" data-pull>'+T("保存并拉取","Save and pull")+'</button>');
  S.q("[data-pull]").addEventListener("click",async()=>{const v=extractUrl(S.q("#tu").value);try{if(v)localStorage.setItem(SHEET_URL_K,v);else localStorage.removeItem(SHEET_URL_K)}catch(e){}
    S.q("#ts").textContent=T("拉取中…","Pulling…");const r=await pullSheetQuiet({});S.q("#ts").textContent=r.ok?r.note:sheetStatusTxt();if(r.ok)renderAll()})}
const SYNCS=[["sleep","睡眠","Sleep"],["hrv","HRV","HRV"],["rhr","静息心率","Resting HR"],["weight","体重","Weight"]];
function syncOnP(k){const s=st().sync;return !s||s[k]!==false}
function openCharts(){const full=!!st().watchFull;
  const S=sheet(T("图表、同步和手表热量","Charts, sync & watch calories"),'<p class="eyebrow">'+T("从高驰同步哪些","What to sync from COROS")+'</p><div class="chips">'+SYNCS.map(([k,z,e])=>'<button type="button" class="chip" data-sync="'+k+'" aria-pressed="'+syncOnP(k)+'">'+T(z,e)+'</button>').join("")+'</div>'
    +'<p class="eyebrow" style="margin-top:6px">'+T("手表热量","Watch calories")+'</p><div class="mode-tabs" role="group"><button type="button" data-wf="0" class="'+(full?"":"active")+'">'+T("打折","Discounted")+'</button><button type="button" data-wf="1" class="'+(full?"active":"")+'">'+T("全算","In full")+'</button></div>'
    +'<p class="calc-msg">'+T("只改估算的消耗、缺口和减脂，同步来的数字不变。打折：日常活动最多按步数估算的 1.5 倍加 120 kcal，运动记录 × 0.7，低强度运动 × 0.5，有功率计的骑行全算。全算：手表报多少算多少。","Changes only the estimated burn, gap and fat loss; synced numbers stay. Discounted: everyday movement up to 1.5 × what the steps allow plus 120 kcal, workouts × 0.7, low-intensity ones × 0.5, power-meter rides in full. In full: every kcal the watch reports.")+'</p>','<span></span>');
  S.m.addEventListener("click",e=>{const c=e.target.closest("[data-sync]");if(c){const s=Object.assign({},st().sync||{}),on=!syncOnP(c.dataset.sync);s[c.dataset.sync]=on;st().sync=s;c.setAttribute("aria-pressed",String(on));lsSave();renderAll();return}
    const w=e.target.closest("[data-wf]");if(w){const on=w.dataset.wf==="1";if(on)st().watchFull=true;else delete st().watchFull;S.m.querySelectorAll("[data-wf]").forEach(b=>b.classList.toggle("active",b===w));lsSave();renderAll();toast(on?T("手表热量全算","Watch calories in full"):T("手表热量打折","Watch calories discounted"))}})}
/* backup: the same progress file as the classic page (js/backupcore.js); iPhone home-screen apps save through the share sheet */
async function saveBackup(){const name=backupFileName(),file=new File([await encodeBackup()],name,{type:"text/plain"});
  const ios=/iP(hone|ad|od)/.test(navigator.userAgent);
  if(ios&&navigator.canShare&&navigator.canShare({files:[file]})){try{await navigator.share({files:[file]});markBackedUp();toast(T("进度文件已保存","Progress file saved"))}catch(e){if(!e||e.name!=="AbortError")toast(T("保存失败，请再试一次","Couldn't save; try again"))}return}
  const url=URL.createObjectURL(file),a=document.createElement("a");a.href=url;a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1e4);
  markBackedUp();toast(T("已保存 "+name,"Saved "+name))}
function applyImport(j){state.sessions=j.sessions;state.metrics=j.metrics;if(j.diet)state.diet=j.diet;if(j.settings)state.settings=j.settings;if(j.dayx)state.dayx=j.dayx;
  if(j.extras)moveDatedExtras(j.extras);registerPlanned(state.sessions);
  let has=false;try{has=!!localStorage.getItem("tracktor-coros-token")}catch(e){}
  if(j.tk&&!has){try{localStorage.setItem("tracktor-coros-token",JSON.stringify(j.tk))}catch(e){}}
  lsSave();engPlanAll();renderAll();toast(T("进度已导入","Progress imported"))}
function openBackup(){const t=lastBackupTs();
  const S=sheet(T("备份进度","Backup"),'<p class="calc-msg" style="margin:0">'+T("记录都存在这台手机的浏览器里，浏览器偶尔会清空。存一个进度文件，换手机或出问题时选它恢复。进度文件带着高驰授权，别发给别人。","Your records live in this phone's browser, which sometimes clears data. Save a progress file and pick it to restore on a new phone or after a problem. It carries your COROS sign-in; don't share it.")+'</p>'
    +'<p class="calc-msg">'+(t?T("上次备份 ","Last backup ")+new Date(t).toLocaleDateString(LANG==="en"?"en-US":"zh-CN"):T("还没备份过","Never backed up"))+'</p>'
    +'<button class="btn" type="button" data-bksave style="height:48px;font-size:15px;width:100%">'+T("保存进度文件","Save a progress file")+'</button>'
    +'<button class="btn ghost" type="button" data-bkload style="height:48px;font-size:15px;width:100%">'+T("从进度文件恢复","Restore from a progress file")+'</button><input type="file" accept=".txt,text/plain" data-bkfile hidden>'
    +'<p class="calc-msg" id="bkm"></p><div class="row" id="bkc" hidden style="gap:8px"><button class="btn ghost" type="button" data-bkno>'+T("取消","Cancel")+'</button><button class="btn recsave" type="button" data-bkyes style="width:auto;padding:0 18px">'+T("导入","Import")+'</button></div>'
    +(readCorosToken()?'<p class="eyebrow" style="margin-top:6px">'+T("高驰已连接","COROS connected")+'</p><div class="row" style="gap:8px"><button class="btn ghost" type="button" data-co="keep" style="flex:1">'+T("登出，保留数据","Sign out, keep data")+'</button><button class="btn ghost" type="button" data-co="wipe" style="flex:1;color:var(--bad)">'+T("登出并清除同步的数据","Sign out and delete synced data")+'</button></div>'
      :'<button class="btn ghost" type="button" data-co="connect" style="height:44px;font-size:14px;width:100%">'+T("连接高驰","Connect COROS")+'</button>'),'<span></span>');
  S.m.addEventListener("click",e=>{const c=e.target.closest("[data-co]");if(!c)return;
    if(c.dataset.co==="connect"){S.close();promptCorosToken();return}
    const wipe=c.dataset.co==="wipe";if(!confirm(wipe?T("登出高驰并清除同步来的数据？手动记录的不动。","Sign out of COROS and delete what it synced? Manual records stay."):T("登出高驰？数据都保留。","Sign out of COROS? All data stays.")))return;
    corosLogout(wipe);S.close();renderAll()});
  let pending=null;
  S.q("[data-bksave]").addEventListener("click",saveBackup);
  S.q("[data-bkload]").addEventListener("click",()=>S.q("[data-bkfile]").click());
  S.q("[data-bkfile]").addEventListener("change",async e=>{const f=e.target.files[0];if(!f)return;let j;try{j=await decodeBackup(await f.text())}catch(err){toast(T("这不是有效的进度文件","Not a valid progress file"));return}
    pending=j;const n=Object.values(j.sessions).filter(s=>s&&s.done).length,m=Object.keys(j.metrics).length,d=j.diet?Object.keys(j.diet).length:0;
    S.q("#bkm").textContent=T("含 "+n+" 次完成训练、"+m+" 天身体数据"+(d?"、"+d+" 天饮食":"")+"，导入会覆盖当前进度。","Contains "+n+" finished sessions, "+m+" days of body data"+(d?", "+d+" days of food":"")+". Importing replaces current progress.");S.q("#bkc").hidden=false});
  S.q("[data-bkno]").addEventListener("click",()=>{pending=null;S.q("#bkc").hidden=true;S.q("#bkm").textContent=""});
  S.q("[data-bkyes]").addEventListener("click",()=>{if(!pending)return;applyImport(pending);S.close()})}
/* training plan: pick a preset (1–3 training days) and rename its days */
function openPlan(first){const cur=st().plan,curId=cur?cur.id:"cyclist";
  const names=(cur?cur.days:PRESETS[0].days).map(d=>'<label class="flabel">'+T("第 "+"ABC"[["push","pull","third"].indexOf(d.kind)]+" 天叫什么","Name of day "+"ABC"[["push","pull","third"].indexOf(d.kind)])+'<input data-dn="'+d.kind+'" value="'+esc(T(d.zh,d.en||d.zh))+'"></label>').join("");
  const S=sheet(T("训练计划","Training plan"),(first?'<p class="calc-msg" style="margin:0">'+T("选一个开始，以后在设定 › 训练计划里换或改名。引擎会按你每次的表现调整次数和组数。","Pick one to start; change or rename it later in Settings › Training plan. The engine tunes reps and sets to how you do.")+'</p>':'')
    +PRESETS.map(p=>'<button type="button" class="preset'+(p.id===curId?' on':'')+'" data-pre="'+p.id+'"><b>'+T(p.zh,p.en)+'</b><span class="muted">'+T(p.dz,p.de)+'</span><span class="pdays">'+p.days.map(d=>'<i style="background:var(--k'+d.kind+')"></i>'+T(d.zh,d.en)).join("")+'</span></button>').join("")
    +(cur?'<p class="eyebrow" style="margin-top:6px">'+T("训练日的名字","Day names")+'</p><div class="fgrid">'+names+'</div>':''));
  S.m.addEventListener("click",e=>{const b=e.target.closest("[data-pre]");if(!b)return;const id=b.dataset.pre;
    if(id===(st().plan&&st().plan.id)){return}
    const p=PRESETS.find(x=>x.id===id);if(!first&&!confirm(T("换成「"+p.zh+"」？接下来的训练按新计划排，练过的记录不动。","Switch to "+p.en+"? Upcoming sessions follow the new plan; past records stay.")))return;
    setPlan(id);S.close();renderAll();toast(T("训练计划：","Plan: ")+T(p.zh,p.en));if(first)return;openPlan(false)});
  if(S.q("[data-ok]"))S.q("[data-ok]").addEventListener("click",()=>{const pl=st().plan;if(pl)S.m.querySelectorAll("[data-dn]").forEach(i=>{const d=pl.days.find(x=>x.kind===i.dataset.dn),v=i.value.trim();if(d&&v){if(LANG==="en")d.en=v;else d.zh=v}});
    if(!pl&&!first)setPlan("cyclist");lsSave();S.close();renderAll();toast(T("已保存","Saved"))})}
const OPEN={plan:()=>openPlan(false),profile:openProfile,goals:openGoals,table:openTable,charts:openCharts,backup:openBackup};
window.p1Open=k=>{if(typeof closeSheet==="function")closeSheet();OPEN[k]()};
/* first visit and the 5-day backup reminder */
setTimeout(()=>{let seen=false;try{seen=localStorage.getItem("tracktor-p1-welcomed")==="1"}catch(e){}
  if(FRESH&&!seen){try{localStorage.setItem("tracktor-p1-welcomed","1")}catch(e){}openWelcome();return}
  if(backupRemindDue()){const S=sheet(T("该备份进度了","Time to back up"),'<p class="calc-msg" style="margin:0">'+T("浏览器偶尔会清空本地数据，建议每 5 天存一次进度文件。","Browsers sometimes clear local data; save a progress file every 5 days or so.")+'</p>','<button class="btn ghost" type="button" data-later>'+T("以后","Later")+'</button><button class="btn recsave" type="button" data-now style="width:auto;padding:0 18px">'+T("现在保存","Save now")+'</button>');
    S.q("[data-later]").addEventListener("click",()=>{markBackedUp();S.close()});S.q("[data-now]").addEventListener("click",()=>{S.close();saveBackup()})}},900);
})();
