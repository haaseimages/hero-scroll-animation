document.addEventListener("DOMContentLoaded", function () {
  const section = document.querySelector("[data-hero-scroll]");
  if (!section) return;

  const titles = Array.from(section.querySelectorAll(".hero-scroll__title"));
  const images = Array.from(section.querySelectorAll(".hero-scroll__image"));
  const header = document.querySelector("[data-header]");
  const media = section.querySelector(".hero-scroll__media");
  const mediaInner = section.querySelector(".hero-scroll__media-inner");
  const nextSection = section.nextElementSibling;
  const stage = section.closest("[data-hero-scroll-stage]");
  if (titles.length < 2 || images.length !== titles.length) return;

  let currentIndex = 0;
  let observer = null;
  let followSectionHold = null;
  let backgroundPin = null;
  let parallaxTween = null;
  let layoutMetrics = null;
  let layoutWidth = 0;

  function applyLayoutMetrics() {
    const viewportHeight = Math.round(document.documentElement.clientHeight || window.innerHeight);
    const headerHeight = Math.round(header ? header.getBoundingClientRect().height : 0);
    const heroHeight = Math.max(1, Math.round(viewportHeight * 0.8 - headerHeight));

    layoutMetrics = { viewportHeight, headerHeight, heroHeight };
    layoutWidth = Math.round(document.documentElement.clientWidth || window.innerWidth);
    section.style.minHeight = `${heroHeight}px`;
    media.style.height = `${heroHeight}px`;
    nextSection.style.top = `${heroHeight}px`;
    nextSection.style.willChange = "transform";
    stage.style.paddingBottom = `${viewportHeight}px`;
  }

  function prepareImage(index) {
    const image = images[index];
    if (!image) return;

    image.loading = "eager";

    if (typeof image.decode === "function") {
      image.decode().catch(function () {
        // Preparation is optional. Normal browser loading remains the fallback.
      });
    }
  }

  function setActiveItem(index) {
    if (!titles[index] || !images[index]) return;

    currentIndex = index;

    titles.forEach(function (title, titleIndex) {
      const isActive = titleIndex === index;
      title.classList.toggle("is-active", isActive);
      title.setAttribute("aria-current", isActive ? "true" : "false");
    });

    images.forEach(function (image, imageIndex) {
      image.classList.toggle("is-active", imageIndex === index);
    });

    prepareImage(index + 1);
  }

  function getObserverMargin() {
    return window.matchMedia("(max-width: 849.98px)").matches
      ? "-25% 0px -65% 0px"
      : "-45% 0px -45% 0px";
  }

  function createObserver() {
    if (observer) observer.disconnect();

    observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;

          const index = titles.indexOf(entry.target);
          if (index !== -1 && index !== currentIndex) {
            setActiveItem(index);
          }
        });
      },
      {
        root: null,
        rootMargin: getObserverMargin(),
        threshold: 0
      }
    );

    titles.forEach(function (title) {
      observer.observe(title);
    });
  }

  setActiveItem(0);
  prepareImage(1);
  createObserver();

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const gsap = window.gsap;
  const ScrollTrigger = window.ScrollTrigger;

  function getHeroStart() {
    return `top top+=${layoutMetrics.headerHeight}`;
  }

  function getTitleFocusPosition() {
    const isCompact = window.matchMedia("(max-width: 849.98px)").matches;
    const focusPosition = Math.round(window.innerHeight * (isCompact ? 0.3 : 0.5));
    return `top top+=${focusPosition}`;
  }

  function getFollowHoldPosition() {
    const visibleHeroBottom = layoutMetrics.heroHeight + layoutMetrics.headerHeight;
    return `top top+=${visibleHeroBottom}`;
  }

  function getLayerTransitionDistance() {
    return layoutMetrics.heroHeight;
  }

  if (gsap && ScrollTrigger && media && mediaInner && nextSection && stage) {
    gsap.registerPlugin(ScrollTrigger);
    applyLayoutMetrics();

    document.body.classList.add("has-hero-background-pin");
    gsap.set(nextSection, { y: 0, force3D: true });

    followSectionHold = ScrollTrigger.create({
      trigger: nextSection,
      start: getFollowHoldPosition,
      endTrigger: titles[titles.length - 1],
      end: getTitleFocusPosition,
      onUpdate: function (self) {
        const travel = Math.max(0, self.end - self.start);
        gsap.set(nextSection, {
          y: self.progress * travel,
          force3D: true
        });
      },
      onRefresh: function (self) {
        const travel = Math.max(0, self.end - self.start);
        gsap.set(nextSection, {
          y: self.progress * travel,
          force3D: true
        });
      },
      invalidateOnRefresh: true,
      refreshPriority: 2
    });

    backgroundPin = ScrollTrigger.create({
      trigger: section,
      start: getHeroStart,
      end: function () {
        return followSectionHold.end + getLayerTransitionDistance();
      },
      pin: media,
      pinSpacing: false,
      invalidateOnRefresh: true,
      refreshPriority: 1
    });

    if (!prefersReducedMotion) {
      parallaxTween = gsap.fromTo(
        mediaInner,
        { yPercent: 5 },
        {
          yPercent: -5,
          ease: "none",
          scrollTrigger: {
            trigger: stage,
            start: function () {
              return followSectionHold.end;
            },
            end: function () {
              return backgroundPin.end;
            },
            scrub: 0.35,
            invalidateOnRefresh: true,
            refreshPriority: 0
          }
        }
      );
    }
  }

  const breakpoint = window.matchMedia("(max-width: 849.98px)");
  const handleBreakpointChange = function () {
    createObserver();
    if (ScrollTrigger && media && nextSection && stage) {
      applyLayoutMetrics();
      ScrollTrigger.refresh();
    }
  };

  let resizeFrame = null;
  const handleResize = function () {
    const currentWidth = Math.round(document.documentElement.clientWidth || window.innerWidth);
    if (Math.abs(currentWidth - layoutWidth) < 2) return;

    if (resizeFrame) window.cancelAnimationFrame(resizeFrame);
    resizeFrame = window.requestAnimationFrame(function () {
      applyLayoutMetrics();
      if (ScrollTrigger) ScrollTrigger.refresh();
      resizeFrame = null;
    });
  };

  window.addEventListener("resize", handleResize, { passive: true });

  if (typeof breakpoint.addEventListener === "function") {
    breakpoint.addEventListener("change", handleBreakpointChange);
  } else if (typeof breakpoint.addListener === "function") {
    breakpoint.addListener(handleBreakpointChange);
  }

  window.addEventListener("beforeunload", function () {
    if (observer) observer.disconnect();

    if (followSectionHold) followSectionHold.kill();

    if (backgroundPin) backgroundPin.kill();
    document.body.classList.remove("has-hero-background-pin");
    window.removeEventListener("resize", handleResize);
    if (resizeFrame) window.cancelAnimationFrame(resizeFrame);

    if (parallaxTween && parallaxTween.scrollTrigger) {
      parallaxTween.scrollTrigger.kill();
    }

    if (parallaxTween) parallaxTween.kill();

    if (typeof breakpoint.removeEventListener === "function") {
      breakpoint.removeEventListener("change", handleBreakpointChange);
    } else if (typeof breakpoint.removeListener === "function") {
      breakpoint.removeListener(handleBreakpointChange);
    }
  });
});
