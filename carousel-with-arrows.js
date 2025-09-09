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

document.addEventListener("readystatechange", (event) => {
  if (event.target.readyState === "interactive") {
    //initLoader();
  } else if (event.target.readyState === "complete") {

    initTinyCarousel('#productCarousel', '#productImages');

  }
});
