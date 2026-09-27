(() => {
  'use strict';
  const body = document.querySelector('#reader-body');
  if (!body) return;
  const {escape: e, icon, minutes, imagePath, showImages} = Site;
  const isWriteup = document.body.dataset.page === 'writeup';
  const collection = isWriteup ? WRITEUPS_DATA : BLOG_DATA;
  const id = new URLSearchParams(location.search).get('id');
  const item = collection.find(entry => entry.id === id);
  if (!item) {
    document.querySelector('#reader-title').textContent = 'This entry could not be found.';
    body.innerHTML = `<p><a href="${isWriteup ? 'writeups' : 'blog'}.html">Return to the ${isWriteup ? 'investigation index' : 'journal'}.</a></p>`;
    return;
  }
  document.title = `${item.title} | Zakhwan Anuar`;
  document.querySelector('#reader-title').textContent = item.title;
  document.querySelector('#reader-summary').textContent = item.summary || '';
  document.querySelector('meta[name="description"]').content = item.summary || item.title;
  document.querySelector('meta[property="og:title"]').content = item.title;
  document.querySelector('meta[property="og:image"]').content = new URL(imagePath(item.ogImage || 'assets/images/og-default1.png'), 'https://zakhwananuar.my/').href;
  document.querySelector('link[rel="canonical"]').href = `https://zakhwananuar.my/${isWriteup ? 'writeup' : 'blog-post'}.html?id=${encodeURIComponent(id)}`;
  const metadata = [item.date, isWriteup ? `${item.category} / ${item.difficulty}` : item.tags.join(' / '), `${minutes(item.content)} MIN READ`];
  if (isWriteup && item.points != null) metadata.push(`${item.points} POINTS`);
  document.querySelector('#reader-meta').textContent = metadata.join('  /  ');
  if (isWriteup) {
    const back = document.querySelector('#reader-back');
    back.href = `ctf-event.html?ctf=${encodeURIComponent(item.ctf)}`;
    back.textContent = '\u2190 ' + item.ctf;
  }
  // Markdown is authored locally. Keep its technical text intact; normalize image URLs after parsing.
  if (typeof marked !== 'undefined') body.innerHTML = marked.parse(item.content, {gfm:true, breaks:true});
  else body.textContent = item.content;
  const headings = [...body.querySelectorAll('h2,h3')];
  headings.forEach((heading,i) => heading.id = `section-${i+1}`);
  document.querySelector('#reader-toc').innerHTML = headings.map(h => `<a href="#${h.id}">${e(h.textContent)}</a>`).join('');
  body.querySelectorAll('pre code').forEach(code => {
    if (typeof hljs !== 'undefined') hljs.highlightElement(code);
    const button = document.createElement('button');
    button.className = 'copy-code';
    button.type = 'button';
    button.setAttribute('aria-label','Copy code');
    button.title = 'Copy code';
    button.innerHTML = icon('copy');
    button.addEventListener('click', async () => {
      try {
        if (navigator.clipboard && window.isSecureContext) await navigator.clipboard.writeText(code.textContent);
        else {
          const area = document.createElement('textarea');
          area.value = code.textContent;
          area.style.position = 'fixed';area.style.opacity = '0';
          document.body.append(area);area.select();
          const copied = document.execCommand('copy');area.remove();
          if (!copied) throw new Error('Clipboard unavailable');
        }
        Site.toast('Code copied.');
      } catch { Site.toast('Select the code to copy it.'); }
    });
    code.parentElement.prepend(button);
  });
  body.querySelectorAll('table').forEach(table => {
    const wrap = document.createElement('div');wrap.className = 'table-scroll';
    table.before(wrap);wrap.append(table);
  });
  const images = [...body.querySelectorAll('img')];
  images.forEach((image,index) => {
    image.src = imagePath(image.getAttribute('src'));
    image.loading = 'lazy';image.decoding = 'async';
    image.tabIndex = 0;image.setAttribute('role','button');
    image.setAttribute('aria-label',`Enlarge image: ${image.alt || index + 1}`);
    const open = () => showImages(images.map(img => ({src:img.dataset.fullSrc || img.src,alt:img.alt})),index);
    image.addEventListener('click',open);
    image.addEventListener('keydown', event => {if (event.key === 'Enter' || event.key === ' ') {event.preventDefault();open();}});
  });
  body.querySelectorAll('a[href]').forEach(link => {
    if (link.origin !== location.origin && /^https?:/.test(link.href)) {link.target = '_blank';link.rel = 'noopener noreferrer';}
  });
  const related = collection.filter(entry => entry.id !== item.id).sort((a,b) => {
    const score = entry => isWriteup ? Number(entry.ctf === item.ctf) : entry.tags.filter(tag => item.tags.includes(tag)).length;
    return score(b)-score(a);
  }).slice(0,3);
  document.querySelector('#related').innerHTML = `<h2>${isWriteup ? 'Keep investigating.' : 'Keep reading.'}</h2>` + related.map(entry => `<a class="journal-row" href="${isWriteup ? 'writeup' : 'blog-post'}.html?id=${encodeURIComponent(entry.id)}"><span class="mono">${e(entry.date)}</span><div><h3>${e(entry.title)}</h3></div><span class="mono">${e(isWriteup ? entry.category : entry.tags[0])}</span>${icon('arrow-right')}</a>`).join('');
  const progress = document.querySelector('.read-progress');
  let pending = false;
  const update = () => {
    const start = body.offsetTop;
    const range = Math.max(1, body.offsetHeight - innerHeight);
    const percent = Math.max(0,Math.min(1,(scrollY-start)/range));
    progress.style.transform = `scaleX(${percent})`;
    const active = headings.filter(h => h.getBoundingClientRect().top <= 150).at(-1);
    document.querySelectorAll('#reader-toc a').forEach(link => link.classList.toggle('active',link.hash === `#${active?.id}`));
    pending = false;
  };
  addEventListener('scroll', () => {if (!pending) {pending = true;requestAnimationFrame(update);}}, {passive:true});
  update();
})();
