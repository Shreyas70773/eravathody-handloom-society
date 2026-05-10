/* ═══════════════════════════════════════════════════════════════
   ERAVATHODY HANDLOOM SOCIETY — MAIN JAVASCRIPT
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
  initTracingBeam();
  initProcessSlider();   /* runs on process page — safe on all other pages */
  initHeroSwipe();       /* touch swipe for hero slider on mobile/tablet */
  initRevealObserver();  /* IntersectionObserver-based reveals — replaces scroll polling */
};

/* ── PAGE TRANSITIONS ── */
var allLinks = document.querySelectorAll('a[href]');
for (var i = 0; i < allLinks.length; i++) {
  allLinks[i].onclick = function(e) {
    var href = this.getAttribute('href');
    if (href && href.indexOf('.html') !== -1) {
      e.preventDefault();
      var target = href;
      var overlay = document.getElementById('page-transition');
      overlay.style.transition = 'opacity 0.4s ease';
      overlay.style.opacity = '1';
      overlay.style.pointerEvents = 'all';
      setTimeout(function() { window.location.href = target; }, 420);
    }
  };
}

/* ── MOBILE NAV HAMBURGER ── */
(function() {
  var btn     = document.getElementById('navHamburger');
  var links   = document.getElementById('navLinks');
  var overlay = document.getElementById('navOverlay');
  if (!btn || !links) return;

  function openNav() {
    btn.classList.add('open');
    links.classList.add('open');
    if (overlay) overlay.classList.add('open');
    btn.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden'; /* prevent background scroll */
  }

  function closeNav() {
    btn.classList.remove('open');
    links.classList.remove('open');
    if (overlay) overlay.classList.remove('open');
    btn.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }

  btn.addEventListener('click', function() {
    btn.classList.contains('open') ? closeNav() : openNav();
  });

  /* Close when a nav link is tapped */
  links.addEventListener('click', function(e) {
    if (e.target.classList.contains('nav-link')) closeNav();
  });

  /* Close when backdrop is tapped */
  if (overlay) overlay.addEventListener('click', closeNav);

  /* Close on Escape key */
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') closeNav();
  });
})();

/* ── JUMP TO SECTION ── */
function jumpToSection(id) {
  var el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: 'smooth' });
}

/* ── NAVBAR SCROLL ── */
function handleScroll() {
  var navbar = document.getElementById('navbar');
  if (!navbar) return;
  var scrollY = window.pageYOffset || document.documentElement.scrollTop;
  if (scrollY > 60) navbar.classList.add('scrolled');
  else navbar.classList.remove('scrolled');
  revealOnScroll();
  animateHeroLine();
  updateTracingBeam();
updateTimelineHighlight();
}
/* RAF-debounced passive scroll listener — prevents layout jank on every frame */
var _scrollRaf = null;
window.addEventListener('scroll', function() {
  if (_scrollRaf) return;
  _scrollRaf = requestAnimationFrame(function() {
    handleScroll();
    _scrollRaf = null;
  });
}, { passive: true });

/* ── SCROLL REVEAL ── */
function revealOnScroll() {
  var sections = document.querySelectorAll('.section-reveal');
  for (var s = 0; s < sections.length; s++) {
    if (isInViewport(sections[s], 80)) sections[s].classList.add('visible');
  }
  var items = document.querySelectorAll('.reveal-item');
  for (var r = 0; r < items.length; r++) {
    if (isInViewport(items[r], 60)) {
      (function(el, delay) {
        setTimeout(function() { el.classList.add('visible'); }, delay);
      })(items[r], r * 150);
    }
  }
  var imgReveals = document.querySelectorAll('.img-reveal');
  for (var v = 0; v < imgReveals.length; v++) {
    if (isInViewport(imgReveals[v], 60)) imgReveals[v].classList.add('revealed');
  }
}

function isInViewport(el, offset) {
  var rect = el.getBoundingClientRect();
  return rect.top < (window.innerHeight || document.documentElement.clientHeight) - (offset || 0);
}

