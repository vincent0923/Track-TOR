/* ---------- screen-level UI: tabs, theme, language, effects (flame, fireworks), sound, fullscreen ---------- */
/* ---------- tabs ----------
   Level 1: Train / Charts / Profile. Charts has three views: Diet, Health (sleep, HRV, resting HR)
   and Strength (pull-ups, weight, waist: the body numbers you log yourself). Older installs saved "charts" for the old single chart view. */
const SUBS=["diet","health","strength"];
let dataSub="diet";
try{let t=localStorage.getItem(LS+"-sub");if(t==="charts")t="health";if(SUBS.includes(t))dataSub=t}catch(e){}
function setDataSub(sub){
  dataSub=sub;
  document.querySelectorAll(".subtabs button").forEach(x=>x.setAttribute("aria-selected",x.dataset.sub===sub));
  SUBS.forEach(k=>{document.getElementById("pane-"+k).hidden=k!==sub});
  placePiece(document.querySelector(".subtabs"),true);
  if(sub==="diet"){renderDietAll();dietTabPull()}else renderData();
  try{localStorage.setItem(LS+"-sub",sub)}catch(e){}
}
function setTab(tab){
  document.body.dataset.tab=tab;
  document.querySelectorAll("nav.tabs button").forEach(x=>x.setAttribute("aria-selected",String(x.dataset.tab===tab)));
  ["train","data","me"].forEach(k=>{document.getElementById("pane-"+k).hidden=k!==tab});
  placePiece(document.querySelector("nav.tabs"),true);
  if(tab==="data")setDataSub(dataSub);
  if(tab==="train")renderTrain();
  if(tab==="me")renderData();
  try{localStorage.setItem(LS+"-tab",tab)}catch(err){}
}
document.querySelector(".subtabs").addEventListener("click",e=>{const b=e.target.closest("[data-sub]");if(b)setDataSub(b.dataset.sub)});
document.querySelector("nav.tabs").addEventListener("click",e=>{const b=e.target.closest("[data-tab]");if(b)setTab(b.dataset.tab)});

/* ---------- theme (manual, does not follow the phone) ---------- */
const MOON='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z"/></svg>';
const SUN='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>';
const THEME_IC='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2.5" y="3" width="15" height="15" rx="2.5"/><path d="M6 7h8"/><path d="M6 11v3.5h2.5V11z"/><path d="M21.5 5 13.5 13"/><path d="M13.5 13c-1.6-.4-3 .7-3 2.4 0 1.2-.6 2.1-1.6 2.6 2.6 1 5.8-.2 5.6-3.3"/></svg>';
/* themes: [id, Chinese name, English name, look, preview colours (page, card, accent, second accent)].
   The four looks follow Ovio's worlds (minimal, craft, toy, retro); each look can come in several palettes. */
const THEMES=[
  ["light","浅色","Light","","#E9E5DE #F6F4F0 #546638 #4E6B78"],["dark","深色","Dark","","#0D151C #151F27 #8BA05E #A9B6BA"],
  ["interior","Interior 亮","Interior light","interior","#FAFAFA #FFFFFF #292524 #4568FF"],["interior-dark","Interior 暗","Interior dark","interior","#141312 #1D1D1A #F5F5F4 #93B0FF"],
  ["beui","beUI 亮","beUI light","beui","#FCFCFC #F5F5F5 #0285F7 #00BEBF"],["beui-dark","beUI 暗","beUI dark","beui","#151515 #1C1C1C #00DADB #AD8CFF"],
  ["mech-light","亮色机械","Machine light","mech","#D9DCDF #ECEEF0 #1E7BFF #E87511"],["mech","暗色机械","Machine dark","mech","#25282C #3A3E44 #FF6A13 #5BD45B"],
  ["minimal","极简","Minimal","minimal","#FAFAF8 #FFFFFF #161614 #B5583A"],["minimal-warm","极简·暖","Minimal warm","minimal","#F6ECE5 #FDF8F6 #FF955F #7896CF"],
  ["xmas","圣诞","Christmas","xmas","#E9D9BF #FBF6EE #B3192E #1F5A3A"],
  ["craft","手作","Craft","craft","#EFE7D8 #FBF7EF #E0713A #2F6F9A"],
  ["toy","玩具","Toy","toy","#E3DFD5 #F8F5EF #EF4F2B #2C55E0"],["toy-night","夜间玩具","Toy night","toy","#1C1B19 #292724 #FF5B36 #FFC23D"],
  ["toy-cyber","赛博玩具","Cyber toy","toy","#180E6A #241A7E #F3D21A #D8B9E1"],["woody","牛仔","Cowboy","toy","#E6E2DC #F5F2ED #7B4A2D #F0C050"],
  ["toy-glow","霓虹玩具","Neon toy","toy","#0D1220 #161D30 #B6F23E #FF5FA2"],
  ["retro","复古绿屏","Phosphor","retro","#061108 #0A1F0E #6DFF8A #FFD34D"],["retro-cyber","赛博终端","Cyber terminal","retro","#0C0730 #150D45 #F3D21A #D8B9E1"],
  ["retro-amber","雨夜琥珀","Rain amber","retro","#0B0806 #15100C #FFB347 #2EC4B6"]];
const THEME_IDS=THEMES.map(t=>t[0]);
function skinOf(t){const r=THEMES.find(x=>x[0]===t);return r?r[3]:""}
function applyTheme(t){if(!THEME_IDS.includes(t))t="light";const r=document.documentElement;r.setAttribute("data-theme",t);
  const k=skinOf(t);if(k)r.setAttribute("data-skin",k);else r.removeAttribute("data-skin");
  const b=document.getElementById("themeBtn");b.innerHTML=skinIc("theme")||THEME_IC;paintIcons();
  b.setAttribute("aria-label",T("主题：点一下换下一个，长按打开主题面板","Theme: tap for the next one, hold to open the theme panel"));
  try{localStorage.setItem(LS+"-theme",t)}catch(e){}placePieces(false);renderThemes()}
/* chart lines follow the look: smooth for beUI, toy and craft (monotone cubic: smooth, but never overshooting a peak
   or dipping below a trough the data doesn't have), steps for retro, straight segments otherwise. A null breaks the line. */
const CURVE={beui:"monotone",toy:"monotone",craft:"monotone",xmas:"monotone",retro:"step"};
function linePath(pts){const kind=CURVE[document.documentElement.getAttribute("data-skin")]||"linear",f=v=>v.toFixed(1);
  const runs=[];let r=[];pts.forEach(p=>{if(p)r.push(p);else if(r.length){runs.push(r);r=[]}});if(r.length)runs.push(r);
  return runs.map(r=>{let d="M"+f(r[0].x)+" "+f(r[0].y);if(r.length<2)return d;
    if(kind==="step"){for(let i=1;i<r.length;i++){const m=(r[i-1].x+r[i].x)/2;d+="H"+f(m)+"V"+f(r[i].y)+"H"+f(r[i].x)}return d}
    if(kind==="linear"){for(let i=1;i<r.length;i++)d+="L"+f(r[i].x)+" "+f(r[i].y);return d}
    const n=r.length,s=[],t=new Array(n).fill(0);
    for(let i=0;i<n-1;i++){const h=r[i+1].x-r[i].x;s.push(h?(r[i+1].y-r[i].y)/h:0)}
    t[0]=s[0];t[n-1]=s[n-2];
    for(let i=1;i<n-1;i++)t[i]=s[i-1]*s[i]<=0?0:3*(s[i-1]+s[i])/((2*s[i]+s[i-1])/s[i-1]+(s[i]+2*s[i-1])/s[i]);
    for(let i=0;i<n-1;i++){const h=(r[i+1].x-r[i].x)/3;d+="C"+f(r[i].x+h)+" "+f(r[i].y+t[i]*h)+" "+f(r[i+1].x-h)+" "+f(r[i+1].y-t[i+1]*h)+" "+f(r[i+1].x)+" "+f(r[i+1].y)}
    return d}).join("")}
/* beUI charts: the series group fades in from the left edge and draws in left to right; area fills fade downwards */
let CFX=0;
function serOpen(W,H,L){if(document.documentElement.getAttribute("data-skin")!=="beui")return '<g class="ser">';
  const id="cf"+(++CFX),a=L/W;
  return '<defs><linearGradient id="'+id+'g" x1="0" x2="1"><stop offset="'+a+'" stop-color="#fff" stop-opacity=".15"/><stop offset="'+(a+.08)+'" stop-color="#fff"/></linearGradient>'
    +'<mask id="'+id+'m" maskUnits="userSpaceOnUse" x="0" y="-10" width="'+W+'" height="'+(H+20)+'"><rect y="-10" width="'+W+'" height="'+(H+20)+'" fill="url(#'+id+'g)"/></mask></defs><g class="ser" mask="url(#'+id+'m)">'}
function areaFill(col){if(document.documentElement.getAttribute("data-skin")!=="beui")return null;const id="af"+(++CFX);
  return {def:'<defs><linearGradient id="'+id+'" x1="0" x2="0" y1="0" y2="1"><stop offset="0" style="stop-color:'+col+';stop-opacity:.32"/><stop offset="1" style="stop-color:'+col+';stop-opacity:0"/></linearGradient></defs>',fill:'url(#'+id+')'}}
/* every icon marked data-ic takes the current look's version; the original comes back on the plain themes */
function paintIcons(){document.querySelectorAll("[data-ic]").forEach(el=>{const sv=el.querySelector("svg");if(!sv)return;
    if(!el._ic0)el._ic0=sv.outerHTML;const n=skinIc(el.dataset.ic)||el._ic0;if(sv.outerHTML!==n)sv.outerHTML=n});
  document.dispatchEvent(new Event("themeicons"))}
/* Profile › Theme: a preview tile for every theme, grouped by look */
function renderThemes(){const box=document.getElementById("themePanel");if(!box)return;const cur=document.documentElement.getAttribute("data-theme");
  const groups=[["",T("默认","Default")],["interior","Interior"],["beui","beUI"],["mech",T("机械","Mechanical")],["xmas",T("节日","Holiday")],["minimal",T("极简","Minimal")],["craft",T("手作","Craft")],["toy",T("玩具","Toy")],["retro",T("复古","Retro")]];
  let wf=0;try{wf=+localStorage.getItem(LS+"-wear")||0}catch(e){}
  const wear='<div class="thg"><h4>'+T("磨损","Wear and tear")+'</h4><div class="wearseg seg maseg" role="group" aria-label="'+T("磨损","Wear and tear")+'">'
    +[[0,"自动","Auto"],[1,"轻","Light"],[2,"中","Medium"],[3,"重","Heavy"]].map(([v,zh,en])=>'<button type="button" data-wear-force="'+v+'" aria-pressed="'+(wf===v)+'">'+T(zh,en)+'</button>').join("")+'</div></div>';
  box.innerHTML=groups.map(([k,name])=>'<div class="thg"><h4>'+name+'</h4><div class="throw">'+THEMES.filter(t=>t[3]===k).map(([id,zh,en,,c])=>{const [bg,sf,a1,a2]=c.split(" ");
    return '<button type="button" class="thtile" data-theme-pick="'+id+'" aria-pressed="'+(id===cur)+'" style="--a:'+bg+';--b:'+sf+';--c:'+a1+';--d:'+a2+'"><i class="thprev" aria-hidden="true"><b></b><s></s><u></u></i><span>'+T(zh,en)+'</span></button>'}).join("")+'</div></div>').join("")+wear}
