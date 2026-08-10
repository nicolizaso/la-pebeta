"use client";

import { useEffect, useState } from "react";

const NAV_LINKS = [
  { href: "#restaurant", label: "Restaurant" },
  { href: "#granja", label: "Granja" },
  { href: "#proveeduria", label: "Proveeduría" },
  { href: "#visita", label: "Visita" },
];

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const close = () => setOpen(false);

  return (
    <header className={`site${scrolled ? " scrolled" : ""}`}>
      <a href="#" className="logo" onClick={close}>
        La Pebeta
      </a>
      <nav className={`links${open ? " open" : ""}`}>
        {NAV_LINKS.map((link) => (
          <a key={link.href} href={link.href} onClick={close}>
            {link.label}
          </a>
        ))}
        <a href="#visita" className="cta" onClick={close}>
          Reservar
        </a>
      </nav>
      <button
        className="nav-toggle"
        aria-label="Abrir menú"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        <span></span>
        <span></span>
        <span></span>
      </button>
    </header>
  );
}
