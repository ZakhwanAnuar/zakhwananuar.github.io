/* ================================================================
   games.js — browser games for the games pages
   1. Malware Sweeper : Minesweeper-style — scan a network, flag the malware
   2. Code Breaker    : Mastermind-style deduction, crack a 4-digit code
   3. Sequence        : Simon-style memory — repeat the growing access pattern
   4. Aim Trainer     : FPS-style target range (desktop / mouse only)
   5. Kill Switch     : Lights Out puzzle — shut every node off
   Each game no-ops unless its elements are present on the page.
   Vanilla JS, no dependencies. Best scores persist in localStorage.
================================================================ */

function loadBest(key) {
  try { return parseInt(localStorage.getItem(key), 10) || 0; } catch (e) { return 0; }
}
function saveBest(key, val) {
  try { localStorage.setItem(key, String(val)); } catch (e) { /* storage blocked */ }
}
const $ = (id) => document.getElementById(id);

/* ================================================================
   GAME 1 — MALWARE SWEEPER
================================================================ */
(function malwareSweeper() {
  const grid = $('msGrid');
  if (!grid) return;

  const COLS = 9, ROWS = 9, MINES = 12, N = COLS * ROWS;
  const leftEl = $('msLeft'), timeEl = $('msTime'), bestEl = $('msBest');
  const idle = $('msIdle'), over = $('msOver'), overTitle = $('msOverTitle'), result = $('msResult');
  const flagBtn = $('msFlag');

  let cells, started, alive, flagMode, flags, seconds, timer;

  const best = loadBest('game_ms_best');
  bestEl.textContent = best ? best + 's' : '—';

  const idx = (r, c) => r * COLS + c;

  function neighbors(i) {
    const r = (i / COLS) | 0, c = i % COLS, out = [];
    for (let dr = -1; dr <= 1; dr++) {
      for (let dc = -1; dc <= 1; dc++) {
        if (dr === 0 && dc === 0) continue;
        const nr = r + dr, nc = c + dc;
        if (nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS) out.push(idx(nr, nc));
      }
    }
    return out;
  }

  function setFlagMode(on) {
    flagMode = on;
    flagBtn.classList.toggle('active', on);
    flagBtn.innerHTML = `<i class="fas fa-flag"></i> Flag mode: ${on ? 'on' : 'off'}`;
  }

  function fresh() {
    cells = Array.from({ length: N }, () => ({ mine: false, rev: false, flag: false, n: 0 }));
    started = false; alive = true; flags = 0; seconds = 0;
    setFlagMode(false);
    leftEl.textContent = MINES;
    timeEl.textContent = '0';
    clearInterval(timer);
    render();
  }

  // Place mines only after the first click, keeping that cell + its neighbours clear
  function placeMines(safe) {
    const forbidden = new Set([safe, ...neighbors(safe)]);
    let placed = 0;
    while (placed < MINES) {
      const i = (Math.random() * N) | 0;
      if (cells[i].mine || forbidden.has(i)) continue;
      cells[i].mine = true; placed++;
    }
    for (let i = 0; i < N; i++) {
      if (!cells[i].mine) cells[i].n = neighbors(i).filter((j) => cells[j].mine).length;
    }
  }

  function startTimer() {
    started = true;
    timer = setInterval(() => { seconds++; timeEl.textContent = seconds; }, 1000);
  }

  // Iterative flood fill: revealing a 0 opens its neighbours
  function flood(start) {
    const stack = [start];
    while (stack.length) {
      const i = stack.pop();
      const cell = cells[i];
      if (cell.rev || cell.flag) continue;
      cell.rev = true;
      if (cell.n === 0 && !cell.mine) {
        neighbors(i).forEach((j) => { if (!cells[j].rev && !cells[j].flag) stack.push(j); });
      }
    }
  }

  function open(i) {
    if (!alive) return;
    const cell = cells[i];
    if (cell.rev || cell.flag) return;
    if (!started) { placeMines(i); startTimer(); }
    if (cell.mine) return lose(i);
    flood(i);
    render();
    if (cells.every((c) => c.mine || c.rev)) win();
  }

  function toggleFlag(i) {
    if (!alive || cells[i].rev) return;
    cells[i].flag = !cells[i].flag;
    flags += cells[i].flag ? 1 : -1;
    leftEl.textContent = Math.max(0, MINES - flags);
    render();
  }

  function win() {
    alive = false; clearInterval(timer);
    cells.forEach((c) => { if (c.mine) c.flag = true; });
    render();
    const prev = loadBest('game_ms_best');
    const better = !prev || seconds < prev;
    if (better) { saveBest('game_ms_best', seconds); bestEl.textContent = seconds + 's'; }
    overTitle.textContent = 'Network clean';
    result.textContent = `Cleared in ${seconds}s${better ? ' — new best!' : ''}`;
    over.hidden = false;
  }

  function lose(hit) {
    alive = false; clearInterval(timer);
    cells[hit].rev = true;
    cells.forEach((c) => { if (c.mine) c.rev = true; });
    render();
    overTitle.textContent = 'Infected';
    result.textContent = 'You scanned a malware node. Try a fresh network.';
    over.hidden = false;
  }

  function render() {
    let html = '';
    for (let i = 0; i < N; i++) {
      const c = cells[i];
      let cls = 'ms-cell', txt = '';
      if (c.rev) {
        cls += ' rev';
        if (c.mine) { cls += ' mine'; txt = '<i class="fas fa-virus"></i>'; }
        else if (c.n > 0) { cls += ' n' + c.n; txt = c.n; }
      } else if (c.flag) {
        cls += ' flag'; txt = '<i class="fas fa-flag"></i>';
      }
      html += `<button type="button" class="${cls}" data-i="${i}">${txt}</button>`;
    }
    grid.innerHTML = html;
  }

  grid.addEventListener('click', (e) => {
    const b = e.target.closest('.ms-cell'); if (!b) return;
    const i = +b.dataset.i;
    if (flagMode) toggleFlag(i); else open(i);
  });
  grid.addEventListener('contextmenu', (e) => {
    const b = e.target.closest('.ms-cell'); if (!b) return;
    e.preventDefault(); toggleFlag(+b.dataset.i);
  });
  flagBtn.addEventListener('click', () => setFlagMode(!flagMode));

  function start() { fresh(); idle.hidden = true; over.hidden = true; }
  $('msStart').addEventListener('click', start);
  $('msRestart').addEventListener('click', start);
  fresh();   // draw an initial board behind the idle overlay
})();

