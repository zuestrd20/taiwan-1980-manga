(() => {
  'use strict';
  document.documentElement.classList.add('js');
  const chapters = [...document.querySelectorAll('.chapter')];
  const currentLabel = document.querySelector('[data-current]');
  const currentTitle = document.querySelector('[data-current-title]');
  const prev = document.querySelector('[data-prev]');
  const next = document.querySelector('[data-next]');
  const progress = document.querySelector('.progress-fill');
  const links = [...document.querySelectorAll('.chapter-links a')];
  if (!chapters.length || !prev || !next) return;
  let current = 0;
  let scheduled = false;
  const update = () => {
    scheduled = false;
    const marker = window.innerHeight * 0.32;
    let index = 0;
    chapters.forEach((chapter, i) => { if (chapter.getBoundingClientRect().top <= marker) index = i; });
    current = index;
    currentLabel.textContent = `${String(index + 1).padStart(2, '0')} / ${String(chapters.length).padStart(2, '0')}`;
    currentTitle.textContent = chapters[index].dataset.shortTitle;
    prev.disabled = index === 0;
    next.disabled = index === chapters.length - 1;
    links.forEach(link => {
      if (link.hash === `#${chapters[index].id}`) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });
    const start = chapters[0].offsetTop;
    const end = chapters[chapters.length - 1].offsetTop + chapters[chapters.length - 1].offsetHeight - window.innerHeight;
    const percent = Math.min(100, Math.max(0, ((window.scrollY - start) / Math.max(1, end - start)) * 100));
    progress.style.width = `${percent}%`;
  };
  const schedule = () => { if (!scheduled) { scheduled = true; requestAnimationFrame(update); } };
  const jump = delta => {
    current = Math.max(0, Math.min(chapters.length - 1, current + delta));
    const target = chapters[current];
    location.hash = target.id;
    target.focus({preventScroll: true});
  };
  prev.addEventListener('click', () => jump(-1));
  next.addEventListener('click', () => jump(1));
  links.forEach(link => link.addEventListener('click', () => {
    const index = chapters.findIndex(chapter => `#${chapter.id}` === link.hash);
    if (index >= 0) current = index;
    document.querySelector('.mobile-contents').open = false;
  }));
  window.addEventListener('scroll', schedule, {passive: true});
  window.addEventListener('resize', schedule, {passive: true});
  window.addEventListener('hashchange', schedule);
  window.addEventListener('load', schedule);
  update();
})();
