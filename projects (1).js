/* ================================================================
   data/projects.js
   ================================================================

   HOW TO ADD A PROJECT:
   1. Copy one of the objects below
   2. Paste it at the TOP of the array (newest first)
   3. Fill in your values
   4. Save the file

   FIELDS:
   - id:          Unique string, no spaces (used internally)
   - title:       Project name
   - description: 1–3 sentence description
   - tech:        Array of technology/language strings
   - tags:        Array of filter categories — must match filter buttons
                  in projects.html: 'security', 'tool', 'web', 'scripting'
   - icon:        Font Awesome icon class (https://fontawesome.com/icons)
   - github:      GitHub URL (set to null if private/none)
   - demo:        Live demo URL (set to null if none)
   - featured:    true = shown on home page, false = only on projects page

================================================================ */

const PROJECTS_DATA = [

  // ---- EXAMPLE PROJECT 1 ---- (EDIT THIS)
  {
    id:          'port-scanner',
    title:       'Custom Port Scanner',
    description: 'A multithreaded port scanner written in Python with service detection, banner grabbing, and output reporting. Built as a learning project to understand TCP/UDP networking.',
    tech:        ['Python', 'Sockets', 'Threading'],
    tags:        ['security', 'tool', 'scripting'],
    icon:        'fas fa-network-wired',
    github:      'https://github.com/yourusername/port-scanner',
    demo:        null,
    featured:    true,
  },

  // ---- EXAMPLE PROJECT 2 ---- (EDIT THIS)
  {
    id:          'ctf-toolkit',
    title:       'CTF Automation Toolkit',
    description: 'A collection of Python scripts that automate common CTF tasks: base encoding/decoding, frequency analysis, simple cipher attacks, and hash identification.',
    tech:        ['Python', 'Cryptography', 'Automation'],
    tags:        ['security', 'scripting'],
    icon:        'fas fa-flag',
    github:      'https://github.com/yourusername/ctf-toolkit',
    demo:        null,
    featured:    true,
  },

  // ---- EXAMPLE PROJECT 3 ---- (EDIT THIS)
  {
    id:          'log-analyzer',
    title:       'Security Log Analyzer',
    description: 'Web-based dashboard for visualizing server logs and detecting anomalous access patterns. Parses Apache/Nginx access logs and highlights suspicious IP activity.',
    tech:        ['Python', 'Flask', 'JavaScript', 'Chart.js'],
    tags:        ['security', 'web', 'tool'],
    icon:        'fas fa-chart-line',
    github:      'https://github.com/yourusername/log-analyzer',
    demo:        null,
    featured:    true,
  },

  // ---- EXAMPLE PROJECT 4 ---- (not featured — only on projects page)
  {
    id:          'password-audit',
    title:       'Password Auditing Script',
    description: 'Python script for auditing password policies against common wordlists. Supports custom rulesets and generates a report with strength metrics.',
    tech:        ['Python', 'hashlib', 'argparse'],
    tags:        ['security', 'scripting'],
    icon:        'fas fa-key',
    github:      'https://github.com/yourusername/password-audit',
    demo:        null,
    featured:    false,
  },

];
