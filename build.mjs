// Builds the whole site into dist/. Run: node build.mjs
// Cloudflare Pages: build command "node build.mjs", output directory "dist".
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { PROJECTS, CLIENTS } from './data/projects.mjs';

const SITE = 'https://mbithemutavi.com';
const ROOT = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(ROOT, 'dist');

// Anything in the repo root that is NOT published as-is.
const IGNORE = new Set([
  'dist', 'node_modules', '.git', '.github', '.wrangler', '.gitignore', '.DS_Store',
  'data', 'partials', 'templates', 'pages', 'old',
  'build.mjs', 'package.json', 'package-lock.json', 'README.md',
]);

const warnings = [];
const warn = m => warnings.push(m);
const fail = m => { console.error('\nBuild stopped: ' + m + '\n'); process.exit(1); };

const read = (...p) => fs.readFileSync(path.join(ROOT, ...p), 'utf8');
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const plain = s => String(s).replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
const urlOf = rel => '/' + rel.split('/').map(encodeURIComponent).join('/');
const fill = (tpl, vars) => tpl.replace(/\{\{([\w-]+)\}\}/g, (m, k) => (k in vars ? vars[k] : m));
const write = (rel, html) => {
  fs.mkdirSync(path.dirname(path.join(OUT, rel)), { recursive: true });
  fs.writeFileSync(path.join(OUT, rel), html);
};

// ---------- exact-case file checks (a Mac ignores case, Cloudflare does not) ----------
const nfc = s => s.normalize('NFC');
const dirCache = new Map();
function lookup(rel) {
  let cur = ROOT;
  for (const seg of rel.split('/')) {
    let names = dirCache.get(cur);
    if (!names) {
      try { names = fs.readdirSync(cur); } catch { return 'missing'; }
      dirCache.set(cur, names);
    }
    if (names.some(n => nfc(n) === nfc(seg))) { cur = path.join(cur, seg); continue; }
    return names.some(n => nfc(n).toLowerCase() === nfc(seg).toLowerCase()) ? 'case' : 'missing';
  }
  return 'ok';
}
function check(rel, where) {
  const r = lookup(rel);
  if (r === 'case') warn(`CASE MISMATCH (will break on Cloudflare): ${rel}  [${where}]`);
  if (r === 'missing') warn(`Missing file: ${rel}  [${where}]`);
  return r === 'ok';
}

// ---------- validate data ----------
const pageFiles = fs.existsSync(path.join(ROOT, 'pages')) ? fs.readdirSync(path.join(ROOT, 'pages')).filter(f => f.endsWith('.html')) : [];
const rootHtml = fs.readdirSync(ROOT).filter(f => f.endsWith('.html') && f !== 'index.html');
const reserved = new Set(['index', 'sitemap', ...pageFiles, ...rootHtml].map(f => f.replace(/\.html$/, '')));
const seen = new Set();
for (const p of PROJECTS) {
  if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(p.slug || '')) fail(`Slug "${p.slug}" must be lowercase letters, numbers and hyphens only (e.g. "my-project").`);
  if (seen.has(p.slug)) fail(`Two projects share the slug "${p.slug}".`);
  if (reserved.has(p.slug)) fail(`Slug "${p.slug}" clashes with a page of the same name.`);
  seen.add(p.slug);
  for (const f of ['title', 'client', 'tag', 'role', 'cover', 'desc']) if (!p[f]) fail(`Project "${p.slug}" is missing "${f}".`);
  if (!Array.isArray(p.gallery)) fail(`Project "${p.slug}" needs a gallery array.`);
}

// ---------- copy static files ----------
fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(OUT, { recursive: true });
for (const name of fs.readdirSync(ROOT)) {
  if (IGNORE.has(name)) continue;
  if (name === 'index.html') { warn('Root index.html is ignored (the homepage is generated). You can delete it.'); continue; }
  fs.cpSync(path.join(ROOT, name), path.join(OUT, name), { recursive: true, filter: s => path.basename(s) !== '.DS_Store' });
}

// ---------- shared pieces ----------
const partials = {
  head: read('partials', 'head.html'),
  header: read('partials', 'header.html'),
  footer: read('partials', 'footer.html'),
  'contact-modal': read('partials', 'contact-modal.html'),
};

