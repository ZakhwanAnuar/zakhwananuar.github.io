/* ================================================================
   assets/js/ctf-event.js — Individual CTF event challenge listing
   Reads ?ctf= URL param, renders event header + challenge list.
   Supports search by challenge name/summary, and category filter.
================================================================ */

let currentFilter = 'all';
let currentSearch = '';
let eventChallenges = [];

/* ── Helpers ── */

function extractYear(dateStr) {
  const m = (dateStr || '').match(/\d{4}/);
  return m ? m[0] : 'Unknown';
}

function inferType(ctfName) {
  const n = ctfName.toLowerCase();
  if (n.includes('international') || n.includes('intl')) return 'international';
  if (n.includes('national'))  return 'national';
  if (n.includes('local') || n.includes('uni') || n.includes('college') || n.includes('uniten')) return 'local';
  return 'open';
}

function typeLabel(type) {
  const map = { international: 'International', national: 'National', local: 'Local / Uni', open: 'Open' };
  return map[type] || 'Open';
}

function typeTagClass(type) {
  const map = { international: 'event-tag-intl', national: 'event-tag-year', local: 'event-tag-type', open: 'event-tag-type' };
  return map[type] || 'event-tag-type';
}

/* ── Render event header ── */

function renderEventHeader(ctfName, challenges) {
  const header = document.getElementById('eventHeader');
  if (!header) return;

  const year = extractYear(challenges[0]?.date || '');
  const type = inferType(ctfName);
  const categories = [...new Set(challenges.map(c => c.category))];
  const diffCounts = challenges.reduce((acc, c) => {
    acc[c.difficulty] = (acc[c.difficulty] || 0) + 1;
    return acc;
  }, {});

  document.title = `${ctfName} — Writeups`;

  header.innerHTML = `
    <div class="event-header-card">
      <div class="event-header-top">
        <div class="event-title-block">
          <h1 class="event-name">${ctfName}</h1>
          <div class="event-tags">
            <span class="event-tag event-tag-year">${year}</span>
            <span class="event-tag ${typeTagClass(type)}">${typeLabel(type)}</span>
            ${categories.map(cat => {
              const key = cat.toLowerCase();
              const colors = {
                web:       { bg: 'rgba(0,217,255,0.15)',   color: '#00d9ff' },
                crypto:    { bg: 'rgba(124,58,237,0.15)',  color: '#a78bfa' },
                pwn:       { bg: 'rgba(255,71,87,0.2)',    color: '#ff6b7a' },
                rev:       { bg: 'rgba(255,107,53,0.15)',  color: '#ff9a72' },
                forensics: { bg: 'rgba(0,255,136,0.12)',   color: '#00ff88' },
                misc:      { bg: 'rgba(255,211,42,0.15)',  color: '#ffd32a' },
              };
              const c = colors[key] || { bg: 'rgba(100,100,100,0.2)', color: '#aaa' };
              return `<span class="event-tag" style="background:${c.bg};color:${c.color};border-color:${c.color}33;">${cat}</span>`;
            }).join('')}
          </div>
        </div>
      </div>

    </div>`;
}

/* ── Render category filter buttons ── */

function renderCategoryFilters(challenges) {
  const bar = document.getElementById('categoryFilterBar');
  if (!bar) return;

  const cats = [...new Set(challenges.map(c => c.category))];

  bar.innerHTML = `<button class="filter-btn active" data-filter="all">All</button>` +
    cats.map(cat =>
      `<button class="filter-btn" data-filter="${cat.toLowerCase()}">${cat}</button>`
    ).join('');

  bar.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      bar.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentFilter = btn.dataset.filter;
      renderChallenges();
    });
  });
}

/* ── Render challenge list ── */

function renderChallenges() {
  const list = document.getElementById('challengesList');
  if (!list) return;

  let data = eventChallenges;

  if (currentFilter !== 'all') {
    data = data.filter(wu => wu.category.toLowerCase() === currentFilter);
  }

  if (currentSearch) {
    const q = currentSearch.toLowerCase();
    data = data.filter(wu =>
      wu.title.toLowerCase().includes(q) ||
      wu.summary.toLowerCase().includes(q) ||
      wu.category.toLowerCase().includes(q) ||
      wu.difficulty.toLowerCase().includes(q)
    );
  }

  if (data.length === 0) {
    list.innerHTML = `
      <div class="no-challenges">
        <i class="fas fa-search" style="color:var(--text-3);"></i>
        No challenges found. Try a different filter or search term.
      </div>`;
    return;
  }

  list.innerHTML = data.map(wu => `
    <a href="writeup.html?id=${wu.id}" class="writeup-card fade-in-element">
      <div class="writeup-card-badge">
        <span class="writeup-category cat-${wu.category.toLowerCase()}">${wu.category}</span>
        <span class="writeup-difficulty">${wu.difficulty}</span>
        ${wu.points ? `<span class="writeup-difficulty" style="color:var(--accent);">${wu.points} pts</span>` : ''}
      </div>
      <div class="writeup-card-body">
        <h3 class="writeup-card-title">${wu.title}</h3>
        <div class="writeup-card-meta">
          <span class="writeup-card-meta-item"><i class="far fa-calendar"></i> ${wu.date}</span>
        </div>
        <p class="writeup-card-summary">${wu.summary}</p>
      </div>
      <i class="fas fa-chevron-right writeup-card-arrow"></i>
    </a>
  `).join('');

  list.querySelectorAll('.fade-in-element').forEach(el => {
    requestAnimationFrame(() => el.classList.add('visible'));
  });
}

/* ── Init ── */

document.addEventListener('DOMContentLoaded', () => {
  if (typeof WRITEUPS_DATA === 'undefined') {
    showError('Writeup data could not be loaded.');
    return;
  }

  const params  = new URLSearchParams(window.location.search);
  const ctfName = decodeURIComponent(params.get('ctf') || '');

  if (!ctfName) {
    showError('No CTF event specified.');
    return;
  }

  eventChallenges = WRITEUPS_DATA.filter(wu => wu.ctf === ctfName);

  if (eventChallenges.length === 0) {
    showError(`No writeups found for "${ctfName}".`);
    return;
  }

  renderEventHeader(ctfName, eventChallenges);
  renderCategoryFilters(eventChallenges);
  renderChallenges();

  const searchInput = document.getElementById('challengeSearch');
  if (searchInput) {
    searchInput.addEventListener('input', () => {
      currentSearch = searchInput.value.trim();
      renderChallenges();
    });
  }
});

function showError(msg) {
  const list = document.getElementById('challengesList');
  if (list) {
    list.innerHTML = `
      <div class="no-challenges">
        <i class="fas fa-exclamation-circle" style="color:var(--red);"></i>
        <p>${msg}</p>
        <a href="writeups.html" class="btn btn-secondary" style="margin-top:20px;display:inline-flex;">← Back to Writeups</a>
      </div>`;
  }
}
