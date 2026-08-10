type LinkArrowProps = {
  href: string;
  children: React.ReactNode;
  className?: string;
};

export function LinkArrow({ href, children, className = "" }: LinkArrowProps) {
  return (
    <a href={href} className={["link-arrow reveal", className].filter(Boolean).join(" ")}>
      {children}
      <svg width="16" height="10" viewBox="0 0 16 10" fill="none" aria-hidden="true">
        <path d="M1 5H15M15 5L11 1M15 5L11 9" stroke="currentColor" strokeWidth="1.2" />
      </svg>
    </a>
  );
}
