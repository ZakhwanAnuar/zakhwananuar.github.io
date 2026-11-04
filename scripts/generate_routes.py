"""Create clean static content routes for GitHub Pages."""
from pathlib import Path
import re

ROOT = Path(__file__).resolve().parents[1]

def ids(filename):
    text = (ROOT / 'data' / filename).read_text(encoding='utf-8')
    return re.findall(r"\bid:\s*['\"]([^'\"]+)['\"]", text)

def fields(filename, field):
    text = (ROOT / 'data' / filename).read_text(encoding='utf-8')
    return re.findall(rf"\b{field}:\s*['\"]([^'\"]+)['\"]", text)

def slugify(value):
    return re.sub(r'[^a-z0-9]+', '-', value.lower()).strip('-')

def make_routes(source, folder, collection):
    template = (ROOT / source).read_text(encoding='utf-8')
    base = '../../../../' if collection == 'writeups.js' else '../../'
    template = template.replace('<head>', f'<head><base href="{base}">', 1)
    item_ids = ids(collection)
    ctf_names = fields('writeups.js', 'ctf') if collection == 'writeups.js' else []
    titles = fields('writeups.js', 'title') if collection == 'writeups.js' else []
    for index, item_id in enumerate(item_ids):
        if collection == 'writeups.js':
            target = ROOT / folder / 'events' / slugify(ctf_names[index]) / slugify(titles[index]) / 'index.html'
        else:
            target = ROOT / folder / item_id / 'index.html'
        target.parent.mkdir(parents=True, exist_ok=True)
        target.write_text(template, encoding='utf-8')
    return len(ids(collection))

def make_event_routes():
    template = (ROOT / 'ctf-event.html').read_text(encoding='utf-8')
    template = template.replace('<head>', '<head><base href="../../../">', 1)
    names = sorted(set(fields('writeups.js', 'ctf')))
    for name in names:
        target = ROOT / 'writeups' / 'events' / slugify(name) / 'index.html'
        target.parent.mkdir(parents=True, exist_ok=True)
        target.write_text(template, encoding='utf-8')
    return len(names)

def main():
    blogs = make_routes('blog-post.html', 'blog', 'blog.js')
    writeups = make_routes('writeup.html', 'writeups', 'writeups.js')
    projects = make_routes('projects.html', 'projects', 'projects.js')
    events = make_event_routes()
    print(f'Generated {blogs} blog routes, {writeups} writeup routes, {projects} project routes and {events} event routes.')

if __name__ == '__main__':
    main()
