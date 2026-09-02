/* ================================================================
   home.js — Homepage specific JS
   - Matrix rain canvas background
   - Typing effect for hero subtitle
   - Terminal animation
   - Render recent writeups and featured projects from data files
================================================================ */

// ================================================================
// MATRIX RAIN CANVAS
// ================================================================
function initMatrix() {
  const canvas = document.getElementById('matrixCanvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let drops = [];
  const chars = 'アイウエオカキクケコサシスセソタチツテトナニヌネノ0123456789ABCDEF<>/{}[]|\\!@#$%^&*';
  const fontSize = 13;

  function resize() {
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    const columns = Math.floor(canvas.width / fontSize);
    drops = Array(columns).fill(1);
  }

  resize();
  window.addEventListener('resize', resize, { passive: true });

  function draw() {
    ctx.fillStyle = 'rgba(10,12,16,0.05)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = '#00d9ff';
    ctx.font = `${fontSize}px 'JetBrains Mono', monospace`;

    drops.forEach((y, i) => {
      const char = chars[Math.floor(Math.random() * chars.length)];
      ctx.fillStyle = Math.random() > 0.98 ? '#ffffff' : '#00d9ff';
      ctx.globalAlpha = Math.random() * 0.4 + 0.05;
      ctx.fillText(char, i * fontSize, y * fontSize);
      ctx.globalAlpha = 1;

      if (y * fontSize > canvas.height && Math.random() > 0.975) {
        drops[i] = 0;
      }
      drops[i]++;
    });
  }

  setInterval(draw, 60);
}

// ================================================================
// TYPING EFFECT
// ================================================================
function initTyping() {
  const el = document.getElementById('typedText');
  if (!el) return;

  const strings = [
    'Cybersecurity Student',
    'CTF Player',
    'Digital Forensics',
    'Web Exploitation',
    'Always Learning',
  ];

  let strIndex = 0;
  let charIndex = 0;
  let deleting = false;

  function type() {
    const current = strings[strIndex];
    el.textContent = deleting
      ? current.substring(0, charIndex--)
      : current.substring(0, charIndex++);

    let delay = deleting ? 40 : 80;

    if (!deleting && charIndex > current.length) {
      delay = 2000;
      deleting = true;
    } else if (deleting && charIndex < 0) {
      deleting = false;
      strIndex = (strIndex + 1) % strings.length;
      charIndex = 0;
      delay = 300;
    }

    setTimeout(type, delay);
  }

  type();
}

// ================================================================
// TERMINAL ANIMATION
// ================================================================
function initTerminal() {
  const body = document.getElementById('terminalBody');
  if (!body) return;

  const lines = [
    { type: 'cmd',    text: 'cat whoami.txt' },
    { type: 'output', text: '<span class="key">name:</span>     <span class="val">Zakhwan Anuar</span>' },
    { type: 'output', text: '<span class="key">role:</span>     <span class="val">Cybersecurity Student</span>' },
    { type: 'output', text: '<span class="key">location:</span> <span class="val">Kuala Lumpur, Malaysia</span>' },
    { type: 'blank',  text: '' },
    { type: 'cmd',    text: 'cat interests.txt' },
    { type: 'output', text: '<span class="val">▸ Digital Forensics</span>' },
    { type: 'output', text: '<span class="val">▸ Reverse Engineering</span>' },
    { type: 'output', text: '<span class="val">▸ Malware Analysis</span>' },
    { type: 'blank',  text: '' },
    { type: 'cmd',    text: 'echo $STATUS' },
    { type: 'output', text: '<span class="val" style="color:var(--green)">Open to internships & collaborations ✓</span>' },
  ];

  lines.forEach((line, i) => {
    setTimeout(() => {
      const div = document.createElement('div');
      div.classList.add('t-line');
      div.style.animationDelay = '0s';

      if (line.type === 'blank') {
        div.innerHTML = '&nbsp;';
      } else if (line.type === 'cmd') {
        div.innerHTML = `<span class="t-prompt">$</span><span class="t-cmd"> ${line.text}</span>`;
      } else {
        div.innerHTML = `<span class="t-output">${line.text}</span>`;
      }

      body.appendChild(div);
    }, i * 120);
  });
}

// ================================================================
// FADE-IN ANIMATIONS
// ================================================================
function initFadeInAnimations() {
  const elements = document.querySelectorAll('.fade-in-element');
  if (!elements.length) return;

  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  elements.forEach(el => observer.observe(el));
}

// ================================================================
// RENDER RECENT WRITEUPS
// ================================================================
function renderRecentWriteups() {
  const grid = document.getElementById('recentWriteupsGrid');
  if (!grid || typeof WRITEUPS_DATA === 'undefined') return;

  const recent = WRITEUPS_DATA.slice(0, 3);

  grid.innerHTML = recent.map(wu => `
    <a href="writeup.html?id=${wu.id}" class="writeup-card-grid fade-in-element">
      <div style="display:flex;align-items:center;gap:10px;">
        <span class="writeup-category cat-${wu.category.toLowerCase()}">${wu.category}</span>
        <span style="font-size:0.72rem;color:var(--text-3);font-family:var(--font-mono);">${wu.difficulty}</span>
      </div>
      <h3 class="writeup-card-title" style="font-size:0.95rem;">${wu.title}</h3>
      <p class="writeup-card-summary">${wu.summary}</p>
      <span style="font-size:0.72rem;color:var(--text-3);font-family:var(--font-mono);margin-top:auto;">${wu.date}</span>
    </a>
  `).join('');
}

// ================================================================
// RENDER FEATURED PROJECTS
// ================================================================
function renderFeaturedProjects() {
  const grid = document.getElementById('featuredProjectsGrid');
  if (!grid || typeof PROJECTS_DATA === 'undefined') return;

  const featured = PROJECTS_DATA.filter(p => p.featured).slice(0, 3);

  grid.innerHTML = featured.map(p => `
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
        ${p.demo ? `<a href="${p.demo}" target="_blank" class="project-link-btn"><i class="fas fa-external-link-alt"></i> Demo</a>` : ''}
      </div>` : ''}
    </div>
  `).join('');
}

// ================================================================
// RENDER LATEST BLOG POST
// ================================================================
function renderLatestBlog() {
  const container = document.getElementById('latestBlogContainer');
  if (!container || typeof BLOG_DATA === 'undefined' || !BLOG_DATA.length) return;

  const post = BLOG_DATA[0];

  container.innerHTML =
    '<a href="blog-post.html?id=' + post.id + '" class="latest-blog-card fade-in-element">' +
      '<div class="latest-blog-meta">' +
        '<span class="latest-blog-date">' + post.date + '</span>' +
        post.tags.map(function(t) { return '<span class="latest-blog-tag">#' + t + '</span>'; }).join('') +
      '</div>' +
      '<h3 class="latest-blog-title">' + post.title + '</h3>' +
      '<p class="latest-blog-summary">' + post.summary + '</p>' +
      '<span class="latest-blog-read">Read more <i class="fas fa-arrow-right"></i></span>' +
    '</a>';
}

// ================================================================
// RENDER LATEST ACHIEVEMENT
// Shows the newest entry from data/achievements.js (top of array)
// ================================================================
function renderLatestAchievement() {
  const container = document.getElementById('latestAchievementContainer');
  if (!container || typeof ACHIEVEMENTS_DATA === 'undefined' || !ACHIEVEMENTS_DATA.length) return;

  const a = ACHIEVEMENTS_DATA[0];
  const cover = (a.images && a.images.length) ? a.images[0] : '';

  // Badge colour — mirrors placementClass() in assets/js/achievements.js
  // so the same achievement always shows the same colour on both pages.
  const p = (a.placement || '').toLowerCase();
  let badgeClass = 'lab-accent';
  if (p.includes('1st') || p.includes('winner') || p.includes('champion')) badgeClass = 'lab-gold';
  else if (p.includes('2nd') || p.includes('silver')) badgeClass = 'lab-silver';
  else if (p.includes('3rd') || p.includes('bronze')) badgeClass = 'lab-bronze';

  container.innerHTML =
    '<a href="achievements.html" class="latest-ach-card fade-in-element">' +
      (cover
        ? '<div class="latest-ach-media"><img src="' + cover + '" alt="' + a.title + '" loading="lazy"></div>'
        : '') +
      '<div class="latest-ach-body">' +
        '<div class="latest-ach-meta">' +
          (a.placement ? '<span class="latest-ach-badge ' + badgeClass + '">' + a.placement + '</span>' : '') +
          '<span class="latest-ach-date">' + a.date + '</span>' +
        '</div>' +
        '<h3 class="latest-ach-title">' + a.title + '</h3>' +
        (a.issuer ? '<p class="latest-ach-issuer">' + a.issuer + '</p>' : '') +
        (a.summary ? '<p class="latest-ach-summary">' + a.summary + '</p>' : '') +
        '<span class="latest-ach-read">View achievements <i class="fas fa-arrow-right"></i></span>' +
      '</div>' +
    '</a>';
}

// ================================================================
// INIT
// ================================================================
document.addEventListener('DOMContentLoaded', () => {
  initMatrix();
  initTyping();
  initTerminal();
  renderLatestAchievement();
  renderRecentWriteups();
  renderFeaturedProjects();
  renderLatestBlog();
  initFadeInAnimations();
});