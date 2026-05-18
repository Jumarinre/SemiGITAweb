/**
 * data.js — Carga datos e inyecta contenido dinámico en el DOM.
 *
 * Dos fuentes, en este orden de prioridad:
 *   1. Google Sheets — si SHEET_ID está configurado y la página corre
 *      por http/https (p. ej. GitHub Pages).
 *   2. Archivos locales data/*.js (window.__SG.*) — respaldo
 *      automático: funciona sin internet y por file:// en cualquier
 *      navegador. La página nunca queda vacía.
 *
 * Para usar Google Sheets: comparte el Sheet como "Cualquiera con el
 * enlace → Lector" y pega su ID abajo en SHEET_ID.
 * Para editar sin Sheets: edita los archivos en data/.
 */

// ── CONFIG: Google Sheets ──────────────────────────────────────
// ID del Sheet = lo que va entre /d/ y /edit en la URL del documento.
// Déjalo vacío ('') para usar solo los archivos locales en data/.
const SHEET_ID = '';

// Nombre exacto de cada pestaña del Sheet → conjunto de datos.
const SHEET_TABS = {
  researchLines: 'lineas',
  members:       'miembros',
  projects:      'proyectos',
  publications:  'publicaciones',
};

// ── ENTRADA PRINCIPAL ──────────────────────────────────────────
async function loadAllData() {
  const sg = window.__SG || {};

  const researchLines = await loadDataset('researchLines', sg.researchLines || [], rowsToResearchLines);
  const members       = await loadDataset('members',       sg.members       || [], rowsToMembers);
  const projects      = await loadDataset('projects',      sg.projects      || [], rowsToProjects);
  const publications  = await loadDataset('publications',  sg.publications  || [], rowsToPublications);

  renderResearchLines(researchLines);
  renderMembers(members);
  renderProjects(projects);
  renderPublications(publications);
  updateCounters(members, projects, publications, researchLines);
}

