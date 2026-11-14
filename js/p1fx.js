/* 博G · celebrations: fireworks (with a bang), confetti poppers and cannons, and a show for each new 2% step on a
   goal. Settings › Appearance › Celebrations turns them off (tracktor-p1-fx = "0"); "reduce motion" also stops them.
   celebrate(n, big): n small rockets, then `big` large ones. Calls stack, so quick ticks add to the same show. */
const FX_K="tracktor-p1-fx";
function fxOn(){try{return localStorage.getItem(FX_K)!=="0"}catch(e){return true}}
const fxCalm=()=>!fxOn()||matchMedia("(prefers-reduced-motion: reduce)").matches;
const FW=(function(){
  const COLS=["#FFD34E","#FF9A1F","#F2541B","#43C08A","#7393F2","#A58CF0","#FF6FA8","#2BB3E0"];
  let cv=null,c=null,W=0,H=0,dpr=1,rockets=[],sparks=[],running=false,nextAt=0;
  const pick=()=>COLS[Math.floor(Math.random()*COLS.length)];
  function ensure(){dpr=Math.min(2,devicePixelRatio||1);
    if(!cv){cv=document.createElement("canvas");cv.className="fw";cv.setAttribute("aria-hidden","true");document.body.appendChild(cv);c=cv.getContext("2d");W=0}
    if(W!==innerWidth||H!==innerHeight){W=innerWidth;H=innerHeight;cv.width=W*dpr;cv.height=H*dpr;c.setTransform(dpr,0,0,dpr,0,0)}}
  function mk(at,big){return {at,big,x:W*(big?.3+Math.random()*.4:.12+Math.random()*.76),y:H,ty:H*(big?.14+Math.random()*.1:.18+Math.random()*.3),vy:0,fired:false,done:false,col:pick()}}
  function add(n,big){ensure();const now=performance.now(),gap=n>=6?150:230;let t=Math.max(now,nextAt);
    for(let i=0;i<n;i++){rockets.push(mk(t+Math.random()*90,false));t+=gap}
    if(big){t+=n?380:0;for(let i=0;i<big;i++){rockets.push(mk(t,true));t+=700}}
    nextAt=t;if(!running){running=true;requestAnimationFrame(frame)}}
  function burst(r){const n=r.big?230:60+Math.floor(Math.random()*30),col2=pick(),col3=pick();
    for(let k=0;k<n;k++){const a=Math.PI*2*k/n+Math.random()*.2,s=r.big?(k%2?2.6+Math.random()*2.2:4.6+Math.random()*2.6):2+Math.random()*3.2;
      sparks.push({x:r.x,y:r.y,vx:Math.cos(a)*s,vy:Math.sin(a)*s,life:1,decay:r.big?.007+Math.random()*.006:.012+Math.random()*.012,
        sz:r.big?2.2:1.6,col:r.big?(k%3===0?col2:k%3===1?col3:r.col):(k%3?r.col:col2),tw:r.big&&Math.random()<.35})}
    fxBang(r.big)}
  function frame(now){
    c.globalCompositeOperation="destination-out";c.fillStyle="rgba(0,0,0,.22)";c.fillRect(0,0,W,H);c.globalCompositeOperation="source-over";
    rockets.forEach(r=>{if(r.done||now<r.at)return;if(!r.fired){r.fired=true;r.vy=-Math.sqrt(2*.16*(H-r.ty))}
      r.y+=r.vy;r.vy+=.16;c.fillStyle=r.col;c.beginPath();c.arc(r.x,r.y,r.big?3.4:2.2,0,7);c.fill();if(r.vy>=0){r.done=true;burst(r)}});
    rockets=rockets.filter(r=>!r.done);
    for(let i=sparks.length-1;i>=0;i--){const p=sparks[i];p.x+=p.vx;p.y+=p.vy;p.vx*=.985;p.vy=p.vy*.985+.05;p.life-=p.decay;
      if(p.life<=0){sparks.splice(i,1);continue}
      const a=p.tw?p.life*(.5+.5*Math.sin(now*.03+i)):p.life;c.globalAlpha=Math.max(0,a);c.fillStyle=p.col;c.beginPath();c.arc(p.x,p.y,p.sz+p.life*1.6,0,7);c.fill();c.globalAlpha=1}
    if(rockets.length||sparks.length)requestAnimationFrame(frame);else{running=false;nextAt=0;cv.remove();cv=null}}
  return {add};
})();
/* the bang: filtered noise for the blast, a low sine thump under it, a few crackles as the sparks fall.
   Rockets often burst together, so they share a compressor instead of clipping. */