/* ── IntersectionObserver scroll reveals ──
   Replaces the scroll-polling approach in revealOnScroll.
   IO callbacks run off the main thread, avoiding layout recalculation jank. */
function initRevealObserver() {
  if (!('IntersectionObserver' in window)) {
    /* Graceful fallback for older browsers */
    document.querySelectorAll('.section-reveal, .reveal-item, .img-reveal').forEach(function(el) {
      el.classList.add('visible');
      el.classList.add('revealed');
    });
    return;
  }

  /* Sections and image reveals — fire once, then unobserve */
  var sectionIO = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      if (!entry.isIntersecting) return;
      var el = entry.target;
      el.classList.add('visible');
      if (el.classList.contains('img-reveal')) el.classList.add('revealed');
      sectionIO.unobserve(el);
    });
  }, { rootMargin: '0px 0px -60px 0px', threshold: 0.05 });

  /* Staggered reveal items — cascade delay resets per viewport entry */
  var _staggerGroup = 0;
  var itemIO = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      if (!entry.isIntersecting) return;
      var el = entry.target;
      var delay = (_staggerGroup++ % 8) * 110;
      setTimeout(function() { el.classList.add('visible'); }, delay);
      itemIO.unobserve(el);
    });
  }, { rootMargin: '0px 0px -60px 0px', threshold: 0.05 });

  document.querySelectorAll('.section-reveal, .img-reveal').forEach(function(el) {
    sectionIO.observe(el);
  });
  document.querySelectorAll('.reveal-item').forEach(function(el) {
    itemIO.observe(el);
  });
}

/* ── HERO SLIDER ── */
var heroCurrentSlide = 0;
var heroSlides = [];
var heroTimer = null;

function startHeroSlider() {
  heroSlides = document.querySelectorAll('.hero-slide');
  if (heroSlides.length === 0) return;
  heroTimer = setInterval(nextHeroSlide, 5000);
}

function nextHeroSlide() {
  heroSlides[heroCurrentSlide].classList.remove('active');
  heroCurrentSlide = (heroCurrentSlide + 1) % heroSlides.length;
  heroSlides[heroCurrentSlide].classList.add('active');
  updateHeroCounter();
  animateHeroLine();
  updateDots();
}

function updateHeroCounter() {
  var counter = document.getElementById('heroCounter');
  if (!counter) return;
  var num = heroCurrentSlide + 1;
  counter.innerHTML = (num < 10 ? '0' + num : num) + ' / 0' + heroSlides.length;
}

function changeHero(dir) {
  heroSlides[heroCurrentSlide].classList.remove('active');
  heroCurrentSlide = (heroCurrentSlide + dir + heroSlides.length) % heroSlides.length;
  heroSlides[heroCurrentSlide].classList.add('active');
  updateHeroCounter();
  animateHeroLine();
  updateDots();
  if (heroTimer) clearInterval(heroTimer);
  heroTimer = setInterval(nextHeroSlide, 5000);
}

/* ── HERO TOUCH / SWIPE (replaces arrows on mobile/tablet) ── */
function initHeroSwipe() {
  var heroEl = document.getElementById('hero');
  if (!heroEl) return;

  var touchStartX = 0;
  var touchStartY = 0;

  heroEl.addEventListener('touchstart', function(e) {
    touchStartX = e.changedTouches[0].clientX;
    touchStartY = e.changedTouches[0].clientY;
  }, { passive: true });

  heroEl.addEventListener('touchend', function(e) {
    var dx = touchStartX - e.changedTouches[0].clientX;
    var dy = touchStartY - e.changedTouches[0].clientY;
    /* Only fire for horizontal swipes — prevents conflict with page scroll */
    if (Math.abs(dx) > 48 && Math.abs(dx) > Math.abs(dy) * 1.5) {
      changeHero(dx > 0 ? 1 : -1);
    }
  }, { passive: true });
}

