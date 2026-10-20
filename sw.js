/* digikult offline support.
   On the first visit the browser quietly saves every page, script, style and drawing, plus the fonts and the
   SQL engine, so lessons and the editor keep working without internet. A mission's screenshots are saved the
   first time that mission is opened. Online, pages always come fresh from the network; files with ?v= tags
   (which never change under the same tag) come straight from the saved copy.
   The file list below is written by tools/build-sw.py: run it before pushing. */

/* FILES:BEGIN (written by tools/build-sw.py, don't edit by hand) */
const VERSION = "94ba2d179c";
const CORE = [
"./",
"css/basics/first-steps.html",
"css/index.html",
"favicon.svg",
"heist-hu.html",
"heist.html",
"html/basics/img/bodri.svg",
"html/basics/img/cirmi.svg",
"html/basics/img/logo.svg",
"html/basics/img/morzsa.svg",
"html/basics/img/pamacs.svg",
"html/basics/intro-hu.html",
"html/basics/intro.html",
"html/basics/shelter-hu.html",
"html/basics/shelter.html",
"html/checks.js",
"html/editor-hu.html",
"html/editor.html",
"html/index.html",
"html/style-picker.css",
"html/style-picker.js",
"index.html",
"inkscape/explainer.css",
"inkscape/explainer.js",
"inkscape/final/coup-hu.html",
"inkscape/final/coup-hu.js",
"inkscape/final/coup.css",
"inkscape/final/coup.html",
"inkscape/final/coup.js",
"inkscape/img/common/hu/inkscape-map.png",
"inkscape/img/common/hu/tools.png",
"inkscape/img/common/inkscape-map.png",
"inkscape/img/common/rules.png",
"inkscape/img/common/tools.png",
"inkscape/img/common/tools/al-bottom.png",
"inkscape/img/common/tools/al-ch.png",
"inkscape/img/common/tools/al-cv.png",
"inkscape/img/common/tools/al-left.png",
"inkscape/img/common/tools/al-right.png",
"inkscape/img/common/tools/al-top.png",
"inkscape/img/common/tools/di-ch.png",
"inkscape/img/common/tools/ellipse.png",
"inkscape/img/common/tools/node.png",
"inkscape/img/common/tools/pen.png",
"inkscape/img/common/tools/rect.png",
"inkscape/img/common/tools/selector.png",
"inkscape/img/common/tools/star.png",
"inkscape/img/common/tools/text.png",
"inkscape/index.html",
"inkscape/mission.css",
"inkscape/mission.js",
"inkscape/path-ops/cheese-moon-hu.html",
"inkscape/path-ops/cheese-moon.html",
"inkscape/path-ops/haunted-house-hu.html",
"inkscape/path-ops/haunted-house.html",
"inkscape/path-ops/intro-hu.html",
"inkscape/path-ops/intro.html",
"inkscape/text/band-night-hu.html",
"inkscape/text/band-night.html",
"inkscape/text/intro-hu.html",
"inkscape/text/intro.html",
"inkscape/text/slice-shop-hu.html",
"inkscape/text/slice-shop.html",
"nav.js",
"pasture.html",
"round-up.html",
"sql/group-by/intro-hu.html",
"sql/group-by/intro.html",
"sql/group-by/langos-hu.html",
"sql/group-by/langos.html",
"sql/group-by/pasture.html",
"sql/group-by/round-up.html",
"sql/index.html",
"sql/joins/backstage-hu.html",
"sql/joins/backstage.html",
"sql/joins/intro-hu.html",
"sql/joins/intro.html",
"sql/joins/matchmaker-classic-hu.html",
"sql/joins/matchmaker-classic.html",
"sql/joins/matchmaker-hu.html",
"sql/joins/matchmaker.html",
"sql/joins/pact-hu.html",
"sql/joins/pact.html",
"sql/where/heist-hu.html",
"sql/where/heist.html",
"sql/where/intro-hu.html",
"sql/where/intro.html",
"vendor/codemirror-html.js"
];
const EXTERNAL = [
"https://cdn.jsdelivr.net/npm/sql.js@1.10.3/dist/sql-asm.js",
"https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js",
"https://fonts.googleapis.com/css2?family=Bree+Serif&family=Atkinson+Hyperlegible:ital,wght@0,400;0,700;1,400&family=JetBrains+Mono:wght@400;600&display=swap",
"https://fonts.googleapis.com/css2?family=Bree+Serif&family=Cabin+Sketch:wght@700&family=Kalam:wght@400;700&family=Atkinson+Hyperlegible:ital,wght@0,400;0,700;1,400&family=JetBrains+Mono:wght@400;600&display=swap",
"https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,600..800&family=Atkinson+Hyperlegible:ital,wght@0,400;0,700;1,400&family=JetBrains+Mono:wght@400;600&display=swap",
"https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,600..800&family=Atkinson+Hyperlegible:ital,wght@0,400;0,700;1,400&family=JetBrains+Mono:wght@400;600;700&display=swap",
"https://fonts.googleapis.com/css2?family=Cinzel:wght@600;700;800&family=Atkinson+Hyperlegible:ital,wght@0,400;0,700;1,400&family=JetBrains+Mono:wght@400;600&display=swap",
"https://fonts.googleapis.com/css2?family=Fredoka:wght@500;600&family=Kalam:wght@700&family=Atkinson+Hyperlegible:ital,wght@0,400;0,700;1,400&family=JetBrains+Mono:wght@400;600&display=swap",
"https://fonts.googleapis.com/css2?family=Fredoka:wght@500;600;700&family=Atkinson+Hyperlegible:ital,wght@0,400;0,700;1,400&family=JetBrains+Mono:wght@400;600&display=swap",
"https://fonts.googleapis.com/css2?family=Kalam:wght@400;700&family=Atkinson+Hyperlegible:ital,wght@0,400;0,700;1,400&display=swap",
"https://fonts.googleapis.com/css2?family=Kalam:wght@400;700&family=Atkinson+Hyperlegible:ital,wght@0,400;0,700;1,400&family=JetBrains+Mono:wght@400;500&display=swap",
"https://fonts.googleapis.com/css2?family=Kalam:wght@400;700&family=Atkinson+Hyperlegible:ital,wght@0,400;0,700;1,400&family=JetBrains+Mono:wght@400;600;700&display=swap",
"https://fonts.googleapis.com/css2?family=Kalam:wght@700&family=Atkinson+Hyperlegible:wght@400;700&display=swap",
"https://fonts.googleapis.com/css2?family=Kalam:wght@700&family=Atkinson+Hyperlegible:wght@400;700&family=JetBrains+Mono:wght@400;600&display=swap",
"https://fonts.googleapis.com/css2?family=Young+Serif&family=Kalam:wght@400;700&family=Atkinson+Hyperlegible:ital,wght@0,400;0,700;1,400&family=JetBrains+Mono:wght@400;600&display=swap"
];
const PAGE_IMAGES = {
"inkscape/path-ops/cheese-moon-hu.html": [
"inkscape/img/cheese-moon/hu/bonus.png",
"inkscape/img/cheese-moon/hu/poster.png",
"inkscape/img/cheese-moon/hu/save.png",
"inkscape/img/cheese-moon/hu/step1.png",
"inkscape/img/cheese-moon/hu/step2.png",
"inkscape/img/cheese-moon/hu/step3.png",
"inkscape/img/cheese-moon/hu/step4.png",
"inkscape/img/cheese-moon/hu/step5.png",
"inkscape/img/cheese-moon/hu/step6.png"
],
"inkscape/path-ops/cheese-moon.html": [
"inkscape/img/cheese-moon/bonus.png",
"inkscape/img/cheese-moon/poster.png",
"inkscape/img/cheese-moon/save.png",
"inkscape/img/cheese-moon/step1.png",
"inkscape/img/cheese-moon/step2.png",
"inkscape/img/cheese-moon/step3.png",
"inkscape/img/cheese-moon/step4.png",
"inkscape/img/cheese-moon/step5.png",
"inkscape/img/cheese-moon/step6.png"
],
"inkscape/path-ops/haunted-house-hu.html": [
"inkscape/img/haunted-house/hu/bonus.png",
"inkscape/img/haunted-house/hu/poster.png",
"inkscape/img/haunted-house/hu/save.png",
"inkscape/img/haunted-house/hu/step1.png",
"inkscape/img/haunted-house/hu/step2.png",
"inkscape/img/haunted-house/hu/step3.png",
"inkscape/img/haunted-house/hu/step4.png",
"inkscape/img/haunted-house/hu/step5.png",
"inkscape/img/haunted-house/hu/step6.png",
"inkscape/img/haunted-house/hu/step7.png"
],
"inkscape/path-ops/haunted-house.html": [
"inkscape/img/haunted-house/bonus.png",
"inkscape/img/haunted-house/poster.png",
"inkscape/img/haunted-house/save.png",
"inkscape/img/haunted-house/step1.png",
"inkscape/img/haunted-house/step2.png",
"inkscape/img/haunted-house/step3.png",
"inkscape/img/haunted-house/step4.png",
"inkscape/img/haunted-house/step5.png",
"inkscape/img/haunted-house/step6.png",
"inkscape/img/haunted-house/step7.png"
],
"inkscape/text/band-night-hu.html": [
"inkscape/img/band-night/hu/bonus.png",
"inkscape/img/band-night/hu/poster.png",
"inkscape/img/band-night/hu/save.png",
"inkscape/img/band-night/hu/step1.png",
"inkscape/img/band-night/hu/step2.png",
"inkscape/img/band-night/hu/step3.png",
"inkscape/img/band-night/hu/step4.png",
"inkscape/img/band-night/hu/step5.png",
"inkscape/img/band-night/hu/step6.png"
],
"inkscape/text/band-night.html": [
"inkscape/img/band-night/bonus.png",
"inkscape/img/band-night/poster.png",
"inkscape/img/band-night/save.png",
"inkscape/img/band-night/step1.png",
"inkscape/img/band-night/step2.png",
"inkscape/img/band-night/step3.png",
"inkscape/img/band-night/step4.png",
"inkscape/img/band-night/step5.png",
"inkscape/img/band-night/step6.png"
],
"inkscape/text/slice-shop-hu.html": [
"inkscape/img/slice-shop/hu/bonus.png",
"inkscape/img/slice-shop/hu/poster.png",
"inkscape/img/slice-shop/hu/save.png",
"inkscape/img/slice-shop/hu/step1.png",
"inkscape/img/slice-shop/hu/step2.png",
"inkscape/img/slice-shop/hu/step3.png",
"inkscape/img/slice-shop/hu/step4.png",
"inkscape/img/slice-shop/hu/step5.png",
"inkscape/img/slice-shop/hu/step6.png"
],
"inkscape/text/slice-shop.html": [
"inkscape/img/slice-shop/bonus.png",
"inkscape/img/slice-shop/poster.png",
"inkscape/img/slice-shop/save.png",
"inkscape/img/slice-shop/step1.png",
"inkscape/img/slice-shop/step2.png",
"inkscape/img/slice-shop/step3.png",
"inkscape/img/slice-shop/step4.png",
"inkscape/img/slice-shop/step5.png",
"inkscape/img/slice-shop/step6.png"
]
};
/* FILES:END */

