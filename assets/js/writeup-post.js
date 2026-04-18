/* ================================================================
   writeup-post.js — Renders an individual writeup
   Reads the ?id= URL parameter, finds the matching writeup
   in WRITEUPS_DATA, and renders it.
================================================================ */

document.addEventListener('DOMContentLoaded', () => {
  if (typeof WRITEUPS_DATA === 'undefined') return;

  // Get the writeup ID from the URL query string: writeup.html?id=some-id
  const params = new URLSearchParams(window.location.search);
  const id     = params.get('id');

  if (!id) {
    showError('No writeup specified.');
    return;
  }

  const index   = WRITEUPS_DATA.findIndex(wu => wu.id === id);
  const writeup = WRITEUPS_DATA[index];

  if (!writeup) {
    showError('Writeup not found. It may have been removed or the link is incorrect.');
    return;
  }

  // Set page title
  document.title = `${writeup.title} — Writeup`;

  // ---- Update back link to CTF event page ----
  const backLink = document.getElementById('backLink');
  const backLinkText = document.getElementById('backLinkText');
  if (backLink && writeup.ctf) {
    const ctfSlug = encodeURIComponent(writeup.ctf);
    backLink.href = `ctf-event.html?ctf=${ctfSlug}`;
    if (backLinkText) backLinkText.textContent = writeup.ctf;
  }

  // ---- Render header ----
  const header = document.getElementById('writeupPostHeader');
  header.innerHTML = `
    <div class="post-category-row">
      <span class="writeup-category cat-${writeup.category.toLowerCase()}">${writeup.category}</span>
      <span style="font-size:0.78rem;color:var(--text-3);font-family:var(--font-mono);">${writeup.difficulty}</span>
    </div>
    <h1 class="post-title">${writeup.title}</h1>
    <div class="post-meta">
      <span class="post-meta-item"><i class="fas fa-flag"></i> ${writeup.ctf || 'CTF'}</span>
      <span class="post-meta-item"><i class="far fa-calendar"></i> ${writeup.date}</span>
      ${writeup.points ? `<span class="post-meta-item"><i class="fas fa-star"></i> ${writeup.points} pts</span>` : ''}
    </div>
  `;

  // ---- Render body ----
  // The content field supports Markdown (via marked.js)
  const body    = document.getElementById('writeupPostBody');
  const content = writeup.content || '_No content yet._';

  if (typeof marked !== 'undefined') {
    // Configure marked for better output
    marked.setOptions({ breaks: true, gfm: true });
    body.innerHTML = marked.parse(content);

    // Syntax highlight code blocks if highlight.js is loaded
    if (typeof hljs !== 'undefined') {
      body.querySelectorAll('pre code').forEach(block => {
        hljs.highlightElement(block);
      });
    }
  } else {
    // Fallback: plain text
    body.textContent = content;
  }

  // ---- Render prev/next navigation ----
  const nav  = document.getElementById('writeupPostNav');
  const prev = WRITEUPS_DATA[index + 1]; // newer writeups are at lower indices
  const next = WRITEUPS_DATA[index - 1];

  nav.innerHTML = `
    <div>
      ${prev ? `
        <a href="writeup.html?id=${prev.id}" class="post-nav-link">
          <span class="post-nav-label">← Previous</span>
          <span class="post-nav-title">${prev.title}</span>
        </a>` : '<div></div>'}
    </div>
    <div>
      ${next ? `
        <a href="writeup.html?id=${next.id}" class="post-nav-link next">
          <span class="post-nav-label">Next →</span>
          <span class="post-nav-title">${next.title}</span>
        </a>` : '<div></div>'}
    </div>
  `;
});

function showError(msg) {
  const body = document.getElementById('writeupPostBody');
  if (body) {
    body.innerHTML = `
      <div style="padding:40px;text-align:center;color:var(--text-3);">
        <i class="fas fa-exclamation-circle" style="font-size:2rem;color:var(--red);margin-bottom:16px;display:block;"></i>
        <p>${msg}</p>
        <a href="writeups.html" class="btn btn-secondary" style="margin-top:24px;display:inline-flex;">← Back to Writeups</a>
      </div>`;
  }
}
