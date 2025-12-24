<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Wh1teBear Territory</title>

  <link rel="stylesheet" href="style.css" />
  <link rel="icon" type="image/png" href="favicon.png" />
</head>

<body>
  <!-- HEADER -->
  <header class="header">
    <div class="header-left">
      <img src="bear.png" alt="Wh1teBear" class="avatar" />
      <div>
        <h1>Wh1teBear</h1>
        <p class="tagline">My space to post what I learn toward my journey</p>
      </div>
    </div>

    <div class="header-right">
      <button class="theme-toggle" onclick="toggleTheme()">🌙</button>
      <button class="burger" onclick="toggleSidebar()">☰</button>
    </div>
  </header>

  <!-- OVERLAY -->
  <div class="overlay" onclick="closeSidebar()"></div>

  <!-- SIDEBAR -->
  <aside class="sidebar">
    <section>
      <h3>Navigation</h3>
      <a href="#home">Home</a>
      <a href="#about">About</a>
      <a href="#featured">Featured</a>
      <a href="#contact">Contact</a>
    </section>

    <section>
      <h3>Latest Growl</h3>
      <a href="#">MCC 2025</a>
      <a href="#">Cyberskills Level Up</a>
      <a href="#">CYDES 2025</a>
    </section>

    <section>
      <h3>CTF Writeups</h3>
      <a href="#">WGMY 24</a>
      <a href="#">UMCS 2025</a>
      <a href="#">MCC Malware</a>
    </section>
  </aside>

  <!-- MAIN -->
  <main class="main" id="home">
    <section class="card">
      <h2>🐻 Welcome to My Territory</h2>
      <p>
        I’m Wh1teBear — a beginner cybersecurity enthusiast.
        This site documents what I learn, break, and fix.
      </p>
    </section>

    <section class="card" id="about">
      <h2>About Me</h2>
      <p>🎯 Focus: Digital Forensics & Mobile Security</p>
      <p>🏆 CTF Player & Learner</p>
    </section>

    <section id="featured">
      <h2 class="section-title">Featured Posts</h2>

      <div class="grid">
        <article class="post">
          <span class="date">Dec 01, 2025</span>
          <h3>MCC 2025</h3>
          <p>Notes and lessons from MCC.</p>
        </article>

        <article class="post">
          <span class="date">Aug 02, 2025</span>
          <h3>Cyberskills Level Up</h3>
          <p>Reverse + mobile skills growth.</p>
        </article>

        <article class="post">
          <span class="date">Jul 02, 2025</span>
          <h3>CYDES 2025</h3>
          <p>Conference takeaways.</p>
        </article>
      </div>
    </section>

    <section class="card" id="contact">
      <h2>📬 Contact</h2>
      <div class="links">
        <a href="#">LinkedIn</a>
        <a href="#">Discord</a>
        <a href="mailto:you@example.com">Email</a>
      </div>
    </section>
  </main>

  <script src="script.js"></script>
</body>
</html>
