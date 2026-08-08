document.addEventListener("DOMContentLoaded", function () {
  if (typeof window.gsap === "undefined" || typeof window.ScrollTrigger === "undefined") {
    return;
  }

  const gsap = window.gsap;
  const ScrollTrigger = window.ScrollTrigger;

  gsap.registerPlugin(ScrollTrigger);

  const section = document.querySelector("[data-hero-scroll]");
  const stage = document.querySelector("[data-hero-scroll-stage]");
  if (!section || !stage) return;

  const header = document.querySelector("[data-header]");
  const list = section.querySelector(".hero-scroll__list");
  const titles = gsap.utils.toArray(section.querySelectorAll(".hero-scroll__title"));
  const images = gsap.utils.toArray(section.querySelectorAll(".hero-scroll__image"));
  const pinSpacerClass = "hero-scroll-pin-spacer";
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const hasTouchInput =
    ("ontouchstart" in window) ||
    navigator.maxTouchPoints > 0 ||
    window.matchMedia("(pointer: coarse)").matches;
  const useImageParallax = !prefersReducedMotion && !hasTouchInput;
  const parallaxDistance = 12;
  const parallaxScale = 1.0;
  const parallaxScrub = 0.45;

  if (!list || titles.length < 2 || images.length !== titles.length) return;

  const items = titles.map((title, index) => ({
    title,
    image: images[index]
  }));

  // The first image is already active in the HTML/CSS. Preserve that initial
  // render so the LCP image does not depend on GSAP initialization.
  let currentIndex = 0;
  let headerResizeObserver = null;
  let titleOffsets = [];
  let travelDistance = 0;
  let animationDistance = 1;
  let scrollDistance = 1;

  if (hasTouchInput) {
    ScrollTrigger.config({ ignoreMobileResize: true });
  }

  function getHeaderHeight() {
    return header ? header.getBoundingClientRect().height : 0;
  }

  function getEndBuffer() {
    return window.innerHeight * 0.3;
  }

  function measureLayout() {
    const firstOffset = titles[0].offsetTop;

    titleOffsets = titles.map((title) => title.offsetTop - firstOffset);
    travelDistance = Math.max(0, titleOffsets[titleOffsets.length - 1]);
    animationDistance = Math.max(travelDistance, 1);
    scrollDistance = animationDistance + getEndBuffer();
  }

  function getParallaxLeadIn() {
    return Math.min(100, Math.max(48, window.innerHeight * 0.08));
  }

  function prepareImage(index) {
    const image = images[index];
    if (!image) return;

    image.loading = "eager";

    if (typeof image.decode === "function") {
      image.decode().catch(function () {
        // Decoding is only a preparation step. A failed decode must not block
        // scrolling or the regular browser image loading path.
      });
    }
  }

  function setActiveItem(index) {
    if (index === currentIndex || !items[index]) return;

    const previousItem = items[currentIndex];
    const nextItem = items[index];

    currentIndex = index;

    titles.forEach((title, titleIndex) => {
      title.classList.toggle("is-active", titleIndex === index);
    });

    if (previousItem) {
      previousItem.image.classList.remove("is-active");

      gsap.to(previousItem.image, {
        opacity: 0,
        duration: 0.35,
        ease: "power1.out",
        overwrite: "auto"
      });
    }

    nextItem.image.classList.add("is-active");

    gsap.to(nextItem.image, {
      opacity: 1,
      duration: 0.35,
      ease: "power1.out",
      overwrite: "auto"
    });

    prepareImage(index + 1);
  }

  function getActiveIndexByTravel(currentTravel) {
    let activeIndex = 0;

    titleOffsets.forEach((titleOffset, index) => {
      if (currentTravel >= titleOffset - 1) {
        activeIndex = index;
      }
    });

    return activeIndex;
  }

  function setPinSpacerBackground(self) {
    if (!self || !self.pin || !self.pin.parentElement) return;

    self.pin.parentElement.classList.add(pinSpacerClass);
  }

  gsap.set(images, {
    yPercent: 0,
    scale: useImageParallax ? parallaxScale : 1,
    transformOrigin: "center center"
  });

  measureLayout();
  prepareImage(1);

  const pinTween = gsap.to(list, {
    y: () => -travelDistance,
    ease: "none",
    scrollTrigger: {
      trigger: stage,
      start: () => `top top+=${getHeaderHeight()}`,
      end: () => `+=${scrollDistance}`,
      scrub: hasTouchInput ? 0.15 : true,
      pin: stage,
      pinSpacing: true,
      anticipatePin: 1,
      invalidateOnRefresh: true,
      markers: false,

      onRefreshInit: measureLayout,
      onRefresh: setPinSpacerBackground,

      onUpdate: function (self) {
        const animationProgress = Math.min(
          self.progress * (scrollDistance / animationDistance),
          1
        );

        const currentTravel = animationProgress * travelDistance;
        const activeIndex = getActiveIndexByTravel(currentTravel);

        setActiveItem(activeIndex);
      }
    }
  });

  const parallaxTween = !useImageParallax
    ? null
    : gsap.to(images, {
        yPercent: parallaxDistance,
        ease: "power1.inOut",
        scrollTrigger: {
          trigger: stage,
          start: () => pinTween.scrollTrigger.end - getParallaxLeadIn(),
          end: () => pinTween.scrollTrigger.end + section.offsetHeight,
          scrub: parallaxScrub,
          invalidateOnRefresh: true,
          refreshPriority: -1
        }
      });

  function refreshScrollTriggers() {
    ScrollTrigger.refresh();
  }

  if (header && typeof window.ResizeObserver !== "undefined") {
    headerResizeObserver = new ResizeObserver(refreshScrollTriggers);
    headerResizeObserver.observe(header);
  }

  ScrollTrigger.refresh();

  window.addEventListener("beforeunload", function () {
    if (headerResizeObserver) {
      headerResizeObserver.disconnect();
    }

    if (pinTween && pinTween.scrollTrigger) {
      pinTween.scrollTrigger.kill();
    }

    if (pinTween) {
      pinTween.kill();
    }

    if (parallaxTween && parallaxTween.scrollTrigger) {
      parallaxTween.scrollTrigger.kill();
    }

    if (parallaxTween) {
      parallaxTween.kill();
    }
  });
});
