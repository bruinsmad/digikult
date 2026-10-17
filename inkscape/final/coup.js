/* Coup! – the Inkscape final project.
   Students answer the questions of the "command tent"; the answers deterministically produce a banner
   (layout, colours, frame, symbol, stars, name, motto) and the guided Inkscape steps for exactly that banner.
   Saved in this browser under KEY as {answers, locked, solved:[1..7], checks:[…], end}. The landing page reads
   "solved" (nav.js → progress chapters 7). Everything is drawn as inline SVG – no images to download. */
(function () {
  "use strict";
  const KEY = "coup-v1";
  const W = 300, H = 180;
  const $ = s => document.querySelector(s);
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

  /* ------------------------------------------------------------------ countries: flag colours */
  const COUNTRIES = [
    ["Albania", "#E41E20 #000000"], ["Argentina", "#74ACDF #FFFFFF #F6B40E"], ["Armenia", "#D90012 #0033A0 #F2A800"],
    ["Australia", "#012169 #FFFFFF #E4002B"], ["Austria", "#C8102E #FFFFFF"], ["Bangladesh", "#006A4E #F42A41"],
    ["Belgium", "#000000 #FDDA24 #EF3340"], ["Bhutan", "#FFD520 #FF4E12 #FFFFFF"], ["Bolivia", "#D52B1E #F9E300 #007934"],
    ["Brazil", "#009C3B #FFDF00 #002776 #FFFFFF"], ["Bulgaria", "#FFFFFF #00966E #D62612"], ["Cameroon", "#007A5E #CE1126 #FCD116"],
    ["Canada", "#FF0000 #FFFFFF"], ["Chile", "#0039A6 #FFFFFF #D52B1E"], ["China", "#EE1C25 #FFFF00"],
    ["Colombia", "#FCD116 #003893 #CE1126"], ["Croatia", "#FF0000 #FFFFFF #171796"], ["Cuba", "#002A8F #FFFFFF #CF142B"],
    ["Czechia", "#FFFFFF #D7141A #11457E"], ["Denmark", "#C8102E #FFFFFF"], ["Ecuador", "#FFDD00 #034EA2 #ED1C24"],
    ["Egypt", "#CE1126 #FFFFFF #000000 #C09300"], ["Estonia", "#0072CE #000000 #FFFFFF"], ["Ethiopia", "#078930 #FCDD09 #DA121A #0F47AF"],
    ["Finland", "#FFFFFF #002F6C"], ["France", "#002395 #FFFFFF #ED2939"], ["Georgia", "#FFFFFF #FF0000"],
    ["Germany", "#000000 #DD0000 #FFCE00"], ["Ghana", "#CE1126 #FCD116 #006B3F #000000"], ["Greece", "#0D5EAF #FFFFFF"],
    ["Hungary", "#CE2939 #FFFFFF #477050"], ["Iceland", "#02529C #FFFFFF #DC1E35"], ["India", "#FF9933 #FFFFFF #138808 #000080"],
    ["Indonesia", "#FF0000 #FFFFFF"], ["Ireland", "#169B62 #FFFFFF #FF883E"], ["Italy", "#009246 #FFFFFF #CE2B37"],
    ["Jamaica", "#009B3A #FED100 #000000"], ["Japan", "#FFFFFF #BC002D"], ["Kazakhstan", "#00AFCA #FEC50C"],
    ["Kenya", "#000000 #BB0000 #006600 #FFFFFF"], ["Latvia", "#9E3039 #FFFFFF"], ["Lithuania", "#FDB913 #006A44 #C1272D"],
    ["Luxembourg", "#EF3340 #FFFFFF #00A3E0"], ["Madagascar", "#FFFFFF #FC3D32 #007E3A"], ["Malaysia", "#CC0001 #FFFFFF #010066 #FFCC00"],
    ["Malta", "#FFFFFF #CF142B"], ["Mexico", "#006847 #FFFFFF #CE1126"], ["Monaco", "#CE1126 #FFFFFF"],
    ["Mongolia", "#C4272F #015197 #F9CF02"], ["Morocco", "#C1272D #006233"], ["Nepal", "#DC143C #003893 #FFFFFF"],
    ["Netherlands", "#AE1C28 #FFFFFF #21468B"], ["New Zealand", "#00247D #FFFFFF #CC142B"], ["Nigeria", "#008751 #FFFFFF"],
    ["Norway", "#BA0C2F #FFFFFF #00205B"], ["Pakistan", "#01411C #FFFFFF"], ["Panama", "#FFFFFF #DA121A #072357"],
    ["Peru", "#D91023 #FFFFFF"], ["Philippines", "#0038A8 #CE1126 #FFFFFF #FCD116"], ["Poland", "#FFFFFF #DC143C"],
    ["Portugal", "#006600 #FF0000 #FFFF00"], ["Qatar", "#8A1538 #FFFFFF"], ["Romania", "#002B7F #FCD116 #CE1126"],
    ["Senegal", "#00853F #FDEF42 #E31B23"], ["Serbia", "#C6363C #0C4076 #FFFFFF"], ["Seychelles", "#003F87 #FCD856 #D62828 #007A3D"],
    ["Slovakia", "#FFFFFF #0B4EA2 #EE1C25"], ["Slovenia", "#FFFFFF #005DA4 #ED1C24"], ["South Africa", "#007749 #FFB81C #DE3831 #002395"],
    ["South Korea", "#FFFFFF #CD2E3A #0047A0 #000000"], ["Spain", "#AA151B #F1BF00"], ["Sweden", "#006AA7 #FECC00"],
    ["Switzerland", "#DA291C #FFFFFF"], ["Tanzania", "#1EB53A #FCD116 #000000 #00A3DD"], ["Thailand", "#A51931 #F4F5F8 #2D2A4A"],
    ["Tunisia", "#E70013 #FFFFFF"], ["Turkey", "#E30A17 #FFFFFF"], ["Uganda", "#000000 #FCDC04 #D90000"],
    ["United Kingdom", "#012169 #FFFFFF #C8102E"], ["United States", "#B22234 #FFFFFF #3C3B6E"], ["Uruguay", "#FFFFFF #0038A8 #FCD116"],
    ["Venezuela", "#FFCC00 #00247D #CF142B"], ["Vietnam", "#DA251D #FFFF00"], ["Zambia", "#198A00 #EF7D00 #DE2010 #000000"]
  ].map(([n, c]) => ({ n, c: c.split(" ") }));

  const PRIDE = {
    industry: { label: "Industry", sym: "gear", icon: "⚙️" },
    farming: { label: "Farming", sym: "sun", icon: "🌾" },
    sea: { label: "The sea", sym: "waves", icon: "🌊" },
    mountains: { label: "Mountains", sym: "mountains", icon: "⛰️" },
    forests: { label: "Forests", sym: "tree", icon: "🌲" },
    science: { label: "Science", sym: "atom", icon: "⚛️" },
    kings: { label: "Old kings & history", sym: "crown", icon: "👑" },
    night: { label: "The night sky", sym: "crescent", icon: "🌙" },
    freedom: { label: "Freedom", sym: "star", icon: "⭐" }
  };
  const MOTTOS = ["Order and Bread", "Forward, Always", "Strength in Unity", "No Going Back", "Bread, Peace, WiFi",
    "From the Ashes", "One Land, One Voice", "Iron and Honey", "We Never Sleep", "Peace Through Paperwork"];
  const NAMES = ["Republic of Nova", "Iron Federation", "United Provinces", "People's Union", "Grand Duchy", "Free State"];

  /* ------------------------------------------------------------------ colour helpers */
  const rgb = h => { h = h.replace("#", ""); return [0, 2, 4].map(i => parseInt(h.substr(i, 2), 16)); };
  const lum = h => { const c = rgb(h).map(v => { v /= 255; return v <= .03928 ? v / 12.92 : Math.pow((v + .055) / 1.055, 2.4); }); return .2126 * c[0] + .7152 * c[1] + .0722 * c[2]; };
  const contrast = (a, b) => { const x = lum(a), y = lum(b); return (Math.max(x, y) + .05) / (Math.min(x, y) + .05); };
  const close = (a, b) => rgb(a).reduce((s, v, i) => s + Math.abs(v - rgb(b)[i]), 0) < 60;
  const WHITE = "#FFFFFF", BLACK = "#111111";
  /* best colour on a background: a palette colour if one stands out enough (keeps the country's look), else a neutral */
  function best(bg, cands, palette, avoid) {
    const ok = c => !(avoid && avoid.some(a => close(a, c))) && !close(c, bg);
    const pick = list => list.filter(ok).sort((a, b) => contrast(bg, b) - contrast(bg, a))[0];
    const fromPal = pick(cands.filter(c => palette.some(p => close(p, c))));
    if (fromPal && contrast(bg, fromPal) >= 2.6) return fromPal;
    return pick(cands) || (lum(bg) > .4 ? BLACK : WHITE);
  }
  /* one colour that must stand out on several backgrounds: maximise the worst contrast */
  function bestMulti(bgs, cands, palette, avoid) {
    const ok = c => !(avoid && avoid.some(a => close(a, c))) && !bgs.some(b => close(c, b));
    const worst = c => Math.min(...bgs.map(b => contrast(b, c)));
    const pick = list => list.filter(ok).sort((a, b) => worst(b) - worst(a))[0];
    const fromPal = pick(cands.filter(c => palette.some(p => close(p, c))));
    if (fromPal && worst(fromPal) >= 2.6) return fromPal;
    return pick(cands) || pick([WHITE, BLACK]) || WHITE;
  }
  const worstC = (c, bgs) => Math.min(...bgs.map(b => contrast(b, c)));
  const uniq = a => a.filter((c, i) => a.findIndex(d => close(c, d)) === i);
  const hex6 = h => h.replace("#", "").toLowerCase();

  /* ------------------------------------------------------------------ geometry helpers */
  const r1 = v => Math.round(v * 10) / 10;
  function starPts(cx, cy, R, ratio, n, rot = -90) {
    const p = [];
    for (let i = 0; i < 2 * n; i++) {
      const a = (rot + i * 180 / n) * Math.PI / 180, rr = i % 2 ? R * ratio : R;
      p.push([cx + rr * Math.cos(a), cy + rr * Math.sin(a)]);
    }
    return p;
  }
  function polyPts(cx, cy, R, n, rot = -90) {
    const p = [];
    for (let i = 0; i < n; i++) { const a = (rot + i * 360 / n) * Math.PI / 180; p.push([cx + R * Math.cos(a), cy + R * Math.sin(a)]); }
    return p;
  }
  const ptsAttr = p => p.map(q => q.map(r1).join(",")).join(" ");
  const bboxPts = p => { const xs = p.map(q => q[0]), ys = p.map(q => q[1]); return [Math.min(...xs), Math.min(...ys), Math.max(...xs), Math.max(...ys)]; };
  const xywh = b => `X ${r1(b[0])}, Y ${r1(b[1])}, W ${r1(b[2] - b[0])}, H ${r1(b[3] - b[1])}`;
  const circB = (cx, cy, r) => [cx - r, cy - r, cx + r, cy + r];
  function inPoly(x, y, p) {
    let ins = false;
    for (let i = 0, j = p.length - 1; i < p.length; j = i++) {
      const [xi, yi] = p[i], [xj, yj] = p[j];
      if ((yi > y) !== (yj > y) && x < (xj - xi) * (y - yi) / (yj - yi) + xi) ins = !ins;
    }
    return ins;
  }

  /* ------------------------------------------------------------------ instruction helpers */
  const T = t => `<img class="ti" src="../img/common/tools/${t}.png" alt="${t} tool" title="${t} tool">`;
  const M = t => `<span class="menu">${t}</span>`;
  const K = t => `<span class="key">${t}</span>`;
  const C = h => `<span class="sw" style="--c:${h}"></span><code class="hex">${hex6(h)}ff</code>`;
  const SIZE = b => `<span class="nums">${xywh(b)}</span>`;
  const fillRow = h => `${M("Object ▸ Fill and Stroke…")} <i>Fill</i> tab → RGBA ${C(h)}, <i>Stroke paint</i> → <b>X</b>`;
  const pt = mm => Math.round(mm / 0.3528);   /* SVG font-size (mm, em) → Inkscape pt */

  /* ------------------------------------------------------------------ the generator */
  const TABLE = {
    demo: { L: { P: "tri-v", M: "tri-v", A: "diagonal" }, C: { P: "tri-h", M: "bi-h", A: "cross" }, R: { P: "canton", M: "canton", A: "cross" } },
    auth: { L: { P: "diagonal", M: "triangle", A: "triangle" }, C: { P: "border", M: "tri-h", A: "border" }, R: { P: "cross", M: "bi-h", A: "border" } }
  };
  const LAYOUT_NAME = { "tri-h": "horizontal tricolour", "tri-v": "vertical tricolour", "bi-h": "two stripes", cross: "Nordic cross",
    triangle: "hoist triangle", diagonal: "diagonal band", canton: "canton with stars", border: "bordered field" };
  const bucket = v => v < 34 ? "L" : v < 67 ? "C" : "R";

  function build(A) {
    let uid = 0; const id = p => `${p}${++uid}`;
    /* palette: chosen main colour first */
    let pal = (A.palette || []).filter(Boolean).map(c => c.toUpperCase());
    pal = pal.filter((c, i) => pal.findIndex(d => close(c, d)) === i);
    if (!pal.length) pal = ["#CE2939", WHITE];
    const main = pal.find(c => close(c, A.main || "")) || pal[0];
    pal = [main, ...pal.filter(c => !close(c, main))];
    if (pal.length === 1) pal.push(lum(main) > .4 ? BLACK : WHITE);
    const f0 = pal[0], f1 = pal[1], f2 = pal[2] || pal[0];
    const cands = [...pal, WHITE, BLACK];
    const regime = A.regime === "auth" ? "auth" : "demo";
    const lr = bucket(+A.lr), arm = bucket(+A.army);
    const armK = { L: "P", C: "M", R: "A" }[arm];
    const layout = TABLE[regime][lr][armK];
    const N = Math.max(1, Math.min(9, +A.provinces || 3));
    const pride = PRIDE[A.pride] ? A.pride : "freedom";
    const name = (A.name || "Republic of Nova").trim().slice(0, 26) || "Republic of Nova";
    const motto = (A.motto || "Forward, Always").trim().slice(0, 32) || "Forward, Always";
    const NAME = name.toUpperCase(), MOTTO = motto.toUpperCase();

    /* emblem placement */
    let cx = 150, cy = regime === "auth" ? 82 : 88, r = regime === "auth" ? 40 : 36;
    if (layout === "triangle") { cx = 196; }
    if (layout === "cross") { cx = 102; cy = 90; r = regime === "auth" ? 32 : 30; }
    if (layout === "canton") { cx = 212; }
    if (layout === "border") { r = regime === "auth" ? 42 : 38; }

    const items = [];          /* {step, svg, b: bbox} */
    const add = (step, svg, b) => items.push({ step, svg, b });
    const steps = {};          /* step → {title, lead, list:[html], note, stuck:[]} */
    const skills = new Set(["Rectangle & Ellipse tools", "Exact colours (RGBA)", "Exact sizes (X, Y, W, H)", "Text tool"]);
    const why = [];

    /* ---------- STEP 1: field ---------- */
    let colorAt = () => f0;
    const rect = (x, y, w, h, c) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${c}"/>`;
    const L1 = [];
    const stripeSteps = (dir, cols) => {
      const n = cols.length, sz = (dir === "h" ? H : W) / n;
      cols.forEach((c, i) => {
        const b = dir === "h" ? [0, i * sz, W, (i + 1) * sz] : [i * sz, 0, (i + 1) * sz, H];
        add(1, rect(b[0], b[1], b[2] - b[0], b[3] - b[1], c), b);
        L1.push(i === 0
          ? `${T("rect")} Draw a rectangle, then ${T("selector")} type ${SIZE(b)} in the tool controls bar. ${fillRow(c)}.`
          : `${M("Edit ▸ Duplicate")}, type <b>${dir === "h" ? "Y " + r1(b[1]) : "X " + r1(b[0])}</b>, fill RGBA ${C(c)}.`);
      });
      colorAt = (x, y) => cols[Math.min(n - 1, Math.floor((dir === "h" ? y : x) / sz))];
    };
    if (layout === "tri-h") stripeSteps("h", [f0, f1, f2]);
    if (layout === "tri-v") stripeSteps("v", [f0, f1, f2]);
    if (layout === "bi-h") stripeSteps("h", [f0, f1]);
    if (layout === "canton") {
      stripeSteps("h", [f1, f2 === f0 ? (pal[3] || WHITE) : f2, f1]);
      const cb = [0, 0, 130, 90]; const prev = colorAt;
      add(1, rect(0, 0, 130, 90, f0), cb);
      L1.push(`${T("rect")} The canton: a rectangle, ${SIZE(cb)}, fill RGBA ${C(f0)}. Your provinces' stars go here in step 5.`);
      colorAt = (x, y) => (x < 130 && y < 90) ? f0 : prev(x, y);
    }
    if (layout === "cross") {
      add(1, rect(0, 0, W, H, f1), [0, 0, W, H]);
      const hb = [0, cy - 18, W, cy + 18], vb = [cx - 18, 0, cx + 18, H];
      add(1, `<path d="M${hb[0]} ${hb[1]}H${hb[2]}V${hb[3]}H${hb[0]}Z M${vb[0]} ${vb[1]}H${vb[2]}V${vb[3]}H${vb[0]}Z" fill="${f0}" fill-rule="nonzero"/>`, [0, 0, W, H]);
      L1.push(`${T("rect")} Background: rectangle ${SIZE([0, 0, W, H])}. ${fillRow(f1)}.`,
        `${T("rect")} Horizontal bar ${SIZE(hb)}, then vertical bar ${SIZE(vb)}. Both RGBA ${C(f0)}.`,
        `${T("selector")} Click one bar, ${K("Shift")} + click the other → ${M("Path ▸ Union")}: one cross.`);
      colorAt = (x, y) => (Math.abs(y - cy) < 18 || Math.abs(x - cx) < 18) ? f0 : f1;
      skills.add("Union");
    }
    if (layout === "triangle") {
      stripeSteps("h", [f1, f2 === f0 ? (pal[3] || (lum(f1) > .4 ? BLACK : WHITE)) : f2]);
      const tri = [[0, 0], [120, 90], [0, 180]]; const prev = colorAt;
      add(1, `<polygon points="${ptsAttr(tri)}" fill="${f0}"/>`, [0, 0, 120, 180]);
      L1.push(`${T("rect")} A rectangle ${SIZE([0, 0, 120, 180])}, RGBA ${C(f0)}.`,
        `${M("Path ▸ Object to Path")}, then ${T("node")} Node tool: drag the <b>top-right</b> node down to the middle of the right side, then the <b>bottom-right</b> node up to the same spot. A triangle!`);
      colorAt = (x, y) => inPoly(x, y, tri) ? f0 : prev(x, y);
      skills.add("Node tool"); skills.add("Object to Path");
    }
    if (layout === "diagonal") {
      add(1, rect(0, 0, W, H, f1), [0, 0, W, H]);
      const band = [[0, 148], [300, -12], [300, 32], [0, 192]];
      const cid = id("clip");
      add(1, `<clipPath id="${cid}"><rect width="${W}" height="${H}"/></clipPath><polygon clip-path="url(#${cid})" points="${ptsAttr(band)}" fill="${f0}"/>`, [0, 0, W, H]);
      L1.push(`${T("rect")} Background: rectangle ${SIZE([0, 0, W, H])}. ${fillRow(f1)}.`,
        `${T("rect")} A band ${SIZE([0, 68, 300, 112])}, RGBA ${C(f0)}. ${M("Path ▸ Object to Path")}.`,
        `${T("node")} Node tool: click the two <b>left</b> nodes (${K("Shift")} + click), drag them <b>down</b> about 80 mm. Then the two <b>right</b> nodes <b>up</b> about 80 mm.`,
        `${T("selector")} Click the background, ${M("Edit ▸ Duplicate")}, ${M("Object ▸ Raise to Top")}. ${K("Shift")} + click the band → ${M("Path ▸ Intersection")}: the band is trimmed to the banner.`);
      colorAt = (x, y) => inPoly(x, y, band) ? f0 : f1;
      skills.add("Node tool"); skills.add("Intersection"); skills.add("Object to Path");
    }
    if (layout === "border") {
      add(1, rect(0, 0, W, H, f0), [0, 0, W, H]);
      add(1, rect(14, 14, 272, 152, f1), [14, 14, 286, 166]);
      L1.push(`${T("rect")} Background: rectangle ${SIZE([0, 0, W, H])}. ${fillRow(f0)}.`,
        `${T("rect")} Inner field: rectangle ${SIZE([14, 14, 286, 166])}, RGBA ${C(f1)} – a border appears all round.`);
      colorAt = (x, y) => (x < 14 || y < 14 || x > 286 || y > 166) ? f0 : f1;
    }
    steps[1] = { title: "The field", lead: `Your banner is a <b>${LAYOUT_NAME[layout]}</b>, 300 × 180 mm. Type the numbers exactly – then everything else fits.`, list: L1,
      stuck: ["The size fields are greyed out: click the shape with the Selector first.",
        "The numbers jump back: press Enter after typing each one. Leave the lock between W and H open.",
        "Colour looks wrong: check that you typed the code in the <i>Fill</i> tab, not <i>Stroke paint</i>."] };
    why.push(`<b>${regime === "auth" ? "Authoritarian" : "Democratic"}</b>, <b>${{ L: "left", C: "centre", R: "right" }[lr]}</b>-leaning and <b>${{ L: "peaceful", C: "balanced", R: "army-backed" }[arm]}</b> → ${LAYOUT_NAME[layout]}`);

    /* colours that depend on the field */
    const around = (x, y, R, n = 12) => uniq(Array.from({ length: n }, (_, i) => { const a = i / n * 2 * Math.PI; return colorAt(x + R * Math.cos(a), y + R * Math.sin(a)); }).concat([colorAt(x, y)]));
    const bgE = colorAt(cx, cy);
    const bgRing = around(cx, cy, r * .95);
    const frameKind = { L: "ring", C: "disc", R: "shield" }[lr];
    const frameCol = bestMulti(bgRing, cands, pal);
    const extraCol = bestMulti(around(cx, cy, r * 1.25), cands, pal, [frameCol]);
    const innerCol = frameKind === "ring" ? best(frameCol, cands, pal, [frameCol]) : null;
    const symBg = frameKind === "ring" ? innerCol : frameCol;
    const symCol = best(symBg, cands, pal, [frameCol]);

    /* ---------- STEP 2: behind the emblem ---------- */
    const L2 = [];
    const extra = { L: "rays", C: "halo", R: "bars" }[arm];
    if (extra === "rays") {
      const R = r * 1.32, p = starPts(cx, cy, R, .42, 24);
      add(2, `<polygon points="${ptsAttr(p)}" fill="${extraCol}"/>`, bboxPts(p));
      L2.push(`${T("star")} Star tool, <b>star</b> mode, Corners <b>24</b>, Spoke ratio <b>0.42</b>. Drag out a star over the emblem spot.`,
        `${T("selector")} Type ${SIZE(bboxPts(p))}. ${fillRow(extraCol)}.`);
      why.push(`<b>Peaceful</b> → sun rays behind the emblem`);
    }
    if (extra === "halo") {
      const R = r + 7;
      add(2, `<circle cx="${cx}" cy="${cy}" r="${R}" fill="none" stroke="${extraCol}" stroke-width="2.5"/>`, circB(cx, cy, R));
      L2.push(`${T("ellipse")} A circle, ${T("selector")} ${SIZE(circB(cx, cy, R))}.`,
        `${M("Object ▸ Fill and Stroke…")} <i>Fill</i> → <b>X</b> (no fill). <i>Stroke paint</i> → flat colour, RGBA ${C(extraCol)}. <i>Stroke style</i> → width <b>2.5 mm</b>.`);
      why.push(`<b>Balanced</b> → a thin halo ring`);
      skills.add("Fill and stroke");
    }
    if (extra === "bars") {
      const len = r * 2.9, th = r * .24;
      const bar = a => `<rect x="${r1(cx - len / 2)}" y="${r1(cy - th / 2)}" width="${r1(len)}" height="${r1(th)}" fill="${extraCol}" transform="rotate(${a} ${cx} ${cy})"/>`;
      const e = len / 2 * Math.SQRT1_2 + th;
      add(2, bar(45) + bar(-45), [cx - e, cy - e, cx + e, cy + e]);
      L2.push(`${T("rect")} A long bar: ${SIZE([cx - len / 2, cy - th / 2, cx + len / 2, cy + th / 2])}, RGBA ${C(extraCol)}.`,
        `${M("Object ▸ Transform…")} → <i>Rotate</i> tab → <b>45°</b> → Apply.`,
        `${M("Edit ▸ Duplicate")}, then ${M("Object ▸ Flip Horizontal")}: an X.`,
        `${K("Shift")} + click the first bar → ${M("Path ▸ Union")}. Drag the X so it crosses the emblem spot.`);
      why.push(`<b>Army-backed</b> → crossed bars behind the emblem`);
      skills.add("Union"); skills.add("Transform (rotate)");
    }
    steps[2] = { title: "Behind the emblem", lead: { rays: "Rays of a rising era.", halo: "A thin ring – calm and balanced.", bars: "Crossed bars: the army stands behind you." }[extra], list: L2,
      stuck: extra === "bars" ? ["The X is crooked: you rotated the duplicate again. Use Flip Horizontal for the second bar."]
        : extra === "rays" ? ["The rays are too thick: Spoke ratio smaller (0.3–0.45)."]
          : ["The circle is filled: Fill tab → X. Only the stroke should be coloured."] };

    /* ---------- STEP 3: frame ---------- */
    const L3 = [];
    if (frameKind === "ring") {
      const cid = id("m");
      add(3, `<mask id="${cid}"><rect width="${W}" height="${H}" fill="#fff"/><circle cx="${cx}" cy="${cy}" r="${r - 7}" fill="#000"/></mask><circle cx="${cx}" cy="${cy}" r="${r}" fill="${frameCol}" mask="url(#${cid})"/><circle cx="${cx}" cy="${cy}" r="${r - 7}" fill="${innerCol}"/>`, circB(cx, cy, r));
      L3.push(`${T("ellipse")} Circle ${SIZE(circB(cx, cy, r))}. ${fillRow(frameCol)}.`,
        `${T("ellipse")} A smaller circle on top: ${SIZE(circB(cx, cy, r - 7))}.`,
        `${T("selector")} Select both → ${M("Path ▸ Difference")}: a ring.`,
        `${T("ellipse")} Fill the hole: one more circle with the small numbers again, RGBA ${C(innerCol)}.`);
      skills.add("Difference");
      why.push(`<b>Left</b> → the emblem sits in a ring`);
    }
    if (frameKind === "disc") {
      add(3, `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${frameCol}" stroke="${extraCol}" stroke-width="2"/>`, circB(cx, cy, r));
      L3.push(`${T("ellipse")} Circle ${SIZE(circB(cx, cy, r))}.`,
        `${M("Object ▸ Fill and Stroke…")} <i>Fill</i> RGBA ${C(frameCol)}; <i>Stroke paint</i> RGBA ${C(extraCol)}; <i>Stroke style</i> width <b>2 mm</b>.`);
      skills.add("Fill and stroke");
      why.push(`<b>Centre</b> → the emblem sits on a disc`);
    }
    if (frameKind === "shield") {
      const rb = [cx - .8 * r, cy - .9 * r, cx + .8 * r, cy + .1 * r], cc = [cx, cy + .1 * r, .8 * r];
      add(3, `<path d="M${r1(rb[0])} ${r1(rb[1])}H${r1(rb[2])}V${r1(cc[1])}A${r1(cc[2])} ${r1(cc[2])} 0 0 1 ${r1(rb[0])} ${r1(cc[1])}Z" fill="${frameCol}"/>`, [rb[0], rb[1], rb[2], cc[1] + cc[2]]);
      L3.push(`${T("rect")} Rectangle ${SIZE(rb)}, RGBA ${C(frameCol)}.`,
        `${T("ellipse")} Circle ${SIZE(circB(cc[0], cc[1], cc[2]))}, same colour.`,
        `${T("selector")} Select both → ${M("Path ▸ Union")}: a shield with a round bottom.`);
      skills.add("Union");
      why.push(`<b>Right</b> → the emblem sits on a shield`);
    }
    steps[3] = { title: "The emblem frame", lead: { ring: "A ring around your symbol.", disc: "A disc with an outline – your symbol goes on it.", shield: "A shield, like an old coat of arms." }[frameKind], list: L3,
      stuck: frameKind === "ring" ? ["The big circle vanished: the small one was underneath. Undo, click the small circle, Object ▸ Raise to Top, try again."]
        : frameKind === "shield" ? ["A gap between the rectangle and the circle: they must overlap before Union."]
          : ["No outline: Stroke paint must be a flat colour, and the width bigger than 0."] };

    /* ---------- STEP 4: symbol ---------- */
    const rs = (frameKind === "ring" ? r - 9 : r - 6) * .9, sy = frameKind === "shield" ? cy - .12 * r : cy;
    const sc = symCol, L4 = []; let symSvg = "", symB = circB(cx, sy, rs);
    const sym = PRIDE[pride].sym;
    if (sym === "gear") {
      const p = starPts(cx, sy, rs, .8, 12), cid = id("m");
      symSvg = `<mask id="${cid}"><rect width="${W}" height="${H}" fill="#fff"/><circle cx="${cx}" cy="${sy}" r="${r1(rs * .38)}" fill="#000"/></mask><polygon mask="url(#${cid})" points="${ptsAttr(p)}" fill="${sc}"/>`;
      symB = bboxPts(p);
      L4.push(`${T("star")} Star tool, <b>star</b> mode, Corners <b>12</b>, Spoke ratio <b>0.8</b>. Drag one out, then ${T("selector")} ${SIZE(bboxPts(p))}. RGBA ${C(sc)}.`,
        `${T("ellipse")} A small circle in the middle: ${SIZE(circB(cx, sy, rs * .38))}.`,
        `Select both → ${M("Path ▸ Difference")}: a gear with a hole.`);
      skills.add("Difference");
    }
    if (sym === "sun") {
      const sunY = sy + rs * .25, p = starPts(cx, sunY, rs * .95, .55, 16), cid = id("c");
      symSvg = `<clipPath id="${cid}"><rect x="0" y="0" width="${W}" height="${r1(sunY)}"/></clipPath><g clip-path="url(#${cid})" fill="${sc}"><polygon points="${ptsAttr(p)}"/><circle cx="${cx}" cy="${r1(sunY)}" r="${r1(rs * .5)}"/></g><rect x="${r1(cx - rs)}" y="${r1(sunY + rs * .08)}" width="${r1(2 * rs)}" height="${r1(rs * .14)}" fill="${sc}"/>`;
      L4.push(`${T("ellipse")} Circle ${SIZE(circB(cx, sunY, rs * .5))}, RGBA ${C(sc)}.`,
        `${T("star")} Star tool, star mode, Corners <b>16</b>, Spoke ratio <b>0.55</b>: ${SIZE(bboxPts(p))}. Same colour. Select both → ${M("Path ▸ Union")}.`,
        `${T("rect")} A rectangle over the lower half: ${SIZE([cx - rs * 1.1, sunY, cx + rs * 1.1, sunY + rs * 1.1])}. Select sun + rectangle → ${M("Path ▸ Difference")}: the sun rises.`,
        `${T("rect")} A thin horizon line under it: ${SIZE([cx - rs, sunY + rs * .08, cx + rs, sunY + rs * .22])}.`);
      skills.add("Union"); skills.add("Difference");
    }
    if (sym === "waves") {
      const cid = id("m"), ys = [-.42, .02, .46];
      symSvg = `<mask id="${cid}"><rect width="${W}" height="${H}" fill="#fff"/>${ys.map(k => `<ellipse cx="${cx + rs * .15}" cy="${r1(sy + k * rs)}" rx="${r1(rs * 1.2)}" ry="${r1(rs * .11)}" fill="#000"/>`).join("")}</mask><circle mask="url(#${cid})" cx="${cx}" cy="${sy}" r="${r1(rs)}" fill="${sc}"/>`;
      L4.push(`${T("ellipse")} Circle ${SIZE(circB(cx, sy, rs))}, RGBA ${C(sc)}.`,
        `${T("ellipse")} Three wide, flat ellipses across it, each about <span class="nums">W ${r1(rs * 2.4)}, H ${r1(rs * .22)}</span>, at <span class="nums">Y ${ys.map(k => r1(sy + k * rs - rs * .11)).join(" / ")}</span>.`,
        `Select the three ellipses → ${M("Path ▸ Union")}. Then circle + ellipses → ${M("Path ▸ Difference")}: waves!`);
      skills.add("Union"); skills.add("Difference");
    }
    if (sym === "mountains") {
      const big = [[cx - rs * .95, sy + rs * .55], [cx - rs * .15, sy - rs * .75], [cx + rs * .65, sy + rs * .55]];
      const small = [[cx - rs * .05, sy + rs * .55], [cx + rs * .5, sy - rs * .2], [cx + rs * 1.0, sy + rs * .55]];
      symSvg = `<g fill="${sc}"><polygon points="${ptsAttr(big)}"/><polygon points="${ptsAttr(small)}"/></g>`;
      symB = [cx - rs, sy - rs * .75, cx + rs, sy + rs * .55];
      L4.push(`${T("star")} Star tool, <b>polygon</b> mode, Corners <b>3</b>. A big triangle ${SIZE(bboxPts(big))}, RGBA ${C(sc)}.`,
        `${T("star")} A smaller triangle overlapping on the right: ${SIZE(bboxPts(small))}.`,
        `Select both → ${M("Path ▸ Union")}: a mountain range.`);
      skills.add("Union");
    }
    if (sym === "tree") {
      const tris = [[.95, -.95, -.25], [1.15, -.55, .15], [1.35, -.15, .55]].map(([w, top, bot]) =>
        [[cx - rs * w * .5, sy + rs * bot], [cx, sy + rs * top], [cx + rs * w * .5, sy + rs * bot]]);
      const trunk = [cx - rs * .14, sy + rs * .55, cx + rs * .14, sy + rs * .95];
      symSvg = `<g fill="${sc}">${tris.map(t => `<polygon points="${ptsAttr(t)}"/>`).join("")}<rect x="${r1(trunk[0])}" y="${r1(trunk[1])}" width="${r1(trunk[2] - trunk[0])}" height="${r1(trunk[3] - trunk[1])}"/></g>`;
      L4.push(`${T("star")} Star tool, <b>polygon</b> mode, Corners <b>3</b>. Three triangles, top to bottom: ${tris.map(t => SIZE(bboxPts(t))).join(" · ")}. RGBA ${C(sc)}.`,
        `${T("rect")} The trunk: ${SIZE(trunk)}.`,
        `Select all four → ${M("Path ▸ Union")}: one tree.`);
      skills.add("Union");
    }
    if (sym === "atom") {
      const rx = rs, ry = rs * .36;
      symSvg = `<g fill="none" stroke="${sc}" stroke-width="2.4">${[0, 60, 120].map(a => `<ellipse cx="${cx}" cy="${sy}" rx="${r1(rx)}" ry="${r1(ry)}" transform="rotate(${a} ${cx} ${sy})"/>`).join("")}</g><circle cx="${cx}" cy="${sy}" r="${r1(rs * .17)}" fill="${sc}"/>`;
      L4.push(`${T("ellipse")} Ellipse ${SIZE([cx - rx, sy - ry, cx + rx, sy + ry])}. ${M("Object ▸ Fill and Stroke…")} <i>Fill</i> → X; <i>Stroke paint</i> RGBA ${C(sc)}; width <b>2.4 mm</b>.`,
        `${M("Edit ▸ Duplicate")}, ${M("Object ▸ Transform…")} → Rotate <b>60°</b> → Apply. Duplicate again → Apply again.`,
        `${T("ellipse")} A small filled circle in the middle: ${SIZE(circB(cx, sy, rs * .17))}.`);
      skills.add("Fill and stroke"); skills.add("Transform (rotate)");
    }
    if (sym === "crown") {
      const base = [cx - rs * .8, sy + rs * .1, cx + rs * .8, sy + rs * .6];
      const tips = [-.55, 0, .55].map(k => [[cx + rs * (k - .3), sy + rs * .15], [cx + rs * k, sy - rs * (k ? .55 : .8)], [cx + rs * (k + .3), sy + rs * .15]]);
      const balls = tips.map(t => [t[1][0], t[1][1] - rs * .08]);
      symSvg = `<g fill="${sc}"><rect x="${r1(base[0])}" y="${r1(base[1])}" width="${r1(base[2] - base[0])}" height="${r1(base[3] - base[1])}"/>${tips.map(t => `<polygon points="${ptsAttr(t)}"/>`).join("")}${balls.map(b => `<circle cx="${r1(b[0])}" cy="${r1(b[1])}" r="${r1(rs * .12)}"/>`).join("")}</g>`;
      symB = [base[0], sy - rs, base[2], base[3]];
      L4.push(`${T("rect")} Crown base ${SIZE(base)}, RGBA ${C(sc)}.`,
        `${T("star")} Polygon mode, Corners 3: three triangles standing on the base – ${tips.map(t => SIZE(bboxPts(t))).join(" · ")}.`,
        `${T("ellipse")} A small circle on each tip (about <span class="nums">W ${r1(rs * .24)}</span>).`,
        `Select everything of the crown → ${M("Path ▸ Union")}.`);
      skills.add("Union");
    }
    if (sym === "crescent") {
      const c1 = [cx - rs * .18, sy, rs * .78], c2 = [cx + rs * .08, sy - rs * .08, rs * .64];
      const st = starPts(cx + rs * .5, sy, rs * .3, .4, 5), cid = id("m");
      symSvg = `<mask id="${cid}"><rect width="${W}" height="${H}" fill="#fff"/><circle cx="${r1(c2[0])}" cy="${r1(c2[1])}" r="${r1(c2[2])}" fill="#000"/></mask><circle mask="url(#${cid})" cx="${r1(c1[0])}" cy="${c1[1]}" r="${r1(c1[2])}" fill="${sc}"/><polygon points="${ptsAttr(st)}" fill="${sc}"/>`;
      L4.push(`${T("ellipse")} Circle ${SIZE(circB(...c1))}, RGBA ${C(sc)}.`,
        `${T("ellipse")} A second circle a bit to the right: ${SIZE(circB(...c2))}. Select both → ${M("Path ▸ Difference")}: a crescent.`,
        `${T("star")} Star tool, star mode, Corners 5, Spoke ratio 0.4: a small star ${SIZE(bboxPts(st))}.`);
      skills.add("Difference");
    }
    if (sym === "star") {
      const p = starPts(cx, sy + rs * .06, rs, .4, 5), q = starPts(cx, sy + rs * .06, rs * .55, .4, 5), cid = id("m");
      symSvg = `<mask id="${cid}"><rect width="${W}" height="${H}" fill="#fff"/><polygon points="${ptsAttr(q)}" fill="#000"/></mask><polygon mask="url(#${cid})" points="${ptsAttr(p)}" fill="${sc}"/>`;
      symB = bboxPts(p);
      L4.push(`${T("star")} Star tool, star mode, Corners <b>5</b>, Spoke ratio <b>0.4</b>. Then ${T("selector")} ${SIZE(bboxPts(p))}. RGBA ${C(sc)}.`,
        `${M("Edit ▸ Duplicate")} and type ${SIZE(bboxPts(q))}: a smaller star in the middle.`,
        `Select both → ${M("Path ▸ Difference")}: a star outline.`);
      skills.add("Difference");
    }
    add(4, symSvg, symB);
    steps[4] = { title: "Your national symbol", lead: `Your nation is proud of <b>${PRIDE[pride].label.toLowerCase()}</b>, so the symbol is a <b>${{ gear: "gear", sun: "rising sun", waves: "wave disc", mountains: "mountain range", tree: "tree", atom: "atom", crown: "crown", crescent: "crescent and star", star: "star outline" }[sym]}</b>.`, list: L4,
      stuck: ["Difference removed the wrong part: the shape to cut out must be on TOP. Undo, click it, Object ▸ Raise to Top.",
        "Union/Difference is greyed out: select exactly the shapes you need – the status bar counts them."] };
    why.push(`<b>${PRIDE[pride].label}</b> → ${{ gear: "a gear", sun: "a rising sun", waves: "waves", mountains: "mountains", tree: "a tree", atom: "an atom", crown: "a crown", crescent: "a crescent and star", star: "a star" }[sym]}`);

    /* ---------- STEP 5: provinces ---------- */
    const L5 = [], starPos = [];
    const sR = layout === "canton" ? 6.5 : 5;
    if (layout === "canton") {
      const cols = N <= 3 ? N : N === 4 ? 2 : 3, rows = Math.ceil(N / cols);
      for (let i = 0; i < N; i++) {
        const rr = Math.floor(i / cols), cc = i % cols, inRow = Math.min(cols, N - rr * cols);
        starPos.push([65 + (cc - (inRow - 1) / 2) * 34, 45 + (rr - (rows - 1) / 2) * 26]);
      }
    } else {
      const R = r + (extra === "rays" ? r * .32 : 9) + 6, step = N > 1 ? Math.min(24, 120 / (N - 1)) : 0;
      for (let i = 0; i < N; i++) { const a = (90 + (i - (N - 1) / 2) * step) * Math.PI / 180; starPos.push([cx + R * Math.cos(a), cy + R * Math.sin(a)]); }
    }
    const starCol = bestMulti(layout === "canton" ? [f0] : uniq(starPos.map(([x, y]) => colorAt(x, y))), cands, pal);
    starPos.forEach(([x, y]) => add(5, `<polygon points="${ptsAttr(starPts(x, y, sR, .4, 5))}" fill="${starCol}"/>`, bboxPts(starPts(x, y, sR, .4, 5))));
    L5.push(`${T("star")} Star tool, star mode, Corners 5, Spoke ratio 0.4. One small star, RGBA ${C(starCol)}.`,
      N > 1 ? `${M("Edit ▸ Duplicate")} it ${N - 1}× and type the positions (keep W and H):` : `Type its size and place:`,
      `<span class="nums starlist">${starPos.map(([x, y], i) => { const b = bboxPts(starPts(x, y, sR, .4, 5)); return `★${i + 1}: ${xywh(b)}`; }).join("<br>")}</span>`);
    steps[5] = { title: N === 1 ? "One province, one star" : `${N} provinces, ${N} stars`, lead: layout === "canton" ? "Your provinces shine in the canton." : "Your provinces form an arc under the emblem.", list: L5,
      stuck: ["All copies are in one place: Duplicate puts the copy exactly on the original – just type the next X and Y."] };
    why.push(`<b>${N} province${N > 1 ? "s" : ""}</b> → ${N} star${N > 1 ? "s" : ""}${layout === "canton" ? " in the canton" : " under the emblem"}`);

    /* ---------- STEP 6: name ---------- */
    const L6 = [];
    if (regime === "auth") {
      const Rn = r + (extra === "rays" ? r * .32 : 9) + 8;
      const fs = Math.min(13, (Math.PI * Rn * .9) / (NAME.length * .9 + .5));
      const nBgs = uniq(Array.from({ length: 13 }, (_, i) => { const a = Math.PI * (1 + i / 12); return colorAt(cx + (Rn + fs * .35) * Math.cos(a), cy + (Rn + fs * .35) * Math.sin(a)); }));
      const nameCol = bestMulti(nBgs, cands, pal);
      const outl = worstC(nameCol, nBgs) < 2.2 ? best(nameCol, [WHITE, BLACK, ...pal], pal) : null;
      const pid = id("arc");
      add(6, `<path id="${pid}" d="M${r1(cx - Rn)} ${cy} A${r1(Rn)} ${r1(Rn)} 0 0 1 ${r1(cx + Rn)} ${cy}" fill="none"/><text font-family="Arial Black,Impact,sans-serif" font-weight="900" font-size="${r1(fs)}" fill="${nameCol}" letter-spacing=".5"${outl ? ` stroke="${outl}" stroke-width="1.1" paint-order="stroke" stroke-linejoin="round"` : ""}><textPath href="#${pid}" startOffset="50%" text-anchor="middle">${esc(NAME)}</textPath></text>`, [cx - Rn - fs, cy - Rn - fs, cx + Rn + fs, cy]);
      L6.push(`${T("ellipse")} A helper circle around the emblem: ${SIZE(circB(cx, cy, Rn))}.`,
        `${M("Path ▸ Object to Path")}, then ${M("Object ▸ Rotate 90° CW")} <b>twice</b> – now the path starts on the left.`,
        `${T("text")} Click outside the banner and type <b>${esc(NAME)}</b>. Bold font, size about <b>${pt(fs)}</b>, RGBA ${C(nameCol)}.`,
        `${T("selector")} Select the circle AND the text → ${M("Text ▸ Put on Path")}. Then click the circle and give it no fill and no stroke (<b>X</b> in both tabs).`);
      if (outl) { L6.push(`The name crosses different colours, so give it an outline: click the text, <i>Stroke paint</i> RGBA ${C(outl)}, <i>Stroke style</i> width <b>1 mm</b>.`); skills.add("Fill and stroke"); }
      skills.add("Put on Path"); skills.add("Object to Path");
      steps[6] = { title: "The name, in an arc", lead: "Authoritarian states like their name curved over the emblem, like on a medal.", list: L6,
        note: "The text starts at the left (9 o'clock). Make the size bigger or smaller until it ends on the right side; to centre it, type spaces in front of the name.",
        stuck: ["The text runs along the bottom, upside down: the circle wasn't rotated. Undo the Put on Path, rotate the circle twice, try again.",
          "The text stops halfway: it is longer than half the circle. Make the size smaller."] };
      why.push(`<b>Authoritarian</b> → the name in an arc, the motto cut out of a band`);
    } else {
      const nx = layout === "canton" ? 215 : 150, avail = layout === "canton" ? 160 : 270;
      const fs = Math.min(15, avail / (NAME.length * .9 + .5)), ny = cy - r - (extra === "rays" ? r * .32 : 9) - 8;
      const tw = NAME.length * fs * .86;
      const nBgs = uniq(Array.from({ length: 9 }, (_, i) => colorAt(nx - tw / 2 + tw * i / 8, ny - fs * .35)));
      const nameCol = bestMulti(nBgs, cands, pal);
      const outl = worstC(nameCol, nBgs) < 2.2 ? best(nameCol, [WHITE, BLACK, ...pal], pal) : null;
      add(6, `<text x="${nx}" y="${r1(ny)}" text-anchor="middle" font-family="Arial Black,Impact,sans-serif" font-weight="900" font-size="${r1(fs)}" fill="${nameCol}"${outl ? ` stroke="${outl}" stroke-width="1.1" paint-order="stroke" stroke-linejoin="round"` : ""}>${esc(NAME)}</text>`, [nx - tw / 2, ny - fs * .8, nx + tw / 2, ny]);
      L6.push(`${T("text")} Click above the emblem and type <b>${esc(NAME)}</b>. Bold font, size about <b>${pt(fs)}</b>, RGBA ${C(nameCol)}.`,
        `${T("selector")} Look at the text's <b>W</b> in the tool controls bar and type <b>X = (${nx * 2} − W) ÷ 2</b> – it is centred${layout === "canton" ? " in the right part" : ""}. Bottom of the letters at about <b>Y ${r1(ny)}</b>.`);
      if (outl) { L6.push(`The name crosses different colours, so give it an outline: <i>Stroke paint</i> RGBA ${C(outl)}, <i>Stroke style</i> width <b>1 mm</b>.`); skills.add("Fill and stroke"); }
      steps[6] = { title: "The name", lead: "Democracies write their name plainly, straight across the top.", list: L6,
        stuck: ["The text is too wide: smaller size, or use a narrower bold font."] };
      why.push(`<b>Democratic</b> → a plain name across the top, the motto in a ribbon`);
    }

    /* ---------- STEP 7: motto + frame ---------- */
    const L7 = [];
    if (regime === "auth") {
      const bb = [40, 148, 260, 172];
      const underBand = uniq([40, 95, 150, 205, 258].map(x => colorAt(x, 160)));
      const bandCol = bestMulti(underBand, [...pal, BLACK, WHITE], pal);
      const fs = Math.min(13, 205 / (MOTTO.length * .86 + .5)), cid = id("m");
      add(7, `<mask id="${cid}"><rect width="${W}" height="${H}" fill="#fff"/><text x="150" y="${r1(160 + fs * .36)}" text-anchor="middle" font-family="Arial Black,Impact,sans-serif" font-weight="900" font-size="${r1(fs)}" fill="#000">${esc(MOTTO)}</text></mask><rect mask="url(#${cid})" x="40" y="148" width="220" height="24" fill="${bandCol}"/>`, bb);
      L7.push(`${T("rect")} The motto band: ${SIZE(bb)}, RGBA ${C(bandCol)}.`,
        `${T("text")} Click on the band, type <b>${esc(MOTTO)}</b>. Bold, size about <b>${pt(fs)}</b>. Centre it on the band (X = (300 − W) ÷ 2).`,
        `Check the spelling! Then ${M("Path ▸ Object to Path")} on the text.`,
        `Select band + text → ${M("Path ▸ Difference")}: the letters are cut out and the field shows through.`);
      skills.add("Difference"); skills.add("Object to Path");
    } else {
      const ribCol = bestMulti(uniq([52, 100, 150, 200, 248].map(x => colorAt(x, 157))), [WHITE, ...pal, BLACK], pal);
      const txtCol = best(ribCol, cands, pal, [ribCol]);
      const fs = Math.min(10, 180 / (motto.length * .62 + .5));
      add(7, `<g fill="${ribCol}"><rect x="60" y="146" width="180" height="22"/><circle cx="60" cy="157" r="11"/><circle cx="240" cy="157" r="11"/></g><text x="150" y="${r1(157 + fs * .36)}" text-anchor="middle" font-family="Atkinson Hyperlegible,Arial,sans-serif" font-weight="700" font-size="${r1(fs)}" fill="${txtCol}">${esc(motto)}</text>`, [49, 146, 251, 168]);
      L7.push(`${T("rect")} Ribbon: rectangle ${SIZE([60, 146, 240, 168])}; ${T("ellipse")} two circles ${SIZE(circB(60, 157, 11))} and ${SIZE(circB(240, 157, 11))}. All RGBA ${C(ribCol)}.`,
        `Select the three → ${M("Path ▸ Union")}: one ribbon.`,
        `${T("text")} Type <b>${esc(motto)}</b> beside the banner, size about <b>${pt(fs)}</b>, RGBA ${C(txtCol)}.`,
        `Select ribbon + text → ${M("Text ▸ Flow into Frame")}. Then ${T("text")} click into the text and press the <i>centre</i> button.`);
      skills.add("Union"); skills.add("Flow into Frame");
    }
    const edgeCol = regime === "auth" ? best(colorAt(2, 2), [...pal, BLACK], pal) : best(colorAt(2, 2), [WHITE, ...pal], pal);
    const ew = regime === "auth" ? 6 : 3;
    add(7, `<rect x="${ew / 2}" y="${ew / 2}" width="${W - ew}" height="${H - ew}" fill="none" stroke="${edgeCol}" stroke-width="${ew}"/>`, [0, 0, W, H]);
    L7.push(`${T("rect")} Last: a frame. Rectangle ${SIZE([0, 0, W, H])}, <i>Fill</i> → X, <i>Stroke paint</i> RGBA ${C(edgeCol)}, width <b>${ew} mm</b>.`);
    skills.add("Fill and stroke");
    steps[7] = { title: regime === "auth" ? "Motto band and frame" : "Motto ribbon and frame", lead: regime === "auth" ? "The motto is cut out of a dark band – nobody can erase it." : "The motto flows into a ribbon.", list: L7,
      stuck: regime === "auth" ? ["The band disappeared instead: the text was underneath. Undo, click the text, Object ▸ Raise to Top.", "Difference is greyed out: the text must be converted first (Path ▸ Object to Path)."]
        : ["The text sticks out of the ribbon: make the size smaller, or the ribbon wider.", "Flow into Frame does nothing: exactly 2 objects – the ribbon and the text."] };

    return { items, steps, skills: [...skills], why, layout, pal, name, motto, N, pride, regime, frameKind, extra, sym };
  }

  let G = 0;
  function svg(model, upto = 7, highlight = 0, cls = "") {
    const pfx = "g" + (++G) + "_";
    const parts = model.items.filter(i => i.step <= upto).map(i => i.svg).join("")
      .replace(/(id="|url\(#|href="#)([a-z]+\d+)/g, (m0, a, b) => a + pfx + b);
    let hl = "";
    if (highlight) {
      const bs = model.items.filter(i => i.step === highlight).map(i => i.b);
      if (bs.length) {
        const b = [Math.min(...bs.map(q => q[0])), Math.min(...bs.map(q => q[1])), Math.max(...bs.map(q => q[2])), Math.max(...bs.map(q => q[3]))];
        hl = `<rect x="${r1(b[0] - 2)}" y="${r1(b[1] - 2)}" width="${r1(b[2] - b[0] + 4)}" height="${r1(b[3] - b[1] + 4)}" fill="none" stroke="#1d2622" stroke-width="1.2" stroke-dasharray="4 3"/><rect x="${r1(b[0] - 2)}" y="${r1(b[1] - 2)}" width="${r1(b[2] - b[0] + 4)}" height="${r1(b[3] - b[1] + 4)}" fill="none" stroke="#fff" stroke-width="1.2" stroke-dasharray="4 3" stroke-dashoffset="3.5"/>`;
      }
    }
    return `<svg class="banner ${cls}" viewBox="-6 -6 312 192" role="img" aria-label="Banner of ${esc(model.name)}${upto < 7 ? ", after step " + upto : ""}"><rect x="-6" y="-6" width="312" height="192" fill="#e9e7dd"/>${parts}${hl}</svg>`;
  }
  window.COUP_BUILD = build; window.COUP_SVG = svg;   /* used by the teacher-notes gallery script */

  /* ------------------------------------------------------------------ state */
  const DEF = { country: "", palette: [], main: "", name: "", motto: "", regime: "", lr: 50, army: 50, pride: "", provinces: 3, custom: ["#CE2939", "#FFFFFF", "#477050"] };
  const fresh = () => JSON.parse(JSON.stringify(DEF));
  let S = { answers: fresh(), locked: false, solved: [], checks: [], end: false };
  try { const s = JSON.parse(localStorage.getItem(KEY)); if (s && s.answers) { S = Object.assign(S, s); S.answers = Object.assign(fresh(), s.answers); } } catch (e) {}
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) {} };
  const A = () => S.answers;
  const missing = () => {
    const a = A(), m = [];
    if (!a.palette.length) m.push("a country");
    if (!a.name.trim()) m.push("a state name");
    if (!a.motto.trim()) m.push("a motto");
    if (!a.regime) m.push("authoritarian or democratic");
    if (!a.pride) m.push("what your nation is proud of");
    return m;
  };

  /* ------------------------------------------------------------------ page */
  const tape = `<span class="tape l" aria-hidden="true"></span><span class="tape r" aria-hidden="true"></span>`;
  const STEP_TITLES = ["The field", "Behind the emblem", "The emblem frame", "Your national symbol", "Provinces", "The name", "Motto and frame"];
  const head = (h, p, c) => `<div class="sec-head"${c ? ` style="--c:${c}"` : ""}><h2>${h}</h2><p>${p}</p><svg viewBox="0 0 200 12" aria-hidden="true"><path d="M3 8 C 50 2, 100 12, 150 5 S 190 5, 197 7"/></svg></div>`;
  const slider = (key, left, right, l2, r2) => `<div class="q"><span class="qn"></span><div class="qb"><label class="ql" for="q-${key}">${l2}</label>
      <div class="slide"><span>${left}</span><input type="range" id="q-${key}" data-k="${key}" min="0" max="100" step="1"><span>${right}</span></div><p class="qh" id="h-${key}"></p></div></div>`;

  $("#app").innerHTML = `
  <header class="rail"><div class="wrap">
    <a class="logo" href="../../"><svg width="28" height="28" viewBox="0 0 30 30" aria-hidden="true"><rect x="1.5" y="3" width="27" height="20" rx="2" fill="#22362f" stroke="#fff6e8" stroke-width="2"/><path d="M7 10h9M7 15h13" stroke="#f2d264" stroke-width="2.4" stroke-linecap="round"/><path d="M9 23l-3 5M21 23l3 5" stroke="#fff6e8" stroke-width="2" stroke-linecap="round"/></svg><span>digikult</span></a>
    <nav class="dots" aria-label="Steps"><span class="lbl">Steps</span>${STEP_TITLES.map((t, i) => `<a href="#step-${i + 1}" data-n="${i + 1}" title="Step ${i + 1}: ${t}">${i + 1}</a>`).join("")}</nav>
  </div></header>
  <main class="wrap">
    <section class="hero">
      <div>
        <p class="kicker">Inkscape final project</p>
        <h1>Coup!</h1>
        <svg class="scribble" viewBox="0 0 420 22" aria-hidden="true"><path d="M4 14 C 80 4, 160 20, 240 10 S 360 6, 414 12"/></svg>
        <p class="story">03:00. The palace is quiet, the old government has left by helicopter, and the TV station is yours. You are a morally grey general with a brand-new country – and no banner. Answer the questions of your command tent: every answer changes the banner you will draw in Inkscape.</p>
        <p class="disclaimer">A design game: the coup is pure fiction, no real government is harmed by your SVG file.</p>
        <div class="meter" aria-live="polite"><div class="row"><span>Your progress</span><b id="count"></b></div><span class="bar" id="bar">${STEP_TITLES.map(() => "<i></i>").join("")}</span></div>
        <div class="actions"><a class="btn chalk" href="#tent">To the command tent ▸</a><button class="btn ghost" type="button" id="print">🖨 Print my plan</button></div>
      </div>
      <figure class="poster flag-poster"><div id="hero-flag"></div><figcaption id="hero-cap">Your banner appears here</figcaption></figure>
    </section>

    <section class="sec" id="tent">
      ${head("The command tent", "Answer every question. The banner on the right changes as you go – then lock it in.")}
      <div class="tent">
        <form class="qs" id="qs" autocomplete="off">
          <div class="q"><span class="qn"></span><div class="qb"><label class="ql" for="q-country">Which country did you take over?</label>
            <select id="q-country"><option value="">– choose a country –</option>${COUNTRIES.map(c => `<option>${esc(c.n)}</option>`).join("")}<option value="__other">Other country – I'll enter the flag colours</option></select>
            <div class="custom" id="custom" hidden><span>Flag colours:</span>${[0, 1, 2].map(i => `<input type="color" data-ci="${i}" aria-label="Flag colour ${i + 1}">`).join("")}<input type="text" id="q-cname" maxlength="30" placeholder="country name"></div>
            <p class="qh">Its flag colours become your palette.</p></div></div>
          <div class="q"><span class="qn"></span><div class="qb"><span class="ql">Which colour is your movement's colour?</span><div class="swatches" id="swatches"></div><p class="qh">It becomes the main colour of the banner.</p></div></div>
          <div class="q"><span class="qn"></span><div class="qb"><label class="ql" for="q-name">What is your new state called?</label>
            <input type="text" id="q-name" data-k="name" maxlength="26" placeholder="e.g. Iron Federation"><p class="qh">Ideas: ${NAMES.map(n => `<button type="button" class="idea" data-k="name" data-v="${esc(n)}">${esc(n)}</button>`).join(" ")}</p></div></div>
          <div class="q"><span class="qn"></span><div class="qb"><label class="ql" for="q-motto">Your national motto?</label>
            <input type="text" id="q-motto" data-k="motto" maxlength="32" placeholder="e.g. Bread, Peace, WiFi"><p class="qh">Ideas: ${MOTTOS.slice(0, 6).map(n => `<button type="button" class="idea" data-k="motto" data-v="${esc(n)}">${esc(n)}</button>`).join(" ")}</p></div></div>
          <div class="q"><span class="qn"></span><div class="qb"><span class="ql">How will you rule?</span>
            <div class="cards2"><label><input type="radio" name="regime" value="auth"><span><b>Authoritarian</b><small>One leader, one voice, big parades.</small></span></label>
            <label><input type="radio" name="regime" value="demo"><span><b>Democratic</b><small>Elections – you promise, at least.</small></span></label></div></div></div>
          ${slider("lr", "Left", "Right", "Where does your government lean?")}
          ${slider("army", "Peace", "Army", "How much does your power rest on the army?")}
          <div class="q"><span class="qn"></span><div class="qb"><span class="ql">What is your nation proud of?</span>
            <div class="prides">${Object.entries(PRIDE).map(([k, p]) => `<label><input type="radio" name="pride" value="${k}"><span><i aria-hidden="true">${p.icon}</i>${p.label}</span></label>`).join("")}</div></div></div>
          <div class="q"><span class="qn"></span><div class="qb"><label class="ql" for="q-provinces">How many provinces does your country have?</label>
            <div class="slide"><span>1</span><input type="range" id="q-provinces" data-k="provinces" min="1" max="9" step="1"><span>9</span></div><p class="qh" id="h-provinces"></p></div></div>
        </form>
        <aside class="preview">
          <div class="sheet mini">${tape}<div id="live"></div><p class="live-cap" id="live-cap"></p><ul class="why" id="why"></ul></div>
          <button class="btn chalk lock" type="button" id="lock">Lock in my banner ▸</button>
          <p class="lock-msg" id="lock-msg" role="status"></p>
        </aside>
      </div>
    </section>

    <div id="work"></div>
  </main>
  <footer class="tray"><div class="wrap"><span class="sticks" aria-hidden="true"><i></i><i></i><i></i></span>
    <span>Teachers: <a href="../pdf/coup-teacher.pdf" download>teacher notes (PDF)</a></span>
    <button class="reset" type="button" id="reset">Start over</button></div></footer>`;

  /* ------------------------------------------------------------------ form wiring */
  const form = $("#qs");
  function syncForm() {
    const a = A();
    const known = COUNTRIES.find(c => c.n === a.country);
    $("#q-country").value = known ? a.country : (a.country ? "__other" : "");
    $("#custom").hidden = !(a.country && !known);
    form.querySelectorAll("[data-ci]").forEach(i => { i.value = (a.custom[+i.dataset.ci] || "#ffffff").toLowerCase(); });
    $("#q-cname").value = (!known && a.country !== "__other") ? a.country : "";
    $("#q-name").value = a.name; $("#q-motto").value = a.motto;
    $("#q-lr").value = a.lr; $("#q-army").value = a.army; $("#q-provinces").value = a.provinces;
    form.querySelectorAll("input[name=regime]").forEach(r => { r.checked = r.value === a.regime; });
    form.querySelectorAll("input[name=pride]").forEach(r => { r.checked = r.value === a.pride; });
    $("#swatches").innerHTML = a.palette.length ? a.palette.map(c => `<label class="swl"><input type="radio" name="main" value="${c}" ${close(c, a.main || a.palette[0]) ? "checked" : ""}><span style="--c:${c}" title="${c}"></span></label>`).join("") : `<span class="qh">Choose a country first.</span>`;
    form.querySelectorAll("input, select, button.idea").forEach(el => { el.disabled = S.locked; });
  }
  function hints() {
    const a = A();
    const lr = bucket(+a.lr), ar = bucket(+a.army);
    $("#h-lr").textContent = { L: "Left: workers first, big state.", C: "Centre: a bit of everything.", R: "Right: tradition, business, order." }[lr];
    $("#h-army").textContent = { L: "Peace: your soldiers plant trees now.", C: "Balanced: the army is there, quietly.", R: "Army: tanks at every parade." }[ar];
    $("#h-provinces").textContent = `${a.provinces} province${a.provinces > 1 ? "s" : ""}`;
  }
  function setPaletteFromCountry() {
    const a = A(), c = COUNTRIES.find(x => x.n === a.country);
    a.palette = c ? c.c.slice() : a.custom.map(x => x.toUpperCase());
    if (!a.palette.some(p => close(p, a.main || ""))) a.main = a.palette[0];
  }
  form.addEventListener("input", e => {
    const t = e.target, a = A();
    if (t.id === "q-country") {
      if (t.value === "__other") { a.country = $("#q-cname").value || "__other"; }
      else a.country = t.value;
      setPaletteFromCountry();
    } else if (t.dataset.ci != null) { a.custom[+t.dataset.ci] = t.value.toUpperCase(); setPaletteFromCountry(); }
    else if (t.id === "q-cname") { a.country = t.value || "__other"; }
    else if (t.name === "regime") a.regime = t.value;
    else if (t.name === "pride") a.pride = t.value;
    else if (t.name === "main") a.main = t.value;
    else if (t.dataset.k) a[t.dataset.k] = t.type === "range" ? +t.value : t.value;
    save();
    if (t.id === "q-country" || t.dataset.ci != null) syncForm();
    hints(); live();
  });
  form.addEventListener("change", e => { if (e.target.id === "q-country") { syncForm(); live(); } });
  form.querySelectorAll("button.idea").forEach(b => b.addEventListener("click", () => {
    A()[b.dataset.k] = b.dataset.v; save(); syncForm(); live();
  }));

  /* ------------------------------------------------------------------ live preview + lock */
  function live() {
    const m = build(A());
    $("#live").innerHTML = svg(m);
    $("#live-cap").textContent = A().palette.length ? `Banner of ${m.name}` : "A sample banner – answer the questions to make it yours.";
    $("#why").innerHTML = m.why.map(w => `<li>${w}</li>`).join("");
    $("#hero-flag").innerHTML = svg(m);
    $("#hero-cap").textContent = S.locked ? `The banner of ${m.name}` : "Your banner appears here";
    const miss = missing();
    $("#lock").textContent = S.locked ? "Change my answers" : "Lock in my banner ▸";
    $("#lock-msg").textContent = S.locked ? "Locked. Your steps are below." : miss.length ? `Still missing: ${miss.join(", ")}.` : "Happy with it? Lock it in.";
  }
  $("#lock").addEventListener("click", () => {
    if (S.locked) {
      if (S.solved.length && !confirm("Change your answers? Your banner and steps will change, and your ticks will be cleared.")) return;
      S.locked = false; S.solved = []; S.checks = []; S.end = false;
    } else {
      const miss = missing();
      if (miss.length) { $("#lock-msg").textContent = `Still missing: ${miss.join(", ")}.`; return; }
      S.locked = true;
    }
    save(); syncForm(); live(); renderWork();
    if (S.locked) setTimeout(() => $("#work").scrollIntoView({ block: "start" }), 120);
  });

  /* ------------------------------------------------------------------ the guided steps */
  function renderWork() {
    const box = $("#work");
    if (!S.locked) { box.innerHTML = ""; paint(); return; }
    const m = build(A());
    const tilt = i => ["-.3deg", ".25deg", "-.15deg", ".35deg"][i % 4];
    const fileName = "surname_" + m.name.toLowerCase().replace(/[^a-z0-9]+/g, "").slice(0, 16);
    box.innerHTML = `
    <section class="sec">
      ${head("Skills on your banner", "Everything from this year – your banner uses these:")}
      <ul class="badges">${m.skills.map(s => `<li>${s}</li>`).join("")}</ul>
    </section>
    <section class="sec" id="start">
      ${head("Before you start", "No keyboard shortcuts: every command is in a menu or on a toolbar.")}
      <article class="sheet" style="--tilt:-.2deg">${tape}
        <h3>Set up</h3>
        <ol class="do">
          <li>${M("File ▸ New")}, then ${M("File ▸ Save As…")} <code>${fileName}.svg</code>. ${M("View ▸ Zoom ▸ Zoom Page")}.</li>
          <li><b>Exact sizes:</b> with the ${T("selector")} Selector, the tool controls bar shows <b>X, Y, W, H</b> (in mm). Click a shape, type the numbers, press Enter after each. Leave the lock open.</li>
          <li><b>Exact colours:</b> ${M("Object ▸ Fill and Stroke…")} → <i>Fill</i> tab → flat colour → type the code in the <b>RGBA</b> box, e.g. ${C(m.pal[0])}, press Enter.</li>
          <li><b>Several objects:</b> click the first, ${K("Shift")} + click the others. The status bar counts them. Difference: the object on <i>top</i> is cut out.</li>
        </ol>
        <p class="note">Your palette: ${m.pal.map(c => C(c)).join(" ")} ${C(WHITE)} ${C(BLACK)}</p>
      </article>
    </section>
    <section class="sec">
      ${head("The steps", "Each picture shows your banner after the step; the dashed box marks what is new.", "var(--accent)")}
      ${[1, 2, 3, 4, 5, 6, 7].map((n, i) => { const s = m.steps[n]; return `
      <article class="sheet step" id="step-${n}" data-n="${n}" style="--tilt:${tilt(i)}">${tape}
        <h3><span class="num">${n}</span>${s.title} <span class="stamp">done!</span></h3>
        <p class="lead">${s.lead}</p>
        <div class="stepgrid"><div class="stepflag">${svg(m, n, n)}</div><ol class="do">${s.list.map(x => `<li>${x}</li>`).join("")}</ol></div>
        ${s.note ? `<p class="note">${s.note}</p>` : ""}
        ${s.stuck && s.stuck.length ? `<details class="stuck"><summary>Stuck?</summary><ul>${s.stuck.map(x => `<li>${x}</li>`).join("")}</ul></details>` : ""}
        <div class="foot"><button class="done-btn" type="button" data-n="${n}" aria-pressed="false"><span class="box" aria-hidden="true"></span><span class="t">I did this step</span></button>
        ${n < 7 ? `<a class="next-link" href="#step-${n + 1}">Next: ${m.steps[n + 1].title} ↓</a>` : `<a class="next-link" href="#save">Last thing: save and hand in ↓</a>`}</div>
      </article>`; }).join("")}
    </section>
    <section class="sec" id="save">
      ${head("Save and hand in", "The SVG shows how you built it; the PNG is the picture.")}
      <article class="sheet" style="--tilt:.2deg">${tape}
        <ol class="do"><li>${M("File ▸ Save")} – <code>${fileName}.svg</code></li>
        <li>${M("File ▸ Export…")} → choose <b>Drawing</b> → name it <code>${fileName}.png</code> → Export.</li></ol>
        <h3 style="margin-top:14px">Checklist</h3>
        <ul class="check">${checklist(m).map((c, i) => `<li><label><input type="checkbox" data-c="${i}"><span>${c}</span></label></li>`).join("")}</ul>
      </article>
      <div class="finish" id="finish" role="status"><h2>Long live ${esc(m.name)}!</h2><p>Hand in your two files, then try a bonus below.</p></div>
    </section>
    <section class="sec" id="bonus">
      ${head("Bonus – rule harder", "Same tools, more propaganda. Pick any.")}
      <article class="sheet" style="--tilt:-.2deg">${tape}
        <ul class="bonus">
          <li><b>Flag on a pole</b><span>Duplicate your whole banner (${M("Edit ▸ Select All")}, ${M("Object ▸ Group")}), add a thin rectangle pole and a circle on top → ${M("Path ▸ Union")}.</span></li>
          <li><b>A coin</b><span>Two circles → ${M("Path ▸ Difference")} for the rim, your symbol in the middle, the name with ${M("Text ▸ Put on Path")}.</span></li>
          <li><b>A banknote</b><span>Rectangle, your symbol, the value in big bold text, the motto in a text box.</span></li>
          <li><b>The general's medal</b><span>A star (Star tool, 8 corners) + a ribbon (rectangle → ${M("Path ▸ Object to Path")} → ${T("node")} pull the bottom corners into a V).</span></li>
        </ul>
      </article>
    </section>`;
    box.querySelectorAll(".done-btn").forEach(b => b.addEventListener("click", () => {
      const n = +b.dataset.n;
      S.solved = S.solved.includes(n) ? S.solved.filter(x => x !== n) : [...S.solved, n].sort((x, y) => x - y);
      update();
      if (S.solved.includes(n)) {
        const next = [1, 2, 3, 4, 5, 6, 7].find(k => !S.solved.includes(k));
        const target = next ? document.getElementById("step-" + next) : $("#save");
        if (target && next !== n) setTimeout(() => target.scrollIntoView({ block: "start" }), 250);
      }
    }));
    box.querySelectorAll(".check input").forEach(c => c.addEventListener("change", () => {
      const k = +c.dataset.c;
      S.checks = c.checked ? [...new Set([...S.checks, k])] : S.checks.filter(x => x !== k);
      update();
    }));
    const io = new IntersectionObserver(es => es.forEach(e => {
      if (e.isIntersecting) document.querySelectorAll(".dots a").forEach(a => a.classList.toggle("cur", a.dataset.n === e.target.dataset.n));
    }), { rootMargin: "-40% 0px -55% 0px" });
    box.querySelectorAll(".step").forEach(el => io.observe(el));
    paint();
  }
  function checklist(m) {
    return [
      `The field: ${LAYOUT_NAME[m.layout]}, 300 × 180 mm, exact colours`,
      `Behind the emblem: ${{ rays: "sun rays", halo: "a thin halo ring", bars: "crossed bars (one shape)" }[m.extra]}`,
      `The emblem frame: ${{ ring: "a ring (Difference)", disc: "a disc with an outline", shield: "a shield (Union)" }[m.frameKind]}`,
      `The symbol: ${{ gear: "gear", sun: "rising sun", waves: "waves", mountains: "mountains", tree: "tree", atom: "atom", crown: "crown", crescent: "crescent and star", star: "star outline" }[m.sym]}`,
      `${m.N} star${m.N > 1 ? "s" : ""} for the provinces`,
      `The name ${esc(m.name.toUpperCase())}${m.regime === "auth" ? " in an arc (Put on Path)" : " centred at the top"}`,
      `The motto ${m.regime === "auth" ? "cut out of the band (Object to Path + Difference)" : "flowed into the ribbon (Flow into Frame)"}, and the frame`,
      "Both SVG and PNG saved, with your surname in the file name"
    ];
  }

  /* ------------------------------------------------------------------ progress */
  function paint() {
    document.querySelectorAll(".step").forEach(el => {
      const n = +el.dataset.n, d = S.solved.includes(n);
      el.classList.toggle("is-done", d);
      const b = el.querySelector(".done-btn");
      b.setAttribute("aria-pressed", String(d));
      b.querySelector(".box").textContent = d ? "✓" : "";
      b.querySelector(".t").textContent = d ? "Done" : "I did this step";
    });
    document.querySelectorAll(".dots a").forEach(a => a.classList.toggle("done", S.solved.includes(+a.dataset.n)));
    document.querySelectorAll("#bar i").forEach((i, k) => i.classList.toggle("on", S.solved.includes(k + 1)));
    $("#count").textContent = `${S.solved.length} / 7 steps`;
    document.querySelectorAll(".check input").forEach(c => { c.checked = S.checks.includes(+c.dataset.c); });
    const wasEnd = S.end;
    S.end = S.locked && S.solved.length >= 7 && S.checks.length >= 8;
    const f = $("#finish"); if (f) f.classList.toggle("show", S.end);
    return !wasEnd && S.end;
  }
  function confetti() {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const box = document.createElement("div"); box.className = "confetti";
    const cols = build(A()).pal.concat(["#efeee6"]);
    for (let i = 0; i < 90; i++) {
      const p = document.createElement("i");
      p.style.left = Math.random() * 100 + "vw"; p.style.background = cols[i % cols.length];
      p.style.animationDuration = 1.8 + Math.random() * 1.8 + "s"; p.style.animationDelay = Math.random() * .5 + "s";
      box.appendChild(p);
    }
    document.body.appendChild(box); setTimeout(() => box.remove(), 4200);
  }
  function update() { const j = paint(); save(); if (j) confetti(); }

  $("#reset").addEventListener("click", () => {
    if (!confirm("Start over? Your answers and ticks will be cleared.")) return;
    S = { answers: fresh(), locked: false, solved: [], checks: [], end: false };
    save(); syncForm(); hints(); live(); renderWork(); window.scrollTo({ top: 0 });
  });
  $("#print").addEventListener("click", () => window.print());

  syncForm(); hints(); live(); renderWork();
})();
