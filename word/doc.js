/* digikult — a little Word on the page: A4-like pages drawn in HTML, and a ribbon to format them.
   WD.page(host, model)            draws the pages (read-only), returns { render(model), setMarks(on) }
   WD.editor(host, model, opts)    the same pages with a Word-like ribbon (and ruler); opts: { tools: [...], ruler, onChange(model) }

   model = { page: { w, h, top, bottom, left, right } (cm), header: "text", footerPage: true, marks: false,
             blocks: [ para | { type: "table", rows: [[..]], widths: [cm], headBold, headShade } | { type: "break" } ] }
   para  = { text | runs: [{ t, b, i, u, size, color }], align: left|center|right|both, left, right, firstLine (cm),
             before, after (pt), line (×), list: "bullet"|"number", box, shade, b, i, size, color (defaults for runs),
             target (yellow), img: { src, w, h (cm), wrap: inline|square|tight|topAndBottom|behind|front, side } } */
(function () {
  "use strict";
  const CM = 37.8, PT = 96 / 72;
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const PAGE = { w: 21, h: 29.7, top: 2.5, bottom: 2.5, left: 2.5, right: 2.5 };
  const tokens = s => String(s).match(/\s+|\S+\s*/g) || [];
  const runsOf = p => p.runs || (p.runs = tokens(p.text || "").map(t => ({ t })));
  const textOf = p => p.runs ? p.runs.map(r => r.t).join("") : (p.text || "");

  function runHtml(p, r, k, marks) {
    const b = r.b ?? p.b, i = r.i ?? p.i, u = r.u ?? p.u, size = r.size ?? p.size ?? 11, color = r.color ?? p.color;
    const st = [`font-size:${size * PT}px`];
    if (b) st.push("font-weight:700"); if (i) st.push("font-style:italic"); if (u) st.push("text-decoration:underline");
    if (color) st.push(`color:${color}`);
    let t = esc(r.t);
    if (marks) t = t.replace(/ /g, '<span class="sp"> </span>').replace(/\t/g, '<span class="tb">\t</span>');
    return `<span class="w" data-w="${k}" style="${st.join(";")}">${t}</span>`;
  }
  function paraHtml(p, idx, num, marks, base) {
    const st = [], cls = ["wd-p"];
    const left = p.left || 0, right = p.right || 0, fl = p.firstLine || 0;
    const size = (p.size || 11) * PT;
    if (p.list) {
      const L = left || 0.63, H = 0.63;
      st.push(`padding-left:${L * CM}px`, `text-indent:${-H * CM}px`);
      cls.push("li");
    } else st.push(`padding-left:${left * CM}px`, `text-indent:${fl * CM}px`);
    st.push(`padding-right:${right * CM}px`, `margin-top:${(p.before || 0) * PT}px`, `margin-bottom:${(p.after || 0) * PT}px`,
      `line-height:${(p.line || 1) * 1.22}`, `text-align:${p.align === "both" ? "justify" : p.align || "left"}`, `font-size:${size}px`);
    if (p.box || p.shade) { cls.push("box"); if (p.shade) st.push(`--shade:${p.shade}`); if (!p.box) cls.push("noline"); }
    if (p.target) cls.push("wd-target");
    const marker = p.list ? `<span class="mk" style="width:${0.63 * CM}px">${p.list === "bullet" ? "•" : num + "."}</span>` : "";
    const img = p.img ? imgHtml(p.img) : "";
    const runs = runsOf(p);
    const inner = runs.map((r, k) => runHtml(p, r, k, marks)).join("");
    const pm = marks ? `<span class="pm">¶</span>` : "";
    return `<div class="${cls.join(" ")}" data-p="${idx}" style="${st.join(";")}">${img && p.img.wrap !== "inline" ? img : ""}${marker}${img && p.img.wrap === "inline" ? img : ""}${inner || (marks ? "" : "​")}${pm}</div>`;
  }
  function imgHtml(m) {
    const st = [`width:${m.w * CM}px`, `height:${m.h * CM}px`], cls = ["wd-img", "wrap-" + m.wrap];
    if (m.side) cls.push("side-" + m.side);
    if (m.wrap === "behind" || m.wrap === "front") st.push(`left:${(m.x ?? 6) * CM}px`, `top:${(m.y ?? 0) * CM}px`);
    return `<span class="${cls.join(" ")}" style="${st.join(";")}">${m.src ? `<img src="${esc(m.src)}" alt="${esc(m.alt || "")}" draggable="false">` : m.svg || ""}</span>`;
  }
  function tableHtml(t, idx, marks) {
    const cols = t.widths || t.rows[0].map(() => null);
    return `<table class="wd-tbl${t.target ? " wd-target" : ""}" data-p="${idx}"><colgroup>${cols.map(w => `<col${w ? ` style="width:${w * CM}px"` : ""}>`).join("")}</colgroup>
      ${t.rows.map((row, ri) => `<tr>${row.map(c => `<td style="${ri === 0 && t.headShade ? `background:${t.headShade};` : ""}${ri === 0 && t.headBold ? "font-weight:700;" : ""}">${esc(c)}${marks ? '<span class="pm">¤</span>' : ""}</td>`).join("")}</tr>`).join("")}</table>`;
  }

  function pagesHtml(m) {
    const pg = Object.assign({}, PAGE, m.page || {}), marks = !!m.marks;
    const pages = [[]]; let num = 0;
    (m.blocks || []).forEach((b, idx) => {
      if (b.hidden) return;
      if (b.type === "break") { if (marks) pages[pages.length - 1].push(`<div class="wd-break">Oldaltörés</div>`); pages.push([]); num = 0; return; }
      if (b.type === "table") { pages[pages.length - 1].push(tableHtml(b, idx, marks)); num = 0; return; }
      num = b.list === "number" ? num + 1 : 0;
      pages[pages.length - 1].push(paraHtml(b, idx, num, marks));
    });
    return pages.map((blocks, k) => `<div class="wd-pg${m.headerTarget ? " ht" : ""}${m.footerTarget ? " ft" : ""}${m.pageTarget ? " pt" : ""}" style="width:${pg.w * CM}px;min-height:${(m.pageH ?? pg.h) * CM}px;padding:${pg.top * CM}px ${pg.right * CM}px ${pg.bottom * CM}px ${pg.left * CM}px;--l:${pg.left * CM}px;--r:${pg.right * CM}px;--t:${pg.top * CM}px;--b:${pg.bottom * CM}px">
      ${m.showMargins ? `<span class="wd-mg" aria-hidden="true"></span>` : ""}
      ${m.header != null ? `<div class="wd-hd${m.header ? "" : " empty"}">${esc(m.header || "Élőfej")}</div>` : ""}
      <div class="wd-body">${blocks.join("")}</div>
      ${m.footerPage || m.footer != null ? `<div class="wd-ft${m.footer || m.footerPage ? "" : " empty"}">${m.footer ? esc(m.footer) + " " : ""}${m.footerPage ? k + 1 : m.footer ? "" : "Élőláb"}</div>` : ""}
    </div>`).join("");
  }

  /* scale the pages down to fit the box they live in */
  function fit(outer, inner) {
    const go = () => {
      const avail = outer.clientWidth, nat = inner.scrollWidth;
      const s = nat > 0 ? Math.min(1, avail / nat) : 1;
      inner.style.transform = s < 1 ? `scale(${s})` : "";
      outer.style.height = inner.offsetHeight * s + "px";
    };
    const ro = new ResizeObserver(go); ro.observe(outer); ro.observe(inner);
    return go;
  }

  function page(host, model) {
    host.classList.add("wd");
    host.innerHTML = `<div class="wd-fit"><div class="wd-zoom"><div class="wd-pages"></div></div></div>`;
    const outer = host.querySelector(".wd-fit"), inner = host.querySelector(".wd-zoom"), pages = host.querySelector(".wd-pages");
    const refit = fit(outer, inner);
    let m = model;
    const render = mm => { if (mm) m = mm; pages.innerHTML = pagesHtml(m); refit(); };
    render();
    return { render, get model() { return m; }, setMarks(on) { m.marks = on; render(); }, el: pages };
  }

  /* ---------- the ribbon ---------- */
  const I = {
    left: '<path d="M2 4h14M2 8h9M2 12h14M2 16h7"/>', center: '<path d="M2 4h14M5 8h8M2 12h14M6 16h6"/>',
    right: '<path d="M2 4h14M7 8h9M2 12h14M9 16h7"/>', both: '<path d="M2 4h14M2 8h14M2 12h14M2 16h14"/>',
    bullet: '<circle cx="3" cy="5" r="1.4" fill="currentColor" stroke="none"/><circle cx="3" cy="13" r="1.4" fill="currentColor" stroke="none"/><path d="M7 5h9M7 13h9"/>',
    number: '<text x="1" y="7.5" font-size="6.5" font-family="Arial" fill="currentColor" stroke="none">1</text><text x="1" y="15.5" font-size="6.5" font-family="Arial" fill="currentColor" stroke="none">2</text><path d="M7 5h9M7 13h9"/>',
    outdent: '<path d="M8 4h8M8 8h8M8 12h8M2 16h14M5 6.5L2 9l3 2.5"/>', indent: '<path d="M8 4h8M8 8h8M8 12h8M2 16h14M2 6.5L5 9l-3 2.5"/>',
    line: '<path d="M8 4h8M8 9h8M8 14h8M3.5 3v12M1.5 5l2-2 2 2M1.5 13l2 2 2-2"/>'
  };
  const icon = k => `<svg viewBox="0 0 18 18" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" aria-hidden="true">${I[k]}</svg>`;
  const COLORS = [["#000000", "Fekete"], ["#c00000", "Sötétpiros"], ["#2f5496", "Kék"], ["#548235", "Zöld"], ["#bf8f00", "Arany"]];
  const SIZES = [8, 9, 10, 11, 12, 14, 16, 18, 20, 22, 24, 28, 36];
  const fmt = x => String(Math.round(x * 100) / 100).replace(".", ",");
  const parseNum = s => { const x = parseFloat(String(s).replace(",", ".")); return isNaN(x) ? null : x; };

  function editor(host, model, opts = {}) {
    const tools = opts.tools || ["font", "align", "list", "indent", "spacing", "marks"];
    host.classList.add("wd", "wd-ed");
    const has = k => tools.includes(k);
    host.innerHTML = `<div class="wd-ribbon" role="toolbar" aria-label="Kezdőlap">
        ${has("font") ? `<div class="grp"><div class="row">
          <select class="wd-size" title="Betűméret" aria-label="Betűméret">${SIZES.map(s => `<option>${s}</option>`).join("")}</select>
          <button type="button" data-c="b" title="Félkövér (Ctrl+B)"><b>F</b></button><button type="button" data-c="i" title="Dőlt (Ctrl+I)"><i style="font-family:Georgia,serif">D</i></button><button type="button" data-c="u" title="Aláhúzott (Ctrl+U)"><u>A</u></button>
          <span class="sw">${COLORS.map(([c, n]) => `<button type="button" data-color="${c}" title="Betűszín: ${n}" style="--c:${c}"></button>`).join("")}</span></div><span class="gl">Betűtípus</span></div>` : ""}
        ${has("align") || has("list") || has("indent") || has("marks") || has("line") || has("spacing") ? `<div class="grp"><div class="row">
          ${has("list") ? `<button type="button" data-c="bullet" title="Felsorolás">${icon("bullet")}</button><button type="button" data-c="number" title="Számozás">${icon("number")}</button>` : ""}
          ${has("indent") ? `<button type="button" data-c="outdent" title="Behúzás csökkentése">${icon("outdent")}</button><button type="button" data-c="indent" title="Behúzás növelése">${icon("indent")}</button>` : ""}
          ${has("marks") ? `<button type="button" data-c="marks" title="Mindent mutat (¶)" class="pil">¶</button>` : ""}
          ${has("align") ? `<span class="sep"></span><button type="button" data-c="left" title="Balra igazítás">${icon("left")}</button><button type="button" data-c="center" title="Középre igazítás">${icon("center")}</button><button type="button" data-c="right" title="Jobbra igazítás">${icon("right")}</button><button type="button" data-c="both" title="Sorkizárt">${icon("both")}</button>` : ""}
          ${has("line") || has("spacing") ? `<label class="ls" title="Sor- és bekezdéstávolság">${icon("line")}<select class="wd-line" aria-label="Sorköz">${[1, 1.15, 1.5, 2].map(x => `<option value="${x}">${fmt(x)}</option>`).join("")}</select></label>` : ""}
        </div><span class="gl">Bekezdés</span></div>` : ""}
        ${has("spacing") || has("dialog") ? `<div class="grp dlg"><div class="row">
          ${has("dialog") ? `<label>Bal <input class="wd-in" data-k="left" inputmode="decimal"> cm</label><label>Jobb <input class="wd-in" data-k="right" inputmode="decimal"> cm</label>
            <label>Első sor <input class="wd-in" data-k="firstLine" inputmode="decimal"> cm</label>` : ""}
          ${has("spacing") ? `<label>Előtte <input class="wd-in" data-k="before" inputmode="decimal"> pt</label><label>Utána <input class="wd-in" data-k="after" inputmode="decimal"> pt</label>` : ""}
        </div><span class="gl">${has("dialog") ? "Bekezdés – behúzás és térköz" : "Térköz"}</span></div>` : ""}
      </div>
      <div class="wd-fit"><div class="wd-zoom">${opts.ruler ? `<div class="wd-ruler"><div class="rl-in"><span class="mk fl" title="Első sor behúzása"></span><span class="mk hg" title="Bal behúzás"></span><span class="mk rt" title="Jobb behúzás"></span></div></div>` : ""}<div class="wd-pages" tabindex="0"></div></div></div>`;
    const outer = host.querySelector(".wd-fit"), inner = host.querySelector(".wd-zoom"), pagesEl = host.querySelector(".wd-pages");
    const refit = fit(outer, inner);
    const m = model; m.blocks.forEach(b => { if (!b.type) runsOf(b); });
    let sel = { paras: [opts.select ?? 0], words: [] };   /* words: [pIdx, wIdx] */

    function render() {
      pagesEl.innerHTML = pagesHtml(m);
      sel.paras.forEach(i => { const el = pagesEl.querySelector(`.wd-p[data-p="${i}"]`); if (el) el.classList.add("cur"); });
      sel.words.forEach(([p, w]) => { const el = pagesEl.querySelector(`.wd-p[data-p="${p}"] .w[data-w="${w}"]`); if (el) el.classList.add("sel"); });
      paint(); refit();
    }
    const curP = () => m.blocks[sel.paras[0]] || {};
    function paint() {
      const p = curP();
      host.querySelectorAll(".wd-ribbon [data-c]").forEach(b => {
        const c = b.dataset.c; let on = false;
        if (["left", "center", "right", "both"].includes(c)) on = (p.align || "left") === c;
        else if (c === "bullet" || c === "number") on = p.list === c;
        else if (c === "marks") on = !!m.marks;
        else if (["b", "i", "u"].includes(c)) { const ws = selWords(); on = ws.length > 0 && ws.every(([pi, wi]) => { const pp = m.blocks[pi], r = pp.runs[wi]; return r[c] ?? pp[c]; }); }
        b.classList.toggle("on", on); b.setAttribute("aria-pressed", on);
      });
      const sz = host.querySelector(".wd-size"); if (sz) { const ws = selWords(); const r = ws[0] && m.blocks[ws[0][0]].runs[ws[0][1]]; sz.value = String(r ? (r.size ?? m.blocks[ws[0][0]].size ?? 11) : (p.size ?? 11)); }
      const ln = host.querySelector(".wd-line"); if (ln) ln.value = String(p.line || 1);
      host.querySelectorAll(".wd-in").forEach(inp => { if (document.activeElement !== inp) inp.value = fmt(p[inp.dataset.k] || 0); });
      if (opts.ruler) ruler();
    }
    const selWords = () => sel.words.length ? sel.words : (sel.caret ? [sel.caret] : []);
    const change = () => { render(); if (opts.onChange) opts.onChange(m); };

    /* selection: let the browser select, then take over */
    pagesEl.addEventListener("mouseup", e => { const t = e.target; setTimeout(() => readSel(t), 0); });
    pagesEl.addEventListener("keyup", () => readSel(null));
    function readSel(clicked) {
      const s = getSelection();
      const rg = s.rangeCount ? s.getRangeAt(0) : null;
      const pEl = n => (n.nodeType === 1 ? n : n.parentElement).closest(".wd-p");
      const hit = clicked && clicked.closest ? clicked.closest(".wd-p") : null;
      if ((!rg || rg.collapsed || !pagesEl.contains(rg.commonAncestorContainer)) && hit) {
        sel.paras = [+hit.dataset.p]; sel.words = []; sel.caret = null;
        const w = clicked.closest(".w"); if (w && w.textContent.trim()) sel.caret = [+hit.dataset.p, +w.dataset.w];
        if (rg) s.removeAllRanges();
        render(); if (opts.onSelect) opts.onSelect(sel, m); return;
      }
      if (!rg || !pagesEl.contains(rg.commonAncestorContainer)) return;
      const a = pEl(rg.startContainer), z = pEl(rg.endContainer);
      if (!a) return;
      const all = Array.from(pagesEl.querySelectorAll(".wd-p"));
      const i0 = all.indexOf(a), i1 = z ? all.indexOf(z) : i0;
      sel.paras = all.slice(i0, i1 + 1).map(e => +e.dataset.p);
      sel.words = []; sel.caret = null;
      if (!rg.collapsed) all.slice(i0, i1 + 1).forEach(e => e.querySelectorAll(".w").forEach(w => { if (rg.intersectsNode(w) && w.textContent.trim()) sel.words.push([+e.dataset.p, +w.dataset.w]); }));
      else { const w = (rg.startContainer.nodeType === 1 ? rg.startContainer : rg.startContainer.parentElement).closest(".w"); if (w && w.textContent.trim()) sel.caret = [+a.dataset.p, +w.dataset.w]; }
      s.removeAllRanges();
      render();
      if (opts.onSelect) opts.onSelect(sel, m);
    }
    pagesEl.addEventListener("keydown", e => {
      if (!(e.ctrlKey || e.metaKey)) return;
      const k = e.key.toLowerCase(), map = { b: "b", i: "i", u: "u" };
      if (map[k]) { e.preventDefault(); cmd(map[k]); }
    });

    function cmd(c) {
      const ps = sel.paras.map(i => m.blocks[i]).filter(p => p && !p.type);
      if (["left", "center", "right", "both"].includes(c)) ps.forEach(p => p.align = c);
      else if (c === "bullet" || c === "number") { const off = ps.every(p => p.list === c); ps.forEach(p => { p.list = off ? null : c; if (!off) p.left = Math.max(p.left || 0, 0.63); else p.left = 0; }); }
      else if (c === "indent") ps.forEach(p => p.left = Math.round(((p.left || 0) + 1.25) * 100) / 100);
      else if (c === "outdent") ps.forEach(p => p.left = Math.max(0, Math.round(((p.left || 0) - 1.25) * 100) / 100));
      else if (c === "marks") m.marks = !m.marks;
      else if (["b", "i", "u"].includes(c)) {
        const ws = selWords(); if (!ws.length) return;
        const to = !ws.every(([pi, wi]) => m.blocks[pi].runs[wi][c] ?? m.blocks[pi][c]);
        ws.forEach(([pi, wi]) => m.blocks[pi].runs[wi][c] = to);
      }
      change();
    }
    host.querySelector(".wd-ribbon").addEventListener("mousedown", e => { if (e.target.closest("button")) e.preventDefault(); });
    host.querySelector(".wd-ribbon").addEventListener("click", e => {
      const b = e.target.closest("button"); if (!b) return;
      if (b.dataset.c) cmd(b.dataset.c);
      if (b.dataset.color) { const ws = selWords(); ws.forEach(([pi, wi]) => m.blocks[pi].runs[wi].color = b.dataset.color); change(); }
    });
    host.querySelector(".wd-ribbon").addEventListener("change", e => {
      const ps = sel.paras.map(i => m.blocks[i]).filter(p => p && !p.type);
      if (e.target.classList.contains("wd-size")) { const v = +e.target.value; const ws = selWords(); if (ws.length) ws.forEach(([pi, wi]) => m.blocks[pi].runs[wi].size = v); else ps.forEach(p => p.runs.forEach(r => r.size = v)); change(); }
      if (e.target.classList.contains("wd-line")) { ps.forEach(p => p.line = +e.target.value); change(); }
      if (e.target.classList.contains("wd-in")) { const v = parseNum(e.target.value); if (v === null) { paint(); return; } ps.forEach(p => p[e.target.dataset.k] = v); change(); }
    });
    host.querySelector(".wd-ribbon").addEventListener("keydown", e => { if (e.target.classList.contains("wd-in") && e.key === "Enter") { e.preventDefault(); e.target.dispatchEvent(new Event("change", { bubbles: true })); } });

    /* the ruler: first line (top), left indent (bottom), right indent */
    function ruler() {
      const pg = Object.assign({}, PAGE, m.page || {}), p = curP(), rl = host.querySelector(".wd-ruler"), rin = rl.querySelector(".rl-in");
      rl.style.width = pg.w * CM + "px"; rin.style.left = pg.left * CM + "px"; rin.style.right = pg.right * CM + "px";
      const cw = pg.w - pg.left - pg.right;
      if (!rin.dataset.ticks) {
        let t = ""; for (let x = 0.5; x < cw - 0.2; x += 0.5) t += Number.isInteger(x) ? `<b style="left:${x * CM}px">${x}</b>` : `<i style="left:${x * CM}px"></i>`;
        rin.insertAdjacentHTML("afterbegin", t); rin.dataset.ticks = 1;
      }
      const L = p.left || 0, F = L + (p.firstLine || 0), Rr = p.right || 0;
      rin.querySelector(".fl").style.left = F * CM + "px"; rin.querySelector(".hg").style.left = L * CM + "px"; rin.querySelector(".rt").style.left = (cw - Rr) * CM + "px";
    }
    if (opts.ruler) {
      const rin = host.querySelector(".rl-in");
      let drag = null;
      rin.addEventListener("pointerdown", e => { const mk = e.target.closest(".mk"); if (!mk) return; e.preventDefault(); drag = mk.classList[1]; mk.setPointerCapture(e.pointerId); });
      rin.addEventListener("pointermove", e => {
        if (!drag) return;
        const pg = Object.assign({}, PAGE, m.page || {}), cw = pg.w - pg.left - pg.right, r = rin.getBoundingClientRect();
        let x = (e.clientX - r.left) / r.width * cw; x = Math.round(x * 4) / 4; x = Math.max(0, Math.min(cw - 1, x));
        sel.paras.map(i => m.blocks[i]).filter(p => p && !p.type).forEach(p => {
          const L = p.left || 0, F = L + (p.firstLine || 0);
          if (drag === "fl") p.firstLine = Math.round((x - L) * 100) / 100;
          if (drag === "hg") { p.left = x; p.firstLine = Math.round((F - x) * 100) / 100; }
          if (drag === "rt") p.right = Math.max(0, Math.round((cw - x) * 100) / 100);
        });
        change();
      });
      const stop = () => { drag = null; };
      rin.addEventListener("pointerup", stop); rin.addEventListener("pointercancel", stop);
    }
    render();
    return { model: m, render, sel: () => sel, cmd };
  }

  window.WD = { page, editor, pagesHtml, textOf, tokens, CM, PT };
})();
