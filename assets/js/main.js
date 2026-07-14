/* ================================================================
   main.js — Shared across all pages
   - Navbar scroll effect
   - Mobile menu toggle
   - Footer year
   - Scroll fade-in animations
================================================================ */

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
