document.onreadystatechange = () => {
  const track = document.querySelector('.track');
    // measure full width, half of which is one loop
    const distance = track.scrollWidth / 2;
    // we want that to take exactly 15s
    const duration = 15; // seconds
    // set the CSS animation-duration explicitly
    track.style.animationDuration = duration + 's';
    // ensure the keyframes distance matches (translateX(-50%) already set)
};
