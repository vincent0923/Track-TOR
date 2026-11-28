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
  {id:"ember",gloss:1,zh:"暖砂 · 流金",en:"Sand · Amber",price:60,sw:["#F4EFE9","#D9714E","#0B0908","#FFB020"]},
  {id:"toy",gloss:1,zh:"糖果塑料",en:"Candy Plastic",price:90,sw:["#F4F1EA","#EB3B24","#130C21","#9DF03A"],dz:"塑料按键、积木柱子、点阵底板",de:"Plastic keys, brick bars, a dotted board"},
  {id:"pocket",gloss:1,zh:"奶油塑料",en:"Buttery Plastic",price:120,lit:1,sw:["#C6C9CB","#E7D4B4","#1B1C1E","#E39A2E"],dz:"油润塑料、凹碟方键、点阵屏、喇叭网孔",de:"Oily plastic, dished square keys, a dot-matrix screen, speaker holes"},
  {id:"eink",zh:"墨水屏",en:"E-Ink",price:120,sw:["#ECEBE6","#111111","#161616","#E6E5E0"],dz:"电子书屏：纸白底、墨黑字、细黑框、翻页时闪一下",de:"An e-reader screen: paper white, ink black, thin black rules, a flash as the page turns"},
  {id:"mac",zh:"喷砂铝",en:"Bead-Blasted Aluminium",price:120,lit:1,sw:["#D6D7DA","#1C1C1E","#38393D","#0A84FF"],dz:"喷砂铝、钻石切边、黑色键帽",de:"Bead-blasted aluminium, diamond-cut edges, black keycaps"},
  {id:"aqua",zh:"水晶胶",en:"Aqua",price:120,sw:["#EEF0F3","#2F7DE0","#3B4048","#3A8AF0"],dz:"亮：蓝色水晶胶按钮、细条纹底、拉丝金属窗、半透明程序坞；暗：石墨灰的同一套",de:"Light: blue gel buttons, pinstripes, brushed-metal windows, a translucent dock; dark: the same in slate graphite"},
  {id:"ipod",zh:"白瓷",en:"Porcelain",price:120,lit:1,sw:["#FBFBFA","#2F7BEA","#151516","#2F7BEA"],dz:"高光白瓷面板、镀铬边、点按转盘",de:"Glossy porcelain face, chrome rim, a click wheel"},
  /* single-look themes: fix is the one mode they come in; the header switch hides */
  {id:"tm4",gloss:1,zh:"钴蓝磨砂",en:"Frosted Cobalt",price:120,fix:"dark",sw:["#123A6B","#2D76C6","#FFFFFF","#FF6E30"],dz:"圆柱按键、点阵屏、发光指示灯",de:"Cylinder keys, a dot-matrix screen, glowing LEDs"},
  {id:"skeuo",zh:"拉丝铝 · 霓虹",en:"Brushed Alloy",price:120,fix:"light",sw:["#86888D","#C4C6CA","#18191B","#1FF5DC"],dz:"金属旋钮、黑色表圈、青色霓虹",de:"Metal knobs, a black bezel, cyan neon"},
  {id:"braun",gloss:1,zh:"米白烤漆",en:"Cream Enamel",price:90,fix:"light",sw:["#D8D5CA","#F6F5EF","#1C1B18","#F26422"],dz:"方键、凹碟、滚花拨盘",de:"Square keys, concave dishes, a fluted dial"},
  {id:"md",zh:"冰蓝拉丝",en:"Ice-Blue Brushed",price:120,fix:"light",sw:["#BFC6D0","#D3DAE3","#AEB9A2","#FF6A13"],dz:"冰蓝拉丝铝、段码液晶、橡胶小键",de:"Ice-blue brushed aluminium, a segment LCD, rubber keys"},
  {id:"nikon",zh:"黑皮压纹",en:"Pebbled Leather",price:120,fix:"dark",sw:["#141517","#26272A","#9EA3AA","#E8302A"],dz:"压纹蒙皮、滚花拨盘、快门键",de:"Pebbled leatherette, knurled dials, a shutter button"},
  {id:"dyson",gloss:1,zh:"粉瓷 · 铜蓝",en:"Rose Ceramic · Copper Blue",price:120,lit:1,sw:["#EDDBD3","#C46F6C","#141936","#D49A5E"],dz:"亮：奶白陶瓷机身配玫瑰金属；暗：普鲁士蓝哑光配金铜；旋纹按钮、滤网纹样",de:"Light: cream ceramic with rose metal; dark: Prussian blue matte with rich copper; spun-ring buttons, filter grille"},
  /* iPod family (ipod:1): html[data-ipod]; the focus page becomes the player, a Now Playing screen over a click wheel (ipRender) */
  {id:"ipc",ipod:1,zh:"经典 · 银与黑",en:"Classic · Silver & Black",price:120,sw:["#D3B386","#D9DBDE","#4E5155","#3D3D41"],dz:"iPod classic：亮是银色铝机身、白转盘，放在 Apple Store 的木桌上；暗是黑色铝机身、黑转盘，放在铝合金展示台上",de:"iPod classic: light is silver aluminium with a white wheel on an Apple Store wooden table; dark is black aluminium with a black wheel on an aluminium display stand"},
  {id:"ipu2",ipod:1,zh:"U2 特别版",en:"U2 Special Edition",price:120,fix:"dark",sw:["#4E5155","#0A0A0B","#C42A22","#FFFFFF"],dz:"亮面黑色机身、红转盘，放在铝合金展示台上",de:"A glossy black body with a red wheel on an aluminium display stand"},
  {id:"ipice",ipod:1,zh:"冰蓝水钻",en:"Ice Crystal",price:120,fix:"light",sw:["#A9CCEC","#E9F1F8","#4F8FCF","#FFFFFF"],dz:"冰蓝机身、拉丝银转盘、一圈圈水钻",de:"An ice-blue body, a spun-silver wheel, rings of rhinestones"},
  {id:"iplav",ipod:1,zh:"紫晶贴纸",en:"Lavender Gems",price:120,fix:"light",sw:["#B7A5EE","#C9BCF4","#8A6CE8","#F05BA6"],dz:"闪粉紫机身、水晶中键、宝石和星星贴纸",de:"A glittery lavender body, a crystal centre button, gem and star stickers"},
  {id:"ipsmk",ipod:1,zh:"陶瓷烟灰",en:"Ceramic Smoke",price:120,fix:"light",sw:["#55585D","#7A9E73","#EFCB3F","#EEF0F2"],dz:"烟灰亮面陶瓷机身、鼠尾草绿转盘、柠黄中键",de:"Glossy smoke-grey ceramic, a sage wheel, a lemon centre button"},
  {id:"ipylw",ipod:1,zh:"陶瓷柠黄",en:"Ceramic Lemon",price:120,fix:"light",sw:["#EECE5C","#EDBB28","#5E5A3C","#F1F0EA"],dz:"柠黄亮面陶瓷机身、黄转盘",de:"Glossy lemon ceramic, a yellow wheel"},
  {id:"ipgrn",ipod:1,zh:"陶瓷青绿",en:"Ceramic Sage",price:120,fix:"light",sw:["#78A874","#679A57","#3E5640","#EDF1EC"],dz:"青绿亮面陶瓷机身、绿转盘",de:"Glossy sage ceramic, a green wheel"},
  {id:"ipclr",ipod:1,zh:"陶瓷宝蓝",en:"Ceramic Cobalt",price:120,fix:"light",sw:["#3E55C8","#2A3BB0","#DDE3F7","#7FA2FF"],dz:"宝蓝亮面陶瓷机身、宝蓝转盘",de:"Glossy cobalt ceramic, a cobalt wheel"},
  {id:"clay",gloss:1,zh:"黏土 · 薄荷",en:"Clay · Mint",price:90,fix:"light",sw:["#E3E1DA","#FFFFFF","#C7C5BD","#7CE8C4"],dz:"斜投影积木、网格纸、发光圆环",de:"Blocks with slanted shadows, grid paper, a glowing ring"}];
/* ---------- the app icon: a paper envelope with a scratch card, dyed in the look's own colour (tools/icons.py),
   with a symbol the user picks. icons/<theme>-<light|dark>-<symbol>.webp is the tile, -m.webp maskable, -a.png for
   iPhone, .json its manifest. ICON_V: bump when the pictures are remade ---------- */
const ICON_V=1,ICON_SYMS=["heart","star","cross","bird","cat","dog","rabbit"];
function iconSym(){let v="heart";try{v=localStorage.getItem(PK+"icon")||"heart"}catch(e){}return ICON_SYMS.includes(v)?v:"heart"}
const iconLook=()=>{const de=document.documentElement;return (de.dataset.theme||"aurora")+"-"+(de.dataset.mode||"light")};
const iconSrc=sym=>"icons/"+iconLook()+"-"+(sym||iconSym())+".webp?v="+ICON_V;
/* point the page at the icon for this look and symbol: favicon, iPhone icon and the manifest (the small script in
   index.html does the same from "tracktor-icon" before anything else loads, so an install picks it up) */
function iconApply(){const n=iconLook()+"-"+iconSym();try{localStorage.setItem("tracktor-icon",n)}catch(e){}
  const set=(sel,href)=>{const l=document.querySelector(sel);if(l&&l.getAttribute("href")!==href)l.setAttribute("href",href)};
  set('link[rel="manifest"]',"icons/"+n+".json?v="+ICON_V);set('link[rel="icon"]',"icons/"+n+".webp?v="+ICON_V);set('link[rel="apple-touch-icon"]',"icons/"+n+"-a.png?v="+ICON_V);
  document.querySelectorAll(".ev i:not(.ev-hole)").forEach(e=>{e.style.backgroundImage="url("+iconSrc()+")"})}
function themeOwned(id){const t=THEMES.find(x=>x.id===id);return !!t&&(!t.price||(state.settings.buys||[]).some(b=>b.id===id))}
function applyMode(){let m="auto";try{m=localStorage.getItem(PK+"mode")||"auto"}catch(e){}
  const th=themeOwned(state.settings.theme)?state.settings.theme:"aurora",fix=(THEMES.find(x=>x.id===th)||{}).fix,
    dark=fix?fix==="dark":m==="dark"||(m==="auto"&&matchMedia("(prefers-color-scheme: dark)").matches),de=document.documentElement;
  de.dataset.mode=dark?"dark":"light";de.dataset.theme=th;if((THEMES.find(x=>x.id===th)||{}).gloss)de.dataset.gloss="";else delete de.dataset.gloss;if(fix)de.dataset.fixed="";else delete de.dataset.fixed;if(fix||(THEMES.find(x=>x.id===th)||{}).lit)de.dataset.lit="";else delete de.dataset.lit;if((THEMES.find(x=>x.id===th)||{}).ipod)de.dataset.ipod="";else delete de.dataset.ipod;
  iconApply();document.querySelector('meta[name="theme-color"]').content=getComputedStyle(document.documentElement).getPropertyValue("--bg").trim()||(dark?"#070A10":"#F1F1EC")}
applyMode();matchMedia("(prefers-color-scheme: dark)").addEventListener("change",applyMode);
/* the light on the materials stays where it is (the tilt-following light was dropped); its old setting goes */
try{localStorage.removeItem(PK+"rt")}catch(e){}
/* dust: two days without training or extras and the screen gathers dust, more each day (levels 1–3); training wipes it */
/* music easter egg (js/p1music.js spGroove): bricks, trained days and the start key move with what plays */
function grooveOn(){try{return localStorage.getItem(PK+"groove")!=="0"}catch(e){return true}}
/* translucent glass: the dock and the player float as frosted, see-through bars (Settings › Appearance › Effects; off by default) */
function glassOn(){try{return localStorage.getItem(PK+"glass")==="1"}catch(e){return false}}
function glassApply(){document.documentElement.classList.toggle("glass",glassOn())}
glassApply();
/* the e-ink skin: a full refresh flashes the screen black for an instant when the page turns, like an e-reader */
function einkFlash(){if(document.documentElement.dataset.theme!=="eink"||matchMedia("(prefers-reduced-motion: reduce)").matches)return;
  const f=document.createElement("div");f.className="einkflash";document.body.appendChild(f);setTimeout(()=>f.classList.add("w"),70);setTimeout(()=>f.remove(),150)}
/* a finger on the screen: html.touching, so the music rhythm pauses and the tilt light holds while scrolling or swiping */
(function(){const de=document.documentElement;let t=0;
  addEventListener("touchstart",()=>{clearTimeout(t);if(!de.classList.contains("touching"))de.classList.add("touching")},{passive:true,capture:true});
  const up=()=>{clearTimeout(t);t=setTimeout(()=>de.classList.remove("touching"),350)};
  addEventListener("touchend",up,{passive:true,capture:true});addEventListener("touchcancel",up,{passive:true,capture:true})})();
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
  const cls=(s===t?" today":"")+(s>t?" fut":"")+(out?" out":"")+(kinds.length?" trn":mk?" xo":"")+(kinds.length&&(kinds.length>1||mk.has("x"))?" multi":"")+(s===calSel?" sel":"");
  /* more than one training that day (two or three kinds, or a session plus extra practice): the date is cut on the
     diagonal into one colour per training */
  const segs=kinds.length&&mk.has("x")?kinds.concat("muted"):kinds,multi=segs.length>1;
  const st=kinds.length?' style="--kc:var(--'+kinds[0]+')'+(multi?';--s1:var(--'+segs[0]+');--s2:var(--'+segs[1]+');--s3:var(--'+(segs[2]||segs[1])+');--p1:'+(segs.length>2?'33.4%':'50%')+';--p2:'+(segs.length>2?'66.7%':'100%'):'')+'"':'',inner='<b>'+dateObj(s).getDate()+'</b>';
  return s>t?'<div class="dd'+cls+'">'+inner+'</div>':'<button class="dd'+cls+'"'+st+' data-act="calsel" data-d="'+s+'" aria-label="'+(LANG==="en"?MON_EN[dateObj(s).getMonth()]+" "+dateObj(s).getDate():(dateObj(s).getMonth()+1)+"月"+dateObj(s).getDate()+"日")+'">'+inner+'</button>'}
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
/* two taps for anything that throws records away: the first arms the key (it turns red and says so), a second tap
   within three seconds does it */
function armTap(b,fn,msg){if(b.classList.contains("arm")){b.classList.remove("arm");clearTimeout(b._arm);fn();return}
  b.classList.add("arm");buzz(12);if(msg)toast(msg);b._arm=setTimeout(()=>b.classList.remove("arm"),3000)}
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
      :(dn?'<button class="mini hreset" data-act="hreset" data-sid="'+p.sid+'" aria-label="'+T('重置这次训练','Reset this session')+'">'+ICON.reset+'</button>':'')
      +'<button class="hgo" data-act="start" data-sid="'+p.sid+'">'+ICON.play+'<span>'+(dn?dn+'/'+tot:T('开练','Grind'))+'</span></button>')+'</div>'
    +'<p class="eyebrow">'+(lock?ICON.lock+T('预告','Preview'):engFree()?T('按你最近练的建议','From your recent training'):T('可练','Ready'))+'</p>'
    +'<h2><i class="kd" style="background:var(--'+p.kind+')"></i>'+LAB(p)+'</h2>'
    +'<p class="meta">'+T(p.ex.length+' 个动作 · '+tot+' 组 · 约 '+Math.round(tot*1.6)+' 分钟',p.ex.length+' moves · '+tot+' sets · ~'+Math.round(tot*1.6)+' min')+'<span class="hchev">'+ICON.chev+'</span></p>'
    +'<div class="exwrap"><div><ul class="exl">'+p.ex.map((e,i)=>'<li class="'+(sets[i].length&&sets[i].every(x=>x.d)?"dn":"")+'"><span>'+NS(e)+(engTempo(e)?' <i class="slow">'+T('慢速','Slow')+'</i>':'')+'</span><b>'+e.sets+' × '+e.target+(e.unit==="个"?"":" "+U(e.unit))+'</b></li>').join("")+'</ul>'
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
function renderTrainView(){const v=$("#v-train");v.innerHTML=freeHintHtml()+arrHtml("train",{hero:heroHtml,cal:calHtml});animateRings(v);if($('.fstack[data-fs="hero"]'))fsBind("hero",HERO_FS);if($('.fstack[data-fs="cal"]'))fsBind("cal",CAL_FS);arrBind("train")}
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
  const f=$("#focus");f.classList.add("on");document.documentElement.classList.add("infocus");f.setAttribute("aria-hidden","false");document.body.style.overflow="hidden";
  clearInterval(clockT);clockT=setInterval(()=>{const el=$("#fTime");if(el){const s=Math.floor((Date.now()-run.t0)/1000);el.textContent=Math.floor(s/60)+":"+pad(s%60)}},1000);
  renderFocus()}
function closeRun(){clearInterval(clockT);if(run)clearInterval(run.ipTm);document.documentElement.classList.remove("cfmove");const f=$("#focus");f.classList.remove("on");document.documentElement.classList.remove("infocus");f.setAttribute("aria-hidden","true");document.body.style.overflow="";run=null;renderTrainView()}
function curSet(){return run.sets[run.ex].findIndex(x=>!x.d)}
/* the moves are two stacks: the ones still to do and the ones done. The stack in focus is a cover flow, one "record"
   per move (name, tempo, sets × reps, a pip per set); the other sits small at the right of the sets, a tick on the done
   one and a dumbbell on the one still to do; tap it to swap. A finished move flies into the done stack */
