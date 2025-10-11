function initArrowCarousel(wrapperSelector, trackSelector) {
  const root = document.querySelector(wrapperSelector);
  if (!root) return;

  const track = root.querySelector(trackSelector);
  const prevBtn = root.querySelector('.prev');
  const nextBtn = root.querySelector('.next');
  if (!track || !prevBtn || !nextBtn) return;

  const slides = Array.from(track.children);
  if (!slides.length) return;

  let currentIndex = 0;
  let scrollTimer = null;

  function nearestIndex() {
    const sLeft = track.scrollLeft;
    let nearest = 0;
    let minDelta = Infinity;
    slides.forEach((slide, i) => {
      // use offsetLeft so % widths / gaps are handled robustly
      const delta = Math.abs(sLeft - slide.offsetLeft);
      if (delta < minDelta) {
        minDelta = delta;
        nearest = i;
      }
    });
    return nearest;
  }

  function updateAvailability(idx) {
    // idx optional; fallback to nearest
    if (typeof idx === 'undefined') idx = nearestIndex();
    currentIndex = idx;

    const maxScroll = track.scrollWidth - track.clientWidth;
    const atStart = currentIndex <= 0;
    // mark as atEnd either when index is last OR scroll is effectively at the end
    const atEnd = currentIndex >= slides.length - 1 || track.scrollLeft >= (maxScroll - 1);

    // visual + interaction state
    prevBtn.classList.toggle('opacity-40', atStart);
    prevBtn.classList.toggle('pointer-events-none', atStart);

    nextBtn.classList.toggle('opacity-40', atEnd);
    nextBtn.classList.toggle('pointer-events-none', atEnd);
  }

  function snapTo(i) {
    i = Math.max(0, Math.min(i, slides.length - 1));
    const left = slides[i].offsetLeft;
    track.scrollTo({ left, behavior: 'smooth' });
    currentIndex = i;
    updateAvailability(i);
  }

  prevBtn.addEventListener('click', () => snapTo(currentIndex - 1));
  nextBtn.addEventListener('click', () => snapTo(currentIndex + 1));

  // Enforce a clean snap when scrolling ends (native scrollend if available, otherwise debounce)
  function onScrollEnd() {
    clearTimeout(scrollTimer);
    scrollTimer = null;

    // If we're essentially at the end, snap to the last slide to avoid trim
    const maxScroll = track.scrollWidth - track.clientWidth;
    if (track.scrollLeft >= maxScroll - 1) {
      snapTo(slides.length - 1);
      return;
    }

    // otherwise pick nearest slide and snap there
    const i = nearestIndex();
    track.scrollTo({ left: slides[i].offsetLeft, behavior: 'smooth' });
    currentIndex = i;
    updateAvailability(i);
  }

  if ('onscrollend' in window) {
    track.addEventListener('scrollend', onScrollEnd, { passive: true });
  } else {
    track.addEventListener('scroll', () => {
      // debounce: wait for small pause in scroll then finalize
      clearTimeout(scrollTimer);
      scrollTimer = setTimeout(onScrollEnd, 100);
    }, { passive: true });
  }

  // Recompute on resize (prevent drift)
  let resizeTimer = null;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      // reposition to current slide exactly (auto)
      if (slides[currentIndex]) {
        track.scrollTo({ left: slides[currentIndex].offsetLeft, behavior: 'auto' });
      }
      updateAvailability();
    }, 80);
  });

  // initial availability
  updateAvailability(0);
}

// boot it
//document.addEventListener('DOMContentLoaded', () => {
//  initArrowCarousel('#carousel', '#cards');
//});
