#!/usr/bin/env python3
"""
Generate sitemap.xml for the site.

Lists the public pages plus every blog post and CTF writeup (pulled from
data/blog.js and data/writeups.js). Secret/utility pages (waklu.html,
pastebin.html, 404.html, individual game pages) are intentionally left out.

Run it whenever you add posts or writeups:

    python scripts/generate_sitemap.py
"""

import re
from datetime import date
from pathlib import Path
from xml.sax.saxutils import escape

SITE = "https://zakhwananuar.my"
ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "sitemap.xml"

STATIC = [
    "/", "/about.html", "/projects.html", "/writeups.html",
    "/blog.html", "/achievements.html", "/resume.html",
    "/contact.html", "/games.html",
]

def ids_from(js_file):
    text = (ROOT / "data" / js_file).read_text(encoding="utf-8")
    return re.findall(r"\bid:\s*['\"]([^'\"]+)['\"]", text)

def fields_from(js_file, field):
    text = (ROOT / "data" / js_file).read_text(encoding="utf-8")
    return re.findall(rf"\b{field}:\s*['\"]([^'\"]+)['\"]", text)

def slugify(value):
    return re.sub(r"[^a-z0-9]+", "-", value.lower()).strip("-")

def main():
    today = date.today().isoformat()
    urls = list(STATIC)
    urls += [f"/blog/{i}/" for i in ids_from("blog.js")]
    writeup_ids = ids_from("writeups.js")
    writeup_titles = fields_from("writeups.js", "title")
    writeup_events = fields_from("writeups.js", "ctf")
    urls += [f"/writeups/events/{slugify(event)}/{slugify(title)}/" for event, title in zip(writeup_events, writeup_titles)]
    urls += [f"/projects/{i}/" for i in ids_from("projects.js")]
    urls += [f"/writeups/events/{slugify(i)}/" for i in sorted(set(fields_from("writeups.js", "ctf")))]

    body = "\n".join(
        f"  <url>\n    <loc>{escape(SITE + u)}</loc>\n"
        f"    <lastmod>{today}</lastmod>\n  </url>"
        for u in urls
    )
    xml = (
        '<?xml version="1.0" encoding="UTF-8"?>\n'
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
        + body
        + "\n</urlset>\n"
    )
    OUT.write_text(xml, encoding="utf-8")
    print(f"Wrote {OUT} with {len(urls)} URLs")

if __name__ == "__main__":
    main()
