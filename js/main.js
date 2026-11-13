/* startup: runs after every other script has defined its functions */
lsLoad(); renderAll();
if(!lsOk)toast(T("这个浏览器不允许保存数据，请用 Chrome 打开，或常保存进度文件","This browser can't save data — open in Chrome, or save a progress file often"));
syncUI(); connectMcp(); handleCorosCallback();
/* first visit gets the welcome sheet; otherwise the 5-day backup reminder (not on the way back from COROS) */
if(FRESH && !/[?&]code=/.test(location.search)) showWelcome(); else maybeRemindBackup();
initDiet();
autoPullSheet();
/* open on the home tab: whatever sits in the middle of the dock (needs every pane's render functions, so it runs last) */
setTab(homeTab());
/* arriving from the main interface (index.html) for something it doesn't have yet: ?go= names the spot, and a
   back pill returns to it. go=sync, goals, fold:<id> a Settings panel,
   welcome the first-visit sheet (already shown on a fresh start). */
(function(){const q=new URLSearchParams(location.search),g=q.get("go");
  let back=false;try{if(g)sessionStorage.setItem(LS+"-fromp1","1");back=sessionStorage.getItem(LS+"-fromp1")==="1"}catch(e){}
  if(back){const b=document.createElement("button");b.type="button";b.className="backp1";
    b.innerHTML='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m15 6-6 6 6 6"/></svg>'+T("返回","Back");
    b.addEventListener("click",()=>{try{sessionStorage.removeItem(LS+"-fromp1")}catch(e){}location.href="./"});document.body.appendChild(b)}
  if(!g)return;
  history.replaceState(null,"",location.pathname);
  if(g==="sync"){document.getElementById("syncBtn").click()}
  else if(g==="goals"){setTab("goals")}
  else if(g.startsWith("fold:")){setTab("me");const f=document.getElementById(g.slice(5));if(f){f.open=true;setTimeout(()=>f.scrollIntoView({behavior:"smooth",block:"start"}),60)}}
})();


let deferredPrompt = null;
window.addEventListener("beforeinstallprompt", e => {
  e.preventDefault();
  deferredPrompt = e;
  const btn = document.getElementById("pwaInstallBtn");
  if(btn){
    btn.style.display = "inline-flex";
    btn.onclick = async () => {
      btn.style.display = "none";
      if(deferredPrompt){
        deferredPrompt.prompt();
        await deferredPrompt.userChoice;
        deferredPrompt = null;
      }
    };
  }
});
window.addEventListener("appinstalled", () => {
  const btn = document.getElementById("pwaInstallBtn");
  if(btn) btn.style.display = "none";
});

if('serviceWorker' in navigator){
  window.addEventListener('load', ()=>{
    navigator.serviceWorker.register('./sw.js').catch(()=>{});
  });
}