/* ================================================================
   GAME 2 — CODE BREAKER (Mastermind-style)
================================================================ */
(function codeBreaker() {
  const board = $('cbBoard');
  if (!board) return;

  const LEN = 4, MAX = 10;
  const idle = $('cbIdle'), over = $('cbOver'), overTitle = $('cbOverTitle'), result = $('cbResult');
  const triesEl = $('cbTries'), bestEl = $('cbBest'), guessNumEl = $('cbGuessNum');
  const inputs = [...document.querySelectorAll('#cbInputs .cb-input')];

  let secret, guesses, active;

  const best = loadBest('game_cb_best');
  bestEl.textContent = best ? best : '—';

  // Per-position status so each digit is coloured in place (Wordle-style):
  //   'exact'   = right digit, right spot
  //   'present' = digit is in the code but in a different spot
  //   'absent'  = digit is not in the code
  function evaluate(guess) {
    const status = new Array(LEN).fill('absent');
    const remaining = {};
    for (let i = 0; i < LEN; i++) {
      if (guess[i] === secret[i]) status[i] = 'exact';
      else remaining[secret[i]] = (remaining[secret[i]] || 0) + 1;
    }
    for (let i = 0; i < LEN; i++) {
      if (status[i] === 'exact') continue;
      const d = guess[i];
      if (remaining[d] > 0) { status[i] = 'present'; remaining[d]--; }
    }
    return status;
  }

  function renderBoard() {
    if (!guesses.length) { board.innerHTML = '<div class="cb-empty">// enter a 4-digit guess to begin</div>'; return; }
    board.innerHTML = guesses.map((g) => `
      <div class="cb-row">
        <span class="cb-guess">${g.guess.map((d, i) =>
          `<span class="cb-cell ${g.status[i]}">${d}</span>`).join('')}</span>
      </div>`).join('');
  }

  function clearInputs(focus) {
    inputs.forEach((i) => { i.value = ''; i.disabled = !active; });
    if (focus && active) inputs[0].focus();
  }

  function newGame() {
    // Unique digits (no repeats) — keeps the peg feedback intuitive to deduce.
    const pool = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
    for (let i = pool.length - 1; i > 0; i--) {
      const j = (Math.random() * (i + 1)) | 0;
      [pool[i], pool[j]] = [pool[j], pool[i]];
    }
    secret = pool.slice(0, LEN);
    guesses = []; active = true;
    idle.hidden = true; over.hidden = true;
    triesEl.textContent = '0';
    guessNumEl.textContent = '1';
    renderBoard();
    clearInputs(true);
  }

  function submitGuess() {
    if (!active) return;
    const guess = inputs.map((i) => i.value.trim());
    if (!guess.every((d) => /^[0-9]$/.test(d))) {
      inputs.forEach((i) => { if (!/^[0-9]$/.test(i.value.trim())) i.style.borderColor = 'var(--red)'; });
      setTimeout(() => inputs.forEach((i) => (i.style.borderColor = '')), 500);
      return;
    }
    const g = guess.map(Number);
    const status = evaluate(g);
    guesses.push({ guess: g, status });
    triesEl.textContent = guesses.length;
    renderBoard();

    if (status.every((s) => s === 'exact')) return win();
    if (guesses.length >= MAX) return lose();

    guessNumEl.textContent = guesses.length + 1;
    clearInputs(true);
  }

  function win() {
    active = false;
    clearInputs(false);
    const n = guesses.length;
    const prev = loadBest('game_cb_best');
    const better = !prev || n < prev;
    if (better) { saveBest('game_cb_best', n); bestEl.textContent = n; }
    overTitle.textContent = 'Access granted';
    result.textContent = `Cracked in ${n} ${n === 1 ? 'try' : 'tries'}${better ? ' — new best!' : ''}`;
    over.hidden = false;
  }

  function lose() {
    active = false;
    clearInputs(false);
    overTitle.textContent = 'Locked out';
    result.textContent = `Out of guesses. The code was ${secret.join(' ')}.`;
    over.hidden = false;
  }

  // input UX: auto-advance, backspace to previous, Enter to submit
  inputs.forEach((input, idx) => {
    input.addEventListener('input', () => {
      input.value = input.value.replace(/[^0-9]/g, '').slice(0, 1);
      if (input.value && idx < LEN - 1) inputs[idx + 1].focus();
    });
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Backspace' && !input.value && idx > 0) inputs[idx - 1].focus();
      else if (e.key === 'Enter') { e.preventDefault(); submitGuess(); }
    });
  });

  $('cbGuess').addEventListener('click', submitGuess);
  $('cbStart').addEventListener('click', newGame);
  $('cbRestart').addEventListener('click', newGame);
  clearInputs(false);
})();