/* ── HERO PROGRESS LINE ── */
function animateHeroLine() {
  var fill = document.getElementById('scrollFill');
  if (!fill) return;
  var scrollY = window.pageYOffset || document.documentElement.scrollTop;
  fill.style.height = (Math.min(scrollY / 700, 1) * 540) + 'px';
}

/* ── HERO DOTS ── */
function createDots() {
  var dotsContainer = document.getElementById('heroDots');
  if (!dotsContainer) return;
  dotsContainer.innerHTML = '';
  heroSlides.forEach(function(_, i) {
    var dot = document.createElement('div');
    dot.classList.add('hero-dot');
    if (i === heroCurrentSlide) dot.classList.add('active');
    dot.addEventListener('click', function() {
      heroSlides[heroCurrentSlide].classList.remove('active');
      heroCurrentSlide = i;
      heroSlides[heroCurrentSlide].classList.add('active');
      updateHeroCounter();
      updateDots();
      if (heroTimer) clearInterval(heroTimer);
      heroTimer = setInterval(nextHeroSlide, 5000);
    });
    dotsContainer.appendChild(dot);
  });
}

function updateDots() {
  var dots = document.querySelectorAll('.hero-dot');
  dots.forEach(function(dot) { dot.classList.remove('active'); });
  if (dots[heroCurrentSlide]) dots[heroCurrentSlide].classList.add('active');
}

/* ── GALLERY SLIDER ── */
var galCurrentSlide = 0;
var galSlides = [];
var galTimer = null;

function startGallerySlider() {
  galSlides = document.querySelectorAll('.gallery-slide');
  if (galSlides.length === 0) return;
  galTimer = setInterval(function() { changeGallery(1); }, 4500);
}

function changeGallery(dir) {
  galSlides[galCurrentSlide].classList.remove('active-gal');
  galCurrentSlide = (galCurrentSlide + dir + galSlides.length) % galSlides.length;
  galSlides[galCurrentSlide].classList.add('active-gal');
  if (galTimer) clearInterval(galTimer);
  galTimer = setInterval(function() { changeGallery(1); }, 4500);
}

/* ── COOKIES ── */
function setCookie(name, value) {
  document.cookie = name + '=' + value + '; path=/';
}
function getCookie(name) {
  var parts = document.cookie.split(';');
  for (var c = 0; c < parts.length; c++) {
    var part = parts[c].trim();
    if (part.indexOf(name + '=') === 0) return part.substring(name.length + 1);
  }
  return '';
}
function checkCookies() {
  setCookie('visited', 'true');
}

/* ── CONTACT FORM ── */
function submitContactForm(e) {
  if (e) e.preventDefault();
  var name  = document.getElementById('fname')  ? document.getElementById('fname').value  : '';
  var email = document.getElementById('email')  ? document.getElementById('email').value  : '';
  if (!name || !email) { alert('Please fill in your name and email.'); return false; }
  alert('Thank you, ' + name + '. Your message has been received by the Eravathody Handloom Society.');
  return true;
}

/* ── CRAFT CHAPTER TOGGLE ── */
function toggleChapterDetail(id) {
  var el = document.getElementById(id);
  if (!el) return;
  if (el.style.display === 'none' || el.style.display === '') {
    el.style.display = 'block';
    el.style.opacity = '0';
    setTimeout(function() { el.style.opacity = '1'; el.style.transition = 'opacity 0.6s ease'; }, 10);
  } else {
    el.style.opacity = '0';
    setTimeout(function() { el.style.display = 'none'; }, 600);
  }
}

/* ── YEAR ── */
function updateYear() {
  var yearEl = document.getElementById('currentYear');
  if (yearEl) yearEl.innerHTML = new Date().getFullYear();
}
updateYear();

/* ── VIDEO CONTROLS ── */
function toggleVideo() {
  var video = document.querySelector('.bg-video');
  var btn = document.getElementById('playPauseBtn');
  if (!video) return;
  if (video.paused) {
    video.play();
    if (btn) btn.innerHTML = '&#9646;&#9646;';
  } else {
    video.pause();
    if (btn) btn.innerHTML = '&#9654;';
  }
}
function rewindVideo() {
  var video = document.querySelector('.bg-video');
  if (video) video.currentTime = Math.max(0, video.currentTime - 5);
}
function forwardVideo() {
  var video = document.querySelector('.bg-video');
  if (video) video.currentTime = Math.min(video.duration, video.currentTime + 5);
}