let fxNoise=null,fxBus=null;
function fxBang(big){try{AC=AC||new (window.AudioContext||window.webkitAudioContext)();const c=AC;
  if(!fxNoise){fxNoise=c.createBuffer(1,c.sampleRate*2,c.sampleRate);const d=fxNoise.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1}
  if(!fxBus){fxBus=c.createDynamicsCompressor();fxBus.threshold.value=-12;fxBus.ratio.value=6;fxBus.connect(c.destination)}
  const hit=(at,len,f1,f2,vol,type)=>{const t=c.currentTime+at,s=c.createBufferSource(),f=c.createBiquadFilter(),g=c.createGain();
    s.buffer=fxNoise;f.type=type||"lowpass";f.frequency.setValueAtTime(f1,t);f.frequency.exponentialRampToValueAtTime(f2,t+len);
    g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(vol,t+.008);g.gain.exponentialRampToValueAtTime(.0001,t+len);
    s.connect(f).connect(g).connect(fxBus);s.start(t,Math.random(),len+.02)};
  hit(0,big?.9:.5,big?2200:3000,120,big?.55:.32);
  tone(big?70:100,0,big?.8:.35,"sine",big?.3:.18,big?28:40);
  const n=big?12:5;for(let k=0;k<n;k++)hit((big?.3:.2)+Math.random()*(big?.9:.5),.04,6500,3500,.06+Math.random()*.05,"highpass")}catch(e){}}
function celebrate(n,big){if(fxCalm())return;const t=typeof themeFx==="function"&&themeFx();if(t){themedCelebrate(t,n||0,big||0);return}FW.add(n||0,big||0)}
const fxAc=()=>getComputedStyle(document.documentElement).getPropertyValue("--ac").trim()||"#22C55E";
const fxCols=()=>[fxAc(),"#ffffff","#FFD24D"];
const fxShape=()=>({});
/* one exercise done: a popper from the bottom; the whole session done: cannons from both sides */
function popper(){if(fxCalm())return;const t=themeFx();if(t){themedPopper(t);return}if(!window.confetti)return;confetti(Object.assign({particleCount:40,spread:60,startVelocity:32,origin:{y:.75},colors:fxCols(),zIndex:60,disableForReducedMotion:true},fxShape()))}
function cannons(){if(fxCalm())return;const t=themeFx();if(t){themedCannons(t);return}if(!window.confetti)return;const c=fxAc();
  [0,250,500].forEach(t=>setTimeout(()=>{confetti(Object.assign({particleCount:70,angle:60,spread:60,origin:{x:0,y:.8},colors:fxCols(),zIndex:60},fxShape()));confetti(Object.assign({particleCount:70,angle:120,spread:60,origin:{x:1,y:.8},colors:fxCols(),zIndex:60},fxShape()))},t))}
/* every new 2% step on a goal ring: a big show. The highest step is remembered in this browser, so weight going up
   and down never celebrates the same step twice; the first time a goal is seen, and the first seconds after opening
   (synced data can still be arriving), it is recorded quietly. */
const MS_KEY="tracktor-milestones";
let MS={};try{MS=JSON.parse(localStorage.getItem(MS_KEY)||"{}")||{}}catch(e){MS={}}
let msQueue=0;const msArmAt=performance.now()+4000;
function milestone(k,pct,name){const step=Math.floor(pct/2)*2,save=()=>{try{localStorage.setItem(MS_KEY,JSON.stringify(MS))}catch(e){}};
  if(MS[k]==null||performance.now()<msArmAt){if(MS[k]==null||step>MS[k]){MS[k]=step;save()}return}
  if(step<=MS[k])return;MS[k]=step;save();
  const delay=msQueue*1400;msQueue++;
  setTimeout(()=>{msQueue=Math.max(0,msQueue-1);celebrate(30,0);toast(name+T(" 进度达到 "," progress reached ")+step+"%")},600+delay)}

