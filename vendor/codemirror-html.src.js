/* digikult HTML + CSS editor: CodeMirror 6 with the comforts students know from VS Code.
   Bundled into ../codemirror-html.js with:
   esbuild entry.js --bundle --minify --format=iife --global-name=CMHTML
   (npm: @codemirror/view state commands language autocomplete search lint lang-html lang-css,
    @replit/codemirror-indentation-markers, @lezer/highlight, emmet, esbuild) */
import { EditorView, keymap, lineNumbers, highlightActiveLine, highlightActiveLineGutter, drawSelection, dropCursor,
         highlightSpecialChars, hoverTooltip, rectangularSelection, crosshairCursor,
         Decoration, ViewPlugin, WidgetType, MatchDecorator } from "@codemirror/view";
import { EditorState, EditorSelection, StateField, StateEffect, Annotation, Compartment } from "@codemirror/state";
import { defaultKeymap, history, historyKeymap, indentWithTab, indentSelection } from "@codemirror/commands";
import { indentOnInput, bracketMatching, syntaxHighlighting, HighlightStyle, indentUnit, syntaxTree,
         foldGutter, foldKeymap, codeFolding } from "@codemirror/language";
import { autocompletion, closeBrackets, closeBracketsKeymap, completionKeymap, acceptCompletion, completionStatus } from "@codemirror/autocomplete";
import { search, searchKeymap, highlightSelectionMatches, openSearchPanel } from "@codemirror/search";
import { linter, lintGutter } from "@codemirror/lint";
import { html, htmlCompletionSource } from "@codemirror/lang-html";
import { css, cssCompletionSource } from "@codemirror/lang-css";
import { indentationMarkers } from "@replit/codemirror-indentation-markers";
import { tags as t } from "@lezer/highlight";
import expandEmmet, { extract as extractEmmet } from "emmet";

/* ---------- looks: colours match the static code blocks on the site ---------- */
const style = HighlightStyle.define([
  /* strong, clearly separate colours so each kind of code is easy to spot; punctuation steps back */
  { tag: t.tagName, color: "#ffd84d", fontWeight: "700" },
  { tag: t.attributeName, color: "#6ec3ff" },
  { tag: [t.attributeValue, t.string], color: "#9be57a" },
  { tag: [t.angleBracket, t.definitionOperator, t.operator, t.punctuation, t.separator, t.brace, t.paren, t.squareBracket], color: "#7f978c" },
  { tag: t.comment, color: "#7d9489", fontStyle: "italic" },
  { tag: [t.documentMeta, t.character, t.processingInstruction], color: "#ff9cc6" },
  { tag: t.invalid, color: "#ff6b6b", textDecoration: "underline wavy" },
  /* CSS: selectors orange and bold, properties blue, numbers and units pink, values green */
  { tag: [t.className, t.labelName], color: "#ffa64d", fontWeight: "700" },
  { tag: t.propertyName, color: "#6ec3ff" },
  { tag: [t.number, t.unit, t.color], color: "#ff8fb8" },
  { tag: [t.keyword, t.atom, t.variableName, t.constant(t.name)], color: "#9be57a" },
  { tag: t.modifier, color: "#ff6b6b", fontWeight: "700" },
]);