// Grid covers use small copies in Images/thumbs/ when they exist.
function thumbFor(cover) {
  const name = cover.replace(/^Images\//, '').replace(/\.[^.]+$/, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  const thumb = `Images/thumbs/${name}.webp`;
  return lookup(thumb) === 'ok' ? thumb : cover;
}

const ARROW = `<svg width="34" height="24" viewBox="0 0 34 24" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M1 5 C3.5 1.5 9 0 13.5 2.5 C18 5 20 11 23 14 C26 17 30 16 32.5 13.5" stroke="#0A0A0A" stroke-width="1.3" stroke-linecap="round" fill="none"/>
  <path d="M28.5 10.5 C30 12 32 13 32.5 13.5 C31 14 29.5 15.5 29 18" stroke="#0A0A0A" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
</svg>`;

function galleryHTML(p) {
  let n = 0;
  const html = p.gallery.map(item => {
    const src = item.type === 'image' ? item.src : (item.type === 'mockup' || item.type === 'mockup-row') ? item.desktop : null;
    if (!src) return '';
    check(src, p.slug);
    if (item.mobile) check(item.mobile, p.slug);
    const lazy = n++ < 2 ? '' : ' loading="lazy" decoding="async"';
    const cap = item.caption ? `<div class="proj-caption">${ARROW}<span class="proj-caption-text">${item.caption}</span></div>` : '';
    return `<div class="proj-page-image"><img src="${urlOf(src)}" alt="${esc(plain(item.caption || p.title))}"${lazy}></div>${cap}`;
  }).join('\n    ');
  return `<div class="proj-page-image-group">\n    ${html}\n  </div>`;
}

function testimonialsHTML(p) {
  const list = p.testimonials || (p.testimonial ? [p.testimonial] : []);
  return list.map(t => `<div class="proj-testimonial">
    <blockquote>"${t.quote}"</blockquote>
    <cite>${t.author}<span>${t.role || ''}</span></cite>
  </div>`).join('\n  ');
}

function metaDescription(p) {
  if (p.summary) return esc(plain(p.summary));
  const t = plain(p.desc.split(/\n\n/)[0]);
  if (t.length <= 158) return esc(t);
  const cut = t.slice(0, 157);
  return esc(cut.slice(0, cut.lastIndexOf(' ')) + '…');
}

// ---------- homepage ----------
const clients = CLIENTS.map(c => {
  check(c.src, 'client logos');
  return `<div class="client-logo-item"><img src="${urlOf(c.src)}" alt="${esc(c.name.trim())}" title="${esc(c.name.trim())}"></div>`;
}).join('\n');

const works = PROJECTS.map(p => {
  check(p.cover, p.slug);
  return `<a class="proj-card" href="/${p.slug}">
      <div class="proj-thumb">
        <img src="${urlOf(thumbFor(p.cover))}" alt="${esc(p.title)}" loading="lazy" decoding="async">
      </div>
      <div class="proj-foot">
        <span class="proj-name">${p.title}</span>
        <span class="proj-cat">${p.tag}</span>
      </div>
    </a>`;
}).join('\n');

write('index.html', fill(read('templates', 'home.html'), { ...partials, clients, works }));

// ---------- project pages ----------
const projectTpl = read('templates', 'project.html');
PROJECTS.forEach((p, i) => {
  const next = PROJECTS[(i + 1) % PROJECTS.length];
  const desc = p.desc.split(/\n\n/).map(par => `<p>${par}</p>`).join('');
  const live = p.url ? `<div class="proj-meta-row"><strong>Live project</strong> : <a href="${esc(p.url)}" target="_blank" rel="noopener">${esc(p.url)}</a></div>` : '';
  write(`${p.slug}.html`, fill(projectTpl, {
    ...partials,
    'title-text': esc(plain(p.title)),
    title: p.title, client: p.client, tag: p.tag, role: p.role,
    description: metaDescription(p),
    canonical: `${SITE}/${p.slug}`,
    'og-image': SITE + urlOf(thumbFor(p.cover)),
    'live-link': live,
    desc,
    gallery: galleryHTML(p),
    testimonials: testimonialsHTML(p),
    'next-slug': next.slug,
  }));
});

// ---------- hand-made pages (pages/*.html) ----------
for (const f of pageFiles) write(f, fill(read('pages', f), partials));

// ---------- sitemap ----------
const urls = ['/', ...[...pageFiles, ...rootHtml].filter(f => f !== '404.html').map(f => '/' + f.replace(/\.html$/, '')), ...PROJECTS.map(p => '/' + p.slug)];
write('sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map(u => `  <url><loc>${SITE}${u}</loc></url>`).join('\n')}\n</urlset>\n`);

// ---------- report ----------
console.log(`Built ${PROJECTS.length} project pages and ${pageFiles.length} other pages into dist/`);
if (warnings.length) {
  console.log(`\n${warnings.length} thing(s) to check:`);
  warnings.forEach(w => console.log('  - ' + w));
}