/* toy theme: the selected tab sits under a plastic piece that slides to the tapped tab */
function placePiece(bar,anim){if(!bar||!bar.offsetParent)return;let pc=bar.querySelector(".tpiece");
  if(!pc){pc=document.createElement("i");pc.className="tpiece";pc.setAttribute("aria-hidden","true");bar.prepend(pc)}
  const b=bar.querySelector('[aria-selected="true"]');if(!b)return;
  const was=pc.style.getPropertyValue("--px"),moved=was!==b.offsetLeft+"px";if(!was)anim=false;
  pc.classList.toggle("on",!!anim);
  pc.style.setProperty("--px",b.offsetLeft+"px");pc.style.setProperty("--py",b.offsetTop+"px");
  pc.style.setProperty("--pw",b.offsetWidth+"px");pc.style.setProperty("--ph",b.offsetHeight+"px");
  if(anim&&moved){pc.classList.remove("go");void pc.offsetWidth;pc.classList.add("go")}}
function placePieces(anim){if(!document.documentElement.getAttribute("data-skin"))return;document.querySelectorAll("nav.tabs,.subtabs").forEach(x=>placePiece(x,anim))}
addEventListener("resize",()=>placePieces(false));
if(document.fonts)document.fonts.ready.then(()=>placePieces(false));
let theme="light";try{theme=localStorage.getItem(LS+"-theme")||"light"}catch(e){}if(!THEME_IDS.includes(theme))theme="light";
applyTheme(theme);
function applyLang(l){LANG=l;document.documentElement.setAttribute("data-lang",l);document.documentElement.lang=l==="en"?"en":"zh-CN";
  document.getElementById("langBtn").textContent=l==="en"?"EN":"CH";try{localStorage.setItem(LS+"-lang",l)}catch(e){}}
applyLang(LANG);
document.getElementById("langBtn").addEventListener("click",()=>{applyLang(LANG==="en"?"zh":"en");applyTheme(document.documentElement.getAttribute("data-theme")||"light");renderAll();renderDietAll();paintSheetLang();syncUI()});
/* theme button: a tap moves to the next theme, holding it opens Profile › Theme */
(function(){const b=document.getElementById("themeBtn");let held=false,tm=0;
  const go=()=>{held=true;setTab("me");const f=document.getElementById("foldTheme");if(f){f.open=true;f.scrollIntoView({behavior:"smooth",block:"start"})}};
  b.addEventListener("pointerdown",()=>{held=false;clearTimeout(tm);tm=setTimeout(go,550)});
  ["pointerup","pointerleave","pointercancel"].forEach(ev=>b.addEventListener(ev,()=>clearTimeout(tm)));
  b.addEventListener("contextmenu",e=>e.preventDefault());
  b.addEventListener("click",e=>{if(held){held=false;e.stopImmediatePropagation();return}
    const cur=document.documentElement.getAttribute("data-theme")||"light";applyTheme(THEME_IDS[(THEME_IDS.indexOf(cur)+1)%THEME_IDS.length]);
    const t=THEMES.find(x=>x[0]===document.documentElement.getAttribute("data-theme"));toast(T(t[1],t[2]))});
})();
document.addEventListener("click",e=>{const t=e.target.closest("[data-theme-pick]");if(t)applyTheme(t.dataset.themePick);
  const w=e.target.closest("[data-wear-force]");if(w){try{localStorage.setItem(LS+"-wear",w.dataset.wearForce)}catch(err){}if(typeof updateWear==="function")updateWear();renderThemes()}});

/* particle flames above an element: the 练 button burns at full size (orange); today's cell on the training
   calendar burns at half size in green. k scales size, height and density. */
function flameOn(sel,k,green){
  if(window.matchMedia("(prefers-reduced-motion: reduce)").matches)return;
  const cv=document.createElement("canvas");cv.className="flame";cv.setAttribute("aria-hidden","true");document.body.appendChild(cv);
  const c=cv.getContext("2d"), dpr=Math.min(2,window.devicePixelRatio||1), PADX=22*k, UP=78*k, DOWN=10;
  let parts=[], last=performance.now(), cw=0, ch=0;
  function size(w,h){if(w!==cw||h!==ch){cw=w;ch=h;cv.width=w*dpr;cv.height=h*dpr;cv.style.width=w+"px";cv.style.height=h+"px"}}
  function spawn(bw,ember){
    const u=(Math.random()+Math.random())/2;            /* denser toward the middle */
    const x=PADX+6*k+u*(bw-12*k), base=UP+2;
    if(ember)return parts.push({x,y:base,vx:(Math.random()-.5)*.6*k,vy:-(0.5+Math.random()*0.425)*k,age:0,life:55+Math.random()*45,r:(.6+Math.random()*.5)*Math.max(k,.7),ember:1,seed:Math.random()*9});
    const mid=1-Math.abs(u-.5)*1.6;                       /* taller flames in the middle */
    parts.push({x,y:base+Math.random()*4*k,vx:(Math.random()-.5)*.5*k,vy:-(0.245+Math.random()*0.315)*(0.7+mid*0.6)*k,age:0,life:26+Math.random()*22*(0.6+mid),r:(1.225+Math.random()*1.4*(0.6+mid))*Math.max(k,.7),seed:Math.random()*9});
  }
  function col(t,a){ /* white-hot core -> flame colour -> deep edge */
    if(!green&&document.documentElement.getAttribute("data-theme")==="mech-light"){ /* a blue gas flame for the electric-blue machine look */
      if(t<.12)return "rgba(225,245,255,"+a+")";
      if(t<.38)return "rgba(110,190,255,"+a+")";
      if(t<.7)return "rgba(40,120,255,"+a+")";
      return "rgba(20,50,180,"+a*.8+")";
    }
    if(green){
      if(t<.12)return "rgba(225,255,215,"+a+")";
      if(t<.38)return "rgba(130,240,150,"+a+")";
      if(t<.7)return "rgba(60,200,110,"+a+")";
      return "rgba(20,120,70,"+a*.8+")";
    }
    if(t<.12)return "rgba(255,236,150,"+a+")";
    if(t<.38)return "rgba(255,178,40,"+a+")";
    if(t<.7)return "rgba(255,112,24,"+a+")";
    return "rgba(196,40,12,"+a*.8+")";
  }
  function frame(now){
    requestAnimationFrame(frame);
    const dt=Math.min(2.5,(now-last)/16.7);last=now;
    const b=document.querySelector(sel);
    const r=b&&b.getBoundingClientRect();
    const nav=document.querySelector("nav.tabs"), nb=nav?nav.getBoundingClientRect().bottom:0;
    /* hidden, off screen, or slid under the sticky tab bar: no flames */
    if(!r||!r.width||document.hidden||r.top<nb-2||r.top>innerHeight){if(cw){c.clearRect(0,0,cv.width,cv.height)}parts=[];return}
    const w=Math.round(r.width+PADX*2), h=Math.round(UP+r.height+DOWN);
    size(w,h);cv.style.transform="translate("+Math.round(r.left-PADX)+"px,"+Math.round(r.top-UP)+"px)";
    let n=3.2*k*dt;while(n>0){if(Math.random()<n)spawn(r.width,false);n--}
    if(Math.random()<0.07*k*dt)spawn(r.width,true);
    c.setTransform(dpr,0,0,dpr,0,0);c.clearRect(0,0,w,h);c.globalCompositeOperation="lighter";
    for(let i=parts.length-1;i>=0;i--){const p=parts[i];
      p.age+=dt;const t=p.age/p.life;if(t>=1){parts.splice(i,1);continue}
      p.vx+=(Math.random()-.5)*.12*k*dt+Math.sin(now*.004+p.seed)*.02*k*dt;p.vx*=Math.pow(.95,dt);
      p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy*=Math.pow(p.ember?.995:.985,dt);
      if(p.ember){const a=(1-t)*.95;c.fillStyle=green?"rgba(170,"+Math.round(255-t*60)+",160,"+a+")":"rgba(255,"+Math.round(200-t*90)+",70,"+a+")";c.beginPath();c.arc(p.x,p.y,p.r,0,7);c.fill();continue}
      const rad=p.r*(1-t*.7), a=Math.pow(1-t,1.4)*.4;
      c.save();c.translate(p.x,p.y);c.scale(.75,1.6);
      const g=c.createRadialGradient(0,0,0,0,0,rad);g.addColorStop(0,col(t,a));g.addColorStop(1,col(t,0));
      c.fillStyle=g;c.beginPath();c.arc(0,0,rad,0,7);c.fill();c.restore();
    }
    c.globalCompositeOperation="source-over";
  }
  requestAnimationFrame(frame);
}
flameOn(".tbtn.next",1,false);
flameOn("#pane-train .cald.today",.5,true);
/* fireworks: one shared overlay canvas; fireworks(n, big) queues n normal rockets and then `big` large ones.
   Calls stack (ticking quickly just adds rockets to the same show). The canvas is removed when the sky is empty. */
