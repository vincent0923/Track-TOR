/* ---------- diet data source: an online table (shared by both pages) ----------
   The user pastes the table's ordinary share link (shared so anyone with the link can view).
   Columns date,item,p,f,c,veg,kcal, one food per row.
   Days found in the sheet replace the local diet for those dates; other dates, and every
   non-diet record (weight, waist, heart rate, training), are left alone. */
const SHEET_URL_K = "dietSheetUrl", SHEET_STATUS_K = LS + "-sheet-status";
const PROMPT_VER_K = LS + "-prompt-ver";

/* RFC 4180: quoted fields may hold the delimiter, line breaks and doubled quotes ("").
   The delimiter is guessed from the first line: comma, tab or semicolon. */
function parseCsv(text){
  const rows = []; let row = [], field = "", q = false, i = 0;
  text = String(text).replace(/^\uFEFF/, "");
  const first = text.split(/\r?\n/, 1)[0];
  const D = first.includes("\t") ? "\t" : /^\s*\|/.test(first) || /\|.*\|/.test(first) ? "|" : /｜/.test(first) ? "｜" : (first.split(";").length > first.split(",").length ? ";" : ",");
  while(i < text.length){
    const ch = text[i];
    if(q){
      if(ch === '"'){ if(text[i+1] === '"'){ field += '"'; i += 2; continue; } q = false; i++; continue; }
      field += ch; i++; continue;
    }
    if(ch === '"' && field === ""){ q = true; i++; continue; }
    if(ch === D){ row.push(field); field = ""; i++; continue; }
    if(ch === "\r" || ch === "\n"){
      row.push(field); rows.push(row); row = []; field = "";
      i += (ch === "\r" && text[i+1] === "\n") ? 2 : 1; continue;
    }
    field += ch; i++;
  }
  if(field !== "" || row.length){ row.push(field); rows.push(row); }
  return rows;
}

