document.addEventListener("DOMContentLoaded", function () {
  const section = document.querySelector("[data-hero-scroll]");
  if (!section) return;

  const titles = Array.from(section.querySelectorAll(".hero-scroll__title"));
  const images = Array.from(section.querySelectorAll(".hero-scroll__image"));
  const header = document.querySelector("[data-header]");
  const media = section.querySelector(".hero-scroll__media");
  const nextSection = section.nextElementSibling;
  if (titles.length < 2 || images.length !== titles.length) return;

  let currentIndex = 0;
  let observer = null;
  let backgroundPin = null;

  // Debug-Hilfen und Laenge des zusaetzlichen Pin-Bereichs.
  const showScrollMarkers = true;
  const endOffsetVh = 0;

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
    return "-23% 0px -73% 0px";
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

  const gsap = window.gsap;
  const ScrollTrigger = window.ScrollTrigger;

  function getHeroStart() {
    const headerHeight = header ? header.getBoundingClientRect().height : 0;
    return `top top+=${headerHeight}`;
  }

  function getTransitionEnd() {
    const headerHeight = header ? header.getBoundingClientRect().height : 0;
    const endOffset = window.innerHeight * (endOffsetVh / 100);
    return `top top+=${headerHeight + endOffset}`;
  }

  if (gsap && ScrollTrigger && media && nextSection) {
    gsap.registerPlugin(ScrollTrigger);

    document.body.classList.add("has-hero-background-pin");

    backgroundPin = ScrollTrigger.create({
      trigger: section,
      start: getHeroStart,
      endTrigger: nextSection,
      end: getTransitionEnd,
      pin: media,
      pinSpacing: false,
      markers: showScrollMarkers,
      invalidateOnRefresh: true
    });
  }

  const breakpoint = window.matchMedia("(max-width: 849.98px)");
  const handleBreakpointChange = function () {
    createObserver();
    if (ScrollTrigger) ScrollTrigger.refresh();
  };

  if (typeof breakpoint.addEventListener === "function") {
    breakpoint.addEventListener("change", handleBreakpointChange);
  } else if (typeof breakpoint.addListener === "function") {
    breakpoint.addListener(handleBreakpointChange);
  }

  window.addEventListener("beforeunload", function () {
    if (observer) observer.disconnect();

    if (backgroundPin) backgroundPin.kill();
    document.body.classList.remove("has-hero-background-pin");

    if (typeof breakpoint.removeEventListener === "function") {
      breakpoint.removeEventListener("change", handleBreakpointChange);
    } else if (typeof breakpoint.removeListener === "function") {
      breakpoint.removeListener(handleBreakpointChange);
    }
  });
});
