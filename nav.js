/* ============================================================
   digikult — site map + page menu
   ------------------------------------------------------------
   Every page includes this file once, before </body>, with a
   path relative to that page, e.g. for sql/where/heist.html:
       <script src="../../nav.js" defer></script>

   TO ADD A PAGE
   1. Put the file in  <topic>/<lesson>/<page>.html
   2. Add it to SITE below (a new lesson or topic is just a new
      object in the right list).
   3. Add the <script src="../../nav.js" defer></script> line.
   Optional per page: minutes, progress (localStorage key + chapter
   count, shown on the landing page), cover (path to an image).
   The landing page and the menu update themselves.
   ============================================================ */
(function () {
  const SITE = {
    name: { hu: "Digitális kultúra", en: "Digital Culture" },
    tagline: {
      hu: "Interaktív feladatok és bemutatók az órákhoz",
      en: "Interactive lessons and classroom demos"
    },
    topics: [
      {
        id: "sql",
        accent: "#f2d264",
        title: { hu: "Adatbázisok – SQL", en: "Databases – SQL" },
        blurb: {
          hu: "Lekérdezések a böngészőben, igazi adatbázissal. Nyomozás, terelés, csoportosítás.",
          en: "Real queries against a real database, right in the browser."
        },
        lessons: [
          {
            id: "where",
            title: { hu: "Szűrés: SELECT … FROM … WHERE", en: "Filtering: SELECT … FROM … WHERE" },
            pages: [
              {
                id: "where-intro",
                kind: "theory",
                minutes: 10,
                title: { hu: "Szűrés – elmélet", en: "Filtering – explainer" },
                desc: {
                  hu: "SELECT, FROM, WHERE lépésről lépésre: összehasonlítás, AND/OR, NULL, LIKE. Kipróbálható példák és egy rövid kvíz.",
                  en: "SELECT, FROM and WHERE step by step: comparisons, AND/OR, NULL, LIKE. Runnable examples and a short quiz."
                },
                files: { en: "sql/where/intro.html", hu: "sql/where/intro-hu.html" }
              },
              {
                id: "heist",
                kind: "story",
                minutes: 35,
                title: { hu: "Az Éjféli Paprika-rablás", en: "The Midnight Paprika Heist" },
                desc: {
                  hu: "Valaki ellopta az Éjféli Paprikát. 10 fejezet, egyetlen tábla – szűrd ki a tettest.",
                  en: "The Midnight Paprika is gone. Ten chapters, one table at a time: filter your way to the thief."
                },
                files: { en: "sql/where/heist.html", hu: "sql/where/heist-hu.html" },
                progress: { chapters: 10, keys: { en: "danube-star-v3", hu: "ejfeli-paprika-hu-v1" } }
              }
            ]
          },
          {
            id: "group-by",
            title: { hu: "Csoportosítás: GROUP BY és összesítő függvények", en: "Grouping: GROUP BY and aggregates" },
            pages: [
              {
                id: "group-by-intro",
                kind: "theory",
                minutes: 12,
                title: { hu: "Csoportosítás – elmélet", en: "Grouping – explainer" },
                desc: {
                  hu: "COUNT, SUM, AVG, MIN, MAX, GROUP BY és HAVING: hogyan lesz sok sorból egy szám, csoportonként.",
                  en: "COUNT, SUM, AVG, MIN, MAX, GROUP BY and HAVING: how many rows become one number, group by group."
                },
                files: { en: "sql/group-by/intro.html", hu: "sql/group-by/intro-hu.html" }
              },
              {
                id: "round-up",
                kind: "story",
                minutes: 35,
                title: { hu: "Bodri nagy terelése", en: "Bodri's Round-Up" },
                desc: {
                  hu: "Jön a vihar, Bodrinak be kell terelnie 48 birkát. COUNT, SUM, AVG, MAX és HAVING.",
                  en: "A storm is coming and Bodri has 48 sheep to herd. COUNT, SUM, AVG, MAX and HAVING."
                },
                files: { en: "sql/group-by/round-up.html" },
                progress: { chapters: 9, keys: { en: "round-up-v1" } }
              },
              {
                id: "langos",
                kind: "story",
                minutes: 35,
                title: { hu: "Lángos-rejtély a Balatonon", en: "The Lake Balaton Lángos Mystery" },
                desc: {
                  hu: "A tészta mindennap elfogy, a kasszában mégis kevés a pénz. Egy hét eladásai csoportosítva: GROUP BY egy és két oszlop szerint, COUNT(DISTINCT) és HAVING.",
                  en: "The dough runs out every day, yet the till is short. A week of sales, grouped: GROUP BY on one and two columns, COUNT(DISTINCT) and HAVING."
                },
                files: { en: "sql/group-by/langos.html", hu: "sql/group-by/langos-hu.html" },
                progress: { chapters: 7, keys: { en: "langos-en-v2", hu: "langos-hu-v2" } }
              },
              {
                id: "pasture",
                kind: "demo",
                title: { hu: "Bodri legelője", en: "Bodri's Pasture" },
                desc: {
                  hu: "Kivetítős bemutató: bármilyen GROUP BY lekérdezésnél Bodri karámokba tereli a birkákat.",
                  en: "Projector demo: run any GROUP BY and watch Bodri herd the sheep into pens."
                },
                files: { en: "sql/group-by/pasture.html" }
              }
            ]
          },
          {
            id: "joins",
            title: { hu: "Táblák összekapcsolása: FROM koncertek, zenekarok WHERE koncertek.zenekar_id = zenekarok.id", en: "Joining tables: FROM concerts, bands WHERE concerts.band_id = bands.id" },
            pages: [
              {
                id: "joins-intro",
                kind: "theory",
                minutes: 15,
                title: { hu: "Táblák összekapcsolása – elmélet", en: "Joining tables – explainer" },
                desc: {
                  hu: "Hivatkozások, minden sor minden sorral, a párosítási szabály, három tábla és a kapcsolattípusok.",
                  en: "References, every row with every row, the matching rule, three tables and the kinds of links."
                },
                files: { en: "sql/joins/intro.html", hu: "sql/joins/intro-hu.html" }
              },
              {
                id: "backstage",
                kind: "story",
                minutes: 35,
                title: { hu: "Backstage: az eltűnt gitár", en: "Backstage: The Missing Guitar" },
                desc: {
                  hu: "Fesztiválon vagyunk, és a főzenekar gitárja eltűnt. Három tábla, egy éjszaka – kösd össze őket és találd meg a tettest.",
                  en: "A festival night and the headliner's guitar is gone. Three tables, one night – connect them and find the culprit."
                },
                files: { en: "sql/joins/backstage.html", hu: "sql/joins/backstage-hu.html" },
                progress: { chapters: 9, keys: { en: "backstage-en-v2", hu: "backstage-hu-v2" } }
              },
              {
                id: "pact",
                kind: "story",
                minutes: 35,
                title: { hu: "A megtört szövetség", en: "The Broken Pact" },
                desc: {
                  hu: "1214, a Nagy Tanács éjszakája: királyságok, lovagok és lepecsételt levelek. Valaki az ellenségnek ír. Kapcsold össze a táblákat, és leplezd le az árulót.",
                  en: "1214, the night of the Great Council: kingdoms, knights and sealed letters. Someone is writing to the enemy. Join the tables and unmask the traitor."
                },
                files: { en: "sql/joins/pact.html", hu: "sql/joins/pact-hu.html" },
                progress: { chapters: 9, keys: { en: "pact-en-v2", hu: "pact-hu-v2" } }
              },
              {
                id: "matchmaker",
                kind: "demo",
                title: { hu: "A párosító", en: "The Matchmaker" },
                desc: {
                  hu: "Kivetítős bemutató, kód nélkül: előbb a táblák szerkezete, aztán vonalak kötik össze a sorokat – 1:1, 1:N és N:N.",
                  en: "Projector demo, no code: first the structure of the tables, then wires join the rows – 1:1, 1:N and N:N."
                },
                files: { en: "sql/joins/matchmaker.html", hu: "sql/joins/matchmaker-hu.html" }
              }
            ]
          }
        ]
      },
      {
        id: "web",
        accent: "#7f9cff",
        title: { hu: "Weboldalak – HTML és CSS", en: "Web pages – HTML and CSS" },
        blurb: {
          hu: "Előbb a szerkezet HTML-címkékkel, aztán a kinézet CSS-sel – élő előnézettel, VS Code-szerű szerkesztőben.",
          en: "First the structure with HTML tags, then the looks with CSS – with a live preview in a VS Code-style editor."
        },
        lessons: [
          {
            id: "html",
            title: { hu: "HTML alapok: címkék, elemek, attribútumok", en: "HTML basics: tags, elements, attributes" },
            pages: [
              {
                id: "html-intro",
                kind: "theory",
                minutes: 15,
                title: { hu: "HTML alapok – elmélet", en: "HTML basics – explainer" },
                desc: {
                  hu: "Címkék és attribútumok, az oldal váza, címsorok, listák, linkek, képek és táblázatok. Minden példa szerkeszthető, a végén 6 kérdés.",
                  en: "Tags and attributes, the page skeleton, headings, lists, links, images and tables. Every example is editable; 6 questions at the end."
                },
                files: { en: "html/basics/intro.html", hu: "html/basics/intro-hu.html" }
              },
              {
                id: "shelter",
                kind: "story",
                minutes: 35,
                title: { hu: "A Mancs Menhely honlapja", en: "The Paw Shelter Website" },
                desc: {
                  hu: "Teri néni menhelyének szombatig honlap kell. 8 fejezetben, lépésről lépésre építed fel, a végén letöltheted.",
                  en: "Teri's animal shelter needs a website by Saturday. Build it step by step in 8 chapters, then download it."
                },
                files: { en: "html/basics/shelter.html", hu: "html/basics/shelter-hu.html" },
                progress: { chapters: 8, keys: { en: "shelter-en-v1", hu: "shelter-hu-v1" } }
              },
              {
                id: "editor",
                kind: "tool",
                title: { hu: "HTML-szerkesztő", en: "HTML editor" },
                desc: {
                  hu: "Saját weboldalak írása élő előnézettel: több oldal, saját képek, letöltés .zip-ben. Kiegészítés, Emmet és hibajelzés, mint a VS Code-ban.",
                  en: "Write your own web pages with a live preview: several pages, your own images, download as .zip. Completion, Emmet and mistake hints as in VS Code."
                },
                files: { en: "html/editor.html", hu: "html/editor-hu.html" }
              }
            ]
          },
          {
            id: "basics",
            title: { hu: "CSS: első lépések", en: "CSS: first steps" },
            pages: [
              {
                id: "first-steps",
                kind: "lesson",
                title: { hu: "CSS első lépések", en: "CSS First Steps" },
                desc: {
                  hu: "Lépésről lépésre: színek, betűk, dobozok, és azonnal látod az eredményt.",
                  en: "Step by step: colours, fonts and boxes, with the result shown instantly."
                },
                files: { en: "css/basics/first-steps.html" }
              }
            ]
          }
        ]
      },
      {
        id: "inkscape",
        accent: "#f0a3b8",
        title: { hu: "Vektorgrafika – Inkscape", en: "Vector graphics – Inkscape" },
        blurb: {
          hu: "Alakzatok, kitöltés és körvonal, csomópontok, halmazműveletek és szövegek – plakátok lépésről lépésre, menükkel.",
          en: "Shapes, fill and stroke, nodes, path operations and text – posters step by step, using the menus."
        },
        lessons: [
          {
            id: "path-ops",
            title: { hu: "Halmazműveletek és a csomópont-szerkesztő", en: "Path operations and the Node tool" },
            pages: [
              {
                id: "path-ops-intro",
                kind: "theory",
                minutes: 12,
                title: { hu: "Halmazműveletek – elmélet", en: "Path operations – explainer" },
                desc: {
                  hu: "Alakzat vagy útvonal, Unió, Különbség, Metszet, Kizárás, melyik vág, csomópontok és fogantyúk. Kipróbálható példák és egy rövid kvíz.",
                  en: "Shape or path, Union, Difference, Intersection, Exclusion, which one cuts, nodes and handles. Interactive examples and a short quiz."
                },
                files: { en: "inkscape/path-ops/intro.html", hu: "inkscape/path-ops/intro-hu.html" }
              },
              {
                id: "cheese-moon",
                kind: "story",
                minutes: 35,
                title: { hu: "Irány a Sajthold!", en: "Mission to the Cheese Moon" },
                desc: {
                  hu: "Űrplakát rakétával és kráteres sajtholddal: Unió, Különbség, Metszet és a csomópont-szerkesztő, képregényszerű lépésekben.",
                  en: "A space poster with a rocket and a cratered cheese Moon: Union, Difference, Intersection and the Node tool, in comic-strip steps."
                },
                files: { en: "inkscape/path-ops/cheese-moon.html", hu: "inkscape/path-ops/cheese-moon-hu.html" },
                progress: { chapters: 6, keys: { en: "cheese-moon-v1", hu: "cheese-moon-v1" } }
              },
              {
                id: "haunted-house",
                kind: "story",
                minutes: 35,
                title: { hu: "A kísértetház", en: "The Haunted House" },
                desc: {
                  hu: "Éjszakai plakát világító ablakokkal, szellemmel, ferde fával és kerítéssel: lyukak Különbséggel, fény mögöttük.",
                  en: "A night poster with glowing windows, a ghost, a leaning tree and a fence: holes cut with Difference, light behind them."
                },
                files: { en: "inkscape/path-ops/haunted-house.html", hu: "inkscape/path-ops/haunted-house-hu.html" },
                progress: { chapters: 7, keys: { en: "haunted-house-v1", hu: "haunted-house-v1" } }
              }
            ]
          },
          {
            id: "text",
            title: { hu: "Szövegek és szövegdobozok", en: "Text and text boxes" },
            pages: [
              {
                id: "text-intro",
                kind: "theory",
                minutes: 12,
                title: { hu: "Szövegek – elmélet", en: "Text – explainer" },
                desc: {
                  hu: "Szövegsor vagy szövegdoboz, betű és körvonal, szöveg útvonalon és alakzatban, szövegből útvonal. Kipróbálható példák és egy rövid kvíz.",
                  en: "A line or a text box, font and outline, text on a path and in a shape, text into a path. Interactive examples and a short quiz."
                },
                files: { en: "inkscape/text/intro.html", hu: "inkscape/text/intro-hu.html" }
              },
              {
                id: "slice-shop",
                kind: "story",
                minutes: 35,
                title: { hu: "Pizza Pont", en: "The Slice Shop" },
                desc: {
                  hu: "Pizzéria-szórólap: cím körvonallal, szöveg körben a pizza körül, szövegdoboz, szöveg körbe öntve és kivágott betűk.",
                  en: "A pizza-shop flyer: an outlined title, text round the pizza, a text box, text poured into a circle and cut-out letters."
                },
                files: { en: "inkscape/text/slice-shop.html", hu: "inkscape/text/slice-shop-hu.html" },
                progress: { chapters: 6, keys: { en: "slice-shop-v1", hu: "slice-shop-v1" } }
              },
              {
                id: "band-night",
                kind: "story",
                minutes: 35,
                title: { hu: "Zenei est", en: "Band Night" },
                desc: {
                  hu: "Koncertplakát: betűnként színezett cím, szöveg egy hanghullámon, fellépőlista, szövegbuborék és tüskés betűk a csomópont-szerkesztővel.",
                  en: "A concert poster: a title coloured letter by letter, text on a sound wave, a line-up, a speech bubble and spiky letters with the Node tool."
                },
                files: { en: "inkscape/text/band-night.html", hu: "inkscape/text/band-night-hu.html" },
                progress: { chapters: 6, keys: { en: "band-night-v1", hu: "band-night-v1" } }
              }
            ]
          },
          {
            id: "final",
            title: { hu: "Összefoglaló projekt", en: "Final project" },
            pages: [
              {
                id: "coup",
                kind: "story",
                minutes: 45,
                title: { hu: "Puccs! – a te zászlód", en: "Coup! Design your banner" },
                desc: {
                  hu: "Átveszed a hatalmat egy kitalált puccsban: az ország zászlószínei, a döntéseid és egy csúszka alapján mindenki egyedi zászlót kap – lépésről lépésre, minden eddigi eszközzel.",
                  en: "Take power in a fictional coup: your country's flag colours and your choices give every student a unique banner – guided step by step, with every tool from the year."
                },
                files: { en: "inkscape/final/coup.html", hu: "inkscape/final/coup-hu.html" },
                progress: { chapters: 7, keys: { en: "coup-v1", hu: "coup-hu-v1" } }
              }
            ]
          }
        ]
      }
    ]
  };

  const KIND = {
    story:  { hu: "Küldetés", en: "Mission" },
    demo:   { hu: "Bemutató", en: "Demo" },
    lesson: { hu: "Lecke", en: "Lesson" },
    theory: { hu: "Elmélet", en: "Explainer" },
    tool:   { hu: "Eszköz", en: "Tool" }
  };
  const UI = {
    hu: { btn: "Oldalak", home: "Kezdőlap", close: "Bezárás", here: "itt vagy", min: "perc" },
    en: { btn: "Pages", home: "Home", close: "Close", here: "you are here", min: "min" }
  };

  /* ---------- base URL + language ---------- */
  const me = document.currentScript;
  const BASE = new URL(".", me ? me.src : location.href);
  const url = rel => new URL(rel, BASE).href;
  const norm = p => p.replace(/index\.html$/, "").replace(/\/+$/, "/");
  const herePath = norm(location.pathname);

  const LKEY = "digikult-lang";
  let lang;
  try { lang = localStorage.getItem(LKEY); } catch (e) {}
  if (lang !== "hu" && lang !== "en") lang = "hu";   /* students default to Hungarian */
  const listeners = [];
  const setLang = l => {
    lang = l;
    try { localStorage.setItem(LKEY, l); } catch (e) {}
    listeners.forEach(f => f(l));
  };
  const t = o => (o && (o[lang] || o.en || o.hu)) || "";
  const fileFor = p => p.files[lang] || p.files.en || p.files.hu;
  const isHere = p => Object.values(p.files).some(f => norm(new URL(f, BASE).pathname) === herePath);

  window.DIGIKULT = {
    SITE, KIND, UI, url, t, fileFor, isHere,
    get lang() { return lang; }, setLang, onLang: f => listeners.push(f)
  };

  /* every page wears the site's chalkboard icon in its tab */
  if (!document.querySelector('link[rel~="icon"]')) {
    const ic = document.createElement("link");
    ic.rel = "icon"; ic.type = "image/svg+xml"; ic.href = url("favicon.svg");
    document.head.appendChild(ic);
  }

  /* small modern touches on every page: even line breaks in headings, no lone last words in paragraphs,
     and the phone's browser bar in the colour of the wooden rail */
  if (!document.getElementById("dk-touch")) {
    const st = document.createElement("style"); st.id = "dk-touch";
    st.textContent = "h1,h2,h3,h4{text-wrap:balance}p,li,dd,figcaption,blockquote{text-wrap:pretty}";
    document.head.prepend(st);
  }
  if (!document.querySelector('meta[name="theme-color"]')) {
    const tc = document.createElement("meta"); tc.name = "theme-color"; tc.content = "#8a5532";
    document.head.appendChild(tc);
  }
  /* explainers are long reads: a thin chalk line along the top fills up as you go */
  const herePage = SITE.topics.flatMap(tp => tp.lessons.flatMap(ls => ls.pages)).find(isHere);
  if (herePage && herePage.kind === "theory" && !document.getElementById("dk-read")) {
    const bar = document.createElement("div"); bar.id = "dk-read"; bar.setAttribute("aria-hidden", "true");
    bar.style.cssText = "position:fixed;left:0;top:0;z-index:2147483645;width:100%;height:3px;background:#f2d264;" +
      "transform-origin:0 50%;transform:scaleX(0);pointer-events:none;box-shadow:0 0 6px rgba(242,210,100,.45)";
    let queued = false;
    const paint = () => {
      queued = false;
      const max = document.documentElement.scrollHeight - innerHeight;
      bar.style.transform = `scaleX(${max > 0 ? Math.min(1, Math.max(0, scrollY / max)) : 0})`;
    };
    const soon = () => { if (!queued) { queued = true; requestAnimationFrame(paint); } };
    addEventListener("scroll", soon, { passive: true });
    addEventListener("resize", soon);
    const add = () => { document.body.appendChild(bar); paint(); };
    if (document.body) add(); else document.addEventListener("DOMContentLoaded", add);
  }

  /* offline support: sw.js saves the site in the browser; the first time it's done, say so once */
  if ("serviceWorker" in navigator && (location.protocol === "https:" || location.hostname === "localhost") && !window.__digikultSW) {
    window.__digikultSW = true;
    navigator.serviceWorker.register(url("sw.js")).catch(() => {});
    navigator.serviceWorker.addEventListener("message", e => {
      if (!e.data || e.data.type !== "digikult-offline-ready") return;
      const en = (document.documentElement.lang || lang) === "en";
      const n = document.createElement("div");
      n.setAttribute("role", "status");
      n.textContent = en ? "Saved: the lessons and the editor now work without internet too." : "Elmentve: a tananyag és a szerkesztő mostantól internet nélkül is működik.";
      n.style.cssText = "position:fixed;left:50%;bottom:20px;transform:translate(-50%,8px);z-index:2147483646;max-width:calc(100vw - 32px);box-sizing:border-box;" +
        "padding:10px 16px;border-radius:4px;background:#fdf8ec;color:#1c2f28;font:15px/1.4 'Atkinson Hyperlegible',system-ui,sans-serif;" +
        "box-shadow:0 8px 24px rgba(0,0,0,.35);opacity:0;transition:opacity .3s,transform .3s";
      document.body.appendChild(n);
      requestAnimationFrame(() => { n.style.opacity = "1"; n.style.transform = "translate(-50%,0)"; });
      setTimeout(() => { n.style.opacity = "0"; setTimeout(() => n.remove(), 400); }, 6000);
    });
  }

  /* The landing page draws its own full map; no floating menu there. */
  if (document.documentElement.hasAttribute("data-digikult-home")) return;
  if (window.__digikultNav) return;
  window.__digikultNav = true;

  /* On a page that exists in both languages, the menu speaks the page's language. */
  SITE.topics.forEach(tp => tp.lessons.forEach(ls => ls.pages.forEach(p => {
    if (!p.files.hu || !p.files.en) return;
    for (const k of ["hu", "en"]) if (norm(new URL(p.files[k], BASE).pathname) === herePath) lang = k;
  })));

  /* ---------- floating menu ---------- */
  const host = document.createElement("div");
  host.id = "digikult-nav";
  const root = host.attachShadow({ mode: "open" });
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

  const style = `
  :host { all: initial; }
  * { box-sizing: border-box; font-feature-settings: "calt" 0, "liga" 0; }
  .wrap { position: fixed; left: max(12px, env(safe-area-inset-left)); bottom: max(12px, env(safe-area-inset-bottom));
    z-index: 2147483000; font: 400 14px/1.3 "Atkinson Hyperlegible", "Segoe UI", system-ui, sans-serif; color: #eef3f1; }
  button { font: inherit; color: inherit; cursor: pointer; }
  .toggle { display: inline-flex; align-items: center; gap: 8px; padding: 9px 14px 9px 12px; border-radius: 6px;
    background: rgba(26,42,36,.95); border: 1px solid rgba(255,255,255,.22); border-bottom: 3px solid #8a5532; font-weight: 700;
    box-shadow: 0 6px 18px rgba(0,0,0,.35); backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px); transition: transform .15s, background .15s; }
  .toggle:hover { background: rgba(36,58,49,.98); }
  /* a round icon that hides as little of the page as possible; the label slides out on hover or focus */
  .lbl { display: inline-block; max-width: 8em; overflow: hidden; white-space: nowrap; transition: max-width .2s, opacity .2s; }
  .wrap.mini .toggle { gap: 0; padding: 12px; }
  .wrap.mini .lbl { max-width: 0; opacity: 0; }
  .wrap.mini .toggle:hover, .wrap.mini .toggle:focus-visible, .wrap.mini .toggle[aria-expanded="true"] { gap: 8px; padding: 9px 14px 9px 12px; }
  .wrap.mini .toggle:hover .lbl, .wrap.mini .toggle:focus-visible .lbl, .wrap.mini .toggle[aria-expanded="true"] .lbl { max-width: 8em; opacity: 1; }
  :focus-visible { outline: 3px solid #f2d264; outline-offset: 2px; border-radius: 4px; }
  .bars { width: 16px; height: 12px; display: grid; align-content: space-between; }
  .bars i { display: block; height: 2px; border-radius: 2px; background: currentColor; }
  .panel { position: absolute; left: 0; bottom: calc(100% + 10px); width: min(360px, calc(100vw - 24px));
    max-height: min(72vh, 620px); overflow: auto; overscroll-behavior: contain;
    background: #22362f; border: 1px solid rgba(255,255,255,.14); border-radius: 6px;
    box-shadow: 0 0 0 6px #8a5532, 0 18px 40px rgba(0,0,0,.45); padding: 8px; animation: pop .16s ease-out; }
  .panel[hidden] { display: none; }
  @keyframes pop { from { opacity: 0; transform: translateY(6px) scale(.97); } to { opacity: 1; transform: none; } }
  .head { display: flex; align-items: center; gap: 8px; padding: 4px 4px 8px 6px; position: sticky; top: -8px;
    background: #22362f; margin: -8px -8px 0; padding: 12px 12px 10px 14px; border-bottom: 2px dashed rgba(239,238,230,.16); }
  .home { flex: 1; color: #eef3f1; text-decoration: none; font: 700 19px/1.1 "Kalam", "Atkinson Hyperlegible", system-ui, sans-serif; }
  .home:hover { color: #fff; text-decoration: underline; text-decoration-color: #f2d264; text-decoration-thickness: 2px; text-underline-offset: 4px; }
  .lang { display: inline-flex; align-items: center; }
  .lang button { background: none; border: 0; padding: 4px 6px; font-size: 13px; font-weight: 700; color: #b4c4b8; }
  .lang button + button { border-left: 1.5px solid rgba(239,238,230,.25); }
  .lang button:hover { color: #fff; }
  .lang button[aria-pressed="true"] { color: #eef3f1; text-decoration: underline; text-decoration-color: #f2d264; text-decoration-thickness: 3px; text-underline-offset: 4px; }
  .x { background: none; border: 0; color: #b4c4b8; font-size: 22px; line-height: 1; padding: 2px 6px; border-radius: 4px; }
  .x:hover { color: #fff; }
  .topic { margin-top: 10px; }
  .topic h3 { margin: 0; padding: 8px 8px 2px; font: 700 20px/1.2 "Kalam", "Atkinson Hyperlegible", system-ui, sans-serif; color: var(--a); }
  .lesson { padding: 6px 8px 2px 16px; font-size: 13px; color: #b4c4b8; }
  ul { list-style: none; margin: 0; padding: 0 0 0 16px; display: grid; gap: 1px; }
  a.pg { display: grid; grid-template-columns: 1fr auto; gap: 2px 10px; align-items: baseline;
    padding: 7px 10px; border-radius: 4px; color: #eef3f1; text-decoration: none; }
  a.pg:hover { background: rgba(255,255,255,.08); }
  .tt { font-weight: 700; }
  .kd { font-size: 12px; color: #b4c4b8; white-space: nowrap; }
  .hr { grid-column: 1 / -1; font: 700 15px/1.1 "Kalam", "Atkinson Hyperlegible", system-ui, sans-serif; color: #f2d264; }
  a.pg[aria-current="page"] { background: rgba(242,210,100,.14); box-shadow: inset 3px 0 0 #f2d264; }
  /* while someone types in an editor, the button steps back so it doesn't sit on their code */
  .wrap.typing .toggle { opacity: .28; }
  .wrap.typing .toggle:hover, .wrap.typing .toggle:focus-visible { opacity: 1; }
  .toggle { transition: transform .15s, background .15s, opacity .2s; }
  @media (prefers-reduced-motion: reduce) { .panel { animation: none; } .toggle, .lbl { transition: none; } }
  @media print { .wrap { display: none; } }`;

  function render() {
    const u = UI[lang];
    const topics = SITE.topics.map(tp => `
      <section class="topic" style="--a:${tp.accent}">
        <h3>${esc(t(tp.title))}</h3>
        ${tp.lessons.map(ls => `
          <div class="lesson">${esc(t(ls.title).split(": ")[0])}</div>
          <ul>${ls.pages.map(p => {
            const cur = isHere(p);
            return `<li><a class="pg" href="${url(fileFor(p))}"${cur ? ' aria-current="page"' : ""}>
              <span class="tt">${esc(t(p.title))}</span><span class="kd">${esc(t(KIND[p.kind]))}</span>
              ${cur ? `<span class="hr">${u.here}</span>` : ""}</a></li>`;
          }).join("")}</ul>`).join("")}
      </section>`).join("");
    const open = root.querySelector(".panel") && !root.querySelector(".panel").hidden;
    root.innerHTML = `<style>${style}</style>
    <nav class="wrap mini" aria-label="${u.btn}">
      <div class="panel" id="p"${open ? "" : " hidden"}>
        <div class="head">
          <a class="home" href="${url("./")}">← ${u.home}</a>
          <span class="lang" role="group" aria-label="Language">
            <button type="button" data-l="hu" aria-pressed="${lang === "hu"}">HU</button><button type="button" data-l="en" aria-pressed="${lang === "en"}">EN</button>
          </span>
          <button class="x" type="button" aria-label="${u.close}">×</button>
        </div>
        ${topics}
      </div>
      <button class="toggle" type="button" aria-expanded="${open}" aria-controls="p"><span class="bars" aria-hidden="true"><i></i><i></i><i></i></span><span class="lbl">${u.btn}</span></button>
    </nav>`;
    wire();
  }

  function setOpen(open) {
    const panel = root.querySelector(".panel"), btn = root.querySelector(".toggle");
    panel.hidden = !open;
    btn.setAttribute("aria-expanded", String(open));
    if (open) (root.querySelector('a[aria-current="page"]') || root.querySelector("a.pg")).focus();
  }
  function wire() {
    root.querySelector(".toggle").addEventListener("click", () => setOpen(root.querySelector(".panel").hidden));
    root.querySelector(".x").addEventListener("click", () => { setOpen(false); root.querySelector(".toggle").focus(); });
    root.querySelectorAll(".lang button").forEach(b => b.addEventListener("click", () => setLang(b.dataset.l)));
  }
  root.addEventListener("keydown", e => { if (e.key === "Escape") { setOpen(false); root.querySelector(".toggle").focus(); } });
  document.addEventListener("click", e => { if (!e.composedPath().includes(host)) setOpen(false); });
  listeners.push(render);
  const typingIn = el => !!el && (el.tagName === "TEXTAREA" || el.isContentEditable || (el.tagName === "INPUT" && /^(text|search|)$/.test(el.type)));
  const markTyping = () => { const w = root.querySelector(".wrap"); if (w) w.classList.toggle("typing", typingIn(document.activeElement)); };
  document.addEventListener("focusin", markTyping);
  document.addEventListener("focusout", () => setTimeout(markTyping, 0));
  document.addEventListener("pointerdown", () => setTimeout(markTyping, 0), true);

  /* the menu writes in the site's two faces even on a mission page that brings its own fonts */
  if (![...document.querySelectorAll('link[href*="fonts.googleapis.com"]')].some(l => /Kalam/.test(l.href) && /Atkinson/.test(l.href))) {
    const fl = document.createElement("link");
    fl.rel = "stylesheet";
    fl.href = "https://fonts.googleapis.com/css2?family=Kalam:wght@700&family=Atkinson+Hyperlegible:wght@400;700&display=swap";
    document.head.appendChild(fl);
  }
  render();
  const mount = () => document.body.appendChild(host);
  if (document.body) mount(); else document.addEventListener("DOMContentLoaded", mount);
})();