/* ---------- tolerant reading: the sheet is written by people and AIs, so accept their variations ---------- */
/* full-width digits and punctuation → ASCII */
function halfWidth(s){ return String(s==null?"":s).replace(/[！-～]/g, c=>String.fromCharCode(c.charCodeAt(0)-0xFEE0)).replace(/　/g," "); }
/* any common way of writing a date → YYYY-MM-DD; a missing year means the most recent such date */
function sheetDate(s){
  s = halfWidth(s).trim(); let m;
  const ymd = (y,mo,d)=>(mo>=1&&mo<=12&&d>=1&&d<=31) ? y+"-"+pad(mo)+"-"+pad(d) : null;
  if((m = /^(\d{4})\s*[-/.年]\s*(\d{1,2})\s*[-/.月]\s*(\d{1,2})/.exec(s))) return ymd(+m[1],+m[2],+m[3]);
  if((m = /^(\d{1,2})[/.](\d{1,2})[/.](\d{4})/.exec(s))){            /* D/M/YYYY, or M/D/YYYY when the 2nd part can't be a month */
    const a = +m[1], b = +m[2], [d, mo] = b > 12 ? [b, a] : [a, b];
    return ymd(+m[3], mo, d);
  }
  if((m = /^(\d{1,2})\s*[月/.-]\s*(\d{1,2})\s*日?$/.exec(s))){       /* 11月3日, 11/3 */
    const t = new Date(), y = t.getFullYear(), d = ymd(y, +m[1], +m[2]);
    return d && d > ymdAdd(today(), 1) ? ymd(y-1, +m[1], +m[2]) : d;
  }
  if(/^\d{5}(\.\d+)?$/.test(s) && +s > 36000 && +s < 73000){          /* spreadsheet day number (days since 1899-12-30) */
    const t = new Date(Date.UTC(1899, 11, 30) + Math.floor(+s) * 864e5);
    return t.getUTCFullYear()+"-"+pad(t.getUTCMonth()+1)+"-"+pad(t.getUTCDate());
  }
  return null;
}
/* the first number in the cell: "80g", "约 80", "1,234 kcal", "８０" all work; nothing → 0 */
function sheetNum(s){
  s = halfWidth(s).replace(/(\d),(?=\d{3}(\D|$))/g, "$1");
  const m = /-?\d+(\.\d+)?/.exec(s); return m ? parseFloat(m[0]) : 0;
}
/* header names in Chinese or English, any order, with or without units */
const SHEET_ALIASES = {
  date: ["date","day","日期","日子","时间"],
  item: ["item","food","name","食物","食品","名称","内容","吃了什么","餐食"],
  p:    ["p","protein","蛋白质","蛋白"],
  f:    ["f","fat","脂肪"],
  c:    ["c","carb","carbs","carbohydrate","carbohydrates","碳水","碳水化合物"],
  veg:  ["veg","veggie","veggies","vegetable","vegetables","蔬菜"],
  kcal: ["kcal","cal","calorie","calories","energy","热量","卡路里","千卡","能量"]
};
function headKey(cell){
  const s = halfWidth(cell).toLowerCase().replace(/[(（\[【].*?[)）\]】]/g, "").replace(/[\s:：_\-*#|]/g, "");
  if(!s) return null;
  const bare = s.replace(/(克|千卡|大卡|kcal|g)$/, "");         /* "蛋白质g", "热量kcal"; "kcal" and "veg" stay themselves */
  for(const t of [s, bare]) for(const [k, list] of Object.entries(SHEET_ALIASES)) if(t && list.includes(t)) return k;
  for(const [k, list] of Object.entries(SHEET_ALIASES)) if(list.some(a=>/[^\x00-\x7f]/.test(a) && s.startsWith(a))) return k;
  return null;
}
/* a header row needs a date column and either a food or a calorie column */
function headerMap(row){
  const idx = {};
  (row||[]).forEach((c,i)=>{ const k = headKey(c); if(k && idx[k] == null) idx[k] = i; });
  return idx.date != null && (idx.item != null || idx.kcal != null) ? idx : null;
}
const TOTAL_ROW = /^(当日合计|今日合计|合计|总计|小计|共计|汇总|total|subtotal|sum)(?=$|[\s:：(（,，])/i;
const NOTE_ROW = /^(备注|说明|注|notes?|remarks?)\s*[:：]\s*/i;
/* rows → { days: {date: [items]}, notes: {date: text}, rows: n }
   A total row is skipped when the day also has itemised rows (it would count the day twice); when it is the only
   food row of its day (a day filled in afterwards as one total) it is that day's record. A row that starts with
   "备注：" / "Note:" and carries no numbers is the day's note, not a food. */
function sheetDays(rows){
  rows = (rows||[]).map(r=>(r||[]).map(x=>x==null?"":String(x)));
  let idx = null, start = 0;
  for(let r = 0; r < Math.min(rows.length, 30); r++){ const h = headerMap(rows[r]); if(h){ idx = h; start = r + 1; break; } }
  if(!idx){
    /* no header: the default column order, if the rows clearly look like it */
    const full = rows.filter(r=>r.length >= 3 && r.some(x=>x.trim()));
    if(!full.length || full.filter(r=>sheetDate(r[0])).length < full.length * 0.6) return { days:{}, rows:0 };
    idx = {date:0,item:1,p:2,f:3,c:4,veg:5,kcal:6};
  }
  const days = {}, totals = {}, notes = {}; let n = 0, lastDate = null;
  for(let r = start; r < rows.length; r++){
    const row = rows[r], get = k => idx[k] != null ? (row[idx[k]] || "") : "";
    const rawDate = get("date").trim(), name = get("item").trim();
    const date = rawDate ? sheetDate(rawDate) : lastDate;     /* a blank date continues the day above */
    if(!date){ if(rawDate) lastDate = null; continue; }
    lastDate = date;
    const it = { name, p: sheetNum(get("p")), f: sheetNum(get("f")), c: sheetNum(get("c")), veg: sheetNum(get("veg")), kcal: sheetNum(get("kcal")) };
    if(!it.kcal && (it.p || it.f || it.c)) it.kcal = Math.round(it.p*4 + it.f*9 + it.c*4);
    if(NOTE_ROW.test(name) && !it.kcal && !it.veg){ const t = name.replace(NOTE_ROW, "").trim(); if(t) notes[date] = notes[date] ? notes[date] + " " + t : t; continue; }
    if(TOTAL_ROW.test(name)){ if(it.kcal) (totals[date] = totals[date] || []).push(it); continue; }
    if(!name && !it.kcal && !it.veg) continue;
    (days[date] = days[date] || []).push(it);
    n++;
  }
  for(const [date, list] of Object.entries(totals)){
    if((days[date] || []).some(it=>it.kcal)) continue;          /* itemised: the total would double it */
    days[date] = (days[date] || []).concat(list[list.length - 1]); n++;
  }
  for(const date of Object.keys(notes)) if(!days[date]) delete notes[date];
  return { days, notes, rows: n };
}

/* replace only the food of the pulled dates; a manual burn override on that day stays, and so does a note written
   in the app (the table's own note for the day is used when there is none) */
function applySheetDays(days, notes){
  for(const [date, items] of Object.entries(days)){
    const local = state.diet[date] || {};
    const doc = { items, src: "sheet" };
    const tn = notes && notes[date];
    if(local.note && local.noteSrc !== "sheet") doc.note = local.note;
    else if(tn){ doc.note = tn; doc.noteSrc = "sheet"; }
    if(numVal(local.expendOverride) !== null) doc.expendOverride = local.expendOverride;
    state.diet[date] = doc;
  }
}

/* ---------- reading any table, wherever it is hosted ----------
   The app doesn't care whose cloud the table lives in. It tries the link as given, plus the data
   exports that common services offer for the same table, and takes the first reply in which it
   finds the header date,item,p,f,c,veg,kcal followed by rows: delimited text, an HTML table,
   JSON, JSONP, or compressed blobs inside JSON. */
function sheetCandidates(u){
  const out = [];
  let m;
  if((m = /docs\.google\.com\/spreadsheets\/d\/([A-Za-z0-9_-]{20,})/i.exec(u)) && m[1] !== "e"){
    const g = /[#&?]gid=(\d+)/.exec(u);
    out.push({ how:"gviz", url:"https://docs.google.com/spreadsheets/d/" + m[1] + "/gviz/tq?tqx=out:csv&headers=1" + (g ? "&gid=" + g[1] : "") });
  }
  if((m = /docs\.qq\.com\/sheet\/([A-Za-z0-9_-]+)/i.exec(u))){
    const tab = /[?&]tab=([A-Za-z0-9_-]+)/.exec(u);
    const base = "https://docs.qq.com/dop-api/opendoc?id=" + m[1] + "&outformat=1&normal=1&startrow=0&endrow=3000&wb=1&nowb=0" + (tab ? "&tab=" + tab[1] : "");
    out.push({ how:"opendoc", url: base });
    out.push({ how:"opendoc-jsonp", url: base, jsonp: true });
  }
  out.push({ how:"direct", url: u });
  return out;
}
/* a flat list of cell texts (e.g. from compressed data) → rows: find a header run, then cut rows to its width */
function tokensToRows(tokens){
  const t = tokens.map(x=>String(x).trim());
  for(let k = 0; k < t.length; k++){
    if(headKey(t[k]) !== "date") continue;
    let w = 1; const seen = new Set(["date"]);
    while(k + w < t.length){ const h = headKey(t[k+w]); if(!h || seen.has(h)) break; seen.add(h); w++; }
    if(!headerMap(t.slice(k, k + w))) continue;
    const rows = [t.slice(k, k + w)];
    for(let r = k + w; r + w <= t.length; r += w){
      if(!sheetDate(t[r])) break;
      rows.push(t.slice(r, r + w));
    }
    if(rows.length > 1) return rows;
  }
  return null;
}
function jsonStrings(v, out){
  if(v == null) return out;
  if(typeof v === "string" || typeof v === "number") out.push(String(v));
  else if(Array.isArray(v)) v.forEach(x=>jsonStrings(x, out));
  else if(typeof v === "object") Object.values(v).forEach(x=>jsonStrings(x, out));
  return out;
}
/* arrays of rows ([["日期",...],[...]]) or arrays of objects ({date, item, ...}) anywhere in the JSON */
function jsonTable(v){
  if(Array.isArray(v)){
    if(v.length && Array.isArray(v[0]) && sheetDays(v).rows) return v;
    if(v.length && v[0] && typeof v[0] === "object" && !Array.isArray(v[0])){
      const keys = Object.keys(v[0]);
      if(headerMap(keys)) return [keys].concat(v.map(o=>keys.map(k=>o && o[k]!=null ? String(o[k]) : "")));
    }
    for(const x of v){ const t = jsonTable(x); if(t) return t; }
  }else if(v && typeof v === "object"){ for(const x of Object.values(v)){ const t = jsonTable(x); if(t) return t; } }
  return null;
}
async function inflateB64(b64){
  let bytes; try{ bytes = Uint8Array.from(atob(b64.replace(/-/g,"+").replace(/_/g,"/")), c=>c.charCodeAt(0)); }catch(e){ return []; }
  const outs = [];
  if(typeof DecompressionStream === "function"){
    for(const fmt of ["deflate","deflate-raw","gzip"]){
      try{ outs.push(new TextDecoder().decode(await new Response(new Blob([bytes]).stream().pipeThrough(new DecompressionStream(fmt))).arrayBuffer())); break; }catch(e){}
    }
  }
  outs.push(new TextDecoder().decode(bytes));
  return outs;
}
/* any reply text → rows (with header) or null */
async function rowsFromText(text, depth){
  depth = depth || 0;
  text = String(text||"");
  const trimmed = text.trim();
  /* 1. delimited text (title rows above the header are skipped) */
  if(!/^[<{\[]/.test(trimmed) && !/^[\w$.]+\s*\(/.test(trimmed)){
    const rows = parseCsv(text);
    if(sheetDays(rows).rows) return rows;
  }
  /* 2. JSON or JSONP */
  let js = null;
  const jp = /^[\w$.]+\s*\(([\s\S]*)\)\s*;?\s*$/.exec(trimmed);
  try{ js = JSON.parse(jp ? jp[1] : trimmed); }catch(e){}
  if(js != null){
    const tbl = jsonTable(js); if(tbl) return tbl;
    const strs = jsonStrings(js, []);
    let t = tokensToRows(strs); if(t) return t;
    /* compressed blobs: inflate, then read either a nested reply or cell texts between control bytes */
    if(depth < 2) for(const s of strs.filter(x=>x.length > 80 && /^[A-Za-z0-9+/_=-]+$/.test(x))){
      for(const dec of await inflateB64(s)){
        const inner = await rowsFromText(dec, depth + 1).catch(()=>null);
        if(inner) return inner;
        t = tokensToRows(dec.split(/[\u0000-\u001f\u007f�]+/)); if(t) return t;
      }
    }
  }
  /* 3. HTML: a real <table>, or cell texts sitting in the page's script data */
  if(/<\w+[\s>]/.test(trimmed.slice(0, 2000))){
    try{
      const doc = new DOMParser().parseFromString(text, "text/html");
      for(const tb of doc.querySelectorAll("table")){
        const rows = [...tb.querySelectorAll("tr")].map(tr=>[...tr.querySelectorAll("td,th")].map(td=>td.textContent.trim()));
        const t = tokensToRows(rows.flat()); if(t) return t;
      }
    }catch(e){}
    const lits = []; text.replace(/"((?:[^"\\]|\\.){0,400})"/g, (_, x)=>{ try{ lits.push(JSON.parse('"' + x + '"')); }catch(e){ lits.push(x); } return ""; });
    const t = tokensToRows(lits); if(t) return t;
  }
  return null;
}
/* JSONP: a script tag, which a site may allow even when it blocks cross-site reads */
function loadJsonp(url){
  return new Promise((ok, no)=>{
    const cb = "__tt_cb" + Date.now() + Math.floor(Math.random()*1e4), sc = document.createElement("script");
    const done = ()=>{ try{ delete window[cb]; }catch(e){ window[cb] = undefined; } sc.remove(); clearTimeout(tm); };
    const tm = setTimeout(()=>{ done(); no(new Error("timeout")); }, 15000);
    window[cb] = data=>{ done(); ok(JSON.stringify(data)); };
    sc.onerror = ()=>{ done(); no(new Error("script")); };
    sc.src = url + (url.includes("?") ? "&" : "?") + "callback=" + cb;
    document.head.appendChild(sc);
  });
}
/* try each way in turn; notes say how each one failed, for the status line */
async function readSheetRows(u){
  const notes = [];
  for(const c of sheetCandidates(u)){
    let text;
    try{
      if(c.jsonp) text = await loadJsonp(c.url);
      else{
        const r = await fetch(c.url, { cache: "no-store" });
        if(!r.ok){ notes.push(c.how + " " + r.status); continue; }
        text = await r.text();
      }
    }catch(e){ notes.push(c.how + " ✕"); continue; }
    const rows = await rowsFromText(text).catch(()=>null);
    if(rows) return { rows, how: c.how };
    notes.push(c.how + " ∅" + text.length);
  }
  return { rows: null, notes };
}

function paintSheetStatus(){
  const el = document.getElementById("dsrcStatus"); if(!el) return;
  let s = null; try{ s = JSON.parse(localStorage.getItem(SHEET_STATUS_K) || "null"); }catch(e){}
  el.classList.toggle("err", !!(s && !s.ok));
  if(!s){ el.textContent = T("状态：还没有同步", "Status: not synced yet"); return; }
  const last = s.at ? T("上次同步 ", "Last synced ") + s.at + T(" · " + s.rows + " 条 / " + s.days + " 天", " · " + s.rows + " rows / " + s.days + " days") : "";
  el.textContent = T("状态：", "Status: ") + (s.ok ? last : (s.msg + (last ? T("（", " (") + last + T("）", ")") : "")));
}
function setSheetStatus(patch){
  let s = {}; try{ s = JSON.parse(localStorage.getItem(SHEET_STATUS_K) || "{}") || {}; }catch(e){}
  s = Object.assign(s, patch);
  try{ localStorage.setItem(SHEET_STATUS_K, JSON.stringify(s)); }catch(e){}
  paintSheetStatus();
}

/* share buttons add words around the link ("【腾讯文档】饮食记录 https://…"); keep just the link */
function extractUrl(text){
  const t = String(text||"").trim();
  const m = /https?:\/\/[^\s<>"'，。；、【】「」（）《》]+/i.exec(t)
         || /(?:^|\s)((?:[a-z0-9-]+\.)+[a-z]{2,}(?::\d+)?\/[^\s<>"'，。；、【】「」（）《》]*)/i.exec(t);
  return m ? (m[1] || m[0]).replace(/[.,;:!?)\]]+$/, "") : t;
}
/* pull the saved link without any page controls (the new interface); opts.silent = no toast.
   Returns { ok, rows, days, note } like the classic page's pull. */
let sheetBusy=false;
async function pullSheetQuiet(opts){
  opts=opts||{};
  let url="";try{url=extractUrl(localStorage.getItem(SHEET_URL_K)||"")}catch(e){}
  const fail=msg=>{setSheetStatus({ok:false,msg});if(!opts.silent)toast(msg);return {ok:false,note:msg}};
  if(!url)return fail(T("还没填饮食表格链接","No food table link yet"));
  if(!/^https?:\/\//i.test(url))url="https://"+url;
  if(navigator.onLine===false)return fail(T("没有网络，连上后再拉取","You're offline; pull again once connected"));
  if(sheetBusy)return {ok:false,note:"busy"};
  sheetBusy=true;
  try{
    const res=await readSheetRows(url);
    if(!res.rows)return fail(T("读不到表格数据，请到设定 › 更多 › 饮食表格检查链接","Couldn't read the table; check the link in Settings"));
    const {days,notes,rows}=sheetDays(res.rows),nDays=Object.keys(days).length;
    applySheetDays(days,notes);lsSave();
    const d=new Date();
    setSheetStatus({ok:true,msg:"",ts:Date.now(),at:pad(d.getMonth()+1)+"-"+pad(d.getDate())+" "+pad(d.getHours())+":"+pad(d.getMinutes()),rows,days:nDays});
    const note=T("已拉取 "+rows+" 条 / "+nDays+" 天","Pulled "+rows+" rows / "+nDays+" days");
    if(!opts.silent)toast(note);
    return {ok:true,rows,days:nDays,note};
  }catch(e){return fail(T("拉取失败，稍后再试","Pull failed; try again later"))}
  finally{sheetBusy=false}
}