const CACHE = "digikult-" + VERSION;
const EXTERNAL_HOSTS = ["fonts.googleapis.com", "fonts.gstatic.com", "cdn.jsdelivr.net", "cdnjs.cloudflare.com"];
const here = new URL("./", self.location).href;
const abs = p => new URL(p, here).href;

async function put(cache, url, init){
  try {
    const res = await fetch(url, init);
    if (res.ok || res.type === "opaque") { await cache.put(url, res.clone()); return res; }
  } catch (e) {}
  return null;
}
/* a Google Fonts stylesheet points at the font files themselves: save those too */
async function putFontCss(cache, url){
  const res = await put(cache, url, { mode: "cors" });
  if (!res) return;
  const css = await res.text();
  await Promise.all([...css.matchAll(/url\((https:\/\/fonts\.gstatic\.com\/[^)]+)\)/g)].map(m => put(cache, m[1], { mode: "cors" })));
}

self.addEventListener("install", e => {
  e.waitUntil((async () => {
    const cache = await caches.open(CACHE);
    /* one at a time in small batches, so a classroom of laptops doesn't flood the Wi-Fi; a missing file never blocks the rest */
    const jobs = [...CORE.map(p => () => put(cache, abs(p), { cache: "reload" })),
                  ...EXTERNAL.map(u => () => u.includes("fonts.googleapis.com") ? putFontCss(cache, u) : put(cache, u, { mode: "cors" }))];
    for (let i = 0; i < jobs.length; i += 6) await Promise.all(jobs.slice(i, i + 6).map(j => j()));
    self.skipWaiting();
  })());
});

