/* 推拉机 · celebrations: fireworks (with a bang), confetti poppers and cannons, and a show for each new 2% step on a
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
function celebrate(n,big){if(fxCalm())return;FW.add(n||0,big||0)}
const fxAc=()=>getComputedStyle(document.documentElement).getPropertyValue("--ac").trim()||"#22C55E";
/* one exercise done: a popper from the bottom; the whole session done: cannons from both sides */
function popper(){if(fxCalm()||!window.confetti)return;confetti({particleCount:40,spread:60,startVelocity:32,origin:{y:.75},colors:[fxAc(),"#ffffff"],zIndex:60,disableForReducedMotion:true})}
function cannons(){if(fxCalm()||!window.confetti)return;const c=fxAc();
  [0,250,500].forEach(t=>setTimeout(()=>{confetti({particleCount:70,angle:60,spread:60,origin:{x:0,y:.8},colors:[c,"#fff","#FFD24D"],zIndex:60});confetti({particleCount:70,angle:120,spread:60,origin:{x:1,y:.8},colors:[c,"#fff","#FFD24D"],zIndex:60})},t))}
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
