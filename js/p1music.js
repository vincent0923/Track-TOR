/* 推拉机 · mini player: a remote for Spotify through the Web API (Spotify Connect). The app on the phone plays; this
   page shows what's on and sends play / pause / next / previous / volume. Sign-in is PKCE with no server; the tokens
   live in tracktor-sp, which backups don't carry. Control needs Premium.
   The client id is the user's own (Settings › Advanced › Spotify, tracktor-sp-cid); until there is one, the panel offers a
   preview with a sample track so the look can be tried.
   tracktor-p1-music: "on" (connected player shown), "demo" (preview), anything else: hidden. */
const SPC_K="tracktor-sp-cid";
function spCid(){try{return (localStorage.getItem(SPC_K)||"").trim()}catch(e){return ""}}
const SP_K="tracktor-sp",SPM_K="tracktor-p1-music";
const SP_SCOPES="user-read-playback-state user-modify-playback-state user-read-currently-playing";
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
  SP.tok={a:j.access_token,r:j.refresh_token||(SP.tok&&SP.tok.r),x:Date.now()+(j.expires_in-60)*1000};spSave()}
/* back from Spotify with ?code=… */
async function spCallback(){const q=new URLSearchParams(location.search),code=q.get("code");if(!code&&!q.get("error"))return;
  let saved=null;try{saved=JSON.parse(localStorage.getItem(SP_K+"-v")||"null")}catch(e){}
  history.replaceState(null,"",spRedirect());if(!code||!saved||q.get("state")!==saved.state)return;
  try{await spToken({grant_type:"authorization_code",code,redirect_uri:spRedirect(),code_verifier:saved.v});spSetMode("on");localStorage.removeItem(SP_K+"-v");toast(T("已连接 Spotify","Spotify connected"));if(typeof advDone==="function")advDone("spotify");spStart()}
  catch(e){toast(T("连接 Spotify 失败","Couldn't connect Spotify"))}}
async function spAuth(){if(!SP.tok)return null;if(Date.now()>SP.tok.x){try{await spToken({grant_type:"refresh_token",refresh_token:SP.tok.r})}catch(e){SP.tok=null;spSave();return null}}return SP.tok.a}
async function spApi(path,method,body){const a=await spAuth();if(!a)throw new Error("auth");
  const r=await fetch("https://api.spotify.com/v1"+path,{method:method||"GET",headers:Object.assign({Authorization:"Bearer "+a},body?{"Content-Type":"application/json"}:{}),body:body?JSON.stringify(body):undefined});
  if(r.status===401&&SP.tok){SP.tok.x=0;return spApi(path,method,body)}
  if(r.status===204)return null;let j=null;try{j=await r.json()}catch(e){}
  if(!r.ok){const e=new Error((j&&j.error&&j.error.reason)||String(r.status));e.status=r.status;throw e}return j}

/* ---------- state ---------- */
const SP_DEMO={title:T("示例歌曲","Sample track"),artist:T("推拉机 · 预览","Track-TOR · preview"),art:"",dur:214000,pos:61000,playing:true,vol:62,device:T("这台手机","This phone")};
function spNow(){const s=SP.st;if(!s)return null;return s.playing?Math.min(s.dur,s.pos+(Date.now()-SP.at)):s.pos}
async function spPull(){if(SP.demo||SP.busy)return;try{const j=await spApi("/me/player");
    if(!j||!j.item)SP.st=j&&j.device?{title:"",artist:"",art:"",dur:0,pos:0,playing:false,vol:j.device.volume_percent,device:j.device.name,idle:true}:null;
    else{const it=j.item;SP.st={title:it.name,artist:(it.artists||[]).map(a=>a.name).join(", ")||(it.show&&it.show.name)||"",art:((it.album||it).images||[]).slice(-2)[0]?.url||((it.album||it).images||[])[0]?.url||"",
      dur:it.duration_ms,pos:j.progress_ms||0,playing:!!j.is_playing,vol:j.device&&j.device.volume_percent,device:j.device&&j.device.name}}
    SP.at=Date.now();spPaint()}catch(e){if(e.message==="auth"){spSetMode("");spPaint()}}}
