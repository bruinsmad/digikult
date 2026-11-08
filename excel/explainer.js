/* digikult — Excel explainers: live worksheets with task lists, and the quiz at the end.
   The page defines TRY = { id: { …grid options…, goals: [{ text, range, ref, use, … } | { text, select: "D5" }] } }
   and QUIZ = [{ q, code, opts: [...], right: 0, fb }]. */
(function () {
  "use strict";
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const TRY = window.TRY || {}, QUIZ = window.QUIZ || [];

  document.querySelectorAll("[data-try]").forEach(box => {
    const cfg = TRY[box.dataset.try]; if (!cfg) return;
    box.classList.add("try");
    box.innerHTML = `${cfg.title ? `<p class="try-head">${cfg.title}${cfg.sub ? ` <span>${cfg.sub}</span>` : ""}</p>` : ""}<div class="sheet-host"></div>
      ${cfg.goals ? `<ul class="goals">${cfg.goals.map((g, i) => `<li data-i="${i}"><span>${g.text}</span>${g.ref ? `<button type="button" class="sol" data-i="${i}">megoldás</button>` : ""}</li>`).join("")}</ul>` : ""}
      ${cfg.note ? `<p class="try-note">${cfg.note}</p>` : ""}`;
    const goals = cfg.goals || [], selected = new Set();
    const tick = g => {
      goals.forEach((goal, i) => {
        let ok;
        if (goal.select) ok = selected.has(goal.select);
        else if (goal.test) { ok = goal.test(g); if (ok && typeof ok === "object") ok = ok.ok; }
        else ok = XL.check(g, goal).ok;
        box.querySelector(`.goals li[data-i="${i}"]`).classList.toggle("ok", !!ok);
      });
    };
    const g = XL.grid(box.querySelector(".sheet-host"), Object.assign({}, cfg, {
      onChange: g => tick(g),
      onSelect: (g, a) => { selected.add(a); if (goals.some(x => x.select)) tick(g); }
    }));
    if (cfg.targets) g.setTargets(cfg.targets);
    if (cfg.maxHeight) box.querySelector(".xl").style.setProperty("--xl-max", cfg.maxHeight + "px");
    box.addEventListener("click", e => {
      if (e.target.closest(".xl-toggle")) setTimeout(() => tick(g), 0);
      const b = e.target.closest(".sol"); if (!b) return;
      const goal = goals[+b.dataset.i], first = XL.rangeOf(goal.range).c1, r1 = XL.rangeOf(goal.range).r1;
      const shown = goal.show || (goal.ref + (goal.range.includes(":") ? `, és húzd le a kitöltőjellel ${XL.az(goal.range.split(":")[1])} ${goal.range.split(":")[1]}-ig` : ""));
      b.outerHTML = `<code class="f">${esc(shown)}</code>`;
      g.select(XL.A(first, r1));
    });
    tick(g);
    if (cfg.after) cfg.after(g, box);
  });

  /* ---------- quiz ---------- */
  const qz = document.getElementById("quiz");
  if (qz && QUIZ.length) {
    let answered = 0, right = 0;
    qz.innerHTML = QUIZ.map((q, i) => `<fieldset class="q" data-i="${i}"><legend>${q.q}</legend>${q.code ? `<pre class="code">${esc(q.code)}</pre>` : ""}
      <div class="opts">${q.opts.map((o, k) => `<button type="button" class="opt" data-k="${k}">${o}</button>`).join("")}</div><p class="fb"><b></b> ${q.fb}</p></fieldset>`).join("") +
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
