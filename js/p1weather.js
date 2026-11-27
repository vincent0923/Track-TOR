/* 博G · weather: pick a city (search, or where you are now); the screen shows that city's weather.
   Data: Open-Meteo (no key). Effects draw on one canvas that never takes taps (a tap still melts the drop under it), kept sparse so nothing is hidden.
   settings.weather = {name, lat, lon, off}. The last reading is cached in tracktor-wx. */
ICON.rain='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 15a4.5 4.5 0 0 1-.6-8.96A6 6 0 0 1 18 5.5a4 4 0 0 1 .5 7.97"/><path d="M8 18v2M12 16v3M16 18v2"/></svg>';
const WX_K="tracktor-wx",WX_TTL=20*60e3;
const wxSet=()=>state.settings.weather||null;
function wxCache(){try{return JSON.parse(localStorage.getItem(WX_K)||"null")}catch(e){return null}}
/* Open-Meteo weather code → effect and words. Only rain and snow show on screen; clear, cloudy and fog show nothing */
function wxInfo(code,day,pm){const c=+code;
  if(c===0)return {fx:"none",zh:"晴",en:"Clear"};
  if(c<=2)return {fx:"none",zh:"少云",en:"Partly cloudy"};
  if(c===3)return {fx:"none",zh:"阴",en:"Overcast"};
  if(c===45||c===48)return {fx:"none",zh:"雾",en:"Fog"};
  if(c>=51&&c<=57)return {fx:"rain",lv:1,zh:"毛毛雨",en:"Drizzle"};
  if(c===61||c===80||c===66)return {fx:"rain",lv:1,zh:"小雨",en:"Light rain"};
  if(c===63||c===81)return {fx:"rain",lv:2,zh:"中雨",en:"Rain"};
  if(c===65||c===82||c===67)return {fx:"rain",lv:3,zh:"大雨",en:"Heavy rain"};
  if((c>=71&&c<=77)||c===85||c===86)return {fx:"snow",lv:c===75||c===86?3:c===73?2:1,zh:"雪",en:"Snow"};
  if(c>=95)return {fx:"rain",lv:3,zh:"雷雨",en:"Thunderstorm"};
  return {fx:"none",zh:"",en:""}}
/* haze has no weather code: PM2.5 from the air-quality service; it is named, not shown */
function wxNow(c){const i=wxInfo(c.code,c.day);if(i.fx==="none"&&c.pm!=null&&c.pm>=75)return {fx:"none",zh:"雾霾",en:"Haze"};return i}
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
const WX={cv:null,ctx:null,raf:0,fx:"none",lv:1,drops:[],flakes:[],last:0,acc:0,W:0,H:0,dpr:1,gx:0,gy:1,tilt:false};
function wxDark(){return document.documentElement.dataset.mode==="dark"}
/* two layers: #wxs holds the beads at rest and is redrawn only when they change (a bead lands, merges, starts to run or
   dries a little, or the phone turns enough to swing them), #wx holds what moves (running and melting beads, snow, mist)
   and is left alone when nothing moves. Most of the time it rains, nothing at all is drawn */
function wxCanvas(){if(WX.cv)return;const mk=id=>{const cv=document.createElement("canvas");cv.id=id;cv.className="wxl";cv.setAttribute("aria-hidden","true");document.body.appendChild(cv);return cv};
  WX.cs=mk("wxs");WX.cx=WX.cs.getContext("2d");WX.cv=mk("wx");WX.ctx=WX.cv.getContext("2d");wxResize();addEventListener("resize",wxResize)}
function wxResize(){if(!WX.cv)return;WX.dpr=Math.min(2,devicePixelRatio||1);WX.W=innerWidth;WX.H=innerHeight;
  [WX.cv,WX.cs].forEach(c=>{c.width=WX.W*WX.dpr;c.height=WX.H*WX.dpr});WX.sSig=null;WX.dyn=1}
const wxReduced=()=>matchMedia("(prefers-reduced-motion: reduce)").matches;
/* which way is down on the screen: from the phone's tilt (flat on a table, nothing runs) */
function wxOrient(e){if(e.beta==null||e.gamma==null)return;const rad=Math.PI/180,b=e.beta*rad,g=e.gamma*rad;
  let x=Math.sin(g)*Math.cos(b),y=Math.sin(b);const a=((screen.orientation&&screen.orientation.angle)||window.orientation||0)*rad;
  const rx=x*Math.cos(a)+y*Math.sin(a),ry=-x*Math.sin(a)+y*Math.cos(a);WX.gx+=(rx-WX.gx)*.25;WX.gy+=(ry-WX.gy)*.25;WX.tilt=true}
