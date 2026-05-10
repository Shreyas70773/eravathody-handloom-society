/* ═══════════════════════════════════════
   NAVBAR SCROLL
═══════════════════════════════════════ */

function handleNavbar() {
  const navbar = document.getElementById('navbar');

  if (!navbar) return;

  if (window.scrollY > 40) {
    navbar.classList.add('scrolled');
  } else {
    navbar.classList.remove('scrolled');
  }
}


/* ═══════════════════════════════════════
   HERO SLIDER
═══════════════════════════════════════ */

let currentHero = 0;
const heroSlides = document.querySelectorAll('.hero-slide');
const heroCounter = document.getElementById('heroCounter');
const heroDots = document.getElementById('heroDots');

function createDots() {
  if (!heroDots) return;

  heroDots.innerHTML = '';

  heroSlides.forEach((_, index) => {
    const dot = document.createElement('div');
    dot.classList.add('hero-dot');

    if (index === 0) {
      dot.classList.add('active');
    }

    dot.addEventListener('click', () => {
      showHero(index);
    });

    heroDots.appendChild(dot);
  });
}

function updateCounter() {
  if (!heroCounter) return;

  const current = String(currentHero + 1).padStart(2, '0');
  const total = String(heroSlides.length).padStart(2, '0');

  heroCounter.textContent = `${current} / ${total}`;
}

function updateDots() {
  const dots = document.querySelectorAll('.hero-dot');

  dots.forEach(dot => dot.classList.remove('active'));

  if (dots[currentHero]) {
    dots[currentHero].classList.add('active');
  }
}

function showHero(index) {
  heroSlides.forEach(slide => {
    slide.classList.remove('active');
  });

  currentHero = (index + heroSlides.length) % heroSlides.length;

  if (heroSlides[currentHero]) {
    heroSlides[currentHero].classList.add('active');
  }

  updateCounter();
  updateDots();
}

function changeHero(direction) {
  showHero(currentHero + direction);
}

setInterval(() => {
  if (heroSlides.length > 0) {
    changeHero(1);
  }
}, 7000);


/* ═══════════════════════════════════════
   SECTION REVEAL
═══════════════════════════════════════ */

function revealOnScroll() {
  const reveals = document.querySelectorAll('.section-reveal, .reveal-item');

  reveals.forEach(item => {
    const rect = item.getBoundingClientRect();

    if (rect.top < window.innerHeight - 80) {
      item.classList.add('visible');
    }
  });
}


/* ═══════════════════════════════════════
   HERO LINE FILL
═══════════════════════════════════════ */

function animateHeroLine() {
  const fills = document.querySelectorAll('.hero-scroll-fill');

  fills.forEach(fill => {
    const section = fill.closest('.hero-slide');

    if (!section) return;

    const rect = section.getBoundingClientRect();

    const visible = Math.min(
      Math.max((window.innerHeight - rect.top) / window.innerHeight, 0),
      1
    );

    fill.style.height = `${visible * 100}%`;
  });
}


/* ═══════════════════════════════════════
   TIMELINE BEAM
═══════════════════════════════════════ */

function updateTracingBeam() {
  const timeline = document.querySelector('.timeline-line-fill');
  const section = document.querySelector('.timeline-wrapper');

  if (!timeline || !section) return;

  const rect = section.getBoundingClientRect();

  const progress = Math.min(
    Math.max((window.innerHeight - rect.top) / rect.height, 0),
    1
  );

  timeline.style.height = `${progress * 100}%`;
}


/* ═══════════════════════════════════════
   ACTIVE TIMELINE CARD
═══════════════════════════════════════ */

function updateTimelineHighlight() {
  const items = document.querySelectorAll('.timeline-item');

  let closestItem = null;
  let closestDistance = Infinity;

  items.forEach(item => {
    const rect = item.getBoundingClientRect();

    const itemCenter = rect.top + rect.height / 2;

    const viewportCenter = window.innerHeight * 0.35;

    const distance = Math.abs(viewportCenter - itemCenter);

    if (distance < closestDistance) {
      closestDistance = distance;
      closestItem = item;
    }
  });

  items.forEach(item => {
    item.classList.remove('active-timeline');
  });

  if (closestItem) {
    closestItem.classList.add('active-timeline');
  }
}


/* ═══════════════════════════════════════
   GLOBAL SCROLL HANDLER
═══════════════════════════════════════ */

function handleScroll() {
  handleNavbar();
  revealOnScroll();
  animateHeroLine();
  updateTracingBeam();
  updateTimelineHighlight();
}

window.addEventListener('scroll', handleScroll);


/* ═══════════════════════════════════════
   PAGE LOAD
═══════════════════════════════════════ */

window.onload = function () {
  createDots();
  showHero(0);

  handleScroll();
};