/* ---------- diet: intake, burn, the gap, the intake chart and the daily food logs ---------- */

/* used only until the user fills in their own profile or weight */
const AGE_DEFAULT = 30, W_DEFAULT = 65, TEF = 0.09, TEF_DEFAULT = 1850;
/* watch calories (COROS active calories, resting metabolism not included): everyday movement counts in full;
   logged workouts at 0.7 (heart-rate estimates run high); low-intensity ones (walks, housework and other custom
   activities, yoga) at 0.5, since a heart rate barely above resting is where the estimate is worst; rides
   measured by a power meter in full (the work is measured, not estimated from heart rate). A day whose workouts are unknown counts at 0.7 throughout. */
const EX_FACTOR = 0.7, LOW_FACTOR = 0.5, POWER_FACTOR = 1;
/* everyday movement (watch calories outside logged workouts) is capped by the day's steps: about 0.00055 kcal per kg
   per step, times 1.5, plus 120 kcal for standing and chores. A watch that reads a raised heart rate all day (a loose
   strap, heat, a long day) can report several times what the steps allow; normal days stay under the cap. */
const STEP_KCAL = 0.00055, STEP_MARGIN = 1.5, STEP_EXTRA = 120;
function everydayCap(date){
  const m = state.metrics[date], st = m ? numVal(m.steps) : null;
  if(st === null || st <= 0) return Infinity;
  const kg = weightAtDate(date) || W_DEFAULT;
  return st * kg * STEP_KCAL * STEP_MARGIN + STEP_EXTRA;
}
/* Settings › Charts & sync can count the watch in full instead (settings.watchFull): every kcal it reports, no
   discounts and no step cap. Only the estimates change; the synced numbers stay as they are. */
function watchBurn(date, act){
  if(act === null) return null;
  if(state.settings && state.settings.watchFull) return act;
  const m = state.metrics[date];
  if(!m || m.ex == null) return act * EX_FACTOR;
  const ex = Math.min(+m.ex || 0, act), exP = Math.min(+m.exP || 0, ex), exL = Math.min(+m.exL || 0, ex - exP);
  return Math.min(act - ex, everydayCap(date)) + (ex - exP - exL) * EX_FACTOR + exL * LOW_FACTOR + exP * POWER_FACTOR;
}

