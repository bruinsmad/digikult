/* Puccs! – the Inkscape final project (v2), Hungarian edition (generated from coup.js by make_coup_hu.py).
   One question at a time; the banner stays hidden until every question is answered. The answers deterministically produce
   a banner – layout, colours, frame, background emblem, symbol, stars, name, generated motto – and the guided Inkscape steps
   for exactly that banner. Only the background gets exact numbers; afterwards the page is resized to the banner, and every
   other shape is centred with Align and Distribute (relative to Page), shifted with Transform ▸ Move, or dragged by eye.
   Saved under KEY as {answers, q, revealed, solved:[1..7], checks:[…], end}. The landing page reads "solved" (7 chapters). */
(function () {
  "use strict";
  const KEY = "coup-hu-v1";
  const W = 300, H = 180, CX = 150, CY = 90;
  const $ = s => document.querySelector(s);
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

  /* ------------------------------------------------------------------ data */
    const COUNTRIES = [
    ["Albánia", "#E41E20 #000000"], ["Argentína", "#74ACDF #FFFFFF #F6B40E"], ["Örményország", "#D90012 #0033A0 #F2A800"],
    ["Ausztrália", "#012169 #FFFFFF #E4002B"], ["Ausztria", "#C8102E #FFFFFF"], ["Banglades", "#006A4E #F42A41"],
    ["Belgium", "#000000 #FDDA24 #EF3340"], ["Bhután", "#FFD520 #FF4E12 #FFFFFF"], ["Bolívia", "#D52B1E #F9E300 #007934"],
    ["Brazília", "#009C3B #FFDF00 #002776 #FFFFFF"], ["Bulgária", "#FFFFFF #00966E #D62612"], ["Kamerun", "#007A5E #CE1126 #FCD116"],
    ["Kanada", "#FF0000 #FFFFFF"], ["Chile", "#0039A6 #FFFFFF #D52B1E"], ["Kína", "#EE1C25 #FFFF00"],
    ["Kolumbia", "#FCD116 #003893 #CE1126"], ["Horvátország", "#FF0000 #FFFFFF #171796"], ["Kuba", "#002A8F #FFFFFF #CF142B"],
    ["Csehország", "#FFFFFF #D7141A #11457E"], ["Dánia", "#C8102E #FFFFFF"], ["Ecuador", "#FFDD00 #034EA2 #ED1C24"],
    ["Egyiptom", "#CE1126 #FFFFFF #000000 #C09300"], ["Észtország", "#0072CE #000000 #FFFFFF"], ["Etiópia", "#078930 #FCDD09 #DA121A #0F47AF"],
    ["Finnország", "#FFFFFF #002F6C"], ["Franciaország", "#002395 #FFFFFF #ED2939"], ["Grúzia", "#FFFFFF #FF0000"],
    ["Németország", "#000000 #DD0000 #FFCE00"], ["Ghána", "#CE1126 #FCD116 #006B3F #000000"], ["Görögország", "#0D5EAF #FFFFFF"],
    ["Magyarország", "#CE2939 #FFFFFF #477050"], ["Izland", "#02529C #FFFFFF #DC1E35"], ["India", "#FF9933 #FFFFFF #138808 #000080"],
    ["Indonézia", "#FF0000 #FFFFFF"], ["Írország", "#169B62 #FFFFFF #FF883E"], ["Olaszország", "#009246 #FFFFFF #CE2B37"],
    ["Jamaica", "#009B3A #FED100 #000000"], ["Japán", "#FFFFFF #BC002D"], ["Kazahsztán", "#00AFCA #FEC50C"],
    ["Kenya", "#000000 #BB0000 #006600 #FFFFFF"], ["Lettország", "#9E3039 #FFFFFF"], ["Litvánia", "#FDB913 #006A44 #C1272D"],
    ["Luxemburg", "#EF3340 #FFFFFF #00A3E0"], ["Madagaszkár", "#FFFFFF #FC3D32 #007E3A"], ["Malajzia", "#CC0001 #FFFFFF #010066 #FFCC00"],
    ["Málta", "#FFFFFF #CF142B"], ["Mexikó", "#006847 #FFFFFF #CE1126"], ["Monaco", "#CE1126 #FFFFFF"],
    ["Mongólia", "#C4272F #015197 #F9CF02"], ["Marokkó", "#C1272D #006233"], ["Nepál", "#DC143C #003893 #FFFFFF"],
    ["Hollandia", "#AE1C28 #FFFFFF #21468B"], ["Új-Zéland", "#00247D #FFFFFF #CC142B"], ["Nigéria", "#008751 #FFFFFF"],
    ["Norvégia", "#BA0C2F #FFFFFF #00205B"], ["Pakisztán", "#01411C #FFFFFF"], ["Panama", "#FFFFFF #DA121A #072357"],
    ["Peru", "#D91023 #FFFFFF"], ["Fülöp-szigetek", "#0038A8 #CE1126 #FFFFFF #FCD116"], ["Lengyelország", "#FFFFFF #DC143C"],
    ["Portugália", "#006600 #FF0000 #FFFF00"], ["Katar", "#8A1538 #FFFFFF"], ["Románia", "#002B7F #FCD116 #CE1126"],
    ["Szenegál", "#00853F #FDEF42 #E31B23"], ["Szerbia", "#C6363C #0C4076 #FFFFFF"], ["Seychelle-szigetek", "#003F87 #FCD856 #D62828 #007A3D"],
    ["Szlovákia", "#FFFFFF #0B4EA2 #EE1C25"], ["Szlovénia", "#FFFFFF #005DA4 #ED1C24"], ["Dél-afrikai Köztársaság", "#007749 #FFB81C #DE3831 #002395"],
    ["Dél-Korea", "#FFFFFF #CD2E3A #0047A0 #000000"], ["Spanyolország", "#AA151B #F1BF00"], ["Svédország", "#006AA7 #FECC00"],
    ["Svájc", "#DA291C #FFFFFF"], ["Tanzánia", "#1EB53A #FCD116 #000000 #00A3DD"], ["Thaiföld", "#A51931 #F4F5F8 #2D2A4A"],
    ["Tunézia", "#E70013 #FFFFFF"], ["Törökország", "#E30A17 #FFFFFF"], ["Uganda", "#000000 #FCDC04 #D90000"],
    ["Egyesült Királyság", "#012169 #FFFFFF #C8102E"], ["Egyesült Államok", "#B22234 #FFFFFF #3C3B6E"], ["Uruguay", "#FFFFFF #0038A8 #FCD116"],
    ["Venezuela", "#FFCC00 #00247D #CF142B"], ["Vietnám", "#DA251D #FFFF00"], ["Zambia", "#198A00 #EF7D00 #DE2010 #000000"]
  ].map(([n, c]) => ({ n, c: c.split(" ") })).sort((a, b) => a.n.localeCompare(b.n, "hu"));

  const PRIDE = {
    industry: { label: "Ipar", icon: "⚙️", sym: "gear", word: "Acél" },
    farming: { label: "Mezőgazdaság", icon: "🌾", sym: "sun", word: "Kenyér" },
    sea: { label: "A tenger", icon: "🌊", sym: "waves", word: "Só" },
    mountains: { label: "Hegyek", icon: "⛰️", sym: "mountains", word: "Kő" },
    forests: { label: "Erdők", icon: "🌲", sym: "tree", word: "Fa" },
    science: { label: "Tudomány", icon: "⚛️", sym: "atom", word: "Tudomány" },
    kings: { label: "Régi királyok, történelem", icon: "👑", sym: "crown", word: "Dicsőség" },
    night: { label: "Az éjszakai égbolt", icon: "🌙", sym: "crescent", word: "Csillagfény" },
    freedom: { label: "Szabadság", icon: "⭐", sym: "star", word: "Remény" }
  };
  const SYM_NAME = { gear: "fogaskerék", sun: "felkelő nap", waves: "hullámos korong", mountains: "hegyek kerek ablakban", tree: "fenyőfa",
    atom: "atom", crown: "drágaköves korona", crescent: "holdsarló csillaggal", star: "csillagkörvonal" };
  const TAKEOVER = {
    palace: { label: "Csendes éjszakai palotapuccs", icon: "🌙" },
    uprising: { label: "Népfelkelés", icon: "✊" },
    parade: { label: "Tankok a reggeli díszszemlén", icon: "🎖️" },
    lottery: { label: "Megnyertél egy elcsalt sorsolást", icon: "🎟️" }
  };
  const SLIDERS = {
    rule: { q: "Hogyan fogsz kormányozni?", ends: ["Vasököl", "Szabad választás"], opts: ["Vas­ököl", "Szi­go­rú", "Mér­sé­kelt", "Nyi­tott", "Sza­bad vá­lasz­tás"],
      hints: ["Egy vezér, egy hang, napi díszszemle.", "A szabály az szabály. Főleg a tiéd.", "Egy tanács – te elnökölsz benne.", "Parlament, amely néha nemet mond.", "Valódi választások. Akár veszíthetsz is."] },
    econ: { q: "Merre hajlik a gazdaságod?", ends: ["Bal", "Jobb"], opts: ["Szél­ső­bal", "Bal", "Közép", "Jobb", "Szél­ső­jobb"],
      hints: ["Minden gyár az államé.", "A munkások az elsők, erős közszolgáltatások.", "Egy kicsit mindenből.", "A vállalkozás az első, alacsony adók.", "Mindenről a piac dönt."] },
    army: { q: "Mennyire épül a hatalmad a hadseregre?", ends: ["Béke", "Hadsereg"], opts: ["Pa­ci­fis­ta", "Bé­kés", "Éber", "Erős", "Ka­to­nai ál­lam"],
      hints: ["A katonák mostantól fát ültetnek.", "Kis hadsereg a díszszemlékhez.", "Készenlétben, de csendben.", "Tankok minden ünnepségen.", "A hadsereg MAGA az állam."] },
    trad: { q: "Hagyomány vagy haladás?", ends: ["Hagyomány", "Haladás"], opts: ["A régi utak", "Ha­gyo­má­nyos", "Kö­zép­út", "Mo­dern", "A jövő az el­ső"],
      hints: ["Ahogy nagyapa csinálta.", "Lassan változz, ha egyáltalán.", "Ami jó, marad, a többi változik.", "Az új ötletek jöhetnek.", "Robotok, rakéták, holnap."] }
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
  const TOOL_HU = { rect: "Téglalap", selector: "Kijelölő", ellipse: "Ellipszis", star: "Csillag és sokszög", text: "Szöveg", node: "Csomópont" };
  const T = t => `<img class="ti" src="../img/common/tools/${t}.png" alt="${TOOL_HU[t] || t} eszköz" title="${TOOL_HU[t] || t} eszköz">`;
  const M = t => `<span class="menu">${t}</span>`;
  const K = t => `<span class="key">${t}</span>`;
  const C = h => `<span class="sw" style="--c:${h}"></span><code class="hex">${hex6(h)}ff</code>`;
  const SZ = (w, h) => `<span class="nums">Sz ${mm(w)}, M ${mm(h)}</span>`;
  const ALN = { left: "Bal élek igazítása", cv: "Középre igazítás a függőleges tengelyhez", right: "Jobb élek igazítása", top: "Felső élek igazítása", ch: "Középre igazítás a vízszintes tengelyhez", bottom: "Alsó élek igazítása", dh: "Vízszintes elrendezés egyenletes térközökkel a középpontok között" };
  const ALI = { left: "al-left", cv: "al-cv", right: "al-right", top: "al-top", ch: "al-ch", bottom: "al-bottom", dh: "di-ch" };
  const AL = (...k) => `<span class="align">${k.map(x => `<img class="ai" src="../img/common/tools/${ALI[x]}.png" alt="${ALN[x]}" title="${ALN[x]}">`).join("")}<i>${k.map(x => ALN[x]).join(" + ")}</i></span>`;
  const CENTRE = AL("cv", "ch");
  const MOVE = (dx, dy) => {
    const parts = [];
    if (Math.round(dx)) parts.push(`Vízszintes <b>${Math.round(dx) > 0 ? "+" : "−"}${Math.abs(Math.round(dx))}</b> (${dx > 0 ? "jobbra" : "balra"})`);
    if (Math.round(dy)) parts.push(`Függőleges <b>${Math.round(dy) > 0 ? "+" : "−"}${Math.abs(Math.round(dy))}</b> (${dy > 0 ? "le" : "fel"})`);
    return parts.length ? `${M("Objektum ▸ Transzformáció…")} → <i>Áthelyezés</i>, <i>Relatív áthelyezés</i> bekapcsolva: ${parts.join(", ")} → Alkalmazás` : "";
  };
  const fillRow = h => `kitöltés RGBA ${C(h)}`;
  const pt = v => Math.round(v / 0.3528);

  /* ------------------------------------------------------------------ the generator */
  const LAYOUTS = [                         /* [rule][trad] */
    ["border", "chevron", "triangle", "cross", "diagonal"],
    ["border", "triangle", "chevron", "diagonal", "bi-h"],
    ["cross", "tri-h", "wave", "tri-v", "diagonal"],
    ["canton", "tri-h", "wave", "tri-v", "bi-h"],
    ["canton", "tri-v", "wave", "tri-h", "diagonal"]
  ];
  const LAYOUT_NAME = { "tri-h": "vízszintes trikolór", "tri-v": "függőleges trikolór", "bi-h": "kétsávos zászló", cross: "középkereszt",
    triangle: "rúd melletti háromszög", diagonal: "átlós sáv", canton: "kanton (sarokmező)", border: "szegélyes mező", chevron: "ék (chevron)", wave: "hullám" };
  const FRAME_NAME = ["fogaskerék-gyűrű", "gyűrű", "körvonalas korong", "kerek pajzs", "csúcsos pajzs"];
  const BEHIND_NAME = ["napsugár", "szélrózsa", "glória", "keresztbe tett rudak", "keresztbe tett pengék"];

  function motto(a) {
    const A = ["Engedelmesség", "Rend", "Egység", "Szabadság", "Demokrácia"][a.rule];
    const Cw = ["Hagyomány", "Becsület", "Egyensúly", "Haladás", "Jövő"][a.trad];
    const D = ["Béke", "Nyugalom", "Éberség", "Erő", "Győzelem"][a.army];
    const E = ["a Munkásoknak", "a Népnek", "Mindenkinek", "a Vállalkozásnak", "a Piacnak"][a.econ];
    const B = (PRIDE[a.pride] || PRIDE.freedom).word;
    return { palace: `${A}, ${B}, ${D}`, uprising: `${B} ${E}`, parade: `${A} által ${D}`, lottery: `${Cw} és ${B}` }[a.takeover] || `${A} és ${B}`;
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
    const NAME = A.name.trim().toUpperCase().slice(0, 26) || "KÖZTÁRSASÁG";
    const MOTTO = motto(A), MOTTO_U = MOTTO.toUpperCase();
    const arcName = rule <= 1 || (rule === 2 && army >= 3);
    const bandMotto = rule <= 2;
    const r = layout === "border" ? 36 : 34;

    const items = [], steps = {}, why = [], skills = new Set(["Pontos színek (RGBA)", "Igazítás és elrendezés", "Szöveg eszköz"]);
    const add = (step, svg, b) => items.push({ step, svg, b });
    const rect = (x, y, w, h, c, extra = "") => `<rect x="${r1(x)}" y="${r1(y)}" width="${r1(w)}" height="${r1(h)}" fill="${c}"${extra}/>`;
    const BG = c => `${T("rect")} Rajzolj egy téglalapot, ${T("selector")} írd be: ${SZ(W, H)} (a lakat nyitva), ${fillRow(c)}, <i>Körvonalrajzolat</i> → <b>X</b>. Aztán ${M("Szerkesztés ▸ Oldal átméretezése a kijelöléshez")} – az oldal most pontosan a zászlód.`;

    /* ---------- STEP 1: field ---------- */
    let colorAt = () => f0; const L1 = [];
    if (layout === "tri-h" || layout === "canton") {
      const top = layout === "canton" ? f1 : f0, mid = layout === "canton" ? f2 : f1, bot = layout === "canton" ? f1 : f2;
      add(1, rect(0, 0, W, H, mid), [0, 0, W, H]); add(1, rect(0, 0, W, 60, top) + rect(0, 120, W, 60, bot), [0, 0, W, H]);
      L1.push(BG(mid), `${T("rect")} Felső sáv ${SZ(W, 60)}, ${fillRow(top)}, aztán ${M("Objektum ▸ Igazítás és elrendezés…")} ${AL("cv", "top")}.`,
        `${M("Szerkesztés ▸ Kettőzés")}, ${fillRow(bot)}, aztán ${AL("cv", "bottom")}.`);
      colorAt = (x, y) => y < 60 ? top : y < 120 ? mid : bot;
      if (layout === "canton") {
        add(1, rect(0, 0, 96, 72, f0), [0, 0, 96, 72]); const prev = colorAt;
        L1.push(`${T("rect")} A kanton ${SZ(96, 72)}, ${fillRow(f0)}, ${AL("left", "top")}. Ide kerülnek majd a tartományaid csillagai.`);
        colorAt = (x, y) => x < 96 && y < 72 ? f0 : prev(x, y);
      }
    }
    if (layout === "tri-v") {
      add(1, rect(0, 0, W, H, f1), [0, 0, W, H]); add(1, rect(0, 0, 100, H, f0) + rect(200, 0, 100, H, f2), [0, 0, W, H]);
      L1.push(BG(f1), `${T("rect")} Bal sáv ${SZ(100, H)}, ${fillRow(f0)}, ${M("Objektum ▸ Igazítás és elrendezés…")} ${AL("left", "ch")}.`,
        `${M("Szerkesztés ▸ Kettőzés")}, ${fillRow(f2)}, ${AL("right", "ch")}.`);
      colorAt = x => x < 100 ? f0 : x < 200 ? f1 : f2;
    }
    if (layout === "bi-h") {
      add(1, rect(0, 0, W, H, f1), [0, 0, W, H]); add(1, rect(0, 0, W, 90, f0), [0, 0, W, 90]);
      L1.push(BG(f1), `${T("rect")} Felső fél ${SZ(W, 90)}, ${fillRow(f0)}, ${M("Objektum ▸ Igazítás és elrendezés…")} ${AL("cv", "top")}.`);
      colorAt = (x, y) => y < 90 ? f0 : f1;
    }
    if (layout === "cross") {
      add(1, rect(0, 0, W, H, f1), [0, 0, W, H]);
      add(1, `<path d="M0 72H300V108H0Z M132 0H168V180H132Z" fill="${f0}"/>`, [0, 0, W, H]);
      L1.push(BG(f1), `${T("rect")} Két rúd: ${SZ(W, 36)} és ${SZ(36, H)}, mindkettő ${fillRow(f0)}. Jelöld ki egyenként, és ${M("Objektum ▸ Igazítás és elrendezés…")} ${CENTRE}.`,
        `${T("selector")} Kattints az egyik rúdra, ${K("Shift")} + kattintás a másikra → ${M("Útvonal ▸ Unió")}: egy kereszt.`);
      colorAt = (x, y) => (y > 72 && y < 108) || (x > 132 && x < 168) ? f0 : f1;
      skills.add("Unió");
    }
    if (layout === "triangle") {
      const t = triR(0, CY, 100, H);
      add(1, rect(0, 0, W, H, f2), [0, 0, W, H]); add(1, rect(0, 0, W, 90, f1), [0, 0, W, 90]); add(1, `<polygon points="${P(t)}" fill="${f0}"/>`, [0, 0, 100, H]);
      L1.push(BG(f2), `${T("rect")} Felső fél ${SZ(W, 90)}, ${fillRow(f1)}, ${M("Objektum ▸ Igazítás és elrendezés…")} ${AL("cv", "top")}.`,
        `${T("star")} Csillag eszköz, <b>Sokszög</b> mód, Csúcsok: <b>3</b>: rajzolj egy háromszöget. ${M("Objektum ▸ Elforgatás 90°-kal ↻ irányban")} – jobbra mutat.`,
        `${T("selector")} Írd be: ${SZ(100, H)}, ${fillRow(f0)}, ${AL("left", "ch")}.`);
      colorAt = (x, y) => inPoly(x, y, t) ? f0 : y < 90 ? f1 : f2;
      skills.add("Elforgatás 90°-kal");
    }
    if (layout === "diagonal") {
      const band = [[-40, -21], [340, -21], [340, 21], [-40, 21]].map(q => rotPt([q[0] + CX - 150, q[1] + CY], -31, CX, CY));
      const cid = id("c");
      add(1, rect(0, 0, W, H, f1), [0, 0, W, H]);
      add(1, `<clipPath id="${cid}"><rect width="${W}" height="${H}"/></clipPath><polygon clip-path="url(#${cid})" points="${P(band)}" fill="${f0}"/>`, [0, 0, W, H]);
      L1.push(BG(f1), `${T("rect")} Hosszú sáv ${SZ(380, 42)}, ${fillRow(f0)}.`,
        `${M("Objektum ▸ Transzformáció…")} → <i>Forgatás</i>: <b>31°</b> az óramutatóval ellentétesen → Alkalmazás. Aztán ${M("Objektum ▸ Igazítás és elrendezés…")} ${CENTRE}.`,
        `A sáv kilóg a zászlóból. Kattints a háttérre, ${M("Szerkesztés ▸ Kettőzés")}, ${M("Objektum ▸ Felülre helyezés")}; ${K("Shift")} + kattintás a sávra → ${M("Útvonal ▸ Metszet")}: csak a zászlón belüli rész marad.`);
      colorAt = (x, y) => inPoly(x, y, band) ? f0 : f1;
      skills.add("Transzformáció (forgatás)"); skills.add("Metszet");
    }
    if (layout === "border") {
      add(1, rect(0, 0, W, H, f0), [0, 0, W, H]); add(1, rect(14, 14, 272, 152, f1), [14, 14, 286, 166]);
      L1.push(BG(f0), `${T("rect")} Belső mező ${SZ(272, 152)}, ${fillRow(f1)}, ${M("Objektum ▸ Igazítás és elrendezés…")} ${CENTRE} – körben megjelenik a szegély.`);
      colorAt = (x, y) => x < 14 || y < 14 || x > 286 || y > 166 ? f0 : f1;
    }
    if (layout === "chevron") {
      const outer = triR(0, CY, 150, H), inner = triR(0, CY, 100, 120), cid = id("m");
      add(1, rect(0, 0, W, H, f1), [0, 0, W, H]);
      add(1, `<mask id="${cid}"><rect width="${W}" height="${H}" fill="#fff"/><polygon points="${P(inner)}" fill="#000"/></mask><polygon mask="url(#${cid})" points="${P(outer)}" fill="${f0}"/>`, [0, 0, 150, H]);
      L1.push(BG(f1), `${T("star")} Csillag eszköz, <b>Sokszög</b> mód, Csúcsok: <b>3</b>: háromszög, ${M("Objektum ▸ Elforgatás 90°-kal ↻ irányban")}, írd be: ${SZ(150, H)}, ${fillRow(f0)}, ${M("Objektum ▸ Igazítás és elrendezés…")} ${AL("left", "ch")}.`,
        `${M("Szerkesztés ▸ Kettőzés")}, írd be: ${SZ(100, 120)}, újra ${AL("left", "ch")} – egy kisebb háromszög felül.`,
        `${T("selector")} Jelöld ki mindkettőt → ${M("Útvonal ▸ Különbség")}: ék (oldalára fektetett V).`);
      colorAt = (x, y) => inPoly(x, y, outer) && !inPoly(x, y, inner) ? f0 : f1;
      skills.add("Különbség"); skills.add("Elforgatás 90°-kal");
    }
    if (layout === "wave") {
      const xs = [32, 91, 150, 209, 268];
      add(1, rect(0, 0, W, H, f0), [0, 0, W, H]);
      add(1, `<g fill="${f1}">${rect(0, 90, W, 90, f1)}${xs.map(x => `<ellipse cx="${x}" cy="90" rx="32" ry="13"/>`).join("")}</g>`, [0, 77, W, H]);
      L1.push(BG(f0), `${T("rect")} Alsó fél ${SZ(W, 90)}, ${fillRow(f1)}, ${M("Objektum ▸ Igazítás és elrendezés…")} ${AL("cv", "bottom")}.`,
        `${T("ellipse")} Egy ellipszis ${SZ(64, 26)}, ugyanilyen színnel. ${M("Szerkesztés ▸ Kettőzés")} négyszer, és húzd az 5 ellipszist az alsó fél felső széle mentén sorba.`,
        `Jelöld ki az 5 ellipszist → ${AL("dh")}. Aztán vedd hozzá a kijelöléshez az alsó felet → ${M("Útvonal ▸ Unió")}: hullámos szél.`);
      colorAt = (x, y) => (y > 90 || xs.some(cx => ((x - cx) / 32) ** 2 + ((y - 90) / 13) ** 2 < 1)) ? f1 : f0;
      skills.add("Unió");
    }
    steps[1] = { title: "Az alapmező", lead: `A zászlód: <b>${LAYOUT_NAME[layout]}</b>. Csak a háttér kap pontos számokat – utána az oldal lesz a zászló, és minden mást ehhez igazítasz.`, list: L1,
      stuck: ["Az igazítógombok nem csinálnak semmit: nézd meg, hogy az Igazítás és elrendezés panel tetején <i>Relatív ehhez: Oldal</i> van-e, és hogy átméretezted-e az oldalt a zászlóra.",
        "Szürkék a méretmezők: előbb jelöld ki az alakzatot a Kijelölővel. Minden szám után nyomj Entert."] };
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
      L2.push(`${T("star")} Csillag eszköz, <b>Csillag</b> mód, Csúcsok: <b>24</b>, Ágarány: <b>0.45</b>: húzz ki egy csillagot. Írd be: ${SZ(bb(p)[2] - bb(p)[0], bb(p)[3] - bb(p)[1])}, ${fillRow(ec)}.`,
        `${M("Objektum ▸ Igazítás és elrendezés…")} ${CENTRE}.`);
    }
    if (army === 1) {
      const p = starPts(CX, CY, r * 1.32, .32, 8), c = r * .62, cid = id("g");
      add(2, `<g fill="${ec}"><polygon points="${P(p)}"/><circle cx="${CX}" cy="${CY}" r="${r1(c)}"/></g>`, bb(p));
      L2.push(`${T("star")} Csillag eszköz, <b>Csillag</b> mód, Csúcsok: <b>8</b>, Ágarány: <b>0.32</b>. Írd be: ${SZ(bb(p)[2] - bb(p)[0], bb(p)[3] - bb(p)[1])}, ${fillRow(ec)}.`,
        `${T("ellipse")} Egy kör ${SZ(2 * c, 2 * c)}, ugyanilyen színnel. Mindkettőt középre: ${CENTRE}.`, `Jelöld ki mindkettőt → ${M("Útvonal ▸ Unió")}: szélrózsa.`);
      skills.add("Unió");
    }
    if (army === 2) {
      const R1 = r + 9, R2 = r + 5, cid = id("m");
      add(2, `<mask id="${cid}"><rect width="${W}" height="${H}" fill="#fff"/><circle cx="${CX}" cy="${CY}" r="${R2}" fill="#000"/></mask><circle mask="url(#${cid})" cx="${CX}" cy="${CY}" r="${R1}" fill="${ec}"/>`, cb(CX, CY, R1));
      L2.push(`${T("ellipse")} Egy kör ${SZ(2 * R1, 2 * R1)}, ${fillRow(ec)}. Egy második kör ${SZ(2 * R2, 2 * R2)}.`,
        `Mindkettőt középre: ${M("Objektum ▸ Igazítás és elrendezés…")} ${CENTRE}. Jelöld ki mindkettőt → ${M("Útvonal ▸ Különbség")}: vékony glória.`);
      skills.add("Különbség");
    }
    if (army >= 3) {
      const len = army === 3 ? r * 2.9 : r * 2.5, th = army === 3 ? r * .24 : r * .2;
      let shape;
      if (army === 3) shape = [[CX - len / 2, CY - th / 2], [CX + len / 2, CY - th / 2], [CX + len / 2, CY + th / 2], [CX - len / 2, CY + th / 2]];
      else { const tl = r * .42; shape = [[CX - len / 2, CY - th / 2], [CX + len / 2 - tl, CY - th / 2], [CX + len / 2 - tl, CY - th * .95], [CX + len / 2, CY], [CX + len / 2 - tl, CY + th * .95], [CX + len / 2 - tl, CY + th / 2], [CX - len / 2, CY + th / 2]]; }
      const a = shape.map(q => rotPt(q, 45, CX, CY)), b2 = a.map(([x, y]) => [2 * CX - x, y]);
      add(2, `<g fill="${ec}"><polygon points="${P(a)}"/><polygon points="${P(b2)}"/></g>`, bb([...a, ...b2]));
      if (army === 3) L2.push(`${T("rect")} Egy rúd ${SZ(len, th)}, ${fillRow(ec)}.`);
      else L2.push(`${T("rect")} Penge: egy rúd ${SZ(len - r * .42, th)}, ${fillRow(ec)}.`,
        `${T("star")} Sokszög mód, Csúcsok: 3: kis háromszög, ${M("Objektum ▸ Elforgatás 90°-kal ↻ irányban")}, írd be: ${SZ(r * .42, th * 1.9)}. Húzd úgy, hogy érintse a rúd jobb végét → jelöld ki mindkettőt → ${M("Útvonal ▸ Unió")}: penge.`);
      L2.push(`${M("Objektum ▸ Transzformáció…")} → <i>Forgatás</i> <b>45°</b> → Alkalmazás. ${M("Szerkesztés ▸ Kettőzés")}, ${M("Objektum ▸ Vízszintes tükrözés")}: egy X.`,
        `${K("Shift")} + kattintás az elsőre → ${M("Útvonal ▸ Unió")}. ${M("Objektum ▸ Igazítás és elrendezés…")} ${CENTRE}.`);
      skills.add("Unió"); skills.add("Transzformáció (forgatás)");
    }
    steps[2] = { title: "A címer mögött", lead: `A hadsereged szintje miatt a címer mögé <b>${BEHIND_NAME[army]}</b> kerül.`, list: L2,
      stuck: ["Szürke az Unió vagy a Különbség: pontosan a szükséges alakzatok legyenek kijelölve – az állapotsor megszámolja őket.",
        "Ferde az X: a másolatot Vízszintes tükrözéssel fordítsd, ne forgasd újra."] };
    why.push(`<b>${SLIDERS.army.opts[army]}</b> → ${BEHIND_NAME[army]} a címer mögött`);

    /* ---------- STEP 3: frame (economy) ---------- */
    const L3 = []; const fc = frameCol;
    const outl = frameOutl ? ` stroke="${frameOutl}" stroke-width="1.5"` : "";
    let rs = r * .66, sy = CY;
    if (econ <= 1) {
      const ri = r - 8, cid = id("m");
      const outer = econ === 0 ? `<polygon points="${P(starPts(CX, CY, r, .86, 20))}" fill="${fc}" mask="url(#${cid})"${outl}/>` : `<circle cx="${CX}" cy="${CY}" r="${r}" fill="${fc}" mask="url(#${cid})"${outl}/>`;
      add(3, `<mask id="${cid}"><rect width="${W}" height="${H}" fill="#fff"/><circle cx="${CX}" cy="${CY}" r="${ri}" fill="#000"/></mask>${outer}<circle cx="${CX}" cy="${CY}" r="${ri}" fill="${innerCol}"/>`, cb(CX, CY, r));
      if (econ === 0) { const p = starPts(CX, CY, r, .86, 20); L3.push(`${T("star")} Csillag eszköz, <b>Csillag</b> mód, Csúcsok: <b>20</b>, Ágarány: <b>0.86</b>. Írd be: ${SZ(bb(p)[2] - bb(p)[0], bb(p)[3] - bb(p)[1])}, ${fillRow(fc)}.`); }
      else L3.push(`${T("ellipse")} Egy kör ${SZ(2 * r, 2 * r)}, ${fillRow(fc)}.`);
      L3.push(`${T("ellipse")} Egy kisebb kör ${SZ(2 * ri, 2 * ri)}. Mindkettőt középre: ${M("Objektum ▸ Igazítás és elrendezés…")} ${CENTRE}.`,
        `Jelöld ki mindkettőt → ${M("Útvonal ▸ Különbség")}: ${econ === 0 ? "fogaskerék-gyűrű" : "gyűrű"}.`,
        `Töltsd ki a lyukat: még egy kör ${SZ(2 * ri, 2 * ri)}, ${fillRow(innerCol)}, ${CENTRE}.`);
      rs = ri * .86;
      skills.add("Különbség");
    }
    if (econ === 2) {
      add(3, `<circle cx="${CX}" cy="${CY}" r="${r}" fill="${fc}" stroke="${extraCol}" stroke-width="2"/>`, cb(CX, CY, r));
      L3.push(`${T("ellipse")} Egy kör ${SZ(2 * r, 2 * r)}, ${M("Objektum ▸ Igazítás és elrendezés…")} ${CENTRE}.`,
        `${M("Objektum ▸ Kitöltés és körvonal…")} <i>Kitöltés</i> RGBA ${C(fc)}; <i>Körvonalrajzolat</i> RGBA ${C(extraCol)}; <i>Körvonalstílus</i> szélesség <b>2 mm</b>.`);
      rs = (r - 4) * .86; skills.add("Kitöltés és körvonal");
    }
    if (econ === 3) {
      const rc = .8 * r;
      add(3, `<path d="M${r1(CX - rc)} ${r1(CY - r)}H${r1(CX + rc)}V${CY}A${r1(rc)} ${r1(rc)} 0 0 1 ${r1(CX - rc)} ${CY}Z" fill="${fc}"${outl}/>`, [CX - rc, CY - r, CX + rc, CY + rc]);
      L3.push(`${T("rect")} Egy téglalap ${SZ(2 * rc, r)} és ${T("ellipse")} egy kör ${SZ(2 * rc, 2 * rc)}, mindkettő ${fillRow(fc)}.`,
        `Mindkettőt középre: ${M("Objektum ▸ Igazítás és elrendezés…")} ${CENTRE}. Aztán csak a téglalap: ${MOVE(0, -r / 2)}.`,
        `Jelöld ki mindkettőt → ${M("Útvonal ▸ Unió")}: kerek aljú pajzs.`);
      rs = rc * .8; sy = CY - r * .1; skills.add("Unió"); skills.add("Transzformáció (áthelyezés)");
    }
    if (econ === 4) {
      const R = 1.6 * r, d = .8 * r, oy = -.45 * r, cA = id("c"), cB = id("c");
      add(3, `<clipPath id="${cA}"><circle cx="${r1(CX + d)}" cy="${r1(CY + oy)}" r="${r1(R)}"/></clipPath><clipPath id="${cB}"><circle cx="${r1(CX - d)}" cy="${r1(CY + oy)}" r="${r1(R)}"/></clipPath><g clip-path="url(#${cA})"><rect clip-path="url(#${cB})" x="${r1(CX - d)}" y="${r1(CY - .95 * r)}" width="${r1(2 * d)}" height="${r1(1.9 * r)}" fill="${fc}"/></g>${frameOutl ? `<path d="M${r1(CX - d)} ${r1(CY - .95 * r)}H${r1(CX + d)}V${r1(CY + .1 * r)}Q${r1(CX + d * .7)} ${r1(CY + .7 * r)} ${CX} ${r1(CY + .94 * r)}Q${r1(CX - d * .7)} ${r1(CY + .7 * r)} ${r1(CX - d)} ${r1(CY + .1 * r)}Z" fill="none" stroke="${frameOutl}" stroke-width="1.5"/>` : ""}`, [CX - d, CY - .95 * r, CX + d, CY + .94 * r]);
      L3.push(`${T("ellipse")} Egy nagy kör ${SZ(2 * R, 2 * R)}, ${fillRow(fc)}. ${M("Objektum ▸ Igazítás és elrendezés…")} ${CENTRE}, aztán ${MOVE(d, oy)}.`,
        `${M("Szerkesztés ▸ Kettőzés")}, aztán ${MOVE(-2 * d, 0)}. Jelöld ki a két kört → ${M("Útvonal ▸ Metszet")}: hegyes lencse.`,
        `${T("rect")} Egy téglalap ${SZ(2 * d, 1.9 * r)}, ${CENTRE}. Lencse + téglalap kijelölve → újra ${M("Útvonal ▸ Metszet")}: lapos tetejű, csúcsos pajzs.`);
      rs = d * .78; sy = CY - r * .12; skills.add("Metszet"); skills.add("Transzformáció (áthelyezés)");
    }
    if (frameOutl) L3.push(`Beleolvad a mezőbe, ezért kap körvonalat: <i>Körvonalrajzolat</i> RGBA ${C(frameOutl)}, szélesség <b>1.5 mm</b>.`);
    steps[3] = { title: "A címer kerete", lead: `A gazdaságod miatt a címer kerete: <b>${FRAME_NAME[econ]}</b>.`, list: L3,
      stuck: ["A Különbség rossz alakzatot vágott: a kivágandó alakzatnak FELÜL kell lennie. Visszavonás, kattints rá, Objektum ▸ Felülre helyezés.",
        "Rossz irányba ment az áthelyezés: legyen bepipálva a <i>Relatív áthelyezés</i>; + = jobbra/le, − = balra/fel."] };
    why.push(`<b>${SLIDERS.econ.opts[econ]}</b> → ${FRAME_NAME[econ]}`);

    /* ---------- STEP 4: symbol (pride) ---------- */
    const L4 = []; const sc = symCol; let symSvg = "", symB = cb(CX, sy, rs);
    const dy0 = sy - CY;
    const ctr = (dx, dy) => (Math.round(dx) || Math.round(dy + dy0)) ? `${CENTRE}, aztán ${MOVE(dx, dy + dy0)}` : CENTRE;
    if (sym === "gear") {
      const p = starPts(CX, sy, rs, .8, 12), cid = id("m");
      symSvg = `<mask id="${cid}"><rect width="${W}" height="${H}" fill="#fff"/><circle cx="${CX}" cy="${r1(sy)}" r="${r1(rs * .38)}" fill="#000"/></mask><polygon mask="url(#${cid})" points="${P(p)}" fill="${sc}"/>`; symB = bb(p);
      L4.push(`${T("star")} Csillag eszköz, <b>Csillag</b> mód, Csúcsok: <b>12</b>, Ágarány: <b>0.8</b>: ${SZ(bb(p)[2] - bb(p)[0], bb(p)[3] - bb(p)[1])}, ${fillRow(sc)}. ${ctr(0, 0)}.`,
        `${T("ellipse")} Egy kis kör ${SZ(rs * .76, rs * .76)}, ${ctr(0, 0)}. Jelöld ki mindkettőt → ${M("Útvonal ▸ Különbség")}: fogaskerék.`);
      skills.add("Különbség");
    }
    if (sym === "sun") {
      const p = starPts(CX, sy, rs * .95, .55, 16), cid = id("c");
      symSvg = `<clipPath id="${cid}"><rect width="${W}" height="${r1(sy)}"/></clipPath><g clip-path="url(#${cid})" fill="${sc}"><polygon points="${P(p)}"/><circle cx="${CX}" cy="${r1(sy)}" r="${r1(rs * .5)}"/></g>${rect(CX - rs, sy + rs * .1, 2 * rs, rs * .14, sc)}`;
      L4.push(`${T("ellipse")} Egy kör ${SZ(rs, rs)} és ${T("star")} egy csillag (Csillag mód, Csúcsok: <b>16</b>, Ágarány: <b>0.55</b>) ${SZ(bb(p)[2] - bb(p)[0], bb(p)[3] - bb(p)[1])}, mindkettő ${fillRow(sc)}. Mindkettőre ${ctr(0, 0)} → ${M("Útvonal ▸ Unió")}.`,
        `${T("rect")} Egy téglalap ${SZ(2.2 * rs, 1.1 * rs)}, ${ctr(0, .55 * rs)} – letakarja az alsó felet. Nap + téglalap → ${M("Útvonal ▸ Különbség")}: felkel a nap.`,
        `${T("rect")} Vékony horizont ${SZ(2 * rs, .14 * rs)}, ${ctr(0, .17 * rs)}.`);
      skills.add("Unió"); skills.add("Különbség");
    }
    if (sym === "waves") {
      const cid = id("m"), ys = [-.44, 0, .44];
      symSvg = `<mask id="${cid}"><rect width="${W}" height="${H}" fill="#fff"/>${ys.map(k => `<ellipse cx="${CX}" cy="${r1(sy + k * rs)}" rx="${r1(rs * 1.2)}" ry="${r1(rs * .11)}" fill="#000"/>`).join("")}</mask><circle mask="url(#${cid})" cx="${CX}" cy="${r1(sy)}" r="${r1(rs)}" fill="${sc}"/>`;
      L4.push(`${T("ellipse")} Egy kör ${SZ(2 * rs, 2 * rs)}, ${fillRow(sc)}, ${ctr(0, 0)}.`,
        `${T("ellipse")} Egy lapos ellipszis ${SZ(2.4 * rs, .22 * rs)}, ${ctr(0, 0)}. ${M("Szerkesztés ▸ Kettőzés")} → ${MOVE(0, -.44 * rs)}. Újra kettőzés → ${MOVE(0, .88 * rs)}.`,
        `Jelöld ki a 3 ellipszist → ${M("Útvonal ▸ Unió")}. Kör + ellipszisek → ${M("Útvonal ▸ Különbség")}: hullámok.`);
      skills.add("Unió"); skills.add("Különbség");
    }
    if (sym === "mountains") {
      const big = tri(CX - .25 * rs, sy, 1.6 * rs, 1.3 * rs), small = tri(CX + .45 * rs, sy + .225 * rs, 1.1 * rs, .85 * rs), cid = id("c");
      symSvg = `<clipPath id="${cid}"><circle cx="${CX}" cy="${r1(sy)}" r="${r1(rs)}"/></clipPath><g clip-path="url(#${cid})" fill="${sc}"><polygon points="${P(big)}"/><polygon points="${P(small)}"/></g>`;
      L4.push(`${T("star")} Sokszög mód, Csúcsok: <b>3</b>: egy nagy háromszög ${SZ(1.6 * rs, 1.3 * rs)}, ${fillRow(sc)}, ${ctr(-.25 * rs, 0)}.`,
        `Egy kisebb háromszög ${SZ(1.1 * rs, .85 * rs)}, ${ctr(.45 * rs, .225 * rs)}. Jelöld ki mindkettőt → ${M("Útvonal ▸ Unió")}.`,
        `${T("ellipse")} Egy kör ${SZ(2 * rs, 2 * rs)}, ${ctr(0, 0)}. Hegyek + kör → ${M("Útvonal ▸ Metszet")}: hegyek kerek ablakban.`);
      skills.add("Unió"); skills.add("Metszet");
    }
    if (sym === "tree") {
      const parts = [[1.0, .8, -.5], [1.3, .9, -.12], [1.6, 1.0, .3]].map(([w, h, o]) => tri(CX, sy + o * rs, w * rs, h * rs));
      const tr = [CX - .14 * rs, sy + .7 * rs, CX + .14 * rs, sy + 1.0 * rs];
      symSvg = `<g fill="${sc}">${parts.map(t => `<polygon points="${P(t)}"/>`).join("")}${rect(tr[0], tr[1], tr[2] - tr[0], tr[3] - tr[1], sc)}</g>`; symB = [CX - .8 * rs, sy - .9 * rs, CX + .8 * rs, sy + rs];
      L4.push(`${T("star")} Sokszög mód, Csúcsok: <b>3</b>, ${fillRow(sc)}: három háromszög – ${SZ(rs, .8 * rs)} ${ctr(0, -.5 * rs)}; ${SZ(1.3 * rs, .9 * rs)} ${ctr(0, -.12 * rs)}; ${SZ(1.6 * rs, rs)} ${ctr(0, .3 * rs)}.`,
        `${T("rect")} A törzs ${SZ(.28 * rs, .3 * rs)}, ${ctr(0, .85 * rs)}.`, `Jelöld ki mind a négyet → ${M("Útvonal ▸ Unió")}: egy fa.`);
      skills.add("Unió");
    }
    if (sym === "atom") {
      const rings = [0, 60, 120].map(a => `<path d="${ellPath(CX, sy, rs, rs * .38)} ${ellPath(CX, sy, rs * .86, rs * .25)}" fill-rule="evenodd" transform="rotate(${a} ${CX} ${r1(sy)})"/>`);
      symSvg = `<g fill="${sc}">${rings.join("")}<circle cx="${CX}" cy="${r1(sy)}" r="${r1(rs * .18)}"/></g>`;
      L4.push(`${T("ellipse")} Egy ellipszis ${SZ(2 * rs, .76 * rs)}, ${fillRow(sc)}, és egy kisebb ${SZ(1.72 * rs, .5 * rs)}. Mindkettőre ${ctr(0, 0)} → ${M("Útvonal ▸ Különbség")}: pályagyűrű.`,
        `${M("Szerkesztés ▸ Kettőzés")}, ${M("Objektum ▸ Transzformáció…")} → <i>Forgatás</i> <b>60°</b> → Alkalmazás. Újra kettőzés → újra Alkalmazás.`,
        `${T("ellipse")} Atommag ${SZ(.36 * rs, .36 * rs)}, ${ctr(0, 0)}. Jelöld ki mindet → ${M("Útvonal ▸ Unió")}: egy atom.`);
      skills.add("Különbség"); skills.add("Unió"); skills.add("Transzformáció (forgatás)");
    }
    if (sym === "crown") {
      const base = [CX - .8 * rs, sy + .1 * rs, CX + .8 * rs, sy + .6 * rs];
      const tips = [-.55, 0, .55].map(k => tri(CX + k * rs, sy - .2 * rs, .6 * rs, .85 * rs));
      const holes = [-.5, 0, .5].map(k => [CX + k * rs, sy + .35 * rs]), cid = id("m");
      symSvg = `<mask id="${cid}"><rect width="${W}" height="${H}" fill="#fff"/>${holes.map(([x, y]) => `<circle cx="${r1(x)}" cy="${r1(y)}" r="${r1(rs * .11)}" fill="#000"/>`).join("")}</mask><g mask="url(#${cid})" fill="${sc}">${rect(base[0], base[1], base[2] - base[0], base[3] - base[1], sc)}${tips.map(t => `<polygon points="${P(t)}"/>`).join("")}</g>`;
      symB = [base[0], sy - .63 * rs, base[2], base[3]];
      L4.push(`${T("rect")} A korona alja ${SZ(1.6 * rs, .5 * rs)}, ${fillRow(sc)}, ${ctr(0, .35 * rs)}.`,
        `${T("star")} Sokszög mód, Csúcsok: 3: egy háromszög ${SZ(.6 * rs, .85 * rs)}, ${ctr(-.55 * rs, -.2 * rs)}. Kettőzés → ${MOVE(.55 * rs, 0)}; kettőzés → ${MOVE(.55 * rs, 0)}. Az alj + 3 háromszög kijelölve → ${M("Útvonal ▸ Unió")}.`,
        `${T("ellipse")} Három kis kör ${SZ(.22 * rs, .22 * rs)} egy sorban a pántra (ugyanaz a trükk: középre, aztán áthelyezés). Unió → korona + körök → ${M("Útvonal ▸ Különbség")}: lyukak a drágaköveknek.`);
      skills.add("Unió"); skills.add("Különbség");
    }
    if (sym === "crescent") {
      const c1 = [CX - .15 * rs, sy, .78 * rs], c2 = [CX + .12 * rs, sy - .08 * rs, .65 * rs], st = starPts(CX + .5 * rs, sy, .3 * rs, .4, 5), cid = id("m");
      symSvg = `<mask id="${cid}"><rect width="${W}" height="${H}" fill="#fff"/><circle cx="${r1(c2[0])}" cy="${r1(c2[1])}" r="${r1(c2[2])}" fill="#000"/></mask><circle mask="url(#${cid})" cx="${r1(c1[0])}" cy="${r1(c1[1])}" r="${r1(c1[2])}" fill="${sc}"/><polygon points="${P(st)}" fill="${sc}"/>`;
      L4.push(`${T("ellipse")} Egy kör ${SZ(1.56 * rs, 1.56 * rs)}, ${fillRow(sc)}, ${ctr(-.15 * rs, 0)}.`,
        `Egy második kör ${SZ(1.3 * rs, 1.3 * rs)}, ${ctr(.12 * rs, -.08 * rs)}. Jelöld ki mindkettőt → ${M("Útvonal ▸ Különbség")}: holdsarló.`,
        `${T("star")} Kis csillag (5 csúcs, Ágarány: 0.4) ${SZ(bb(st)[2] - bb(st)[0], bb(st)[3] - bb(st)[1])}, ${ctr(.5 * rs, 0)}. Holdsarló + csillag → ${M("Útvonal ▸ Unió")}.`);
      skills.add("Különbség"); skills.add("Unió");
    }
    if (sym === "star") {
      const p = starPts(CX, sy + rs * .05, rs, .4, 5), q = starPts(CX, sy + rs * .05, rs * .55, .4, 5), cid = id("m");
      symSvg = `<mask id="${cid}"><rect width="${W}" height="${H}" fill="#fff"/><polygon points="${P(q)}" fill="#000"/></mask><polygon mask="url(#${cid})" points="${P(p)}" fill="${sc}"/>`; symB = bb(p);
      L4.push(`${T("star")} Csillag mód, Csúcsok: <b>5</b>, Ágarány: <b>0.4</b>: ${SZ(bb(p)[2] - bb(p)[0], bb(p)[3] - bb(p)[1])}, ${fillRow(sc)}, ${ctr(0, 0)}.`,
        `${M("Szerkesztés ▸ Kettőzés")}, írd be: ${SZ(bb(q)[2] - bb(q)[0], bb(q)[3] - bb(q)[1])}, újra ${ctr(0, 0)}. Jelöld ki mindkettőt → ${M("Útvonal ▸ Különbség")}: csillagkörvonal.`);
      skills.add("Különbség");
    }
    add(4, symSvg, symB);
    steps[4] = { title: "A nemzeti jelkép", lead: `A nemzeted büszkesége: <b>${PRIDE[A.pride].label.toLowerCase()}</b>, ezért a jelkép: <b>${SYM_NAME[sym]}</b>.`, list: L4,
      stuck: ["Az Sz és M beírása elmozdította az alakzatot: ez normális – utána igazítsd újra középre.", "Rosszul sikerült a vágás: a kivágandó alakzat legyen felül (Objektum ▸ Felülre helyezés)."] };
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
    L5.push(`${T("star")} Csillag mód, Csúcsok: 5, Ágarány: 0.4: egy csillag ${SZ(s1[2] - s1[0], s1[3] - s1[1])}, ${fillRow(starCol)}.` + (starOutl ? ` Körvonal: <i>Körvonalrajzolat</i> RGBA ${C(starOutl)}, szélesség <b>0.7 mm</b>.` : ""));
    if (N > 1) L5.push(`${M("Szerkesztés ▸ Kettőzés")} ${N - 1}×, és húzd a másolatokat ${layout === "canton" ? (N > 5 ? "két sorba a kantonban" : "egy sorba a kantonban") : "egy sorba a címer alá"}, mint a képen.`,
      `Jelöld ki mind a(z) ${N} csillagot → ${M("Objektum ▸ Igazítás és elrendezés…")} ${AL("dh")}: egyenlő közök.` + (layout === "canton" ? "" : ` Aztán ${M("Objektum ▸ Csoportosítás")} és ${AL("cv")}.`));
    else L5.push(layout === "canton" ? `Húzd a kanton közepére.` : `${AL("cv")}, aztán húzd egyenesen le a címer alá.`);
    steps[5] = { title: N === 1 ? "Egy tartomány, egy csillag" : `${N} tartomány, ${N} csillag`, lead: layout === "canton" ? "A tartományaid a kantonban ragyognak." : "A tartományaid a címer alatt sorakoznak.", list: L5,
      stuck: ["Minden másolat egymáson ül: a Kettőzés pontosan az eredetire teszi a másolatot – csak húzd arrébb.",
        "Az elrendezés nem csinált semmit: legalább 3 objektum kell hozzá (2 csillagot szemre húzz a helyére)."] };
    why.push(`<b>${N} tartomány</b> → ${N} csillag`);

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
      L6.push(`${T("ellipse")} Egy segédkör ${SZ(2 * Rn, 2 * Rn)} a címer körül, ${M("Objektum ▸ Igazítás és elrendezés…")} ${CENTRE}.`,
        `${M("Útvonal ▸ Objektum átalakítása útvonallá")}, aztán ${M("Objektum ▸ Elforgatás 90°-kal ↻ irányban")} <b>kétszer</b> – most az útvonal bal oldalon kezdődik.`,
        `${T("text")} Kattints a zászlón kívül, írd be: <b>${esc(NAME)}</b>. Vastag betű, kb. <b>${pt(fs)}</b>-es méret, ${fillRow(nameCol)}.` + (nOut ? ` Körvonal: <i>Körvonalrajzolat</i> RGBA ${C(nOut)}, szélesség <b>1 mm</b>.` : ""),
        `${T("selector")} Jelöld ki a kört ÉS a szöveget → ${M("Szöveg ▸ Útvonalra való illesztés")}. Kattints a körre, és vedd el a kitöltését és a körvonalát (<b>X</b> mindkét fülön).`);
      skills.add("Útvonalra illesztés"); skills.add("Útvonallá alakítás");
      steps[6] = { title: "A név, ívben", lead: "Az állam neve ívben fut a címer fölött, mint egy érmén.", list: L6,
        note: "A szöveg 9 óránál kezdődik. Állítsd a méretet, amíg a jobb oldalon ér véget; középre igazításhoz írj szóközöket a név elé.",
        stuck: ["A szöveg fejjel lefelé fut alul: nem forgattad el a kört. Visszavonás, forgasd kétszer, próbáld újra.", "A szöveg félúton megáll: csökkentsd a méretet."] };
      Object.assign(dx, { nameCol, nBgs, nOut, fs });
    } else {
      const avail = layout === "canton" ? 160 : 270, nx = layout === "canton" ? 213 : CX;
      const em = emWidth(NAME, FONT_B, 900), fs = Math.min(15, avail / em), top = army <= 1 ? CY - r * 1.32 : army >= 3 ? CY - r * 1.45 : CY - r - 9;
      const ny = Math.max(fs * .8 + 6, top - 7), tw = em * fs;
      const nBgs = uniq(Array.from({ length: 9 }, (_, i) => colorAt(nx - tw / 2 + tw * i / 8, ny - fs * .35)));
      const nameCol = bestMulti(nBgs, cands, pal), nOut = worstC(nameCol, nBgs) < 2.5 ? best(nameCol, [WHITE, BLACK, ...pal], pal) : null;
      add(6, `<text x="${nx}" y="${r1(ny)}" text-anchor="middle" font-family="${FONT_B}" font-weight="900" font-size="${r1(fs)}" fill="${nameCol}"${nOut ? ` stroke="${nOut}" stroke-width="1.1" paint-order="stroke" stroke-linejoin="round"` : ""}>${esc(NAME)}</text>`, [nx - tw / 2, ny - fs * .8, nx + tw / 2, ny]);
      L6.push(`${T("text")} Kattints a címer fölé, írd be: <b>${esc(NAME)}</b>. Vastag betű, kb. <b>${pt(fs)}</b>-es méret, ${fillRow(nameCol)}.` + (nOut ? ` Körvonal: <i>Körvonalrajzolat</i> RGBA ${C(nOut)}, szélesség <b>1 mm</b>.` : ""),
        layout === "canton" ? `${T("selector")} Húzd a kantontól jobbra, a címer fölé.` : `${T("selector")} ${M("Objektum ▸ Igazítás és elrendezés…")} ${AL("cv")}, aztán húzd egyenesen fel a címer fölé.`);
      steps[6] = { title: "A név", lead: "Az állam neve, egyszerűen és jól olvashatóan felül.", list: L6, stuck: ["Túl széles: csökkentsd a méretet, vagy válassz keskenyebb vastag betűt."] };
      Object.assign(dx, { nameCol, nBgs, nOut, fs });
    }
    why.push(arcName ? `<b>${SLIDERS.rule.opts[rule]}</b> → a név ívben` : `<b>${SLIDERS.rule.opts[rule]}</b> → a név egyenesen felül`);

    /* ---------- STEP 7: motto + frame ---------- */
    const L7 = [];
    if (bandMotto) {
      const underBand = uniq(Array.from({ length: 28 }, (_, i) => 42 + i * 8).flatMap(x => [152, 160, 168].map(y => colorAt(x, y))));
      const bandCol = bestMulti(underBand, [...pal, BLACK, WHITE], pal);
      const backing = worstC(bandCol, underBand) < 2 ? best(bandCol, [WHITE, ...pal, BLACK], pal, [bandCol]) : null;
      const fs = Math.min(13, 205 / emWidth(MOTTO_U, FONT_B, 900)), cid = id("m");
      add(7, `<mask id="${cid}"><rect width="${W}" height="${H}" fill="#fff"/><text x="${CX}" y="${r1(160 + fs * .36)}" text-anchor="middle" font-family="${FONT_B}" font-weight="900" font-size="${r1(fs)}" fill="#000">${esc(MOTTO_U)}</text></mask>${backing ? rect(40, 148, 220, 24, backing) : ""}<rect mask="url(#${cid})" x="40" y="148" width="220" height="24" fill="${bandCol}"/>`, [40, 148, 260, 172]);
      if (backing) L7.push(`${T("rect")} Háttércsík ${SZ(220, 24)}, ${fillRow(backing)} – ez fog átlátszani a betűkön.`);
      L7.push(`${T("rect")} A jelmondatsáv ${SZ(220, 24)}, ${fillRow(bandCol)}. ${M("Objektum ▸ Igazítás és elrendezés…")} ${AL("cv", "bottom")}, aztán ${MOVE(0, -8)}.` + (backing ? " Előbb ugyanezt csináld meg a háttércsíkkal." : ""),
        `${T("text")} Írd be a jelmondatod: <b>${esc(MOTTO_U)}</b>, vastag, kb. <b>${pt(fs)}</b>-es méret. ${AL("cv")}, aztán húzd a sávra.`,
        `Ellenőrizd a helyesírást! A szövegen: ${M("Útvonal ▸ Objektum átalakítása útvonallá")}. Sáv + szöveg kijelölve → ${M("Útvonal ▸ Különbség")}: a betűk kivágódnak.`);
      skills.add("Útvonallá alakítás"); skills.add("Különbség");
      Object.assign(dx, { bandCol, underBand, backing });
    } else {
      const ribCol = bestMulti(uniq([52, 100, 150, 200, 248].map(x => colorAt(x, 157))), [WHITE, ...pal, BLACK], pal);
      const txtCol = best(ribCol, cands, pal, [ribCol]);
      const fs = Math.min(10, 186 / emWidth(MOTTO, FONT_R, 700));
      add(7, `<g fill="${ribCol}">${rect(60, 146, 180, 22, ribCol)}<circle cx="60" cy="157" r="11"/><circle cx="240" cy="157" r="11"/></g><text x="${CX}" y="${r1(157 + fs * .36)}" text-anchor="middle" font-family="${FONT_R}" font-weight="700" font-size="${r1(fs)}" fill="${txtCol}">${esc(MOTTO)}</text>`, [49, 146, 251, 168]);
      L7.push(`${T("rect")} Egy téglalap ${SZ(180, 22)} és ${T("ellipse")} két kör ${SZ(22, 22)}, mind ${fillRow(ribCol)}. Húzz egy-egy kört a téglalap két végére.`,
        `Jelöld ki a hármat → ${M("Útvonal ▸ Unió")}: szalag. ${M("Objektum ▸ Igazítás és elrendezés…")} ${AL("cv", "bottom")}, aztán ${MOVE(0, -12)}.`,
        `${T("text")} Írd be a jelmondatod a zászló mellé: <b>${esc(MOTTO)}</b>, kb. <b>${pt(fs)}</b>-es méret, ${fillRow(txtCol)}.`,
        `Szalag + szöveg kijelölve → ${M("Szöveg ▸ Szöveg tördelése keretbe")}. ${T("text")} Kattints a szövegbe, és nyomd meg a <i>középre</i> gombot.`);
      skills.add("Unió"); skills.add("Tördelés keretbe");
      Object.assign(dx, { ribCol, txtCol });
    }
    const ew = [6, 5, 4, 3, 2][rule];
    const edgeCol = bestMulti(uniq([colorAt(2, 2), colorAt(298, 90), colorAt(150, 178)]), rule <= 2 ? [...pal, BLACK] : [WHITE, ...pal], pal);
    add(7, `<rect x="${ew / 2}" y="${ew / 2}" width="${W - ew}" height="${H - ew}" fill="none" stroke="${edgeCol}" stroke-width="${ew}"/>`, [0, 0, W, H]);
    L7.push(`${T("rect")} Végül a keret: egy téglalap, <i>Kitöltés</i> → X, <i>Körvonalrajzolat</i> RGBA ${C(edgeCol)}, szélesség <b>${ew} mm</b>. Írd be: ${SZ(W, H)} (a méretbe a körvonal is beleszámít), aztán ${CENTRE}.`);
    skills.add("Kitöltés és körvonal");
    steps[7] = { title: bandMotto ? "Jelmondatsáv és keret" : "Jelmondatszalag és keret", lead: `A válaszaid megírták a jelmondatodat: <b>„${esc(MOTTO)}”</b>.`, list: L7,
      stuck: bandMotto ? ["A betűk helyett a sáv tűnt el: a szöveg legyen felül (Objektum ▸ Felülre helyezés).", "Szürke a Különbség: előbb alakítsd át a szöveget – Útvonal ▸ Objektum átalakítása útvonallá."]
        : ["Kilóg a szöveg: kisebb méret.", "A Tördelés keretbe nem csinál semmit: pontosan 2 objektum – a szalag és a szöveg."] };
    why.push(`<b>${TAKEOVER[A.takeover].label}</b> → a jelmondat: „${esc(MOTTO)}”`);

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
    return `<svg class="banner ${cls}" viewBox="-6 -6 312 192" role="img" aria-label="${esc(model.name)} zászlaja${upto < 7 ? ", a(z) " + upto + ". lépés után" : ""}"><rect x="-6" y="-6" width="312" height="192" fill="#e9e7dd"/>${parts}${hl}</svg>`;
  }
  const MYSTERY = `<svg class="banner" viewBox="-6 -6 312 192" role="img" aria-label="Rejtett zászló"><rect x="-6" y="-6" width="312" height="192" fill="#e9e7dd"/><rect width="300" height="180" fill="#3a3f3c"/><path d="M0 0L300 180M300 0L0 180" stroke="#4a504c" stroke-width="2"/><text x="150" y="118" text-anchor="middle" font-family="${FONT_B}" font-weight="900" font-size="96" fill="#efeee6" opacity=".85">?</text></svg>`;
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
      <p class="pick" aria-live="polite">${a.touched[k] ? `<b>${SLIDERS[k].opts[a[k]]}</b> – ${SLIDERS[k].hints[a[k]]}` : "Mozgasd a csúszkát, vagy kattints egy lehetőségre."}</p></div>`
  });
  const QUESTIONS = [
    { id: "country", title: "Melyik országot foglaltad el?", sub: "A zászlaja színei lesznek a palettád.", valid: a => a.palette.length > 0 && !!a.country,
      html: a => { const known = COUNTRIES.find(c => c.n === a.country); return `<select id="q-country"><option value="">– válassz országot –</option>${COUNTRIES.map(c => `<option${c.n === a.country ? " selected" : ""}>${esc(c.n)}</option>`).join("")}<option value="__other"${a.country && !known ? " selected" : ""}>Más ország – megadom a zászló színeit</option></select>
        <div class="custom" id="custom"${a.country && !known ? "" : " hidden"}><span>A zászló színei:</span>${[0, 1, 2].map(i => `<input type="color" data-ci="${i}" value="${a.custom[i].toLowerCase()}" aria-label="${i + 1}. zászlószín">`).join("")}<input type="text" id="q-cname" maxlength="30" placeholder="az ország neve" value="${known ? "" : esc(a.country === "__other" ? "" : a.country)}"></div>
        ${a.palette.length ? `<div class="palette-show">${a.palette.map(c => `<span style="--c:${c}"></span>`).join("")}</div>` : ""}`; } },
    { id: "main", title: "Melyik szín a mozgalmad színe?", sub: "Ez vezeti majd a zászlódat.", valid: a => !!a.main, html: a => `<div class="swatches big">${swatchOpts(a)}</div>` },
    { id: "name", title: "Mi az új államod neve?", sub: "Legyen rövid és hangos.", valid: a => a.name.trim().length > 0,
      html: a => `<input type="text" id="q-name" maxlength="26" placeholder="pl. Vasszövetség" value="${esc(a.name)}"><p class="qh">Ötletek: ${["Nova Köztársaság", "Vasszövetség", "Egyesült Tartományok", "Népi Unió", "Nagyhercegség", "Szabad Állam"].map(n => `<button type="button" class="idea" data-v="${esc(n)}">${esc(n)}</button>`).join(" ")}</p>` },
    sliderQ("rule"), sliderQ("econ"), sliderQ("army"), sliderQ("trad"),
    { id: "pride", title: "Mire büszke a nemzeted?", valid: a => !!a.pride,
      html: a => `<div class="prides">${Object.entries(PRIDE).map(([k, p]) => `<label><input type="radio" name="pride" value="${k}" ${a.pride === k ? "checked" : ""}><span><i aria-hidden="true">${p.icon}</i>${p.label}</span></label>`).join("")}</div>` },
    { id: "provinces", title: "Hány tartománya van az országodnak?", valid: a => !!a.touched.provinces,
      html: a => `<div class="slide5"><div class="ends"><span>1</span><span>9</span></div><input type="range" min="1" max="9" step="1" value="${a.provinces}" data-k="provinces" aria-label="Tartományok"><p class="pick big" aria-live="polite">${a.touched.provinces ? `<b>${a.provinces}</b> tartomány` : "Mozgasd a csúszkát."}</p></div>` },
    { id: "takeover", title: "Hogyan kerültél hatalomra?", sub: "A történelem emlékezni fog.", valid: a => !!a.takeover,
      html: a => `<div class="cards2 four">${Object.entries(TAKEOVER).map(([k, t]) => `<label><input type="radio" name="takeover" value="${k}" ${a.takeover === k ? "checked" : ""}><span><i aria-hidden="true">${t.icon}</i><b>${t.label}</b></span></label>`).join("")}</div>` }
  ];
  const allValid = () => QUESTIONS.every(q => q.valid(A()));

  /* ------------------------------------------------------------------ page */
  const tape = `<span class="tape l" aria-hidden="true"></span><span class="tape r" aria-hidden="true"></span>`;
  const STEP_TITLES = ["Az alapmező", "A címer mögött", "A címer kerete", "A nemzeti jelkép", "Tartományok", "A név", "Jelmondat és keret"];
  const head = (h, p, c) => `<div class="sec-head"${c ? ` style="--c:${c}"` : ""}><h2>${h}</h2><p>${p}</p><svg viewBox="0 0 200 12" aria-hidden="true"><path d="M3 8 C 50 2, 100 12, 150 5 S 190 5, 197 7"/></svg></div>`;
  $("#app").innerHTML = `
  <header class="rail"><div class="wrap">
    <a class="logo" href="../../"><svg width="28" height="28" viewBox="0 0 30 30" aria-hidden="true"><rect x="1.5" y="3" width="27" height="20" rx="2" fill="#22362f" stroke="#fff6e8" stroke-width="2"/><path d="M7 10h9M7 15h13" stroke="#f2d264" stroke-width="2.4" stroke-linecap="round"/><path d="M9 23l-3 5M21 23l3 5" stroke="#fff6e8" stroke-width="2" stroke-linecap="round"/></svg><span>digikult</span></a>
    <nav class="dots" aria-label="Lépések"><span class="lbl">Lépések</span>${STEP_TITLES.map((t, i) => `<a href="#step-${i + 1}" data-n="${i + 1}" title="${i + 1}. lépés: ${t}">${i + 1}</a>`).join("")}</nav>
  </div></header>
  <main class="wrap">
    <section class="hero">
      <div>
        <p class="kicker">Inkscape-záróprojekt</p>
        <h1>Puccs!</h1>
        <svg class="scribble" viewBox="0 0 420 22" aria-hidden="true"><path d="M4 14 C 80 4, 160 20, 240 10 S 360 6, 414 12"/></svg>
        <p class="story">Hajnali 3 óra. Csend van a palotában, a régi kormány helikopterrel távozott, a tévészékház a tiéd. Erkölcsileg szürke tábornok vagy egy vadonatúj országgal – és zászló nélkül. Válaszold meg egyenként a parancsnoki sátor kérdéseit: az utolsó válasz után előkerül a zászlód.</p>
        <p class="disclaimer">Tervezőjáték: a puccs színtiszta kitaláció, az SVG-fájlod egyetlen valódi kormánynak sem árt.</p>
        <div class="meter" aria-live="polite"><div class="row"><span>Haladásod</span><b id="count"></b></div><span class="bar" id="bar">${STEP_TITLES.map(() => "<i></i>").join("")}</span></div>
        <div class="actions"><a class="btn chalk" href="#tent">Irány a parancsnoki sátor ▸</a><button class="btn ghost" type="button" id="print">🖨 A tervem nyomtatása</button></div>
      </div>
      <figure class="poster flag-poster"><div id="hero-flag"></div><figcaption id="hero-cap"></figcaption></figure>
    </section>
    <section class="sec" id="tent">${head("A parancsnoki sátor", "Egyszerre egy kérdés. Nincs leskelődés – a zászló a végén jelenik meg.")}<div id="wizard"></div></section>
    <div id="work"></div>
  </main>
  <footer class="tray"><div class="wrap"><span class="sticks" aria-hidden="true"><i></i><i></i><i></i></span>
    <span>Tanároknak: <a href="../pdf/coup-tanari.pdf" download>tanári segédlet (PDF)</a></span>
    <button class="reset" type="button" id="reset">Újrakezdés</button></div></footer>`;

  /* ------------------------------------------------------------------ wizard */
  function renderWizard(focus) {
    const box = $("#wizard");
    if (S.revealed) { renderReveal(); return; }
    const q = QUESTIONS[S.q], a = A(), last = S.q === QUESTIONS.length - 1, ok = q.valid(a);
    box.innerHTML = `<article class="sheet qcard" style="--tilt:-.2deg">${tape}
      <div class="qtop"><span class="qcount">${S.q + 1}. kérdés / ${QUESTIONS.length}</span>
        <span class="qdots" aria-hidden="true">${QUESTIONS.map((x, i) => `<i class="${i < S.q ? "done" : i === S.q ? "cur" : ""}"></i>`).join("")}</span></div>
      <h3 class="qtitle" tabindex="-1">${q.title}</h3>${q.sub ? `<p class="lead">${q.sub}</p>` : ""}
      <div class="qbody">${q.html(a)}</div>
      <div class="qnav"><button type="button" class="btn back" id="back" ${S.q === 0 ? "disabled" : ""}>◂ Vissza</button>
        <button type="button" class="btn next" id="next" ${ok ? "" : "disabled"}>${last ? "Mutasd a zászlómat ▸" : "Tovább ▸"}</button></div>
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
      if (pk) pk.innerHTML = SLIDERS[k] ? `<b>${SLIDERS[k].opts[a[k]]}</b> – ${SLIDERS[k].hints[a[k]]}` : `<b>${a[k]}</b> tartomány`;
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
      <p class="drum">${animate ? "A nép gyülekezik a téren…" : "A zászlód"}</p>
      <div class="reveal-flag">${svg(m)}</div>
      <h3 class="rname">${esc(m.name)}</h3>
      <p class="rmotto">„${esc(m.motto)}”</p>
      <ul class="why">${m.why.map(w => `<li>${w}</li>`).join("")}</ul>
      <div class="qnav"><button type="button" class="btn back" id="again">↺ Újra válaszolok</button><a class="btn next" href="#start">Építsd meg Inkscape-ben ↓</a></div>
    </article>`;
    $("#again").addEventListener("click", () => {
      if (S.solved.length && !confirm("Újra válaszolsz? A zászlód és a lépések megváltoznak, a pipáid törlődnek.")) return;
      S.revealed = false; S.q = 0; S.solved = []; S.checks = []; S.end = false; save();
      renderWizard(true); renderWork(); hero(); $("#tent").scrollIntoView({ block: "start" });
    });
  }
  function hero() {
    if (S.revealed) { const m = build(A()); $("#hero-flag").innerHTML = svg(m); $("#hero-cap").textContent = `${m.name} zászlaja`; }
    else { $("#hero-flag").innerHTML = MYSTERY; $("#hero-cap").textContent = "Válaszolj minden kérdésre, és előkerül"; }
  }

  /* ------------------------------------------------------------------ guided steps */
  function renderWork() {
    const box = $("#work");
    if (!S.revealed) { box.innerHTML = ""; paint(); return; }
    const m = build(A());
    const tilt = i => ["-.3deg", ".25deg", "-.15deg", ".35deg"][i % 4];
    const fileName = "vezeteknev_" + m.name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "").slice(0, 16);
    box.innerHTML = `
    <section class="sec">${head("Készségek a zászlódon", "Minden az idei évből – a zászlód ezeket használja:")}<ul class="badges">${m.skills.map(s => `<li>${s}</li>`).join("")}</ul></section>
    <section class="sec" id="start">${head("Mielőtt elkezded", "Nincs billentyűparancs: minden parancs egy menüben vagy egy eszköztáron van.")}
      <article class="sheet" style="--tilt:-.2deg">${tape}<h3>Négy trükk, amit folyton használni fogsz</h3>
        <ol class="do">
          <li>${M("Fájl ▸ Új")}, ${M("Fájl ▸ Mentés másként…")} <code>${fileName}.svg</code>.</li>
          <li><b>Méretek:</b> a ${T("selector")} Kijelölővel írd be az eszközvezérlő-sávon az <b>Sz</b> (szélesség) és <b>M</b> (magasság) értékét (mm, a lakat nyitva, mindegyik után Enter).</li>
          <li><b>Színek:</b> ${M("Objektum ▸ Kitöltés és körvonal…")} → <i>Kitöltés</i> → Egyenletes szín → írd be a kódot az <b>RGBA</b> mezőbe, pl. ${C(m.pal[0])}.</li>
          <li><b>Elhelyezés:</b> ${M("Objektum ▸ Igazítás és elrendezés…")}, <i>Relatív ehhez: <b>Oldal</b></i>. ${CENTRE} a kijelölt alakzatot a zászló közepére teszi. Pontos eltoláshoz: ${M("Objektum ▸ Transzformáció…")} → <i>Áthelyezés</i>, pipáld be a <i>Relatív áthelyezés</i> négyzetet (+ = jobbra/le, − = balra/fel).</li>
        </ol>
        <p class="note">A palettád: ${m.pal.map(c => C(c)).join(" ")} ${C(WHITE)} ${C(BLACK)}. Több objektum: kattintás, ${K("Shift")} + kattintás. Különbség: a felül lévő objektum vágódik ki.</p>
      </article></section>
    <section class="sec">${head("A lépések", "Minden kép a zászlódat mutatja a lépés után; a szaggatott keret jelöli az újat.", "var(--accent)")}
      ${[1, 2, 3, 4, 5, 6, 7].map((n, i) => { const s = m.steps[n]; return `
      <article class="sheet step" id="step-${n}" data-n="${n}" style="--tilt:${tilt(i)}">${tape}
        <h3><span class="num">${n}</span>${s.title} <span class="stamp">kész!</span></h3>
        <p class="lead">${s.lead}</p>
        <div class="stepgrid"><div class="stepflag">${svg(m, n, n)}</div><ol class="do">${s.list.map(x => `<li>${x}</li>`).join("")}</ol></div>
        ${s.note ? `<p class="note">${s.note}</p>` : ""}
        ${s.stuck && s.stuck.length ? `<details class="stuck"><summary>Elakadtál?</summary><ul>${s.stuck.map(x => `<li>${x}</li>`).join("")}</ul></details>` : ""}
        <div class="foot"><button class="done-btn" type="button" data-n="${n}" aria-pressed="false"><span class="box" aria-hidden="true"></span><span class="t">Ezt a lépést megcsináltam</span></button>
        ${n < 7 ? `<a class="next-link" href="#step-${n + 1}">Következik: ${m.steps[n + 1].title} ↓</a>` : `<a class="next-link" href="#save">Utolsó lépés: mentés és beadás ↓</a>`}</div>
      </article>`; }).join("")}
    </section>
    <section class="sec" id="save">${head("Mentés és beadás", "Az SVG megmutatja, hogyan építetted; a PNG a kép.")}
      <article class="sheet" style="--tilt:.2deg">${tape}
        <ol class="do"><li>${M("Fájl ▸ Mentés")} – <code>${fileName}.svg</code></li><li>${M("Fájl ▸ Exportálás…")} → <b>Oldal</b> → <code>${fileName}.png</code> → Exportálás.</li></ol>
        <h3 style="margin-top:14px">Ellenőrzőlista</h3>
        <ul class="check">${checklist(m).map((c, i) => `<li><label><input type="checkbox" data-c="${i}"><span>${c}</span></label></li>`).join("")}</ul>
      </article>
      <div class="finish" id="finish" role="status"><h2>Éljen ${esc(m.name)}!</h2><p>Add be a két fájlt, aztán próbálj ki egy bónuszt lent.</p></div>
    </section>
    <section class="sec" id="bonus">${head("Bónusz – uralkodj keményebben", "Ugyanazok az eszközök, több propaganda. Válassz bármelyiket.")}
      <article class="sheet" style="--tilt:-.2deg">${tape}<ul class="bonus">
        <li><b>Pénzérme</b><span>Két kör → ${M("Útvonal ▸ Különbség")} a peremnek, középen a jelképed, a név ${M("Szöveg ▸ Útvonalra való illesztés")} paranccsal.</span></li>
        <li><b>Bankjegy</b><span>Téglalap fogaskerekes szegéllyel (Csillag eszköz, sok csúcs, mínusz egy téglalap), a jelképed, az érték nagy, vastag betűkkel.</span></li>
        <li><b>Zászló rúdon</b><span>${M("Szerkesztés ▸ Minden kijelölése")}, ${M("Objektum ▸ Csoportosítás")}; vékony téglalap rúd + a tetején egy kör → ${M("Útvonal ▸ Unió")}.</span></li>
        <li><b>A tábornok érdemrendje</b><span>8 csúcsú csillag mínusz egy kör (${M("Útvonal ▸ Különbség")}) + szalag: téglalap → ${M("Útvonal ▸ Objektum átalakítása útvonallá")} → ${T("node")} az alsó sarkokat húzd V alakúra.</span></li>
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
    return [`Az alapmező: ${LAYOUT_NAME[m.layout]}, pontos színek, az oldal a zászlóra méretezve`, `A címer mögött: ${BEHIND_NAME[m.army]}`, `A címer kerete: ${FRAME_NAME[m.econ]}`,
      `A jelkép: ${SYM_NAME[m.sym]}`, `${m.N} csillag egyenlő közökkel`, `A név (${esc(m.name)}) ${m.arcName ? "ívben (Útvonalra illesztés)" : "felül, középen"}`,
      `A jelmondat („${esc(m.motto)}”) ${m.bandMotto ? "kivágva a sávból" : "a szalagba tördelve"}, és a keret`, "Az SVG és a PNG is elmentve, a fájlnévben a vezetékneveddel"];
  }

  /* ------------------------------------------------------------------ progress */
  function paint() {
    document.querySelectorAll(".step").forEach(el => {
      const n = +el.dataset.n, d = S.solved.includes(n); el.classList.toggle("is-done", d);
      const b = el.querySelector(".done-btn"); b.setAttribute("aria-pressed", String(d)); b.querySelector(".box").textContent = d ? "✓" : ""; b.querySelector(".t").textContent = d ? "Kész" : "Ezt a lépést megcsináltam";
    });
    document.querySelectorAll(".dots a").forEach(a => a.classList.toggle("done", S.solved.includes(+a.dataset.n)));
    document.querySelectorAll("#bar i").forEach((i, k) => i.classList.toggle("on", S.solved.includes(k + 1)));
    $("#count").textContent = `${S.solved.length} / 7 lépés`;
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
    if (!confirm("Újrakezded? A válaszaid és a pipáid törlődnek.")) return;
    S = { answers: fresh(), q: 0, revealed: false, solved: [], checks: [], end: false }; save();
    renderWizard(); renderWork(); hero(); window.scrollTo({ top: 0 });
  });
  $("#print").addEventListener("click", () => window.print());

  if (S.revealed && !allValid()) S.revealed = false;
  renderWizard(); renderWork(); hero();
})();