/* ---------- themed celebrations: each skin throws its own stuff and sounds like itself ----------
   PX is a small particle stage on the same canvas class as the fireworks. A theme in THEME_FX replaces the fireworks
   (celebrate), the popper (one exercise) and the cannons (the whole session). */
const PX=(function(){let cv=null,c=null,W=0,H=0,ps=[],run=false,led=null,flash=0;
  function ensure(){const dpr=Math.min(2,devicePixelRatio||1);if(!cv){cv=document.createElement("canvas");cv.className="fw";cv.setAttribute("aria-hidden","true");document.body.appendChild(cv);c=cv.getContext("2d");W=0}
    if(W!==innerWidth||H!==innerHeight){W=innerWidth;H=innerHeight;cv.width=W*dpr;cv.height=H*dpr;c.setTransform(dpr,0,0,dpr,0,0)}}
  function go(){if(!run){run=true;requestAnimationFrame(frame)}}
  function add(list){ensure();list.forEach(p=>ps.push(p));if(ps.length>340)ps.splice(0,ps.length-340);go()}
  function wave(x,y,big){ensure();led=led||{waves:[],spark:0};led.waves.push({x,y,r:0,v:big?8:6,w:big?50:30,life:1});led.spark=Math.max(led.spark,big?1:.45);if(big)flash=1;go()}
  function drawLed(){const g=12,cols=Math.ceil(W/g),rows=Math.ceil(H/g);
    led.waves.forEach(w=>{w.r+=w.v;w.life-=.011});led.waves=led.waves.filter(w=>w.life>0);led.spark*=.965;if(led.spark<.02)led.spark=0;
    for(let j=0;j<rows;j++)for(let i=0;i<cols;i++){const x=i*g+g/2,y=j*g+g/2;let b=0;
      for(const w of led.waves){const d=Math.abs(Math.hypot(x-w.x,y-w.y)-w.r);if(d<w.w)b=Math.max(b,(1-d/w.w)*w.life)}
      if(led.spark&&Math.random()<led.spark*.02)b=Math.max(b,.55+Math.random()*.45);
      if(b<.1)continue;b=Math.ceil(b*4)/4;
      c.fillStyle="rgba(107,184,255,"+(b*.28)+")";c.beginPath();c.arc(x,y,5.5,0,7);c.fill();
      c.fillStyle="rgba(235,246,255,"+b+")";c.beginPath();c.arc(x,y,2.3,0,7);c.fill()}}
  function frame(){c.clearRect(0,0,W,H);
    if(flash>0){c.fillStyle="rgba("+(document.documentElement.dataset.theme==="nikon"?"255,255,255":"200,230,255")+","+(flash*.4)+")";c.fillRect(0,0,W,H);flash-=.09}
    if(led)drawLed();
    for(let i=ps.length-1;i>=0;i--){const p=ps[i];p.vy+=p.g||0;if(p.drag){p.vx*=p.drag;p.vy*=p.drag}if(p.sway)p.vx+=Math.sin((p.t=(p.t||0)+.08))*p.sway;
      p.x+=p.vx;p.y+=p.vy;p.a=(p.a||0)+(p.va||0);if(p.sq)p.sq*=.86;
      const floor=H-(p.fh||6);if(p.bounce!=null&&p.y>floor){p.y=floor;if(p.vy>1.6){p.vy*=-p.bounce;p.vx*=.72;p.va=(p.va||0)*.5;if(p.land)p.land(p)}else{p.vy=0;p.vx*=.86;p.va=(p.va||0)*.8}}
      p.life=(p.life==null?1:p.life)-(p.decay||.006);if(p.life<=0||p.y>H+80||p.x<-90||p.x>W+90){ps.splice(i,1);continue}
      c.save();c.globalAlpha=Math.min(1,p.life*3);p.draw(c,p);c.restore()}
    if(ps.length||(led&&(led.waves.length||led.spark>0))||flash>0)requestAnimationFrame(frame);else{run=false;led=null;cv.remove();cv=null}}
  return {add,wave,flash:v=>{ensure();flash=Math.max(flash,v);go()},size:()=>{ensure();return [W,H]}}})();
