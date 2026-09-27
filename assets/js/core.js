(() => {
  'use strict';
  const escape = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const icon = name => `<i class="fa-solid fa-${escape(name)}" aria-hidden="true"></i>`;
  const toast = message => {
    const el = document.querySelector('.toast');
    el.textContent = message;
    el.classList.add('visible');
    clearTimeout(toast.timer);
    toast.timer = setTimeout(() => el.classList.remove('visible'), 2300);
  };
  const date = value => new Date(value).getTime() || 0;
  const minutes = content => Math.max(1, Math.ceil(String(content || '').split(/\s+/).length / 220));
  const imagePath = value => {
    const path = String(value || '').replace(/\\/g, '/');
    return /^(Forensics|CTF|Blog|Achievements)\//i.test(path) ? `assets/images/${path}` : path;
  };
  const articleImage = item => {
    const match = (item.content || '').match(/!\[[^\]]*\]\(([^)]+)\)/);
    return item.ogImage || (match ? imagePath(match[1]) : '');
  };
  const thumbnail = path => window.SITE_MEDIA?.[imagePath(path)] || imagePath(path);
  const showDialog = dialog => {
    if (!dialog.open) dialog.showModal();
  };
  let gallery = [], galleryIndex = 0;
  const viewer = document.querySelector('#image-viewer');
  const stage = document.createElement('div');
  stage.className = 'gallery-stage';
  const track = document.createElement('div');
  track.className = 'gallery-track';
  stage.append(track);
  viewer.querySelector('img').replaceWith(stage);
  const paintImage = () => {
    const item = gallery[galleryIndex];
    track.style.transform = `translateX(${-galleryIndex * 100}%)`;
    [...track.children].forEach((slide, index) => {
      slide.classList.toggle('is-current', index === galleryIndex);
      slide.classList.toggle('is-before', index < galleryIndex);
      slide.classList.toggle('is-after', index > galleryIndex);
      slide.tabIndex = index === galleryIndex ? -1 : 0;
      slide.setAttribute('aria-label', `${index === galleryIndex ? 'Current' : 'View'} photograph ${index + 1}`);
    });
    document.querySelector('#viewer-caption').textContent = item.alt || '';
    document.querySelector('#image-count').textContent = `${galleryIndex + 1} / ${gallery.length}`;
    document.querySelector('#image-prev').disabled = galleryIndex === 0;
    document.querySelector('#image-next').disabled = galleryIndex === gallery.length - 1;
  };
  const showImages = (items, index = 0) => {
    if (!items.length) return;
    gallery = items;
    galleryIndex = Math.max(0, Math.min(items.length - 1, index));
    track.replaceChildren(...items.map((item, position) => {
      const slide = document.createElement('button');
      slide.className = 'gallery-slide';
      const img = document.createElement('img');
      img.src = imagePath(item.src);
      img.alt = item.alt || '';
      img.draggable = false;
      slide.append(img);
      slide.addEventListener('click', () => {
        if (performance.now() < suppressClickUntil) return;
        galleryIndex = position;
        paintImage();
      });
      return slide;
    }));
    track.classList.add('instant');
    paintImage();
    showDialog(viewer);
    requestAnimationFrame(() => requestAnimationFrame(() => track.classList.remove('instant')));
  };
  const changeImage = delta => {
    galleryIndex = Math.max(0, Math.min(gallery.length - 1, galleryIndex + delta));
    paintImage();
  };
  document.querySelector('#image-prev').addEventListener('click', () => changeImage(-1));
  document.querySelector('#image-next').addEventListener('click', () => changeImage(1));
  viewer.addEventListener('keydown', event => {
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') event.preventDefault();
    if (event.key === 'ArrowLeft') changeImage(-1);
    if (event.key === 'ArrowRight') changeImage(1);
  });
  let touchStart = null, suppressClickUntil = 0;
  stage.addEventListener('touchstart', event => {
    touchStart = event.touches.length === 1 ? {x:event.touches[0].clientX,y:event.touches[0].clientY} : null;
  }, {passive:true});
  stage.addEventListener('touchend', event => {
    if (!touchStart) return;
    const dx = event.changedTouches[0].clientX - touchStart.x;
    const dy = event.changedTouches[0].clientY - touchStart.y;
    if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy)) {
      suppressClickUntil = performance.now() + 400;
      changeImage(dx < 0 ? 1 : -1);
    }
    touchStart = null;
  }, {passive:true});
  stage.addEventListener('touchcancel', () => touchStart = null);
  document.querySelector('#image-count').setAttribute('aria-live', 'polite');
  const menu = document.querySelector('#site-menu');
  const menuButton = document.querySelector('.menu-toggle');
  const header = document.querySelector('.site-header');
  const updateHeader = () => header?.classList.toggle('is-scrolled', window.scrollY > 18);
  updateHeader();
  window.addEventListener('scroll', updateHeader, {passive:true});
  const progress = document.querySelector('#scroll-progress');
  const updateProgress = () => {
    if (!progress) return;
    const max = document.documentElement.scrollHeight - innerHeight;
    progress.style.transform = `scaleX(${max > 0 ? window.scrollY / max : 0})`;
  };
  updateProgress();
  window.addEventListener('scroll', updateProgress, {passive:true});
  menuButton.addEventListener('click', () => {
    showDialog(menu);
    menuButton.setAttribute('aria-expanded', 'true');
  });
  menu.addEventListener('close', () => menuButton.setAttribute('aria-expanded', 'false'));
  document.querySelectorAll('dialog').forEach(dialog => {
    dialog.querySelectorAll('[data-close]').forEach(button => button.addEventListener('click', () => dialog.close()));
    dialog.addEventListener('click', event => {
      if (event.target !== dialog) return;
      const rect = dialog.getBoundingClientRect();
      if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.close();
    });
  });
  document.querySelectorAll('[data-year]').forEach(el => el.textContent = new Date().getFullYear());
  const optimizeImages = root => root.querySelectorAll('img').forEach(img => {
    const original = img.getAttribute('src');
    if (window.SITE_MEDIA?.[original]) {
      img.dataset.fullSrc = original;
      img.src = thumbnail(original);
    }
  });
  const content = document.querySelector('main');
  if (content) {
    optimizeImages(content);
    new MutationObserver(() => optimizeImages(content)).observe(content, {childList:true,subtree:true});
  }
  document.querySelectorAll('.skill-fill[data-width]').forEach(el => el.style.width = `${el.dataset.width}%`);
  const clock = document.querySelector('#local-time');
  if (clock) {
    const tick = () => clock.textContent = new Intl.DateTimeFormat('en-GB', {timeZone:'Asia/Kuala_Lumpur',hour:'2-digit',minute:'2-digit'}).format(new Date());
    tick();
    setInterval(tick, 60000);
  }
  document.querySelectorAll('a[target="_blank"]').forEach(a => a.rel = 'noopener noreferrer');
  // The original contact endpoint is retained; use its native HTML form submission.
  const form = document.querySelector('#contactForm');
  if (form) form.querySelectorAll('input,textarea').forEach(input => input.removeAttribute('disabled'));
  let keys = '';
  document.addEventListener('keydown', event => {
    if (/INPUT|TEXTAREA|SELECT/.test(event.target.tagName) || event.ctrlKey || event.metaKey || document.querySelector('dialog[open]')) return;
    keys = (keys + event.key.toLowerCase()).slice(-5);
    if (keys === 'holla') {
      toast('Holla! Make yourself at home.');
    }
  });
  window.Site = {escape, icon, toast, date, minutes, imagePath, thumbnail, articleImage, showDialog, showImages};
})();
