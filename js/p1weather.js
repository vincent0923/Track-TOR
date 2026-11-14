/* 博G健身 · weather: pick a city (search, or where you are now); the screen shows that city's weather.
   Data: Open-Meteo (no key). Effects draw on one canvas that never takes taps (a tap still melts the drop under it), kept sparse so nothing is hidden.
   settings.weather = {name, lat, lon, off}. The last reading is cached in tracktor-wx. */
ICON.rain='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 15a4.5 4.5 0 0 1-.6-8.96A6 6 0 0 1 18 5.5a4 4 0 0 1 .5 7.97"/><path d="M8 18v2M12 16v3M16 18v2"/></svg>';
const WX_K="tracktor-wx",WX_TTL=20*60e3;
const wxSet=()=>state.settings.weather||null;
function wxCache(){try{return JSON.parse(localStorage.getItem(WX_K)||"null")}catch(e){return null}}
/* Open-Meteo weather code → effect and words. Only rain, snow and fog show on screen; clear and cloudy show nothing */
function wxInfo(code,day,pm){const c=+code;
  if(c===0)return {fx:"none",zh:"晴",en:"Clear"};
  if(c<=2)return {fx:"none",zh:"少云",en:"Partly cloudy"};
  if(c===3)return {fx:"none",zh:"阴",en:"Overcast"};
  if(c===45||c===48)return {fx:"fog",zh:"雾",en:"Fog"};
  if(c>=51&&c<=57)return {fx:"rain",lv:1,zh:"毛毛雨",en:"Drizzle"};
  if(c===61||c===80||c===66)return {fx:"rain",lv:1,zh:"小雨",en:"Light rain"};
  if(c===63||c===81)return {fx:"rain",lv:2,zh:"中雨",en:"Rain"};
  if(c===65||c===82||c===67)return {fx:"rain",lv:3,zh:"大雨",en:"Heavy rain"};
  if((c>=71&&c<=77)||c===85||c===86)return {fx:"snow",lv:c===75||c===86?3:c===73?2:1,zh:"雪",en:"Snow"};
  if(c>=95)return {fx:"rain",lv:3,zh:"雷雨",en:"Thunderstorm"};
  return {fx:"none",zh:"",en:""}}
/* haze has no weather code: PM2.5 from the air-quality service; fog and haze share one effect */
function wxNow(c){const i=wxInfo(c.code,c.day);if(i.fx==="none"&&c.pm!=null&&c.pm>=75)return {fx:"fog",lv:1,zh:"雾霾",en:"Haze"};return i}
async function wxFetch(force){const w=wxSet();if(!w||w.lat==null)return null;const c=wxCache();
  if(!force&&c&&c.lat===w.lat&&c.lon===w.lon&&Date.now()-c.at<WX_TTL)return c;
  try{const r=await fetch("https://api.open-meteo.com/v1/forecast?latitude="+w.lat+"&longitude="+w.lon+"&current=weather_code,temperature_2m,is_day&timezone=auto");
    if(!r.ok)return c;const j=await r.json(),cur=j.current||{};
    let pm=null;try{const a=await fetch("https://air-quality-api.open-meteo.com/v1/air-quality?latitude="+w.lat+"&longitude="+w.lon+"&current=pm2_5");if(a.ok){const q=await a.json();pm=q.current&&q.current.pm2_5}}catch(e){}
    const v={at:Date.now(),lat:w.lat,lon:w.lon,code:cur.weather_code,temp:cur.temperature_2m,day:cur.is_day!==0,pm};
    try{localStorage.setItem(WX_K,JSON.stringify(v))}catch(e){}return v}catch(e){return c}}
function wxLine(c){const w=wxSet();if(!w)return T("还没选城市","No city yet");if(!c||c.code==null)return w.name;
  const i=wxNow(c);return w.name+" · "+T(i.zh,i.en)+(c.temp!=null?" · "+Math.round(c.temp)+"°":"")}

