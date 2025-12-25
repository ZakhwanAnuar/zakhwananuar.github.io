/* Magnetic Cursor */
const cursor = document.querySelector(".cursor");

document.addEventListener("mousemove", (e) => {
  cursor.style.left = `${e.clientX}px`;
  cursor.style.top = `${e.clientY}px`;
});

document.querySelectorAll("a, button").forEach(el => {
  el.addEventListener("mouseenter", () => {
    cursor.style.transform = "translate(-50%, -50%) scale(1.8)";
  });
  el.addEventListener("mouseleave", () => {
    cursor.style.transform = "translate(-50%, -50%) scale(1)";
  });
});

/* Copy Button */
const copyBtn = document.querySelector(".copy-btn");

copyBtn.addEventListener("click", () => {
  navigator.clipboard.writeText(copyBtn.dataset.copy);
  copyBtn.classList.add("copied");
  copyBtn.textContent = "Copied!";
  setTimeout(() => {
    copyBtn.classList.remove("copied");
    copyBtn.textContent = "Copy Discord";
  }, 1500);
});

/* GSAP Animations */
gsap.from(".hero-content > *", {
  opacity: 0,
  y: 30,
  duration: 0.8,
  stagger: 0.15,
  ease: "power3.out"
});

gsap.from(".card", {
  opacity: 0,
  y: 40,
  duration: 0.8,
  stagger: 0.2,
  scrollTrigger: {
    trigger: ".bento",
    start: "top 80%"
  }
});