self.addEventListener("activate", e => {
  e.waitUntil((async () => {
    const keys = await caches.keys(), old = keys.filter(k => k.startsWith("digikult-") && k !== CACHE), first = !old.length;
    /* keep screenshots and worksheets already saved under the previous version */
    if (old.length) {
      const cache = await caches.open(CACHE);
      for (const k of old) {
        const prev = await caches.open(k);
        for (const req of await prev.keys()) if (/\.(png|pdf)$/i.test(new URL(req.url).pathname) && !(await cache.match(req))) await cache.put(req, await prev.match(req));
        await caches.delete(k);
      }
    }
    await self.clients.claim();
    if (first) (await self.clients.matchAll({ type: "window" })).forEach(c => c.postMessage({ type: "digikult-offline-ready" }));
  })());
});

const timeout = (p, ms) => Promise.race([p, new Promise((_, no) => setTimeout(() => no(new Error("slow")), ms))]);
async function fromCache(req){
  const cache = await caches.open(CACHE);
  return (await cache.match(req)) || (await cache.match(req, { ignoreSearch: true })) ||
         (await caches.match(req)) || (await caches.match(req, { ignoreSearch: true }));
}
/* pages: fresh from the network when it answers within a few seconds, else the saved copy */
async function networkFirst(req, page){
  const cache = await caches.open(CACHE);
  try {
    /* "no-cache" asks the server whether the page changed (a tiny 304 when it didn't), instead of taking the
       browser's own copy, which GitHub Pages lets it keep for 10 minutes; a just-pushed update shows at once */
    const res = await timeout(fetch(req.url, { cache: "no-cache", credentials: "same-origin" }), 4000);
    if (res.ok) {
      cache.put(req, res.clone());
      if (page) saveImagesFor(new URL(req.url));
      return res;
    }
    return (await fromCache(req)) || res;
  } catch (e) {
    const hit = await fromCache(req);
    if (hit) return hit;
    if (page) return offlinePage();
    throw e;
  }
}
async function cacheFirst(req){
  const hit = await fromCache(req);
  if (hit) return hit;
  const res = await fetch(req);
  if (res.ok || res.type === "opaque") (await caches.open(CACHE)).put(req, res.clone());
  return res;
}
/* the first time a mission page is opened, its screenshots are saved for later */
async function saveImagesFor(url){
  let path = decodeURIComponent(url.pathname.slice(new URL(here).pathname.length)) || "index.html";
  const list = PAGE_IMAGES[path];
  if (!list) return;
  const cache = await caches.open(CACHE);
  for (const p of list) if (!(await cache.match(abs(p)))) await put(cache, abs(p));
}
function offlinePage(){
  const html = `<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Offline</title>
<style>body{margin:0;min-height:100vh;display:grid;place-items:center;background:#1c2f28;color:#e9efe9;font:17px/1.5 system-ui,sans-serif;padding:24px;box-sizing:border-box}
main{max-width:34em}h1{font-size:1.4em;margin:0 0 .4em}a{color:#ffd84d}</style>
<main><h1>Nincs internet</h1><p>Ezt az oldalt még nem nyitottad meg, ezért nincs elmentve. A már megnyitott oldalak internet nélkül is működnek.</p>
<p lang="en">No internet. You haven't opened this page before, so it isn't saved yet. Pages you've already opened work offline.</p>
<p><a href="${here}">Digitális kultúra – kezdőlap / home</a></p></main>`;
  return new Response(html, { status: 503, headers: { "Content-Type": "text/html; charset=utf-8" } });
}

self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin === self.location.origin) {
    if (!url.href.startsWith(here)) return;
    const page = req.mode === "navigate" || /(\.html|\/)$/.test(url.pathname);
    if (page) e.respondWith(networkFirst(req, true));
    else if (/[?&]v=/.test(url.search)) e.respondWith(cacheFirst(req));
    else e.respondWith(networkFirst(req, false));
  } else if (EXTERNAL_HOSTS.includes(url.host)) {
    e.respondWith(cacheFirst(req));
  }
});
