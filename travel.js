// Travel: the globe doodle beside the About Me portrait opens a dot-matrix globe
// of everywhere I've been. Same card-over-the-page pattern as Contact; the 3D
// globe only loads the first time it opens.

// To add a place, copy a line and change the values. Find latitude and longitude by
// right-clicking the spot in Google Maps; the first number is lat, the second is lng.
//   type: "home" = somewhere I lived, studied or worked; "trip" = a vacation or visit
//   side: optional, "left" puts the label on the left of the dot
//   photo / note: optional, shown in the card when the pin is clicked
// When labels overlap, places higher in this list win and the rest appear as you zoom in.
const PLACES = [
  // Lived, studied, or worked
  { name: 'Vancouver', country: 'Canada', lat: 49.2827, lng: -123.1207, type: 'home', side: 'left' },
  { name: 'Kelowna', country: 'Canada', lat: 49.888, lng: -119.496, type: 'home' },
  { name: 'Suzhou', country: 'China', lat: 31.2989, lng: 120.5853, type: 'home' },
  { name: 'Washington, DC', country: 'United States', lat: 38.9072, lng: -77.0369, type: 'home' },

  // Trips
  { name: 'Victoria', country: 'Canada', lat: 48.4284, lng: -123.3656, type: 'trip', side: 'left' },
  { name: 'Calgary', country: 'Canada', lat: 51.0447, lng: -114.0719, type: 'trip' },
  { name: 'Toronto', country: 'Canada', lat: 43.6532, lng: -79.3832, type: 'trip' },
  { name: 'Montreal', country: 'Canada', lat: 45.5019, lng: -73.5674, type: 'trip' },
  { name: 'Quebec City', country: 'Canada', lat: 46.8139, lng: -71.208, type: 'trip' },
  { name: 'Banff', country: 'Canada', lat: 51.1784, lng: -115.5708, type: 'trip', side: 'left' },
  { name: 'Yellowstone', country: 'United States', lat: 44.428, lng: -110.5885, type: 'trip' },
  { name: 'Seattle', country: 'United States', lat: 47.6062, lng: -122.3321, type: 'trip' },
  { name: 'Portland', country: 'United States', lat: 45.5152, lng: -122.6784, type: 'trip', side: 'left' },
  { name: 'Los Angeles', country: 'United States', lat: 34.0522, lng: -118.2437, type: 'trip' },
  { name: 'Alaska', country: 'United States', lat: 61.2181, lng: -149.9003, type: 'trip' },
  { name: 'Tokyo', country: 'Japan', lat: 35.6762, lng: 139.6503, type: 'trip' },
  { name: 'Seoul', country: 'South Korea', lat: 37.5665, lng: 126.978, type: 'trip' },
  { name: 'Taipei', country: 'Taiwan', lat: 25.033, lng: 121.5654, type: 'trip' },
  { name: 'Shanghai', country: 'China', lat: 31.2304, lng: 121.4737, type: 'trip' },
  { name: 'Beijing', country: 'China', lat: 39.9042, lng: 116.4074, type: 'trip' },
  { name: 'Xi’an', country: 'China', lat: 34.3416, lng: 108.9398, type: 'trip', side: 'left' },
  { name: 'Chengdu', country: 'China', lat: 30.5728, lng: 104.0668, type: 'trip', side: 'left' },
  { name: 'Chongqing', country: 'China', lat: 29.563, lng: 106.5516, type: 'trip' },
  { name: 'Guangzhou', country: 'China', lat: 23.1291, lng: 113.2644, type: 'trip', side: 'left' },
  { name: 'Shanxi', country: 'China', lat: 37.8706, lng: 112.5489, type: 'trip', side: 'left' },
  { name: 'Hong Kong', country: 'Hong Kong', lat: 22.3193, lng: 114.1694, type: 'trip' },
  { name: 'Macau', country: 'Macau', lat: 22.1987, lng: 113.5439, type: 'trip', side: 'left' },
];

const GLOBE_JS = 'https://cdn.jsdelivr.net/npm/globe.gl@2.46.2/dist/globe.gl.min.js';
const TOPO_JS = 'https://cdn.jsdelivr.net/npm/topojson-client@3.1.0/dist/topojson-client.min.js';
const WORLD = 'https://cdn.jsdelivr.net/npm/world-atlas@2.0.2/countries-110m.json';
// world-atlas uses a few long-form country names
const ATLAS_NAMES = { 'United States': 'United States of America' };
const RED = '215, 25, 33';

