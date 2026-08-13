"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const NAV_LINKS = [
  { href: "/restaurant", label: "Restaurant" },
  { href: "/#granja", label: "Granja" },
  { href: "/#huerta", label: "Huerta" },
  { href: "/#proveeduria", label: "Proveeduría" },
  { href: "/#eventos", label: "Eventos" },
  { href: "/#visita", label: "Visita" },
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
      <Link href="/" className="logo" onClick={close}>
        La Pebeta
      </Link>
      <nav className={`links${open ? " open" : ""}`}>
        {NAV_LINKS.map((link) => (
          <Link key={link.href} href={link.href} onClick={close}>
            {link.label}
          </Link>
        ))}
        <Link href="/reservas" className="cta" onClick={close}>
          Reservar
        </Link>
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
