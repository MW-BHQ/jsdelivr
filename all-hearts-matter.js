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

function initDoctorCards(){

doctorCard(
    'นพ. เกรียงไกร เฮงรัศมี',
    'อายุรศาสตร์โรคหัวใจ',
    'รพ.หัวใจกรุงเทพ',
    '027551371',
    'https://www.bangkokhospital.com/th/bangkok-heart/doctor/dr-kriengkrai-hengrussamee',
    'https://epms.bdms.co.th/media/images/photos/BHQ/KRIENGKRAI_website_img.jpeg',
    'กรุงเทพฯ',
    '#card-grid'
);

doctorCard(
    'พญ. ชาร์มิลา เสรี',
    'อายุรศาสตร์โรคหัวใจ',
    'รพ.หัวใจกรุงเทพ',
    '027551371',
    'https://www.bangkokhospital.com/th/bangkok-heart/doctor/dr-sharmila-sehli',
    'https://bhq-cms.sgp1.digitaloceanspaces.com/uploads/2025/09/BHT-1.-%E0%B8%9E%E0%B8%8D.%E0%B8%8A%E0%B8%B2%E0%B8%A3%E0%B9%8C%E0%B8%A1%E0%B8%B4%E0%B8%A5%E0%B8%B2-%E0%B8%AB%E0%B8%B1%E0%B8%A7%E0%B9%83%E0%B8%88%E0%B9%80%E0%B8%95%E0%B9%89%E0%B8%99%E0%B8%9C%E0%B8%B4%E0%B8%94%E0%B8%88%E0%B8%B1%E0%B8%87%E0%B8%AB%E0%B8%A7%E0%B8%B0.jpg.jpg',
    'กรุงเทพฯ',
    '#card-grid'
);

doctorCard(
    'นพ. ชาติทนง ยอดวุฒิ',
    'อายุรศาสตร์โรคหัวใจ',
    'รพ.หัวใจกรุงเทพ',
    '027551371',
    'https://www.bangkokhospital.com/th/bangkok-heart/doctor/dr-chattanong-yodwut-3',
    'https://bhq-cms.sgp1.digitaloceanspaces.com/uploads/2025/09/BHT-1.%E0%B8%99%E0%B8%9E.%E0%B8%8A%E0%B8%B2%E0%B8%95%E0%B8%B4%E0%B8%97%E0%B8%99%E0%B8%87-%E0%B8%A0%E0%B8%B2%E0%B8%A7%E0%B8%B0%E0%B8%81%E0%B8%A5%E0%B9%89%E0%B8%B2%E0%B8%A1%E0%B9%80%E0%B8%99%E0%B8%B7%E0%B9%89%E0%B8%AD%E0%B8%AB%E0%B8%B1%E0%B8%A7%E0%B9%83%E0%B8%88%E0%B8%AB%E0%B8%99%E0%B8%B2%E0%B8%95%E0%B8%B1%E0%B8%A7.jpg.jpg',
    'กรุงเทพฯ',
    '#card-grid'
);

doctorCard(
    'นพ. วิชัย จิรโรจน์อังกูร',
    'อายุรศาสตร์โรคหัวใจ',
    'รพ.หัวใจกรุงเทพ',
    '027551371',
    'https://www.bangkokhospital.com/th/bangkok-heart/doctor/dr-wichai-jiraroj-ungkun',
    'https://bhq-cms.sgp1.digitaloceanspaces.com/uploads/2025/09/BHT-1.%E0%B8%99%E0%B8%9E.%E0%B8%A7%E0%B8%B4%E0%B8%8A%E0%B8%B1%E0%B8%A2-%E0%B8%AB%E0%B8%A5%E0%B8%AD%E0%B8%94%E0%B9%80%E0%B8%A5%E0%B8%B7%E0%B8%AD%E0%B8%94%E0%B8%AB%E0%B8%B1%E0%B8%A7%E0%B9%83%E0%B8%88%E0%B8%95%E0%B8%B5%E0%B8%9A.jpg',
    'กรุงเทพฯ',
    '#card-grid'
);

doctorCard(
    'นพ. วิฑูรย์ ปิติเกื้อกูล',
    'อายุรศาสตร์โรคหัวใจ',
    'รพ.หัวใจกรุงเทพ',
    '027551371',
    'https://www.bangkokhospital.com/th/bangkok-heart/doctor/dr-vitoon-pitiguagool',
    'https://bhq-cms.sgp1.digitaloceanspaces.com/uploads/2025/09/BHT-2.-%E0%B8%99%E0%B8%9E.%E0%B8%A7%E0%B8%B4%E0%B8%91%E0%B8%B9%E0%B8%A3%E0%B8%A2%E0%B9%8C-%E0%B8%AB%E0%B8%A5%E0%B8%AD%E0%B8%94%E0%B9%80%E0%B8%A5%E0%B8%B7%E0%B8%AD%E0%B8%94%E0%B8%AB%E0%B8%B1%E0%B8%A7%E0%B9%83%E0%B8%88%E0%B8%95%E0%B8%B5%E0%B8%9A.jpg',
    'กรุงเทพฯ',
    '#card-grid'
);

doctorCard(
    'นพ. อภิชัย คงพัฒนะโยธิน',
    'อายุรศาสตร์โรคหัวใจ',
    'รพ.หัวใจกรุงเทพ',
    '027551371',
    'https://www.bangkokhospital.com/th/bangkok-heart/doctor/dr-apichai-khongphatthanayothin',
    'https://bhq-cms.sgp1.digitaloceanspaces.com/uploads/2025/09/BHT-2.-%E0%B8%99%E0%B8%9E.%E0%B8%AD%E0%B8%A0%E0%B8%B4%E0%B8%8A%E0%B8%B1%E0%B8%A2-%E0%B8%A0%E0%B8%B2%E0%B8%A7%E0%B8%B0%E0%B8%81%E0%B8%A5%E0%B9%89%E0%B8%B2%E0%B8%A1%E0%B9%80%E0%B8%99%E0%B8%B7%E0%B9%89%E0%B8%AD%E0%B8%AB%E0%B8%B1%E0%B8%A7%E0%B9%83%E0%B8%88%E0%B8%9E%E0%B8%B4%E0%B8%81%E0%B8%B2%E0%B8%A3%E0%B8%AB%E0%B8%99%E0%B8%B2%E0%B8%9C%E0%B8%B4%E0%B8%94%E0%B8%9B%E0%B8%81%E0%B8%95%E0%B8%B4.jpg.jpg',
    'กรุงเทพฯ',
    '#card-grid'
);

doctorCard(
    'นพ. ชวัล ศรีศักดิ์วรากุล',
    'อายุรศาสตร์โรคหัวใจ',
    'รพ.หัวใจกรุงเทพ',
    '027551371',
    'https://www.bangkokhospital.com/th/bangkok-heart/doctor/dr-chaval-srisakvarakul',
    'https://bhq-cms.sgp1.digitaloceanspaces.com/uploads/2025/09/BHT-2.%E0%B8%99%E0%B8%9E.%E0%B8%8A%E0%B8%A7%E0%B8%B1%E0%B8%A5-%E0%B8%AB%E0%B8%B1%E0%B8%A7%E0%B9%83%E0%B8%88%E0%B9%80%E0%B8%95%E0%B9%89%E0%B8%99%E0%B8%9C%E0%B8%B4%E0%B8%94%E0%B8%88%E0%B8%B1%E0%B8%87%E0%B8%AB%E0%B8%A7%E0%B8%B0.jpg.jpg',
    'กรุงเทพฯ',
    '#card-grid'
);
    
doctorCard(
    'นพ. ทินกร สำเร็จ',
    'อายุรศาสตร์โรคหัวใจ',
    'รพ.กรุงเทพสนามจันทร์',
    '034219600',
    'https://www.bangkokhospital.com/th/sanamchan/doctor/dr-tinakorn-samrej',
    'https://bhq-cms.sgp1.digitaloceanspaces.com/uploads/2025/09/BSN-%E0%B8%99%E0%B8%9E.%E0%B8%97%E0%B8%B4%E0%B8%99%E0%B8%81%E0%B8%A3-%E0%B8%AA%E0%B8%B3%E0%B9%80%E0%B8%A3%E0%B9%87%E0%B8%88.jpg',
    'ภาคกลาง',
    '#card-grid'
);

doctorCard(
    'นพ. ปวินท์ ศิริแสงชัยกุล',
    'อายุรศาสตร์โรคหัวใจ',
    'รพ.กรุงเทพหัวหิน',
    '032616800',
    'https://www.bangkokhospital.com/th/huahin/doctor/dr-pawin-sirisaengchaikul',
    'https://bhq-cms.sgp1.digitaloceanspaces.com/uploads/2025/09/BHN-%E0%B8%99%E0%B8%9E.-%E0%B8%9B%E0%B8%A7%E0%B8%B4%E0%B8%99%E0%B8%97%E0%B9%8C-%E0%B8%A8%E0%B8%B4%E0%B8%A3%E0%B8%B4%E0%B9%81%E0%B8%AA%E0%B8%87%E0%B8%8A%E0%B8%B1%E0%B8%A2%E0%B8%81%E0%B8%B8%E0%B8%A5.jpg',
    'ภาคตะวันตก',
    '#card-grid'
);

doctorCard(
    'นพ. ชิเทพ งามเจริญ',
    'อายุรศาสตร์โรคหัวใจ',
    'รพ.กรุงเทพเมืองราช',
    '032322274',
    'https://www.bangkokhospital.com/th/ratchaburi/doctor/chithep-ngamcharoen-m-d',
    'https://bhq-cms.sgp1.digitaloceanspaces.com/uploads/2025/09/BMR-%E0%B8%99%E0%B8%9E.%E0%B8%8A%E0%B8%B4%E0%B9%80%E0%B8%97%E0%B8%9E-%E0%B8%87%E0%B8%B2%E0%B8%A1%E0%B9%80%E0%B8%88%E0%B8%A3%E0%B8%B4%E0%B8%8D.jpg',
    'ภาคตะวันตก',
    '#card-grid'
);

doctorCard(
    'นพ. ปริญญา ชมแสง',
    'อายุรศาสตร์โรคหัวใจ',
    'รพ.กรุงเทพพัทยา',
    '038259986',
    'https://bangkokpattayahospital.com/th/doctor/prinya-chomsang-m/',
    'https://static.bangkokhospital.com/uploads/2025/09/BPH-Dr.Prinya-chomsang.jpg',
    'ภาคตะวันออก',
    '#card-grid'
);

doctorCard(
    'พญ. ธิดาพร ตั้งกิตติเกษม',
    'อายุรศาสตร์โรคหัวใจ',
    'รพ.กรุงเทพจันทบุรี',
    '039319888',
    'https://bangkokhospitalchanthaburi.com/doctor/304',
    'https://bhq-cms.sgp1.digitaloceanspaces.com/uploads/2025/09/BCH-%E0%B8%9E%E0%B8%8D.%E0%B8%98%E0%B8%B4%E0%B8%94%E0%B8%B2%E0%B8%9E%E0%B8%A3-%E0%B8%95%E0%B8%B1%E0%B9%89%E0%B8%87%E0%B8%81%E0%B8%B4%E0%B8%95%E0%B8%95%E0%B8%B4%E0%B9%80%E0%B8%81%E0%B8%A9%E0%B8%A1.jpg',
    'ภาคตะวันออก',
    '#card-grid'
);

doctorCard(
    'นพ. นรารัตน์ จันทรบุตร',
    'อายุรศาสตร์โรคหัวใจ',
    'รพ.กรุงเทพตราด',
    '039319888',
    'https://www.bangkokhospital.com/th/trat/doctor/nararat-jantaraboot-m-d',
    'https://bhq-cms.sgp1.digitaloceanspaces.com/uploads/2025/09/BTH-%E0%B8%99%E0%B8%A3%E0%B8%B2%E0%B8%A3%E0%B8%B1%E0%B8%95%E0%B8%99%E0%B9%8C.jpg',
    'ภาคตะวันออก',
    '#card-grid'
);

doctorCard(
    'นพ. พงศกร บุรพัฒน์',
    'อายุรศาสตร์โรคหัวใจ',
    'รพ.กรุงเทพระยอง',
    '038921999',
    'https://www.bangkokhospitalrayong.com/',
    'https://bhq-cms.sgp1.digitaloceanspaces.com/uploads/2025/09/BRH-%E0%B8%9E%E0%B8%87%E0%B8%A8%E0%B8%81%E0%B8%A3-%E0%B8%9A%E0%B8%B8%E0%B8%A3%E0%B8%9E%E0%B8%B1%E0%B8%92%E0%B8%99%E0%B9%8C-%E0%B8%AD%E0%B8%B2%E0%B8%A2%E0%B8%B8%E0%B8%A3%E0%B8%A8%E0%B8%B2%E0%B8%AA%E0%B8%95%E0%B9%8C%E0%B9%82%E0%B8%A3%E0%B8%84%E0%B8%AB%E0%B8%B1%E0%B8%A7%E0%B9%83%E0%B8%88.jpg.jpg',
    'ภาคตะวันออก',
    '#card-grid'
);
    
doctorCard(
    'นพ. ปรัชญ์ ฉั่วริยะกุล',
    'อายุรศาสตร์โรคหัวใจ',
    'รพ.กรุงเทพเชียงใหม่',
    '052089888',
    'https://www.bangkokhospital.com/th/chiangmai/doctor/prach-chuariyakul-m-d',
    'https://bhq-cms.sgp1.digitaloceanspaces.com/uploads/2025/09/BCM-%E0%B8%99%E0%B8%9E.-%E0%B8%9B%E0%B8%A3%E0%B8%B1%E0%B8%8A%E0%B8%8D%E0%B9%8C-%E0%B8%89%E0%B8%B1%E0%B9%88%E0%B8%A7%E0%B8%A3%E0%B8%B4%E0%B8%A2%E0%B8%B0%E0%B8%81%E0%B8%B8%E0%B8%A5.jpg',
    'ภาคเหนือ',
    '#card-grid'
);

doctorCard(
    'นพ. ชาติทนง ยอดวุฒิ',
    'อายุรศาสตร์โรคหัวใจ',
    'รพ.กรุงเทพเชียงราย',
    '052051800',
    'https://www.bangkokhospital.com/th/chiangrai/doctor/chattanong-yodwut-m-d',
    'https://bhq-cms.sgp1.digitaloceanspaces.com/uploads/2025/09/BHT-1.%E0%B8%99%E0%B8%9E.%E0%B8%8A%E0%B8%B2%E0%B8%95%E0%B8%B4%E0%B8%97%E0%B8%99%E0%B8%87-%E0%B8%A0%E0%B8%B2%E0%B8%A7%E0%B8%B0%E0%B8%81%E0%B8%A5%E0%B9%89%E0%B8%B2%E0%B8%A1%E0%B9%80%E0%B8%99%E0%B8%B7%E0%B9%89%E0%B8%AD%E0%B8%AB%E0%B8%B1%E0%B8%A7%E0%B9%83%E0%B8%88%E0%B8%AB%E0%B8%99%E0%B8%B2%E0%B8%95%E0%B8%B1%E0%B8%A7.jpg.jpg',
    'ภาคเหนือ',
    '#card-grid'
);

doctorCard(
    'พญ. วริศรา เพชรวิภูษิต',
    'อายุรศาสตร์โรคหัวใจ',
    'รพ.กรุงเทพพิษณุโลก',
    '055051724',
    'https://www.bangkokhospital.com/th/phitsanulok/doctor/warisara-petvipusit-m-d',
    'https://bhq-cms.sgp1.digitaloceanspaces.com/uploads/2025/09/BPL-%E0%B9%82%E0%B8%9B%E0%B8%A3%E0%B9%82%E0%B8%A1%E0%B8%97%E0%B8%AB%E0%B8%A1%E0%B8%AD%E0%B8%AB%E0%B8%B1%E0%B8%A7%E0%B9%83%E0%B8%88-nw-01.jpg.jpg',
    'ภาคกลาง',
    '#card-grid'
);

doctorCard(
    'นพ. สิปวัฒน์ ขำปลอด',
    'หัตถการปฏิบัติรักษาโรคหัวใจและหลอดเลือด',
    'รพ.กรุงเทพพิษณุโลก',
    '055051724',
    'https://www.bangkokhospital.com/th/phitsanulok/doctor/sipawath-khamplod-m-d',
    'https://bhq-cms.sgp1.digitaloceanspaces.com/uploads/2025/09/BPL-%E0%B8%99%E0%B8%9E-%E0%B8%A5%E0%B8%B4%E0%B8%9B%E0%B8%A7%E0%B8%B1%E0%B8%92%E0%B8%99%E0%B9%8C-%E0%B8%82%E0%B8%B3%E0%B8%9B%E0%B8%A5%E0%B8%AD%E0%B8%94.jpg',
    'ภาคกลาง',
    '#card-grid'
);

doctorCard(
    'นพ. สรวิศ กังธีระวัฒน์',
    'อายุรศาสตร์โรคหัวใจ',
    'รพ.กรุงเทพพิษณุโลก',
    '055051724',
    'https://www.bangkokhospital.com/th/phitsanulok/doctor/sorawit-kangtherawat-m-d',
    'https://bhq-cms.sgp1.digitaloceanspaces.com/uploads/2025/09/BPL-%E0%B8%99%E0%B8%9E-%E0%B8%AA%E0%B8%A3%E0%B8%A7%E0%B8%B4%E0%B8%A8-%E0%B8%81%E0%B8%B1%E0%B8%87%E0%B8%98%E0%B8%B5%E0%B8%A3%E0%B8%B0%E0%B8%A7%E0%B8%B1%E0%B8%92%E0%B8%99%E0%B9%8C.jpg',
    'ภาคกลาง',
    '#card-grid'
);

doctorCard(
    'นพ. วรัตถ์ ประยูรวิวัฒน์',
    'อายุรศาสตร์โรคหัวใจ',
    'รพ.กรุงเทพพิษณุโลก',
    '055051724',
    'https://www.bangkokhospital.com/th/phitsanulok/doctor/warath-prayoonwiwat-m-d',
    'https://bhq-cms.sgp1.digitaloceanspaces.com/uploads/2025/09/BPL-%E0%B9%82%E0%B8%9B%E0%B8%A3%E0%B9%82%E0%B8%A1%E0%B8%97%E0%B8%AB%E0%B8%A1%E0%B8%AD%E0%B8%A7%E0%B8%A3%E0%B8%B1%E0%B8%95%E0%B8%96%E0%B9%8C-%E0%B8%AB%E0%B8%B1%E0%B8%A7%E0%B9%83%E0%B8%88-01.jpg',
    'ภาคกลาง',
    '#card-grid'
);
    
doctorCard(
    'พญ. วชิราภา เจริญผล',
    'อายุรศาสตร์โรคหัวใจ',
    'รพ.กรุงเทพปากช่อง',
    '044088960',
    'https://www.bangkokhospital.com/th/pakchong/doctor/wachirapa-charoenpol-m-d',
    'https://bhq-cms.sgp1.digitaloceanspaces.com/uploads/2025/09/BHP-%E0%B8%9E%E0%B8%8D.%E0%B8%A7%E0%B8%8A%E0%B8%B4%E0%B8%A3%E0%B8%B2%E0%B8%A0%E0%B8%B2-%E0%B9%80%E0%B8%88%E0%B8%A3%E0%B8%B4%E0%B8%8D%E0%B8%9C%E0%B8%A5.jpg',
    'ตะวันออกเฉียงเหนือ',
    '#card-grid'
);

doctorCard(
    'นพ. ไกรสร อนุตรพงษ์พันธ์',
    'อายุรศาสตร์โรคหัวใจ',
    'รพ.กรุงเทพขอนแก่น',
    '043042888',
    'https://www.bangkokhospital.com/th/khonkaen/doctor/kraisorn-anutarapongpan-m-d',
    'https://bhq-cms.sgp1.digitaloceanspaces.com/uploads/2025/09/BKN-%E0%B8%99%E0%B8%9E.%E0%B9%84%E0%B8%81%E0%B8%A3%E0%B8%AA%E0%B8%A3-%E0%B8%AD%E0%B8%99%E0%B8%B8%E0%B8%95%E0%B8%A3%E0%B8%9E%E0%B8%87%E0%B8%A9%E0%B9%8C%E0%B8%9E%E0%B8%B1%E0%B8%99%E0%B8%98%E0%B9%8C.jpg',
    'ตะวันออกเฉียงเหนือ',
    '#card-grid'
);

doctorCard(
    'นพ. พินิจ แก้วสุวรรณะ',
    'อายุรศาสตร์โรคหัวใจ',
    'รพ.กรุงเทพราชสีมา',
    '044015999',
    'https://www.bangkokhospital.com/th/ratchasima/doctor/pinij-kaewsuwanna-m-d',
    'https://bhq-cms.sgp1.digitaloceanspaces.com/uploads/2025/09/BKH-%E0%B8%99%E0%B8%9E.%E0%B8%9E%E0%B8%B4%E0%B8%99%E0%B8%B4%E0%B8%88-%E0%B9%81%E0%B8%81%E0%B9%89%E0%B8%A7%E0%B8%AA%E0%B8%B8%E0%B8%A7%E0%B8%A3%E0%B8%A3%E0%B8%93%E0%B8%B0.jpg',
    'ตะวันออกเฉียงเหนือ',
    '#card-grid'
);

doctorCard(
    'นพ. เกษม ตันติพานิชธีระกุล',
    'อายุรศาสตร์โรคหัวใจ',
    'รพ.กรุงเทพอุดร',
    '042188999',
    'https://www.bangkokhospital.com/th/udon/doctor/dr-kasem-tantipanichteerakul',
    'https://static.bangkokhospital.com/uploads/2025/09/BUD-kasem-tantipanichteerakul.jpg.jpg',
    'ตะวันออกเฉียงเหนือ',
    '#card-grid'
);

doctorCard(
    'นพ. ณัฏฐ์ ชวณิชย์',
    'อายุรศาสตร์โรคหัวใจ',
    'รพ.กรุงเทพสมุย',
    '077429500',
    'https://bangkokhospitalsamui.com/th/doctor/nat-chawanid/',
    'https://bhq-cms.sgp1.digitaloceanspaces.com/uploads/2025/09/BSH-%E0%B8%99%E0%B8%9E.%E0%B8%93%E0%B8%B1%E0%B8%8E%E0%B8%90%E0%B9%8C-%E0%B8%8A%E0%B8%A7%E0%B8%93%E0%B8%B4%E0%B8%8A%E0%B8%A2%E0%B9%8C.jpg',
    'ภาคใต้',
    '#card-grid'
);

doctorCard(
    'พญ. ธนวัน สิริวิวัฒน์ธน',
    'อายุรศาสตร์โรคหัวใจ',
    'รพ.กรุงเทพสุราษฎร์',
    '077956789',
    'https://www.bangkokhospitalsurat.com/doctor/%E0%B8%9E%E0%B8%8D-%E0%B8%98%E0%B8%99%E0%B8%A7%E0%B8%B1%E0%B8%99-%E0%B8%AA%E0%B8%B4%E0%B8%A3%E0%B8%B4%E0%B8%A7%E0%B8%B4%E0%B8%A7%E0%B8%B1%E0%B8%92%E0%B8%99%E0%B9%8C%E0%B8%98%E0%B8%99/',
    'https://bhq-cms.sgp1.digitaloceanspaces.com/uploads/2025/09/BSR_%E0%B8%9E%E0%B8%8D.%E0%B8%98%E0%B8%99%E0%B8%A7%E0%B8%B1%E0%B8%99-%E0%B8%AA%E0%B8%B4%E0%B8%A3%E0%B8%B4%E0%B8%A7%E0%B8%B4%E0%B8%A7%E0%B8%B1%E0%B8%92%E0%B8%99%E0%B9%8C%E0%B8%98%E0%B8%99.png.jpg',
    'ภาคใต้',
    '#card-grid'
);

doctorCard(
    'นพ. สิปป์ภวิชญ์ อิสริวาทีกร',
    'อายุรศาสตร์โรคหัวใจ',
    'รพ.กรุงเทพสิริโรจน์',
    '076361888',
    'https://www.phuketinternationalhospital.com/doctors/sippawit-itsariwateekorn/',
    'https://www.phuketinternationalhospital.com/wp-content/uploads/2022/08/1.png',
    'ภาคใต้',
    '#card-grid'
);

doctorCard(
    'ผศ.นพ. ชูศักดิ์ คุปตานนท์',
    'ศัลยศาสตร์หัวใจหลอดเลือดและทรวงอก',
    'รพ.กรุงเทพภูเก็ต',
    '076254425',
    'https://www.phukethospital.com/th/doctor/chusak-kuptarnond/',
    'https://www.phukethospital.com/wp-content/webp-express/webp-images/doc-root/wp-content/uploads/2018/10/chusak.jpg.webp',
    'ภาคใต้',
    '#card-grid'
);

doctorCard(
    'นพ. บุญสม จันศิริมงคล',
    'อายุรศาสตร์โรคหัวใจ',
    'รพ.กรุงเทพหาดใหญ่',
    '074272800',
    'https://www.bangkokhospital.com/th/hatyai/doctor/dr-boonsom-junsirimongkol',
    'https://epms.bdms.co.th/media/images/photos/BHH/244546_730A1049.jpg',
    'ภาคใต้',
    '#card-grid'
);

}

