"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import gsap from "gsap";
import { PHOTO_MANIFEST, type PhotoAsset } from "@/lib/photos";

type Shot = { src: string; caption?: string };

const BY_SRC = new Map<string, PhotoAsset>(
  Object.values(PHOTO_MANIFEST).map((asset) => [asset.src, asset])
);

/**
 * Global full-screen viewer. Mounted once per page; it listens for clicks on
 * any `[data-lightbox]` button rendered by <Photo lightbox />, so galleries
 * don't need to wire anything up themselves.
 */
export function Lightbox() {
  const [shot, setShot] = useState<Shot | null>(null);
  const overlay = useRef<HTMLDivElement>(null);
  const lastTrigger = useRef<HTMLElement | null>(null);

  const close = useCallback(() => {
    const node = overlay.current;
    if (!node) {
      setShot(null);
      return;
    }
    gsap.to(node, {
      opacity: 0,
      duration: 0.28,
      ease: "power2.in",
      onComplete: () => setShot(null),
    });
  }, []);

  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      const trigger = (event.target as HTMLElement | null)?.closest<HTMLElement>("[data-lightbox]");
      if (!trigger) return;
      const src = trigger.dataset.lightbox;
      if (!src) return;
      lastTrigger.current = trigger;
      setShot({ src, caption: trigger.dataset.lightboxCaption || undefined });
    };

    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  useEffect(() => {
    if (!shot) {
      lastTrigger.current?.focus?.();
      return;
    }

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
    };
    document.addEventListener("keydown", onKey);

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const node = overlay.current;
    if (node) {
      gsap.fromTo(node, { opacity: 0 }, { opacity: 1, duration: 0.3, ease: "power2.out" });
      gsap.fromTo(
        node.querySelector(".lightbox-frame"),
        { scale: 0.92, y: 24 },
        { scale: 1, y: 0, duration: 0.6, ease: "power3.out" }
      );
    }

    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previousOverflow;
    };
  }, [shot, close]);

  if (!shot) return null;

  const asset = BY_SRC.get(shot.src);

  return (
    <div
      className="lightbox"
      ref={overlay}
      role="dialog"
      aria-modal="true"
      aria-label={shot.caption ?? "Foto ampliada"}
      onClick={close}
    >
      <button type="button" className="lightbox-close" onClick={close} aria-label="Cerrar">
        <span />
        <span />
      </button>
      <div className="lightbox-frame" onClick={(event) => event.stopPropagation()}>
        <Image
          src={shot.src}
          alt={shot.caption ?? ""}
          width={asset?.width ?? 1600}
          height={asset?.height ?? 1200}
          sizes="92vw"
          placeholder={asset ? "blur" : "empty"}
          blurDataURL={asset?.blurDataURL}
          className="lightbox-img"
        />
        {shot.caption && <p className="lightbox-caption">{shot.caption}</p>}
      </div>
    </div>
  );
}