/* ================================================================
   GAME 3 — SEQUENCE (Simon-style memory)
================================================================ */
(function sequenceGame() {
  const grid = $('seqGrid');
  if (!grid) return;

  const SIZE = 9;   // 3x3 keypad
  const roundEl = $('seqRound'), bestEl = $('seqBest'), statusEl = $('seqStatus');
  const idle = $('seqIdle'), over = $('seqOver'), result = $('seqResult');

  let sequence, inputIdx, playing, accepting, tiles;

  bestEl.textContent = loadBest('game_seq_best');

  function buildTiles() {
    grid.innerHTML = '';
    tiles = [];
    for (let i = 0; i < SIZE; i++) {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'seq-tile';
      b.dataset.i = i;
      b.addEventListener('click', () => onTile(i));
      grid.appendChild(b);
      tiles.push(b);
    }
  }

  const wait = (ms) => new Promise((r) => setTimeout(r, ms));
  const lit = (i, on) => tiles[i].classList.toggle('lit', on);

  async function playSequence() {
    accepting = false;
    statusEl.textContent = 'Watch the pattern...';
    await wait(500);
    const dur = Math.max(230, 520 - sequence.length * 16);   // speeds up as it grows
    for (const i of sequence) {
      lit(i, true);
      await wait(dur);
      lit(i, false);
      await wait(Math.max(110, dur * 0.4));
    }
    accepting = true;
    inputIdx = 0;
    statusEl.textContent = 'Your turn — repeat it';
  }

  function nextRound() {
    sequence.push((Math.random() * SIZE) | 0);
    roundEl.textContent = sequence.length;
    playSequence();
  }

  function onTile(i) {
    if (!playing || !accepting) return;
    lit(i, true);
    setTimeout(() => lit(i, false), 150);

    if (i === sequence[inputIdx]) {
      inputIdx++;
      if (inputIdx === sequence.length) {
        accepting = false;
        statusEl.textContent = 'Correct';
        setTimeout(nextRound, 650);
      }
    } else {
      lose();
    }
  }

  function start() {
    sequence = []; playing = true; accepting = false;
    idle.hidden = true; over.hidden = true;
    roundEl.textContent = '0';
    nextRound();
  }

  function lose() {
    playing = false; accepting = false;
    statusEl.textContent = 'Wrong key';
    tiles.forEach((t) => t.classList.add('bad'));
    setTimeout(() => tiles.forEach((t) => t.classList.remove('bad')), 420);

    const score = Math.max(0, sequence.length - 1);   // fully-repeated rounds
    const prev = loadBest('game_seq_best');
    const better = score > prev;
    if (better) saveBest('game_seq_best', score);
    bestEl.textContent = Math.max(prev, score);
    result.textContent = `You recalled a sequence of ${score}${better && score > 0 ? ' — new best!' : '.'}`;
    over.hidden = false;
  }

  $('seqStart').addEventListener('click', start);
  $('seqRestart').addEventListener('click', start);
  buildTiles();   // render the keypad behind the idle overlay
})();

