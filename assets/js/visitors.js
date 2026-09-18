/* ================================================================
   VISITOR COUNTER  (Firebase Realtime Database)

   Reuses the same Firebase project as waklu.html (website-807bc).
   Counts one visit per browser session and shows the running total
   in any element with id="visitorCount".

   REQUIRED once, in Firebase Console > Realtime Database > Rules,
   add a "visits" node alongside the existing rules and Publish:

     "visits": { ".read": true, ".write": true }

   Full example rules block:
     {
       "rules": {
         "board":       { ".read": true, ".write": true },
         "board_files": { ".read": true, ".write": true },
         "visits":      { ".read": true, ".write": true }
       }
     }
   ================================================================ */
(function visitorCounter() {
  var firebaseConfig = {
    apiKey: "AIzaSyBYyxKC5wceTfRYAkeBJU2D-vHNgIrP-Lg",
    authDomain: "website-807bc.firebaseapp.com",
    databaseURL: "https://website-807bc-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "website-807bc",
    storageBucket: "website-807bc.firebasestorage.app",
    messagingSenderId: "286779186002",
    appId: "1:286779186002:web:dc43dcf1c4d0718ff5b88b"
  };

  var SDK = [
    "https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js",
    "https://www.gstatic.com/firebasejs/10.12.2/firebase-database-compat.js"
  ];

  function loadScript(src) {
    return new Promise(function (resolve, reject) {
      // Already present? (e.g. on waklu.html)
      if (document.querySelector('script[src="' + src + '"]')) return resolve();
      var s = document.createElement('script');
      s.src = src;
      s.onload = resolve;
      s.onerror = function () { reject(new Error('Failed to load ' + src)); };
      document.head.appendChild(s);
    });
  }

  function render(n) {
    document.querySelectorAll('#visitorCount, .visitorCount').forEach(function (el) {
      el.textContent = (typeof n === 'number' ? n.toLocaleString() : '—');
    });
  }

  function start() {
    if (typeof firebase === 'undefined') { render(null); return; }

    try {
      if (!firebase.apps || !firebase.apps.length) firebase.initializeApp(firebaseConfig);
    } catch (e) { render(null); return; }

    var ref = firebase.database().ref('visits/count');

    // Only count a visit once per browser session (survives page-to-page
    // navigation within the same tab, not repeated refreshes across days).
    var counted = false;
    try { counted = sessionStorage.getItem('visitCounted') === '1'; } catch (e) {}

    // Always show the current total.
    ref.on('value', function (snap) {
      render(snap.val() || 0);
    }, function () { render(null); });

    if (!counted) {
      ref.transaction(function (current) {
        return (current || 0) + 1;
      }, function (err) {
        if (!err) { try { sessionStorage.setItem('visitCounted', '1'); } catch (e) {} }
      });
    }
  }

  function boot() {
    if (typeof firebase !== 'undefined' && firebase.database) { start(); return; }
    Promise.all(SDK.map(loadScript)).then(start).catch(function () { render(null); });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
