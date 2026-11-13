/* 推拉机 · 繁體中文: the interface is written in Simplified Chinese; with tracktor-lang = "zht" every Chinese
   text on the page is shown in Traditional characters (Taiwan forms). A character map covers what the app uses
   (generated with OpenCC s2tw), plus a few words where one character maps differently. Loaded before js/core.js. */
let HANT=(()=>{try{return localStorage.getItem("tracktor-lang")==="zht"}catch(e){return false}})();
const HANT_MAP=(()=>{const s="与與东東丢丟两兩个個丰豐为為举舉么麼乌烏乐樂习習云雲亚亞从從优優会會伦倫体體余餘兰蘭关關养養内內册冊写寫准準凉涼减減几幾划劃刚剛创創删刪别別剑劍动動势勢区區华華单單卤滷卧臥厦廈发發变變号號后後吗嗎周週团團园園围圍国國图圖圆圓场場坚堅墙牆备備复復够夠头頭实實审審对對导導将將尔爾层層币幣带帶并並广廣庆慶开開弹彈强強当當录錄态態总總悬懸户戶扰擾报報择擇挥揮换換据據摄攝撑撐数數断斷无無时時显顯暂暫机機权權杠槓条條来來松鬆标標栋棟档檔桥橋检檢楼樓欢歡欧歐气氣汇匯汤湯没沒注註泽澤测測浏瀏温溫湾灣炖燉点點烧燒热熱状狀猪豬现現盐鹽盖蓋着著码碼础礎确確离離种種积積称稱稳穩笋筍笔筆类類红紅约約级級纪紀纯純纽紐线線练練组組细細经經结結给給络絡绝絕统統继繼续續绿綠缓緩编編网網罗羅脐臍脑腦脚腳腾騰苏蘇苹蘋获獲萝蘿营營葱蔥虾蝦观觀视視览覽觉覺计計认認让讓训訓议議讯訊记記许許设設访訪评評识識试試话話询詢该該语語误誤说說请請读讀调調谢謝败敗账賬质質贴貼贵貴费費资資转轉轮輪轻輕载載辑輯输輸边邊达達过過运運还還这這进進远遠连連选選酱醬里裡钟鐘钻鑽链鏈销銷错錯锦錦镇鎮门門闭閉问問间間阳陽阴陰陆陸随隨难難雾霧静靜韩韓页頁顶頂项項顿頓预預颈頸频頻题題额額饭飯饮飲饺餃饼餅馒饅马馬驰馳骑騎髋髖鱼魚鲁魯鸡雞鸭鴨麦麥黄黃齐齊龙龍",m={};for(let i=0;i<s.length;i+=2)m[s[i]]=s[i+1];return m})();
const HANT_WORDS={"手表":"手錶","重复":"重複","划船":"划船","卡路里":"卡路里","表格":"表格"};
function s2t(s){if(s==null)return s;s=String(s);if(!/[\u4e00-\u9fff]/.test(s))return s;let o="";
  for(let i=0;i<s.length;){let hit=0;for(const L of [3,2]){const w=s.substr(i,L);if(w.length===L&&HANT_WORDS[w]){o+=HANT_WORDS[w];i+=L;hit=1;break}}
    if(!hit){const c=s[i];o+=HANT_MAP[c]||c;i++}}
  return o}
/* switched on at load, or later from Settings › Language without reloading; switched off, it just stops converting
   (the page is then redrawn from the Simplified source) */
let hantObs=null;
function hantOn(){document.documentElement.lang="zh-Hant";
  /* everything that reaches the page: text, labels, placeholders */
  const skip=n=>{const e=n.nodeType===1?n:n.parentElement;return !!(e&&e.closest("[translate=no]"))};
  const conv=n=>{if(!HANT||skip(n))return;if(n.nodeType===3){const v=s2t(n.nodeValue);if(v!==n.nodeValue)n.nodeValue=v;return}
    if(n.nodeType!==1)return;for(const a of ["placeholder","aria-label","title"]){const v=n.getAttribute&&n.getAttribute(a);if(v){const t=s2t(v);if(t!==v)n.setAttribute(a,t)}}
    const w=document.createTreeWalker(n,NodeFilter.SHOW_TEXT|NodeFilter.SHOW_ELEMENT);let x;while((x=w.nextNode())){if(skip(x))continue;if(x.nodeType===3)conv(x);else for(const a of ["placeholder","aria-label","title"]){const v=x.getAttribute(a);if(v){const t=s2t(v);if(t!==v)x.setAttribute(a,t)}}}};
  const start=()=>{conv(document.body);document.title=s2t(document.title);if(hantObs)return;
    hantObs=new MutationObserver(ms=>ms.forEach(m=>{if(m.type==="characterData")conv(m.target);else if(m.type==="attributes")conv(m.target);else m.addedNodes.forEach(conv)}));
    hantObs.observe(document.body,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:["placeholder","aria-label","title"]})};
  if(document.body)start();else document.addEventListener("DOMContentLoaded",start)}
/* the browser's own dialogs */
for(const k of ["alert","confirm","prompt"]){const f=window[k].bind(window);window[k]=(msg,...r)=>f(HANT?s2t(msg):msg,...r)}
if(HANT)hantOn();
