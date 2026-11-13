/* ---------- backup: compact text, "PP2z:" + base64(deflate(json)); shared by both pages ---------- */
/* metric columns in a backup row, in this order; new columns are only ever appended */
const MK=["pullups","weight","waist","sleep","sleepH","weightC","hrv","rhr","active","steps","ex","exP","exL"];
/* session keys in S: u = push, l = pull, t = the third training day (added in v1.41a) */
const KIND_KEY={push:"u",pull:"l",third:"t"},KEY_KIND={u:"push",l:"pull",t:"third"};
function pristine(p,doc){if(doc.done||doc.note||doc.date||(doc.xs&&doc.xs.length))return false;return p.ex.every(e=>{const a=doc.sets&&doc.sets[e.id];return !a||(a.length===e.sets&&a.every(x=>!x.d&&+x.v===e.target))})}
function pack(){
  const S={};
  Object.entries(state.sessions).forEach(([sid,doc])=>{const p=BYID[sid];if(!p||!doc||pristine(p,doc))return;
    S[KIND_KEY[p.kind]+p.day]=[doc.done?1:0,doc.date?doc.date.replace(/-/g,"").slice(2):"",doc.note||"",
      (doc.ex||baseEx(sid)||p.ex).map(e=>{const a=doc.sets&&doc.sets[e.id];return a?a.map(x=>x.d?(+x.v||0):-(+x.v||0)-1):0})].concat(doc.xs&&doc.xs.length?[doc.xs]:[])});
  const M=Object.values(state.metrics).filter(m=>m.date).sort((x,y)=>x.date<y.date?-1:1).map(m=>{
    const r=[m.date.replace(/-/g,"").slice(2)].concat(MK.map(k=>m[k]??null));while(r.length>1&&r[r.length-1]==null)r.pop();return r});
  /* 带上高驰授权：换手机恢复进度后不用重新授权 */
  let tk = null;
  try{ tk = JSON.parse(localStorage.getItem("tracktor-coros-token") || "null"); }catch(e){}
  /* extra practice on days without a session: {date: [items]} */
  /* {date: items} or, when the day has a note, {date: [items, note]} */
  const DX={};Object.entries(state.dayx||{}).forEach(([d,doc])=>{if(!doc)return;
    const xs=doc.xs&&doc.xs.some(it=>it.sets.some(x=>x.d))?doc.xs:null, n=(doc.note||"").trim()?doc.note:"";
    if(n)DX[d]=[xs||[],n];else if(xs)DX[d]=xs});
  /* engine-planned sessions: their own exercises and how each felt, keyed like S (added in v1.37a; older files have none) */
  const PE={};Object.entries(state.sessions).forEach(([sid,doc])=>{const p=BYID[sid];if(!p||!doc||!doc.ex)return;const k=KIND_KEY[p.kind]+p.day;if(S[k])PE[k]=[doc.ex,doc.feel||null]});
  return {v:4,s:S,m:M,g:state.settings,d:state.diet,tk,dx:DX,pe:PE};
}
function unpack(j){
  const sessions={},metrics={};const d6=t=>t?"20"+t.slice(0,2)+"-"+t.slice(2,4)+"-"+t.slice(4,6):null;
  const kid=k=>KEY_KIND[k[0]]+"-"+pad(+k.slice(1));
  /* each session's numbers are in the order of the exercises it was done with: its own (pe) if the engine planned it,
     otherwise the fixed programme's day. Never what this phone has planned for that day, which can differ. */
  Object.entries(j.s||{}).forEach(([k,v])=>{const sid=kid(k);const pe0=j.pe&&j.pe[k],ex=pe0?pe0[0]:baseEx(sid);if(!ex)return;
    const doc={sid,done:!!v[0],date:d6(v[1]),note:v[2]||"",sets:{}};
    ex.forEach((e,i)=>{const a=v[3]&&v[3][i];doc.sets[e.id]=Array.isArray(a)?a.map(n=>n<0?{v:-n-1,d:false}:{v:n,d:true}):Array.from({length:e.sets},()=>({v:e.target,d:false}))});
    if(!doc.note)delete doc.note;if(v[4])doc.xs=v[4];
    const pe=j.pe&&j.pe[k];if(pe){doc.ex=pe[0];if(pe[1])doc.feel=pe[1]}
    sessions[sid]=doc});
  (j.m||[]).forEach(r=>{const date=d6(r[0]);const m={date};MK.forEach((k,i)=>{if(r[i+1]!=null)m[k]=r[i+1]});metrics[date]=m});
  /* v4 keeps diet days directly; v3 had a separate ledger {days, coros, weights} */
  let diet=null;
  if((j.v||0)>=4)diet=j.d||{};else if(j.d){diet={};mergeLegacyDiet(metrics,diet,j.d)}
  const dayx=j.dx?Object.fromEntries(Object.entries(j.dx).map(([d,v])=>{
    const noted=Array.isArray(v)&&v.length===2&&typeof v[1]==="string"&&Array.isArray(v[0]);
    const doc={date:d,xs:noted?(v[0].length?v[0]:null):v};if(noted)doc.note=v[1];return [d,doc]})):null;
  return {sessions,metrics,diet,settings:j.g?Object.assign({},GDEF,j.g):null,extras:j.x||null,tk:j.tk||null,dayx};
}
const b64e=u=>{let s="";for(let i=0;i<u.length;i+=8192)s+=String.fromCharCode.apply(null,u.subarray(i,i+8192));return btoa(s)};
const b64d=t=>Uint8Array.from(atob(t),c=>c.charCodeAt(0));
async function encodeBackup(){
  const json=JSON.stringify(pack());
  if(window.CompressionStream){try{const st=new Blob([json]).stream().pipeThrough(new CompressionStream("deflate-raw"));return "PP2z:"+b64e(new Uint8Array(await new Response(st).arrayBuffer()))}catch(e){}}
  return "PP2:"+json;
}
async function decodeBackup(text){
  text=text.trim().replace(/\s+/g,"");
  if(text.startsWith("PP2z:")){const st=new Blob([b64d(text.slice(5))]).stream().pipeThrough(new DecompressionStream("deflate-raw"));return unpack(JSON.parse(await new Response(st).text()))}
  if(text.startsWith("PP2:"))return unpack(JSON.parse(text.slice(4)));
  const j=JSON.parse(text); if(j&&j.app==="pushpull")return {sessions:j.sessions||{},metrics:j.metrics||{}};
  throw new Error("bad");
}
function backupFileName(){
  const d=new Date();
  const stamp=d.getFullYear()+pad(d.getMonth()+1)+pad(d.getDate())+"-"+pad(d.getHours())+pad(d.getMinutes());
  return T("推拉机进度","track-TOR-progress")+"-"+stamp+".txt";
}

/* ---------- 每 5 天自动提醒备份进度（防浏览器清缓存丢数据） ---------- */
const BK_REMIND_K = LS + "-lastbackup";
function lastBackupTs(){ try{ return parseInt(localStorage.getItem(BK_REMIND_K)||"0",10)||0; }catch(e){ return 0; } }
function markBackedUp(){ try{ localStorage.setItem(BK_REMIND_K, String(Date.now())); }catch(e){} }
function backupRemindDue(){
  const t = lastBackupTs();
  if(!t){ markBackedUp(); return false; }   /* 第一次打开：从现在起算 5 天，不一上来就提醒 */
  const days = (Date.now() - t) / 864e5;
  return days >= 5;
}