const theme = EditorView.theme({
  "&": { color: "#e9efe9", backgroundColor: "#1f2a26", fontSize: "var(--code-size, 15px)", height: "100%" },
  ".cm-scroller": { fontFamily: "'JetBrains Mono', ui-monospace, Menlo, Consolas, monospace", lineHeight: "1.6" },
  ".cm-content": { padding: "12px 0", caretColor: "#f2d264" },
  ".cm-line": { padding: "0 14px 0 10px" },
  "&.cm-focused": { outline: "2px solid rgba(242,210,100,.5)", outlineOffset: "-2px" },
  "&.cm-focused .cm-cursor": { borderLeftColor: "#f2d264", borderLeftWidth: "2px" },
  "&.cm-focused .cm-selectionBackground, .cm-selectionBackground, ::selection": { backgroundColor: "rgba(242,210,100,.28)" },
  ".cm-selectionMatch": { backgroundColor: "rgba(156,200,232,.18)" },
  ".cm-gutters": { backgroundColor: "#1a2420", color: "#6f857c", border: "none", borderRight: "1px solid #2c3a34" },
  ".cm-lineNumbers .cm-gutterElement": { padding: "0 6px 0 10px", minWidth: "30px" },
  ".cm-foldGutter .cm-gutterElement": { padding: "0 4px", color: "#6f857c", cursor: "pointer" },
  ".cm-foldGutter .cm-gutterElement:hover": { color: "#f2d264" },
  ".cm-foldPlaceholder": { backgroundColor: "#2f7a5a", border: "none", color: "#fff", padding: "0 6px", borderRadius: "4px", margin: "0 3px" },
  ".cm-activeLine": { backgroundColor: "rgba(255,255,255,.04)" },
  ".cm-activeLineGutter": { backgroundColor: "rgba(255,255,255,.06)", color: "#c9d3cc" },
  "&.cm-focused .cm-matchingBracket": { backgroundColor: "rgba(168,219,160,.22)", outline: "1px solid rgba(168,219,160,.55)" },
  "&.cm-focused .cm-nonmatchingBracket": { backgroundColor: "rgba(255,138,128,.25)" },
  ".cm-tooltip": { border: "1px solid #3a4a44", backgroundColor: "#24312c", color: "#e9efe9", borderRadius: "8px", overflow: "hidden" },
  ".cm-tooltip-autocomplete > ul": { fontFamily: "'JetBrains Mono', ui-monospace, monospace", fontSize: "14px", maxHeight: "15em" },
  ".cm-tooltip-autocomplete > ul > li": { padding: "3px 10px" },
  ".cm-tooltip-autocomplete > ul > li[aria-selected]": { backgroundColor: "#2f7a5a", color: "#fff" },
  ".cm-tooltip-autocomplete > ul > li[aria-selected] .cm-completionDetail": { color: "#d8efe1" },
  ".cm-completionIcon": { display: "none" },
  ".cm-completionDetail": { color: "#9fb3aa", fontStyle: "normal", marginLeft: "1.2em", fontFamily: "'Atkinson Hyperlegible', system-ui, sans-serif", fontSize: "13px" },
  ".cm-doc": { padding: "8px 11px", maxWidth: "320px", font: "14px/1.45 'Atkinson Hyperlegible', system-ui, sans-serif" },
  ".cm-doc b": { color: "#f2d264", fontFamily: "'JetBrains Mono', monospace", fontWeight: "600" },
  ".cm-doc code": { fontFamily: "'JetBrains Mono', monospace", color: "#a8dba0" },
  ".cm-panels": { backgroundColor: "#24312c", color: "#e9efe9", borderColor: "#3a4a44" },
  ".cm-panels-bottom": { borderTop: "1px solid #3a4a44" },
  ".cm-search": { fontFamily: "'Atkinson Hyperlegible', system-ui, sans-serif", fontSize: "14px", padding: "6px 10px" },
  ".cm-search input, .cm-search button": { fontSize: "13.5px" },
  ".cm-textfield": { backgroundColor: "#1f2a26", color: "#e9efe9", border: "1px solid #3a4a44", borderRadius: "5px", padding: "3px 6px" },
  ".cm-button": { backgroundImage: "none", backgroundColor: "#2f3e38", color: "#e9efe9", border: "1px solid #3a4a44", borderRadius: "5px" },
  ".cm-searchMatch": { backgroundColor: "rgba(242,210,100,.25)", outline: "1px solid rgba(242,210,100,.5)" },
  ".cm-searchMatch-selected": { backgroundColor: "rgba(242,210,100,.5)" },
  ".cm-lintRange-warning": { backgroundImage: "none", textDecoration: "underline wavy #f2b84a", textDecorationSkipInk: "none", textUnderlineOffset: "3px" },
  ".cm-diagnostic": { padding: "6px 10px", font: "14px/1.4 'Atkinson Hyperlegible', system-ui, sans-serif" },
  ".cm-diagnostic-warning": { borderLeft: "4px solid #f2b84a" },
  ".cm-diagnostic code": { fontFamily: "'JetBrains Mono', monospace", color: "#f2d264" },
  ".cm-lint-marker-warning": { content: "none" },
  ".cm-lintRange-info": { backgroundImage: "none", textDecoration: "underline dotted #8cc4ee", textDecorationSkipInk: "none", textUnderlineOffset: "3px" },
  ".cm-diagnostic-info": { borderLeft: "4px solid #8cc4ee" },
  ".cm-lint-marker-info": { content: "none" },
  ".cm-gutter-lint .cm-gutterElement": { padding: "0 2px" },
  ".cm-swatch": { display: "inline-block", width: ".8em", height: ".8em", margin: "0 .35em 0 .05em", verticalAlign: "-.06em",
                  borderRadius: "2px", boxShadow: "0 0 0 1px rgba(255,255,255,.35)", backgroundImage: "linear-gradient(45deg,#888 25%,transparent 25%,transparent 75%,#888 75%),linear-gradient(45deg,#888 25%,transparent 25%,transparent 75%,#888 75%)",
                  backgroundSize: "6px 6px", backgroundPosition: "0 0,3px 3px", position: "relative", overflow: "hidden" },
  ".cm-swatch > i": { position: "absolute", inset: "0" },
  ".cm-flash-line": { backgroundColor: "rgba(224,123,44,.16)", boxShadow: "inset 4px 0 0 #e07b2c", animation: "cm-flash-fade 2s ease-in 2s forwards" },
  ".cm-flash-line.first": { borderTop: "1px solid rgba(224,123,44,.55)" },
  ".cm-flash-line.last": { borderBottom: "1px solid rgba(224,123,44,.55)" },
  ".cm-flash": { backgroundColor: "rgba(224,123,44,.22)", borderRadius: "2px", animation: "cm-flash-fade 2s ease-in 2s forwards" },
  "@keyframes cm-flash-fade": { to: { backgroundColor: "transparent", boxShadow: "inset 4px 0 0 transparent", borderColor: "transparent" } },
}, { dark: true });

