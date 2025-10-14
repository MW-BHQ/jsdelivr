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

  // slide's left *within* the scroll container
  const leftInTrack = (el) =>
    el.getBoundingClientRect().left - track.getBoundingClientRect().left + track.scrollLeft;

  function nearestIndex() {
    const sLeft = track.scrollLeft;
    let nearest = 0;
    let minDelta = Infinity;
    slides.forEach((slide, i) => {
      const delta = Math.abs(sLeft - leftInTrack(slide));
      if (delta < minDelta) { minDelta = delta; nearest = i; }
    });
    return nearest;
  }

  function updateAvailability(idx) {
    if (typeof idx === 'undefined') idx = nearestIndex();
    currentIndex = idx;

    const maxScroll = track.scrollWidth - track.clientWidth;
    const atStart = currentIndex <= 0 || track.scrollLeft <= 0;
    const atEnd = currentIndex >= slides.length - 1 || track.scrollLeft >= (maxScroll - 1);

    prevBtn.classList.toggle('opacity-40', atStart);
    prevBtn.classList.toggle('pointer-events-none', atStart);
    nextBtn.classList.toggle('opacity-40', atEnd);
    nextBtn.classList.toggle('pointer-events-none', atEnd);
  }

  function snapTo(i) {
    i = Math.max(0, Math.min(i, slides.length - 1));
    track.scrollTo({ left: leftInTrack(slides[i]), behavior: 'smooth' });
    currentIndex = i;
    updateAvailability(i);
  }

  prevBtn.addEventListener('click', () => snapTo(currentIndex - 1));
  nextBtn.addEventListener('click', () => snapTo(currentIndex + 1));

  function onScrollEnd() {
    clearTimeout(scrollTimer);
    scrollTimer = null;

    const maxScroll = track.scrollWidth - track.clientWidth;
    if (track.scrollLeft >= maxScroll - 1) {
      snapTo(slides.length - 1);
      return;
    }

    const i = nearestIndex();
    track.scrollTo({ left: leftInTrack(slides[i]), behavior: 'smooth' });
    currentIndex = i;
    updateAvailability(i);
  }

  if ('onscrollend' in window) {
    track.addEventListener('scrollend', onScrollEnd, { passive: true });
  } else {
    track.addEventListener('scroll', () => {
      clearTimeout(scrollTimer);
      scrollTimer = setTimeout(onScrollEnd, 100);
    }, { passive: true });
  }

  // Keep position accurate on resize
  let resizeTimer = null;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      if (slides[currentIndex]) {
        track.scrollTo({ left: leftInTrack(slides[currentIndex]), behavior: 'auto' });
      }
      updateAvailability();
    }, 80);
  });

  // initial state
  updateAvailability(0);
}

// to boot it
//document.addEventListener('DOMContentLoaded', () => {
//  initArrowCarousel('#carousel', '#cards');
//});
