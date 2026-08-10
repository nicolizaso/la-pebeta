"use client";

import { useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";

/**
 * Mounts once at the page root. Wires up Lenis smooth scrolling and all the
 * GSAP ScrollTrigger driven entrance/reveal animations, mirroring the
 * vanilla-JS behaviour from the original prototype.
 */
export function SiteAnimations() {
  useEffect(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    gsap.registerPlugin(ScrollTrigger);

    let lenis: Lenis | undefined;
    let rafId = 0;

    if (!reduceMotion) {
      lenis = new Lenis({
        duration: 1.1,
        easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      });

      const raf = (time: number) => {
        lenis?.raf(time);
        rafId = requestAnimationFrame(raf);
      };
      rafId = requestAnimationFrame(raf);

      lenis.on("scroll", ScrollTrigger.update);
      gsap.ticker.add((time) => {
        lenis?.raf(time * 1000);
      });
      gsap.ticker.lagSmoothing(0);
    }

    const ctx = gsap.context(() => {
      // ---------- hero entrance ----------
      const tl = gsap.timeline({ delay: 0.15 });
      tl.from(".hero .photo", { scale: 1.12, duration: 1.6, ease: "power2.out" })
        .from(".stamp", { opacity: 0, rotate: -14, y: -10, duration: 0.6, ease: "back.out(2)" }, 0.35)
        .from(".hero-line > span", { yPercent: 130, duration: 0.9, ease: "power4.out", stagger: 0.12 }, 0.5)
        .from(".hero-sub", { opacity: 0, y: 18, duration: 0.7, ease: "power2.out" }, "-=0.4")
        .from(".scroll-cue", { opacity: 0, duration: 0.6 }, "-=0.3");

      // subtle parallax on hero photo while scrolling
      gsap.to(".hero .photo", {
        yPercent: 14,
        ease: "none",
        scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true },
      });

      // ---------- generic reveal ----------
      gsap.utils.toArray<HTMLElement>(".reveal").forEach((el) => {
        gsap.to(el, {
          opacity: 1,
          y: 0,
          duration: 0.9,
          ease: "power3.out",
          scrollTrigger: { trigger: el, start: "top 88%" },
        });
      });

      // stagger the process stages together
      gsap
        .timeline({ scrollTrigger: { trigger: "#processTrack", start: "top 80%" } })
        .to("#processTrack .stage.reveal", { opacity: 1, y: 0, duration: 0.7, ease: "power3.out", stagger: 0.15 })
        .to("#processLine", { width: "100%", duration: 1.1, ease: "power2.inOut" }, "-=0.5");

      // photo blocks: slight scale-in as they reveal (parallax feel)
      gsap.utils.toArray<HTMLElement>(".photo").forEach((el) => {
        if (el.closest(".hero")) return;
        gsap.fromTo(
          el,
          { scale: 1.08 },
          {
            scale: 1,
            duration: 1.2,
            ease: "power2.out",
            scrollTrigger: { trigger: el, start: "top 90%" },
          }
        );
      });

      // quote cards stagger
      gsap
        .timeline({ scrollTrigger: { trigger: ".quote-grid", start: "top 82%" } })
        .to(".quote-grid .quote", { opacity: 1, y: 0, duration: 0.8, ease: "power3.out", stagger: 0.15 });
    });

    return () => {
      ctx.revert();
      if (rafId) cancelAnimationFrame(rafId);
      lenis?.destroy();
    };
  }, []);

  return null;
}
