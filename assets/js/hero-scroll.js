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

  function getHeaderHeight() {
    return header ? header.getBoundingClientRect().height : 0;
  }

  function getTitleOffset(title) {
    return title.offsetTop - titles[0].offsetTop;
  }

  function getTravelDistance() {
    return Math.max(0, getTitleOffset(titles[titles.length - 1]));
  }

  function getAnimationDistance() {
    return getTravelDistance();
  }

  function getEndBuffer() {
    return window.innerHeight * 0.3;
  }

  function getScrollDistance() {
    return getAnimationDistance() + getEndBuffer();
  }

  function getParallaxLeadIn() {
    return Math.min(100, Math.max(48, window.innerHeight * 0.08));
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
  }

  function getActiveIndexByTravel(currentTravel) {
    let activeIndex = 0;

    titles.forEach((title, index) => {
      if (currentTravel >= getTitleOffset(title) - 1) {
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
    scale: prefersReducedMotion ? 1 : parallaxScale,
    transformOrigin: "center center"
  });

  const pinTween = gsap.to(list, {
    y: () => -getTravelDistance(),
    ease: "none",
    scrollTrigger: {
      trigger: stage,
      start: () => `top top+=${getHeaderHeight()}`,
      end: () => `+=${getScrollDistance()}`,
      scrub: true,
      pin: stage,
      pinSpacing: true,
      anticipatePin: 1,
      invalidateOnRefresh: true,
      markers: false,

      onRefresh: setPinSpacerBackground,

      onUpdate: function (self) {
        const animationProgress = Math.min(
          self.progress * (getScrollDistance() / getAnimationDistance()),
          1
        );

        const currentTravel = animationProgress * getTravelDistance();
        const activeIndex = getActiveIndexByTravel(currentTravel);

        setActiveItem(activeIndex);
      }
    }
  });

  const parallaxTween = prefersReducedMotion
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
