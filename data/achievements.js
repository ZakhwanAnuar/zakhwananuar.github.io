/* ================================================================
   data/achievements.js
   ================================================================

   HOW TO ADD AN ACHIEVEMENT:
   1. Copy one of the objects below
   2. Paste it at the TOP of the array (newest first)
   3. Fill in all the fields
   4. Drop your photos into  assets/images/Achievements/<your-folder>/
      then list their paths in the `images` array
   5. Save the file — done. No code changes needed.

   FIELDS:
   - id:        Unique string, no spaces (used internally)
   - title:     Achievement name, e.g. "2nd Place UMCS CTF"
   - placement: Short badge text, e.g. "1st Place", "2nd Place",
                "Speaker", "Finalist", "Delegate". Controls the badge
                colour (1st = gold, 2nd = silver, 3rd = bronze,
                anything else = cyan). Set to '' to hide the badge.
   - date:      Display date string, e.g. "June 2026"
   - issuer:    Who organised / awarded it, e.g. "Universiti Malaya"
   - summary:   Optional 1-line description (shown in the lightbox).
                Set to '' to hide.
   - images:    Array of image paths. The FIRST image is the card
                cover. Add as many as you like — the gallery shows
                them all with prev/next + thumbnails.
                Leave as [] if you have no photo yet (the card will
                show a themed placeholder instead).

================================================================ */

const ACHIEVEMENTS_DATA = [

  {
    id:        'bahtera-siber-3108-ctf-2026',
    title:     'Bahtera Siber 3108 CTF: Warisan Takhta',
    placement: '8th Place · 3× First Blood',
    date:      'August 2026',
    issuer:    'Bahtera Digital Technology',
    summary:   'Top-10 finish (8th, 3,200 pts) with a few First Bloods',
    images:    [
      'assets/images/Achievements/bahterasiber2026/bahterasiber1.jpeg',
      'assets/images/Achievements/bahterasiber2026/2.jpeg',
      'assets/images/Achievements/bahterasiber2026/3.jpeg',
      'assets/images/Achievements/bahterasiber2026/4.jpeg',
      'assets/images/Achievements/bahterasiber2026/5.jpeg',
    ],
  },

  {
    id:        'cybershield-summit-2026',
    title:     'Speaker — CyberShield Summit 2026',
    placement: 'Speaker',
    date:      'July 2026',
    issuer:    'Persatuan Teknologi Maklumat UPSI',
    summary:   'National-level talk on cybersecurity and CTF to 360+ participants.',
    images:    [
      'assets/images/Blog/cybershield.jpg',
    ],
  },

  {
    id:        'umcs-ctf-2026-2nd',
    title:     '1st Runner Up — UM Cybersecurity Summit CTF 2026',
    placement: '1st Runner Up',
    date:      'June 2026',
    issuer:    'Universiti Malaya (PEKOM) × RE:HACK',
    summary:   'Attack & Defence final round with team "hehe i play ctf".',
    // EDIT: add photos to assets/images/Achievements/umcs-ctf/ and list them here
    images:    [
      'assets/images/Achievements/umcs-ctf/2.jpg',
      'assets/images/Achievements/umcs-ctf/1.jpg',
    ],
  },

  {
    id:        'divide-academy-hunting-hidden-data-2026',
    title:     'Speaker — Hunting Hidden Data: An Introduction to File Analysis',
    placement: 'Speaker',
    date:      '2026',
    issuer:    'DIV:IDE Academy — DIV:IDE CTF 2026 Edition',
    summary:   'Session on digital forensics and file analysis fundamentals — identifying hidden data, analyzing file structures, and hands-on practical examples.',
    // EDIT: add photos to assets/images/Achievements/divide-hunting-hidden-data/ and list them here
    images:    [
      'assets/images/Achievements/divide-hunting-hidden-data/1.jpg',
      'assets/images/Achievements/divide-hunting-hidden-data/2.jpg',
      'assets/images/Achievements/divide-hunting-hidden-data/3.jpg',
      'assets/images/Achievements/divide-hunting-hidden-data/4.jpg',
    ],
  },

  {
    id:        'divide-academy-delete-not-gone-2026',
    title:     'Speaker — Delete ≠ Gone: Fundamentals of Disk Analysis',
    placement: 'Speaker',
    date:      '2026',
    issuer:    'DIV:IDE Academy — Hack@10 International CTF 2026 Edition',
    summary:   'Technical session on disk analysis to 60+ participants at an international CTF — uncovering hidden data and analyzing file system structures through hands-on examples.',
    // EDIT: add photos to assets/images/Achievements/divide-delete-not-gone/ and list them here
    images:    [
      'assets/images/Achievements/divide-delete-not-gone/1.jpg',
      'assets/images/Achievements/divide-delete-not-gone/2.jpg',
      'assets/images/Achievements/divide-delete-not-gone/3.jpg',
      'assets/images/Achievements/divide-delete-not-gone/4.jpg',
      'assets/images/Achievements/divide-delete-not-gone/5.jpg',
    ],
  },

  {
    id:        'iboh-2025',
    title:     'International Battle of Hackers (IBOH) 2025',
    placement: '',
    date:      '2025',
    issuer:    'Asia Pacific University',
    summary:   'Representing UNITEN at the national-level competition.',
    images:    [
      'assets/images/Achievements/iboh/1.jpg',
    ],
  },

  {
    id:        'mcmc-netbytesec-2025',
    title:     'Intervarsity Cyber Forensics Challenge — MCMC × NetByteSEC',
    placement: 'Top 10 Finalist',
    date:      '2025',
    issuer:    'Cybersecurity Center of Excellence, Malaysia',
    summary:   'Finalist in the national-level intervarsity cyber forensics challenge.',
    images:    [
      'assets/images/Achievements/mcmc-netbytesec/1.jpg',
      'assets/images/Achievements/mcmc-netbytesec/2.jpg',
      'assets/images/Achievements/mcmc-netbytesec/3.jpg',
    ],
  },
  {
    id:        'asean-youth-leadership-2025',
    title:     'ASEAN Youth Leadership Conference 2025',
    placement: 'Malaysia Representative',
    date:      'October 2025',
    issuer:    'ASEAN Regional Program',
    summary:   'Represented Malaysia at a regional forum on youth leadership, sustainable development, innovation, and cross-cultural collaboration.',
    // EDIT: add photos to assets/images/Achievements/asean-youth-leadership/ and list them here
    images:    [
      'assets/images/Achievements/asean-youth-leadership/1.jpg',
      'assets/images/Achievements/asean-youth-leadership/2.jpg',
      'assets/images/Achievements/asean-youth-leadership/3.jpg',

    ],
  },

  {
    id:        'seasel-2025',
    title:     "Selected Malaysian Delegate — SEASEL'25",
    placement: 'Malaysian Delegate',
    date:      '2025',
    issuer:    'Universiti Sains Malaysia',
    summary:   "One of five student leaders representing UNITEN's CCI at Southeast Asia Sustainable Environmental Leadership Program 2025.",
    images:    [
      'assets/images/Blog/seasel.jpg',
      'assets/images/Blog/seasel1.jpg',
    ],
  },


];
