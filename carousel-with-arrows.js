//Carousel with arrows

function initTinyCarousel(wrapperSelector, trackSelector) {
  const root = document.querySelector(wrapperSelector);
  if (!root) return;

  const track = root.querySelector(trackSelector);
  const prevBtn = root.querySelector('.prev');
  const nextBtn = root.querySelector('.next');

  if (!track || !prevBtn || !nextBtn) return;

  function updateAvailability() {
    const { scrollLeft, scrollWidth, clientWidth } = track;
    const max = Math.max(0, scrollWidth - clientWidth - 1); // tolerance

    // Just flip opacity
    prevBtn.classList.toggle('opacity-40', scrollLeft <= 0);
    nextBtn.classList.toggle('opacity-40', scrollLeft >= max);
  }

  function scrollByAmount(dir) {
    const amount = Math.round(track.clientWidth * 0.9);
    track.scrollBy({ left: dir * amount, behavior: 'smooth' });
  }

  prevBtn.addEventListener('click', () => scrollByAmount(-1));
  nextBtn.addEventListener('click', () => scrollByAmount(1));
  track.addEventListener('scroll', updateAvailability, { passive: true });
  window.addEventListener('resize', updateAvailability);

  updateAvailability();
}

function addTargetToCampaignLink() {
  const link = document.querySelector(
    'a.tw-inline-flex.tw-items-center.tw-space-x-2[href="/th/campaign/all-hearts-matter"]'
  );
  if (link) {
    link.setAttribute("target", "_blank");
    link.setAttribute("rel", "noopener noreferrer"); // security best practice
  }
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
  // queue to end of current tick so layout is settled
  setTimeout(boot, 0);
} else {
  document.addEventListener("DOMContentLoaded", boot, { once: true });
}