/* ---------- the effect layer ----------
   Rain is water on the glass: beads of uneven shape sit still and slowly dry; when one grows heavy enough it runs
   downhill (the way the phone is tilted), stop-and-go, sweeping up beads in its path and leaving a wet trail with
   tiny beads. Snow drifts down the same way. Tap a drop or a flake and it melts. */
const WX={cv:null,ctx:null,raf:0,fx:"none",lv:1,drops:[],flakes:[],last:0,acc:0,W:0,H:0,dpr:1,preview:0,gx:0,gy:1,tilt:false};
function wxDark(){return document.documentElement.dataset.mode==="dark"}
function wxCanvas(){if(WX.cv)return;const cv=document.createElement("canvas");cv.id="wx";cv.setAttribute("aria-hidden","true");document.body.appendChild(cv);
  WX.cv=cv;WX.ctx=cv.getContext("2d");wxResize();addEventListener("resize",wxResize)}
function wxResize(){if(!WX.cv)return;WX.dpr=Math.min(2,devicePixelRatio||1);WX.W=innerWidth;WX.H=innerHeight;
  WX.cv.width=WX.W*WX.dpr;WX.cv.height=WX.H*WX.dpr}
const wxReduced=()=>matchMedia("(prefers-reduced-motion: reduce)").matches;
/* which way is down on the screen: from the phone's tilt (flat on a table, nothing runs) */
function wxOrient(e){if(e.beta==null||e.gamma==null)return;const rad=Math.PI/180,b=e.beta*rad,g=e.gamma*rad;
  let x=Math.sin(g)*Math.cos(b),y=Math.sin(b);const a=((screen.orientation&&screen.orientation.angle)||window.orientation||0)*rad;
  const rx=x*Math.cos(a)+y*Math.sin(a),ry=-x*Math.sin(a)+y*Math.cos(a);WX.gx+=(rx-WX.gx)*.25;WX.gy+=(ry-WX.gy)*.25;WX.tilt=true}
function wxTiltOn(){if(wxTiltOn.done)return;const D=window.DeviceOrientationEvent;if(!D)return;
  if(typeof D.requestPermission==="function"){wxTiltOn.done=true;D.requestPermission().then(r=>{if(r==="granted")addEventListener("deviceorientation",wxOrient)}).catch(()=>{wxTiltOn.done=false})}
  else{wxTiltOn.done=true;addEventListener("deviceorientation",wxOrient)}}
function wxApply(fx,lv){fx=fx||"none";if(fx!==WX.fx){WX.drops=[];WX.flakes=[]}WX.fx=fx;WX.lv=lv||1;
  if(fx==="none"){cancelAnimationFrame(WX.raf);WX.raf=0;if(WX.cv){WX.ctx.clearRect(0,0,WX.cv.width,WX.cv.height);WX.cv.hidden=true}return}
  wxCanvas();WX.cv.hidden=false;if(!window.DeviceOrientationEvent||typeof DeviceOrientationEvent.requestPermission!=="function")wxTiltOn();
  if(fx==="rain"&&!WX.drops.length){const n=[9,15,21][WX.lv-1];for(let i=0;i<n;i++)WX.drops.push(wxDrop())}
  if(!WX.raf&&!document.hidden){WX.last=performance.now();WX.raf=requestAnimationFrame(wxTick)}}
/* an uneven outline: 10 radii around the bead, smoothed; small beads are almost round */
/* beads at rest are never quite round: an uneven outline (two or three soft lobes where beads met, plus noise),
   stretched one way or the other; the smallest stay nearly round */
