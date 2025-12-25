/* High-performance interactivity:
   - requestAnimationFrame cursor smoothing (60fps-friendly)
   - magnetic buttons (pointermove, no heavy loops)
   - hacker mode toggle with "glitch pulse"
   - writeup filtering
*/

(() => {
  const $ = (q, el = document) => el.querySelector(q);
  const $$ = (q, el = document) => Array.from(el.querySelectorAll(q));

  // ---- Footer Year
  $("#year").textContent = new Date().getFullYear();

  // ---- Reduced motion support
  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // -------------------------
  // Custom Cursor (Ring + trailing dot)
  // -------------------------
  const cursor = $(".cursor");
  const ring = $(".cursor__ring");
  const dot = $(".cursor__dot");

  // Disable custom cursor on touch devices
  const isCoarse = window.matchMedia("(hover: none) and (pointer: coarse)").matches;
  if (isCoarse) {
    cursor && (cursor.style.display = "none");
  } else {
    let mouseX = window.innerWidth * 0.5;
    let mouseY = window.innerHeight * 0.5;

    let ringX = mouseX, ringY = mouseY;
    let dotX = mouseX, dotY = mouseY;

    // trailing factors
    const ringLerp = 0.16;
    const dotLerp = 0.28;

    window.addEventListener("mousemove", (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    }, { passive: true });

    // Cursor hover state based on data-cursor
    const hoverables = $$("[data-cursor='hover']");
    hoverables.forEach(el => {
      el.addEventListener("mouseenter", () => document.body.classList.add("cursor-hover"), { passive: true });
      el.addEventListener("mouseleave", () => document.body.classList.remove("cursor-hover"), { passive: true });
    });

    function tick() {
      ringX += (mouseX - ringX) * ringLerp;
      ringY += (mouseY - ringY) * ringLerp;

      dotX += (mouseX - dotX) * dotLerp;
      dotY += (mouseY - dotY) * dotLerp;

      ring.style.transform = `translate3d(${ringX}px, ${ringY}px, 0) translate3d(-50%, -50%, 0)`;
      dot.style.transform  = `translate3d(${dotX}px, ${dotY}px, 0) translate3d(-50%, -50%, 0)`;

      requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  // -------------------------
  // Magnetic Buttons
  // -------------------------
  const magneticEls = $$(".magnetic");

  magneticEls.forEach((el) => {
    // Skip if reduced motion
    if (prefersReduced) return;

    const strength = 18;   // px of max pull
    const damp = 0.12;     // how quickly it follows
    let tx = 0, ty = 0;    // current transform
    let targetX = 0, targetY = 0;

    const glow = el.querySelector(".btn__glow");

    const rectOf = () => el.getBoundingClientRect();

    function onMove(e) {
      const r = rectOf();
      const mx = e.clientX - r.left;
      const my = e.clientY - r.top;

      // For glow hotspot
      if (glow) {
        el.style.setProperty("--mx", `${(mx / r.width) * 100}%`);
        el.style.setProperty("--my", `${(my / r.height) * 100}%`);
      }

      const cx = r.left + r.width / 2;
      const cy = r.top + r.height / 2;

      const dx = e.clientX - cx;
      const dy = e.clientY - cy;

      targetX = (dx / (r.width / 2)) * strength;
      targetY = (dy / (r.height / 2)) * strength;
    }

    function onEnter() {
      el.classList.add("magnetic--on");
      el.addEventListener("pointermove", onMove, { passive: true });
    }

    function onLeave() {
      el.classList.remove("magnetic--on");
      el.removeEventListener("pointermove", onMove);
      targetX = 0; targetY = 0;
    }

    el.addEventListener("pointerenter", onEnter, { passive: true });
    el.addEventListener("pointerleave", onLeave, { passive: true });

    // Smooth follow loop per element (lightweight)
    function follow() {
      tx += (targetX - tx) * damp;
      ty += (targetY - ty) * damp;
      el.style.transform = `translate3d(${tx}px, ${ty}px, 0)`;
      requestAnimationFrame(follow);
    }
    requestAnimationFrame(follow);
  });

  // -------------------------
  // Smooth-scroll with header offset (no jank)
  // -------------------------
  const header = $(".header");
  const headerOffset = () => (header ? header.getBoundingClientRect().height : 0);

  $$("a[href^='#']").forEach(a => {
    a.addEventListener("click", (e) => {
      const id = a.getAttribute("href");
      if (!id || id === "#" || id === "#top") return;

      const target = document.querySelector(id);
      if (!target) return;

      e.preventDefault();
      const y = target.getBoundingClientRect().top + window.scrollY - headerOffset() - 14;

      window.scrollTo({ top: y, behavior: prefersReduced ? "auto" : "smooth" });
    });
  });

  // -------------------------
  // Write-up filtering
  // -------------------------
  const chips = $$(".chip[data-filter]");
  const cards = $$(".wcard[data-cat]");

  function setActiveChip(next) {
    chips.forEach(c => c.classList.toggle("chip--active", c === next));
  }

  function filterCards(cat) {
    cards.forEach(card => {
      const match = cat === "all" || card.dataset.cat === cat;
      card.style.display = match ? "" : "none";
    });
  }

  chips.forEach(chip => {
    chip.addEventListener("click", () => {
      const cat = chip.dataset.filter || "all";
      setActiveChip(chip);
      filterCards(cat);
    });
  });

  // -------------------------
  // Hacker Mode Toggle (Identity Key + Decrypt button)
  // Glitch pulse: overlay flash + small jitter (GSAP if available, else CSS fallback)
  // -------------------------
  const body = document.body;
  const overlay = $(".glitch-overlay");
  const identityKey = $("#identityKey");
  const decryptBtn = $("#decryptBtn");
  const resetBtn = $("#resetBtn");

  function glitchPulse() {
    if (!overlay) return;

    // quick overlay flash (CSS)
    overlay.style.opacity = "1";
    overlay.style.transition = "opacity 120ms ease";
    setTimeout(() => overlay.style.opacity = "0", 180);

    // tiny layout-safe jitter on root (GSAP preferred)
    if (window.gsap && !prefersReduced) {
      gsap.fromTo(body,
        { x: 0, y: 0, filter: "none" },
        {
          duration: 0.22,
          x: () => (Math.random() * 10 - 5),
          y: () => (Math.random() * 10 - 5),
          repeat: 2,
          yoyo: true,
          ease: "steps(2)",
          onComplete: () => gsap.set(body, { x: 0, y: 0 })
        }
      );
    } else if (!prefersReduced) {
      // fallback: class-based jitter (layout-safe via translate)
      body.classList.add("jitter");
      setTimeout(() => body.classList.remove("jitter"), 320);
    }
  }

  // fallback jitter class styling (inline to avoid extra CSS file edits)
  const style = document.createElement("style");
  style.textContent = `
    .jitter { animation: jitter .28s steps(2) 2; }
    @keyframes jitter {
      0% { transform: translate3d(0,0,0); }
      25% { transform: translate3d(4px,-3px,0); }
      50% { transform: translate3d(-3px,4px,0); }
      100% { transform: translate3d(0,0,0); }
    }
  `;
  document.head.appendChild(style);

  function setHackerMode(on) {
    // glitch first, then toggle for a nicer "flip"
    glitchPulse();
    setTimeout(() => {
      body.classList.toggle("hacker-mode", !!on);
    }, prefersReduced ? 0 : 90);
  }

  function toggleHackerMode() {
    setHackerMode(!body.classList.contains("hacker-mode"));
  }

  function bindToggle(el) {
    if (!el) return;
    el.addEventListener("click", toggleHackerMode);
    el.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        toggleHackerMode();
      }
    });
  }

  bindToggle(identityKey);

  decryptBtn && decryptBtn.addEventListener("click", () => setHackerMode(true));
  resetBtn && resetBtn.addEventListener("click", () => setHackerMode(false));

  // Optional: if user navigates back to top brand, quick pulse (subtle polish)
  const brand = $(".brand");
  brand && brand.addEventListener("click", () => {
    if (!prefersReduced) glitchPulse();
  });
})();
