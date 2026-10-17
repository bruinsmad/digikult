/* Inkscape missions – renders a mission page from window.MISSION.
   Progress is saved in this browser under MISSION.key as {solved:[step numbers], checks:[…], end:bool};
   the landing page reads "solved" to draw the progress bar (see nav.js → progress). */
const DEFAULT_RULES = [
  "<b>Colours:</b> click a swatch in the palette = fill colour. Stroke colour and stroke on/off: <span class=\"menu\">Object ▸ Fill and Stroke…</span>, <i>Stroke paint</i> tab.",
  "<b>Several objects:</b> click the first, hold <span class=\"key\">Shift</span> and click the others. The status bar at the bottom counts them.",
  "<b>Difference:</b> the object on <i>top</i> is cut out of the one underneath. Exactly two objects must be selected."
];

(function () {
  const M = window.MISSION;
  const $ = s => document.querySelector(s);
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const N = M.steps.length;

  /* ---------- saved state ---------- */
  let S = { solved: [], checks: [], end: false };
  try { const s = JSON.parse(localStorage.getItem(M.key)); if (s && Array.isArray(s.solved)) S = Object.assign(S, s); } catch (e) {}
  const save = () => { try { localStorage.setItem(M.key, JSON.stringify(S)); } catch (e) {} };
  const isDone = n => S.solved.includes(n);

  /* ---------- markup ---------- */
  const tilt = i => ["-.3deg", ".25deg", "-.15deg", ".35deg"][i % 4];
  const tape = `<span class="tape l" aria-hidden="true"></span><span class="tape r" aria-hidden="true"></span>`;
  const shot = (src, alt) => `<figure class="shot" style="margin:0" data-zoom="${esc(src)}" tabindex="0" role="button" aria-label="Enlarge picture: ${esc(alt)}"><img src="${esc(src)}" alt="${esc(alt)}" loading="lazy"></figure>`;

  document.title = M.title + " – Inkscape";
  $("#app").innerHTML = `
  <header class="rail"><div class="wrap">
    <a class="logo" href="../../">
      <svg width="28" height="28" viewBox="0 0 30 30" aria-hidden="true"><rect x="1.5" y="3" width="27" height="20" rx="2" fill="#22362f" stroke="#fff6e8" stroke-width="2"/><path d="M7 10h9M7 15h13" stroke="#f2d264" stroke-width="2.4" stroke-linecap="round"/><path d="M9 23l-3 5M21 23l3 5" stroke="#fff6e8" stroke-width="2" stroke-linecap="round"/></svg>
      <span>digikult</span></a>
    <nav class="dots" aria-label="Steps"><span class="lbl">Steps</span>
      ${M.steps.map((s, i) => `<a href="#step-${i + 1}" data-n="${i + 1}" title="Step ${i + 1}: ${esc(s.title)}">${i + 1}</a>`).join("")}
    </nav>
  </div></header>

  <main class="wrap">
    <section class="hero">
      <div>
        <p class="kicker">Inkscape mission</p>
        <h1>${esc(M.title)}</h1>
        <svg class="scribble" viewBox="0 0 420 22" aria-hidden="true"><path d="M4 14 C 80 4, 160 20, 240 10 S 360 6, 414 12"/></svg>
        <p class="story">${esc(M.story)}</p>
        <div class="meter" aria-live="polite">
          <div class="row"><span>Your progress</span><b id="count"></b></div>
          <span class="bar" id="bar">${M.steps.map(() => "<i></i>").join("")}</span>
        </div>
        <div class="actions">
          <a class="btn chalk" href="#start">Start the mission ▸</a>
          <a class="btn ghost" href="${esc(M.pdf)}" download>⬇ Worksheet (PDF)</a>
        </div>
      </div>
      <figure class="poster" data-zoom="${esc(M.poster)}" tabindex="0" role="button" aria-label="Enlarge the finished poster">
        <img src="${esc(M.poster)}" alt="The finished poster">
        <figcaption>This is what you'll make</figcaption>
      </figure>
    </section>

    <section class="sec">
      <div class="sec-head"><h2>What you'll build</h2><p>${M.buildIntro || "Every part is made with one operation you already know. Colours and sizes are up to you."}</p>
        <svg viewBox="0 0 200 12" aria-hidden="true"><path d="M3 8 C 50 2, 100 12, 150 5 S 190 5, 197 7"/></svg></div>
      <ul class="elements">${M.elements.map(([what, how, op]) => `<li><b>${esc(what)}</b><span>${esc(how)}</span><span><em>${esc(op)}</em></span></li>`).join("")}</ul>
    </section>

    <section class="sec" id="start">
      <div class="sec-head"><h2>Before you start</h2><p>No keyboard shortcuts today: every command is in a menu or on a toolbar.</p>
        <svg viewBox="0 0 200 12" aria-hidden="true"><path d="M3 8 C 50 2, 100 12, 150 5 S 190 5, 197 7"/></svg></div>
      <article class="sheet" style="--tilt:-.2deg">${tape}
        <h3>Find your way around Inkscape</h3>
        <p class="lead">The numbered parts are the ones you'll use. Click the picture to make it bigger.</p>
        <div class="start-grid">
          ${shot("../img/common/inkscape-map.png", "The Inkscape window: menu bar, tool controls bar, toolbox, page, Fill and Stroke panel, palette, status bar")}
          <div><p class="lead" style="margin:6px 0 8px"><b>Your tools</b> – the toolbox on the left edge. Hover an icon to see its name.</p>
          ${shot("../img/common/tools.png", "Toolbox icons: Selector, Node tool, Rectangle, Ellipse, Star/Polygon, Text")}</div>
          <div><p class="lead" style="margin:6px 0 8px"><b>First:</b> <span class="menu">File ▸ New</span>, then <span class="menu">File ▸ Save As…</span> <code>${esc(M.file)}.svg</code>, then <span class="menu">View ▸ Zoom ▸ Zoom Page</span>.</p></div>
          <ul class="rules">${(M.rules || DEFAULT_RULES).map((r, i) => `<li><span class="ic">${i + 1}</span><span>${r}</span></li>`).join("")}</ul>
        </div>
      </article>
    </section>

    <section class="sec">
      <div class="sec-head" style="--c:var(--accent)"><h2>The steps</h2><p>Follow the numbered pictures from left to right. When a step is done, tick it off.</p>
        <svg viewBox="0 0 200 12" aria-hidden="true"><path d="M3 8 C 50 2, 100 12, 150 5 S 190 5, 197 7"/></svg></div>
      ${M.steps.map((s, i) => `
      <article class="sheet step" id="step-${i + 1}" data-n="${i + 1}" style="--tilt:${tilt(i)}">${tape}
        <h3><span class="num">${i + 1}</span>${esc(s.title)} <span class="stamp">done!</span></h3>
        <p class="lead">${s.lead}</p>
        ${shot(s.img, s.alt)}
        <p class="zoomhint">Click the picture to enlarge it.</p>
        ${s.note ? `<p class="note">${s.note}</p>` : ""}
        ${s.stuck && s.stuck.length ? `<details class="stuck"><summary>Stuck?</summary><ul>${s.stuck.map(x => `<li>${x}</li>`).join("")}</ul></details>` : ""}
        <div class="foot">
          <button class="done-btn" type="button" data-n="${i + 1}" aria-pressed="false"><span class="box" aria-hidden="true"></span><span class="t">I did this step</span></button>
          ${i < N - 1 ? `<a class="next-link" href="#step-${i + 2}">Next: ${esc(M.steps[i + 1].title)} ↓</a>` : `<a class="next-link" href="#save">Last thing: save and hand in ↓</a>`}
        </div>
      </article>`).join("")}
    </section>

    <section class="sec" id="save">
      <div class="sec-head"><h2>Save and hand in</h2><p>Two files: the SVG (so your teacher can see how you made it) and a PNG picture.</p>
        <svg viewBox="0 0 200 12" aria-hidden="true"><path d="M3 8 C 50 2, 100 12, 150 5 S 190 5, 197 7"/></svg></div>
      <article class="sheet" style="--tilt:.2deg">${tape}
        <h3>Checklist before handing in</h3>
        ${shot(M.saveImg, "File ▸ Save gives the SVG; File ▸ Export…, choose Page, Export gives the PNG")}
        <p class="note">Name them <code>${esc(M.file)}.svg</code> and <code>${esc(M.file)}.png</code>. (Older Inkscape: <span class="menu">File ▸ Export PNG Image…</span>)</p>
        <ul class="check">${M.checklist.map((c, i) => `<li><label><input type="checkbox" data-c="${i}"><span>${c}</span></label></li>`).join("")}</ul>
      </article>
      <div class="finish" id="finish" role="status"><h2>Mission complete!</h2><p>Hand in your two files, then try a bonus below.</p></div>
    </section>

    <section class="sec" id="bonus">
      <div class="sec-head"><h2>Bonus – if you have time left</h2><p>Same operations, new shapes. Pick any.</p>
        <svg viewBox="0 0 200 12" aria-hidden="true"><path d="M3 8 C 50 2, 100 12, 150 5 S 190 5, 197 7"/></svg></div>
      <article class="sheet" style="--tilt:-.2deg">${tape}
        <ul class="bonus">${M.bonus.map(([t, r]) => `<li><b>${esc(t)}</b><span>${r}</span></li>`).join("")}</ul>
        ${shot(M.bonusImg, "Bonus ideas")}
      </article>
    </section>
  </main>

  <footer class="tray"><div class="wrap">
    <span class="sticks" aria-hidden="true"><i></i><i></i><i></i></span>
    <span>Printable: <a href="${esc(M.pdf)}" download>student worksheet</a> · <a href="${esc(M.teacherPdf)}" download>teacher notes</a></span>
    <button class="reset" type="button" id="reset">Start over</button>
  </div></footer>

  <div class="lb" id="lb" role="dialog" aria-modal="true" aria-label="Enlarged picture"><button type="button" aria-label="Close">×</button><img alt=""></div>`;

  /* ---------- progress ---------- */
  function paint() {
    document.querySelectorAll(".step").forEach(el => {
      const n = +el.dataset.n, d = isDone(n);
      el.classList.toggle("is-done", d);
      const b = el.querySelector(".done-btn");
      b.setAttribute("aria-pressed", String(d));
      b.querySelector(".box").textContent = d ? "✓" : "";
      b.querySelector(".t").textContent = d ? "Done" : "I did this step";
    });
    document.querySelectorAll(".dots a").forEach(a => a.classList.toggle("done", isDone(+a.dataset.n)));
    document.querySelectorAll("#bar i").forEach((i, k) => i.classList.toggle("on", isDone(k + 1)));
    $("#count").textContent = `${S.solved.length} / ${N} steps`;
    document.querySelectorAll(".check input").forEach(c => { c.checked = S.checks.includes(+c.dataset.c); });
    const allSteps = S.solved.length >= N, allChecks = S.checks.length >= M.checklist.length;
    const wasEnd = S.end;
    S.end = allSteps && allChecks;
    $("#finish").classList.toggle("show", S.end);
    return !wasEnd && S.end;
  }
  function confetti() {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const box = document.createElement("div"); box.className = "confetti";
    const cols = ["#f2d264", "#f0a3b8", "#9cc8e8", "#a8dba0", "#efeee6"];
    for (let i = 0; i < 90; i++) {
      const p = document.createElement("i");
      p.style.left = Math.random() * 100 + "vw";
      p.style.background = cols[i % cols.length];
      p.style.animationDuration = 1.8 + Math.random() * 1.8 + "s";
      p.style.animationDelay = Math.random() * .5 + "s";
      box.appendChild(p);
    }
    document.body.appendChild(box);
    setTimeout(() => box.remove(), 4200);
  }
  function update() { const justFinished = paint(); save(); if (justFinished) confetti(); }

  document.querySelectorAll(".done-btn").forEach(b => b.addEventListener("click", () => {
    const n = +b.dataset.n;
    S.solved = isDone(n) ? S.solved.filter(x => x !== n) : [...S.solved, n].sort((a, c) => a - c);
    update();
    if (isDone(n)) {                 /* glide to the next unfinished step */
      const next = M.steps.findIndex((_, k) => !isDone(k + 1));
      const target = next === -1 ? $("#save") : document.getElementById("step-" + (next + 1));
      if (target && next !== n - 1) setTimeout(() => target.scrollIntoView({ block: "start" }), 250);
    }
  }));
  document.querySelectorAll(".check input").forEach(c => c.addEventListener("change", () => {
    const k = +c.dataset.c;
    S.checks = c.checked ? [...new Set([...S.checks, k])] : S.checks.filter(x => x !== k);
    update();
  }));
  $("#reset").addEventListener("click", () => {
    if (!S.solved.length && !S.checks.length) return;
    S = { solved: [], checks: [], end: false }; update(); window.scrollTo({ top: 0 });
  });

  /* current step marker in the rail */
  const io = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) document.querySelectorAll(".dots a").forEach(a => a.classList.toggle("cur", a.dataset.n === e.target.dataset.n));
  }), { rootMargin: "-40% 0px -55% 0px" });
  document.querySelectorAll(".step").forEach(el => io.observe(el));

  /* ---------- lightbox ---------- */
  const lb = $("#lb"), lbImg = lb.querySelector("img");
  let opener = null;
  const open = el => { opener = el; lbImg.src = el.dataset.zoom; lbImg.alt = (el.querySelector("img") || {}).alt || ""; lb.classList.add("open"); lb.querySelector("button").focus(); };
  const close = () => { lb.classList.remove("open"); if (opener) opener.focus(); };
  document.querySelectorAll("[data-zoom]").forEach(el => {
    el.addEventListener("click", () => open(el));
    el.addEventListener("keydown", e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); open(el); } });
  });
  lb.addEventListener("click", close);
  document.addEventListener("keydown", e => { if (e.key === "Escape" && lb.classList.contains("open")) close(); });

  update();
})();