/* ── HISTORY TIMELINE ACCORDION ── */
function toggleTimeline(item) {
  var allItems = document.querySelectorAll('.timeline-item');
  var isActive = item.classList.contains('active');
  for (var i = 0; i < allItems.length; i++) allItems[i].classList.remove('active');
  if (!isActive) item.classList.add('active');
}

/* ── TRACING BEAM (history section) ── */
var beamFill = null;
var beamDot  = null;

function initTracingBeam() {
  var track = document.getElementById('beamTrack');
  if (!track) return;
  beamFill = document.createElement('div');
  beamFill.id = 'beamFill';
  track.appendChild(beamFill);
  beamDot = document.createElement('div');
  beamDot.id = 'beamDot';
  track.appendChild(beamDot);
  updateTracingBeam();
}

/* ── DRAGGABLE TIMELINE DOT ── */

var isDraggingBeam = false;

document.addEventListener('mousedown', function(e) {
  if (e.target.id === 'beamDot') {
    isDraggingBeam = true;
  }
});

document.addEventListener('mouseup', function() {
  isDraggingBeam = false;
});

document.addEventListener('mousemove', function(e) {

  if (!isDraggingBeam) return;

  var track = document.getElementById('beamTrack');
  if (!track || !beamDot || !beamFill) return;

  var rect = track.getBoundingClientRect();

  var y = e.clientY - rect.top;

  /* clamp */
  y = Math.max(0, Math.min(y, rect.height));

  beamDot.style.top = y + 'px';
  beamFill.style.height = y + 'px';

  /* highlight nearest timeline item */
  var items = document.querySelectorAll('.timeline-item');

  var closestItem = null;
  var closestDistance = Infinity;

  for (var i = 0; i < items.length; i++) {

    var itemRect = items[i].getBoundingClientRect();

    var itemCenter = itemRect.top + itemRect.height / 2;

    var distance = Math.abs(e.clientY - itemCenter);

    if (distance < closestDistance) {
      closestDistance = distance;
      closestItem = items[i];
    }
  }

  for (var j = 0; j < items.length; j++) {
    items[j].classList.remove('active-timeline');
  }

  if (closestItem) {
    closestItem.classList.add('active-timeline');
  }
});

function updateTracingBeam() {
 if (!beamFill || !beamDot || isDraggingBeam) return;
  var section = document.getElementById('history');
  var track   = document.getElementById('beamTrack');
  if (!section || !track) return;
  var sectionTop = section.getBoundingClientRect().top + window.pageYOffset;
  var progress = (window.pageYOffset - sectionTop + window.innerHeight * 0.6) / section.offsetHeight;
  if (progress < 0) progress = 0;
  if (progress > 1) progress = 1;
  var fillH = progress * track.offsetHeight;
  beamFill.style.height = fillH + 'px';
  beamDot.style.top = (fillH - 8) + 'px';
}

/* ── ACTIVE TIMELINE CARD ── */
function updateTimelineHighlight() {

  var items = document.querySelectorAll('.timeline-item');

  var closestItem = null;
  var closestDistance = Infinity;

  for (var i = 0; i < items.length; i++) {

    var rect = items[i].getBoundingClientRect();

    var itemCenter = rect.top + rect.height / 2;

    var viewportCenter = window.innerHeight * 0.75;

    var distance = Math.abs(viewportCenter - itemCenter);

    if (distance < closestDistance) {
      closestDistance = distance;
      closestItem = items[i];
    }
  }

  for (var j = 0; j < items.length; j++) {
    items[j].classList.remove('active-timeline');
  }

  if (closestItem) {
    closestItem.classList.add('active-timeline');
  }
}

