// Intro: dark room → bulb flickers → switches on → light floods the room →
// bulb rises away while the name flies in from the distance → the landing drops
// away onto the breadboard. Plays once per session; Replay brings it back.

const FLICKER = [ // [glow, ms]
  [0.35, 60], [0, 140], [0.85, 40], [0, 520],
  [0.2, 50], [0.6, 40], [0, 90], [1, 70], [0, 280],
  [0.4, 30], [0, 50], [0.9, 60], [0.15, 50], [0.75, 40], [0, 380],
];
const SEEN = 'mx-intro-seen';

const root = document.documentElement;
const body = document.body;
const flood = document.querySelector('.flood');
const rig = document.querySelector('.rig');
const glass = document.getElementById('glass');
const zoom = document.querySelector('.hero__zoom');
const hero = document.querySelector('.hero');
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

let run = 0;
let anims = [];

const setGlow = (v) => root.style.setProperty('--glow', v);
const track = (a) => (anims.push(a), a);
const clearAnims = () => { anims.forEach((a) => a.cancel()); anims = []; };
const seen = () => { try { return sessionStorage.getItem(SEEN) === '1'; } catch { return false; } };
const remember = () => { try { sessionStorage.setItem(SEEN, '1'); } catch { /* storage blocked */ } };

// Resolves after ms, rejects if the run was superseded (skip / replay).
const wait = (ms, id) => new Promise((resolve, reject) =>
  setTimeout(() => (id === run ? resolve() : reject()), ms));

async function play() {
  const id = ++run;
  clearAnims();
  root.classList.remove('skip-intro');
  body.classList.remove('is-ready', 'is-work');
  body.classList.add('is-intro');
  setGlow(0);

  try {
    await wait(1000, id);
    for (const [g, ms] of FLICKER) {
      setGlow(g);
      await wait(ms, id);
    }

    // On.
    setGlow(1);
    const r = glass.getBoundingClientRect();
    const cx = r.left + r.width / 2;
    const cy = r.top + r.height / 2;
    const reach = Math.hypot(Math.max(cx, innerWidth - cx), Math.max(cy, innerHeight - cy));
    flood.style.left = `${cx}px`;
    flood.style.top = `${cy}px`;
    track(flood.animate(
      [{ transform: 'translate(-50%, -50%) scale(0)' },
       { transform: `translate(-50%, -50%) scale(${(reach / 5.8) * 1.1})` }],
      { duration: 1100, easing: 'cubic-bezier(.2, .7, .2, 1)', fill: 'forwards' },
    ));

    await wait(500, id);

    track(rig.animate(
      [{ transform: 'translateY(0)' },
       { transform: `translateY(${-(r.bottom + 80)}px)` }],
      { duration: 1600, easing: 'cubic-bezier(.6, 0, .25, 1)', fill: 'forwards' },
    ));

    await wait(150, id);

    const fly = track(zoom.animate(
      [{ opacity: 0, transform: 'perspective(800px) translate3d(0, 0, -16000px)' },
       { opacity: 1, offset: 0.1 },
       { opacity: 1, transform: 'perspective(800px) translate3d(0, 0, 0)' }],
      { duration: 2600, easing: 'cubic-bezier(.3, .6, .2, 1)', fill: 'forwards' },
    ));

    await fly.finished;
    if (id === run) finish();
  } catch {
    // superseded
  }
}

function finish(instant = false) {
  run++;
  remember();
  setGlow(1);
  body.classList.add('is-ready');
  body.classList.remove('is-intro');
  clearAnims();
  drop(run, instant);
}

function reveal() {
  body.classList.add('is-work');
  Board.boot();
}

// Hold on the name, then the landing drops away to reveal the board.
async function drop(id, instant) {
  if (reduced || instant) return reveal();
  try {
    await wait(2000, id);
    const fall = track(hero.animate(
      [{ transform: 'translateY(0)' }, { transform: 'translateY(100%)' }],
      { duration: 1100, easing: 'cubic-bezier(.7, 0, .25, 1)', fill: 'forwards' },
    ));
    await fall.finished;
    if (id === run) reveal();
  } catch {
    // superseded
  }
}

document.querySelector('.replay').addEventListener('click', play);
addEventListener('keydown', (e) => {
  if (body.classList.contains('is-intro') && ['Escape', 'Enter', ' '].includes(e.key)) finish();
});
// No keyboard on a phone: a tap skips it too, without also clicking whatever
// the board has under that spot
const swallow = (e) => { e.preventDefault(); e.stopPropagation(); };
addEventListener('pointerdown', () => {
  if (!body.classList.contains('is-intro')) return;
  finish();
  addEventListener('click', swallow, { capture: true, once: true });
  setTimeout(() => removeEventListener('click', swallow, { capture: true }), 600);
});

// ?nointro skips straight to the board (handy while developing)
if (reduced || seen() || new URLSearchParams(location.search).has('nointro')) finish(true);
else play();
