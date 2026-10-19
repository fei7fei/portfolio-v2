// Projects, newest first, in two sections you click between on the Projects tab:
// 'Engineering' (research, client and course work) and 'Side builds' (made for fun).
// The breadboard's LCD shows the project in front: its number and title, then its year.
//   section:  'Side builds' for side projects; everything else is 'Engineering'.
//   slug:     used in the URL — project.html?p=<slug>
//   short:    one-line description shown while scrolling the cards.
//   blurb:    lede on the project page.
//   body:     paragraphs for the project page.
//   year, role, category: optional facts on the project page (left out when missing).
//   tags:     tools and tech, shown as "Stack".
//   links:    [label, url] pairs, shown on the project page.
//   stats:    optional [value, label] pairs, shown under the lede.
//   extra:    optional [label, value] facts for the project page.
//   image:    optional cover image (4:3 crops best). fit: 'contain' letterboxes it on `bg`.
//   color:    optional wire / LED colour; omit to take the next jumper colour.
const YT = (id) => `https://youtu.be/${id}`;
const GH = (repo) => `https://github.com/fei7fei/${repo}`;

const PROJECTS = [
  {
    slug: 'codling-moth-counter',
    title: 'Codling Moth Exuvia Counter',
    short: 'A machine-vision system that counts moth casings for an industry client.',
    category: 'Machine Vision — Client Capstone',
    role: 'Capstone, team of 5',
    year: '2025–26',
    image: 'images/exuvia-capstone.webp', fit: 'contain', bg: '#000',
    tags: ['Python', 'YOLOv8', 'Raspberry Pi', 'Streamlit'],
    links: [['Watch the video', YT('ZW0dnDYto4E')], ['Source code', GH('Exuvia-Counting')]],
    blurb: 'An automated exuvia counting system delivered to the Okanagan Kootenay Sterile Insect Release Program.',
    body: [
      'The client was the Okanagan Kootenay Sterile Insect Release Program (OKSIR). As a five-person UBC capstone team, we delivered a system that counts codling moth exuviae on a tray automatically.',
      'The hardware is an enclosed imaging box with controlled white and UV LED lighting, a Raspberry Pi and a 12MP HQ camera. A Streamlit web interface runs the whole process in three clicks, with about two minutes of processing per tray.',
      'Detection runs on a YOLOv8 model trained on more than 15,000 labelled images, using both supervised and semi-supervised learning. It reached roughly 92% mAP@50.',
      'The system met every client target: 9% detection error, 3% repeatability variance and over 95% uptime. We presented the results at the UBC Okanagan capstone presentation and ran an on-site demo at the Osoyoos facility.',
    ],
  },
  {
    slug: 'chest-xray-research',
    title: 'Chest X-Ray AI Research',
    short: 'Why a chest X-ray model with 86% accuracy still misses most disease.',
    category: 'Research — Medical Imaging AI',
    role: 'Author, with Yi-An Su',
    year: 2026,
    tags: ['PyTorch', 'Swin Transformer', 'Medical Imaging', 'Calibration'],
    links: [['Read the abstract (PDF)', 'papers/xie-su-spie-abstract.pdf']],
    extra: [['Status', 'Submitted to SPIE Medical Imaging 2027. Decision expected January 2027.']],
    blurb: 'Chest X-ray AI models are usually judged by accuracy, a number that can hide dangerously low disease detection.',
    stats: [
      ['86%', 'Accuracy that hid the problem'],
      ['~3 in 10', 'True disease cases caught at the standard threshold'],
      ['0.73–0.84', 'Sensitivity after threshold tuning, no retraining'],
    ],
    body: [
      '“Does Medical Pretraining Change What a Chest-Radiograph Classifier Needs? A Frozen-Protocol Comparison on CheXpert.” Pei Lin (Michael) Xie and Yi-An Su, University of British Columbia.',
      'Evaluating the medical foundation model Ark+ on CheXpert, we found that a model reaching 86% accuracy caught only about 3 in 10 true disease cases at the standard threshold.',
      'Validation-tuned threshold selection raised sensitivity to 0.73–0.84 with no retraining. A targeted class-weighted loss improved detection of Atelectasis and Consolidation.',
      'Now, in October 2026: comparing five more model architectures under the same frozen protocol.',
    ],
  },
  {
    slug: '32-bit-processor',
    title: '32-Bit Microprocessor',
    short: 'A multi-cycle 32-bit processor in Verilog for a 15-instruction ISA.',
    category: 'Digital Logic — Computer Architecture',
    role: 'Design, Verification · with a partner',
    year: 2026,
    image: 'images/cpu-architecture.webp', fit: 'contain', bg: '#fff',
    tags: ['Verilog', 'ModelSim', 'Quartus', 'Computer Architecture'],
    blurb: 'A fully synchronous, multi-cycle Von Neumann 32-bit processor for a 15-instruction RISC architecture.',
    body: [
      'Built with a partner in Verilog. Every module was engineered for standalone testability, so each block could be verified on its own.',
      'The ALU includes a 32-bit adder, subtractor and multiplier, with custom carry-out and overflow logic driving the NZCV flags. It supports conditional execution, and parameterized shift and rotate registers (LSL, LSR, ROR) handle data manipulation on the source operands.',
      'RAM with memory control completes the processor. A two-cycle fetch/execute state machine fixed a deadlock on loads and stores.',
      'Behavioural testbenches in ModelSim verified timing and edge cases, and confirmed the processor running a compiled if/else program.',
    ],
  },
  {
    slug: 'brushless-dc-motor',
    title: 'Brushless DC Motor',
    short: 'A brushless motor built from scratch, run by an Arduino.',
    category: 'Electromechanical — Motor Build',
    role: 'Assistant Captain',
    year: 2025,
    image: 'images/bldc-motor.webp',
    tags: ['Arduino', 'SolidWorks', '3D Printing', 'Motors'],
    links: [['Watch the demo', YT('A7I5nu9C7j0')]],
    blurb: 'A brushless DC motor built from scratch, with direction control and a direction indicator.',
    body: [
      'A brushless DC motor built from scratch, with directional control and an indicator showing which way it turns.',
      'The chassis was modelled in SolidWorks and 3D printed, then fitted with neodymium magnets, bearings and hand-wound copper coils.',
      'An Arduino runs the speed, direction and indicator controls.',
      'As assistant captain of a six-person team, helped bring the project to a grade of 14/15.',
    ],
  },
  {
    slug: 'crack-avoidance-pi-car',
    title: 'Crack Avoidance Pi-Car',
    short: 'A self-driving car that stops when it sees a crack.',
    category: 'Embedded — Autonomous Vehicle',
    role: 'Captain',
    year: 2024,
    image: 'images/pi-car.webp',
    tags: ['Python', 'Keras', 'OpenCV', 'Raspberry Pi'],
    blurb: 'A self-driving Raspberry Pi car that spots surface cracks with a neural network and stops when it sees one.',
    body: [
      'An autonomous vehicle built from motors, a camera and a Raspberry Pi, designed to detect surface cracks in real time.',
      'The car streams camera video to a convolutional neural network written in Python, which halts it as soon as it detects a crack.',
      'The model was trained on 1,000 labelled images. Tuning the architecture, activation functions and training epochs brought the prediction error down.',
      'In testing, the car identified and responded to cracks correctly 98% of the time.',
    ],
  },
  {
    slug: 'f-117a-nighthawk',
    title: 'F-117A Nighthawk',
    short: 'A full SolidWorks model of the stealth jet.',
    category: 'CAD — SolidWorks Assembly',
    role: 'Captain',
    year: 2023,
    image: 'images/f117-cockpit.webp',
    tags: ['SolidWorks', 'CAD', 'Animation'],
    links: [['Watch the animation', 'https://www.youtube.com/watch?v=WvzyVKP_a9E&t=22s']],
    blurb: 'A full SolidWorks model of the F-117A Nighthawk: about 5,000 parts and 1,500 mates, with animated moving parts.',
    body: [
      'Sketched and modelled the F-117A Nighthawk stealth jet in SolidWorks over more than 30 hours of design time.',
      'The full assembly has about 5,000 parts, 200 subassemblies and 1,500 mates, covering the wings, engine, fuselage, cockpit and landing gear.',
      'An animated simulation shows the mechanical movement of the key components.',
      'Led the five-person team as captain, managing workflow, design integration and final deliverables. The project earned an A.',
    ],
  },
  {
    slug: 'arm-alarm-clock',
    title: 'ARM Cortex Alarm Clock',
    short: 'A full alarm clock on a TI Tiva board, with Bluetooth and a gyro display.',
    category: 'Embedded — Microcontroller',
    role: 'Programming',
    tags: ['ARM Cortex-M', 'Energia', 'Bluetooth', 'Sensors'],
    blurb: 'A full alarm clock programmed on a TI Tiva (ARM Cortex-M) board.',
    body: [
      'Input comes from a joystick and buttons, and alarms can be selected over Bluetooth.',
      'A buzzer sounds the alarm, and an ultrasonic sensor handles snooze.',
      'A gyroscope rotates the display, and a live readout shows the room temperature.',
    ],
  },
  {
    slug: 'lego-brick-classifier',
    title: 'Lego Brick Sorting Classifier',
    short: 'Sorting Lego bricks from conveyor-belt images, from 63% to 88% accuracy.',
    category: 'Machine Learning — Classification',
    tags: ['Python', 'Machine Learning', 'Feature Engineering'],
    blurb: 'Classifies four Lego brick types from conveyor-belt images.',
    body: [
      'Working from raw pixels, the classifier reached 63% test accuracy.',
      'Replacing the pixels with 23 rotation- and translation-invariant geometric features raised test accuracy to 88%, using logistic regression.',
    ],
  },
  {
    slug: 'resy-reservation-bot',
    section: 'Side builds',
    title: 'Resy Reservation Bot',
    short: 'A bot that books hard-to-get restaurant tables.',
    category: 'Automation',
    year: 2026,
    image: 'images/resy-dashboard.webp',
    tags: ['Python', 'Streamlit', 'pandas', 'Altair'],
    links: [['Source code', GH('resy-reservation-bot')]],
    blurb: 'Automatically books hard-to-get Resy tables.',
    body: [
      'The bot watches for cancellations and snipes new releases the second they open.',
      'It sends phone alerts, tracks cancellations, and runs from a Streamlit dashboard.',
    ],
  },
  {
    slug: 'watermark-studio',
    section: 'Side builds',
    title: 'Watermark Studio',
    short: 'A browser app for watermarking images, PDFs and Word files.',
    category: 'Web App',
    year: 2026,
    image: 'images/watermark-studio.webp',
    tags: ['Python', 'Streamlit', 'WebAssembly', 'PyMuPDF'],
    links: [['Open the app', 'https://fei7fei.github.io/watermark-creation-tool/'], ['Source code', GH('watermark-creation-tool')]],
    blurb: 'A Streamlit app that adds text or image watermarks to images, PDFs and Word documents.',
    body: [
      'Watermarks can be single, or slanted and tiled across the page.',
      'It runs in the browser: Python executes locally with WebAssembly, so files are never uploaded.',
    ],
  },
  {
    slug: 'guandan-counter',
    section: 'Side builds',
    title: 'Guandan Counter',
    short: 'A scorekeeper for Guandan (掼蛋) game night.',
    category: 'PWA',
    year: 2026,
    image: 'images/guandan.webp',
    tags: ['JavaScript', 'PWA', 'HTML', 'CSS'],
    links: [['Open the app', 'https://fei7fei.github.io/guandan-counter/'], ['Source code', GH('guandan-counter')]],
    blurb: 'A scorekeeper for the card game Guandan (掼蛋).',
    body: [
      'It tracks both teams’ levels from 2 to A, and handles the rules for winning on A.',
      'It keeps win rates for every player and partnership.',
      'It works offline from the iPhone Home Screen, in English and 中文.',
    ],
  },
];

// Jumper-wire colours, assigned in order.
const WIRES = ['#e2372b', '#f28c28', '#e0b100', '#1f9a3c', '#1d5bc2', '#7b3fbf', '#e8508a', '#119aa6'];

const pad = (n) => String(n).padStart(2, '0');
const wireColor = (p, i) => p.color || WIRES[i % WIRES.length];
const projectSection = (p) => p.section || 'Engineering';
const projectUrl = (p) => `project.html?p=${encodeURIComponent(p.slug)}`;

// Card face: the cover image if there is one, else a placeholder in the wire colour.
const cover = (p) => (p.image
  ? `<span class="cover${p.fit ? ` cover--${p.fit}` : ''}"${p.bg ? ` style="--cover-bg:${p.bg}"` : ''}><img src="${p.image}" alt="" draggable="false"></span>`
  : '<span class="cover cover--blank"></span>');
