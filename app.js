// Left: menu tabs + descriptions. Middle: the cards. Right: the breadboard,
// stood on end. Projects and Experience are split into sections, and each
// section is its own deck of cards; the open deck waits in a stack at the top
// right, and each step rolls the next card forward to the centre and drops the
// last onto the pile at the bottom left.

const app = document.querySelector('.app');
const stream = document.querySelector('[data-stream]');
const boardBox = document.querySelector('.board-box');
const tabs = [...document.querySelectorAll('.tabs [data-tab]')];
const panes = [...document.querySelectorAll('[data-pane]')];
const field = (name) => document.querySelector(`[data-f="${name}"]`);
const countLbl = document.querySelector('[data-count-lbl]');
const countBig = document.querySelector('[data-count-big]');
const countOf = document.querySelector('[data-count-of]');
const stageHint = document.querySelector('[data-stage-hint]');
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
const esc = (str) => String(str).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);

// The two card tabs. sec() names the section a card belongs to; show() fills
// the tab's pane for the card in front (n = its index in items).
const KIND = { Work: 'Company', Leadership: 'Group', Education: 'School' };
const KINDS = {
  projects: {
    items: PROJECTS, key: 'p', sec: projectSection, url: projectUrl, color: wireColor, face: cover,
    name: (p) => p.title,
    lcd: (p) => [p.title, p.year || projectSection(p)],
    show(p, n) {
      field('title').textContent = p.title;
      field('year').textContent = p.year || '';
      field('year').parentElement.hidden = !p.year; // a few projects have no year
      field('short').textContent = p.short || p.blurb;
      field('swatch').style.background = wireColor(p, n);
      field('link').href = projectUrl(p);
    },
  },
  experience: {
    items: ENTRIES, key: 'e', sec: (e) => e.group, url: entryUrl, color: entryColor, face: entryCover,
    name: (e) => `${e.role} — ${e.org}`,
    lcd: (e) => [e.org.split(',')[0], e.when], // "Student Council, St. John’s School" → "Student Council"
    show(e, n) {
      field('e-group').textContent = KIND[e.group] || e.group;
      field('e-org').textContent = e.org;
      field('e-swatch').style.background = entryColor(e, n);
      field('e-role').textContent = e.role;
      field('e-when').textContent = `${e.date} · ${e.place}`;
      field('e-short').textContent = e.short;
      field('e-link').href = entryUrl(e);
    },
  },
};
const TABS = { projects: null, experience: null, bio: { chip: 'U3', name: 'About Me', lcd: { top: 'Michael Xie', bottom: 'EE · UBC 2027' } } };

// Every section becomes a deck: ids are its cards' indices in the tab's items.
const DECKS = [];
Object.entries(KINDS).forEach(([t, k]) => {
  k.tab = t;
  k.decks = [];
  k.items.forEach((x, n) => {
    const name = k.sec(x);
    let d = k.decks.find((s) => s.name === name);
    if (!d) {
      d = { kind: k, tab: t, name, ids: [], current: 0, pos: 0, target: 0 }; // pos: rendered spot; target: where it's easing to
      k.decks.push(d);
      DECKS.push(d);
    }
    d.ids.push(n);
  });
  k.deck = k.decks[0]; // the open section
});

let tab = 'projects';
let deck = KINDS.projects.deck; // the deck on the stage; stays put while About Me is open
let frame = 0;
let ax = 0;       // anchor: centre of the free space between the copy and the board
let ay = 0;
let w = 0;        // card width
let pileX = 0;    // where the pile lands, kept clear of the counter

// ---------- Cards ----------

// Mid-roll the card is pulled by its middle, so its sides curl up after it.
// The bend is drawn by vertical strips, each a slice of the face; --s is a
// strip's centre, from -0.5 (left edge) to 0.5 (right edge).
const STRIP_N = 10;
const STRIPS = Array.from({ length: STRIP_N }, (_, s) => ((s + 0.5) / STRIP_N - 0.5).toFixed(3));

stream.innerHTML = DECKS.map((d, j) => d.ids.map((n, i) => {
  const { kind: k } = d;
  const x = k.items[n];
  return `
  <a class="card" href="${k.url(x)}" data-deck="${j}" data-i="${i}" style="--c:${k.color(x, n)}" aria-label="${pad(i + 1)} — ${esc(k.name(x))}" draggable="false">
    ${k.face(x)}
    <span class="bend" aria-hidden="true">${STRIPS.map((s) => `<span class="bend__s" style="--s:${s}">${k.face(x)}</span>`).join('')}</span>
  </a>`;
}).join('')).join('');
DECKS.forEach((d, j) => {
  d.cards = [...stream.querySelectorAll(`[data-deck="${j}"]`)];
  d.last = d.ids.length - 1;
});

