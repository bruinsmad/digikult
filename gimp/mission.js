/* GIMP missions – renders a mission page from window.MISSION (same engine as the Inkscape missions, GIMP wording).
   Extra fields: files = zip of the pictures handed out, bgFile = the picture to open first.

   Progress is saved in this browser under MISSION.key as {solved:[step numbers], checks:[…], end:bool};
   the landing page reads "solved" to draw the progress bar (see nav.js → progress). */

/* progress as chalk tally marks (four strokes and a slash per bundle), like the landing page */
function tallyMarks(n){
  let d = "";
  for (let i = 0; i < n; i++){
    const g = Math.floor(i / 5), k = i % 5, x0 = g * 34, w = ((i * 7) % 3 - 1) * .7;
    d += k < 4 ? `<path d="M${x0 + 3 + k * 6} ${3 + (i % 2)}L${x0 + 3 + k * 6 + w} 19"/>` : `<path d="M${x0} 15L${x0 + 24} 6"/>`;
  }
  const wd = Math.ceil(n / 5) * 34 - 6;
  return `<svg class="tally" viewBox="-2 0 ${wd + 4} 22" width="${wd + 4}" height="22" aria-hidden="true">${d}</svg>`;
}

const DEFAULT_RULES = [
  "<b>Layer first, tool second:</b> every command works on the <i>active</i> layer. Click the layer in the Layers panel before you do anything to it.",
  "<b>Scale, Rotate and Perspective</b> open a small window: the change only becomes final when you press its button (<i>Scale</i>, <i>Rotate</i>, <i>Transform</i>).",
  "<b>Can't find a tool or the Layers panel?</b> <span class=\"menu\">Tools ▸ Transform Tools</span>, <span class=\"menu\">Tools ▸ Selection Tools</span>, and <span class=\"menu\">Windows ▸ Dockable Dialogs ▸ Layers</span>. Something went wrong: <span class=\"menu\">Edit ▸ Undo</span>."
];

