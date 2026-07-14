/* ================================================================
   assets/js/achievements.js — Achievements gallery page
   Renders achievement cards from ACHIEVEMENTS_DATA and powers a
   click-to-open lightbox gallery (prev/next, thumbnails, counter).
   No edits needed here to add achievements — edit data/achievements.js.
================================================================ */

/* ── Placement badge colour ── */
function placementClass(placement) {
  const p = (placement || '').toLowerCase();
  if (p.includes('1st') || p.includes('winner') || p.includes('champion')) return 'ach-badge-gold';
  if (p.includes('2nd') || p.includes('silver')) return 'ach-badge-silver';
  if (p.includes('3rd') || p.includes('bronze')) return 'ach-badge-bronze';
  return 'ach-badge-accent';
}

/* ── Render the card grid ── */
function renderAchievements() {
  const grid = document.getElementById('achievementsGrid');
  if (!grid || typeof ACHIEVEMENTS_DATA === 'undefined') return;

  if (!ACHIEVEMENTS_DATA.length) {
    grid.innerHTML = `
      <div class="ach-empty">
        <i class="fas fa-trophy"></i>
        No achievements yet. Add some in data/achievements.js.
      </div>`;
    return;
  }

  grid.innerHTML = ACHIEVEMENTS_DATA.map((a, i) => {
    const hasImg = Array.isArray(a.images) && a.images.length > 0;
    const cover = hasImg
      ? `<img src="${a.images[0]}" alt="${a.title}" class="ach-cover-img" loading="lazy" />`
      : `<div class="ach-cover-placeholder"><i class="fas fa-trophy"></i></div>`;
    // Only show the gallery-size badge for multi-photo galleries, and label it
    // clearly ("N photos") so a bare number is never mistaken for a rank/placement.
    const countBadge = hasImg && a.images.length > 1
      ? `<span class="ach-count"><i class="fas fa-images"></i> ${a.images.length} photos</span>`
      : '';
    const badge = a.placement
      ? `<span class="ach-badge ${placementClass(a.placement)}">${a.placement}</span>`
      : '';

    return `
    <article class="ach-card ${hasImg ? 'has-gallery' : ''}" data-index="${i}" tabindex="0">
      <div class="ach-cover">
        ${cover}
        ${countBadge}
      </div>
      <div class="ach-card-body">
        ${badge}
        <h3 class="ach-title">${a.title}</h3>
        <div class="ach-meta">
          <span class="ach-date"><i class="far fa-calendar"></i> ${a.date}</span>
        </div>
        <p class="ach-issuer">Issuer: <span>${a.issuer}</span></p>
      </div>
    </article>`;
  }).join('');

  // Open the lightbox when a card that has photos is activated
  grid.querySelectorAll('.ach-card.has-gallery').forEach(card => {
    const open = () => openLightbox(parseInt(card.dataset.index, 10));
    card.addEventListener('click', open);
    card.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(); }
    });
  });
}

/* ── Lightbox gallery ── */
let lbImages = [];
let lbIndex = 0;

function openLightbox(achIndex) {
  const a = ACHIEVEMENTS_DATA[achIndex];
  if (!a || !a.images || !a.images.length) return;
  lbImages = a.images;
  lbIndex = 0;

  document.getElementById('lbTitle').textContent = a.title;
  document.getElementById('lbCaption').textContent = a.summary || '';
  document.getElementById('lbThumbs').innerHTML = lbImages
    .map((src, i) => `<img src="${src}" class="ach-lb-thumb" data-i="${i}" alt="thumbnail ${i + 1}" />`)
    .join('');
  document.getElementById('lbThumbs').querySelectorAll('.ach-lb-thumb').forEach(t => {
    t.addEventListener('click', () => showLightboxImage(parseInt(t.dataset.i, 10)));
  });

  showLightboxImage(0);

  const lb = document.getElementById('achLightbox');
  lb.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function showLightboxImage(i) {
  const total = lbImages.length;
  lbIndex = (i + total) % total;   // wrap around
  document.getElementById('lbImage').src = lbImages[lbIndex];
  document.getElementById('lbCounter').textContent = `${lbIndex + 1} / ${total}`;

  // Single-image galleries hide the nav controls
  const multi = total > 1;
  document.getElementById('lbPrev').style.display = multi ? '' : 'none';
  document.getElementById('lbNext').style.display = multi ? '' : 'none';
  document.getElementById('lbThumbs').style.display = multi ? '' : 'none';

  document.querySelectorAll('.ach-lb-thumb').forEach((t, idx) => {
    t.classList.toggle('active', idx === lbIndex);
  });
}

function closeLightbox() {
  document.getElementById('achLightbox').classList.remove('open');
  document.body.style.overflow = '';
}

/* ── Init ── */
document.addEventListener('DOMContentLoaded', () => {
  renderAchievements();

  const prev = document.getElementById('lbPrev');
  const next = document.getElementById('lbNext');
  const close = document.getElementById('lbClose');
  const backdrop = document.getElementById('lbBackdrop');
  if (prev)  prev.addEventListener('click', () => showLightboxImage(lbIndex - 1));
  if (next)  next.addEventListener('click', () => showLightboxImage(lbIndex + 1));
  if (close) close.addEventListener('click', closeLightbox);
  if (backdrop) backdrop.addEventListener('click', closeLightbox);

  document.addEventListener('keydown', e => {
    if (!document.getElementById('achLightbox').classList.contains('open')) return;
    if (e.key === 'Escape') closeLightbox();
    else if (e.key === 'ArrowLeft') showLightboxImage(lbIndex - 1);
    else if (e.key === 'ArrowRight') showLightboxImage(lbIndex + 1);
  });
});