function wxShape(r){const n=14,small=r<2.2,irr=small?.05:.12+Math.random()*.14,a2=small?.04:Math.random()*.2,a3=small?0:Math.random()*.12,p2=Math.random()*6.28,p3=Math.random()*6.28;
  let k=Array.from({length:n},(_,i)=>{const t=i/n*Math.PI*2;return 1+a2*Math.cos(2*t+p2)+a3*Math.cos(3*t+p3)+(Math.random()-.5)*irr*2});
  k=k.map((v,i)=>(k[(i+n-1)%n]+v*2+k[(i+1)%n])/4);return k}
function wxDrop(r,x,y){const big=Math.random()<.22;r=r||(big?4+Math.random()*3:1.4+Math.random()*2.2);
  return {x:x??Math.random()*WX.W,y:y??Math.random()*WX.H,r,k:wxShape(r),v:0,slide:false,life:0,max:25+Math.random()*30,trail:[],melt:0,rot:(Math.random()-.5)*1.6,asp:r<2.2?1:.78+Math.random()*.5}}
const WX_CAP=[27,39,51],WX_SLIDERS=[3,4,6],WX_RATE=[1.5,3,4.8];
/* heavy rain: now and then a gust sweeps across from one side and blows the beads off, big ones bursting into small */
function wxGust(dt,D){if(WX.lv<3){WX.gust=null;return}const now=performance.now();if(!WX.nextGust)WX.nextGust=now+8e3+Math.random()*10e3;
  if(!WX.gust&&now>WX.nextGust){WX.gust={dir:Math.random()<.5?-1:1,x:0,v:WX.W*1.6};WX.gust.x=WX.gust.dir>0?-40:WX.W+40;WX.nextGust=now+9e3+Math.random()*12e3}
  const G=WX.gust;if(!G)return;G.x+=G.dir*G.v*dt;
  for(let i=D.length-1;i>=0;i--){const d=D[i];if(d.melt||d.blow)continue;if(G.dir>0?d.x>G.x:d.x<G.x)continue;
    if(Math.random()<.18)continue;                       // a few cling on
    const sp=G.dir*(420+Math.random()*520);d.slide=false;d.blow=sp;d.trail=[];
    if(d.r>3.4){const k=2+(Math.random()*2|0);for(let j=0;j<k;j++){const b=wxDrop(1+Math.random()*1.6,d.x+(Math.random()-.5)*d.r*2,d.y+(Math.random()-.5)*d.r*2);b.blow=sp*(.6+Math.random()*.7);b.lift=(Math.random()-.5)*160;D.push(b)}d.r*=.7;d.k=wxShape(d.r)}
    d.lift=(Math.random()-.5)*120}
  if(G.x<-80||G.x>WX.W+80)WX.gust=null}