const FW=(function(){
  const COLS=["#FFD34E","#FF9A1F","#F2541B","#43C08A","#7393F2","#A58CF0","#FF6FA8","#2BB3E0"];
  let cv=null,c=null,W=0,H=0,dpr=1,rockets=[],sparks=[],running=false,nextAt=0;
  const pick=()=>COLS[Math.floor(Math.random()*COLS.length)];
  function ensure(){
    dpr=Math.min(2,window.devicePixelRatio||1);
    if(!cv){cv=document.createElement("canvas");cv.className="fw";cv.setAttribute("aria-hidden","true");document.body.appendChild(cv);c=cv.getContext("2d");W=0}
    if(W!==innerWidth||H!==innerHeight){W=innerWidth;H=innerHeight;cv.width=W*dpr;cv.height=H*dpr;c.setTransform(dpr,0,0,dpr,0,0)}
  }
  function add(n,big){
    if(window.matchMedia("(prefers-reduced-motion: reduce)").matches)return;
    ensure();
    const now=performance.now(), gap=n>=6?150:230;
    let t=Math.max(now,nextAt);
    for(let i=0;i<n;i++){rockets.push(mk(t+Math.random()*90,false));t+=gap}
    if(big){t+=n?380:0;for(let i=0;i<big;i++){rockets.push(mk(t,true));t+=700}}
    nextAt=t;
    if(!running){running=true;requestAnimationFrame(frame)}
  }
  function mk(at,big){return {at,big,x:W*(big?0.3+Math.random()*0.4:0.12+Math.random()*0.76),y:H,ty:H*(big?0.14+Math.random()*0.1:0.18+Math.random()*0.3),vy:0,fired:false,done:false,col:pick()}}
  function burst(r){
    const n=r.big?230:60+Math.floor(Math.random()*30), col2=pick(), col3=pick();
    for(let k=0;k<n;k++){
      const a=Math.PI*2*k/n+Math.random()*0.2;
      const s=r.big?(k%2?2.6+Math.random()*2.2:4.6+Math.random()*2.6):2+Math.random()*3.2;
      sparks.push({x:r.x,y:r.y,vx:Math.cos(a)*s,vy:Math.sin(a)*s,life:1,decay:r.big?0.007+Math.random()*0.006:0.012+Math.random()*0.012,
        sz:r.big?2.2:1.6,col:r.big?(k%3===0?col2:k%3===1?col3:r.col):(k%3?r.col:col2),tw:r.big&&Math.random()<.35})
    }
    document.dispatchEvent(new CustomEvent("fwburst",{detail:{big:r.big}}));
  }
  function frame(now){
    c.globalCompositeOperation="destination-out";c.fillStyle="rgba(0,0,0,.22)";c.fillRect(0,0,W,H);
    c.globalCompositeOperation="source-over";
    rockets.forEach(r=>{
      if(r.done||now<r.at)return;
      if(!r.fired){r.fired=true;r.vy=-Math.sqrt(2*0.16*(H-r.ty))}
      r.y+=r.vy;r.vy+=0.16;
      c.fillStyle=r.col;c.beginPath();c.arc(r.x,r.y,r.big?3.4:2.2,0,7);c.fill();
      if(r.vy>=0){r.done=true;burst(r)}
    });
    rockets=rockets.filter(r=>!r.done);
    for(let i=sparks.length-1;i>=0;i--){const p=sparks[i];
      p.x+=p.vx;p.y+=p.vy;p.vx*=0.985;p.vy=p.vy*0.985+0.05;p.life-=p.decay;
      if(p.life<=0){sparks.splice(i,1);continue}
      const a=p.tw?p.life*(0.5+0.5*Math.sin(now*0.03+i)):p.life;
      c.globalAlpha=Math.max(0,a);c.fillStyle=p.col;c.beginPath();c.arc(p.x,p.y,p.sz+p.life*1.6,0,7);c.fill();c.globalAlpha=1}
    if(rockets.length||sparks.length)requestAnimationFrame(frame);
    else{running=false;nextAt=0;cv.remove();cv=null}
  }
  return {add};
})();
/* the celebration follows the look: fireworks on the plain themes, a party popper in the theme's colours on the
   toy looks, pixel bits on retro, paper scraps on craft, sparks on the machine console, a small tidy burst on the
   quiet looks. Particles come from canvas-confetti (js/confetti.js); n is how many rockets the fireworks would fire. */
const CELEB={xmas:"snow",toy:"party",retro:"pixel",craft:"paper",mech:"sparks",beui:"glow",interior:"tidy",minimal:"tidy"};
function themeHex(names){const c=document.createElement("canvas").getContext("2d"),cs=getComputedStyle(document.documentElement);
  return names.map(n=>{c.fillStyle="#000";c.fillStyle=cs.getPropertyValue(n).trim()||"#888";const v=c.fillStyle;
    if(v[0]==="#")return v;const m=v.match(/[\d.]+/g);return "#"+m.slice(0,3).map(x=>(+x|0).toString(16).padStart(2,"0")).join("")})}
function celebrate(kind,n,big){const cf=window.confetti;if(!cf||matchMedia("(prefers-reduced-motion: reduce)").matches)return;
  const base={zIndex:45,disableForReducedMotion:true},bursts=Math.min(5,Math.max(1,Math.ceil(n/3))),boom=b=>document.dispatchEvent(new CustomEvent("fwburst",{detail:{big:b}}));
  const go=(i,f)=>setTimeout(()=>{f();boom(big&&i===bursts-1)},i*260);
  if(kind==="party"){const colors=themeHex(["--push","--pull","--cta","--ok","--sleep"]);
    for(let i=0;i<bursts;i++)go(i,()=>{const k=18+n*4;
      cf(Object.assign({},base,{particleCount:k,angle:62,spread:58,startVelocity:58,origin:{x:0,y:1},colors,shapes:["square","circle"],scalar:1.15,ticks:260}));
      cf(Object.assign({},base,{particleCount:k,angle:118,spread:58,startVelocity:58,origin:{x:1,y:1},colors,shapes:["square","circle"],scalar:1.15,ticks:260}))});
    if(big&&cf.shapeFromText)setTimeout(()=>{const shapes=["🎉","🎊","⭐"].map(t=>cf.shapeFromText({text:t,scalar:2.2}));
      cf(Object.assign({},base,{particleCount:24,spread:100,startVelocity:42,origin:{x:.5,y:.75},shapes,scalar:2.2,ticks:280,flat:true}))},bursts*260);return}
  if(kind==="snow"){const colors=["#B3192E","#1F5A3A","#E8C468","#FFFFFF"];
    const flakes=cf.shapeFromText?["❄️","🎁","⭐"].map(t=>cf.shapeFromText({text:t,scalar:1.6})):["circle"];
    for(let i=0;i<bursts;i++)go(i,()=>{cf(Object.assign({},base,{particleCount:24+n*4,angle:270,spread:160,startVelocity:12,origin:{x:.15+Math.random()*.7,y:-.05},colors,shapes:["circle"],scalar:.9,gravity:.45,drift:Math.random()-.5,ticks:380}));
      cf(Object.assign({},base,{particleCount:6+n,angle:270,spread:150,startVelocity:10,origin:{x:.2+Math.random()*.6,y:-.05},shapes:flakes,scalar:1.6,gravity:.4,ticks:400,flat:true}))});return}
  if(kind==="pixel"){const colors=themeHex(["--ink","--push","--pull","--ok"]);
    for(let i=0;i<bursts;i++)go(i,()=>cf(Object.assign({},base,{particleCount:30+n*5,spread:80,startVelocity:45,origin:{x:.2+Math.random()*.6,y:.8},colors,shapes:["square"],flat:true,scalar:.9,gravity:1.3,ticks:140,decay:.9})));return}
  if(kind==="paper"){const colors=themeHex(["--push","--pull","--ok","--tape","--surface"]);
    for(let i=0;i<bursts;i++)go(i,()=>cf(Object.assign({},base,{particleCount:22+n*3,spread:120,startVelocity:30,origin:{x:.2+Math.random()*.6,y:.55},colors,shapes:["square"],scalar:1.6,gravity:.55,drift:Math.random()-.5,ticks:320})));return}
  if(kind==="sparks"){const colors=["#FFF4D6","#FFD27A","#FF9A3C","#FF6A13"];
    for(let i=0;i<bursts;i++)go(i,()=>cf(Object.assign({},base,{particleCount:60+n*8,angle:90,spread:110,startVelocity:52,origin:{x:.25+Math.random()*.5,y:.9},colors,shapes:["circle"],scalar:.45,gravity:2.1,decay:.88,ticks:90})));return}
  if(kind==="glow"){const colors=themeHex(["--cta","--push","--pull"]);
    for(let i=0;i<bursts;i++)go(i,()=>cf(Object.assign({},base,{particleCount:30+n*4,spread:360,startVelocity:26,origin:{x:.2+Math.random()*.6,y:.3+Math.random()*.3},colors,shapes:["circle"],scalar:.8,gravity:.4,decay:.93,ticks:180})));return}
  const colors=themeHex(["--ink","--pull","--ok"]);
  for(let i=0;i<Math.min(bursts,2);i++)go(i,()=>cf(Object.assign({},base,{particleCount:26+n*2,spread:70,startVelocity:34,origin:{x:.5,y:.7},colors,shapes:["square"],scalar:.7,gravity:.9,ticks:160})))}
/* the two machine looks have their own: molten iron flowers on the dark one, electric arcs on the light one */
const CELEB_THEME={mech:"iron","mech-light":"zap"};
function fireworks(n,big){if(typeof bugs!=="undefined")bugs.swat(big?99:Math.max(1,Math.ceil((n||1)/2)));
  const t=document.documentElement.getAttribute("data-theme"),own=CELEB_THEME[t];
  if(own){metalFx(own,n||1,big||0);return}
  const k=CELEB[document.documentElement.getAttribute("data-skin")];if(k&&window.confetti)celebrate(k,n||1,big||0);else FW.add(n||0,big||0)}
/* metal celebrations on their own canvas. Iron flowers: molten drops are struck upward from the bottom, trail light
   as they fly, burst into smaller drops near the top of the arc and cool from white through gold to deep orange as
   they fall. Electric arcs: a few jagged bolts flicker out from a point with a cold blue glow and a spray of tiny
   sparks. */
