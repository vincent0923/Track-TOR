/* 博G · frosted swipe stack: one way to move through cards everywhere (training days, calendar months and weeks,
   food records five at a time). While a card is dragged sideways, the card that way lies under it as frosted glass;
   let go past the threshold and the top card flies off while the one below clears in 0.3 s. With nothing more that
   way, the card stretches like rubber and springs back. Finger to the right goes back in time, to the left forward;
   a stack that just cycles (the training days) treats both the same.
   fsWrap(id, cardHtml, peeks) gives the markup (peeks: 0–3 cards showing behind, stepped right and down);
   fsBind(id, {get(dir) → html|null, commit(dir), render() → fsWrap(...), peekDir}) makes it live after it's in the page. */
const FS={};
function fsWrap(id,cardHtml,peeks){peeks=Math.max(0,Math.min(3,peeks|0));
  return '<div class="fstack" data-fs="'+id+'" style="--n:'+peeks+'">'+cardHtml
    +(peeks?'<button class="fs-peek" data-act="fsnext" data-fs="'+id+'" aria-label="'+T('下一张','Next card')+'">'+Array.from({length:peeks},(_,j)=>'<i style="--i:'+(peeks-j)+'"></i>').join("")+'</button>':'')+'</div>'}
/* a sideways swipe is not a tap: swallow the click that follows it */
function fsEatClick(){const stop=e=>{e.stopPropagation();e.preventDefault()};addEventListener("click",stop,true);setTimeout(()=>removeEventListener("click",stop,true),400)}
function fsHost(id){return document.querySelector('.fstack[data-fs="'+id+'"]')}
function fsUnder(host,html){const t=document.createElement("div");t.innerHTML=html;const u=t.firstElementChild;u.classList.add("fs-under");u.setAttribute("inert","");u.setAttribute("aria-hidden","true");
  host.insertBefore(u,host.firstElementChild.nextSibling);return u}
function fsBind(id,o){FS[id]=o;const host=fsHost(id);if(!host)return;const top=host.firstElementChild;top.classList.add("fs-top");
  let x0=null,y0=0,dx=0,lock=null,under=null,udir=0;
  const drop=()=>{if(under){const u=under;u.classList.remove("clear");setTimeout(()=>u.remove(),300)}under=null;udir=0};
  top.addEventListener("touchstart",e=>{host.classList.add("fs-touch");x0=e.touches[0].clientX;y0=e.touches[0].clientY;dx=0;lock=null;top.style.transition="none"},{passive:true});
  top.addEventListener("touchmove",e=>{if(x0==null)return;const mx=e.touches[0].clientX-x0,my=e.touches[0].clientY-y0;
    if(lock==null&&(Math.abs(mx)>8||Math.abs(my)>8))lock=Math.abs(mx)>Math.abs(my)?"x":"y";if(lock!=="x")return;
    e.preventDefault();dx=mx;const dir=dx<0?-1:1;
    if(dir!==udir){drop();const h=o.get(dir);if(h){under=fsUnder(host,h);udir=dir}}
    const eff=under?dx:dx*.22;top.style.transform="translateX("+eff+"px) rotate("+eff/25+"deg)"},{passive:false});
  top.addEventListener("touchcancel",()=>host.classList.remove("fs-touch"));
  top.addEventListener("touchend",()=>{host.classList.remove("fs-touch");if(x0==null)return;x0=null;top.style.transition="";if(lock!=="x")return;fsEatClick();
    if(under&&Math.abs(dx)>70)fsFly(id,dx<0?-1:1,top,under);else{top.style.transform="";drop()}})}
function fsFly(id,dir,top,under){const o=FS[id];if(typeof SFX!=="undefined")SFX.tap();if(typeof buzz==="function")buzz(10);
  top.classList.add("fs-fly");top.style.transform="translateX("+dir*120+"%) rotate("+dir*14+"deg)";
  requestAnimationFrame(()=>under.classList.add("clear"));
  dispatchEvent(new Event("fs-swipe"));
  setTimeout(()=>{o.commit(dir);fsRender(id)},320)}
/* the same move without a finger (tapping the edges below, or a button) */
function fsGo(id,dir){const o=FS[id],host=fsHost(id);if(!o||!host)return false;const h=o.get(dir);if(!h)return false;
  fsFly(id,dir,host.firstElementChild,fsUnder(host,h));return true}
function fsRender(id){const o=FS[id],host=fsHost(id);if(!o||!host)return;const t=document.createElement("div");t.innerHTML=o.render();host.replaceWith(t.firstElementChild);fsBind(id,o)}
/* jump straight back (to today, to the latest): redraw, and the new card settles in */
function fsReset(id){fsRender(id);const c=document.querySelector('.fstack[data-fs="'+id+'"] .fs-top');if(typeof SFX!=="undefined")SFX.tap();
  if(c){c.classList.add("fs-in");requestAnimationFrame(()=>requestAnimationFrame(()=>c.classList.remove("fs-in")))}}