function wxRain(dt){const lv=WX.lv-1,D=WX.drops,m=Math.hypot(WX.gx,WX.gy),ux=m>.05?WX.gx/m:0,uy=m>.05?WX.gy/m:1;WX.acc+=dt*WX_RATE[lv];wxGust(dt,D);
  while(WX.acc>=1){WX.acc-=1;const still=D.filter(d=>!d.slide&&!d.melt);
    if(still.length>=WX_CAP[lv]){const d=still[Math.random()*still.length|0];d.r=Math.min(9,Math.hypot(d.r,2.4));d.k=wxShape(d.r)}
    else{const n=wxDrop();const hit=still.find(d=>Math.hypot(d.x-n.x,d.y-n.y)<d.r+n.r);if(hit){hit.r=Math.min(9,Math.hypot(hit.r,n.r));hit.k=wxShape(hit.r);hit.life=0}else D.push(n)}}
  let sliders=D.filter(d=>d.slide).length;
  for(let i=D.length-1;i>=0;i--){const d=D[i];
    if(d.melt){d.melt+=dt*4;if(d.melt>=1)D.splice(i,1);continue}
    if(d.blow){d.x+=d.blow*dt;d.y+=(d.lift||0)*dt+uy*30*dt;d.blow*=Math.pow(.12,dt);d.lift*=Math.pow(.2,dt);d.trail.push({x:d.x,y:d.y});if(d.trail.length>14)d.trail.shift();
      if(Math.abs(d.blow)<30){d.blow=0;d.trail=[];d.life=0}if(d.x<-30||d.x>WX.W+30||d.y<-30||d.y>WX.H+30)D.splice(i,1);continue}
    if(!d.slide){d.life+=dt;if(d.r>4.6&&m>.3&&sliders<WX_SLIDERS[lv]&&Math.random()<dt*.9*m){d.slide=true;sliders++}
      if(d.life>d.max){d.r-=dt*.25;if(d.r<.8)D.splice(i,1)}continue}
    if(m<.2){d.v*=.8;if(d.v<2){d.slide=false;d.life=0}continue}
    /* stop-and-go: drops stick, then let go; heavier and steeper runs faster */
    const vmax=(30+d.r*22)*m;d.v=Math.random()<dt*1.5?d.v*.15:Math.min(vmax,d.v+dt*(120+d.r*30)*m);
    const step=d.v*dt,wob=Math.sin((d.x+d.y)*.05+d.r)*.15;d.x+=ux*step-uy*wob;d.y+=uy*step+ux*wob;
    d.trail.push({x:d.x,y:d.y});if(d.trail.length>40)d.trail.shift();d.r=Math.max(3.6,d.r-step*.004);
    if(Math.random()<step*.02){const b=wxDrop(.9+Math.random()*1.1,d.x-ux*d.r*1.8+(Math.random()-.5)*2,d.y-uy*d.r*1.8);b.max=6+Math.random()*10;D.push(b)}
    for(let j=D.length-1;j>=0;j--){const o=D[j];if(o===d||o.slide||o.melt)continue;if(Math.hypot(o.x-d.x,o.y-d.y)<d.r+o.r*.8){d.r=Math.min(10,Math.hypot(d.r,o.r));D.splice(j,1);if(j<i)i--}}
    if(d.x<-30||d.x>WX.W+30||d.y<-30||d.y>WX.H+30)D.splice(D.indexOf(d),1)}}
/* a closed smooth path through the bead's outline; running beads stretch into a teardrop behind them */
function wxPath(g,d,run){const n=d.k.length;const pts=d.k.map((k,i)=>{const a=i/n*Math.PI*2;let x=Math.cos(a)*d.r*k,y=Math.sin(a)*d.r*k;
    if(y>0)y*=1.1;else y*=run?1.7:.92;if(run&&y<0)x*=1+y/(d.r*3.2);return [x,y]});
  g.beginPath();for(let i=0;i<=n;i++){const p=pts[i%n],q=pts[(i+1)%n],mx=(p[0]+q[0])/2,my=(p[1]+q[1])/2;if(i===0)g.moveTo(mx,my);else g.quadraticCurveTo(p[0],p[1],mx,my)}g.closePath()}
