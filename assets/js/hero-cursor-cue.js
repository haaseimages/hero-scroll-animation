document.addEventListener("DOMContentLoaded", function () {
  const hero = document.querySelector("[data-hero-scroll]");
  const cue = document.querySelector("[data-hero-cursor-cue]");
  const gsap = window.gsap;
  const hasFinePointer = window.matchMedia(
    "(hover: hover) and (pointer: fine)"
  ).matches;
  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  if (!hero || !cue || !gsap || !hasFinePointer) return;

  const followDuration = prefersReducedMotion ? 0 : 0.42;
  const moveX = gsap.quickTo(cue, "x", {
    duration: followDuration,
    ease: "power3.out"
  });
  const moveY = gsap.quickTo(cue, "y", {
    duration: followDuration,
    ease: "power3.out"
  });

  function getPosition(event) {
    const offset = 18;
    const edge = 12;
    const maxX = window.innerWidth - cue.offsetWidth - edge;
    const maxY = window.innerHeight - cue.offsetHeight - edge;
    return {
      x: Math.max(edge, Math.min(event.clientX + offset, maxX)),
      y: Math.max(edge, Math.min(event.clientY + offset, maxY))
    };
  }

  function updatePosition(event) {
    const position = getPosition(event);
    moveX(position.x);
    moveY(position.y);
  }

  function showCue(event) {
    const position = getPosition(event);

    gsap.set(cue, { x: position.x, y: position.y });
    gsap.to(cue, {
      autoAlpha: 1,
      scale: 1,
      duration: prefersReducedMotion ? 0 : 0.2,
      ease: "power2.out",
      overwrite: "auto"
    });
  }

  function hideCue() {
    gsap.to(cue, {
      autoAlpha: 0,
      scale: 0.86,
      duration: prefersReducedMotion ? 0 : 0.18,
      ease: "power2.out",
      overwrite: "auto"
    });
  }

  hero.addEventListener("pointerenter", showCue);
  hero.addEventListener("pointermove", updatePosition);
  hero.addEventListener("pointerleave", hideCue);

  window.addEventListener("beforeunload", function () {
    hero.removeEventListener("pointerenter", showCue);
    hero.removeEventListener("pointermove", updatePosition);
    hero.removeEventListener("pointerleave", hideCue);

    gsap.killTweensOf(cue);
  });
});
