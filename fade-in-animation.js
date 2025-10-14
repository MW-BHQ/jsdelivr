function bootStagger(selector = '.stagger'){
  const io = new IntersectionObserver((ents)=>{
    ents.forEach(ent=>{
      if (!ent.isIntersecting) return;
      ent.target.querySelectorAll('.text-wrap')
        .forEach((el,i)=> el.style.setProperty('--i', i));
      ent.target.classList.add('is-inview'); // animate once
      io.unobserve(ent.target);
    });
  }, { threshold: 0.35 });

  document.querySelectorAll(selector).forEach(el=> io.observe(el));
}
// to boot
//document.readyState === 'loading'
//  ? document.addEventListener('DOMContentLoaded', ()=>bootStagger())
//  : bootStagger();