/* ── FULLSCREEN VIDEO ── */
function toggleFullscreen() {
  var video = document.querySelector('.bg-video');

  if (!video) return;

  if (!document.fullscreenElement) {
    video.requestFullscreen();
    video.controls = true;
  } else {
    document.exitFullscreen();
    video.controls = false;
  }
}
/* ════════════════════════════════════════════════════════
   PROCESS PAGE SLIDER — RESPONSIVE
   Reads actual rendered card width from the DOM so the
   visible-count adapts automatically to CSS breakpoints:
     desktop  → flex: 0 0 33.33%  → 3 visible
     tablet   → flex: 0 0 50%     → 2 visible
     mobile   → flex: 0 0 100%    → 1 visible
   This fixes the mobile bug where Step 6 was unreachable
   because the old code hard-coded visible = 2.
════════════════════════════════════════════════════════ */
function initProcessSlider() {
  var track   = document.getElementById('sliderTrack');
  var prevBtn = document.getElementById('sliderPrev');
  var nextBtn = document.getElementById('sliderNext');
  var counter = document.getElementById('sliderCounter');

  /* Exit cleanly if not on the process page */
  if (!track || !prevBtn || !nextBtn) return;

  var cards        = track.querySelectorAll('.step-card');
  var totalCards   = cards.length;
  var currentIndex = 0;

  /* Derive visible count from actual rendered card width */
  function getVisible() {
    if (!cards.length || !cards[0].offsetWidth) return 2;
    return Math.max(1, Math.round(track.parentElement.offsetWidth / cards[0].offsetWidth));
  }

  function updateSlider() {
    var cardWidth = cards[0] ? cards[0].offsetWidth : 0;
    track.style.transform = 'translateX(-' + (currentIndex * cardWidth) + 'px)';

    var visible = getVisible();
    var left    = currentIndex + 1;
    var right   = Math.min(currentIndex + visible, totalCards);
    if (counter) {
      var l = left       < 10 ? '0' + left       : '' + left;
      var r = right      < 10 ? '0' + right      : '' + right;
      var t = totalCards < 10 ? '0' + totalCards : '' + totalCards;
      counter.innerHTML = l + ' &ndash; ' + r + ' &nbsp;/&nbsp; ' + t;
    }

    prevBtn.disabled = (currentIndex === 0);
    nextBtn.disabled = (currentIndex >= totalCards - visible);
  }

  prevBtn.addEventListener('click', function() {
    if (currentIndex > 0) { currentIndex--; updateSlider(); }
  });

  nextBtn.addEventListener('click', function() {
    if (currentIndex < totalCards - getVisible()) { currentIndex++; updateSlider(); }
  });

  /* Global expose so any inline onclick="slideStep()" still works */
  window.slideStep = function(dir) {
    if (dir === -1 && currentIndex > 0) { currentIndex--; updateSlider(); }
    if (dir ===  1 && currentIndex < totalCards - getVisible()) { currentIndex++; updateSlider(); }
  };

  /* Touch swipe on the slider window */
  var sliderWin = track.parentElement;
  var _swipeX = 0, _swipeY = 0;
  sliderWin.addEventListener('touchstart', function(e) {
    _swipeX = e.changedTouches[0].clientX;
    _swipeY = e.changedTouches[0].clientY;
  }, { passive: true });
  sliderWin.addEventListener('touchend', function(e) {
    var dx = _swipeX - e.changedTouches[0].clientX;
    var dy = _swipeY - e.changedTouches[0].clientY;
    if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy) * 1.5) {
      window.slideStep(dx > 0 ? 1 : -1);
    }
  }, { passive: true });

  /* Recalculate on resize — breakpoint changes card width */
  window.addEventListener('resize', function() { updateSlider(); });

  updateSlider();
}

/* ── MUNDU CARD DRAG SLIDER ── */

var slider = document.querySelector('.cards-row');

