
  /* ================================================================
     SETUP
     1. Firebase project + Realtime Database + web config are already set.
     2. Realtime Database > Rules  ->  paste and Publish. This board is
        intentionally OPEN: anyone with the link can read AND write, no login.
        {
          "rules": {
            "board":       { ".read": true, ".write": true,
              "message": { ".validate": "newData.isString() && newData.val().length < 8000" } },
            "board_files": { ".read": true, ".write": true }
          }
        }
     NOTE: because it is open, anyone with the link (or a bot that finds it) can
     edit or wipe it. Don't put anything sensitive here. Keep the URL private.
     (Files stay off until you enable Storage on the Blaze plan and set
      FILES_ENABLED = true; its Storage rule would be `allow write: if true;`.)
     ================================================================ */

  const firebaseConfig = {
    apiKey: "AIzaSyBYyxKC5wceTfRYAkeBJU2D-vHNgIrP-Lg",
    authDomain: "website-807bc.firebaseapp.com",
    databaseURL: "https://website-807bc-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "website-807bc",
    storageBucket: "website-807bc.firebasestorage.app",
    messagingSenderId: "286779186002",
    appId: "1:286779186002:web:dc43dcf1c4d0718ff5b88b"
  };

  const MAX_LEN = 8000;
  const MAX_FILE = 200 * 1024 * 1024;   // 200 MB per file
  // Files need Firebase Storage (Blaze plan). Leave false to hide the upload UI.
  const FILES_ENABLED = false;

  (function board() {
    const $ = (id) => document.getElementById(id);
    const setup = $('bdSetup'), app = $('bdApp');

    const configured = firebaseConfig && firebaseConfig.apiKey && firebaseConfig.databaseURL;
    if (!configured || typeof firebase === 'undefined') { setup.hidden = false; return; }
    app.hidden = false;

    firebase.initializeApp(firebaseConfig);
    const db = firebase.database();
    const ref = db.ref('board');

    const view = $('bdView'), meta = $('bdMeta');
    const live = $('bdLive'), liveText = $('bdLiveText');
    const readWrap = $('bdReadWrap'), editWrap = $('bdEditWrap');
    const editor = $('bdEditor'), countEl = $('bdCount'), changed = $('bdChanged');
    const attachBtn = $('bdAttach'), fileInput = $('bdFileInput');
    const filesEl = $('bdFiles'), progress = $('bdProgress'), progressBar = $('bdProgressBar');

    let editing = false;
    let remoteMsg = '', remoteUpdated = 0, editBaseline = 0;
    let filesArr = [];

    const esc = (s) => String(s).replace(/[&<>"']/g, (c) =>
      ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
    const fmt = (ts) => ts ? new Date(ts).toLocaleString() : '';
    function humanSize(b) { if (b < 1024) return b + ' B'; if (b < 1048576) return (b / 1024).toFixed(1) + ' KB'; return (b / 1048576).toFixed(1) + ' MB'; }
    function fileIcon(t) {
      t = t || '';
      if (/image/.test(t)) return 'fa-file-image';
      if (/pdf/.test(t)) return 'fa-file-pdf';
      if (/zip|rar|7z|tar|gzip|compressed/.test(t)) return 'fa-file-zipper';
      if (/audio/.test(t)) return 'fa-file-audio';
      if (/video/.test(t)) return 'fa-file-video';
      if (/text|json|xml|csv|javascript/.test(t)) return 'fa-file-lines';
      return 'fa-file';
    }

    /* ---- message ---- */
    function renderRead() {
      if (remoteMsg) { view.textContent = remoteMsg; view.classList.remove('empty'); }
      else { view.textContent = '(empty — click Edit and be the first to write something)'; view.classList.add('empty'); }
      meta.textContent = remoteUpdated ? 'updated ' + fmt(remoteUpdated) : '';
    }
    ref.on('value', (snap) => {
      const v = snap.val() || {};
      remoteMsg = typeof v.message === 'string' ? v.message : '';
      remoteUpdated = v.updated || 0;
      live.classList.add('on'); liveText.textContent = 'live';
      renderRead();
      if (editing && remoteUpdated > editBaseline) changed.classList.add('show');
    }, () => { live.classList.remove('on'); liveText.textContent = 'offline'; });

    function enterEdit() {
      editing = true; editBaseline = remoteUpdated; changed.classList.remove('show');
      editor.value = remoteMsg; updateCount();
      readWrap.hidden = true; editWrap.hidden = false;
      editor.focus();
    }
    function exitEdit() { editing = false; editWrap.hidden = true; readWrap.hidden = false; }
    function updateCount() { countEl.textContent = editor.value.length + ' / ' + MAX_LEN; }

    $('bdEditBtn').addEventListener('click', enterEdit);
    editor.addEventListener('input', updateCount);
    $('bdSave').addEventListener('click', () => {
      ref.set({ message: editor.value.slice(0, MAX_LEN), updated: Date.now() })
        .then(exitEdit)
        .catch(() => alert('Could not save — check your database rules and connection.'));
    });
    $('bdCancel').addEventListener('click', exitEdit);

    /* ---- files ---- */
    function renderFiles() {
      if (!filesArr.length) { filesEl.innerHTML = '<div class="bd-files-empty">// no files yet</div>'; return; }
      filesEl.innerHTML = filesArr.map((f) => `
        <div class="bd-file">
          <i class="type fas ${fileIcon(f.type)}"></i>
          <div class="bd-file-main">
            <div class="bd-file-name">${esc(f.name)}</div>
            <div class="bd-file-meta">${humanSize(f.size || 0)} · ${fmt(f.updated)}</div>
          </div>
          <a class="bd-file-dl" href="${esc(f.url)}" target="_blank" rel="noopener" download title="Download"><i class="fas fa-download"></i></a>
          <button class="bd-file-del" data-k="${f.k}" aria-label="Delete file"><i class="fas fa-trash"></i></button>
        </div>`).join('');
    }

    if (FILES_ENABLED) {
      const filesRef = db.ref('board_files');
      const storage = firebase.storage();

      filesRef.on('value', (snap) => {
        const val = snap.val() || {};
        filesArr = Object.entries(val).map(([k, v]) => Object.assign({ k }, v)).sort((a, b) => b.updated - a.updated);
        renderFiles();
      });

      attachBtn.addEventListener('click', () => fileInput.click());
      fileInput.addEventListener('change', () => {
        const file = fileInput.files[0];
        if (!file) return;
        if (file.size > MAX_FILE) { alert('File too large (max ' + Math.round(MAX_FILE / 1048576) + ' MB).'); fileInput.value = ''; return; }
        const safe = file.name.replace(/[^\w.\-]+/g, '_');
        const path = 'board/' + Date.now() + '_' + safe;
        const task = storage.ref(path).put(file);
        progress.hidden = false; progressBar.style.width = '0%';
        task.on('state_changed',
          (s) => { progressBar.style.width = Math.round(s.bytesTransferred / s.totalBytes * 100) + '%'; },
          () => { progress.hidden = true; fileInput.value = ''; alert('Upload failed — check your Storage rules and connection.'); },
          () => {
            task.snapshot.ref.getDownloadURL().then((url) => {
              filesRef.push({ name: file.name, size: file.size, type: file.type || '', path, url, updated: Date.now() });
              progress.hidden = true; fileInput.value = '';
            });
          });
      });

      filesEl.addEventListener('click', (e) => {
        const del = e.target.closest('.bd-file-del');
        if (!del) return;
        const f = filesArr.find((x) => x.k === del.dataset.k);
        if (!f || !confirm('Delete "' + f.name + '" for everyone?')) return;
        if (f.path) storage.ref(f.path).delete().catch(() => {});
        filesRef.child(f.k).remove();
      });

      renderFiles();
    } else {
      const card = document.getElementById('bdFilesCard');
      if (card) card.hidden = true;
    }
  })();
  