/* ---------- "this is the element you clicked": a block that lights up, then fades ---------- */
const setFlash = StateEffect.define();
const flashField = StateField.define({
  create: () => Decoration.none,
  update(v, tr) {
    v = v.map(tr.changes);
    for (const e of tr.effects) if (e.is(setFlash)) {
      if (!e.value) return Decoration.none;
      const { from, to } = e.value, doc = tr.state.doc, ranges = [];
      const a = doc.lineAt(from).number, b = doc.lineAt(Math.max(from, to - 1)).number;
      for (let n = a; n <= b; n++) ranges.push(Decoration.line({ class: "cm-flash-line" + (n === a ? " first" : "") + (n === b ? " last" : "") }).range(doc.line(n).from));
      if (to > from) ranges.push(Decoration.mark({ class: "cm-flash" }).range(from, to));
      return Decoration.set(ranges, true);
    }
    if (tr.docChanged) return Decoration.none;
    return v;
  },
  provide: f => EditorView.decorations.from(f)
});

/* ---------- CSS: a small colour square in front of every colour value ---------- */
const NAMED = new Set(("black white red green blue yellow orange purple pink brown gray grey silver gold navy teal olive maroon lime aqua " +
  "fuchsia cyan magenta coral salmon tomato crimson orchid violet indigo turquoise khaki beige ivory lavender plum tan chocolate " +
  "darkred darkgreen darkblue darkorange lightblue lightgreen lightgray lightgrey skyblue steelblue royalblue tomato hotpink deeppink " +
  "forestgreen seagreen limegreen springgreen slategray dimgray whitesmoke snow mintcream honeydew aliceblue transparent").split(" "));