function numVal(v){ return (v===null||v===undefined||v===""||isNaN(+v)) ? null : +v; }
function f1Dec(v){ return v===null ? "–" : (Math.round(v*10)/10).toFixed(1).replace("-","−"); }
function f0Dec(v){ return v===null ? "–" : String(Math.round(v)).replace("-","−"); }
function escHtml(s){ return String(s??"").replace(/[&<>"]/g, c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c])); }
function dotDateStr(s){ return String(s||"").replace(/-/g,"."); }
function ymdAdd(s,n){ const [y,m,d]=s.split("-").map(Number); const t=new Date(y,m-1,d); t.setDate(t.getDate()+n); return t.getFullYear()+"-"+pad(t.getMonth()+1)+"-"+pad(t.getDate()); }

function dietTotals(day){
  const t = { p:0, f:0, c:0, kcal:0, veg:0 };
  for(const it of (day.items||[])){
    t.p += numVal(it.p)||0;
    t.f += numVal(it.f)||0;
    t.c += numVal(it.c)||0;
    t.kcal += numVal(it.kcal)||0;
    t.veg += numVal(it.veg)||0;
  }
  return t;
}

/* protein: grams eaten that day (null when nothing with protein was logged), and the band for building
   muscle: from 1.6 g per kg of body weight (enough) to 2.2 g (where studies stop finding more muscle).
   Above it is no problem: while cutting, more protein keeps you full and costs more to digest */
const PROTEIN_PER_KG = 1.6, PROTEIN_MAX_PER_KG = 2.2;
function proteinOf(date){
  const d = state.diet[date];
  if(!d || !d.items || !d.items.length) return null;
  return d.items.some(it=>numVal(it.p)!==null) ? dietTotals(d).p : null;
}
/* recommended daily protein for building muscle while losing fat: 2.2 g per kg of lean mass (lean mass from the
   Deurenberg body-fat estimate, which uses sex, age, height and weight), kept between 1.6 and 2.2 g per kg of body
   weight; 10% more from 60 on. settings.pg is the user's own target and wins when set. */
function proteinRec(date){
  const p = profile(), w = weightAtDate(date), h = (p.h || H_FALLBACK) / 100, a = ageAtDate(date), sx = p.sex==="m" ? 1 : p.sex==="f" ? 0 : 0.5;
  const bf = Math.min(45, Math.max(8, 1.2 * w / (h * h) + 0.23 * a - 10.8 * sx - 5.4)) / 100;
  let g = Math.max(PROTEIN_PER_KG * w, 2.2 * w * (1 - bf));
  if(a >= 60) g *= 1.1;
  return Math.round(Math.min(g, PROTEIN_MAX_PER_KG * w));
}
function proteinNeed(date){ const c = +profile().pg; return c > 0 ? c : proteinRec(date); }
function proteinCap(date){ return PROTEIN_MAX_PER_KG * weightAtDate(date); }
function intakeOf(date){
  const d = state.diet[date];
  if(!d) return null;
  if(numVal(d.intakeOverride) !== null) return numVal(d.intakeOverride);
  return d.items && d.items.length ? dietTotals(d).kcal : null;
}

function profile(){ return state.settings || {}; }
function ageAtDate(date){
  const b = profile().b;
  /* birth month only (YYYY-MM); older saves may carry a full date, whose day is ignored */
  if(!/^\d{4}-\d{2}/.test(b||"")) return AGE_DEFAULT;
  const [by,bm] = b.split("-").map(Number), [y,m] = date.split("-").map(Number);
  return y - by - (m<bm ? 1 : 0);
}

/* the day's own weight (manual beats COROS), else the average of the 7 days up to it,
   else the latest one before it, else the earliest one on record */
function weightAtDate(date){
  const m = state.metrics[date];
  if(m && (m.weight!=null || m.weightC!=null)) return numVal(m.weight!=null ? m.weight : m.weightC);
  const pts = wtMerged();
  const win = pts.filter(p=>p.date<=date && p.date>=ymdAdd(date,-6));
  if(win.length) return win.reduce((a,p)=>a+p.y, 0) / win.length;
  const before = pts.filter(p=>p.date<=date);
  if(before.length) return before[before.length-1].y;
  return pts.length ? pts[0].y : W_DEFAULT;
}
function activeOf(date){ const m = state.metrics[date]; return m ? numVal(m.active) : null; }

/* Mifflin-St Jeor: +5 for men, -161 for women, the midpoint when sex is not set */
function bmrOfDate(date){
  const p = profile(), h = p.h ? p.h : H_FALLBACK, sx = p.sex==="m" ? 5 : p.sex==="f" ? -161 : -78;
  return 10 * weightAtDate(date) + 6.25 * h - 5 * ageAtDate(date) + sx;
}

/* digestion burn: protein about 25% of its calories, carbs 8%, fat 2%; days without macros use 9% of intake */
const TEF_P = 0.25, TEF_C = 0.08, TEF_F = 0.02;
function tefFor(items, intake){
  let p=0, c=0, f=0, any=false;
  for(const it of (items||[])){ const a=numVal(it.p), b=numVal(it.c), e=numVal(it.f); if(a!==null||b!==null||e!==null) any=true; p+=a||0; c+=b||0; f+=e||0; }
  if(any && p+c+f > 0) return p*4*TEF_P + c*4*TEF_C + f*9*TEF_F;
  return TEF * (intake===null || !intake ? TEF_DEFAULT : intake);
}
function burnOfDate(date){
  const d = state.diet[date];
  if(d && numVal(d.expendOverride) !== null) return numVal(d.expendOverride);
  const act = activeOf(date);
  if(act === null) return null;
  const intake = intakeOf(date);
  return bmrOfDate(date) + watchBurn(date, act) + tefFor(intake===null ? null : (d && d.items), intake);
}

function dietGapOf(d){
  const a = intakeOf(d), b = burnOfDate(d);
  return (a!==null && b!==null) ? b - a : null;
}

function gapAllTime(){
  const ks = Object.keys(state.diet).sort(); if(!ks.length) return null;
  let s = 0, c = 0;
  const last = ymdAdd(today(), -1);                       /* today isn't over yet */
  for(let d = ks[0]; d <= last; d = ymdAdd(d, 1)){ const g = dietGapOf(d); if(g !== null){ s += g; c++; } }
  return c ? { s, c } : null;
}
/* cross-check against the scale: the 7-day average weight on a day (null when no weight in those 7 days) */
function wtMA7(date){ const w = wtMerged().filter(p=>p.date<=date && p.date>=ymdAdd(date,-6)); return w.length ? w.reduce((a,p)=>a+p.y,0)/w.length : null; }
/* how the fat estimate compares with what the 7-day average weight did over the same days: within 15% of it →
   "about", more than 15% above → "aggressive estimate", more than 15% below → "conservative estimate". Only for
   windows of 14 days or more; over a few days water and food in the gut swamp the fat. */
const XCHECK_TOL = 0.15, XCHECK_MIN_DAYS = 14;
function fatWord(estKg, from, to){
  const days = dnum(to) - dnum(from) + 1, a = wtMA7(ymdAdd(from, -1)), b = wtMA7(to);
  if(days < XCHECK_MIN_DAYS || a === null || b === null) return "about";
  const seen = a - b;                                   /* kg lost on the scale (negative = gained) */
  if(Math.abs(estKg - seen) <= XCHECK_TOL * Math.abs(seen)) return "about";
  return estKg > seen ? "high" : "low";
}



const CALC_WARN_DIFF = 100;
/* the food log form for one day (a pop-up) */
function openDietEntryModal(initDate){
  const m = document.createElement("div");
  m.className = "mask";
  const closeIt = ()=>{ m.remove(); };

  const TOTAL_NAME = () => T("当日合计（手动录入）","Daily total (manual)");
  const emptyTotal = () => ({ kcal:"", p:"", f:"", c:"", veg:"" });
  let curDate = initDate || today();
  let moreOpen = false;
  let mode, total, formState;

  function getDayState(dt){
    const d = state.diet[dt] || { items:[] };
    const mt = state.metrics[dt] || {};
    return {
      items: JSON.parse(JSON.stringify(d.items && d.items.length ? d.items : [])),
      note: d.note || "",
      expendOverride: numVal(d.expendOverride),
      active: numVal(mt.active),
      kg: numVal(mt.weight)          /* only a manual weight; a COROS one shows as the placeholder */
    };
  }

  function dayTotal(items){
    if(!items.length) return emptyTotal();
    const t = dietTotals({ items });
    const show = v => v ? +v.toFixed(1) : "";
    return { kcal: t.kcal ? Math.round(t.kcal) : "", p: show(t.p), f: show(t.f), c: show(t.c), veg: show(t.veg) };
  }

  /* a day logged item by item opens on its details; everything else opens on the five totals */
  function loadDay(dt){
    formState = getDayState(dt);
    total = dayTotal(formState.items);
    const one = formState.items.length === 1 && String(formState.items[0].name||"").includes("当日合计");
    mode = (formState.items.length && !one) ? "items" : "total";
  }
  loadDay(curDate);

  function burnPreviewHtml(){
    const bmr = Math.round(bmrOfDate(curDate));
    const intake = mode === "total" ? numVal(total.kcal) : dietTotals({ items: formState.items }).kcal;
    const estBurn = formState.expendOverride !== null
      ? Math.round(formState.expendOverride)
      : (formState.active !== null ? Math.round(bmr + watchBurn(curDate, formState.active) + tefFor(mode === "total" ? [total] : formState.items, intake)) : null);
    return `${T("基代","BMR")} <b>${bmr}</b> kcal · ${T("预计总消耗","Est. total burn")}：<b>${estBurn!==null ? estBurn+" kcal" : T("待输入活动消耗或总消耗","enter activity or total burn")}</b>`;
  }

  function renderModal(){
    const t = dietTotals({ items: formState.items });
    const hasDay = !!state.diet[curDate];
    const numInp = (id, label, val, step) => `<label class="flabel">${label}<input type="number" inputmode="decimal" step="${step}" id="${id}" value="${val??""}"></label>`;

    m.innerHTML = `<div class="sheet" role="dialog" aria-label="${T("记录饮食","Log food")}">
      <h3>
        <span>${T("记录饮食","Log food")}</span>
        <button class="iconbtn" type="button" data-close aria-label="${T("关闭","Close")}" title="${T("关闭","Close")}">${CLOSE_ICON}</button>
      </h3>
      <div class="form-body">
        <label class="flabel">${T("日期","Date")}
          <input type="date" id="fdDate" value="${curDate}">
        </label>

        <div class="mode-tabs" role="tablist">
          <button type="button" class="${mode==="total" ? "active" : ""}" data-fmode="total">${T("总热量","Total")}</button>
          <button type="button" class="${mode==="items" ? "active" : ""}" data-fmode="items">📋 ${T("当日明细","Day details")}</button>
        </div>

        ${mode==="total" ? `
          <div class="burn-box">
            <div class="kcal-row">
              ${numInp("tdKcal", T("总热量 kcal","Total kcal"), total.kcal, 1)}
              <button class="calc-btn" type="button" id="tdCalc" aria-label="${T("按蛋白、脂肪、碳水估算总热量","Estimate calories from protein, fat and carbs")}" title="${T("按蛋白、脂肪、碳水估算总热量","Estimate calories from protein, fat and carbs")}"${macroKcal(total)===null ? " disabled" : ""}>${CALC_ICON}</button>
            </div>
            <p class="calc-msg" id="tdCalcMsg" aria-live="polite" hidden></p>
            <div class="total-grid">
              ${numInp("tdP", T("蛋白 g","Protein g"), total.p, 0.1)}
              ${numInp("tdF", T("脂肪 g","Fat g"), total.f, 0.1)}
              ${numInp("tdC", T("碳水 g","Carbs g"), total.c, 0.1)}
              ${numInp("tdVeg", T("蔬菜 g","Veg g"), total.veg, 1)}
            </div>
          </div>
        ` : `
          <div class="burn-box">
            <h4>
              <span>${T("合计","Total")} <b class="num">${f0Dec(t.kcal)}</b> kcal</span>
              <button class="btn ghost" type="button" id="daddItemRowBtn" style="padding:3px 8px;font-size:12px">+ ${T("加一行","Add row")}</button>
            </h4>
            <div class="item-list" id="ditemListBox">
              ${(formState.items.length ? formState.items : [{name:"",kcal:"",p:"",f:"",c:"",veg:""}]).map((it,idx)=>`
                <div class="item-row" data-idx="${idx}">
                  <div class="iname-wrap">
                    <input class="iname" type="text" placeholder="${T("食物","Food")}" aria-label="${T("食物","Food")}" value="${escHtml(it.name||"")}" data-f="name">
                    <button type="button" class="del-btn" data-ddel="${idx}" aria-label="${T("删除这一行","Delete row")}" title="${T("删除这一行","Delete row")}">✕</button>
                  </div>
                  ${[["kcal",T("热量","kcal"),1],["p",T("蛋白","Prot."),0.1],["f",T("脂肪","Fat"),0.1],["c",T("碳水","Carbs"),0.1],["veg",T("蔬菜","Veg"),1]].map(([k,lab,st])=>`<label class="ifield">${lab}<input type="number" inputmode="decimal" step="${st}" value="${it[k]??""}" data-f="${k}"></label>`).join("")}
                </div>
              `).join("")}
            </div>
          </div>
        `}

        <details class="fd-more" id="fdMore"${moreOpen ? " open" : ""}>
          <summary>${T("体重、消耗和备注（选填）","Weight, burn and note (optional)")}</summary>
          <div class="fgrid">
            <label class="flabel">${T("当日体重 kg","Weight kg")}
              <input type="number" inputmode="decimal" step="0.1" id="fdWeight" placeholder="${T("默认","Default")} ${weightAtDate(curDate).toFixed(1)}" value="${formState.kg!==null ? formState.kg : ""}">
            </label>
            <label class="flabel">${T("手表活动消耗 kcal","Watch active kcal")}
              <input type="number" inputmode="decimal" step="1" id="fdActive" value="${formState.active!==null ? formState.active : ""}">
            </label>
            <label class="flabel" style="grid-column:1 / -1">${T("或直接填当日总消耗 kcal","Or enter total burn kcal")}
              <input type="number" inputmode="decimal" step="1" id="fdExpendOverride" placeholder="${T("留空自动计算","Blank = auto")}" value="${formState.expendOverride!==null ? formState.expendOverride : ""}">
            </label>
          </div>
          <div class="burn-preview" id="dburnPreview" style="margin-bottom:8px">${burnPreviewHtml()}</div>
          <label class="flabel">${T("备注","Note")}
            <input type="text" id="fdNote" placeholder="${T("例如：推拉训练 1.5 小时","e.g. push/pull session 1.5 h")}" value="${escHtml(formState.note)}">
          </label>
        </details>
      </div>
      <div class="row" style="justify-content:space-between">
        ${hasDay ? `<button class="btn ghost" type="button" id="ddelDayBtn" style="color:var(--push);border-color:var(--push);padding:8px 12px">${T("删除当日","Delete day")}</button>` : "<span></span>"}
        <button class="btn recsave" type="button" data-dsave aria-label="${T("保存并关闭","Save and close")}" title="${T("保存并关闭","Save and close")}">${SAVE_ICON}</button>
      </div>
    </div>`;

    bindModalEvents();
  }

  /* 热量留空时按 4/9/4 由营养素算 */
  function normalizeItem(raw){
    const p = numVal(raw.p)||0, f = numVal(raw.f)||0, c = numVal(raw.c)||0, veg = numVal(raw.veg)||0;
    let kcal = numVal(raw.kcal);
    if(kcal === null && (p || f || c)) kcal = Math.round(p*4 + f*9 + c*4);
    const name = String(raw.name||"").trim();
    if(!name && kcal === null && !veg) return null;
    return { name: name || (kcal!==null ? TOTAL_NAME() : T("未命名食物","Unnamed food")), p, f, c, kcal: kcal||0, veg };
  }

  function syncFormFromDOM(){
    const wEl = m.querySelector("#fdWeight");
    if(wEl) formState.kg = numVal(wEl.value);
    const actEl = m.querySelector("#fdActive");
    if(actEl) formState.active = numVal(actEl.value);
    const expEl = m.querySelector("#fdExpendOverride");
    if(expEl) formState.expendOverride = numVal(expEl.value);
    const noteEl = m.querySelector("#fdNote");
    if(noteEl) formState.note = noteEl.value.trim();
    const moreEl = m.querySelector("#fdMore");
    if(moreEl) moreOpen = moreEl.open;

    if(mode === "total"){
      const val = id => m.querySelector(id)?.value ?? "";
      total = { kcal:val("#tdKcal"), p:val("#tdP"), f:val("#tdF"), c:val("#tdC"), veg:val("#tdVeg") };
    } else {
      const field = (r,k) => r.querySelector(`[data-f="${k}"]`)?.value ?? "";
      formState.items = Array.from(m.querySelectorAll(".item-row")).map(r=>normalizeItem({
        name:field(r,"name"), kcal:field(r,"kcal"), p:field(r,"p"), f:field(r,"f"), c:field(r,"c"), veg:field(r,"veg")
      })).filter(Boolean);
    }
  }

  function commitDay(){
    if(formState.items.length || formState.expendOverride !== null || formState.note){
      const dayDoc = { items: formState.items };
      if(formState.note) dayDoc.note = formState.note;
      if(formState.expendOverride !== null) dayDoc.expendOverride = formState.expendOverride;
      state.diet[curDate] = dayDoc;
    } else {
      delete state.diet[curDate];
    }
    if(formState.active !== null || formState.kg !== null) saveMetric(curDate, { active: formState.active, weight: formState.kg });
    lsSave();
    renderAll();
  }

  /* 蛋白、脂肪、碳水都填了才有估算值，按 4/9/4 算；0 也算填了 */
  function macroKcal(v){
    const p = numVal(v.p), f = numVal(v.f), c = numVal(v.c);
    return (p === null || f === null || c === null) ? null : Math.round(p*4 + f*9 + c*4);
  }

  function sameTotal(a,b){ return ["kcal","p","f","c","veg"].every(k=>(numVal(a[k])||0)===(numVal(b[k])||0)); }

  /* 总热量视图写回当天：没改就保留原有明细，改了才换成一条合计。返回 false 表示需要留在面板里 */
  function applyTotal(){
    const saved = dayTotal(formState.items);
    if(sameTotal(total, saved)) return true;
    if(numVal(total.kcal) === null){
      toast(T("先填总热量","Enter total calories first"));
      m.querySelector("#tdKcal").focus();
      return false;
    }
    if(formState.items.length > 1 && !confirm(T("保存后会用这个总数替换当天的 "+formState.items.length+" 项明细，继续吗？","Saving replaces this day's "+formState.items.length+" items with this total. Continue?"))) return false;
    formState.items = [{ name: TOTAL_NAME(), kcal: numVal(total.kcal), p: numVal(total.p)||0, f: numVal(total.f)||0, c: numVal(total.c)||0, veg: numVal(total.veg)||0 }];
    return true;
  }

  function bindModalEvents(){
    m.querySelector("[data-close]").addEventListener("click", closeIt);
    m.querySelector("#fdDate").addEventListener("change", e=>{
      syncFormFromDOM();
      curDate = e.target.value || today();
      loadDay(curDate);
      renderModal();
    });
    m.querySelectorAll("[data-fmode]").forEach(b=>{
      b.addEventListener("click", ()=>{
        syncFormFromDOM();
        if(mode === "total" && b.dataset.fmode === "items" && !applyTotal()) return;
        if(mode === "items" && b.dataset.fmode === "total") total = dayTotal(formState.items);
        mode = b.dataset.fmode;
        renderModal();
      });
    });
    const calcBtn = m.querySelector("#tdCalc");
    if(calcBtn){
      const calcMsg = m.querySelector("#tdCalcMsg");
      m.querySelectorAll("#tdKcal,#tdP,#tdF,#tdC").forEach(inp=>{
        inp.addEventListener("input", ()=>{
          syncFormFromDOM();
          calcBtn.disabled = macroKcal(total) === null;
          calcMsg.hidden = true;
        });
      });
      /* 总热量留空才填入估算值；已有数字不覆盖，只显示差额（已填 − 估算） */
      calcBtn.addEventListener("click", ()=>{
        syncFormFromDOM();
        const est = macroKcal(total), entered = numVal(total.kcal);
        if(entered === null){
          m.querySelector("#tdKcal").value = est;
          syncFormFromDOM();
          m.querySelector("#dburnPreview").innerHTML = burnPreviewHtml();
          return;
        }
        const diff = Math.round(entered - est);
        const signed = diff > 0 ? "+" + diff : String(diff);
        const big = Math.abs(diff) > CALC_WARN_DIFF;
        calcMsg.textContent = T("估算 "+est+"，差额 "+signed, "Estimate "+est+", difference "+signed)
          + (big ? T("，请检查有无酒精/酱料等卡路里估算", ". Check for calories from alcohol, sauces, etc.") : "");
        calcMsg.classList.toggle("warn", big);
        calcMsg.hidden = false;
      });
    }
    const addRowBtn = m.querySelector("#daddItemRowBtn");
    if(addRowBtn){
      addRowBtn.addEventListener("click", ()=>{
        syncFormFromDOM();
        formState.items.push({ name:"", kcal:"", p:"", f:"", c:"", veg:"" });
        renderModal();
      });
    }
    m.querySelectorAll("[data-ddel]").forEach(b=>{
      b.addEventListener("click", ()=>{
        syncFormFromDOM();
        formState.items.splice(+b.dataset.ddel, 1);
        renderModal();
      });
    });
    m.querySelectorAll("#fdWeight,#fdActive,#fdExpendOverride").forEach(inp=>{
      inp.addEventListener("input", ()=>{
        syncFormFromDOM();
        m.querySelector("#dburnPreview").innerHTML = burnPreviewHtml();
      });
    });
    const delBtn = m.querySelector("#ddelDayBtn");
    if(delBtn){
      delBtn.addEventListener("click", ()=>{
        if(!confirm(T("删除 "+curDate+" 的全部饮食记录？","Delete all food logs for "+curDate+"?"))) return;
        delete state.diet[curDate];
        lsSave();
        renderAll();
        closeIt();
      });
    }
    m.querySelector("[data-dsave]").addEventListener("click", ()=>{
      syncFormFromDOM();
      if(mode === "total" && !applyTotal()) return;
      commitDay();
      toast(T("饮食记录已保存","Diet log saved"));
      closeIt();
    });
  }

  document.body.appendChild(m);
  renderModal();
  return m;
}



