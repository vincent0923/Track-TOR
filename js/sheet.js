/* ---------- diet data source: the classic page's controls (parsing and pulling live in js/sheetcore.js) ---------- */
/* the sync icon at the right of "Food logs" is a lamp: while any pull runs it spins and its arrows breathe red;
   a good pull leaves it a steady green (until the pull is two hours old), a failed one a steady red.
   Colours and the way it turns follow the theme (css). It spins for at least a moment so a quick pull still shows. */
const DIET_LAMP_MIN = 900;
let dietLampT0 = 0, dietLampTm = 0;
function setDietLamp(st){
  const b = document.getElementById("dietSyncBtn"); if(!b) return;
  clearTimeout(dietLampTm);
  if(st === "busy"){ dietLampT0 = performance.now(); b.dataset.lamp = "busy"; b.setAttribute("aria-busy", "true"); return; }
  const wait = b.dataset.lamp === "busy" ? Math.max(0, DIET_LAMP_MIN - (performance.now() - dietLampT0)) : 0;
  dietLampTm = setTimeout(()=>{ b.removeAttribute("aria-busy"); if(st) b.dataset.lamp = st; else delete b.dataset.lamp; }, wait);
}
function paintVerify(){
  let st = {}; try{ st = JSON.parse(localStorage.getItem(SHEET_STATUS_K) || "{}") || {}; }catch(e){}
  const inp = document.getElementById("dsrcUrl");
  if(st.ok && inp && validSheetUrl(inp.value)) setVerify("ok");
}
function paintDietLamp(){
  const b = document.getElementById("dietSyncBtn"); if(!b || b.dataset.lamp === "busy") return;
  let st = {}; try{ st = JSON.parse(localStorage.getItem(SHEET_STATUS_K) || "{}") || {}; }catch(e){}
  setDietLamp(st.ok && st.ts && Date.now() - st.ts < SHEET_AUTO_MS ? "ok" : (b.dataset.lamp === "fail" ? "fail" : ""));
}
/* the ✓ in Settings › Food table checks the link by pulling it: it breathes while reading, then shows a green tick
   (the link works and the table has the right columns) or turns red; typing in the box clears it */
