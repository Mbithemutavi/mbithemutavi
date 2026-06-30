// ---- PORTFOLIO RENDER LOGIC (single-page layout) ----

const catJump = document.getElementById('cat-jump');
const catSections = document.getElementById('cat-sections');
const overlay = document.getElementById('overlay');
const sidebar = document.getElementById('sidebar');
const sidebarContent = document.getElementById('sidebar-content');

function renderJumpNav() {
  catJump.innerHTML = CATEGORIES.map(c => `<a href="#${c.slug}">${c.title.replace('<br>', ' ')}</a>`).join('');
}

function renderSections() {
  catSections.innerHTML = CATEGORIES.map(cat => {
    const projects = PROJECTS.filter(p => p.category === cat.slug);
    if (!projects.length) return '';
    return `
      <section class="cat-section" id="${cat.slug}">
        <div class="cat-head">
          <span class="section-eyebrow">${cat.eyebrow}</span>
          <h2>${cat.title.replace('<br>', ' ')}</h2>
          <p>${cat.desc}</p>
        </div>
        <div class="cat-grid">
          ${projects.map(p => `
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
          `).join('')}
        </div>
      </section>
    `;
  }).join('');

  catSections.querySelectorAll('.proj-card').forEach(card => {
    card.addEventListener('click', () => openProject(card.dataset.slug));
  });
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
  history.replaceState(null, '', `#${slug}`);
}

function closeProject() {
  overlay.classList.remove('open');
  sidebar.classList.remove('open');
  document.body.style.overflow = '';
}

overlay.addEventListener('click', closeProject);
document.getElementById('sidebar-close-btn').addEventListener('click', closeProject);
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeProject(); });

// init
renderJumpNav();
renderSections();

const initialHash = location.hash.replace('#', '');
if (initialHash && PROJECTS.some(p => p.slug === initialHash)) {
  openProject(initialHash);
}