const metalFx=(function(){let cv=null,ctx=null,ps=[],arcs=[],flash=0,raf=0,W=0,H=0,dpr=1;
  const fit=()=>{dpr=Math.min(2,devicePixelRatio||1);W=innerWidth;H=innerHeight;cv.width=W*dpr;cv.height=H*dpr;ctx.setTransform(dpr,0,0,dpr,0,0)};
  const ensure=()=>{if(cv)return;cv=document.createElement("canvas");cv.className="fw";document.body.append(cv);ctx=cv.getContext("2d");fit();addEventListener("resize",()=>cv&&fit())};
  const rnd=(a,b)=>a+Math.random()*(b-a);
  const ironCol=t=>t<.18?"255,250,225":t<.45?"255,205,90":t<.75?"255,140,40":"215,70,20";
  function iron(x,count,k){const sp=H/820;for(let i=0;i<count;i++){const a=rnd(-Math.PI*.78,-Math.PI*.22),v=rnd(9,17)*sp*k;
    ps.push({kind:"iron",x,y:H*.97,vx:Math.cos(a)*v,vy:Math.sin(a)*v,age:0,life:rnd(95,150),w:rnd(1.6,2.6),tr:[],split:Math.random()<.45})}}
  function zap(x,y,big){const n=big?6:4;for(let i=0;i<n;i++){const a=rnd(0,Math.PI*2),r=rnd(70,big?260:190);arcs.push({x,y,tx:x+Math.cos(a)*r,ty:y+Math.sin(a)*r,age:0,life:rnd(14,24),pts:null})}
    for(let i=0;i<(big?60:36);i++){const a=rnd(0,Math.PI*2),v=rnd(3,9);ps.push({kind:"spark",x,y,vx:Math.cos(a)*v,vy:Math.sin(a)*v,age:0,life:rnd(14,32),w:rnd(1,1.8),tr:[]})}flash=4}
  function bolt(a){const pts=[[a.x,a.y]],seg=8,dx=a.tx-a.x,dy=a.ty-a.y,len=Math.hypot(dx,dy),nx=-dy/len,ny=dx/len;
    for(let i=1;i<seg;i++){const t=i/seg,o=rnd(-1,1)*len*.12;pts.push([a.x+dx*t+nx*o,a.y+dy*t+ny*o])}pts.push([a.tx,a.ty]);return pts}
  function frame(){ctx.clearRect(0,0,W,H);const lightBg=getComputedStyle(document.documentElement).colorScheme==="light";ctx.globalCompositeOperation=lightBg?"source-over":"lighter";
    if(flash>0){ctx.fillStyle="rgba(90,170,255,"+((lightBg?.03:.05)*flash)+")";ctx.fillRect(0,0,W,H);flash--}
    arcs=arcs.filter(a=>{a.age++;if(!a.pts||a.age%2===0)a.pts=bolt(a);const al=1-a.age/a.life;
      (lightBg?[[8,"30,123,255",.28],[3.2,"14,95,216",.9],[1.2,"255,255,255",1]]:[[7,"90,170,255",.35],[2.4,"235,248,255",1]]).forEach(([w,c,o])=>{ctx.strokeStyle="rgba("+c+","+(o*al)+")";ctx.lineWidth=w;ctx.lineJoin="round";ctx.beginPath();a.pts.forEach((p,i)=>i?ctx.lineTo(p[0],p[1]):ctx.moveTo(p[0],p[1]));ctx.stroke()});
      return a.age<a.life});
    const born=[];
    ps=ps.filter(p=>{p.age++;p.tr.push([p.x,p.y]);if(p.tr.length>(p.kind==="iron"?7:3))p.tr.shift();
      p.vy+=p.kind==="iron"?.17*H/820:.12;p.vx*=.985;p.vy*=.985;p.x+=p.vx;p.y+=p.vy;
      if(p.kind==="iron"&&p.split&&p.vy>-.5){p.split=false;for(let i=0;i<4;i++){const a=rnd(0,Math.PI*2),v=rnd(1.5,4);born.push({kind:"iron",x:p.x,y:p.y,vx:p.vx*.3+Math.cos(a)*v,vy:Math.sin(a)*v,age:p.age,life:p.age+rnd(45,80),w:p.w*.7,tr:[],split:false})}}
      const t=p.age/p.life,al=Math.max(0,1-t*t),col=p.kind==="iron"?ironCol(t):lightBg?(t<.4?"14,95,216":"30,123,255"):(t<.4?"235,248,255":"110,185,255");
      const tr=p.tr.concat([[p.x,p.y]]);
      ctx.lineCap="round";ctx.strokeStyle="rgba("+col+","+(.25*al)+")";ctx.lineWidth=p.w*3;ctx.beginPath();tr.forEach((q,i)=>i?ctx.lineTo(q[0],q[1]):ctx.moveTo(q[0],q[1]));ctx.stroke();
      ctx.strokeStyle="rgba("+col+","+al+")";ctx.lineWidth=p.w;ctx.stroke();
      return p.age<p.life&&p.y<H+20});
    ps=ps.concat(born);ctx.globalCompositeOperation="source-over";
    if(ps.length||arcs.length||flash>0)raf=requestAnimationFrame(frame);else{raf=0;ctx.clearRect(0,0,W,H)}}
  return function(kind,n,big){if(matchMedia("(prefers-reduced-motion: reduce)").matches)return;ensure();
    const bursts=Math.min(5,Math.max(1,Math.ceil(n/3)));
    for(let i=0;i<bursts;i++)setTimeout(()=>{const last=i===bursts-1;
      if(kind==="iron")iron(rnd(W*.2,W*.8),40+n*5,big&&last?1.15:1);else zap(rnd(W*.25,W*.75),rnd(H*.3,H*.6),big&&last);
      document.dispatchEvent(new CustomEvent("fwburst",{detail:{big:!!(big&&last)}}));if(!raf)raf=requestAnimationFrame(frame)},i*(kind==="iron"?320:240))}})();
/* set / exercise / day outcomes used for the fireworks */
function exDone(s,e){const a=s.sets[e.id]||[];return a.length>0&&a.every(x=>x.d)}
function exOver(s,e){const a=s.sets[e.id]||[];return a.length>e.sets||a.some(x=>x.d&&+x.v>e.target)}
document.getElementById("toTop").addEventListener("click",()=>{
  const smooth=!window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  window.scrollTo({top:0,behavior:smooth?"smooth":"auto"});
  const se=document.scrollingElement;if(se&&se!==document.documentElement)se.scrollTo({top:0,behavior:smooth?"smooth":"auto"});
});
function md(s){if(!s)return "";const p=s.split("-");return (+p[1])+"."+(+p[2])}
function dnum(s){const p=s.split("-");return Date.UTC(+p[0],+p[1]-1,+p[2])/864e5}
function esc(s){return String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]))}
function numOrNull(v){if(v===""||v==null)return null;const n=Number(v);return isFinite(n)?n:null}
let toastT;
/* numbers roll to their new value (0.4 s); the first time a number shows, it counts up from 0 */
const ROLL=new Map();
function rollNum(el,key){if(!el)return;const txt=el.textContent,m=/\d+(?:\.\d+)?/.exec(txt);if(!m)return;
  const to=+m[0],dec=(m[0].split(".")[1]||"").length,from=ROLL.has(key)?ROLL.get(key):0;ROLL.set(key,to);
  if(from===to)return;
  /* a changed value is marked for a moment: green when it went up, red when it went down (styled by the Interior look) */
  if(ROLL.size&&from)el.classList.remove("vf-up","vf-down"),void el.offsetWidth,el.classList.add(to>from?"vf-up":"vf-down"),setTimeout(()=>el.classList.remove("vf-up","vf-down"),900);
  if(matchMedia("(prefers-reduced-motion: reduce)").matches)return;
  const t0=performance.now(),D=400,ease=x=>1-Math.pow(1-x,3);
  const step=now=>{const x=Math.min(1,(now-t0)/D);if(!el.isConnected)return;el.textContent=txt.replace(m[0],(from+(to-from)*ease(x)).toFixed(dec));if(x<1)requestAnimationFrame(step)};
  el.textContent=txt.replace(m[0],from.toFixed(dec));requestAnimationFrame(step)}
function toast(msg){const t=document.getElementById("toast");t.textContent=msg;t.hidden=false;clearTimeout(toastT);toastT=setTimeout(()=>t.hidden=true,2600)}

