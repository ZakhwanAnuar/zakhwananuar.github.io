const modal = document.querySelector(".modal");
const modalTitle = document.getElementById("modalTitle");
const modalBody = document.getElementById("modalBody");

document.querySelectorAll(".item").forEach(btn => {
  btn.addEventListener("click", () => {
    modalTitle.textContent = `$ ${btn.dataset.title}`;
    modalBody.innerHTML = btn.dataset.body;
    modal.classList.add("show");
    modal.setAttribute("aria-hidden", "false");
  });
});

function closeModal() {
  modal.classList.remove("show");
  modal.setAttribute("aria-hidden", "true");
}

modal.querySelector(".close").onclick = closeModal;
modal.querySelector(".backdrop").onclick = closeModal;

document.addEventListener("keydown", e => {
  if (e.key === "Escape") closeModal();
});