// Section tabs above each pane: click between a tab's decks.
Object.values(KINDS).forEach((k) => {
  k.nav = document.querySelector(`[data-secs="${k.tab}"]`);
  k.nav.innerHTML = k.decks.map((d, j) => `<button type="button" data-sec="${j}">${esc(d.name)}<sup>${pad(d.ids.length)}</sup></button>`).join('');
  k.nav.addEventListener('click', (e) => {
    const b = e.target.closest('[data-sec]');
    if (b) openDeck(k.decks[+b.dataset.sec]);
  });
});

// Bio portrait: rides in the stream, in the spot where the current card sits.
const portrait = document.querySelector('.portrait');
stream.append(portrait);

// Doodles around the portrait: each opens its own popup; outside click or Esc closes it.
// (The travel doodle opens the globe instead; see travel.js.)
const doodles = [...portrait.querySelectorAll('.doodle[aria-controls]')];
const closePops = () => doodles.forEach((d) => {
  d.setAttribute('aria-expanded', 'false');
  document.getElementById(d.getAttribute('aria-controls')).hidden = true;
});
doodles.forEach((d) => d.addEventListener('click', () => {
  const open = d.getAttribute('aria-expanded') === 'true';
  closePops();
  if (open) return;
  d.setAttribute('aria-expanded', 'true');
  document.getElementById(d.getAttribute('aria-controls')).hidden = false;
}));
addEventListener('click', (e) => { if (!e.target.closest('.doodle, .pop')) closePops(); });
addEventListener('keydown', (e) => { if (e.key === 'Escape') closePops(); });

// Phones: the menu folds away behind the burger; picking anything in it closes it.
const burger = document.querySelector('.burger');
const setMenu = (open) => {
  app.classList.toggle('is-menu', open);
  burger.setAttribute('aria-expanded', open);
};
burger.addEventListener('click', () => setMenu(!app.classList.contains('is-menu')));
document.querySelector('.tabs').addEventListener('click', (e) => {
  if (e.target.closest('a, button')) setMenu(false);
});
addEventListener('keydown', (e) => { if (e.key === 'Escape') setMenu(false); });

// Email: assembled here so the address isn't sitting in the HTML for scrapers.
document.querySelectorAll('.email-link').forEach((a) => {
  const addr = `${a.dataset.user}@${a.dataset.domain}`;
  a.href = `mailto:${addr}`;
  a.textContent = addr;
});

function measure() {
  const s = stream.getBoundingClientRect();
  const b = boardBox.getBoundingClientRect();
  // Wide screens: the board stands beside the cards. Small screens: it sits below.
  const beside = b.left > s.left + s.width / 2 && b.top < s.bottom;
  const free = beside ? b.left - s.left : s.width;
  // Phones show one big card; the stacks mostly fade off the band's edges.
  const phone = matchMedia('(max-width: 640px)').matches;
  // The card sits in the middle of the window (behind the copy if need be),
  // but never reaches under the board.
  const mid = innerWidth / 2;
  const room = beside ? 2 * (b.left - mid - 24) : Infinity;
  w = Math.round(Math.max(150, Math.min(free * (phone ? 0.64 : 0.72), room, s.height * (phone ? 0.62 : 0.42), 440)));
  stream.style.setProperty('--cw', `${w}px`);
  ax = beside ? mid - s.left : s.width / 2;
  ay = s.height / 2;
  pileX = -0.4 * w;
  portrait.style.setProperty('--pw', `${Math.round(w * 0.62)}px`);
  portrait.style.transform = `translate3d(${ax}px, ${ay}px, 0)`;
  if (beside) pileX = Math.max(pileX, countOf.getBoundingClientRect().right + 16 - s.left + 0.55 * w - ax);
}