function cfLists(){const todo=[],done=[];run.sets.forEach((a,i)=>(a.every(y=>y.d)?done:todo).push(i));return {todo,done}}
const cfLast=done=>done.slice().sort((x,y)=>Math.max(0,...run.sets[y].map(z=>z.o||0))-Math.max(0,...run.sets[x].map(z=>z.o||0)))[0];
function cfCard(i,cls){const e=run.p.ex[i],a=run.sets[i],m=N(e).match(/[（(]([^）)]*)[）)]/),sub=[m&&m[1],e.note?NOTE(e):""].filter(Boolean).join(" · "),
    vs=a.map(x=>x.v),sum=!a.length?"—":vs.every(v=>v===vs[0])?a.length+" × "+vs[0]:vs.join(" · ");
  const art=cfArt(i);
  return '<div class="cf-card'+(art?" art":"")+(cls||"")+'"'+(art?' style="background-image:url('+art+')"':'')+' data-i="'+i+'" role="option" aria-selected="'+(i===run.ex)+'"><h2>'+esc(NS(e))+'</h2>'+(sub?'<p class="cf-sub">'+esc(sub)+'</p>':'')
    +'<p class="cf-sum n">'+sum+(a.length?'<small>'+U(e.unit)+'</small>':'')+'</p><span class="cf-pips">'+a.map(x=>'<i'+(x.d?' class="dn"':'')+'></i>').join("")+'</span>'+CF_EDGES+'</div>'}
/* each record's edge is rounded over, like the rim of an aluminium iPod: lit along the top and left, shaded along the
   bottom and right, drawn once on the record (nothing moves with the scrolling) */
const CF_EDGES='<i class="cf-bev" aria-hidden="true"></i>';
function renderFocus(anim){
  const f=$("#focus"),p=run.p,allDone=run.sets.every(x=>x.every(y=>y.d));
  if(allDone&&!run.finished&&run.askFeel==null){finishRun();return}
  const {todo,done}=cfLists();let list;
  if(run.askFeel!=null){run.stk="todo";run.ex=run.askFeel;list=todo.concat(run.askFeel).sort((x,y)=>x-y)}
  else{if(run.stk==="done"&&!done.includes(run.ex)){if(todo.includes(run.ex)||!done.length)run.stk="todo";else run.ex=cfLast(done)}
    if(run.stk==="done")list=done;else{run.stk="todo";list=todo;if(!list.includes(run.ex))run.ex=list[0]}}
  const other=run.stk==="done"?todo:done.filter(i=>i!==run.askFeel),
    fly=run.cfPrevStk==="todo"&&run.stk==="todo"&&run.cfPrev?run.cfPrev.find(i=>!list.includes(i)&&done.includes(i)):undefined;
  run.cfPrev=list;run.cfPrevStk=run.stk;
  const e=p.ex[run.ex],a=run.sets[run.ex],ci=curSet(),val=ci<0?(a.length?a[a.length-1].v:"—"):a[ci].v;
  let bottom;
  if(run.askFeel!=null)bottom='<div class="feelbar" role="slider" tabindex="0" aria-label="'+T('这个动作感觉？','How did that feel?')+'" aria-valuemin="1" aria-valuemax="4"><span class="fl-lab">'+T('感觉？','Feel?')+'</span><div class="fl-bks">'+FEEL4.map((x,i)=>'<i style="--i:'+i+'"></i>').join("")+'</div></div><button class="f-hint" data-act="feel" data-f="">'+T('跳过','Skip')+'</button>';
  else if(ci<0)bottom='<button class="tickb done" disabled>'+ICON.check+'</button>';
  else bottom=+val>0?'<button class="tickb" data-act="tick" aria-label="'+T('完成这一组','Set done')+'">'+ICON.check+'</button>'
    :'<button class="tickb skip" data-act="tick" aria-label="'+T('去掉这一组','Drop this set')+'">'+ICON.x+'</button>';
  /* the other stack, small: two of its records' covers, one tucked behind the other, and a badge (a tick on the finished
     ones, a dumbbell on the ones still to do) */
  const pick=run.stk==="done"?other.slice(0,2):done.slice().sort((x,y)=>Math.max(0,...run.sets[y].map(z=>z.o||0))-Math.max(0,...run.sets[x].map(z=>z.o||0))).filter(i=>i!==run.askFeel).slice(0,2),
    mc=i=>{const u=cfArt(i);return '<i class="mc'+(u?"":" plain")+'"'+(u?' style="background-image:url('+u+')"':'')+'></i>'},
    mini=pick.length?'<button class="cf-mini'+(run.stk==="done"?"":" dn")+(pick.length>1?" two":"")+'" data-act="cfswap" aria-label="'+(run.stk==="done"?T('回到没练的动作','Back to the moves to do'):T('看练好的动作','See the finished moves'))+'">'
    +pick.slice().reverse().map(mc).join("")+'<b class="mb">'+(run.stk==="done"?ICON.dumbbell:ICON.check)+'</b></button>':'';
  if(ipodOn()){ipRender(anim,list,mini);return}
  const keep=fly==null&&!run.cfIn&&run.cfKey===run.stk+list.join()?$(".cflow"):null;run.cfKey=run.stk+list.join();
  const H='<div class="f-top"><span class="f-lab">'+LAB(p)+'</span><span class="sp"></span><span class="f-time n" id="fTime">0:00</span></div>'
    +'<div class="f-body" id="fBody"><div class="cflow'+(run.cfIn?" in":"")+'"><div class="cf-scroll'+(run.askFeel!=null?" lock":"")+'" tabindex="0" role="listbox" aria-label="'+T('动作','Moves')+'"><div class="cf-rail">'+list.map(i=>'<div class="cf-slot">'+cfCard(i)+'</div>').join("")+'</div></div>'+(fly!=null?cfCard(fly," cf-fly"):"")+'</div>'
    +'<div class="f-setrow"><div class="f-sets"><div class="fs-track">'+a.map((x,i)=>x.d?'<i class="dn" role="button" tabindex="0" data-act="untick" data-i="'+i+'" aria-label="'+T('撤销第 '+(i+1)+' 组','Undo set '+(i+1))+'">'+ICON.check+x.v+'</i>':'<i class="'+(i===ci?"cur":"")+'" data-i="'+i+'">'+(i===ci?T("第 "+(i+1)+" 组","Set "+(i+1)):i+1)+'</i>').join("")
    +'<i class="add" role="button" tabindex="0" data-act="addset" aria-label="'+T('加一组','One more set')+'">'+ICON.plus+'</i></div></div>'+mini+'</div>'
    +'<div class="f-num">'+(ci<0?'<span style="width:46px"></span>':'<button class="mini" data-act="dec" aria-label="'+T('减一','Less')+'">−</button>')+'<b class="n"><span id="fVal"'+(anim?' class="pop"':'')+'>'+val+'</span>'+(a.length?'<small>'+U(e.unit)+'</small>':'')+'</b>'
    +(ci<0?'<span style="width:46px"></span>':'<button class="mini" data-act="inc" aria-label="'+T('加一','More')+'">+</button>')+'</div></div>'
    +'<div class="f-bottom" id="fBottom"><button class="mini f-x" data-act="fclose" aria-label="'+T('退出','Leave')+'">'+ICON.x+'</button><div class="f-bc">'+bottom+'</div><span class="f-x"></span></div>';
  /* same stack, same moves (the flow came to rest on another record, or a set was ticked): the row of records stays exactly where it is (taking it out and
     putting it back made the phone redraw it from scratch, a visible blink); only the rest of the page is replaced */
  if(keep){const t=document.createElement("div"),body=f.querySelector("#fBody");t.innerHTML=H;
    f.querySelector(".f-top").replaceWith(t.querySelector(".f-top"));f.querySelector("#fBottom").replaceWith(t.querySelector("#fBottom"));
    [...body.children].forEach(c=>{if(!c.classList.contains("cflow"))c.remove()});[...t.querySelector("#fBody").children].forEach(c=>{if(!c.classList.contains("cflow"))body.appendChild(c)});
    /* a record whose numbers changed (a tick, an added or dropped set) gets its words and dots redone in place */
    const fresh=[...t.querySelectorAll(".cf-slot .cf-card")];keep.querySelectorAll(".cf-slot .cf-card").forEach((c,j)=>{const n=fresh[j];if(n&&c.innerHTML!==n.innerHTML){c.innerHTML=n.innerHTML;cfFit()}});
    keep.querySelector(".cf-scroll").classList.toggle("lock",run.askFeel!=null)}
  else f.innerHTML=H;
  run.cfIn=0;
  const s=Math.floor((Date.now()-run.t0)/1000);$("#fTime").textContent=Math.floor(s/60)+":"+pad(s%60);
  setsCenter();if(!keep){cfBind($(".cf-scroll"),list);cfFit();if(document.fonts)document.fonts.ready.then(cfFit)}else document.querySelectorAll(".cf-card").forEach((c,j)=>c.setAttribute("aria-selected",list[j]===run.ex));feelBind($(".feelbar"));setsHold();if(fly!=null)cfFly()}
/* ---------- the iPod skins: the focus page is the player. A Now Playing screen (the move's cover at the left, its
   name and sets at the right, a progress bar for the reps or seconds of the set being done) over a click wheel:
   turn it to change the number (on the feel step, to pick the feel; on a finished move, to go through the moves),
   the centre button does the set, ⏮ ⏭ go to the move before or after, MENU swaps to-do and done, ▶II times the set
   (a move in seconds or minutes) or the rest after it (a move in reps, 90 s) ---------- */
const ipodOn=()=>"ipod" in document.documentElement.dataset;
const IP_I={play:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 5l9 7-9 7z" fill="currentColor"/><path d="M15 5h2.2v14H15zM19 5h2.2v14H19z" fill="currentColor"/></svg>',
  prev:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 5h2.2v14H3zM13 5v14L5.5 12zM21.5 5v14L14 12z" fill="currentColor"/></svg>',
  next:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2.5 5v14L10 12zM11 5v14l7.5-7zM18.8 5H21v14h-2.2z" fill="currentColor"/></svg>',
  st:on=>'<svg viewBox="0 0 16 16" aria-hidden="true">'+(on?'<path d="M4 3h3v10H4zM9 3h3v10H9z"/>':'<path d="M4.5 3l8 5-8 5z"/>')+'</svg>'};
const ipStep=e=>e.unit==="秒"?5:1;
function ipNums(){const e=run.p.ex[run.ex],a=run.sets[run.ex],ci=curSet(),T0=run.ipT;
  if(T0&&T0.rest&&Date.now()-(run.ipPeek||0)>1500){const s=Math.floor((Date.now()-T0.t0)/1000),R=90;return {l:Math.floor(s/60)+":"+pad(s%60),r:"−"+Math.floor(Math.max(0,R-s)/60)+":"+pad(Math.max(0,R-s)%60),w:Math.min(100,s/R*100),lab:T("休息","Rest")}}
  const v=ci<0?(a.length?+a[a.length-1].v||0:0):+a[ci].v||0,tg=+e.target||v||1,d=v-tg;
  return {l:v+'<small>'+U(e.unit)+'</small>',r:d<0?"−"+(-d):d>0?"+"+d:"0",w:Math.max(v>0?2:0,Math.min(100,v/Math.max(tg,1)*100)),over:d>0}}
function ipRender(anim,list,mini){const f=$("#focus"),p=run.p,e=p.ex[run.ex],a=run.sets[run.ex],ci=curSet(),pos=list.indexOf(run.ex),
    tot=run.sets.reduce((s,x)=>s+x.length,0),dn=run.sets.reduce((s,x)=>s+x.filter(y=>y.d).length,0),art=cfArt(run.ex),
    m=N(e).match(/[（(]([^）)]*)[）)]/),sub=[m&&m[1],e.note?NOTE(e):""].filter(Boolean).join(" · "),nb=ipNums(),feel=run.askFeel!=null;
  const title=feel?T("感觉如何","How was it"):run.stk==="done"?T("练好的","Done"):T("正在练","Now Training");
  const sets='<div class="f-setrow"><div class="f-sets"><div class="fs-track">'+a.map((x,i)=>x.d?'<i class="dn" role="button" tabindex="0" data-act="untick" data-i="'+i+'" aria-label="'+T('撤销第 '+(i+1)+' 组','Undo set '+(i+1))+'">'+ICON.check+x.v+'</i>':'<i class="'+(i===ci?"cur":"")+'" data-i="'+i+'">'+(i===ci?T("第 "+(i+1)+" 组","Set "+(i+1)):i+1)+'</i>').join("")
    +'<i class="add" role="button" tabindex="0" data-act="addset" aria-label="'+T('加一组','One more set')+'">'+ICON.plus+'</i></div></div>'+'</div>';
  const scr='<div class="ip-scr" role="group" aria-label="'+esc(NS(e))+'"><div class="ip-bar"><b>'+title+'</b><span class="sp"></span><i class="ip-st'+(run.ipT?" on":"")+'">'+IP_I.st(!!run.ipT)+'</i><span class="n" id="fTime">0:00</span>'+ipBatHtml(dn,tot)+'</div>'
    +'<div class="ip-np'+(anim&&run.ipDir?" sl"+(run.ipDir>0?"r":"l"):"")+'"><div class="ip-artw"><div class="ip-artm"><div class="ip-art'+(art?"":" plain")+'"'+(art?' style="background-image:url('+art+')"':'')+'></div></div>'+mini+'</div><div class="ip-info"><h2>'+esc(NS(e))+'</h2>'
    +'<p>'+esc(sub||LAB(p))+'</p><p class="ip-pos n">'+(pos+1)+' / '+list.length+'</p>'+sets+'</div></div>'
    +(feel?'<div class="feelbar ip-feel" role="slider" tabindex="0" aria-label="'+T('这个动作感觉？','How did that feel?')+'" aria-valuemin="1" aria-valuemax="4"><span class="fl-lab">'+T('转一转','Turn')+'</span><div class="fl-bks">'+FEEL4.map((x,i)=>'<i style="--i:'+i+'"></i>').join("")+'</div></div>'
      :'<div class="ip-prog'+(nb.over?" over":"")+'"><span class="n" id="ipL">'+nb.l+'</span><i class="ip-trk"><i id="ipF" style="width:'+nb.w+'%"></i></i><span class="n" id="ipR">'+nb.r+'</span></div>')+'</div>';
  const wheel='<div class="ip-wheel" role="group" aria-label="'+T('转盘：转动调数字','Click wheel: turn to change the number')+'"><i class="ip-ring" aria-hidden="true"></i>'
    +'<button type="button" class="ip-k ip-menu" data-ip="menu" aria-label="'+T('切换没练 / 练好','Swap to-do and done')+'">MENU</button>'
    +'<button type="button" class="ip-k ip-prev" data-ip="prev" aria-label="'+T('上一个动作','Previous move')+'">'+IP_I.prev+'</button>'
    +'<button type="button" class="ip-k ip-next" data-ip="next" aria-label="'+T('下一个动作','Next move')+'">'+IP_I.next+'</button>'
    +'<button type="button" class="ip-k ip-play" data-ip="play" aria-label="'+(e.unit==="个"?T('休息计时','Rest timer'):T('计时','Time the set'))+'">'+IP_I.play+'</button>'
    +'<button type="button" class="ip-ok" data-ip="ok" aria-label="'+(feel?T('确定','OK'):ci<0?T('已练好','Done'):T('完成这一组','Set done'))+'"></button></div>';
  const old=f.querySelector(".ip-wheel"),swap=run.ipStk&&run.ipStk!==run.stk?ipSnap():null;run.ipStk=run.stk;
  f.innerHTML='<div class="f-top ip-top"><button class="mini" data-act="fclose" aria-label="'+T('退出','Leave')+'">'+ICON.x+'</button><span class="sp"></span><span class="f-lab">'+LAB(p)+'</span></div>'
    +'<div class="f-body ip-body" id="fBody"><div class="ipod">'+(ipodDeco[document.documentElement.dataset.theme]||(()=>""))()+'<i class="ip-roll" aria-hidden="true"></i>'+scr+wheel+'</div></div><div></div>';
  /* the wheel stays the same element, so a finger still on it keeps turning across a redraw */
  if(old){f.querySelector(".ip-wheel").replaceWith(old)}else ipWheel(f.querySelector(".ip-wheel"));
  run.ipDir=0;run.cfIn=0;run.cfKey=null;{const th=document.documentElement.dataset.theme;if(IP_ART[th])f.querySelector(".ipod").style.setProperty("--ip-deco",ipDecoUrl(th))}if(swap)ipSwapFx(swap);
  const s=Math.floor((Date.now()-run.t0)/1000);$("#fTime").textContent=Math.floor(s/60)+":"+pad(s%60);
  setsCenter();feelBind($(".feelbar"));setsHold()}
/* swapping stacks: the big cover flies down into the small stack at its lower left corner while the other stack's
   cover grows out of that corner into the big place; transforms only, so the phone's compositor runs it at full rate */
function ipSnap(){const a=$(".ip-art"),m=$(".ip-artw .cf-mini .mc:last-of-type");if(!a)return null;
  return {a:a.getBoundingClientRect(),bg:a.style.backgroundImage,plain:a.classList.contains("plain"),m:m?m.getBoundingClientRect():null}}
