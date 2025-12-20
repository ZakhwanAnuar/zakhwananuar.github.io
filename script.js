// script.js
function toggleCtfGroup(groupId, headerEl) {
  const challenges = document.getElementById(groupId);
  const toggleIcon = headerEl?.querySelector(".ctf-toggle");
  if (!challenges) return;

  const isHidden = getComputedStyle(challenges).display === "none";
  challenges.style.display = isHidden ? "block" : "none";
  if (toggleIcon) toggleIcon.textContent = isHidden ? "▼" : "▶";
}

function toggleTheme() {
  const body = document.body;
  const themeToggle = document.querySelector(".theme-toggle");

  const isLight = body.classList.toggle("light-theme");
  if (themeToggle) themeToggle.textContent = isLight ? "☀️" : "🌙";
  localStorage.setItem("theme", isLight ? "light" : "dark");
}

function toggleSidebar() {
  const body = document.body;
  const sidebar = document.querySelector(".sidebar");
  const overlay = document.querySelector(".sidebar-overlay");
  const burger = document.querySelector(".burger-toggle");
  if (!sidebar || !overlay) return;

  const open = sidebar.classList.toggle("sidebar-open");
  overlay.classList.toggle("overlay-visible", open);
  if (burger) burger.setAttribute("aria-expanded", open ? "true" : "false");
  body.classList.toggle("nav-open", open);
}

function closeSidebar() {
  const body = document.body;
  const sidebar = document.querySelector(".sidebar");
  const overlay = document.querySelector(".sidebar-overlay");
  const burger = document.querySelector(".burger-toggle");

  if (sidebar) sidebar.classList.remove("sidebar-open");
  if (overlay) overlay.classList.remove("overlay-visible");
  if (burger) burger.setAttribute("aria-expanded", "false");
  body.classList.remove("nav-open");
}

// Load saved theme + UX helpers
document.addEventListener("DOMContentLoaded", () => {
  const savedTheme = localStorage.getItem("theme");
  const themeToggle = document.querySelector(".theme-toggle");

  if (savedTheme === "light") {
    document.body.classList.add("light-theme");
    if (themeToggle) themeToggle.textContent = "☀️";
  }

  // Close sidebar on Escape
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeSidebar();
  });

  // Close sidebar when clicking a link inside it (mobile)
  document.addEventListener("click", (e) => {
    const link = e.target.closest(".sidebar a");
    if (link) closeSidebar();
  });
});