if (slider) {

  var isDown = false;
  var startX;
  var scrollLeft;
  var velocity = 0;
  var momentumID;

  slider.addEventListener('mousedown', function(e) {
    isDown = true;
    startX = e.pageX - slider.offsetLeft;
    scrollLeft = slider.scrollLeft;
    cancelMomentum();
  });

  slider.addEventListener('mouseleave', function() {
    isDown = false;
    beginMomentum();
  });

  slider.addEventListener('mouseup', function() {
    isDown = false;
    beginMomentum();
  });

  slider.addEventListener('mousemove', function(e) {

    if (!isDown) return;

    e.preventDefault();

    var x = e.pageX - slider.offsetLeft;
    var walk = (x - startX);

    velocity = walk * 0.2;

    slider.scrollLeft = scrollLeft - walk;

    applyTilt(velocity);
  });

  function beginMomentum() {
    cancelMomentum();
    momentumID = requestAnimationFrame(momentumLoop);
  }

  function momentumLoop() {

    slider.scrollLeft -= velocity;

    velocity *= 0.95;

    applyTilt(velocity);

    if (Math.abs(velocity) > 0.5) {
      momentumID = requestAnimationFrame(momentumLoop);
    } else {
      resetTilt();
    }
  }

  function cancelMomentum() {
    cancelAnimationFrame(momentumID);
  }

  function applyTilt(v) {

    var cards = document.querySelectorAll('.mundu-card');

    for (var i = 0; i < cards.length; i++) {

      var baseRotation = getBaseRotation(i);

      var delay = i * 0.02;

      var tilt = (v * 0.05) * (1 - delay);

      cards[i].style.transform =
        'rotate(' + (baseRotation + tilt) + 'deg) translateY(' + (Math.abs(tilt) * -2) + 'px)';
    }
  }

  function resetTilt() {

    var cards = document.querySelectorAll('.mundu-card');

    for (var i = 0; i < cards.length; i++) {

      var baseRotation = getBaseRotation(i);

      cards[i].style.transform =
        'rotate(' + baseRotation + 'deg)';
    }
  }

  function getBaseRotation(i) {

    var rotations = [-1.8, 0, 1.4, 0, -1.2, 0, 1.6, 0, -0.8, 0, 1.0];

    return rotations[i % rotations.length];
  }
}


