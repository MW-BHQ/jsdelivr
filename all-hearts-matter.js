// =========================
//  Animation Counter
// =========================
function animateCount(el, target, suffix = '') {
    let start = 0;
    const duration = 1500; // in ms
    const startTime = performance.now();

    function update(timestamp) {
      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const current = Math.floor(progress * target);
      el.textContent = `${current.toLocaleString()}${suffix}`;

      if (progress < 1) {
        requestAnimationFrame(update);
      } else {
        el.textContent = `${target.toLocaleString()}${suffix}`; 
      }
    }

    el.textContent = `0${suffix}`;
    requestAnimationFrame(update);
  }

  function setupIntersectionObserver() {
    const counters = document.querySelectorAll('.count');
    const seen = new Set();

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !seen.has(entry.target)) {
          const target = parseInt(entry.target.getAttribute('data-target'), 10);
          const suffix = entry.target.getAttribute('data-suffix') || '';
          animateCount(entry.target, target, suffix);
          seen.add(entry.target);
        }
      });
    }, { threshold: 0.5 });

    counters.forEach(el => observer.observe(el));
  }

// =========================
//  VIDEO: one player at a time
// =========================
function playVideo(btn, id) {
  const carousel = document.getElementById('video-carousel');
  if (!carousel) return;
  const card = btn.closest('.relative');
  if (!card) return;

  // Reset others (avoid :scope for compatibility)
  const items = carousel.children; // direct .relative children
  for (let i = 0; i < items.length; i++) {
    const c = items[i];
    const iframe = c.querySelector('iframe');
    if (iframe) iframe.remove();
    c.querySelectorAll('img').forEach(img => img.classList.remove('invisible'));
    c.classList.add('overflow-hidden');
  }

  // Hide images in clicked card
  card.querySelectorAll('img').forEach(img => img.classList.add('invisible'));
  card.classList.add('overflow-hidden');

  // Create iframe
  const iframe = document.createElement('iframe');
  iframe.title = 'All Hearts Matter - Official Video';
  iframe.allow = 'autoplay; encrypted-media; clipboard-write; picture-in-picture; web-share';
  iframe.setAttribute('allowfullscreen', 'true');
  iframe.setAttribute('playsinline', '1');
  iframe.referrerPolicy = 'strict-origin-when-cross-origin';
  iframe.src = `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&playsinline=1&rel=0&modestbranding=1&controls=0&fs=0&iv_load_policy=3`;

  // Base positioning
  iframe.className = 'absolute inset-0 !w-full !h-full rounded-4xl';
  iframe.style.borderRadius = '2rem';

  card.appendChild(iframe);
}

  // =========================
  //  Shuffle helper
  // =========================
  function shuffleCard() {
    var container = document.getElementById('video-carousel');
    if (!container) return;
    var children = Array.prototype.slice.call(container.children);
    children.sort(function () { return Math.random() - 0.5; });
    for (var i = 0; i < children.length; i++) container.appendChild(children[i]);
  }

  // =========================
  //  Filter bar
  // =========================
  function initCardFilter() {
    var filterBar = document.getElementById('card-filters');
    var grid = document.getElementById('card-grid');
    if (!filterBar || !grid) return;

    var buttons = Array.prototype.slice.call(filterBar.querySelectorAll('button[data-filter]'));
    var cards = Array.prototype.slice.call(grid.children);

    function setActive(btn) {
      for (var i = 0; i < buttons.length; i++) {
        var b = buttons[i];
        var isActive = b === btn;
        b.classList.toggle('btn-primary', isActive && b.dataset.filter === 'all');
        b.classList.toggle('btn-outline', !(isActive && b.dataset.filter === 'all'));
        b.setAttribute('aria-pressed', String(isActive));
        if (b.dataset.filter !== 'all') {
          b.classList.toggle('btn-primary', isActive);
        }
      }
    }

    function matches(card, filter) {
      if (filter === 'all') return true;
      var tagStr = (card.getAttribute('data-tags') || '').toLowerCase();
      var tags = tagStr.split(/[\s,]+/).filter(Boolean);
      return tags.indexOf(filter.toLowerCase()) !== -1;
    }

    function applyFilter(filter) {
      for (var i = 0; i < cards.length; i++) {
        var card = cards[i];
        var show = matches(card, filter);
        if (show) {
          card.classList.remove('opacity-0', '-translate-y-2', 'pointer-events-none', 'hidden');
          void card.offsetWidth; // reflow
          card.classList.add('opacity-100', 'translate-y-0');
        } else {
          card.classList.add('opacity-0', '-translate-y-2', 'pointer-events-none');
          (function (el) {
            setTimeout(function () { el.classList.add('hidden'); }, 150);
          })(card);
          card.classList.remove('opacity-100', 'translate-y-0');
        }
      }
    }

    filterBar.addEventListener('click', function (e) {
      var btn = e.target.closest && e.target.closest('button[data-filter]');
      if (!btn) return;
      var filter = btn.dataset.filter;
      setActive(btn);
      for (var i = 0; i < cards.length; i++) cards[i].classList.remove('hidden');
      applyFilter(filter);
    });

    // initial
    applyFilter('all');
  }

  // =========================
  //  Scroll scale + fade (per card, no shrink once maxed)
  // =========================
  function initScrollCards(containerId) {
    var container = document.getElementById(containerId || 'three-words');
    if (!container) return;

    var prefersReduced = false;
    try { prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) {}

    var SCALE_MIN = 0.6;
    var SCALE_MAX = 1.0;
    var OPACITY_MIN = 0.5;

    var cards = Array.prototype.slice.call(container.children);
    var lastScale = new WeakMap();
    var lastOpacity = new WeakMap();

    function clamp(v, min, max) { return Math.min(Math.max(v, min), max); }

    function updateCards() {
      var vh = window.innerHeight || document.documentElement.clientHeight;
      var mid = vh / 2;
      var influence = Math.min(420, Math.max(280, vh * 0.45));

      for (var i = 0; i < cards.length; i++) {
        var el = cards[i];
        var rect = el.getBoundingClientRect();
        var centerY = rect.top + rect.height / 2;
        var dist = Math.abs(centerY - mid);
        var t = clamp(dist / influence, 0, 1);

        var nextScale = SCALE_MIN + (1 - t) * (SCALE_MAX - SCALE_MIN);
        var nextOpacity = OPACITY_MIN + (1 - t) * (1 - OPACITY_MIN);

        if (lastScale.has(el)) nextScale = Math.max(nextScale, lastScale.get(el));
        if (lastOpacity.has(el)) nextOpacity = Math.max(nextOpacity, lastOpacity.get(el));

        lastScale.set(el, nextScale);
        lastOpacity.set(el, nextOpacity);

        if (!prefersReduced) {
          el.style.transform = 'scale(' + nextScale + ')';
          el.style.opacity = String(nextOpacity);
        }
      }
    }

    var rafId = null;
    function onScrollResize() {
      if (rafId !== null) return;
      rafId = requestAnimationFrame(function () {
        rafId = null;
        updateCards();
      });
    }

    // Observe visibility if available
    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(onScrollResize, { threshold: [0, 0.25, 0.5, 0.75, 1] });
      for (var i = 0; i < cards.length; i++) io.observe(cards[i]);
    }

    window.addEventListener('scroll', onScrollResize, { passive: true });
    window.addEventListener('resize', onScrollResize);

    updateCards(); // initial
  }

  // =========================
  //  Unified init (works in head or body)
  // =========================
  function initAll() {
    setupIntersectionObserver();
    initCardFilter();
    shuffleCard();
    initScrollCards('three-words'); // per-card scale + fade
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAll);
  } else {
    // Script ran after DOM is already parsed
    initAll();
  }
