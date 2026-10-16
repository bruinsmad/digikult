/* digikult page navigator
   Every page includes:  <script src="nav.js" defer></script>
   To add a new page, add one line to PAGES below. */
(function () {
  const PAGES = [
    { file: "index.html",    title: "CSS First Steps",          tag: "CSS",      lang: "en" },
    { file: "heist.html",    title: "The Midnight Paprika Heist", tag: "SQL · WHERE", lang: "en" },
    { file: "heist-hu.html", title: "Az Éjféli Paprika-rablás",  tag: "SQL · WHERE", lang: "hu" },
    { file: "round-up.html", title: "Bodri's Round-Up",          tag: "SQL · GROUP BY", lang: "en" },
    { file: "pasture.html",  title: "Bodri's Pasture",           tag: "GROUP BY demo", lang: "en" }
  ];

  if (window.__digikultNav) return;
  window.__digikultNav = true;

  const here = (location.pathname.split("/").pop() || "index.html").toLowerCase();
  const hu = (document.documentElement.lang || "").toLowerCase().startsWith("hu");
  const T = hu
    ? { btn: "Oldalak", head: "Minden oldal", here: "itt vagy", close: "Bezárás" }
    : { btn: "Pages", head: "All pages", here: "you are here", close: "Close" };

  const host = document.createElement("div");
  host.id = "digikult-nav";
  const root = host.attachShadow({ mode: "open" });

  root.innerHTML = `
<style>
  :host { all: initial; }
  * { box-sizing: border-box; font-feature-settings: "calt" 0, "liga" 0; }
  .wrap {
    position: fixed; left: max(12px, env(safe-area-inset-left)); bottom: max(12px, env(safe-area-inset-bottom));
    z-index: 2147483000;
    font: 500 14px/1.3 "Segoe UI", system-ui, -apple-system, sans-serif; color: #eef3f1;
  }
  button.toggle {
    display: inline-flex; align-items: center; gap: 8px;
    padding: 9px 14px 9px 12px; border-radius: 999px; cursor: pointer;
    background: rgba(18, 26, 38, .88); color: inherit; font: inherit; font-weight: 600;
    border: 1px solid rgba(255,255,255,.22);
    box-shadow: 0 6px 18px rgba(0,0,0,.35);
    backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px);
    transition: transform .15s, background .15s;
  }
  button.toggle:hover { background: rgba(30, 42, 60, .95); transform: translateY(-1px); }
  button.toggle:focus-visible, a:focus-visible, button.x:focus-visible { outline: 3px solid #e7b84a; outline-offset: 2px; }
  .bars { width: 16px; height: 12px; display: grid; align-content: space-between; }
  .bars i { display: block; height: 2px; border-radius: 2px; background: currentColor; }
  .panel {
    position: absolute; left: 0; bottom: calc(100% + 10px);
    width: min(320px, calc(100vw - 24px));
    background: rgba(16, 23, 34, .97); border: 1px solid rgba(255,255,255,.18); border-radius: 14px;
    box-shadow: 0 18px 40px rgba(0,0,0,.45);
    padding: 8px; transform-origin: bottom left;
    animation: pop .16s ease-out;
  }
  .panel[hidden] { display: none; }
  @keyframes pop { from { opacity: 0; transform: translateY(6px) scale(.97); } to { opacity: 1; transform: none; } }
  .head { display: flex; align-items: center; justify-content: space-between; padding: 6px 8px 8px; }
  .head span { font-size: 11px; letter-spacing: .12em; text-transform: uppercase; color: #a8b8b4; }
  button.x { background: none; border: 0; color: #a8b8b4; font-size: 18px; line-height: 1; cursor: pointer; padding: 2px 6px; border-radius: 6px; }
  button.x:hover { color: #fff; }
  ul { list-style: none; margin: 0; padding: 0; display: grid; gap: 2px; }
  a {
    display: grid; grid-template-columns: 1fr auto; gap: 2px 10px; align-items: baseline;
    padding: 9px 10px; border-radius: 9px; color: #eef3f1; text-decoration: none;
  }
  a:hover { background: rgba(255,255,255,.08); }
  a .t { font-weight: 600; }
  a .g { font-size: 11px; color: #a8b8b4; white-space: nowrap; }
  a .h { grid-column: 1 / -1; font-size: 11px; color: #e7b84a; }
  a[aria-current="page"] { background: rgba(231,184,74,.14); box-shadow: inset 3px 0 0 #e7b84a; }
  @media (prefers-reduced-motion: reduce) { .panel { animation: none; } button.toggle { transition: none; } }
  @media print { .wrap { display: none; } }
</style>
<nav class="wrap" aria-label="${T.head}">
  <div class="panel" id="p" hidden>
    <div class="head"><span>${T.head}</span><button class="x" type="button" aria-label="${T.close}">×</button></div>
    <ul>${PAGES.map(p => {
      const cur = p.file.toLowerCase() === here;
      return `<li><a href="${p.file}" lang="${p.lang}"${cur ? ' aria-current="page"' : ""}>
        <span class="t">${p.title}</span><span class="g">${p.tag}</span>${cur ? `<span class="h">● ${T.here}</span>` : ""}</a></li>`;
    }).join("")}</ul>
  </div>
  <button class="toggle" type="button" aria-expanded="false" aria-controls="p"><span class="bars" aria-hidden="true"><i></i><i></i><i></i></span>${T.btn}</button>
</nav>`;

  const btn = root.querySelector(".toggle");
  const panel = root.querySelector(".panel");
  const set = open => {
    panel.hidden = !open;
    btn.setAttribute("aria-expanded", String(open));
    if (open) (root.querySelector('a[aria-current="page"]') || root.querySelector("a")).focus();
  };
  btn.addEventListener("click", () => set(panel.hidden));
  root.querySelector(".x").addEventListener("click", () => { set(false); btn.focus(); });
  root.addEventListener("keydown", e => { if (e.key === "Escape") { set(false); btn.focus(); } });
  document.addEventListener("click", e => { if (!e.composedPath().includes(host)) set(false); });

  const mount = () => document.body.appendChild(host);
  if (document.body) mount(); else document.addEventListener("DOMContentLoaded", mount);
})();
