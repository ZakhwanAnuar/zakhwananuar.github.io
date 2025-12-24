<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Wh1teBear Territory</title>

  <link rel="stylesheet" href="style.css" />
</head>

<body>
  <!-- HEADER -->
  <header class="header">
    <div class="header-left">
      <img src="bear.png" alt="Wh1teBear" class="avatar" />
      <div>
        <h1>Wh1teBear</h1>
        <p>My space to post what I learn toward my journey</p>
      </div>
    </div>

    <div class="header-right">
      <button onclick="toggleTheme()">🌙</button>
      <button class="burger" onclick="toggleSidebar()">☰</button>
    </div>
  </header>

  <!-- SIDEBAR -->
  <aside class="sidebar">
    <h3>Navigation</h3>
    <a href="#home">Home</a>
    <a href="#about">About</a>
    <a href="#featured">Featured</a>
    <a href="#contact">Contact</a>

    <h3>Latest Growl</h3>
    <a href="#">MCC 2025</a>
    <a href="#">Cyberskills Level Up</a>
    <a href="#">CYDES 2025</a>

    <h3>CTF Writeups</h3>
    <a href="#">WGMY 24</a>
    <a href="#">UMCS 2025</a>
    <a href="#">MCC Malware</a>
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
      <h2>Featured Posts</h2>

      <div class="posts">
        <article>
          <span>Dec 01, 2025</span>
          <h3>MCC 2025</h3>
          <p>Notes and lessons from MCC.</p>
        </article>

        <article>
          <span>Aug 02, 2025</span>
          <h3>Cyberskills Level Up</h3>
          <p>Reverse + mobile skills growth.</p>
        </article>

        <article>
          <span>Jul 02, 2025</span>
          <h3>CYDES 2025</h3>
          <p>Conference takeaways.</p>
        </article>
      </div>
    </section>

    <section class="card" id="contact">
      <h2>📬 Contact</h2>
      <a href="#">LinkedIn</a> ·
      <a href="#">Discord</a> ·
      <a href="mailto:you@example.com">Email</a>
    </section>
  </main>

  <script src="script.js"></script>
</body>
</html>
