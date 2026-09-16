/* ================================================================
   fps.js — Breach Point: a small original first-person shooter.
   WASD to move, mouse to look (pointer lock), click to shoot the
   intruder drones before they reach you. Desktop / mouse only.
   Built on three.js (global THREE, loaded before this file).
   All geometry is original primitive shapes — no external models.
================================================================ */
(function breachPoint() {
  const canvas = document.getElementById('fpsCanvas');
  if (!canvas) return;

  const el = (id) => document.getElementById(id);
  const scoreEl = el('fpsScore'), timeEl = el('fpsTime'), healthEl = el('fpsHealth'), bestEl = el('fpsBest');
  const idle = el('fpsIdle'), over = el('fpsOver'), paused = el('fpsPaused'), mobile = el('fpsMobile');
  const result = el('fpsResult'), overTitle = el('fpsOverTitle');
  const crosshair = el('fpsCrosshair');

  function best() { try { return parseInt(localStorage.getItem('game_fps_best'), 10) || 0; } catch (e) { return 0; } }
  function saveBest(v) { try { localStorage.setItem('game_fps_best', String(v)); } catch (e) {} }
  bestEl.textContent = best();

  // Guards: desktop only, and three.js must be present
  if (window.matchMedia('(pointer: coarse)').matches) { if (mobile) mobile.hidden = false; if (idle) idle.hidden = true; return; }
  if (typeof THREE === 'undefined') {
    idle.querySelector('p').textContent = 'The 3D engine failed to load. Check your connection and refresh.';
    idle.querySelector('button').style.display = 'none';
    return;
  }

  /* ---------- constants ---------- */
  const ARENA = 24;          // half extent of the floor
  const SPEED = 7.5;         // player units / sec
  const ENEMY_SPEED = 2.4;
  const MAX_ENEMIES = 6;
  const SPAWN_EVERY = 1.0;   // seconds
  const ROUND_TIME = 60;
  const BREACH_DIST = 1.7;
  const EYE = 1.6;

  /* ---------- three.js setup ---------- */
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x0a0c10);
  scene.fog = new THREE.Fog(0x0a0c10, 12, 55);

  const camera = new THREE.PerspectiveCamera(78, 16 / 9, 0.1, 200);
  camera.rotation.order = 'YXZ';

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  function resize() {
    const w = canvas.clientWidth, h = canvas.clientHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  window.addEventListener('resize', resize);

  // lights
  scene.add(new THREE.HemisphereLight(0xbfe6ff, 0x0a0c10, 0.85));
  const key = new THREE.DirectionalLight(0x9fd8ff, 0.7);
  key.position.set(6, 12, 4);
  scene.add(key);

  // floor + grid
  const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(ARENA * 2, ARENA * 2),
    new THREE.MeshStandardMaterial({ color: 0x11151c, roughness: 1 })
  );
  floor.rotation.x = -Math.PI / 2;
  scene.add(floor);
  const grid = new THREE.GridHelper(ARENA * 2, ARENA * 2, 0x00d9ff, 0x1e2a3a);
  grid.material.opacity = 0.28; grid.material.transparent = true;
  scene.add(grid);

  // boundary walls
  const wallMat = new THREE.MeshStandardMaterial({ color: 0x161b24, roughness: 0.9 });
  const wallGeo = new THREE.BoxGeometry(ARENA * 2, 4, 0.5);
  const wallDefs = [[0, -ARENA, 0], [0, ARENA, 0], [-ARENA, 0, Math.PI / 2], [ARENA, 0, Math.PI / 2]];
  wallDefs.forEach(([x, z, ry]) => {
    const w = new THREE.Mesh(wallGeo, wallMat);
    w.position.set(x, 2, z); w.rotation.y = ry; scene.add(w);
  });

  // a few cover pillars (visual + cosmetic)
  const pillarMat = new THREE.MeshStandardMaterial({ color: 0x1c2333, roughness: 0.8 });
  [[8, 6], [-9, 4], [5, -10], [-7, -8], [0, 12], [12, -3]].forEach(([x, z]) => {
    const p = new THREE.Mesh(new THREE.BoxGeometry(2, 3, 2), pillarMat);
    p.position.set(x, 1.5, z); scene.add(p);
  });

  // simple weapon viewmodel (original abstract blaster: a couple of boxes)
  const gun = new THREE.Group();
  const bodyMat = new THREE.MeshStandardMaterial({ color: 0x0f1117, roughness: 0.6, metalness: 0.3 });
  const gBody = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.2, 0.5), bodyMat);
  const gBarrel = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.07, 0.6), bodyMat);
  gBarrel.position.set(0, 0.04, -0.45);
  const gGlow = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.03, 0.2),
    new THREE.MeshBasicMaterial({ color: 0x00d9ff }));
  gGlow.position.set(0, 0.04, -0.2);
  gun.add(gBody, gBarrel, gGlow);
  gun.position.set(0.32, -0.28, -0.7);
  camera.add(gun);
  scene.add(camera);

  // muzzle flash light
  const flash = new THREE.PointLight(0x00d9ff, 0, 6);
  camera.add(flash);
  flash.position.set(0.32, -0.24, -1.1);

  /* ---------- state ---------- */
  const player = { x: 0, z: 0, yaw: 0, pitch: 0 };
  const keys = {};
  const enemies = [];
  const raycaster = new THREE.Raycaster();
  const clock = new THREE.Clock();
  let running = false, locked = false, score = 0, health = 100, timeLeft = ROUND_TIME;
  let spawnAcc = 0, timeAcc = 0, gunBob = 0;

  const enemyGeo = new THREE.OctahedronGeometry(0.6, 0);

  function spawnEnemy() {
    if (enemies.length >= MAX_ENEMIES) return;
    const ang = Math.random() * Math.PI * 2;
    const dist = 14 + Math.random() * 8;
    const x = Math.max(-ARENA + 2, Math.min(ARENA - 2, player.x + Math.cos(ang) * dist));
    const z = Math.max(-ARENA + 2, Math.min(ARENA - 2, player.z + Math.sin(ang) * dist));
    const mat = new THREE.MeshStandardMaterial({ color: 0xff4757, emissive: 0xff2233, emissiveIntensity: 0.6, roughness: 0.4 });
    const mesh = new THREE.Mesh(enemyGeo, mat);
    mesh.position.set(x, 1.3, z);
    scene.add(mesh);
    enemies.push({ mesh });
  }

  function removeEnemy(i) {
    const e = enemies[i];
    scene.remove(e.mesh);
    e.mesh.material.dispose();
    enemies.splice(i, 1);
  }

  function shoot() {
    raycaster.setFromCamera({ x: 0, y: 0 }, camera);
    const hit = raycaster.intersectObjects(enemies.map((e) => e.mesh))[0];
    // muzzle flash + recoil
    flash.intensity = 2.2;
    setTimeout(() => (flash.intensity = 0), 60);
    gun.position.z = -0.55;   // kick
    if (hit) {
      const i = enemies.findIndex((e) => e.mesh === hit.object);
      if (i >= 0) {
        const d = hit.distance;
        score += 100 + Math.round(Math.min(d, 25) * 4);   // farther = a bit more
        scoreEl.textContent = score;
        removeEnemy(i);
        crosshair.classList.add('hit');
        setTimeout(() => crosshair.classList.remove('hit'), 120);
      }
    }
  }

  function breach(i) {
    removeEnemy(i);
    health = Math.max(0, health - 20);
    healthEl.textContent = health;
    canvas.classList.add('hurt');
    setTimeout(() => canvas.classList.remove('hurt'), 250);
    if (health <= 0) end('breached');
  }

  /* ---------- input ---------- */
  canvas.addEventListener('mousedown', (e) => {
    if (!running) return;
    if (!locked) { canvas.requestPointerLock(); return; }
    if (e.button === 0) shoot();
  });
  canvas.addEventListener('contextmenu', (e) => e.preventDefault());

  document.addEventListener('pointerlockchange', () => {
    locked = document.pointerLockElement === canvas;
    if (running) {
      paused.hidden = locked;
      if (locked) clock.getDelta();   // drop the paused gap
    }
  });
  document.addEventListener('mousemove', (e) => {
    if (!locked) return;
    player.yaw -= e.movementX * 0.0022;
    player.pitch -= e.movementY * 0.0022;
    player.pitch = Math.max(-1.4, Math.min(1.4, player.pitch));
  });
  document.addEventListener('keydown', (e) => { keys[e.code] = true; });
  document.addEventListener('keyup', (e) => { keys[e.code] = false; });

  /* ---------- loop ---------- */
  function step(dt) {
    // look
    camera.rotation.y = player.yaw;
    camera.rotation.x = player.pitch;

    // movement (relative to yaw, on the ground plane)
    const fx = -Math.sin(player.yaw), fz = -Math.cos(player.yaw);   // forward
    const rx = Math.cos(player.yaw), rz = -Math.sin(player.yaw);    // right
    let mx = 0, mz = 0;
    if (keys['KeyW'] || keys['ArrowUp']) mz += 1;
    if (keys['KeyS'] || keys['ArrowDown']) mz -= 1;
    if (keys['KeyD'] || keys['ArrowRight']) mx += 1;
    if (keys['KeyA'] || keys['ArrowLeft']) mx -= 1;
    let dx = fx * mz + rx * mx, dz = fz * mz + rz * mx;
    const len = Math.hypot(dx, dz);
    let moving = false;
    if (len > 0) {
      dx /= len; dz /= len; moving = true;
      player.x = Math.max(-ARENA + 1, Math.min(ARENA - 1, player.x + dx * SPEED * dt));
      player.z = Math.max(-ARENA + 1, Math.min(ARENA - 1, player.z + dz * SPEED * dt));
    }
    camera.position.set(player.x, EYE, player.z);

    // gun recover + bob
    gun.position.z += (-0.7 - gun.position.z) * Math.min(1, dt * 12);
    gunBob += dt * (moving ? 9 : 3);
    gun.position.y = -0.28 + Math.sin(gunBob) * (moving ? 0.012 : 0.004);

    // enemies chase; breach on contact
    for (let i = enemies.length - 1; i >= 0; i--) {
      const m = enemies[i].mesh;
      let tx = player.x - m.position.x, tz = player.z - m.position.z;
      const d = Math.hypot(tx, tz);
      if (d < BREACH_DIST) { breach(i); continue; }
      tx /= d; tz /= d;
      m.position.x += tx * ENEMY_SPEED * dt;
      m.position.z += tz * ENEMY_SPEED * dt;
      m.rotation.y += dt * 2.2;
      m.rotation.x += dt * 1.6;
      m.material.emissiveIntensity = 0.5 + Math.sin(performance.now() * 0.006 + i) * 0.25;
    }

    // spawns
    spawnAcc += dt;
    if (spawnAcc >= SPAWN_EVERY) { spawnAcc = 0; spawnEnemy(); }

    // clock
    timeAcc += dt;
    if (timeAcc >= 1) { timeAcc -= 1; timeLeft -= 1; timeEl.textContent = Math.max(0, timeLeft); if (timeLeft <= 0) end('cleared'); }
  }

  function animate() {
    requestAnimationFrame(animate);
    const dt = Math.min(clock.getDelta(), 0.05);
    if (running && locked) step(dt);
    renderer.render(scene, camera);
  }

  /* ---------- game control ---------- */
  function clearEnemies() { while (enemies.length) removeEnemy(0); }

  function start() {
    clearEnemies();
    player.x = 0; player.z = 0; player.yaw = 0; player.pitch = 0;
    score = 0; health = 100; timeLeft = ROUND_TIME; spawnAcc = 0; timeAcc = 0;
    scoreEl.textContent = '0'; healthEl.textContent = '100'; timeEl.textContent = ROUND_TIME;
    idle.hidden = true; over.hidden = true; paused.hidden = true;
    for (let i = 0; i < 3; i++) spawnEnemy();
    running = true;
    resize();
    canvas.requestPointerLock();
  }

  function end(reason) {
    running = false;
    if (document.pointerLockElement === canvas) document.exitPointerLock();
    clearEnemies();
    const prev = best();
    const better = score > prev;
    if (better) saveBest(score);
    bestEl.textContent = Math.max(prev, score);
    overTitle.textContent = reason === 'breached' ? 'Overrun' : 'Round cleared';
    result.textContent = `Score ${score}${better && score > 0 ? ' — new best!' : ''}`;
    over.hidden = false;
    paused.hidden = true;
  }

  el('fpsStart').addEventListener('click', start);
  el('fpsRestart').addEventListener('click', start);
  el('fpsResume').addEventListener('click', () => canvas.requestPointerLock());

  resize();
  animate();
})();