function wxTiltOn(){if(wxTiltOn.done)return;const D=window.DeviceOrientationEvent;if(!D)return;
  if(typeof D.requestPermission==="function"){wxTiltOn.done=true;D.requestPermission().then(r=>{if(r==="granted")addEventListener("deviceorientation",wxOrient)}).catch(()=>{wxTiltOn.done=false})}
  else{wxTiltOn.done=true;addEventListener("deviceorientation",wxOrient)}}
function wxApply(fx,lv){fx=fx||"none";if(fx!==WX.fx){WX.drops=[];WX.flakes=[]}WX.fx=fx;WX.lv=lv||1;
  if(fx==="none"){cancelAnimationFrame(WX.raf);WX.raf=0;if(WX.cv){[WX.ctx,WX.cx].forEach(g=>{g.setTransform(1,0,0,1,0,0);g.clearRect(0,0,WX.cv.width,WX.cv.height)});WX.cv.hidden=WX.cs.hidden=true;WX.sSig=null}return}
  wxCanvas();WX.cv.hidden=WX.cs.hidden=false;WX.sSig=null;WX.dyn=1;if(!window.DeviceOrientationEvent||typeof DeviceOrientationEvent.requestPermission!=="function")wxTiltOn();
  if(fx==="rain"&&!WX.drops.length){const n=[8,13,18][WX.lv-1];for(let i=0;i<n;i++)WX.drops.push(wxDrop())}
  if(!WX.raf&&!document.hidden){WX.last=performance.now();WX.raf=requestAnimationFrame(wxTick)}}
/* an uneven outline: 10 radii around the bead, smoothed; small beads are almost round */
/* beads at rest are never quite round: an uneven outline (two or three soft lobes where beads met, plus noise),
   stretched one way or the other; the smallest stay nearly round */
function wxShape(r){const n=14,small=r<2.2,irr=small?.05:.12+Math.random()*.14,a2=small?.04:Math.random()*.2,a3=small?0:Math.random()*.12,p2=Math.random()*6.28,p3=Math.random()*6.28;
  let k=Array.from({length:n},(_,i)=>{const t=i/n*Math.PI*2;return 1+a2*Math.cos(2*t+p2)+a3*Math.cos(3*t+p3)+(Math.random()-.5)*irr*2});
  k=k.map((v,i)=>(k[(i+n-1)%n]+v*2+k[(i+1)%n])/4);return k}
function wxDrop(r,x,y){const big=Math.random()<.22;r=r||(big?4+Math.random()*3:1.4+Math.random()*2.2);
  return {x:x??Math.random()*WX.W,y:y??wxY(WX.H),r,k:wxShape(r),v:0,slide:false,life:0,max:25+Math.random()*30,trail:[],melt:0,rot:(Math.random()-.5)*1.6,asp:r<2.2?1:.78+Math.random()*.5}}
/* 15% fewer beads than at first, and the top half of the screen holds only a fifth of what the bottom half does: beads
   gather low on the glass, and there are fewer to draw */
