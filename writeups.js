/* ================================================================
   writeups.js — Writeups listing page
   - Renders writeup cards from data/writeups.js
   - Handles category filtering
   - Handles search
================================================================ */

let currentFilter = 'all';
let currentSearch = '';

function renderWriteups() {
  const list = document.getElementById('writeupsList');
  if (!list || typeof WRITEUPS_DATA === 'undefined') return;

  let data = WRITEUPS_DATA;

  // Apply category filter
  if (currentFilter !== 'all') {
    data = data.filter(wu => wu.category.toLowerCase() === currentFilter);
  }

  // Apply search filter
  if (currentSearch) {
    const q = currentSearch.toLowerCase();
    data = data.filter(wu =>
      wu.title.toLowerCase().includes(q)   ||
      wu.summary.toLowerCase().includes(q) ||
      wu.category.toLowerCase().includes(q)
    );
  }

  if (data.length === 0) {
    list.innerHTML = `
      <div style="padding:40px;text-align:center;color:var(--text-3);font-size:0.9rem;">
        No writeups found. Try a different filter or search term.
      </div>`;
    return;
  }

  list.innerHTML = data.map(wu => `
    <a href="writeup.html?id=${wu.id}" class="writeup-card fade-in-element">
      <div class="writeup-card-badge">
        <span class="writeup-category cat-${wu.category.toLowerCase()}">${wu.category}</span>
        <span class="writeup-difficulty">${wu.difficulty}</span>
      </div>
      <div class="writeup-card-body">
        <h3 class="writeup-card-title">${wu.title}</h3>
        <div class="writeup-card-meta">
          <span class="writeup-card-meta-item"><i class="fas fa-flag"></i> ${wu.ctf || 'CTF'}</span>
          <span class="writeup-card-meta-item"><i class="far fa-calendar"></i> ${wu.date}</span>
        </div>
        <p class="writeup-card-summary">${wu.summary}</p>
      </div>
      <i class="fas fa-chevron-right writeup-card-arrow"></i>
    </a>
  `).join('');

  // Animate new elements
  list.querySelectorAll('.fade-in-element').forEach(el => {
    requestAnimationFrame(() => el.classList.add('visible'));
  });
}

document.addEventListener('DOMContentLoaded', () => {
  renderWriteups();

  // Category filter
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentFilter = btn.dataset.filter;
      renderWriteups();
    });
  });

  // Search
  const searchInput = document.getElementById('writeupSearch');
  if (searchInput) {
    searchInput.addEventListener('input', () => {
      currentSearch = searchInput.value.trim();
      renderWriteups();
    });
  }
});
