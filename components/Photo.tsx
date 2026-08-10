type PhotoProps = {
  variant?: "moss" | "clay";
  tag?: string;
  className?: string;
  children?: React.ReactNode;
};

/**
 * Duotone photo placeholder — no external image dependency.
 * Mirrors the `.photo` treatment from the prototype (gradient + grain + tag).
 */
export function Photo({ variant = "moss", tag, className = "", children }: PhotoProps) {
  const classes = ["photo", variant === "clay" ? "clay" : "", className].filter(Boolean).join(" ");

  return (
    <div className={classes}>
      {tag && <div className="tag">{tag}</div>}
      {children}
    </div>
  );
}
