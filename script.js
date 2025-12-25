// ===== CUSTOM CURSOR =====
const ring = document.querySelector(".cursor__ring");
const dot = document.querySelector(".cursor__dot");

document.addEventListener("mousemove", e => {
  ring.style.transform = `translate(${e.clientX-20}px,${e.clientY-20}px)`;
  dot.style.transform = `translate(${e.clientX}px,${e.clientY}px)`;
});

// ===== MODAL =====
const modal = document.getElementById("modal");
const title = document.getElementById("modalTitle");
const body = document.getElementById("modalBody");
const cat = document.getElementById("modalCategory");
const diff = document.getElementById("modalDifficulty");

document.querySelectorAll(".wcard__link").forEach(btn => {
  btn.onclick = () => {
    title.textContent = btn.dataset.title;
    body.innerHTML = btn.dataset.content;
    cat.textContent = btn.dataset.category;
    diff.textContent = btn.dataset.difficulty;
    modal.setAttribute("aria-hidden","false");
    document.body.style.overflow="hidden";
  };
});

modal.addEventListener("click", e=>{
  if(e.target.dataset.close!==undefined){
    modal.setAttribute("aria-hidden","true");
    document.body.style.overflow="";
  }
});

// ===== HACKER MODE =====
document.getElementById("toggleHacker").onclick = ()=>{
  document.body.classList.toggle("hacker-mode");
};
