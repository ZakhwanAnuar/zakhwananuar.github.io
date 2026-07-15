/* ================================================================
   projects.js — Projects page
   - Renders project cards from data/projects.js
   - Handles category filtering
================================================================ */

function renderProjects(filter = 'all') {
  const grid = document.getElementById('projectsGrid');
  if (!grid || typeof PROJECTS_DATA === 'undefined') return;

  const filtered = filter === 'all'
    ? PROJECTS_DATA
    : PROJECTS_DATA.filter(p => p.tags && p.tags.includes(filter));

  if (filtered.length === 0) {
    grid.innerHTML = '<p style="color:var(--text-3);font-size:0.9rem;">No projects found for this filter.</p>';
    return;
  }

  grid.innerHTML = filtered.map(p => `
    <div class="project-card fade-in-element">
      <div class="project-card-header">
        <div class="project-icon"><i class="${p.icon || 'fas fa-code'}"></i></div>
      </div>
      <h3 class="project-title">${p.title}</h3>
      <p class="project-description">${p.description}</p>
      <div class="project-tech">
        ${p.tech.map(t => `<span class="tech-tag">${t}</span>`).join('')}
      </div>
      ${(p.github || p.demo) ? `
      <div class="project-footer">
        ${p.github ? `<a href="${p.github}" target="_blank" class="project-link-btn"><i class="fab fa-github"></i> Code</a>` : ''}
        ${p.demo   ? `<a href="${p.demo}"   target="_blank" class="project-link-btn"><i class="fas fa-external-link-alt"></i> Demo</a>` : ''}
      </div>` : ''}
    </div>
  `).join('');

  // Re-init scroll animations for newly inserted elements
  document.querySelectorAll('.fade-in-element').forEach(el => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });
    observer.observe(el);
  });
}

// ---- Filter buttons ----
document.addEventListener('DOMContentLoaded', () => {
  renderProjects();

  const filterBtns = document.querySelectorAll('.filter-btn');
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      renderProjects(btn.dataset.filter);
    });
  });
});