/* ── ARTISANS FILMSTRIP (only runs on pages that have the bgA/filmstrip elements) ── */
if (document.getElementById('bgA') && document.getElementById('filmstrip')) {

var artisans = [
  { name:"Sundaran",        role:"61 Years at the Loom",    label:"Master Weaver",       bio:"Kerala State Award Winner (2002). Creator of the Theyyam-inspired saree design that brought district-level recognition to the Society.",  img:"6-2.jpg" },
  { name:"Annamalai",       role:"48 Years · Warp Setup",   label:"Thread Preparation",  bio:"Responsible for preparing warp setups across all 19 looms. His consistency in thread tension is the foundation of every piece.",         img:"9.jpg",  position:"shift-1"},
  { name:"Velligiri R",     role:"37 Years · Kasavu",       label:"Border Weaver",       bio:"Specialises in the Kasavu zari border technique, integrating complex patterns without slowing production pace.",                          img:"1.jpg",  position:"shift-2" },
  { name:"Meenakshi",       role:"28 Years · Inspector",    label:"Quality & Finishing", bio:"Oversees the washing, starching, and folding of each saree. The cooperative's last line of quality assurance before the Handloom Mark.",   img:"7.jpg", position:"shift-3" },
  { name:"Mani",            role:"35 Years · Weaver",       label:"Plain Weave",         bio:"Produces the plain-weave mundu and fabric yardage that forms the bulk of the Society's day-to-day output.",                               img:"15.jpg", position:"shift-4" },
  { name:"Arunachalan",     role:"40 Years · Weaver",       label:"Senior Weaver",       bio:"One of the most experienced weavers at the Society. Trained by the founding generation, keeper of unwritten technical knowledge.",       img:"8.jpg", position:"shift-5" },
  { name:"Shobana",         role:"12 Years · Colour Weave", label:"Colour Innovation",   bio:"Leads the Society's distinctive colour work, developing new weft palettes that have become a signature of Eravathody cloth.",            img:"5.jpg", position:"shift-6" },
  { name:"Guruvayoorappan", role:"45 Years · Warper",       label:"Loom Preparation",    bio:"Masters the warping process, threading thousands of individual ends through heddle and reed for each new loom setup.",                   img:"2.jpg", position:"shift-7" },
   { name:"Karuppan",     role:"40 Years · Weaver",       label:"Senior Weaver",       bio:"One of the most experienced weavers at the Society. Trained by the founding generation, keeper of unwritten technical knowledge.",       img:"3.jpg", position:"shift-8" },
  { name:"Ramesh",         role:"12 Years · Colour Weave", label:"Colour Innovation",   bio:"Leads the Society's distinctive colour work, developing new weft palettes that have become a signature of Eravathody cloth.",            img:"4.jpg", position:"shift-9" },
  { name:"Ganeshan", role:"45 Years · Warper",       label:"Loom Preparation",    bio:"Masters the warping process, threading thousands of individual ends through heddle and reed for each new loom setup.",                   img:"10-2.jpg", position:"shift-10" }
  
];
  

var currentIndex = 0;
var bgActive    = 'A';
var bgA         = document.getElementById('bgA');
var bgB         = document.getElementById('bgB');
var infoName    = document.getElementById('infoName');
var infoRole    = document.getElementById('infoRole');
var infoLabel   = document.getElementById('infoLabel');
var infoBio     = document.getElementById('infoBio');
var artisanInfo = document.getElementById('artisanInfo');
var counter     = document.getElementById('counter');
var filmstrip   = document.getElementById('filmstrip');

function setBackground(imgUrl, positionClass) {

  if (bgActive === 'A') {

    /* prepare hidden layer */
    bgB.className = 'hero-bg';

    if (positionClass) {
      bgB.classList.add(positionClass);
    }

    bgB.style.backgroundImage = 'url(' + imgUrl + ')';

    /* fade */
    bgB.style.opacity = '1';
    bgA.style.opacity = '0';

    bgActive = 'B';

  } else {

    /* prepare hidden layer */
    bgA.className = 'hero-bg';

    if (positionClass) {
      bgA.classList.add(positionClass);
    }

    bgA.style.backgroundImage = 'url(' + imgUrl + ')';

    /* fade */
    bgA.style.opacity = '1';
    bgB.style.opacity = '0';

    bgActive = 'A';
  }
}

function activateArtisan(idx) {
  currentIndex = idx;
  var a = artisans[idx];
  setBackground(a.img, a.position);

  artisanInfo.classList.remove('visible');
  setTimeout(function() {
    infoName.textContent  = a.name;
    infoRole.textContent  = a.role;
    infoLabel.textContent = a.label;
    infoBio.textContent   = a.bio;
    artisanInfo.classList.add('visible');
  }, 120);

  var n = idx + 1;
  counter.textContent = 
  (n < 10 ? '0' + n : n) + 
  ' / ' + 
  artisans.length;

  var thumbs = filmstrip.querySelectorAll('.thumb');
  for (var t = 0; t < thumbs.length; t++) {
    thumbs[t].classList.toggle('active', t === idx);
  }
}

/* Build filmstrip — JS adds each thumb + a name label inside it */
artisans.forEach(function(a, i) {
  var div = document.createElement('div');
  div.className = 'thumb' + (i === 0 ? ' active' : '');
  div.style.backgroundImage = 'url(' + a.img + ')';

  var lbl = document.createElement('span');
  lbl.className = 'thumb-label';
  lbl.textContent = a.name;
  div.appendChild(lbl);

  (function(idx) {
    div.addEventListener('mouseenter', function() { activateArtisan(idx); });
    div.addEventListener('click',      function() { activateArtisan(idx); });
  })(i);

  filmstrip.appendChild(div);
});

/* Initialise */
bgA.style.backgroundImage = 'url(' + artisans[0].img + ')';
bgActive = 'A';
artisanInfo.classList.add('visible');

} /* end artisans guard */