// d = steps from the centre: d > 0 still waiting (top right), d < 0 played (bottom left).
function place(el, d) {
  const a = Math.abs(d);
  el.style.visibility = a > 4.5 ? 'hidden' : '';
  if (a > 4.5) return;
  const e = Math.min(a, 1);   // the roll between the centre and a stack
  const r = a - e;            // depth inside the stack
  const up = d > 0;
  const x = up ? (0.3 * e + 0.15 * r) * w : pileX * e - 0.03 * r * w;
  const y = up ? -(1.12 * e + 0.1 * r) : 1.22 * e + 0.3 * r;
  const z = up ? -0.35 * r : 0.03 * r;
  el.style.transform = `translate3d(${ax + x}px, ${ay + y * w}px, 0) perspective(${w * 5}px)
    translateZ(${z * w}px) rotate3d(1, 1, 0, ${-34 * e}deg) rotate(${2 * e}deg)`;
  // Flat in the stacks and at the centre, most curled halfway between.
  const bend = reducedMotion ? 0 : Math.sin(Math.PI * e) * 0.9;
  el.style.setProperty('--bend', bend.toFixed(3));
  el.classList.toggle('is-bent', bend > 0.01);
  // The stack fades into the distance; the pile just slides off the bottom.
  el.style.opacity = !up || a < 2.4 ? 1 : Math.max(0, (4 - a) / 1.6);
  // Waiting cards pass behind the copy and the board; played ones land in front.
  el.style.zIndex = d > -0.5 ? 20 - Math.round(d * 2) : 40 + Math.round(-d * 2);
}

const layout = (d) => d.cards.forEach((el, i) => place(el, i - d.pos));
const layoutAll = () => DECKS.forEach(layout);

function tickStream() {
  let moving = false;
  DECKS.forEach((d) => {
    if (d.pos === d.target) return;
    d.pos += (d.target - d.pos) * (reducedMotion ? 1 : 0.11);
    if (Math.abs(d.target - d.pos) < 0.0005) d.pos = d.target;
    layout(d);
    moving = moving || d.pos !== d.target;
    const i = Math.round(d.pos);
    if (i === d.current) return;
    if (d === deck) select(i);
    else d.current = i;
  });
  frame = moving ? requestAnimationFrame(tickStream) : 0;
}
const kick = () => { if (!frame) frame = requestAnimationFrame(tickStream); };
const go = (i, d = deck) => { d.target = Math.max(0, Math.min(d.last, i)); kick(); };

// ---------- Left side ----------

function swapCount(lbl, big, of) {
  countLbl.textContent = lbl;
  countOf.textContent = of;
  if (countBig.textContent === big) return;
  countBig.textContent = big;
  if (!reducedMotion) {
    countBig.animate(
      [{ transform: 'translateY(35%)', opacity: 0 }, { transform: 'none', opacity: 1 }],
      { duration: 500, easing: 'cubic-bezier(.16, 1, .3, 1)' },
    );
  }
}

function select(i) {
  deck.current = i;
  const k = deck.kind;
  const n = deck.ids[i];
  const x = k.items[n];
  k.show(x, n);
  deck.cards.forEach((el, c) => el.classList.toggle('is-current', c === i));
  app.classList.toggle('is-moved', i > 0); // the hint has done its job
  if (tab === deck.tab) {
    swapCount(deck.name, pad(i + 1), `/${pad(deck.ids.length)}`);
    const [top, bottom] = k.lcd(x);
    Board.set(deck.tab, { tag: pad(i + 1), top, bottom });
    history.replaceState(null, '', `#${deck.tab}/${x.slug}`);
  }
}

// Put deck d on the stage: the rest fade out where they stand.
function openDeck(d) {
  d.kind.deck = d;
  deck = d;
  [...d.kind.nav.children].forEach((b, j) => {
    const on = d.kind.decks[j] === d;
    b.classList.toggle('is-on', on);
    b.setAttribute('aria-pressed', on);
  });
  DECKS.forEach((s) => s.cards.forEach((el) => el.classList.toggle('is-away', s !== d)));
  select(d.current);
  measure(); // the counter's width may have changed
  layoutAll();
}

function setTab(t) {
  tab = t;
  closePops();
  app.dataset.tab = t;
  tabs.forEach((a) => {
    const on = a.dataset.tab === t;
    a.classList.toggle('is-on', on);
    if (on) a.setAttribute('aria-current', 'page');
    else a.removeAttribute('aria-current');
  });
  panes.forEach((p) => { p.hidden = p.dataset.pane !== t; });
  if (t in KINDS) {
    openDeck(KINDS[t].deck);
  } else {
    DECKS.forEach((d) => d.cards.forEach((el) => el.classList.add('is-away')));
    swapCount('Chip', TABS[t].chip, `/${TABS[t].name}`);
    Board.set(t, TABS[t].lcd);
  }
}

// Card n of a tab: its deck and its place in that deck.
const findCard = (k, n) => {
  const d = k.decks.find((s) => s.ids.includes(n));
  return [d, d.ids.indexOf(n)];
};

function route() {
  const [t, slug] = location.hash.slice(1).split('/');
  if (!(t in TABS)) return setTab('projects');
  const k = KINDS[t];
  const n = k && slug ? k.items.findIndex((x) => x.slug === slug) : -1;
  if (n >= 0) {
    const [d, i] = findCard(k, n);
    d.current = d.pos = d.target = i;
    k.deck = d;
    layout(d);
  }
  setTab(t);
}
addEventListener('hashchange', route);

