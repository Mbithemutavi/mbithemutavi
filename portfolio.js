// ---- PORTFOLIO RENDER LOGIC ----

const ICONS = {
  blue: `<svg viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M6 16C6 13.7909 7.79086 12 10 12H22L26 17H46C48.2091 17 50 18.7909 50 21V40C50 42.2091 48.2091 44 46 44H10C7.79086 44 6 42.2091 6 40V16Z" fill="#4c56fd" fill-opacity="0.14" stroke="#4c56fd" stroke-width="2"/>
    <path d="M6 22H50" stroke="#4c56fd" stroke-width="2"/>
  </svg>`,
  lime: `<svg viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M6 16C6 13.7909 7.79086 12 10 12H22L26 17H46C48.2091 17 50 18.7909 50 21V40C50 42.2091 48.2091 44 46 44H10C7.79086 44 6 42.2091 6 40V16Z" fill="#cfff65" fill-opacity="0.35" stroke="#9bbf2f" stroke-width="2"/>
    <path d="M6 22H50" stroke="#9bbf2f" stroke-width="2"/>
  </svg>`,
  black: `<svg viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M6 16C6 13.7909 7.79086 12 10 12H22L26 17H46C48.2091 17 50 18.7909 50 21V40C50 42.2091 48.2091 44 46 44H10C7.79086 44 6 42.2091 6 40V16Z" fill="#1a1a18" fill-opacity="0.08" stroke="#1a1a18" stroke-width="2"/>
    <path d="M6 22H50" stroke="#1a1a18" stroke-width="2"/>
  </svg>`,
};

const landingView = document.getElementById('landing');
const categoryView = document.getElementById('category');
const folderGrid = document.getElementById('folder-grid');
const catGrid = document.getElementById('cat-grid');
const overlay = document.getElementById('overlay');
const sidebar = document.getElementById('sidebar');
const sidebarContent = document.getElementById('sidebar-content');

function projectCount(catSlug) {
  return PROJECTS.filter(p => p.category === catSlug).length;
}

function renderFolders() {
  folderGrid.innerHTML = CATEGORIES.map((c, i) => `
    <a href="#${c.slug}" class="folder-card fc-${i+1}" data-cat="${c.slug}">
      <div class="folder-card-bg"></div>
      <span class="folder-card-count">${projectCount(c.slug)} project${projectCount(c.slug)===1?'':'s'}</span>
      <div class="folder-icon">${ICONS[c.icon]}</div>
      <h3>${c.title}</h3>
      <p>${c.short}</p>
      <span class="folder-card-arrow">Explore →</span>
    </a>
  `).join('');

  folderGrid.querySelectorAll('.folder-card').forEach(card => {
    card.addEventListener('click', e => {
      e.preventDefault();
      openCategory(card.dataset.cat);
    });
  });
}

function openCategory(slug) {
  const cat = CATEGORIES.find(c => c.slug === slug);
  if (!cat) return;
  document.getElementById('cat-eyebrow').textContent = cat.eyebrow;
  document.getElementById('cat-title').innerHTML = cat.title.replace('<br>', ' ');
  document.getElementById('cat-desc').textContent = cat.desc;

  const projects = PROJECTS.filter(p => p.category === slug);
  catGrid.innerHTML = projects.map(p => `
    <div class="proj-card" data-slug="${p.slug}">
      <div class="proj-thumb">
        <span class="proj-tag">${p.tag}</span>
        <img src="${p.cover}" alt="${p.title}" loading="lazy">
      </div>
      <div class="proj-info">
        <h3>${p.title}</h3>
        <p>${p.client}</p>
      </div>
    </div>
  `).join('');

  catGrid.querySelectorAll('.proj-card').forEach(card => {
    card.addEventListener('click', () => openProject(card.dataset.slug));
  });

  landingView.style.display = 'none';
  categoryView.style.display = 'block';
  window.scrollTo({ top: 0, behavior: 'instant' in window ? 'instant' : 'auto' });
  history.pushState({ view: 'category', slug }, '', `#${slug}`);
}

function openLanding(push = true) {
  categoryView.style.display = 'none';
  landingView.style.display = 'block';
  window.scrollTo({ top: 0 });
  if (push) history.pushState({ view: 'landing' }, '', '#');
}

function galleryItemHTML(item) {
  if (item.type === 'mockup-row') {
    return `
      <div class="mockup-row">
        <div class="mockup-desktop">
          <div class="mockup-frame">
            <div class="mockup-bar"><span class="mockup-dot"></span><span class="mockup-dot"></span><span class="mockup-dot"></span></div>
            <img src="${item.desktop}" alt="">
          </div>
          <div class="mockup-label">Desktop</div>
        </div>
        ${item.mobile ? `
        <div class="mockup-mobile">
          <div class="mockup-frame"><img src="${item.mobile}" alt=""></div>
          <div class="mockup-label">Mobile</div>
        </div>` : ''}
      </div>
      ${item.caption ? `<p style="font-size:13px;color:var(--muted);margin:-8px 0 18px">${item.caption}</p>` : ''}
    `;
  }
  if (item.type === 'mockup') {
    return `
      <div class="mockup-frame">
        <div class="mockup-bar"><span class="mockup-dot"></span><span class="mockup-dot"></span><span class="mockup-dot"></span></div>
        <img src="${item.desktop}" alt="">
      </div>
      ${item.caption ? `<p style="font-size:13px;color:var(--muted);margin:-8px 0 18px">${item.caption}</p>` : ''}
    `;
  }
  return `
    <img src="${item.src}" alt="">
    ${item.caption ? `<p style="font-size:13px;color:var(--muted);margin:-8px 0 4px">${item.caption}</p>` : ''}
  `;
}

function openProject(slug) {
  const p = PROJECTS.find(p => p.slug === slug);
  if (!p) return;

  sidebarContent.innerHTML = `
    <span class="sidebar-eyebrow">${p.tag}</span>
    <h2>${p.title}</h2>
    <div class="sidebar-meta">
      <div class="meta-item"><span>Client</span><span>${p.client}</span></div>
      <div class="meta-item"><span>Role</span><span>${p.role}</span></div>
      <div class="meta-item"><span>Type</span><span>${p.type}</span></div>
    </div>
    <p class="desc">${p.desc}</p>
    <div class="sidebar-gallery">
      ${p.gallery.map(galleryItemHTML).join('')}
    </div>
  `;
  overlay.classList.add('open');
  sidebar.classList.add('open');
  sidebar.scrollTop = 0;
  document.body.style.overflow = 'hidden';
}

function closeProject() {
  overlay.classList.remove('open');
  sidebar.classList.remove('open');
  document.body.style.overflow = '';
}

overlay.addEventListener('click', closeProject);
document.getElementById('sidebar-close-btn').addEventListener('click', closeProject);
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeProject(); });

document.getElementById('back-to-folders').addEventListener('click', e => {
  e.preventDefault();
  openLanding();
});

window.addEventListener('popstate', e => {
  const state = e.state;
  if (!state || state.view === 'landing') {
    openLanding(false);
  } else if (state.view === 'category') {
    openCategory(state.slug);
  }
});

// init
renderFolders();
const initialHash = location.hash.replace('#', '');
if (initialHash && CATEGORIES.some(c => c.slug === initialHash)) {
  openCategory(initialHash);
} else {
  history.replaceState({ view: 'landing' }, '', '#');
}
