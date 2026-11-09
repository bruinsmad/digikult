/* digikult — Word explainers: little Word documents to try things on, with task lists, and the quiz at the end.
   The page defines TRY = { id: { title, sub, model (WD model), tools, ruler, editor: false (read-only page), mount(host, changed, box) (own widget),
                                  goals: [{ text, test(model, sel) }], note, buttons: [{ label, on(model) }], after(api, box) } }
   and QUIZ = [{ q, opts: [...], right: 0, fb }]. */
(function () {
  "use strict";
  const TRY = window.TRY || {}, QUIZ = window.QUIZ || [];

  document.querySelectorAll("[data-try]").forEach(box => {
    const cfg = TRY[box.dataset.try]; if (!cfg) return;
    box.classList.add("try");
    const goals = cfg.goals || [];
    box.innerHTML = `${cfg.title ? `<p class="try-head">${cfg.title}${cfg.sub ? ` <span>${cfg.sub}</span>` : ""}</p>` : ""}
      ${cfg.buttons ? `<div class="try-btns">${cfg.buttons.map((b, i) => `<button type="button" data-b="${i}">${b.label}</button>`).join("")}</div>` : ""}
      <div class="doc-host"></div>
      ${goals.length ? `<ul class="goals">${goals.map((g, i) => `<li data-i="${i}"><span>${g.text}</span></li>`).join("")}</ul>` : ""}
      ${cfg.note ? `<p class="try-note">${cfg.note}</p>` : ""}`;
    let sel = null;
    const tick = m => goals.forEach((g, i) => box.querySelector(`.goals li[data-i="${i}"]`).classList.toggle("ok", !!g.test(m, sel)));
    const host = box.querySelector(".doc-host");
    /* on a phone a 15 cm page would shrink to tiny letters: give the little documents a narrower page there */
    const pg = cfg.model && cfg.model.page;
    if (!cfg.mount && cfg.editor !== false && pg && innerWidth < 640 && pg.w > 10) Object.assign(pg, { w: 9.5, left: 0.7, right: 0.7, top: 0.8, bottom: 0.8 });
    const api = cfg.mount ? cfg.mount(host, () => tick(cfg.model), box)
      : cfg.editor === false ? WD.page(host, cfg.model)
      : WD.editor(host, cfg.model, { tools: cfg.tools, ruler: cfg.ruler, select: cfg.select, onChange: m => tick(m), onSelect: (s, m) => { sel = s; tick(m); } });
    if (cfg.buttons) box.querySelector(".try-btns").addEventListener("click", e => {
      const b = e.target.closest("button"); if (!b) return;
      const def = cfg.buttons[+b.dataset.b];
      def.on(cfg.model, b);
      if (def.group) box.querySelectorAll(".try-btns button").forEach(x => { if (cfg.buttons[+x.dataset.b].group === def.group) x.classList.toggle("on", x === b); });
      if (api && api.render) api.render(cfg.model); tick(cfg.model);
    });
    tick(cfg.model);
    if (cfg.after) cfg.after(api, box);
  });

  /* ---------- quiz ---------- */
  const qz = document.getElementById("quiz");
  if (qz && QUIZ.length) {
    let answered = 0, right = 0;
    /* the right answer is written first in the page; show the options in a mixed order */
    const order = n => { const a = [...Array(n).keys()]; for (let i = n - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
    qz.innerHTML = QUIZ.map((q, i) => `<fieldset class="q" data-i="${i}"><legend>${q.q}</legend>
      <div class="opts">${order(q.opts.length).map(k => `<button type="button" class="opt" data-k="${k}">${q.opts[k]}</button>`).join("")}</div><p class="fb"><b></b> ${q.fb}</p></fieldset>`).join("") +
      `<p class="score" id="score"></p>`;
    qz.addEventListener("click", e => {
      const b = e.target.closest(".opt"); if (!b) return;
      const fs = b.closest(".q"); if (fs.classList.contains("done")) return;
      const q = QUIZ[+fs.dataset.i], k = +b.dataset.k, ok = k === q.right;
      fs.classList.add("done"); if (!ok) fs.classList.add("miss");
      b.classList.add(ok ? "right" : "wrong");
      if (!ok) fs.querySelector(`.opt[data-k="${q.right}"]`).classList.add("right");
      fs.querySelector(".fb b").textContent = ok ? "Így van!" : "Nem egészen.";
      answered++; if (ok) right++;
      if (answered === QUIZ.length) {
        const s = document.getElementById("score");
        s.textContent = `${right} / ${QUIZ.length} helyes válasz. ` + (right === QUIZ.length ? "Hibátlan! Jöhet a küldetés." : right >= QUIZ.length - 1 ? "Majdnem hibátlan. Nézd meg még egyszer, amit elrontottál!" : "Olvasd el újra a fenti részeket, aztán próbáld újra (frissítsd az oldalt).");
        s.classList.add("show");
      }
    });
  }
})();
