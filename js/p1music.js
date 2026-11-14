/* 推拉机 · mini player: a remote for Spotify through the Web API (Spotify Connect). The app on the phone plays; this
   page shows what's on and sends play / pause / next / previous / volume. Sign-in is PKCE with no server; the tokens
   live in tracktor-sp, which backups don't carry. Control needs Premium.
   The client id is the user's own (Settings › Advanced › Spotify, tracktor-sp-cid); until there is one, the panel offers a
   preview with a sample track so the look can be tried.
   tracktor-p1-music: "on" (connected player shown), "demo" (preview), anything else: hidden. */
const SPC_K="tracktor-sp-cid";
function spCid(){try{return (localStorage.getItem(SPC_K)||"").trim()}catch(e){return ""}}
const SP_K="tracktor-sp",SPM_K="tracktor-p1-music";
/* everything playback-related in one sign-in, so a later feature never has to ask again */
const SP_SCOPES="user-read-playback-state user-modify-playback-state user-read-currently-playing user-read-recently-played user-read-playback-position user-top-read playlist-read-private playlist-read-collaborative user-library-read user-library-modify user-follow-read user-read-private streaming";
const SP={tok:null,st:null,at:0,poll:0,busy:false,demo:false};
const spRedirect=()=>location.origin+location.pathname.replace(/index\.html$/,"");
function spMode(){try{return localStorage.getItem(SPM_K)||""}catch(e){return ""}}
function spSetMode(v){try{v?localStorage.setItem(SPM_K,v):localStorage.removeItem(SPM_K)}catch(e){}}
function spLoad(){try{SP.tok=JSON.parse(localStorage.getItem(SP_K)||"null")}catch(e){SP.tok=null}}
function spSave(){try{SP.tok?localStorage.setItem(SP_K,JSON.stringify(SP.tok)):localStorage.removeItem(SP_K)}catch(e){}}
const b64u=a=>btoa(String.fromCharCode(...new Uint8Array(a))).replace(/\+/g,"-").replace(/\//g,"_").replace(/=+$/,"");

/* ---------- sign-in (authorization code with PKCE) ---------- */
async function spConnect(){if(!spCid())return;const v=b64u(crypto.getRandomValues(new Uint8Array(48))),state=b64u(crypto.getRandomValues(new Uint8Array(12)));
  const ch=b64u(await crypto.subtle.digest("SHA-256",new TextEncoder().encode(v)));
  try{localStorage.setItem(SP_K+"-v",JSON.stringify({v,state}))}catch(e){}
  location.href="https://accounts.spotify.com/authorize?"+new URLSearchParams({client_id:spCid(),response_type:"code",redirect_uri:spRedirect(),
    code_challenge_method:"S256",code_challenge:ch,scope:SP_SCOPES,state})}
async function spToken(body){const r=await fetch("https://accounts.spotify.com/api/token",{method:"POST",headers:{"Content-Type":"application/x-www-form-urlencoded"},
    body:new URLSearchParams(Object.assign({client_id:spCid()},body))});
  if(!r.ok)throw new Error("token "+r.status);const j=await r.json();
  SP.tok={a:j.access_token,r:j.refresh_token||(SP.tok&&SP.tok.r),x:Date.now()+(j.expires_in-60)*1000,s:j.scope||(SP.tok&&SP.tok.s)||""};spSave()}
/* back from Spotify with ?code=… */
async function spCallback(){const q=new URLSearchParams(location.search),code=q.get("code");if(!code&&!q.get("error"))return;
  let saved=null;try{saved=JSON.parse(localStorage.getItem(SP_K+"-v")||"null")}catch(e){}
  history.replaceState(null,"",spRedirect());if(!code||!saved||q.get("state")!==saved.state)return;
  try{await spToken({grant_type:"authorization_code",code,redirect_uri:spRedirect(),code_verifier:saved.v});spSetMode("on");localStorage.removeItem(SP_K+"-v");toast(T("已连接 Spotify","Spotify connected"));if(typeof advDone==="function")advDone("spotify");spStart()}
  catch(e){toast(T("连接 Spotify 失败","Couldn't connect Spotify"))}}
async function spAuth(){spLoad();if(!SP.tok)return null;if(Date.now()>SP.tok.x){try{await spToken({grant_type:"refresh_token",refresh_token:SP.tok.r})}catch(e){SP.tok=null;spSave();return null}}return SP.tok.a}
async function spApi(path,method,body){const a=await spAuth();if(!a)throw new Error("auth");
  const r=await fetch("https://api.spotify.com/v1"+path,{method:method||"GET",headers:Object.assign({Authorization:"Bearer "+a},body?{"Content-Type":"application/json"}:{}),body:body?JSON.stringify(body):undefined});
  if(r.status===401&&SP.tok){SP.tok.x=0;return spApi(path,method,body)}
  if(r.status===204)return null;let j=null;try{j=await r.json()}catch(e){}
  if(!r.ok){const e=new Error((j&&j.error&&j.error.reason)||String(r.status));e.status=r.status;throw e}return j}

/* ---------- state ---------- */
const SP_DEMO={shuf:false,rep:"off",title:T("示例歌曲","Sample track"),artist:T("推拉机 · 预览","Track-TOR · preview"),art:"",dur:214000,pos:61000,playing:true,vol:62,device:T("这台手机","This phone")};
function spNow(){const s=SP.st;if(!s)return null;return s.playing?Math.min(s.dur,s.pos+(Date.now()-SP.at)):s.pos}
async function spPull(){if(SP.demo||SP.busy)return;try{const j=await spApi("/me/player");
    if(!j||!j.item)SP.st=j&&j.device?{title:"",artist:"",art:"",dur:0,pos:0,playing:false,vol:j.device.volume_percent,device:j.device.name,idle:true}:null;
    else{const it=j.item;SP.st={title:it.name,artist:(it.artists||[]).map(a=>a.name).join(", ")||(it.show&&it.show.name)||"",art:spCover((it.album||it).images),
      dur:it.duration_ms,pos:j.progress_ms||0,playing:!!j.is_playing,ctx:j.context&&j.context.uri,shuf:!!j.shuffle_state,smart:!!j.smart_shuffle,rep:j.repeat_state||"off",vol:j.device&&j.device.volume_percent,device:j.device&&j.device.name}}
    SP.at=Date.now();spPaint()}catch(e){if(e.message==="auth"){spSetMode("");spPaint()}}}
async function spCmd(kind){const s=SP.st;buzz(8);if(typeof SFX!=="undefined")SFX.tap();
  if(kind==="shuf"||kind==="rep"){if(!s)return;if(kind==="shuf"){if(s.smart){s.smart=false;s.shuf=true}s.shuf=!s.shuf;try{localStorage.setItem(SP_K+"-shuf",s.shuf?"1":"0")}catch(e){}}else s.rep={off:"context",context:"track",track:"off"}[s.rep||"off"];
    spPaint();if(SP.demo)return;SP.busy=true;try{await spApi(kind==="shuf"?"/me/player/shuffle?state="+s.shuf:"/me/player/repeat?state="+s.rep,"PUT")}catch(e){if(e.status===403)toast(T("控制需要 Spotify Premium","Control needs Spotify Premium"))}SP.busy=false;setTimeout(spPull,600);return}
  /* nothing playing: start the last playlist again */
  if(kind==="toggle"&&(!s||!s.title)&&spLast()){spPlayList(spLast());return}
  if(SP.demo){if(kind==="toggle"){s.pos=spNow();s.playing=!s.playing;SP.at=Date.now()}else if(kind==="next"||kind==="prev"){s.pos=0;SP.at=Date.now();s.playing=true}spPaint();return}
  SP.busy=true;try{
    if(kind==="toggle"){if(s&&s.playing){s.pos=spNow();s.playing=false;spPaint();await spApi("/me/player/pause","PUT")}else{if(s){s.playing=true;SP.at=Date.now();spPaint()}await spApi("/me/player/play","PUT")}}
    else if(kind==="next")await spApi("/me/player/next","POST");else if(kind==="prev")await spApi("/me/player/previous","POST")}
  catch(e){if(e.status===404)toast(T("先在 Spotify 里放一首","Play something in Spotify first"));else if(e.status===403)toast(T("控制需要 Spotify Premium","Control needs Spotify Premium"))}
  SP.busy=false;setTimeout(spPull,kind==="toggle"?400:700)}
let spVolT=0;function spVol(v){if(!SP.st)return;SP.st.vol=v;if(SP.demo)return;clearTimeout(spVolT);spVolT=setTimeout(()=>spApi("/me/player/volume?volume_percent="+v,"PUT").catch(()=>{}),250)}

/* ---------- the capsule above the dock ---------- */
const SPI={play:'<svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5.5v13a1 1 0 0 0 1.5.86l10.5-6.5a1 1 0 0 0 0-1.72L9.5 4.64A1 1 0 0 0 8 5.5z"/></svg>',
  pause:'<svg viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="5" width="4.2" height="14" rx="1.4"/><rect x="13.8" y="5" width="4.2" height="14" rx="1.4"/></svg>',
  next:'<svg viewBox="0 0 24 24" fill="currentColor"><path d="M5 6.2v11.6a1 1 0 0 0 1.5.86L15 13.4v4.1a1 1 0 0 0 2 0v-11a1 1 0 0 0-2 0v4.1L6.5 5.34A1 1 0 0 0 5 6.2z"/></svg>',
  prev:'<svg viewBox="0 0 24 24" fill="currentColor"><path d="M19 6.2v11.6a1 1 0 0 1-1.5.86L9 13.4v4.1a1 1 0 0 1-2 0v-11a1 1 0 0 1 2 0v4.1l8.5-5.26A1 1 0 0 1 19 6.2z"/></svg>',
  note:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18V5l11-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="17" cy="16" r="3"/></svg>',
  down:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9l6 6 6-6"/></svg>',
  list:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h12M3 12h12M3 18h8"/><path d="M17 18V9l4-1"/><circle cx="15.5" cy="18" r="1.8"/></svg>',
  back:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M15 5l-7 7 7 7"/></svg>',
  rep:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 2l4 4-4 4"/><path d="M3 11V9a3 3 0 0 1 3-3h15M7 22l-4-4 4-4"/><path d="M21 13v2a3 3 0 0 1-3 3H3"/></svg>',
  rep1:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 2l4 4-4 4"/><path d="M3 11V9a3 3 0 0 1 3-3h15M7 22l-4-4 4-4"/><path d="M21 13v2a3 3 0 0 1-3 3H3"/><path d="M11 10h1v4" stroke-width="1.8"/></svg>',
  smart:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 4h4v4M7 20l14-14M21 16v4h-4M15 15l6 5"/><path d="M6 2.5l1 2.5 2.5 1-2.5 1L6 9.5 5 7 2.5 6 5 5z" fill="currentColor" stroke="none"/></svg>',
  shuf:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 3h5v5M4 20l17-17M21 16v5h-5M15 15l6 6M4 4l5 5"/></svg>'};
const spArt=(s,cls)=>'<span class="'+cls+'"'+(s&&s.art?' style="background-image:url(\''+esc(s.art)+'\')"':'')+'>'+(s&&s.art?'':SPI.note)+'</span>';
/* easter egg: while music plays, the calorie bricks sway a little and pick up a faint glow in the cover's colours */
let spAlbArt="";
function spGroove(){const de=document.documentElement,s=SP.st,on=!!(s&&s.playing)&&!document.hidden&&!matchMedia("(prefers-reduced-motion: reduce)").matches;
  de.classList.toggle("groove",on);if(!on||!s.art||s.art===spAlbArt)return;spAlbArt=s.art;
  const im=new Image();im.crossOrigin="anonymous";im.onload=()=>{try{const c=document.createElement("canvas");c.width=c.height=12;const x=c.getContext("2d");x.drawImage(im,0,0,12,12);
    const d=x.getImageData(0,0,12,12).data;let best=null,bs=-1;for(let k=0;k<d.length;k+=4){const r=d[k],g=d[k+1],b=d[k+2],mx=Math.max(r,g,b),mn=Math.min(r,g,b),sat=mx?(mx-mn)/mx:0,sc=sat*(mx/255);if(sc>bs){bs=sc;best=[r,g,b]}}
    if(best)de.style.setProperty("--alb","rgb("+best.join(",")+")")}catch(e){}};im.src=s.art}
function spPaint(){spGroove();let el=document.getElementById("mini");const on=SP.demo||(spMode()==="on"&&SP.tok);
  document.body.classList.toggle("has-mini",!!on);if(!on){if(el)el.remove();return}
  if(!el){el=document.createElement("div");el.id="mini";el.className="mini-pl";document.body.appendChild(el);
    el.addEventListener("click",e=>{if(el.dataset.swiped){delete el.dataset.swiped;return}const b=e.target.closest("[data-sp]");if(b){e.stopPropagation();spCmd(b.dataset.sp);return}spOpen()});
    /* a sideways swipe on the bar changes the song: left for the next, right for the previous */
    let x0=null,y0=0,dx=0;
    el.addEventListener("touchstart",e=>{x0=e.touches[0].clientX;y0=e.touches[0].clientY;dx=0;el.style.transition="none"},{passive:true});
    el.addEventListener("touchmove",e=>{if(x0==null)return;dx=e.touches[0].clientX-x0;if(Math.abs(dx)>Math.abs(e.touches[0].clientY-y0)&&Math.abs(dx)>8)el.style.setProperty("--sx",Math.max(-60,Math.min(60,dx*.5))+"px")},{passive:true});
    el.addEventListener("touchend",()=>{if(x0==null)return;x0=null;el.style.transition="";el.style.setProperty("--sx","0px");
      if(Math.abs(dx)>50){el.dataset.swiped=1;setTimeout(()=>delete el.dataset.swiped,400);el.classList.remove("flick");void el.offsetWidth;el.classList.add("flick");spCmd(dx<0?"next":"prev")}})}
  const s=SP.st;
  const last=(!s||!s.title)&&spLast();
  el.innerHTML=spArt(s,"mp-art")+'<span class="mp-t"><b>'+esc(s&&s.title||(last?T("继续放「"+last.name+"」","Play "+last.name):T("Spotify 没在播放","Nothing playing")))+'</b><small>'+esc(s&&s.title?s.artist:last?T("上次的歌单","Your last playlist"):(s&&s.device)||"")+'</small></span>'
    +'<button class="mp-b" data-sp="toggle" aria-label="'+T("播放 / 暂停","Play / pause")+'">'+(s&&s.playing?SPI.pause:SPI.play)+'</button>'
    +'<button class="mp-b mp-n" data-sp="next" aria-label="'+T("下一首","Next")+'">'+SPI.next+'</button><i class="mp-bar"></i>';
  el.classList.toggle("playing",!!(s&&s.playing));spTick();if(spSheetOpen()&&SP.view!=="pl")spPaintSheet();else if(SP.view==="pl")spMarkPl()}
function spTick(){const s=SP.st,el=document.getElementById("mini");if(!el||!s)return;const p=s.dur?spNow()/s.dur:0;el.style.setProperty("--p",p);
  const f=document.querySelector(".sp-full");if(f){f.style.setProperty("--p",p);const t=f.querySelectorAll(".sp-time span");if(t.length===2){t[0].textContent=spFmt(spNow());t[1].textContent="-"+spFmt(s.dur-spNow())}}}
const spFmt=ms=>{const t=Math.max(0,Math.round(ms/1000));return Math.floor(t/60)+":"+String(t%60).padStart(2,"0")};

/* ---------- the full player (bottom sheet) ---------- */
const spSheetOpen=()=>!!document.querySelector(".sheet.on .sp-full");
function spOpen(){SP.view="player";openSheet('<div class="sh-h"><h3>'+T('正在播放','Now playing')+'</h3><button class="mini" data-act="close">'+ICON.x+'</button></div><div class="sp-full"></div>');spPaintSheet()}
function spPaintSheet(){const f=document.querySelector(".sheet.on .sp-full");if(!f)return;SP.view="player";const s=SP.st||{};
  f.innerHTML=spArt(s,"sp-art"+(s.playing?" on":""))+'<div class="sp-meta"><b>'+esc(s.title||T("Spotify 没在播放","Nothing playing"))+'</b><span class="muted">'+esc(s.artist||"")+'</span></div>'
    +'<div class="sp-prog"><i></i></div><div class="sp-time n muted"><span></span><span></span></div>'
    +'<div class="sp-ctl"><button class="mp-b sp-mode'+(s.shuf||s.smart?' on':'')+'" data-sp="shuf" aria-pressed="'+!!(s.shuf||s.smart)+'" aria-label="'+(s.smart?T("智能随机（在 Spotify 里开的）","Smart shuffle (turned on in Spotify)"):T("随机播放","Shuffle"))+'">'+(s.smart?SPI.smart:SPI.shuf)+'</button><button class="mp-b" data-sp="prev" aria-label="'+T("上一首","Previous")+'">'+SPI.prev+'</button><button class="mp-b sp-big" data-sp="toggle" aria-label="'+T("播放 / 暂停","Play / pause")+'">'+(s.playing?SPI.pause:SPI.play)+'</button><button class="mp-b" data-sp="next" aria-label="'+T("下一首","Next")+'">'+SPI.next+'</button><button class="mp-b sp-mode'+(s.rep&&s.rep!=="off"?' on':'')+'" data-sp="rep" aria-label="'+T("循环","Repeat")+'">'+(s.rep==="track"?SPI.rep1:SPI.rep)+'</button></div>'
    +'<label class="sp-vol"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M4 9.5h3.2L12 5.5v13l-4.8-4H4z"/></svg><input type="range" min="0" max="100" value="'+(s.vol==null?50:s.vol)+'" aria-label="'+T("音量","Volume")+'"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 9.5h3.2L12 5.5v13l-4.8-4H4z" fill="currentColor" stroke="none"/><path d="M15.5 9a4.5 4.5 0 0 1 0 6M18 6.5a8 8 0 0 1 0 11"/></svg></label>'
    +'<button class="sp-plbtn" type="button" data-sppl>'+SPI.list+'<span>'+T('歌单','Playlists')+'</span>'+SPI.down+'</button>'
    +(s.device?'<p class="muted sp-dev">'+T('在「'+esc(s.device)+'」上播放','Playing on '+esc(s.device))+'</p>':'');
  f.querySelectorAll("[data-sp]").forEach(b=>b.addEventListener("click",()=>spCmd(b.dataset.sp)));
  f.querySelector(".sp-vol input").addEventListener("input",e=>spVol(+e.target.value));f.querySelector("[data-sppl]").addEventListener("click",spPlView);spTick()}
/* ---------- playlists: the user's own and followed ones; tap one to play it from the start (or shuffled) ---------- */
const SP_DEMO_PL=[["晨练","Morning push"],["引体专用","Pull-up power"],["慢跑","Easy run"],["拉伸放松","Stretch & cool down"],["老歌","Oldies"],["专注","Focus"]].map(([z,e],i)=>({name:T(z,e),uri:"demo:"+i,n:[24,41,58,17,93,30][i],art:"",hue:[12,220,150,280,40,190][i]}));
const spShuf=()=>{if(SP.st&&SP.st.shuf!=null&&!SP.demo)return SP.st.shuf;try{return localStorage.getItem(SP_K+"-shuf")==="1"}catch(e){return false}};
/* while the grid is open a refresh only moves the "playing" mark */
function spMarkPl(){const cur=SP.st&&SP.st.ctx,list=SP.demo?SP_DEMO_PL:SP.pls;if(!list)return;
  document.querySelectorAll(".sheet.on .sp-cell").forEach(c=>{const p=list[+c.dataset.i],on=!!(p&&p.uri===cur);if(c.classList.contains("on")===on)return;c.classList.toggle("on",on);
    const cv=c.querySelector(".sp-cover"),eq=cv&&cv.querySelector(".sp-eq");if(on&&!eq)cv.insertAdjacentHTML("beforeend",'<i class="sp-eq"><i></i><i></i><i></i></i>');if(!on&&eq)eq.remove()})}
/* recent plays, newest first (Spotify keeps about the last 50; follow the cursor in case it gives more) */
async function spRecent(){const out=[];let url="/me/player/recently-played?limit=50";
  for(let k=0;k<4&&url;k++){const r=await spApi(url),items=(r&&r.items)||[];items.forEach(it=>{const t=it.track;if(t&&t.uri)out.push({u:t.uri,c:it.context&&it.context.uri,t:Date.parse(it.played_at)||0})});
    const nx=r&&r.cursors&&r.cursors.before;url=items.length===50&&nx?"/me/player/recently-played?limit=50&before="+nx:null}
  return out}
/* a playlist's track uris, cached by snapshot so only changed playlists are fetched again */
const SPT_K=SP_K+"-pt";
async function spTracks(p,cache){const c=cache[p.uri];if(c&&c.s===p.snap)return c.t;const id=p.uri.split(":").pop(),t=[];
  const pull=async base=>{let url=base+"?limit=100&offset=0";for(let k=0;k<5&&url;k++){const j=await spApi(url);((j&&j.items)||[]).forEach(x=>{const tr=x&&(x.item||x.track);if(tr&&tr.uri)t.push(tr.uri.split(":").pop())});
    url=j&&j.next?j.next.replace("https://api.spotify.com/v1",""):null}};
  try{await pull("/playlists/"+id+"/items")}catch(e){t.length=0;await pull("/playlists/"+id+"/tracks")}
  cache[p.uri]={s:p.snap,t};return t}
/* covers: the smallest one still sharp in a third of the screen (Spotify lists 640, 300 and 60 px; mosaics too) */
function spCover(im){im=(im||[]).filter(x=>x&&x.url);if(!im.length)return "";const w=x=>x.width||0;if(!im.some(w))return im[0].url;
  const ok=im.filter(x=>w(x)>=240).sort((a,b)=>w(a)-w(b));return (ok[0]||im.slice().sort((a,b)=>w(b)-w(a))[0]).url}
const SP_NEED=["user-read-recently-played","playlist-read-private","user-modify-playback-state"];
/* long-press the Spotify button: forget the cached playlists and their songs and rank again; a sign-in missing a
   permission the ranking needs is renewed once (asks for everything at once) */
function spReset(){const s=(SP.tok&&SP.tok.s)||"";if(SP.tok&&SP_NEED.some(k=>!s.split(" ").includes(k))){toast(T("重新授权一次，之后不用再授权","Sign in once more; it won't ask again"));setTimeout(spConnect,700);return}
  try{localStorage.removeItem(SPT_K)}catch(e){}SP.pls=null;SP.rec=null;SP.ranked=false;toast(T("已清空歌单缓存，重新排序","Playlist cache cleared; ranking again"));spPlView()}
async function spPlaylists(){if(SP.demo)return SP_DEMO_PL;if(SP.pls&&Date.now()-SP.plsAt<300000)return SP.pls;const out=[];let url="/me/playlists?limit=50";
  for(let k=0;k<4&&url;k++){const j=await spApi(url);(j.items||[]).forEach(p=>{if(p)out.push({name:p.name,uri:p.uri,snap:p.snapshot_id||"",n:p.tracks?p.tracks.total:(p.items&&p.items.total)||0,art:spCover(p.images)})});
    url=j.next?j.next.replace("https://api.spotify.com/v1",""):null}
  /* first pass: when each playlist was last played from, plus playlists started here and the one playing now */
  let rec=[];try{rec=await spRecent()}catch(e){}SP.rec=rec;
  const at={};rec.forEach(r=>{if(r.c&&r.t>(at[r.c]||0))at[r.c]=r.t});
  try{Object.entries(JSON.parse(localStorage.getItem(SP_K+"-played")||"{}")).forEach(([u,t])=>{if(t>(at[u]||0))at[u]=t})}catch(e){}
  if(SP.st&&SP.st.ctx)at[SP.st.ctx]=Date.now();
  out.forEach((p,i)=>{p.k=i;p.at=at[p.uri]||0;p.hit=0});out.sort((a,b)=>b.at-a.at||a.k-b.k);
  SP.pls=out;SP.plsAt=Date.now();SP.ranked=false;return out}
/* second pass (slower, so the grid shows first): rank by how many of the recent plays are songs in each playlist,
   newer plays counting a little more; ties keep the last-played order */
async function spRank(list){if(SP.demo||SP.ranked||!SP.rec||!SP.rec.length)return false;let cache={};try{cache=JSON.parse(localStorage.getItem(SPT_K)||"{}")}catch(e){}
  const n=SP.rec.length,w={};SP.rec.forEach((r,i)=>{w[r.u]=(w[r.u]||0)+1+(n-i)/n});
  const ctxW={};SP.rec.forEach((r,i)=>{if(r.c)ctxW[r.c]=(ctxW[r.c]||0)+1+(n-i)/n});
  let q=list.slice();const work=async()=>{while(q.length){const p=q.shift();try{const t=await spTracks(p,cache),seen=new Set(t);let h=0;seen.forEach(u=>{if(w["spotify:track:"+u])h+=w["spotify:track:"+u]});p.hit=Math.max(h,ctxW[p.uri]||0)}catch(e){p.hit=ctxW[p.uri]||0}}};
  await Promise.all([work(),work(),work(),work()]);
  const keep={};list.forEach(p=>{if(cache[p.uri])keep[p.uri]=cache[p.uri]});try{localStorage.setItem(SPT_K,JSON.stringify(keep))}catch(e){}
  list.sort((a,b)=>b.hit-a.hit||b.at-a.at||a.k-b.k);SP.ranked=true;return true}
/* playlists as a grid of big covers (easy to hit mid-workout) */
async function spPlView(){const f=document.querySelector(".sheet.on .sp-full");if(!f)return;buzz(6);SP.view="pl";spLoad();
  /* one row along the bottom: the Spotify icon (tap opens the app, hold re-ranks) on the left, back to the player on the right */
  const head='';
  const foot='<div class="sp-plf"><a class="sp-pill" href="spotify:" data-spapp aria-label="'+T('打开 Spotify','Open Spotify')+'">'+BRAND.sp+'</a><button class="sp-x" type="button" data-spback aria-label="'+T('返回播放器','Back to the player')+'">'+ICON.x+'</button></div>';
  const bind=()=>{f.querySelector("[data-spback]").addEventListener("click",()=>{buzz(6);spPaintSheet()});
    const ap=f.querySelector("[data-spapp]");let held=0;if(ap&&typeof holdOpen==="function"){holdOpen(ap,()=>{held=Date.now();if(!SP.demo)spReset()});ap.addEventListener("click",e=>{if(Date.now()-held<1500)e.preventDefault()})}
};
  const reconnect=()=>{
    f.innerHTML=head+'<p class="calc-msg">'+T('读歌单需要多一项授权，重新连接一次 Spotify 就好。','Reading playlists needs one more permission; connect Spotify once more.')+'</p><button class="btn" type="button" data-sprec>'+T('重新连接','Reconnect')+'</button>'+foot;
    bind();f.querySelector("[data-sprec]").addEventListener("click",spConnect)};
  f.innerHTML=head+'<div class="sp-grid"><p class="muted" style="font-size:13px;grid-column:1/-1;text-align:center">'+T('读取中…','Loading…')+'</p></div>'+foot;bind();
  let list=[];try{list=await spPlaylists()}catch(e){if(SP.view!=="pl")return;if(e.status===401||e.status===403){reconnect();return}const g=f.querySelector(".sp-grid");if(g)g.innerHTML='<p class="muted" style="font-size:13px;grid-column:1/-1;text-align:center">'+T('读不到歌单，稍后再试','Couldn\'t load playlists; try later')+'</p>';return}
  const draw=()=>{const cur=SP.st&&SP.st.ctx,box=f.querySelector(".sp-grid");if(!box||SP.view!=="pl"||!f.isConnected)return;
  box.innerHTML=list.length?list.map((p,i)=>'<button class="sp-cell'+(p.uri===cur?' on':'')+'" type="button" data-i="'+i+'"><span class="sp-cover"'+(p.art?' style="background-image:url(\''+esc(p.art)+'\')"':p.hue!=null?' style="background:linear-gradient(135deg,hsl('+p.hue+' 80% 62%),hsl('+(p.hue+40)+' 70% 45%))"':'')+'>'+(p.art?'':SPI.note)+(p.uri===cur?'<i class="sp-eq"><i></i><i></i><i></i></i>':'')+'</span><span class="sp-name">'+esc(p.name)+'</span></button>').join("")
    :'<p class="muted" style="font-size:13px;grid-column:1/-1;text-align:center">'+T('你还没有歌单','No playlists yet')+'</p>';
  box.querySelectorAll("[data-i]").forEach(b=>b.addEventListener("click",()=>spPlayList(list[+b.dataset.i])))};
  draw();spRank(list).then(ch=>{if(ch)draw()}).catch(()=>{})}
function spLast(){try{return JSON.parse(localStorage.getItem(SP_K+"-last")||"null")}catch(e){return null}}
async function spPlayList(p){buzz(10);if(typeof SFX!=="undefined")SFX.tap();
  if(SP.demo){const s=SP.st;s.shuf=spShuf();Object.assign(s,{title:p.name+T(" · 第 1 首"," · track 1"),artist:T("推拉机 · 预览","Track-TOR · preview"),pos:0,playing:true,ctx:p.uri});SP.at=Date.now();spPaint();return}
  try{localStorage.setItem(SP_K+"-last",JSON.stringify({name:p.name,uri:p.uri}));const pl=JSON.parse(localStorage.getItem(SP_K+"-played")||"{}");pl[p.uri]=Date.now();localStorage.setItem(SP_K+"-played",JSON.stringify(pl))}catch(e){}
  const body={context_uri:p.uri};
  const go=async dev=>{await spApi("/me/player/play"+(dev?"?device_id="+encodeURIComponent(dev):""),"PUT",body)};
  try{await go(null)}catch(e){
    if(e.status===404){try{const d=await spApi("/me/player/devices"),devs=(d&&d.devices)||[],pick=devs.find(x=>x.is_active)||devs.find(x=>/smartphone/i.test(x.type))||devs[0];
        if(!pick){toast(T("先打开手机上的 Spotify","Open Spotify on your phone first"));return}await go(pick.id)}catch(e2){toast(T("放不了这个歌单","Couldn't play that playlist"));return}}
    else{toast(e.status===403?T("控制需要 Spotify Premium","Control needs Spotify Premium"):T("放不了这个歌单","Couldn't play that playlist"));return}}
  toast(T("开始播放「","Playing ")+p.name+T("」",""));if(SP.st)SP.st.ctx=p.uri;spMarkPl();setTimeout(spPull,900)}

/* ---------- Settings › Advanced › Spotify ---------- */
const SP_PASTE='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="8" y="3" width="8" height="4" rx="1.5"/><path d="M16 5h1.5A2.5 2.5 0 0 1 20 7.5v11a2.5 2.5 0 0 1-2.5 2.5h-11A2.5 2.5 0 0 1 4 18.5v-11A2.5 2.5 0 0 1 6.5 5H8"/></svg>';
function openMusic(){const mode=spMode(),con=!!(SP.tok&&mode==="on"),cid=spCid();
  const body='<label class="flabel">Client ID<span class="pastef"><input id="spcid" autocomplete="off" spellcheck="false" placeholder="'+T("粘贴 Spotify 开发者后台里的 Client ID","Paste the Client ID from the Spotify developer dashboard")+'" value="'+esc(cid)+'"><button type="button" class="pastebtn" data-sppaste aria-label="'+T("粘贴","Paste")+'">'+SP_PASTE+'</button></span></label>'
    +'<p class="calc-msg">'+T("控制播放需要 Spotify Premium。","Controlling playback needs Spotify Premium.")+'</p>'
    +(con?'<p class="wxnow">'+SPI.note+T('已连接 Spotify','Spotify connected')+'</p>':'')
    +'<div class="mode-tabs"><button type="button" data-spd="1" class="'+(mode==="demo"?"active":"")+'"'+(con?' hidden':'')+'>'+T('预览','Preview')+'</button><button type="button" data-spd="0" class="'+(mode!=="demo"&&!con?"active":"")+'"'+(con?' hidden':'')+'>'+T('不显示','Hidden')+'</button></div>';
  const S=p1Sheet("Spotify",body,con?'<button class="btn ghost wide" type="button" data-spx>'+T('断开','Disconnect')+'</button>':'<button class="btn wide" type="button" data-spc>'+T('连接 Spotify','Connect Spotify')+'</button>');
  const inp=S.q("#spcid"),save=()=>{const v=inp.value.replace(/[^A-Za-z0-9]/g,"").slice(0,64);inp.value=v;try{v?localStorage.setItem(SPC_K,v):localStorage.removeItem(SPC_K)}catch(e){}};
  inp.addEventListener("change",save);inp.addEventListener("focus",()=>setTimeout(()=>inp.select(),0));
  S.q("[data-sppaste]").addEventListener("click",async()=>{try{inp.value=await navigator.clipboard.readText();save();buzz(10)}catch(e){inp.focus();toast(T("读不到剪贴板，请长按输入框粘贴","Can't read the clipboard; long-press the box to paste"))}});
  const c=S.q("[data-spc]");if(c)c.addEventListener("click",()=>{save();if(!spCid()){toast(T("先填 Client ID","Fill in the Client ID first"));inp.focus();return}if(spMode()==="demo"){spSetMode("");spStop()}spConnect()});
  const x=S.q("[data-spx]");if(x)x.addEventListener("click",()=>{SP.tok=null;spSave();spSetMode("");spStop();S.close()});
  S.m.querySelectorAll("[data-spd]").forEach(b=>b.addEventListener("click",()=>{const on=b.dataset.spd==="1";spSetMode(on?"demo":"");
    S.m.querySelectorAll("[data-spd]").forEach(o=>o.classList.toggle("active",o===b));on?spStart():spStop()}))}
p1Reg("music",openMusic);

/* ---------- run ---------- */
function spStart(){spStop();SP.demo=spMode()==="demo";if(SP.demo){SP.st=Object.assign({},SP_DEMO);SP.at=Date.now()}
  else if(!(spMode()==="on"&&SP.tok)){spPaint();return}
  spPaint();if(!SP.demo)spPull();
  SP.poll=setInterval(()=>{if(document.hidden)return;const s=SP.st;if(SP.demo&&s&&s.playing&&spNow()>=s.dur){s.pos=0;SP.at=Date.now()}
    if(!SP.demo&&Date.now()-SP.at>5000)spPull();spTick()},1000)}
function spStop(){clearInterval(SP.poll);SP.poll=0;SP.demo=false;SP.st=null;spPaint()}
document.addEventListener("visibilitychange",()=>{if(document.hidden)return;const had=!!SP.tok;spLoad();if(!had&&SP.tok&&spMode()==="on"){spStart();return}if(SP.poll&&!SP.demo)spPull()});
addEventListener("storage",e=>{if(e.key===SP_K){spLoad();if(SP.tok&&spMode()==="on"&&!SP.poll)spStart()}});
spLoad();spCallback().finally(spStart);