// =========================
//  Unified init
// =========================
(function () {
  let booted = false;
  const flags = { counters:false, cards:false, filters:false, scroll:false };

  function initCounters() {
    if (flags.counters) return;
    if (document.querySelector('.count')) {
      setupIntersectionObserver();
      flags.counters = true;
    }
  }
  function initCards() {
    if (flags.cards) return;
    const grid = document.getElementById('card-grid');
    if (grid) {
      if (grid.children.length === 0) initDoctorCards();
      flags.cards = grid.children.length > 0;
    }
  }
  function initFilters() {
    if (flags.filters) return;
    if (document.getElementById('card-filters')) {
      initCardFilter(); flags.filters = true;
    }
  }
  function initScroll() {
    if (flags.scroll) return;
    if (document.getElementById('three-words')) {
      initScrollCards('three-words'); flags.scroll = true;
    }
  }

  function bootOnce() {
    if (booted) return;
    booted = true;
    try { initCounters(); } catch(e){ console.error('counters failed:', e); }
    try { initCards(); }    catch(e){ console.error('cards failed:', e); }
    try { initFilters(); }  catch(e){ console.error('filters failed:', e); }
    try { initScroll(); }   catch(e){ console.error('scroll failed:', e); }
    console.info('[AHM] booted');
  }

  function tick() {
    // rerun per-component in case DOM was swapped
    try { initCounters(); } catch(e){}
    try { initCards(); }    catch(e){}
    try { initFilters(); }  catch(e){}
    try { initScroll(); }   catch(e){}
  }

  // fire across realistic lifecycles
  if (document.readyState !== 'loading') bootOnce();
  document.addEventListener('DOMContentLoaded', bootOnce, {once:true});
  window.addEventListener('load', bootOnce, {once:true});
  window.addEventListener('pageshow', () => { // BFCache restore
    flags.counters = false; flags.scroll = false; flags.filters = false;
    // keep cards if grid still has nodes
    const grid = document.getElementById('card-grid');
    flags.cards = !!(grid && grid.children.length > 0);
    tick();
  });

  // observe DOM swaps/hydration
  const mo = new MutationObserver(tick);
  mo.observe(document.body, { childList:true, subtree:true });

  // last resort: periodic debounce for hostile environments
  let t; const ping = () => { clearTimeout(t); t = setTimeout(tick, 200); };
  document.addEventListener('visibilitychange', ping);
})();


