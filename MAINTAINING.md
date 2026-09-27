# Maintaining Zakhwan's Website

This is a generated static site. Edit the source and data files, then rebuild the HTML pages.

## Where To Edit

- `data/projects.js`: project records and project metadata.
- `data/blog.js`: blog posts and summaries.
- `data/writeups.js`: writeups, events, categories and Markdown content.
- `data/achievements.js`: achievement records and gallery images.
- `data/curation.js`: homepage featured writeup, evidence images and featured achievement.
- `source/index.html`: homepage structure and copy.
- `source/*.html`: collection page structure and copy.
- `source/original/*.html`: preserved legacy content for About, Resume, Contact and games.
- `assets/reimagined/calm.css`: current visual theme and responsive overrides.
- `assets/reimagined/style.css`: shared layout and legacy compatibility rules.
- `assets/reimagined/core.js`: shared menu, image viewer, scroll behavior and global interactions.
- `scripts/build.py`: shared HTML shell, navigation, footer and page generation.

## Build

From `E:\Zakhwan-Reimagined`:

```powershell
python scripts/build.py
```

Never edit generated root HTML directly. Rebuild after changing `source`, `data`, shared scripts or styles.

## Verification

Run the focused checks after layout or interaction changes:

```powershell
$env:NODE_PATH='C:\Users\User\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\node_modules'
node scripts/verify-navigation.cjs
node scripts/verify-details.cjs
node scripts/verify.cjs
```

Use `scripts/audit-content.cjs` after changing image paths or Markdown content. The `verification/` folder contains generated screenshots and is not a source of truth.

## Safe Update Pattern

1. Update data or source files.
2. Rebuild with `python scripts/build.py`.
3. Run the relevant verification script.
4. Open the affected page at desktop and mobile widths.
5. Check generated HTML is not being manually edited.