const rnd=(a,b)=>a+Math.random()*(b-a),pick=a=>a[Math.floor(Math.random()*a.length)];
let fxLandAt=0;const landSnd=f=>{const n=performance.now();if(n-fxLandAt<45)return;fxLandAt=n;try{f()}catch(e){}};
/* noise hit for clatter and hats */
function fxHit(at,len,f,q,vol,type){try{AC=AC||new (window.AudioContext||window.webkitAudioContext)();const c=AC;
  if(!fxNoise){fxNoise=c.createBuffer(1,c.sampleRate*2,c.sampleRate);const d=fxNoise.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1}
  const t=c.currentTime+at,s=c.createBufferSource(),fl=c.createBiquadFilter(),g=c.createGain();s.buffer=fxNoise;fl.type=type||"bandpass";fl.frequency.value=f;fl.Q.value=q||1;
  g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(vol,t+.004);g.gain.exponentialRampToValueAtTime(.0001,t+len);s.connect(fl).connect(g).connect(c.destination);s.start(t,Math.random(),len+.02)}catch(e){}}
const clink=(f,at,v)=>{v=v||.08;tone(f,at,.4,"sine",v);tone(f*2.76,at,.22,"sine",v*.5);tone(f*5.4,at,.09,"sine",v*.35)};
const ding=(f,at,v)=>{v=v||.13;tone(f,at,.9,"sine",v);tone(f*2,at,.25,"sine",v*.25);tone(f*3,at,.08,"sine",v*.12)};
const plop=(f,at,v)=>{tone(f,at,.12,"sine",v||.2,f*.35);fxHit(at,.05,700,.8,.05,"lowpass")};
const chip=(f,at,d,v)=>{tone(f,at,d||.07,"square",v||.045)};
/* the pieces */
const TOYC=["#EB3B24","#2244FF","#F2B726","#2AB858","#FFFFFF"];
/* bricks are heavy: thrown harder than petals so they really fly before they clatter down */
function brickP(x,y,ang,sp){const w=pick([16,24,32]),col=pick(TOYC);sp*=1.6;return {x,y,vx:Math.cos(ang)*sp*.9,vy:Math.sin(ang)*sp,g:.32,bounce:.32,fh:6,va:rnd(-.25,.25),decay:.0045,
  land:()=>landSnd(()=>{fxHit(0,.03,rnd(2600,4800),2,.09);tone(rnd(1400,2400),0,.018,"square",.025)}),
  draw:(c,p)=>{c.translate(p.x,p.y);c.rotate(p.a);const h=11;c.fillStyle=col;
    for(let k=0;k<w/8;k++){c.fillRect(-w/2+2+k*8,-h/2-3,5,3);c.fillStyle="rgba(255,255,255,.4)";c.fillRect(-w/2+2+k*8,-h/2-3,5,1);c.fillStyle=col}
    c.beginPath();c.roundRect?c.roundRect(-w/2,-h/2,w,h,2):c.rect(-w/2,-h/2,w,h);c.fill();
    c.fillStyle="rgba(255,255,255,.38)";c.fillRect(-w/2+1,-h/2+1,w-2,2);c.fillStyle="rgba(0,0,0,.22)";c.fillRect(-w/2+1,h/2-3,w-2,2)}}}
function bearingP(x,y,ang,sp){const r=rnd(3,6.5);return {x,y,vx:Math.cos(ang)*sp,vy:Math.sin(ang)*sp,g:.42,bounce:.55,fh:r,decay:.005,
  land:p=>landSnd(()=>clink(rnd(2200,3600),0,.05)),
  draw:(c,p)=>{const gr=c.createRadialGradient(p.x-r*.35,p.y-r*.4,r*.1,p.x,p.y,r);gr.addColorStop(0,"#FFFFFF");gr.addColorStop(.35,"#D6D9DD");gr.addColorStop(.75,"#7C8086");gr.addColorStop(1,"#3A3D41");
    c.fillStyle=gr;c.beginPath();c.arc(p.x,p.y,r,0,7);c.fill();c.fillStyle="rgba(31,245,220,.55)";c.beginPath();c.arc(p.x+r*.3,p.y+r*.45,r*.28,0,7);c.fill()}}}