// Intenta leer una pestaña del Sheet; ante cualquier fallo (sin
// internet, file://, Sheet privado…) usa el respaldo local.
async function loadDataset(key, fallback, mapRows) {
  const canRemote = SHEET_ID && /^https?:$/.test(location.protocol);
  if (!canRemote) return fallback;

  try {
    const tab = SHEET_TABS[key];
    const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}` +
                `/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(tab)}`;
    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const mapped = mapRows(csvToObjects(await res.text()));
    return mapped.length ? mapped : fallback;
  } catch (err) {
    console.warn(`[SemiGITA] Pestaña "${key}" no disponible; usando datos locales.`, err);
    return fallback;
  }
}

// ── CSV → objetos ──────────────────────────────────────────────
function parseCSV(text) {
  const rows = [];
  let row = [], field = '', inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') { field += '"'; i++; }
        else inQuotes = false;
      } else field += c;
    } else if (c === '"') {
      inQuotes = true;
    } else if (c === ',') {
      row.push(field); field = '';
    } else if (c === '\n') {
      row.push(field); rows.push(row); row = []; field = '';
    } else if (c !== '\r') {
      field += c;
    }
  }
  if (field.length || row.length) { row.push(field); rows.push(row); }
  return rows;
}

function csvToObjects(text) {
  const rows = parseCSV(text).filter(r => r.some(c => c.trim() !== ''));
  if (rows.length < 2) return [];
  const headers = rows[0].map(h => h.trim().toLowerCase());
  return rows.slice(1).map(r => {
    const obj = {};
    headers.forEach((h, i) => { obj[h] = (r[i] || '').trim(); });
    return obj;
  });
}

const splitList = v => (v || '').split('|').map(s => s.trim()).filter(Boolean);
const isYes     = v => /^(si|sí|true|x|1)$/i.test((v || '').trim());

// ── Mapeo CSV → modelo de datos ────────────────────────────────
function rowsToResearchLines(rows) {
  return rows.map(r => ({
    id: r.id, icon: r.icono || '🔬', title: r.titulo,
    description: r.descripcion, tags: splitList(r.tags),
  })).filter(l => l.id);
}

function rowsToMembers(rows) {
  return rows.map(r => ({
    id: r.id, name: r.nombre, role: r.rol, specialty: r.especialidad,
    photo: r.foto || '', bio: r.bio || '', active: isYes(r.activo),
    links: {
      email: r.email || '', linkedin: r.linkedin || '',
      researchgate: r.researchgate || '', github: r.github || '',
    },
  })).filter(m => m.id);
}

function rowsToProjects(rows) {
  return rows.map(r => ({
    id: r.id, title: r.titulo, description: r.descripcion,
    status: (r.estado || 'active').toLowerCase(),
    featured: isYes(r.destacado),
    tags: splitList(r.tags), members: splitList(r.miembros),
    image: r.imagen || '',
    links: { github: r.github || '', paper: r.paper || '', demo: r.demo || '' },
    startDate: r.fecha || '',
  })).filter(p => p.id);
}

function rowsToPublications(rows) {
  return rows.map(r => ({
    id: r.id, title: r.titulo, authors: splitList(r.autores),
    year: Number(r.anio) || r.anio, venue: r.venue,
    doi: r.doi || '', url: r.url || '',
    type: (r.tipo || 'conference').toLowerCase(), tags: splitList(r.tags),
  })).filter(p => p.id);
}

// ── LÍNEAS DE INVESTIGACIÓN ────────────────────────────────────
function renderResearchLines(lines) {
  const grid = document.getElementById('research-grid');
  if (!grid) return;

  const frag = document.createDocumentFragment();

  lines.forEach((line, i) => {
    const card = document.createElement('div');
    card.className = 'research-card';
    card.setAttribute('data-reveal', '');
    card.setAttribute('data-reveal-delay', String(i * 80));

    card.innerHTML = `
      <div class="research-icon" aria-hidden="true">${line.icon}</div>
      <h3 class="research-title">${line.title}</h3>
      <p class="research-desc">${line.description}</p>
      <div class="project-tags" style="margin-top: var(--space-4)">
        ${line.tags.map(t => `<span class="badge badge-cyan">${t}</span>`).join('')}
      </div>
    `;

    frag.appendChild(card);
  });

  grid.appendChild(frag);
}

// ── INTEGRANTES ────────────────────────────────────────────────
function renderMembers(members) {
  const grid = document.getElementById('members-grid');
  if (!grid) return;

  const active = members.filter(m => m.active);
  const frag   = document.createDocumentFragment();

  active.forEach((member, i) => {
    const card = document.createElement('div');
    card.className = 'member-card';
    card.setAttribute('data-reveal', '');
    card.setAttribute('data-reveal-delay', String(i * 70));

    const links    = buildMemberLinks(member.links);
    const photoHTML = member.photo
      ? `<img src="${member.photo}" alt="Foto de ${member.name}" loading="lazy" decoding="async" width="400" height="400">`
      : `<div class="img-placeholder" aria-hidden="true">👤</div>`;

    card.innerHTML = `
      <div class="member-card-inner">
        <div class="member-card-front">
          <div class="member-photo-wrap">${photoHTML}</div>
          <div class="member-info">
            <p class="member-name">${member.name}</p>
            <p class="member-role">${member.role}</p>
            <span class="badge badge-cyan" style="margin-top: var(--space-2)">${member.specialty}</span>
          </div>
        </div>
        <div class="member-card-back">
          <p class="member-name">${member.name}</p>
          <p class="member-bio">${member.bio}</p>
          <div class="member-links">${links}</div>
        </div>
      </div>
    `;

    frag.appendChild(card);
  });

  grid.appendChild(frag);
}

function buildMemberLinks(links) {
  const items = [];
  if (links.email)        items.push(linkItem(`mailto:${links.email}`, svgEmail(),       'Enviar email'));
  if (links.github)       items.push(linkItem(links.github,            svgGitHub(),      'GitHub'));
  if (links.linkedin)     items.push(linkItem(links.linkedin,          svgLinkedIn(),    'LinkedIn'));
  if (links.researchgate) items.push(linkItem(links.researchgate,      svgResearchGate(),'ResearchGate'));
  return items.join('');
}

function linkItem(href, svg, label) {
  return `<a href="${href}" class="member-link" target="_blank" rel="noopener noreferrer" aria-label="${label}">${svg}</a>`;
}

// ── PROYECTOS ──────────────────────────────────────────────────
function renderProjects(projects) {
  const grid = document.getElementById('projects-grid');
  const tabs = document.getElementById('project-tabs');
  if (!grid) return;

  let currentFilter = 'all';

  function render(filter) {
    currentFilter = filter;
    const filtered = filter === 'all'
      ? projects
      : projects.filter(p => p.status === filter);

    grid.innerHTML = '';
    const frag = document.createDocumentFragment();
    filtered.forEach(project => frag.appendChild(buildProjectCard(project)));
    grid.appendChild(frag);

    // Revelar tarjetas inmediatamente (ya están en viewport o cerca)
    grid.querySelectorAll('[data-reveal]').forEach(el => {
      requestAnimationFrame(() => el.classList.add('is-visible'));
    });
  }

  if (tabs) {
    tabs.querySelectorAll('.filter-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        tabs.querySelectorAll('.filter-tab').forEach(t => {
          t.classList.remove('active');
          t.setAttribute('aria-selected', 'false');
        });
        tab.classList.add('active');
        tab.setAttribute('aria-selected', 'true');
        render(tab.dataset.filter);
      });
    });
  }

  render('all');
}

function buildProjectCard(project) {
  const card = document.createElement('div');
  card.className = `project-card${project.featured ? ' project-card--featured' : ''}`;
  card.setAttribute('data-reveal', '');

  const statusBadge = {
    active:    '<span class="badge badge-green">Activo</span>',
    completed: '<span class="badge badge-grey">Completado</span>',
    paused:    '<span class="badge badge-yellow">Pausado</span>',
  }[project.status] || '';

  const imageHTML = project.image
    ? `<img class="project-img" src="${project.image}" alt="${project.title}" loading="lazy" decoding="async">`
    : `<div class="project-img img-placeholder" aria-hidden="true">🔬</div>`;

  const links = [];
  if (project.links.github) links.push(`<a href="${project.links.github}" class="project-link" target="_blank" rel="noopener noreferrer">${svgGitHub()} Código</a>`);
  if (project.links.paper)  links.push(`<a href="${project.links.paper}"  class="project-link" target="_blank" rel="noopener noreferrer">${svgDoc()} Paper</a>`);
  if (project.links.demo)   links.push(`<a href="${project.links.demo}"   class="project-link" target="_blank" rel="noopener noreferrer">→ Demo</a>`);

  card.innerHTML = `
    ${imageHTML}
    <div class="project-body">
      <div style="display:flex; gap: var(--space-2); align-items:center; flex-wrap:wrap">
        ${statusBadge}
        ${project.tags.slice(0, 3).map(t => `<span class="badge badge-cyan">${t}</span>`).join('')}
      </div>
      <h3 class="project-title">${project.title}</h3>
      <p class="project-desc">${project.description}</p>
      <div class="project-links">${links.join('')}</div>
    </div>
  `;

  return card;
}

// ── PUBLICACIONES ──────────────────────────────────────────────
function renderPublications(publications) {
  const list = document.getElementById('publications-list');
  if (!list) return;

  const byYear = {};
  publications.forEach(pub => {
    if (!byYear[pub.year]) byYear[pub.year] = [];
    byYear[pub.year].push(pub);
  });

  const years = Object.keys(byYear).sort((a, b) => b - a);
  const frag  = document.createDocumentFragment();

  years.forEach(year => {
    const group = document.createElement('div');
    group.className = 'year-group';

    const yearLabel = document.createElement('h3');
    yearLabel.className = 'year-label';
    yearLabel.textContent = year;
    group.appendChild(yearLabel);

    const pubsList = document.createElement('div');
    pubsList.className = 'publications-list';
    byYear[year].forEach(pub => pubsList.appendChild(buildPublicationItem(pub)));

    group.appendChild(pubsList);
    frag.appendChild(group);
  });

  list.appendChild(frag);
}

function buildPublicationItem(pub) {
  const item = document.createElement('div');
  item.className = 'publication-item';
  item.setAttribute('data-reveal', '');

  const typeIcon = { conference: '📋', journal: '📖', workshop: '🔧' }[pub.type] || '📄';

  const doiLink = pub.doi
    ? `<a href="https://doi.org/${pub.doi}" class="badge badge-cyan" target="_blank" rel="noopener noreferrer">DOI</a>`
    : '';
  const urlLink = pub.url && !pub.doi
    ? `<a href="${pub.url}" class="badge badge-cyan" target="_blank" rel="noopener noreferrer">Ver →</a>`
    : '';

  const citationText = buildCitation(pub);

  item.innerHTML = `
    <div class="publication-year">${typeIcon}</div>
    <div class="publication-body">
      <p class="publication-title">${pub.title}</p>
      <p class="publication-authors">${pub.authors.join(', ')}</p>
      <p class="publication-venue">${pub.venue}</p>
      <div class="publication-links">
        ${doiLink}${urlLink}
        <button class="copy-citation-btn" data-citation="${encodeURIComponent(citationText)}" aria-label="Copiar citación APA">
          ${svgCopy()} Copiar cita APA
        </button>
      </div>
    </div>
  `;

  item.querySelector('.copy-citation-btn')?.addEventListener('click', async function () {
    try {
      await navigator.clipboard.writeText(decodeURIComponent(this.dataset.citation));
      this.classList.add('copied');
      this.innerHTML = '✓ Copiado';
      showToast('Citación copiada al portapapeles');
      setTimeout(() => {
        this.classList.remove('copied');
        this.innerHTML = `${svgCopy()} Copiar cita APA`;
      }, 2000);
    } catch {}
  });

  return item;
}

function buildCitation(pub) {
  const authors = pub.authors.join(', ');
  return `${authors} (${pub.year}). ${pub.title}. ${pub.venue}.${pub.doi ? ` https://doi.org/${pub.doi}` : pub.url ? ` ${pub.url}` : ''}`;
}

// ── CONTADORES ─────────────────────────────────────────────────
function updateCounters(members, projects, publications, lines) {
  const set = (id, val) => {
    const el = document.getElementById(id);
    if (el) el.textContent = val;
  };
  set('count-members',      members.filter(m => m.active).length);
  set('count-projects',     projects.length);
  set('count-publications', publications.length);
  set('count-lines',        lines.length);
  set('stat-members',       members.filter(m => m.active).length);
  set('stat-projects',      projects.length);
  set('stat-publications',  publications.length);
  set('stat-lines',         lines.length);
}

// ── SVG ICONS ──────────────────────────────────────────────────
function svgEmail() {
  return `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>`;
}
function svgGitHub() {
  return `<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844a9.59 9.59 0 0 1 2.504.337c1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0 0 22 12.017C22 6.484 17.522 2 12 2z"/></svg>`;
}
function svgLinkedIn() {
  return `<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>`;
}
function svgResearchGate() {
  return `<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M19.586 0c-.818 0-1.508.19-2.073.565-.563.377-.97.936-1.213 1.68a12.193 12.193 0 0 0-.39 2.948c0 .66.075 1.226.224 1.698.151.473.38.876.69 1.21.31.334.66.57 1.046.71.384.14.822.21 1.314.21.503 0 .95-.07 1.339-.21.39-.14.73-.376 1.025-.71.295-.334.516-.737.66-1.21.147-.472.22-1.038.22-1.698 0-1.06-.13-1.926-.39-2.597-.26-.67-.63-1.17-1.105-1.496A2.66 2.66 0 0 0 19.586 0zm0 .78a1.88 1.88 0 0 1 1.125.36c.33.24.596.61.798 1.11.203.5.305 1.15.305 1.942 0 .59-.063 1.09-.19 1.498-.127.41-.306.73-.54.962-.232.233-.503.39-.815.47a3.38 3.38 0 0 1-.683.07c-.24 0-.468-.024-.684-.07a1.694 1.694 0 0 1-.603-.26 1.53 1.53 0 0 1-.432-.53 2.716 2.716 0 0 1-.245-.835 7.78 7.78 0 0 1-.07-1.105c0-.792.1-1.442.302-1.942.202-.5.468-.87.798-1.11A1.88 1.88 0 0 1 19.586.78zM4.42 3.56C2.008 3.56 0 5.57 0 7.98c0 2.414 2.007 4.42 4.42 4.42s4.42-2.006 4.42-4.42c0-2.41-2.007-4.42-4.42-4.42zm0 .78c1.998 0 3.64 1.642 3.64 3.64 0 1.998-1.642 3.64-3.64 3.64S.78 9.978.78 7.98c0-1.998 1.642-3.64 3.64-3.64zm10.79 1.39v15.5h1.56V5.73zm-10.79.78a2.858 2.858 0 0 0-2.86 2.86A2.858 2.858 0 0 0 4.42 11.63a2.858 2.858 0 0 0 2.86-2.86A2.858 2.858 0 0 0 4.42 6.51zm0 .78a2.08 2.08 0 0 1 2.08 2.08A2.08 2.08 0 0 1 4.42 11.45a2.08 2.08 0 0 1-2.08-2.08A2.08 2.08 0 0 1 4.42 7.29z"/></svg>`;
}
function svgCopy() {
  return `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>`;
}
function svgDoc() {
  return `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14,2 14,8 20,8"/></svg>`;
}