/* ---------- sound: synthesised with Web Audio, no files ---------- */
(function(){
  let ctx=null, on=true;
  try{on=localStorage.getItem(LS+"-sound")!=="off"}catch(e){}
  const VOLS=[0.75,1,1.25];let VOL=1;try{const v=+localStorage.getItem(LS+"-vol");if(VOLS.includes(v))VOL=v}catch(e){}
  const btn=document.getElementById("sndBtn");
  const ICON_ON='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 5 6 9H3v6h3l5 4z"/><path d="M15.5 8.5a5 5 0 0 1 0 7M18.5 5.5a9 9 0 0 1 0 13"/></svg>';
  const ICON_OFF='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 5 6 9H3v6h3l5 4z"/><path d="m16 9 6 6M22 9l-6 6"/></svg>';
  document.addEventListener("themeicons",()=>paint());
  function paint(){btn.innerHTML=on?(skinIc("snd")||ICON_ON):(skinIc("sndx")||ICON_OFF);btn.setAttribute("aria-label",(on?T("关闭声音","Sound off"):T("打开声音","Sound on"))+T("（长按调音量，现在 ",". Hold for volume, now ")+Math.round(VOL*100)+T("%）","%"));btn.dataset.vol=Math.round(VOL*100);btn.setAttribute("aria-pressed",on)}
  paint();
  function ac(){
    if(!ctx){const C=window.AudioContext||window.webkitAudioContext;if(!C)return null;ctx=new C();
      /* every sound goes through one master gain: the volume the speaker button's long press sets */
      ctx.__out=ctx.createGain();ctx.__out.gain.value=VOL;ctx.__out.connect(ctx.destination)}
    if(ctx.state==="suspended")ctx.resume();
    return ctx;
  }
  /* one short note: frequency, start offset (s), length (s), wave, peak volume, optional end frequency */
  function tone(f,at,len,type,vol,f2){
    const c=ac();if(!c)return;
    const t0=c.currentTime+(at||0), o=c.createOscillator(), g=c.createGain();
    o.type=type||"sine";o.frequency.setValueAtTime(f,t0);
    if(f2)o.frequency.exponentialRampToValueAtTime(f2,t0+len);
    g.gain.setValueAtTime(0.0001,t0);g.gain.exponentialRampToValueAtTime(vol||0.2,t0+0.008);
    g.gain.exponentialRampToValueAtTime(0.0001,t0+len);
    o.connect(g).connect(c.__out||c.destination);o.start(t0);o.stop(t0+len+0.02);
  }
  /* filtered noise burst, shaped like a page being turned */
  let noiseBuf=null;
  function noiseHit(len,f1,f2,vol,q,type,peak,at,dest){
    const c=ac();if(!c)return;
    if(!noiseBuf){noiseBuf=c.createBuffer(1,c.sampleRate,c.sampleRate);const d=noiseBuf.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1}
    const t0=c.currentTime+(at||0), src=c.createBufferSource(), bp=c.createBiquadFilter(), g=c.createGain();
    src.buffer=noiseBuf;bp.type=type;bp.Q.value=q;
    bp.frequency.setValueAtTime(f1,t0);bp.frequency.exponentialRampToValueAtTime(f2,t0+len);
    g.gain.setValueAtTime(0.0001,t0);g.gain.exponentialRampToValueAtTime(vol,t0+len*peak);g.gain.exponentialRampToValueAtTime(0.0001,t0+len);
    src.connect(bp).connect(g).connect(dest||c.__out||c.destination);src.start(t0,Math.random()*0.5,len+0.02);
  }
  /* fireworks: a jsfxr noise explosion (the realistic part, at jsfxr's own volume), our low sine thump
     under it, and a few crackles as the sparks fall; a big one adds a second, deeper blast and more crackle.
     Several rockets often burst together, so they share a compressor instead of clipping. Three variants of
     each blast keep a volley from sounding like one sample repeated. */
  const FW_SMALL=[[3,0,0.28,0.62,0.42,0.11,0,-0.18,0,0,0,0,0,0,0,0,0,0,1],
                  [3,0,0.24,0.55,0.46,0.14,0,-0.22,0,0.25,0.3,0,0,0,0,0,0.12,-0.08,1],
                  [3,0,0.3,0.7,0.38,0.09,0,-0.12,0,0,0,0,0,0,0,0,-0.2,0.05,0.9]];
  const FW_BIG=[[3,0,0.38,0.75,0.6,0.07,0,-0.1,0,0,0,0,0,0,0,0,0,0,0.85],
                [3,0,0.42,0.8,0.55,0.06,0,-0.08,0,0.2,0.25,0,0,0,0,0,0.15,-0.05,0.8]];
  let fwBus=null;
  function fwOut(c){
    if(!fwBus){const k=c.createDynamicsCompressor();k.threshold.value=-10;k.knee.value=8;k.ratio.value=6;k.attack.value=0.003;k.release.value=0.25;k.connect(c.__out||c.destination);fwBus=k}
    return fwBus;
  }
  function fwSound(big){
    const c=ac();if(!c)return;const out=fwOut(c),pick=a=>Math.floor(Math.random()*a.length);
    if(big){const i=pick(FW_BIG);jfPlay(c,"fwB"+i,FW_BIG[i],0,out);const j=pick(FW_SMALL);jfPlay(c,"fwS"+j,FW_SMALL[j],0.14,out);tone(70,0,0.8,"sine",0.3,28);tone(140,0,0.5,"triangle",0.1,50)}
    else{const i=pick(FW_SMALL);jfPlay(c,"fwS"+i,FW_SMALL[i],0,out);tone(100,0,0.35,"sine",0.2,40)}
    const n=big?14:6;for(let k=0;k<n;k++)noiseHit(0.035,3500+Math.random()*3000,6500,0.1+Math.random()*0.08,1.2,"highpass",0.15,(big?0.3:0.22)+Math.random()*(big?0.9:0.5),out);
  }
  const S={
    tap:()=>noiseHit(0.09,2500,4500,0.3,0.7,"highpass",0.2),
    key:()=>tone(1500,0,0.025,"square",0.035),
    inc:()=>tone(880,0,0.06,"triangle",0.15,1180),
    dec:()=>tone(660,0,0.06,"triangle",0.15,470),
    tick:()=>{tone(784,0,0.09,"triangle",0.2);tone(1175,0.06,0.16,"triangle",0.2);tone(2350,0.06,0.12,"sine",0.05)},
    untick:()=>tone(440,0,0.09,"sine",0.12,330),
    exDone:()=>{[523,659,784,1047].forEach((f,i)=>tone(f,i*0.07,0.22,"triangle",0.17))},
    finish:()=>{[523,659,784].forEach((f,i)=>tone(f,i*0.1,0.18,"triangle",0.2));
      [1047,1319,1568].forEach(f=>tone(f,0.32,0.7,"triangle",0.12));tone(262,0.32,0.7,"sine",0.18)},
    boom:()=>fwSound(false),
    bigboom:()=>fwSound(true),
    swoosh:()=>noiseHit(0.22,600,3200,0.22,1.2,"bandpass",0.5),
    pop:()=>tone(420,0,0.07,"sine",0.25,900),
    click:()=>{tone(2200,0,0.012,"square",0.06);tone(900,0.012,0.02,"triangle",0.08)},
    chime:()=>{tone(988,0,0.25,"sine",0.14);tone(1319,0.09,0.35,"sine",0.12)},
    buzz:()=>{tone(180,0,0.12,"square",0.06);tone(150,0.13,0.16,"square",0.06)},
    trash:()=>{[0,.06,.13,.19].forEach(t=>noiseHit(0.07,1800,900,0.22,1.5,"bandpass",0.3,t));tone(150,0.24,0.12,"sine",0.2,70)},
    poof:()=>{noiseHit(0.28,3000,300,0.28,0.8,"lowpass",0.15);tone(300,0,0.18,"sine",0.12,90)},
    sword:()=>{noiseHit(0.16,1200,7000,0.35,2.5,"bandpass",0.6);tone(2637,0.13,0.5,"sine",0.06);tone(3951,0.13,0.4,"sine",0.035);tone(5274,0.14,0.25,"sine",0.02)},
    unsheathe:()=>{noiseHit(0.35,2000,9000,0.18,6,"bandpass",0.85);tone(3136,0.33,0.6,"triangle",0.05)},
    punch:()=>{tone(160,0,0.18,"sine",0.4,45);noiseHit(0.06,900,300,0.3,0.8,"lowpass",0.1)},
    charge:()=>{tone(220,0,0.45,"sawtooth",0.05,1760);tone(440,0,0.45,"sine",0.08,3520)},
    coin:()=>{tone(988,0,0.07,"square",0.07);tone(1319,0.07,0.32,"square",0.07)},
    levelup:()=>{[523,659,784,1047,1319,1568].forEach((f,i)=>tone(f,i*0.05,0.16,"square",0.05))},
    fanfare:()=>{[[392,0,.1],[392,.12,.1],[392,.24,.1],[523,.36,.5]].forEach(([f,t,l])=>{tone(f,t,l,"sawtooth",0.06);tone(f*2,t,l,"triangle",0.05)})},
    musicbox:()=>{[1047,1175,1319,1568,1760].forEach((f,i)=>tone(f,i*0.11,0.5,"sine",0.1))},
    sparkle:()=>{[2093,2637,3136,2349,2794,3520].forEach((f,i)=>tone(f,i*0.045,0.2,"sine",0.05))},
    sad:()=>{[392,370,349].forEach((f,i)=>tone(f,i*0.22,0.22,"triangle",0.12));tone(330,0.66,0.5,"triangle",0.12,300)},
    /* plastic toy sounds for the toy themes: a key clacking down, a piece sliding into its slot, two bricks snapping */
    clack:()=>{noiseHit(0.035,3200,1800,0.32,3,"bandpass",0.15);tone(240,0,0.06,"sine",0.22,110)},
    slide:()=>{noiseHit(0.2,900,2600,0.12,1.2,"bandpass",0.6);noiseHit(0.03,3400,2200,0.3,3,"bandpass",0.15,0.19);tone(320,0.19,0.06,"sine",0.18,160)},
    snap:()=>{noiseHit(0.02,4200,2800,0.35,4,"bandpass",0.1);noiseHit(0.025,2600,1600,0.3,4,"bandpass",0.1,0.045);tone(520,0.045,0.08,"triangle",0.12,260)},
    /* retro: 8-bit blips; craft: paper; minimal: a soft click */
    blip:()=>{tone(880,0,0.04,"square",0.06);tone(1320,0.04,0.06,"square",0.05)},
    paper:()=>noiseHit(0.06,2600,1100,0.22,0.7,"lowpass",0.2),
    stamp:()=>{tone(150,0,0.09,"sine",0.35,70);noiseHit(0.05,900,400,0.2,0.8,"lowpass",0.1)},
    soft:()=>{tone(1800,0,0.012,"sine",0.07);tone(1200,0.006,0.02,"sine",0.05)},
    /* machine console: a latching key going down, a detent click on a knob, a bat-handle toggle, a ratchet notch,
       the lever's spring letting go, a bell, grinder sparks */
    clunk:()=>{tone(95,0,0.13,"sine",0.45,55);noiseHit(0.045,1900,900,0.32,2,"bandpass",0.1);tone(1500,0.005,0.03,"square",0.03)},
    knob:()=>{noiseHit(0.014,6200,4200,0.3,6,"bandpass",0.1);tone(2600,0,0.012,"square",0.025)},
    toggle:()=>{noiseHit(0.016,5200,3600,0.38,5,"bandpass",0.1);tone(2400,0,0.02,"square",0.04);noiseHit(0.022,3200,2000,0.28,4,"bandpass",0.1,0.04);tone(160,0.04,0.06,"sine",0.18,90)},
    ratchet:()=>{noiseHit(0.011,4700,3600,0.26,6,"bandpass",0.1);tone(1900,0,0.01,"square",0.03)},
    spring:()=>{tone(210,0,0.42,"triangle",0.16,150);tone(420,0,0.3,"sine",0.05,300);[0.06,0.13,0.2].forEach((t,i)=>tone(260-i*25,t,0.07,"sine",0.06-i*0.015))},
    bell:()=>{[[1568,0],[2093,0.08]].forEach(([f,t])=>{tone(f,t,0.9,"sine",0.11);tone(f*2.76,t,0.4,"sine",0.025)})},
    /* iron flowers: the clang of the strike, then molten drops sizzling and crackling as they fall;
       electric arcs: a buzzing zap with crackle */
    ironfl:()=>{tone(230,0,.7,"triangle",.12);tone(612,0,.55,"sine",.05);tone(1490,0,.3,"sine",.02);noiseHit(.05,2500,900,.35,1.5,"bandpass",.1);
      noiseHit(1.1,9000,5000,.05,.5,"highpass",.25,.08);for(let i=0;i<9;i++)noiseHit(.012,6500,4200,.22,5,"bandpass",.1,.15+Math.random()*1)},
    ironfl2:()=>{S.ironfl();setTimeout(()=>S.ironfl(),300)},
    zap:()=>{tone(120,0,.28,"sawtooth",.08,55);tone(240,0,.2,"square",.03,90);noiseHit(.25,7000,3000,.12,.8,"highpass",.05);for(let i=0;i<6;i++)noiseHit(.01,8000,6000,.25,6,"bandpass",.1,Math.random()*.3)},
    zap2:()=>{S.zap();setTimeout(()=>S.zap(),160)},
    /* sleigh bells */
    jingle:()=>{[[2637,0],[3136,.035],[2794,.07],[3520,.1],[3136,.14]].forEach(([f,t])=>{tone(f,t,.22,"sine",.045);tone(f*1.5,t,.12,"sine",.015)});noiseHit(.18,9000,6000,.05,.8,"highpass",.2)},
    sparks:()=>{noiseHit(0.5,8000,2500,0.12,0.9,"highpass",0.05);for(let i=0;i<6;i++)noiseHit(0.012,6000,4000,0.25,5,"bandpass",0.1,0.05+Math.random()*0.4)},
    sparks2:()=>{S.sparks();tone(110,0,0.3,"sine",0.3,60);setTimeout(()=>S.sparks(),180)},
    /* party popper: a sharp pop and paper streamers rustling down */
    party:()=>{noiseHit(0.07,7000,1600,0.55,0.7,"highpass",0.04);tone(170,0,0.12,"sine",0.35,60);noiseHit(0.55,9000,4500,0.07,0.5,"highpass",0.35,0.06)},
    party2:()=>{S.party();setTimeout(()=>S.party(),140);tone(523,0.25,0.12,"square",0.04);tone(784,0.33,0.25,"square",0.04)},
    pixboom:()=>{fwSound(false);tone(988,0.05,0.07,"square",0.05);tone(1319,0.12,0.2,"square",0.05)},
    pixboom2:()=>{fwSound(true);S.levelup()},
    pencil:()=>{noiseHit(0.09,3500,5200,0.16,1.6,"bandpass",0.3);noiseHit(0.05,4200,2800,0.12,1.6,"bandpass",0.3,0.08)},
    rustle:()=>{for(let i=0;i<5;i++)noiseHit(0.08,2600+Math.random()*1500,1200,0.12,0.8,"lowpass",0.3,i*0.07)},
    rustle2:()=>{S.rustle();setTimeout(()=>S.rustle(),220);S.stamp()},
    glint:()=>{tone(1760,0,0.25,"sine",0.06);tone(2637,0.05,0.3,"sine",0.04)},
    glint2:()=>{S.glint();setTimeout(()=>S.glint(),120);tone(1319,0.18,0.5,"sine",0.06)},
    none:()=>{}
  };
  /* every kind of tap that makes a sound, its default sound, grouped as the settings panel shows them */
  const SFX=[
    [["训练","Training"],[["set","打勾完成一组","Tick a set","coin"],["exdone","一个动作的组全部完成","Last set of an exercise","levelup"],["untick","取消打勾","Untick a set","untick"],
      ["inc","次数 +","Reps +","inc"],["dec","次数 −","Reps −","dec"],["xtick","加练打勾","Tick an extra set","chime"],["xuntick","加练取消打勾","Untick an extra set","untick"],
      ["finish","完成今天的训练","Finish the day","finish"],["fw","烟花","Firework","boom"],["bigfw","大烟花","Big firework","bigboom"]]],
    [["切换和展开","Switch and fold"],[["tab1","切换一级标签","Main tabs","swoosh"],["tab2","切换图表里的页","Chart views","unsheathe"],["fold","展开或折起面板","Fold or unfold","none"],
      ["range","切换时间范围","Time range","sword"],["gap","点缺口卡片换天数","Gap tile period","sword"]]],
    [["记录","Logging"],[["open","打开记录窗口","Open a log window","tap"],["type","打字或输入数字","Typing","key"],["save","保存","Save","chime"],["close","取消或关闭窗口","Close","tap"],["del","删除","Delete","jfclick1"]]],
    [["同步","Sync"],[["sync","开始同步或拉取","Start sync or pull","fanfare"],["syncok","同步完成","Sync done","exDone"],["syncfail","同步失败","Sync failed","zzpowerup4"]]],
    [["其他","Other"],[["sndon","打开声音","Sound on","tick"],["header","顶部小按钮","Top buttons","tap"],["other","其他按钮","Other buttons","tap"]]]
  ];
  /* ZzFX sounds join the list (js/zzfx.js); sparse arrays keep their holes as defaults */
  ZZ_SOUNDS.forEach(([k,zh,en,p])=>{S[k]=()=>{const c=ac();if(c)zzPlay(c,k,p)}});
  /* and jsfxr sounds (js/sfxr.js) */
  JF_SOUNDS.forEach(([k,zh,en,p])=>{S[k]=()=>{const c=ac();if(c)jfPlay(c,k,p)}});
  const SDEF={};SFX.forEach(g=>g[1].forEach(r=>{SDEF[r[0]]=r[3]}));
  /* the toy themes swap the taps' defaults for plastic sounds; a sound the user picked still wins */
  const SKIN_SFX={toy:{tab1:"slide",tab2:"slide",range:"clack",gap:"clack",header:"clack",other:"clack",open:"clack",close:"clack",fold:"clack",save:"snap",untick:"clack",set:"snap",fw:"party",bigfw:"party2"},
    mech:{tab1:"clunk",tab2:"clunk",range:"knob",gap:"knob",header:"knob",other:"knob",open:"knob",close:"knob",fold:"knob",save:"clunk",untick:"toggle",set:"toggle",xtick:"toggle",xuntick:"toggle",exdone:"bell",sync:"none",syncok:"bell",syncfail:"buzz",fw:"sparks",bigfw:"sparks2",del:"clunk"},
    retro:{tab1:"blip",tab2:"blip",range:"key",gap:"key",header:"key",other:"key",open:"blip",close:"key",fold:"key",save:"coin",untick:"key",set:"coin",fw:"pixboom",bigfw:"pixboom2"},
    craft:{tab1:"tap",tab2:"tap",range:"paper",gap:"paper",header:"paper",other:"paper",open:"tap",close:"paper",fold:"paper",save:"stamp",untick:"paper",set:"pencil",fw:"rustle",bigfw:"rustle2"},
    minimal:{tab1:"soft",tab2:"soft",range:"soft",gap:"soft",header:"soft",other:"soft",open:"soft",close:"soft",fold:"none",untick:"soft",fw:"glint",bigfw:"glint2"},
    interior:{tab1:"soft",tab2:"soft",range:"soft",gap:"soft",header:"soft",other:"soft",open:"soft",close:"soft",fold:"none",untick:"soft",fw:"glint",bigfw:"glint2"},
    xmas:{tab1:"jingle",tab2:"jingle",range:"soft",gap:"soft",header:"soft",other:"soft",open:"jingle",close:"soft",fold:"none",untick:"soft",set:"sparkle",save:"musicbox",fw:"jingle",bigfw:"musicbox"},
    beui:{tab1:"pop",tab2:"pop",range:"soft",gap:"soft",header:"soft",other:"soft",open:"pop",close:"soft",fold:"none",untick:"soft",fw:"sparkle",bigfw:"glint2"}};
  const THEME_SFX={mech:{fw:"ironfl",bigfw:"ironfl2"},"mech-light":{fw:"zap",bigfw:"zap2"}};
  const defOf=id=>{const r=document.documentElement,th=THEME_SFX[r.getAttribute("data-theme")],k=SKIN_SFX[r.getAttribute("data-skin")];return th&&th[id]||k&&k[id]||SDEF[id]};
  const pickOf=id=>{const k=defOf(id);return S[k]?k:SDEF[id]};
  function playRaw(k){if(on&&S[k])try{S[k]()}catch(e){}}
  function play(id){playRaw(pickOf(id))}
  window.sfx=play;window.sfxRaw=playRaw;
  document.addEventListener("fwburst",e=>play(e.detail&&e.detail.big?"bigfw":"fw"));
  /* hold the speaker: volume steps 75% → 100% → 125% and plays a sample at the new level */
  let vHeld=false,vTm=0;
  btn.addEventListener("pointerdown",()=>{vHeld=false;clearTimeout(vTm);btn.classList.add("holding");
    vTm=setTimeout(()=>{vHeld=true;btn.classList.remove("holding");VOL=VOLS[(VOLS.indexOf(VOL)+1)%VOLS.length];try{localStorage.setItem(LS+"-vol",String(VOL))}catch(e){}
      if(ctx&&ctx.__out)ctx.__out.gain.setValueAtTime(VOL,ctx.currentTime);if(navigator.vibrate)navigator.vibrate(15);
      if(!on){on=true;try{localStorage.setItem(LS+"-sound","on")}catch(e){}}paint();play("sndon");
      /* a small label under the speaker says the new level, then fades by itself after 1.5 s */
      const old=document.querySelector(".volpop");if(old)old.remove();
      const r=btn.getBoundingClientRect(),pop=document.createElement("div");pop.className="volpop";pop.setAttribute("aria-live","polite");pop.textContent=Math.round(VOL*100)+"%";
      pop.style.left=(r.left+r.width/2+scrollX)+"px";pop.style.top=(r.bottom+scrollY+6)+"px";document.body.append(pop);setTimeout(()=>pop.remove(),1900)},550)});
  ["pointerup","pointercancel","pointerleave"].forEach(t=>btn.addEventListener(t,()=>{clearTimeout(vTm);btn.classList.remove("holding")}));
  btn.addEventListener("contextmenu",e=>e.preventDefault());
  btn.addEventListener("click",e=>{if(vHeld){vHeld=false;e.stopImmediatePropagation();return}on=!on;try{localStorage.setItem(LS+"-sound",on?"on":"off")}catch(e){}paint();if(on)play("sndon")});
  /* which kind of tap an element is */
  function kindOf(el){
    if(el.closest("nav.tabs"))return "tab1";
    if(el.closest(".subtabs"))return "tab2";
    if(el.matches("summary"))return "fold";
    if(el.id==="dietGapTile")return "gap";
    if(el.matches("#syncBtn,#dsrcPull,#dietSyncBtn,[data-csync]"))return "sync";
    if(el.matches("[data-recsave],[data-dsave]"))return "save";
    if(el.matches("[data-close]"))return "close";
    if(el.matches("[data-del],[data-ddel],#ddelDayBtn,[data-act=rm],[data-xa=rmset]"))return "del";
    if(el.matches(".chedit,#dietAddBtn,[data-dedit],[data-rec]"))return "open";
    if(el.closest(".seg,.maseg,.rgseg"))return "range";
    if(el.closest(".hbtns"))return "header";
    return "other";
  }
  document.addEventListener("click",e=>{
    if(!on)return;
    const el=e.target.closest("button,summary,[data-act],[data-toggle]");
    if(!el||el===btn||el.closest(".lever"))return;
    const act=el.dataset&&el.dataset.act;
    const xa=el.dataset&&el.dataset.xa;
    if(xa==="tick")return play(el.closest(".set").classList.contains("ticked")?"xuntick":"xtick");
    if(xa==="inc"||xa==="dec")return play(xa);
    if(act==="tick"){
      const row=el.closest(".set"),box=row&&row.closest(".ex");
      setTimeout(()=>{
        if(!row.classList.contains("ticked")){play("untick");return}
        const all=box?[...box.querySelectorAll(".set")]:[];
        play(all.length&&all.every(r=>r.classList.contains("ticked"))?"exdone":"set");
      },0);
      return;
    }
    if(act==="inc")return play("inc");
    if(act==="dec")return play("dec");
    if(act==="finish")return play("finish");
    if(el.matches("input,textarea,select"))return;
    play(kindOf(el));
  });
  let last=0;
  document.addEventListener("input",e=>{
    if(!on||!e.target.matches("input:not([type=date]):not([type=checkbox]),textarea"))return;
    const n=performance.now();if(n-last<35)return;last=n;play("type");
  });
})();

