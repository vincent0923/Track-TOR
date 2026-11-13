/* 推拉机 · weather: pick a city (search, or where you are now); the screen shows that city's weather.
   Data: Open-Meteo (no key). Effects draw on one canvas that never takes taps, kept sparse so nothing is hidden.
   settings.weather = {name, lat, lon, off}. The last reading is cached in tracktor-wx. */
ICON.rain='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 15a4.5 4.5 0 0 1-.6-8.96A6 6 0 0 1 18 5.5a4 4 0 0 1 .5 7.97"/><path d="M8 18v2M12 16v3M16 18v2"/></svg>';
const WX_K="tracktor-wx",WX_TTL=20*60e3;
const wxSet=()=>state.settings.weather||null;
function wxCache(){try{return JSON.parse(localStorage.getItem(WX_K)||"null")}catch(e){return null}}
/* Open-Meteo weather code → effect and words */
function wxInfo(code,day){const c=+code;
  if(c===0)return {fx:day?"sun":"none",zh:"晴",en:"Clear"};
  if(c<=2)return {fx:"none",zh:"少云",en:"Partly cloudy"};
  if(c===3)return {fx:"cloud",zh:"阴",en:"Overcast"};
  if(c===45||c===48)return {fx:"fog",zh:"雾",en:"Fog"};
  if(c>=51&&c<=57)return {fx:"rain",lv:1,zh:"毛毛雨",en:"Drizzle"};
  if(c===61||c===80||c===66)return {fx:"rain",lv:1,zh:"小雨",en:"Light rain"};
  if(c===63||c===81)return {fx:"rain",lv:2,zh:"中雨",en:"Rain"};
  if(c===65||c===82||c===67)return {fx:"rain",lv:3,zh:"大雨",en:"Heavy rain"};
  if((c>=71&&c<=77)||c===85||c===86)return {fx:"snow",lv:c===75||c===86?3:c===73?2:1,zh:"雪",en:"Snow"};
  if(c>=95)return {fx:"rain",lv:3,storm:true,zh:"雷雨",en:"Thunderstorm"};
  return {fx:"none",zh:"",en:""}}
async function wxFetch(force){const w=wxSet();if(!w||w.lat==null)return null;const c=wxCache();
  if(!force&&c&&c.lat===w.lat&&c.lon===w.lon&&Date.now()-c.at<WX_TTL)return c;
  try{const r=await fetch("https://api.open-meteo.com/v1/forecast?latitude="+w.lat+"&longitude="+w.lon+"&current=weather_code,temperature_2m,is_day&timezone=auto");
    if(!r.ok)return c;const j=await r.json(),cur=j.current||{};
    const v={at:Date.now(),lat:w.lat,lon:w.lon,code:cur.weather_code,temp:cur.temperature_2m,day:cur.is_day!==0};
    try{localStorage.setItem(WX_K,JSON.stringify(v))}catch(e){}return v}catch(e){return c}}
function wxLine(c){const w=wxSet();if(!w)return T("还没选城市","No city yet");if(!c||c.code==null)return w.name;
  const i=wxInfo(c.code,c.day);return w.name+" · "+T(i.zh,i.en)+(c.temp!=null?" · "+Math.round(c.temp)+"°":"")}

/* ---------- the effect layer ---------- */
const WX={cv:null,ctx:null,raf:0,fx:"none",lv:1,storm:false,drops:[],flakes:[],flash:0,nextBolt:0,last:0,acc:0,W:0,H:0,dpr:1,preview:0};
function wxDark(){return document.documentElement.dataset.mode==="dark"}
function wxCanvas(){if(WX.cv)return;const cv=document.createElement("canvas");cv.id="wx";cv.setAttribute("aria-hidden","true");document.body.appendChild(cv);
  WX.cv=cv;WX.ctx=cv.getContext("2d");wxResize();addEventListener("resize",wxResize)}
