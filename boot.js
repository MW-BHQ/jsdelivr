function boot() {
  try { initArrowCarousel('#carousel_center', '#cards_center'); } catch(e){ console.error(e); }
  try { initTheatreCarousel('carousel-theatre'); } catch(e){ console.error(e); }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot);
} else {
  boot();
}
