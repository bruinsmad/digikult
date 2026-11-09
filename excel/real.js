/* digikult — Excel missions done in the real Excel.
   The student downloads a starter file and works in Excel; the page gives the steps, checks the numbers
   the student reads off, and at the end checks the saved .xlsx itself (formulas, functions, results).
   The page defines MISSION = {
     key, title, file (starter .xlsx), sheet: { …XL.grid options for the preview… },
     chapters: [{ title, refresher, story, learn, steps: [html], asks: [{ q, cell | text: [..], traps: { answer: msg } }],
                  goals: [{ label, range, ref, fn }], hints, success, select, upload }],
     ending: { title, text, rank(min, hints) }
   } */
(function () {
  "use strict";
  const M = window.MISSION, CH = M.chapters, KEY = M.key;
  const $ = id => document.getElementById(id);
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const NCH = CH.filter(c => !c.refresher && !c.bonus).length;
  /* bonus chapters come after the last regular one, for students who finish early; they don't count in the progress */
  const LAST_MAIN = CH.map((c, i) => c.bonus ? -1 : i).filter(i => i >= 0).pop(), FIRST_BONUS = CH.findIndex(c => c.bonus);
  const NBONUS = CH.filter(c => c.bonus).length;
  const chapNo = i => CH.slice(0, i + 1).filter(c => !c.refresher && !c.bonus).length;
  const bonusNo = i => CH.slice(0, i + 1).filter(c => c.bonus).length;
  const label = i => CH[i].refresher ? "Kezdés" : CH[i].bonus ? `Bónusz ${bonusNo(i)}` : chapNo(i) + ". fejezet";

  let state = { solved: [], current: 0, start: Date.now(), end: null, hints: {}, answers: {}, student: "" };
  try { const s = JSON.parse(localStorage.getItem(KEY)); if (s && Array.isArray(s.solved)) state = Object.assign(state, s); } catch (e) {}
  state.solved = state.solved.filter(i => i >= 0 && i < CH.length && !CH[i].bonus);
  state.bonus = (state.bonus || []).filter(i => i >= 0 && i < CH.length && CH[i].bonus);
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) {} };
  const isDone = i => CH[i].bonus ? state.bonus.includes(i) : state.solved.includes(i);
  const isUnlocked = i => CH[i].bonus ? state.solved.includes(LAST_MAIN) && (i === FIRST_BONUS || isDone(i - 1) || isDone(i))
                                      : i === 0 || isDone(i - 1) || isDone(i);

  /* ---------- the model solution: what the finished file should contain ---------- */
  const model = new XL.Sheet(M.sheet.cols, M.sheet.rows);
  Object.entries(M.sheet.cells).forEach(([a, v]) => model.set(a, v));
  const modelCells = goal => {
    const rg = XL.rangeOf(goal.range), out = {};
    XL.cellsOf(rg).forEach(a => { const p = XL.parseA(a); out[a] = XL.tidy(XL.shiftFormula(goal.ref, p.r - rg.r1, p.c - rg.c1)); });
    return out;
  };
  CH.forEach(c => (c.goals || []).forEach(g => Object.entries(modelCells(g)).forEach(([a, f]) => model.set(a, f))));
  const want = a => model.value(a);

  /* ---------- the preview on the right: Zsófi's file as it should look so far ---------- */
  const preview = XL.grid($("sheet"), Object.assign({}, M.sheet, {
    label: M.title + " – előnézet", noCopy: true, locked: [`A1:${XL.A(M.sheet.cols - 1, M.sheet.rows - 1)}`],
    lockedText: "Ez csak előnézet. A feladatot az Excelben csináld!"
  }));
  function fillPreview() {
    const map = {};
    state.solved.concat(state.bonus).forEach(i => (CH[i].goals || []).forEach(g => Object.assign(map, modelCells(g))));
    preview.load(map);
  }

  /* ---------- chapter strip ---------- */
  function renderSteps() {
    $("steps").innerHTML = CH.map((c, i) => {
      const cls = ["step"]; if (c.bonus) cls.push("bonus"); if (isDone(i)) cls.push("done"); if (i === state.current) cls.push("current"); if (!isUnlocked(i)) cls.push("locked");
      return `<button type="button" class="${cls.join(" ")}" data-i="${i}" ${isUnlocked(i) ? "" : 'aria-disabled="true"'} ${i === state.current ? 'aria-current="step"' : ""}>
        <span class="n">${label(i)}</span><span class="t">${esc(c.title)}</span></button>`;
    }).join("");
    $("solvedCount").textContent = `${state.solved.filter(i => !CH[i].refresher).length} / ${NCH}`;
  }
  $("steps").addEventListener("click", e => {
    const b = e.target.closest(".step"); if (!b) return;
    const i = +b.dataset.i;
    if (!isUnlocked(i)) { b.classList.remove("shake"); void b.offsetWidth; b.classList.add("shake"); return; }
    goTo(i);
  });

  /* ---------- one chapter ---------- */
  function renderCase() {
    const i = state.current, c = CH[i], solved = isDone(i), shown = state.hints[i] || 0;
    const asks = (c.asks || []).map((q, k) => {
      const prev = (state.answers[i] || {})[k] || "";
      return `<div class="ask" data-k="${k}"><label for="ans${k}">${q.q}</label>
        <div class="ask-row"><input id="ans${k}" type="text" inputmode="${q.text ? "text" : "decimal"}" autocomplete="off" spellcheck="false" value="${esc(prev)}" ${solved ? "disabled" : ""} placeholder="${q.text ? "a válaszod" : "a szám, amit az Excel mutat"}"><span class="mark" aria-hidden="true"></span></div></div>`;
    }).join("");
    $("case").innerHTML = `
      <p class="chap">${c.refresher ? "Kezdés · mielőtt nekiállsz" : c.bonus ? `Bónusz feladat · ${bonusNo(i)}. a ${NBONUS}-ből · nem kötelező` : `${chapNo(i)}. fejezet a ${NCH}-ből`}</p>
      <h2>${esc(c.title)}</h2>
      <div class="story">${c.story}</div>
      ${c.learn ? `<div class="learn"><h3>${c.refresher ? "Emlékeztető" : c.isNew === false ? "Jó tudni" : "Új tudás"}</h3>${c.learn}</div>` : ""}
      <div class="task"><h3>Lépésről lépésre, az Excelben</h3><ol class="howto">${c.steps.map(s => `<li>${s}</li>`).join("")}</ol>
        ${c.upload ? uploadHtml() : `<form class="asks" id="askForm"><h3>Mit mutat az Excel?</h3>${asks}
          <div class="btns"><button type="submit" class="btn primary" id="checkBtn"${solved ? " hidden" : ""}>Ellenőrzés</button>
          <button type="button" class="btn" id="hintBtn"${solved || shown >= (c.hints || []).length ? " hidden" : ""}>${shown ? "Még egy segítség" : "Segítség"}</button></div></form>`}
        <div class="hints">${(c.hints || []).slice(0, shown).map((h, k) => `<div class="hint"><b>${k + 1}. segítség</b> ${h}</div>`).join("")}</div>
        <div id="verdict" aria-live="polite"></div>
      </div>
      <div id="won">${solved ? wonHtml(i) : ""}</div>`;
    const rep = (state.reports || {})[i] || (!c.bonus && state.report);
    if (c.upload && rep) showReport(rep);
  }
  function wonHtml(i) {
    const c = CH[i], toEnd = i === LAST_MAIN || (c.bonus && !(CH[i + 1] && CH[i + 1].bonus));
    return `<div class="verdict ok"><b>${c.refresher ? "Rendben, mehetünk!" : c.bonus ? "Bónusz kész!" : "Stimmel!"}</b><p>${c.success}</p></div>
      ${toEnd ? `<button type="button" class="btn primary big" id="toEnd">${c.bonus ? "Vissza a befejezéshez" : "Tovább a befejezéshez"}</button>` : c.bonus ? `<button type="button" class="btn primary big" id="next">Következő bónusz →</button>` : `<button type="button" class="btn primary big" id="next">${c.refresher ? "Kezdjük!" : "Következő fejezet"} →</button>`}`;
  }
  function goTo(i, quiet) {
    state.current = i; save();
    renderSteps(); renderCase(); fillPreview();
    const c = CH[i];
    preview.setTargets(c.upload ? [] : (c.targets || (c.goals || []).map(g => g.range)));
    if (c.select) preview.select(c.select);
    if (!quiet && innerWidth < 1000) $("case").scrollIntoView({ behavior: "smooth", block: "start" });
  }
  function solve(i) {
    if (!isDone(i)) (CH[i].bonus ? state.bonus : state.solved).push(i);
    if (i === LAST_MAIN && !state.end) state.end = Date.now();
    save(); renderSteps(); fillPreview();
    $("verdict").innerHTML = "";
    const cb = $("checkBtn"), hb = $("hintBtn"); if (cb) cb.hidden = true; if (hb) hb.hidden = true;
    document.querySelectorAll(".ask input").forEach(x => x.disabled = true);
    $("won").innerHTML = wonHtml(i);
    const r = $("won").getBoundingClientRect();
    celebrate(r.left + r.width / 2, r.top + 20, CH[i].refresher ? 30 : 60);
    if (innerWidth < 1000) $("won").scrollIntoView({ behavior: "smooth", block: "center" });
  }

  /* ---------- typed answers ---------- */
  const normText = s => String(s).toLowerCase().replace(/[\s.\-–]/g, "");
  const normNum = s => { const t = String(s).replace(/[\s  ]/g, "").replace(/(pont|ft|db|fő)$/i, "").replace(",", "."); return /^-?\d+(\.\d+)?$/.test(t) ? parseFloat(t) : null; };
  function judge(q, raw) {
    if (!raw.trim()) return { ok: false, msg: "Még nem írtál be semmit." };
    if (q.text) {
      const n = normText(raw), ok = q.text.some(t => normText(t) === n);
      if (ok) return { ok: true };
      for (const [k, m] of Object.entries(q.traps || {})) if (normText(k) === n) return { ok: false, msg: m };
      return { ok: false, msg: q.wrong || "Ez nem stimmel. Nézd meg újra a táblázatot!" };
    }
    const n = normNum(raw), exp = want(q.cell);
    if (n === null) return { ok: false, msg: "Csak a számot írd be, ahogy az Excel mutatja (pl. 6,25)." };
    if (Math.abs(n - exp) < 0.0006 * Math.max(1, Math.abs(exp))) return { ok: true };
    /* the closest typical wrong answer wins (8,67 is "two decimals", not "unrounded") */
    let best = null;
    for (const [k, m] of Object.entries(q.traps || {})) { const t = normNum(k); if (t === null) continue; const d = Math.abs(n - t); if (d < 0.0006 * Math.max(1, Math.abs(t)) && (!best || d < best.d)) best = { d, m }; }
    if (best) return { ok: false, msg: best.m };
    return { ok: false, msg: q.wrong || `Ez nem stimmel. Kattints az Excelben ${XL.az(q.cell)} ${q.cell} cellára, és nézd meg a szerkesztőlécen, jó-e a képlet.` };
  }
  $("case").addEventListener("submit", e => {
    if (e.target.id !== "askForm") return;
    e.preventDefault();
    const i = state.current, c = CH[i];
    state.answers[i] = state.answers[i] || {};
    let first = null;
    (c.asks || []).forEach((q, k) => {
      const box = document.querySelector(`.ask[data-k="${k}"]`), raw = box.querySelector("input").value;
      state.answers[i][k] = raw;
      const r = judge(q, raw);
      box.classList.toggle("ok", r.ok); box.classList.toggle("no", !r.ok);
      if (!r.ok && !first) first = r.msg;
    });
    save();
    if (!first) { solve(i); return; }
    $("verdict").innerHTML = `<div class="verdict no"><b>Még nem stimmel.</b><p>${esc(first)}</p></div>`;
    buzz();
  });
  $("case").addEventListener("click", e => {
    const id = e.target.id;
    if (id === "hintBtn") { const i = state.current; state.hints[i] = (state.hints[i] || 0) + 1; save(); renderCase(); }
    if (id === "next") goTo(state.current + 1);
    if (id === "toEnd") showEnd();
  });

  /* ---------- the saved file, checked here in the browser ---------- */
  function uploadHtml() {
    return `<div class="drop" id="drop" tabindex="0" role="button" aria-label="Fájl kiválasztása">
        <input type="file" id="fileIn" accept=".xlsx" hidden>
        <b>Húzd ide az elmentett .xlsx fájlodat</b><span>vagy kattints, és válaszd ki</span></div>
      <div id="report"></div>`;
  }
  /* the functions in an .xlsx are stored in English */
  const EN = { SZUM: "SUM", "ÁTLAG": "AVERAGE", MIN: "MIN", MAX: "MAX", DARAB: "COUNT", DARAB2: "COUNTA", "KEREKÍTÉS": "ROUND", HA: "IF", DARABTELI: "COUNTIF", SZUMHA: "SUMIF" };
  const HU = Object.fromEntries(Object.entries(EN).map(([h, e]) => [e, h]));
  const toHu = f => "=" + String(f).replace(/\b([A-Z][A-Z0-9.]*)\(/g, (m, n) => (HU[n] || n) + "(").replace(/,/g, ";").replace(/(\d)\.(\d)/g, "$1,$2");
  function loadScript(src) { return new Promise((ok, no) => { const s = document.createElement("script"); s.src = src; s.onload = ok; s.onerror = no; document.head.appendChild(s); }); }
  async function checkFile(file) {
    $("report").innerHTML = `<p class="export-note">Ellenőrzöm: ${esc(file.name)}…</p>`;
    if (!/\.xlsx$/i.test(file.name)) { $("report").innerHTML = `<div class="verdict no"><b>Ez nem Excel-fájl.</b><p>Az Excelben mentett .xlsx fájlt válaszd ki (pl. ${esc(M.saveAs)}).</p></div>`; return; }
    try { if (!window.XLSX) await loadScript("https://cdn.jsdelivr.net/npm/" + "xlsx@0.18.5/dist/xlsx.full.min.js"); }
    catch (e) { $("report").innerHTML = `<div class="verdict no"><b>Nincs internet.</b><p>A fájl ellenőrzéséhez internetkapcsolat kell. Próbáld újra később.</p></div>`; return; }
    let ws;
    try {
      const wb = XLSX.read(await file.arrayBuffer(), { type: "array", cellFormula: true });
      ws = wb.Sheets[M.sheetName] || wb.Sheets[wb.SheetNames[0]];
    } catch (e) { $("report").innerHTML = `<div class="verdict no"><b>Ezt a fájlt nem tudom megnyitni.</b><p>Mentsd el újra az Excelben (Fájl › Mentés), és próbáld újra.</p></div>`; return; }
    /* expected values are worked out from the student's own cells, so one wrong cell is reported once,
       not again in every cell that builds on it */
    const theirs = new XL.Sheet(M.sheet.cols, M.sheet.rows);
    for (let r = 0; r < M.sheet.rows; r++) for (let c = 0; c < M.sheet.cols; c++) { const a = XL.A(c, r), x = ws[a]; if (x && x.v !== undefined && x.v !== "") theirs.set(a, x.v); }
    const expect = (goal, a) => { const rg = XL.rangeOf(goal.range), p = XL.parseA(a); return theirs.calc(XL.shiftFormula(goal.ref, p.r - rg.r1, p.c - rg.c1), a); };
    const rows = [];
    const bonusScope = !!CH[state.current].bonus;      /* the bonus upload checks only the bonus cells */
    CH.filter(c => !!c.bonus === bonusScope).forEach(c => (c.goals || []).forEach(goal => {
      const cells = XL.cellsOf(XL.rangeOf(goal.range)); let msg = null, ok = 0;
      for (const a of cells) {
        const cell = ws[a], exp = expect(goal, a), f = cell && cell.f ? String(cell.f) : "";
        let m = null;
        if (!cell || cell.v === undefined || cell.v === "") m = `${XL.Az(a)} ${a} cella üres.`;
        else if (!f) m = `${XL.Az(a)} ${a} cellában nincs képlet, csak egy beírt érték. Írj képletet = jellel!`;
        else if (goal.fn && !new RegExp("\\b" + EN[goal.fn] + "\\(").test(f.toUpperCase())) m = `${XL.Az(a)} ${a} képlete (${toHu(f)}) nem ${XL.az(goal.fn)} ${goal.fn} függvényt használja.`;
        else if (typeof exp !== "number" || typeof cell.v !== "number" || Math.abs(cell.v - exp) > 1e-6 * Math.max(1, Math.abs(exp))) m = `${XL.Az(a)} ${a} értéke ${cell.w || cell.v}, de ${(typeof exp === "number" ? XL.fmtGeneral(exp) : XL.textOf(exp)).replace(/(,\d{2})\d+$/, "$1…")} kellene. A képleted: ${toHu(f)}`;
        if (m) { if (!msg) msg = m; } else ok++;
      }
      rows.push({ label: goal.label, ok: ok === cells.length, done: ok, total: cells.length, msg });
    }));
    const report = { name: file.name, at: Date.now(), rows };
    state.reports = state.reports || {}; state.reports[state.current] = report;
    if (!bonusScope) state.report = report;
    save(); showReport(report);
    if (rows.every(r => r.ok)) solve(state.current); else buzz();
  }
  function showReport(rep) {
    const good = rep.rows.filter(r => r.ok).length;
    $("report").innerHTML = `<p class="rep-head"><b>${esc(rep.name)}</b>: ${good} / ${rep.rows.length} rész rendben</p>
      <ul class="goals report">${rep.rows.map(r => `<li class="${r.ok ? "ok" : ""}"><span class="gt">${r.label}${r.ok ? "" : `<small>${esc(r.msg)}</small>`}</span><span class="cnt">${r.total > 1 ? `${r.done} / ${r.total}` : ""}</span></li>`).join("")}</ul>
      ${good < rep.rows.length ? `<p class="export-note">Javítsd ki az Excelben, mentsd el (<kbd>Ctrl</kbd>+<kbd>S</kbd>), és húzd ide újra.</p>` : ""}`;
  }
  $("case").addEventListener("click", e => { if (e.target.closest("#drop")) $("fileIn").click(); });
  $("case").addEventListener("keydown", e => { if (e.target.id === "drop" && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); $("fileIn").click(); } });
  $("case").addEventListener("change", e => { if (e.target.id === "fileIn" && e.target.files[0]) checkFile(e.target.files[0]); });
  $("case").addEventListener("dragover", e => { const d = e.target.closest("#drop"); if (d) { e.preventDefault(); d.classList.add("over"); } });
  $("case").addEventListener("dragleave", e => { const d = e.target.closest("#drop"); if (d) d.classList.remove("over"); });
  $("case").addEventListener("drop", e => { const d = e.target.closest("#drop"); if (!d) return; e.preventDefault(); d.classList.remove("over"); const f = e.dataTransfer.files[0]; if (f) checkFile(f); });

  /* ---------- the end ---------- */
  function showEnd() {
    const mins = Math.max(1, Math.round(((state.end || Date.now()) - state.start) / 60000));
    const hints = Object.values(state.hints).reduce((s, n) => s + n, 0);
    $("endPanel").hidden = false; $("game").hidden = true;
    $("endPanel").innerHTML = `
      <div class="end-card">
        <p class="chap">Küldetés teljesítve</p>
        <h2>${esc(M.ending.title)}</h2>
        <div class="story">${M.ending.text}</div>
        <ul class="stats"><li><b>${NCH}</b> fejezet</li><li><b>${mins}</b> perc</li><li><b>${hints}</b> segítség</li>${NBONUS ? `<li><b>${state.bonus.length} / ${NBONUS}</b> bónusz</li>` : ""}</ul>
        ${NBONUS ? bonusBox() : ""}
        ${M.ending.rank ? `<p class="rank">${M.ending.rank(mins, hints)}</p>` : ""}
        <div class="reward"><h3>Jutalom</h3><div id="reward"></div></div>
        <div class="export">
          <h3>Add be a munkádat</h3>
          <ol class="export-steps"><li>Nyisd meg a feladatot a <b>Google Classroomban</b>.</li><li>Töltsd fel az elmentett Excel-fájlodat (${esc(latestFile())}).</li><li>Kattints a <b>Beadás</b> gombra.</li></ol>
        </div>
        <div class="end-btns"><button type="button" class="btn" id="backToSheet">← Vissza a fejezetekhez</button><button type="button" class="btn reset" id="endReset">Újrakezdés</button>${M.next ? `<a class="btn primary" href="${M.next.href}">${esc(M.next.text)} →</a>` : ""}</div>
      </div>`;
    if (window.DancingCats) DancingCats.mount($("reward"), { sound: () => soundOn, burst: (x, y, n) => celebrate(x, y, n) });
    const r = $("endPanel").getBoundingClientRect();
    scrollTo({ top: scrollY + r.top - 70, behavior: "smooth" });
    setTimeout(() => { for (let k = 0; k < 5; k++) setTimeout(() => celebrate(innerWidth * (0.15 + Math.random() * 0.7), innerHeight * (0.15 + Math.random() * 0.3), 70), k * 350); }, 200);
    fanfare();
  }
  /* the newest checked file is the one to hand in (with the bonus, if it was done) */
  const latestFile = () => { const all = Object.values(state.reports || {}).concat(state.report ? [state.report] : []).filter(r => r && r.rows.every(x => x.ok)); all.sort((a, b) => b.at - a.at); return all[0] ? all[0].name : M.saveAs; };
  function bonusBox() {
    const left = CH.findIndex((c, k) => c.bonus && !isDone(k));
    return `<div class="bonusbox">${left < 0
      ? `<h3>Minden bónusz kész!</h3><p>Ügyes vagy: a bónusz feladatokat is mind megoldottad.</p>`
      : `<h3>Gyorsabb voltál? Itt egy kis plusz!</h3><p>${NBONUS} bónusz feladat vár rád, ugyanabban a fájlban. Nem kötelező, de jó gyakorlás.</p><button type="button" class="btn primary" id="toBonus" data-i="${left}">Bónusz feladatok →</button>`}</div>`;
  }
  $("endPanel").addEventListener("click", e => {
    if (e.target.id === "backToSheet") { $("endPanel").hidden = true; $("game").hidden = false; goTo(LAST_MAIN); }
    if (e.target.closest("#endReset")) { if (armOrReset(e.target.closest("#endReset"))) doReset(); }
    if (e.target.id === "toBonus") { $("endPanel").hidden = true; $("game").hidden = false; goTo(+e.target.dataset.i); }
  });

  /* ---------- header: timer, sound, start again ---------- */
  const fmtTime = ms => { const m = Math.floor(ms / 60000), s = Math.floor(ms / 1000) % 60; return `${m}:${String(s).padStart(2, "0")}`; };
  function tick() { $("timer").textContent = fmtTime((state.end || Date.now()) - state.start); }
  setInterval(tick, 1000); tick();
  let soundOn = true; try { soundOn = localStorage.getItem("digikult-excel-sound") !== "off"; } catch (e) {}
  const paintSound = () => { $("soundBtn").textContent = soundOn ? "Hang: be" : "Hang: ki"; $("soundBtn").setAttribute("aria-pressed", soundOn); };
  $("soundBtn").addEventListener("click", () => { soundOn = !soundOn; paintSound(); try { localStorage.setItem("digikult-excel-sound", soundOn ? "on" : "off"); } catch (e) {} });
  paintSound();
  /* restart: two clicks instead of a browser dialog; works for the header button and the one on the end page */
  let resetArmed = null;
  function disarm(btn) { clearTimeout(btn._t); btn.textContent = btn.dataset.label || "Újrakezdés"; btn.classList.remove("armed"); if (resetArmed === btn) resetArmed = null; }
  function armOrReset(btn) {
    if (resetArmed === btn) { disarm(btn); return true; }
    if (resetArmed) disarm(resetArmed);
    resetArmed = btn; btn.dataset.label = btn.textContent; btn.textContent = "Biztos? Kattints újra"; btn.classList.add("armed");
    btn._t = setTimeout(() => disarm(btn), 4000);
    return false;
  }
  function doReset() {
    state = { solved: [], bonus: [], current: 0, start: Date.now(), end: null, hints: {}, answers: {}, student: "" };
    save(); $("endPanel").hidden = true; $("game").hidden = false; goTo(0); scrollTo({ top: 0, behavior: "smooth" });
  }
  $("resetBtn").addEventListener("click", e => { if (armOrReset(e.currentTarget)) doReset(); });

  /* teacher shortcut: type the code anywhere and every chapter opens, with the model file in the preview */
  let buf = "";
  document.addEventListener("keydown", e => {
    if (e.key.length !== 1) return;
    buf = (buf + e.key.toLowerCase()).slice(-8);
    if (buf === "bruinsma") { buf = ""; state.solved = CH.map((c, k) => c.bonus ? -1 : k).filter(k => k >= 0); state.bonus = CH.map((c, k) => c.bonus ? k : -1).filter(k => k >= 0); state.dev = true; if (!state.end) state.end = Date.now(); save(); goTo(LAST_MAIN); }
  }, true);

  /* ---------- confetti and a chime ---------- */
  const fx = { c: $("fx"), parts: [], raf: 0 }; fx.ctx = fx.c.getContext("2d");
  const size = () => { const d = devicePixelRatio || 1; fx.c.width = innerWidth * d; fx.c.height = innerHeight * d; fx.ctx.setTransform(d, 0, 0, d, 0, 0); };
  size(); addEventListener("resize", size);
  const COLS = M.confetti || ["#107c41", "#f2d264", "#f0a3b8", "#7fa7ff", "#ff9e7a", "#a8dba0"];
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  function celebrate(x, y, n) {
    chime(); if (reduced) return;
    for (let k = 0; k < n; k++) { const a = Math.random() * Math.PI * 2, v = 3 + Math.random() * 7; fx.parts.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 4, r: 3 + Math.random() * 4, rot: Math.random() * 6, vr: (Math.random() - .5) * .4, c: COLS[k % COLS.length], life: 70 + Math.random() * 40, sq: Math.random() < .5 }); }
    if (!fx.raf) fx.raf = requestAnimationFrame(loop);
  }
  function loop() {
    const X = fx.ctx; X.clearRect(0, 0, innerWidth, innerHeight);
    fx.parts = fx.parts.filter(p => p.life > 0);
    for (const p of fx.parts) {
      p.vy += .25; p.vx *= .985; p.x += p.vx; p.y += p.vy; p.rot += p.vr; p.life--;
      X.save(); X.globalAlpha = Math.min(1, p.life / 30); X.translate(p.x, p.y); X.rotate(p.rot); X.fillStyle = p.c;
      if (p.sq) X.fillRect(-p.r, -p.r / 2, p.r * 2, p.r); else { X.beginPath(); X.arc(0, 0, p.r * .7, 0, 7); X.fill(); }
      X.restore();
    }
    fx.raf = fx.parts.length ? requestAnimationFrame(loop) : 0;
  }
  let AC = null;
  function tone(f, d, type = "triangle", vol = .1, delay = 0) {
    if (!soundOn) return;
    try {
      AC = AC || new (window.AudioContext || window.webkitAudioContext)();
      const t = AC.currentTime + delay, o = AC.createOscillator(), gn = AC.createGain();
      o.type = type; o.frequency.setValueAtTime(f, t); gn.gain.setValueAtTime(vol, t); gn.gain.exponentialRampToValueAtTime(.0001, t + d);
      o.connect(gn).connect(AC.destination); o.start(t); o.stop(t + d + .05);
    } catch (e) {}
  }
  const chime = () => { [659, 784, 1047].forEach((f, k) => tone(f, .25, "triangle", .08, k * .07)); };
  const buzz = () => tone(180, .18, "sawtooth", .03);
  const fanfare = () => { [523, 659, 784, 1047, 784, 1047].forEach((f, k) => tone(f, k === 5 ? .9 : .2, "triangle", .09, k * .13)); };

  $("sheet").classList.add("xl-preview");
  XL.guardFormulas();
  goTo(Math.min(state.current, CH.length - 1), true);
})();
