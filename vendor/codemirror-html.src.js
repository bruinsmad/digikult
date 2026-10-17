import { EditorView, keymap, lineNumbers, highlightActiveLine, highlightActiveLineGutter, drawSelection, dropCursor, highlightSpecialChars } from "@codemirror/view";
import { EditorState } from "@codemirror/state";
import { defaultKeymap, history, historyKeymap, indentWithTab } from "@codemirror/commands";
import { indentOnInput, bracketMatching, syntaxHighlighting, HighlightStyle, indentUnit } from "@codemirror/language";
import { autocompletion, closeBrackets, closeBracketsKeymap, completionKeymap } from "@codemirror/autocomplete";
import { html, htmlCompletionSource } from "@codemirror/lang-html";
import { tags as t } from "@lezer/highlight";

/* colours match the static code blocks on the site */
const style = HighlightStyle.define([
  { tag: t.tagName, color: "#f2d264", fontWeight: "700" },
  { tag: t.attributeName, color: "#9cc8e8" },
  { tag: t.attributeValue, color: "#a8dba0" },
  { tag: [t.angleBracket, t.definitionOperator, t.operator, t.punctuation], color: "#c9d3cc" },
  { tag: t.comment, color: "#8fa39a", fontStyle: "italic" },
  { tag: [t.documentMeta, t.character, t.processingInstruction], color: "#f0a3b8" },
  { tag: t.invalid, color: "#ff8a80" },
]);

const theme = EditorView.theme({
  "&": { color: "#e9efe9", backgroundColor: "#1f2a26", fontSize: "var(--code-size, 15px)", height: "100%" },
  ".cm-scroller": { fontFamily: "'JetBrains Mono', ui-monospace, Menlo, Consolas, monospace", lineHeight: "1.6" },
  ".cm-content": { padding: "12px 0", caretColor: "#f2d264" },
  ".cm-line": { padding: "0 14px" },
  "&.cm-focused": { outline: "2px solid rgba(242,210,100,.5)", outlineOffset: "-2px" },
  "&.cm-focused .cm-cursor": { borderLeftColor: "#f2d264", borderLeftWidth: "2px" },
  "&.cm-focused .cm-selectionBackground, .cm-selectionBackground, ::selection": { backgroundColor: "rgba(242,210,100,.28)" },
  ".cm-gutters": { backgroundColor: "#1a2420", color: "#6f857c", border: "none", borderRight: "1px solid #2c3a34" },
  ".cm-lineNumbers .cm-gutterElement": { padding: "0 8px 0 10px", minWidth: "34px" },
  ".cm-activeLine": { backgroundColor: "rgba(255,255,255,.04)" },
  ".cm-activeLineGutter": { backgroundColor: "rgba(255,255,255,.06)", color: "#c9d3cc" },
  "&.cm-focused .cm-matchingBracket": { backgroundColor: "rgba(168,219,160,.25)", outline: "1px solid rgba(168,219,160,.5)" },
  ".cm-tooltip": { border: "1px solid #3a4a44", backgroundColor: "#24312c", color: "#e9efe9", borderRadius: "8px", overflow: "hidden" },
  ".cm-tooltip-autocomplete > ul": { fontFamily: "'JetBrains Mono', ui-monospace, monospace", fontSize: "14px", maxHeight: "14em" },
  ".cm-tooltip-autocomplete > ul > li": { padding: "3px 10px" },
  ".cm-tooltip-autocomplete > ul > li[aria-selected]": { backgroundColor: "#2f7a5a", color: "#fff" },
  ".cm-completionIcon": { display: "none" },
  ".cm-completionDetail": { color: "#9fb3aa", fontStyle: "normal", marginLeft: "1em" },
}, { dark: true });

/* attribute completions insert name="" and put the cursor between the quotes */
function withQuotes(ctx) {
  const r = htmlCompletionSource(ctx);
  if (!r || !r.options) return r;
  return { ...r, options: r.options.map(o => o.type !== "property" ? o : { ...o, apply: (view, c, from, to) => {
    const next = view.state.sliceDoc(to, to + 1);
    if (next === "=") { view.dispatch({ changes: { from, to, insert: c.label }, selection: { anchor: from + c.label.length + 2 } }); return; }
    view.dispatch({ changes: { from, to, insert: c.label + '=""' }, selection: { anchor: from + c.label.length + 2 } });
  } }) };
}

export function create({ parent, doc = "", lines = false, onChange = null, label = "", fit = false }) {
  const ext = [
    highlightSpecialChars(), history(), drawSelection(), dropCursor(),
    indentUnit.of("  "), EditorState.tabSize.of(2),
    indentOnInput(), bracketMatching(), closeBrackets(),
    autocompletion({ icons: false, override: [withQuotes] }),
    html({ autoCloseTags: true, matchClosingTags: true }),
    syntaxHighlighting(style), theme,
    keymap.of([...closeBracketsKeymap, ...completionKeymap, ...historyKeymap, indentWithTab, ...defaultKeymap]),
    EditorView.contentAttributes.of({ "aria-label": label, spellcheck: "false", autocapitalize: "off", autocorrect: "off" }),
    EditorView.updateListener.of(u => { if (u.docChanged && onChange) onChange(u.state.doc.toString()); }),
  ];
  if (lines) ext.push(lineNumbers(), highlightActiveLineGutter(), highlightActiveLine());
  if (fit) ext.push(EditorView.lineWrapping);
  const view = new EditorView({ parent, state: EditorState.create({ doc, extensions: ext }) });
  return {
    view,
    get: () => view.state.doc.toString(),
    set: v => { if (v !== view.state.doc.toString()) view.dispatch({ changes: { from: 0, to: view.state.doc.length, insert: v } }); },
    focus: () => view.focus(),
  };
}
