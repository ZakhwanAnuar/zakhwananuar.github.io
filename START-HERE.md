# Zakhwan Anuar: Reimagined

Open `index.html` directly in a browser. No server, package installation, or build is needed to use this copy.

This is a separate redesign in `E:\Zakhwan-Reimagined`. The original repository at `D:\GitLink-GithubWebsite` is untouched. Nothing has been deployed.

## Creative direction

The current direction is a dark personal website with stronger visual character. The original Holla greeting and Syne typography connect it to the existing identity. Locally hosted DM Sans keeps body text readable. Muted teal, violet, and rose distinguish technical work and personal writing without neon, fake terminals, or hacker decorations.

The introduction fills the opening viewport, with a small scroll cue and next-section marker. The selected writeup and actual UMCS competition photograph appear after scrolling. Desktop navigation shows Home, About, Projects, Writeups, Blog, Achievements, Resume, and Contact, with an active-page highlight; narrow screens use the full menu.

The selected writeup has switchable real evidence screenshots. The project selection has keyboard-accessible tabs that show excerpts from the existing build notes. Change homepage selections in `data/curation.js`; the original four content collections stay unchanged. Interest links open filtered collections, and the featured achievement opens its full photo gallery.

There is no animated hero, custom cursor, fake terminal on the homepage, or floating chapter navigator. Projects open with source links and related build stories. CTF browsing follows event -> challenge -> full writeup. The blog includes tag filters, search, sorting, contents, code-copy controls, image enlargement, related posts, and reading progress. The archive retains every original photograph in its full-size viewer.

## Content

The original four JavaScript data files are retained byte-for-byte:

- `data/projects.js`: 5 projects.
- `data/blog.js`: 10 complete Markdown posts.
- `data/writeups.js`: 11 complete Markdown writeups across 3 events.
- `data/achievements.js`: 9 achievements and their image sets.

Update these files as before. New entries appear automatically. No framework migration or CMS is involved.

Biography, resume entries, contact details, game logic, downloads, and hidden-page content are preserved. The resume button retains the original Google Drive destination because the local PDF is a placeholder. The contact form retains its original Formcarry endpoint.

## Structure

```text
index.html, projects.html, ...  Generated, browser-ready pages
data/                         Original content collections
data/curation.js               Homepage writeup, evidence images, and photo selection
assets/fonts/                 Locally hosted Syne and DM Sans
source/*.html                 New page bodies
source/original/              Preserved original HTML for content extraction
assets/reimagined/style.css   Shared layout and component foundations
assets/reimagined/calm.css    Current dark theme and personal homepage
assets/reimagined/core.js     Menu, image viewer, utilities
assets/reimagined/catalog.js  Content lists, filters, project exhibits
assets/reimagined/reader.js   Markdown reading views
assets/reimagined/motion.js   Previous iteration; not loaded
assets/reimagined/chapters.js Previous iteration; not loaded
assets/reimagined/media/     Optimized photo previews
assets/vendor/                Local Markdown, highlighting, icons, Three.js
assets/js/games.js, fps.js    Original game engines
assets/css/main.css           Original game/content layout compatibility
scripts/build.py              Shared page-shell generator
scripts/verify.cjs            Browser verification
scripts/audit-content.cjs     Markdown image-path audit
verification/                 Desktop and mobile screenshots
```

For navigation, footer, or metadata changes, edit `scripts/build.py`. For new page layouts, edit `source/*.html`. Then run `python scripts/build.py` (Python 3.12+). The generated HTML remains static and can be deployed to GitHub Pages as before.

For biography, resume, game markup, or the hidden board, edit the appropriate `source/original/*.html`; the build extracts the preserved content and applies the shared shell. Re-running the build also extracts the original game/hidden-page inline styles and hidden-page scripts into separate assets.

## Quality and compatibility

- No forced scroll interception. Native anchors, browser back, keyboard focus, Escape-to-close dialogs, and touch scrolling remain available.
- Reduced motion removes transitions and smooth scrolling. The homepage has no continuous animation.
- The native cursor is used on every device.
- Social-image references now point to the existing `og-default1.png` asset.
- The missing `--surface-2` variable is defined.
- The legacy `Forensics/...` Markdown image path is normalized without rewriting the technical content.
- All 21 top-level HTML pages use one shared shell. Original browser games retain their controls and local score storage.
- Thirty local photograph previews were compressed from about 5.24 MB to 2.46 MB total. Original files remain available to the image viewer.
- Hidden pages remain noindex. Type `holla` outside form fields for a small greeting. The original 404 commands remain available, including the route to the unlisted board.

Core browsing, Markdown rendering, icons, and games use local assets. External project links, Google Drive, Formcarry, and the original Firebase shared board require internet access. The copied visitor-counter script is not loaded by the new shell, so local testing does not increment production visits.

The existing Breach Point and Aim Trainer are desktop games. The playground remains available on phones; the original games retain their device limitations.

## Verification

`node scripts/audit-content.cjs` checks that local content images exist. `scripts/verify.cjs` requires Playwright and installed Chrome; it checks desktop/mobile page rendering, search/filter results, dialog navigation, CTF routes, article rendering, and reduced motion. `scripts/optimize-images.cjs` optionally regenerates photo previews using Sharp. The optimized previews are already included.

The external contact submission, production Firebase writes, and deployment are not exercised by local verification.
