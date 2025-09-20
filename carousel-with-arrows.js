//Carousel with arrows

function initTinyCarousel(wrapperSelector, trackSelector) {
  const root = document.querySelector(wrapperSelector);
  if (!root) return;

  const track = root.querySelector(trackSelector);
  const prevBtn = root.querySelector('.prev');
  const nextBtn = root.querySelector('.next');

  if (!track || !prevBtn || !nextBtn) return;

  // ----- Setup: make iOS behave better -----
  // (Even if Tailwind classes exist, force them inline for stubborn Safari builds)
  track.style.scrollSnapType = 'x mandatory';
  track.style.webkitOverflowScrolling = 'touch';
  track.style.overscrollBehaviorX = 'contain';
  track.style.scrollBehavior = 'smooth';

  // If you keep `px-2` on the track, this aligns center snaps correctly
  // 0.5rem = 8px = Tailwind px-2
  track.style.scrollPaddingInline = '0.5rem';

  // Slides are direct children of the track in your markup
  const slides = Array.from(track.children);
  if (!slides.length) return;

  // Ensure each slide is a real snap point on all browsers
  slides.forEach(el => {
    el.style.scrollSnapAlign = 'center';
    el.style.scrollSnapStop = 'always';
    // Make sure layout guarantees 1-per-view width
    el.style.minWidth = '100%';
  });

  // ----- Measurement helpers -----
  function getGap() {
    const cs = getComputedStyle(track);
    const gap = parseFloat(cs.columnGap || cs.gap || '0');
    return isNaN(gap) ? 0 : gap;
  }

  function slideSize() {
    // Use the first slide’s full rendered width + the actual flex gap
    return slides[0].offsetWidth + getGap();
  }

  function clampIndex(i) {
    return Math.max(0, Math.min(i, slides.length - 1));
  }

  function nearestIndex() {
    const size = slideSize();
    // Guard: size can be 0 briefly during layout changes
    if (size <= 0) return 0;
    return clampIndex(Math.round(track.scrollLeft / size));
  }

  // Keep our notion of the current index so arrows stay accurate
  let currentIndex = 0;

  function snapTo(i, behavior = 'smooth') {
    i = clampIndex(i);
    const size = slideSize();
    const left = i * size;
    track.scrollTo({ left, behavior });
    currentIndex = i;
    updateAvailability();
  }

  // ----- Arrow state / availability -----
  function updateAvailability() {
    const atStart = currentIndex <= 0;
    const atEnd = currentIndex >= slides.length - 1;

    prevBtn.classList.toggle('opacity-40', atStart);
    nextBtn.classList.toggle('opacity-40', atEnd);
  }

  // ----- Sharp snap enforcement (fixes iOS half-snaps) -----
  let scrollTimer = null;

  function enforceSnap() {
    // Choose the nearest slide and go there
    const i = nearestIndex();
    const size = slideSize();
    const target = i * size;
    const delta = Math.abs(track.scrollLeft - target);

    // If already essentially there, jump without animation to avoid wobble
    if (delta <= 1) {
      snapTo(i, 'auto');
    } else {
      snapTo(i, 'smooth');
    }
  }

  // Use native scrollend if present; otherwise debounce scroll
  if ('onscrollend' in window) {
    track.addEventListener('scrollend', enforceSnap, { passive: true });
  } else {
    track.addEventListener('scroll', () => {
      clearTimeout(scrollTimer);
      scrollTimer = setTimeout(enforceSnap, 80);
    }, { passive: true });
  }

  // ----- Arrow controls: move exactly one slide -----
  prevBtn.addEventListener('click', () => snapTo(currentIndex - 1));
  nextBtn.addEventListener('click', () => snapTo(currentIndex + 1));

  // Re-snap on resize / rotation so we never drift
  window.addEventListener('resize', () => snapTo(currentIndex, 'auto'));

  // Initial state
  // If starting mid-scroll for any reason, normalize to the nearest slide
  enforceSnap();
}

function addTargetToCampaignLink() {
  const links = document.querySelectorAll(
    'a.tw-inline-flex.tw-items-center.tw-space-x-2[href="/th/campaign/all-hearts-matter"], a.tw-inline-flex.tw-items-center.tw-space-x-2[href="/en/campaign/all-hearts-matter"]'
  );
  links.forEach(link => {
    link.setAttribute("target", "_blank");
    link.setAttribute("rel", "noopener noreferrer");
  });
}

//boot
let _booted = false;
function boot() {
  if (_booted) return;
  _booted = true;
  initTinyCarousel("#productCarousel", "#productImages");
  addTargetToCampaignLink();
}

// DOM ready
if (document.readyState === "complete" || document.readyState === "interactive") {
  setTimeout(boot, 0);
} else {
  document.addEventListener("DOMContentLoaded", boot, { once: true });
}


