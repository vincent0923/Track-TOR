/* ---------- backup: the classic page's controls (the format, packing and the reminder clock live in js/backupcore.js) ---------- */
/* iPhone 主屏应用不支持直接下载，走系统分享里的「存储到文件」；其他设备直接存到下载目录 */
document.getElementById("bkSave").addEventListener("click",async()=>{
  const name=backupFileName(), file=new File([await encodeBackup()],name,{type:"text/plain"});
  const isIOS=/iP(hone|ad|od)/.test(navigator.userAgent);
  if(isIOS&&navigator.canShare&&navigator.canShare({files:[file]})){
    try{await navigator.share({files:[file]});markBackedUp();toast(T("进度文件已保存","Progress file saved"))}
    catch(e){if(!e||e.name!=="AbortError")toast(T("保存失败，请再试一次","Couldn't save — please try again"))}
    return;
  }
  const url=URL.createObjectURL(file), a=document.createElement("a");
  a.href=url;a.download=name;document.body.appendChild(a);a.click();a.remove();
  setTimeout(()=>URL.revokeObjectURL(url),10000);
  markBackedUp();
  toast(T("已保存 "+name+"，在手机的「下载」文件夹","Saved "+name+" to your Downloads folder"));
});
let pendingImport=null;
async function stageImport(text){
  let j; try{j=await decodeBackup(text)}catch(e){toast(T("这不是有效的进度文件","Not a valid progress file"));return}
  pendingImport=j;
  const n=Object.values(j.sessions).filter(s=>s&&s.done).length, m=Object.keys(j.metrics).length;
  const dCount=j.diet?Object.keys(j.diet).length:0;
  const xCount=Object.values(j.sessions).filter(s=>s&&s.xs&&xSummary(s.xs)).length+(j.extras?Object.keys(j.extras).filter(d=>j.extras[d].some(it=>it.sets.some(x=>x.d))).length:0);
  const dTxt=(xCount?T("、"+xCount+" 次加练",", "+xCount+" extra practice logs"):"")+(dCount?T("、"+dCount+" 天饮食记录",", "+dCount+" days of diet logs"):"");
  document.getElementById("bkMsg").textContent=T("含 "+n+" 次完成训练、"+m+" 天身体数据"+dTxt+"，导入会覆盖当前进度。","Contains "+n+" finished sessions, "+m+" days of body data"+dTxt+". Importing overwrites current progress.");
  document.getElementById("bkConfirm").hidden=false;
}
document.getElementById("bkRead").addEventListener("click",()=>document.getElementById("bkFile").click());
document.getElementById("bkFile").addEventListener("change",async e=>{
  const f=e.target.files&&e.target.files[0];
  e.target.value="";
  if(!f)return;
  try{stageImport(await f.text())}catch(err){toast(T("读取文件失败","Couldn't read the file"))}
});
document.getElementById("bkPasteShow").addEventListener("click",()=>{const w=document.getElementById("bkPasteWrap");w.hidden=!w.hidden;if(!w.hidden)document.getElementById("bkPaste").focus()});
document.getElementById("bkPasteGo").addEventListener("click",()=>{const v=document.getElementById("bkPaste").value.trim();if(!v){toast(T("先粘贴进度文本","Paste the progress text first"));return}stageImport(v)});
document.getElementById("bkNo").addEventListener("click",()=>{pendingImport=null;document.getElementById("bkConfirm").hidden=true});
document.getElementById("bkYes").addEventListener("click",async()=>{
  if(!pendingImport)return;
  state.sessions=pendingImport.sessions;state.metrics=pendingImport.metrics;if(pendingImport.diet)state.diet=pendingImport.diet;  /* files without diet keep the current diet */
  if(pendingImport.settings)state.settings=pendingImport.settings;
  if(pendingImport.dayx)state.dayx=pendingImport.dayx;
  if(pendingImport.extras)moveDatedExtras(pendingImport.extras);
  initDiet();
  /* 这台设备已连接时保留现有授权，备份里的可能已经过期 */
  if(pendingImport.tk && !readCorosToken()){
    try{ localStorage.setItem("tracktor-coros-token", JSON.stringify(pendingImport.tk)); }catch(e){}
    connectMcp();
  }
  pendingImport=null;document.getElementById("bkConfirm").hidden=true;document.getElementById("bkPasteWrap").hidden=true;document.getElementById("bkPaste").value="";
  lsSave();
  openDays.clear();renderAll();toast(T("训练与饮食进度已导入","Progress imported"));
});

function maybeRemindBackup(){
  try{
    if(!backupRemindDue()) return;
    /* 延迟到页面渲染稳定后弹提醒 */
    setTimeout(()=>{
      const mask = document.createElement("div");
      mask.className = "mask";
      mask.innerHTML = `<div class="sheet" role="dialog" aria-modal="true" aria-label="${T("备份提醒","Backup reminder")}" style="max-width:480px">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">
          <b style="font-size:16px">${T("该备份进度了","Time to back up")}</b>
          <button type="button" data-close class="iconbtn" aria-label="${T("关闭","Close")}">${CLOSE_ICON}</button>
        </div>
        <p class="sub" style="margin:0 0 12px">${T(
          "浏览器偶尔会清空本地数据。建议每 5 天备份一次：在「设定」里打开「备份进度」，保存进度文件，需要时选这个文件恢复。",
          "Browsers occasionally clear local data. Every 5 days or so, open Back up progress under Settings and save a progress file. Pick that file to restore."
        )}</p>
        <button id="bkRemindOk" type="button" class="btn" style="width:100%;background:var(--cta);font-size:15px;padding:12px">${T("确定","OK")}</button>
      </div>`;
      document.body.appendChild(mask);
      const close = ()=>{ mask.remove(); };
      mask.querySelector("[data-close]").addEventListener("click", close);
      mask.addEventListener("click", e=>{ if(e.target===mask) close(); });
      mask.querySelector("#bkRemindOk").addEventListener("click", close);
    }, 1200);
  }catch(e){}
}
/* 用户真正保存进度文件后，才记录已备份时间（见 bkSave 的监听） */
