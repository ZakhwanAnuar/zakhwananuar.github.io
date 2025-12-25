(() => {
  const $ = (q, el=document) => el.querySelector(q);
  const $$ = (q, el=document) => Array.from(el.querySelectorAll(q));

  // footer year
  $("#year").textContent = new Date().getFullYear();

  // terminal mode toggle (minimal, like a “theme switch”)
  const modeBtn = $("#modeBtn");
  const key = "zk_terminal_mode";
  const saved = localStorage.getItem(key);

  if (saved === "on") {
    document.body.classList.add("terminal");
    modeBtn.setAttribute("aria-pressed", "true");
    modeBtn.textContent = "terminal: on";
  }

  modeBtn.addEventListener("click", () => {
    const on = document.body.classList.toggle("terminal");
    modeBtn.setAttribute("aria-pressed", String(on));
    modeBtn.textContent = on ? "terminal: on" : "terminal: off";
    localStorage.setItem(key, on ? "on" : "off");
  });

  // WRITE-UP MODAL
  const modal = $("#modal");
  const mTitle = $("#mTitle");
  const mCategory = $("#mCategory");
  const mDifficulty = $("#mDifficulty");
  const mBody = $("#mBody");

  let lastFocus = null;

  function openModal(fromBtn) {
    lastFocus = document.activeElement;

    mTitle.textContent = fromBtn.dataset.title || "write-up";
    mCategory.textContent = (fromBtn.dataset.category || "").toLowerCase();
    mDifficulty.textContent = (fromBtn.dataset.difficulty || "").toLowerCase();
    mBody.innerHTML = fromBtn.dataset.body || "<p class='dim'>No content yet.</p>";

    modal.classList.add("is-open");
    modal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";

    // focus close button for accessibility
    const closeBtn = modal.querySelector("[data-close]");
    closeBtn && closeBtn.focus();
  }

  function closeModal() {
    modal.classList.remove("is-open");
    modal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";

    if (lastFocus && typeof lastFocus.focus === "function") lastFocus.focus();
  }

  // open from cards
  $$(".wcard").forEach(btn => {
    btn.addEventListener("click", () => openModal(btn));
  });

  // close from backdrop or close button
  modal.addEventListener("click", (e) => {
    if (e.target.matches("[data-close]")) closeModal();
  });

  // esc closes
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && modal.classList.contains("is-open")) closeModal();
  });

  // close if clicking backdrop
  modal.addEventListener("mousedown", (e) => {
    if (e.target.classList.contains("modal__backdrop")) closeModal();
  });
})();
