"""Rebuild shared HTML shells. Content collections remain in data/*.js."""
from pathlib import Path
from html.parser import HTMLParser
from html import escape

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / 'source'


class Sections(HTMLParser):
    """Extract complete main/style elements from the preserved original pages."""
    def __init__(self, text):
        super().__init__(convert_charrefs=False)
        self.parts = {'main': [], 'style': [], 'script': []}
        self.active = None
        self.depth = 0
        self.feed(text)

    def handle_starttag(self, tag, attrs):
        if self.active is None and tag in self.parts:
            self.active = tag
            self.depth = 1
        elif self.active and tag == self.active:
            self.depth += 1
        if self.active:
            self.parts[self.active].append(self.get_starttag_text())

    def handle_endtag(self, tag):
        if self.active:
            self.parts[self.active].append(f'</{tag}>')
            if tag == self.active:
                self.depth -= 1
                if not self.depth:
                    self.active = None

    def handle_startendtag(self, tag, attrs):
        if self.active:
            self.parts[self.active].append(self.get_starttag_text())

    def handle_data(self, text):
        if self.active:
            self.parts[self.active].append(text)

    def handle_entityref(self, name):
        self.handle_data('&' + name + ';')

    def handle_charref(self, name):
        self.handle_data('&#' + name + ';')


NAV = [('index', 'Home'), ('about', 'About'), ('projects', 'Projects'),
       ('writeups', 'CTF writeups'), ('blog', 'Blog'), ('achievements', 'Achievements'),
       ('games', 'Playground'), ('resume', 'Resume'), ('contact', 'Contact')]


def icon(name):
    return f'<i class="fa-solid fa-{name}" aria-hidden="true"></i>'


def shell(slug, title, content, datasets=(), legacy=False, extra_scripts=()):
    active = {'blog-post': 'blog', 'writeup': 'writeups', 'ctf-event': 'writeups'}.get(slug, slug)
    primary = [('about', 'About'), ('projects', 'Projects'), ('writeups', 'Writeups'),
               ('blog', 'Blog'), ('achievements', 'Achievements'), ('resume', 'Resume'), ('contact', 'Contact')]
    primary_links = ''.join(f'<a href="{key}.html" {"aria-current=\"page\"" if key == active else ""}>{label}</a>' for key, label in primary)
    links = ''.join(f'<a href="{key}.html" {"aria-current=\"page\"" if key == slug else ""}><span class="mono">0{i}</span>{label}<span aria-hidden="true">&#8599;</span></a>' for i, (key, label) in enumerate(NAV, 1))
    scripts = [f'data/{name}.js' for name in datasets]
    if slug in ('blog-post', 'writeup'):
        scripts += ['assets/vendor/marked.min.js', 'assets/vendor/highlight.min.js']
    scripts += ['assets/js/media.js', 'assets/js/core.js', 'assets/js/catalog.js', 'assets/js/reader.js', 'assets/js/visitors.js']
    scripts += list(extra_scripts)
    script_tags = ''.join(f'<script defer src="{src}"></script>' for src in scripts)
    css = '<link rel="stylesheet" href="assets/css/main.css">' if legacy else ''
    return f'''<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>{escape(title) if slug == 'index' else escape(title) + ' | Zakhwan Anuar'}</title>
<meta name="description" content="Zakhwan Anuar. Cybersecurity student, builder and CTF player. Projects, investigations, field notes and experiments.">
<meta property="og:title" content="{escape(title)} | Zakhwan Anuar"><meta property="og:type" content="website">
<meta property="og:image" content="https://zakhwananuar.my/assets/images/og-default1.png"><meta name="twitter:card" content="summary_large_image">
<link rel="canonical" href="https://zakhwananuar.my/{'' if slug == 'index' else slug + '.html'}">
{'<meta name="robots" content="noindex, nofollow">' if slug in ('waklu', 'notes', '404') else ''}
<link rel="icon" href="assets/images/favicon.svg"><link rel="stylesheet" href="assets/vendor/icons.css">
{css}<link rel="stylesheet" href="assets/css/style.css"><link rel="stylesheet" href="assets/css/calm.css"><link rel="stylesheet" href="assets/vendor/highlight.css">
{script_tags}</head><body data-page="{slug}" class="{'legacy' if legacy else ''}">
<a class="skip" href="#content">Skip to content</a><div class="read-progress" aria-hidden="true"></div><div class="scroll-progress" id="scroll-progress" aria-hidden="true"></div>
<header class="site-header"><a class="wordmark" href="index.html" aria-label="Home">Home</a><nav class="quick-nav" aria-label="Main navigation">{primary_links}</nav><a class="header-secret" href="waklu.html" aria-label="Secret page" title="A quiet corner">{icon('key')}</a><button class="menu-toggle" aria-label="Open navigation" aria-expanded="false" aria-controls="site-menu">Menu {icon('bars')}</button></header>
<dialog id="site-menu" class="site-menu"><div class="menu-top"><span class="mono">ZAKHWAN ANUAR</span><button class="icon-button" data-close aria-label="Close site index">{icon('xmark')}</button></div><nav aria-label="Main navigation">{links}</nav><div class="menu-bottom mono">KUALA LUMPUR, MALAYSIA <a href="mailto:zakhwananuar05@gmail.com">GET IN TOUCH &#8599;</a></div></dialog>
{content}
<footer class="site-footer"><p class="footer-copy"><span>&copy; <span data-year></span> Zakhwan Anuar</span><br>Still learning. Still building.</p><div class="footer-links"><a href="https://github.com/zakhwananuar" target="_blank" rel="noopener">GitHub &#8599;</a><a href="https://linkedin.com/in/zakhwan-anuar-88800a217" target="_blank" rel="noopener">LinkedIn &#8599;</a></div><p class="footer-visits"><i class="fa-solid fa-eye" aria-hidden="true"></i> <span id="visitorCount">...</span> visits</p><a href="#" class="icon-button" aria-label="Back to top">{icon('arrow-up')}</a></footer>
<div class="cursor" aria-hidden="true"><span></span></div><div class="toast" role="status"></div>
<dialog id="image-viewer" class="image-viewer"><div class="viewer-top"><span id="viewer-caption"></span><button class="icon-button" data-close aria-label="Close image">{icon('xmark')}</button></div><img alt=""><div class="viewer-bottom"><button class="icon-button" id="image-prev" aria-label="Previous image">{icon('arrow-left')}</button><span class="mono" id="image-count"></span><button class="icon-button" id="image-next" aria-label="Next image">{icon('arrow-right')}</button></div></dialog>
<noscript><p class="no-js">The index and static pages work without JavaScript. Enable JavaScript to browse the content collections and play games.</p></noscript></body></html>'''


