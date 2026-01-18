let progress = 0;
const loader = document.getElementById("loader");
const number = document.getElementById("loader-number");

function updateLoader() {
  // random jump between 1 and 15
  const jump = Math.floor(Math.random() * 15) + 1;

  progress += jump;

  if (progress > 100) progress = 100;

  number.textContent = progress + "%";

  if (progress < 100) {
    // random delay between jumps (40–200ms)
    setTimeout(updateLoader, Math.random() * 160 + 40);
  } else {
    loader.classList.add("hide");
  }
}
updateLoader();
window.addEventListener("load", () => { const hero = document.querySelector(".hero"); hero.classList.add("show"); });
const hero = document.querySelector(".hero");

window.addEventListener("scroll", () => {
  const offset = window.scrollY * 0.2; // adjust strength
  hero.style.transform = `translateY(${offset}px)`;
});

const reveals = document.querySelectorAll(".reveal");

const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add("show");
      observer.unobserve(entry.target); // animate once
    }
  });
}, { threshold: 0.2 });

reveals.forEach(section => observer.observe(section));
document.getElementById("year").textContent = new Date().getFullYear();

  const hamburger = document.querySelector('.hamburger');
  const navLinks = document.querySelector('.nav-link');

  hamburger.addEventListener('click', () => {
  hamburger.classList.toggle('active');
  navLinks.classList.toggle('show');
});
