#!/usr/bin/env python3
"""Refresh the file list in sw.js (offline support). Run from the repo root before pushing:

    python3 tools/build-sw.py

(It reads the file list from git, so `git add` new files first.)

It lists every page, script, style and drawing to keep offline, the fonts and CDN scripts the pages load,
and for each page the screenshots it shows (those are saved when the page is first opened, not up front).
VERSION is a hash of all those files, so any change makes browsers fetch the new set."""
import hashlib, json, os, re, subprocess

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
os.chdir(ROOT)
files = subprocess.run(["git", "ls-files"], capture_output=True, text=True, check=True).stdout.split()
skip = lambda f: (f.startswith(("tools/", ".")) or f in ("sw.js",) or f.endswith((".md", ".src.js", ".pdf")))
site = sorted(f for f in files if not skip(f) and os.path.exists(f))
# screenshots wait until their mission is opened; the shared ones (Inkscape map, toolbox) are used everywhere, so they go up front
core = [f for f in site if not f.endswith(".png") or f.startswith("inkscape/img/common/")]

external, page_images = set(), {}
for f in site:
    if not f.endswith((".html", ".js", ".css")):
        continue
    text = open(f, encoding="utf-8").read()
    for u in re.findall(r"https://(?:fonts\.googleapis\.com/css2|cdn\.jsdelivr\.net/npm|cdnjs\.cloudflare\.com/ajax/libs)[^\"'`)\s]*", text):
        external.add(u.replace("&amp;", "&"))
    if f.endswith(".html"):
        base = os.path.dirname(f)
        imgs = sorted({os.path.normpath(os.path.join(base, m)) for m in re.findall(r"[\w./-]+\.png", text)})
        imgs = [i for i in imgs if i in site]
        if imgs:
            page_images[f] = imgs

h = hashlib.sha256(json.dumps(core).encode())
for f in site:
    h.update(f.encode()); h.update(open(f, "rb").read())
block = ("/* FILES:BEGIN (written by tools/build-sw.py, don't edit by hand) */\n"
         f"const VERSION = {json.dumps(h.hexdigest()[:10])};\n"
         f"const CORE = {json.dumps(['./'] + core, indent=0)};\n"
         f"const EXTERNAL = {json.dumps(sorted(external), indent=0)};\n"
         f"const PAGE_IMAGES = {json.dumps(page_images, indent=0, sort_keys=True)};\n"
         "/* FILES:END */")
sw = open("sw.js", encoding="utf-8").read()
sw = re.sub(r"/\* FILES:BEGIN.*?/\* FILES:END \*/", lambda m: block, sw, flags=re.S)
open("sw.js", "w", encoding="utf-8").write(sw)
size = sum(os.path.getsize(f) for f in core) / 1e6
print(f"sw.js: version {h.hexdigest()[:10]}, {len(core)} files up front ({size:.1f} MB), {len(external)} external, "
      f"screenshots for {len(page_images)} pages")