async function spCmd(kind){const s=SP.st;buzz(8);if(typeof SFX!=="undefined")SFX.tap();
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
  note:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18V5l11-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="17" cy="16" r="3"/></svg>'};
const spArt=(s,cls)=>'<span class="'+cls+'"'+(s&&s.art?' style="background-image:url(\''+esc(s.art)+'\')"':'')+'>'+(s&&s.art?'':SPI.note)+'</span>';
function spPaint(){let el=document.getElementById("mini");const on=SP.demo||(spMode()==="on"&&SP.tok);
  document.body.classList.toggle("has-mini",!!on);if(!on){if(el)el.remove();return}
  if(!el){el=document.createElement("div");el.id="mini";el.className="mini-pl";document.body.appendChild(el);
    el.addEventListener("click",e=>{const b=e.target.closest("[data-sp]");if(b){e.stopPropagation();spCmd(b.dataset.sp);return}spOpen()})}
  const s=SP.st;
  el.innerHTML=spArt(s,"mp-art")+'<span class="mp-t"><b>'+esc(s&&s.title||T("Spotify 没在播放","Nothing playing"))+'</b><small>'+esc(s&&(s.title?s.artist:s.device||"")||"")+'</small></span>'
    +'<button class="mp-b" data-sp="toggle" aria-label="'+T("播放 / 暂停","Play / pause")+'">'+(s&&s.playing?SPI.pause:SPI.play)+'</button>'
    +'<button class="mp-b mp-n" data-sp="next" aria-label="'+T("下一首","Next")+'">'+SPI.next+'</button><i class="mp-bar"></i>';
  el.classList.toggle("playing",!!(s&&s.playing));spTick();if(spSheetOpen())spPaintSheet()}
function spTick(){const s=SP.st,el=document.getElementById("mini");if(!el||!s)return;const p=s.dur?spNow()/s.dur:0;el.style.setProperty("--p",p);
  const f=document.querySelector(".sp-full");if(f){f.style.setProperty("--p",p);const t=f.querySelectorAll(".sp-time span");if(t.length===2){t[0].textContent=spFmt(spNow());t[1].textContent="-"+spFmt(s.dur-spNow())}}}
const spFmt=ms=>{const t=Math.max(0,Math.round(ms/1000));return Math.floor(t/60)+":"+String(t%60).padStart(2,"0")};

/* ---------- the full player (bottom sheet) ---------- */
const spSheetOpen=()=>!!document.querySelector(".sheet.on .sp-full");
function spOpen(){openSheet('<div class="sh-h"><h3>'+T('正在播放','Now playing')+'</h3><button class="mini" data-act="close">'+ICON.x+'</button></div><div class="sp-full"></div>');spPaintSheet()}
function spPaintSheet(){const f=document.querySelector(".sheet.on .sp-full");if(!f)return;const s=SP.st||{};
  f.innerHTML=spArt(s,"sp-art"+(s.playing?" on":""))+'<div class="sp-meta"><b>'+esc(s.title||T("Spotify 没在播放","Nothing playing"))+'</b><span class="muted">'+esc(s.artist||"")+'</span></div>'
    +'<div class="sp-prog"><i></i></div><div class="sp-time n muted"><span></span><span></span></div>'
    +'<div class="sp-ctl"><button class="mp-b" data-sp="prev" aria-label="'+T("上一首","Previous")+'">'+SPI.prev+'</button><button class="mp-b sp-big" data-sp="toggle" aria-label="'+T("播放 / 暂停","Play / pause")+'">'+(s.playing?SPI.pause:SPI.play)+'</button><button class="mp-b" data-sp="next" aria-label="'+T("下一首","Next")+'">'+SPI.next+'</button></div>'
    +'<label class="sp-vol"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M4 9.5h3.2L12 5.5v13l-4.8-4H4z"/></svg><input type="range" min="0" max="100" value="'+(s.vol==null?50:s.vol)+'" aria-label="'+T("音量","Volume")+'"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 9.5h3.2L12 5.5v13l-4.8-4H4z" fill="currentColor" stroke="none"/><path d="M15.5 9a4.5 4.5 0 0 1 0 6M18 6.5a8 8 0 0 1 0 11"/></svg></label>'
    +(s.device?'<p class="muted sp-dev">'+T('在「'+esc(s.device)+'」上播放','Playing on '+esc(s.device))+'</p>':'');
  f.querySelectorAll("[data-sp]").forEach(b=>b.addEventListener("click",()=>spCmd(b.dataset.sp)));
  f.querySelector(".sp-vol input").addEventListener("input",e=>spVol(+e.target.value));spTick()}

/* ---------- Settings › Advanced › Spotify ---------- */
const SP_PASTE='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="8" y="3" width="8" height="4" rx="1.5"/><path d="M16 5h1.5A2.5 2.5 0 0 1 20 7.5v11a2.5 2.5 0 0 1-2.5 2.5h-11A2.5 2.5 0 0 1 4 18.5v-11A2.5 2.5 0 0 1 6.5 5H8"/></svg>';
const COPY_ICON='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="11" height="11" rx="2.5"/><path d="M5 15V6a2 2 0 0 1 2-2h9"/></svg>';
function openMusic(){const mode=spMode(),con=!!(SP.tok&&mode==="on"),cid=spCid();
  const body='<label class="flabel">Client ID<span class="pastef"><input id="spcid" autocomplete="off" spellcheck="false" placeholder="'+T("粘贴 Spotify 开发者后台里的 Client ID","Paste the Client ID from the Spotify developer dashboard")+'" value="'+esc(cid)+'"><button type="button" class="pastebtn" data-sppaste aria-label="'+T("粘贴","Paste")+'">'+SP_PASTE+'</button></span></label>'
    +'<label class="flabel">Redirect URI<span class="pastef"><input readonly value="'+esc(spRedirect())+'"><button type="button" class="pastebtn" data-spcopy aria-label="'+T("复制","Copy")+'">'+COPY_ICON+'</button></span></label>'
    +'<p class="calc-msg">'+T("在 Spotify 开发者后台新建一个 App：Redirect URIs 填上面这个地址，API 只勾 Web API。控制播放需要 Premium。","Create an app in the Spotify developer dashboard with the Redirect URI above and only Web API ticked. Controlling playback needs Premium.")+'</p>'
    +(con?'<p class="wxnow">'+SPI.note+T('已连接 Spotify','Spotify connected')+'</p>':'')
    +'<div class="mode-tabs"><button type="button" data-spd="1" class="'+(mode==="demo"?"active":"")+'"'+(con?' hidden':'')+'>'+T('预览','Preview')+'</button><button type="button" data-spd="0" class="'+(mode!=="demo"&&!con?"active":"")+'"'+(con?' hidden':'')+'>'+T('不显示','Hidden')+'</button></div>';
  const S=p1Sheet("Spotify",body,con?'<button class="btn ghost wide" type="button" data-spx>'+T('断开','Disconnect')+'</button>':'<button class="btn wide" type="button" data-spc>'+T('连接 Spotify','Connect Spotify')+'</button>');
  const inp=S.q("#spcid"),save=()=>{const v=inp.value.replace(/[^A-Za-z0-9]/g,"").slice(0,64);inp.value=v;try{v?localStorage.setItem(SPC_K,v):localStorage.removeItem(SPC_K)}catch(e){}};
  inp.addEventListener("change",save);inp.addEventListener("focus",()=>setTimeout(()=>inp.select(),0));
  S.q("[data-sppaste]").addEventListener("click",async()=>{try{inp.value=await navigator.clipboard.readText();save();buzz(10)}catch(e){inp.focus();toast(T("读不到剪贴板，请长按输入框粘贴","Can't read the clipboard; long-press the box to paste"))}});
  S.q("[data-spcopy]").addEventListener("click",async()=>{try{await navigator.clipboard.writeText(spRedirect());toast(T("已复制","Copied"));buzz(10)}catch(e){toast(T("复制不了，请长按选择","Can't copy; long-press to select"))}});
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
document.addEventListener("visibilitychange",()=>{if(!document.hidden&&SP.poll&&!SP.demo)spPull()});
spLoad();spCallback().finally(spStart);