function ringP(x,y,big){return {x,y,vx:0,vy:0,r:4,decay:big?.014:.022,draw:(c,p)=>{p.r+=big?9:6;c.strokeStyle="#24FCE2";c.lineWidth=(big?7:4)*p.life;c.shadowColor="#1FF5DC";c.shadowBlur=18;c.beginPath();c.arc(p.x,p.y,p.r,0,7);c.stroke()}}}
function discP(x,y,ang,sp){const r=rnd(5,9),col=pick(["#F26422","#F26422","#F6F5EF","#4E6142","#282622"]);return {x,y,vx:Math.cos(ang)*sp,vy:Math.sin(ang)*sp,g:.16,drag:.985,sway:.12,decay:.0045,va:rnd(.08,.2),
  draw:(c,p)=>{const sx=Math.abs(Math.cos(p.a));c.translate(p.x,p.y);c.scale(Math.max(.12,sx),1);c.fillStyle=col;c.beginPath();c.arc(0,0,r,0,7);c.fill();
    c.fillStyle="rgba(255,255,255,"+(.15+.35*sx)+")";c.beginPath();c.arc(-r*.25,-r*.3,r*.45,0,7);c.fill()}}}
function blobP(x,y,ang,sp){const r=rnd(7,13),col=pick(["#A4E2CD","#C4F7E5","#F2B38F","#B9AEEE","#FFFFFF"]);return {x,y,vx:Math.cos(ang)*sp,vy:Math.sin(ang)*sp,g:.4,bounce:.22,fh:r*.8,decay:.005,sq:0,
  land:p=>{p.sq=1;landSnd(()=>plop(rnd(260,380),0,.14))},
  draw:(c,p)=>{const s=p.sq||0;c.translate(p.x,p.y+r*s*.3);c.scale(1+s*.45,1-s*.4);c.fillStyle=col;c.beginPath();c.arc(0,0,r,0,7);c.fill();
    c.fillStyle="rgba(0,0,0,.08)";c.beginPath();c.arc(r*.2,r*.3,r*.75,0,7);c.fill();c.fillStyle="rgba(255,255,255,.7)";c.beginPath();c.arc(-r*.35,-r*.35,r*.3,0,7);c.fill()}}}
function pixelP(x,y,ang,sp){const s=pick([6,6,9]),col=pick(["#E8892B","#E2513A","#E7D4B4","#FFFFFF","#E8892B"]);return {x,y,vx:Math.cos(ang)*sp,vy:Math.sin(ang)*sp,g:.26,decay:.006,
  draw:(c,p)=>{const q=3,X=Math.round(p.x/q)*q,Y=Math.round(p.y/q)*q;if(p.life<.4&&(Math.floor(p.life*40)%2))return;c.fillStyle=col;c.fillRect(X,Y,s,s);c.fillStyle="rgba(0,0,0,.25)";c.fillRect(X,Y+s-2,s,2)}}}
/* how each theme celebrates: make = one piece; snd = burst sound (big or not) */
/* the quieter skins: petals, leaf, glints, LCD bits and a shutter, each with a soft sound */
const bell=(f,at,v)=>{v=v||.07;tone(f,at,1.2,"sine",v);tone(f*2.01,at,.5,"sine",v*.3);tone(f*3.02,at,.18,"sine",v*.12)};
const whoosh=(at,v)=>{fxHit(at,.5,900,.6,v||.05,"bandpass");fxHit(at+.08,.35,2400,.7,(v||.05)*.6,"bandpass")};
const fxTone=()=>getComputedStyle(document.documentElement).getPropertyValue("--ac").trim()||"#4FAF6A";
function petalP(x,y,ang,sp){const col=pick([fxTone(),fxTone(),"#FFFFFF","#FFE3EC","#F3F0FF"]),w=rnd(5,8),h=w*rnd(1.6,2.1);
  return {x,y,vx:Math.cos(ang)*sp*.8,vy:Math.sin(ang)*sp*.8,g:.06,drag:.985,sway:.05,decay:.0055,va:rnd(-.08,.08),fl:rnd(0,6),
    draw:(c,p)=>{p.fl+=.09;c.translate(p.x,p.y);c.rotate(p.a);c.scale(Math.max(.2,Math.abs(Math.cos(p.fl))),1);c.fillStyle=col;c.beginPath();c.ellipse(0,0,w,h,0,0,7);c.fill();
      c.fillStyle="rgba(255,255,255,.35)";c.beginPath();c.ellipse(-w*.25,-h*.2,w*.35,h*.5,0,0,7);c.fill()}}}