// Board: the slide switch and the chips change tab, like the menu.
Board.onPick = (key) => {
  if (key !== tab) location.hash = key;
};

// ---------- Input ----------

const canScrub = () => tab in KINDS &&!document.body.classList.contains('is-intro') && !document.querySelector('dialog[open]');
let snap = 0;

addEventListener('wheel', (e) => {
  if (!canScrub() || !matchMedia('(min-width: 901px)').matches) return;
  e.preventDefault();
  const unit = e.deltaMode === 1 ? 16 : 1;
  deck.target = Math.max(0, Math.min(deck.last, deck.target + (e.deltaY + e.deltaX) * unit * 0.0024));
  kick();
  clearTimeout(snap);
  snap = setTimeout(() => go(Math.round(deck.target)), 140);
}, { passive: false });

addEventListener('keydown', (e) => {
  if (!canScrub() || e.target.closest('input, textarea')) return;
  if (['ArrowDown', 'ArrowRight', 'PageDown'].includes(e.key)) { e.preventDefault(); go(deck.current + 1); }
  if (['ArrowUp', 'ArrowLeft', 'PageUp'].includes(e.key)) { e.preventDefault(); go(deck.current - 1); }
});

// Drag the stack: down or to the left pulls the next card forward.
let drag = null;
let dragged = false;
stream.addEventListener('pointerdown', (e) => {
  if (!canScrub() || e.button || e.pointerType === 'touch') return;
  drag = { x: e.clientX, y: e.clientY, t: deck.target };
  dragged = false;
});
addEventListener('pointermove', (e) => {
  if (!drag) return;
  const dx = e.clientX - drag.x;
  const dy = e.clientY - drag.y;
  if (Math.abs(dx) + Math.abs(dy) > 6) dragged = true;
  deck.target = Math.max(0, Math.min(deck.last, drag.t + (dy - dx) / (w * 1.2)));
  kick();
});
const endDrag = () => { if (drag) { drag = null; go(Math.round(deck.target)); } };
addEventListener('pointerup', endDrag);
addEventListener('pointercancel', endDrag);
stream.addEventListener('dragstart', (e) => e.preventDefault());

// Touch: the browser would take a vertical swipe as a page scroll (and cancel the
// pointer), so the first move decides. Sideways, or up and down within the deck,
// scrubs the stack; pushing past either end scrolls the page as usual.
let swipe = null;
stream.addEventListener('touchstart', (e) => {
  if (!canScrub() || e.touches.length > 1) { swipe = null; return; }
  const t = e.touches[0];
  swipe = { x: t.clientX, y: t.clientY, t: deck.target, mode: null };
  dragged = false;
}, { passive: true });
stream.addEventListener('touchmove', (e) => {
  if (!swipe) return;
  const t = e.touches[0];
  const dx = t.clientX - swipe.x;
  const dy = t.clientY - swipe.y;
  if (!swipe.mode) {
    if (Math.abs(dx) + Math.abs(dy) < 4) return;
    const past = Math.abs(dy) > Math.abs(dx) && (dy > 0 ? deck.current >= deck.last : deck.current <= 0);
    swipe.mode = past ? 'page' : 'deck';
  }
  if (swipe.mode === 'page') return;
  if (e.cancelable) e.preventDefault();
  if (Math.abs(dx) + Math.abs(dy) > 6) dragged = true;
  deck.target = Math.max(0, Math.min(deck.last, swipe.t + (dy - dx) / (w * 1.2)));
  kick();
}, { passive: false });
const endSwipe = () => {
  if (swipe && swipe.mode === 'deck') go(Math.round(deck.target));
  swipe = null;
};
stream.addEventListener('touchend', endSwipe);
stream.addEventListener('touchcancel', endSwipe);

// A card that isn't front and centre comes forward instead of opening.
stream.addEventListener('click', (e) => {
  const c = e.target.closest('.card');
  if (!c) return;
  if (dragged || +c.dataset.i !== deck.current) {
    e.preventDefault();
    if (!dragged) go(+c.dataset.i);
  }
  dragged = false;
});

addEventListener('resize', () => { measure(); layoutAll(); });
stageHint.textContent = matchMedia('(hover: hover)').matches ? 'Scroll or drag through the work' : 'Swipe through the work';

// Clock
const clock = document.querySelector('[data-clock]');
const tick = () => { clock.textContent = new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', timeZone: 'America/Vancouver' }); };
tick();
setInterval(tick, 10000);

measure();
route();
layoutAll();
