<!-- index.html -->
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>welcome, bear cubs!</title>
  <link rel="stylesheet" href="style.css" />
  <link rel="icon" type="image/png" href="favicon.png" />
</head>
<body>
  <header>
    <div class="container">
      <div class="logo">
        <!-- Replace bear.png with your image -->
        <img src="bear.png" alt="Wh1teBear Profile" class="profile-img" />
        <div>
          <h1>Wh1teBear</h1>
          <p class="tagline">My space to post what I learn toward my journey</p>
        </div>
      </div>

      <div class="header-controls">
        <button class="theme-toggle" type="button" onclick="toggleTheme()" aria-label="Toggle theme">🌙</button>

        <button class="burger-toggle" type="button" onclick="toggleSidebar()" aria-label="Open menu" aria-expanded="false">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">
            <rect x="3" y="6" width="18" height="2" fill="currentColor"/>
            <rect x="3" y="11" width="18" height="2" fill="currentColor"/>
            <rect x="3" y="16" width="18" height="2" fill="currentColor"/>
          </svg>
        </button>

        <form class="search-form" action="#" method="get" onsubmit="return false;">
          <input type="text" name="q" placeholder="Search..." aria-label="Search" />
          <button type="submit" aria-label="Search">🔍</button>
        </form>
      </div>
    </div>
  </header>

  <div class="sidebar-overlay" onclick="closeSidebar()" aria-hidden="true"></div>

  <aside class="sidebar" aria-label="Sidebar navigation">
    <div class="sidebar-section">
      <h3>Home</h3>
      <ul class="sidebar-list">
        <li><a href="#title">Home</a></li>
        <li><a href="#about">About</a></li>
        <li><a href="#featured">Featured</a></li>
        <li><a href="#contact">Contact</a></li>
      </ul>
    </div>

    <div class="sidebar-section">
      <h3>Latest Growl</h3>
      <ul class="sidebar-list">
        <li><a href="#post-1">MCC 2025</a></li>
        <li><a href="#post-2">Cyberskills Level Up</a></li>
        <li><a href="#post-3">Cydes 2025</a></li>
      </ul>
    </div>

    <div class="sidebar-section">
      <div class="ctf-section">
        <h3>CTF Writeups</h3>

        <div class="ctf-group">
          <div class="ctf-group-header" onclick="toggleCtfGroup('wgmy-24', this)">
            <span class="ctf-name">WGMY 24</span>
            <span class="ctf-toggle">▶</span>
          </div>
          <div class="challenge-list" id="wgmy-24" style="display:none;">
            <div class="challenge-item">
              <a href="#" class="challenge-link">WGMY 24</a>
            </div>
          </div>
        </div>

        <div class="ctf-group">
          <div class="ctf-group-header" onclick="toggleCtfGroup('umcs-prelim', this)">
            <span class="ctf-name">UMCS Prelim</span>
            <span class="ctf-toggle">▶</span>
          </div>
          <div class="challenge-list" id="umcs-prelim" style="display:none;">
            <div class="challenge-item">
              <a href="#" class="challenge-link">UMCS 2025</a>
            </div>
          </div>
        </div>

        <div class="ctf-group">
          <div class="ctf-group-header" onclick="toggleCtfGroup('mcc2025', this)">
            <span class="ctf-name">MCC2025</span>
            <span class="ctf-toggle">▶</span>
          </div>
          <div class="challenge-list" id="mcc2025" style="display:none;">
            <div class="challenge-item"><a href="#" class="challenge-link">Malware Writeup</a></div>
            <div class="challenge-item"><a href="#" class="challenge-link">PWN Writeup</a></div>
          </div>
        </div>

        <div class="ctf-group">
          <div class="ctf-group-header" onclick="toggleCtfGroup('ics-25', this)">
            <span class="ctf-name">ICS 25</span>
            <span class="ctf-toggle">▶</span>
          </div>
          <div class="challenge-list" id="ics-25" style="display:none;">
            <div class="challenge-item"><a href="#" class="challenge-link">ICS 2025</a></div>
          </div>
        </div>

        <div class="ctf-group">
          <div class="ctf-group-header" onclick="toggleCtfGroup('curtin25', this)">
            <span class="ctf-name">CURTIN25</span>
            <span class="ctf-toggle">▶</span>
          </div>
          <div class="challenge-list" id="curtin25" style="display:none;">
            <div class="challenge-item"><a href="#" class="challenge-link">Forensic Writeup</a></div>
          </div>
        </div>

      </div>
    </div>

    <div class="sidebar-section">
      <h3>Tools I Use</h3>
      <ul class="sidebar-list">
        <li><a href="#">Apktool</a></li>
        <li><a href="#">Sysmon</a></li>
        <li><a href="#">Velociraptor</a></li>
        <li><a href="#">Wazuh</a></li>
        <li><a href="#">Wireshark</a></li>
      </ul>
    </div>

    <div class="sidebar-section">
      <h3>Books & Sheets</h3>
      <ul class="sidebar-list">
        <li><a href="#">Torrent?</a></li>
        <li><a href="#">VQL Cookbook</a></li>
      </ul>
    </div>

    <div class="sidebar-section">
      <h3>Links</h3>
      <ul class="sidebar-list">
        <li><a href="#about">About Me</a></li>
        <li><a href="#contact">Contact</a></li>
      </ul>
    </div>
  </aside>

  <main class="main-content">
    <h1 id="title">Welcome To My Territory 🐻‍❄️</h1>
    <p>Feel free to read everything I put here! I’m a beginner—correct me if I’m wrong!</p>

    <div class="content-box" id="about">
      <h2>🐻 Who Growled This?</h2>
      <p>Rawr! I’m <strong>Wh1teBear</strong>, a beginner cybersecurity enthusiast trying to dip my paws into the world of cybersecurity. I’m still learning—please be nice to me hehe.</p>

      <p>🎯 <strong>Current Focus:</strong> Digital Forensics and Mobile Hacking</p>
      <p>🏆 <strong>CTF Teams:</strong> Member of a local CTF crew</p>
      <p>For writeups, I mostly do Forensics and Reverse Engineering unless requested to do something else!</p>
    </div>

    <hr class="section-divider" />

    <section id="featured" aria-label="Featured posts">
      <h1>Featured Posts</h1>

      <div class="featured-posts">
        <article class="featured-post" id="post-1">
          <div class="post-meta">Dec 01, 2025</div>
          <h3><a href="#">MCC 2025</a></h3>
          <p>Notes, learnings, and my favorite moments from MCC 2025.</p>
          <a class="read-more" href="#">Read more →</a>
        </article>

        <article class="featured-post" id="post-2">
          <div class="post-meta">Aug 02, 2025</div>
          <h3><a href="#">Cyberskills Level Up</a></h3>
          <p>A workshop recap + the skills I’m practicing next (reverse + mobile).</p>
          <a class="read-more" href="#">Read more →</a>
        </article>

        <article class="featured-post" id="post-3">
          <div class="post-meta">Jul 02, 2025</div>
          <h3><a href="#">Cydes 2025</a></h3>
          <p>What I saw at CYDES 2025 and what it made me want to learn.</p>
          <a class="read-more" href="#">Read more →</a>
        </article>
      </div>
    </section>

    <hr class="section-divider" />

    <div class="content-box" id="contact">
      <h2>📬 Throw me a crumbs 🥖</h2>
      <div class="contact-content">
        <p>Want to connect or collaborate? Feel free to reach out!</p>
        <div class="contact-links">
          <a href="https://www.linkedin.com/" class="contact-link" target="_blank" rel="noreferrer">💼 LinkedIn</a>
          <a href="https://discord.com/" class="contact-link" target="_blank" rel="noreferrer">🎮 Discord</a>
          <a href="mailto:you@example.com" class="contact-link">📧 Email</a>
        </div>
        <p class="contact-note">Always happy to discuss cybersecurity, CTFs, or share learning resources!</p>
      </div>
    </div>
  </main>

  <script src="script.js"></script>
</body>
</html>
