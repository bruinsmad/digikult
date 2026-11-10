/* digikult — official érettségi spreadsheet tasks, done in Excel (or any spreadsheet program).
   Every chapter is one részfeladat, shown word for word as on the official feladatlap. Under it the page
   offers help (how to start, hints), asks for a few values the student reads off the sheet, or gives a
   checklist for the formatting and chart parts. The last chapter checks the saved .xlsx itself.
   The whole feladatlap can be opened (and printed) as one page with the Feladatlap button.

   The page defines EXAM = {
     key, title, number, subject, level, date, code, points, saveAs,
     files: [{ name, href }],                     the official source files
     minta: [{ src, caption, label }],            the official sample pictures
     intro: html, rules: [html], lead: html,      word for word
     tasks: [{ n, title, text, before, tips: [html], hints: [html],
               asks: [{ q, num | text: [..] | date: "yyyy-mm-dd", traps: { answer: msg } }],
               checklist: [html], done: html }],
     checks: [{ task, label, run: F => ({ ok, msg, done, total }) }],
     ending: html
   } */
(function () {
  "use strict";
  const X = window.EXAM, T = X.tasks, KEY = X.key;
  const $ = id => document.getElementById(id);
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  /* chapter 0 is the start (the task's introduction), then one chapter per részfeladat, then the check */
  const CH = [{ start: true, title: "A feladat" }].concat(T.map(t => Object.assign({ task: true }, t)), [{ upload: true, title: "Ellenőrzés" }]);
  const LAST = CH.length - 1;

  let state = { solved: [], current: 0, start: Date.now(), end: null, hints: {}, answers: {}, ticks: {}, report: null };
  try { const s = JSON.parse(localStorage.getItem(KEY)); if (s && Array.isArray(s.solved)) state = Object.assign(state, s); } catch (e) {}
  state.solved = state.solved.filter(i => i >= 0 && i < CH.length);
  if (!(state.current >= 0 && state.current < CH.length)) state.current = 0;
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) {} };
  const isDone = i => state.solved.includes(i);

  /* ---------- the feladatlap, word for word ---------- */
  const fileLinks = () => X.files.map(f => `<a class="btn primary" href="${f.href}" download>${esc(f.name)} letöltése</a>`).join(" ");
  const taskHtml = t => `${t.before ? `<div class="pp between">${t.before}</div>` : ""}<div class="pp item"><span class="no">${t.n}.</span><div class="tx">${t.text}</div></div>`;
  const rulesHtml = () => `<div class="pp">${X.lead}</div><ul class="pp rules">${X.rules.map(r => `<li>${r}</li>`).join("")}</ul>`;
  const mintaHtml = (big) => X.minta.map((m, k) => `${m.caption ? `<p class="pp mcap">${m.caption}</p>` : ""}
      <figure class="minta"><button type="button" class="zoom" data-src="${m.src}" aria-label="Minta nagyítása"><img src="${m.src}" alt="${esc(m.alt || "Minta")}" loading="${big ? "eager" : "lazy"}"></button>
      ${m.label ? `<figcaption>${m.label}</figcaption>` : ""}</figure>`).join("");
  function sheetHtml() {
    const before = T.findIndex(t => t.mintaAfter);   /* most sheets have the minta at the end */
    return `<article class="paper" id="paper">
      <p class="src">${esc(X.subject)} · ${esc(X.level)} · ${esc(X.date)}${X.code ? ` · ${esc(X.code)}` : ""}</p>
      <h2 class="ptitle">${X.number}. ${esc(X.title)}</h2>
      ${X.introFirst ? `${X.intro}${rulesHtml()}` : `${rulesHtml()}${X.intro}`}
      ${T.map((t, k) => taskHtml(t) + (k === before ? `<p class="pts">${X.points} pont</p>` : "")).join("")}
      ${before < 0 ? `<p class="pts">${X.points} pont</p>` : ""}
      ${mintaHtml(true)}
      <p class="src foot">Forrás: Oktatási Hivatal, ${esc(X.subject)} ${esc(X.level)}ű gyakorlati vizsga${X.code ? `, ${esc(X.code)}` : ""}, ${esc(X.date)}. A feladat szövege és a minta a hivatalos feladatlapról való.</p>
    </article>`;
  }
  $("sheetView").innerHTML = `<div class="sv-bar"><b>Feladatlap</b><span>a hivatalos feladatlap szövege, szó szerint</span>
      <button type="button" class="btn" id="printBtn">Nyomtatás / PDF</button><button type="button" class="btn primary" id="closeSheet">Bezárás</button></div>${sheetHtml()}`;
  const openSheet = () => { $("sheetView").hidden = false; document.body.classList.add("sv-open"); $("closeSheet").focus(); };
  const closeSheet = () => { $("sheetView").hidden = true; document.body.classList.remove("sv-open"); };
  $("sheetBtn").addEventListener("click", openSheet);
  $("sheetView").addEventListener("click", e => { if (e.target.id === "closeSheet") closeSheet(); if (e.target.id === "printBtn") window.print(); });
  document.addEventListener("keydown", e => { if (e.key === "Escape") { if (!$("lightbox").hidden) $("lightbox").hidden = true; else if (!$("sheetView").hidden) closeSheet(); } });

  /* the minta beside the chapters, and a bigger look on click */
  $("mintaBox").innerHTML = mintaHtml(false);
  document.addEventListener("click", e => {
    const z = e.target.closest(".zoom"); if (z) { $("lightbox").innerHTML = `<img src="${z.dataset.src}" alt="Minta, nagyítva"><p>Kattints bárhova a bezáráshoz.</p>`; $("lightbox").hidden = false; return; }
    if (e.target.closest("#lightbox")) $("lightbox").hidden = true;
  });
  $("dlBox").innerHTML = X.files.map(f => `<div class="dlcard"><svg class="ic" viewBox="0 0 40 46" aria-hidden="true"><path d="M4 2h22l10 10v32H4z" fill="#fff" stroke="currentColor" stroke-width="2"/><path d="M26 2v10h10" fill="none" stroke="currentColor" stroke-width="2"/><path d="M10 22h20M10 28h20M10 34h14" stroke="currentColor" stroke-width="2"/></svg>
      <p><b>${esc(f.name)}</b><br>A hivatalos forrásfájl. Ebből dolgozol.</p><a class="btn primary" href="${f.href}" download>Letöltés</a></div>`).join("");

  /* ---------- chapter strip ---------- */
  const label = i => CH[i].start ? "Kezdés" : CH[i].upload ? "Beadás" : `${CH[i].n}. részfeladat`;
  function renderSteps() {
    $("steps").innerHTML = CH.map((c, i) => {
      const cls = ["step"]; if (isDone(i)) cls.push("done"); if (i === state.current) cls.push("current");
      return `<button type="button" class="${cls.join(" ")}" data-i="${i}" ${i === state.current ? 'aria-current="step"' : ""}>
        <span class="n">${c.start ? "Kezdés" : c.upload ? "Vége" : c.n + "."}</span><span class="t">${esc(c.title)}</span></button>`;
    }).join("");
    $("solvedCount").textContent = `${state.solved.filter(i => i > 0).length} / ${LAST}`;
  }
  $("steps").addEventListener("click", e => { const b = e.target.closest(".step"); if (b) goTo(+b.dataset.i); });

  /* ---------- one chapter ---------- */
  function renderCase() {
    const i = state.current, c = CH[i], solved = isDone(i);
    let body = "";
    if (c.start) {
      body = `<p class="chap">${esc(X.subject)} · ${esc(X.level)} · ${esc(X.date)}</p><h2>${X.number}. ${esc(X.title)}</h2>
        <div class="paper inline">${X.introFirst ? `${X.intro}${rulesHtml()}` : `${rulesHtml()}${X.intro}`}</div>
        <div class="learn"><h3>Hogyan dolgozz ezen az oldalon?</h3><ul>
          <li>Minden fejezet egy részfeladat, <b>szó szerint</b> a hivatalos feladatlapról. A feladatot a táblázatkezelőben (Excelben) oldod meg.</li>
          <li>Ha elakadsz, kérj segítséget. A <b>Mit mutat a táblázatod?</b> résznél beírod, mit kaptál, és az oldal megmondja, jó-e.</li>
          <li>A végén az oldal megnézi az elmentett fájlodat is.</li>
          <li>A teljes feladatlapot a <b>Feladatlap</b> gombbal egyben is megnézheted vagy kinyomtathatod. A vizsgán ${X.points} pontot ér, nagyjából 45–50 perc alatt kell megoldani.</li></ul></div>
        <div class="task"><h3>A forrásfájl</h3><p>${fileLinks()}</p>
          <div class="btns"><button type="button" class="btn primary big" id="startBtn">${solved ? "Tovább az 1. részfeladathoz" : "Elolvastam, kezdjük!"} →</button></div></div>`;
    } else if (c.upload) {
      body = `<p class="chap">Utolsó lépés</p><h2>Az elmentett fájl ellenőrzése</h2>
        <div class="story"><p>Mentsd el a munkádat (<kbd>Ctrl</kbd>+<kbd>S</kbd>), és húzd ide a fájlt (${esc(X.saveAs)}). Az oldal megnézi a képleteket, az eredményeket, a munkalapokat és a diagramot.</p>
        <p>A formázást (betűk, szegélyek, igazítás) nem tudja minden részletében megnézni: azt hasonlítsd össze a mintával!</p></div>
        <div class="task">${uploadHtml()}</div>`;
    } else {
      const shown = state.hints[i] || 0, ticks = state.ticks[i] || [];
      const asks = (c.asks || []).map((q, k) => {
        const prev = (state.answers[i] || {})[k] || "";
        return `<div class="ask" data-k="${k}"><label for="ans${k}">${q.q}</label>
          <div class="ask-row"><input id="ans${k}" type="text" inputmode="${q.num !== undefined ? "decimal" : "text"}" autocomplete="off" spellcheck="false" value="${esc(prev)}" ${solved ? "disabled" : ""} placeholder="a táblázatod szerint"><span class="mark" aria-hidden="true"></span></div></div>`;
      }).join("");
      const list = (c.checklist || []).map((h, k) => `<li><label><input type="checkbox" data-k="${k}" ${ticks.includes(k) || solved ? "checked" : ""}> <span>${h}</span></label></li>`).join("");
      body = `<p class="chap">${c.n}. részfeladat a ${T.length}-ből</p><h2>${esc(c.title)}</h2>
        <div class="paper inline">${c.ctx ? `<div class="pp between">${c.ctx}</div>` : ""}${taskHtml(c)}</div>
        ${c.tips ? `<div class="learn"><h3>Hogyan kezdj neki?</h3><ul>${c.tips.map(s => `<li>${s}</li>`).join("")}</ul></div>` : ""}
        <div class="task">
        ${c.checklist ? `<form class="asks" id="tickForm"><h3>Hasonlítsd össze a mintával</h3><ul class="ticks">${list}</ul>
            <div class="btns"><button type="submit" class="btn primary" id="checkBtn"${solved ? " hidden" : ""}>Kész vagyok vele</button>
            <button type="button" class="btn" id="hintBtn"${solved || shown >= (c.hints || []).length ? " hidden" : ""}>${shown ? "Még egy segítség" : "Segítség"}</button></div></form>`
          : `<form class="asks" id="askForm"><h3>Mit mutat a táblázatod?</h3>${asks}
            <div class="btns"><button type="submit" class="btn primary" id="checkBtn"${solved ? " hidden" : ""}>Ellenőrzés</button>
            <button type="button" class="btn" id="hintBtn"${solved || shown >= (c.hints || []).length ? " hidden" : ""}>${shown ? "Még egy segítség" : "Segítség"}</button></div></form>`}
        <div class="hints">${(c.hints || []).slice(0, shown).map((h, k) => `<div class="hint"><b>${k + 1}. segítség</b> ${h}</div>`).join("")}</div>
        <div id="verdict" aria-live="polite"></div></div>`;
    }
    $("case").innerHTML = body + `<div id="won">${solved && !c.start && !c.upload ? wonHtml(i) : ""}</div>`;
    if (c.upload && state.report) showReport(state.report);
  }
  function wonHtml(i) {
    const c = CH[i];
    return `<div class="verdict ok"><b>${c.checklist ? "Rendben!" : "Stimmel!"}</b>${c.done ? `<p>${c.done}</p>` : ""}</div>
      <button type="button" class="btn primary big" id="next">${i + 1 === LAST ? "Tovább az ellenőrzéshez" : `Tovább: ${CH[i + 1].n}. részfeladat`} →</button>`;
  }
  function goTo(i) {
    state.current = i; save(); renderSteps(); renderCase();
    if (innerWidth < 1000) $("case").scrollIntoView({ behavior: "smooth", block: "start" });
    else scrollTo({ top: Math.min(scrollY, $("steps").offsetTop - 70), behavior: "smooth" });
  }
  function solve(i, quiet) {
    if (!isDone(i)) state.solved.push(i);
    if (i === LAST && !state.end) state.end = Date.now();
    save(); renderSteps();
    if (quiet) return;
    const cb = $("checkBtn"), hb = $("hintBtn"); if (cb) cb.hidden = true; if (hb) hb.hidden = true;
    document.querySelectorAll(".ask input").forEach(x => x.disabled = true);
    if ($("verdict")) $("verdict").innerHTML = "";
    $("won").innerHTML = wonHtml(i);
    const r = $("won").getBoundingClientRect();
    celebrate(r.left + r.width / 2, r.top + 20, 50);
    if (innerWidth < 1000) $("won").scrollIntoView({ behavior: "smooth", block: "center" });
  }

  /* ---------- typed answers ---------- */
  const normText = s => String(s).toLowerCase().normalize("NFC").replace(/[\s.\-–"„”]/g, "");
  const normNum = s => { const t = String(s).replace(/[\s  ]/g, "").replace(/(pont|ft|db|m3)$/i, "").replace(",", "."); return /^-?\d+(\.\d+)?$/.test(t) ? parseFloat(t) : null; };
  const normDate = s => { const m = String(s).trim().match(/^(\d{4})\s*[.\-/]\s*(\d{1,2})\s*[.\-/]\s*(\d{1,2})\.?$/); return m ? `${m[1]}-${m[2].padStart(2, "0")}-${m[3].padStart(2, "0")}` : null; };
  function judge(q, raw) {
    if (!raw.trim()) return { ok: false, msg: "Még nem írtál be semmit." };
    /* typical wrong answers first: a text trap matches the text, a number trap the number */
    const trap = () => { for (const [k, m] of Object.entries(q.traps || {})) {
      const nk = normNum(k), nr = normNum(raw);
      if (q.exact ? k === raw.trim() : normText(k) === normText(raw)) return m;
      if (nk !== null && nr !== null && Math.abs(nk - nr) < 1e-6) return m; } return null; };
    let ok;
    if (q.date) ok = normDate(raw) === q.date;
    else if (q.text) ok = q.exact ? q.text.some(t => t.normalize("NFC") === raw.trim().normalize("NFC")) : q.text.some(t => normText(t) === normText(raw));
    else {
      const n = normNum(raw);
      if (n === null) return { ok: false, msg: trap() || "Csak a számot írd be, ahogy a táblázatod mutatja (pl. 6,8)." };
      ok = Math.abs(n - q.num) < 0.0006 * Math.max(1, Math.abs(q.num));
    }
    if (ok) return { ok: true };
    return { ok: false, msg: trap() || q.wrong || "Ez nem egyezik. Nézd meg újra a képletet a szerkesztőlécen, és hasonlítsd össze a feladat szövegével!" };
  }
  $("case").addEventListener("submit", e => {
    e.preventDefault();
    const i = state.current, c = CH[i];
    if (e.target.id === "tickForm") {
      const all = [...document.querySelectorAll(".ticks input")], on = all.filter(x => x.checked).map(x => +x.dataset.k);
      state.ticks[i] = on; save();
      if (on.length === all.length) { solve(i); return; }
      $("verdict").innerHTML = `<div class="verdict no"><b>Van még hátra.</b><p>Pipáld ki, amit már megcsináltál. Ami nincs kész, azt hasonlítsd össze a mintával (jobbra), és ha kell, kérj segítséget.</p></div>`;
      return;
    }
    if (e.target.id !== "askForm") return;
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
  $("case").addEventListener("change", e => {
    if (!e.target.matches(".ticks input")) return;
    state.ticks[state.current] = [...document.querySelectorAll(".ticks input")].filter(x => x.checked).map(x => +x.dataset.k); save();
  });
  $("case").addEventListener("click", e => {
    const id = e.target.id;
    if (id === "hintBtn") { const i = state.current; state.hints[i] = (state.hints[i] || 0) + 1; save(); renderCase(); }
    if (id === "next") goTo(state.current + 1);
    if (id === "startBtn") { solve(0, true); goTo(1); }
    if (id === "toEnd") showEnd();
  });

  /* ---------- the saved file, checked here in the browser ---------- */
  function uploadHtml() {
    return `<div class="drop" id="drop" tabindex="0" role="button" aria-label="Fájl kiválasztása">
        <input type="file" id="fileIn" accept=".xlsx" hidden>
        <b>Húzd ide az elmentett .xlsx fájlodat</b><span>vagy kattints, és válaszd ki. A fájlt az oldal csak itt, a böngésződben nézi meg.</span></div>
      <div id="report"></div>`;
  }
  /* formulas are stored in English in an .xlsx: show them the way the student typed them */
  const HU = { SUM: "SZUM", AVERAGE: "ÁTLAG", COUNT: "DARAB", COUNTA: "DARAB2", COUNTBLANK: "DARABÜRES", ROUND: "KEREKÍTÉS", ROUNDUP: "KEREKÍTÉS.FEL", ROUNDDOWN: "KEREKÍTÉS.LE",
    IF: "HA", IFS: "HAELSŐIGAZ", IFERROR: "HAHIBA", COUNTIF: "DARABTELI", COUNTIFS: "DARABHATÖBB", SUMIF: "SZUMHA", SUMIFS: "SZUMHATÖBB", AVERAGEIF: "ÁTLAGHA",
    VLOOKUP: "FKERES", HLOOKUP: "VKERES", XLOOKUP: "XKERES", MATCH: "HOL.VAN", XMATCH: "XHOL.VAN", AND: "ÉS", OR: "VAGY", NOT: "NEM", LARGE: "NAGY", SMALL: "KICSI",
    LEFT: "BAL", RIGHT: "JOBB", MID: "KÖZÉP", LEN: "HOSSZ", CONCATENATE: "ÖSSZEFŰZ", CONCAT: "FŰZ", TEXT: "SZÖVEG", YEAR: "ÉV", MONTH: "HÓNAP", DAY: "NAP", TODAY: "MA", ABS: "ABS", INT: "INT", MOD: "MARADÉK", RANK: "SORSZÁM", "RANK.EQ": "SORSZÁM.EGY" };
  const toHu = f => {
    const parts = String(f).replace(/^_xlfn\./, "").split(/("[^"]*")/);
    return "=" + parts.map((t, k) => k % 2 ? t : t.replace(/_xlfn\./g, "").replace(/\b(TRUE|FALSE)\(\)/g, "$1").replace(/\bTRUE\b/g, "IGAZ").replace(/\bFALSE\b/g, "HAMIS")
      .replace(/\b([A-Z][A-Z0-9.]*)\(/g, (m, n) => (HU[n] || n) + "(").replace(/,/g, ";").replace(/(\d)\.(\d)/g, "$1,$2")).join("");
  };
  function loadScript(src) { return new Promise((ok, no) => { const s = document.createElement("script"); s.src = src; s.onload = ok; s.onerror = no; document.head.appendChild(s); }); }

  /* F: what the checks can ask about the student's workbook */
  function makeF(wb) {
    const txt = p => { const f = wb.files && wb.files[p]; return f && f.content ? new TextDecoder().decode(f.content instanceof Uint8Array ? f.content : new Uint8Array(f.content)) : ""; };
    const join = (base, target) => {
      if (target[0] === "/") return target.slice(1);
      const parts = base.split("/"); parts.pop();
      target.split("/").forEach(s => { if (s === "..") parts.pop(); else if (s !== ".") parts.push(s); });
      return parts.join("/");
    };
    const rels = path => { const dir = path.replace(/[^/]+$/, ""), name = path.split("/").pop(); const r = txt(dir + "_rels/" + name + ".rels"); const out = {};
      r.replace(/<Relationship\b[^>]*>/g, m => { const id = (m.match(/\bId="([^"]+)"/) || [])[1], t = (m.match(/\bTarget="([^"]+)"/) || [])[1]; if (id && t) out[id] = join(path, t); return m; }); return out; };
    /* sheet name → worksheet xml path, read from the workbook itself */
    const sheetPath = {};
    (() => { const wbx = txt("xl/workbook.xml"), r = rels("xl/workbook.xml");
      wbx.replace(/<(?:\w+:)?sheet\b[^>]*>/g, m => { const n = (m.match(/\bname="([^"]+)"/) || [])[1], id = (m.match(/\br:id="([^"]+)"/) || m.match(/\bid="([^"]+)"/) || [])[1]; if (n && r[id]) sheetPath[n.replace(/&amp;/g, "&")] = r[id]; return m; }); })();
    const sheetNames = wb.SheetNames.slice();
    const exact = name => sheetNames.find(n => n.trim().toLowerCase() === String(name).toLowerCase());
    const pick = name => !name ? sheetNames[0] : exact(name) || (X.sheets ? sheetNames.find(n => !X.sheets.some(e => exact(e) === n)) : null);
    const ws = name => { const n = pick(name); return n ? wb.Sheets[n] : null; };
    /* charts of a sheet: type, title, legend, where it sits */
    function charts(name) {
      const n = pick(name); if (!n || !sheetPath[n]) return [];
      const out = [], sr = rels(sheetPath[n]);
      Object.values(sr).filter(p => /drawings\/[^/]+\.xml$/.test(p)).forEach(dp => {
        const dx = txt(dp), dr = rels(dp);
        dx.replace(/<(?:\w+:)?(twoCellAnchor|oneCellAnchor|absoluteAnchor)\b[\s\S]*?<\/(?:\w+:)?\1>/g, anchor => {
          const id = (anchor.match(/<(?:\w+:)?chart\b[^>]*\br:id="([^"]+)"/) || [])[1]; if (!id || !dr[id]) return anchor;
          const num = (tag, part) => { const m = anchor.match(new RegExp(`<(?:\\w+:)?${tag}>[\\s\\S]*?<(?:\\w+:)?${part}>(\\d+)<`)); return m ? +m[1] : null; };
          const cx = txt(dr[id]);
          const types = (cx.match(/<(?:\w+:)?(pie|pie3D|doughnut|line|line3D|bar|bar3D|area|scatter|radar)Chart\b/g) || []).map(t => t.replace(/<(?:\w+:)?|Chart$/g, ""));
          const titleXml = (cx.match(/<(?:\w+:)?title>[\s\S]*?<\/(?:\w+:)?title>/) || [""])[0];
          const title = (titleXml.match(/<(?:\w+:)?t>([^<]*)</g) || []).map(t => t.replace(/<(?:\w+:)?t>|<$/g, "")).join("").replace(/&amp;/g, "&");
          const legendXml = (cx.match(/<(?:\w+:)?legend>[\s\S]*?<\/(?:\w+:)?legend>/) || [""])[0];
          const barDir = (cx.match(/<(?:\w+:)?barDir val="(\w+)"/) || [])[1] || null;
          out.push({ types, title, autoTitleDeleted: /<(?:\w+:)?autoTitleDeleted val="1"/.test(cx), legend: !!legendXml, legendPos: (legendXml.match(/legendPos val="(\w)"/) || [])[1] || (legendXml ? "r" : null),
            barDir, labels: /<(?:\w+:)?dLbls>[\s\S]*?<(?:\w+:)?show(?:Percent|CatName) val="1"/.test(cx), percent: /<(?:\w+:)?showPercent val="1"/.test(cx), catName: /<(?:\w+:)?showCatName val="1"/.test(cx),
            from: { c: num("from", "col"), r: num("from", "row") }, to: { c: num("to", "col"), r: num("to", "row") }, xml: cx });
          return anchor;
        });
      });
      return out;
    }
    const cellsOf = rg => { const r = XLSX.utils.decode_range(rg), out = []; for (let R = r.s.r; R <= r.e.r; R++) for (let C = r.s.c; C <= r.e.c; C++) out.push(XLSX.utils.encode_cell({ r: R, c: C })); return out; };
    const dateSerial = iso => { const [y, m, d] = iso.split("-").map(Number); return Math.round((Date.UTC(y, m - 1, d) - Date.UTC(1899, 11, 30)) / 86400000); };
    const fmt = v => typeof v === "number" ? String(Math.round(v * 1000) / 1000).replace(".", ",") : `„${v}”`;   /* 1088 and 6,8, the Hungarian way */
    /* the expected values of a range: numbers, texts, or { date: "yyyy-mm-dd" }; null = must be empty */
    function values(range, want, o = {}) {
      const w = ws(o.sheet), cells = cellsOf(range), sname = o.sheet ? `${/^[aáeéiíoóöőuúüű5]/i.test(o.sheet) ? "az" : "a"} ${o.sheet} munkalap ` : "";
      if (!w) return { ok: false, msg: `Nincs ${o.sheet} nevű munkalap a fájlban.`, done: 0, total: cells.length };
      let msg = null, done = 0;
      cells.forEach((a, k) => {
        const exp = Array.isArray(want) ? want[k] : want, cell = w[a], v = cell ? cell.v : undefined;
        let m = null;
        if (exp === null) { if (v !== undefined && v !== "") m = `${sname}${a} cellának üresnek kellene lennie.`; }
        else if (v === undefined || v === "") m = `${sname}${a} cella üres.`;
        else if (o.formula && !cell.f) m = `${sname}${a} cellában nincs képlet, csak egy beírt érték. Ide képlet kell (= jellel)!`;
        else if (exp && exp.date) { const ok = (typeof v === "number" && Math.round(v) === dateSerial(exp.date)) || normDate(v) === exp.date; if (!ok) m = `${sname}${a} értéke ${cell.w || v}, de ${exp.date.replace(/-/g, ".")} kellene.`; }
        else if (o.loose) { const ok = String(v).trim() === String(exp) || (typeof exp === "number" && Number(String(v).replace(",", ".")) === exp); if (!ok) m = `${sname}${a} értéke ${fmt(typeof v === "number" ? v : String(v))}, de ${fmt(exp)} kellene.${cell.f ? ` A képlet: ${toHu(cell.f)}` : ""}`; }
        else if (typeof exp === "number") { if (typeof v !== "number" || Math.abs(v - exp) > 1e-6 * Math.max(1, Math.abs(exp))) m = `${sname}${a} értéke ${fmt(v)}, de ${fmt(exp)} kellene.${cell.f ? ` A képlet: ${toHu(cell.f)}` : ""}`; }
        else if (String(v).trim() !== String(exp)) m = `${sname}${a} értéke ${fmt(typeof v === "number" ? v : String(v))}, de ${fmt(exp)} kellene.${cell.f ? ` A képlet: ${toHu(cell.f)}` : ""}`;
        if (m) { if (!msg) msg = m; } else done++;
      });
      return { ok: done === cells.length, msg, done, total: cells.length };
    }
    const result = (ok, msg) => ({ ok, msg: ok ? null : msg });
    return { wb, ws, pick, sheetNames, charts, values, cellsOf, result, hu: toHu,
      numFmt(range, re, o = {}) { const w = ws(o.sheet), cells = cellsOf(range); let bad = cells.find(a => !w || !w[a] || !re.test(String(w[a].z || ""))); return result(!bad, `${bad} cella számformátuma (${(w && w[bad] && w[bad].z && w[bad].z !== "General") ? w[bad].z : "általános"}) nem olyan, mint a mintán.`); },
      merged(range, o = {}) { const w = ws(o.sheet); return !!(w && (w["!merges"] || []).some(m => XLSX.utils.encode_range(m) === range)); },
      rowHidden(r, o = {}) { const n = pick(o.sheet); if (!n) return false; if ((((ws(o.sheet) || {})["!rows"] || [])[r - 1] || {}).hidden) return true;
        const m = txt(sheetPath[n] || "").match(new RegExp(`<(?:\\w+:)?row\\b[^>]*\\br="${r}"[^>]*>`)); return !!(m && /\bhidden="(1|true)"/.test(m[0])); },
      row(r, o = {}) { const w = ws(o.sheet); return (w && w["!rows"] && w["!rows"][r - 1]) || {}; },
      col(c, o = {}) { const w = ws(o.sheet); return (w && w["!cols"] && w["!cols"][XLSX.utils.decode_col(c)]) || {}; }
    };
  }
  async function checkFile(file) {
    $("report").innerHTML = `<p class="export-note">Ellenőrzöm: ${esc(file.name)}…</p>`;
    if (!/\.xlsx$/i.test(file.name)) { $("report").innerHTML = `<div class="verdict no"><b>Ez nem .xlsx fájl.</b><p>A táblázatkezelő saját (alapértelmezett) formátumában mentett fájlt válaszd ki: ${esc(X.saveAs)}.</p></div>`; return; }
    try { if (!window.XLSX) await loadScript("https://cdn.jsdelivr.net/npm/" + "xlsx@0.18.5/dist/xlsx.full.min.js"); }
    catch (e) { $("report").innerHTML = `<div class="verdict no"><b>Nincs internet.</b><p>A fájl ellenőrzéséhez internetkapcsolat kell. Próbáld újra később.</p></div>`; return; }
    let F;
    try { F = makeF(XLSX.read(await file.arrayBuffer(), { type: "array", cellFormula: true, cellNF: true, cellStyles: true, bookFiles: true })); }
    catch (e) { $("report").innerHTML = `<div class="verdict no"><b>Ezt a fájlt nem tudom megnyitni.</b><p>Mentsd el újra (Fájl › Mentés), és próbáld újra.</p></div>`; return; }
    const rows = X.checks.map(ch => {
      let r; try { r = ch.run(F) || { ok: false }; } catch (e) { r = { ok: false, msg: "Ezt a részt nem sikerült megnézni a fájlban." }; }
      return { task: ch.task, label: ch.label, ok: !!r.ok, msg: r.msg || null, done: r.done, total: r.total };
    });
    const nameOk = new RegExp("^" + X.saveAs.replace(/\.xlsx$/, "").replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "\\b", "i").test(file.name);
    state.report = { name: file.name, at: Date.now(), rows, nameOk };
    save(); showReport(state.report);
    if (rows.every(r => r.ok)) { solve(LAST, true); $("won").innerHTML = `<button type="button" class="btn primary big" id="toEnd">Tovább a befejezéshez →</button>`; const b = $("toEnd").getBoundingClientRect(); celebrate(b.left + b.width / 2, b.top, 70); }
    else buzz();
  }
  function showReport(rep) {
    const good = rep.rows.filter(r => r.ok).length;
    $("report").innerHTML = `<p class="rep-head"><b>${esc(rep.name)}</b>: ${good} / ${rep.rows.length} rész rendben</p>
      ${rep.nameOk === false ? `<p class="export-note warn">A feladat szerint a fájl neve <b>${esc(X.saveAs.replace(/\.xlsx$/, ""))}</b> legyen. Ezt a vizsgán pontozzák!</p>` : ""}
      <ul class="goals report">${rep.rows.map(r => `<li class="${r.ok ? "ok" : ""}"><span class="gt"><span class="tn">${r.task}.</span> ${r.label}${r.ok ? "" : `<small>${esc(r.msg || "Ez még nincs meg a fájlban.")}</small>`}</span><span class="cnt">${r.total > 1 ? `${r.done} / ${r.total}` : ""}</span></li>`).join("")}</ul>
      ${good < rep.rows.length ? `<p class="export-note">Javítsd ki a táblázatkezelőben, mentsd el (<kbd>Ctrl</kbd>+<kbd>S</kbd>), és húzd ide újra.</p>` : ""}`;
    if (rep.rows.every(r => r.ok) && $("won") && !$("toEnd")) $("won").innerHTML = `<button type="button" class="btn primary big" id="toEnd">Tovább a befejezéshez →</button>`;
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
    $("endPanel").innerHTML = `<div class="end-card">
        <p class="chap">Feladat kész</p><h2>${esc(X.title)}: megvan!</h2>
        <div class="story">${X.ending || ""}</div>
        <ul class="stats"><li><b>${T.length}</b> részfeladat</li><li><b>${mins}</b> perc</li><li><b>${hints}</b> segítség</li></ul>
        <p class="rank">${mins <= 50 && hints === 0 ? "Vizsgaérett: segítség nélkül, a vizsgaidőn belül!" : mins <= 50 ? "Időben megvagy. Legközelebb próbáld segítség nélkül!" : "Megvan! A vizsgán kb. 50 perced lesz rá: legközelebb mérd az időt."}</p>
        <div class="reward"><h3>Jutalom</h3><div id="reward"></div></div>
        <div class="export"><h3>Add be a munkádat</h3><ol class="export-steps"><li>Nyisd meg a feladatot a <b>Google Classroomban</b>.</li><li>Töltsd fel az elmentett fájlodat (${esc((state.report && state.report.name) || X.saveAs)}).</li><li>Kattints a <b>Beadás</b> gombra.</li></ol></div>
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
    state = { solved: [], current: 0, start: Date.now(), end: null, hints: {}, answers: {}, ticks: {}, report: null };
    save(); $("endPanel").hidden = true; $("game").hidden = false; goTo(0); scrollTo({ top: 0, behavior: "smooth" });
  }
  $("resetBtn").addEventListener("click", e => { if (armOrReset(e.currentTarget)) doReset(); });
  /* teacher shortcut: type the code anywhere and every chapter counts as done */
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
  const COLS = X.confetti || ["#5b45a8", "#f2d264", "#107c41", "#7fa7ff", "#f0a3b8", "#a8dba0"];
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

  window.EXAM_CHECK = makeF;      /* for testing the checks without the page */
  renderSteps(); renderCase();
  if (state.end && state.solved.includes(LAST) && state.current === LAST) { /* finished earlier: the report stays on the last chapter */ }
})();