function foilP(x,y,ang,sp,cols){const col=pick(cols),s=rnd(5,10),k=[rnd(.6,1),rnd(.6,1),rnd(.6,1),rnd(.6,1)];
  return {x,y,vx:Math.cos(ang)*sp*.8,vy:Math.sin(ang)*sp*.8,g:.07,drag:.984,sway:.035,decay:.006,va:rnd(-.12,.12),fl:rnd(0,6),
    draw:(c,p)=>{p.fl+=.13;const sh=Math.cos(p.fl);c.translate(p.x,p.y);c.rotate(p.a);c.scale(Math.max(.15,Math.abs(sh)),1);
      const g=c.createLinearGradient(-s,-s,s,s);g.addColorStop(0,"#FFFFFF");g.addColorStop(.35,col);g.addColorStop(1,"rgba(0,0,0,.35)");c.fillStyle=sh>0?g:col;
      c.beginPath();c.moveTo(-s*k[0],-s*.5);c.lineTo(s*k[1],-s*.6);c.lineTo(s*k[2],s*.55);c.lineTo(-s*k[3],s*.5);c.closePath();c.fill()}}}
function glintP(x,y,ang,sp){const r=rnd(4,11),col=pick(["#FFFFFF","#FFFFFF",fxTone()]),px=x+Math.cos(ang)*sp*rnd(4,16),py=y+Math.sin(ang)*sp*rnd(6,26);
  return {x:px,y:py,vx:rnd(-.2,.2),vy:rnd(-.6,-.2),decay:rnd(.012,.02),tw:rnd(0,6),
    draw:(c,p)=>{p.tw+=.25;const k=r*(.55+.45*Math.abs(Math.sin(p.tw)));c.translate(p.x,p.y);c.fillStyle=col;c.shadowColor=col;c.shadowBlur=8;
      c.beginPath();c.moveTo(0,-k);c.quadraticCurveTo(0,0,k*.32,0);c.quadraticCurveTo(0,0,0,k);c.quadraticCurveTo(0,0,-k*.32,0);c.quadraticCurveTo(0,0,0,-k);c.fill();
      c.beginPath();c.moveTo(-k*.7,0);c.quadraticCurveTo(0,0,0,-k*.12);c.quadraticCurveTo(0,0,k*.7,0);c.quadraticCurveTo(0,0,0,k*.12);c.quadraticCurveTo(0,0,-k*.7,0);c.fill()}}}
function lcdP(x,y,ang,sp){const s=pick([5,5,8]),col=pick(["#FF6A13","#FF6A13","#2F5FA8","#FFFFFF"]);
  return {x,y,vx:Math.cos(ang)*sp,vy:Math.sin(ang)*sp,g:.3,drag:.99,decay:.008,
    draw:(c,p)=>{const q=4,X=Math.round(p.x/q)*q,Y=Math.round(p.y/q)*q;if(p.life<.35&&(Math.floor(p.life*40)%2))return;c.fillStyle=col;c.fillRect(X,Y,s,s/2.4|0||2)}}}
function shutterP(x,y,big){return {x,y,vx:0,vy:0,r:10,decay:big?.016:.026,rot:0,
  draw:(c,p)=>{p.r+=big?11:7;p.rot+=.04;c.translate(p.x,p.y);c.rotate(p.rot);c.strokeStyle="rgba(255,255,255,.9)";c.lineWidth=(big?5:3)*p.life;c.shadowColor="#E8302A";c.shadowBlur=10;
    c.beginPath();for(let i=0;i<=6;i++){const a=i/6*Math.PI*2;i?c.lineTo(Math.cos(a)*p.r,Math.sin(a)*p.r):c.moveTo(Math.cos(a)*p.r,Math.sin(a)*p.r)}c.stroke()}}}
