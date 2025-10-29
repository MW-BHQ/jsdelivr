function boot() {
  try { initArrowCarousel('#carousel', '#cards'); } catch(e){ console.error(e); }
  try { initArrowCarousel('#carousel2', '#cards2'); } catch(e){ console.error(e); }
  try { initArrowCarousel('#carousel3', '#cards3'); } catch(e){ console.error(e); }
  try { initArrowCarousel('#carousel4', '#cards4'); } catch(e){ console.error(e); }
  try { initArrowCarousel('#carousel5', '#cards5'); } catch(e){ console.error(e); }
  try { initTheatreCarousel(); } catch(e){ console.error(e); }
}
 
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot);
} else {
  boot();
}
