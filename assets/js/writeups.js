/* ================================================================
   assets/js/writeups.js — CTF Events listing page
   Groups writeups by CTF event name, renders event cards,
   supports search by event name and year filter.
================================================================ */

let currentYear = 'all';
let currentSearch = '';

/* ── Helpers ── */

function extractYear(dateStr) {
  const m = (dateStr || '').match(/\d{4}/);
  return m ? m[0] : 'Unknown';
}

function inferType(ctfName) {
  const n = ctfName.toLowerCase();
  if (n.includes('international') || n.includes('intl')) return 'international';
  if (n.includes('national'))  return 'national';
  if (n.includes('divide')) return 'internal';   // ← add more lines like this
  if (n.includes('local') || n.includes('uni') || n.includes('college') || n.includes('uniten')) return 'local';
  return 'open';
}

function typeLabel(type) {
  const map = {
    international: 'International',
    national:      'National',
    local:         'Local / Uni',
    open:          'Open',
    internal:      'Internal',   // ← add your custom label here
  };
  return map[type] || 'Open';
}

function typeTagClass(type) {
  const map = { international: 'ctf-tag-intl', national: 'ctf-tag-year', local: 'ctf-tag-type', open: 'ctf-tag-type' };
  return map[type] || 'ctf-tag-type';
}

const CAT_COLORS = {
  web:       { bg: 'rgba(0,217,255,0.15)',   color: '#00d9ff' },
  crypto:    { bg: 'rgba(124,58,237,0.15)',  color: '#a78bfa' },
  pwn:       { bg: 'rgba(255,71,87,0.2)',    color: '#ff6b7a' },
  rev:       { bg: 'rgba(255,107,53,0.15)',  color: '#ff9a72' },
  forensics: { bg: 'rgba(0,255,136,0.12)',   color: '#00ff88' },
  misc:      { bg: 'rgba(255,211,42,0.15)',  color: '#ffd32a' },
};

function catPill(cat) {
  const key = cat.toLowerCase();
  const c = CAT_COLORS[key] || { bg: 'rgba(100,100,100,0.2)', color: '#aaa' };
  return `<span class="ctf-event-cat-pill" style="background:${c.bg};color:${c.color};">${cat}</span>`;
}

/* ── Build event groups from WRITEUPS_DATA ── */

function buildEventGroups() {
  if (typeof WRITEUPS_DATA === 'undefined') return [];
  const map = {};
  let order = 0;
  WRITEUPS_DATA.forEach(wu => {
    const key = wu.ctf || 'Unknown CTF';
    if (!map[key]) {
      map[key] = {
        name: key,
        year: extractYear(wu.date),
        type: inferType(key),
        order: order++,        // first-appearance order in the data file
        challenges: [],
        categories: new Set(),
      };
    }
    map[key].challenges.push(wu);
    map[key].categories.add(wu.category);
  });
  // Sort by year descending, then by order in the data file
  // (so events within the same year follow the arrangement in data/writeups.js)
  return Object.values(map).sort((a, b) => {
    if (b.year !== a.year) return b.year.localeCompare(a.year);
    return a.order - b.order;
  });
}

/* ── Render ── */

function renderEventGrid() {
  const grid = document.getElementById('ctfEventsGrid');
  if (!grid) return;

  let events = buildEventGroups();

  // Year filter
  if (currentYear !== 'all') {
    events = events.filter(e => e.year === currentYear);
  }

  // Search
  if (currentSearch) {
    const q = currentSearch.toLowerCase();
    events = events.filter(e =>
      e.name.toLowerCase().includes(q) ||
      e.year.includes(q) ||
      typeLabel(e.type).toLowerCase().includes(q) ||
      [...e.categories].some(c => c.toLowerCase().includes(q))
    );
  }

  if (events.length === 0) {
    grid.innerHTML = `
      <div class="no-results">
        <i class="fas fa-flag" style="color:var(--text-3);"></i>
        No CTF events found. Try a different search or filter.
      </div>`;
    return;
  }

  grid.innerHTML = events.map(ev => {
    const cats = [...ev.categories];
    const count = ev.challenges.length;
    const slug  = encodeURIComponent(ev.name);

    return `
    <a href="ctf-event.html?ctf=${slug}" class="ctf-event-card fade-in-element">
      <h3 class="ctf-event-name">${ev.name}</h3>

      <div class="ctf-event-meta">
        <span class="ctf-tag ctf-tag-year">${ev.year}</span>
        <span class="ctf-tag ${typeTagClass(ev.type)}">${typeLabel(ev.type)}</span>
      </div>

      <div class="ctf-event-card-footer">
        <span class="ctf-event-challenge-count">
          <i class="fas fa-terminal" style="margin-right:5px;font-size:0.65rem;"></i>
          View writeups
        </span>
        <i class="fas fa-chevron-right ctf-event-arrow"></i>
      </div>
    </a>`;
  }).join('');

  // Animate
  grid.querySelectorAll('.fade-in-element').forEach(el => {
    requestAnimationFrame(() => el.classList.add('visible'));
  });
}

function renderYearFilters() {
  const bar = document.getElementById('yearFilterBar');
  if (!bar) return;

  const all = buildEventGroups();
  const years = [...new Set(all.map(e => e.year))].sort((a, b) => b.localeCompare(a));

  bar.innerHTML = `<button class="tag-filter-btn active" data-year="all">All Years</button>` +
    years.map(y => `<button class="tag-filter-btn" data-year="${y}">${y}</button>`).join('');

  bar.querySelectorAll('.tag-filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      bar.querySelectorAll('.tag-filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentYear = btn.dataset.year;
      renderEventGrid();
    });
  });
}

function renderStats() {
  if (typeof WRITEUPS_DATA === 'undefined') return;
  const events = buildEventGroups();
  const totalChallenges = WRITEUPS_DATA.length;
  const allCats = new Set(WRITEUPS_DATA.map(w => w.category));

  const se = document.getElementById('statEvents');
  const sc = document.getElementById('statChallenges');
  const sk = document.getElementById('statCategories');
  if (se) se.textContent = events.length;
  if (sc) sc.textContent = totalChallenges;
  if (sk) sk.textContent = allCats.size;
}

/* ── Init ── */

document.addEventListener('DOMContentLoaded', () => {
  renderYearFilters();
  renderEventGrid();

  const searchInput = document.getElementById('writeupSearch');
  if (searchInput) {
    searchInput.addEventListener('input', () => {
      currentSearch = searchInput.value.trim();
      renderEventGrid();
    });
  }
});