function wxDrawDrop(g,d,dark){const life=d.melt?1-d.melt:1;if(life<=0)return;const run=d.slide||!!d.blow;
  if(run&&d.trail.length>2){g.save();g.lineCap="round";g.lineJoin="round";g.lineWidth=d.r*.75;g.strokeStyle=dark?"rgba(200,220,255,.07)":"rgba(80,100,130,.09)";
    g.beginPath();d.trail.forEach((p,i)=>i?g.lineTo(p.x,p.y):g.moveTo(p.x,p.y));g.stroke();g.restore()}
  const ang=d.blow?Math.atan2((d.lift||0)*.3+20,d.blow)-Math.PI/2:run?Math.atan2(WX.gy,WX.gx)-Math.PI/2:Math.atan2(WX.gy||1,WX.gx)-Math.PI/2+(d.rot||0),r=d.r*(d.melt?1-d.melt*.6:1);
  g.save();g.globalAlpha=life;g.translate(d.x,d.y);g.rotate(ang);if(!run&&d.asp)g.scale(d.asp,1/Math.sqrt(d.asp));const dd={r,k:d.k};
  /* the shadow it casts, a little downhill */
  g.save();g.translate(0,r*.3);wxPath(g,dd,run);g.fillStyle=dark?"rgba(0,0,0,.32)":"rgba(30,50,80,.14)";g.fill();g.restore();
  /* body: almost clear, darker toward the uphill rim where the edge bends the light away */
  wxPath(g,dd,run);g.save();g.clip();
  const b=g.createLinearGradient(0,-r*1.4,0,r);b.addColorStop(0,dark?"rgba(150,175,210,.30)":"rgba(40,60,90,.34)");b.addColorStop(.45,dark?"rgba(255,255,255,.05)":"rgba(255,255,255,.12)");b.addColorStop(1,dark?"rgba(255,255,255,.08)":"rgba(255,255,255,.2)");
  g.fillStyle=b;g.fillRect(-r*2,-r*2.5,r*4,r*4.5);
  /* a lens: the bright sky above shows upside down at the downhill side */
  if(r>1.3){const l=g.createRadialGradient(0,r*.55,0,0,r*.55,r*.95);l.addColorStop(0,dark?"rgba(225,240,255,.42)":"rgba(255,255,255,.85)");l.addColorStop(1,"rgba(255,255,255,0)");g.fillStyle=l;g.fillRect(-r*2,-r*2,r*4,r*4)}
  g.restore();
  /* the rim */
  wxPath(g,dd,run);g.lineWidth=Math.max(.6,r*.12);g.strokeStyle=dark?"rgba(170,195,225,.22)":"rgba(40,60,90,.22)";g.stroke();
  /* glint uphill, not dead centre */
  g.beginPath();g.ellipse(-r*.3,-r*.42,Math.max(.4,r*.2),Math.max(.25,r*.11),-.5,0,7);g.fillStyle="rgba(255,255,255,"+(dark?.75:.95)+")";g.fill();
  g.restore()}
function wxSnow(dt){const n=[21,33,48][WX.lv-1],m=Math.hypot(WX.gx,WX.gy),fx=WX.gx,fy=Math.max(.35,WX.gy);
  while(WX.flakes.length<n)WX.flakes.push({x:Math.random()*WX.W,y:-10-Math.random()*WX.H,r:1.2+Math.random()*2.8,vy:14+Math.random()*26,p:Math.random()*6,melt:0});
  for(let i=WX.flakes.length-1;i>=0;i--){const f=WX.flakes[i];if(f.melt){f.melt+=dt*3;if(f.melt>=1){WX.flakes.splice(i,1)}continue}
    f.y+=f.vy*fy*dt;f.x+=f.vy*fx*dt+Math.sin(f.p)*.35;f.p+=dt*.8;
    if(f.y>WX.H+10){f.y=-10;f.x=Math.random()*WX.W}if(f.x<-20)f.x=WX.W+10;if(f.x>WX.W+20)f.x=-10}}
/* tapping melts what's under the finger; the tap itself still reaches the page */
document.addEventListener("pointerdown",e=>{if(WX.fx==="none")return;if(typeof DeviceOrientationEvent!=="undefined"&&typeof DeviceOrientationEvent.requestPermission==="function")wxTiltOn();
  const x=e.clientX,y=e.clientY;WX.drops.forEach(d=>{if(!d.melt&&Math.hypot(d.x-x,d.y-y)<d.r+16)d.melt=.01});
  WX.flakes.forEach(f=>{if(!f.melt&&Math.hypot(f.x-x,f.y-y)<f.r+18)f.melt=.01})},{capture:true,passive:true});
