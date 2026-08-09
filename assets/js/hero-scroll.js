// Zentrale Hero-Trigger-Konfiguration. Positionswerte entsprechen Viewport-Prozent.
window.skinArtHeroScrollConfig = Object.assign({
  titleTriggerPosition: 40,
  titleTriggerAreaHeight: 4,
  treatmentListTriggerPosition: 50,
  showTriggerMarkers: false,
  showPinMarkers: false
}, window.skinArtHeroScrollConfig || {});

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
  const config = window.skinArtHeroScrollConfig;

  let triggerMarkerLayer = null;

  function createTriggerMarkers() {
    if (!config.showTriggerMarkers) return;

    const markers = [
      {
        top: config.titleTriggerPosition + "%",
        label: "ÜBERSCHRIFTEN · " + config.titleTriggerPosition + "%",
        color: "#00e68a"
      },
      {
        top: config.treatmentListTriggerPosition + "%",
        label: "BEHANDLUNGSLISTE · " + config.treatmentListTriggerPosition + "%",
        color: "#ffd166"
      }
    ];

    triggerMarkerLayer = document.createElement("div");
    triggerMarkerLayer.setAttribute("aria-hidden", "true");
    Object.assign(triggerMarkerLayer.style, {
      inset: "0",
      pointerEvents: "none",
      position: "fixed",
      zIndex: "1000"
    });

    markers.forEach(function (config) {
      const marker = document.createElement("div");
      const label = document.createElement("span");

      label.textContent = config.label;
      Object.assign(marker.style, {
        borderTop: "2px solid " + config.color,
        left: "0",
        position: "absolute",
        right: "0",
        top: config.top
      });
      Object.assign(label.style, {
        background: config.color,
        color: "#16251f",
        display: "block",
        font: "700 10px/1 sans-serif",
        letterSpacing: "0.08em",
        marginLeft: "auto",
        marginRight: "8px",
        padding: "4px 6px",
        transform: "translateY(-100%)",
        width: "max-content"
      });

      marker.appendChild(label);
      triggerMarkerLayer.appendChild(marker);
    });

    document.body.appendChild(triggerMarkerLayer);
  }

  createTriggerMarkers();

  function prepareImage(index) {
    const image = images[index];
    if (!image) return;

    image.loading = "eager";

    const picture = image.closest("picture");
    if (picture) {
      picture.querySelectorAll("source[data-srcset]").forEach(function (source) {
        source.srcset = source.dataset.srcset;
        source.removeAttribute("data-srcset");
      });
    }

    if (image.dataset.src) {
      image.src = image.dataset.src;
      image.removeAttribute("data-src");
    }

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
    const halfArea = config.titleTriggerAreaHeight / 2;
    const topMargin = config.titleTriggerPosition - halfArea;
    const bottomMargin = 100 - config.titleTriggerPosition - halfArea;

    return `-${topMargin}% 0px -${bottomMargin}% 0px`;
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
    return "bottom bottom";
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
      markers: config.showPinMarkers,
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
    if (triggerMarkerLayer) triggerMarkerLayer.remove();

    if (typeof breakpoint.removeEventListener === "function") {
      breakpoint.removeEventListener("change", handleBreakpointChange);
    } else if (typeof breakpoint.removeListener === "function") {
      breakpoint.removeListener(handleBreakpointChange);
    }
  });
});