/* ---------- fullscreen: its own button, left of the language button; nothing else triggers it ---------- */
(function(){
  const de=document.documentElement, btn=document.getElementById("fsBtn");
  const req=de.requestFullscreen||de.webkitRequestFullscreen, exit=document.exitFullscreen||document.webkitExitFullscreen;
  if(!req||!(document.fullscreenEnabled||document.webkitFullscreenEnabled)){btn.hidden=true;return}
  const ENTER='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/></svg>';
  const EXIT='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 4v5H4M15 4v5h5M9 20v-5H4M15 20v-5h5"/></svg>';
  const isFs=()=>!!(document.fullscreenElement||document.webkitFullscreenElement);
  document.addEventListener("themeicons",()=>paint());
  function paint(){const f=isFs();btn.innerHTML=f?(skinIc("fsx")||EXIT):(skinIc("fs")||ENTER);btn.setAttribute("aria-label",f?T("退出全屏","Exit full screen"):T("全屏","Full screen"));btn.setAttribute("aria-pressed",f)}
  paint();
  btn.addEventListener("click",()=>{
    try{
      if(isFs()){const r=exit&&exit.call(document);if(r&&r.catch)r.catch(()=>{})}
      else{const r=req.call(de,{navigationUI:"hide"});if(r&&r.catch)r.catch(()=>toast(T("这里不允许全屏","Full screen isn't allowed here")))}
    }catch(e){toast(T("这里不允许全屏","Full screen isn't allowed here"))}
  });
  document.addEventListener("fullscreenchange",paint);document.addEventListener("webkitfullscreenchange",paint);
  document.getElementById("langBtn").addEventListener("click",()=>setTimeout(paint,0));
})();

