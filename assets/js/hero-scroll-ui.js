document.addEventListener("DOMContentLoaded", function () {
  const section = document.querySelector("[data-hero-scroll]");
  if (!section) return;

  // Konfiguration der Entdecken-Notification.
  const showDiscoveryCue = true;
  const showScrollMarkers = false;

  const intro = section.querySelector(".hero-scroll__intro");
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

  gsap.registerPlugin(ScrollTrigger);
  document.body.classList.add("has-hero-intro-reveal");

  if (cue) {
    cue.hidden = !showDiscoveryCue;
  }

  treatmentVisibilityTrigger = ScrollTrigger.create({
    trigger: intro,
    start: "top 30%",
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

    document.body.classList.remove("has-hero-intro-reveal");
    section.classList.remove("is-treatment-list-visible");
    if (cue) cue.classList.remove("is-hidden");
  });
});
