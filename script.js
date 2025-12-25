/* Cursor Dot */
const dot = document.querySelector(".cursor-dot");
document.addEventListener("mousemove", e => {
  dot.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`;
});

/* Modal */
const modal = document.querySelector(".modal");
const title = document.getElementById("modalTitle");
const body = document.getElementById("modalBody");
const cat = document.getElementById("modalCategory");
const diff = document.getElementById("modalDifficulty");

document.querySelectorAll(".open-modal").forEach(btn => {
  btn.onclick = () => {
    title.textContent = btn.dataset.title;
    body.innerHTML = btn.dataset.content;
    cat.textContent = btn.dataset.category;
    diff.textContent = btn.dataset.difficulty;
    modal.classList.add("show");
    document.body.style.overflow = "hidden";
  };
});

document.querySelector(".modal__close").onclick = closeModal;
document.querySelector(".modal__backdrop").onclick = closeModal;

function closeModal() {
  modal.classList.remove("show");
  document.body.style.overflow = "";
}

/* Hacker Mode */
document.getElementById("toggleHacker").onclick = () => {
  document.body.classList.toggle("hacker-mode");
};
