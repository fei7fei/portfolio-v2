// Breadboard: one fixed circuit, however many projects there are. A 9V battery's
// snap clip feeds the rails. A
// 3-way slide switch sends + to one of three section chips (U1 projects, U2
// experience, U3 about me), and the powered chip drives a 16×2 character LCD over
// a shared serial line. Each chip's TX goes onto that line through its own 1k
// resistor, so the powered chip can't drive current into the unpowered ones, and a
// 10k pull-up holds the line idle-high while the switch is between throws. The LCD
// shows the card in front: "01 TITLE" and its date.
// Drawn in "logical" board coordinates (landscape); at() transposes to portrait
// when the box is taller than wide. The LCD is drawn upright either way, so its
// text always reads left to right.

const Board = (() => {
  const svg = document.querySelector('[data-board]');
  const NS = 'http://www.w3.org/2000/svg';
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const P = 20;           // hole pitch
  const X0 = 30;          // first column
  const H = 420;          // board depth; the lower half mirrors the upper around H / 2
  const Y = { tn: 30, tp: 50, a: 100, b: 120, c: 140, d: 160, e: 180 };
  const N = 45;           // columns
  const W = X0 + (N - 1) * P + X0;
  const TOP = 190;        // room above the board for the battery
  const SW = 6;           // slide switch: common in column 6, one throw per chip in 7–9
  const RX = 30;          // the LCD's leads land in column 30; the module covers 31–40
  const CHIPS = [
    { key: 'projects', id: 'U1', label: 'PROJECTS', col: 12, c: '#f28c28' },
    { key: 'experience', id: 'U2', label: 'EXPERIENCE', col: 18, c: '#e0b100' },
    { key: 'bio', id: 'U3', label: 'ABOUT ME', col: 24, c: '#1f9a3c' },
  ];

  let vertical = false;
  let section = 'projects';
  let on = false;          // the supply is on
  let ready = false;       // booted: the LCD shows the card in front
  const api = { onPick: null };

  const cx = (col) => X0 + col * P;
  const flip = (y) => H - y;
  const at = (x, y) => (vertical ? [y, x] : [x, y]);

  const el = (tag, attrs, parent) => {
    const n = document.createElementNS(NS, tag);
    for (const k in attrs) n.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(n);
    return n;
  };

  // Axis-aligned rect in logical coords.
  const rect = (parent, x, y, w, h, attrs = {}) => {
    const [px, py] = at(x, y);
    return el('rect', { x: px, y: py, width: vertical ? h : w, height: vertical ? w : h, ...attrs }, parent);
  };

  const text = (parent, x, y, str, attrs = {}, turn = false) => {
    const [px, py] = at(x, y);
    const t = el('text', { x: px, y: py, ...attrs }, parent);
    if (turn && vertical) t.setAttribute('transform', `rotate(90 ${px} ${py})`);
    t.textContent = str;
    return t;
  };

  // A jumper between two screen points; `bend` bows it into a loose Dupont lead.
  function seg(parent, [ax, ay], [ex, ey], cls, bend = 0) {
    let d = `M${ax},${ay} L${ex},${ey}`;
    if (bend) {
      const len = Math.hypot(ex - ax, ey - ay) || 1;
      const qx = (ax + ex) / 2 - ((ey - ay) / len) * bend;
      const qy = (ay + ey) / 2 + ((ex - ax) / len) * bend;
      d = `M${ax},${ay} Q${qx},${qy} ${ex},${ey}`;
    }
    const g = el('g', { class: `wire ${cls}` }, parent);
    el('path', { d, class: 'wire__core' }, g);
    el('path', { d, class: 'wire__shine', transform: 'translate(-1.2 -1.2)' }, g);
    el('path', { d, class: 'wire__flow' }, g);
    el('circle', { cx: ax, cy: ay, r: 2.6, class: 'wire__tip' }, g);
    el('circle', { cx: ex, cy: ey, r: 2.6, class: 'wire__tip' }, g);
    return g;
  }

  // A jumper laid flat and straight between two holes.
  const wire = (parent, a, b, cls) => seg(parent, at(...a), at(...b), cls);

  // A through-hole resistor laid flat between two holes, read from the first lead.
  const BAND = { brown: '#6b3a1e', black: '#1a1a1a', red: '#c8102e', orange: '#ee7a1a', gold: '#c9a43a' };
  const OHMS = { '1k': ['brown', 'black', 'red', 'gold'], '10k': ['brown', 'black', 'orange', 'gold'] };
  function resistor(parent, a, b, value) {
    const [ax, ay] = at(...a);
    const [bx, by] = at(...b);
    const g = el('g', { class: 'res' }, parent);
    el('path', { d: `M${ax},${ay} L${bx},${by}`, class: 'res__lead' }, g);
    el('circle', { cx: ax, cy: ay, r: 2.2, class: 'wire__tip' }, g);
    el('circle', { cx: bx, cy: by, r: 2.2, class: 'wire__tip' }, g);
    const turn = (Math.atan2(by - ay, bx - ax) * 180) / Math.PI;
    const body = el('g', { transform: `translate(${(ax + bx) / 2} ${(ay + by) / 2}) rotate(${turn})` }, g);
    el('rect', { x: -14, y: -4.5, width: 28, height: 9, rx: 4.5, class: 'res__body' }, body);
    OHMS[value].forEach((c, i) => el('rect', { x: (i < 3 ? -9 + i * 4.5 : 6.5), y: -4.5, width: 2.4, height: 9, fill: BAND[c] }, body));
    el('rect', { x: -12, y: -3.4, width: 24, height: 1.4, rx: .7, class: 'res__shine' }, body);
    return g;
  }

  // ---------- Section chips ----------

  // Pins in columns s..s+3: VCC top left (fed by the switch), GND bottom left,
  // TX two along on the bottom, through a 1k in row i onto the shared line at s+5.
  function chip(c, k) {
    const s = c.col;
    const g = el('a', { href: `#${c.key}`, class: 'chip', 'data-key': c.key, 'aria-label': `${c.id}: ${c.label.toLowerCase()}` }, svg);

    // From throw k along a row of its own (c, b, a), so the three never share a hole
    const row = [Y.c, Y.b, Y.a][k];
    wire(g, [cx(SW + 1 + k), row], [cx(s), row], 'wire--vcc').style.setProperty('--c', c.c);
    wire(g, [cx(s), flip(Y.a)], [cx(s), flip(Y.tn)], 'wire--gnd');
    resistor(g, [cx(s + 2), flip(Y.b)], [cx(s + 5), flip(Y.b)], '1k');

    for (let p = 0; p < 4; p++) {
      rect(g, cx(s + p) - 3, Y.e - 3, 6, 10, { class: 'chip__pin' });
      rect(g, cx(s + p) - 3, flip(Y.e) - 7, 6, 10, { class: 'chip__pin' });
    }
    rect(g, cx(s) - 11, Y.e + 5, 3 * P + 22, flip(Y.e) - Y.e - 10, { class: 'chip__body', rx: 3 });
    const [nx, ny] = at(cx(s) - 11, H / 2);
    el('circle', { cx: nx, cy: ny, r: 5, class: 'chip__notch' }, g);
    const [mx, my] = at(cx(s) - 2, Y.e + 13);
    el('circle', { cx: mx, cy: my, r: 2.4, class: 'chip__mark' }, g);
    text(g, cx(s + 1.5), H / 2 - 3, c.label, { class: 'chip__label' }, true);
    text(g, cx(s + 1.5), H / 2 + 12, `${c.id} · MX-74${c.id.slice(1)}`, { class: 'chip__id' }, true);
  }

  // ---------- Slide switch ----------

  // Pins in row e: common in column SW, throws beside it. The positions are
  // labelled on a strip of masking tape on the lower half.
  function slide() {
    wire(svg, [cx(SW), Y.tp], [cx(SW), Y.a], 'wire--pwr is-supply');

    rect(svg, cx(SW + 0.5), flip(Y.e) - 16, 3 * P, 96, { class: 'tape', rx: 1.5 });
    CHIPS.forEach((c, k) => {
      const g = el('a', { href: `#${c.key}`, class: 'sw', 'data-key': c.key, 'aria-label': `Switch to ${c.label.toLowerCase()}` }, svg);
      rect(g, cx(SW + 1 + k) - 10, Y.d - 10, P, flip(Y.e) + 80 - Y.d + 10, { class: 'sw__hit' });
      text(g, cx(SW + 1 + k), flip(Y.e) - 9, c.label, { class: 'sw__lbl' });
    });

    const g = el('g', { class: 'sw__part', 'aria-hidden': 'true' }, svg);
    rect(g, cx(SW) - 11, Y.d - 2, 3 * P + 22, 36, { class: 'sw__body', rx: 2 });
    rect(g, cx(SW + 1) - 9, Y.d + 8, 2 * P + 18, 16, { class: 'sw__slot', rx: 2 });
    const knob = el('g', { class: 'sw__knob' }, g);
    rect(knob, cx(SW + 1) - 7, Y.d + 4, 14, 24, { class: 'sw__cap', rx: 2 });
    [-3, 0, 3].forEach((o) => rect(knob, cx(SW + 1) + o - 0.5, Y.d + 8, 1, 16, { class: 'sw__grip' }));
  }

  // ---------- 16×2 character LCD ----------

  // HD44780 ROM font, 0x20–0x5F: five columns per glyph, bit 0 the top row.
  const FONT = (
    '0000000000 00005F0000 0007000700 147F147F14 242A7F2A12 2313086462 3649552250 0005030000 ' +
    '001C224100 0041221C00 14083E0814 08083E0808 0050300000 0808080808 0060600000 2010080402 ' +
    '3E5149453E 00427F4000 4261514946 2141454B31 1814127F10 2745454539 3C4A494930 0171090503 ' +
    '3649494936 064949291E 0036360000 0056360000 0814224100 1414141414 0041221408 0201510906 ' +
    '324979413E 7E1111117E 7F49494936 3E41414122 7F4141221C 7F49494941 7F09090901 3E4149497A ' +
    '7F0808087F 00417F4100 2040413F01 7F08142241 7F40404040 7F020C027F 7F0408107F 3E4141413E ' +
    '7F09090906 3E4151215E 7F09192946 4649494931 01017F0101 3F4040403F 1F2040201F 3F4038403F ' +
    '6314081463 0708700807 6151494543 007F414100 0204081020 0041417F00 0402010204 4040404040'
  ).split(' ');
  const BLOCK = '\x7f';                        // all 5×8 dots: what an uninitialised display shows
  const glyph = (ch) => (ch === '·' ? '0000080000' : FONT[ch.charCodeAt(0) - 32] || FONT[0]);

  // Upper case, with the typography the ROM doesn't have folded down to ASCII.
  const lcdText = (str) => String(str ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[–—]/g, '-').replace(/[‘’]/g, "'").replace(/[“”]/g, '"')
    .toUpperCase().replace(/[^\x20-\x5f·]/g, '');

  const DP = 3.6;                              // dot pitch
  const DS = 3;                                // dot size
  const CW = 6 * DP;                           // character pitch: 5 dots and a gap
  const LH = 9 * DP;                           // line pitch: 8 dots and a gap
  let ink = null;                              // the lit dots
  let tx0 = 0;                                 // top left of the character grid
  let ty0 = 0;
  let shown = ['', ''];

  const dot = (x, y) => `M${x.toFixed(1)},${y.toFixed(1)}h${DS}v${DS}h-${DS}z`;

  function draw() {
    if (!ink) return;
    let d = '';
    shown.forEach((row, r) => {
      for (let i = 0; i < 16; i++) {
        const ch = row[i] || ' ';
        const x = tx0 + i * CW;
        const y = ty0 + r * LH;
        for (let c = 0; c < 5; c++) {
          const bits = ch === BLOCK ? 0xff : parseInt(glyph(ch).slice(c * 2, c * 2 + 2), 16);
          for (let k = 0; k < 8; k++) if ((bits >> k) & 1) d += dot(x + c * DP, y + k * DP);
        }
      }
    });
    ink.setAttribute('d', d);
  }

  const put = (rows) => { shown = rows; draw(); };

  function lcd() {
    const [mx, my] = at(cx(35.5), H / 2);
    const x0 = mx - 205;
    const y0 = my - 84;
    const g = el('g', { class: 'lcd', 'aria-hidden': 'true' }, svg);
    el('rect', { x: x0 + 4, y: y0 + 6, width: 410, height: 168, rx: 4, class: 'lcd__shadow' }, g);
    el('rect', { x: x0, y: y0, width: 410, height: 168, rx: 4, class: 'lcd__pcb' }, g);
    [[10, 10], [400, 10], [10, 158], [400, 158]].forEach(([x, y]) => el('circle', { cx: x0 + x, cy: y0 + y, r: 5.5, class: 'lcd__hole' }, g));

    // The 16-pin parallel header, unused: the serial backpack on the back drives it
    for (let i = 0; i < 16; i++) {
      el('circle', { cx: x0 + 34 + i * 13, cy: y0 + 12, r: 4, class: 'lcd__pad' }, g);
      el('circle', { cx: x0 + 34 + i * 13, cy: y0 + 12, r: 1.6, class: 'lcd__via' }, g);
    }
    el('text', { x: x0 + 34, y: y0 + 25, class: 'lcd__silk' }, g).textContent = '1';
    el('text', { x: x0 + 34 + 15 * 13, y: y0 + 25, class: 'lcd__silk' }, g).textContent = '16';

    // Bezel, glass, backlight
    const gx = x0 + 23;
    const gy = y0 + 44;
    el('rect', { x: x0 + 15, y: y0 + 34, width: 380, height: 108, rx: 3, class: 'lcd__bezel' }, g);
    el('rect', { x: gx, y: gy, width: 364, height: 88, class: 'lcd__glass' }, g);
    el('rect', { x: gx, y: gy, width: 364, height: 88, class: 'lcd__lit', fill: 'url(#lcd-lit)' }, g);

    tx0 = mx - (16 * CW - DP) / 2;
    ty0 = gy + 44 - (LH + 8 * DP) / 2;
    let ghost = '';
    for (let r = 0; r < 2; r++) {
      for (let i = 0; i < 16; i++) {
        for (let c = 0; c < 5; c++) for (let k = 0; k < 8; k++) ghost += dot(tx0 + i * CW + c * DP, ty0 + r * LH + k * DP);
      }
    }
    el('path', { d: ghost, class: 'lcd__ghost' }, g);
    ink = el('path', { class: 'lcd__ink' }, g);
    draw();

    // Serial backpack header, top right, and its three leads down to the board
    const pins = [x0 + 344, x0 + 357, x0 + 370];
    const py = y0 + 12;
    const to = [[RX, flip(Y.b)], [RX + 1, flip(Y.tp)], [RX + 1, flip(Y.tn)]];
    ['wire--tx', 'wire--pwr is-supply', 'wire--gnd is-supply'].forEach((cls, k) => {
      seg(svg, [pins[k], py], at(cx(to[k][0]), to[k][1]), cls, k === 0 ? -6 : 4);
      el('rect', { x: pins[k] - 4.5, y: py - 6, width: 9, height: 12, rx: 1, class: 'lcd__plug' }, svg);
    });
    ['RX', '5V', 'GND'].forEach((s, k) => {
      el('text', { x: pins[k], y: y0 + 26, class: 'lcd__silk lcd__silk--mid' }, g).textContent = s;
    });
  }

  // ---------- Supply: 9V battery → rails ----------

  // Black body with a copper end, standing on its side beside the board with the
  // snap clip on the terminals at the top. The clip's red and black leads land in
  // the top rails at column 1; the bridges at the far end carry them to the
  // bottom pair. The print runs along the battery's length.
  function supply() {
    const bx = -166, bw = 96, by = 46, bl = 176, cu = 66;   // body, copper end
    const mid = bx + bw / 2;
    seg(svg, at(mid - 12, by - 14), at(cx(1), Y.tp), 'wire--pwr is-supply', 10);
    seg(svg, at(mid + 12, by - 14), at(cx(1), Y.tn), 'wire--gnd is-supply', 10);
    const g = el('g', { class: 'battery' }, svg);
    rect(g, bx, by, bw, bl, { class: 'battery__body', rx: 7 });
    rect(g, bx, by, bw, cu, { class: 'battery__copper', rx: 7 });
    rect(g, bx, by + cu - 8, bw, 8, { class: 'battery__copper' });
    rect(g, bx, by + cu - 1.5, bw, 3, { class: 'battery__band' });
    rect(g, bx + 6, by + 5, 6, bl - 10, { class: 'battery__shine', rx: 3 });
    rect(g, mid - 28, by - 18, 56, 22, { class: 'battery__clip', rx: 3 });
    const along = (t) => {
      if (!vertical) t.setAttribute('transform', `rotate(-90 ${t.getAttribute('x')} ${t.getAttribute('y')})`);
    };
    along(text(g, mid, by + cu + (bl - cu) / 2, '9V', { class: 'battery__volt' }));
    along(text(g, mid, by + cu / 2, 'ALKALINE', { class: 'battery__txt' }));
  }

  // ---------- Board ----------

  function render() {
    const box = svg.getBoundingClientRect();
    vertical = box.height > box.width * 1.05;
    svg.textContent = '';
    // Portrait aspect, so the box can size itself to the board
    svg.parentElement.style.setProperty('--board-aspect', ((H + 48) / (W + TOP + 24)).toFixed(4));
    svg.setAttribute('viewBox', vertical
      ? `-24 ${-TOP} ${H + 48} ${W + TOP + 24}`
      : `${-TOP} -24 ${W + TOP + 24} ${H + 48}`);

    // Board body, trench, rail stripes
    rect(svg, 4, 6, W, H, { class: 'board__edge', rx: 12 });
    rect(svg, 0, 0, W, H, { class: 'board__body', rx: 12 });
    rect(svg, 10, H / 2 - 7, W - 20, 14, { class: 'board__trench', rx: 2 });
    const stripe = (y, cls) => {
      const [ax, ay] = at(cx(1) - 8, y);
      const [bx, by] = at(cx(N - 2) + 8, y);
      el('path', { d: `M${ax},${ay} L${bx},${by}`, class: `board__rail ${cls}` }, svg);
    };
    stripe(Y.tn - 11, 'board__rail--n');
    stripe(Y.tp + 11, 'board__rail--p');
    stripe(flip(Y.tp + 11), 'board__rail--p');
    stripe(flip(Y.tn - 11), 'board__rail--n');

    // Holes, as one path
    const rows = ['a', 'b', 'c', 'd', 'e'].map((r) => Y[r]);
    let d = '';
    const hole = (col, y) => {
      const [x, yy] = at(cx(col), y);
      d += `M${x - 2.4},${yy - 2.4}h4.8v4.8h-4.8z`;
    };
    for (let c = 0; c < N; c++) {
      rows.forEach((y) => { hole(c, y); hole(c, flip(y)); });
      if (c > 0 && c < N - 1 && c % 6 !== 5) [Y.tn, Y.tp, flip(Y.tn), flip(Y.tp)].forEach((y) => hole(c, y));
    }
    el('path', { d, class: 'board__holes' }, svg);

    // Row letters, column numbers (trench side, clear of the jumpers), rail signs
    const lbl = { class: 'board__lbl' };
    'abcde'.split('').forEach((r, k) => {
      text(svg, cx(-0.8), rows[k], r, lbl);
      text(svg, cx(N - 0.2), rows[k], r, lbl);
      text(svg, cx(-0.8), flip(rows[4 - k]), 'fghij'[k], lbl);
      text(svg, cx(N - 0.2), flip(rows[4 - k]), 'fghij'[k], lbl);
    });
    for (let c = 0; c < N; c++) {
      if (c !== 0 && (c + 1) % 5) continue;
      text(svg, cx(c), Y.e + 13, c + 1, lbl);
      text(svg, cx(c), flip(Y.e + 13), c + 1, lbl);
    }
    [[Y.tn, '−'], [Y.tp, '+'], [flip(Y.tp), '+'], [flip(Y.tn), '−']].forEach(([y, s]) => {
      text(svg, cx(-0.6), y, s, { class: 'board__sign' });
      text(svg, cx(N - 0.4), y, s, { class: 'board__sign' });
    });

    // Rail bridges at the far end
    wire(svg, [cx(N - 3), Y.tp], [cx(N - 3), flip(Y.tp)], 'wire--pwr is-supply');
    wire(svg, [cx(N - 2), Y.tn], [cx(N - 2), flip(Y.tn)], 'wire--gnd is-supply');

    CHIPS.forEach(chip);

    // The chips' resistors share one line to the LCD, in rows g and h by turns so
    // neighbouring jumpers never meet in the same hole. The pull-up ties it to + in
    // the LCD's column.
    const tx = el('g', { class: 'tx' }, svg);
    const taps = [...CHIPS.map((c) => c.col + 5), RX];
    for (let k = 0; k < taps.length - 1; k++) {
      const row = flip(k % 2 ? Y.c : Y.d);
      wire(tx, [cx(taps[k]), row], [cx(taps[k + 1]), row], 'wire--tx');
    }
    resistor(tx, [cx(RX), flip(Y.a)], [cx(RX), flip(Y.tp)], '10k');

    slide();
    lcd();
    supply();
    paint();
  }

  function paint() {
    svg.querySelectorAll('[data-key]').forEach((n) => n.classList.toggle('is-live', n.dataset.key === section));
    const k = Math.max(0, CHIPS.findIndex((c) => c.key === section));
    const knob = svg.querySelector('.sw__knob');
    if (knob) knob.style.transform = vertical ? `translateY(${k * P}px)` : `translateX(${k * P}px)`;
  }

  // ---------- What the LCD says ----------

  let msg = { top: '', bottom: '' };
  let run = 0;
  let scroller = 0;
  let pulse = 0;

  const wait = (ms, id) => new Promise((resolve, reject) =>
    setTimeout(() => (id === run ? resolve() : reject()), ms));
  const centre = (s) => s.padStart(Math.floor((16 + s.length) / 2)).padEnd(16);

  // Line 1 is "01 TITLE"; a title too long for its cells scrolls through, pausing at each end.
  function update() {
    clearTimeout(scroller);
    const tag = msg.tag ? `${msg.tag} ` : '';
    const top = lcdText(msg.top);
    const bottom = lcdText(msg.bottom);
    const room = 16 - tag.length;
    const frame = (o) => put([tag + top.slice(o, o + room), bottom]);
    frame(0);

    // A burst of data along the TX line
    svg.classList.add('is-tx');
    clearTimeout(pulse);
    pulse = setTimeout(() => svg.classList.remove('is-tx'), 600);

    if (top.length <= room || reduced) return;
    const end = top.length - room;
    let o = 0;
    const step = () => {
      o = o >= end ? 0 : o + 1;
      frame(o);
      scroller = setTimeout(step, o === 0 ? 1800 : o === end ? 1400 : 280);
    };
    scroller = setTimeout(step, 1800);
  }

  const syncPower = () => svg.classList.toggle('is-on', on);

  // Power on: a row of blocks until the controller sets the display up, a
  // greeting, then the card in front.
  async function powerUp() {
    const id = ++run;
    clearTimeout(scroller);
    on = true;
    ready = false;
    syncPower();
    if (reduced) { ready = true; update(); return; }
    try {
      put([BLOCK.repeat(16), '']);
      await wait(900, id);
      put(['', '']);
      await wait(250, id);
      const a = centre('MICHAEL XIE');
      const b = centre('PORTFOLIO V2');
      for (let i = 1; i <= 16; i++) { put([a.slice(0, i), '']); await wait(28, id); }
      for (let i = 1; i <= 16; i++) { put([a, b.slice(0, i)]); await wait(28, id); }
      await wait(1100, id);
      ready = true;
      update();
    } catch {
      // restarted
    }
  }

  const keyOf = (t) => t.closest && t.closest('[data-key]')?.dataset.key;
  svg.addEventListener('click', (e) => {
    const k = keyOf(e.target);
    if (!k || !api.onPick) return;
    if (api.onPick(k) !== false) e.preventDefault();
  });

  // The LCD backlight, shared by every render
  document.body.insertAdjacentHTML('beforeend', `
    <svg width="0" height="0" style="position:absolute" aria-hidden="true"><defs>
      <linearGradient id="lcd-lit" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#c3dc5c"/><stop offset=".55" stop-color="#a9c840"/><stop offset="1" stop-color="#97b832"/>
      </linearGradient></defs></svg>`);

  let wasVertical = null;
  new ResizeObserver(() => {
    const r = svg.getBoundingClientRect();
    const v = r.height > r.width * 1.05;
    if (v !== wasVertical) { wasVertical = v; render(); syncPower(); }
  }).observe(svg);

  // key: the section whose chip gets power. text: { tag, top, bottom } for the LCD.
  api.set = (key, text) => {
    section = key;
    paint();
    if (!text) return;
    msg = text;
    if (ready) update();
  };
  // Power comes on once the site is revealed
  api.boot = powerUp;
  return api;
})();
