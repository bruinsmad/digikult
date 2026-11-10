/* digikult — official érettségi spreadsheet tasks, done in Excel (or any spreadsheet program).
   Every chapter is one részfeladat, shown word for word as on the official feladatlap. The student
   saves the file in Excel and the page checks that részfeladat in the saved .xlsx (values, formulas,
   number formats, fonts, borders, alignment, merges, charts). The next részfeladat opens only when
   the check passes. In Chrome and Edge the page keeps the chosen file, so after the first pick a click
   on Ellenőrzés re-reads the saved file. The Feladatlap button shows (and prints) the whole sheet.

   The page defines EXAM = {
     key, title, number, subject, level, date, code, points, saveAs, sheets,
     files: [{ name, href }], minta: [{ src, caption, label }],
     intro, lead, rules: [html], introFirst,                       word for word
     tasks: [{ n, title, text, before, ctx, tips: [html], hints: [html], done }],
     checks: [{ task, label, run: F => ({ ok, msg, done, total }) }]   task 0 = the whole file only
   } */
(function () {
  "use strict";
  const X = window.EXAM, T = X.tasks, KEY = X.key;
  const $ = id => document.getElementById(id);
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const CH = [{ start: true, title: "A feladat" }].concat(T.map(t => Object.assign({ task: true }, t)), [{ upload: true, title: "A teljes fájl" }]);
  const LAST = CH.length - 1;
  const checksOf = c => c.upload ? X.checks : X.checks.filter(k => k.task === c.n);

  let state = { solved: [], current: 0, start: Date.now(), end: null, hints: {}, reports: {} };
  try { const s = JSON.parse(localStorage.getItem(KEY)); if (s && Array.isArray(s.solved)) state = Object.assign(state, s); } catch (e) {}
  state.solved = state.solved.filter(i => i >= 0 && i < CH.length); state.reports = state.reports || {};
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) {} };
  const isDone = i => state.solved.includes(i);
  const isUnlocked = i => i === 0 || isDone(i) || isDone(i - 1);
  if (!(state.current >= 0 && state.current < CH.length) || !isUnlocked(state.current)) state.current = Math.max(0, ...state.solved.map(i => Math.min(i + 1, LAST)).filter(isUnlocked), 0);

  /* ---------- the feladatlap, word for word ---------- */
  const taskHtml = t => `${t.before ? `<div class="pp between">${t.before}</div>` : ""}<div class="pp item"><span class="no">${t.n}.</span><div class="tx">${t.text}</div></div>`;
  const rulesHtml = () => `<div class="pp">${X.lead}</div><ul class="pp rules">${X.rules.map(r => `<li>${r}</li>`).join("")}</ul>`;
  const headHtml = () => X.introFirst ? X.intro + rulesHtml() : rulesHtml() + X.intro;
  const mintaHtml = big => X.minta.map(m => `${m.caption ? `<p class="pp mcap">${m.caption}</p>` : ""}
      <figure class="minta"><button type="button" class="zoom" data-src="${m.src}" aria-label="Minta nagyítása"><img src="${m.src}" alt="${esc(m.alt || "Minta")}" loading="${big ? "eager" : "lazy"}"></button>
      ${m.label ? `<figcaption>${m.label}</figcaption>` : ""}</figure>`).join("");
  $("sheetView").innerHTML = `<div class="sv-bar"><b>Feladatlap</b><span>a hivatalos feladatlap szövege, szó szerint</span>
      <button type="button" class="btn" id="printBtn">Nyomtatás / PDF</button><button type="button" class="btn primary" id="closeSheet">Bezárás</button></div>
    <article class="paper" id="paper">
      <p class="src">${esc(X.subject)} · ${esc(X.level)} · ${esc(X.date)}${X.code ? ` · ${esc(X.code)}` : ""}</p>
      <h2 class="ptitle">${X.number}. ${esc(X.title)}</h2>${headHtml()}
      ${T.map(taskHtml).join("")}<p class="pts">${X.points} pont</p>${mintaHtml(true)}
      <p class="src foot">Forrás: Oktatási Hivatal, ${esc(X.subject)} ${esc(X.level)}ű gyakorlati vizsga${X.code ? `, ${esc(X.code)}` : ""}, ${esc(X.date)}. A feladat szövege és a minta a hivatalos feladatlapról való.</p>
    </article>`;
  const openSheet = () => { $("sheetView").hidden = false; document.body.classList.add("sv-open"); $("closeSheet").focus(); };
  const closeSheet = () => { $("sheetView").hidden = true; document.body.classList.remove("sv-open"); };
  $("sheetBtn").addEventListener("click", openSheet);
  $("sheetView").addEventListener("click", e => { if (e.target.id === "closeSheet") closeSheet(); if (e.target.id === "printBtn") window.print(); });
  document.addEventListener("keydown", e => { if (e.key === "Escape") { if (!$("lightbox").hidden) $("lightbox").hidden = true; else if (!$("sheetView").hidden) closeSheet(); } });
  $("mintaBox").innerHTML = mintaHtml(false);
  document.addEventListener("click", e => {
    const z = e.target.closest(".zoom"); if (z) { $("lightbox").innerHTML = `<img src="${z.dataset.src}" alt="Minta, nagyítva"><p>Kattints bárhova a bezáráshoz.</p>`; $("lightbox").hidden = false; return; }
    if (e.target.closest("#lightbox")) $("lightbox").hidden = true;
  });
  $("dlBox").innerHTML = X.files.map(f => `<div class="dlcard"><svg class="ic" viewBox="0 0 40 46" aria-hidden="true"><path d="M4 2h22l10 10v32H4z" fill="#fff" stroke="currentColor" stroke-width="2"/><path d="M26 2v10h10" fill="none" stroke="currentColor" stroke-width="2"/><path d="M10 22h20M10 28h20M10 34h14" stroke="currentColor" stroke-width="2"/></svg>
      <p><b>${esc(f.name)}</b><br>A hivatalos forrásfájl. Ebből dolgozol.</p><a class="btn primary" href="${f.href}" download>Letöltés</a></div>`).join("");

  /* ---------- chapter strip ---------- */
  function renderSteps() {
    $("steps").innerHTML = CH.map((c, i) => {
      const cls = ["step"]; if (isDone(i)) cls.push("done"); if (i === state.current) cls.push("current"); if (!isUnlocked(i)) cls.push("locked");
      return `<button type="button" class="${cls.join(" ")}" data-i="${i}" ${isUnlocked(i) ? "" : 'aria-disabled="true" title="Előbb oldd meg az előző részfeladatot!"'} ${i === state.current ? 'aria-current="step"' : ""}>
        <span class="n">${c.start ? "Kezdés" : c.upload ? "Vége" : c.n + "."}</span><span class="t">${esc(c.title)}</span></button>`;
    }).join("");
    $("solvedCount").textContent = `${state.solved.filter(i => i > 0).length} / ${LAST}`;
  }
  $("steps").addEventListener("click", e => {
    const b = e.target.closest(".step"); if (!b) return;
    const i = +b.dataset.i;
    if (!isUnlocked(i)) { b.classList.remove("shake"); void b.offsetWidth; b.classList.add("shake"); toast("Ez még zárva van: előbb oldd meg az előző részfeladatot, és ellenőriztesd a fájlodat!"); return; }
    goTo(i);
  });

  /* ---------- one chapter ---------- */
  function checkBox(i) {
    const c = CH[i], rep = state.reports[i], picked = fileLabel();
    const rows = checksOf(c).map((k, j) => { const r = rep && rep.rows[j];
      return `<li class="${r && r.ok ? "ok" : ""}"><span class="gt">${c.upload ? `<span class="tn">${k.task}.</span> ` : ""}${k.label}${r && !r.ok ? `<small>${esc(r.msg || "Ez még nincs meg a fájlban.")}</small>` : ""}</span><span class="cnt">${r && r.total > 1 ? `${r.done} / ${r.total}` : ""}</span></li>`; }).join("");
    return `<div class="checkbox"><h3>${c.upload ? "Az egész fájl ellenőrzése" : "Ellenőrzés: ezt nézi meg az oldal a fájlodban"}</h3>
        <ul class="goals report">${rows}</ul>
        ${rep && rep.nameOk === false ? `<p class="export-note warn">A fájl neve <b>${esc(rep.name)}</b>, de a feladat szerint <b>${esc(X.saveAs.replace(/\.xlsx$/, ""))}</b> legyen. A vizsgán ezt is pontozzák!</p>` : ""}
        ${isDone(i) ? "" : `<p class="howcheck">Mentsd el a fájlt az Excelben (<kbd>Ctrl</kbd>+<kbd>S</kbd>), aztán kattints az <b>Ellenőrzés</b> gombra${picked ? "" : ", és válaszd ki a mentett fájlodat"}. A fájlt ide is behúzhatod.</p>
        <div class="btns"><button type="button" class="btn primary" id="checkBtn">Ellenőrzés${picked ? `: ${esc(picked)}` : ""}</button>
          ${picked ? `<button type="button" class="btn" id="pickBtn">Másik fájl</button>` : ""}
          ${!c.upload && c.hints && (state.hints[i] || 0) < c.hints.length ? `<button type="button" class="btn" id="hintBtn">${state.hints[i] ? "Még egy segítség" : "Segítség"}</button>` : ""}</div>`}
        <input type="file" id="fileIn" accept=".xlsx" hidden>
        <div id="verdict" aria-live="polite"></div></div>`;
  }
  function renderCase() {
    const i = state.current, c = CH[i], solved = isDone(i);
    let body;
    if (c.start) {
      body = `<p class="chap">${esc(X.subject)} · ${esc(X.level)} · ${esc(X.date)}</p><h2>${X.number}. ${esc(X.title)}</h2>
        <div class="paper inline">${headHtml()}</div>
        <div class="learn"><h3>Hogyan dolgozz ezen az oldalon?</h3><ul>
          <li>Minden fejezet egy részfeladat, <b>szó szerint</b> a hivatalos feladatlapról. Az Excelben (táblázatkezelőben) oldod meg, sorban.</li>
          <li>Ha kész egy részfeladat, mentsd el a fájlt, és kattints az <b>Ellenőrzés</b> gombra: az oldal megnézi a mentett fájlodat. A következő részfeladat csak akkor nyílik meg, ha minden stimmel.</li>
          <li>Chrome-ban és Edge-ben elég egyszer kiválasztani a fájlt: utána mentés után csak az Ellenőrzésre kell kattintanod.</li>
          <li>A teljes feladatlapot a <b>Feladatlap</b> gombbal egyben is megnézheted vagy kinyomtathatod. A vizsgán ${X.points} pontot ér, nagyjából 45–50 perc jut rá.</li></ul></div>
        <div class="task"><h3>A forrásfájl</h3><p>${X.files.map(f => `<a class="btn primary" href="${f.href}" download>${esc(f.name)} letöltése</a>`).join(" ")}</p>
          <div class="btns"><button type="button" class="btn primary big" id="startBtn">${solved ? "Tovább az 1. részfeladathoz" : "Elolvastam, kezdjük!"} →</button></div></div>`;
    } else if (c.upload) {
      body = `<p class="chap">Utolsó lépés</p><h2>A teljes fájl ellenőrzése</h2>
        <div class="story"><p>Minden részfeladat megvan. Most az oldal még egyszer, egyben megnézi a kész fájlt (${esc(X.saveAs)}): ugyanazt, amit a javító tanár is látni fog.</p></div>
        <div class="task">${checkBox(i)}</div>`;
    } else {
      const shown = state.hints[i] || 0;
      body = `<p class="chap">${c.n}. részfeladat a ${T.length}-ből</p><h2>${esc(c.title)}</h2>
        <div class="paper inline">${c.ctx ? `<div class="pp between">${c.ctx}</div>` : ""}${taskHtml(c)}</div>
        ${c.tips ? `<div class="learn"><h3>Hogyan kezdj neki?</h3><ul>${c.tips.map(s => `<li>${s}</li>`).join("")}</ul></div>` : ""}
        <div class="task">${checkBox(i)}
        <div class="hints">${(c.hints || []).slice(0, shown).map((h, k) => `<div class="hint"><b>${k + 1}. segítség</b> ${h}</div>`).join("")}</div></div>`;
    }
    $("case").innerHTML = body + `<div id="won">${solved && !c.start ? wonHtml(i) : ""}</div>`;
  }
  function wonHtml(i) {
    const c = CH[i];
    if (c.upload) return `<div class="verdict ok"><b>Kész a feladat!</b><p>Minden ellenőrzés rendben.</p></div><button type="button" class="btn primary big" id="toEnd">Tovább a befejezéshez →</button>`;
    return `<div class="verdict ok"><b>Stimmel!</b>${c.done ? `<p>${c.done}</p>` : ""}</div>
      <button type="button" class="btn primary big" id="next">${i + 1 === LAST ? "Tovább: az egész fájl ellenőrzése" : `Tovább: ${CH[i + 1].n}. részfeladat`} →</button>`;
  }
  function goTo(i) {
    if (!isUnlocked(i)) return;
    state.current = i; save(); renderSteps(); renderCase();
    if (innerWidth < 1000) $("case").scrollIntoView({ behavior: "smooth", block: "start" });
    else scrollTo({ top: Math.min(scrollY, $("steps").offsetTop - 70), behavior: "smooth" });
  }
  function solve(i) {
    if (!isDone(i)) state.solved.push(i);
    if (i === LAST && !state.end) state.end = Date.now();
    save(); renderSteps(); renderCase();
    const r = $("won").getBoundingClientRect();
    celebrate(r.left + r.width / 2, r.top + 20, i === LAST ? 90 : 50);
    if (innerWidth < 1000) $("won").scrollIntoView({ behavior: "smooth", block: "center" });
  }
  function toast(msg) {
    let t = $("xtoast"); if (!t) { t = document.createElement("div"); t.id = "xtoast"; t.setAttribute("role", "status"); document.body.appendChild(t); }
    t.textContent = msg; t.classList.add("on"); clearTimeout(t._h); t._h = setTimeout(() => t.classList.remove("on"), 3200);
  }

  /* ---------- getting the saved file: kept between checks where the browser allows it ---------- */
  let handle = null;
  const fileLabel = () => handle ? handle.name : "";
  const idb = (mode, fn) => new Promise((ok, no) => { try { const rq = indexedDB.open("digikult-exam", 1); rq.onupgradeneeded = () => rq.result.createObjectStore("h");
    rq.onsuccess = () => { const tx = rq.result.transaction("h", mode), st = tx.objectStore("h"), r = fn(st); tx.oncomplete = () => ok(r && r.result); tx.onerror = () => no(tx.error); }; rq.onerror = () => no(rq.error); } catch (e) { no(e); } });
  if (window.showOpenFilePicker) idb("readonly", st => st.get(KEY)).then(h => { if (h) { handle = h; if (!isDone(state.current)) renderCase(); } }).catch(() => {});
  function pickWithInput() {
    return new Promise(ok => { const inp = $("fileIn"); inp.value = ""; inp.onchange = () => ok(inp.files[0] || null); inp.click(); });
  }
  async function getFile(pickNew) {
    if (handle && !pickNew) {
      try {
        let p = await handle.queryPermission({ mode: "read" });
        if (p !== "granted") p = await handle.requestPermission({ mode: "read" });
        if (p === "granted") return await handle.getFile();
      } catch (e) {}
    }
    if (window.showOpenFilePicker) {
      try {
        const [h] = await showOpenFilePicker({ id: "digikult-exam", types: [{ description: "Excel-munkafüzet", accept: { "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [".xlsx"] } }] });
        handle = h; idb("readwrite", st => st.put(h, KEY)).catch(() => {});
        return await h.getFile();
      } catch (e) { if (e && e.name === "AbortError") return null; }
    }
    return pickWithInput();
  }

  $("case").addEventListener("click", async e => {
    const id = e.target.id;
    if (id === "hintBtn") { const i = state.current; state.hints[i] = (state.hints[i] || 0) + 1; save(); renderCase(); return; }
    if (id === "next") return goTo(state.current + 1);
    if (id === "startBtn") { if (!isDone(0)) state.solved.push(0); save(); return goTo(1); }
    if (id === "toEnd") return showEnd();
    if (id === "checkBtn" || id === "pickBtn") { const f = await getFile(id === "pickBtn"); if (f) runChecks(f); }
  });
  $("case").addEventListener("dragover", e => { const d = e.target.closest(".checkbox"); if (d && !isDone(state.current)) { e.preventDefault(); d.classList.add("over"); } });
  $("case").addEventListener("dragleave", e => { const d = e.target.closest(".checkbox"); if (d) d.classList.remove("over"); });
  $("case").addEventListener("drop", e => { const d = e.target.closest(".checkbox"); if (!d) return; e.preventDefault(); d.classList.remove("over"); const f = e.dataTransfer.files[0]; if (f) runChecks(f); });

  /* ---------- reading the .xlsx ---------- */
  function loadScript(src) { return new Promise((ok, no) => { const s = document.createElement("script"); s.src = src; s.onload = ok; s.onerror = no; document.head.appendChild(s); }); }
  const HU = { SUM: "SZUM", AVERAGE: "ÁTLAG", COUNT: "DARAB", COUNTA: "DARAB2", COUNTBLANK: "DARABÜRES", ROUND: "KEREKÍTÉS", ROUNDUP: "KEREKÍTÉS.FEL", ROUNDDOWN: "KEREKÍTÉS.LE",
    IF: "HA", IFS: "HAELSŐIGAZ", IFERROR: "HAHIBA", COUNTIF: "DARABTELI", COUNTIFS: "DARABHATÖBB", SUMIF: "SZUMHA", SUMIFS: "SZUMHATÖBB", AVERAGEIF: "ÁTLAGHA",
    VLOOKUP: "FKERES", HLOOKUP: "VKERES", XLOOKUP: "XKERES", MATCH: "HOL.VAN", XMATCH: "XHOL.VAN", AND: "ÉS", OR: "VAGY", NOT: "NEM", LARGE: "NAGY", SMALL: "KICSI",
    LEFT: "BAL", RIGHT: "JOBB", MID: "KÖZÉP", LEN: "HOSSZ", CONCATENATE: "ÖSSZEFŰZ", CONCAT: "FŰZ", TEXT: "SZÖVEG", YEAR: "ÉV", MONTH: "HÓNAP", DAY: "NAP", TODAY: "MA", MOD: "MARADÉK", RANK: "SORSZÁM", "RANK.EQ": "SORSZÁM.EGY" };
  const toHu = f => "=" + String(f).split(/("[^"]*")/).map((t, k) => k % 2 ? t : t.replace(/_xlfn\./g, "").replace(/\b(TRUE|FALSE)\(\)/g, "$1").replace(/\bTRUE\b/g, "IGAZ").replace(/\bFALSE\b/g, "HAMIS")
    .replace(/\b([A-Z][A-Z0-9.]*)\(/g, (m, n) => (HU[n] || n) + "(").replace(/,/g, ";").replace(/(\d)\.(\d)/g, "$1,$2")).join("");
  const normDate = s => { const m = String(s).trim().match(/^(\d{4})\s*[.\-/]\s*(\d{1,2})\s*[.\-/]\s*(\d{1,2})\.?$/); return m ? `${m[1]}-${m[2].padStart(2, "0")}-${m[3].padStart(2, "0")}` : null; };

  /* F: what the checks can ask about the student's workbook */
  function makeF(wb) {
    const txt = p => { const f = wb.files && wb.files[p]; return f && f.content ? new TextDecoder().decode(f.content instanceof Uint8Array ? f.content : new Uint8Array(f.content)) : ""; };
    const join = (base, target) => { if (target[0] === "/") return target.slice(1); const parts = base.split("/"); parts.pop(); target.split("/").forEach(s => { if (s === "..") parts.pop(); else if (s !== ".") parts.push(s); }); return parts.join("/"); };
    const rels = path => { const dir = path.replace(/[^/]+$/, ""), name = path.split("/").pop(), out = {};
      txt(dir + "_rels/" + name + ".rels").replace(/<Relationship\b[^>]*>/g, m => { const id = (m.match(/\bId="([^"]+)"/) || [])[1], t = (m.match(/\bTarget="([^"]+)"/) || [])[1]; if (id && t) out[id] = join(path, t); return m; }); return out; };
    const attr = (el, a) => { const m = el.match(new RegExp(`\\b${a}="([^"]*)"`)); return m ? m[1] : null; };
    const sheetPath = {};
    (() => { const r = rels("xl/workbook.xml"); txt("xl/workbook.xml").replace(/<(?:\w+:)?sheet\b[^>]*>/g, m => { const n = attr(m, "name"), id = attr(m, "r:id") || attr(m, "id"); if (n && r[id]) sheetPath[n.replace(/&amp;/g, "&")] = r[id]; return m; }); })();
    const sheetNames = wb.SheetNames.slice();
    const exact = name => sheetNames.find(n => n.trim().toLowerCase() === String(name).toLowerCase());
    const pick = name => !name ? sheetNames[0] : exact(name) || (X.sheets ? sheetNames.find(n => !X.sheets.some(e => exact(e) === n)) : null);
    const ws = name => { const n = pick(name); return n ? wb.Sheets[n] : null; };
    const enc = XLSX.utils.encode_cell, dec = XLSX.utils.decode_cell;
    const cellsOf = rg => { const r = XLSX.utils.decode_range(rg), out = []; for (let R = r.s.r; R <= r.e.r; R++) for (let C = r.s.c; C <= r.e.c; C++) out.push(enc({ r: R, c: C })); return out; };
    const many = list => [].concat(...list.map(cellsOf));

    /* ---- colours: rgb, theme with tint, lumMod/lumOff ---- */
    const themeX = txt("xl/theme/theme1.xml");
    const themeRgb = name => { const m = themeX.match(new RegExp(`<a:${name}>[\\s\\S]*?(?:srgbClr val="([0-9A-Fa-f]{6})"|lastClr="([0-9A-Fa-f]{6})")`)); return m ? (m[1] || m[2]).toUpperCase() : null; };
    const THEME = ["lt1", "dk1", "lt2", "dk2", "accent1", "accent2", "accent3", "accent4", "accent5", "accent6", "hlink", "folHlink"];
    const toHsl = hex => { const r = parseInt(hex.slice(0, 2), 16) / 255, g = parseInt(hex.slice(2, 4), 16) / 255, b = parseInt(hex.slice(4, 6), 16) / 255;
      const mx = Math.max(r, g, b), mn = Math.min(r, g, b), l = (mx + mn) / 2; let h = 0, s = 0;
      if (mx !== mn) { const d = mx - mn; s = l > .5 ? d / (2 - mx - mn) : d / (mx + mn); h = mx === r ? (g - b) / d + (g < b ? 6 : 0) : mx === g ? (b - r) / d + 2 : (r - g) / d + 4; h *= 60; }
      return { h, s, l }; };
    const tintL = (hsl, t) => Object.assign({}, hsl, { l: t < 0 ? hsl.l * (1 + t) : hsl.l * (1 - t) + t });
    /* a DrawingML colour element (chart fills and lines) */
    function dmlColor(xml) {
      if (!xml) return null;
      let m = xml.match(/<a:srgbClr val="([0-9A-Fa-f]{6})"\s*\/?>([\s\S]*?)(?:<\/a:srgbClr>|$)/), base = null, mods = "";
      if (m) { base = m[1].toUpperCase(); mods = m[2] || ""; }
      else { m = xml.match(/<a:schemeClr val="(\w+)"\s*\/?>([\s\S]*?)(?:<\/a:schemeClr>|$)/); if (m) { const n = { bg1: "lt1", tx1: "dk1", bg2: "lt2", tx2: "dk2" }[m[1]] || m[1]; base = themeRgb(n); mods = m[2] || ""; } }
      if (!base) return null;
      let c = toHsl(base);
      const lm = mods.match(/lumMod val="(\d+)"/), lo = mods.match(/lumOff val="(\d+)"/), sh = mods.match(/shade val="(\d+)"/), ti = mods.match(/tint val="(\d+)"/);
      if (lm) c.l = c.l * (+lm[1] / 100000); if (lo) c.l = c.l + (+lo[1] / 100000); if (sh) c.l = c.l * (+sh[1] / 100000); if (ti) c.l = c.l + (1 - c.l) * (1 - (+ti[1] / 100000));
      c.l = Math.max(0, Math.min(1, c.l)); return c;
    }

    /* ---- cell styles, read from styles.xml and the sheet xml ---- */
    const sx = txt("xl/styles.xml");
    const sect = tag => (sx.match(new RegExp(`<${tag}\\b[^>]*>([\\s\\S]*?)</${tag}>`)) || [, ""])[1];
    const items = (body, tag) => body.match(new RegExp(`<${tag}\\b[^>]*?(?:/>|>[\\s\\S]*?</${tag}>)`, "g")) || [];
    const on = (el, tag) => { const m = el.match(new RegExp(`<${tag}\\b([^>]*)/?>`)); if (!m) return false; const v = attr(m[0], "val"); return v === null || v === "1" || v === "true"; };
    const fonts = items(sect("fonts"), "font").map(f => ({ b: on(f, "b"), i: on(f, "i"), sz: +(attr((f.match(/<sz\b[^>]*>/) || [""])[0], "val") || 11), name: attr((f.match(/<name\b[^>]*>/) || [""])[0], "val") || "" }));
    const fills = items(sect("fills"), "fill").map(f => { const p = (f.match(/<patternFill\b[^>]*>/) || [""])[0], fg = (f.match(/<fgColor\b[^>]*>/) || [""])[0];
      let col = null; const rgb = attr(fg, "rgb"), th = attr(fg, "theme"), tint = +(attr(fg, "tint") || 0);
      if (rgb) col = toHsl(rgb.slice(-6)); else if (th !== null && themeRgb(THEME[+th])) col = tintL(toHsl(themeRgb(THEME[+th])), tint);
      return { pattern: attr(p, "patternType") || "none", color: col }; });
    const borders = items(sect("borders"), "border").map(b => { const side = s => { const m = b.match(new RegExp(`<${s}\\b([^>]*)(?:/>|>)`)); return m ? attr(m[0], "style") || "" : ""; };
      return { left: side("left"), right: side("right"), top: side("top"), bottom: side("bottom") }; });
    const xfs = items(sect("cellXfs"), "xf").map(x => { const a = (x.match(/<alignment\b[^>]*>/) || [""])[0];
      return { font: +(attr(x, "fontId") || 0), fill: +(attr(x, "fillId") || 0), border: +(attr(x, "borderId") || 0), h: attr(a, "horizontal") || "general", v: attr(a, "vertical") || "bottom", rot: +(attr(a, "textRotation") || 0), wrap: /^(1|true)$/.test(attr(a, "wrapText") || "") }; });
    const styleIdx = {};
    function sheetStyles(name) {
      const n = pick(name); if (!n) return null; if (styleIdx[n]) return styleIdx[n];
      const xml = txt(sheetPath[n] || ""), cells = {}, rows = {}, cols = [];
      xml.replace(/<(?:\w+:)?c\b[^>]*>/g, m => { const r = attr(m, "r"), s = attr(m, "s"); if (r) cells[r] = +(s || 0); return m; });
      xml.replace(/<(?:\w+:)?row\b[^>]*>/g, m => { const r = attr(m, "r"), s = attr(m, "s"); if (r && s && /^(1|true)$/.test(attr(m, "customFormat") || "")) rows[r] = +s; return m; });
      xml.replace(/<(?:\w+:)?col\b[^>]*>/g, m => { const s = attr(m, "style"); if (s) cols.push({ min: +attr(m, "min"), max: +attr(m, "max"), s: +s }); return m; });
      return (styleIdx[n] = { cells, rows, cols, xml });
    }
    function style(a, o = {}) {
      const S = sheetStyles(o.sheet); if (!S) return null;
      let k = S.cells[a];
      if (k === undefined) { const p = dec(a), r = S.rows[p.r + 1]; k = r !== undefined ? r : ((S.cols.find(c => p.c + 1 >= c.min && p.c + 1 <= c.max) || {}).s || 0); }
      const x = xfs[k] || xfs[0] || { font: 0, fill: 0, border: 0, h: "general", v: "bottom", rot: 0, wrap: false };
      return { font: fonts[x.font] || fonts[0] || {}, fill: fills[x.fill] || { pattern: "none" }, border: borders[x.border] || {}, h: x.h, v: x.v, rot: x.rot, wrap: x.wrap };
    }
    /* merged cells: only the top-left one carries the content and the look */
    const mergesOf = o => ((ws(o.sheet) || {})["!merges"] || []);
    const mergeOf = (a, o) => { const p = dec(a); return mergesOf(o).find(m => p.r >= m.s.r && p.r <= m.e.r && p.c >= m.s.c && p.c <= m.e.c) || null; };
    const hidden = (a, o) => { const m = mergeOf(a, o), p = dec(a); return !!m && (p.r !== m.s.r || p.c !== m.s.c); };
    /* a side counts if this cell or its neighbour draws it */
    const OPP = { left: ["right", 0, -1], right: ["left", 0, 1], top: ["bottom", -1, 0], bottom: ["top", 1, 0] };
    const sideOf = (a, side, o) => { { const m = mergeOf(a, o), p = dec(a), [, dr, dc] = OPP[side]; if (m) { const q = { r: p.r + dr, c: p.c + dc }; if (q.r >= m.s.r && q.r <= m.e.r && q.c >= m.s.c && q.c <= m.e.c) return "thin"; } }
      const own = (style(a, o) || { border: {} }).border[side]; if (own) return own; const p = dec(a), [op, dr, dc] = OPP[side];
      if (p.r + dr < 0 || p.c + dc < 0) return ""; return (style(enc({ r: p.r + dr, c: p.c + dc }), o) || { border: {} }).border[op] || ""; };
    const THIN = /^(thin|hair)$/;

    /* charts of a sheet: type, title and its font, legend, labels, series colours, position */
    function charts(name) {
      const n = pick(name); if (!n || !sheetPath[n]) return [];
      const out = [];
      Object.values(rels(sheetPath[n])).filter(p => /drawings\/[^/]+\.xml$/.test(p)).forEach(dp => {
        const dx = txt(dp), dr = rels(dp);
        dx.replace(/<(?:\w+:)?(twoCellAnchor|oneCellAnchor|absoluteAnchor)\b[\s\S]*?<\/(?:\w+:)?\1>/g, anchor => {
          const id = (anchor.match(/<(?:\w+:)?chart\b[^>]*\br:id="([^"]+)"/) || [])[1]; if (!id || !dr[id]) return anchor;
          const num = (tag, part) => { const m = anchor.match(new RegExp(`<(?:\\w+:)?${tag}>[\\s\\S]*?<(?:\\w+:)?${part}>(-?\\d+)<`)); return m ? +m[1] : null; };
          const cx = txt(dr[id]).replace(/<(\/?)c:/g, "<$1");      /* drop the c: prefix, keep a: */
          const types = (cx.match(/<(pie|pie3D|doughnut|line|line3D|bar|bar3D|area|scatter|radar)Chart\b/g) || []).map(t => t.slice(1).replace(/Chart$/, ""));
          const titleX = (cx.match(/<title>[\s\S]*?<\/title>/) || [""])[0];
          const title = (titleX.match(/<a:t>([^<]*)</g) || []).map(t => t.replace(/<a:t>|<$/g, "")).join("").replace(/&amp;/g, "&");
          const legendX = (cx.match(/<legend>[\s\S]*?<\/legend>/) || [""])[0];
          const sers = cx.match(/<ser>[\s\S]*?<\/ser>/g) || [];
          const ser0 = sers[0] || "", sp = (ser0.match(/<spPr>[\s\S]*?<\/spPr>/) || [""])[0];
          const fillX = (sp.replace(/<a:ln\b[\s\S]*?<\/a:ln>/, "").match(/<a:solidFill>[\s\S]*?<\/a:solidFill>/) || [""])[0];
          const lineX = ((sp.match(/<a:ln\b[\s\S]*?<\/a:ln>/) || [""])[0].match(/<a:solidFill>[\s\S]*?<\/a:solidFill>/) || [""])[0];
          const dl = (cx.match(/<dLbls>[\s\S]*?<\/dLbls>/g) || []).join("");
          out.push({ types, title, titleX, legend: !!legendX && !/<delete val="1"\/>/.test(legendX), legendPos: (legendX.match(/legendPos val="(\w)"/) || [])[1] || (legendX ? "r" : null),
            barDir: (cx.match(/<barDir val="(\w+)"/) || [])[1] || null, series: sers.length,
            percent: /<showPercent val="1"/.test(dl), catName: /<showCatName val="1"/.test(dl),
            fill: dmlColor(fillX), line: dmlColor(lineX),
            from: { c: num("from", "col"), r: num("from", "row") }, to: { c: num("to", "col"), r: num("to", "row"), cOff: num("to", "colOff") } });
          return anchor;
        });
      });
      return out;
    }

    const dateSerial = iso => { const [y, m, d] = iso.split("-").map(Number); return Math.round((Date.UTC(y, m - 1, d) - Date.UTC(1899, 11, 30)) / 86400000); };
    const fmt = v => typeof v === "number" ? String(Math.round(v * 1000) / 1000).replace(".", ",") : `„${v}”`;
    const sheetWord = s => s ? `${/^[aáeéiíoóöőuúüű5]/i.test(s) ? "az" : "a"} ${s} munkalap ` : "";
    /* the expected values of a range: numbers, texts, or { date: "yyyy-mm-dd" }; null = must be empty */
    function values(range, want, o = {}) {
      const w = ws(o.sheet), cells = Array.isArray(range) ? range : cellsOf(range), sname = sheetWord(o.sheet);
      if (!w) return { ok: false, msg: `Nincs ${o.sheet} nevű munkalap a fájlban.`, done: 0, total: cells.length };
      let msg = null, done = 0;
      cells.forEach((a, k) => {
        const exp = Array.isArray(want) ? want[k] : want, cell = w[a], v = cell ? cell.v : undefined;
        let m = null;
        if (exp === null) { if (v !== undefined && v !== "") m = `${sname}${a} cellának üresnek kellene lennie.`; }
        else if (v === undefined || v === "") m = `${sname}${a} cella üres.`;
        else if (o.formula && !cell.f) m = `${sname}${a} cellában nincs képlet, csak egy beírt érték. Ide képlet kell (= jellel)!`;
        else if (exp && exp.date) { if (!((typeof v === "number" && Math.round(v) === dateSerial(exp.date)) || normDate(v) === exp.date)) m = `${sname}${a} értéke ${cell.w || v}, de ${exp.date.replace(/-/g, ".")} kellene.`; }
        else if (o.loose) { if (!(String(v).trim() === String(exp) || (typeof exp === "number" && Number(String(v).replace(",", ".")) === exp))) m = `${sname}${a} értéke ${fmt(typeof v === "number" ? v : String(v))}, de ${fmt(exp)} kellene.${cell.f ? ` A képlet: ${toHu(cell.f)}` : ""}`; }
        else if (typeof exp === "number") { if (typeof v !== "number" || Math.abs(v - exp) > 1e-6 * Math.max(1, Math.abs(exp))) m = `${sname}${a} értéke ${fmt(v)}, de ${fmt(exp)} kellene.${cell.f ? ` A képlet: ${toHu(cell.f)}` : ""}`; }
        else if (String(v).trim() !== String(exp)) m = `${sname}${a} értéke ${fmt(typeof v === "number" ? v : String(v))}, de ${fmt(exp)} kellene.${cell.f ? ` A képlet: ${toHu(cell.f)}` : ""}`;
        if (m) { if (!msg) msg = m; } else done++;
      });
      return { ok: done === cells.length, msg, done, total: cells.length };
    }
    /* every cell of the list must pass test(style, address); msg(address, style) explains the first that does not */
    function styles(list, test, msg, o = {}) {
      const cells = [].concat(...[].concat(list).map(x => /:/.test(x) ? cellsOf(x) : [x]));
      let bad = null, done = 0;
      cells.filter(a => !hidden(a, o)).forEach(a => { const s = style(a, o); if (s && test(s, a)) done++; else if (!bad) bad = [a, s]; });
      return { ok: !bad, msg: bad ? sheetWord(o.sheet) + msg(bad[0], bad[1] || {}) : null };
    }
    const all = (...rs) => { for (const r of rs) { const x = typeof r === "function" ? r() : r; if (!x.ok) return x; } return { ok: true }; };
    return { wb, ws, pick, sheetNames, charts, values, cellsOf, many, style, styles, all, hu: toHu, dec, enc,
      numFmt(range, re, o = {}) { const w = ws(o.sheet), cells = [].concat(...[].concat(range).map(cellsOf)); const bad = cells.find(a => !w || !w[a] || !re.test(String(w[a].z || "")));
        return bad ? { ok: false, msg: `${sheetWord(o.sheet)}${bad} cella számformátuma (${(w && w[bad] && w[bad].z && w[bad].z !== "General") ? w[bad].z : "általános"}) nem olyan, mint a mintán.` } : { ok: true }; },
      merged(range, o = {}) { const w = ws(o.sheet); return !!(w && (w["!merges"] || []).some(m => XLSX.utils.encode_range(m) === range)); },
      rowHidden(r, o = {}) { const n = pick(o.sheet); if (!n) return false; if ((((ws(o.sheet) || {})["!rows"] || [])[r - 1] || {}).hidden) return true;
        const m = (sheetStyles(o.sheet) || { xml: "" }).xml.match(new RegExp(`<(?:\\w+:)?row\\b[^>]*\\br="${r}"[^>]*>`)); return !!(m && /\bhidden="(1|true)"/.test(m[0])); },
      row(r, o = {}) { const w = ws(o.sheet); return (w && w["!rows"] && w["!rows"][r - 1]) || {}; },
      col(c, o = {}) { const w = ws(o.sheet); return (w && w["!cols"] && w["!cols"][XLSX.utils.decode_col(c)]) || {}; },
      boxed(list, o = {}) { return styles(list, (s, a) => ["left", "right", "top", "bottom"].every(sd => THIN.test(sideOf(a, sd, o))),
        (a) => { const miss = ["left", "right", "top", "bottom"].filter(sd => !THIN.test(sideOf(a, sd, o))); return `${a} cellának nincs vékony szegélye (${miss.map(x => ({ left: "bal", right: "jobb", top: "felső", bottom: "alsó" }[x])).join(", ")}).`; }, o); },
      unboxed(list, o = {}) { return styles(list, s => !["left", "right", "top", "bottom"].some(sd => s.border[sd]), a => `${a} cellának is van szegélye, pedig nincs benne adat.`, o); },
      gray: c => !!c && c.s < .15 && c.l > .45 && c.l < .96,
      lightOrange: c => !!c && ((c.h >= 15 && c.h <= 50) && c.s > .35 && c.l >= .5),
      darkBlue: c => !!c && c.h >= 195 && c.h <= 255 && c.l <= .42 && c.s > .2
    };
  }

  async function runChecks(file) {
    const i = state.current, c = CH[i];
    $("verdict").innerHTML = `<p class="export-note">Ellenőrzöm: ${esc(file.name)}…</p>`;
    if (!/\.xlsx$/i.test(file.name)) { $("verdict").innerHTML = `<div class="verdict no"><b>Ez nem .xlsx fájl.</b><p>A táblázatkezelő saját (alapértelmezett) formátumában mentett fájlt válaszd ki: ${esc(X.saveAs)}.</p></div>`; return; }
    try { if (!window.XLSX) await loadScript("https://cdn.jsdelivr.net/npm/" + "xlsx@0.18.5/dist/xlsx.full.min.js"); }
    catch (e) { $("verdict").innerHTML = `<div class="verdict no"><b>Nincs internet.</b><p>A fájl ellenőrzéséhez internetkapcsolat kell. Próbáld újra később.</p></div>`; return; }
    let F;
    try { F = makeF(XLSX.read(await file.arrayBuffer(), { type: "array", cellFormula: true, cellNF: true, cellStyles: true, bookFiles: true })); }
    catch (e) { $("verdict").innerHTML = `<div class="verdict no"><b>Ezt a fájlt nem tudom megnyitni.</b><p>Ha még nyitva van a mentés ablaka, várd meg a végét. Aztán mentsd el újra (<kbd>Ctrl</kbd>+<kbd>S</kbd>), és próbáld újra.</p></div>`; return; }
    const rows = checksOf(c).map(ch => { let r; try { r = ch.run(F) || { ok: false }; } catch (e) { r = { ok: false, msg: "Ezt a részt nem sikerült megnézni a fájlban." }; } return { ok: !!r.ok, msg: r.msg || null, done: r.done, total: r.total }; });
    const nameOk = new RegExp("^" + X.saveAs.replace(/\.xlsx$/, "").replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "(\\b|[ _-])", "i").test(file.name);
    state.reports[i] = { name: file.name, at: Date.now(), rows, nameOk }; save();
    if (rows.every(r => r.ok)) { solve(i); return; }
    renderCase();
    const left = rows.filter(r => !r.ok).length;
    $("verdict").innerHTML = `<div class="verdict no"><b>Még nem stimmel.</b><p>${left === 1 ? "Egy dolog még hiányzik" : `${left} dolog még hiányzik`}: nézd meg a pirossal írt megjegyzést fent. Javítsd ki az Excelben, mentsd el, és ellenőrizd újra!</p></div>`;
    buzz();
  }

  /* ---------- the end ---------- */
  function showEnd() {
    const mins = Math.max(1, Math.round(((state.end || Date.now()) - state.start) / 60000));
    const hints = Object.values(state.hints).reduce((s, n) => s + n, 0);
    $("endPanel").hidden = false; $("game").hidden = true;
    $("endPanel").innerHTML = `<div class="end-card">
        <p class="chap">Feladat kész</p><h2>${esc(X.title)}: megvan!</h2>
        <div class="story">${X.ending || ""}</div>
        <ul class="stats"><li><b>${T.length}</b> részfeladat</li><li><b>${mins}</b> perc</li><li><b>${hints}</b> segítség</li></ul>
        <p class="rank">${mins <= 50 && hints === 0 ? "Vizsgaérett: segítség nélkül, a vizsgaidőn belül!" : mins <= 50 ? "Időben megvagy. Legközelebb próbáld segítség nélkül!" : "Megvan! A vizsgán kb. 50 perced lesz rá: legközelebb mérd az időt."}</p>
        <div class="reward"><h3>Jutalom</h3><div id="reward"></div></div>
        <div class="export"><h3>Add be a munkádat</h3><ol class="export-steps"><li>Nyisd meg a feladatot a <b>Google Classroomban</b>.</li><li>Töltsd fel az elmentett fájlodat (${esc((state.reports[LAST] && state.reports[LAST].name) || X.saveAs)}).</li><li>Kattints a <b>Beadás</b> gombra.</li></ol></div>
        <div class="end-btns"><button type="button" class="btn" id="backToSheet">← Vissza a részfeladatokhoz</button><button type="button" class="btn reset" id="endReset">Újrakezdés</button>${X.next ? `<a class="btn primary" href="${X.next.href}">${esc(X.next.text)} →</a>` : ""}</div></div>`;
    if (window.DancingCats) DancingCats.mount($("reward"), { sound: () => soundOn, burst: (x, y, n) => celebrate(x, y, n) });
    scrollTo({ top: scrollY + $("endPanel").getBoundingClientRect().top - 70, behavior: "smooth" });
    setTimeout(() => { for (let k = 0; k < 4; k++) setTimeout(() => celebrate(innerWidth * (0.15 + Math.random() * 0.7), innerHeight * (0.15 + Math.random() * 0.3), 60), k * 350); }, 200);
  }
  $("endPanel").addEventListener("click", e => {
    if (e.target.id === "backToSheet") { $("endPanel").hidden = true; $("game").hidden = false; goTo(LAST); }
    if (e.target.closest("#endReset")) { if (armOrReset(e.target.closest("#endReset"))) doReset(); }
  });

  /* ---------- header: timer, sound, start again ---------- */
  const fmtTime = ms => { const m = Math.floor(ms / 60000), s = Math.floor(ms / 1000) % 60; return `${m}:${String(s).padStart(2, "0")}`; };
  const tick = () => { $("timer").textContent = fmtTime((state.end || Date.now()) - state.start); };
  setInterval(tick, 1000); tick();
  let soundOn = true; try { soundOn = localStorage.getItem("digikult-excel-sound") !== "off"; } catch (e) {}
  const paintSound = () => { $("soundBtn").textContent = soundOn ? "Hang: be" : "Hang: ki"; $("soundBtn").setAttribute("aria-pressed", soundOn); };
  $("soundBtn").addEventListener("click", () => { soundOn = !soundOn; paintSound(); try { localStorage.setItem("digikult-excel-sound", soundOn ? "on" : "off"); } catch (e) {} });
  paintSound();
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
    state = { solved: [], current: 0, start: Date.now(), end: null, hints: {}, reports: {} };
    save(); $("endPanel").hidden = true; $("game").hidden = false; goTo(0); scrollTo({ top: 0, behavior: "smooth" });
  }
  $("resetBtn").addEventListener("click", e => { if (armOrReset(e.currentTarget)) doReset(); });
  /* teacher shortcut: type the code anywhere and every chapter opens */
  let buf = "";
  document.addEventListener("keydown", e => {
    if (e.key.length !== 1) return;
    buf = (buf + e.key.toLowerCase()).slice(-8);
    if (buf === "bruinsma") { buf = ""; state.solved = CH.map((c, k) => k); if (!state.end) state.end = Date.now(); save(); goTo(LAST); }
  }, true);

  /* ---------- confetti and a chime ---------- */
  const fx = { c: $("fx"), parts: [], raf: 0 }; fx.ctx = fx.c.getContext("2d");
  const size = () => { const d = devicePixelRatio || 1; fx.c.width = innerWidth * d; fx.c.height = innerHeight * d; fx.ctx.setTransform(d, 0, 0, d, 0, 0); };
  size(); addEventListener("resize", size);
  const COLS = ["#5b45a8", "#f2d264", "#107c41", "#7fa7ff", "#f0a3b8", "#a8dba0"];
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  function celebrate(x, y, n) {
    chime(); if (reduced) return;
    for (let k = 0; k < n; k++) { const a = Math.random() * Math.PI * 2, v = 3 + Math.random() * 7; fx.parts.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 4, r: 3 + Math.random() * 4, rot: Math.random() * 6, vr: (Math.random() - .5) * .4, c: COLS[k % COLS.length], life: 70 + Math.random() * 40, sq: Math.random() < .5 }); }
    if (!fx.raf) fx.raf = requestAnimationFrame(loop);
  }
  function loop() {
    const C = fx.ctx; C.clearRect(0, 0, innerWidth, innerHeight);
    fx.parts = fx.parts.filter(p => p.life > 0);
    for (const p of fx.parts) {
      p.vy += .25; p.vx *= .985; p.x += p.vx; p.y += p.vy; p.rot += p.vr; p.life--;
      C.save(); C.globalAlpha = Math.min(1, p.life / 30); C.translate(p.x, p.y); C.rotate(p.rot); C.fillStyle = p.c;
      if (p.sq) C.fillRect(-p.r, -p.r / 2, p.r * 2, p.r); else { C.beginPath(); C.arc(0, 0, p.r * .7, 0, 7); C.fill(); }
      C.restore();
    }
    fx.raf = fx.parts.length ? requestAnimationFrame(loop) : 0;
  }
  let AC = null;
  function tone(f, d, type = "triangle", vol = .1, delay = 0) {
    if (!soundOn) return;
    try {
      AC = AC || new (window.AudioContext || window.webkitAudioContext)();
      const t = AC.currentTime + delay, o = AC.createOscillator(), g = AC.createGain();
      o.type = type; o.frequency.setValueAtTime(f, t); g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(.0001, t + d);
      o.connect(g).connect(AC.destination); o.start(t); o.stop(t + d + .05);
    } catch (e) {}
  }
  const chime = () => { [659, 784, 1047].forEach((f, k) => tone(f, .25, "triangle", .08, k * .07)); };
  const buzz = () => { tone(180, .18, "sawtooth", .05); tone(140, .22, "sawtooth", .05, .1); };

  window.EXAM_TEST = { makeF, runChecks, goTo, state: () => state };     /* for testing */
  renderSteps(); renderCase();
})();
