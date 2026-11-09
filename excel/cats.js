/* digikult — the dancing cats from the SQL heist finale, as a reward on the last page of the Excel missions.
   DancingCats.mount(host, { sound: () => true/false, burst: (x, y, n) => {} })  */
(function () {
  "use strict";
  const CSS = `/* dancing cats: each cat gets its own dance, fur pattern, accessory and name */
.disco-wrap{position:absolute;inset:0;overflow:hidden;pointer-events:none;z-index:0;border-radius:inherit}
.disco-lights{position:absolute;inset:-60%;opacity:.6;mix-blend-mode:screen;background:
  radial-gradient(circle at 30% 35%, rgba(255,77,109,.55) 0 1.2%, transparent 1.6%),
  radial-gradient(circle at 62% 28%, rgba(77,141,255,.55) 0 1.2%, transparent 1.6%),
  radial-gradient(circle at 45% 62%, rgba(245,197,66,.55) 0 1.2%, transparent 1.6%),
  radial-gradient(circle at 70% 58%, rgba(47,211,154,.55) 0 1.2%, transparent 1.6%),
  radial-gradient(circle at 38% 48%, rgba(255,255,255,.45) 0 .8%, transparent 1.2%),
  radial-gradient(circle at 56% 44%, rgba(255,255,255,.45) 0 .8%, transparent 1.2%),
  radial-gradient(circle at 52% 70%, rgba(255,77,109,.5) 0 1%, transparent 1.4%),
  radial-gradient(circle at 34% 72%, rgba(77,141,255,.5) 0 1%, transparent 1.4%)}
.discoball{position:absolute;top:0;left:15%;width:76px;height:126px;margin-left:-38px}
.discoball::before{content:"";position:absolute;left:37px;top:0;width:2px;height:52px;background:#cfd6dc}
.discoball .ball{position:absolute;left:6px;top:50px;width:64px;height:64px;border-radius:50%;
  background:radial-gradient(circle at 32% 30%, rgba(255,255,255,.95) 0 8%, transparent 22%),
    repeating-linear-gradient(0deg, rgba(0,0,0,.35) 0 1px, transparent 1px 8px),
    repeating-linear-gradient(90deg, #eef2f5 0 7px, #8d99a5 7px 8px, #c9d1d8 8px 15px, #6f7b87 15px 16px);
  box-shadow:0 0 26px rgba(255,255,255,.55), inset -10px -12px 18px rgba(0,0,0,.45)}
.catline{position:relative;z-index:1;display:flex;flex-wrap:wrap;justify-content:center;align-items:flex-end;gap:6px 12px;padding:0 10px;border-radius:12px}
.catline.floor{padding:8px 14px 10px;background:
  linear-gradient(to bottom, rgba(5,8,10,.55), transparent 45%),
  repeating-conic-gradient(rgba(255,77,109,.30) 0 25%, rgba(77,141,255,.30) 0 50%) 0 0/34px 34px;
  box-shadow:inset 0 0 26px rgba(245,197,66,.25)}
.cat{position:relative;width:96px;flex:none;cursor:pointer;-webkit-tap-highlight-color:transparent;
  filter:drop-shadow(0 0 1.5px rgba(255,255,255,.55)) drop-shadow(0 8px 10px rgba(0,0,0,.5))}
.cat svg{display:block;width:100%;height:auto;overflow:visible}
.cat-name{display:block;margin-top:1px;font:700 14px/1.1 "Kalam","Segoe Print","Comic Sans MS",cursive;color:#fff1cc;text-align:center;white-space:nowrap;text-shadow:0 1px 2px #000}
.cat:focus-visible{outline:2px solid #f5c542;outline-offset:3px;border-radius:8px}
@media (prefers-reduced-motion: no-preference){
  .discoball{animation:dc-balldrop 1.1s cubic-bezier(.3,1.5,.5,1) both}
  .discoball .ball{animation:dc-ballshine 1s steps(4) infinite}
  .disco-lights{animation:dc-lightspin 7s linear infinite}
  .catline.floor{animation:dc-floorflash 1s steps(2) infinite}
  .cat{animation:dc-catin .7s cubic-bezier(.2,1.6,.4,1) both}
  .cat svg{transform-origin:50% 100%}
  .cat .head{transform-origin:50px 62px}
  .cat .arm-l{transform-origin:40px 66px}
  .cat .arm-r{transform-origin:60px 66px}
  .cat .leg-l{transform-origin:43px 103px}
  .cat .leg-r{transform-origin:57px 103px}
  .cat .tail{transform-origin:68px 96px;animation:dc-wag .25s ease-in-out infinite alternate}
  .cat .eyes{transform-origin:50px 43px;animation:dc-blink 3.4s infinite}
  .cat .ear-l{transform-origin:38px 34px;animation:dc-twitch 2.6s infinite}
  /* disco: point to the sky, hand on hip */
  .d-disco svg{animation:dc-sway 1s ease-in-out infinite}
  .d-disco .bod{animation:dc-hop .5s ease-in-out infinite alternate}
  .d-disco .arm-r{animation:dc-point 1s steps(1) infinite}
  .d-disco .arm-l{transform:rotate(-105deg)}
  /* headbang */
  .d-headbang .head{animation:dc-bang .25s ease-in-out infinite alternate}
  .d-headbang .bod{animation:dc-hop .25s ease-in-out infinite alternate}
  .d-headbang .arm-l{animation:dc-clawL .5s ease-in-out infinite alternate}
  .d-headbang .arm-r{animation:dc-clawR .5s ease-in-out infinite alternate}
  /* spin */
  .d-spin svg{animation:dc-spin360 2s cubic-bezier(.5,0,.5,1) infinite}
  .d-spin .arm-l{animation:dc-armL .5s ease-in-out infinite alternate}
  .d-spin .arm-r{animation:dc-armR .5s ease-in-out infinite alternate}
  /* wave: both paws in the air */
  .d-wave svg{animation:dc-sway 2s ease-in-out infinite}
  .d-wave .head{animation:dc-tilt 1s ease-in-out infinite}
  .d-wave .arm-l{animation:dc-waveL .5s ease-in-out infinite alternate}
  .d-wave .arm-r{animation:dc-waveR .5s ease-in-out infinite alternate}
  /* shuffle: side steps and kicks */
  .d-shuffle svg{animation:dc-slide 1s ease-in-out infinite}
  .d-shuffle .leg-l{animation:dc-kickL .5s ease-in-out infinite alternate}
  .d-shuffle .leg-r{animation:dc-kickR .5s ease-in-out infinite alternate}
  .d-shuffle .arm-l{animation:dc-armL .5s ease-in-out infinite alternate-reverse}
  .d-shuffle .arm-r{animation:dc-armR .5s ease-in-out infinite alternate}
  .cat.boing svg{animation:dc-boing .8s cubic-bezier(.3,1.5,.5,1)!important}
}
@keyframes dc-catin{0%{transform:translateY(-60vh) rotate(-540deg) scale(.3)}100%{transform:none}}
@keyframes dc-balldrop{0%{transform:translateY(-140px)}100%{transform:none}}
@keyframes dc-ballshine{0%{filter:brightness(1)}25%{filter:brightness(1.25) hue-rotate(20deg)}50%{filter:brightness(.95)}75%{filter:brightness(1.3) hue-rotate(-20deg)}}
@keyframes dc-lightspin{to{transform:rotate(360deg)}}
@keyframes dc-floorflash{50%{background-position:0 0,17px 0}}
@keyframes dc-sway{0%,100%{transform:rotate(-7deg)}50%{transform:rotate(7deg)}}
@keyframes dc-hop{from{transform:translateY(0)}to{transform:translateY(-9px)}}
@keyframes dc-armL{from{transform:rotate(0)}to{transform:rotate(-70deg)}}
@keyframes dc-armR{from{transform:rotate(-20deg)}to{transform:rotate(70deg)}}
@keyframes dc-wag{from{transform:rotate(-14deg)}to{transform:rotate(16deg)}}
@keyframes dc-tilt{0%,100%{transform:rotate(-10deg)}50%{transform:rotate(10deg)}}
@keyframes dc-point{0%{transform:rotate(-38deg)}50%{transform:rotate(95deg)}}
@keyframes dc-bang{from{transform:rotate(-6deg)}to{transform:rotate(22deg) translateY(3px)}}
@keyframes dc-clawL{from{transform:rotate(-15deg)}to{transform:rotate(-45deg)}}
@keyframes dc-clawR{from{transform:rotate(15deg)}to{transform:rotate(45deg)}}
@keyframes dc-spin360{0%{transform:rotateY(0)}25%{transform:rotateY(0) translateY(-6px)}60%{transform:rotateY(360deg) translateY(-16px)}100%{transform:rotateY(360deg)}}
@keyframes dc-waveL{from{transform:rotate(-45deg)}to{transform:rotate(-5deg)}}
@keyframes dc-waveR{from{transform:rotate(5deg)}to{transform:rotate(45deg)}}
@keyframes dc-slide{0%,100%{transform:translateX(-10px) rotate(-3deg)}50%{transform:translateX(10px) rotate(3deg)}}
@keyframes dc-kickL{from{transform:rotate(0)}to{transform:rotate(38deg)}}
@keyframes dc-kickR{from{transform:rotate(0)}to{transform:rotate(-38deg)}}
@keyframes dc-blink{0%,90%,100%{transform:scaleY(1)}94%{transform:scaleY(.1)}}
@keyframes dc-twitch{0%,80%,100%{transform:rotate(0)}85%{transform:rotate(-14deg)}90%{transform:rotate(4deg)}}
@keyframes dc-boing{0%{transform:none}45%{transform:translateY(-42px) rotate(360deg) scale(1.15)}100%{transform:none}}

/* the stage on the last page */
.dc-stage{position:relative;margin-top:12px;border-radius:10px;overflow:hidden;padding:96px 8px 14px;min-height:240px;
  background:radial-gradient(120% 90% at 50% 0%,#3a2a5c,#140f22 70%);box-shadow:inset 0 0 0 2px rgba(255,255,255,.08)}
.dc-stage .discoball{left:50%}
.dc-hint{margin:6px 0 0;font-size:14px;color:var(--muted,#5b6660)}
`;
  const style = document.createElement("style"); style.textContent = CSS; document.head.appendChild(style);
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
  let opts = { sound: () => true, burst: () => {} }, actx = null, soundOn = true;
  function tone(freq, dur, type = "triangle", vol = .12, slideTo = null, delay = 0) {
    if (!opts.sound()) return;
    try {
      actx = actx || new (window.AudioContext || window.webkitAudioContext)();
      const t = actx.currentTime + delay, o = actx.createOscillator(), g = actx.createGain();
      o.type = type; o.frequency.setValueAtTime(freq, t);
      if (slideTo) o.frequency.exponentialRampToValueAtTime(slideTo, t + dur);
      g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + .02); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      o.connect(g).connect(actx.destination); o.start(t); o.stop(t + dur + .05);
    } catch (e) {}
  }
/* dancing cats: every click adds one to the dance line (max 7), each with its own look and dance */
  const CAT_LOOKS = [
    {fur:"#f0a24a", dark:"#b0611a", pattern:"tabby",  gear:"shades", dance:"disco",    name:"DJ Cirmi"},
    {fur:"#2a2a2e", dark:"#111114", pattern:"tux",    gear:"phones", dance:"headbang", name:"Meowtallica"},
    {fur:"#9aa4ad", dark:"#5f6870", pattern:"tabby",  gear:"party",  dance:"spin",     name:"Sir Purrcival"},
    {fur:"#f2f2f2", dark:"#c8c8c8", pattern:"calico", gear:"bow",    dance:"wave",     name:"Kitty Gaga"},
    {fur:"#c9783a", dark:"#7d431a", pattern:"plain",  gear:"crown",  dance:"shuffle",  name:"Mirci Mercury"},
    {fur:"#6b6f78", dark:"#3d4047", pattern:"tux",    gear:"shades", dance:"disco",    name:"Catrick Swayze"},
    {fur:"#e8c99a", dark:"#b08a55", pattern:"tabby",  gear:"party",  dance:"wave",     name:"Bajusz Béla"}
  ];
  function catSvg(o){
    const f = o.fur, d = o.dark;
    const leg = (cls,x1,x2) => `<g class="${cls}"><path d="M${x1} 103L${x2} 116" stroke="${f}" stroke-width="8" stroke-linecap="round"/><ellipse cx="${x2}" cy="117.5" rx="6" ry="3.5" fill="${o.pattern==="tux" ? "#ffffff" : f}"/></g>`;
    const arm = (cls,x1,y1,x2,y2) => `<g class="${cls}"><path d="M${x1} ${y1}L${x2} ${y2}" stroke="${f}" stroke-width="8" stroke-linecap="round"/><circle cx="${x2}" cy="${y2}" r="4.6" fill="${o.pattern==="tux" ? "#ffffff" : f}"/></g>`;
    const bodyPattern = {
      tabby:  `<path d="M33 78Q40 76 42 82M31 90Q39 88 41 94M67 78Q60 76 58 82M69 90Q61 88 59 94" stroke="${d}" stroke-width="3" fill="none" stroke-linecap="round"/>`,
      tux:    `<ellipse cx="50" cy="88" rx="13" ry="18" fill="#ffffff"/>`,
      calico: `<ellipse cx="38" cy="80" rx="8" ry="10" fill="#e08a3c"/><ellipse cx="62" cy="94" rx="7" ry="8" fill="#3a3030"/><ellipse cx="50" cy="90" rx="9" ry="12" fill="#ffffff" opacity=".5"/>`,
      plain:  `<ellipse cx="50" cy="90" rx="11" ry="14" fill="#ffffff" opacity=".35"/>`
    }[o.pattern];
    const headPattern = {
      tabby:  `<path d="M44 27L45.5 33M50 25.5V32M56 27L54.5 33" stroke="${d}" stroke-width="2.6" stroke-linecap="round"/>`,
      tux:    `<ellipse cx="50" cy="53" rx="11" ry="8" fill="#ffffff"/>`,
      calico: `<path d="M50 24A21 21 0 0 1 71 45L56 40Z" fill="#e08a3c"/><path d="M29 45A21 21 0 0 1 36 30L44 40Z" fill="#3a3030"/>`,
      plain:  ``
    }[o.pattern];
    const eyes = o.gear === "shades"
      ? `<rect x="34" y="37" width="14" height="9" rx="3" fill="#111318" stroke="#f5c542" stroke-width="1.6"/><rect x="52" y="37" width="14" height="9" rx="3" fill="#111318" stroke="#f5c542" stroke-width="1.6"/><path d="M48 41H52" stroke="#f5c542" stroke-width="1.6"/><path d="M37 39H41" stroke="#ffffff" stroke-width="1.4" stroke-linecap="round" opacity=".8"/>`
      : `<g class="eyes"><ellipse cx="42" cy="43" rx="4.4" ry="5" fill="#c6f36b"/><ellipse cx="58" cy="43" rx="4.4" ry="5" fill="#c6f36b"/><ellipse cx="42" cy="43.5" rx="1.6" ry="3.8" fill="#111"/><ellipse cx="58" cy="43.5" rx="1.6" ry="3.8" fill="#111"/><circle cx="43.3" cy="41.3" r="1.1" fill="#fff"/><circle cx="59.3" cy="41.3" r="1.1" fill="#fff"/></g>`;
    const gear = {
      shades: ``,
      party:  `<path d="M39 28L50 -4L61 28Z" fill="#ff4d6d"/><path d="M42.5 19L57.5 19M46 9L54 9" stroke="#f5c542" stroke-width="3"/><circle cx="50" cy="-5" r="4" fill="#f5c542"/>`,
      bow:    `<path d="M50 67L38 61V73Z M50 67L62 61V73Z" fill="#4d8dff"/><circle cx="50" cy="67" r="3.4" fill="#2f5fc4"/>`,
      phones: `<path d="M27 44A23 23 0 0 1 73 44" stroke="#222" stroke-width="4.5" fill="none"/><rect x="22" y="38" width="9" height="15" rx="4" fill="#ff4d6d"/><rect x="69" y="38" width="9" height="15" rx="4" fill="#ff4d6d"/>`,
      crown:  `<path d="M37 27L37 15L43.5 21L50 11L56.5 21L63 15L63 27Z" fill="#f5c542" stroke="#b8860b" stroke-width="1.2"/><circle cx="50" cy="20" r="2" fill="#ff4d6d"/>`
    }[o.gear];
    return `<svg viewBox="0 0 100 122" aria-hidden="true">
      <path class="tail" d="M68 96C90 92 94 70 84 56" stroke="${f}" stroke-width="8" fill="none" stroke-linecap="round"/>
      <g class="bod">
        ${leg("leg-l",43,40)}${leg("leg-r",57,60)}
        ${arm("arm-l",40,66,25,52)}${arm("arm-r",60,66,75,52)}
        <ellipse cx="50" cy="84" rx="20" ry="24" fill="${f}"/>${bodyPattern}
        <g class="head">
          <g class="ear-l"><path d="M30 40L32 16L46 30Z" fill="${f}"/><path d="M34 33L34 22L41 30Z" fill="#ff9fb2"/></g>
          <path d="M70 40L68 16L54 30Z" fill="${f}"/><path d="M66 33L66 22L59 30Z" fill="#ff9fb2"/>
          <circle cx="50" cy="45" r="21" fill="${f}"/>${headPattern}${eyes}
          <path d="M47.5 50H52.5L50 53Z" fill="#ff8fa3"/>
          <path d="M50 53Q46 58 43 55M50 53Q54 58 57 55" stroke="#1a1a1a" stroke-width="1.4" fill="none" stroke-linecap="round"/>
          <path d="M31 50L19 48M31 53L19 55M69 50L81 48M69 53L81 55" stroke="#d9dde2" stroke-width="1" stroke-linecap="round"/>
          ${gear}
        </g>
      </g></svg>`;
  }
  function discoBeat(seconds){
    if (!opts.sound()) return;
    const step = 0.25, steps = Math.round(seconds/step);
    const bass = [110,110,165,147,110,110,196,165];
    for (let k=0; k<steps; k++){
      const t = k*step;
      if (k%2===0) tone(140, .18, "sine", .22, 45, t);
      else tone(7000, .04, "square", .015, null, t);
      if (k%2===0) tone(bass[(k/2)%bass.length], .2, "sawtooth", .045, null, t);
      if (k%8===4) tone(880, .08, "triangle", .05, 1320, t);
    }
  }
  function meow() { tone(700, .25, "triangle", .12, 1400, 0); tone(1400, .3, "triangle", .1, 600, .22); }

  function mount(host, o) {
    opts = Object.assign(opts, o || {});
    let catCount = 0, beatUntil = 0;
    host.innerHTML = `<button type="button" class="btn primary dc-btn">Táncoló cica</button>
      <p class="dc-hint">Minden kattintás egy új cica. Ha egy cicára kattintasz, ugrik egyet.</p>
      <div class="dc-stage" hidden><div class="disco-wrap" aria-hidden="true"><div class="disco-lights"></div><div class="discoball"><div class="ball"></div></div></div><div class="catline"></div></div>`;
    const stage = host.querySelector(".dc-stage"), line = host.querySelector(".catline");
    function addCat() {
      if (stage.hidden) { stage.hidden = false; line.classList.add("floor"); }
      if (line.children.length >= 7) line.firstElementChild.remove();
      const c = CAT_LOOKS[catCount++ % CAT_LOOKS.length];
      const d = document.createElement("div");
      d.className = `cat d-${c.dance}`; d.tabIndex = 0; d.setAttribute("role", "button"); d.setAttribute("aria-label", `${c.name}, kattints rá, és ugrik egyet`);
      d.innerHTML = catSvg(c) + `<span class="cat-name">${esc(c.name)}</span>`;
      line.appendChild(d);
      meow();
      const now = performance.now();
      if (now > beatUntil) { discoBeat(8); beatUntil = now + 8000; }
      if (!reduceMotion) { const r = d.getBoundingClientRect(); setTimeout(() => opts.burst(r.left + r.width / 2, r.top + 20, 40), 650); }
    }
    function boing(cat) {
      meow();
      cat.classList.remove("boing"); void cat.offsetWidth; cat.classList.add("boing");
      setTimeout(() => cat.classList.remove("boing"), 850);
      if (!reduceMotion) { const r = cat.getBoundingClientRect(); opts.burst(r.left + r.width / 2, r.top + 10, 18); }
    }
    host.querySelector(".dc-btn").addEventListener("click", addCat);
    line.addEventListener("click", e => { const c = e.target.closest(".cat"); if (c) boing(c); });
    line.addEventListener("keydown", e => { const c = e.target.closest(".cat"); if (c && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); boing(c); } });
  }
  window.DancingCats = { mount };
})();