function setVerify(st){ const v = document.getElementById("dsrcPull"); if(!v) return; if(st) v.dataset.v = st; else delete v.dataset.v; }
async function pullSheet(opts){
  setDietLamp("busy"); setVerify("busy");
  let r;
  try{ r = await pullSheetOnce(opts); }
  catch(e){ setDietLamp("fail"); setVerify("fail"); throw e; }
  setDietLamp(r.ok ? "ok" : "fail"); setVerify(r.ok ? "ok" : "fail");
  return r;
}
/* returns { ok, rows, days, note }; opts.silent = the caller shows the message itself */
async function pullSheetOnce(opts){
  opts = opts || {};
  const inp = document.getElementById("dsrcUrl"), btn = document.getElementById("dsrcPull");
  let url = extractUrl(inp.value);
  inp.value = url;
  try{ if(url) localStorage.setItem(SHEET_URL_K, url); else localStorage.removeItem(SHEET_URL_K); }catch(e){}
  const fail = msg => { setSheetStatus({ ok:false, msg }); return { ok:false, note:msg }; };
  if(!url) return fail(T("先粘贴表格链接", "Paste the sheet link first"));
  if(!/^https?:\/\//i.test(url)) url = "https://" + url;
  if(navigator.onLine === false) return fail(T("没有网络，连上后再拉取", "You're offline; pull again once connected"));
  btn.disabled = true;
  try{
    const res = await readSheetRows(url);
    /* ✕ = blocked or unreachable, ∅ = reply had no table, a number = HTTP status */
    if(!res.rows) return fail(T("读不到表格数据。请确认：① 表格设成了所有人（知道链接的任何人）可查看；② 表格里有「日期」和「食物」这两列。", "Couldn't read table data. Check: ① anyone with the link can view the sheet; ② it has Date and Food columns.") + "（" + res.notes.join(" · ") + "）");
    const { days, notes, rows } = sheetDays(res.rows);
    const nDays = Object.keys(days).length;
    applySheetDays(days, notes);
    lsSave(); dietState.open = latestDietOpenSet(state.diet); renderDietAll();
    const d = new Date();
    setSheetStatus({ ok:true, msg:"", ts: Date.now(), at: pad(d.getMonth()+1) + "-" + pad(d.getDate()) + " " + pad(d.getHours()) + ":" + pad(d.getMinutes()), rows, days: nDays });
    const note = T("已拉取 " + rows + " 条 / " + nDays + " 天", "Pulled " + rows + " rows / " + nDays + " days");
    if(!opts.silent) toast(note);
    return { ok:true, rows, days:nDays, note };
  }finally{ btn.disabled = false; }
}

/* a link counts as valid when it looks like a web address (domain with a dot) */
function validSheetUrl(v){ return /^(https?:\/\/)?[^\s\/]+\.[^\s\/]+/i.test(extractUrl(v || "")); }
/* the sync icon at the right of "Food logs" is greyed out until a valid link is saved (it still answers a tap with a hint) */
function paintSyncCap(){
  const b = document.getElementById("dietSyncBtn"), inp = document.getElementById("dsrcUrl"); if(!b || !inp) return;
  const off = !validSheetUrl(inp.value);
  b.classList.toggle("off", off); b.setAttribute("aria-disabled", String(off));
}
function copyText(t){
  if(navigator.clipboard && window.isSecureContext) return navigator.clipboard.writeText(t);
  return new Promise((ok, no)=>{
    const ta = document.createElement("textarea"); ta.value = t; ta.setAttribute("readonly", ""); ta.style.position = "fixed"; ta.style.opacity = "0";
    document.body.appendChild(ta); ta.select();
    try{ document.execCommand("copy") ? ok() : no(); }catch(e){ no(e); } finally{ ta.remove(); }
  });
}

(function initSheetSource(){
  const inp = document.getElementById("dsrcUrl"), info = document.getElementById("dsrcInfo"), ib = document.getElementById("dsrcInfoBtn");
  try{ inp.value = localStorage.getItem(SHEET_URL_K) || ""; }catch(e){}
  ib.addEventListener("click", ()=>{
    info.hidden = !info.hidden; ib.setAttribute("aria-expanded", String(!info.hidden));
  });
  /* Pull: the table, plus the watch calories when COROS is connected */
  const pullBtn = document.getElementById("dsrcPull");
  const pullAll = async ()=>{
    const r = await pullSheet({ silent:true });
    const cal = mcp ? await syncCalories() : "";
    sfx(r.ok ? "syncok" : "syncfail");
    if(r.ok) toast(r.note + cal);
    else if(cal) toast(cal.replace(/^[；;]\s*/, ""));
  };
  const pull = async ()=>{
    if(pullBtn.disabled) return;
    await pullAll();
    if(pullBtn.dataset.v === "ok"){ fireworks(2); pullBtn.classList.remove("pop"); void pullBtn.offsetWidth; pullBtn.classList.add("pop"); }
  };
  pullBtn.addEventListener("click", pull);
  /* the sync icon at the right of "Food logs": a tap pulls straight away (or, without a link, says how to add one);
     holding it opens Settings › Food table, where the link and how it works live */
  const syncBtn = document.getElementById("dietSyncBtn");
  let held = false, tm = 0;
  const openSettings = ()=>{ setTab("me"); const f = document.getElementById("foldDietSrc"); if(f){ f.open = true; f.scrollIntoView({ behavior:"smooth", block:"start" }); } };
  syncBtn.addEventListener("pointerdown", ()=>{ held = false; clearTimeout(tm); tm = setTimeout(()=>{ held = true; if(navigator.vibrate) navigator.vibrate(15); openSettings(); }, 550); });
  ["pointerup","pointerleave","pointercancel"].forEach(t=>syncBtn.addEventListener(t, ()=>clearTimeout(tm)));
  syncBtn.addEventListener("contextmenu", e=>e.preventDefault());
  syncBtn.addEventListener("click", e=>{
    if(held){ held = false; e.stopImmediatePropagation(); return; }
    if(syncBtn.classList.contains("off")){ toast(T("还没填同步饮食记录的链接，长按这个按钮进入设置", "No food table link yet — hold this button to set it")); return; }
    if(!pullBtn.disabled && syncBtn.dataset.lamp !== "busy") pullAll();
  });
  inp.addEventListener("input", ()=>{ paintSyncCap(); setVerify(""); });
  inp.addEventListener("keydown", e=>{ if(e.key === "Enter") pull(); });
  inp.addEventListener("change", ()=>{ inp.value = extractUrl(inp.value); paintSyncCap(); });
  /* paste button: every tap replaces the box with what's on the clipboard (only the link, if there is more text) */
  document.getElementById("dsrcPaste").addEventListener("click", async ()=>{
    let t = "";
    try{ t = await navigator.clipboard.readText(); }
    catch(e){ inp.focus(); toast(T("读不到剪贴板，请长按输入框粘贴", "Can't read the clipboard; long-press the box to paste")); return; }
    if(!String(t).trim()){ toast(T("剪贴板是空的", "The clipboard is empty")); return; }
    inp.value = extractUrl(t);
    try{ localStorage.setItem(SHEET_URL_K, inp.value); }catch(e){}
    paintSyncCap(); setVerify("");
  });
  /* two prompt versions: Google Sheets (global) and Tencent Docs with WorkBuddy (China) */
  let ver = null; try{ ver = localStorage.getItem(PROMPT_VER_K); }catch(e){}
  if(ver !== "g" && ver !== "t"){ let tz = ""; try{ tz = Intl.DateTimeFormat().resolvedOptions().timeZone || ""; }catch(e){} ver = /^Asia\/(Shanghai|Urumqi|Chongqing|Harbin)$/.test(tz) ? "t" : "g"; }
  const setVer = v=>{
    ver = v; try{ localStorage.setItem(PROMPT_VER_K, v); }catch(e){}
    document.querySelectorAll("#dsrcVer [data-ver]").forEach(b=>{ b.classList.toggle("active", b.dataset.ver===v); b.setAttribute("aria-selected", String(b.dataset.ver===v)); });
    document.querySelectorAll("#dsrcInfo [data-verpane]").forEach(p=>{ p.hidden = p.dataset.verpane !== v; });
  };
  setVer(ver);
  document.getElementById("dsrcVer").addEventListener("click", e=>{ const b = e.target.closest("[data-ver]"); if(b) setVer(b.dataset.ver); });
  /* the prompts are fixed text: what you see is what you copy */
  const pg = document.getElementById("dsrcPromptG"), pt = document.getElementById("dsrcPromptT");
  info.addEventListener("click", e=>{
    const cb = e.target.closest("[data-copy]"); if(!cb) return;
    copyText((cb.dataset.copy === "t" ? pt : pg).textContent)
      .then(()=>{ cb.textContent = T("已复制", "Copied"); setTimeout(()=>{ cb.innerHTML = '<span class="zh">复制</span><span class="en">Copy</span>'; }, 1500); })
      .catch(()=>toast(T("复制失败，请长按选择文字复制", "Couldn't copy; select the text and copy it")));
  });
  paintSheetStatus();
  paintSyncCap();
})();
/* placeholder and status follow the language switch */
function paintSheetLang(){
  const inp = document.getElementById("dsrcUrl"); if(inp) inp.placeholder = T("粘贴表格的分享链接", "Paste your sheet's share link");
  paintSheetStatus();
}
paintSheetLang();

/* opening the app pulls the table in the background when the last pull is over 2 hours old
   (and tries at most once per 2 hours if it keeps failing) */
const SHEET_AUTO_MS = 2 * 3600e3, SHEET_TRY_K = LS + "-sheet-try";
async function autoPullSheet(){
  let saved = ""; try{ saved = localStorage.getItem(SHEET_URL_K) || ""; }catch(e){}
  if(!saved || navigator.onLine === false) return;
  let st = {}, tried = 0;
  try{ st = JSON.parse(localStorage.getItem(SHEET_STATUS_K) || "{}") || {}; tried = +localStorage.getItem(SHEET_TRY_K) || 0; }catch(e){}
  const now = Date.now();
  if(st.ok && st.ts && now - st.ts < SHEET_AUTO_MS) return;
  if(now - tried < SHEET_AUTO_MS) return;
  try{ localStorage.setItem(SHEET_TRY_K, String(now)); }catch(e){}
  const inp = document.getElementById("dsrcUrl"); if(inp && !inp.value.trim()) inp.value = saved;
  if(document.getElementById("dsrcPull").disabled) return;
  await pullSheet({ silent:true });
}
/* opening the Diet view pulls the table in the background whenever a link is saved; the fill
   animation runs on the Diet tab button. Repeated taps within half a minute don't pull again. */
const SHEET_TAB_MS = 30e3;
function dietTabPull(){
  let saved = ""; try{ saved = localStorage.getItem(SHEET_URL_K) || ""; }catch(e){}
  saved = extractUrl(saved);
  if(!validSheetUrl(saved) || navigator.onLine === false) return;
  const tab = document.querySelector('nav.tabs [data-tab="diet"]'), pullBtn = document.getElementById("dsrcPull");
  if(!tab || tab.dataset.prog || pullBtn.disabled) return;
  let st = {}; try{ st = JSON.parse(localStorage.getItem(SHEET_STATUS_K) || "{}") || {}; }catch(e){}
  if(st.ok && st.ts && Date.now() - st.ts < SHEET_TAB_MS) return;
  const inp = document.getElementById("dsrcUrl"); if(!inp.value.trim()) inp.value = saved;
  withProgress(tab, ()=>pullSheet({ silent:true }));
}
document.addEventListener("visibilitychange", ()=>{ if(document.visibilityState === "visible"){ paintDietLamp(); autoPullSheet(); } });
paintDietLamp(); paintVerify();
