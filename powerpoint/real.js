/* digikult — PowerPoint missions done in the real PowerPoint.
   The student works in PowerPoint; the page gives the steps, asks what PowerPoint shows, and at the end
   checks the saved .pptx itself (shapes, colours, groups, animations) with pptx.js.
   The page defines MISSION = {
     key, title, saveAs, file (starter .pptx, optional), slide (SVG markup of the target slide),
     chapters: [{ title, refresher, story, learn, isNew, steps: [html], asks: [{ q, text: [..] | num, traps: { answer: msg }, wrong }],
                  hints, success, upload }],
     checks: [{ label, test(deck) → true | "what is wrong" }],
     play (optional): the animation steps the preview can play (see anim.js), ending: { title, text, rank(min, hints) }
   }
   In the slide picture, an element with data-ch="k" shows up from chapter k on, data-until="k" disappears from chapter k on,
   and data-hl="k" glows in chapter k. */
(function () {
  "use strict";
  const M = window.MISSION, CH = M.chapters, KEY = M.key;
  const $ = id => document.getElementById(id);
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const NCH = CH.filter(c => !c.refresher).length;
  const chapNo = i => CH.slice(0, i + 1).filter(c => !c.refresher).length;

  let state = { solved: [], current: 0, start: Date.now(), end: null, hints: {}, answers: {} };
  try { const s = JSON.parse(localStorage.getItem(KEY)); if (s && Array.isArray(s.solved)) state = Object.assign(state, s); } catch (e) {}
  state.solved = state.solved.filter(i => i >= 0 && i < CH.length);
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) {} };
  const isUnlocked = i => i === 0 || state.solved.includes(i - 1) || state.solved.includes(i);

  /* ---------- the slide on the right: how it should look so far ---------- */
  const stage = $("slide");
  stage.innerHTML = M.slide;
  if ($("clickHint")) stage.appendChild($("clickHint"));
  function paintSlide() {
    const i = state.current, ghost = !!(M.ghostStart && CH[i].refresher), upto = CH[i].upload || ghost ? CH.length : i;
    stage.classList.toggle("ghost", ghost);
    stage.querySelectorAll("[data-ch],[data-until]").forEach(el => {
      const on = (el.dataset.ch === undefined || +el.dataset.ch <= upto) && (el.dataset.until === undefined || upto < +el.dataset.until);
      el.style.display = on ? "" : "none";
    });
    stage.querySelectorAll("[data-hl]").forEach(el => el.classList.toggle("hl", el.dataset.hl.split(" ").includes(String(i)) && !CH[i].upload));
    if (window.ANIM && M.play) {
      const steps = M.play.filter(s => s.ch <= upto);
      ANIM.reset(stage);
      $("pane").innerHTML = ANIM.paneHtml(steps, M.names || {});
      $("playBtn").disabled = !steps.length;
    }
  }
  if (window.ANIM && M.play && $("playBtn")) {
    $("playBtn").addEventListener("click", () => {
      const i = state.current, upto = CH[i].upload ? CH.length : i;
      ANIM.play(stage, M.play.filter(s => s.ch <= upto), { pane: $("pane"), hint: $("clickHint") });
    });
  }

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
        <div class="ask-row"><input id="ans${k}" type="text" inputmode="${q.num !== undefined ? "decimal" : "text"}" autocomplete="off" spellcheck="false" value="${esc(prev)}" ${solved ? "disabled" : ""} placeholder="${q.num !== undefined ? "egy szám" : "a válaszod"}"><span class="mark" aria-hidden="true"></span></div></div>`;
    }).join("");
    $("case").innerHTML = `
      <p class="chap">${c.refresher ? "Kezdés · mielőtt nekiállsz" : `${chapNo(i)}. fejezet a ${NCH}-ből`}</p>
      <h2>${esc(c.title)}</h2>
      <div class="story">${c.story}</div>
      ${c.learn ? `<div class="learn"><h3>${c.refresher ? "Emlékeztető" : c.isNew === false ? "Jó tudni" : "Új tudás"}</h3>${c.learn}</div>` : ""}
      <div class="task"><h3>Lépésről lépésre, a PowerPointban</h3><ol class="howto">${c.steps.map(s => `<li>${s}</li>`).join("")}</ol>
        ${c.upload ? uploadHtml() : `<form class="asks" id="askForm"><h3>Mit látsz a PowerPointban?</h3>${asks}
          <div class="btns"><button type="submit" class="btn primary" id="checkBtn"${solved ? " hidden" : ""}>Ellenőrzés</button>
          <button type="button" class="btn" id="hintBtn"${solved || shown >= (c.hints || []).length ? " hidden" : ""}>${shown ? "Még egy segítség" : "Segítség"}</button></div></form>`}
        <div class="hints">${(c.hints || []).slice(0, shown).map((h, k) => `<div class="hint"><b>${k + 1}. segítség</b> ${h}</div>`).join("")}</div>
        <div id="verdict" aria-live="polite"></div>
      </div>
      <div id="won">${solved ? wonHtml(i) : ""}</div>`;
    if (c.upload && state.report) showReport(state.report);
  }
  function wonHtml(i) {
    const c = CH[i], last = i === CH.length - 1;
    return `<div class="verdict ok"><b>${c.refresher ? "Rendben, mehetünk!" : "Stimmel!"}</b><p>${c.success}</p></div>
      ${last ? `<button type="button" class="btn primary big" id="toEnd">Tovább a befejezéshez</button>` : `<button type="button" class="btn primary big" id="next">${c.refresher ? "Kezdjük!" : "Következő fejezet"} →</button>`}`;
  }
  function goTo(i, quiet) {
    state.current = i; save();
    renderSteps(); renderCase(); paintSlide();
    if (!quiet && innerWidth < 1000) $("case").scrollIntoView({ behavior: "smooth", block: "start" });
  }
  function solve(i) {
    if (!state.solved.includes(i)) state.solved.push(i);
    if (i === CH.length - 1 && !state.end) state.end = Date.now();
    save(); renderSteps();
    $("verdict").innerHTML = "";
    const cb = $("checkBtn"), hb = $("hintBtn"); if (cb) cb.hidden = true; if (hb) hb.hidden = true;
    document.querySelectorAll(".ask input").forEach(x => x.disabled = true);
    $("won").innerHTML = wonHtml(i);
    const r = $("won").getBoundingClientRect();
    celebrate(r.left + r.width / 2, r.top + 20, CH[i].refresher ? 30 : 60);
    if (innerWidth < 1000) $("won").scrollIntoView({ behavior: "smooth", block: "center" });
  }

  /* ---------- typed answers ---------- */
  const normText = s => String(s).toLowerCase().normalize("NFC").replace(/[\s.\-–!?,„”"']/g, "");
  const normNum = s => { const t = String(s).replace(/[\s  ]/g, "").replace(/(db|darab|pt|pont|mp|másodperc|s)$/i, "").replace(",", "."); return /^-?\d+(\.\d+)?$/.test(t) ? parseFloat(t) : null; };
  function judge(q, raw) {
    if (!raw.trim()) return { ok: false, msg: "Még nem írtál be semmit." };
    if (q.num !== undefined) {
      const n = normNum(raw);
      if (n === null) return { ok: false, msg: "Csak egy számot írj be." };
      if (Math.abs(n - q.num) < 1e-6) return { ok: true };
      for (const [k, m] of Object.entries(q.traps || {})) { const t = normNum(k); if (t !== null && Math.abs(n - t) < 1e-6) return { ok: false, msg: m }; }
      return { ok: false, msg: q.wrong || "Ez nem stimmel. Nézd meg újra a PowerPointban!" };
    }
    const n = normText(raw);
    if (q.text.some(t => normText(t) === n)) return { ok: true };
    for (const [k, m] of Object.entries(q.traps || {})) if (normText(k) === n) return { ok: false, msg: m };
    return { ok: false, msg: q.wrong || "Ez nem stimmel. Nézd meg újra a PowerPointban!" };
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
    $("verdict").innerHTML = `<div class="verdict no"><b>Még nem stimmel.</b><p>${first}</p></div>`;
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
        <input type="file" id="fileIn" accept=".pptx" hidden>
        <b>Húzd ide az elmentett .pptx fájlodat</b><span>vagy kattints, és válaszd ki</span></div>
      <div id="report"></div>`;
  }
  async function checkFile(file) {
    $("report").innerHTML = `<p class="export-note">Ellenőrzöm: ${esc(file.name)}…</p>`;
    if (/\.ppt$/i.test(file.name)) { $("report").innerHTML = `<div class="verdict no"><b>Ez a régi PowerPoint-formátum (.ppt).</b><p>Mentsd el újra: <b>Fájl › Mentés másként</b>, és a fájltípus legyen <b>PowerPoint-bemutató (*.pptx)</b>.</p></div>`; return; }
    if (!/\.pptx$/i.test(file.name)) { $("report").innerHTML = `<div class="verdict no"><b>Ez nem PowerPoint-fájl.</b><p>A PowerPointban mentett .pptx fájlt válaszd ki (pl. ${esc(M.saveAs)}).</p></div>`; return; }
    if (!("DecompressionStream" in window)) { $("report").innerHTML = `<div class="verdict no"><b>Ez a böngésző túl régi.</b><p>Nyisd meg az oldalt egy frissebb Chrome-ban vagy Edge-ben, és próbáld újra.</p></div>`; return; }
    let deck;
    try { deck = await PPTX.read(file); }
    catch (e) { $("report").innerHTML = `<div class="verdict no"><b>Ezt a fájlt nem tudom megnyitni.</b><p>Zárd be a fájlt a PowerPointban, vagy mentsd el újra (<b>Fájl › Mentés</b>), és próbáld újra.</p></div>`; return; }
    const rows = M.checks.map(ch => {
      let r; try { r = ch.test(deck); } catch (e) { r = "Ezt a részt nem sikerült megnézni."; }
      return { label: ch.label, ok: r === true, msg: r === true ? "" : String(r) };
    });
    const report = { name: file.name, at: Date.now(), rows };
    state.report = report; save(); showReport(report);
    if (rows.every(r => r.ok)) solve(state.current); else buzz();
  }
  function showReport(rep) {
    const good = rep.rows.filter(r => r.ok).length;
    $("report").innerHTML = `<p class="rep-head"><b>${esc(rep.name)}</b>: ${good} / ${rep.rows.length} rész rendben</p>
      <ul class="goals report">${rep.rows.map(r => `<li class="${r.ok ? "ok" : ""}"><span class="gt">${r.label}${r.ok ? "" : `<small>${r.msg}</small>`}</span></li>`).join("")}</ul>
      ${good < rep.rows.length ? `<p class="export-note">Javítsd ki a PowerPointban, mentsd el (<kbd>Ctrl</kbd>+<kbd>S</kbd>), és húzd ide újra.</p>` : ""}`;
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
        <ul class="stats"><li><b>${NCH}</b> fejezet</li><li><b>${mins}</b> perc</li><li><b>${hints}</b> segítség</li></ul>
        ${M.ending.rank ? `<p class="rank">${M.ending.rank(mins, hints)}</p>` : ""}
        <div class="export">
          <h3>Add be a munkádat</h3>
          <ol class="export-steps"><li>Nyisd meg a feladatot a <b>Google Classroomban</b>.</li><li>Töltsd fel az elmentett PowerPoint-fájlodat (${esc(state.report ? state.report.name : M.saveAs)}).</li><li>Kattints a <b>Beadás</b> gombra.</li></ol>
        </div>
        <div class="end-btns"><button type="button" class="btn" id="backToSheet">← Vissza a fejezetekhez</button>${M.next ? `<a class="btn primary" href="${M.next.href}">${esc(M.next.text)} →</a>` : ""}</div>
      </div>`;
    const r = $("endPanel").getBoundingClientRect();
    scrollTo({ top: scrollY + r.top - 70, behavior: "smooth" });
    setTimeout(() => { for (let k = 0; k < 5; k++) setTimeout(() => celebrate(innerWidth * (0.15 + Math.random() * 0.7), innerHeight * (0.15 + Math.random() * 0.3), 70), k * 350); }, 200);
    fanfare();
  }
  $("endPanel").addEventListener("click", e => { if (e.target.id === "backToSheet") { $("endPanel").hidden = true; $("game").hidden = false; goTo(CH.length - 1); } });

  /* ---------- header: timer, sound, start again ---------- */
  const fmtTime = ms => { const m = Math.floor(ms / 60000), s = Math.floor(ms / 1000) % 60; return `${m}:${String(s).padStart(2, "0")}`; };
  function tick() { $("timer").textContent = fmtTime((state.end || Date.now()) - state.start); }
  setInterval(tick, 1000); tick();
  let soundOn = true; try { soundOn = localStorage.getItem("digikult-ppt-sound") !== "off"; } catch (e) {}
  const paintSound = () => { $("soundBtn").textContent = soundOn ? "Hang: be" : "Hang: ki"; $("soundBtn").setAttribute("aria-pressed", soundOn); };
  $("soundBtn").addEventListener("click", () => { soundOn = !soundOn; paintSound(); try { localStorage.setItem("digikult-ppt-sound", soundOn ? "on" : "off"); } catch (e) {} });
  paintSound();
  let resetArmed = 0;
  $("resetBtn").addEventListener("click", () => {
    if (Date.now() - resetArmed > 4000) { resetArmed = Date.now(); $("resetBtn").textContent = "Biztos? Kattints újra"; $("resetBtn").classList.add("armed"); setTimeout(() => { $("resetBtn").textContent = "Újrakezdés"; $("resetBtn").classList.remove("armed"); }, 4000); return; }
    resetArmed = 0; $("resetBtn").textContent = "Újrakezdés"; $("resetBtn").classList.remove("armed");
    state = { solved: [], current: 0, start: Date.now(), end: null, hints: {}, answers: {} };
    save(); $("endPanel").hidden = true; $("game").hidden = false; goTo(0);
  });

  /* teacher shortcut: type the code anywhere and every chapter opens */
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
  const COLS = M.confetti || ["#c43e1c", "#f2d264", "#f0a3b8", "#7fa7ff", "#ff9e7a", "#a8dba0"];
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