/* i pills (i | round chevron): open and close the panel they name; the chevron turns up while it is open */
document.addEventListener("click", e=>{
  const b = e.target.closest("[data-itoggle]"); if(!b) return;
  const p = document.getElementById(b.dataset.itoggle); if(!p) return;
  p.hidden = !p.hidden; b.setAttribute("aria-expanded", String(!p.hidden));
});

/* A progress fill on a button while its work runs. It is a feeling of progress, not a measurement:
   it starts slowly and speeds up (so it never seems to rush ahead and then stall), stops short of
   the end, and fills completely when the work ends, well or badly. */
async function withProgress(btn, work){
  const t0 = performance.now(), T = 6000;
  btn.dataset.prog = "1"; btn.style.setProperty("--p", "0%");
  const tick = setInterval(()=>{ const x = Math.min(1, (performance.now() - t0) / T); btn.style.setProperty("--p", (88 * x * x).toFixed(1) + "%"); }, 120);
  try{ return await work(); }
  finally{
    clearInterval(tick); btn.style.setProperty("--p", "100%");
    setTimeout(()=>{ delete btn.dataset.prog; btn.style.removeProperty("--p"); }, 650);
  }
}

/* ---------- Interior extras ----------
   Charts › Health and Strength: on the Interior look the charts are a stacked deck. The top card shows; the next two
   peek out behind it. Fling it left or right and it flies off and goes to the back; a bar per chart under the deck
   shows which is on top, and tapping a bar brings that chart to the top. Tap a chart to read a day. On the other
   looks the charts are laid out as before, top to bottom. */
(function(){
  const on=()=>document.documentElement.getAttribute("data-skin")==="interior";
  [["pane-health",""],["pane-strength","#cbHeat"]].forEach(([id,skip])=>{
    const pane=document.getElementById(id);if(!pane)return;
    const boxes=[...pane.querySelectorAll(":scope>.chartbox")].filter(b=>!skip||!b.matches(skip));if(boxes.length<2)return;
    const car=document.createElement("div");car.className="chcar";boxes[0].before(car);boxes.forEach(b=>car.append(b));
    const dots=document.createElement("div");dots.className="cdots";dots.setAttribute("role","tablist");
    dots.innerHTML=boxes.map((b,i)=>'<button type="button" role="tab" aria-label="'+(i+1)+' / '+boxes.length+'" aria-selected="'+(i===0)+'"><i></i></button>').join("");
    car.after(dots);
    let order=boxes.map((b,i)=>i);
    const paint=()=>{const d=on();order.forEach((bi,pos)=>{const b=boxes[bi];b.style.setProperty("--i",pos);b.classList.toggle("top",pos===0);b.classList.toggle("deep",pos>2);
        if(d&&pos)b.setAttribute("aria-hidden","true");else b.removeAttribute("aria-hidden")});
      dots.querySelectorAll("button").forEach((d,i)=>d.setAttribute("aria-selected",String(i===order[0])))};
    paint();document.addEventListener("themeicons",paint);
    const toTop=i=>{while(order[0]!==i)order.push(order.shift());paint()};
    dots.addEventListener("click",e=>{const d=e.target.closest("button");if(!d)return;toTop([...dots.children].indexOf(d))});
    /* fling the top card */
    let sx=0,sy=0,dx=0,drag=false,pid=null,card=null;
    car.addEventListener("pointerdown",e=>{if(!on()||e.target.closest("button,select,input,.maseg"))return;card=boxes[order[0]];if(!card.contains(e.target))return;
      sx=e.clientX;sy=e.clientY;dx=0;drag=false;pid=e.pointerId});
    car.addEventListener("pointermove",e=>{if(pid!==e.pointerId||!card)return;const mx=e.clientX-sx,my=e.clientY-sy;
      if(!drag){if(Math.abs(mx)>12&&Math.abs(mx)>Math.abs(my)*1.3){drag=true;card.classList.add("drag");const x=card.querySelector(".xh");if(x)x.setAttribute("visibility","hidden")}else return}
      dx=mx;card.style.transform="translateX("+dx+"px) rotate("+(dx/22)+"deg)"});
    const end=()=>{if(!card){pid=null;return}const c=card;card=null;pid=null;if(!drag)return;c.classList.remove("drag");
      if(Math.abs(dx)>90){c.classList.add("fly");c.style.transform="translateX("+(dx>0?130:-130)+"%) rotate("+(dx>0?16:-16)+"deg)";if(window.sfxRaw)window.sfxRaw("soft");
        setTimeout(()=>{c.classList.remove("fly");c.style.transform="";order.push(order.shift());paint()},260)}
      else c.style.transform=""};
    car.addEventListener("pointerup",end);car.addEventListener("pointercancel",end);
  });
})();
/* hold to confirm (Interior): deleting a day's food logs or a record row asks you to hold the button;
   a dark fill sweeps across while you hold, and letting go early cancels. Keyboard presses keep the usual confirm. */
(function(){
  const SEL="#ddelDayBtn,[data-del]",HOLD=700;let el=null,tm=0,pass=false;
  const on=()=>document.documentElement.getAttribute("data-skin")==="interior";
  const stop=()=>{clearTimeout(tm);if(el)el.classList.remove("holding");el=null};
  document.addEventListener("pointerdown",e=>{const b=e.target.closest(SEL);if(!b||!on())return;stop();el=b;
    b.style.setProperty("--hold",HOLD+"ms");b.classList.add("holding");
    tm=setTimeout(()=>{const b0=el;stop();if(!b0)return;b0.classList.add("held");setTimeout(()=>b0.classList.remove("held"),400);
      if(b0.dataset.del&&typeof pendingDel!=="undefined")pendingDel=b0.dataset.del;
      const c=window.confirm;window.confirm=()=>true;pass=true;try{b0.click()}finally{pass=false;window.confirm=c}},HOLD)},true);
  ["pointerup","pointercancel","pointerleave"].forEach(t=>document.addEventListener(t,stop,true));
  document.addEventListener("click",e=>{const b=e.target.closest(SEL);if(!b||!on()||pass||e.detail===0)return;
    e.stopImmediatePropagation();e.preventDefault();toast(T("按住不放来删除","Hold to delete"))},true);
})();

/* ---------- machine console: the Sync button becomes a spring lever ----------
   Pull the knob down: the lever gets heavier the further it goes and clicks over ratchet notches; past the last notch it
   latches, and letting go fires Sync while the spring throws the lever back up, where it wobbles to rest. Let go
   early and it just springs back. A tap or Enter pulls it all the way by itself. The lamp beside it follows Sync:
   dim before COROS is connected, amber blinking while syncing, green when done. */
(function(){
  const sync=document.getElementById("syncBtn");if(!sync)return;
  const wrap=document.createElement("div");wrap.className="leverbox";
  wrap.innerHTML='<i class="lamp" aria-hidden="true"></i><button type="button" class="lever" aria-label="'+T("同步","Sync")+'"><span class="slot" aria-hidden="true"></span><span class="rod" aria-hidden="true"><b class="ball"></b></span></button>';
  sync.after(wrap);
  const lever=wrap.querySelector(".lever"),rod=wrap.querySelector(".rod"),lamp=wrap.querySelector(".lamp");
  const MAX=30,NOTCH=6,raw=k=>window.sfxRaw&&window.sfxRaw(k);
  let y0=0,dy=0,down=false,notch=0,armed=false;
  const set=v=>{dy=v;rod.style.setProperty("--dy",v.toFixed(1)+"px")};
  const springBack=fire=>{rod.classList.remove("back");void rod.offsetWidth;rod.style.setProperty("--from",dy.toFixed(1)+"px");set(0);rod.classList.add("back");
    raw("spring");if(fire){raw("clunk");setTimeout(()=>sync.click(),60)}};
  lever.addEventListener("pointerdown",e=>{down=true;armed=false;notch=0;y0=e.clientY;rod.classList.remove("back");try{lever.setPointerCapture(e.pointerId)}catch(err){}});
  lever.addEventListener("pointermove",e=>{if(!down)return;const d=Math.max(0,e.clientY-y0),v=MAX*(1-Math.exp(-d/(MAX*1.1)));set(v);
    const n=Math.floor(v/NOTCH);if(n>notch){raw("ratchet");if(navigator.vibrate)navigator.vibrate(4)}notch=n;
    if(!armed&&v>MAX*.88){armed=true;raw("knob");if(navigator.vibrate)navigator.vibrate(12)}});
  const up=()=>{if(!down)return;down=false;if(dy<2){autoPull();return}springBack(armed)};
  lever.addEventListener("pointerup",up);lever.addEventListener("pointercancel",()=>{down=false;springBack(false)});
  function autoPull(){let v=0,n=0;rod.classList.remove("back");const t0=performance.now();
    const step=now=>{v=Math.min(MAX,(now-t0)/220*MAX);set(v);const k=Math.floor(v/NOTCH);if(k>n){raw("ratchet");n=k}
      if(v<MAX)requestAnimationFrame(step);else setTimeout(()=>springBack(true),70)};requestAnimationFrame(step)}
  lever.addEventListener("click",e=>{if(e.detail===0)autoPull()});
  const paintLamp=()=>{const c=sync.classList;lamp.className="lamp "+(c.contains("busy")?"busy":c.contains("done")?"done":c.contains("off")?"off":"ready")};
  new MutationObserver(paintLamp).observe(sync,{attributes:true,attributeFilter:["class"]});paintLamp();
})();