function wxResize(){if(!WX.cv)return;WX.dpr=Math.min(2,devicePixelRatio||1);WX.W=innerWidth;WX.H=innerHeight;
  WX.cv.width=WX.W*WX.dpr;WX.cv.height=WX.H*WX.dpr}
const wxReduced=()=>matchMedia("(prefers-reduced-motion: reduce)").matches;
function wxApply(fx,lv,storm){fx=fx||"none";if(fx!==WX.fx){WX.drops=[];WX.flakes=[]}WX.fx=fx;WX.lv=lv||1;WX.storm=!!storm;
  if(fx==="none"){cancelAnimationFrame(WX.raf);WX.raf=0;if(WX.cv)WX.ctx.clearRect(0,0,WX.cv.width,WX.cv.height);if(WX.cv)WX.cv.hidden=true;return}
  wxCanvas();WX.cv.hidden=false;
  if(fx==="rain"&&!WX.drops.length){const n=[6,10,14][WX.lv-1];for(let i=0;i<n;i++)WX.drops.push(wxDrop())}
  if(!WX.raf&&!document.hidden){WX.last=performance.now();WX.raf=requestAnimationFrame(wxTick)}}
/* raindrops on glass: most sit still and slowly dry; a few grow, then slide down, pick up drops in their way
   and leave a thin wet trail with tiny beads */
function wxDrop(r,x,y){const big=Math.random()<.22;
  return {x:x??Math.random()*WX.W,y:y??Math.random()*WX.H,r:r||(big?4+Math.random()*2.5:1.6+Math.random()*2),vy:0,slide:false,life:0,max:25+Math.random()*30,tr:0}}
const WX_CAP=[18,26,34],WX_SLIDERS=[2,3,4],WX_RATE=[1,2,3.2];
function wxRain(dt){const lv=WX.lv-1,D=WX.drops;WX.acc+=dt*WX_RATE[lv];
  while(WX.acc>=1){WX.acc-=1;const still=D.filter(d=>!d.slide);
    if(still.length>=WX_CAP[lv]){const d=still[Math.random()*still.length|0];d.r=Math.min(8,Math.hypot(d.r,2.4))}
    else{const n=wxDrop();const hit=still.find(d=>Math.hypot(d.x-n.x,d.y-n.y)<d.r+n.r);if(hit){hit.r=Math.min(8,Math.hypot(hit.r,n.r));hit.life=0}else D.push(n)}}
  let sliders=D.filter(d=>d.slide).length;
  for(let i=D.length-1;i>=0;i--){const d=D[i];
    if(!d.slide){d.life+=dt;if(d.r>6.8&&sliders<WX_SLIDERS[lv]&&Math.random()<dt*.6){d.slide=true;sliders++}
      if(d.life>d.max){d.r-=dt*.25;if(d.r<.8)D.splice(i,1)}continue}
    /* stop-and-go: drops stick, then let go */
    const vmax=30+d.r*22;d.vy=Math.random()<dt*1.5?d.vy*.15:Math.min(vmax,d.vy+dt*(120+d.r*30));
    const dy=d.vy*dt;d.y+=dy;d.x+=Math.sin(d.y*.05+d.r)*.15;d.tr=Math.min(70,d.tr+dy);
    d.r=Math.max(3.6,d.r-dy*.004);
    if(Math.random()<dy*.02&&d.y<WX.H){const b=wxDrop(1+Math.random()*1.1,d.x+(Math.random()-.5)*2,d.y-d.r*1.6);b.max=6+Math.random()*10;D.push(b)}
    for(let j=D.length-1;j>=0;j--){const o=D[j];if(o===d||o.slide)continue;if(Math.abs(o.x-d.x)<d.r+o.r*.8&&Math.abs(o.y-d.y)<d.r+o.r*.8){d.r=Math.min(9,Math.hypot(d.r,o.r));D.splice(j,1);if(j<i)i--}}
    if(d.y-d.r>WX.H+10)D.splice(D.indexOf(d),1)}}