function silverP(x,y,ang,sp){const r=rnd(1.5,3.2);return {x,y,vx:Math.cos(ang)*sp*.6,vy:Math.sin(ang)*sp*.6,g:.12,drag:.98,decay:.012,draw:(c,p)=>{c.fillStyle=pick(["#F1F1F0","#9EA3AA","#E8302A"]);c.beginPath();c.arc(p.x,p.y,r,0,7);c.fill()}}}
const THEME_FX={
  aurora:{make:petalP,snd:big=>{(big?[784,988,1175,1568]:[988,1319]).forEach((f,i)=>bell(f,i*.09,.05))}},
  ember:{make:(x,y,a,s)=>foilP(x,y,a,s,["#FFB020","#F7D78A","#E8A64A","#D9714E"]),snd:big=>{(big?[659,831,988,1319]:[831,1109]).forEach((f,i)=>bell(f,i*.11,.055))}},
  dyson:{make:(x,y,a,s)=>foilP(x,y,a,s,document.documentElement.dataset.mode==="dark"?["#E9B57D","#D49A5E","#F1C894"]:["#E7A6A0","#D58783","#F4C7C2"]),snd:big=>{whoosh(0,big?.07:.045);(big?[880,1109,1319]:[1109]).forEach((f,i)=>bell(f,.12+i*.1,.045))}},
  mac:{make:glintP,snd:big=>{bell(big?1568:1760,0,.06);if(big)bell(2349,.12,.04)}},
  ipod:{make:glintP,snd:big=>{tone(2600,0,.006,"square",.02);bell(big?1319:1568,.02,.06);if(big)bell(1976,.14,.04)}},
  md:{make:lcdP,snd:big=>{(big?[784,988,1175,1568,1976]:[1175,1568]).forEach((f,i)=>{chip(f,i*.05,.06,.035)})}},
  nikon:{make:silverP,shutter:true,snd:big=>{fxHit(0,.02,3000,1.5,.12);fxHit(.07,.03,1800,1.2,.1);tone(110,.0,.06,"sine",.12,70);if(big){fxHit(.25,.02,3000,1.5,.1);fxHit(.32,.03,1800,1.2,.08)}}},
  toy:{make:brickP,snd:big=>{const n=big?16:7;for(let k=0;k<n;k++)fxHit(k*.03+Math.random()*.03,.03,rnd(2400,5200),2.5,.08);tone(big?520:760,0,.12,"sine",.12,big?120:200)}},
  skeuo:{make:bearingP,ring:true,snd:big=>{tone(180,0,big?.6:.4,"sine",.14,big?1100:800);for(let k=0;k<(big?6:3);k++)clink(rnd(1800,3400),.05+k*.07,.06)}},
  tm4:{led:true,snd:big=>{(big?[523,659,784,1047,1319,1568,2093]:[784,1047,1568]).forEach((f,i)=>{chip(f,i*.045,.08,.05);tone(f/2,i*.045,.1,"sawtooth",.025)});if(big)tone(220,0,1,"sawtooth",.03,1760)}},
  braun:{make:discP,snd:big=>{ding(big?1047:1319,0);if(big)ding(784,.22);tone(3000,0,.01,"square",.03)}},
  clay:{make:blobP,snd:big=>{for(let k=0;k<(big?5:2);k++)plop(rnd(220,420),k*.08,.16)}},
  pocket:{make:pixelP,snd:big=>{(big?[523,659,784,1047,784,1047,1319,1568]:[988,1319]).forEach((f,i)=>chip(f,i*.06,.06,.05));fxHit(0,.04,8000,1,.05,"highpass")}}};
const themeFx=()=>THEME_FX[document.documentElement.dataset.theme];
/* one burst: pieces fly from (x,y) in a cone around ang */
function pxBurst(t,x,y,n,ang,spread,s0,s1,big){if(t.led){PX.wave(x,y,big);return}
  if(t.shutter){PX.flash(big?.55:.3);PX.add([shutterP(x,Math.min(y,PX.size()[1]*.55),big)])}
  if(t.ring)PX.add([ringP(x,y,big)]);PX.add(Array.from({length:n},()=>t.make(x,y,ang+rnd(-spread,spread),rnd(s0,s1))))}
