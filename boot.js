function boot() {
  try { initArrowCarousel('#carousel_center', '#cards_center'); } catch(e){ console.error(e); }
  try { initArrowCarousel('#carousel_facilities', '#cards_facilities'); } catch(e){ console.error(e); }
  try { initTheatreCarousel(); } catch(e){ console.error(e); }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot);
} else {
  boot();
}
