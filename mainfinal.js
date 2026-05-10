/* ═══════════════════════════════════════════════════════════════
   ERAVATHODY HANDLOOM SOCIETY — FINAL CLEAN JS
   ═══════════════════════════════════════════════════════════════ */

/* ── PAGE TRANSITION OVERLAY ── */
document.body.insertAdjacentHTML('afterbegin', '<div id="page-transition"></div>');

window.onload = function() {
  var overlay = document.getElementById('page-transition');
  if (overlay) {
    overlay.style.opacity = '0';
    overlay.style.pointerEvents = 'none';
  }

  handleScroll();
  startHeroSlider();
  createDots();
  startGallerySlider();
  animateHeroLine();
  initProcessSlider(); /* 🔥 integrated cleanly */
};

/* ── PAGE TRANSITIONS ── */
document.querySelectorAll('a[href]').forEach(function(link) {
  link.onclick = function(e) {
    var href = this.getAttribute('href');
    if (href && href.includes('.html')) {
      e.preventDefault();
      var overlay = document.getElementById('page-transition');
      overlay.style.opacity = '1';
      overlay.style.pointerEvents = 'all';
      setTimeout(() => window.location.href = href, 420);
    }
  };
});

/* ── NAVBAR SCROLL ── */
function handleScroll() {
  var navbar = document.getElementById('navbar');
  if (!navbar) return;

  var scrollY = window.pageYOffset || document.documentElement.scrollTop;

  if (scrollY > 60) navbar.classList.add('scrolled');
  else navbar.classList.remove('scrolled');

  revealOnScroll();
  animateHeroLine();
}
window.onscroll = handleScroll;

/* ── REVEAL ── */
function revealOnScroll() {
  var items = document.querySelectorAll('.reveal-item');

  items.forEach(function(item, i) {
    if (isInViewport(item, 60)) {
      setTimeout(() => item.classList.add('visible'), i * 120);
    }
  });
}

function isInViewport(el, offset) {
  var rect = el.getBoundingClientRect();
  return rect.top < window.innerHeight - offset;
}

/* ── HERO SLIDER ── */
var heroCurrent = 0;
var heroSlides = [];

function startHeroSlider() {
  heroSlides = document.querySelectorAll('.hero-slide');
  if (!heroSlides.length) return;
  setInterval(nextHeroSlide, 5000);
}

function nextHeroSlide() {
  heroSlides[heroCurrent].classList.remove('active');
  heroCurrent = (heroCurrent + 1) % heroSlides.length;
  heroSlides[heroCurrent].classList.add('active');
  updateDots();
}

/* ── DOTS ── */
function createDots() {
  var container = document.getElementById('heroDots');
  if (!container) return;

  container.innerHTML = '';
  heroSlides.forEach((_, i) => {
    var dot = document.createElement('div');
    dot.classList.add('hero-dot');
    if (i === heroCurrent) dot.classList.add('active');

    dot.onclick = function() {
      heroSlides[heroCurrent].classList.remove('active');
      heroCurrent = i;
      heroSlides[heroCurrent].classList.add('active');
      updateDots();
    };

    container.appendChild(dot);
  });
}

function updateDots() {
  document.querySelectorAll('.hero-dot').forEach(dot => dot.classList.remove('active'));
  if (document.querySelectorAll('.hero-dot')[heroCurrent]) {
    document.querySelectorAll('.hero-dot')[heroCurrent].classList.add('active');
  }
}

/* ── HERO LINE ── */
function animateHeroLine() {
  var fill = document.getElementById('scrollFill');
  if (!fill) return;

  var progress = Math.min(window.scrollY / 700, 1);
  fill.style.height = (progress * 540) + 'px';
}

/* ── GALLERY ── */
var galCurrent = 0;
var galSlides = [];

function startGallerySlider() {
  galSlides = document.querySelectorAll('.gallery-slide');
  if (!galSlides.length) return;

  setInterval(() => changeGallery(1), 4000);
}

function changeGallery(dir) {
  galSlides[galCurrent].classList.remove('active-gal');
  galCurrent = (galCurrent + dir + galSlides.length) % galSlides.length;
  galSlides[galCurrent].classList.add('active-gal');
}

/* ─────────────────────────────────────────
   🔥 PROCESS SLIDER (FINAL VERSION)
───────────────────────────────────────── */
function initProcessSlider() {

  var track = document.querySelector('.slider-track');
  var cards = document.querySelectorAll('.step-card');
  var next = document.querySelector('.arrow.right');
  var prev = document.querySelector('.arrow.left');

  if (!track || !cards.length) return;

  var index = 0;
  var visible = 2;

  function update() {
    var width = cards[0].offsetWidth;
    track.style.transform = `translateX(-${index * width}px)`;

    /* disable buttons */
    prev.style.opacity = index === 0 ? 0.3 : 1;
    next.style.opacity = index >= cards.length - visible ? 0.3 : 1;
  }

  next.onclick = function() {
    if (index < cards.length - visible) {
      index++;
      update();
    }
  };

  prev.onclick = function() {
    if (index > 0) {
      index--;
      update();
    }
  };

  update();
}