function themedCelebrate(t,n,big){const [W,H]=PX.size();let at=0;
  for(let i=0;i<n;i++){setTimeout(()=>{const x=rnd(.15,.85)*W;try{t.snd(false)}catch(e){}
    if(t.led)PX.wave(x,rnd(.25,.6)*H,false);else pxBurst(t,x,t.ring?rnd(.3,.6)*H:H+10,12,-Math.PI/2,.5,9,15,false)},at);at+=n>=6?160:230}
  for(let i=0;i<big;i++){setTimeout(()=>{try{t.snd(true)}catch(e){}if(t.led){PX.wave(W/2,H*.4,true);setTimeout(()=>PX.wave(W*.25,H*.6,false),120);setTimeout(()=>PX.wave(W*.75,H*.3,false),240)}
    else pxBurst(t,W/2,t.ring?H*.4:H+10,60,-Math.PI/2,t.ring?Math.PI:.7,t.ring?6:11,t.ring?14:19,true)},at+(n?380:0));at+=700}}
function themedPopper(t){const [W,H]=PX.size();try{t.snd(false)}catch(e){}if(t.led){PX.wave(W/2,H*.8,false);return}pxBurst(t,W/2,H+10,26,-Math.PI/2,.45,10,16,false)}
function themedCannons(t){const [W,H]=PX.size();[0,250,500].forEach(d=>setTimeout(()=>{try{t.snd(d===0)}catch(e){}
  if(t.led){PX.wave(0,H,d===0);PX.wave(W,H,false);return}pxBurst(t,-10,H*.8,26,-Math.PI/3,.3,12,19,false);pxBurst(t,W+10,H*.8,26,-Math.PI*2/3,.3,12,19,false)},d))}
/* themed sounds for ticks, a finished exercise, the end of a rest, the finished session and taps */
const SFX_TH={
  tm4:{tick:()=>{chip(1047,0,.05,.05);chip(2093,.05,.07,.045)},ex:()=>[523,659,784,1047,1568].forEach((f,i)=>chip(f,i*.05,.07,.05)),
    rest:()=>{chip(1568,0,.06);chip(1568,.12,.06)},done:()=>{[523,659,784,1047,1319,1568,2093].forEach((f,i)=>{chip(f,i*.06,.1,.05);tone(f/2,i*.06,.12,"sawtooth",.02)})},tap:()=>chip(2400,0,.012,.03),detent:()=>click(1700,1,.07,190),land:()=>{click(1200,.9,.09,140);chip(523,.02,.05,.03)}},
  skeuo:{tick:()=>clink(2200,0,.09),ex:()=>[1600,2000,2400,3000].forEach((f,i)=>clink(f,i*.07,.07)),rest:()=>{clink(1500,0);clink(1500,.2)},
    done:()=>{tone(160,0,.7,"sine",.14,900);[1800,2250,2700,3600].forEach((f,i)=>clink(f,.2+i*.09,.07))},tap:()=>tone(3400,0,.01,"sine",.05),detent:()=>click(2300,1.6,.07,210),land:()=>{click(1600,1.3,.09,150);clink(1300,.01,.04)}},
  braun:{tick:()=>{tone(2600,0,.008,"square",.04);ding(1319,.01,.1)},ex:()=>{ding(1319,0);ding(1047,.18)},rest:()=>{ding(1047,0);ding(1047,.3)},
    done:()=>{ding(1047,0);ding(1319,.2);ding(1568,.4);ding(2093,.65,.1)},tap:()=>tone(2600,0,.008,"square",.04)},
  clay:{tick:()=>plop(340,0,.22),ex:()=>[260,330,400,500].forEach((f,i)=>plop(f,i*.08,.17)),rest:()=>{plop(220,0);plop(220,.2)},
    done:()=>[260,330,400,500,620].forEach((f,i)=>plop(f,i*.09,.18)),tap:()=>tone(520,0,.03,"sine",.08,300),detent:()=>{click(700,.7,.05);tone(320,0,.035,"sine",.09,200)},land:()=>plop(300,0,.2)},
  pocket:{tick:()=>{chip(988,0,.04);chip(1319,.04,.06)},ex:()=>[659,784,988,1319].forEach((f,i)=>chip(f,i*.06)),rest:()=>{chip(1319,0,.06);chip(988,.1,.08)},
    done:()=>{[523,659,784,1047,784,1047,1319,1568].forEach((f,i)=>chip(f,i*.07,.08));fxHit(.56,.05,8000,1,.05,"highpass")},tap:()=>chip(1800,0,.015,.03),detent:()=>click(1500,1,.07,180),land:()=>{click(1100,.9,.09,130);chip(659,.02,.04,.03)}}};