function ipSwapFx(S){if(matchMedia("(prefers-reduced-motion: reduce)").matches)return;
  const mv=$(".ip-artm"),art=$(".ip-art"),mini=$(".ip-artw .cf-mini"),mc=mini&&mini.querySelector(".mc:last-of-type"),info=$(".ip-info");if(!mv||!art)return;
  const E="cubic-bezier(.22,1,.36,1)",D=460,r=art.getBoundingClientRect();
  /* the new big cover starts where the small one was */
  if(S.m){const k=S.m.width/r.width;mv.animate([{transform:"translate("+(S.m.left-r.left)+"px,"+(S.m.top-r.top)+"px) scale("+k+")",opacity:.6},{transform:"none",opacity:1}],{duration:D,easing:E})}
  else mv.animate([{transform:"scale(.6)",opacity:0},{transform:"none",opacity:1}],{duration:D,easing:E});
  if(info)info.animate([{opacity:0,transform:"translateY(6px)"},{opacity:1,transform:"none"}],{duration:D*.8,delay:D*.2,easing:E,fill:"backwards"});
  /* the old big cover, copied, flies into the small stack, which waits empty until it lands */
  const g=document.createElement("i");g.className="ip-ghost"+(S.plain?" plain":"");g.style.cssText="left:"+S.a.left+"px;top:"+S.a.top+"px;width:"+S.a.width+"px;height:"+S.a.height+"px;"+(S.bg?"background-image:"+S.bg:"");
  document.body.appendChild(g);
  const t=mc?mc.getBoundingClientRect():(mini?mini.getBoundingClientRect():null);
  const end=t?{transform:"translate("+(t.left-S.a.left)+"px,"+(t.top-S.a.top)+"px) scale("+(t.width/S.a.width)+")",opacity:1}:{transform:"scale(.3)",opacity:0};
  if(mini)mini.style.opacity="0";
  g.animate([{transform:"none",opacity:1},end],{duration:D,easing:E}).onfinish=()=>{g.remove();if(mini){mini.style.opacity="";mini.classList.remove("got");void mini.offsetWidth;mini.classList.add("got")}}}
/* the battery on the screen is the phone's own where the browser tells (Android Chrome: level and charging, no
   permission needed); elsewhere it shows how much of the session is done */
const IP_BAT={};
function ipBatHtml(dn,tot){const has=IP_BAT.level!=null,lv=has?IP_BAT.level:dn/Math.max(1,tot),pc=Math.round(lv*100);
  return '<i class="ip-bat'+(has&&IP_BAT.charging?" chg":"")+(has&&lv<=.2&&!IP_BAT.charging?" low":"")+'" role="img" aria-label="'+(has?T("电量 ","Battery ")+pc+"%":dn+"/"+tot)+'"><i style="width:'+pc+'%"></i></i>'}
if(navigator.getBattery)navigator.getBattery().then(b=>{const up=()=>{IP_BAT.level=b.level;IP_BAT.charging=b.charging;const el=document.querySelector(".ip-bat");if(el&&run)el.outerHTML=ipBatHtml(0,1)};
  up();["levelchange","chargingchange"].forEach(k=>b.addEventListener(k,up))}).catch(()=>{});
/* the numbers on the screen, redone in place while the wheel turns or the timer runs */
function ipPaint(){const L=$("#ipL");if(!L)return;const nb=ipNums();L.innerHTML=nb.l;$("#ipR").textContent=nb.r;$("#ipF").style.width=nb.w+"%";L.parentNode.classList.toggle("over",!!nb.over)}
function ipTurn(d){if(!run||run.finished)return;const fb=$(".feelbar");
  if(run.askFeel!=null){if(fb&&fb._show)fb._show(Math.max(1,Math.min(4,(+fb.dataset.lv||0)+d)));return}
  const ci=curSet();
  if(ci<0){ipMove(d);return}
  /* resting: the number shows for a moment while it changes, then the rest comes back */
  if(run.ipT&&run.ipT.rest)run.ipPeek=Date.now();else if(run.ipT)ipTime(false);
  const s=run.sets[run.ex][ci],st=ipStep(run.p.ex[run.ex]),v=Math.max(0,(+s.v||0)+d*st);if(v===+s.v)return;
  s.v=v;run.doc.edited=true;lsSave();SFX.detent();buzz(3);ipPaint()}
function ipMove(d){const {todo,done}=cfLists(),list=run.stk==="done"?done:todo,i=list.indexOf(run.ex),j=i+d;
  if(j<0||j>=list.length){SFX.tap();return}if(run.ipT)ipTime(false);run.ex=list[j];run.ipDir=d;cfTick(d,200);buzz(6);renderFocus(true)}
/* ▶II: a move in seconds or minutes counts the set up live; a move in reps times the rest (90 s, then a ding) */
function ipTime(on){clearInterval(run.ipTm);const T0=run.ipT;run.ipT=null;
  if(!on){if(T0&&!T0.rest){const e=run.p.ex[T0.ex],x=run.sets[T0.ex][T0.ci];if(x&&!x.d){const s=Math.floor((Date.now()-T0.t0)/1000);x.v=e.unit==="分钟"?Math.max(1,Math.round(s/60)):s;run.doc.edited=true;lsSave()}}renderFocus();return}
  const e=run.p.ex[run.ex],ci=curSet();if(e.unit==="个"&&ci<0&&!run.sets[run.ex].length)return;
  run.ipT={t0:Date.now(),ex:run.ex,ci,rest:e.unit==="个"||ci<0};
  run.ipTm=setInterval(()=>{if(!run||!run.ipT){return}const T1=run.ipT,s=Math.floor((Date.now()-T1.t0)/1000);
    if(T1.rest){if(s>=90){SFX.rest();buzz([30,60,30]);ipTime(false);return}}
    else{const x=run.sets[T1.ex][T1.ci];if(x)x.v=run.p.ex[T1.ex].unit==="分钟"?Math.floor(s/60):s}
    ipPaint()},250);
  SFX.tap();buzz(8);renderFocus()}
function ipPress(k){if(!run||run.finished)return;
  if(k==="ok"){if(run.askFeel!=null){const fb=$(".feelbar");if(fb&&fb._commit&&+fb.dataset.lv)fb._commit();else{SFX.tap();buzz(6)}return}
    if(curSet()<0){SFX.tap();return}if(run.ipT)ipTime(false);tickSet();
    /* a rep set done: the rest starts by itself */
    if(run&&!run.finished&&run.askFeel==null&&run.p.ex[run.ex].unit==="个"&&curSet()>=0)ipTime(true);return}
  if(k==="menu"){if(run.askFeel!=null)return;const L=cfLists();if(run.stk==="done"){if(!L.todo.length){SFX.tap();return}run.stk="todo";run.ex=L.todo[0]}else{if(!L.done.length){SFX.tap();return}run.stk="done";run.ex=cfLast(L.done)}if(run.ipT)ipTime(false);SFX.tap();buzz(8);renderFocus(true);return}
  if(k==="prev"||k==="next"){if(run.askFeel!=null)return;ipMove(k==="next"?1:-1);return}
  if(k==="play"){if(run.askFeel!=null)return;ipTime(!run.ipT)}}
/* the wheel: a finger going round it turns the number one step every 36°; a touch that hardly turns is a press of the
   button under it; the centre button is a button of its own */
function ipWheel(w){if(!w)return;let st=null;const STEP=Math.PI/5;
  w.addEventListener("pointerdown",e=>{if(e.target.closest(".ip-ok"))return;const r=w.getBoundingClientRect(),cx=r.left+r.width/2,cy=r.top+r.height/2;
    st={cx,cy,a:Math.atan2(e.clientY-cy,e.clientX-cx),acc:0,moved:0,k:(e.target.closest("[data-ip]")||{}).dataset};try{w.setPointerCapture(e.pointerId)}catch(err){}
    w.classList.add("down")});
  w.addEventListener("pointermove",e=>{if(!st)return;const a=Math.atan2(e.clientY-st.cy,e.clientX-st.cx);let d=a-st.a;if(d>Math.PI)d-=2*Math.PI;if(d<-Math.PI)d+=2*Math.PI;st.a=a;st.acc+=d;st.moved+=Math.abs(d);
    while(st.acc>=STEP){st.acc-=STEP;ipTurn(1)}while(st.acc<=-STEP){st.acc+=STEP;ipTurn(-1)}});
  const up=e=>{if(!st)return;const s=st;st=null;w.classList.remove("down");if(e.type==="pointerup"&&s.moved<.3&&s.k&&s.k.ip)ipPress(s.k.ip)};
  w.addEventListener("pointerup",up);w.addEventListener("pointercancel",up);
  w.querySelector(".ip-ok").addEventListener("click",()=>ipPress("ok"));
  /* keyboard: the buttons work with Enter or Space; arrows up and down turn the wheel */
  w.addEventListener("keydown",e=>{if(e.key==="Enter"||e.key===" "){const b=e.target.closest("[data-ip]");if(b&&b.dataset.ip!=="ok"){e.preventDefault();ipPress(b.dataset.ip)}}
    else if(e.key==="ArrowUp"||e.key==="ArrowDown"){e.preventDefault();ipTurn(e.key==="ArrowUp"?1:-1)}});
  w.addEventListener("click",e=>e.stopPropagation());
  ["touchstart","touchmove","touchend"].forEach(k=>w.addEventListener(k,e=>e.stopPropagation(),{passive:true}))}
/* stickers and rhinestones on the body, by skin (drawn as SVG, nothing from the photos) */
const ipodDeco={
  /* the U2 face: a fine line of light running round inside the rolled edge */
  ipu2:()=>'<i class="ip-gloss" aria-hidden="true"></i>'};
/* what is laid on (or, for the clear shell, under) the body, drawn once per skin as one SVG picture in millimetres of the
   real iPod (61.8 × 103.5; screen window 4.7,7.6 52.4 × 39.8; wheel centre 30.9,75, radius 19) and used as a background,
   so it costs nothing while the page moves */