class Swatch extends WidgetType {
  constructor(color) { super(); this.color = color; }
  eq(o) { return o.color === this.color; }
  toDOM() { const s = document.createElement("span"); s.className = "cm-swatch"; s.setAttribute("aria-hidden", "true");
            const i = document.createElement("i"); i.style.background = this.color; s.append(i); return s; }
  ignoreEvent() { return true; }
}
const swatchMatcher = new MatchDecorator({
  regexp: /#(?:[0-9a-fA-F]{8}|[0-9a-fA-F]{6}|[0-9a-fA-F]{3,4})\b|\b(?:rgba?|hsla?)\([^)]*\)|(?<=:\s*|\s)[a-z]+(?=\s*[;}!]|\s*$)/g,
  decorate: (add, from, to, m) => {
    const v = m[0];
    if (/^[a-z]+$/.test(v) && !NAMED.has(v)) return;
    if (typeof CSS !== "undefined" && CSS.supports && !CSS.supports("color", v)) return;
    add(from, from, Decoration.widget({ widget: new Swatch(v), side: -1 }));
  }
});
const swatches = ViewPlugin.fromClass(class {
  constructor(view) { this.deco = swatchMatcher.createDeco(view); }
  update(u) { this.deco = swatchMatcher.updateDeco(u, this.deco); }
}, { decorations: v => v.deco });