/* ================================================================
   GAME 5 — KILL SWITCH (Lights Out puzzle)
================================================================ */
(function killSwitch() {
  const grid = $('ksGrid');
  if (!grid) return;

  const SIZE = 5, N = SIZE * SIZE;
  const movesEl = $('ksMoves'), bestEl = $('ksBest'), litEl = $('ksLit');
  const idle = $('ksIdle'), over = $('ksOver'), result = $('ksResult');

  let cells, moves, playing;

  const prevBest = loadBest('game_ks_best');
  bestEl.textContent = prevBest ? prevBest : '—';

  const idx = (r, c) => r * SIZE + c;

  // A press toggles the node and its 4 orthogonal neighbours
  function applyToggle(i) {
    const r = (i / SIZE) | 0, c = i % SIZE;
    cells[i] = !cells[i];
    if (r > 0) cells[idx(r - 1, c)] = !cells[idx(r - 1, c)];
    if (r < SIZE - 1) cells[idx(r + 1, c)] = !cells[idx(r + 1, c)];
    if (c > 0) cells[idx(r, c - 1)] = !cells[idx(r, c - 1)];
    if (c < SIZE - 1) cells[idx(r, c + 1)] = !cells[idx(r, c + 1)];
  }

  // Scramble from the all-off state with random presses => always solvable
  function scramble() {
    cells = new Array(N).fill(false);
    const steps = 6 + ((Math.random() * 5) | 0);
    for (let s = 0; s < steps; s++) applyToggle((Math.random() * N) | 0);
    if (cells.every((v) => !v)) applyToggle((Math.random() * N) | 0);
  }

  function litCount() { return cells.filter(Boolean).length; }

  function render() {
    grid.innerHTML = cells
      .map((on, i) => `<button type="button" class="ks-tile${on ? ' on' : ''}" data-i="${i}"></button>`)
      .join('');
    if (litEl) litEl.textContent = litCount();
  }

  function press(i) {
    if (!playing) return;
    applyToggle(i);
    moves++;
    movesEl.textContent = moves;
    render();
    if (litCount() === 0) win();
  }

  function newGame() {
    scramble();
    moves = 0; playing = true;
    movesEl.textContent = '0';
    idle.hidden = true; over.hidden = true;
    render();
  }

  function win() {
    playing = false;
    const prev = loadBest('game_ks_best');
    const better = !prev || moves < prev;
    if (better) saveBest('game_ks_best', moves);
    bestEl.textContent = better ? moves : prev;
    result.textContent = `All nodes down in ${moves} move${moves === 1 ? '' : 's'}${better ? ' — new best!' : ''}`;
    over.hidden = false;
  }

  grid.addEventListener('click', (e) => {
    const b = e.target.closest('.ks-tile');
    if (b) press(+b.dataset.i);
  });
  $('ksStart').addEventListener('click', newGame);
  $('ksRestart').addEventListener('click', newGame);

  scramble(); render();   // show a board behind the idle overlay
})();

