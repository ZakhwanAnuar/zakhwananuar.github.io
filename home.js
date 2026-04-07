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

  function resize() {
    canvas.width  = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
  }
  resize();
  window.addEventListener('resize', resize, { passive: true });

  const chars = 'アイウエオカキクケコサシスセソタチツテトナニヌネノ0123456789ABCDEF<>/{}[]|\\!@#$%^&*';
  const fontSize = 13;
  const columns  = Math.floor(canvas.width / fontSize);
  const drops    = Array(columns).fill(1);

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

      if (y * fontSize > canvas.height && Math.random() > 0.975) drops[i] = 0;
      drops[i]++;
    });
  }

  setInterval(draw, 60);
}

// ================================================================
// TYPING EFFECT
// EDIT: Change the strings array to whatever you want displayed
// ================================================================
function initTyping() {
  const el = document.getElementById('typedText');
  if (!el) return;

  // EDIT: Add or remove lines here
  const strings = [
    'Cybersecurity Student',
    'CTF Player',
    'Digital Forensics',
    'Web Exploitation',
    'Always Learning',
  ];

  let strIndex  = 0;
  let charIndex = 0;
  let deleting  = false;

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
// EDIT: Modify the terminal lines to reflect your actual info
// ================================================================
function initTerminal() {
  const body = document.getElementById('terminalBody');
  if (!body) return;

  // Each entry: { type: 'cmd'|'output'|'blank', text }
  // EDIT: Change these values to your own info
  const lines = [
    { type: 'cmd',    text: 'cat whoami.txt' },
    { type: 'output', text: '<span class="key">name:</span>     <span class="val">Your Name</span>' },
    { type: 'output', text: '<span class="key">role:</span>     <span class="val">CS Student (Cybersecurity)</span>' },
    { type: 'output', text: '<span class="key">location:</span> <span class="val">Your City</span>' },
    { type: 'blank',  text: '' },
    { type: 'cmd',    text: 'cat interests.txt' },
    { type: 'output', text: '<span class="val">▸ Web Exploitation</span>' },
    { type: 'output', text: '<span class="val">▸ Reverse Engineering</span>' },
    { type: 'output', text: '<span class="val">▸ CTF Competitions</span>' },
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
// RENDER RECENT WRITEUPS (from data/writeups.js)
// Shows the 3 most recent writeups on the home page
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
// RENDER FEATURED PROJECTS (from data/projects.js)
// Shows projects marked featured: true
// ================================================================
function renderFeaturedProjects() {
  const grid = document.getElementById('featuredProjectsGrid');
  if (!grid || typeof PROJECTS_DATA === 'undefined') return;

  const featured = PROJECTS_DATA.filter(p => p.featured).slice(0, 3);

  grid.innerHTML = featured.map(p => `
    <div class="project-card fade-in-element">
      <div class="project-card-header">
        <div class="project-icon"><i class="${p.icon || 'fas fa-code'}"></i></div>
        <div class="project-links">
          ${p.github ? `<a href="${p.github}" target="_blank" class="project-link-btn"><i class="fab fa-github"></i> Code</a>` : ''}
          ${p.demo   ? `<a href="${p.demo}"   target="_blank" class="project-link-btn"><i class="fas fa-external-link-alt"></i> Demo</a>` : ''}
        </div>
      </div>
      <h3 class="project-title">${p.title}</h3>
      <p class="project-description">${p.description}</p>
      <div class="project-tech">
        ${p.tech.map(t => `<span class="tech-tag">${t}</span>`).join('')}
      </div>
    </div>
  `).join('');
}

// ---- Init ----
document.addEventListener('DOMContentLoaded', () => {
  initMatrix();
  initTyping();
  initTerminal();
  renderRecentWriteups();
  renderFeaturedProjects();
});
