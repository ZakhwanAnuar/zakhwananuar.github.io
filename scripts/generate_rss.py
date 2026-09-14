#!/usr/bin/env python3
"""
Generate feed.xml (RSS 2.0) from data/blog.js.

The blog is data-driven (a JS array in data/blog.js), but RSS readers do not
run JavaScript, so this produces a static feed.xml that feed readers can consume.

Run it whenever you add or edit a blog post:

    python scripts/generate_rss.py

It reads ../data/blog.js relative to this script and writes ../feed.xml.
"""

import re
import sys
from datetime import datetime, timezone
from email.utils import format_datetime
from pathlib import Path
from xml.sax.saxutils import escape

SITE = "https://zakhwananuar.my"
ROOT = Path(__file__).resolve().parent.parent
BLOG_JS = ROOT / "data" / "blog.js"
OUT = ROOT / "feed.xml"

# Match `field: '...'` or `field: "..."` with escaped-quote support.
def field(name, block):
    m = re.search(
        r"\b" + name + r"\s*:\s*(['\"])((?:\\.|(?!\1).)*)\1",
        block,
        re.DOTALL,
    )
    if not m:
        return ""
    # Un-escape the JS string minimally (\' \" \\ and common escapes)
    return re.sub(r"\\(.)", r"\1", m.group(2)).strip()


def parse_date(s):
    s = s.strip()
    for fmt in ("%B %Y", "%b %Y", "%B %d, %Y", "%d %B %Y", "%Y-%m-%d", "%Y"):
        try:
            return datetime.strptime(s, fmt).replace(tzinfo=timezone.utc)
        except ValueError:
            continue
    return datetime.now(timezone.utc)


def main():
    if not BLOG_JS.exists():
        sys.exit(f"Cannot find {BLOG_JS}")

    text = BLOG_JS.read_text(encoding="utf-8")

    # Slice each post object by its `id:` field position (fields appear in order).
    id_positions = [m.start() for m in re.finditer(r"\n\s*id\s*:", text)]
    posts = []
    for i, start in enumerate(id_positions):
        end = id_positions[i + 1] if i + 1 < len(id_positions) else len(text)
        block = text[start:end]
        pid = field("id", block)
        title = field("title", block)
        date = field("date", block)
        summary = field("summary", block)
        if pid and title:
            posts.append((pid, title, date, summary))

    items = []
    for pid, title, date, summary in posts:
        link = f"{SITE}/blog-post.html?id={pid}"
        pub = format_datetime(parse_date(date))
        items.append(
            "    <item>\n"
            f"      <title>{escape(title)}</title>\n"
            f"      <link>{escape(link)}</link>\n"
            f"      <guid isPermaLink=\"true\">{escape(link)}</guid>\n"
            f"      <pubDate>{pub}</pubDate>\n"
            f"      <description>{escape(summary)}</description>\n"
            "    </item>"
        )

    now = format_datetime(datetime.now(timezone.utc))
    feed = (
        '<?xml version="1.0" encoding="UTF-8"?>\n'
        '<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">\n'
        "  <channel>\n"
        "    <title>Zakhwan Anuar Blog</title>\n"
        f"    <link>{SITE}/blog.html</link>\n"
        "    <description>Notes and thoughts on cybersecurity, CTF, and building security tools.</description>\n"
        "    <language>en</language>\n"
        f"    <lastBuildDate>{now}</lastBuildDate>\n"
        f'    <atom:link href="{SITE}/feed.xml" rel="self" type="application/rss+xml" />\n'
        + "\n".join(items)
        + "\n  </channel>\n</rss>\n"
    )

    OUT.write_text(feed, encoding="utf-8")
    print(f"Wrote {OUT} with {len(items)} items")


if __name__ == "__main__":
    main()
