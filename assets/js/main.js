/* ================================================================
   main.js — Shared across all pages
   - Navbar scroll effect
   - Mobile menu toggle
   - Footer year
   - Scroll fade-in animations
================================================================ */

// ---- Reading-time estimate ----
// Rough words-per-minute read time from a Markdown string. Code blocks are
// stripped so the estimate reflects prose you actually read, not code you skim.
function readingTime(markdown) {
  if (!markdown) return '';
  const text = String(markdown)
    .replace(/```[\s\S]*?```/g, ' ')          // fenced code
    .replace(/`[^`]*`/g, ' ')                  // inline code
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')     // images
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')   // links -> link text
    .replace(/[#>*_~|`-]/g, ' ');              // stray markdown symbols
  const words = text.split(/\s+/).filter(Boolean).length;
  const mins = Math.max(1, Math.round(words / 200));
  return mins + ' min read';
}

// ---- Navbar scroll effect ----
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  if (window.scrollY > 20) {
    navbar.classList.add('scrolled');
  } else {
    navbar.classList.remove('scrolled');
  }
}, { passive: true });

// ---- Mobile menu toggle ----
const navToggle = document.getElementById('navToggle');
const navLinks  = document.getElementById('navLinks');

if (navToggle && navLinks) {
  navToggle.addEventListener('click', () => {
    navLinks.classList.toggle('open');
    const isOpen = navLinks.classList.contains('open');
    navToggle.setAttribute('aria-expanded', isOpen);
  });

  // Close menu when a link is clicked
  navLinks.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => navLinks.classList.remove('open'));
  });
}

// ---- Footer year ----
const footerYear = document.getElementById('footerYear');
if (footerYear) {
  footerYear.textContent = new Date().getFullYear();
}

// ---- Scroll fade-in animations ----
// Any element with class .fade-in-element will animate when it enters the viewport
function initScrollAnimations() {
  const elements = document.querySelectorAll('.fade-in-element');
  if (!elements.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        // Stagger the animations slightly for grouped elements
        setTimeout(() => {
          entry.target.classList.add('visible');
        }, i * 60);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

  elements.forEach(el => observer.observe(el));
}

// ---- Counter animation for stats bar ----
function animateCounters() {
  const counters = document.querySelectorAll('.stat-number[data-target]');
  if (!counters.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const target = parseInt(el.dataset.target, 10);
      const duration = 1200;
      const step = target / (duration / 16);
      let current = 0;

      const timer = setInterval(() => {
        current += step;
        if (current >= target) {
          el.textContent = target + (el.dataset.suffix || '');
          clearInterval(timer);
        } else {
          el.textContent = Math.floor(current) + (el.dataset.suffix || '');
        }
      }, 16);

      observer.unobserve(el);
    });
  }, { threshold: 0.5 });

  counters.forEach(c => observer.observe(c));
}

// ---- Dynamic social / SEO meta (used by the query-param detail pages) ----
// Detail pages (writeup.html, blog-post.html, ctf-event.html) render from data
// at runtime, so their <head> only carries default tags. Once the item is known
// the render script calls setSocialMeta(...) to fill in the per-item title,
// description, canonical URL, and Open Graph / Twitter image.
const SITE_BASE = 'https://zakhwananuar.my';

