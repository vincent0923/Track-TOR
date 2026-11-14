/* 博G · scratch to reveal, ported from Ovio's ScratchToReveal (MIT, © 2026 Jana Sundar,
   github.com/JanaSundar/ovio — licence in docs/OVIO-LICENSE.txt). The logic and the four worlds' coatings are Ovio's:
   the coating is measured on a grid of cells, past the threshold the rest clears by itself, Enter or Space reveals it.
   Ovio's React and Motion are swapped for plain DOM and CSS transitions; each skin picks the world that suits it.
   SCR.mount(host,{world,label,hint,content,threshold,onReveal}) */
const SCR=(function(){
  const gridFor=(w,h,cell)=>({cols:Math.max(1,Math.round(w/cell)),rows:Math.max(1,Math.round(h/cell))});
  function distanceToSegment(p,a,b){const dx=b.x-a.x,dy=b.y-a.y,l=dx*dx+dy*dy,t=l?Math.max(0,Math.min(1,((p.x-a.x)*dx+(p.y-a.y)*dy)/l)):0;return Math.hypot(p.x-(a.x+t*dx),p.y-(a.y+t*dy))}
  function cellsUnder(a,b,radius,grid,w,h){const cw=w/grid.cols,ch=h/grid.rows,span=(lo,hi,size,count)=>[Math.max(0,Math.floor((lo-radius)/size)),Math.min(count-1,Math.floor((hi+radius)/size))];
    const [c0,c1]=span(Math.min(a.x,b.x),Math.max(a.x,b.x),cw,grid.cols),[r0,r1]=span(Math.min(a.y,b.y),Math.max(a.y,b.y),ch,grid.rows),cells=[];
    for(let r=r0;r<=r1;r++)for(let c=c0;c<=c1;c++)if(distanceToSegment({x:(c+.5)*cw,y:(r+.5)*ch},a,b)<=radius)cells.push(r*grid.cols+c);return cells}
  function cellBox(i,grid,w,h){const c=i%grid.cols,r=Math.floor(i/grid.cols),x=Math.floor(c*w/grid.cols),y=Math.floor(r*h/grid.rows);return {x,y,w:Math.ceil((c+1)*w/grid.cols)-x,h:Math.ceil((r+1)*h/grid.rows)-y}}
  const percentOf=s=>Math.round(Math.max(0,Math.min(1,s))*100);
  const shareMeter=s=>{const lit=Math.round(percentOf(s)/10);return "▓".repeat(lit)+"░".repeat(10-lit)};
  function seeded(seed){return ()=>{seed=(seed+0x6d2b79f5)|0;let t=Math.imul(seed^(seed>>>15),1|seed);t=(t+Math.imul(t^(t>>>7),61|t))^t;return ((t^(t>>>14))>>>0)/4294967296}}
  function burst(count,seed=7){const rnd=seeded(seed);return Array.from({length:count},(_,i)=>{const angle=i/count*Math.PI*2+rnd()*.4,reach=22+rnd()*16;return {x:Math.cos(angle)*reach,y:Math.sin(angle)*reach,rotate:Math.round(rnd()*360),tone:i%3}})}
  function sparkle(g,x,y,r){g.beginPath();g.moveTo(x,y-r);g.quadraticCurveTo(x,y,x+r,y);g.quadraticCurveTo(x,y,x,y+r);g.quadraticCurveTo(x,y,x-r,y);g.quadraticCurveTo(x,y,x,y-r);g.fill()}
  const SPRINKLES=["#f4b52a","#ffffff","#ef4f2b","#9fe8ff"],NOISE=["#06260f","#0d4a22","#2fa650"];
  /* the worlds' coatings and brushes, as Ovio paints them */
  const FEEL={
    minimal:{brush:18,cell:6,paint(g,w,h){const f=g.createLinearGradient(0,0,w,h);f.addColorStop(0,"#dcdad4");f.addColorStop(.5,"#eae9e4");f.addColorStop(1,"#d3d1ca");g.fillStyle=f;g.fillRect(0,0,w,h);
      const rnd=seeded(3);for(let i=0;i<w*h/10;i++){g.fillStyle=rnd()<.5?"rgba(0,0,0,"+rnd()*.08+")":"rgba(255,255,255,"+rnd()*.12+")";g.fillRect(rnd()*w,rnd()*h,1,1)}}},
    retro:{brush:14,cell:10,blocky:true,paint(g,w,h){const grid=gridFor(w,h,10),rnd=seeded(5);for(let i=0;i<grid.cols*grid.rows;i++){const v=rnd(),b=cellBox(i,grid,w,h);g.fillStyle=NOISE[v>.72?2:v>.38?1:0];g.fillRect(b.x,b.y,b.w,b.h)}}},
    toy:{brush:24,cell:8,paint(g,w,h){const f=g.createLinearGradient(0,0,w,h);f.addColorStop(0,"#4470f2");f.addColorStop(1,"#2244c4");g.fillStyle=f;g.fillRect(0,0,w,h);
      const rnd=seeded(11);for(let i=0;i<w*h/700;i++){g.save();g.translate(rnd()*w,rnd()*h);g.rotate(rnd()*Math.PI);g.fillStyle=SPRINKLES[i%SPRINKLES.length];g.beginPath();g.roundRect(-5,-1.75,10,3.5,1.75);g.fill();g.restore()}}},
    craft:{brush:14,cell:6,rough:true,paint(g,w,h){const f=g.createLinearGradient(0,0,w,h);f.addColorStop(0,"#a8a8a2");f.addColorStop(.35,"#e6e6df");f.addColorStop(.5,"#c2c2bb");f.addColorStop(.7,"#ecece5");f.addColorStop(1,"#9d9d97");g.fillStyle=f;g.fillRect(0,0,w,h);
      const rnd=seeded(8);for(let y=0;y<h;y+=1.5){g.fillStyle="rgba(255,255,255,"+rnd()*.14+")";g.fillRect(0,y,w,.75)}
      for(let y=14,row=0;y<h+10;y+=26,row++)for(let x=row%2?6:26;x<w+10;x+=40){g.fillStyle="rgba(60,60,55,.3)";sparkle(g,x+.7,y+.7,5);g.fillStyle="rgba(255,255,255,.6)";sparkle(g,x,y,5)}}}};
  function mount(host,o){const world=FEEL[o.world]?o.world:"minimal",feel=FEEL[world],threshold=Math.max(.05,Math.min(1,o.threshold||.5)),hint=o.hint||"Scratch to reveal";
    const pad='<div class="ovs-pad" role="button" tabindex="0" aria-label="'+hint+': '+o.label+'"><div class="ovs-content" inert aria-hidden="true">'+o.content+'</div><canvas aria-hidden="true"></canvas><div class="ovs-hint" aria-hidden="true"><span>'+hint+'</span></div>'+(world==="retro"?'<div class="ovs-scan" aria-hidden="true"></div>':'')+'</div>';
    const pct='<span class="ovs-pct">0%</span>';
    host.innerHTML={
      minimal:'<div class="ovs ovs-minimal" data-ovio-world="minimal"><div class="ovs-head"><span>'+o.label+'</span>'+pct+'</div>'+pad+'<div class="ovs-track"><i></i></div></div>',
      retro:'<div class="ovs ovs-retro" data-ovio-world="retro"><div class="ovs-head"><span>'+o.label+'</span><span class="ovs-state"><i></i><b>SEALED</b></span></div>'+pad+'<div class="ovs-foot"><span>DECODE <b class="ovs-meter">'+shareMeter(0)+'</b></span>'+pct.replace("0%","000%")+'</div></div>',
      toy:'<div class="ovs ovs-toy" data-ovio-world="toy"><span class="ovs-title">'+o.label+'</span>'+pad+'<div class="ovs-bar"><i></i></div></div>',
      craft:'<div class="ovs ovs-craft" data-ovio-world="craft"><i class="ovs-dash" aria-hidden="true"></i><b class="ovs-title">'+o.label+'</b>'+pad+'<div class="ovs-foot"><span class="ovs-hand">'+(o.coin||"scratch with a coin")+'</span>'+pct+'</div></div>'}[world];
    const root=host.firstElementChild,el=root.querySelector(".ovs-pad"),cv=el.querySelector("canvas"),content=el.querySelector(".ovs-content");
    let coating=null,last=null,done=false;
    const show=s=>{const p=percentOf(s);root.style.setProperty("--ovs-p",s);root.querySelectorAll(".ovs-pct").forEach(x=>x.textContent=world==="retro"?String(p).padStart(3,"0")+"%":p+"%");const m=root.querySelector(".ovs-meter");if(m)m.textContent=shareMeter(s)};
    const draw=()=>{const w=el.clientWidth,h=el.clientHeight,g=cv.getContext("2d");if(!w||!h||!g||done)return;const dpr=Math.min(2,devicePixelRatio||1);
      cv.width=Math.round(w*dpr);cv.height=Math.round(h*dpr);g.setTransform(dpr,0,0,dpr,0,0);feel.paint(g,w,h);
      if(coating){coating.w=w;coating.h=h;coating.cleared.forEach((on,i)=>{if(!on)return;const b=cellBox(i,coating.grid,w,h);g.clearRect(b.x,b.y,b.w,b.h)})}
      else{const grid=gridFor(w,h,feel.cell);coating={grid,cleared:new Uint8Array(grid.cols*grid.rows),count:0,w,h}}};
    draw();const ro=new ResizeObserver(draw);ro.observe(el);
    const reveal=()=>{if(done)return;done=true;last=null;ro.disconnect();show(1);root.classList.add("open");content.removeAttribute("inert");content.removeAttribute("aria-hidden");el.setAttribute("role","group");el.tabIndex=-1;
      const st=root.querySelector(".ovs-state b");if(st)st.textContent="OPEN";const hd=root.querySelector(".ovs-hand");if(hd)hd.textContent=o.there||"there it is ✿";
      if(world==="toy"&&!matchMedia("(prefers-reduced-motion: reduce)").matches)burst(14).forEach((p,i)=>{const s=document.createElement("span");s.className="ovs-bit t"+p.tone;s.style.cssText="--x:"+p.x+"%;--y:"+p.y+"%;--r:"+p.rotate+"deg;animation-delay:"+i*12+"ms";el.appendChild(s)});
      o.onReveal&&o.onReveal()};
    const scratch=(a,b)=>{const c=coating,g=cv.getContext("2d");if(!c||!g)return;const cells=cellsUnder(a,b,feel.brush,c.grid,c.w,c.h);
      if(feel.blocky)for(const i of cells){const x=cellBox(i,c.grid,c.w,c.h);g.clearRect(x.x,x.y,x.w,x.h)}
      else{g.save();g.globalCompositeOperation="destination-out";g.lineCap="round";g.lineJoin="round";g.lineWidth=feel.brush*2;g.beginPath();g.moveTo(a.x,a.y);g.lineTo(b.x,b.y);g.stroke();
        g.beginPath();g.arc(b.x,b.y,feel.brush,0,Math.PI*2);if(feel.rough)for(let k=0;k<4;k++){const an=Math.random()*Math.PI*2,re=feel.brush*(.9+Math.random()*.3),x=b.x+Math.cos(an)*re,y=b.y+Math.sin(an)*re;g.moveTo(x,y);g.arc(x,y,1+Math.random()*2.5,0,Math.PI*2)}g.fill();g.restore()}
      for(const i of cells)if(!c.cleared[i]){c.cleared[i]=1;c.count++}
      const share=Math.min(1,c.count/(c.grid.cols*c.grid.rows));show(share);o.onProgress&&o.onProgress(share);if(share>=threshold)reveal()};
    const at=e=>{const r=el.getBoundingClientRect(),w=coating?coating.w:r.width,h=coating?coating.h:r.height;return {x:r.width?(e.clientX-r.left)/r.width*w:0,y:r.height?(e.clientY-r.top)/r.height*h:0}};
    el.addEventListener("pointerdown",e=>{if(done||!e.isPrimary||e.button!==0)return;el.setPointerCapture(e.pointerId);root.classList.add("touched");const p=at(e);last=p;scratch(p,p)});
    el.addEventListener("pointermove",e=>{const f=last;if(!f||done)return;const p=at(e);last=p;scratch(f,p)});
    const rel=()=>{last=null};el.addEventListener("pointerup",rel);el.addEventListener("pointercancel",rel);
    el.addEventListener("keydown",e=>{if(done||(e.key!=="Enter"&&e.key!==" "))return;e.preventDefault();reveal()});
    return {reveal}}
  return {mount}})();
