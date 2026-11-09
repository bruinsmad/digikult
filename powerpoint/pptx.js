/* digikult — read a saved PowerPoint file (.pptx) right in the browser, without sending it anywhere.
   A .pptx is a zip of XML files. PPTX.read(file) unzips it with the browser's own DecompressionStream
   and returns, slide by slide, the shapes and the animations:
     { slides: [{ no, shapes: [shape], anims: [anim] }] }
     shape = { id, name, kind: "sp"|"grp"|"cxn"|"pic"|"other", prst, w, h, rot, fill, line, text, parent, kids }
       fill = { type: "solid"|"none"|"grad"|"pic"|"patt"|null (null: the default from the theme), color }
       line = { set: bool, none: bool, w (pt), color }
     anim  = { n, spid, shape, cls: "entr"|"emph"|"exit"|"path", preset, sub, start: "click"|"with"|"after", delay, dur, motion }
       (times in ms; motion = the path of a motion path, e.g. "M 0 0 L 0 -0.4 E", in parts of the slide size)
   Shapes inside a group have parent = the group; PPTX.top(shape) climbs to the outermost group. */
(function () {
  "use strict";

  /* ---------- unzip ---------- */
  async function inflate(bytes) {
    const ds = new DecompressionStream("deflate-raw");
    const out = new Blob([bytes]).stream().pipeThrough(ds);
    return new Uint8Array(await new Response(out).arrayBuffer());
  }
  async function unzip(buf) {
    const u8 = new Uint8Array(buf), dv = new DataView(buf);
    let eocd = -1;
    for (let i = u8.length - 22; i >= Math.max(0, u8.length - 66000); i--) if (dv.getUint32(i, true) === 0x06054b50) { eocd = i; break; }
    if (eocd < 0) throw new Error("not a zip");
    const count = dv.getUint16(eocd + 10, true);
    let p = dv.getUint32(eocd + 16, true);
    const files = {}, dec = new TextDecoder();
    for (let k = 0; k < count; k++) {
      if (dv.getUint32(p, true) !== 0x02014b50) throw new Error("bad zip directory");
      const method = dv.getUint16(p + 10, true), csize = dv.getUint32(p + 20, true);
      const nlen = dv.getUint16(p + 28, true), xlen = dv.getUint16(p + 30, true), clen = dv.getUint16(p + 32, true);
      const local = dv.getUint32(p + 42, true);
      const name = dec.decode(u8.subarray(p + 46, p + 46 + nlen));
      const lstart = local + 30 + dv.getUint16(local + 26, true) + dv.getUint16(local + 28, true);
      files[name] = { method, data: u8.subarray(lstart, lstart + csize) };
      p += 46 + nlen + xlen + clen;
    }
    return {
      names: Object.keys(files),
      async text(name) {
        const f = files[name]; if (!f) return null;
        const raw = f.method === 0 ? f.data : f.method === 8 ? await inflate(f.data) : null;
        if (!raw) throw new Error("unsupported compression");
        return dec.decode(raw);
      }
    };
  }

  /* ---------- xml helpers (by local name, so the prefixes don't matter) ---------- */
  const kids = (el, name) => el ? Array.from(el.children).filter(c => c.localName === name) : [];
  const kid = (el, name) => kids(el, name)[0] || null;
  const path = (el, ...names) => names.reduce((e, n) => kid(e, n), el);
  const all = (el, name) => el ? Array.from(el.getElementsByTagNameNS("*", name)) : [];
  const num = (v, d = 0) => (v === null || v === undefined || v === "" || isNaN(+v)) ? d : +v;

  function colorOf(el) {
    if (!el) return null;
    const c = Array.from(el.children).find(x => /Clr$/.test(x.localName));
    if (!c) return null;
    const mods = Array.from(c.children).map(m => m.localName + "=" + m.getAttribute("val")).join(",");
    return (c.getAttribute("val") || c.getAttribute("lastClr") || c.localName) + (mods ? "/" + mods : "");
  }
  function fillOf(spPr) {
    for (const [tag, type] of [["solidFill", "solid"], ["noFill", "none"], ["gradFill", "grad"], ["blipFill", "pic"], ["pattFill", "patt"]]) {
      const f = kid(spPr, tag);
      if (f) return { type, color: type === "solid" ? colorOf(f) : type === "grad" ? all(f, "gs").map(g => colorOf(g)).join("|") : null };
    }
    return { type: null, color: null };
  }
  function lineOf(spPr) {
    const ln = kid(spPr, "ln");
    if (!ln) return { set: false, none: false, w: null, color: null };
    return { set: true, none: !!kid(ln, "noFill"), w: ln.hasAttribute("w") ? num(ln.getAttribute("w")) / 12700 : null, color: colorOf(kid(ln, "solidFill")) };
  }

  /* ---------- shapes ---------- */
  function readTree(tree, parent, out, scale) {
    for (const el of Array.from(tree.children)) {
      const ln = el.localName;
      if (!["sp", "grpSp", "cxnSp", "pic", "graphicFrame"].includes(ln)) continue;
      const nv = Array.from(el.children).find(c => /^nv/.test(c.localName));
      const c = kid(nv, "cNvPr");
      const spPr = kid(el, ln === "grpSp" ? "grpSpPr" : "spPr") || kid(el, "xfrm");
      const xfrm = kid(spPr, "xfrm") || kid(el, "xfrm");
      const ext = kid(xfrm, "ext");
      const w = num(ext && ext.getAttribute("cx")) * scale.x, h = num(ext && ext.getAttribute("cy")) * scale.y;
      const s = {
        id: c ? c.getAttribute("id") : null, name: c ? c.getAttribute("name") || "" : "",
        kind: ln === "grpSp" ? "grp" : ln === "cxnSp" ? "cxn" : ln === "pic" ? "pic" : ln === "sp" ? "sp" : "other",
        prst: (path(spPr, "prstGeom") || {}).getAttribute ? path(spPr, "prstGeom").getAttribute("prst") : (kid(spPr, "custGeom") ? "custom" : null),
        w, h, rot: num(xfrm && xfrm.getAttribute("rot")) / 60000,
        flip: !!(xfrm && (xfrm.getAttribute("flipH") === "1" || xfrm.getAttribute("flipV") === "1")),
        fill: fillOf(spPr), line: lineOf(spPr),
        text: all(kid(el, "txBody"), "t").map(t => t.textContent).join("").trim(),
        placeholder: !!all(nv, "ph").length,
        parent, kids: []
      };
      out.push(s);
      if (parent) parent.kids.push(s);
      if (ln === "grpSp") {
        const chExt = kid(xfrm, "chExt");
        const sx = chExt && num(chExt.getAttribute("cx")) ? num(ext.getAttribute("cx")) / num(chExt.getAttribute("cx")) : 1;
        const sy = chExt && num(chExt.getAttribute("cy")) ? num(ext.getAttribute("cy")) / num(chExt.getAttribute("cy")) : 1;
        readTree(el, s, out, { x: scale.x * sx, y: scale.y * sy });
      }
    }
  }

  /* ---------- animations ---------- */
  const START = { clickEffect: "click", withEffect: "with", afterEffect: "after" };
  function readTiming(doc, byId) {
    const timing = all(doc, "timing")[0];
    if (!timing) return [];
    const list = [];
    all(timing, "cTn").forEach(ct => {
      const cls = ct.getAttribute("presetClass");
      if (!cls || !["entr", "emph", "exit", "path"].includes(cls)) return;
      const tgt = all(ct, "spTgt")[0], spid = tgt ? tgt.getAttribute("spid") : null;
      const cond = path(ct, "stCondLst", "cond");
      const durs = all(ct, "cTn").map(x => x.getAttribute("dur")).filter(d => d && !isNaN(+d)).map(Number);
      list.push({
        n: list.length + 1, spid, shape: byId[spid] || null, cls,
        preset: num(ct.getAttribute("presetID"), null), sub: num(ct.getAttribute("presetSubtype"), null),
        start: START[ct.getAttribute("nodeType")] || "click",
        delay: cond ? num(cond.getAttribute("delay")) : 0, dur: durs.length ? Math.max(...durs) : 0,
        motion: cls === "path" && all(ct, "animMotion")[0] ? all(ct, "animMotion")[0].getAttribute("path") : null
      });
    });
    return list;
  }

  async function read(file) {
    const z = await unzip(await file.arrayBuffer());
    if (!z.names.includes("ppt/presentation.xml")) throw new Error("not a pptx");
    const P = new DOMParser();
    const pres = P.parseFromString(await z.text("ppt/presentation.xml"), "application/xml");
    const rels = P.parseFromString(await z.text("ppt/_rels/presentation.xml.rels") || "<r/>", "application/xml");
    const target = {}; all(rels, "Relationship").forEach(r => target[r.getAttribute("Id")] = r.getAttribute("Target"));
    let order = all(pres, "sldId").map(s => s.getAttributeNS("http://schemas.openxmlformats.org/officeDocument/2006/relationships", "id") || s.getAttribute("r:id")).map(id => target[id]).filter(Boolean)
      .map(t => "ppt/" + t.replace(/^\/?ppt\//, "").replace(/^\.\//, ""));
    if (!order.length) order = z.names.filter(n => /^ppt\/slides\/slide\d+\.xml$/.test(n)).sort((a, b) => parseInt(a.match(/\d+/)) - parseInt(b.match(/\d+/)));
    const slides = [];
    for (let i = 0; i < order.length; i++) {
      const xml = await z.text(order[i]); if (!xml) continue;
      const doc = P.parseFromString(xml, "application/xml");
      const shapes = [], tree = all(doc, "spTree")[0];
      if (tree) readTree(tree, null, shapes, { x: 1, y: 1 });
      const byId = {}; shapes.forEach(s => { if (s.id) byId[s.id] = s; });
      slides.push({ no: i + 1, shapes, anims: readTiming(doc, byId) });
    }
    return { slides };
  }

  /* ---------- small questions the missions ask about a deck ---------- */
  const top = s => { while (s && s.parent) s = s.parent; return s; };
  const inside = (s, g) => { for (let p = s; p; p = p.parent) if (p === g) return true; return false; };
  const RECT = ["rect", "roundRect", "snip1Rect", "snip2SameRect", "snipRoundRect", "round1Rect", "round2SameRect", "plaque", "frame", "bevel"];
  const isRect = s => s.kind === "sp" && RECT.includes(s.prst);
  const isEllipse = s => s.kind === "sp" && s.prst === "ellipse";
  const isCircle = s => isEllipse(s) && s.w > 0 && s.h > 0 && Math.abs(s.w / s.h - 1) < 0.04;
  const isCallout = s => s.kind === "sp" && /Callout|cloud/i.test(s.prst || "");
  const drawn = sl => sl.shapes.filter(s => (s.kind === "sp" || s.kind === "cxn") && !s.placeholder);
  const norm = t => String(t || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]/g, "");
  const byName = (sl, name) => sl.shapes.find(s => norm(s.name) === norm(name)) || null;
  const animsOf = (sl, shape) => sl.anims.filter(a => a.shape && inside(a.shape, shape));

  /* where a motion path ends, as [x, y] in parts of the slide size (negative y: upwards) */
  const pathEnd = m => { const n = String(m || "").match(/-?\d*\.?\d+(?:e-?\d+)?/gi); return n && n.length >= 2 ? [+n[n.length - 2], +n[n.length - 1]] : null; };

  window.PPTX = { read, pathEnd, unzip, top, inside, isRect, isEllipse, isCircle, isCallout, drawn, byName, animsOf, norm };
})();