function wxDrawDrop(g,d,dark){const r=d.r,s=d.slide?1.18:1.04;g.save();g.translate(d.x,d.y);
  if(d.slide&&d.tr>4){const tg=g.createLinearGradient(0,-d.tr,0,0);tg.addColorStop(0,"rgba(255,255,255,0)");tg.addColorStop(1,dark?"rgba(255,255,255,.07)":"rgba(90,110,140,.10)");
    g.fillStyle=tg;g.fillRect(-r*.45,-d.tr,r*.9,d.tr)}
  g.scale(1,s);
  /* soft shadow a little below */
  g.beginPath();g.arc(0,r*.28,r*1.02,0,7);g.fillStyle=dark?"rgba(0,0,0,.28)":"rgba(40,60,90,.13)";g.fill();
  /* body: clear centre, darker rim */
  const b=g.createRadialGradient(-r*.15,-r*.25,r*.1,0,0,r);b.addColorStop(0,"rgba(255,255,255,.04)");b.addColorStop(.75,dark?"rgba(255,255,255,.08)":"rgba(255,255,255,.18)");b.addColorStop(1,dark?"rgba(190,210,235,.34)":"rgba(60,80,110,.40)");
  g.beginPath();g.arc(0,0,r,0,7);g.fillStyle=b;g.fill();
  /* light gathers at the bottom like a lens */
  if(r>1.2){const l=g.createLinearGradient(0,-r,0,r);l.addColorStop(.45,"rgba(255,255,255,0)");l.addColorStop(1,dark?"rgba(220,235,255,.38)":"rgba(255,255,255,.75)");
    g.beginPath();g.arc(0,0,r*.86,0,7);g.fillStyle=l;g.fill()}
  /* glint */
  g.beginPath();g.ellipse(-r*.32,-r*.38,Math.max(.4,r*.22),Math.max(.3,r*.15),-.6,0,7);g.fillStyle="rgba(255,255,255,"+(dark?.7:.95)+")";g.fill();
  g.restore()}
function wxSnow(dt){const n=[14,22,32][WX.lv-1];while(WX.flakes.length<n)WX.flakes.push({x:Math.random()*WX.W,y:-10-Math.random()*WX.H,r:1.2+Math.random()*2.6,vy:14+Math.random()*26,p:Math.random()*6});
  WX.flakes.forEach(f=>{f.y+=f.vy*dt;f.p+=dt*.8;f.x+=Math.sin(f.p)*.35;if(f.y>WX.H+10){f.y=-10;f.x=Math.random()*WX.W}})}
