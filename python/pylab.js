/* ============================================================
   digikult — Python practice pages (pylab)
   ------------------------------------------------------------
   A page includes this file, then calls
   PYLAB_START({ key, title, file, downloads?, sections }).
   Checks can use the helpers in window.PYLAB_UTIL. Each section has its own editor; the
   student's program runs in a Web Worker (Pyodide), "Ellenőrzés"
   runs it again with test inputs and checks every task.

   section: { id, chap, title, lead, data?, files?, input, starter,
              tasks: [{ n, step, html, tag?, opt? }],
              runs:  [{ inputs, probes, files?, transform? }],
              check: { n: (R) => "" | "what is wrong" } }
   R[i] = { out, error, noinput, probes, written, tasks, code, inputsUsed }
   ============================================================ */
(() => {
"use strict";
/* written as the full file name so tools/build-sw.py keeps pyodide.mjs offline; the worker loads the rest from the same folder */
const PYODIDE = window.PYLAB_PYODIDE || "https://cdn.jsdelivr.net/npm/pyodide@314.0.8/pyodide.mjs".replace(/pyodide\.mjs$/, "");
const TIMEOUT_MS = 8000;
const $ = s => document.querySelector(s);
const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

/* ---------------- helpers the page's checks use ---------------- */
const norm = s => String(s == null ? "" : s).normalize("NFC").toLowerCase()
  .replace(/(\d),(\d)/g, "$1.$2").replace(/[ \t ]+/g, " ");
const has = (sec, s) => norm(sec).includes(norm(s));
const nums = sec => (norm(sec).match(/-?\d+(?:\.\d+)?/g) || []).map(Number);
const num = (sec, x) => nums(sec).some(v => Math.abs(v - x) < 1e-9);
const lines = sec => norm(sec).split("\n").map(l => l.trim()).filter(Boolean);
const lineWith = (sec, ...needles) => lines(sec).find(l => needles.every(n => typeof n === "number" ? num(l, n) : l.includes(norm(n))));
const need = (cond, msg) => cond ? "" : msg;
const first = (...msgs) => msgs.find(Boolean) || "";
const pv = (run, i) => run.probes[i] && run.probes[i].ok ? run.probes[i].value : undefined;
const pe = (run, i) => run.probes[i] && !run.probes[i].ok ? run.probes[i].err : "";
const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);
/* Hungarian article before a number: "az 1.", "az 5.", "a 3." */
const art = n => { const s = String(n); return (s === "1" || s[0] === "5" || (s.length === 4 && s[0] === "1")) ? "az" : "a"; };
const Art = n => art(n) === "az" ? "Az" : "A";
const noMark = n => `Nem találom a kimenetben ${art(n)} „${n}. feladat” sort. Írd ki: print("${n}. feladat")`;
/* swap the value of `name = [...]` in the student's code (for a second run on other data) */
function replaceAssign(code, name, newSrc) {
  const m = new RegExp("^" + name + "\\s*=\\s*\\[", "m").exec(code);
  if (!m) return null;
  let i = m.index + m[0].length - 1, depth = 0, q = null;
  for (; i < code.length; i++) {
    const c = code[i];
    if (q) { if (c === "\\") i++; else if (c === q) q = null; continue; }
    if (c === '"' || c === "'") q = c;
    else if (c === "[") depth++;
    else if (c === "]" && --depth === 0) break;
  }
  if (depth !== 0) return null;
  return code.slice(0, m.index) + name + " = " + newSrc + code.slice(i + 1);
}
window.PYLAB_UTIL = { norm, has, nums, num, lines, lineWith, need, first, pv, pe, same, noMark, replaceAssign, art, Art };

/* split the output into tasks by the "N. feladat" lines */
function splitTasks(out) {
  const secs = {};
  let cur = null;
  for (const raw of String(out).split("\n")) {
    const m = raw.match(/^\s*(\d{1,2})\s*\.?\s*feladat\b\s*[:.\-–]?\s*(.*)$/i);
    if (m) { cur = +m[1]; secs[cur] = (secs[cur] || "") + m[2] + "\n"; continue; }
    if (cur != null) secs[cur] += raw + "\n";
  }
  return secs;
}

/* ---------------- the Python side (runs inside the worker) ---------------- */
const HARNESS = String.raw`import io, os, json, builtins, traceback, contextlib

WD = "/home/pyodide/hazi"
os.makedirs(WD, exist_ok=True)

class _NoInput(Exception):
    pass

HU = {
    "NameError": "Ismeretlen név: olyan változót vagy függvényt használsz, amelyet még nem hoztál létre. Elírtad? Figyelj a kis- és nagybetűkre!",
    "TypeError": "Típushiba: nem megfelelő típusú adattal dolgozol, pl. szöveget adsz össze számmal. Hiányzik egy int() vagy float()?",
    "ValueError": "Értékhiba: például olyan szöveget alakítasz számmá, amely nem szám.",
    "IndexError": "Túlindexelés: a listának nincs ilyen indexű eleme.",
    "KeyError": "Nincs ilyen kulcs a szótárban.",
    "ZeroDivisionError": "Nullával osztás.",
    "AttributeError": "Az objektumnak nincs ilyen adattagja vagy metódusa. Elírás?",
    "FileNotFoundError": "A fájl nem található. Pontosan így írtad a nevét?",
    "IndentationError": "Behúzási hiba: valamelyik sor rosszul van behúzva.",
    "TabError": "Behúzási hiba: vegyesen használsz tabulátort és szóközt.",
    "SyntaxError": "Szintaktikai hiba: elírás, vagy hiányzik egy kettőspont, zárójel, idézőjel?",
    "UnboundLocalError": "A függvényben egy változót előbb használsz, mint hogy értéket adnál neki.",
    "RecursionError": "Túl mély, talán végtelen rekurzió.",
}

def _reset(files):
    os.chdir(WD)
    for f in os.listdir(WD):
        p = os.path.join(WD, f)
        if os.path.isfile(p):
            os.remove(p)
    for name, text in files.items():
        with open(os.path.join(WD, name), "w", encoding="utf-8") as fh:
            fh.write(text)

def _describe(e):
    name = type(e).__name__
    line = None
    if isinstance(e, SyntaxError) and e.filename == "hazi.py":
        line = e.lineno
        msg = e.msg or ""
    else:
        msg = str(e)
        for fr in traceback.extract_tb(e.__traceback__):
            if fr.filename == "hazi.py":
                line = fr.lineno
    return {"type": name, "msg": msg, "line": line, "hint": HU.get(name, "")}

def _plain(v, depth=0):
    if isinstance(v, (bool, int, float, str)) or v is None:
        return v
    if isinstance(v, (list, tuple)) and depth < 4:
        return [_plain(x, depth + 1) for x in v]
    return repr(v)

def _objs(g, clsname):
    cls = g.get(clsname)
    if not isinstance(cls, type):
        return -1
    best = 0
    for v in list(g.values()):
        if isinstance(v, list) and v and all(isinstance(x, cls) for x in v):
            best = max(best, len(v))
    return best

def _rows(g, n):
    for v in list(g.values()):
        if isinstance(v, list) and len(v) == n and all(isinstance(x, (list, tuple)) and len(x) >= 3 and isinstance(x[2], int) and not isinstance(x[2], bool) for x in v):
            return True
    return False

def dk_run(code, inputs_json, files_json, probes_json, echo):
    inputs = json.loads(inputs_json)
    files = json.loads(files_json)
    probes = json.loads(probes_json)
    _reset(files)
    out = io.StringIO()
    queue = list(inputs)

    def _input(prompt=""):
        if echo:
            out.write(str(prompt))
        if not queue:
            raise _NoInput()
        v = queue.pop(0)
        if echo:
            out.write(v + "\n")
        return v

    g = {"__name__": "__main__", "__builtins__": builtins}
    real_input = builtins.input
    builtins.input = _input
    error = None
    noinput = False
    try:
        with contextlib.redirect_stdout(out):
            exec(compile(code, "hazi.py", "exec"), g)
    except _NoInput:
        noinput = True
    except SystemExit:
        pass
    except BaseException as e:
        error = _describe(e)

    g["__dk_objs"] = lambda c: _objs(g, c)
    g["__dk_rows"] = lambda n: _rows(g, n)
    results = []
    for p in probes:
        buf = io.StringIO()
        try:
            with contextlib.redirect_stdout(buf):
                val = eval(p, g)
            results.append({"ok": True, "value": _plain(val), "out": buf.getvalue()})
        except _NoInput:
            results.append({"ok": False, "err": "input", "out": buf.getvalue()})
        except BaseException as e:
            results.append({"ok": False, "err": type(e).__name__ + ": " + str(e), "out": buf.getvalue()})
    builtins.input = real_input

    written = {}
    for f in sorted(os.listdir(WD)):
        p = os.path.join(WD, f)
        if f not in files and os.path.isfile(p):
            with open(p, encoding="utf-8", errors="replace") as fh:
                written[f] = fh.read(20000)
    return json.dumps({"out": out.getvalue()[:100000], "error": error, "noinput": noinput,
                       "probes": results, "written": written}, ensure_ascii=False)
`;
const WORKER = String.raw`let py = null;
self.onmessage = async (e) => {
  const m = e.data;
  if (m.type === "init") {
    try {
      const { loadPyodide } = await import(m.base + "pyodide.mjs");
      py = await loadPyodide({ indexURL: m.base });
      py.runPython(m.harness);
      self.postMessage({ type: "ready", version: py.version });
    } catch (err) {
      self.postMessage({ type: "fail", error: String(err && err.message || err) });
    }
    return;
  }
  if (m.type === "run") {
    let result;
    try {
      const fn = py.globals.get("dk_run");
      result = fn(m.code, JSON.stringify(m.inputs), JSON.stringify(m.files), JSON.stringify(m.probes), m.echo);
      fn.destroy();
    } catch (err) {
      result = JSON.stringify({ out: "", error: { type: "Belső hiba", msg: String(err && err.message || err), line: null, hint: "" }, noinput: false, probes: [], written: {} });
    }
    self.postMessage({ type: "result", id: m.id, result });
  }
};
`;

window.PYLAB_START = (P) => {
/* ---------------- state ---------------- */
let state = { solved: [], code: {}, input: {}, name: "", end: false };
try { const s = JSON.parse(localStorage.getItem(P.key)); if (s && Array.isArray(s.solved)) state = Object.assign(state, s); } catch (e) {}
const save = () => { try { localStorage.setItem(P.key, JSON.stringify(state)); } catch (e) {} };
const allTasks = P.sections.flatMap(S => S.tasks);
const mainTasks = allTasks.filter(t => !t.opt).map(t => t.n);

/* ---------------- Python runner (Web Worker, restarted after a timeout) ---------------- */
const Runner = (() => {
  let worker = null, ready = null, seq = 0;
  const pending = new Map();
  const setStat = (cls, txt) => { const el = $("#pyStat"); if (!el) return; el.className = "pystat " + cls; $("#pyStatTxt").textContent = txt; };
  function start() {
    setStat("", "A Python betöltése…");
    worker = new Worker(URL.createObjectURL(new Blob([WORKER], { type: "text/javascript" })), { type: "module" });
    ready = new Promise((res, rej) => {
      worker.onmessage = e => {
        const m = e.data;
        if (m.type === "ready") { setStat("ok", "Python kész"); res(); }
        else if (m.type === "fail") { setStat("bad", "A Python nem töltődött be"); rej(new Error(m.error)); }
        else if (m.type === "result") { const p = pending.get(m.id); if (p) { pending.delete(m.id); clearTimeout(p.timer); p.res(JSON.parse(m.result)); } }
      };
      worker.onerror = e => { setStat("bad", "A Python nem töltődött be"); rej(new Error(e.message || "worker error")); };
    });
    ready.catch(() => {});
    worker.postMessage({ type: "init", base: PYODIDE, harness: HARNESS });
  }
  function restart() {
    try { worker.terminate(); } catch (e) {}
    for (const p of pending.values()) { clearTimeout(p.timer); p.res(null); }
    pending.clear();
    start();
  }
  const fail = (type, msg, hint) => ({ out: "", error: { type, msg, line: null, hint: hint || "" }, noinput: false, probes: [], written: {} });
  async function run(job) {
    if (!worker) start();
    try { await ready; } catch (e) { return fail("Betöltési hiba", "A Python nem töltődött be. Van internetkapcsolat? Töltsd újra az oldalt."); }
    const id = ++seq;
    return new Promise(res => {
      const timer = setTimeout(() => {
        pending.delete(id);
        restart();
        res(Object.assign(fail("Időtúllépés", `A program ${TIMEOUT_MS / 1000} másodperc alatt sem fejeződött be.`,
          "Végtelen ciklus? Nézd meg a while ciklus feltételét, és hogy változik-e a ciklusváltozó."), { timeout: true }));
      }, TIMEOUT_MS);
      pending.set(id, { res, timer });
      worker.postMessage(Object.assign({ type: "run", id }, job));
    });
  }
  return { start, run };
})();

/* ---------------- build the page ---------------- */
function buildSteps() {
  $("#steps").innerHTML = allTasks.map(t => `<button type="button" class="step" data-n="${t.n}"><span class="n">${t.n}. feladat</span><span class="t">${esc(t.step)}</span></button>`).join("");
  $("#steps").addEventListener("click", e => { const b = e.target.closest(".step"); if (b) document.getElementById("t" + b.dataset.n).scrollIntoView({ behavior: "smooth", block: "start" }); });
}
function buildSections() {
  $("#sections").innerHTML = P.sections.map(S => `
  <section class="sec" id="sec${S.id}">
    <article class="card">
      <p class="chap">${S.chap}</p>
      <h2>${esc(S.title)}</h2>
      ${S.lead ? `<p>${S.lead}</p>` : ""}
      ${S.data ? `<pre class="data">${esc(S.data)}</pre>` : ""}
      <ol class="goals">${S.tasks.map(t => `<li id="t${t.n}"><span class="tn">${t.n}. feladat${t.tag ? ` – ${t.tag}` : ""}</span>${t.opt ? `<span class="opt">szorgalmi</span>` : ""}<p>${t.html}</p><p class="fb" hidden></p></li>`).join("")}</ol>
      ${S.tip ? `<div class="learn"><h3>Emlékeztető</h3>${S.tip}</div>` : ""}
    </article>
    <div class="card ed-card">
      <div class="ed-head"><h3>A programod</h3><span><kbd>Ctrl</kbd>+<kbd>Enter</kbd> futtat</span></div>
      <div class="editor" style="height:${S.height || 360}px"><pre class="gutter" aria-hidden="true"></pre><textarea class="code" spellcheck="false" autocapitalize="off" autocomplete="off" aria-label="${esc(S.title)}: Python kód"></textarea></div>
      <div class="io"${S.noInput ? " hidden" : ""}><label for="in${S.id}">Bemenet: amit az input() kap, soronként egy érték</label><textarea id="in${S.id}" class="stdin" spellcheck="false"></textarea></div>
      <div class="btns">
        <button type="button" class="btn py" data-act="run">▶ Futtatás</button>
        <button type="button" class="btn primary" data-act="check">✓ Ellenőrzés</button>
        <button type="button" class="btn" data-act="reset">Kezdőkód</button>
      </div>
      <pre class="out" aria-live="polite"><span class="muted">Itt jelenik meg a program kimenete.</span></pre>
      <div class="files"></div>
      <p class="sum" hidden></p>
    </div>
  </section>`).join("");

  P.sections.forEach(S => {
    const root = document.getElementById("sec" + S.id);
    const ta = root.querySelector(".code"), gut = root.querySelector(".gutter"), inp = root.querySelector(".stdin");
    S.el = { root, ta, gut, inp, out: root.querySelector(".out"), files: root.querySelector(".files"), sum: root.querySelector(".sum") };
    ta.value = state.code[S.id] != null ? state.code[S.id] : S.starter;
    inp.value = state.input[S.id] != null ? state.input[S.id] : (S.input || "");
    paintGutter(S);
    let tmr;
    ta.addEventListener("input", () => { paintGutter(S); clearTimeout(tmr); tmr = setTimeout(() => { state.code[S.id] = ta.value; save(); }, 300); });
    ta.addEventListener("scroll", () => { gut.scrollTop = ta.scrollTop; });
    ta.addEventListener("keydown", e => editorKeys(e, S));
    inp.addEventListener("input", () => { state.input[S.id] = inp.value; save(); });
    inp.addEventListener("keydown", e => { if ((e.ctrlKey || e.metaKey) && e.key === "Enter") { e.preventDefault(); runSection(S); } });
    root.querySelector('[data-act="run"]').addEventListener("click", () => runSection(S));
    root.querySelector('[data-act="check"]').addEventListener("click", () => checkSection(S));
    root.querySelector('[data-act="reset"]').addEventListener("click", () => {
      if (!confirm("Biztosan visszaállítod a kezdőkódot? A mostani kódod elvész.")) return;
      ta.value = S.starter; delete state.code[S.id]; save(); paintGutter(S);
    });
  });
}
function paintGutter(S, errLine) {
  const n = S.el.ta.value.split("\n").length;
  let h = "";
  for (let i = 1; i <= n; i++) h += `<b${i === errLine ? ' class="err"' : ""}>${i}</b>`;
  S.el.gut.innerHTML = h;
  S.el.gut.scrollTop = S.el.ta.scrollTop;
}

/* a small code editor: Tab indents, Shift+Tab outdents, Enter keeps the indent (and adds one after ':') */
function editorKeys(e, S) {
  const ta = e.target, v = ta.value, a = ta.selectionStart, b = ta.selectionEnd;
  const put = (text, from, to, caretA, caretB) => {
    ta.setRangeText(text, from, to, "end");
    if (caretA != null) ta.setSelectionRange(caretA, caretB != null ? caretB : caretA);
    ta.dispatchEvent(new Event("input"));
  };
  if ((e.ctrlKey || e.metaKey) && e.key === "Enter") { e.preventDefault(); runSection(S); return; }
  if (e.key === "Tab") {
    e.preventDefault();
    const ls = v.lastIndexOf("\n", a - 1) + 1;
    if (a === b && !e.shiftKey) { put("    ", a, b); return; }
    const le = b > a && v[b - 1] === "\n" ? b - 1 : b;
    const block = v.slice(ls, le).split("\n");
    const txt = (e.shiftKey ? block.map(l => l.replace(/^ {1,4}/, "")) : block.map(l => "    " + l)).join("\n");
    put(txt, ls, le, ls, ls + txt.length);
    return;
  }
  if (e.key === "Enter" && !e.shiftKey && !e.altKey && !e.isComposing) {
    const ls = v.lastIndexOf("\n", a - 1) + 1;
    const line = v.slice(ls, a);
    let ind = (line.match(/^ */) || [""])[0];
    if (/:\s*(#.*)?$/.test(line)) ind += "    ";
    e.preventDefault();
    put("\n" + ind, a, b);
    return;
  }
  if (e.key === "Backspace" && a === b && a > 0) {
    const ls = v.lastIndexOf("\n", a - 1) + 1;
    const before = v.slice(ls, a);
    if (before.length && /^ +$/.test(before)) {
      e.preventDefault();
      put("", a - (before.length % 4 || 4), a);
    }
  }
}

/* ---------------- running + output ---------------- */
function busy(S, on) { S.el.root.querySelectorAll(".btns .btn").forEach(b => { b.disabled = on; }); }
function showResult(S, r) {
  let h = r.out ? esc(r.out) : "";
  if (r.noinput) h += `<span class="warn">A program adatot kért (input()), de a Bemenet mezőben nincs több sor. Írd be oda, amit begépelnél, soronként egyet.</span>`;
  if (r.error) {
    const e = r.error;
    h += `<span class="err"><b>${e.line ? `Hiba ${art(e.line)} ${e.line}. sorban` : "Hiba"}</b> – ${esc(e.type)}: ${esc(e.msg)}${e.hint ? "\n" + esc(e.hint) : ""}</span>`;
  }
  S.el.out.innerHTML = h || '<span class="muted">(A program nem írt ki semmit.)</span>';
  paintGutter(S, r.error && r.error.line);
  S.el.files.innerHTML = Object.keys(r.written || {}).map(n => {
    const url = URL.createObjectURL(new Blob([r.written[n]], { type: "text/plain;charset=utf-8" }));
    return `<details><summary>A program által létrehozott fájl: ${esc(n)}</summary><pre>${esc(r.written[n]) || "(üres fájl)"}</pre><a href="${url}" download="${esc(n)}">Letöltés</a></details>`;
  }).join("");
}
async function runSection(S) {
  busy(S, true);
  S.el.out.innerHTML = '<span class="muted">Fut…</span>';
  const inputs = S.el.inp.value.replace(/\r/g, "").split("\n");
  if (inputs.length && inputs[inputs.length - 1] === "") inputs.pop();
  const r = await Runner.run({ code: S.el.ta.value, inputs, files: S.files || {}, probes: [], echo: true });
  busy(S, false);
  if (r) showResult(S, r);
}
async function checkSection(S) {
  busy(S, true);
  S.el.out.innerHTML = '<span class="muted">Ellenőrzés: a program többféle bemenettel is lefut…</span>';
  const R = [];
  let renamed = "";
  for (const run of S.runs) {
    let code = S.el.ta.value;
    if (run.transform) {
      const c = run.transform(code);
      if (c == null) { renamed = run.renamed || "A kezdőkódban kapott adatokat ne nevezd át."; code = S.el.ta.value; }
      else code = c;
    }
    const r = await Runner.run({ code, inputs: run.inputs || [], files: run.files || S.files || {}, probes: run.probes || [], echo: false });
    if (!r) { busy(S, false); return; }
    r.code = S.el.ta.value;
    r.tasks = splitTasks(r.out);
    if (S.tasks.length === 1 && r.tasks[S.tasks[0].n] == null) r.tasks[S.tasks[0].n] = r.out;
    r.inputsUsed = !r.noinput && (run.inputs || []).length > 0;
    R.push(r);
    if (r.timeout) break;   /* one endless loop is enough, don't wait for every run */
  }
  busy(S, false);
  showResult(S, R[0]);
  let okN = 0;
  for (const t of S.tasks) {
    let msg;
    if (R.some(r => r.timeout)) msg = "A program nem fejeződött be (végtelen ciklus?), ezért nem tudtam ellenőrizni.";
    else try { msg = renamed || S.check[t.n](R); } catch (e) { msg = "Ezt most nem tudtam ellenőrizni: " + e.message; }
    const e0 = R[0].error;
    if (msg && e0 && /^(SyntaxError|IndentationError|TabError)$/.test(e0.type)) msg = `A program el sem indult, mert ${e0.line ? `${art(e0.line)} ${e0.line}. sorban ` : ""}szintaktikai hiba van (lásd a kimenetnél).`;
    else if (msg && e0 && msg.startsWith("Nem találom a kimenetben")) msg += ` A program ${e0.line ? `${art(e0.line)} ${e0.line}. sorban ` : ""}hibával leállt, mielőtt ideért volna.`;
    const li = document.getElementById("t" + t.n), fb = li.querySelector(".fb");
    li.classList.toggle("ok", !msg); li.classList.toggle("bad", !!msg);
    fb.hidden = false;
    fb.textContent = msg || "Jó megoldás!";
    if (!msg) { okN++; if (!state.solved.includes(t.n)) state.solved.push(t.n); }
    else state.solved = state.solved.filter(x => x !== t.n);
  }
  S.el.sum.hidden = false;
  S.el.sum.className = "sum" + (okN === S.tasks.length ? " ok" : "");
  S.el.sum.textContent = S.tasks.length === 1 ? (okN ? "Kész!" : "Még nem jó, a hibát a feladat alatt látod.") : `${okN} / ${S.tasks.length} feladat jó.`;
  state.solved.sort((a, b) => a - b);
  state.end = mainTasks.every(n => state.solved.includes(n));
  save();
  paintProgress();
}

/* ---------------- progress, results, download ---------------- */
function paintProgress() {
  const main = state.solved.filter(n => mainTasks.includes(n)).length;
  const optDone = state.solved.some(n => !mainTasks.includes(n));
  $("#solvedCount").textContent = `${state.solved.length} / ${allTasks.length}`;
  document.querySelectorAll("#steps .step").forEach(b => b.classList.toggle("done", state.solved.includes(+b.dataset.n)));
  allTasks.forEach(t => {
    const li = document.getElementById("t" + t.n);
    if (state.solved.includes(t.n) && !li.classList.contains("bad")) li.classList.add("ok");
  });
  $("#endScore").textContent = `${main} / ${mainTasks.length}` + (optDone ? " + szorgalmi" : "");
  $("#endName").textContent = state.name ? `${state.name} eredménye` : "Eredmény";
  $("#endChips").innerHTML = allTasks.map(t => `<span class="${state.solved.includes(t.n) ? "ok" : ""}">${t.n}.${state.solved.includes(t.n) ? " ✓" : ""}</span>`).join("");
}
function downloadAll() {
  const head = `# ${P.title}\n# Név: ${state.name || "(nincs megadva)"}\n# Kész feladatok: ${state.solved.join(", ") || "-"}\n`;
  const body = P.sections.map(S => `\n# ============================== ${S.chap.replace(/<[^>]+>/g, "")}: ${S.title} ==============================\n` + S.el.ta.value.replace(/\s+$/, "") + "\n").join("");
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([head + body], { type: "text/x-python;charset=utf-8" }));
  a.download = P.file;
  document.body.appendChild(a); a.click(); a.remove();
}

buildSteps();
buildSections();
paintProgress();
const nameIn = $("#nameIn");
nameIn.value = state.name || "";
nameIn.addEventListener("input", e => { state.name = e.target.value.trim(); save(); paintProgress(); });
(P.downloads || []).forEach(d => { const a = document.getElementById(d.id); if (a) a.href = URL.createObjectURL(new Blob([d.text], { type: "text/plain;charset=utf-8" })); });
document.querySelectorAll("[data-download-all]").forEach(b => b.addEventListener("click", downloadAll));
$("#resetBtn").addEventListener("click", () => {
  if (!confirm("Biztosan törlöd az összes kódodat és eredményedet ebből a böngészőből?")) return;
  try { localStorage.removeItem(P.key); } catch (e) {}
  location.reload();
});
Runner.start();
};
})();
