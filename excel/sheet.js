/* ============================================================
   digikult — a small spreadsheet for the Excel lessons
   ------------------------------------------------------------
   Works like the Hungarian Excel: =SZUM(B2:B9), ; between the
   parts of a function, decimal comma, #NÉV? and friends.

   const g = XL.grid(element, {
     cols: 8, rows: 12, widths: [150, 80, …],
     cells: { A1: "Süti", B2: 350, F2: "=SZUM(C2:E2)" },
     formats: { "B2:B9": "ft", H: "pct" },     // ft, pct, pct1, int, dec1, dec2
     styles:  { "A1:H1": "head", A10: "total" },
     locked:  ["A1:E9"],                       // data the student shouldn't overwrite
     onChange(g) {}, onSelect(g, addr) {}
   });
   Everything the student can do: type, click cells into a formula,
   drag the fill handle, Ctrl+C / Ctrl+V / Ctrl+Z, Delete, F2,
   and "Képletek" to see formulas instead of results.
   ============================================================ */
(function () {
  "use strict";

  /* ---------- errors ---------- */
  class XErr { constructor(code, why) { this.code = code; this.why = why || ""; } toString() { return this.code; } }
  const isErr = v => v instanceof XErr;
  const E = {
    name: why => new XErr("#NÉV?", why), value: why => new XErr("#ÉRTÉK!", why),
    div0: why => new XErr("#ZÉRÓOSZTÓ!", why || "Nullával nem lehet osztani. Lehet, hogy egy üres cellával osztasz?"),
    ref: why => new XErr("#HIV!", why), num: why => new XErr("#SZÁM!", why)
  };
  class SyntaxErr extends Error {}

  /* ---------- addresses ---------- */
  const colName = c => { let s = ""; c++; while (c > 0) { const m = (c - 1) % 26; s = String.fromCharCode(65 + m) + s; c = Math.floor((c - 1) / 26); } return s; };
  const colIndex = s => { let n = 0; for (const ch of s.toUpperCase()) n = n * 26 + (ch.charCodeAt(0) - 64); return n - 1; };
  const A = (c, r) => colName(c) + (r + 1);
  const parseA = a => { const m = /^\$?([A-Za-z]{1,2})\$?(\d+)$/.exec(String(a).trim()); return m ? { c: colIndex(m[1]), r: +m[2] - 1 } : null; };
  /* "B2:D9", "B2", or a whole column "H" (rows 1..maxRow) */
  function rangeOf(s, maxRow) {
    s = String(s).trim();
    if (/^[A-Za-z]{1,2}$/.test(s)) { const c = colIndex(s); return { c1: c, r1: 0, c2: c, r2: (maxRow || 100) - 1 }; }
    const [a, b] = s.split(":"), p = parseA(a), q = b ? parseA(b) : p;
    if (!p || !q) return null;
    return { c1: Math.min(p.c, q.c), r1: Math.min(p.r, q.r), c2: Math.max(p.c, q.c), r2: Math.max(p.r, q.r) };
  }
  const inRange = (g, c, r) => c >= g.c1 && c <= g.c2 && r >= g.r1 && r <= g.r2;
  const cellsOf = g => { const out = []; for (let r = g.r1; r <= g.r2; r++) for (let c = g.c1; c <= g.c2; c++) out.push(A(c, r)); return out; };
  const rangeText = g => (g.c1 === g.c2 && g.r1 === g.r2) ? A(g.c1, g.r1) : A(g.c1, g.r1) + ":" + A(g.c2, g.r2);
  /* Hungarian article before a cell or a function name: az A1, a B2, az F2, az ÁTLAG, a SZUM */
  const az = w => { w = String(w).replace(/^\$/, ""); return (/^[A-Z]{1,2}\$?\d/.test(w) ? /^[AEFILMNORSX]|^[15]/ : /^[AEIOUÁÉÍÓÖŐÚÜŰ]|^[15]/i).test(w) ? "az" : "a"; };
  const Az = w => az(w) === "az" ? "Az" : "A";

  /* ---------- numbers in the Hungarian way ---------- */
  const parseNum = s => {
    if (typeof s !== "string") return null;
    const t = s.trim().replace(/ | | /g, "").replace(/Ft$/i, "");
    if (!/^[+-]?(\d+([.,]\d+)?|[.,]\d+)%?$/.test(t)) return null;
    let n = parseFloat(t.replace(",", ".").replace("%", ""));
    if (t.endsWith("%")) n /= 100;
    return n;
  };
  const group = s => s.replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  function fmtGeneral(n) {
    if (!isFinite(n)) return "#SZÁM!";
    if (Number.isInteger(n) && Math.abs(n) < 1e11) return String(n);
    let s = String(Number(n.toPrecision(10)));
    if (/e/.test(s)) s = n.toExponential(4);
    return s.replace(".", ",");
  }
  const fixed = (n, d) => { const neg = n < 0; let s = roundHalf(Math.abs(n), d).toFixed(d); let [i, f] = s.split("."); i = group(i); return (neg && +s !== 0 ? "-" : "") + i + (f ? "," + f : ""); };
  function roundHalf(x, d) {
    const m = Math.pow(10, d), y = Math.abs(x) * m, r = Math.round(y + 1e-9 * Math.max(1, y));
    return Math.sign(x) * r / m;
  }
  const FORMATS = {
    ft: n => fixed(n, 0) + " Ft", int: n => fixed(n, 0), dec1: n => fixed(n, 1), dec2: n => fixed(n, 2),
    pct: n => fixed(n * 100, 0) + "%", pct1: n => fixed(n * 100, 1) + "%", db: n => fixed(n, 0) + " db"
  };
  const textOf = v => v == null ? "" : typeof v === "boolean" ? (v ? "IGAZ" : "HAMIS") : typeof v === "number" ? fmtGeneral(v) : isErr(v) ? v.code : String(v);

  /* ---------- the functions ---------- */
  const FN = {};
  const def = (name, args, desc, min, max, fn, lazy) => FN[name] = { name, args, desc, min, max, fn, lazy };
  /* English names and missing accents a student is likely to type */
  const ALIAS = { SUM: "SZUM", AVERAGE: "ÁTLAG", ATLAG: "ÁTLAG", COUNT: "DARAB", COUNTA: "DARAB2", ROUND: "KEREKÍTÉS", KEREKITES: "KEREKÍTÉS",
    KEREKÍTES: "KEREKÍTÉS", KEREKITÉS: "KEREKÍTÉS", IF: "HA", COUNTIF: "DARABTELI", SUMIF: "SZUMHA", DARABTELY: "DARABTELI", SZUMM: "SZUM", ÁTLAGA: "ÁTLAG", MAXIMUM: "MAX", MINIMUM: "MIN", DB: "DARAB", DARABHA: "DARABTELI" };

  /* walk the numbers of the arguments: in ranges only real numbers count, typed values are converted */
  function numbersOf(args, opts = {}) {
    const out = [];
    for (const a of args) {
      if (a && a.range) { for (const v of a.vals) { if (isErr(v)) return v; if (typeof v === "number") out.push(v); } }
      else if (a === undefined || a === null) { if (!opts.skipEmpty) out.push(0); }
      else { const n = toNum(a); if (isErr(n)) return n; out.push(n); }
    }
    return out;
  }
  def("SZUM", "szám1; [szám2]; …", "Összeadja a számokat (pl. egy tartomány összes számát).", 1, 255, args => { const ns = numbersOf(args); return isErr(ns) ? ns : ns.reduce((s, n) => s + n, 0); });
  def("ÁTLAG", "szám1; [szám2]; …", "A számok átlaga: az összegük osztva a darabszámukkal. Az üres cellákat kihagyja.", 1, 255, args => {
    const ns = numbersOf(args); if (isErr(ns)) return ns;
    return ns.length ? ns.reduce((s, n) => s + n, 0) / ns.length : E.div0("Az ÁTLAG nem talált egyetlen számot sem a tartományban.");
  });
  def("MIN", "szám1; [szám2]; …", "A legkisebb szám.", 1, 255, args => { const ns = numbersOf(args); return isErr(ns) ? ns : ns.length ? Math.min(...ns) : 0; });
  def("MAX", "szám1; [szám2]; …", "A legnagyobb szám.", 1, 255, args => { const ns = numbersOf(args); return isErr(ns) ? ns : ns.length ? Math.max(...ns) : 0; });
  def("DARAB", "érték1; [érték2]; …", "Megszámolja, hány cellában van szám. Az üres és a szöveges cellákat nem számolja.", 1, 255, args => {
    let n = 0; for (const a of args) { if (a && a.range) { for (const v of a.vals) if (typeof v === "number") n++; } else if (typeof a === "number") n++; } return n;
  });
  def("DARAB2", "érték1; [érték2]; …", "Megszámolja a nem üres cellákat (szöveget is).", 1, 255, args => {
    let n = 0; for (const a of args) { if (a && a.range) { for (const v of a.vals) if (v !== null && v !== "") n++; } else if (a !== null && a !== undefined) n++; } return n;
  });
  def("KEREKÍTÉS", "szám; hány_tizedes", "Kerekít a megadott számú tizedesjegyre. 0 = egészre, 1 = egy tizedesre, -2 = százasokra.", 2, 2, args => {
    const x = toNum(args[0]), d = toNum(args[1]); if (isErr(x)) return x; if (isErr(d)) return d; return roundHalf(x, Math.trunc(d));
  });
  def("HA", "feltétel; [érték_ha_igaz]; [érték_ha_hamis]", "Ha a feltétel igaz, az első értéket adja, ha hamis, a másodikat.", 1, 3, (nodes, ev) => {
    const c = toBool(ev(nodes[0])); if (isErr(c)) return c;
    if (c) return nodes.length > 1 ? orZero(ev(nodes[1])) : true;
    return nodes.length > 2 ? orZero(ev(nodes[2])) : false;
  }, true);
  def("DARABTELI", "tartomány; kritérium", "Megszámolja, hány cella felel meg a feltételnek, pl. \"vega\" vagy \">5000\".", 2, 2, args => {
    if (!args[0] || !args[0].range) return E.value("A DARABTELI első része egy tartomány legyen, pl. C2:C25.");
    const m = matcher(args[1]); if (isErr(m)) return m;
    return args[0].vals.filter(m).length;
  });
  def("SZUMHA", "tartomány; kritérium; [összeg_tartomány]", "Összeadja azokat a számokat, amelyek sora megfelel a feltételnek.", 2, 3, args => {
    if (!args[0] || !args[0].range) return E.value("A SZUMHA első része egy tartomány legyen.");
    const m = matcher(args[1]); if (isErr(m)) return m;
    const sum = args[2] && args[2].range ? args[2] : args[0];
    let s = 0; args[0].vals.forEach((v, i) => { if (m(v)) { const x = sum.vals[i]; if (isErr(x)) s = x; else if (!isErr(s) && typeof x === "number") s += x; } });
    return s;
  });
  const orZero = v => (v === null || v === undefined) ? 0 : v;

  /* ---------- conversions ---------- */
  function toNum(v) {
    if (isErr(v)) return v;
    if (v && v.range) return E.value(`Egy tartományt (${v.text}) csak függvényen belül használhatsz, pl. =SZUM(${v.text}).`);
    if (v === null || v === undefined || v === "") return 0;
    if (typeof v === "number") return v;
    if (typeof v === "boolean") return v ? 1 : 0;
    const n = parseNum(v);
    return n === null ? E.value(`„${v}” szöveg, nem szám, ezért nem lehet vele számolni.`) : n;
  }
  function toBool(v) {
    if (isErr(v)) return v;
    if (v && v.range) return E.value(`A feltételbe egyetlen cella kell, nem tartomány (${v.text}).`);
    if (v === null || v === undefined || v === "") return false;
    if (typeof v === "boolean") return v;
    if (typeof v === "number") return v !== 0;
    const u = String(v).toUpperCase(); if (u === "IGAZ") return true; if (u === "HAMIS") return false;
    return E.value(`A HA feltétele itt szöveg („${v}”), nem összehasonlítás. Így kellene: B2="${v}"`);
  }
  const low = s => String(s).toLocaleLowerCase("hu");
  const rank = v => typeof v === "number" ? 0 : typeof v === "string" ? 1 : 2;
  function compare(a, b) {          /* -1, 0, 1 like Excel: numbers < texts < IGAZ/HAMIS, empty counts as 0 or "" */
    if (a === null || a === undefined) a = typeof b === "string" ? "" : typeof b === "boolean" ? false : 0;
    if (b === null || b === undefined) b = typeof a === "string" ? "" : typeof a === "boolean" ? false : 0;
    if (rank(a) !== rank(b)) return rank(a) < rank(b) ? -1 : 1;
    if (typeof a === "string") { const x = low(a), y = low(b); return x === y ? 0 : x.localeCompare(y, "hu") < 0 ? -1 : 1; }
    const x = +a, y = +b; return Math.abs(x - y) < 1e-12 * Math.max(1, Math.abs(x), Math.abs(y)) ? 0 : x < y ? -1 : 1;
  }
  /* DARABTELI / SZUMHA criteria: 12, "vega", ">5000", "<>nem", "a*" */
  function matcher(c) {
    if (isErr(c)) return c;
    if (c && c.range) return E.value("A kritérium egyetlen érték legyen, pl. \"vega\" vagy \">5000\".");
    if (typeof c === "number") return v => typeof v === "number" ? compare(v, c) === 0 : (typeof v === "string" && parseNum(v) === c);
    if (typeof c === "boolean") return v => v === c;
    let s = c == null ? "" : String(c), op = "=";
    const m = /^(<=|>=|<>|=|<|>)([\s\S]*)$/.exec(s);
    if (m) { op = m[1]; s = m[2]; }
    const n = parseNum(s);
    const test = cmp => op === "=" ? cmp === 0 : op === "<>" ? cmp !== 0 : op === "<" ? cmp < 0 : op === ">" ? cmp > 0 : op === "<=" ? cmp <= 0 : cmp >= 0;
    if (n !== null) return v => { if (typeof v !== "number") return op === "<>"; return test(compare(v, n)); };
    if (s === "") return v => op === "=" ? (v === null || v === "") : op === "<>" ? !(v === null || v === "") : false;
    if ((op === "=" || op === "<>") && /[*?]/.test(s)) {
      const re = new RegExp("^" + low(s).replace(/[.+^${}()|[\]\\]/g, "\\$&").replace(/\*/g, "[\\s\\S]*").replace(/\?/g, ".") + "$");
      return v => { const hit = typeof v === "string" && re.test(low(v)); return op === "=" ? hit : !hit; };
    }
    return v => { if (typeof v !== "string") return op === "<>"; return test(compare(v, s)); };
  }

  /* ---------- tokenizer ---------- */
  const LETTER = "A-Za-zÁÉÍÓÖŐÚÜŰáéíóöőúüű_";
  const WORD = new RegExp(`^[${LETTER}][${LETTER}0-9.]*`);
  function tokenize(src) {
    const t = []; let i = 0;
    while (i < src.length) {
      const ch = src[i], rest = src.slice(i);
      if (/\s/.test(ch)) { i++; continue; }
      if (ch === '"') {
        let j = i + 1, s = "";
        for (;;) {
          if (j >= src.length) throw new SyntaxErr("Hiányzik a záró idézőjel. A szöveget két \" közé kell tenni, pl. \"vega\".");
          if (src[j] === '"') { if (src[j + 1] === '"') { s += '"'; j += 2; continue; } break; }
          s += src[j++];
        }
        t.push({ t: "str", v: s, pos: i, end: j + 1 }); i = j + 1; continue;
      }
      if (/[„”“]/.test(ch)) throw new SyntaxErr("A képletben egyenes idézőjel kell: \" (Shift+2), nem „ ” idézőjel.");
      let m = /^\d+(?:[.,]\d+)?|^[.,]\d+/.exec(rest);
      if (m && !(/^[.,]/.test(m[0]) && t.length && /^(ref|num|close)$/.test(t[t.length - 1].t))) {
        t.push({ t: "num", v: parseFloat(m[0].replace(",", ".")), raw: m[0], pos: i, end: i + m[0].length }); i += m[0].length; continue;
      }
      m = /^\$?[A-Za-z]{1,2}\$?\d+/.exec(rest);
      if (m && !new RegExp(`^[${LETTER}0-9(]`).test(rest.slice(m[0].length))) {
        const r = /^(\$?)([A-Za-z]{1,2})(\$?)(\d+)$/.exec(m[0]);
        t.push({ t: "ref", c: colIndex(r[2]), r: +r[4] - 1, ac: !!r[1], ar: !!r[3], pos: i, end: i + m[0].length }); i += m[0].length; continue;
      }
      m = WORD.exec(rest);
      if (m) {
        const w = m[0], up = w.toLocaleUpperCase("hu"), after = rest.slice(w.length).replace(/^\s+/, "");
        if (after[0] === "(") t.push({ t: "fn", v: up, raw: w, pos: i, end: i + w.length });
        else if (up === "IGAZ" || up === "HAMIS") t.push({ t: "bool", v: up === "IGAZ", pos: i, end: i + w.length });
        else t.push({ t: "name", v: w, pos: i, end: i + w.length });
        i += w.length; continue;
      }
      const two = rest.slice(0, 2);
      if (two === "<=" || two === ">=" || two === "<>") { t.push({ t: "op", v: two, pos: i, end: i + 2 }); i += 2; continue; }
      if ("+-*/^&=<>%:".includes(ch)) { t.push({ t: "op", v: ch, pos: i, end: i + 1 }); i++; continue; }
      if (ch === "(") { t.push({ t: "open", pos: i, end: i + 1 }); i++; continue; }
      if (ch === ")") { t.push({ t: "close", pos: i, end: i + 1 }); i++; continue; }
      if (ch === ";") { t.push({ t: "sep", pos: i, end: i + 1 }); i++; continue; }
      if (ch === ",") throw new SyntaxErr("A magyar Excelben a függvény részeit pontosvessző (;) választja el, nem vessző. Pl. =KEREKÍTÉS(B2;1)");
      if (ch === ":") { t.push({ t: "op", v: ":", pos: i, end: i + 1 }); i++; continue; }
      throw new SyntaxErr(`Ezt a jelet nem ismeri az Excel: ${ch}` + (ch === "×" ? " (szorozni a * jellel kell)" : ch === "÷" ? " (osztani a / jellel kell)" : ""));
    }
    return t;
  }

  /* ---------- parser ---------- */
  function parse(src) {
    const toks = tokenize(src); let p = 0;
    const peek = () => toks[p], next = () => toks[p++];
    const isOp = (...ops) => peek() && peek().t === "op" && ops.includes(peek().v);
    const expect = (t, msg) => { if (!peek() || peek().t !== t) throw new SyntaxErr(msg); return next(); };
    function binary(sub, ops) { return () => { let l = sub(); while (isOp(...ops)) { const op = next().v; const r = sub(); l = { k: "bin", op, l, r }; } return l; }; }
    const primary = () => {
      const tk = next();
      if (!tk) throw new SyntaxErr("A képlet félbemaradt: valami hiányzik a végéről.");
      if (tk.t === "num") return { k: "num", v: tk.v };
      if (tk.t === "str") return { k: "str", v: tk.v };
      if (tk.t === "bool") return { k: "bool", v: tk.v };
      if (tk.t === "ref") {
        if (isOp(":")) { next(); const b = next(); if (!b || b.t !== "ref") throw new SyntaxErr("A kettőspont után is egy cella kell, pl. B2:B9."); return { k: "range", a: tk, b }; }
        return { k: "ref", a: tk };
      }
      if (tk.t === "name") return { k: "name", v: tk.v };
      if (tk.t === "fn") {
        expect("open", "Nyitó zárójel kell a függvény neve után.");
        const args = [];
        if (peek() && peek().t === "close") { next(); return { k: "fn", name: tk.v, raw: tk.raw, args }; }
        for (;;) {
          if (peek() && (peek().t === "sep" || peek().t === "close")) args.push({ k: "empty" });
          else args.push(expr());
          if (peek() && peek().t === "sep") { next(); continue; }
          if (peek() && peek().t === "close") { next(); break; }
          if (!peek()) throw new SyntaxErr(`Hiányzik a záró zárójel ) ${az(tk.v)} ${tk.v} végéről.`);
          throw new SyntaxErr(`${Az(tk.v)} ${tk.v} részei közé pontosvessző (;) kell.`);
        }
        return { k: "fn", name: tk.v, raw: tk.raw, args };
      }
      if (tk.t === "open") { const e = expr(); expect("close", "Hiányzik egy záró zárójel )."); return { k: "par", e }; }
      if (tk.t === "close") throw new SyntaxErr("Eggyel több a záró zárójel ), mint a nyitó.");
      if (tk.t === "sep") throw new SyntaxErr("Pontosvessző (;) csak függvény zárójelén belül állhat.");
      if (tk.t === "op") throw new SyntaxErr(`Itt nem állhat ${tk.v === "=" ? "egyenlőségjel" : "„" + tk.v + "” jel"}: előtte vagy utána hiányzik valami.`);
      throw new SyntaxErr("Hibás képlet.");
    };
    const unary = () => { if (isOp("-", "+")) { const op = next().v; return { k: "un", op, x: unary() }; } return primary(); };
    const postfix = () => { let x = unary(); while (isOp("%")) { next(); x = { k: "pct", x }; } return x; };
    const pow = binary(postfix, ["^"]);
    const mul = binary(pow, ["*", "/"]);
    const add = binary(mul, ["+", "-"]);
    const cat = binary(add, ["&"]);
    const expr = binary(cat, ["=", "<>", "<", ">", "<=", ">="]);
    if (!toks.length) throw new SyntaxErr("Az egyenlőségjel után nincs semmi.");
    const ast = expr();
    if (p < toks.length) {
      const tk = toks[p];
      if (tk.t === "close") throw new SyntaxErr("Eggyel több a záró zárójel ), mint a nyitó.");
      if (tk.t === "sep") throw new SyntaxErr("Pontosvessző (;) csak függvény zárójelén belül állhat.");
      if (tk.t === "op" && tk.v === ":") throw new SyntaxErr("A kettőspont két cella közé kell, pl. B2:B9.");
      throw new SyntaxErr("Két rész között hiányzik egy műveleti jel (+ - * /).");
    }
    return { ast, toks };
  }

  /* ---------- evaluation ---------- */
  function evaluate(node, ctx) {
    switch (node.k) {
      case "num": case "str": case "bool": return node.v;
      case "empty": return null;
      case "par": return evaluate(node.e, ctx);
      case "ref": {
        const { c, r } = node.a;
        if (c < 0 || r < 0 || c >= ctx.cols || r >= ctx.rows) return E.ref("Olyan cellára hivatkozol, ami nincs a táblázatban.");
        return ctx.get(c, r);
      }
      case "range": {
        const g = { c1: Math.min(node.a.c, node.b.c), r1: Math.min(node.a.r, node.b.r), c2: Math.max(node.a.c, node.b.c), r2: Math.max(node.a.r, node.b.r) };
        if (g.c1 < 0 || g.r1 < 0 || g.c2 >= ctx.cols || g.r2 >= ctx.rows) return E.ref("A tartomány kilóg a táblázatból.");
        const vals = []; for (let r = g.r1; r <= g.r2; r++) for (let c = g.c1; c <= g.c2; c++) vals.push(ctx.get(c, r));
        return { range: true, vals, text: rangeText(g), g };
      }
      case "name": {
        const w = node.v, up = w.toLocaleUpperCase("hu");
        if (FN[up] || ALIAS[up]) return E.name(`Hiányzik a zárójel ${az(up)} ${ALIAS[up] || up} után: ${ALIAS[up] || up}(…)`);
        return E.name(`Az Excel nem tudja, mi az, hogy „${w}”. Ha szöveget akartál írni, tedd idézőjelbe: "${w}"`);
      }
      case "un": { const x = toNum(evaluate(node.x, ctx)); return isErr(x) ? x : node.op === "-" ? -x : x; }
      case "pct": { const x = toNum(evaluate(node.x, ctx)); return isErr(x) ? x : x / 100; }
      case "bin": {
        const a = evaluate(node.l, ctx), b = evaluate(node.r, ctx);
        if (isErr(a)) return a; if (isErr(b)) return b;
        if (node.op === "&") {
          if (a && a.range || b && b.range) return E.value("Tartományt nem lehet összefűzni.");
          return textOf(a) + textOf(b);
        }
        if (["=", "<>", "<", ">", "<=", ">="].includes(node.op)) {
          if (a && a.range || b && b.range) return E.value("Összehasonlítani egy-egy cellát lehet, nem tartományt.");
          const c = compare(a, b);
          return node.op === "=" ? c === 0 : node.op === "<>" ? c !== 0 : node.op === "<" ? c < 0 : node.op === ">" ? c > 0 : node.op === "<=" ? c <= 0 : c >= 0;
        }
        const x = toNum(a), y = toNum(b); if (isErr(x)) return x; if (isErr(y)) return y;
        switch (node.op) {
          case "+": return x + y; case "-": return x - y; case "*": return x * y;
          case "/": return y === 0 ? E.div0() : x / y;
          case "^": { const v = Math.pow(x, y); return isFinite(v) ? v : E.num("Túl nagy szám."); }
        }
        return E.value();
      }
      case "fn": {
        const up = node.name, f = FN[up];
        if (!f) {
          const al = ALIAS[up] || ALIAS[up.normalize("NFD").replace(/[̀-ͯ]/g, "")];
          return E.name(al ? `${Az(up)} ${up} függvényt a magyar Excel így hívja: ${al}` : `Nincs ${up} nevű függvény. Nézd meg, jól írtad-e (ékezetekkel együtt).`);
        }
        if (node.args.length < f.min) return E.value(`${Az(up)} ${up} függvénynek ${f.min === 2 ? "két" : f.min} része kell: ${up}(${f.args})`);
        if (node.args.length > f.max) return E.value(`${Az(up)} ${up} függvénynek legfeljebb ${f.max === 2 ? "két" : f.max === 3 ? "három" : f.max} része lehet: ${up}(${f.args})`);
        if (f.lazy) return f.fn(node.args, n => evaluate(n, ctx));
        const args = node.args.map(n => evaluate(n, ctx));
        if (up !== "DARAB" && up !== "DARAB2") for (const a of args) if (isErr(a)) return a;
        return f.fn(args);
      }
    }
    return E.value();
  }

  /* ---------- rewriting a formula: moving references for copy and fill ---------- */
  function shiftFormula(raw, dr, dc) {
    if (typeof raw !== "string" || raw[0] !== "=") return raw;
    let toks; try { toks = tokenize(raw.slice(1)); } catch (e) { return raw; }
    let out = "", last = 0; const src = raw.slice(1);
    for (const tk of toks) {
      if (tk.t !== "ref") continue;
      const c = tk.ac ? tk.c : tk.c + dc, r = tk.ar ? tk.r : tk.r + dr;
      out += src.slice(last, tk.pos) + (c < 0 || r < 0 ? "#HIV!" : (tk.ac ? "$" : "") + colName(c) + (tk.ar ? "$" : "") + (r + 1));
      last = tk.end;
    }
    return "=" + out + src.slice(last);
  }
  /* what Excel does when you press Enter: capital letters for functions and cells, the rest untouched */
  function tidy(raw) {
    if (typeof raw !== "string" || raw[0] !== "=") return raw;
    let toks; try { toks = tokenize(raw.slice(1)); } catch (e) { return raw; }
    const src = raw.slice(1); let out = "", last = 0;
    for (const tk of toks) {
      let rep = null;
      if (tk.t === "ref") rep = (tk.ac ? "$" : "") + colName(tk.c) + (tk.ar ? "$" : "") + (tk.r + 1);
      else if (tk.t === "fn") rep = tk.v;
      else if (tk.t === "bool") rep = tk.v ? "IGAZ" : "HAMIS";
      if (rep !== null) { out += src.slice(last, tk.pos) + rep; last = tk.end; }
    }
    return "=" + out + src.slice(last);
  }
  /* F4: cycle B2 → $B$2 → B$2 → $B2 → B2 on the reference at the caret */
  function cycleAbs(text, caret) {
    const re = /\$?[A-Za-z]{1,2}\$?\d+/g; let m;
    while ((m = re.exec(text))) {
      if (caret >= m.index && caret <= m.index + m[0].length) {
        const p = /^(\$?)([A-Za-z]{1,2})(\$?)(\d+)$/.exec(m[0]), st = (p[1] ? 2 : 0) + (p[3] ? 1 : 0);
        const nx = { 0: 3, 3: 1, 1: 2, 2: 0 }[st];
        const rep = (nx & 2 ? "$" : "") + p[2].toUpperCase() + (nx & 1 ? "$" : "") + p[4];
        return { text: text.slice(0, m.index) + rep + text.slice(m.index + m[0].length), caret: m.index + rep.length };
      }
    }
    return null;
  }

  /* ---------- a sheet: raw contents + computed values ---------- */
  class Sheet {
    constructor(cols, rows) { this.cols = cols; this.rows = rows; this.raw = {}; this.cache = null; }
    set(a, v) { if (v === "" || v === null || v === undefined) delete this.raw[a]; else this.raw[a] = v; this.cache = null; }
    rawOf(a) { return this.raw[a] ?? null; }
    parsed(a) {
      const raw = this.raw[a];
      if (typeof raw !== "string" || raw[0] !== "=") return null;
      this.pcache = this.pcache || {};
      const hit = this.pcache[a];
      if (hit && hit.raw === raw) return hit;
      let res; try { res = { raw, ...parse(raw.slice(1)) }; } catch (e) { res = { raw, err: e.message }; }
      return this.pcache[a] = res;
    }
    value(a) {
      if (!this.cache) this.cache = {};
      if (a in this.cache) { const v = this.cache[a]; return v === VISITING ? E.ref("Körkörös hivatkozás: a képlet saját magára (vagy egy rá épülő cellára) hivatkozik.") : v; }
      const raw = this.raw[a];
      let v;
      if (raw === undefined || raw === null) v = null;
      else if (typeof raw === "number" || typeof raw === "boolean") v = raw;
      else if (raw[0] !== "=") { const n = parseNum(raw); v = n !== null && !/^\s*0\d/.test(raw) ? n : raw; }
      else {
        this.cache[a] = VISITING;
        const p = this.parsed(a), here = parseA(a);
        v = p.err ? E.name(p.err) : evaluate(p.ast, this.ctx(here));
        if (v && v.range) v = E.value(`Egy tartományt (${v.text}) csak függvényen belül használhatsz, pl. =SZUM(${v.text}).`);
      }
      this.cache[a] = v;
      return v;
    }
    ctx(here) { return { cols: this.cols, rows: this.rows, here, get: (c, r) => this.value(A(c, r)) }; }
    /* evaluate any formula as if it stood in cell `at` (used by the checks) */
    calc(formula, at) {
      try { const p = parse(String(formula).replace(/^=/, "")); const v = evaluate(p.ast, this.ctx(parseA(at || "A1"))); return v && v.range ? E.value() : v; }
      catch (e) { return E.name(e.message); }
    }
  }
  const VISITING = {};

  /* ---------- the grid on the page ---------- */
  const COLORS = ["#2f6fd6", "#d0482f", "#7b3fc4", "#1f8a4c", "#c27a00", "#c2336f"];
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const ERR_HELP = {
    "#NÉV?": "Az Excel egy szót nem ismer fel: elírt függvénynév, angol név (SUM helyett SZUM), vagy idézőjel nélküli szöveg.",
    "#ÉRTÉK!": "Rossz fajta adattal számol a képlet, például szöveggel szoroz.",
    "#ZÉRÓOSZTÓ!": "Nullával (vagy egy üres cellával) oszt a képlet.",
    "#HIV!": "A képlet olyan cellára hivatkozik, ami nincs, vagy saját magára.",
    "#SZÁM!": "Túl nagy vagy lehetetlen szám jött ki."
  };

  function grid(host, o) {
    const cols = o.cols, rows = o.rows, W = o.widths || [];
    const sheet = new Sheet(cols, rows);
    const initial = {};
    for (const [a, v] of Object.entries(o.cells || {})) { sheet.set(a.toUpperCase(), v); initial[a.toUpperCase()] = v; }
    const fmtOf = {}, styleOf = {};
    const spread = (map, into) => { for (const [k, v] of Object.entries(map || {})) { const g = rangeOf(k, rows); if (g) cellsOf(g).forEach(a => into[a] = into[a] ? into[a] + " " + v : v); } };
    spread(o.formats, fmtOf); spread(o.styles, styleOf);
    let lockedSet = new Set(), targetSet = new Set();
    const setLocked = list => { lockedSet = new Set(); (list || []).forEach(k => { const g = rangeOf(k, rows); if (g) cellsOf(g).forEach(a => lockedSet.add(a)); }); };
    setLocked(o.locked);
    let showFormulas = false, sel = { c: o.select ? parseA(o.select).c : 0, r: o.select ? parseA(o.select).r : 0 }, anchor = { ...sel };
    let edit = null;          /* { a, input, orig, pointStart, pointEnd } */
    let history = [], future = [], clip = null;

    host.classList.add("xl");
    host.innerHTML = `
      <div class="xl-bar">
        <span class="xl-name" title="A kijelölt cella címe"></span>
        <span class="xl-fx" aria-hidden="true">fx</span>
        <input class="xl-formula" type="text" spellcheck="false" autocomplete="off" aria-label="Szerkesztőléc">
        <button type="button" class="xl-toggle" aria-pressed="false" title="Képletek mutatása (Ctrl+ö)">Képletek</button>
      </div>
      <div class="xl-wrap" tabindex="0" role="grid" aria-label="${esc(o.label || "Munkalap")}">
        <div class="xl-stage">
          <table class="xl-grid" style="width:${38 + Array.from({ length: cols }, (_, c) => W[c] || 90).reduce((a, b) => a + b, 0)}px"><colgroup><col style="width:38px">${Array.from({ length: cols }, (_, c) => `<col style="width:${W[c] || 90}px">`).join("")}</colgroup>
            <thead><tr><th class="xl-corner"></th>${Array.from({ length: cols }, (_, c) => `<th class="xl-ch" data-c="${c}">${colName(c)}</th>`).join("")}</tr></thead>
            <tbody>${Array.from({ length: rows }, (_, r) => `<tr><th class="xl-rh" data-r="${r}">${r + 1}</th>${Array.from({ length: cols }, (_, c) => `<td data-a="${A(c, r)}"></td>`).join("")}</tr>`).join("")}</tbody>
          </table>
          <div class="xl-refs"></div>
          <div class="xl-copy" hidden></div>
          <div class="xl-sel"><i class="xl-handle" title="Kitöltőjel: húzd lefelé vagy jobbra a másoláshoz"></i></div>
          <div class="xl-fill" hidden></div>
          <input class="xl-edit" type="text" spellcheck="false" autocomplete="off" hidden aria-label="Cella szerkesztése">
        </div>
      </div>
      <div class="xl-pop" hidden></div>
      <div class="xl-tip" hidden></div>
      <div class="xl-status" aria-live="polite"></div>`;
    const $ = s => host.querySelector(s);
    const bar = $(".xl-formula"), nameBox = $(".xl-name"), wrap = $(".xl-wrap"), stage = $(".xl-stage"), table = $(".xl-grid");
    const selBox = $(".xl-sel"), fillBox = $(".xl-fill"), refsBox = $(".xl-refs"), copyBox = $(".xl-copy"), cellEd = $(".xl-edit");
    const pop = $(".xl-pop"), tip = $(".xl-tip"), status = $(".xl-status"), toggle = $(".xl-toggle");
    const td = a => table.querySelector(`td[data-a="${a}"]`);

    /* ----- painting ----- */
    function display(a) {
      const raw = sheet.rawOf(a);
      if (showFormulas && typeof raw === "string" && raw[0] === "=") return { text: raw, cls: "f" };
      const v = sheet.value(a);
      if (v === null) return { text: "", cls: "" };
      if (isErr(v)) return { text: v.code, cls: "err" };
      if (typeof v === "boolean") return { text: v ? "IGAZ" : "HAMIS", cls: "b" };
      if (typeof v === "number") {
        const f = fmtOf[a] && FORMATS[fmtOf[a].split(" ").pop()];
        if (f) return { text: f(v), cls: "n" };
        /* General format, like Excel: as many decimals as fit in the column */
        let t = fmtGeneral(v); const room = Math.floor(((W[parseA(a).c] || 90) - 14) / 8.4);
        if (t.length > room && t.includes(",")) { const ip = t.split(",")[0].length; t = room - ip - 1 >= 1 ? fmtGeneral(roundHalf(v, room - ip - 1)) : fmtGeneral(Math.round(v)); }
        if (t.length > room + 1) t = "#".repeat(Math.max(3, room));
        return { text: t, cls: "n" };
      }
      return { text: String(v), cls: "t" };
    }
    function paint() {
      for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
        const a = A(c, r), el = td(a), d = display(a);
        el.textContent = d.text;
        /* text runs on into the next cell when that one is empty, like in Excel */
        const ov = d.cls === "t" && c < cols - 1 && sheet.rawOf(A(c + 1, r)) === null;
        el.className = [d.cls, ov ? "ov" : "", styleOf[a] || "", lockedSet.has(a) ? "lk" : "", targetSet.has(a) ? "tg" : "", (sheet.rawOf(a) + "")[0] === "=" ? "fx" : ""].filter(Boolean).join(" ");
        el.title = d.cls === "err" ? (sheet.value(a).why || ERR_HELP[d.text] || "") : "";
      }
      table.classList.toggle("show-f", showFormulas);
      placeSel(); paintHeads(); syncBar(); paintStatus();
    }
    const box = (g) => {
      const a = td(A(g.c1, g.r1)), b = td(A(g.c2, g.r2));
      return { left: a.offsetLeft, top: a.offsetTop, width: b.offsetLeft + b.offsetWidth - a.offsetLeft, height: b.offsetTop + b.offsetHeight - a.offsetTop };
    };
    const place = (el, g) => { const b = box(g); Object.assign(el.style, { left: b.left + "px", top: b.top + "px", width: b.width + "px", height: b.height + "px" }); };
    const selRange = () => ({ c1: Math.min(sel.c, anchor.c), r1: Math.min(sel.r, anchor.r), c2: Math.max(sel.c, anchor.c), r2: Math.max(sel.r, anchor.r) });
    function placeSel() { place(selBox, selRange()); selBox.classList.toggle("multi", sel.c !== anchor.c || sel.r !== anchor.r); }
    function paintHeads() {
      const g = selRange();
      table.querySelectorAll(".xl-ch").forEach(h => h.classList.toggle("on", +h.dataset.c >= g.c1 && +h.dataset.c <= g.c2));
      table.querySelectorAll(".xl-rh").forEach(h => h.classList.toggle("on", +h.dataset.r >= g.r1 && +h.dataset.r <= g.r2));
      nameBox.textContent = (g.c1 === g.c2 && g.r1 === g.r2) ? A(sel.c, sel.r) : rangeText(g);
    }
    const cur = () => A(sel.c, sel.r);
    function syncBar() { if (edit) return; const raw = sheet.rawOf(cur()); bar.value = raw === null ? "" : typeof raw === "number" ? fmtGeneral(raw) : String(raw); }
    let flashMsg = null, flashT = 0;
    function paintStatus() {
      if (flashMsg) { status.innerHTML = flashMsg; status.className = "xl-status warn"; return; }
      const v = sheet.value(cur());
      if (isErr(v)) { status.innerHTML = `<b>${esc(v.code)}</b> ${esc(v.why || ERR_HELP[v.code] || "")}`; status.className = "xl-status err"; return; }
      status.innerHTML = ""; status.className = "xl-status";
    }
    function say(html, ms = 3600) { flashMsg = html; paintStatus(); clearTimeout(flashT); flashT = setTimeout(() => { flashMsg = null; paintStatus(); }, ms); }

    /* ----- changing cells (undo-able) ----- */
    const userCells = () => { const out = {}; for (const [a, v] of Object.entries(sheet.raw)) if (initial[a] !== v) out[a] = v; for (const a of Object.keys(initial)) if (!(a in sheet.raw)) out[a] = ""; return out; };
    function commitChanges(changes, why) {
      const real = Object.entries(changes).filter(([a, v]) => (sheet.rawOf(a) ?? "") !== (v ?? ""));
      if (!real.length) return false;
      history.push(Object.fromEntries(real.map(([a]) => [a, sheet.rawOf(a)]))); if (history.length > 200) history.shift(); future = [];
      real.forEach(([a, v]) => sheet.set(a, v));
      copyBox.hidden = true; clip = clip && why === "paste" ? clip : null;
      paint(); o.onChange && o.onChange(api, why, real.map(([a]) => a));
      return true;
    }
    function undo(redo) {
      const from = redo ? future : history, to = redo ? history : future, step = from.pop();
      if (!step) return;
      to.push(Object.fromEntries(Object.keys(step).map(a => [a, sheet.rawOf(a)])));
      Object.entries(step).forEach(([a, v]) => sheet.set(a, v));
      paint(); o.onChange && o.onChange(api, redo ? "redo" : "undo", Object.keys(step));
    }
    const lockedMsg = () => say(o.lockedText || "Ez a cella adat, ezt nem kell átírni. A kiemelt cellákba dolgozz!");

    /* ----- selection ----- */
    function select(c, r, extend) {
      c = Math.max(0, Math.min(cols - 1, c)); r = Math.max(0, Math.min(rows - 1, r));
      sel = { c, r }; if (!extend) anchor = { c, r };
      placeSel(); paintHeads(); syncBar(); paintStatus(); scrollInto(td(A(c, r)));
      o.onSelect && o.onSelect(api, A(c, r));
    }
    function scrollInto(el) {
      const W = wrap, l = el.offsetLeft, t = el.offsetTop, w = el.offsetWidth, h = el.offsetHeight;
      if (l < W.scrollLeft + 38) W.scrollLeft = l - 38; else if (l + w > W.scrollLeft + W.clientWidth) W.scrollLeft = l + w - W.clientWidth;
      if (t < W.scrollTop + 26) W.scrollTop = t - 26; else if (t + h > W.scrollTop + W.clientHeight) W.scrollTop = t + h - W.clientHeight;
    }

    /* ----- editing ----- */
    function startEdit(seed, where) {
      const a = cur();
      if (lockedSet.has(a)) { lockedMsg(); return false; }
      const raw = sheet.rawOf(a);
      const orig = raw === null ? "" : typeof raw === "number" ? fmtGeneral(raw) : String(raw);
      edit = { a, orig, input: where === "bar" ? bar : cellEd, point: null };
      const b = box({ c1: sel.c, r1: sel.r, c2: sel.c, r2: sel.r });
      Object.assign(cellEd.style, { left: b.left + "px", top: b.top + "px", minWidth: b.width + "px", height: b.height + "px" });
      cellEd.hidden = false; host.classList.add("editing");
      const text = seed !== undefined ? seed : orig;
      cellEd.value = text; bar.value = text;
      edit.input.focus();
      const L = edit.input.value.length; edit.input.setSelectionRange(L, L);
      fitEditor(); afterType();
      return true;
    }
    function fitEditor() { cellEd.style.width = Math.max(parseFloat(cellEd.style.minWidth) || 0, (cellEd.value.length + 2) * 8.6) + "px"; }
    function endEdit() { edit = null; cellEd.hidden = true; host.classList.remove("editing"); refsBox.innerHTML = ""; pop.hidden = true; tip.hidden = true; }
    function commitEdit(move) {
      if (!edit) return true;
      let text = edit.input.value;
      if (/^[+]/.test(text) && text.length > 1 && !/^[+-]?\d/.test(text)) text = "=" + text.slice(1);
      if (text.startsWith("=")) {
        /* like Excel: missing closing brackets at the end are added on Enter */
        let open = 0, inS = false; for (const ch of text) { if (ch === '"') inS = !inS; else if (!inS) open += ch === "(" ? 1 : ch === ")" ? -1 : 0; }
        if (open > 0 && !inS) text += ")".repeat(open);
        try { if (text.trim() !== "=") parse(text.slice(1)); else throw new SyntaxErr("Az egyenlőségjel után nincs semmi."); }
        catch (e) { say(`<b>Probléma van ezzel a képlettel.</b> ${esc(e.message)} <span class="k">(Esc: mégse)</span>`, 7000); edit.input.focus(); return false; }
        text = tidy(text.trim());
      }
      flashMsg = null;
      const a = edit.a, val = text === "" ? "" : (text[0] !== "=" && parseNum(text) !== null && !/^\s*0\d/.test(text)) ? parseNum(text) : text;
      endEdit();
      commitChanges({ [a]: val }, "edit");
      if (move) select(sel.c + move[0], sel.r + move[1]);
      wrap.focus({ preventScroll: true });
      return true;
    }
    function cancelEdit() { if (!edit) return; endEdit(); syncBar(); paintStatus(); wrap.focus({ preventScroll: true }); }

    /* where a cell reference may go next: right after =, (, ;, an operator */
    const wantsRef = () => {
      if (!edit) return false;
      const t = edit.input.value; if (t[0] !== "=") return false;
      if (edit.point) return true;
      const before = t.slice(0, edit.input.selectionStart).replace(/\s+$/, "");
      return /[=(;+\-*/^&<>:]$/.test(before);
    };
    function insertRef(g) {
      const inp = edit.input, t = inp.value, ref = rangeText(g);
      let s, e;
      if (edit.point) { s = edit.point.s; e = edit.point.e; } else { s = inp.selectionStart; e = inp.selectionEnd; }
      inp.value = t.slice(0, s) + ref + t.slice(e);
      edit.point = { s, e: s + ref.length };
      const other = inp === bar ? cellEd : bar; other.value = inp.value;
      inp.focus(); inp.setSelectionRange(s + ref.length, s + ref.length);
      fitEditor(); afterType(true);
    }
    /* coloured frames round every reference in the formula being typed, like Excel does */
    function paintRefs(text) {
      refsBox.innerHTML = "";
      if (!text || text[0] !== "=") return;
      let toks; try { toks = tokenize(text.slice(1)); } catch (e) { return; }
      let k = 0;
      for (let i = 0; i < toks.length; i++) {
        const tk = toks[i]; if (tk.t !== "ref") continue;
        let g = { c1: tk.c, r1: tk.r, c2: tk.c, r2: tk.r };
        if (toks[i + 1] && toks[i + 1].v === ":" && toks[i + 2] && toks[i + 2].t === "ref") { const b = toks[i + 2]; g = { c1: Math.min(tk.c, b.c), r1: Math.min(tk.r, b.r), c2: Math.max(tk.c, b.c), r2: Math.max(tk.r, b.r) }; i += 2; }
        if (g.c2 >= cols || g.r2 >= rows) continue;
        const d = document.createElement("div"); d.className = "xl-ref"; d.style.setProperty("--rc", COLORS[k++ % COLORS.length]);
        refsBox.appendChild(d); place(d, g);
      }
    }
    /* the little help line under the cell: SZUM(szám1; [szám2]; …) with the current part in bold */
    function callAt(text, caret) {
      let depth = 0, arg = 0, inStr = false;
      for (let i = caret - 1; i >= 0; i--) {
        const ch = text[i];
        if (ch === '"') { inStr = !inStr; continue; }
        if (inStr) continue;
        if (ch === ")") depth++;
        else if (ch === "(") { if (depth === 0) { const m = new RegExp(`[${LETTER}][${LETTER}0-9.]*$`).exec(text.slice(0, i)); return m ? { name: m[0].toLocaleUpperCase("hu"), arg } : null; } depth--; }
        else if (ch === ";" && depth === 0) arg++;
      }
      return null;
    }
    let acList = [], acIdx = 0;
    function afterType(fromPointing) {
      if (!edit) return;
      const inp = edit.input, t = inp.value, caret = inp.selectionStart;
      if (!fromPointing) edit.point = null;
      paintRefs(t);
      /* function-name suggestions */
      acList = [];
      if (t[0] === "=") {
        const m = new RegExp(`(^|[=(;+\\-*/^&<> ])([${LETTER}][${LETTER}0-9]*)$`).exec(t.slice(0, caret));
        if (m && !/^[A-Za-z]{1,2}\d+$/.test(m[2])) {
          const w = m[2].toLocaleUpperCase("hu"), plain = s => s.normalize("NFD").replace(/[̀-ͯ]/g, "");
          acList = Object.keys(FN).filter(n => (o.functions ? o.functions.includes(n) : true) && (n.startsWith(w) || plain(n).startsWith(plain(w))));
          if (acList.length === 1 && acList[0] === w) acList = [];
        }
      }
      const anchorBox = box({ c1: sel.c, r1: sel.r, c2: sel.c, r2: sel.r });
      if (acList.length) {
        acIdx = Math.min(acIdx, acList.length - 1);
        pop.innerHTML = acList.map((n, i) => `<button type="button" class="${i === acIdx ? "on" : ""}" data-fn="${n}"><b>${n}</b><span>${esc(FN[n].desc)}</span></button>`).join("") + `<p class="k">Tab: beírja</p>`;
        pop.hidden = false; tip.hidden = true;
        placeFloat(pop, anchorBox);
        return;
      }
      pop.hidden = true;
      const call = t[0] === "=" ? callAt(t, caret) : null, f = call && FN[call.name];
      if (f) {
        const parts = f.args.split("; ").map((p, i) => i === Math.min(call.arg, f.args.split("; ").length - 1) || (p === "…" && call.arg >= i) ? `<b>${esc(p)}</b>` : esc(p));
        tip.innerHTML = `<span class="fn">${f.name}</span>(${parts.join("; ")})`;
        tip.hidden = false; placeFloat(tip, anchorBox);
      } else tip.hidden = true;
    }
    function placeFloat(el, b) {
      const hr = host.getBoundingClientRect(), wr = wrap.getBoundingClientRect();
      let left = b.left - wrap.scrollLeft + (wr.left - hr.left), top = b.top + b.height - wrap.scrollTop + (wr.top - hr.top) + 4;
      left = Math.max(4, Math.min(left, host.clientWidth - el.offsetWidth - 4));
      Object.assign(el.style, { left: left + "px", top: top + "px" });
    }
    function acceptAc(name) {
      const inp = edit.input, t = inp.value, caret = inp.selectionStart;
      const m = new RegExp(`[${LETTER}][${LETTER}0-9]*$`).exec(t.slice(0, caret));
      const s = m ? caret - m[0].length : caret;
      inp.value = t.slice(0, s) + name + "(" + t.slice(caret);
      (inp === bar ? cellEd : bar).value = inp.value;
      const p = s + name.length + 1; inp.setSelectionRange(p, p); acIdx = 0; fitEditor(); afterType();
    }
    pop.addEventListener("mousedown", e => { const b = e.target.closest("button[data-fn]"); if (b && edit) { e.preventDefault(); acceptAc(b.dataset.fn); } });

    function editorKeys(e) {
      if (!edit) return;
      if (!pop.hidden && acList.length) {
        if (e.key === "ArrowDown" || e.key === "ArrowUp") { e.preventDefault(); acIdx = (acIdx + (e.key === "ArrowDown" ? 1 : acList.length - 1)) % acList.length; afterType(); return; }
        if (e.key === "Tab") { e.preventDefault(); acceptAc(acList[acIdx]); return; }
      }
      if (e.key === "Enter") { e.preventDefault(); commitEdit(e.shiftKey ? [0, -1] : [0, 1]); return; }
      if (e.key === "Tab") { e.preventDefault(); commitEdit(e.shiftKey ? [-1, 0] : [1, 0]); return; }
      if (e.key === "Escape") { e.preventDefault(); cancelEdit(); return; }
      if (e.key === "F4") { e.preventDefault(); const r = cycleAbs(edit.input.value, edit.input.selectionStart); if (r) { edit.input.value = r.text; (edit.input === bar ? cellEd : bar).value = r.text; edit.input.setSelectionRange(r.caret, r.caret); afterType(); } return; }
      /* a plain value typed straight into a cell: arrow keys finish it, like in Excel */
      if (edit.input === cellEd && edit.typed && edit.input.value[0] !== "=" && ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key)) {
        e.preventDefault(); commitEdit({ ArrowUp: [0, -1], ArrowDown: [0, 1], ArrowLeft: [-1, 0], ArrowRight: [1, 0] }[e.key]);
      }
    }
    for (const inp of [cellEd, bar]) {
      inp.addEventListener("keydown", editorKeys);
      inp.addEventListener("input", () => { if (!edit) return; (inp === bar ? cellEd : bar).value = inp.value; fitEditor(); afterType(); });
      inp.addEventListener("click", () => edit && afterType(!!edit.point));
      inp.addEventListener("keyup", e => { if (edit && /Arrow|Home|End/.test(e.key)) afterType(); });
    }
    bar.addEventListener("focus", () => { if (!edit) { if (!startEdit(undefined, "bar")) bar.blur(); } else if (edit.input !== bar) { edit.input = bar; } });
    cellEd.addEventListener("focus", () => { if (edit) edit.input = cellEd; });
    cellEd.addEventListener("blur", () => setTimeout(() => { if (edit && document.activeElement !== bar && document.activeElement !== cellEd && !pointing) commitEdit(null); }, 0));
    bar.addEventListener("blur", () => setTimeout(() => { if (edit && document.activeElement !== bar && document.activeElement !== cellEd && !pointing) commitEdit(null); }, 0));

    /* ----- keyboard on the grid ----- */
    wrap.addEventListener("keydown", e => {
      if (edit || e.target !== wrap) return;
      const k = e.key, ctrl = e.ctrlKey || e.metaKey;
      const moves = { ArrowUp: [0, -1], ArrowDown: [0, 1], ArrowLeft: [-1, 0], ArrowRight: [1, 0] };
      if (moves[k]) { e.preventDefault(); const [dc, dr] = moves[k]; select(sel.c + dc, sel.r + dr, e.shiftKey); return; }
      if (k === "Enter") { e.preventDefault(); select(sel.c, sel.r + (e.shiftKey ? -1 : 1)); return; }
      if (k === "Tab") { e.preventDefault(); select(sel.c + (e.shiftKey ? -1 : 1), sel.r); return; }
      if (k === "F2") { e.preventDefault(); startEdit(); return; }
      if (k === "Delete" || k === "Backspace") {
        e.preventDefault();
        const cells = cellsOf(selRange()), ok = cells.filter(a => !lockedSet.has(a));
        if (ok.length < cells.length && !ok.length) { lockedMsg(); return; }
        commitChanges(Object.fromEntries(ok.map(a => [a, ""])), "clear"); return;
      }
      if (ctrl && (k === "z" || k === "Z")) { e.preventDefault(); undo(e.shiftKey); return; }
      if (ctrl && (k === "y" || k === "Y")) { e.preventDefault(); undo(true); return; }
      if (ctrl && (k === "c" || k === "C" || k === "x" || k === "X")) { e.preventDefault(); copySel(); return; }
      if (ctrl && (k === "v" || k === "V")) { e.preventDefault(); pasteAt(); return; }
      if (ctrl && (k === "ö" || k === "`" || k === "Ö")) { e.preventDefault(); setShowFormulas(!showFormulas); return; }
      if (k === "Escape") { copyBox.hidden = true; clip = null; return; }
      if (!ctrl && !e.altKey && k.length === 1) { e.preventDefault(); if (startEdit(k)) edit.typed = true; }
    });

    /* ----- copy and paste (references move along, $ ones stay) ----- */
    function copySel() {
      const g = selRange(), data = [];
      for (let r = g.r1; r <= g.r2; r++) { const row = []; for (let c = g.c1; c <= g.c2; c++) row.push(sheet.rawOf(A(c, r))); data.push(row); }
      clip = { g, data }; copyBox.hidden = false; place(copyBox, g);
      say("Másolva. Kattints oda, ahová be akarod illeszteni, és nyomd meg: Ctrl+V.", 3000);
      try { navigator.clipboard && navigator.clipboard.writeText(data.map(r => r.map(v => v === null ? "" : textOf(v)).join("\t")).join("\n")); } catch (err) {}
    }
    function pasteAt() {
      if (!clip) { say("Előbb másolj ki valamit: jelöld ki, és nyomd meg: Ctrl+C."); return; }
      const g = selRange(), h = clip.data.length, w = clip.data[0].length;
      const tr = Math.max(h, g.r2 - g.r1 + 1), tc = Math.max(w, g.c2 - g.c1 + 1), ch = {};
      let blocked = 0;
      for (let r = 0; r < tr; r++) for (let c = 0; c < tc; c++) {
        const tc_ = g.c1 + c, tr_ = g.r1 + r; if (tc_ >= cols || tr_ >= rows) continue;
        const a = A(tc_, tr_); if (lockedSet.has(a)) { blocked++; continue; }
        const src = clip.data[r % h][c % w];
        ch[a] = shiftFormula(src, tr_ - (clip.g.r1 + r % h), tc_ - (clip.g.c1 + c % w)) ?? "";
      }
      if (blocked && !Object.keys(ch).length) { lockedMsg(); return; }
      commitChanges(ch, "paste");
      anchor = { c: g.c1, r: g.r1 }; sel = { c: Math.min(cols - 1, g.c1 + tc - 1), r: Math.min(rows - 1, g.r1 + tr - 1) }; placeSel(); paintHeads(); syncBar();
    }

    /* ----- mouse / touch: select, point at cells while typing a formula, drag the fill handle ----- */
    let dragging = null, pointing = false;
    const cellAt = (x, y) => {
      const el = document.elementFromPoint(x, y), t = el && el.closest && el.closest("td[data-a]");
      if (t && table.contains(t)) return parseA(t.dataset.a);
      const r = table.getBoundingClientRect(); if (!r.width) return null;
      /* outside the table: clamp to the nearest cell along the drag */
      const tds = table.tBodies[0].rows; let best = null;
      const rr = Math.max(0, Math.min(rows - 1, [...tds].findIndex(tr => tr.getBoundingClientRect().bottom > y) === -1 ? rows - 1 : [...tds].findIndex(tr => tr.getBoundingClientRect().bottom > y)));
      const cells = [...tds[rr].cells].slice(1); let cc = cells.findIndex(c => c.getBoundingClientRect().right > x); if (cc === -1) cc = cols - 1;
      best = { c: cc, r: rr }; return best;
    };
    stage.addEventListener("pointerdown", e => {
      if (e.button !== 0) return;
      if (e.target.classList.contains("xl-handle")) { e.preventDefault(); startFill(e); return; }
      const t = e.target.closest("td[data-a]"); if (!t) return;
      const p = parseA(t.dataset.a);
      if (edit && wantsRef()) {
        e.preventDefault(); pointing = true;
        dragging = { mode: "point", start: p }; insertRef({ c1: p.c, r1: p.r, c2: p.c, r2: p.r });
        stage.setPointerCapture(e.pointerId); return;
      }
      if (edit && !commitEdit(null)) { e.preventDefault(); return; }
      e.preventDefault();
      if (e.shiftKey) select(p.c, p.r, true); else select(p.c, p.r);
      dragging = { mode: "select" };
      stage.setPointerCapture(e.pointerId);
      wrap.focus({ preventScroll: true });
    });
    stage.addEventListener("pointermove", e => {
      if (!dragging) return;
      const p = cellAt(e.clientX, e.clientY); if (!p) return;
      if (dragging.mode === "select") { if (p.c !== sel.c || p.r !== sel.r) select(p.c, p.r, true); }
      else if (dragging.mode === "point") { const s = dragging.start; insertRef({ c1: Math.min(s.c, p.c), r1: Math.min(s.r, p.r), c2: Math.max(s.c, p.c), r2: Math.max(s.r, p.r) }); }
      else if (dragging.mode === "fill") moveFill(p);
    });
    const endDrag = () => {
      if (!dragging) return;
      if (dragging.mode === "fill") finishFill();
      if (dragging.mode === "point") { pointing = false; edit && edit.input.focus(); }
      dragging = null;
    };
    stage.addEventListener("pointerup", endDrag);
    stage.addEventListener("pointercancel", endDrag);
    stage.addEventListener("dblclick", e => { const t = e.target.closest("td[data-a]"); if (t && !edit) { const p = parseA(t.dataset.a); select(p.c, p.r); startEdit(); } });

    /* fill handle: drag down or right, formulas are copied with their references moved */
    function startFill(e) {
      if (edit && !commitEdit(null)) return;
      dragging = { mode: "fill", src: selRange(), to: null };
      stage.setPointerCapture(e.pointerId);
      host.classList.add("filling");
    }
    function moveFill(p) {
      const s = dragging.src;
      let g = null;
      const down = p.r - s.r2, right = p.c - s.c2;
      if (down > 0 && down >= right) g = { c1: s.c1, r1: s.r1, c2: s.c2, r2: p.r };
      else if (right > 0) g = { c1: s.c1, r1: s.r1, c2: p.c, r2: s.r2 };
      dragging.to = g;
      if (g) { fillBox.hidden = false; place(fillBox, g); } else fillBox.hidden = true;
    }
    function finishFill() {
      fillBox.hidden = true; host.classList.remove("filling");
      const s = dragging.src, g = dragging.to; if (!g) return;
      const ch = {}, h = s.r2 - s.r1 + 1, w = s.c2 - s.c1 + 1; let blocked = 0;
      for (let r = g.r1; r <= g.r2; r++) for (let c = g.c1; c <= g.c2; c++) {
        if (inRange(s, c, r)) continue;
        const a = A(c, r); if (lockedSet.has(a)) { blocked++; continue; }
        const sr = s.r1 + ((r - s.r1) % h), sc = s.c1 + ((c - s.c1) % w);
        ch[a] = shiftFormula(sheet.rawOf(A(sc, sr)), r - sr, c - sc) ?? "";
      }
      if (blocked) say("Néhány cellát nem írtam felül, mert azok adatok.");
      commitChanges(ch, "fill");
      anchor = { c: g.c1, r: g.r1 }; sel = { c: g.c2, r: g.r2 }; placeSel(); paintHeads(); syncBar();
      wrap.focus({ preventScroll: true });
    }

    function setShowFormulas(on) { showFormulas = on; toggle.setAttribute("aria-pressed", on); paint(); }
    toggle.addEventListener("click", () => setShowFormulas(!showFormulas));
    addEventListener("resize", () => { placeSel(); if (!copyBox.hidden && clip) place(copyBox, clip.g); });

    /* ----- what the pages can use ----- */
    const api = {
      sheet, el: host,
      raw: a => sheet.rawOf(a.toUpperCase()),
      value: a => sheet.value(a.toUpperCase()),
      text: a => display(a.toUpperCase()).text,
      calc: (f, at) => sheet.calc(f, at),
      set(a, v) { sheet.set(a.toUpperCase(), v); paint(); },
      setMany(map, why) { return commitChanges(Object.fromEntries(Object.entries(map).map(([a, v]) => [a.toUpperCase(), v])), why || "set"); },
      load(map) { for (const [a, v] of Object.entries(map || {})) sheet.set(a.toUpperCase(), v === "" ? undefined : v); history = []; future = []; paint(); },
      userCells,
      reset() { sheet.raw = {}; Object.entries(initial).forEach(([a, v]) => sheet.set(a, v)); history = []; future = []; paint(); o.onChange && o.onChange(api, "reset", []); },
      setTargets(list) { targetSet = new Set(); (list || []).forEach(k => { const g = rangeOf(k, rows); if (g) cellsOf(g).forEach(a => targetSet.add(a)); }); paint(); },
      setLocked(list) { setLocked(list); paint(); },
      select(a, b) { const p = parseA(a); if (!p) return; select(p.c, p.r); if (b) { const q = parseA(b); select(q.c, q.r, true); } },
      say, paint, showFormulas: setShowFormulas,
      focus() { wrap.focus({ preventScroll: true }); },
      get editing() { return !!edit; }
    };
    paint();
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => placeSel());
    return api;
  }

  /* ---------- checking a student's cells against a model formula ----------
     spec: { range: "G2:G9", ref: "=B2*F2",   (model formula for the first cell; it is moved along like a fill)
             use: ["SZUM"], noConst: true, allow: [100], abs: ["G10"], text: "…", traps: [fn(raw, val, exp, a) -> msg] } */
  function same(v, e) {
    if (isErr(e)) return isErr(v) && v.code === e.code;
    if (typeof e === "number") return typeof v === "number" && Math.abs(v - e) <= 1e-6 * Math.max(1, Math.abs(e));
    if (typeof e === "string") return typeof v === "string" && low(v.trim()) === low(e.trim());
    return v === e;
  }
  function usedIn(raw) {
    const out = { fns: new Set(), nums: [], refs: [], ok: false };
    if (typeof raw !== "string" || raw[0] !== "=") return out;
    try {
      const toks = tokenize(raw.slice(1)); out.ok = true;
      toks.forEach(t => { if (t.t === "fn") out.fns.add(t.v); if (t.t === "num") out.nums.push(t.v); if (t.t === "ref") out.refs.push(t); });
    } catch (e) {}
    return out;
  }
  function check(g, spec) {
    const rg = rangeOf(spec.range, g.sheet.rows), cells = cellsOf(rg), res = { ok: true, done: 0, total: cells.length, msg: null, at: null };
    const first = { c: rg.c1, r: rg.r1 };
    for (const a of cells) {
      const p = parseA(a), raw = g.raw(a), val = g.value(a);
      const expF = spec.ref ? shiftFormula(spec.ref, p.r - first.r, p.c - first.c) : null;
      const exp = spec.expect !== undefined ? (typeof spec.expect === "function" ? spec.expect(g, a) : spec.expect) : g.calc(expF, a);
      let msg = null;
      const u = usedIn(raw), isF = typeof raw === "string" && raw[0] === "=";
      if (raw === null || raw === "") {
        const k = cells.indexOf(a), lastA = cells[cells.length - 1];
        msg = k > 0 && res.done === k
          ? `${Az(cells[0])} ${cells[0]} már jó! Most fogd meg a sarkában lévő kis négyzetet (a kitöltőjelet), és húzd ${rg.c1 === rg.c2 ? "le" : "jobbra"} ${az(lastA)} ${lastA}-ig.`
          : `${Az(a)} ${a} cella még üres.`;
      }
      else if (spec.formula !== false && !isF) msg = same(typeof raw === "number" ? raw : parseNum(String(raw)) ?? raw, exp)
        ? `${Az(a)} ${a} cellában jó a szám, de fejben számoltad ki. Írj képletet = jellel, hogy magától frissüljön, ha változnak az adatok!`
        : `${Az(a)} ${a} cellába képlet kell, ami = jellel kezdődik.`;
      else if (isErr(val) && !same(val, exp)) msg = `${Az(a)} ${a} cella hibát mutat (${val.code}). ${val.why || ERR_HELP[val.code] || ""}`;
      if (!msg && spec.traps) for (const t of spec.traps) { const m = t(raw, val, exp, a, g); if (m) { msg = m; break; } }
      if (!msg && spec.use) for (const f of spec.use) if (!u.fns.has(f)) { msg = same(val, exp) ? `${Az(a)} ${a} cellában jó az eredmény, de most ${az(f)} ${f} függvényt gyakoroljuk: használd!` : `${Az(a)} ${a} cellában használd ${az(f)} ${f} függvényt.`; break; }
      if (!msg && spec.noConst) {
        const bad = u.nums.filter(n => !(spec.allow || []).includes(n));
        if (bad.length) msg = `${Az(a)} ${a} képletében ott egy beírt szám (${fmtGeneral(bad[0])}). Ne a számot írd be, hanem hivatkozz arra a cellára, ahol az adat van!`;
      }
      if (!msg && spec.abs && a !== cells[0]) for (const t of spec.abs) {
        const q = parseA(t); if (!u.refs.some(r => r.c === q.c && r.r === q.r)) { msg = `${Az(a)} ${a} képlete már nem ${az(t)} ${t} cellára mutat: másoláskor elcsúszott. Rögzítsd $ jellel: $${t.replace(/(\d)/, "$$$1")}`; break; }
      }
      if (!msg && !same(val, exp)) msg = spec.wrong ? spec.wrong(raw, val, exp, a) : `${Az(a)} ${a} értéke ${textOf(val) || "üres"}, de ez nem stimmel. Nézd meg, jó cellákra hivatkozol-e.`;
      if (msg) { res.ok = false; if (!res.msg) { res.msg = msg; res.at = a; } } else res.done++;
    }
    return res;
  }

  window.XL = { grid, Sheet, parse, tokenize, evaluate, shiftFormula, tidy, check, rangeOf, cellsOf, parseA, A, colName, FN, FORMATS, fmtGeneral, textOf, isErr, az, Az, ERR_HELP };
})();
