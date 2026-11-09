/* digikult — a tiny PowerPoint-style animation player for SVG slides, and its "Animációs munkaablak".
   A step: { el: "#id" (inside the stage), name, cls: "entr"|"emph"|"exit"|"path",
             fx: "appear"|"fade"|"fly"|"zoom"|"wipe" (entr) | "spin"|"grow"|"pulse"|"fadeto" (emph) | "vanish"|"fadeout"|"flyout"|"shrink" (exit) | "path",
             dir: "top"|"bottom"|"left"|"right", start: "click"|"with"|"after", dur, delay (ms), dx, dy (path), label (effect name) }
   ANIM.play(stage, steps, { pane, hint }) plays them: a "click" step waits for a click on the slide, like a slide show.
   The animated element should be a <g> without its own transform attribute (CSS transforms replace it). */
(function () {
  "use strict";
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const reduced = () => matchMedia("(prefers-reduced-motion: reduce)").matches;
  const STAR = { entr: "#2f9e44", emph: "#e0a800", exit: "#d6336c", path: "#5b6660" };
  const KIND = { entr: "Megjelenés", emph: "Kiemelés", exit: "Eltűnés", path: "Mozgásvonal" };

  const T = el => { el.style.transformBox = "fill-box"; el.style.transformOrigin = "center"; return el; };
  function keyframes(s) {
    const far = 640, d = s.dir || "bottom";
    const off = { top: [0, -far], bottom: [0, far], left: [-far * 1.4, 0], right: [far * 1.4, 0] }[d] || [0, far];
    switch (s.fx) {
      case "appear": return [{ opacity: 0 }, { opacity: 0, offset: .99 }, { opacity: 1 }];
      case "fade": return [{ opacity: 0 }, { opacity: 1 }];
      case "fly": return [{ opacity: 1, transform: `translate(${off[0]}px,${off[1]}px)` }, { opacity: 1, transform: "translate(0,0)" }];
      case "zoom": return [{ opacity: 0, transform: "scale(.1)" }, { opacity: 1, transform: "scale(1)" }];
      case "wipe": return [{ opacity: 1, clipPath: d === "left" ? "inset(0 0 0 100%)" : d === "top" ? "inset(0 0 100% 0)" : d === "bottom" ? "inset(100% 0 0 0)" : "inset(0 100% 0 0)" }, { opacity: 1, clipPath: "inset(0 0 0 0)" }];
      case "spin": return [{ transform: "rotate(0deg)" }, { transform: "rotate(360deg)" }];
      case "grow": return [{ transform: "scale(1)" }, { transform: `scale(${s.scale || 1.5})` }];
      case "pulse": return [{ transform: "scale(1)" }, { transform: "scale(1.18)" }, { transform: "scale(1)" }];
      case "fadeto": return [{ opacity: 1 }, { opacity: .35 }];
      case "vanish": return [{ opacity: 1 }, { opacity: 1, offset: .99 }, { opacity: 0 }];
      case "fadeout": return [{ opacity: 1 }, { opacity: 0 }];
      case "flyout": return [{ transform: "translate(0,0)" }, { transform: `translate(${off[0]}px,${off[1]}px)` }];
      case "shrink": return [{ opacity: 1, transform: "scale(1)" }, { opacity: 0, transform: "scale(.1)" }];
      case "path": return [{ transform: "translate(0,0)" }, { transform: `translate(${s.dx || 0}px,${s.dy || 0}px)` }];
    }
    return [{ opacity: 1 }, { opacity: 1 }];
  }

  /* when each step starts and ends, and which click it belongs to */
  function timeline(steps) {
    const out = []; let g = -1, prevStart = 0, prevEnd = 0;
    steps.forEach((s, k) => {
      const dur = s.fx === "appear" || s.fx === "vanish" ? Math.max(1, s.dur || 1) : (s.dur || 500), delay = s.delay || 0;
      let start;
      if (s.start === "click" || g < 0) { g++; start = delay; if (s.start !== "click" && g === 0) out.auto = true; }
      else if (s.start === "with") start = prevStart + delay;
      else start = prevEnd + delay;
      out.push({ s, k, g, start, end: start + dur, dur });
      prevStart = start; prevEnd = start + dur;
    });
    return out;
  }

  const running = new WeakMap();
  function targets(stage, steps) { return [...new Set(steps.map(s => stage.querySelector(s.el)).filter(Boolean))]; }
  function reset(stage) {
    stage.__token = (stage.__token || 0) + 1;
    stage.querySelectorAll("[data-anim-on]").forEach(el => { el.getAnimations().forEach(a => a.cancel()); el.style.opacity = ""; el.removeAttribute("data-anim-on"); });
    if (stage.__hint) stage.__hint.hidden = true;
    stage.classList.remove("playing");
  }
  function waitClick(stage, hint, token) {
    return new Promise(res => {
      if (hint) { hint.hidden = false; stage.__hint = hint; }
      const go = e => { e && e.preventDefault(); stage.removeEventListener("click", go); stage.removeEventListener("keydown", key); if (hint) hint.hidden = true; res(stage.__token === token); };
      const key = e => { if (e.key === " " || e.key === "Enter" || e.key === "ArrowRight") go(e); };
      stage.addEventListener("click", go); stage.addEventListener("keydown", key);
      stage.focus({ preventScroll: true });
    });
  }
  const sleep = ms => new Promise(r => setTimeout(r, ms));

  async function play(stage, steps, opt = {}) {
    reset(stage);
    const token = stage.__token, tl = timeline(steps);
    stage.classList.add("playing");
    targets(stage, steps).forEach(el => { T(el); el.setAttribute("data-anim-on", ""); });
    /* things that come in later are hidden until their turn */
    const firstOf = new Map();
    tl.forEach(x => { const el = stage.querySelector(x.s.el); if (el && !firstOf.has(el)) firstOf.set(el, x); });
    firstOf.forEach((x, el) => { if (x.s.cls === "entr") el.style.opacity = "0"; });
    const groups = [...new Set(tl.map(x => x.g))];
    const rows = opt.pane ? opt.pane.querySelectorAll(".ap-row") : [];
    for (const g of groups) {
      const items = tl.filter(x => x.g === g);
      if (!(g === 0 && tl.auto)) { if (!(await waitClick(stage, opt.hint, token))) return; }
      if (stage.__token !== token) return;
      const span = Math.max(...items.map(x => x.end));
      items.forEach(x => {
        const el = stage.querySelector(x.s.el); if (!el) return;
        const row = rows[x.k];
        setTimeout(() => { if (stage.__token !== token) return; if (row) row.classList.add("on"); if (x.s.cls === "entr") el.style.opacity = ""; }, x.start);
        setTimeout(() => { if (row) row.classList.remove("on"); }, x.end + 120);
        el.animate(keyframes(x.s), { duration: reduced() ? 1 : x.dur, delay: x.start, fill: "both", easing: x.s.fx === "path" || x.s.fx === "spin" ? "ease-in-out" : "ease-out", composite: x.s.fx === "path" || x.s.fx === "grow" || x.s.fx === "spin" || x.s.fx === "pulse" ? "accumulate" : "replace" });
      });
      await sleep(span + 60);
    }
    if (stage.__token === token) { stage.classList.remove("playing"); if (opt.done) opt.done(); }
  }

  /* the list on the right of PowerPoint: number of the click, the star, the name, a little time bar */
  function paneHtml(steps, names) {
    if (!steps.length) return `<p class="ap-empty">Még nincs animáció ezen a dián.</p>`;
    const tl = timeline(steps), max = Math.max(...tl.map(x => x.end), 1000);
    return tl.map(x => {
      const s = x.s, num = (s.start === "click" || (x.k === 0)) ? (tl.auto ? x.g : x.g + 1) : "";
      const icon = s.start === "click" ? `<svg viewBox="0 0 12 16" class="ap-ic" aria-label="kattintásra"><rect x="1" y="1" width="10" height="14" rx="5" fill="none" stroke="currentColor" stroke-width="1.4"/><path d="M6 1v5" stroke="currentColor" stroke-width="1.4"/></svg>`
        : s.start === "after" ? `<svg viewBox="0 0 16 16" class="ap-ic" aria-label="az előző után"><circle cx="8" cy="8" r="6.4" fill="none" stroke="currentColor" stroke-width="1.4"/><path d="M8 4v4l3 2" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>` : `<span class="ap-ic" aria-label="együtt az előzővel"></span>`;
      const star = s.cls === "path" ? `<svg viewBox="0 0 16 16" class="ap-star" aria-hidden="true"><path d="M2 13C5 3 11 13 14 3" fill="none" stroke="${STAR.path}" stroke-width="1.6" stroke-dasharray="2 2"/><circle cx="2" cy="13" r="2" fill="#2f9e44"/><circle cx="14" cy="3" r="2" fill="#d6336c"/></svg>`
        : `<svg viewBox="0 0 16 16" class="ap-star" aria-hidden="true"><path d="M8 1l2.1 4.6 5 .5-3.8 3.4 1.1 4.9L8 11.9 3.6 14.4l1.1-4.9L.9 6.1l5-.5z" fill="${STAR[s.cls]}"/></svg>`;
      return `<div class="ap-row" title="${esc(KIND[s.cls] + ": " + (s.label || ""))}"><span class="ap-n">${num}</span>${icon}${star}<span class="ap-name">${esc(names[s.el] || s.name || s.el)}</span>
        <span class="ap-bar"><i style="left:${x.start / max * 100}%;width:${Math.max(3, x.dur / max * 100)}%;background:${STAR[s.cls]}"></i></span></div>`;
    }).join("");
  }

  window.ANIM = { play, reset, paneHtml, timeline, STAR, KIND };
})();
