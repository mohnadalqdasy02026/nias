// Central scroll-reveal system: progressively enhances content blocks with a
// soft fade-and-rise as they enter the viewport. Robust against fast jumps and
// async content, and degrades gracefully (content stays visible) without JS.
//
// Rail cards are skipped on purpose: they already animate via their own
// `railIn` keyframes and live inside horizontal scrollers.
const SELECTORS = [
  '.section-head',
  '.card',
  '.college-card',
  '.program-card',
  '.news-card',
  '.course-card',
  '.branch-card',
  '.faculty-card',
  '.gallery-item',
  '.gallery-album-card',
  '.download-item',
  '.highlight-card',
  '.intro-block',
  '.department-program-card',
  '.department-faculty-item',
  '.department-page-card',
  '.department-page-head-card',
  '.department-page-side-card',
  '.reg-cta',
  '.cta-inner',
].join(',');

const prefersReducedMotion = () =>
  typeof window !== 'undefined'
  && (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false);

export function initReveal(root) {
  if (!root || prefersReducedMotion()) return () => {};

  const seen = new Set();
  const pending = new Set();
  let ticking = false;

  const reveal = (el) => {
    el.classList.add('is-visible');
    const done = () => {
      el.classList.remove('reveal', 'is-visible');
      el.style.transitionDelay = '';
      el.removeEventListener('transitionend', done);
    };
    el.addEventListener('transitionend', done, { once: true });
    window.setTimeout(done, 1000);
  };

  const check = () => {
    ticking = false;
    const vh = window.innerHeight;
    pending.forEach((el) => {
      const rect = el.getBoundingClientRect();
      const inView = rect.top < vh * 0.94 && rect.bottom > 0;
      const passed = rect.bottom <= 0;
      if (inView || passed) {
        pending.delete(el);
        reveal(el);
      }
    });
  };

  const schedule = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(check);
  };

  const register = () => {
    root.querySelectorAll(SELECTORS).forEach((el) => {
      if (seen.has(el) || el.classList.contains('reveal')) return;
      if (el.closest('.hero') || el.closest('.rail')) return;
      seen.add(el);
      const parent = el.parentElement;
      if (parent) {
        const index = Array.from(parent.children).indexOf(el);
        el.style.transitionDelay = `${Math.min(index % 8, 7) * 70}ms`;
      }
      el.classList.add('reveal');
      pending.add(el);
    });
    schedule();
  };

  const onScroll = () => schedule();

  register();
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll, { passive: true });
  const mo = new MutationObserver(register);
  mo.observe(root, { childList: true, subtree: true });

  return () => {
    window.removeEventListener('scroll', onScroll);
    window.removeEventListener('resize', onScroll);
    mo.disconnect();
  };
}
