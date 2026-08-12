import Image from "next/image";
import { PHOTO_MANIFEST, type PhotoKey } from "@/lib/photos";

type PhotoProps = {
  /** Key into the generated manifest, e.g. "granja/7". Omit for a duotone placeholder. */
  photo?: PhotoKey;
  alt?: string;
  variant?: "moss" | "clay";
  tag?: string;
  className?: string;
  /** Passed straight to next/image so the browser downloads the right size. */
  sizes?: string;
  priority?: boolean;
  /** Slow vertical drift while the photo crosses the viewport. */
  parallax?: boolean;
  /** Curtain wipe + settle when the photo first enters the viewport. */
  reveal?: boolean;
  /** object-position for crops that need a specific part of the frame. */
  position?: string;
  /** Adds a darker gradient so light text stays readable on top. */
  scrim?: boolean;
  /** Click to open full-screen (handled globally by <Lightbox />). */
  lightbox?: boolean;
  style?: React.CSSProperties;
  children?: React.ReactNode;
};

/**
 * The single image primitive for the site. Wraps next/image in the `.photo`
 * treatment from the prototype (duotone ground + grain + corner tag), and
 * exposes the hooks SiteAnimations looks for: `[data-parallax]`,
 * `[data-reveal-img]` and `[data-lightbox]`.
 *
 * Without a `photo` key it degrades to the original gradient placeholder.
 */
export function Photo({
  photo,
  alt = "",
  variant = "moss",
  tag,
  className = "",
  sizes = "100vw",
  priority = false,
  parallax = false,
  reveal = false,
  position,
  scrim = false,
  lightbox = false,
  style,
  children,
}: PhotoProps) {
  const asset = photo ? PHOTO_MANIFEST[photo] : undefined;

  const classes = [
    "photo",
    asset ? "has-img" : "",
    variant === "clay" && !asset ? "clay" : "",
    scrim ? "scrim" : "",
    parallax ? "has-parallax" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <figure className={classes} style={style} {...(reveal ? { "data-reveal-img": "" } : {})}>
      {asset && (
        <span className="photo-media" {...(parallax ? { "data-parallax": "" } : {})}>
          <Image
            src={asset.src}
            alt={alt}
            fill
            sizes={sizes}
            placeholder="blur"
            blurDataURL={asset.blurDataURL}
            priority={priority}
            style={position ? { objectPosition: position } : undefined}
          />
        </span>
      )}
      {tag && <figcaption className="tag">{tag}</figcaption>}
      {asset && lightbox && (
        <button
          type="button"
          className="photo-open"
          data-lightbox={asset.src}
          data-lightbox-caption={tag ?? alt}
          aria-label={alt ? `Ampliar foto: ${alt}` : "Ampliar foto"}
        />
      )}
      {children}
    </figure>
  );
}
