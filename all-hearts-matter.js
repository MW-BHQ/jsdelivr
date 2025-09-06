//animate counting
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

// click to play youtube
  function playVideo(btn, id) {
    const carousel = document.getElementById('video-carousel');
    const card = btn.closest('.relative'); 

    // 1) Reset all other cards back to thumbnails (remove iframe, show images)
    carousel.querySelectorAll(':scope > .relative').forEach((c) => {
      const iframe = c.querySelector('iframe');
      if (iframe) iframe.remove();
      // Show both images again
      c.querySelectorAll('img').forEach(img => img.classList.remove('invisible'));
      // Make sure the card clips any overflow
      c.classList.add('overflow-hidden'); // safe even if already there
    });

    // 2) Hide the two images in the clicked card but keep their space
    //    (use 'invisible' so layout/aspect stays the same and the iframe fits)
    card.querySelectorAll('img').forEach(img => img.classList.add('invisible'));
    card.classList.add('overflow-hidden'); // clip iframe edges to rounded corners

    // 3) Create the iframe and overlay it inside the same card
    const iframe = document.createElement('iframe');
    iframe.className = 'absolute inset-0 w-full h-full rounded-2xl';
    iframe.title = 'YouTube video player';
    iframe.allow = 'autoplay; encrypted-media; clipboard-write; picture-in-picture; web-share';
    iframe.setAttribute('allowfullscreen', 'true');
    iframe.setAttribute('playsinline', '1');
    iframe.referrerPolicy = 'strict-origin-when-cross-origin';
    iframe.src = `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&playsinline=1&rel=0&modestbranding=1&controls=0&fs=0&iv_load_policy=3`;

    card.appendChild(iframe);
  }

//shuffle cards
  function shuffleCard(){
    const container = document.querySelector('#video-carousel');
    const children = Array.from(container.children);
    children.sort(() => Math.random() - 0.5);
    children.forEach(child => container.appendChild(child));
  }

//cards filter 
  function initCardFilter() {
    const filterBar = document.getElementById('card-filters');
    const buttons = Array.from(filterBar.querySelectorAll('button[data-filter]'));
    const grid = document.getElementById('card-grid');
    const cards = Array.from(grid.children);

    function setActive(btn) {
      buttons.forEach(b => {
        const isActive = b === btn;
        b.classList.toggle('btn-primary', isActive && b.dataset.filter === 'all'); // keep All solid when active
        b.classList.toggle('btn-outline', !(isActive && b.dataset.filter === 'all'));
        b.setAttribute('aria-pressed', String(isActive));
        if (b.dataset.filter !== 'all') {
          b.classList.toggle('btn-primary', isActive);
        }
      });
    }

    function matches(card, filter) {
      if (filter === 'all') return true;
      const tags = (card.getAttribute('data-tags') || '')
        .toLowerCase()
        .split(/[\s,]+/)
        .filter(Boolean);
      return tags.includes(filter.toLowerCase());
    }

    function applyFilter(filter) {
      cards.forEach(card => {
        const show = matches(card, filter);
        if (show) {
          card.classList.remove('opacity-0', '-translate-y-2', 'pointer-events-none', 'hidden');
          void card.offsetWidth; // force reflow
          card.classList.add('opacity-100', 'translate-y-0');
        } else {
          card.classList.add('opacity-0', '-translate-y-2', 'pointer-events-none');
          setTimeout(() => card.classList.add('hidden'), 150);
          card.classList.remove('opacity-100', 'translate-y-0');
        }
      });
    }

    filterBar.addEventListener('click', (e) => {
      const btn = e.target.closest('button[data-filter]');
      if (!btn) return;
      const filter = btn.dataset.filter;
      setActive(btn);
      cards.forEach(c => c.classList.remove('hidden'));
      applyFilter(filter);
    });

    // initial state (All)
    applyFilter('all');
  }

//scalling
const container = document.getElementById('three-words');
const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const SCALE_MIN = 0.8;
const SCALE_MAX = 1.0;
let currentScale = SCALE_MIN; // keep track to avoid shrinking

  function clamp(v, min, max) {
    return Math.min(Math.max(v, min), max);
  }

  function updateContainerScale() {
    const vh = window.innerHeight;
    const mid = vh / 2;

    const rect = container.getBoundingClientRect();
    const centerY = rect.top + rect.height / 2;
    const dist = Math.abs(centerY - mid);

    const influence = Math.min(420, Math.max(280, vh * 0.45));
    const t = clamp(dist / influence, 0, 1);

    // Normal scale formula
    let scale = SCALE_MIN + (1 - t) * (SCALE_MAX - SCALE_MIN);

    // Prevent scale from decreasing once it has reached max
    if (scale < currentScale) {
      scale = currentScale;
    }
    currentScale = scale;

    if (!prefersReduced) {
      container.style.transform = `scale(${scale})`;
    }
  }

  function onScrollResize() {
    requestAnimationFrame(updateContainerScale);
  }

  window.addEventListener('scroll', onScrollResize, { passive: true });
  window.addEventListener('resize', onScrollResize);
//#scalling

// Call functions after being ready

document.addEventListener("readystatechange", (event) => {
  if (event.target.readyState === "interactive") {
    //initLoader();
  } else if (event.target.readyState === "complete") {
    setupIntersectionObserver();
    initCardFilter();
    shuffleCard();
    updateContainerScale();
  }
});
