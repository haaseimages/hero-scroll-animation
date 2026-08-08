document.addEventListener("DOMContentLoaded", function () {
  const section = document.querySelector("[data-hero-scroll]");
  if (!section) return;

  const titles = Array.from(section.querySelectorAll(".hero-scroll__title"));
  const header = document.querySelector("[data-header]");
  const media = section.querySelector(".hero-scroll__media");
  const nextSection = section.nextElementSibling;
  const stage = section.closest("[data-hero-scroll-stage]");
  const gsap = window.gsap;
  const ScrollTrigger = window.ScrollTrigger;

  if (!titles.length || !media || !nextSection || !stage || !gsap || !ScrollTrigger) return;

  let followSectionHold = null;
  let backgroundPin = null;
  let layoutMetrics = null;
  let layoutWidth = 0;
  let resizeFrame = null;

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

  function updateFollowPosition(self) {
    const travel = Math.max(0, self.end - self.start);
    gsap.set(nextSection, { y: self.progress * travel, force3D: true });
  }

  function refreshLayout() {
    applyLayoutMetrics();
    ScrollTrigger.refresh();
  }

  function handleResize() {
    const currentWidth = Math.round(document.documentElement.clientWidth || window.innerWidth);
    if (Math.abs(currentWidth - layoutWidth) < 2) return;

    if (resizeFrame) window.cancelAnimationFrame(resizeFrame);
    resizeFrame = window.requestAnimationFrame(function () {
      refreshLayout();
      resizeFrame = null;
    });
  }

  gsap.registerPlugin(ScrollTrigger);
  applyLayoutMetrics();
  document.body.classList.add("has-hero-background-pin");
  gsap.set(nextSection, { y: 0, force3D: true });

  followSectionHold = ScrollTrigger.create({
    trigger: nextSection,
    start: getFollowHoldPosition,
    endTrigger: titles[titles.length - 1],
    end: getTitleFocusPosition,
    onUpdate: updateFollowPosition,
    onRefresh: updateFollowPosition,
    invalidateOnRefresh: true,
    refreshPriority: 2
  });

  backgroundPin = ScrollTrigger.create({
    trigger: section,
    start: getHeroStart,
    end: function () {
      return followSectionHold.end + layoutMetrics.heroHeight;
    },
    pin: media,
    pinSpacing: false,
    invalidateOnRefresh: true,
    refreshPriority: 1
  });

  const breakpoint = window.matchMedia("(max-width: 849.98px)");
  if (typeof breakpoint.addEventListener === "function") {
    breakpoint.addEventListener("change", refreshLayout);
  } else if (typeof breakpoint.addListener === "function") {
    breakpoint.addListener(refreshLayout);
  }

  window.addEventListener("resize", handleResize, { passive: true });

  window.addEventListener("beforeunload", function () {
    if (followSectionHold) followSectionHold.kill();
    if (backgroundPin) backgroundPin.kill();
    document.body.classList.remove("has-hero-background-pin");
    window.removeEventListener("resize", handleResize);
    if (resizeFrame) window.cancelAnimationFrame(resizeFrame);

    if (typeof breakpoint.removeEventListener === "function") {
      breakpoint.removeEventListener("change", refreshLayout);
    } else if (typeof breakpoint.removeListener === "function") {
      breakpoint.removeListener(refreshLayout);
    }
  });
});
