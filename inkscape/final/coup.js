/* Coup! – the Inkscape final project (v2).
   One question at a time; the banner stays hidden until every question is answered. The answers deterministically produce
   a banner – layout, colours, frame, background emblem, symbol, stars, name, generated motto – and the guided Inkscape steps
   for exactly that banner. Only the background gets exact numbers; afterwards the page is resized to the banner, and every
   other shape is centred with Align and Distribute (relative to Page), shifted with Transform ▸ Move, or dragged by eye.
   Saved under KEY as {answers, q, revealed, solved:[1..7], checks:[…], end}. The landing page reads "solved" (7 chapters). */
(function () {
  "use strict";
  const KEY = "coup-v1";
  const W = 300, H = 180, CX = 150, CY = 90;
  const $ = s => document.querySelector(s);
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

  /* ------------------------------------------------------------------ data */
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
    industry: { label: "Industry", icon: "⚙️", sym: "gear", word: "Steel" },
    farming: { label: "Farming", icon: "🌾", sym: "sun", word: "Bread" },
    sea: { label: "The sea", icon: "🌊", sym: "waves", word: "Salt" },
    mountains: { label: "Mountains", icon: "⛰️", sym: "mountains", word: "Stone" },
    forests: { label: "Forests", icon: "🌲", sym: "tree", word: "Timber" },
    science: { label: "Science", icon: "⚛️", sym: "atom", word: "Science" },
    kings: { label: "Old kings & history", icon: "👑", sym: "crown", word: "Glory" },
    night: { label: "The night sky", icon: "🌙", sym: "crescent", word: "Starlight" },
    freedom: { label: "Freedom", icon: "⭐", sym: "star", word: "Hope" }
  };
  const SYM_NAME = { gear: "a gear", sun: "a rising sun", waves: "a wave disc", mountains: "mountains in a round window", tree: "a pine tree",
    atom: "an atom", crown: "a jewelled crown", crescent: "a crescent and star", star: "a star outline" };
  const TAKEOVER = {
    palace: { label: "A quiet palace coup at night", icon: "🌙" },
    uprising: { label: "A people's uprising", icon: "✊" },
    parade: { label: "Tanks at the morning parade", icon: "🎖️" },
    lottery: { label: "You won a rigged lottery", icon: "🎟️" }
  };
  const SLIDERS = {
    rule: { q: "How will you rule?", ends: ["Iron fist", "Free elections"], opts: ["Iron fist", "Strict", "Balanced", "Open", "Free elections"],
      hints: ["One leader, one voice, daily parades.", "Rules are rules. Mostly yours.", "A council – that you chair.", "A parliament that sometimes says no.", "Real elections. You might even lose."] },
    econ: { q: "Where does your economy lean?", ends: ["Left", "Right"], opts: ["Far left", "Left", "Centre", "Right", "Far right"],
      hints: ["The state owns every factory.", "Workers first, big public services.", "A bit of everything.", "Business first, low taxes.", "The market decides everything."] },
    army: { q: "How much does your power rest on the army?", ends: ["Peace", "Army"], opts: ["Pacifist", "Peaceful", "Watchful", "Strong", "Military state"],
      hints: ["Soldiers now plant trees.", "A small army for parades.", "Ready, but quiet.", "Tanks at every celebration.", "The army IS the state."] },
    trad: { q: "Tradition or progress?", ends: ["Tradition", "Progress"], opts: ["Old ways", "Traditional", "Balanced", "Modern", "Future first"],
      hints: ["Like grandfather did it.", "Change slowly, if at all.", "Keep the good, change the rest.", "New ideas welcome.", "Robots, rockets, tomorrow."] }
  };

  /* ------------------------------------------------------------------ colour helpers */
  const rgb = h => { h = h.replace("#", ""); return [0, 2, 4].map(i => parseInt(h.substr(i, 2), 16)); };
  const lum = h => { const c = rgb(h).map(v => { v /= 255; return v <= .03928 ? v / 12.92 : Math.pow((v + .055) / 1.055, 2.4); }); return .2126 * c[0] + .7152 * c[1] + .0722 * c[2]; };
  const contrast = (a, b) => { const x = lum(a), y = lum(b); return (Math.max(x, y) + .05) / (Math.min(x, y) + .05); };
  const close = (a, b) => rgb(a).reduce((s, v, i) => s + Math.abs(v - rgb(b)[i]), 0) < 60;
  const WHITE = "#FFFFFF", BLACK = "#111111";
  const uniq = a => a.filter((c, i) => a.findIndex(d => close(c, d)) === i);
  const worstC = (c, bgs) => Math.min(...bgs.map(b => contrast(b, c)));
  function best(bg, cands, palette, avoid) {
    const ok = c => !(avoid && avoid.some(a => close(a, c))) && !close(c, bg);
    const pick = list => list.filter(ok).sort((a, b) => contrast(bg, b) - contrast(bg, a))[0];
    const fromPal = pick(cands.filter(c => palette.some(p => close(p, c))));
    if (fromPal && contrast(bg, fromPal) >= 2.6) return fromPal;
    const any = pick(cands);
    if (any && contrast(bg, any) >= 2.2) return any;
    return [...cands, WHITE, BLACK].filter(c => !close(c, bg)).sort((a, b) => contrast(bg, b) - contrast(bg, a))[0] || (lum(bg) > .4 ? BLACK : WHITE);
  }
  function bestMulti(bgs, cands, palette, avoid) {
    const ok = c => !(avoid && avoid.some(a => close(a, c))) && !bgs.some(b => close(c, b));
    const pick = list => list.filter(ok).sort((a, b) => worstC(b, bgs) - worstC(a, bgs))[0];
    const fromPal = pick(cands.filter(c => palette.some(p => close(p, c))));
    if (fromPal && worstC(fromPal, bgs) >= 2.6) return fromPal;
    return pick(cands) || pick([WHITE, BLACK]) || WHITE;
  }
  const hex6 = h => h.replace("#", "").toLowerCase();
  const FONT_B = "Arial Black,Impact,sans-serif", FONT_R = "Atkinson Hyperlegible,Arial,sans-serif";
  let ctx2d = null;
  function emWidth(text, family, weight) {
    try { ctx2d = ctx2d || document.createElement("canvas").getContext("2d"); ctx2d.font = `${weight} 100px ${family}`; return ctx2d.measureText(text).width / 100; }
    catch (e) { return text.length * (weight >= 800 ? .95 : .62); }
  }

  /* ------------------------------------------------------------------ geometry helpers */
  const r1 = v => Math.round(v * 10) / 10;
  const mm = v => String(Math.round(v));
  function starPts(cx, cy, R, ratio, n, rot = -90) {
    const p = [];
    for (let i = 0; i < 2 * n; i++) { const a = (rot + i * 180 / n) * Math.PI / 180, rr = i % 2 ? R * ratio : R; p.push([cx + rr * Math.cos(a), cy + rr * Math.sin(a)]); }
    return p;
  }
  const P = p => p.map(q => q.map(r1).join(",")).join(" ");
  const bb = p => { const xs = p.map(q => q[0]), ys = p.map(q => q[1]); return [Math.min(...xs), Math.min(...ys), Math.max(...xs), Math.max(...ys)]; };
  const cb = (x, y, r) => [x - r, y - r, x + r, y + r];
  const tri = (cx, cy, w, h) => [[cx - w / 2, cy + h / 2], [cx, cy - h / 2], [cx + w / 2, cy + h / 2]];        /* apex up */
  const triR = (x0, cy, w, h) => [[x0, cy - h / 2], [x0 + w, cy], [x0, cy + h / 2]];                           /* apex right */
  function inPoly(x, y, p) {
    let ins = false;
    for (let i = 0, j = p.length - 1; i < p.length; j = i++) { const [xi, yi] = p[i], [xj, yj] = p[j]; if ((yi > y) !== (yj > y) && x < (xj - xi) * (y - yi) / (yj - yi) + xi) ins = !ins; }
    return ins;
  }
  const rotPt = ([x, y], a, ox, oy) => { const t = a * Math.PI / 180, c = Math.cos(t), s = Math.sin(t); return [ox + (x - ox) * c - (y - oy) * s, oy + (x - ox) * s + (y - oy) * c]; };
  const ellPath = (cx, cy, rx, ry) => `M${r1(cx - rx)} ${r1(cy)}a${r1(rx)} ${r1(ry)} 0 1 0 ${r1(2 * rx)} 0a${r1(rx)} ${r1(ry)} 0 1 0 ${r1(-2 * rx)} 0Z`;

  /* ------------------------------------------------------------------ instruction helpers */
  const T = t => `<img class="ti" src="../img/common/tools/${t}.png" alt="${t} tool" title="${t} tool">`;
  const M = t => `<span class="menu">${t}</span>`;
  const K = t => `<span class="key">${t}</span>`;
  const C = h => `<span class="sw" style="--c:${h}"></span><code class="hex">${hex6(h)}ff</code>`;
  const SZ = (w, h) => `<span class="nums">W ${mm(w)}, H ${mm(h)}</span>`;
  const ALN = { left: "Align left edges", cv: "Center on vertical axis", right: "Align right edges", top: "Align top edges", ch: "Center on horizontal axis", bottom: "Align bottom edges", dh: "Distribute centers horizontally" };
  const ALI = { left: "al-left", cv: "al-cv", right: "al-right", top: "al-top", ch: "al-ch", bottom: "al-bottom", dh: "di-ch" };
  const AL = (...k) => `<span class="align">${k.map(x => `<img class="ai" src="../img/common/tools/${ALI[x]}.png" alt="${ALN[x]}" title="${ALN[x]}">`).join("")}<i>${k.map(x => ALN[x]).join(" + ")}</i></span>`;
  const CENTRE = AL("cv", "ch");
  const MOVE = (dx, dy) => {
    const parts = [];
    if (Math.round(dx)) parts.push(`Horizontal <b>${Math.round(dx) > 0 ? "+" : "−"}${Math.abs(Math.round(dx))}</b> (${dx > 0 ? "right" : "left"})`);
    if (Math.round(dy)) parts.push(`Vertical <b>${Math.round(dy) > 0 ? "+" : "−"}${Math.abs(Math.round(dy))}</b> (${dy > 0 ? "down" : "up"})`);
    return parts.length ? `${M("Object ▸ Transform…")} → <i>Move</i>, <i>Relative move</i> on: ${parts.join(", ")} → Apply` : "";
  };
  const fillRow = h => `fill RGBA ${C(h)}`;
  const pt = v => Math.round(v / 0.3528);

  /* ------------------------------------------------------------------ the generator */
  const LAYOUTS = [                         /* [rule][trad] */
    ["border", "chevron", "triangle", "cross", "diagonal"],
    ["border", "triangle", "chevron", "diagonal", "bi-h"],
    ["cross", "tri-h", "wave", "tri-v", "diagonal"],
    ["canton", "tri-h", "wave", "tri-v", "bi-h"],
    ["canton", "tri-v", "wave", "tri-h", "diagonal"]
  ];
  const LAYOUT_NAME = { "tri-h": "horizontal tricolour", "tri-v": "vertical tricolour", "bi-h": "two stripes", cross: "centre cross",
    triangle: "hoist triangle", diagonal: "diagonal band", canton: "canton", border: "bordered field", chevron: "chevron", wave: "wave" };
  const FRAME_NAME = ["a cog ring", "a ring", "a disc with an outline", "a round shield", "a pointed shield"];
  const BEHIND_NAME = ["a sunburst", "a compass star", "a halo", "crossed bars", "crossed blades"];

  function motto(a) {
    const A = ["Obedience", "Order", "Unity", "Liberty", "Freedom"][a.rule];
    const Cw = ["Tradition", "Honour", "Balance", "Progress", "Tomorrow"][a.trad];
    const D = ["Peace", "Calm", "Vigilance", "Strength", "Victory"][a.army];
    const E = ["the Workers", "the People", "Everyone", "Enterprise", "the Market"][a.econ];
    const B = (PRIDE[a.pride] || PRIDE.freedom).word;
    return { palace: `${A}, ${B}, ${D}`, uprising: `${B} for ${E}`, parade: `${D} Through ${A}`, lottery: `${Cw} and ${B}` }[a.takeover] || `${A} and ${B}`;
  }

  function build(A) {
    let uid = 0; const id = p => `${p}${++uid}`;
    let pal = (A.palette || []).map(c => c.toUpperCase());
    pal = uniq(pal);
    if (!pal.length) pal = ["#6A4C93", "#F2D264", "#1982C4"];
    const main = pal.find(c => close(c, A.main || "")) || pal[0];
    pal = [main, ...pal.filter(c => !close(c, main))];
    if (pal.length === 1) pal.push(lum(main) > .4 ? BLACK : WHITE);
    const f0 = pal[0], f1 = pal[1], f2 = pal[2] || (pal.length > 3 ? pal[3] : pal[0]);
    const cands = [...pal, WHITE, BLACK];
    const rule = A.rule, econ = A.econ, army = A.army, trad = A.trad;
    const layout = LAYOUTS[rule][trad];
    const N = A.provinces;
    const sym = PRIDE[A.pride].sym;
    const NAME = A.name.trim().toUpperCase().slice(0, 26) || "REPUBLIC";
    const MOTTO = motto(A), MOTTO_U = MOTTO.toUpperCase();
    const arcName = rule <= 1 || (rule === 2 && army >= 3);
    const bandMotto = rule <= 2;
    const r = layout === "border" ? 36 : 34;

    const items = [], steps = {}, why = [], skills = new Set(["Exact colours (RGBA)", "Align and Distribute", "Text tool"]);
    const add = (step, svg, b) => items.push({ step, svg, b });
    const rect = (x, y, w, h, c, extra = "") => `<rect x="${r1(x)}" y="${r1(y)}" width="${r1(w)}" height="${r1(h)}" fill="${c}"${extra}/>`;
    const BG = c => `${T("rect")} Draw a rectangle, ${T("selector")} type ${SZ(W, H)} (lock open), ${fillRow(c)}, <i>Stroke paint</i> → <b>X</b>. Then ${M("Edit ▸ Resize Page to Selection")} – the page is now exactly your banner.`;

    /* ---------- STEP 1: field ---------- */
    let colorAt = () => f0; const L1 = [];
    if (layout === "tri-h" || layout === "canton") {
      const top = layout === "canton" ? f1 : f0, mid = layout === "canton" ? f2 : f1, bot = layout === "canton" ? f1 : f2;
      add(1, rect(0, 0, W, H, mid), [0, 0, W, H]); add(1, rect(0, 0, W, 60, top) + rect(0, 120, W, 60, bot), [0, 0, W, H]);
      L1.push(BG(mid), `${T("rect")} Top stripe ${SZ(W, 60)}, ${fillRow(top)}, then ${M("Object ▸ Align and Distribute…")} ${AL("cv", "top")}.`,
        `${M("Edit ▸ Duplicate")}, ${fillRow(bot)}, then ${AL("cv", "bottom")}.`);
      colorAt = (x, y) => y < 60 ? top : y < 120 ? mid : bot;
      if (layout === "canton") {
        add(1, rect(0, 0, 96, 72, f0), [0, 0, 96, 72]); const prev = colorAt;
        L1.push(`${T("rect")} The canton ${SZ(96, 72)}, ${fillRow(f0)}, ${AL("left", "top")}. Your provinces' stars go here later.`);
        colorAt = (x, y) => x < 96 && y < 72 ? f0 : prev(x, y);
      }
    }
    if (layout === "tri-v") {
      add(1, rect(0, 0, W, H, f1), [0, 0, W, H]); add(1, rect(0, 0, 100, H, f0) + rect(200, 0, 100, H, f2), [0, 0, W, H]);
      L1.push(BG(f1), `${T("rect")} Left stripe ${SZ(100, H)}, ${fillRow(f0)}, ${M("Object ▸ Align and Distribute…")} ${AL("left", "ch")}.`,
        `${M("Edit ▸ Duplicate")}, ${fillRow(f2)}, ${AL("right", "ch")}.`);
      colorAt = x => x < 100 ? f0 : x < 200 ? f1 : f2;
    }
    if (layout === "bi-h") {
      add(1, rect(0, 0, W, H, f1), [0, 0, W, H]); add(1, rect(0, 0, W, 90, f0), [0, 0, W, 90]);
      L1.push(BG(f1), `${T("rect")} Upper half ${SZ(W, 90)}, ${fillRow(f0)}, ${M("Object ▸ Align and Distribute…")} ${AL("cv", "top")}.`);
      colorAt = (x, y) => y < 90 ? f0 : f1;
    }
    if (layout === "cross") {
      add(1, rect(0, 0, W, H, f1), [0, 0, W, H]);
      add(1, `<path d="M0 72H300V108H0Z M132 0H168V180H132Z" fill="${f0}"/>`, [0, 0, W, H]);
      L1.push(BG(f1), `${T("rect")} Two bars: ${SZ(W, 36)} and ${SZ(36, H)}, both ${fillRow(f0)}. Select each and ${M("Object ▸ Align and Distribute…")} ${CENTRE}.`,
        `${T("selector")} Click one bar, ${K("Shift")} + click the other → ${M("Path ▸ Union")}: one cross.`);
      colorAt = (x, y) => (y > 72 && y < 108) || (x > 132 && x < 168) ? f0 : f1;
      skills.add("Union");
    }
    if (layout === "triangle") {
      const t = triR(0, CY, 100, H);
      add(1, rect(0, 0, W, H, f2), [0, 0, W, H]); add(1, rect(0, 0, W, 90, f1), [0, 0, W, 90]); add(1, `<polygon points="${P(t)}" fill="${f0}"/>`, [0, 0, 100, H]);
      L1.push(BG(f2), `${T("rect")} Upper half ${SZ(W, 90)}, ${fillRow(f1)}, ${M("Object ▸ Align and Distribute…")} ${AL("cv", "top")}.`,
        `${T("star")} Star tool, <b>polygon</b> mode, Corners <b>3</b>: draw a triangle. ${M("Object ▸ Rotate 90° CW")} – it points right.`,
        `${T("selector")} Type ${SZ(100, H)}, ${fillRow(f0)}, ${AL("left", "ch")}.`);
      colorAt = (x, y) => inPoly(x, y, t) ? f0 : y < 90 ? f1 : f2;
      skills.add("Rotate 90°");
    }
    if (layout === "diagonal") {
      const band = [[-40, -21], [340, -21], [340, 21], [-40, 21]].map(q => rotPt([q[0] + CX - 150, q[1] + CY], -31, CX, CY));
      const cid = id("c");
      add(1, rect(0, 0, W, H, f1), [0, 0, W, H]);
      add(1, `<clipPath id="${cid}"><rect width="${W}" height="${H}"/></clipPath><polygon clip-path="url(#${cid})" points="${P(band)}" fill="${f0}"/>`, [0, 0, W, H]);
      L1.push(BG(f1), `${T("rect")} A long band ${SZ(380, 42)}, ${fillRow(f0)}.`,
        `${M("Object ▸ Transform…")} → <i>Rotate</i>: <b>31°</b> counter-clockwise → Apply. Then ${M("Object ▸ Align and Distribute…")} ${CENTRE}.`,
        `The band sticks out of the banner. Click the background, ${M("Edit ▸ Duplicate")}, ${M("Object ▸ Raise to Top")}; ${K("Shift")} + click the band → ${M("Path ▸ Intersection")}: only the part inside the banner stays.`);
      colorAt = (x, y) => inPoly(x, y, band) ? f0 : f1;
      skills.add("Transform (rotate)"); skills.add("Intersection");
    }
    if (layout === "border") {
      add(1, rect(0, 0, W, H, f0), [0, 0, W, H]); add(1, rect(14, 14, 272, 152, f1), [14, 14, 286, 166]);
      L1.push(BG(f0), `${T("rect")} Inner field ${SZ(272, 152)}, ${fillRow(f1)}, ${M("Object ▸ Align and Distribute…")} ${CENTRE} – a border appears all round.`);
      colorAt = (x, y) => x < 14 || y < 14 || x > 286 || y > 166 ? f0 : f1;
    }
    if (layout === "chevron") {
      const outer = triR(0, CY, 150, H), inner = triR(0, CY, 100, 120), cid = id("m");
      add(1, rect(0, 0, W, H, f1), [0, 0, W, H]);
      add(1, `<mask id="${cid}"><rect width="${W}" height="${H}" fill="#fff"/><polygon points="${P(inner)}" fill="#000"/></mask><polygon mask="url(#${cid})" points="${P(outer)}" fill="${f0}"/>`, [0, 0, 150, H]);
      L1.push(BG(f1), `${T("star")} Star tool, <b>polygon</b> mode, Corners <b>3</b>: a triangle, ${M("Object ▸ Rotate 90° CW")}, type ${SZ(150, H)}, ${fillRow(f0)}, ${M("Object ▸ Align and Distribute…")} ${AL("left", "ch")}.`,
        `${M("Edit ▸ Duplicate")}, type ${SZ(100, 120)}, ${AL("left", "ch")} again – a smaller triangle on top.`,
        `${T("selector")} Select both → ${M("Path ▸ Difference")}: a chevron (a V lying on its side).`);
      colorAt = (x, y) => inPoly(x, y, outer) && !inPoly(x, y, inner) ? f0 : f1;
      skills.add("Difference"); skills.add("Rotate 90°");
    }
    if (layout === "wave") {
      const xs = [32, 91, 150, 209, 268];
      add(1, rect(0, 0, W, H, f0), [0, 0, W, H]);
      add(1, `<g fill="${f1}">${rect(0, 90, W, 90, f1)}${xs.map(x => `<ellipse cx="${x}" cy="90" rx="32" ry="13"/>`).join("")}</g>`, [0, 77, W, H]);
      L1.push(BG(f0), `${T("rect")} Lower half ${SZ(W, 90)}, ${fillRow(f1)}, ${M("Object ▸ Align and Distribute…")} ${AL("cv", "bottom")}.`,
        `${T("ellipse")} An ellipse ${SZ(64, 26)}, same colour. ${M("Edit ▸ Duplicate")} it 4 times and drag the 5 ellipses along the top edge of the lower half.`,
        `Select the 5 ellipses → ${AL("dh")}. Then add the lower half to the selection → ${M("Path ▸ Union")}: a wavy edge.`);
      colorAt = (x, y) => (y > 90 || xs.some(cx => ((x - cx) / 32) ** 2 + ((y - 90) / 13) ** 2 < 1)) ? f1 : f0;
      skills.add("Union");
    }
    steps[1] = { title: "The field", lead: `Your banner is a <b>${LAYOUT_NAME[layout]}</b>. Only the background gets exact numbers – then the page becomes the banner and everything else is aligned to it.`, list: L1,
      stuck: ["The Align buttons do nothing: check <i>Relative to: Page</i> at the top of the Align and Distribute panel, and that the page was resized to the banner.",
        "Size fields greyed out: select the shape with the Selector first. Press Enter after each number."] };
    why.push(`<b>${SLIDERS.rule.opts[rule]}</b> + <b>${SLIDERS.trad.opts[trad]}</b> → ${LAYOUT_NAME[layout]}`);

    /* ---------- colours that depend on the field ---------- */
    const around = (R, n = 16) => uniq(Array.from({ length: n }, (_, i) => { const a = i / n * 2 * Math.PI; return colorAt(CX + R * Math.cos(a), CY + R * Math.sin(a)); }).concat([colorAt(CX, CY)]));
    const bgRing = around(r * .95);
    const frameCol = bestMulti(bgRing, cands, pal);
    const extraCol = bestMulti(around(r * 1.25), cands, pal, [frameCol]);
    const inner = econ <= 1;                               /* ring frames get a filled centre */
    const innerCol = inner ? best(frameCol, cands, pal, [frameCol]) : null;
    const symBg = inner ? innerCol : frameCol;
    const symCol = best(symBg, cands, pal, inner ? [] : [frameCol]);
    const frameOutl = econ !== 2 && worstC(frameCol, bgRing) < 1.6 ? best(frameCol, [WHITE, BLACK, ...pal], pal) : null;

    /* ---------- STEP 2: behind the emblem (army) ---------- */
    const L2 = []; const ec = extraCol;
    if (army === 0) {
      const p = starPts(CX, CY, r * 1.3, .45, 24); add(2, `<polygon points="${P(p)}" fill="${ec}"/>`, bb(p));
      L2.push(`${T("star")} Star tool, <b>star</b> mode, Corners <b>24</b>, Spoke ratio <b>0.45</b>: drag out a star. Type ${SZ(bb(p)[2] - bb(p)[0], bb(p)[3] - bb(p)[1])}, ${fillRow(ec)}.`,
        `${M("Object ▸ Align and Distribute…")} ${CENTRE}.`);
    }
    if (army === 1) {
      const p = starPts(CX, CY, r * 1.32, .32, 8), c = r * .62, cid = id("g");
      add(2, `<g fill="${ec}"><polygon points="${P(p)}"/><circle cx="${CX}" cy="${CY}" r="${r1(c)}"/></g>`, bb(p));
      L2.push(`${T("star")} Star tool, <b>star</b> mode, Corners <b>8</b>, Spoke ratio <b>0.32</b>. Type ${SZ(bb(p)[2] - bb(p)[0], bb(p)[3] - bb(p)[1])}, ${fillRow(ec)}.`,
        `${T("ellipse")} A circle ${SZ(2 * c, 2 * c)}, same colour. Centre both: ${CENTRE}.`, `Select both → ${M("Path ▸ Union")}: a compass star.`);
      skills.add("Union");
    }
    if (army === 2) {
      const R1 = r + 9, R2 = r + 5, cid = id("m");
      add(2, `<mask id="${cid}"><rect width="${W}" height="${H}" fill="#fff"/><circle cx="${CX}" cy="${CY}" r="${R2}" fill="#000"/></mask><circle mask="url(#${cid})" cx="${CX}" cy="${CY}" r="${R1}" fill="${ec}"/>`, cb(CX, CY, R1));
      L2.push(`${T("ellipse")} A circle ${SZ(2 * R1, 2 * R1)}, ${fillRow(ec)}. A second circle ${SZ(2 * R2, 2 * R2)}.`,
        `Centre both: ${M("Object ▸ Align and Distribute…")} ${CENTRE}. Select both → ${M("Path ▸ Difference")}: a thin halo.`);
      skills.add("Difference");
    }
    if (army >= 3) {
      const len = army === 3 ? r * 2.9 : r * 2.5, th = army === 3 ? r * .24 : r * .2;
      let shape;
      if (army === 3) shape = [[CX - len / 2, CY - th / 2], [CX + len / 2, CY - th / 2], [CX + len / 2, CY + th / 2], [CX - len / 2, CY + th / 2]];
      else { const tl = r * .42; shape = [[CX - len / 2, CY - th / 2], [CX + len / 2 - tl, CY - th / 2], [CX + len / 2 - tl, CY - th * .95], [CX + len / 2, CY], [CX + len / 2 - tl, CY + th * .95], [CX + len / 2 - tl, CY + th / 2], [CX - len / 2, CY + th / 2]]; }
      const a = shape.map(q => rotPt(q, 45, CX, CY)), b2 = a.map(([x, y]) => [2 * CX - x, y]);
      add(2, `<g fill="${ec}"><polygon points="${P(a)}"/><polygon points="${P(b2)}"/></g>`, bb([...a, ...b2]));
      if (army === 3) L2.push(`${T("rect")} A bar ${SZ(len, th)}, ${fillRow(ec)}.`);
      else L2.push(`${T("rect")} A blade: a bar ${SZ(len - r * .42, th)}, ${fillRow(ec)}.`,
        `${T("star")} Polygon mode, Corners 3: a small triangle, ${M("Object ▸ Rotate 90° CW")}, type ${SZ(r * .42, th * 1.9)}. Drag it so it touches the right end of the bar → select both → ${M("Path ▸ Union")}: a blade.`);
      L2.push(`${M("Object ▸ Transform…")} → <i>Rotate</i> <b>45°</b> → Apply. ${M("Edit ▸ Duplicate")}, ${M("Object ▸ Flip Horizontal")}: an X.`,
        `${K("Shift")} + click the first one → ${M("Path ▸ Union")}. ${M("Object ▸ Align and Distribute…")} ${CENTRE}.`);
      skills.add("Union"); skills.add("Transform (rotate)");
    }
    steps[2] = { title: "Behind the emblem", lead: `Your army level puts <b>${BEHIND_NAME[army]}</b> behind the emblem.`, list: L2,
      stuck: ["Union or Difference greyed out: exactly the shapes you need must be selected – the status bar counts them.",
        "The X is crooked: use Flip Horizontal for the copy, don't rotate it again."] };
    why.push(`<b>${SLIDERS.army.opts[army]}</b> → ${BEHIND_NAME[army]} behind the emblem`);

    /* ---------- STEP 3: frame (economy) ---------- */
    const L3 = []; const fc = frameCol;
    const outl = frameOutl ? ` stroke="${frameOutl}" stroke-width="1.5"` : "";
    let rs = r * .66, sy = CY;
    if (econ <= 1) {
      const ri = r - 8, cid = id("m");
      const outer = econ === 0 ? `<polygon points="${P(starPts(CX, CY, r, .86, 20))}" fill="${fc}" mask="url(#${cid})"${outl}/>` : `<circle cx="${CX}" cy="${CY}" r="${r}" fill="${fc}" mask="url(#${cid})"${outl}/>`;
      add(3, `<mask id="${cid}"><rect width="${W}" height="${H}" fill="#fff"/><circle cx="${CX}" cy="${CY}" r="${ri}" fill="#000"/></mask>${outer}<circle cx="${CX}" cy="${CY}" r="${ri}" fill="${innerCol}"/>`, cb(CX, CY, r));
      if (econ === 0) { const p = starPts(CX, CY, r, .86, 20); L3.push(`${T("star")} Star tool, <b>star</b> mode, Corners <b>20</b>, Spoke ratio <b>0.86</b>. Type ${SZ(bb(p)[2] - bb(p)[0], bb(p)[3] - bb(p)[1])}, ${fillRow(fc)}.`); }
      else L3.push(`${T("ellipse")} A circle ${SZ(2 * r, 2 * r)}, ${fillRow(fc)}.`);
      L3.push(`${T("ellipse")} A smaller circle ${SZ(2 * ri, 2 * ri)}. Centre both: ${M("Object ▸ Align and Distribute…")} ${CENTRE}.`,
        `Select both → ${M("Path ▸ Difference")}: ${econ === 0 ? "a cog ring" : "a ring"}.`,
        `Fill the hole: one more circle ${SZ(2 * ri, 2 * ri)}, ${fillRow(innerCol)}, ${CENTRE}.`);
      rs = ri * .86;
      skills.add("Difference");
    }
    if (econ === 2) {
      add(3, `<circle cx="${CX}" cy="${CY}" r="${r}" fill="${fc}" stroke="${extraCol}" stroke-width="2"/>`, cb(CX, CY, r));
      L3.push(`${T("ellipse")} A circle ${SZ(2 * r, 2 * r)}, ${M("Object ▸ Align and Distribute…")} ${CENTRE}.`,
        `${M("Object ▸ Fill and Stroke…")} <i>Fill</i> RGBA ${C(fc)}; <i>Stroke paint</i> RGBA ${C(extraCol)}; <i>Stroke style</i> width <b>2 mm</b>.`);
      rs = (r - 4) * .86; skills.add("Fill and stroke");
    }
    if (econ === 3) {
      const rc = .8 * r;
      add(3, `<path d="M${r1(CX - rc)} ${r1(CY - r)}H${r1(CX + rc)}V${CY}A${r1(rc)} ${r1(rc)} 0 0 1 ${r1(CX - rc)} ${CY}Z" fill="${fc}"${outl}/>`, [CX - rc, CY - r, CX + rc, CY + rc]);
      L3.push(`${T("rect")} A rectangle ${SZ(2 * rc, r)} and ${T("ellipse")} a circle ${SZ(2 * rc, 2 * rc)}, both ${fillRow(fc)}.`,
        `Centre both: ${M("Object ▸ Align and Distribute…")} ${CENTRE}. Then the rectangle only: ${MOVE(0, -r / 2)}.`,
        `Select both → ${M("Path ▸ Union")}: a round-bottomed shield.`);
      rs = rc * .8; sy = CY - r * .1; skills.add("Union"); skills.add("Transform (move)");
    }
    if (econ === 4) {
      const R = 1.6 * r, d = .8 * r, oy = -.45 * r, cA = id("c"), cB = id("c");
      add(3, `<clipPath id="${cA}"><circle cx="${r1(CX + d)}" cy="${r1(CY + oy)}" r="${r1(R)}"/></clipPath><clipPath id="${cB}"><circle cx="${r1(CX - d)}" cy="${r1(CY + oy)}" r="${r1(R)}"/></clipPath><g clip-path="url(#${cA})"><rect clip-path="url(#${cB})" x="${r1(CX - d)}" y="${r1(CY - .95 * r)}" width="${r1(2 * d)}" height="${r1(1.9 * r)}" fill="${fc}"/></g>${frameOutl ? `<path d="M${r1(CX - d)} ${r1(CY - .95 * r)}H${r1(CX + d)}V${r1(CY + .1 * r)}Q${r1(CX + d * .7)} ${r1(CY + .7 * r)} ${CX} ${r1(CY + .94 * r)}Q${r1(CX - d * .7)} ${r1(CY + .7 * r)} ${r1(CX - d)} ${r1(CY + .1 * r)}Z" fill="none" stroke="${frameOutl}" stroke-width="1.5"/>` : ""}`, [CX - d, CY - .95 * r, CX + d, CY + .94 * r]);
      L3.push(`${T("ellipse")} A big circle ${SZ(2 * R, 2 * R)}, ${fillRow(fc)}. ${M("Object ▸ Align and Distribute…")} ${CENTRE}, then ${MOVE(d, oy)}.`,
        `${M("Edit ▸ Duplicate")}, then ${MOVE(-2 * d, 0)}. Select both circles → ${M("Path ▸ Intersection")}: a pointed lens.`,
        `${T("rect")} A rectangle ${SZ(2 * d, 1.9 * r)}, ${CENTRE}. Select lens + rectangle → ${M("Path ▸ Intersection")} again: a pointed shield with a flat top.`);
      rs = d * .78; sy = CY - r * .12; skills.add("Intersection"); skills.add("Transform (move)");
    }
    if (frameOutl) L3.push(`It blends into the field, so outline it: <i>Stroke paint</i> RGBA ${C(frameOutl)}, width <b>1.5 mm</b>.`);
    steps[3] = { title: "The emblem frame", lead: `Your economy gives the emblem <b>${FRAME_NAME[econ]}</b>.`, list: L3,
      stuck: ["Difference removed the wrong shape: the shape to cut out must be on TOP. Undo, click it, Object ▸ Raise to Top.",
        "Transform ▸ Move went the wrong way: check <i>Relative move</i> is ticked; + is right/down, − is left/up."] };
    why.push(`<b>${SLIDERS.econ.opts[econ]}</b> → ${FRAME_NAME[econ]}`);

    /* ---------- STEP 4: symbol (pride) ---------- */
    const L4 = []; const sc = symCol; let symSvg = "", symB = cb(CX, sy, rs);
    const dy0 = sy - CY;
    const ctr = (dx, dy) => (Math.round(dx) || Math.round(dy + dy0)) ? `${CENTRE}, then ${MOVE(dx, dy + dy0)}` : CENTRE;
    if (sym === "gear") {
      const p = starPts(CX, sy, rs, .8, 12), cid = id("m");
      symSvg = `<mask id="${cid}"><rect width="${W}" height="${H}" fill="#fff"/><circle cx="${CX}" cy="${r1(sy)}" r="${r1(rs * .38)}" fill="#000"/></mask><polygon mask="url(#${cid})" points="${P(p)}" fill="${sc}"/>`; symB = bb(p);
      L4.push(`${T("star")} Star tool, <b>star</b> mode, Corners <b>12</b>, Spoke ratio <b>0.8</b>: ${SZ(bb(p)[2] - bb(p)[0], bb(p)[3] - bb(p)[1])}, ${fillRow(sc)}. ${ctr(0, 0)}.`,
        `${T("ellipse")} A small circle ${SZ(rs * .76, rs * .76)}, ${ctr(0, 0)}. Select both → ${M("Path ▸ Difference")}: a gear.`);
      skills.add("Difference");
    }
    if (sym === "sun") {
      const p = starPts(CX, sy, rs * .95, .55, 16), cid = id("c");
      symSvg = `<clipPath id="${cid}"><rect width="${W}" height="${r1(sy)}"/></clipPath><g clip-path="url(#${cid})" fill="${sc}"><polygon points="${P(p)}"/><circle cx="${CX}" cy="${r1(sy)}" r="${r1(rs * .5)}"/></g>${rect(CX - rs, sy + rs * .1, 2 * rs, rs * .14, sc)}`;
      L4.push(`${T("ellipse")} A circle ${SZ(rs, rs)} and ${T("star")} a star (star mode, Corners <b>16</b>, Spoke ratio <b>0.55</b>) ${SZ(bb(p)[2] - bb(p)[0], bb(p)[3] - bb(p)[1])}, both ${fillRow(sc)}. ${ctr(0, 0)} for both → ${M("Path ▸ Union")}.`,
        `${T("rect")} A rectangle ${SZ(2.2 * rs, 1.1 * rs)}, ${ctr(0, .55 * rs)} – it covers the lower half. Sun + rectangle → ${M("Path ▸ Difference")}: the sun rises.`,
        `${T("rect")} A thin horizon ${SZ(2 * rs, .14 * rs)}, ${ctr(0, .17 * rs)}.`);
      skills.add("Union"); skills.add("Difference");
    }
    if (sym === "waves") {
      const cid = id("m"), ys = [-.44, 0, .44];
      symSvg = `<mask id="${cid}"><rect width="${W}" height="${H}" fill="#fff"/>${ys.map(k => `<ellipse cx="${CX}" cy="${r1(sy + k * rs)}" rx="${r1(rs * 1.2)}" ry="${r1(rs * .11)}" fill="#000"/>`).join("")}</mask><circle mask="url(#${cid})" cx="${CX}" cy="${r1(sy)}" r="${r1(rs)}" fill="${sc}"/>`;
      L4.push(`${T("ellipse")} A circle ${SZ(2 * rs, 2 * rs)}, ${fillRow(sc)}, ${ctr(0, 0)}.`,
        `${T("ellipse")} A flat ellipse ${SZ(2.4 * rs, .22 * rs)}, ${ctr(0, 0)}. ${M("Edit ▸ Duplicate")} → ${MOVE(0, -.44 * rs)}. Duplicate again → ${MOVE(0, .88 * rs)}.`,
        `Select the 3 ellipses → ${M("Path ▸ Union")}. Circle + ellipses → ${M("Path ▸ Difference")}: waves.`);
      skills.add("Union"); skills.add("Difference");
    }
    if (sym === "mountains") {
      const big = tri(CX - .25 * rs, sy, 1.6 * rs, 1.3 * rs), small = tri(CX + .45 * rs, sy + .225 * rs, 1.1 * rs, .85 * rs), cid = id("c");
      symSvg = `<clipPath id="${cid}"><circle cx="${CX}" cy="${r1(sy)}" r="${r1(rs)}"/></clipPath><g clip-path="url(#${cid})" fill="${sc}"><polygon points="${P(big)}"/><polygon points="${P(small)}"/></g>`;
      L4.push(`${T("star")} Polygon mode, Corners <b>3</b>: a big triangle ${SZ(1.6 * rs, 1.3 * rs)}, ${fillRow(sc)}, ${ctr(-.25 * rs, 0)}.`,
        `A smaller triangle ${SZ(1.1 * rs, .85 * rs)}, ${ctr(.45 * rs, .225 * rs)}. Select both → ${M("Path ▸ Union")}.`,
        `${T("ellipse")} A circle ${SZ(2 * rs, 2 * rs)}, ${ctr(0, 0)}. Mountains + circle → ${M("Path ▸ Intersection")}: mountains in a round window.`);
      skills.add("Union"); skills.add("Intersection");
    }
    if (sym === "tree") {
      const parts = [[1.0, .8, -.5], [1.3, .9, -.12], [1.6, 1.0, .3]].map(([w, h, o]) => tri(CX, sy + o * rs, w * rs, h * rs));
      const tr = [CX - .14 * rs, sy + .7 * rs, CX + .14 * rs, sy + 1.0 * rs];
      symSvg = `<g fill="${sc}">${parts.map(t => `<polygon points="${P(t)}"/>`).join("")}${rect(tr[0], tr[1], tr[2] - tr[0], tr[3] - tr[1], sc)}</g>`; symB = [CX - .8 * rs, sy - .9 * rs, CX + .8 * rs, sy + rs];
      L4.push(`${T("star")} Polygon mode, Corners <b>3</b>, ${fillRow(sc)}: three triangles – ${SZ(rs, .8 * rs)} ${ctr(0, -.5 * rs)}; ${SZ(1.3 * rs, .9 * rs)} ${ctr(0, -.12 * rs)}; ${SZ(1.6 * rs, rs)} ${ctr(0, .3 * rs)}.`,
        `${T("rect")} The trunk ${SZ(.28 * rs, .3 * rs)}, ${ctr(0, .85 * rs)}.`, `Select all four → ${M("Path ▸ Union")}: one tree.`);
      skills.add("Union");
    }
    if (sym === "atom") {
      const rings = [0, 60, 120].map(a => `<path d="${ellPath(CX, sy, rs, rs * .38)} ${ellPath(CX, sy, rs * .86, rs * .25)}" fill-rule="evenodd" transform="rotate(${a} ${CX} ${r1(sy)})"/>`);
      symSvg = `<g fill="${sc}">${rings.join("")}<circle cx="${CX}" cy="${r1(sy)}" r="${r1(rs * .18)}"/></g>`;
      L4.push(`${T("ellipse")} An ellipse ${SZ(2 * rs, .76 * rs)}, ${fillRow(sc)}, and a smaller one ${SZ(1.72 * rs, .5 * rs)}. ${ctr(0, 0)} for both → ${M("Path ▸ Difference")}: an orbit ring.`,
        `${M("Edit ▸ Duplicate")}, ${M("Object ▸ Transform…")} → <i>Rotate</i> <b>60°</b> → Apply. Duplicate again → Apply again.`,
        `${T("ellipse")} A nucleus ${SZ(.36 * rs, .36 * rs)}, ${ctr(0, 0)}. Select all → ${M("Path ▸ Union")}: one atom.`);
      skills.add("Difference"); skills.add("Union"); skills.add("Transform (rotate)");
    }
    if (sym === "crown") {
      const base = [CX - .8 * rs, sy + .1 * rs, CX + .8 * rs, sy + .6 * rs];
      const tips = [-.55, 0, .55].map(k => tri(CX + k * rs, sy - .2 * rs, .6 * rs, .85 * rs));
      const holes = [-.5, 0, .5].map(k => [CX + k * rs, sy + .35 * rs]), cid = id("m");
      symSvg = `<mask id="${cid}"><rect width="${W}" height="${H}" fill="#fff"/>${holes.map(([x, y]) => `<circle cx="${r1(x)}" cy="${r1(y)}" r="${r1(rs * .11)}" fill="#000"/>`).join("")}</mask><g mask="url(#${cid})" fill="${sc}">${rect(base[0], base[1], base[2] - base[0], base[3] - base[1], sc)}${tips.map(t => `<polygon points="${P(t)}"/>`).join("")}</g>`;
      symB = [base[0], sy - .63 * rs, base[2], base[3]];
      L4.push(`${T("rect")} Crown base ${SZ(1.6 * rs, .5 * rs)}, ${fillRow(sc)}, ${ctr(0, .35 * rs)}.`,
        `${T("star")} Polygon mode, Corners 3: a triangle ${SZ(.6 * rs, .85 * rs)}, ${ctr(-.55 * rs, -.2 * rs)}. Duplicate → ${MOVE(.55 * rs, 0)}; duplicate → ${MOVE(.55 * rs, 0)}. Select base + 3 triangles → ${M("Path ▸ Union")}.`,
        `${T("ellipse")} Three small circles ${SZ(.22 * rs, .22 * rs)} in a row on the band (same trick: centre, then Move). Union them → crown + circles → ${M("Path ▸ Difference")}: jewel holes.`);
      skills.add("Union"); skills.add("Difference");
    }
    if (sym === "crescent") {
      const c1 = [CX - .15 * rs, sy, .78 * rs], c2 = [CX + .12 * rs, sy - .08 * rs, .65 * rs], st = starPts(CX + .5 * rs, sy, .3 * rs, .4, 5), cid = id("m");
      symSvg = `<mask id="${cid}"><rect width="${W}" height="${H}" fill="#fff"/><circle cx="${r1(c2[0])}" cy="${r1(c2[1])}" r="${r1(c2[2])}" fill="#000"/></mask><circle mask="url(#${cid})" cx="${r1(c1[0])}" cy="${r1(c1[1])}" r="${r1(c1[2])}" fill="${sc}"/><polygon points="${P(st)}" fill="${sc}"/>`;
      L4.push(`${T("ellipse")} A circle ${SZ(1.56 * rs, 1.56 * rs)}, ${fillRow(sc)}, ${ctr(-.15 * rs, 0)}.`,
        `A second circle ${SZ(1.3 * rs, 1.3 * rs)}, ${ctr(.12 * rs, -.08 * rs)}. Select both → ${M("Path ▸ Difference")}: a crescent.`,
        `${T("star")} A small star (5 corners, Spoke ratio 0.4) ${SZ(bb(st)[2] - bb(st)[0], bb(st)[3] - bb(st)[1])}, ${ctr(.5 * rs, 0)}. Crescent + star → ${M("Path ▸ Union")}.`);
      skills.add("Difference"); skills.add("Union");
    }
    if (sym === "star") {
      const p = starPts(CX, sy + rs * .05, rs, .4, 5), q = starPts(CX, sy + rs * .05, rs * .55, .4, 5), cid = id("m");
      symSvg = `<mask id="${cid}"><rect width="${W}" height="${H}" fill="#fff"/><polygon points="${P(q)}" fill="#000"/></mask><polygon mask="url(#${cid})" points="${P(p)}" fill="${sc}"/>`; symB = bb(p);
      L4.push(`${T("star")} Star mode, Corners <b>5</b>, Spoke ratio <b>0.4</b>: ${SZ(bb(p)[2] - bb(p)[0], bb(p)[3] - bb(p)[1])}, ${fillRow(sc)}, ${ctr(0, 0)}.`,
        `${M("Edit ▸ Duplicate")}, type ${SZ(bb(q)[2] - bb(q)[0], bb(q)[3] - bb(q)[1])}, ${ctr(0, 0)} again. Select both → ${M("Path ▸ Difference")}: a star outline.`);
      skills.add("Difference");
    }
    add(4, symSvg, symB);
    steps[4] = { title: "Your national symbol", lead: `Your nation is proud of <b>${PRIDE[A.pride].label.toLowerCase()}</b>: the symbol is <b>${SYM_NAME[sym]}</b>.`, list: L4,
      stuck: ["Typing W and H moved the shape: that's normal – centre it again afterwards.", "The cut went wrong: the shape to cut out must be on top (Object ▸ Raise to Top)."] };
    why.push(`<b>${PRIDE[A.pride].label}</b> → ${SYM_NAME[sym]}`);

    /* ---------- STEP 5: provinces ---------- */
    const L5 = [], starPos = [];
    const sR = layout === "canton" ? (N > 6 ? 4 : 5) : 5;
    if (layout === "canton") {
      const rows = N > 5 ? 2 : 1, perRow = Math.ceil(N / rows);
      for (let i = 0; i < N; i++) { const rr = Math.floor(i / perRow), cc = i % perRow, inRow = Math.min(perRow, N - rr * perRow); starPos.push([48 + (cc - (inRow - 1) / 2) * 16, 36 + (rr - (rows - 1) / 2) * 20]); }
    } else {
      const gap = Math.min(16, 200 / Math.max(1, N));
      for (let i = 0; i < N; i++) starPos.push([CX + (i - (N - 1) / 2) * gap, 141]);
    }
    const starBgs = layout === "canton" ? [f0] : uniq(starPos.map(([x, y]) => colorAt(x, y)));
    const starCol = bestMulti(starBgs, cands, pal);
    const starOutl = worstC(starCol, starBgs) < 1.8 ? best(starCol, [WHITE, BLACK, ...pal], pal) : null;
    starPos.forEach(([x, y]) => add(5, `<polygon points="${P(starPts(x, y, sR, .4, 5))}" fill="${starCol}"${starOutl ? ` stroke="${starOutl}" stroke-width=".7" stroke-linejoin="round"` : ""}/>`, bb(starPts(x, y, sR, .4, 5))));
    const s1 = bb(starPts(0, 0, sR, .4, 5));
    L5.push(`${T("star")} Star mode, Corners 5, Spoke ratio 0.4: one star ${SZ(s1[2] - s1[0], s1[3] - s1[1])}, ${fillRow(starCol)}.` + (starOutl ? ` Outline: <i>Stroke paint</i> RGBA ${C(starOutl)}, width <b>0.7 mm</b>.` : ""));
    if (N > 1) L5.push(`${M("Edit ▸ Duplicate")} it ${N - 1}× and drag the copies into ${layout === "canton" ? (N > 5 ? "two rows inside the canton" : "a row inside the canton") : "a row under the emblem"}, like in the picture.`,
      `Select all ${N} stars → ${M("Object ▸ Align and Distribute…")} ${AL("dh")}: equal gaps.` + (layout === "canton" ? "" : ` Then ${M("Object ▸ Group")} and ${AL("cv")}.`));
    else L5.push(layout === "canton" ? `Drag it into the middle of the canton.` : `${AL("cv")}, then drag it straight down under the emblem.`);
    steps[5] = { title: N === 1 ? "One province, one star" : `${N} provinces, ${N} stars`, lead: layout === "canton" ? "Your provinces shine in the canton." : "Your provinces line up under the emblem.", list: L5,
      stuck: ["All copies sit on top of each other: Duplicate puts the copy exactly on the original – just drag it away.",
        "Distribute did nothing: it needs at least 3 objects selected (for 2 stars, drag them by eye)."] };
    why.push(`<b>${N} province${N > 1 ? "s" : ""}</b> → ${N} star${N > 1 ? "s" : ""}`);

    /* ---------- STEP 6: name ---------- */
    const L6 = []; const dx = {};
    if (arcName) {
      const R0 = (army >= 3 ? r * 1.45 : army === 2 ? r + 9 : army === 0 ? r * 1.3 : r * 1.32) + 6;
      const em = emWidth(NAME, FONT_B, 900) + .05 * NAME.length;
      let Rn = Math.min(Math.max(R0, 7 * em / (Math.PI * .9)), CX - 9, CY - 12);
      let fs = Math.min(13, Math.PI * Rn * .9 / em);
      if (CY - Rn - fs * .85 < 3) { Rn = CY - 3 - fs * .85; fs = Math.min(fs, Math.PI * Rn * .9 / em); }
      const nBgs = uniq(Array.from({ length: 13 }, (_, i) => { const a = Math.PI * (1 + i / 12); return colorAt(CX + (Rn + fs * .35) * Math.cos(a), CY + (Rn + fs * .35) * Math.sin(a)); }));
      const nameCol = bestMulti(nBgs, cands, pal), nOut = worstC(nameCol, nBgs) < 2.5 ? best(nameCol, [WHITE, BLACK, ...pal], pal) : null;
      const pid = id("arc");
      add(6, `<path id="${pid}" d="M${r1(CX - Rn)} ${CY} A${r1(Rn)} ${r1(Rn)} 0 0 1 ${r1(CX + Rn)} ${CY}" fill="none"/><text font-family="${FONT_B}" font-weight="900" font-size="${r1(fs)}" fill="${nameCol}" letter-spacing="${r1(fs * .05)}"${nOut ? ` stroke="${nOut}" stroke-width="1.1" paint-order="stroke" stroke-linejoin="round"` : ""}><textPath href="#${pid}" startOffset="50%" text-anchor="middle">${esc(NAME)}</textPath></text>`, [CX - Rn - fs, CY - Rn - fs, CX + Rn + fs, CY]);
      L6.push(`${T("ellipse")} A helper circle ${SZ(2 * Rn, 2 * Rn)} around the emblem, ${M("Object ▸ Align and Distribute…")} ${CENTRE}.`,
        `${M("Path ▸ Object to Path")}, then ${M("Object ▸ Rotate 90° CW")} <b>twice</b> – now the path starts on the left.`,
        `${T("text")} Click outside the banner, type <b>${esc(NAME)}</b>. Bold font, size about <b>${pt(fs)}</b>, ${fillRow(nameCol)}.` + (nOut ? ` Outline: <i>Stroke paint</i> RGBA ${C(nOut)}, width <b>1 mm</b>.` : ""),
        `${T("selector")} Select the circle AND the text → ${M("Text ▸ Put on Path")}. Click the circle, give it no fill and no stroke (<b>X</b> in both tabs).`);
      skills.add("Put on Path"); skills.add("Object to Path");
      steps[6] = { title: "The name, in an arc", lead: "Your state's name curves over the emblem, like on a medal.", list: L6,
        note: "The text starts at 9 o'clock. Change the size until it ends on the right side; type spaces in front of the name to centre it.",
        stuck: ["The text runs upside down along the bottom: the circle wasn't rotated. Undo, rotate twice, try again.", "The text stops halfway: make the size smaller."] };
      Object.assign(dx, { nameCol, nBgs, nOut, fs });
    } else {
      const avail = layout === "canton" ? 160 : 270, nx = layout === "canton" ? 213 : CX;
      const em = emWidth(NAME, FONT_B, 900), fs = Math.min(15, avail / em), top = army <= 1 ? CY - r * 1.32 : army >= 3 ? CY - r * 1.45 : CY - r - 9;
      const ny = Math.max(fs * .8 + 6, top - 7), tw = em * fs;
      const nBgs = uniq(Array.from({ length: 9 }, (_, i) => colorAt(nx - tw / 2 + tw * i / 8, ny - fs * .35)));
      const nameCol = bestMulti(nBgs, cands, pal), nOut = worstC(nameCol, nBgs) < 2.5 ? best(nameCol, [WHITE, BLACK, ...pal], pal) : null;
      add(6, `<text x="${nx}" y="${r1(ny)}" text-anchor="middle" font-family="${FONT_B}" font-weight="900" font-size="${r1(fs)}" fill="${nameCol}"${nOut ? ` stroke="${nOut}" stroke-width="1.1" paint-order="stroke" stroke-linejoin="round"` : ""}>${esc(NAME)}</text>`, [nx - tw / 2, ny - fs * .8, nx + tw / 2, ny]);
      L6.push(`${T("text")} Click above the emblem, type <b>${esc(NAME)}</b>. Bold font, size about <b>${pt(fs)}</b>, ${fillRow(nameCol)}.` + (nOut ? ` Outline: <i>Stroke paint</i> RGBA ${C(nOut)}, width <b>1 mm</b>.` : ""),
        layout === "canton" ? `${T("selector")} Drag it into the space right of the canton, above the emblem.` : `${T("selector")} ${M("Object ▸ Align and Distribute…")} ${AL("cv")}, then drag it straight up above the emblem.`);
      steps[6] = { title: "The name", lead: "Your state's name, plain and clear across the top.", list: L6, stuck: ["Too wide: make the size smaller or pick a narrower bold font."] };
      Object.assign(dx, { nameCol, nBgs, nOut, fs });
    }
    why.push(arcName ? `<b>${SLIDERS.rule.opts[rule]}</b> → the name in an arc` : `<b>${SLIDERS.rule.opts[rule]}</b> → the name straight across the top`);

    /* ---------- STEP 7: motto + frame ---------- */
    const L7 = [];
    if (bandMotto) {
      const underBand = uniq(Array.from({ length: 28 }, (_, i) => 42 + i * 8).flatMap(x => [152, 160, 168].map(y => colorAt(x, y))));
      const bandCol = bestMulti(underBand, [...pal, BLACK, WHITE], pal);
      const backing = worstC(bandCol, underBand) < 2 ? best(bandCol, [WHITE, ...pal, BLACK], pal, [bandCol]) : null;
      const fs = Math.min(13, 205 / emWidth(MOTTO_U, FONT_B, 900)), cid = id("m");
      add(7, `<mask id="${cid}"><rect width="${W}" height="${H}" fill="#fff"/><text x="${CX}" y="${r1(160 + fs * .36)}" text-anchor="middle" font-family="${FONT_B}" font-weight="900" font-size="${r1(fs)}" fill="#000">${esc(MOTTO_U)}</text></mask>${backing ? rect(40, 148, 220, 24, backing) : ""}<rect mask="url(#${cid})" x="40" y="148" width="220" height="24" fill="${bandCol}"/>`, [40, 148, 260, 172]);
      if (backing) L7.push(`${T("rect")} A backing strip ${SZ(220, 24)}, ${fillRow(backing)} – it will shine through the letters.`);
      L7.push(`${T("rect")} The motto band ${SZ(220, 24)}, ${fillRow(bandCol)}. ${M("Object ▸ Align and Distribute…")} ${AL("cv", "bottom")}, then ${MOVE(0, -8)}.` + (backing ? " Do the same with the backing strip first." : ""),
        `${T("text")} Type your motto <b>${esc(MOTTO_U)}</b>, bold, size about <b>${pt(fs)}</b>. ${AL("cv")}, then drag it onto the band.`,
        `Check the spelling! ${M("Path ▸ Object to Path")} on the text. Select band + text → ${M("Path ▸ Difference")}: the letters are cut out.`);
      skills.add("Object to Path"); skills.add("Difference");
      Object.assign(dx, { bandCol, underBand, backing });
    } else {
      const ribCol = bestMulti(uniq([52, 100, 150, 200, 248].map(x => colorAt(x, 157))), [WHITE, ...pal, BLACK], pal);
      const txtCol = best(ribCol, cands, pal, [ribCol]);
      const fs = Math.min(10, 186 / emWidth(MOTTO, FONT_R, 700));
      add(7, `<g fill="${ribCol}">${rect(60, 146, 180, 22, ribCol)}<circle cx="60" cy="157" r="11"/><circle cx="240" cy="157" r="11"/></g><text x="${CX}" y="${r1(157 + fs * .36)}" text-anchor="middle" font-family="${FONT_R}" font-weight="700" font-size="${r1(fs)}" fill="${txtCol}">${esc(MOTTO)}</text>`, [49, 146, 251, 168]);
      L7.push(`${T("rect")} A rectangle ${SZ(180, 22)} and ${T("ellipse")} two circles ${SZ(22, 22)}, all ${fillRow(ribCol)}. Drag a circle onto each end of the rectangle.`,
        `Select the three → ${M("Path ▸ Union")}: a ribbon. ${M("Object ▸ Align and Distribute…")} ${AL("cv", "bottom")}, then ${MOVE(0, -12)}.`,
        `${T("text")} Type your motto <b>${esc(MOTTO)}</b> beside the banner, size about <b>${pt(fs)}</b>, ${fillRow(txtCol)}.`,
        `Select ribbon + text → ${M("Text ▸ Flow into Frame")}. ${T("text")} Click into the text and press the <i>centre</i> button.`);
      skills.add("Union"); skills.add("Flow into Frame");
      Object.assign(dx, { ribCol, txtCol });
    }
    const ew = [6, 5, 4, 3, 2][rule];
    const edgeCol = bestMulti(uniq([colorAt(2, 2), colorAt(298, 90), colorAt(150, 178)]), rule <= 2 ? [...pal, BLACK] : [WHITE, ...pal], pal);
    add(7, `<rect x="${ew / 2}" y="${ew / 2}" width="${W - ew}" height="${H - ew}" fill="none" stroke="${edgeCol}" stroke-width="${ew}"/>`, [0, 0, W, H]);
    L7.push(`${T("rect")} Last, the frame: a rectangle, <i>Fill</i> → X, <i>Stroke paint</i> RGBA ${C(edgeCol)}, width <b>${ew} mm</b>. Type ${SZ(W, H)} (the size includes the stroke), then ${CENTRE}.`);
    skills.add("Fill and stroke");
    steps[7] = { title: bandMotto ? "Motto band and frame" : "Motto ribbon and frame", lead: `Your answers wrote your motto: <b>“${esc(MOTTO)}”</b>.`, list: L7,
      stuck: bandMotto ? ["The band vanished instead of the letters: the text must be on top (Object ▸ Raise to Top).", "Difference greyed out: convert the text first – Path ▸ Object to Path."]
        : ["The text sticks out: smaller size.", "Flow into Frame does nothing: exactly 2 objects – the ribbon and the text."] };
    why.push(`<b>${TAKEOVER[A.takeover].label}</b> → the motto “${esc(MOTTO)}”`);

    const dbg = Object.assign({ bgRing, frameCol, innerCol, symBg, symCol, extraCol, starCol, starBgs, starOutl, frameOutl, starPos, sR }, dx);
    return { items, steps, why, skills: [...skills], layout, pal, name: NAME, motto: MOTTO, N, sym, arcName, bandMotto, dbg, econ, army, rule };
  }

  let G = 0;
  function svg(model, upto = 7, highlight = 0, cls = "") {
    const pfx = "g" + (++G) + "_";
    const parts = model.items.filter(i => i.step <= upto).map(i => i.svg).join("").replace(/(id="|url\(#|href="#)([a-z]+\d+)/g, (m0, a, b) => a + pfx + b);
    let hl = "";
    if (highlight) {
      const bs = model.items.filter(i => i.step === highlight).map(i => i.b);
      if (bs.length) {
        const b = [Math.min(...bs.map(q => q[0])), Math.min(...bs.map(q => q[1])), Math.max(...bs.map(q => q[2])), Math.max(...bs.map(q => q[3]))];
        const rr = `x="${r1(b[0] - 2)}" y="${r1(b[1] - 2)}" width="${r1(b[2] - b[0] + 4)}" height="${r1(b[3] - b[1] + 4)}" fill="none" stroke-width="1.2" stroke-dasharray="4 3"`;
        hl = `<rect ${rr} stroke="#1d2622"/><rect ${rr} stroke="#fff" stroke-dashoffset="3.5"/>`;
      }
    }
    return `<svg class="banner ${cls}" viewBox="-6 -6 312 192" role="img" aria-label="Banner of ${esc(model.name)}${upto < 7 ? ", after step " + upto : ""}"><rect x="-6" y="-6" width="312" height="192" fill="#e9e7dd"/>${parts}${hl}</svg>`;
  }
  const MYSTERY = `<svg class="banner" viewBox="-6 -6 312 192" role="img" aria-label="Hidden banner"><rect x="-6" y="-6" width="312" height="192" fill="#e9e7dd"/><rect width="300" height="180" fill="#3a3f3c"/><path d="M0 0L300 180M300 0L0 180" stroke="#4a504c" stroke-width="2"/><text x="150" y="118" text-anchor="middle" font-family="${FONT_B}" font-weight="900" font-size="96" fill="#efeee6" opacity=".85">?</text></svg>`;
  window.COUP_BUILD = build; window.COUP_SVG = svg; window.COUP_COUNTRIES = COUNTRIES; window.COUP_CONTRAST = contrast; window.COUP_MOTTO = motto;

  /* ------------------------------------------------------------------ state */
  const DEF = { country: "", palette: [], main: "", name: "", rule: 2, econ: 2, army: 2, trad: 2, pride: "", provinces: 3, takeover: "", custom: ["#6A4C93", "#F2D264", "#1982C4"], touched: {} };
  const fresh = () => JSON.parse(JSON.stringify(DEF));
  function clean(raw) {
    const d = fresh(), a = raw && typeof raw === "object" ? raw : {};
    const str = (v, def) => typeof v === "string" ? v : def;
    const num = (v, lo, hi, def) => { v = +v; return Number.isFinite(v) ? Math.min(hi, Math.max(lo, Math.round(v))) : def; };
    const hexes = v => Array.isArray(v) ? v.filter(c => typeof c === "string" && /^#[0-9a-f]{6}$/i.test(c)).map(c => c.toUpperCase()).slice(0, 6) : [];
    const custom = hexes(a.custom);
    return { country: str(a.country, ""), palette: hexes(a.palette), main: str(a.main, ""), name: str(a.name, "").slice(0, 26),
      rule: num(a.rule, 0, 4, 2), econ: num(a.econ, 0, 4, 2), army: num(a.army, 0, 4, 2), trad: num(a.trad, 0, 4, 2),
      pride: PRIDE[a.pride] ? a.pride : "", provinces: num(a.provinces, 1, 9, 3), takeover: TAKEOVER[a.takeover] ? a.takeover : "",
      custom: custom.length === 3 ? custom : d.custom, touched: a.touched && typeof a.touched === "object" ? a.touched : {} };
  }
  let S = { answers: fresh(), q: 0, revealed: false, solved: [], checks: [], end: false };
  try {
    const s = JSON.parse(localStorage.getItem(KEY));
    if (s && typeof s === "object") {
      const nums = v => Array.isArray(v) ? v.map(Number).filter(n => Number.isInteger(n) && n >= 0 && n <= 8) : [];
      S = { answers: clean(s.answers), q: Math.max(0, Math.min(9, +s.q || 0)), revealed: !!s.revealed, solved: nums(s.solved).filter(n => n >= 1 && n <= 7), checks: nums(s.checks), end: !!s.end };
    }
  } catch (e) {}
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) {} };
  const A = () => S.answers;

  /* ------------------------------------------------------------------ questions */
  const swatchOpts = a => a.palette.map(c => `<label class="swl"><input type="radio" name="main" value="${c}" ${close(c, a.main || a.palette[0]) ? "checked" : ""}><span style="--c:${c}" title="${c}"></span></label>`).join("");
  const sliderQ = k => ({
    id: k, title: SLIDERS[k].q, valid: a => !!a.touched[k],
    html: a => `<div class="slide5"><div class="ends"><span>${SLIDERS[k].ends[0]}</span><span>${SLIDERS[k].ends[1]}</span></div>
      <input type="range" min="0" max="4" step="1" value="${a[k]}" data-k="${k}" aria-label="${SLIDERS[k].q}">
      <div class="ticks">${SLIDERS[k].opts.map((o, i) => `<button type="button" class="tick${a[k] === i && a.touched[k] ? " on" : ""}" data-k="${k}" data-v="${i}">${o}</button>`).join("")}</div>
      <p class="pick" aria-live="polite">${a.touched[k] ? `<b>${SLIDERS[k].opts[a[k]]}</b> – ${SLIDERS[k].hints[a[k]]}` : "Move the slider or click an option."}</p></div>`
  });
  const QUESTIONS = [
    { id: "country", title: "Which country did you take over?", sub: "Its flag colours become your palette.", valid: a => a.palette.length > 0 && !!a.country,
      html: a => { const known = COUNTRIES.find(c => c.n === a.country); return `<select id="q-country"><option value="">– choose a country –</option>${COUNTRIES.map(c => `<option${c.n === a.country ? " selected" : ""}>${esc(c.n)}</option>`).join("")}<option value="__other"${a.country && !known ? " selected" : ""}>Other country – I'll enter the flag colours</option></select>
        <div class="custom" id="custom"${a.country && !known ? "" : " hidden"}><span>Flag colours:</span>${[0, 1, 2].map(i => `<input type="color" data-ci="${i}" value="${a.custom[i].toLowerCase()}" aria-label="Flag colour ${i + 1}">`).join("")}<input type="text" id="q-cname" maxlength="30" placeholder="country name" value="${known ? "" : esc(a.country === "__other" ? "" : a.country)}"></div>
        ${a.palette.length ? `<div class="palette-show">${a.palette.map(c => `<span style="--c:${c}"></span>`).join("")}</div>` : ""}`; } },
    { id: "main", title: "Which colour is your movement's colour?", sub: "It will lead your banner.", valid: a => !!a.main, html: a => `<div class="swatches big">${swatchOpts(a)}</div>` },
    { id: "name", title: "What is your new state called?", sub: "Keep it short and loud.", valid: a => a.name.trim().length > 0,
      html: a => `<input type="text" id="q-name" maxlength="26" placeholder="e.g. Iron Federation" value="${esc(a.name)}"><p class="qh">Ideas: ${["Republic of Nova", "Iron Federation", "United Provinces", "People's Union", "Grand Duchy", "Free State"].map(n => `<button type="button" class="idea" data-v="${esc(n)}">${esc(n)}</button>`).join(" ")}</p>` },
    sliderQ("rule"), sliderQ("econ"), sliderQ("army"), sliderQ("trad"),
    { id: "pride", title: "What is your nation proud of?", valid: a => !!a.pride,
      html: a => `<div class="prides">${Object.entries(PRIDE).map(([k, p]) => `<label><input type="radio" name="pride" value="${k}" ${a.pride === k ? "checked" : ""}><span><i aria-hidden="true">${p.icon}</i>${p.label}</span></label>`).join("")}</div>` },
    { id: "provinces", title: "How many provinces does your country have?", valid: a => !!a.touched.provinces,
      html: a => `<div class="slide5"><div class="ends"><span>1</span><span>9</span></div><input type="range" min="1" max="9" step="1" value="${a.provinces}" data-k="provinces" aria-label="Provinces"><p class="pick big" aria-live="polite">${a.touched.provinces ? `<b>${a.provinces}</b> province${a.provinces > 1 ? "s" : ""}` : "Move the slider."}</p></div>` },
    { id: "takeover", title: "How did you take power?", sub: "History will remember.", valid: a => !!a.takeover,
      html: a => `<div class="cards2 four">${Object.entries(TAKEOVER).map(([k, t]) => `<label><input type="radio" name="takeover" value="${k}" ${a.takeover === k ? "checked" : ""}><span><i aria-hidden="true">${t.icon}</i><b>${t.label}</b></span></label>`).join("")}</div>` }
  ];
  const allValid = () => QUESTIONS.every(q => q.valid(A()));

  /* ------------------------------------------------------------------ page */
  const tape = `<span class="tape l" aria-hidden="true"></span><span class="tape r" aria-hidden="true"></span>`;
  const STEP_TITLES = ["The field", "Behind the emblem", "The emblem frame", "Your national symbol", "Provinces", "The name", "Motto and frame"];
  const head = (h, p, c) => `<div class="sec-head"${c ? ` style="--c:${c}"` : ""}><h2>${h}</h2><p>${p}</p><svg viewBox="0 0 200 12" aria-hidden="true"><path d="M3 8 C 50 2, 100 12, 150 5 S 190 5, 197 7"/></svg></div>`;
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
        <p class="story">03:00. The palace is quiet, the old government has left by helicopter, and the TV station is yours. You are a morally grey general with a brand-new country – and no banner. Answer the questions of your command tent one by one: when the last one is answered, your banner is revealed.</p>
        <p class="disclaimer">A design game: the coup is pure fiction, no real government is harmed by your SVG file.</p>
        <div class="meter" aria-live="polite"><div class="row"><span>Your progress</span><b id="count"></b></div><span class="bar" id="bar">${STEP_TITLES.map(() => "<i></i>").join("")}</span></div>
        <div class="actions"><a class="btn chalk" href="#tent">To the command tent ▸</a><button class="btn ghost" type="button" id="print">🖨 Print my plan</button></div>
      </div>
      <figure class="poster flag-poster"><div id="hero-flag"></div><figcaption id="hero-cap"></figcaption></figure>
    </section>
    <section class="sec" id="tent">${head("The command tent", "One question at a time. No peeking – the banner appears at the end.")}<div id="wizard"></div></section>
    <div id="work"></div>
  </main>
  <footer class="tray"><div class="wrap"><span class="sticks" aria-hidden="true"><i></i><i></i><i></i></span>
    <span>Teachers: <a href="../pdf/coup-teacher.pdf" download>teacher notes (PDF)</a></span>
    <button class="reset" type="button" id="reset">Start over</button></div></footer>`;

  /* ------------------------------------------------------------------ wizard */
  function renderWizard(focus) {
    const box = $("#wizard");
    if (S.revealed) { renderReveal(); return; }
    const q = QUESTIONS[S.q], a = A(), last = S.q === QUESTIONS.length - 1, ok = q.valid(a);
    box.innerHTML = `<article class="sheet qcard" style="--tilt:-.2deg">${tape}
      <div class="qtop"><span class="qcount">Question ${S.q + 1} of ${QUESTIONS.length}</span>
        <span class="qdots" aria-hidden="true">${QUESTIONS.map((x, i) => `<i class="${i < S.q ? "done" : i === S.q ? "cur" : ""}"></i>`).join("")}</span></div>
      <h3 class="qtitle" tabindex="-1">${q.title}</h3>${q.sub ? `<p class="lead">${q.sub}</p>` : ""}
      <div class="qbody">${q.html(a)}</div>
      <div class="qnav"><button type="button" class="btn back" id="back" ${S.q === 0 ? "disabled" : ""}>◂ Back</button>
        <button type="button" class="btn next" id="next" ${ok ? "" : "disabled"}>${last ? "Reveal my banner ▸" : "Next ▸"}</button></div>
    </article>`;
    wire();
    if (focus) { const t = box.querySelector(".qtitle"); if (t) t.focus({ preventScroll: true }); }
  }
  function refreshNav() {
    const q = QUESTIONS[S.q]; const n = $("#next"); if (n) n.disabled = !q.valid(A());
  }
  function setPalette() {
    const a = A(), c = COUNTRIES.find(x => x.n === a.country);
    a.palette = c ? c.c.slice() : (a.country ? a.custom.map(x => x.toUpperCase()) : []);
    if (!a.palette.some(p => close(p, a.main || ""))) a.main = a.palette[0] || "";
  }
  function wire() {
    const box = $("#wizard"), a = A();
    box.querySelector("#back").addEventListener("click", () => { if (S.q > 0) { S.q--; save(); renderWizard(true); } });
    box.querySelector("#next").addEventListener("click", next);
    const sel = box.querySelector("#q-country");
    if (sel) {
      sel.addEventListener("change", () => {
        if (sel.value === "__other") a.country = (box.querySelector("#q-cname").value || "").trim() || "__other";
        else a.country = sel.value;
        setPalette(); save(); renderWizard();
      });
      box.querySelectorAll("[data-ci]").forEach(i => i.addEventListener("input", () => { a.custom[+i.dataset.ci] = i.value.toUpperCase(); setPalette(); save(); const ps = box.querySelector(".palette-show"); if (ps) ps.innerHTML = a.palette.map(c => `<span style="--c:${c}"></span>`).join(""); refreshNav(); }));
      const cn = box.querySelector("#q-cname");
      if (cn) cn.addEventListener("input", () => { a.country = cn.value.trim() || "__other"; save(); refreshNav(); });
    }
    box.querySelectorAll("input[name=main]").forEach(i => i.addEventListener("change", () => { a.main = i.value; save(); refreshNav(); }));
    const nm = box.querySelector("#q-name");
    if (nm) {
      nm.addEventListener("input", () => { a.name = nm.value; save(); refreshNav(); });
      nm.addEventListener("keydown", e => { if (e.key === "Enter") { e.preventDefault(); next(); } });
      box.querySelectorAll(".idea").forEach(b => b.addEventListener("click", () => { a.name = b.dataset.v; nm.value = b.dataset.v; save(); refreshNav(); }));
    }
    const sliderText = k => {          /* update ticks + caption in place, so dragging is never interrupted */
      box.querySelectorAll(`.tick[data-k="${k}"]`).forEach(t => t.classList.toggle("on", +t.dataset.v === a[k]));
      const pk = box.querySelector(".pick");
      if (pk) pk.innerHTML = SLIDERS[k] ? `<b>${SLIDERS[k].opts[a[k]]}</b> – ${SLIDERS[k].hints[a[k]]}` : `<b>${a[k]}</b> province${a[k] > 1 ? "s" : ""}`;
    };
    box.querySelectorAll("input[type=range]").forEach(rg => rg.addEventListener("input", () => {
      const k = rg.dataset.k; a[k] = +rg.value; a.touched[k] = true; save(); sliderText(k); refreshNav();
    }));
    box.querySelectorAll(".tick").forEach(b => b.addEventListener("click", () => {
      const k = b.dataset.k; a[k] = +b.dataset.v; a.touched[k] = true; save();
      const rg = box.querySelector(`input[type=range][data-k="${k}"]`); if (rg) rg.value = a[k];
      sliderText(k); refreshNav();
    }));
    box.querySelectorAll("input[name=pride], input[name=takeover]").forEach(i => i.addEventListener("change", () => { a[i.name] = i.value; save(); refreshNav(); }));
  }
  function next() {
    if (!QUESTIONS[S.q].valid(A())) return;
    if (S.q < QUESTIONS.length - 1) { S.q++; save(); renderWizard(true); return; }
    if (!allValid()) { S.q = QUESTIONS.findIndex(q => !q.valid(A())); save(); renderWizard(true); return; }
    S.revealed = true; S.solved = []; S.checks = []; S.end = false; save();
    renderReveal(true); renderWork(); hero();
  }

  /* ------------------------------------------------------------------ reveal */
  function renderReveal(animate) {
    const m = build(A());
    $("#wizard").innerHTML = `<article class="sheet reveal${animate ? " anim" : ""}" style="--tilt:.2deg">${tape}
      <p class="drum">${animate ? "The people gather in the square…" : "Your banner"}</p>
      <div class="reveal-flag">${svg(m)}</div>
      <h3 class="rname">${esc(m.name)}</h3>
      <p class="rmotto">“${esc(m.motto)}”</p>
      <ul class="why">${m.why.map(w => `<li>${w}</li>`).join("")}</ul>
      <div class="qnav"><button type="button" class="btn back" id="again">↺ Answer again</button><a class="btn next" href="#start">Build it in Inkscape ↓</a></div>
    </article>`;
    $("#again").addEventListener("click", () => {
      if (S.solved.length && !confirm("Answer again? Your banner and steps will change, and your ticks will be cleared.")) return;
      S.revealed = false; S.q = 0; S.solved = []; S.checks = []; S.end = false; save();
      renderWizard(true); renderWork(); hero(); $("#tent").scrollIntoView({ block: "start" });
    });
  }
  function hero() {
    if (S.revealed) { const m = build(A()); $("#hero-flag").innerHTML = svg(m); $("#hero-cap").textContent = `The banner of ${m.name}`; }
    else { $("#hero-flag").innerHTML = MYSTERY; $("#hero-cap").textContent = "Answer every question to reveal it"; }
  }

  /* ------------------------------------------------------------------ guided steps */
  function renderWork() {
    const box = $("#work");
    if (!S.revealed) { box.innerHTML = ""; paint(); return; }
    const m = build(A());
    const tilt = i => ["-.3deg", ".25deg", "-.15deg", ".35deg"][i % 4];
    const fileName = "surname_" + m.name.toLowerCase().replace(/[^a-z0-9]+/g, "").slice(0, 16);
    box.innerHTML = `
    <section class="sec">${head("Skills on your banner", "Everything from this year – your banner uses these:")}<ul class="badges">${m.skills.map(s => `<li>${s}</li>`).join("")}</ul></section>
    <section class="sec" id="start">${head("Before you start", "No keyboard shortcuts: every command is in a menu or on a toolbar.")}
      <article class="sheet" style="--tilt:-.2deg">${tape}<h3>Four tricks you will use all the time</h3>
        <ol class="do">
          <li>${M("File ▸ New")}, ${M("File ▸ Save As…")} <code>${fileName}.svg</code>.</li>
          <li><b>Sizes:</b> with the ${T("selector")} Selector, type <b>W</b> and <b>H</b> in the tool controls bar (mm, lock open, Enter after each).</li>
          <li><b>Colours:</b> ${M("Object ▸ Fill and Stroke…")} → <i>Fill</i> → flat colour → type the code in <b>RGBA</b>, e.g. ${C(m.pal[0])}.</li>
          <li><b>Placing:</b> ${M("Object ▸ Align and Distribute…")} with <i>Relative to: <b>Page</b></i>. ${CENTRE} puts the selected shape in the middle of the banner. To shift it exactly: ${M("Object ▸ Transform…")} → <i>Move</i>, tick <i>Relative move</i> (+ = right/down, − = left/up).</li>
        </ol>
        <p class="note">Your palette: ${m.pal.map(c => C(c)).join(" ")} ${C(WHITE)} ${C(BLACK)}. Several objects: click, ${K("Shift")} + click. Difference: the top object is cut out.</p>
      </article></section>
    <section class="sec">${head("The steps", "Each picture shows your banner after the step; the dashed box marks what is new.", "var(--accent)")}
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
    <section class="sec" id="save">${head("Save and hand in", "The SVG shows how you built it; the PNG is the picture.")}
      <article class="sheet" style="--tilt:.2deg">${tape}
        <ol class="do"><li>${M("File ▸ Save")} – <code>${fileName}.svg</code></li><li>${M("File ▸ Export…")} → <b>Page</b> → <code>${fileName}.png</code> → Export.</li></ol>
        <h3 style="margin-top:14px">Checklist</h3>
        <ul class="check">${checklist(m).map((c, i) => `<li><label><input type="checkbox" data-c="${i}"><span>${c}</span></label></li>`).join("")}</ul>
      </article>
      <div class="finish" id="finish" role="status"><h2>Long live ${esc(m.name)}!</h2><p>Hand in your two files, then try a bonus below.</p></div>
    </section>
    <section class="sec" id="bonus">${head("Bonus – rule harder", "Same tools, more propaganda. Pick any.")}
      <article class="sheet" style="--tilt:-.2deg">${tape}<ul class="bonus">
        <li><b>A coin</b><span>Two circles → ${M("Path ▸ Difference")} for the rim, your symbol in the middle, the name with ${M("Text ▸ Put on Path")}.</span></li>
        <li><b>A banknote</b><span>Rectangle with a cog-ring border (Star tool, many corners, minus a rectangle), your symbol, the value in big bold text.</span></li>
        <li><b>Flag on a pole</b><span>${M("Edit ▸ Select All")}, ${M("Object ▸ Group")}; a thin rectangle pole + a circle on top → ${M("Path ▸ Union")}.</span></li>
        <li><b>The general's medal</b><span>An 8-corner star minus a circle (${M("Path ▸ Difference")}) + a ribbon: rectangle → ${M("Path ▸ Object to Path")} → ${T("node")} pull the bottom corners into a V.</span></li>
      </ul></article></section>`;
    box.querySelectorAll(".done-btn").forEach(b => b.addEventListener("click", () => {
      const n = +b.dataset.n;
      S.solved = S.solved.includes(n) ? S.solved.filter(x => x !== n) : [...S.solved, n].sort((x, y) => x - y);
      update();
      if (S.solved.includes(n)) { const nx = [1, 2, 3, 4, 5, 6, 7].find(k => !S.solved.includes(k)); const t = nx ? document.getElementById("step-" + nx) : $("#save"); if (t && nx !== n) setTimeout(() => t.scrollIntoView({ block: "start" }), 250); }
    }));
    box.querySelectorAll(".check input").forEach(c => c.addEventListener("change", () => { const k = +c.dataset.c; S.checks = c.checked ? [...new Set([...S.checks, k])] : S.checks.filter(x => x !== k); update(); }));
    const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) document.querySelectorAll(".dots a").forEach(a => a.classList.toggle("cur", a.dataset.n === e.target.dataset.n)); }), { rootMargin: "-40% 0px -55% 0px" });
    box.querySelectorAll(".step").forEach(el => io.observe(el));
    paint();
  }
  function checklist(m) {
    return [`The field: ${LAYOUT_NAME[m.layout]}, exact colours, page resized to the banner`, `Behind the emblem: ${BEHIND_NAME[m.army]}`, `The emblem frame: ${FRAME_NAME[m.econ]}`,
      `The symbol: ${SYM_NAME[m.sym]}`, `${m.N} star${m.N > 1 ? "s" : ""} with equal gaps`, `The name ${esc(m.name)}${m.arcName ? " in an arc (Put on Path)" : " centred at the top"}`,
      `The motto “${esc(m.motto)}” ${m.bandMotto ? "cut out of the band" : "flowed into the ribbon"}, and the frame`, "Both SVG and PNG saved, with your surname in the file name"];
  }

  /* ------------------------------------------------------------------ progress */
  function paint() {
    document.querySelectorAll(".step").forEach(el => {
      const n = +el.dataset.n, d = S.solved.includes(n); el.classList.toggle("is-done", d);
      const b = el.querySelector(".done-btn"); b.setAttribute("aria-pressed", String(d)); b.querySelector(".box").textContent = d ? "✓" : ""; b.querySelector(".t").textContent = d ? "Done" : "I did this step";
    });
    document.querySelectorAll(".dots a").forEach(a => a.classList.toggle("done", S.solved.includes(+a.dataset.n)));
    document.querySelectorAll("#bar i").forEach((i, k) => i.classList.toggle("on", S.solved.includes(k + 1)));
    $("#count").textContent = `${S.solved.length} / 7 steps`;
    document.querySelectorAll(".check input").forEach(c => { c.checked = S.checks.includes(+c.dataset.c); });
    const was = S.end; S.end = S.revealed && S.solved.length >= 7 && S.checks.length >= 8;
    const f = $("#finish"); if (f) f.classList.toggle("show", S.end);
    return !was && S.end;
  }
  function confetti() {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const box = document.createElement("div"); box.className = "confetti"; const cols = build(A()).pal.concat(["#efeee6"]);
    for (let i = 0; i < 90; i++) { const p = document.createElement("i"); p.style.left = Math.random() * 100 + "vw"; p.style.background = cols[i % cols.length]; p.style.animationDuration = 1.8 + Math.random() * 1.8 + "s"; p.style.animationDelay = Math.random() * .5 + "s"; box.appendChild(p); }
    document.body.appendChild(box); setTimeout(() => box.remove(), 4200);
  }
  function update() { const j = paint(); save(); if (j) confetti(); }
  $("#reset").addEventListener("click", () => {
    if (!confirm("Start over? Your answers and ticks will be cleared.")) return;
    S = { answers: fresh(), q: 0, revealed: false, solved: [], checks: [], end: false }; save();
    renderWizard(); renderWork(); hero(); window.scrollTo({ top: 0 });
  });
  $("#print").addEventListener("click", () => window.print());

  if (S.revealed && !allValid()) S.revealed = false;
  renderWizard(); renderWork(); hero();
})();