const WX_CAP=[23,33,43],WX_SLIDERS=[3,4,6],WX_RATE=[1.28,2.55,4.08];
const wxY=(H,r)=>(r=r||Math.random)()<1/6?r()*H/2:H/2+r()*H/2;
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
/* noNew: only the beads already on the glass live on (melted snow); no rain arrives and no gusts */
function wxRain(dt,noNew){const lv=WX.lv-1,D=WX.drops,m=Math.hypot(WX.gx,WX.gy),ux=m>.05?WX.gx/m:0,uy=m>.05?WX.gy/m:1;if(!noNew){WX.acc+=dt*WX_RATE[lv];wxGust(dt,D)}
  while(!noNew&&WX.acc>=1){WX.acc-=1;const still=D.filter(d=>!d.slide&&!d.melt);
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
/* snow is on screen at once (the first flakes are spread over the whole screen, later ones start just above it); now
   and then a flake settles on the glass and melts into a bead of water, which then lives like rain: it dries, merges with
   the beads it meets and, once heavy enough, runs down */
function wxSnow(dt){const n=[21,33,48][WX.lv-1],m=Math.hypot(WX.gx,WX.gy),fx=WX.gx,fy=Math.max(.35,WX.gy),first=!WX.flakes.length;
  while(WX.flakes.length<n)WX.flakes.push({x:Math.random()*WX.W,y:first?Math.random()*WX.H:-10-Math.random()*60,r:1.2+Math.random()*2.8,vy:14+Math.random()*26,p:Math.random()*6,melt:0,land:0});
  for(let i=WX.flakes.length-1;i>=0;i--){const f=WX.flakes[i];if(f.melt){f.melt+=dt*3;if(f.melt>=1){WX.flakes.splice(i,1)}continue}
    if(f.land){f.land+=dt*.8;if(f.land>=1){wxLand(f);WX.flakes.splice(i,1)}continue}
    f.y+=f.vy*fy*dt;f.x+=f.vy*fx*dt+Math.sin(f.p)*.35;f.p+=dt*.8;if(f.y>20&&Math.random()<dt*.12)f.land=.01;
    if(f.y>WX.H+10){f.y=-10;f.x=Math.random()*WX.W}if(f.x<-20)f.x=WX.W+10;if(f.x>WX.W+20)f.x=-10}}
function wxLand(f){const r=1.6+f.r*.6,D=WX.drops,hit=D.find(d=>!d.slide&&!d.melt&&Math.hypot(d.x-f.x,d.y-f.y)<d.r+r);
  const still=D.filter(d=>!d.slide&&!d.melt);
  /* once the glass holds enough beads, melt water feeds one of them instead, so beads grow heavy and run, like rain */
  const into=hit||(still.length>=18?still[Math.random()*still.length|0]:null);
  if(into){into.r=Math.min(9,Math.hypot(into.r,r));into.k=wxShape(into.r);into.life=0}else D.push(wxDrop(r,f.x,f.y))}
/* tapping melts what's under the finger; the tap itself still reaches the page */
document.addEventListener("pointerdown",e=>{if(WX.fx==="none")return;if(typeof DeviceOrientationEvent!=="undefined"&&typeof DeviceOrientationEvent.requestPermission==="function")wxTiltOn();
  const x=e.clientX,y=e.clientY;WX.drops.forEach(d=>{if(!d.melt&&Math.hypot(d.x-x,d.y-y)<d.r+16)d.melt=.01});
  WX.flakes.forEach(f=>{if(!f.melt&&Math.hypot(f.x-x,f.y-y)<f.r+18)f.melt=.01})},{capture:true,passive:true});
/* 30 frames a second is enough for drops and flakes and halves the cost of the full-screen canvas */
/* while a finger is on the screen or something is still scrolling (WX.hold), the drops keep their last frame: the
   full-screen redraw would compete with the scrolling for the main thread */
function wxTick(now){if(now-WX.last<16||now<(WX.hold||0)||document.documentElement.classList.contains("touching")){if(now-WX.last>=16)WX.last=now;WX.raf=requestAnimationFrame(wxTick);return}const dt=Math.min(.07,(now-WX.last)/1000);WX.last=now;const g=WX.ctx,dark=wxDark(),reduce=wxReduced();
  g.setTransform(WX.dpr,0,0,WX.dpr,0,0);
  if(WX.fx==="rain"){if(!reduce)wxRain(dt);else WX.drops.forEach(d=>{if(d.melt)d.melt=Math.min(1,d.melt+dt*4)});
    const mov=d=>d.slide||d.blow||d.melt,still=WX.drops.filter(d=>!mov(d)),moving=WX.drops.filter(mov);
    /* the resting layer: redrawn when its beads change (sizes counted in quarter pixels), the light turns or the tilt swings them 4°, at most four times a second */
    let sig=(dark?"d":"l")+still.length+":"+Math.round(Math.atan2(WX.gy||1,WX.gx)/.07);for(const d of still)sig+=","+(d.x|0)+(d.r*4|0);
    if(sig!==WX.sSig&&(now-(WX.sAt||0)>250||WX.sSig==null)){WX.sSig=sig;WX.sAt=now;const c=WX.cx;c.setTransform(WX.dpr,0,0,WX.dpr,0,0);c.clearRect(0,0,WX.W,WX.H);still.forEach(d=>wxDrawDrop(c,d,dark))}
    if(moving.length||WX.dyn){g.clearRect(0,0,WX.W,WX.H);moving.forEach(d=>wxDrawDrop(g,d,dark));WX.dyn=moving.length>0}}
  else{g.clearRect(0,0,WX.W,WX.H);
  if(WX.fx==="snow"){if(!reduce){wxSnow(dt);wxRain(dt,true)}else if(!WX.flakes.length){wxSnow(0);WX.flakes.forEach(f=>f.y=Math.random()*WX.H)}
    WX.drops.forEach(d=>wxDrawDrop(g,d,dark));
    WX.flakes.forEach(f=>{const a=Math.max(0,Math.min(1,(WX.H-f.y)/120))*(f.melt?1-f.melt:1)*(1-(f.land||0)*.85),r=f.r*(f.melt?1+f.melt*.6:1)*(1-(f.land||0)*.3);
      if(!dark){g.beginPath();g.arc(f.x,f.y+.6,r+.7,0,7);g.fillStyle="rgba(90,110,140,"+(.22*a)+")";g.fill()}
      const rg=g.createRadialGradient(f.x,f.y,0,f.x,f.y,r);rg.addColorStop(0,"rgba(255,255,255,"+(.95*a)+")");rg.addColorStop(1,"rgba(255,255,255,"+(.25*a)+")");
      g.beginPath();g.arc(f.x,f.y,r,0,7);g.fillStyle=rg;g.fill()})}
  if(WX.sSig!==""){WX.sSig="";WX.cx.setTransform(1,0,0,1,0,0);WX.cx.clearRect(0,0,WX.cs.width,WX.cs.height)}}
  /* no motion wanted: draw once and stop */
  if(reduce&&!WX.drops.some(d=>d.melt>0&&d.melt<1)){WX.raf=0;return}
  WX.raf=requestAnimationFrame(wxTick)}
document.addEventListener("visibilitychange",()=>{if(document.hidden){cancelAnimationFrame(WX.raf);WX.raf=0}else{wxRefresh(false)}});

/* weather icons, drawn for bG in the manner of Google's flat weather set (not its files): a yellow flower sun, a blue
   crescent moon, pale layered clouds, blue drops, grey snow stars, grey mist lines, a yellow bolt */
const WXI_SUN='<g fill="#FDBA12"><circle cx="12" cy="12" r="5.6"/>'+[0,45,90,135,180,225,270,315].map(a=>'<circle cx="'+(12+5.6*Math.cos(a*Math.PI/180)).toFixed(2)+'" cy="'+(12+5.6*Math.sin(a*Math.PI/180)).toFixed(2)+'" r="2.3"/>').join("")+'</g>',
  WXI_MOON='<path d="M15.6 3.6a8.6 8.6 0 1 0 4.8 15.2A7 7 0 0 1 15.6 3.6z" fill="#4E86F5"/>',
  WXI_CLOUD=(x,y,k,c)=>'<path transform="translate('+x+' '+y+') scale('+k+')" d="M7 18h10.5a4.5 4.5 0 0 0 .4-9A6 6 0 0 0 6.5 8.4 4.8 4.8 0 0 0 7 18z" fill="'+c+'"/>',
  WXI_DROPS='<g fill="#2F7BEA"><path d="M8 17.5l1.1 2a1.3 1.3 0 1 1-2.2 0z"/><path d="M12 17.5l1.1 2a1.3 1.3 0 1 1-2.2 0z"/><path d="M16 17l1.4 2.5a1.6 1.6 0 1 1-2.8 0z"/></g>',
  WXI_SNOW='<g stroke="#8D939C" stroke-width="1.2" stroke-linecap="round"><path d="M8 17v4M6.3 18l3.4 2M6.3 20l3.4-2M15 17v4M13.3 18l3.4 2M13.3 20l3.4-2"/></g>',
  WXI_BOLT='<path d="M13.5 13l-3.2 5h2.6l-1.6 4.5 4.6-6h-2.7l1.6-3.5z" fill="#FDBA12"/>';
function wxIcon(kind){const C1="#DDE1E6",C2="#BFC4CC",sv=b=>'<svg viewBox="0 0 24 24" aria-hidden="true">'+b+'</svg>';
  const cl=(y)=>WXI_CLOUD(3.4,y-1.6,.78,C2)+WXI_CLOUD(-.6,y,.86,C1);
  return sv({sun:WXI_SUN,moon:WXI_MOON,
    sunc:'<g transform="translate(-3 -3) scale(.8)">'+WXI_SUN+'</g>'+WXI_CLOUD(2,3,.86,C1),
    moonc:'<g transform="translate(-2 -3) scale(.75)">'+WXI_MOON+'</g>'+WXI_CLOUD(2,3,.86,C1),
    cloud:cl(1),rain:cl(-2.5)+WXI_DROPS,snow:cl(-2.5)+WXI_SNOW,
    fog:'<g stroke="#BFC4CC" stroke-width="1.8" stroke-linecap="round" fill="none"><path d="M3 8c2-1.4 4-1.4 6 0s4 1.4 6 0 4-1.4 6 0M3 12.5c2-1.4 4-1.4 6 0s4 1.4 6 0 4-1.4 6 0M3 17c2-1.4 4-1.4 6 0s4 1.4 6 0 4-1.4 6 0"/></g>',
    storm:cl(-2.5)+WXI_BOLT,stormrain:cl(-2.5)+WXI_BOLT+'<g fill="#2F7BEA"><path d="M7 17l1.3 2.4a1.5 1.5 0 1 1-2.6 0z"/><path d="M18 17l1.3 2.4a1.5 1.5 0 1 1-2.6 0z"/></g>'}[kind]||"")}
/* which icon the weather where the city is calls for (haze counts as mist) */
function wxKind(c){if(!c||c.code==null)return "";const x=+c.code,day=c.day!==false;
  if(x===0)return day?"sun":"moon";if(x<=2)return day?"sunc":"moonc";if(x===3)return "cloud";if(x===45||x===48)return "fog";
  if((x>=71&&x<=77)||x===85||x===86)return "snow";if(x===95)return "storm";if(x>=96)return "stormrain";if(x>=51)return "rain";
  return c.pm!=null&&c.pm>=75?"fog":"cloud"}
/* the small weather sign right of the date: only the real weather where the city is, whatever effect is forced */
function wxBadge(){const b=document.getElementById("wxBadge");if(!b)return;const w=wxSet(),c=wxCache(),k=w&&c&&c.lat===w.lat&&c.lon===w.lon?wxKind(c):"";
  b.hidden=!k;if(k){b.innerHTML=wxIcon(k);b.setAttribute("aria-label",wxLine(c))}}
/* the screen effect: off, auto (the weather where the city is), or rain or snow forced on whatever the weather */
const WXM_K="tracktor-p1-wxmode";
function wxMode(){let m=null;try{m=localStorage.getItem(WXM_K)}catch(e){}if(m==="off"||m==="auto"||m==="rain"||m==="snow")return m;return wxSet()?"auto":"off"}
async function wxRefresh(force){const m=wxMode();wxBadge();if(m!=="auto"){wxApply(m==="rain"||m==="snow"?m:"none",2);const n=wxSet()?await wxFetch(force):null;wxBadge();return n||wxCache()}
  const w=wxSet();if(!w||w.lat==null){wxApply("none");return}
  const c=wxCache();if(c&&c.lat===w.lat&&c.lon===w.lon){const i=wxNow(c);wxApply(i.fx,i.lv)}
  const n=await wxFetch(force);if(n&&wxMode()==="auto"&&wxSet()){const i=wxNow(n);wxApply(i.fx,i.lv)}wxBadge();return n}
setInterval(()=>{if(!document.hidden)wxRefresh(false)},5*60e3);

/* ---------- the weather while training, for the shared picture ----------
   The weather on screen as you share wins; otherwise the weather noted while training that day (each tick or extra set
   notes it in tracktor-wxlog, last 90 days, not in backups). drawTrain lays the same drops, flakes or mist over the
   training picture; no other shared picture gets weather. A seed from the date keeps the picture
   the same every time it is drawn (on screen, saved, shared) */
const WXL_K="tracktor-wxlog";
function wxLog(){try{return JSON.parse(localStorage.getItem(WXL_K)||"{}")||{}}catch(e){return {}}}
function wxMark(t){if(WX.fx==="none")return;t=t||today();const L=wxLog(),c=L[t];if(c&&c.fx===WX.fx&&c.lv>=WX.lv)return;
  L[t]={fx:WX.fx,lv:WX.lv};const ks=Object.keys(L).sort();while(ks.length>90)delete L[ks.shift()];try{localStorage.setItem(WXL_K,JSON.stringify(L))}catch(e){}}
function wxPaint(g,W,H,t){const w=WX.fx&&WX.fx!=="none"?{fx:WX.fx,lv:WX.lv}:wxLog()[t];if(!w||!w.fx||w.fx==="none")return;const dark=wxDark(),lv=Math.max(1,Math.min(3,w.lv||1));
  let sd=7;for(const ch of t)sd=(sd*31+ch.charCodeAt(0))>>>0;const rnd=()=>{sd=(sd*1664525+1013904223)>>>0;return sd/4294967296};
  const R=Math.random,gx=WX.gx,gy=WX.gy,k=W/390,w0=390,h0=H/k,area=h0/844;Math.random=rnd;WX.gx=0;WX.gy=1;
  try{g.save();g.scale(k,k);
    if(w.fx==="rain"){const n=Math.max(6,Math.round([17,27,37][lv-1]*area));for(let i=0;i<n;i++)wxDrawDrop(g,wxDrop(null,rnd()*w0,wxY(h0,rnd)),dark)}
    else if(w.fx==="snow"){const n=Math.max(8,Math.round([21,33,48][lv-1]*area));
      for(let i=0;i<n;i++){const x=rnd()*w0,y=rnd()*h0,r=1.2+rnd()*2.8;
        if(!dark){g.beginPath();g.arc(x,y+.6,r+.7,0,7);g.fillStyle="rgba(90,110,140,.22)";g.fill()}
        const rg=g.createRadialGradient(x,y,0,x,y,r);rg.addColorStop(0,"rgba(255,255,255,.95)");rg.addColorStop(1,"rgba(255,255,255,.25)");g.beginPath();g.arc(x,y,r,0,7);g.fillStyle=rg;g.fill()}}
  }finally{g.restore();Math.random=R;WX.gx=gx;WX.gy=gy}}

/* ---------- settings: city and effects ---------- */
function wxPick(name,lat,lon){state.settings.weather={name,lat:+(+lat).toFixed(3),lon:+(+lon).toFixed(3)};lsSave();/* picking a city while the effect is off turns it to auto, so the city's weather shows */
  if(wxMode()==="off"){try{localStorage.setItem(WXM_K,"auto")}catch(e){}document.querySelectorAll("[data-wm]").forEach(x=>x.classList.toggle("active",x.dataset.wm==="auto"))}}
function openWeather(){const w=wxSet(),on=!!(w&&w.lat!=null);
  const md=wxMode(),opt=(v,inner,al)=>'<button type="button" data-wm="'+v+'"'+(al?' aria-label="'+al+'"':'')+' class="'+(md===v?"active":"")+'">'+inner+'</button>';
  const S=p1Sheet(T("天气","Weather"),'<p class="wxnow" id="wxn">'+(wxIcon(wxKind(wxCache()))||wxIcon("sunc"))+'<span>'+esc(wxLine(wxCache()))+'</span></p>'
    +'<button type="button" class="btn ghost wxhere" data-here>'+T("用我现在的位置","Use where I am")+'</button>'
    +'<label class="flabel">'+T("或者搜一个城市","Or search any city")+'<input id="wxq" type="search" autocomplete="off" placeholder="'+T("例如 上海、Tokyo、London","e.g. Shanghai, Tokyo, London")+'"></label><div class="wxres" id="wxr"></div>'
    +'<p class="eyebrow" style="margin-top:6px">'+T("屏幕效果","Screen effect")+'</p><div class="mode-tabs wxmode" role="group">'+opt("off",T("关","Off"))+opt("auto",T("自动","Auto"))+opt("rain",wxIcon("rain"),T("一直下雨","Always rain"))+opt("snow",wxIcon("snow"),T("一直下雪","Always snow"))+'</div>',
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
  /* the effect: auto needs a city (it points to the search); rain and snow need none; off keeps the city for later */
  S.m.addEventListener("click",e=>{const o=e.target.closest("[data-wm]");if(!o)return;const v=o.dataset.wm;
    if(v==="auto"&&!wxSet()){S.q("#wxq").focus();toast(T("选一个城市，就跟着那里的天气","Pick a city to follow its weather"));return}
    try{localStorage.setItem(WXM_K,v)}catch(err){}S.m.querySelectorAll("[data-wm]").forEach(x=>x.classList.toggle("active",x===o));wxRefresh(false);if(v==="rain"||v==="snow")wxTiltOn()})}
p1Reg("weather",openWeather);
/* an effect switched off used to keep the city with off:true; off now means no city */
if(state.settings.weather&&(state.settings.weather.off||state.settings.weather.lat==null)){delete state.settings.weather;lsSave()}
wxRefresh(false);
