// Education, work and leadership: each group is a section you click between on
// the Experience tab. Like the projects, every entry is a card, a line on the
// board's LCD and a detail page: project.html?e=<slug>
//   group:   'Education', 'Work' or 'Leadership' (the order here is the order shown).
//   when:    short label; date: full dates for the detail page.
//   short:   one-line description shown while scrolling the cards.
//   bullets: what was done there, for the detail page.
//   image:   optional cover image (4:3 crops best). fit: 'contain' letterboxes it on `bg`.
//            Until it's set, the card shows a placeholder with the logo.
//   media:   optional photos / videos: { src, caption, poster?, video? }
//   site:    [label, url] for the organisation.
//   color:   optional wire / card colour; omit to take the next jumper colour.
const ENTRIES = [
  {
    slug: 'ubc-engineering',
    group: 'Education',
    role: 'B.A.Sc. Electrical Engineering',
    org: 'University of British Columbia',
    place: 'Kelowna, BC',
    when: '2027',
    date: 'Expected May 2027',
    logo: 'images/logos/ubc.png',
    image: '', // TODO: cover photo, e.g. 'images/experience/<slug>.webp'
    site: ['Website', 'https://engineering.ok.ubc.ca/'],
    short: 'Graduating May 2027.',
    bullets: [
      'Capstone: the Codling Moth Exuvia Counting System for the Okanagan Kootenay Sterile Insect Release Program.',
      'Research: a medical-imaging AI abstract submitted to SPIE Medical Imaging 2027.',
    ],
  },
  {
    slug: 'georgetown-business-academy',
    group: 'Education',
    role: 'Summer Program',
    org: 'Georgetown Business Academy',
    place: 'Washington, DC',
    when: '2020–21',
    date: 'Jul 2020 — Aug 2021',
    logo: 'images/logos/georgetown.png',
    image: '', // TODO: cover photo, e.g. 'images/experience/<slug>.webp'
    site: ['Website', 'https://summer.georgetown.edu/programs/SHS03/business-academy/'],
    short: 'College-level business courses and a startup pitch.',
    bullets: [
      'College-level lectures and projects in finance, real estate, marketing and international trade.',
      'Developed a startup business plan with peers and pitched it in a Shark Tank-style presentation.',
    ],
  },
  {
    slug: 'st-johns-school',
    group: 'Education',
    role: 'High School',
    org: 'St. John’s School',
    place: 'Vancouver, BC',
    when: '2016–22',
    date: 'Sep 2016 — Jun 2022',
    logo: 'images/logos/sjs.svg',
    image: '', // TODO: cover photo, e.g. 'images/experience/<slug>.webp'
    site: ['Website', 'https://sjs.ca/'],
    short: 'Student Council Prefect.',
  },
  {
    slug: 'ubc-mems-lab',
    group: 'Work',
    role: 'Intern / Volunteer',
    org: 'UBC MEMS Lab',
    place: 'Vancouver, BC',
    when: '2025',
    date: 'Apr 2025 — Jun 2025',
    logo: 'images/logos/ubc.png',
    image: '', // TODO: cover photo, e.g. 'images/experience/<slug>.webp'
    site: ['Website', 'https://mech.ubc.ca/mu-chiao/'],
    tags: ['Python', 'C++', 'MEMS', 'Microscopy'],
    short: 'Cardiac tissue research on a MEMS cell stretcher.',
    bullets: [
      'Assisted a PhD student in cardiac tissue modelling using a MEMS-based cell stretcher, calibrating load cells for force measurement.',
      'Operated microscopes and collected substrate stress and strain data under various motor conditions.',
      'Created graphical visualizations of the substrate’s mechanical behaviour to support ongoing cardiac research.',
      'Contributed to a custom Petri dish prototype that runs multiple trials in one container, so cells can be cultured under different drug treatments at once.',
      'Improved Python and C++ control code for ease of use, and proposed hardware upgrades: closed-loop drivers, a compact design and magnetic placement.',
      'Enhanced the clamping mechanism and enabled membrane underside observation for improved imaging.',
    ],
    media: [
      { src: 'images/cell-stretcher.webp', caption: 'The cell stretcher and its control electronics' },
      { video: 'videos/cell-stretcher-rig.mp4', poster: 'images/cell-stretcher-rig-poster.webp', caption: 'Running a stretch cycle with live data' },
      { video: 'videos/cell-stretcher-membrane.mp4', poster: 'images/cell-stretcher-membrane-poster.webp', caption: 'Filmed with a camera rig I built, using the ruler as a scale reference to calculate stress and strain' },
    ],
  },
  {
    slug: 'hyc-technology',
    group: 'Work',
    role: 'Engineering & Operations Intern',
    org: 'HYC Technology',
    place: 'Suzhou, China',
    when: '2024',
    date: 'Jul 2024 — Aug 2024',
    logo: 'images/logos/hyc.svg',
    image: '', // TODO: cover photo, e.g. 'images/experience/<slug>.webp'
    site: ['Website', 'https://www.hyc.com/'],
    tags: ['Manufacturing', 'Quartus'],
    short: 'Rotational training across 7 departments, plus production-line assembly.',
    bullets: [
      'Completed rotational training across 7 departments, including semiconductor R&D, EV R&D, smart device development, quality control and supply chain.',
      'Assembled 100 smartwatch panel carriers for automated testing machines on the production line.',
      'Gained exposure to Git, SolidWorks, Quartus Prime, Cadence Allegro and Siemens/Mitsubishi PLC software.',
      'Explored internal systems, including HYC’s proprietary cloud network and remote desktop solutions.',
    ],
  },
  {
    slug: 'suzhou-yi-li-energy',
    group: 'Work',
    role: 'Engineering Intern',
    org: 'Suzhou Yi Li Energy',
    place: 'Suzhou, China',
    when: '2023',
    date: 'Jul 2023 — Aug 2023',
    logo: 'images/logos/yili.png',
    image: '', // TODO: cover photo, e.g. 'images/experience/<slug>.webp'
    site: ['Company profile', 'https://baike.baidu.com/item/%E8%8B%8F%E5%B7%9E%E5%BC%88%E5%8A%9B%E8%83%BD%E6%BA%90%E7%A7%91%E6%8A%80%E6%9C%89%E9%99%90%E5%85%AC%E5%8F%B8/51526175'],
    tags: ['PCB Repair', 'Soldering', 'Oscilloscope', 'Motors'],
    short: 'Diagnosed motors and repaired PCBs from the production line.',
    bullets: [
      'Interpreted electrical schematics for motor systems.',
      'Conducted diagnostics and repairs on defective motors from the production line.',
      'Used multimeters, oscilloscopes and DC/AC generators to diagnose faulty PCBs, then repaired them by soldering resistors, capacitors and other components.',
      'Gained insight into electric motor industry trends from a business and manufacturing perspective.',
    ],
    media: [
      { src: 'images/yili-pcbs.webp', caption: 'Motor-driver PCBs on the repair bench' },
    ],
  },
  {
    slug: 'student-council',
    group: 'Leadership',
    role: 'Prefect & Gunn House Captain',
    org: 'Student Council, St. John’s School',
    place: 'Vancouver, BC',
    when: '2020–22',
    date: 'Sep 2020 — Jun 2022',
    logo: 'images/logos/sjs.svg',
    image: '', // TODO: cover photo, e.g. 'images/experience/<slug>.webp'
    site: ['Website', 'https://sjs.ca/'],
    short: 'Ran orientation, International Day and Halloween Week.',
    bullets: [
      'Ran orientation for all new students, including campus tours and school history.',
      'Primary organizer of School International Day; convinced the principal to allow cultural clothing and music during lunch.',
      'Primary organizer of Halloween Week: designed a haunted house and ran door decorating, pumpkin carving, a costume contest and a scavenger hunt.',
    ],
  },
  {
    slug: 'business-club',
    group: 'Leadership',
    role: 'Team Leader',
    org: 'School Business Club, St. John’s School',
    place: 'Vancouver, BC',
    when: '2020–22',
    date: 'Sep 2020 — Jun 2022',
    logo: 'images/logos/sjs.svg',
    image: '', // TODO: cover photo, e.g. 'images/experience/<slug>.webp'
    site: ['Website', 'https://sjs.ca/'],
    short: '#1 in BC in the Junior Achievement Stock Market Competition.',
    bullets: [
      'Led student teams in business competitions, including the Wharton Global High School Investment Competition.',
      'Ranked 1st in British Columbia and top 52 in Canada in the Junior Achievement Stock Market Competition, and presented investment strategies to organizers and stakeholders.',
      'Conducted market research and analysis using frameworks such as PEST (Political, Economic, Social, Technological).',
      'Developed leadership, strategic planning and investment analysis skills through competition-based projects.',
    ],
  },
  {
    slug: 'project-plum-blossom',
    group: 'Leadership',
    role: 'Co-Founder',
    org: 'Project Plum Blossom, St. John’s School',
    place: 'Vancouver, BC',
    when: '2020–21',
    date: 'Sep 2020 — Jun 2021',
    logo: 'images/logos/sjs.svg',
    image: '', // TODO: cover photo, e.g. 'images/experience/<slug>.webp'
    site: ['Website', 'https://sjs.ca/'],
    short: 'A Stop Anti-Asian Hate initiative that raised $1,123.',
    bullets: [
      'Led a team of three to launch a Stop Anti-Asian Hate initiative promoting cultural awareness and community support.',
      'Designed enamel pins and posters, and coordinated with international manufacturers for production and logistics.',
      'Ran an Instagram campaign for national outreach alongside in-person sales at school events.',
      'Raised $1,123 for the Vancouver Chinatown Foundation to support elderly residents.',
    ],
  },
  {
    slug: 'scouts-canada',
    group: 'Leadership',
    role: 'Secretary, Venturer',
    org: 'Scouts Canada',
    place: 'Vancouver, BC',
    when: '2011–22',
    date: 'Sep 2011 — Jun 2022',
    logo: 'images/logos/scouts.png',
    image: '', // TODO: cover photo, e.g. 'images/experience/<slug>.webp'
    site: ['Website', 'https://www.scouts.ca/'],
    short: 'Eleven years of camps, events and community service.',
    bullets: [
      'Planned events, led youth activities, maintained records, and promoted teamwork and safety during camps and community service projects.',
    ],
  },
];

const entryUrl = (e) => `project.html?e=${encodeURIComponent(e.slug)}`;
// Experience starts three jumper colours along, so it doesn't mirror the projects.
const entryColor = (e, i) => wireColor(e, i + 3);

// Card face: the cover image if there is one, else a placeholder with the logo.
const entryCover = (e) => (e.image
  ? cover(e)
  : `<span class="cover cover--blank cover--ph">${e.logo ? `<img class="cover__logo" src="${e.logo}" alt="" draggable="false">` : ''}<span class="cover__ph">Image to come</span></span>`);
