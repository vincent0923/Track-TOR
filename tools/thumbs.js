/* Theme thumbnails for the blind box and the theme list: the three main pages (training, food, progress) of every
   theme and look, filled with made-up demo data, shot in a headless browser and joined into one strip per look
   at img/th/<theme>-<light|dark>.webp. Run from the repo root after a theme or a main page changes visibly:
     python3 -m http.server 8765 &   then   node tools/thumbs.js
   Needs Playwright (require('playwright')). */
const {chromium}=require("playwright"),fs=require("fs"),path=require("path");
const BASE="http://localhost:8765/index.html",OUT=path.join(__dirname,"..","img","th"),PW=330,PH=714;
/* a few weeks of plausible training, food and body numbers, ending yesterday */
function demo(){const ymd=d=>d.toISOString().slice(0,10),day=n=>{const d=new Date();d.setDate(d.getDate()-n);return ymd(d)};
  const metrics={},diet={},foods=[["燕麦酸奶",28,9,52,0,410],["鸡胸肉沙拉",42,14,18,1,380],["牛肉饭",34,22,88,1,690],["鸡蛋两个",13,10,1,0,150],["三文鱼配蔬菜",36,20,12,1,400]];
  for(let n=1;n<=42;n++){const d=day(n),k=42-n;metrics[d]={date:d,weight:+(74.6-k*.05+Math.sin(n)*.25).toFixed(1),active:420+((n*37)%260),sleep:70+((n*13)%22),hrv:52+((n*7)%14),rhr:56-((n*3)%5)};
    if(n%3===0)metrics[d].waist=+(84-k*.07).toFixed(1);
    if(n<=21)diet[d]={items:foods.slice(0,3+(n%3)).map(f=>({name:f[0],p:f[1],f:f[2],c:f[3],veg:f[4],kcal:f[5]}))}}
  return {metrics,diet,ago:n=>day(n)}}
(async()=>{fs.mkdirSync(OUT,{recursive:true});
  const b=await chromium.launch(),pg=await b.newPage({viewport:{width:390,height:844},deviceScaleFactor:2});
  await pg.goto(BASE);
  const themes=await pg.evaluate(()=>THEMES.map(t=>({id:t.id,fix:t.fix||null})));
  const D=demo();
  await pg.evaluate(D2=>{const dd={sessions:{},metrics:D2.metrics,diet:D2.diet,settings:{plan:"cyclist",sex:"m",height:178,birth:"1990-05-01",buys:[]}};
    localStorage.clear();localStorage.setItem("tracktor-data",JSON.stringify(dd));["welcomed"].forEach(k=>localStorage.setItem("tracktor-p1-"+k,"1"));
    localStorage.setItem("tracktor-p1-fx","0");localStorage.setItem("tracktor-p1-dust","0");localStorage.setItem("tracktor-p1-rt","0")},{metrics:D.metrics,diet:D.diet});
  await pg.reload();await pg.waitForTimeout(600);
  /* finish the first sessions every other day, with pull-ups creeping up */
  await pg.evaluate(()=>{let n=0;for(const p of PROGRAM.slice(0,14)){const doc=sessionDoc(p.sid),k=n;p.ex.forEach(e=>doc.sets[e.id].forEach((x,i)=>{x.d=true;if(e.id==="pullup")x.v=Math.max(1,Math.round(2+k*.35-i*.5))}));
      doc.done=true;const d=new Date();d.setDate(d.getDate()-(28-n*2));doc.date=d.toISOString().slice(0,10);n++}
    state.settings.buys=THEMES.filter(t=>t.price).map(t=>({id:t.id,g:0,d:"2026-01-01"}));lsSave()});
  await pg.reload();await pg.waitForTimeout(600);
  for(const t of themes)for(const mode of t.fix?[t.fix]:["light","dark"]){
    await pg.evaluate(([id,m])=>{state.settings.theme=id;lsSave();localStorage.setItem("tracktor-p1-mode",m);applyMode();
      document.querySelectorAll("#sheet.on").forEach(x=>x.classList.remove("on"));document.querySelectorAll("body>.mask").forEach(x=>x.remove())},[t.id,mode]);
    const shots=[];
    for(const v of ["train","diet","prog"]){await pg.evaluate(v=>{show(v,false);scrollTo(0,0)},v);await pg.waitForTimeout(900);
      shots.push((await pg.screenshot({type:"png"})).toString("base64"))}
    /* join the three pages into one strip, scaled down, as webp */
    const data=await pg.evaluate(async([s,W,H])=>{const cv=document.createElement("canvas");cv.width=W*3;cv.height=H;const c=cv.getContext("2d");
      for(let i=0;i<3;i++){const im=new Image();im.src="data:image/png;base64,"+s[i];await im.decode();c.drawImage(im,i*W,0,W,H)}return cv.toDataURL("image/webp",.72)},[shots,PW,PH]);
    const f=path.join(OUT,t.id+"-"+mode+".webp");fs.writeFileSync(f,Buffer.from(data.split(",")[1],"base64"));console.log(f,fs.statSync(f).size)}
  await b.close()})();