/* 30 frames a second is enough for drops and flakes and halves the cost of the full-screen canvas */
function wxTick(now){if(now-WX.last<30){WX.raf=requestAnimationFrame(wxTick);return}const dt=Math.min(.07,(now-WX.last)/1000);WX.last=now;const g=WX.ctx,dark=wxDark(),reduce=wxReduced();
  g.setTransform(WX.dpr,0,0,WX.dpr,0,0);g.clearRect(0,0,WX.W,WX.H);
  if(WX.fx==="rain"){if(!reduce)wxRain(dt);else WX.drops.forEach(d=>{if(d.melt)d.melt=Math.min(1,d.melt+dt*4)});WX.drops.forEach(d=>wxDrawDrop(g,d,dark))}
  else if(WX.fx==="snow"){if(!reduce)wxSnow(dt);else if(!WX.flakes.length){wxSnow(0);WX.flakes.forEach(f=>f.y=Math.random()*WX.H)}
    WX.flakes.forEach(f=>{const a=Math.max(0,Math.min(1,(WX.H-f.y)/120))*(f.melt?1-f.melt:1),r=f.r*(f.melt?1+f.melt*.6:1);
      if(!dark){g.beginPath();g.arc(f.x,f.y+.6,r+.7,0,7);g.fillStyle="rgba(90,110,140,"+(.22*a)+")";g.fill()}
      const rg=g.createRadialGradient(f.x,f.y,0,f.x,f.y,r);rg.addColorStop(0,"rgba(255,255,255,"+(.95*a)+")");rg.addColorStop(1,"rgba(255,255,255,"+(.25*a)+")");
      g.beginPath();g.arc(f.x,f.y,r,0,7);g.fillStyle=rg;g.fill()})}
  else if(WX.fx==="fog"){const t=now/1000;WX.fogA=Math.min(1,(WX.fogA??1)+dt*.22);const A=WX.fogA,c0=dark?"170,185,205":"140,155,175";
    /* the veil: a few slow, wide patches */
    for(let i=0;i<3;i++){const x=((t*(4+i*2)+i*WX.W*.5)%(WX.W*1.6))-WX.W*.3,y=WX.H*(.2+i*.3),R=WX.W*.8;
      const rg=g.createRadialGradient(x,y,0,x,y,R);rg.addColorStop(0,"rgba("+c0+","+((dark?.12:.17)*A)+")");rg.addColorStop(1,"rgba("+c0+",0)");g.fillStyle=rg;g.fillRect(0,0,WX.W,WX.H)}
    /* now and then a thin wisp of mist drifts across */
    if(!WX.wisp&&!reduce&&Math.random()<dt/7)WX.wisp={x:-WX.W*.6,y:WX.H*(.15+Math.random()*.7),v:WX.W*(.09+Math.random()*.06),h:60+Math.random()*80};
    const w=WX.wisp;if(w){w.x+=w.v*dt;g.save();g.translate(w.x,w.y);g.scale(1,w.h/(WX.W*.5));const rg=g.createRadialGradient(0,0,0,0,0,WX.W*.5);
      rg.addColorStop(0,"rgba("+(dark?"200,212,230":"250,252,255")+","+((dark?.22:.5)*A)+")");rg.addColorStop(1,"rgba(255,255,255,0)");g.fillStyle=rg;g.fillRect(-WX.W*.5,-WX.W*.5,WX.W,WX.W);g.restore();if(w.x>WX.W*1.6)WX.wisp=null}}
  /* no motion wanted: draw once and stop */
  if(reduce&&!WX.drops.some(d=>d.melt>0&&d.melt<1)){WX.raf=0;return}
  WX.raf=requestAnimationFrame(wxTick)}
document.addEventListener("visibilitychange",()=>{if(document.hidden){cancelAnimationFrame(WX.raf);WX.raf=0}else{wxRefresh(false)}});

