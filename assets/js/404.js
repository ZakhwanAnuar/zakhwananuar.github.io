
    // Interactive 404 terminal — the requested path is shown, then the
    // visitor can poke around with real commands (help, ls, arcade, ...).
    (function terminal() {
      var pathEl = document.getElementById('nfPath');
      if (pathEl) {
        var p = (location.pathname + location.search).replace(/^\//, '');
        pathEl.textContent = p || 'requested/page';
      }

      var out = document.getElementById('nfOut');
      var term = document.getElementById('nfTerm');
      var input = document.getElementById('nfCmd');
      if (!out || !term || !input) return;

      var PAGES = {
        home: '/index.html', about: '/about.html', projects: '/projects.html',
        writeups: '/writeups.html', blog: '/blog.html', achievements: '/achievements.html',
        resume: '/resume.html', contact: '/contact.html',
        arcade: '/games.html', games: '/games.html',
        board: '/waklu.html', notes: '/notes.html'
      };

      function esc(s) {
        return String(s).replace(/[&<>]/g, function (c) {
          return { '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c];
        });
      }
      function print(html) {
        var d = document.createElement('div');
        d.className = 'line';
        d.innerHTML = html;
        out.appendChild(d);
        term.scrollTop = term.scrollHeight;
      }
      function open(url, label) {
        print('<span class="ok">' + label + '…</span>');
        setTimeout(function () { window.location.href = url; }, 600);
      }

      var COMMANDS = {
        help: function () {
          print('Commands: <span class="ok">help</span> <span class="ok">ls</span> <span class="ok">whoami</span> ' +
                '<span class="ok">arcade</span> <span class="ok">board</span> <span class="ok">notes</span> ' +
                '<span class="ok">cd &lt;page&gt;</span> <span class="ok">clear</span> <span class="ok">home</span>');
        },
        ls: function () {
          print('projects/  writeups/  blog/  about/  contact/  resume/');
          print('<span class="muted">hidden:</span> arcade/  board/  notes/');
        },
        whoami: function () { print('zakhwan — cybersecurity student &amp; CTF player.'); },
        arcade: function () { open('/games.html', 'entering the arcade'); },
        games: function () { open('/games.html', 'entering the arcade'); },
        board: function () { open('/waklu.html', 'opening the board'); },
        notes: function () { open('/notes.html', 'opening notes'); },
        home: function () { open('/index.html', 'going home'); },
        sudo: function () { print('<span class="err">nice try 😏</span> — user is not in the sudoers file.'); },
        flag: function () { print('<span class="ok">flag{y0u_g0t_l0st_but_f0und_a_flag}</span>'); },
        date: function () { print(esc(new Date().toString())); },
        clear: function () { out.innerHTML = ''; }
      };

      function run(raw) {
        var cmd = raw.trim();
        print('<span class="prompt">$</span> ' + esc(cmd));
        if (!cmd) return;
        var parts = cmd.split(/\s+/);
        var name = parts[0].toLowerCase();
        if (COMMANDS[name]) { COMMANDS[name](); return; }
        if ((name === 'cd' || name === 'open' || name === 'cat') && parts[1]) {
          var t = parts[1].toLowerCase().replace(/\/$/, '');
          if (PAGES[t]) { open(PAGES[t], name + ' ' + t); }
          else { print('<span class="err">' + name + ': ' + esc(parts[1]) + ': no such page</span>'); }
          return;
        }
        print('<span class="err">' + esc(name) + ': command not found</span> — try <span class="ok">help</span>');
      }

      input.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') { run(input.value); input.value = ''; }
      });
      term.addEventListener('click', function () { input.focus(); });
    })();
  
