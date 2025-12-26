/* =========================
   Helpers
========================= */
const qs = (s, el = document) => el.querySelector(s);
const qsa = (s, el = document) => [...el.querySelectorAll(s)];

const isReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* =========================
   Year
========================= */
qs("#year").textContent = String(new Date().getFullYear());

/* =========================
   Smooth-scroll offset for sticky header
========================= */
(function setupAnchorScroll() {
  const header = qs(".header");
  const headerH = () => header?.getBoundingClientRect().height ?? 0;

  qsa('a[href^="#"]').forEach((a) => {
    a.addEventListener("click", (e) => {
      const href = a.getAttribute("href");
      if (!href || href === "#") return;
      const target = qs(href);
      if (!target) return;

      e.preventDefault();
      const top = window.scrollY + target.getBoundingClientRect().top - headerH() - 10;

      window.scrollTo({
        top,
        behavior: isReducedMotion ? "auto" : "smooth",
      });
    });
  });
})();

/* =========================
   Custom Cursor (ring + trailing dot)
   - Disabled automatically on coarse pointers
========================= */
(function setupCursor() {
  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  if (!finePointer) return;

  const cursor = qs(".cursor");
  const ring = qs(".cursor__ring");
  const dot = qs(".cursor__dot");

  let mx = window.innerWidth / 2;
  let my = window.innerHeight / 2;

  // Render positions (smoothed)
  let rx = mx,
    ry = my;
  let dx = mx,
    dy = my;

  // Tweak these for feel (lower = more lag)
  const ringEase = 0.18;
  const dotEase = 0.30;

  const setPos = (el, x, y) => {
    el.style.transform = `translate3d(${x}px, ${y}px, 0) translate3d(-50%, -50%, 0)`;
  };

  window.addEventListener(
    "mousemove",
    (e) => {
      mx = e.clientX;
      my = e.clientY;
    },
    { passive: true }
  );

  // Expand ring on interactive elements
  const hoverables = "a, button, .identity, .filter, [role='button']";
  document.addEventListener(
    "pointerover",
    (e) => {
      if (e.target.closest(hoverables)) document.body.classList.add("cursor-hover");
    },
    { passive: true }
  );
  document.addEventListener(
    "pointerout",
    (e) => {
      if (e.target.closest(hoverables)) document.body.classList.remove("cursor-hover");
    },
    { passive: true }
  );

  // Animation loop
  function tick() {
    rx += (mx - rx) * ringEase;
    ry += (my - ry) * ringEase;

    dx += (mx - dx) * dotEase;
    dy += (my - dy) * dotEase;

    setPos(ring, rx, ry);
    setPos(dot, dx, dy);

    requestAnimationFrame(tick);
  }

  cursor.style.opacity = "1";
  requestAnimationFrame(tick);
})();

/* =========================
   Magnetic Buttons
   - Subtle and lightweight
========================= */
(function setupMagnetics() {
  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  const items = qsa('[data-magnetic="true"]');

  // Keep it simple on touch devices
  if (!finePointer) return;

  items.forEach((el) => {
    let bounds = null;

    const strength = el.classList.contains("btn--primary") ? 0.22 : 0.18;
    const lift = 2.5;

    const onEnter = () => {
      bounds = el.getBoundingClientRect();
      el.style.transition = "transform 120ms cubic-bezier(0.2, 0.8, 0.2, 1)";
    };

    const onMove = (e) => {
      if (!bounds) return;
      const x = e.clientX - bounds.left - bounds.width / 2;
      const y = e.clientY - bounds.top - bounds.height / 2;

      const tx = x * strength;
      const ty = y * strength - lift;

      el.style.transform = `translate3d(${tx}px, ${ty}px, 0)`;
    };

    const onLeave = () => {
      bounds = null;
      el.style.transition = "transform 260ms cubic-bezier(0.2, 0.8, 0.2, 1)";
      el.style.transform = "translate3d(0,0,0)";
    };

    el.addEventListener("mouseenter", onEnter);
    el.addEventListener("mousemove", onMove);
    el.addEventListener("mouseleave", onLeave);
  });
})();

/* =========================
   Write-up filtering
========================= */
(function setupWriteupFilter() {
  const buttons = qsa(".filter");
  const cards = qsa(".writeup");

  const setActive = (btn) => {
    buttons.forEach((b) => b.classList.toggle("is-active", b === btn));
  };

  const apply = (cat) => {
    cards.forEach((c) => {
      const ok = cat === "all" || c.dataset.cat === cat;
      c.hidden = !ok;
    });
  };

  buttons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const cat = btn.dataset.filter || "all";
      setActive(btn);
      apply(cat);
    });
  });
})();

/* =========================
   Hacker Mode Toggle (Identity element)
   - Glitch transition (GSAP if available, else CSS class toggle)
========================= */
(function setupHackerToggle() {
  const identity = qs("#identity");
  const modeHint = qs("#modeHint");

  const toggle = () => {
    const body = document.body;
    const next = !body.classList.contains("mode-hacker");

    // Optional: flip between green/amber by holding Alt while toggling
    if (next && window.event && window.event.altKey) {
      body.setAttribute("data-hacker", "amber");
    } else if (next) {
      body.setAttribute("data-hacker", "green");
    }

    // If GSAP exists, do a quick “glitch” flash without layout changes
    if (window.gsap && !isReducedMotion) {
      const tl = gsap.timeline({ defaults: { ease: "power2.out" } });

      // A tiny “signal drop” effect via opacity + x jitter
      tl.to("main", { duration: 0.08, opacity: 0.65 })
        .to("main", { duration: 0.06, x: 6 })
        .to("main", { duration: 0.06, x: -6 })
        .to("main", { duration: 0.06, x: 4 })
        .to("main", { duration: 0.06, x: 0, opacity: 1 })
        .add(() => {
          body.classList.toggle("mode-hacker", next);
          // ensure opacity ends clean
        }, 0.10);
    } else {
      body.classList.toggle("mode-hacker", next);
    }

    modeHint.textContent = next ? "Identity Mode: Changed" : "Identity Mode: Clean";
  };

  const onKey = (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      toggle();
    }
  };

  identity.addEventListener("click", toggle);
  identity.addEventListener("keydown", onKey);

  // Button in header also toggles (same behavior)
  modeHint.addEventListener("click", toggle);
})();
