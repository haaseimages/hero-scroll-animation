document.addEventListener("DOMContentLoaded", function () {
  const section = document.querySelector("[data-hero-scroll]");
  if (!section) return;

  // Konfiguration der Entdecken-Notification.
  const showDiscoveryCue = true;
  const showScrollMarkers = false;

  const intro = section.querySelector(".hero-scroll__intro");
  const titleList = section.querySelector(".hero-scroll__list");
  const brandLogo = section.querySelector(".hero-scroll__brand-logo");
  const treatments = section.querySelector(".hero-scroll__treatments");
  const treatmentTitles = treatments
    ? treatments.querySelectorAll(".hero-scroll__title")
    : [];
  const cue = document.querySelector("[data-hero-scroll-cue]");
  const nextSection = section.nextElementSibling;
  const gsap = window.gsap;
  const ScrollTrigger = window.ScrollTrigger;

  if (
    !intro ||
    !treatmentTitles.length ||
    !nextSection ||
    !gsap ||
    !ScrollTrigger
  ) return;

  let treatmentVisibilityTrigger = null;
  let cueVisibilityTrigger = null;
  let logoResizeObserver = null;
  let lastLogoCenterOffset = -1;

  function updateLogoCenterOffset() {
    if (!titleList || !brandLogo) return;

    const logoCenterOffset = intro.getBoundingClientRect().height / 2;
    if (Math.abs(logoCenterOffset - lastLogoCenterOffset) < 0.25) return;

    lastLogoCenterOffset = logoCenterOffset;
    titleList.style.setProperty(
      "--hero-logo-center-offset",
      logoCenterOffset + "px"
    );

    if (treatmentVisibilityTrigger || cueVisibilityTrigger) {
      ScrollTrigger.refresh();
    }
  }

  gsap.registerPlugin(ScrollTrigger);
  document.body.classList.add("has-hero-intro-reveal");

  updateLogoCenterOffset();

  if (brandLogo && "ResizeObserver" in window) {
    logoResizeObserver = new ResizeObserver(updateLogoCenterOffset);
    logoResizeObserver.observe(intro);
  }

  if (cue) {
    cue.hidden = !showDiscoveryCue;
  }

  treatmentVisibilityTrigger = ScrollTrigger.create({
    trigger: treatments,
    start: "top 50%",
    onEnter: function () {
      section.classList.add("is-treatment-list-visible");
    },
    onLeaveBack: function () {
      section.classList.remove("is-treatment-list-visible");
    },
    invalidateOnRefresh: true
  });

  if (cue && showDiscoveryCue) {
    cueVisibilityTrigger = ScrollTrigger.create({
      trigger: nextSection,
      id: "entdecken-visibility",
      start: "top bottom",
      markers: showScrollMarkers ? {
        startColor: "#00e68a",
        endColor: "#ff3b81",
        fontSize: "13px",
        fontWeight: "bold",
        indent: 80
      } : false,
      onEnter: function () {
        cue.classList.add("is-hidden");
      },
      onLeaveBack: function () {
        cue.classList.remove("is-hidden");
      },
      invalidateOnRefresh: true
    });
  }

  window.addEventListener("beforeunload", function () {
    if (treatmentVisibilityTrigger) treatmentVisibilityTrigger.kill();
    if (cueVisibilityTrigger) cueVisibilityTrigger.kill();
    if (logoResizeObserver) logoResizeObserver.disconnect();

    document.body.classList.remove("has-hero-intro-reveal");
    section.classList.remove("is-treatment-list-visible");
    if (cue) cue.classList.remove("is-hidden");
  });
});