/* ================================================================
   GAME 4 — AIM TRAINER (FPS-style target range, desktop only)
================================================================ */
(function aimTrainer() {
  const stage = $('aimStage');
  if (!stage) return;

  const crosshair = $('aimCrosshair');
  const scoreEl = $('aimScore'), accEl = $('aimAcc'), timeEl = $('aimTime'), bestEl = $('aimBest');
  const idle = $('aimIdle'), over = $('aimOver'), result = $('aimResult'), mobile = $('aimMobile');

  bestEl.textContent = loadBest('game_aim_best');

  // Mouse aiming only — block coarse-pointer (touch) devices with a notice
  if (window.matchMedia('(pointer: coarse)').matches) {
    if (mobile) mobile.hidden = false;
    if (idle) idle.hidden = true;
    return;
  }

  const DURATION = 30;
  let score, shots, hits, combo, timeLeft, running, spawnTimer, clockTimer;

  // Crosshair follows the mouse inside the range
  stage.addEventListener('mousemove', (e) => {
    const r = stage.getBoundingClientRect();
    crosshair.style.left = (e.clientX - r.left) + 'px';
    crosshair.style.top = (e.clientY - r.top) + 'px';
    crosshair.style.display = 'block';
  });
  stage.addEventListener('mouseleave', () => { crosshair.style.display = 'none'; });
  stage.addEventListener('contextmenu', (e) => e.preventDefault());

  function clearTargets() {
    stage.querySelectorAll('.target, .float-score').forEach((el) => el.remove());
  }

  function spawnTarget() {
    if (!running) return;
    const size = 32 + (Math.random() * 46) | 0;          // 32–78px (smaller = harder = more points)
    const pad = size / 2 + 6;
    const x = pad + Math.random() * (stage.clientWidth - pad * 2);
    const y = pad + Math.random() * (stage.clientHeight - pad * 2);

    const t = document.createElement('button');
    t.type = 'button';
    t.className = 'target';
    t.style.cssText = `left:${x}px;top:${y}px;width:${size}px;height:${size}px;`;
    t.dataset.size = size;
    t.innerHTML = '<span class="target-head"></span>';
    stage.appendChild(t);

    const lifetime = Math.max(680, 1300 - (DURATION - timeLeft) * 22);
    t._life = setTimeout(() => { t.remove(); }, lifetime);
  }

  function floatText(x, y, text, head) {
    const f = document.createElement('div');
    f.className = 'float-score' + (head ? ' head' : '');
    f.textContent = text;
    f.style.left = x + 'px';
    f.style.top = y + 'px';
    stage.appendChild(f);
    setTimeout(() => f.remove(), 600);
  }

  function updateAcc() {
    accEl.textContent = (shots ? Math.round((hits / shots) * 100) : 100) + '%';
  }

  stage.addEventListener('mousedown', (e) => {
    if (!running || e.button !== 0) return;
    shots++;
    const t = e.target.closest('.target');
    if (t) {
      const isHead = !!e.target.closest('.target-head');
      hits++; combo++;
      const size = parseFloat(t.dataset.size);
      let base = Math.max(20, Math.round(110 - size));   // smaller target -> more points
      if (isHead) base = base * 2 + 25;
      const mult = 1 + Math.min(combo, 10) * 0.1;
      const gained = Math.round(base * mult);
      score += gained;
      scoreEl.textContent = score;

      const r = stage.getBoundingClientRect();
      floatText(e.clientX - r.left, e.clientY - r.top, (isHead ? 'HEAD +' : '+') + gained, isHead);
      clearTimeout(t._life);
      t.remove();
    } else {
      combo = 0;   // missed shot breaks the combo
    }
    updateAcc();
  });

  function start() {
    score = 0; shots = 0; hits = 0; combo = 0; timeLeft = DURATION; running = true;
    scoreEl.textContent = '0';
    accEl.textContent = '100%';
    timeEl.textContent = DURATION;
    idle.hidden = true; over.hidden = true;
    clearTargets();
    spawnTarget();
    spawnTimer = setInterval(spawnTarget, 640);
    clockTimer = setInterval(() => {
      timeLeft -= 1;
      timeEl.textContent = Math.max(0, timeLeft);
      if (timeLeft <= 0) end();
    }, 1000);
  }

  function end() {
    running = false;
    clearInterval(spawnTimer);
    clearInterval(clockTimer);
    clearTargets();
    const acc = shots ? Math.round((hits / shots) * 100) : 0;
    const prev = loadBest('game_aim_best');
    const better = score > prev;
    if (better) saveBest('game_aim_best', score);
    bestEl.textContent = Math.max(prev, score);
    result.textContent = `Score ${score} · ${acc}% accuracy · ${hits}/${shots} hits${better && score > 0 ? ' — new best!' : ''}`;
    over.hidden = false;
  }

  $('aimStart').addEventListener('click', start);
  $('aimRestart').addEventListener('click', start);
})();
