/* digikult — Word missions done in the real Word.
   The student downloads a starter .docx and works in Word; after each chapter they save (Ctrl+S) and the page
   reads the saved file (here in the browser, nothing is sent anywhere) and checks that chapter's formatting.
   In Chrome and Edge the file is dropped once and later checks just re-read it; elsewhere it is dropped again.
   The page defines MISSION = {
     key, title, saveAs, doc: { …WD model of the starter file… },
     chapters: [{ title, refresher, story, learn, steps: [html], asks: [{ q, text: [..], num, traps, wrong }],
                  goals: [{ label, …DOCX.check goal…, apply(model, block) }], hints, success, upload }],
     ending: { title, text, rank(min, hints) }
   } */
(function () {
  "use strict";
  const M = window.MISSION, CH = M.chapters, KEY = M.key;
  const $ = id => document.getElementById(id);
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const NCH = CH.filter(c => !c.refresher).length;
  const chapNo = i => CH.slice(0, i + 1).filter(c => !c.refresher).length;
  const ALL = CH.flatMap(c => c.goals || []);

  let state = { solved: [], current: 0, start: Date.now(), end: null, hints: {}, answers: {}, reports: {}, marks: false };
  try { const s = JSON.parse(localStorage.getItem(KEY)); if (s && Array.isArray(s.solved)) state = Object.assign(state, s); } catch (e) {}
  state.solved = state.solved.filter(i => i >= 0 && i < CH.length);
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) {} };
  const isUnlocked = i => i === 0 || state.solved.includes(i - 1) || state.solved.includes(i);

  /* ---------- the preview: the starter file, with every solved chapter's formatting applied ---------- */
  const base = JSON.stringify(M.doc);
  const N = s => DOCX.normText(s);
  const blocksFor = (m, goal) => {
    const finds = goal.find === undefined ? [] : Array.isArray(goal.find) ? goal.find : [goal.find];
    return m.blocks.filter(b => !b.type && finds.some(f => goal.exact ? N(WD.textOf(b)) === N(f) : N(WD.textOf(b)).startsWith(N(f))));
  };
  function applyWant(b, w, goal) {
    const set = (k, v) => { b[k] = v; };
    if (w.noLeading) { const t = WD.textOf(b).replace(/^[ \t]+/, ""); b.runs = null; b.text = t; }
    if (w.noPrefix) { const t = WD.textOf(b).replace(new RegExp(w.noPrefix), ""); b.runs = null; b.text = t; }
    ["align", "left", "right", "firstLine", "line", "before", "after", "list"].forEach(k => { if (w[k] !== undefined) set(k, w[k]); });
    if (w.list) b.left = Math.max(b.left || 0, 0.63);
    if (w.box) set("box", true);
    if (w.bold) set("b", true); if (w.italic) set("i", true);
    if (w.size !== undefined) set("size", w.size); if (w.sizeMin !== undefined) set("size", goal.showSize || w.sizeMin);
    if (w.colored) set("color", goal.color || "#9c2a1a");
    if (b.runs) b.runs.forEach(r => { delete r.b; delete r.i; delete r.size; delete r.color; });
  }
  function model(targets) {
    const m = JSON.parse(base); m.marks = state.marks;
    state.solved.slice().sort((a, b) => a - b).forEach(i => (CH[i].goals || []).forEach(g => {
      if (g.apply) g.apply(m);
      else if (g.type === "noEmpty") m.blocks.forEach(b => { if (!b.type && !WD.textOf(b).trim() && !b.keep) b.hidden = true; });
      else blocksFor(m, g).forEach(b => applyWant(b, g.want || {}, g));
    }));
    (targets || []).forEach(g => { if (g.target) g.target(m); else blocksFor(m, g).forEach(b => b.target = true); });
    return m;
  }
  const preview = WD.page($("doc"), model());
  const paintPreview = () => { const c = CH[state.current]; preview.render(model(c.upload ? [] : c.goals || c.targets || [])); $("marksBtn").classList.toggle("on", !!state.marks); $("marksBtn").setAttribute("aria-pressed", !!state.marks); };
  $("marksBtn").addEventListener("click", () => { state.marks = !state.marks; save(); paintPreview(); });

  /* ---------- chapter strip ---------- */
  function renderSteps() {
    $("steps").innerHTML = CH.map((c, i) => {
      const cls = ["step"]; if (state.solved.includes(i)) cls.push("done"); if (i === state.current) cls.push("current"); if (!isUnlocked(i)) cls.push("locked");
      return `<button type="button" class="${cls.join(" ")}" data-i="${i}" ${isUnlocked(i) ? "" : 'aria-disabled="true"'} ${i === state.current ? 'aria-current="step"' : ""}>
        <span class="n">${c.refresher ? "Kezdés" : chapNo(i) + ". fejezet"}</span><span class="t">${esc(c.title)}</span></button>`;
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
    const i = state.current, c = CH[i], solved = state.solved.includes(i), shown = state.hints[i] || 0;
    const asks = (c.asks || []).map((q, k) => {
      const prev = (state.answers[i] || {})[k] || "";
      return `<div class="ask" data-k="${k}"><label for="ans${k}">${q.q}</label>
        <div class="ask-row"><input id="ans${k}" type="text" inputmode="${q.num !== undefined ? "decimal" : "text"}" autocomplete="off" spellcheck="false" value="${esc(prev)}" ${solved ? "disabled" : ""} placeholder="a válaszod"><span class="mark" aria-hidden="true"></span></div></div>`;
    }).join("");
    const goals = c.upload ? ALL : (c.goals || []);
    $("case").innerHTML = `
      <p class="chap">${c.refresher ? "Kezdés · mielőtt nekiállsz" : `${chapNo(i)}. fejezet a ${NCH}-ből`}</p>
      <h2>${esc(c.title)}</h2>
      <div class="story">${c.story}</div>
      ${c.learn ? `<div class="learn"><h3>${c.refresher ? "Emlékeztető" : c.isNew === false ? "Jó tudni" : "Új tudás"}</h3>${c.learn}</div>` : ""}
      <div class="task"><h3>Lépésről lépésre, a Wordben</h3><ol class="howto">${c.steps.map(s => `<li>${s}</li>`).join("")}</ol>
        ${c.asks ? `<form class="asks" id="askForm"><h3>Mit mutat a Word?</h3>${asks}
          <div class="btns"><button type="submit" class="btn primary" id="checkBtn"${solved ? " hidden" : ""}>Ellenőrzés</button>
          <button type="button" class="btn" id="hintBtn"${solved || shown >= (c.hints || []).length ? " hidden" : ""}>${shown ? "Még egy segítség" : "Segítség"}</button></div></form>`
        : `<div class="filecheck"><h3>${c.upload ? "Az egész fájl ellenőrzése" : "Ellenőrzés"}</h3>
          ${!c.upload ? `<ul class="goals" id="goalList">${goals.map((g, k) => `<li data-g="${k}"><span class="gt">${g.label}</span></li>`).join("")}</ul>` : ""}
          <div id="fileBox"></div>
          <div class="btns"><button type="button" class="btn" id="hintBtn"${solved || shown >= (c.hints || []).length ? " hidden" : ""}>${shown ? "Még egy segítség" : "Segítség"}</button></div></div>`}
        <div class="hints">${(c.hints || []).slice(0, shown).map((h, k) => `<div class="hint"><b>${k + 1}. segítség</b> ${h}</div>`).join("")}</div>
        <div id="report"></div>
        <div id="verdict" aria-live="polite"></div>
      </div>
      <div id="won">${solved ? wonHtml(i) : ""}</div>`;
    if (!c.asks) { paintFileBox(); const rep = state.reports[i]; if (rep) showReport(rep, c.upload); }
  }
  function wonHtml(i) {
    const c = CH[i], last = i === CH.length - 1;
    return `<div class="verdict ok"><b>${c.refresher ? "Rendben, mehetünk!" : "Stimmel!"}</b><p>${c.success}</p></div>
      ${last ? `<button type="button" class="btn primary big" id="toEnd">Tovább a befejezéshez</button>` : `<button type="button" class="btn primary big" id="next">${c.refresher ? "Kezdjük!" : "Következő fejezet"} →</button>`}`;
  }
  function goTo(i, quiet) {
    state.current = i; save();
    renderSteps(); renderCase(); paintPreview();
    if (!quiet && innerWidth < 1000) $("case").scrollIntoView({ behavior: "smooth", block: "start" });
  }
  function solve(i) {
    if (!state.solved.includes(i)) state.solved.push(i);
    if (i === CH.length - 1 && !state.end) state.end = Date.now();
    save(); renderSteps(); paintPreview();
    $("verdict").innerHTML = "";
    ["checkBtn", "hintBtn"].forEach(id => { const b = $(id); if (b) b.hidden = true; });
    document.querySelectorAll(".ask input").forEach(x => x.disabled = true);
    $("won").innerHTML = wonHtml(i);
    const r = $("won").getBoundingClientRect();
    celebrate(r.left + r.width / 2, r.top + 20, CH[i].refresher ? 30 : 60);
    if (innerWidth < 1000) $("won").scrollIntoView({ behavior: "smooth", block: "center" });
  }

  /* ---------- typed answers (the starting chapter) ---------- */
  const normText = s => String(s).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[\s.,\-–!?„”"']/g, "");
  const WORDS = { nulla: 0, egy: 1, ketto: 2, ket: 2, harom: 3, negy: 4, ot: 5, hat: 6, het: 7, nyolc: 8, kilenc: 9, tiz: 10 };
  const normNum = s => { const w = String(s).trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s*(db|darab)$/, ""); if (w in WORDS) return WORDS[w]; const t = String(s).replace(/[\s  ]/g, "").replace(/(db|darab|cm|pt|oldal)$/i, "").replace(",", "."); return /^-?\d+(\.\d+)?$/.test(t) ? parseFloat(t) : null; };
  function judge(q, raw) {
    if (!raw.trim()) return { ok: false, msg: "Még nem írtál be semmit." };
    if (q.num !== undefined) {
      const n = normNum(raw);
      if (n === null) return { ok: false, msg: "Csak a számot írd be." };
      if (Math.abs(n - q.num) < 1e-6) return { ok: true };
      for (const [k, m] of Object.entries(q.traps || {})) if (normNum(k) === n) return { ok: false, msg: m };
      return { ok: false, msg: q.wrong || "Ez nem stimmel. Nézd meg újra a Wordben!" };
    }
    const n = normText(raw);
    if (q.text.some(t => normText(t) === n)) return { ok: true };
    for (const [k, m] of Object.entries(q.traps || {})) if (normText(k) === n) return { ok: false, msg: m };
    /* a longer answer is fine if it names the right thing and none of the traps ("szóközök vannak előtte") */
    const hit = q.text.some(t => n.includes(normText(t))), trap = Object.entries(q.traps || {}).find(([k]) => normText(k).length > 2 && n.includes(normText(k)));
    if (hit && !trap) return { ok: true };
    if (trap) return { ok: false, msg: trap[1] };
    return { ok: false, msg: q.wrong || "Ez nem stimmel. Nézd meg újra a Wordben!" };
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

  /* ---------- the saved file ---------- */
  let handle = null;   /* FileSystemFileHandle (Chrome, Edge): drop once, check again with one click */
  const IDB = (mode, fn) => new Promise(ok => {
    try {
      const rq = indexedDB.open("digikult-word", 1);
      rq.onupgradeneeded = () => rq.result.createObjectStore("h");
      rq.onsuccess = () => { try { const tx = rq.result.transaction("h", mode), st = tx.objectStore("h"), r = fn(st); tx.oncomplete = () => ok(r && r.result); tx.onerror = () => ok(null); } catch (e) { ok(null); } };
      rq.onerror = () => ok(null);
    } catch (e) { ok(null); }
  });
  const keepHandle = h => { handle = h; IDB("readwrite", st => st.put(h, KEY)); };
  IDB("readonly", st => st.get(KEY)).then(h => { if (h && h.kind === "file") { handle = h; if (!CH[state.current].asks) paintFileBox(); } });

  function paintFileBox() {
    const box = $("fileBox"); if (!box) return;
    const solved = state.solved.includes(state.current);
    if (handle) {
      box.innerHTML = `<div class="linked"><svg class="ic" viewBox="0 0 40 46" aria-hidden="true"><path d="M4 2h22l10 10v32H4z" fill="#fff" stroke="#185abd" stroke-width="2"/><path d="M26 2v10h10" fill="#dbe7fb" stroke="#185abd" stroke-width="2"/><rect x="0" y="18" width="24" height="20" rx="2" fill="#185abd"/><path d="M5 23l3 10 4-8 4 8 3-10" fill="none" stroke="#fff" stroke-width="2.2" stroke-linejoin="round" stroke-linecap="round"/></svg>
        <p><b>${esc(handle.name)}</b><br>Mentsd el a Wordben (<span class='nw'><kbd>Ctrl</kbd>+<kbd>S</kbd></span>), aztán kattints az Ellenőrzésre.</p>
        <button type="button" class="btn primary" id="recheck"${solved ? " hidden" : ""}>Ellenőrzés</button><button type="button" class="linkbtn" id="otherFile">másik fájl</button></div>`;
    } else {
      box.innerHTML = `<div class="drop" id="drop" tabindex="0" role="button" aria-label="Fájl kiválasztása">
        <input type="file" id="fileIn" accept=".docx" hidden>
        <b>Mentsd el a Wordben (Ctrl+S), és húzd ide a fájlt</b><span>vagy kattints ide, és válaszd ki a mentett .docx fájlt</span></div>`;
    }
  }
  async function pick() {
    if (window.showOpenFilePicker) {
      try { const [h] = await showOpenFilePicker({ types: [{ description: "Word-dokumentum", accept: { "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"] } }] }); keepHandle(h); paintFileBox(); checkHandle(); }
      catch (e) { if (e && e.name !== "AbortError") $("fileIn") && $("fileIn").click(); }
    } else if ($("fileIn")) $("fileIn").click();
  }
  async function checkHandle() {
    try {
      if (handle.queryPermission && (await handle.queryPermission({ mode: "read" })) !== "granted" && (await handle.requestPermission({ mode: "read" })) !== "granted") throw new Error("perm");
      let f;
      try { f = await handle.getFile(); } catch (e1) { await new Promise(r => setTimeout(r, 600)); f = await handle.getFile(); }
      checkFile(f);
    } catch (e) {
      handle = null; IDB("readwrite", st => st.delete(KEY)); paintFileBox();
      $("report").innerHTML = `<div class="verdict no"><b>Nem érem el a fájlt.</b><p>Húzd ide újra a mentett fájlt.</p></div>`;
    }
  }
  async function checkFile(file) {
    const i = state.current, c = CH[i];
    $("report").innerHTML = `<p class="export-note">Ellenőrzöm: ${esc(file.name)}…</p>`;
    if (/\.doc$/i.test(file.name)) { $("report").innerHTML = `<div class="verdict no"><b>Ez régi Word-formátum (.doc).</b><p>Mentsd el .docx formátumban: Fájl › Mentés másként › Word-dokumentum (*.docx).</p></div>`; return; }
    if (!/\.docx$/i.test(file.name)) { $("report").innerHTML = `<div class="verdict no"><b>Ez nem Word-fájl.</b><p>A Wordben mentett .docx fájlt válaszd ki (pl. ${esc(M.saveAs)}).</p></div>`; return; }
    let doc;
    try { doc = await DOCX.read(await file.arrayBuffer()); }
    catch (e) { $("report").innerHTML = `<div class="verdict no"><b>Ezt a fájlt nem tudom megnyitni.</b><p>Mentsd el újra a Wordben (Fájl › Mentés), és próbáld újra.</p></div>`; return; }
    if (M.fingerprint && !DOCX.findParas(doc, M.fingerprint, { contains: true }).length) { $("report").innerHTML = `<div class="verdict no"><b>Ez nem a küldetés fájlja.</b><p>A letöltött ${esc(M.file)} fájlban dolgozz, és azt húzd ide.</p></div>`; return; }
    const goals = c.upload ? ALL : (c.goals || []);
    const rows = goals.map(g => { const r = DOCX.check(doc, g); return { label: g.label, ok: r.ok, done: r.done, total: r.total, msg: r.msg }; });
    const report = { name: file.name, at: Date.now(), rows };
    state.reports[i] = report; save(); showReport(report, c.upload);
    if (rows.every(r => r.ok)) solve(i); else buzz();
  }
  function showReport(rep, full) {
    const good = rep.rows.filter(r => r.ok).length;
    const time = new Date(rep.at).toLocaleTimeString("hu-HU", { hour: "2-digit", minute: "2-digit" });
    if (!full) {
      rep.rows.forEach((r, k) => {
        const li = document.querySelector(`#goalList li[data-g="${k}"]`); if (!li) return;
        li.classList.toggle("ok", r.ok); li.classList.toggle("no", !r.ok);
        li.querySelector(".gt").innerHTML = `${CH[state.current].goals[k].label}${r.ok ? "" : `<small>${esc(r.msg)}</small>`}`;
      });
      $("report").innerHTML = good < rep.rows.length ? `<p class="export-note">${esc(rep.name)}, ${time}: ${good} / ${rep.rows.length} rendben. Javítsd ki a Wordben, mentsd el, és ellenőrizd újra.</p>` : "";
      return;
    }
    $("report").innerHTML = `<p class="rep-head"><b>${esc(rep.name)}</b>: ${good} / ${rep.rows.length} rész rendben</p>
      <ul class="goals report">${rep.rows.map(r => `<li class="${r.ok ? "ok" : "no"}"><span class="gt">${r.label}${r.ok ? "" : `<small>${esc(r.msg)}</small>`}</span><span class="cnt">${r.total > 1 ? `${r.done} / ${r.total}` : ""}</span></li>`).join("")}</ul>
      ${good < rep.rows.length ? `<p class="export-note">Javítsd ki a Wordben, mentsd el (<span class='nw'><kbd>Ctrl</kbd>+<kbd>S</kbd></span>), és ellenőrizd újra.</p>` : ""}`;
  }
  $("case").addEventListener("click", e => {
    if (e.target.id === "recheck") checkHandle();
    else if (e.target.id === "otherFile") { handle = null; IDB("readwrite", st => st.delete(KEY)); paintFileBox(); }
    else if (e.target.closest("#drop")) pick();
  });
  $("case").addEventListener("keydown", e => { if (e.target.id === "drop" && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); pick(); } });
  $("case").addEventListener("change", e => { if (e.target.id === "fileIn" && e.target.files[0]) checkFile(e.target.files[0]); });
  $("case").addEventListener("dragover", e => { const d = e.target.closest("#drop, .linked"); if (d) { e.preventDefault(); d.classList.add("over"); } });
  $("case").addEventListener("dragleave", e => { const d = e.target.closest("#drop, .linked"); if (d) d.classList.remove("over"); });
  $("case").addEventListener("drop", async e => {
    const d = e.target.closest("#drop, .linked"); if (!d) return;
    e.preventDefault(); d.classList.remove("over");
    const it = e.dataTransfer.items && e.dataTransfer.items[0], f = e.dataTransfer.files[0];
    if (it && it.getAsFileSystemHandle) { try { const h = await it.getAsFileSystemHandle(); if (h && h.kind === "file" && /\.docx$/i.test(h.name)) { keepHandle(h); paintFileBox(); } } catch (err) {} }
    if (f) checkFile(f);
  });

  /* ---------- the end ---------- */
  function showEnd() {
    const mins = Math.max(1, Math.round(((state.end || Date.now()) - state.start) / 60000));
    const hints = Object.values(state.hints).reduce((s, n) => s + n, 0);
    const last = state.reports[CH.length - 1];
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
          <ol class="export-steps"><li>Nyisd meg a feladatot a <b>Google Classroomban</b>.</li><li>Töltsd fel az elmentett Word-fájlodat (${esc(last ? last.name : M.saveAs)}).</li><li>Kattints a <b>Beadás</b> gombra.</li></ol>
        </div>
        <div class="end-btns"><button type="button" class="btn" id="backToDoc">← Vissza a fejezetekhez</button>${M.next ? `<a class="btn primary" href="${M.next.href}">${esc(M.next.text)} →</a>` : ""}</div>
      </div>`;
    const r = $("endPanel").getBoundingClientRect();
    scrollTo({ top: scrollY + r.top - 70, behavior: "smooth" });
    setTimeout(() => { for (let k = 0; k < 5; k++) setTimeout(() => celebrate(innerWidth * (0.15 + Math.random() * 0.7), innerHeight * (0.15 + Math.random() * 0.3), 70), k * 350); }, 200);
    fanfare();
  }
  $("endPanel").addEventListener("click", e => { if (e.target.id === "backToDoc") { $("endPanel").hidden = true; $("game").hidden = false; goTo(CH.length - 1); } });

  /* ---------- header: timer, sound, start again ---------- */
  const fmtTime = ms => { const m = Math.floor(ms / 60000), s = Math.floor(ms / 1000) % 60; return `${m}:${String(s).padStart(2, "0")}`; };
  function tick() { $("timer").textContent = fmtTime((state.end || Date.now()) - state.start); }
  setInterval(tick, 1000); tick();
  let soundOn = true; try { soundOn = localStorage.getItem("digikult-word-sound") !== "off"; } catch (e) {}
  const paintSound = () => { $("soundBtn").textContent = soundOn ? "Hang: be" : "Hang: ki"; $("soundBtn").setAttribute("aria-pressed", soundOn); };
  $("soundBtn").addEventListener("click", () => { soundOn = !soundOn; paintSound(); try { localStorage.setItem("digikult-word-sound", soundOn ? "on" : "off"); } catch (e) {} });
  paintSound();
  let resetArmed = 0;
  $("resetBtn").addEventListener("click", () => {
    if (Date.now() - resetArmed > 4000) { resetArmed = Date.now(); $("resetBtn").textContent = "Biztos? Kattints újra"; setTimeout(() => { $("resetBtn").textContent = "Elölről"; }, 4000); return; }
    resetArmed = 0; $("resetBtn").textContent = "Elölről";
    state = { solved: [], current: 0, start: Date.now(), end: null, hints: {}, answers: {}, reports: {}, marks: false };
    handle = null; IDB("readwrite", st => st.delete(KEY));
    save(); $("endPanel").hidden = true; $("game").hidden = false; goTo(0);
  });

  /* teacher shortcut: type the code anywhere and every chapter opens, with the finished document in the preview */
  let buf = "";
  document.addEventListener("keydown", e => {
    if (e.key.length !== 1) return;
    buf = (buf + e.key.toLowerCase()).slice(-8);
    if (buf === "bruinsma") { buf = ""; state.solved = CH.map((_, k) => k); state.dev = true; if (!state.end) state.end = Date.now(); save(); goTo(CH.length - 1); }
  }, true);

  /* ---------- confetti and a chime ---------- */
  const fx = { c: $("fx"), parts: [], raf: 0 }; fx.ctx = fx.c.getContext("2d");
  const size = () => { const d = devicePixelRatio || 1; fx.c.width = innerWidth * d; fx.c.height = innerHeight * d; fx.ctx.setTransform(d, 0, 0, d, 0, 0); };
  size(); addEventListener("resize", size);
  const COLS = M.confetti || ["#185abd", "#f2d264", "#f0a3b8", "#7fa7ff", "#ff9e7a", "#a8dba0"];
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

  goTo(Math.min(state.current, CH.length - 1), true);
})();