const MISSION_UI = {
  en: {
    steps: "Steps", step: "Step", kicker: "GIMP mission", progress: "Your progress", nSteps: (a, b) => `${a} / ${b} steps`,
    start: "Start the mission", pdf: "Worksheet (PDF)", posterCap: "This is what you'll make", posterAria: "Enlarge the finished picture", posterAlt: "The finished picture", files: "Source files (ZIP)",
    build: "What you'll build", buildIntro: "Every part is made with a tool you already know. Sizes and positions are up to you.",
    before: "Before you start", beforeSub: "No keyboard shortcuts today: every command is in a menu or on a toolbar.",
    find: "Find your way around GIMP", findLead: "The numbered parts are the ones you'll use. Click the picture to make it bigger.",
    mapAlt: "The GIMP window: menu bar, toolbox, tool options, the image, Layers panel",
    tools: "<b>Your tools</b> – in the toolbox on the left. Hover an icon to see its name. Tools can hide behind each other: all of them are in the <span class=\"menu\">Tools</span> menu too.", toolsAlt: "Toolbox icons: Move, Scale, Rotate, Flip, Perspective, Fuzzy Select",
    first: (f, M) => `<b>First:</b> download and unzip the <a href="${M.files}" download>source files</a>. In GIMP: <span class="menu">File ▸ Open…</span> <code>${M.bgFile}</code>, then <span class="menu">File ▸ Save As…</span> <code>${f}.xcf</code>.`,
    stepsH: "The steps", stepsSub: "Follow the numbered pictures from left to right. When a step is done, tick it off.",
    stamp: "done!", zoomHint: "Click the picture to enlarge it.", stuck: "Stuck?", did: "I did this step", done: "Done", next: "Next:", last: "Last thing: save and hand in ↓",
    save: "Save and hand in", saveSub: "Two files: the XCF (it keeps the layers, so your teacher can see how you made it) and a PNG picture.", check: "Checklist before handing in",
    saveAlt: "File ▸ Save gives the XCF; File ▸ Export As… gives the PNG",
    names: f => `Name them <code>${f}.xcf</code> and <code>${f}.png</code>. The PNG is one flat picture: the layers only survive in the XCF.`,
    fin: "Mission complete!", finSub: "Hand in your two files, then try a bonus below.",
    bonus: "Bonus – if you have time left", bonusSub: "Same tools, new ideas. Pick any.", bonusAlt: "Bonus ideas",
    printable: "Printable:", student: "student worksheet", teacher: "teacher notes", reset: "Start over",
    lb: "Enlarged picture", close: "Close", enlarge: "Enlarge picture:", img: "../img/common/"
  },
  hu: {
    steps: "Lépések", step: "Lépés", kicker: "GIMP-küldetés", progress: "Haladásod", nSteps: (a, b) => `${a} / ${b} lépés`,
    start: "Indulhat a küldetés", pdf: "Feladatlap (PDF)", posterCap: "Ezt fogod elkészíteni", posterAria: "A kész kép nagyítása", posterAlt: "A kész kép", files: "Forrásfájlok (ZIP)",
    build: "Mit készítesz?", buildIntro: "Minden rész egy olyan eszközzel készül, amit már ismersz. A méretek és a helyek a te döntésed.",
    before: "Mielőtt elkezded", beforeSub: "Ma nincs billentyűparancs: minden parancs egy menüben vagy egy eszköztáron van.",
    find: "Igazodj el a GIMP-ben", findLead: "A számozott részeket fogod használni. Kattints a képre a nagyításhoz.",
    mapAlt: "A GIMP ablaka: menüsor, eszköztár, eszközbeállítások, a kép, Rétegek panel",
    tools: "<b>Az eszközeid</b> – az eszköztárban, bal oldalon. Vidd az egeret egy ikonra, és megjelenik a neve. Az eszközök egymás mögé bújhatnak: mindegyik megvan az <span class=\"menu\">Eszközök</span> menüben is.", toolsAlt: "Eszköztár-ikonok: Áthelyezés, Átméretezés, Forgatás, Tükrözés, Perspektíva, Varázspálca-kijelölés",
    first: (f, M) => `<b>Először:</b> töltsd le és csomagold ki a <a href="${M.files}" download>forrásfájlokat</a>. A GIMP-ben: <span class="menu">Fájl ▸ Megnyitás…</span> <code>${M.bgFile}</code>, aztán <span class="menu">Fájl ▸ Mentés másként…</span> <code>${f}.xcf</code>.`,
    stepsH: "A lépések", stepsSub: "Kövesd a számozott képeket balról jobbra. Ha kész egy lépés, pipáld ki.",
    stamp: "kész!", zoomHint: "Kattints a képre a nagyításhoz.", stuck: "Elakadtál?", did: "Ezt a lépést megcsináltam", done: "Kész", next: "Következik:", last: "Utolsó lépés: mentés és beadás ↓",
    save: "Mentés és beadás", saveSub: "Két fájl: az XCF (megőrzi a rétegeket – ebből látja a tanár, hogyan készült) és egy PNG kép.", check: "Ellenőrzőlista beadás előtt",
    saveAlt: "Fájl ▸ Mentés: XCF; Fájl ▸ Exportálás másként…: PNG",
    names: f => `A nevük: <code>${f}.xcf</code> és <code>${f}.png</code>. A PNG egyetlen lapos kép: a rétegek csak az XCF-ben maradnak meg.`,
    fin: "Küldetés teljesítve!", finSub: "Add be a két fájlt, aztán próbálj ki egy bónuszt lent.",
    bonus: "Bónusz – ha marad időd", bonusSub: "Ugyanazok az eszközök, új ötletek. Válassz bármelyiket.", bonusAlt: "Bónuszötletek",
    printable: "Nyomtatható:", student: "feladatlap", teacher: "tanári segédlet", reset: "Újrakezdés",
    lb: "Nagyított kép", close: "Bezárás", enlarge: "Kép nagyítása:", img: "../img/common/hu/"
  }
};
const DEFAULT_RULES_HU = [
  "<b>Előbb a réteg, aztán az eszköz:</b> minden parancs az <i>aktív</i> rétegen dolgozik. Kattints a rétegre a Rétegek panelen, mielőtt bármit csinálsz vele.",
  "<b>Az Átméretezés, a Forgatás és a Perspektíva</b> kis ablakot nyit: a változás csak akkor végleges, ha megnyomod a gombját (<i>Átméretezés</i>, <i>Forgatás</i>, <i>Átalakítás</i>).",
  "<b>Nem találsz egy eszközt vagy a Rétegek panelt?</b> <span class=\"menu\">Eszközök ▸ Átalakítóeszközök</span>, <span class=\"menu\">Eszközök ▸ Kijelölőeszközök</span>, illetve <span class=\"menu\">Ablakok ▸ Dokkolható párbeszédablakok ▸ Rétegek</span>. Ha valami elromlott: <span class=\"menu\">Szerkesztés ▸ Visszavonás</span>."
];

