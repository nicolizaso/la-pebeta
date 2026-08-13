import type Lenis from "lenis";

/**
 * Lenis drives the page scroll from its own raf loop, so a native
 * `scrollIntoView` gets overwritten frame by frame and never lands.
 * SiteAnimations hands its instance over here and anything that needs to move
 * the page goes through `scrollToElement`, which falls back to the native call
 * when there is no smooth scroll running (reduced motion, or JS-driven scroll
 * before mount).
 */
let lenis: Lenis | null = null;

export function registerSmoothScroll(instance: Lenis | null) {
  lenis = instance;
}

export function scrollToElement(target: Element, offset = -80) {
  if (lenis) {
    lenis.scrollTo(target as HTMLElement, { offset });
    return;
  }

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  target.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
}
