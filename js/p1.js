/* 博G interface: the screens (training, diet, progress), the dock, the settings list and the bottom sheets. */

/* ---------- small helpers ---------- */
const $=s=>document.querySelector(s);
const PK="tracktor-p1-";
/* links in the page: settings sheets (p1:…), sync, goals, the food editor, body records */
const bridge=to=>{
  if(to.startsWith("p1:")){p1Open(to.slice(3));return}
  if(to==="sync"){closeSheet();p1Sync(false);return}
  if(to==="goals"){p1Open("goals");return}
  if(to==="diet"||to.startsWith("diet:")){closeSheet();openDietEntryModal(to.slice(5)||today());return}
  if(to.startsWith("rec:")){closeSheet();openRecord(to.slice(4))}};
/* the shared editors (food in js/diet.js, body records in js/p1data.js) call these after saving: redraw this page */
function renderAll(){if(typeof show==="function"&&typeof cur!=="undefined")show(cur,false,true)}
const WD_ZH=["日","一","二","三","四","五","六"],WD_EN=["Su","Mo","Tu","We","Th","Fr","Sa"],WD=LANG==="en"?WD_EN.slice():WD_ZH.slice();
const MON_EN=["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
/* thousands separators only in English (1,000); Chinese writes 1000 */
const fmt=v=>v==null?"–":LANG==="en"?Math.round(v).toLocaleString("en-US"):String(Math.round(v));
const ICON={palette:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3a9 9 0 1 0 0 18c1.1 0 1.8-.8 1.8-1.7 0-.5-.2-.9-.5-1.2-.3-.3-.5-.7-.5-1.2 0-.9.8-1.7 1.7-1.7H16a5 5 0 0 0 5-5c0-4-4-7.2-9-7.2z"/><circle cx="7.5" cy="11" r="1.2" fill="currentColor"/><circle cx="10.5" cy="7.5" r="1.2" fill="currentColor"/><circle cx="15" cy="8" r="1.2" fill="currentColor"/></svg>',music:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18V5l11-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="17" cy="16" r="3"/></svg>',dust:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 3l-8 8"/><path d="M8.5 10.5l5 5"/><path d="M8.5 10.5C6.5 10.5 4 12 3 20c3-.3 6.5-1.3 10.5-4.5"/><path d="M6.5 17.5l2-3M9.8 17.6l1.3-2.3"/></svg>',
  chev:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>',
  left:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="m15 6-6 6 6 6"/></svg>',
  right:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="m9 6 6 6-6 6"/></svg>',
  x:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M6 6l12 12M18 6 6 18"/></svg>',
  check:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>',
  play:'<svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5.5v13a1 1 0 0 0 1.5.86l10.5-6.5a1 1 0 0 0 0-1.72L9.5 4.64A1 1 0 0 0 8 5.5z"/></svg>',
  plus:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>',
  pen:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 20h4L19 9a2.1 2.1 0 0 0-3-3L5 17z"/></svg>',
  sync:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 11a8 8 0 0 0-14.3-4.9L4 8"/><path d="M4 4v4h4"/><path d="M4 13a8 8 0 0 0 14.3 4.9L20 16"/><path d="M20 20v-4h-4"/></svg>',
  swatch:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="8" height="8" rx="2"/><rect x="13" y="3" width="8" height="8" rx="2"/><rect x="3" y="13" width="8" height="8" rx="2"/><path d="M13 17h8M17 13v8"/></svg>',
  user:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6"/></svg>',
  target:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/></svg>',
  cloud:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 18a4.5 4.5 0 0 1-.6-8.96A6 6 0 0 1 18 8.5a4 4 0 0 1 .5 7.97"/><path d="M12 20v-8M9 15l3-3 3 3"/></svg>',
  table:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 10h18M9 10v10"/></svg>',
  sliders:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 6h10M18 6h2M4 12h4M12 12h8M4 18h12"/><circle cx="16" cy="6" r="2"/><circle cx="10" cy="12" r="2"/><circle cx="18" cy="18" r="2"/></svg>',
  spark:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M6 18l2.5-2.5M15.5 8.5 18 6"/></svg>',
  share:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v12M7.5 7.5 12 3l4.5 4.5"/><path d="M5 12v6.5A2.5 2.5 0 0 0 7.5 21h9a2.5 2.5 0 0 0 2.5-2.5V12"/></svg>',
  reset:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.6 4.1A8 8 0 1 1 4.7 8.6"/><path d="M13.6 1.4 10.6 4.1l3 2.9"/></svg>',
  moon:'<svg viewBox="0 0 24 24" fill="currentColor"><path d="M20.5 14.6A8.5 8.5 0 0 1 9.4 3.5a8.5 8.5 0 1 0 11.1 11.1z"/></svg>',
  dumbbell:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M6.5 6.5v11M17.5 6.5v11M3.5 9v6M20.5 9v6M6.5 12h11"/></svg>',
  lock:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="11" width="14" height="10" rx="2.5"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></svg>',
  trophy:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0z"/><path d="M17 5h3v2a3 3 0 0 1-3 3M7 5H4v2a3 3 0 0 0 3 3"/></svg>'};
function dateObj(s){const [y,m,d]=s.split("-").map(Number);return new Date(y,m-1,d)}
function dayLabel(s){const t=today();if(s===t)return T("今天","Today");if(s===ymdAdd(t,-1))return T("昨天","Yesterday");const d=dateObj(s);return (d.getMonth()+1)+"."+d.getDate()}
function ringSvg(size,stroke,pct,color,track){const r=(size-stroke)/2,c=2*Math.PI*r,off=c*(1-Math.max(0,Math.min(1,pct)));
  return '<svg width="'+size+'" height="'+size+'" viewBox="0 0 '+size+' '+size+'"><circle cx="'+size/2+'" cy="'+size/2+'" r="'+r+'" stroke="'+track+'" stroke-width="'+stroke+'"/>'
    +'<circle class="rv" cx="'+size/2+'" cy="'+size/2+'" r="'+r+'" stroke="'+color+'" stroke-width="'+stroke+'" stroke-dasharray="'+c+'" stroke-dashoffset="'+c+'" data-off="'+off+'"/></svg>'}
function animateRings(root){requestAnimationFrame(()=>requestAnimationFrame(()=>root.querySelectorAll("circle.rv").forEach(c=>c.style.strokeDashoffset=c.dataset.off)))}

/* ---------- theme: follow the phone, or fixed light / dark ---------- */
/* themes: each has a light and a dark version. aurora is free; others are bought with G (settings.buys, settings.theme) */
const THEMES=[{id:"aurora",zh:"草木 · 极光",en:"Meadow · Aurora",price:0,sw:["#F1F1EC","#4FAF6A","#070A10","#00F5D4"]},
  {id:"ember",zh:"暖砂 · 流金",en:"Sand · Amber",price:60,sw:["#F4EFE9","#D9714E","#0B0908","#FFB020"]},
  {id:"toy",zh:"糖果塑料",en:"Candy Plastic",price:90,sw:["#F4F1EA","#EB3B24","#130C21","#9DF03A"],dz:"塑料按键、积木柱子、点阵底板",de:"Plastic keys, brick bars, a dotted board"},
  {id:"pocket",zh:"奶油塑料",en:"Buttery Plastic",price:120,lit:1,sw:["#C6C9CB","#E7D4B4","#1B1C1E","#E39A2E"],dz:"油润塑料、凹碟方键、点阵屏、喇叭网孔",de:"Oily plastic, dished square keys, a dot-matrix screen, speaker holes"},
  {id:"mac",zh:"喷砂铝",en:"Bead-Blasted Aluminium",price:120,lit:1,sw:["#D6D7DA","#1C1C1E","#38393D","#0A84FF"],dz:"喷砂铝、钻石切边、黑色键帽",de:"Bead-blasted aluminium, diamond-cut edges, black keycaps"},
  {id:"ipod",zh:"白瓷",en:"Porcelain",price:120,lit:1,sw:["#FBFBFA","#2F7BEA","#151516","#2F7BEA"],dz:"高光白瓷面板、镀铬边、点按转盘",de:"Glossy porcelain face, chrome rim, a click wheel"},
  /* single-look themes: fix is the one mode they come in; the header switch hides */
  {id:"tm4",zh:"钴蓝磨砂",en:"Frosted Cobalt",price:120,fix:"dark",sw:["#123A6B","#2D76C6","#FFFFFF","#FF6E30"],dz:"圆柱按键、点阵屏、发光指示灯",de:"Cylinder keys, a dot-matrix screen, glowing LEDs"},
  {id:"skeuo",zh:"拉丝铝 · 霓虹",en:"Brushed Alloy",price:120,fix:"light",sw:["#86888D","#C4C6CA","#18191B","#1FF5DC"],dz:"金属旋钮、黑色表圈、青色霓虹",de:"Metal knobs, a black bezel, cyan neon"},
  {id:"braun",zh:"米白烤漆",en:"Cream Enamel",price:90,fix:"light",sw:["#D8D5CA","#F6F5EF","#1C1B18","#F26422"],dz:"方键、凹碟、滚花拨盘",de:"Square keys, concave dishes, a fluted dial"},
  {id:"md",zh:"冰蓝拉丝",en:"Ice-Blue Brushed",price:120,fix:"light",sw:["#BFC6D0","#D3DAE3","#AEB9A2","#FF6A13"],dz:"冰蓝拉丝铝、段码液晶、橡胶小键",de:"Ice-blue brushed aluminium, a segment LCD, rubber keys"},
  {id:"nikon",zh:"黑皮压纹",en:"Pebbled Leather",price:120,fix:"dark",sw:["#141517","#26272A","#9EA3AA","#E8302A"],dz:"压纹蒙皮、滚花拨盘、快门键",de:"Pebbled leatherette, knurled dials, a shutter button"},
  {id:"dyson",zh:"粉瓷 · 铜蓝",en:"Rose Ceramic · Copper Blue",price:120,lit:1,sw:["#EDDBD3","#C46F6C","#141936","#D49A5E"],dz:"亮：奶白陶瓷机身配玫瑰金属；暗：普鲁士蓝哑光配金铜；旋纹按钮、滤网纹样",de:"Light: cream ceramic with rose metal; dark: Prussian blue matte with rich copper; spun-ring buttons, filter grille"},
  {id:"clay",zh:"黏土 · 薄荷",en:"Clay · Mint",price:90,fix:"light",sw:["#E3E1DA","#FFFFFF","#C7C5BD","#7CE8C4"],dz:"斜投影积木、网格纸、发光圆环",de:"Blocks with slanted shadows, grid paper, a glowing ring"}];
function themeOwned(id){const t=THEMES.find(x=>x.id===id);return !!t&&(!t.price||(state.settings.buys||[]).some(b=>b.id===id))}
function applyMode(){let m="auto";try{m=localStorage.getItem(PK+"mode")||"auto"}catch(e){}
  const th=themeOwned(state.settings.theme)?state.settings.theme:"aurora",fix=(THEMES.find(x=>x.id===th)||{}).fix,
    dark=fix?fix==="dark":m==="dark"||(m==="auto"&&matchMedia("(prefers-color-scheme: dark)").matches),de=document.documentElement;
  de.dataset.mode=dark?"dark":"light";de.dataset.theme=th;if(fix)de.dataset.fixed="";else delete de.dataset.fixed;if(fix||(THEMES.find(x=>x.id===th)||{}).lit)de.dataset.lit="";else delete de.dataset.lit;
  requestAnimationFrame(()=>fitTitle());document.querySelector('meta[name="theme-color"]').content=getComputedStyle(document.documentElement).getPropertyValue("--bg").trim()||(dark?"#070A10":"#F1F1EC")}
applyMode();matchMedia("(prefers-color-scheme: dark)").addEventListener("change",applyMode);
/* tactile themes: the light on the materials follows the phone. Tilt moves the highlight (--lx/--ly) and turns the
   reflections on metal (--rot); the rest point drifts back, so holding still settles it. A mouse does the same. */
/* how strong the light is: 0 off (still), 1 soft, 2 standard, 3 max; scales highlight alpha (--rt) and how far the tilt moves it */
/* light: on (a gentle effect) or off (still); older stored levels 1–3 count as on */
function rtLevel(){let v=1;try{const x=localStorage.getItem(PK+"rt");if(x!=null)v=+x}catch(e){}return v>0?1:0}
const RT_K=[0,.5];
function rtApply(){const de=document.documentElement,k=RT_K[rtLevel()];de.style.setProperty("--rt",k||.5);if(!k){["--lx","--ly","--rot"].forEach(v=>de.style.removeProperty(v))}}
rtApply();
/* every change repaints every lit surface, so the light moves in coarse steps at most about 12 times a second */
(function(){const de=document.documentElement,on=()=>"lit" in de.dataset&&rtLevel()>0&&!matchMedia("(prefers-reduced-motion: reduce)").matches;let last="",lastAt=0;
  let bg=null,bb=null,x=0,y=0,raf=0;
  const put=()=>{raf=0;const now=performance.now();if(now-lastAt<80){raf=requestAnimationFrame(put);return}
    const k=RT_K[rtLevel()],lx=Math.round(30+x*1.6*k),ly=Math.round(10+y*1.3*k),rot=Math.round(x*3*k/2)*2,key=lx+","+ly+","+rot;if(key===last)return;last=key;lastAt=now;
    de.style.setProperty("--lx",lx+"%");de.style.setProperty("--ly",ly+"%");de.style.setProperty("--rot",rot+"deg")};
  const go=(nx,ny)=>{x=Math.max(-25,Math.min(25,nx));y=Math.max(-20,Math.min(20,ny));if(!raf)raf=requestAnimationFrame(put)};
  const ori=e=>{if(!on()||e.gamma==null)return;if(bg==null){bg=e.gamma;bb=e.beta}bg+=(e.gamma-bg)*.02;bb+=(e.beta-bb)*.02;go(e.gamma-bg,e.beta-bb)};
  /* listen from the start (no events arrive until allowed); where the browser asks first, ask on the first tap */
  addEventListener("deviceorientation",ori);
  const ask=()=>{const D=window.DeviceOrientationEvent;if(ask.d||!D||typeof D.requestPermission!=="function")return;ask.d=true;D.requestPermission().catch(()=>{ask.d=false})};
  addEventListener("pointerdown",()=>{if(on())ask()},{passive:true});
  addEventListener("pointermove",e=>{if(e.pointerType==="mouse"&&on())go((e.clientX/innerWidth-.5)*40,(e.clientY/innerHeight-.5)*30)},{passive:true})})();
/* dust: two days without training or extras and the screen gathers dust, more each day (levels 1–3); training wipes it */
/* music easter egg (js/p1music.js spGroove): bricks, trained days and the start key move with what plays */
function grooveOn(){try{return localStorage.getItem(PK+"groove")!=="0"}catch(e){return true}}
function dustOn(){try{return localStorage.getItem(PK+"dust")!=="0"}catch(e){return true}}
function dustDays(){let last="";Object.values(state.sessions).forEach(x=>{if(x&&(x.done||Object.values(x.sets||{}).some(a=>(a||[]).some(z=>z.d)))){const d=x.date||today();if(d>last)last=d}});
  Object.keys(state.dayx||{}).forEach(d=>{const x=state.dayx[d];if(x&&x.xs&&x.xs.length&&d>last)last=d});return last?dnum(today())-dnum(last):0}
function dustApply(){const de=document.documentElement,d=dustOn()?dustDays():0,lv=d<2?0:d<5?1:d<8?2:3,was=+(de.dataset.dust||0);
  let el=document.getElementById("dust");if(!el&&lv){el=document.createElement("div");el.id="dust";el.setAttribute("aria-hidden","true");document.body.appendChild(el)}
  if(!el)return;if(lv){el.classList.remove("wipe");de.dataset.dust=lv}else if(was){el.classList.add("wipe");delete de.dataset.dust}}
/* skins with one look have no light/dark switch: a theme key takes its place */
(function(){const b=$("#themeBtn");if(!b)return;b.innerHTML=ICON.palette;b.addEventListener("click",()=>{buzz(8);SFX.tap();coinSheet(true)})})();
/* the header switch: tap flips light and dark; hold it for the themes */
(function(){const b=$("#modeBtn");if(!b)return;let tm=0,held=false;
  b.addEventListener("pointerdown",()=>{held=false;clearTimeout(tm);tm=setTimeout(()=>{held=true;buzz(15);coinSheet(true)},500)});
  ["pointerup","pointerleave","pointercancel"].forEach(k=>b.addEventListener(k,()=>clearTimeout(tm)));
  b.addEventListener("contextmenu",e=>e.preventDefault());
  b.addEventListener("click",()=>{if(held){held=false;return}const dark=document.documentElement.dataset.mode==="dark";
    try{localStorage.setItem(PK+"mode",dark?"light":"dark")}catch(e){}applyMode();SFX.tap();buzz(8)})})();

/* ---------- train view ---------- */
let monthOpen=true,monthOff=0,heroSid=null;
function weekStart(d){const x=new Date(d);const k=(x.getDay()+6)%7;x.setDate(x.getDate()-k);return x}
const ymd=d=>d.getFullYear()+"-"+pad(d.getMonth()+1)+"-"+pad(d.getDate());
/* a day: tinted in the colour of the training done that day (only extra practice: a thin ring); tap a trained day to
   see it under the calendar, any other day (today included) opens it for extra practice */
function dayCell(s,marks,out){const t=today(),mk=marks[s],kinds=mk?[...mk].filter(k=>k!=="x").sort():[];
  const cls=(s===t?" today":"")+(s>t?" fut":"")+(out?" out":"")+(kinds.length?" trn":mk?" xo":"")+(s===calSel?" sel":"");
  const st=kinds.length?' style="--kc:var(--'+kinds[0]+')"':'',inner='<b>'+dateObj(s).getDate()+'</b>';
  return s>t?'<div class="dd'+cls+'">'+inner+'</div>':'<button class="dd'+cls+'"'+st+' data-act="calsel" data-d="'+s+'" aria-label="'+s+'">'+inner+'</button>'}
/* the line under the calendar appears only for a tapped day: what was trained (in that day's colour), the extra
   practice, or a rest day; the pen opens the day to change it or add practice */
let calSel=null;
function calPill(days){const d=calSel;if(!d||!days.includes(d))return "";const t=today();
  const ss=Object.entries(state.sessions).filter(([sid,x])=>x&&x.done&&x.date===d&&BYID[sid]).map(([sid])=>BYID[sid]);
  const names=[],add=n=>{if(n&&!names.includes(n))names.push(n)};
  ss.forEach(p=>p.ex.forEach(e=>{const a=state.sessions[p.sid].sets[e.id];if(e.unit!=="分钟"&&a&&a.some(x=>x.d))add(NS(e))}));
  const xs=[].concat(...ss.map(p=>state.sessions[p.sid].xs||[]),(state.dayx[d]&&state.dayx[d].xs)||[]);
  xs.forEach(it=>{if(it.sets&&it.sets.some(x=>x.d))add(typeof xName==="function"?xName(it):it.name)});
  const kc=ss.length?'var(--'+ss[0].kind+')':names.length?'var(--muted)':'color-mix(in srgb,var(--muted) 55%,transparent)';
  const txt=names.length?names.join(T("、",", ")):d===t?T("今天还没练","Nothing yet today"):T("休息日","Rest day");
  return '<div class="calpill" style="--kc:'+kc+'"><i class="ci">'+(ss.length||names.length?ICON.dumbbell:ICON.moon)+'</i><span'+(names.length?'':' class="muted"')+'>'+esc(txt)+'</span>'
    +'<button class="fsreset" data-act="cal" data-d="'+d+'" aria-label="'+T('打开这天','Open this day')+'">'+ICON.pen+'</button></div>'}
/* the hero is a deck: one card per training day that's ready, the least recently trained on top. Swipe the top card
   away (or tap the edges peeking below) and the next comes up; tap a card to show its moves; ✨ opens the plan. */
let heroRot=0,heroOpen=false;
function heroDeck(){const ks=planKinds().map(k=>({k,n:nextOf(k),l:lastDoneOf(k)})).filter(x=>x.n);
  ks.sort((a,b)=>a.l.date<b.l.date?-1:a.l.date>b.l.date?1:a.l.day-b.l.day);
  /* ready ones first, then the session after each: it can be read but not started until the one before is done */
  const later=ks.map(x=>{const nx=PROGRAM.filter(q=>q.kind===x.k&&q.day>x.n.day&&!(state.sessions[q.sid]&&state.sessions[q.sid].done)).sort((a,b)=>a.day-b.day)[0];return nx?{p:nx,lock:x.n}:null}).filter(Boolean);
  return ks.map(x=>({p:x.n,lock:null})).concat(later)}
function heroCard(p,lock){const sets=setsOf(p.sid),tot=sets.reduce((a,x)=>a+x.length,0),dn=sets.reduce((a,x)=>a+x.filter(y=>y.d).length,0);
  return '<section class="dark hero hcard'+(heroOpen?' open':'')+(lock?' locked':'')+'" data-act="hopen"><i class="glowring"></i>'
    /* top right: start this one (ready cards), or in the same spot the ✨ explanation (previews only) */
    +'<div class="htop">'+(lock?'<button class="hwhy" data-act="why" data-k="'+p.kind+'" aria-label="'+T('为什么这样练','Why this plan')+'">'+ICON.spark+'</button>'
      :'<button class="hgo" data-act="start" data-sid="'+p.sid+'">'+ICON.play+'<span>'+(dn?dn+'/'+tot:T('开练','Grind'))+'</span></button>')+'</div>'
    +'<p class="eyebrow">'+(lock?ICON.lock+T('预告','Preview'):engFree()?T('按你最近练的建议','From your recent training'):T('可练','Ready'))+'</p>'
    +'<h2><i class="kd" style="background:var(--'+p.kind+')"></i>'+LAB(p)+'</h2>'
    +'<p class="meta">'+T(p.ex.length+' 个动作 · '+tot+' 组 · 约 '+Math.round(tot*1.6)+' 分钟',p.ex.length+' moves · '+tot+' sets · ~'+Math.round(tot*1.6)+' min')+'<span class="hchev">'+ICON.chev+'</span></p>'
    +'<div class="exwrap"><div><ul class="exl">'+p.ex.map((e,i)=>'<li class="'+(sets[i].every(x=>x.d)?"dn":"")+'"><span>'+NS(e)+(engTempo(e)?' <i class="slow">'+T('慢速','Slow')+'</i>':'')+'</span><b>'+e.sets+' × '+e.target+(e.unit==="个"?"":" "+U(e.unit))+'</b></li>').join("")+'</ul>'
    +(lock?'<p class="lockline">'+ICON.lock+T('练完 '+LAB(lock)+' 解锁','Unlocks after '+LAB(lock))+'</p>':'')+'</div></div></section>'}
/* free training that has settled into a pattern: offer, once, to keep it as a plan */
function freeHintHtml(){const f=typeof freePattern==="function"&&freePattern();if(!f)return "";const n=f.groups.length,gn=g=>FREE_GROUP_NAME[g]?T(FREE_GROUP_NAME[g][0],FREE_GROUP_NAME[g][1]):g;
  return '<div class="freehint"><span class="sp">'+T('看起来你在练 '+["","一","二","三"][n]+' 分：','Looks like a '+n+'-day split: ')+'<b>'+f.groups.map(gs=>gs.map(gn).join(T("+","+"))).join(' · ')+'</b></span>'
    +'<button class="pill ac" data-act="freekeep">'+T('存成计划','Keep it')+'</button><button class="fsreset" data-act="freeoff" aria-label="'+T('不用','No thanks')+'">'+ICON.x+'</button></div>'}
function heroHtml(){const deck=heroDeck();
  if(!deck.length)return '<section class="dark hero"><p class="eyebrow">'+T('计划','Plan')+'</p><h2>'+T('全部完成','All done')+' 🎉</h2></section>';
  if(heroSid){const k=deck.findIndex(d=>d.p.sid===heroSid);if(k>=0)heroRot=k;heroSid=null}
  const n=deck.length,top=deck[((heroRot%n)+n)%n];
  return fsWrap("hero",heroCard(top.p,top.lock),n-1)}
/* either way round, the next training day comes up */
const HERO_FS={get:()=>{const deck=heroDeck(),n=deck.length;if(n<2)return null;const nx=deck[((heroRot+1)%n+n)%n];return heroCard(nx.p,nx.lock)},
  commit:()=>{heroRot++},render:heroHtml,peekDir:-1};
/* ---------- calendar: weeks (folded) or months, a frosted swipe stack; finger right goes back, "Today" returns ---------- */
let weekOff=0;
function calCard(off){const marks=dayMarks(),now=new Date(),t=today(),head='<div class="days">'+(LANG==="en"?["M","T","W","T","F","S","S"]:["一","二","三","四","五","六","日"]).map(w=>'<span class="dw">'+w+'</span>').join("");
  let body=head,label;const vis=[];
  if(!monthOpen){const ws=weekStart(now);ws.setDate(ws.getDate()+7*off);for(let i=0;i<7;i++){const d=new Date(ws);d.setDate(ws.getDate()+i);vis.push(ymd(d));body+=dayCell(ymd(d),marks)}
    const mid=new Date(ws);mid.setDate(ws.getDate()+3);label=mid}
  else{const first=new Date(now.getFullYear(),now.getMonth()+off,1),ms=weekStart(first);
    for(let i=0;i<42;i++){const d=new Date(ms);d.setDate(ms.getDate()+i);if(i===35&&d.getMonth()!==first.getMonth())break;if(d.getMonth()===first.getMonth())vis.push(ymd(d));body+=dayCell(ymd(d),marks,d.getMonth()!==first.getMonth())}label=first}
  body+="</div>";
  return '<section class="card cal"><div class="wk-h"><b>'+(LANG==="en"?MON_EN[label.getMonth()]:(label.getMonth()+1)+'月')+(label.getFullYear()!==now.getFullYear()?" "+label.getFullYear():"")+'</b>'
    +'<span class="sp"></span>'+(off?'<button class="fsreset" data-act="caltoday" aria-label="'+T('回到今天','Back to today')+'">'+ICON.reset+'</button>':'')
    +'<button class="mini chev" data-act="month" aria-expanded="'+monthOpen+'" aria-label="'+(monthOpen?T("收起整月","Collapse the month"):T("展开整月","Show the month"))+'">'+ICON.chev+'</button></div>'
    +body+calPill(vis)+'</section>'}
const calOff=()=>monthOpen?monthOff:weekOff;
function calHtml(){return fsWrap("cal",calCard(calOff()),2)}
const CAL_FS={get:dir=>{const o=calOff()-dir;return o>0?null:calCard(o)},commit:dir=>{if(monthOpen)monthOff-=dir;else weekOff-=dir},render:calHtml,peekDir:1};
function renderTrainView(){const v=$("#v-train");v.innerHTML=freeHintHtml()+heroHtml()+calHtml();animateRings(v);fsBind("hero",HERO_FS);fsBind("cal",CAL_FS)}
/* what the engine planned: the next two sessions of a kind (or both kinds), each exercise with its reason */
/* ✨ on the card: one line on where the suggestion comes from, and the reasoning behind "i" (the sessions themselves are the deck) */
function planSheet(){
  const th=[[T('渐进超负荷','Progressive overload'),T('肌肉要一直面对比上次稍高一点的负担才会继续长。','Muscles keep growing only when the load keeps creeping above last time.')],
    [T('双重递进','Double progression'),T('先在 5–10 次里加次数，到顶了先放慢下放（3 秒），再到顶就加一组，都到顶了才换更难的动作。自重练不能加杠铃片，就用动作难度、节奏和组数代替重量。','Add reps within 5–10 first; at the top, slow the lowering to 3 seconds, then add a set, and only then move to a harder variation. With body weight there are no plates to add, so difficulty, tempo and sets stand in for load.')],
    [T('次数范围','Rep range'),T('每组练到接近做不动时，从低次数到高次数的增肌效果差不多（Schoenfeld 等 2017 年的荟萃分析）；5–10 次同时顾到力量。','Taken close to failure, low and high reps build similar muscle (Schoenfeld et al., 2017 meta-analysis); 5–10 reps also builds strength.')],
    [T('训练量','Volume'),T('增肌跟每周的有效组数成正比，每个肌群每周 10 组以上更好（Schoenfeld、Ogborn、Krieger 2017）。所以每次 5–12 组，一周练几次就够。','Muscle growth tracks weekly hard sets, with 10 or more per muscle a week doing better (Schoenfeld, Ogborn & Krieger, 2017). Hence 5–12 sets a session, a few sessions a week.')],
    [T('看前 3 次','The last 3 sessions'),T('一次的状态受睡眠和吃饭影响大，3 次里有 2 次才算数，不会因为一次好坏就大起大落。','One session swings with sleep and food; it takes 2 of the last 3 to count, so one good or bad day doesn\'t swing the plan.')],
    [T('按感觉调','Feel'),T('练完一个动作选 1–4 块：轻松 / 还行 / 有点难 / 难，就是自评用力程度（RPE，Helms 等 2016）：轻松多加，还行照常加，有点难先保持，难而且没达标就减。','After each move pick 1–4 bricks: easy / OK / tough / hard, a self-rated effort score (RPE, Helms et al., 2016): easy adds more, OK adds the usual step, tough holds, hard with a miss steps back.')],
    [T('减量','Deload'),T('连着两次没达标说明疲劳在累积，下一次组数降到六成先恢复。','Missing targets twice in a row means fatigue is piling up, so the next session drops to about 60% of the sets to recover.')]];
  openSheet('<div class="sh-h"><h3>'+T('建议练（可手动调整）','Suggested (adjust as you like)')+'</h3><button class="mini" data-act="close">'+ICON.x+'</button></div>'
    +'<div class="planlead"><p class="muted">'+T('根据你前 3 次训练的表现建议，每练完一次重新算。','Suggested from how your last 3 sessions went; it updates after every session.')+'</p><button class="mini info" data-act="theory" aria-expanded="false" aria-label="'+T('依据','The reasoning')+'">i</button></div>'
    +'<div class="theory" hidden>'+th.map(([a,b])=>'<p><b>'+a+'</b>'+b+'</p>').join("")+'</div>')}
/* ---------- focus mode ---------- */
let run=null,clockT=0;
/* how a move felt, four bricks: 1 easy … 4 hard (the engine reads the key) */
const FEEL4=[["easy","轻松","Easy"],["ok","还行","OK"],["tough","有点难","Tough"],["hard","难","Hard"]];
/* the sets are the session's own arrays (sessionDoc), so every tick, change and finish is saved as it happens */
function startRun(sid){const p=BYID[sid],doc=sessionDoc(sid),pb=pullSeries();
  run={sid,p,doc,sets:p.ex.map(e=>doc.sets[e.id]),ex:0,t0:Date.now(),best0:pb.length?Math.max(...pb.map(x=>x.y)):0,coins0:coinTotal()};
  run.ex=Math.max(0,run.sets.findIndex(a=>a.some(x=>!x.d)));
  const f=$("#focus");f.classList.add("on");f.setAttribute("aria-hidden","false");document.body.style.overflow="hidden";
  clearInterval(clockT);clockT=setInterval(()=>{const el=$("#fTime");if(el){const s=Math.floor((Date.now()-run.t0)/1000);el.textContent=Math.floor(s/60)+":"+pad(s%60)}},1000);
  renderFocus()}
function closeRun(){clearInterval(clockT);const f=$("#focus");f.classList.remove("on");f.setAttribute("aria-hidden","true");document.body.style.overflow="";run=null;renderTrainView()}
function curSet(){return run.sets[run.ex].findIndex(x=>!x.d)}
function renderFocus(anim){
  const f=$("#focus"),p=run.p,e=p.ex[run.ex],a=run.sets[run.ex],ci=curSet(),allDone=run.sets.every(x=>x.every(y=>y.d));
  if(allDone&&!run.finished&&run.askFeel==null){finishRun();return}
  const dots=p.ex.map((x,i)=>'<i class="'+(run.sets[i].every(y=>y.d)?"dn":i===run.ex?"cur":"")+'"></i>').join("");
  const val=ci<0?a[a.length-1].v:a[ci].v;
  let bottom;
  if(run.askFeel!=null)bottom='<div class="feelbar" role="slider" tabindex="0" aria-label="'+T('这个动作感觉？','How did that feel?')+'" aria-valuemin="1" aria-valuemax="4"><span class="fl-lab">'+T('感觉？','Feel?')+'</span><div class="fl-bks">'+FEEL4.map((x,i)=>'<i style="--i:'+i+'"></i>').join("")+'</div></div><button class="f-hint" data-act="feel" data-f="">'+T('跳过','Skip')+'</button>';
  else if(ci<0)bottom='<button class="tickb done" disabled>'+ICON.check+'</button><button class="f-hint" data-act="fnext">'+T('这个动作完成了 · 下一个 →','Done with this one · next →')+'</button>';
  else bottom='<button class="tickb" data-act="tick" aria-label="'+T('完成这一组','Set done')+'">'+ICON.check+'</button>';
  f.innerHTML='<div class="f-top"><span class="sp"></span><span class="f-time n" id="fTime">0:00</span></div>'
    +'<div class="f-body" id="fBody"><div class="f-win">'+winHtml(run.ex)+'</div>'
    +'<div class="f-sets">'+a.map((x,i)=>x.d?'<i class="dn" role="button" tabindex="0" data-act="untick" data-i="'+i+'" aria-label="'+T('撤销第 '+(i+1)+' 组','Undo set '+(i+1))+'">'+ICON.check+x.v+'</i>':'<i class="'+(i===ci?"cur":"")+'">'+(i===ci?T("第 "+(i+1)+" 组","Set "+(i+1)):i+1)+'</i>').join("")
    +'<i class="add" role="button" tabindex="0" data-act="addset" aria-label="'+T('加一组','One more set')+'">'+ICON.plus+'</i></div>'
    +'<div class="f-num">'+(ci<0?'<span style="width:46px"></span>':'<button class="mini" data-act="dec" aria-label="'+T('减一','Less')+'">−</button>')+'<b class="n"><span id="fVal"'+(anim?' class="pop"':'')+'>'+val+'</span><small>'+U(e.unit)+'</small></b>'
    +(ci<0?'<span style="width:46px"></span>':'<button class="mini" data-act="inc" aria-label="'+T('加一','More')+'">+</button>')+'</div>'
    +(p.ex.length>1&&run.askFeel==null?'<div class="f-dial" role="slider" tabindex="0" aria-label="'+T('转动换动作','Turn to change move')+'" aria-valuemin="1" aria-valuemax="'+p.ex.length+'" aria-valuenow="'+(run.ex+1)+'"><div class="dl-wheel"><i class="dl-knurl"></i></div><b class="dl-mark"></b></div>':'')+'<div class="f-dots">'+dots+'</div></div>'
    +'<div class="f-bottom" id="fBottom"><button class="mini f-x" data-act="fclose" aria-label="'+T('退出','Leave')+'">'+ICON.x+'</button><div class="f-bc">'+bottom+'</div><span class="f-x"></span></div>';
  const s=Math.floor((Date.now()-run.t0)/1000);$("#fTime").textContent=Math.floor(s/60)+":"+pad(s%60);
  winFit();if(document.fonts)document.fonts.ready.then(winFit);swipe($("#fBody"));dialBind($(".f-dial"));feelBind($(".feelbar"))}
/* the move's name stays on one line: a long one shrinks to fit the window instead of wrapping */
function winFit(){const h=$(".f-win h2");if(!h)return;h.style.fontSize="";const w=h.clientWidth;if(!w)return;
  for(let k=0;k<12&&h.scrollWidth>w;k++){const f=parseFloat(getComputedStyle(h).fontSize);if(f<=14)break;h.style.fontSize=Math.max(14,f*w/h.scrollWidth*.98)+"px"}}
function winHtml(i){const p=run.p,e=p.ex[i];return '<p class="eyebrow">'+LAB(p)+T(' · 动作 ',' · move ')+(i+1)+' / '+p.ex.length+'</p><h2>'+N(e)+'</h2><p class="f-note">'+(e.note?NOTE(e):"")+'</p>'}
/* the move dial: a knurled thumb wheel like a camera's. Each notch (DL_STEP px of travel) is one move with a click;
   it keeps spinning after a flick and slows with a slightly different friction each time, so a hard spin lands
   on a move by chance; it wraps around, settles on the nearest notch, and the window shows the move as it passes */
const DL_STEP=52;
function dialBind(el){if(!el)return;const DL_KN=parseFloat(getComputedStyle(el).getPropertyValue("--d-p"))||12,kn=el.querySelector(".dl-knurl"),win=$(".f-win"),n=run.p.ex.length,start=run.ex;
  let off=0,last=0,raf=0,drag=null,shown=start,lastSnd=0,lastBz=0;
  const idx=o=>((start-Math.round(o/DL_STEP))%n+n)%n;
  const paint=()=>{kn.style.transform="translateX("+(((off%DL_KN)+DL_KN)%DL_KN-DL_KN)+"px)";const i=idx(off);
    if(i!==shown){shown=i;const t=performance.now();if(t-lastSnd>22){lastSnd=t;SFX.detent()}if(t-lastBz>45){lastBz=t;buzz(4)}
      if(win){win.innerHTML=winHtml(i);winFit();win.classList.remove("flick");void win.offsetWidth;win.classList.add("flick")}el.setAttribute("aria-valuenow",i+1)}};
  const commit=()=>{cancelAnimationFrame(raf);raf=0;el.classList.remove("spin");const i=idx(off);SFX.land();buzz(12);
    if(!run||i===run.ex){return}run.ex=i;setTimeout(()=>{if(run)renderFocus(true)},120)};
  const snap=()=>{const to=Math.round(off/DL_STEP)*DL_STEP,from=off,t0=performance.now();
    const go=t=>{const k=Math.min(1,(t-t0)/180),e=1-Math.pow(1-k,3);off=from+(to-from)*e;paint();if(k<1)raf=requestAnimationFrame(go);else commit()};raf=requestAnimationFrame(go)};
  const coast=v=>{const fr=.955+Math.random()*.02;let t1=performance.now();
    const go=t=>{const dt=Math.min(40,t-t1);t1=t;off+=v*dt;v*=Math.pow(fr,dt/16);paint();if(Math.abs(v)>.08)raf=requestAnimationFrame(go);else snap()};raf=requestAnimationFrame(go)};
  ["touchstart","touchmove","touchend"].forEach(k=>el.addEventListener(k,e=>e.stopPropagation(),{passive:true}));
  el.addEventListener("pointerdown",e=>{cancelAnimationFrame(raf);raf=0;el.setPointerCapture(e.pointerId);el.classList.add("spin");drag={x:e.clientX,o:off,pts:[[performance.now(),e.clientX]]}});
  el.addEventListener("pointermove",e=>{if(!drag)return;off=drag.o+(e.clientX-drag.x);const t=performance.now();drag.pts.push([t,e.clientX]);while(drag.pts.length>2&&t-drag.pts[0][0]>90)drag.pts.shift();paint()});
  const up=e=>{if(!drag)return;const p=drag.pts,a=p[0],b=p[p.length-1],v=b[0]-a[0]>5&&performance.now()-b[0]<70?(b[1]-a[1])/(b[0]-a[0]):0;drag=null;
    if(Math.abs(v)>.35)coast(Math.max(-6,Math.min(6,v*1.15)));else snap()};
  el.addEventListener("pointerup",up);el.addEventListener("pointercancel",up);
  el.addEventListener("keydown",e=>{if(e.key!=="ArrowLeft"&&e.key!=="ArrowRight")return;e.preventDefault();cancelAnimationFrame(raf);off+=e.key==="ArrowRight"?-DL_STEP:DL_STEP;off=Math.round(off/DL_STEP)*DL_STEP;paint();commit()});
  paint()}
/* the feel bar: tap or drag across four bricks; let go and it's kept (touch again within a moment to change it) */
function feelBind(el){if(!el)return;const bks=[...el.querySelectorAll(".fl-bks i")],lab=el.querySelector(".fl-lab");let lv=0,drag=0,tm=0;
  const show=n=>{if(n===lv)return;lv=n;bks.forEach((b,i)=>b.classList.toggle("on",i<n));const f=FEEL4[n-1];lab.textContent=T(f[1],f[2]);el.setAttribute("aria-valuenow",n);el.dataset.lv=n;SFX.detent();buzz(6)};
  const at=x=>{const r=el.querySelector(".fl-bks").getBoundingClientRect();return Math.max(1,Math.min(4,Math.ceil((x-r.left)/r.width*4)))};
  const commit=()=>{if(!run||run.askFeel==null||!lv)return;const id=run.p.ex[run.askFeel].id;run.doc.feel=run.doc.feel||{};run.doc.feel[id]=FEEL4[lv-1][0];lsSave();
    run.askFeel=null;SFX.land();buzz(12);const nx=run.sets.findIndex(x=>x.some(y=>!y.d));if(nx>=0)run.ex=nx;renderFocus(true)};
  ["touchstart","touchmove","touchend"].forEach(k=>el.addEventListener(k,e=>e.stopPropagation(),{passive:true}));
  el.addEventListener("pointerdown",e=>{clearTimeout(tm);drag=1;el.setPointerCapture(e.pointerId);show(at(e.clientX))});
  el.addEventListener("pointermove",e=>{if(drag)show(at(e.clientX))});
  const up=()=>{if(!drag)return;drag=0;clearTimeout(tm);tm=setTimeout(commit,650)};
  el.addEventListener("pointerup",up);el.addEventListener("pointercancel",up);
  el.addEventListener("keydown",e=>{if(e.key==="ArrowRight"||e.key==="ArrowLeft"){e.preventDefault();show(Math.max(1,Math.min(4,(lv||0)+(e.key==="ArrowRight"?1:-1))))}else if(e.key==="Enter")commit()})}
function tickSet(v){const a=run.sets[run.ex],ci=curSet();if(ci<0)return;a[ci].o=maxOrdOf(run.doc)+1;a[ci].d=true;if(v!=null)a[ci].v=v;lsSave();
  SFX.tick();buzz(18);
  const e=run.p.ex[run.ex];
  if(!a.every(x=>x.d))celebrate(1,0);
  if(a.every(x=>x.d)){SFX.ex();buzz([20,40,30]);popper();celebrate(3,a.some((x,i)=>+x.v>+(run.p.ex[run.ex].target||0))?1:0);
    if(e.unit!=="分钟"){run.askFeel=run.ex;renderFocus();return}
    {const nx=run.sets.findIndex(x=>x.some(y=>!y.d));if(nx>=0)run.ex=nx;renderFocus(true);return}}
  renderFocus(true)}
function untick(i){const x=run.sets[run.ex][i];if(!x||!x.d)return;x.d=false;
  if(x.o){const o=x.o;delete x.o;Object.values(run.doc.sets).forEach(arr=>arr.forEach(y=>{if(y.o>o)y.o--}))}
  lsSave();SFX.tap();renderFocus(true)}
function finishRun(){run.finished=1;clearInterval(clockT);const p=run.p,secs=Math.floor((Date.now()-run.t0)/1000);
  run.doc.done=true;run.doc.date=today();lsSave();heroSid=null;engPlanAll();
  let reps=0,sets=0,pu=0;run.sets.forEach((a,i)=>a.forEach(x=>{if(!x.d)return;sets++;if(p.ex[i].unit==="个")reps+=x.v;if(isMain(p.ex[i]))pu=Math.max(pu,x.v)}));
  SFX.done();buzz([30,60,30,60,80]);
  cannons();celebrate(10,1);
  run.pu=pu;const bal=coinTotal(),earn=bal-run.coins0;
  $("#focus").innerHTML='<div class="f-top"><span class="sp"></span><button class="mini" data-act="fclose" aria-label="'+T('关闭','Close')+'">'+ICON.x+'</button></div>'
    +'<div class="f-body"><div class="fin"><div class="fin-g"><span class="coinchip big fin-bal">'+COIN+'<b class="n" id="finBal">'+gShow(run.coins0)+'</b></span><div class="medal">'+ICON.trophy+'</div>'
    +(earn>0?'<span class="coinchip big fin-earn" id="finEarn">+'+fmt(earn)+' G</span>':'<span></span>')+'</div>'
    +'<p class="eyebrow">'+LAB(p)+'</p><h2>'+T('练完了','Done')+'</h2>'
    +'<div class="fbrief" id="finBrief">'+finBriefHtml()+'</div></div></div>'
    +'<div class="f-bottom"><button class="mini f-x" data-act="cal" data-d="today" aria-label="'+T('加练','Extra practice')+'">'+ICON.plus+'</button><div class="f-bc"><button class="btn" data-act="fclose">'+T('练完','Finish')+'</button>'
    +'<p class="f-hint">'+(firstOpen()?T('下一次：','Next: ')+LAB(firstOpen()):T('计划全部完成','Plan complete'))+'</p></div><span class="f-x"></span></div>';
  const fb=$("#finBrief");finFit();fb.addEventListener("click",e=>{if(e.target.closest("[data-act]")||!fb.classList.contains("long"))return;fb.classList.toggle("open");finFit();buzz(6)});
  finCoins(run.coins0,bal)}
/* the G earned flies over to the balance and counts it up, then the "+N G" fades away */
function finCoins(from,to){const bEl=$("#finBal"),eEl=$("#finEarn");if(!bEl||!eEl||to<=from)return;
  const n=Math.min(6,Math.max(2,Math.round((to-from)/10)));
  setTimeout(()=>{if(!bEl.isConnected)return;const a=eEl.getBoundingClientRect(),b=bEl.parentNode.getBoundingClientRect();
    for(let k=0;k<n;k++){const c=document.createElement("span");c.className="fin-fly";c.innerHTML=COIN;c.style.left=(a.left+16)+"px";c.style.top=(a.top+a.height/2-11)+"px";document.body.appendChild(c);
      setTimeout(()=>{c.style.transform="translate("+(b.left+14-a.left-16)+"px,"+(-30-Math.random()*30)+"px) scale(1.1)";setTimeout(()=>{c.style.transform="translate("+(b.left+14-a.left-16)+"px,0) scale(.6)";c.style.opacity="0"},260);setTimeout(()=>{c.remove();tone(1300+k*90,0,.06,"sine",.06)},560)},k*110)}
    const t0=performance.now()+400,dur=n*110+500;const go=t=>{if(!bEl.isConnected)return;const k=Math.max(0,Math.min(1,(t-t0)/dur));bEl.textContent=gShow(Math.round(from+(to-from)*k));
      if(k<1)requestAnimationFrame(go);else{bEl.parentNode.classList.add("bump");eEl.classList.add("gone")}};requestAnimationFrame(go)},700)}
/* today's brief on the finish screen: every session done today and every extra, in one card (it grows if you keep going) */
function finToday(t){t=t||today();const out=[];
  PROGRAM.filter(p=>{const d=state.sessions[p.sid];return d&&d.done&&d.date===t}).forEach(p=>{const doc=state.sessions[p.sid];
    out.push({h:LAB(p),kind:p.kind,rows:p.ex.map(e=>{const a=(doc.sets[e.id]||[]).filter(x=>x.d);return a.length?{n:N(e),v:a.map(x=>x.v).join("·"),pr:t===today()&&run&&run.pu>run.best0&&isMain(e)&&a.some(x=>+x.v===run.pu)}:null}).filter(Boolean),xs:doc.xs||[]})});
  const xs=[].concat(...out.map(o=>o.xs),(state.dayx[t]&&state.dayx[t].xs)||[]).filter(it=>it.sets.some(x=>x.d));
  return {out,xs:xs.map(it=>({n:typeof p1XName==="function"?p1XName(it):it.name||it.id,v:it.sets.filter(x=>x.d).map(x=>x.v).join("·")}))}}
function finBriefHtml(){const {out,xs}=finToday(),row=r=>'<div class="row"><span class="sp">'+r.n+(r.pr?' <i class="pill ac fb-pr">'+T('新纪录','Best')+'</i>':'')+'</span><b class="n">'+r.v+'</b></div>';
  return '<div class="fb-in">'+out.map((o,i)=>'<div class="row fb-h"><i class="kd" style="background:var(--'+o.kind+')"></i><b class="sp">'+o.h+'</b>'+(i?'':'<button class="mini fb-share" data-act="fshare" aria-label="'+T('分享','Share')+'">'+ICON.share+'</button>')+'</div>'+o.rows.map(row).join("")).join("")
    +(xs.length?'<p class="xhead fb-x">'+T('加练','Extra practice')+'</p>'+xs.map(row).join(""):'')+'</div>'}
function finRefresh(){const b=$("#finBrief");if(run&&run.finished&&b){b.innerHTML=finBriefHtml();finFit()}}
function finFit(){const b=$("#finBrief");if(b)b.classList.toggle("long",b.scrollHeight>b.clientHeight+4||b.classList.contains("open"))}
/* the day's training as a picture (what people post): drawn on a canvas in the skin's colours, previewed, then saved or shared */
function drawTrain(t){const {out,xs}=finToday(t),K=shColors(),d=dateObj(t),W=1080,P=72,cv=document.createElement("canvas"),c=cv.getContext("2d");
  const pr=document.createElement("i");pr.style.display="none";document.body.appendChild(pr);const kc=k=>{pr.style.color="var(--"+k+")";return getComputedStyle(pr).color};
  const F=(getComputedStyle(document.documentElement).getPropertyValue("--disp").trim()||'"Geist"')+',-apple-system,"PingFang SC","Noto Sans CJK SC","Microsoft YaHei",sans-serif',lh=64;
  const blocks=out.map(o=>{const n=dayName(o.kind);return {h:T(n.zh,n.en),col:kc(o.kind),rows:o.rows}});if(xs.length)blocks.push({h:T("加练","Extra practice"),col:K.ac,rows:xs,x:1});pr.remove();
  const H=P+90+60+blocks.reduce((h,b)=>h+90+b.rows.length*lh+30,0)+30;
  cv.width=W;cv.height=H;const bg=c.createLinearGradient(0,0,W,H);bg.addColorStop(0,K.card);bg.addColorStop(1,K.bg);c.fillStyle=bg;c.fillRect(0,0,W,H);
  c.save();c.globalAlpha=.22;const gl=c.createRadialGradient(W*.85,0,0,W*.85,0,W*.7);gl.addColorStop(0,K.ac);gl.addColorStop(1,"rgba(0,0,0,0)");c.fillStyle=gl;c.fillRect(0,0,W,H);c.restore();
  const tx=(s,x,y,font,col,al,op)=>{c.save();c.globalAlpha=op||1;c.font=font;c.fillStyle=col;c.textAlign=al||"left";c.fillText(HANT?s2t(s):s,x,y);c.restore()};
  let y=P+60;tx((d.getMonth()+1)+"."+d.getDate(),P,y,"800 64px "+F,K.ink);y+=60;
  blocks.forEach(b=>{y+=80;if(b.x){c.fillStyle=b.col;c.beginPath();c.roundRect(P,y-34,8,40,4);c.fill();tx(b.h,P+26,y,"800 40px "+F,K.ink)}
    else{c.fillStyle=b.col;c.beginPath();c.arc(P+12,y-13,12,0,7);c.fill();tx(b.h,P+40,y,"800 40px "+F,K.ink)}
    tx(T("组","Sets"),W-P,y,"600 28px "+F,K.muted,"right");
    y+=12;b.rows.forEach(r=>{c.save();c.globalAlpha=.14;c.fillStyle=K.ink;c.fillRect(P,y,W-2*P,2);c.restore();y+=lh;
      tx(r.n,P,y-18,"500 36px "+F,K.ink);tx(r.v,W-P,y-18,"700 38px "+F,K.ink,"right");if(r.pr){c.font="500 36px "+F;const w=c.measureText(HANT?s2t(r.n):r.n).width;tx(T("新纪录","Best"),P+w+20,y-20,"800 26px "+F,K.ac)}});y+=30});
  return cv}
function finShare(t){t=t||today();const back=$("#sheet").classList.contains("on")&&$("#sheetBody").dataset.day===t;
  const name=T("训练","training")+"-"+t+".png",blobOf=()=>new Promise(res=>drawTrain(t).toBlob(res,"image/png"));
  openSheet('<div class="sh-h"><h3>'+T('分享图片','Share picture')+'</h3><button class="mini" data-act="close">'+ICON.x+'</button></div><img class="shimg" alt="">'
    +'<div class="row" style="gap:10px;margin-top:14px"><button class="btn ghost" type="button" data-shsave style="flex:1">'+T('存到相册','Save to photos')+'</button><button class="btn" type="button" data-shgo style="flex:1">'+ICON.share+T('分享','Share')+'</button></div>');
  if(back)SHEET_UP=()=>p1OpenDay(t);
  $("#sheet .shimg").src=drawTrain(t).toDataURL("image/jpeg",.85);shareImgBind(blobOf,name)}
function swipe(el){let x0=null,y0=0;el.addEventListener("touchstart",e=>{x0=e.touches[0].clientX;y0=e.touches[0].clientY},{passive:true});
  el.addEventListener("touchend",e=>{if(x0==null||!run||run.askFeel!=null)return;const dx=e.changedTouches[0].clientX-x0,dy=e.changedTouches[0].clientY-y0;x0=null;
    if(Math.abs(dx)<50||Math.abs(dy)>Math.abs(dx))return;const n=run.ex+(dx<0?1:-1);if(n<0||n>=run.p.ex.length)return;
    run.ex=n;SFX.tap();renderFocus(true)})}

/* ---------- diet view ---------- */
/* food records, seven days to a card, older ones stacked underneath (finger right goes back) */
let dietGrp=0;
function dietDays(){const t=today();return Object.keys(state.diet).filter(d=>d<=t).sort().reverse()}
function dietCard(g){const all=dietDays(),keys=all.slice(g*7,g*7+7);
  if(!keys.length)return '<section class="card"><p class="eyebrow" style="margin-bottom:4px">'+T('记录','Logs')+'</p><p class="empty">'+T('还没有饮食记录','No food logged yet')+'</p></section>';
  const md=d=>(dateObj(d).getMonth()+1)+'.'+dateObj(d).getDate();
  return '<section class="card"><div class="row" style="margin-bottom:4px"><p class="eyebrow sp">'+T('记录','Logs')+'</p><span class="muted" style="font-size:12px;font-weight:600">'+md(keys[keys.length-1])+' – '+md(keys[0])+'</span>'+(g?'<button class="fsreset" data-act="dietnow" style="margin-left:8px" aria-label="'+T('回到最近','Back to the latest')+'">'+ICON.reset+'</button>':'')+'</div><div class="dl">'+keys.map(d=>{const a=intakeOf(d),g=dietGapOf(d);
      return '<button data-act="day" data-d="'+d+'"><span class="dt">'+dayLabel(d)+'</span><span class="di n">'+(a!=null?fmt(a)+' kcal':'–')+'</span>'+(g!=null?'<span class="pill '+(g>=0?"good":"bad")+'">'+(g>=0?"−":"+")+fmt(Math.abs(g))+'</span>':'')+'<svg class="go" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="m9 6 6 6-6 6"/></svg></button>'}).join("")+'</div></section>'}
function dietListHtml(){const n=Math.ceil(dietDays().length/7);if(dietGrp>=n)dietGrp=Math.max(0,n-1);return fsWrap("diet",dietCard(dietGrp),n-1)}
const DIET_FS={get:dir=>{const n=Math.ceil(dietDays().length/7),g=dietGrp+dir;return g<0||g>=n?null:dietCard(g)},commit:dir=>{dietGrp+=dir},render:dietListHtml,peekDir:1};
/* long-press (half a second, finger kept still) opens a panel */
function holdOpen(el,fn){if(!el)return;let tm=0;el.addEventListener("contextmenu",e=>e.preventDefault());
  el.addEventListener("pointerdown",e=>{clearTimeout(tm);const x=e.clientX,y=e.clientY;tm=setTimeout(()=>{tm=0;off();buzz(15);fn()},500);
    const cancel=ev=>{if(ev.type!=="pointermove"||Math.hypot(ev.clientX-x,ev.clientY-y)>10){clearTimeout(tm);off()}};
    const off=()=>["pointermove","pointerup","pointercancel"].forEach(k=>removeEventListener(k,cancel));["pointermove","pointerup","pointercancel"].forEach(k=>addEventListener(k,cancel))})}
/* the protein target: blank follows the daily recommendation (shown grey), a number is the user's own */
function openProtein(){const t=today(),rec=proteinRec(t),w=weightAtDate(t),own=+state.settings.pg>0?+state.settings.pg:"";
  const kg=v=>(v/w).toFixed(1);
  const S=p1Sheet(T("蛋白质目标","Protein target"),'<div class="row" style="align-items:flex-end;gap:10px"><label class="flabel sp">'+T("每天（g）","Per day (g)")+'<input id="pg" type="number" inputmode="numeric" step="1" min="0" value="'+own+'" placeholder="'+rec+'"></label>'
    +'<button class="mini info" type="button" aria-expanded="false" aria-label="'+T("推荐范围","Recommended range")+'" style="margin-bottom:12px">i</button></div>'
    +'<div class="theory" hidden><p><b>'+T("增肌同时减脂","Building muscle while losing fat")+'</b>'+T("每公斤体重每天 1.6–2.2 g。按你现在 "+w.toFixed(1)+" kg，是 "+Math.round(1.6*w)+"–"+Math.round(2.2*w)+" g。热量缺口越大、人越瘦，越该靠近上限。","1.6–2.2 g per kg of body weight a day. At "+w.toFixed(1)+" kg that is "+Math.round(1.6*w)+"–"+Math.round(2.2*w)+" g. The bigger the deficit and the leaner you are, the nearer the top.")+'</p>'
    +'<p><b>'+T("灰字怎么来的","Where the grey number comes from")+'</b>'+T("用性别、年龄、身高、体重估出去脂体重，每公斤去脂体重 2.2 g，再保持在上面的范围里；60 岁以上多 10%。今天是 "+rec+" g（每公斤 "+kg(rec)+" g），体重变了每天跟着变。","Lean mass estimated from sex, age, height and weight, 2.2 g per kg of it, kept inside the range above; 10% more from 60 on. Today that is "+rec+" g ("+kg(rec)+" g/kg); it moves with your weight.")+'</p>'
    +'<p><b>'+T("怎么吃","How to eat it")+'</b>'+T("分到 3–4 餐，每餐 20–40 g，练完那餐别落下。","Spread over 3–4 meals of 20–40 g each, including the one after training.")+'</p>'
    +'<p class="muted">'+T("留空就用推荐值。","Leave blank to follow the recommendation.")+'</p></div>');
  const ib=S.q(".info"),th=S.q(".theory");ib.addEventListener("click",()=>{th.hidden=!th.hidden;ib.setAttribute("aria-expanded",!th.hidden);buzz(6)});
  S.q("[data-ok]").addEventListener("click",()=>{const v=Math.round(+S.q("#pg").value);if(v>0)state.settings.pg=v;else delete state.settings.pg;lsSave();S.close();renderAll();toast(T("蛋白质目标已保存","Protein target saved"))})}
function renderDietView(){const v=$("#v-diet"),t=today();
  const tin=intakeOf(t),tb=burnOfDate(t),gap=tin!=null&&tb!=null?tb-tin:null,pr=proteinOf(t),need=proteinNeed(t);
  const y=ymdAdd(t,-1),yg=dietGapOf(y);
  let hero='<section class="card"><div class="row" style="align-items:flex-start"><div class="sp">';
  if(gap!=null)hero+='<p class="eyebrow">'+T('今天 · ','Today · ')+(gap>=0?T("缺口","deficit"):T("盈余","surplus"))+'</p><div class="big" style="color:'+(gap>=0?"var(--good)":"var(--bad)")+'">'+fmt(Math.abs(gap))+'<small>kcal</small></div><p class="muted" style="font-size:12px;margin-top:4px">'+T('摄入 ','In ')+fmt(tin)+T(' · 消耗 ',' · burn ')+fmt(tb)+'</p>';
  else if(tin!=null)hero+='<p class="eyebrow">'+T('今天 · 摄入','Today · intake')+'</p><div class="big">'+fmt(tin)+'<small>kcal</small></div><p class="muted" style="font-size:12px;margin-top:4px">'+T('消耗等手表同步','Burn waits for the watch')+(yg!=null?T(' · 昨天缺口 ',' · yesterday ')+fmt(yg):'')+'</p>';
  else hero+='<p class="eyebrow">'+T('今天','Today')+'</p><div class="big" style="font-size:26px">'+T('还没记','Nothing yet')+'</div><p class="muted" style="font-size:12px;margin-top:4px">'+(yg!=null?T('昨天'+(yg>=0?'缺口 ':'盈余 '),'Yesterday '+(yg>=0?'deficit ':'surplus '))+fmt(Math.abs(yg))+' kcal':T('点下面记一笔','Log below'))+'</p>';
  const pp=pr!=null&&need?pr/need:0;
  hero+='</div><div class="ring" id="protRing">'+ringSvg(76,8,pp,"var(--sleep)","var(--sub)")+'<span class="rl"><b class="n" style="font-size:16px;font-weight:800">'+(pr!=null?Math.round(pr):"–")+'</b><br><span class="muted" style="font-size:10px;font-weight:600">/ '+Math.round(need)+' g</span></span></div></div>';
  if(tin!=null&&tb!=null){const mx=Math.max(tin,tb);hero+='<div class="ib"><i style="width:'+(tin/mx*100)+'%;background:var(--ink)"></i><i style="width:'+(Math.max(0,tb-tin)/mx*100)+'%;background:var(--good);opacity:.35"></i></div>'
    +'<div class="legend"><span><i style="background:var(--ink)"></i>'+T('摄入','Intake')+'</span><span><i style="background:var(--good);opacity:.5"></i>'+T('缺口','Deficit')+'</span><span style="margin-left:auto"><i style="background:var(--sleep)"></i>'+T('蛋白质','Protein')+'</span></div>'}
  hero+='<div class="addrow"><button class="fsreset" data-act="go" data-to="diet" aria-label="'+T('记一笔','Log food')+'">'+ICON.plus+'</button></div></section>';
  const week=gapStackHtml();
  v.innerHTML='<div class="ptr" id="ptr" aria-hidden="true"><i></i></div>'+hero+week+dietListHtml();animateRings(v);fsBind("gap",GAP_FS);fsBind("diet",DIET_FS);holdOpen($("#protRing"),openProtein)}
/* the gap card: swipe it sideways (or tap a dot) to step through 7, 14, 30 days and since the first log; the
   big figure turns over like a split-flap board. Only finished days count (the window ends yesterday). */
const GAP_RANGES=[7,14,30,0];
let gapR=7;try{const v=+localStorage.getItem(PK+"gw");if(GAP_RANGES.includes(v)&&localStorage.getItem(PK+"gw")!==null)gapR=v}catch(e){}
function gapData(){const t=today(),to=ymdAdd(t,-1),first=Object.keys(state.diet).sort()[0];
  const from=gapR?ymdAdd(to,-(gapR-1)):(first&&first<=to?first:to),days=[];for(let d=from;d<=to;d=ymdAdd(d,1))days.push(d);
  const gaps=days.map(dietGapOf),known=gaps.filter(g=>g!=null),sum=known.reduce((a,g)=>a+g,0);return {from,to,days,gaps,known,sum}}
/* bricks: a bar chart built from stacked bricks (cols: [{n bricks, c colour, l label}]). The bricks drop in when drawn;
   a finger run across lifts each column it passes in a ripple, with a light buzz. A still chart (inside a swipe stack,
   where a sideways finger turns the card) doesn't react. */
function bricksHtml(cols,still){return '<div class="bricks'+(still?' still':'')+'" style="--cols:'+cols.length+'">'+cols.map((c,i)=>'<div class="bk" data-i="'+i+'"'+(c.t?' data-t="'+esc(c.t)+'"':'')+' style="--i:'+i+';--c:'+(c.c||'var(--ac)')+'"><div class="bks">'
  +(c.n?Array.from({length:c.n},(_,j)=>'<i style="--j:'+j+';--d:'+(i*16+j*26)+'ms"></i>').join(""):'<i class="ghost"></i>')+'</div><span class="bl">'+(c.l||'&nbsp;')+'</span></div>').join("")+'</div>'}
(function(){let box=null,last=null,hits=0,tm=0;
  const hit=e=>{const el=document.elementFromPoint(e.clientX,e.clientY),col=el&&el.closest(".bk");if(!col||col===last||!box||!box.contains(col))return;last=col;hits++;
    col.classList.remove("hot");void col.offsetWidth;col.classList.add("hot");const n=col.querySelectorAll("i:not(.ghost)").length;
    const card=box.closest(".card,.tile"),r=card&&card.querySelector(".bkread");if(r&&col.dataset.t){clearTimeout(tm);r.textContent=col.dataset.t;r.classList.add("on")}
    if(n)buzz(6)};
  addEventListener("pointerdown",e=>{box=e.target.closest&&e.target.closest(".bricks:not(.still)");last=null;hits=0;if(box)hit(e)},{passive:true});
  addEventListener("pointermove",e=>{if(box)hit(e)},{passive:true});
  ["pointerup","pointercancel"].forEach(k=>addEventListener(k,()=>{if(!box)return;const card=box.closest(".card,.tile"),r=card&&card.querySelector(".bkread");
    if(hits>1)fsEatClick();if(r){clearTimeout(tm);tm=setTimeout(()=>r.classList.remove("on"),1600)}box=null}));
  /* inside a swipe stack the bricks are for reading: a finger there doesn't turn the card */
  ["touchstart","touchmove","touchend"].forEach(k=>addEventListener(k,e=>{if(e.target.closest&&e.target.closest(".fstack .bricks:not(.still)"))e.stopPropagation()},{capture:true,passive:true}))})();
/* knob: a rotary selector. opts are the labels on its arc, each a normal button (with its own data-act); turn the knob,
   tap it for the next one, or tap a label. */
const KNOB_SPAN=140;
function knobHtml(opts,cur,attr,label){const n=opts.length,i=Math.max(0,opts.findIndex(o=>o[0]===cur)),ang=k=>n>1?-KNOB_SPAN/2+KNOB_SPAN*k/(n-1):0;
  return '<div class="knobw" style="--a:'+ang(i)+'deg" data-i="'+i+'" data-n="'+n+'">'+opts.map((o,k)=>'<button class="kl'+(k===i?' on':'')+'" data-k="'+k+'" '+attr(o[0])+' style="--a:'+ang(k)+'deg">'+o[1]+'</button>').join("")
    +'<button class="knob" aria-label="'+(label||'')+'"><i></i></button></div>'}
(function(){let d=null;
  const angOf=(e,c)=>Math.atan2(e.clientX-c.x,c.y-e.clientY)*180/Math.PI;
  addEventListener("pointerdown",e=>{const k=e.target.closest&&e.target.closest(".knob");if(!k)return;const w=k.parentNode,r=k.getBoundingClientRect();
    d={w,k,c:{x:r.left+r.width/2,y:r.top+r.height/2},n:+w.dataset.n,i:+w.dataset.i,start:+w.dataset.i,moved:false,x:e.clientX,y:e.clientY};k.setPointerCapture(e.pointerId)});
  addEventListener("pointermove",e=>{if(!d)return;if(!d.moved&&Math.hypot(e.clientX-d.x,e.clientY-d.y)<6)return;d.moved=true;d.w.classList.add("turning");
    const a=Math.max(-KNOB_SPAN/2-12,Math.min(KNOB_SPAN/2+12,angOf(e,d.c))),step=KNOB_SPAN/(d.n-1),i=Math.max(0,Math.min(d.n-1,Math.round((a+KNOB_SPAN/2)/step)));
    d.w.style.setProperty("--a",a+"deg");if(i!==d.i){d.i=i;buzz(6);tone(1500,0,.025,"square",.04);d.w.querySelectorAll(".kl").forEach((l,j)=>l.classList.toggle("on",j===i))}});
  const end=()=>{if(!d)return;const {w,n,start,moved}=d;let i=d.i;d=null;w.classList.remove("turning");if(!moved)i=(start+1)%n;
    const step=KNOB_SPAN/(n-1);w.style.setProperty("--a",(-KNOB_SPAN/2+step*i)+"deg");w.dataset.i=i;
    if(i!==start){tone(900,0,.04,"triangle",.08);const l=w.querySelector('.kl[data-k="'+i+'"]');setTimeout(()=>l&&l.click(),moved?60:180)}};
  addEventListener("pointerup",end);addEventListener("pointercancel",end)})();
/* the main exercise as a swipe stack of two brick cards: its best set day by day, and its weekly total (every ticked
   rep: any training day, extras added to a session, extras on days without one). One brick is a round number of reps
   so the tallest column stays within about 9; run a finger across the bricks to read a column. */
let mainCard=0;
function wkMon(d){return ymdAdd(d,-((dateObj(d).getDay()+6)%7))}
function brickUnit(mx){return [1,2,5,10,20,25,50,100,200,500].find(u=>mx/u<=9)||1000}
function weeklyData(){const m=mainEx();if(m.custom)return null;const by={};
  const add=(d,sets)=>(sets||[]).forEach(x=>{if(x&&x.d){const w=wkMon(d);by[w]=(by[w]||0)+(+x.v||0)}});
  Object.values(state.sessions).forEach(x=>{if(!x)return;const d=x.date||today();add(d,x.sets&&x.sets[m.id]);(x.xs||[]).forEach(it=>{if(it.id===m.id)add(d,it.sets)})});
  Object.entries(state.dayx||{}).forEach(([d,x])=>((x&&x.xs)||[]).forEach(it=>{if(it.id===m.id)add(d,it.sets)}));
  const first=Object.keys(by).filter(w=>by[w]>0).sort()[0];if(!first)return null;
  const cur=wkMon(today()),weeks=[];for(let i=11;i>=0;i--){const w=ymdAdd(cur,-7*i);if(w>=first)weeks.push(w)}
  return {weeks,vals:weeks.map(w=>by[w]||0)}}
function mainCardHtml(i){const u=mainUnit(),M=METRICS[0],dec=M.dec,W=i===1?weeklyData():null;
  const foot=(a,unit,b)=>'<div class="row muted bkf"><span>'+a+'</span><span class="sp" style="text-align:center"><i class="kd" style="background:var(--pull)"></i>= '+unit+' '+u+'</span><span>'+b+'</span></div>';
  let head,body;
  if(W){const {weeks,vals}=W,mx=Math.max(...vals),best=vals.lastIndexOf(mx),tot=vals.reduce((a,b)=>a+b,0),unit=brickUnit(mx);
    head='<span class="tl"><i style="background:var(--pull)"></i>'+T('每周总数 · '+weeks.length+' 周','Weekly total · '+weeks.length+(weeks.length>1?' weeks':' week'))+'</span>'
      +'<span class="tv">'+fmt(tot)+'<small>'+u+'</small></span><span class="td muted">'+T('本周 ','This week ')+fmt(vals[vals.length-1])+' '+u+'</span>';
    body=bricksHtml(vals.map((v,k)=>({n:v?Math.max(1,Math.round(v/unit)):0,c:k===best?"var(--push)":"var(--pull)",t:T(dayLabel(weeks[k])+' 那周 · ',dayLabel(weeks[k])+' week · ')+fmt(v)+' '+u})))
      +foot(dayLabel(weeks[0]),unit,T('本周','This week'))}
  else{const all=mainSeries(),pts=all.slice(-12),last=all[all.length-1];
    head='<span class="tl"><i style="background:var(--pull)"></i>'+mainName()+'</span>'
      +'<span class="tv">'+(last?last.y.toFixed(dec)+'<small>'+u+'</small>':'–')+'</span>'+(last?deltaOf(M,all):'<span class="td muted">'+T('还没有数据','No data yet')+'</span>');
    if(pts.length){const mx=Math.max(...pts.map(p=>p.y)),unit=brickUnit(mx),best=pts.map(p=>p.y).lastIndexOf(mx);
      body=bricksHtml(pts.map((p,k)=>({n:p.y>0?Math.max(1,Math.round(p.y/unit)):0,c:k===best?"var(--push)":"var(--pull)",t:dayLabel(p.date)+' · '+(+p.y).toFixed(dec)+' '+u})))
        +foot(dayLabel(pts[0].date),unit,dayLabel(pts[pts.length-1].date))}else body=''}
  return '<section class="card mcard" data-act="metric" data-k="pull"><span class="bkread n" aria-live="polite"></span>'+head+body+'</section>'}
function mainCards(){return weeklyData()?2:1}
function mainStackHtml(){if(mainCard>=mainCards())mainCard=0;return fsWrap("mainst",mainCardHtml(mainCard),mainCards()-1)}
const MAIN_FS={get:()=>mainCards()<2?null:mainCardHtml((mainCard+1)%2),commit:()=>{mainCard=(mainCard+1)%2},render:mainStackHtml,peekDir:1};
function flapHtml(txt){return '<span class="flap">'+[...txt].map((c,i)=>'<span style="--i:'+i+'">'+c+'</span>').join("")+'</span>'}
function gapCardHtml(rr){const keep=gapR;if(rr!=null)gapR=rr;const {from,to,days,gaps,known,sum}=gapData();gapR=keep;const R=rr!=null?rr:gapR,mx=Math.max(300,...known.map(Math.abs));
  const label=R?T('过去 '+R+' 天','Last '+R+' days'):T('有记录以来 '+days.length+' 天','Since the first log · '+days.length+' days');
  const w=known.length?fatWord(sum/7700,from,to):"about",word=(LANG==="en"?{about:"about ",high:"aggressive: ",low:"conservative: "}:{about:"约 ",high:"激进估计 ",low:"保守估计 "})[w];
  /* long windows draw one bar per week so the bars stay readable */
  let cols=days.map((d,i)=>({g:gaps[i],l:days.length<=14?WD[dateObj(d).getDay()]:""}));
  if(days.length>31){cols=[];for(let i=0;i<days.length;i+=7){const ch=gaps.slice(i,i+7).filter(g=>g!=null);cols.push({g:ch.length?ch.reduce((a,b)=>a+b,0)/ch.length:null,l:""})}}
  const cm=Math.max(300,...cols.filter(c=>c.g!=null).map(c=>Math.abs(c.g)));
  return '<section class="card gapcard"><div class="row"><div class="sp"><p class="eyebrow">'+label+(known.length<days.length?T(' · 记了 '+known.length+' 天',' · '+known.length+' logged'):'')+'</p>'
    +'<div class="big">'+flapHtml(known.length?(sum>=0?"":"+")+fmt(Math.abs(sum)):"–")+'<small>kcal '+(sum>=0?T("缺口","deficit"):T("盈余","surplus"))+'</small></div></div>'
    +(known.length?'<span class="pill gpill '+(sum>=0?"good":"bad")+'"><span>'+(w==="about"?word:'')+(Math.abs(sum)/7700).toFixed(2)+T(' kg 脂肪',' kg fat')+'</span>'+(w==="about"?'':'<small>'+word.replace(/[:：]?\s*$/,'')+'</small>')+'</span>':'')+'</div>'
    +bricksHtml(cols.map(c=>({n:c.g==null?0:Math.max(1,Math.round(Math.abs(c.g)/cm*8)),c:c.g==null?"":c.g>=0?"var(--good)":"var(--bad)",l:c.l})),true)
    +(days.length?'<div class="row muted" style="font-size:11px;font-weight:600;margin-top:6px"><span>'+dayLabel(from)+'</span><span class="sp"></span><span>'+dayLabel(to)+'</span></div>':'')
    +'</section>'}
/* the four periods are a frosted swipe stack too: finger right for longer, left for shorter */
function gapStackHtml(){const i=GAP_RANGES.indexOf(gapR);return fsWrap("gap",gapCardHtml(),GAP_RANGES.length-1)}
const GAP_FS={get:dir=>{const i=GAP_RANGES.indexOf(gapR)+dir;return i<0||i>=GAP_RANGES.length?null:gapCardHtml(GAP_RANGES[i])},
  commit:dir=>{gapR=GAP_RANGES[GAP_RANGES.indexOf(gapR)+dir];try{localStorage.setItem(PK+"gw",String(gapR))}catch(e){}},render:gapStackHtml,peekDir:1};
/* food table: opening Diet pulls it quietly (not again within half a minute); pulling the page down pulls it now */
function syncSpin(on){$("#syncDot").classList.toggle("spin",on)}
async function dietPull(manual){let st={};try{st=JSON.parse(localStorage.getItem(SHEET_STATUS_K)||"{}")||{}}catch(e){}
  let url="";try{url=localStorage.getItem(SHEET_URL_K)||""}catch(e){}
  if(!manual&&(!url||(st.ok&&st.ts&&Date.now()-st.ts<30e3)))return;
  syncSpin(true);const r=await pullSheetQuiet({silent:!manual});syncSpin(false);
  if(r.ok&&cur==="diet")renderDietView()}
(function(){let y0=null,dy=0;const lim=70;
  document.addEventListener("touchstart",e=>{if(cur!=="diet"||run||scrollY>0||$("#sheet").classList.contains("on")||document.querySelector(".mask"))return;y0=e.touches[0].clientY;dy=0},{passive:true});
  document.addEventListener("touchmove",e=>{if(y0==null)return;dy=Math.max(0,e.touches[0].clientY-y0);const p=$("#ptr");if(p){p.style.height=Math.min(lim,dy*.5)+"px";p.classList.toggle("ready",dy*.5>=lim-4)}},{passive:true});
  document.addEventListener("touchend",()=>{if(y0==null)return;const p=$("#ptr"),go=dy*.5>=lim-4;y0=null;if(p){p.style.height="";p.classList.remove("ready")}if(go){buzz(12);dietPull(true)}})})();
function daySheet(d){const day=state.diet[d]||{},items=day.items||[],tt=dietTotals(day),a=intakeOf(d),b=burnOfDate(d),g=dietGapOf(d);
  const f1=x=>x==null||x===""?"–":(+x).toFixed(0);
  openSheet('<div class="sh-h"><h3>'+dayLabel(d)+(/^\d/.test(dayLabel(d))?"":' · '+(dateObj(d).getMonth()+1)+'.'+dateObj(d).getDate())+'</h3>'+(items.length?'<button class="mini" data-act="dshare" data-d="'+d+'" aria-label="'+T('分享成图片','Share as a picture')+'">'+ICON.share+'</button>':'')+'<button class="mini" data-act="close">'+ICON.x+'</button></div>'
    +'<div class="row" style="margin-bottom:16px"><div class="sp"><p class="eyebrow">'+T('摄入','Intake')+'</p><b class="n" style="font-size:22px;font-weight:800">'+fmt(a)+'</b></div><div class="sp"><p class="eyebrow">'+T('消耗','Burn')+'</p><b class="n" style="font-size:22px;font-weight:800">'+fmt(b)+'</b></div>'
    +'<div class="sp"><p class="eyebrow">'+(g==null||g>=0?T("缺口","Deficit"):T("盈余","Surplus"))+'</p><b class="n" style="font-size:22px;font-weight:800;color:'+(g==null?"inherit":g>=0?"var(--good)":"var(--bad)")+'">'+(g==null?"–":fmt(Math.abs(g)))+'</b></div></div>'
    +(items.length?'<table class="tbl"><tr><th>'+T('食物','Food')+'</th><th>'+T('蛋白','Prot.')+'</th><th>'+T('脂肪','Fat')+'</th><th>'+T('碳水','Carbs')+'</th><th>'+T('蔬菜','Veg')+'</th><th>kcal</th></tr>'+items.map(it=>'<tr><td>'+escHtml(it.name||"")+'</td><td>'+f1(it.p)+'</td><td>'+f1(it.f)+'</td><td>'+f1(it.c)+'</td><td>'+f1(it.veg)+'</td><td>'+f1(it.kcal)+'</td></tr>').join("")
      +(items.length>1?'<tr class="tot"><td>'+T('合计','Total')+'</td><td>'+f1(tt.p)+'</td><td>'+f1(tt.f)+'</td><td>'+f1(tt.c)+'</td><td>'+f1(tt.veg)+'</td><td>'+f1(tt.kcal)+'</td></tr>':'')+'</table>':'<p class="empty">'+T('这天只记了总数','Only a total that day')+'</p>')
    +(day.note?'<p class="muted" style="font-size:12px;margin-top:12px">'+escHtml(day.note)+'</p>':'')
    +'<button class="btn ghost" style="margin-top:16px;height:46px;font-size:15px" data-act="go" data-to="diet:'+d+'">'+ICON.pen+T('编辑这天','Edit this day')+'</button>')}

/* a day's food as a picture to send to friends: the table drawn on a canvas in the current skin's colours. A panel
   shows it first, with a switch for whether burn and deficit go in (remembered), then save it or share it */
const SHB_K=PK+"shb";
function shColors(){const pr=document.createElement("i"),rd=v=>{pr.style.color="var("+v+")";return getComputedStyle(pr).color};pr.style.display="none";document.body.appendChild(pr);
  const o={bg:rd("--bg"),card:rd("--card"),ink:rd("--ink"),muted:rd("--muted"),ac:rd("--ac"),bad:rd("--bad"),good:rd("--good")};pr.remove();return o}
function drawShare(d,burn){const day=state.diet[d]||{},items=day.items||[],tt=dietTotals(day),a=intakeOf(d),b=burnOfDate(d),g=dietGapOf(d),K=shColors();
  const W=1080,P=64,cv=document.createElement("canvas"),c=cv.getContext("2d"),F=(getComputedStyle(document.documentElement).getPropertyValue("--disp").trim()||'"Geist"')+',-apple-system,"PingFang SC","Noto Sans CJK SC","Microsoft YaHei",sans-serif';
  const n0=x=>x==null||x===""?"–":String(Math.round(+x)),cols=[T("蛋白","Prot."),T("脂肪","Fat"),T("碳水","Carbs"),T("蔬菜","Veg"),"kcal"],cw=110,nameW=W-2*P-cw*cols.length-16;
  const wrap=(t,w,font)=>{c.font=font;const out=[];let line="";for(const ch of (String(t).match(/[⺀-鿿　-〿＀-￯]|[^\s⺀-鿿　-〿＀-￯]+|\s+/g)||[])){if(c.measureText(line+ch).width>w&&line.trim()){out.push(line.trimEnd());line=ch.trimStart()}else line+=ch}if(line)out.push(line);return out.length?out:[""]};
  const rowFont='500 32px '+F,lh=42;
  const rows=items.map(it=>({name:wrap(HANT?s2t(it.name||""):(it.name||""),nameW,rowFont),v:[it.p,it.f,it.c,it.veg,it.kcal].map(n0)}));
  if(items.length>1)rows.push({name:[T("合计","Total")],v:[tt.p,tt.f,tt.c,tt.veg,tt.kcal].map(n0),tot:1});
  const H=P+70+40+90+60+66+rows.reduce((h,r)=>h+r.name.length*lh+28,0)+90;
  cv.width=W;cv.height=H;const bg=c.createLinearGradient(0,0,W,H);bg.addColorStop(0,K.card);bg.addColorStop(1,K.bg);c.fillStyle=bg;c.fillRect(0,0,W,H);
  c.save();c.globalAlpha=.22;const gl=c.createRadialGradient(W*.85,0,0,W*.85,0,W*.7);gl.addColorStop(0,K.ac);gl.addColorStop(1,"rgba(0,0,0,0)");c.fillStyle=gl;c.fillRect(0,0,W,H);c.restore();
  const tx=(t,x,y,font,col,al,op)=>{c.save();c.globalAlpha=op||1;c.font=font;c.fillStyle=col;c.textAlign=al||"left";c.fillText(HANT?s2t(t):t,x,y);c.restore()};
  let y=P+56;tx((dateObj(d).getMonth()+1)+"."+dateObj(d).getDate()+(LANG==="en"?"":" "+T("吃了什么","what I ate")),P,y,"800 60px "+F,K.ink);
  const stats=[[T("摄入","Intake"),fmt(a),K.ink]];if(burn)stats.push([T("消耗","Burn"),fmt(b),K.ink],[g==null||g>=0?T("缺口","Deficit"):T("盈余","Surplus"),g==null?"–":fmt(Math.abs(g)),g==null?K.ink:g>=0?K.good:K.bad]);
  y+=130;stats.forEach(([l,v,col],i)=>{const x=P+i*300;tx(l,x,y-44,"600 26px "+F,K.muted);tx(v,x,y+6,"800 52px "+F,col)});
  y+=96;tx(T("食物","Food"),P,y,"600 26px "+F,K.muted);cols.forEach((h,i)=>tx(h,W-P-(cols.length-1-i)*cw,y,"600 26px "+F,K.muted,"right"));
  y+=18;rows.forEach(r=>{c.save();c.globalAlpha=.14;c.fillStyle=K.ink;c.fillRect(P,y,W-2*P,2);c.restore();y+=lh;const f=r.tot?'800 32px '+F:rowFont;
    r.name.forEach((ln,k)=>tx(ln,P,y+k*lh-4,f,K.ink));r.v.forEach((v,i)=>tx(v,W-P-(cols.length-1-i)*cw,y-4,(r.tot?"800 ":"600 ")+"32px "+F,K.ink,"right"));y+=(r.name.length-1)*lh+28});
  tx(T("博G","bG"),W-P,H-44,"700 26px "+F,K.muted,"right",.8);return cv}
async function shareDay(d){let burn=true;try{burn=localStorage.getItem(SHB_K)!=="0"}catch(e){}
  const name=T("饮食","food")+"-"+d+".png",blobOf=()=>new Promise(res=>drawShare(d,burn).toBlob(res,"image/png"));
  openSheet('<div class="sh-h"><h3>'+T('分享图片','Share picture')+'</h3><button class="mini" data-act="close">'+ICON.x+'</button></div>'
    +'<img class="shimg" alt="">'
    +'<div class="setlist" style="margin-top:12px"><button class="opt" type="button" data-shb role="switch" aria-checked="'+burn+'"><span class="sp">'+T('带上消耗和缺口','Include burn and deficit')+'</span><span class="sw" aria-hidden="true"></span></button></div>'
    +'<div class="row" style="gap:10px;margin-top:14px"><button class="btn ghost" type="button" data-shsave style="flex:1">'+T('存到相册','Save to photos')+'</button><button class="btn" type="button" data-shgo style="flex:1">'+ICON.share+T('分享','Share')+'</button></div>');
  SHEET_UP=()=>daySheet(d);
  const im=$("#sheet .shimg"),paint=()=>{im.src=drawShare(d,burn).toDataURL("image/jpeg",.85)};paint();
  $("#sheet [data-shb]").addEventListener("click",e=>{burn=!burn;e.currentTarget.setAttribute("aria-checked",burn);try{localStorage.setItem(SHB_K,burn?"1":"0")}catch(err){}buzz(8);paint()});
  /* saving: a download, which phones put where the gallery finds it; where the browser can't download (iOS), the share sheet's "Save image" */
  shareImgBind(blobOf,name)}
function shareImgBind(blobOf,name){
  $("#sheet [data-shsave]").addEventListener("click",async()=>{const blob=await blobOf(),file=new File([blob],name,{type:"image/png"});buzz(10);
    if(/iP(hone|ad|od)/.test(navigator.userAgent)&&navigator.canShare&&navigator.canShare({files:[file]})){try{await navigator.share({files:[file]})}catch(e){}return}
    const url=URL.createObjectURL(blob),el=document.createElement("a");el.href=url;el.download=name;document.body.appendChild(el);el.click();el.remove();setTimeout(()=>URL.revokeObjectURL(url),1e4);toast(T("图片已存到相册","Saved to photos"))});
  $("#sheet [data-shgo]").addEventListener("click",async()=>{const blob=await blobOf(),file=new File([blob],name,{type:"image/png"});buzz(10);
    if(navigator.canShare&&navigator.canShare({files:[file]})){try{await navigator.share({files:[file]})}catch(e){}return}
    toast(T("这个浏览器不能直接分享，先存到相册再发","This browser can't share directly; save it first"))})}

/* ---------- progress view ---------- */
const METRICS=[
  {k:"pull",get name(){return mainName()},get unit(){return mainUnit()},c:"var(--pull)",up:1,wide:1,pts:()=>mainSeries(),get dec(){return /km|kg/.test(mainEx().unit)?1:0},rec:"rec:pullups"},
  {k:"wt",name:T("体重","Weight"),unit:"kg",c:"var(--push)",up:0,pts:()=>avg7(wtMerged()),dec:1,sub:T("7 日均","7-day avg"),rec:"rec:weight"},
  {k:"waist",name:T("腰围","Waist"),unit:"cm",c:"var(--ac-text)",up:0,pts:()=>series("waist"),dec:1,rec:"rec:waist"},
  {k:"sleep",name:T("睡眠","Sleep"),unit:T("分","pts"),c:"var(--sleep)",up:1,pts:()=>series("sleep"),dec:0,rec:"sync"},
  {k:"hrv",name:"HRV",unit:"ms",c:"#38BDF8",up:1,pts:()=>series("hrv"),dec:0,rec:"sync"},
  {k:"rhr",name:T("静息心率","Resting HR"),unit:"bpm",c:"var(--bad)",up:0,pts:()=>series("rhr"),dec:0,rec:"sync"}];
function smoothPath(P){if(!P.length)return "";let d="M"+P[0][0].toFixed(1)+" "+P[0][1].toFixed(1);if(P.length<2)return d;
  const n=P.length,s=[],t=new Array(n).fill(0);for(let i=0;i<n-1;i++){const h=P[i+1][0]-P[i][0];s.push(h?(P[i+1][1]-P[i][1])/h:0)}
  t[0]=s[0];t[n-1]=s[n-2];for(let i=1;i<n-1;i++)t[i]=s[i-1]*s[i]<=0?0:3*(s[i-1]+s[i])/((2*s[i]+s[i-1])/s[i-1]+(s[i]+2*s[i-1])/s[i]);
  for(let i=0;i<n-1;i++){const h=(P[i+1][0]-P[i][0])/3;d+="C"+(P[i][0]+h).toFixed(1)+" "+(P[i][1]+t[i]*h).toFixed(1)+" "+(P[i+1][0]-h).toFixed(1)+" "+(P[i+1][1]-t[i+1]*h).toFixed(1)+" "+P[i+1][0].toFixed(1)+" "+P[i+1][1].toFixed(1)}
  return d}
let GID=0;
function lineSvg(pts,W,H,col,cls,pad){pad=pad||4;if(pts.length<2)return '<svg class="'+cls+'" viewBox="0 0 '+W+' '+H+'"></svg>';
  const xs=pts.map(p=>p.x),ys=pts.map(p=>p.y),x0=Math.min(...xs),x1=Math.max(...xs),lo=Math.min(...ys),hi=Math.max(...ys),sp=(hi-lo)||1;
  const P=pts.map(p=>[(x1===x0?W/2:(p.x-x0)/(x1-x0)*W),pad+(1-(p.y-lo)/sp)*(H-2*pad)]);const id="g"+(++GID),line=smoothPath(P),last=P[P.length-1];
  return '<svg class="'+cls+'" viewBox="0 0 '+W+' '+H+'" preserveAspectRatio="none"><defs><linearGradient id="'+id+'" x1="0" x2="0" y1="0" y2="1"><stop offset="0" style="stop-color:'+col+';stop-opacity:.28"/><stop offset="1" style="stop-color:'+col+';stop-opacity:0"/></linearGradient></defs>'
    +'<path d="'+line+'L'+W+' '+H+'L0 '+H+'Z" fill="url(#'+id+')"/><path d="'+line+'" fill="none" stroke="'+col+'" stroke-width="2.2" stroke-linecap="round" vector-effect="non-scaling-stroke"/>'
    +'<circle cx="'+last[0]+'" cy="'+last[1]+'" r="3.5" fill="var(--card)" stroke="'+col+'" stroke-width="2" vector-effect="non-scaling-stroke"/></svg>'}
function recent(pts,days){const t=dnum(today());return days?pts.filter(p=>p.x>t-days):pts}
function deltaOf(m,pts,days){days=days==null?30:days;if(pts.length<2)return "";const last=pts[pts.length-1],t=last.x-(days||1e9);let ref=pts[0];for(const p of pts)if(p.x<=t)ref=p;
  const span=days?days+T(' 天',' days'):T('全部','all time');
  const d=last.y-ref.y;if(Math.abs(d)<(m.dec?.05:.5))return '<span class="td muted">'+span+T(' 持平',' flat')+'</span>';
  const good=(d>0)===!!m.up;return '<span class="td" style="color:'+(good?"var(--good)":"var(--bad)")+'">'+(d>0?"↑ ":"↓ ")+Math.abs(d).toFixed(m.dec)+' '+m.unit+' · '+span+'</span>'}
function goalsHtml(){const st=state.settings,gap=gapAllTime();
  const pu=pullSeries(),wt=avg7(wtMerged()),wz=series("waist");
  const G=[{k:mainEx().id==="pullup"?"pullups":"main:"+mainEx().id,n:mainName().replace(/^标准/,"").replace(/^Strict /,""),c:"var(--pull)",cur:pu.length?pu[pu.length-1].y:null,start:0,tg:+st.p||null,u:mainUnit()},
    {k:"waist",n:T("腰围","Waist"),c:"var(--ac)",cur:wz.length?wz[wz.length-1].y:null,start:wz.length?wz[0].y:null,tg:+st.z||null,u:"cm"},
    {k:"weight",n:T("体重","Weight"),c:"var(--sleep)",cur:wt.length?+wt[wt.length-1].y.toFixed(1):null,start:wt.length?wt[0].y:null,tg:+st.w||null,u:"kg"},
    {k:"fat",n:T("减脂","Fat loss"),c:"#FFB020",cur:gap?+(gap.s/7700).toFixed(1):null,start:0,tg:+st.fat||null,u:"kg"}];
  return '<section class="dark"><div class="row" style="margin-bottom:14px"><p class="eyebrow sp">'+T('目标','Goals')+'</p></div><div class="goals4">'+G.map(g=>{
    const pct=g.tg&&g.cur!=null&&g.start!=null&&g.start!==g.tg?Math.max(0,Math.min(1,(g.cur-g.start)/(g.tg-g.start))):0;
    if(g.tg&&g.cur!=null)milestone(g.k,pct*100,g.n);
    return '<button data-act="goal"><span class="ring">'+ringSvg(66,7,pct,g.c,"var(--track)")+'<span class="rl"><b class="n" style="font-size:15px;font-weight:800">'+(g.tg?Math.round(pct*100)+"%":"–")+'</b></span></span>'
      +'<span><span class="gn">'+g.n+'</span><br><span class="gv n">'+(g.cur==null?"–":g.cur+" "+g.u)+'</span></span></button>'}).join("")+'</div></section>'}
/* tiles: long-press one to edit (drag to reorder, × to hide; the floating + brings hidden ones back, ✓ finishes).
   settings.tiles = {order:[k…], hidden:[k…]}; a COROS item switched off in sync settings stays hidden too. */
let tileEdit=false;
function tileCfg(){const t=state.settings.tiles||{};return {order:t.order||[],hidden:t.hidden||[]}}
function tileList(){const c=tileCfg(),off=k=>{const s=state.settings.sync;return s&&s[{sleep:"sleep",hrv:"hrv",rhr:"rhr"}[k]]===false};
  const pos=k=>{const i=c.order.indexOf(k);return i<0?100+METRICS.findIndex(m=>m.k===k):i};
  const all=METRICS.filter(m=>!off(m.k)).slice().sort((a,b)=>pos(a.k)-pos(b.k));
  return {shown:all.filter(m=>!c.hidden.includes(m.k)),hidden:all.filter(m=>c.hidden.includes(m.k))}}
function renderProgView(){const v=$("#v-prog"),{shown,hidden}=tileList();
  const tiles=shown.map(m=>{if(m.k==="pull")return '<div class="tile wide tstack" data-k="pull">'+mainStackHtml()+(tileEdit?'<span class="tx" data-act="thide" data-k="pull" role="button" aria-label="'+T('隐藏','Hide')+'">'+ICON.x+'</span>':'')+'</div>';const all=m.pts(),pts=recent(all,30),last=all[all.length-1];
    return '<button class="tile'+(m.wide?" wide":"")+'" data-act="metric" data-k="'+m.k+'"><span class="tl"><i style="background:'+m.c+'"></i>'+m.name+(m.sub?' · '+m.sub:'')+'</span>'
      +'<span class="tv">'+(last?last.y.toFixed(m.dec)+'<small>'+m.unit+'</small>':'–')+'</span>'+(last?deltaOf(m,all):'<span class="td muted">'+T('还没有数据','No data yet')+'</span>')
      +(pts.length>1?lineSvg(pts,m.wide?320:150,m.wide?64:44,m.c,"spark"):'')
      +(tileEdit?'<span class="tx" data-act="thide" data-k="'+m.k+'" role="button" aria-label="'+T('隐藏','Hide')+'">'+ICON.x+'</span>':'')+'</button>'}).join("");
  v.innerHTML=goalsHtml()+'<div class="bento'+(tileEdit?' editing':'')+'">'+tiles+'</div>'
    +(tileEdit?'<div class="tilebar">'+(hidden.length?'<button class="fsreset" data-act="tadd" aria-label="'+T('加回图表','Add a chart back')+'">'+ICON.plus+'</button>':'')+'<button class="fsreset" data-act="tdone" aria-label="'+T('完成','Done')+'">'+ICON.check+'</button></div>':'');
  animateRings(v);tileBind();if(!tileEdit&&$('.fstack[data-fs="mainst"]'))fsBind("mainst",MAIN_FS)}
function tileSave(cfg){state.settings.tiles=cfg;lsSave()}
function tileBind(){const box=$("#v-prog .bento");if(!box)return;let tm=0,drag=null;
  /* long-press to edit */
  box.addEventListener("pointerdown",e=>{const t=e.target.closest(".tile");if(!t||e.target.closest(".tx"))return;
    if(!tileEdit){clearTimeout(tm);const x=e.clientX,y=e.clientY;tm=setTimeout(()=>{tm=0;tileEdit=true;buzz(15);fsEatClick();renderProgView()},500);
      const cancel=ev=>{if(ev.type!=="pointermove"||Math.hypot(ev.clientX-x,ev.clientY-y)>10){clearTimeout(tm);off()}};
      const off=()=>{["pointermove","pointerup","pointercancel"].forEach(k=>removeEventListener(k,cancel))};["pointermove","pointerup","pointercancel"].forEach(k=>addEventListener(k,cancel));return}
    /* editing: drag a tile to a new place */
    e.preventDefault();const r0=t.getBoundingClientRect();drag={t,x:e.clientX,y:e.clientY,moved:false};t.setPointerCapture(e.pointerId);t.classList.add("drag")});
  box.addEventListener("pointermove",e=>{if(!drag)return;const dx=e.clientX-drag.x,dy=e.clientY-drag.y;if(Math.hypot(dx,dy)>6)drag.moved=true;
    drag.t.style.transform="translate("+dx+"px,"+dy+"px) scale(1.04)";drag.t.style.pointerEvents="none";
    const o=document.elementFromPoint(e.clientX,e.clientY),ot=o&&o.closest(".bento .tile");drag.t.style.pointerEvents="";
    if(ot&&ot!==drag.t){const rb=ot.getBoundingClientRect(),before=e.clientY<rb.top+rb.height/2&&(ot.classList.contains("wide")||e.clientX<rb.left+rb.width/2||e.clientY<rb.top+rb.height/3);
      const r1=drag.t.getBoundingClientRect();box.insertBefore(drag.t,before?ot:ot.nextSibling);const r2=drag.t.getBoundingClientRect();drag.x+=r2.left-r1.left;drag.y+=r2.top-r1.top;
      drag.t.style.transform="translate("+(e.clientX-drag.x)+"px,"+(e.clientY-drag.y)+"px) scale(1.04)";buzz(6)}});
  const end=()=>{if(!drag)return;const t=drag.t,moved=drag.moved;drag=null;t.classList.remove("drag");t.style.transform="";
    if(moved){fsEatClick();const c=tileCfg(),keys=[...box.querySelectorAll(".tile")].map(x=>x.dataset.k);c.order=keys.concat(c.order.filter(k=>!keys.includes(k)));tileSave(c)}};
  box.addEventListener("pointerup",end);box.addEventListener("pointercancel",end)}
function tileAddSheet(){const {hidden}=tileList();
  openSheet('<div class="sh-h"><h3>'+T('加回图表','Add a chart back')+'</h3><button class="mini" data-act="close">'+ICON.x+'</button></div><div class="setlist">'
    +hidden.map(m=>'<button class="opt" data-act="tshow" data-k="'+m.k+'"><i class="kd" style="background:'+m.c+'"></i><span class="sp">'+m.name+'</span>'+ICON.plus+'</button>').join("")+'</div>')}
let chartRange=30;
function metricSheet(k){const m=METRICS.find(x=>x.k===k),all=m.pts();
  const draw=()=>{const pts=recent(all,chartRange),last=all[all.length-1];
    $("#sheetBody").innerHTML='<div class="sh-h"><h3>'+m.name+'</h3><button class="mini" data-act="close">'+ICON.x+'</button></div>'
      +'<div class="row" style="margin-bottom:14px;align-items:flex-end"><div class="sp"><div class="big">'+(last?last.y.toFixed(m.dec):"–")+'<small>'+m.unit+'</small></div>'+(last?deltaOf(m,all,chartRange):'')+'</div>'
      +knobHtml([[14,T("14天","14d")],[30,T("30天","30d")],[90,T("90天","90d")],[0,T("全部","All")]],chartRange,d=>'data-act="range" data-r="'+d+'"',T('时间范围','Range'))+'</div>'
      +(pts.length>1?'<div class="chart" id="chart">'+lineSvg(pts,340,200,m.c,"",14)+'<span class="tip" id="ctip"></span></div>'
        +'<div class="row muted" style="font-size:11px;font-weight:600;margin-top:6px"><span>'+dayLabel(pts[0].date)+'</span><span class="sp"></span><span>'+dayLabel(pts[pts.length-1].date)+'</span></div>'
        +'<div class="row" style="margin-top:16px;gap:8px"><span class="pill">'+T('最低 ','Low ')+Math.min(...pts.map(p=>p.y)).toFixed(m.dec)+'</span><span class="pill">'+T('最高 ','High ')+Math.max(...pts.map(p=>p.y)).toFixed(m.dec)+'</span><span class="pill">'+pts.length+T(' 个记录',' records')+'</span></div>'
        :'<p class="empty">'+T('这段时间不够两个记录','Fewer than two records in this period')+'</p>')
      +(m.rec?'<button class="btn ghost" style="margin-top:16px;height:46px;font-size:15px" data-act="go" data-to="'+m.rec+'">'+(m.rec==="sync"?ICON.sync+T('从高驰同步','Sync from COROS'):ICON.pen+T('记一笔','Log'))+'</button>':'');
    const ch=$("#chart");if(ch)scrubber(ch,pts,m)};
  openSheet("");draw();metricSheet.redraw=draw}
function scrubber(el,pts,m){const tip=el.querySelector(".tip"),xs=pts.map(p=>p.x),x0=Math.min(...xs),x1=Math.max(...xs);
  const show=e=>{const r=el.getBoundingClientRect(),cx=(e.touches?e.touches[0].clientX:e.clientX)-r.left,fx=x0+(cx/r.width)*(x1-x0);
    let best=pts[0];pts.forEach(p=>{if(Math.abs(p.x-fx)<Math.abs(best.x-fx))best=p});
    tip.textContent=dayLabel(best.date)+'  '+best.y.toFixed(m.dec)+' '+m.unit;tip.style.left=Math.max(40,Math.min(r.width-40,(best.x-x0)/(x1-x0||1)*r.width))+"px";tip.classList.add("on")};
  el.addEventListener("pointerdown",show);el.addEventListener("pointermove",e=>{if(e.buttons||e.pointerType==="touch")show(e)});
  el.addEventListener("pointerup",()=>setTimeout(()=>tip.classList.remove("on"),1200))}

/* ---------- G (Grind): badges and the theme shop ---------- */
/* the G coin is the theme's own round button with a G on it, breathing a gold glow */
const COIN='<span class="coin circ" aria-hidden="true"><b>G</b></span>';
const BADGE_IC={dumbbell:'<path d="M6.5 6.5v11M17.5 6.5v11M3.5 9v6M20.5 9v6M6.5 12h11"/>',flame:'<path d="M12 3c1 4-3 5-3 9a3 3 0 0 0 6 0c0-1-.5-2-1-3 3 1 5 4 5 7a7 7 0 0 1-14 0c0-6 6-8 7-13z"/>',
  pullup:'<path d="M3 4h18M7 4v3M17 4v3"/><circle cx="12" cy="10" r="2.2"/><path d="M7 7l3 5h4l3-5M12 12.5V17M10 21l2-4 2 4"/>',drop:'<path d="M12 3s6 6.5 6 11a6 6 0 0 1-12 0c0-4.5 6-11 6-11z"/>',
  tape:'<rect x="3" y="8" width="18" height="8" rx="2"/><path d="M7 8v3M11 8v4M15 8v3M19 8v4"/>',flag:'<path d="M5 21V4M5 4h11l-2 4 2 4H5"/>',target:'<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/>'};
/* a theme shown by its own pages: img/th/<id>-<light|dark>.webp holds training, food and progress side by side
   (made by tools/thumbs.js). A small stack of them stands for the theme; two-look themes carry a sun-and-moon mark */
const SUNMOON='<svg class="sunmoon" viewBox="0 0 34 18" aria-label="'+T('亮暗两版','Light and dark')+'"><g stroke="#F6B312" stroke-width="1.6" stroke-linecap="round"><path d="M8 1.2v2M8 14.8v2M.8 9h2M13.2 9h2M2.9 3.9l1.4 1.4M11.7 12.7l1.4 1.4M2.9 14.1l1.4-1.4M11.7 5.3l1.4-1.4"/></g><circle cx="8" cy="9" r="3.6" fill="#F6B312"/><path d="M17 2.5v13" stroke="#9A9AA2" stroke-width="1.2" stroke-linecap="round"/><path d="M30.5 13.6A6.4 6.4 0 0 1 24.6 3a6.6 6.6 0 1 0 5.9 10.6z" fill="#4A3F8F"/></svg>';
const thModes=th=>th.fix?[th.fix]:["light","dark"];
function thPages(th,mode){return [].concat(...(mode?[mode]:thModes(th)).map(m=>[0,1,2].map(i=>({m,i}))))}
/* TH_V: bump when tools/thumbs.js remakes the pictures (the service worker keeps images until their address changes) */
const TH_V=2;
const thPage=(th,p)=>'background-image:url(img/th/'+th.id+'-'+p.m+'.webp?v='+TH_V+');background-position:'+["0%","50%","100%"][p.i]+' 0';
/* the stack: the first page on top, the rest stepped right and down behind it */
function thStack(th,big,mode){const ps=thPages(th,mode);
  return '<span class="thstk'+(big?' big':'')+'" style="--n:'+ps.length+'"'+(big?' role="button" tabindex="0" data-thv="'+th.id+'" aria-label="'+T('看看这个主题','Look at this theme')+'"':' aria-hidden="true"')+'>'
    +ps.map((p,k)=>'<i style="--k:'+k+';'+thPage(th,p)+'"></i>').reverse().join("")+'</span>'}
/* looking through a theme's pages: a panel no taller than half the screen, a stack you swipe or tap through */
function thView(id){const th=THEMES.find(t=>t.id===id);if(!th)return;const ps=thPages(th);let k=0;
  const m=document.createElement("div");m.className="thv";m.innerHTML='<div class="thv-p" role="dialog" aria-label="'+T(th.zh,th.en)+'"><div class="thv-s"></div><div class="thv-d">'+ps.map(()=>'<i></i>').join("")+'</div></div>';
  document.body.appendChild(m);requestAnimationFrame(()=>m.classList.add("on"));const box=m.querySelector(".thv-s");
  const paint=()=>{box.innerHTML=ps.map((p,j)=>{const d=(j-k+ps.length)%ps.length;return d>3?'':'<i style="--d:'+d+';'+thPage(th,p)+'"></i>'}).join("");
    m.querySelectorAll(".thv-d i").forEach((x,j)=>x.classList.toggle("on",j===k));const sm=ps[k].m;m.querySelector(".thv-p").dataset.m=sm};
  const go=dir=>{const top=box.querySelector('i[style*="--d:0"]');if(top){top.classList.add("fly");top.style.setProperty("--fx",dir)}SFX.tap();buzz(6);setTimeout(()=>{k=(k+(dir<0?1:-1)+ps.length)%ps.length;paint()},180)};
  let x0=null;box.addEventListener("pointerdown",e=>{x0=e.clientX;box.setPointerCapture(e.pointerId)});
  box.addEventListener("pointerup",e=>{if(x0==null)return;const dx=e.clientX-x0;x0=null;go(Math.abs(dx)>30?(dx<0?-1:1):-1)});
  const close=()=>{m.classList.remove("on");setTimeout(()=>m.remove(),300)};m.addEventListener("click",e=>{if(e.target===m)close()});paint()}
document.addEventListener("click",e=>{const b=e.target.closest&&e.target.closest("[data-thv]");if(b){e.stopPropagation();thView(b.dataset.thv)}},true);
/* the theme blind box: 100 G for a theme you don't have yet, picked at random, shown on a scratch card */
const BOX_G=100;
function boxLeft(){return THEMES.filter(t=>!themeOwned(t.id))}
/* the blind box is a closed envelope, always in colour; it shakes when it can't be opened (short of G, or nothing left) */
/* the closed envelope is the app icon itself (icon.svg) with the card tucked inside and the top flap shut; opening
   folds the flap back, then the card with its G coin rises out until it is exactly the icon */
const ENVELOPE='<svg class="env" viewBox="0 0 512 512" aria-hidden="true"><defs><linearGradient id="evfoil" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#FBE3A0"/><stop offset=".35" stop-color="#E8B04A"/><stop offset=".6" stop-color="#FFF0C2"/><stop offset="1" stop-color="#B9801F"/></linearGradient><linearGradient id="evnavy" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#2E6FC0"/><stop offset="1" stop-color="#123A6B"/></linearGradient><radialGradient id="evcoin" cx=".38" cy=".3" r=".8"><stop offset="0" stop-color="#FFF1BF"/><stop offset=".45" stop-color="#F0BF55"/><stop offset="1" stop-color="#B57A1A"/></radialGradient><linearGradient id="evrose" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#E25E72"/><stop offset="1" stop-color="#B8324B"/></linearGradient><clipPath id="evtile"><rect width="512" height="512" rx="92"/></clipPath><linearGradient id="evbg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#4B93DE"/><stop offset=".55" stop-color="#2D76C6"/><stop offset="1" stop-color="#1A4E92"/></linearGradient><radialGradient id="evbgl" cx=".28" cy=".08" r=".75"><stop offset="0" stop-color="#fff" stop-opacity=".38"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient><filter id="evgrain" x="0" y="0" width="1" height="1"><feTurbulence type="fractalNoise" baseFrequency=".85" numOctaves="2" seed="7"/><feColorMatrix values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 .55 -.18"/><feComposite in2="SourceGraphic" operator="in"/></filter><linearGradient id="evcard" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFFBF2"/><stop offset="1" stop-color="#EFE2C8"/></linearGradient><linearGradient id="evgold" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#E9B44C"/><stop offset=".5" stop-color="#F7D78A"/><stop offset="1" stop-color="#D99A2B"/></linearGradient><linearGradient id="evgG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3C8BDE"/><stop offset="1" stop-color="#1D5BA8"/></linearGradient><linearGradient id="evleft" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#EC7B88"/><stop offset=".55" stop-color="#D9576A"/><stop offset="1" stop-color="#C2435A"/></linearGradient><linearGradient id="evright" x1="1" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#C33B52"/><stop offset="1" stop-color="#9E2841"/></linearGradient><linearGradient id="evback" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7E1C31"/><stop offset="1" stop-color="#A42C44"/></linearGradient><linearGradient id="evshade" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#5A1020" stop-opacity=".45"/><stop offset="1" stop-color="#5A1020" stop-opacity="0"/></linearGradient><filter id="evsoft" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="7"/></filter><filter id="evsoft2" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="3"/></filter><radialGradient id="evvig" cx=".5" cy=".45" r=".75"><stop offset=".6" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".22"/></radialGradient><linearGradient id="evflapg" x1="0" y1="0" x2=".3" y2="1"><stop offset="0" stop-color="#E46A7C"/><stop offset=".6" stop-color="#CF4D62"/><stop offset="1" stop-color="#B83850"/></linearGradient></defs><rect x="14" y="30" width="484" height="476" rx="88" fill="#000" opacity=".28" filter="url(#evsoft)"/><linearGradient id="evedge" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1A3F78"/><stop offset=".3" stop-color="#7A1A2E"/><stop offset="1" stop-color="#4E0E1C"/></linearGradient><rect x="10" y="22" width="492" height="482" rx="90" fill="url(#evedge)"/><rect x="10" y="22" width="492" height="482" rx="90" fill="none" stroke="#fff" stroke-opacity=".12" stroke-width="2"/><g transform="translate(10 0) scale(.9609375 .9375)"><g clip-path="url(#evtile)"><rect width="512" height="512" fill="url(#evbg)"/><rect width="512" height="512" fill="#fff" filter="url(#evgrain)" opacity=".5"/><rect width="512" height="512" fill="url(#evbgl)"/><g><path d="M0 120 L512 120 L512 512 L0 512 Z" fill="url(#evback)"/><g class="evflapb"><path d="M0 110 L512 110 L512 198 L334 362 Q318 376 302 364 Z" fill="#6E1628"/><path d="M0 110 L512 110 L512 198 L334 362 Q318 376 302 364 Z" fill="url(#evshade)"/></g><g class="evcard"><rect x="40" y="30" width="432" height="420" rx="24" fill="#3A0A16" opacity=".45" filter="url(#evsoft)" transform="translate(0 10)"/><rect x="40" y="22" width="432" height="420" rx="24" fill="url(#evcard)"/><rect x="40" y="22" width="432" height="420" rx="24" fill="none" stroke="#fff" stroke-opacity=".8" stroke-width="2"/><g transform="translate(256 196) scale(1.62)"><circle r="96" fill="#000" opacity=".25" filter="url(#evsoft2)" transform="translate(0 6)"/><circle r="96" fill="url(#evcoin)"/><circle r="80" fill="none" stroke="#9A6510" stroke-opacity=".45" stroke-width="3"/><circle r="96" fill="none" stroke="#FFF3CC" stroke-opacity=".7" stroke-width="2"/><g transform="scale(.82)"><path d="M58 -40 A72 72 0 1 0 70 22 L70 8 L18 8" fill="none" stroke="#9A6510" stroke-width="28" stroke-linecap="round" stroke-linejoin="round" transform="translate(2 3)" opacity=".6"/><path d="M58 -40 A72 72 0 1 0 70 22 L70 8 L18 8" fill="none" stroke="#FFE7A6" stroke-width="28" stroke-linecap="round" stroke-linejoin="round"/></g></g></g><path d="M512 190 L270 410 L512 512 Z" fill="#3A0A16" opacity=".35" filter="url(#evsoft)" transform="translate(-8 -12)"/><path d="M512 190 L270 410 L512 512 Z" fill="url(#evright)"/><path d="M512 190 L270 410" stroke="#fff" stroke-opacity=".22" stroke-width="3"/><path d="M0 114 L512 498 L512 512 L0 512 Z" fill="#3A0A16" opacity=".4" filter="url(#evsoft)" transform="translate(8 -14)"/><path d="M0 114 L512 498 L512 512 L0 512 Z" fill="url(#evleft)"/><path d="M0 114 L512 498" stroke="#FFD0D6" stroke-opacity=".7" stroke-width="3"/><g transform="translate(92 416) scale(1.45)"><path d="M0 30 C-34 8 -40 -14 -27 -26 C-16 -36 -3 -30 0 -20 C3 -30 16 -36 27 -26 C40 -14 34 8 0 30 Z" fill="#9E2841" opacity=".85"/><path d="M0 30 C-34 8 -40 -14 -27 -26 C-16 -36 -3 -30 0 -20 C3 -30 16 -36 27 -26 C40 -14 34 8 0 30 Z" fill="none" stroke="#6E1426" stroke-opacity=".55" stroke-width="3" transform="translate(-1 -2)"/><path d="M-2 31 C-34 10 -40 -12 -28 -24" fill="none" stroke="#FFB3BD" stroke-opacity=".55" stroke-width="2.4" transform="translate(1 3)"/></g></g><g class="evflap"><path d="M0 110 L512 110 L512 198 L334 362 Q318 376 302 364 Z" fill="#3A0A16" opacity=".45" filter="url(#evsoft)" transform="translate(-6 12)"/><path d="M0 110 L512 110 L512 198 L334 362 Q318 376 302 364 Z" fill="url(#evflapg)"/><path d="M4 114 L302 364 Q318 376 334 362 L508 200" fill="none" stroke="#FFD0D6" stroke-opacity=".6" stroke-width="3"/></g><rect width="512" height="512" fill="url(#evvig)"/><rect x="1" y="1" width="510" height="510" rx="91" fill="none" stroke="#fff" stroke-opacity=".28" stroke-width="2"/></g></g></svg>';
function boxBtnHtml(){const n=boxLeft().length;return '<button class="boxbtn'+(n&&coinTotal()>=BOX_G?' can':'')+'" type="button" data-act="box" aria-label="'+T('主题盲盒','Theme blind box')+'">'+ENVELOPE+(n?'<i class="boxn n">'+n+'</i>':'')+'</button>'}
function openBox(btn){btn=btn||$(".boxbtn");const left=boxLeft();
  if(!left.length||coinTotal()<BOX_G){if(btn){btn.classList.remove("no");void btn.offsetWidth;btn.classList.add("no")}buzz([25,40,25]);return}
  if(btn&&btn.classList.contains("open"))return;
  /* the flap lifts, the app icon comes out, and the scratch card opens */
  SFX.tap();buzz(15);if(btn)btn.classList.add("open");setTimeout(boxReveal,btn&&!matchMedia("(prefers-reduced-motion: reduce)").matches?1350:0)}
function boxReveal(){const now=boxLeft();if(!now.length||coinTotal()<BOX_G)return;
  /* nothing is spent until the card is scratched past half: close it before that and the box stays shut */
  const th=now[Math.random()*now.length|0];
  setTimeout(()=>{const eb=$(".boxbtn");if(eb)eb.classList.remove("open")},400);
  const S=p1Sheet("",'<div class="scrhost"></div>','<button class="btn ghost wide" type="button" data-boxok hidden>'+T('收下','Keep it')+'</button><button class="btn wide" type="button" data-boxuse hidden>'+T('使用','Use')+'</button>');
  /* the scratch card is Ovio's, in the world that suits the skin */
  /* the card wears the skin you are in: its colours and grain (Ovio's scratch card underneath) */
  const world="skin";
  S.q(".sheet").setAttribute("aria-label",T("主题盲盒","Theme blind box"));
  const host=S.q(".scrhost"),act=S.q("[data-boxok]").parentNode;
  act.querySelector("[data-boxok]").addEventListener("click",()=>{const pn=$("#sheet .panel"),y=pn?pn.scrollTop:0;S.close();coinSheet(false);if(pn)pn.scrollTop=y});
  act.querySelector("[data-boxuse]").addEventListener("click",()=>{const pn=$("#sheet .panel"),y=pn?pn.scrollTop:0;SFX.tap();S.close();themeFade(()=>{state.settings.theme=th.id;lsSave();applyMode();coinSheet(false);if(pn)pn.scrollTop=y});setTimeout(()=>celebrate(1,0),300)});
  let snd=0;SCR.mount(host,{world,label:T("主题盲盒","Theme blind box"),hint:T("刮开","Scratch to reveal"),coin:T("用硬币刮","scratch with a coin"),there:T("就是它 ✿","there it is ✿"),
    content:thStack(th,1)+'<b>'+T(th.zh,th.en)+(th.fix?'':SUNMOON)+'</b>',
    onProgress(){const t=performance.now();if(t-snd>70){snd=t;if(typeof fxHit==="function")fxHit(0,.06,2600,.5,.025,"highpass");buzz(3)}},
    onReveal(){if(themeOwned(th.id)||coinTotal()<BOX_G){S.close();return}
      state.settings.buys=(state.settings.buys||[]).concat([{id:th.id,g:BOX_G,d:today(),box:1}]);lsSave();celebrate(8,1);buzz([20,40,30]);act.querySelectorAll("[hidden]").forEach(x=>x.hidden=false)}})}
/* a new skin fades in over the old one, so the eye has a moment (the browser's view transition; a plain swap where
   there is none, or when motion is turned down) */
function themeFade(fn){if(!document.startViewTransition||matchMedia("(prefers-reduced-motion: reduce)").matches){fn();return}try{document.startViewTransition(fn)}catch(e){fn()}}
/* a balance past what fits on screen shows as ∞, until it is spent back down to 999,999 */
const gShow=n=>n>999999?"∞":fmt(n);
/* hold the big G coin for a six-digit code; only its SHA-256 fingerprint lives here */
const G_CODE="c7b82c9175b5a8710a4e34474035a9a40b0b584e264eec68ef6df9237f0c87cd";
/* a second code locks everything bought again (themes, plans), for testing the blind box; G spent on them comes back */
const G_LOCK="d63f63f2418c6201d722fdd5f56eea4aa726231fe7bcc2341e92c1007106164c";
async function gCodeHash(v){try{const d=await crypto.subtle.digest("SHA-256",new TextEncoder().encode("bG:"+v));return [...new Uint8Array(d)].map(x=>x.toString(16).padStart(2,"0")).join("")}catch(e){return ""}}
async function gCodeOk(v){return await gCodeHash(v)===G_CODE}
function openCheat(){const S=p1Sheet("G",'<input id="gcode" class="gcode" type="tel" inputmode="numeric" maxlength="6" autocomplete="off" placeholder="••••••">','<span></span>');const inp=S.q("#gcode");setTimeout(()=>inp.focus(),80);
  inp.addEventListener("input",async()=>{inp.value=inp.value.replace(/\D/g,"").slice(0,6);if(inp.value.length<6)return;
    const h=await gCodeHash(inp.value);
    if(h===G_LOCK){const keep=b=>String(b.id).startsWith("code:")||(+b.g<0);state.settings.buys=(state.settings.buys||[]).filter(keep);lsSave();S.close();
      themeFade(()=>{applyMode();coinSheet(false)});SFX.tap();buzz([20,40,20]);toast(T("已全部锁上","All locked"));return}
    if(h===G_CODE){state.settings.buys=(state.settings.buys||[]).concat([{id:"code:"+Date.now(),g:-50000,d:today()}]);lsSave();S.close();toast("+50,000 G");celebrate(10,1);SFX.done();coinSheet(false)}
    else{inp.classList.remove("no");void inp.offsetWidth;inp.classList.add("no");buzz([30,40,30]);setTimeout(()=>{inp.value=""},350)}})}
function coinSheet(shopFirst){const bs=coinBadges(),tot=coinTotal();
  const nextOf=b=>{if(b.tiers){const n=b.tiers.find(t=>t>b.have);return n==null?null:n}const n=(Math.floor(b.have/b.step+1e-9)+1)*b.step;return +n.toFixed(2)};
  const rows=bs.map(b=>{const n=nextOf(b),prev=b.tiers?([0].concat(b.tiers).filter(t=>t<=b.have).pop()):Math.floor(b.have/b.step+1e-9)*b.step,pct=n==null?1:Math.max(0,Math.min(1,(b.have-prev)/(n-prev)));
    return '<div class="badge'+(b.pts?" got":"")+'"><span class="bi"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">'+BADGE_IC[b.ic]+'</svg></span>'
      +'<div class="sp"><div class="row"><b class="sp">'+b.name+'</b><span class="n bp">'+(b.pts?'+'+fmt(b.pts):'0')+'</span></div><p class="muted">'+b.what+'</p>'
      +'<div class="bar" style="--c:'+(b.pts?'var(--ac)':'var(--muted)')+';height:6px;margin-top:6px"><i style="width:'+(pct*100)+'%"></i></div>'
      +'<p class="muted n" style="font-size:11px;margin-top:3px">'+(n==null?T('全部拿到','All earned'):T('现在 ','Now ')+b.have+' '+b.unit+T(' · 下一档 ',' · next at ')+n+' '+b.unit)+'</p></div></div>'}).join("");
  const plans='<div class="shopc"><div class="shopart" style="background:linear-gradient(135deg,#22C55E,#0EA5E9)"></div><div class="sp"><b>'+T('大家写的训练计划','Plans by other users')+'</b><p class="muted">'+T('用户写的训练计划，审核后上架','Training plans written by users, reviewed before they go up')+'</p></div><span class="pill">'+T('即将上线','Coming soon')+'</span></div>';
  openSheet('<div class="sh-h"><h3>G</h3><button class="mini" data-act="close">'+ICON.x+'</button></div>'
    +'<div class="row" style="margin-bottom:16px;align-items:center"><span class="coinbig">'+COIN+'</span><div class="sp"><div class="big">'+gShow(tot)+'</div></div>'
    +boxBtnHtml()+'</div>'
    +'<p class="eyebrow" id="shop" style="margin-bottom:8px">'+T('主题','Themes')+'</p><div class="setlist">'+THEMES.filter(th=>themeOwned(th.id)).map(th=>{const own=themeOwned(th.id),on=(themeOwned(state.settings.theme)?state.settings.theme:"aurora")===th.id;
      const look=th.fix||document.documentElement.dataset.mode||"light";
      return '<button class="thc'+(on?' on':'')+'" data-act="theme" data-id="'+th.id+'" aria-pressed="'+on+'">'+thStack(th,0,look)+'<b class="sp">'+T(th.zh,th.en)+'</b>'+(th.fix?'':SUNMOON)
        +(on?'<span class="thok on" aria-label="'+T('使用中','In use')+'">'+ICON.check+'</span>':own?'<span class="thok" aria-hidden="true"></span>':'<span class="pill'+(tot>=th.price?' ac':'')+'">'+COIN+' '+th.price+'</span>')+'</button>'}).join("")+'</div><div style="height:18px"></div>'
    +'<p class="eyebrow" style="margin-bottom:8px">'+T('训练计划','Training plans')+'</p><div class="setlist" style="margin-bottom:18px">'+plans+'</div>'
    +'<p class="eyebrow" style="margin-bottom:8px">'+T('怎么拿','How to earn')+'</p><div class="setlist">'+rows+'</div>');
  holdOpen($("#sheet .coinbig"),openCheat);
  if(shopFirst)setTimeout(()=>{const el=document.getElementById("shop");if(el)el.scrollIntoView({block:"start"})},50)}
/* ---------- sheet ---------- */
function openSheet(html){$("#sheetBody").innerHTML=html;$("#sheet").classList.add("on");document.body.style.overflow="hidden";CUR_SHEET=null}
/* closing goes back up a level when the panel came from a menu; hard=true just closes (opening a separate panel) */
function closeSheet(hard){if(!hard&&SHEET_UP&&$("#sheet").classList.contains("on")){const f=SHEET_UP;SHEET_UP=null;f();return}SHEET_UP=null;$("#sheet").classList.remove("on");if(!run)document.body.style.overflow=""}
$("#sheet").addEventListener("click",e=>{if(e.target.id==="sheet")closeSheet()});
(function(){const pnl=$("#sheet .panel");let y0=null,dy=0;
  /* a drag that starts inside a list that scrolls on its own (the playlist grid) only scrolls it and never pulls the
     panel down; on the panel itself the pull starts only once it is scrolled to the top */
  const inner=t=>{for(let n=t;n&&n!==pnl;n=n.parentElement){if(n.scrollHeight>n.clientHeight+2&&/(auto|scroll)/.test(getComputedStyle(n).overflowY))return true}return false};
  pnl.addEventListener("touchstart",e=>{y0=null;dy=0;if(inner(e.target))return;y0=pnl.scrollTop>0?-1:e.touches[0].clientY},{passive:true});
  pnl.addEventListener("touchmove",e=>{if(y0==null)return;const y=e.touches[0].clientY;if(pnl.scrollTop>0||y0<0){y0=pnl.scrollTop>0?-1:y;return}
    dy=Math.max(0,y-y0);pnl.style.transition="none";pnl.style.transform="translateY("+dy+"px)"},{passive:true});
  pnl.addEventListener("touchend",()=>{if(y0==null)return;if(y0<0){y0=null;return}pnl.style.transition="";pnl.style.transform="";if(dy>90)closeSheet();y0=null})})();
/* going back: a settings panel closes to the menu it was opened from (SHEET_UP for sheets in the main panel,
   P1_BACK for the separate panels from js/p1settings.js); CUR_SHEET is the menu showing now */
let SHEET_UP=null,CUR_SHEET=null,P1_BACK=null;
/* the services' own app icons, as images so no skin can recolour them */
const BRAND={sp:'<img class="brand" alt="Spotify" src="data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2024%2024%22%3E%3Ccircle%20cx%3D%2212%22%20cy%3D%2212%22%20r%3D%2212%22%20fill%3D%22%231ED760%22%2F%3E%3Cpath%20d%3D%22M6.2%209.2c4-1.2%208.3-.9%2011.6%201.1M6.9%2012.4c3.3-.9%206.9-.6%209.6%201M7.6%2015.4c2.6-.6%205.2-.4%207.4.8%22%20fill%3D%22none%22%20stroke%3D%22%23000%22%20stroke-width%3D%221.8%22%20stroke-linecap%3D%22round%22%2F%3E%3C%2Fsvg%3E">',co:'<img class="brand" alt="COROS" src="data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2024%2024%22%3E%3Crect%20width%3D%2224%22%20height%3D%2224%22%20rx%3D%225.5%22%20fill%3D%22%23000%22%2F%3E%3Cpath%20d%3D%22M12%204.6%2018.4%208.3v7.4L12%2019.4%205.6%2015.7V8.3z%22%20fill%3D%22none%22%20stroke%3D%22%23F0202E%22%20stroke-width%3D%222.3%22%20stroke-linejoin%3D%22round%22%2F%3E%3Cpath%20d%3D%22M12%208.6%2015%2010.3v3.4L12%2015.4%209%2013.7v-3.4z%22%20fill%3D%22none%22%20stroke%3D%22%23F0202E%22%20stroke-width%3D%221.6%22%20stroke-linejoin%3D%22round%22%2F%3E%3C%2Fsvg%3E">'};
/* Advanced: everything that talks to an outside service by a link or a key */
function advSheet(){const row=(to,ic,t)=>'<button class="opt" data-act="go" data-to="'+to+'">'+ic+'<span class="sp">'+t+'</span>'+ICON.right+'</button>';
  openSheet('<div class="sh-h"><h3>'+T('进阶','Advanced')+'</h3><button class="mini" data-act="close">'+ICON.x+'</button></div><div class="setlist">'
    +row("p1:table",ICON.table,T("饮食表格","Food table"))+row("p1:aifmt",ICON.spark,T("记账 AI 的格式","Format for your food-logging AI"))+row("p1:music",BRAND.sp,"Spotify")+'</div>');CUR_SHEET=advSheet}
/* Effects: ray-traced light (a knob), weather, dust after days off, celebrations */
function fxSheet(){const sw=(act,on,ic,t)=>'<button class="opt" data-act="'+act+'" role="switch" aria-checked="'+on+'">'+ic+'<span class="sp">'+t+'</span><span class="sw" aria-hidden="true"></span></button>';
  openSheet('<div class="sh-h"><h3>'+T('特效','Effects')+'</h3><button class="mini" data-act="close">'+ICON.x+'</button></div>'
    +'<div class="setlist">'+sw("rt",rtLevel()>0,ICON.spark,T('光追','Ray-traced light'))
    +'<button class="opt" data-act="go" data-to="p1:weather">'+ICON.rain+'<span class="sp">'+T('天气','Weather')+'</span>'+ICON.right+'</button>'
    +sw("dust",dustOn(),ICON.dust,T('两天没练就落灰','Dust after two days off'))
    +sw("fx",fxOn(),ICON.spark,T('庆祝效果','Celebrations'))+sw("groove",grooveOn(),ICON.music,T('音乐律动（需 Spotify）','Move with the music (needs Spotify)'))+'</div>');CUR_SHEET=fxSheet}
function meSheet(){SHEET_UP=null;let m="auto";try{m=localStorage.getItem(PK+"mode")||"auto"}catch(e){}
  const row=(to,ic,t)=>'<button class="opt" data-act="go" data-to="'+to+'">'+ic+'<span class="sp">'+t+'</span>'+ICON.right+'</button>';
  openSheet('<div class="sh-h"><h3>'+T('设定','Settings')+'</h3><button class="mini" data-act="close">'+ICON.x+'</button></div><p class="eyebrow" style="margin-bottom:8px">'+T('外观','Appearance')+'</p>'
    +'<div class="setlist">'+("fixed" in document.documentElement.dataset?[]:[["auto",T("跟随手机","Match the phone")],["light",T("亮","Light")],["dark",T("暗","Dark")]]).map(([k,l])=>'<button class="opt" data-act="mode" data-m="'+k+'" aria-pressed="'+(m===k)+'">'+l+'</button>').join("")
    +'<button class="opt" data-act="fxmenu">'+ICON.spark+'<span class="sp">'+T('特效','Effects')+'</span>'+ICON.right+'</button>'
    +'<button class="opt" data-act="shop">'+ICON.palette+'<span class="sp">'+T('G 分商店','barGain store')+'</span><b class="n" style="font-size:14px">'+gShow(coinTotal())+' G</b>'+ICON.right+'</button></div>'
    +'<p class="eyebrow" style="margin:18px 0 8px">'+T('语言','Language')+'</p><div class="seg langseg" translate="no">'+[["zh","简中"],["zht","繁中"],["en","Eng"]].map(([k,l])=>'<button data-act="lang" data-l="'+k+'" aria-pressed="'+((HANT?"zht":LANG)===k)+'">'+l+'</button>').join("")+'</div>'
    +'<p class="eyebrow" style="margin:18px 0 8px">'+T('更多','More')+'</p><div class="setlist">'
    +row("p1:plan",ICON.spark,T("训练计划","Training plan"))+row("p1:profile",ICON.user,T("个人资料","Profile"))+row("p1:goals",ICON.target,T("目标","Goals"))+row("p1:backup",ICON.cloud,T("备份进度与高驰","Backup & COROS"))+row("p1:charts",BRAND.co,T("图表、同步和手表热量","Charts, sync & watch calories"))+'<button class="opt" data-act="advmenu">'+ICON.sliders+'<span class="sp">'+T("进阶","Advanced")+'</span>'+ICON.right+'</button>'+'</div>'
    +'<p class="muted" style="font-size:11px;text-align:center;margin-top:18px">'+T('博G ','bG ')+($("#ver")?$("#ver").textContent:"")+'</p>');CUR_SHEET=meSheet}

/* ---------- header, dock, routing ---------- */
/* the page title shrinks to fit beside the header buttons (wide theme fonts, long English words) */
function fitTitle(){const h=$(".top h1"),tr=$(".top .tr");if(!h||!tr)return;h.style.fontSize="";
  const room=()=>tr.getBoundingClientRect().left-h.getBoundingClientRect().left-14;let fs=parseFloat(getComputedStyle(h).fontSize),n=0;
  while(h.scrollWidth>room()&&fs>16&&n++<20){fs-=1;h.style.fontSize=fs+"px"}}
function paintHeader(v){const d=new Date();$("#today").textContent=LANG==="en"?["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"][d.getDay()]+", "+MON_EN[d.getMonth()]+" "+d.getDate():(d.getMonth()+1)+"月"+d.getDate()+"日 周"+WD[d.getDay()];
  $("#title").textContent=(LANG==="en"?{train:"Train",diet:"Diet",prog:"Progress"}:{train:"训练",diet:"饮食",prog:"进展"})[v];fitTitle();
  let ls="";try{ls=localStorage.getItem("tracktor-lastsync")||""}catch(e){}$("#syncDot").classList.toggle("ok",ls.startsWith(today()))}
function placePc(anim){const b=document.querySelector('.dock [aria-selected="true"]'),pc=document.querySelector(".dock .pc");if(!b)return;
  if(!anim)pc.style.transition="none";pc.style.width=b.offsetWidth+"px";pc.style.transform="translateX("+(b.offsetLeft-6)+"px)";pc.style.left="6px";if(!anim){void pc.offsetWidth;pc.style.transition=""}}
let cur="train";
/* with the calendar folded on the training page there is room: the mini player grows into a big card */
function miniSize(){document.body.classList.toggle("mini-big",cur==="train"&&!monthOpen)}
function show(v,anim,keep){cur=v;dustApply();miniSize();document.querySelectorAll(".view").forEach(x=>x.classList.toggle("on",x.id==="v-"+v));
  document.querySelectorAll(".dock button").forEach(b=>b.setAttribute("aria-selected",b.dataset.v===v));
  ({train:renderTrainView,diet:renderDietView,prog:renderProgView})[v]();if(v==="diet"&&!keep)dietPull(false);paintHeader(v);requestAnimationFrame(()=>placePc(anim));
  try{localStorage.setItem(PK+"tab",v)}catch(e){}if(!keep)scrollTo({top:0})}
document.querySelector(".dock").addEventListener("click",e=>{const b=e.target.closest("[data-v]");if(b&&b.getAttribute("aria-selected")!=="true"){SFX.tap();show(b.dataset.v,true)}});
addEventListener("resize",()=>placePc(false));
$("#meBtn").addEventListener("click",meSheet);
/* COROS (js/coros.js): the header dot syncs; it turns while syncing and is green once synced today. On open, a
   connected watch syncs quietly when the last sync is over two hours old. */
let p1Syncing=false;
function p1SyncUI(){const d=$("#syncDot");if(!d)return;const on=typeof syncing!=="undefined"&&syncing;d.classList.toggle("spin",on||p1Syncing);
  let ls="";try{ls=localStorage.getItem("tracktor-lastsync")||""}catch(e){}d.classList.toggle("ok",ls.startsWith(today()))}
async function p1Sync(quiet){if(typeof syncing!=="undefined"&&syncing)return;if(!mcp){if(!quiet)promptCorosToken();return}
  window.P1Quiet=!!quiet;p1Syncing=true;p1SyncUI();try{await doSync()}finally{p1Syncing=false;window.P1Quiet=false;p1SyncUI();renderAll()}}
window.p1Sync=p1Sync;
/* sync: a tap syncs. In the toy skin the button is the recessed capsule with a plastic puck (after the Ovio toy kit):
   drag the puck to the far end and let go to sync, it springs back; a tap runs the puck across and syncs too */
(function(){const b=$("#syncBtn"),pk=b.querySelector(".puck"),toy=()=>document.documentElement.dataset.theme==="toy";let x0=null,dx=0,moved=false,dragAt=0;
  const max=()=>Math.max(30,b.clientWidth-pk.offsetWidth-10);
  b.addEventListener("pointerdown",e=>{if(!toy())return;x0=e.clientX;dx=0;moved=false;pk.style.transition="none";try{b.setPointerCapture(e.pointerId)}catch(err){}});
  b.addEventListener("pointermove",e=>{if(x0==null)return;dx=e.clientX-x0;if(Math.abs(dx)>4)moved=true;const x=Math.max(0,Math.min(max(),dx));pk.style.transform="translateX("+x+"px)";b.classList.toggle("ready",x>=max()*.8)});
  const up=()=>{if(x0==null)return;const ok=Math.max(0,dx)>=max()*.8;x0=null;pk.style.transition="";pk.style.transform="";b.classList.remove("ready");
    if(moved){dragAt=Date.now();if(ok){buzz(15);SFX.tap();p1Sync(false)}}};
  b.addEventListener("pointerup",up);b.addEventListener("pointercancel",up);
  b.addEventListener("click",()=>{if(Date.now()-dragAt<450)return;
    if(toy()){pk.style.transform="translateX("+max()+"px)";setTimeout(()=>{pk.style.transform=""},380)}p1Sync(false)})})();

document.addEventListener("click",e=>{const b=e.target.closest("[data-act]");if(!b)return;const a=b.dataset.act;
  if(a==="month"){monthOpen=!monthOpen;monthOff=0;weekOff=0;fsRender("cal");miniSize()}
  /* Today: back to this week or month; already there, it opens today */
  else if(a==="caltoday"){monthOff=0;weekOff=0;fsReset("cal")}
  else if(a==="dietnow"){dietGrp=0;fsReset("diet")}
  else if(a==="calsel"){calSel=calSel===b.dataset.d?null:b.dataset.d;SFX.tap();fsRender("cal")}
  else if(a==="start")startRun(b.dataset.sid);
  else if(a==="fsnext"){const o=FS[b.dataset.fs];if(o)fsGo(b.dataset.fs,o.peekDir||1)}
  else if(a==="hopen"){const c=b;heroOpen=!heroOpen;c.classList.toggle("open",heroOpen);SFX.tap()}
  else if(a==="theory"){const t=document.querySelector("#sheet .theory");if(t){t.hidden=!t.hidden;b.setAttribute("aria-expanded",!t.hidden)}}
  else if(a==="why")planSheet();
  else if(a==="dshare")shareDay(b.dataset.d);
  else if(a==="freekeep"){const f=freePattern();if(f&&window.p1Custom)p1Custom(f.groups.length,false,f.groups)}
  else if(a==="freeoff"){const f=freePattern();if(f){state.settings.freeHintOff=f.id;lsSave();renderTrainView()}}
  else if(a==="box")openBox(b);
  else if(a==="theme"){const th=THEMES.find(x=>x.id===b.dataset.id);if(!th)return;
    if(!themeOwned(th.id)){const bal=coinTotal();if(bal<th.price){toast(T('还差 '+(th.price-bal)+' G','You need '+(th.price-bal)+' more G'));return}
      if(!confirm(T('用 '+th.price+' G 换购「'+th.zh+'」？','Spend '+th.price+' G on '+th.en+'?')))return;
      state.settings.buys=(state.settings.buys||[]).concat([{id:th.id,g:th.price,d:today()}]);celebrate(6,1)}
    /* redraw the list where it was: the panel keeps its scroll, so the row under your finger stays put */
    const pn=$("#sheet .panel"),y=pn?pn.scrollTop:0;SFX.tap();themeFade(()=>{state.settings.theme=th.id;lsSave();applyMode();coinSheet(false);if(pn)pn.scrollTop=y});setTimeout(()=>celebrate(1,0),300)}
  else if(a==="thide"){e.stopPropagation();const c=tileCfg();if(!c.hidden.includes(b.dataset.k))c.hidden.push(b.dataset.k);tileSave(c);SFX.tap();renderProgView()}
  else if(a==="tadd")tileAddSheet();
  else if(a==="tshow"){const c=tileCfg();c.hidden=c.hidden.filter(k=>k!==b.dataset.k);tileSave(c);closeSheet();renderProgView()}
  else if(a==="tdone"){tileEdit=false;SFX.tap();renderProgView()}
  else if(a==="close")closeSheet();
  else if(a==="advmenu"){const up=CUR_SHEET;advSheet();SHEET_UP=up}
  else if(a==="day")daySheet(b.dataset.d);
  else if(a==="metric"){if(tileEdit)return;chartRange=30;metricSheet(b.dataset.k)}
  else if(a==="range"){chartRange=+b.dataset.r;metricSheet.redraw()}
  else if(a==="goal")bridge("goals");
  else if(a==="coins")coinSheet(false);
  else if(a==="shop"){const up=b.closest("#sheet")?CUR_SHEET:null;coinSheet(true);SHEET_UP=up}
  else if(a==="go"){if(b.closest("#sheet")&&CUR_SHEET){const cur=CUR_SHEET,up=SHEET_UP;P1_BACK=()=>{cur();SHEET_UP=up}}bridge(b.dataset.to)}
  else if(a==="lang")setLang(b.dataset.l);
  else if(a==="fxmenu"){const up=CUR_SHEET;fxSheet();SHEET_UP=up}
  else if(a==="rt"){const on=rtLevel()===0;try{localStorage.setItem(PK+"rt",on?"1":"0")}catch(err){}b.setAttribute("aria-checked",on);rtApply();buzz(8)}
  else if(a==="groove"){const on=!grooveOn();try{localStorage.setItem(PK+"groove",on?"1":"0")}catch(err){}b.setAttribute("aria-checked",on);buzz(8);if(typeof spGroove==="function")spGroove()}
  else if(a==="dust"){const on=!dustOn();try{localStorage.setItem(PK+"dust",on?"1":"0")}catch(err){}b.setAttribute("aria-checked",on);dustApply()}
  else if(a==="fx"){const on=!fxOn();try{localStorage.setItem("tracktor-p1-fx",on?"1":"0")}catch(err){}b.setAttribute("aria-checked",on);if(on){SFX.tap();celebrate(2,0)}}
  else if(a==="mode"){try{localStorage.setItem(PK+"mode",b.dataset.m)}catch(err){}applyMode();meSheet()}
  else if(run){
    if(a==="fclose"){if(!run.finished&&run.sets.some(x=>x.some(y=>y.d)))toast(T("打过的勾都已保存，下次接着练","Your ticks are saved; carry on next time"));closeRun()}
    else if(a==="untick")untick(+b.dataset.i);
    else if(a==="feel"){const id=run.p.ex[run.askFeel].id;if(b.dataset.f){run.doc.feel=run.doc.feel||{};run.doc.feel[id]=b.dataset.f;lsSave()}
      run.askFeel=null;SFX.tap();const nx=run.sets.findIndex(x=>x.some(y=>!y.d));if(nx>=0)run.ex=nx;renderFocus(true)}
    else if(a==="tick")tickSet();
    else if(a==="addset"){const arr=run.sets[run.ex],l=arr[arr.length-1];arr.push({v:l?l.v:run.p.ex[run.ex].target,d:false});run.doc.edited=true;lsSave();run.askFeel=null;SFX.tap();buzz(8);renderFocus(true)}
    else if(a==="inc"||a==="dec"){const ci=curSet();if(ci<0)return;run.doc.edited=true;const s=run.sets[run.ex][ci],st=run.p.ex[run.ex].unit==="秒"?5:1;s.v=Math.max(0,(+s.v||0)+(a==="inc"?st:-st));
      /* only this set: the planned numbers for the rest stay put; the engine adjusts after sessions, never mid-session */lsSave();SFX.tap();const el=$("#fVal");el.textContent=s.v;el.classList.remove("pop");void el.offsetWidth;el.classList.add("pop");}
    else if(a==="fshare"){SFX.tap();finShare()}
    else if(a==="fnext"){const n=run.sets.findIndex(x=>x.some(y=>!y.d));if(n>=0){run.ex=n;renderFocus(true)}}
  }});

if("serviceWorker" in navigator)addEventListener("load",()=>navigator.serviceWorker.register("./sw.js").catch(()=>{}));
engPlanAll();
handleCorosCallback();
connectMcp().then(()=>{p1SyncUI();let ls="";try{ls=localStorage.getItem("tracktor-lastsync")||""}catch(e){}
  const t=ls?new Date(ls.replace(" ","T")).getTime():0;if(mcpReady&&(!t||Date.now()-t>2*36e5))p1Sync(true)}).catch(()=>{});
/* words fixed outside the views: the dock, the header buttons, the page language */
function paintLang(){document.documentElement.lang=LANG==="en"?"en":HANT?"zh-Hant":"zh-CN";
  WD.splice(0,7,...(LANG==="en"?WD_EN:WD_ZH));
  document.querySelectorAll(".dock [data-v]").forEach(b=>{const l={diet:T("饮食","Diet"),train:T("训练","Train"),prog:T("进展","Progress")}[b.dataset.v];b.querySelector("span").textContent=l;b.setAttribute("aria-label",l)});
  $("#meBtn").setAttribute("aria-label",T("设定","Settings"));$("#syncBtn").setAttribute("aria-label",T("同步","Sync"))}
paintLang();
/* switching language keeps you where you are: the page and the open settings sheet redraw in the new language */
function setLang(l){try{localStorage.setItem("tracktor-lang",l)}catch(e){}
  LANG=l==="en"?"en":"zh";HANT=l==="zht";if(HANT)hantOn();
  paintLang();renderAll();paintHeader(cur);meSheet();SFX.tap()}
let start="train";try{start=localStorage.getItem(PK+"tab")||"train"}catch(e){}
if(!["train","diet","prog"].includes(start))start="train";
show(start,false);

/* every save may have been a tick: re-check the dust */
{const save0=lsSave;lsSave=function(){const r=save0.apply(this,arguments);try{dustApply()}catch(e){}return r}}

if(document.fonts)document.fonts.ready.then(fitTitle);addEventListener("resize",fitTitle);
