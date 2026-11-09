/* digikult — a little PowerPoint in the page, for trying shapes out.
   <div data-lab="id"></div> + LAB = { id: { title, shapes: [prefilled shapes], goals: [goal ids or { text, test }], note, tabs } }
   You can insert shapes (Beszúrás › Alakzatok), draw them by dragging (Shift: even sides), move, resize with the 8 white circles,
   turn with the round arrow, type text into the selected shape, recolour fill and outline, bring forward / send backward,
   select several with Shift or Ctrl and group them. */
(function () {
  "use strict";
  const LAB = window.LAB || {};
  const NS = "http://www.w3.org/2000/svg";
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const W = 960, H = 540;

  const KINDS = {
    rect: "Téglalap", roundRect: "Téglalap: lekerekített sarkú", ellipse: "Ellipszis", triangle: "Egyenlő szárú háromszög",
    star5: "Csillag: 5 ágú", heart: "Szív", rightArrow: "Nyíl: jobbra", callout: "Szövegbuborék: téglalap", cloud: "Gondolatbuborék: felhő"
  };
  const GALLERY = [["Téglalapok", ["rect", "roundRect"]], ["Alapalakzatok", ["ellipse", "triangle", "heart"]], ["Széles nyilak", ["rightArrow"]],
    ["Csillagok és szalagok", ["star5"]], ["Feliratok", ["callout", "cloud"]]];
  const COLORS = [["#ffffff", "Fehér"], ["#000000", "Fekete"], ["#7f7f7f", "Szürke"], ["#c00000", "Sötétvörös"], ["#ff0000", "Piros"], ["#ffc000", "Narancs"], ["#ffff00", "Sárga"],
    ["#92d050", "Világoszöld"], ["#00b050", "Zöld"], ["#00b0f0", "Világoskék"], ["#0070c0", "Kék"], ["#002060", "Sötétkék"], ["#7030a0", "Lila"], ["#f4b6c9", "Rózsaszín"], ["#8b5a2b", "Barna"]];
  const BLUE = "#4472c4", BLUE_LINE = "#2f528f";

  /* the outline of each kind, in a w×h box centred on 0,0 */
  function geom(t, w, h) {
    const x = -w / 2, y = -h / 2;
    switch (t) {
      case "rect": return `<rect x="${x}" y="${y}" width="${w}" height="${h}"/>`;
      case "roundRect": { const r = Math.min(w, h) * .17; return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}"/>`; }
      case "ellipse": return `<ellipse cx="0" cy="0" rx="${w / 2}" ry="${h / 2}"/>`;
      case "triangle": return `<path d="M0 ${y}L${-x} ${-y}L${x} ${-y}Z"/>`;
      case "star5": { let d = ""; for (let k = 0; k < 10; k++) { const a = -Math.PI / 2 + k * Math.PI / 5, r = k % 2 ? .38 : .5; d += (k ? "L" : "M") + (Math.cos(a) * r * w).toFixed(1) + " " + (Math.sin(a) * r * h * 1.05 + h * .04).toFixed(1); } return `<path d="${d}Z"/>`; }
      case "heart": return `<path d="M0 ${y + h * .28}C${x + w * .1} ${y - h * .12} ${x - w * .12} ${y + h * .42} 0 ${-y}C${-x + w * .12} ${y + h * .42} ${-x - w * .1} ${y - h * .12} 0 ${y + h * .28}Z"/>`;
      case "rightArrow": return `<path d="M${x} ${y + h * .25}H${-x - w * .35}V${y}L${-x} 0L${-x - w * .35} ${-y}V${-y - h * .25}H${x}Z"/>`;
      case "callout": return `<path d="M${x} ${y}H${-x}V${-y - h * .22}H${x + w * .42}L${x + w * .12} ${-y + h * .08}L${x + w * .24} ${-y - h * .22}H${x}Z"/>`;
      case "cloud": return `<path d="M${x + w * .22} ${-y - h * .2}C${x - w * .02} ${-y - h * .2} ${x} ${y + h * .38} ${x + w * .2} ${y + h * .3}C${x + w * .2} ${y + h * .02} ${x + w * .5} ${y} ${x + w * .58} ${y + h * .16}C${x + w * .7} ${y - h * .02} ${-x} ${y + h * .1} ${-x - w * .1} ${y + h * .34}C${-x + w * .04} ${y + h * .5} ${-x} ${-y - h * .2} ${-x - w * .2} ${-y - h * .18}C${-x - w * .3} ${-y + h * .02} ${x + w * .4} ${-y + h * .04} ${x + w * .22} ${-y - h * .2}Z"/><circle cx="${x + w * .12}" cy="${-y + h * .06}" r="${Math.min(w, h) * .05}"/><circle cx="${x + w * .03}" cy="${-y + h * .16}" r="${Math.min(w, h) * .03}"/>`;
    }
    return "";
  }

  const GOALS = {
    insert: { text: "Szúrj be egy alakzatot: <b>Beszúrás › Alakzatok</b>, válassz egyet, aztán kattints vagy húzz a dián.", test: L => L.flags.inserted },
    ellipse: { text: "Rajzolj egy <b>ellipszist</b> húzással.", test: L => L.shapes.some(s => s.type === "ellipse" && !s.pre) },
    circle: { text: "Rajzolj egy <b>szabályos kört</b>: húzás közben tartsd lenyomva a <kbd>Shift</kbd> billentyűt.", test: L => L.shapes.some(s => s.type === "ellipse" && !s.pre && Math.abs(s.w - s.h) < 2 && s.w > 20) },
    move: { text: "Fogd meg az egyik alakzatot a közepénél, és vidd máshová.", test: L => L.flags.moved },
    resize: { text: "Méretezd át egy alakzatot a <b>fehér karikák</b> egyikével.", test: L => L.flags.resized },
    fill: { text: "Változtasd meg egy alakzat színét: <b>Alakzat formátuma › Alakzat kitöltése</b>.", test: L => L.shapes.some(s => s.fill !== s.fill0) },
    nofill: { text: "Vedd el egy alakzat kitöltését: <b>Alakzat kitöltése › Nincs kitöltés</b>.", test: L => L.shapes.some(s => s.fill === "none") },
    line: { text: "Állítsd egy alakzat körvonalát <b>6 pt</b> vastagra: <b>Alakzat körvonala › Vastagság</b>.", test: L => L.shapes.some(s => s.lw >= 6 && s.line !== "none") },
    noline: { text: "Vedd el egy alakzat körvonalát: <b>Alakzat körvonala › Nincs körvonal</b>.", test: L => L.shapes.some(s => s.line === "none") },
    linecolor: { text: "Adj egy alakzatnak más színű körvonalat.", test: L => L.shapes.some(s => s.line !== "none" && s.line !== s.line0) },
    rotate: { text: "Forgasd el egy alakzatot a fölötte lévő <b>kerek nyíllal</b>.", test: L => L.shapes.some(s => Math.abs(s.rot % 360) > 3) },
    text: { text: "Írj szöveget egy alakzatba: jelöld ki, és kezdj el gépelni.", test: L => L.shapes.some(s => s.text.trim().length >= 2) },
    front: { text: "Hozd előre a hátsó alakzatot: jelöld ki, aztán <b>Előrehozás</b>.", test: L => L.flags.front },
    back: { text: "Küldj hátra egy alakzatot: <b>Hátraküldés</b>.", test: L => L.flags.back },
    group: { text: "Jelölj ki több alakzatot (<kbd>Shift</kbd> + kattintás), és foglald csoportba: <b>Csoportosítás › Csoportosítás</b>.", test: L => L.shapes.some(s => s.g) },
    groupmove: { text: "Mozgasd el a csoportot egyben.", test: L => L.flags.groupMoved }
  };

  let uid = 0;
  function mk(o) {
    const s = Object.assign({ type: "rect", cx: 480, cy: 270, w: 160, h: 110, rot: 0, fill: BLUE, line: BLUE_LINE, lw: 1, text: "", g: null, pre: true }, o);
    s.id = "s" + (++uid); s.fill0 = s.fill; s.line0 = s.line; s.textColor = s.textColor || (s.fill === "#ffffff" || s.fill === "#ffff00" || s.fill === "none" ? "#1d2622" : "#ffffff");
    return s;
  }

  document.querySelectorAll("[data-lab]").forEach(box => {
    const cfg = LAB[box.dataset.lab]; if (!cfg) return;
    const L = { shapes: (cfg.shapes || []).map(mk), sel: [], tool: null, tab: cfg.startTab || "insert", flags: {}, menu: null };
    box.classList.add("lab");
    const goals = (cfg.goals || []).map(g => typeof g === "string" ? GOALS[g] : g);
    box.innerHTML = `${cfg.title ? `<p class="try-head">${cfg.title}${cfg.sub ? ` <span>${cfg.sub}</span>` : ""}</p>` : ""}
      <div class="pp" tabindex="0" aria-label="Gyakorló PowerPoint-ablak">
        <div class="pp-tabs" role="tablist"></div>
        <div class="pp-ribbon"></div>
        <div class="pp-stage"><svg viewBox="0 0 ${W} ${H}" class="pp-slide" role="img" aria-label="A dia"><rect class="pp-bg" width="${W}" height="${H}" fill="#fff"/><g class="pp-shapes"></g><g class="pp-ui"></g><rect class="pp-rubber" visibility="hidden" fill="rgba(68,114,196,.08)" stroke="#4472c4" stroke-dasharray="6 4"/></svg></div>
        <div class="pp-status" aria-live="polite"></div>
      </div>
      ${goals.length ? `<ul class="goals">${goals.map((g, i) => `<li data-i="${i}"><span>${g.text}</span></li>`).join("")}</ul>` : ""}
      ${cfg.note ? `<p class="try-note">${cfg.note}</p>` : ""}`;
    const win = box.querySelector(".pp"), svg = box.querySelector("svg"), gS = box.querySelector(".pp-shapes"), gU = box.querySelector(".pp-ui");
    const tabsEl = box.querySelector(".pp-tabs"), rib = box.querySelector(".pp-ribbon"), status = box.querySelector(".pp-status");
    const byId = id => L.shapes.find(s => s.id === id);
    const selShapes = () => L.sel.map(byId).filter(Boolean);
    const say = t => { status.innerHTML = t || ""; };

    /* ---------- drawing ---------- */
    function drawShapes() {
      gS.innerHTML = L.shapes.map(s => {
        const sw = s.line === "none" ? 0 : s.lw * 1.4;
        const fs = Math.max(14, Math.min(34, Math.min(s.w, s.h) * .2));
        const ty = s.type === "callout" ? -s.h * .1 : s.type === "triangle" ? s.h * .15 : 0;
        return `<g class="pp-shape" data-id="${s.id}" transform="translate(${s.cx} ${s.cy}) rotate(${s.rot})">
          <g fill="${s.fill === "none" ? "transparent" : s.fill}" stroke="${s.line === "none" ? "none" : s.line}" stroke-width="${sw}" stroke-linejoin="round">${geom(s.type, s.w, s.h)}</g>
          ${s.text ? `<text y="${ty}" text-anchor="middle" dominant-baseline="central" font-family="Aptos, Calibri, 'Atkinson Hyperlegible', sans-serif" font-size="${fs}" fill="${s.textColor}">${esc(s.text)}</text>` : ""}
          ${s.fill === "none" ? `<g fill="none" stroke="transparent" stroke-width="18" pointer-events="stroke">${geom(s.type, s.w, s.h)}</g>` : ""}</g>`;
      }).join("");
      drawUI();
    }
    function drawUI() {
      const sel = selShapes();
      if (!sel.length) { gU.innerHTML = ""; return; }
      const grouped = sel.length > 1 && sel[0].g && sel.every(s => s.g === sel[0].g);
      if (sel.length === 1 && !sel[0].g) {
        const s = sel[0], hw = s.w / 2, hh = s.h / 2;
        const pts = [[-1, -1], [0, -1], [1, -1], [1, 0], [1, 1], [0, 1], [-1, 1], [-1, 0]];
        gU.innerHTML = `<g transform="translate(${s.cx} ${s.cy}) rotate(${s.rot})">
          <rect x="${-hw}" y="${-hh}" width="${s.w}" height="${s.h}" fill="none" stroke="#7a8696" stroke-width="1.2"/>
          <path d="M0 ${-hh}V${-hh - 26}" stroke="#7a8696" stroke-width="1.2"/>
          <g class="pp-rot" data-h="rot" transform="translate(0 ${-hh - 40})"><circle r="13" fill="#fff" stroke="#7a8696" stroke-width="1.2"/><path d="M-6 -2a6.5 6.5 0 1 1 1.5 6.8" fill="none" stroke="#3b4652" stroke-width="2" stroke-linecap="round"/><path d="M-9.5 -4.5l3.5 3.2 1.6-4.6z" fill="#3b4652"/></g>
          ${pts.map(([x, y]) => `<circle class="pp-h" data-h="${x},${y}" cx="${x * hw}" cy="${y * hh}" r="8" fill="#fff" stroke="#5b6670" stroke-width="1.6" style="cursor:${handleCursor(x, y, s.rot)}"/>`).join("")}</g>`;
        return;
      }
      /* several shapes or a group: a box round each, and one round all of them if grouped */
      const box1 = s => { const b = bbox(s); return `<rect x="${b.x}" y="${b.y}" width="${b.w}" height="${b.h}" fill="none" stroke="#7a8696" stroke-width="1.2" stroke-dasharray="${grouped ? "4 3" : "0"}"/>`; };
      let html = sel.map(box1).join("");
      if (grouped) { const b = unionBox(sel); html += `<rect x="${b.x - 6}" y="${b.y - 6}" width="${b.w + 12}" height="${b.h + 12}" fill="none" stroke="#5b6670" stroke-width="1.6"/>` +
        [[0, 0], [.5, 0], [1, 0], [1, .5], [1, 1], [.5, 1], [0, 1], [0, .5]].map(([u, v]) => `<circle cx="${b.x - 6 + u * (b.w + 12)}" cy="${b.y - 6 + v * (b.h + 12)}" r="7" fill="#fff" stroke="#5b6670" stroke-width="1.6"/>`).join(""); }
      gU.innerHTML = html;
    }
    function handleCursor(x, y, rot) {
      const a = ((Math.atan2(y, x) * 180 / Math.PI + rot) % 180 + 180) % 180;
      return a < 22.5 || a >= 157.5 ? "ew-resize" : a < 67.5 ? "nwse-resize" : a < 112.5 ? "ns-resize" : "nesw-resize";
    }
    function bbox(s) {
      const r = s.rot * Math.PI / 180, c = Math.abs(Math.cos(r)), n = Math.abs(Math.sin(r));
      const w = s.w * c + s.h * n, h = s.w * n + s.h * c;
      return { x: s.cx - w / 2, y: s.cy - h / 2, w, h };
    }
    function unionBox(list) {
      const bs = list.map(bbox), x = Math.min(...bs.map(b => b.x)), y = Math.min(...bs.map(b => b.y));
      return { x, y, w: Math.max(...bs.map(b => b.x + b.w)) - x, h: Math.max(...bs.map(b => b.y + b.h)) - y };
    }

    /* ---------- the ribbon ---------- */
    function drawTabs() {
      const has = L.sel.length > 0;
      if (!has && L.tab === "format") L.tab = "insert";
      const tabs = [["file", "Fájl"], ["home", "Kezdőlap"], ["insert", "Beszúrás"], ["anim", "Animációk"]].concat(has ? [["format", "Alakzat formátuma"]] : []);
      tabsEl.innerHTML = tabs.map(([id, t]) => `<button type="button" role="tab" class="pp-tab${id === "format" ? " ctx" : ""}" data-tab="${id}" aria-selected="${L.tab === id}">${t}</button>`).join("");
      drawRibbon();
    }
    const ico = {
      shapes: `<svg viewBox="0 0 32 32"><rect x="3" y="14" width="13" height="13" fill="#4472c4"/><circle cx="21" cy="11" r="8" fill="#ed7d31"/><path d="M19 29l6-10 6 10z" fill="#70ad47"/></svg>`,
      fill: c => `<svg viewBox="0 0 32 32"><path d="M8 6l12 12-7 7-9-9z" fill="#fff" stroke="#3b4652" stroke-width="2" stroke-linejoin="round"/><path d="M22 16c2 3 3 5 3 6a3 3 0 0 1-6 0c0-1 1-3 3-6z" fill="#3b4652"/><rect x="3" y="27" width="26" height="4" fill="${c}" stroke="#bbb" stroke-width=".6"/></svg>`,
      line: c => `<svg viewBox="0 0 32 32"><path d="M6 22l14-14 4 4-14 14H6z" fill="#fff" stroke="#3b4652" stroke-width="2" stroke-linejoin="round"/><rect x="3" y="27" width="26" height="4" fill="${c}" stroke="#bbb" stroke-width=".6"/></svg>`,
      front: `<svg viewBox="0 0 32 32"><rect x="4" y="4" width="16" height="16" fill="#cfd6e0" stroke="#7a8696"/><rect x="12" y="12" width="16" height="16" fill="#4472c4" stroke="#2f528f"/></svg>`,
      back: `<svg viewBox="0 0 32 32"><rect x="12" y="12" width="16" height="16" fill="#cfd6e0" stroke="#7a8696"/><rect x="4" y="4" width="16" height="16" fill="#4472c4" stroke="#2f528f"/><rect x="12" y="12" width="8" height="8" fill="#cfd6e0"/></svg>`,
      group: `<svg viewBox="0 0 32 32"><rect x="3" y="3" width="26" height="26" fill="none" stroke="#7a8696" stroke-dasharray="3 2"/><rect x="7" y="7" width="10" height="10" fill="#4472c4"/><circle cx="21" cy="21" r="5.5" fill="#ed7d31"/></svg>`,
      rotate: `<svg viewBox="0 0 32 32"><path d="M8 18a9 9 0 1 0 3-9" fill="none" stroke="#3b4652" stroke-width="2.4" stroke-linecap="round"/><path d="M5 6l7 3-5 5z" fill="#3b4652"/></svg>`
    };
    function drawRibbon() {
      const one = selShapes()[0];
      if (L.tab === "insert") rib.innerHTML = `<div class="pp-grp"><button type="button" class="pp-big" data-menu="shapes" aria-haspopup="true">${ico.shapes}<span>Alakzatok ▾</span></button><span class="pp-gl">Illusztrációk</span></div>
        <p class="pp-tip">${L.tool ? `Most kattints vagy húzz a dián: ${esc(KINDS[L.tool])}` : "Válassz egy alakzatot, aztán rajzold meg a dián."}</p>`;
      else if (L.tab === "format") rib.innerHTML = `<div class="pp-grp"><button type="button" class="pp-big" data-menu="shapes">${ico.shapes}<span>Alakzatok ▾</span></button><span class="pp-gl">Alakzat beszúrása</span></div>
        <div class="pp-grp"><div class="pp-col"><button type="button" class="pp-sm" data-menu="fill">${ico.fill(one && one.fill !== "none" ? one.fill : "#fff")}<span>Alakzat kitöltése ▾</span></button>
          <button type="button" class="pp-sm" data-menu="line">${ico.line(one && one.line !== "none" ? one.line : "#fff")}<span>Alakzat körvonala ▾</span></button></div><span class="pp-gl">Alakzatstílusok</span></div>
        <div class="pp-grp"><div class="pp-col"><button type="button" class="pp-sm" data-act="front">${ico.front}<span>Előrehozás</span></button>
          <button type="button" class="pp-sm" data-act="back">${ico.back}<span>Hátraküldés</span></button></div>
          <div class="pp-col"><button type="button" class="pp-sm" data-menu="group">${ico.group}<span>Csoportosítás ▾</span></button>
          <button type="button" class="pp-sm" data-menu="rotate">${ico.rotate}<span>Elforgatás ▾</span></button></div><span class="pp-gl">Elrendezés</span></div>`;
      else rib.innerHTML = `<p class="pp-tip">${L.tab === "anim" ? "Az animációkról a következő leckében lesz szó." : "Ebben a gyakorlóban a <b>Beszúrás</b> lap működik, és ha kijelölsz egy alakzatot, az <b>Alakzat formátuma</b> lap."}</p>`;
      if (L.menu) openMenu(L.menu);
    }
    function openMenu(which) {
      closeMenu(true); L.menu = which;
      const btn = rib.querySelector(`[data-menu="${which}"]`); if (!btn) return;
      const m = document.createElement("div"); m.className = "pp-menu"; m.dataset.for = which;
      if (which === "shapes") m.innerHTML = GALLERY.map(([t, list]) => `<p>${t}</p><div class="pp-gal">${list.map(k => `<button type="button" data-shape="${k}" title="${KINDS[k]}" aria-label="${KINDS[k]}"><svg viewBox="-22 -18 44 36"><g fill="#fff" stroke="#3b4652" stroke-width="1.6">${geom(k, k === "rightArrow" ? 38 : 32, k === "rightArrow" ? 24 : 28)}</g></svg></button>`).join("")}</div>`).join("");
      else if (which === "fill" || which === "line") m.innerHTML = `<p>Szabványos színek</p><div class="pp-pal">${COLORS.map(([c, n]) => `<button type="button" data-color="${c}" title="${n}" aria-label="${n}" style="background:${c}"></button>`).join("")}</div>
        <button type="button" class="pp-mi" data-color="none">${which === "fill" ? "Nincs kitöltés" : "Nincs körvonal"}</button>
        ${which === "line" ? `<p>Vastagság</p>${[1, 3, 6].map(w => `<button type="button" class="pp-mi" data-weight="${w}"><i style="border-top-width:${w * .9 + .5}px"></i>${w} pt</button>`).join("")}` : ""}`;
      else if (which === "group") m.innerHTML = `<button type="button" class="pp-mi" data-act="group">Csoportosítás</button><button type="button" class="pp-mi" data-act="ungroup">Csoportbontás</button>`;
      else if (which === "rotate") m.innerHTML = `<button type="button" class="pp-mi" data-act="rotR">Forgatás jobbra 90°</button><button type="button" class="pp-mi" data-act="rotL">Forgatás balra 90°</button>`;
      const r = btn.getBoundingClientRect(), w = win.getBoundingClientRect();
      m.style.left = Math.max(4, Math.min(r.left - w.left, w.width - 250)) + "px"; m.style.top = (r.bottom - w.top + 2) + "px";
      win.appendChild(m);
    }
    function closeMenu(keep) { win.querySelectorAll(".pp-menu").forEach(m => m.remove()); if (!keep) L.menu = null; }

    function act(a) {
      const sel = selShapes();
      if (a === "front" || a === "back") {
        if (!sel.length) return;
        sel.forEach(s => {
          const i = L.shapes.indexOf(s), j = a === "front" ? Math.min(L.shapes.length - 1, i + 1) : Math.max(0, i - 1);
          L.shapes.splice(i, 1); L.shapes.splice(j, 0, s);
          if (i !== j) L.flags[a] = true;
        });
        say(a === "front" ? "Egy szinttel előrébb került." : "Egy szinttel hátrébb került.");
      }
      if (a === "group") {
        if (sel.length < 2) { say("Előbb jelölj ki legalább két alakzatot: kattints az elsőre, aztán <kbd>Shift</kbd>-tel a többire."); return; }
        const g = "g" + (++uid); sel.forEach(s => s.g = g); say("Csoportba foglaltad őket: most egyben mozognak.");
      }
      if (a === "ungroup") { if (sel.some(s => s.g)) { sel.forEach(s => s.g = null); L.sel = sel.length ? [sel[0].id] : []; say("Szétbontottad a csoportot."); } }
      if (a === "rotR" || a === "rotL") sel.filter(s => !s.g).forEach(s => s.rot = (s.rot + (a === "rotR" ? 90 : -90)) % 360);
      closeMenu(); drawShapes(); drawTabs(); tick();
    }

    rib.addEventListener("click", e => {
      const m = e.target.closest("[data-menu]"); if (m) { L.menu === m.dataset.menu ? closeMenu() : openMenu(m.dataset.menu); return; }
      const b = e.target.closest("[data-act]"); if (b) act(b.dataset.act);
    });
    win.addEventListener("click", e => {
      const menu = e.target.closest(".pp-menu"); if (!menu) return;
      const sh = e.target.closest("[data-shape]"), co = e.target.closest("[data-color]"), we = e.target.closest("[data-weight]"), ac = e.target.closest("[data-act]");
      if (sh) { L.tool = sh.dataset.shape; closeMenu(); L.tab = L.sel.length ? L.tab : "insert"; drawTabs(); say(`Kattints vagy húzz a dián, és megjelenik: <b>${esc(KINDS[L.tool])}</b>.`); svg.classList.add("drawing"); return; }
      const sel = selShapes();
      if (co && menu.dataset.for === "fill") sel.forEach(s => { s.fill = co.dataset.color; s.textColor = ["#ffffff", "#ffff00", "#92d050", "#ffc000", "#f4b6c9", "#00b0f0", "none"].includes(s.fill) ? "#1d2622" : "#ffffff"; });
      if (co && menu.dataset.for === "line") sel.forEach(s => { s.line = co.dataset.color; });
      if (we) sel.forEach(s => { s.lw = +we.dataset.weight; if (s.line === "none") s.line = "#000000"; });
      if (ac) { act(ac.dataset.act); return; }
      closeMenu(); drawShapes(); drawTabs(); tick();
    });
    tabsEl.addEventListener("click", e => { const t = e.target.closest("[data-tab]"); if (!t) return; L.tab = t.dataset.tab; closeMenu(); drawTabs(); });
    document.addEventListener("pointerdown", e => { if (L.menu && !e.target.closest(".pp-menu") && !e.target.closest("[data-menu]")) { closeMenu(); } }, true);

    /* ---------- the mouse on the slide ---------- */
    const pt = e => { const p = svg.createSVGPoint(); p.x = e.clientX; p.y = e.clientY; const q = p.matrixTransform(svg.getScreenCTM().inverse()); return { x: q.x, y: q.y }; };
    let drag = null;
    svg.addEventListener("pointerdown", e => {
      if (e.button !== 0) return;
      win.focus({ preventScroll: true });
      const p = pt(e);
      if (L.tool) {
        const s = mk({ type: L.tool, cx: p.x, cy: p.y, w: 0, h: 0, pre: false, fill: BLUE, line: BLUE_LINE });
        L.shapes.push(s); L.sel = [s.id];
        drag = { mode: "draw", s, x0: p.x, y0: p.y };
        L.tool = null; svg.classList.remove("drawing");
        svg.setPointerCapture(e.pointerId); drawShapes(); return;
      }
      const h = e.target.closest("[data-h]");
      const sel = selShapes();
      if (h && sel.length === 1) {
        const s = sel[0];
        if (h.dataset.h === "rot") drag = { mode: "rot", s };
        else { const [hx, hy] = h.dataset.h.split(",").map(Number); drag = { mode: "size", s, hx, hy, w0: s.w, h0: s.h, cx0: s.cx, cy0: s.cy }; }
        svg.setPointerCapture(e.pointerId); return;
      }
      const g = e.target.closest(".pp-shape");
      if (g) {
        const s = byId(g.dataset.id);
        const mates = s.g ? L.shapes.filter(x => x.g === s.g).map(x => x.id) : [s.id];
        if (e.shiftKey || e.ctrlKey || e.metaKey) { const on = mates.every(id => L.sel.includes(id)); L.sel = on ? L.sel.filter(id => !mates.includes(id)) : L.sel.concat(mates.filter(id => !L.sel.includes(id))); }
        else if (!L.sel.includes(s.id)) L.sel = mates;
        if (L.sel.length && L.tab !== "format") L.tab = "format";
        drag = { mode: "move", x0: p.x, y0: p.y, list: selShapes().map(x => ({ s: x, cx: x.cx, cy: x.cy })), moved: false };
        svg.setPointerCapture(e.pointerId); drawShapes(); drawTabs(); return;
      }
      L.sel = []; closeMenu(); drawShapes(); drawTabs();
    });
    svg.addEventListener("pointermove", e => {
      if (!drag) return;
      const p = pt(e);
      if (drag.mode === "draw") {
        let dx = p.x - drag.x0, dy = p.y - drag.y0;
        if (e.shiftKey) { const m = Math.max(Math.abs(dx), Math.abs(dy)); dx = Math.sign(dx || 1) * m; dy = Math.sign(dy || 1) * m; }
        Object.assign(drag.s, { w: Math.abs(dx), h: Math.abs(dy), cx: drag.x0 + dx / 2, cy: drag.y0 + dy / 2 });
        drawShapes();
      } else if (drag.mode === "move") {
        const dx = p.x - drag.x0, dy = p.y - drag.y0;
        if (Math.hypot(dx, dy) > 3) drag.moved = true;
        drag.list.forEach(o => { o.s.cx = clamp(o.cx + dx, 0, W); o.s.cy = clamp(o.cy + dy, 0, H); });
        drawShapes();
      } else if (drag.mode === "rot") {
        let a = Math.atan2(p.y - drag.s.cy, p.x - drag.s.cx) * 180 / Math.PI + 90;
        if (e.shiftKey) a = Math.round(a / 15) * 15;
        drag.s.rot = Math.round(((a % 360) + 360) % 360); drawShapes();
        say(`Elforgatás: ${drag.s.rot}°`);
      } else if (drag.mode === "size") {
        const s = drag.s, r = s.rot * Math.PI / 180, cos = Math.cos(r), sin = Math.sin(r);
        /* the corner (or side) across from the handle stays where it is */
        const ax = -drag.hx * drag.w0 / 2, ay = -drag.hy * drag.h0 / 2;
        const aw = { x: drag.cx0 + ax * cos - ay * sin, y: drag.cy0 + ax * sin + ay * cos };
        const lx = (p.x - aw.x) * cos + (p.y - aw.y) * sin, ly = -(p.x - aw.x) * sin + (p.y - aw.y) * cos;
        let w = drag.hx ? Math.max(8, lx * drag.hx) : drag.w0, h = drag.hy ? Math.max(8, ly * drag.hy) : drag.h0;
        if (e.shiftKey && drag.hx && drag.hy) { const k = Math.max(w / drag.w0, h / drag.h0); w = drag.w0 * k; h = drag.h0 * k; }
        const cxl = drag.hx * w / 2 * 1, cyl = drag.hy * h / 2;
        s.w = w; s.h = h;
        s.cx = aw.x + (drag.hx ? cxl : -ax) * cos - (drag.hy ? cyl : -ay) * sin;
        s.cy = aw.y + (drag.hx ? cxl : -ax) * sin + (drag.hy ? cyl : -ay) * cos;
        drawShapes(); say(`Méret: ${Math.round(w)} × ${Math.round(h)}`);
      }
    });
    const end = () => {
      if (!drag) return;
      const d = drag; drag = null;
      if (d.mode === "draw") {
        if (d.s.w < 8 || d.s.h < 8) { const sq = ["ellipse", "star5", "heart"].includes(d.s.type); Object.assign(d.s, { w: sq ? 110 : 150, h: sq ? 110 : 100, cx: clamp(d.x0, 80, W - 80), cy: clamp(d.y0, 60, H - 60) }); }
        L.flags.inserted = true; L.tab = "format";
        say(`Beszúrtad: <b>${esc(KINDS[d.s.type])}</b>. Fent megjelent az <b>Alakzat formátuma</b> lap.`);
        drawShapes(); drawTabs();
      }
      if (d.mode === "move" && d.moved) { L.flags.moved = true; if (d.list.some(o => o.s.g)) L.flags.groupMoved = true; }
      if (d.mode === "size") L.flags.resized = true;
      tick();
    };
    svg.addEventListener("pointerup", end); svg.addEventListener("pointercancel", end);
    const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

    /* ---------- the keyboard: type into the selected shape ---------- */
    win.addEventListener("keydown", e => {
      const sel = selShapes(); if (!sel.length || e.target.closest(".pp-menu,.pp-tabs,.pp-ribbon")) return;
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      if (e.key === "Delete") { L.shapes = L.shapes.filter(s => !L.sel.includes(s.id)); L.sel = []; drawShapes(); drawTabs(); tick(); e.preventDefault(); return; }
      if (e.key.startsWith("Arrow")) { const d = { ArrowLeft: [-5, 0], ArrowRight: [5, 0], ArrowUp: [0, -5], ArrowDown: [0, 5] }[e.key]; sel.forEach(s => { s.cx += d[0]; s.cy += d[1]; }); L.flags.moved = true; drawShapes(); tick(); e.preventDefault(); return; }
      if (sel.length !== 1) return;
      const s = sel[0];
      if (e.key === "Backspace") { s.text = s.text.slice(0, -1); e.preventDefault(); }
      else if (e.key.length === 1) { if (s.text.length < 24) s.text += e.key; e.preventDefault(); }
      else return;
      drawShapes(); tick();
    });

    function tick() {
      goals.forEach((g, i) => { const li = box.querySelector(`.goals li[data-i="${i}"]`); if (li) li.classList.toggle("ok", !!g.test(L)); });
    }
    drawShapes(); drawTabs(); tick();
  });
})();