const placeCountries = [...new Set(PLACES.map((p) => p.country))];
const homes = PLACES.filter((p) => p.type === 'home');
const twoDigits = (n) => String(n).padStart(2, '0');

const travel = document.createElement('dialog');
travel.className = 'travel';
travel.setAttribute('aria-labelledby', 'travel-title');
travel.innerHTML = `<div class="travel__stack">
  <div class="travel__card" tabindex="-1" autofocus>
    <p class="travel__k">Travel<span>Road trips, RV trips, vacations</span></p>
    <h2 class="travel__title" id="travel-title">Places I&rsquo;ve been<i class="dot"></i></h2>
    <dl class="travel__stats">
      <div><dt>Places</dt><dd>${twoDigits(PLACES.length)}</dd></div>
      <div><dt>Countries &amp; regions</dt><dd>${twoDigits(placeCountries.length)}</dd></div>
      <div><dt>Called home</dt><dd>${twoDigits(homes.length)}</dd></div>
    </dl>
    <div class="travel__globe">
      <div class="globe" dir="ltr" aria-hidden="true"></div>
      <p class="travel__note" data-globe-note>Loading globe&hellip;</p>
      <div class="globe-zoom">
        <button type="button" data-zoom="in" aria-label="Zoom in">+</button>
        <button type="button" data-zoom="out" aria-label="Zoom out">&minus;</button>
      </div>
      <div class="place-card" hidden>
        <img alt="" hidden>
        <p class="place-card__name"></p>
        <p class="place-card__meta"></p>
        <p class="place-card__note" hidden></p>
        <button type="button" class="place-card__close" aria-label="Close place">&times;</button>
      </div>
    </div>
    <button class="travel__close" type="button" data-close>Close <span aria-hidden="true">&times;</span></button>
  </div>
  <aside class="travel__log" aria-label="All places">
    <h3 class="travel__log-title">Log</h3>
    <ul class="travel__legend">
      <li class="place place--home">Lived, studied or worked</li>
      <li class="place place--trip">Visited</li>
    </ul>
    <ul class="place-list"></ul>
  </aside>
</div>`;
document.body.append(travel);

// The doodle's caption reads from the list, so it stays right as places are added.
const cap = document.querySelector('.doodle--travel .doodle__cap');
if (cap) cap.textContent = `${PLACES.length} places · ${placeCountries.length} countries`;

const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)');
const mount = travel.querySelector('.globe');
const note = travel.querySelector('[data-globe-note]');
const card = travel.querySelector('.place-card');
const list = travel.querySelector('.place-list');
let focusPlace = null; // set once the globe is ready
let globe = null;
let started = false;

// ---------- Place list (works without WebGL) ----------
list.innerHTML = placeCountries.map((country) => `<li>
  <p class="place-list__country">${country}</p>
  <ul>${PLACES.map((p, i) => p.country !== country ? '' : `<li class="place place--${p.type === 'home' ? 'home' : 'trip'}"><button type="button" data-place="${i}">${p.name}</button></li>`).join('')}</ul>
</li>`).join('');
list.addEventListener('click', (e) => {
  const b = e.target.closest('[data-place]');
  if (!b) return;
  const p = PLACES[+b.dataset.place];
  if (focusPlace) focusPlace(p);
  else showCard(p);
  // Phones: the list sits under the globe, so bring the globe back into view
  if (matchMedia('(max-width: 980px)').matches) mount.scrollIntoView({ behavior: reduceMotion.matches ? 'auto' : 'smooth', block: 'center' });
});

