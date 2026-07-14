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

  {
    id:          'Bad-USB',
    title:       'Bad-USB — DIY Keystroke Injection Tool',
    description: 'A Raspberry Pi Pico rubber ducky running CircuitPython. Enumerates as a USB HID keyboard and executes DuckyScript payloads, with a GP0 jumper toggling between edit and silent-deploy modes. Built to study HID injection for defensive awareness.',
    tech:        ['CircuitPython', 'Raspberry Pi Pico', 'USB HID', 'DuckyScript'],
    tags:        ['security', 'tool', 'system'],
    icon:        'fas fa-usb',
    github:      'https://github.com/ZakhwanAnuar/Bad-USB',
    demo:        null,
    featured:    true,
  },

  // ---- EXAMPLE PROJECT 1 ---- (EDIT THIS)
  {
    id:          'Student-Enrollment-Management-System',
    title:       'Student Enrollment Management System',
    description: 'A C++-based system for managing student records, course enrollments, and academic data. Implements object-oriented design with features for adding, updating, and retrieving student information efficiently.',
    tech:        ['C++', 'OOP', 'File Handling'],
    tags:        ['system', 'management', 'software'],
    icon:        'fas fa-user-graduate',
    github:      'https://github.com/ZakhwanAnuar/Student-Enrollment-Management-System',
    demo:        null,
    featured:    true,
  },

  // ---- EXAMPLE PROJECT 2 ---- (EDIT THIS)
  {
    id:          'PassHunter',
    title:       'PassHunter',
    description: 'A modular Python toolkit for password generation, wordlist creation, and controlled brute-force simulation. Designed for ethical hacking and educational use to analyze password entropy, authentication weaknesses, and defensive security strategies.',
    tech:        ['Python', 'CLI', 'Security'],
    tags:        ['security', 'tool', 'scripting'],
    icon:        'fas fa-key',
    github:      'https://github.com/ZakhwanAnuar/PassHunter',
    demo:        null,
    featured:    true,
  },
/*
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
*/
];