const IP_DECO=new Map();
function ipRnd(seed){let a=seed>>>0;return ()=>{a=(a+0x6D2B79F5)>>>0;let t=a;t=Math.imul(t^(t>>>15),t|1);t^=t+Math.imul(t^(t>>>7),t|61);return ((t^(t>>>14))>>>0)/4294967296}}
function ipDecoUrl(th){if(IP_DECO.has(th))return IP_DECO.get(th);const f=IP_ART[th];const svg=f?'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 61.8 103.5" preserveAspectRatio="none">'+f()+'</svg>':"";
  const u=svg?'url("data:image/svg+xml,'+encodeURIComponent(svg).replace(/'/g,"%27")+'")':"none";IP_DECO.set(th,u);return u}
const IP_STAR=(R,k)=>{let d="";for(let i=0;i<10;i++){const a=-Math.PI/2+i*Math.PI/5,r=i%2?R*(k||.46):R;d+=(i?"L":"M")+(r*Math.cos(a)).toFixed(3)+","+(r*Math.sin(a)).toFixed(3)}return d+"Z"};
const IP_ART={
  /* ice crystal: rhinestones in silver cups, a ring round the screen window and one round the wheel, more scattered
     over the lower half, a few catching the light in four-pointed glints */
  ipice:()=>{const r=ipRnd(11),U=[];
    const gem=(x,y,s)=>U.push('<use href="#rs" x="'+(x-s*1.3).toFixed(2)+'" y="'+(y-s*1.3).toFixed(2)+'" width="'+(s*2.6).toFixed(2)+'" height="'+(s*2.6).toFixed(2)+'"/>');
    /* round the screen: a rounded rectangle 1.3 mm outside the window */
    const x0=3.35,y0=6.25,x1=58.45,y1=48.75,rr=2.6,st=1.2;const per=[];
    const seg=(ax,ay,bx,by)=>{const L=Math.hypot(bx-ax,by-ay),n=Math.max(1,Math.round(L/st));for(let i=0;i<n;i++)per.push([ax+(bx-ax)*i/n,ay+(by-ay)*i/n])};
    const arc=(cx,cy,a0)=>{for(let i=0;i<3;i++){const a=a0+i*Math.PI/6;per.push([cx+rr*Math.cos(a),cy+rr*Math.sin(a)])}};
    seg(x0+rr,y0,x1-rr,y0);arc(x1-rr,y0+rr,-Math.PI/2);seg(x1,y0+rr,x1,y1-rr);arc(x1-rr,y1-rr,0);seg(x1-rr,y1,x0+rr,y1);arc(x0+rr,y1-rr,Math.PI/2);seg(x0,y1-rr,x0,y0+rr);arc(x0+rr,y0+rr,Math.PI);
    per.forEach(([x,y])=>gem(x,y,.5));
    /* round the wheel */
    const WR=20.05,n=Math.round(2*Math.PI*WR/1.22);for(let i=0;i<n;i++){const a=i/n*Math.PI*2;gem(30.9+WR*Math.cos(a),75+WR*Math.sin(a),.5)}
    /* scattered below, denser toward the bottom, never on the wheel */
    const sc=[];for(let k=0;k<400&&sc.length<58;k++){const x=2.6+r()*56.6,y=52+Math.pow(r(),.7)*49,s=.3+r()*r()*.55;
      if(Math.hypot(x-30.9,y-75)<21.3+s)continue;if(y>96&&(x<5+(y-96)||x>56.8-(y-96)))continue;if(sc.some(([a,b,c])=>Math.hypot(a-x,b-y)<c+s+.9))continue;sc.push([x,y,s])}
    sc.forEach(([x,y,s])=>gem(x,y,s));
    const glint=[];for(let k=0;k<7;k++){const p=k<3?per[(r()*per.length)|0]:sc[(r()*sc.length)|0];if(p)glint.push('<path transform="translate('+(p[0]+.15).toFixed(2)+' '+(p[1]-.15).toFixed(2)+') scale('+(1.1+r()*1.1).toFixed(2)+') rotate('+(r()*20-10).toFixed(1)+')" d="M0-1Q.1-.1 1 0Q.1.1 0 1Q-.1.1-1 0Q-.1-.1 0-1Z" fill="#fff" opacity=".95"/>')}
    return '<defs><radialGradient id="rsc" cx=".5" cy=".42" r=".6"><stop offset="0" stop-color="#F4F8FC"/><stop offset=".7" stop-color="#B9C8D7"/><stop offset="1" stop-color="#7F94AA"/></radialGradient>'
      +'<radialGradient id="rsg" cx=".38" cy=".34" r=".72"><stop offset="0" stop-color="#FFFFFF"/><stop offset=".32" stop-color="#EEF5FC"/><stop offset=".62" stop-color="#BDD2E6"/><stop offset=".86" stop-color="#7E9AB8"/><stop offset="1" stop-color="#5E7894"/></radialGradient>'
      +'<symbol id="rs" viewBox="-1.3 -1.3 2.6 2.6"><ellipse cx=".12" cy=".22" rx="1.12" ry="1.1" fill="#3E5F86" opacity=".28"/><circle r="1.12" fill="url(#rsc)"/><circle r=".9" fill="url(#rsg)"/>'
      +'<path d="M0-.9L.26-.26L.9 0L.26.26L0 .9L-.26.26L-.9 0L-.26-.26Z" fill="#fff" opacity=".5"/><path d="M-.64-.64L0-.3L.64-.64L.3 0L.64.64L0 .3L-.64.64L-.3 0Z" fill="#9FB8D2" opacity=".35"/>'
      +'<circle r=".3" fill="#F7FBFF"/><circle cx="-.34" cy="-.4" r=".17" fill="#fff"/><circle r=".9" fill="none" stroke="#6E88A6" stroke-width=".07" opacity=".7"/></symbol></defs>'+U.join("")+glint.join("")},
  /* lavender: a pearly glitter over the whole body and glossy faceted stickers: an emerald, stars, a crystal heart,
     a gold flower, a round pink stone, a cut lavender stone and a button */
  iplav:()=>{const r=ipRnd(23);let gl="";
    for(let k=0;k<900;k++){const x=r()*61.8,y=r()*103.5,q=r(),s=.06+q*q*.22,c=q>.93?"#FFE3F6":q>.86?"#DDF3FF":"#FFFFFF";gl+='<circle cx="'+x.toFixed(2)+'" cy="'+y.toFixed(2)+'" r="'+s.toFixed(3)+'" fill="'+c+'" opacity="'+(.35+q*.6).toFixed(2)+'"/>'}
    for(let k=0;k<14;k++){const x=r()*61.8,y=r()*103.5,z=.5+r()*.8;gl+='<path transform="translate('+x.toFixed(2)+' '+y.toFixed(2)+') scale('+z.toFixed(2)+')" d="M0-1Q.08-.08 1 0Q.08.08 0 1Q-.08.08-1 0Q-.08-.08 0-1Z" fill="#fff" opacity=".85"/>'}
    const star=(x,y,R,rot,c1,c2,c3)=>{let f="";const pts=[];for(let i=0;i<10;i++){const a=-Math.PI/2+i*Math.PI/5,rr=i%2?R*.47:R;pts.push([rr*Math.cos(a),rr*Math.sin(a)])}
      for(let i=0;i<10;i++){const a=pts[i],b=pts[(i+1)%10];f+='<path d="M0,0L'+a[0].toFixed(3)+','+a[1].toFixed(3)+'L'+b[0].toFixed(3)+','+b[1].toFixed(3)+'Z" fill="'+(i%2?c2:c1)+'"/>'}
      return '<g transform="translate('+x+' '+y+') rotate('+rot+')" filter="url(#sh)"><path d="'+IP_STAR(R,.47)+'" fill="'+c3+'"/>'+f+'<path d="'+IP_STAR(R,.47)+'" fill="none" stroke="'+c3+'" stroke-width="'+(R*.06).toFixed(3)+'" opacity=".7"/><ellipse cx="'+(-R*.18).toFixed(2)+'" cy="'+(-R*.38).toFixed(2)+'" rx="'+(R*.16).toFixed(2)+'" ry="'+(R*.08).toFixed(2)+'" fill="#fff" opacity=".85" transform="rotate(-30)"/></g>'};
    const heart='M0 3.3C-.6 2.6-3.6.6-3.6-1.4A1.9 1.9 0 0 1 0-2.3A1.9 1.9 0 0 1 3.6-1.4C3.6.6.6 2.6 0 3.3Z';
    return '<defs><filter id="sh" x="-30%" y="-30%" width="160%" height="170%"><feDropShadow dx=".18" dy=".4" stdDeviation=".35" flood-color="#4B2A92" flood-opacity=".45"/></filter>'
      +'<radialGradient id="hg" cx=".35" cy=".3" r=".8"><stop offset="0" stop-color="#FF9CCB"/><stop offset=".5" stop-color="#EC3E8D"/><stop offset="1" stop-color="#B01762"/></radialGradient>'
      +'<radialGradient id="fg" cx=".4" cy=".35" r=".7"><stop offset="0" stop-color="#FFE7A3"/><stop offset=".6" stop-color="#F4B63E"/><stop offset="1" stop-color="#C9811A"/></radialGradient>'
      +'<radialGradient id="pg" cx=".38" cy=".34" r=".75"><stop offset="0" stop-color="#FFE0EC"/><stop offset=".45" stop-color="#F6A3C1"/><stop offset="1" stop-color="#C9608A"/></radialGradient>'
      +'<linearGradient id="eg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#C8F5B0"/><stop offset=".5" stop-color="#7FCF66"/><stop offset="1" stop-color="#3E9A3A"/></linearGradient>'
      +'<linearGradient id="lg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#FBF6FF"/><stop offset=".55" stop-color="#E3D3FA"/><stop offset="1" stop-color="#B9A2EA"/></linearGradient>'
      +'<radialGradient id="bg" cx=".4" cy=".35" r=".75"><stop offset="0" stop-color="#C9B8FA"/><stop offset="1" stop-color="#8E74E4"/></radialGradient></defs>'
      +'<g opacity=".9">'+gl+'</g>'
      /* emerald, top left */
      +'<g transform="translate(5.4 5.4) rotate(-14)" filter="url(#sh)"><path d="M-2.2-1.2L-1.4-1.9H1.4L2.2-1.2V1.2L1.4 1.9H-1.4L-2.2 1.2Z" fill="#3F9A3C"/><path d="M-2.2-1.2L-1.4-1.9H1.4L2.2-1.2L1.4-.9H-1.4Z" fill="#D2F7BE"/><path d="M2.2-1.2V1.2L1.4.9V-.9Z" fill="#5DB34E"/><path d="M-2.2-1.2V1.2L-1.4.9V-.9Z" fill="#9BE07E"/><path d="M-1.4-.9H1.4V.9H-1.4Z" fill="url(#eg)"/><path d="M-1.1-.7H.2L-.6.2H-1.1Z" fill="#fff" opacity=".55"/></g>'
      +star(57.6,25,2.4,12,"#F6B7EE","#D776D2","#B4469F")
      /* crystal heart, left */
      +'<g transform="translate(7.6 64) rotate(-12)" filter="url(#sh)"><path d="'+heart+'" fill="url(#hg)"/><path d="M0-2.3L-1.6.2L0 3.3Z" fill="#FF8FC0" opacity=".55"/><path d="M0-2.3L1.6.2L0 3.3Z" fill="#B8145F" opacity=".35"/><path d="M-3.6-1.4L-1.6.2L0-2.3Z" fill="#FFC2DD" opacity=".5"/><ellipse cx="-1.9" cy="-1.5" rx=".8" ry=".35" fill="#fff" opacity=".85" transform="rotate(-35 -1.9 -1.5)"/></g>'
      /* round pink stone */
      +'<g transform="translate(5.6 73.6)" filter="url(#sh)"><circle r="1.25" fill="url(#pg)"/><path d="M0-1.25L.38-.38L1.25 0L.38.38L0 1.25L-.38.38L-1.25 0L-.38-.38Z" fill="#fff" opacity=".35"/><circle cx="-.42" cy="-.48" r=".24" fill="#fff"/></g>'
      /* gold flower */
      +'<g transform="translate(55 57.5) rotate(10)" filter="url(#sh)">'+[0,72,144,216,288].map(a=>'<circle cx="'+(1.35*Math.cos((a-90)*Math.PI/180)).toFixed(2)+'" cy="'+(1.35*Math.sin((a-90)*Math.PI/180)).toFixed(2)+'" r="1.3" fill="url(#fg)"/>').join("")+'<circle r=".95" fill="#FFE59A"/><circle cx="-.3" cy="-.35" r=".3" fill="#fff" opacity=".8"/>'+[0,72,144,216,288].map(a=>'<circle cx="'+(1.6*Math.cos((a-100)*Math.PI/180)).toFixed(2)+'" cy="'+(1.6*Math.sin((a-100)*Math.PI/180)).toFixed(2)+'" r=".28" fill="#fff" opacity=".7"/>').join("")+'</g>'
      +star(59,59.6,.95,0,"#3E6EE8","#2449B8","#1C379A")
      /* cut lavender stone, right */
      +'<g transform="translate(56.6 82) rotate(18)" filter="url(#sh)"><path d="M-1.2-2H1.2L1.9-1.2V1.2L1.2 2H-1.2L-1.9 1.2V-1.2Z" fill="#A58BE6"/><path d="M-1.2-2H1.2L1.9-1.2V1.2L1.2 2H-1.2L-1.9 1.2V-1.2Z" fill="url(#lg)" opacity=".95"/><path d="M-.8-1.2H.8V1.2H-.8Z" fill="#CDB8F6"/><path d="M-1.2-2L-.8-1.2H.8L1.2-2Z" fill="#fff" opacity=".7"/><path d="M1.9-1.2L.8-1.2V1.2L1.9 1.2Z" fill="#9A80DC" opacity=".6"/></g>'
      +star(6.2,91.5,1.5,-14,"#7AD3C2","#3FA898","#2C7F74")
      /* button */
      +'<g transform="translate(8.6 98)" filter="url(#sh)"><circle r="2.1" fill="url(#bg)"/><circle r="1.6" fill="none" stroke="#D8CCFB" stroke-width=".18"/>'+[[-.5,-.5],[.5,-.5],[-.5,.5],[.5,.5]].map(([a,b])=>'<circle cx="'+a+'" cy="'+b+'" r=".3" fill="#6247C4"/>').join("")+'<ellipse cx="-.9" cy="-1.1" rx=".6" ry=".25" fill="#fff" opacity=".6" transform="rotate(-35 -.9 -1.1)"/></g>'
      +star(50.6,97.4,1.1,8,"#FFFFFF","#E3DEF2","#B5ACCF")+star(56.4,96.6,2.3,-10,"#C9A6FA","#9C72EA","#7550C9")}};
/* the set being done sits in the middle of its row; done sets slide off to the left and fade (CSS mask) */
function setsCenter(){const v=$(".f-sets"),t=v&&v.firstElementChild;if(!t)return;
  const c=t.querySelector(".cur")||[...t.querySelectorAll(".dn")].pop()||t.firstElementChild,ip=ipodOn(),
    /* on the iPod screen the row is narrow: it starts at the left, and once it doesn't fit the set being done sits a third of the way in */
    x=ip&&t.scrollWidth<=v.clientWidth?0:ip?Math.min(0,Math.max(v.clientWidth-t.scrollWidth,v.clientWidth/3-(c.offsetLeft+c.offsetWidth/2))):v.clientWidth/2-(c.offsetLeft+c.offsetWidth/2);
  if(run.setsX!=null&&run.setsK===run.ex){t.style.transition="none";t.style.transform="translateX("+run.setsX+"px)";void t.offsetWidth;t.style.transition=""}
  t.style.transform="translateX("+x+"px)";run.setsX=x;run.setsK=run.ex}
/* a move's name may take two lines on its record; one that still doesn't fit shrinks */
function cfFit(){document.querySelectorAll(".cf-card h2").forEach(h=>{h.style.fontSize="";
  for(let k=0;k<14&&(h.scrollHeight>h.clientHeight+4||h.scrollWidth>h.clientWidth+1);k++){const f=parseFloat(getComputedStyle(h).fontSize);if(f<=11)break;h.style.fontSize=Math.max(11,f*.92)+"px"}})}
/* the cover flow is the browser's own scrolling: the records sit in a row of narrow snap slots and CSS turns each one
   by where it is in the row (a scroll-driven animation, after Bramus's CSS Cover Flow demo on
   scroll-driven-animations.style, Apache 2.0, docs/SDA-LICENSE.txt), so the turning runs off the main thread; slot size, angles and reflection as in that demo. Script only clicks as a record passes the middle, brings a tapped record round, and when the
   scrolling stops makes the middle record's move the current one */
function cfBind(sc,list){if(!sc)return;const slots=[...sc.querySelectorAll(".cf-slot")],n=slots.length;if(!n)return;
  const sw=slots[0].offsetWidth||100;
  const idx=()=>Math.max(0,Math.min(n-1,Math.round(sc.scrollLeft/sw)));
  sc.scrollLeft=Math.max(0,list.indexOf(run.ex))*sw;let shown=idx(),lx=sc.scrollLeft,lt=performance.now(),tm=0;
  const done=()=>{clearTimeout(tm);const ex=list[idx()];if(run&&run.askFeel==null&&ex!=null&&ex!==run.ex){run.ex=ex;buzz(8);renderFocus(true)}};
  /* while the row moves the rain fades out (a see-through layer is skipped by the GPU) and comes back once it rests */
  const de=document.documentElement;let mvT=0;const still=()=>{de.classList.remove("cfmove")};
  sc.addEventListener("scroll",()=>{const t=performance.now(),i=idx();if(typeof WX!=="undefined")WX.hold=t+250;if(!de.classList.contains("cfmove"))de.classList.add("cfmove");clearTimeout(mvT);mvT=setTimeout(still,220);if(i!==shown){cfTick(i-shown,Math.abs(sc.scrollLeft-lx)/Math.max(1,t-lt)*1000);buzz(4);shown=i}lx=sc.scrollLeft;lt=t;
    clearTimeout(tm);tm=setTimeout(done,"onscrollend" in window?600:160)},{passive:true});
  if("onscrollend" in window)sc.addEventListener("scrollend",done);
  slots.forEach((el,j)=>el.addEventListener("click",()=>{if(run.askFeel==null&&j!==idx())sc.scrollTo({left:j*sw,behavior:"smooth"})}));
  ["touchstart","touchmove","touchend"].forEach(k=>sc.addEventListener(k,e=>e.stopPropagation(),{passive:true}))}
/* Cover Flow's tick: a band-passed triangle chirp over a breath of noise, panned across as the record passes */
function cfTick(dir,v){try{AC=AC||new (window.AudioContext||window.webkitAudioContext)();const c=AC,t=c.currentTime,vn=Math.min(Math.abs(v)/300,1),pk=.28*(.55+vn*.45),f=1600*(.88+vn*.24),bd=.022-vn*.008,cd=bd*.3,ps=dir<0?.7:-.7;
  const pan=c.createStereoPanner?c.createStereoPanner():null,out=pan||c.destination;if(pan){pan.pan.setValueAtTime(ps,t);pan.pan.linearRampToValueAtTime(-ps,t+bd);pan.connect(c.destination)}
  const bg=c.createGain();bg.gain.setValueAtTime(pk,t);bg.gain.exponentialRampToValueAtTime(1e-4,t+bd);bg.connect(out);
  const fl=c.createBiquadFilter();fl.type="bandpass";fl.frequency.value=f;fl.Q.value=6;fl.connect(bg);
  const o=c.createOscillator();o.type="triangle";o.frequency.setValueAtTime(f*1.25,t);o.frequency.exponentialRampToValueAtTime(f*.65,t+bd);o.connect(fl);o.start(t);o.stop(t+bd);
  const ns=Math.ceil(c.sampleRate*cd),nb=c.createBuffer(1,ns,c.sampleRate),d=nb.getChannelData(0);for(let i=0;i<ns;i++)d[i]=(Math.random()*2-1)*Math.exp(-i/(ns*.2));
  const ng=c.createGain();ng.gain.setValueAtTime(pk*.35,t);ng.gain.exponentialRampToValueAtTime(1e-4,t+cd);ng.connect(out);
  const hp=c.createBiquadFilter();hp.type="highpass";hp.frequency.value=2400;hp.connect(ng);const src=c.createBufferSource();src.buffer=nb;src.connect(hp);src.start(t);src.stop(t+cd)}catch(e){}}
/* each move's record is a cover: one of eight soft gradient designs in the skin's own colours, picked from the move's id so a
   move keeps its cover; or, with Effects › records from your songs, the cover of a song you played lately, drawn
   far out of focus so it reads as colour, not as the artwork. Drawn once per skin and cached */
const CF_ART=new Map();
function cfMusicOn(){try{return localStorage.getItem(PK+"cfart")==="1"}catch(e){return false}}
function cfHash(s){let h=2166136261;for(const ch of String(s))h=Math.imul(h^ch.charCodeAt(0),16777619);return h>>>0}
function cfPal(){const pr=document.createElement("i");pr.style.display="none";document.body.appendChild(pr);
  const rd=k=>{pr.style.color="";pr.style.color="var("+k+")";return getComputedStyle(pr).color};
  const cols=[...new Set(["--ac","--push","--pull","--third","--good","--sleep","--bad"].map(rd))],r={cols,ink:rd("--ink"),card:rd("--card"),bg:rd("--bg")};pr.remove();return r}
function cfArt(i){if(document.documentElement.dataset.theme==="eink")return "";const e=run.p.ex[i],de=document.documentElement,music=cfMusicOn()&&typeof MD_COVERS!=="undefined"?MD_COVERS.filter(m=>m.complete&&m.naturalWidth):[],
    cov=music.length?music[i%music.length]:null,key=[de.dataset.theme,de.dataset.mode,e.id,cov?cov.src:cfDes(i)].join("|");
  if(CF_ART.has(key))return CF_ART.get(key);
  const S=480,cv=document.createElement("canvas");cv.width=cv.height=S;const g=cv.getContext("2d");let url="";
  try{if(cov){g.filter="blur(26px)";const k=Math.max(S/cov.naturalWidth,S/cov.naturalHeight)*1.35,cw=cov.naturalWidth*k,ch=cov.naturalHeight*k;g.drawImage(cov,(S-cw)/2,(S-ch)/2,cw,ch);g.filter="none"}
    else cfDesign(g,S,cfHash(e.id),cfPal(),cfDes(i));
    cfFinish(g,S);
    url=cv.toDataURL("image/jpeg",.86)}catch(err){url=""}
  CF_ART.set(key,url);return url}
/* which of the eight designs: the move's own, unless an earlier move of this session has it, then the next free one */
function cfDes(i){const used=new Set();let d=0;for(let j=0;j<=i;j++){d=cfHash(run.p.ex[j].id)%8;for(let k=0;k<8&&used.has(d);k++)d=(d+1)%8;used.add(d)}return d}
/* Apple Music style: two of the skin's colours across the cover at the design's angle, two or three soft clouds of
   the others melted in, a pale wash from the top-left corner (where the words sit, in dark ink) and a deep shadow in
   the bottom-right; two of the eight designs lay a soft grid of round lights over it */
function cfDesign(g,S,h,P,des){let sd=h||1;const rnd=()=>{sd=(Math.imul(sd,1664525)+1013904223)>>>0;return sd/4294967296};
  const pool=P.cols.slice(),pick=()=>pool.length?pool.splice(Math.floor(rnd()*pool.length),1)[0]:P.cols[Math.floor(rnd()*P.cols.length)];
  const c0=pick(),c1=pick(),c2=pick(),c3=pick(),an=des*Math.PI/4+rnd()*.4,dx=Math.cos(an)*S*.7,dy=Math.sin(an)*S*.7;
  g.filter="saturate(1.35)";const lg=g.createLinearGradient(S/2-dx,S/2-dy,S/2+dx,S/2+dy);lg.addColorStop(0,c0);lg.addColorStop(1,c1);g.fillStyle=lg;g.fillRect(0,0,S,S);
  g.filter="blur("+Math.round(S*.1)+"px) saturate(1.35)";[c2,c3,c0].slice(0,2+(des%2)).forEach(c=>{g.globalAlpha=.85;g.fillStyle=c;g.beginPath();g.ellipse(S*(.15+rnd()*.75),S*(.25+rnd()*.7),S*(.22+rnd()*.2),S*(.18+rnd()*.2),rnd()*3,0,7);g.fill()});
  g.globalAlpha=1;g.filter="none";
  if(des===3||des===6){const n=3,r=S/(n*2),gl=g.createLinearGradient(0,0,S,S);gl.addColorStop(0,c2);gl.addColorStop(1,c3);g.filter="blur(1.5px) saturate(1.35)";g.globalAlpha=.7;
    for(let y=0;y<n;y++)for(let x=0;x<n;x++){g.fillStyle=gl;g.beginPath();g.arc(r+x*2*r,r+y*2*r+S*.04,r*.97,0,7);g.fill()}g.globalAlpha=1;g.filter="none"}}
function cfFinish(g,S){const w=g.createRadialGradient(0,0,0,0,0,S*1.05);w.addColorStop(0,"rgba(255,255,255,.7)");w.addColorStop(.38,"rgba(255,255,255,.22)");w.addColorStop(1,"rgba(255,255,255,0)");g.fillStyle=w;g.fillRect(0,0,S,S);
  const d=g.createRadialGradient(S,S,0,S,S,S*.75);d.addColorStop(0,"rgba(12,8,18,.88)");d.addColorStop(.5,"rgba(12,8,18,.35)");d.addColorStop(1,"rgba(12,8,18,0)");g.fillStyle=d;g.fillRect(0,0,S,S)}
/* a move just finished: its record shrinks into the done stack, which gives a little bump */
function cfFly(){const c=$(".cf-fly"),m=$(".cf-mini");if(!c)return;
  if(!m||matchMedia("(prefers-reduced-motion: reduce)").matches){c.remove();return}
  const r=c.getBoundingClientRect(),q=m.getBoundingClientRect();c.style.setProperty("--fx",(q.left+q.width/2-r.left-r.width/2).toFixed(0)+"px");c.style.setProperty("--fy",(q.top+q.height/2-r.top-r.height/2).toFixed(0)+"px");
  requestAnimationFrame(()=>requestAnimationFrame(()=>c.classList.add("go")));
  setTimeout(()=>{c.remove();m.classList.remove("got");void m.offsetWidth;m.classList.add("got")},520)}
/* the feel bar: tap or drag across four bricks; let go and it's kept (touch again within a moment to change it) */
function feelBind(el){if(!el)return;const bks=[...el.querySelectorAll(".fl-bks i")],lab=el.querySelector(".fl-lab");let lv=0,drag=0,tm=0;
  const show=n=>{if(n===lv)return;lv=n;bks.forEach((b,i)=>b.classList.toggle("on",i<n));const f=FEEL4[n-1];lab.textContent=T(f[1],f[2]);el.setAttribute("aria-valuenow",n);el.dataset.lv=n;SFX.detent();buzz(6)};
  const at=x=>{const r=el.querySelector(".fl-bks").getBoundingClientRect();return Math.max(1,Math.min(4,Math.ceil((x-r.left)/r.width*4)))};
  const commit=()=>{if(!run||run.askFeel==null||!lv)return;const id=run.p.ex[run.askFeel].id;run.doc.feel=run.doc.feel||{};run.doc.feel[id]=FEEL4[lv-1][0];lsSave();
    run.askFeel=null;SFX.land();buzz(12);const nx=run.sets.findIndex(x=>x.some(y=>!y.d));if(nx>=0)run.ex=nx;renderFocus(true)};
  el._show=show;el._commit=commit;
  ["touchstart","touchmove","touchend"].forEach(k=>el.addEventListener(k,e=>e.stopPropagation(),{passive:true}));
  el.addEventListener("pointerdown",e=>{clearTimeout(tm);drag=1;el.setPointerCapture(e.pointerId);show(at(e.clientX))});
  el.addEventListener("pointermove",e=>{if(drag)show(at(e.clientX))});
  const up=()=>{if(!drag)return;drag=0;clearTimeout(tm);tm=setTimeout(commit,650)};
  el.addEventListener("pointerup",up);el.addEventListener("pointercancel",up);
  el.addEventListener("keydown",e=>{if(e.key==="ArrowRight"||e.key==="ArrowLeft"){e.preventDefault();show(Math.max(1,Math.min(4,(lv||0)+(e.key==="ArrowRight"?1:-1))))}else if(e.key==="Enter")commit()})}
function tickSet(v){const a=run.sets[run.ex],ci=curSet();if(ci<0)return;if(!(+(v!=null?v:a[ci].v)>0)){dropRunSet(ci);return}a[ci].o=maxOrdOf(run.doc)+1;a[ci].d=true;if(v!=null)a[ci].v=v;lsSave();if(typeof wxMark==="function")wxMark();
  SFX.tick();buzz(18);
  const e=run.p.ex[run.ex];
  if(!a.every(x=>x.d))celebrate(1,0);
  if(a.every(x=>x.d)){SFX.ex();buzz([20,40,30]);popper();celebrate(3,a.some((x,i)=>+x.v>+(run.p.ex[run.ex].target||0))?1:0);
    if(e.unit!=="分钟"){run.askFeel=run.ex;renderFocus();return}
    {const nx=run.sets.findIndex(x=>x.some(y=>!y.d));if(nx>=0)run.ex=nx;renderFocus(true);return}}
  renderFocus(true)}
/* a set can go: hold its chip (done or not), or bring its number down to 0, where the big button turns into ×.
   Nothing is ever kept at 0; a move left with no sets counts as skipped (the engine eases it next time) */
function dropRunSet(i){const arr=run.sets[run.ex],x=arr[i];if(!x)return;
  if(x.o){const o=x.o;Object.values(run.doc.sets).forEach(a2=>a2.forEach(y=>{if(y.o>o)y.o--}))}
  arr.splice(i,1);run.doc.edited=true;run.setsX=null;lsSave();SFX.tap();buzz([10,30,10]);
  if(!x.d&&arr.length&&arr.every(y=>y.d)){SFX.ex();if(run.p.ex[run.ex].unit!=="分钟")run.askFeel=run.ex}
  /* a move counts as done only with sets actually done. Every done set gone (logged by mistake), or no set left at all:
     the move is back among the ones still to do, with its planned sets if none is left, and without its feel */
  if(!arr.some(y=>y.d)&&(x.d||!arr.length)){const e=run.p.ex[run.ex];if(!arr.length)for(let k=0;k<(e.sets||1);k++)arr.push({v:e.target,d:false});
    if(run.doc.feel)delete run.doc.feel[e.id];if(run.askFeel===run.ex)run.askFeel=null;run.stk="todo";lsSave()}
  renderFocus(true)}
function setsHold(){document.querySelectorAll(".fs-track i[data-i]").forEach(ch=>{let tm=0,x0=0,y0=0;
  const end=()=>{clearTimeout(tm);tm=0;ch.classList.remove("hold")};
  ch.addEventListener("pointerdown",e=>{clearTimeout(tm);x0=e.clientX;y0=e.clientY;ch.classList.add("hold");tm=setTimeout(()=>{tm=0;run.held=Date.now();ch.classList.add("gone");buzz(20);setTimeout(()=>{if(run)dropRunSet(+ch.dataset.i)},200)},550)});
  ch.addEventListener("pointermove",e=>{if(tm&&Math.hypot(e.clientX-x0,e.clientY-y0)>10)end()});
  ["pointerup","pointercancel"].forEach(k=>ch.addEventListener(k,end))})}
function untick(i){if(Date.now()-(run.held||0)<800)return;const x=run.sets[run.ex][i];if(!x||!x.d)return;x.d=false;
  if(x.o){const o=x.o;delete x.o;Object.values(run.doc.sets).forEach(arr=>arr.forEach(y=>{if(y.o>o)y.o--}))}
  lsSave();SFX.tap();renderFocus(true)}
function finishRun(){run.finished=1;clearInterval(clockT);clearInterval(run.ipTm);run.ipT=null;const p=run.p,secs=Math.floor((Date.now()-run.t0)/1000);
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
  if(typeof wxPaint==="function")wxPaint(c,W,H,t);
  return cv}
function finShare(t){t=t||today();const back=$("#sheet").classList.contains("on")&&$("#sheetBody").dataset.day===t;
  const name=T("训练","training")+"-"+t+".png",blobOf=()=>new Promise(res=>drawTrain(t).toBlob(res,"image/png"));
  openSheet('<div class="sh-h"><h3>'+T('分享图片','Share picture')+'</h3><button class="mini" data-act="close">'+ICON.x+'</button></div><img class="shimg" alt="">'
    +'<div class="row" style="gap:10px;margin-top:14px"><button class="btn ghost" type="button" data-shsave style="flex:1">'+T('存到相册','Save to photos')+'</button><button class="btn" type="button" data-shgo style="flex:1">'+ICON.share+T('分享','Share')+'</button></div>');
  if(back)SHEET_UP=()=>p1OpenDay(t);
  $("#sheet .shimg").src=drawTrain(t).toDataURL("image/jpeg",.85);shareImgBind(blobOf,name)}

/* ---------- diet view ---------- */
/* food records, seven days to a card, older ones stacked underneath (finger right goes back) */
let dietGrp=0;
function dietDays(){const t=today();return Object.keys(state.diet).filter(d=>d<t).sort().reverse()}
function dietCard(g){const all=dietDays(),keys=all.slice(g*7,g*7+7);
  if(!keys.length)return '<section class="card"><p class="eyebrow" style="margin-bottom:4px">'+T('归档','Archive')+'</p><p class="empty">'+T('还没有以前的饮食记录','No earlier food logs yet')+'</p></section>';
  const md=d=>(dateObj(d).getMonth()+1)+'.'+dateObj(d).getDate();
  return '<section class="card"><div class="row" style="margin-bottom:4px"><p class="eyebrow sp">'+T('归档','Archive')+'</p><span class="muted" style="font-size:12px;font-weight:600">'+md(keys[keys.length-1])+' – '+md(keys[0])+'</span>'+(g?'<button class="fsreset" data-act="dietnow" style="margin-left:8px" aria-label="'+T('回到最近','Back to the latest')+'">'+ICON.reset+'</button>':'')+'</div><div class="dl">'+keys.map(d=>{const a=intakeOf(d),g=dietGapOf(d);
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
/* the ring on the Today card: a short tap steps protein → carbs → fat → veg → calories (remembered), a hold sets that
   one's daily target (settings.pg for protein, settings.dg[k] for the rest; blank follows the default where there is one) */
const RING=[{k:"p",zh:"蛋白质",en:"Protein",u:"g",c:"var(--sleep)"},{k:"c",zh:"碳水",en:"Carbs",u:"g",c:"var(--third)"},{k:"f",zh:"总脂肪",en:"Fat",u:"g",c:"var(--pull)"},{k:"veg",zh:"蔬菜",en:"Veg",u:"g",c:"var(--good)"},{k:"kcal",zh:"总热量",en:"Calories",u:"kcal",c:"var(--ink)"}];
let ringHeld=0;
function ringK(){let k="p";try{k=localStorage.getItem(PK+"ring")||"p"}catch(e){}return RING.some(r=>r.k===k)?k:"p"}
function ringDef(k,t){if(k==="p")return proteinRec(t);if(k==="veg")return 400;if(k==="kcal"){const b=burnOfDate(t);return b!=null?Math.round(b):null}return null}
function ringGoal(k,t){if(k==="p")return proteinNeed(t);const v=+((state.settings.dg||{})[k]);return v>0?v:ringDef(k,t)}
function ringVal(k,t){if(k==="p")return proteinOf(t);if(k==="kcal")return intakeOf(t);const d=state.diet[t];if(!d||!d.items||!d.items.length||!d.items.some(it=>numVal(it[k])!=null))return null;return dietTotals(d)[k]}
function ringHtml(t){const m=RING.find(r=>r.k===ringK()),v=ringVal(m.k,t),g=ringGoal(m.k,t),pp=v!=null&&g?v/g:0;
  return '<div class="ring dring" id="protRing" data-act="ringnext" role="button" tabindex="0" aria-label="'+T(m.zh,m.en)+'">'+ringSvg(76,8,pp,m.c,"var(--sub)")+'<span class="rl"><span class="rk">'+T(m.zh,m.en)+'</span><b class="n" style="font-size:16px;font-weight:800">'+(v!=null?fmt(Math.round(v)):"–")+'</b><br><span class="muted" style="font-size:10px;font-weight:600">/ '+(g?fmt(Math.round(g)):"–")+' '+m.u+'</span></span></div>'}
/* only the ring (and its word in the legend) changes; the rest of the page, the gap card's bricks among it, stays put */
function ringSwap(){const r=$("#protRing");if(!r)return;const t=document.createElement("div");t.innerHTML=ringHtml(today());const n=t.firstElementChild;r.replaceWith(n);
  const m=RING.find(x=>x.k===ringK()),lg=$("#ringLeg");if(lg)lg.innerHTML='<i style="background:'+m.c+'"></i>'+T(m.zh,m.en);
  animateRings(n.parentNode);holdOpen(n,()=>{ringHeld=Date.now();openTarget(ringK())})}
function openTarget(k){if(k==="p"){openProtein();return}const m=RING.find(r=>r.k===k),t=today(),def=ringDef(k,t),own=+((state.settings.dg||{})[k])>0?+state.settings.dg[k]:"";
  const S=p1Sheet(T(m.zh+"目标",m.en+" target"),'<label class="flabel">'+T("每天（"+m.u+"）","Per day ("+m.u+")")+'<input id="dgv" type="number" inputmode="numeric" step="1" min="0" value="'+own+'" placeholder="'+(def!=null?def:"")+'"></label>'
    +(def!=null?'<p class="muted" style="font-size:12px;margin-top:8px">'+(k==="kcal"?T("留空就用当天的消耗。","Leave blank to use the day's burn."):T("留空就用推荐值。","Leave blank to follow the recommendation."))+'</p>':''));
  S.q("[data-ok]").addEventListener("click",()=>{const v=Math.round(+S.q("#dgv").value),dg=Object.assign({},state.settings.dg||{});if(v>0)dg[k]=v;else delete dg[k];state.settings.dg=dg;lsSave();S.close();ringSwap();toast(T(m.zh+"目标已保存",m.en+" target saved"))})}
/* arranging a page's cards, as on Stats: a hold puts the page into editing (cards wiggle): drag one up or down to move
   it, × hides it, + brings a hidden one back, ✓ ends. Each page keeps {order, hidden} in settings (dtiles for Diet,
   ttiles for Training) */
const ARR={diet:{key:"dtiles",view:"#v-diet",cards:[{k:"today",zh:"今天",en:"Today"},{k:"gap",zh:"热量缺口",en:"Calorie gap"},{k:"arch",zh:"归档",en:"Archive"}],render:()=>renderDietView()},
  train:{key:"ttiles",view:"#v-train",cards:[{k:"hero",zh:"训练",en:"Training"},{k:"cal",zh:"日历",en:"Calendar"}],render:()=>renderTrainView()}};
let arrEdit=null;
function arrCfg(id){const t=state.settings[ARR[id].key]||{};return {order:t.order||[],hidden:t.hidden||[]}}
function arrList(id){const c=arrCfg(id),D=ARR[id].cards,pos=k=>{const i=c.order.indexOf(k);return i<0?100+D.findIndex(m=>m.k===k):i},all=D.slice().sort((a,b)=>pos(a.k)-pos(b.k));
  return {shown:all.filter(m=>!c.hidden.includes(m.k)),hidden:all.filter(m=>c.hidden.includes(m.k))}}
function arrHtml(id,html){const ed=arrEdit===id,{shown,hidden}=arrList(id);
  return '<div class="dtiles'+(ed?' editing':'')+'" data-arr="'+id+'">'+shown.map(m=>'<div class="dtile" data-k="'+m.k+'">'+html[m.k]()+(ed?'<span class="tx" data-act="arrhide" data-arr="'+id+'" data-k="'+m.k+'" role="button" aria-label="'+T('隐藏','Hide')+'">'+ICON.x+'</span>':'')+'</div>').join("")+'</div>'
    +(ed?'<div class="tilebar">'+(hidden.length?'<button class="fsreset" data-act="arradd" data-arr="'+id+'" aria-label="'+T('加回卡片','Add a card back')+'">'+ICON.plus+'</button>':'')+'<button class="fsreset" data-act="arrdone" data-arr="'+id+'" aria-label="'+T('完成','Done')+'">'+ICON.check+'</button></div>':'')}
function arrSave(id,c){state.settings[ARR[id].key]=c;lsSave()}
function arrBind(id){const box=$(ARR[id].view+" .dtiles");if(!box)return;let tm=0,drag=null;
  box.addEventListener("pointerdown",e=>{const t=e.target.closest(".dtile");if(!t||e.target.closest(".tx")||e.target.closest("#protRing"))return;
    if(arrEdit!==id){clearTimeout(tm);const x=e.clientX,y=e.clientY;tm=setTimeout(()=>{tm=0;arrEdit=id;buzz(15);fsEatClick();ARR[id].render()},500);
      const cancel=ev=>{if(ev.type!=="pointermove"||Math.hypot(ev.clientX-x,ev.clientY-y)>10){clearTimeout(tm);off()}};
      const off=()=>{["pointermove","pointerup","pointercancel"].forEach(k=>removeEventListener(k,cancel))};["pointermove","pointerup","pointercancel"].forEach(k=>addEventListener(k,cancel));return}
    e.preventDefault();drag={t,y:e.clientY,moved:false};t.setPointerCapture(e.pointerId);t.classList.add("drag")});
  box.addEventListener("pointermove",e=>{if(!drag)return;const dy=e.clientY-drag.y;if(Math.abs(dy)>6)drag.moved=true;drag.t.style.transform="translateY("+dy+"px) scale(1.02)";
    drag.t.style.pointerEvents="none";const o=document.elementFromPoint(e.clientX,e.clientY),ot=o&&o.closest(".dtiles .dtile");drag.t.style.pointerEvents="";
    if(ot&&ot!==drag.t&&box.contains(ot)){const rb=ot.getBoundingClientRect(),before=e.clientY<rb.top+rb.height/2,r1=drag.t.getBoundingClientRect();box.insertBefore(drag.t,before?ot:ot.nextSibling);
      const r2=drag.t.getBoundingClientRect();drag.y+=r2.top-r1.top;drag.t.style.transform="translateY("+(e.clientY-drag.y)+"px) scale(1.02)";buzz(6)}});
  const end=()=>{if(!drag)return;const t=drag.t,moved=drag.moved;drag=null;t.classList.remove("drag");t.style.transform="";
    if(moved){fsEatClick();const c=arrCfg(id),keys=[...box.querySelectorAll(".dtile")].map(x=>x.dataset.k);c.order=keys.concat(c.order.filter(k=>!keys.includes(k)));arrSave(id,c)}};
  box.addEventListener("pointerup",end);box.addEventListener("pointercancel",end)}
function renderDietView(){const v=$("#v-diet"),t=today();
  const tin=intakeOf(t),tb=burnOfDate(t),gap=tin!=null&&tb!=null?tb-tin:null;
  const y=ymdAdd(t,-1),yg=dietGapOf(y);
  let hero='<section class="card"><div class="row" style="align-items:flex-start"><div class="sp dtoday" data-act="day" data-d="'+t+'" role="button" tabindex="0" aria-label="'+T('今天的饮食','Today\'s food')+'">';
  if(gap!=null)hero+='<p class="eyebrow">'+T('今天 · ','Today · ')+(gap>=0?T("缺口","deficit"):T("盈余","surplus"))+'</p><div class="big" style="color:'+(gap>=0?"var(--good)":"var(--bad)")+'">'+fmt(Math.abs(gap))+'<small>kcal</small></div><p class="muted" style="font-size:12px;margin-top:4px">'+T('摄入 ','In ')+fmt(tin)+T(' · 消耗 ',' · burn ')+fmt(tb)+'</p>';
  else if(tin!=null)hero+='<p class="eyebrow">'+T('今天 · 摄入','Today · intake')+'</p><div class="big">'+fmt(tin)+'<small>kcal</small></div><p class="muted" style="font-size:12px;margin-top:4px">'+T('消耗等手表同步','Burn waits for the watch')+(yg!=null?T(' · 昨天缺口 ',' · yesterday ')+fmt(yg):'')+'</p>';
  else hero+='<p class="eyebrow">'+T('今天','Today')+'</p><div class="big" style="font-size:26px">'+T('还没记','Nothing yet')+'</div><p class="muted" style="font-size:12px;margin-top:4px">'+(yg!=null?T('昨天'+(yg>=0?'缺口 ':'盈余 '),'Yesterday '+(yg>=0?'deficit ':'surplus '))+fmt(Math.abs(yg))+' kcal':T('点这里记一笔','Tap here to log'))+'</p>';
  hero+='</div>'+ringHtml(t)+'</div>';
  if(tin!=null&&tb!=null){const mx=Math.max(tin,tb),m=RING.find(r=>r.k===ringK());hero+='<div class="ib"><i style="width:'+(tin/mx*100)+'%;background:var(--ink)"></i><i style="width:'+(Math.max(0,tb-tin)/mx*100)+'%;background:var(--good);opacity:.35"></i></div>'
    +'<div class="legend"><span><i style="background:var(--ink)"></i>'+T('摄入','Intake')+'</span><span><i style="background:var(--good);opacity:.5"></i>'+T('缺口','Deficit')+'</span><span id="ringLeg" style="margin-left:auto"><i style="background:'+m.c+'"></i>'+T(m.zh,m.en)+'</span></div>'}
  hero+='</section>';
  v.innerHTML='<div class="ptr" id="ptr" aria-hidden="true"><i></i></div>'+arrHtml("diet",{today:()=>hero,gap:gapCardHtml,arch:dietListHtml});
  animateRings(v);if($('.fstack[data-fs="diet"]'))fsBind("diet",DIET_FS);holdOpen($("#protRing"),()=>{ringHeld=Date.now();openTarget(ringK())});arrBind("diet")}
/* the gap card: swipe it sideways (or tap a dot) to step through 7, 14, 30 days and since the first log; the
   big figure turns over like a split-flap board. Only finished days count (the window ends yesterday). */
const GAP_RANGES=[3,7,14,30,60,90,0];
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
/* the main move's tile: tap its title to step through its views, best set of the last 7, 12, 30 sessions, then the
   weekly total over 4, 8, 12 weeks (remembered); the rest of the tile opens the chart */
const MAIN_VIEWS=[["s",7],["s",12],["s",30],["w",4],["w",8],["w",12]];
let mainView=1;try{const v=+localStorage.getItem(PK+"mainv");if(v>=0&&v<MAIN_VIEWS.length&&localStorage.getItem(PK+"mainv")!==null)mainView=v}catch(e){}
function wkMon(d){return ymdAdd(d,-((dateObj(d).getDay()+6)%7))}
function brickUnit(mx){return [1,2,5,10,20,25,50,100,200,500].find(u=>mx/u<=9)||1000}
function weeklyData(n){n=n||12;const m=mainEx();if(m.custom)return null;const by={};
  const add=(d,sets)=>(sets||[]).forEach(x=>{if(x&&x.d){const w=wkMon(d);by[w]=(by[w]||0)+(+x.v||0)}});
  Object.values(state.sessions).forEach(x=>{if(!x)return;const d=x.date||today();add(d,x.sets&&x.sets[m.id]);(x.xs||[]).forEach(it=>{if(it.id===m.id)add(d,it.sets)})});
  Object.entries(state.dayx||{}).forEach(([d,x])=>((x&&x.xs)||[]).forEach(it=>{if(it.id===m.id)add(d,it.sets)}));
  const first=Object.keys(by).filter(w=>by[w]>0).sort()[0];if(!first)return null;
  const cur=wkMon(today()),weeks=[];for(let i=n-1;i>=0;i--){const w=ymdAdd(cur,-7*i);if(w>=first)weeks.push(w)}
  return {weeks,vals:weeks.map(w=>by[w]||0)}}
function mainCardHtml(){let [kind,n]=MAIN_VIEWS[mainView];const u=mainUnit(),M=METRICS[0],dec=M.dec,W=kind==="w"?weeklyData(n):null;if(kind==="w"&&!W)kind="s";
  const foot=(a,unit,b)=>'<div class="row muted bkf"><span>'+a+'</span><span class="sp" style="text-align:center"><i class="kd" style="background:var(--pull)"></i>= '+unit+' '+u+'</span><span>'+b+'</span></div>';
  let head,body;
  if(W){const {weeks,vals}=W,mx=Math.max(...vals),best=vals.lastIndexOf(mx),tot=vals.reduce((a,b)=>a+b,0),unit=brickUnit(mx);
    head='<span class="tl"><i style="background:var(--pull)"></i>'+T('每周总数 · '+n+' 周','Weekly total · '+n+' weeks')+'</span>'
      +'<span class="tv">'+fmt(tot)+'<small>'+u+'</small></span><span class="td muted">'+T('本周 ','This week ')+fmt(vals[vals.length-1])+' '+u+'</span>';
    body=bricksHtml(vals.map((v,k)=>({n:v?Math.max(1,Math.round(v/unit)):0,c:k===best?"var(--push)":"var(--pull)",t:T(dayLabel(weeks[k])+' 那周 · ',dayLabel(weeks[k])+' week · ')+fmt(v)+' '+u})))
      +foot(dayLabel(weeks[0]),unit,T('本周','This week'))}
  else{const all=mainSeries(),pts=all.slice(-n),last=all[all.length-1];
    head='<span class="tl"><i style="background:var(--pull)"></i>'+mainName()+T(' · 最近 '+n+' 次',' · last '+n)+'</span>'
      +'<span class="tv">'+(last?last.y.toFixed(dec)+'<small>'+u+'</small>':'–')+'</span>'+(last?deltaOf(M,all):'<span class="td muted">'+T('还没有数据','No data yet')+'</span>');
    if(pts.length){const mx=Math.max(...pts.map(p=>p.y)),unit=brickUnit(mx),best=pts.map(p=>p.y).lastIndexOf(mx);
      body=bricksHtml(pts.map((p,k)=>({n:p.y>0?Math.max(1,Math.round(p.y/unit)):0,c:k===best?"var(--push)":"var(--pull)",t:dayLabel(p.date)+' · '+(+p.y).toFixed(dec)+' '+u})))
        +foot(dayLabel(pts[0].date),unit,dayLabel(pts[pts.length-1].date))}else body=''}
  /* the head (title, figure, line under it) switches the view; only the bricks open the chart */
  return '<section class="card mcard"><span class="bkread n" aria-live="polite"></span><div class="mview" data-act="mainv" role="button" tabindex="0" aria-label="'+T('换视图','Change the view')+'">'+head+'</div>'
    +(body?'<div class="mbody" data-act="metric" data-k="pull" role="button" aria-label="'+T('打开图表','Open the chart')+'">'+body+'</div>':'')+'</section>'}
function flapHtml(txt){return '<span class="flap">'+[...txt].map((c,i)=>'<span style="--i:'+i+'">'+c+'</span>').join("")+'</span>'}
function gapCardHtml(){const {from,to,days,gaps}=gapData();
  /* long windows draw one bar per week so the bars stay readable */
  let cols=days.map((d,i)=>({g:gaps[i],l:days.length<=14?WD[dateObj(d).getDay()]:""}));
  if(days.length>31){cols=[];for(let i=0;i<days.length;i+=7){const ch=gaps.slice(i,i+7).filter(g=>g!=null);cols.push({g:ch.length?ch.reduce((a,b)=>a+b,0)/ch.length:null,l:""})}}
  const cm=Math.max(300,...cols.filter(c=>c.g!=null).map(c=>Math.abs(c.g)));
  return '<section class="card gapcard" id="gapCard">'+gapHeadHtml()
    +'<div class="gchart" data-act="intake" role="button" aria-label="'+T('摄入与消耗','Intake vs burn')+'">'+bricksHtml(cols.map(c=>({n:c.g==null?0:Math.max(1,Math.round(Math.abs(c.g)/cm*8)),c:c.g==null?"":c.g>=0?"var(--good)":"var(--bad)",l:c.l})),true)+'</div>'
    +(days.length?'<div class="row muted" style="font-size:11px;font-weight:600;margin-top:6px"><span>'+dayLabel(from)+'</span><span class="sp"></span><span>'+dayLabel(to)+'</span></div>':'')
    +'</section>'}
/* the head of the gap card (and of the intake panel): the period, the total and its fat; tap it for the next period */
function gapHeadHtml(inSheet){const {from,to,days,known,sum}=gapData(),R=gapR;
  const label=R?T('过去 '+R+' 天','Last '+R+' days'):T('有记录以来 '+days.length+' 天','Since the first log · '+days.length+' days');
  const w=known.length?fatWord(sum/7700,from,to):"about",word=(LANG==="en"?{about:"about ",high:"aggressive: ",low:"conservative: "}:{about:"约 ",high:"激进估计 ",low:"保守估计 "})[w];
  return '<div class="row gaphead'+(inSheet?' ihead':'')+'" data-act="gapr" role="button" tabindex="0" aria-label="'+T('换时间范围','Change the period')+'"><div class="sp"><p class="eyebrow">'+label+(known.length<days.length?T(' · 记了 '+known.length+' 天',' · '+known.length+' logged'):'')+'</p>'
    +'<div class="big">'+flapHtml(known.length?(sum>=0?"":"+")+fmt(Math.abs(sum)):"–")+'<small>kcal '+(sum>=0?T("缺口","deficit"):T("盈余","surplus"))+'</small></div></div>'
    +(known.length?'<span class="pill gpill '+(sum>=0?"good":"bad")+'"><span>'+(w==="about"?word:'')+(Math.abs(sum)/7700).toFixed(2)+T(' kg 脂肪',' kg fat')+'</span>'+(w==="about"?'':'<small>'+word.replace(/[:：]?\s*$/,'')+'</small>')+'</span>':'')+'</div>'}
/* tap the head of the gap card to step through 7, 14, 30 days and since the first log (the figure turns over like a
   split-flap board); hold the card for intake against burn, day by day, in a panel with the same periods */
let gapHeld=0;
function gapSet(r){gapR=r;try{localStorage.setItem(PK+"gw",String(gapR))}catch(e){}}
function gapNext(){gapSet(GAP_RANGES[(GAP_RANGES.indexOf(gapR)+1)%GAP_RANGES.length]);if($("#ichart"))openIntake.redraw();const c=$("#gapCard");if(c){c.outerHTML=gapCardHtml();gapBind()}SFX.tap();buzz(6)}
function gapBind(){}
/* intake (ink) and burn (green) as two lines, the space between them a bar per day (green where burn was higher, a
   deficit; red where intake was, a surplus), resting burn (BMR) dashed; drag across it to read a day */
function intakeSvg(days,W,H){const L=34,R=10,TP=10,B=22,pts=days.map(d=>{const a=intakeOf(d);return {d,a,b:a==null?null:burnOfDate(d)}});
  const vals=pts.flatMap(p=>[p.a,p.b]).filter(v=>v!=null);let lo=1200,hi=2600;if(vals.length){lo=Math.min(lo,Math.floor(Math.min(...vals)/200)*200);hi=Math.max(hi,Math.ceil(Math.max(...vals)/200)*200)}
  const n=days.length,step=(W-L-R)/Math.max(1,n-1),x=i=>L+i*step,y=v=>TP+(hi-v)/(hi-lo)*(H-TP-B);let g="";
  for(let v=lo;v<=hi;v+=(hi-lo>1600?400:200))g+='<line x1="'+L+'" x2="'+(W-R)+'" y1="'+y(v).toFixed(1)+'" y2="'+y(v).toFixed(1)+'" stroke="var(--line)" stroke-width="1"/><text x="'+(L-5)+'" y="'+(y(v)+3.5).toFixed(1)+'" text-anchor="end">'+v+'</text>';
  const lab=n<=14?2:n<=31?7:Math.ceil(n/5);days.forEach((d,i)=>{if((n-1-i)%lab===0)g+='<text x="'+x(i).toFixed(1)+'" y="'+(H-6)+'" text-anchor="middle">'+(+d.slice(5,7))+'.'+(+d.slice(8))+'</text>'});
  const bw=Math.max(2,Math.min(10,step*.6));
  pts.forEach((p,i)=>{if(p.a!=null&&p.b!=null){const t=Math.min(y(p.a),y(p.b)),h=Math.abs(y(p.a)-y(p.b));g+='<rect x="'+(x(i)-bw/2).toFixed(1)+'" y="'+t.toFixed(1)+'" width="'+bw.toFixed(1)+'" height="'+Math.max(1,h).toFixed(1)+'" rx="1.5" fill="'+(p.b>=p.a?"var(--good)":"var(--bad)")+'" fill-opacity=".3"/>'}});
  const path=k=>{let d="",on=false;pts.forEach((p,i)=>{if(p[k]==null){on=false;return}d+=(on?"L":"M")+x(i).toFixed(1)+" "+y(p[k]).toFixed(1);on=true});return d};
  const bm=days.map(bmrOfDate);g+='<path d="'+bm.map((v,i)=>(i?"L":"M")+x(i).toFixed(1)+" "+y(v).toFixed(1)).join("")+'" fill="none" stroke="var(--muted)" stroke-width="1.3" stroke-dasharray="4 3"/>';
  g+='<path d="'+path("b")+'" fill="none" stroke="var(--good)" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/><path d="'+path("a")+'" fill="none" stroke="var(--ink)" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/>';
  const r=n>31?1.3:2.2;pts.forEach((p,i)=>{if(p.b!=null)g+='<circle cx="'+x(i).toFixed(1)+'" cy="'+y(p.b).toFixed(1)+'" r="'+r+'" fill="var(--good)"/>';if(p.a!=null)g+='<circle cx="'+x(i).toFixed(1)+'" cy="'+y(p.a).toFixed(1)+'" r="'+r+'" fill="var(--ink)"/>'});
  g+='<line class="ixh" x1="0" x2="0" y1="'+TP+'" y2="'+(H-B)+'" stroke="var(--ink)" stroke-opacity=".35" visibility="hidden"/>';
  return {svg:'<svg class="isvg" viewBox="0 0 '+W+' '+H+'" role="img" aria-label="'+T('摄入与消耗','Intake vs burn')+'" font-size="9" fill="var(--muted)">'+g+'</svg>',pts,x,step,L}}
function openIntake(){const draw=()=>{const {days}=gapData(),ch=intakeSvg(days,340,210);
    $("#sheetBody").innerHTML='<div class="sh-h"><h3>'+T('摄入与消耗','Intake vs burn')+'</h3><button class="mini" data-act="close">'+ICON.x+'</button></div>'
      +gapHeadHtml(true)
      +'<div class="chart ichart" id="ichart">'+ch.svg+'<span class="tip" id="itip"></span></div>'
      +'<div class="legend" style="margin-top:10px"><span><i style="background:var(--ink)"></i>'+T('摄入','Intake')+'</span><span><i style="background:var(--good)"></i>'+T('消耗','Burn')+'</span><span><i style="background:var(--muted)"></i>'+T('基础代谢','BMR')+'</span></div>';
    const el=$("#ichart"),tip=$("#itip"),xh=el.querySelector(".ixh");
    const show=e=>{const r=el.getBoundingClientRect(),sx=((e.touches?e.touches[0].clientX:e.clientX)-r.left)/r.width*340,i=Math.max(0,Math.min(ch.pts.length-1,Math.round((sx-ch.L)/ch.step))),p=ch.pts[i];
      xh.setAttribute("x1",ch.x(i));xh.setAttribute("x2",ch.x(i));xh.setAttribute("visibility","visible");const gp=p.a!=null&&p.b!=null?p.b-p.a:null;
      tip.textContent=dayLabel(p.d)+'  '+T('摄入 ','In ')+(p.a!=null?fmt(Math.round(p.a)):"–")+' · '+T('消耗 ','Burn ')+(p.b!=null?fmt(Math.round(p.b)):"–")+(gp==null?'':' · '+(gp>=0?T('缺口 ','Deficit '):T('盈余 ','Surplus '))+fmt(Math.abs(Math.round(gp))));
      tip.style.left=Math.max(70,Math.min(r.width-70,ch.x(i)/340*r.width))+"px";tip.classList.add("on")};
    el.addEventListener("pointerdown",show);el.addEventListener("pointermove",e=>{if(e.buttons||e.pointerType==="touch")show(e)});
    el.addEventListener("pointerup",()=>setTimeout(()=>{tip.classList.remove("on");xh.setAttribute("visibility","hidden")},1400))};
  openSheet("");draw();openIntake.redraw=draw}
/* food table: opening Diet pulls it quietly (not again within half a minute); pulling the page down pulls it now */
function syncSpin(on){$("#syncDot").classList.toggle("spin",on)}
async function dietPull(manual){let st={};try{st=JSON.parse(localStorage.getItem(SHEET_STATUS_K)||"{}")||{}}catch(e){}
  let url="";try{url=localStorage.getItem(SHEET_URL_K)||""}catch(e){}
  if(!manual&&(!url||(st.ok&&st.ts&&Date.now()-st.ts<30e3)))return;
  syncSpin(true);const r=await pullSheetQuiet({silent:!manual});syncSpin(false);
  if(r.ok&&cur==="diet")renderDietView()}
(function(){let y0=null,dy=0;const lim=70;
  document.addEventListener("touchstart",e=>{if(cur!=="diet"||run||scrollY>0||$("#sheet").classList.contains("on")||document.querySelector(".mask"))return;y0=e.touches[0].clientY;dy=0},{passive:true});
  /* only while actually pulling down at the top: a normal scroll must not touch styles on every move (that made
     every frame restyle the whole page) */
  let lastH=-1;
  document.addEventListener("touchmove",e=>{if(y0==null)return;if(scrollY>0){y0=null;return}dy=Math.max(0,e.touches[0].clientY-y0);const h=Math.round(Math.min(lim,dy*.5));if(h===lastH)return;lastH=h;
    const p=$("#ptr");if(p){p.style.height=h?h+"px":"";p.classList.toggle("ready",dy*.5>=lim-4)}},{passive:true});
  document.addEventListener("touchend",()=>{lastH=-1;if(y0==null)return;const p=$("#ptr"),go=dy*.5>=lim-4;y0=null;if(p){p.style.height="";p.classList.remove("ready")}if(go){buzz(12);dietPull(true)}})})();
function daySheet(d){const day=state.diet[d]||{},items=day.items||[],tt=dietTotals(day),a=intakeOf(d),b=burnOfDate(d),g=dietGapOf(d);
  const f1=x=>x==null||x===""?"–":(+x).toFixed(0);
  openSheet('<div class="sh-h"><h3>'+dayLabel(d)+(/^\d/.test(dayLabel(d))?"":' · '+(dateObj(d).getMonth()+1)+'.'+dateObj(d).getDate())+'</h3>'+(items.length?'<button class="mini" data-act="dshare" data-d="'+d+'" aria-label="'+T('分享成图片','Share as a picture')+'">'+ICON.share+'</button>':'')+'<button class="mini" data-act="close">'+ICON.x+'</button></div>'
    +'<div class="row" style="margin-bottom:16px"><div class="sp"><p class="eyebrow">'+T('摄入','Intake')+'</p><b class="n" style="font-size:22px;font-weight:800">'+fmt(a)+'</b></div><div class="sp"><p class="eyebrow">'+T('消耗','Burn')+'</p><b class="n" style="font-size:22px;font-weight:800">'+fmt(b)+'</b></div>'
    +'<div class="sp"><p class="eyebrow">'+(g==null||g>=0?T("缺口","Deficit"):T("盈余","Surplus"))+'</p><b class="n" style="font-size:22px;font-weight:800;color:'+(g==null?"inherit":g>=0?"var(--good)":"var(--bad)")+'">'+(g==null?"–":fmt(Math.abs(g)))+'</b></div></div>'
    +(!items.length&&d===today()&&intakeOf(d)==null?'<p class="empty">'+T('今天还没记','Nothing logged today')+'</p>':items.length?'<table class="tbl"><tr><th>'+T('食物','Food')+'</th><th>'+T('蛋白','Prot.')+'</th><th>'+T('脂肪','Fat')+'</th><th>'+T('碳水','Carbs')+'</th><th>'+T('蔬菜','Veg')+'</th><th>kcal</th></tr>'+items.map(it=>'<tr><td>'+escHtml(it.name||"")+'</td><td>'+f1(it.p)+'</td><td>'+f1(it.f)+'</td><td>'+f1(it.c)+'</td><td>'+f1(it.veg)+'</td><td>'+f1(it.kcal)+'</td></tr>').join("")
      +(items.length>1?'<tr class="tot"><td>'+T('合计','Total')+'</td><td>'+f1(tt.p)+'</td><td>'+f1(tt.f)+'</td><td>'+f1(tt.c)+'</td><td>'+f1(tt.veg)+'</td><td>'+f1(tt.kcal)+'</td></tr>':'')+'</table>':'<p class="empty">'+T('这天只记了总数','Only a total that day')+'</p>')
    +(day.note?'<p class="muted" style="font-size:12px;margin-top:12px">'+escHtml(day.note)+'</p>':'')
    +(d===today()?'<button class="btn" style="margin-top:16px;height:46px;font-size:15px" data-act="go" data-to="diet:'+d+'">'+ICON.plus+T('记一笔','Log food')+'</button>':'<button class="btn ghost" style="margin-top:16px;height:46px;font-size:15px" data-act="go" data-to="diet:'+d+'">'+ICON.pen+T('编辑这天','Edit this day')+'</button>'))}

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
  {k:"wt",name:T("体重","Weight"),unit:"kg",c:"var(--push)",up:0,pts:()=>avg7(wtMerged()),raw:()=>wtMerged(),dec:1,sub:T("7 日均","7-day avg"),rec:"rec:weight",sync:1},
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
function lineSvg(pts,W,H,col,cls,pad,rng){pad=pad||4;if(pts.length<2)return '<svg class="'+cls+'" viewBox="0 0 '+W+' '+H+'"></svg>';
  const xs=pts.map(p=>p.x),ys=pts.map(p=>p.y),x0=Math.min(...xs),x1=Math.max(...xs),lo=rng?rng[0]:Math.min(...ys),hi=rng?rng[1]:Math.max(...ys),sp=(hi-lo)||1;
  const P=pts.map(p=>[(x1===x0?W/2:(p.x-x0)/(x1-x0)*W),pad+(1-(p.y-lo)/sp)*(H-2*pad)]);const id="g"+(++GID),line=smoothPath(P),last=P[P.length-1];
  return '<svg class="'+cls+'" viewBox="0 0 '+W+' '+H+'" preserveAspectRatio="none"><defs><linearGradient id="'+id+'" x1="0" x2="0" y1="0" y2="1"><stop offset="0" style="stop-color:'+col+';stop-opacity:.28"/><stop offset="1" style="stop-color:'+col+';stop-opacity:0"/></linearGradient></defs>'
    +'<path d="'+line+'L'+W+' '+H+'L0 '+H+'Z" fill="url(#'+id+')"/><path d="'+line+'" fill="none" stroke="'+col+'" stroke-width="2.2" stroke-linecap="round" vector-effect="non-scaling-stroke"/>'
    +'<circle cx="'+last[0]+'" cy="'+last[1]+'" r="3.5" fill="var(--card)" stroke="'+col+'" stroke-width="2" vector-effect="non-scaling-stroke"/></svg>'}
function recent(pts,days){const t=dnum(today());return days?pts.filter(p=>p.x>t-days):pts}
/* the change over the period shown: the latest value against the first one inside the same window the chart draws
   (recent()), so the arrow always agrees with the line */
function deltaOf(m,pts,days){days=days==null?30:days;if(pts.length<2)return "";const win=recent(pts,days),last=pts[pts.length-1],ref=win.length?win[0]:null;
  if(!ref||ref===last)return "";
  const span=days?days+T(' 天',' days'):T('全部','all time');
  const d=last.y-ref.y;if(Math.abs(d)<(m.dec?.05:.5))return '<span class="td muted">'+span+T(' 持平',' flat')+'</span>';
  const good=(d>0)===!!m.up;return '<span class="td" style="color:'+(good?"var(--good)":"var(--bad)")+'">'+(d>0?"↑ ":"↓ ")+Math.abs(d).toFixed(m.dec)+' '+m.unit+' · '+span+'</span>'}
function goalsHtml(){const st=state.settings,gap=gapAllTime();
  const pu=pullSeries(),wt=avg7(wtMerged()),wz=series("waist");
  const G=[{k:mainEx().id==="pullup"?"pullups":"main:"+mainEx().id,rec:"pullups",n:mainName().replace(/^标准/,"").replace(/^Strict /,""),c:"var(--pull)",cur:pu.length?pu[pu.length-1].y:null,start:0,tg:+st.p||null,u:mainUnit()},
    {k:"waist",rec:"waist",n:T("腰围","Waist"),c:"var(--ac)",cur:wz.length?wz[wz.length-1].y:null,start:wz.length?wz[0].y:null,tg:+st.z||null,u:"cm"},
    {k:"weight",rec:"weight",n:T("体重","Weight"),c:"var(--sleep)",cur:wt.length?+wt[wt.length-1].y.toFixed(1):null,start:wt.length?wt[0].y:null,tg:+st.w||null,u:"kg"},
    {k:"fat",n:T("减脂","Fat loss"),c:"#FFB020",cur:gap?+(gap.s/7700).toFixed(1):null,start:0,tg:+st.fat||null,u:"kg"}];
  return '<section class="dark"><div class="row" style="margin-bottom:14px"><p class="eyebrow sp">'+T('目标','Goals')+'</p></div><div class="goals4">'+G.map(g=>{
    const pct=g.tg&&g.cur!=null&&g.start!=null&&g.start!==g.tg?Math.max(0,Math.min(1,(g.cur-g.start)/(g.tg-g.start))):0;
    if(g.tg&&g.cur!=null)milestone(g.k,pct*100,g.n);
    return '<button data-act="goal"'+(g.rec?' data-rec="'+g.rec+'"':'')+'><span class="ring">'+ringSvg(66,7,pct,g.c,"var(--track)")+'<span class="rl"><b class="n" style="font-size:15px;font-weight:800">'+(g.tg?Math.round(pct*100)+"%":"–")+'</b></span></span>'
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
  const tiles=shown.map(m=>{if(m.k==="pull")return '<div class="tile wide tstack" data-k="pull">'+mainCardHtml()+(tileEdit?'<span class="tx" data-act="thide" data-k="pull" role="button" aria-label="'+T('隐藏','Hide')+'">'+ICON.x+'</span>':'')+'</div>';const all=m.pts(),pts=recent(all,30),last=all[all.length-1];
    /* only the chart opens the full chart; a tile with no chart yet opens on a tap anywhere */
    const ch=pts.length>1,tag=ch?'div':'button';
    return '<'+tag+' class="tile'+(m.wide?" wide":"")+'"'+(ch?'':' data-act="metric"')+' data-k="'+m.k+'"><span class="tl"><i style="background:'+m.c+'"></i>'+m.name+(m.sub?' · '+m.sub:'')+'</span>'
      +'<span class="tv">'+(last?last.y.toFixed(m.dec)+'<small>'+m.unit+'</small>':'–')+'</span>'+(last?deltaOf(m,all):'<span class="td muted">'+T('还没有数据','No data yet')+'</span>')
      +(ch?'<span class="tchart" data-act="metric" data-k="'+m.k+'" role="button" aria-label="'+T('打开图表','Open the chart')+'">'+lineSvg(pts,m.wide?320:150,m.wide?64:44,m.c,"spark")+'</span>':'')
      +(tileEdit?'<span class="tx" data-act="thide" data-k="'+m.k+'" role="button" aria-label="'+T('隐藏','Hide')+'">'+ICON.x+'</span>':'')+'</'+tag+'>'}).join("");
  v.innerHTML=goalsHtml()+'<div class="bento'+(tileEdit?' editing':'')+'">'+tiles+'</div>'
    +(tileEdit?'<div class="tilebar">'+(hidden.length?'<button class="fsreset" data-act="tadd" aria-label="'+T('加回图表','Add a chart back')+'">'+ICON.plus+'</button>':'')+'<button class="fsreset" data-act="tdone" aria-label="'+T('完成','Done')+'">'+ICON.check+'</button></div>':'');
  animateRings(v);tileBind();goalHolds(v)}
/* a goal ring held opens its manual log (pull-ups or the main move, waist, weight); fat loss is worked out, so it has none */
let goalHeld=0;
function goalHolds(v){v.querySelectorAll(".goals4 [data-act=goal]").forEach(b=>holdOpen(b,()=>{goalHeld=Date.now();if(b.dataset.rec)openRecord(b.dataset.rec)}))}
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
/* a metric's panel: the period over the figure (tap there for the next period), the chart with its scale at the left;
   a finger along the chart reads each day into the figure, a line and a dot marking it. Logging or syncing is an icon
   beside the title */
const M_RANGES=[7,14,30,60,90,0];
function metricSheet(k){const m=METRICS.find(x=>x.k===k);
  const draw=()=>{const all=m.pts(),pts=recent(all,chartRange),last=all[all.length-1],W=340,H=200,pad=14;
    const lab=chartRange?T('过去 '+chartRange+' 天','Last '+chartRange+' days'):T('全部','All time');
    const raw=m.raw?recent(m.raw(),chartRange):null,ys=pts.map(p=>p.y).concat(raw?raw.map(p=>p.y):[]),lo=ys.length?Math.min(...ys):0,hi=ys.length?Math.max(...ys):0,yOf=v=>(pad+(1-(v-lo)/((hi-lo)||1))*(H-2*pad))/H*100;
    const px0=pts.length?pts[0].x:0,px1=pts.length?pts[pts.length-1].x:1,xOf=x=>(x-px0)/((px1-px0)||1)*100,dots=raw?raw.filter(p=>p.x>=px0&&p.x<=px1).map(p=>'<i class="mraw" style="left:'+xOf(p.x).toFixed(2)+'%;top:'+yOf(p.y).toFixed(2)+'%;--c:'+m.c+'"></i>').join(""):'';
    const ticks=pts.length>1?[hi,(hi+lo)/2,lo].map(v=>'<span class="mtick" style="top:'+yOf(v).toFixed(2)+'%"><b>'+(+v).toFixed(m.dec)+'</b></span>').join(""):'';
    const syncB='<button class="circ msyncb" data-act="msync" aria-label="'+T('从高驰同步','Sync from COROS')+'"><i class="puck"><i class="syncdot"></i></i></button>',recBtn=(m.sync?syncB:'')+(m.rec?(m.rec==="sync"?syncB:'<button class="mini" data-act="go" data-to="'+m.rec+'" aria-label="'+T('记一笔','Log')+'">'+ICON.plus+'</button>'):'');
    $("#sheetBody").innerHTML='<div class="sh-h"><h3>'+m.name+'</h3><button class="mini" data-act="close">'+ICON.x+'</button></div>'
      +'<div class="mhead" data-act="mrange" role="button" tabindex="0" aria-label="'+T('换时间范围','Change the period')+'"><p class="eyebrow" id="mLab">'+lab+'</p><div class="big" id="mBig">'+(last?last.y.toFixed(m.dec):"–")+'<small>'+m.unit+'</small></div><div id="mDelta">'+(last?deltaOf(m,all,chartRange):'')+'</div></div>'
      +(pts.length>1?'<div class="chart mchart" id="chart">'+ticks+lineSvg(pts,W,H,m.c,"",pad,[lo,hi])+dots+'<i class="mcur" aria-hidden="true"></i><i class="mdot" aria-hidden="true" style="--c:'+m.c+'"></i></div>'
        +'<div class="row muted" style="font-size:11px;font-weight:600;margin-top:6px"><span>'+dayLabel(pts[0].date)+'</span><span class="sp"></span><span>'+dayLabel(pts[pts.length-1].date)+'</span></div>'
        +'<div class="row mfoot"><span class="pill">'+T('最低 ','Low ')+lo.toFixed(m.dec)+'</span><span class="pill">'+T('最高 ','High ')+hi.toFixed(m.dec)+'</span><span class="pill">'+pts.length+T(' 个记录',' records')+'</span><span class="sp"></span>'+recBtn+'</div>'
        :'<p class="empty">'+T('这段时间不够两个记录','Fewer than two records in this period')+'</p><div class="row mfoot"><span class="sp"></span>'+recBtn+'</div>');
    /* the log and sync buttons are the size of the close button, whatever the skin makes that */
    {const cl=$("#sheetBody .sh-h [data-act=close]");if(cl){const w=cl.offsetWidth,h=cl.offsetHeight;document.querySelectorAll("#sheetBody .mfoot>button").forEach(x=>{x.style.width=w+"px";x.style.height=h+"px";x.style.minWidth=w+"px"})}}
    syncMirror();const ch=$("#chart");if(ch)scrubber(ch,pts,m,{lab,last,yOf,raw:raw&&raw.filter(p=>p.x>=px0&&p.x<=px1)})};
  openSheet("");draw();metricSheet.redraw=draw}
function scrubber(el,pts,m,o){const xs=pts.map(p=>p.x),x0=Math.min(...xs),x1=Math.max(...xs),cur=el.querySelector(".mcur"),dot=el.querySelector(".mdot"),L=$("#mLab"),B=$("#mBig"),D=$("#mDelta");let tm=0,hold=0,shown=null,sx=0,sy=0;
  const raw=o.raw&&o.raw.length?o.raw:null,rec=m.rec&&m.rec.startsWith("rec:")?m.rec.slice(4):null;
  const near=(arr,fx)=>{let best=arr[0];arr.forEach(p=>{if(Math.abs(p.x-fx)<Math.abs(best.x-fx))best=p});return best};
  const show=e=>{const r=el.getBoundingClientRect(),cx=(e.touches?e.touches[0].clientX:e.clientX)-r.left,fx=x0+(cx/r.width)*(x1-x0);
    const best=near(raw||pts,fx);if(best===shown)return;shown=best;clearTimeout(tm);
    const px=(best.x-x0)/((x1-x0)||1)*100;cur.style.left=dot.style.left=px+"%";dot.style.top=o.yOf(best.y)+"%";el.classList.add("on");
    L.textContent=dayLabel(best.date);B.innerHTML=best.y.toFixed(m.dec)+'<small>'+m.unit+'</small>';
    if(raw){const a=near(pts,best.x);D.innerHTML='<span class="td muted">'+T('7 日均 ','7-day avg ')+a.y.toFixed(m.dec)+' '+m.unit+'</span>';D.style.visibility=""}else D.style.visibility="hidden";buzz(3)};
  const back=()=>{clearTimeout(tm);clearTimeout(hold);tm=setTimeout(()=>{shown=null;el.classList.remove("on");L.textContent=o.lab;B.innerHTML=(o.last?o.last.y.toFixed(m.dec):"–")+'<small>'+m.unit+'</small>';D.innerHTML=o.last?deltaOf(m,m.pts(),chartRange):'';D.style.visibility=""},1500)};
  el.addEventListener("pointerdown",e=>{try{el.setPointerCapture(e.pointerId)}catch(err){}sx=e.clientX;sy=e.clientY;show(e);
    /* a hold on a day opens that day's record to change it (manual metrics only) */
    clearTimeout(hold);if(rec)hold=setTimeout(()=>{const d=shown&&shown.date;if(!d)return;buzz(15);openRecord(rec,d,()=>{if(metricSheet.redraw&&$("#chart"))metricSheet.redraw()})},550)});
  el.addEventListener("pointermove",e=>{if(Math.hypot(e.clientX-sx,e.clientY-sy)>10)clearTimeout(hold);if(e.buttons||e.pointerType==="touch")show(e)});
  el.addEventListener("pointerup",back);el.addEventListener("pointercancel",back)}

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
const TH_V=11;
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
function iconSheet(){const cur=iconSym();
  openSheet('<div class="sh-h"><h3>'+T('App 图标','App icon')+'</h3><button class="mini info" data-act="theory" aria-expanded="false" aria-label="'+T('说明','About')+'">i</button><button class="mini" data-act="close">'+ICON.x+'</button></div>'
    +'<div class="theory" hidden><p>'+T('颜色跟着主题走，图案自己选。主屏幕上已经装好的图标不会马上变：安卓一般过一两天自己换，iPhone 要把博G从主屏幕删掉、再重新添加一次。','The colour follows the theme; the symbol is yours. An icon already on the home screen doesn\'t change at once: Android usually swaps it within a day or two; on iPhone remove bG from the home screen and add it again.')+'</p></div>'
    +'<div class="icgrid">'+ICON_SYMS.map(k=>'<button class="icopt" data-act="iconpick" data-k="'+k+'" aria-pressed="'+(k===cur)+'"><img src="'+iconSrc(k)+'" alt="'+k+'"></button>').join("")+'</div>')}
/* the blind box is the app icon with its card tucked down inside the envelope; opening lifts the card out until the
   picture is exactly the icon. Three cut-outs of the one picture: the back, the card (moves), the two front flaps */
const ENVELOPE=(B=>'<span class="ev" aria-hidden="true"><i class="ev-back"'+B+'></i><i class="ev-hole"></i><i class="ev-card"'+B+'></i><i class="ev-front"'+B+'></i></span>')(' style="background-image:url(ICONSRC)"');
function boxBtnHtml(){const n=boxLeft().length;return '<button class="boxbtn'+(n&&coinTotal()>=BOX_G?' can':'')+'" type="button" data-act="box" aria-label="'+T('主题盲盒','Theme blind box')+'">'+ENVELOPE.replace(/ICONSRC/g,iconSrc())+(n?'<i class="boxn n">'+n+'</i>':'')+'</button>'}
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
    +'<div class="setlist">'
    +'<button class="opt" data-act="go" data-to="p1:weather">'+(typeof wxIcon==="function"?wxIcon("sunc"):ICON.rain)+'<span class="sp">'+T('天气','Weather')+'</span>'+ICON.right+'</button>'
    +sw("glass",glassOn(),ICON.spark,T('半透明玻璃','Translucent glass'))+sw("dust",dustOn(),ICON.dust,T('两天没练就落灰','Dust after two days off'))
    +sw("fx",fxOn(),ICON.spark,T('庆祝效果','Celebrations'))+sw("cfart",cfMusicOn(),ICON.music,T('动作唱片用常听的歌（需 Spotify）','Move records from songs you play (needs Spotify)'))+sw("groove",grooveOn(),ICON.music,T('音乐律动（需 Spotify）','Move with the music (needs Spotify)'))+'</div>');CUR_SHEET=fxSheet}
function meSheet(){SHEET_UP=null;let m="auto";try{m=localStorage.getItem(PK+"mode")||"auto"}catch(e){}
  const row=(to,ic,t)=>'<button class="opt" data-act="go" data-to="'+to+'">'+ic+'<span class="sp">'+t+'</span>'+ICON.right+'</button>';
  openSheet('<div class="sh-h"><h3>'+T('设定','Settings')+'</h3><button class="mini" data-act="close">'+ICON.x+'</button></div><p class="eyebrow" style="margin-bottom:8px">'+T('外观','Appearance')+'</p>'
    +'<div class="setlist">'+("fixed" in document.documentElement.dataset?[]:[["auto",T("跟随手机","Match the phone")],["light",T("亮","Light")],["dark",T("暗","Dark")]]).map(([k,l])=>'<button class="opt" data-act="mode" data-m="'+k+'" aria-pressed="'+(m===k)+'">'+l+'</button>').join("")
    +'<button class="opt" data-act="fxmenu">'+ICON.spark+'<span class="sp">'+T('特效','Effects')+'</span>'+ICON.right+'</button>'
    +'<button class="opt" data-act="iconmenu"><img class="opt-ic" src="'+iconSrc()+'" alt=""><span class="sp">'+T('App 图标','App icon')+'</span>'+ICON.right+'</button>'
    +'<button class="opt" data-act="shop">'+ICON.palette+'<span class="sp">'+T('G 分商店','barGain store')+'</span><b class="n" style="font-size:14px">'+gShow(coinTotal())+' G</b>'+ICON.right+'</button></div>'
    +'<p class="eyebrow" style="margin:18px 0 8px">'+T('语言','Language')+'</p><div class="seg langseg" translate="no">'+[["zh","简中"],["zht","繁中"],["en","Eng"]].map(([k,l])=>'<button data-act="lang" data-l="'+k+'" aria-pressed="'+((HANT?"zht":LANG)===k)+'">'+l+'</button>').join("")+'</div>'
    +'<p class="eyebrow" style="margin:18px 0 8px">'+T('更多','More')+'</p><div class="setlist">'
    +row("p1:plan",ICON.spark,T("训练计划","Training plan"))+row("p1:profile",ICON.user,T("个人资料","Profile"))+row("p1:goals",ICON.target,T("目标","Goals"))+row("p1:backup",ICON.cloud,T("备份进度与高驰","Backup & COROS"))+row("p1:charts",BRAND.co,T("图表、同步和手表热量","Charts, sync & watch calories"))+'<button class="opt" data-act="advmenu">'+ICON.sliders+'<span class="sp">'+T("进阶","Advanced")+'</span>'+ICON.right+'</button>'+'</div>'
    +'<p class="muted" style="font-size:11px;text-align:center;margin-top:18px">'+T('博G ','bG ')+($("#ver")?$("#ver").textContent:"")+'</p>');CUR_SHEET=meSheet}

/* ---------- header, dock, routing ---------- */
/* the page title shrinks to fit beside the header buttons (wide theme fonts, long English words) */
function paintHeader(v){const d=new Date();$("#today").textContent=LANG==="en"?["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"][d.getDay()]+", "+MON_EN[d.getMonth()]+" "+d.getDate():(d.getMonth()+1)+"月"+d.getDate()+"日 周"+WD[d.getDay()];
  /* the page's title is its icon from the dock, drawn large; the name stays for screen readers */
  const t=$("#title"),ic=document.querySelector('.dock [data-v="'+v+'"] svg');t.innerHTML=ic?ic.outerHTML:"";t.setAttribute("aria-label",{train:T("训练","Train"),diet:T("饮食","Diet"),prog:T("统计","Stats")}[v]);
  let ls="";try{ls=localStorage.getItem("tracktor-lastsync")||""}catch(e){}$("#syncDot").classList.toggle("ok",ls.startsWith(today()))}
function placePc(anim){const b=document.querySelector('.dock [aria-selected="true"]'),pc=document.querySelector(".dock .pc");if(!b)return;
  if(!anim)pc.style.transition="none";pc.style.width=b.offsetWidth+"px";pc.style.transform="translateX("+(b.offsetLeft-6)+"px)";pc.style.left="6px";if(!anim){void pc.offsetWidth;pc.style.transition=""}}
let cur="train";
/* with the calendar folded on the training page there is room: the mini player grows into a big card */
function miniSize(){document.body.classList.toggle("mini-big",cur==="train"&&!monthOpen)}
function show(v,anim,keep){if(anim)einkFlash();cur=v;dustApply();miniSize();document.querySelectorAll(".view").forEach(x=>x.classList.toggle("on",x.id==="v-"+v));
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
/* panel copies of the sync button (.msyncb) show exactly what the header's shows: its light, its turning or breathing */
function syncMirror(){const d=$("#syncDot"),b=$("#syncBtn");if(!d)return;document.querySelectorAll(".msyncb").forEach(m=>{const x=m.querySelector(".syncdot");if(x)x.className=d.className;m.classList.toggle("ready",!!(b&&b.classList.contains("ready")))})}
new MutationObserver(syncMirror).observe(document.getElementById("syncDot"),{attributes:true,attributeFilter:["class"]});
if(document.getElementById("syncBtn"))new MutationObserver(syncMirror).observe(document.getElementById("syncBtn"),{attributes:true,attributeFilter:["class"]});
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

document.addEventListener("click",e=>{const b=e.target.closest("[data-act]");if(!b)return;const a=b.dataset.act;if(arrEdit&&b.closest(".dtiles")&&a!=="arrhide")return;
  if(a==="month"){monthOpen=!monthOpen;monthOff=0;weekOff=0;fsRender("cal");miniSize()}
  /* Today: back to this week or month; already there, it opens today */
  else if(a==="caltoday"){monthOff=0;weekOff=0;fsReset("cal")}
  else if(a==="dietnow"){dietGrp=0;fsReset("diet")}
  else if(a==="calsel"){calSel=calSel===b.dataset.d?null:b.dataset.d;SFX.tap();fsRender("cal")}
  else if(a==="start")startRun(b.dataset.sid);
  else if(a==="hreset"){const sid=b.dataset.sid,p=BYID[sid];armTap(b,()=>{p1ResetSession(sid);lsSave();SFX.tap();renderTrainView();toast(LAB(p)+T(' 回到没练的样子',' is back to not done'))},T('再点一次，重置「'+LAB(p)+'」','Tap again to reset '+LAB(p)))}
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
  else if(a==="msync"){/* sync in place: the icon turns while it runs, the chart redraws with what came in */
    if(typeof syncing!=="undefined"&&syncing||p1Syncing)return;if(typeof mcp==="undefined"||!mcp){p1Sync(false);return}buzz(6);
    p1Sync(false).finally(()=>{if($("#sheet").classList.contains("on")&&$("#chart,.mhead")&&metricSheet.redraw)metricSheet.redraw()})}
  else if(a==="mainv"){if(tileEdit)return;mainView=(mainView+1)%MAIN_VIEWS.length;try{localStorage.setItem(PK+"mainv",String(mainView))}catch(err){}SFX.tap();buzz(6);const t=$('.tile[data-k="pull"]');if(t){const k=document.createElement("div");k.innerHTML=mainCardHtml();t.querySelector(".mcard").replaceWith(k.firstElementChild)}}
  else if(a==="mrange"){chartRange=M_RANGES[(M_RANGES.indexOf(chartRange)+1)%M_RANGES.length];SFX.tap();buzz(6);metricSheet.redraw()}
  else if(a==="gapr"){if(Date.now()-gapHeld<800)return;gapNext()}
  else if(a==="intake")openIntake();
  else if(a==="ringnext"){if(Date.now()-ringHeld<800)return;const i=RING.findIndex(r=>r.k===ringK());try{localStorage.setItem(PK+"ring",RING[(i+1)%RING.length].k)}catch(err){}SFX.tap();buzz(6);ringSwap()}
  else if(a==="arrhide"){e.stopPropagation();const id=b.dataset.arr,c=arrCfg(id);if(!c.hidden.includes(b.dataset.k))c.hidden.push(b.dataset.k);arrSave(id,c);SFX.tap();ARR[id].render()}
  else if(a==="arradd"){const id=b.dataset.arr,{hidden}=arrList(id);openSheet('<div class="sh-h"><h3>'+T('加回卡片','Add a card back')+'</h3><button class="mini" data-act="close">'+ICON.x+'</button></div><div class="setlist">'+hidden.map(m=>'<button class="opt" data-act="arrshow" data-arr="'+id+'" data-k="'+m.k+'"><span class="sp">'+T(m.zh,m.en)+'</span>'+ICON.plus+'</button>').join("")+'</div>')}
  else if(a==="arrshow"){const id=b.dataset.arr,c=arrCfg(id);c.hidden=c.hidden.filter(k=>k!==b.dataset.k);arrSave(id,c);closeSheet();ARR[id].render()}
  else if(a==="arrdone"){const id=arrEdit;arrEdit=null;SFX.tap();if(id)ARR[id].render()}
  else if(a==="goal"){if(Date.now()-goalHeld<800)return;bridge("goals")}
  else if(a==="coins")coinSheet(false);
  else if(a==="shop"){const up=b.closest("#sheet")?CUR_SHEET:null;coinSheet(true);SHEET_UP=up}
  else if(a==="go"){if(b.closest("#sheet")&&CUR_SHEET){const cur=CUR_SHEET,up=SHEET_UP;P1_BACK=()=>{cur();SHEET_UP=up}}bridge(b.dataset.to)}
  else if(a==="lang")setLang(b.dataset.l);
  else if(a==="fxmenu"){const up=CUR_SHEET;fxSheet();SHEET_UP=up}
  else if(a==="iconmenu"){const up=CUR_SHEET;iconSheet();SHEET_UP=up}
  else if(a==="iconpick"){try{localStorage.setItem(PK+"icon",b.dataset.k)}catch(err){}iconApply();SFX.tap();buzz(10);const up=SHEET_UP;iconSheet();SHEET_UP=up}
  else if(a==="groove"){const on=!grooveOn();try{localStorage.setItem(PK+"groove",on?"1":"0")}catch(err){}b.setAttribute("aria-checked",on);buzz(8);if(typeof spGroove==="function")spGroove()}
  else if(a==="cfart"){const on=!cfMusicOn();try{localStorage.setItem(PK+"cfart",on?"1":"0")}catch(err){}b.setAttribute("aria-checked",on);buzz(8)}
  else if(a==="glass"){const on=!glassOn();try{localStorage.setItem(PK+"glass",on?"1":"0")}catch(err){}b.setAttribute("aria-checked",on);glassApply();buzz(8)}
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
      /* only this set: the planned numbers for the rest stay put; the engine adjusts after sessions, never mid-session */lsSave();SFX.tap();if(!$(".tickb.skip")!==s.v>0){renderFocus();return}const el=$("#fVal");el.textContent=s.v;el.classList.remove("pop");void el.offsetWidth;el.classList.add("pop");}
    else if(a==="fshare"){SFX.tap();finShare()}
    else if(a==="cfswap"){if(run.askFeel!=null)return;const L=cfLists();if(run.stk==="done"){run.stk="todo";run.ex=L.todo[0]}else{run.stk="done";run.ex=cfLast(L.done)}run.cfIn=1;SFX.tap();buzz(8);renderFocus(true)}
  }});

if("serviceWorker" in navigator)addEventListener("load",()=>navigator.serviceWorker.register("./sw.js").catch(()=>{}));
engPlanAll();
handleCorosCallback();
connectMcp().then(()=>{p1SyncUI();let ls="";try{ls=localStorage.getItem("tracktor-lastsync")||""}catch(e){}
  const t=ls?new Date(ls.replace(" ","T")).getTime():0;if(mcpReady&&(!t||Date.now()-t>2*36e5))p1Sync(true)}).catch(()=>{});
/* words fixed outside the views: the dock, the header buttons, the page language */
function paintLang(){document.documentElement.lang=LANG==="en"?"en":HANT?"zh-Hant":"zh-CN";
  WD.splice(0,7,...(LANG==="en"?WD_EN:WD_ZH));
  document.querySelectorAll(".dock [data-v]").forEach(b=>{const l={diet:T("饮食","Diet"),train:T("训练","Train"),prog:T("统计","Stats")}[b.dataset.v];b.querySelector("span").textContent=l;b.setAttribute("aria-label",l)});
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


