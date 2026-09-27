(() => {
  'use strict';
  const {escape: e, icon, date, minutes, articleImage, showImages} = window.Site;
  const page = document.body.dataset.page;
  const projects = typeof PROJECTS_DATA === 'undefined' ? [] : PROJECTS_DATA;
  const blog = typeof BLOG_DATA === 'undefined' ? [] : BLOG_DATA;
  const writeups = typeof WRITEUPS_DATA === 'undefined' ? [] : WRITEUPS_DATA;
  const achievements = typeof ACHIEVEMENTS_DATA === 'undefined' ? [] : ACHIEVEMENTS_DATA;
  const number = i => String(i + 1).padStart(2, '0');
  const projectArt = (project, i, button = true) => {
    const post = blog.find(item => project.github && item.content.includes(project.github));
    const code = post?.content.match(/```[^\n]*\n([\s\S]*?)```/)?.[1]?.trim();
    const preview = code ? code.split('\n').slice(0,7).join('\n') : project.tech.join('\n');
    return `<${button ? 'button' : 'div'} class="project-art" ${button ? `data-project="${e(project.id)}" aria-label="Explore ${e(project.title)}"` : ''}><span class="source-caption">${icon('code')} ${code ? 'From the build notes' : 'Built with'}</span><pre>${e(preview)}</pre><span class="mono">${e(project.title.split(':')[0])}</span></${button ? 'button' : 'div'}>`;
  };
  const journalRow = item => `<a class="journal-row" href="blog-post.html?id=${encodeURIComponent(item.id)}"><span class="mono">${e(item.date)}</span><div><h3>${e(item.title)}</h3><p>${e(item.summary)}</p></div>${articleImage(item) ? `<img class="journal-image" src="${e(articleImage(item))}" alt="" loading="lazy">` : `<span class="mono">${e(item.tags[0])}<br>${minutes(item.content)} MIN READ</span>`}${icon('arrow-up-right-from-square')}</a>`;
  const events = [...new Set(writeups.map(w => w.ctf))].map(name => ({name,items:writeups.filter(w => w.ctf === name)}));
  const eventURL = name => `ctf-event.html?ctf=${encodeURIComponent(name)}`;
  const archiveItem = item => `<button class="archive-item" data-achievement="${e(item.id)}" aria-label="View ${e(item.title)}"><div class="archive-image">${item.images.length ? `<img src="${e(item.images[0])}" loading="lazy" alt="${e(item.title)}">` : '<span class="empty-state">A moment to remember.</span>'}</div><div class="archive-info"><h3>${e(item.title)}</h3>${icon('arrow-up-right-from-square')}</div><p>${e(item.placement)}${item.placement ? ' / ' : ''}${e(item.issuer)}</p><span class="mono">${e(item.date)} &nbsp; ${item.images.length} PHOTOGRAPH${item.images.length === 1 ? '' : 'S'}</span></button>`;
  const bindArchive = () => document.querySelectorAll('[data-achievement]').forEach(button => button.addEventListener('click', () => {
    const item = achievements.find(a => a.id === button.dataset.achievement);
    if (!item.images.length) return Site.toast(item.summary || item.title);
    showImages(item.images.map(src => ({src,alt:`${item.title} / ${item.date}${item.summary ? ' / ' + item.summary : ''}`})));
  }));
  const count = value => {
    const el = document.querySelector('#result-count');
    if (el) el.textContent = value;
  };
  const noResults = '<p class="empty-state">No matches this time. Try another search.</p>';
  const state = {query:new URLSearchParams(location.search).get('q') || '', filter:'all', year:'all', sort:'newest'};
  const searchInput = document.querySelector('#collection-search');
  if (searchInput) searchInput.value = state.query;
  let render = () => {};
  const filterTabs = values => {
    const element = document.querySelector('#collection-filters');
    if (!element) return;
    element.innerHTML = ['all', ...new Set(values)].map(tag => `<button type="button" data-filter="${e(tag)}" aria-pressed="${tag === 'all'}">${e(tag)}</button>`).join('');
    element.addEventListener('click', event => {
      const button = event.target.closest('[data-filter]');
      if (!button) return;
      state.filter = button.dataset.filter;
      element.querySelectorAll('button').forEach(b => b.setAttribute('aria-pressed', b === button));
      render();
    });
  };
  const yearSelect = items => {
    const select = document.querySelector('#year-filter');
    if (!select) return;
    const years = [...new Set(items.map(item => item.date.match(/\d{4}/)?.[0]).filter(Boolean))].sort().reverse();
    select.innerHTML += years.map(year => `<option>${year}</option>`).join('');
    select.addEventListener('change', () => {state.year = select.value; render();});
  };
  const matches = text => text.toLowerCase().includes(state.query.toLowerCase());

  if (page === 'index') {
    const selectedProjects = projects.filter(p => p.featured).slice(0,3);
    const projectHost = document.querySelector('#home-projects');
    projectHost.innerHTML = `<div class="project-selector" role="tablist" aria-label="Selected projects" aria-orientation="vertical">${selectedProjects.map((p,i) => `<button class="project-row" id="project-tab-${i}" role="tab" aria-selected="${i===0}" aria-controls="home-project-preview" tabindex="${i===0 ? 0 : -1}" data-preview="${i}"><span class="mono project-number">${number(i)}</span><span><span class="project-name">${e(p.title.split(':')[0])}</span><span class="project-description">${e(p.title.includes(':') ? p.title.split(':').slice(1).join(':').trim() : p.description)}</span></span>${icon('arrow-right')}</button>`).join('')}</div><div id="home-project-preview" class="home-project-preview" role="tabpanel" aria-labelledby="project-tab-0" tabindex="0"></div>`;
    const selectProject = index => {
      const item = selectedProjects[index];
      const panel = document.querySelector('#home-project-preview');
      panel.setAttribute('aria-labelledby',`project-tab-${index}`);
      panel.innerHTML = `${projectArt(item,projects.indexOf(item),false)}<div class="project-preview-bottom"><span>${e(item.tech.slice(0,2).join(' / '))}</span><a class="text-link" href="projects.html?project=${encodeURIComponent(item.id)}">Project details ${icon('arrow-up-right-from-square')}</a></div>`;
      projectHost.querySelectorAll('[role="tab"]').forEach((tab,i)=>{tab.setAttribute('aria-selected',String(i===index));tab.tabIndex=i===index?0:-1;});
    };
    projectHost.querySelectorAll('[role="tab"]').forEach((tab,i)=>{
      tab.addEventListener('click',()=>selectProject(i));
      tab.addEventListener('keydown',event=>{
        const keys=['ArrowDown','ArrowUp','Home','End'];
        if(!keys.includes(event.key))return;
        event.preventDefault();
        const next=event.key==='Home'?0:event.key==='End'?selectedProjects.length-1:(i+(event.key==='ArrowDown'?1:-1)+selectedProjects.length)%selectedProjects.length;
        selectProject(next);projectHost.querySelector(`#project-tab-${next}`).focus();
      });
    });
    if(selectedProjects.length)selectProject(0);
    const selections = typeof HOME_SELECTIONS === 'undefined' ? null : HOME_SELECTIONS;
    const selectedWriteup = writeups.find(w=>w.id===selections?.writeup);
    const selectedMoment = achievements.find(a=>a.id===selections?.achievement);
    if (selections && selectedWriteup && selectedMoment) {
      document.querySelector('#home-featured').innerHTML = `<article class="featured-study"><div class="feature-top"><span class="feature-label">SELECTED WRITEUP</span><span>${e(selectedWriteup.ctf)}</span></div><a class="feature-title" href="writeup.html?id=${encodeURIComponent(selectedWriteup.id)}"><h2>${e(selectedWriteup.title)}</h2>${icon('arrow-up-right-from-square')}</a><p>Tracing a compromised Windows machine, from browser history to a Discord-backed implant.</p><div class="evidence-tabs" role="tablist" aria-label="Evidence screenshots">${selections.evidence.map((item,i)=>`<button role="tab" id="evidence-tab-${i}" aria-controls="evidence-panel" aria-selected="${i===0}" tabindex="${i===0?0:-1}" data-evidence="${i}">${e(item.label)}</button>`).join('')}</div><div id="evidence-panel" role="tabpanel" aria-labelledby="evidence-tab-0"><button id="open-evidence" aria-label="Enlarge evidence screenshot"><img id="evidence-image" src="${e(selections.evidence[0].src)}" alt="${e(selections.evidence[0].alt)}"></button></div><a class="feature-read" href="writeup.html?id=${encodeURIComponent(selectedWriteup.id)}">Read the full writeup <span>${minutes(selectedWriteup.content)} min read ${icon('arrow-right')}</span></a></article><a class="featured-moment" href="achievements.html?moment=${encodeURIComponent(selectedMoment.id)}" data-home-achievement="${e(selectedMoment.id)}"><div class="moment-photo"><img src="${e(selections.achievementImage)}" alt="Zakhwan at UM Cybersecurity Summit with the first runner-up award"><span class="moment-date">${e(selectedMoment.date)}</span></div><div class="moment-caption"><span class="feature-label">OUTSIDE THE CODE</span><h2>Good company.<br>A good competition.</h2><span>${e(selectedMoment.placement)} / UMCS CTF 2026 ${icon('arrow-up-right-from-square')}</span></div></a>`;
      document.querySelector('[data-home-achievement]').addEventListener('click', event => {
        event.preventDefault();
        showImages(selectedMoment.images.map(src => ({src, alt:`${selectedMoment.title} / ${selectedMoment.date}${selectedMoment.summary ? ' / ' + selectedMoment.summary : ''}`})));
      });
      let evidenceIndex=0;
      const showEvidence=index=>{
        evidenceIndex=index;
        const item=selections.evidence[index];
        const img=document.querySelector('#evidence-image');img.src=item.src;img.alt=item.alt;
        document.querySelector('#evidence-panel').setAttribute('aria-labelledby',`evidence-tab-${index}`);
        document.querySelectorAll('[data-evidence]').forEach((tab,i)=>{tab.setAttribute('aria-selected',String(i===index));tab.tabIndex=i===index?0:-1;});
      };
      document.querySelectorAll('[data-evidence]').forEach((tab,i)=>{
        tab.addEventListener('click',()=>showEvidence(i));
        tab.addEventListener('keydown',event=>{
          if(!['ArrowLeft','ArrowRight','Home','End'].includes(event.key))return;
          event.preventDefault();const n=selections.evidence.length;
          const next=event.key==='Home'?0:event.key==='End'?n-1:(i+(event.key==='ArrowRight'?1:-1)+n)%n;
          showEvidence(next);document.querySelector(`#evidence-tab-${next}`).focus();
        });
      });
      document.querySelector('#open-evidence').addEventListener('click',()=>showImages(selections.evidence,evidenceIndex));
    }
    document.querySelector('#home-events').innerHTML = events.slice(0,3).map(item => `<a class="event-link" href="${eventURL(item.name)}"><span class="node" aria-hidden="true"></span><div><h3>${e(item.name)}</h3><span class="mono">${item.items.length} CHALLENGES / ${e([...new Set(item.items.map(w => w.category))].join(', '))}</span></div>${icon('arrow-right')}</a>`).join('');
    document.querySelector('#writeup-count').textContent = `${writeups.length} WRITEUPS / ${events.length} EVENTS`;
    document.querySelector('#home-journal').innerHTML = [...blog].sort((a,b) => date(b.date) - date(a.date)).slice(0,3).map(journalRow).join('');
    const homeAchievements = achievements.filter(item => /Runner|Speaker/.test(item.placement)).slice(0,2);
    document.querySelector('#home-archive').innerHTML = homeAchievements.map(archiveItem).join('');
    bindArchive();
  }
  if (page === 'projects') {
    filterTabs(projects.flatMap(p => p.tags));
    const modal = document.querySelector('#project-viewer');
    const openProject = id => {
      const item = projects.find(p => p.id === id);
      if (!item) return;
      const i = projects.indexOf(item);
      const relatedBlog = blog.find(post => post.content.includes(item.github) || post.title.toLowerCase().includes(item.title.split(':')[0].toLowerCase()));
      document.querySelector('#project-detail').innerHTML = `<div class="project-detail-grid">${projectArt(item,i,false)}<div><span class="mono">${e(item.tags.join(' / '))}</span><h2>${e(item.title)}</h2><p>${e(item.description)}</p><p class="mono" style="margin-top:25px">${e(item.tech.join(' / '))}</p><div class="project-detail-links">${item.github ? `<a class="text-link" href="${e(item.github)}" target="_blank" rel="noopener">Source code ${icon('arrow-up-right-from-square')}</a>` : ''}${item.demo ? `<a class="text-link" href="${e(item.demo)}" target="_blank" rel="noopener">Live demo ${icon('arrow-up-right-from-square')}</a>` : ''}${relatedBlog ? `<a class="text-link" href="blog-post.html?id=${encodeURIComponent(relatedBlog.id)}">Read the build story ${icon('arrow-right')}</a>` : ''}</div></div></div>`;
      Site.showDialog(modal);
      try {history.replaceState(null,'',`?project=${encodeURIComponent(id)}`);} catch {}
    };
    modal.addEventListener('close', () => {try {history.replaceState(null,'',location.pathname);} catch {}});
    render = () => {
      const filtered = projects.filter(p => (state.filter === 'all' || p.tags.includes(state.filter)) && matches([p.title,p.description,...p.tech].join(' ')));
      document.querySelector('#project-gallery').innerHTML = filtered.map(p => `<section class="project-exhibit">${projectArt(p,projects.indexOf(p))}<div><span class="mono">${e(p.tech.join(' / '))}</span><h2>${e(p.title)}</h2><p>${e(p.description)}</p><button class="text-link" data-project="${e(p.id)}">Explore project ${icon('arrow-right')}</button></div></section>`).join('') || noResults;
      count(`${filtered.length} / ${projects.length} PROJECTS`);
      document.querySelectorAll('[data-project]').forEach(button => button.addEventListener('click', () => openProject(button.dataset.project)));
    };
    render();
    const requested = new URLSearchParams(location.search).get('project');
    if (requested) openProject(requested);
  }
  if (page === 'writeups') {
    yearSelect(writeups);
    render = () => {
      const filtered = events.filter(event => event.items.some(w => (state.year === 'all' || w.date.includes(state.year)) && matches([event.name,w.title,w.summary,w.category].join(' '))));
      document.querySelector('#event-index').innerHTML = filtered.map((event,i) => `<a class="event-index-row" href="${eventURL(event.name)}"><span class="event-orbit">${number(i)}</span><div><h2>${e(event.name)}</h2><p class="mono">${e([...new Set(event.items.map(w => w.category))].join(' / '))}</p></div><span class="mono">${event.items.length} CHALLENGES</span>${icon('arrow-up-right-from-square')}</a>`).join('') || noResults;
      count(`${filtered.length} / ${events.length} EVENTS`);
    };
    render();
  }
  if (page === 'ctf-event') {
    const name = new URLSearchParams(location.search).get('ctf');
    const event = events.find(item => item.name === name);
    document.querySelector('#event-title').textContent = event ? event.name : 'Event not found.';
    if (event) {
      document.title = `${event.name} | Zakhwan Anuar`;
      document.querySelector('#event-summary').textContent = `${event.items.length} challenge writeups from this event.`;
      filterTabs(event.items.map(w => w.category));
      render = () => {
        const filtered = event.items.filter(w => (state.filter === 'all' || w.category === state.filter) && matches([w.title,w.summary,w.category].join(' ')));
        document.querySelector('#challenge-list').innerHTML = filtered.map((w,i) => `<a class="challenge-row" href="writeup.html?id=${encodeURIComponent(w.id)}"><span class="mono">${number(i)}</span><div><h2>${e(w.title)}</h2><p>${e(w.summary)}</p></div><span class="mono">${e(w.category)} / ${e(w.difficulty)}${w.points != null ? '<br>' + e(w.points) + ' POINTS' : ''}</span>${icon('arrow-up-right-from-square')}</a>`).join('') || noResults;
        count(`${filtered.length} / ${event.items.length} CHALLENGES`);
      };
      render();
    }
  }
  if (page === 'blog') {
    filterTabs(blog.flatMap(item => item.tags));
    render = () => {
      const filtered = blog.filter(item => (state.filter === 'all' || item.tags.includes(state.filter)) && matches([item.title,item.summary,...item.tags].join(' '))).sort((a,b) => state.sort === 'newest' ? date(b.date)-date(a.date) : date(a.date)-date(b.date));
      document.querySelector('#journal-list').innerHTML = filtered.map(journalRow).join('') || noResults;
      count(`${filtered.length} / ${blog.length} ENTRIES`);
    };
    document.querySelector('#sort-order').addEventListener('change', event => {state.sort = event.target.value;render();});
    render();
  }
  if (page === 'achievements') {
    yearSelect(achievements);
    render = () => {
      const filtered = achievements.filter(a => state.year === 'all' || a.date.includes(state.year));
      document.querySelector('#achievement-archive').innerHTML = filtered.map(archiveItem).join('') || noResults;
      count(`${filtered.length} / ${achievements.length} MOMENTS`);
      bindArchive();
    };
    render();
    const requestedMoment = new URLSearchParams(location.search).get('moment');
    const chosen = achievements.find(item=>item.id===requestedMoment);
    if(chosen?.images.length)showImages(chosen.images.map(src=>({src,alt:`${chosen.title} / ${chosen.date}`})));
  }
  if (page === 'games') {
    const games = [
      ['malware-sweeper','Malware Sweeper','border-all','Sweep a network grid for hidden malware. Deduce the safe path, flag the threats, clear the board.','LOGIC / MINESWEEPER'],
      ['code-breaker','Code Breaker','fingerprint','Crack a hidden four-digit code in ten guesses. Pure deduction, like Wordle for numbers.','LOGIC / DEDUCTION'],
      ['sequence','Sequence','braille','A growing pattern. A shorter moment to remember it. See how far your memory can go.','MEMORY / REFLEX'],
      ['aim-trainer','Aim Trainer','crosshairs','A thirty-second target range. Precision, timing, and one more attempt at your best score.','DESKTOP / REFLEX'],
      ['fps','Breach Point','gamepad','A first-person 3D shooter. Hold the point for sixty seconds against the incoming drones.','DESKTOP / 3D'],
      ['kill-switch','Kill Switch','power-off','Each node changes its neighbours. Find the pattern that shuts the whole grid down.','LOGIC / LIGHTS OUT']
    ];
    document.querySelector('#game-library').innerHTML = games.map(([slug,title,symbol,description,tag]) => `<a class="game-entry" href="game-${slug}.html">${icon(symbol)}<div><h2>${e(title)}</h2><p>${e(description)}</p><span class="mono">${tag}</span></div>${icon('arrow-up-right-from-square')}</a>`).join('');
  }
  document.querySelector('#collection-search')?.addEventListener('input', event => {state.query = event.target.value;render();});
})();
