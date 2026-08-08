// Global ScrollSmoother init for front-end templates.
// Requires GSAP + ScrollTrigger + ScrollSmoother to be loaded globally.

(function () {
  const smootherBodyClass = 'has-scroll-smoother';
  let menuStateObserver = null;

  const hasTouchInput = () =>
    ('ontouchstart' in window) ||
    (navigator.maxTouchPoints > 0) ||
    (window.matchMedia && window.matchMedia('(pointer: coarse)').matches);

  const destroySmoother = () => {
    if (menuStateObserver) {
      menuStateObserver.disconnect();
      menuStateObserver = null;
    }

    if (window.haaseScrollSmoother) {
      window.haaseScrollSmoother.kill();
      window.haaseScrollSmoother = null;
    }

    if (document.body) {
      document.body.classList.remove(smootherBodyClass);
    }
  };

  const initSmoother = () => {
    destroySmoother();

    if (
      typeof window.gsap === 'undefined' ||
      typeof window.ScrollTrigger === 'undefined' ||
      typeof window.ScrollSmoother === 'undefined'
    ) {
      return;
    }

    if (hasTouchInput()) {
      return;
    }

    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }

    const wrapper = document.getElementById('smooth-wrapper');
    const content = document.getElementById('smooth-content');
    if (!wrapper || !content) {
      return;
    }

    const gsap = window.gsap;
    gsap.registerPlugin(window.ScrollTrigger, window.ScrollSmoother);

    window.haaseScrollSmoother = window.ScrollSmoother.create({
      wrapper: '#smooth-wrapper',
      content: '#smooth-content',
      smooth: 0.6,
      smoothTouch: 0.0,
      normalizeScroll: false,
      ignoreMobileResize: true,
      effects: false,
    });

    if (document.body) {
      document.body.classList.add(smootherBodyClass);
    }

    const menu = document.querySelector('[data-menu]');
    if (!menu) {
      return;
    }

    const syncPausedState = () => {
      if (!window.haaseScrollSmoother) {
        return;
      }
      const scrollRestorePending = menu.dataset.scrollRestorePending === 'true';
      window.haaseScrollSmoother.paused(
        menu.classList.contains('is-open') || scrollRestorePending
      );
    };

    syncPausedState();
    menuStateObserver = new MutationObserver(syncPausedState);
    menuStateObserver.observe(menu, {
      attributes: true,
      attributeFilter: ['class', 'data-scroll-restore-pending'],
    });
  };

  initSmoother();
})();
