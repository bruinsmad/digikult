/* digikult — PowerPoint explainers: the quiz at the end.
   The page defines QUIZ = [{ q, opts: [...], right: index, fb }]. The options are shuffled for each visitor. */
(function () {
  "use strict";
  const QUIZ = window.QUIZ || [];
  const qz = document.getElementById("quiz");
  if (!qz || !QUIZ.length) return;
  const order = QUIZ.map(q => { const o = q.opts.map((_, k) => k); for (let i = o.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [o[i], o[j]] = [o[j], o[i]]; } return o; });
  let answered = 0, right = 0;
  qz.innerHTML = QUIZ.map((q, i) => `<fieldset class="q" data-i="${i}"><legend>${q.q}</legend>${q.pic ? `<div class="qpic">${q.pic}</div>` : ""}
    <div class="opts">${order[i].map(k => `<button type="button" class="opt" data-k="${k}">${q.opts[k]}</button>`).join("")}</div><p class="fb"><b></b> ${q.fb}</p></fieldset>`).join("") +
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
})();
