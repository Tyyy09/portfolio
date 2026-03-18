// Loader
let progress = 0;
const loader = document.getElementById("loader");
const number = document.getElementById("loader-number");

function updateLoader() {
  const jump = Math.floor(Math.random() * 15) + 1;
  progress += jump;
  if (progress > 100) progress = 100;
  number.textContent = progress + "%";
  if (progress < 100) {
    setTimeout(updateLoader, Math.random() * 160 + 40);
  } else {
    loader.classList.add("hide");
  }
}
updateLoader();

// Hero entrance + parallax
window.addEventListener("load", () => {
  const hero = document.querySelector(".hero");
  hero.classList.add("show");
});

const hero = document.querySelector(".hero");
window.addEventListener("scroll", () => {
  const offset = window.scrollY * 0.2;
  hero.style.transform = `translateY(${offset}px)`;
});

// Scroll reveal
const reveals = document.querySelectorAll(".reveal");
const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add("show");
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.2 });
reveals.forEach(section => observer.observe(section));

// Footer year
document.getElementById("year").textContent = new Date().getFullYear();

// Hamburger menu
const hamburger = document.querySelector('.hamburger');
const navLinks = document.querySelector('.nav-link');
const links = document.querySelectorAll('.nav-link a');

hamburger.addEventListener('click', () => {
  hamburger.classList.toggle('active');
  navLinks.classList.toggle('show');
});

links.forEach(link => {
  link.addEventListener('click', () => {
    hamburger.classList.remove('active');
    navLinks.classList.remove('show');
  });
});

window.addEventListener('resize', () => {
  if (window.innerWidth > 768) {
    hamburger.classList.remove('active');
    navLinks.classList.remove('show');
  }
});