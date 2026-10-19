// Detail page. project.html?p=<slug> shows a project from projects.js;
// project.html?e=<slug> shows an experience entry from experience.js.
// Fills the left facts and the article.

const params = new URLSearchParams(location.search);
const isEntry = params.has('e') && !params.has('p');
const list = isEntry ? ENTRIES : PROJECTS;
const slug = params.get(isEntry ? 'e' : 'p');
const i = Math.max(0, list.findIndex((x) => x.slug === slug));
const item = list[i];
const field = (name) => document.querySelector(`[data-f="${name}"]`);
const urlOf = isEntry ? entryUrl : projectUrl;
// Previous / next stay inside the item's section.
const secOf = isEntry ? (x) => x.group : projectSection;
const peers = list.filter((x) => secOf(x) === secOf(item));
const j = peers.indexOf(item);
const prev = peers[(j - 1 + peers.length) % peers.length];
const next = peers[(j + 1) % peers.length];
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
const ext = (url) => /^https?:/.test(url);
const linkHtml = ([label, url]) => `<a class="go" href="${esc(url)}"${ext(url) || url.endsWith('.pdf') ? ' target="_blank" rel="noopener"' : ''}>${esc(label)} &#8599;</a>`;
const back = `index.html#${isEntry ? 'experience' : 'projects'}/${item.slug}`;
const color = (isEntry ? entryColor : wireColor)(item, i);
const nameOf = (x) => (isEntry ? x.org : x.title);

// ---------- Left: facts ----------

const facts = isEntry
  ? [
    ['Role', esc(item.role)],
    ['Section', esc(item.group)],
    ['When', esc(item.date)],
    ['Where', esc(item.place)],
    ['Skills', item.tags && esc(item.tags.join(', '))],
    ['Link', item.site && linkHtml(item.site)],
    ['Net', `<i class="swatch" style="background:${color}"></i>Net ${pad(i + 1)}`],
  ]
  : [
    ['Role', item.role && esc(item.role)],
    ['Section', esc(projectSection(item))],
    ['Year', item.year && esc(item.year)],
    ['Category', item.category && esc(item.category)],
    ...(item.extra || []).map(([k, v]) => [k, esc(v)]),
    ['Stack', item.tags && esc(item.tags.join(', '))],
    ['Links', item.links && item.links.map(linkHtml).join('<br>')],
    ['Net', `<i class="swatch" style="background:${color}"></i>Net ${pad(i + 1)}`],
  ];
const rows = facts.filter(([, v]) => v);
rows.push(['<span class="sr">Back</span>', `<a class="go" href="${back}">&larr; Back to the ${isEntry ? 'experience' : 'board'}</a>`]);
const fact = ([k, v], cls = 'fact') => `<div class="${cls}"><dt>${k}</dt><dd>${v}</dd></div>`;
document.querySelector('[data-facts]').innerHTML = `${fact(rows[0], 'fact fact--a')}
  <div class="pane__b">${rows.slice(1).map((r) => fact(r)).join('')}</div>`;

document.title = `${isEntry ? `${item.role} — ${item.org}` : item.title} — Michael Xie`;
field('count-lbl').textContent = isEntry ? 'Entry' : 'Net';
field('no').textContent = pad(i + 1);
field('of').textContent = `/${pad(list.length)}`;
document.querySelector(`[data-nav="${isEntry ? 'experience' : 'projects'}"]`).classList.add('is-on');

// ---------- Article ----------

const media = (m) => `<figure class="article__fig">
    ${m.video
    ? `<video src="${m.video}" poster="${m.poster || ''}" autoplay muted loop playsinline preload="metadata" aria-label="${esc(m.caption)}"></video>`
    : `<img src="${m.src}" alt="${esc(m.caption)}" loading="lazy">`}
    <figcaption>${esc(m.caption)}</figcaption>
  </figure>`;

const head = isEntry
  ? `<div class="article__cover" style="--c:${color}">${entryCover(item)}</div>
  ${item.logo && item.image ? `<img class="article__logo" src="${item.logo}" alt="${esc(item.org)} logo" width="56" height="56">` : ''}
  <h1 class="article__title">${esc(item.org)}</h1>
  <p class="article__lede">${esc(item.role)}<br><span class="article__sub">${esc(item.date)} · ${esc(item.place)}</span></p>`
  : `<div class="article__cover" style="--c:${color}">${cover(item)}</div>
  <h1 class="article__title">${esc(item.title)}</h1>
  <p class="article__lede">${esc(item.blurb)}</p>`;

const stats = item.stats
  ? `<dl class="article__stats">${item.stats.map(([v, l]) => `<div><dt>${esc(v)}</dt><dd>${esc(l)}</dd></div>`).join('')}</dl>`
  : '';
const text = isEntry
  ? (item.bullets
    ? `<ul class="article__list">${item.bullets.map((t) => `<li>${esc(t)}</li>`).join('')}</ul>`
    : `<p class="article__p">${esc(item.short)}</p>`)
  : (item.body || []).map((t) => `<p class="article__p">${esc(t)}</p>`).join('');
const gallery = item.media ? `<div class="article__media">${item.media.map(media).join('')}</div>` : '';

document.querySelector('[data-article]').innerHTML = `
  ${head}
  ${stats}
  ${text}
  ${gallery}
  <nav class="pager" aria-label="More ${isEntry ? 'experience' : 'projects'}">
    <a href="${urlOf(prev)}"><span class="lbl">Previous</span>${esc(nameOf(prev))}</a>
    <a href="${urlOf(next)}"><span class="lbl">Next</span>${esc(nameOf(next))}</a>
  </nav>`;
