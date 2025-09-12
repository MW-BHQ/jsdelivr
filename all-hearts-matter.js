// =========================
//  Animation Counter
// =========================
function animateCount(el, target, suffix = '') {
  const duration = 1500; // ms
  const startTime = performance.now();

  function update(timestamp) {
    const elapsed = timestamp - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const current = Math.floor(progress * target);
    el.textContent = `${current.toLocaleString()}${suffix}`;
    if (progress < 1) requestAnimationFrame(update);
    else el.textContent = `${target.toLocaleString()}${suffix}`;
  }

  el.textContent = `0${suffix}`;
  requestAnimationFrame(update);
}

function setupIntersectionObserver() {
  const counters = document.querySelectorAll('.count');
  const seen = new Set();

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting || seen.has(entry.target)) return;

      const raw = entry.target.getAttribute('data-target');
      const target = Number(raw);
      if (!Number.isFinite(target)) { observer.unobserve(entry.target); return; }

      const suffix = entry.target.getAttribute('data-suffix') || '';
      animateCount(entry.target, target, suffix);
      seen.add(entry.target);
      observer.unobserve(entry.target); // free it
    });
  }, { threshold: 0.5 });

  counters.forEach(el => observer.observe(el));
}

// =========================
//  VIDEO: one player at a time
// =========================
function playVideo(btn, id, parent_block) {
  const carousel = document.getElementById(parent_block);
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
//  Shuffle Cards
// =========================
  function shuffleCard() {
    var container = document.getElementById('video-carousel');
    if (!container) return;
    var children = Array.prototype.slice.call(container.children);
    children.sort(function () { return Math.random() - 0.5; });
    for (var i = 0; i < children.length; i++) container.appendChild(children[i]);
  }

// =========================
//  Filter Doctor Cards
// =========================
  function initCardFilter() {
    var filterBar = document.getElementById('card-filters');
    var grid = document.getElementById('card-grid');
    if (!filterBar || !grid) return;

    var buttons = Array.prototype.slice.call(filterBar.querySelectorAll('button[data-filter]'));
    var cards = Array.prototype.slice.call(grid.children);

    function setActive(btn) {
      buttons.forEach(b => {
        const isActive = b === btn;
        b.classList.toggle('bg-[#e7edfe]', isActive && b.dataset.filter === 'all'); // keep All solid when active
        b.classList.toggle('bg-none', !(isActive && b.dataset.filter === 'all'));
        b.setAttribute('aria-pressed', String(isActive));
        if (b.dataset.filter !== 'all') {
          b.classList.toggle('bg-[#e7edfe]', isActive);
        }
      });
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
//  Doctor Cards Renderer
// =========================
function doctorCard(
  name,
  department,
  specialty,   // single string
  appointment, // link or phone number
  profileUrl,
  imageUrl,
  tag,
  mount        // optional container selector or element
) {
  const isPhone = /^\s*(tel:)?\+?[\d\s\-()]{6,}\s*$/.test(String(appointment));
  const apptHref = isPhone
    ? (String(appointment).trim().toLowerCase().startsWith("tel:")
        ? String(appointment).trim()
        : "tel:" + String(appointment).replace(/[^\d+]/g, ""))
    : String(appointment || "#");

  const html = `
<div data-tags="${tag}"
  class="tw-flex tw-flex-col tw-justify-between tw-w-full tw-h-full !tw-bg-white tw-shadow-main-blue tw-rounded-lg tw-overflow-hidden tw-relative">
  <a href="${profileUrl}"
     class="tw-px-4 tw-py-6 tw-flex md:tw-flex-col md:tw-space-y-6 md:tw-space-x-0 tw-space-x-6 tw-flex-row md:tw-items-center tw-relative !no-underline !hover:no-underline">
    <div class="tw-p-1.5 tw-shadow-main-blue tw-bg-white tw-rounded-full tw-h-min tw-w-min tw-flex-none">
      <div class="tw-relative sm:tw-size-32 tw-size-[28vw] tw-rounded-full tw-overflow-hidden">
        <div class="tw-absolute tw-top-0 tw-left-0 tw-w-full tw-h-full tw-overflow-hidden">
          <img alt="${name}" loading="lazy" decoding="async" data-nimg="fill"
               class="tw-object-cover !tw-top-0 !tw-left-0 tw-duration-300 tw-delay-[50ms] tw-opacity-100 tw-object-top"
               style="position:absolute;height:100%;width:100%;left:0;top:0;right:0;bottom:0;color:transparent"
               src="${imageUrl}">
          <span class="MuiSkeleton-root MuiSkeleton-rounded MuiSkeleton-wave !tw-absolute !tw-top-0 !tw-left-0 !tw-duration-500 tw-opacity-0 mui-1mrmhwg"
                style="width:100%;height:100%"></span>
        </div>
      </div>
    </div>

    <div class="tw-flex tw-flex-col md:tw-items-center tw-items-start sm:tw-space-y-2 tw-space-y-3 tw-w-full">
      <h3 class="!text-base !tw-text-primary !tw-font-bold md:tw-text-center !text-[#363636] !no-underline !bg-none !mb-0 !leading-none">
        ${name}
      </h3>
      <h4 class="!tw-text-sm md:tw-text-center max-sm:tw-line-clamp-2">
        ${department}
      </h4>
      <span class="p-1 px-4 text-sm font-semibold rounded-full !bg-[#e7edff] !text-[#0147a3]"
            style="font-family:var(--font-satoshi), var(--font-aktiv);">
        ${specialty}
      </span>
    </div>
  </a>

  <div class="tw-grid tw-grid-cols-2">
    <a href="${apptHref}">
      <div class="tw-flex tw-items-center tw-justify-center tw-space-x-2 tw-w-full sm:tw-py-4 tw-py-3 tw-group tw-bg-bgh-gray-primary/5 hover:tw-bg-bgh-blue-alpha tw-duration-200 tw-cursor-pointer">
        <i class="far fa-calendar-range tw-text-bgh-gray-dark group-hover:tw-text-primary tw-duration-200 max-sm:tw-text-sm" aria-hidden="true"></i>
        <div class="tw-text-bgh-gray-dark group-hover:tw-text-primary tw-duration-200 text-xs no-underline tw-font-bold"
             style="font-family:var(--font-satoshi), var(--font-aktiv);">นัดหมาย</div>
      </div>
    </a>
    <a href="${profileUrl}" class="border-l border-[#e7edff]">
      <div class="tw-flex tw-items-center tw-justify-center tw-space-x-2 tw-w-full sm:tw-py-4 tw-py-3 tw-group tw-bg-bgh-gray-primary/5 hover:tw-bg-bgh-blue-alpha tw-duration-200 tw-cursor-pointer">
        <i class="far fa-info-circle tw-text-bgh-gray-dark group-hover:tw-text-primary tw-duration-200 max-sm:tw-text-sm" aria-hidden="true"></i>
        <div class="tw-text-bgh-gray-dark group-hover:tw-text-primary tw-duration-200 text-xs no-underline tw-font-bold"
             style="font-family:var(--font-satoshi), var(--font-aktiv);">รายละเอียด</div>
      </div>
    </a>
  </div>
</div>`.trim();

  const tpl = document.createElement("template");
  tpl.innerHTML = html;
  const card = tpl.content.firstElementChild;

  let mountEl = null;
  if (mount) {
    mountEl = typeof mount === "string" ? document.querySelector(mount) : mount;
  }
  if (mountEl) {
    mountEl.appendChild(card);
  } else {
    // fallback: insert before current script (single use)
    const anchor = document.currentScript;
    if (anchor && anchor.parentNode) anchor.insertAdjacentElement("beforebegin", card);
  }
  return card;
}//#doctor cards

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
//  Unified init
// =========================
// keep your function defs above (setupIntersectionObserver, initCardFilter, shuffleCard, initScrollCards)

function safeInitAll() {
  try { setupIntersectionObserver(); } catch(e){ console.error(e); }
  try { initCardFilter(); }           catch(e){ console.error(e); }
  try { shuffleCard(); }              catch(e){ console.error(e); }
  try { initScrollCards('three-words'); } catch(e){ console.error(e); }
}

/**
 * Hydration-safe boot:
 * - waits for window 'load'
 * - then waits until the main thread is quiet (no long tasks) for QUIET_MS
 * - then yields 2 RAFs (lets React paint) and runs once
 */
(function () {
  const MIN_DELAY_MS = 1500;   // baseline delay after load
  const QUIET_MS     = 2000;  // time with no long tasks before we proceed
  let booted = false;
  let lastLongTask = performance.now();
  let po;

  function markLongTask(list) {
    // Any long task restarts the quiet timer
    const entries = list.getEntries();
    if (entries && entries.length) {
      lastLongTask = entries[entries.length - 1].startTime + entries[entries.length - 1].duration;
    }
  }

  function whenQuietThenBoot() {
    if (booted) return;

    const now = performance.now();
    const quietEnough = (now - lastLongTask) >= QUIET_MS;

    if (!quietEnough) {
      // check again soon
      setTimeout(whenQuietThenBoot, 200);
      return;
    }

    // extra safety: yield two frames so React can paint/commit.
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        if (booted) return;
        booted = true;
        try { po && po.disconnect(); } catch(_) {}
        safeInitAll();
        console.info('[AHM] booted after hydration (quiet period reached)');
      });
    });
  }

  function schedule() {
    // Start observing long tasks (if supported)
    try {
      if ('PerformanceObserver' in window && PerformanceObserver.supportedEntryTypes?.includes('longtask')) {
        po = new PerformanceObserver(markLongTask);
        po.observe({ entryTypes: ['longtask'] });
      }
    } catch (_) {}

    // Start after a minimal baseline delay
    setTimeout(whenQuietThenBoot, MIN_DELAY_MS);
  }

  if (document.readyState === 'complete') {
    schedule();
  } else {
    window.addEventListener('load', schedule, { once: true });
  }

  // BFCache restore / in-app webviews
  window.addEventListener('pageshow', (e) => {
    if (e.persisted) {
      booted = false;
      lastLongTask = performance.now();
      schedule();
    }
  });
})();
