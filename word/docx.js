/* digikult — reads a .docx saved by Word, right in the browser, and checks its formatting.
   Nothing is uploaded: the file is unzipped here (DecompressionStream) and its XML read with DOMParser.

   DOCX.read(arrayBuffer) → Promise<doc>
     doc.paras   [{ text, norm, align, ind:{left,right,firstLine} (cm), before, after (pt), line (×), lineRule,
                    list: null | "bullet" | "number", runs:[{ text, b, i, u, sz (pt), color }], box, inTable, row,
                    table, drawings, pageBreak, pageBreakBefore, last }]
     doc.tables  [{ rows: [[text]], nCols, headBold, headShaded }]
     doc.images  [{ wrap: inline|square|tight|through|topAndBottom|behind|front, widthCm, heightCm }]
     doc.page    { top, bottom, left, right, width, height (cm), landscape }
     doc.header  { text }   doc.footer { text, page (has a PAGE field) }
   DOCX.check(doc, goal) → { ok, done, total, msg }   (goal shapes: see the bottom of this file) */
(function () {
  "use strict";
  const W = "http://schemas.openxmlformats.org/wordprocessingml/2006/main";
  const WP = "http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing";
  const R = "http://schemas.openxmlformats.org/officeDocument/2006/relationships";

  /* ---------- a small unzip ---------- */
  async function inflate(bytes) {
    const ds = new DecompressionStream("deflate-raw");
    const out = new Response(new Blob([bytes]).stream().pipeThrough(ds));
    return new Uint8Array(await out.arrayBuffer());
  }
  async function unzip(buf) {
    const b = new Uint8Array(buf), v = new DataView(buf);
    let e = -1;
    for (let i = b.length - 22; i >= Math.max(0, b.length - 66000); i--) if (v.getUint32(i, true) === 0x06054b50) { e = i; break; }
    if (e < 0) throw new Error("not a zip");
    const n = v.getUint16(e + 10, true); let p = v.getUint32(e + 16, true);
    const files = {}, td = new TextDecoder();
    for (let k = 0; k < n; k++) {
      if (v.getUint32(p, true) !== 0x02014b50) throw new Error("bad zip");
      const method = v.getUint16(p + 10, true), csize = v.getUint32(p + 20, true);
      const nl = v.getUint16(p + 28, true), xl = v.getUint16(p + 30, true), cl = v.getUint16(p + 32, true), off = v.getUint32(p + 42, true);
      const name = td.decode(b.subarray(p + 46, p + 46 + nl));
      files[name] = { method, csize, off };
      p += 46 + nl + xl + cl;
    }
    const get = async name => {
      const f = files[name]; if (!f) return null;
      const start = f.off + 30 + v.getUint16(f.off + 26, true) + v.getUint16(f.off + 28, true);
      const raw = b.subarray(start, start + f.csize);
      return td.decode(f.method === 0 ? raw : await inflate(raw));
    };
    return { names: Object.keys(files), get };
  }

  /* ---------- XML helpers ---------- */
  const kids = (el, name) => el ? Array.from(el.children).filter(c => c.namespaceURI === W && c.localName === name) : [];
  const kid = (el, name) => kids(el, name)[0] || null;
  const attr = (el, name) => el ? (el.getAttributeNS(W, name) ?? el.getAttribute("w:" + name)) : null;
  const val = el => attr(el, "val");
  const on = el => { if (!el) return undefined; const x = val(el); return !(x === "0" || x === "false" || x === "off"); };
  const desc = (el, name, ns = W) => el ? Array.from(el.getElementsByTagNameNS(ns, name)) : [];
  const num = x => x === null || x === undefined || x === "" ? undefined : parseFloat(x);
  const cm = tw => Math.round(tw / 567 * 100) / 100;
  const realColor = c => c && !/^(auto|000000|0{6})$/i.test(c);
  const realFill = c => c && !/^(auto|ffffff)$/i.test(c);

  async function read(buf) {
    const z = await unzip(buf);
    const parse = async name => { const s = await z.get(name); return s ? new DOMParser().parseFromString(s, "application/xml") : null; };
    const docX = await parse("word/document.xml");
    if (!docX || !docX.documentElement || docX.getElementsByTagName("parsererror").length) throw new Error("no document.xml");
    const stylesX = await parse("word/styles.xml"), numX = await parse("word/numbering.xml"), relsX = await parse("word/_rels/document.xml.rels");

    /* styles */
    const styles = {}; let defPara = null, defRPr = null, defPPr = null;
    if (stylesX) {
      const dd = desc(stylesX, "docDefaults")[0];
      if (dd) { defRPr = desc(dd, "rPr")[0] || null; defPPr = desc(dd, "pPr")[0] || null; }
      desc(stylesX, "style").forEach(s => {
        const id = attr(s, "styleId");
        styles[id] = { type: attr(s, "type"), basedOn: val(kid(s, "basedOn")), pPr: kid(s, "pPr"), rPr: kid(s, "rPr"), tblPr: kid(s, "tblPr"), tcPr: kid(s, "tcPr"),
          cond: Object.fromEntries(kids(s, "tblStylePr").map(c => [attr(c, "type"), { rPr: kid(c, "rPr"), tcPr: kid(c, "tcPr"), pPr: kid(c, "pPr") }])) };
        if (attr(s, "type") === "paragraph" && on2(attr(s, "default"))) defPara = id;
      });
    }
    function on2(x) { return x === "1" || x === "true" || x === "on"; }
    const chain = id => { const out = []; const seen = new Set(); while (id && styles[id] && !seen.has(id)) { seen.add(id); out.push(styles[id]); id = styles[id].basedOn; } return out; };

    /* numbering */
    const nums = {}, abstracts = {};
    if (numX) {
      desc(numX, "abstractNum").forEach(a => { abstracts[attr(a, "abstractNumId")] = a; });
      desc(numX, "num").forEach(n => { nums[attr(n, "numId")] = n; });
    }
    function lvlOf(numId, ilvl) {
      const n = nums[numId]; if (!n) return null;
      const ov = kids(n, "lvlOverride").find(o => attr(o, "ilvl") === String(ilvl));
      if (ov && kid(ov, "lvl")) return kid(ov, "lvl");
      let a = abstracts[val(kid(n, "abstractNumId"))];
      const link = a && val(kid(a, "numStyleLink"));
      if (link && styles[link]) { const np = styles[link].pPr && kid(styles[link].pPr, "numPr"); const id2 = np && val(kid(np, "numId")); if (id2 && nums[id2]) a = abstracts[val(kid(nums[id2], "abstractNumId"))]; }
      return a ? kids(a, "lvl").find(l => attr(l, "ilvl") === String(ilvl)) || null : null;
    }

    /* relationships (header/footer files) */
    const rels = {};
    if (relsX) Array.from(relsX.getElementsByTagName("Relationship")).forEach(r => { rels[r.getAttribute("Id")] = r.getAttribute("Target"); });

    const body = desc(docX, "body")[0];
    const paras = [], tables = [], images = [];

    function paraInfo(p, ctx) {
      const pPr = kid(p, "pPr");
      const sid = val(kid(pPr, "pStyle")) || defPara;
      const sChain = chain(sid);
      /* numbering: direct or from style */
      let numPr = kid(pPr, "numPr");
      if (!numPr) for (const s of sChain) { const np = s.pPr && kid(s.pPr, "numPr"); if (np) { numPr = np; break; } }
      let list = null, lvl = null;
      if (numPr) {
        const id = val(kid(numPr, "numId")), il = val(kid(numPr, "ilvl")) || "0";
        if (id && id !== "0") { lvl = lvlOf(id, il); const fmt = lvl ? val(kid(lvl, "numFmt")) : "decimal"; list = fmt === "bullet" ? "bullet" : fmt === "none" ? null : "number"; }
      }
      const tbl = ctx.tblStyle ? chain(ctx.tblStyle) : [];
      const condP = ctx.firstRow ? tbl.map(s => s.cond.firstRow && s.cond.firstRow.pPr).filter(Boolean) : [];
      const pSources = [pPr, lvl && kid(lvl, "pPr"), ...sChain.map(s => s.pPr), ...condP, ...tbl.map(s => s.pPr), defPPr].filter(Boolean);
      const pget = (tag, a) => { for (const src of pSources) { const el = kid(src, tag); if (el) { const x = attr(el, a); if (x !== null && x !== undefined) return x; } } return null; };
      const pel = tag => { for (const src of pSources) { const el = kid(src, tag); if (el) return el; } return null; };
      let jc = pget("jc", "val") || "left";
      jc = { start: "left", end: "right", distribute: "both", justify: "both" }[jc] || jc;
      const left = num(pget("ind", "left") ?? pget("ind", "start")) || 0, right = num(pget("ind", "right") ?? pget("ind", "end")) || 0;
      const fl = num(pget("ind", "firstLine")) || 0, hg = num(pget("ind", "hanging")) || 0;
      const before = num(pget("spacing", "before")) || 0, after = num(pget("spacing", "after")) || 0;
      const lineRaw = num(pget("spacing", "line")), rule = pget("spacing", "lineRule") || "auto";
      const bdr = pel("pBdr"), shd = pel("shd");
      const box = !!(bdr && Array.from(bdr.children).some(c => !/^(nil|none)$/.test(val(c) || ""))) || !!(shd && realFill(attr(shd, "fill")));
      const pb = pel("pageBreakBefore");
      const sp = kid(pPr, "sectPr"), stype = sp && val(kid(sp, "type"));
      const sectBreak = !!sp && stype !== "continuous";

      /* runs (skip those inside text boxes / nested paragraphs) */
      const runs = []; let text = "", drawings = 0, pageBreak = false, pageBreakAt = -1;
      const rSrcBase = [...sChain.map(s => s.rPr), ...(ctx.firstRow ? tbl.map(s => s.cond.firstRow && s.cond.firstRow.rPr) : []), ...tbl.map(s => s.rPr), defRPr].filter(Boolean);
      desc(p, "r").forEach(r => {
        let a = r.parentNode; while (a && !(a.namespaceURI === W && a.localName === "p")) a = a.parentNode;
        if (a !== p) return;
        if (r.parentNode && /^(del|moveFrom)$/.test(r.parentNode.localName)) return;
        const rPr = kid(r, "rPr");
        const rs = val(kid(rPr, "rStyle"));
        const src = [rPr, ...chain(rs).map(s => s.rPr), ...rSrcBase].filter(Boolean);
        const rget = tag => { for (const s of src) { const el = kid(s, tag); if (el) return el; } return null; };
        let t = "";
        Array.from(r.children).forEach(c => {
          if (c.namespaceURI !== W) return;
          if (c.localName === "t") t += c.textContent;
          else if (c.localName === "tab") t += "\t";
          else if (c.localName === "noBreakHyphen") t += "-";
          else if (c.localName === "br") { if (attr(c, "type") === "page") { pageBreak = true; pageBreakAt = text.length + t.length; } else t += "\n"; }
          else if (c.localName === "drawing" || c.localName === "pict") drawings++;
        });
        if (t) {
          const u = rget("u"), sz = rget("sz"), col = rget("color");
          runs.push({ text: t, b: !!on(rget("b")), i: !!on(rget("i")), u: !!(u && !/^none$/.test(val(u) || "single")),
            sz: sz ? num(val(sz)) / 2 : 11, color: col ? val(col) : "auto",
            box: !!(rget("bdr") && !/^(nil|none)$/.test(val(rget("bdr")) || "")) || !!(rget("shd") && realFill(attr(rget("shd"), "fill"))), hl: !!rget("highlight") || !!(rget("shd") && realFill(attr(rget("shd"), "fill"))) });
          text += t;
        }
      });
      desc(p, "drawing").forEach(imageInfo);
      drawings = Math.max(drawings, desc(p, "drawing").length + desc(p, "pict").length);
      return { text, norm: normText(text), style: sid, align: jc, ind: { left: cm(left), right: cm(right), firstLine: cm(fl - hg) },
        before: before / 20, after: after / 20, line: rule === "auto" ? (lineRaw || 240) / 240 : (lineRaw || 240) / 20, lineRule: rule,
        list, runs, box, drawings, pageBreak, sectBreak, pageBreakEnd: pageBreak && pageBreakAt >= text.trimEnd().length, pageBreakBefore: !!on(pb),
        inTable: !!ctx.inTable, table: ctx.table, row: ctx.row };
    }
    function imageInfo(d) {
      const inl = desc(d, "inline", WP)[0], anc = desc(d, "anchor", WP)[0], box = inl || anc;
      if (!box) return;
      const ext = Array.from(box.children).find(c => c.localName === "extent");
      let wrap = "inline";
      if (anc) {
        const w = Array.from(anc.children).find(c => /^wrap/.test(c.localName));
        wrap = w ? { wrapSquare: "square", wrapTight: "tight", wrapThrough: "through", wrapTopAndBottom: "topAndBottom", wrapNone: "none" }[w.localName] : "none";
        if (wrap === "none") wrap = anc.getAttribute("behindDoc") === "1" ? "behind" : "front";
      }
      images.push({ wrap, widthCm: ext ? Math.round(+ext.getAttribute("cx") / 3600) / 100 : 0, heightCm: ext ? Math.round(+ext.getAttribute("cy") / 3600) / 100 : 0 });
    }
    function walk(el, ctx) {
      Array.from(el.children).forEach(c => {
        if (c.namespaceURI !== W) return;
        if (c.localName === "p") paras.push(paraInfo(c, ctx));
        else if (c.localName === "tbl") tableInfo(c, ctx);
        else if (c.localName === "sdt") { const sc = kid(c, "sdtContent"); if (sc) walk(sc, ctx); }
        else if (c.localName === "customXml" || c.localName === "ins") walk(c, ctx);
      });
    }
    function tableInfo(t, ctx) {
      const tblPr = kid(t, "tblPr"), ts = val(kid(tblPr, "tblStyle")), tl = kid(tblPr, "tblLook");
      let firstOn = true;
      if (tl) { const fr = attr(tl, "firstRow"), v = attr(tl, "val"); if (fr !== null && fr !== undefined) firstOn = on2(fr) || fr === "1"; else if (v) firstOn = !!(parseInt(v, 16) & 0x20); }
      const ti = tables.length, info = { rows: [], nCols: kids(kid(t, "tblGrid"), "gridCol").length, headBold: false, headShaded: false };
      tables.push(info);
      const tChain = chain(ts);
      kids(t, "tr").forEach((tr, ri) => {
        const row = [];
        kids(tr, "tc").forEach(tc => {
          const start = paras.length;
          walk(tc, { inTable: true, table: ti, row: ri, tblStyle: ts, firstRow: ri === 0 && firstOn });
          const ps = paras.slice(start);
          row.push(ps.map(p => p.text).join("\n"));
          if (ri === 0) {
            const tcShd = kid(kid(tc, "tcPr"), "shd");
            const styled = tChain.some(s => (firstOn && s.cond.firstRow && s.cond.firstRow.tcPr && realFill(attr(kid(s.cond.firstRow.tcPr, "shd"), "fill"))) || (s.tcPr && realFill(attr(kid(s.tcPr, "shd"), "fill"))));
            const trShd = kid(kid(tr, "trPr"), "shd");
            (row.shaded = row.shaded || []).push(!!(tcShd && realFill(attr(tcShd, "fill"))) || styled || !!(trShd && realFill(attr(trShd, "fill"))) || ps.some(p => p.box));
            (row.bold = row.bold || []).push(ps.every(p => p.runs.filter(r => r.text.trim()).every(r => r.b)) && ps.some(p => p.text.trim()));
          }
        });
        if (ri === 0) { info.headShaded = row.shaded.length > 0 && row.shaded.every(Boolean); info.headBold = row.bold.length > 0 && row.bold.every(Boolean); }
        info.rows.push(row.map(String));
      });
      if (!info.nCols) info.nCols = Math.max(0, ...info.rows.map(r => r.length));
    }
    walk(body, {});
    for (let k = paras.length - 1; k >= 0; k--) if (!paras[k].inTable) { paras[k].last = true; break; }

    /* page setup, header, footer (all sections) */
    const sects = desc(body, "sectPr"), sect = sects[sects.length - 1];
    const pgMar = kid(sect, "pgMar"), pgSz = kid(sect, "pgSz");
    const g = (el, a, d) => { const x = num(attr(el, a)); return x === undefined || isNaN(x) ? d : x; };
    const pageOf = sp => {
      const mar = kid(sp, "pgMar"), sz = kid(sp, "pgSz");
      const pg = { top: cm(g(mar, "top", 1418)), bottom: cm(g(mar, "bottom", 1418)), left: cm(g(mar, "left", 1418)), right: cm(g(mar, "right", 1418)),
        width: cm(g(sz, "w", 11906)), height: cm(g(sz, "h", 16838)) };
      pg.landscape = attr(sz, "orient") === "landscape" || pg.width > pg.height;
      return pg;
    };
    const page = pageOf(sect), sections = sects.map(pageOf);
    const hf = async kind => {
      const out = { text: "", page: false };
      const ids = new Set(); sects.forEach(s => kids(s, kind + "Reference").forEach(r => ids.add(r.getAttributeNS(R, "id") || r.getAttribute("r:id"))));
      for (const id of ids) {
        const tgt = rels[id]; if (!tgt) continue;
        const x = await parse("word/" + tgt.replace(/^\/?word\//, "").replace(/^\//, ""));
        if (!x) continue;
        out.text += desc(x, "p").map(p => desc(p, "t").map(t => t.textContent).join("")).join("\n") + "\n";
        if (desc(x, "fldSimple").some(f => /\bPAGE\b/.test(attr(f, "instr") || "")) || desc(x, "instrText").some(t => /\bPAGE\b/.test(t.textContent))) out.page = true;
      }
      out.text = out.text.trim();
      return out;
    };
    return { paras, tables, images, page, sections, header: await hf("header"), footer: await hf("footer") };
  }

  /* ---------- checking ---------- */
  function normText(s) {
    return String(s).replace(/\s+/g, " ").trim().replace(/^([-–—•*·]\s*|\d+[.)]\s*)/, "").toLowerCase();
  }
  const az = s => /^[aáeéiíoóöőuúüű5]|^1(\D|$)|^1\d\d?\d?(\D|$)/i.test(String(s).trim()) ? "az" : "a";
  const Az = s => az(s) === "az" ? "Az" : "A";
  const short = s => { s = String(s).replace(/\s+/g, " ").trim(); return s.length > 28 ? s.slice(0, 26).trim() + "…" : s; };
  const fmtNum = (x, d = 2) => String(Math.round(x * 10 ** d) / 10 ** d).replace(".", ",");
  const ALIGN = { left: "balra igazított", center: "középre igazított", right: "jobbra igazított", both: "sorkizárt" };
  const near = (a, b, tol) => Math.abs(a - b) <= tol;

  function findParas(doc, find, opts = {}) {
    const list = doc.paras.filter(p => opts.inTable ? true : !p.inTable);
    const f = normText(find);
    return list.filter(p => opts.exact ? p.norm === f : p.norm.startsWith(f) || (opts.contains && p.norm.includes(f)));
  }
  /* what is wrong with one paragraph, or null. {P} stands for: A „…” bekezdés */
  const BTN = { left: "Balra igazítás", center: "Középre igazítás", right: "Jobbra igazítás", both: "Sorkizárt" };
  function paraProblem(p, w) {
    const runs = p.runs.filter(r => r.text.trim());
    if (w.noLeading && /^[ \t\u00a0]/.test(p.text)) return w.noLeadingMsg || "{P} elején még szóközök vannak. Töröld ki őket: az igazítás a gombok dolga!";
    if (w.noPrefix && new RegExp(w.noPrefix).test(p.text.replace(/^[ \t]+/, ""))) return "{P} " + (w.noPrefixMsg || "elején még ott van a kézzel beírt jel. Töröld ki!");
    if (w.align && p.align !== w.align) return `{P} most ${ALIGN[p.align] || p.align}. Kattints bele, és nyomd meg ${az(BTN[w.align])} ${BTN[w.align]} gombot.`;
    if (w.list && p.list !== w.list) return p.list ? (w.list === "bullet" ? "{P} számozott lista lett, de felsorolás (pöttyös lista) kell." : "{P} felsorolás lett, de számozás kell.") : (w.list === "bullet" ? "{P} még nem felsorolás." : "{P} még nincs számozva.");
    if (w.firstLine !== undefined && !near(p.ind.firstLine, w.firstLine, 0.06)) return p.ind.firstLine < -0.01 ? `{P} függő behúzást kapott (${fmtNum(-p.ind.firstLine)} cm). Első sor behúzása kell, ${fmtNum(w.firstLine)} cm.` : `{P} első sorának behúzása most ${fmtNum(p.ind.firstLine)} cm, de ${fmtNum(w.firstLine)} cm kell.`;
    if (w.left !== undefined && !near(p.ind.left, w.left, 0.06)) return `{P} bal behúzása most ${fmtNum(p.ind.left)} cm, de ${fmtNum(w.left)} cm kell.`;
    if (w.right !== undefined && !near(p.ind.right, w.right, 0.06)) return `{P} jobb behúzása most ${fmtNum(p.ind.right)} cm, de ${fmtNum(w.right)} cm kell.`;
    if (w.line !== undefined && (p.lineRule !== "auto" || !near(p.line, w.line, 0.02))) return p.lineRule !== "auto" ? `{P} sorköze „Pontosan” vagy „Legalább” értékre van állítva. Válaszd ${az(fmtNum(w.line))} ${fmtNum(w.line)} sor beállítást!` : `{P} sorköze most ${fmtNum(p.line)}, de ${fmtNum(w.line)} kell.`;
    if (w.before !== undefined && !near(p.before, w.before, 0.6)) return `{P} előtt most ${fmtNum(p.before, 1)} pt a térköz, de ${fmtNum(w.before, 1)} pt kell.`;
    if (w.after !== undefined && !near(p.after, w.after, 0.6)) return `{P} után most ${fmtNum(p.after, 1)} pt a térköz, de ${fmtNum(w.after, 1)} pt kell.`;
    if (w.box && !p.box && !(runs.length && runs.every(r => r.box))) return "{P} körül még nincs szegély vagy árnyékolás.";
    if (w.bold && !runs.every(r => r.b)) return runs.some(r => r.b) ? "{P} egy része még nem félkövér. Jelöld ki az egész sort, és úgy formázd!" : "{P} még nem félkövér.";
    if (w.italic && !runs.every(r => r.i)) return runs.some(r => r.i) ? "{P} egy része még nem dőlt. Jelöld ki az egész sort, és úgy formázd!" : "{P} még nem dőlt.";
    if (w.size !== undefined && !runs.every(r => near(r.sz, w.size, 0.01))) { const s = runs.find(r => !near(r.sz, w.size, 0.01)); return `{P} betűmérete ${fmtNum(s.sz, 1)}, de ${fmtNum(w.size, 1)} kell.`; }
    if (w.sizeMin !== undefined && !runs.every(r => r.sz >= w.sizeMin - 0.01)) { const s = runs.find(r => r.sz < w.sizeMin - 0.01); return `{P} betűmérete ${fmtNum(s.sz, 1)}, de legalább ${w.sizeMin} kell.`; }
    if (w.colored && !runs.every(r => realColor(r.color))) return "{P} betűszíne még fekete (automatikus). Válassz egy színt!";
    return null;
  }

  /* goal shapes:
     { find: "text" | ["text", …], want: { align, firstLine, left, right, line, before, after, list, box, bold, italic, size, sizeMin, colored, noLeading, noPrefix } }
     { type: "noEmpty" }  { type: "margins", cm }  { type: "landscape", value }  { type: "header", contains }  { type: "footerPage" }
     { type: "table", cols, rows, first, contains: [..], headBold, headShaded }  { type: "image", wrap: [..], maxWidth, minWidth }
     { type: "pageBreakBefore", find } */
  function check(doc, goal) {
    const T = goal.type;
    if (!T) {
      const finds = Array.isArray(goal.find) ? goal.find : [goal.find];
      let done = 0, msg = null;
      for (const f of finds) {
        const ps = findParas(doc, f, goal);
        let m = null;
        if (!ps.length) m = `Nem találom ${az(f)} „${short(f)}” kezdetű bekezdést. Nem törölted ki véletlenül? Ha igen, a Visszavonás gomb (Ctrl+Z) visszahozza.`;
        else { const pr = ps.map(p => paraProblem(p, goal.want || {})).find(Boolean); if (pr) m = pr.replace("{P}", `${Az(f)} „${short(f)}” bekezdés`); }
        if (m) { if (!msg) msg = m; } else done++;
      }
      return { ok: done === finds.length, done, total: finds.length, msg };
    }
    const one = (ok, msg) => ({ ok, done: ok ? 1 : 0, total: 1, msg: ok ? null : msg });
    if (T === "noEmpty") {
      const empty = doc.paras.filter((p, k) => !p.inTable && !p.last && !p.text.trim() && !p.drawings && !p.pageBreak && !p.sectBreak && !(doc.paras[k + 1] && doc.paras[k + 1].inTable) && !(doc.paras[k - 1] && doc.paras[k - 1].inTable));
      const allow = goal.allow || 0;
      return one(empty.length <= allow, `Még ${empty.length} üres bekezdés van a szövegben (egy ¶ jel egymagában egy sorban). Töröld ki őket: a hely a térközből jöjjön, ne üres sorokból!`);
    }
    if (T === "margins") {
      const HUs = { top: "felső", bottom: "alsó", left: "bal", right: "jobb" };
      const odd = (doc.sections || []).find(sc => ["top", "bottom", "left", "right"].some(k => !near(sc[k], goal.cm, 0.06)));
      if (odd && odd !== doc.sections[doc.sections.length - 1]) return one(false, `A dokumentum egyik részében (szakaszában) még más a margó. Az Egyéni margók ablakban az Alkalmaz legyen „Teljes dokumentum”, és állítsd be újra.`);
      const bad = ["top", "bottom", "left", "right"].filter(k => !near(doc.page[k], goal.cm, 0.06));
      const HU = { top: "felső", bottom: "alsó", left: "bal", right: "jobb" };
      return one(!bad.length, bad.length ? `${Az(HU[bad[0]])} ${HU[bad[0]]} margó most ${fmtNum(doc.page[bad[0]])} cm, de ${fmtNum(goal.cm)} cm kell.${bad.length === 4 ? " Mind a négyet át kell állítani." : bad.length > 1 ? ` Még ${bad.length} margó nem jó.` : ""}` : "");
    }
    if (T === "landscape") return one(doc.page.landscape === goal.value, goal.value ? "Az oldal még álló. Fekvő tájolás kell." : "Az oldal fekvő. Álló tájolás kell.");
    if (T === "header") {
      if (!doc.header.text) return one(false, "Még nincs élőfej. Kattints duplán az oldal tetejére, vagy: Beszúrás › Élőfej.");
      return one(normText(doc.header.text).includes(normText(goal.contains)), `Az élőfejben ez áll: „${short(doc.header.text)}”. Ezt kell beleírni: „${goal.contains}”.`);
    }
    if (T === "footerPage") {
      if (doc.footer.page) return one(true);
      return one(false, /\d/.test(doc.footer.text) ? "Az élőlábban egy beírt szám van, nem oldalszám. Az oldalszámot a Beszúrás › Oldalszám menüből szúrd be, így minden oldalon magától változik." : "Az élőlábban még nincs oldalszám. Beszúrás › Oldalszám › Lap alja.");
    }
    if (T === "table") {
      const t = doc.tables.find(t => !goal.first || normText(t.rows[0] && t.rows[0][0] || "").startsWith(normText(goal.first))) || doc.tables[0];
      if (!t) return one(false, "Még nincs táblázat a dokumentumban. Beszúrás › Táblázat.");
      if (goal.cols && t.nCols !== goal.cols) return one(false, `A táblázatnak ${t.nCols} oszlopa van, de ${goal.cols} kell.`);
      if (goal.rows && t.rows.length !== goal.rows) return one(false, `A táblázatnak ${t.rows.length} sora van, de ${goal.rows} kell. ${t.rows.length < goal.rows ? "Az utolsó cellában a Tab billentyű új sort ad hozzá." : "A felesleges sort jelöld ki, és Elrendezés › Törlés › Sorok törlése."}`);
      const all = normText(t.rows.flat().join(" "));
      const miss = (goal.contains || []).find(c => !all.includes(normText(c)));
      if (miss) return one(false, `A táblázatból még hiányzik ez: „${miss}”. Nézd meg a mintát!`);
      if (goal.first && !normText(t.rows[0][0] || "").startsWith(normText(goal.first))) return one(false, `A táblázat bal felső cellájába ez kell: „${goal.first}”.`);
      if (goal.headBold && !t.headBold) return one(false, "Az első sor (a fejléc) még nem félkövér.");
      if (goal.headShaded && !t.headShaded) return one(false, "Az első sornak még nincs háttérszíne. Jelöld ki az első sort, és Táblázattervezés › Mintázat (Árnyékolás).");
      return one(true);
    }
    if (T === "image") {
      if (!doc.images.length) return one(false, "Még nincs kép a dokumentumban. Beszúrás › Képek › Ez az eszköz…");
      const im = doc.images[0];
      const WR = { inline: "Szöveggel egy sorban", square: "Négyzetes", tight: "Szoros", through: "Átfutó", topAndBottom: "Felül és alul", behind: "Szöveg mögött", front: "Szöveg előtt" };
      if (goal.wrap && !goal.wrap.includes(im.wrap)) return one(false, `A kép körbefuttatása most „${WR[im.wrap]}”, de „${WR[goal.wrap[0]]}” kell. Kattints a képre, és a jobb felső sarkában lévő Elrendezési beállítások gombbal válaszd ki.`);
      if (goal.maxWidth && im.widthCm > goal.maxWidth + 0.05) return one(false, `A kép ${fmtNum(im.widthCm, 1)} cm széles. Kicsinyítsd le, hogy legfeljebb ${fmtNum(goal.maxWidth)} cm legyen: fogd meg a sarkát, és húzd befelé.`);
      if (goal.minWidth && im.widthCm < goal.minWidth - 0.05) return one(false, `A kép csak ${fmtNum(im.widthCm, 1)} cm széles, ez túl kicsi. Legyen legalább ${fmtNum(goal.minWidth)} cm.`);
      return one(true);
    }
    if (T === "pageBreakBefore") {
      const ps = doc.paras.filter(p => !p.inTable), k = ps.findIndex(p => p.norm.startsWith(normText(goal.find)));
      if (k < 0) return one(false, `Nem találom ${az(goal.find)} „${short(goal.find)}” kezdetű bekezdést.`);
      let ok = ps[k].pageBreakBefore || (ps[k].pageBreak && !ps[k].pageBreakEnd);
      let enters = 0;
      for (let j = k - 1; j >= 0 && !ok; j--) {
        const q = ps[j];
        if ((q.pageBreak && (q.pageBreakEnd || !q.text.trim())) || q.sectBreak) { ok = true; break; }
        if (q.text.trim() || q.drawings) break;
        enters++;
      }
      return one(ok, enters > 1 ? `${Az(goal.find)} „${short(goal.find)}” előtt ${enters} üres bekezdés van, de nincs oldaltörés. Töröld ki az üres sorokat, és tegyél oda oldaltörést: Ctrl+Enter.` : `${Az(goal.find)} „${short(goal.find)}” előtt még nincs oldaltörés. Kattints a szó elé, és nyomd meg: Ctrl+Enter.`);
    }
    return one(false, "Ismeretlen ellenőrzés.");
  }

  window.DOCX = { read, check, normText, az, Az, findParas };
})();
