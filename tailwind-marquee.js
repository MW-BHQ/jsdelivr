document.onreadystatechange = () => {
  const track = document.querySelector('.track');
    // total scroll distance is half the full scrollWidth
    const distance = track.scrollWidth / 2;
    const speed = 80;               // pixels per second
    const duration = distance / speed;
    // set the CSS variable
    track.style.setProperty('--marquee-duration', `${duration}s`);
};