function absoluteUrl(path) {
  if (!path) return '';
  if (/^https?:\/\//i.test(path)) return path;
  return SITE_BASE + '/' + String(path).replace(/^\.?\//, '');
}

function upsertMeta(attr, key, content) {
  let el = document.head.querySelector(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

function setSocialMeta({ title, description, url, image, type } = {}) {
  if (title) {
    document.title = title;
    upsertMeta('property', 'og:title', title);
    upsertMeta('name', 'twitter:title', title);
  }
  if (description) {
    upsertMeta('name', 'description', description);
    upsertMeta('property', 'og:description', description);
    upsertMeta('name', 'twitter:description', description);
  }
  if (type) upsertMeta('property', 'og:type', type);
  if (url) {
    const abs = absoluteUrl(url);
    upsertMeta('property', 'og:url', abs);
    let link = document.head.querySelector('link[rel="canonical"]');
    if (!link) {
      link = document.createElement('link');
      link.setAttribute('rel', 'canonical');
      document.head.appendChild(link);
    }
    link.setAttribute('href', abs);
  }
  // Fall back to the default share image when no per-item image is set.
  const img = absoluteUrl(image || 'assets/images/og-default.png');
  upsertMeta('property', 'og:image', img);
  upsertMeta('name', 'twitter:image', img);
}
window.setSocialMeta = setSocialMeta;

// ---- Init ----
document.addEventListener('DOMContentLoaded', () => {
  initScrollAnimations();
  animateCounters();
});

/* ================================================================
   Console easter egg — a hidden command hub for anyone who cracks
   open DevTools. Type help() in the console to explore.
================================================================ */
(function consoleHub() {
  if (window.__hub) return;
  window.__hub = true;

  var cyan = 'color:#00d9ff';
  var purple = 'color:#7c3aed';
  var dim = 'color:#8a8f98';
  var b = 'font-weight:700';
  var mono = 'font-family:ui-monospace,monospace';

  var banner =
    '\n' +
    '  ███████╗ █████╗ ██╗  ██╗\n' +
    '  ╚══███╔╝██╔══██╗██║ ██╔╝\n' +
    '    ███╔╝ ███████║█████╔╝ \n' +
    '   ███╔╝  ██╔══██║██╔═██╗ \n' +
    '  ███████╗██║  ██║██║  ██╗\n' +
    '  ╚══════╝╚═╝  ╚═╝╚═╝  ╚═╝';

  console.log('%c' + banner, cyan + ';' + mono + ';' + b);
  console.log('%cYou opened the console. Curious — I respect that. %cType %chelp()%c to see what you can do.',
    dim, dim, cyan + ';' + b, dim);

  // Print "opening…" then navigate a moment later so the message is readable.
  function go(url, label) {
    console.log('%c→ ' + label + '…', purple + ';' + b);
    setTimeout(function () { window.location.href = url; }, 650);
    return undefined;
  }

  window.help = function help() {
    var rows = [
      ['help()', 'this menu'],
      ['whoami()', 'who is this guy'],
      ['arcade()', 'my hidden arcade (games)'],
      ['board()', 'a secret live message board'],
      ['pastebin()', 'a private, local-only pastebin'],
      ['notes()', 'my notes stash'],
      ['contact()', 'get in touch'],
      ['flag()', 'for my fellow CTF players']
    ];
    console.log('%cAvailable commands:', cyan + ';' + b);
    rows.forEach(function (r) {
      console.log('%c  ' + r[0].padEnd(12) + '%c' + r[1], cyan + ';' + mono, dim);
    });
    return '// tip: some of these open hidden pages 👀';
  };

  window.whoami = function whoami() {
    console.log('%cZakhwan Anuar%c — Computer Science student, cybersecurity + CTF.',
      cyan + ';' + b, dim);
    console.log('%cDigital forensics · reverse engineering · malware analysis.', dim);
    return 'root@zakhwananuar:~#';
  };

  window.arcade   = function arcade()   { return go('/games.html',   'loading the arcade'); };
  window.board    = function board()    { return go('/waklu.html',   'opening the board'); };
  window.pastebin = function pastebin() { return go('/pastebin.html', 'opening the pastebin'); };
  window.notes    = function notes()    { return go('/notes.html',   'opening my notes'); };
  window.contact  = function contact()  { return go('/contact.html', 'opening contact'); };

  window.flag = function flag() {
    console.log('%cflag{c0ns0le_curi0sity_rewarded}', purple + ';' + b + ';' + mono);
    console.log('%cNice find. Now go try the terminal on my 404 page → /404.html', dim);
    return undefined;
  };

  // A little joke for the reflexive sudo-ers.
  Object.defineProperty(window, 'sudo', {
    get: function () {
      console.log('%cnice try 😏 — you are not in the sudoers file. This incident will be reported.', dim);
      return undefined;
    },
    configurable: true
  });
})();
