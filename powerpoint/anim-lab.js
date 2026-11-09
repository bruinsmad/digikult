/* digikult — the Animációk lap in the page: pick a thing on the slide, give it an effect, set when it starts,
   reorder in the Animációs munkaablak, and play it like a slide show. Uses anim.js.
   <div data-alab="id"></div> + ALAB = { id: { title, slide (SVG markup), objects: { "#el": { name, path: { dx, dy } } }, steps: [preset steps], goals: [{ text, test(steps) }], note } } */
(function () {
  "use strict";
  const CFG = window.ALAB || {};
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const FX = {
    entr: [["appear", "Előtűnés"], ["fade", "Fokozatos megjelenés"], ["fly", "Beúszás"], ["wipe", "Kitakarás"], ["zoom", "Nagyítás"]],
    emph: [["spin", "Forgás"], ["grow", "Növekedés/kicsinyítés"], ["fadeto", "Áttetszőség"]],
    exit: [["vanish", "Eltűnés"], ["fadeout", "Elhalványulás"], ["flyout", "Kiúszás"], ["shrink", "Kicsinyítés"]],
    path: [["path", "Vonalak"]]
  };
  const CAT = { entr: "Megjelenés", emph: "Kiemelés", exit: "Eltűnés", path: "Mozgásvonalak" };
  const DUR = { appear: 0, vanish: 0, fade: 500, fly: 500, wipe: 500, zoom: 500, pulse: 500, spin: 2000, grow: 2000, fadeto: 2000, fadeout: 500, flyout: 500, shrink: 500, path: 2000 };
  const DIRS = { fly: [["bottom", "Alulról"], ["top", "Felülről"], ["left", "Balról"], ["right", "Jobbról"]], flyout: [["bottom", "Lefelé"], ["top", "Felfelé"], ["left", "Balra"], ["right", "Jobbra"]], wipe: [["bottom", "Alulról"], ["top", "Felülről"], ["left", "Balról"], ["right", "Jobbról"]] };
  const label = fx => { for (const k in FX) for (const [id, l] of FX[k]) if (id === fx) return l; return fx; };
  const clsOf = fx => Object.keys(FX).find(k => FX[k].some(([id]) => id === fx));
  const star = c => `<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M8 1l2.1 4.6 5 .5-3.8 3.4 1.1 4.9L8 11.9 3.6 14.4l1.1-4.9L.9 6.1l5-.5z" fill="${ANIM.STAR[c]}"/></svg>`;

  document.querySelectorAll("[data-alab]").forEach(box => {
    const cfg = CFG[box.dataset.alab]; if (!cfg) return;
    const names = Object.fromEntries(Object.entries(cfg.objects).map(([k, v]) => [k, v.name]));
    const L = { steps: (cfg.steps || []).map(s => Object.assign({}, s)), obj: null, cur: -1, add: false, flags: {} };
    box.classList.add("lab");
    box.innerHTML = `${cfg.title ? `<p class="try-head">${cfg.title}${cfg.sub ? ` <span>${cfg.sub}</span>` : ""}</p>` : ""}
      <div class="pp pp-anim">
        <div class="pp-tabs"><button type="button" class="pp-tab" disabled>Kezdőlap</button><button type="button" class="pp-tab" disabled>Beszúrás</button><button type="button" class="pp-tab" disabled>Áttűnések</button><button type="button" class="pp-tab" aria-selected="true">Animációk</button></div>
        <div class="pp-ribbon">
          <div class="pp-grp"><button type="button" class="pp-big" data-do="preview"><svg viewBox="0 0 32 32"><rect x="3" y="6" width="26" height="18" rx="2" fill="#fff" stroke="#3b4652" stroke-width="2"/><path d="M13 10l8 5-8 5z" fill="#c43e1c"/></svg><span>Megtekintés</span></button><span class="pp-gl">Megtekintés</span></div>
          <div class="pp-grp"><div class="pp-strip">${["entr", "emph", "exit", "path"].map(c => FX[c].filter(([id]) => ["fade", "fly", "spin", "fadeout", "path"].includes(id)).map(([id, l]) => `<button type="button" class="pp-fx" data-fx="${id}" title="${CAT[c]}: ${l}">${c === "path" ? `<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M2 13C5 3 11 13 14 3" fill="none" stroke="#5b6660" stroke-width="1.6" stroke-dasharray="2 2"/></svg>` : star(c)}<span>${l}</span></button>`).join("")).join("")}
            <button type="button" class="pp-fx more" data-do="gallery" data-mode="replace" aria-haspopup="true" title="Az összes effektus">▾</button></div><span class="pp-gl">Animáció</span></div>
          <div class="pp-grp"><div class="pp-col"><button type="button" class="pp-sm" data-do="gallery" data-mode="add"><svg viewBox="0 0 32 32">${star("entr").replace(/<\/?svg[^>]*>/g, "")}<path d="M22 20h8M26 16v8" stroke="#3b4652" stroke-width="2.4"/></svg><span>Animáció hozzáadása ▾</span></button>
            <button type="button" class="pp-sm" data-do="dir"><svg viewBox="0 0 32 32"><path d="M16 4v24M6 16h20" stroke="#3b4652" stroke-width="2"/><path d="M16 4l-4 5h8zM26 16l-5-4v8z" fill="#3b4652"/></svg><span>Effektus beállításai ▾</span></button></div><span class="pp-gl">Speciális animáció</span></div>
          <div class="pp-grp pp-timing"><label>Indítás: <select data-t="start"><option value="click">Kattintásra</option><option value="with">Együtt az előzővel</option><option value="after">Az előző után</option></select></label>
            <label>Időtartam: <input data-t="dur" type="text" inputmode="decimal" autocomplete="off"> mp</label><label>Késleltetés: <input data-t="delay" type="text" inputmode="decimal" autocomplete="off"> mp</label>
            <span class="pp-reorder"><button type="button" data-do="up">▲ Áthelyezés korábbra</button><button type="button" data-do="down">▼ Áthelyezés későbbre</button></span><span class="pp-gl">Időzítés</span></div>
        </div>
        <div class="pp-split">
          <div class="pp-stage pp-astage" tabindex="0" aria-label="A dia. Lejátszás közben kattints rá a következő lépéshez.">${cfg.slide}<div class="ap-hint" hidden>🖱 Kattints a diára!</div></div>
          <aside class="ap"><p class="ap-head">Animációs munkaablak <button type="button" data-do="preview">▶ Lejátszás</button></p><div class="ap-list"></div></aside>
        </div>
        <div class="pp-status" aria-live="polite"></div>
      </div>
      ${cfg.goals ? `<ul class="goals">${cfg.goals.map((g, i) => `<li data-i="${i}"><span>${g.text}</span></li>`).join("")}</ul>` : ""}
      ${cfg.note ? `<p class="try-note">${cfg.note}</p>` : ""}`;
    const win = box.querySelector(".pp"), stage = box.querySelector(".pp-astage"), list = box.querySelector(".ap-list"), status = box.querySelector(".pp-status");
    const hint = box.querySelector(".ap-hint"), rib = box.querySelector(".pp-ribbon");
    const say = t => { status.innerHTML = t || ""; };
    const svg = stage.querySelector("svg");
    Object.keys(cfg.objects).forEach(sel => { const el = svg.querySelector(sel); if (el) { el.classList.add("pp-obj"); el.setAttribute("data-obj", sel); } });

    function paint() {
      ANIM.reset(stage);
      list.innerHTML = ANIM.paneHtml(L.steps, names);
      list.querySelectorAll(".ap-row").forEach((r, k) => { r.dataset.k = k; r.classList.toggle("sel", k === L.cur); r.insertAdjacentHTML("beforeend", `<button type="button" class="ap-x" data-del="${k}" aria-label="Törlés">×</button>`); });
      svg.querySelectorAll(".pp-obj").forEach(el => el.classList.toggle("picked", el.dataset.obj === L.obj));
      /* the little numbers PowerPoint shows next to animated things */
      svg.querySelectorAll(".ap-tag").forEach(t => t.remove());
      const tl = ANIM.timeline(L.steps), seen = {};
      tl.forEach(x => {
        const el = svg.querySelector(x.s.el); if (!el) return;
        const n = tl.auto ? x.g : x.g + 1;
        seen[x.s.el] = seen[x.s.el] || []; if (!seen[x.s.el].includes(n)) seen[x.s.el].push(n);
      });
      Object.entries(seen).forEach(([sel, ns]) => {
        const el = svg.querySelector(sel), b = el.getBBox();
        const g = document.createElementNS("http://www.w3.org/2000/svg", "g"); g.setAttribute("class", "ap-tag");
        g.innerHTML = ns.map((n, i) => `<g transform="translate(${b.x - 26 + i * 24} ${b.y - 4})"><rect width="22" height="20" rx="2" fill="#fbebe5" stroke="#c43e1c" stroke-width="1.2"/><text x="11" y="15" text-anchor="middle" font-size="14" font-family="Atkinson Hyperlegible, sans-serif" fill="#1d2622">${n}</text></g>`).join("");
        svg.appendChild(g);
      });
      const s = L.steps[L.cur];
      rib.querySelectorAll("[data-t]").forEach(inp => {
        inp.disabled = !s;
        if (inp === document.activeElement && s) return;
        if (!s) { inp.value = inp.tagName === "SELECT" ? "click" : ""; return; }
        inp.value = inp.dataset.t === "start" ? s.start : String((s[inp.dataset.t] || 0) / 1000).replace(".", ",");
      });
      rib.querySelectorAll(".pp-fx").forEach(b => b.classList.toggle("on", !!(s && b.dataset.fx === s.fx)));
      tick();
    }
    function tick() { (cfg.goals || []).forEach((g, i) => { const li = box.querySelector(`.goals li[data-i="${i}"]`); if (li) li.classList.toggle("ok", !!g.test(L.steps, L.flags)); }); }

    function addFx(fx, mode) {
      if (!L.obj) { say("Előbb kattints egy dologra a dián, amit animálni szeretnél."); return; }
      const o = cfg.objects[L.obj], c = clsOf(fx);
      const st = { el: L.obj, name: o.name, cls: c, fx, label: label(fx), start: "click", dur: DUR[fx], delay: 0, dir: "bottom" };
      if (fx === "path") Object.assign(st, o.path || { dx: 0, dy: 160 });
      const mine = L.steps.map((s, k) => s.el === L.obj ? k : -1).filter(k => k >= 0);
      if (mode === "replace" && mine.length) { const k = L.cur >= 0 && L.steps[L.cur].el === L.obj ? L.cur : mine[mine.length - 1]; st.start = L.steps[k].start; st.delay = L.steps[k].delay; L.steps[k] = st; L.cur = k; say(`${esc(o.name)}: az effektus lecserélve erre: <b>${esc(st.label)}</b>.`); }
      else { L.steps.push(st); L.cur = L.steps.length - 1; say(`${esc(o.name)}: új animáció, <b>${CAT[c]}: ${esc(st.label)}</b>.`); }
      closeMenu(); paint();
      ANIM.play(stage, [Object.assign({}, st, { start: "with" })], {});      /* PowerPoint shows a quick preview of the new effect */
      setTimeout(() => ANIM.reset(stage), (st.dur || 300) + 400);
    }
    function openMenu(kind, btn) {
      closeMenu(); L.menu = kind;
      const m = document.createElement("div"); m.className = "pp-menu wide";
      if (kind === "gallery") m.innerHTML = Object.keys(FX).map(c => `<p>${CAT[c]}</p><div class="pp-fxgal">${FX[c].map(([id, l]) => `<button type="button" data-fx="${id}" data-mode="${btn.dataset.mode}">${c === "path" ? `<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M2 13C5 3 11 13 14 3" fill="none" stroke="#5b6660" stroke-width="1.6" stroke-dasharray="2 2"/></svg>` : star(c)}<span>${l}</span></button>`).join("")}</div>`).join("");
      if (kind === "dir") {
        const s = L.steps[L.cur], opts = s && DIRS[s.fx];
        m.innerHTML = opts ? `<p>Irány</p>${opts.map(([v, l]) => `<button type="button" class="pp-mi" data-dir="${v}">${s.dir === v ? "● " : ""}${l}</button>`).join("")}` : `<p class="pp-mnote">${s ? "Ennek az effektusnak itt nincs beállítása. Próbáld a Beúszással!" : "Előbb válassz ki egy animációt a munkaablakban."}</p>`;
      }
      const r = btn.getBoundingClientRect(), w = win.getBoundingClientRect();
      m.style.left = Math.max(4, Math.min(r.left - w.left, w.width - 300)) + "px"; m.style.top = (r.bottom - w.top + 2) + "px";
      win.appendChild(m);
    }
    function closeMenu() { win.querySelectorAll(".pp-menu").forEach(m => m.remove()); L.menu = null; }

    win.addEventListener("click", e => {
      const fx = e.target.closest("[data-fx]"); if (fx) { addFx(fx.dataset.fx, fx.dataset.mode || "replace"); return; }
      const dir = e.target.closest("[data-dir]"); if (dir) { L.steps[L.cur].dir = dir.dataset.dir; L.flags.dir = true; closeMenu(); paint(); return; }
      const del = e.target.closest("[data-del]"); if (del) { L.steps.splice(+del.dataset.del, 1); L.cur = Math.min(L.cur, L.steps.length - 1); paint(); return; }
      const row = e.target.closest(".ap-row"); if (row) { L.cur = +row.dataset.k; L.obj = L.steps[L.cur].el; paint(); return; }
      const d = e.target.closest("[data-do]"); if (!d) return;
      const a = d.dataset.do;
      if (a === "gallery" || a === "dir") { L.menu ? closeMenu() : openMenu(a, d); return; }
      if (a === "preview") { closeMenu(); L.flags.played = true; tick(); ANIM.play(stage, L.steps, { pane: list, hint, done: () => say("Vége a diának.") }); say(L.steps.some(s => s.start === "click") ? "Lejátszás: ahol egeret látsz a munkaablakban, ott kattintani kell a diára." : ""); return; }
      if ((a === "up" || a === "down") && L.cur >= 0) {
        const j = L.cur + (a === "up" ? -1 : 1); if (j < 0 || j >= L.steps.length) return;
        [L.steps[L.cur], L.steps[j]] = [L.steps[j], L.steps[L.cur]]; L.cur = j; L.flags.moved = true; paint();
      }
    });
    /* the start list applies on change; the times apply while you type (a change event on blur would land after the next click) */
    const setT = e => {
      const t = e.target.dataset.t, s = L.steps[L.cur]; if (!t || !s) return;
      if (t === "start") { if (e.type !== "change") return; s.start = e.target.value; }
      else { if (e.type !== "input") return; const v = parseFloat(String(e.target.value).replace(",", ".")); if (isNaN(v)) return; s[t] = Math.max(0, Math.min(20000, Math.round(v * 1000))); }
      paint();
    };
    rib.addEventListener("change", setT); rib.addEventListener("input", setT);
    document.addEventListener("pointerdown", e => { if (L.menu && !e.target.closest(".pp-menu") && !e.target.closest("[data-do='gallery'],[data-do='dir']")) closeMenu(); }, true);
    stage.addEventListener("click", e => {
      if (stage.classList.contains("playing")) return;
      const o = e.target.closest(".pp-obj");
      L.obj = o ? o.dataset.obj : null;
      const mine = L.steps.map((s, k) => s.el === L.obj ? k : -1).filter(k => k >= 0);
      L.cur = mine.length ? mine[mine.length - 1] : -1;
      say(o ? `Kijelölve: <b>${esc(cfg.objects[L.obj].name)}</b>. Most válassz neki effektust fent.` : "");
      paint();
    });
    paint();
  });
})();