def heading(number, title, description):
    return f'<div class="page-intro"><span class="eyebrow">ZAKHWAN ANUAR</span><h1>{title}</h1><p>{description}</p></div>'


def build():
    pages = {
        'index': ('Zakhwan Anuar', ('projects', 'blog', 'writeups', 'achievements', 'curation')),
        'projects': ('Selected projects', ('projects', 'blog')),
        'writeups': ('CTF fieldwork', ('writeups',)),
        'ctf-event': ('CTF event', ('writeups',)),
        'blog': ('The journal', ('blog',)),
        'blog-post': ('Journal entry', ('blog',)),
        'writeup': ('Investigation', ('writeups',)),
        'achievements': ('The archive', ('achievements',)),
        'games': ('The playground', ()),
    }
    for slug, (title, datasets) in pages.items():
        body = (SOURCE / f'{slug}.html').read_text(encoding='utf-8')
        (ROOT / f'{slug}.html').write_text(shell(slug, title, body, datasets), encoding='utf-8')
    for slug, title, desc in [
        ('about', 'A bit about me.', 'Cybersecurity, university life, and the things in between.'),
        ('resume', 'Resume', 'Education, experience, and skills.'),
        ('contact', 'Get in touch.', 'A project, a question, or just a hello.')]:
        parts = Sections((SOURCE / 'original' / f'{slug}.html').read_text(encoding='utf-8'))
        content = ''.join(parts.parts['main']).replace('<main ', '<main id="content" ')
        content = heading('PERSONAL', title, desc) + content
        if slug == 'resume':
            content = content.replace('<main ', '<div class="resume-download"><a class="text-link" href="https://drive.google.com/drive/folders/1nH8GX2w_jPtPmlvKncR_uCtixUjM6lip?usp=sharing" target="_blank" rel="noopener">Download resume &#8599;</a></div><main ', 1)
        (ROOT / f'{slug}.html').write_text(shell(slug, title, content, legacy=True), encoding='utf-8')
    for original in (SOURCE / 'original').glob('game-*.html'):
        parts = Sections(original.read_text(encoding='utf-8'))
        slug = original.stem
        title = {'game-fps': 'Breach Point'}.get(slug, slug[5:].replace('-', ' ').title())
        styles = ''.join(parts.parts['style']).replace('<style>', '').replace('</style>', '')
        (ROOT / 'assets' / 'css' / f'{slug}.css').write_text(styles, encoding='utf-8')
        content = heading('PLAYGROUND', title, '<a href="games.html">&#8592; Back to the playground</a>') + ''.join(parts.parts['main']).replace('<main ', '<main id="content" ')
        scripts = ('assets/vendor/three.min.js', 'assets/js/fps.js') if slug == 'game-fps' else ('assets/js/games.js',)
        result = shell(slug, title, content, legacy=True, extra_scripts=scripts)
        result = result.replace('</head>', f'<link rel="stylesheet" href="assets/css/{slug}.css"></head>')
        (ROOT / original.name).write_text(result, encoding='utf-8')
    for slug, title in [('waklu', 'The unlisted board'), ('404', 'A wrong turn')]:
        original = (SOURCE / 'original' / f'{slug}.html').read_text(encoding='utf-8')
        parts = Sections(original)
        styles = ''.join(parts.parts['style']).replace('<style>', '').replace('</style>', '')
        styles = styles.replace('clamp(4.5rem, 18vw, 9rem)', '100px').replace('letter-spacing: -0.02em', 'letter-spacing: 0')
        (ROOT / 'assets/css' / f'{slug}.css').write_text(styles, encoding='utf-8')
        # The board/404 each have one inline behaviour script. Keep it as a standalone asset.
        class InlineScript(HTMLParser):
            def __init__(self, text):
                super().__init__(convert_charrefs=False)
                self.inside = False
                self.code = []
                self.feed(text)
            def handle_starttag(self, tag, attrs):
                if tag == 'script':
                    self.inside = 'src' not in dict(attrs)
            def handle_endtag(self, tag):
                if tag == 'script':
                    self.inside = False
            def handle_data(self, data):
                if self.inside:
                    self.code.append(data)
        code = ''.join(InlineScript(original).code)
        if slug == '404':
            code = code.replace("'/", "'")
        (ROOT / 'assets/js' / f'{slug}.js').write_text(code, encoding='utf-8')
        content = ''.join(parts.parts['main']).replace('<main ', '<main id="content" ').replace('href="/', 'href="')
        if slug == 'waklu':
            content = heading('UNLISTED', title, 'A shared corner of the internet.') + content
        scripts = [f'https://www.gstatic.com/firebasejs/10.12.2/firebase-{name}-compat.js' for name in ('app', 'database', 'storage')] if slug == 'waklu' else []
        scripts.append(f'assets/js/{slug}.js')
        result = shell(slug, title, content, legacy=True, extra_scripts=scripts)
        result = result.replace('</head>', f'<link rel="stylesheet" href="assets/css/{slug}.css"></head>')
        (ROOT / f'{slug}.html').write_text(result, encoding='utf-8')
    note = '<main id="content" class="catalog-page"><div class="page-intro"><span class="eyebrow">UNLISTED / A LITTLE NOTE</span><h1>Holla!</h1><p>tell your man and others to join my next workshop yaa &#128541;</p></div><a class="text-link" href="games.html">Back to the playground &#8599;</a></main>'
    (ROOT / 'notes.html').write_text(shell('notes', 'A little note', note), encoding='utf-8')
    # Correct the original fallback references, including those on hidden pages.
    for path in [*ROOT.glob('*.html'), * (ROOT / 'assets/js').glob('*.js')]:
        text = path.read_text(encoding='utf-8')
        updated = text.replace('og-default.png', 'og-default1.png')
        if updated != text:
            path.write_text(updated, encoding='utf-8')
    print('Built 21 pages with one shared navigation/footer shell.')


if __name__ == '__main__':
    build()
