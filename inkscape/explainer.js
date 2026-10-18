/* Inkscape explainers: small live demos of what the menus do, plus the quiz.
   Each demo is a <div class="viz" data-w="…"> on the page; the page sets window.EXPL = { ui: {…} } with its own words. */
(function () {
  const UI = (window.EXPL && window.EXPL.ui) || {};
  const $ = (s, el = document) => el.querySelector(s), $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const NS = "http://www.w3.org/2000/svg";
  let uid = 0;

  /* ---------- shapes as path data, the way Inkscape stores them after "Object to Path" ---------- */
  const circle = (cx, cy, r) => `M${cx - r} ${cy}a${r} ${r} 0 1 0 ${2 * r} 0a${r} ${r} 0 1 0 ${-2 * r} 0z`;
  const rect = (x, y, w, h) => `M${x} ${y}h${w}v${h}h${-w}z`;
  const SHAPES = { circle: circle(112, 104, 66), square: rect(124, 44, 120, 120) };
  const COL = { bottom: "#7fb3e0", top: "#f2d264", result: "#e86a92", ink: "#2b2d42" };

  /* ---------- 1. path operations: Union, Difference, Intersection, Exclusion ---------- */
  function booleans(box) {
    const ops = ["union", "difference", "intersection", "exclusion"];
    let op = "difference", squareOnTop = true;
    $(".viz-body", box).innerHTML = `
      <div class="chips" role="group" aria-label="${UI.opsLabel}">${ops.map(o => `<button type="button" class="chip ui" data-op="${o}">${UI.ops[o]}</button>`).join("")}</div>
      <div class="ctrl"><label><input type="checkbox" class="swap" checked> ${UI.squareOnTop}</label></div>
      <div class="stage">
        <div class="panel"><p class="ph">${UI.before}</p><svg viewBox="0 0 320 210" class="b-before" aria-hidden="true"></svg></div>
        <div class="panel"><p class="ph">${UI.after}</p><svg viewBox="0 0 320 210" class="b-after" role="img"></svg></div>
      </div>
      <p class="vnote" aria-live="polite"></p>`;
    const before = $(".b-before", box), after = $(".b-after", box), note = $(".vnote", box);
    const draw = () => {
      const bot = squareOnTop ? "circle" : "square", top = squareOnTop ? "square" : "circle";
      const id = "b" + (++uid);
      before.innerHTML = `
        <path d="${SHAPES[bot]}" fill="${COL.bottom}" stroke="${COL.ink}" stroke-width="2.5"/>
        <path d="${SHAPES[top]}" fill="${COL.top}" fill-opacity=".92" stroke="${COL.ink}" stroke-width="2.5"/>
        <text x="${bot === "circle" ? 52 : 250}" y="200" font-size="13" fill="${COL.ink}" font-family="Atkinson Hyperlegible,sans-serif" font-weight="700">${UI.bottom}</text>
        <text x="${top === "square" ? 196 : 40}" y="30" font-size="13" fill="${COL.ink}" font-family="Atkinson Hyperlegible,sans-serif" font-weight="700">${UI.top}</text>`;
      const ghost = `<g fill="none" stroke="#9a9484" stroke-width="1.5" stroke-dasharray="5 5"><path d="${SHAPES.circle}"/><path d="${SHAPES.square}"/></g>`;
      let res = "";
      if (op === "union") res = `<g fill="${COL.result}"><path d="${SHAPES.circle}"/><path d="${SHAPES.square}"/></g>`;
      if (op === "difference") res = `<mask id="${id}"><rect width="320" height="210" fill="#fff"/><path d="${SHAPES[top]}" fill="#000"/></mask><path d="${SHAPES[bot]}" fill="${COL.result}" mask="url(#${id})"/>`;
      if (op === "intersection") res = `<clipPath id="${id}"><path d="${SHAPES[top]}"/></clipPath><path d="${SHAPES[bot]}" fill="${COL.result}" clip-path="url(#${id})"/>`;
      if (op === "exclusion") res = `<path d="${SHAPES.circle} ${SHAPES.square}" fill="${COL.result}" fill-rule="evenodd"/>`;
      after.innerHTML = ghost + res;
      after.setAttribute("aria-label", UI.say[op]);
      note.innerHTML = UI.say[op] + (op === "difference" ? " " + (squareOnTop ? UI.diffSquare : UI.diffCircle) : "");
      $$(".chip", box).forEach(b => b.setAttribute("aria-pressed", String(b.dataset.op === op)));
    };
    $(".chips", box).onclick = e => { const b = e.target.closest(".chip"); if (b) { op = b.dataset.op; draw(); } };
    $(".swap", box).onchange = e => { squareOnTop = e.target.checked; draw(); };
    draw();
  }

  /* ---------- 2. a rectangle, then the same rectangle as a path: handles vs nodes ---------- */
  function nodes(box) {
    let asPath = false, curve = false;
    let r = { x: 60, y: 50, w: 200, h: 110, rx: 0 };
    let pts = [];                                    /* path mode: four corner nodes, clockwise from top left */
    let hnd = null;                                  /* the two curve handles of the top edge, when it is curved */
    $(".viz-body", box).innerHTML = `
      <div class="chips" role="group">
        <button type="button" class="chip ui m-rect" aria-pressed="true">${UI.asRect}</button>
        <button type="button" class="chip ui m-path" aria-pressed="false">${UI.toPath}</button>
        <button type="button" class="chip ui m-curve" aria-pressed="false" hidden>${UI.curve}</button>
      </div>
      <div class="panel"><svg viewBox="0 0 320 210" class="n-svg" role="img" aria-label="${UI.nodesAria}"></svg></div>
      <div class="legend"></div>
      <p class="vnote" aria-live="polite"></p>`;
    const svg = $(".n-svg", box), note = $(".vnote", box), legend = $(".legend", box);
    const toPath = () => { pts = [[r.x, r.y], [r.x + r.w, r.y], [r.x + r.w, r.y + r.h], [r.x, r.y + r.h]]; hnd = null; };
    const pathD = () => {
      const [a, b, c, d] = pts;
      const top = hnd ? `C${hnd[0][0]} ${hnd[0][1]} ${hnd[1][0]} ${hnd[1][1]} ${b[0]} ${b[1]}` : `L${b[0]} ${b[1]}`;
      return `M${a[0]} ${a[1]}${top}L${c[0]} ${c[1]}L${d[0]} ${d[1]}Z`;
    };
    const draw = () => {
      let s = "";
      if (!asPath) {
        s = `<rect x="${r.x}" y="${r.y}" width="${r.w}" height="${r.h}" rx="${r.rx}" fill="${COL.result}" stroke="${COL.ink}" stroke-width="2.5"/>
             <rect class="h" data-h="size" x="${r.x + r.w - 7}" y="${r.y + r.h - 7}" width="14" height="14" fill="#fff" stroke="${COL.ink}" stroke-width="2" style="cursor:nwse-resize"/>
             <circle class="h" data-h="round" cx="${r.x + r.w - Math.max(r.rx, 0)}" cy="${r.y}" r="7" fill="#fff" stroke="${COL.ink}" stroke-width="2" style="cursor:ew-resize"/>`;
        legend.innerHTML = `<span><i class="s"></i>${UI.lgSize}</span><span><i class="r"></i>${UI.lgRound}</span>`;
        note.innerHTML = UI.rectNote;
      } else {
        s = `<path d="${pathD()}" fill="${COL.result}" stroke="${COL.ink}" stroke-width="2.5"/>`;
        if (hnd) s += `<g stroke="#5b6660" stroke-width="1.5"><line x1="${pts[0][0]}" y1="${pts[0][1]}" x2="${hnd[0][0]}" y2="${hnd[0][1]}"/><line x1="${pts[1][0]}" y1="${pts[1][1]}" x2="${hnd[1][0]}" y2="${hnd[1][1]}"/></g>` +
                     hnd.map((p, i) => `<circle class="h" data-h="c${i}" cx="${p[0]}" cy="${p[1]}" r="6" fill="${COL.ink}" style="cursor:move"/>`).join("");
        /* corner (cusp) nodes are diamonds in Inkscape */
        s += pts.map((p, i) => `<path class="h" data-h="p${i}" d="M${p[0]} ${p[1] - 8}l8 8l-8 8l-8 -8z" fill="#fff" stroke="${COL.ink}" stroke-width="2" style="cursor:move"/>`).join("");
        legend.innerHTML = `<span><i class="d"></i>${UI.lgNode}</span>${hnd ? `<span><i class="c"></i>${UI.lgHandle}</span>` : ""}`;
        note.innerHTML = hnd ? UI.curveNote : UI.pathNote;
      }
      svg.innerHTML = s;
      $(".m-rect", box).setAttribute("aria-pressed", String(!asPath));
      $(".m-path", box).setAttribute("aria-pressed", String(asPath));
      $(".m-curve", box).hidden = !asPath;
      $(".m-curve", box).setAttribute("aria-pressed", String(!!hnd));
    };
    $(".m-rect", box).onclick = () => { asPath = false; draw(); };
    $(".m-path", box).onclick = () => { if (!asPath) { asPath = true; toPath(); } draw(); };
    $(".m-curve", box).onclick = () => {
      if (hnd) hnd = null;
      else { const [a, b] = pts, dx = (b[0] - a[0]) / 3; hnd = [[a[0] + dx, a[1] - 50], [b[0] - dx, b[1] - 50]]; }
      draw();
    };
    /* dragging: in rectangle mode the handles resize and round; in path mode each node moves on its own */
    const at = e => { const p = svg.createSVGPoint(); p.x = e.clientX; p.y = e.clientY; const q = p.matrixTransform(svg.getScreenCTM().inverse()); return [Math.max(4, Math.min(316, q.x)), Math.max(4, Math.min(206, q.y))]; };
    let drag = null;
    svg.addEventListener("pointerdown", e => { const h = e.target.closest(".h"); if (!h) return; drag = h.dataset.h; svg.setPointerCapture(e.pointerId); e.preventDefault(); });
    svg.addEventListener("pointermove", e => {
      if (!drag) return;
      const [x, y] = at(e);
      if (drag === "size") { r.w = Math.max(40, x - r.x); r.h = Math.max(30, y - r.y); }
      else if (drag === "round") { r.rx = Math.max(0, Math.min(r.w / 2, r.h / 2, r.x + r.w - x)); }
      else if (drag[0] === "p") pts[+drag[1]] = [x, y];
      else if (drag[0] === "c") hnd[+drag[1]] = [x, y];
      draw();
    });
    const end = () => { drag = null; };
    svg.addEventListener("pointerup", end); svg.addEventListener("pointercancel", end);
    draw();
  }

  /* ---------- 3. text: a click gives one line, a drag gives a frame that wraps ---------- */
  function textbox(box) {
    let framed = false, w = 220;
    $(".viz-body", box).innerHTML = `
      <div class="chips" role="group"><button type="button" class="chip ui t-line">${UI.click}</button><button type="button" class="chip ui t-frame">${UI.drag}</button></div>
      <div class="ctrl t-w" hidden><label>${UI.frameWidth} <input type="range" min="110" max="420" value="${w}"></label><output></output></div>
      <div class="page"><div class="t-text"></div></div>
      <p class="vnote" aria-live="polite"></p>`;
    const t = $(".t-text", box), note = $(".vnote", box), range = $(".t-w input", box), out = $(".t-w output", box);
    t.textContent = UI.sampleText;
    const draw = () => {
      t.className = "t-text " + (framed ? "tbox" : "tline");
      t.style.width = framed ? w + "px" : "";
      out.textContent = w + " px";
      $(".t-w", box).hidden = !framed;
      $(".t-line", box).setAttribute("aria-pressed", String(!framed));
      $(".t-frame", box).setAttribute("aria-pressed", String(framed));
      note.innerHTML = framed ? UI.frameNote : UI.lineNote;
    };
    $(".t-line", box).onclick = () => { framed = false; draw(); };
    $(".t-frame", box).onclick = () => { framed = true; draw(); };
    range.oninput = () => { w = +range.value; draw(); };
    draw();
  }

  /* ---------- 4. how a title gets its look: size, letter spacing, a stroke behind the fill ---------- */
  function textstyle(box) {
    let size = 44, spacing = 0, stroke = true;
    $(".viz-body", box).innerHTML = `
      <div class="ctrl">
        <label>${UI.size} <input type="range" class="s-size" min="18" max="72" value="${size}"></label><output class="o-size"></output>
        <label>${UI.spacing} <input type="range" class="s-sp" min="-4" max="20" value="${spacing}"></label><output class="o-sp"></output>
        <label><input type="checkbox" class="s-st" checked> ${UI.stroke}</label>
      </div>
      <div class="page" style="min-height:0;padding:6px"><svg viewBox="0 0 640 130" class="tsvg" role="img" aria-label="${UI.titleText}"><text x="16" y="92" font-family="Arial Black,Impact,sans-serif" font-weight="900" fill="#d62828" stroke="#2b2d42" stroke-linejoin="round" paint-order="stroke">${UI.titleText}</text></svg></div>
      <p class="vnote">${UI.styleNote}</p>`;
    /* like Inkscape: the outline is painted behind the fill, so a thick one frames the letters instead of eating them */
    const t = $(".tsvg text", box);
    const draw = () => {
      t.setAttribute("font-size", size * 1.5); t.setAttribute("letter-spacing", spacing * 1.5);
      t.setAttribute("stroke-width", stroke ? Math.max(3, size / 5) : 0);
      $(".o-size", box).textContent = size + " px"; $(".o-sp", box).textContent = spacing + " px";
    };
    $(".s-size", box).oninput = e => { size = +e.target.value; draw(); };
    $(".s-sp", box).oninput = e => { spacing = +e.target.value; draw(); };
    $(".s-st", box).onchange = e => { stroke = e.target.checked; draw(); };
    draw();
  }

  /* ---------- 5. Text ▸ Put on Path: the text follows the line, and the path's direction decides the side ---------- */
  function onpath(box) {
    let shape = "circle", start = 0, reversed = false;
    const PATHS = {
      circle: [`M60 110a100 70 0 1 1 200 0a100 70 0 1 1 -200 0`, `M60 110a100 70 0 1 0 200 0a100 70 0 1 0 -200 0`],
      wave: [`M20 120C70 40 110 40 160 110S250 180 300 100`, `M300 100C250 180 210 180 160 110S70 40 20 120`]
    };
    $(".viz-body", box).innerHTML = `
      <div class="chips" role="group"><span class="lab">${UI.pathLabel}</span><button type="button" class="chip ui" data-s="circle">${UI.circle}</button><button type="button" class="chip ui" data-s="wave">${UI.wave}</button></div>
      <div class="ctrl">
        <label>${UI.startAt} <input type="range" class="p-start" min="0" max="60" value="0"></label><output class="o-start"></output>
        <label><input type="checkbox" class="p-rev"> <span class="menu">${UI.reverseMenu}</span></label>
      </div>
      <div class="panel"><svg viewBox="0 0 320 220" class="p-svg" role="img"></svg></div>
      <p class="vnote" aria-live="polite"></p>`;
    const svg = $(".p-svg", box), note = $(".vnote", box);
    const draw = () => {
      const id = "tp" + (++uid), d = PATHS[shape][reversed ? 1 : 0];
      svg.innerHTML = `<path id="${id}" d="${d}" fill="none" stroke="#9a9484" stroke-width="1.5" stroke-dasharray="5 5"/>
        <text font-family="Arial Black,Impact,sans-serif" font-weight="900" font-size="19" fill="${COL.ink}" letter-spacing="1"><textPath href="#${id}" startOffset="${start}%">${UI.pathText}</textPath></text>
        <circle cx="${d.match(/^M([\d.]+) ([\d.]+)/)[1]}" cy="${d.match(/^M([\d.]+) ([\d.]+)/)[2]}" r="5" fill="${COL.result}"/>`;
      svg.setAttribute("aria-label", UI.pathText);
      $(".o-start", box).textContent = start + " %";
      $$(".chip[data-s]", box).forEach(b => b.setAttribute("aria-pressed", String(b.dataset.s === shape)));
      note.innerHTML = reversed ? UI.revNote : UI.pathNote2;
    };
    $(".chips", box).onclick = e => { const b = e.target.closest("[data-s]"); if (b) { shape = b.dataset.s; draw(); } };
    $(".p-start", box).oninput = e => { start = +e.target.value; draw(); };
    $(".p-rev", box).onchange = e => { reversed = e.target.checked; draw(); };
    draw();
  }

  /* ---------- 6. Object to Path on text: letters become shapes with nodes, and can't be retyped ---------- */
  function outline(box) {
    let asPath = false;
    /* a blocky capital A, the kind of outline Inkscape gives a bold letter */
    const A = [[40, 190], [100, 30], [140, 30], [200, 190], [158, 190], [146, 152], [94, 152], [82, 190]];
    const hole = [[104, 120], [136, 120], [120, 72]];
    const poly = p => "M" + p.map(q => q.join(" ")).join("L") + "Z";
    $(".viz-body", box).innerHTML = `
      <div class="chips" role="group"><button type="button" class="chip ui o-t">${UI.isText}</button><button type="button" class="chip ui o-p">${UI.isPath}</button></div>
      <div class="stage"><div class="panel"><svg viewBox="0 0 240 210" class="o-svg" role="img"></svg></div></div>
      <p class="vnote" aria-live="polite"></p>`;
    const svg = $(".o-svg", box), note = $(".vnote", box);
    const draw = () => {
      if (!asPath) {
        svg.innerHTML = `<path d="${poly(A)} ${poly(hole)}" fill="${COL.result}" fill-rule="evenodd"/>
          <rect x="30" y="20" width="182" height="180" fill="none" stroke="#3b82c4" stroke-width="1.5" stroke-dasharray="5 4"/>
          <line x1="122" y1="34" x2="122" y2="186" stroke="${COL.ink}" stroke-width="2.5" class="caret"/>`;
        note.innerHTML = UI.textNote;
      } else {
        svg.innerHTML = `<path d="${poly(A)} ${poly(hole)}" fill="${COL.result}" fill-rule="evenodd" stroke="${COL.ink}" stroke-width="1.5"/>` +
          [...A, ...hole].map(p => `<path d="M${p[0]} ${p[1] - 7}l7 7l-7 7l-7 -7z" fill="#fff" stroke="${COL.ink}" stroke-width="2"/>`).join("");
        note.innerHTML = UI.pathNote3;
      }
      svg.setAttribute("aria-label", asPath ? UI.isPath : UI.isText);
      $(".o-t", box).setAttribute("aria-pressed", String(!asPath)); $(".o-p", box).setAttribute("aria-pressed", String(asPath));
    };
    $(".o-t", box).onclick = () => { asPath = false; draw(); };
    $(".o-p", box).onclick = () => { asPath = true; draw(); };
    draw();
  }

  /* ---------- quiz, the same as on the other explainers ---------- */
  function quiz() {
    const qs = $$(".q"); if (!qs.length) return;
    let answered = 0, right = 0;
    qs.forEach(q => {
      const ok = +q.dataset.ok;
      $$(".opt", q).forEach((b, k) => b.onclick = () => {
        if (q.classList.contains("done")) return;
        q.classList.add("done"); answered++;
        if (k === ok) { right++; b.classList.add("right"); $(".fb b", q).textContent = UI.qRight; }
        else { q.classList.add("miss"); b.classList.add("wrong"); $$(".opt", q)[ok].classList.add("right"); $(".fb b", q).textContent = UI.qWrong; }
        if (answered === qs.length) { const s = $(".score"); s.textContent = UI.score(right, qs.length); s.classList.add("show"); }
      });
    });
  }

  const W = { booleans, nodes, textbox, textstyle, onpath, outline };
  $$(".viz[data-w]").forEach(v => { try { W[v.dataset.w](v); } catch (e) { console.error(e); } });
  quiz();
})();