/* ---------- bugs: while the app is worn, little bugs wander over the screen (2, 4 or 7 by wear level). Every
   celebration (fireworks, poppers, arcs, iron flowers...) swats some: each pops in a splat of its colour. They
   creep back while the wear lasts; a tick today ends the wear and pops the rest. ---------- */
const bugs=(function(){
  const BUG='<svg viewBox="0 0 20 24" aria-hidden="true"><g fill="currentColor"><ellipse cx="10" cy="15" rx="5" ry="6.5"/><ellipse cx="10" cy="7.6" rx="3.4" ry="3"/><circle cx="10" cy="3.9" r="2.2"/></g>'
    +'<g class="legs" stroke="currentColor" stroke-width="1.2" fill="none" stroke-linecap="round"><path d="M6 11 2 9M6 14H1.5M6 17l-4 3M14 11l4-2M14 14h4.5M14 17l4 3M9 2 7 0M11 2l2-2"/></g>'
    +'<g class="spots" fill="rgba(0,0,0,.45)"><circle cx="8" cy="13" r="1.2"/><circle cx="12.3" cy="16" r="1.2"/><circle cx="8.6" cy="18.4" r="1"/></g></svg>';
  let list=[],raf=0,last=0,respawn=0;const reduce=()=>matchMedia("(prefers-reduced-motion: reduce)").matches;
  const want=()=>{const w=+document.documentElement.getAttribute("data-wear")||0;return [0,2,4,7][w]};
  function spawn(){const el=document.createElement("div");el.className="bug";el.innerHTML=BUG;document.body.append(el);
    const side=Math.floor(Math.random()*4),W=innerWidth,H=innerHeight;
    const b={el,x:side===1?W+10:side===3?-10:Math.random()*W,y:side===0?-10:side===2?H+10:Math.random()*H,a:Math.random()*6.28,v:22+Math.random()*26,turn:0,pause:0};
    b.a=Math.atan2(H/2-b.y,W/2-b.x)+(Math.random()-.5);list.push(b);place(b)}
  function place(b){b.el.style.transform="translate("+(b.x-10).toFixed(1)+"px,"+(b.y-12).toFixed(1)+"px) rotate("+(b.a*57.3+90).toFixed(1)+"deg)"}
  function tick(now){raf=0;const dt=Math.min(.05,(now-(last||now))/1000);last=now;const W=innerWidth,H=innerHeight;
    list.forEach(b=>{if(b.dead)return;if(b.pause>0){b.pause-=dt;return}
      if(Math.random()<dt*.4)b.pause=.4+Math.random()*1.2;
      b.turn+=(Math.random()-.5)*dt*6;b.turn*=.96;b.a+=b.turn*dt*2;
      b.x+=Math.cos(b.a)*b.v*dt;b.y+=Math.sin(b.a)*b.v*dt;
      if(b.x<8||b.x>W-8)b.a=Math.PI-b.a;if(b.y<8||b.y>H-8)b.a=-b.a;b.x=Math.max(6,Math.min(W-6,b.x));b.y=Math.max(6,Math.min(H-6,b.y));place(b)});
    if(list.length&&!document.hidden)raf=requestAnimationFrame(tick);else last=0}
  function sync(){const n=want();if(!n){killAll();return}
    while(list.filter(b=>!b.dead).length<n&&list.length<n+4)spawn();
    if(!raf&&!reduce())raf=requestAnimationFrame(tick);
    clearInterval(respawn);respawn=setInterval(()=>{if(list.filter(b=>!b.dead).length<want()){spawn();if(!raf&&!reduce())raf=requestAnimationFrame(tick)}},25000)}
  function pop(b){if(b.dead)return;b.dead=true;b.el.classList.add("pop");
    if(window.confetti&&!reduce()){const c=getComputedStyle(b.el).color;const m=c.match(/[\d.]+/g)||[60,50,40];const hex="#"+m.slice(0,3).map(x=>(+x|0).toString(16).padStart(2,"0")).join("");
      window.confetti({particleCount:14,spread:360,startVelocity:9,origin:{x:b.x/innerWidth,y:b.y/innerHeight},colors:[hex],shapes:["circle"],scalar:.45,ticks:45,gravity:.6,zIndex:46,disableForReducedMotion:true})}
    if(window.sfxRaw)window.sfxRaw("pop");
    setTimeout(()=>{b.el.remove();list=list.filter(x=>x!==b)},380)}
  function swat(k){const live=list.filter(b=>!b.dead);live.sort(()=>Math.random()-.5).slice(0,k).forEach((b,i)=>setTimeout(()=>pop(b),150+i*140))}
  function killAll(){clearInterval(respawn);list.filter(b=>!b.dead).forEach((b,i)=>setTimeout(()=>pop(b),i*110))}
  new MutationObserver(sync).observe(document.documentElement,{attributes:true,attributeFilter:["data-wear"]});
  document.addEventListener("visibilitychange",()=>{if(!document.hidden&&list.length&&!raf&&!reduce())raf=requestAnimationFrame(tick)});
  setTimeout(sync,800);
  return {swat,sync}})();

/* ---------- Christmas ----------
   Snow lies on the buttons and bars. Pressing one shakes its snow off (a puff of flakes falls); it settles back over
   five minutes. Sync is a floppy Santa hat: tap it and it slowly fills out while syncing, then becomes Santa. */
(function(){
  const SNOWY=".iconbtn,.tbtn:not(.next),.cap,nav.tabs,.subtabs,.caltoday,.btn,.calnav,.maseg,.hatbox .hat";
  const on=()=>document.documentElement.getAttribute("data-skin")==="xmas";
  const shaken=new Map();
  document.addEventListener("pointerdown",e=>{if(!on())return;const el=e.target.closest(SNOWY);if(!el)return;
    const t=shaken.get(el),left=t?Math.min(1,(Date.now()-t)/300000):1;if(left<.35)return;
    shaken.set(el,Date.now());el.style.setProperty("--snow","0");el.classList.remove("shake");void el.offsetWidth;el.classList.add("shake");
    if(window.sfxRaw)window.sfxRaw("poof");
    if(window.confetti&&!matchMedia("(prefers-reduced-motion: reduce)").matches){const r=el.getBoundingClientRect();
      window.confetti({particleCount:Math.round(8+r.width/6*left),spread:70,angle:90,startVelocity:6,origin:{x:(r.left+r.width/2)/innerWidth,y:r.top/innerHeight},colors:["#FFFFFF","#EEF3F8"],shapes:["circle"],scalar:.55,gravity:.5,ticks:90,zIndex:46,disableForReducedMotion:true})}},true);
  setInterval(()=>{const now=Date.now();shaken.forEach((t,el)=>{if(!el.isConnected){shaken.delete(el);return}const v=Math.min(1,(now-t)/300000);el.style.setProperty("--snow",v.toFixed(3));if(v>=1){shaken.delete(el);el.style.removeProperty("--snow")}})},5000);
  /* the hat */
  const sync=document.getElementById("syncBtn");if(!sync)return;
  const box=document.createElement("div");box.className="hatbox";
  box.innerHTML='<button type="button" class="hat" aria-label="'+T("同步","Sync")+'"><svg viewBox="0 0 56 56" aria-hidden="true">'
    +'<g class="floppy"><path d="M10 40C11 27 19 19 30 18C39 17 45 23 44 30C43.5 34 40 35 38.5 32C37.5 29.5 37 34 36 40Z" fill="#C8102E"/><path d="M30 18C39 17 45 23 44 30C43.5 34 40 35 38.5 32C38 27 35 22 30 18Z" fill="#9E0C24"/><circle cx="40.5" cy="35.5" r="4.6" fill="#fff" stroke="#E4DCCF"/></g>'
    +'<g class="upright"><path d="M12 40C14 28 20 15 27 7C29 5 31 6 31 9C32 19 37 30 41 40Z" fill="#C8102E"/><path d="M27 7C29 5 31 6 31 9C32 19 37 30 41 40H33C32 29 30 17 27 7Z" fill="#9E0C24"/><circle cx="28.5" cy="6.5" r="4.6" fill="#fff" stroke="#E4DCCF"/></g>'
    +'<rect class="brim" x="7" y="38" width="37" height="9" rx="4.5" fill="#fff" stroke="#E4DCCF"/>'
    +'<g class="santa"><path d="M12 24C15 13 24 6 32 6C38 6 42 10 44 15L46 24Z" fill="#C8102E"/><circle cx="45" cy="15.5" r="4" fill="#fff" stroke="#E4DCCF"/>'
    +'<circle cx="28" cy="33" r="10.5" fill="#F5C6A5"/><path d="M15.5 33C15.5 46 21.5 53 28 53S40.5 46 40.5 33C37.5 38 33 39.5 28 39.5S18.5 38 15.5 33Z" fill="#fff" stroke="#E4DCCF"/>'
    +'<rect x="10" y="21" width="36" height="8" rx="4" fill="#fff" stroke="#E4DCCF"/><circle cx="24.4" cy="31.6" r="1.2" fill="#3B2A20"/><circle cx="31.6" cy="31.6" r="1.2" fill="#3B2A20"/>'
    +'<circle cx="21.5" cy="35.4" r="2" fill="#F29C9C" opacity=".7"/><circle cx="34.5" cy="35.4" r="2" fill="#F29C9C" opacity=".7"/><circle cx="28" cy="35" r="1.7" fill="#E89B80"/>'
    +'<path d="M20.5 38.6C23.6 35.6 26.6 36.4 28 37.9C29.4 36.4 32.4 35.6 35.5 38.6C32.4 40.6 29.6 40.1 28 39C26.4 40.1 23.6 40.6 20.5 38.6Z" fill="#fff" stroke="#E4DCCF"/></g>'
    +'</svg></button>';
  sync.after(box);
  const hat=box.querySelector(".hat");let started=0,doneTm=0;
  hat.addEventListener("click",()=>{started=Date.now();box.classList.remove("santa","inflate");void box.offsetWidth;box.classList.add("inflate");sync.click()});
  const follow=()=>{const c=sync.classList;clearTimeout(doneTm);
    if(c.contains("done")){const wait=started?Math.max(0,2600-(Date.now()-started)):0;doneTm=setTimeout(()=>{box.classList.remove("inflate");box.classList.add("santa");started=0},wait)}
    else if(c.contains("busy")){box.classList.remove("santa");box.classList.add("inflate")}
    else if(!started){box.classList.remove("santa","inflate")}};
  new MutationObserver(follow).observe(sync,{attributes:true,attributeFilter:["class"]});follow();
})();
