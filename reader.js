(() => {
  'use strict';
  const chapters = Array.from(document.querySelectorAll('.chapter'));
  const links = Array.from(document.querySelectorAll('[data-page-link]'));
  const dock = document.querySelector('.reader-dock');
  const previous = document.querySelector('[data-prev]');
  const next = document.querySelector('[data-next]');
  const label = document.querySelector('[data-current]');
  const select = document.querySelector('#page-select');
  const progress = document.querySelector('.progress-fill');
  const contents = document.querySelector('#contents');
  if (!chapters.length || !dock || !previous || !next || !label || !select) return;

  let current = 0;
  let frame = null;
  const clamp = value => Math.max(0, Math.min(chapters.length - 1, value));
  const fromHash = () => chapters.findIndex(chapter => `#${chapter.id}` === window.location.hash);
  const position = index => `${String(index + 1).padStart(2, '0')} / ${String(chapters.length).padStart(2, '0')}`;
  const render = () => {
    label.textContent = position(current);
    select.value = String(current + 1);
    previous.disabled = current === 0;
    next.disabled = current === chapters.length - 1;
    links.forEach(link => {
      if (Number(link.dataset.page) === current + 1) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });
    if (progress) progress.style.width = `${((current + 1) / chapters.length) * 100}%`;
  };
  const scrollToPage = (index, focus) => {
    const chapter = chapters[index];
    // Instant positioning prevents rapid next/previous clicks from racing a
    // previous smooth scroll. Native browser zoom and image links remain intact.
    chapter.scrollIntoView({block: 'start', behavior: 'instant'});
    if (focus) chapter.focus({preventScroll: true});
  };
  const go = (index, options = {}) => {
    if (!Number.isFinite(index)) return;
    current = clamp(Math.trunc(index));
    render();
    dock.hidden = false;
    const hash = `#${chapters[current].id}`;
    if (options.history !== false && window.location.hash !== hash) {
      window.history.pushState({page: current + 1}, '', hash);
    }
    scrollToPage(current, options.focus !== false);
  };
  const updateFromScroll = () => {
    frame = null;
    const marker = Math.min(180, window.innerHeight * 0.24);
    let index = 0;
    chapters.forEach((chapter, i) => {
      if (chapter.getBoundingClientRect().top <= marker) index = i;
    });
    current = index;
    dock.hidden = chapters[0].getBoundingClientRect().top > window.innerHeight * 0.85;
    render();
  };
  const schedule = () => {
    if (frame === null) frame = window.requestAnimationFrame(updateFromScroll);
  };
  const followHash = () => {
    const index = fromHash();
    if (index >= 0) go(index, {history: false, focus: false});
    else schedule();
  };

  previous.addEventListener('click', () => go(current - 1));
  next.addEventListener('click', () => go(current + 1));
  select.addEventListener('change', () => go(Number(select.value) - 1, {focus: false}));
  links.forEach(link => link.addEventListener('click', event => {
    if (event.button > 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const page = Number(link.dataset.page);
    if (!Number.isInteger(page) || page < 1 || page > chapters.length) return;
    event.preventDefault();
    if (contents && window.innerWidth <= 760 && contents.contains(link)) contents.open = false;
    go(page - 1);
  }));
  const contentsLink = document.querySelector('.dock-contents');
  if (contentsLink && contents) contentsLink.addEventListener('click', () => { contents.open = true; });
  document.addEventListener('keydown', event => {
    if (event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
    const target = event.target;
    if (target && (/^(INPUT|TEXTAREA|SELECT|BUTTON)$/.test(target.tagName) || target.isContentEditable)) return;
    if (event.key === 'ArrowLeft') { event.preventDefault(); go(dock.hidden ? 0 : current + 1); }
    else if (event.key === 'ArrowRight' && !dock.hidden) { event.preventDefault(); go(current - 1); }
  });
  window.addEventListener('scroll', schedule, {passive: true});
  window.addEventListener('resize', schedule, {passive: true});
  window.addEventListener('hashchange', followHash);
  window.addEventListener('popstate', followHash);
  window.addEventListener('load', followHash);
  if (fromHash() >= 0) followHash();
  else updateFromScroll();
})();
