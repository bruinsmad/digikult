/* Beginner mistake checker for the HTML editor.
   DKCheck.html(src, ctx) and DKCheck.css(src, ctx) return
   [{ from, to, line, html, tip }]: a plain-language explanation of each mistake and how to fix it.
   tip: true marks good-practice advice; everything else stops the page working as intended.
   ctx: { lang: "hu" | "en", files: [names that exist] (optional), page: html of the page a CSS file styles (optional) } */
(function () {
  "use strict";
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const C = s => `<code>${esc(s)}</code>`;
  const tag = t => C(`<${t}>`), ctag = t => C(`</${t}>`);
  const az = w => /^[aeiouáéíóöőúüű]/i.test(String(w).replace(/^[<\/#.]+/, "")) ? "az" : "a";
  const Az = w => az(w) === "az" ? "Az" : "A";

  /* ---------- what exists ---------- */
  const set = s => new Set(s.split(/\s+/));
  const TAGS = set(`a abbr address area article aside audio b base bdi bdo blockquote body br button canvas caption cite code col colgroup
    data datalist dd del details dfn dialog div dl dt em embed fieldset figcaption figure footer form h1 h2 h3 h4 h5 h6 head header hgroup hr html
    i iframe img input ins kbd label legend li link main map mark menu meta meter nav noscript object ol optgroup option output p picture pre
    progress q rp rt ruby s samp script search section select slot small source span strong style sub summary sup svg table tbody td template
    textarea tfoot th thead time title tr track u ul var video wbr math`);
  const OBSOLETE = { center: "text-align: center", font: "color, font-family, font-size", big: "font-size", strike: "text-decoration: line-through",
    tt: "font-family: monospace", marquee: "animation", blink: "animation", acronym: "<abbr>" };
  const VOID = set("area base br col embed hr img input link meta source track wbr");
  const BLOCK = set("address article aside blockquote details dialog div dl fieldset figcaption figure footer form h1 h2 h3 h4 h5 h6 header hgroup hr main menu nav ol p pre section table ul");
  const HEAD_OK = set("title meta link style script base noscript template");
  const GLOBAL_ATTR = set("id class style title lang dir hidden tabindex contenteditable draggable spellcheck translate accesskey role inert popover slot is part autofocus");
  const ATTR = {
    a: "href target rel download hreflang type name ping referrerpolicy", img: "src alt width height loading srcset sizes decoding usemap ismap crossorigin border align referrerpolicy fetchpriority",
    table: "border cellpadding cellspacing width summary align bgcolor", td: "colspan rowspan headers width height align valign bgcolor", th: "colspan rowspan headers scope abbr width height align valign bgcolor",
    tr: "align valign bgcolor", meta: "charset name content http-equiv property media", link: "rel href type media sizes hreflang crossorigin as integrity referrerpolicy title disabled",
    html: "lang xmlns", script: "src type defer async crossorigin integrity nomodule referrerpolicy", style: "media type", body: "bgcolor text background",
    input: "type name value placeholder required checked disabled readonly min max step size maxlength minlength pattern autocomplete list multiple accept form alt src width height",
    button: "type name value disabled form popovertarget", form: "action method name target autocomplete novalidate enctype accept-charset", label: "for form",
    select: "name required disabled multiple size form autocomplete", textarea: "name required disabled rows cols placeholder maxlength minlength readonly wrap form autocomplete",
    option: "value selected disabled label", optgroup: "label disabled", fieldset: "disabled form name", output: "for form name",
    iframe: "src srcdoc width height allow allowfullscreen loading name frameborder referrerpolicy sandbox scrolling",
    video: "src controls autoplay loop muted poster width height preload playsinline crossorigin", audio: "src controls autoplay loop muted preload crossorigin",
    source: "src srcset type media sizes width height", track: "src kind srclang label default", ol: "start reversed type", ul: "type", li: "value",
    q: "cite", blockquote: "cite", del: "cite datetime", ins: "cite datetime", time: "datetime", data: "value", col: "span width", colgroup: "span width",
    area: "alt coords href shape target download rel", map: "name", details: "open name", dialog: "open", progress: "value max", meter: "value min max low high optimum",
    canvas: "width height", embed: "src type width height", object: "data type width height name form", font: "color size face", hr: "size width color noshade align",
    p: "align", div: "align", h1: "align", h2: "align", h3: "align", base: "href target", abbr: "", svg: "viewbox width height xmlns fill stroke"
  };
  Object.keys(ATTR).forEach(k => ATTR[k] = set(ATTR[k]));
  const ALL_ATTR = new Set([...GLOBAL_ATTR, ...Object.values(ATTR).flatMap(s => [...s])].filter(Boolean));

  const PROPS = set(`accent-color align-content align-items align-self all animation animation-name animation-duration animation-timing-function animation-delay
    animation-iteration-count animation-direction animation-fill-mode animation-play-state appearance aspect-ratio backdrop-filter backface-visibility
    background background-attachment background-blend-mode background-clip background-color background-image background-origin background-position
    background-position-x background-position-y background-repeat background-size block-size border border-block border-block-end border-block-start
    border-bottom border-bottom-color border-bottom-left-radius border-bottom-right-radius border-bottom-style border-bottom-width border-collapse
    border-color border-end-end-radius border-end-start-radius border-image border-inline border-inline-end border-inline-start border-left
    border-left-color border-left-style border-left-width border-radius border-right border-right-color border-right-style border-right-width
    border-spacing border-start-end-radius border-start-start-radius border-style border-top border-top-color border-top-left-radius
    border-top-right-radius border-top-style border-top-width border-width bottom box-decoration-break box-shadow box-sizing break-after break-before
    break-inside caption-side caret-color clear clip clip-path color color-scheme column-count column-fill column-gap column-rule column-rule-color
    column-rule-style column-rule-width column-span column-width columns contain container container-name container-type content content-visibility
    counter-increment counter-reset counter-set cursor direction display empty-cells fill fill-opacity filter flex flex-basis flex-direction flex-flow
    flex-grow flex-shrink flex-wrap float font font-display font-family font-feature-settings font-kerning font-optical-sizing font-size
    font-size-adjust font-stretch font-style font-synthesis font-variant font-variant-caps font-variant-numeric font-variation-settings font-weight
    gap grid grid-area grid-auto-columns grid-auto-flow grid-auto-rows grid-column grid-column-end grid-column-gap grid-column-start grid-gap grid-row
    grid-row-end grid-row-gap grid-row-start grid-template grid-template-areas grid-template-columns grid-template-rows height hyphens image-rendering
    inline-size inset inset-block inset-inline isolation justify-content justify-items justify-self left letter-spacing line-height line-clamp list-style
    list-style-image list-style-position list-style-type margin margin-block margin-block-end margin-block-start margin-bottom margin-inline
    margin-inline-end margin-inline-start margin-left margin-right margin-top mask max-block-size max-height max-inline-size max-width min-block-size
    min-height min-inline-size min-width mix-blend-mode object-fit object-position offset opacity order orphans outline outline-color outline-offset
    outline-style outline-width overflow overflow-wrap overflow-x overflow-y overscroll-behavior padding padding-block padding-bottom padding-inline
    padding-left padding-right padding-top page-break-after page-break-before page-break-inside paint-order perspective perspective-origin
    place-content place-items place-self pointer-events position print-color-adjust quotes resize right rotate row-gap scale scroll-behavior
    scroll-margin scroll-margin-top scroll-padding scroll-padding-top scroll-snap-align scroll-snap-type scrollbar-color scrollbar-gutter scrollbar-width
    shape-outside src stroke stroke-dasharray stroke-linecap stroke-linejoin stroke-opacity stroke-width tab-size table-layout text-align
    text-align-last text-combine-upright text-decoration text-decoration-color text-decoration-line text-decoration-skip-ink text-decoration-style
    text-decoration-thickness text-emphasis text-indent text-justify text-orientation text-overflow text-rendering text-shadow text-transform
    text-underline-offset text-underline-position text-wrap top touch-action transform transform-origin transform-style transition transition-delay
    transition-duration transition-property transition-timing-function translate unicode-bidi unicode-range user-select vertical-align view-transition-name
    visibility white-space widows width will-change word-break word-spacing word-wrap writing-mode z-index zoom`);
  const PROP_FIX = { "colour": "color", "text-color": "color", "font-color": "color", "fontcolor": "color", "font-colour": "color", "text-colour": "color",
    "background-colour": "background-color", "bg-color": "background-color", "bgcolor": "background-color", "backgroundcolor": "background-color",
    "text-size": "font-size", "font-height": "font-size", "fontsize": "font-size", "size": "font-size", "align": "text-align", "text-alignment": "text-align",
    "font-bold": "font-weight", "bold": "font-weight", "italic": "font-style", "underline": "text-decoration", "font": "font",
    "szín": "color", "szin": "color", "háttér": "background", "hatter": "background", "méret": "font-size", "betűméret": "font-size",
    "border-colour": "border-color", "spacing": "letter-spacing", "radius": "border-radius", "corner-radius": "border-radius", "round": "border-radius" };
  const COLORS = set(`aliceblue antiquewhite aqua aquamarine azure beige bisque black blanchedalmond blue blueviolet brown burlywood cadetblue chartreuse
    chocolate coral cornflowerblue cornsilk crimson cyan darkblue darkcyan darkgoldenrod darkgray darkgreen darkgrey darkkhaki darkmagenta darkolivegreen
    darkorange darkorchid darkred darksalmon darkseagreen darkslateblue darkslategray darkslategrey darkturquoise darkviolet deeppink deepskyblue dimgray
    dimgrey dodgerblue firebrick floralwhite forestgreen fuchsia gainsboro ghostwhite gold goldenrod gray green greenyellow grey honeydew hotpink indianred
    indigo ivory khaki lavender lavenderblush lawngreen lemonchiffon lightblue lightcoral lightcyan lightgoldenrodyellow lightgray lightgreen lightgrey
    lightpink lightsalmon lightseagreen lightskyblue lightslategray lightslategrey lightsteelblue lightyellow lime limegreen linen magenta maroon
    mediumaquamarine mediumblue mediumorchid mediumpurple mediumseagreen mediumslateblue mediumspringgreen mediumturquoise mediumvioletred midnightblue
    mintcream mistyrose moccasin navajowhite navy oldlace olive olivedrab orange orangered orchid palegoldenrod palegreen paleturquoise palevioletred
    papayawhip peachpuff peru pink plum powderblue purple rebeccapurple red rosybrown royalblue saddlebrown salmon sandybrown seagreen seashell sienna
    silver skyblue slateblue slategray slategrey snow springgreen steelblue tan teal thistle tomato turquoise violet wheat white whitesmoke yellow yellowgreen
    transparent currentcolor`);
  const HU_COLORS = { piros: "red", vörös: "red", voros: "red", kék: "blue", kek: "blue", zöld: "green", zold: "green", sárga: "yellow", sarga: "yellow",
    fekete: "black", fehér: "white", feher: "white", szürke: "gray", szurke: "gray", narancs: "orange", narancssárga: "orange", lila: "purple",
    rózsaszín: "pink", rozsaszin: "pink", barna: "brown", arany: "gold", ezüst: "silver", türkiz: "turquoise", bordó: "maroon", égszínkék: "skyblue" };
  const GLOBAL_KW = set("inherit initial unset revert revert-layer");
  const KW = {
    "text-align": "left right center justify start end match-parent", "display": "block inline inline-block flex inline-flex grid inline-grid none contents table table-row table-cell table-caption inline-table list-item flow-root",
    "position": "static relative absolute fixed sticky", "float": "left right none inline-start inline-end", "clear": "left right both none inline-start inline-end",
    "font-style": "normal italic oblique", "font-weight": "normal bold bolder lighter", "text-transform": "none uppercase lowercase capitalize full-width",
    "visibility": "visible hidden collapse", "overflow": "visible hidden scroll auto clip", "overflow-x": "visible hidden scroll auto clip", "overflow-y": "visible hidden scroll auto clip",
    "white-space": "normal nowrap pre pre-wrap pre-line break-spaces", "box-sizing": "content-box border-box", "text-decoration-line": "none underline overline line-through",
    "list-style-type": "disc circle square decimal none lower-alpha upper-alpha lower-roman upper-roman lower-latin upper-latin decimal-leading-zero lower-greek",
    "cursor": "pointer default auto text move not-allowed help wait crosshair grab grabbing none progress zoom-in zoom-out copy cell context-menu col-resize row-resize",
    "flex-direction": "row row-reverse column column-reverse", "flex-wrap": "nowrap wrap wrap-reverse", "border-style": "none hidden dotted dashed solid double groove ridge inset outset",
    "justify-content": "flex-start flex-end center space-between space-around space-evenly start end left right normal stretch",
    "align-items": "flex-start flex-end center baseline stretch start end normal self-start self-end", "vertical-align": "baseline top middle bottom sub super text-top text-bottom",
    "object-fit": "fill contain cover none scale-down", "background-repeat": "repeat repeat-x repeat-y no-repeat space round", "background-size": "auto cover contain",
    "text-decoration": "none underline overline line-through"
  };
  Object.keys(KW).forEach(k => KW[k] = set(KW[k]));
  const KW_FIX = { centre: "center", centered: "center", centred: "center", middle: "center", közép: "center", kozep: "center", bal: "left", jobb: "right",
    italics: "italic", dőlt: "italic", félkövér: "bold", vastag: "bold", underlined: "underline", hide: "none", hidden: "none", invisible: "hidden",
    "inline block": "inline-block", inlineblock: "inline-block", nowrap: "nowrap", uppercased: "uppercase", capital: "capitalize", capitals: "uppercase",
    hand: "pointer", center: "middle", "line-trough": "line-through", "linethrough": "line-through", "strike": "line-through", "no-repeat": "no-repeat", norepeat: "no-repeat" };
  const UNIT_PROPS = new Set(["width", "height", "min-width", "max-width", "min-height", "max-height", "font-size", "top", "right", "bottom", "left",
    "inset", "gap", "row-gap", "column-gap", "letter-spacing", "word-spacing", "text-indent", "outline-width", "outline-offset", "flex-basis",
    "border-width", "border-radius", "padding", "margin", "border", "outline", "border-spacing", "text-underline-offset", "text-decoration-thickness",
    "column-width", "scroll-margin", "scroll-padding", "block-size", "inline-size"]);
  const needsUnit = p => UNIT_PROPS.has(p) || /^(margin|padding|inset|scroll-(margin|padding))-/.test(p) || /^border-.*(width|radius)$/.test(p) || /^border-(top|right|bottom|left)$/.test(p);
  const COLOR_PROPS = p => p === "color" || p === "fill" || p === "stroke" || /-color$/.test(p);
  const BORDER_WORDS = set("none hidden dotted dashed solid double groove ridge inset outset thin medium thick");
  const QUOTE_OK = set("font-family font content quotes grid-template-areas grid-area font-feature-settings font-variation-settings src counter-reset counter-increment list-style-type list-style unicode-range");

  /* closest spelling, counting a swapped pair of letters as one slip */
  function dist(a, b){
    if (Math.abs(a.length - b.length) > 2) return 9;
    const d = Array.from({ length: a.length + 1 }, (_, i) => [i]);
    for (let j = 1; j <= b.length; j++) d[0][j] = j;
    for (let i = 1; i <= a.length; i++) for (let j = 1; j <= b.length; j++) {
      d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) d[i][j] = Math.min(d[i][j], d[i - 2][j - 2] + 1);
    }
    return d[a.length][b.length];
  }
  function near(w, list){
    let best = null, bd = (w.length <= 3 ? 1 : w.length <= 6 ? 2 : 3) + 1;
    for (const x of list) { const k = dist(w, x); if (k > 0 && k < bd) { best = x; bd = k; } }
    return best;
  }
  /* words beginners reach for that aren't HTML */
  const TAG_FIX = { paragraph: "p", par: "p", image: "img", picture: "img", heading: "h1", header1: "h1", list: "ul", bold: "strong", italic: "em",
    break: "br", linebreak: "br", box: "div", href: "a", link: "a", url: "a", line: "hr", row: "tr", cell: "td", bekezdes: "p", kep: "img", cim: "h1" };

  /* ---------- messages ---------- */
  const MSG = {
    en: {
      line: n => `Line ${n}`, tip: "Tip", none: "✓ no mistakes", status: (e, t) => [e ? `⚠ ${e} mistake${e > 1 ? "s" : ""}` : "✓ no mistakes", t ? `${t} tip${t > 1 ? "s" : ""}` : ""].filter(Boolean).join(" · "),
      more: n => `…and ${n} more. Fix the ones above first: often the rest go away with them.`,
      unclosedComment: () => `This comment is never closed, so everything after it is hidden. End it with ${C("-->")}.`,
      noDoctype: () => `Start the file with ${C("<!DOCTYPE html>")}. Without it the browser falls back to an old, quirky way of drawing the page.`,
      doctypeFirst: () => `${C("<!DOCTYPE html>")} has to be the very first thing in the file.`,
      badDoctype: () => `Write the doctype exactly like this: ${C("<!DOCTYPE html>")}.`,
      spaceAfterLt: (raw, fix) => `There's a space after ${C("<")}, so the browser shows ${C(raw)} as text instead of reading it as a tag. Write ${C(fix)}.`,
      missingGt: t => `This tag isn't finished: the ${C(">")} is missing after ${C("<" + t)}.`,
      oddQuote: t => `A quote mark is missing in ${tag(t)}. Every value needs one ${C('"')} before it and one after it.`,
      curly: () => `This tag uses curly quotes (“ ”), probably copied from a word processor. HTML only understands straight ones: ${C('"')}.`,
      unknownTag: (t, s) => s ? `There is no ${tag(t)} tag. Did you mean ${tag(s)}?` : `There is no ${tag(t)} tag in HTML. Check the spelling.`,
      h7: t => `There is no ${tag(t)}: headings only go from ${tag("h1")} to ${tag("h6")}.`,
      obsolete: (t, use) => `${tag(t)} is outdated. Use CSS instead: ${C(use)}.`,
      selfClose: t => `${tag(t)} can't close itself with ${C("/>")}. Write ${C(`<${t}></${t}>`)}.`,
      voidClose: t => `${tag(t)} is an empty element: it has no closing tag. Delete ${ctag(t)}.`,
      stray: t => `${ctag(t)} closes something that was never opened. Delete it, or add ${tag(t)} where it should start.`,
      cross: (a, b) => `Tags closed in the wrong order: ${tag(a)} was opened inside ${tag(b)}, so close ${ctag(a)} first, then ${ctag(b)}.`,
      unclosed: t => `${tag(t)} is never closed. Add ${ctag(t)} where it should end.`,
      outside: () => `This is after ${ctag("body")}, outside the page. Move it up, before ${ctag("body")}.`,
      inHead: t => `${tag(t)} is something you see, so it belongs in ${tag("body")}, not in ${tag("head")}.`,
      headText: () => `Text in ${tag("head")} isn't shown on the page. Put it in ${tag("title")} or move it into ${tag("body")}.`,
      dup: t => `This is a second ${tag(t)}. A page can only have one.`,
      headAfterBody: () => `${tag("head")} has to come before ${tag("body")}.`,
      liParent: () => `A list item ${tag("li")} must be inside ${tag("ul")} or ${tag("ol")}.`,
      listChild: t => `Only ${tag("li")} can go directly inside a list. Put ${tag(t)} inside an ${tag("li")}.`,
      listText: () => `Text directly inside a list must go into an ${tag("li")}.`,
      trParent: () => `A table row ${tag("tr")} must be inside ${tag("table")}.`,
      tdParent: t => `${tag(t)} is a cell, so it must be inside a row: ${tag("tr")}.`,
      trChild: t => `Only cells, ${tag("td")} or ${tag("th")}, can go directly in a row. Put ${tag(t)} inside a ${tag("td")}.`,
      tableChild: t => `${tag(t)} can't go directly in a table. Put it inside a cell ${tag("td")}.`,
      tableText: () => `Text in a table must go inside a cell: ${tag("td")} or ${tag("th")}.`,
      blockInP: t => `A paragraph ${tag("p")} can't contain ${tag(t)}. Close it with ${ctag("p")} before ${tag(t)}.`,
      blockInH: (t, h) => `${tag(t)} can't go inside the heading ${tag(h)}. Close the heading first.`,
      aInA: () => `A link can't contain another link. Close the first one with ${ctag("a")} before starting the next.`,
      imgNoSrc: () => `This ${tag("img")} has no ${C("src")}, so there's no picture to show. Add ${C('src="file name"')}.`,
      imgNoAlt: () => `Give the image an ${C("alt")}: a few words for people who can't see it, and for when it doesn't load.`,
      aNoHref: () => `This link has no ${C("href")}, so it doesn't go anywhere.`,
      imgHref: () => `Images use ${C("src")}, not ${C("href")}: ${C('<img src="…">')}.`,
      aSrc: () => `Links use ${C("href")}, not ${C("src")}: ${C('<a href="…">')}.`,
      linkSrc: () => `${tag("link")} uses ${C("href")}, not ${C("src")}: ${C('<link rel="stylesheet" href="style.css">')}.`,
      linkNoRel: () => `The browser doesn't know what this ${tag("link")} is for. Add ${C('rel="stylesheet"')}.`,
      linkInBody: () => `${tag("link")} belongs in ${tag("head")}.`,
      missingEq: a => `An ${C("=")} is missing after ${C(a)}: write ${C(a + '="…"')}.`,
      noSpaceAttr: () => `Put a space between the two attributes.`,
      valueSpaces: (a, v) => `The value of ${C(a)} has a space in it, so it needs quotes: ${C(`${a}="${v}"`)}.`,
      dupAttr: (a, t) => `${tag(t)} has ${C(a)} twice. Only the first one counts${a === "class" ? ": put all the class names in one, with spaces between them" : ""}.`,
      attrElsewhere: (a, t) => `${C(a)} does nothing on ${tag(t)}.`,
      unknownAttr: (a, s) => s ? `There is no ${C(a)} attribute. Did you mean ${C(s)}?` : `There is no ${C(a)} attribute in HTML. Check the spelling.`,
      target: v => `Write it with an underscore: ${C(`target="_${v}"`)}.`,
      attrPx: (a, n) => `In HTML ${C(a)} takes just the number of pixels: ${C(`${a}="${n}"`)}, without px.`,
      idSpace: fix => `An ${C("id")} can't have spaces. Use a hyphen: ${C(`id="${fix}"`)}.`,
      dupId: v => `Two elements have ${C(`id="${v}"`)}. An id must be unique; use a class for things that repeat.`,
      noAnchor: v => `This link points to ${C("#" + v)}, but no element has ${C(`id="${v}"`)}.`,
      emptyRef: a => `${C(a)} is empty.`,
      noColonUrl: fix => `The address is missing its colon: ${C(fix)}.`,
      www: v => `Start web addresses with ${C("https://")}: ${C("https://" + v)}. Without it the browser looks for a file called “${esc(v)}”.`,
      localPath: (v, b) => `${C(v)} points to a folder on your own computer, so it won't work anywhere else. Use just the file name: ${C(b)}.`,
      backslash: fix => `Use ${C("/")} in file paths, not ${C("\\")}: ${C(fix)}.`,
      caseFile: (v, f) => `Upper and lower case matter in file names: you have ${C(f)}, not ${C(v)}.`,
      extFile: (v, f) => `There's no ${C(v)}, but there is ${C(f)}. Check the ending.`,
      nearFile: (v, f) => `There's no file called ${C(v)}. Did you mean ${C(f)}?`,
      missingFile: (v, k) => `There's no file called ${C(v)}. ` + (k === "img" ? "Upload it under Images, or check the name." : k === "css" ? "Create it with New, as a CSS file." : "Create it with New, or check the name."),
      headingSkip: (a, b) => `This ${tag("h" + b)} comes after an ${tag("h" + a)} with no ${tag("h" + (a + 1))} in between. Headings go down one level at a time.`,
      noTitle: () => `The page has no ${tag("title")}. Add one inside ${tag("head")}: it's the name on the browser tab.`,
      styleInCss: () => `A CSS file holds only CSS. Delete ${C("<style>")} and ${C("</style>")}: they're only needed inside an HTML page.`,
      htmlInCss: t => `HTML tags like ${C(t)} don't go in a CSS file.`,
      slashComment: () => `${C("//")} isn't a comment in CSS. Write ${C("/* … */")} instead.`,
      braceUnclosed: s => `The rule ${C(s + " {")} is never closed. Add a ${C("}")} at its end.`,
      braceStray: () => `This ${C("}")} closes nothing. Delete it, or check whether the rule above is missing a ${C("{")}.`,
      outsideRule: () => `This is outside any rule, so it does nothing. Put it inside a selector's braces: ${C("p { … }")}.`,
      selColon: s => `No colon after the selector: write ${C(s + " {")}.`,
      selTag: t => `In CSS write the element's name without the brackets: ${C(t + " {")}.`,
      emptySel: () => `There's an extra comma in the selector.`,
      needDot: n => `${C(n)} is a class on your page, so it needs a dot: ${C("." + n)}.`,
      needHash: n => `${C(n)} is an id on your page, so it needs a #: ${C("#" + n)}.`,
      unknownSel: (n, s) => s ? `There is no ${tag(n)} element. Did you mean ${C(s)}?` : `There is no ${tag(n)} element. For a class write ${C("." + n)}, for an id ${C("#" + n)}.`,
      noClass: n => `No element on the page has ${C(`class="${n}"`)}, so this rule doesn't change anything yet.`,
      noId: n => `No element on the page has ${C(`id="${n}"`)}, so this rule doesn't change anything yet.`,
      missingSemi: () => `A ${C(";")} is missing at the end of this line, so the browser reads it and the next line as one.`,
      useColon: fix => `Use a colon, not an equals sign: ${C(fix)}.`,
      missingColon: fix => `A ${C(":")} is missing between the property and its value: ${C(fix)}.`,
      noValue: p => `${C(p)} needs a value: ${C(p + ": …;")}.`,
      garbled: () => `The browser can't read this. A setting looks like ${C("property: value;")}.`,
      propSpace: fix => `Property names use hyphens, not spaces: ${C(fix)}.`,
      wrongProp: (p, f) => `There is no ${C(p)} in CSS. Use ${C(f)}.`,
      unknownProp: (p, s) => s ? `There is no ${C(p)} property. Did you mean ${C(s)}?` : `There is no ${C(p)} property in CSS. Check the spelling.`,
      emptyVal: p => `${C(p)} has no value.`,
      quoted: (p, v) => `Don't put quotes round ${C(v)}: the browser ignores it then. Write ${C(`${p}: ${v};`)}.`,
      unitSpace: fix => `No space between the number and the unit: ${C(fix)}.`,
      noUnit: (p, n) => `${C(n)} needs a unit, e.g. ${C(n + "px")}. Without one the browser ignores ${C(p)}.`,
      badHex: h => `${C(h)} isn't a colour code. It needs 3 or 6 characters from 0–9 and a–f, e.g. ${C("#ff8800")}.`,
      huColor: (w, e) => `CSS colour names are English: ${C(e)}, not ${C(w)}.`,
      unknownColor: (w, s) => s ? `The browser doesn't know the colour ${C(w)}. Did you mean ${C(s)}?` : `The browser doesn't know the colour ${C(w)}. Use an English colour name or a code like ${C("#33aa77")}.`,
      badKeyword: (p, w, s, ex) => s ? `${C(w)} isn't a value of ${C(p)}. Did you mean ${C(s)}?` : `${C(w)} isn't a value of ${C(p)}. Try ${ex}.`,
      inlineBraces: () => `No ${C("{ }")} in a ${C("style")} attribute, just ${C("property: value;")}.`
    },
    hu: {
      line: n => `${n}. sor`, tip: "Tipp", none: "✓ nincs hiba", status: (e, t) => [e ? `⚠ ${e} hiba` : "✓ nincs hiba", t ? `${t} tipp` : ""].filter(Boolean).join(" · "),
      more: n => `…és még ${n}. Előbb a fentieket javítsd: gyakran a többi is eltűnik velük.`,
      unclosedComment: () => `Ez a megjegyzés nincs lezárva, ezért minden, ami utána jön, rejtve marad. Zárd le így: ${C("-->")}.`,
      noDoctype: () => `A fájl a ${C("<!DOCTYPE html>")} sorral kezdődjön. Enélkül a böngésző egy régi, szeszélyes módon rajzolja ki az oldalt.`,
      doctypeFirst: () => `A ${C("<!DOCTYPE html>")} sornak a fájl legelején kell lennie.`,
      badDoctype: () => `A doctype pontosan így néz ki: ${C("<!DOCTYPE html>")}.`,
      spaceAfterLt: (raw, fix) => `A ${C("<")} után szóköz van, ezért a böngésző szövegként írja ki ezt: ${C(raw)}. Írd így: ${C(fix)}.`,
      missingGt: t => `Ez a címke nincs befejezve: hiányzik a ${C(">")} jel itt: ${C("<" + t)}.`,
      oddQuote: t => `Hiányzik egy idézőjel ebben a címkében: ${tag(t)}. Minden érték elé és mögé is kell egy ${C('"')}.`,
      curly: () => `Ebben a címkében „görbe” idézőjelek vannak, valószínűleg szövegszerkesztőből másoltad. A HTML csak az egyenes ${C('"')} jelet érti.`,
      unknownTag: (t, s) => s ? `Nincs ${tag(t)} címke. Erre gondoltál: ${tag(s)}?` : `A HTML-ben nincs ${tag(t)} címke. Ellenőrizd a helyesírást.`,
      h7: t => `Nincs ${tag(t)}: címsor csak ${tag("h1")} és ${tag("h6")} között van.`,
      obsolete: (t, use) => `${Az(t)} ${tag(t)} elavult. Helyette CSS-t használj: ${C(use)}.`,
      selfClose: t => `${Az(t)} ${tag(t)} nem zárhatja le magát ${C("/>")} jellel. Írd így: ${C(`<${t}></${t}>`)}.`,
      voidClose: t => `${Az(t)} ${tag(t)} üres elem, nincs záró címkéje. Töröld ezt: ${ctag(t)}.`,
      stray: t => `${Az(t)} ${ctag(t)} lezár valamit, amit nem nyitottál meg. Töröld, vagy írd be ${az(t)} ${tag(t)} címkét oda, ahol kezdődnie kell.`,
      cross: (a, b) => `Rossz sorrendben zártad le a címkéket: ${az(a)} ${tag(a)} ${az(b)} ${tag(b)} belsejében nyílt meg, ezért előbb ${ctag(a)}, utána ${ctag(b)} jön.`,
      unclosed: t => `${Az(t)} ${tag(t)} nincs lezárva. Írd be ${az(t)} ${ctag(t)} címkét oda, ahol véget kell érnie.`,
      outside: () => `Ez a ${ctag("body")} után van, az oldalon kívül. Vidd feljebb, a ${ctag("body")} elé.`,
      inHead: t => `${Az(t)} ${tag(t)} látható tartalom, ezért a ${tag("body")} részbe kerül, nem a ${tag("head")} részbe.`,
      headText: () => `A ${tag("head")} részbe írt szöveg nem látszik az oldalon. Tedd a ${tag("title")} címkébe, vagy vidd át a ${tag("body")} részbe.`,
      dup: t => `Ez már a második ${tag(t)}. Egy oldalon csak egy lehet belőle.`,
      headAfterBody: () => `A ${tag("head")} résznek a ${tag("body")} előtt kell lennie.`,
      liParent: () => `A ${tag("li")} listaelem helye egy ${tag("ul")} vagy ${tag("ol")} belsejében van.`,
      listChild: t => `Egy lista közvetlen belsejébe csak ${tag("li")} kerülhet. Tedd ${az(t)} ${tag(t)} címkét egy ${tag("li")} belsejébe.`,
      listText: () => `A listában a szöveget ${tag("li")} címkébe kell tenni.`,
      trParent: () => `A ${tag("tr")} táblázatsor a ${tag("table")} belsejébe kerül.`,
      tdParent: t => `${Az(t)} ${tag(t)} egy cella, ezért egy ${tag("tr")} sor belsejében a helye.`,
      trChild: t => `Egy ${tag("tr")} sorba közvetlenül csak cella kerülhet: ${tag("td")} vagy ${tag("th")}. Tedd ${az(t)} ${tag(t)} címkét egy ${tag("td")} cellába.`,
      tableChild: t => `${Az(t)} ${tag(t)} nem kerülhet közvetlenül a táblázatba. Tedd egy ${tag("td")} cellába.`,
      tableText: () => `A táblázatban a szöveg cellába kerül: ${tag("td")} vagy ${tag("th")}.`,
      blockInP: t => `Egy ${tag("p")} bekezdésben nem lehet ${tag(t)}. Zárd le a bekezdést (${ctag("p")}) ${az(t)} ${tag(t)} előtt.`,
      blockInH: (t, h) => `${Az(t)} ${tag(t)} nem kerülhet ${az(h)} ${tag(h)} címsor belsejébe. Előbb zárd le a címsort.`,
      aInA: () => `Egy hivatkozásban nem lehet másik hivatkozás. Zárd le az elsőt (${ctag("a")}), mielőtt a következőt kezded.`,
      imgNoSrc: () => `Ennek a képnek nincs ${C("src")} része, így nincs mit megmutatni. Írd bele: ${C('src="fájlnév"')}.`,
      imgNoAlt: () => `Adj a képnek ${C("alt")} leírást: pár szó azoknak, akik nem látják, és arra az esetre, ha nem töltődik be.`,
      aNoHref: () => `Ennek a hivatkozásnak nincs ${C("href")} része, így nem visz sehova.`,
      imgHref: () => `A kép ${C("src")} részt használ, nem ${C("href")} részt: ${C('<img src="…">')}.`,
      aSrc: () => `A hivatkozás ${C("href")} részt használ, nem ${C("src")} részt: ${C('<a href="…">')}.`,
      linkSrc: () => `A ${tag("link")} ${C("href")} részt használ, nem ${C("src")} részt: ${C('<link rel="stylesheet" href="style.css">')}.`,
      linkNoRel: () => `A böngésző nem tudja, mire való ez a ${tag("link")}. Írd bele: ${C('rel="stylesheet"')}.`,
      linkInBody: () => `A ${tag("link")} a ${tag("head")} részbe kerül.`,
      missingEq: a => `Hiányzik az ${C("=")} jel ${az(a)} ${C(a)} után: ${C(a + '="…"')}.`,
      noSpaceAttr: () => `A két tulajdonság közé tegyél szóközt.`,
      valueSpaces: (a, v) => `${Az(a)} ${C(a)} értékében szóköz van, ezért idézőjelek közé kell tenni: ${C(`${a}="${v}"`)}.`,
      dupAttr: (a, t) => `${Az(t)} ${tag(t)} címkében kétszer szerepel ${az(a)} ${C(a)}. Csak az első számít${a === "class" ? ": írd az összes osztálynevet egybe, szóközzel elválasztva" : ""}.`,
      attrElsewhere: (a, t) => `${Az(a)} ${C(a)} semmit sem csinál ${az(t)} ${tag(t)} címkén.`,
      unknownAttr: (a, s) => s ? `Nincs ${C(a)} tulajdonság. Erre gondoltál: ${C(s)}?` : `A HTML-ben nincs ${C(a)} tulajdonság. Ellenőrizd a helyesírást.`,
      target: v => `Alávonással írd: ${C(`target="_${v}"`)}.`,
      attrPx: (a, n) => `A HTML-ben ${az(a)} ${C(a)} csak a képpontok számát kéri: ${C(`${a}="${n}"`)}, px nélkül.`,
      idSpace: fix => `Az ${C("id")} nem tartalmazhat szóközt. Használj kötőjelet: ${C(`id="${fix}"`)}.`,
      dupId: v => `Két elem azonosítója is ${C(`id="${v}"`)}. Egy id csak egyszer szerepelhet; ami ismétlődik, annak class kell.`,
      noAnchor: v => `Ez a hivatkozás ide mutat: ${C("#" + v)}, de egyik elemnek sincs ${C(`id="${v}"`)} azonosítója.`,
      emptyRef: a => `${Az(a)} ${C(a)} üres.`,
      noColonUrl: fix => `Hiányzik a kettőspont a címből: ${C(fix)}.`,
      www: v => `A webcímek elejére kell a ${C("https://")}: ${C("https://" + v)}. Enélkül a böngésző egy „${esc(v)}” nevű fájlt keres.`,
      localPath: (v, b) => `Ez a saját géped egyik mappájára mutat: ${C(v)}, máshol nem fog működni. Elég a fájl neve: ${C(b)}.`,
      backslash: fix => `A fájlútvonalban ${C("/")} jel kell, nem ${C("\\")}: ${C(fix)}.`,
      caseFile: (v, f) => `A fájlnevekben számít a kis- és nagybetű: neked ${C(f)} van, nem ${C(v)}.`,
      extFile: (v, f) => `Nincs ${C(v)}, de van ${C(f)}. Nézd meg a fájl végződését.`,
      nearFile: (v, f) => `Nincs ${C(v)} nevű fájl. Erre gondoltál: ${C(f)}?`,
      missingFile: (v, k) => `Nincs ${C(v)} nevű fájl. ` + (k === "img" ? "Töltsd fel a Képek gombbal, vagy nézd meg a nevét." : k === "css" ? "Hozd létre az Új gombbal, CSS-fájlként." : "Hozd létre az Új gombbal, vagy nézd meg a nevét."),
      headingSkip: (a, b) => `Ez a ${tag("h" + b)} egy ${tag("h" + a)} után jön, köztük nincs ${tag("h" + (a + 1))}. A címsorok szintenként követik egymást.`,
      noTitle: () => `Az oldalnak nincs ${tag("title")} címe. Írj egyet a ${tag("head")} részbe: ez látszik a böngésző fülén.`,
      styleInCss: () => `A CSS-fájlba csak CSS kerül. Töröld a ${C("<style>")} és ${C("</style>")} címkét: azok csak HTML-oldalon belül kellenek.`,
      htmlInCss: t => `HTML-címke (${C(t)}) nem kerülhet CSS-fájlba.`,
      slashComment: () => `A ${C("//")} a CSS-ben nem megjegyzés. Írd így: ${C("/* … */")}.`,
      braceUnclosed: s => `Ez a szabály nincs lezárva: ${C(s + " {")}. Tegyél a végére egy ${C("}")} jelet.`,
      braceStray: () => `Ez a ${C("}")} nem zár le semmit. Töröld, vagy nézd meg, nem hiányzik-e egy ${C("{")} a fenti szabályból.`,
      outsideRule: () => `Ez nincs egyik szabályban sem, ezért nem csinál semmit. Tedd egy kijelölő kapcsos zárójelei közé: ${C("p { … }")}.`,
      selColon: s => `A kijelölő után nem kell kettőspont: ${C(s + " {")}.`,
      selTag: t => `CSS-ben az elem nevét kacsacsőrök nélkül írd: ${C(t + " {")}.`,
      emptySel: () => `Eggyel több vessző van a kijelölőben.`,
      needDot: n => `${Az(n)} ${C(n)} egy osztály az oldaladon, ezért pont kell elé: ${C("." + n)}.`,
      needHash: n => `${Az(n)} ${C(n)} egy azonosító az oldaladon, ezért # kell elé: ${C("#" + n)}.`,
      unknownSel: (n, s) => s ? `Nincs ${tag(n)} elem. Erre gondoltál: ${C(s)}?` : `Nincs ${tag(n)} elem. Osztályhoz ${C("." + n)}, azonosítóhoz ${C("#" + n)} kell.`,
      noClass: n => `Az oldalon egyik elemnek sincs ${C(`class="${n}"`)} osztálya, így ez a szabály még nem változtat semmin.`,
      noId: n => `Az oldalon egyik elemnek sincs ${C(`id="${n}"`)} azonosítója, így ez a szabály még nem változtat semmin.`,
      missingSemi: () => `A sor végéről hiányzik a ${C(";")}, ezért a böngésző ezt és a következő sort egynek olvassa.`,
      useColon: fix => `Kettőspont kell, nem egyenlőségjel: ${C(fix)}.`,
      missingColon: fix => `Hiányzik a ${C(":")} a tulajdonság és az értéke közül: ${C(fix)}.`,
      noValue: p => `${Az(p)} ${C(p)} után érték is kell: ${C(p + ": …;")}.`,
      garbled: () => `A böngésző nem tudja elolvasni ezt. Egy beállítás így néz ki: ${C("tulajdonság: érték;")}.`,
      propSpace: fix => `A tulajdonságnevekben kötőjel van, nem szóköz: ${C(fix)}.`,
      wrongProp: (p, f) => `A CSS-ben nincs ${C(p)}. Ezt használd: ${C(f)}.`,
      unknownProp: (p, s) => s ? `Nincs ${C(p)} tulajdonság. Erre gondoltál: ${C(s)}?` : `A CSS-ben nincs ${C(p)} tulajdonság. Ellenőrizd a helyesírást.`,
      emptyVal: p => `${Az(p)} ${C(p)} értéke üres.`,
      quoted: (p, v) => `Ne tedd idézőjelbe: ${C(v)}, mert úgy a böngésző figyelmen kívül hagyja. Írd így: ${C(`${p}: ${v};`)}.`,
      unitSpace: fix => `A szám és a mértékegység közé nem kell szóköz: ${C(fix)}.`,
      noUnit: (p, n) => `${Az(n)} ${C(n)} mellé mértékegység kell, pl. ${C(n + "px")}. Enélkül a böngésző figyelmen kívül hagyja ${az(p)} ${C(p)} beállítást.`,
      badHex: h => `${Az(h)} ${C(h)} nem színkód. 3 vagy 6 jel kell a 0–9 és a–f közül, pl. ${C("#ff8800")}.`,
      huColor: (w, e) => `A CSS-ben a színek nevei angolok: ${C(e)}, nem ${C(w)}.`,
      unknownColor: (w, s) => s ? `A böngésző nem ismeri ezt a színt: ${C(w)}. Erre gondoltál: ${C(s)}?` : `A böngésző nem ismeri ezt a színt: ${C(w)}. Használj angol színnevet vagy színkódot, pl. ${C("#33aa77")}.`,
      badKeyword: (p, w, s, ex) => s ? `${Az(w)} ${C(w)} nem lehet ${az(p)} ${C(p)} értéke. Erre gondoltál: ${C(s)}?` : `${Az(w)} ${C(w)} nem lehet ${az(p)} ${C(p)} értéke. Próbáld így: ${ex}.`,
      inlineBraces: () => `A ${C("style")} tulajdonságba nem kell ${C("{ }")}, csak ${C("tulajdonság: érték;")}.`
    }
  };

  /* ---------- shared helpers ---------- */
  function collector(src, lang){
    const M = MSG[lang] || MSG.en, out = [], starts = [0];
    for (let i = 0; i < src.length; i++) if (src[i] === "\n") starts.push(i + 1);
    const lineOf = p => { let lo = 0, hi = starts.length - 1; while (lo < hi) { const m = (lo + hi + 1) >> 1; if (starts[m] <= p) lo = m; else hi = m - 1; } return lo + 1; };
    const add = (from, to, key, args = [], tip = false) => out.push({ from, to: Math.max(from, to), line: lineOf(from), html: M[key](...args), tip, key });
    return { M, out, add, lineOf };
  }
  const blank = s => s.replace(/[^\n]/g, " ");
  function finish(out){
    const seen = new Set();
    return out.filter(w => { const k = w.line + "|" + w.html; return !seen.has(k) && seen.add(k); })
      .sort((a, b) => (a.tip - b.tip) || (a.from - b.from));
  }
  /* comments and quoted strings blanked out, same length, so positions still match */
  const cssPlain = s => s.replace(/\/\*[\s\S]*?(\*\/|$)/g, blank).replace(/(["'])(?:\\.|(?!\1)[^\\\n])*\1/g, m => m[0] + " ".repeat(m.length - 2) + m[0]);

  /* ---------- CSS: declarations (also used for style="…") ---------- */
  function checkValue(add, prop, val, rawVal, at){
    const v = val.replace(/!\s*important\s*$/i, "").trim(), lv = v.toLowerCase(), end = at + rawVal.length;
    if (/^["']/.test(rawVal.trim()) && !QUOTE_OK.has(prop) && !prop.startsWith("--")) { add(at, end, "quoted", [prop, rawVal.trim().replace(/^["']|["']$/g, "")]); return; }
    let m;
    if ((m = /(\d)\s+(px|em|rem|%|vh|vw|vmin|vmax|pt|cm|mm|deg|s|ms|fr|ch)\b/i.exec(v))) { add(at, end, "unitSpace", [v.replace(/(\d)\s+(px|em|rem|%|vh|vw|vmin|vmax|pt|cm|mm|deg|s|ms|fr|ch)\b/gi, "$1$2")]); return; }
    for (const h of lv.matchAll(/#([0-9a-z]*)/g)) {
      if (!/^[0-9a-f]+$/.test(h[1]) || ![3, 4, 6, 8].includes(h[1].length)) { add(at, end, "badHex", [h[0]]); return; }
    }
    const noFn = lv.replace(/[a-z-]+\([^)]*\)?/g, " ƒ ");
    const words = noFn.split(/[\s,\/]+/).filter(Boolean);
    if (needsUnit(prop)) {
      const bare = words.find(w => /^-?\d*\.?\d+$/.test(w) && parseFloat(w) !== 0);
      if (bare) { add(at, end, "noUnit", [prop, bare]); return; }
    }
    const color = w => {
      if (COLORS.has(w) || GLOBAL_KW.has(w) || w === "ƒ" || w.startsWith("#") || w.startsWith("var")) return true;
      if (HU_COLORS[w]) { add(at, end, "huColor", [w, HU_COLORS[w]]); return false; }
      add(at, end, "unknownColor", [w, near(w, COLORS)]); return false;
    };
    const oneWord = words.length === 1 && /^[a-záéíóöőúüű-]+$/.test(words[0]) ? words[0] : null;
    if (COLOR_PROPS(prop) && oneWord) { color(oneWord); return; }
    if ((prop === "background" || prop === "background-color") && oneWord && !["none"].includes(oneWord)) { color(oneWord); return; }
    if (/^(border|outline)(-(top|right|bottom|left))?$/.test(prop)) {
      for (const w of words) {
        if (/^-?\d/.test(w) || BORDER_WORDS.has(w) || w === "ƒ" || w.startsWith("#") || GLOBAL_KW.has(w)) continue;
        if (!color(w)) return;
      }
      return;
    }
    if (KW[prop] && oneWord && !GLOBAL_KW.has(oneWord) && !KW[prop].has(oneWord)) {
      const s = KW[prop].has(KW_FIX[oneWord]) ? KW_FIX[oneWord] : near(oneWord, KW[prop]);
      add(at, end, "badKeyword", [prop, oneWord, s, [...KW[prop]].slice(0, 3).map(C).join(", ")]);
    }
  }
  function checkDecl(add, plain, orig, a, b){
    const t = plain.slice(a, b), lead = t.length - t.trimStart().length, start = a + lead, tt = t.trim(), end = start + tt.length;
    if (!tt) return;
    const colon = tt.indexOf(":");
    if (colon < 0) {
      if (tt.includes("=")) { add(start, end, "useColon", [orig.slice(start, end).replace(/\s*=\s*/, ": ").trim() + ";"]); return; }
      const w = /^([a-zA-Z-]+)\s+(\S[\s\S]*)$/.exec(tt);
      if (w && (PROPS.has(w[1].toLowerCase()) || PROP_FIX[w[1].toLowerCase()])) { add(start, end, "missingColon", [`${w[1]}: ${orig.slice(start, end).slice(w[1].length).trim()};`]); return; }
      if (/^[a-zA-Z-]+$/.test(tt) && (PROPS.has(tt.toLowerCase()))) { add(start, end, "noValue", [tt]); return; }
      add(start, end, "garbled"); return;
    }
    const rawProp = tt.slice(0, colon).trim(), prop = rawProp.toLowerCase();
    const valStart = start + colon + 1, rawVal = orig.slice(valStart, end), val = plain.slice(valStart, end).trim();
    const pAt = start, pEnd = start + rawProp.length;
    if (!prop) { add(start, end, "garbled"); return; }
    if (/\s/.test(prop)) { add(pAt, pEnd, "propSpace", [prop.replace(/\s+/g, "-") + ": " + rawVal.trim()]); return; }
    if (!prop.startsWith("--") && !/^-(webkit|moz|ms|o)-/.test(prop)) {
      if (PROP_FIX[prop] && PROP_FIX[prop] !== prop) { add(pAt, pEnd, "wrongProp", [rawProp, PROP_FIX[prop]]); return; }
      if (!PROPS.has(prop)) { add(pAt, pEnd, "unknownProp", [rawProp, near(prop, PROPS)]); return; }
    }
    if (!val) { add(start, end, "emptyVal", [rawProp]); return; }
    checkValue(add, prop, val, rawVal.replace(/^\s+/, ""), valStart + (rawVal.length - rawVal.replace(/^\s+/, "").length));
  }
  /* a block of declarations between a and b: split at ; and spot lines where the ; was forgotten */
  function checkDecls(add, plain, orig, a, b){
    let s = a;
    for (let i = a; i <= b; i++) {
      if (i < b && plain[i] !== ";") continue;
      const piece = plain.slice(s, i);
      const heads = [...piece.matchAll(/(^|\n)[ \t]*(-?[a-zA-Z][\w-]*)[ \t]*:/g)].map(m => s + m.index + m[1].length);
      if (heads.length > 1 && piece.trim()) {
        for (let k = 1; k < heads.length; k++) {
          const prevEnd = s + piece.slice(0, heads[k] - s).replace(/\s+$/, "").length;
          const lineStart = plain.lastIndexOf("\n", prevEnd - 1) + 1;
          add(lineStart + (plain.slice(lineStart).length - plain.slice(lineStart).trimStart().length), prevEnd, "missingSemi");
        }
        heads.forEach((h, k) => checkDecl(add, plain, orig, h, k + 1 < heads.length ? heads[k + 1] : i));
      } else checkDecl(add, plain, orig, s, i);
      s = i + 1;
    }
  }

  /* ---------- CSS: rules ---------- */
  function pageFacts(html){
    if (typeof html !== "string") return null;
    const cls = new Set(), ids = new Set(), tags = new Set();
    for (const m of html.matchAll(/\sclass\s*=\s*("([^"]*)"|'([^']*)'|([^\s>]+))/gi)) (m[2] ?? m[3] ?? m[4] ?? "").split(/\s+/).filter(Boolean).forEach(c => cls.add(c));
    for (const m of html.matchAll(/\sid\s*=\s*("([^"]*)"|'([^']*)'|([^\s>]+))/gi)) ids.add((m[2] ?? m[3] ?? m[4] ?? "").trim());
    for (const m of html.matchAll(/<([a-zA-Z][\w-]*)/g)) tags.add(m[1].toLowerCase());
    return { cls, ids, tags };
  }
  function checkSelector(add, plain, a, b, facts){
    const raw = plain.slice(a, b), sel = raw.trim(), at = a + (raw.length - raw.trimStart().length), end = at + sel.length;
    if (!sel) return;
    if (/:\s*$/.test(sel)) { add(at, end, "selColon", [sel.replace(/\s*:\s*$/, "")]); return; }
    if (/<\/?\s*([a-zA-Z][\w-]*)\s*>?/.test(sel)) { add(at, end, "selTag", [sel.replace(/<\/?\s*|\s*>/g, "")]); return; }
    const parts = sel.split(",");
    if (parts.some(p => !p.trim())) { add(at, end, "emptySel"); return; }
    const bare = sel.replace(/\[[^\]]*\]?/g, " ").replace(/::?[a-zA-Z-]+(\([^)]*\))?/g, " ");
    for (const m of bare.matchAll(/([.#]?)(-?[_a-zA-Z][\w-]*)/g)) {
      const kind = m[1], name = m[2];
      if (!kind) {
        const n = name.toLowerCase();
        /* "title {" when the page has class="title": the dot was forgotten (styling <title> itself does nothing) */
        const unseen = facts && (!facts.tags.has(n) || HEAD_OK.has(n) || n === "head");
        if (unseen && facts.cls.has(name)) { add(at, end, "needDot", [name]); return; }
        if (unseen && facts.ids.has(name)) { add(at, end, "needHash", [name]); return; }
        if (TAGS.has(n) || n === "from" || n === "to") continue;
        if (facts && facts.cls.has(name)) { add(at, end, "needDot", [name]); return; }
        if (facts && facts.ids.has(name)) { add(at, end, "needHash", [name]); return; }
        if (OBSOLETE[n] || (facts && facts.tags.has(n))) continue;
        add(at, end, "unknownSel", [name, TAG_FIX[n] || near(n, TAGS)]); return;
      }
      if (!facts) continue;
      if (kind === "." && !facts.cls.has(name)) add(at, end, "noClass", [name], true);
      if (kind === "#" && !facts.ids.has(name)) add(at, end, "noId", [name], true);
    }
  }
  function checkCssRange(add, src, from, to, facts, inFile){
    const orig = blank(src.slice(0, from)) + src.slice(from, to);
    let plain = blank(src.slice(0, from)) + cssPlain(src.slice(from, to));
    /* things that don't belong in CSS at all: report them, then blank them so they don't cause knock-on messages */
    const wipe = (i, j) => { plain = plain.slice(0, i) + blank(plain.slice(i, j)) + plain.slice(j); };
    const zone = plain.slice(from, to); let toldStyle = false;
    for (const m of zone.matchAll(/<\/?\s*([a-zA-Z][\w-]*)[^>\n]*>/g)) {
      const i = from + m.index, j = i + m[0].length;
      if (!inFile) continue;
      const isStyle = /^style$/i.test(m[1]);
      if (!isStyle && /^<\w+>$/.test(m[0]) && /^\s*[{,]/.test(plain.slice(j))) continue;   /* "<p> {": explained as a selector */
      if (!(isStyle && toldStyle)) add(i, j, isStyle ? "styleInCss" : "htmlInCss", [m[0]]);
      toldStyle = toldStyle || isStyle; wipe(i, j);
    }
    for (const m of plain.slice(from, to).matchAll(/(^|[\s;{}])\/\/[^\n]*/g)) {
      const i = from + m.index + m[1].length, j = from + m.index + m[0].length;
      if (/url\(\s*$/i.test(plain.slice(Math.max(0, i - 8), i))) continue;
      add(i, j, "slashComment"); wipe(i, j);
    }
    const stack = []; let buf = from;
    const selText = (i, j) => plain.slice(i, j).trim().replace(/\s+/g, " ").slice(0, 40);
    for (let i = from; i < to; i++) {
      const c = plain[i];
      if (c === "{") {
        const top = stack[stack.length - 1];
        let selFrom = buf;
        if (top && top.type === "rule") {                         /* a new rule starts before the last one was closed */
          const lastSemi = plain.lastIndexOf(";", i), selStart = Math.max(buf, lastSemi + 1);
          add(top.at, top.selEnd, "braceUnclosed", [top.sel]);
          if (selStart > buf) checkDecls(add, plain, orig, buf, selStart - 1);
          stack.pop(); selFrom = selStart;
        } else if (!top || top.type === "group") {
          const lastSemi = plain.lastIndexOf(";", i);
          if (lastSemi >= buf) {                                  /* declarations sitting outside any rule */
            const k = plain.slice(buf, lastSemi).search(/\S/);
            const loose = plain.slice(buf, lastSemi).replace(/@[\w-]+[^;{]*(;|$)/g, blank);
            if (k >= 0 && loose.trim() && loose.includes(":")) add(buf + loose.search(/\S/), lastSemi + 1, "outsideRule");
            selFrom = lastSemi + 1;
          }
        }
        const sel = plain.slice(selFrom, i).trim(), at = selFrom + (plain.slice(selFrom, i).length - plain.slice(selFrom, i).trimStart().length);
        if (/^@(media|supports|container|layer|document|scope)/i.test(sel)) stack.push({ type: "group", at });
        else if (/^@(-\w+-)?keyframes/i.test(sel)) stack.push({ type: "kf", at });
        else if (sel.startsWith("@")) stack.push({ type: "rule", at, sel: selText(selFrom, i), selEnd: i, atRule: true });
        else {
          if (!(top && top.type === "kf")) checkSelector(add, plain, selFrom, i, facts);
          stack.push({ type: "rule", at, sel: selText(selFrom, i) || "?", selEnd: i });
        }
        buf = i + 1;
      } else if (c === "}") {
        const top = stack.pop();
        if (!top) add(i, i + 1, "braceStray");
        else if (top.type === "rule") checkDecls(add, plain, orig, buf, i);
        else { const k = plain.slice(buf, i).search(/\S/); if (k >= 0 && plain.slice(buf, i).includes(":")) add(buf + k, i, "outsideRule"); }
        buf = i + 1;
      }
    }
    while (stack.length) {
      const top = stack.pop();
      if (top.type === "rule") { checkDecls(add, plain, orig, buf, to); add(top.at, top.selEnd, "braceUnclosed", [top.sel]); }
      else add(top.at, top.at + 1, "braceUnclosed", [selText(top.at, plain.indexOf("{", top.at))]);
      buf = to;
    }
    const tail = plain.slice(buf, to).replace(/@[\w-]+[^;{]*;/g, blank), k = tail.search(/\S/);
    if (k >= 0 && tail.includes(":")) add(buf + k, to, "outsideRule");
  }

  function css(src, ctx = {}){
    const { out, add } = collector(src, ctx.lang);
    checkCssRange(add, src, 0, src.length, pageFacts(ctx.page), true);
    return finish(out);
  }

  /* ---------- HTML ---------- */
  function checkRef(add, ctx, attr, v, at, end, t, anchors){
    const raw = v, val = v.trim();
    if (!val) { if (!(t === "a" && attr === "href")) add(at, end, "emptyRef", [attr]); else add(at, end, "emptyRef", [attr], true); return; }
    if (/^https?\/\//i.test(val)) { add(at, end, "noColonUrl", [val.replace(/^(https?)\/\//i, "$1://")]); return; }
    if (/^https?:\/[^\/]/i.test(val)) { add(at, end, "noColonUrl", [val.replace(/^(https?):\/(?!\/)/i, "$1://")]); return; }
    if (/^([a-z][a-z0-9+.-]*:|\/\/)/i.test(val) && !/^[a-z]:[\\\/]/i.test(val) && !/^file:/i.test(val)) return;
    if (/^www\./i.test(val)) { add(at, end, "www", [val]); return; }
    const baseName = val.split(/[\\\/]/).pop();
    if (/^[a-z]:[\\\/]/i.test(val) || /^file:/i.test(val) || /^\/(Users|home)\//.test(val)) { add(at, end, "localPath", [val, baseName]); return; }
    if (val.includes("\\")) { add(at, end, "backslash", [val.replace(/\\/g, "/")]); return; }
    if (val.startsWith("#")) { if (t === "a" && val.length > 1) anchors.push({ id: decodeURIComponent(val.slice(1)), at, end }); return; }
    if (!Array.isArray(ctx.files) || val.startsWith("../")) return;
    const name = val.split(/[?#]/)[0].replace(/^\.?\//, "");
    if (!name || ctx.files.includes(name)) return;
    const files = ctx.files;
    const inFolder = files.find(f => f.includes("/") && f.split("/").pop().toLowerCase() === name.toLowerCase());
    if (inFolder) { add(at, end, "nearFile", [name, inFolder]); return; }
    const ci = files.find(f => f.toLowerCase() === name.toLowerCase());
    if (ci) { add(at, end, "caseFile", [name, ci]); return; }
    const stem = n => n.replace(/\.[^.\/]+$/, "").toLowerCase();
    const ext = files.find(f => stem(f) === stem(name));
    if (ext) { add(at, end, "extFile", [name, ext]); return; }
    const s = near(name.toLowerCase(), files.map(f => f.toLowerCase()));
    if (s) { add(at, end, "nearFile", [name, files.find(f => f.toLowerCase() === s)]); return; }
    const kind = /\.(png|jpe?g|gif|svg|webp|avif|bmp|ico)$/i.test(name) ? "img" : /\.css$/i.test(name) ? "css" : "page";
    add(at, end, "missingFile", [name, kind]);
  }

  function html(src, ctx = {}){
    const { out, add } = collector(src, ctx.lang);
    let clean = src;
    /* comments: blanked; one that never ends hides the rest of the page */
    clean = clean.replace(/<!--[\s\S]*?(-->|$)/g, (m, endTag, i) => { if (!endTag) add(i, i + 4, "unclosedComment"); return blank(m); });
    /* <style> holds CSS (checked as CSS), <script> holds JavaScript (left alone) */
    const styles = [];
    clean = clean.replace(/(<(style|script)\b[^>]*>)([\s\S]*?)(<\/\2\s*>|$)/gi, (m, open, name, body, close, i) => {
      if (name.toLowerCase() === "style") styles.push([i + open.length, i + open.length + body.length]);
      return open + blank(body) + close;
    });
    const facts = pageFacts(src);

    /* doctype */
    const dt = /<!doctype\b[^>]*>?/i.exec(clean);
    const whole = /<(html|head|body)\b/i.test(clean);
    if (dt) {
      if (!/^<!doctype\s+html\s*>$/i.test(dt[0])) add(dt.index, dt.index + dt[0].length, "badDoctype");
      else if (clean.slice(0, dt.index).trim()) add(dt.index, dt.index + dt[0].length, "doctypeFirst", [], true);
    } else if (whole) add(0, Math.max(1, src.indexOf("\n") < 0 ? src.length : src.indexOf("\n")), "noDoctype", [], true);

    /* "< p>" and "</ p>": shown as text */
    const spacedOpen = {}, spacedClose = new Set();
    for (const m of clean.matchAll(/<(\/?)\s+(\/?)([a-zA-Z][\w-]*)[^<>]*>/g)) {
      if (!/\s/.test(m[0].slice(1, m[0].indexOf(m[3])))) continue;
      const nm = m[3].toLowerCase();
      if (m[1] || m[2]) spacedClose.add(nm); else spacedOpen[nm] = (spacedOpen[nm] || 0) + 1;
      add(m.index, m.index + m[0].length, "spaceAfterLt", [m[0], m[0].replace(/^<\s*(\/?)\s*/, "<$1")]);
    }

    const stack = [], lateClose = { ...spacedOpen }, ids = new Map(), anchors = [], counts = {};
    let bodySeen = false, ended = null, outsideTold = false, lastH = 0, title = false;
    const inside = n => stack.some(s => s.name === n);
    const re = /<(\/?)([a-zA-Z][\w-]*)([^<>]*?)(\/?)(>|(?=<)|$)/g;
    let m, last = 0;
    const textCheck = (i, j) => {
      const txt = clean.slice(i, j).replace(/&[#\w]+;/g, "x");
      const k = txt.search(/\S/); if (k < 0) return;
      const at = i + k, end = i + txt.trimEnd().length, top = stack.length ? stack[stack.length - 1].name : null;
      if (ended != null && !outsideTold) { add(at, end, "outside"); outsideTold = true; return; }
      if (top === "ul" || top === "ol") add(at, end, "listText");
      else if (top === "table" || top === "tr" || top === "tbody" || top === "thead" || top === "tfoot") add(at, end, "tableText");
      else if (top === "head") add(at, end, "headText");
    };
    while ((m = re.exec(clean))) {
      textCheck(last, m.index); last = re.lastIndex;
      const close = !!m[1], rawName = m[2], name = rawName.toLowerCase(), attrs = m[3] || "", at = m.index, end = re.lastIndex;
      const tagEnd = at + 1 + m[1].length + rawName.length;
      const inSvg = inside("svg") || inside("math");
      if (!m[5]) add(at, end, "missingGt", [rawName]);
      if ((attrs.split('"').length - 1) % 2) add(at, end, "oddQuote", [name]);
      else if (!attrs.includes('"') && (attrs.split("'").length - 1) % 2) add(at, end, "oddQuote", [name]);
      if (/[“”„‘’]/.test(attrs)) add(at, end, "curly");
      if (!inSvg && !TAGS.has(name) && !name.includes("-")) {
        if (OBSOLETE[name]) { if (!close) add(at, tagEnd, "obsolete", [name, OBSOLETE[name]], true); }
        else if (/^h\d+$/.test(name)) add(at, tagEnd, "h7", [name]);
        else add(at, tagEnd, "unknownTag", [name, TAG_FIX[name] || near(name, TAGS)]);
      }

      if (close) {
        if (VOID.has(name)) { add(at, end, "voidClose", [name]); continue; }
        const idx = stack.map(s => s.name).lastIndexOf(name);
        if (idx < 0) { if (lateClose[name]) lateClose[name]--; else if (name !== "body" && name !== "html" && name !== "head") add(at, end, "stray", [name]); continue; }
        const rest = clean.slice(end).toLowerCase();
        stack.slice(idx + 1).reverse().forEach(inner => {
          if (["html", "head", "body"].includes(inner.name)) return;
          if (new RegExp("^\\s*</" + inner.name + "\\s*>").test(rest)) { add(at, end, "cross", [inner.name, name]); lateClose[inner.name] = (lateClose[inner.name] || 0) + 1; }
          else if (!inner.selfClosed && !spacedClose.has(inner.name)) add(inner.at, inner.end, "unclosed", [inner.name]);
        });
        stack.length = idx;
        if (name === "body" || name === "html") ended = ended ?? end;
        continue;
      }

      /* ---- an opening tag ---- */
      if (ended != null && !outsideTold && name !== "html" && name !== "body") { add(at, end, "outside"); outsideTold = true; }
      if (["html", "head", "body", "title"].includes(name)) {
        counts[name] = (counts[name] || 0) + 1;
        if (counts[name] > 1) add(at, end, "dup", [name]);
      }
      if (name === "title") title = true;
      if (name === "body") { bodySeen = true; const h = stack.map(s => s.name).lastIndexOf("head"); if (h >= 0) stack.length = h; }
      if (name === "head" && bodySeen) add(at, end, "headAfterBody");
      const parent = stack.length ? stack[stack.length - 1].name : null;
      if (!inSvg) {
        if (inside("head") && !HEAD_OK.has(name) && TAGS.has(name)) add(at, end, "inHead", [name]);
        if (name === "li" && !["ul", "ol", "menu"].includes(parent) && parent !== "li") add(at, end, "liParent");
        if (name === "tr" && !["table", "thead", "tbody", "tfoot"].includes(parent)) add(at, end, "trParent");
        if ((name === "td" || name === "th") && parent !== "tr" && parent !== "td" && parent !== "th") add(at, end, "tdParent", [name]);
        if ((parent === "ul" || parent === "ol") && !["li", "script", "template"].includes(name)) add(at, end, "listChild", [name]);
        if (parent === "tr" && !["td", "th", "script", "template"].includes(name)) add(at, end, "trChild", [name]);
        if (["table", "tbody", "thead", "tfoot"].includes(parent) && !["tr", "td", "th", "thead", "tbody", "tfoot", "caption", "colgroup", "col", "script", "template"].includes(name)) add(at, end, "tableChild", [name]);
        if (parent === "p" && BLOCK.has(name)) add(at, end, "blockInP", [name]);
        if (/^h[1-6]$/.test(parent || "") && BLOCK.has(name)) add(at, end, "blockInH", [name, parent]);
        if (name === "a" && inside("a")) add(at, end, "aInA");
        if (/^h[1-6]$/.test(name)) { const lv = +name[1]; if (lastH && lv > lastH + 1) add(at, end, "headingSkip", [lastH, lv], true); lastH = lv; }
        if (m[4] && !VOID.has(name) && TAGS.has(name)) add(at, end, "selfClose", [name]);
      }

      /* attributes */
      const base = tagEnd, seen = new Set(), A = {};
      if (!inSvg) {
        const aq = attrs.replace(/"[^"]*"|'[^']*'/g, x => x[0] + " ".repeat(x.length - 2) + x[0]);
        for (const q of aq.matchAll(/(?:^|\s)([a-zA-Z_:][\w:.-]*)\s*["']/g)) {
          const i = base + q.index + q[0].indexOf(q[1]); add(i, i + q[1].length, "missingEq", [q[1]]);
        }
        for (const q of aq.matchAll(/=\s*("[^"]*"|'[^']*')(?=[^\s\/>])/g)) { const i = base + q.index; add(i, i + q[0].length + 1, "noSpaceAttr"); }
      }
      const ar = /([^\s=\/"'>]+)(?:\s*=\s*(?:"([^"]*)"?|'([^']*)'?|([^\s"'>]+)))?/g;
      let a, prevUnquoted = null, flagged = false;
      while ((a = ar.exec(attrs))) {
        const an = a[1].toLowerCase(), val = a[2] ?? a[3] ?? a[4], ai = base + a.index, ae = ai + a[0].length;
        const hasVal = val !== undefined;
        if (!hasVal && prevUnquoted && !ALL_ATTR.has(an)) { add(prevUnquoted.at, ae, "valueSpaces", [prevUnquoted.name, prevUnquoted.val + " " + a[1]]); prevUnquoted = null; continue; }
        prevUnquoted = a[4] !== undefined ? { name: a[1], val: a[4], at: ai } : null;
        if (/^["'“”„]/.test(an) || /["'“”„]/.test(attrs[a.index - 1] || "")) continue;
        if (seen.has(an)) add(ai, ae, "dupAttr", [an, name]); seen.add(an);
        A[an] = { val, at: ai, end: ae };
        if (inSvg || !TAGS.has(name)) continue;
        if (/^(data-|aria-|on)/.test(an) || an === "xmlns" || an.includes(":")) continue;
        const ok = GLOBAL_ATTR.has(an) || (ATTR[name] && ATTR[name].has(an));
        if (!ok) {
          if (name === "img" && an === "href") add(ai, ae, "imgHref");
          else if (name === "a" && an === "src") add(ai, ae, "aSrc");
          else if (name === "link" && an === "src") add(ai, ae, "linkSrc");
          else if (ALL_ATTR.has(an)) add(ai, ae, "attrElsewhere", [an, name], true);
          else add(ai, ae, "unknownAttr", [a[1], near(an, [...GLOBAL_ATTR, ...(ATTR[name] || [])]) || near(an, ALL_ATTR)]);
          flagged = true; continue;
        }
        if (!hasVal) continue;
        if ((an === "href" || an === "src" || an === "poster") && !/[“”„]/.test(val)) checkRef(add, ctx, an, val, ai, ae, name, anchors);
        if (an === "target" && /^(blank|self|parent|top)$/i.test(val)) add(ai, ae, "target", [val.toLowerCase()]);
        if ((an === "width" || an === "height") && /^\s*\d+(\.\d+)?\s*px\s*$/i.test(val)) add(ai, ae, "attrPx", [an, val.replace(/\s*px\s*$/i, "").trim()]);
        if (an === "id") {
          const v = val.trim();
          if (/\s/.test(v)) add(ai, ae, "idSpace", [v.replace(/\s+/g, "-")]);
          else if (v) { if (ids.has(v)) add(ai, ae, "dupId", [v]); else ids.set(v, ai); }
        }
        if (an === "style") {
          const vs = ai + a[0].indexOf(val, a[1].length);
          if (/[{}]/.test(val)) add(ai, ae, "inlineBraces");
          else { const pad = blank(src.slice(0, vs)); checkDecls(add, pad + cssPlain(val), pad + val, vs, vs + val.length); }
        }
      }
      if (!inSvg) {
        if (name === "img" && !A.src && !A.href && !flagged && !/\bsrc\s*["']/i.test(attrs)) add(at, end, "imgNoSrc");
        if (name === "img" && A.src && !A.alt) add(at, end, "imgNoAlt", [], true);
        if (name === "a" && !A.href && !A.src && !A.name && !A.id && !flagged && !/\bhref\s*["']/i.test(attrs)) add(at, end, "aNoHref", [], true);
        if (name === "link") {
          if (!A.rel && A.href && /\.css(\?|#|$)/i.test(A.href.val || "")) add(at, end, "linkNoRel");
          if (bodySeen && !inside("head")) add(at, end, "linkInBody", [], true);
        }
      }
      if (!VOID.has(name) && !m[4]) stack.push({ name, at, end });
      else if (!VOID.has(name) && m[4] && !inSvg && TAGS.has(name)) stack.push({ name, at, end, selfClosed: true });
    }
    textCheck(last, clean.length);
    stack.forEach(s => { if (!["html", "head", "body"].includes(s.name) && !s.selfClosed && !spacedClose.has(s.name)) add(s.at, s.end, "unclosed", [s.name]); });
    anchors.forEach(x => { if (!ids.has(x.id)) add(x.at, x.end, "noAnchor", [x.id], true); });
    if (counts.head && !title) { const h = /<head\b[^>]*>/i.exec(clean); add(h.index, h.index + h[0].length, "noTitle", [], true); }
    styles.forEach(([a, b]) => checkCssRange(add, src, a, b, facts, false));
    return finish(out);
  }

  window.DKCheck = { html, css, text: lang => MSG[lang] || MSG.en };
})();