/* swiping a card stirs the air: the fog clears, then slowly comes back */
addEventListener("fs-swipe",()=>{if(WX.fx==="fog"){WX.fogA=0;WX.wisp=null}});
/* the real weather, unless a preview is on */
async function wxRefresh(force){if(WX.preview)return;const w=wxSet();if(!w||w.lat==null){wxApply("none");return}
  const c=wxCache();if(c&&c.lat===w.lat&&c.lon===w.lon){const i=wxNow(c);wxApply(i.fx,i.lv)}
  const n=await wxFetch(force);if(n&&!WX.preview&&wxSet()){const i=wxNow(n);wxApply(i.fx,i.lv)}return n}
setInterval(()=>{if(!document.hidden)wxRefresh(false)},5*60e3);

/* ---------- settings: city and effects ---------- */
function wxPick(name,lat,lon){state.settings.weather={name,lat:+(+lat).toFixed(3),lon:+(+lon).toFixed(3)};lsSave();const S=document.querySelectorAll("[data-wo]");S.forEach(x=>x.classList.toggle("active",x.dataset.wo==="1"))}
function openWeather(){const w=wxSet(),on=!!(w&&w.lat!=null);
  const prev=[["rain",1,"小雨","Light rain"],["rain",3,"大雨","Heavy rain"],["snow",2,"雪","Snow"],["fog",1,"雾 · 霾","Fog · haze"]];
  const S=p1Sheet(T("天气","Weather"),'<p class="wxnow" id="wxn">'+ICON.rain+'<span>'+esc(wxLine(wxCache()))+'</span></p>'
    +'<button type="button" class="btn ghost wxhere" data-here>'+T("用我现在的位置","Use where I am")+'</button>'
    +'<label class="flabel">'+T("或者搜一个城市","Or search any city")+'<input id="wxq" type="search" autocomplete="off" placeholder="'+T("例如 上海、Tokyo、London","e.g. Shanghai, Tokyo, London")+'"></label><div class="wxres" id="wxr"></div>'
    +'<p class="eyebrow" style="margin-top:6px">'+T("屏幕效果","Screen effect")+'</p><div class="mode-tabs" role="group"><button type="button" data-wo="1" class="'+(on?"active":"")+'">'+T("开","On")+'</button><button type="button" data-wo="0" class="'+(on?"":"active")+'">'+T("关","Off")+'</button></div>'
    +'<p class="eyebrow" style="margin-top:6px">'+T("试看","Preview")+'</p><div class="chips">'+prev.map(([f,l,z,e])=>'<button type="button" class="chip" data-pv="'+f+'" data-lv="'+l+'">'+T(z,e)+'</button>').join("")+'</div>',
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
  S.m.addEventListener("click",e=>{const o=e.target.closest("[data-wo]");if(o){const v=o.dataset.wo==="1";
      /* off forgets the city; on needs one, so it points to the search */
      if(!v){delete state.settings.weather;try{localStorage.removeItem(WX_K)}catch(err){}lsSave();S.q("#wxn span").textContent=wxLine(null);if(!WX.preview)wxApply("none")}
      else if(!wxSet()){S.q("#wxq").focus();toast(T("选一个城市就打开了","Pick a city to turn it on"));return}
      S.m.querySelectorAll("[data-wo]").forEach(x=>x.classList.toggle("active",x===o));return}
    const p=e.target.closest("[data-pv]");if(p){clearTimeout(WX.preview);const f=p.dataset.pv;WX.preview=0;wxApply("none");
      /* a 10-second look: the chip fills up as it runs, and the real weather comes back after */
      S.m.querySelectorAll("[data-pv]").forEach(x=>x.classList.remove("run"));void p.offsetWidth;p.classList.add("run");
      WX.preview=setTimeout(()=>{WX.preview=0;p.classList.remove("run");wxApply("none");wxRefresh(false)},10e3);wxApply(f,+p.dataset.lv);wxTiltOn()}})}
p1Reg("weather",openWeather);
/* an effect switched off used to keep the city with off:true; off now means no city */
if(state.settings.weather&&(state.settings.weather.off||state.settings.weather.lat==null)){delete state.settings.weather;lsSave()}
wxRefresh(false);
