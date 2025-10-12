function initTheatreCarousel() {
  const getTarget = el => el.tagName === 'A' ? el.getAttribute('href') : el.getAttribute('data-to');

  document.querySelectorAll('[id^="carousel-"]').forEach((carousel) => {
    const slides = [...carousel.querySelectorAll('.carousel-item[id]')];
    if (!slides.length) return;

    const ids  = new Set(slides.map(s => '#'+s.id));
    const dots = [...document.querySelectorAll('a[href^="#"], button[data-to]')]
      .filter(el => ids.has(getTarget(el)));

    // enable button dots (anchors already work)
    dots.forEach(d => {
      if (d.tagName !== 'A') {
        d.addEventListener('click', () => {
          const t = carousel.querySelector(getTarget(d));
          if (t) t.scrollIntoView({ behavior:'smooth', inline:'start', block:'nearest' });
        });
      }
    });

    const updateActive = () => {
      const center = carousel.scrollLeft + carousel.clientWidth/2;
      let best = 0, dist = Infinity;
      for (let i=0;i<slides.length;i++) {
        const c = slides[i].offsetLeft + slides[i].clientWidth/2;
        const d = Math.abs(c - center);
        if (d < dist) { dist = d; best = i; }
      }
      const active = slides[best];
      slides.forEach(s => s.classList.toggle('is-active', s === active));
      const activeId = '#'+active.id;
      dots.forEach(d => d.classList.toggle('btn-active', getTarget(d) === activeId));
    };

    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => { updateActive(); ticking = false; });
    };

    carousel.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', updateActive);
    document.addEventListener('hashchange', () => setTimeout(updateActive, 80));

    requestAnimationFrame(updateActive);
  });
}
