/* Coup! / Puccs! – the Inkscape final project (v3, bilingual: set window.COUP_LANG = "hu" before loading for Hungarian).
   One question at a time; the banner stays hidden until every question is answered. The answers deterministically produce
   a banner, and the guided Inkscape steps for exactly that banner. Every step is a comic strip of small panels (like the
   earlier missions): each panel shows the banner at that moment, with the selection box, the blue see-through "cutter"
   shape and a dashed outline + arrow where something was moved from; chips under the panel give the tool, menu, sizes
   and colour codes. Saved under KEY as {answers, q, revealed, solved:[1..7], checks:[…], end}. */
(function () {
  "use strict";
  const HU = window.COUP_LANG === "hu";
  const t = (en, hu) => HU ? hu : en;
  const KEY = HU ? "coup-hu-v1" : "coup-v1";
  const W = 300, H = 180, CX = 150, CY = 90;
  const $ = s => document.querySelector(s);
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const SH = "­";

  /* ------------------------------------------------------------------ data */
  const COUNTRIES = [
    ["Albania", "Albánia", "#E41E20 #000000"], ["Argentina", "Argentína", "#74ACDF #FFFFFF #F6B40E"], ["Armenia", "Örményország", "#D90012 #0033A0 #F2A800"],
    ["Australia", "Ausztrália", "#012169 #FFFFFF #E4002B"], ["Austria", "Ausztria", "#C8102E #FFFFFF"], ["Bangladesh", "Banglades", "#006A4E #F42A41"],
    ["Belgium", "Belgium", "#000000 #FDDA24 #EF3340"], ["Bhutan", "Bhután", "#FFD520 #FF4E12 #FFFFFF"], ["Bolivia", "Bolívia", "#D52B1E #F9E300 #007934"],
    ["Brazil", "Brazília", "#009C3B #FFDF00 #002776 #FFFFFF"], ["Bulgaria", "Bulgária", "#FFFFFF #00966E #D62612"], ["Cameroon", "Kamerun", "#007A5E #CE1126 #FCD116"],
    ["Canada", "Kanada", "#FF0000 #FFFFFF"], ["Chile", "Chile", "#0039A6 #FFFFFF #D52B1E"], ["China", "Kína", "#EE1C25 #FFFF00"],
    ["Colombia", "Kolumbia", "#FCD116 #003893 #CE1126"], ["Croatia", "Horvátország", "#FF0000 #FFFFFF #171796"], ["Cuba", "Kuba", "#002A8F #FFFFFF #CF142B"],
    ["Czechia", "Csehország", "#FFFFFF #D7141A #11457E"], ["Denmark", "Dánia", "#C8102E #FFFFFF"], ["Ecuador", "Ecuador", "#FFDD00 #034EA2 #ED1C24"],
    ["Egypt", "Egyiptom", "#CE1126 #FFFFFF #000000 #C09300"], ["Estonia", "Észtország", "#0072CE #000000 #FFFFFF"], ["Ethiopia", "Etiópia", "#078930 #FCDD09 #DA121A #0F47AF"],
    ["Finland", "Finnország", "#FFFFFF #002F6C"], ["France", "Franciaország", "#002395 #FFFFFF #ED2939"], ["Georgia", "Grúzia", "#FFFFFF #FF0000"],
    ["Germany", "Németország", "#000000 #DD0000 #FFCE00"], ["Ghana", "Ghána", "#CE1126 #FCD116 #006B3F #000000"], ["Greece", "Görögország", "#0D5EAF #FFFFFF"],
    ["Hungary", "Magyarország", "#CE2939 #FFFFFF #477050"], ["Iceland", "Izland", "#02529C #FFFFFF #DC1E35"], ["India", "India", "#FF9933 #FFFFFF #138808 #000080"],
    ["Indonesia", "Indonézia", "#FF0000 #FFFFFF"], ["Ireland", "Írország", "#169B62 #FFFFFF #FF883E"], ["Italy", "Olaszország", "#009246 #FFFFFF #CE2B37"],
    ["Jamaica", "Jamaica", "#009B3A #FED100 #000000"], ["Japan", "Japán", "#FFFFFF #BC002D"], ["Kazakhstan", "Kazahsztán", "#00AFCA #FEC50C"],
    ["Kenya", "Kenya", "#000000 #BB0000 #006600 #FFFFFF"], ["Latvia", "Lettország", "#9E3039 #FFFFFF"], ["Lithuania", "Litvánia", "#FDB913 #006A44 #C1272D"],
    ["Luxembourg", "Luxemburg", "#EF3340 #FFFFFF #00A3E0"], ["Madagascar", "Madagaszkár", "#FFFFFF #FC3D32 #007E3A"], ["Malaysia", "Malajzia", "#CC0001 #FFFFFF #010066 #FFCC00"],
    ["Malta", "Málta", "#FFFFFF #CF142B"], ["Mexico", "Mexikó", "#006847 #FFFFFF #CE1126"], ["Monaco", "Monaco", "#CE1126 #FFFFFF"],
    ["Mongolia", "Mongólia", "#C4272F #015197 #F9CF02"], ["Morocco", "Marokkó", "#C1272D #006233"], ["Nepal", "Nepál", "#DC143C #003893 #FFFFFF"],
    ["Netherlands", "Hollandia", "#AE1C28 #FFFFFF #21468B"], ["New Zealand", "Új-Zéland", "#00247D #FFFFFF #CC142B"], ["Nigeria", "Nigéria", "#008751 #FFFFFF"],
    ["Norway", "Norvégia", "#BA0C2F #FFFFFF #00205B"], ["Pakistan", "Pakisztán", "#01411C #FFFFFF"], ["Panama", "Panama", "#FFFFFF #DA121A #072357"],
    ["Peru", "Peru", "#D91023 #FFFFFF"], ["Philippines", "Fülöp-szigetek", "#0038A8 #CE1126 #FFFFFF #FCD116"], ["Poland", "Lengyelország", "#FFFFFF #DC143C"],
    ["Portugal", "Portugália", "#006600 #FF0000 #FFFF00"], ["Qatar", "Katar", "#8A1538 #FFFFFF"], ["Romania", "Románia", "#002B7F #FCD116 #CE1126"],
    ["Senegal", "Szenegál", "#00853F #FDEF42 #E31B23"], ["Serbia", "Szerbia", "#C6363C #0C4076 #FFFFFF"], ["Seychelles", "Seychelle-szigetek", "#003F87 #FCD856 #D62828 #007A3D"],
    ["Slovakia", "Szlovákia", "#FFFFFF #0B4EA2 #EE1C25"], ["Slovenia", "Szlovénia", "#FFFFFF #005DA4 #ED1C24"], ["South Africa", "Dél-afrikai Köztársaság", "#007749 #FFB81C #DE3831 #002395"],
    ["South Korea", "Dél-Korea", "#FFFFFF #CD2E3A #0047A0 #000000"], ["Spain", "Spanyolország", "#AA151B #F1BF00"], ["Sweden", "Svédország", "#006AA7 #FECC00"],
    ["Switzerland", "Svájc", "#DA291C #FFFFFF"], ["Tanzania", "Tanzánia", "#1EB53A #FCD116 #000000 #00A3DD"], ["Thailand", "Thaiföld", "#A51931 #F4F5F8 #2D2A4A"],
    ["Tunisia", "Tunézia", "#E70013 #FFFFFF"], ["Turkey", "Törökország", "#E30A17 #FFFFFF"], ["Uganda", "Uganda", "#000000 #FCDC04 #D90000"],
    ["United Kingdom", "Egyesült Királyság", "#012169 #FFFFFF #C8102E"], ["United States", "Egyesült Államok", "#B22234 #FFFFFF #3C3B6E"], ["Uruguay", "Uruguay", "#FFFFFF #0038A8 #FCD116"],
    ["Venezuela", "Venezuela", "#FFCC00 #00247D #CF142B"], ["Vietnam", "Vietnám", "#DA251D #FFFF00"], ["Zambia", "Zambia", "#198A00 #EF7D00 #DE2010 #000000"]
  ].map(([en, hu, c]) => ({ n: HU ? hu : en, c: c.split(" ") })).sort((a, b) => a.n.localeCompare(b.n, HU ? "hu" : "en"));

  const PRIDE = {
    industry: { label: t("Industry", "Ipar"), icon: "⚙️", sym: "gear", word: t("Steel", "Acél") },
    farming: { label: t("Farming", "Mezőgazdaság"), icon: "🌾", sym: "sun", word: t("Bread", "Kenyér") },
    sea: { label: t("The sea", "A tenger"), icon: "🌊", sym: "waves", word: t("Salt", "Só") },
    mountains: { label: t("Mountains", "Hegyek"), icon: "⛰️", sym: "mountains", word: t("Stone", "Kő") },
    forests: { label: t("Forests", "Erdők"), icon: "🌲", sym: "tree", word: t("Timber", "Fa") },
    science: { label: t("Science", "Tudomány"), icon: "⚛️", sym: "atom", word: t("Science", "Tudomány") },
    kings: { label: t("Old kings & history", "Régi királyok, történelem"), icon: "👑", sym: "crown", word: t("Glory", "Dicsőség") },
    night: { label: t("The night sky", "Az éjszakai égbolt"), icon: "🌙", sym: "crescent", word: t("Starlight", "Csillagfény") },
    freedom: { label: t("Freedom", "Szabadság"), icon: "⭐", sym: "star", word: t("Hope", "Remény") }
  };
  const SYM_NAME = HU
    ? { gear: "fogaskerék", sun: "felkelő nap", waves: "hullámos korong", mountains: "hegyek kerek ablakban", tree: "fenyőfa", atom: "atom", crown: "drágaköves korona", crescent: "holdsarló csillaggal", star: "csillagkörvonal" }
    : { gear: "a gear", sun: "a rising sun", waves: "a wave disc", mountains: "mountains in a round window", tree: "a pine tree", atom: "an atom", crown: "a jewelled crown", crescent: "a crescent and star", star: "a star outline" };
  const TAKEOVER = {
    palace: { label: t("A quiet palace coup at night", "Csendes éjszakai palotapuccs"), icon: "🌙" },
    uprising: { label: t("A people's uprising", "Népfelkelés"), icon: "✊" },
    parade: { label: t("Tanks at the morning parade", "Tankok a reggeli díszszemlén"), icon: "🎖️" },
    lottery: { label: t("You won a rigged lottery", "Megnyertél egy elcsalt sorsolást"), icon: "🎟️" }
  };
  const SLIDERS = HU ? {
    rule: { q: "Hogyan fogsz kormányozni?", ends: ["Vasököl", "Szabad választás"], opts: [`Vas${SH}ököl`, `Szi${SH}go${SH}rú`, `Mér${SH}sé${SH}kelt`, `Nyi${SH}tott`, `Sza${SH}bad vá${SH}lasz${SH}tás`],
      hints: ["Egy vezér, egy hang, napi díszszemle.", "A szabály az szabály. Főleg a tiéd.", "Egy tanács – te elnökölsz benne.", "Parlament, amely néha nemet mond.", "Valódi választások. Akár veszíthetsz is."] },
    econ: { q: "Merre hajlik a gazdaságod?", ends: ["Bal", "Jobb"], opts: [`Szél${SH}ső${SH}bal`, "Bal", "Közép", "Jobb", `Szél${SH}ső${SH}jobb`],
      hints: ["Minden gyár az államé.", "A munkások az elsők, erős közszolgáltatások.", "Egy kicsit mindenből.", "A vállalkozás az első, alacsony adók.", "Mindenről a piac dönt."] },
    army: { q: "Mennyire épül a hatalmad a hadseregre?", ends: ["Béke", "Hadsereg"], opts: [`Pa${SH}ci${SH}fis${SH}ta`, `Bé${SH}kés`, "Éber", "Erős", `Ka${SH}to${SH}nai ál${SH}lam`],
      hints: ["A katonák mostantól fát ültetnek.", "Kis hadsereg a díszszemlékhez.", "Készenlétben, de csendben.", "Tankok minden ünnepségen.", "A hadsereg MAGA az állam."] },
    trad: { q: "Hagyomány vagy haladás?", ends: ["Hagyomány", "Haladás"], opts: ["A régi utak", `Ha${SH}gyo${SH}má${SH}nyos`, `Kö${SH}zép${SH}út`, `Mo${SH}dern`, `A jövő az el${SH}ső`],
      hints: ["Ahogy nagyapa csinálta.", "Lassan változz, ha egyáltalán.", "Ami jó, marad, a többi változik.", "Az új ötletek jöhetnek.", "Robotok, rakéták, holnap."] }
  } : {
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
  const bR = (x, y, w, h) => [x, y, x + w, y + h];
  const ub = (...bs) => { bs = bs.filter(Boolean); return [Math.min(...bs.map(b => b[0])), Math.min(...bs.map(b => b[1])), Math.max(...bs.map(b => b[2])), Math.max(...bs.map(b => b[3]))]; };
  const tri = (cx, cy, w, h) => [[cx - w / 2, cy + h / 2], [cx, cy - h / 2], [cx + w / 2, cy + h / 2]];        /* apex up */
  const triR = (x0, cy, w, h) => [[x0, cy - h / 2], [x0 + w, cy], [x0, cy + h / 2]];                           /* apex right */
  function inPoly(x, y, p) {
    let ins = false;
    for (let i = 0, j = p.length - 1; i < p.length; j = i++) { const [xi, yi] = p[i], [xj, yj] = p[j]; if ((yi > y) !== (yj > y) && x < (xj - xi) * (y - yi) / (yj - yi) + xi) ins = !ins; }
    return ins;
  }
  const rotPt = ([x, y], a, ox, oy) => { const tt = a * Math.PI / 180, c = Math.cos(tt), s = Math.sin(tt); return [ox + (x - ox) * c - (y - oy) * s, oy + (x - ox) * s + (y - oy) * c]; };
  const ellPath = (cx, cy, rx, ry) => `M${r1(cx - rx)} ${r1(cy)}a${r1(rx)} ${r1(ry)} 0 1 0 ${r1(2 * rx)} 0a${r1(rx)} ${r1(ry)} 0 1 0 ${r1(-2 * rx)} 0Z`;

  /* shape factories: shape(...)(attrs) → svg; the same shape can be drawn filled, as the blue cutter or as a dashed ghost */
  const sR = (x, y, w, h) => a => `<rect x="${r1(x)}" y="${r1(y)}" width="${r1(w)}" height="${r1(h)}" ${a}/>`;
  const sC = (cx, cy, r) => a => `<circle cx="${r1(cx)}" cy="${r1(cy)}" r="${r1(r)}" ${a}/>`;
  const sE = (cx, cy, rx, ry, rot = 0) => a => `<ellipse cx="${r1(cx)}" cy="${r1(cy)}" rx="${r1(rx)}" ry="${r1(ry)}"${rot ? ` transform="rotate(${rot} ${r1(cx)} ${r1(cy)})"` : ""} ${a}/>`;
  const sP = pts => a => `<polygon points="${P(pts)}" ${a}/>`;
  const sD = (d, extra = "") => a => `<path d="${d}" ${extra} ${a}/>`;
  const sG = (...fs) => a => fs.map(f => f(a)).join("");
  const OUT = "#1b1b1b";                                   /* every banner shape gets this outline (Stroke paint), 1 mm; stars 0.6 mm */
  const fa0 = c => `fill="${c}"`;                          /* background: no outline */
  const fa = c => `fill="${c}" filter="url(#olf1)"`;
  const OL1 = `filter="url(#olf1)"`, OL2 = `filter="url(#olf2)"`;
  const OLG = s => `<g ${OL1}>${s}</g>`;                     /* outline the finished (cut / clipped) shape */
  const olFilter = (k, rad) => `<filter id="${k}" filterUnits="userSpaceOnUse" x="-80" y="-100" width="460" height="380" color-interpolation-filters="sRGB"><feMorphology in="SourceAlpha" operator="dilate" radius="${rad}" result="d"/><feFlood flood-color="${OUT}"/><feComposite in2="d" operator="in"/><feMerge><feMergeNode/><feMergeNode in="SourceGraphic"/></feMerge></filter>`;
  const DEFS = `<defs>${olFilter("olf1", .75)}${olFilter("olf2", .45)}</defs>`;
  const VE = `vector-effect="non-scaling-stroke"`;
  const CUT = `fill="#5fa8ff" fill-opacity=".62" stroke="#1d5fb8" stroke-width="1.2" ${VE}`;
  const SEE = c => `fill="${c}" fill-opacity=".72"`;
  const ghost = f => f(`fill="none" stroke="#1d2622" stroke-opacity=".75" stroke-width="2.6" stroke-dasharray="4 3" ${VE}`) + f(`fill="none" stroke="#fff" stroke-width="1.2" stroke-dasharray="4 3" ${VE}`);
  const ghostAt = (f, dx, dy) => `<g transform="translate(${r1(dx)} ${r1(dy)})">${ghost(f)}</g>`;
  const ctrOf = b => [(b[0] + b[2]) / 2, (b[1] + b[3]) / 2];
  const offOf = b => { const w = b[2] - b[0], h = b[3] - b[1]; return [Math.min(30, Math.max(12, w * .3)), Math.min(24, Math.max(10, h * .28))]; };

  /* ------------------------------------------------------------------ chips (under each panel) */
  const MN = {
    resize: t("Edit ▸ Resize Page to Selection", "Szerkesztés ▸ Oldal átméretezése a kijelöléshez"), dup: t("Edit ▸ Duplicate", "Szerkesztés ▸ Kettőzés"),
    align: t("Object ▸ Align and Distribute…", "Objektum ▸ Igazítás és elrendezés…"), transform: t("Object ▸ Transform…", "Objektum ▸ Transzformáció…"),
    rot90: t("Object ▸ Rotate 90° CW", "Objektum ▸ Elforgatás 90°-kal ↻ irányban"), flipH: t("Object ▸ Flip Horizontal", "Objektum ▸ Vízszintes tükrözés"),
    raise: t("Object ▸ Raise to Top", "Objektum ▸ Felülre helyezés"), group: t("Object ▸ Group", "Objektum ▸ Csoportosítás"),
    fs: t("Object ▸ Fill and Stroke…", "Objektum ▸ Kitöltés és körvonal…"), union: t("Path ▸ Union", "Útvonal ▸ Unió"), diff: t("Path ▸ Difference", "Útvonal ▸ Különbség"),
    inter: t("Path ▸ Intersection", "Útvonal ▸ Metszet"), o2p: t("Path ▸ Object to Path", "Útvonal ▸ Objektum átalakítása útvonallá"),
    putPath: t("Text ▸ Put on Path", "Szöveg ▸ Útvonalra való illesztés"), flow: t("Text ▸ Flow into Frame", "Szöveg ▸ Szöveg tördelése keretbe"),
    new: t("File ▸ New", "Fájl ▸ Új"), saveAs: t("File ▸ Save As…", "Fájl ▸ Mentés másként…"), save: t("File ▸ Save", "Fájl ▸ Mentés"),
    export: t("File ▸ Export…", "Fájl ▸ Exportálás…"), selAll: t("Edit ▸ Select All", "Szerkesztés ▸ Minden kijelölése")
  };
  const TOOLN = { rect: t("Rectangle", "Téglalap"), selector: t("Selector", "Kijelölő"), ellipse: t("Ellipse", "Ellipszis"), star: t("Star/Polygon", "Csillag és sokszög"), text: t("Text", "Szöveg"), node: t("Node", "Csomópont") };
  const T = k => `<img class="ti" src="../img/common/tools/${k}.png" alt="${TOOLN[k]} ${t("tool", "eszköz")}" title="${TOOLN[k]} ${t("tool", "eszköz")}">`;
  const M = k => `<span class="menu">${MN[k] || k}</span>`;
  const K = k => `<span class="key">${k}</span>`;
  const C = h => `<span class="chex"><span class="sw" style="--c:${h}"></span><code class="hex">${hex6(h)}ff</code></span>`;
  const SZ = (w, h) => `<span class="nums" title="${t("Width, height (mm)", "Szélesség, magasság (mm)")}">${t("W", "Sz")} ${mm(w)} · ${t("H", "M")} ${mm(h)}</span>`;
  const ALN = HU
    ? { left: "Bal élek igazítása", cv: "Középre igazítás a függőleges tengelyhez", right: "Jobb élek igazítása", top: "Felső élek igazítása", ch: "Középre igazítás a vízszintes tengelyhez", bottom: "Alsó élek igazítása", dh: "Vízszintes elrendezés egyenletes térközökkel a középpontok között" }
    : { left: "Align left edges", cv: "Center on vertical axis", right: "Align right edges", top: "Align top edges", ch: "Center on horizontal axis", bottom: "Align bottom edges", dh: "Distribute centers horizontally" };
  const ALI = { left: "al-left", cv: "al-cv", right: "al-right", top: "al-top", ch: "al-ch", bottom: "al-bottom", dh: "di-ch" };
  const AL = (...k) => `<span class="align">${k.map(x => `<img class="ai" src="../img/common/tools/${ALI[x]}.png" alt="${ALN[x]}" title="${ALN[x]}">`).join("")}</span>`;
  const CENTRE = AL("cv", "ch");
  const MV = (dx, dy) => {
    const p = [];
    if (Math.round(dx)) p.push(`${dx > 0 ? "→" : "←"} ${dx > 0 ? "+" : "−"}${Math.abs(Math.round(dx))}`);
    if (Math.round(dy)) p.push(`${dy > 0 ? "↓" : "↑"} ${dy > 0 ? "+" : "−"}${Math.abs(Math.round(dy))}`);
    return `${M("transform")} <span class="nums" title="${t("Move, Relative move (mm)", "Áthelyezés, Relatív áthelyezés (mm)")}">${p.join("  ")}</span>`;
  };
  const ROT = (deg, ccw) => `${M("transform")} <span class="nums" title="${t("Rotate", "Forgatás")}">${ccw ? "↺" : "↻"} ${deg}°</span>`;
  const STARB = (mode, n, ratio) => `<span class="nums">${mode === "poly" ? t("Polygon", "Sokszög") : t("Star", "Csillag")} · ${t("Corners", "Csúcsok")} ${n}${ratio ? ` · ${t("Spoke ratio", "Ágarány")} ${ratio}` : ""}</span>`;
  const NOX = `<span class="chipx" title="${t("Stroke paint: X", "Körvonalrajzolat: X")}">${t("stroke", "körvonal")} ✕</span>`;
  const NOFILL = `<span class="chipx" title="${t("Fill: X", "Kitöltés: X")}">${t("fill", "kitöltés")} ✕</span>`;
  const STROKE = (h, w) => `<span class="chex"><span class="sw ring" style="--c:${h}"></span><code class="hex">${hex6(h)}ff</code></span><span class="nums">${w} mm</span>`;
  const OLC = (w = 1) => `<span class="chex" title="${t("Outline: Stroke paint + Stroke style", "Körvonal: Körvonalrajzolat + Körvonalstílus")}"><span class="sw ring" style="--c:${OUT}"></span><span class="nums">${w} mm</span></span>`;
  const CO = h => C(h) + OLC();
  const TXT = s => `<span class="txt">${esc(s)}</span>`;
  const PT = v => `<span class="nums">${Math.round(v / 0.3528)} pt</span>`;
  const TIMES = n => `<span class="nums">× ${n}</span>`;
  const LB = s => `<span class="lb2">${s}</span>`;
  const TO = `<i class="sep">→</i>`, PLUS = `<i class="sep">+</i>`;
  const ST = n => t(`${n} objects selected`, `${n} objektum kijelölve`);
  const pt = v => Math.round(v / 0.3528);

  /* ------------------------------------------------------------------ the generator */
  const LAYOUTS = [                         /* [rule][trad] */
    ["border", "chevron", "triangle", "cross", "diagonal"],
    ["border", "triangle", "chevron", "diagonal", "bi-h"],
    ["cross", "tri-h", "wave", "tri-v", "diagonal"],
    ["canton", "tri-h", "wave", "tri-v", "bi-h"],
    ["canton", "tri-v", "wave", "tri-h", "diagonal"]
  ];
  const LAYOUT_NAME = HU
    ? { "tri-h": "vízszintes trikolór", "tri-v": "függőleges trikolór", "bi-h": "kétsávos zászló", cross: "középkereszt", triangle: "rúd melletti háromszög", diagonal: "átlós sáv", canton: "kanton (sarokmező)", border: "szegélyes mező", chevron: "ék (chevron)", wave: "hullám" }
    : { "tri-h": "horizontal tricolour", "tri-v": "vertical tricolour", "bi-h": "two stripes", cross: "centre cross", triangle: "hoist triangle", diagonal: "diagonal band", canton: "canton", border: "bordered field", chevron: "chevron", wave: "wave" };
  const FRAME_NAME = HU ? ["fogaskerék-gyűrű", "gyűrű", "körvonalas korong", "kerek pajzs", "csúcsos pajzs"] : ["a cog ring", "a ring", "a disc with an outline", "a round shield", "a pointed shield"];
  const BEHIND_NAME = HU ? ["napsugár", "szélrózsa", "glória", "keresztbe tett rudak", "keresztbe tett pengék"] : ["a sunburst", "a compass star", "a halo", "crossed bars", "crossed blades"];

  function motto(a) {
    const B = (PRIDE[a.pride] || PRIDE.freedom).word;
    if (HU) {
      const A = ["Engedelmesség", "Rend", "Egység", "Szabadság", "Demokrácia"][a.rule], Cw = ["Hagyomány", "Becsület", "Egyensúly", "Haladás", "Jövő"][a.trad];
      const D = ["Béke", "Nyugalom", "Éberség", "Erő", "Győzelem"][a.army], E = ["a Munkásoknak", "a Népnek", "Mindenkinek", "a Vállalkozásnak", "a Piacnak"][a.econ];
      return { palace: `${A}, ${B}, ${D}`, uprising: `${B} ${E}`, parade: `${A} által ${D}`, lottery: `${Cw} és ${B}` }[a.takeover] || `${A} és ${B}`;
    }
    const A = ["Obedience", "Order", "Unity", "Liberty", "Freedom"][a.rule], Cw = ["Tradition", "Honour", "Balance", "Progress", "Tomorrow"][a.trad];
    const D = ["Peace", "Calm", "Vigilance", "Strength", "Victory"][a.army], E = ["the Workers", "the People", "Everyone", "Enterprise", "the Market"][a.econ];
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
    const NAME = A.name.trim().toUpperCase().slice(0, 26) || t("REPUBLIC", "KÖZTÁRSASÁG");
    const MOTTO = motto(A), MOTTO_U = MOTTO.toUpperCase();
    const arcName = rule <= 1 || (rule === 2 && army >= 3);
    const bandMotto = rule <= 2;
    const r = layout === "border" ? 36 : 34;
    const FULL = [-4, -4, 304, 184];

    const items = [], steps = {}, why = [], skills = new Set([t("Exact colours (RGBA)", "Pontos színek (RGBA)"), t("Align and Distribute", "Igazítás és elrendezés"), t("Text tool", "Szöveg eszköz")]);
    const add = (step, svg, b) => items.push({ step, svg, b });
    let F = [];
    const fr = o => F.push(o);
    const take = () => { const x = F; F = []; return x; };

    /* ---------- STEP 1: field ---------- */
    let colorAt = () => f0; let cur = "";
    const bgFrames = c => {
      cur = sR(0, 0, W, H)(fa0(c));
      fr({ svg: cur, sel: [[0, 0, W, H]], view: FULL, chips: [T("rect"), T("selector"), SZ(W, H), C(c), NOX],
        cap: t("Background rectangle: exact size and colour, no stroke.", "Háttértéglalap: pontos méret és szín, körvonal nélkül.") });
      fr({ svg: cur, page: true, view: FULL, chips: [M("resize")], cap: t("The page shrinks to the banner – everything else aligns to it.", "Az oldal a zászló méretére zsugorodik – minden más ehhez igazodik.") });
    };
    /* draw a shape, align it: ghost where it was drawn, arrow to where it lands */
    const placeF = (f, c, b, dx, dy, chips, cap, extra = {}) => {
      fr(Object.assign({ svg: cur + f(fa(c)) + ghostAt(f, dx, dy), sel: [b], arrow: [ctrOf(b)[0] + dx, ctrOf(b)[1] + dy, ...ctrOf(b)], chips, cap, view: FULL }, extra));
      cur += f(fa(c));
    };
    if (layout === "tri-h" || layout === "canton") {
      const top = layout === "canton" ? f1 : f0, mid = layout === "canton" ? f2 : f1, bot = layout === "canton" ? f1 : f2;
      add(1, sR(0, 0, W, H)(fa0(mid)), [0, 0, W, H]); add(1, sR(0, 0, W, 60)(fa(top)) + sR(0, 120, W, 60)(fa(bot)), [0, 0, W, H]);
      bgFrames(mid);
      placeF(sR(0, 0, W, 60), top, [0, 0, W, 60], 0, 55, [T("rect"), SZ(W, 60), CO(top), TO, M("align"), AL("cv", "top")], t("Top stripe, aligned to the top edge.", "Felső sáv, a felső élhez igazítva."));
      placeF(sR(0, 120, W, 60), bot, [0, 120, W, 60], 0, -120, [M("dup"), CO(bot), TO, AL("cv", "bottom")], t("Duplicate, new colour, align to the bottom edge.", "Kettőzés, új szín, igazítás az alsó élhez."));
      colorAt = (x, y) => y < 60 ? top : y < 120 ? mid : bot;
      if (layout === "canton") {
        add(1, sR(0, 0, 96, 72)(fa(f0)), [0, 0, 96, 72]); const prev = colorAt;
        placeF(sR(0, 0, 96, 72), f0, [0, 0, 96, 72], 70, 45, [T("rect"), SZ(96, 72), CO(f0), TO, AL("left", "top")], t("The canton, in the top-left corner. Stars go here later.", "A kanton a bal felső sarokba. Ide jönnek majd a csillagok."));
        colorAt = (x, y) => x < 96 && y < 72 ? f0 : prev(x, y);
      }
    }
    if (layout === "tri-v") {
      add(1, sR(0, 0, W, H)(fa0(f1)), [0, 0, W, H]); add(1, sR(0, 0, 100, H)(fa(f0)) + sR(200, 0, 100, H)(fa(f2)), [0, 0, W, H]);
      bgFrames(f1);
      placeF(sR(0, 0, 100, H), f0, [0, 0, 100, H], 70, 0, [T("rect"), SZ(100, H), CO(f0), TO, M("align"), AL("left", "ch")], t("Left stripe, aligned to the left edge.", "Bal sáv, a bal élhez igazítva."));
      placeF(sR(200, 0, 100, H), f2, [200, 0, 100, H], -200, 0, [M("dup"), CO(f2), TO, AL("right", "ch")], t("Duplicate, new colour, align to the right edge.", "Kettőzés, új szín, igazítás a jobb élhez."));
      colorAt = x => x < 100 ? f0 : x < 200 ? f1 : f2;
    }
    if (layout === "bi-h") {
      add(1, sR(0, 0, W, H)(fa0(f1)), [0, 0, W, H]); add(1, sR(0, 0, W, 90)(fa(f0)), [0, 0, W, 90]);
      bgFrames(f1);
      placeF(sR(0, 0, W, 90), f0, [0, 0, W, 90], 0, 50, [T("rect"), SZ(W, 90), CO(f0), TO, M("align"), AL("cv", "top")], t("Upper half, aligned to the top edge.", "Felső fél, a felső élhez igazítva."));
      colorAt = (x, y) => y < 90 ? f0 : f1;
    }
    if (layout === "cross") {
      add(1, sR(0, 0, W, H)(fa0(f1)), [0, 0, W, H]);
      add(1, `<path d="M0 72H300V108H0Z M132 0H168V180H132Z" fill="${f0}" ${OL1}/>`, [0, 0, W, H]);
      bgFrames(f1);
      placeF(sR(0, 72, W, 36), f0, [0, 72, W, 36], 0, 50, [T("rect"), SZ(W, 36), CO(f0), TO, M("align"), CENTRE], t("A horizontal bar, centred.", "Vízszintes rúd, középre igazítva."));
      placeF(sR(132, 0, 36, H), f0, [132, 0, 168, H], 75, 0, [T("rect"), SZ(36, H), CO(f0), TO, CENTRE], t("A vertical bar, centred.", "Függőleges rúd, középre igazítva."));
      fr({ svg: cur, sel: [[0, 72, W, 108], [132, 0, 168, H]], status: ST(2), view: FULL, chips: [T("selector"), K("Shift"), TO, M("union")], cap: t("Select both bars → Union: one cross.", "Jelöld ki a két rudat → Unió: egy kereszt.") });
      colorAt = (x, y) => (y > 72 && y < 108) || (x > 132 && x < 168) ? f0 : f1;
      skills.add(t("Union", "Unió"));
    }
    if (layout === "triangle") {
      const tt = triR(0, CY, 100, H);
      add(1, sR(0, 0, W, H)(fa0(f2)), [0, 0, W, H]); add(1, sR(0, 0, W, 90)(fa(f1)), [0, 0, W, 90]); add(1, sP(tt)(fa(f0)), [0, 0, 100, H]);
      bgFrames(f2);
      placeF(sR(0, 0, W, 90), f1, [0, 0, W, 90], 0, 50, [T("rect"), SZ(W, 90), CO(f1), TO, M("align"), AL("cv", "top")], t("Upper half, aligned to the top edge.", "Felső fél, a felső élhez igazítva."));
      const up = tri(150, 95, 70, 60);
      fr({ svg: cur + sP(up)(fa(f0)), sel: [bb(up)], view: FULL, chips: [T("star"), STARB("poly", 3)], cap: t("Star tool in Polygon mode, 3 corners: a triangle.", "Csillag eszköz, Sokszög mód, 3 csúcs: háromszög.") });
      const rt = up.map(q => rotPt(q, 90, 150, 95));
      fr({ svg: cur + sP(rt)(fa(f0)) + ghost(sP(up)), sel: [bb(rt)], view: FULL, chips: [M("rot90")], cap: t("Rotate 90°: it points right.", "Forgatás 90°-kal: jobbra mutat.") });
      fr({ svg: cur + sP(tt)(fa(f0)) + ghost(sP(rt)), sel: [[0, 0, 100, H]], arrow: [...ctrOf(bb(rt)), 33, CY], view: FULL, chips: [T("selector"), SZ(100, H), TO, AL("left", "ch")], cap: t("Exact size, aligned to the left edge.", "Pontos méret, a bal élhez igazítva.") });
      colorAt = (x, y) => inPoly(x, y, tt) ? f0 : y < 90 ? f1 : f2;
      skills.add(t("Rotate 90°", "Elforgatás 90°-kal"));
    }
    if (layout === "diagonal") {
      const flat = [[-40, 69], [340, 69], [340, 111], [-40, 111]];
      const band = flat.map(q => rotPt(q, -31, CX, CY));
      const cid = id("c");
      add(1, sR(0, 0, W, H)(fa0(f1)), [0, 0, W, H]);
      add(1, `<clipPath id="${cid}"><rect width="${W}" height="${H}"/></clipPath>` + OLG(`<polygon clip-path="url(#${cid})" points="${P(band)}" fill="${f0}"/>`), [0, 0, W, H]);
      bgFrames(f1);
      const wide = [-50, -70, 350, 250];
      fr({ svg: cur + sP(flat)(fa(f0)), sel: [bb(flat)], view: wide, chips: [T("rect"), SZ(380, 42), CO(f0), TO, M("align"), CENTRE], cap: t("A long band, centred – wider than the banner.", "Hosszú sáv, középre – szélesebb a zászlónál.") });
      fr({ svg: cur + sP(band)(fa(f0)) + ghost(sP(flat)), sel: [bb(band)], view: wide, chips: [ROT(31, true), TO, CENTRE], cap: t("Rotate 31° anticlockwise, centre again. It sticks out!", "Forgatás 31°-kal balra, újra középre. Kilóg!") });
      fr({ svg: cur + sP(band)(fa(f0)) + sR(0, 0, W, H)(CUT), sel: [[0, 0, W, H], bb(band)], status: ST(2), view: wide, chips: [M("dup"), M("raise"), PLUS, K("Shift")],
        cap: t("Duplicate the background, raise it to the top, Shift + click the band.", "Kettőzd a hátteret, hozd felülre, Shift + kattintás a sávra.") });
      const ck = id("c");
      fr({ svg: cur + `<clipPath id="${ck}"><rect width="${W}" height="${H}"/></clipPath>` + OLG(`<g clip-path="url(#${ck})">${sP(band)(fa0(f0))}</g>`), view: FULL, chips: [M("inter")], cap: t("Intersection: only the part inside the banner stays.", "Metszet: csak a zászlón belüli rész marad.") });
      colorAt = (x, y) => inPoly(x, y, band) ? f0 : f1;
      skills.add(t("Transform (rotate)", "Transzformáció (forgatás)")); skills.add(t("Intersection", "Metszet"));
    }
    if (layout === "border") {
      add(1, sR(0, 0, W, H)(fa0(f0)), [0, 0, W, H]); add(1, sR(14, 14, 272, 152)(fa(f1)), [14, 14, 286, 166]);
      bgFrames(f0);
      placeF(sR(14, 14, 272, 152), f1, [14, 14, 286, 166], 22, 16, [T("rect"), SZ(272, 152), CO(f1), TO, M("align"), CENTRE], t("Inner field, centred: a border appears all round.", "Belső mező, középre: körben megjelenik a szegély."));
      colorAt = (x, y) => x < 14 || y < 14 || x > 286 || y > 166 ? f0 : f1;
    }
    if (layout === "chevron") {
      const outer = triR(0, CY, 150, H), inner = triR(0, CY, 100, 120), cid = id("m");
      add(1, sR(0, 0, W, H)(fa0(f1)), [0, 0, W, H]);
      add(1, `<mask id="${cid}"><rect width="${W}" height="${H}" fill="#fff"/><polygon points="${P(inner)}" fill="#000"/></mask>` + OLG(`<polygon mask="url(#${cid})" points="${P(outer)}" fill="${f0}"/>`), [0, 0, 150, H]);
      bgFrames(f1);
      const small = triR(170, CY, 55, 64);
      fr({ svg: cur + sP(small)(fa(f0)), sel: [bb(small)], view: FULL, chips: [T("star"), STARB("poly", 3), TO, M("rot90")], cap: t("A 3-corner polygon, rotated 90°: it points right.", "3 csúcsú sokszög, 90°-kal elforgatva: jobbra mutat.") });
      fr({ svg: cur + sP(outer)(fa(f0)) + ghost(sP(small)), sel: [[0, 0, 150, H]], arrow: [...ctrOf(bb(small)), 50, CY], view: FULL, chips: [SZ(150, H), CO(f0), TO, M("align"), AL("left", "ch")], cap: t("Exact size, aligned to the left edge.", "Pontos méret, a bal élhez igazítva.") });
      fr({ svg: cur + sP(outer)(fa(f0)) + sP(inner)(CUT), sel: [[0, 0, 150, H], [0, 30, 100, 150]], status: ST(2), view: FULL, chips: [M("dup"), SZ(100, 120), TO, AL("left", "ch")], cap: t("Duplicate, make it smaller, align it left again.", "Kettőzés, kisebb méret, újra balra igazítva.") });
      fr({ svg: cur + `<mask id="${cid}f"><rect width="${W}" height="${H}" fill="#fff"/><polygon points="${P(inner)}" fill="#000"/></mask>` + OLG(`<polygon mask="url(#${cid}f)" points="${P(outer)}" fill="${f0}"/>`), view: FULL, chips: [T("selector"), K("Shift"), TO, M("diff")], cap: t("Select both → Difference: a chevron.", "Mindkettő kijelölve → Különbség: ék (chevron).") });
      colorAt = (x, y) => inPoly(x, y, outer) && !inPoly(x, y, inner) ? f0 : f1;
      skills.add(t("Difference", "Különbség")); skills.add(t("Rotate 90°", "Elforgatás 90°-kal"));
    }
    if (layout === "wave") {
      const xs = [32, 91, 150, 209, 268], jit = [[6, -2], [-7, 3], [4, 2], [-5, -3], [3, 1]];
      const waveSvg = `<g fill="${f1}" ${OL1}>${sR(0, 90, W, 90)("")}${xs.map(x => sE(x, 90, 32, 13)("")).join("")}</g>`;
      add(1, sR(0, 0, W, H)(fa0(f0)), [0, 0, W, H]); add(1, waveSvg, [0, 77, W, H]);
      bgFrames(f0);
      placeF(sR(0, 90, W, 90), f1, [0, 90, W, H], 0, -60, [T("rect"), SZ(W, 90), CO(f1), TO, M("align"), AL("cv", "bottom")], t("Lower half, aligned to the bottom edge.", "Alsó fél, az alsó élhez igazítva."));
      fr({ svg: cur + sE(70, 60, 32, 13)(fa(f1)), sel: [[38, 47, 102, 73]], view: FULL, chips: [T("ellipse"), SZ(64, 26), CO(f1)], cap: t("One ellipse, same colour.", "Egy ellipszis, ugyanilyen színnel.") });
      const rough = xs.map((x, i) => sE(x + jit[i][0], 90 + jit[i][1], 32, 13)(fa(f1))).join("");
      fr({ svg: cur + rough, view: FULL, chips: [M("dup"), TIMES(4)], cap: t("Duplicate it 4×, drag the 5 ellipses along the edge.", "Kettőzd 4×, húzd az 5 ellipszist a szél mentén.") });
      const even = xs.map(x => sE(x, 90, 32, 13)(fa(f1))).join("");
      fr({ svg: cur + even, sel: [[0, 77, W, 103]], status: ST(5), view: FULL, chips: [M("align"), AL("dh")], cap: t("Select the 5 ellipses → equal gaps.", "Jelöld ki az 5 ellipszist → egyenlő közök.") });
      fr({ svg: cur.replace(/<rect x="0" y="90"[^>]*\/>/, "") + waveSvg, sel: [[0, 77, W, H]], status: ST(6), view: FULL, chips: [K("Shift"), LB(t("+ lower half", "+ alsó fél")), TO, M("union")], cap: t("Add the lower half → Union: a wavy edge.", "Vedd hozzá az alsó felet → Unió: hullámos szél.") });
      colorAt = (x, y) => (y > 90 || xs.some(cx => ((x - cx) / 32) ** 2 + ((y - 90) / 13) ** 2 < 1)) ? f1 : f0;
      skills.add(t("Union", "Unió"));
    }
    steps[1] = { title: t("The field", "Az alapmező"), frames: take(),
      lead: t(`Your banner is a <b>${LAYOUT_NAME[layout]}</b>. Only the background gets exact numbers – then the page becomes the banner, and everything is aligned to it.`,
        `A zászlód: <b>${LAYOUT_NAME[layout]}</b>. Csak a háttér kap pontos számokat – utána az oldal lesz a zászló, és mindent ehhez igazítasz.`),
      stuck: [t("The Align buttons do nothing: check <i>Relative to: Page</i> at the top of the Align and Distribute panel, and that the page was resized to the banner.", "Az igazítógombok nem csinálnak semmit: nézd meg, hogy az Igazítás és elrendezés panel tetején <i>Relatív ehhez: Oldal</i> van-e, és hogy átméretezted-e az oldalt a zászlóra."),
        t("Size fields greyed out: select the shape with the Selector first. Press Enter after each number.", "Szürkék a méretmezők: előbb jelöld ki az alakzatot a Kijelölővel. Minden szám után nyomj Entert.")] };
    why.push(`<b>${SLIDERS.rule.opts[rule]}</b> + <b>${SLIDERS.trad.opts[trad]}</b> → ${LAYOUT_NAME[layout]}`);

    /* ---------- colours that depend on the field ---------- */
    const around = (R, n = 16) => uniq(Array.from({ length: n }, (_, i) => { const a = i / n * 2 * Math.PI; return colorAt(CX + R * Math.cos(a), CY + R * Math.sin(a)); }).concat([colorAt(CX, CY)]));
    const bgRing = around(r * .95);
    const frameCol = bestMulti(bgRing, cands, pal);
    const extraCol = bestMulti(around(r * 1.25), cands, pal, [frameCol]);
    const inner = econ <= 1;
    const innerCol = inner ? best(frameCol, cands, pal, [frameCol]) : null;
    const symBg = inner ? innerCol : frameCol;
    const symCol = best(symBg, cands, pal, inner ? [] : [frameCol]);
    const frameOutl = null;
    const EMB = cb(CX, CY, r * 1.55);
    const cen = (f, c, b, chips, cap, extra = {}) => {          /* draw somewhere, then centre it on the page */
      const [dx, dy] = offOf(b);
      fr(Object.assign({ svg: cur + f(c) + ghostAt(f, dx, dy), sel: [b], arrow: [ctrOf(b)[0] + dx, ctrOf(b)[1] + dy, ...ctrOf(b)], chips, cap, b: ub(b, [b[0] + dx, b[1] + dy, b[2] + dx, b[3] + dy]) }, extra));
    };

    /* ---------- STEP 2: behind the emblem (army) ---------- */
    const ec = extraCol; cur = "";
    if (army === 0) {
      const p = starPts(CX, CY, r * 1.3, .45, 24); add(2, sP(p)(fa(ec)), bb(p));
      cen(sP(p), fa(ec), bb(p), [T("star"), STARB("star", 24, "0.45"), SZ(bb(p)[2] - bb(p)[0], bb(p)[3] - bb(p)[1]), CO(ec), TO, M("align"), CENTRE], t("A 24-corner star with thin spokes, centred: a sunburst.", "24 csúcsú, vékony ágú csillag, középre: napsugár."));
    }
    if (army === 1) {
      const p = starPts(CX, CY, r * 1.32, .32, 8), c = r * .62;
      add(2, `<g fill="${ec}" ${OL1}>${sP(p)("")}${sC(CX, CY, c)("")}</g>`, bb(p));
      cen(sP(p), fa(ec), bb(p), [T("star"), STARB("star", 8, "0.32"), SZ(bb(p)[2] - bb(p)[0], bb(p)[3] - bb(p)[1]), CO(ec), TO, CENTRE], t("An 8-corner star, centred.", "8 csúcsú csillag, középre."));
      cur = sP(p)(fa(ec));
      cen(sC(CX, CY, c), fa(ec), cb(CX, CY, c), [T("ellipse"), SZ(2 * c, 2 * c), CO(ec), TO, CENTRE], t("A circle in the same colour, centred too.", "Ugyanilyen színű kör, szintén középre."));
      cur += sC(CX, CY, c)(fa(ec));
      fr({ svg: cur, sel: [bb(p)], status: ST(2), chips: [T("selector"), K("Shift"), TO, M("union")], cap: t("Select both → Union: a compass star.", "Mindkettő kijelölve → Unió: szélrózsa.") });
      skills.add(t("Union", "Unió"));
    }
    if (army === 2) {
      const R1 = r + 9, R2 = r + 5, cid = id("m");
      const halo = `<mask id="${cid}"><rect width="${W}" height="${H}" fill="#fff"/><circle cx="${CX}" cy="${CY}" r="${R2}" fill="#000"/></mask>` + OLG(`<circle mask="url(#${cid})" cx="${CX}" cy="${CY}" r="${R1}" fill="${ec}"/>`);
      add(2, halo, cb(CX, CY, R1));
      cen(sC(CX, CY, R1), fa(ec), cb(CX, CY, R1), [T("ellipse"), SZ(2 * R1, 2 * R1), CO(ec), TO, M("align"), CENTRE], t("A big circle, centred.", "Nagy kör, középre."));
      cur = sC(CX, CY, R1)(fa(ec));
      cen(sC(CX, CY, R2), CUT, cb(CX, CY, R2), [T("ellipse"), SZ(2 * R2, 2 * R2), TO, CENTRE], t("A slightly smaller circle on top, centred.", "Egy kicsit kisebb kör felülre, középre."), { status: ST(2) });
      fr({ svg: halo.replace(`id="${cid}"`, `id="${cid}f"`).replace(`url(#${cid})`, `url(#${cid}f)`), chips: [T("selector"), K("Shift"), TO, M("diff")], cap: t("Select both → Difference: a thin halo.", "Mindkettő kijelölve → Különbség: vékony glória.") });
      skills.add(t("Difference", "Különbség"));
    }
    if (army >= 3) {
      const len = army === 3 ? r * 2.9 : r * 2.5, th = army === 3 ? r * .24 : r * .2, tl = r * .42;
      let shape;
      if (army === 3) shape = [[CX - len / 2, CY - th / 2], [CX + len / 2, CY - th / 2], [CX + len / 2, CY + th / 2], [CX - len / 2, CY + th / 2]];
      else shape = [[CX - len / 2, CY - th / 2], [CX + len / 2 - tl, CY - th / 2], [CX + len / 2 - tl, CY - th * .95], [CX + len / 2, CY], [CX + len / 2 - tl, CY + th * .95], [CX + len / 2 - tl, CY + th / 2], [CX - len / 2, CY + th / 2]];
      const a = shape.map(q => rotPt(q, 45, CX, CY)), b2 = a.map(([x, y]) => [2 * CX - x, y]);
      add(2, `<g fill="${ec}" ${OL1}>${sP(a)("")}${sP(b2)("")}</g>`, bb([...a, ...b2]));
      const vb = ub(bb(shape), bb([...a, ...b2]));
      if (army === 3) cen(sP(shape), fa(ec), bb(shape), [T("rect"), SZ(len, th), CO(ec), TO, M("align"), CENTRE], t("A long thin bar, centred.", "Hosszú, vékony rúd, középre."), { b: vb });
      else {
        const bar = sR(CX - len / 2, CY - th / 2, len - tl, th), tip = [[CX + len / 2 - tl, CY - th * .95], [CX + len / 2, CY], [CX + len / 2 - tl, CY + th * .95]];
        fr({ svg: bar(fa(ec)) + sP(tip)(fa(ec)), sel: [bb(shape)], b: vb, chips: [T("rect"), SZ(len - tl, th), PLUS, T("star"), STARB("poly", 3), M("rot90"), SZ(tl, th * 1.9), CO(ec)], cap: t("A bar and a small triangle touching its right end.", "Egy rúd és egy kis háromszög a jobb végénél.") });
        fr({ svg: sP(shape)(fa(ec)), sel: [bb(shape)], status: ST(2), b: vb, chips: [K("Shift"), TO, M("union"), TO, CENTRE], cap: t("Union: a blade. Centre it.", "Unió: penge. Igazítsd középre.") });
      }
      fr({ svg: sP(a)(fa(ec)) + ghost(sP(shape)), sel: [bb(a)], b: vb, chips: [ROT(45)], cap: t("Rotate it 45°.", "Forgasd el 45°-kal.") });
      fr({ svg: sP(a)(fa(ec)) + sP(b2)(fa(ec)), sel: [bb(b2)], b: vb, chips: [M("dup"), M("flipH")], cap: t("Duplicate and flip horizontally: an X.", "Kettőzés és vízszintes tükrözés: egy X.") });
      fr({ svg: sP(a)(fa(ec)) + sP(b2)(fa(ec)), sel: [bb([...a, ...b2])], status: ST(2), b: vb, chips: [K("Shift"), TO, M("union"), TO, CENTRE], cap: t("Select both → Union, centre it.", "Mindkettő kijelölve → Unió, középre.") });
      skills.add(t("Union", "Unió")); skills.add(t("Transform (rotate)", "Transzformáció (forgatás)"));
    }
    steps[2] = { title: t("Behind the emblem", "A címer mögött"), frames: take(), focus: EMB,
      lead: t(`Your army level puts <b>${BEHIND_NAME[army]}</b> behind the emblem.`, `A hadsereged szintje miatt a címer mögé <b>${BEHIND_NAME[army]}</b> kerül.`),
      stuck: [t("Union or Difference greyed out: exactly the shapes you need must be selected – the status bar counts them.", "Szürke az Unió vagy a Különbség: pontosan a szükséges alakzatok legyenek kijelölve – az állapotsor megszámolja őket."),
        t("Difference cut the wrong shape: the blue one (the cutter) must be on top – Object ▸ Raise to Top.", "Rossz alakzatot vágott a Különbség: a kéknek (a vágónak) kell felül lennie – Objektum ▸ Felülre helyezés.")] };
    why.push(`<b>${SLIDERS.army.opts[army]}</b> → ${t(`${BEHIND_NAME[army]} behind the emblem`, `${BEHIND_NAME[army]} a címer mögött`)}`);

    /* ---------- STEP 3: frame (economy) ---------- */
    const fc = frameCol; cur = "";
    const outl = frameOutl ? ` stroke="${frameOutl}" stroke-width="1.5"` : "";
    let rs = r * .66, sy = CY;
    if (econ <= 1) {
      const ri = r - 8, cid = id("m");
      const outerF = econ === 0 ? sP(starPts(CX, CY, r, .86, 20)) : sC(CX, CY, r);
      const ring = `<mask id="${cid}"><rect width="${W}" height="${H}" fill="#fff"/><circle cx="${CX}" cy="${CY}" r="${ri}" fill="#000"/></mask>` + OLG(outerF(`fill="${fc}" mask="url(#${cid})"`));
      add(3, ring + sC(CX, CY, ri)(fa(innerCol)), cb(CX, CY, r));
      if (econ === 0) { const p = starPts(CX, CY, r, .86, 20); cen(outerF, fa(fc), bb(p), [T("star"), STARB("star", 20, "0.86"), SZ(bb(p)[2] - bb(p)[0], bb(p)[3] - bb(p)[1]), CO(fc), TO, M("align"), CENTRE], t("A 20-corner star with short spokes, centred.", "20 csúcsú, rövid ágú csillag, középre.")); }
      else cen(outerF, fa(fc), cb(CX, CY, r), [T("ellipse"), SZ(2 * r, 2 * r), CO(fc), TO, M("align"), CENTRE], t("A circle, centred.", "Egy kör, középre."));
      cur = outerF(fa(fc));
      cen(sC(CX, CY, ri), CUT, cb(CX, CY, ri), [T("ellipse"), SZ(2 * ri, 2 * ri), TO, CENTRE], t("A smaller circle on top, centred.", "Kisebb kör felülre, középre."), { status: ST(2) });
      const ringF = ring.replace(`id="${cid}"`, `id="${cid}f"`).replace(`url(#${cid})`, `url(#${cid}f)`);
      fr({ svg: ringF, chips: [T("selector"), K("Shift"), TO, M("diff")], cap: econ === 0 ? t("Difference: a cog ring.", "Különbség: fogaskerék-gyűrű.") : t("Difference: a ring.", "Különbség: gyűrű.") });
      cur = ringF;
      cen(sC(CX, CY, ri), fa(innerCol), cb(CX, CY, ri), [T("ellipse"), SZ(2 * ri, 2 * ri), CO(innerCol), TO, CENTRE], t("Fill the hole: one more circle, centred.", "Töltsd ki a lyukat: még egy kör, középre."));
      cur += sC(CX, CY, ri)(fa(innerCol));
      rs = ri * .86;
      skills.add(t("Difference", "Különbség"));
    }
    if (econ === 2) {
      add(3, `<circle cx="${CX}" cy="${CY}" r="${r}" fill="${fc}" stroke="${extraCol}" stroke-width="2"/>`, cb(CX, CY, r));
      cen(sC(CX, CY, r), fa(fc), cb(CX, CY, r), [T("ellipse"), SZ(2 * r, 2 * r), CO(fc), TO, M("align"), CENTRE], t("A circle, centred.", "Egy kör, középre."));
      fr({ svg: sC(CX, CY, r)(`fill="${fc}" stroke="${extraCol}" stroke-width="2"`), sel: [cb(CX, CY, r + 1)], chips: [M("fs"), STROKE(extraCol, 2)], cap: t("Stroke paint + Stroke style: a 2 mm outline.", "Körvonalrajzolat + Körvonalstílus: 2 mm-es körvonal.") });
      rs = (r - 4) * .86; skills.add(t("Fill and stroke", "Kitöltés és körvonal"));
    }
    if (econ === 3) {
      const rc = .8 * r;
      const shield = `M${r1(CX - rc)} ${r1(CY - r)}H${r1(CX + rc)}V${CY}A${r1(rc)} ${r1(rc)} 0 0 1 ${r1(CX - rc)} ${CY}Z`;
      add(3, sD(shield)(fa(fc)), [CX - rc, CY - r, CX + rc, CY + rc]);
      const rectC = sR(CX - rc, CY - r / 2, 2 * rc, r), rectU = sR(CX - rc, CY - r, 2 * rc, r);
      fr({ svg: rectC(fa(fc)) + sC(CX, CY, rc)(SEE(fc)), sel: [cb(CX, CY, rc)], chips: [T("rect"), SZ(2 * rc, r), PLUS, T("ellipse"), SZ(2 * rc, 2 * rc), CO(fc), TO, M("align"), CENTRE], cap: t("A rectangle and a circle, both centred.", "Egy téglalap és egy kör, mindkettő középre.") });
      fr({ svg: rectU(fa(fc)) + sC(CX, CY, rc)(SEE(fc)) + ghost(rectC), sel: [bR(CX - rc, CY - r, 2 * rc, r)], arrow: [CX, CY, CX, CY - r / 2], chips: [LB(t("rectangle only:", "csak a téglalap:")), MV(0, -r / 2)], cap: t("Move only the rectangle up.", "Csak a téglalapot told feljebb.") });
      fr({ svg: sD(shield)(fa(fc)), sel: [[CX - rc, CY - r, CX + rc, CY + rc]], status: ST(2), chips: [K("Shift"), TO, M("union")], cap: t("Select both → Union: a round-bottomed shield.", "Mindkettő kijelölve → Unió: kerek aljú pajzs.") });
      rs = rc * .8; sy = CY - r * .1; skills.add(t("Union", "Unió")); skills.add(t("Transform (move)", "Transzformáció (áthelyezés)"));
    }
    if (econ === 4) {
      const R = 1.6 * r, d = .8 * r, oy = -.45 * r, cA = id("c"), cB = id("c");
      const shieldSvg = (a1, a2) => `<clipPath id="${a1}"><circle cx="${r1(CX + d)}" cy="${r1(CY + oy)}" r="${r1(R)}"/></clipPath><clipPath id="${a2}"><circle cx="${r1(CX - d)}" cy="${r1(CY + oy)}" r="${r1(R)}"/></clipPath>` + OLG(`<g clip-path="url(#${a1})"><rect clip-path="url(#${a2})" x="${r1(CX - d)}" y="${r1(CY - .95 * r)}" width="${r1(2 * d)}" height="${r1(1.9 * r)}" fill="${fc}"/></g>`) + `${frameOutl ? `<path d="M${r1(CX - d)} ${r1(CY - .95 * r)}H${r1(CX + d)}V${r1(CY + .1 * r)}Q${r1(CX + d * .7)} ${r1(CY + .7 * r)} ${CX} ${r1(CY + .94 * r)}Q${r1(CX - d * .7)} ${r1(CY + .7 * r)} ${r1(CX - d)} ${r1(CY + .1 * r)}Z" fill="none" stroke="${frameOutl}" stroke-width="1.5"/>` : ""}`;
      add(3, shieldSvg(cA, cB), [CX - d, CY - .95 * r, CX + d, CY + .94 * r]);
      const big = ub(cb(CX + d, CY + oy, R), cb(CX - d, CY + oy, R));
      const cR = sC(CX + d, CY + oy, R), cL = sC(CX - d, CY + oy, R);
      fr({ svg: cR(SEE(fc)) + ghost(sC(CX, CY, R)), sel: [cb(CX + d, CY + oy, R)], arrow: [CX, CY, CX + d, CY + oy], b: big, chips: [T("ellipse"), SZ(2 * R, 2 * R), CO(fc), CENTRE, TO, MV(d, oy)], cap: t("A big circle: centre it, then move it right and up.", "Nagy kör: középre, aztán jobbra és fel.") });
      fr({ svg: cR(SEE(fc)) + cL(SEE(fc)) + ghostAt(cL, 2 * d, 0), sel: [cb(CX - d, CY + oy, R)], arrow: [CX + d, CY + oy, CX - d, CY + oy], b: big, chips: [M("dup"), TO, MV(-2 * d, 0)], cap: t("Duplicate and move the copy to the left.", "Kettőzd, és told a másolatot balra.") });
      const c1 = id("c"), c2 = id("c");
      const lens = `<clipPath id="${c1}"><circle cx="${r1(CX + d)}" cy="${r1(CY + oy)}" r="${r1(R)}"/></clipPath>` + OLG(`<g clip-path="url(#${c1})">${cL(fa0(fc))}</g>`);
      fr({ svg: lens, sel: [[CX - d - .2 * R, CY + oy - R * .6, CX + d + .2 * R, CY + oy + R * .9]], status: ST(2), b: big, chips: [K("Shift"), TO, M("inter")], cap: t("Select both circles → Intersection: a pointed lens.", "Mindkét kör kijelölve → Metszet: hegyes lencse.") });
      fr({ svg: lens.replace(new RegExp(c1, "g"), c2) + sR(CX - d, CY - .95 * r, 2 * d, 1.9 * r)(CUT), sel: [bR(CX - d, CY - .95 * r, 2 * d, 1.9 * r)], status: ST(2), b: big, chips: [T("rect"), SZ(2 * d, 1.9 * r), TO, CENTRE], cap: t("A rectangle on top, centred.", "Egy téglalap felülre, középre.") });
      const s1 = id("c"), s2 = id("c");
      fr({ svg: shieldSvg(s1, s2), sel: [[CX - d, CY - .95 * r, CX + d, CY + .94 * r]], b: big, chips: [K("Shift"), TO, M("inter")], cap: t("Intersection again: a pointed shield with a flat top.", "Újra Metszet: lapos tetejű, csúcsos pajzs.") });
      rs = d * .78; sy = CY - r * .12; skills.add(t("Intersection", "Metszet")); skills.add(t("Transform (move)", "Transzformáció (áthelyezés)"));
    }
    if (frameOutl) {
      const last = F[F.length - 1];
      fr({ svg: last.svg, sel: last.sel, b: last.b, chips: [M("fs"), STROKE(frameOutl, 1.5)], cap: t("It blends into the field – give it an outline.", "Beleolvad a mezőbe – kapjon körvonalat.") });
    }
    steps[3] = { title: t("The emblem frame", "A címer kerete"), frames: take(), focus: cb(CX, CY, r * 1.35),
      lead: t(`Your economy gives the emblem <b>${FRAME_NAME[econ]}</b>.`, `A gazdaságod miatt a címer kerete: <b>${FRAME_NAME[econ]}</b>.`),
      stuck: [t("Difference removed the wrong shape: the blue cutter must be on TOP. Undo, click it, Object ▸ Raise to Top.", "A Különbség rossz alakzatot vágott: a kék vágónak FELÜL kell lennie. Visszavonás, kattints rá, Objektum ▸ Felülre helyezés."),
        t("Transform ▸ Move went the wrong way: tick <i>Relative move</i>; + is right/down, − is left/up.", "Rossz irányba ment az áthelyezés: pipáld be a <i>Relatív áthelyezés</i> négyzetet; + = jobbra/le, − = balra/fel.")] };
    why.push(`<b>${SLIDERS.econ.opts[econ]}</b> → ${FRAME_NAME[econ]}`);

    /* ---------- STEP 4: symbol (pride) ---------- */
    const sc = symCol; let symSvg = "", symB = cb(CX, sy, rs); cur = "";
    const dy0 = sy - CY;
    const ctrChips = (dx, dy) => (Math.round(dx) || Math.round(dy + dy0)) ? [CENTRE, TO, MV(dx, dy + dy0)] : [CENTRE];
    const symF = (f, a, b, chips, cap, extra = {}) => fr(Object.assign({ svg: cur + f(a), sel: [b], chips, cap }, extra));
    if (sym === "gear") {
      const p = starPts(CX, sy, rs, .8, 12), cid = id("m");
      symSvg = `<mask id="${cid}"><rect width="${W}" height="${H}" fill="#fff"/><circle cx="${CX}" cy="${r1(sy)}" r="${r1(rs * .38)}" fill="#000"/></mask>` + OLG(`<polygon mask="url(#${cid})" points="${P(p)}" fill="${sc}"/>`); symB = bb(p);
      symF(sP(p), fa(sc), bb(p), [T("star"), STARB("star", 12, "0.8"), SZ(bb(p)[2] - bb(p)[0], bb(p)[3] - bb(p)[1]), CO(sc), TO, ...ctrChips(0, 0)], t("A 12-corner star with short spokes, centred.", "12 csúcsú, rövid ágú csillag, középre."));
      cur = sP(p)(fa(sc));
      symF(sC(CX, sy, rs * .38), CUT, cb(CX, sy, rs * .38), [T("ellipse"), SZ(rs * .76, rs * .76), TO, ...ctrChips(0, 0)], t("A small circle on top, centred.", "Kis kör felülre, középre."), { status: ST(2) });
      cur = ""; symF(() => symSvg.replace(`id="${cid}"`, `id="${cid}f"`).replace(`url(#${cid})`, `url(#${cid}f)`), "", bb(p), [K("Shift"), TO, M("diff")], t("Difference: a gear.", "Különbség: fogaskerék."));
      skills.add(t("Difference", "Különbség"));
    }
    if (sym === "sun") {
      const p = starPts(CX, sy, rs * .95, .55, 16), cid = id("c");
      const sunAll = sG(sP(p), sC(CX, sy, rs * .5));
      symSvg = `<clipPath id="${cid}"><rect width="${W}" height="${r1(sy)}"/></clipPath>` + OLG(`<g clip-path="url(#${cid})" fill="${sc}">${sunAll("")}</g>`) + `${sR(CX - rs, sy + rs * .1, 2 * rs, rs * .14)(fa(sc))}`;
      symF(sunAll, fa(sc), bb(p), [T("ellipse"), SZ(rs, rs), PLUS, T("star"), STARB("star", 16, "0.55"), SZ(bb(p)[2] - bb(p)[0], bb(p)[3] - bb(p)[1]), CO(sc)], t("A circle and a 16-corner star, same colour.", "Egy kör és egy 16 csúcsú csillag, azonos színnel."));
      symF(sunAll, fa(sc), bb(p), [...ctrChips(0, 0), TO, M("union")], t("Centre both → Union.", "Mindkettőt középre → Unió."), { status: ST(2) });
      cur = sunAll(fa(sc));
      symF(sR(CX - 1.1 * rs, sy, 2.2 * rs, 1.1 * rs), CUT, bR(CX - 1.1 * rs, sy, 2.2 * rs, 1.1 * rs), [T("rect"), SZ(2.2 * rs, 1.1 * rs), TO, ...ctrChips(0, .55 * rs)], t("A rectangle over the lower half.", "Egy téglalap az alsó félre."), { status: ST(2) });
      const c2 = id("c");
      cur = `<clipPath id="${c2}"><rect width="${W}" height="${r1(sy)}"/></clipPath>` + OLG(`<g clip-path="url(#${c2})" fill="${sc}">${sunAll("")}</g>`);
      symF(sR(CX - rs, sy + rs * .1, 2 * rs, rs * .14), fa(sc), bR(CX - rs, sy + rs * .1, 2 * rs, rs * .14), [M("diff"), PLUS, T("rect"), SZ(2 * rs, .14 * rs), ...ctrChips(0, .17 * rs)], t("Difference: the sun rises. Add a thin horizon.", "Különbség: felkel a nap. Alá egy vékony horizont."));
      skills.add(t("Union", "Unió")); skills.add(t("Difference", "Különbség"));
    }
    if (sym === "waves") {
      const cid = id("m"), ys = [-.44, 0, .44];
      symSvg = `<mask id="${cid}"><rect width="${W}" height="${H}" fill="#fff"/>${ys.map(k => sE(CX, sy + k * rs, rs * 1.2, rs * .11)(`fill="#000"`)).join("")}</mask>` + OLG(`<circle mask="url(#${cid})" cx="${CX}" cy="${r1(sy)}" r="${r1(rs)}" fill="${sc}"/>`);
      symF(sC(CX, sy, rs), fa(sc), cb(CX, sy, rs), [T("ellipse"), SZ(2 * rs, 2 * rs), CO(sc), TO, ...ctrChips(0, 0)], t("A circle, centred.", "Egy kör, középre."));
      cur = sC(CX, sy, rs)(fa(sc));
      const ells = sG(...ys.map(k => sE(CX, sy + k * rs, rs * 1.2, rs * .11)));
      symF(ells, CUT, bR(CX - 1.2 * rs, sy - .55 * rs, 2.4 * rs, 1.1 * rs), [T("ellipse"), SZ(2.4 * rs, .22 * rs), ...ctrChips(0, 0), TO, M("dup"), MV(0, -.44 * rs), M("dup"), MV(0, .88 * rs)], t("A flat ellipse, centred; duplicate it up and down.", "Lapos ellipszis középre; kettőzd fel és le."));
      cur = ""; symF(() => symSvg.replace(`id="${cid}"`, `id="${cid}f"`).replace(`url(#${cid})`, `url(#${cid}f)`), "", cb(CX, sy, rs), [M("union"), LB(t("3 ellipses", "3 ellipszis")), TO, M("diff")], t("Union the ellipses, then Difference: waves.", "Az ellipszisek Uniója, aztán Különbség: hullámok."));
      skills.add(t("Union", "Unió")); skills.add(t("Difference", "Különbség"));
    }
    if (sym === "mountains") {
      const big = tri(CX - .25 * rs, sy, 1.6 * rs, 1.3 * rs), small = tri(CX + .45 * rs, sy + .225 * rs, 1.1 * rs, .85 * rs), cid = id("c");
      const mts = sG(sP(big), sP(small));
      symSvg = `<clipPath id="${cid}"><circle cx="${CX}" cy="${r1(sy)}" r="${r1(rs)}"/></clipPath>` + OLG(`<g clip-path="url(#${cid})" fill="${sc}">${mts("")}</g>`);
      symF(mts, fa(sc), bb([...big, ...small]), [T("star"), STARB("poly", 3), SZ(1.6 * rs, 1.3 * rs), PLUS, SZ(1.1 * rs, .85 * rs), CO(sc), TO, M("union")], t("A big and a small triangle → Union: mountains.", "Egy nagy és egy kis háromszög → Unió: hegyek."));
      cur = mts(fa(sc));
      symF(sC(CX, sy, rs), CUT, cb(CX, sy, rs), [T("ellipse"), SZ(2 * rs, 2 * rs), TO, ...ctrChips(0, 0)], t("A circle on top, centred.", "Egy kör felülre, középre."), { status: ST(2) });
      cur = ""; symF(() => symSvg.replace(`id="${cid}"`, `id="${cid}f"`).replace(`url(#${cid})`, `url(#${cid}f)`), "", cb(CX, sy, rs), [K("Shift"), TO, M("inter")], t("Intersection: mountains in a round window.", "Metszet: hegyek kerek ablakban."));
      skills.add(t("Union", "Unió")); skills.add(t("Intersection", "Metszet"));
    }
    if (sym === "tree") {
      const parts = [[1.0, .8, -.5], [1.3, .9, -.12], [1.6, 1.0, .3]].map(([w, h, o]) => tri(CX, sy + o * rs, w * rs, h * rs));
      const tr = sR(CX - .14 * rs, sy + .7 * rs, .28 * rs, .3 * rs);
      const tris = sG(...parts.map(p => sP(p)));
      symSvg = `<g fill="${sc}" ${OL1}>${tris("")}${tr("")}</g>`; symB = [CX - .8 * rs, sy - .9 * rs, CX + .8 * rs, sy + rs];
      symF(tris, fa(sc), bb(parts.flat()), [T("star"), STARB("poly", 3), SZ(rs, .8 * rs), SZ(1.3 * rs, .9 * rs), SZ(1.6 * rs, rs), CO(sc)], t("Three triangles, each centred, then moved down a bit more.", "Három háromszög, mind középre, aztán egyre lejjebb tolva."));
      cur = tris(fa(sc));
      symF(tr, fa(sc), bR(CX - .14 * rs, sy + .7 * rs, .28 * rs, .3 * rs), [T("rect"), SZ(.28 * rs, .3 * rs), TO, ...ctrChips(0, .85 * rs)], t("A small trunk under them.", "Alájuk egy kis törzs."));
      cur = ""; symF(() => symSvg, "", symB, [M("selAll"), TO, M("union")], t("Select all four → Union: one tree.", "Mind a négy kijelölve → Unió: egy fa."), { status: ST(4) });
      skills.add(t("Union", "Unió"));
    }
    if (sym === "atom") {
      const ring0 = sD(`${ellPath(CX, sy, rs, rs * .38)} ${ellPath(CX, sy, rs * .86, rs * .25)}`, `fill-rule="evenodd"`);
      const rings = [0, 60, 120].map(a => `<g transform="rotate(${a} ${CX} ${r1(sy)})">${ring0(fa(sc))}</g>`);
      symSvg = `<g fill="${sc}" ${OL1}>${[0, 60, 120].map(a => `<g transform="rotate(${a} ${CX} ${r1(sy)})">${ring0("")}</g>`).join("")}${sC(CX, sy, rs * .18)("")}</g>`;
      symF(sE(CX, sy, rs, rs * .38), fa(sc), bR(CX - rs, sy - .38 * rs, 2 * rs, .76 * rs), [T("ellipse"), SZ(2 * rs, .76 * rs), CO(sc), TO, ...ctrChips(0, 0)], t("A flat ellipse, centred.", "Lapos ellipszis, középre."));
      cur = sE(CX, sy, rs, rs * .38)(fa(sc));
      symF(sE(CX, sy, rs * .86, rs * .25), CUT, bR(CX - .86 * rs, sy - .25 * rs, 1.72 * rs, .5 * rs), [T("ellipse"), SZ(1.72 * rs, .5 * rs), TO, ...ctrChips(0, 0), TO, M("diff")], t("A thinner one on top → Difference: an orbit.", "Egy vékonyabb felülre → Különbség: pálya."), { status: ST(2) });
      cur = rings[0];
      symF(() => rings[1] + rings[2], "", cb(CX, sy, rs), [M("dup"), ROT(60), TO, M("dup"), ROT(60)], t("Duplicate + rotate 60°, twice: three orbits.", "Kettőzés + forgatás 60°-kal, kétszer: három pálya."));
      cur = rings.join("");
      symF(sC(CX, sy, rs * .18), fa(sc), cb(CX, sy, rs * .18), [T("ellipse"), SZ(.36 * rs, .36 * rs), ...ctrChips(0, 0), TO, M("selAll"), M("union")], t("A nucleus in the middle, then Union all.", "Atommag középre, aztán mindet Unióba."));
      skills.add(t("Difference", "Különbség")); skills.add(t("Union", "Unió")); skills.add(t("Transform (rotate)", "Transzformáció (forgatás)"));
    }
    if (sym === "crown") {
      const base = [CX - .8 * rs, sy + .1 * rs, CX + .8 * rs, sy + .6 * rs];
      const tips = [-.55, 0, .55].map(k => tri(CX + k * rs, sy - .2 * rs, .6 * rs, .85 * rs));
      const holes = [-.5, 0, .5].map(k => [CX + k * rs, sy + .35 * rs]), cid = id("m");
      const crownF = sG(sR(base[0], base[1], base[2] - base[0], base[3] - base[1]), ...tips.map(p => sP(p)));
      symSvg = `<mask id="${cid}"><rect width="${W}" height="${H}" fill="#fff"/>${holes.map(([x, y]) => sC(x, y, rs * .11)(`fill="#000"`)).join("")}</mask>` + OLG(`<g mask="url(#${cid})" fill="${sc}">${crownF("")}</g>`);
      symB = [base[0], sy - .63 * rs, base[2], base[3]];
      symF(sR(base[0], base[1], base[2] - base[0], base[3] - base[1]), fa(sc), base, [T("rect"), SZ(1.6 * rs, .5 * rs), CO(sc), TO, ...ctrChips(0, .35 * rs)], t("The crown's band.", "A korona pántja."));
      cur = sR(base[0], base[1], base[2] - base[0], base[3] - base[1])(fa(sc));
      symF(sG(...tips.map(p => sP(p))), fa(sc), bb(tips.flat()), [T("star"), STARB("poly", 3), SZ(.6 * rs, .85 * rs), TIMES(3), TO, MV(.55 * rs, 0)], t("Three triangles on top, moved apart with Transform.", "Három háromszög a tetejére, Transzformációval széthúzva."));
      cur = crownF(fa(sc));
      symF(sG(...holes.map(([x, y]) => sC(x, y, rs * .11))), CUT, bb(holes.map(([x, y]) => [x, y]).flatMap(([x, y]) => [[x - rs * .11, y - rs * .11], [x + rs * .11, y + rs * .11]])), [M("union"), PLUS, T("ellipse"), SZ(.22 * rs, .22 * rs), TIMES(3)], t("Union the crown; three small circles on the band.", "A korona Uniója; három kis kör a pántra."));
      cur = ""; symF(() => symSvg.replace(`id="${cid}"`, `id="${cid}f"`).replace(`url(#${cid})`, `url(#${cid}f)`), "", symB, [M("union"), LB(t("circles", "körök")), TO, M("diff")], t("Union the circles, then Difference: jewel holes.", "A körök Uniója, aztán Különbség: lyukak a drágaköveknek."));
      skills.add(t("Union", "Unió")); skills.add(t("Difference", "Különbség"));
    }
    if (sym === "crescent") {
      const c1 = [CX - .15 * rs, sy, .78 * rs], c2 = [CX + .12 * rs, sy - .08 * rs, .65 * rs], st = starPts(CX + .5 * rs, sy, .3 * rs, .4, 5), cid = id("m");
      const cres = k => `<mask id="${k}"><rect width="${W}" height="${H}" fill="#fff"/><circle cx="${r1(c2[0])}" cy="${r1(c2[1])}" r="${r1(c2[2])}" fill="#000"/></mask>` + OLG(`<circle mask="url(#${k})" cx="${r1(c1[0])}" cy="${r1(c1[1])}" r="${r1(c1[2])}" fill="${sc}"/>`);
      symSvg = cres(cid) + sP(st)(fa(sc));
      symF(sC(...c1), fa(sc), cb(...c1), [T("ellipse"), SZ(1.56 * rs, 1.56 * rs), CO(sc), TO, ...ctrChips(-.15 * rs, 0)], t("A circle, slightly left of centre.", "Egy kör, kicsit balra a középtől."));
      cur = sC(...c1)(fa(sc));
      symF(sC(...c2), CUT, cb(...c2), [T("ellipse"), SZ(1.3 * rs, 1.3 * rs), TO, ...ctrChips(.12 * rs, -.08 * rs)], t("A second circle on top, a bit to the right.", "Második kör felülre, kicsit jobbra."), { status: ST(2) });
      cur = cres(cid + "f");
      symF(sP(st), fa(sc), bb(st), [M("diff"), PLUS, T("star"), STARB("star", 5, "0.4"), SZ(bb(st)[2] - bb(st)[0], bb(st)[3] - bb(st)[1]), ...ctrChips(.5 * rs, 0)], t("Difference: a crescent. Add a small star beside it.", "Különbség: holdsarló. Mellé egy kis csillag."));
      cur = ""; symF(() => cres(cid + "g") + sP(st)(fa(sc)), "", cb(CX, sy, rs), [K("Shift"), TO, M("union")], t("Crescent + star → Union.", "Holdsarló + csillag → Unió."), { status: ST(2) });
      skills.add(t("Difference", "Különbség")); skills.add(t("Union", "Unió"));
    }
    if (sym === "star") {
      const p = starPts(CX, sy + rs * .05, rs, .4, 5), q = starPts(CX, sy + rs * .05, rs * .55, .4, 5), cid = id("m");
      symSvg = `<mask id="${cid}"><rect width="${W}" height="${H}" fill="#fff"/><polygon points="${P(q)}" fill="#000"/></mask>` + OLG(`<polygon mask="url(#${cid})" points="${P(p)}" fill="${sc}"/>`); symB = bb(p);
      symF(sP(p), fa(sc), bb(p), [T("star"), STARB("star", 5, "0.4"), SZ(bb(p)[2] - bb(p)[0], bb(p)[3] - bb(p)[1]), CO(sc), TO, ...ctrChips(0, 0)], t("A 5-corner star, centred.", "5 csúcsú csillag, középre."));
      cur = sP(p)(fa(sc));
      symF(sP(q), CUT, bb(q), [M("dup"), SZ(bb(q)[2] - bb(q)[0], bb(q)[3] - bb(q)[1]), TO, ...ctrChips(0, 0)], t("Duplicate, smaller, centred again.", "Kettőzés, kisebbre, újra középre."), { status: ST(2) });
      cur = ""; symF(() => symSvg.replace(`id="${cid}"`, `id="${cid}f"`).replace(`url(#${cid})`, `url(#${cid}f)`), "", bb(p), [K("Shift"), TO, M("diff")], t("Difference: a star outline.", "Különbség: csillagkörvonal."));
      skills.add(t("Difference", "Különbség"));
    }
    add(4, symSvg, symB);
    steps[4] = { title: t("Your national symbol", "A nemzeti jelkép"), frames: take(), focus: cb(CX, sy, rs * 1.25),
      lead: t(`Your nation is proud of <b>${PRIDE[A.pride].label.toLowerCase()}</b>: the symbol is <b>${SYM_NAME[sym]}</b>.`, `A nemzeted büszkesége: <b>${PRIDE[A.pride].label.toLowerCase()}</b>, ezért a jelkép: <b>${SYM_NAME[sym]}</b>.`),
      stuck: [t("Typing W and H moved the shape: that's normal – centre it again afterwards.", "Az Sz és M beírása elmozdította az alakzatot: ez normális – utána igazítsd újra középre."),
        t("The cut went wrong: the blue cutter must be on top (Object ▸ Raise to Top).", "Rosszul sikerült a vágás: a kék vágó legyen felül (Objektum ▸ Felülre helyezés).")] };
    why.push(`<b>${PRIDE[A.pride].label}</b> → ${SYM_NAME[sym]}`);

    /* ---------- STEP 5: provinces ---------- */
    const starPos = [];
    const sR5 = layout === "canton" ? (N > 6 ? 4 : 5) : 5;
    if (layout === "canton") {
      const rows = N > 5 ? 2 : 1, perRow = Math.ceil(N / rows);
      for (let i = 0; i < N; i++) { const rr = Math.floor(i / perRow), cc = i % perRow, inRow = Math.min(perRow, N - rr * perRow); starPos.push([48 + (cc - (inRow - 1) / 2) * 16, 36 + (rr - (rows - 1) / 2) * 20]); }
    } else {
      const gap = Math.min(16, 200 / Math.max(1, N));
      for (let i = 0; i < N; i++) starPos.push([CX + (i - (N - 1) / 2) * gap, 141]);
    }
    const starBgs = layout === "canton" ? [f0] : uniq(starPos.map(([x, y]) => colorAt(x, y)));
    const starCol = bestMulti(starBgs, cands, pal);
    const starOutl = null;
    const starA = `fill="${starCol}" ${OL2}`;
    const starAt = (x, y) => sP(starPts(x, y, sR5, .4, 5));
    starPos.forEach(([x, y]) => add(5, starAt(x, y)(starA), bb(starPts(x, y, sR5, .4, 5))));
    const s1 = bb(starPts(0, 0, sR5, .4, 5));
    const rowB = ub(...starPos.map(([x, y]) => cb(x, y, sR5 + 1)));
    const focus5 = layout === "canton" ? [0, 0, 96, 72] : ub(rowB, [CX - 60, 120, CX + 60, 160]);
    const jit5 = starPos.map(([x, y], i) => [x + [3, -4, 2, -2, 4, -3, 1, -4, 3][i % 9], y + [-3, 2, 4, -2, 1, 3, -4, 2, -1][i % 9]]);
    cur = "";
    fr({ svg: starAt(...(layout === "canton" ? starPos[0] : [CX, 141]))(starA), sel: [cb(...(layout === "canton" ? starPos[0] : [CX, 141]), sR5 + 1)],
      chips: [T("star"), STARB("star", 5, "0.4"), SZ(s1[2] - s1[0], s1[3] - s1[1]), C(starCol), OLC(.6)], cap: t("One small star.", "Egy kis csillag.") });
    if (N > 1) {
      fr({ svg: jit5.map(([x, y]) => starAt(x, y)(starA)).join(""), chips: [M("dup"), TIMES(N - 1)], cap: layout === "canton" ? t("Duplicate it and drag the copies into the canton.", "Kettőzd, és húzd a másolatokat a kantonba.") : t("Duplicate it and drag the copies into a row.", "Kettőzd, és húzd a másolatokat egy sorba.") });
      fr({ svg: starPos.map(([x, y]) => starAt(x, y)(starA)).join(""), sel: [rowB], status: ST(N), chips: N >= 3 ? [M("selAll"), TO, M("align"), AL("dh")] : [LB(t("drag by eye", "szemre igazítva"))], cap: N >= 3 ? t("Select all the stars → equal gaps.", "Jelöld ki az összes csillagot → egyenlő közök.") : t("Two stars: just line them up by eye.", "Két csillag: csak állítsd őket szemre egy vonalba.") });
      if (layout !== "canton") fr({ svg: starPos.map(([x, y]) => starAt(x, y)(starA)).join(""), sel: [rowB], chips: [M("group"), TO, AL("cv")], cap: t("Group them and centre the row.", "Csoportosítsd, és igazítsd középre a sort.") });
    } else fr({ svg: starAt(...starPos[0])(starA), sel: [cb(...starPos[0], sR5 + 1)], chips: layout === "canton" ? [LB(t("drag", "húzás"))] : [AL("cv")], cap: layout === "canton" ? t("Drag it into the middle of the canton.", "Húzd a kanton közepére.") : t("Centre it under the emblem.", "Igazítsd középre a címer alatt.") });
    steps[5] = { title: N === 1 ? t("One province, one star", "Egy tartomány, egy csillag") : t(`${N} provinces, ${N} stars`, `${N} tartomány, ${N} csillag`), frames: take(), focus: focus5,
      lead: layout === "canton" ? t("Your provinces shine in the canton.", "A tartományaid a kantonban ragyognak.") : t("Your provinces line up under the emblem.", "A tartományaid a címer alatt sorakoznak."),
      stuck: [t("All copies sit on top of each other: Duplicate puts the copy exactly on the original – just drag it away.", "Minden másolat egymáson ül: a Kettőzés pontosan az eredetire teszi a másolatot – csak húzd arrébb."),
        t("Distribute did nothing: it needs at least 3 objects selected.", "Az elrendezés nem csinált semmit: legalább 3 objektum kell hozzá.")] };
    why.push(t(`<b>${N} province${N > 1 ? "s" : ""}</b> → ${N} star${N > 1 ? "s" : ""}`, `<b>${N} tartomány</b> → ${N} csillag`));

    /* ---------- STEP 6: name ---------- */
    const dx = {}; cur = "";
    const nameTxt = (x, y, fs, col, out, extra = "") => `<text x="${r1(x)}" y="${r1(y)}" text-anchor="middle" font-family="${FONT_B}" font-weight="900" font-size="${r1(fs)}" fill="${col}"${out ? ` stroke="${out}" stroke-width="1.1" paint-order="stroke" stroke-linejoin="round"` : ""}${extra}>${esc(NAME)}</text>`;
    if (arcName) {
      const R0 = (army >= 3 ? r * 1.45 : army === 2 ? r + 9 : army === 0 ? r * 1.3 : r * 1.32) + 6;
      const em = emWidth(NAME, FONT_B, 900) + .05 * NAME.length;
      let Rn = Math.min(Math.max(R0, 7 * em / (Math.PI * .9)), CX - 9, CY - 12);
      let fs = Math.min(13, Math.PI * Rn * .9 / em);
      if (CY - Rn - fs * .85 < 3) { Rn = CY - 3 - fs * .85; fs = Math.min(fs, Math.PI * Rn * .9 / em); }
      const nBgs = uniq(Array.from({ length: 13 }, (_, i) => { const a = Math.PI * (1 + i / 12); return colorAt(CX + (Rn + fs * .35) * Math.cos(a), CY + (Rn + fs * .35) * Math.sin(a)); }));
      const nameCol = bestMulti(nBgs, cands, pal), nOut = OUT;
      const arcText = pid => `<path id="${pid}" d="M${r1(CX - Rn)} ${CY} A${r1(Rn)} ${r1(Rn)} 0 0 1 ${r1(CX + Rn)} ${CY}" fill="none"/><text font-family="${FONT_B}" font-weight="900" font-size="${r1(fs)}" fill="${nameCol}" letter-spacing="${r1(fs * .05)}"${nOut ? ` stroke="${nOut}" stroke-width="1.1" paint-order="stroke" stroke-linejoin="round"` : ""}><textPath href="#${pid}" startOffset="50%" text-anchor="middle">${esc(NAME)}</textPath></text>`;
      add(6, arcText(id("arc")), [CX - Rn - fs, CY - Rn - fs, CX + Rn + fs, CY]);
      const helper = sC(CX, CY, Rn)(`fill="none" stroke="#1d2622" stroke-width="3" ${VE}`) + sC(CX, CY, Rn)(`fill="none" stroke="#5fa8ff" stroke-width="1.6" ${VE}`);
      const B6s = [CX - Rn - fs, CY - Rn - fs - 2, CX + Rn + fs, CY + Rn + 4], B6 = [CX - Rn - fs, CY - Rn - fs - 2, CX + Rn + fs, Math.max(CY + Rn + 4, H + 16)];
      fr({ svg: helper, sel: [cb(CX, CY, Rn)], b: B6s, chips: [T("ellipse"), SZ(2 * Rn, 2 * Rn), NOFILL, TO, M("align"), CENTRE], cap: t("A helper circle around the emblem, centred, no fill.", "Segédkör a címer körül, középre, kitöltés nélkül.") });
      fr({ svg: helper + `<circle cx="${r1(CX - Rn)}" cy="${CY}" r="${r1(Rn * .09 + 2)}" fill="#ffd60a" stroke="#1d2622" stroke-width="2" ${VE}/>`, b: B6s, chips: [M("o2p"), TO, M("rot90"), TIMES(2)], cap: t("Object to Path, rotate twice: the path now starts at the yellow dot.", "Útvonallá alakítás, kétszer forgatás: az útvonal most a sárga pontnál kezdődik.") });
      const ty = H + 12;
      fr({ svg: helper + nameTxt(CX, ty, fs, nameCol, nOut), sel: [[CX - em * fs / 2, ty - fs * .8, CX + em * fs / 2, ty + 1]], b: B6, chips: [T("text"), TXT(NAME), PT(fs), C(nameCol), ...(nOut ? [STROKE(nOut, 1)] : [])], cap: t("Click outside the banner and type the name. Bold font.", "Kattints a zászlón kívül, és írd be a nevet. Vastag betű.") });
      fr({ svg: helper + arcText(id("arc")), sel: [cb(CX, CY, Rn + fs)], status: ST(2), b: B6s, chips: [T("selector"), K("Shift"), TO, M("putPath")], cap: t("Select the circle AND the text → Put on Path.", "Jelöld ki a kört ÉS a szöveget → Útvonalra illesztés.") });
      fr({ svg: arcText(id("arc")), b: B6s, chips: [LB(t("circle:", "kör:")), NOFILL, NOX], cap: t("Click the circle: no fill, no stroke – only the arc of letters stays.", "Kattints a körre: se kitöltés, se körvonal – csak a betűív marad.") });
      skills.add(t("Put on Path", "Útvonalra illesztés")); skills.add(t("Object to Path", "Útvonallá alakítás"));
      steps[6] = { title: t("The name, in an arc", "A név, ívben"), frames: take(), focus: B6s,
        lead: t("Your state's name curves over the emblem, like on a medal.", "Az állam neve ívben fut a címer fölött, mint egy érmén."),
        note: t("If the name isn't centred on the arc, change the size, or type spaces in front of it.", "Ha a név nincs középen az íven, állíts a méreten, vagy írj szóközöket elé."),
        stuck: [t("The text runs upside down along the bottom: the circle wasn't rotated. Undo, rotate twice, try again.", "A szöveg fejjel lefelé fut alul: nem forgattad el a kört. Visszavonás, kétszer forgatás, újra."), t("The text stops halfway: make the size smaller.", "A szöveg félúton megáll: csökkentsd a méretet.")] };
      Object.assign(dx, { nameCol, nBgs, nOut, fs });
    } else {
      const avail = layout === "canton" ? 160 : 270, nx = layout === "canton" ? 213 : CX;
      const em = emWidth(NAME, FONT_B, 900), fs = Math.min(15, avail / em), top = army <= 1 ? CY - r * 1.32 : army >= 3 ? CY - r * 1.45 : CY - r - 9;
      const ny = Math.max(fs * .8 + 6, top - 7), tw = em * fs;
      const nBgs = uniq(Array.from({ length: 9 }, (_, i) => colorAt(nx - tw / 2 + tw * i / 8, ny - fs * .35)));
      const nameCol = bestMulti(nBgs, cands, pal), nOut = OUT;
      add(6, nameTxt(nx, ny, fs, nameCol, nOut), [nx - tw / 2, ny - fs * .8, nx + tw / 2, ny]);
      const nb = [nx - tw / 2, ny - fs * .8, nx + tw / 2, ny + 1], drop = H + 6 + fs * .8 - ny, V6 = [-2, ny - fs - 4, 302, H + fs + 12];
      fr({ svg: nameTxt(nx, ny + drop, fs, nameCol, nOut), sel: [[nb[0], nb[1] + drop, nb[2], nb[3] + drop]], view: V6, chips: [T("text"), TXT(NAME), PT(fs), C(nameCol), ...(nOut ? [STROKE(nOut, 1)] : [])], cap: t("Click outside the banner and type the name. Bold font.", "Kattints a zászlón kívül, és írd be a nevet. Vastag betű.") });
      fr({ svg: nameTxt(nx, ny, fs, nameCol, nOut) + `<g transform="translate(0 ${drop})">${ghost(sR(nb[0], nb[1], tw, fs * .8 + 1))}</g>`, sel: [nb], arrow: [nx, ny + drop - fs * .3, nx, ny - fs * .3], view: V6,
        chips: layout === "canton" ? [T("selector"), LB(t("drag", "húzás"))] : [T("selector"), M("align"), AL("cv"), TO, LB(t("drag up", "húzás fel"))], cap: layout === "canton" ? t("Drag it right of the canton, above the emblem.", "Húzd a kantontól jobbra, a címer fölé.") : t("Centre it, then drag it straight up above the emblem.", "Igazítsd középre, aztán húzd egyenesen a címer fölé.") });
      steps[6] = { title: t("The name", "A név"), frames: take(), lead: t("Your state's name, plain and clear across the top.", "Az állam neve, egyszerűen és jól olvashatóan felül."), stuck: [t("Too wide: make the size smaller or pick a narrower bold font.", "Túl széles: csökkentsd a méretet, vagy válassz keskenyebb vastag betűt.")] };
      Object.assign(dx, { nameCol, nBgs, nOut, fs });
    }
    why.push(arcName ? `<b>${SLIDERS.rule.opts[rule]}</b> → ${t("the name in an arc", "a név ívben")}` : `<b>${SLIDERS.rule.opts[rule]}</b> → ${t("the name straight across the top", "a név egyenesen felül")}`);

    /* ---------- STEP 7: motto + frame ---------- */
    cur = "";
    const B7 = [20, 120, 280, 184];
    if (bandMotto) {
      const underBand = uniq(Array.from({ length: 28 }, (_, i) => 42 + i * 8).flatMap(x => [152, 160, 168].map(y => colorAt(x, y))));
      const bandCol = bestMulti(underBand, [...pal, BLACK, WHITE], pal);
      const backing = worstC(bandCol, underBand) < 2 ? best(bandCol, [WHITE, ...pal, BLACK], pal, [bandCol]) : null;
      const fs = Math.min(13, 205 / emWidth(MOTTO_U, FONT_B, 900));
      const cut = k => `<mask id="${k}"><rect width="${W}" height="${H}" fill="#fff"/><text x="${CX}" y="${r1(160 + fs * .36)}" text-anchor="middle" font-family="${FONT_B}" font-weight="900" font-size="${r1(fs)}" fill="#000">${esc(MOTTO_U)}</text></mask>${backing ? sR(40, 148, 220, 24)(fa0(backing)) : ""}<rect mask="url(#${k})" x="40" y="148" width="220" height="24" fill="${bandCol}"/>`;
      add(7, cut(id("m")), [40, 148, 260, 172]);
      const band = sR(40, 148, 220, 24);
      if (backing) fr({ svg: band(fa0(backing)) + ghostAt(band, 0, 8), sel: [[40, 148, 260, 172]], arrow: [CX, 168, CX, 160], b: B7, chips: [T("rect"), SZ(220, 24), C(backing), TO, M("align"), AL("cv", "bottom"), TO, MV(0, -8)], cap: t("First a backing strip – it will shine through the letters.", "Előbb egy háttércsík – ez látszik majd át a betűkön.") });
      cur = backing ? band(fa0(backing)) : "";
      fr({ svg: cur + band(fa0(bandCol)) + (backing ? "" : ghostAt(band, 0, 8)), sel: [[40, 148, 260, 172]], arrow: backing ? null : [CX, 168, CX, 160], b: B7, chips: [T("rect"), SZ(220, 24), C(bandCol), NOX, TO, M("align"), AL("cv", "bottom"), TO, MV(0, -8)], cap: t("The motto band: bottom-centre, then 8 mm up.", "A jelmondatsáv: alul középre, aztán 8 mm-rel feljebb.") });
      cur += band(fa0(bandCol));
      fr({ svg: cur + `<text x="${CX}" y="${r1(160 + fs * .36)}" text-anchor="middle" font-family="${FONT_B}" font-weight="900" font-size="${r1(fs)}" fill="#5fa8ff" stroke="#1d5fb8" stroke-width=".8" ${VE}>${esc(MOTTO_U)}</text>`, sel: [[CX - 104, 160 - fs * .5, CX + 104, 160 + fs * .5]], b: B7,
        chips: [T("text"), TXT(MOTTO_U), PT(fs), TO, AL("cv"), LB(t("+ drag", "+ húzás"))], cap: t("Type the motto in capitals, bold, and drag it onto the band.", "Írd be nagybetűkkel, vastagon, és húzd a sávra.") });
      fr({ svg: cut(id("m")), sel: [[40, 148, 260, 172]], status: ST(2), b: B7, chips: [M("o2p"), TO, K("Shift"), TO, M("diff")], cap: t("Check the spelling! Object to Path, then band + text → Difference.", "Helyesírás! Útvonallá alakítás, aztán sáv + szöveg → Különbség.") });
      skills.add(t("Object to Path", "Útvonallá alakítás")); skills.add(t("Difference", "Különbség"));
      Object.assign(dx, { bandCol, underBand, backing });
    } else {
      const ribCol = bestMulti(uniq([52, 100, 150, 200, 248].map(x => colorAt(x, 157))), [WHITE, ...pal, BLACK], pal);
      const txtCol = best(ribCol, cands, pal, [ribCol]);
      const fs = Math.min(10, 186 / emWidth(MOTTO, FONT_R, 700));
      const ribbon = sG(sR(60, 146, 180, 22), sC(60, 157, 11), sC(240, 157, 11));
      const mtext = (y, col, out) => `<text x="${CX}" y="${r1(y)}" text-anchor="middle" font-family="${FONT_R}" font-weight="700" font-size="${r1(fs)}" fill="${col}"${out ? ` stroke="${out}" stroke-width=".9" paint-order="stroke"` : ""}>${esc(MOTTO)}</text>`;
      add(7, `<g fill="${ribCol}" ${OL1}>${ribbon("")}</g>` + mtext(157 + fs * .36, txtCol), [49, 146, 251, 168]);
      const up = 12, rb = [49, 146, 251, 168];
      fr({ svg: sR(60, 146 + up, 180, 22)(fa(ribCol)) + sC(60, 157 + up, 11)(SEE(ribCol)) + sC(240, 157 + up, 11)(SEE(ribCol)), sel: [[49, 146 + up, 251, 168 + up]], b: ub(B7, [0, 120, 300, 194]),
        chips: [T("rect"), SZ(180, 22), PLUS, T("ellipse"), SZ(22, 22), TIMES(2), CO(ribCol)], cap: t("A rectangle and two circles on its ends.", "Egy téglalap és két kör a két végén.") });
      fr({ svg: ribbon(fa(ribCol)) + ghostAt(ribbon, 0, up), sel: [rb], arrow: [CX, 157 + up, CX, 157], b: ub(B7, [0, 120, 300, 194]), status: ST(3), chips: [M("union"), TO, M("align"), AL("cv", "bottom"), TO, MV(0, -up)], cap: t("Union: a ribbon. Bottom-centre, then 12 mm up.", "Unió: szalag. Alul középre, aztán 12 mm-rel fel.") });
      cur = ribbon(fa(ribCol));
      fr({ svg: cur + mtext(H + 12, txtCol, lum(txtCol) > .5 ? "#3b3f3d" : null), sel: [[CX - 95, H + 4, CX + 95, H + 14]], b: [20, 120, 280, H + 18], chips: [T("text"), TXT(MOTTO), PT(fs), C(txtCol)], cap: t("Type the motto beside the banner.", "Írd be a jelmondatot a zászló mellé.") });
      fr({ svg: cur + mtext(157 + fs * .36, txtCol), sel: [rb], status: ST(2), b: B7, chips: [K("Shift"), TO, M("flow"), TO, LB(t("centre the text", "középre igazítás"))], cap: t("Ribbon + text → Flow into Frame, then centre the text.", "Szalag + szöveg → Tördelés keretbe, aztán középre igazítás.") });
      skills.add(t("Union", "Unió")); skills.add(t("Flow into Frame", "Tördelés keretbe"));
      Object.assign(dx, { ribCol, txtCol });
    }
    const ew = [6, 5, 4, 3, 2][rule];
    const edgeCol = bestMulti(uniq([colorAt(2, 2), colorAt(298, 90), colorAt(150, 178)]), rule <= 2 ? [...pal, BLACK] : [WHITE, ...pal], pal);
    const edge = `<rect x="${ew / 2}" y="${ew / 2}" width="${W - ew}" height="${H - ew}" fill="none" stroke="${edgeCol}" stroke-width="${ew}"/>`;
    add(7, edge, [0, 0, W, H]);
    fr({ svg: F.length ? F[F.length - 1].svg.replace(/id="(m\d+)"/g, 'id="$1e"').replace(/url\(#(m\d+)\)/g, "url(#$1e)") + edge : edge, sel: [[0, 0, W, H]], view: FULL, chips: [T("rect"), NOFILL, STROKE(edgeCol, ew), SZ(W, H), TO, CENTRE], cap: t("Last, the frame: a rectangle with only a stroke, centred.", "Végül a keret: egy csak körvonalas téglalap, középre.") });
    skills.add(t("Fill and stroke", "Kitöltés és körvonal"));
    steps[7] = { title: bandMotto ? t("Motto band and frame", "Jelmondatsáv és keret") : t("Motto ribbon and frame", "Jelmondatszalag és keret"), frames: take(), focus: B7,
      lead: t(`Your answers wrote your motto: <b>“${esc(MOTTO)}”</b>.`, `A válaszaid megírták a jelmondatodat: <b>„${esc(MOTTO)}”</b>.`),
      stuck: bandMotto ? [t("The band vanished instead of the letters: the text must be on top (Object ▸ Raise to Top).", "A betűk helyett a sáv tűnt el: a szöveg legyen felül (Objektum ▸ Felülre helyezés)."), t("Difference greyed out: convert the text first – Path ▸ Object to Path.", "Szürke a Különbség: előbb alakítsd át a szöveget – Útvonal ▸ Objektum átalakítása útvonallá.")]
        : [t("The text sticks out: smaller size.", "Kilóg a szöveg: kisebb méret."), t("Flow into Frame does nothing: exactly 2 objects – the ribbon and the text.", "A Tördelés keretbe nem csinál semmit: pontosan 2 objektum – a szalag és a szöveg.")] };
    why.push(`<b>${TAKEOVER[A.takeover].label}</b> → ${t("the motto", "a jelmondat:")} ${t("“", "„")}${esc(MOTTO)}”`);

    const dbg = Object.assign({ bgRing, frameCol, innerCol, symBg, symCol, extraCol, starCol, starBgs, starOutl, frameOutl, starPos, sR: sR5 }, dx);
    return { items, steps, why, skills: [...skills], layout, pal, name: NAME, motto: MOTTO, N, sym, arcName, bandMotto, dbg, econ, army, rule };
  }

  /* ------------------------------------------------------------------ rendering */
  let G = 0;
  const pfx = s => { const p = "g" + (++G) + "_"; return s.replace(/(id="|url\(#|href="#)([a-z]+\d+[a-z]?)/g, (m0, a, b) => a + p + b); };
  function svg(model, upto = 7, cls = "") {
    const parts = model.items.filter(i => i.step <= upto).map(i => i.svg).join("");
    return pfx(`<svg class="banner ${cls}" viewBox="-6 -6 312 192" role="img" aria-label="${t("Banner of", "Zászló:")} ${esc(model.name)}">${DEFS}<rect x="-6" y="-6" width="312" height="192" fill="#e9e7dd"/>${parts}</svg>`);
  }
  const ASP = 5 / 3;
  function fitView(b, full) {
    if (full) return [-6, -6, 312, 192];
    let [x0, y0, x1, y1] = b; const cx = (x0 + x1) / 2, cy = (y0 + y1) / 2;
    let w = (x1 - x0) * 1.22, h = (y1 - y0) * 1.22;
    w = Math.max(w, 100); h = Math.max(h, 60);
    if (w / h < ASP) w = h * ASP; else h = w / ASP;
    return [cx - w / 2, cy - h / 2, w, h];
  }
  function arrowSvg([x1, y1, x2, y2], vw) {
    const L = Math.hypot(x2 - x1, y2 - y1); if (L < 3) return "";
    const ux = (x2 - x1) / L, uy = (y2 - y1) / L, hs = vw * .035, bx = x2 - ux * hs, by = y2 - uy * hs;
    const head = [[x2, y2], [bx - uy * hs * .6, by + ux * hs * .6], [bx + uy * hs * .6, by - ux * hs * .6]];
    const line = `M${r1(x1)} ${r1(y1)}L${r1(bx)} ${r1(by)}`;
    return `<path d="${line}" stroke="#1d2622" stroke-width="4.4" stroke-linecap="round" fill="none" ${VE}/><polygon points="${P(head)}" fill="#1d2622" stroke="#1d2622" stroke-width="2.6" stroke-linejoin="round" ${VE}/><path d="${line}" stroke="#fff" stroke-width="2" stroke-linecap="round" fill="none" ${VE}/><polygon points="${P(head)}" fill="#fff"/>`;
  }
  function frameSvg(model, n, f, focus) {
    const prev = model.items.filter(i => i.step < n).map(i => i.svg).join("");
    const isFull = v => Array.isArray(v) && v[0] === -4 && v[2] === 304;
    const vv = isFull(f.view) ? [-6, -6, 312, 192] : f.view ? fitView(f.view) : (f.b || focus) ? fitView(f.b || ub(focus, ...(f.sel || []))) : [-6, -6, 312, 192];
    const sel = (f.sel || []).map(b => { const rr = `x="${r1(b[0] - 1.5)}" y="${r1(b[1] - 1.5)}" width="${r1(b[2] - b[0] + 3)}" height="${r1(b[3] - b[1] + 3)}" fill="none" stroke-width="1.4" stroke-dasharray="5 4" ${VE}`; return `<rect ${rr} stroke="#1d2622"/><rect ${rr} stroke="#fff" stroke-dashoffset="4.5"/>`; }).join("");
    const page = f.page ? `<rect x="0" y="0" width="${W}" height="${H}" fill="none" stroke="#e0a800" stroke-width="3" stroke-dasharray="7 5" ${VE}/>` : "";
    return pfx(`<svg class="fsvg" viewBox="${vv.map(r1).join(" ")}" role="img" aria-label="${esc(f.cap.replace(/<[^>]+>/g, ""))}">${DEFS}<rect x="-2000" y="-2000" width="4300" height="4200" fill="#e9e7dd"/><rect width="${W}" height="${H}" fill="#fff"/>${prev}${f.svg}<rect width="${W}" height="${H}" fill="none" stroke="#9a978a" stroke-width="1" ${VE}/>${page}${sel}${f.arrow ? arrowSvg(f.arrow, vv[2]) : ""}</svg>`);
  }
  const MYSTERY = `<svg class="banner" viewBox="-6 -6 312 192" role="img" aria-label="${t("Hidden banner", "Rejtett zászló")}"><rect x="-6" y="-6" width="312" height="192" fill="#e9e7dd"/><rect width="300" height="180" fill="#3a3f3c"/><path d="M0 0L300 180M300 0L0 180" stroke="#4a504c" stroke-width="2"/><text x="150" y="118" text-anchor="middle" font-family="${FONT_B}" font-weight="900" font-size="96" fill="#efeee6" opacity=".85">?</text></svg>`;
  window.COUP_BUILD = build; window.COUP_SVG = svg; window.COUP_FRAME = frameSvg; window.COUP_COUNTRIES = COUNTRIES; window.COUP_CONTRAST = contrast; window.COUP_MOTTO = motto;

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
  const provTxt = n => t(`<b>${n}</b> province${n > 1 ? "s" : ""}`, `<b>${n}</b> tartomány`);
  const swatchOpts = a => a.palette.map(c => `<label class="swl"><input type="radio" name="main" value="${c}" ${close(c, a.main || a.palette[0]) ? "checked" : ""}><span style="--c:${c}" title="${c}"></span></label>`).join("");
  const sliderQ = k => ({
    id: k, title: SLIDERS[k].q, valid: a => !!a.touched[k],
    html: a => `<div class="slide5"><div class="ends"><span>${SLIDERS[k].ends[0]}</span><span>${SLIDERS[k].ends[1]}</span></div>
      <input type="range" min="0" max="4" step="1" value="${a[k]}" data-k="${k}" aria-label="${SLIDERS[k].q}">
      <div class="ticks">${SLIDERS[k].opts.map((o, i) => `<button type="button" class="tick${a[k] === i && a.touched[k] ? " on" : ""}" data-k="${k}" data-v="${i}">${o}</button>`).join("")}</div>
      <p class="pick" aria-live="polite">${a.touched[k] ? `<b>${SLIDERS[k].opts[a[k]]}</b> – ${SLIDERS[k].hints[a[k]]}` : t("Move the slider or click an option.", "Mozgasd a csúszkát, vagy kattints egy lehetőségre.")}</p></div>`
  });
  const IDEAS = HU ? ["Nova Köztársaság", "Vasszövetség", "Egyesült Tartományok", "Népi Unió", "Nagyhercegség", "Szabad Állam"] : ["Republic of Nova", "Iron Federation", "United Provinces", "People's Union", "Grand Duchy", "Free State"];
  const QUESTIONS = [
    { id: "country", title: t("Which country did you take over?", "Melyik országot foglaltad el?"), sub: t("Its flag colours become your palette.", "A zászlaja színei lesznek a palettád."), valid: a => a.palette.length > 0 && !!a.country,
      html: a => { const known = COUNTRIES.find(c => c.n === a.country); return `<select id="q-country"><option value="">${t("– choose a country –", "– válassz országot –")}</option>${COUNTRIES.map(c => `<option${c.n === a.country ? " selected" : ""}>${esc(c.n)}</option>`).join("")}<option value="__other"${a.country && !known ? " selected" : ""}>${t("Other country – I'll enter the flag colours", "Más ország – megadom a zászló színeit")}</option></select>
        <div class="custom" id="custom"${a.country && !known ? "" : " hidden"}><span>${t("Flag colours:", "A zászló színei:")}</span>${[0, 1, 2].map(i => `<input type="color" data-ci="${i}" value="${a.custom[i].toLowerCase()}" aria-label="${t("Flag colour", "Zászlószín")} ${i + 1}">`).join("")}<input type="text" id="q-cname" maxlength="30" placeholder="${t("country name", "az ország neve")}" value="${known ? "" : esc(a.country === "__other" ? "" : a.country)}"></div>
        ${a.palette.length ? `<div class="palette-show">${a.palette.map(c => `<span style="--c:${c}"></span>`).join("")}</div>` : ""}`; } },
    { id: "main", title: t("Which colour is your movement's colour?", "Melyik szín a mozgalmad színe?"), sub: t("It will lead your banner.", "Ez vezeti majd a zászlódat."), valid: a => !!a.main, html: a => `<div class="swatches big">${swatchOpts(a)}</div>` },
    { id: "name", title: t("What is your new state called?", "Mi az új államod neve?"), sub: t("Keep it short and loud.", "Legyen rövid és hangos."), valid: a => a.name.trim().length > 0,
      html: a => `<input type="text" id="q-name" maxlength="26" placeholder="${t("e.g. Iron Federation", "pl. Vasszövetség")}" value="${esc(a.name)}"><p class="qh">${t("Ideas:", "Ötletek:")} ${IDEAS.map(n => `<button type="button" class="idea" data-v="${esc(n)}">${esc(n)}</button>`).join(" ")}</p>` },
    sliderQ("rule"), sliderQ("econ"), sliderQ("army"), sliderQ("trad"),
    { id: "pride", title: t("What is your nation proud of?", "Mire büszke a nemzeted?"), valid: a => !!a.pride,
      html: a => `<div class="prides">${Object.entries(PRIDE).map(([k, p]) => `<label><input type="radio" name="pride" value="${k}" ${a.pride === k ? "checked" : ""}><span><i aria-hidden="true">${p.icon}</i>${p.label}</span></label>`).join("")}</div>` },
    { id: "provinces", title: t("How many provinces does your country have?", "Hány tartománya van az országodnak?"), valid: a => !!a.touched.provinces,
      html: a => `<div class="slide5"><div class="ends"><span>1</span><span>9</span></div><input type="range" min="1" max="9" step="1" value="${a.provinces}" data-k="provinces" aria-label="${t("Provinces", "Tartományok")}"><p class="pick big" aria-live="polite">${a.touched.provinces ? provTxt(a.provinces) : t("Move the slider.", "Mozgasd a csúszkát.")}</p></div>` },
    { id: "takeover", title: t("How did you take power?", "Hogyan kerültél hatalomra?"), sub: t("History will remember.", "A történelem emlékezni fog."), valid: a => !!a.takeover,
      html: a => `<div class="cards2 four">${Object.entries(TAKEOVER).map(([k, tk]) => `<label><input type="radio" name="takeover" value="${k}" ${a.takeover === k ? "checked" : ""}><span><i aria-hidden="true">${tk.icon}</i><b>${tk.label}</b></span></label>`).join("")}</div>` }
  ];
  const allValid = () => QUESTIONS.every(q => q.valid(A()));

  /* ------------------------------------------------------------------ page */
  const tape = `<span class="tape l" aria-hidden="true"></span><span class="tape r" aria-hidden="true"></span>`;
  const STEP_TITLES = HU ? ["Az alapmező", "A címer mögött", "A címer kerete", "A nemzeti jelkép", "Tartományok", "A név", "Jelmondat és keret"] : ["The field", "Behind the emblem", "The emblem frame", "Your national symbol", "Provinces", "The name", "Motto and frame"];
  const head = (h, p, c) => `<div class="sec-head"${c ? ` style="--c:${c}"` : ""}><h2>${h}</h2><p>${p}</p><svg viewBox="0 0 200 12" aria-hidden="true"><path d="M3 8 C 50 2, 100 12, 150 5 S 190 5, 197 7"/></svg></div>`;
  $("#app").innerHTML = `
  <header class="rail"><div class="wrap">
    <a class="logo" href="../../"><svg width="28" height="28" viewBox="0 0 30 30" aria-hidden="true"><rect x="1.5" y="3" width="27" height="20" rx="2" fill="#22362f" stroke="#fff6e8" stroke-width="2"/><path d="M7 10h9M7 15h13" stroke="#f2d264" stroke-width="2.4" stroke-linecap="round"/><path d="M9 23l-3 5M21 23l3 5" stroke="#fff6e8" stroke-width="2" stroke-linecap="round"/></svg><span>digikult</span></a>
    <nav class="dots" aria-label="${t("Steps", "Lépések")}"><span class="lbl">${t("Steps", "Lépések")}</span>${STEP_TITLES.map((s, i) => `<a href="#step-${i + 1}" data-n="${i + 1}" title="${t("Step", "Lépés")} ${i + 1}: ${s}">${i + 1}</a>`).join("")}</nav>
  </div></header>
  <main class="wrap">
    <section class="hero">
      <div>
        <p class="kicker">${t("Inkscape final project", "Inkscape-záróprojekt")}</p>
        <h1>${t("Coup!", "Puccs!")}</h1>
        <svg class="scribble" viewBox="0 0 420 22" aria-hidden="true"><path d="M4 14 C 80 4, 160 20, 240 10 S 360 6, 414 12"/></svg>
        <p class="story">${t("03:00. The palace is quiet, the old government has left by helicopter, and the TV station is yours. You are a morally grey general with a brand-new country – and no banner. Answer the questions of your command tent one by one: when the last one is answered, your banner is revealed.",
          "Hajnali 3 óra. Csend van a palotában, a régi kormány helikopterrel távozott, a tévészékház a tiéd. Erkölcsileg szürke tábornok vagy egy vadonatúj országgal – és zászló nélkül. Válaszold meg egyenként a parancsnoki sátor kérdéseit: az utolsó válasz után előkerül a zászlód.")}</p>
        <p class="disclaimer">${t("A design game: the coup is pure fiction, no real government is harmed by your SVG file.", "Tervezőjáték: a puccs színtiszta kitaláció, az SVG-fájlod egyetlen valódi kormánynak sem árt.")}</p>
        <div class="meter" aria-live="polite"><div class="row"><span>${t("Your progress", "Haladásod")}</span><b id="count"></b></div><span class="bar" id="bar">${STEP_TITLES.map(() => "<i></i>").join("")}</span></div>
        <div class="actions"><a class="btn chalk" href="#tent">${t("To the command tent ▸", "Irány a parancsnoki sátor ▸")}</a><button class="btn ghost" type="button" id="print">${t("🖨 Print my plan", "🖨 A tervem nyomtatása")}</button></div>
      </div>
      <figure class="poster flag-poster"><div id="hero-flag"></div><figcaption id="hero-cap"></figcaption></figure>
    </section>
    <section class="sec" id="tent">${head(t("The command tent", "A parancsnoki sátor"), t("One question at a time. No peeking – the banner appears at the end.", "Egyszerre egy kérdés. Nincs leskelődés – a zászló a végén jelenik meg."))}<div id="wizard"></div></section>
    <div id="work"></div>
  </main>
  <footer class="tray"><div class="wrap"><span class="sticks" aria-hidden="true"><i></i><i></i><i></i></span>
    <span>${t("Teachers:", "Tanároknak:")} <a href="../pdf/${t("coup-teacher", "coup-tanari")}.pdf" download>${t("teacher notes (PDF)", "tanári segédlet (PDF)")}</a></span>
    <button class="reset" type="button" id="reset">${t("Start over", "Újrakezdés")}</button></div></footer>`;

  /* ------------------------------------------------------------------ wizard */
  function renderWizard(focus) {
    const box = $("#wizard");
    if (S.revealed) { renderReveal(); return; }
    const q = QUESTIONS[S.q], a = A(), last = S.q === QUESTIONS.length - 1, ok = q.valid(a);
    box.innerHTML = `<article class="sheet qcard" style="--tilt:-.2deg">${tape}
      <div class="qtop"><span class="qcount">${t(`Question ${S.q + 1} of ${QUESTIONS.length}`, `${S.q + 1}. kérdés / ${QUESTIONS.length}`)}</span>
        <span class="qdots" aria-hidden="true">${QUESTIONS.map((x, i) => `<i class="${i < S.q ? "done" : i === S.q ? "cur" : ""}"></i>`).join("")}</span></div>
      <h3 class="qtitle" tabindex="-1">${q.title}</h3>${q.sub ? `<p class="lead">${q.sub}</p>` : ""}
      <div class="qbody">${q.html(a)}</div>
      <div class="qnav"><button type="button" class="btn back" id="back" ${S.q === 0 ? "disabled" : ""}>${t("◂ Back", "◂ Vissza")}</button>
        <button type="button" class="btn next" id="next" ${ok ? "" : "disabled"}>${last ? t("Reveal my banner ▸", "Mutasd a zászlómat ▸") : t("Next ▸", "Tovább ▸")}</button></div>
    </article>`;
    wire();
    if (focus) { const tt = box.querySelector(".qtitle"); if (tt) tt.focus({ preventScroll: true }); }
  }
  function refreshNav() { const q = QUESTIONS[S.q]; const n = $("#next"); if (n) n.disabled = !q.valid(A()); }
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
      box.querySelectorAll(`.tick[data-k="${k}"]`).forEach(tk => tk.classList.toggle("on", +tk.dataset.v === a[k]));
      const pk = box.querySelector(".pick");
      if (pk) pk.innerHTML = SLIDERS[k] ? `<b>${SLIDERS[k].opts[a[k]]}</b> – ${SLIDERS[k].hints[a[k]]}` : provTxt(a[k]);
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
      <p class="drum">${animate ? t("The people gather in the square…", "A nép gyülekezik a téren…") : t("Your banner", "A zászlód")}</p>
      <div class="reveal-flag">${svg(m)}</div>
      <h3 class="rname">${esc(m.name)}</h3>
      <p class="rmotto">${t("“", "„")}${esc(m.motto)}”</p>
      <ul class="why">${m.why.map(w => `<li>${w}</li>`).join("")}</ul>
      <div class="qnav"><button type="button" class="btn back" id="again">${t("↺ Answer again", "↺ Újra válaszolok")}</button><a class="btn next" href="#start">${t("Build it in Inkscape ↓", "Építsd meg Inkscape-ben ↓")}</a></div>
    </article>`;
    $("#again").addEventListener("click", () => {
      if (S.solved.length && !confirm(t("Answer again? Your banner and steps will change, and your ticks will be cleared.", "Újra válaszolsz? A zászlód és a lépések megváltoznak, a pipáid törlődnek."))) return;
      S.revealed = false; S.q = 0; S.solved = []; S.checks = []; S.end = false; save();
      renderWizard(true); renderWork(); hero(); $("#tent").scrollIntoView({ block: "start" });
    });
  }
  function hero() {
    if (S.revealed) { const m = build(A()); $("#hero-flag").innerHTML = svg(m); $("#hero-cap").textContent = t(`The banner of ${m.name}`, `${m.name} zászlaja`); }
    else { $("#hero-flag").innerHTML = MYSTERY; $("#hero-cap").textContent = t("Answer every question to reveal it", "Válaszolj minden kérdésre, és előkerül"); }
  }

  /* ------------------------------------------------------------------ guided steps (comic strips) */
  const LEGEND = `<div class="legend">
    <span><svg viewBox="0 0 40 28" aria-hidden="true"><rect x="4" y="5" width="32" height="18" fill="#c9c6b8"/><rect x="2" y="3" width="36" height="22" fill="none" stroke="#1d2622" stroke-width="1.4" stroke-dasharray="4 3"/></svg>${t("dashed box = selected", "szaggatott keret = kijelölve")}</span>
    <span><svg viewBox="0 0 40 28" aria-hidden="true"><circle cx="15" cy="14" r="10" fill="#c9c6b8"/><circle cx="24" cy="14" r="9" fill="#5fa8ff" fill-opacity=".62" stroke="#1d5fb8"/></svg>${t("blue see-through = the shape that cuts (on top)", "kék, áttetsző = a vágó alakzat (felül)")}</span>
    <span><svg viewBox="0 0 40 28" aria-hidden="true"><rect x="3" y="15" width="12" height="9" fill="none" stroke="#1d2622" stroke-dasharray="3 2"/><path d="M12 17L24 9" stroke="#1d2622" stroke-width="2"/><polygon points="27,7 21,8 24,12" fill="#1d2622"/><rect x="25" y="3" width="12" height="9" fill="#c9c6b8"/></svg>${t("dashed outline + arrow = moved / aligned from here", "szaggatott körvonal + nyíl = innen mozdult / igazodott")}</span></div>`;
  function renderWork() {
    const box = $("#work");
    if (!S.revealed) { box.innerHTML = ""; paint(); return; }
    const m = build(A());
    const tilt = i => ["-.3deg", ".25deg", "-.15deg", ".35deg"][i % 4];
    const fileName = t("surname_", "vezeteknev_") + m.name.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "").slice(0, 16);
    box.innerHTML = `
    <section class="sec">${head(t("Skills on your banner", "Készségek a zászlódon"), t("Everything from this year – your banner uses these:", "Minden az idei évből – a zászlód ezeket használja:"))}<ul class="badges">${m.skills.map(s => `<li>${s}</li>`).join("")}</ul></section>
    <section class="sec" id="start">${head(t("Before you start", "Mielőtt elkezded"), t("No keyboard shortcuts: every command is in a menu or on a toolbar.", "Nincs billentyűparancs: minden parancs egy menüben vagy egy eszköztáron van."))}
      <article class="sheet" style="--tilt:-.2deg">${tape}<h3>${t("Five tricks you will use all the time", "Öt trükk, amit folyton használni fogsz")}</h3>
        <ol class="do">
          <li>${M("new")}, ${M("saveAs")} <code>${fileName}.svg</code>.</li>
          <li>${t(`<b>Sizes</b> ${SZ(300, 180)}: with the ${T("selector")} Selector, type <b>W</b> and <b>H</b> in the tool controls bar (mm, lock open, Enter after each).`, `<b>Méretek</b> ${SZ(300, 180)}: a ${T("selector")} Kijelölővel írd be az eszközvezérlő-sávon az <b>Sz</b> (szélesség) és <b>M</b> (magasság) értékét (mm, a lakat nyitva, mindegyik után Enter).`)}</li>
          <li>${t(`<b>Colours</b> ${C(m.pal[0])}: ${M("fs")} → <i>Fill</i> → flat colour → type the code into <b>RGBA</b>.`, `<b>Színek</b> ${C(m.pal[0])}: ${M("fs")} → <i>Kitöltés</i> → Egyenletes szín → írd be a kódot az <b>RGBA</b> mezőbe.`)}</li>
          <li>${t(`<b>Placing</b> ${CENTRE}: ${M("align")} with <i>Relative to: <b>Page</b></i>. Exact shifts like <span class="nums">↑ −17</span>: ${M("transform")} → <i>Move</i>, tick <i>Relative move</i> (+ = right/down, − = left/up).`, `<b>Elhelyezés</b> ${CENTRE}: ${M("align")}, <i>Relatív ehhez: <b>Oldal</b></i>. Pontos eltolás, pl. <span class="nums">↑ −17</span>: ${M("transform")} → <i>Áthelyezés</i>, pipáld be a <i>Relatív áthelyezés</i> négyzetet (+ = jobbra/le, − = balra/fel).`)}</li>
          <li>${t(`<b>Outlines</b> ${OLC()}: every shape except the background and the motto band gets a dark outline – ${M("fs")} → <i>Stroke paint</i> → flat colour <code class="hex">${hex6(OUT)}ff</code>, <i>Stroke style</i> → width <b>1 mm</b> (stars 0.6 mm). Tip: style one shape, then the next ones you draw keep the same stroke.`, `<b>Körvonalak</b> ${OLC()}: a háttér és a jelmondatsáv kivételével minden alakzat sötét körvonalat kap – ${M("fs")} → <i>Körvonalrajzolat</i> → Egyenletes szín <code class="hex">${hex6(OUT)}ff</code>, <i>Körvonalstílus</i> → szélesség <b>1 mm</b> (csillagok 0,6 mm). Tipp: ha egy alakzatot beállítasz, a következők általában megtartják ezt a körvonalat.`)}</li>
        </ol>
        <h3 style="margin-top:14px">${t("How to read the pictures", "Hogyan olvasd a képeket?")}</h3>${LEGEND}
        <p class="note">${t("Your palette:", "A palettád:")} ${uniq([...m.pal, WHITE, BLACK]).map(c => C(c)).join(" ")}</p>
      </article></section>
    <section class="sec">${head(t("The steps", "A lépések"), t("Follow the pictures from left to right. Each one is one action; the chips underneath say how.", "Kövesd a képeket balról jobbra. Minden kép egy művelet; alatta a címkék mutatják, hogyan."), "var(--accent)")}
      ${[1, 2, 3, 4, 5, 6, 7].map((n, i) => { const s = m.steps[n]; return `
      <article class="sheet step" id="step-${n}" data-n="${n}" style="--tilt:${tilt(i)}">${tape}
        <h3><span class="num">${n}</span>${s.title} <span class="stamp">${t("done!", "kész!")}</span></h3>
        <p class="lead">${s.lead}</p>
        <div class="frames">${s.frames.map((f, k) => `<figure class="frame"><div class="fpanel">${frameSvg(m, n, f, s.focus)}${f.status ? `<span class="fstat">${f.status}</span>` : ""}</div><figcaption><span class="fnum">${k + 1}</span><span class="fchips">${f.chips.join(" ")}</span><span class="fcap">${f.cap}</span></figcaption></figure>`).join("")}</div>
        ${s.note ? `<p class="note">${s.note}</p>` : ""}
        ${s.stuck && s.stuck.length ? `<details class="stuck"><summary>${t("Stuck?", "Elakadtál?")}</summary><ul>${s.stuck.map(x => `<li>${x}</li>`).join("")}</ul></details>` : ""}
        <div class="foot"><button class="done-btn" type="button" data-n="${n}" aria-pressed="false"><span class="box" aria-hidden="true"></span><span class="t">${t("I did this step", "Ezt a lépést megcsináltam")}</span></button>
        ${n < 7 ? `<a class="next-link" href="#step-${n + 1}">${t("Next:", "Következik:")} ${m.steps[n + 1].title} ↓</a>` : `<a class="next-link" href="#save">${t("Last thing: save and hand in ↓", "Utolsó lépés: mentés és beadás ↓")}</a>`}</div>
      </article>`; }).join("")}
    </section>
    <section class="sec" id="save">${head(t("Save and hand in", "Mentés és beadás"), t("The SVG shows how you built it; the PNG is the picture.", "Az SVG megmutatja, hogyan építetted; a PNG a kép."))}
      <article class="sheet" style="--tilt:.2deg">${tape}
        <div class="savegrid"><div class="stepflag">${svg(m)}</div>
        <ol class="do"><li>${M("save")} – <code>${fileName}.svg</code></li><li>${M("export")} → <b>${t("Page", "Oldal")}</b> → <code>${fileName}.png</code> → ${t("Export", "Exportálás")}.</li></ol></div>
        <h3 style="margin-top:14px">${t("Checklist", "Ellenőrzőlista")}</h3>
        <ul class="check">${checklist(m).map((c, i) => `<li><label><input type="checkbox" data-c="${i}"><span>${c}</span></label></li>`).join("")}</ul>
      </article>
      <div class="finish" id="finish" role="status"><h2>${t(`Long live ${esc(m.name)}!`, `Éljen ${esc(m.name)}!`)}</h2><p>${t("Hand in your two files, then try a bonus below.", "Add be a két fájlt, aztán próbálj ki egy bónuszt lent.")}</p></div>
    </section>
    <section class="sec" id="bonus">${head(t("Bonus – rule harder", "Bónusz – uralkodj keményebben"), t("Same tools, more propaganda. Pick any.", "Ugyanazok az eszközök, több propaganda. Válassz bármelyiket."))}
      <article class="sheet" style="--tilt:-.2deg">${tape}<ul class="bonus">
        <li><b>${t("A coin", "Pénzérme")}</b><span>${t(`Two circles → ${M("diff")} for the rim, your symbol in the middle, the name with ${M("putPath")}.`, `Két kör → ${M("diff")} a peremnek, középen a jelképed, a név ${M("putPath")} paranccsal.`)}</span></li>
        <li><b>${t("A banknote", "Bankjegy")}</b><span>${t("Rectangle with a cog-ring border (Star tool, many corners, minus a rectangle), your symbol, the value in big bold text.", "Téglalap fogaskerekes szegéllyel (Csillag eszköz, sok csúcs, mínusz egy téglalap), a jelképed, az érték nagy, vastag betűkkel.")}</span></li>
        <li><b>${t("Flag on a pole", "Zászló rúdon")}</b><span>${t(`${M("selAll")}, ${M("group")}; a thin rectangle pole + a circle on top → ${M("union")}.`, `${M("selAll")}, ${M("group")}; vékony téglalap rúd + a tetején egy kör → ${M("union")}.`)}</span></li>
        <li><b>${t("The general's medal", "A tábornok érdemrendje")}</b><span>${t(`An 8-corner star minus a circle (${M("diff")}) + a ribbon: rectangle → ${M("o2p")} → ${T("node")} pull the bottom corners into a V.`, `8 csúcsú csillag mínusz egy kör (${M("diff")}) + szalag: téglalap → ${M("o2p")} → ${T("node")} az alsó sarkokat húzd V alakúra.`)}</span></li>
      </ul></article></section>`;
    box.querySelectorAll(".done-btn").forEach(b => b.addEventListener("click", () => {
      const n = +b.dataset.n;
      S.solved = S.solved.includes(n) ? S.solved.filter(x => x !== n) : [...S.solved, n].sort((x, y) => x - y);
      update();
      if (S.solved.includes(n)) { const nx = [1, 2, 3, 4, 5, 6, 7].find(k => !S.solved.includes(k)); const tg = nx ? document.getElementById("step-" + nx) : $("#save"); if (tg && nx !== n) setTimeout(() => tg.scrollIntoView({ block: "start" }), 250); }
    }));
    box.querySelectorAll(".check input").forEach(c => c.addEventListener("change", () => { const k = +c.dataset.c; S.checks = c.checked ? [...new Set([...S.checks, k])] : S.checks.filter(x => x !== k); update(); }));
    const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) document.querySelectorAll(".dots a").forEach(a => a.classList.toggle("cur", a.dataset.n === e.target.dataset.n)); }), { rootMargin: "-40% 0px -55% 0px" });
    box.querySelectorAll(".step").forEach(el => io.observe(el));
    paint();
  }
  function checklist(m) {
    return HU
      ? [`Az alapmező: ${LAYOUT_NAME[m.layout]}, pontos színek, az oldal a zászlóra méretezve`, `A címer mögött: ${BEHIND_NAME[m.army]}`, `A címer kerete: ${FRAME_NAME[m.econ]}`, `A jelkép: ${SYM_NAME[m.sym]}`,
        `${m.N} csillag egyenlő közökkel`, `A név (${esc(m.name)}) ${m.arcName ? "ívben (Útvonalra illesztés)" : "felül, középen"}`, `A jelmondat („${esc(m.motto)}”) ${m.bandMotto ? "kivágva a sávból" : "a szalagba tördelve"}, és a keret`, "Az SVG és a PNG is elmentve, a fájlnévben a vezetékneveddel"]
      : [`The field: ${LAYOUT_NAME[m.layout]}, exact colours, page resized to the banner`, `Behind the emblem: ${BEHIND_NAME[m.army]}`, `The emblem frame: ${FRAME_NAME[m.econ]}`, `The symbol: ${SYM_NAME[m.sym]}`,
        `${m.N} star${m.N > 1 ? "s" : ""} with equal gaps`, `The name ${esc(m.name)}${m.arcName ? " in an arc (Put on Path)" : " centred at the top"}`, `The motto “${esc(m.motto)}” ${m.bandMotto ? "cut out of the band" : "flowed into the ribbon"}, and the frame`, "Both SVG and PNG saved, with your surname in the file name"];
  }

  /* ------------------------------------------------------------------ progress */
  function paint() {
    document.querySelectorAll(".step").forEach(el => {
      const n = +el.dataset.n, d = S.solved.includes(n); el.classList.toggle("is-done", d);
      const b = el.querySelector(".done-btn"); b.setAttribute("aria-pressed", String(d)); b.querySelector(".box").textContent = d ? "✓" : ""; b.querySelector(".t").textContent = d ? t("Done", "Kész") : t("I did this step", "Ezt a lépést megcsináltam");
    });
    document.querySelectorAll(".dots a").forEach(a => a.classList.toggle("done", S.solved.includes(+a.dataset.n)));
    document.querySelectorAll("#bar i").forEach((i, k) => i.classList.toggle("on", S.solved.includes(k + 1)));
    $("#count").textContent = t(`${S.solved.length} / 7 steps`, `${S.solved.length} / 7 lépés`);
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
    if (!confirm(t("Start over? Your answers and ticks will be cleared.", "Újrakezded? A válaszaid és a pipáid törlődnek."))) return;
    S = { answers: fresh(), q: 0, revealed: false, solved: [], checks: [], end: false }; save();
    renderWizard(); renderWork(); hero(); window.scrollTo({ top: 0 });
  });
  $("#print").addEventListener("click", () => window.print());

  if (S.revealed && !allValid()) S.revealed = false;
  renderWizard(); renderWork(); hero();
})();