// ---------- Place card (photo, name, note) ----------
function showCard(p) {
  const img = card.querySelector('img');
  if (p.photo) {
    img.src = p.photo;
    img.alt = p.name;
  } else img.removeAttribute('src');
  img.hidden = !p.photo;
  card.querySelector('.place-card__name').textContent = p.name;
  card.querySelector('.place-card__meta').textContent = `${p.country} · ${p.type === 'home' ? 'Lived, studied or worked' : 'Visited'}`;
  const line = card.querySelector('.place-card__note');
  line.textContent = p.note || '';
  line.hidden = !p.note;
  list.querySelectorAll('[data-place]').forEach((b) => b.classList.toggle('is-on', PLACES[+b.dataset.place] === p));
  card.hidden = false;
  requestAnimationFrame(() => card.classList.add('is-open'));
}
function hideCard() {
  if (card.hidden) return;
  card.classList.remove('is-open');
  list.querySelectorAll('.is-on').forEach((b) => b.classList.remove('is-on'));
  setTimeout(() => { card.hidden = true; }, 200);
}
card.querySelector('.place-card__close').addEventListener('click', hideCard);

// ---------- Globe ----------
const loadScript = (src) => new Promise((resolve, reject) => {
  const s = document.createElement('script');
  s.src = src;
  s.onload = resolve;
  s.onerror = reject;
  document.head.append(s);
});

function labelElement(place) {
  const el = document.createElement('div');
  el.dataset.rank = PLACES.indexOf(place);
  el.className = `globe-label${place.side === 'left' ? ' globe-label--left' : ''}${place.type === 'home' ? ' globe-label--home' : ''}`;
  const text = document.createElement('span');
  text.textContent = place.name;
  el.append(text);
  return el;
}

// Hide labels that overlap a more important one; they reappear as you zoom in
function declutter() {
  const taken = [];
  [...mount.querySelectorAll('.globe-label')]
    .sort((a, b) => a.dataset.rank - b.dataset.rank)
    .forEach((el) => {
      if (el.classList.contains('is-back')) return;
      const r = el.firstChild.getBoundingClientRect();
      const hit = taken.some((t) => r.left < t.right + 4 && r.right > t.left - 4 && r.top < t.bottom + 2 && r.bottom > t.top - 2);
      el.classList.toggle('is-crowded', hit);
      if (!hit) taken.push(r);
    });
}
let declutterTimer = 0;

