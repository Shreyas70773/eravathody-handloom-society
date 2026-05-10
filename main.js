/* ═══════════════════════════════════════════════════════════════
   ERAVATHODY HANDLOOM SOCIETY — MAIN JAVASCRIPT
   Based on class notes: basic JS, DOM manipulation, functions,
   getElementById, innerHTML, cookies, event handlers
   ═══════════════════════════════════════════════════════════════ */

/* ── PAGE TRANSITION OVERLAY ── */
/* Inject overlay div into every page (from notes: innerHTML) */
document.body.insertAdjacentHTML('afterbegin', '<div id="page-transition"></div>');

/* Fade page IN on load */
window.onload = function() {
  var overlay = document.getElementById('page-transition');
  if (overlay) {
    overlay.style.opacity = '0';
    overlay.style.pointerEvents = 'none';
  }
  /* Trigger scroll check on load */
  handleScroll();
  /* Start hero slider */
  startHeroSlider();
  /* Start gallery slider */
   createDots();
  startGallerySlider();
  /* Animate hero progress line */
  animateHeroLine();
};

/* Fade page OUT before navigating */
var allLinks = document.querySelectorAll('a[href]');
for (var i = 0; i < allLinks.length; i++) {
  allLinks[i].onclick = function(e) {
    var href = this.getAttribute('href');
    /* Only intercept internal page links, not jump links */
    if (href && href.indexOf('.html') !== -1) {
      e.preventDefault();
      var target = href;
      var overlay = document.getElementById('page-transition');
      overlay.style.transition = 'opacity 0.4s ease';
      overlay.style.opacity = '1';
      overlay.style.pointerEvents = 'all';
      setTimeout(function() {
        window.location.href = target;
      }, 420);
    }
  };
}

/* ── JUMP TO SECTION (from notes: anchor navigation) ── */
function jumpToSection(id) {
  var el = document.getElementById(id);
  if (el) {
    el.scrollIntoView({ behavior: 'smooth' });
  }
}

/* ── NAVBAR SCROLL EFFECT ── */
function handleScroll() {
  var navbar = document.getElementById('navbar');
  if (!navbar) return;

  var scrollY = window.pageYOffset || document.documentElement.scrollTop;

  /* Scrolled state */
  if (scrollY > 60) {
    navbar.classList.add('scrolled');
  } else {
    navbar.classList.remove('scrolled');
  }

  /* Scroll reveal: sections */
  revealOnScroll();

  /* Hero progress line */
  animateHeroLine();
}

window.onscroll = handleScroll;

/* ── SCROLL REVEAL (opacity fade, no Y movement) ── */
function revealOnScroll() {
  /* Sections */
  var sections = document.querySelectorAll('.section-reveal');
  for (var s = 0; s < sections.length; s++) {
    if (isInViewport(sections[s], 80)) {
      sections[s].classList.add('visible');
    }
  }
  /* Individual items */
  var items = document.querySelectorAll('.reveal-item');
  for (var r = 0; r < items.length; r++) {
    if (isInViewport(items[r], 60)) {
      /* Stagger: delay each by index * 150ms */
      (function(el, delay) {
        setTimeout(function() {
          el.classList.add('visible');
        }, delay);
      })(items[r], r * 150);
    }
  }
  /* Image curtain wipes */
  var imgReveals = document.querySelectorAll('.img-reveal');
  for (var v = 0; v < imgReveals.length; v++) {
    if (isInViewport(imgReveals[v], 60)) {
      imgReveals[v].classList.add('revealed');
    }
  }
}

/* Helper: check if element is in viewport */
function isInViewport(el, offset) {
  var rect = el.getBoundingClientRect();
  var windowHeight = window.innerHeight || document.documentElement.clientHeight;
  return rect.top < windowHeight - (offset || 0);
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
  var total = heroSlides.length;
  counter.innerHTML = (num < 10 ? '0' + num : num) + ' / 0' + total;
}

function changeHero(dir) {
  heroSlides[heroCurrentSlide].classList.remove('active');

  heroCurrentSlide = (heroCurrentSlide + dir + heroSlides.length) % heroSlides.length;

  heroSlides[heroCurrentSlide].classList.add('active');

  updateHeroCounter();
  animateHeroLine();
  updateDots();

  // reset timer so auto doesn’t clash
  if (heroTimer) clearInterval(heroTimer);
  heroTimer = setInterval(nextHeroSlide, 5000);
}