(function () {
  const M = window.MISSION;
  const $ = s => document.querySelector(s);
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const N = M.steps.length;
  const L = M.lang === "hu" ? "hu" : "en", U = MISSION_UI[L];

  /* ---------- saved state ---------- */
  let S = { solved: [], checks: [], end: false };
  try { const s = JSON.parse(localStorage.getItem(M.key)); if (s && Array.isArray(s.solved)) S = Object.assign(S, s); } catch (e) {}
  const save = () => { try { localStorage.setItem(M.key, JSON.stringify(S)); } catch (e) {} };
  const isDone = n => S.solved.includes(n);

  /* ---------- markup ---------- */
  const tilt = i => ["-.3deg", ".25deg", "-.15deg", ".35deg"][i % 4];
  const tape = `<span class="tape l" aria-hidden="true"></span><span class="tape r" aria-hidden="true"></span>`;
  const shot = (src, alt) => `<figure class="shot" style="margin:0" data-zoom="${esc(src)}" tabindex="0" role="button" aria-label="${U.enlarge} ${esc(alt)}"><img src="${esc(src)}" alt="${esc(alt)}" loading="lazy"></figure>`;

  document.title = M.title + " – GIMP";
  document.documentElement.lang = L;
  $("#app").innerHTML = `
  <header class="rail"><div class="wrap">
    <a class="logo" href="../../">
      <svg width="28" height="28" viewBox="0 0 30 30" aria-hidden="true"><rect x="1.5" y="3" width="27" height="20" rx="2" fill="#22362f" stroke="#fff6e8" stroke-width="2"/><path d="M7 10h9M7 15h13" stroke="#f2d264" stroke-width="2.4" stroke-linecap="round"/><path d="M9 23l-3 5M21 23l3 5" stroke="#fff6e8" stroke-width="2" stroke-linecap="round"/></svg>
      <span>digikult</span></a>
    <nav class="dots" aria-label="${U.steps}"><span class="lbl">${U.steps}</span>
      ${M.steps.map((s, i) => `<a href="#step-${i + 1}" data-n="${i + 1}" title="${U.step} ${i + 1}: ${esc(s.title)}">${i + 1}</a>`).join("")}
    </nav>
  </div></header>

  <main class="wrap">
    <section class="hero">
      <div>
        <p class="kicker">${U.kicker}</p>
        <h1>${esc(M.title)}</h1>
        <svg class="scribble" viewBox="0 0 420 22" aria-hidden="true"><path d="M4 14 C 80 4, 160 20, 240 10 S 360 6, 414 12"/></svg>
        <p class="story">${esc(M.story)}</p>
        <div class="meter" aria-live="polite">
          <div class="row"><span>${U.progress}</span><b id="count"></b></div>
          <span class="bar" id="bar">${tallyMarks(M.steps.length)}</span>
        </div>
        <div class="actions">
          <a class="btn chalk" href="#start">${U.start}</a>
          <a class="btn ghost" href="${esc(M.files)}" download>${U.files}</a>
          <a class="btn ghost" href="${esc(M.pdf)}" download>${U.pdf}</a>
        </div>
      </div>
      <figure class="poster" data-zoom="${esc(M.poster)}" tabindex="0" role="button" aria-label="${U.posterAria}">
        <img src="${esc(M.poster)}" alt="${U.posterAlt}">
        <figcaption>${U.posterCap}</figcaption>
      </figure>
    </section>

    <section class="sec">
      <div class="sec-head"><h2>${U.build}</h2><p>${M.buildIntro || U.buildIntro}</p>
        <svg viewBox="0 0 200 12" aria-hidden="true"><path d="M3 8 C 50 2, 100 12, 150 5 S 190 5, 197 7"/></svg></div>
      <ul class="elements">${M.elements.map(([what, how, op]) => `<li><b>${esc(what)}</b><span>${esc(how)}</span><span><em>${esc(op)}</em></span></li>`).join("")}</ul>
    </section>

    <section class="sec" id="start">
      <div class="sec-head"><h2>${U.before}</h2><p>${U.beforeSub}</p>
        <svg viewBox="0 0 200 12" aria-hidden="true"><path d="M3 8 C 50 2, 100 12, 150 5 S 190 5, 197 7"/></svg></div>
      <article class="sheet" style="--tilt:-.2deg">${tape}
        <h3>${U.find}</h3>
        <p class="lead">${U.findLead}</p>
        <div class="start-grid">
          ${shot(U.img + "gimp-map.jpg", U.mapAlt)}
          <div><p class="lead" style="margin:6px 0 8px">${U.tools}</p>
          ${shot(U.img + "tools.png", U.toolsAlt)}</div>
          <div><p class="lead" style="margin:6px 0 8px">${U.first(esc(M.file), M)}</p></div>
          <ul class="rules">${(M.rules || (L === "hu" ? DEFAULT_RULES_HU : DEFAULT_RULES)).map((r, i) => `<li><span class="ic">${i + 1}</span><span>${r}</span></li>`).join("")}</ul>
        </div>
      </article>
    </section>

    <section class="sec">
      <div class="sec-head" style="--c:var(--accent)"><h2>${U.stepsH}</h2><p>${U.stepsSub}</p>
        <svg viewBox="0 0 200 12" aria-hidden="true"><path d="M3 8 C 50 2, 100 12, 150 5 S 190 5, 197 7"/></svg></div>
      ${M.steps.map((s, i) => `
      <article class="sheet step" id="step-${i + 1}" data-n="${i + 1}" style="--tilt:${tilt(i)}">${tape}
        <h3><span class="num">${i + 1}</span>${esc(s.title)} <span class="stamp">${U.stamp}</span></h3>
        <p class="lead">${s.lead}</p>
        ${shot(s.img, s.alt)}
        <p class="zoomhint">${U.zoomHint}</p>
        ${s.note ? `<p class="note">${s.note}</p>` : ""}
        ${s.stuck && s.stuck.length ? `<details class="stuck"><summary>${U.stuck}</summary><ul>${s.stuck.map(x => `<li>${x}</li>`).join("")}</ul></details>` : ""}
        <div class="foot">
          <button class="done-btn" type="button" data-n="${i + 1}" aria-pressed="false"><span class="box" aria-hidden="true"></span><span class="t">${U.did}</span></button>
          ${i < N - 1 ? `<a class="next-link" href="#step-${i + 2}">${U.next} ${esc(M.steps[i + 1].title)} ↓</a>` : `<a class="next-link" href="#save">${U.last}</a>`}
        </div>
      </article>`).join("")}
    </section>

    <section class="sec" id="save">
      <div class="sec-head"><h2>${U.save}</h2><p>${U.saveSub}</p>
        <svg viewBox="0 0 200 12" aria-hidden="true"><path d="M3 8 C 50 2, 100 12, 150 5 S 190 5, 197 7"/></svg></div>
      <article class="sheet" style="--tilt:.2deg">${tape}
        <h3>${U.check}</h3>
        ${shot(M.saveImg, U.saveAlt)}
        <p class="note">${U.names(esc(M.file))}</p>
        <ul class="check">${M.checklist.map((c, i) => `<li><label><input type="checkbox" data-c="${i}"><span>${c}</span></label></li>`).join("")}</ul>
      </article>
      <div class="finish" id="finish" role="status"><h2>${U.fin}</h2><p>${U.finSub}</p></div>
    </section>

    <section class="sec" id="bonus">
      <div class="sec-head"><h2>${U.bonus}</h2><p>${U.bonusSub}</p>
        <svg viewBox="0 0 200 12" aria-hidden="true"><path d="M3 8 C 50 2, 100 12, 150 5 S 190 5, 197 7"/></svg></div>
      <article class="sheet" style="--tilt:-.2deg">${tape}
        <ul class="bonus">${M.bonus.map(([t, r]) => `<li><b>${esc(t)}</b><span>${r}</span></li>`).join("")}</ul>
        ${shot(M.bonusImg, U.bonusAlt)}
      </article>
    </section>
  </main>

  <footer class="tray"><div class="wrap">
    <span class="sticks" aria-hidden="true"><i></i><i></i><i></i></span>
    <span>${U.printable} <a href="${esc(M.pdf)}" download>${U.student}</a> · <a href="${esc(M.teacherPdf)}" download>${U.teacher}</a></span>
    <button class="reset" type="button" id="reset">${U.reset}</button>
  </div></footer>

  <div class="lb" id="lb" role="dialog" aria-modal="true" aria-label="${U.lb}"><button type="button" aria-label="${U.close}">×</button><img alt=""></div>`;

  /* ---------- progress ---------- */
  function paint() {
    document.querySelectorAll(".step").forEach(el => {
      const n = +el.dataset.n, d = isDone(n);
      el.classList.toggle("is-done", d);
      const b = el.querySelector(".done-btn");
      b.setAttribute("aria-pressed", String(d));
      b.querySelector(".box").textContent = d ? "✓" : "";
      b.querySelector(".t").textContent = d ? U.done : U.did;
    });
    document.querySelectorAll(".dots a").forEach(a => a.classList.toggle("done", isDone(+a.dataset.n)));
    document.querySelectorAll("#bar path").forEach((i, k) => i.classList.toggle("on", isDone(k + 1)));
    $("#count").textContent = U.nSteps(S.solved.length, N);
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
