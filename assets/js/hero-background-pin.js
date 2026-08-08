document.addEventListener("DOMContentLoaded", function () {
  const section = document.querySelector("[data-hero-scroll]");
  const header = document.querySelector("[data-header]");
  const media = section ? section.querySelector(".hero-scroll__media") : null;
  const gsap = window.gsap;
  const ScrollTrigger = window.ScrollTrigger;

  if (!section || !media || !gsap || !ScrollTrigger) return;

  let backgroundPin = null;

  function getHeaderHeight() {
    return Math.round(header ? header.getBoundingClientRect().height : 0);
  }

  function getHeroVisibleBottom() {
    return getHeaderHeight() + Math.round(media.getBoundingClientRect().height);
  }

  gsap.registerPlugin(ScrollTrigger);
  document.body.classList.add("has-hero-background-pin");

  backgroundPin = ScrollTrigger.create({
    trigger: section,
    start: function () {
      return `top top+=${getHeaderHeight()}`;
    },
    endTrigger: section,
    end: function () {
      return `bottom top+=${getHeroVisibleBottom()}`;
    },
    pin: media,
    pinSpacing: false,
    anticipatePin: 1,
    invalidateOnRefresh: true
  });

  window.addEventListener("beforeunload", function () {
    if (backgroundPin) backgroundPin.kill();
    document.body.classList.remove("has-hero-background-pin");
  });
});
