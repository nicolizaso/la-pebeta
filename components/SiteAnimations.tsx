"use client";

import { useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";

/**
 * Mounts once at the page root. Wires up Lenis smooth scrolling and every
 * GSAP/ScrollTrigger behaviour on the site, driven by markup hooks rather than
 * per-component code:
 *
 *   .reveal            fade + rise on enter
 *   [data-split]       heading revealed word by word behind a mask
 *   [data-reveal-img]  photo uncovered by a curtain wipe, image settling from a zoom
 *   [data-parallax]    photo drifting slowly against the scroll
 *   [data-count]       stat counting up
 *   [data-marquee]     seamless photo band, sped up by scroll velocity
 *   [data-hscroll]     section pinned while its filmstrip slides sideways
 *   [data-stagger]     grid whose children come in one after another
 *
 * Everything degrades to plain static content when JS is off or the visitor
 * asked for reduced motion.
 */
export function SiteAnimations() {
  useEffect(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    gsap.registerPlugin(ScrollTrigger);

    // ---------- reduced motion: show everything, animate nothing ----------
    if (reduceMotion) {
      document.documentElement.classList.add("reduce-motion");
      gsap.set(".reveal", { opacity: 1, y: 0 });
      gsap.set("[data-reveal-img]", { clipPath: "none" });
      gsap.set(".process-line", { width: "100%" });
      return () => document.documentElement.classList.remove("reduce-motion");
    }

    // ---------- smooth scroll ----------
    const lenis = new Lenis({
      duration: 1.1,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    });

    lenis.on("scroll", ScrollTrigger.update);
    const tick = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    const onLoad = () => ScrollTrigger.refresh();
    window.addEventListener("load", onLoad);

    const mm = gsap.matchMedia();
    const tickers: gsap.TickerCallback[] = [];

    const ctx = gsap.context(() => {
      // ---------- hero entrance ----------
      const heroMedia = ".hero .photo .photo-media";
      const tl = gsap.timeline({ delay: 0.15 });
      tl.from(heroMedia, { scale: 1.16, duration: 1.8, ease: "power2.out" })
        .from(".stamp", { opacity: 0, rotate: -14, y: -10, duration: 0.6, ease: "back.out(2)" }, 0.35)
        .from(".hero-line > span", { yPercent: 130, duration: 0.9, ease: "power4.out", stagger: 0.12 }, 0.5)
        .from(".hero-sub", { opacity: 0, y: 18, duration: 0.7, ease: "power2.out" }, "-=0.4")
        .from(".hero .tag", { opacity: 0, x: -14, duration: 0.6, ease: "power2.out" }, "-=0.5")
        .from(".scroll-cue", { opacity: 0, duration: 0.6 }, "-=0.3")
        // very slow drift once the entrance has landed, so the hero never sits still
        .to(heroMedia, { scale: 1.07, duration: 24, ease: "sine.inOut", repeat: -1, yoyo: true });

      gsap.to(heroMedia, {
        yPercent: 10,
        ease: "none",
        scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true },
      });

      // ---------- headings, word by word ----------
      gsap.utils.toArray<HTMLElement>("[data-split]").forEach((title) => {
        const text = title.textContent?.trim();
        if (!text) return;

        title.textContent = "";
        text.split(/\s+/).forEach((word, i) => {
          const mask = document.createElement("span");
          mask.className = "split-word";
          const inner = document.createElement("span");
          inner.textContent = word;
          mask.appendChild(inner);
          if (i > 0) title.appendChild(document.createTextNode(" "));
          title.appendChild(mask);
        });

        // Take the words over from CSS explicitly: reading translateY(110%) out
        // of the computed style would leave GSAP with a pixel offset it never
        // clears, and the words would stay behind their mask forever.
        const words = title.querySelectorAll(".split-word > span");
        gsap.set(words, { yPercent: 110, y: 0 });
        gsap.to(words, {
          yPercent: 0,
          duration: 0.9,
          ease: "power4.out",
          stagger: 0.05,
          scrollTrigger: { trigger: title, start: "top 90%" },
        });
      });

      // ---------- generic reveal ----------
      // Grids marked [data-stagger] and the process strip run their own
      // sequenced timelines below, so they opt out here.
      gsap.utils
        .toArray<HTMLElement>(".reveal")
        .filter((el) => !el.closest("[data-stagger]") && !el.classList.contains("stage"))
        .forEach((el) => {
          gsap.to(el, {
            opacity: 1,
            y: 0,
            duration: 0.9,
            ease: "power3.out",
            scrollTrigger: { trigger: el, start: "top 88%" },
          });
        });

      // ---------- photos: curtain wipe + settle ----------
      gsap.utils.toArray<HTMLElement>("[data-reveal-img]").forEach((frame) => {
        const media = frame.querySelector(".photo-media");
        const trigger: ScrollTrigger.Vars = { trigger: frame, start: "top 90%" };

        gsap.fromTo(
          frame,
          { clipPath: "inset(0% 0% 100% 0%)" },
          { clipPath: "inset(0% 0% 0% 0%)", duration: 1.1, ease: "power3.inOut", scrollTrigger: trigger }
        );
        if (media) {
          gsap.fromTo(
            media,
            { scale: 1.22 },
            { scale: 1, duration: 1.5, ease: "power3.out", scrollTrigger: trigger }
          );
        }
      });

      // ---------- photos: parallax drift ----------
      gsap.utils.toArray<HTMLElement>("[data-parallax]").forEach((media) => {
        gsap.fromTo(
          media,
          { yPercent: -6 },
          {
            yPercent: 6,
            ease: "none",
            scrollTrigger: {
              trigger: media.closest(".photo") ?? media,
              start: "top bottom",
              end: "bottom top",
              scrub: true,
            },
          }
        );
      });

      // ---------- process strip ----------
      gsap.utils.toArray<HTMLElement>(".process-track").forEach((track) => {
        const line = track.querySelector(".process-line");
        const timeline = gsap.timeline({ scrollTrigger: { trigger: track, start: "top 80%" } });
        timeline.to(track.querySelectorAll(".stage.reveal"), {
          opacity: 1,
          y: 0,
          duration: 0.7,
          ease: "power3.out",
          stagger: 0.15,
        });
        if (line) timeline.to(line, { width: "100%", duration: 1.1, ease: "power2.inOut" }, "-=0.5");
      });

      // ---------- staggered grids (eventos mosaic, platos) ----------
      gsap.utils.toArray<HTMLElement>("[data-stagger]").forEach((grid) => {
        gsap.to(grid.querySelectorAll(".reveal"), {
          opacity: 1,
          y: 0,
          duration: 0.9,
          ease: "power3.out",
          stagger: 0.12,
          scrollTrigger: { trigger: grid, start: "top 82%" },
        });
      });

      // ---------- counting stats ----------
      gsap.utils.toArray<HTMLElement>("[data-count]").forEach((el) => {
        const target = Number(el.dataset.count ?? 0);
        const prefix = el.dataset.countPrefix ?? "";
        const value = { n: 0 };
        gsap.to(value, {
          n: target,
          duration: 1.4,
          ease: "power2.out",
          scrollTrigger: { trigger: el, start: "top 92%" },
          onUpdate: () => {
            el.textContent = prefix + Math.round(value.n);
          },
        });
      });

      // ---------- quote cards ----------
      gsap
        .timeline({ scrollTrigger: { trigger: ".quote-grid", start: "top 82%" } })
        .to(".quote-grid .quote", { opacity: 1, y: 0, duration: 0.8, ease: "power3.out", stagger: 0.15 });

      // ---------- photo marquee ----------
      gsap.utils.toArray<HTMLElement>("[data-marquee]").forEach((band) => {
        const reverse = band.dataset.marquee === "reverse";
        const loopWidth = band.scrollWidth / 2;
        if (!loopWidth) return;

        const loop = gsap.fromTo(
          band,
          { xPercent: reverse ? -50 : 0 },
          {
            xPercent: reverse ? 0 : -50,
            duration: loopWidth / 55,
            ease: "none",
            repeat: -1,
          }
        );

        // scrolling pushes the band along; it eases back to its own pace after
        let boost = 1;
        ScrollTrigger.create({
          trigger: band,
          start: "top bottom",
          end: "bottom top",
          onUpdate: (self) => {
            boost = gsap.utils.clamp(1, 5, 1 + Math.abs(self.getVelocity()) / 900);
          },
        });
        const settle = () => {
          boost += (1 - boost) * 0.04;
          loop.timeScale(boost);
        };
        gsap.ticker.add(settle);
        tickers.push(settle);
      });

      // ---------- huerta filmstrip: pinned horizontal scroll ----------
      mm.add("(min-width: 861px)", () => {
        const cleanups = gsap.utils.toArray<HTMLElement>("[data-hscroll]").map((section) => {
          const track = section.querySelector<HTMLElement>("[data-hscroll-track]");
          const viewport = track?.parentElement;
          if (!track || !viewport) return () => {};

          const distance = () => Math.max(0, track.scrollWidth - viewport.clientWidth);

          const tween = gsap.to(track, {
            x: () => -distance(),
            ease: "none",
            scrollTrigger: {
              trigger: section,
              start: "top top",
              end: () => `+=${distance() + window.innerHeight * 0.5}`,
              scrub: 0.6,
              pin: true,
              anticipatePin: 1,
              invalidateOnRefresh: true,
            },
          });

          return () => {
            tween.scrollTrigger?.kill();
            tween.kill();
            gsap.set(track, { x: 0 });
          };
        });

        return () => cleanups.forEach((fn) => fn());
      });
    });

    return () => {
      ctx.revert();
      mm.revert();
      window.removeEventListener("load", onLoad);
      tickers.forEach((fn) => gsap.ticker.remove(fn));
      gsap.ticker.remove(tick);
      lenis.destroy();
    };
  }, []);

  return null;
}