/* ---------- CSS Emmet: m10 + Tab gives margin: 10px; like VS Code ---------- */
function cssEmmetAt(state, pos) {
  const line = state.doc.lineAt(pos), col = pos - line.from;
  const before = line.text.slice(0, col);
  if (/[:{]\s*[^;{}]*$/.test(before) && /:/.test(before.split(/[;{]/).pop())) return null;   /* already in a value */
  const ex = extractEmmet(line.text, col, { type: "stylesheet", lookAhead: false });
  if (!ex || !ex.abbreviation || !/^[a-z][a-z0-9.:-]*$/i.test(ex.abbreviation)) return null;
  let out;
  try { out = expandEmmet(ex.abbreviation, { type: "stylesheet", options: { "output.field": () => "" } }); } catch (e) { return null; }
  if (!out || out === ex.abbreviation || !/:/.test(out)) return null;
  return { from: line.from + ex.start, to: pos, text: out };
}

/* ---------- Emmet: ul>li*3 + Tab, like VS Code ---------- */
const TAGS = new Set(("a abbr address article aside audio b blockquote body br button caption cite code col colgroup dd del details div dl dt em " +
  "figcaption figure footer form h1 h2 h3 h4 h5 h6 head header hr html i iframe img input ins kbd label legend li link main mark meta nav " +
  "ol option p pre q s section select small source span strong style sub summary sup table tbody td textarea tfoot th thead time title tr u ul video").split(" "));
const FIELD = "\u0001";
function emmetAt(state, pos) {
  const line = state.doc.lineAt(pos), col = pos - line.from;
  const node = syntaxTree(state).resolveInner(pos, -1);
  if (/Tag|Attribute|Comment/.test(node.name) && node.name !== "Text") return null;   /* never inside a tag */
  const ex = extractEmmet(line.text, col, { type: "markup", lookAhead: false });
  if (!ex || !ex.abbreviation) return null;
  const a = ex.abbreviation;
  if (a !== "!") {
    const names = a.replace(/\{[^}]*\}/g, "").replace(/\[[^\]]*\]/g, "").split(/[>+^()]/).map(s => s.replace(/[*.#$].*$/, "")).filter(Boolean);
    if (!names.length || !names.every(n => TAGS.has(n.toLowerCase()))) return null;
  }
  return { from: line.from + ex.start, to: pos, abbr: a, indent: /^\s*/.exec(line.text)[0], simple: !/[>+*^(){}.#[]/.test(a) };
}
function emmetText(abbr, indent, lang) {
  let out = expandEmmet(abbr, { type: "markup", options: { "output.indent": "  ", "output.field": (i, p) => FIELD + (p || ""), "output.selfClosingStyle": "html" },
                               variables: { lang: lang || "hu", charset: "utf-8" } });
  return out.split("\n").map((l, i) => i ? indent + l : l).join("\n");
}
function applyEmmet(view, m, lang) {
  let text = emmetText(m.abbr, m.indent, lang);
  const marks = []; let clean = "";
  for (const ch of text) { if (ch === FIELD) marks.push(clean.length); else clean += ch; }
  const at = marks.length ? (m.abbr === "!" ? marks[marks.length - 1] : marks[0]) : clean.length;
  view.dispatch({ changes: { from: m.from, to: m.to, insert: clean }, selection: { anchor: m.from + at }, userEvent: "input.complete", scrollIntoView: true });
  return true;
}

/* ---------- renaming one tag renames its partner (VS Code's linked editing) ---------- */
const syncAnn = Annotation.define();
const setLink = StateEffect.define();
const linkField = StateField.define({
  create: () => null,
  update(v, tr) {
    for (const e of tr.effects) if (e.is(setLink)) return e.value;
    if (!v || tr.annotation(syncAnn)) return null;                 /* code replaced from outside: forget the pair */
    if (tr.docChanged) v = { a: { from: tr.changes.mapPos(v.a.from, -1), to: tr.changes.mapPos(v.a.to, 1) }, b: { from: tr.changes.mapPos(v.b.from, -1), to: tr.changes.mapPos(v.b.to, 1) } };
    const h = tr.state.selection.main.head;
    if (v.a.to - v.a.from > 40 || v.b.to - v.b.from > 40) return null;
    const inside = r => h >= r.from && h <= r.to;
    return inside(v.a) || inside(v.b) ? v : null;
  }
});
function tagPair(state, pos) {
  const tree = syntaxTree(state);
  for (const side of [-1, 1]) {
    const n = tree.resolveInner(pos, side);
    if (n.name !== "TagName" || pos < n.from || pos > n.to) continue;
    const tag = n.parent, el = tag && tag.parent;
    if (!el || el.name !== "Element" || !/^(OpenTag|CloseTag)$/.test(tag.name)) return null;
    const open = el.getChild("OpenTag"), close = el.getChild("CloseTag");
    const on = open && open.getChild("TagName"), cn = close && close.getChild("TagName");
    if (!on || !cn) return null;
    if (state.sliceDoc(on.from, on.to) !== state.sliceDoc(cn.from, cn.to)) return null;
    const self = tag.name === "OpenTag" ? on : cn, other = tag.name === "OpenTag" ? cn : on;
    return { self: { from: self.from, to: self.to }, other: { from: other.from, to: other.to } };
  }
  return null;
}
const linkedRename = EditorState.transactionFilter.of(tr => {
  if (!tr.docChanged || tr.annotation(syncAnn) || tr.isUserEvent("undo") || tr.isUserEvent("redo") || tr.isUserEvent("input.complete")) return tr;
  let fa = -1, ta = -1, n = 0;
  tr.changes.iterChangedRanges((a, b) => { fa = a; ta = b; n++; });
  if (n !== 1) return tr;
  let pair = null;
  const link = tr.startState.field(linkField, false);
  const within = r => fa >= r.from && ta <= r.to;
  if (link && within(link.a)) pair = { self: link.a, other: link.b };
  else if (link && within(link.b)) pair = { self: link.b, other: link.a };
  else { const p = tagPair(tr.startState, fa); if (p && within(p.self)) pair = p; }
  if (!pair || (fa < pair.other.to && ta > pair.other.from)) return tr;
  const s = { from: tr.changes.mapPos(pair.self.from, -1), to: tr.changes.mapPos(pair.self.to, 1) };
  const o = { from: tr.changes.mapPos(pair.other.from, -1), to: tr.changes.mapPos(pair.other.to, 1) };
  const name = (/^[A-Za-z0-9-]*/.exec(tr.newDoc.sliceString(s.from, s.to)) || [""])[0];
  s.to = s.from + name.length;
  if (tr.newDoc.sliceString(o.from, o.to) === name) return tr;
  const delta = name.length - (o.to - o.from);
  const s2 = o.from < s.from ? { from: s.from + delta, to: s.to + delta } : s;
  const o2 = { from: o.from, to: o.from + name.length };
  return [tr, { changes: { from: o.from, to: o.to, insert: name }, effects: setLink.of({ a: s2, b: o2 }), sequential: true }];
});

/* ---------- small commands ---------- */
const wrapWith = tag => view => {
  view.dispatch(view.state.changeByRange(r => {
    const inner = view.state.sliceDoc(r.from, r.to), open = `<${tag}>`, close = `</${tag}>`;
    return { changes: { from: r.from, to: r.to, insert: open + inner + close },
             range: r.empty ? EditorSelection.cursor(r.from + open.length) : EditorSelection.range(r.from + open.length, r.from + open.length + inner.length) };
  }), { userEvent: "input" });
  return true;
};
const formatAll = view => {
  const head = view.state.selection.main.head, line = view.state.doc.lineAt(head), fromEnd = line.to - head;
  view.dispatch({ selection: EditorSelection.single(0, view.state.doc.length) });
  indentSelection(view);
  const nl = view.state.doc.line(Math.min(line.number, view.state.doc.lines));
  view.dispatch({ selection: { anchor: Math.max(nl.from, nl.to - fromEnd) }, scrollIntoView: true });
  return true;
};

/* ---------- create ---------- */
export function create({ parent, doc = "", lines = false, onChange = null, onCursor = null, label = "", fit = true, lang = "hu",
                         docs = {}, phrases = {}, files = [], lint = null, fold = false, mode = "html" }) {
  const tagDoc = name => docs[(name || "").toLowerCase()];
  /* suggestions: tags and attributes explained in the students' language; attributes arrive as name="" */
  const htmlSource = ctx => {
    const r = htmlCompletionSource(ctx);
    if (!r || !r.options) return r;
    return { ...r, options: r.options.map(o => {
      if (o.type === "property") return { ...o, detail: docs["@" + o.label] || o.detail, apply: (view, c, from, to) => {
        const next = view.state.sliceDoc(to, to + 1), ins = next === "=" ? c.label : c.label + '=""';
        view.dispatch({ changes: { from, to, insert: ins }, selection: { anchor: from + c.label.length + (next === "=" ? 0 : 2) }, userEvent: "input.complete" });
      } };
      if (o.type === "type") {
        const name = o.label.replace(/^\//, ""), d = tagDoc(name);
        const opt = d ? { ...o, detail: d } : { ...o };
        if (!o.label.startsWith("/") && TAGS.has(name.toLowerCase())) opt.apply = (view, c, from, to) => {
          const st = view.state, before = st.sliceDoc(from - 1, from), rest = st.sliceDoc(to, st.doc.lineAt(to).to);
          if (before !== "<" || /^[^<]*>/.test(rest)) {                       /* renaming an existing tag: just the name */
            view.dispatch({ changes: { from, to, insert: c.label }, selection: { anchor: from + c.label.length }, userEvent: "input.complete" });
            return;
          }
          const line = st.doc.lineAt(from);
          applyEmmet(view, { from: from - 1, to, abbr: c.label, indent: /^\s*/.exec(line.text)[0] }, lang);
        };
        return opt;
      }
      return o;
    }) };
  };
  /* image file names inside src="…" */
  const fileSource = ctx => {
    if (!files.length) return null;
    const n = syntaxTree(ctx.state).resolveInner(ctx.pos, -1);
    if (!/AttributeValue/.test(n.name)) return null;
    const attr = n.parent, an = attr && attr.getChild("AttributeName");
    if (!an || ctx.state.sliceDoc(an.from, an.to).toLowerCase() !== "src") return null;
    const quoted = /^["']/.test(ctx.state.sliceDoc(n.from, n.from + 1));
    const from = n.from + (quoted ? 1 : 0);
    return { from, options: files.map(f => ({ label: f, type: "file", detail: docs["#file"] || "" })), validFor: /^[\w./-]*$/ };
  };
  /* a bare tag name at the start of a line (no "<" yet): offer the whole element */
  const tagWordSource = ctx => {
    const line = ctx.state.doc.lineAt(ctx.pos), head = line.text.slice(0, ctx.pos - line.from);
    const m = /^(\s*)([a-z][a-z0-9]*)$/.exec(head);
    if (!m) return null;
    const node = syntaxTree(ctx.state).resolveInner(ctx.pos, -1);
    if (/Tag|Attribute|Comment/.test(node.name) && node.name !== "Text") return null;
    if (ctx.state.sliceDoc(ctx.pos, ctx.pos + 1).match(/[a-z0-9]/i)) return null;
    const word = m[2], from = ctx.pos - word.length;
    const names = [...TAGS].filter(t => t.startsWith(word) && !["html", "head", "body"].includes(t) || t === word);
    if (!names.length) return null;
    return { from, validFor: /^[a-z0-9]*$/, options: names.map(t => ({ label: t, type: "type", detail: (docs[t] ? docs[t] + " · " : "") + "<" + t + ">",
      boost: t === word ? 20 : -t.length, apply: (view, c, f, to) => applyEmmet(view, { from: f, to, abbr: t, indent: m[1] }, lang) })) };
  };
  /* Emmet shows up in the suggestion list too, so students discover it */
  const emmetSource = ctx => {
    const m = emmetAt(ctx.state, ctx.pos);
    if (!m || m.simple || m.abbr.length < 3) return null;
    return { from: m.from, filter: false, options: [{ label: m.abbr, detail: docs["#emmet"] || "Emmet", type: "keyword", boost: 99,
      apply: view => applyEmmet(view, { ...m, to: view.state.selection.main.head }, lang) }] };
  };
  const tabKey = view => {
    if (completionStatus(view.state) === "active") return acceptCompletion(view);
    const pos = view.state.selection.main;
    if (pos.empty && mode === "css") {
      const m = cssEmmetAt(view.state, pos.head);
      if (m) { view.dispatch({ changes: { from: m.from, to: m.to, insert: m.text }, selection: { anchor: m.from + m.text.length }, userEvent: "input.complete" }); return true; }
      return false;
    }
    if (pos.empty) { const m = emmetAt(view.state, pos.head); if (m) return applyEmmet(view, m, lang); }
    return false;
  };
  /* CSS suggestions: property names explained in the students' language, a colon and a space added */
  const cssSource = ctx => {
    const r = cssCompletionSource(ctx);
    if (!r || !r.options) return r;
    return { ...r, options: r.options.map(o => {
      if (o.type !== "property") return o;
      const d = docs["css:" + o.label];
      return { ...o, detail: d || o.detail, boost: d ? 5 : 0, apply: (view, c, from, to) => {
        const next = view.state.sliceDoc(to, to + 1), ins = next === ":" ? c.label : c.label + ": ";
        view.dispatch({ changes: { from, to, insert: ins }, selection: { anchor: from + ins.length }, userEvent: "input.complete" });
      } };
    }) };
  };
  const cssHover = hoverTooltip((view, pos, side) => {
    const n = syntaxTree(view.state).resolveInner(pos, side);
    if (n.name !== "PropertyName") return null;
    const name = view.state.sliceDoc(n.from, n.to).toLowerCase(), text = docs["css:" + name];
    if (!text) return null;
    return { pos: n.from, end: n.to, above: true, create() {
      const d = document.createElement("div"); d.className = "cm-doc";
      const b = document.createElement("b"); b.textContent = name; d.append(b, document.createTextNode(" " + text));
      return { dom: d };
    } };
  }, { hoverTime: 350 });
  const langFor = m => m === "css"
    ? [css(), autocompletion({ icons: false, override: [cssSource], activateOnTypingDelay: 60 }), cssHover, swatches]
    : [html({ autoCloseTags: true, matchClosingTags: true }),
       autocompletion({ icons: false, override: [emmetSource, tagWordSource, fileSource, htmlSource], activateOnTypingDelay: 60 }),
       hover, linkField, linkedRename];
  const langComp = new Compartment();
  let flashTimer = 0;
  const hover = hoverTooltip((view, pos, side) => {
    const n = syntaxTree(view.state).resolveInner(pos, side);
    let key = null, shown = "";
    if (n.name === "TagName") { shown = view.state.sliceDoc(n.from, n.to).toLowerCase(); key = shown; shown = `<${shown}>`; }
    else if (n.name === "AttributeName") { shown = view.state.sliceDoc(n.from, n.to).toLowerCase(); key = "@" + shown; }
    const text = key && docs[key];
    if (!text) return null;
    return { pos: n.from, end: n.to, above: true, create() {
      const d = document.createElement("div"); d.className = "cm-doc";
      const b = document.createElement("b"); b.textContent = shown; d.append(b, document.createTextNode(" " + text));
      return { dom: d };
    } };
  }, { hoverTime: 350 });

  const ext = [
    highlightSpecialChars(), history(), drawSelection(), dropCursor(), EditorState.allowMultipleSelections.of(true),
    rectangularSelection(), crosshairCursor(), highlightSelectionMatches(),
    indentUnit.of("  "), EditorState.tabSize.of(2), EditorState.phrases.of(phrases),
    indentOnInput(), bracketMatching(), closeBrackets(), flashField,
    langComp.of(langFor(mode)),
    syntaxHighlighting(style), theme, search({ top: false }),
    indentationMarkers({ thickness: 1, colors: { light: "#33433c", dark: "#33433c", activeLight: "#5b7a6c", activeDark: "#5b7a6c" } }),
    keymap.of([
      { key: "Tab", run: tabKey },
      { key: "Mod-b", run: v => mode === "html" && wrapWith("strong")(v) }, { key: "Mod-i", run: v => mode === "html" && wrapWith("em")(v) },
      { key: "Shift-Alt-f", run: formatAll },
      ...closeBracketsKeymap, ...completionKeymap, ...searchKeymap, ...foldKeymap, ...historyKeymap, indentWithTab, ...defaultKeymap
    ]),
    EditorView.contentAttributes.of({ "aria-label": label, spellcheck: "false", autocapitalize: "off", autocorrect: "off" }),
    EditorView.updateListener.of(u => {
      if (u.docChanged && onChange) onChange(u.state.doc.toString());
      if (onCursor && (u.selectionSet || u.docChanged)) { const h = u.state.selection.main.head, l = u.state.doc.lineAt(h); onCursor(l.number, h - l.from + 1, u.state.doc.lines); }
    }),
  ];
  if (lines) ext.push(lineNumbers(), highlightActiveLineGutter(), highlightActiveLine());
  if (fold) ext.push(codeFolding(), foldGutter({ openText: "⌄", closedText: "›" }));
  if (fit) ext.push(EditorView.lineWrapping);
  if (lint) ext.push(lintGutter(), linter(view => lint(view.state.doc.toString()).map(w => {
    const len = view.state.doc.length, L = view.state.doc.line(Math.min(Math.max(1, w.line), view.state.doc.lines));
    const ind = /^\s*/.exec(L.text)[0].length;
    /* a checker that knows the exact spot underlines just that; otherwise the whole line. Tips get a calmer mark. */
    const exact = typeof w.from === "number" && w.from <= len;
    const from = exact ? w.from : L.from + ind, to = exact ? Math.min(len, Math.max(w.to, w.from + 1)) : Math.max(L.from + ind, L.to);
    return { from, to, severity: w.tip ? "info" : "warning", message: w.html.replace(/<[^>]+>/g, "").replace(/&lt;/g, "<").replace(/&gt;/g, ">"),
             renderMessage: () => { const s = document.createElement("span"); s.innerHTML = w.html; return s; } };
  }), { delay: 450 }));
  const view = new EditorView({ parent, state: EditorState.create({ doc, extensions: ext }) });
  return {
    view,
    get: () => view.state.doc.toString(),
    set: v => { if (v !== view.state.doc.toString()) view.dispatch({ changes: { from: 0, to: view.state.doc.length, insert: v }, annotations: syncAnn.of(true) }); },
    focus: () => view.focus(),
    format: () => { formatAll(view); view.focus(); },
    search: () => { openSearchPanel(view); },
    /* switch between an HTML page and a CSS file in the same editor; the new text replaces the old */
    setMode: (m, text) => {
      mode = m === "css" ? "css" : "html";
      view.dispatch({ effects: langComp.reconfigure(langFor(mode)),
                      changes: text == null ? undefined : { from: 0, to: view.state.doc.length, insert: text }, annotations: syncAnn.of(true) });
    },
    get mode() { return mode; },
    /* light up from..to (a whole element), select its opening tag, and bring it to the middle of the editor */
    flash: (from, to, sel) => {
      const len = view.state.doc.length; from = Math.min(from, len); to = Math.min(Math.max(to, from), len);
      view.dispatch({ effects: [setFlash.of(null)] });
      view.dispatch({ effects: [setFlash.of({ from, to }), EditorView.scrollIntoView(from, { y: "center" })],
                      selection: sel ? { anchor: Math.min(sel.anchor, len), head: Math.min(sel.head, len) } : undefined });
      view.focus();
      clearTimeout(flashTimer); flashTimer = setTimeout(() => view.dispatch({ effects: setFlash.of(null) }), 4200);
    },
  };
}