/* ── HERO PROGRESS LINE (thread on right edge fills then resets) ── */
function animateHeroLine() {
  var fill = document.getElementById('scrollFill');
  if (!fill) return;
  var scrollY = window.pageYOffset || document.documentElement.scrollTop;
  var heroHeight = 700;
  var progress = Math.min(scrollY / heroHeight, 1);
  fill.style.height = (progress * 540) + 'px';
}
function createDots() {
  var dotsContainer = document.getElementById('heroDots');
  if (!dotsContainer) return;

  dotsContainer.innerHTML = '';

  heroSlides.forEach((_, i) => {
    var dot = document.createElement('div');
    dot.classList.add('hero-dot');

    if (i === heroCurrentSlide) {
      dot.classList.add('active');
    }

    dot.addEventListener('click', function () {
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
  dots.forEach(dot => dot.classList.remove('active'));
  if (dots[heroCurrentSlide]) {
    dots[heroCurrentSlide].classList.add('active');
  }
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
  /* Reset timer */
  if (galTimer) clearInterval(galTimer);
  galTimer = setInterval(function() { changeGallery(1); }, 4500);
}

/* ── COOKIES (from notes: store info so page can recognise) ── */
function setCookie(name, value) {
  /* Stores cookie with no expiry = session cookie */
  document.cookie = name + '=' + value + '; path=/';
}

function getCookie(name) {
  var cookies = document.cookie;
  /* From notes: checkCookies reads cookie text */
  var parts = cookies.split(';');
  for (var c = 0; c < parts.length; c++) {
    var part = parts[c].trim();
    if (part.indexOf(name + '=') === 0) {
      return part.substring(name.length + 1);
    }
  }
  return '';
}

function checkCookies() {
  /* From notes: body onload = "checkCookies()" */
  var visited = getCookie('visited');
  if (visited !== '') {
    /* Returning visitor — can personalise if needed */
    setCookie('visited', 'true');
  } else {
    /* First visit */
    setCookie('visited', 'true');
  }
}

/* ── CONTACT FORM SUBMISSION (from notes: form method get/post) ── */
/* From notes: alert box — TRACE (AT) for form feedback */
function submitContactForm(e) {
  if (e) e.preventDefault();
  var name = document.getElementById('fname') ? document.getElementById('fname').value : '';
  var email = document.getElementById('email') ? document.getElementById('email').value : '';
  if (name === '' || email === '') {
    alert('Please fill in your name and email.');
    return false;
  }
  alert('Thank you, ' + name + '. Your message has been received by the Eravathody Handloom Society.');
  return true;
}

/* ── IF/ELSE: Show/hide craft chapter detail ── */
/* From notes: if else structure — multiple things to do */
function toggleChapterDetail(id) {
  var el = document.getElementById(id);
  if (el) {
    if (el.style.display === 'none' || el.style.display === '') {
      el.style.display = 'block';
      el.style.opacity = '0';
      setTimeout(function() { el.style.opacity = '1'; el.style.transition = 'opacity 0.6s ease'; }, 10);
    } else {
      el.style.opacity = '0';
      setTimeout(function() { el.style.display = 'none'; }, 600);
    }
  }
}

/* ── DOM MANIPULATION: innerHTML updates ── */
/* From notes: this.innerHTML = Data() > built in function */
function updateYear() {
  var yearEl = document.getElementById('currentYear');
  if (yearEl) {
    var d = new Date();
    yearEl.innerHTML = d.getFullYear();
  }
}

updateYear();

function toggleVideo() {
  var video = document.querySelector('.bg-video');
  var btn = document.querySelector('.video-toggle');

  if (video.paused) {
    video.play();
    btn.innerHTML = "⏸";
  } else {
    video.pause();
    btn.innerHTML = "▶";
  }
}
function rewindVideo() {
  var video = document.querySelector('.bg-video');
  video.currentTime = Math.max(0, video.currentTime - 5); // go back 5s
}

function forwardVideo() {
  var video = document.querySelector('.bg-video');
  video.currentTime = Math.min(video.duration, video.currentTime + 5); // forward 5s
}

function toggleFullscreen() {
  var video = document.querySelector('.bg-video');

  if (!document.fullscreenElement) {
    video.requestFullscreen();

    // show native controls in fullscreen
    video.controls = true;

  } else {
    document.exitFullscreen();

    // hide controls again when exiting
    video.controls = false;
  }
}

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
      cards[i].style.transform = 'rotate(' + baseRotation + 'deg)';
    }
  }
  function getBaseRotation(i) {
    var rotations = [-1.8, 0, 1.4, 0, -1.2, 0, 1.6, 0, -0.8, 0, 1.0];
    return rotations[i % rotations.length];
  }
}

var track = document.querySelector('.slider-track');
var cards = document.querySelectorAll('.step-card');

var index = 0;
var visibleCards = 2;

document.querySelector('.arrow.right').addEventListener('click', function() {
  if (index < cards.length - visibleCards) {
    index++;
    updateSlider();
  }
});

document.querySelector('.arrow.left').addEventListener('click', function() {
  if (index > 0) {
    index--;
    updateSlider();
  }
});

function updateSlider() {
  var cardWidth = cards[0].offsetWidth;
  track.style.transform = "translateX(-" + (index * cardWidth) + "px)";
}