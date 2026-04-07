/* ================================================================
   about.js — About page
   - Animates skill bars when they scroll into view
================================================================ */

document.addEventListener('DOMContentLoaded', () => {
  const fills = document.querySelectorAll('.skill-fill');
  if (!fills.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const fill  = entry.target;
      const width = fill.dataset.width || '0';
      fill.style.width = width + '%';
      observer.unobserve(fill);
    });
  }, { threshold: 0.3 });

  fills.forEach(f => observer.observe(f));
});