async function init() {
  await Promise.all([loadScript(GLOBE_JS), loadScript(TOPO_JS)]);
  const world = await fetch(WORLD).then((r) => r.json());
  // Drop sliver polygons (fewer than 3 distinct points); the map data has one in
  // North Korea and the hex-dot renderer throws on it.
  const solid = (ring) => new Set(ring.map((pt) => pt.join())).size >= 3;
  const shapes = window.topojson.feature(world, world.objects.countries).features.map((f) =>
    f.geometry.type === 'MultiPolygon'
      ? { ...f, geometry: { ...f.geometry, coordinates: f.geometry.coordinates.filter((poly) => solid(poly[0])) } }
      : f
  );
  const visited = new Set(placeCountries.map((c) => ATLAS_NAMES[c] || c));

  const home = homes[0] || PLACES[0];
  // Arcs connect the places I lived or worked; trips are pins only, to keep the globe readable
  const arcs = homes.filter((p) => p !== home).map((p) => ({ startLat: home.lat, startLng: home.lng, endLat: p.lat, endLng: p.lng }));

  const still = reduceMotion.matches;
  globe = window.Globe({ animateIn: !still })(mount)
    .backgroundColor('rgba(0,0,0,0)')
    .showAtmosphere(true)
    .atmosphereColor('#f2f2f2')
    .atmosphereAltitude(0.12)
    // Continents as a dot matrix, like the site's Doto type; countries I've been to light up red
    .hexPolygonsData(shapes)
    .hexPolygonResolution(3)
    .hexPolygonMargin(0.4)
    .hexPolygonUseDots(true)
    .hexPolygonColor((f) => (visited.has(f.properties.name) ? `rgba(${RED},0.95)` : 'rgba(242,242,242,0.2)'))
    // Pins, pulsing rings on the places I've lived, and arcs from home
    .pointsData(PLACES)
    .pointLat('lat')
    .pointLng('lng')
    .pointColor((p) => (p.type === 'home' ? `rgb(${RED})` : '#f2f2f2'))
    .pointAltitude(0.012)
    .pointRadius((p) => (p.type === 'home' ? 0.45 : 0.3))
    .pointLabel((p) => p.name)
    .pointsMerge(false)
    .ringsData(still ? [] : homes)
    .ringLat('lat')
    .ringLng('lng')
    .ringColor(() => (t) => `rgba(${RED},${0.85 * (1 - t)})`)
    .ringMaxRadius(3)
    .ringPropagationSpeed(1.6)
    .ringRepeatPeriod(1800)
    .arcsData(arcs)
    .arcColor(() => ['rgba(242,242,242,0.2)', `rgba(${RED},0.95)`])
    .arcStroke(0.35)
    .arcDashLength(0.45)
    .arcDashGap(0.25)
    .arcDashAnimateTime(still ? 0 : 2800)
    // Labels as real HTML so they stay crisp and match the site's type
    .htmlElementsData(PLACES)
    .htmlLat('lat')
    .htmlLng('lng')
    .htmlAltitude(0.015)
    .htmlElement(labelElement);

  if (typeof globe.htmlElementVisibilityModifier === 'function') {
    globe.htmlElementVisibilityModifier((el, isVisible) => el.classList.toggle('is-back', !isVisible));
  }

  const material = globe.globeMaterial();
  material.color.set('#1d1d1d');
  if (material.emissive) material.emissive.set('#0a0a0a');
  material.shininess = 4;

  const controls = globe.controls();
  controls.enableZoom = false; // the dialog scrolls on small screens; zoom is on the buttons
  controls.autoRotate = !still;
  controls.autoRotateSpeed = 0.45;
  mount.addEventListener('pointerdown', () => { controls.autoRotate = false; }, { once: true });

  // Start over East Asia, where most places are; the slow spin brings North America around
  let altitude = 2.1;
  globe.pointOfView({ lat: 30, lng: 125, altitude }, 0);

  const zoom = (factor) => {
    altitude = Math.min(2.8, Math.max(0.7, altitude * factor));
    controls.autoRotate = false;
    globe.pointOfView({ altitude }, 600);
  };
  travel.querySelector('[data-zoom="in"]').addEventListener('click', () => zoom(0.6));
  travel.querySelector('[data-zoom="out"]').addEventListener('click', () => zoom(1 / 0.6));

  // Click a pin (or a name in the log) to fly there and open its card
  focusPlace = (p) => {
    controls.autoRotate = false;
    altitude = Math.min(altitude, 1.3);
    globe.pointOfView({ lat: p.lat, lng: p.lng, altitude }, still ? 0 : 1000);
    showCard(p);
  };
  globe.onPointClick((p) => focusPlace(p));

  const fit = () => globe.width(mount.clientWidth).height(mount.clientHeight);
  new ResizeObserver(fit).observe(mount);
  fit();

  if (travel.open) resume();
  else globe.pauseAnimation();
  mount.classList.add('is-ready');
  note.textContent = 'Drag to spin';
}

// Only render while the dialog is open
function resume() {
  if (!globe) return;
  globe.resumeAnimation();
  if (!declutterTimer) declutterTimer = setInterval(declutter, 200);
}
function pause() {
  clearInterval(declutterTimer);
  declutterTimer = 0;
  globe?.pauseAnimation();
}

function openTravel(e) {
  e?.preventDefault();
  if (travel.open) return;
  travel.classList.remove('is-closing');
  travel.showModal();
  if (!started) {
    started = true;
    init().catch(() => {
      mount.classList.add('is-failed');
      note.textContent = 'The globe couldn’t load. The full list is in the log.';
    });
  } else resume();
}

// Let the cards fall away before the dialog actually closes.
function closeTravel() {
  if (!travel.open || travel.classList.contains('is-closing')) return;
  const done = () => {
    travel.classList.remove('is-closing');
    travel.close();
    pause();
    hideCard();
  };
  if (reduceMotion.matches) return done();
  travel.classList.add('is-closing');
  travel.querySelector('.travel__card').addEventListener('animationend', done, { once: true });
}

document.addEventListener('click', (e) => {
  if (e.target.closest('[data-travel]')) openTravel(e);
});
travel.addEventListener('cancel', (e) => {
  e.preventDefault();
  // Escape closes the place card first, then the globe
  if (!card.hidden) hideCard();
  else closeTravel();
});
travel.addEventListener('click', (e) => {
  // Anything outside the two cards is the backdrop.
  if (!e.target.closest('.travel__card, .travel__log') || e.target.closest('[data-close]')) closeTravel();
});
