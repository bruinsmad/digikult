/* digikult — Excel missions: one worksheet that grows chapter by chapter.
   The page defines MISSION = {
     key, title, file, sheet: { …XL.grid options… },
     chapters: [{ title, refresher, story, learn, goals: [{ text, range, ref, use, noConst, abs, traps }], targets, select, hints: [..], success }],
     ending: { title, text, rank(min) }
   } */
(function () {
  "use strict";
  const M = window.MISSION, CH = M.chapters, KEY = M.key;
  const $ = id => document.getElementById(id);
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const plain = h => { const d = document.createElement("div"); d.innerHTML = h; return d.textContent.replace(/\s+/g, " ").trim(); };
  const NCH = CH.filter(c => !c.refresher).length;

  let state = { solved: [], current: 0, start: Date.now(), end: null, cells: {}, hints: {}, student: "" };
  try { const s = JSON.parse(localStorage.getItem(KEY)); if (s && Array.isArray(s.solved)) state = Object.assign(state, s); } catch (e) {}
  state.solved = state.solved.filter(i => i >= 0 && i < CH.length);
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) {} };
  const isUnlocked = i => i === 0 || state.solved.includes(i - 1) || state.solved.includes(i);
  const chapNo = i => CH.slice(0, i + 1).filter(c => !c.refresher).length;

  /* ---------- the worksheet ---------- */
  const g = XL.grid($("sheet"), Object.assign({}, M.sheet, {
    label: M.title,
    onChange: (gg, why) => { state.cells = gg.userCells(); save(); live(why); }
  }));
  g.load(state.cells);

  /* ---------- chapter strip ---------- */
  function renderSteps() {
    $("steps").innerHTML = CH.map((c, i) => {
      const cls = ["step"]; if (state.solved.includes(i)) cls.push("done"); if (i === state.current) cls.push("current"); if (!isUnlocked(i)) cls.push("locked");
      return `<button type="button" class="${cls.join(" ")}" data-i="${i}" ${isUnlocked(i) ? "" : 'aria-disabled="true"'} ${i === state.current ? 'aria-current="step"' : ""}>
        <span class="n">${c.refresher ? "Ismétlés" : chapNo(i) + ". fejezet"}</span><span class="t">${esc(c.title)}</span></button>`;
    }).join("");
    $("solvedCount").textContent = `${state.solved.filter(i => !CH[i].refresher).length} / ${NCH}`;
  }
  $("steps").addEventListener("click", e => {
    const b = e.target.closest(".step"); if (!b) return;
    const i = +b.dataset.i;
    if (!isUnlocked(i)) { flashLocked(b); return; }
    goTo(i);
  });
  const flashLocked = b => { b.classList.remove("shake"); void b.offsetWidth; b.classList.add("shake"); };

  /* ---------- one chapter ---------- */
  function goalRows(i) {
    const c = CH[i];
    return c.goals.map((goal, k) => `<li data-k="${k}"><span class="gt">${goal.text}</span><span class="cnt"></span></li>`).join("");
  }
  function renderCase() {
    const i = state.current, c = CH[i], solved = state.solved.includes(i), last = i === CH.length - 1;
    const shownHints = state.hints[i] || 0;
    $("case").innerHTML = `
      <p class="chap">${c.refresher ? "Ismétlés · mielőtt belekezdesz" : `${chapNo(i)}. fejezet a ${NCH}-ből`}</p>
      <h2>${esc(c.title)}</h2>
      <div class="story">${c.story}</div>
      ${c.learn ? `<div class="learn"><h3>${c.refresher ? "Emlékeztető" : c.isNew === false ? "Jó tudni" : "Új tudás"}</h3>${c.learn}</div>` : ""}
      <div class="task"><h3>Feladat</h3><ol class="goals">${goalRows(i)}</ol>
        <div class="btns">
          <button type="button" class="btn primary" id="checkBtn"${solved ? " hidden" : ""}>Ellenőrzés</button>
          <button type="button" class="btn" id="hintBtn"${solved || shownHints >= (c.hints || []).length ? " hidden" : ""}>${shownHints ? "Még egy segítség" : "Segítség"}</button>
        </div>
        <div class="hints">${(c.hints || []).slice(0, shownHints).map((h, k) => `<div class="hint"><b>${k + 1}. segítség</b> ${h}</div>`).join("")}</div>
        <div id="verdict" aria-live="polite"></div>
      </div>
      <div id="won">${solved ? wonHtml(i) : ""}</div>`;
    live();
  }
  function wonHtml(i) {
    const c = CH[i], last = i === CH.length - 1;
    return `<div class="verdict ok"><b>${c.refresher ? "Rendben, mehetünk!" : "Kész!"}</b><p>${c.success}</p></div>
      ${last ? `<button type="button" class="btn primary big" id="toEnd">Tovább a befejezéshez</button>` : `<button type="button" class="btn primary big" id="next">${c.refresher ? "Kezdjük!" : "Következő fejezet"} →</button>`}`;
  }
  function goTo(i, quiet) {
    state.current = i; save();
    renderSteps(); renderCase();
    const c = CH[i];
    g.setTargets(c.targets || c.goals.map(x => x.range));
    if (c.select) g.select(c.select);
    if (!quiet && innerWidth < 1000) $("case").scrollIntoView({ behavior: "smooth", block: "start" });
  }

  /* live ticks: every change re-checks the chapter's goals */
  function results(i) { return CH[i].goals.map(goal => goal.test ? goal.test(g) : XL.check(g, goal)); }
  function live(why) {
    if ($("endPanel") && !$("endPanel").hidden) return;
    const i = state.current, res = results(i);
    res.forEach((r, k) => {
      const li = document.querySelector(`.goals li[data-k="${k}"]`); if (!li) return;
      li.classList.toggle("ok", r.ok);
      li.querySelector(".cnt").textContent = r.total > 1 ? `${r.done} / ${r.total}` : "";
    });
    if (res.every(r => r.ok) && !state.solved.includes(i)) solve(i);
    else if (why && $("verdict") && $("verdict").firstChild && !res.every(r => r.ok)) $("verdict").innerHTML = "";
  }
  function solve(i) {
    state.solved.push(i);
    if (i === CH.length - 1 && !state.end) state.end = Date.now();
    save(); renderSteps();
    $("verdict").innerHTML = "";
    $("checkBtn").hidden = true; $("hintBtn").hidden = true;
    $("won").innerHTML = wonHtml(i);
    const r = $("won").getBoundingClientRect();
    celebrate(r.left + r.width / 2, r.top + 20, CH[i].refresher ? 30 : 60);
    if (innerWidth < 1000) $("won").scrollIntoView({ behavior: "smooth", block: "center" });
  }
  $("case").addEventListener("click", e => {
    const id = e.target.id;
    if (id === "checkBtn") {
      const res = results(state.current), bad = res.find(r => !r.ok);
      if (!bad) { solve(state.current); return; }
      $("verdict").innerHTML = `<div class="verdict no"><b>Még nem stimmel.</b><p>${esc(bad.msg || "Valami még hiányzik.")}</p></div>`;
      if (bad.at) g.select(bad.at);
      buzz();
    }
    if (id === "hintBtn") {
      const i = state.current; state.hints[i] = (state.hints[i] || 0) + 1; save(); renderCase();
    }
    if (id === "next") goTo(state.current + 1);
    if (id === "toEnd") showEnd();
  });

  /* ---------- the end ---------- */
  const fmtTime = ms => { const m = Math.floor(ms / 60000), s = Math.floor(ms / 1000) % 60; return `${m}:${String(s).padStart(2, "0")}`; };
  function showEnd() {
    const mins = Math.max(1, Math.round(((state.end || Date.now()) - state.start) / 60000));
    const hints = Object.values(state.hints).reduce((s, n) => s + n, 0);
    $("endPanel").hidden = false; $("game").hidden = true;
    $("endPanel").innerHTML = `
      <div class="end-card">
        <p class="chap">Küldetés teljesítve</p>
        <h2>${esc(M.ending.title)}</h2>
        <div class="story">${M.ending.text}</div>
        <ul class="stats"><li><b>${NCH}</b> fejezet</li><li><b>${mins}</b> perc</li><li><b>${hints}</b> segítség</li></ul>
        ${M.ending.rank ? `<p class="rank">${M.ending.rank(mins, hints)}</p>` : ""}
        <div class="export">
          <h3>Add be a munkádat</h3>
          <ol class="export-steps"><li>Írd be a neved.</li><li>Kattints a <b>Táblázat letöltése (.xlsx)</b> gombra. Ez egy Excel-fájl a képleteiddel; a Letöltések mappába kerül.</li><li>Nyisd meg a feladatot a <b>Google Classroomban</b>, töltsd fel a fájlt, és kattints a <b>Beadás</b> gombra.</li></ol>
          <label for="studentName">A neved</label>
          <input id="studentName" type="text" autocomplete="name" value="${esc(state.student || "")}" placeholder="pl. Kovács Anna">
          <div class="export-btns"><button class="btn primary" type="button" id="saveXlsx">Táblázat letöltése (.xlsx)</button><button class="btn" type="button" id="saveTxt">Képletek mentése (.txt)</button></div>
          <p class="export-note" id="exportNote" aria-live="polite"></p>
        </div>
        <div class="end-btns"><button type="button" class="btn" id="backToSheet">← Vissza a táblázathoz</button>${M.next ? `<a class="btn primary" href="${M.next.href}">${esc(M.next.text)} →</a>` : ""}</div>
      </div>`;
    const r = $("endPanel").getBoundingClientRect();
    scrollTo({ top: scrollY + r.top - 70, behavior: "smooth" });
    setTimeout(() => { for (let k = 0; k < 5; k++) setTimeout(() => celebrate(innerWidth * (0.15 + Math.random() * 0.7), innerHeight * (0.15 + Math.random() * 0.3), 70), k * 350); }, 200);
    fanfare();
  }
  $("endPanel").addEventListener("input", e => { if (e.target.id === "studentName") { state.student = e.target.value; save(); } });
  $("endPanel").addEventListener("click", e => {
    if (e.target.id === "backToSheet") { $("endPanel").hidden = true; $("game").hidden = false; goTo(CH.length - 1); }
    if (e.target.id === "saveTxt") exportTxt();
    if (e.target.id === "saveXlsx") exportXlsx();
  });
  const slug = s => (s || "").normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^A-Za-z0-9]+/g, "-").replace(/^-|-$/g, "").toLowerCase();
  function needName() {
    const name = (state.student || "").trim();
    if (!name) { $("exportNote").textContent = "Előbb írd be a neved!"; $("studentName").focus(); return null; }
    return name;
  }
  function download(name, blob) {
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = name;
    document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 500);
  }
  function exportTxt() {
    const name = needName(); if (!name) return;
    const L = [M.title, `Név: ${name}`, `Dátum: ${new Date().toLocaleString("hu-HU")}`, `Idő: ${fmtTime((state.end || Date.now()) - state.start)}`, `Segítségek: ${Object.values(state.hints).reduce((s, n) => s + n, 0)}`, ""];
    CH.forEach((c, i) => {
      L.push(`== ${c.refresher ? "Ismétlés" : chapNo(i) + ". fejezet"}: ${c.title} ==`);
      c.goals.forEach(goal => {
        if (!goal.range) return;
        L.push("- " + plain(goal.text));
        XL.cellsOf(XL.rangeOf(goal.range)).forEach(a => { const raw = g.raw(a); L.push(`  ${a}: ${raw === null ? "(üres)" : raw}  →  ${g.text(a)}`); });
      });
      L.push("");
    });
    download(`${M.file || "excel"}-${slug(name)}.txt`, new Blob([L.join("\r\n")], { type: "text/plain;charset=utf-8" }));
    $("exportNote").textContent = "Elmentve a Letöltések mappába.";
  }
  /* Hungarian formulas → the English form an .xlsx file stores (Excel shows them in Hungarian again) */
  const EN = { SZUM: "SUM", "ÁTLAG": "AVERAGE", MIN: "MIN", MAX: "MAX", DARAB: "COUNT", DARAB2: "COUNTA", "KEREKÍTÉS": "ROUND", HA: "IF", DARABTELI: "COUNTIF", SZUMHA: "SUMIF" };
  function toEnglish(raw) {
    const src = raw.slice(1), toks = XL.tokenize(src); let out = "", last = 0;
    for (const t of toks) {
      let rep = null;
      if (t.t === "fn") rep = EN[t.v] || t.v;
      else if (t.t === "sep") rep = ",";
      else if (t.t === "num") rep = String(t.v);
      else if (t.t === "bool") rep = t.v ? "TRUE" : "FALSE";
      if (rep !== null) { out += src.slice(last, t.pos) + rep; last = t.end; }
    }
    return out + src.slice(last);
  }
  const ZF = { ft: '#,##0 "Ft"', int: "#,##0", dec1: "0.0", dec2: "0.00", pct: "0%", pct1: "0.0%", db: '0 "db"' };
  function loadScript(src) { return new Promise((ok, no) => { const s = document.createElement("script"); s.src = src; s.onload = ok; s.onerror = no; document.head.appendChild(s); }); }
  async function exportXlsx() {
    const name = needName(); if (!name) return;
    $("exportNote").textContent = "Készül a fájl…";
    try { if (!window.XLSX) await loadScript("https://cdn.jsdelivr.net/npm/" + "xlsx@0.18.5/dist/xlsx.full.min.js");   /* split so the offline cache does not download it for everyone */ }
    catch (e) { $("exportNote").textContent = "Az Excel-fájlhoz internet kell. Mentsd el inkább a képleteket (.txt)."; return; }
    const S = M.sheet, ws = {}, fmts = {};
    for (const [k, v] of Object.entries(S.formats || {})) XL.cellsOf(XL.rangeOf(k, S.rows)).forEach(a => fmts[a] = v);
    for (let r = 0; r < S.rows; r++) for (let c = 0; c < S.cols; c++) {
      const a = XL.A(c, r), raw = g.raw(a); if (raw === null) continue;
      const v = g.value(a), cell = {};
      if (typeof raw === "string" && raw[0] === "=") cell.f = toEnglish(raw);
      if (XL.isErr(v)) { cell.t = "e"; cell.v = 0x0F; }
      else if (typeof v === "number") { cell.t = "n"; cell.v = v; }
      else if (typeof v === "boolean") { cell.t = "b"; cell.v = v; }
      else { cell.t = "s"; cell.v = v == null ? "" : String(v); }
      if (fmts[a] && ZF[fmts[a]]) cell.z = ZF[fmts[a]];
      ws[a] = cell;
    }
    ws["!ref"] = `A1:${XL.A(S.cols - 1, S.rows - 1)}`;
    ws["!cols"] = (S.widths || []).map(w => ({ wpx: w }));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, (M.sheetName || "Munka1").slice(0, 31));
    XLSX.writeFile(wb, `${M.file || "excel"}-${slug(name)}.xlsx`);
    $("exportNote").textContent = "Elmentve a Letöltések mappába. Nyisd meg Excelben is: a képleteid ott is működnek!";
  }

  /* ---------- header: timer, sound, start again ---------- */
  function tick() { $("timer").textContent = fmtTime((state.end || Date.now()) - state.start); }
  setInterval(tick, 1000); tick();
  let soundOn = true; try { soundOn = localStorage.getItem("digikult-excel-sound") !== "off"; } catch (e) {}
  const paintSound = () => { $("soundBtn").textContent = soundOn ? "Hang: be" : "Hang: ki"; $("soundBtn").setAttribute("aria-pressed", soundOn); };
  $("soundBtn").addEventListener("click", () => { soundOn = !soundOn; paintSound(); try { localStorage.setItem("digikult-excel-sound", soundOn ? "on" : "off"); } catch (e) {} });
  paintSound();
  $("resetBtn").addEventListener("click", () => {
    if (!confirmReset()) return;
    state = { solved: [], current: 0, start: Date.now(), end: null, cells: {}, hints: {}, student: state.student };
    save(); g.reset(); $("endPanel").hidden = true; $("game").hidden = false; goTo(0);
  });
  let resetArmed = 0;
  function confirmReset() {                 /* two clicks instead of a browser dialog */
    if (Date.now() - resetArmed < 4000) { resetArmed = 0; $("resetBtn").textContent = "Elölről"; return true; }
    resetArmed = Date.now(); $("resetBtn").textContent = "Biztos? Kattints újra"; setTimeout(() => { if (resetArmed) $("resetBtn").textContent = "Elölről"; resetArmed = 0; }, 4000);
    return false;
  }

  /* teacher shortcut: type the code anywhere and the whole worksheet fills in */
  let buf = "";
  document.addEventListener("keydown", e => {
    if (e.key.length !== 1) return;
    buf = (buf + e.key.toLowerCase()).slice(-8);
    if (buf === "bruinsma") {
      buf = ""; setTimeout(() => {
        if (g.editing) document.activeElement.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
        const all = {};
        CH.forEach(c => c.goals.forEach(goal => {
          if (!goal.range || !goal.ref) return;
          const rg = XL.rangeOf(goal.range);
          XL.cellsOf(rg).forEach(a => { const p = XL.parseA(a); all[a] = goal.model ? goal.model : XL.tidy(XL.shiftFormula(goal.ref, p.r - rg.r1, p.c - rg.c1)); });
        }));
        g.setMany(all, "dev");
        state.solved = CH.map((_, k) => k); state.dev = true; if (!state.end) state.end = Date.now(); state.cells = g.userCells(); save();
        goTo(CH.length - 1);
      }, 0);
    }
  }, true);

  /* ---------- a little joy: confetti and a chime ---------- */
  const fx = { c: $("fx"), parts: [], raf: 0 }; fx.ctx = fx.c.getContext("2d");
  const size = () => { const d = devicePixelRatio || 1; fx.c.width = innerWidth * d; fx.c.height = innerHeight * d; fx.ctx.setTransform(d, 0, 0, d, 0, 0); };
  size(); addEventListener("resize", size);
  const COLS = M.confetti || ["#107c41", "#f2d264", "#f0a3b8", "#7fa7ff", "#ff9e7a", "#a8dba0"];
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  function celebrate(x, y, n) {
    chime();
    if (reduced) return;
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

  /* ---------- start ---------- */
  XL.guardFormulas();
  goTo(Math.min(state.current, CH.length - 1), true);
})();