function wxTick(now){const dt=Math.min(.05,(now-WX.last)/1000);WX.last=now;const g=WX.ctx,dark=wxDark(),reduce=wxReduced();
  g.setTransform(WX.dpr,0,0,WX.dpr,0,0);g.clearRect(0,0,WX.W,WX.H);
  if(WX.fx==="rain"){if(!reduce)wxRain(dt);WX.drops.forEach(d=>wxDrawDrop(g,d,dark));
    if(WX.storm&&!reduce){if(now>WX.nextBolt){WX.flash=1;WX.nextBolt=now+12e3+Math.random()*25e3}
      if(WX.flash>0){g.fillStyle=dark?"rgba(220,230,255,"+(WX.flash*.14)+")":"rgba(30,40,70,"+(WX.flash*.07)+")";g.fillRect(0,0,WX.W,WX.H);WX.flash-=dt*(WX.flash>.5?2.5:1.2)}}}
  else if(WX.fx==="snow"){if(!reduce)wxSnow(dt);else if(!WX.flakes.length){wxSnow(0);WX.flakes.forEach(f=>f.y=Math.random()*WX.H)}
    WX.flakes.forEach(f=>{const a=Math.max(0,Math.min(1,(WX.H-f.y)/120));
      if(!dark){g.beginPath();g.arc(f.x,f.y+.6,f.r+.7,0,7);g.fillStyle="rgba(90,110,140,"+(.22*a)+")";g.fill()}
      const rg=g.createRadialGradient(f.x,f.y,0,f.x,f.y,f.r);rg.addColorStop(0,"rgba(255,255,255,"+(.95*a)+")");rg.addColorStop(1,"rgba(255,255,255,"+(.25*a)+")");
      g.beginPath();g.arc(f.x,f.y,f.r,0,7);g.fillStyle=rg;g.fill()})}
  else if(WX.fx==="sun"){const t=now/4000,R=Math.max(WX.W,WX.H)*.75*(1+Math.sin(t)*.03),rg=g.createRadialGradient(WX.W,0,0,WX.W,0,R);
    rg.addColorStop(0,dark?"rgba(255,190,90,.16)":"rgba(255,180,60,.20)");rg.addColorStop(1,"rgba(255,190,90,0)");g.fillStyle=rg;g.fillRect(0,0,WX.W,WX.H)}
  else if(WX.fx==="fog"||WX.fx==="cloud"){const t=now/1000,fog=WX.fx==="fog";
    for(let i=0;i<(fog?4:2);i++){const x=((t*(6+i*3)+i*WX.W*.4)%(WX.W*1.6))-WX.W*.3,y=fog?WX.H*(.2+i*.22):WX.H*.05+i*40,R=WX.W*(fog?.7:.6);
      const rg=g.createRadialGradient(x,y,0,x,y,R);rg.addColorStop(0,dark?"rgba(170,185,205,"+(fog?.10:.07)+")":"rgba(140,155,175,"+(fog?.14:.09)+")");rg.addColorStop(1,"rgba(150,160,180,0)");g.fillStyle=rg;g.fillRect(0,0,WX.W,WX.H)}}
  /* no motion wanted: draw once and stop */
  if(reduce&&!(WX.storm&&WX.flash>0)){WX.raf=0;return}
  WX.raf=requestAnimationFrame(wxTick)}
document.addEventListener("visibilitychange",()=>{if(document.hidden){cancelAnimationFrame(WX.raf);WX.raf=0}else{wxRefresh(false)}});

/* the real weather, unless a preview is on */
async function wxRefresh(force){if(WX.preview)return;const w=wxSet();if(!w||w.off||w.lat==null){wxApply("none");return}
  const c=wxCache();if(c&&c.lat===w.lat&&c.lon===w.lon){const i=wxInfo(c.code,c.day);wxApply(i.fx,i.lv,i.storm)}
  const n=await wxFetch(force);if(n&&!WX.preview&&!(wxSet()||{}).off){const i=wxInfo(n.code,n.day);wxApply(i.fx,i.lv,i.storm)}return n}
setInterval(()=>{if(!document.hidden)wxRefresh(false)},5*60e3);

/* ---------- settings: city and effects ---------- */
function wxPick(name,lat,lon){const old=wxSet()||{};state.settings.weather={name,lat:+(+lat).toFixed(3),lon:+(+lon).toFixed(3),off:!!old.off};lsSave()}
function openWeather(){const w=wxSet(),on=!(w&&w.off);
  const prev=[["rain",1,"小雨","Light rain"],["rain",3,"大雨","Heavy rain"],["storm",3,"雷雨","Storm"],["snow",2,"雪","Snow"],["fog",1,"雾","Fog"],["sun",1,"晴","Sun"]];
  const S=p1Sheet(T("天气","Weather"),'<p class="wxnow" id="wxn">'+ICON.rain+'<span>'+esc(wxLine(wxCache()))+'</span></p>'
    +'<button type="button" class="btn ghost wxhere" data-here>'+T("用我现在的位置","Use where I am")+'</button>'
    +'<label class="flabel">'+T("或者搜一个城市","Or search any city")+'<input id="wxq" type="search" autocomplete="off" placeholder="'+T("例如 上海、Tokyo、London","e.g. Shanghai, Tokyo, London")+'"></label><div class="wxres" id="wxr"></div>'
    +'<p class="eyebrow" style="margin-top:6px">'+T("屏幕效果","Screen effect")+'</p><div class="mode-tabs" role="group"><button type="button" data-wo="1" class="'+(on?"active":"")+'">'+T("开","On")+'</button><button type="button" data-wo="0" class="'+(on?"":"active")+'">'+T("关","Off")+'</button></div>'
    +'<p class="eyebrow" style="margin-top:6px">'+T("试看 15 秒","Preview for 15 s")+'</p><div class="chips">'+prev.map(([f,l,z,e])=>'<button type="button" class="chip" data-pv="'+f+'" data-lv="'+l+'">'+T(z,e)+'</button>').join("")+'</div>',
    '<span></span>');
  const line=async(force)=>{S.q("#wxn span").textContent=T("读取天气…","Getting the weather…");const c=await wxRefresh(force);S.q("#wxn span").textContent=wxLine(c||wxCache())};
  S.q("[data-here]").addEventListener("click",()=>{if(!navigator.geolocation){toast(T("这台设备不能定位","This device can't locate"));return}
    S.q("#wxn span").textContent=T("定位中…","Locating…");
    navigator.geolocation.getCurrentPosition(async p=>{const lat=p.coords.latitude,lon=p.coords.longitude;let name=T("我的位置","Where I am");
      try{const r=await fetch("https://api.bigdatacloud.net/data/reverse-geocode-client?latitude="+lat+"&longitude="+lon+"&localityLanguage="+(LANG==="en"?"en":"zh"));const j=await r.json();name=j.city||j.locality||j.principalSubdivision||name}catch(e){}
      wxPick(name,lat,lon);line(true)},()=>{S.q("#wxn span").textContent=wxLine(wxCache());toast(T("没拿到位置，可以搜城市","No location; search a city instead"))},{timeout:12e3,maximumAge:6e5})});
  let tm=0,seq=0;S.q("#wxq").addEventListener("input",e=>{clearTimeout(tm);const q=e.target.value.trim(),box=S.q("#wxr");if(q.length<1){box.innerHTML="";return}
    tm=setTimeout(async()=>{const my=++seq;try{const r=await fetch("https://geocoding-api.open-meteo.com/v1/search?count=8&language="+(LANG==="en"?"en":"zh")+"&name="+encodeURIComponent(q));const j=await r.json();if(my!==seq)return;
      box.innerHTML=(j.results||[]).map(x=>'<button type="button" class="opt" data-lat="'+x.latitude+'" data-lon="'+x.longitude+'" data-n="'+esc(x.name)+'"><span class="sp"><b>'+esc(x.name)+'</b> <span class="muted">'+esc([x.admin1,x.country].filter(Boolean).join(", "))+'</span></span></button>').join("")||'<p class="muted" style="font-size:13px">'+T("没找到","Nothing found")+'</p>'}
      catch(err){if(my===seq)box.innerHTML='<p class="muted" style="font-size:13px">'+T("连不上，稍后再试","Can't connect; try later")+'</p>'}},300)});
  S.q("#wxr").addEventListener("click",e=>{const b=e.target.closest("[data-lat]");if(!b)return;wxPick(b.dataset.n,b.dataset.lat,b.dataset.lon);S.q("#wxq").value="";S.q("#wxr").innerHTML="";line(true)});
  S.m.addEventListener("click",e=>{const o=e.target.closest("[data-wo]");if(o){const v=o.dataset.wo==="1";const cur=wxSet();
      if(cur)cur.off=!v;else if(!v)state.settings.weather={name:"",lat:null,lon:null,off:true};lsSave();S.m.querySelectorAll("[data-wo]").forEach(x=>x.classList.toggle("active",x===o));
      if(!v&&!WX.preview)wxApply("none");else wxRefresh(false);return}
    const p=e.target.closest("[data-pv]");if(p){clearTimeout(WX.preview);const f=p.dataset.pv;WX.preview=0;wxApply("none");
      WX.preview=setTimeout(()=>{WX.preview=0;wxApply("none");wxRefresh(false)},15e3);wxApply(f==="storm"?"rain":f,+p.dataset.lv,f==="storm");if(f==="storm")WX.nextBolt=0}})}
p1Reg("weather",openWeather);
wxRefresh(false);
